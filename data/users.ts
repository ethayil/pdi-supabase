"use server";

import { cacheLife, cacheTag, revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import type { Member, User } from "@/app/generated/prisma/client";
import type {
  UserUpdateInput,
  UserWhereInput,
} from "@/app/generated/prisma/models";
import { auth } from "@/auth";
import { requireAdmin, requireGlobalAdmin } from "@/lib/auth/get-session";
import { cacheTags } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";
import { logActivity } from "./logging";

interface GetUsersArgs {
  orgId: string;
  currentPage?: number;
  entriesPerPage?: number;
  userType?: string;
}

export type UserWMember = User & {
  orgId: string;
  organizationName: string;
};

async function fetchUsersDbData({
  orgId,
  currentPage,
  entriesPerPage,
  userType,
}: {
  orgId?: string;
  currentPage: number;
  entriesPerPage: number;
  userType: string;
}) {
  "use cache";
  cacheLife("minutes");
  cacheTag(cacheTags.users);

  try {
    let whereClause: UserWhereInput = {};

    if (userType === "org") {
      whereClause = {
        members: {
          some: {
            organizationId: orgId,
          },
        },
      };
    } else if (userType === "unlinked") {
      whereClause = {
        members: {
          none: {},
        },
      };
    } else if (userType === "admin") {
      whereClause = {
        role: "admin",
      };
    }

    const skip = (currentPage - 1) * entriesPerPage;
    const take = entriesPerPage;

    const [totalCount, users] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        take: take,
        skip: skip,
        orderBy: { id: "asc" },
        include: {
          members: {
            include: {
              organization: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / entriesPerPage);

    const mappedUsers: UserWMember[] = users.map((u) => ({
      ...u,
      orgId: u.members?.[0]?.organizationId ?? "none",
      organizationName: u.members?.[0]?.organization?.name ?? "none",
    }));

    return {
      success: true,
      data: mappedUsers,
      totalPages,
      totalCount,
    };
  } catch (error) {
    console.error("Error in fetchUsersDbData:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch users from database");
  }
}

export async function getUsers({
  orgId,
  currentPage = 1,
  entriesPerPage = 20,
  userType = "org",
}: GetUsersArgs) {
  try {
    await requireGlobalAdmin();

    return await fetchUsersDbData({
      orgId,
      currentPage,
      entriesPerPage,
      userType,
    });
  } catch (error) {
    console.error("Database error in getUsers:", error);

    return {
      success: false,
      data: [],
      totalPages: 0,
      totalCount: 0,
      error: error instanceof Error ? error.message : "Internal Server Error",
    };
  }
}

export async function getUserById({ id }: { id: string }): Promise<{
  success: boolean;
  user: UserWMember | null;
  error?: string;
}> {
  try {
    await requireGlobalAdmin();

    const dbUser = await prisma.user.findUnique({
      where: { id },
      include: {
        members: {
          select: {
            organization: true,
            organizationId: true,
          },
        },
      },
    });

    if (!dbUser) {
      throw new Error("User Not Found");
    }

    return {
      success: true,
      user: {
        ...dbUser,
        orgId: dbUser.members?.[0]?.organizationId ?? "none",
        organizationName: dbUser.members?.[0]?.organization?.name ?? "none",
      },
    };
  } catch (error) {
    console.error("Database error in getUserById:", error);
    return {
      success: false,
      user: null,
      error: error instanceof Error ? error.message : "Internal Server Error",
    };
  }
}

export async function updateUser(data: {
  id: string;
  name?: string;
  role?: string;
  orgId?: string;
  image?: string | null;
  isActive?: boolean;
  emailVerified?: boolean;
}) {
  try {
    const user = await requireGlobalAdmin();

    const dbUser = await prisma.user.findUnique({
      where: { id: data.id },
      include: {
        members: {
          select: { organizationId: true },
        },
      },
    });
    if (!dbUser) {
      throw new Error("User not found");
    }

    // Update basic user info
    const updateData: UserUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.emailVerified !== undefined) {
      updateData.emailVerified = data.emailVerified;
    }
    if (data.isActive !== undefined) {
      updateData.banned = !data.isActive;
      updateData.banReason = !data.isActive
        ? "Deactivated by administrator"
        : null;
    }

    // Update user via Better Auth Admin API to ensure session caches are correctly updated/invalidated
    const updatedUser = await auth.api.adminUpdateUser({
      body: {
        userId: data.id,
        data: {
          name: data.name,
          role: data.role,
          image: data.image === null ? undefined : data.image,
          emailVerified: data.emailVerified,
          banned: data.isActive !== undefined ? !data.isActive : undefined,
          banReason:
            data.isActive === false
              ? "Deactivated by administrator"
              : undefined,
        },
      },
      headers: await headers(),
    });

    // Handle organization membership if orgId is explicitly provided
    if (data.orgId !== undefined) {
      // Remove from existing organizations
      await prisma.member.deleteMany({
        where: { userId: data.id },
      });

      // Assign to new organization if specified
      if (data.orgId !== "none") {
        await prisma.member.create({
          data: {
            id: crypto.randomUUID(),
            organizationId: data.orgId,
            userId: data.id,
            role: data.role || dbUser.role || "user",
            createdAt: new Date(),
          },
        });
      }

      // Update active organization on session
      const targetOrgId = data.orgId === "none" ? null : data.orgId;
      await prisma.session.updateMany({
        where: { userId: data.id },
        data: { activeOrganizationId: targetOrgId },
      });
    }

    // Log Activity
    const loggedOrgId =
      data.orgId !== undefined && data.orgId !== "none"
        ? data.orgId
        : dbUser.members?.[0]?.organizationId || null;

    await logActivity({
      orgId: loggedOrgId,
      userId: user.id,
      action: "update",
      entityType: "user",
      entityId: data.id,
      description: `Updated user "${dbUser.name || data.id}"`,
      changes: {
        name:
          data.name !== undefined
            ? { from: dbUser.name, to: data.name }
            : undefined,
        role:
          data.role !== undefined
            ? { from: dbUser.role, to: data.role }
            : undefined,
        orgId:
          data.orgId !== undefined
            ? {
                from: dbUser.members?.[0]?.organizationId ?? "none",
                to: data.orgId,
              }
            : undefined,
        isActive:
          data.isActive !== undefined
            ? { from: !dbUser.banned, to: data.isActive }
            : undefined,
      },
    });

    revalidatePath("/[orgId]/admin/users");
    updateTag(cacheTags.users);
    updateTag(cacheTags.organizations);

    return {
      success: true,
      user: updatedUser,
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to update user");
  }
}

async function fetchOrgUsersDbData({ orgId }: { orgId: string }) {
  "use cache";
  cacheLife("minutes");
  cacheTag(cacheTags.users);

  try {
    const members = await prisma.member.findMany({
      where: { organizationId: orgId },
      include: {
        user: true,
      },
    });

    return members.map((m) => ({
      ...m.user,
      role: m.user.role as
        | "user"
        | "orgAdmin"
        | "admin"
        | "warehouse"
        | null
        | undefined,
    }));
  } catch (error) {
    console.error("Error in fetchOrgUsersDbData:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch organization users from database");
  }
}

export async function getOrgUsers({ orgId }: { orgId: string }) {
  try {
    await requireAdmin();

    return await fetchOrgUsersDbData({ orgId });
  } catch (error) {
    console.error("Database error in getOrgUsers:", error);
    return [];
  }
}

export type MemberWOrder = Member & {
  user: User;
};

export async function getOrgMembersWithStats({ orgId }: { orgId: string }) {
  try {
    await requireAdmin();

    const members = await prisma.member.findMany({
      where: { organizationId: orgId },
      include: {
        user: true,
      },
    });

    return members;
  } catch (error) {
    console.error("Database error in getOrgMembersWithStats:", error);
    return [];
  }
}

export async function revalidateUsersCache() {
  updateTag(cacheTags.users);
  revalidatePath("/[orgId]/admin/users", "layout");
}

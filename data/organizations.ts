"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { headers } from "next/headers";
import type {
  OrganizationCreateInput,
  OrganizationWhereInput,
} from "@/app/generated/prisma/models";
import { auth, type Organization } from "@/auth";
import { requireSuperAdmin, requireUser } from "@/lib/auth/get-session";
import { cacheTags } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";
import { logActivity } from "./logging";

interface GetOrganizationsArgs {
  currentPage?: number;
  entriesPerPage?: number;
  isActive?: boolean;
  query?: string;
}

async function fetchOrganizationsDbData({
  userRole,
  userId,
  currentPage,
  entriesPerPage,
  isActive,
  query,
}: {
  userRole: string;
  userId: string;
  currentPage: number;
  entriesPerPage: number;
  isActive: boolean;
  query?: string;
}) {
  let totalCount = 0;
  let organizations: any[] = [];

  if (userRole === "superAdmin") {
    const whereClause: OrganizationWhereInput = {
      isActive: isActive ? true : undefined,
      ...(query
        ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
          ],
        }
        : {}),
    };

    const [count, orgs] = await Promise.all([
      prisma.organization.count({
        where: whereClause,
      }),
      prisma.organization.findMany({
        where: whereClause,
        take: entriesPerPage,
        skip: (currentPage - 1) * entriesPerPage,
        orderBy: { id: "asc" },
      }),
    ]);
    totalCount = count;
    organizations = orgs;
  } else {
    const members = await prisma.member.findMany({
      where: {
        userId: userId,
        organization: {
          isActive: isActive ? true : undefined,
          ...(query
            ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { slug: { contains: query, mode: "insensitive" } },
              ],
            }
            : {}),
        },
      },
      include: { organization: true },
    });
    organizations = members.map((m) => m.organization);
    totalCount = organizations.length;
    organizations = organizations.slice(
      (currentPage - 1) * entriesPerPage,
      currentPage * entriesPerPage,
    );
  }

  const totalPages = Math.ceil(totalCount / entriesPerPage);

  const mappedOrganizations = organizations.map((org) => ({
    ...org,
    settings: {
      primaryColor: org.primaryColor ?? "#0056D2",
      secondaryColor: org.secondaryColor ?? null,
      fontFamily: org.fontFamily ?? "",
      welcomeMessage: org.welcomeMessage ?? "",
      lowStockThreshold: org.lowStockThreshold ?? 50,
    },
  }));

  return {
    success: true,
    data: mappedOrganizations,
    totalPages,
    totalCount,
  };
}

const getCachedOrganizationsDbData = unstable_cache(
  async (
    userRole: string,
    userId: string,
    currentPage: number,
    entriesPerPage: number,
    isActive: boolean,
    query?: string,
  ) =>
    fetchOrganizationsDbData({
      userRole,
      userId,
      currentPage,
      entriesPerPage,
      isActive,
      query,
    }),
  ["organizations-list-cache"],
  {
    revalidate: 20, // Cache for 20 seconds
    tags: [cacheTags.organizations],
  },
);

export async function getOrganizations({
  currentPage = 1,
  entriesPerPage = 20,
  isActive = true,
  query,
}: GetOrganizationsArgs = {}) {
  try {
    const user = await requireUser();

    return getCachedOrganizationsDbData(
      user.role ?? "",
      user.id,
      currentPage,
      entriesPerPage,
      isActive,
      query,
    );
  } catch (error) {
    console.error("Database error in getOrganizations:", error);

    return {
      success: false,
      data: [],
      nextCursor: undefined,
      totalPages: 0,
      totalCount: 0,
      error: error instanceof Error ? error.message : "Internal Server Error",
    };
  }
}

export async function getOrganizationById({ id }: { id: string }) {
  try {
    await requireSuperAdmin();

    const organization = await prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new Error("Organization Not Found");
    }

    return {
      success: true,
      organization: {
        ...organization,
        settings: {
          primaryColor: organization.primaryColor ?? "#0056D2",
          secondaryColor: organization.secondaryColor ?? null,
          fontFamily: organization.fontFamily ?? "",
          welcomeMessage: organization.welcomeMessage ?? "",
          lowStockThreshold: organization.lowStockThreshold ?? 50,
        },
      },
    };
  } catch (error) {
    console.error("Database error in getOrganization:", error);

    return {
      success: false,
      organization: null,
    };
  }
}

export type CreateOrgData = OrganizationCreateInput;

export async function createOrganization(
  data: Omit<Organization, "id" | "slug" | "createdAt">,
) {
  try {
    const user = await requireSuperAdmin();

    const slug = data.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const org = await auth.api.createOrganization({
      headers: await headers(),
      body: {
        ...data,
        slug,
        enableInventory: data.enableInventory ?? true,
        enableInvoices: data.enableInvoices ?? true,
        isActive: data.isActive ?? true,
        primaryColor: data.primaryColor ?? "#0056D2",
        lowStockThreshold: data.lowStockThreshold ?? 50,
      },
    });

    if (!org) {
      throw new Error("Failed to create organization");
    }

    await logActivity({
      orgId: org.id,
      userId: user.id,
      action: "create",
      entityType: "organization",
      entityId: org.id,
      description: `Created organization "${data.name}"`,
    });

    revalidateTag(cacheTags.organizations, "");
    return org.id;
  } catch (error) {
    console.error("Error in createOrganization:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to create organization");
  }
}

export async function updateOrganization(
  data: Omit<Organization, "slug" | "createdAt">,
) {
  try {
    const user = await requireSuperAdmin();

    const { id, name, ...rest } = data;
    const slug = name
      ? name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
      : undefined;

    const existingOrg = await prisma.organization.findUnique({
      where: { id },
    });
    if (!existingOrg) {
      throw new Error("Organization not found");
    }

    const updated = await auth.api.superAdminUpdateOrganization({
      headers: await headers(),
      body: {
        organizationId: id,
        data: {
          ...rest,
          ...(name ? { name, slug } : {}),
        },
      },
    });

    if (!updated) {
      throw new Error("Failed to update organization");
    }

    await logActivity({
      orgId: id,
      userId: user.id,
      action: "update",
      entityType: "organization",
      entityId: id,
      description: `Updated organization "${name || existingOrg.name}"`,
      changes: {
        name: name !== undefined
          ? { from: existingOrg.name, to: name }
          : undefined,
        isActive: data.isActive !== undefined
          ? { from: existingOrg.isActive, to: data.isActive }
          : undefined,
        prefix: data.prefix !== undefined
          ? { from: existingOrg.prefix, to: data.prefix }
          : undefined,
      },
    });

    revalidatePath("/[orgId]/admin/orgs");
    revalidateTag(cacheTags.organizations, "");

    return { success: true };
  } catch (error) {
    console.error("Error in updateOrganization:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to update organization");
  }
}

export async function deleteOrganization({ id }: { id: string }) {
  try {
    const user = await requireSuperAdmin();

    const deleted = await auth.api.superAdminDeleteOrganization({
      headers: await headers(),
      body: {
        organizationId: id,
      },
    });

    if (!deleted) {
      throw new Error("Failed to delete organization");
    }

    await logActivity({
      orgId: id,
      userId: user.id,
      action: "delete",
      entityType: "organization",
      entityId: id,
      description: `Deleted organization "${deleted.organization.name}"`,
    });

    revalidateTag(cacheTags.organizations, "");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteOrganization:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to delete organization");
  }
}

"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import type { Organization as PrismaOrganization } from "@/app/generated/prisma/client";
import type {
  OrganizationCreateInput,
  OrganizationWhereInput,
} from "@/app/generated/prisma/models";
import type { Organization } from "@/auth";
import { requireGlobalAdmin, requireUser } from "@/lib/auth/get-session";
import { cacheTags } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";
import { logActivity } from "./logging";

export interface OrganizationSettings {
  primaryColor: string;
  secondaryColor: string | null;
  fontFamily: string;
  welcomeMessage: string;
  lowStockThreshold: number;
}

export type MappedOrganization = PrismaOrganization & {
  settings: OrganizationSettings;
};

interface GetOrganizationsArgs {
  currentPage?: number;
  entriesPerPage?: number;
  isActive?: boolean;
  query?: string;
  bypassCache?: boolean;
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
}): Promise<{
  success: boolean;
  data: PrismaOrganization[];
  totalPages: number;
  totalCount: number;
}> {
  try {
    const where: OrganizationWhereInput = {
      isActive: isActive ? true : undefined,
    };

    if (userRole !== "admin") {
      where.members = {
        some: {
          userId: userId,
        },
      };
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
      ];
    }

    const [totalCount, organizations] = await Promise.all([
      prisma.organization.count({ where }),
      prisma.organization.findMany({
        where,
        take: entriesPerPage,
        skip: (currentPage - 1) * entriesPerPage,
        orderBy: { id: "asc" },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / entriesPerPage);

    return {
      success: true,
      data: organizations,
      totalPages,
      totalCount,
    };
  } catch (error) {
    console.error("Error in fetchOrganizationsDbData:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch organizations from database");
  }
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
    revalidate: 3600, // Cache for 1 hour
    tags: [cacheTags.organizations],
  },
);

export async function getOrganizations({
  currentPage = 1,
  entriesPerPage = 20,
  isActive = true,
  query,
  bypassCache = false,
}: GetOrganizationsArgs = {}): Promise<{
  success: boolean;
  data: PrismaOrganization[];
  totalPages: number;
  totalCount: number;
  error?: string;
}> {
  try {
    const user = await requireUser();

    if (bypassCache) {
      return fetchOrganizationsDbData({
        userRole: user.role ?? "",
        userId: user.id,
        currentPage,
        entriesPerPage,
        isActive,
        query,
      });
    }

    return await getCachedOrganizationsDbData(
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
      totalPages: 0,
      totalCount: 0,
      error: error instanceof Error ? error.message : "Internal Server Error",
    };
  }
}

export async function getOrganizationById({ id }: { id: string }) {
  try {
    await requireGlobalAdmin();

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
  data: Partial<Organization> & { name: string },
) {
  try {
    const user = await requireGlobalAdmin();

    const slug = data.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const id = crypto.randomUUID();
    const org = await prisma.organization.create({
      data: {
        id,
        name: data.name,
        slug,
        logo: data.logo,
        prefix: data.prefix,
        vat: data.vat,
        isActive: data.isActive ?? true,
        supportEmail: data.supportEmail ?? [],
        supportPhone: data.supportPhone ?? [],
        address: data.address,
        address1: data.address1,
        address2: data.address2,
        town: data.town,
        city: data.city,
        postcode: data.postcode,
        country: data.country,
        primaryColor: data.primaryColor ?? "#0056D2",
        secondaryColor: data.secondaryColor,
        fontFamily: data.fontFamily,
        welcomeMessage: data.welcomeMessage,
        lowStockThreshold: data.lowStockThreshold ?? 50,
        description: data.description,
        enableInvoices: data.enableInvoices ?? true,
        enableInventory: data.enableInventory ?? true,
        createdAt: new Date(),
      },
    });

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
  data: Partial<Organization> & { id: string },
) {
  try {
    const user = await requireGlobalAdmin();

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

    const updated = await prisma.organization.update({
      where: { id },
      data: {
        ...rest,
        ...(name ? { name, slug } : {}),
      },
    });

    await logActivity({
      orgId: id,
      userId: user.id,
      action: "update",
      entityType: "organization",
      entityId: id,
      description: `Updated organization "${name || existingOrg.name}"`,
      changes: {
        name:
          name !== undefined ? { from: existingOrg.name, to: name } : undefined,
        isActive:
          data.isActive !== undefined
            ? { from: existingOrg.isActive, to: data.isActive }
            : undefined,
        prefix:
          data.prefix !== undefined
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
    const user = await requireGlobalAdmin();

    const deleted = await prisma.organization.delete({
      where: { id },
    });

    await logActivity({
      orgId: id,
      userId: user.id,
      action: "delete",
      entityType: "organization",
      entityId: id,
      description: `Deleted organization "${deleted.name}"`,
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

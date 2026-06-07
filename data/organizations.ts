"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type {
  OrganizationCreateInput,
  OrganizationWhereInput,
} from "@/app/generated/prisma/models";
import { auth } from "@/auth";
import { getSession } from "@/lib/get-session";
import prisma from "@/lib/prisma";
import { logActivity } from "./logging";

interface GetOrganizationsArgs {
  currentPage?: number;
  entriesPerPage?: number;
  isActive?: boolean;
  query?: string;
}

export async function getOrganizations({
  currentPage = 1,
  entriesPerPage = 20,
  isActive = true,
  query,
}: GetOrganizationsArgs = {}) {
  try {
    const { user } = await getSession();
    if (!user) {
      throw new Error("Unauthorized: Access Denied");
    }

    let totalCount = 0;
    let organizations = [];

    if (user.role === "superAdmin") {
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

      // Optimization: Run the count and data fetch concurrently
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
      // Regular user / Org Admin can only see their own organizations
      const members = await prisma.member.findMany({
        where: {
          userId: user.id,
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
      // In-memory pagination for member organizations
      organizations = organizations.slice(
        (currentPage - 1) * entriesPerPage,
        currentPage * entriesPerPage,
      );
    }

    // Calculate Total Pages
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
    const { user } = await getSession();
    if (!user) {
      throw new Error("Unauthorized: Access Denied");
    }

    if (user.role !== "superAdmin") {
      throw new Error("Forbidden: Insufficient Permissions");
    }

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

export type CreateOrgData = Omit<
  OrganizationCreateInput,
  "id" | "slug" | "createdAt" | "metadata"
> & {
  id?: string;
  slug?: string;
  createdAt?: Date | string;
};

export type UpdateOrgData = Partial<CreateOrgData> & {
  id: string;
};

export async function createOrganization(data: CreateOrgData) {
  try {
    const { user } = await getSession();
    if (!user) {
      throw new Error("Unauthorized: Access Denied");
    }

    if (user.role !== "superAdmin") {
      throw new Error("Forbidden: Insufficient Permissions");
    }

    const slug =
      data.slug ||
      data.name
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
        prefix: data.prefix ?? "",
        description: data.description ?? "",
        enableInventory: data.enableInventory ?? true,
        enableInvoices: data.enableInvoices ?? true,
        updatedAt: data.updatedAt as Date | undefined,
        isActive: data.isActive ?? true,
        address1: data.address1 ?? "",
        address2: data.address2 ?? "",
        city: data.city ?? "",
        town: data.town ?? "",
        postcode: data.postcode ?? "",
        country: data.country ?? "",
        fontFamily: data.fontFamily ?? "",
        primaryColor: data.primaryColor ?? "#0056D2",
        secondaryColor: data.secondaryColor ?? "",
        lowStockThreshold: data.lowStockThreshold ?? 50,
        welcomeMessage: data.welcomeMessage ?? "",
        supportEmail: data.supportEmail as string[] | undefined,
        supportPhone: data.supportPhone as string[] | undefined,
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

    return org.id;
  } catch (error) {
    console.error("Error in createOrganization:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to create organization");
  }
}

export async function updateOrganization(data: UpdateOrgData) {
  try {
    const { user } = await getSession();
    if (!user) {
      throw new Error("Unauthorized: Access Denied");
    }

    if (user.role !== "superAdmin") {
      throw new Error("Forbidden: Insufficient Permissions");
    }

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

    const updated = await auth.api.updateOrganization({
      headers: await headers(),
      body: {
        organizationId: id,
        data: {
          ...rest,
          ...(name ? { name, slug } : {}),
          prefix: data.prefix ?? "",
          description: data.description ?? "",
          enableInventory: data.enableInventory ?? true,
          enableInvoices: data.enableInvoices ?? true,
          updatedAt: data.updatedAt as Date | undefined,
          isActive: data.isActive ?? true,
          address1: data.address1 ?? "",
          address2: data.address2 ?? "",
          city: data.city ?? "",
          town: data.town ?? "",
          postcode: data.postcode ?? "",
          country: data.country ?? "",
          fontFamily: data.fontFamily ?? "",
          primaryColor: data.primaryColor ?? "#0056D2",
          secondaryColor: data.secondaryColor ?? "",
          lowStockThreshold: data.lowStockThreshold ?? 50,
          welcomeMessage: data.welcomeMessage ?? "",
          supportEmail: rest.supportEmail as string[] | undefined,
          supportPhone: rest.supportPhone as string[] | undefined,
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

    revalidatePath("[orgId]/admin/orgs");

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
    const { user } = await getSession();
    if (!user) {
      throw new Error("Unauthorized: Access Denied");
    }

    if (user.role !== "superAdmin") {
      throw new Error("Forbidden: Insufficient Permissions");
    }

    const existingOrg = await prisma.organization.findUnique({
      where: { id },
    });
    if (!existingOrg) {
      throw new Error("Organization not found");
    }

    const deleted = await auth.api.deleteOrganization({
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
      description: `Deleted organization "${existingOrg.name}"`,
    });

    return { success: true };
  } catch (error) {
    console.error("Error in deleteOrganization:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to delete organization");
  }
}

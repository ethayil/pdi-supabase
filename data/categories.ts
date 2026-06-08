"use server";

import { revalidatePath } from "next/cache";
import type { CategoryWhereInput } from "@/app/generated/prisma/models";
import { getSession } from "@/lib/auth/get-session";
import prisma from "@/lib/prisma";
import { logActivity } from "./logging";

interface GetCategoriesArgs {
  orgId?: string;
  currentPage?: number;
  entriesPerPage?: number;
  query?: string;
}

export async function getCategories({
  orgId,
  currentPage = 1,
  entriesPerPage = 20,
  query,
}: GetCategoriesArgs = {}) {
  try {
    const { user } = await getSession();
    if (!user) {
      throw new Error("Unauthorized: Access Denied");
    }

    if (!orgId || orgId === "all") {
      return {
        success: true,
        data: [],
        totalPages: 0,
        totalCount: 0,
      };
    }

    const whereClause: CategoryWhereInput = { orgId };

    if (query) {
      whereClause.name = {
        contains: query,
        mode: "insensitive",
      };
    }

    const skip = (currentPage - 1) * entriesPerPage;
    const take = entriesPerPage;

    const [totalCount, categories] = await Promise.all([
      prisma.category.count({ where: whereClause }),
      prisma.category.findMany({
        where: whereClause,
        skip: skip,
        take: take,
        orderBy: { name: "asc" },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / entriesPerPage);

    return {
      success: true,
      data: categories,
      totalPages,
      totalCount,
    };
  } catch (error) {
    console.error("Database error in getCategories:", error);
    return {
      success: false,
      data: [],
      totalPages: 0,
      totalCount: 0,
      error: error instanceof Error ? error.message : "Internal Server Error",
    };
  }
}

export async function getCategoryById({ id }: { id: string }) {
  try {
    if (!id) return null;

    const { user } = await getSession();
    if (!user) {
      throw new Error("Unauthorized: Access Denied");
    }

    const category = await prisma.category.findUnique({
      where: { id },
    });

    return category;
  } catch (error) {
    console.error("Database error in getCategoryById:", error);
    return null;
  }
}

export async function createCategory(values: {
  name: string;
  orgId: string;
  isActive?: boolean;
}) {
  try {
    const { user } = await getSession();
    if (!user) {
      throw new Error("Unauthorized: Access Denied");
    }
    const userId = user.id;

    // Check organization exists
    const org = await prisma.organization.findUnique({
      where: { id: values.orgId },
    });
    if (!org) {
      throw new Error("Organization not found");
    }

    // Check duplicate name in the same org
    const existing = await prisma.category.findFirst({
      where: {
        orgId: values.orgId,
        name: {
          equals: values.name,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      throw new Error("Category name already in use");
    }

    const category = await prisma.category.create({
      data: {
        name: values.name,
        orgId: values.orgId,
        isActive: values.isActive ?? true,
      },
    });

    await logActivity({
      orgId: values.orgId,
      userId,
      action: "create",
      entityType: "category",
      entityId: category.id,
      description: `Created category "${values.name}"`,
    });

    revalidatePath(`/${values.orgId}/admin/categories`);

    return { success: true, category };
  } catch (error) {
    console.error("Error in createCategory:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to create category");
  }
}

export async function updateCategory(values: {
  id: string;
  orgId: string;
  name: string;
  isActive?: boolean;
}) {
  try {
    const { user } = await getSession();
    if (!user) {
      throw new Error("Unauthorized: Access Denied");
    }
    const userId = user.id;

    // Check organization exists
    const org = await prisma.organization.findUnique({
      where: { id: values.orgId },
    });
    if (!org) {
      throw new Error("Organization not found");
    }

    // Check duplicate name in the same org
    const existing = await prisma.category.findFirst({
      where: {
        orgId: values.orgId,
        name: {
          equals: values.name,
          mode: "insensitive",
        },
      },
    });

    if (existing && existing.id !== values.id) {
      throw new Error("Category name already in use");
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id: values.id },
    });
    if (!existingCategory) {
      throw new Error("Category not found");
    }

    const category = await prisma.category.update({
      where: { id: values.id },
      data: {
        name: values.name,
        isActive: values.isActive ?? existingCategory.isActive,
      },
    });

    await logActivity({
      orgId: values.orgId,
      userId,
      action: "update",
      entityType: "category",
      entityId: values.id,
      description: `Updated category "${values.name}"`,
      changes: {
        name: { from: existingCategory.name, to: values.name },
        isActive: { from: existingCategory.isActive, to: values.isActive },
      },
    });

    revalidatePath(`/${values.orgId}/admin/categories`);

    return { success: true, category };
  } catch (error) {
    console.error("Error in updateCategory:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to update category");
  }
}

export async function deleteCategory({ id }: { id: string }) {
  try {
    const { user } = await getSession();
    if (!user) {
      throw new Error("Unauthorized: Access Denied");
    }
    const userId = user.id;

    const category = await prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new Error("Category not found");
    }

    await prisma.category.delete({
      where: { id },
    });

    await logActivity({
      orgId: category.orgId,
      userId,
      action: "delete",
      entityType: "category",
      entityId: id,
      description: `Deleted category "${category.name}"`,
    });

    if (category.orgId) {
      revalidatePath(`/${category.orgId}/admin/categories`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to delete category");
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin, requireUser } from "@/lib/auth/get-session";
import prisma from "@/lib/prisma";
import { logActivity, logProductMovement } from "./logging";

interface GetProductsArgs {
  orgId?: string;
  currentPage?: number;
  entriesPerPage?: number;
  categoryId?: string;
  search?: string;
  stockStatus?: string; // "all" | "active" | "inactive" | "out_of_stock" | "low_stock"
}

export async function getProducts({
  orgId,
  currentPage = 1,
  entriesPerPage = 20,
  categoryId,
  search,
  stockStatus = "all",
}: GetProductsArgs = {}) {
  try {
    const user = await requireUser();

    if (!orgId || orgId === "all") {
      return {
        success: true,
        data: [],
        totalPages: 0,
        totalCount: 0,
        lowStockThreshold: 50,
      };
    }

    // Fetch organization settings for threshold
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { lowStockThreshold: true },
    });
    const lowStockThreshold = org?.lowStockThreshold ?? 50;

    const where: any = { orgId };

    // Stock status mapping to isActive and quantity ranges
    if (stockStatus === "active") {
      where.isActive = true;
    } else if (stockStatus === "inactive") {
      where.isActive = false;
    } else if (stockStatus === "out_of_stock") {
      where.isActive = true;
      where.quantity = 0;
    } else if (stockStatus === "low_stock") {
      where.isActive = true;
      where.quantity = {
        gt: 0,
        lte: lowStockThreshold,
      };
    }

    // Category filter
    if (categoryId && categoryId !== "all") {
      where.categoryId = categoryId;
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (currentPage - 1) * entriesPerPage;
    const take = entriesPerPage;

    const [totalCount, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { name: "asc" },
        include: {
          category: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / entriesPerPage);

    return {
      success: true,
      data: products,
      totalPages,
      totalCount,
      lowStockThreshold,
    };
  } catch (error) {
    console.error("Database error in getProducts:", error);
    return {
      success: false,
      data: [],
      totalPages: 0,
      totalCount: 0,
      lowStockThreshold: 50,
      error: error instanceof Error ? error.message : "Internal Server Error",
    };
  }
}

export async function getProductById({ id }: { id: string }) {
  try {
    if (!id) return null;

    const user = await requireSuperAdmin();

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    return product;
  } catch (error) {
    console.error("Database error in getProductById:", error);
    return null;
  }
}

export async function createProduct(values: {
  orgId: string;
  categoryId: string;
  sku: string;
  name: string;
  description?: string;
  weight: number;
  quantity: number;
  imgUrl?: string;
  isActive: boolean;
}) {
  try {
    const user = await requireSuperAdmin();
    const userId = user.id;

    // Check organization exists
    const org = await prisma.organization.findUnique({
      where: { id: values.orgId },
    });
    if (!org) {
      throw new Error("Organization not found");
    }

    // Check duplicate SKU in the same org
    const existing = await prisma.product.findFirst({
      where: {
        orgId: values.orgId,
        sku: {
          equals: values.sku,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      throw new Error("SKU already exists in this organization");
    }

    const product = await prisma.product.create({
      data: {
        orgId: values.orgId,
        categoryId: values.categoryId,
        createdById: userId,
        sku: values.sku,
        name: values.name,
        description: values.description || null,
        weight: values.weight,
        quantity: values.quantity,
        imgUrl: values.imgUrl || null,
        isActive: values.isActive,
      },
    });

    // Log activity and initial movement
    await logActivity({
      orgId: values.orgId,
      userId,
      action: "create",
      entityType: "product",
      entityId: product.id,
      description: `Created product "${values.name}" (SKU: ${values.sku})`,
    });

    await logProductMovement({
      orgId: values.orgId,
      productId: product.id,
      userId,
      movementType: "initial",
      quantityChange: values.quantity,
      quantityBefore: 0,
      quantityAfter: values.quantity,
      reason: "Initial stock on product creation",
    });

    revalidatePath(`/${values.orgId}/admin/products`);

    return { success: true, product };
  } catch (error) {
    console.error("Error in createProduct:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to create product");
  }
}

export async function updateProduct(values: {
  id: string;
  orgId: string;
  categoryId: string;
  sku: string;
  name: string;
  description?: string;
  weight: number;
  quantity: number;
  imgUrl?: string;
  isActive: boolean;
}) {
  try {
    const user = await requireSuperAdmin();
    const userId = user.id;

    // Check organization exists
    const org = await prisma.organization.findUnique({
      where: { id: values.orgId },
    });
    if (!org) {
      throw new Error("Organization not found");
    }

    // Check duplicate SKU in the same org
    const existing = await prisma.product.findFirst({
      where: {
        orgId: values.orgId,
        sku: {
          equals: values.sku,
          mode: "insensitive",
        },
      },
    });

    if (existing && existing.id !== values.id) {
      throw new Error("SKU already exists in this organization");
    }

    // Get existing product for comparison
    const existingProduct = await prisma.product.findUnique({
      where: { id: values.id },
    });
    if (!existingProduct) {
      throw new Error("Product not found");
    }

    const previousQuantity = existingProduct.quantity;

    const product = await prisma.product.update({
      where: { id: values.id },
      data: {
        categoryId: values.categoryId,
        sku: values.sku,
        name: values.name,
        description: values.description || null,
        weight: values.weight,
        quantity: values.quantity,
        imgUrl: values.imgUrl || null,
        isActive: values.isActive,
      },
    });

    // Log activity
    await logActivity({
      orgId: values.orgId,
      userId,
      action: "update",
      entityType: "product",
      entityId: values.id,
      description: `Updated product "${values.name}" (SKU: ${values.sku})`,
      changes: {
        sku: { from: existingProduct.sku, to: values.sku },
        name: { from: existingProduct.name, to: values.name },
        quantity: { from: previousQuantity, to: values.quantity },
        isActive: { from: existingProduct.isActive, to: values.isActive },
      },
    });

    // Log product movement if quantity changed
    if (previousQuantity !== values.quantity) {
      await logProductMovement({
        orgId: values.orgId,
        productId: values.id,
        userId,
        movementType: "adjustment",
        quantityChange: values.quantity - previousQuantity,
        quantityBefore: previousQuantity,
        quantityAfter: values.quantity,
        reason: "Manual stock adjustment",
      });
    }

    revalidatePath(`/${values.orgId}/admin/products`);

    return { success: true, product };
  } catch (error) {
    console.error("Error in updateProduct:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to update product");
  }
}

export async function deleteProduct({ id }: { id: string }) {
  try {
    const user = await requireSuperAdmin();
    const userId = user.id;

    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      throw new Error("Product not found");
    }

    await prisma.product.delete({
      where: { id },
    });

    // Log activity
    await logActivity({
      orgId: product.orgId,
      userId,
      action: "delete",
      entityType: "product",
      entityId: id,
      description: `Deleted product "${product.name}" (SKU: ${product.sku})`,
    });

    revalidatePath(`/${product.orgId}/admin/products`);

    return { success: true };
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to delete product");
  }
}

export async function bulkCreateProducts({
  orgId,
  rows,
}: {
  orgId: string;
  rows: {
    sku: string;
    name: string;
    categoryName: string;
    weight: number;
    quantity: number;
    description?: string;
    imgUrl?: string;
    isActive: boolean;
  }[];
}) {
  try {
    const user = await requireSuperAdmin();
    const userId = user.id;

    const results = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      try {
        if (!row.sku) {
          throw new Error("SKU is required");
        }
        if (!row.name) {
          throw new Error("Name is required");
        }

        // Find or create category
        let categoryId = null;
        if (row.categoryName) {
          let category = await prisma.category.findFirst({
            where: {
              orgId,
              name: { equals: row.categoryName, mode: "insensitive" },
            },
          });
          if (!category) {
            category = await prisma.category.create({
              data: {
                orgId,
                name: row.categoryName,
                isActive: true,
              },
            });
          }
          categoryId = category.id;
        }

        if (!categoryId) {
          throw new Error("Category name is required to create a product");
        }

        // Check if SKU exists
        const existing = await prisma.product.findFirst({
          where: {
            orgId,
            sku: { equals: row.sku, mode: "insensitive" },
          },
        });

        if (existing) {
          throw new Error("SKU already exists");
        }

        const product = await prisma.product.create({
          data: {
            orgId,
            categoryId,
            createdById: userId,
            sku: row.sku,
            name: row.name,
            description: row.description || null,
            weight: row.weight,
            quantity: row.quantity,
            imgUrl: row.imgUrl || null,
            isActive: row.isActive,
          },
        });

        // Log activity and initial movement
        await logActivity({
          orgId,
          userId,
          action: "create",
          entityType: "product",
          entityId: product.id,
          description: `Bulk Created product "${row.name}" (SKU: ${row.sku})`,
        });

        await logProductMovement({
          orgId,
          productId: product.id,
          userId,
          movementType: "initial",
          quantityChange: row.quantity,
          quantityBefore: 0,
          quantityAfter: row.quantity,
          reason: "Initial stock via bulk import",
        });

        results.push({
          row: rowNum,
          sku: row.sku,
          success: true,
        });
      } catch (err) {
        results.push({
          row: rowNum,
          sku: row.sku,
          success: false,
          error:
            err instanceof Error ? err.message : "Failed to create product",
        });
      }
    }

    revalidatePath(`/${orgId}/admin/products`);

    return results;
  } catch (error) {
    console.error("Error in bulkCreateProducts:", error);
    throw error;
  }
}

export async function bulkUpdateProducts({
  orgId,
  rows,
}: {
  orgId: string;
  rows: {
    sku: string;
    name?: string;
    categoryName?: string;
    weight?: number;
    quantity?: number;
    description?: string;
    imgUrl?: string;
    isActive?: boolean;
  }[];
}) {
  try {
    const user = await requireSuperAdmin();
    const userId = user.id;

    const results = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      try {
        if (!row.sku) {
          throw new Error("SKU is required");
        }

        // Find existing product
        const existingProduct = await prisma.product.findFirst({
          where: {
            orgId,
            sku: { equals: row.sku, mode: "insensitive" },
          },
        });

        if (!existingProduct) {
          throw new Error("Product with SKU not found");
        }

        // Find or create category if provided
        let categoryId = undefined;
        if (row.categoryName) {
          let category = await prisma.category.findFirst({
            where: {
              orgId,
              name: { equals: row.categoryName, mode: "insensitive" },
            },
          });
          if (!category) {
            category = await prisma.category.create({
              data: {
                orgId,
                name: row.categoryName,
                isActive: true,
              },
            });
          }
          categoryId = category.id;
        }

        const updateData: any = {};
        if (row.name !== undefined) updateData.name = row.name;
        if (categoryId !== undefined) updateData.categoryId = categoryId;
        if (row.weight !== undefined) updateData.weight = row.weight;
        if (row.quantity !== undefined) updateData.quantity = row.quantity;
        if (row.description !== undefined)
          updateData.description = row.description;
        if (row.imgUrl !== undefined) updateData.imgUrl = row.imgUrl;
        if (row.isActive !== undefined) updateData.isActive = row.isActive;

        const previousQuantity = existingProduct.quantity;

        const product = await prisma.product.update({
          where: { id: existingProduct.id },
          data: updateData,
        });

        // Log activity
        await logActivity({
          orgId,
          userId,
          action: "update",
          entityType: "product",
          entityId: existingProduct.id,
          description: `Bulk Updated product "${product.name}" (SKU: ${product.sku})`,
        });

        // Log movement if quantity changed
        if (row.quantity !== undefined && previousQuantity !== row.quantity) {
          await logProductMovement({
            orgId,
            productId: existingProduct.id,
            userId,
            movementType: "adjustment",
            quantityChange: row.quantity - previousQuantity,
            quantityBefore: previousQuantity,
            quantityAfter: row.quantity,
            reason: "Bulk stock adjustment",
          });
        }

        results.push({
          row: rowNum,
          sku: row.sku,
          success: true,
        });
      } catch (err) {
        results.push({
          row: rowNum,
          sku: row.sku,
          success: false,
          error:
            err instanceof Error ? err.message : "Failed to update product",
        });
      }
    }

    revalidatePath(`/${orgId}/admin/products`);

    return results;
  } catch (error) {
    console.error("Error in bulkUpdateProducts:", error);
    throw error;
  }
}

export async function getAvailableProducts({ orgId }: { orgId: string }) {
  try {
    const user = await requireSuperAdmin();

    const products = await prisma.product.findMany({
      where: {
        orgId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        imgUrl: true,
        quantity: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return products;
  } catch (error) {
    console.error("Database error in getAvailableProducts:", error);
    return [];
  }
}

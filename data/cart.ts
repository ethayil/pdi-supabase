"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/get-session";
import prisma from "@/lib/prisma";

export async function getCartItems({ orgId }: { orgId: string }) {
  try {
    const { user } = await getSession();
    if (!user) return [];

    const items = await prisma.cartItem.findMany({
      where: {
        userId: user.id,
        orgId,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    return items;
  } catch (error) {
    console.error("Error getting cart items:", error);
    return [];
  }
}

export async function addToCart({
  orgId,
  productId,
  quantity,
}: {
  orgId: string;
  productId: string;
  quantity: number;
}) {
  try {
    const { user } = await getSession();
    if (!user) throw new Error("Unauthorized");

    // Check if product exists and has enough stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");

    // Check existing item in cart
    const existing = await prisma.cartItem.findFirst({
      where: {
        userId: user.id,
        orgId,
        productId,
      },
    });

    const newQuantity = (existing?.quantity ?? 0) + quantity;
    if (newQuantity > product.quantity) {
      throw new Error(
        `Cannot add more than ${product.quantity} items of this product`,
      );
    }

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId: user.id,
          orgId,
          productId,
          quantity,
        },
      });
    }

    revalidatePath(`/${orgId}/products`);
    return { success: true };
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
}

export async function updateCartQuantity({
  id,
  quantity,
}: {
  id: string;
  quantity: number;
}) {
  try {
    const { user } = await getSession();
    if (!user) throw new Error("Unauthorized");

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!cartItem) throw new Error("Cart item not found");

    if (quantity > cartItem.product.quantity) {
      throw new Error(
        `Only ${cartItem.product.quantity} items available in stock`,
      );
    }

    await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    revalidatePath(`/${cartItem.orgId}/products`);
    return { success: true };
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    throw error;
  }
}

export async function removeFromCart({ id }: { id: string }) {
  try {
    const { user } = await getSession();
    if (!user) throw new Error("Unauthorized");

    const deleted = await prisma.cartItem.delete({
      where: { id },
    });

    revalidatePath(`/${deleted.orgId}/products`);
    return { success: true };
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
}

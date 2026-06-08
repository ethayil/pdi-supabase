"use server";

import { revalidatePath } from "next/cache";
import type {
  BannerCreateInput,
  BannerUpdateInput,
} from "@/app/generated/prisma/models";
import { getSession } from "@/lib/auth/get-session";
import prisma from "@/lib/prisma";

export async function createBanner(
  data: Omit<BannerCreateInput, "id" | "createdBy">,
) {
  try {
    const { user } = await getSession();
    if (!user) {
      throw new Error("Unauthorized: Access Denied");
    }

    const isAdmin = user.role === "superAdmin" || user.role === "orgAdmin";
    if (!isAdmin) {
      throw new Error("Forbidden: Insufficient Permissions");
    }

    const banner = await prisma.banner.create({
      data: { ...data, createdById: user.id },
    });

    revalidatePath("/", "layout");
    return banner;
  } catch (error) {
    console.error("Failed to create banner:", error);
    throw error;
  }
}

export async function removeBanner({ id }: { id: string }) {
  try {
    const { user } = await getSession();
    if (!user) {
      throw new Error("Unauthorized: Access Denied");
    }

    const isAdmin = user.role === "superAdmin" || user.role === "orgAdmin";
    if (!isAdmin) {
      throw new Error("Forbidden: Insufficient Permissions");
    }

    await prisma.banner.delete({
      where: { id },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to remove banner:", error);
    throw error;
  }
}

export async function toggleBannerActive({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  try {
    const { user } = await getSession();
    if (!user) {
      throw new Error("Unauthorized: Access Denied");
    }

    const isAdmin = user.role === "superAdmin" || user.role === "orgAdmin";
    if (!isAdmin) {
      throw new Error("Forbidden: Insufficient Permissions");
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        isActive,
      },
    });

    revalidatePath("/", "layout");
    return banner;
  } catch (error) {
    console.error("Failed to toggle banner active state:", error);
    throw error;
  }
}

export async function updateBanner(id: string, data: BannerUpdateInput) {
  try {
    const { user } = await getSession();
    if (!user) {
      throw new Error("Unauthorized: Access Denied");
    }

    const isAdmin = user.role === "superAdmin" || user.role === "orgAdmin";
    if (!isAdmin) {
      throw new Error("Forbidden: Insufficient Permissions");
    }

    const banner = await prisma.banner.update({
      where: { id },
      data,
    });

    revalidatePath("/", "layout");
    return banner;
  } catch (error) {
    console.error("Failed to update banner:", error);
    throw error;
  }
}

export async function getVisibleBanners({ orgId }: { orgId?: string } = {}) {
  try {
    const sessionResult = await getSession().catch(() => ({ user: null }));
    const user = sessionResult?.user;
    const userId = user?.id;
    const now = new Date();

    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      orderBy: { updatedAt: "desc" },
    });

    return banners.filter((b) => {
      if (b.targetType === "all") return true;

      if (!userId) return false;

      if (b.targetType === "user" && b.targetId === userId) return true;
      if (b.targetType === "organization" && b.targetId === orgId) return true;

      return false;
    });
  } catch (error) {
    console.error("Failed to get visible banners:", error);
    return [];
  }
}

export async function listAllBanners() {
  try {
    const { user } = await getSession();
    if (!user) {
      throw new Error("Unauthorized: Access Denied");
    }

    const isAdmin = user.role === "superAdmin" || user.role === "orgAdmin";
    if (!isAdmin) {
      throw new Error("Forbidden: Insufficient Permissions");
    }

    return await prisma.banner.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to list all banners:", error);
    return [];
  }
}

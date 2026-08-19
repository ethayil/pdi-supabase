"use server";

import { cacheLife, cacheTag, revalidatePath, updateTag } from "next/cache";
import type {
  BannerCreateInput,
  BannerUpdateInput,
} from "@/app/generated/prisma/models";
import { requireGlobalAdmin, requireUser } from "@/lib/auth/get-session";
import { cacheTags } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";

export async function createBanner(
  data: Omit<BannerCreateInput, "id" | "createdBy">,
) {
  try {
    const user = await requireGlobalAdmin();

    const banner = await prisma.banner.create({
      data: { ...data, createdById: user.id },
    });

    revalidatePath("/", "layout");
    updateTag(cacheTags.banners);
    return banner;
  } catch (error) {
    console.error("Failed to create banner:", error);
    throw error;
  }
}

export async function removeBanner({ id }: { id: string }) {
  try {
    await requireGlobalAdmin();

    await prisma.banner.delete({
      where: { id },
    });

    revalidatePath("/", "layout");
    updateTag(cacheTags.banners);
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
    await requireGlobalAdmin();

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        isActive,
      },
    });

    revalidatePath("/", "layout");
    updateTag(cacheTags.banners);
    return banner;
  } catch (error) {
    console.error("Failed to toggle banner active state:", error);
    throw error;
  }
}

export async function updateBanner(id: string, data: BannerUpdateInput) {
  try {
    await requireGlobalAdmin();

    const banner = await prisma.banner.update({
      where: { id },
      data,
    });

    revalidatePath("/", "layout");
    updateTag(cacheTags.banners);
    return banner;
  } catch (error) {
    console.error("Failed to update banner:", error);
    throw error;
  }
}

async function fetchBannersDbData(isActive?: boolean) {
  "use cache";
  cacheLife("minutes");
  cacheTag(cacheTags.banners);

  try {
    return await prisma.banner.findMany({
      where: isActive !== undefined ? { isActive } : undefined,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error in fetchBannersDbData:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch banners from database");
  }
}

export async function getVisibleBanners({ orgId }: { orgId?: string } = {}) {
  try {
    const user = await requireUser();
    const userId = user.id;
    const now = new Date();

    const activeBanners = await fetchBannersDbData(true);

    return activeBanners.filter((b) => {
      // Expiration check
      if (b.expiresAt && b.expiresAt <= now) return false;

      if (b.targetType === "all") return true;

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
    await requireGlobalAdmin();

    return await fetchBannersDbData();
  } catch (error) {
    console.error("Failed to list all banners:", error);
    return [];
  }
}

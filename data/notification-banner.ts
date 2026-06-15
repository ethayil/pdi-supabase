"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import type {
  BannerCreateInput,
  BannerUpdateInput,
} from "@/app/generated/prisma/models";
import { getSession, requireGlobalAdmin } from "@/lib/auth/get-session";
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
    revalidateTag(cacheTags.banners, "");
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
    revalidateTag(cacheTags.banners, "");
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
    revalidateTag(cacheTags.banners, "");
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
    revalidateTag(cacheTags.banners, "");
    return banner;
  } catch (error) {
    console.error("Failed to update banner:", error);
    throw error;
  }
}

async function fetchActiveBannersDbData() {
  return prisma.banner.findMany({
    where: {
      isActive: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

const getCachedActiveBannersDbData = unstable_cache(
  async () => fetchActiveBannersDbData(),
  ["active-banners-cache"],
  {
    revalidate: 60, // Cache active banners for 1 minute
    tags: [cacheTags.banners],
  },
);

export async function getVisibleBanners({ orgId }: { orgId?: string } = {}) {
  try {
    const sessionResult = await getSession().catch(() => ({ user: null }));
    const user = sessionResult?.user;
    const userId = user?.id;
    const now = new Date();

    const activeBanners = await getCachedActiveBannersDbData();

    return activeBanners.filter((b) => {
      // Expiration check
      if (b.expiresAt && b.expiresAt <= now) return false;

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

async function fetchAllBannersDbData() {
  return prisma.banner.findMany({
    orderBy: { createdAt: "desc" },
  });
}

const getCachedAllBannersDbData = unstable_cache(
  async () => fetchAllBannersDbData(),
  ["all-banners-cache"],
  {
    revalidate: 60, // Cache for 1 minute
    tags: [cacheTags.banners],
  }
);

export async function listAllBanners() {
  try {
    await requireGlobalAdmin();

    return await getCachedAllBannersDbData();
  } catch (error) {
    console.error("Failed to list all banners:", error);
    return [];
  }
}

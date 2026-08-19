"use server";

import { cacheLife, cacheTag, revalidatePath, updateTag } from "next/cache";
import { requireUser } from "@/lib/auth/get-session";
import { cacheTags } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";
import { logActivity } from "./logging";

async function fetchAddressesDbData({
  orgId,
  userId,
}: {
  orgId: string;
  userId: string;
}) {
  "use cache";
  cacheLife("minutes");
  cacheTag(cacheTags.addresses);

  try {
    return await prisma.address.findMany({
      where: {
        orgId,
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error in fetchAddressesDbData:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch addresses from database");
  }
}

export async function getAddresses({ orgId }: { orgId: string }) {
  try {
    const user = await requireUser();

    return await fetchAddressesDbData({ orgId, userId: user.id });
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return [];
  }
}

export async function createAddress(args: {
  orgId: string;
  fullname: string;
  company?: string;
  address1: string;
  address2?: string;
  town: string;
  city?: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}) {
  try {
    const user = await requireUser();

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        orgId: args.orgId,
        fullname: args.fullname,
        company: args.company || null,
        address1: args.address1,
        address2: args.address2 || null,
        town: args.town,
        city: args.city || null,
        postcode: args.postcode,
        country: args.country,
        email: args.email,
        phone: args.phone,
      },
    });

    await logActivity({
      orgId: args.orgId,
      userId: user.id,
      action: "create",
      entityType: "address",
      entityId: address.id,
      description: `Created new address for ${args.fullname}`,
    });

    revalidatePath(`/${args.orgId}/checkout`);
    updateTag(cacheTags.addresses);

    return address.id;
  } catch (error) {
    console.error("Error creating address:", error);
    throw error;
  }
}

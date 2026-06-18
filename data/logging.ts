"use server";

import { unstable_cache } from "next/cache";
import type {
  ActivityAction,
  MovementType,
} from "@/app/generated/prisma/client";
import type { ActivityLogWhereInput } from "@/app/generated/prisma/models";
import { getSession, requireGlobalAdmin } from "@/lib/auth/get-session";
import { cacheTags } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";

interface GetLogsArgs {
  orgId?: string;
  currentPage?: number;
  entriesPerPage?: number;
  userSearch?: string;
  messageSearch?: string;
  entityType?: string;
  startDate?: number;
  endDate?: number;
}

export type ActivityChanges = Record<
  string,
  { from: any; to: any } | undefined
>;

export async function logActivity(params: {
  orgId?: string | null;
  userId?: string;
  systemSource?: string;
  action: "create" | "update" | "delete";
  entityType: string;
  entityId: string;
  description: string;
  changes?: ActivityChanges;
}) {
  try {
    const { user } = await getSession();
    const userId = params.userId || user?.id;

    const log = await prisma.activityLog.create({
      data: {
        orgId: params.orgId || null,
        userId: userId || null,
        systemSource: params.systemSource || null,
        action: params.action as ActivityAction,
        entityType: params.entityType,
        entityId: params.entityId,
        description: params.description,
        changes: params.changes ? (params.changes) : undefined,
      },
    });
    return log.id;
  } catch (error) {
    console.error("Failed to log activity:", error);
    return null;
  }
}

export async function logProductMovement(params: {
  orgId: string;
  productId: string;
  userId?: string;
  systemSource?: string;
  movementType: "initial" | "adjustment" | "sale" | "return";
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  reason?: string;
  relatedOrderId?: string;
}) {
  try {
    const { user } = await getSession();
    const userId = params.userId || user?.id;

    const movement = await prisma.productMovement.create({
      data: {
        orgId: params.orgId,
        productId: params.productId,
        userId: userId || null,
        systemSource: params.systemSource || null,
        movementType: params.movementType as MovementType,
        quantityChange: params.quantityChange,
        quantityBefore: params.quantityBefore,
        quantityAfter: params.quantityAfter,
        reason: params.reason || null,
        relatedOrderId: params.relatedOrderId || null,
      },
    });
    return movement.id;
  } catch (error) {
    console.error("Failed to log product movement:", error);
    return null;
  }
}

async function fetchLogsDbData({
  orgId,
  currentPage,
  entriesPerPage,
  userSearch,
  messageSearch,
  entityType,
  startDate,
  endDate,
}: {
  orgId?: string;
  currentPage: number;
  entriesPerPage: number;
  userSearch?: string;
  messageSearch?: string;
  entityType?: string;
  startDate?: number;
  endDate?: number;
}) {
  try {
    const where: ActivityLogWhereInput = {};
    if (orgId && orgId !== "all") where.orgId = orgId;
    if (entityType && entityType !== "all") where.entityType = entityType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (messageSearch) {
      where.description = {
        contains: messageSearch,
        mode: "insensitive",
      };
    }
    if (userSearch) {
      where.user = {
        OR: [
          { name: { contains: userSearch, mode: "insensitive" } },
          { email: { contains: userSearch, mode: "insensitive" } },
        ],
      };
    }

    const skip = (currentPage - 1) * entriesPerPage;
    const take = entriesPerPage;

    const [totalCount, logs] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true },
          },
          organization: {
            select: { name: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / entriesPerPage);

    const mappedLogs = logs.map((log) => ({
      ...log,
      userName: log.user?.name ?? (log.systemSource ? "System" : "Unknown User"),
      userEmail: log.user?.email ??
        (log.systemSource ? `Source: ${log.systemSource}` : "Unknown Email"),
      orgName: log.organization?.name ?? "System",
    }));

    return {
      success: true,
      data: mappedLogs,
      totalPages,
      totalCount,
    };
  } catch (error) {
    console.error("Error in fetchLogsDbData:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch logs from database");
  }
}

const getCachedLogsDbData = unstable_cache(
  async (
    orgId: string | undefined,
    currentPage: number,
    entriesPerPage: number,
    userSearch?: string,
    messageSearch?: string,
    entityType?: string,
    startDate?: number,
    endDate?: number,
  ) =>
    fetchLogsDbData({
      orgId,
      currentPage,
      entriesPerPage,
      userSearch,
      messageSearch,
      entityType,
      startDate,
      endDate,
    }),
  ["activity-logs-cache"],
  {
    revalidate: 10, // Cache for 10 seconds
    tags: [cacheTags.logs],
  },
);

export async function getLogs({
  orgId,
  currentPage = 1,
  entriesPerPage = 20,
  userSearch,
  messageSearch,
  entityType,
  startDate,
  endDate,
}: GetLogsArgs = {}) {
  try {
    await requireGlobalAdmin();

    return await getCachedLogsDbData(
      orgId,
      currentPage,
      entriesPerPage,
      userSearch,
      messageSearch,
      entityType,
      startDate,
      endDate,
    );
  } catch (error) {
    console.error("Failed to get logs:", error);
    return {
      success: false,
      data: [],
      totalPages: 0,
      totalCount: 0,
      error: error instanceof Error ? error.message : "Internal Server Error",
    };
  }
}

async function fetchProductMovementsDbData(
  { productId }: { productId: string },
) {
  try {
    const movements = await prisma.productMovement.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return {
      success: true,
      data: movements.map((m) => ({
        ...m,
        userName: m.user?.name ?? null,
        userEmail: m.user?.email ?? null,
      })),
      error: undefined as string | undefined,
    };
  } catch (error) {
    console.error("Error in fetchProductMovementsDbData:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch product movements from database");
  }
}

const getCachedProductMovementsDbData = unstable_cache(
  async (productId: string) => fetchProductMovementsDbData({ productId }),
  ["product-movements-cache"],
  {
    revalidate: 10, // Cache for 10 seconds
    tags: [cacheTags.logs],
  },
);

export async function getProductMovements({
  productId,
}: {
  productId: string;
}) {
  try {
    await requireGlobalAdmin();
    return await getCachedProductMovementsDbData(productId);
  } catch (error) {
    console.error("Failed to get product movements:", error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "Internal Server Error",
    };
  }
}

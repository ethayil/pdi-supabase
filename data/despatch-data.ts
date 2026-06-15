"use server";

import { unstable_cache } from "next/cache";
import type { Order, User } from "@/app/generated/prisma/client";
import { requireGlobalAdmin } from "@/lib/auth/get-session";
import { cacheTags } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";

export type DespatchOrder = Order & { user: User | null };

export interface DespatchOrdersResponse {
  success: boolean;
  data: DespatchOrder[];
  totalPages: number;
  totalCount: number;
  counts: {
    overdue: number;
    due_today: number;
    due_soon: number;
    upcoming: number;
    all: number;
  };
  error?: string;
}

async function fetchDespatchOrdersDbData(
  orgId?: string,
  currentPage: number = 1,
  entriesPerPage: number = 20,
  urgency: "all" | "overdue" | "due_today" | "due_soon" | "upcoming" = "all"
): Promise<DespatchOrdersResponse> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const endOf5Days = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000);

  const baseWhere: any = {
    status: "processing",
  };

  if (orgId && orgId !== "all") {
    baseWhere.orgId = orgId;
  }

  const overdueWhere = {
    ...baseWhere,
    sendDate: {
      lt: today,
    },
  };

  const dueTodayWhere = {
    ...baseWhere,
    sendDate: {
      gte: today,
      lt: tomorrow,
    },
  };

  const dueSoonWhere = {
    ...baseWhere,
    sendDate: {
      gte: tomorrow,
      lt: endOf5Days,
    },
  };

  const upcomingWhere = {
    ...baseWhere,
    OR: [
      {
        sendDate: {
          gte: endOf5Days,
        },
      },
      {
        sendDate: null,
      },
    ],
  };

  let activeWhere = baseWhere;
  if (urgency === "overdue") activeWhere = overdueWhere;
  else if (urgency === "due_today") activeWhere = dueTodayWhere;
  else if (urgency === "due_soon") activeWhere = dueSoonWhere;
  else if (urgency === "upcoming") activeWhere = upcomingWhere;

  const skip = (currentPage - 1) * entriesPerPage;
  const take = entriesPerPage;

  const [
    totalCount,
    overdueCount,
    dueTodayCount,
    dueSoonCount,
    upcomingCount,
    allCount,
    orders,
  ] = await Promise.all([
    prisma.order.count({ where: activeWhere }),
    prisma.order.count({ where: overdueWhere }),
    prisma.order.count({ where: dueTodayWhere }),
    prisma.order.count({ where: dueSoonWhere }),
    prisma.order.count({ where: upcomingWhere }),
    prisma.order.count({ where: baseWhere }),
    prisma.order.findMany({
      where: activeWhere,
      skip,
      take,
      orderBy: [{ sendDate: "asc" }, { createdAt: "asc" }],
      include: {
        user: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / entriesPerPage);

  return {
    success: true,
    data: orders,
    totalPages,
    totalCount,
    counts: {
      overdue: overdueCount,
      due_today: dueTodayCount,
      due_soon: dueSoonCount,
      upcoming: upcomingCount,
      all: allCount,
    },
  };
}

const getCachedDespatchOrders = unstable_cache(
  async (orgId?: string, currentPage?: number, entriesPerPage?: number, urgency?: any) =>
    fetchDespatchOrdersDbData(orgId, currentPage, entriesPerPage, urgency),
  ["despatch-orders-cache"],
  {
    revalidate: 20,
    tags: [cacheTags.adminOrders],
  },
);

export async function getDespatchOrders({
  orgId,
  currentPage = 1,
  entriesPerPage = 20,
  urgency = "all",
}: {
  orgId?: string;
  currentPage?: number;
  entriesPerPage?: number;
  urgency?: "all" | "overdue" | "due_today" | "due_soon" | "upcoming";
} = {}) {
  try {
    await requireGlobalAdmin();
    return getCachedDespatchOrders(orgId, currentPage, entriesPerPage, urgency);
  } catch (error) {
    console.error("Error in getDespatchOrders:", error);
    return {
      success: false,
      data: [],
      totalPages: 0,
      totalCount: 0,
      counts: {
        overdue: 0,
        due_today: 0,
        due_soon: 0,
        upcoming: 0,
        all: 0,
      },
    };
  }
}

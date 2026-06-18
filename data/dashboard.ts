"use server";

import { unstable_cache } from "next/cache";
import type { OrderStatus } from "@/app/generated/prisma/enums";
import { getSession } from "@/lib/auth/get-session";
import { cacheTags } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";

export type DashboardOrder = {
  id: string;
  reference: string;
  fullname: string;
  status: OrderStatus;
  deliveryDate: Date;
};

async function fetchDashboardDbData({
  orgId,
  userId,
  role,
}: {
  orgId: string;
  userId: string;
  role: "globalAdmin" | "admin" | "user";
}) {
  try {
    const isAdmin = role === "admin" || role === "globalAdmin";
    const isGlobalAdmin = role === "globalAdmin";

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { enableInvoices: true, lowStockThreshold: true },
    });

    const lowStockThreshold = org?.lowStockThreshold ?? 50;

    // 1. Fetch user-specific metrics if standard user
    if (!isAdmin) {
      const ordersCount = await prisma.order.count({
        where: { orgId, userId },
      });

      const orders = await prisma.order.findMany({
        where: { orgId, userId },
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      const recentOrders = orders.map((o) => ({
        id: o.id,
        reference: o.reference,
        fullname: o.fullname,
        status: o.status,
        deliveryDate: o.deliveryDate,
      }));

      return {
        role,
        ordersCount,
        recentOrders,
        statusBreakdown: null,
        invoiceSummary: null,
        orgOrdersTotal: null,
        lowStockCount: null,
        lowStockThreshold,
        lowStockProducts: null,
        outOfStockProducts: null,
      };
    }

    // 2. Fetch admin / superadmin metrics
    const statusBreakdown: Record<string, number> = {
      pending: 0,
      processing: 0,
      shipped: 0,
      on_the_way: 0,
      delay: 0,
      exception: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
      collected: 0,
    };

    const statusGroup = await prisma.order.groupBy({
      by: ["status"],
      where: { orgId },
      _count: { status: true },
    });

    for (const g of statusGroup) {
      if (g.status && g.status in statusBreakdown) {
        statusBreakdown[g.status] = g._count.status;
      }
    }

    let invoiceSummary = null;
    if (org?.enableInvoices) {
      const invoices = await prisma.invoice.findMany({
        where: { orgId },
        select: { status: true, totalCost: true },
      });

      let draft = 0;
      let sent = 0;
      let overdue = 0;
      let outstandingTotal = 0;

      for (const inv of invoices) {
        if (inv.status === "draft") {
          draft++;
        } else if (inv.status === "sent") {
          sent++;
          outstandingTotal += inv.totalCost;
        } else if (inv.status === "overdue") {
          overdue++;
          outstandingTotal += inv.totalCost;
        }
      }

      invoiceSummary = { draft, sent, overdue, outstandingTotal };
    }

    const orders = await prisma.order.findMany({
      where: { orgId },
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        reference: true,
        fullname: true,
        status: true,
        deliveryDate: true,
      },
    });

    const recentOrders = orders.map((o) => ({
      id: o.id,
      reference: o.reference,
      fullname: o.fullname,
      status: o.status,
      deliveryDate: o.deliveryDate,
    }));

    const [lowStockProductsDb, outOfStockProductsDb, lowStockCount] =
      await Promise.all([
        prisma.product.findMany({
          where: {
            orgId,
            isActive: true,
            quantity: {
              gt: 0,
              lte: lowStockThreshold,
            },
          },
          take: 5,
          orderBy: { quantity: "asc" },
          select: { id: true, name: true, sku: true, quantity: true },
        }),
        prisma.product.findMany({
          where: {
            orgId,
            isActive: true,
            quantity: 0,
          },
          take: 5,
          orderBy: { name: "asc" },
          select: { id: true, name: true, sku: true },
        }),
        prisma.product.count({
          where: {
            orgId,
            isActive: true,
            quantity: {
              gt: 0,
              lte: lowStockThreshold,
            },
          },
        }),
      ]);

    const lowStockProducts = lowStockProductsDb.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      quantity: p.quantity,
    }));

    const outOfStockProducts = outOfStockProductsDb.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
    }));

    let orgOrdersTotal: string | number = 0;
    if (isGlobalAdmin) {
      const allOrgsOrdersCount = await prisma.order.count();
      const thisOrgOrdersCount = await prisma.order.count({ where: { orgId } });
      orgOrdersTotal = `${allOrgsOrdersCount} — ${thisOrgOrdersCount}`;
    } else {
      orgOrdersTotal = await prisma.order.count({ where: { orgId } });
    }

    return {
      role,
      ordersCount: null,
      recentOrders,
      statusBreakdown,
      invoiceSummary,
      orgOrdersTotal,
      lowStockCount,
      lowStockThreshold,
      lowStockProducts,
      outOfStockProducts,
    };
  } catch (error) {
    console.error("Error in fetchDashboardDbData:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch dashboard data from database");
  }
}

const getCachedDbData = unstable_cache(
  async (
    orgId: string,
    userId: string,
    role: "globalAdmin" | "admin" | "user",
  ) => fetchDashboardDbData({ orgId, userId, role }),
  ["dashboard-db-data"],
  {
    revalidate: 120, // Cache for 120 seconds (2 minutes)
    tags: [cacheTags.dashboard],
  },
);

export async function getDashboardData({ orgId }: { orgId: string }) {
  try {
    const { user } = await getSession();
    if (!user) {
      return null;
    }

    const role = user.role === "admin"
      ? "globalAdmin"
      : user.role === "orgAdmin"
      ? "admin"
      : "user";

    // Call the cached database query, scoped automatically by Next.js per parameters
    return await getCachedDbData(orgId, user.id, role);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return null;
  }
}

export type DashboardOrderType = Awaited<ReturnType<typeof getDashboardData>>;

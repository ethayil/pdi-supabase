"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import type { InvoiceCharge, Order } from "@/app/generated/prisma/client";
import type { TransactionClient } from "@/app/generated/prisma/internal/prismaNamespace";
import type { InvoiceWhereInput } from "@/app/generated/prisma/models";
import { requireGlobalAdmin } from "@/lib/auth/get-session";
import { cacheTags } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";
import type { InvoiceStatus } from "@/types/globals";

export type InvoiceWCharges = InvoiceCharge & {
  order: Order | null;
};

async function generateInvoiceReference(
  tx: TransactionClient,
): Promise<string> {
  const counter = await tx.systemCounter.findUnique({
    where: { counterName: "invoice" },
  });

  let nextNumber: number;

  if (!counter) {
    nextNumber = 1;
    await tx.systemCounter.create({
      data: {
        counterName: "invoice",
        currentValue: nextNumber,
      },
    });
  } else {
    nextNumber = counter.currentValue + 1;
    await tx.systemCounter.update({
      where: { id: counter.id },
      data: {
        currentValue: nextNumber,
      },
    });
  }

  return `INV-${String(nextNumber).padStart(5, "0")}`;
}

async function calculateAndWriteInvoiceTotals(
  tx: TransactionClient,
  invoiceId: string,
) {
  let subtotalCost = 0;
  let vatCost = 0;
  let totalWeight = 0;
  let totalPackages = 0;

  // 1. Calculate from orders
  const orders = await tx.order.findMany({
    where: { invoiceId },
  });

  for (const order of orders) {
    if (order.invoiceCost !== null && order.invoiceCost !== undefined) {
      subtotalCost += order.invoiceCost;
    } else {
      if (order.courierCost) subtotalCost += order.courierCost;
      if (order.courierVAT) vatCost += order.courierVAT;
    }
    if (order.weight) totalWeight += order.weight;
    if (order.totalPackages) totalPackages += order.totalPackages;
  }

  // 2. Calculate from charges
  const charges = await tx.invoiceCharge.findMany({
    where: { invoiceId },
  });

  for (const charge of charges) {
    subtotalCost += charge.cost;
    vatCost += charge.vat;
  }

  const totalCost = subtotalCost + vatCost;

  // 3. Update invoice
  await tx.invoice.update({
    where: { id: invoiceId },
    data: {
      subtotalCost,
      vatCost,
      totalCost,
      totalWeight,
      totalPackages: totalPackages || orders.length,
    },
  });
}

async function fetchPaginatedInvoicesDbData({
  orgId,
  status,
  dateFrom,
  dateTo,
  currentPage,
  pageSize,
}: {
  orgId: string;
  status?: string;
  dateFrom?: number;
  dateTo?: number;
  currentPage: number;
  pageSize: number;
}) {
  const where: InvoiceWhereInput = { orgId };
  if (status && status !== "all") {
    where.status = status as InvoiceStatus;
  }
  if (dateFrom || dateTo) {
    where.invoiceDate = {};
    if (dateFrom) where.invoiceDate.gte = new Date(dateFrom);
    if (dateTo) where.invoiceDate.lte = new Date(dateTo);
  }

  const skip = (currentPage - 1) * pageSize;

  const invoices = await prisma.invoice.findMany({
    where,
    skip,
    take: pageSize,
    orderBy: { createdAt: "desc" },
    include: {
      orders: {
        select: { id: true },
      },
    },
  });

  return invoices.map((invoice) => ({
    ...invoice,
    orderCount: invoice.orders.length,
  }));
}

const getCachedPaginatedInvoicesDbData = unstable_cache(
  async (
    orgId: string,
    status: string | undefined,
    dateFrom: number | undefined,
    dateTo: number | undefined,
    currentPage: number,
    pageSize: number,
  ) =>
    fetchPaginatedInvoicesDbData({
      orgId,
      status,
      dateFrom,
      dateTo,
      currentPage,
      pageSize,
    }),
  ["invoices-list-cache"],
  {
    revalidate: 20, // Cache for 20 seconds
    tags: [cacheTags.invoices],
  },
);

export async function getPaginatedInvoices({
  orgId,
  status,
  dateFrom,
  dateTo,
  currentPage,
  pageSize,
}: {
  orgId: string;
  status?: string;
  dateFrom?: number;
  dateTo?: number;
  currentPage: number;
  pageSize: number;
}) {
  try {
    await requireGlobalAdmin();
    return getCachedPaginatedInvoicesDbData(
      orgId,
      status,
      dateFrom,
      dateTo,
      currentPage,
      pageSize,
    );
  } catch (error) {
    console.error("Database error in getPaginatedInvoices:", error);
    return [];
  }
}

export async function getInvoiceCount({
  orgId,
  status,
  dateFrom,
  dateTo,
}: {
  orgId: string;
  status?: string;
  dateFrom?: number;
  dateTo?: number;
}) {
  await requireGlobalAdmin();
  const where: InvoiceWhereInput = { orgId };
  if (status && status !== "all") {
    where.status = status as InvoiceStatus;
  }
  if (dateFrom || dateTo) {
    where.invoiceDate = {};
    if (dateFrom) where.invoiceDate.gte = new Date(dateFrom);
    if (dateTo) where.invoiceDate.lte = new Date(dateTo);
  }

  return await prisma.invoice.count({ where });
}

async function fetchInvoiceDetailsDbData({ invoiceId }: { invoiceId: string }) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      orders: {
        include: {
          items: {
            include: { product: true },
          },
        },
      },
      charges: {
        include: { order: true },
      },
    },
  });

  if (!invoice) return null;

  return {
    invoice,
    orders: invoice.orders,
    charges: invoice.charges,
  };
}

const getCachedInvoiceDetailsDbData = unstable_cache(
  async (invoiceId: string) => fetchInvoiceDetailsDbData({ invoiceId }),
  ["invoice-details-cache"],
  {
    revalidate: 20, // Cache for 20 seconds
    tags: [cacheTags.invoices],
  },
);

export async function getInvoiceDetails({ invoiceId }: { invoiceId: string }) {
  try {
    await requireGlobalAdmin();
    return getCachedInvoiceDetailsDbData(invoiceId);
  } catch (error) {
    console.error("Database error in getInvoiceDetails:", error);
    return null;
  }
}

export async function updateInvoiceStatus({
  invoiceId,
  status,
  paidDate,
}: {
  invoiceId: string;
  status: InvoiceStatus;
  paidDate?: number;
}) {
  await requireGlobalAdmin();
  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status,
      paidDate: paidDate ? new Date(paidDate) : null,
    },
  });
  revalidatePath(`/${invoice.orgId}/admin/invoices/${invoiceId}`);
  revalidateTag(cacheTags.invoices, "");
  return { success: true };
}

export async function removeInvoiceCharge({ chargeId }: { chargeId: string }) {
  await requireGlobalAdmin();
  const charge = await prisma.invoiceCharge.findUnique({
    where: { id: chargeId },
  });
  if (!charge) throw new Error("Charge not found");

  await prisma.$transaction(async (tx) => {
    await tx.invoiceCharge.delete({
      where: { id: chargeId },
    });
    await calculateAndWriteInvoiceTotals(tx, charge.invoiceId);
  });

  revalidatePath(`/${charge.orgId}/admin/invoices/${charge.invoiceId}`);
  revalidateTag(cacheTags.invoices, "");
  return { success: true };
}

export async function addOrderToInvoice({
  invoiceId,
  orderId,
}: {
  invoiceId: string;
  orderId: string;
}) {
  await requireGlobalAdmin();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { orgId: true },
  });
  if (!order) throw new Error("Order not found");

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { invoiceId },
    });
    await calculateAndWriteInvoiceTotals(tx, invoiceId);
  });

  revalidatePath(`/${order.orgId}/admin/invoices/${invoiceId}`);
  revalidateTag(cacheTags.invoices, "");
  return { success: true };
}

export async function removeOrderFromInvoice({
  invoiceId,
  orderId,
}: {
  invoiceId: string;
  orderId: string;
}) {
  await requireGlobalAdmin();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { orgId: true },
  });
  if (!order) throw new Error("Order not found");

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { invoiceId: null },
    });
    await calculateAndWriteInvoiceTotals(tx, invoiceId);
  });

  revalidatePath(`/${order.orgId}/admin/invoices/${invoiceId}`);
  revalidateTag(cacheTags.invoices, "");
  return { success: true };
}

export async function updateOrderInvoiceCost({
  orderId,
  invoiceCost,
}: {
  orderId: string;
  invoiceCost: number | null;
}) {
  await requireGlobalAdmin();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });
  if (!order) throw new Error("Order not found");

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { invoiceCost },
    });
    if (order.invoiceId) {
      await calculateAndWriteInvoiceTotals(tx, order.invoiceId);
    }
  });

  if (order.invoiceId) {
    revalidatePath(`/${order.orgId}/admin/invoices/${order.invoiceId}`);
  }
  revalidateTag(cacheTags.invoices, "");
  return { success: true };
}

export async function getUninvoicedOrders({ orgId }: { orgId: string }) {
  await requireGlobalAdmin();
  return await prisma.order.findMany({
    where: {
      orgId,
      invoiceId: null,
      status: {
        in: ["processing", "shipped", "delivered"],
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createInvoice(args: {
  orderIds: string[];
  orgId: string;
  poNumber?: string;
  internalNotes?: string;
  invoiceNotes?: string;
  dueDate?: number;
}) {
  await requireGlobalAdmin();

  // Validate all orders belong to org and are processing or above
  for (const orderId of args.orderIds) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new Error(`Order ${orderId} not found`);
    if (order.orgId !== args.orgId) {
      throw new Error("All orders must belong to the same organization");
    }

    const validStatuses = ["processing", "shipped", "exception", "delivered"];
    if (!validStatuses.includes(order.status)) {
      throw new Error(
        `Order ${order.reference} must be in processing status or above`,
      );
    }

    if (order.invoiceId) {
      throw new Error(`Order ${order.reference} is already invoiced`);
    }
  }

  // Generate invoice reference and create invoice in transaction
  const invoiceId = await prisma.$transaction(async (tx) => {
    const reference = await generateInvoiceReference(tx);

    let subtotalCost = 0;
    let vatCost = 0;
    let totalWeight = 0;
    let totalPackages = 0;

    // Fetch and calculate totals for orders
    const orders = await tx.order.findMany({
      where: {
        id: { in: args.orderIds },
      },
    });

    for (const order of orders) {
      if (order.invoiceCost !== null && order.invoiceCost !== undefined) {
        subtotalCost += order.invoiceCost;
      } else {
        if (order.courierCost) subtotalCost += order.courierCost;
        if (order.courierVAT) vatCost += order.courierVAT;
      }
      if (order.weight) totalWeight += order.weight;
      if (order.totalPackages) totalPackages += order.totalPackages;
    }

    const totalCost = subtotalCost + vatCost;

    const invoiceDate = new Date();
    const calculatedDueDate = new Date(
      invoiceDate.getTime() + 30 * 24 * 60 * 60 * 1000,
    ); // +30 days
    const finalDueDate = args.dueDate
      ? new Date(args.dueDate)
      : calculatedDueDate;

    const invoice = await tx.invoice.create({
      data: {
        orgId: args.orgId,
        reference,
        poNumber: args.poNumber || null,
        status: "draft",
        invoiceDate,
        dueDate: finalDueDate,
        subtotalCost,
        vatCost,
        totalCost,
        totalWeight,
        totalPackages: totalPackages || args.orderIds.length,
        internalNotes: args.internalNotes || null,
        invoiceNotes: args.invoiceNotes || null,
      },
    });

    // Update orders with invoiceId
    await tx.order.updateMany({
      where: {
        id: { in: args.orderIds },
      },
      data: {
        invoiceId: invoice.id,
      },
    });

    return invoice.id;
  });

  revalidatePath(`/${args.orgId}/admin/invoices`);
  revalidateTag(cacheTags.invoices, "");
  return invoiceId;
}

export async function addInvoiceCharge(args: {
  invoiceId: string;
  orderId?: string;
  chargeType: "ddp" | "address_update" | "redirect" | "refund" | "other";
  description: string;
  cost: number;
  vat: number;
  chargeDate: number;
}) {
  await requireGlobalAdmin();

  const invoice = await prisma.invoice.findUnique({
    where: { id: args.invoiceId },
  });
  if (!invoice) throw new Error("Invoice not found");

  if (args.orderId) {
    const order = await prisma.order.findUnique({
      where: { id: args.orderId },
    });
    if (!order) throw new Error("Order not found");
  }

  const chargeId = await prisma.$transaction(async (tx) => {
    const charge = await tx.invoiceCharge.create({
      data: {
        invoiceId: args.invoiceId,
        orderId: args.orderId || null,
        orgId: invoice.orgId,
        chargeType: args.chargeType,
        description: args.description,
        cost: args.cost,
        vat: args.vat,
        chargeDate: new Date(args.chargeDate),
      },
    });

    await calculateAndWriteInvoiceTotals(tx, args.invoiceId);
    return charge.id;
  });

  revalidatePath(`/${invoice.orgId}/admin/invoices/${args.invoiceId}`);
  revalidateTag(cacheTags.invoices, "");
  return chargeId;
}

export async function updateInvoiceCharge(args: {
  chargeId: string;
  chargeType: "ddp" | "address_update" | "redirect" | "refund" | "other";
  description: string;
  cost: number;
  vat: number;
  chargeDate: number;
}) {
  await requireGlobalAdmin();

  const charge = await prisma.invoiceCharge.findUnique({
    where: { id: args.chargeId },
  });
  if (!charge) throw new Error("Charge not found");

  await prisma.$transaction(async (tx) => {
    await tx.invoiceCharge.update({
      where: { id: args.chargeId },
      data: {
        chargeType: args.chargeType,
        description: args.description,
        cost: args.cost,
        vat: args.vat,
        chargeDate: new Date(args.chargeDate),
      },
    });

    await calculateAndWriteInvoiceTotals(tx, charge.invoiceId);
  });

  revalidatePath(`/${charge.orgId}/admin/invoices/${charge.invoiceId}`);
  revalidateTag(cacheTags.invoices, "");
  return { success: true };
}

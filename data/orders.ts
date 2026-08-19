"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { after } from "next/server";
import type {
  Order,
  OrderHistory,
  OrderItem,
  OrderStatus,
  Organization,
  Product,
  User,
} from "@/app/generated/prisma/client";
import type { OrderWhereInput } from "@/app/generated/prisma/models";
import {
  getSession,
  requireGlobalAdmin,
  requireUser,
} from "@/lib/auth/get-session";
import { cacheTags } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";
import { getSiteUrl } from "@/utils/site-url";
import { sendOrderEmail } from "./email";
import { createNotification } from "./notifications";

export async function createOrder(args: {
  orgId: string;
  addressId?: string;
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
  externalRef?: string;
  poRef?: string;
  comments?: string;
  weight: number;
  deliveryDate: Date | number;
  updateSavedAddress?: boolean;
  userId?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}) {
  try {
    const { user: loggedInUser } = await getSession();
    if (!loggedInUser) {
      throw new Error("Unauthorized: Access Denied");
    }

    let userId = loggedInUser.id;

    // Handle admin placing order for another user
    const isAdmin = loggedInUser.role === "admin" ||
      loggedInUser.role === "orgAdmin";
    if (args.userId && isAdmin) {
      userId = args.userId;
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    const org = await prisma.organization.findUnique({
      where: { id: args.orgId },
    });
    if (!org) {
      throw new Error("Organization not found");
    }

    let reference = "";
    let finalAddressId = args.addressId;

    if (finalAddressId) {
      if (args.updateSavedAddress) {
        await prisma.address.update({
          where: { id: finalAddressId },
          data: {
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
      }
    } else {
      // Create new address
      const newAddress = await prisma.address.create({
        data: {
          userId,
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
      finalAddressId = newAddress.id;
    }

    const deliveryDate = args.deliveryDate instanceof Date
      ? args.deliveryDate
      : new Date(args.deliveryDate);

    // Transaction to create order, decrement product stocks, create order items, log product movements, etc.
    const result = await prisma.$transaction(async (tx) => {
      // 2. Create the order with a placeholder reference
      let order = await tx.order.create({
        data: {
          userId,
          orgId: args.orgId,
          addressId: finalAddressId,
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
          reference: "TEMP",
          externalRef: args.externalRef || null,
          poRef: args.poRef || null,
          comments: args.comments || null,
          status: "pending" as OrderStatus,
          weight: args.weight,
          deliveryDate,
        },
      });

      // Construct unique reference using the auto-generated orderNumber
      const prefix = org.prefix || "ORD";
      reference = `${prefix}-${String(order.orderNumber).padStart(5, "0")}`;

      // Update the reference on the order
      order = await tx.order.update({
        where: { id: order.id },
        data: { reference },
      });

      // 3. Create order items and update product quantities
      for (const item of args.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        const previousQuantity = product.quantity;
        const newProductQty = previousQuantity - item.quantity;
        if (newProductQty < 0) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        // Update product quantity
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: newProductQty },
        });

        // Insert order item
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            orgId: args.orgId,
            quantity: item.quantity,
          },
        });

        // Log product movement inside transaction
        await tx.productMovement.create({
          data: {
            orgId: args.orgId,
            productId: item.productId,
            userId: loggedInUser.id,
            movementType: "sale",
            quantityChange: -item.quantity,
            quantityBefore: previousQuantity,
            quantityAfter: newProductQty,
            reason: `Order ${reference}`,
            relatedOrderId: order.id,
          },
        });
      }

      // Record initial tracking status in history
      await tx.orderHistory.create({
        data: {
          orgId: args.orgId,
          orderId: order.id,
          userId: loggedInUser.id,
          changeType: "tracking_updated",
          newValue: { status: "pending" },
          description: "Initial tracking status: pending",
        },
      });

      // Clear cart of the logged-in user
      await tx.cartItem.deleteMany({
        where: {
          userId: loggedInUser.id,
          orgId: args.orgId,
        },
      });

      // Log activity and order history
      await tx.activityLog.create({
        data: {
          orgId: args.orgId,
          userId: loggedInUser.id,
          action: "create",
          entityType: "order",
          entityId: order.id,
          description:
            `Created order ${reference} with ${args.items.length} item(s)`,
        },
      });

      await tx.orderHistory.create({
        data: {
          orgId: args.orgId,
          orderId: order.id,
          userId: loggedInUser.id,
          changeType: "created",
          newValue: {
            reference,
            status: "pending",
            itemCount: args.items.length,
          },
          description: `Order ${reference} created`,
        },
      });

      return order;
    });

    after(async () => {
      try {
        // Create notification
        await createNotification({
          userId,
          orgId: args.orgId,
          type: "order_placed",
          title: "Order Placed",
          message: `Your order ${reference} has been placed successfully.`,
          linkUrl: `/${args.orgId}/orders/${result.id}`,
          relatedEntityId: result.id,
        });

        // Fetch order items with product details for email template
        const dbOrderItems = await prisma.orderItem.findMany({
          where: { orderId: result.id },
          include: { product: true },
        });

        const itemsForEmail = dbOrderItems.map((i) => ({
          name: i.product.name,
          sku: i.product.sku,
          quantity: i.quantity,
          image: i.product.imgUrl ?? undefined,
        }));

        // Trigger order confirmation email
        await sendOrderEmail({
          to: loggedInUser.email,
          reference,
          status: "pending",
          fullname: args.fullname,
          address1: args.address1,
          address2: args.address2 || undefined,
          town: args.town,
          city: args.city || undefined,
          postcode: args.postcode,
          country: args.country,
          deliveryDate,
          weight: args.weight,
          items: itemsForEmail,
          externalComments: result.externalComments || undefined,
          sendDate: result.sendDate || undefined,
          orderUrl: `${getSiteUrl()}/${args.orgId}/orders/${result.id}`,
        });
      } catch (err) {
        console.error("Error in after background actions:", err);
      }
    });

    revalidatePath(`/${args.orgId}/orders`);
    revalidatePath(`/${args.orgId}/products`);
    revalidateTag(cacheTags.dashboard, "");
    revalidateTag(cacheTags.products, "");
    revalidateTag(cacheTags.orders, "");
    revalidateTag(cacheTags.adminOrders, "");
    revalidateTag(cacheTags.addresses, "");

    return { success: true, orderId: result.id };
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
}

async function fetchOrdersDbData({
  orgId,
  userId,
  isAdmin,
}: {
  orgId: string;
  userId: string;
  isAdmin: boolean;
}) {
  try {
    return await prisma.order.findMany({
      where: {
        orgId,
        ...(isAdmin ? {} : { userId }),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
        organization: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error in fetchOrdersDbData:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch orders from database");
  }
}

const getCachedOrdersDbData = unstable_cache(
  async (orgId: string, userId: string, isAdmin: boolean) =>
    fetchOrdersDbData({ orgId, userId, isAdmin }),
  ["normal-orders-cache"],
  {
    revalidate: 60, // Cache for 1 minute
    tags: [cacheTags.orders],
  },
);

export async function getOrders({ orgId }: { orgId: string }) {
  try {
    const user = await requireUser({ shouldThrow: false });
    if (!user) return [];

    const isAdmin = user.role === "admin" || user.role === "orgAdmin";

    return await getCachedOrdersDbData(orgId, user.id, isAdmin);
  } catch (error) {
    console.error("Error in getOrders:", error);
    return [];
  }
}

export async function getOrderById({
  orderId,
  orgId,
}: {
  orderId: string;
  orgId: string;
}) {
  try {
    const user = await requireUser({ shouldThrow: false });
    if (!user) return null;

    const isGlobalAdmin = user.role === "admin";
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        ...(isGlobalAdmin ? {} : { orgId }),
      },
      include: {
        user: true,
        organization: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) return null;

    const isAdmin = user.role === "admin" || user.role === "orgAdmin";
    if (order.userId !== user.id && !isAdmin) {
      return null;
    }

    return order;
  } catch (error) {
    console.error("Error in getOrderById:", error);
    return null;
  }
}

// Shared type for full order detail view
export type OrderWithFullDetails = Order & {
  user: User | null;
  organization: Organization | null;
  items: (OrderItem & { product: Product | null })[];
  history?: OrderHistory[];
};

// Update order (general fields, address, notes)
export async function updateOrder(args: {
  id: string;
  orgId: string;
  status?: string;
  externalRef?: string | null;
  poRef?: string | null;
  deliveryDate?: Date | number;
  sendDate?: Date | number | null;
  lwSyncedAt?: Date | number | null;
  totalPackages?: number;
  weight?: number;
  courierCost?: number;
  courierVAT?: number;
  invoiceCost?: number | null;
  comments?: string | null;
  externalComments?: string | null;
  address?: {
    fullname?: string;
    email?: string;
    phone?: string;
    address1?: string;
    address2?: string | null;
    city?: string | null;
    town?: string;
    postcode?: string;
    country?: string;
  };
}) {
  try {
    const user = await requireUser();

    const {
      id,
      orgId,
      status,
      externalRef,
      poRef,
      deliveryDate,
      sendDate,
      lwSyncedAt,
      totalPackages,
      weight,
      courierCost,
      courierVAT,
      invoiceCost,
      comments,
      externalComments,
      address,
    } = args;

    const order = await prisma.order.findUnique({
      where: { id, orgId },
    });
    if (!order) throw new Error("Order not found");

    const isAdmin = user.role === "admin" || user.role === "orgAdmin";
    const isOwner = order.userId === user.id;

    if (!isAdmin && !isOwner) {
      throw new Error("Forbidden: Insufficient Permissions");
    }

    if (!isAdmin) {
      // Prevent non-admins from updating admin-only fields
      if (
        status !== undefined ||
        externalRef !== undefined ||
        poRef !== undefined ||
        deliveryDate !== undefined ||
        sendDate !== undefined ||
        lwSyncedAt !== undefined ||
        totalPackages !== undefined ||
        weight !== undefined ||
        courierCost !== undefined ||
        courierVAT !== undefined ||
        invoiceCost !== undefined
      ) {
        throw new Error(
          "Forbidden: Insufficient Permissions to update admin fields",
        );
      }

      // Non-admin can only edit if status is pending
      if (order.status !== "pending") {
        throw new Error("Order is locked and cannot be updated");
      }
    }

    // Admin status lock check for address updates
    const isLockedForEveryone = order.status !== "pending" &&
      order.status !== "processing";

    if (isLockedForEveryone && address !== undefined) {
      throw new Error(
        "Order address can only be updated in pending or processing status",
      );
    }

    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (externalRef !== undefined) data.externalRef = externalRef;
    if (poRef !== undefined) data.poRef = poRef;
    if (deliveryDate !== undefined) {
      data.deliveryDate = typeof deliveryDate === "number"
        ? new Date(deliveryDate)
        : deliveryDate;
    }
    if (sendDate !== undefined) {
      data.sendDate = sendDate
        ? typeof sendDate === "number" ? new Date(sendDate) : sendDate
        : null;
    }
    if (lwSyncedAt !== undefined) {
      data.lwSyncedAt = lwSyncedAt
        ? typeof lwSyncedAt === "number" ? new Date(lwSyncedAt) : lwSyncedAt
        : null;
    }
    if (totalPackages !== undefined) data.totalPackages = totalPackages;
    if (weight !== undefined) data.weight = weight;
    if (courierCost !== undefined) data.courierCost = courierCost;
    if (courierVAT !== undefined) data.courierVAT = courierVAT;
    if (invoiceCost !== undefined) data.invoiceCost = invoiceCost;
    if (comments !== undefined) data.comments = comments;
    if (externalComments !== undefined) {
      data.externalComments = externalComments;
    }
    if (address) Object.assign(data, address);
    data.updatedAt = new Date();

    await prisma.order.update({ where: { id, orgId }, data });
    revalidatePath(`/${orgId}/orders/${id}`);
    revalidateTag(cacheTags.dashboard, "");
    revalidateTag(cacheTags.products, "");
    revalidateTag(cacheTags.orders, "");
    revalidateTag(cacheTags.adminOrders, "");
    return { success: true };
  } catch (error) {
    console.error("Error in updateOrder:", error);
    throw error instanceof Error ? error : new Error("Failed to update order");
  }
}

// Update tracking
export async function updateOrderTracking(args: {
  orderId: string;
  orgId: string;
  courier?: string;
  service?: string;
  trackingNumber?: string;
  status?: string;
  signedBy?: string;
  message?: string;
  createdAt?: number;
}) {
  try {
    const user = await requireGlobalAdmin();

    const {
      orderId,
      orgId,
      courier,
      service,
      trackingNumber,
      status,
      signedBy,
      message,
      createdAt,
    } = args;
    const data: Record<string, unknown> = { updatedAt: new Date() };
    if (courier !== undefined) data.courier = courier;
    if (service !== undefined) data.service = service;
    if (trackingNumber !== undefined) data.trackingNumber = trackingNumber;
    if (status !== undefined) data.status = status;
    if (signedBy !== undefined) data.signedBy = signedBy;
    if (message !== undefined) data.trackingMessage = message;
    if (status === "delivered") {
      data.deliveredAt = createdAt ? new Date(createdAt) : new Date();
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({ where: { id: orderId, orgId }, data });
      await tx.orderHistory.create({
        data: {
          orgId,
          orderId,
          userId: user.id,
          changeType: "tracking_updated",
          newValue: {
            status,
            trackingNumber,
            courier,
            service,
            signedBy,
          },
          description: `Tracking updated: ${status ?? "no change"}${
            message ? ` — ${message}` : ""
          }`,
          createdAt: createdAt ? new Date(createdAt) : new Date(),
        },
      });
    });

    revalidatePath(`/${orgId}/orders/${orderId}`);
    revalidateTag(cacheTags.dashboard, "");
    revalidateTag(cacheTags.products, "");
    revalidateTag(cacheTags.orders, "");
    revalidateTag(cacheTags.adminOrders, "");
    return { success: true };
  } catch (error) {
    console.error("Error in updateOrderTracking:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to update tracking");
  }
}

// Order history
export async function getOrderHistory({
  orderId,
  orgId,
}: {
  orderId: string;
  orgId: string;
}) {
  try {
    await requireUser();
    return await prisma.orderHistory.findMany({
      where: { orderId, orgId },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error in getOrderHistory:", error);
    return [];
  }
}

export async function deleteOrderHistory({
  historyId,
  orgId,
}: {
  historyId: string;
  orgId: string;
}) {
  try {
    await requireGlobalAdmin();

    await prisma.orderHistory.delete({ where: { id: historyId, orgId } });
    return { success: true };
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Failed to delete history");
  }
}

export async function updateOrderHistory({
  historyId,
  orgId,
  description,
  createdAt,
}: {
  historyId: string;
  orgId: string;
  description: string;
  createdAt: number;
}) {
  try {
    await requireGlobalAdmin();

    await prisma.orderHistory.update({
      where: { id: historyId, orgId },
      data: { description, createdAt: new Date(createdAt) },
    });
    return { success: true };
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Failed to update history");
  }
}

// Order items mutations
export async function updateOrderItem({
  orderItemId,
  orderId,
  orgId,
  quantity,
}: {
  orderItemId: string;
  orderId: string;
  orgId: string;
  quantity: number;
}) {
  try {
    const user = await requireUser();

    const item = await prisma.orderItem.findFirst({
      where: { id: orderItemId, orderId },
      include: { product: true, order: true },
    });
    if (!item) throw new Error("Order item not found");

    const isAdmin = user.role === "admin" || user.role === "orgAdmin";
    const isOwner = item.order.userId === user.id;

    if (!isAdmin && !isOwner) {
      throw new Error("Forbidden: Insufficient Permissions");
    }

    if (!isAdmin && item.order.status !== "pending") {
      throw new Error("Order is locked and items cannot be modified");
    }

    const isLockedForEveryone = item.order.status !== "pending" &&
      item.order.status !== "processing";

    if (isLockedForEveryone) {
      throw new Error(
        "Order items can only be modified in pending or processing status",
      );
    }

    const diff = quantity - item.quantity;
    const newProductQty = item.product.quantity - diff;
    if (newProductQty < 0) throw new Error("Insufficient stock");

    await prisma.$transaction([
      prisma.orderItem.update({
        where: { id: orderItemId },
        data: { quantity },
      }),
      prisma.product.update({
        where: { id: item.productId },
        data: { quantity: newProductQty },
      }),
    ]);

    revalidatePath(`/${orgId}/orders/${orderId}`);
    revalidateTag(cacheTags.dashboard, "");
    revalidateTag(cacheTags.products, "");
    revalidateTag(cacheTags.orders, "");
    revalidateTag(cacheTags.adminOrders, "");
    return { success: true };
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to update item");
  }
}

export async function addOrderItem({
  orderId,
  orgId,
  productId,
  quantity,
}: {
  orderId: string;
  orgId: string;
  productId: string;
  quantity: number;
}) {
  try {
    const user = await requireUser();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new Error("Order not found");

    const isAdmin = user.role === "admin" || user.role === "orgAdmin";
    const isOwner = order.userId === user.id;

    if (!isAdmin && !isOwner) {
      throw new Error("Forbidden: Insufficient Permissions");
    }

    if (!isAdmin && order.status !== "pending") {
      throw new Error("Order is locked and items cannot be modified");
    }

    const isLockedForEveryone = order.status !== "pending" &&
      order.status !== "processing";

    if (isLockedForEveryone) {
      throw new Error(
        "Order items can only be modified in pending or processing status",
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new Error("Product not found");
    if (product.quantity < quantity) throw new Error("Insufficient stock");

    await prisma.$transaction([
      prisma.orderItem.create({
        data: { orderId, productId, orgId, quantity },
      }),
      prisma.product.update({
        where: { id: productId },
        data: { quantity: { decrement: quantity } },
      }),
    ]);

    revalidatePath(`/${orgId}/orders/${orderId}`);
    revalidateTag(cacheTags.dashboard, "");
    revalidateTag(cacheTags.products, "");
    revalidateTag(cacheTags.orders, "");
    revalidateTag(cacheTags.adminOrders, "");
    return { success: true };
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to add item");
  }
}

export async function removeOrderItem({
  orderItemId,
  orderId,
  orgId,
}: {
  orderItemId: string;
  orderId: string;
  orgId: string;
}) {
  try {
    const user = await requireUser();

    const item = await prisma.orderItem.findFirst({
      where: { id: orderItemId, orderId },
      include: { order: true },
    });
    if (!item) throw new Error("Order item not found");

    const isAdmin = user.role === "admin" || user.role === "orgAdmin";
    const isOwner = item.order.userId === user.id;

    if (!isAdmin && !isOwner) {
      throw new Error("Forbidden: Insufficient Permissions");
    }

    if (!isAdmin && item.order.status !== "pending") {
      throw new Error("Order is locked and items cannot be modified");
    }

    const isLockedForEveryone = item.order.status !== "pending" &&
      item.order.status !== "processing";

    if (isLockedForEveryone) {
      throw new Error(
        "Order items can only be modified in pending or processing status",
      );
    }

    await prisma.$transaction([
      prisma.orderItem.delete({ where: { id: orderItemId } }),
      prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { increment: item.quantity } },
      }),
    ]);

    revalidatePath(`/${orgId}/orders/${orderId}`);
    revalidateTag(cacheTags.dashboard, "");
    revalidateTag(cacheTags.products, "");
    revalidateTag(cacheTags.orders, "");
    revalidateTag(cacheTags.adminOrders, "");
    return { success: true };
  } catch (error) {
    throw error instanceof Error ? error : new Error("Failed to remove item");
  }
}

// Send order notification / email update
export async function sendOrderNotification({
  orderId,
  recipientEmail,
  sendEmail: doSendEmail,
  sendNotification,
}: {
  orderId: string;
  recipientEmail?: string;
  sendEmail: boolean;
  sendNotification: boolean;
}) {
  try {
    await requireGlobalAdmin();

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true, items: { include: { product: true } } },
    });
    if (!order) throw new Error("Order not found");

    const toEmail = recipientEmail ?? order.user?.email ?? order.email;

    after(async () => {
      try {
        if (doSendEmail && toEmail) {
          await sendOrderEmail({
            to: toEmail,
            reference: order.reference,
            status: order.status,
            fullname: order.fullname,
            address1: order.address1,
            address2: order.address2 ?? undefined,
            town: order.town,
            city: order.city ?? undefined,
            postcode: order.postcode,
            country: order.country,
            deliveryDate: order.deliveryDate,
            weight: order.weight,
            courier: order.courier ?? undefined,
            trackingNumber: order.trackingNumber ?? undefined,
            service: order.service ?? undefined,
            signedBy: order.signedBy ?? undefined,
            deliveredAt: order.deliveredAt ?? undefined,
            items: order.items.map((i) => ({
              name: i.product.name,
              sku: i.product.sku,
              quantity: i.quantity,
              image: i.product.imgUrl ?? undefined,
            })),
            externalComments: order.externalComments ?? undefined,
            sendDate: order.sendDate ?? undefined,
            orderUrl:
              `${getSiteUrl()}/${order.orgId}/orders/${order.id}`,
          });
        }

        if (sendNotification && order.userId) {
          await createNotification({
            userId: order.userId,
            orgId: order.orgId,
            type: "order_status_update",
            title: "Order Update",
            message:
              `Your order ${order.reference} has been updated (${order.status}).`,
            linkUrl: `/${order.orgId}/orders/${order.id}`,
            relatedEntityId: order.id,
          });
        }
      } catch (err) {
        console.error(
          "Error in sendOrderNotification background actions:",
          err,
        );
      }
    });

    return { success: true };
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("Failed to send notification");
  }
}

interface GetAdminOrdersArgs {
  orgId: string;
  currentPage?: number;
  entriesPerPage?: number;
  status?: string;
  search?: string;
  startDate?: number;
  endDate?: number;
  courier?: string;
  reference?: string;
  fullname?: string;
  postcode?: string;
}

async function fetchAdminOrdersDbData({
  orgId,
  currentPage,
  entriesPerPage,
  status,
  search,
  startDate,
  endDate,
  courier,
  reference,
  fullname,
  postcode,
}: {
  orgId: string;
  currentPage: number;
  entriesPerPage: number;
  status?: string;
  search?: string;
  startDate?: number;
  endDate?: number;
  courier?: string;
  reference?: string;
  fullname?: string;
  postcode?: string;
}) {
  try {
    const where: OrderWhereInput = {};

    if (orgId && orgId !== "all") {
      where.orgId = orgId;
    }

    if (status && status !== "all") {
      where.status = status as OrderStatus;
    }

    if (search) {
      where.OR = [
        { reference: { contains: search, mode: "insensitive" } },
        { fullname: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { postcode: { contains: search, mode: "insensitive" } },
      ];
    }

    if (reference) {
      where.reference = { contains: reference, mode: "insensitive" };
    }

    if (fullname) {
      where.fullname = { contains: fullname, mode: "insensitive" };
    }

    if (postcode) {
      where.postcode = { contains: postcode, mode: "insensitive" };
    }

    if (courier && courier !== "all") {
      where.courier = { contains: courier, mode: "insensitive" };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const skip = (currentPage - 1) * entriesPerPage;
    const take = entriesPerPage;

    const [totalCount, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
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
    };
  } catch (error) {
    console.error("Error in fetchAdminOrdersDbData:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to fetch admin orders from database");
  }
}

const getCachedAdminOrdersDbData = unstable_cache(
  async (
    orgId: string,
    currentPage: number,
    entriesPerPage: number,
    status?: string,
    search?: string,
    startDate?: number,
    endDate?: number,
    courier?: string,
    reference?: string,
    fullname?: string,
    postcode?: string,
  ) =>
    fetchAdminOrdersDbData({
      orgId,
      currentPage,
      entriesPerPage,
      status,
      search,
      startDate,
      endDate,
      courier,
      reference,
      fullname,
      postcode,
    }),
  ["admin-orders-cache"],
  {
    revalidate: 20, // Cache for 20 seconds
    tags: [cacheTags.adminOrders],
  },
);

export async function getAdminOrders({
  orgId,
  currentPage = 1,
  entriesPerPage = 20,
  status,
  search,
  startDate,
  endDate,
  courier,
  reference,
  fullname,
  postcode,
}: GetAdminOrdersArgs) {
  try {
    await requireGlobalAdmin();

    return await getCachedAdminOrdersDbData(
      orgId,
      currentPage,
      entriesPerPage,
      status,
      search,
      startDate,
      endDate,
      courier,
      reference,
      fullname,
      postcode,
    );
  } catch (error) {
    console.error("Database error in getAdminOrders:", error);
    return {
      success: false,
      data: [],
      totalPages: 0,
      totalCount: 0,
      error: error instanceof Error ? error.message : "Internal Server Error",
    };
  }
}

export async function searchOrdersByRef({
  orgId,
  searchTerm,
}: {
  orgId: string;
  searchTerm: string;
}) {
  try {
    await requireUser();

    return await prisma.order.findMany({
      where: {
        orgId,
        reference: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        charges: {
          select: {
            id: true,
            chargeType: true,
            description: true,
            cost: true,
            vat: true,
            chargeDate: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error searching orders by ref:", error);
    return [];
  }
}

export async function updateOrderDescription({
  orderId,
  description,
}: {
  orderId: string;
  description: string | null;
}) {
  try {
    await requireGlobalAdmin();
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new Error("Order not found");

    await prisma.order.update({
      where: { id: orderId },
      data: {
        description,
      },
    });

    if (order.invoiceId) {
      revalidatePath(`/${order.orgId}/admin/invoices/${order.invoiceId}`);
    }
    revalidateTag(cacheTags.invoices, "");
    return { success: true };
  } catch (error) {
    console.error("Error in updateOrderDescription:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to update order description");
  }
}

export async function updateOrderPoRef({
  orderId,
  poRef,
}: {
  orderId: string;
  poRef: string | null;
}) {
  try {
    await requireGlobalAdmin();
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new Error("Order not found");

    await prisma.order.update({
      where: { id: orderId },
      data: {
        poRef,
      },
    });

    if (order.invoiceId) {
      revalidatePath(`/${order.orgId}/admin/invoices/${order.invoiceId}`);
    }
    revalidateTag(cacheTags.invoices, "");
    return { success: true };
  } catch (error) {
    console.error("Error in updateOrderPoRef:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to update order PO reference");
  }
}

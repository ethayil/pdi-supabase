import { Hono } from "hono";
import type { SupabaseClient } from "supabase";
import type { Database } from "../database.types.ts";
import {
  createNotification,
  logActivity,
  logOrderChange,
} from "../utils/logging.ts";
import {
  formattedDate,
  getErrorMessage,
  validateToken,
} from "../utils/utils.ts";

const ordersRouter = new Hono<{
  Variables: { supabase: SupabaseClient<Database> };
}>();

// type OrderRow = Database["public"]["Tables"]["order"]["Row"];
// type OrderItemRow = Database["public"]["Tables"]["order_item"]["Row"];
// type ProductRow = Database["public"]["Tables"]["product"]["Row"];
// type UserRow = Database["public"]["Tables"]["user"]["Row"];

interface GetOrdersBody {
  AuthorizationToken: string;
  UTCTimeFrom: string;
  PageNumber: number;
}

type DespatchOrderItemsType = {
  SKU: string;
  OrderLineNumber: string;
  DespatchedQuantity: string;
  SerialValues?: {
    CorrelationId: number;
    SerialValue: { Type: "AMZNTRANS" | "SERIAL" | "IMEI"; Value: string }[];
  };
};

type DespatchOrderType = {
  ReferenceNumber: string;
  ShippingVendor: string;
  ShippingMethod: string;
  TrackingNumber: string;
  TrackingUrl: string;
  SecondaryTrackingNumbers?: string[];
  ProcessedOn: string;
  Items: DespatchOrderItemsType[];
  Packages?: {
    ShippingVendor: string;
    ShippingMethod: string;
    TrackingNumber: string;
    TrackingUrl: string;
    Items: DespatchOrderItemsType;
  }[];
};

interface DespatchBody {
  AuthorizationToken: string;
  Orders: DespatchOrderType[];
}

type OrderCancellationType = {
  Items: {
    SKU: string;
    OrderLineNumber: string;
    DespatchedQuantity: string;
    Reason: string;
    SecondaryReason: string;
  }[];
  ReferenceNumber: string;
  ExternalReference: string;
};

interface CancelBody {
  AuthorizationToken: string;
  Cancellation: OrderCancellationType;
}

interface PostSaleOptionsBody {
  AuthorizationToken: string;
}

// ordersRouter.post("/get", async (c) => {
//   const supabase = c.get("supabase");
//   try {
//     const body: GetOrdersBody = await c.req.json();
//     const valid = await validateToken(supabase, body.AuthorizationToken);
//     if (!valid) return c.json({ Error: "Invalid Token" });

//     console.log("[INFO] Fetching open orders for Linnworks sync...");

//     const { data: baseOrders, error: ordersError } = await supabase
//       .from("order")
//       .select("*")
//       .eq("status", "processing");

//     if (ordersError) {
//       console.error(
//         "[ERROR] Failed to fetch processing orders:",
//         ordersError.message,
//       );
//       return c.json({ Error: ordersError.message });
//     }

//     if (!baseOrders || baseOrders.length === 0) {
//       return c.json({ Orders: [], TotalPages: 1 });
//     }

//     const processingOrders = await Promise.all(
//       baseOrders.map(async (order: OrderRow) => {
//         // Fetch User details
//         let user: UserRow | null = null;
//         if (order.userId) {
//           const { data: userData } = await supabase
//             .from("user")
//             .select("*")
//             .eq("id", order.userId)
//             .maybeSingle();
//           user = userData;
//         }

//         // Fetch Organization details
//         const { data: orgData } = await supabase
//           .from("organization")
//           .select("*")
//           .eq("id", order.orgId)
//           .maybeSingle();

//         // Fetch Order Items
//         const { data: orderItems, error: itemsError } = await supabase
//           .from("order_item")
//           .select("*")
//           .eq("orderId", order.id);

//         if (itemsError) {
//           console.error(
//             `[ERROR] Failed to fetch items for order ${order.id}:`,
//             itemsError.message,
//           );
//         }

//         const itemsWithProducts = orderItems
//           ? await Promise.all(
//             orderItems.map(async (item: OrderItemRow) => {
//               const { data: product } = await supabase
//                 .from("product")
//                 .select("*")
//                 .eq("id", item.productId)
//                 .maybeSingle();
//               return { ...item, product };
//             }),
//           )
//           : [];

//         return {
//           ...order,
//           user,
//           organization: orgData,
//           orderItems: itemsWithProducts,
//         };
//       }),
//     );

//     const orders = processingOrders.map((order) => ({
//       ReferenceNumber: order.reference,
//       ExternalReference: order.externalRef || order.id,
//       SecondaryReferenceNumber: null,
//       Site: "",
//       MatchPostalServiceTag: order.service,
//       MatchPaymentMethodTag: "",
//       ReceivedDate: formattedDate(order.createdAt, "lw"),
//       PaidOn: formattedDate(order.createdAt, "lw"),
//       DispatchBy: formattedDate(order.deliveryDate, "lw"),
//       Currency: "GBP",
//       DeliveryAddress: {
//         FullName: order.fullname,
//         Company: order.company || "",
//         Address1: order.address1,
//         Address2: order.address2 || "",
//         Town: order.town,
//         Region: order.city || "",
//         PostCode: order.postcode,
//         Country: order.country,
//         EmailAddress: order.email,
//         PhoneNumber: order.phone,
//       },
//       BillingAddress: {
//         FullName: order.fullname,
//         Company: order.company || "",
//         Address1: order.address1,
//         Address2: order.address2 || "",
//         Town: order.town,
//         Region: order.city || "",
//         PostCode: order.postcode,
//         Country: order.country,
//         EmailAddress: order.email,
//         PhoneNumber: order.phone,
//       },
//       OrderItems: order.orderItems.map(
//         (
//           item: OrderItemRow & { product: ProductRow | null },
//           index: number,
//         ) => ({
//           TaxCostInclusive: true,
//           UseChannelTax: false,
//           IsService: false,
//           OrderLineNumber: index + 1,
//           SKU: item.product?.sku,
//           PricePerUnit: 0,
//           Qty: item.quantity,
//           TaxRate: 0,
//           LinePercentDiscount: 0.0,
//           ItemTitle: item.product?.name,
//         }),
//       ),
//       Notes: [
//         {
//           Note: order.comments,
//           NoteEntryDate: formattedDate(order.createdAt, "lw"),
//           NoteUserName: "pdi:system",
//           IsInternal: true,
//         },
//         {
//           Note: order.externalComments,
//           NoteEntryDate: formattedDate(order.createdAt, "lw"),
//           NoteUserName: "pdi:system",
//           IsInternal: false,
//         },
//       ],
//       PaymentStatus: "PAID",
//     }));

//     console.log(`[INFO] Found ${orders.length} processing orders to return.`);
//     return c.json({
//       Orders: orders,
//       TotalPages: 1,
//     });
//   } catch (err) {
//     const message = getErrorMessage(err);
//     console.error("[ERROR] Unexpected error in orders/get:", message);
//     return c.json({ Error: message });
//   }
// });

ordersRouter.post("/get", async (c) => {
  const supabase = c.get("supabase");
  try {
    const body: GetOrdersBody = await c.req.json();
    const valid = await validateToken(supabase, body.AuthorizationToken);
    if (!valid) return c.json({ Error: "Invalid Token" });

    console.log("[INFO] Fetching open orders via relational join...");

    // SINGLE database round-trip fetching the entire nested tree
    const { data: baseOrders, error: ordersError } = await supabase
      .from("order")
      .select(`
        *,
        order_item (
          *,
          product (*)
        )
      `)
      .eq("status", "processing");

    if (ordersError) {
      console.error(
        "[ERROR] Failed to fetch processing orders:",
        ordersError.message,
      );
      return c.json({ Error: ordersError.message });
    }

    if (!baseOrders || baseOrders.length === 0) {
      return c.json({ Orders: [], TotalPages: 1 });
    }

    // Since the database built the tree, map straight to the Linnworks format
    const orders = baseOrders.map((order) => ({
      ReferenceNumber: order.reference,
      ExternalReference: order.externalRef || order.id,
      SecondaryReferenceNumber: null,
      Site: "",
      MatchPostalServiceTag: order.service,
      MatchPaymentMethodTag: "",
      ReceivedDate: formattedDate(order.createdAt, "lw"),
      PaidOn: formattedDate(order.createdAt, "lw"),
      DispatchBy: formattedDate(order.deliveryDate, "lw"),
      Currency: "GBP",
      DeliveryAddress: {
        FullName: order.fullname,
        Company: order.company || "",
        Address1: order.address1,
        Address2: order.address2 || "",
        Town: order.town,
        Region: order.city || "",
        PostCode: order.postcode,
        Country: order.country,
        EmailAddress: order.email,
        PhoneNumber: order.phone,
      },
      BillingAddress: {
        FullName: order.fullname,
        Company: order.company || "",
        Address1: order.address1,
        Address2: order.address2 || "",
        Town: order.town,
        Region: order.city || "",
        PostCode: order.postcode,
        Country: order.country,
        EmailAddress: order.email,
        PhoneNumber: order.phone,
      },
      // Safely access the pre-joined order_item array mapping straight to products
      OrderItems: (order.order_item || []).map((item, index) => ({
        TaxCostInclusive: true,
        UseChannelTax: false,
        IsService: false,
        OrderLineNumber: index + 1,
        SKU: item.product?.sku,
        PricePerUnit: 0,
        Qty: item.quantity,
        TaxRate: 0,
        LinePercentDiscount: 0.0,
        ItemTitle: item.product?.name,
      })),
      Notes: [
        {
          Note: order.comments,
          NoteEntryDate: formattedDate(order.createdAt, "lw"),
          NoteUserName: "pdi:system",
          IsInternal: true,
        },
        {
          Note: order.externalComments,
          NoteEntryDate: formattedDate(order.createdAt, "lw"),
          NoteUserName: "pdi:system",
          IsInternal: false,
        },
      ],
      PaymentStatus: "PAID",
    }));

    console.log(`[INFO] Found ${orders.length} processing orders to return.`);
    return c.json({
      Orders: orders,
      TotalPages: 1,
    });
  } catch (err) {
    const message = getErrorMessage(err);
    console.error("[ERROR] Unexpected error in orders/get:", message);
    return c.json({ Error: message });
  }
});

ordersRouter.post("/despatch", async (c) => {
  const supabase = c.get("supabase");
  try {
    const body: DespatchBody = await c.req.json();
    const valid = await validateToken(supabase, body.AuthorizationToken);
    if (!valid) return c.json({ Error: "Invalid Token" });

    const ordersToDespatch = body.Orders || [];
    console.log(
      `[INFO] Processing despatch for ${ordersToDespatch.length} orders...`,
    );

    for (const item of ordersToDespatch) {
      const { data: order, error: findError } = await supabase
        .from("order")
        .select("*")
        .eq("reference", item.ReferenceNumber)
        .maybeSingle();

      if (findError) {
        console.error(
          `[ERROR] Failed to find order for reference ${item.ReferenceNumber}:`,
          findError.message,
        );
        continue;
      }

      if (order) {
        const oldStatus = order.status;
        const { error: updateError } = await supabase
          .from("order")
          .update({
            status: "shipped",
            trackingNumber: item.TrackingNumber || null,
            courier: item.ShippingVendor || null,
            updatedAt: new Date().toISOString(),
          })
          .eq("id", order.id);

        if (updateError) {
          console.error(
            `[ERROR] Failed to update order status for reference ${item.ReferenceNumber}:`,
            updateError.message,
          );
          continue;
        }

        console.log(
          `[INFO] Order ${order.reference} status updated: ${oldStatus} -> shipped`,
        );

        await logOrderChange(supabase, {
          orgId: order.orgId,
          orderId: order.id,
          systemSource: "linnworks",
          changeType: "status_change",
          previousValue: oldStatus,
          newValue: "shipped",
          description: `Order shipped via Linnworks. Tracking: ${
            item.TrackingNumber ?? "N/A"
          }, Carrier: ${item.ShippingVendor ?? "N/A"}`,
        });

        await logActivity(supabase, {
          orgId: order.orgId,
          systemSource: "linnworks",
          action: "update",
          entityType: "order_status",
          entityId: order.id,
          description:
            `Order ${order.reference} shipped via Linnworks. Status: ${oldStatus} -> shipped`,
          changes: {
            status: { from: oldStatus, to: "shipped" },
            trackingNumber: item.TrackingNumber || null,
            courier: item.ShippingVendor || null,
          },
        });

        await createNotification(supabase, {
          userId: order.userId,
          orgId: order.orgId,
          systemSource: "linnworks",
          type: "order_status_update",
          title: "Order Shipped",
          message: `Your order ${order.reference} has been shipped. Tracking: ${
            item.TrackingNumber ?? "N/A"
          }`,
          relatedEntityId: order.id,
        });
      } else {
        console.warn(
          `[WARN] Order with reference ${item.ReferenceNumber} not found for despatch.`,
        );
      }
    }

    return c.json({ Error: null });
  } catch (err) {
    const message = getErrorMessage(err);
    console.error("[ERROR] Unexpected error in orders/despatch:", message);
    return c.json({ Error: message });
  }
});

ordersRouter.post("/cancel", async (c) => {
  const supabase = c.get("supabase");
  try {
    const body: CancelBody = await c.req.json();
    const valid = await validateToken(supabase, body.AuthorizationToken);
    if (!valid) return c.json({ Error: "Invalid Token" });

    const orderRef = body.Cancellation.ReferenceNumber;
    console.log(
      `[INFO] Processing cancellation for order reference ${orderRef}...`,
    );

    const { data: order, error: findError } = await supabase
      .from("order")
      .select("*")
      .eq("reference", orderRef)
      .maybeSingle();

    if (findError) {
      console.error(
        `[ERROR] Failed to find order for cancellation reference ${orderRef}:`,
        findError.message,
      );
      return c.json({ Error: findError.message });
    }

    if (order) {
      const oldStatus = order.status;
      const { error: updateError } = await supabase
        .from("order")
        .update({
          status: "cancelled",
          updatedAt: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (updateError) {
        console.error(
          `[ERROR] Failed to cancel order ${orderRef}:`,
          updateError.message,
        );
        return c.json({ Error: updateError.message });
      }

      console.log(
        `[INFO] Order ${order.reference} cancelled successfully. Status: ${oldStatus} -> cancelled`,
      );

      await logOrderChange(supabase, {
        orgId: order.orgId,
        orderId: order.id,
        systemSource: "linnworks",
        changeType: "status_change",
        previousValue: oldStatus,
        newValue: "cancelled",
        description: "Order cancelled via Linnworks",
      });

      await logActivity(supabase, {
        orgId: order.orgId,
        systemSource: "linnworks",
        action: "update",
        entityType: "order_status",
        entityId: order.id,
        description:
          `Order ${order.reference} cancelled via Linnworks. Status: ${oldStatus} -> cancelled`,
        changes: {
          status: { from: oldStatus, to: "cancelled" },
        },
      });
    } else {
      console.warn(
        `[WARN] Order with reference ${orderRef} not found for cancellation.`,
      );
    }

    return c.json({ Error: null });
  } catch (err) {
    const message = getErrorMessage(err);
    console.error("[ERROR] Unexpected error in orders/cancel:", message);
    return c.json({ Error: message });
  }
});

ordersRouter.post("/post-sale-options", async (c) => {
  const supabase = c.get("supabase");
  try {
    const body: PostSaleOptionsBody = await c.req.json();
    const valid = await validateToken(supabase, body.AuthorizationToken);
    if (!valid) return c.json({ Error: "Invalid Token" });

    return c.json({
      Error: null,
      CanCancel: false,
      CanCancelOrderLines: false,
      CanCancelOrderLinesPartially: false,
      AutomaticRefundOnCancel: false,
      CanRefund: false,
      CanAttachRefundToItem: false,
      CanAttachRefundToService: false,
      RefundShippingTypes: 0,
      CanRefundAdditionally: false,
      CanReturn: false,
    });
  } catch (err) {
    return c.json({ Error: getErrorMessage(err) });
  }
});

export default ordersRouter;

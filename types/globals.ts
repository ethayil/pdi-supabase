export type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export type Params = Promise<{
  orgId: string;
  orderId: string;
  invoiceId: string;
}>;

export type UserRole = "user" | "orgAdmin" | "superAdmin" | "warehouse";

export type InvoiceChargeType =
  | "ddp"
  | "address_update"
  | "redirect"
  | "refund"
  | "other";

export const orderStatuses = [
  "pending",
  "processing",
  "shipped",
  "on_the_way",
  "delay",
  "exception",
  "delivered",
  "cancelled",
  "returned",
  "collected",
] as const;

export const invoiceStatus = [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export type InvoiceStatus = (typeof invoiceStatus)[number];

export const VALID_ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: [
    "processing",
    "shipped",
    "on_the_way",
    "delay",
    "exception",
    "delivered",
    "cancelled",
    "collected",
  ],
  processing: [
    "shipped",
    "on_the_way",
    "delay",
    "exception",
    "delivered",
    "cancelled",
    "collected",
  ],
  shipped: [
    "on_the_way",
    "delay",
    "exception",
    "delivered",
    "returned",
    "cancelled",
  ],
  on_the_way: [
    "delay",
    "exception",
    "delivered",
    "returned",
    "cancelled",
    "shipped",
  ],
  delay: [
    "on_the_way",
    "exception",
    "delivered",
    "returned",
    "cancelled",
    "shipped",
  ],
  exception: [
    "on_the_way",
    "delay",
    "delivered",
    "returned",
    "cancelled",
    "shipped",
  ],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
  collected: ["returned"],
};


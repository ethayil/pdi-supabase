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

export type TrackingStatus =
  | "exception"
  | "delivered"
  | "on_the_way"
  | "delay"
  | "cancelled"
  | "collected"
  | "returned";

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

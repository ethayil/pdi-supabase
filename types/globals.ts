export type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export type Params = Promise<{
  orgId: string;
  orderId: string;
  invoiceId: string;
}>;

export const USER_ROLE_VALUES = [
  "user",
  "orgAdmin",
  "admin",
  "warehouse",
] as const;

export type UserRole = (typeof USER_ROLE_VALUES)[number];

export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: "user", label: "User" },
  { value: "orgAdmin", label: "Org Admin" },
  { value: "admin", label: "Admin" },
  { value: "warehouse", label: "Warehouse" },
];

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

export const VALID_ORDER_STATUS_TRANSITIONS: Record<
  OrderStatus,
  OrderStatus[]
> = {
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
    "pending",
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

export const cacheTags = {
  dashboard: "dashboard",
  products: "products",
  categories: "categories",
  orders: "orders",
  adminOrders: "admin-orders",
  notifications: "notifications",
  banners: "banners",
  addresses: "addresses",
  users: "users",
  organizations: "organizations",
  invoices: "invoices",
  logs: "logs",
  activityLogs: "activity-logs",
  productMovements: "product-movements",
  despatch: "despatch",
} as const;

export type CacheTag = (typeof cacheTags)[keyof typeof cacheTags];

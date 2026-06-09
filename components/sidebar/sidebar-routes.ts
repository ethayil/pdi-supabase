"use client";

import {
  Home,
  LayoutGrid,
  Logs,
  Megaphone,
  Notebook,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  University,
  UserCog,
} from "lucide-react";

export const userRoutes = [
  {
    name: "Home",
    url: "/",
    icon: Home,
  },
  {
    name: "Products",
    url: "/products",
    icon: Package,
  },
  {
    name: "Checkout",
    url: "/checkout",
    icon: ShoppingCart,
  },
  {
    name: "Orders",
    url: "/orders",
    icon: ShoppingBag,
  },
  {
    name: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export const orgAdminRoutes = [
  {
    name: "Members",
    url: "/members",
    icon: UserCog,
  },
];

export const adminRoutes = [
  {
    name: "Orders",
    url: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    name: "Categories",
    url: "/admin/categories",
    icon: LayoutGrid,
  },
  {
    name: "Products",
    url: "/admin/products",
    icon: Package,
  },
  {
    name: "Organizations",
    url: "/admin/orgs",
    icon: University,
  },
  {
    name: "Invoices",
    url: "/admin/invoices",
    icon: Notebook,
  },
  {
    name: "Users",
    url: "/admin/users",
    icon: UserCog,
  },
  {
    name: "Logs",
    url: "/admin/logs",
    icon: Logs,
  },
  {
    name: "Notifications",
    url: "/admin/notifications",
    icon: Megaphone,
  },
];

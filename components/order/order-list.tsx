"use client";

import { Box } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useQueryState } from "nuqs";
import type {
  Order,
  OrderItem,
  Product,
  User,
} from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { OrderCard } from "./order-card";

export type OrderWithDetails = Order & {
  user: User | null;
  items: (OrderItem & { product: Product | null })[];
};

interface OrderListProps {
  orgId: string;
  isAdmin?: boolean;
  currentUserId?: string;
  orders: OrderWithDetails[];
}

export function OrderList({
  orgId,
  isAdmin,
  currentUserId,
  orders = [],
}: OrderListProps) {
  const [filterMember] = useQueryState("member", {
    defaultValue: currentUserId ?? "",
  });

  // Filter orders client-side based on selected member
  const filteredOrders = isAdmin
    ? filterMember && filterMember !== "all"
      ? orders.filter((o) => o.userId === filterMember)
      : orders
    : orders.filter((o) => o.userId === currentUserId);

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-auto pb-4">
      {filteredOrders.length < 1 ? (
        <div className="flex flex-col items-center justify-center h-full space-y-4 p-4 min-h-100">
          <Box className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">No orders found</h2>
          <p className="text-muted-foreground text-center max-w-md">
            {isAdmin
              ? "No orders found for the selected member."
              : "Looks like you haven't placed any orders yet"}
          </p>
          {!isAdmin && (
            <Button>
              <Link href={`/${orgId}/products`}>Go to Products</Link>
            </Button>
          )}
        </div>
      ) : (
        <main className="p-2 md:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="w-full flex flex-col gap-2 md:gap-4"
          >
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.65,
                  delay: index * 0.05,
                  ease: "easeOut",
                }}
              >
                <OrderCard order={order} orgId={orgId} />
              </motion.div>
            ))}
          </motion.div>
        </main>
      )}
    </div>
  );
}

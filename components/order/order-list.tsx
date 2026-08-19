"use client";

import { Box } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useTransition } from "react";
import type {
  Order,
  OrderItem,
  Product,
  User,
} from "@/app/generated/prisma/client";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { Button } from "@/components/ui/button";
import { OrderCard } from "./order-card";

export type OrderWithDetails = Order & {
  user: User | null;
  items: (OrderItem & { product: Product | null })[];
};

interface OrderListProps {
  orgId: string;
  isAdmin?: boolean;
  orders: OrderWithDetails[];
  totalPages?: number;
  totalCount?: number;
}

export function OrderList({
  orgId,
  isAdmin,
  orders = [],
  totalPages = 1,
  totalCount = 0,
}: OrderListProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden pb-12">
      {isPending && (
        <div className="absolute top-0 left-0 right-0 h-1 z-30 pointer-events-none bg-primary/10 overflow-hidden">
          <motion.div
            className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: "easeInOut",
            }}
          />
        </div>
      )}

      {orders.length < 1 ? (
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
        <main
          className={`p-2 md:p-4 flex-1 overflow-auto transition-opacity duration-200 ${isPending ? "opacity-60" : "opacity-100"}`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="w-full flex flex-col gap-2 md:gap-4"
          >
            {orders.map((order, index) => (
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

      <DataTablePagination
        totalPages={totalPages}
        totalCount={totalCount}
        startTransition={startTransition}
      />
    </div>
  );
}

import { OrderListSkeleton } from "@/components/order/order-list-skeleton";

export default function OrdersLoading() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header Skeleton */}
      <div className="flex h-16 items-center justify-between border-b px-6 bg-background sticky top-0 z-50 shrink-0">
        <span className="font-semibold text-sm">Orders</span>
      </div>
      <OrderListSkeleton />
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrderDetailView } from "@/components/order/order-detail-view";
import { getOrderById } from "@/data/orders";
import type { Params } from "@/types/globals";

export const metadata: Metadata = {
  title: "Order Details | PDi",
  description: "PDi Order Details",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Params;
}) {
  const { orgId, orderId } = await params;
  const order = await getOrderById({ orderId, orgId });

  if (!order) {
    return redirect(`/${orgId}/admin/orders`);
  }

  return (
    <OrderDetailView
      order={order}
      orgId={orgId}
      isAdmin
    />
  );
}

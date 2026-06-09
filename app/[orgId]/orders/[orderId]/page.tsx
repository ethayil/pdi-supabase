import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrderDetailView } from "@/components/order/order-detail-view";
import { getOrderById } from "@/data/orders";
import { getSession } from "@/lib/auth/get-session";
import type { Params } from "@/types/globals";

export const metadata: Metadata = {
  title: "Order Detail | PDi",
  description: "PDi Order Detail",
};

export default async function OrderDetailPage({ params }: { params: Params }) {
  const { orgId, orderId } = await params;
  const { user } = await getSession();

  if (!user) return redirect(`/${orgId}/orders`);

  const order = await getOrderById({ orderId, orgId });

  if (!order) {
    return redirect(`/${orgId}/orders`);
  }

  const isAdmin = user.role === "superAdmin" || user.role === "orgAdmin";

  return <OrderDetailView order={order} orgId={orgId} isAdmin={false} />;
}

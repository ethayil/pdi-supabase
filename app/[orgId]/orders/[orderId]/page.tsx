import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrderDetailView } from "@/components/order/order-detail-view";
import { getOrderById } from "@/data/orders";
import { getAvailableProducts } from "@/data/products";
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

  const dbProducts = await getAvailableProducts({ orgId });

  const availableProducts = dbProducts.map((p) => ({
    _id: p.id,
    name: p.name,
    sku: p.sku,
    imgUrl: p.imgUrl ?? undefined,
    quantity: p.quantity,
  }));

  return (
    <OrderDetailView
      order={order}
      orgId={orgId}
      isAdmin={false}
      availableProducts={availableProducts}
    />
  );
}

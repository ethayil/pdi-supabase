import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrderDetailView } from "@/components/order/order-detail-view";
import { getOrderById } from "@/data/orders";
import { getProducts } from "@/data/products";
import type { Params } from "@/types/globals";

export const metadata: Metadata = {
  title: "Order Detail | PDi",
  description: "View order details",
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

  const { data: dbProducts } = await getProducts({
    orgId,
    stockStatus: "active",
    entriesPerPage: 1000,
  });

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
      isAdmin
      availableProducts={availableProducts}
    />
  );
}

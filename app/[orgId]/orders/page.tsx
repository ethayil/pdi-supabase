import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard-header";
import { MemberSelect } from "@/components/order/member-select";
import { OrderList } from "@/components/order/order-list";
import { getOrders } from "@/data/orders";
import { getOrgUsers } from "@/data/users";
import { getSession } from "@/lib/auth/get-session";
import type { Params } from "@/types/globals";

export const metadata: Metadata = {
  title: "Orders | PDi",
  description: "PDi Orders",
};

export default async function OrdersPage({ params }: { params: Params }) {
  const { orgId } = await params;
  const { user } = await getSession();

  if (!user) return null;

  const isAdmin = user.role === "superAdmin" || user.role === "orgAdmin";

  const [orders, orgUsers] = await Promise.all([
    getOrders({ orgId }),
    isAdmin ? getOrgUsers({ orgId }) : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <DashboardHeader title="Orders" sticky>
        {isAdmin && <MemberSelect currentUserId={user.id} members={orgUsers} />}
      </DashboardHeader>
      <OrderList
        orgId={orgId}
        isAdmin={isAdmin}
        currentUserId={user.id}
        orders={orders}
      />
    </div>
  );
}

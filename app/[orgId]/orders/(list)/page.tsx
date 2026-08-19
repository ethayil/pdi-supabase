import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { createLoader, parseAsString } from "nuqs/server";
import { DashboardHeader } from "@/components/dashboard-header";
import { MemberSelect } from "@/components/order/member-select";
import { OrderList } from "@/components/order/order-list";
import { getOrders } from "@/data/orders";
import { getOrgUsers } from "@/data/users";
import { getSession } from "@/lib/auth/get-session";
import { paginationParsers, paginationUrlKeys } from "@/lib/nuqs/global-params";
import type { Params } from "@/types/globals";

export const metadata: Metadata = {
  title: "Orders | PDi",
  description: "PDi Orders",
};

const loadOrdersParams = createLoader(
  {
    ...paginationParsers,
    member: parseAsString.withDefault(""),
  },
  {
    urlKeys: {
      ...paginationUrlKeys,
    },
  },
);

export default async function OrdersPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<SearchParams>;
}) {
  const { orgId } = await params;
  const { user, isAdmin } = await getSession();
  const { currentPage, entriesPerPage, member } = await loadOrdersParams(
    searchParams,
  );

  if (!user) return null;

  const [ordersResult, orgUsers] = await Promise.all([
    getOrders({
      orgId,
      currentPage,
      entriesPerPage,
      filterUserId: member || undefined,
    }),
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
        orders={ordersResult.data}
        totalPages={ordersResult.totalPages}
        totalCount={ordersResult.totalCount}
      />
    </div>
  );
}

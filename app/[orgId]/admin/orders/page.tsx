import * as motion from "motion/react-client";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { DashboardHeader } from "@/components/dashboard-header";
import OrdersHeader from "@/components/order/orders-header";
import { OrdersTableWrapper } from "@/components/order/orders-table-wrapper";
import { getAdminOrders } from "@/data/orders";
import { getOrganizations } from "@/data/organizations";
import { loadOrderParams } from "@/lib/nuqs/order-params";
import type { Params } from "@/types/globals";

export const metadata: Metadata = {
  title: "Orders | PDi",
  description: "PDi Orders",
};

export default async function AdminOrdersPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<SearchParams>;
}) {
  const { orgId } = await params;
  const {
    currentPage,
    entriesPerPage,
    start,
    end,
    orgId: paramOrgId,
    query,
    status,
    ref,
    name,
    post,
    courier,
  } = await loadOrderParams(searchParams);

  // Fetch initial orders with filters
  const initialData = await getAdminOrders({
    orgId: paramOrgId,
    currentPage,
    entriesPerPage,
    status,
    search: query || undefined,
    startDate: start ? parseInt(start, 10) : undefined,
    endDate: end ? parseInt(end, 10) : undefined,
    courier: courier || undefined,
    reference: ref || undefined,
    fullname: name || undefined,
    postcode: post || undefined,
  });

  // Fetch active organizations for organization switcher in header
  const { data: orgs } = await getOrganizations({ entriesPerPage: 1000 });

  return (
    <>
      <DashboardHeader title="Orders" mobileTitle="Orders">
        <OrdersHeader organizations={orgs || []} />
      </DashboardHeader>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-hidden"
      >
        <OrdersTableWrapper organizationId={orgId} initialData={initialData} />
      </motion.div>
    </>
  );
}

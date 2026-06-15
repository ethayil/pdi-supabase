import * as motion from "motion/react-client";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { DashboardHeader } from "@/components/dashboard-header";
import { DespatchConsole } from "@/components/order/despatch-console";
import DespatchHeader from "@/components/order/despatch-header";
import { getDespatchOrders } from "@/data/despatch-data";
import { getOrganizations } from "@/data/organizations";
import { loadDespatchParams } from "@/lib/nuqs/despatch-params";

export const metadata: Metadata = {
  title: "Despatch Console | PDi",
  description: "Manage order dispatch by send date",
};

export default async function DespatchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const {
    orgId: paramOrgId,
    currentPage,
    entriesPerPage,
    urgency,
  } = await loadDespatchParams(searchParams);

  const [ordersResponse, orgsResponse] = await Promise.all([
    getDespatchOrders({
      orgId: paramOrgId,
      currentPage,
      entriesPerPage,
      urgency,
    }),
    getOrganizations({ entriesPerPage: 1000 }),
  ]);

  const orgs = orgsResponse?.data || [];

  return (
    <>
      <DashboardHeader title="Despatch Console" mobileTitle="Despatch">
        <DespatchHeader organizations={orgs} />
      </DashboardHeader>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="flex-1 overflow-hidden"
      >
        <DespatchConsole
          initialData={ordersResponse}
          organizations={orgs}
        />
      </motion.div>
    </>
  );
}

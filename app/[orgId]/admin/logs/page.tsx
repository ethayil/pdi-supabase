import * as motion from "motion/react-client";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { DashboardHeader } from "@/components/dashboard-header";
import { LogsTableWrapper } from "@/components/log/logs-table-wrapper";
import { getLogs } from "@/data/logging";
import { loadLogParams } from "@/lib/nuqs/log-params";
import type { Params } from "@/types/globals";

export const metadata: Metadata = {
  title: "Logs | PDi",
  description: "PDi Logs",
};

export default async function AdminLogsPage({
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
    entityType,
    user: userSearch,
    message: messageSearch,
  } = await loadLogParams(searchParams);

  const initialData = await getLogs({
    orgId,
    currentPage,
    entriesPerPage,
    entityType: entityType === "all" ? undefined : entityType,
    startDate: start ? parseFloat(start) : undefined,
    endDate: end ? parseFloat(end) : undefined,
    userSearch: userSearch || undefined,
    messageSearch: messageSearch || undefined,
  });

  return (
    <>
      <DashboardHeader title="Activity Logs" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-hidden"
      >
        <LogsTableWrapper initialData={initialData} />
      </motion.div>
    </>
  );
}

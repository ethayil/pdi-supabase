import * as motion from "motion/react-client";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { DashboardHeader } from "@/components/dashboard-header";
import InvoicesHeader from "@/components/invoice/invoices-header";
import { InvoicesTableWrapper } from "@/components/invoice/invoices-table-wrapper";
import { getInvoiceCount, getPaginatedInvoices } from "@/data/invoices";
import { loadInvoiceParams } from "@/lib/nuqs/invoice-params";
import type { Params } from "@/types/globals";

export const metadata: Metadata = {
  title: "Invoices | PDi",
  description: "PDi Invoices",
};

export default async function AdminInvoicesPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<SearchParams>;
}) {
  const { orgId } = await params;
  const { currentPage, entriesPerPage, start, end, status } =
    await loadInvoiceParams(searchParams);

  const invoices = await getPaginatedInvoices({
    orgId,
    status,
    dateFrom: start ? parseInt(start) : undefined,
    dateTo: end ? parseInt(end) : undefined,
    currentPage,
    pageSize: entriesPerPage,
  });

  const totalCount = await getInvoiceCount({
    orgId,
    status,
    dateFrom: start ? parseInt(start) : undefined,
    dateTo: end ? parseInt(end) : undefined,
  });

  const totalPages = Math.ceil(totalCount / entriesPerPage);

  const initialData = {
    data: invoices,
    totalPages,
    totalCount,
  };

  return (
    <>
      <DashboardHeader title="Invoices Management" mobileTitle="Invoices">
        <InvoicesHeader organizationId={orgId} />
      </DashboardHeader>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-hidden"
      >
        <InvoicesTableWrapper
          organizationId={orgId}
          initialData={initialData}
        />
      </motion.div>
    </>
  );
}

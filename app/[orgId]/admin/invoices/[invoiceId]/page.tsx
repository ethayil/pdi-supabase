import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InvoiceDetailView } from "@/components/invoice/invoice-detail-view";
import { getInvoiceDetails } from "@/data/invoices";
import type { Params } from "@/types/globals";

export const metadata: Metadata = {
  title: "Invoice Details | PDi",
  description: "PDi Invoice Details",
};

export default async function AdminInvoiceDetailPage({
  params,
}: {
  params: Params;
}) {
  const { orgId, invoiceId } = await params;

  const invoiceData = await getInvoiceDetails({ invoiceId });

  if (!invoiceData) {
    notFound();
  }

  return (
    <InvoiceDetailView
      initialInvoiceData={invoiceData}
      organizationId={orgId}
    />
  );
}


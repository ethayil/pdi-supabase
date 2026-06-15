import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

export default function Loading() {
  return <AdminTableSkeleton title="Invoices Management" columnsCount={6} rowsCount={10} />;
}

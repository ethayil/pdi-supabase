import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

export default function AdminOrdersLoading() {
  return <AdminTableSkeleton title="Orders" columnsCount={6} rowsCount={10} />;
}

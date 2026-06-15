import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

export default function Loading() {
  return <AdminTableSkeleton title="User Management" columnsCount={4} rowsCount={10} />;
}

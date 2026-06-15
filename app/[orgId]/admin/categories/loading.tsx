import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

export default function Loading() {
  return <AdminTableSkeleton title="Categories" columnsCount={4} rowsCount={10} />;
}

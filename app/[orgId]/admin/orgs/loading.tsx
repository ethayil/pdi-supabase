import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

export default function Loading() {
  return <AdminTableSkeleton title="Organizations" columnsCount={5} rowsCount={10} />;
}

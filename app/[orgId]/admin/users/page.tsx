import * as motion from "motion/react-client";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { DashboardHeader } from "@/components/dashboard-header";
import ManageUserDialog from "@/components/user/manage-user-dialog";
import { TableWrapper } from "@/components/user/user-table-wrapper";
import { getUsers } from "@/data/users";
import { loadUserParams } from "@/lib/nuqs/user-params";
import type { Params } from "@/types/globals";

export const metadata: Metadata = {
  title: "User | PDi",
  description: "PDi User",
};

export default async function UsersPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<SearchParams>;
}) {
  const { orgId } = await params;
  const { entriesPerPage, currentPage, userType } =
    await loadUserParams(searchParams);

  const users = await getUsers({
    orgId,
    currentPage,
    entriesPerPage,
    userType,
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <DashboardHeader title="User Management" mobileTitle="Users">
        <ManageUserDialog organizationId={orgId} />
      </DashboardHeader>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-hidden"
      >
        <TableWrapper initialData={users} />
      </motion.div>
    </div>
  );
}

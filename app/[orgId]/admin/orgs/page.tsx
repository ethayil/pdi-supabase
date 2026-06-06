import * as motion from "motion/react-client";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { DashboardHeader } from "@/components/dashboard-header";
import { OrgsTableWrapper } from "@/components/organization/orgs-table-wrapper";
import ManageOrganizationDialog from "@/components/organization/manage-organization-dialog";
import { getOrganizations } from "@/data/organizations";
import { loadOrgParams } from "@/lib/nuqs/org-params";
import type { Params } from "@/types/globals";

export const metadata: Metadata = {
  title: "Organizations | PDi",
  description: "PDi Organizations",
};

export default async function OrganizationsPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<SearchParams>;
}) {
  const { orgId } = await params;
  const { isActive, query, entriesPerPage, currentPage } = await loadOrgParams(
    searchParams,
  );

  const orgs = await getOrganizations({
    isActive,
    query,
    entriesPerPage,
    currentPage,
  });

  return (
    <>
      <DashboardHeader
        title="Organization Management"
        mobileTitle="Organizations"
      >
        <ManageOrganizationDialog organizationId={orgId} />
      </DashboardHeader>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-hidden"
      >
        <OrgsTableWrapper initialData={orgs} />
      </motion.div>
    </>
  );
}

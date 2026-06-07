import * as motion from "motion/react-client";
import type { Metadata } from "next";
import { createLoader, type SearchParams } from "nuqs/server";
import { CategoriesTableWrapper } from "@/components/category/categories-table-wrapper";
import ManageCategoryDialog from "@/components/category/manage-category-dialog";
import { DashboardHeader } from "@/components/dashboard-header";
import { getCategories } from "@/data/categories";
import { commonParsers, commonUrlKeys } from "@/lib/nuqs/global-params";
import type { Params } from "@/types/globals";

export const metadata: Metadata = {
  title: "Categories | PDi",
  description: "PDi Categories",
};

const loadCategoryParams = createLoader(commonParsers, {
  urlKeys: commonUrlKeys,
});

export default async function CategoriesPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<SearchParams>;
}) {
  const { orgId } = await params;
  const { currentPage, entriesPerPage, query } =
    await loadCategoryParams(searchParams);

  const initialData = await getCategories({
    orgId,
    currentPage,
    entriesPerPage,
    query: query || undefined,
  });

  return (
    <>
      <DashboardHeader title="Categories Management">
        <ManageCategoryDialog organizationId={orgId} />
      </DashboardHeader>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-hidden"
      >
        <CategoriesTableWrapper initialData={initialData} />
      </motion.div>
    </>
  );
}

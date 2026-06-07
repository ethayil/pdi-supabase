import * as motion from "motion/react-client";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { DashboardHeader } from "@/components/dashboard-header";
import BulkProductUpload from "@/components/product/bulk-product-upload";
import ManageProductDialog from "@/components/product/manage-product-dialog";
import { ProductsTableWrapper } from "@/components/product/products-table-wrapper";
import { getProducts } from "@/data/products";
import { loadProductParams } from "@/lib/nuqs/product-params";
import prisma from "@/lib/prisma";
import type { Params } from "@/types/globals";

export const metadata: Metadata = {
  title: "Products | PDi",
  description: "PDi Products",
};

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<SearchParams>;
}) {
  const { orgId } = await params;
  const { currentPage, entriesPerPage, query, categoryId, stockStatus } =
    await loadProductParams(searchParams);

  // Fetch initial products with filters
  const initialData = await getProducts({
    orgId,
    currentPage,
    entriesPerPage,
    categoryId: categoryId === "all" ? undefined : categoryId,
    search: query || undefined,
    stockStatus,
  });

  // Fetch all categories for filter dropdown & dialog dropdown directly via Prisma
  const categories = await prisma.category.findMany({
    where: { orgId },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <DashboardHeader title="Products Management" mobileTitle="Products">
        <BulkProductUpload organizationId={orgId} />
        <ManageProductDialog organizationId={orgId} categories={categories} />
      </DashboardHeader>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-hidden"
      >
        <ProductsTableWrapper
          organizationId={orgId}
          initialData={initialData}
          categories={categories}
        />
      </motion.div>
    </>
  );
}

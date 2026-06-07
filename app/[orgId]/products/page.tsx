import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { ProductsCatalogWrapper } from "@/components/product/products-catalog-wrapper";
import { getCartItems } from "@/data/cart";
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
  const { currentPage, query, categoryId } =
    await loadProductParams(searchParams);

  // Fetch initial products with filters (active only for customer grid)
  const initialData = await getProducts({
    orgId,
    currentPage,
    entriesPerPage: 12,
    categoryId: categoryId === "all" ? undefined : categoryId,
    search: query || undefined,
    stockStatus: "active",
  });

  // Fetch all active categories
  const categories = await prisma.category.findMany({
    where: { orgId, isActive: true },
    orderBy: { name: "asc" },
  });

  // Fetch cart items
  const cartItems = await getCartItems({ orgId });

  return (
    <ProductsCatalogWrapper
      organizationId={orgId}
      initialData={initialData}
      categories={categories}
      cartItems={cartItems}
      selectedCategoryId={categoryId}
    />
  );
}

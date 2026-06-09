import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { ProductsCatalogWrapper } from "@/components/product/products-catalog-wrapper";
import { getCartItems } from "@/data/cart";
import { getActiveCategories } from "@/data/categories";
import { getProducts } from "@/data/products";
import { loadProductParams } from "@/lib/nuqs/product-params";
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

  const initialData = await getProducts({
    orgId,
    currentPage,
    entriesPerPage: 12,
    categoryId: categoryId === "all" ? undefined : categoryId,
    search: query || undefined,
    stockStatus: "active",
  });

  const categories = await getActiveCategories({ orgId });

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

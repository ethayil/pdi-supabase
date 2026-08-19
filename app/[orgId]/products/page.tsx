import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { ProductsCatalogWrapper } from "@/components/product/products-catalog-wrapper";
import { getCartItems } from "@/data/cart";
import { getCategories } from "@/data/categories";
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

  const initialDataPromise = getProducts({
    orgId,
    currentPage,
    entriesPerPage: 12,
    categoryId: categoryId === "all" ? undefined : categoryId,
    search: query || undefined,
    stockStatus: "active",
  });

  const categoriesPromise = getCategories({
    orgId,
    isActive: true,
    entriesPerPage: 1000,
  }).then((res) => res.data);

  const cartItemsPromise = getCartItems({ orgId });

  return (
    <ProductsCatalogWrapper
      organizationId={orgId}
      initialDataPromise={initialDataPromise}
      categoriesPromise={categoriesPromise}
      cartItemsPromise={cartItemsPromise}
      selectedCategoryId={categoryId}
    />
  );
}

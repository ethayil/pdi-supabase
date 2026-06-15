"use client";

import { Suspense, useTransition } from "react";
import type { Category, Product } from "@/app/generated/prisma/client";
import { DashboardHeader } from "@/components/dashboard-header";
import { Skeleton } from "@/components/ui/skeleton";
import CartSheet, { type CartItemData } from "./cart-sheet";
import { ProductFilters } from "./product-filters";
import { ProductGrid } from "./product-grid";
import { ProductGridSkeleton } from "./product-grid-skeleton";
import { ProductSearch } from "./product-search";

type ProductWithCategory = Product & {
  category: Category | null;
};

interface ProductsCatalogWrapperProps {
  organizationId: string;
  initialDataPromise: Promise<{
    success: boolean;
    data: ProductWithCategory[];
    totalPages: number;
    totalCount: number;
  }>;
  categoriesPromise: Promise<Category[]>;
  cartItemsPromise: Promise<CartItemData[]>;
  selectedCategoryId: string;
}

export function ProductsCatalogWrapper({
  organizationId,
  initialDataPromise,
  categoriesPromise,
  cartItemsPromise,
  selectedCategoryId,
}: ProductsCatalogWrapperProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <DashboardHeader title="Products" sticky>
        <div className="flex gap-2">
          <ProductSearch startTransition={startTransition} />
          <Suspense
            fallback={
              <Skeleton className="h-9 w-36 md:w-[180px] rounded-md animate-pulse" />
            }
          >
            <ProductFilters
              categoriesPromise={categoriesPromise}
              selectedCategoryId={selectedCategoryId}
              startTransition={startTransition}
            />
          </Suspense>
        </div>
      </DashboardHeader>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductGrid
          initialDataPromise={initialDataPromise}
          cartItemsPromise={cartItemsPromise}
          isPending={isPending}
          startTransition={startTransition}
        />
      </Suspense>
      <div className="fixed right-2 bottom-14">
        <Suspense fallback={null}>
          <CartSheet
            organizationId={organizationId}
            cartItemsPromise={cartItemsPromise}
          />
        </Suspense>
      </div>
    </>
  );
}

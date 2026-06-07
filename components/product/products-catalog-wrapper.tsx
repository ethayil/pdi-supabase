"use client";

import { useTransition } from "react";
import type { Category, Product } from "@/app/generated/prisma/client";
import { DashboardHeader } from "@/components/dashboard-header";
import CartSheet, { type CartItemData } from "./cart-sheet";
import { ProductFilters } from "./product-filters";
import { ProductGrid } from "./product-grid";
import { ProductSearch } from "./product-search";

type ProductWithCategory = Product & {
  category: Category | null;
};

interface ProductsCatalogWrapperProps {
  organizationId: string;
  initialData: {
    success: boolean;
    data: ProductWithCategory[];
    totalPages: number;
    totalCount: number;
  };
  categories: Category[];
  cartItems: CartItemData[];
  selectedCategoryId: string;
}

export function ProductsCatalogWrapper({
  organizationId,
  initialData,
  categories,
  cartItems,
  selectedCategoryId,
}: ProductsCatalogWrapperProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <DashboardHeader title="Products" sticky>
        <div className="flex gap-2">
          <ProductSearch startTransition={startTransition} />
          <ProductFilters
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            startTransition={startTransition}
          />
        </div>
      </DashboardHeader>
      <ProductGrid
        initialData={initialData}
        cartItems={cartItems}
        isPending={isPending}
        startTransition={startTransition}
      />
      <div className="fixed right-2 bottom-14">
        <CartSheet organizationId={organizationId} cartItems={cartItems} />
      </div>
    </>
  );
}

"use client";

import { Box } from "lucide-react";
import { AnimatePresence, motion as m } from "motion/react";
import * as motion from "motion/react-client";
import type { Category, Product } from "@/app/generated/prisma/client";
import { PaginationMain } from "@/components/ui/pagination-main";
import { useProductParams } from "@/lib/nuqs/product-params";
import type { CartItemData } from "./cart-sheet";
import { ProductCard } from "./product-card";

type ProductWithCategory = Product & {
  category: Category | null;
};

interface ProductGridProps {
  initialData: {
    success: boolean;
    data: ProductWithCategory[];
    totalPages: number;
    totalCount: number;
  };
  cartItems?: CartItemData[];
  isPending?: boolean;
  startTransition?: React.TransitionStartFunction;
}

export function ProductGrid({
  initialData,
  cartItems = [],
  isPending = false,
  startTransition,
}: ProductGridProps) {
  const [{ currentPage }] = useProductParams();

  const products = initialData?.data ?? [];
  const totalPages = initialData?.totalPages ?? 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      <AnimatePresence>
        {isPending && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 h-1 z-30 pointer-events-none bg-primary/10 overflow-hidden"
          >
            <m.div
              className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: "easeInOut",
              }}
            />
          </m.div>
        )}
      </AnimatePresence>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-4 flex-1">
          <Box className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">No products found</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Adjust your filters to find what you need
          </p>
        </div>
      ) : (
        <>
          <main className="flex-1 space-y-2 md:space-y-4 p-2 md:p-4">
            <div className="flex flex-col gap-6 pb-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4"
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <ProductCard product={product} cartItems={cartItems} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </main>
          <PaginationMain
            hasNextPage={hasNextPage}
            startTransition={startTransition}
          />
        </>
      )}
    </div>
  );
}

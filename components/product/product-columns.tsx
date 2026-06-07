"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import type { Category, Product } from "@/app/generated/prisma/client";
import TableEditAction from "@/components/data-table/table-edit-action";
import { ImageZoom } from "@/components/ui/image-zoom";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

export type ProductWithCategory = Product & {
  category: Category | null;
};

export function createColumns(
  lowStockThreshold: number = 50,
): ColumnDef<ProductWithCategory>[] {
  return [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => <ProductCell product={row.original} />,
    },
    {
      accessorKey: "category.name",
      header: "Category",
    },
    {
      accessorKey: "quantity",
      header: "Stock",
      cell: ({ row }) => {
        const qty = row.original.quantity;
        const isOutOfStock = qty === 0;
        const isLowStock = qty > 0 && qty <= lowStockThreshold;

        const status = isOutOfStock
          ? "out_of_stock"
          : isLowStock
            ? "low_stock"
            : "active";

        return (
          <div className="flex items-center gap-2">
            <span className="font-semibold tabular-nums text-sm">{qty}</span>
            {(isOutOfStock || isLowStock) && <StatusBadge status={status} />}
          </div>
        );
      },
    },
    {
      accessorKey: "weight",
      header: "Weight (gm)",
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return <StatusBadge status={isActive ? "active" : "inactive"} />;
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => (
        <TableEditAction type="product" id={row.original.id} />
      ),
    },
  ];
}

const ProductCell = ({ product }: { product: Product }) => {
  return (
    <div className="flex gap-2 items-center min-w-0">
      <div className="shrink-0">
        <ImageZoom isDisabled={!product?.imgUrl}>
          <Image
            src={product?.imgUrl || "/placeholder.svg"}
            alt={product?.name ?? ""}
            width={560}
            height={560}
            className={cn(
              "rounded aspect-square size-12",
              !product?.imgUrl && "border cursor-auto!",
            )}
          />
        </ImageZoom>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium cursor-default">{product.name}</p>
        <p className="text-xs text-muted-foreground truncate">{product.sku}</p>
      </div>
    </div>
  );
};

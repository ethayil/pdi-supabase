"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ProductMovement } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProductMovements } from "@/data/logging";
import { formattedDate } from "@/utils/formatted-date";

type EnrichedMovement = ProductMovement & {
  userName: string | null;
  userEmail: string | null;
};

export function StockMovementHistory({ productId }: { productId: string }) {
  const [movements, setMovements] = useState<EnrichedMovement[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    setIsLoading(true);
    getProductMovements({ productId })
      .then((res) => {
        if (res.success && res.data) {
          setMovements(res.data as EnrichedMovement[]);
        } else {
          toast.error(res.error || "Failed to load stock movements");
        }
      })
      .catch((error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load stock movements",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [productId]);

  if (isLoading || movements === null) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No movement history found for this product.
      </div>
    );
  }

  return (
    <div className="p-0 max-h-[75dvh] relative overflow-y-auto">
      <Table className="relative">
        <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
          <TableRow index={0}>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Change</TableHead>
            <TableHead className="text-right">After</TableHead>
            <TableHead>Reason / Source</TableHead>
            <TableHead>User</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((m, i) => (
            <TableRow key={m.id} index={i + 1}>
              <TableCell className="text-xs whitespace-nowrap">
                {formattedDate(m.createdAt)}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="capitalize text-[10px] px-1 h-5"
                >
                  {m.movementType}
                </Badge>
              </TableCell>
              <TableCell
                className={`text-right font-medium ${
                  m.quantityChange > 0
                    ? "text-green-600"
                    : m.quantityChange < 0
                      ? "text-red-600"
                      : ""
                }`}
              >
                {m.quantityChange > 0 ? "+" : ""}
                {m.quantityChange}
              </TableCell>
              <TableCell className="text-right">{m.quantityAfter}</TableCell>
              <TableCell
                className="max-w-[200px] truncate"
                title={m.reason ?? undefined}
              >
                <div className="flex flex-col">
                  <span className="text-sm truncate">{m.reason || "N/A"}</span>
                  {m.systemSource && (
                    <span className="text-[10px] text-muted-foreground">
                      Source: {m.systemSource}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-xs max-w-[120px] truncate">
                {m.userName || m.systemSource || "System"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

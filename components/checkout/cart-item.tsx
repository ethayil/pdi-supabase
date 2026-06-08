"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type {
  CartItem,
  Category,
  Product,
} from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { removeFromCart, updateCartQuantity } from "@/data/cart";
import { useDebounce } from "@/hooks/use-debounce";
import { weightFormat } from "@/utils/weight-format";

type ProductWithCategory = Product & {
  category: Category | null;
};

interface CartItemProps {
  item: CartItem & {
    product: ProductWithCategory;
  };
}

export function CartItemCard({ item }: CartItemProps) {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [prevItemQuantity, setPrevItemQuantity] = useState(item.quantity);

  if (item.quantity !== prevItemQuantity) {
    setLocalQuantity(item.quantity);
    setPrevItemQuantity(item.quantity);
  }

  const debouncedQuantity = useDebounce(localQuantity, 500);

  // Update DB when debounced value changes
  useEffect(() => {
    if (debouncedQuantity !== item.quantity) {
      updateCartQuantity({ id: item.id, quantity: debouncedQuantity }).catch(
        (err) => {
          toast.error(err.message || "Failed to update quantity");
          setLocalQuantity(item.quantity);
        },
      );
    }
  }, [debouncedQuantity, item.id, item.quantity]);

  const handleIncrement = () => {
    if (localQuantity < item.product.quantity) {
      setLocalQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (localQuantity > 1) {
      setLocalQuantity((prev) => prev - 1);
    }
  };

  const handleDelete = async () => {
    try {
      await removeFromCart({ id: item.id });
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove item",
      );
    }
  };

  return (
    <Card className="p-0 hover:bg-muted/60 transition-colors">
      <CardContent className="p-0">
        <div className="flex gap-3 rounded-l-lg overflow-hidden">
          <Image
            src={item.product.imgUrl || "/placeholder.svg"}
            alt={item.product.name}
            width={60}
            height={60}
            className="rounded-l-lg object-cover shrink-0 size-auto"
          />
          <div className="flex-1 min-w-0 space-y-2 p-2">
            <div className="flex justify-between items-start gap-2">
              <div className="w-full">
                <h3 className="font-medium text-sm truncate w-54">
                  {item.product.name}
                </h3>
                <div className="text-xs text-muted-foreground flex items-center w-full justify-between gap-2">
                  <p>SKU: {item.product.sku}</p>
                  <Badge variant="outline">
                    {weightFormat(localQuantity * item.product.weight)}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive h-6 w-6 shrink-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center border rounded-md w-fit">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    type="button"
                    onClick={handleDecrement}
                    disabled={localQuantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="px-2 py-1 text-xs font-medium min-w-8 text-center">
                    {localQuantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    type="button"
                    onClick={handleIncrement}
                    disabled={localQuantity >= item.product.quantity}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium pl-1">
                  In stock: {item.product.quantity}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

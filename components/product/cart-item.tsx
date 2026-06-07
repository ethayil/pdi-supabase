"use client";

import { MinusIcon, PlusIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Category, Product } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { removeFromCart, updateCartQuantity } from "@/data/cart";
import { useDebounce } from "@/hooks/use-debounce";
import { weightFormat } from "@/utils/weight-format";

type ProductWithCategory = Product & {
  category: Category | null;
};

interface CartItemCardProps {
  item: {
    id: string;
    productId: string;
    quantity: number;
    product: ProductWithCategory;
  };
}

export function CartItemCard({ item }: CartItemCardProps) {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [prevItemQuantity, setPrevItemQuantity] = useState(item.quantity);

  if (item.quantity !== prevItemQuantity) {
    setLocalQuantity(item.quantity);
    setPrevItemQuantity(item.quantity);
  }

  const debouncedQuantity = useDebounce(localQuantity, 500);

  useEffect(() => {
    if (debouncedQuantity !== item.quantity) {
      updateCartQuantity({ id: item.id, quantity: debouncedQuantity })
        .catch((err) => {
          toast.error(err.message || "Failed to update quantity");
          setLocalQuantity(item.quantity);
        });
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
    <div className="flex items-center gap-4 p-3 border rounded-lg bg-card">
      <div className="relative h-16 w-16 rounded overflow-hidden shrink-0">
        <Image
          src={item.product.imgUrl || "/placeholder.svg"}
          alt={item.product.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate">{item.product.name}</h4>
        <p className="text-xs text-muted-foreground">
          {weightFormat(item.product.weight)}
        </p>
        <div className="mt-2 flex flex-col gap-1">
          <ButtonGroup>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handleDecrement}
              disabled={localQuantity <= 1}
            >
              <MinusIcon className="h-3 w-3" />
            </Button>
            <ButtonGroupText>{localQuantity}</ButtonGroupText>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={handleIncrement}
              disabled={localQuantity >= item.product.quantity}
            >
              <PlusIcon className="h-3 w-3" />
            </Button>
          </ButtonGroup>
          <p className="text-[10px] text-muted-foreground font-medium pl-1">
            In stock: {item.product.quantity}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

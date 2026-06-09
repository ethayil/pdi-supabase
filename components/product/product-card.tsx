"use client";

import {
  MinusIcon,
  Package,
  PlusIcon,
  Scale,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Category, Product } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ImageZoom } from "@/components/ui/image-zoom";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { addToCart } from "@/data/cart";
import { cn } from "@/lib/utils";
import { weightFormat } from "@/utils/weight-format";

type ProductWithCategory = Product & {
  category: Category | null;
};

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
}

export function ProductCard({
  product,
  cartItems = [],
}: {
  product: ProductWithCategory;
  cartItems: CartItem[];
}) {
  // Find the item in the cart
  const cartItem = cartItems?.find((item) => item?.productId === product.id);
  // Calculate how many are already in the cart
  const quantityInCart = cartItem?.quantity ?? 0;
  // Calculate how many can still be added
  const availableQty = Math.max(product.quantity - quantityInCart, 0);

  const [cartQuantity, setCartQuantity] = useState(1);

  // Keep cartQuantity in sync with availableQty
  useEffect(() => {
    if (cartQuantity > availableQty) {
      setCartQuantity(availableQty > 0 ? availableQty : 1);
    }
  }, [availableQty, cartQuantity]);

  const handleAddToCart = async () => {
    if (cartQuantity > availableQty) {
      return toast.error(
        `Cannot add more than ${availableQty} items to your cart`,
      );
    }

    try {
      await addToCart({
        orgId: product.orgId,
        productId: product.id,
        quantity: cartQuantity,
      });
      toast.success(`${cartQuantity} x ${product.name} added to your cart`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add to cart",
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (/^\d*$/.test(input)) {
      let parsed = parseInt(input, 10);
      if (Number.isNaN(parsed) || parsed < 1) parsed = 1;
      if (parsed > availableQty) parsed = availableQty;
      setCartQuantity(parsed);
    }
  };

  const getFontSize = (name: string) => {
    if (name.length > 38) {
      return "text-xs py-1.5";
    } else if (name.length > 34) {
      return "text-sm py-1";
    } else if (name.length > 28) {
      return "text-md py-0.5";
    }
    return "text-md py-0.5";
  };

  return (
    <Card className="h-full flex flex-col p-0 gap-2 overflow-hidden group">
      <CardContent className="p-0 m-0">
        <div className="relative overflow-hidden">
          <ImageZoom>
            <Image
              src={product.imgUrl || "/placeholder.svg"}
              alt={product.name}
              width={400}
              height={500}
              className="w-full h-56 object-cover transition-transform scale-105 group-hover:scale-100"
            />
          </ImageZoom>
          <Badge className="absolute top-2 right-2" variant="secondary">
            {product.category?.name || "Unknown"}
          </Badge>
        </div>
        <div className="space-y-1.5 px-3 py-2">
          <Tooltip>
            <TooltipTrigger>
              <h3
                className={cn(
                  "truncate font-semibold text-foreground cursor-help",
                  getFontSize(product.name),
                )}
              >
                {product.name}
              </h3>
            </TooltipTrigger>
            <TooltipContent className="max-w-[280px] text-xs leading-normal">
              {product.name}
            </TooltipContent>
          </Tooltip>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Package className="size-3.5 shrink-0" />
              <span
                className={cn(
                  availableQty > 0
                    ? "text-muted-foreground"
                    : "text-destructive font-medium",
                )}
              >
                {availableQty > 0 ? `${availableQty} left` : "Out of stock"}
              </span>
              {quantityInCart > 0 && (
                <span className="text-[10px] text-muted-foreground/60">
                  ({quantityInCart} in cart)
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Scale className="size-3.5 shrink-0" />
              <span>{weightFormat(product.weight)}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-2 justify-between gap-2">
        <ButtonGroup>
          <Button
            variant="outline"
            aria-label="Search"
            onClick={() => setCartQuantity(Math.max(1, cartQuantity - 1))}
            disabled={cartQuantity <= 1 || availableQty === 0}
          >
            <MinusIcon />
          </Button>
          <Input
            placeholder="0"
            value={cartQuantity}
            onChange={handleChange}
            min={1}
            type="number"
            disabled={availableQty === 0}
            className="text-center"
          />
          <Button
            variant="outline"
            aria-label="Search"
            onClick={() =>
              setCartQuantity(Math.min(availableQty, cartQuantity + 1))
            }
            disabled={cartQuantity >= availableQty || availableQty === 0}
          >
            <PlusIcon />
          </Button>
        </ButtonGroup>

        <Button
          size="icon"
          variant="outline"
          onClick={handleAddToCart}
          disabled={availableQty === 0 || cartQuantity === 0}
        >
          <ShoppingCart className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

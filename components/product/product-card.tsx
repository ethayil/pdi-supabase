"use client";

import { MinusIcon, PlusIcon, ShoppingCart } from "lucide-react";
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
              className="w-full h-64 object-cover transition-transform scale-105 group-hover:scale-100"
            />
          </ImageZoom>
          <Badge className="absolute top-2 right-2" variant="secondary">
            {product.category?.name || "Unknown"}
          </Badge>
        </div>
        <div className="space-y-1 px-2">
          <h3 className={cn("line-clamp-1s", getFontSize(product.name))}>
            {product.name}
          </h3>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              SKU: {product.sku}
            </span>
          </div>
          <div className="flex gap-2 justify-between">
            <p
              className={cn(
                "text-sm",
                availableQty > 0
                  ? " text-muted-foreground"
                  : "text-destructive",
              )}
            >
              {availableQty > 0 ? `${availableQty} available` : "Out of stock"}
              {quantityInCart > 0 && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({quantityInCart} in cart)
                </span>
              )}
            </p>
            <p className="text-sm text-muted-foreground">
              Weight: {weightFormat(product.weight)}
            </p>
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

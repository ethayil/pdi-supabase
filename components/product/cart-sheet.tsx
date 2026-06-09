"use client";

import { ChevronRightCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Category, Product } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useRegisterAction } from "@/hooks/use-command-actions";
import { cn } from "@/lib/utils";
import { CartItemCard } from "./cart-item";

type ProductWithCategory = Product & {
  category: Category | null;
};

export interface CartItemData {
  id: string;
  productId: string;
  quantity: number;
  product: ProductWithCategory;
}

export default function CartSheet({
  organizationId,
  cartItems = [],
}: {
  organizationId: string;
  cartItems: CartItemData[];
}) {
  const [open, setOpen] = useState(false);

  useRegisterAction({
    id: "toggle-cart",
    label: "Toggle Cart",
    shortcut: "k",
    handler: () => setOpen((prev) => !prev),
    icon: ShoppingBag,
    category: "Products",
  });

  const itemCount = cartItems.length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(
          "backdrop-blur p-3 rounded-lg relative cursor-pointer transition-all hover:scale-105 duration-200 border",
          itemCount > 0
            ? "bg-primary/10 border-primary/30 text-primary shadow-lg shadow-primary/10"
            : "bg-secondary/50 border-border text-muted-foreground shadow-md",
        )}
      >
        {itemCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-xs ring-2 ring-background animate-in zoom-in-50 duration-200">
            {itemCount}
          </span>
        )}
        <ShoppingBag className="size-5" />
      </SheetTrigger>
      <SheetContent className="w-[90%] sm:w-135">
        <SheetHeader className="border-b px-4 py-5">
          <SheetTitle>Cart</SheetTitle>
          <SheetDescription className="sr-only">Cart Items</SheetDescription>
        </SheetHeader>
        {cartItems.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-6">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Your cart is empty</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Looks like you haven't added any items to your cart yet
            </p>
          </div>
        )}
        <div className="flex-1 overflow-auto px-2 space-y-2">
          {cartItems?.map((item) => (
            <CartItemCard key={item.id} item={item} />
          ))}
        </div>
        {cartItems.length > 0 && (
          <SheetFooter className="border-t p-2">
            <Link href={`/${organizationId}/checkout`} className="w-full">
              <Button className="group w-full">
                Checkout
                <ChevronRightCircle className="size-4 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

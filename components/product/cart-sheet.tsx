"use client";

import { ChevronRightCircle, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Category, Product } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="bg-secondary/50 backdrop-blur p-3 rounded-lg relative cursor-pointer shadow-lg dark:shadow-white/20 border hover:scale-105 transition-transform">
        <Badge className="absolute -top-5 ">{cartItems.length}</Badge>
        <ShoppingBag className="size-5 text-primary/80" />
      </SheetTrigger>
      <SheetContent className="w-[90%] sm:w-135">
        <SheetHeader>
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
          <SheetFooter>
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

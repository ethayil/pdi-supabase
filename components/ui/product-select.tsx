"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface ProductOption {
  _id: string;
  name: string;
  sku: string;
  imgUrl?: string;
  quantity: number;
}

interface ProductSelectProps {
  products: ProductOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ProductSelect({
  products,
  value,
  onValueChange,
  placeholder = "Select product...",
  disabled = false,
}: ProductSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedProduct = products.find((p) => p._id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="h-auto py-2 w-[99%] flex justify-between"
          >
            {selectedProduct ? (
              <div className="flex items-center gap-3 w-full">
                <div className="relative size-8 rounded-md overflow-hidden bg-muted shrink-0">
                  <Image
                    src={selectedProduct.imgUrl || "/placeholder.svg"}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="font-medium text-sm truncate max-w-[240px] md:max-w-[380px]">
                    {selectedProduct.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    SKU: {selectedProduct.sku}
                  </p>
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        }
        className=""
      />
      <PopoverContent
        className="w-(--anchor-width) max-w-[100vw] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search products..." />
          <CommandList>
            <CommandEmpty>No products found.</CommandEmpty>
            <CommandGroup>
              {products.map((product) => {
                const isOutOfStock = product.quantity <= 0;
                return (
                  <CommandItem
                    key={product._id}
                    value={`${product.name} ${product.sku}`}
                    onSelect={() => {
                      if (!isOutOfStock) {
                        onValueChange(product._id);
                        setOpen(false);
                      }
                    }}
                    disabled={isOutOfStock}
                    className={cn(
                      "flex items-center gap-3 py-2",
                      isOutOfStock && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    <div className="relative size-10 rounded-md overflow-hidden bg-muted shrink-0">
                      <Image
                        src={product.imgUrl || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {product.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        SKU: {product.sku}
                        {isOutOfStock && (
                          <span className="ml-2 text-destructive font-medium">
                            Out of stock
                          </span>
                        )}
                        {!isOutOfStock && (
                          <span className="ml-2 text-green-600">
                            {product.quantity} in stock
                          </span>
                        )}
                      </p>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        value === product._id ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

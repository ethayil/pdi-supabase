"use client";

import { Check, Edit2, Minus, Plus, Trash2, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GlowingIcon } from "@/components/ui/glowing-icon";
import { ImageZoom } from "@/components/ui/image-zoom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductOption } from "@/components/ui/product-select";
import { ProductSelect } from "@/components/ui/product-select";
import { Separator } from "@/components/ui/separator";
import type { OrderWithFullDetails } from "@/data/orders";
import { addOrderItem, removeOrderItem, updateOrderItem } from "@/data/orders";
import { getErrorMessage } from "@/lib/utils";
import { weightFormat } from "@/utils/weight-format";

interface OrderItemsSectionProps {
  order: OrderWithFullDetails;
  orgId: string;
  isAdmin?: boolean;
  /** Pre-fetched products for the org (optional; fetched lazily if not provided) */
  availableProducts?: ProductOption[];
}

export function OrderItemsSection({
  order,
  orgId,
  isAdmin = false,
  availableProducts = [],
}: OrderItemsSectionProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState(0);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newProductId, setNewProductId] = useState<string | null>(null);
  const [newQuantity, setNewQuantity] = useState(1);

  const orderItems = order.items ?? [];

  const isOrderLocked =
    order.status === "cancelled" || order.status === "returned";
  const isItemsLocked = isAdmin
    ? order.status !== "pending" && order.status !== "processing"
    : order.status !== "pending";

  const filteredAvailable = availableProducts.filter(
    (p) => !orderItems.some((item) => item.productId === p._id),
  );

  const handleUpdateQuantity = async (itemId: string) => {
    if (editQuantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    try {
      await updateOrderItem({
        orderItemId: itemId,
        orderId: order.id,
        orgId,
        quantity: editQuantity,
      });
      setEditingItemId(null);
      toast.success("Item updated");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeOrderItem({ orderItemId: itemId, orderId: order.id, orgId });
      toast.success("Item removed");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleAddItem = async () => {
    if (!newProductId) {
      toast.error("Select a product");
      return;
    }
    if (newQuantity < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }
    try {
      await addOrderItem({
        orderId: order.id,
        orgId,
        productId: newProductId,
        quantity: newQuantity,
      });
      setIsAddingItem(false);
      setNewProductId(null);
      setNewQuantity(1);
      toast.success("Item added");
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <GlowingIcon icon="PackageIcon" size="sm" color="#228dff" />
            <span className="text-sm font-semibold">Order Items</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-[10px]">
              {orderItems.length} items
            </Badge>
            {!isOrderLocked &&
              !isItemsLocked &&
              (!isEditing ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="size-3" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingItemId(null);
                  }}
                >
                  <Check className="size-3" />
                </Button>
              ))}
          </div>
        </div>
        <Separator />

        <AnimatePresence mode="sync">
          <div className="space-y-1 max-h-[60vh] 2xl:max-h-[65vh] overflow-y-auto">
            {orderItems.map((item, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2 group border p-2 rounded-md hover:bg-primary/10 transition-colors duration-300"
              >
                <div className="relative size-16 shrink-0 border rounded-xl overflow-hidden bg-muted">
                  <ImageZoom>
                    <Image
                      src={item.product?.imgUrl || "/placeholder.svg"}
                      alt={item.product?.name || "Product"}
                      width={500}
                      height={500}
                      className="object-cover size-16"
                    />
                  </ImageZoom>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-semibold text-sm truncate">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        SKU: {item.product?.sku}
                      </p>
                    </div>
                    {isEditing && editingItemId === item.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-6"
                          onClick={() =>
                            setEditQuantity(Math.max(1, editQuantity - 1))
                          }
                        >
                          <Minus className="size-3" />
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          value={editQuantity}
                          onChange={(e) =>
                            setEditQuantity(parseInt(e.target.value) || 1)
                          }
                          className="w-14 h-6 text-center text-xs"
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          className="size-6"
                          onClick={() => setEditQuantity(editQuantity + 1)}
                        >
                          <Plus className="size-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="default"
                          className="size-6"
                          onClick={() => handleUpdateQuantity(item.id)}
                        >
                          <Check className="size-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-6"
                          onClick={() => setEditingItemId(null)}
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="text-right flex items-center gap-2">
                        <div>
                          <p className="text-xs font-bold text-primary">
                            {weightFormat(
                              (item.product?.weight || 0) * item.quantity,
                            )}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {item.quantity} ×{" "}
                            {weightFormat(item.product?.weight || 0)}
                          </p>
                        </div>
                        {isEditing && (
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-6"
                              onClick={() => {
                                setEditingItemId(item.id);
                                setEditQuantity(item.quantity);
                              }}
                            >
                              <Edit2 className="size-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-6 text-destructive"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {isEditing && (
          <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
            <DialogTrigger render={<Button variant="outline" size="sm" />}>
              <Plus className="size-4 mr-2" />
              Add Item
            </DialogTrigger>
            <DialogContent className="md:min-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Item to Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Product</Label>
                  <ProductSelect
                    products={filteredAvailable}
                    value={newProductId ?? ""}
                    onValueChange={(e) => setNewProductId(e)}
                    placeholder="Select a product"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Quantity</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() =>
                        setNewQuantity(Math.max(1, newQuantity - 1))
                      }
                    >
                      <Minus className="size-4" />
                    </Button>
                    <Input
                      type="number"
                      min={1}
                      value={newQuantity}
                      onChange={(e) =>
                        setNewQuantity(parseInt(e.target.value, 2) || 1)
                      }
                      className="w-20 text-center"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setNewQuantity(newQuantity + 1)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
                <Button onClick={handleAddItem} className="w-full">
                  Add to Order
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

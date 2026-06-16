"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Order } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUninvoicedOrders } from "@/data/invoices";
import { formatCurrency } from "@/lib/utils";

interface AddOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  isPending: boolean;
  onAddOrder: (orderId: string) => Promise<void>;
}

export function AddOrderDialog({
  open,
  onOpenChange,
  organizationId,
  isPending,
  onAddOrder,
}: AddOrderDialogProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [uninvoicedOrders, setUninvoicedOrders] = useState<Order[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch uninvoiced orders when dialog opens
  useEffect(() => {
    if (open) {
      setIsLoading(true);
      setUninvoicedOrders(null);
      setSelectedOrderId(null);
      getUninvoicedOrders({ orgId: organizationId })
        .then((data) => {
          setUninvoicedOrders(data);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load uninvoiced orders");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, organizationId]);

  const handleSubmit = async () => {
    if (!selectedOrderId) {
      toast.error("Please select an order");
      return;
    }
    await onAddOrder(selectedOrderId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Order to Invoice</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label className="text-sm font-medium">Select Order</Label>
            {isLoading || !uninvoicedOrders ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : uninvoicedOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-2">
                No uninvoiced orders available
              </p>
            ) : (
              <Select
                items={uninvoicedOrders.map((order) => ({
                  value: order.id,
                  label: `${order.reference} - ${order.fullname}`,
                }))}
                value={selectedOrderId || ""}
                onValueChange={setSelectedOrderId}
                disabled={isPending}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Choose an order" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  {uninvoicedOrders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.reference} - {order.fullname} (
                      {formatCurrency(
                        (order.courierCost || 0) + (order.courierVAT || 0),
                      )}
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={isPending || !selectedOrderId}
              onClick={handleSubmit}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

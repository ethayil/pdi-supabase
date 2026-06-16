"use client";

import { addDays } from "date-fns";
import { Loader2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Order } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { createInvoice, getUninvoicedOrders } from "@/data/invoices";
import { formatCurrency } from "@/lib/utils";
import { formattedDate } from "@/utils/formatted-date";

interface CreateInvoiceDialogProps {
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInvoiceDialog({
  organizationId,
  open,
  onOpenChange,
}: CreateInvoiceDialogProps) {
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [poNumber, setPoNumber] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [uninvoicedOrders, setUninvoicedOrders] = useState<Order[] | null>(
    null,
  );
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load uninvoiced orders when dialog opens
  useEffect(() => {
    if (open) {
      setIsLoadingOrders(true);
      setUninvoicedOrders(null);
      getUninvoicedOrders({ orgId: organizationId })
        .then((orders) => {
          setUninvoicedOrders(orders);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load uninvoiced orders");
        })
        .finally(() => {
          setIsLoadingOrders(false);
        });
    }
  }, [open, organizationId]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createInvoice({
        orderIds: selectedOrders,
        orgId: organizationId,
        poNumber: poNumber || undefined,
        internalNotes: internalNotes || undefined,
        invoiceNotes: invoiceNotes || undefined,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
      });

      toast.success("Invoice created successfully");
      onOpenChange(false);
      // Reset form
      setSelectedOrders([]);
      setPoNumber("");
      setInternalNotes("");
      setInvoiceNotes("");
      setDueDate("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create invoice",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  // Calculate totals from selected orders
  const selectedOrdersData = uninvoicedOrders?.filter((order) =>
    selectedOrders.includes(order.id),
  );

  const totalCourierCost =
    selectedOrdersData?.reduce(
      (sum, order) => sum + (order.courierCost || 0),
      0,
    ) || 0;
  const totalVAT =
    selectedOrdersData?.reduce(
      (sum, order) => sum + (order.courierVAT || 0),
      0,
    ) || 0;
  const grandTotal = totalCourierCost + totalVAT;

  // Auto-calculate due date (+30 days from today)
  const defaultDueDate = addDays(new Date(), 30);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-full sm:min-w-xl md:min-w-2xl lg:min-w-3xl max-h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>
            Select orders to include in the invoice, or leave blank to create an
            invoice for DDP charges/refunds.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 flex-1 overflow-y-auto"
        >
          <div className="flex gap-2 w-full">
            {/* PO Number */}
            <div className="grid gap-2 w-full">
              <Label htmlFor="poNumber">PO Number (Optional)</Label>
              <Input
                id="poNumber"
                value={poNumber}
                disabled={isSubmitting}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="Enter PO number"
              />
            </div>

            {/* Due Date */}
            <div className="grid gap-2 w-full">
              <Label htmlFor="dueDate">
                Due Date (Default:{" "}
                {formattedDate(defaultDueDate.getTime(), "short")})
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                disabled={isSubmitting}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="Auto-calculated to +30 days"
              />
            </div>
          </div>

          {/* Select Orders */}
          <div className="grid gap-2">
            <div className="flex gap-2 items-center">
              <Label>Select Orders</Label>
              <span className="text-xs text-muted-foreground font-normal">
                Optional — leave empty for DDP charges/refunds
              </span>
            </div>
            <ScrollArea className="h-[300px] border rounded-md p-4">
              {isLoadingOrders || !uninvoicedOrders ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : uninvoicedOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No uninvoiced orders available
                </p>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="space-y-2"
                >
                  {uninvoicedOrders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md transition-colors"
                    >
                      <Checkbox
                        id={order.id}
                        checked={selectedOrders.includes(order.id)}
                        disabled={isSubmitting}
                        onCheckedChange={() => toggleOrder(order.id)}
                      />
                      <label
                        htmlFor={order.id}
                        className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        <div className="flex justify-between">
                          <span>{order.reference}</span>
                          <span className="text-muted-foreground text-xs">
                            {order.fullname}
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(
                              (order.courierCost || 0) +
                                (order.courierVAT || 0),
                            )}
                          </span>
                        </div>
                      </label>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </ScrollArea>
          </div>

          {/* Totals Preview with AnimatePresence */}
          <AnimatePresence mode="wait">
            {selectedOrders.length > 0 && (
              <motion.div
                key="totals"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-accent p-4 rounded-md space-y-1 text-sm overflow-hidden"
              >
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(totalCourierCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT:</span>
                  <span>{formatCurrency(totalVAT)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base">
                  <span>Total:</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedOrders.length} order(s) selected
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Internal Notes */}
          <div className="grid gap-2">
            <Label htmlFor="internalNotes">Internal Notes (Admin Only)</Label>
            <Textarea
              id="internalNotes"
              value={internalNotes}
              disabled={isSubmitting}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Notes for internal use only"
              rows={2}
            />
          </div>

          {/* Invoice Notes */}
          <div className="grid gap-2">
            <Label htmlFor="invoiceNotes">
              Invoice Notes (Customer Facing)
            </Label>
            <Textarea
              id="invoiceNotes"
              value={invoiceNotes}
              disabled={isSubmitting}
              onChange={(e) => setInvoiceNotes(e.target.value)}
              placeholder="Notes that will appear on the PDF invoice"
              rows={2}
            />
          </div>
        </motion.div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

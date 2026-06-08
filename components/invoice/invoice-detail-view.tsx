"use client";

import {
  BadgePoundSterlingIcon,
  Check,
  Edit2Icon,
  ExternalLink,
  FileDown,
  InfoIcon,
  Loader2,
  PackagePlus,
  PencilLine,
  Plus,
  ReceiptText,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type {
  Invoice,
  InvoiceStatus,
  Order,
  OrderItem,
  Product,
} from "@/app/generated/prisma/client";
import { DashboardHeader } from "@/components/dashboard-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  addOrderToInvoice,
  getUninvoicedOrders,
  type InvoiceWCharges,
  removeInvoiceCharge,
  removeOrderFromInvoice,
  updateInvoiceStatus,
  updateOrderInvoiceCost,
} from "@/data/invoices";
import { cn, formatCurrency } from "@/lib/utils";
import { formattedDate } from "@/utils/formatted-date";
import { weightFormat } from "@/utils/weight-format";
import { StatusBadge } from "../ui/status-badge";
import { AddChargeDialog } from "./add-charge-dialog";
import { InvoicePDF } from "./invoice-pdf";

type OrderWItem = Order & {
  orderItems?: (OrderItem & { product: Product | null })[];
};

interface InvoiceDetailViewProps {
  initialInvoiceData: {
    invoice: Invoice;
    orders: OrderWItem[];
    charges: InvoiceWCharges[];
  };
  organizationId: string;
}

export function InvoiceDetailView({
  initialInvoiceData,
  organizationId,
}: InvoiceDetailViewProps) {
  const { invoice, orders, charges } = initialInvoiceData;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [showAddCharge, setShowAddCharge] = useState(false);
  const [editingCharge, setEditingCharge] = useState<InvoiceWCharges | null>(
    null,
  );
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderToRemove, setOrderToRemove] = useState<Order | null>(null);
  const [editingInvoiceCostOrderId, setEditingInvoiceCostOrderId] = useState<
    string | null
  >(null);
  const [invoiceCostInput, setInvoiceCostInput] = useState<string>("");
  const [uninvoicedOrders, setUninvoicedOrders] = useState<Order[] | null>(
    null,
  );
  const [isLoadingUninvoiced, setIsLoadingUninvoiced] = useState(false);

  // Fetch uninvoiced orders when dialog opens
  useEffect(() => {
    if (showAddOrder) {
      setIsLoadingUninvoiced(true);
      setUninvoicedOrders(null);
      getUninvoicedOrders({ orgId: organizationId })
        .then((data) => {
          setUninvoicedOrders(data);
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load uninvoiced orders");
        })
        .finally(() => {
          setIsLoadingUninvoiced(false);
        });
    }
  }, [showAddOrder, organizationId]);

  const handleStatusChange = async (status: InvoiceStatus) => {
    startTransition(async () => {
      try {
        await updateInvoiceStatus({
          invoiceId: invoice.id,
          status,
          paidDate: status === "paid" ? Date.now() : undefined,
        });
        toast.success(`Invoice status updated to ${status}`);
        router.refresh();
      } catch (error) {
        toast.error("Failed to update status");
      }
    });
  };

  const handleGeneratePDF = async () => {
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(
        <InvoicePDF invoice={invoice} orders={orders} charges={charges} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  const handleRemoveCharge = async (chargeId: string) => {
    startTransition(async () => {
      try {
        await removeInvoiceCharge({ chargeId });
        toast.success("Charge removed");
        router.refresh();
      } catch (error) {
        toast.error("Failed to remove charge");
      }
    });
  };

  const handleAddOrder = async () => {
    if (!selectedOrderId) {
      toast.error("Please select an order");
      return;
    }
    startTransition(async () => {
      try {
        await addOrderToInvoice({
          invoiceId: invoice.id,
          orderId: selectedOrderId,
        });
        toast.success("Order added to invoice");
        setShowAddOrder(false);
        setSelectedOrderId(null);
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || "Failed to add order");
      }
    });
  };

  const handleRemoveOrder = async () => {
    if (!orderToRemove) return;
    startTransition(async () => {
      try {
        await removeOrderFromInvoice({
          invoiceId: invoice.id,
          orderId: orderToRemove.id,
        });
        toast.success("Order removed from invoice");
        setOrderToRemove(null);
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || "Failed to remove order");
      }
    });
  };

  const handleSaveInvoiceCost = async (orderId: string) => {
    const val =
      invoiceCostInput.trim() === "" ? null : parseFloat(invoiceCostInput);
    startTransition(async () => {
      try {
        await updateOrderInvoiceCost({
          orderId,
          invoiceCost: val,
        });
        toast.success("Invoice cost updated");
        setEditingInvoiceCostOrderId(null);
        router.refresh();
      } catch (error: any) {
        toast.error(error.message || "Failed to update invoice cost");
      }
    });
  };

  const statusVariants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    draft: "outline",
    sent: "secondary",
    paid: "default",
    overdue: "destructive",
    cancelled: "outline",
  };

  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "sent", label: "Sent" },
    { value: "paid", label: "Paid" },
    { value: "overdue", label: "Overdue" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <>
      <DashboardHeader title={`Invoice ${invoice.reference}`} sticky>
        <div className="flex items-center gap-3">
          {isPending && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          <Badge
            variant={statusVariants[invoice.status]}
            className="capitalize"
          >
            {invoice.status}
          </Badge>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" disabled={isPending} />}
              >
                Change Status
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {statusOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onClick={() =>
                      handleStatusChange(option.value as InvoiceStatus)
                    }
                  >
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" onClick={handleGeneratePDF}>
              <FileDown className="size-4" />
              Generate PDF
            </Button>
          </div>
        </div>
      </DashboardHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:p-4 overflow-auto">
        {/* Left Column - Orders and Charges */}
        <div className="lg:col-span-2 space-y-2">
          {/* Orders */}
          <Card className="shadow-sm">
            <CardContent className="space-y-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <PackagePlus className="size-4 text-primary" />
                  Orders ({orders.length})
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => setShowAddOrder(true)}
                >
                  <Plus className="size-4 mr-2" />
                  Add Order
                </Button>
              </CardTitle>
              <Separator />
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No orders in this invoice
                </p>
              ) : (
                <AnimatePresence mode="sync">
                  {orders.map((order, index) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex-1 border p-2 rounded-md hover:bg-primary/10 transition-colors duration-300"
                    >
                      <div className="flex justify-between items-center gap-2 w-full">
                        {/* Order info with popover */}
                        <Popover>
                          <PopoverTrigger className="flex-1 text-left cursor-pointer">
                            <p className="font-semibold text-sm truncate hover:text-primary transition-colors">
                              {order.reference}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.fullname}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.country}
                            </p>
                          </PopoverTrigger>
                          <PopoverContent side="bottom" align="start">
                            <div className="flex items-center justify-between">
                              <p className="font-semibold text-sm flex items-center gap-2">
                                {order.reference}
                                <StatusBadge status={order.status} />
                              </p>
                              <a
                                href={`/${organizationId}/admin/orders/${order.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button size="icon-sm" variant="outline">
                                  <ExternalLink className="size-3" />
                                </Button>
                              </a>
                            </div>
                            <Separator />
                            <div className="space-y-1 text-xs">
                              <PopoverOrderText
                                title="Customer"
                                text={order.fullname}
                              />
                              {order.company && (
                                <PopoverOrderText
                                  title="Company"
                                  text={order.company}
                                />
                              )}
                              <PopoverOrderText
                                title="Country"
                                text={order.country}
                              />
                              <PopoverOrderText
                                title="Delivery"
                                text={formattedDate(
                                  order.deliveryDate,
                                  "short",
                                )}
                              />
                              <PopoverOrderText
                                title="Weight"
                                text={weightFormat(order.weight)}
                              />
                              {order.courier && (
                                <PopoverOrderText
                                  title="Courier"
                                  text={order.courier}
                                />
                              )}
                              {order.trackingNumber && (
                                <PopoverOrderText
                                  title="Tracking Number"
                                  text={order.trackingNumber}
                                />
                              )}
                            </div>
                            {order.orderItems &&
                              order.orderItems.length > 0 && (
                                <>
                                  <Separator />
                                  <p className="text-[10px] uppercase font-bold text-muted-foreground">
                                    Items
                                  </p>
                                  <div className="space-y-1">
                                    {order.orderItems.map((item) => (
                                      <PopoverOrderText
                                        key={item.id}
                                        title={item.product?.name ?? "Unknown"}
                                        text={`×${item.quantity}`}
                                        xsTitle
                                      />
                                    ))}
                                  </div>
                                </>
                              )}
                          </PopoverContent>
                        </Popover>
                        <div className="flex-1">
                          {order.courier && (
                            <>
                              <p className="font-semibold text-sm truncate">
                                {order.courier}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {order.trackingNumber}
                              </p>
                              <StatusBadge status={order.status} />
                            </>
                          )}
                        </div>
                        <div className="text-right text-xs flex-1">
                          <p className="font-bold text-primary">
                            {formatCurrency(order.invoiceCost ?? 0)}
                          </p>

                          <p className="text-[10px] text-muted-foreground">
                            Cost: {formatCurrency(order.courierCost ?? 0)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            VAT: {formatCurrency(order.courierVAT ?? 0)}
                          </p>
                        </div>
                        {/* Inline Invoice Cost Edit */}
                        {editingInvoiceCostOrderId === order.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              value={invoiceCostInput}
                              disabled={isPending}
                              onChange={(e) =>
                                setInvoiceCostInput(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  handleSaveInvoiceCost(order.id);
                                if (e.key === "Escape")
                                  setEditingInvoiceCostOrderId(null);
                              }}
                              placeholder="0.00"
                              className="h-7 w-20 text-xs"
                              autoFocus
                            />
                            <Button
                              size="icon-sm"
                              variant="default"
                              disabled={isPending}
                              onClick={() => handleSaveInvoiceCost(order.id)}
                            >
                              <Check className="size-3" />
                            </Button>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              disabled={isPending}
                              onClick={() => setEditingInvoiceCostOrderId(null)}
                            >
                              <X className="size-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="icon-sm"
                            variant="outline"
                            title="Edit invoice cost"
                            disabled={isPending}
                            onClick={() => {
                              setEditingInvoiceCostOrderId(order.id);
                              setInvoiceCostInput(
                                order.invoiceCost !== undefined &&
                                  order.invoiceCost !== null
                                  ? order.invoiceCost.toString()
                                  : "",
                              );
                            }}
                          >
                            <PencilLine className="size-3" />
                          </Button>
                        )}
                        <Button
                          size="icon-sm"
                          variant="outline"
                          disabled={isPending}
                          onClick={() => setOrderToRemove(order)}
                        >
                          <Trash2 className="size-3 text-destructive" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </CardContent>
          </Card>

          {/* Charges */}
          <Card className="shadow-sm">
            <CardContent className="space-y-2">
              <CardTitle className="text-sm font-semibold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ReceiptText className="size-4 text-primary" />
                  Additional Charges ({charges.length})
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => setShowAddCharge(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Charge
                </Button>
              </CardTitle>
              <Separator />
              {charges.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No additional charges
                </p>
              ) : (
                <AnimatePresence mode="sync">
                  {charges.map((charge) => (
                    <motion.div
                      key={charge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ delay: charges.indexOf(charge) * 0.05 }}
                      className="border rounded-md p-2 flex items-center justify-between hover:bg-primary/10 transition-colors duration-300"
                    >
                      <div>
                        <Badge variant="outline" className="capitalize mb-1">
                          {charge.chargeType.replace(/_/g, " ")}
                        </Badge>
                        <p className="text-sm">{charge.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {formattedDate(charge.chargeDate, "short")}
                          {charge.order && ` • ${charge.order.reference}`}
                        </p>
                      </div>
                      <div className="text-right flex gap-2 items-center">
                        <div>
                          <p
                            className={`font-semibold ${charge.cost < 0 ? "text-destructive" : ""}`}
                          >
                            {formatCurrency(charge.cost + charge.vat)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            size="icon-sm"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => setEditingCharge(charge)}
                          >
                            <Edit2Icon className="size-3" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="outline"
                            className="text-destructive"
                            disabled={isPending}
                            onClick={() => handleRemoveCharge(charge.id)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Invoice Details */}
        <div className="space-y-2">
          {/* Invoice Info */}
          <Card className="shadow-sm">
            <CardContent className="space-y-2">
              <CardTitle className="text-sm font-semibold flex items-center  gap-2">
                <InfoIcon className="size-4 text-primary" />
                General Information
              </CardTitle>
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference:</span>
                  <span>{invoice.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice Date:</span>
                  <span>{formattedDate(invoice.invoiceDate, "short")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Packages:</span>
                  <span>{invoice.totalPackages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Weight:</span>
                  <span>{invoice.totalWeight}gm</span>
                </div>
                {invoice.poNumber && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PO Number:</span>
                    <span>{invoice.poNumber}</span>
                  </div>
                )}
                {invoice.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Due Date:</span>
                    <span>{formattedDate(invoice.dueDate, "short")}</span>
                  </div>
                )}
                {invoice.paidDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Paid Date:</span>
                    <span>{formattedDate(invoice.paidDate, "short")}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card className="shadow-sm">
            <CardContent className="space-y-2">
              <CardTitle className="text-sm font-semibold flex items-center  gap-2">
                <BadgePoundSterlingIcon className="size-4 text-primary" />
                Totals
              </CardTitle>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(invoice.subtotalCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>VAT:</span>
                  <span>{formatCurrency(invoice.vatCost)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(invoice.totalCost)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {(invoice.invoiceNotes || invoice.internalNotes) && (
            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold text-sm">Notes</h3>
                <Separator />
                {invoice.invoiceNotes && (
                  <div>
                    <p className="text-sm font-medium mb-1">Invoice Notes:</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.invoiceNotes}
                    </p>
                  </div>
                )}
                {invoice.internalNotes && (
                  <div>
                    <p className="text-sm font-medium mb-1">Internal Notes:</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.internalNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add Order Dialog */}
      <Dialog open={showAddOrder} onOpenChange={setShowAddOrder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Order to Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="text-sm font-medium">Select Order</Label>
              {isLoadingUninvoiced || !uninvoicedOrders ? (
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
                onClick={() => setShowAddOrder(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={isPending || !selectedOrderId}
                onClick={handleAddOrder}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Order Confirmation */}
      <AlertDialog
        open={!!orderToRemove}
        onOpenChange={() => setOrderToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Order from Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove order{" "}
              <strong>{orderToRemove?.reference}</strong> from this invoice? The
              invoice totals will be recalculated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={handleRemoveOrder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add/Edit Charge Dialog */}
      <AddChargeDialog
        invoiceId={invoice.id}
        organizationId={organizationId}
        open={showAddCharge || !!editingCharge}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddCharge(false);
            setEditingCharge(null);
          }
        }}
        editCharge={editingCharge}
      />
    </>
  );
}

const PopoverOrderText = ({
  title,
  text,
  xsTitle = false,
  children,
}: {
  title: string;
  text: string;
  xsTitle?: boolean;
  children?: ReactNode;
}) => {
  return (
    <div className="flex justify-between">
      <span className={cn("text-muted-foreground", xsTitle && "text-xs")}>
        {title}
      </span>
      {children ? children : <span className="font-medium">{text}</span>}
    </div>
  );
};

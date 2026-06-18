"use client";

import {
  BadgePoundSterlingIcon,
  Check,
  FileDown,
  InfoIcon,
  Loader2,
  PackagePlus,
  PencilLine,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  addOrderToInvoice,
  type InvoiceWCharges,
  removeInvoiceCharge,
  removeOrderFromInvoice,
  updateInvoiceDetails,
  updateInvoiceStatus,
  updateOrderInvoiceCost,
} from "@/data/invoices";
import { updateOrderDescription, updateOrderPoRef } from "@/data/orders";
import { formatCurrency } from "@/lib/utils";
import { useOrganizationStore } from "@/store/use-organization-store";
import { formattedDate } from "@/utils/formatted-date";
import { StatusBadge } from "../ui/status-badge";
import { AddChargeDialog } from "./add-charge-dialog";
import { AddOrderDialog } from "./add-order-dialog";
import { InvoiceChargesCard } from "./invoice-charges-card";
import { InvoicePDF } from "./invoice-pdf";
import { OrderPopoverContent } from "./order-popover-content";

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
  const [orderToRemove, setOrderToRemove] = useState<Order | null>(null);
  const [editingInvoiceCostOrderId, setEditingInvoiceCostOrderId] = useState<
    string | null
  >(null);
  const [invoiceCostInput, setInvoiceCostInput] = useState<string>("");

  const [editingDescriptionOrderId, setEditingDescriptionOrderId] = useState<
    string | null
  >(null);
  const [descriptionInput, setDescriptionInput] = useState<string>("");
  const [editingOrderPoOrderId, setEditingOrderPoOrderId] = useState<
    string | null
  >(null);
  const [orderPoInput, setOrderPoInput] = useState<string>("");
  const [editingPo, setEditingPo] = useState(false);
  const [poInput, setPoInput] = useState(invoice.poNumber || "");
  const [editingInvoiceNotes, setEditingInvoiceNotes] = useState(false);
  const [invoiceNotesInput, setInvoiceNotesInput] = useState(
    invoice.invoiceNotes || "",
  );
  const [editingInternalNotes, setEditingInternalNotes] = useState(false);
  const [internalNotesInput, setInternalNotesInput] = useState(
    invoice.internalNotes || "",
  );

  const handleSaveOrderPo = async (orderId: string) => {
    const val = orderPoInput.trim() === "" ? null : orderPoInput;
    startTransition(async () => {
      try {
        await updateOrderPoRef({
          orderId,
          poRef: val,
        });
        toast.success("Order PO Number updated");
        setEditingOrderPoOrderId(null);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update PO number",
        );
      }
    });
  };

  const handleSaveDescription = async (orderId: string) => {
    const val =
      descriptionInput.trim() === "" ? "Printed Matter" : descriptionInput;
    startTransition(async () => {
      try {
        await updateOrderDescription({
          orderId,
          description: val,
        });
        toast.success("Order description updated");
        setEditingDescriptionOrderId(null);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update description",
        );
      }
    });
  };

  const handleSavePo = async () => {
    const val = poInput.trim() === "" ? null : poInput;
    startTransition(async () => {
      try {
        await updateInvoiceDetails({
          invoiceId: invoice.id,
          poNumber: val,
        });
        toast.success("PO Number updated");
        setEditingPo(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update PO number",
        );
      }
    });
  };

  const handleSaveInvoiceNotes = async () => {
    const val = invoiceNotesInput.trim() === "" ? null : invoiceNotesInput;
    startTransition(async () => {
      try {
        await updateInvoiceDetails({
          invoiceId: invoice.id,
          invoiceNotes: val,
        });
        toast.success("Invoice notes updated");
        setEditingInvoiceNotes(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update invoice notes",
        );
      }
    });
  };

  const handleSaveInternalNotes = async () => {
    const val = internalNotesInput.trim() === "" ? null : internalNotesInput;
    startTransition(async () => {
      try {
        await updateInvoiceDetails({
          invoiceId: invoice.id,
          internalNotes: val,
        });
        toast.success("Internal notes updated");
        setEditingInternalNotes(false);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update internal notes",
        );
      }
    });
  };

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
        console.log(error);
        toast.error("Failed to update status");
      }
    });
  };

  const { organizations } = useOrganizationStore();
  const organization = organizations.find((o) => o.id === invoice.orgId);

  const handleGeneratePDF = async () => {
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(
        <InvoicePDF
          invoice={invoice}
          organization={organization || null}
          orders={orders}
          charges={charges}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.log(error);

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
        console.log(error);

        toast.error("Failed to remove charge");
      }
    });
  };

  const handleAddOrder = async (orderId: string) => {
    startTransition(async () => {
      try {
        await addOrderToInvoice({
          invoiceId: invoice.id,
          orderId,
        });
        toast.success("Order added to invoice");
        setShowAddOrder(false);
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error(
          error instanceof Error ? error.message : "Failed to add order",
        );
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
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to remove order",
        );
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
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update invoice cost",
        );
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:p-4 overflow-y-auto overflow-x-hidden">
        {/* Left Column - Orders and Charges */}
        <div className="lg:col-span-2 space-y-2">
          {/* Orders */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
          >
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
                           <div className="flex-1 text-left flex flex-col justify-start">
                             <Popover>
                               <PopoverTrigger className="text-left cursor-pointer hover:text-primary transition-colors inline-block w-fit font-semibold text-sm truncate">
                                 {order.reference}
                               </PopoverTrigger>
                               <OrderPopoverContent
                                 order={order}
                                 organizationId={organizationId}
                               />
                             </Popover>
                             <p className="text-xs text-muted-foreground">
                               {order.fullname}
                             </p>
                             <p className="text-xs text-muted-foreground">
                               {order.country}
                             </p>
                             {editingOrderPoOrderId === order.id ? (
                               <div className="flex items-center gap-1 mt-1">
                                 <span className="text-xs font-semibold text-muted-foreground mr-1">PO:</span>
                                 <Input
                                   type="text"
                                   value={orderPoInput}
                                   disabled={isPending}
                                   onChange={(e) =>
                                     setOrderPoInput(e.target.value)
                                   }
                                   onKeyDown={(e) => {
                                     if (e.key === "Enter")
                                       handleSaveOrderPo(order.id);
                                     if (e.key === "Escape")
                                       setEditingOrderPoOrderId(null);
                                   }}
                                   placeholder="None"
                                   className="h-6 w-32 text-xs"
                                   autoFocus
                                 />
                                 <Button
                                   size="icon-sm"
                                   variant="default"
                                   disabled={isPending}
                                   onClick={() =>
                                     handleSaveOrderPo(order.id)
                                   }
                                   className="h-6 w-6"
                                 >
                                   <Check className="size-3" />
                                 </Button>
                                 <Button
                                   size="icon-sm"
                                   variant="ghost"
                                   disabled={isPending}
                                   onClick={() =>
                                     setEditingOrderPoOrderId(null)
                                   }
                                   className="h-6 w-6"
                                 >
                                   <X className="size-3" />
                                 </Button>
                               </div>
                             ) : order.poRef ? (
                               <div className="flex items-center gap-1.5 mt-0.5 group/po w-fit">
                                 <p className="text-xs font-semibold text-muted-foreground">
                                   PO: {order.poRef}
                                 </p>
                                 <Button
                                   size="icon-sm"
                                   variant="ghost"
                                   title="Edit PO Number"
                                   disabled={isPending}
                                   onClick={() => {
                                     setEditingOrderPoOrderId(order.id);
                                     setOrderPoInput(order.poRef || "");
                                   }}
                                   className="h-4 w-4 opacity-0 group-hover/po:opacity-100 transition-opacity p-0 flex items-center justify-center"
                                 >
                                   <PencilLine className="size-2.5 text-muted-foreground" />
                                 </Button>
                               </div>
                             ) : (
                               <div className="flex items-center gap-1.5 mt-0.5 group/po w-fit">
                                 <p className="text-xs text-muted-foreground italic">
                                   No PO Number
                                 </p>
                                 <Button
                                   size="icon-sm"
                                   variant="ghost"
                                   title="Add PO Number"
                                   disabled={isPending}
                                   onClick={() => {
                                     setEditingOrderPoOrderId(order.id);
                                     setOrderPoInput("");
                                   }}
                                   className="h-4 w-4 opacity-0 group-hover/po:opacity-100 transition-opacity p-0 flex items-center justify-center"
                                 >
                                   <PencilLine className="size-2.5 text-muted-foreground" />
                                 </Button>
                               </div>
                             )}
                             {editingDescriptionOrderId === order.id ? (
                               <div className="flex items-center gap-1 mt-1">
                                 <span className="text-[11px] text-muted-foreground italic mr-1">Description:</span>
                                 <Input
                                   type="text"
                                   value={descriptionInput}
                                   disabled={isPending}
                                   onChange={(e) =>
                                     setDescriptionInput(e.target.value)
                                   }
                                   onKeyDown={(e) => {
                                     if (e.key === "Enter")
                                       handleSaveDescription(order.id);
                                     if (e.key === "Escape")
                                       setEditingDescriptionOrderId(null);
                                   }}
                                   placeholder="Printed Matter"
                                   className="h-6 w-32 text-xs"
                                   autoFocus
                                 />
                                 <Button
                                   size="icon-sm"
                                   variant="default"
                                   disabled={isPending}
                                   onClick={() =>
                                     handleSaveDescription(order.id)
                                   }
                                   className="h-6 w-6"
                                 >
                                   <Check className="size-3" />
                                 </Button>
                                 <Button
                                   size="icon-sm"
                                   variant="ghost"
                                   disabled={isPending}
                                   onClick={() =>
                                     setEditingDescriptionOrderId(null)
                                   }
                                   className="h-6 w-6"
                                 >
                                   <X className="size-3" />
                                 </Button>
                               </div>
                             ) : (
                               <div className="flex items-center gap-1 mt-0.5 group/desc w-fit">
                                 <p className="text-[11px] text-muted-foreground italic">
                                   Description: {order.description || "Printed Matter"}
                                 </p>
                                 <Button
                                   size="icon-sm"
                                   variant="ghost"
                                   title="Edit description"
                                   disabled={isPending}
                                   onClick={() => {
                                     setEditingDescriptionOrderId(order.id);
                                     setDescriptionInput(order.description || "Printed Matter");
                                   }}
                                   className="h-4 w-4 opacity-0 group-hover/desc:opacity-100 transition-opacity p-0 flex items-center justify-center"
                                 >
                                   <PencilLine className="size-2.5 text-muted-foreground" />
                                 </Button>
                               </div>
                             )}
                           </div>
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
                              Courier Cost:{" "}
                              {formatCurrency(order.courierCost ?? 0)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Courier VAT:{" "}
                              {formatCurrency(order.courierVAT ?? 0)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
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
                                  onClick={() =>
                                    handleSaveInvoiceCost(order.id)
                                  }
                                >
                                  <Check className="size-3" />
                                </Button>
                                <Button
                                  size="icon-sm"
                                  variant="ghost"
                                  disabled={isPending}
                                  onClick={() =>
                                    setEditingInvoiceCostOrderId(null)
                                  }
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
                              className="text-destructive"
                              disabled={isPending}
                              onClick={() => setOrderToRemove(order)}
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
          </motion.div>

          {/* Charges */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.35 }}
          >
            <InvoiceChargesCard
              charges={charges}
              isPending={isPending}
              onAddChargeClick={() => setShowAddCharge(true)}
              onEditCharge={setEditingCharge}
              onRemoveCharge={handleRemoveCharge}
            />
          </motion.div>
        </div>

        {/* Right Column - Invoice Details */}
        <div className="space-y-2">
          {/* Invoice Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
          >
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
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-muted-foreground">PO Number:</span>
                    {editingPo ? (
                      <div className="flex items-center gap-1">
                        <Input
                          type="text"
                          value={poInput}
                          disabled={isPending}
                          onChange={(e) => setPoInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSavePo();
                            if (e.key === "Escape") setEditingPo(false);
                          }}
                          className="h-7 w-40 text-xs"
                          placeholder="None"
                          autoFocus
                        />
                        <Button
                          size="icon-sm"
                          variant="default"
                          disabled={isPending}
                          onClick={handleSavePo}
                        >
                          <Check className="size-3" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          disabled={isPending}
                          onClick={() => setEditingPo(false)}
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{invoice.poNumber || "-"}</span>
                        <Button
                          size="icon-sm"
                          variant="outline"
                          title="Edit PO Number"
                          disabled={isPending}
                          onClick={() => {
                            setEditingPo(true);
                            setPoInput(invoice.poNumber || "");
                          }}
                        >
                          <PencilLine className="size-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invoice Date:</span>
                    <span>{formattedDate(invoice.invoiceDate, "short")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Total Packages:
                    </span>
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
          </motion.div>

          {/* Totals */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.3 }}
          >
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
          </motion.div>

          {/* Notes Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.4 }}
          >
            <Card className="shadow-sm">
              <CardContent className="p-4 space-y-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  Notes
                </CardTitle>
                <Separator />

                {/* Invoice Notes (Customer Facing) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Invoice Notes (Customer Facing):
                    </span>
                    {!editingInvoiceNotes && (
                      <Button
                        size="icon-sm"
                        variant="outline"
                        title="Edit Invoice Notes"
                        disabled={isPending}
                        onClick={() => {
                          setEditingInvoiceNotes(true);
                          setInvoiceNotesInput(invoice.invoiceNotes || "");
                        }}
                      >
                        <PencilLine className="size-3" />
                      </Button>
                    )}
                  </div>
                  {editingInvoiceNotes ? (
                    <div className="space-y-2 mt-1">
                      <Textarea
                        value={invoiceNotesInput}
                        disabled={isPending}
                        onChange={(e) => setInvoiceNotesInput(e.target.value)}
                        placeholder="Notes that will appear on the PDF invoice"
                        rows={3}
                        className="text-xs"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isPending}
                          onClick={() => setEditingInvoiceNotes(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          disabled={isPending}
                          onClick={handleSaveInvoiceNotes}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {invoice.invoiceNotes || "No customer-facing notes."}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Internal Notes (Admin Only) */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Internal Notes (Admin Only):
                    </span>
                    {!editingInternalNotes && (
                      <Button
                        size="icon-sm"
                        variant="outline"
                        title="Edit Internal Notes"
                        disabled={isPending}
                        onClick={() => {
                          setEditingInternalNotes(true);
                          setInternalNotesInput(invoice.internalNotes || "");
                        }}
                      >
                        <PencilLine className="size-3" />
                      </Button>
                    )}
                  </div>
                  {editingInternalNotes ? (
                    <div className="space-y-2 mt-1">
                      <Textarea
                        value={internalNotesInput}
                        disabled={isPending}
                        onChange={(e) => setInternalNotesInput(e.target.value)}
                        placeholder="Notes for internal admin use only"
                        rows={3}
                        className="text-xs"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={isPending}
                          onClick={() => setEditingInternalNotes(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          disabled={isPending}
                          onClick={handleSaveInternalNotes}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {invoice.internalNotes || "No internal notes."}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Add Order Dialog */}
      <AddOrderDialog
        open={showAddOrder}
        onOpenChange={setShowAddOrder}
        organizationId={organizationId}
        isPending={isPending}
        onAddOrder={handleAddOrder}
      />

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

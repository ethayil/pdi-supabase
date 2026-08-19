"use client";

import { Loader2, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Order } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import {
  addInvoiceCharge,
  type InvoiceWCharges,
  updateInvoiceCharge,
} from "@/data/invoices";
import { searchOrdersByRef } from "@/data/orders";
import type { InvoiceChargeType } from "@/types/globals";
import { ChargeBadge } from "./charge-badge";

const chargeTypes: { value: InvoiceChargeType; label: string }[] = [
  { value: "ddp", label: "DDP" },
  { value: "address_update", label: "Address Update" },
  { value: "redirect", label: "Redirect" },
  { value: "refund", label: "Refund" },
  { value: "other", label: "Other" },
];

export type SearchOrder = Order & {
  charges?: {
    id: string;
    chargeType: string;
    description?: string | null;
    cost?: number | null;
    vat?: number | null;
    chargeDate?: Date | string | null;
  }[];
};

interface AddChargeDialogProps {
  invoiceId: string;
  organizationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editCharge: InvoiceWCharges | null;
}

export function AddChargeDialog({
  invoiceId,
  organizationId,
  open,
  onOpenChange,
  editCharge,
}: AddChargeDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<SearchOrder | null>(null);
  const [chargeType, setChargeType] = useState<InvoiceChargeType>("ddp");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("0");
  const [vat, setVat] = useState("0");
  const [chargeDate, setChargeDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [searchResults, setSearchResults] = useState<SearchOrder[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search orders by reference
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchOrdersByRef({
          orgId: organizationId,
          searchTerm: searchTerm.trim(),
        });
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, organizationId]);

  // Load edit data
  // biome-ignore lint/correctness/useExhaustiveDependencies: False positive
  useEffect(() => {
    if (editCharge) {
      setSelectedOrder(editCharge.order || null);
      setChargeType(editCharge.chargeType as InvoiceChargeType);
      setDescription(editCharge.description);
      setCost(editCharge.cost.toString());
      setVat(editCharge.vat.toString());
      setChargeDate(
        new Date(editCharge.chargeDate).toISOString().split("T")[0],
      );
      setSearchTerm("");
    } else {
      // Reset for new charge
      setSelectedOrder(null);
      setChargeType("ddp");
      setDescription("DDP");
      setCost("0");
      setVat("0");
      setChargeDate(new Date().toISOString().split("T")[0]);
      setSearchTerm("");
    }
  }, [editCharge, open]);

  const handleSelectOrder = (order: SearchOrder | null) => {
    setSelectedOrder(order);
    setSearchTerm(""); // Clear search after selection
    if (chargeType !== "other") {
      const orderRef = order ? ` for ${order.reference}` : "";
      const label =
        chargeTypes.find((t) => t.value === chargeType)?.label || chargeType;
      setDescription(`${label}${orderRef}`);
    }
  };

  const handleSubmit = async () => {
    if (
      !editCharge &&
      chargeType === "ddp" &&
      selectedOrder &&
      selectedOrder.charges?.some((c) => c.chargeType === "ddp")
    ) {
      toast.error(`Order ${selectedOrder.reference} already has a DDP charge!`);
      return;
    }

    const parsedCost = Number.isNaN(parseFloat(cost)) ? 0 : parseFloat(cost);
    const parsedVat = Number.isNaN(parseFloat(vat)) ? 0 : parseFloat(vat);

    setIsSubmitting(true);
    try {
      const costVal =
        chargeType === "refund" ? -Math.abs(parsedCost) : parsedCost;
      const vatVal =
        chargeType === "refund" ? -Math.abs(parsedVat) : parsedVat;

      if (editCharge) {
        // Update existing charge
        await updateInvoiceCharge({
          chargeId: editCharge.id,
          chargeType: chargeType,
          description: description.trim(),
          cost: costVal,
          vat: vatVal,
          chargeDate: new Date(chargeDate).getTime(),
        });
        toast.success("Charge updated successfully");
      } else {
        // Add new charge
        await addInvoiceCharge({
          invoiceId,
          orderId: selectedOrder ? selectedOrder.id : undefined,
          chargeType: chargeType,
          description: description.trim(),
          cost: costVal,
          vat: vatVal,
          chargeDate: new Date(chargeDate).getTime(),
        });
        toast.success("Charge added successfully");
      }

      onOpenChange(false);
      // Reset form
      setSearchTerm("");
      setSelectedOrder(null);
      setChargeType("ddp");
      setDescription("DDP");
      setCost("0");
      setVat("0");
      setChargeDate(new Date().toISOString().split("T")[0]);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : editCharge
            ? "Failed to update charge"
            : "Failed to add charge",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-full sm:min-w-xl max-h-[95vh] flex flex-col">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <DialogHeader>
            <DialogTitle>{editCharge ? "Edit Charge" : "Add Charge"}</DialogTitle>
            <DialogDescription>
              {editCharge
                ? "Update the charge details"
                : "Add an additional charge to this invoice (use negative values for refunds)"}
            </DialogDescription>
          </DialogHeader>

          {/* Search Order - Only for new charges */}
          {!editCharge && (
            <div className="grid gap-2">
              <Label htmlFor="orderSearch">
                Related Order (Optional)
                <InfoTooltip text="Select an order to link this charge to or Leave empty for general charges (e.g., reimbursements)" />
              </Label>

              {/* Show selected order if one is chosen */}
              {selectedOrder ? (
                <div className="border rounded-md p-3 bg-accent/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">
                        {selectedOrder.reference}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedOrder.fullname}
                      </p>
                      <p className="text-xs text-primary">
                        {selectedOrder.country}
                      </p>
                    </div>
                    <div className="flex flex-col justify-end items-end gap-2 h-full">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setSelectedOrder(null);
                          if (chargeType !== "other") {
                            const label =
                              chargeTypes.find((t) => t.value === chargeType)
                                ?.label || chargeType;
                            setDescription(label);
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <StatusBadge
                          status={selectedOrder.status}
                          className="capitalize"
                        />
                        {(selectedOrder.charges || []).map((c) => (
                          <ChargeBadge key={c.id || c.chargeType} charge={c} />
                        ))}
                        {selectedOrder.invoiceId && (
                          <Badge variant="secondary" className="text-xs">
                            Invoiced
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="orderSearch"
                      placeholder="Search by order reference..."
                      autoFocus
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  {isSearching && (
                    <div className="flex items-center justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {searchTerm.length >= 2 && searchResults.length > 0 && (
                    <ScrollArea className="border rounded-md h-60">
                      {searchResults.map((order) => (
                        <button
                          key={order.id}
                          type="button"
                          className="w-full p-2 hover:bg-accent cursor-pointer border-b last:border-b-0 text-left"
                          onClick={() => handleSelectOrder(order)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-sm">
                                {order.reference}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {order.fullname}
                              </p>
                              <p className="text-xs text-primary">
                                {order.country}
                              </p>
                            </div>
                             <div className="flex items-center gap-1.5 flex-wrap justify-end">
                               <StatusBadge
                                 status={order.status}
                                 className="capitalize"
                               />
                               {(order.charges || []).map((c) => (
                                 <ChargeBadge key={c.id || c.chargeType} charge={c} />
                               ))}
                               {order.invoiceId && (
                                 <Badge variant="secondary" className="text-xs">
                                   Invoiced
                                 </Badge>
                               )}
                             </div>
                          </div>
                        </button>
                      ))}
                    </ScrollArea>
                  )}
                  {searchTerm.length >= 2 &&
                    !isSearching &&
                    searchResults.length === 0 && (
                      <p className="text-sm text-muted-foreground p-2 text-center">
                        No orders found
                      </p>
                    )}
                </>
              )}
            </div>
          )}

          {editCharge?.order && (
            <div className="grid gap-2">
              <Label>Related Order</Label>
              <div className="border rounded-md p-2 bg-muted">
                <p className="text-sm font-medium">
                  {editCharge.order.reference}
                </p>
                <p className="text-xs text-muted-foreground">
                  {editCharge.order.fullname}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 w-full mt-2">
            {/* Charge Type */}
            <div className="space-y-2 flex-1">
              <Label htmlFor="chargeType">Charge Type</Label>
              <Select
                items={chargeTypes}
                value={chargeType}
                onValueChange={(e) => {
                  const newType = e as InvoiceChargeType;
                  setChargeType(newType);
                  if (newType !== "other") {
                    const orderRef = selectedOrder
                      ? ` for ${selectedOrder.reference}`
                      : "";
                    const label =
                      chargeTypes.find((t) => t.value === newType)?.label ||
                      newType;
                    setDescription(`${label}${orderRef}`);
                  }
                }}
              >
                <SelectTrigger id="chargeType" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chargeTypes.map((type) => (
                    <SelectItem value={type.value} key={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Charge Date */}
            <div className="space-y-2 flex-1">
              <Label htmlFor="chargeDate">Charge Date</Label>
              <Input
                id="chargeDate"
                type="date"
                value={chargeDate}
                onChange={(e) => setChargeDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 w-full mt-2">
            {/* Cost */}
            <div className="space-y-2 flex-1">
              <Label htmlFor="cost">
                Cost
                <InfoTooltip text="Cost (negative value for refunds)" />
              </Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                onBlur={() => {
                  if (!cost.trim()) setCost("0");
                }}
                placeholder="0.00"
              />
            </div>

            {/* VAT */}
            <div className="space-y-2 flex-1">
              <Label htmlFor="vat">VAT</Label>
              <Input
                id="vat"
                type="number"
                step="0.01"
                value={vat}
                onChange={(e) => setVat(e.target.value)}
                onBlur={() => {
                  if (!vat.trim()) setVat("0");
                }}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Description */}
          {chargeType === "other" || chargeType === "refund" ? (
            <div className="space-y-2 mt-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter charge description"
                rows={2}
              />
            </div>
          ) : (
            <div className="space-y-1 mt-2">
              <Label>Description Preview</Label>
              <p className="text-sm bg-muted p-2 rounded-md border text-muted-foreground">
                {description || "—"}
              </p>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editCharge ? "Update Charge" : "Add Charge"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

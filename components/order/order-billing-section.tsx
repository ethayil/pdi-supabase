"use client";

import { CreditCard, ExternalLink, Loader2, Receipt } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getOrderInvoicingAndCharges } from "@/data/invoices";
import { authClient } from "@/lib/auth/auth-client";
import { formatCurrency } from "@/lib/utils";
import { formattedDate } from "@/utils/formatted-date";

interface OrderBillingSectionProps {
  orderId: string;
  orgId: string;
}

type OrderInvoicingData = Awaited<
  ReturnType<typeof getOrderInvoicingAndCharges>
>;

export function OrderBillingSection({
  orderId,
  orgId,
}: OrderBillingSectionProps) {
  const { data: session } = authClient.useSession();
  const isSuperAdmin = session?.user?.role === "admin";

  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OrderInvoicingData | null>(null);

  // Only visible for superadmin users
  if (!isSuperAdmin) return null;

  const handleToggleLoad = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    if (data) return; // Already fetched

    setLoading(true);
    try {
      const res = await getOrderInvoicingAndCharges({ orderId });
      setData(res);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load order billing & charges");
    } finally {
      setLoading(false);
    }
  };

  const getChargeTypeBadge = (type: string) => {
    switch (type) {
      case "ddp":
        return (
          <Badge
            variant="outline"
            className="border-amber-500/60 text-amber-600 dark:text-amber-400 font-bold text-[10px]"
          >
            DDP
          </Badge>
        );
      case "address_update":
        return (
          <Badge
            variant="outline"
            className="border-blue-500/60 text-blue-600 dark:text-blue-400 font-semibold text-[10px]"
          >
            Address Update
          </Badge>
        );
      case "redirect":
        return (
          <Badge
            variant="outline"
            className="border-purple-500/60 text-purple-600 dark:text-purple-400 font-semibold text-[10px]"
          >
            Redirect
          </Badge>
        );
      case "refund":
        return (
          <Badge
            variant="outline"
            className="border-red-500/60 text-red-600 dark:text-red-400 font-semibold text-[10px]"
          >
            Refund
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="capitalize text-[10px]">
            {type.replace("_", " ")}
          </Badge>
        );
    }
  };

  // Deduplicate all linked invoices (from order.invoice and charge.invoice)
  const linkedInvoicesMap = new Map<
    string,
    {
      id: string;
      reference: string;
      status: string;
      invoiceDate: Date | string;
      totalCost: number;
    }
  >();
  if (data?.invoice) {
    linkedInvoicesMap.set(data.invoice.id, data.invoice);
  }
  if (data?.charges) {
    for (const charge of data.charges) {
      if (charge.invoice) {
        linkedInvoicesMap.set(charge.invoice.id, charge.invoice);
      }
    }
  }
  const linkedInvoices = Array.from(linkedInvoicesMap.values());

  return (
    <Card className="shadow-sm border-dashed">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CreditCard className="size-4 text-primary" />
            Billing & Charges
            <Badge
              variant="outline"
              className="text-[9px] uppercase tracking-wider font-mono"
            >
              Admin Only
            </Badge>
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs font-medium gap-1"
            onClick={handleToggleLoad}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Receipt className="size-3.5" />
            )}
            {isOpen ? "Hide Details" : "Load Details"}
          </Button>
        </div>

        {isOpen && (
          <div className="space-y-3 pt-1">
            <Separator />

            {loading ? (
              <div className="flex items-center justify-center py-4 text-xs text-muted-foreground gap-2">
                <Loader2 className="size-4 animate-spin" />
                Fetching invoicing & charge history...
              </div>
            ) : data ? (
              <div className="space-y-3">
                {/* Linked Invoices */}
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Linked Invoices ({linkedInvoices.length})
                  </span>
                  {linkedInvoices.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      Order is not yet invoiced.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {linkedInvoices.map((inv) => (
                        <div
                          key={inv.id}
                          className="flex items-center justify-between border rounded-md p-2 bg-muted/30 text-xs"
                        >
                          <div>
                            <div className="font-semibold flex items-center gap-1.5">
                              <span>{inv.reference}</span>
                              <Badge
                                variant="outline"
                                className="capitalize text-[9px] py-0 px-1"
                              >
                                {inv.status}
                              </Badge>
                            </div>
                            <span className="text-[11px] text-muted-foreground block">
                              {formattedDate(inv.invoiceDate, "short")}
                            </span>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <span className="font-semibold">
                              {formatCurrency(inv.totalCost)}
                            </span>
                            <Button size="icon-xs" variant="ghost">
                              <Link
                                href={`/${orgId}/admin/invoices/${inv.id}`}
                                target="_blank"
                              >
                                <ExternalLink className="size-3 text-primary" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Additional Charges */}
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Tracked Charges ({data.charges.length})
                  </span>
                  {data.charges.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      No additional charges tracked for this order.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {data.charges.map((charge) => (
                        <div
                          key={charge.id}
                          className="border rounded-md p-2 text-xs flex items-center justify-between gap-2 bg-background"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {getChargeTypeBadge(charge.chargeType)}
                              <span className="font-medium truncate">
                                {charge.description}
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground block">
                              {formattedDate(charge.chargeDate, "short")}
                              {charge.invoice && (
                                <span>
                                  {" "}
                                  • Invoice: {charge.invoice.reference}
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="text-right whitespace-nowrap">
                            <span className="font-semibold block">
                              {formatCurrency(charge.cost + charge.vat)}
                            </span>
                            {charge.vat > 0 && (
                              <span className="text-[10px] text-muted-foreground block">
                                (+{formatCurrency(charge.vat)} VAT)
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

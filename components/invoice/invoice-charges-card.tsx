"use client";

import { Edit2Icon, Plus, ReceiptText, Trash2 } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { InvoiceWCharges } from "@/data/invoices";
import { formatCurrency } from "@/lib/utils";
import { formattedDate } from "@/utils/formatted-date";
import { ChargeBadge } from "./charge-badge";

interface InvoiceChargesCardProps {
  charges: InvoiceWCharges[];
  isPending: boolean;
  onAddChargeClick: () => void;
  onEditCharge: (charge: InvoiceWCharges) => void;
  onRemoveCharge: (chargeId: string) => void;
}

export function InvoiceChargesCard({
  charges,
  isPending,
  onAddChargeClick,
  onEditCharge,
  onRemoveCharge,
}: InvoiceChargesCardProps) {
  return (
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
            onClick={onAddChargeClick}
          >
            <Plus className="size-4 mr-2" />
            Add Charge
          </Button>
        </CardTitle>
        <Separator />
        {charges.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No additional charges in this invoice
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
                  <div className="mb-1">
                    <ChargeBadge charge={charge} />
                  </div>
                  <p className="text-sm font-medium">{charge.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {formattedDate(charge.chargeDate, "short")}
                    {charge.order && ` • Order: ${charge.order.reference}`}
                  </p>
                </div>
                <div className="text-right flex gap-2 items-center">
                  <div className="text-xs">
                    <p
                      className={`font-semibold ${charge.cost < 0 ? "text-destructive" : ""}`}
                    >
                      {formatCurrency(charge.cost + charge.vat)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Cost: {formatCurrency(charge.cost)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      VAT: {formatCurrency(charge.vat)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      size="icon-sm"
                      variant="outline"
                      disabled={isPending}
                      onClick={() => onEditCharge(charge)}
                    >
                      <Edit2Icon className="size-3" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="outline"
                      className="text-destructive"
                      disabled={isPending}
                      onClick={() => onRemoveCharge(charge.id)}
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
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";
import { formattedDate } from "@/utils/formatted-date";

interface ChargeBadgeProps {
  charge: {
    id?: string;
    chargeType: string;
    description?: string | null;
    cost?: number | null;
    vat?: number | null;
    chargeDate?: Date | string | null;
  };
}

export function ChargeBadge({ charge }: ChargeBadgeProps) {
  const type = charge.chargeType;
  let variantStyle = "border-gray-500/60 text-gray-600 dark:text-gray-400 font-medium";
  let label = type.replace(/_/g, " ");

  if (type === "ddp") {
    variantStyle = "border-amber-500/70 text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10";
    label = "DDP";
  } else if (type === "address_update") {
    variantStyle = "border-blue-500/70 text-blue-600 dark:text-blue-400 font-semibold bg-blue-500/10";
    label = "Address Update";
  } else if (type === "redirect") {
    variantStyle = "border-purple-500/70 text-purple-600 dark:text-purple-400 font-semibold bg-purple-500/10";
    label = "Redirect";
  } else if (type === "refund") {
    variantStyle = "border-red-500/70 text-red-600 dark:text-red-400 font-semibold bg-red-500/10";
    label = "Refund";
  }

  const rawCost = typeof charge.cost === "number" ? charge.cost : charge.cost ? Number(charge.cost) : 0;
  const rawVat = typeof charge.vat === "number" ? charge.vat : charge.vat ? Number(charge.vat) : 0;
  const cost = Number.isNaN(rawCost) ? 0 : rawCost;
  const vat = Number.isNaN(rawVat) ? 0 : rawVat;
  const total = cost + vat;

  return (
    <TooltipProvider delay={100}>
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex cursor-pointer" />}>
          <Badge
            variant="outline"
            className={`text-[9px] px-1 py-0 h-4 capitalize tracking-tight ${variantStyle}`}
          >
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs p-2 space-y-1 max-w-xs">
          <p className="font-semibold text-xs flex items-center justify-between gap-2">
            <span>{label} Charge</span>
            <span className="font-mono text-primary font-bold">{formatCurrency(total)}</span>
          </p>
          {charge.description && (
            <p className="text-[11px] text-muted-foreground">{charge.description}</p>
          )}
          <div className="text-[10px] text-muted-foreground pt-0.5 border-t border-border/40 flex justify-between gap-2">
            <span>Cost: {formatCurrency(cost)} | VAT: {formatCurrency(vat)}</span>
            {charge.chargeDate && <span>{formattedDate(charge.chargeDate, "short")}</span>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

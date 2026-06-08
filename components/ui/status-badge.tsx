"use client";

import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { TrackingStatus } from "@/app/generated/prisma/enums";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-xs px-2 font-semibold transition-all w-fit whitespace-nowrap bg-gradient-to-b border border-transparent capitalize",
  {
    variants: {
      variant: {
        pending: "from-muted to-secondary-foreground/10 text-muted-foreground",
        processing:
          "from-blue-300/10 dark:from-black to-blue-500/30 dark:to-blue-300/30 text-blue-600 dark:text-blue-400",
        on_the_way:
          "from-blue-300/10 dark:from-black to-blue-500/30 dark:to-blue-300/30 text-blue-600 dark:text-blue-400",
        shipped:
          "from-blue-300/10 dark:from-black to-blue-500/30 dark:to-blue-300/30 text-blue-600 dark:text-blue-400",
        delay:
          "from-orange-300/10 dark:from-black to-yellow-500/40 dark:to-yellow-300/20 text-yellow-600 dark:text-yellow-400",
        exception:
          "from-rose-300/10 dark:from-black to-red-400/40 dark:to-red-300/20 text-red-600 dark:text-red-400",
        returned:
          "from-rose-300/10 dark:from-black to-red-400/40 dark:to-red-300/20 text-red-600 dark:text-red-400",
        cancelled:
          "from-rose-300/10 dark:from-black to-red-400/40 dark:to-red-300/20 text-red-600 dark:text-red-400",
        collected:
          "from-green-300/10 dark:from-black to-green-400/30 dark:to-emerald-200/20 text-green-600 dark:text-green-400",
        delivered:
          "from-green-300/10 dark:from-black to-green-400/30 dark:to-emerald-200/20 text-green-600 dark:text-green-400",
        // UI Defaults
        default: "from-primary/10 to-primary/20 text-primary-foreground",
        secondary:
          "from-secondary/10 to-secondary/30 text-secondary-foreground",
        outline: "border-border bg-transparent text-foreground",
        ghost: "bg-transparent hover:bg-muted text-muted-foreground",
        // Product / inventory
        active:
          "from-green-300/10 dark:from-black to-green-400/30 dark:to-emerald-200/20 text-green-600 dark:text-green-400",
        inactive: "from-muted to-secondary-foreground/10 text-muted-foreground",
        low_stock:
          "from-orange-300/10 dark:from-black to-amber-500/40 dark:to-amber-300/20 text-amber-600 dark:text-amber-400",
        out_of_stock:
          "from-rose-300/10 dark:from-black to-red-400/40 dark:to-red-300/20 text-red-600 dark:text-red-400",
      },
    },
    defaultVariants: {
      variant: "pending",
    },
  },
);

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  status: TrackingStatus | null;
}

function StatusBadge({
  className,
  variant,
  status,
  children,
  ...props
}: StatusBadgeProps) {
  const effectiveVariant = (status?.toLowerCase() ||
    variant ||
    "pending") as VariantProps<typeof statusBadgeVariants>["variant"];

  return (
    <span
      className={cn(
        statusBadgeVariants({ variant: effectiveVariant }),
        className,
      )}
      {...props}
    >
      {children ||
        (
          status ||
          (typeof effectiveVariant === "string" ? effectiveVariant : "")
        )
          .toString()
          .replace(/_/g, " ")}
    </span>
  );
}

export { StatusBadge, statusBadgeVariants };

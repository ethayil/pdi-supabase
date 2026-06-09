"use client";

import type * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldLabel } from "@/components/ui/field";
import { cn } from "@/lib/utils";

interface CheckboxCardProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean | "mixed") => void;
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function CheckboxCard({
  checked,
  onCheckedChange,
  title,
  description,
  icon: Icon,
  disabled,
  className,
  id,
}: CheckboxCardProps) {
  return (
    <FieldLabel
      className={cn(
        "hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all duration-200 select-none",
        "border-border bg-transparent",
        "has-aria-checked:border-primary/40 has-aria-checked:bg-primary/5 dark:has-aria-checked:border-primary/30 dark:has-aria-checked:bg-primary/10",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className,
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <div className="grid gap-1.5 font-normal">
          <p className="text-sm leading-none font-medium text-foreground">
            {title}
          </p>
          {description && (
            <p className="text-muted-foreground text-sm leading-normal">
              {description}
            </p>
          )}
        </div>
      </div>
    </FieldLabel>
  );
}

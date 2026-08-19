"use client";

import { Field, FieldLabel } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export interface SwitchFieldProps {
  id: string;
  label: string;
  mobileLabel?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  labelClassName?: string;
  disabled?: boolean;
}

export function SwitchField({
  id,
  label,
  mobileLabel,
  checked,
  onCheckedChange,
  className,
  labelClassName,
  disabled = false,
}: SwitchFieldProps) {
  return (
    <FieldLabel
      htmlFor={id}
      className={cn(
        "cursor-pointer select-none rounded-lg border border-input bg-background/80 hover:bg-muted/60 transition-colors group/switch-field whitespace-nowrap shrink-0 h-8 px-2.5 flex items-center justify-between gap-2 *:data-[slot=field]:p-0 *:data-[slot=field]:w-auto",
        className,
      )}
    >
      <Field
        orientation="horizontal"
        className="flex items-center justify-between gap-2 h-full w-full"
      >
        <span
          className={cn(
            "text-xs sm:text-sm font-normal group-hover/switch-field:text-foreground transition-colors leading-none",
            labelClassName,
          )}
        >
          {mobileLabel ? (
            <>
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{mobileLabel}</span>
            </>
          ) : (
            label
          )}
        </span>
        <Switch
          id={id}
          size="sm"
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
      </Field>
    </FieldLabel>
  );
}

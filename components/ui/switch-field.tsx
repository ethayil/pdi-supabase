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
        "cursor-pointer select-none rounded-lg border bg-background/80 transition-colors hover:bg-accent/50 group/switch-field shadow-2xs whitespace-nowrap shrink-0 h-8",
        className,
      )}
    >
      <Field
        orientation="horizontal"
        className="flex items-center justify-between gap-2.5 h-full w-full"
      >
        <span
          className={cn(
            "text-xs sm:text-sm font-medium leading-none text-foreground",
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
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
      </Field>
    </FieldLabel>
  );
}

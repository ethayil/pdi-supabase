import type * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ResponsiveButtonProps extends ButtonProps {
  label?: string;
  icon?: React.ReactNode;
}

export function ResponsiveButton({
  label,
  icon,
  className,
  children,
  ...props
}: ResponsiveButtonProps) {
  return (
    <Button
      className={cn(
        "h-8 w-8 sm:w-auto p-0 sm:px-3 shrink-0 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium",
        className,
      )}
      {...props}
    >
      {icon}
      {children ? (
        <span className="hidden sm:inline">{children}</span>
      ) : (
        label && <span className="hidden sm:inline">{label}</span>
      )}
    </Button>
  );
}

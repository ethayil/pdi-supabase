import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
  email?: boolean;
}

export function Logo({
  className,
  iconClassName,
  textClassName,
  showText = true,
  email = false,
}: LogoProps) {
  return (
    <div
      className={cn("inline-flex items-center gap-2 select-none", className)}
    >
      <div
        className={cn(
          "w-8 h-8  rounded-md flex items-center justify-center shrink-0",
          email ? "bg-gray-300" : "bg-primary",
          iconClassName,
        )}
      >
        <Package className="text-primary-foreground text-xl fill-current" />
      </div>
      {showText && (
        <span
          className={cn(
            "font-bold text-xl tracking-tight text-foreground",
            textClassName,
          )}
        >
          PDi UK
        </span>
      )}
    </div>
  );
}

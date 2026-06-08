import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function OrderGridTextBox({
  title,
  value,
  size = "default",
  children,
}: {
  title: string;
  value?: string | null;
  size?: "sm" | "default";
  children?: ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase font-bold text-muted-foreground">
        {title}
      </p>
      {children ? (
        children
      ) : (
        <p className={cn("text-xs", size !== "sm" && "font-mono font-medium")}>
          {value || <span className="text-muted-foreground italic">—</span>}
        </p>
      )}
    </div>
  );
}

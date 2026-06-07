import type { LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface GlowingIconProps {
  icon: string;
  size?: "default" | "xs" | "sm" | "lg";
  color?: string;
  className?: string;
  iconClassName?: string;
  title?: string;
}

export const GlowingIcon = ({
  icon,
  size = "default",
  color = "#0ce3ff",
  className,
  iconClassName,
  title,
}: GlowingIconProps) => {
  const IconComponent =
    (LucideIcons[icon as keyof typeof LucideIcons] as LucideIcon) ||
    LucideIcons.HelpCircle;

  const sizeClass =
    size === "xs"
      ? "h-7 w-7"
      : size === "default"
        ? "h-14 w-14"
        : size === "sm"
          ? "h-10 w-10"
          : "h-20 w-20";

  const iconSizeClass =
    size === "xs"
      ? "size-3.5"
      : size === "default"
        ? "size-6"
        : size === "sm"
          ? "size-5"
          : "size-8";

  return (
    <div
      className={cn(
        "p-[4px] rounded-md bg-linear-to-t dark:bg-linear-to-b from-secondary-foreground/20 to-primary-foreground relative flex items-center gap-2",
        // sizeClass,
        className,
      )}
    >
      {/* Inner container with icon */}
      <div
        className={cn(
          "bg-primary-foreground /40 rounded-[5px] h-full w-full relative z-20 flex justify-center items-center overflow-hidden border border-white/5",
          sizeClass,
        )}
      >
        <IconComponent
          className={cn(
            "size-6 relative z-10 transition-transform group-hover:scale-110 duration-300",
            iconSizeClass,
            iconClassName,
          )}
          style={{ color }}
        />
      </div>
      {title && <p className="pr-2">{title}</p>}

      {/* Shadow/Base Glow */}
      <div className="absolute bottom-0 inset-x-0 bg-neutral-600 opacity-50 rounded-full blur-lg h-4 w-full mx-auto z-30" />
      {/* Sharp Glow Line */}
      <div
        className="absolute bottom-0 inset-x-0 bg-linear-to-r from-transparent to-transparent h-px w-[60%] mx-auto z-40"
        style={{
          backgroundImage: `linear-gradient(to right, transparent, ${color}, transparent)`,
        }}
      />

      {/* Blurred Glow Layer */}
      <div
        className="absolute bottom-0 inset-x-0 bg-linear-to-r from-transparent blur-sm to-transparent h-[8px] w-[60%] mx-auto z-40"
        style={{
          backgroundImage: `linear-gradient(to right, transparent, ${color}, transparent)`,
        }}
      />
    </div>
  );
};

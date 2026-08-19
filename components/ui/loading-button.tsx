import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Spinner } from "./spinner";

export default function LoadingButton({
  title,
  isLoading,
  stretch = false,
  type,
  className,
  children,
  ...props
}: {
  title?: string;
  isLoading: boolean;
  stretch?: boolean;
  type?: "button" | "submit" | "reset" | undefined;
  className?: string;
  children?: React.ReactNode;
} & React.ComponentPropsWithoutRef<typeof Button>) {
  return (
    <Button
      type={type}
      className={cn("transition-all", stretch && "flex-1 w-full", className)}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Spinner />}
      {title || children}
    </Button>
  );
}

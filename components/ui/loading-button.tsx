import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Spinner } from "./spinner";

export default function LoadingButton({
  title,
  isLoading,
  stretch = false,
  type,
}: {
  title: string;
  isLoading: boolean;
  stretch?: boolean;
  type?: "button" | "submit" | "reset" | undefined;
}) {
  return (
    <Button
      type={type}
      className={cn("transition-all ", stretch && "flex-1 w-full")}
      disabled={isLoading}
    >
      <Spinner className={cn(isLoading ? "scale-100" : "scale-0")} />
      {title}
    </Button>
  );
}

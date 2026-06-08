import { InfoIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const InfoTooltip = ({
  text,
  side = "right",
}: {
  text: string;
  side?: "left" | "top" | "bottom" | "right";
}) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <InfoIcon className="size-3" />
      </TooltipTrigger>
      <TooltipContent side={side}>
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  );
};

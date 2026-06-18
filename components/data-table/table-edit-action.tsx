"use client";

import { PencilIcon } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";

interface TableEditActionProps {
  type: "org" | "user" | "order" | "product" | "category" | "invoice";
  id: string;
}

export default function TableEditAction({ id, type }: TableEditActionProps) {
  const [_, setTypeId] = useQueryState(`${type}Id`, parseAsString);

  const handleClick = () => {
    setTypeId(id);
  };
  return (
    <Button size="icon" variant="outline" onClick={handleClick}>
      <PencilIcon className="size-4" />
    </Button>
  );
}

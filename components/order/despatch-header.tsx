"use client";

import { MousePointerClickIcon } from "lucide-react";
import { useState } from "react";
import type { Organization } from "@/app/generated/prisma/client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRegisterAction } from "@/hooks/use-command-actions";
import { useDespatchParams } from "@/lib/nuqs/despatch-params";

interface DespatchHeaderProps {
  organizations?: Organization[];
}

export default function DespatchHeader({
  organizations = [],
}: DespatchHeaderProps) {
  const [isOrgOpen, setIsOrgOpen] = useState(false);

  const [{ orgId }, setParams] = useDespatchParams();

  useRegisterAction({
    id: "despatch-org",
    label: "Select Organization",
    shortcut: "o",
    handler: () => setIsOrgOpen(true),
    icon: MousePointerClickIcon,
    category: "Despatch",
  });

  const organizationsWithAll = [
    { value: "all", label: "All" },
    ...organizations.map((org) => ({ value: org.id, label: org.name })),
  ];

  return (
    <div className="flex items-center gap-2">
      <Select
        items={organizationsWithAll}
        open={isOrgOpen}
        onOpenChange={setIsOrgOpen}
        onValueChange={(value) => setParams({ orgId: value, currentPage: 1 })}
        value={orgId}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Select Organization" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Organizations</SelectLabel>
            <SelectSeparator />
            {organizationsWithAll.map((org) => (
              <SelectItem key={org.value} value={org.value}>
                {org.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

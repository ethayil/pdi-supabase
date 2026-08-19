"use client";

import { MousePointerClickIcon, Plus } from "lucide-react";
import { useState } from "react";
import { ResponsiveButton } from "@/components/ui/responsive-button";
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
import { useInvoiceParams } from "@/lib/nuqs/invoice-params";
import { useOrganizationStore } from "@/store/use-organization-store";
import { CreateInvoiceDialog } from "./create-invoice-dialog";

export default function InvoicesHeader({
  organizationId,
}: {
  organizationId: string;
}) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isOrgOpen, setIsOrgOpen] = useState(false);

  const [{ orgId }, setParams] = useInvoiceParams();
  const { organizations } = useOrganizationStore();

  useRegisterAction({
    id: "invoices-org",
    label: "Select Organization",
    shortcut: "o",
    handler: () => setIsOrgOpen(true),
    icon: MousePointerClickIcon,
    category: "Invoices",
  });

  useRegisterAction({
    id: "invoices-new",
    label: "Add Invoice",
    shortcut: "n",
    handler: () => setShowCreateDialog(true),
    icon: Plus,
    category: "Invoices",
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
        value={orgId || "all"}
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

      <ResponsiveButton
        variant="default"
        label="Add Invoice"
        icon={<Plus className="size-4" />}
        onClick={() => setShowCreateDialog(true)}
      />

      <CreateInvoiceDialog
        organizationId={orgId && orgId !== "all" ? orgId : organizationId}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}

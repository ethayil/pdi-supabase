"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRegisterAction } from "@/hooks/use-command-actions";
import { CreateInvoiceDialog } from "./create-invoice-dialog";

export default function InvoicesHeader({
  organizationId,
}: {
  organizationId: string;
}) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useRegisterAction({
    id: "invoices-new",
    label: "Add Invoice",
    shortcut: "n",
    handler: () => setShowCreateDialog(true),
    icon: Plus,
    category: "Invoices",
  });

  return (
    <>
      <Button
        variant="default"
        size="sm"
        className="h-8"
        onClick={() => setShowCreateDialog(true)}
      >
        <Plus className="size-4 mr-2" />
        Add Invoice
      </Button>

      <CreateInvoiceDialog
        organizationId={organizationId}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}

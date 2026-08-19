"use client";

import { FileText, ShoppingBag } from "lucide-react";
import type { Invoice } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoicesTableWrapper } from "./invoices-table-wrapper";
import type { UninvoicedOrder } from "./uninvoiced-orders-columns";
import { UninvoicedOrdersTableWrapper } from "./uninvoiced-orders-table-wrapper";

type InvoiceWithOrderCount = Invoice & { orderCount: number };

interface InvoicesViewTabsProps {
  organizationId: string;
  uninvoicedOrders: UninvoicedOrder[];
  initialInvoicesData: {
    data: InvoiceWithOrderCount[];
    totalPages: number;
    totalCount: number;
  };
}

export function InvoicesViewTabs({
  organizationId,
  uninvoicedOrders,
  initialInvoicesData,
}: InvoicesViewTabsProps) {
  return (
    <Tabs defaultValue="pending" className="w-full h-full flex flex-col">
      <div className="px-4 pt-2 border-b flex items-center justify-between">
        <TabsList variant="line" className="h-10 gap-4">
          <TabsTrigger value="pending" className="gap-2 text-sm">
            <ShoppingBag className="size-4" />
            <span>Orders Ready to Invoice</span>
            <Badge
              variant="secondary"
              className="px-1.5 py-0 text-xs font-mono"
            >
              {uninvoicedOrders.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2 text-sm">
            <FileText className="size-4" />
            <span>Generated Invoices</span>
            <Badge variant="outline" className="px-1.5 py-0 text-xs font-mono">
              {initialInvoicesData.totalCount}
            </Badge>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="pending" className="flex-1 overflow-hidden">
        <UninvoicedOrdersTableWrapper initialOrders={uninvoicedOrders} />
      </TabsContent>

      <TabsContent value="invoices" className="flex-1 overflow-hidden">
        <InvoicesTableWrapper
          organizationId={organizationId}
          initialData={initialInvoicesData}
        />
      </TabsContent>
    </Tabs>
  );
}

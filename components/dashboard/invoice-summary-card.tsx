import * as motion from "motion/react-client";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowingIcon } from "@/components/ui/glowing-icon";
import { Separator } from "@/components/ui/separator";
import type { DashboardOrderType } from "@/data/dashboard";
import { formatCurrency } from "@/lib/utils";

export async function InvoiceSummaryCard({
  dataPromise,
  organizationId,
}: {
  dataPromise: Promise<DashboardOrderType>;
  organizationId: string;
}) {
  const data = await dataPromise;
  if (!data || !data.invoiceSummary) return null;
  const { invoiceSummary } = data;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <GlowingIcon icon="ReceiptText" size="xs" color="#8b5cf6" />
            Invoices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          {[
            {
              label: "Draft",
              value: invoiceSummary.draft,
              color: "text-muted-foreground",
            },
            {
              label: "Sent",
              value: invoiceSummary.sent,
              color: "text-blue-500",
            },
            {
              label: "Overdue",
              value: invoiceSummary.overdue,
              color: "text-red-500",
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between">
              <span className={color}>{label}</span>
              <Badge variant="secondary" className="text-[10px]">
                {value}
              </Badge>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Outstanding</span>
            <span className="text-violet-500">
              {formatCurrency(invoiceSummary.outstandingTotal)}
            </span>
          </div>
          <Button size="sm" variant="outline" className="w-full mt-1">
            <Link href={`/${organizationId}/admin/invoices`}>
              View Invoices
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

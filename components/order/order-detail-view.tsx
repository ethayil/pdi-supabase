"use client";

import { Ban, FileDown, MoreHorizontal } from "lucide-react";
import * as motion from "motion/react-client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
import { trackingStatuses } from "@/data/couriers-data";
import type { OrderWithFullDetails } from "@/data/orders";
import { updateOrder } from "@/data/orders";
import type { OrderStatus } from "@/types/globals";
import { orderStatuses } from "@/types/globals";
import { AddressSection } from "./address-section";
import { BoxLabelsPDF } from "./box-labels-pdf";
import { EmailNotificationDialog } from "./email-notification-dialog";
import { GeneralInfoSection } from "./general-info-section";
import { OrderItemsSection } from "./order-items-section";
import { OrderNotesSection } from "./order-notes-section";
import { TrackingSection } from "./tracking-section";

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: [
    "processing",
    "shipped",
    "on_the_way",
    "delay",
    "exception",
    "delivered",
    "cancelled",
    "collected",
  ],
  processing: [
    "shipped",
    "on_the_way",
    "delay",
    "exception",
    "delivered",
    "cancelled",
    "collected",
  ],
  shipped: [
    "on_the_way",
    "delay",
    "exception",
    "delivered",
    "returned",
    "cancelled",
  ],
  on_the_way: [
    "delay",
    "exception",
    "delivered",
    "returned",
    "cancelled",
    "shipped",
  ],
  delay: [
    "on_the_way",
    "exception",
    "delivered",
    "returned",
    "cancelled",
    "shipped",
  ],
  exception: [
    "on_the_way",
    "delay",
    "delivered",
    "returned",
    "cancelled",
    "shipped",
  ],
  delivered: ["returned"],
  cancelled: [],
  returned: [],
  collected: ["returned"],
};

function isOrderStatus(value: string): value is OrderStatus {
  return (orderStatuses as readonly string[]).includes(value);
}

export function OrderDetailView({
  order,
  orgId,
  isAdmin = false,
}: {
  order: OrderWithFullDetails;
  orgId: string;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const validNextStates = VALID_TRANSITIONS[order?.status || "pending"] || [];

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-6xl">📦</div>
            <h2 className="text-2xl font-bold">Order Not Found</h2>
            <p className="text-muted-foreground">
              The order you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Button>
              <a href={`/${orgId}/orders`}>Back to Orders</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStatusChange = (status: OrderStatus) => {
    startTransition(async () => {
      try {
        await updateOrder({ id: order.id, orgId: order.orgId, status });
        toast.success(`Order status updated to ${status}`);
        router.refresh();
      } catch {
        toast.error("Failed to update status");
      }
    });
  };

  const handlePrintLabels = async () => {
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(
        <BoxLabelsPDF
          order={order}
          organization={order.organization}
          totalPackages={order.totalPackages || 1}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <>
      <DashboardHeader title={`#${order.reference}`} sticky>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <StatusBadge status={order.status} />
          </div>
          {isAdmin && (
            <>
              <Separator
                orientation="vertical"
                className="h-6 hidden sm:block"
              />
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-background"
                      >
                        Change Status
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    {trackingStatuses.map((s) => {
                      const isDisabled =
                        !validNextStates.includes(s.value) &&
                        s.value !== order.status;
                      return (
                        <DropdownMenuItem
                          key={s.value}
                          onClick={() => {
                            if (isOrderStatus(s.value)) {
                              handleStatusChange(s.value);
                            } else {
                              toast.error(`Invalid status: ${s.value}`);
                            }
                          }}
                          className={
                            s.value === "exception" ? "text-orange-600" : ""
                          }
                          disabled={isDisabled || isPending}
                        >
                          {s.label}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                <EmailNotificationDialog
                  orderId={order.id}
                  userEmail={order.user?.email ?? order.email}
                  deliveryEmail={order.email}
                  variant="outline"
                  size="sm"
                  className="bg-background"
                />

                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="bg-background"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handlePrintLabels}>
                      <FileDown className="size-4 mr-2" />
                      Print Box Labels
                    </DropdownMenuItem>
                    <Separator className="my-1" />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleStatusChange("cancelled")}
                    >
                      <Ban className="size-4 mr-2" />
                      Cancel Order
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </DashboardHeader>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-2 flex-1 md:p-2">
        {/* Left Column - Order Items & Notes */}
        <div className="lg:col-span-2 space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
          >
            <OrderItemsSection
              order={order}
              orgId={order.orgId}
              isAdmin={isAdmin}
            />
          </motion.div>

          {/* Instructions & Notes */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.5 }}
          >
            <OrderNotesSection
              order={order}
              orgId={order.orgId}
              isAdmin={isAdmin}
            />
          </motion.div>
        </div>

        {/* Right Column - Info Sidebar */}
        <div className="space-y-4">
          {/* General Info & Weights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
          >
            <GeneralInfoSection
              order={order}
              orgId={order.orgId}
              isAdmin={isAdmin}
            />
          </motion.div>

          {/* Logistics & Tracking */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.3 }}
          >
            <TrackingSection
              order={order}
              orgId={order.orgId}
              isAdmin={isAdmin}
            />
          </motion.div>

          {/* Recipient Address */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.4 }}
          >
            <AddressSection
              order={order}
              orgId={order.orgId}
              isAdmin={isAdmin}
            />
          </motion.div>
        </div>
      </main>
    </>
  );
}

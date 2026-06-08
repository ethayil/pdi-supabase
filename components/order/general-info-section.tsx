"use client";

import { format } from "date-fns";
import { CalendarIcon, Check, Edit2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { GlowingIcon } from "@/components/ui/glowing-icon";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { OrderWithFullDetails } from "@/data/orders";
import { updateOrder } from "@/data/orders";
import { cn } from "@/lib/utils";
import { formattedDate } from "@/utils/formatted-date";
import {
  calculateShippingCost,
  getCountryZone,
  getZoneName,
} from "@/utils/tariff-utils";
import { weightFormat } from "@/utils/weight-format";
import OrderGridTextBox from "./order-grid-textbox";

interface GeneralInfoSectionProps {
  order: OrderWithFullDetails;
  orgId: string;
  isAdmin?: boolean;
}

export function GeneralInfoSection({
  order,
  orgId,
  isAdmin,
}: GeneralInfoSectionProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    externalRef: order.externalRef || "",
    poRef: order.poRef || "",
    deliveryDate: order.deliveryDate
      ? new Date(order.deliveryDate).getTime()
      : Date.now(),
    sendDate: order.sendDate
      ? new Date(order.sendDate).getTime()
      : (undefined as number | undefined),
    totalPackages: order.totalPackages || 1,
    weight: order.weight || 0,
    courierCost: order.courierCost || 0,
    courierVAT: order.courierVAT || 0,
    invoiceCost: order.invoiceCost ?? ("" as string | number),
  });

  const handleSave = async () => {
    if (!isAdmin) return;
    setIsSaving(true);
    try {
      const invoiceCostVal =
        formData.invoiceCost !== "" && formData.invoiceCost !== undefined
          ? parseFloat(formData.invoiceCost.toString())
          : undefined;
      await updateOrder({
        id: order.id,
        orgId,
        externalRef: formData.externalRef || null,
        poRef: formData.poRef || null,
        deliveryDate: formData.deliveryDate,
        sendDate: formData.sendDate || null,
        totalPackages: formData.totalPackages,
        weight: formData.weight,
        courierCost: formData.courierCost
          ? parseFloat(formData.courierCost?.toString() || "0")
          : 0,
        courierVAT: formData.courierVAT
          ? parseFloat(formData.courierVAT?.toString() || "0")
          : 0,
        invoiceCost: invoiceCostVal,
      });
      setIsEditing(false);
      toast.success("General info updated");
      router.refresh();
    } catch {
      toast.error("Failed to update general info");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAutoCalcPrice = () => {
    const zone = getCountryZone(order.country);
    const calculatedCost =
      zone > 0 && formData.weight > 0
        ? calculateShippingCost(formData.weight, zone)
        : 0;

    if (calculatedCost > 0) {
      setFormData({ ...formData, courierCost: calculatedCost });
    }
  };

  const zoneName = getZoneName(order.country);

  const originalWeight = (order.items ?? []).reduce(
    (acc, item) => acc + (item.product?.weight || 0) * item.quantity,
    0,
  );

  const isOrderLocked =
    order.status === "cancelled" || order.status === "returned";

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <GlowingIcon icon="FileTextIcon" size="sm" />
            General Info
          </h3>
          {isAdmin && !isOrderLocked && (
            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.div
                  key="edit-btn"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="size-3" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="save-btns"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex gap-2"
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        externalRef: order.externalRef || "",
                        poRef: order.poRef || "",
                        deliveryDate: order.deliveryDate
                          ? new Date(order.deliveryDate).getTime()
                          : Date.now(),
                        sendDate: order.sendDate
                          ? new Date(order.sendDate).getTime()
                          : undefined,
                        totalPackages: order.totalPackages || 1,
                        weight: order.weight || 0,
                        courierCost: order.courierCost || 0,
                        courierVAT: order.courierVAT || 0,
                        invoiceCost: order.invoiceCost ?? "",
                      });
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Check className="size-4 mr-1" /> Save
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
                className="grid grid-cols-2 gap-3"
              >
                <button type="submit" className="hidden" aria-hidden />
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    External Ref
                  </Label>
                  <Input
                    value={formData.externalRef}
                    onChange={(e) =>
                      setFormData({ ...formData, externalRef: e.target.value })
                    }
                    placeholder="External Reference"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    PO Reference
                  </Label>
                  <Input
                    value={formData.poRef}
                    onChange={(e) =>
                      setFormData({ ...formData, poRef: e.target.value })
                    }
                    placeholder="PO Reference"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Delivery Date
                  </Label>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-full justify-start font-normal text-xs h-8",
                            !formData.deliveryDate && "text-muted-foreground",
                          )}
                        />
                      }
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {formData.deliveryDate
                        ? format(formData.deliveryDate, "PPP")
                        : "Pick a date"}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={new Date(formData.deliveryDate)}
                        onSelect={(date) => {
                          if (date) {
                            const currentTime = new Date(formData.deliveryDate);
                            date.setHours(currentTime.getHours());
                            date.setMinutes(currentTime.getMinutes());
                            setFormData({
                              ...formData,
                              deliveryDate: date.getTime(),
                            });
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Send Date
                  </Label>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn(
                            "w-full justify-start font-normal text-xs h-8",
                            !formData.sendDate && "text-muted-foreground",
                          )}
                        />
                      }
                    >
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {formData.sendDate
                        ? format(formData.sendDate, "PPP")
                        : "Not set"}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          formData.sendDate
                            ? new Date(formData.sendDate)
                            : undefined
                        }
                        onSelect={(date) => {
                          setFormData({
                            ...formData,
                            sendDate: date ? date.getTime() : undefined,
                          });
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Total Packages
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.totalPackages}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        totalPackages: parseInt(e.target.value) || 1,
                      })
                    }
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Weight (gm)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        weight: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Courier Cost (£)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={formData.courierCost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        courierCost: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    VAT (£)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={formData.courierVAT}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        courierVAT: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0.00"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Invoice Cost (£)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={formData.invoiceCost}
                    onChange={(e) =>
                      setFormData({ ...formData, invoiceCost: e.target.value })
                    }
                    placeholder="0.00"
                    className="text-sm"
                  />
                </div>
                {zoneName && (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      Auto-Calc price
                      <InfoTooltip
                        text="Calculate price based on weight and country zone"
                        side="top"
                      />
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={handleAutoCalcPrice}
                    >
                      Calculate
                    </Button>
                  </div>
                )}
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="display"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3 text-sm"
            >
              <OrderGridTextBox title="Reference" value={order.reference} />
              <OrderGridTextBox
                title="External Ref"
                value={order.externalRef}
              />
              <OrderGridTextBox title="PO Reference" value={order.poRef} />
              <OrderGridTextBox
                title="Send Date"
                value={
                  order.sendDate
                    ? formattedDate(new Date(order.sendDate))
                    : "Not set"
                }
              />
              <OrderGridTextBox
                title="Delivery Date"
                value={formattedDate(new Date(order.deliveryDate))}
              />
              {isAdmin && (
                <OrderGridTextBox
                  title="Courier Cost (£)"
                  value={order.courierCost?.toFixed(2)}
                />
              )}
              {isAdmin && (
                <OrderGridTextBox
                  title="Courier VAT (£)"
                  value={order.courierVAT?.toFixed(2)}
                />
              )}
              <OrderGridTextBox
                title="Invoice Cost (£)"
                value={order.invoiceCost?.toFixed(2)}
              />
              <OrderGridTextBox
                title="Weight"
                value={weightFormat(order.weight)}
              />
              {isAdmin && (
                <OrderGridTextBox
                  title="Orig. Weight"
                  value={weightFormat(originalWeight)}
                />
              )}
              <OrderGridTextBox
                title="Total Packages"
                value={order.totalPackages?.toString() ?? "1"}
              />
              {zoneName && (
                <OrderGridTextBox title="Country Zone">
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {zoneName}
                  </Badge>
                </OrderGridTextBox>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

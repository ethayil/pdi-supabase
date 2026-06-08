"use client";

import { format } from "date-fns";
import {
  CalendarIcon,
  Check,
  Edit2,
  History,
  SendIcon,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { OrderHistory } from "@/app/generated/prisma/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlowingIcon } from "@/components/ui/glowing-icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { couriersData, trackingStatuses } from "@/data/couriers-data";
import type { OrderWithFullDetails } from "@/data/orders";
import {
  deleteOrderHistory,
  getOrderHistory,
  updateOrderHistory,
  updateOrderTracking,
} from "@/data/orders";
import { cn } from "@/lib/utils";
import { formattedDate } from "@/utils/formatted-date";
import { getTrackingUrl } from "@/utils/tracking-url";
import OrderGridTextBox from "./order-grid-textbox";

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

interface TrackingSectionProps {
  order: OrderWithFullDetails;
  orgId: string;
  isAdmin?: boolean;
}

export function TrackingSection({
  order,
  orgId,
  isAdmin = false,
}: TrackingSectionProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<OrderHistory[]>([]);
  const [formData, setFormData] = useState({
    courier: order.courier || "",
    service: order.service || "",
    trackingNumber: order.trackingNumber || "",
    status: order.status || "pending",
    signedBy: order.signedBy || "",
    message: order.trackingMessage || "",
    createdAt: Date.now(),
  });
  const [sendEmailFlag, setSendEmailFlag] = useState(false);
  const [sendNotificationFlag, setSendNotificationFlag] = useState(false);

  // History edit/delete state
  const [editingEntry, setEditingEntry] = useState<OrderHistory | null>(null);
  const [editForm, setEditForm] = useState({
    description: "",
    createdAt: Date.now(),
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const validNextStates = VALID_TRANSITIONS[order.status || "pending"] || [];

  useEffect(() => {
    if (showHistory) {
      getOrderHistory({ orderId: order.id, orgId }).then(setHistory);
    }
  }, [showHistory, order.id, orgId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateOrderTracking({
        orderId: order.id,
        orgId,
        ...formData,
      });
      setIsEditing(false);
      setSendEmailFlag(false);
      setSendNotificationFlag(false);
      toast.success("Tracking updated successfully");
      router.refresh();
    } catch {
      toast.error("Failed to update tracking");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Card className="shadow-sm overflow-hidden">
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <GlowingIcon icon="TruckIcon" size="sm" color="#f59e0b" />
              <div className="flex flex-col gap-1">
                Tracking Details
                {order.status && <StatusBadge status={order.status} />}
              </div>
            </h3>
            {isAdmin && (
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div
                    key="display-btns"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex gap-1"
                  >
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="size-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className={`size-8 ${showHistory ? "text-primary" : ""}`}
                      onClick={() => setShowHistory(!showHistory)}
                    >
                      <History className="size-3" />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="edit-btns"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex gap-2"
                  >
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditing(false)}
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
            {!isAdmin && (
              <Button
                size="icon"
                variant="ghost"
                className={`size-8 ${showHistory ? "text-primary" : ""}`}
                onClick={() => setShowHistory(!showHistory)}
              >
                <History className="size-4" />
              </Button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing-content"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                  }}
                  className="grid grid-cols-1 gap-2"
                >
                  <button type="submit" className="hidden" aria-hidden />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                        Courier
                      </Label>
                      <Select
                        items={couriersData}
                        value={formData.courier}
                        onValueChange={(val) =>
                          setFormData({
                            ...formData,
                            courier: val ?? "",
                            service: "",
                          })
                        }
                      >
                        <SelectTrigger className="text-sm w-full">
                          <SelectValue placeholder="Select Courier" />
                        </SelectTrigger>
                        <SelectContent>
                          {couriersData.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                        Service
                      </Label>
                      <Select
                        items={
                          couriersData.find((c) => c.value === formData.courier)
                            ?.services
                        }
                        value={formData.service}
                        onValueChange={(val) =>
                          setFormData({ ...formData, service: val ?? "" })
                        }
                      >
                        <SelectTrigger className="text-sm w-full">
                          <SelectValue placeholder="Select Service" />
                        </SelectTrigger>
                        <SelectContent>
                          {couriersData
                            .find((c) => c.value === formData.courier)
                            ?.services.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Tracking Number
                    </Label>
                    <Input
                      value={formData.trackingNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          trackingNumber: e.target.value,
                        })
                      }
                      placeholder="Tracking Number"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Status
                    </Label>
                    <Select
                      items={trackingStatuses}
                      value={formData.status}
                      onValueChange={(val) =>
                        setFormData({ ...formData, status: val ?? "pending" })
                      }
                    >
                      <SelectTrigger className="w-1/2">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {trackingStatuses.map((status) => {
                          const isDisabled =
                            !validNextStates.includes(status.value) &&
                            status.value !== order.status;
                          return (
                            <SelectItem
                              key={status.value}
                              value={status.value}
                              disabled={isDisabled}
                            >
                              {status.label}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {formData.status === "delivered" && (
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                          Signed By
                        </Label>
                        <Input
                          value={formData.signedBy}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              signedBy: e.target.value,
                            })
                          }
                          placeholder="Signed By Name"
                        />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Update Date & Time
                    </Label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger
                          render={
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className={cn(
                                "flex-1 justify-start text-left font-normal h-8 text-xs",
                                !formData.createdAt && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 size-3" />
                              {formData.createdAt
                                ? format(formData.createdAt, "PPP")
                                : "Pick a date"}
                            </Button>
                          }
                        />
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={new Date(formData.createdAt)}
                            onSelect={(date) => {
                              if (!date) return;
                              const currentTime = new Date(formData.createdAt);
                              date.setHours(currentTime.getHours());
                              date.setMinutes(currentTime.getMinutes());
                              setFormData({
                                ...formData,
                                createdAt: date.getTime(),
                              });
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                      <div className="relative flex-1">
                        <Input
                          type="time"
                          className="w-full pl-7 text-xs"
                          value={format(formData.createdAt, "HH:mm")}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(":");
                            const newDate = new Date(formData.createdAt);
                            newDate.setHours(parseInt(hours));
                            newDate.setMinutes(parseInt(minutes));
                            setFormData({
                              ...formData,
                              createdAt: newDate.getTime(),
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Message
                    </Label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="Add a message for this tracking update..."
                      className="text-sm min-h-15"
                    />
                  </div>
                  <div className="flex flex-col gap-3 pt-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Notifications
                    </Label>
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="notify-email"
                          checked={sendEmailFlag}
                          onCheckedChange={(checked) =>
                            setSendEmailFlag(!!checked)
                          }
                        />
                        <Label
                          htmlFor="notify-email"
                          className="text-xs font-medium cursor-pointer"
                        >
                          Notify via Email
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="notify-bell"
                          checked={sendNotificationFlag}
                          onCheckedChange={(checked) =>
                            setSendNotificationFlag(!!checked)
                          }
                        />
                        <Label
                          htmlFor="notify-bell"
                          className="text-xs font-medium cursor-pointer"
                        >
                          Desktop Notification
                        </Label>
                      </div>
                    </div>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="display-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <OrderGridTextBox
                    title="Courier"
                    value={
                      order.courier
                        ? (couriersData.find(
                            (c) =>
                              c.value === order.courier ||
                              c.label === order.courier,
                          )?.label || order.courier) +
                          (order.service
                            ? ` - ${couriersData.flatMap((c) => c.services).find((s) => s.value === order.service || s.label === order.service)?.label || order.service}`
                            : "")
                        : "Not Assigned"
                    }
                  />
                  <OrderGridTextBox
                    title="Tracking"
                    value={order.trackingNumber}
                  />
                  {order.deliveredAt && (
                    <OrderGridTextBox
                      title="Delivered At"
                      value={format(new Date(order.deliveredAt), "PPP")}
                    />
                  )}
                  {order.signedBy && (
                    <OrderGridTextBox
                      title="Signed By"
                      value={order.signedBy}
                    />
                  )}
                  {order.trackingMessage && (
                    <div className="col-span-2">
                      <OrderGridTextBox
                        title="Notes"
                        size="sm"
                        value={order.trackingMessage}
                      />
                    </div>
                  )}
                  {order.courier !== "Collect" && order.trackingNumber && (
                    <Link
                      href={
                        getTrackingUrl({
                          courier: order.courier,
                          trackingNumber: order.trackingNumber,
                          postcode: order.postcode,
                        }) || "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="hero">
                        <SendIcon /> Track Order
                      </Button>
                    </Link>
                  )}
                </div>

                <AnimatePresence>
                  {showHistory && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-2 mt-2 border-t space-y-2"
                    >
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">
                        Tracking History
                      </p>
                      <ScrollArea className="max-h-[300px] overflow-y-auto">
                        <div className="relative pl-4 space-y-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted mr-3">
                          {history
                            .filter((h) => h.changeType === "tracking_updated")
                            .map((item) => (
                              <div
                                key={item.id}
                                className="relative group/item"
                              >
                                <div className="absolute -left-4 top-1 size-2 rounded-full border-2 border-background bg-primary" />
                                <div className="flex items-start justify-between gap-2">
                                  <div className="space-y-0.5 min-w-0">
                                    <p className="text-xs font-medium">
                                      {item.description}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {formattedDate(new Date(item.createdAt))}
                                    </p>
                                  </div>
                                  {isAdmin && (
                                    <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="size-6"
                                        onClick={() => {
                                          setEditingEntry(item);
                                          setEditForm({
                                            description: item.description,
                                            createdAt: new Date(
                                              item.createdAt,
                                            ).getTime(),
                                          });
                                        }}
                                      >
                                        <Edit2 className="size-3" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="size-6 text-destructive hover:text-destructive"
                                        onClick={() => setDeletingId(item.id)}
                                      >
                                        <Trash2 className="size-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          {history.filter(
                            (h) => h.changeType === "tracking_updated",
                          ).length === 0 && (
                            <p className="text-xs text-muted-foreground italic">
                              No history recorded.
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Edit History Dialog */}
      <Dialog
        open={!!editingEntry}
        onOpenChange={(o) => !o && setEditingEntry(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tracking Entry</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                Description
              </Label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                className="text-sm min-h-[80px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                Date & Time
              </Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 justify-start text-left font-normal h-8 text-xs"
                      >
                        <CalendarIcon className="mr-2 size-3" />
                        {format(editForm.createdAt, "PPP")}
                      </Button>
                    }
                  />
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(editForm.createdAt)}
                      onSelect={(date) => {
                        if (!date) return;
                        const cur = new Date(editForm.createdAt);
                        date.setHours(cur.getHours(), cur.getMinutes());
                        setEditForm({ ...editForm, createdAt: date.getTime() });
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <div className="flex-1">
                  <Input
                    type="time"
                    className="pl-7 text-xs"
                    value={format(editForm.createdAt, "HH:mm")}
                    onChange={(e) => {
                      const [h, m] = e.target.value.split(":");
                      const d = new Date(editForm.createdAt);
                      d.setHours(parseInt(h), parseInt(m));
                      setEditForm({ ...editForm, createdAt: d.getTime() });
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingEntry(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={async () => {
                  if (!editingEntry) return;
                  try {
                    await updateOrderHistory({
                      historyId: editingEntry.id,
                      orgId,
                      description: editForm.description,
                      createdAt: editForm.createdAt,
                    });
                    toast.success("Entry updated");
                    setEditingEntry(null);
                    setHistory(
                      await getOrderHistory({ orderId: order.id, orgId }),
                    );
                  } catch {
                    toast.error("Failed to update entry");
                  }
                }}
              >
                <Check className="size-3 mr-1" /> Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete History AlertDialog */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(o) => !o && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tracking entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this tracking history entry. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deletingId) return;
                try {
                  await deleteOrderHistory({ historyId: deletingId, orgId });
                  toast.success("Entry deleted");
                  setHistory(
                    await getOrderHistory({ orderId: order.id, orgId }),
                  );
                } catch {
                  toast.error("Failed to delete entry");
                } finally {
                  setDeletingId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

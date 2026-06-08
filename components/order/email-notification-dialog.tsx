"use client";

import { Bell, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { sendOrderNotification } from "@/data/orders";
import { getErrorMessage } from "@/lib/utils";

type RecipientType = "user" | "delivery";

interface EmailNotificationDialogProps {
  orderId: string;
  userEmail: string;
  deliveryEmail: string;
  variant?: "outline" | "ghost";
  size?: "sm" | "default" | "icon-sm";
  className?: string;
}

export function EmailNotificationDialog({
  orderId,
  userEmail,
  deliveryEmail,
  variant = "outline",
  size = "sm",
  className,
}: EmailNotificationDialogProps) {
  const [open, setOpen] = useState(false);
  const [recipient, setRecipient] = useState<RecipientType>("user");
  const [sendEmailFlag, setSendEmailFlag] = useState(true);
  const [sendNotificationFlag, setSendNotificationFlag] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const sameEmail = userEmail === deliveryEmail;

  async function handleSend() {
    if (!sendEmailFlag && !sendNotificationFlag) {
      toast.error("Please select at least one method (Email or Notification)");
      return;
    }

    setIsSending(true);
    const toastId = toast.loading("Sending update...");
    try {
      const recipientEmail =
        !sameEmail && recipient === "delivery" ? deliveryEmail : undefined;

      await sendOrderNotification({
        orderId,
        recipientEmail: sendEmailFlag ? recipientEmail : undefined,
        sendEmail: sendEmailFlag,
        sendNotification: sendNotificationFlag,
      });

      toast.success("Update sent successfully", { id: toastId });
      setOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error), { id: toastId });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant={variant}
            size={size}
            className={className ?? "hidden md:flex bg-background"}
          >
            <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
            Send Update
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Order Update</DialogTitle>
          <DialogDescription>
            Notify the customer about the current status of their order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="flex flex-col gap-4">
            <Label className="text-sm font-semibold">
              Communication Methods
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${sendEmailFlag ? "bg-primary/5 border-primary" : "bg-background"}`}
                onClick={() => setSendEmailFlag(!sendEmailFlag)}
              >
                <Checkbox
                  id="send-email"
                  checked={sendEmailFlag}
                  onCheckedChange={(checked) => setSendEmailFlag(!!checked)}
                />
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label
                    htmlFor="send-email"
                    className="cursor-pointer font-medium"
                  >
                    Email
                  </Label>
                </div>
              </button>
              <button
                type="button"
                className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${sendNotificationFlag ? "bg-primary/5 border-primary" : "bg-background"}`}
                onClick={() => setSendNotificationFlag(!sendNotificationFlag)}
              >
                <Checkbox
                  id="send-notification"
                  checked={sendNotificationFlag}
                  onCheckedChange={(checked) =>
                    setSendNotificationFlag(!!checked)
                  }
                />
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Label
                    htmlFor="send-notification"
                    className="cursor-pointer font-medium"
                  >
                    Notification
                  </Label>
                </div>
              </button>
            </div>
          </div>

          {sendEmailFlag && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Email Recipient</Label>
              {sameEmail ? (
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    Sending to account holder:
                  </p>
                  <p className="text-sm font-medium">{userEmail}</p>
                </div>
              ) : (
                <RadioGroup
                  value={recipient}
                  onValueChange={(v) => setRecipient(v as RecipientType)}
                  className="space-y-2"
                >
                  <div className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-accent cursor-pointer transition-colors">
                    <RadioGroupItem
                      value="user"
                      id="r-user"
                      className="mt-0.5"
                    />
                    <Label htmlFor="r-user" className="cursor-pointer flex-1">
                      <p className="text-sm font-medium">Account holder</p>
                      <p className="text-xs text-muted-foreground">
                        {userEmail}
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-accent cursor-pointer transition-colors">
                    <RadioGroupItem
                      value="delivery"
                      id="r-delivery"
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor="r-delivery"
                      className="cursor-pointer flex-1"
                    >
                      <p className="text-sm font-medium">Delivery address</p>
                      <p className="text-xs text-muted-foreground">
                        {deliveryEmail}
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Send Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

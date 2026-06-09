"use client";

import { Bell, Globe, LinkIcon, Mail, User, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Organization } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { CheckboxCard } from "@/components/ui/checkbox-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { sendCustomMessage } from "@/data/notifications";
import { getErrorMessage } from "@/lib/utils";

interface SendCustomMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgs?: Organization[];
}

export function SendCustomMessageDialog({
  open,
  onOpenChange,
  orgs,
}: SendCustomMessageDialogProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState<"all" | "organization" | "user">(
    "all",
  );
  const [targetId, setTargetId] = useState("");
  const [sendInApp, setSendInApp] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error("Title is required");
    if (!message) return toast.error("Message is required");
    if (targetType !== "all" && !targetId)
      return toast.error("Target ID is required");
    if (!sendInApp && !sendEmail)
      return toast.error("Please select at least one delivery method");

    setIsSubmitting(true);
    try {
      await sendCustomMessage({
        title,
        message,
        targetType,
        targetId: targetId || undefined,
        sendInApp,
        sendEmail,
        linkUrl: linkUrl || undefined,
      });
      toast.success("Message sent successfully");
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setMessage("");
    setTargetType("all");
    setTargetId("");
    setSendInApp(true);
    setSendEmail(false);
    setLinkUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Send Custom Message
          </DialogTitle>
          <DialogDescription>
            Send a direct notification or email to your users.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <CheckboxCard
                id="send-in-app"
                checked={sendInApp}
                onCheckedChange={(v) => setSendInApp(!!v)}
                title="In-App"
                icon={Bell}
                className="p-4"
              />
              <CheckboxCard
                id="send-email"
                checked={sendEmail}
                onCheckedChange={(v) => setSendEmail(!!v)}
                title="Email"
                icon={Mail}
                className="p-4"
              />
            </div>

            <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Target Audience
              </Label>
              <Tabs
                value={targetType}
                onValueChange={(v) => {
                  setTargetType(v as "all" | "organization" | "user");
                  setTargetId("");
                }}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 w-full bg-background">
                  <TabsTrigger
                    value="all"
                    className="flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Everyone
                  </TabsTrigger>
                  <TabsTrigger
                    value="organization"
                    className="flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Org
                  </TabsTrigger>
                  <TabsTrigger
                    value="user"
                    className="flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5" />
                    User
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="organization" className="pt-3">
                  <Select
                    value={targetId}
                    onValueChange={(v) => setTargetId(v || "")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {orgs?.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name} ({org.prefix})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TabsContent>
                <TabsContent value="user" className="pt-3">
                  <Input
                    placeholder="Enter User ID"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Notification Heading"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Write your message here..."
                  className="min-h-[100px] resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link" className="flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" />
                  Link URL (Optional)
                </Label>
                <Input
                  id="link"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Globe, Palette, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Banner, Organization } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createBanner, updateBanner } from "@/data/notification-banner";
import { cn, getErrorMessage } from "@/lib/utils";

interface BannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner?: Banner;
  orgs?: Organization[];
}

const GRADIENT_PRESETS = [
  {
    id: "midnight",
    name: "Midnight",
    class: "bg-indigo-950 text-indigo-50 border-indigo-900",
  },
  {
    id: "sunset",
    name: "Sunset",
    class:
      "bg-linear-to-r from-orange-500 to-pink-500 text-orange-900 dark:text-orange-100 border-orange-800",
  },
  {
    id: "ocean",
    name: "Ocean",
    class:
      "bg-linear-to-r from-blue-500 to-cyan-500 text-sky-900 dark:text-blue-100 border-blue-800",
  },
  {
    id: "emerald",
    name: "Emerald",
    class:
      "bg-linear-to-r from-emerald-500 to-green-500 text-emerald-900 dark:text-emerald-100 border-emerald-800",
  },
  {
    id: "violet",
    name: "Violet",
    class:
      "bg-linear-to-r from-violet-500 to-purple-800 text-violet-900 dark:text-violet-100 border-violet-800",
  },
  {
    id: "fire",
    name: "Solar",
    class:
      "bg-linear-to-r from-red-500 to-rose-500 text-red-900 dark:text-red-100 border-red-800",
  },
];

export function BannerDialog({
  open,
  onOpenChange,
  banner,
  orgs,
}: BannerDialogProps) {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [targetType, setTargetType] = useState<"all" | "organization" | "user">(
    "all",
  );
  const [targetId, setTargetId] = useState("");
  const [variant, setVariant] = useState("midnight");
  const [dismissible, setDismissible] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setContent("");
    setTargetType("all");
    setTargetId("");
    setVariant("midnight");
    setDismissible(true);
    setIsActive(true);
  }, []);

  useEffect(() => {
    if (banner) {
      setContent(banner.content);
      setTargetType(banner.targetType);
      setTargetId(banner.targetId || "");
      setVariant(banner.variant);
      setDismissible(banner.dismissible);
      setIsActive(banner.isActive);
    } else if (open) {
      resetForm();
    }
  }, [banner, open, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return toast.error("Content is required");
    if (targetType !== "all" && !targetId)
      return toast.error("Target ID is required");

    setIsSubmitting(true);
    try {
      if (banner) {
        await updateBanner(banner.id, {
          content,
          targetType,
          targetId: targetId || undefined,
          variant,
          dismissible,
          isActive,
        });
        toast.success("Banner updated successfully");
      } else {
        await createBanner({
          content,
          targetType,
          targetId: targetId || undefined,
          variant,
          dismissible,
          isActive,
        });
        toast.success("Banner created successfully");
      }
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {banner ? "Edit Banner" : "Create New Banner"}
          </DialogTitle>
          <DialogDescription>
            {banner
              ? "Update your high-visibility message."
              : "Display a high-visibility message at the top of pages."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Banner Content</Label>
              <Input
                id="content"
                placeholder="e.g. Scheduled maintenance this Sunday at 2 AM"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <Label>Target Audience</Label>
              <Tabs
                value={targetType}
                onValueChange={(v) => {
                  setTargetType(v as "all" | "organization" | "user");
                  setTargetId("");
                }}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 w-full">
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

            <div className="space-y-3">
              <Label className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                Theme Preset (Modern & Subtle)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {GRADIENT_PRESETS.map((preset) => (
                  <Button
                    key={preset.id}
                    type="button"
                    onClick={() => setVariant(preset.id)}
                    className={cn(
                      "h-12 rounded-lg text-xs font-bold transition-all flex items-center justify-center border-2",
                      variant === preset.id
                        ? "border-primary scale-[1.02]"
                        : "border-transparent opacity-60 hover:opacity-80",
                      preset.class,
                    )}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <p className="text-[12px] text-muted-foreground">
                  Enable or disable this banner
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>User Dismissible</Label>
                <p className="text-[12px] text-muted-foreground">
                  Allow users to hide this banner
                </p>
              </div>
              <Switch checked={dismissible} onCheckedChange={setDismissible} />
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : banner
                  ? "Update Banner"
                  : "Create Banner"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Clock,
  Edit2,
  Globe,
  Megaphone,
  Power,
  PowerOff,
  User,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Banner, Organization } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import { removeBanner, toggleBannerActive } from "@/data/notification-banner";
import { cn, getErrorMessage } from "@/lib/utils";
import { BannerDialog } from "./banner-dialog";

interface BannerListProps {
  banners: Banner[];
  setBanners: React.Dispatch<React.SetStateAction<Banner[]>>;
  initialBanners: Banner[];
  organizations: Organization[];
}

export function BannerList({
  banners,
  setBanners,
  initialBanners,
  organizations,
}: BannerListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isActive: !isActive } : b)),
      );
      await toggleBannerActive({ id, isActive: !isActive });
      startTransition(() => {
        router.refresh();
      });
      toast.success(isActive ? "Banner deactivated" : "Banner activated");
    } catch (error) {
      setBanners(initialBanners);
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setBanners((prev) => prev.filter((b) => b.id !== id));
      await removeBanner({ id });
      startTransition(() => {
        router.refresh();
      });
      toast.success("Banner deleted");
    } catch (error) {
      setBanners(initialBanners);
      toast.error(getErrorMessage(error));
    }
  };

  if (banners === undefined) {
    return (
      <div className="p-12 flex flex-col items-center justify-center space-y-4">
        <div className="size-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading announcements...
        </p>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed rounded-2xl border-muted/20 bg-muted/5">
        <Megaphone className="w-12 h-12 mx-auto text-muted/20 mb-4" />
        <p className="text-muted-foreground font-medium">
          No global banners established.
        </p>
        <p className="text-xs text-muted-foreground mt-1 text-balance">
          Announcements created here will appear at the top of the user
          dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 p-2">
      <AnimatePresence mode="popLayout" initial={false}>
        {banners.map((banner) => (
          <motion.div
            key={banner.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "group relative flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border transition-all gap-4",
              banner.isActive
                ? "bg-card hover:shadow-md hover:border-primary/30 ring-1 ring-primary/5"
                : "bg-muted/30 grayscale-[0.5] opacity-80",
            )}
          >
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg shrink-0",
                    banner.isActive
                      ? "bg-primary/10 text-primary shadow-inner"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Megaphone className="size-4" />
                </div>
                <h3 className="font-bold text-lg leading-tight tracking-tight">
                  {banner.content}
                </h3>
                {!banner.isActive && (
                  <Badge
                    variant="outline"
                    className="bg-background/50 backdrop-blur-sm px-2 py-0"
                  >
                    Inactive
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-md">
                  {banner.targetType === "all" && (
                    <Globe className="size-3.5" />
                  )}
                  {banner.targetType === "organization" && (
                    <Users className="size-3.5" />
                  )}
                  {banner.targetType === "user" && (
                    <User className="size-3.5" />
                  )}
                  <span>{banner.targetType}</span>
                  {banner.targetId && (
                    <span className="text-[10px] font-mono text-primary/70">
                      #{banner.targetId.slice(-6)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  <span>
                    {formatDistanceToNow(new Date(banner.updatedAt))} ago
                  </span>
                </div>

                {banner.expiresAt && (
                  <div className="flex items-center gap-1.5 text-orange-600/90 dark:text-orange-400/90 bg-orange-500/5 px-2 py-1 rounded-md ring-1 ring-orange-500/10">
                    <Clock className="size-3.5" />
                    <span>
                      Expires {formatDistanceToNow(new Date(banner.expiresAt))}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center">
              <Button
                variant={banner.isActive ? "outline" : "default"}
                onClick={() => handleToggle(banner.id, banner.isActive)}
                className={cn(
                  "min-w-[110px] font-bold transition-all",
                  !banner.isActive &&
                    "shadow-lg shadow-primary/20 hover:shadow-none",
                )}
                disabled={isPending}
              >
                {banner.isActive ? (
                  <>
                    <PowerOff className="size-3.5 mr-2" />
                    Disable
                  </>
                ) : (
                  <>
                    <Power className="size-3.5 mr-2" />
                    Enable
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setEditingBanner(banner)}
                className="font-semibold"
                disabled={isPending}
              >
                <Edit2 className="size-3.5 mr-2" />
                Edit
              </Button>

              <DeleteConfirmationDialog
                type="banner"
                entityName={banner.content}
                onDelete={() => handleDelete(banner.id)}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <BannerDialog
        open={!!editingBanner}
        onOpenChange={(open) => !open && setEditingBanner(null)}
        banner={editingBanner || undefined}
        orgs={organizations}
      />
    </div>
  );
}

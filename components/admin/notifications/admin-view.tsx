"use client";

import { BellIcon, Megaphone, SendIcon } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Banner, Organization } from "@/app/generated/prisma/client";
import { BannerDialog } from "@/components/admin/notifications/banner-dialog";
import { BannerList } from "@/components/admin/notifications/banner-list";
import { SendCustomMessageDialog } from "@/components/admin/notifications/send-custom-message-dialog";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegisterAction } from "@/hooks/use-command-actions";

export function AdminNotificationsView({
  initialBanners,
  organizations,
}: {
  initialBanners: Banner[];
  organizations: Organization[];
}) {
  const [banners, setBanners] = useState(initialBanners);
  const [createBannerOpen, setCreateBannerOpen] = useState(false);
  const [sendMessageOpen, setSendMessageOpen] = useState(false);

  useEffect(() => {
    setBanners(initialBanners);
  }, [initialBanners]);

  // Hotkeys
  useRegisterAction({
    id: "send-message",
    label: "Send Message",
    shortcut: "m",
    handler: () => setSendMessageOpen(true),
    icon: SendIcon,
    category: "Notifications",
  });

  useRegisterAction({
    id: "create-banner",
    label: "Create Banner",
    shortcut: "b",
    handler: () => setCreateBannerOpen(true),
    icon: BellIcon,
    category: "Notifications",
  });

  const activeBannersCount = banners?.filter((b) => b.isActive).length ?? 0;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader
        title="Notification Management"
        mobileTitle="Notifications"
        sticky
      >
        <div className="flex items-center gap-2">
          <Button
            variant="hero"
            size="sm"
            onClick={() => setSendMessageOpen(true)}
            className="flex items-center gap-2"
          >
            <SendIcon className="size-4" />{" "}
            <span className="hidden sm:inline">Send</span> Message
          </Button>
          <Button
            variant="hero"
            size="sm"
            onClick={() => setCreateBannerOpen(true)}
            className="flex items-center gap-2 border-primary/20 hover:bg-primary/5"
          >
            <BellIcon className="size-4" />{" "}
            <span className="hidden sm:inline">New</span> Banner
          </Button>
        </div>
      </DashboardHeader>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex-1 p-4 md:p-6 space-y-8 overflow-auto"
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="relative overflow-hidden border-none bg-linear-to-br from-blue-500/10 via-background to-background ring-1 ring-blue-500/20 shadow-lg shadow-blue-500/5">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Megaphone className="size-24 -rotate-12 translate-x-8 translate-y-2 text-blue-500" />
            </div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold tracking-tight text-blue-600 dark:text-blue-400">
                Active Banners
              </CardTitle>
              <div className="rounded-full bg-blue-500/20 p-1.5 ring-1 ring-blue-500/30">
                <Megaphone className="size-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-4xl font-black tracking-tighter text-blue-600 dark:text-blue-400">
                  {activeBannersCount}
                </div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                  Live Now
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 leading-snug">
                Announcements currently visible to all authenticated users.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Global Announcements
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Manage real-time notifications and alerts across the organization.
            </p>
          </div>
          <div className="rounded-2xl border bg-card/30 backdrop-blur-sm p-1">
            <BannerList
              banners={banners}
              setBanners={setBanners}
              initialBanners={initialBanners}
              organizations={organizations}
            />
          </div>
        </div>
      </motion.div>

      <BannerDialog
        open={createBannerOpen}
        onOpenChange={setCreateBannerOpen}
        orgs={organizations}
      />
      <SendCustomMessageDialog
        open={sendMessageOpen}
        onOpenChange={setSendMessageOpen}
        orgs={organizations}
      />
    </div>
  );
}

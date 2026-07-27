"use client";

import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  Bell,
  BellIcon,
  BellRingIcon,
  CheckCheck,
  Inbox,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Notification } from "@/app/generated/prisma/client";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SwitchField } from "@/components/ui/switch-field";
import { markAllAsRead, markAsRead } from "@/data/notifications";
import { useRegisterAction } from "@/hooks/use-command-actions";
import { cn } from "@/lib/utils";

interface NotificationsViewProps {
  initialNotifications: Notification[];
  initialUnreadCount: number;
}

export function NotificationsView({
  initialNotifications,
  initialUnreadCount,
}: NotificationsViewProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount]);

  const filteredNotifications = useMemo(() => {
    if (!unreadOnly) return notifications;
    return notifications.filter((n) => !n.isRead);
  }, [notifications, unreadOnly]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await markAsRead({ id: notification.id });
    }
    if (notification.linkUrl) {
      router.push(notification.linkUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await markAllAsRead();
  };

  useRegisterAction({
    id: "toggle-read",
    label: unreadOnly ? "Show All Notifications" : "Show Unread Only",
    shortcut: "u",
    handler: () => setUnreadOnly(!unreadOnly),
    icon: unreadOnly ? BellRingIcon : BellIcon,
    category: "Notifications",
  });

  return (
    <div className="flex-1 flex flex-col bg-muted/10 overflow-hidden">
      <DashboardHeader title="Notifications" sticky>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <SwitchField
            id="unread-filter"
            label="Unread only"
            mobileLabel="Unread"
            checked={unreadOnly}
            onCheckedChange={setUnreadOnly}
          />

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-8 text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-colors rounded-full shrink-0"
            >
              <CheckCheck className="w-3.5 h-3.5 mr-1.5" />
              <span className="hidden sm:inline">Mark all read</span>
              <span className="sm:hidden">Mark read</span>
            </Button>
          )}
        </div>
      </DashboardHeader>

      <div className="flex-1 flex flex-col p-4 md:p-6 w-full overflow-hidden">
        <Card className="flex-1 flex flex-col border-none shadow-premium rounded-xl overflow-hidden bg-background p-0 w-full max-w-none">
          <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
            <ScrollArea className="h-[calc(100vh-140px)] w-full">
              <div className="w-full">
                {filteredNotifications.length === 0 ? (
                  <div className="py-24 text-center space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                      <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
                      <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center transition-transform hover:scale-110">
                        {unreadOnly ? (
                          <Inbox className="w-8 h-8 text-primary/60" />
                        ) : (
                          <Bell className="w-8 h-8 text-primary/60" />
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-bold tracking-tight">
                        {unreadOnly
                          ? "No unread notifications"
                          : "All caught up!"}
                      </p>
                      <p className="text-sm text-muted-foreground max-w-62.5 mx-auto">
                        {unreadOnly
                          ? "You are all caught up!"
                          : "No new notifications at the moment. We'll let you know when something comes up!"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {filteredNotifications.map((notification) => (
                      <button
                        type="button"
                        key={notification.id}
                        className={cn(
                          "w-full flex items-start gap-3.5 px-6 py-4 text-left transition-all hover:bg-muted group relative cursor-pointer",
                          !notification.isRead && "bg-primary/2",
                        )}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        {!notification.isRead && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                        )}

                        <div
                          className={cn(
                            "mt-0.5 p-2.5 rounded-xl shrink-0 transition-all duration-300",
                            !notification.isRead
                              ? "bg-primary/30 text-primary"
                              : "bg-card-foreground/5 dark:bg-card-foreground/20 text-muted-foreground",
                          )}
                        >
                          <Bell className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={cn(
                                "font-bold text-sm tracking-tight truncate",
                                !notification.isRead
                                  ? "text-foreground"
                                  : "text-muted-foreground",
                              )}
                            >
                              {notification.title}
                            </span>
                            <span className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider whitespace-nowrap">
                              {formatDistanceToNow(
                                new Date(notification.createdAt),
                                { addSuffix: true },
                              )}
                            </span>
                          </div>
                          <p
                            className={cn(
                              "text-sm leading-relaxed line-clamp-2",
                              !notification.isRead
                                ? "text-foreground/70 font-medium"
                                : "text-muted-foreground/60",
                            )}
                          >
                            {notification.message}
                          </p>

                          {notification.linkUrl && (
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-primary pt-2 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-1 group-hover:translate-x-0 uppercase tracking-widest">
                              View Details
                              <ArrowRight className="size-3 transition-transform -translate-x-4 group-hover:translate-x-2" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

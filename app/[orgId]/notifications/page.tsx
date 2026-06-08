import type { Metadata } from "next";
import { NotificationsView } from "@/components/notifications/notifications-view";
import { getNotifications, getUnreadCount } from "@/data/notifications";

export const metadata: Metadata = {
  title: "Notifications | PDi",
  description: "View your alerts and updates",
};

export default async function NotificationsPage() {
  const [notifications, unreadCount] = await Promise.all([
    getNotifications({ limit: 50 }),
    getUnreadCount(),
  ]);

  // // Safely serialize dates to strings
  // const serializedNotifications = notifications.map((n) => ({
  //   ...n,
  //   createdAt: n.createdAt.toISOString(),
  // }));

  return (
    <NotificationsView
      initialNotifications={notifications}
      initialUnreadCount={unreadCount}
    />
  );
}

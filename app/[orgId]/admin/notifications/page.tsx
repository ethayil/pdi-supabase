import type { Metadata } from "next";
import { AdminNotificationsView } from "@/components/admin/notifications/admin-view";
import { listAllBanners } from "@/data/notification-banner";

export const metadata: Metadata = {
  title: "Admin Notifications | PDi",
  description: "Manage global announcements and alerts",
};

export default async function AdminNotificationsPage() {
  const banners = await listAllBanners();

  return (
    <AdminNotificationsView initialBanners={banners} />
  );
}

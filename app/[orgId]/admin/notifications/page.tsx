import type { Metadata } from "next";
import { AdminNotificationsView } from "@/components/admin/notifications/admin-view";
import { listAllBanners } from "@/data/notification-banner";
import { getOrganizations } from "@/data/organizations";

export const metadata: Metadata = {
  title: "Admin Notifications | PDi",
  description: "Manage global announcements and alerts",
};

export default async function AdminNotificationsPage() {
  const [banners, { data: orgs }] = await Promise.all([
    listAllBanners(),
    getOrganizations(),
  ]);

  // // Safely serialize dates to strings
  // const serializedBanners = banners.map((b) => ({
  //   ...b,
  //   createdAt: b.createdAt.toISOString(),
  //   updatedAt: b.updatedAt.toISOString(),
  //   expiresAt: b.expiresAt ? b.expiresAt.toISOString() : null,
  // }));

  // const serializedOrgs = orgs.map((o) => ({
  //   id: o.id,
  //   name: o.name,
  //   prefix: o.prefix,
  // }));

  return (
    <AdminNotificationsView initialBanners={banners} organizations={orgs} />
  );
}

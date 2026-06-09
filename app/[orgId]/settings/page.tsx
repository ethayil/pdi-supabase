import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard-header";
import { SettingsView } from "@/components/settings/settings-view";

export const metadata: Metadata = {
  title: "Settings | PDi",
  description: "Configure your preferences",
};

export default function SettingsPage() {
  return (
    <>
      <DashboardHeader title="Settings" sticky />
      <main className="flex-1 space-y-6 p-2 md:p-4">
        <SettingsView />
      </main>
    </>
  );
}

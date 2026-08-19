import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { SettingsView } from "@/components/settings/settings-view";
import { getSession } from "@/lib/auth/get-session";

export const metadata: Metadata = {
  title: "Settings | PDi",
  description: "Configure your preferences",
};

export default function SettingsPage() {
  return (
    <>
      <DashboardHeader title="Settings" sticky />
      <main className="flex-1 space-y-6 p-2 md:p-4">
        <Suspense fallback={null}>
          <SettingsContent />
        </Suspense>
      </main>
    </>
  );
}

async function SettingsContent() {
  const { user } = await getSession();
  return <SettingsView user={user} />;
}

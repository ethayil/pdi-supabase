import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardView } from "@/components/dashboard-view";
import type { Params } from "@/types/globals";

export const metadata: Metadata = {
  title: "Dashboard | PDi",
  description: "PDi Dashboard",
};

export default async function DashboardPage({ params }: { params: Params }) {
  const { orgId } = await params;

  return (
    <>
      <DashboardHeader title="Dashboard" sticky />
      <main className="flex-1 space-y-4 p-2 md:p-4">
        <DashboardView organizationId={orgId} />
      </main>
    </>
  );
}

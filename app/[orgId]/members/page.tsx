import { preloadedQueryResult } from "convex/nextjs";
import * as motion from "motion/react-client";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { MembersList } from "@/components/members/members-list";
import { Params } from "@/types/globals";
import { getPreloadedUser } from "@/utils/get-server-data";

export const metadata: Metadata = {
  title: "Members | PDi",
  description: "PDi Org Members",
};

export default async function MembersPage({ params }: { params: Params }) {
  const { organizationId } = await params;

  const preloadedUser = await getPreloadedUser();
  const user = preloadedQueryResult(preloadedUser);

  // Route guard — only admin and superadmin can access
  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    redirect(`/${organizationId}`);
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <DashboardHeader title="Members" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-auto"
      >
        <MembersList organizationId={organizationId} />
      </motion.div>
    </div>
  );
}

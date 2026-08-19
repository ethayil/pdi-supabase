import * as motion from "motion/react-client";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { MembersList } from "@/components/members/members-list";
import { getOrgMembersWithStats } from "@/data/users";
import { getSession } from "@/lib/auth/get-session";
import type { Params } from "@/types/globals";

export const metadata: Metadata = {
  title: "Members | PDi",
  description: "PDi Org Members",
};

export default function MembersPage({ params }: { params: Params }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <DashboardHeader title="Members" />
      <Suspense fallback={null}>
        <MembersContent params={params} />
      </Suspense>
    </div>
  );
}

async function MembersContent({ params }: { params: Params }) {
  const { orgId } = await params;
  const { user } = await getSession();

  // Route guard — only orgAdmin and admin can access
  if (!user || (user.role !== "orgAdmin" && user.role !== "admin")) {
    redirect(`/${orgId}`);
  }

  const members = await getOrgMembersWithStats({ orgId });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1 overflow-auto"
    >
      <MembersList organizationId={orgId} members={members} />
    </motion.div>
  );
}

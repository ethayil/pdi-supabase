import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import VerifyCard from "@/components/auth/verify-card";
import { getOrganizations } from "@/data/organizations";
import { getSession } from "@/lib/auth/get-session";

export default async function VerifyPage() {
  const { user, session } = await getSession();

  // Not authenticated
  if (!user) {
    redirect("/auth/signin");
  }

  const activeOrganization = session?.activeOrganizationId;
  const orgsResult = await getOrganizations({ bypassCache: true });
  const orgs = orgsResult.success ? orgsResult.data : [];

  // Account deactivated
  if (user.banned === true) {
    return (
      <VerifyCard
        title="Account Suspended"
        description="Your account has been deactivated. Please contact your administrator for more information."
      />
    );
  }

  // 1. User has activeOrganization set on session - redirect to dashboard if member
  if (activeOrganization && activeOrganization !== "null") {
    const isMember = orgs.some((org) => org.id === activeOrganization);
    if (isMember) {
      redirect(`/${activeOrganization}`);
    }
  }

  // 2. User has organization membership(s) (even if activeOrganizationId is null on session) - redirect to first org
  if (orgs.length > 0) {
    redirect(`/${orgs[0].id}`);
  }

  // 3. Super admin without any organizations yet - redirect to setup
  if (user.role === "admin") {
    redirect("/admin/setup");
  }

  // 4. Non-admin user without any organization membership - show waiting page
  return (
    <VerifyCard
      title="Account Pending"
      description="Your account has been created successfully. Please wait for an administrator verification."
    />
  );
}

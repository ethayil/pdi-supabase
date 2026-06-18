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

  // console.log("[VerifyPage] DEBUG INFO:", {
  //   userId: user.id,
  //   userRole: user.role,
  //   userBanned: user.banned,
  //   activeOrganizationId: session?.activeOrganizationId,
  // });

  const activeOrganization = session?.activeOrganizationId;
  const orgsResult = await getOrganizations({ bypassCache: true });
  const orgs = orgsResult.success ? orgsResult.data : [];

  const isAdmin = user.role === "orgAdmin" || user.role === "admin";

  // Account deactivated
  if (user.banned === true) {
    return (
      <VerifyCard
        title="Account Suspended"
        description="Your account has been deactivated. Please contact your administrator for more information."
      />
    );
  }

  // User has organization - redirect to their dashboard ONLY if they are a member of it
  if (activeOrganization && activeOrganization !== "null") {
    const isMember = orgs.some((org) => org.id === activeOrganization);
    if (isMember) {
      redirect(`/${activeOrganization}`);
    }
  }

  // admin without orgId
  if (isAdmin) {
    if (orgs.length > 0) {
      // Redirect to the first organization's admin panel if they are admin
      // This allows them to manage organizations even if not assigned to one
      redirect(`/${orgs[0].id}`);
    }

    if (user.role === "admin") {
      // No organizations exist, and user is admin - redirect to setup
      redirect("/admin/setup");
    }
  }

  // Non-admin user without orgId - show waiting page
  return (
    <VerifyCard
      title="Account Pending"
      description="Your account has been created successfully. Please wait for an administrator verification."
    />
  );
}

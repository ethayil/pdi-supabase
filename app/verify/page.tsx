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
  const orgsResult = await getOrganizations();
  const orgs = orgsResult.success ? orgsResult.data : [];

  const isAdmin = user.role === "orgAdmin" || user.role === "superAdmin";

  // Account deactivated
  if (user.banned === true) {
    return (
      <VerifyCard
        title="Account Suspended"
        description="Your account has been deactivated. Please contact your administrator for more information."
      />
    );
  }

  // User has organization - redirect to their dashboard
  if (activeOrganization) {
    redirect(`/${activeOrganization}`);
  }

  // Admin/Superadmin without orgId
  if (isAdmin) {
    if (orgs.length > 0) {
      // Redirect to the first organization's admin panel if they are admin
      // This allows them to manage organizations even if not assigned to one
      redirect(`/${orgs[0].id}`);
    }

    if (user.role === "superAdmin") {
      // No organizations exist, and user is superadmin - redirect to setup
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

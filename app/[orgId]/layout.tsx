// export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import VerifyCard from "@/components/auth/verify-card";
import { CommandPalette } from "@/components/command-palette";
import { BannerNotification } from "@/components/notifications/banner-notification";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getOrganizations } from "@/data/organizations";
import { getSession } from "@/lib/auth/get-session";
import type { Params } from "@/types/globals";

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { user, session } = await getSession();
  if (!user) {
    return redirect("/auth/signin");
  }

  const { orgId } = await params;

  const { data: orgs } = await getOrganizations();

  // Not authenticated
  if (!user) {
    redirect("/auth/signin");
  }

  // User deactivated
  if (user.banned === true) {
    redirect("/verify");
  }

  const selectedOrganization = orgs.find((org) => org.id === orgId);

  // Helper to safely redirect to user's org or verify
  const redirectToUserOrg = () => {
    if (
      !session?.activeOrganizationId ||
      session?.activeOrganizationId === "null"
    ) {
      redirect("/verify");
    }
    redirect(`/${session?.activeOrganizationId}`);
  };

  // Organization not found or unauthorized
  if (!selectedOrganization) {
    if (
      (user.role === "superAdmin" || user.role === "orgAdmin") &&
      orgs.length > 0
    ) {
      redirect(`/${orgs[0].id}`);
    }
    return redirectToUserOrg();
  }

  if (
    user.role === "user" &&
    selectedOrganization.id !== session?.activeOrganizationId
  ) {
    return redirectToUserOrg();
  }

  const settings = selectedOrganization.settings;
  const primaryColor = settings?.primaryColor;

  // Organization inactive (Lock Screen)
  if (selectedOrganization.isActive === false && user.role !== "superAdmin") {
    return (
      <VerifyCard
        title="Organization Inactive"
        description={
          <>
            The organization <strong>{selectedOrganization.name}</strong> is
            currently inactive. Please contact your administrator for access.
          </>
        }
      />
    );
  }

  return (
    <SidebarProvider>
      {/* {primaryColor && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
            :root {
              --primary: ${primaryColor};
            }
          `,
          }}
        />
      )} */}
      <AppSidebar user={user} orgs={orgs} organizationId={orgId} />
      <SidebarInset className="h-svh p-0 flex flex-col overflow-hidden relative">
        <BannerNotification orgId={orgId} />
        <div className="absolute inset-0 bg-grid pointer-events-none" />

        <div className="flex flex-col z-10 flex-1 overflow-auto">
          {children}
        </div>
      </SidebarInset>
      <CommandPalette role={user.role} />
    </SidebarProvider>
  );
}

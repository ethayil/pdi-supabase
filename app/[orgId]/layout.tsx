import { redirect } from "next/navigation";
import { Suspense } from "react";
import VerifyCard from "@/components/auth/verify-card";
import { CommandPalette } from "@/components/command-palette";
import { BannerNotification } from "@/components/notifications/banner-notification";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { StoreInitializer } from "@/components/store-initializer";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getOrganizations } from "@/data/organizations";
import { getSession } from "@/lib/auth/get-session";

export default function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <OrganizationLayoutContent params={params}>
        {children}
      </OrganizationLayoutContent>
    </Suspense>
  );
}

async function OrganizationLayoutContent({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}) {
  const { user, isAdmin } = await getSession();
  if (!user) {
    return redirect("/auth/signin");
  }

  const { orgId } = await params;

  const { data: orgs } = await getOrganizations({ bypassCache: true });

  // User deactivated
  if (user.banned === true) {
    redirect("/verify");
  }

  const selectedOrganization = orgs.find((org) => org.id === orgId);

  // Organization not found or unauthorized for this user
  if (!selectedOrganization) {
    if (isAdmin && orgs.length > 0) {
      redirect(`/${orgs[0].id}`);
    }
    redirect("/verify");
  }

  // Organization inactive (Lock Screen)
  if (selectedOrganization.isActive === false && user.role !== "admin") {
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
      <StoreInitializer organizations={orgs} />
      <AppSidebar user={user} organizationId={orgId} />
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

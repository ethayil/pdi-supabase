import type { Organization } from "@/app/generated/prisma/client";
import type { User } from "@/auth";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import OrganizationSwitcher from "./organization-switcher";
import { SidebarItems } from "./sidebar-items";
import { adminRoutes, orgAdminRoutes, userRoutes } from "./sidebar-routes";
import { SidebarUser } from "./sidebar-user";

export function AppSidebar({
  user,
  orgs,
  organizationId,
  ...props
}: {
  user: User;
  orgs: Organization[];
  organizationId?: string | null;
} & React.ComponentProps<typeof Sidebar>) {
  const organizations = orgs;
  const _selectedOrg = organizations.find((org) => org.id === organizationId);
  // const settings = selectedOrg?.settings;

  return (
    <Sidebar collapsible="icon" {...props}>
      <OrganizationSwitcher
        user={user}
        orgs={orgs}
        organizationId={organizationId}
      />
      <SidebarContent>
        <SidebarItems organizationId={organizationId} routes={userRoutes} />

        {(user?.role === "orgAdmin" || user?.role === "superAdmin") && (
          <>
            <Separator />
            <SidebarItems
              organizationId={organizationId}
              title="Admin"
              routes={orgAdminRoutes}
            />
          </>
        )}

        {user?.role === "superAdmin" && (
          <>
            <Separator />
            <SidebarItems
              organizationId={organizationId}
              title="Super Admin"
              routes={adminRoutes}
            />
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

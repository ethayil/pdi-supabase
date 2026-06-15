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
  organizationId,
  ...props
}: {
  user: User;
  organizationId?: string | null;
} & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <OrganizationSwitcher
        user={user}
        organizationId={organizationId}
      />
      <SidebarContent>
        <SidebarItems organizationId={organizationId} routes={userRoutes} />

        {(user?.role === "orgAdmin" || user?.role === "admin") && (
          <>
            <Separator />
            <SidebarItems
              organizationId={organizationId}
              title="Admin"
              routes={orgAdminRoutes}
            />
          </>
        )}

        {user?.role === "admin" && (
          <>
            <Separator />
            <SidebarItems
              organizationId={organizationId}
              title="Global Admin"
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

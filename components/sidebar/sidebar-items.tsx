"use client";

import type { LucideProps } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

type Route = {
  name: string;
  url: string;
  icon?: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
};

type CollapsibleRoute = {
  name: string;
  url: string;
  icon?: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  items?: Route[];
};

export function SidebarItems({
  organizationId,
  title,
  routes,
}: {
  organizationId?: string | null;
  routes: CollapsibleRoute[];
  title?: string;
}) {
  const pathname = usePathname();

  const { setOpenMobile } = useSidebar();

  const isActive = (path: string) => {
    const fullPath = `/${organizationId}${path}`;
    if (path === "/") {
      return pathname === fullPath;
    }
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };

  return (
    <SidebarGroup>
      {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
      <SidebarMenu>
        {routes.map((route) => (
          <SidebarMenuItem key={route.name}>
            <Link
              href={`/${organizationId}${route.url}`}
              onClick={() => setOpenMobile(false)}
            >
              <SidebarMenuButton
                tooltip={route.name}
                isActive={isActive(route.url)}
              >
                {route.icon && <route.icon />}
                <span>{route.name}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

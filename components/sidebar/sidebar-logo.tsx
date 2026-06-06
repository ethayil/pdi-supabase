"use client";

import Link from "next/link";
import Image from "next/image";
import { SidebarHeader, useSidebar } from "@/components/ui/sidebar";

export default function SidebarLogo() {
  const { open } = useSidebar();
  return (
    <SidebarHeader>
      <Link href="/">
        {open ? (
          <Image
            src="/e-logo.png"
            priority
            width="240"
            height="240"
            alt="e-pickpack logo"
            className="w-full mt-6 "
          />
        ) : (
          <Image
            src="/logo.png"
            priority
            width="240"
            height="240"
            alt="e-pickpack logo"
            className="w-full mt-6 group-data-[state=expanded]:hidden"
          />
        )}
      </Link>
    </SidebarHeader>
  );
}

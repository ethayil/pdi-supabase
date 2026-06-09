"use client";

import { motion } from "motion/react";
import type React from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { NotificationCenter } from "./notification-center";
import { TextRevealEffect } from "./ui/text-reveal-effects";

interface DashboardHeaderProps {
  title?: string;
  children?: React.ReactNode;
  sticky?: boolean;
  hideTitleOnMobile?: boolean;
  mobileTitle?: string;
}

export function DashboardHeader({
  title,
  mobileTitle,
  children,
  sticky = false,
  hideTitleOnMobile = false,
}: DashboardHeaderProps) {
  return (
    <motion.header
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        sticky && "sticky top-0 z-50 ",
        "flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border bg-sidebar/95 backdrop-blur-sm supports-backdrop-filter:bg-sidebar/60 px-4",
      )}
    >
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2" />
      <div className="flex flex-1 items-center justify-between overflow-hidden">
        {title && (
          <div
            className={cn(
              hideTitleOnMobile && "hidden md:block",
              "min-w-0 shrink-0",
            )}
          >
            {mobileTitle ? (
              <>
                <div className="hidden md:block">
                  <TextRevealEffect
                    text={title}
                    className="text-xl font-bold tracking-tight"
                  />
                </div>
                <div className="block md:hidden">
                  <TextRevealEffect
                    text={mobileTitle}
                    className="text-xl font-bold tracking-tight"
                  />
                </div>
              </>
            ) : (
              <TextRevealEffect
                text={title}
                className="text-xl font-bold tracking-tight"
              />
            )}
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          {children}
          <NotificationCenter />
        </div>
      </div>
    </motion.header>
  );
}

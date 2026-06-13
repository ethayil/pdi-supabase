"use client";

import {
  ArrowRightToLineIcon,
  Briefcase,
  ChevronDown,
  GraduationCap,
  Mail,
  Menu,
  Package,
  Warehouse,
  X,
} from "lucide-react";
import * as motion from "motion/react-client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { RainbowButton } from "../ui/rainbow-button";

const SERVICES = [
  {
    name: "University Distribution",
    description: "Global student recruitment & prospectus fulfillment.",
    href: "/services/university-distribution",
    icon: GraduationCap,
  },
  {
    name: "Smart Distribution",
    description: "International bulk mail discounts (UPS, DHL, Royal Mail).",
    href: "/services/smart-distribution",
    icon: Mail,
  },
  {
    name: "Virtual Warehouse",
    description: "Real-time remote stock control and campaign order tool.",
    href: "/services/virtual-warehouse",
    icon: Warehouse,
  },
  {
    name: "Corporate & Event Logistics",
    description: "Annual reports mailing and exhibition stand handling.",
    href: "/services/corporate-event-logistics",
    icon: Briefcase,
  },
];

export function MarketingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const pathname = usePathname();

  const getActiveClassname = (path: string, startsWith?: boolean) => {
    const isActive = startsWith ? pathname.startsWith(path) : pathname === path;

    return isActive
      ? "text-primary bg-primary/10 dark:bg-primary/20"
      : "text-muted-foreground hover:text-foreground";
  };

  return (
    <motion.nav
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Package className="text-primary-foreground text-xl fill-current" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              PDi UK
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                  <NavigationMenuLink
                    render={<Link href="/" />}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      getActiveClassname("/"),
                    )}
                  >
                    Home
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={cn(getActiveClassname("/services", true))}
                  >
                    Services
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="p-3 w-80">
                    <div className="grid gap-1">
                      {SERVICES.map((service) => {
                        const Icon = service.icon;
                        return (
                          <NavigationMenuLink
                            key={service.href}
                            render={<Link href={service.href} />}
                            className={cn(
                              "flex items-start gap-3 p-3 rounded-lg hover:bg-muted/80 transition-colors",
                              getActiveClassname(service.href),
                            )}
                          >
                            <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
                              <Icon className="size-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm">
                                {service.name}
                              </div>
                              <div className="text-xs text-muted-foreground leading-normal mt-0.5">
                                {service.description}
                              </div>
                            </div>
                          </NavigationMenuLink>
                        );
                      })}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink
                    render={<Link href="/about" />}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      getActiveClassname("/about"),
                    )}
                  >
                    About
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink
                    render={<Link href="/contact" />}
                    className={cn(
                      navigationMenuTriggerStyle(),
                      getActiveClassname("/contact"),
                    )}
                  >
                    Contact
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Action Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <Link href="/auth/signin">
                <RainbowButton>Client Portal</RainbowButton>
              </Link>
            </div>

            <button
              type="button"
              className="md:hidden text-foreground hover:text-primary transition-colors p-2"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden border-t border-border bg-background px-4 pt-2 pb-6 space-y-3 shadow-inner"
        >
          <div className="flex flex-col space-y-1">
            <Link
              href="/"
              className={cn(
                "p-2 rounded-md transition-colors",
                getActiveClassname("/"),
              )}
            >
              Home
            </Link>

            {/* Mobile Services Submenu */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setServicesOpen(!servicesOpen)}
                className="w-full flex items-center justify-between p-2 rounded-md text-foreground hover:bg-muted"
              >
                <span className="font-medium">Services</span>
                <ChevronDown
                  className={`size-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
                />
              </button>

              {servicesOpen && (
                <div className="pl-4 pr-2 py-1 space-y-1 border-l border-border ml-4">
                  {SERVICES.map((service) => {
                    const Icon = service.icon;
                    return (
                      <Link
                        key={service.href}
                        href={service.href}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-md text-sm transition-colors",
                          getActiveClassname(service.href),
                        )}
                      >
                        <Icon className="size-4 text-primary" />
                        {service.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              href="/about"
              className={cn(
                "p-2 rounded-md transition-colors",
                getActiveClassname("/about"),
              )}
            >
              About
            </Link>

            <Link
              href="/contact"
              className={cn(
                "p-2 rounded-md transition-colors",
                getActiveClassname("/contact"),
              )}
            >
              Contact
            </Link>
          </div>

          <div className="pt-2 border-t border-border">
            <Link href="/auth/signin" className="block w-full">
              <RainbowButton className="w-full">Client Portal</RainbowButton>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

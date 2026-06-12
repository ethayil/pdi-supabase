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

  const handleLinkClick = () => {
    setIsOpen(false);
    setServicesOpen(false);
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
          <Link
            href="/"
            className="shrink-0 flex items-center gap-2"
            onClick={handleLinkClick}
          >
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Package className="text-primary-foreground text-xl fill-current" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              PDi UK
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
            <Link
              href="/"
              onClick={handleLinkClick}
              className={`transition-colors ${
                pathname === "/"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Home
            </Link>

            {/* Services Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setServicesOpen(!servicesOpen)}
              >
                Services
                <ChevronDown className="size-4 transition-transform group-hover:rotate-180 duration-200" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-80 bg-popover border border-border rounded-xl shadow-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="grid gap-1">
                  {SERVICES.map((service) => {
                    const Icon = service.icon;
                    return (
                      <Link
                        key={service.href}
                        href={service.href}
                        onClick={handleLinkClick}
                        className={`flex items-start gap-3 p-3 rounded-lg hover:bg-muted/80 transition-colors ${
                          pathname === service.href
                            ? "bg-muted text-primary"
                            : "text-foreground"
                        }`}
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
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            <Link
              href="/about"
              onClick={handleLinkClick}
              className={`transition-colors ${
                pathname === "/about"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              About
            </Link>

            <Link
              href="/contact"
              onClick={handleLinkClick}
              className={`transition-colors ${
                pathname === "/contact"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Action Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <Link href="/auth/signin">
                <Button size="hero" variant="rainbow">
                  Client Portal
                  <ArrowRightToLineIcon className="size-4" />
                </Button>
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
              onClick={handleLinkClick}
              className={`p-2 rounded-md transition-colors ${
                pathname === "/"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground hover:bg-muted"
              }`}
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
                        onClick={handleLinkClick}
                        className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${
                          pathname === service.href
                            ? "text-primary font-semibold bg-muted"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
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
              onClick={handleLinkClick}
              className={`p-2 rounded-md transition-colors ${
                pathname === "/about"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              About
            </Link>

            <Link
              href="/contact"
              onClick={handleLinkClick}
              className={`p-2 rounded-md transition-colors ${
                pathname === "/contact"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              Contact
            </Link>
          </div>

          <div className="pt-2 border-t border-border">
            <Link href="/auth/signin" className="block w-full">
              <Button
                size="hero"
                variant="rainbow"
                className="w-full justify-center"
              >
                Client Portal
                <ArrowRightToLineIcon className="size-4 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

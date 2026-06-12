"use client";

import { ExternalLink, Mail, MapPin, Package, Phone } from "lucide-react";
import * as motion from "motion/react-client";
import Link from "next/link";

export function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card text-foreground border-t border-border mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Logo & Company details */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <Package className="text-primary-foreground text-xl fill-current" />
              </div>
              <span className="font-bold text-xl tracking-tight">PDi UK</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              PDi is a trading name of e-PickPack. Over 20 years of experience
              providing university and corporate distribution solutions
              globally.
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="size-3.5 text-primary" />
                <span>+44 (0) 1296-601-570</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="size-3.5 text-primary" />
                <a
                  href="mailto:contact@e-pickpack.co.uk"
                  className="hover:text-foreground transition-colors"
                >
                  contact@e-pickpack.co.uk
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="size-3.5 text-primary shrink-0 mt-0.5" />
                <span>
                  Hall 1, 5 Rabans Lane,
                  <br />
                  Aylesbury HP19 8RT,
                  <br />
                  United Kingdom
                </span>
              </div>
            </div>
          </div>

          {/* Services Menu */}
          <div>
            <h3 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground mb-4">
              Services
            </h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/services/university-distribution"
                  className="hover:text-foreground transition-colors"
                >
                  University Distribution
                </Link>
              </li>
              <li>
                <Link
                  href="/services/smart-distribution"
                  className="hover:text-foreground transition-colors"
                >
                  Smart Distribution & Mail
                </Link>
              </li>
              <li>
                <Link
                  href="/services/virtual-warehouse"
                  className="hover:text-foreground transition-colors"
                >
                  Virtual Warehouse
                </Link>
              </li>
              <li>
                <Link
                  href="/services/corporate-event-logistics"
                  className="hover:text-foreground transition-colors"
                >
                  Corporate & Event Logistics
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links Menu */}
          <div>
            <h3 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/"
                  className="hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-foreground transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/signin"
                  className="hover:text-foreground transition-colors flex items-center gap-1"
                >
                  Client Portal <ExternalLink className="size-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & Legal Menu */}
          <div>
            <h3 className="font-semibold text-sm tracking-wider uppercase text-muted-foreground mb-4">
              Legal & Compliance
            </h3>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition-colors"
                >
                  Privacy Policy (GDPR)
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li className="pt-2 text-[10px] text-muted-foreground leading-normal border-t border-border mt-3 space-y-1.5">
                <div>
                  E-PickPack Limited is registered in England and Wales.
                </div>
                <div>
                  <strong>Company No:</strong> 06404412
                </div>
                <div className="text-[10px] pt-1 border-t border-border/50 mt-2">
                  © {currentYear} E-PickPack Limited trading as PDi UK. All
                  rights reserved.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

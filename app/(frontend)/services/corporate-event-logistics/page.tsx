/** biome-ignore-all lint/suspicious/noArrayIndexKey: index is required*/

import { Archive, Briefcase, Building2, Calendar, Gift } from "lucide-react";
import * as motion from "motion/react-client";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  SpotlightCard,
  TextRevealEffect,
} from "@/components/ui/text-reveal-effects";

export const metadata: Metadata = {
  title: "Corporate Event Logistics & Print Distribution | PDi UK",
  description:
    "End-to-end logistics for trade shows and conferences. Specialized shareholder mailings, annual report fulfillment, and climate-controlled storage.",
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export default function CorporateEventLogistics() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
    >
      {/* Hero Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-4">
          <Briefcase className="size-4" /> Corporate Logistics & Event Management
        </motion.div>
        <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          <TextRevealEffect text="Corporate & Event Logistics" />
        </motion.h1>
        <motion.p variants={itemVariants} className="text-lg text-muted-foreground leading-relaxed">
          From high-stakes shareholder communications to global exhibition
          tours, PDi UK coordinates corporate fulfillment and logistics. We
          handle storage, delivery, set-up, and return with complete timeliness.
        </motion.p>
      </motion.div>

      {/* Corporate Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-2xl font-bold mb-4">
            <TextRevealEffect text="Exhibition & Print Logistics" />
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Managing exhibition stands, brochures, and banner displays across
            multiple domestic and international conference venues is an
            administrative challenge.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            PDi UK provides event logistics solutions. We store your exhibition
            assets in our secure Aylesbury warehouse, consolidate them with
            marketing literature, transport them to the event venue, and even
            coordinate return shipping afterwards.
          </p>
          <div className="space-y-3">
            {[
              "Delivery directly to exhibition halls, hotels, or stand builders.",
              "Management of corporate print folders and brochures.",
              "Shareholder communications (Annual Reports & Accounts).",
              "Bespoke packaging for employee onboarding or client gifts.",
            ].map((bullet, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-foreground font-medium"
              >
                <Building2 className="size-4 text-emerald-500 shrink-0" />
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-muted/40 border border-border rounded-2xl p-8 space-y-6"
        >
          <div className="flex gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0 h-fit">
              <Calendar className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">
                Exhibition & Fair Handling
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We manage deliveries directly into corporate conferences, trade
                fairs, and university recruitment stands, navigating
                site-specific freight rules and strict delivery windows.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0 h-fit">
              <Archive className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">
                Specialist Storage
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Safely store pop-up banners, display components, event
                merchandise, and literature. Track balances in the Virtual
                Warehouse and reorder items for upcoming dates.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0 h-fit">
              <Gift className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">
                Custom Fulfillment
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Hand-packed promotional sets, agent kits, or employee packs
                compiled to order. We manage collating, labeling, and express
                dispatch.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Detail highlights */}
      <div className="mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl font-bold mb-8 text-center"
        >
          <TextRevealEffect text="Corporate Solutions" />
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants}>
            <SpotlightCard className="p-6 rounded-xl border border-border bg-card hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out h-full">
              <h3 className="font-bold text-lg mb-3">Annual Reports Mailing</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Time-critical distribution of annual statements, accounts, and
                proxy voter mailings to shareholders, guaranteeing compliance with
                corporate timetables.
              </p>
            </SpotlightCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <SpotlightCard className="p-6 rounded-xl border border-border bg-card hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out h-full">
              <h3 className="font-bold text-lg mb-3">Employee Communications</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Dispatch newsletters, benefit updates, onboarding gifts, or
                regulatory print files to remote staff divisions across the UK and
                internationally.
              </p>
            </SpotlightCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <SpotlightCard className="p-6 rounded-xl border border-border bg-card hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out h-full">
              <h3 className="font-bold text-lg mb-3">Event Return Logistics</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We don't just send it out. We work with couriers and freight
                coordinators to retrieve display materials after the event, return
                them to storage, and verify their condition.
              </p>
            </SpotlightCard>
          </motion.div>
        </motion.div>
      </div>

      {/* CTA Box */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-primary/5 border border-primary/20 rounded-2xl p-8 md:p-12 text-center"
      >
        <h2 className="text-2xl font-bold mb-4">
          <TextRevealEffect text="Have an upcoming mailing campaign?" />
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-6">
          Get in touch with our event logistics and corporate mailing
          specialists. We'll consult on storage space, package sizes, and
          optimal courier networks.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact">
            <Button variant="hero" size="hero" className="hover:scale-102 active:scale-98 transition-transform duration-200">
              Request a Quote
            </Button>
          </Link>
          <Link href="/services/smart-distribution">
            <Button variant="outline" size="hero" className="hover:scale-102 active:scale-98 transition-transform duration-200">
              Explore Mail Discounts
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

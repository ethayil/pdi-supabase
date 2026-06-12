/** biome-ignore-all lint/suspicious/noArrayIndexKey: index is required*/

import { Globe, GraduationCap, Landmark, ShieldCheck } from "lucide-react";
import * as motion from "motion/react-client";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  SpotlightCard,
  TextRevealEffect,
} from "@/components/ui/text-reveal-effects";

export const metadata: Metadata = {
  title: "University Global Distribution | PDi UK",
  description:
    "Specialized prospectus fulfillment, student recruitment agent packages, and global education fair logistics for UK universities. Serving the higher education sector since 2004.",
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

export default function UniversityDistribution() {
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
          <GraduationCap className="size-4" /> Higher Education Logistics Partner
        </motion.div>
        <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          <TextRevealEffect text="University Global Distribution" />
        </motion.h1>
        <motion.p variants={itemVariants} className="text-lg text-muted-foreground leading-relaxed">
          For over 20 years, PDi UK has been the trusted supply chain partner
          for leading UK universities, managing their international recruitment
          campaigns, prospectus distribution, and overseas agent packaging.
        </motion.p>
      </motion.div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-2xl font-bold mb-4">
            <TextRevealEffect text="End-to-End Recruitment Logistics" />
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            International student recruitment is a highly competitive and
            time-sensitive process. Having your marketing materials,
            prospectuses, and course directories arrive at global recruitment
            hubs and schools in perfect condition is crucial.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            PDi UK provides a fully integrated solution—from initial database
            preparation and custom packing to shipping coordination with
            discounted international postage rates.
          </p>
          <div className="space-y-3">
            {[
              "Bulk prospectus mailings directly to prospective applicants.",
              "Customized recruitment agent boxes hand-packed to spec.",
              "Coordination of delivery to international education fairs.",
              "Real-time inventory levels through the Virtual Warehouse.",
            ].map((bullet, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-foreground font-medium"
              >
                <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
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
              <Landmark className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">
                Domestic & International Bulk Mail
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Whether sending out 10,000 course guides within the UK or
                dispatching specialist folders to global overseas offices, we
                manage the complete database cleansing and mailing process.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0 h-fit">
              <Globe className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">
                Education Fair Deliveries
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We work directly with major international exhibition organizers,
                hotel venues, and freight agents to ensure materials arrive
                directly at fair stands in Asia, the Americas, Africa, and the
                Middle East.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Detail Cards */}
      <div className="mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl font-bold mb-8 text-center"
        >
          <TextRevealEffect text="Specific Sector Services" />
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
              <h3 className="font-bold text-lg mb-3">Prospectus Distribution</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automatic and manual data imports from your university's CRM
                system (such as Salesforce, CRM, or Gecko) to process individual
                and bulk prospectus mailings on a daily basis.
              </p>
            </SpotlightCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <SpotlightCard className="p-6 rounded-xl border border-border bg-card hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out h-full">
              <h3 className="font-bold text-lg mb-3">Agent Recruitment Packs</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Consolidated packing of merchandise, USBs, course guides, and
                display stands sent directly to your overseas agents and
                representative offices worldwide.
              </p>
            </SpotlightCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <SpotlightCard className="p-6 rounded-xl border border-border bg-card hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out h-full">
              <h3 className="font-bold text-lg mb-3">
                Stock Audit & Consolidation
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Regular audit reviews of stock holdings in our Aylesbury
                warehouse, ensuring old brochures are recycled and active
                publications are ready for fulfillment.
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
          <TextRevealEffect text="Ready to optimize university distribution?" />
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-6">
          Contact our specialist university logistics team to review your
          current processes, run a sample postage saving audit, and see a demo
          of our Virtual Warehouse system.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact">
            <Button variant="hero" size="hero" className="hover:scale-102 active:scale-98 transition-transform duration-200">
              Get in Touch
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="hero" className="hover:scale-102 active:scale-98 transition-transform duration-200">
              About PDi UK
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

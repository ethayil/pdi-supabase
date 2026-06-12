import { ArrowUpDown, Eye, Laptop, Lock, Warehouse } from "lucide-react";
import * as motion from "motion/react-client";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  SpotlightCard,
  TextRevealEffect,
} from "@/components/ui/text-reveal-effects";

export const metadata: Metadata = {
  title: "Virtual Warehouse & Stock Management | PDi UK",
  description:
    "Real-time remote stock level viewing, automated campaign ordering, and transaction logs without requiring technical training. Designed for universities and corporate teams.",
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

export default function VirtualWarehouse() {
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
          <Warehouse className="size-4" /> Real-Time Stock Management Portal
        </motion.div>
        <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          <TextRevealEffect text="Virtual Warehouse Solution" />
        </motion.h1>
        <motion.p variants={itemVariants} className="text-lg text-muted-foreground leading-relaxed">
          Manage your global inventory from anywhere in the world. Our Virtual
          Warehouse software offers complete transparency over stock holdings,
          transaction history, and dispatch tracking with zero training
          required.
        </motion.p>
      </motion.div>

      {/* Product Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold mb-4">
            <TextRevealEffect text="Line-of-Sight Stock Control" />
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The Virtual Warehouse acts as a remote extension of your marketing
            department. Instead of guessing how many brochures, folders, or
            banners you have left in storage, simply log in to view real-time
            balances.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Once items are requested for delivery, our warehouse operatives
            immediately print, pack, and ship them. You receive automatic
            notification logs with tracking links directly back to the system.
          </p>
          <div className="pt-4 flex flex-wrap gap-4">
            <Link href="/auth/signin">
              <Button size="hero" variant="rainbow" className="hover:scale-102 active:scale-98 transition-transform duration-200">
                Sign In to Portal
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="hero" variant="outline" className="hover:scale-102 active:scale-98 transition-transform duration-200">
                Request a Demo Account
              </Button>
            </Link>
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
              <Eye className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">
                Total Stock Visibility
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                See exact quantities of items stored in our Aylesbury facility.
                Keep track of print editions, reorder thresholds, and active vs.
                historical assets.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0 h-fit">
              <ArrowUpDown className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">
                Instant Campaign Dispatch
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Select products, specify quantities, paste/upload destination
                addresses, and submit. We handle the pick-and-pack workflow
                instantly.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl shrink-0 h-fit">
              <Lock className="size-6" />
            </div>
            <div>
              <h3 className="font-semibold text-base mb-1">
                Secure User Controls
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Assign user roles for different staff members. Set budget or
                quantity limits, approve requests, and review complete
                transaction logs.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Screen/Features Highlights */}
      <div className="mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl font-bold mb-8 text-center"
        >
          <TextRevealEffect text="Built for Quick Decisions" />
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
              <div className="p-2 bg-primary/10 text-primary rounded-lg w-fit mb-3">
                <Laptop className="size-4" />
              </div>
              <h3 className="font-bold text-base mb-2">Zero Training Needed</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Designed to be intuitive for busy university recruitment staff,
                marketing managers, and regional offices. Add items to a dispatch
                list exactly like shopping online.
              </p>
            </SpotlightCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <SpotlightCard className="p-6 rounded-xl border border-border bg-card hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out h-full">
              <div className="p-2 bg-primary/10 text-primary rounded-lg w-fit mb-3">
                <ArrowUpDown className="size-4" />
              </div>
              <h3 className="font-bold text-base mb-2">CRM Integrations</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sync address lists directly from your university CRM or customer
                relationship platform. Automate shipping orders for new prospect
                inquiries instantly.
              </p>
            </SpotlightCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <SpotlightCard className="p-6 rounded-xl border border-border bg-card hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out h-full">
              <div className="p-2 bg-primary/10 text-primary rounded-lg w-fit mb-3">
                <Lock className="size-4" />
              </div>
              <h3 className="font-bold text-base mb-2">Audit-Ready Logs</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every transaction is permanently logged. View historical
                dispatches, download spreadsheet reports, and audit
                department-wide print material usage in seconds.
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
          <TextRevealEffect text="See how the Virtual Warehouse works" />
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-6">
          Schedule a live screen-share demo. We'll show you how we connect
          Aylesbury warehouse inventory controls directly to your browser
          layout.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact">
            <Button variant="hero" size="hero" className="hover:scale-102 active:scale-98 transition-transform duration-200">
              Book a Portal Demo
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button variant="outline" size="hero" className="hover:scale-102 active:scale-98 transition-transform duration-200">
              Client Portal Sign In
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

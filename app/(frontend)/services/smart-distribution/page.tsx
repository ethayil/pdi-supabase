import {
  BarChart3,
  CheckCircle,
  Mail,
  Percent,
  TrendingDown,
} from "lucide-react";
import * as motion from "motion/react-client";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  SpotlightCard,
  TextRevealEffect,
} from "@/components/ui/text-reveal-effects";

export const metadata: Metadata = {
  title: "Smart Distribution & International Mail | PDi UK",
  description:
    "Save up to 30%+ on international mailings through UPS, DHL, and Royal Mail integrations. In-depth distribution consultancy audits and GDPR-compliant data cleansing.",
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

export default function SmartDistribution() {
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
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-4"
        >
          <Mail className="size-4" /> Smart Logistics & Global Mail
        </motion.div>
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
        >
          <TextRevealEffect text="Smart Distribution & Mail" />
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="text-lg text-muted-foreground leading-relaxed"
        >
          Unlock significant postage savings and run highly targeted mailing
          campaigns. By combining data cleansing, distribution consultancy, and
          direct carrier partnerships, we get your materials to market
          efficiently.
        </motion.p>
      </motion.div>

      {/* Main Benefits Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
      >
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl border border-border bg-card/50 hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out flex flex-col justify-between"
        >
          <div>
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl size-fit mb-4">
              <Percent className="size-5" />
            </div>
            <h3 className="font-bold text-lg mb-2">30%+ Postage Savings</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Leverage E-PickPack's high-volume agreements with leading carriers
              including DHL, UPS, and Royal Mail. We negotiate discounted
              international postal and courier rates, passing the cost savings
              directly to your campaigns.
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl border border-border bg-card/50 hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out flex flex-col justify-between"
        >
          <div>
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl size-fit mb-4">
              <CheckCircle className="size-5" />
            </div>
            <h3 className="font-bold text-lg mb-2">GDPR Data Cleansing</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Prevent returned mail and wasted print budgets. We run
              address-matching software, cleanse duplicates, verify ZIP/postal
              codes, and ensure total compliance with UK GDPR and global data
              regulations before shipping.
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="p-6 rounded-2xl border border-border bg-card/50 hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out flex flex-col justify-between"
        >
          <div>
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl size-fit mb-4">
              <BarChart3 className="size-5" />
            </div>
            <h3 className="font-bold text-lg mb-2">Logistics Auditing</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Unsure if you are overpaying for global shipping? Our logistics
              consultants analyze your current distribution matrices, package
              weights, destinations, and carrier agreements to find quick-win
              savings and structural optimizations.
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Overview Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-2xl font-bold mb-4">
            <TextRevealEffect text="Optimized Mailings, Less Waste" />
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4 text-justify">
            At PDi UK, we believe distribution is more than just shipping boxes.
            It requires a smart, analytical approach to database management and
            courier consolidation.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6 text-justify">
            By cleansing recipient data first, we verify that addresses are
            correct and up-to-date. This decreases returns by up to 15% and
            saves thousands of pounds in wasted print production and shipping
            tariffs.
          </p>
          <div className="p-5 rounded-xl border border-primary/20 bg-primary/5 flex gap-4">
            <TrendingDown className="size-8 text-primary shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-foreground">
                Postage Cost Audit
              </h4>
              <p className="text-xs text-muted-foreground leading-normal mt-0.5">
                We offer a free, no-obligation audit of your university or
                corporate shipping invoices from the last 3 months to
                demonstrate exactly how much you can save under our smart
                distribution framework.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <SpotlightCard className="p-6 rounded-xl border border-border bg-card hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out">
            <h3 className="font-bold text-sm mb-1.5">
              International Mail & Packets
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Cost-effective delivery of prospectuses, trade catalogs,
              directories, and corporate publications globally with detailed
              tracking and delivery confirmations.
            </p>
          </SpotlightCard>

          <SpotlightCard className="p-6 rounded-xl border border-border bg-card hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out">
            <h3 className="font-bold text-sm mb-1.5">Express Global Courier</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When timeliness is critical, our express courier options deliver
              corporate documents, exhibition collateral, and time-sensitive
              campaign kits with next-day options to major cities.
            </p>
          </SpotlightCard>
        </motion.div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="bg-primary/5 border border-primary/20 rounded-2xl p-8 md:p-12 text-center"
      >
        <h2 className="text-2xl font-bold mb-4">
          <TextRevealEffect text="Ready to cut your postage costs?" />
        </h2>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-6">
          Connect with our smart distribution specialists. We'll run a custom
          audit on your shipping profile to show how PDi UK can reduce budgets.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact">
            <Button
              variant="hero"
              size="hero"
              className="hover:scale-102 active:scale-98 transition-transform duration-200"
            >
              Request Free Audit
            </Button>
          </Link>
          <Link href="/services/virtual-warehouse">
            <Button
              variant="outline"
              size="hero"
              className="hover:scale-102 active:scale-98 transition-transform duration-200"
            >
              Virtual Warehouse Demo
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

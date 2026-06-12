import { FileText } from "lucide-react";
import * as motion from "motion/react-client";
import type { Metadata } from "next";
import { TextRevealEffect } from "@/components/ui/text-reveal-effects";

export const metadata: Metadata = {
  title: "Terms & Conditions | PDi UK",
  description:
    "Terms and Conditions governing the use of PDi UK's logistics services, Virtual Warehouse portal, and print fulfillment contracts.",
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
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

export default function TermsConditions() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
        <FileText className="size-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">
          <TextRevealEffect text="Terms & Conditions" />
        </h1>
      </motion.div>
      
      <motion.p variants={itemVariants} className="text-xs text-muted-foreground mb-8">
        Last updated: June 2026
      </motion.p>

      <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
        <motion.section variants={itemVariants}>
          <h2 className="text-lg font-bold text-foreground mb-3">
            <TextRevealEffect text="1. Agreement to Terms" />
          </h2>
          <p>
            By accessing our website, utilizing our Virtual Warehouse Client
            Portal, or signing a contract with E-PickPack Limited (trading as
            PDi UK), you agree to be bound by these Terms and Conditions. If you
            disagree with any part of these terms, you must not use our
            services.
          </p>
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 className="text-lg font-bold text-foreground mb-3">
            <TextRevealEffect text="2. Service Definition" />
          </h2>
          <p>
            PDi UK offers warehousing, custom print management, hand-packing,
            agent kit collation, database cleansing, and international
            mail/express courier distribution services. All fulfillment
            operations are executed from our facility in Aylesbury.
          </p>
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 className="text-lg font-bold text-foreground mb-3">
            <TextRevealEffect text="3. Deliveries and Carrier Limitations" />
          </h2>
          <p>
            While PDi UK coordinates all dispatches with leading carriers
            (including DHL, UPS, and Royal Mail) and manages export
            documentation, we do not accept liability for:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              Postage or customs clearance delays in destination countries.
            </li>
            <li>Customs duties, import taxes, or local clearance fees.</li>
            <li>Inaccuracies in shipping databases provided by the client.</li>
          </ul>
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 className="text-lg font-bold text-foreground mb-3">
            <TextRevealEffect text="4. Client Portal & Virtual Warehouse" />
          </h2>
          <p>
            Clients are granted a non-transferable, revocable license to access
            the Virtual Warehouse portal. You are responsible for keeping your
            login credentials confidential. PDi UK reserves the right to suspend
            accounts that display suspicious or unauthorized API requests.
          </p>
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 className="text-lg font-bold text-foreground mb-3">
            <TextRevealEffect text="5. Storage and Inventory Limits" />
          </h2>
          <p>
            Stored inventory must not contain hazardous, illegal, or highly
            inflammable items. We reserve the right to audit storage shelves and
            recycle outdated catalogs/materials after giving 30 days notice to
            the client.
          </p>
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 className="text-lg font-bold text-foreground mb-3">
            <TextRevealEffect text="6. Governing Law" />
          </h2>
          <p>
            These terms are governed by and construed in accordance with the
            laws of England and Wales. Any disputes arising out of or in
            connection with these terms shall be subject to the exclusive
            jurisdiction of the English courts.
          </p>
          <p className="mt-4">
            If you have questions regarding these terms, please contact us at{" "}
            <strong>contact@e-pickpack.co.uk</strong>.
          </p>
        </motion.section>
      </div>
    </motion.div>
  );
}

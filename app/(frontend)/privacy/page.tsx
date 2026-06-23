import { ShieldCheck } from "lucide-react";
import * as motion from "motion/react-client";
import type { Metadata } from "next";
import { TextRevealEffect } from "@/components/ui/text-reveal-effects";

export const metadata: Metadata = {
  title: "Privacy Policy | PDi UK",
  description:
    "Privacy Policy for E-PickPack Limited trading as PDi UK. Detail of how we process databases, recipient addresses, and client portal credentials under UK GDPR.",
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

export default function PrivacyPolicy() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans"
    >
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-3 mb-6"
      >
        <ShieldCheck className="size-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">
          <TextRevealEffect text="Privacy Policy" />
        </h1>
      </motion.div>

      <motion.p
        variants={itemVariants}
        className="text-xs text-muted-foreground mb-8"
      >
        Last updated: June 2026
      </motion.p>

      <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
        <motion.section variants={itemVariants}>
          <h2 className="text-lg font-bold text-foreground mb-3">
            <TextRevealEffect text="1. Introduction" />
          </h2>
          <p>
            E-PickPack Limited (trading as PDi UK, "we", "us", "our") is
            committed to protecting and respecting the privacy of our clients,
            university partners, and individual mail recipients. This policy
            outlines how we process personal data collected through our website,
            Client Portal (Virtual Warehouse), and database dispatches.
          </p>
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 className="text-lg font-bold text-foreground mb-3">
            <TextRevealEffect text="2. Data Controller" />
          </h2>
          <p>
            For the purpose of UK Data Protection Legislation (including UK GDPR
            and the Data Protection Act 2018), E-PickPack Limited is the data
            controller for our website visitor data.
          </p>
          <p className="mt-2">
            When processing prospectus lists, student recruitment records, or
            event campaign address databases provided by UK universities or
            corporate entities, we act as a <strong>Data Processor</strong>. Our
            clients act as the Data Controllers.
          </p>
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 className="text-lg font-bold text-foreground mb-3">
            <TextRevealEffect text="3. Information We Collect" />
          </h2>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <strong>Client Information:</strong> Contact names, job titles,
              business emails, telephone numbers, and billing details provided
              during account configuration.
            </li>
            <li>
              <strong>Fulfillment Databases:</strong> Address records, student
              recipient names, and ZIP/postal codes uploaded to the Virtual
              Warehouse for the purpose of shipping prospectus bundles,
              brochures, or corporate mailings.
            </li>
            <li>
              <strong>Website Analytics:</strong> IP address, browser type, page
              interactions, and timestamps collected via cookies for service
              improvements.
            </li>
          </ul>
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 className="text-lg font-bold text-foreground mb-3">
            <TextRevealEffect text="4. How We Use and Protect Data" />
          </h2>
          <p>
            We process databases strictly to complete physical printing,
            packaging, and shipping dispatches.
          </p>
          <p className="mt-2">
            Our data security measures include secure SSL logins to the Virtual
            Warehouse, restricted staff folders, and a strict database retention
            schedule.{" "}
            <strong>
              We do not sell, rent, or distribute recipient records to third
              parties.
            </strong>{" "}
            Address records are permanently deleted from our active database
            systems 30 days after campaign completion.
          </p>
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 className="text-lg font-bold text-foreground mb-3">
            <TextRevealEffect text="5. Data Storage Location" />
          </h2>
          <p>
            All physical packaging operations and secure server storage are
            located in 5 Rabans Lane, Aylesbury HP19 8RT, United Kingdom. We do
            not transfer mailing list records outside the United Kingdom or
            European Economic Area (EEA) unless explicitly requested by the Data
            Controller for international carrier routing (e.g. UPS/DHL customs
            labels).
          </p>
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 className="text-lg font-bold text-foreground mb-3">
            <TextRevealEffect text="6. Your Rights" />
          </h2>
          <p>
            Under UK GDPR, you have the right to request access to the personal
            data we hold, request correction or deletion, restrict processing,
            or lodge a complaint with the Information Commissioner's Office
            (ICO).
          </p>
          <p className="mt-2">
            If you have questions regarding this policy, please contact our data
            protection team at <strong>contact@e-pickpack.co.uk</strong>.
          </p>
        </motion.section>
      </div>
    </motion.div>
  );
}

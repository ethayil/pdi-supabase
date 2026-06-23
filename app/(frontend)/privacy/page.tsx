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
              <strong>Client & User Account Information:</strong> Contact name,
              business email, telephone number, job title, and billing details provided
              during account configuration or portal usage.
            </li>
            <li>
              <strong>Order & Fulfillment Details:</strong> Recipient names,
              delivery address records, recipient phone numbers, and recipient email addresses
              provided when placing logistics and distribution orders (for tracking and dispatch notification purposes).
            </li>
            <li>
              <strong>Website Cookies:</strong> We only use strictly necessary
              cookies and storage elements to enable core features like user authentication,
              secure login, theme preferences, and banner choices. We do not use
              any marketing or tracking cookies.
            </li>
          </ul>
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 className="text-lg font-bold text-foreground mb-3">
            <TextRevealEffect text="3.1. Cookies and Local Storage" />
          </h2>
          <p className="mb-4">
            We use a limited number of strictly necessary cookies and local storage items to keep our systems secure, function correctly, and remember your choices. These are detailed below:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left border border-border rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-foreground">Cookie/Storage Item</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-foreground">Type</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-foreground">Duration</th>
                  <th className="p-3 text-xs font-semibold uppercase tracking-wider text-foreground">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr className="hover:bg-muted/10">
                  <td className="p-3 font-medium text-foreground">Secure Session</td>
                  <td className="p-3">Cookie</td>
                  <td className="p-3">Session / 1 Month</td>
                  <td className="p-3 text-muted-foreground">Maintains your authenticated session for the client portal.</td>
                </tr>
                <tr className="hover:bg-muted/10">
                  <td className="p-3 font-medium text-foreground">Theme Preference</td>
                  <td className="p-3">Cookie / Local Storage</td>
                  <td className="p-3">Persistent</td>
                  <td className="p-3 text-muted-foreground">Remembers your dark/light/system theme preference.</td>
                </tr>
                <tr className="hover:bg-muted/10">
                  <td className="p-3 font-medium text-foreground">Consent Choice</td>
                  <td className="p-3">Local Storage</td>
                  <td className="p-3">Persistent (1 Year)</td>
                  <td className="p-3 text-muted-foreground">Remembers that you have dismissed this cookie consent banner.</td>
                </tr>
              </tbody>
            </table>
          </div>
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

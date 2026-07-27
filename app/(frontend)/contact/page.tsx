import { Clock, Mail, MapPin, Phone } from "lucide-react";
import * as motion from "motion/react-client";
import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/contact-form";
import { TextRevealEffect } from "@/components/ui/text-reveal-effects";

export const metadata: Metadata = {
  title: "Contact PDi UK | Request a Quote",
  description:
    "Get in touch with PDi UK's Aylesbury logistics team. Call +44 (0) 1296-601-570 or email contact@e-pickpack.co.uk to optimize your university and corporate distribution.",
};

import { containerVariants, itemVariants } from "@/lib/constants/animations";

export default function ContactUs() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
    >
      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
        >
          <TextRevealEffect text="Contact Our Team" />
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="text-lg text-muted-foreground leading-relaxed"
        >
          Have an upcoming prospectus mailing, exhibition stand delivery, or
          need a logistics postage cost audit? Reach out using the details
          below.
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          <div>
            <h2 className="text-2xl font-bold mb-6">
              <TextRevealEffect text="Get In Touch" />
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 text-justify">
              Our support team and logistics consultants are based in Aylesbury,
              UK. We are available to answer shipping inquiries, configure
              Virtual Warehouse logins, and audit courier invoices.
            </p>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:-translate-y-1 hover:shadow-md hover:border-primary/20 transition-all duration-300 ease-out">
              <Phone className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-0.5">
                  Telephone
                </h3>
                <p className="text-muted-foreground">+44 (0) 1296-601-570</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:-translate-y-1 hover:shadow-md hover:border-primary/20 transition-all duration-300 ease-out">
              <Mail className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-0.5">
                  Email Inquiries
                </h3>
                <a
                  href="mailto:contact@e-pickpack.co.uk"
                  className="text-primary hover:underline font-medium"
                >
                  contact@e-pickpack.co.uk
                </a>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:-translate-y-1 hover:shadow-md hover:border-primary/20 transition-all duration-300 ease-out">
              <MapPin className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-0.5">
                  Registered Office
                </h3>
                <p className="text-muted-foreground leading-normal">
                  5 Rabans Lane,
                  <br />
                  Aylesbury, Buckinghamshire,
                  <br />
                  HP19 8RT, United Kingdom
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl border border-border bg-card hover:-translate-y-1 hover:shadow-md hover:border-primary/20 transition-all duration-300 ease-out">
              <Clock className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-0.5">
                  Business Hours
                </h3>
                <p className="text-muted-foreground">
                  Monday to Friday: 8:30 AM - 5:00 PM (GMT)
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <ContactForm />
        </motion.div>
      </div>
    </motion.div>
  );
}

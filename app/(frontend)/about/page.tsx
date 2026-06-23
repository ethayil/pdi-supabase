import { Compass, History, Milestone, Users } from "lucide-react";
import * as motion from "motion/react-client";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AnimatedNumber,
  SpotlightCard,
  TextRevealEffect,
} from "@/components/ui/text-reveal-effects";

export const metadata: Metadata = {
  title: "About PDi UK | 20+ Years in Global Logistics",
  description:
    "Learn about E-PickPack Ltd trading as PDi UK. Providing tailored university recruitment mailing and corporate event logistics since 2004 from Aylesbury.",
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

export default function AboutUs() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
    >
      {/* Hero Header */}
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
          <History className="size-4" /> Established in 2004
        </motion.div>
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl font-bold tracking-tight mb-6"
        >
          <TextRevealEffect text="About PDi UK" />
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="text-lg text-muted-foreground leading-relaxed"
        >
          PDi is a trading name of E-PickPack Limited. For over two decades, we
          have partnered with UK universities and corporate teams to deliver
          print, fulfillment, and global mailing solutions.
        </motion.p>
      </motion.div>

      {/* History & Story Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold mb-4">
            <TextRevealEffect text="Our Journey" />
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed text-justify">
            Founded in 2004, e-PickPack recognized that university marketing
            departments and corporate communications teams were struggling with
            complex shipping rules, incomplete data, and high international
            postage rates.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed text-justify">
            We developed a total solution: blending physical print and warehouse
            storage in Aylesbury with custom-built inventory management software
            (our Virtual Warehouse) and direct bulk mail partnerships. This
            allows our clients to manage global campaigns straight from their
            web browser.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-muted/40 border border-border rounded-2xl p-8 space-y-6"
        >
          <div className="grid grid-cols-2 gap-6">
            <div className="border-b border-border pb-4">
              <span className="text-3xl font-extrabold text-primary">
                <AnimatedNumber value={2004} duration={1.5} disableGrouping />
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Year Established
              </p>
            </div>
            <div className="border-b border-border pb-4">
              <span className="text-3xl font-extrabold text-primary">
                <AnimatedNumber value={100} suffix="+" duration={1.5} />
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Countries Served
              </p>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-primary">
                <AnimatedNumber value={30} suffix="%+" duration={1.5} />
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Postage Discount
              </p>
            </div>
            <div>
              <span className="text-3xl font-extrabold text-primary">
                <AnimatedNumber value={15} suffix="M+" duration={1.5} />
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                Mailings Fulfilled
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Core Values */}
      <div className="mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl font-bold mb-8 text-center font-sans"
        >
          <TextRevealEffect text="Our Operating Values" />
        </motion.h2>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants}>
            <SpotlightCard className="p-6 rounded-xl border border-border bg-card hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out">
              <div className="p-2 bg-primary/10 text-primary rounded-lg w-fit mb-3">
                <Users className="size-4" />
              </div>
              <h3 className="font-bold text-base mb-2">Sector Focus</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We specialize specifically in the higher education and corporate
                events sectors, understanding university recruitment cycles and
                strict trade show setup deadlines.
              </p>
            </SpotlightCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <SpotlightCard className="p-6 rounded-xl border border-border bg-card hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out">
              <div className="p-2 bg-primary/10 text-primary rounded-lg w-fit mb-3">
                <Milestone className="size-4" />
              </div>
              <h3 className="font-bold text-base mb-2">Postage Efficiency</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                By auditing recipient lists and packaging weights, we actively
                prevent waste, ensuring our partners pay only for successful
                deliveries.
              </p>
            </SpotlightCard>
          </motion.div>

          <motion.div variants={itemVariants}>
            <SpotlightCard className="p-6 rounded-xl border border-border bg-card hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out">
              <div className="p-2 bg-primary/10 text-primary rounded-lg w-fit mb-3">
                <Compass className="size-4" />
              </div>
              <h3 className="font-bold text-base mb-2">GDPR Compliance</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We are fully registered in the UK and adhere to UK GDPR
                regulations. All client databases are securely processed and
                deleted following campaign dispatches.
              </p>
            </SpotlightCard>
          </motion.div>
        </motion.div>
      </div>

      {/* Company Info Box & CTA */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-8"
      >
        <div className="bg-card border border-border rounded-2xl p-8 text-center text-xs text-muted-foreground leading-relaxed shadow-xs">
          <p className="font-semibold text-foreground text-sm mb-2">
            Legal Entity Information
          </p>
          <p>
            PDi is a trading name of E-PickPack Limited, registered in England
            and Wales under Company No. 06404412.
            <br />
            Registered Office: 5 Rabans Lane, Aylesbury, Buckinghamshire, HP19
            8RT, United Kingdom.
          </p>
        </div>

        <div className="text-center">
          <Link href="/contact">
            <Button
              variant="hero"
              size="hero"
              className="hover:scale-102 active:scale-98 transition-transform duration-200"
            >
              Get in Touch
            </Button>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

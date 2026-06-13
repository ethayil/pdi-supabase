/** biome-ignore-all lint/suspicious/noArrayIndexKey: index is required*/

import {
  Briefcase,
  CheckCircle,
  ChevronRight,
  GraduationCap,
  Mail,
  Quote,
  Star,
  Warehouse,
} from "lucide-react";
import * as motion from "motion/react-client";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { EarthHero } from "@/components/ui/earth-hero";
import { GlowingIcon } from "@/components/ui/glowing-icon";
import {
  GridBackgroundPattern,
  SpotlightCard,
  TextRevealEffect,
} from "@/components/ui/text-reveal-effects";
import WorldMap from "@/components/ui/world-map";

export const metadata: Metadata = {
  title: "PDi UK - Global University Distribution & Corporate Logistics",
  description:
    "PDi UK (trading as E-PickPack Ltd) excels since 2004 in printing, warehousing, and distributing marketing materials for UK universities and corporate events globally with unparalleled timeliness and efficiency.",
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
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

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto relative px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="relative min-h-[calc(100svh-8rem)] flex items-center lg:grid lg:grid-cols-2 lg:gap-16 py-12 lg:py-0">
        <GridBackgroundPattern />

        {/* Globe — absolute background on mobile, right column on desktop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="absolute inset-0 overflow-hidden flex items-center justify-center lg:overflow-visible lg:relative lg:inset-auto lg:order-2 pointer-events-none lg:pointer-events-auto"
        >
          <div className="w-full max-w-[600px] lg:max-w-full aspect-square opacity-40 lg:opacity-100 scale-140 lg:scale-100 transition-opacity">
            <Suspense fallback={null}>
              <EarthHero />
            </Suspense>
          </div>
        </motion.div>

        {/* Text content — left column on desktop, always on top */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative z-10 lg:order-1"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center rounded-full border border-border bg-background/60 px-3 py-1 text-sm text-muted-foreground mb-6 backdrop-blur-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
            Specialists in University & Corporate Logistics
          </motion.div>

          <motion.div variants={itemVariants} className="mb-6">
            <TextRevealEffect
              text="Global Distribution, Simplified."
              className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tighter text-foreground leading-[1.1]"
            />
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed"
          >
            PDi UK (trading as E-PickPack Ltd) excels since 2004 in printing,
            warehousing, and distributing marketing materials for UK
            universities and corporate entities worldwide with unmatched
            accuracy and speed.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-start w-full sm:w-auto"
          >
            <Link href="/contact" className="w-full sm:w-auto">
              <Button
                variant="hero"
                size="hero"
                className="w-full hover:scale-102 active:scale-98 transition-transform duration-200"
              >
                Get a Quote
              </Button>
            </Link>
            <Link href="/about" className="w-full sm:w-auto">
              <Button
                size="hero"
                variant="outline"
                className="w-full hover:scale-102 active:scale-98 transition-transform duration-200"
              >
                Learn More
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-rows-none lg:grid-rows-2 gap-4 h-auto lg:h-[520px]">
        {/* Global Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-1 md:col-span-2 row-span-2"
        >
          <SpotlightCard className="h-full rounded-xl border border-border bg-card shadow-sm hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out">
            <div className="p-8 relative overflow-hidden group h-full">
              <div className="relative z-20 h-full flex flex-col justify-between pointer-events-none">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <GlowingIcon icon="Globe" color="#0ea5e9" />
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">
                      University Global Distribution
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm max-w-xs">
                    Coordinating deliveries of prospectus bundles, exhibition
                    collateral, and agent packages to international education
                    fairs and offices in over 100+ countries.
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tighter text-foreground">
                    20+
                  </span>
                  <span className="text-sm text-muted-foreground font-medium">
                    Years Serving UK Universities
                  </span>
                </div>
              </div>
              <div className="absolute top-0 lg:top-40 right-0 left-0 bottom-0 z-10 opacity-40">
                <WorldMap
                  dots={[
                    {
                      start: { lat: 51.5074, lng: -0.1278 }, // London
                      end: { lat: 40.7128, lng: -74.006 }, // NY
                    },
                    {
                      start: { lat: 51.5074, lng: -0.1278 },
                      end: { lat: 19.076, lng: 72.8777 }, // India
                    },
                    {
                      start: { lat: 51.5074, lng: -0.1278 },
                      end: { lat: 1.3521, lng: 103.8198 }, // Singapore
                    },
                    {
                      start: { lat: 51.5074, lng: -0.1278 },
                      end: { lat: -33.8688, lng: 151.2093 }, // Sydney
                    },
                  ]}
                  lineColor="#0ea5e9"
                />
              </div>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Virtual Warehousing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-1 row-span-1"
        >
          <SpotlightCard className="h-full rounded-xl border border-border bg-card shadow-sm hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out">
            <div className="p-6 flex flex-col justify-between h-full">
              <div className="flex justify-between items-start">
                <GlowingIcon icon="Warehouse" color="#10b981" />
                <span className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-600 dark:text-green-500">
                  Secure Software
                </span>
              </div>
              <div>
                <h4 className="font-semibold mb-1 text-foreground tracking-tight">
                  Virtual Warehouse
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Real-time stock level monitoring and remote campaign ordering
                  with no training required.
                </p>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Client Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-1 row-span-2"
        >
          <SpotlightCard className="h-full rounded-xl border border-border bg-card shadow-sm hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out">
            <div className="p-6 flex flex-col relative overflow-hidden h-full">
              <div className="flex items-center gap-2 mb-6">
                <Quote className="text-muted-foreground fill-current size-5" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Partner Reviews
                </h3>
              </div>
              <div className="space-y-4 relative z-10">
                {[
                  {
                    name: "University Director",
                    text: '"PDi\'s Virtual Warehouse gave us complete control over marketing stock for international recruitment fairs."',
                    delay: 0.1,
                  },
                  {
                    name: "Operations Manager",
                    text: '"The postage savings alone made moving to PDi UK the best supply chain decision we made this year."',
                    delay: 0.2,
                  },
                ].map((review) => (
                  <motion.div
                    key={review.name}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: review.delay }}
                    className="p-3 rounded-lg bg-background border border-border text-xs text-foreground"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">
                        {review.name}
                      </span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="text-yellow-500 size-2.5 fill-current"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground italic leading-relaxed">
                      {review.text}
                    </p>
                  </motion.div>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-card to-transparent z-20"></div>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Global Mailing Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-1 row-span-1"
        >
          <SpotlightCard className="h-full rounded-xl border border-border bg-card shadow-sm hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out">
            <div className="p-6 flex flex-col justify-end h-full">
              <div className="mb-4">
                <div className="text-3xl font-bold tracking-tighter mb-1 text-foreground">
                  30%+
                </div>
                <div className="text-sm text-muted-foreground font-semibold">
                  Postage Savings
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  On international mailings compared to standard postal tariffs.
                </p>
              </div>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>

      {/* Services Grid Section */}
      <div className="mt-24 mb-12 text-center" id="solutions">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">
          Our Services
        </h2>
        <TextRevealEffect
          text="Core Distribution Solutions"
          className="text-3xl md:text-5xl font-bold tracking-tighter mb-4"
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-muted-foreground text-lg max-w-2xl mx-auto"
        >
          Providing end-to-end logistics solutions, postage discount analysis,
          and specialist storage.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: GraduationCap,
            title: "University Distribution",
            desc: "Expert distribution of prospectus brochures and agent materials directly to global recruitment offices and education fairs.",
            color: "#0ea5e9",
            href: "/services/university-distribution",
          },
          {
            icon: Mail,
            title: "Smart Distribution",
            desc: "Leverage direct partnerships with major carriers like UPS, DHL, and Royal Mail to secure massive international mail discounts.",
            color: "#1fbfe4",
            href: "/services/smart-distribution",
          },
          {
            icon: Warehouse,
            title: "Virtual Warehouse",
            desc: "Our secure web portal gives you complete real-time stock visibility and lets you order distribution campaigns in a few clicks.",
            color: "#3b82f6",
            href: "/services/virtual-warehouse",
          },
          {
            icon: Briefcase,
            title: "Corporate & Event Logistics",
            desc: "Worry-free delivery and management of trade show stands, conference materials, annual reports, and shareholder mailings.",
            color: "#6366f1",
            href: "/services/corporate-event-logistics",
          },
          {
            icon: CheckCircle,
            title: "Data Cleansing",
            desc: "GDPR-compliant database management, address validation, and cleansing to eliminate wasted printing and postage costs.",
            color: "#8b5cf6",
            href: "/services/smart-distribution",
          },
          {
            icon: Warehouse,
            title: "Specialist Storage",
            desc: "Secure, climate-controlled warehousing in Aylesbury dedicated to storing brochures, marketing merchandise, and banners.",
            color: "#ec4899",
            href: "/services/corporate-event-logistics",
          },
          {
            icon: CheckCircle,
            title: "Fulfillment & Packaging",
            desc: "Hand-packing of customized agent recruitment toolkits, prospectus packs, and conference attendee boxes.",
            color: "#f43f5e",
            href: "/services/smart-distribution",
          },
          {
            icon: ChevronRight,
            title: "Logistics Consultancy",
            desc: "In-depth audit of your current shipping methods to identify inefficiencies and structural postage saving opportunities.",
            color: "#f59e0b",
            href: "/services/smart-distribution",
          },
        ].map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: (idx % 4) * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link href={feature.href}>
                <SpotlightCard className="h-full rounded-xl border border-border bg-card hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 ease-out cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0"
                        style={{ color: feature.color }}
                      >
                        <Icon className="size-5" />
                      </div>
                      <h3 className="font-semibold text-foreground text-sm hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </SpotlightCard>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

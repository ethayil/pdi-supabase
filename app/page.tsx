/** biome-ignore-all lint/suspicious/noArrayIndexKey: id is required*/
import {
  ArrowRightToLineIcon,
  GitBranch,
  Link2Off,
  Package,
  Quote,
  ScanFace,
  Star,
} from "lucide-react";
import * as motion from "motion/react-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EarthHero } from "@/components/ui/earth-hero";
import { GlowingIcon } from "@/components/ui/glowing-icon";
import {
  GridBackgroundPattern,
  SpotlightCard,
  TextRevealEffect,
} from "@/components/ui/text-reveal-effects";
import WorldMap from "@/components/ui/world-map";

export default function Home() {
  return (
    <div className="bg-background text-foreground font-sans min-h-screen flex flex-col overflow-x-hidden">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-foreground rounded-md flex items-center justify-center">
                <Package className="text-background text-xl fill-current" />
              </div>
              <span className="font-bold text-xl tracking-tight">PDI UK</span>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
              {["Solutions", "Platform", "Developers", "Company"].map(
                (item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.1 + i * 0.05,
                      ease: "easeOut",
                    }}
                  >
                    <Link
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      href="#"
                    >
                      {item}
                    </Link>
                  </motion.div>
                ),
              )}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            >
              <Link href="/auth/signin" className="flex items-center gap-2">
                <Button size="hero" variant="rainbow">
                  Dashboard
                  <ArrowRightToLineIcon className="size-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      <main className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto relative">
          {/* Hero Section */}
          <div className="relative min-h-[calc(100svh-4rem)] flex items-center lg:grid lg:grid-cols-2 lg:gap-16 px-4 sm:px-6 lg:px-8 py-12 lg:py-0">
            <GridBackgroundPattern />

            {/* Globe — absolute background on mobile, right column on desktop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="absolute inset-0 overflow-hidden flex items-center justify-center lg:overflow-visible lg:relative lg:inset-auto lg:order-2 pointer-events-none lg:pointer-events-auto"
            >
              <div className="w-full max-w-[600px] lg:max-w-full aspect-square opacity-40 lg:opacity-100 scale-140 lg:scale-100 transition-opacity">
                <EarthHero />
              </div>
            </motion.div>
            {/* Text content — left column on desktop, always on top */}
            <div className="relative z-10 lg:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                className="inline-flex items-center rounded-full border border-border bg-background/60 px-3 py-1 text-sm text-muted-foreground mb-6 backdrop-blur-sm"
              >
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                Advanced Logistics Engine v2.0
              </motion.div>

              <div className="mb-6">
                <TextRevealEffect
                  text="Logistics, Redefined."
                  className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tighter text-foreground leading-[1.1]"
                />
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.3, ease: "easeOut" }}
                className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed"
              >
                PDi UK empowers your supply chain with advanced distribution and
                fulfillment solutions. Experience the future of global logistics
                with our interactive platform.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.4, ease: "easeOut" }}
                className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-start w-full sm:w-auto px-4 sm:px-0"
              >
                <Button variant="hero" size="hero" className="w-full sm:w-auto">
                  Get Started
                </Button>
                <Button
                  size="hero"
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  Contact Sales
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Bento cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-rows-none lg:grid-rows-2 gap-4 h-auto lg:h-[520px]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="col-span-1 md:col-span-2 row-span-2"
            >
              <SpotlightCard className="h-full rounded-xl border border-border bg-card shadow-sm transition-all hover:border-foreground/20">
                <div className="p-8 relative overflow-hidden group h-full">
                  <div className="relative z-20 h-full flex flex-col justify-between pointer-events-none">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <GlowingIcon icon="Globe" color="#0ea5e9" />
                        <h3 className="text-xl font-semibold tracking-tight text-foreground">
                          Global Distribution
                        </h3>
                      </div>
                      <p className="text-muted-foreground text-sm max-w-xs">
                        Seamless international shipping and network optimization
                        across major continents.
                      </p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold tracking-tighter text-foreground">
                        142
                      </span>
                      <span className="text-sm text-muted-foreground font-medium">
                        Active Hubs
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-0 lg:top-40 right-0 left-0 bottom-0 z-10 opacity-40">
                    <WorldMap
                      dots={[
                        {
                          start: { lat: 51.5074, lng: -0.1278 },
                          end: { lat: 40.7128, lng: -74.006 },
                        },
                        {
                          start: { lat: 51.5074, lng: -0.1278 },
                          end: { lat: 19.076, lng: 72.8777 },
                        },
                        {
                          start: { lat: 51.5074, lng: -0.1278 },
                          end: { lat: -23.5505, lng: -46.6333 },
                        },
                        {
                          start: { lat: 51.5074, lng: -0.1278 },
                          end: { lat: 35.6762, lng: 139.6503 },
                        },
                      ]}
                      lineColor="#0ea5e9"
                    />
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="col-span-1 row-span-1"
            >
              <SpotlightCard className="h-full rounded-xl border border-border bg-card shadow-sm transition-all hover:border-foreground/20">
                <div className="p-6 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                    <GlowingIcon icon="Crosshair" color="#10b981" />
                    <span className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-600 dark:text-green-500">
                      Live
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-foreground tracking-tight">
                      Real-time Tracking
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Precision GPS visibility across your entire supply chain.
                    </p>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="col-span-1 row-span-2"
            >
              <SpotlightCard className="h-full rounded-xl border border-border bg-card shadow-sm transition-all hover:border-foreground/20">
                <div className="p-6 flex flex-col relative overflow-hidden h-full">
                  <div className="flex items-center gap-2 mb-6">
                    <Quote className="text-muted-foreground fill-current" />
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Feedback
                    </h3>
                  </div>
                  <div className="space-y-4 relative z-10">
                    {[
                      {
                        name: "Alex Chen",
                        text: '"Efficiency increased by 40% in just two months."',
                        delay: 0.2,
                      },
                      {
                        name: "Sarah Jones",
                        text: '"PDI\'s dotted map visualization gave us clarity we never had."',
                        delay: 0.3,
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
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-zinc-700"></div>
                            <span className="font-medium text-foreground">
                              {review.name}
                            </span>
                          </div>
                          <Star className="text-yellow-600 text-[10px] fill-current" />
                        </div>
                        <p className="text-muted-foreground">{review.text}</p>
                      </motion.div>
                    ))}
                    <div className="p-3 rounded-lg bg-background/50 border border-border/50 text-xs opacity-50 text-foreground">
                      <p className="text-muted-foreground">
                        &quot;Seamless integration...&quot;
                      </p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-card to-transparent z-20"></div>
                </div>
              </SpotlightCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="col-span-1 row-span-1"
            >
              <SpotlightCard className="h-full rounded-xl border border-border bg-card shadow-sm hover:bg-muted/50 transition-all hover:border-foreground/20 ">
                <div className="p-6 flex flex-col justify-end h-full">
                  <div className="mb-4">
                    <div className="text-3xl font-bold tracking-tighter mb-1 text-foreground">
                      542k+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Units Managed
                    </div>
                  </div>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "85%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                      className="bg-primary h-full rounded-full"
                    />
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          </div>

          {/* Features grid */}
          <div className="mt-24 mb-12 text-center">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-primary mb-2">
              Features
            </h2>
            <TextRevealEffect
              text="Our Core Solutions"
              className="text-3xl md:text-5xl font-bold tracking-tighter mb-4"
            />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
            >
              Everything you need to manage your global supply chain in one
              place.
            </motion.p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: "Headset",
                title: "24/7 Support",
                desc: "Dedicated logistics experts available round the clock.",
                color: "#0ea5e9",
              },
              {
                icon: "Lock",
                title: "Secure Storage",
                desc: "ISO-certified warehousing with biometric security.",
                color: "#1fbfe4",
              },
              {
                icon: "Truck",
                title: "Rapid Fulfillment",
                desc: "Same-day processing for 98% of domestic orders.",
                color: "#3b82f6",
              },
              {
                icon: "TrendingUp",
                title: "Inventory Opt.",
                desc: "AI-driven forecasting to prevent stockouts.",
                color: "#6366f1",
              },
              {
                icon: "Settings",
                title: "API Integration",
                desc: "Restful API endpoints for custom ERP connections.",
                color: "#8b5cf6",
              },
              {
                icon: "FileText",
                title: "Custom Reports",
                desc: "Granular data export for supply chain analysis.",
                color: "#ec4899",
              },
              {
                icon: "Thermometer",
                title: "Climate Control",
                desc: "Temperature-sensitive handling for perishable goods.",
                color: "#f43f5e",
              },
              {
                icon: "User",
                title: "Dedicated Manager",
                desc: "Single point of contact for enterprise accounts.",
                color: "#f59e0b",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (idx % 4) * 0.07 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <SpotlightCard className="h-full rounded-xl border border-border bg-card transition-colors hover:bg-muted/50 hover:border-foreground/20">
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <GlowingIcon
                        icon={feature.icon}
                        color={feature.color}
                        size="sm"
                      />
                      <h3 className="font-semibold text-foreground text-sm">
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-24 border-t border-zinc-800 pt-8 pb-8 flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <p className="text-xs text-muted-foreground">
              ©{new Date().getFullYear()} e-PickPack Ltd trading as PDi UK. All
              rights reserved.
            </p>
            <div className="flex gap-6 text-muted-foreground">
              {[GitBranch, Link2Off, ScanFace].map((Icon, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -2, scale: 1.1 }}
                  transition={{ duration: 0.15 }}
                >
                  <Icon className="hover:text-white transition-colors cursor-pointer" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

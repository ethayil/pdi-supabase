"use client";

import { Check, ChevronDown, ChevronUp, Cookie, Shield } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCookieConsentStore } from "@/store/use-cookie-consent-store";

export function CookieConsent() {
  const { hasConsented, acceptNecessary } = useCookieConsentStore();
  const [mounted, setMounted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || hasConsented) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-6 right-6 z-50 w-full max-w-md p-1 rounded-2xl bg-linear-to-b from-primary/20 via-border/50 to-border/20 backdrop-blur-md shadow-2xl"
      >
        <div className="bg-card/90 dark:bg-card/85 text-card-foreground p-5 rounded-[14px] flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0 text-primary">
              <Cookie className="size-5 animate-pulse" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-semibold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                We value your privacy
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This website only uses strictly necessary cookies required for
                secure login, theme preferences, and system operations. We do
                not use any analytical or marketing tracking cookies. Learn more
                in our{" "}
                <Link
                  href="/privacy"
                  className="text-primary hover:underline font-medium inline-flex items-center gap-0.5"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden border-t border-border/40 pt-3"
              >
                <div className="space-y-3">
                  <h5 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Shield className="size-3 text-primary" /> Necessary Cookies
                    Used:
                  </h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-start gap-4 p-2 rounded-lg bg-muted/40">
                      <div>
                        <p className="font-medium text-foreground">
                          Secure Authentication Session
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Maintains your secure login session to access client
                          portal.
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono font-medium">
                        Essential
                      </span>
                    </div>

                    <div className="flex justify-between items-start gap-4 p-2 rounded-lg bg-muted/40">
                      <div>
                        <p className="font-medium text-foreground">
                          Theme Preference
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Stores light, dark, or system theme preferences.
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono font-medium">
                        Essential
                      </span>
                    </div>

                    <div className="flex justify-between items-start gap-4 p-2 rounded-lg bg-muted/40">
                      <div>
                        <p className="font-medium text-foreground">
                          Consent Choice
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Remembers your dismissal of this privacy notice.
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono font-medium">
                        Essential
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between gap-3 border-t border-border/40 pt-3">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 font-medium focus-visible:outline-none"
            >
              {showDetails ? (
                <>
                  Hide Details <ChevronUp className="size-3.5" />
                </>
              ) : (
                <>
                  Show Details <ChevronDown className="size-3.5" />
                </>
              )}
            </button>

            <Button
              onClick={acceptNecessary}
              variant="default"
              size="sm"
              className="px-4 py-1.5 text-xs font-semibold shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center gap-1"
            >
              <Check className="size-3.5 stroke-3" /> Got It
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

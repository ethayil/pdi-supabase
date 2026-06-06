"use client";

import { Loader2, LogIn, UserPlus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextRevealEffect } from "@/components/ui/text-reveal-effects";
import { authClient } from "@/lib/auth-client";

export default function SignIn() {
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { data } = authClient.useSession();
  if (data?.user) {
    return router.push("/verify");
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      if (flow === "signUp") {
        await authClient.signUp.email(
          {
            email,
            password,
            name,
            callbackURL: "/verify",
          },
          {
            onError: (error) => {
              setError(error.error.message);
              setLoading(false);
            },
            onSuccess: (ctx) => {
              setLoading(false);
            },
          },
        );
      } else {
        await authClient.signIn.email(
          {
            email,
            password,
            callbackURL: "/verify",
          },
          {
            onError: (error) => {
              setError(error.error.message);
              setLoading(false);
            },
            onSuccess: (ctx) => {
              setLoading(false);
            },
          },
        );
      }
      // biome-ignore lint/suspicious/noExplicitAny: <any for error from the authClient>
    } catch (err: any) {
      setError(err?.error?.message || err?.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-dvh bg-muted/40 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-1">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.15,
              }}
              className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={flow}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {flow === "signIn" ? (
                    <LogIn className="h-6 w-6 text-primary" />
                  ) : (
                    <UserPlus className="h-6 w-6 text-primary" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
            <TextRevealEffect
              text="Welcome to PDi"
              className="text-center text-2xl font-bold block"
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <CardDescription className="text-center mt-2">
                {flow === "signIn"
                  ? "Sign in to your account"
                  : "Create a new account"}
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <AnimatePresence mode="popLayout">
                {flow === "signUp" && (
                  <motion.div
                    key="name-field"
                    layout
                    initial={{ opacity: 0, height: 0, x: -10 }}
                    animate={{ opacity: 1, height: "auto", x: 0 }}
                    exit={{ opacity: 0, height: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      required={flow === "signUp"}
                    />
                  </motion.div>
                )}
                <motion.div
                  key="email-field"
                  layout
                  className="space-y-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="your@email.com"
                    autoFocus
                    required
                  />
                </motion.div>
                <motion.div
                  key="password-field"
                  layout
                  className="space-y-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {/* {flow === "signIn" && (
                      <Button
                        variant="link"
                        className="px-0 font-normal h-auto text-xs"
                        asChild
                      >
                        <a href="/auth/reset-password">Forgot password?</a>
                      </Button>
                    )} */}
                  </div>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Password"
                    minLength={8}
                    required
                  />
                  <AnimatePresence>
                    {flow === "signUp" && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-muted-foreground px-1"
                      >
                        Password must be at least 8 characters
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {loading
                    ? "Loading..."
                    : flow === "signIn"
                      ? "Sign in"
                      : "Sign up"}
                </Button>
              </motion.div>
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="bg-destructive/10 border border-destructive/30 rounded-lg p-4"
                  >
                    <p className="text-destructive font-medium text-sm wrap-break-word">
                      Error: {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="flex flex-row gap-2 text-sm">
              <span className="text-muted-foreground">
                {flow === "signIn"
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </span>
              <button
                type="button"
                className="text-foreground hover:text-primary font-medium underline decoration-2 underline-offset-2 hover:no-underline cursor-pointer transition-colors"
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              >
                {flow === "signIn" ? "Sign up" : "Sign in"}
              </button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

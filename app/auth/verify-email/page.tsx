"use client";

import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth-client";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const emailParam = searchParams.get("email") ?? "";
  const otpParam = searchParams.get("otp") ?? "";

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!emailParam || !otpParam) {
      setStatus("error");
      setMessage(
        "Invalid verification link. Please check your email or request a new one.",
      );
      return;
    }

    async function verify() {
      try {
        const { error } = await authClient.emailOtp.verifyEmail({
          email: emailParam,
          otp: otpParam,
        });

        if (error) {
          setStatus("error");
          setMessage(
            error.message ?? "Verification failed. The link may have expired.",
          );
        } else {
          setStatus("success");
          toast.success("Email verified successfully!");
          // Wait a bit before redirecting so user can see success state
          setTimeout(() => router.push("/verify"), 2000);
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again later.");
      }
    }

    verify();
  }, [emailParam, otpParam, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <AnimatePresence mode="wait">
        {status === "verifying" && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-3"
          >
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Verifying your email…
            </p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <Card>
              <CardHeader className="space-y-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10"
                >
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                </motion.div>
                <CardTitle className="text-center">Email Verified!</CardTitle>
                <CardDescription className="text-center">
                  Your email has been successfully verified. Redirecting you to
                  your account...
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => router.push("/verify")}
                >
                  Go to Dashboard
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <Card>
              <CardHeader className="space-y-1">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10"
                >
                  <ShieldAlert className="h-6 w-6 text-destructive" />
                </motion.div>
                <CardTitle className="text-center">
                  Verification Failed
                </CardTitle>
                <CardDescription className="text-center">
                  {message}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  className="w-full"
                  onClick={() => router.push("/auth/signin")}
                >
                  Back to Sign In
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

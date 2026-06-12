"use client";

import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth-client";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const emailParam = searchParams.get("email") ?? "";
  const otpParam = searchParams.get("otp") ?? "";

  // const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP verification state
  const [otpStatus, setOtpStatus] = useState<"verifying" | "valid" | "invalid">(
    "verifying",
  );

  // Verify OTP on mount
  useEffect(() => {
    if (!emailParam || !otpParam) {
      setOtpStatus("invalid");
      return;
    }

    async function verifyOtp() {
      try {
        const { error } = await authClient.emailOtp.checkVerificationOtp({
          email: emailParam,
          type: "forget-password",
          otp: otpParam,
        });

        if (error) {
          console.error("OTP verification failed:", error);
          setOtpStatus("invalid");
        } else {
          setOtpStatus("valid");
        }
      } catch (error) {
        console.error("OTP verification error:", error);
        setOtpStatus("invalid");
      }
    }

    verifyOtp();
  }, [emailParam, otpParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await authClient.emailOtp.resetPassword({
        email: emailParam,
        otp: otpParam,
        password,
      });

      if (error) throw error;

      toast.success("Password reset successfully! You can now sign in.");
      router.push("/auth/signin");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message ?? "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <AnimatePresence mode="wait">
        {/* Loading state */}
        {otpStatus === "verifying" && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-3"
          >
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Verifying reset link…
            </p>
          </motion.div>
        )}

        {/* Invalid or expired OTP */}
        {otpStatus === "invalid" && (
          <motion.div
            key="invalid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
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
                  className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10"
                >
                  <ShieldAlert className="h-6 w-6 text-destructive" />
                </motion.div>
                <CardTitle className="text-center">
                  Invalid or Expired Link
                </CardTitle>
                <CardDescription className="text-center">
                  This password reset link is invalid, has expired, or has
                  already been used. Please request a new one.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => router.push("/auth/signin")}
                >
                  Go to Sign In
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {/* Valid OTP — password reset form */}
        {otpStatus === "valid" && (
          <motion.div
            key="valid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
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
                  className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10"
                >
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                </motion.div>
                <CardTitle className="text-center">Reset Password</CardTitle>
                <CardDescription className="text-center">
                  Enter a new password for <strong>{emailParam}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoFocus
                    />
                  </motion.div>
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Reset Password
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
              <CardFooter>
                <Button
                  variant="link"
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

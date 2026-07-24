"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2, LogIn, UserCheck, X } from "lucide-react";
import { motion } from "motion/react";
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
import { TextRevealEffect } from "@/components/ui/text-reveal-effects";
import { acceptInvitationAndSignUp, getPublicInvitation } from "@/data/invitations";
import { authClient } from "@/lib/auth/auth-client";

interface InvitationData {
  id: string;
  email: string;
  role: string | null;
  status: string;
  organizationId: string;
  organizationName?: string;
  inviterEmail?: string;
  inviterName?: string;
  expiresAt?: string | Date;
  userExists?: boolean;
}

function AcceptInvitationContent() {
  const searchParams = useSearchParams();
  const invitationId = searchParams.get("id");
  const router = useRouter();

  const { data: sessionData, isPending: isSessionPending } = authClient.useSession();

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states for non-logged in users
  const [mode, setMode] = useState<"signUp" | "signIn">("signUp");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!invitationId) {
      setError("No invitation ID provided.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    getPublicInvitation({ id: invitationId })
      .then((res) => {
        if (!isMounted) return;
        if (!res.success || !res.invitation) {
          setError(res.error || "Failed to load invitation.");
        } else {
          // biome-ignore lint/suspicious/noExplicitAny: invitation type matching
          setInvitation(res.invitation as any);
          if (res.invitation.userExists) {
            setMode("signIn");
          } else {
            setMode("signUp");
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Error loading invitation");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [invitationId]);

  const handleAccept = async () => {
    if (!invitationId) return;
    setActionLoading(true);
    setError(null);

    try {
      const { error } = await authClient.organization.acceptInvitation({
        invitationId,
      });

      if (error) {
        throw new Error(error.message || "Failed to accept invitation.");
      }

      toast.success("Invitation accepted! Welcome to the organization.");
      router.push("/verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!invitationId) return;
    setActionLoading(true);
    setError(null);

    try {
      const { error } = await authClient.organization.rejectInvitation({
        invitationId,
      });

      if (error) {
        throw new Error(error.message || "Failed to reject invitation.");
      }

      toast.info("Invitation declined.");
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setActionLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation || !invitationId) return;

    setActionLoading(true);
    setError(null);

    try {
      if (mode === "signUp") {
        // Create user account, verify email, add to org, and mark invitation accepted in server action
        const res = await acceptInvitationAndSignUp({
          invitationId,
          name,
          password,
        });

        if (!res.success) {
          throw new Error(res.error || "Failed to create account.");
        }

        // Authenticate the user
        const signInRes = await authClient.signIn.email({
          email: invitation.email,
          password,
        });

        if (signInRes.error) {
          toast.success("Account created & joined organization! Please sign in.");
          router.push("/auth/signin");
          return;
        }

        const targetOrgId = res.organizationId || invitation.organizationId;
        if (targetOrgId) {
          await authClient.organization.setActive({
            organizationId: targetOrgId,
          });
        }

        toast.success("Account created & joined organization!");
        router.push(targetOrgId ? `/${targetOrgId}` : "/verify");
      } else {
        // Sign in existing user
        const signInRes = await authClient.signIn.email({
          email: invitation.email,
          password,
        });

        if (signInRes.error) {
          throw new Error(signInRes.error.message || "Failed to sign in.");
        }

        // Accept invitation after sign in
        const acceptRes = await authClient.organization.acceptInvitation({
          invitationId,
        });

        if (acceptRes.error) {
          throw new Error(acceptRes.error.message || "Signed in, but failed to join organization.");
        }

        toast.success("Signed in & invitation accepted!");
        router.push("/verify");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setActionLoading(false);
    }
  };

  if (loading || isSessionPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-muted/40 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Loading invitation details...</p>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-muted/40 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <X className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Invalid Invitation</CardTitle>
            <CardDescription className="mt-2 text-destructive">
              {error}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => router.push("/auth/signin")}>
              Go to Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isLoggedIn = !!sessionData?.user;
  const isInvitedUserLoggedIn =
    isLoggedIn && sessionData?.user?.email?.toLowerCase() === invitation?.email?.toLowerCase();

  return (
    <div className="flex items-center justify-center min-h-dvh bg-muted/40 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserCheck className="h-6 w-6" />
            </div>
            <TextRevealEffect
              text="Organization Invitation"
              className="text-center text-2xl font-bold block"
            />
            <CardDescription className="mt-2">
              You have been invited to join <span className="font-semibold text-foreground">{invitation?.organizationName || "an organization"}</span>.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {isLoggedIn ? (
              <div className="space-y-4">
                {!isInvitedUserLoggedIn && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-600 dark:text-amber-400">
                    You are currently signed in as <span className="font-semibold">{sessionData.user.email}</span>, but this invitation was sent to <span className="font-semibold">{invitation?.email}</span>.
                  </div>
                )}

                <div className="rounded-lg border p-4 bg-muted/20 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Invited Email:</span>
                    <span className="font-medium">{invitation?.email}</span>
                  </div>
                  {invitation?.role && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role:</span>
                      <span className="font-medium capitalize">{invitation.role}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    onClick={handleAccept}
                    disabled={actionLoading}
                    className="w-full gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Accept Invitation
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="w-full gap-2"
                  >
                    <X className="h-4 w-4" />
                    Decline
                  </Button>
                </div>
              </div>
            ) : (
              /* Non-logged in flow */
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="accept-email">Email Address (Invited)</Label>
                  <Input
                    id="accept-email"
                    type="email"
                    value={invitation?.email || ""}
                    readOnly
                    disabled
                    className="bg-muted font-medium cursor-not-allowed"
                  />
                </div>

                {mode === "signUp" ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="accept-name">Full Name</Label>
                      <Input
                        id="accept-name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={actionLoading}
                        autoFocus
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="accept-password">Password</Label>
                      <Input
                        id="accept-password"
                        type="password"
                        placeholder="Create a password (min 8 chars)"
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={actionLoading}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your account password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={actionLoading}
                        autoFocus
                      />
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={actionLoading} className="w-full gap-2">
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : mode === "signUp" ? (
                    <UserCheck className="h-4 w-4" />
                  ) : (
                    <LogIn className="h-4 w-4" />
                  )}
                  {mode === "signUp"
                    ? "Create Account & Join"
                    : "Sign In & Join"}
                </Button>

                <div className="text-center text-xs text-muted-foreground pt-1">
                  {invitation?.userExists ? (
                    <span>
                      Please enter your password to sign in and accept this invitation.
                    </span>
                  ) : mode === "signUp" ? (
                    <span>
                      Already have an account?{" "}
                      <button
                        type="button"
                        className="underline hover:text-primary cursor-pointer font-medium"
                        onClick={() => setMode("signIn")}
                      >
                        Sign in instead
                      </button>
                    </span>
                  ) : (
                    <span>
                      Need to create a new account?{" "}
                      <button
                        type="button"
                        className="underline hover:text-primary cursor-pointer font-medium"
                        onClick={() => setMode("signUp")}
                      >
                        Set up account
                      </button>
                    </span>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-dvh bg-muted/40 p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}

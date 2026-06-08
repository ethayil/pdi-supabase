"use client";

import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/auth/signin");
    } catch (error) {
      console.error("Sign out error:", error);
      // Still redirect even if sign out fails
      router.push("/auth/signin");
    }
  };

  return (
    <Button variant="hero" onClick={handleSignOut}>
      <LogOutIcon />
      Sign out
    </Button>
  );
}

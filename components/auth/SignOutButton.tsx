"use client";

import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";

import { useOrganizationStore } from "@/store/use-organization-store";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Clear organization store cache
      useOrganizationStore.getState().clearStore();
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

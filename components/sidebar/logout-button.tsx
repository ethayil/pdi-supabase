"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth/auth-client";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/auth/signin");
    } catch (error) {
      console.error("Logout error:", error);
      // Redirect anyway on error
      router.push("/auth/signin");
    }
  };

  return (
    <DropdownMenuItem onClick={handleLogout}>
      <LogOut />
      Log out
    </DropdownMenuItem>
  );
}

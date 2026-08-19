import { redirect } from "next/navigation";
import { Suspense } from "react";
import { GridBackgroundPattern } from "@/components/ui/text-reveal-effects";
import { getSession } from "@/lib/auth/get-session";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}

async function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user } = await getSession();
  if (!user) {
    redirect("/auth/signin");
  }

  if (user.role !== "admin") {
    redirect("/verify");
  }

  return (
    <div className="min-h-svh bg-background text-foreground relative flex flex-col items-center justify-center p-4 overflow-hidden">
      <GridBackgroundPattern />
      <div className="z-10 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        {children}
      </div>
    </div>
  );
}

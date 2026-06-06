import { Package } from "lucide-react";
import { redirect } from "next/navigation";
import ManageOrganizationDialog from "@/components/organization/manage-organization-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TextRevealEffect } from "@/components/ui/text-reveal-effects";
import { getOrganizations } from "@/data/organizations";

export default async function AdminSetupPage() {
  const { data: orgs } = await getOrganizations({ limit: 1 });

  // If organizations already exist, redirect to the first one's admin panel
  if (orgs && orgs.length > 0) {
    redirect(`/${orgs[0].id}`);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 animate-bounce-slow">
          <Package className="text-primary-foreground size-8" />
        </div>
        <div className="space-y-2">
          <TextRevealEffect
            text="Welcome to PDi UK"
            className="text-4xl md:text-5xl font-bold tracking-tighter"
          />
          <p className="text-muted-foreground text-lg max-w-[600px] mx-auto animate-in fade-in slide-in-from-top-2 delay-500 duration-1000 fill-mode-both">
            Your logistics platform is ready. To get started, you'll need to
            create your first organization.
          </p>
        </div>
      </div>

      <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <CardHeader className="relative z-10 text-center pb-2">
          <CardTitle className="text-2xl">Create Organization</CardTitle>
          <CardDescription>
            Enter the details for your primary organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10 flex justify-center py-10">
          <ManageOrganizationDialog organizationId="" />
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground animate-pulse">
        Once created, you'll be redirected to your new dashboard.
      </p>
    </div>
  );
}

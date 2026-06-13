import type { Metadata } from "next";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingNav } from "@/components/marketing/marketing-nav";

export const metadata: Metadata = {
  title: "PDi UK - University Global Distribution & Corporate Logistics",
  description:
    "PDi UK (trading as E-PickPack Ltd) excels since 2004 in distributing marketing materials for UK universities and corporate events globally with unparalleled timeliness and efficiency.",
  openGraph: {
    title: "PDi UK - University Global Distribution & Corporate Logistics",
    description:
      "PDi UK (trading as E-PickPack Ltd) excels since 2004 in distributing marketing materials for UK universities and corporate events globally with unparalleled timeliness.",
    url: "https://pdiuk.com",
    siteName: "PDi UK",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDi UK - University Global Distribution & Corporate Logistics",
    description:
      "PDi UK (trading as E-PickPack Ltd) excels since 2004 in distributing marketing materials for UK universities and corporate events globally with unparalleled timeliness.",
  },
};

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-midnight bg-background text-foreground font-sans min-h-screen flex flex-col overflow-x-hidden">
      <MarketingNav />
      <main className="flex-1 pt-16">{children}</main>
      <MarketingFooter />
    </div>
  );
}

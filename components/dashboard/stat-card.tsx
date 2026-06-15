import * as motion from "motion/react-client";
import { Suspense, use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowingIcon } from "@/components/ui/glowing-icon";
import { Skeleton } from "@/components/ui/skeleton";

function ResolveValue({
  value,
}: {
  value: React.ReactNode | Promise<React.ReactNode>;
}) {
  if (value instanceof Promise) {
    const resolved = use(value);
    return (
      <motion.span
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="inline-block"
      >
        {resolved}
      </motion.span>
    );
  }
  return <>{value}</>;
}

export function StatCard({
  title,
  value,
  icon,
  sub,
  color = "#0ce3ff",
  delay = 0,
}: {
  title: string;
  value: React.ReactNode | Promise<React.ReactNode>;
  icon: string;
  sub?: React.ReactNode | Promise<React.ReactNode>;
  color?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="shadow-sm h-full relative overflow-hidden">
        {/* Top accent line */}
        <div
          className="absolute top-0 inset-x-0 h-px w-[60%] mx-auto z-10"
          style={{
            backgroundImage: `linear-gradient(to right, transparent, ${color}, transparent)`,
          }}
        />
        <div
          className="absolute top-0 inset-x-0 h-[3px] w-[40%] mx-auto z-10 blur-sm"
          style={{
            backgroundImage: `linear-gradient(to right, transparent, ${color}, transparent)`,
          }}
        />
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
            {title}
          </CardTitle>
          <GlowingIcon icon={icon} size="sm" color={color} />
        </CardHeader>
        <Suspense
          fallback={
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-16" />
              {sub !== undefined && <Skeleton className="h-3 w-32 mt-1" />}
            </CardContent>
          }
        >
          <CardContent>
            <p className="text-2xl font-bold">
              <ResolveValue value={value} />
            </p>
            {sub !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                <ResolveValue value={sub} />
              </p>
            )}
          </CardContent>
        </Suspense>
      </Card>
    </motion.div>
  );
}

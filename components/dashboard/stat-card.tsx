import * as motion from "motion/react-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GlowingIcon } from "@/components/ui/glowing-icon";

export function StatCard({
  title,
  value,
  icon,
  sub,
  color = "#0ce3ff",
  delay = 0,
}: {
  title: string;
  value: React.ReactNode;
  icon: string;
  sub?: string;
  color?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="shadow-sm h-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
            {title}
          </CardTitle>
          <GlowingIcon icon={icon} size="sm" color={color} />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{sub ?? ""}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

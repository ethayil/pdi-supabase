import {
  CheckCircle2,
  RefreshCwIcon,
  ShieldAlert,
  UserCogIcon,
} from "lucide-react";
import * as motion from "motion/react-client";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignOutButton } from "./SignOutButton";

export default function VerifyCard({
  title,
  description,
  variant = "info",
}: {
  title: string;
  description: ReactNode;
  variant?: "info" | "error" | "success";
}) {
  const iconMap = {
    info: {
      icon: UserCogIcon,
      bg: "bg-primary/10",
      color: "text-primary",
    },
    error: {
      icon: ShieldAlert,
      bg: "bg-destructive/10",
      color: "text-destructive",
    },
    success: {
      icon: CheckCircle2,
      bg: "bg-emerald-500/10",
      color: "text-emerald-600",
    },
  };

  const { icon: Icon, bg, color } = iconMap[variant];

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
              className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${bg}`}
            >
              <Icon className={`h-6 w-6 ${color}`} />
            </motion.div>
            <CardTitle className="text-center">{title}</CardTitle>
            <CardDescription className="text-center">
              {description}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-row gap-2 justify-center">
            <Link href="/verify">
              <Button variant="outline">
                <RefreshCwIcon />
                Refresh
              </Button>
            </Link>
            <SignOutButton />
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}

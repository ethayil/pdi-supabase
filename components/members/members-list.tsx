"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  XCircle,
  ShoppingBag,
  User,
} from "lucide-react";

interface MembersListProps {
  organizationId: string;
}

const roleColors: Record<string, string> = {
  user: "bg-muted text-muted-foreground",
  admin: "bg-blue-500/10 text-blue-500",
  superadmin: "bg-violet-500/10 text-violet-500",
  warehouse: "bg-amber-500/10 text-amber-500",
};

function MemberCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-4 flex items-start gap-4">
      <Skeleton className="size-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function MembersList({ organizationId }: MembersListProps) {
  const members = useQuery(api.users.getOrgMembers, { orgId: organizationId });

  if (!members) {
    return (
      <div className="p-4 md:p-6 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <MemberCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3 p-4">
        <User className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">No members yet</h2>
        <p className="text-muted-foreground text-sm text-center max-w-sm">
          No members are linked to this organization.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {members.map((member, index) => {
        const initials = member.name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) ?? "?";

        const roleLabel = member.role
          ? member.role.charAt(0).toUpperCase() + member.role.slice(1)
          : "User";

        const roleClass = roleColors[member.role ?? "user"] ?? roleColors.user;

        return (
          <motion.div
            key={member._id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="rounded-xl border bg-card p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
          >
            {/* Avatar + status */}
            <div className="flex items-start justify-between">
              <div className="size-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground shrink-0 select-none">
                {initials}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {member.isActive === false ? (
                  <>
                    <XCircle className="size-4 text-destructive" />
                    <span className="text-destructive">Inactive</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4 text-green-500" />
                    <span className="text-green-600 dark:text-green-400">Active</span>
                  </>
                )}
              </div>
            </div>

            {/* Name & email */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{member.name}</p>
              <p className="text-xs text-muted-foreground truncate">{member.email}</p>
            </div>

            {/* Footer: role + order count */}
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleClass}`}
              >
                {roleLabel}
              </span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ShoppingBag className="size-3.5" />
                <span>{member.ordersCount ?? 0} orders</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

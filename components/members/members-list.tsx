"use client";

import { Shield, User } from "lucide-react";
import { motion } from "motion/react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { MemberWOrder } from "@/data/users";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface MembersListProps {
  organizationId: string;
  members: MemberWOrder[];
}

export function MembersList({ members }: MembersListProps) {
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
        const initials =
          member.user.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) ?? "?";

        const isAdmin = member.role === "admin";

        return (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="rounded-xl border bg-card p-3 flex items-center gap-3 hover:shadow-sm transition-shadow"
          >
            {/* Avatar */}
            <Avatar className="size-16">
              <AvatarImage src={member.user.image || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <p className="font-semibold text-sm truncate text-card-foreground flex items-center gap-1">
                  {member.user.name}
                  {isAdmin && (
                    <Shield className="size-3.5 text-blue-500 fill-blue-500/10 shrink-0" />
                  )}
                </p>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {member.user.email}
              </p>
            </div>

            {/* Status */}
            <div className="shrink-0 flex items-center">
              <StatusBadge
                status={null}
                variant={member.user.banned === true ? "inactive" : "active"}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

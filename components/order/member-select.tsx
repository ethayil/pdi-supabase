"use client";

import { useQueryState } from "nuqs";
import type { User } from "@/auth";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MemberSelectProps {
  currentUserId: string;
  members: User[];
}

export function MemberSelect({ currentUserId, members }: MemberSelectProps) {
  const [filterMember, setFilterMember] = useQueryState("member", {
    defaultValue: currentUserId,
    shallow: false,
  });

  const options = [
    { value: currentUserId, label: "My Orders" },
    { value: "all", label: "All Members" },
    ...members
      .filter((m) => m.id !== currentUserId)
      .map((m) => ({
        value: m.id,
        label: m.name ?? m.email,
      })),
  ];

  return (
    <Select
      items={options}
      open={undefined}
      value={filterMember ?? currentUserId}
      onValueChange={(value) => setFilterMember(value)}
    >
      <SelectTrigger className="h-8 w-48">
        <SelectValue placeholder="Filter by member" />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          <SelectLabel>Filter by member</SelectLabel>
          <SelectSeparator />
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

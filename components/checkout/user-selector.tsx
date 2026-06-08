"use client";

import { motion } from "motion/react";
import type { User } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { GlowingIcon } from "@/components/ui/glowing-icon";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";

interface UserSelectorProps {
  orgId: string;
  users: User[];
  onSelect: (userId: string) => void;
  selectedUserId?: string;
}

export default function UserSelector({
  users,
  onSelect,
  selectedUserId,
}: UserSelectorProps) {
  if (!users) return null;

  const selectedUser = users.find((user) => user.id === selectedUserId) || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GlowingIcon icon="Users" size="sm" color="#8b5cf6" />
            Place order for user
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Combobox
            items={users}
            value={selectedUser}
            onValueChange={(e) => {
              onSelect(e?.id ?? "");
            }}
            itemToStringValue={(user: User) => user.id}
            itemToStringLabel={(user: User) => user.name}
          >
            <ComboboxInput placeholder="Select a user" showClear />

            <ComboboxContent>
              <ComboboxEmpty>No users found.</ComboboxEmpty>
              <ComboboxList>
                {(user: User) => (
                  <ComboboxItem key={user.id} value={user}>
                    <Item size="xs" className="p-0">
                      <ItemContent>
                        <ItemTitle className="whitespace-nowrap">
                          {user.name}
                        </ItemTitle>
                        <ItemDescription>{user.email}</ItemDescription>
                      </ItemContent>
                    </Item>
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </CardContent>
      </Card>
    </motion.div>
  );
}

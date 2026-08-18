"use client";

import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Organization } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/ui/loading-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createOrgInvitation } from "@/data/invitations";
import { getOrganizations } from "@/data/organizations";
import { getUsers, revalidateUsersCache, type UserWMember } from "@/data/users";
import { USER_ROLES } from "@/types/globals";

interface InviteUserDialogProps {
  organizationId?: string;
}

export function InviteUserDialog({ organizationId }: InviteUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state for New User
  const [email, setEmail] = useState("");

  // Form state for Existing User
  const [unlinkedUsers, setUnlinkedUsers] = useState<UserWMember[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [existingEmail, setExistingEmail] = useState("");
  const [isFetchingUnlinked, setIsFetchingUnlinked] = useState(false);

  // Common form state
  const [selectedOrgId, setSelectedOrgId] = useState(organizationId || "");
  const [role, setRole] = useState("user");
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    if (organizationId) {
      setSelectedOrgId(organizationId);
    }
  }, [organizationId]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    getOrganizations({ entriesPerPage: 100, isActive: true })
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setOrganizations(res.data);
          if (!selectedOrgId && res.data.length > 0) {
            setSelectedOrgId(res.data[0].id);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load organizations:", err);
      });

    // Fetch unlinked users for the Existing User tab
    setIsFetchingUnlinked(true);
    getUsers({ orgId: "", userType: "unlinked", entriesPerPage: 100 })
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setUnlinkedUsers(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load unlinked users:", err);
      })
      .finally(() => {
        if (isMounted) setIsFetchingUnlinked(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedOrgId]);

  const router = useRouter();
  const handleSendInvite = async (targetEmail: string) => {
    if (!targetEmail)
      return toast.error("Please select or enter an email address");
    if (!selectedOrgId) return toast.error("Please select an organization");

    setIsLoading(true);
    const toastId = toast.loading("Sending invitation...");

    try {
      const res = await createOrgInvitation({
        email: targetEmail,
        role,
        organizationId: selectedOrgId,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to send invitation");
      }

      await revalidateUsersCache();
      router.refresh();

      toast.success(`Invitation sent successfully to ${targetEmail}`, {
        id: toastId,
      });

      setEmail("");
      setSelectedUserId("");
      setExistingEmail("");
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : String(err), {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendInvite(email);
  };

  const handleExistingUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendInvite(existingEmail);
  };

  const orgOptions = organizations.map((org) => ({
    value: org.id,
    label: org.name,
  }));

  const unlinkedUserOptions = unlinkedUsers.map((u) => ({
    value: u.id,
    label: `${u.name} (${u.email})`,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-1.5 cursor-pointer">
            <UserPlus className="h-4 w-4" />
            <span>Invite User</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an email invitation for a user to join an organization.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="new" className="w-full flex flex-col flex-1 mt-2">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="new">New User</TabsTrigger>
            <TabsTrigger value="existing">Existing User</TabsTrigger>
          </TabsList>

          {/* NEW USER TAB */}
          <TabsContent value="new">
            <form onSubmit={handleNewUserSubmit} className="space-y-4">
              <Field>
                <FieldLabel htmlFor="invite-email-new">User Email</FieldLabel>
                <Input
                  id="invite-email-new"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoFocus
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="invite-org-new">Organization</FieldLabel>
                <Select
                  items={orgOptions}
                  value={selectedOrgId}
                  onValueChange={(val) => {
                    if (val) setSelectedOrgId(val);
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger id="invite-org-new">
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="invite-role-new">Role</FieldLabel>
                <Select
                  items={USER_ROLES}
                  value={role}
                  onValueChange={(val) => {
                    if (val) setRole(val);
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger id="invite-role-new">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <LoadingButton
                  type="submit"
                  title="Send Invitation"
                  isLoading={isLoading}
                />
              </div>
            </form>
          </TabsContent>

          {/* EXISTING USER TAB */}
          <TabsContent value="existing">
            <form onSubmit={handleExistingUserSubmit} className="space-y-4">
              <Field>
                <FieldLabel htmlFor="select-unlinked-user">
                  Select Unlinked User
                </FieldLabel>
                <Select
                  items={unlinkedUserOptions}
                  value={selectedUserId}
                  onValueChange={(val) => {
                    if (val) {
                      setSelectedUserId(val);
                      const targetUser = unlinkedUsers.find(
                        (u) => u.id === val,
                      );
                      if (targetUser) {
                        setExistingEmail(targetUser.email);
                      }
                    }
                  }}
                  disabled={isLoading || isFetchingUnlinked}
                >
                  <SelectTrigger id="select-unlinked-user">
                    <SelectValue
                      placeholder={
                        isFetchingUnlinked
                          ? "Loading users..."
                          : unlinkedUsers.length === 0
                            ? "No unlinked users found"
                            : "Select user"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {unlinkedUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="invite-org-existing">
                  Organization
                </FieldLabel>
                <Select
                  items={orgOptions}
                  value={selectedOrgId}
                  onValueChange={(val) => {
                    if (val) setSelectedOrgId(val);
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger id="invite-org-existing">
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="invite-role-existing">Role</FieldLabel>
                <Select
                  items={USER_ROLES}
                  value={role}
                  onValueChange={(val) => {
                    if (val) setRole(val);
                  }}
                  disabled={isLoading}
                >
                  <SelectTrigger id="invite-role-existing">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {USER_ROLES.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <LoadingButton
                  type="submit"
                  title="Send Invitation"
                  isLoading={isLoading || !selectedUserId}
                />
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import type { Organization } from "@/app/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
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
import { getOrganizations } from "@/data/organizations";
import { getUserById, type UserWMember, updateUser } from "@/data/users";
import { authClient } from "@/lib/auth/auth-client";
import { useUserParams } from "@/lib/nuqs/user-params";
import { userSchema } from "@/schemas/user-schema";
import type { UserRole } from "@/types/globals";
import { UserSessionsList } from "./user-sessions-list";

export default function ManageUserDialog({
  organizationId,
}: {
  organizationId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [{ userId }, setParams] = useUserParams();

  const [selectedUser, setSelectedUser] = useState<UserWMember | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    let isMounted = true;
    getOrganizations({ entriesPerPage: 100, isActive: true })
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setOrganizations(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load organizations:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      setSelectedUser(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    getUserById({ id: userId })
      .then((res) => {
        if (isMounted) {
          if (res.success && res.user) {
            setSelectedUser(res.user);
          } else {
            setSelectedUser(null);
            toast.error(res.error || "Failed to fetch user details");
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          toast.error("Error fetching user details");
          console.error(err);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    values: {
      id: userId ?? "",
      name: selectedUser?.name ?? "",
      email: selectedUser?.email ?? "",
      role: (selectedUser?.role as UserRole) ?? "user",
      orgId: selectedUser?.orgId ?? "none",
      image: selectedUser?.image ?? "",
      isActive: !(selectedUser?.banned ?? true),
      emailVerified: selectedUser?.emailVerified ?? false,
    },
  });

  function onOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setParams({ userId: null });
      form.reset();
    }
    setIsLoading(false);
  }

  async function handlePasswordReset() {
    if (!userId || !selectedUser?.email) return toast.error("User not found");

    setIsLoading(true);
    const toastId = toast.loading("Sending password reset email...");

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: selectedUser.email,
        type: "forget-password",
      });
      if (error) throw error;

      toast.success(`Password reset OTP sent to ${selectedUser.email}`, {
        id: toastId,
      });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : String(error), {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendVerificationEmail() {
    const email = selectedUser?.email;
    if (!email) return toast.error("User email not found");

    setIsLoading(true);
    const toastId = toast.loading("Sending verification email...");

    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });
      if (error) throw error;
      toast.success("Verification email sent!", { id: toastId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error), {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!userId) return toast.error("User not found");

    setIsLoading(true);
    const toastId = toast.loading("Deleting User...");

    try {
      const { error } = await authClient.admin.removeUser({
        userId: userId,
      });
      if (error) throw error;

      toast.success("User deleted", { id: toastId });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error), {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarkAsVerified() {
    if (!userId) return toast.error("User not found");

    setIsLoading(true);
    const toastId = toast.loading("Marking as verified...");

    try {
      await updateUser({
        id: userId,
        emailVerified: true,
      });
      toast.success("User marked as verified", { id: toastId });

      // Reload user details
      const res = await getUserById({ id: userId });
      if (res.success && res.user) {
        setSelectedUser(res.user);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error), {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof userSchema>) {
    setIsLoading(true);

    try {
      if (userId) {
        await updateUser({
          id: userId,
          name: values.name,
          role: values.role,
          orgId: values.orgId ?? "none",
          image: values.image,
          isActive: values.isActive,
        });
        toast.success("User updated");
      }
      onOpenChange(false);
    } catch (error) {
      console.log({ error });
      toast.error(error instanceof Error ? error.message : String(error));
    }

    setIsLoading(false);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <onOpenChange is a callback that is not stable>
  useEffect(() => {
    if (userId && selectedUser) onOpenChange(true);
  }, [userId, selectedUser]);

  const userRoleOptions = [
    { value: "user", label: "User" },
    { value: "orgAdmin", label: "Org Admin" },
    { value: "superAdmin", label: "Super Admin" },
    { value: "warehouse", label: "Warehouse" },
  ];

  const orgOptions = [
    { value: "none", label: "None" },
    ...(organizations?.map((org) => ({
      value: org.id,
      label: org.name,
    })) ?? []),
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-full sm:min-w-xl md:min-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">Edit User</DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Update user details
        </DialogDescription>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="sessions" disabled={!userId}>
              Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-name">Name</FieldLabel>
                    <Input
                      {...field}
                      id="form-name"
                      aria-invalid={fieldState.invalid}
                      placeholder="Name"
                      autoFocus
                      disabled={isLoading}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="form-email"
                      aria-invalid={fieldState.invalid}
                      placeholder="email@example.com"
                      disabled={isLoading || !!userId}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="role"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-role">Role</FieldLabel>
                    <Select
                      items={userRoleOptions}
                      onValueChange={field.onChange}
                      value={field.value?.toString()}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="form-role">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {userRoleOptions.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="orgId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-orgId">Organization</FieldLabel>
                    <Select
                      items={orgOptions}
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="form-orgId">
                        <SelectValue placeholder="Select an organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {orgOptions?.map((org) => (
                          <SelectItem key={org.value} value={org.value}>
                            {org.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="image"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-image">Avatar URL</FieldLabel>
                    <Input
                      {...field}
                      id="form-image"
                      aria-invalid={fieldState.invalid}
                      placeholder="https://..."
                      disabled={isLoading}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="isActive"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation="horizontal"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-aria-checked:border-blue-600 has-aria-checked:bg-blue-50 dark:has-aria-checked:border-blue-900 dark:has-aria-checked:bg-blue-950">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                      />
                      <div className="grid gap-1.5 font-normal">
                        <p className="text-sm leading-none font-medium">
                          Account Active
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Allow or prevent user from logging in
                        </p>
                      </div>
                    </FieldLabel>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {userId && (
                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handlePasswordReset}
                    disabled={isLoading}
                  >
                    Send Password Reset Email
                  </Button>
                  {!selectedUser?.emailVerified && (
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleSendVerificationEmail}
                        disabled={isLoading}
                      >
                        Send Verification Email
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleMarkAsVerified}
                        disabled={isLoading}
                      >
                        Mark as Verified
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <LoadingButton title="Update" isLoading={isLoading} stretch />
                {userId && (
                  <DeleteConfirmationDialog
                    type="user"
                    entityName={form.getValues("name") || "this user"}
                    onDelete={handleDelete}
                  />
                )}
              </div>
            </form>
          </TabsContent>

          {userId && (
            <TabsContent value="sessions">
              <UserSessionsList userId={userId} />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

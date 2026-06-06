/** biome-ignore-all lint/suspicious/noArrayIndexKey: False positive*/
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  createOrganization,
  deleteOrganization,
  getOrganizationById,
  updateOrganization,
} from "@/data/organizations";
import { useRegisterAction } from "@/hooks/use-command-actions";
import { useOrgParams } from "@/lib/nuqs/org-params";
import { createOrgSchema } from "@/schemas/org-schema";
import LoadingButton from "../ui/loading-button";

export default function ManageOrganizationDialog({
  organizationId,
}: {
  organizationId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const [{ orgId }, setParams] = useOrgParams();

  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  useEffect(() => {
    if (!orgId || orgId === "all") {
      setSelectedOrg(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    getOrganizationById({ id: orgId })
      .then((res) => {
        if (isMounted) {
          if (res.success && res.organization) {
            setSelectedOrg(res.organization);
          } else {
            setSelectedOrg(null);
            toast.error("Failed to fetch organization details");
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          toast.error("Error fetching organization details");
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
  }, [orgId]);

  const form = useForm<z.infer<typeof createOrgSchema>>({
    resolver: zodResolver(createOrgSchema),
    values: {
      id: orgId && orgId !== "all" ? orgId : "",
      name: selectedOrg?.name ?? "",
      prefix: selectedOrg?.prefix ?? "",
      logo: selectedOrg?.logo ?? "",
      isActive: selectedOrg?.isActive ?? true,
      supportEmail: selectedOrg?.supportEmail ?? [],
      supportPhone: selectedOrg?.supportPhone ?? [],
      address1: selectedOrg?.address1 ?? "",
      address2: selectedOrg?.address2 ?? "",
      town: selectedOrg?.town ?? "",
      city: selectedOrg?.city ?? "",
      postcode: selectedOrg?.postcode ?? "",
      country: selectedOrg?.country ?? "",
      primaryColor: selectedOrg?.primaryColor ?? "#0056D2",
      secondaryColor: selectedOrg?.secondaryColor ?? "",
      fontFamily: selectedOrg?.fontFamily ?? "",
      welcomeMessage: selectedOrg?.welcomeMessage ?? "",
      lowStockThreshold: selectedOrg?.lowStockThreshold ?? 50,
    },
  });

  // Helpers for managing flat string arrays
  const addEmail = () => {
    const current = form.getValues("supportEmail") ?? [];
    form.setValue("supportEmail", [...current, ""]);
  };
  const removeEmail = (index: number) => {
    const current = form.getValues("supportEmail") ?? [];
    form.setValue(
      "supportEmail",
      current.filter((_, i) => i !== index),
    );
  };
  const addPhone = () => {
    const current = form.getValues("supportPhone") ?? [];
    form.setValue("supportPhone", [...current, ""]);
  };
  const removePhone = (index: number) => {
    const current = form.getValues("supportPhone") ?? [];
    form.setValue(
      "supportPhone",
      current.filter((_, i) => i !== index),
    );
  };

  function onOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setParams({ orgId: null });
      form.reset();
    }
    setIsLoading(false);
  }

  async function handleDelete() {
    if (!orgId) return toast.error("Organization not found");

    setIsLoading(true);
    const toastId = toast.loading("Deleting Organization...");

    try {
      await deleteOrganization({ id: orgId });
      toast.success("Organization deleted", { id: toastId });
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error), {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof createOrgSchema>) {
    setIsLoading(true);

    // biome-ignore lint/correctness/noUnusedVariables: id is not needed when creating
    const { id, ...data } = values;

    try {
      if (orgId && orgId !== "all") {
        await updateOrganization(values);
      } else {
        const result = await createOrganization(data);
        if (result && !organizationId) {
          router.push(`/${result}`);
        }
      }

      toast.success(
        `Organization ${orgId && orgId !== "all" ? "updated" : "created"}`,
      );
      onOpenChange(false);
    } catch (error) {
      console.log({ error });
      toast.error(error instanceof Error ? error.message : String(error));
    }

    setIsLoading(false);
  }

  useRegisterAction({
    id: "orgs-new",
    label: "Add Organization",
    shortcut: "n",
    handler: () => onOpenChange(true),
    icon: PlusIcon,
    category: "Organizations",
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: False positive
  useEffect(() => {
    if (orgId && orgId !== "all" && selectedOrg) onOpenChange(true);
  }, [orgId, selectedOrg]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button />}>
        <PlusIcon className="size-4" />
        Add
      </DialogTrigger>
      <DialogContent className="min-w-full sm:min-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
            {orgId ? "Edit" : "Add"} Organization
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          {orgId ? "Update " : "Add"} organization
        </DialogDescription>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* ── Core ── */}
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
            name="prefix"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-prefix">Prefix</FieldLabel>
                <Input
                  {...field}
                  id="form-prefix"
                  aria-invalid={fieldState.invalid}
                  placeholder="Prefix"
                  disabled={isLoading}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="logo"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-logo">Logo Url</FieldLabel>
                <Input
                  {...field}
                  id="form-logo"
                  aria-invalid={fieldState.invalid}
                  placeholder="https://example.com/logo.png"
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
              <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                <FieldLabel className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-aria-checked:border-blue-600 has-aria-checked:bg-blue-50 dark:has-aria-checked:border-blue-900 dark:has-aria-checked:bg-blue-950">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
                  />
                  <div className="grid gap-1.5 font-normal">
                    <p className="text-sm leading-none font-medium">
                      Is Active
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Show or hide organization from system
                    </p>
                  </div>
                </FieldLabel>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* ── Contact Info ── */}
          <div className="border-t pt-4 mt-4 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Contact Info
            </h3>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-accent/10">
              <h4 className="col-span-full text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Address Details
              </h4>
              <Controller
                name="address1"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="col-span-full"
                  >
                    <FieldLabel htmlFor="form-address1">
                      Address Line 1
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-address1"
                      placeholder="123 Main St"
                      disabled={isLoading}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="address2"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="col-span-full"
                  >
                    <FieldLabel htmlFor="form-address2">
                      Address Line 2 (Optional)
                    </FieldLabel>
                    <Input
                      {...field}
                      id="form-address2"
                      placeholder="Suite 4B"
                      disabled={isLoading}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="town"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-town">Town</FieldLabel>
                    <Input
                      {...field}
                      id="form-town"
                      placeholder="London"
                      disabled={isLoading}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="city"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-city">City (Optional)</FieldLabel>
                    <Input
                      {...field}
                      id="form-city"
                      placeholder="Greater London"
                      disabled={isLoading}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="postcode"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-postcode">Postcode</FieldLabel>
                    <Input
                      {...field}
                      id="form-postcode"
                      placeholder="SW1A 1AA"
                      disabled={isLoading}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="country"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-country">Country</FieldLabel>
                    <Input
                      {...field}
                      id="form-country"
                      placeholder="United Kingdom"
                      disabled={isLoading}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* Support Emails */}
            <Field>
              <FieldLabel>Support Email(s)</FieldLabel>
              <div className="space-y-2">
                {(form.watch("supportEmail") ?? []).map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <Controller
                      name={`supportEmail.${index}` as "supportEmail.0"}
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="email"
                          placeholder="support@example.com"
                          disabled={isLoading}
                          className="flex-1"
                        />
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={isLoading}
                      onClick={() => removeEmail(index)}
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  onClick={addEmail}
                >
                  <PlusIcon className="size-3 mr-1" />
                  Add Email
                </Button>
              </div>
            </Field>

            {/* Support Phones */}
            <Field>
              <FieldLabel>Support Phone(s)</FieldLabel>
              <div className="space-y-2">
                {(form.watch("supportPhone") ?? []).map((_, index) => (
                  <div key={index} className="flex gap-2">
                    <Controller
                      name={`supportPhone.${index}` as "supportPhone.0"}
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="tel"
                          placeholder="+44 20 1234 5678"
                          disabled={isLoading}
                          className="flex-1"
                        />
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={isLoading}
                      onClick={() => removePhone(index)}
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  onClick={addPhone}
                >
                  <PlusIcon className="size-3 mr-1" />
                  Add Phone
                </Button>
              </div>
            </Field>
          </div>

          {/* ── Settings ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 mt-4">
            <h3 className="col-span-full text-sm font-semibold text-muted-foreground">
              Personalization
            </h3>

            <Controller
              name="primaryColor"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="col-span-full"
                >
                  <FieldLabel htmlFor="form-primaryColor">
                    Primary Color
                  </FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      {...field}
                      id="form-primaryColor"
                      type="color"
                      className="w-12 p-1 h-10 cursor-pointer"
                      disabled={isLoading}
                    />
                    <Input
                      {...field}
                      placeholder="#0056D2"
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => field.onChange("#0056D2")}
                      disabled={isLoading}
                    >
                      Reset
                    </Button>
                  </div>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="lowStockThreshold"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  className="col-span-full"
                >
                  <FieldLabel htmlFor="form-lowStockThreshold">
                    Low Stock Threshold
                  </FieldLabel>
                  <p className="text-xs text-muted-foreground mb-1">
                    Products with stock at or below this number are flagged as
                    "Low Stock". Default: 50.
                  </p>
                  <Input
                    {...field}
                    id="form-lowStockThreshold"
                    type="number"
                    min={1}
                    max={10000}
                    placeholder="50"
                    disabled={isLoading}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    value={field.value ?? 50}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <div className="flex gap-2">
            <LoadingButton
              title={orgId ? "Update" : "Add"}
              isLoading={isLoading}
              stretch
            />
            {orgId && (
              <DeleteConfirmationDialog
                type="organization"
                entityName={form.getValues("name")}
                onDelete={handleDelete}
              />
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

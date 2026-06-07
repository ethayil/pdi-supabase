"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
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
import LoadingButton from "@/components/ui/loading-button";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  updateCategory,
} from "@/data/categories";
import { useRegisterAction } from "@/hooks/use-command-actions";
import { useGlobalParams } from "@/lib/nuqs/global-params";
import { categorySchema } from "@/schemas/category-schema";

export default function ManageCategoryDialog({
  organizationId,
}: {
  organizationId: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [{ categoryId }, setParams] = useGlobalParams();
  const isEditing = categoryId && categoryId !== "all";

  useRegisterAction({
    id: "categories-new",
    label: "New Category",
    shortcut: "n",
    handler: () => setIsOpen(true),
    icon: PlusIcon,
    category: "Categories",
  });

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      orgId: organizationId,
      name: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      getCategoryById({ id: categoryId })
        .then((cat) => {
          if (cat) {
            form.reset({
              orgId: organizationId,
              name: cat.name,
              isActive: cat.isActive,
            });
            setIsOpen(true);
          } else {
            toast.error("Category not found");
            setParams({ categoryId: null });
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to load category");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      form.reset({
        orgId: organizationId,
        name: "",
        isActive: true,
      });
    }
  }, [categoryId, isEditing, organizationId, form, setParams]);

  function onOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setParams({ categoryId: null });
      form.reset({
        orgId: organizationId,
        name: "",
        isActive: true,
      });
    }
    setIsLoading(false);
  }

  async function handleDelete() {
    if (!isEditing) return toast.error("Category not found");

    setIsLoading(true);
    const toastId = toast.loading("Deleting Category...");

    try {
      await deleteCategory({ id: categoryId });
      toast.success("Category deleted", { id: toastId });
      onOpenChange(false);
    } catch (error) {
      console.error({ error });
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category",
        { id: toastId },
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(values: z.infer<typeof categorySchema>) {
    setIsLoading(true);
    const toastId = toast.loading(
      isEditing ? "Updating Category..." : "Creating Category...",
    );

    try {
      if (isEditing) {
        await updateCategory({
          id: categoryId,
          orgId: organizationId,
          name: values.name,
          isActive: values.isActive,
        });
      } else {
        await createCategory({
          orgId: organizationId,
          name: values.name,
          isActive: values.isActive,
        });
      }

      toast.success(
        `Category ${isEditing ? "updated" : "created"} successfully`,
        { id: toastId },
      );
      onOpenChange(false);
    } catch (error) {
      console.error({ error });
      toast.error(
        error instanceof Error ? error.message : "Failed to save category",
        { id: toastId },
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button />}>
        <PlusIcon className="size-4" />
        Add
      </DialogTrigger>
      <DialogContent className="min-w-full sm:min-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
            {isEditing ? "Update" : "Create New"} Category
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          {isEditing ? "Update " : "Create New"} category
        </DialogDescription>
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
                      Show or hide category from user
                    </p>
                  </div>
                </FieldLabel>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="flex gap-2">
            <LoadingButton
              title={isEditing ? "Update" : "Create"}
              isLoading={isLoading}
              stretch
            />
            {isEditing && (
              <DeleteConfirmationDialog
                type="category"
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

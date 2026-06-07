"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type RegisterableHotkey, useHotkey } from "@tanstack/react-hotkeys";
import { CalendarIcon, CalendarSyncIcon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import type { Category, Product } from "@/app/generated/prisma/client";
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  createProduct,
  deleteProduct,
  getProductById,
  updateProduct,
} from "@/data/products";
import { useRegisterAction } from "@/hooks/use-command-actions";
import { useProductParams } from "@/lib/nuqs/product-params";
import { productSchema } from "@/schemas/product-schema";
import { formattedDate } from "@/utils/formatted-date";
import { StockMovementHistory } from "./stock-movement-history";

export default function ManageProductDialog({
  organizationId,
  categories = [],
}: {
  organizationId: string;
  categories: Category[];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [{ productId }, setParams] = useProductParams();

  useEffect(() => {
    if (!productId) {
      setSelectedProduct(null);
      return;
    }

    setIsLoading(true);
    getProductById({ id: productId })
      .then((product) => {
        if (product) {
          setSelectedProduct(product);
          setIsOpen(true);
        } else {
          toast.error("Product not found");
        }
      })
      .catch((error) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to load product",
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [productId]);

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    values: {
      orgId: organizationId,
      categoryId: selectedProduct?.categoryId ?? "",
      sku: selectedProduct?.sku ?? "",
      name: selectedProduct?.name ?? "",
      description: selectedProduct?.description ?? "",
      weight: selectedProduct?.weight ?? 0,
      quantity: selectedProduct?.quantity ?? 0,
      imgUrl: selectedProduct?.imgUrl ?? "",
      isActive: selectedProduct?.isActive ?? true,
    },
  });

  function onOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setParams({ productId: null });
      setSelectedProduct(null);
      form.reset();
    }
  }

  async function handleDelete() {
    if (!productId) return toast.error("Product not found");

    setIsLoading(true);
    const toastId = toast.loading("Deleting Product...");

    try {
      await deleteProduct({ id: productId });
      toast.success("Product deleted", { id: toastId });
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete product",
        { id: toastId },
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Register "New Product" action
  useRegisterAction({
    id: "new-product",
    label: "New Product",
    shortcut: "n",
    handler: () => onOpenChange(true),
    category: "Products",
    icon: PlusIcon,
  });

  // Submit on Cmd+Enter
  useHotkey(
    "Mod+Enter" as RegisterableHotkey,
    () => {
      if (isOpen && !isLoading) {
        form.handleSubmit(onSubmit)();
      }
    },
    { enabled: isOpen },
  );

  async function onSubmit(values: z.infer<typeof productSchema>) {
    setIsLoading(true);

    try {
      if (productId) {
        await updateProduct({
          ...values,
          id: productId,
          orgId: organizationId,
        });
      } else {
        await createProduct({
          ...values,
          orgId: organizationId,
        });
      }

      toast.success(`Product ${productId ? "updated" : "created"}`);
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save product",
      );
    }

    setIsLoading(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button />}>
        <PlusIcon className="size-4" />
        Add
      </DialogTrigger>
      <DialogContent className="min-w-full sm:min-w-xl md:min-w-2xl lg:min-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">
            {productId ? "Update" : "Create New"} Product
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          {productId ? "Update " : "Create New"} product
        </DialogDescription>
        <Tabs defaultValue="details" className="w-full">
          {productId && (
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="details">Product Details</TabsTrigger>
              <TabsTrigger value="history">Stock History</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="details">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                        placeholder="Product Name"
                        disabled={isLoading}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="sku"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-sku">SKU</FieldLabel>
                      <Input
                        {...field}
                        id="form-sku"
                        aria-invalid={fieldState.invalid}
                        placeholder="Stock Keeping Unit"
                        disabled={isLoading}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="categoryId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-category">Category</FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                        items={categories?.map((category) => ({
                          value: category.id,
                          label: category.name,
                        }))}
                      >
                        <SelectTrigger id="form-category">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Categories</SelectLabel>
                            {categories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="imgUrl"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-img">Image URL</FieldLabel>
                      <Input
                        {...field}
                        id="form-img"
                        aria-invalid={fieldState.invalid}
                        placeholder="https://example.com/image.png"
                        disabled={isLoading}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="weight"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-weight">Weight (gm)</FieldLabel>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        id="form-weight"
                        aria-invalid={fieldState.invalid}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={isLoading}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="quantity"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="form-quantity">Quantity</FieldLabel>
                      <Input
                        {...field}
                        type="number"
                        id="form-quantity"
                        aria-invalid={fieldState.invalid}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={isLoading}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="form-description">
                      Description
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="form-description"
                      aria-invalid={fieldState.invalid}
                      placeholder="Product Description"
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
                          Is Active
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Show or hide product from user
                        </p>
                      </div>
                    </FieldLabel>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <div className="text-xs space-y-1 text-muted-foreground">
                {productId && selectedProduct?.updatedAt && (
                  <div className="flex items-center gap-2">
                    <CalendarSyncIcon className="size-3" />
                    <p>
                      Updated:{" "}
                      <span className="text-blue-400">
                        {formattedDate(selectedProduct?.updatedAt)}
                      </span>
                    </p>
                  </div>
                )}
                {productId && selectedProduct?.createdAt && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="size-3" />
                    <p>
                      Created:{" "}
                      <span className="text-blue-400">
                        {formattedDate(selectedProduct.createdAt)}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <LoadingButton
                  title={productId ? "Update" : "Create"}
                  isLoading={isLoading}
                  stretch
                />
                {productId && (
                  <DeleteConfirmationDialog
                    type="product"
                    entityName={form.getValues("name")}
                    onDelete={handleDelete}
                  />
                )}
              </div>
            </form>
          </TabsContent>

          {productId && (
            <TabsContent value="history">
              <StockMovementHistory productId={productId} />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

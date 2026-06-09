"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, ShoppingBag } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import type { Address } from "@/app/generated/prisma/client";
import type { User } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckboxCard } from "@/components/ui/checkbox-card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { GlowingIcon } from "@/components/ui/glowing-icon";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/ui/loading-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { getCartItems } from "@/data/cart";
import { countriesData } from "@/data/countries-data";
import { createOrder } from "@/data/orders";
import { cn, getErrorMessage } from "@/lib/utils";
import { orderSchema } from "@/schemas/order-schema";
import { weightFormat } from "@/utils/weight-format";
import { CartItemCard } from "./cart-item";
import PreviousAddressList from "./previous-address-list";
import UserSelector from "./user-selector";

type CheckoutFormProps = {
  orgId: string;
  currentUser: User;
  addresses: Address[];
  cartItems: Awaited<ReturnType<typeof getCartItems>>;
  orgUsers: User[];
};

export default function CheckoutForm({
  orgId,
  currentUser,
  addresses,
  cartItems,
  orgUsers,
}: CheckoutFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin =
    currentUser?.role === "superAdmin" || currentUser?.role === "orgAdmin";

  const totalItems =
    cartItems?.reduce((acc, item) => acc + item.quantity, 0) ?? 0;
  const totalWeight =
    cartItems?.reduce(
      (acc, item) => acc + item.quantity * item.product.weight,
      0,
    ) ?? 0;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const form = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      fullname: "",
      company: "",
      address1: "",
      address2: "",
      town: "",
      city: "",
      postcode: "",
      country: "United Kingdom",
      email: "",
      phone: "",
      addressId: undefined,
      externalRef: "",
      poRef: "",
      weight: totalWeight,
      deliveryDate: tomorrow,
      comments: "",
      items: [],
      updateSavedAddress: false,
      userId: "",
    },
  });

  const addressId = form.watch("addressId") as string | undefined;
  const currentValues = form.watch();

  const selectedAddress = addresses.find((a) => a.id === addressId);

  const hasAddressChanged = selectedAddress
    ? selectedAddress.fullname !== currentValues.fullname ||
      (selectedAddress.company || "") !== (currentValues.company || "") ||
      selectedAddress.address1 !== currentValues.address1 ||
      (selectedAddress.address2 || "") !== (currentValues.address2 || "") ||
      selectedAddress.town !== currentValues.town ||
      (selectedAddress.city || "") !== (currentValues.city || "") ||
      selectedAddress.postcode !== currentValues.postcode ||
      selectedAddress.country !== currentValues.country ||
      selectedAddress.email !== currentValues.email ||
      selectedAddress.phone !== currentValues.phone
    : false;

  const onSubmit = async (values: z.infer<typeof orderSchema>) => {
    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setIsLoading(true);

    try {
      const items = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const res = await createOrder({
        ...values,
        orgId,
        addressId,
        weight: totalWeight,
        deliveryDate: values.deliveryDate,
        items,
        updateSavedAddress: hasAddressChanged && values.updateSavedAddress,
      });

      if (res.success) {
        toast.success("Order placed successfully!");
        form.reset();
        router.push(`/${orgId}/orders`);
      } else {
        toast.error("Failed to place order");
      }
    } catch (err) {
      console.error("Order error", err);
      toast.error(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSelect = (address: Address) => {
    form.setValue("addressId", address.id);
    form.setValue("fullname", address.fullname);
    form.setValue("company", address.company || "");
    form.setValue("address1", address.address1);
    form.setValue("address2", address.address2 || "");
    form.setValue("town", address.town);
    form.setValue("city", address.city || "");
    form.setValue("postcode", address.postcode);
    form.setValue("country", address.country);
    form.setValue("email", address.email);
    form.setValue("phone", address.phone);
  };

  if (!cartItems) return null;

  return (
    <main className="flex-1 space-y-2 md:space-y-4 p-2 md:p-4">
      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-6">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-semibold">Your cart is empty</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Looks like you haven't added any items to your cart yet
          </p>
          <Button>
            <Link href={`/${orgId}/products`}>Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-3 gap-2 md:gap-4 h-full"
        >
          <div className="lg:col-span-2 space-y-2 md:space-y-4  overflow-auto">
            {isAdmin && (
              <UserSelector
                orgId={orgId}
                users={orgUsers}
                onSelect={(userId) => form.setValue("userId", userId)}
                selectedUserId={form.watch("userId")}
              />
            )}
            <PreviousAddressList
              addresses={addresses}
              onSelect={handleAddressSelect}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GlowingIcon icon="MapPin" size="sm" color="#228d6c" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="fullname"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="fullname">Full Name</FieldLabel>
                        <Input
                          {...field}
                          id="fullname"
                          placeholder="Enter your full name"
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />

                  <Controller
                    name="company"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="company">
                          Company (Optional)
                        </FieldLabel>
                        <Input
                          {...field}
                          id="company"
                          placeholder="Company"
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />

                  <Controller
                    name="address1"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="address1">
                          Address Line 1
                        </FieldLabel>
                        <Input
                          {...field}
                          id="address1"
                          placeholder="Address Line 1"
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />

                  <Controller
                    name="address2"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="address2">
                          Address Line 2 (Optional)
                        </FieldLabel>
                        <Input
                          {...field}
                          id="address2"
                          placeholder="Address Line 2"
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />

                  <Controller
                    name="town"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="town">Town</FieldLabel>
                        <Input
                          {...field}
                          id="town"
                          placeholder="Town"
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />

                  <Controller
                    name="city"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="city">City (Optional)</FieldLabel>
                        <Input
                          {...field}
                          id="city"
                          placeholder="City"
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />

                  <Controller
                    name="postcode"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="postcode">Postcode</FieldLabel>
                        <Input
                          {...field}
                          id="postcode"
                          placeholder="Postcode"
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />

                  <Controller
                    name="country"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel>Country</FieldLabel>
                        <Select
                          name={field.name}
                          value={field.value}
                          onValueChange={field.onChange}
                          items={countriesData.map((country) => ({
                            value: country.label,
                            label: country.label,
                          }))}
                        >
                          <SelectTrigger aria-invalid={fieldState.invalid}>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent alignItemWithTrigger={false}>
                            <SelectGroup>
                              {countriesData.map((country) => (
                                <SelectItem
                                  key={country.label}
                                  value={country.label}
                                >
                                  {country.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />

                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                          {...field}
                          id="email"
                          placeholder="Email"
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />

                  <Controller
                    name="phone"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="phone">Phone</FieldLabel>
                        <Input
                          {...field}
                          id="phone"
                          placeholder="Phone"
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />
                </div>

                <AnimatePresence>
                  {hasAddressChanged && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Controller
                        name="updateSavedAddress"
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field
                            orientation="horizontal"
                            data-invalid={fieldState.invalid}
                          >
                            <CheckboxCard
                              id="updateSavedAddress"
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              title="Update my saved address with these changes"
                              disabled={isLoading}
                            />
                          </Field>
                        )}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GlowingIcon icon="CalendarIcon" size="sm" color="#ff0084" />
                  Delivery Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Controller
                  name="deliveryDate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Popover>
                        <PopoverTrigger
                          render={
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            />
                          }
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto sopacity-50" />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date <= new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GlowingIcon icon="MessageSquare" size="sm" color="#ea580c" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="externalRef"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="externalRef">
                          External Reference (Optional)
                        </FieldLabel>
                        <Input
                          {...field}
                          id="externalRef"
                          placeholder="External Reference"
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />
                  <Controller
                    name="poRef"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="poRef">
                          PO Reference (Optional)
                        </FieldLabel>
                        <Input
                          {...field}
                          id="poRef"
                          placeholder="PO reference"
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldError>{fieldState.error?.message}</FieldError>
                      </Field>
                    )}
                  />
                </div>
                <Controller
                  name="comments"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Comments</FieldLabel>
                      <Textarea
                        {...field}
                        placeholder="Any special instructions..."
                        className="resize-none"
                        aria-invalid={fieldState.invalid}
                      />
                      <FieldError>{fieldState.error?.message}</FieldError>
                    </Field>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="lg:col-span-1 lg:sticky top-20 h-[70dvh] space-y-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GlowingIcon icon="Package" size="sm" color="#ca8a04" />
                    Items ({totalItems})
                  </div>
                  <Badge variant="secondary">{weightFormat(totalWeight)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 md:space-y-4 p-2 overflow-y-auto h-[70dvh]">
                {cartItems.map((item) => (
                  <CartItemCard key={item.id} item={item} />
                ))}
              </CardContent>
            </Card>

            <div className="w-full">
              <LoadingButton
                title="Place Order"
                stretch
                isLoading={isLoading}
                type="submit"
              />
            </div>
          </div>
        </form>
      )}
    </main>
  );
}

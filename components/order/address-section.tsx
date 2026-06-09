"use client";

import { Check, Edit2, MailIcon, Phone, X } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import { GlowingIcon } from "@/components/ui/glowing-icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { countriesData } from "@/data/countries-data";
import type { OrderWithFullDetails } from "@/data/orders";
import { updateOrder } from "@/data/orders";

interface AddressSectionProps {
  order: OrderWithFullDetails;
  orgId: string;
  isAdmin?: boolean;
}

export function AddressSection({
  order,
  orgId,
  isAdmin = false,
}: AddressSectionProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullname: order.fullname,
    email: order.email,
    phone: order.phone,
    address1: order.address1,
    address2: order.address2 || "",
    city: order.city || "",
    town: order.town || "",
    postcode: order.postcode,
    country: order.country || "United Kingdom",
  });

  const isOrderLocked =
    order.status === "cancelled" || order.status === "returned";
  const isAddressLocked =
    order.status !== "pending";

  // const countryItems = useMemo(
  //   () => countriesData.map((c) => ({ value: c.label, label: c.label })),
  //   [],
  // );

  const handleSave = async () => {
    if (!isAdmin) return;
    setIsSaving(true);
    try {
      await updateOrder({ id: order.id, orgId, address: formData });
      setIsEditing(false);
      toast.success("Address updated successfully");
      router.refresh();
    } catch {
      toast.error("Failed to update address");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <GlowingIcon icon="MapPin" size="sm" color="#ef4444" />
            Address Details
          </h3>
          {isAdmin && !isOrderLocked && !isAddressLocked && (
            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.div
                  key="display-btns"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="size-3" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="edit-btns"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex gap-2"
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    <Check className="size-4 mr-1" /> Save
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing-content"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
                className="grid grid-cols-1 gap-3 pt-2"
              >
                <button type="submit" className="hidden" aria-hidden />
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Full Name
                  </Label>
                  <Input
                    value={formData.fullname}
                    onChange={(e) =>
                      setFormData({ ...formData, fullname: e.target.value })
                    }
                    placeholder="Full Name"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Email
                    </Label>
                    <Input
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="Email"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Phone
                    </Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="Phone"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Address 1
                  </Label>
                  <Input
                    value={formData.address1}
                    onChange={(e) =>
                      setFormData({ ...formData, address1: e.target.value })
                    }
                    placeholder="Address 1"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                    Address 2
                  </Label>
                  <Input
                    value={formData.address2}
                    onChange={(e) =>
                      setFormData({ ...formData, address2: e.target.value })
                    }
                    placeholder="Address 2"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      City
                    </Label>
                    <Input
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      placeholder="City"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Town
                    </Label>
                    <Input
                      value={formData.town}
                      onChange={(e) =>
                        setFormData({ ...formData, town: e.target.value })
                      }
                      placeholder="Town"
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Postcode
                    </Label>
                    <Input
                      value={formData.postcode}
                      onChange={(e) =>
                        setFormData({ ...formData, postcode: e.target.value })
                      }
                      placeholder="Postcode"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Country
                    </Label>
                    <Combobox
                      items={countriesData}
                      value={formData.country}
                      onValueChange={(value) => {
                        if (value)
                          setFormData((prev) => ({ ...prev, country: value }));
                      }}
                    >
                      <ComboboxTrigger
                        render={
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-between font-normal"
                          />
                        }
                      >
                        <ComboboxValue />
                      </ComboboxTrigger>
                      <ComboboxContent className="w-full">
                        <ComboboxInput
                          showTrigger={false}
                          placeholder="Search"
                        />
                        <ComboboxEmpty>No countries found.</ComboboxEmpty>
                        <ComboboxList>
                          {(item) => (
                            <ComboboxItem key={item.label} value={item.label}>
                              {item.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="display-content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-2"
            >
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground leading-relaxed">
                  <p className="font-semibold text-foreground">
                    {order.fullname}
                  </p>
                  <p>{order.address1}</p>
                  {order.address2 && <p>{order.address2}</p>}
                  <p>
                    {order.town}
                    {order.city && `, ${order.city}`}
                  </p>
                  <p>{order.postcode}</p>
                  <p className="font-medium text-primary">{order.country}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
                      <MailIcon className="size-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <p className="text-xs font-medium truncate">
                      {order.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <Phone className="size-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-xs font-medium">{order.phone}</p>
                  </div>
                </div>
              </div>
              {isAdmin && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <Avatar className="size-12 ring-2 ring-primary/10 transition-all hover:ring-primary/30">
                      <AvatarImage src={order.user?.image ?? ""} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {order.fullname?.slice(0, 2).toUpperCase() || "PDi"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold truncate">{order.user?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.user?.email}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import type { Address } from "@/app/generated/prisma/client";
import { motion } from "motion/react";
import { GlowingIcon } from "@/components/ui/glowing-icon";

export default function PreviousAddressList({
  addresses,
  onSelect,
}: {
  addresses: Address[];
  onSelect: (address: Address) => void;
}) {
  if (!addresses || addresses.length < 1) return null;

  const getlabel = (address: Address) => {
    return [
      address.fullname,
      address.company,
      address.address1,
      address.address2,
      address.town,
      address.city,
      address.postcode,
      address.country,
    ]
      .filter(Boolean)
      .join(", ");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <GlowingIcon icon="MapPin" size="sm" color="#228dff" />
            Previous Addresses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Combobox
            items={addresses}
            onValueChange={(id) => {
              const selected = addresses.find((address) => address.id === id);
              if (selected) onSelect(selected);
            }}
          >
            <ComboboxInput placeholder="Select a previous address" showClear />
            <ComboboxContent>
              <ComboboxEmpty>No results.</ComboboxEmpty>
              <ComboboxList>
                {addresses.map((address) => (
                  <ComboboxItem key={address.id} value={address.id}>
                    {getlabel(address)}
                  </ComboboxItem>
                ))}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </CardContent>
      </Card>
    </motion.div>
  );
}

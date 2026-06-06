import { z } from "zod";
import { addressFields } from "./address-schema";

export const orderSchema = z.object({
  ...addressFields,
  addressId: z.string().optional(),
  reference: z.string().optional(),
  externalRef: z.string().optional(),
  poRef: z.string().optional(),
  comments: z.string().optional(),
  weight: z.number(),

  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1),
      }),
    )
    .optional(),
  deliveryDate: z.date(),
  updateSavedAddress: z.boolean().optional(),
  userId: z.string().optional(),
});

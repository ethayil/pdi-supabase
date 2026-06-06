import { z } from "zod";

export const addressFields = {
  fullname: z.string().min(3, { message: "Min 3 chars" }),
  company: z.string().optional(),
  address1: z.string().min(3, { message: "Min 3 chars" }),
  address2: z.string().optional().or(z.literal("")),
  town: z.string().min(3, { message: "Min 3 chars" }),
  city: z.string().optional().or(z.literal("")),
  postcode: z.string().min(3, { message: "Min 3 chars" }),
  country: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(3, { message: "Min 3 chars" }),
};

export const addressSchema = z.object({
  ...addressFields,
  addressId: z.string().optional(),
  userId: z.string().optional(),
  orgId: z.string().optional(),
});

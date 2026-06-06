import { z } from "zod";

export const productSchema = z.object({
  sku: z.string().min(2).max(50),
  name: z.string().min(2).max(50),  
  description: z.string().optional(),
  weight: z.number().min(0, "Weight must be a positive number"),
  quantity: z.number().min(0).max(10000),
  imgUrl: z.string().optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
  orgId: z.string().min(1, "Organization is required"),
  isActive: z.boolean(),
});

import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2).max(50),
  orgId: z.string(),
  isActive: z.optional(z.boolean()),
});

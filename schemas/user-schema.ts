import { z } from "zod";

export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(50),
  email: z.string().email(),
  role: z.enum(["user", "orgAdmin", "superAdmin", "warehouse"]),
  orgId: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean(),
  emailVerified: z.boolean().optional(),
});

import { z } from "zod";
import { USER_ROLE_VALUES } from "@/types/globals";

export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(50),
  email: z.string().email(),
  role: z.enum(USER_ROLE_VALUES),
  orgId: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean(),
  emailVerified: z.boolean().optional(),
});

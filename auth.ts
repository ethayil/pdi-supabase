import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { admin, emailOTP } from "better-auth/plugins";
import type { Organization as PrismaOrganization } from "@/app/generated/prisma/client";
import {
  sendAccountVerificationEmail,
  sendPasswordResetEmail,
} from "./data/email";
import prisma from "./lib/prisma";
import { getSiteUrl } from "./utils/site-url";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    disableSignUp: false,
  },
  plugins: [
    admin(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      sendVerificationOnSignUp: false,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          const siteUrl = getSiteUrl();
          const url = `${siteUrl}/auth/verify-email?email=${
            encodeURIComponent(email)
          }&otp=${encodeURIComponent(otp)}`;
          await sendAccountVerificationEmail({ to: email, url });
        } else if (type === "forget-password") {
          await sendPasswordResetEmail({ to: email, otp });
        }
      },
    }),
    nextCookies(),
  ],
  user: {
    additionalFields: {
      role: {
        type: ["user", "orgAdmin", "admin", "warehouse"],
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
  session: {
    additionalFields: {
      activeOrganizationId: {
        type: "string",
        required: false,
        returned: true
      },
    },
    cookieCache: {
      enabled: true,
      maxAge: 1 * 60, // Cache duration in seconds
    },
  },
});

export type User = (typeof auth.$Infer.Session)["user"];
export type Organization = PrismaOrganization;


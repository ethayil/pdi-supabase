import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { admin, emailOTP, organization } from "better-auth/plugins";
import {
  sendAccountVerificationEmail,
  sendInvitationEmail,
  sendPasswordResetEmail,
} from "./data/email";
import { globalAdminPlugin } from "./lib/auth/global-admin-plugin";
import prisma from "./lib/prisma";
import { getSiteUrl } from "./utils/site-url";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  plugins: [
    admin(),
    organization({
      async sendInvitationEmail({ id, role, email, inviter, organization }) {
        const siteUrl = getSiteUrl();
        const url = `${siteUrl}/auth/accept-invitation?id=${
          encodeURIComponent(id)
        }`;
        await sendInvitationEmail({
          to: email,
          inviterName: inviter?.user?.name || "An administrator",
          orgName: organization?.name || "PDi",
          role: role ?? "member",
          url,
        });
      },
      schema: {
        organization: {
          additionalFields: {
            prefix: {
              type: "string",
              required: false,
            },
            vat: {
              type: "string",
              required: false,
            },
            isActive: {
              type: "boolean",
              required: false,
              defaultValue: true,
            },
            supportEmail: {
              type: "string[]",
              required: false,
            },
            supportPhone: {
              type: "string[]",
              required: false,
            },
            address1: {
              type: "string",
              required: false,
            },
            address2: {
              type: "string",
              required: false,
            },
            town: {
              type: "string",
              required: false,
            },
            city: {
              type: "string",
              required: false,
            },
            postcode: {
              type: "string",
              required: false,
            },
            country: {
              type: "string",
              required: false,
            },
            primaryColor: {
              type: "string",
              required: false,
              defaultValue: "#0056D2",
            },
            secondaryColor: {
              type: "string",
              required: false,
            },
            fontFamily: {
              type: "string",
              required: false,
            },
            welcomeMessage: {
              type: "string",
              required: false,
            },
            lowStockThreshold: {
              type: "number",
              required: false,
              defaultValue: 50,
            },
            description: {
              type: "string",
              required: false,
            },
            enableInvoices: {
              type: "boolean",
              required: false,
              defaultValue: false,
            },
            enableInventory: {
              type: "boolean",
              required: false,
              defaultValue: false,
            },
            updatedAt: {
              type: "date",
              required: false,
            },
          },
        },
      },
    }),
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
    globalAdminPlugin(),
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
    cookieCache: {
      enabled: true,
      maxAge: 1 * 60, // Cache duration in seconds
    },
  },
});

export type User = (typeof auth.$Infer.Session)["user"];
export type Organization = typeof auth.$Infer.Organization;

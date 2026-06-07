import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
import { admin, emailOTP, organization } from "better-auth/plugins";
import prisma from "./lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: { enabled: true },
  plugins: [
    admin(),
    organization({
      // TODO: Update
      // allowUserToCreateOrganization: async (user) => {
      //     const  = await getSession();
      //     return subscription.plan === "pro";
      //   },
      schema: {
        organization: {
          additionalFields: {
            prefix: {
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
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          // Send the OTP for sign in
        } else if (type === "email-verification") {
          // Send the OTP for email verification
        } else {
          // Send the OTP for password reset
        }
      },
    }),
    nextCookies(),
  ],
  user: {
    additionalFields: {
      role: {
        type: ["user", "orgAdmin", "superAdmin", "warehouse"],
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
});

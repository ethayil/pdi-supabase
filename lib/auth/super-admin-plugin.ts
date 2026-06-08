import type { BetterAuthPlugin } from "better-auth";
import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware,
} from "better-auth/api";
import { getOrgAdapter } from "better-auth/plugins/organization";
import { z } from "zod";

// Create a plugin for your super admin endpoints
export const superAdminPlugin = () => {
  return {
    id: "super-admin",
    endpoints: {
      superAdminUpdateOrganization: createAuthEndpoint(
        "/super-admin/organization/update",
        {
          method: "POST",
          body: z.object({
            organizationId: z.string(),
            data: z.object({
              name: z.string().optional(),
              slug: z.string().optional(),
              logo: z.string().nullish(),
              prefix: z.string().optional(),
              isActive: z.boolean().optional().default(true),
              supportEmail: z.array(z.string()).optional(),
              supportPhone: z.array(z.string()).optional(),
              address1: z.string().optional(),
              address2: z.string().optional(),
              town: z.string().optional(),
              city: z.string().optional(),
              postcode: z.string().optional(),
              country: z.string().optional(),
              primaryColor: z.string().optional().default("#0056D2"),
              secondaryColor: z.string().optional(),
              fontFamily: z.string().optional(),
              welcomeMessage: z.string().optional(),
              lowStockThreshold: z.number().optional().default(50),
              description: z.string().optional(),
              enableInvoices: z.boolean().optional().default(true),
              enableInventory: z.boolean().optional().default(true),
              updatedAt: z.date().optional(),
            }),
          }),
          requireHeaders: true,
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const session = ctx.context.session;

          // Check if user is super admin
          const isSuperAdmin = session.user.role === "superAdmin";
          if (!isSuperAdmin) {
            throw new APIError("FORBIDDEN", {
              message: "Super admin required",
            });
          }

          // Get org options from context (set by organization plugin)
          const orgOptions = (ctx.context as any).orgOptions || {};

          // Use adapter directly to bypass membership check
          const adapter = getOrgAdapter(ctx.context, orgOptions);

          const org = await adapter.findOrganizationById(
            ctx.body.organizationId,
          );
          if (!org) {
            throw new APIError("BAD_REQUEST", {
              message: "Organization not found",
            });
          }

          const updated = await adapter.updateOrganization(
            ctx.body.organizationId,
            ctx.body.data,
          );

          return ctx.json(updated);
        },
      ),
      superAdminDeleteOrganization: createAuthEndpoint(
        "/super-admin/organization/delete",
        {
          method: "POST",
          body: z.object({
            organizationId: z.string(),
          }),
          requireHeaders: true,
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const session = ctx.context.session;

          // Check if user is super admin
          const isSuperAdmin = session.user.role === "superAdmin";
          if (!isSuperAdmin) {
            throw new APIError("FORBIDDEN", {
              message: "Super admin required",
            });
          }

          // Get org options from context (set by organization plugin)
          const orgOptions = (ctx.context as any).orgOptions || {};

          // Use adapter directly to bypass membership check
          const adapter = getOrgAdapter(ctx.context, orgOptions);

          const org = await adapter.findOrganizationById(
            ctx.body.organizationId,
          );
          if (!org) {
            throw new APIError("BAD_REQUEST", {
              message: "Organization not found",
            });
          }

          const deleted = await adapter.deleteOrganization(
            ctx.body.organizationId,
          );

          return ctx.json({
            message: deleted,
            organization: org,
          });
        },
      ),
    },
  } satisfies BetterAuthPlugin;
};

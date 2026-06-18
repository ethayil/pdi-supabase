import type { BetterAuthPlugin } from "better-auth";
import {
  APIError,
  createAuthEndpoint,
  sessionMiddleware,
} from "better-auth/api";
import { getOrgAdapter } from "better-auth/plugins/organization";
import { z } from "zod";
import prisma from "../prisma";

// Create a plugin for your global admin endpoints
export const globalAdminPlugin = () => {
  return {
    id: "global-admin",
    endpoints: {
      adminUpdateOrganization: createAuthEndpoint(
        "/global-admin/organization/update",
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
              vat: z.string().optional(),
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

          // Check if user is global admin
          const isGlobalAdmin = session.user.role === "admin";
          if (!isGlobalAdmin) {
            throw new APIError("FORBIDDEN", {
              message: "Admin required",
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
      adminDeleteOrganization: createAuthEndpoint(
        "/global-admin/organization/delete",
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

          // Check if user is global admin
          const isGlobalAdmin = session.user.role === "admin";
          if (!isGlobalAdmin) {
            throw new APIError("FORBIDDEN", {
              message: "Admin required",
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
      adminAssignUserToOrganization: createAuthEndpoint(
        "/global-admin/user/assign-organization",
        {
          method: "POST",
          body: z.object({
            userId: z.string(),
            orgId: z.string(),
            role: z.string().optional().default("member"),
          }),
          requireHeaders: true,
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const session = ctx.context.session;

          // Check if user is global admin
          const isGlobalAdmin = session.user.role === "admin";
          if (!isGlobalAdmin) {
            throw new APIError("FORBIDDEN", {
              message: "Admin required",
            });
          }

          const { userId, orgId, role } = ctx.body;
          const orgOptions = (ctx.context as any).orgOptions || {};
          const adapter = getOrgAdapter(ctx.context, orgOptions);

          // 1. Get user's current organizations
          const userOrgs = await adapter.listOrganizations(userId);

          // 2. Remove from all existing organizations
          for (const org of userOrgs) {
            const member = await adapter.findMemberByOrgId({
              userId,
              organizationId: org.id,
            });
            if (member) {
              await adapter.deleteMember({
                memberId: member.id,
                organizationId: org.id,
                userId,
              });
            }
          }

          // 3. Then add to new organization (if not "none")
          if (orgId !== "none") {
            const { auth } = await import("../../auth");
            await auth.api.addMember({
              body: {
                userId,
                role: role === "orgAdmin" ? "admin" : "member",
                organizationId: orgId,
              },
              headers: ctx.headers,
            });
          }

          // 4. Update ALL sessions for this user to have the new active org using Better Auth's internal adapter
          const internalAdapter = ctx.context.internalAdapter;
          const sessions = await internalAdapter.listSessions(userId);
          const targetOrgId = orgId === "none" ? null : orgId;
          for (const userSession of sessions) {
            await internalAdapter.updateSession(userSession.token, {
              activeOrganizationId: targetOrgId,
            });
          }

          return ctx.json({
            success: true,
          });
        },
      ),
    },
  } satisfies BetterAuthPlugin;
};

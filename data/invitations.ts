"use server";

import { headers } from "next/headers";
import { auth } from "@/auth";
import { requireAdmin } from "@/lib/auth/get-session";
import prisma from "@/lib/prisma";

export async function createOrgInvitation({
  email,
  role = "member",
  organizationId,
}: {
  email: string;
  role?: string;
  organizationId: string;
}) {
  try {
    const adminUser = await requireAdmin();

    if (!email) {
      return { success: false, error: "Email is required" };
    }
    if (!organizationId) {
      return { success: false, error: "Organization ID is required" };
    }

    const targetOrg = await prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!targetOrg) {
      return { success: false, error: "Organization not found" };
    }

    // Ensure the inviter Admin has a member record in this organization
    const existingMember = await prisma.member.findFirst({
      where: {
        userId: adminUser.id,
        organizationId,
      },
    });

    if (!existingMember) {
      await prisma.member.create({
        data: {
          id: crypto.randomUUID(),
          organizationId,
          userId: adminUser.id,
          role: "admin",
          createdAt: new Date(),
        },
      });
    }

    // Call Better Auth createInvitation API
    const invitation = await auth.api.createInvitation({
      body: {
        email: email.toLowerCase().trim(),
        role: role as "member" | "admin" | "owner",
        organizationId,
      },
      headers: await headers(),
    });

    return {
      success: true,
      invitation,
    };
  } catch (error) {
    console.error("Error creating organization invitation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create invitation",
    };
  }
}

export async function getPublicInvitation({ id }: { id: string }) {
  try {
    if (!id) {
      return { success: false, error: "Invitation ID is required" };
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return { success: false, error: "Invitation not found" };
    }

    if (invitation.status !== "pending") {
      return {
        success: false,
        error: `Invitation has already been ${invitation.status}`,
      };
    }

    if (invitation.expiresAt < new Date()) {
      return { success: false, error: "Invitation has expired" };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email.toLowerCase() },
      select: { id: true },
    });

    return {
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        organizationId: invitation.organizationId,
        organizationName: invitation.organization.name,
        inviterName: invitation.user.name,
        inviterEmail: invitation.user.email,
        expiresAt: invitation.expiresAt,
        userExists: !!existingUser,
      },
    };
  } catch (error) {
    console.error("Error fetching invitation details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch invitation",
    };
  }
}

export async function acceptInvitationAndSignUp({
  invitationId,
  name,
  password,
}: {
  invitationId: string;
  name: string;
  password: string;
}) {
  try {
    if (!invitationId) {
      return { success: false, error: "Invitation ID is required" };
    }
    if (!name || !name.trim()) {
      return { success: false, error: "Name is required" };
    }
    if (!password || password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters" };
    }

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation || invitation.status !== "pending") {
      return { success: false, error: "Invalid or expired invitation" };
    }

    if (invitation.expiresAt < new Date()) {
      return { success: false, error: "Invitation has expired" };
    }

    const email = invitation.email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists. Please sign in to accept.",
      };
    }

    // Sign up user via Better Auth API
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: name.trim(),
      },
      headers: await headers(),
    });

    if (!signUpResult || !signUpResult.user) {
      return { success: false, error: "Failed to create account" };
    }

    const userId = signUpResult.user.id;

    // Mark email as verified and assign invited user role
    const assignedRole = invitation.role || "user";
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        role: assignedRole,
      },
    });

    // Create member link for the organization
    await prisma.member.create({
      data: {
        id: crypto.randomUUID(),
        organizationId: invitation.organizationId,
        userId: userId,
        role: assignedRole,
        createdAt: new Date(),
      },
    });

    // Update activeOrganizationId on any active sessions created for this user
    await prisma.session.updateMany({
      where: { userId },
      data: { activeOrganizationId: invitation.organizationId },
    });

    // Mark invitation as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "accepted" },
    });

    return {
      success: true,
      email,
      organizationId: invitation.organizationId,
    };
  } catch (error) {
    console.error("Error accepting invitation with sign up:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process registration",
    };
  }
}



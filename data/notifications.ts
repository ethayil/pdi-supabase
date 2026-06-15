"use server";

import { revalidateTag, unstable_cache } from "next/cache";
import { after } from "next/server";
import type { NotificationType } from "@/app/generated/prisma/client";
import { requireSuperAdmin, requireUser } from "@/lib/auth/get-session";
import { cacheTags } from "@/lib/cache-tags";
import prisma from "@/lib/prisma";

export async function createNotification(params: {
  userId: string;
  orgId: string;
  systemSource?: string;
  type:
    | "order_placed"
    | "order_status_update"
    | "low_stock_alert"
    | "custom_message";
  title: string;
  message: string;
  linkUrl?: string;
  relatedEntityId?: string;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        orgId: params.orgId,
        systemSource: params.systemSource || null,
        type: params.type as NotificationType,
        title: params.title,
        message: params.message,
        linkUrl: params.linkUrl || null,
        relatedEntityId: params.relatedEntityId || null,
        isRead: false,
      },
    });
    revalidateTag(cacheTags.notifications, "");
    return notification.id;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}

async function fetchNotificationsDbData({
  userId,
  limit,
}: {
  userId: string;
  limit: number;
}) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

const getCachedNotificationsDbData = unstable_cache(
  async (userId: string, limit: number) =>
    fetchNotificationsDbData({ userId, limit }),
  ["user-notifications-cache"],
  {
    revalidate: 30, // Cache for 30 seconds
    tags: [cacheTags.notifications],
  }
);

export async function getNotifications({
  limit = 20,
}: {
  limit?: number;
} = {}) {
  try {
    const user = await requireUser();

    return getCachedNotificationsDbData(user.id, limit);
  } catch (error) {
    console.error("Failed to get notifications:", error);
    return [];
  }
}

async function fetchUnreadCountDbData({ userId }: { userId: string }) {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

const getCachedUnreadCountDbData = unstable_cache(
  async (userId: string) => fetchUnreadCountDbData({ userId }),
  ["user-unread-notifications-count-cache"],
  {
    revalidate: 30, // Cache for 30 seconds
    tags: [cacheTags.notifications],
  }
);

export async function getUnreadCount() {
  try {
    const user = await requireUser();

    return getCachedUnreadCountDbData(user.id);
  } catch (error) {
    console.error("Failed to get unread count:", error);
    return 0;
  }
}

export async function markAsRead({ id }: { id: string }) {
  try {
    const user = await requireUser();

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== user.id) {
      throw new Error("Notification not found");
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    revalidateTag(cacheTags.notifications, "");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    throw error;
  }
}

export async function markAllAsRead() {
  try {
    const user = await requireUser();

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });

    revalidateTag(cacheTags.notifications, "");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    throw error;
  }
}

export async function sendCustomMessage(args: {
  title: string;
  message: string;
  targetType: "all" | "organization" | "user";
  targetId?: string; // orgId or userId
  sendInApp: boolean;
  sendEmail: boolean;
  linkUrl?: string;
}) {
  try {
    const adminUser = await requireSuperAdmin();

    let targetUsers: { id: string; email: string }[] = [];

    if (args.targetType === "all") {
      targetUsers = await prisma.user.findMany({
        select: { id: true, email: true },
      });
    } else if (args.targetType === "organization") {
      if (!args.targetId) throw new Error("Organization ID required");
      const members = await prisma.member.findMany({
        where: { organizationId: args.targetId },
        include: { user: { select: { id: true, email: true } } },
      });
      targetUsers = members.map((m) => m.user);
    } else if (args.targetType === "user") {
      if (!args.targetId) throw new Error("User ID required");
      const user = await prisma.user.findUnique({
        where: { id: args.targetId },
        select: { id: true, email: true },
      });
      if (user) targetUsers = [user];
    }

    after(async () => {
      try {
        if (args.sendInApp) {
          const adminMember = await prisma.member.findFirst({
            where: { userId: adminUser.id },
            select: { organizationId: true },
          });
          const defaultOrgId = adminMember?.organizationId;

          await Promise.all(
            targetUsers.map(async (u) => {
              const targetMember = await prisma.member.findFirst({
                where: { userId: u.id },
                select: { organizationId: true },
              });
              const orgId = targetMember?.organizationId || defaultOrgId;

              if (!orgId) return;

              return prisma.notification.create({
                data: {
                  userId: u.id,
                  orgId: orgId,
                  type: "custom_message",
                  title: args.title,
                  message: args.message,
                  linkUrl: args.linkUrl || null,
                  isRead: false,
                },
              });
            }),
          );
          revalidateTag(cacheTags.notifications, "");
        }

        if (args.sendEmail) {
          console.log(
            "Send email requested for users:",
            targetUsers.map((u) => u.email),
          );
        }
      } catch (err) {
        console.error("Error in sendCustomMessage background actions:", err);
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send custom message:", error);
    throw error;
  }
}

"use server";

import { headers } from "next/headers";
import { auth } from "@/auth";

export const getSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return { session: session?.session, user: session?.user };
};

type SessionUser = NonNullable<Awaited<ReturnType<typeof getSession>>["user"]>;

export const requireUser = async <T extends { shouldThrow?: boolean }>(
  options?: T,
): Promise<
  T extends { shouldThrow: false } ? SessionUser | null : SessionUser
> => {
  const { user } = await getSession();
  if (!user) {
    if (options?.shouldThrow === false) {
      return null as any;
    }
    throw new Error("Unauthorized: Access Denied");
  }
  return user;
};

export const requireAdmin = async () => {
  const user = await requireUser();
  const isAdmin = user.role === "superAdmin" || user.role === "orgAdmin";
  if (!isAdmin) {
    throw new Error("Forbidden: Insufficient Permissions");
  }
  return user;
};

export const requireSuperAdmin = async () => {
  const user = await requireUser();
  if (user.role !== "superAdmin") {
    throw new Error("Forbidden: Insufficient Permissions");
  }
  return user;
};

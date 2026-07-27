"use server";

import { headers } from "next/headers";
import { auth } from "@/auth";

export const getSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isAdmin = session?.user.role === "admin" ||
    session?.user.role === "orgAdmin";
  const isSuperAdmin = session?.user.role === "admin";

  return {
    session: session?.session,
    user: session?.user,
    isAdmin,
    isSuperAdmin,
  };
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
      return null as (T extends { shouldThrow: false } ? SessionUser | null : SessionUser);
    }
    throw new Error("Unauthorized: Access Denied");
  }
  return user;
};

export const requireAdmin = async () => {
  const user = await requireUser();
  const isAdmin = user.role === "admin" || user.role === "orgAdmin";
  if (!isAdmin) {
    throw new Error("Forbidden: Insufficient Permissions");
  }
  return user;
};

export const requireGlobalAdmin = async () => {
  const user = await requireUser();
  if (user.role !== "admin") {
    throw new Error("Forbidden: Insufficient Permissions");
  }
  return user;
};

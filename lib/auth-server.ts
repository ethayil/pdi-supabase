import { headers } from "next/headers";
import { auth } from "@/auth";

export const serverSession = async () => {
  "use server";
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return { session: session?.session, user: session?.user };
};

import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { authRoutes, DEFAULT_LOGIN_REDIRECT, publicRoutes } from "./routes";
import { logRequest } from "./utils/logger";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const isMatch = (path: string, routes: string[]) => {
    return routes.some((route) => {
      if (route === "/") return path === "/";
      return path === route || path.startsWith(`${route}/`);
    });
  };

  const isPublicRoute = isMatch(pathname, publicRoutes);
  const isAuthRoute = isMatch(pathname, authRoutes);

  if (isPublicRoute && !isAuthRoute) {
    logRequest(request, undefined, undefined);
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  logRequest(request, session?.session, session?.user);

  if (!session) {
    if (!isPublicRoute && !isAuthRoute) {
      return NextResponse.redirect(new URL("/auth/signin", request.nextUrl));
    }
  } else {
    if (isAuthRoute) {
      return NextResponse.redirect(
        new URL(DEFAULT_LOGIN_REDIRECT, request.nextUrl),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  // Keeps Next.js from running this middleware on static files/images
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { authRoutes, DEFAULT_LOGIN_REDIRECT, publicRoutes } from "./routes";
import { logRequest } from "./utils/logger";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  logRequest(request, session?.session, session?.user);

  const pathname = request.nextUrl.pathname;

  // Allow all API requests to bypass proxy checks
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

  if (!session) {
    // Redirect unauthenticated users trying to access protected routes
    if (!isPublicRoute && !isAuthRoute) {
      return NextResponse.redirect(new URL("/auth/signin", request.nextUrl));
    }
  } else {
    // Redirect authenticated users trying to access login/register/auth pages
    if (isAuthRoute) {
      return NextResponse.redirect(
        new URL(DEFAULT_LOGIN_REDIRECT, request.nextUrl),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

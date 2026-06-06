import { NextRequest, userAgent } from "next/server";
import { formattedDate } from "./formatted-date";

export const logRequest = async (req: NextRequest) => {
  if (
    req.nextUrl.pathname === "/api/auth/session" ||
    req.nextUrl.pathname === "/api/auth/get-session"
  )
    return;

  let session = null;
  try {
    const response = await fetch(`${req.nextUrl.origin}/api/auth/get-session`, {
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    });
    if (response.ok) {
      session = await response.json();
    }
  } catch (error) {
    console.error("Error fetching session in logger:", error);
  }

  const isLoggedIn = !!session;
  const user = session?.user;
  const userName = user?.name ?? null;
  const userEmail = user?.email ?? null;
  const date = new Date();
  const { method, nextUrl } = req;

  const { os, browser, device, isBot, cpu } = userAgent(req);

  const deviceOs = `${os.name} ${os.version}`;
  const deviceBrowser = `${browser.name} ${browser.major}`;
  const deviceType = `${cpu.architecture} ${device.type} ${device.vendor} ${device.model}`;

  const logEntry = {
    timestamp: formattedDate(date, "long"),
    method,
    path: nextUrl.pathname,
    query: nextUrl.search,
    isLoggedIn,
    ip: req.headers.get("x-forwarded-for") ?? "unknown",
    deviceOs: deviceOs ?? "unknown",
    deviceBrowser,
    deviceType,
    isBot,
    userName,
    userEmail,
  };

  if (
    logEntry.path === "/api/auth/session" ||
    logEntry.path === "/api/auth/get-session"
  )
    return;

  // Log to console
  console.log(JSON.stringify(logEntry));
};

export function getSiteUrl(): string {
  let url =
    process.env.SITE_URL ||
    process.env.BASE_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000";

  if (url === "undefined") {
    url = "http://localhost:3000";
  }

  return url.replace(/\/$/, "");
}

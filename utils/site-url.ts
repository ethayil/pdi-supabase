export function getSiteUrl(): string {
  const url =
    process.env.SITE_URL ||
    process.env.BASE_URL ||
    process.env.BETTER_AUTH_URL ||
    "http://localhost:3000";
  return url.replace(/\/$/, "");
}

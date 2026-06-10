import { Hono } from "hono";
import { createClient, type SupabaseClient } from "supabase";
import type { Database } from "./database.types.ts";
import { ipRestrictionz } from "./middleware/ip-restriction.ts";
import configRouter from "./routes/config.ts";
import listingsRouter from "./routes/listings.ts";
import ordersRouter from "./routes/orders.ts";
import productsRouter from "./routes/products.ts";

const functionName = "lwci";
const app = new Hono<{ Variables: { supabase: SupabaseClient } }>().basePath(
  `/${functionName}`,
);

// IP Restriction middleware for Linnworks
app.use("*", ipRestrictionz);

// Diagnostic Helper to extract Admin Key safely
const getAdminKey = (): string => {
  const rawSecretJson = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (!rawSecretJson) {
    console.error(
      "[ERROR] SUPABASE_SECRET_KEYS environment variable is missing.",
    );
    return "";
  }

  try {
    const secretKeys = JSON.parse(rawSecretJson);
    const adminKey = secretKeys.default;
    return adminKey || "";
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      "[ERROR] Failed to parse SUPABASE_SECRET_KEYS JSON string:",
      message,
    );
    return "";
  }
};

// Middleware to inject Supabase Client into Hono context
app.use("*", async (c, next) => {
  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const adminKey = getAdminKey();
  const supabase = createClient<Database>(url, adminKey);
  c.set("supabase", supabase);
  await next();
});

// Mount Linnworks integration sub-routers under their respective base paths
app.route("/config", configRouter);
app.route("/orders", ordersRouter);
app.route("/", productsRouter); // handles /products/get, /inventory/update, etc.
app.route("/listing", listingsRouter);

// Catch-all handler for unregistered routes
app.notFound((c) => {
  console.warn(`[WARN] Unhandled Request: ${c.req.method} ${c.req.url}`);
  return c.json(
    { error: "Route not registered in Hono application structure" },
    404,
  );
});

// Catch-all for global execution errors
app.onError((err, c) => {
  console.error(`[🚨 HONO CRASH]: ${err.message}`);
  return c.json({ error: "Internal Server Error Exception" }, 500);
});

Deno.serve(app.fetch);

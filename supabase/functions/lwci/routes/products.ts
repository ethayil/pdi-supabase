import { Hono } from "hono";
import type { SupabaseClient } from "supabase";
import type { Database } from "../database.types.ts";
import { logActivity, logProductMovement } from "../utils/logging.ts";
import { getErrorMessage, validateToken } from "../utils/utils.ts";

const productsRouter = new Hono<{
  Variables: { supabase: SupabaseClient<Database> };
}>();

type ProductRow = Database["public"]["Tables"]["product"]["Row"];

interface GetProductsBody {
  AuthorizationToken: string;
  PageNumber: number;
}

type UpdateProductStockType = {
  SKU: string;
  Reference: string;
  Quantity: number;
  MultiLocationLevels?: { Tag: string; Quantity: number }[];
};

interface InventoryUpdateBody {
  AuthorizationToken: string;
  Products: UpdateProductStockType[];
}

type UpdateProductPriceType = {
  SKU: string;
  Reference: string;
  Price: number;
  Tag: string;
};

interface PriceUpdateBody {
  AuthorizationToken: string;
  Inventory: UpdateProductPriceType[];
}

productsRouter.post("/products/get", async (c) => {
  const supabase = c.get("supabase");
  try {
    const body: GetProductsBody = await c.req.json();
    const valid = await validateToken(supabase, body.AuthorizationToken);
    if (!valid) {
      return c.json({ Error: "Invalid Token", Products: [], TotalPages: 0 });
    }

    console.log("[INFO] Fetching products for Linnworks mapping sync...");

    const { data: products, error } = await supabase.from("product").select(
      "*",
    );

    if (error) {
      console.error("[ERROR] Failed to fetch products:", error.message);
      return c.json({ Error: error.message, Products: [], TotalPages: 0 });
    }

    console.log(`[INFO] Returning ${products?.length || 0} products.`);

    return c.json({
      Error: null,
      Products: (products || []).map((p: ProductRow) => ({
        SKU: p.sku,
        Title: p.name,
        Price: 1,
        Quantity: p.quantity,
        Reference: p.id,
      })),
      TotalPages: 1,
    });
  } catch (err) {
    const message = getErrorMessage(err);
    console.error("[ERROR] Unexpected error in products/get:", message);
    return c.json({ Error: message, Products: [], TotalPages: 0 });
  }
});

productsRouter.post("/inventory/update", async (c) => {
  const supabase = c.get("supabase");
  try {
    const body: InventoryUpdateBody = await c.req.json();
    const valid = await validateToken(supabase, body.AuthorizationToken);
    if (!valid) return c.json({ Error: "Invalid Token", Products: [] });

    const productsToUpdate = body.Products || [];
    console.log(
      `[INFO] Updating stock levels for ${productsToUpdate.length} inventory items...`,
    );

    const results = [];

    for (const item of productsToUpdate) {
      const reference = item.Reference;

      const { data: product, error: findError } = await supabase
        .from("product")
        .select("*")
        .eq("id", reference)
        .maybeSingle();

      if (findError || !product) {
        console.warn(
          `[WARN] Product with ID ${reference} (SKU: ${item.SKU}) not found for inventory update.`,
        );
        results.push({ SKU: item.SKU, Error: "SKU not found" });
        continue;
      }

      const quantityBefore = product.quantity;
      const { error: updateError } = await supabase
        .from("product")
        .update({
          quantity: item.Quantity,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", product.id);

      if (updateError) {
        console.error(
          `[ERROR] Failed to update quantity for product ID ${product.id}:`,
          updateError.message,
        );
        results.push({ SKU: item.SKU, Error: updateError.message });
        continue;
      }

      console.log(
        `[INFO] SKU ${product.sku} stock level updated: ${quantityBefore} -> ${item.Quantity}`,
      );

      await logProductMovement(supabase, {
        orgId: product.orgId,
        productId: product.id,
        systemSource: "linnworks",
        movementType: "adjustment",
        quantityChange: item.Quantity - quantityBefore,
        quantityBefore,
        quantityAfter: item.Quantity,
        reason: "Linnworks Inventory Sync",
      });

      await logActivity(supabase, {
        orgId: product.orgId,
        systemSource: "linnworks",
        action: "update",
        entityType: "product_stock",
        entityId: product.id,
        description:
          `Stock updated for ${product.name} (SKU: ${product.sku}). ${quantityBefore} -> ${item.Quantity}`,
        changes: {
          quantity: { from: quantityBefore, to: item.Quantity },
        },
      });

      results.push({ SKU: item.SKU, Error: null });
    }

    return c.json({ Error: null, Products: results });
  } catch (err) {
    const message = getErrorMessage(err);
    console.error("[ERROR] Unexpected error in inventory/update:", message);
    return c.json({ Error: message, Products: [] });
  }
});

productsRouter.post("/inventory/price-update", async (c) => {
  return c.json({ Error: null });
});

export default productsRouter;

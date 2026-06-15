import { Hono } from "hono";
import type { SupabaseClient } from "supabase";
import type { Database, Json } from "../database.types.ts";
import { logActivity, logProductMovement } from "../utils/logging.ts";
import { getErrorMessage, validateToken } from "../utils/utils.ts";

const listingsRouter = new Hono<{
  Variables: { supabase: SupabaseClient<Database> };
}>();

// type OrganizationRow = Database["public"]["Tables"]["organization"]["Row"];
// type CategoryRow = Database["public"]["Tables"]["category"]["Row"];
// type ProductRow = Database["public"]["Tables"]["product"]["Row"];

interface CategoriesBody {
  AuthorizationToken: string;
}

interface AttributesBody {
  AuthorizationToken: string;
  CategoryIds: string[];
  GeneralSettings?: Json[];
}

interface VariationsBody {
  AuthorizationToken: string;
  CategoryIds: string[];
  GeneralSettings?: Json[];
}

interface ListingUpdateBody {
  AuthorizationToken: string;
  ListingUpdateType?: number;
  Listings: {
    ConfiguratorId?: number;
    TemplateId?: number;
    ExternalListingId?: number;
    SKU: string;
    Title: string;
    Categories?: string[];
    Description?: string;
    Price?: number;
    Quantity?: number;
    CategoryId: string;
    Images?: { Url: string; AltText: string }[];
    Attributes?: {
      AttributeId: string;
      AttributeValue: string;
      AttributeName: string;
    }[];
  }[];
  GeneralSettings?: Json[];
}

interface ListingDeleteBody {
  AuthorizationToken: string;
  ExternalListingIds: {
    ChannelSKU?: string;
  }[];
}

interface CheckFeedBody {
  AuthorizationToken: string;
  ChannelFeedId: string;
}

listingsRouter.post("/configurator-settings", async (c) => {
  return c.json({
    Error: null,
    Settings: [],
    MaxDescriptionLength: 10000,
    ImageSettings: {
      Type: 2,
      MaxImages: 100,
      MaxVariantImages: 0,
      ImageTags: [],
    },
    MaxCategoryCount: 1000,
    MaxCustomAttributeLength: 1000,
    IsCustomHtmlSupported: false,
    IsCustomAttributesAllowed: false,
    IsVariationsAllowed: false,
    HasMainVariationPrice: false,
    IsTitleInVariation: false,
    HasVariationAttributeDisplayName: false,
    IsPriceInVariation: false,
    IsShippingListingSpecific: false,
    IsPaymentListingSpecific: false,
  });
});

listingsRouter.post("/categories", async (c) => {
  const supabase = c.get("supabase");
  try {
    const body: CategoriesBody = await c.req.json();
    const valid = await validateToken(supabase, body.AuthorizationToken);
    if (!valid) return c.json({ Error: "Invalid Token" });

    const { data: organizations, error } = await supabase
      .from("organization")
      .select("id, name");

    if (error) {
      console.error(
        "[ERROR] Failed to fetch organizations for listings:",
        error.message,
      );
      return c.json({ Error: error.message });
    }

    return c.json({
      HasMorePages: false,
      Categories: (organizations || []).map((org) => ({
        CategoryId: org.id,
        CategoryName: org.name,
      })),
    });
  } catch (err) {
    return c.json({ Error: getErrorMessage(err) });
  }
});

listingsRouter.post("/attributes", async (c) => {
  const supabase = c.get("supabase");
  try {
    const body: AttributesBody = await c.req.json();
    const valid = await validateToken(supabase, body.AuthorizationToken);
    if (!valid) return c.json({ Error: "Invalid Token" });

    const firstCategoryId = body.CategoryIds?.[0];
    if (!firstCategoryId) return c.json({ Error: "No categories provided" });

    const { data: categories, error } = await supabase
      .from("category")
      .select("name")
      .eq("orgId", firstCategoryId);

    if (error) {
      console.error(
        "[ERROR] Failed to fetch categories for listing attributes:",
        error.message,
      );
      return c.json({ Error: error.message });
    }

    return c.json({
      Error: null,
      Attributes: [
        {
          ID: "cat-id",
          AttribueReadFrom: "Child",
          MustBeSpecified: "Required",
          FriendlyName: "AppCategory",
          Description: "Select the product category for this listing",
          ExpectedType: "STRING",
          ValueOptions: (categories || []).map((cat) => cat.name),
          ValueFromOptionsList: true,
          MaxAttributeUse: 2,
          RegExValidation: null,
          RegExError: null,
        },
      ],
    });
  } catch (err) {
    return c.json({ Error: getErrorMessage(err) });
  }
});

listingsRouter.post("/variations", async (c) => {
  const supabase = c.get("supabase");
  try {
    const body: VariationsBody = await c.req.json();
    const valid = await validateToken(supabase, body.AuthorizationToken);
    if (!valid) {
      return c.json({
        Error: "Invalid Token",
        MaxVariationAttributes: 50,
        NeededVariations: [],
      });
    }

    return c.json({
      Error: null,
      MaxVariationAttributes: 10,
      NeededVariations: [],
    });
  } catch (err) {
    return c.json({ Error: getErrorMessage(err) });
  }
});

listingsRouter.post("/update", async (c) => {
  const supabase = c.get("supabase");
  try {
    const body: ListingUpdateBody = await c.req.json();
    const valid = await validateToken(supabase, body.AuthorizationToken);
    if (!valid) return c.json({ Error: "Invalid Token", ChannelFeedId: null });

    const feedId = crypto.randomUUID();
    const listingsToUpdate = body.Listings || [];
    console.log(
      `[INFO] Updating ${listingsToUpdate.length} product listings via Generic Listing Tool...`,
    );

    for (const listing of listingsToUpdate) {
      const sku = listing.SKU;
      const orgId = listing.CategoryId;

      if (!orgId) {
        console.error(
          `[ERROR] Invalid CategoryId (Organization ID) for SKU ${sku}`,
        );
        continue;
      }

      const appCategoryAttr = listing.Attributes?.find(
        (a) => a.AttributeId === "cat-id" || a.AttributeId === "ID",
      );

      let categoryId = null;
      if (appCategoryAttr?.AttributeValue) {
        const { data: category } = await supabase
          .from("category")
          .select("id")
          .eq("orgId", orgId)
          .eq("name", appCategoryAttr.AttributeValue)
          .maybeSingle();
        categoryId = category?.id || null;
      }

      if (!categoryId) {
        console.error(
          `[ERROR] App Category "${appCategoryAttr?.AttributeValue}" not found for SKU ${sku} in org ${orgId}`,
        );
        continue;
      }

      const { data: existingProduct } = await supabase
        .from("product")
        .select("*")
        .eq("sku", sku)
        .maybeSingle();

      const productData = {
        orgId,
        categoryId,
        sku,
        name: listing.Title,
        description: listing.Description || null,
        weight: 0,
        quantity: listing.Quantity || 0,
        imgUrl: listing.Images?.[0]?.Url || null,
        isActive: true,
        updatedAt: new Date().toISOString(),
      };

      if (existingProduct) {
        const previousQuantity = existingProduct.quantity;
        const { error: updateError } = await supabase
          .from("product")
          .update(productData)
          .eq("id", existingProduct.id);

        if (updateError) {
          console.error(
            `[ERROR] Failed to update product for SKU ${sku}:`,
            updateError.message,
          );
          continue;
        }

        console.log(
          `[INFO] Listing update: product SKU ${sku} updated in database.`,
        );

        if (previousQuantity !== productData.quantity) {
          await logProductMovement(supabase, {
            orgId,
            productId: existingProduct.id,
            systemSource: "linnworks",
            movementType: "adjustment",
            quantityChange: productData.quantity - previousQuantity,
            quantityBefore: previousQuantity,
            quantityAfter: productData.quantity,
            reason: "Linnworks Listing Update",
          });
        }

        await logActivity(supabase, {
          orgId,
          systemSource: "linnworks",
          action: "update",
          entityType: "product",
          entityId: existingProduct.id,
          description:
            `Product "${listing.Title}" (SKU: ${sku}) updated via Linnworks listing sync`,
          changes: productData,
        });
      } else {
        // Find admin user to use as creator
        let userId = "";
        const { data: systemUser } = await supabase
          .from("user")
          .select("id")
          .in("role", ["admin"])
          .limit(1)
          .maybeSingle();

        if (systemUser) {
          userId = systemUser.id;
        } else {
          const { data: anyUser } = await supabase
            .from("user")
            .select("id")
            .limit(1)
            .maybeSingle();
          if (anyUser) {
            userId = anyUser.id;
          } else {
            console.error(
              "[ERROR] No user found in user table to set as createdById",
            );
            continue;
          }
        }

        const newProductId = crypto.randomUUID();
        const { error: insertError } = await supabase.from("product").insert({
          id: newProductId,
          ...productData,
          createdById: userId,
          createdAt: new Date().toISOString(),
        });

        if (insertError) {
          console.error(
            `[ERROR] Failed to insert product for SKU ${sku}:`,
            insertError.message,
          );
          continue;
        }

        console.log(
          `[INFO] Listing update: product SKU ${sku} created in database.`,
        );

        await logActivity(supabase, {
          orgId,
          systemSource: "linnworks",
          action: "create",
          entityType: "product",
          entityId: newProductId,
          description:
            `Product "${listing.Title}" (SKU: ${sku}) created via Linnworks listing sync`,
        });

        await logProductMovement(supabase, {
          orgId: newProductId,
          systemSource: "linnworks",
          productId: newProductId,
          movementType: "initial",
          quantityChange: productData.quantity,
          quantityBefore: 0,
          quantityAfter: productData.quantity,
          reason: "Initial stock from Linnworks listing sync",
        });
      }
    }

    return c.json({ Error: null, ChannelFeedId: feedId });
  } catch (err) {
    const message = getErrorMessage(err);
    console.error("[ERROR] Unexpected error in listing/update:", message);
    return c.json({ Error: message, ChannelFeedId: null });
  }
});

listingsRouter.post("/delete", async (c) => {
  const supabase = c.get("supabase");
  try {
    const body: ListingDeleteBody = await c.req.json();
    const valid = await validateToken(supabase, body.AuthorizationToken);
    if (!valid) return c.json({ Error: "Invalid Token", ChannelFeedId: null });

    const feedId = crypto.randomUUID();
    const listingsToDelete = body.ExternalListingIds || [];
    console.log(
      `[INFO] Deactivating ${listingsToDelete.length} listings via Generic Listing Tool...`,
    );

    for (const listing of listingsToDelete) {
      const sku = listing.ChannelSKU;
      if (!sku) continue;

      const { data: product } = await supabase
        .from("product")
        .select("*")
        .eq("sku", sku)
        .maybeSingle();

      if (product) {
        const { error: updateError } = await supabase
          .from("product")
          .update({
            isActive: false,
            updatedAt: new Date().toISOString(),
          })
          .eq("id", product.id);

        if (updateError) {
          console.error(
            `[ERROR] Failed to deactivate product SKU ${sku}:`,
            updateError.message,
          );
          continue;
        }

        console.log(
          `[INFO] Listing delete: product SKU ${sku} deactivated in database.`,
        );

        await logActivity(supabase, {
          orgId: product.orgId,
          systemSource: "linnworks",
          action: "delete",
          entityType: "product",
          entityId: product.id,
          description:
            `Product "${product.name}" (SKU: ${sku}) deactivated via Linnworks listing delete`,
        });
      }
    }

    return c.json({ Error: null, ChannelFeedId: feedId });
  } catch (err) {
    const message = getErrorMessage(err);
    console.error("[ERROR] Unexpected error in listing/delete:", message);
    return c.json({ Error: message, ChannelFeedId: null });
  }
});

listingsRouter.post("/check-feed", async (c) => {
  const supabase = c.get("supabase");
  try {
    const body: CheckFeedBody = await c.req.json();
    const valid = await validateToken(supabase, body.AuthorizationToken);
    if (!valid) return c.json({ Error: "Invalid Token" });

    return c.json({
      Error: null,
      IsFeedReady: true,
      ProductFeeds: [],
    });
  } catch (err) {
    return c.json({ Error: getErrorMessage(err) });
  }
});

export default listingsRouter;

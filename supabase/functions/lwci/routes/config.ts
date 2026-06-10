import { Hono } from "hono";
import type { SupabaseClient } from "supabase";
import { couriersData } from "../data/couriers-data.ts";
import type { Database, Json } from "../database.types.ts";
import { getErrorMessage, validateToken } from "../utils/utils.ts";

const configRouter = new Hono<{
  Variables: { supabase: SupabaseClient<Database> };
}>();

interface AddNewUserBody {
  AccountName: string;
  Email: string;
  LinnworksUniqueIdentifier: string;
}

interface UserConfigBody {
  AuthorizationToken: string;
  StepName?: string | null;
}

interface SaveConfigBody {
  AuthorizationToken: string;
  ConfigItems: Json;
  StepName?: string | null;
}

interface ConfigTestBody {
  AuthorizationToken: string;
}

interface ConfigDeletedBody {
  AuthorizationToken: string;
}

configRouter.post("/add-new-user", async (c) => {
  const supabase = c.get("supabase");
  try {
    const body: AddNewUserBody = await c.req.json();
    const { AccountName, Email, LinnworksUniqueIdentifier } = body;
    console.log(
      `[INFO] /linnworks/config/add-new-user called for account: ${AccountName}`,
    );

    const authorizationToken = crypto.randomUUID();

    const { error } = await supabase.from("linnworks_integration").insert({
      id: crypto.randomUUID(),
      authorizationToken,
      linnworksIdentifier: LinnworksUniqueIdentifier,
      email: Email,
      channelName: AccountName,
      isActive: true,
      lastSyncAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (error) {
      console.error(
        "[ERROR] Failed to insert new Linnworks user:",
        error.message,
      );
      return c.json({ Error: error.message, AuthorizationToken: null });
    }

    return c.json({ Error: null, AuthorizationToken: authorizationToken });
  } catch (err) {
    const message = getErrorMessage(err);
    console.error("[ERROR] Unexpected error in add-new-user:", message);
    return c.json({ Error: message, AuthorizationToken: null });
  }
});

configRouter.post("/user-config", async (c) => {
  const supabase = c.get("supabase");
  try {
    const body: UserConfigBody = await c.req.json();
    const valid = await validateToken(supabase, body.AuthorizationToken);
    if (!valid) return c.json({ Error: "Invalid Token" });

    return c.json({
      StepName: "UserConfig",
      WizardStepTitle: "Verification",
      WizardStepDescription: "Done",
    });
  } catch (err) {
    return c.json({ Error: getErrorMessage(err) });
  }
});

configRouter.post("/save-config", async (c) => {
  const supabase = c.get("supabase");
  try {
    const body: SaveConfigBody = await c.req.json();
    const valid = await validateToken(supabase, body.AuthorizationToken);
    if (!valid) return c.json({ Error: "Invalid Token" });

    const { error } = await supabase
      .from("linnworks_integration")
      .update({ config: body.ConfigItems, updatedAt: new Date().toISOString() })
      .eq("id", valid.id);

    if (error) {
      console.error("[ERROR] Failed to save Linnworks config:", error.message);
      return c.json({ Error: error.message });
    }

    return c.json({ Error: null, StepName: "UserConfig" });
  } catch (err) {
    return c.json({ Error: getErrorMessage(err) });
  }
});

configRouter.post("/test", async (c) => {
  const supabase = c.get("supabase");
  try {
    const body: ConfigTestBody = await c.req.json();
    const valid = await validateToken(supabase, body.AuthorizationToken);
    if (!valid) return c.json({ Error: "Invalid Token" });

    return c.json({ Error: null });
  } catch (err) {
    return c.json({ Error: getErrorMessage(err) });
  }
});

configRouter.post("/deleted", async (c) => {
  const supabase = c.get("supabase");
  try {
    const body: ConfigDeletedBody = await c.req.json();
    console.log(
      "[INFO] /linnworks/config/deleted called to deactivate integration",
    );

    const { error } = await supabase
      .from("linnworks_integration")
      .update({ isActive: false, updatedAt: new Date().toISOString() })
      .eq("authorizationToken", body.AuthorizationToken);

    if (error) {
      console.error(
        "[ERROR] Failed to mark integration as deleted:",
        error.message,
      );
      return c.json({ Error: error.message });
    }

    return c.json({ Error: null });
  } catch (err) {
    return c.json({ Error: getErrorMessage(err) });
  }
});

configRouter.post("/shipping-tags", async (c) => {
  const tags = couriersData.flatMap((courier) =>
    courier.services.map((service) => ({
      Tag: service.value,
      FriendlyName: `${courier.label} ${service.label}`,
    }))
  );

  return c.json({
    ShippingTags: tags,
  });
});

configRouter.post("/payment-tags", async (c) => {
  return c.json({
    PaymentTags: [{ Tag: "Default", FriendlyName: "Default Payment" }],
  });
});

export default configRouter;

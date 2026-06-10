import type { SupabaseClient } from "supabase";
import type { Database, Json } from "../database.types.ts";

type MovementType = Database["public"]["Enums"]["MovementType"];
type OrderChangeType = Database["public"]["Enums"]["OrderChangeType"];
type ActivityAction = Database["public"]["Enums"]["ActivityAction"];
type NotificationType = Database["public"]["Enums"]["NotificationType"];

export async function logProductMovement(
  supabase: SupabaseClient<Database>,
  params: {
    orgId: string;
    productId: string;
    userId?: string | null;
    systemSource?: string | null;
    movementType: MovementType;
    quantityChange: number;
    quantityBefore: number;
    quantityAfter: number;
    reason?: string | null;
    relatedOrderId?: string | null;
  },
) {
  const { error } = await supabase.from("product_movement").insert({
    id: crypto.randomUUID(),
    orgId: params.orgId,
    productId: params.productId,
    userId: params.userId || null,
    systemSource: params.systemSource || null,
    movementType: params.movementType,
    quantityChange: params.quantityChange,
    quantityBefore: params.quantityBefore,
    quantityAfter: params.quantityAfter,
    reason: params.reason || null,
    relatedOrderId: params.relatedOrderId || null,
  });

  if (error) {
    console.error("[ERROR] Failed to log product movement:", error.message);
  }
}

export async function logActivity(
  supabase: SupabaseClient<Database>,
  params: {
    orgId?: string | null;
    userId?: string | null;
    systemSource?: string | null;
    action: ActivityAction;
    entityType: string;
    entityId: string;
    description: string;
    changes?: Json | null;
  },
) {
  const { error } = await supabase.from("activity_log").insert({
    id: crypto.randomUUID(),
    orgId: params.orgId || null,
    userId: params.userId || null,
    systemSource: params.systemSource || null,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    description: params.description,
    changes: params.changes || null,
  });

  if (error) {
    console.error("[ERROR] Failed to log activity:", error.message);
  }
}

export async function logOrderChange(
  supabase: SupabaseClient<Database>,
  params: {
    orgId: string;
    orderId: string;
    userId?: string | null;
    systemSource?: string | null;
    changeType: OrderChangeType;
    previousValue?: Json | null;
    newValue?: Json | null;
    description: string;
  },
) {
  const { error } = await supabase.from("order_history").insert({
    id: crypto.randomUUID(),
    orgId: params.orgId,
    orderId: params.orderId,
    userId: params.userId || null,
    systemSource: params.systemSource || null,
    changeType: params.changeType,
    previousValue: params.previousValue || null,
    newValue: params.newValue || null,
    description: params.description,
  });

  if (error) {
    console.error("[ERROR] Failed to log order change:", error.message);
  }
}

export async function createNotification(
  supabase: SupabaseClient<Database>,
  params: {
    userId: string;
    orgId: string;
    systemSource?: string | null;
    type: NotificationType;
    title: string;
    message: string;
    linkUrl?: string | null;
    relatedEntityId?: string | null;
  },
) {
  const { error } = await supabase.from("notification").insert({
    id: crypto.randomUUID(),
    userId: params.userId,
    orgId: params.orgId,
    systemSource: params.systemSource || null,
    type: params.type,
    title: params.title,
    message: params.message,
    linkUrl: params.linkUrl || null,
    relatedEntityId: params.relatedEntityId || null,
    isRead: false,
  });

  if (error) {
    console.error("[ERROR] Failed to create notification:", error.message);
  }
}

import type { SupabaseClient } from "supabase";
import type { Database } from "../database.types.ts";

export async function validateToken(
  supabase: SupabaseClient<Database>,
  token: string | undefined,
): Promise<
  {
    id: string;
  } | null
> {
  if (!token) return null;

  const { data: integration, error } = await supabase
    .from("linnworks_integration")
    .select("id, isActive")
    .eq("authorizationToken", token)
    .maybeSingle();

  if (error || !integration || !integration.isActive) {
    return null;
  }

  return { id: integration.id };
}

export function formattedDate(
  input: Date | number | string | undefined,
  type?: "short" | "long" | "lw",
): string {
  if (!input) return "";
  const date =
    typeof input === "number" || typeof input === "string"
      ? new Date(input)
      : input;
  if (Number.isNaN(date.getTime())) return "";

  if (type === "lw") {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  }

  const day = String(date.getDate()).padStart(2, "0");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  if (type === "short") {
    return `${day} ${month} ${year}`;
  }

  let hours = date.getHours();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} ${String(hours).padStart(
    2,
    "0",
  )}:${minutes}${ampm}`;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

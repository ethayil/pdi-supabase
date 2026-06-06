import { formatDate } from "date-fns";

export function formattedDate(
  input: Date | number,
  type?: "short" | "long" | "lw",
) {
  const date = typeof input === "number" ? new Date(input) : input;

  if (type === "lw") return formatDate(date, "yyyy-MM-dd HH:mm:ss");

  if (!type || type === "long")
    return formatDate(date?.toString(), "dd-LLL-yyyy hh:mmaaa");

  return formatDate(date, "dd LLL yyyy");
}

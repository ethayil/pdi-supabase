import { formatDate } from "date-fns";

export function formattedDate(
  input: Date | number | string | null | undefined,
  type?: "short" | "long" | "lw",
) {
  if (input === null || input === undefined) return "";

  let date: Date;
  if (input instanceof Date) {
    date = input;
  } else if (typeof input === "number") {
    date = new Date(input);
  } else {
    date = new Date(input);
  }

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  try {
    if (type === "lw") return formatDate(date, "yyyy-MM-dd HH:mm:ss");

    if (!type || type === "long") {
      return formatDate(date, "dd-LLL-yyyy hh:mmaaa");
    }

    return formatDate(date, "dd LLL yyyy");
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

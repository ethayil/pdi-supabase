import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message);
  }
  if (typeof error === "string") return error;
  return "An unknown error occurred";
}

export function formatCurrency(amount: number | null | undefined): string {
  const num = typeof amount === "number" ? amount : amount ? Number(amount) : 0;
  const validNum = Number.isNaN(num) ? 0 : num;
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(validNum);
}

export function isUkCountry(country?: string | null): boolean {
  if (!country) return false;
  const c = country.trim().toUpperCase();
  return (
    c === "UK" ||
    c === "UNITED KINGDOM" ||
    c === "GB" ||
    c === "GREAT BRITAIN" ||
    c === "ENGLAND" ||
    c === "WALES" ||
    c === "SCOTLAND" ||
    c === "NORTHERN IRELAND"
  );
}


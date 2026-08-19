export function weightFormat(grams?: number | null): string {
  if (!grams || grams === 0) return "0g";
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)}Kg`;
  }
  return `${Math.round(grams)}g`;
}

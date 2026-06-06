export function weightFormat(grams: number): string {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)}Kg`;
  }
  return `${grams.toFixed(2)}g`;
}

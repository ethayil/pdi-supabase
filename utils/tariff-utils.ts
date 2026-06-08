import { countriesData } from "@/data/countries-data";
import { tariffExtraRates2026, tariffRates2026 } from "@/data/tariff-2026-data";

export function getCountryZone(countryName: string): number {
  const country = countriesData.find((c) => c.label === countryName);
  return country?.upsZone || 0;
}

export function calculateShippingCost(weightGm: number, zone: number): number {
  const weightKg = weightGm / 1000;
  // Return 0 for invalid inputs
  if (zone === 0 || zone > 10 || weightKg <= 0) {
    return 0;
  }

  let cost = 0;

  if (weightKg <= 50) {
    // Round up to nearest kg for weights up to 50kg
    const roundedWeight = Math.ceil(weightKg);

    // Find the tariff rate for this weight
    const rateRow = tariffRates2026.find((r) => r.weight >= roundedWeight);

    if (rateRow) {
      cost = rateRow.zones[zone - 1]; // zones array is 0-indexed
    }
  } else {
    // For weights above 50kg: base 50kg cost + (extra weight × per kg rate)
    const base50kgRow = tariffRates2026.find((r) => r.weight === 50);
    const baseCost = base50kgRow?.zones[zone - 1] || 0;

    const extraWeight = weightKg - 50;
    const extraRate = tariffExtraRates2026.find((r) => r.zone === zone);
    const extraCost = extraWeight * (extraRate?.pricePerKg || 0);

    cost = baseCost + extraCost;
  }

  // Round to 2 decimal places
  return Number(cost.toFixed(2));
}

export function getZoneName(countryName: string): string | null {
  const country = countriesData.find((c) => c.label === countryName);
  if (!country) return null;
  return country.upsZone > 0 ? `Zone ${country.upsZone}` : null;
}

export function getTariffRate(weightKg: number, zone: number): number | null {
  if (zone === 0 || zone > 10 || weightKg <= 0) {
    return null;
  }

  const roundedWeight = Math.ceil(weightKg);

  if (roundedWeight <= 50) {
    const rateRow = tariffRates2026.find((r) => r.weight >= roundedWeight);
    return rateRow?.zones[zone - 1] ?? null;
  }

  return null; // For weights above 50kg, use calculateShippingCost
}

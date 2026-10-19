// Shared (client + server) pricing options. All prices are in new Mauritanian ouguiya (MRU).
export const BATTERY_OPTIONS = [
  { id: "standard", delta: 0 },
  { id: "new", delta: 1400 },
] as const;

export const PLAN_OPTIONS = [{ id: "none" }, { id: "shield" }] as const;

export type BatteryId = (typeof BATTERY_OPTIONS)[number]["id"];
export type PlanId = (typeof PLAN_OPTIONS)[number]["id"];

export const CATEGORIES = [
  { slug: "iphones", kind: "phone", color: "#1f2937" },
  { slug: "samsung", kind: "phone", color: "#2563eb" },
  { slug: "laptops", kind: "laptop", color: "#64748b" },
  { slug: "tablets", kind: "tablet", color: "#6d28d9" },
  { slug: "watches", kind: "watch", color: "#f97316" },
  { slug: "audio", kind: "earbuds", color: "#7c3aed" },
  { slug: "accessories", kind: "charger", color: "#e11d48" },
] as const;

export const FREE_SHIPPING_OVER = 5000;
export const SHIPPING_FEE = 250;

/** Seed catalogue was authored in SAR; converted to MRU (rounded to 10) when seeding. */
export const SAR_TO_MRU = 10.7;
export const toMru = (sar: number) => Math.round((sar * SAR_TO_MRU) / 10) * 10;

export function shieldPrice(base: number) {
  return Math.round((base * 0.08) / 10) * 10;
}

export function optionPrice(base: number, battery: BatteryId, plan: PlanId, supportsBattery: boolean) {
  const b = supportsBattery ? (BATTERY_OPTIONS.find((o) => o.id === battery)?.delta ?? 0) : 0;
  const p = plan === "shield" ? shieldPrice(base) : 0;
  return base + b + p;
}

export const CURRENCIES = [
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "UZS", label: "Uzbek Som" },
  { code: "VND", label: "Vietnamese Dong" },
  { code: "INR", label: "Indian Rupee" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

const fmtCache = new Map<string, Intl.NumberFormat>();

export function formatMoney(value: number, currency: string, compact = false) {
  const key = `${currency}-${compact}`;
  let f = fmtCache.get(key);
  if (!f) {
    const noDecimals = currency === "UZS" || currency === "VND";
    f = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: compact ? 1 : noDecimals ? 0 : 2,
      minimumFractionDigits: compact || noDecimals ? 0 : 2,
    });
    fmtCache.set(key, f);
  }
  return f.format(value);
}

/** Local date as YYYY-MM-DD (avoids UTC shifts from toISOString). */
export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(s: string) {
  return parseISODate(s).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function monthKey(s: string) {
  return s.slice(0, 7);
}

export function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short" });
}

export function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

import { monthKey, monthLabel, toISODate } from "./format";
import type { Category, Transaction } from "./types";

export type RangePreset = "this-month" | "last-month" | "last-3" | "last-6" | "this-year" | "all" | "custom";

export const RANGE_LABELS: Record<RangePreset, string> = {
  "this-month": "This month",
  "last-month": "Last month",
  "last-3": "Last 3 months",
  "last-6": "Last 6 months",
  "this-year": "This year",
  all: "All time",
  custom: "Custom range",
};

/** Inclusive [from, to] as YYYY-MM-DD; empty string = unbounded. */
export function presetRange(p: RangePreset, now: Date): [string, string] {
  const y = now.getFullYear();
  const m = now.getMonth();
  const end = toISODate(now);
  switch (p) {
    case "this-month":
      return [toISODate(new Date(y, m, 1)), end];
    case "last-month":
      return [toISODate(new Date(y, m - 1, 1)), toISODate(new Date(y, m, 0))];
    case "last-3":
      return [toISODate(new Date(y, m - 2, 1)), end];
    case "last-6":
      return [toISODate(new Date(y, m - 5, 1)), end];
    case "this-year":
      return [toISODate(new Date(y, 0, 1)), end];
    default:
      return ["", ""];
  }
}

export function inRange(t: Transaction, from: string, to: string) {
  return (!from || t.date >= from) && (!to || t.date <= to);
}

export function totals(list: Transaction[]) {
  let income = 0;
  let expense = 0;
  for (const t of list) {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, net: income - expense };
}

/** Income vs expenses for the last `count` calendar months (including the current one). */
export function monthlySeries(list: Transaction[], count: number, now: Date) {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) keys.push(toISODate(new Date(now.getFullYear(), now.getMonth() - i, 1)).slice(0, 7));
  const map = new Map(keys.map((k) => [k, { income: 0, expense: 0 }]));
  for (const t of list) {
    const bucket = map.get(monthKey(t.date));
    if (bucket) bucket[t.type] += t.amount;
  }
  return keys.map((k) => ({ key: k, month: monthLabel(k), ...map.get(k)! }));
}

export function byCategory(list: Transaction[], cats: Map<string, Category>, type: "income" | "expense") {
  const sums = new Map<string, number>();
  for (const t of list) {
    if (t.type !== type) continue;
    const k = t.categoryId ?? "none";
    sums.set(k, (sums.get(k) ?? 0) + t.amount);
  }
  return [...sums.entries()]
    .map(([id, value]) => {
      const c = cats.get(id);
      return { id, name: c?.name ?? "Uncategorized", color: c?.color ?? "#94a3b8", value };
    })
    .sort((a, b) => b.value - a.value);
}

/**
 * Comparable earlier period: "this month" compares month-to-date with the same days of
 * last month; "last month" compares with the month before. Other presets have no baseline.
 */
export function comparisonRange(p: RangePreset, now: Date): [string, string] | null {
  const y = now.getFullYear();
  const m = now.getMonth();
  if (p === "this-month") {
    const lastDayPrev = new Date(y, m, 0).getDate();
    return [toISODate(new Date(y, m - 1, 1)), toISODate(new Date(y, m - 1, Math.min(now.getDate(), lastDayPrev)))];
  }
  if (p === "last-month") return [toISODate(new Date(y, m - 2, 1)), toISODate(new Date(y, m - 1, 0))];
  return null;
}

export const COMPARISON_LABEL: Partial<Record<RangePreset, string>> = {
  "this-month": "vs same days last month",
  "last-month": "vs the month before",
};

export function pctChange(curr: number, prev: number) {
  if (prev === 0) return null;
  return ((curr - prev) / prev) * 100;
}

import { toISODate } from "./format";
import type { NewCategory, NewTransaction } from "./types";

export const DEFAULT_CATEGORIES: NewCategory[] = [
  { name: "Salary", type: "income", color: "#0f9f6e" },
  { name: "Freelance", type: "income", color: "#14b8a6" },
  { name: "Investments", type: "income", color: "#3b82f6" },
  { name: "Rent", type: "expense", color: "#e1475a" },
  { name: "Food", type: "expense", color: "#f59e0b" },
  { name: "Utilities", type: "expense", color: "#8b5cf6" },
  { name: "Transport", type: "expense", color: "#06b6d4" },
  { name: "Shopping", type: "expense", color: "#ec4899" },
  { name: "Health", type: "expense", color: "#22c55e" },
  { name: "Entertainment", type: "expense", color: "#f97316" },
];

export const SWATCHES = [
  "#0f9f6e", "#14b8a6", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
  "#e1475a", "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#06b6d4", "#64748b",
];

// Deterministic pseudo-random so the demo looks the same on every visit.
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

/** Six months of realistic transactions for the demo account. */
export function demoTransactions(catIds: Record<string, string>): NewTransaction[] {
  const r = rng(42);
  const out: NewTransaction[] = [];
  const today = new Date();
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const amt = (min: number, max: number) => Math.round((min + r() * (max - min)) * 100) / 100;

  for (let back = 5; back >= 0; back--) {
    const y = today.getFullYear();
    const m = today.getMonth() - back;
    const lastDay = back === 0 ? today.getDate() : new Date(y, m + 1, 0).getDate();
    const day = (d: number) => toISODate(new Date(y, m, Math.min(d, lastDay)));
    const push = (cat: string, type: "income" | "expense", amount: number, d: number, note: string) => {
      if (d > lastDay) return;
      out.push({ type, amount, date: day(d), categoryId: catIds[cat] ?? null, note });
    };

    push("Salary", "income", 3200, 1, "Monthly salary");
    push("Rent", "expense", 1150, 2, "Apartment rent");
    push("Utilities", "expense", amt(85, 140), 6, "Electricity & internet");
    if (r() > 0.25) push("Freelance", "income", amt(250, 900), 8 + Math.floor(r() * 12), pick(["Landing page project", "Bug-fix contract", "Logo redesign", "Website maintenance"]));
    if (r() > 0.6) push("Investments", "income", amt(40, 160), 20, "Dividends");

    const foodCount = 7 + Math.floor(r() * 4);
    for (let i = 0; i < foodCount; i++)
      push("Food", "expense", amt(9, 75), 1 + Math.floor(r() * 28), pick(["Groceries", "Lunch", "Coffee", "Dinner out", "Bakery"]));
    for (let i = 0; i < 4; i++)
      push("Transport", "expense", amt(6, 45), 1 + Math.floor(r() * 28), pick(["Taxi", "Fuel", "Metro card", "Parking"]));
    for (let i = 0; i < 2; i++)
      push("Shopping", "expense", amt(20, 180), 1 + Math.floor(r() * 28), pick(["Clothes", "Headphones", "Home supplies", "Books"]));
    if (r() > 0.4) push("Health", "expense", amt(15, 90), 1 + Math.floor(r() * 28), pick(["Pharmacy", "Gym membership", "Dentist"]));
    push("Entertainment", "expense", amt(12, 60), 1 + Math.floor(r() * 28), pick(["Cinema", "Streaming subscription", "Concert", "Games"]));
  }
  return out;
}

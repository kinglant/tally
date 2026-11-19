import type { Category, Transaction } from "./types";

const esc = (v: string | number) => {
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function transactionsToCsv(list: Transaction[], cats: Map<string, Category>) {
  const header = ["Date", "Type", "Category", "Amount", "Note"];
  const rows = list.map((t) => [
    t.date,
    t.type === "income" ? "Income" : "Expense",
    (t.categoryId && cats.get(t.categoryId)?.name) || "Uncategorized",
    (t.type === "expense" ? -t.amount : t.amount).toFixed(2),
    t.note,
  ]);
  return [header, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
}

/** Downloads a CSV file. A UTF-8 BOM is added so Excel opens non-ASCII text correctly. */
export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

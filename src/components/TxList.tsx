"use client";

import { useData } from "@/lib/data";
import { formatDate, formatMoney } from "@/lib/format";
import type { Transaction } from "@/lib/types";

export function TxList({ items, onSelect }: { items: Transaction[]; onSelect(t: Transaction): void }) {
  const { categoryById, currency } = useData();
  return (
    <ul className="divide-y divide-border">
      {items.map((t) => {
        const cat = t.categoryId ? categoryById.get(t.categoryId) : undefined;
        return (
          <li key={t.id}>
            <button onClick={() => onSelect(t)} className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-bg-soft sm:px-5">
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                style={{ background: cat?.color ?? "#94a3b8" }}
                aria-hidden
              >
                {(cat?.name ?? "?")[0]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{t.note || cat?.name || "Transaction"}</span>
                <span className="block truncate text-xs text-muted">
                  {cat?.name ?? "Uncategorized"} · {formatDate(t.date)}
                </span>
              </span>
              <span className={`tabular shrink-0 text-sm font-semibold ${t.type === "income" ? "text-income" : "text-fg"}`}>
                {t.type === "income" ? "+" : "−"}
                {formatMoney(t.amount, currency)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

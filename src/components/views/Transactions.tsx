"use client";

import { Download, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { TransactionModal } from "@/components/TransactionModal";
import { TxList } from "@/components/TxList";
import { downloadCsv, transactionsToCsv } from "@/lib/csv";
import { useData } from "@/lib/data";
import { formatMoney, toISODate } from "@/lib/format";
import { inRange, presetRange, RANGE_LABELS, totals, type RangePreset } from "@/lib/stats";
import type { Transaction } from "@/lib/types";

const PAGE = 40;

export function Transactions() {
  const { transactions, categories, categoryById, currency, today } = useData();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "income" | "expense">("all");
  const [categoryId, setCategoryId] = useState("all");
  const [preset, setPreset] = useState<RangePreset>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [rangeFrom, rangeTo] = preset === "custom" ? [from, to] : today ? presetRange(preset, today) : ["", ""];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((t) => {
      if (type !== "all" && t.type !== type) return false;
      if (categoryId !== "all" && (t.categoryId ?? "none") !== categoryId) return false;
      if (!inRange(t, rangeFrom, rangeTo)) return false;
      if (q) {
        const cat = t.categoryId ? categoryById.get(t.categoryId)?.name ?? "" : "uncategorized";
        if (!`${t.note} ${cat} ${t.amount}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [transactions, categoryById, query, type, categoryId, rangeFrom, rangeTo]);

  const sums = totals(filtered);
  const activeFilters = [type !== "all", categoryId !== "all", preset !== "all"].filter(Boolean).length;

  const clear = () => {
    setQuery("");
    setType("all");
    setCategoryId("all");
    setPreset("all");
    setFrom("");
    setTo("");
    setShown(PAGE);
  };

  const exportCsv = () => downloadCsv(`tally-transactions-${toISODate(new Date())}.csv`, transactionsToCsv(filtered, categoryById));

  const sortedCats = [...categories].sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted">
            {filtered.length} of {transactions.length} transactions
          </p>
        </div>
        <button onClick={exportCsv} className="btn btn-ghost" disabled={filtered.length === 0}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="card flex flex-col gap-3 p-4">
        <div className="flex gap-2">
          <label className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="field pl-9"
              placeholder="Search notes, categories or amounts"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShown(PAGE);
              }}
            />
          </label>
          <button onClick={() => setFiltersOpen((o) => !o)} className="btn btn-ghost md:hidden" aria-expanded={filtersOpen}>
            <SlidersHorizontal size={16} />
            {activeFilters > 0 && <span className="rounded-full bg-accent px-1.5 text-xs text-accent-fg">{activeFilters}</span>}
          </button>
        </div>

        <div className={`${filtersOpen ? "grid" : "hidden"} gap-2 sm:grid-cols-2 md:grid md:grid-cols-4`}>
          <select className="field" value={type} onChange={(e) => setType(e.target.value as typeof type)} aria-label="Type">
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>
          <select className="field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} aria-label="Category">
            <option value="all">All categories</option>
            {sortedCats
              .filter((c) => type === "all" || c.type === type)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            <option value="none">Uncategorized</option>
          </select>
          <select className="field" value={preset} onChange={(e) => setPreset(e.target.value as RangePreset)} aria-label="Date range">
            {(Object.keys(RANGE_LABELS) as RangePreset[]).map((p) => (
              <option key={p} value={p}>
                {RANGE_LABELS[p]}
              </option>
            ))}
          </select>
          {activeFilters > 0 || query ? (
            <button onClick={clear} className="btn btn-ghost">
              <X size={16} /> Clear filters
            </button>
          ) : (
            <span className="hidden md:block" />
          )}
          {preset === "custom" && (
            <div className="grid grid-cols-2 gap-2 sm:col-span-2">
              <label className="text-xs text-muted">
                From
                <input className="field mt-1" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label className="text-xs text-muted">
                To
                <input className="field mt-1" type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Summary label="Income" value={sums.income} currency={currency} className="text-income" />
        <Summary label="Expenses" value={sums.expense} currency={currency} className="text-expense" />
        <Summary label="Net" value={sums.net} currency={currency} className={sums.net >= 0 ? "text-fg" : "text-expense"} />
      </div>

      <section className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-muted">
            No transactions match these filters.
            {(activeFilters > 0 || query) && (
              <button onClick={clear} className="ml-1 font-medium text-accent hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <TxList items={filtered.slice(0, shown)} onSelect={setEditing} />
            {shown < filtered.length && (
              <div className="border-t border-border p-3 text-center">
                <button onClick={() => setShown((s) => s + PAGE)} className="btn btn-ghost">
                  Show more ({filtered.length - shown} left)
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <TransactionModal open={!!editing} editing={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

function Summary({ label, value, currency, className }: { label: string; value: number; currency: string; className: string }) {
  return (
    <div className="card px-3 py-3 sm:px-4">
      <p className="text-xs text-muted">{label}</p>
      <p className={`tabular truncate text-sm font-semibold sm:text-lg ${className}`} title={formatMoney(value, currency)}>
        <span className="sm:hidden">{formatMoney(value, currency, true)}</span>
        <span className="hidden sm:inline">{formatMoney(value, currency)}</span>
      </p>
    </div>
  );
}

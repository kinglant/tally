"use client";

import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CategoryDonut, MonthlyChart } from "@/components/charts";
import { TransactionModal } from "@/components/TransactionModal";
import { TxList } from "@/components/TxList";
import { useData } from "@/lib/data";
import { formatMoney } from "@/lib/format";
import {
  byCategory,
  COMPARISON_LABEL,
  comparisonRange,
  inRange,
  monthlySeries,
  pctChange,
  presetRange,
  RANGE_LABELS,
  totals,
  type RangePreset,
} from "@/lib/stats";
import type { Transaction } from "@/lib/types";

const PERIODS: RangePreset[] = ["this-month", "last-month", "last-3", "last-6", "this-year", "all"];

export function Dashboard() {
  const { transactions, categoryById, currency, today } = useData();
  const [period, setPeriod] = useState<RangePreset>("this-month");
  const [editing, setEditing] = useState<Transaction | null>(null);

  const view = useMemo(() => {
    if (!today) return null;
    const [from, to] = presetRange(period, today);
    const current = transactions.filter((t) => inRange(t, from, to));
    const prevRange = comparisonRange(period, today);
    const prev = prevRange ? totals(transactions.filter((t) => inRange(t, prevRange[0], prevRange[1]))) : null;
    return {
      sums: totals(current),
      prev,
      balance: totals(transactions).net,
      monthly: monthlySeries(transactions, 6, today),
      spending: byCategory(current, categoryById, "expense"),
    };
  }, [transactions, categoryById, period, today]);

  if (!view) return null;
  const spendTotal = view.spending.reduce((s, d) => s + d.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-sm text-muted">Where your money came from and where it went.</p>
        </div>
        <select className="field w-auto min-w-40" value={period} onChange={(e) => setPeriod(e.target.value as RangePreset)} aria-label="Period">
          {PERIODS.map((p) => (
            <option key={p} value={p}>
              {RANGE_LABELS[p]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <Stat
          className="col-span-2 sm:col-span-1"
          label="Current balance" value={formatMoney(view.balance, currency)}
          hint="All time"
          icon={<Wallet size={18} />}
          tone="accent"
        />
        <Stat
          label="Income"
          value={formatMoney(view.sums.income, currency)}
          icon={<ArrowUpRight size={18} />}
          tone="income"
          change={view.prev ? pctChange(view.sums.income, view.prev.income) : null}
          changeLabel={COMPARISON_LABEL[period]}
          goodWhenUp
        />
        <Stat
          label="Expenses"
          value={formatMoney(view.sums.expense, currency)}
          icon={<ArrowDownRight size={18} />}
          tone="expense"
          change={view.prev ? pctChange(view.sums.expense, view.prev.expense) : null}
          changeLabel={COMPARISON_LABEL[period]}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="card p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Income vs expenses</h2>
            <div className="flex gap-3 text-xs text-muted">
              <Legend color="bg-income" label="Income" />
              <Legend color="bg-expense" label="Expenses" />
            </div>
          </div>
          <MonthlyChart data={view.monthly} currency={currency} />
        </section>

        <section className="card p-5 lg:col-span-2">
          <h2 className="font-semibold">Spending by category</h2>
          <p className="text-xs text-muted">{RANGE_LABELS[period]}</p>
          {view.spending.length === 0 ? (
            <p className="grid h-56 place-items-center text-sm text-muted">No expenses in this period.</p>
          ) : (
            <>
              <CategoryDonut data={view.spending} currency={currency} />
              <ul className="mt-2 space-y-2">
                {view.spending.slice(0, 5).map((d) => (
                  <li key={d.id} className="flex items-center gap-2 text-sm">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
                    <span className="flex-1 truncate">{d.name}</span>
                    <span className="text-xs text-muted">{Math.round((d.value / spendTotal) * 100)}%</span>
                    <span className="tabular w-24 text-right font-medium">{formatMoney(d.value, currency)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <h2 className="font-semibold">Recent transactions</h2>
          <Link href="/app/transactions" className="text-sm font-medium text-accent hover:underline">
            View all
          </Link>
        </div>
        {transactions.length === 0 ? (
          <p className="px-5 pb-6 pt-2 text-sm text-muted">No transactions yet. Add your first one with the + button.</p>
        ) : (
          <TxList items={transactions.slice(0, 6)} onSelect={setEditing} />
        )}
      </section>

      <TransactionModal open={!!editing} editing={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-sm ${color}`} /> {label}
    </span>
  );
}

const TONES = {
  accent: "bg-accent-soft text-accent",
  income: "bg-income-soft text-income",
  expense: "bg-expense-soft text-expense",
};

function Stat({
  label,
  value,
  icon,
  tone,
  hint,
  change,
  changeLabel,
  goodWhenUp = false,
  className = "",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: keyof typeof TONES;
  hint?: string;
  change?: number | null;
  changeLabel?: string;
  goodWhenUp?: boolean;
  className?: string;
}) {
  const good = change != null && (goodWhenUp ? change >= 0 : change <= 0);
  return (
    <div className={`card p-4 sm:p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{label}</span>
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${TONES[tone]}`}>{icon}</span>
      </div>
      <p className="tabular mt-3 truncate text-lg font-semibold tracking-tight sm:text-2xl">{value}</p>
      <p className="mt-1 text-xs text-muted">
        {change != null ? (
          <>
            <span className={good ? "text-income" : "text-expense"}>
              {change >= 0 ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
            </span>{" "}
            {changeLabel}
          </>
        ) : (
          (hint ?? " ")
        )}
      </p>
    </div>
  );
}

"use client";

import { Download, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { downloadCsv, transactionsToCsv } from "@/lib/csv";
import { useData } from "@/lib/data";
import { CURRENCIES, toISODate } from "@/lib/format";

export function Settings() {
  const { user } = useAuth();
  const { currency, setCurrency, transactions, categoryById, resetDemo } = useData();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  const reset = async () => {
    setResetting(true);
    await resetDemo();
    setResetting(false);
    setConfirmReset(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted">{user?.demo ? "Demo account" : user?.email}</p>
      </div>

      <section className="card divide-y divide-border">
        <Row title="Currency" text="Used to display all amounts. Amounts themselves are not converted.">
          <select className="field w-auto min-w-44" value={currency} onChange={(e) => setCurrency(e.target.value)} aria-label="Currency">
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} · {c.label}
              </option>
            ))}
          </select>
        </Row>
        <Row title="Export data" text={`Download all ${transactions.length} transactions as a CSV file (opens in Excel or Google Sheets).`}>
          <button
            className="btn btn-ghost"
            onClick={() => downloadCsv(`tally-all-${toISODate(new Date())}.csv`, transactionsToCsv(transactions, categoryById))}
          >
            <Download size={16} /> Export
          </button>
        </Row>
        {user?.demo && (
          <Row title="Reset demo" text="Replace your changes with fresh sample data.">
            {confirmReset ? (
              <button className="btn btn-danger" onClick={reset} disabled={resetting}>
                {resetting ? "Resetting…" : "Confirm reset"}
              </button>
            ) : (
              <button className="btn btn-ghost" onClick={() => setConfirmReset(true)}>
                <RotateCcw size={16} /> Reset
              </button>
            )}
          </Row>
        )}
      </section>
    </div>
  );
}

function Row({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted">{text}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

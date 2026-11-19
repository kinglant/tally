"use client";

import { useState } from "react";
import { useData } from "@/lib/data";
import { toISODate } from "@/lib/format";
import type { Transaction, TxType } from "@/lib/types";
import { Modal } from "./Modal";

interface Props {
  open: boolean;
  onClose(): void;
  /** Transaction to edit; omit to create a new one. */
  editing?: Transaction | null;
}

export function TransactionModal({ open, onClose, editing }: Props) {
  // Remount the form for each open so its fields start from the right values.
  return (
    <Modal open={open} title={editing ? "Edit transaction" : "New transaction"} onClose={onClose}>
      {open && <TxForm key={editing?.id ?? "new"} editing={editing ?? null} onDone={onClose} />}
    </Modal>
  );
}

function TxForm({ editing, onDone }: { editing: Transaction | null; onDone(): void }) {
  const { categories, addTransaction, updateTransaction, deleteTransaction } = useData();
  const [type, setType] = useState<TxType>(editing?.type ?? "expense");
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "");
  const [date, setDate] = useState(editing?.date ?? toISODate(new Date()));
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? "");
  const [note, setNote] = useState(editing?.note ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const options = categories.filter((c) => c.type === type).sort((a, b) => a.name.localeCompare(b.name));

  const switchType = (t: TxType) => {
    setType(t);
    if (categoryId && !categories.some((c) => c.id === categoryId && c.type === t)) setCategoryId("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) return setError("Enter an amount greater than 0.");
    if (!date) return setError("Choose a date.");
    setBusy(true);
    setError(null);
    const payload = {
      type,
      amount: Math.round(value * 100) / 100,
      date,
      categoryId: categoryId || null,
      note: note.trim().slice(0, 200),
    };
    try {
      if (editing) await updateTransaction(editing.id, payload);
      else await addTransaction(payload);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!editing) return;
    setBusy(true);
    try {
      await deleteTransaction(editing.id);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-bg-soft p-1" role="radiogroup" aria-label="Type">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={type === t}
            onClick={() => switchType(t)}
            className={`h-9 rounded-lg text-sm font-medium capitalize transition ${
              type === t
                ? t === "income"
                  ? "bg-panel text-income shadow-sm"
                  : "bg-panel text-expense shadow-sm"
                : "text-muted hover:text-fg"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Amount</span>
          <input
            className="field tabular"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
            required
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Date</span>
          <input className="field" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">Category</span>
        <select className="field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Uncategorized</option>
          {options.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">Note</span>
        <input
          className="field"
          placeholder="e.g. Groceries at the market"
          maxLength={200}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      {error && <p className="rounded-lg bg-expense-soft px-3 py-2 text-sm text-expense">{error}</p>}

      <div className="flex items-center gap-2 pt-1">
        {editing &&
          (confirmDelete ? (
            <button type="button" className="btn btn-danger" onClick={remove} disabled={busy}>
              Confirm delete
            </button>
          ) : (
            <button type="button" className="btn btn-ghost text-expense" onClick={() => setConfirmDelete(true)} disabled={busy}>
              Delete
            </button>
          ))}
        <div className="flex-1" />
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Saving…" : editing ? "Save changes" : "Add transaction"}
        </button>
      </div>
    </form>
  );
}

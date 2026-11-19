"use client";

import { Pencil, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Modal } from "@/components/Modal";
import { useData } from "@/lib/data";
import { formatMoney } from "@/lib/format";
import { SWATCHES } from "@/lib/seed";
import type { Category, TxType } from "@/lib/types";

export function Categories() {
  const { categories, transactions, currency } = useData();
  const [editing, setEditing] = useState<Category | null>(null);
  const [creating, setCreating] = useState<TxType | null>(null);

  const usage = useMemo(() => {
    const m = new Map<string, { count: number; total: number }>();
    for (const t of transactions) {
      if (!t.categoryId) continue;
      const u = m.get(t.categoryId) ?? { count: 0, total: 0 };
      u.count++;
      u.total += t.amount;
      m.set(t.categoryId, u);
    }
    return m;
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="text-sm text-muted">Group transactions your way. Deleting a category keeps its transactions as uncategorized.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {(["income", "expense"] as const).map((type) => {
          const list = categories.filter((c) => c.type === type).sort((a, b) => a.name.localeCompare(b.name));
          return (
            <section key={type} className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="font-semibold">{type === "income" ? "Income" : "Expense"} categories</h2>
                <button onClick={() => setCreating(type)} className="btn btn-ghost h-8 px-3 text-xs">
                  <Plus size={14} /> New
                </button>
              </div>
              {list.length === 0 ? (
                <p className="px-5 py-6 text-sm text-muted">No categories yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {list.map((c) => {
                    const u = usage.get(c.id);
                    return (
                      <li key={c.id} className="flex items-center gap-3 px-5 py-3">
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: c.color }} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{c.name}</span>
                          <span className="block text-xs text-muted">
                            {u ? `${u.count} ${u.count === 1 ? "transaction" : "transactions"} · ${formatMoney(u.total, currency)}` : "Not used yet"}
                          </span>
                        </span>
                        <button onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`} className="rounded-lg p-2 text-muted hover:bg-bg-soft hover:text-fg">
                          <Pencil size={16} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <Modal
        open={!!editing || !!creating}
        title={editing ? "Edit category" : "New category"}
        onClose={() => {
          setEditing(null);
          setCreating(null);
        }}
      >
        {(editing || creating) && (
          <CategoryForm
            key={editing?.id ?? creating}
            editing={editing}
            defaultType={creating ?? "expense"}
            onDone={() => {
              setEditing(null);
              setCreating(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function CategoryForm({ editing, defaultType, onDone }: { editing: Category | null; defaultType: TxType; onDone(): void }) {
  const { categories, addCategory, updateCategory, deleteCategory } = useData();
  const [name, setName] = useState(editing?.name ?? "");
  const [type, setType] = useState<TxType>(editing?.type ?? defaultType);
  const [color, setColor] = useState(editing?.color ?? SWATCHES[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim();
    if (!n) return setError("Give the category a name.");
    if (categories.some((c) => c.id !== editing?.id && c.type === type && c.name.toLowerCase() === n.toLowerCase()))
      return setError("A category with this name already exists.");
    setBusy(true);
    try {
      if (editing) await updateCategory(editing.id, { name: n, type, color });
      else await addCategory({ name: n, type, color });
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
      await deleteCategory(editing.id);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">Name</span>
        <input className="field" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="e.g. Groceries" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-muted">Type</span>
        <select className="field" value={type} onChange={(e) => setType(e.target.value as TxType)} disabled={!!editing}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </label>
      <fieldset>
        <legend className="mb-1.5 text-xs font-medium text-muted">Color</legend>
        <div className="flex flex-wrap gap-2">
          {SWATCHES.map((s) => (
            <button
              key={s}
              type="button"
              aria-label={`Color ${s}`}
              aria-pressed={color === s}
              onClick={() => setColor(s)}
              className={`h-8 w-8 rounded-full ring-offset-2 ring-offset-panel transition ${color === s ? "ring-2 ring-fg" : ""}`}
              style={{ background: s }}
            />
          ))}
        </div>
      </fieldset>

      {error && <p className="rounded-lg bg-expense-soft px-3 py-2 text-sm text-expense">{error}</p>}

      <div className="flex items-center gap-2 pt-1">
        {editing &&
          (confirmDelete ? (
            <button type="button" className="btn btn-danger" onClick={remove} disabled={busy}>
              Confirm delete
            </button>
          ) : (
            <button type="button" className="btn btn-ghost text-expense" onClick={() => setConfirmDelete(true)}>
              Delete
            </button>
          ))}
        <div className="flex-1" />
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Saving…" : editing ? "Save" : "Create category"}
        </button>
      </div>
    </form>
  );
}

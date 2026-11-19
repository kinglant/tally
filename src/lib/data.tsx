"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./auth";
import { DEFAULT_CATEGORIES, demoTransactions } from "./seed";
import { LocalStore } from "./store/local";
import { SupabaseStore } from "./store/supabase";
import { getSupabase } from "./supabase";
import type { Category, DataStore, NewCategory, NewTransaction, Transaction } from "./types";

interface DataState {
  loading: boolean;
  error: string | null;
  categories: Category[];
  transactions: Transaction[];
  currency: string;
  /** Current time, set after mount (null during prerender) so date math never runs at build time. */
  today: Date | null;
  setCurrency(c: string): void;
  categoryById: Map<string, Category>;
  addTransaction(t: NewTransaction): Promise<void>;
  updateTransaction(id: string, t: Partial<NewTransaction>): Promise<void>;
  deleteTransaction(id: string): Promise<void>;
  addCategory(c: NewCategory): Promise<Category>;
  updateCategory(id: string, c: Partial<NewCategory>): Promise<void>;
  deleteCategory(id: string): Promise<void>;
  resetDemo(): Promise<void>;
}

const DataContext = createContext<DataState | null>(null);

const byDateDesc = (a: Transaction, b: Transaction) =>
  b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);

async function seed(store: DataStore, withDemoData: boolean) {
  const cats = await Promise.all(DEFAULT_CATEGORIES.map((c) => store.createCategory(c)));
  if (withDemoData) {
    const ids = Object.fromEntries(cats.map((c) => [c.name, c.id]));
    await store.createTransactions(demoTransactions(ids));
  }
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrencyState] = useState("USD");
  const [today, setToday] = useState<Date | null>(null);
  const storeRef = useRef<DataStore | null>(null);

  const load = useCallback(async (store: DataStore, isDemo: boolean) => {
    setLoading(true);
    setError(null);
    try {
      let cats = await store.listCategories();
      if (cats.length === 0) {
        await seed(store, isDemo);
        cats = await store.listCategories();
      }
      const txs = await store.listTransactions();
      setCategories(cats);
      setTransactions([...txs].sort(byDateDesc));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load your data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Wall-clock time is only meaningful in the browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(new Date());
  }, []);

  useEffect(() => {
    if (!user) {
      storeRef.current = null;
      return;
    }
    const store = user.demo ? new LocalStore("tally-demo-data") : new SupabaseStore(getSupabase());
    storeRef.current = store;
    try {
      const saved = localStorage.getItem(`tally-currency-${user.id}`);
      // Per-browser preference, only readable after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrencyState(saved || "USD");
    } catch {}
    void load(store, user.demo);
  }, [user, load]);

  const store = () => {
    if (!storeRef.current) throw new Error("Not signed in");
    return storeRef.current;
  };

  const setCurrency = useCallback(
    (c: string) => {
      setCurrencyState(c);
      try {
        if (user) localStorage.setItem(`tally-currency-${user.id}`, c);
      } catch {}
    },
    [user],
  );

  const value = useMemo<DataState>(
    () => ({
      loading,
      error,
      categories,
      transactions,
      currency,
      today,
      setCurrency,
      categoryById: new Map(categories.map((c) => [c.id, c])),
      async addTransaction(t) {
        const created = await store().createTransaction(t);
        setTransactions((prev) => [created, ...prev].sort(byDateDesc));
      },
      async updateTransaction(id, t) {
        const updated = await store().updateTransaction(id, t);
        setTransactions((prev) => prev.map((x) => (x.id === id ? updated : x)).sort(byDateDesc));
      },
      async deleteTransaction(id) {
        await store().deleteTransaction(id);
        setTransactions((prev) => prev.filter((x) => x.id !== id));
      },
      async addCategory(c) {
        const created = await store().createCategory(c);
        setCategories((prev) => [...prev, created]);
        return created;
      },
      async updateCategory(id, c) {
        const updated = await store().updateCategory(id, c);
        setCategories((prev) => prev.map((x) => (x.id === id ? updated : x)));
      },
      async deleteCategory(id) {
        await store().deleteCategory(id);
        setCategories((prev) => prev.filter((x) => x.id !== id));
        setTransactions((prev) => prev.map((t) => (t.categoryId === id ? { ...t, categoryId: null } : t)));
      },
      async resetDemo() {
        const s = store();
        if (s instanceof LocalStore) {
          s.reset();
          await load(s, true);
        }
      },
    }),
    [loading, error, categories, transactions, currency, today, setCurrency, load],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}

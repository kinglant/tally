import { uid } from "../format";
import type { Category, DataStore, NewCategory, NewTransaction, Transaction } from "../types";

interface Snapshot {
  categories: Category[];
  transactions: Transaction[];
}

/** Browser-only store used for the demo account. Data lives in localStorage. */
export class LocalStore implements DataStore {
  constructor(private key: string) {}

  private read(): Snapshot {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) return JSON.parse(raw) as Snapshot;
    } catch {}
    return { categories: [], transactions: [] };
  }

  private write(s: Snapshot) {
    try {
      localStorage.setItem(this.key, JSON.stringify(s));
    } catch {}
  }

  private mutate<T>(fn: (s: Snapshot) => T): T {
    const s = this.read();
    const result = fn(s);
    this.write(s);
    return result;
  }

  reset() {
    try {
      localStorage.removeItem(this.key);
    } catch {}
  }

  async listCategories() {
    return this.read().categories;
  }

  async createCategory(c: NewCategory) {
    const cat: Category = { ...c, id: uid() };
    return this.mutate((s) => {
      s.categories.push(cat);
      return cat;
    });
  }

  async updateCategory(id: string, patch: Partial<NewCategory>) {
    return this.mutate((s) => {
      const i = s.categories.findIndex((c) => c.id === id);
      if (i < 0) throw new Error("Category not found");
      s.categories[i] = { ...s.categories[i], ...patch };
      return s.categories[i];
    });
  }

  async deleteCategory(id: string) {
    this.mutate((s) => {
      s.categories = s.categories.filter((c) => c.id !== id);
      s.transactions = s.transactions.map((t) => (t.categoryId === id ? { ...t, categoryId: null } : t));
    });
  }

  async listTransactions() {
    return this.read().transactions;
  }

  async createTransaction(t: NewTransaction) {
    return (await this.createTransactions([t]))[0];
  }

  async createTransactions(list: NewTransaction[]) {
    const now = new Date().toISOString();
    const created = list.map((t) => ({ ...t, id: uid(), createdAt: now }));
    return this.mutate((s) => {
      s.transactions.push(...created);
      return created;
    });
  }

  async updateTransaction(id: string, patch: Partial<NewTransaction>) {
    return this.mutate((s) => {
      const i = s.transactions.findIndex((t) => t.id === id);
      if (i < 0) throw new Error("Transaction not found");
      s.transactions[i] = { ...s.transactions[i], ...patch };
      return s.transactions[i];
    });
  }

  async deleteTransaction(id: string) {
    this.mutate((s) => {
      s.transactions = s.transactions.filter((t) => t.id !== id);
    });
  }
}

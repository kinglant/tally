import type { SupabaseClient } from "@supabase/supabase-js";
import type { Category, DataStore, NewCategory, NewTransaction, Transaction } from "../types";

interface TxRow {
  id: string;
  type: "income" | "expense";
  amount: number | string;
  date: string;
  category_id: string | null;
  note: string | null;
  created_at: string;
}

const toTx = (r: TxRow): Transaction => ({
  id: r.id,
  type: r.type,
  amount: Number(r.amount),
  date: r.date,
  categoryId: r.category_id,
  note: r.note ?? "",
  createdAt: r.created_at,
});

const txToRow = (t: Partial<NewTransaction>) => {
  const row: Record<string, unknown> = {};
  if (t.type !== undefined) row.type = t.type;
  if (t.amount !== undefined) row.amount = t.amount;
  if (t.date !== undefined) row.date = t.date;
  if (t.categoryId !== undefined) row.category_id = t.categoryId;
  if (t.note !== undefined) row.note = t.note;
  return row;
};

function check<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

/**
 * Supabase-backed store. Row Level Security (see supabase/schema.sql) limits every
 * query to the signed-in user, and `user_id` defaults to auth.uid() on insert.
 */
export class SupabaseStore implements DataStore {
  constructor(private db: SupabaseClient) {}

  async listCategories() {
    return check(await this.db.from("categories").select("id,name,type,color").order("name")) as Category[];
  }

  async createCategory(c: NewCategory) {
    return check(await this.db.from("categories").insert(c).select("id,name,type,color").single()) as Category;
  }

  async updateCategory(id: string, c: Partial<NewCategory>) {
    return check(
      await this.db.from("categories").update(c).eq("id", id).select("id,name,type,color").single(),
    ) as Category;
  }

  async deleteCategory(id: string) {
    check(await this.db.from("categories").delete().eq("id", id));
  }

  async listTransactions() {
    const rows = check(
      await this.db.from("transactions").select("*").order("date", { ascending: false }).limit(5000),
    ) as TxRow[];
    return rows.map(toTx);
  }

  async createTransaction(t: NewTransaction) {
    return (await this.createTransactions([t]))[0];
  }

  async createTransactions(list: NewTransaction[]) {
    const rows = check(await this.db.from("transactions").insert(list.map(txToRow)).select("*")) as TxRow[];
    return rows.map(toTx);
  }

  async updateTransaction(id: string, t: Partial<NewTransaction>) {
    return toTx(check(await this.db.from("transactions").update(txToRow(t)).eq("id", id).select("*").single()) as TxRow);
  }

  async deleteTransaction(id: string) {
    check(await this.db.from("transactions").delete().eq("id", id));
  }
}

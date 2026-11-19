export type TxType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  type: TxType;
  color: string;
}

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  /** Calendar date, YYYY-MM-DD */
  date: string;
  categoryId: string | null;
  note: string;
  createdAt: string;
}

export type NewTransaction = Omit<Transaction, "id" | "createdAt">;
export type NewCategory = Omit<Category, "id">;

export interface AppUser {
  id: string;
  email: string;
  demo: boolean;
}

/** Storage backend. Implemented by Supabase (real accounts) and localStorage (demo). */
export interface DataStore {
  listCategories(): Promise<Category[]>;
  createCategory(c: NewCategory): Promise<Category>;
  updateCategory(id: string, c: Partial<NewCategory>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  listTransactions(): Promise<Transaction[]>;
  createTransaction(t: NewTransaction): Promise<Transaction>;
  createTransactions(t: NewTransaction[]): Promise<Transaction[]>;
  updateTransaction(id: string, t: Partial<NewTransaction>): Promise<Transaction>;
  deleteTransaction(id: string): Promise<void>;
}

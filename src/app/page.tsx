import { BarChart3, Download, Filter, LockKeyhole, Moon, Smartphone, Tags, Wallet } from "lucide-react";
import Link from "next/link";
import { DemoButton } from "@/components/DemoButton";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

const FEATURES = [
  { icon: Wallet, title: "Income & expenses", text: "Add, edit and delete transactions with amount, date, category and a note." },
  { icon: BarChart3, title: "Visual dashboard", text: "Balance, period totals with trend vs last period, and monthly charts." },
  { icon: Tags, title: "Custom categories", text: "Create your own income and expense categories with colors." },
  { icon: Filter, title: "Search & filters", text: "Find anything by note, category, type or date range in an instant." },
  { icon: Download, title: "CSV export", text: "Download filtered or full history for Excel and Google Sheets." },
  { icon: LockKeyhole, title: "Secure accounts", text: "Email sign-in with Supabase Auth and row-level security per user." },
  { icon: Smartphone, title: "Mobile-first", text: "Bottom navigation and a quick-add button on phones, sidebar on desktop." },
  { icon: Moon, title: "Dark mode", text: "Looks great day and night, and remembers your choice." },
];

const STACK = ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "Supabase (Postgres + Auth)", "Recharts"];

const BARS = [
  [62, 48],
  [70, 55],
  [58, 61],
  [80, 52],
  [74, 47],
  [88, 50],
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Link href="/login" className="btn btn-ghost h-9 px-3">
            Sign in
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-2 lg:pt-20">
          <div>
            <span className="inline-flex items-center rounded-full border border-border bg-panel px-3 py-1 text-xs text-muted">
              Personal finance, without the spreadsheet
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Know exactly where <span className="text-accent">your money</span> goes.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted">
              Tally is a simple, fast income and expense tracker. Log transactions in seconds, see clear charts, and export
              everything when you need it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <DemoButton className="h-11 px-5" />
              <Link href="/login" className="btn btn-ghost h-11 px-5">
                Create free account
              </Link>
            </div>
            <p className="mt-3 text-xs text-muted">The demo opens instantly with six months of sample data.</p>
          </div>

          {/* Product preview built from markup, so it stays sharp and theme-aware */}
          <div className="card p-4 shadow-xl shadow-black/5 sm:p-5" aria-hidden>
            <div className="grid grid-cols-3 gap-3">
              {[
                ["Balance", "$12,480", "text-fg"],
                ["Income", "$4,150", "text-income"],
                ["Expenses", "$2,312", "text-expense"],
              ].map(([l, v, c]) => (
                <div key={l} className="rounded-xl border border-border p-3">
                  <p className="text-[11px] text-muted">{l}</p>
                  <p className={`tabular mt-1 text-sm font-semibold sm:text-lg ${c}`}>{v}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-border p-4">
              <p className="text-xs font-medium">Income vs expenses</p>
              <div className="mt-3 flex h-36 items-end justify-between gap-2">
                {BARS.map(([i, e], k) => (
                  <div key={k} className="flex h-full flex-1 items-end justify-center gap-1">
                    <span className="w-full max-w-4 rounded-t bg-income" style={{ height: `${i}%` }} />
                    <span className="w-full max-w-4 rounded-t bg-expense" style={{ height: `${e}%` }} />
                  </div>
                ))}
              </div>
            </div>
            <ul className="mt-3 divide-y divide-border rounded-xl border border-border text-sm">
              {[
                ["Monthly salary", "Salary", "+$3,200.00", "#0f9f6e", true],
                ["Groceries", "Food", "−$64.20", "#f59e0b", false],
                ["Apartment rent", "Rent", "−$1,150.00", "#e1475a", false],
              ].map(([n, cat, a, col, inc]) => (
                <li key={n as string} className="flex items-center gap-3 px-3 py-2.5">
                  <span className="h-7 w-7 rounded-full" style={{ background: col as string }} />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{n}</span>
                    <span className="block text-xs text-muted">{cat}</span>
                  </span>
                  <span className={`tabular font-semibold ${inc ? "text-income" : ""}`}>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-border bg-panel">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight">Everything you need, nothing you don&apos;t</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-border bg-bg p-5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent-soft text-accent">
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-4 font-medium">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="card flex flex-col items-start justify-between gap-6 p-6 sm:p-8 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Built with a modern stack</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {STACK.map((s) => (
                  <span key={s} className="rounded-full bg-bg-soft px-3 py-1 text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <DemoButton label="See it in action" />
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        Tally · Portfolio project by Olimov M.
      </footer>
    </div>
  );
}

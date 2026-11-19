"use client";

import { ArrowLeftRight, LayoutDashboard, LogOut, Plus, Settings, Tags } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useData } from "@/lib/data";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { TransactionModal } from "./TransactionModal";

const NAV = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/app/categories", label: "Categories", icon: Tags },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, ready, signOut } = useAuth();
  const { loading, error } = useData();
  const router = useRouter();
  const path = usePathname();
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  const pending = !ready || !user || loading;

  const isActive = (href: string) => (href === "/app" ? path === "/app" : path.startsWith(href));

  const logout = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <div className="flex min-h-dvh flex-1">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-panel px-3 py-5 lg:flex">
        <Link href="/" className="px-3">
          <Logo />
        </Link>
        <button onClick={() => setAdding(true)} className="btn btn-primary mx-1 mt-6">
          <Plus size={16} /> Add transaction
        </button>
        <nav className="mt-6 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive(href) ? "bg-accent-soft text-accent" : "text-muted hover:bg-bg-soft hover:text-fg"
              }`}
            >
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-3 border-t border-border px-1 pt-4">
          <div className="flex items-center gap-2 px-2">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-bg-soft text-xs font-semibold uppercase">
              {user?.email[0] ?? ""}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user ? (user.demo ? "Demo account" : user.email) : "\u00a0"}</p>
              {user?.demo && <p className="text-xs text-muted">Data stays in this browser</p>}
            </div>
            <ThemeToggle />
          </div>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-bg-soft hover:text-fg">
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar (mobile) */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-panel/90 px-4 py-3 backdrop-blur lg:hidden">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button onClick={logout} aria-label="Sign out" className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-bg-soft">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {user?.demo && (
          <div className="border-b border-border bg-accent-soft px-4 py-2 text-center text-xs text-accent sm:text-sm">
            You&apos;re exploring the demo with sample data. Changes are saved only in this browser.
          </div>
        )}

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10">
          {error ? (
            <div className="card p-6 text-sm">
              <p className="font-medium text-expense">Could not load your data</p>
              <p className="mt-1 text-muted">{error}</p>
            </div>
          ) : (
            <>
              {pending && (
                <div className="grid gap-4 sm:grid-cols-3" aria-label="Loading">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="card h-28 animate-pulse bg-bg-soft" />
                  ))}
                </div>
              )}
              {/* Always rendered so the route shell stays intact; revealed once data is ready. */}
              <div hidden={pending}>{children}</div>
            </>
          )}
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-panel/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {NAV.slice(0, 2).map(({ href, label, icon: Icon }) => (
          <MobileLink key={href} href={href} label={label} active={isActive(href)} icon={<Icon size={20} />} />
        ))}
        <div className="grid place-items-center">
          <button
            onClick={() => setAdding(true)}
            aria-label="Add transaction"
            className="-mt-6 grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-fg shadow-lg"
          >
            <Plus size={22} />
          </button>
        </div>
        {NAV.slice(2).map(({ href, label, icon: Icon }) => (
          <MobileLink key={href} href={href} label={label} active={isActive(href)} icon={<Icon size={20} />} />
        ))}
      </nav>

      <TransactionModal open={adding} onClose={() => setAdding(false)} />
    </div>
  );
}

function MobileLink({ href, label, icon, active }: { href: string; label: string; icon: React.ReactNode; active: boolean }) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${active ? "text-accent" : "text-muted"}`}>
      {icon}
      {label}
    </Link>
  );
}

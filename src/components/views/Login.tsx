"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth";

export function Login() {
  const { user, ready, supabaseEnabled, signIn, signUp, startDemo } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) router.replace("/app");
  }, [ready, user, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setBusy(true);
    try {
      if (mode === "signin") await signIn(email.trim(), password);
      else {
        const { needsConfirmation } = await signUp(email.trim(), password);
        if (needsConfirmation) {
          setNotice("Check your inbox to confirm your email, then sign in.");
          setMode("signin");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>

      <main className="grid flex-1 place-items-center px-4 pb-16">
        <div className="w-full max-w-sm">
          <h1 className="text-center text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-center text-sm text-muted">
            {mode === "signin" ? "Sign in to see your dashboard." : "Start tracking in under a minute."}
          </p>

          <div className="card mt-6 p-5">
            <button onClick={startDemo} className="btn btn-primary w-full">
              <Sparkles size={16} /> Try the live demo
            </button>
            <p className="mt-2 text-center text-xs text-muted">No sign-up needed. Sample data, stored only in your browser.</p>

            {supabaseEnabled ? (
              <>
                <div className="my-5 flex items-center gap-3 text-xs text-muted">
                  <span className="h-px flex-1 bg-border" /> or use your email <span className="h-px flex-1 bg-border" />
                </div>
                <form onSubmit={submit} className="space-y-3">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-muted">Email</span>
                    <input className="field" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-muted">Password</span>
                    <input
                      className="field"
                      type="password"
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>
                  {error && <p className="rounded-lg bg-expense-soft px-3 py-2 text-sm text-expense">{error}</p>}
                  {notice && <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">{notice}</p>}
                  <button type="submit" className="btn btn-ghost w-full" disabled={busy}>
                    {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
                  </button>
                </form>
                <p className="mt-4 text-center text-sm text-muted">
                  {mode === "signin" ? "New to Tally?" : "Already have an account?"}{" "}
                  <button
                    onClick={() => {
                      setMode(mode === "signin" ? "signup" : "signin");
                      setError(null);
                    }}
                    className="font-medium text-accent hover:underline"
                  >
                    {mode === "signin" ? "Create an account" : "Sign in"}
                  </button>
                </p>
              </>
            ) : (
              <p className="mt-5 rounded-lg bg-bg-soft px-3 py-2.5 text-xs text-muted">
                Email accounts turn on when Supabase keys are added (see README). The demo has every feature.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

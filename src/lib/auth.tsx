"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getSupabase, supabaseEnabled } from "./supabase";
import type { AppUser } from "./types";

const DEMO_FLAG = "tally-demo-session";
export const DEMO_USER: AppUser = { id: "demo", email: "demo@tally.app", demo: true };

interface AuthState {
  user: AppUser | null;
  ready: boolean;
  supabaseEnabled: boolean;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string): Promise<{ needsConfirmation: boolean }>;
  startDemo(): void;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let demo = false;
    try {
      demo = localStorage.getItem(DEMO_FLAG) === "1";
    } catch {}

    if (!supabaseEnabled) {
      // Restoring a browser-only session: localStorage is only readable after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(demo ? DEMO_USER : null);
      setReady(true);
      return;
    }

    const sb = getSupabase();
    sb.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      setUser(u ? { id: u.id, email: u.email ?? "", demo: false } : demo ? DEMO_USER : null);
      setReady(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      if (u) setUser({ id: u.id, email: u.email ?? "", demo: false });
      else setUser((prev) => (prev?.demo ? prev : null));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    try {
      localStorage.removeItem(DEMO_FLAG);
    } catch {}
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await getSupabase().auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    return { needsConfirmation: !data.session };
  }, []);

  const startDemo = useCallback(() => {
    try {
      localStorage.setItem(DEMO_FLAG, "1");
    } catch {}
    setUser(DEMO_USER);
  }, []);

  const signOut = useCallback(async () => {
    try {
      localStorage.removeItem(DEMO_FLAG);
    } catch {}
    if (supabaseEnabled) await getSupabase().auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, supabaseEnabled, signIn, signUp, startDemo, signOut }),
    [user, ready, signIn, signUp, startDemo, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

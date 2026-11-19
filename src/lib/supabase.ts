import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when Supabase keys are configured; otherwise the app runs in demo-only mode. */
export const supabaseEnabled = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseEnabled) throw new Error("Supabase is not configured");
  if (!client) client = createClient(url!, anonKey!);
  return client;
}

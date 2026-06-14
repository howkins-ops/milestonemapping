import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (import.meta.env.DEV && (!url || !key)) {
  console.warn(
    "[Supabase] Missing env vars VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. " +
    "App will run in offline-only mode."
  );
}

export const supabase = url && key
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const isSupabaseReady = !!supabase;

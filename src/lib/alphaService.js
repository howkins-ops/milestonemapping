import { supabase } from "./supabaseClient.js";

/* ALPHA MODE — Supabase persistence.
   Owner-only RLS tables from 013_alpha_mode: alpha_state (one row per
   user) and alpha_events (append-only log). Event ids are minted
   client-side so optimistic local rows and persisted rows match. */

export async function fetchAlpha(userId) {
  if (!supabase || !userId) return { data: null, offline: true };
  const [stateRes, eventsRes] = await Promise.all([
    supabase.from("alpha_state").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("alpha_events").select("*").eq("user_id", userId)
      .order("created_at", { ascending: false }).limit(500),
  ]);
  const error = stateRes.error || eventsRes.error;
  if (error) {
    console.error("[alphaService] fetch:", error.message);
    return { data: null, error };
  }
  return { data: { state: stateRes.data ?? null, events: eventsRes.data ?? [] } };
}

export async function upsertState(userId, patch) {
  if (!supabase || !userId) return { data: null, offline: true };
  const { data, error } = await supabase
    .from("alpha_state")
    .upsert(
      { user_id: userId, ...patch, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    .select()
    .single();
  if (error) console.error("[alphaService] upsertState:", error.message);
  return { data, error };
}

export async function createEvent(userId, event) {
  if (!supabase || !userId) return { data: null, offline: true };
  const { data, error } = await supabase
    .from("alpha_events")
    .insert({
      id: event.id,
      user_id: userId,
      kind: event.kind,
      payload: event.payload ?? {},
    })
    .select()
    .single();
  if (error) console.error("[alphaService] createEvent:", error.message);
  return { data, error };
}

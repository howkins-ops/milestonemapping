import { supabase } from "./supabaseClient.js";

export async function getProfile(userId) {
  if (!supabase || !userId) return { data: null, error: null };
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) console.error("[profileService] getProfile:", error.message);
  return { data, error };
}

export async function upsertProfile(userId, updates) {
  if (!supabase || !userId) return { data: null, offline: true };
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...updates })
    .select()
    .single();
  if (error) console.error("[profileService] upsertProfile:", error.message);
  return { data, error };
}

export async function createProfileIfMissing(userId, email) {
  if (!supabase || !userId) return;
  const { data: existing } = await getProfile(userId);
  if (existing) return existing;
  const { data, error } = await supabase
    .from("profiles")
    .insert({ id: userId, email: email ?? "" })
    .select()
    .single();
  if (error && error.code !== "23505") {
    console.error("[profileService] createProfileIfMissing:", error.message);
  }
  // Also ensure user_stats row exists
  await supabase
    .from("user_stats")
    .insert({ user_id: userId })
    .then(() => {});
  return data;
}

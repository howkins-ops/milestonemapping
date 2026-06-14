import { supabase } from "./supabaseClient.js";

export async function upsertGratitudeEntry(userId, date, { items, reflection, mood_score }) {
  if (!supabase || !userId) return { data: null, offline: true };
  const { data, error } = await supabase
    .from("gratitude_entries")
    .upsert(
      { user_id: userId, entry_date: date, items, reflection, mood_score },
      { onConflict: "user_id,entry_date" }
    )
    .select()
    .single();
  if (error) console.error("[gratitudeService] upsert:", error.message);
  return { data, error };
}

export async function getGratitudeEntries(userId, limit = 30) {
  if (!supabase || !userId) return { data: [], error: null };
  const { data, error } = await supabase
    .from("gratitude_entries")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false })
    .limit(limit);
  if (error) console.error("[gratitudeService] getEntries:", error.message);
  return { data: data ?? [], error };
}

export async function getGratitudeByDate(userId, date) {
  if (!supabase || !userId) return { data: null, error: null };
  const { data, error } = await supabase
    .from("gratitude_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("entry_date", date)
    .maybeSingle();
  if (error) console.error("[gratitudeService] getByDate:", error.message);
  return { data, error };
}

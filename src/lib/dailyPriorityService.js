import { supabase } from "./supabaseClient.js";

export async function upsertPriorities(userId, date, priorities) {
  if (!supabase || !userId) return { data: null, offline: true };
  const completedCount = priorities.filter((p) => p.done).length;
  const { data, error } = await supabase
    .from("daily_priorities")
    .upsert(
      {
        user_id: userId,
        priority_date: date,
        priorities,
        completed_count: completedCount,
        top_focus: priorities[0]?.text ?? null,
      },
      { onConflict: "user_id,priority_date" }
    )
    .select()
    .single();
  if (error) console.error("[dailyPriorityService] upsert:", error.message);
  return { data, error };
}

export async function getPrioritiesByDate(userId, date) {
  if (!supabase || !userId) return { data: null, error: null };
  const { data, error } = await supabase
    .from("daily_priorities")
    .select("*")
    .eq("user_id", userId)
    .eq("priority_date", date)
    .maybeSingle();
  if (error) console.error("[dailyPriorityService] getByDate:", error.message);
  return { data, error };
}

export async function getRecentPriorities(userId, limit = 14) {
  if (!supabase || !userId) return { data: [], error: null };
  const { data, error } = await supabase
    .from("daily_priorities")
    .select("*")
    .eq("user_id", userId)
    .order("priority_date", { ascending: false })
    .limit(limit);
  if (error) console.error("[dailyPriorityService] getRecent:", error.message);
  return { data: data ?? [], error };
}

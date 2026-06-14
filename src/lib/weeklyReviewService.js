import { supabase } from "./supabaseClient.js";

export async function upsertWeeklyReview(userId, weekStart, reviewData) {
  if (!supabase || !userId) return { data: null, offline: true };
  const { data, error } = await supabase
    .from("weekly_reviews")
    .upsert(
      { user_id: userId, week_start: weekStart, ...reviewData },
      { onConflict: "user_id,week_start" }
    )
    .select()
    .single();
  if (error) console.error("[weeklyReviewService] upsert:", error.message);
  return { data, error };
}

export async function getWeeklyReviews(userId, limit = 12) {
  if (!supabase || !userId) return { data: [], error: null };
  const { data, error } = await supabase
    .from("weekly_reviews")
    .select("*")
    .eq("user_id", userId)
    .order("week_start", { ascending: false })
    .limit(limit);
  if (error) console.error("[weeklyReviewService] getAll:", error.message);
  return { data: data ?? [], error };
}

export async function getLatestReview(userId) {
  if (!supabase || !userId) return { data: null, error: null };
  const { data, error } = await supabase
    .from("weekly_reviews")
    .select("*")
    .eq("user_id", userId)
    .order("week_start", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) console.error("[weeklyReviewService] getLatest:", error.message);
  return { data, error };
}

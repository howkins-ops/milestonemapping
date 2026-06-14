import { supabase } from "./supabaseClient.js";
import { getRankFromXP, getNextRank, RANKS } from "./gamification.js";

export function calculateLevel(totalXP) {
  const safe = Math.max(0, Number(totalXP) || 0);
  const rank = getRankFromXP(safe);
  const next = getNextRank(safe);
  const level = (RANKS.indexOf(rank) + 1) || 1;
  return { level, rank: rank.name, xpToNext: next ? next.min - safe : 0 };
}

export async function getStats(userId) {
  if (!supabase || !userId) return { data: null, error: null };
  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) console.error("[statsService] getStats:", error.message);
  return { data, error };
}

export async function ensureStatsRow(userId) {
  if (!supabase || !userId) return;
  await supabase
    .from("user_stats")
    .upsert({ user_id: userId }, { onConflict: "user_id", ignoreDuplicates: true });
}

export async function updateXP(userId, totalXP) {
  if (!supabase || !userId) return;
  const { level } = calculateLevel(Number(totalXP) || 0);
  const { error } = await supabase
    .from("user_stats")
    .upsert(
      { user_id: userId, total_xp: Number(totalXP) || 0, level },
      { onConflict: "user_id" }
    );
  if (error) console.error("[statsService] updateXP:", error.message);
}

export async function incrementStat(userId, field, amount = 1) {
  if (!supabase || !userId) return;
  // Fetch current value then increment (rpc would be cleaner but this is safe)
  const { data } = await supabase
    .from("user_stats")
    .select(field)
    .eq("user_id", userId)
    .maybeSingle();
  const current = data?.[field] ?? 0;
  const { error } = await supabase
    .from("user_stats")
    .upsert(
      { user_id: userId, [field]: current + amount },
      { onConflict: "user_id" }
    );
  if (error) console.error(`[statsService] incrementStat(${field}):`, error.message);
}

export async function updateStreak(userId) {
  if (!supabase || !userId) return;
  const today = new Date().toISOString().slice(0, 10);
  const { data: stats } = await supabase
    .from("user_stats")
    .select("streak_days, longest_streak, last_active_date")
    .eq("user_id", userId)
    .maybeSingle();

  if (!stats) return;

  const last = stats.last_active_date;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  let newStreak = stats.streak_days ?? 0;
  if (last === today) return; // already counted today
  if (last === yesterdayStr) {
    newStreak += 1;
  } else if (last !== today) {
    newStreak = 1; // reset streak
  }

  const newLongest = Math.max(stats.longest_streak ?? 0, newStreak);
  const { error } = await supabase
    .from("user_stats")
    .upsert(
      { user_id: userId, streak_days: newStreak, longest_streak: newLongest, last_active_date: today },
      { onConflict: "user_id" }
    );
  if (error) console.error("[statsService] updateStreak:", error.message);
}

import { supabase } from "./supabaseClient.js";

/* THE IRON — Supabase persistence.
   Private single-user data behind owner-only RLS (012_iron_workout):
   workout_plans, workout_sessions, workout_prs, workout_state.
   Ids are generated client-side (crypto.randomUUID) so optimistic
   local state and persisted rows share the same identity. */

export async function fetchWorkout(userId) {
  if (!supabase || !userId) return { data: null, offline: true };
  const [plansRes, sessionsRes, prsRes, stateRes] = await Promise.all([
    supabase.from("workout_plans").select("*").eq("user_id", userId)
      .order("position", { ascending: true }).order("created_at", { ascending: true }),
    supabase.from("workout_sessions").select("*").eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase.from("workout_prs").select("*").eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase.from("workout_state").select("*").eq("user_id", userId).maybeSingle(),
  ]);
  const error = plansRes.error || sessionsRes.error || prsRes.error || stateRes.error;
  if (error) {
    console.error("[workoutService] fetch:", error.message);
    return { data: null, error };
  }
  return {
    data: {
      plans: plansRes.data ?? [],
      sessions: sessionsRes.data ?? [],
      prs: prsRes.data ?? [],
      state: stateRes.data ?? null,
    },
  };
}

export async function createPlan(userId, plan) {
  if (!supabase || !userId) return { data: null, offline: true };
  const { data, error } = await supabase
    .from("workout_plans")
    .insert({
      id: plan.id,
      user_id: userId,
      name: plan.name,
      focus: plan.focus || null,
      steel: plan.steel || "gunmetal",
      emblem: plan.emblem || "▲",
      exercises: plan.exercises ?? [],
      position: plan.position ?? 0,
    })
    .select()
    .single();
  if (error) console.error("[workoutService] createPlan:", error.message);
  return { data, error };
}

export async function updatePlan(userId, planId, patch) {
  if (!supabase || !userId) return { data: null, offline: true };
  const { data, error } = await supabase
    .from("workout_plans")
    .update(patch)
    .eq("user_id", userId)
    .eq("id", planId)
    .select()
    .single();
  if (error) console.error("[workoutService] updatePlan:", error.message);
  return { data, error };
}

export async function deletePlan(userId, planId) {
  if (!supabase || !userId) return { data: null, offline: true };
  const { error } = await supabase
    .from("workout_plans")
    .delete()
    .eq("user_id", userId)
    .eq("id", planId);
  if (error) console.error("[workoutService] deletePlan:", error.message);
  return { error };
}

export async function createSession(userId, session) {
  if (!supabase || !userId) return { data: null, offline: true };
  const { data, error } = await supabase
    .from("workout_sessions")
    .insert({
      id: session.id,
      user_id: userId,
      plan_id: session.plan_id ?? null,
      plan_name: session.plan_name || null,
      duration_s: session.duration_s ?? 0,
      total_volume: session.total_volume ?? 0,
      total_sets: session.total_sets ?? 0,
      exercises: session.exercises ?? [],
      note: session.note || null,
      meta: session.meta ?? null,
    })
    .select()
    .single();
  if (error) console.error("[workoutService] createSession:", error.message);
  return { data, error };
}

export async function createPR(userId, pr) {
  if (!supabase || !userId) return { data: null, offline: true };
  const { data, error } = await supabase
    .from("workout_prs")
    .insert({
      id: pr.id,
      user_id: userId,
      exercise: pr.exercise,
      weight: pr.weight,
      reps: pr.reps ?? 1,
      session_id: pr.session_id ?? null,
    })
    .select()
    .single();
  if (error) console.error("[workoutService] createPR:", error.message);
  return { data, error };
}

export async function setCreedSeen(userId, seen = true) {
  if (!supabase || !userId) return { data: null, offline: true };
  const { data, error } = await supabase
    .from("workout_state")
    .upsert(
      { user_id: userId, creed_seen: seen, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    .select()
    .single();
  if (error) console.error("[workoutService] setCreedSeen:", error.message);
  return { data, error };
}

import { supabase } from "./supabaseClient.js";

export async function createProof(userId, { title, description, proof_type = "win", linked_project_id, linked_milestone_id, xp_earned = 25 }) {
  if (!supabase || !userId) return { data: null, offline: true };
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("daily_proof")
    .insert({
      user_id: userId,
      proof_date: today,
      title,
      description,
      proof_type,
      linked_project_id: linked_project_id ?? null,
      linked_milestone_id: linked_milestone_id ?? null,
      xp_earned,
    })
    .select()
    .single();
  if (error) console.error("[dailyProofService] create:", error.message);
  return { data, error };
}

export async function getProofByDate(userId, date) {
  if (!supabase || !userId) return { data: [], error: null };
  const { data, error } = await supabase
    .from("daily_proof")
    .select("*")
    .eq("user_id", userId)
    .eq("proof_date", date)
    .order("created_at", { ascending: false });
  if (error) console.error("[dailyProofService] getByDate:", error.message);
  return { data: data ?? [], error };
}

export async function getRecentProof(userId, limit = 30) {
  if (!supabase || !userId) return { data: [], error: null };
  const { data, error } = await supabase
    .from("daily_proof")
    .select("*")
    .eq("user_id", userId)
    .order("proof_date", { ascending: false })
    .limit(limit);
  if (error) console.error("[dailyProofService] getRecent:", error.message);
  return { data: data ?? [], error };
}

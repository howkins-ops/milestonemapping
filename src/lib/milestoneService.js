import { supabase } from "./supabaseClient.js";

export async function getMilestonesByProject(userId, projectId) {
  if (!supabase || !userId) return { data: [], error: null };
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("user_id", userId)
    .eq("project_id", projectId)
    .order("order_index", { ascending: true });
  if (error) console.error("[milestoneService] getByProject:", error.message);
  return { data: data ?? [], error };
}

export async function upsertMilestone(userId, milestoneData) {
  if (!supabase || !userId) return { data: null, offline: true };
  const { id, projectId, title, description, whyItMatters, futureVision, oldIdentity, newIdentity,
    targetDate, status, priority, rewardSmall, rewardMedium, rewardLarge, rewardsClaimed,
    actions, notes, completedAt, order_index } = milestoneData;
  const payload = {
    id,
    user_id: userId,
    project_id: projectId ?? milestoneData.project_id ?? null,
    title: title ?? "",
    description: description ?? "",
    why: whyItMatters ?? "",
    future_vision: futureVision ?? "",
    old_identity: oldIdentity ?? "",
    new_identity: newIdentity ?? "",
    target_date: targetDate ?? null,
    status: status ?? "active",
    priority: priority ?? "medium",
    reward_small: rewardSmall ?? "",
    reward_medium: rewardMedium ?? "",
    reward_large: rewardLarge ?? "",
    rewards_claimed: rewardsClaimed ?? { small: false, medium: false, large: false },
    actions: actions ?? [],
    notes: notes ?? "",
    completed_at: completedAt ?? null,
    order_index: order_index ?? 0,
  };
  const { data, error } = await supabase
    .from("milestones")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();
  if (error) console.error("[milestoneService] upsert:", error.message);
  return { data, error };
}

export async function completeMilestoneInDB(userId, milestoneId) {
  if (!supabase || !userId) return;
  const { error } = await supabase
    .from("milestones")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", milestoneId)
    .eq("user_id", userId);
  if (error) console.error("[milestoneService] complete:", error.message);
}

export async function deleteMilestone(userId, milestoneId) {
  if (!supabase || !userId) return;
  const { error } = await supabase
    .from("milestones")
    .delete()
    .eq("id", milestoneId)
    .eq("user_id", userId);
  if (error) console.error("[milestoneService] delete:", error.message);
}

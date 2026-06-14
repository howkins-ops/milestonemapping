import { supabase } from "./supabaseClient.js";

export async function getProjects(userId) {
  if (!supabase || !userId) return { data: [], error: null };
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) console.error("[projectService] getAll:", error.message);
  return { data: data ?? [], error };
}

export async function upsertProject(userId, projectData) {
  if (!supabase || !userId) return { data: null, offline: true };
  const { id, title, description, category, status, vision, why, icon, color, target_date, completed_at } = projectData;
  const payload = {
    id,
    user_id: userId,
    title: title ?? "",
    description: description ?? "",
    category: category ?? "Personal Growth",
    status: status ?? "active",
    vision: vision ?? projectData.futureVision ?? "",
    why: why ?? projectData.whyItMatters ?? "",
    icon: icon ?? projectData.icon ?? "🗺️",
    color: color ?? projectData.color ?? "cyan",
    target_date: target_date ?? projectData.targetDate ?? null,
    completed_at: completed_at ?? projectData.completedAt ?? null,
  };
  const { data, error } = await supabase
    .from("projects")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();
  if (error) console.error("[projectService] upsert:", error.message);
  return { data, error };
}

export async function deleteProject(userId, projectId) {
  if (!supabase || !userId) return;
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", userId);
  if (error) console.error("[projectService] delete:", error.message);
}

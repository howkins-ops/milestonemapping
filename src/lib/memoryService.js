import { supabase } from "./supabaseClient.js";

export async function setMemory(userId, memory_type, key, value, source = "app") {
  if (!supabase || !userId) return { data: null, offline: true };
  const { data, error } = await supabase
    .from("app_memory")
    .upsert(
      { user_id: userId, memory_type, key, value, source },
      { onConflict: "user_id,memory_type,key" }
    )
    .select()
    .single();
  if (error) console.error("[memoryService] setMemory:", error.message);
  return { data, error };
}

export async function getMemory(userId, memory_type) {
  if (!supabase || !userId) return { data: [], error: null };
  const { data, error } = await supabase
    .from("app_memory")
    .select("*")
    .eq("user_id", userId)
    .eq("memory_type", memory_type)
    .order("updated_at", { ascending: false });
  if (error) console.error("[memoryService] getMemory:", error.message);
  return { data: data ?? [], error };
}

export async function getMemoryByKey(userId, memory_type, key) {
  if (!supabase || !userId) return { data: null, error: null };
  const { data, error } = await supabase
    .from("app_memory")
    .select("*")
    .eq("user_id", userId)
    .eq("memory_type", memory_type)
    .eq("key", key)
    .maybeSingle();
  if (error) console.error("[memoryService] getByKey:", error.message);
  return { data, error };
}

export async function getAllMemory(userId) {
  if (!supabase || !userId) return { data: [], error: null };
  const { data, error } = await supabase
    .from("app_memory")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(50);
  if (error) console.error("[memoryService] getAll:", error.message);
  return { data: data ?? [], error };
}

export async function deleteMemory(userId, memory_type, key) {
  if (!supabase || !userId) return;
  const { error } = await supabase
    .from("app_memory")
    .delete()
    .eq("user_id", userId)
    .eq("memory_type", memory_type)
    .eq("key", key);
  if (error) console.error("[memoryService] delete:", error.message);
}

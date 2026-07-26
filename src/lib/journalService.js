import { supabase } from "./supabaseClient.js";

/* The Field Journal — Supabase persistence.
   Private single-user data behind owner-only RLS (011_field_journal):
   journal_chapters, journal_entries, journal_prayers, journal_state.
   Ids are generated client-side (crypto.randomUUID) so optimistic
   local state and persisted rows share the same identity. */

export async function fetchJournal(userId) {
  if (!supabase || !userId) return { data: null, offline: true };
  const [chaptersRes, entriesRes, prayersRes, stateRes] = await Promise.all([
    supabase.from("journal_chapters").select("*").eq("user_id", userId)
      .order("position", { ascending: true }).order("created_at", { ascending: true }),
    supabase.from("journal_entries").select("*").eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase.from("journal_prayers").select("*").eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase.from("journal_state").select("*").eq("user_id", userId).maybeSingle(),
  ]);
  const error = chaptersRes.error || entriesRes.error || prayersRes.error || stateRes.error;
  if (error) {
    console.error("[journalService] fetch:", error.message);
    return { data: null, error };
  }
  return {
    data: {
      chapters: chaptersRes.data ?? [],
      entries: entriesRes.data ?? [],
      prayers: prayersRes.data ?? [],
      state: stateRes.data ?? null,
    },
  };
}

export async function createEntry(userId, entry) {
  if (!supabase || !userId) return { data: null, offline: true };
  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      id: entry.id,
      user_id: userId,
      space: entry.space,
      pillar: entry.pillar ?? null,
      chapter_id: entry.chapter_id ?? null,
      title: entry.title || null,
      body: entry.body,
      mood: entry.mood ?? null,
      linked_to: entry.linked_to ?? null,
    })
    .select()
    .single();
  if (error) console.error("[journalService] createEntry:", error.message);
  return { data, error };
}

/* A revision only ever touches what the writer can see on the page —
   title, body, tone. Space, pillar, chapter, linkage and created_at are
   the entry's identity and stay put. */
export async function updateEntry(userId, entryId, patch) {
  if (!supabase || !userId) return { data: null, offline: true };
  const { data, error } = await supabase
    .from("journal_entries")
    .update({
      title: patch.title || null,
      body: patch.body,
      mood: patch.mood ?? null,
    })
    .eq("user_id", userId)
    .eq("id", entryId)
    .select()
    .single();
  if (error) console.error("[journalService] updateEntry:", error.message);
  return { data, error };
}

export async function deleteEntry(userId, entryId) {
  if (!supabase || !userId) return { data: null, offline: true };
  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("user_id", userId)
    .eq("id", entryId);
  if (error) console.error("[journalService] deleteEntry:", error.message);
  return { error };
}

export async function createChapter(userId, chapter) {
  if (!supabase || !userId) return { data: null, offline: true };
  const { data, error } = await supabase
    .from("journal_chapters")
    .insert({
      id: chapter.id,
      user_id: userId,
      title: chapter.title,
      epigraph: chapter.epigraph || null,
      leather: chapter.leather || "oxblood",
      emblem: chapter.emblem || "✦",
      position: chapter.position ?? 0,
    })
    .select()
    .single();
  if (error) console.error("[journalService] createChapter:", error.message);
  return { data, error };
}

export async function createPrayer(userId, prayer) {
  if (!supabase || !userId) return { data: null, offline: true };
  const { data, error } = await supabase
    .from("journal_prayers")
    .insert({
      id: prayer.id,
      user_id: userId,
      title: prayer.title || null,
      body: prayer.body,
    })
    .select()
    .single();
  if (error) console.error("[journalService] createPrayer:", error.message);
  return { data, error };
}

export async function answerPrayer(userId, prayerId, note) {
  if (!supabase || !userId) return { data: null, offline: true };
  const { data, error } = await supabase
    .from("journal_prayers")
    .update({ answered_at: new Date().toISOString(), answered_note: note || null })
    .eq("user_id", userId)
    .eq("id", prayerId)
    .select()
    .single();
  if (error) console.error("[journalService] answerPrayer:", error.message);
  return { data, error };
}

export async function setWizardSeen(userId, seen = true) {
  if (!supabase || !userId) return { data: null, offline: true };
  const { data, error } = await supabase
    .from("journal_state")
    .upsert(
      { user_id: userId, wizard_seen: seen, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    )
    .select()
    .single();
  if (error) console.error("[journalService] setWizardSeen:", error.message);
  return { data, error };
}

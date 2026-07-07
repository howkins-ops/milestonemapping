import { useCallback, useEffect, useRef, useState } from "react";
import { safeLoad, safeSave } from "../../lib/storage.js";
import {
  fetchJournal,
  createEntry as dbCreateEntry,
  createChapter as dbCreateChapter,
  createPrayer as dbCreatePrayer,
  answerPrayer as dbAnswerPrayer,
  setWizardSeen as dbSetWizardSeen,
} from "../../lib/journalService.js";

/* The Field Journal data hook.
   Local-first: paints instantly from a localStorage cache, then loads
   the truth from Supabase and reconciles. Writes are optimistic — ids
   are minted client-side so the local row and the persisted row are
   the same row. Every mutation re-caches, so offline sessions survive
   a reload too. */

const CACHE_KEY = "field_journal_cache_v1";

const FIRST_CHAPTER = {
  title: "Chapter One: Betting on Myself",
  epigraph: "Nobody was coming to save me — and that turned out to be the good news.",
  leather: "oxblood",
  emblem: "✦",
};

const newId = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}-4000-8000-${Math.random().toString(16).slice(2, 14)}`;

const emptyData = { chapters: [], entries: [], prayers: [], wizardSeen: false };

export function useFieldJournal(userId) {
  const [data, setData] = useState(() => ({
    ...emptyData,
    ...safeLoad(CACHE_KEY, emptyData),
  }));
  const [loaded, setLoaded] = useState(false);
  const dataRef = useRef(data);
  dataRef.current = data;

  const commit = useCallback((updater) => {
    setData((prev) => {
      const next = updater(prev);
      safeSave(CACHE_KEY, next);
      return next;
    });
  }, []);

  /* ── initial cloud load ── */
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: cloud } = await fetchJournal(userId);
      if (!alive) return;
      if (cloud) {
        let chapters = cloud.chapters;
        // First ever open: stamp Chapter One so "continue the story" has a home.
        if (chapters.length === 0) {
          const ch = { ...FIRST_CHAPTER, id: newId(), position: 0, created_at: new Date().toISOString() };
          chapters = [ch];
          dbCreateChapter(userId, ch);
        }
        commit(() => ({
          chapters,
          entries: cloud.entries,
          prayers: cloud.prayers,
          wizardSeen: Boolean(cloud.state?.wizard_seen),
        }));
      } else if (dataRef.current.chapters.length === 0) {
        // Offline first run: local Chapter One, synced next time we're online.
        commit((prev) => ({
          ...prev,
          chapters: [{ ...FIRST_CHAPTER, id: newId(), position: 0, created_at: new Date().toISOString() }],
        }));
      }
      setLoaded(true);
    })();
    return () => { alive = false; };
  }, [userId, commit]);

  /* ── mutations (optimistic) ── */

  const addEntry = useCallback((entry) => {
    const row = {
      id: newId(),
      space: entry.space,
      pillar: entry.pillar ?? null,
      chapter_id: entry.chapter_id ?? null,
      title: entry.title || null,
      body: entry.body,
      mood: entry.mood ?? null,
      linked_to: entry.linked_to ?? null,
      created_at: new Date().toISOString(),
    };
    commit((prev) => ({ ...prev, entries: [row, ...prev.entries] }));
    dbCreateEntry(userId, row);
    return row;
  }, [userId, commit]);

  const addChapter = useCallback((chapter) => {
    const row = {
      id: newId(),
      title: chapter.title,
      epigraph: chapter.epigraph || null,
      leather: chapter.leather || "oxblood",
      emblem: chapter.emblem || "✦",
      position: dataRef.current.chapters.length,
      created_at: new Date().toISOString(),
    };
    commit((prev) => ({ ...prev, chapters: [...prev.chapters, row] }));
    dbCreateChapter(userId, row);
    return row;
  }, [userId, commit]);

  const addPrayer = useCallback((prayer) => {
    const row = {
      id: newId(),
      title: prayer.title || null,
      body: prayer.body,
      answered_at: null,
      answered_note: null,
      created_at: new Date().toISOString(),
    };
    commit((prev) => ({ ...prev, prayers: [row, ...prev.prayers] }));
    dbCreatePrayer(userId, row);
    return row;
  }, [userId, commit]);

  const markPrayerAnswered = useCallback((prayerId, note) => {
    const answeredAt = new Date().toISOString();
    commit((prev) => ({
      ...prev,
      prayers: prev.prayers.map((p) =>
        p.id === prayerId ? { ...p, answered_at: answeredAt, answered_note: note || null } : p
      ),
    }));
    dbAnswerPrayer(userId, prayerId, note);
  }, [userId, commit]);

  const markWizardSeen = useCallback(() => {
    if (dataRef.current.wizardSeen) return;
    commit((prev) => ({ ...prev, wizardSeen: true }));
    dbSetWizardSeen(userId, true);
  }, [userId, commit]);

  return {
    loaded,
    chapters: data.chapters,
    entries: data.entries,
    prayers: data.prayers,
    wizardSeen: data.wizardSeen,
    addEntry,
    addChapter,
    addPrayer,
    markPrayerAnswered,
    markWizardSeen,
  };
}

import { useState, useCallback } from "react";

const STORAGE_KEY = "milestone-quest:mode-v1";
const LEGACY_MILESTONE_KEYS = ["chapter-anchor", "chapter-shadow"];

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { mode: "treasure", chapters: {} };
    return { mode: "treasure", chapters: {}, ...JSON.parse(raw) };
  } catch {
    return { mode: "treasure", chapters: {} };
  }
}

function save(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export function useMapQuestState() {
  const [state, setState] = useState(load);

  const setMode = useCallback((mode) => {
    setState((s) => {
      const next = { ...s, mode };
      save(next);
      return next;
    });
  }, []);

  const completeChapter = useCallback((chapterKey, outputs = {}) => {
    setState((s) => {
      const chapters = {
        ...s.chapters,
        [chapterKey]: {
          ...(s.chapters[chapterKey] || {}),
          complete: true,
          outputs,
        },
      };
      const next = { ...s, chapters };
      save(next);
      return next;
    });
  }, []);

  const isChapterComplete = useCallback(
    (chapterKey) => {
      if (state.chapters[chapterKey]?.complete) return true;

      // Earlier builds keyed quest completion by milestone id. Keep this small
      // bridge so existing local saves still light up the first two chapters.
      const legacyIndex = LEGACY_MILESTONE_KEYS.indexOf(chapterKey);
      if (legacyIndex < 0) return false;
      return Object.values(state.chapters).some((chapter, index) => index === legacyIndex && chapter?.complete);
    },
    [state.chapters]
  );

  const getChapterOutputs = useCallback(
    (chapterKey) => state.chapters[chapterKey]?.outputs || {},
    [state.chapters]
  );

  // Returns the active broke_king shadow if chapter 2 was completed
  const getBrokeKingShadow = useCallback(() => {
    const entries = Object.values(state.chapters);
    for (const ch of entries) {
      if (ch?.outputs?.shadowMask === "broke_king" && ch.complete) return ch.outputs;
    }
    return null;
  }, [state.chapters]);

  return {
    mode: state.mode,
    setMode,
    completeChapter,
    isChapterComplete,
    getChapterOutputs,
    getBrokeKingShadow,
  };
}

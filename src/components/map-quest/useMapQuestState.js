import { useState, useCallback } from "react";

const STORAGE_KEY = "milestone-quest:mode-v1";
const LEGACY_MILESTONE_KEYS = ["chapter-anchor", "chapter-shadow"];

// The Progression Dashboard seed (see alchemist/08_ALCHEMIST_COMPANION_GUIDE.md).
const DEFAULT_DASHBOARD = {
  stage: "Ordinary World",
  purpose: 3, faith: 4, fear: 3, courage: 4, trust: 4,
};

function blank() {
  return { mode: "treasure", chapters: {}, dayOne: {}, dashboard: { ...DEFAULT_DASHBOARD } };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blank();
    return { ...blank(), ...JSON.parse(raw) };
  } catch {
    return blank();
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

  // All saved outputs, keyed by chapter key (used by Ch17 naming + Ch19 Vault).
  const getAllOutputs = useCallback(() => {
    const out = {};
    for (const [key, ch] of Object.entries(state.chapters)) {
      if (ch?.outputs) out[key] = ch.outputs;
    }
    return out;
  }, [state.chapters]);

  // ── Day-One Snapshot (captured Ch1–2, mirrored at Ch19 The Vault) ──────────
  const setDayOneSnapshot = useCallback((snap = {}) => {
    setState((s) => {
      const next = { ...s, dayOne: { ...s.dayOne, ...snap } };
      save(next);
      return next;
    });
  }, []);

  const getDayOneSnapshot = useCallback(() => state.dayOne || {}, [state.dayOne]);

  // ── Shadow getters (generalized from the old broke_king-only helper) ───────
  // A chapter's outputs flag their shadow via `shadow` (new) or `shadowMask` (old).
  const shadowTypeOf = (outputs) => outputs?.shadow || outputs?.shadowMask || null;

  const getAllShadows = useCallback(() => {
    const shadows = [];
    for (const ch of Object.values(state.chapters)) {
      const type = ch?.complete ? shadowTypeOf(ch.outputs) : null;
      if (type) shadows.push({ type, ...ch.outputs });
    }
    return shadows;
  }, [state.chapters]);

  const getShadow = useCallback(
    (type) => getAllShadows().find((s) => s.type === type) || null,
    [getAllShadows]
  );

  // Back-compat: the original single-shadow helper.
  const getBrokeKingShadow = useCallback(() => getShadow("broke_king"), [getShadow]);

  // ── Progression Dashboard meters ──────────────────────────────────────────
  const getDashboard = useCallback(
    () => ({ ...DEFAULT_DASHBOARD, ...state.dashboard }),
    [state.dashboard]
  );

  const updateDashboard = useCallback((partial = {}) => {
    setState((s) => {
      const next = { ...s, dashboard: { ...DEFAULT_DASHBOARD, ...s.dashboard, ...partial } };
      save(next);
      return next;
    });
  }, []);

  return {
    mode: state.mode,
    setMode,
    completeChapter,
    isChapterComplete,
    getChapterOutputs,
    getAllOutputs,
    setDayOneSnapshot,
    getDayOneSnapshot,
    getAllShadows,
    getShadow,
    getBrokeKingShadow,
    getDashboard,
    updateDashboard,
  };
}

import { useState, useRef, useCallback } from "react";

// One store for all of Shadow Work: the reflection trail, the streak, and the
// collected essences (Gallery). Kept independent of the global app store so the
// feature stays self-contained; XP / achievements still flow through useAppData.
const KEY = "shadow_work_v2";
const LEGACY_TAKEAWAYS = "shadow_work_takeaways_v1";

const EMPTY = { takeaways: [], essences: [], streak: { current: 0, longest: 0, last: null }, completions: {} };

function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
function isYesterday(last) {
  if (!last) return false;
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return last === dayKey(d);
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw && typeof raw === "object") return { ...EMPTY, ...raw };
  } catch {}
  // migrate legacy trail if present
  try {
    const old = JSON.parse(localStorage.getItem(LEGACY_TAKEAWAYS) || "[]");
    if (Array.isArray(old) && old.length) return { ...EMPTY, takeaways: old.slice(0, 24) };
  } catch {}
  return { ...EMPTY };
}
function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

export function useShadowWork() {
  const [state, setState] = useState(load);
  // Ref mirrors committed state so recordCompletion can compute its result
  // synchronously (the return value drives the celebration that fires now).
  const ref = useRef(state);
  ref.current = state;

  const recordCompletion = useCallback(({ tool, takeaway, essence }) => {
    const prev = ref.current;
    const today = dayKey();

    const streak = { ...prev.streak };
    let newStreak = false;
    if (streak.last !== today) {
      streak.current = isYesterday(streak.last) ? (streak.current || 0) + 1 : 1;
      streak.last = today;
      streak.longest = Math.max(streak.longest || 0, streak.current);
      newStreak = true;
    }

    let essences = prev.essences || [];
    let newEssence = false;
    if (essence && essence.maskId && !essences.some((e) => e.maskId === essence.maskId)) {
      essences = [{ ...essence, at: Date.now() }, ...essences];
      newEssence = true;
    }

    const takeaways = [{ tool, takeaway, at: Date.now() }, ...(prev.takeaways || [])].slice(0, 24);
    const completions = { ...prev.completions, [tool]: (prev.completions?.[tool] || 0) + 1 };
    const next = { takeaways, essences, streak, completions };
    ref.current = next;
    setState(next);
    save(next);
    return { streak: streak.current, newStreak, newEssence };
  }, []);

  const clearTrail = useCallback(() => {
    const next = { ...ref.current, takeaways: [] };
    ref.current = next;
    setState(next);
    save(next);
  }, []);

  return { ...state, recordCompletion, clearTrail };
}

import { useState, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────
// Detailed session log for Anxiety Wave Rider. Kept separate from
// `shadow_work_v2` (which holds the reflection trail + streak) so the richer
// per-session data — intensity before/after, breath cycles, proof action —
// lives on its own. Mirrors the load/save + useRef pattern of useShadowWork.
// ─────────────────────────────────────────────────────────────────────────
const KEY = "anxiety_wave_v1";
const MAX = 60;

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (Array.isArray(raw)) return raw;
  } catch {}
  return [];
}
function save(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

// Small non-crypto id — timestamp + random suffix is plenty for a local log.
function makeId() {
  return `wave_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function useWaveSessions() {
  const [sessions, setSessions] = useState(load);
  const ref = useRef(sessions);
  ref.current = sessions;

  // Persist a completed (or exited) session. Returns the saved record plus the
  // running completed-count so the caller can pick the right achievement.
  const recordSession = useCallback((data) => {
    const record = {
      id: makeId(),
      startedAt: data.startedAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      mode: "sos",
      breathPattern: data.breathPattern || null,
      completed: data.completed !== false,
      breathCyclesAttempted: data.breathCyclesAttempted || 0,
      breathCyclesCompleted: data.breathCyclesCompleted || 0,
      groundingCardsTapped: data.groundingCardsTapped || 0,
      bodyReleaseChosen: data.bodyReleaseChosen || null,
      proofActionChosen: data.proofActionChosen || null,
      courageXpEarned: data.courageXpEarned || 0,
      intensityBefore: data.intensityBefore ?? null,
      intensityAfter: data.intensityAfter ?? null,
    };
    const next = [record, ...ref.current].slice(0, MAX);
    ref.current = next;
    setSessions(next);
    save(next);
    const completedCount = next.filter((s) => s.completed).length;
    return { record, completedCount };
  }, []);

  return { sessions, count: sessions.length, recordSession };
}

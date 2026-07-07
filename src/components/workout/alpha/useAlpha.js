import { useCallback, useEffect, useRef, useState } from "react";
import { safeLoad, safeSave } from "../../../lib/storage.js";
import { fetchAlpha, upsertState, createEvent } from "../../../lib/alphaService.js";
import { initDials, applyAction } from "./engine/hormones.js";

/* ALPHA MODE data hook.
   Local-first like useWorkout: paint from cache, reconcile from
   Supabase, optimistic writes with client-minted ids. State shape:
   { phase, week, stage, bodyWeight, bodyFat, archetype, flags, hormones }
   plus an events list (append-only, newest first). */

const CACHE_KEY = "alpha_mode_cache_v1";

const newId = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}-4000-8000-${Math.random().toString(16).slice(2, 14)}`;

const emptyState = {
  phase: "prime",
  week: 1,
  stage: 1,
  bodyWeight: null,
  bodyFat: null,
  archetype: null,
  flags: {},
  hormones: initDials(),
};

const emptyData = { state: emptyState, events: [] };

/* db row (snake_case) ↔ local state (camelCase) */
const fromRow = (row) => ({
  phase: row.phase ?? "prime",
  week: row.week ?? 1,
  stage: row.stage ?? 1,
  bodyWeight: row.body_weight ?? null,
  bodyFat: row.body_fat ?? null,
  archetype: row.archetype ?? null,
  flags: row.flags ?? {},
  hormones: { ...initDials(), ...(row.hormones ?? {}) },
});

const toRow = (s) => ({
  phase: s.phase,
  week: s.week,
  stage: s.stage,
  body_weight: s.bodyWeight,
  body_fat: s.bodyFat,
  archetype: s.archetype,
  flags: s.flags,
  hormones: s.hormones,
});

export function useAlpha(userId) {
  const [data, setData] = useState(() => {
    const cached = safeLoad(CACHE_KEY, emptyData);
    return {
      state: { ...emptyState, ...(cached.state || {}) },
      events: cached.events || [],
    };
  });
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
      const { data: cloud } = await fetchAlpha(userId);
      if (!alive) return;
      if (cloud) {
        commit((prev) => ({
          state: cloud.state ? fromRow(cloud.state) : prev.state,
          events: cloud.events.length ? cloud.events : prev.events,
        }));
      }
      setLoaded(true);
    })();
    return () => { alive = false; };
  }, [userId, commit]);

  /* ── state patch (optimistic upsert) ── */
  const patchState = useCallback((patch) => {
    commit((prev) => ({ ...prev, state: { ...prev.state, ...patch } }));
    upsertState(userId, toRow({ ...dataRef.current.state, ...patch }));
  }, [userId, commit]);

  /* ── event log (append-only) ── */
  const logEvent = useCallback((kind, payload = {}) => {
    const row = { id: newId(), kind, payload, created_at: new Date().toISOString() };
    commit((prev) => ({ ...prev, events: [row, ...prev.events] }));
    createEvent(userId, row);
    return row;
  }, [userId, commit]);

  /* ── high-level rituals ── */

  const answerCall = useCallback(() => {
    if (dataRef.current.state.flags.callAnswered) return;
    patchState({ flags: { ...dataRef.current.state.flags, callAnswered: true }, stage: 2 });
    logEvent("call");
  }, [patchState, logEvent]);

  const forgeCharacter = useCallback(({ bodyWeight, bodyFat, archetype }) => {
    patchState({
      bodyWeight,
      bodyFat,
      archetype: archetype ?? dataRef.current.state.archetype,
      stage: Math.max(dataRef.current.state.stage, 4),
      flags: { ...dataRef.current.state.flags, forged: true },
    });
    logEvent("forge", { bodyWeight, bodyFat });
  }, [patchState, logEvent]);

  const moveHormones = useCallback((action) => {
    const next = applyAction(dataRef.current.state.hormones, action);
    patchState({ hormones: next });
    return next;
  }, [patchState]);

  return {
    loaded,
    state: data.state,
    events: data.events,
    patchState,
    logEvent,
    answerCall,
    forgeCharacter,
    moveHormones,
  };
}

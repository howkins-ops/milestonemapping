import { useCallback, useEffect, useRef, useState } from "react";
import { safeLoad, safeSave } from "../../lib/storage.js";
import {
  fetchWorkout,
  createPlan as dbCreatePlan,
  updatePlan as dbUpdatePlan,
  deletePlan as dbDeletePlan,
  createSession as dbCreateSession,
  createPR as dbCreatePR,
  setCreedSeen as dbSetCreedSeen,
} from "../../lib/workoutService.js";

/* THE IRON data hook.
   Local-first: paints instantly from a localStorage cache, then loads
   the truth from Supabase and reconciles. Writes are optimistic — ids
   are minted client-side so the local row and the persisted row are
   the same row. Every mutation re-caches, so offline sessions survive
   a reload too. (Same contract as useFieldJournal.) */

const CACHE_KEY = "iron_workout_cache_v1";

const newId = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}-4000-8000-${Math.random().toString(16).slice(2, 14)}`;

const emptyData = { plans: [], sessions: [], prs: [], creedSeen: false };

export function useWorkout(userId) {
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
      const { data: cloud } = await fetchWorkout(userId);
      if (!alive) return;
      if (cloud) {
        commit(() => ({
          plans: cloud.plans,
          sessions: cloud.sessions,
          prs: cloud.prs,
          creedSeen: Boolean(cloud.state?.creed_seen),
        }));
      }
      setLoaded(true);
    })();
    return () => { alive = false; };
  }, [userId, commit]);

  /* ── mutations (optimistic) ── */

  const addPlan = useCallback((plan) => {
    const row = {
      id: newId(),
      name: plan.name,
      focus: plan.focus || null,
      steel: plan.steel || "gunmetal",
      emblem: plan.emblem || "▲",
      exercises: plan.exercises ?? [],
      position: dataRef.current.plans.length,
      created_at: new Date().toISOString(),
    };
    commit((prev) => ({ ...prev, plans: [...prev.plans, row] }));
    dbCreatePlan(userId, row);
    return row;
  }, [userId, commit]);

  const patchPlan = useCallback((planId, patch) => {
    commit((prev) => ({
      ...prev,
      plans: prev.plans.map((p) => (p.id === planId ? { ...p, ...patch } : p)),
    }));
    dbUpdatePlan(userId, planId, patch);
  }, [userId, commit]);

  const removePlan = useCallback((planId) => {
    commit((prev) => ({ ...prev, plans: prev.plans.filter((p) => p.id !== planId) }));
    dbDeletePlan(userId, planId);
  }, [userId, commit]);

  const addSession = useCallback((session) => {
    const row = {
      id: newId(),
      plan_id: session.plan_id ?? null,
      plan_name: session.plan_name || null,
      duration_s: session.duration_s ?? 0,
      total_volume: session.total_volume ?? 0,
      total_sets: session.total_sets ?? 0,
      exercises: session.exercises ?? [],
      note: session.note || null,
      created_at: new Date().toISOString(),
    };
    commit((prev) => ({ ...prev, sessions: [row, ...prev.sessions] }));
    dbCreateSession(userId, row);
    return row;
  }, [userId, commit]);

  const addPR = useCallback((pr) => {
    const row = {
      id: newId(),
      exercise: pr.exercise,
      weight: pr.weight,
      reps: pr.reps ?? 1,
      session_id: pr.session_id ?? null,
      created_at: new Date().toISOString(),
    };
    commit((prev) => ({ ...prev, prs: [row, ...prev.prs] }));
    dbCreatePR(userId, row);
    return row;
  }, [userId, commit]);

  const markCreedSeen = useCallback(() => {
    if (dataRef.current.creedSeen) return;
    commit((prev) => ({ ...prev, creedSeen: true }));
    dbSetCreedSeen(userId, true);
  }, [userId, commit]);

  return {
    loaded,
    plans: data.plans,
    sessions: data.sessions,
    prs: data.prs,
    creedSeen: data.creedSeen,
    addPlan,
    patchPlan,
    removePlan,
    addSession,
    addPR,
    markCreedSeen,
  };
}

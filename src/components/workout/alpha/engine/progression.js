/* ALPHA MODE — campaign progression.
   Program-week based, not calendar based: a week advances when its
   scheduled workouts are done. Stages map onto phase+week per the
   Hero's Journey spine. Pure functions over session history + state. */

import { PHASES, PHASE_ORDER } from "../data/phases.js";

/* how many actual workouts (not cardio/rest) the rotation schedules */
export function scheduledWorkoutCount(phaseId, week) {
  const phase = PHASES[phaseId];
  if (!phase) return 0;
  const row = phase.rotation[Math.min(Math.max(week, 1), 4) - 1];
  return row.filter((c) => c && c !== "cardio").length;
}

/* distinct campaign workouts completed for this phase+week */
export function completedThisWeek(sessions, phaseId, week) {
  const ids = new Set();
  for (const s of sessions || []) {
    const a = s.meta?.alpha;
    if (a && a.phaseId === phaseId && a.week === week && a.workoutId) ids.add(a.workoutId);
  }
  return ids.size;
}

export function weekComplete(sessions, phaseId, week) {
  const need = scheduledWorkoutCount(phaseId, week);
  return need > 0 && completedThisWeek(sessions, phaseId, week) >= need;
}

/* Hero's Journey stage for a phase position */
export function stageFor(phaseId, week) {
  switch (phaseId) {
    case "prime": return 5;
    case "adapt": return 6;
    case "surge": return week >= 3 ? 8 : 7;
    case "complete": return week >= 3 ? 10 : 9;
    default: return 5;
  }
}

/* advance one week; returns the next {phase, week, stage, events[]}
   or {done: true} when COMPLETE week 4 closes (→ Apotheosis). */
export function advance(state) {
  const { phase, week } = state;
  if (week < 4) {
    const nextWeek = week + 1;
    return {
      phase,
      week: nextWeek,
      stage: stageFor(phase, nextWeek),
      events: [{ kind: "week_complete", payload: { phaseId: phase, week } }],
    };
  }
  const idx = PHASE_ORDER.indexOf(phase);
  const next = PHASE_ORDER[idx + 1];
  const events = [
    { kind: "week_complete", payload: { phaseId: phase, week } },
    { kind: "phase_complete", payload: { phaseId: phase } },
  ];
  if (!next) return { done: true, stage: 11, events };
  return { phase: next, week: 1, stage: stageFor(next, 1), events };
}

/* hormone action key for a workout style */
export const actionForStyle = (style) =>
  ({ mrt: "train_mrt", density: "train_density", tempo: "train_tempo", strength: "train_heavy", rotation: "train_heavy" }[style] || "train_mrt");

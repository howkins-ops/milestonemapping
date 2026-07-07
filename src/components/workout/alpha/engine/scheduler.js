/* ALPHA MODE — the rotating scheduler.
   phase + week (1-4) + day (0=Mon…6=Sun) → what today is:
   a workout card, rest, cardio, plus the day's nutrition flags
   (workout-day macros? cheat day? full-fast day?). The rotation
   tables live in data/phases.js. */

import { PHASES, WORKOUTS } from "../data/phases.js";

export function daySlot(phaseId, week, dayIdx) {
  const phase = PHASES[phaseId];
  if (!phase) return null;
  const w = Math.min(Math.max(week, 1), 4) - 1;
  const d = Math.min(Math.max(dayIdx, 0), 6);
  const cell = phase.rotation[w][d];

  const nd = phase.nutritionDays || {};
  const cheat =
    nd.cheat === d &&
    (nd.cheatFromWeek ? week >= nd.cheatFromWeek : true) &&
    !(nd.noCheatFinalWeek && week === 4);
  const fullFast =
    nd.fullFast === d && (nd.fastFromWeek ? week >= nd.fastFromWeek : false);

  let kind = "rest";
  let workout = null;
  if (cell === "cardio") kind = "cardio";
  else if (cell) {
    kind = "workout";
    workout = WORKOUTS[`${phaseId}-${cell}`] || null;
  }

  return {
    kind,
    workoutId: workout ? workout.id : null,
    workout,
    nutrition: {
      isWorkoutDay: kind === "workout",
      cheat,
      fullFast,
      fasting: `${phase.fasting.fastHours}/${phase.fasting.eatHours}`,
    },
  };
}

export function weekGrid(phaseId, week) {
  return Array.from({ length: 7 }, (_, d) => daySlot(phaseId, week, d));
}

/* JS Date.getDay() is Sun=0 — our tables are Mon=0 */
export const dayIdxFromDate = (date = new Date()) => (date.getDay() + 6) % 7;

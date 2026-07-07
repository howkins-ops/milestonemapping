/* ALPHA MODE — the Eating Equation engine.
   Pure functions. Reproduces the bible's worked examples:
   200 lb @ 20% BF → 160 LBM → ×14 → 2,240 maintenance;
   PRIME wk1 workout day → 1,940 cal / 128p / 30c / ~145f;
   COMPLETE workout day → 2,540 cal / 240p / 160c / ~104f.
   (Fat rounds to the nearest gram; the source rounds inconsistently
   by ±1g, so treat fat as ±1.) */

import { MAINTENANCE_CHART, PHASES } from "../data/phases.js";

export function leanBodyMass(weightLb, bodyFatPct) {
  return weightLb * (1 - bodyFatPct / 100);
}

export function maintenanceMultiplier(bodyFatPct) {
  for (const row of MAINTENANCE_CHART) {
    if (bodyFatPct <= row.maxBF) return row.mult;
  }
  return MAINTENANCE_CHART[MAINTENANCE_CHART.length - 1].mult;
}

export function maintenanceCalories(weightLb, bodyFatPct) {
  return Math.round(leanBodyMass(weightLb, bodyFatPct) * maintenanceMultiplier(bodyFatPct));
}

/* macro targets for one day.
   phaseId: prime|adapt|surge|complete · week: 1-4 · isWorkoutDay: bool */
export function dayMacros({ weightLb, bodyFatPct, phaseId = "prime", week = 1, isWorkoutDay = true }) {
  const phase = PHASES[phaseId];
  if (!phase) return null;
  const lbm = leanBodyMass(weightLb, bodyFatPct);
  const maintenance = maintenanceCalories(weightLb, bodyFatPct);
  const side = isWorkoutDay ? phase.eating.workout : phase.eating.rest;

  const calories = Math.round(maintenance + side.calDelta);
  const protein = Math.round(lbm * side.proteinPerLBM);

  const carbCfg = phase.eating.carbs;
  const wIdx = Math.min(Math.max(week, 1), 4) - 1;
  const carbs = carbCfg.type === "grams"
    ? (isWorkoutDay ? carbCfg.workout[wIdx] : carbCfg.rest[wIdx])
    : Math.round(lbm * (isWorkoutDay ? carbCfg.workout : carbCfg.rest));

  const fat = Math.max(0, Math.round((calories - (protein + carbs) * 4) / 9));

  return { lbm: Math.round(lbm), maintenance, calories, protein, carbs, fat };
}

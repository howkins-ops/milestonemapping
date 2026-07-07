/* ALPHA MODE — benchmark ladders (COMPLETE endgame).
   Numeric rungs per lift, not vague goals: plate-math jumps
   (…95 → 135 → 185 → 225, then +25s forever). Fed from the
   PR wall (workout_prs history). */

const BASE_RUNGS = [45, 95, 135, 185, 225];
const STEP_AFTER = 25;

/* full rung list up to (and including) the first rung above `best` */
export function rungsFor(best) {
  const rungs = [...BASE_RUNGS];
  while (rungs[rungs.length - 1] <= best) rungs.push(rungs[rungs.length - 1] + STEP_AFTER);
  return rungs;
}

export const currentRung = (best) => {
  const hit = rungsFor(best).filter((r) => r <= best);
  return hit.length ? hit[hit.length - 1] : null;
};

export const nextRung = (best) => rungsFor(best).find((r) => r > best) ?? null;

/* a new PR crossed a rung? returns the rung or null */
export function crossedRung(prevBest, newBest) {
  if (newBest <= prevBest) return null;
  const crossed = rungsFor(newBest).filter((r) => r > prevBest && r <= newBest);
  return crossed.length ? crossed[crossed.length - 1] : null;
}

/* build ladder cards from PR rows: best per exercise, weighted lifts only */
export function ladderLifts(prs) {
  const best = new Map();
  for (const p of prs || []) {
    const k = String(p.exercise || "").trim();
    if (!k || !(p.weight > 0)) continue;
    const cur = best.get(k);
    if (!cur || p.weight > cur.weight) best.set(k, p);
  }
  return [...best.entries()]
    .filter(([, p]) => p.weight >= 45)
    .sort((a, b) => b[1].weight - a[1].weight)
    .map(([name, p]) => ({
      lift: name,
      best: p.weight,
      reps: p.reps,
      rungs: rungsFor(p.weight),
      current: currentRung(p.weight),
      next: nextRung(p.weight),
    }));
}

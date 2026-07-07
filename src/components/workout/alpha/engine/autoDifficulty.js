/* ALPHA MODE — auto-difficulty.
   The load-selection rule from the lifting protocol, generalized:
   across a working block, total reps under 14 → the load is too heavy;
   25 or more → too light; otherwise hold. Reusable on any scalable stat. */

export const REP_FLOOR = 14;
export const REP_CEILING = 25;

export function assessBlock(totalReps) {
  if (totalReps < REP_FLOOR) {
    return {
      verdict: "lower",
      deltaPct: -10,
      line: "The bar won the round — drop the load ~10% and take it back.",
    };
  }
  if (totalReps >= REP_CEILING) {
    return {
      verdict: "raise",
      deltaPct: 5,
      line: "Too easy for you now. Load the bar — up ~5%.",
    };
  }
  return {
    verdict: "hold",
    deltaPct: 0,
    line: "Right in the forge zone. Same load next time.",
  };
}

/* apply a verdict to a weight, snapped to the nearest gym increment */
export function suggestWeight(currentWeight, verdict, increment = 5) {
  if (!currentWeight || verdict.deltaPct === 0) return currentWeight;
  const raw = currentWeight * (1 + verdict.deltaPct / 100);
  return Math.max(0, Math.round(raw / increment) * increment);
}

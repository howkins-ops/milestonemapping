/* ALPHA MODE — density training engine (ADAPT).
   Work capacity = volume ÷ time. Progress happens WITHIN the workout:
   each block runs twice; the second run carries a weight bump
   (A +5–10%, B +3–5%, C holds) and tries to beat the first run's
   volume. Pure math — the meter UI reads these. */

export const blockVolume = (turns) =>
  (turns || []).reduce((s, t) => s + (t.weight > 0 ? t.weight * t.reps : t.reps), 0);

export const workCapacity = (volume, seconds) =>
  seconds > 0 ? Math.round((volume / (seconds / 60)) * 10) / 10 : 0;

/* the bump prompt between block repeats */
export function bumpPrompt(blockDef, weight) {
  const [lo, hi] = blockDef.weightBumpPct || [0, 0];
  if (!lo && !hi) {
    return { lo: 0, hi: 0, suggested: weight, line: "Same load. Beat the clock instead." };
  }
  const mid = (lo + hi) / 2;
  const suggested = Math.max(0, Math.round((weight * (1 + mid / 100)) / 5) * 5);
  return {
    lo, hi, suggested,
    line: `Load it — up ${lo}–${hi}%. Then take back every rep.`,
  };
}

/* did the second run beat the first? */
export function beatsPrevious(currVolume, prevVolume) {
  if (!prevVolume) return { beat: false, marginPct: 0 };
  const marginPct = Math.round(((currVolume - prevVolume) / prevVolume) * 100);
  return { beat: currVolume > prevVolume, marginPct };
}

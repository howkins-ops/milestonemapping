/* ALPHA MODE — the Hormone Codex (character stat engine).
   Six dials, 0–100, higher = better regulated. Logged actions move
   them; a daily decay drifts everything gently toward 50 so the
   dials always reflect RECENT behavior. Pure reducer — game feel,
   not physiology claims. */

export const HORMONES = [
  { id: "ghrelin", label: "Ghrelin", role: "hunger", villain: "spikes on short sleep" },
  { id: "leptin", label: "Leptin", role: "fullness", villain: "fades in a long deficit" },
  { id: "cortisol", label: "Cortisol", role: "stress", villain: "the sleep-wrecker" },
  { id: "gh", label: "Growth Hormone", role: "rebuild", villain: "starved by late nights" },
  { id: "testosterone", label: "Testosterone", role: "drive", villain: "drained by inactivity" },
  { id: "insulin", label: "Insulin Sensitivity", role: "fat-storage dial", villain: "dulled by constant sugar" },
];

export const initDials = () =>
  Object.fromEntries(HORMONES.map((h) => [h.id, 50]));

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

function bump(dials, deltas) {
  const next = { ...dials };
  for (const [k, v] of Object.entries(deltas)) next[k] = clamp((next[k] ?? 50) + v);
  return next;
}

/* actions — the only ways the dials move */
export function applyAction(dials, action) {
  switch (action.kind) {
    case "sleep": {
      const h = action.hours ?? 7;
      if (h < 6) return bump(dials, { ghrelin: -8, leptin: -6, cortisol: -8, gh: -6 });
      if (h >= 7.5) return bump(dials, { ghrelin: +5, leptin: +4, cortisol: +6, gh: +7 });
      return bump(dials, { ghrelin: +2, leptin: +1, cortisol: +2, gh: +2 });
    }
    case "fast_complete":
      return bump(dials, { insulin: +6, gh: +4, ghrelin: +3 });
    case "train_mrt":
      return bump(dials, { insulin: +7, cortisol: +2, gh: +3 });
    case "train_density":
      return bump(dials, { testosterone: +7, insulin: +3, cortisol: +2 });
    case "train_tempo":
      return bump(dials, { gh: +7, cortisol: +4, testosterone: +2 });
    case "train_heavy":
      return bump(dials, { testosterone: +6, gh: +4 });
    case "cheat_day":
      return bump(dials, { leptin: +10, ghrelin: +3, cortisol: +3 });
    case "deficit_week":
      return bump(dials, { leptin: -6, cortisol: -3 });
    default:
      return dials;
  }
}

/* call once per elapsed day: drift toward 50 by 2 points/day */
export function decayDays(dials, days = 1) {
  const next = { ...dials };
  for (const h of HORMONES) {
    let v = next[h.id] ?? 50;
    for (let i = 0; i < days; i++) v = v > 50 ? Math.max(50, v - 2) : v < 50 ? Math.min(50, v + 2) : v;
    next[h.id] = v;
  }
  return next;
}

/* overall condition — a single readout for the character sheet */
export const condition = (dials) =>
  Math.round(
    HORMONES.reduce((s, h) => s + (dials[h.id] ?? 50), 0) / HORMONES.length
  );

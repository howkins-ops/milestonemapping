// ════════════════════════════════════════════════════════════════════════
// MILESTONE CITY — Atmosphere
// Pure helpers: the city's 4 evolution stages (driven by real rank) and the
// time-of-day palette (driven by the real local clock). No React, no RNG.
// ════════════════════════════════════════════════════════════════════════

export const STAGES = [
  {
    id: 1,
    key: "foundations",
    name: "Foundations",
    blurb: "Scaffolding and work-lights. A city waiting on its builder.",
    className: "mqc-stage-1",
  },
  {
    id: 2,
    key: "rising",
    name: "Rising Grid",
    blurb: "First neon on the skyline. The grid is catching current.",
    className: "mqc-stage-2",
  },
  {
    id: 3,
    key: "ascent",
    name: "Neon Ascent",
    blurb: "Trams running, windows burning. The city moves when you do.",
    className: "mqc-stage-3",
  },
  {
    id: 4,
    key: "metropolis",
    name: "Thriving Metropolis",
    blurb: "Aurora skies. The Spire beacon burns for everyone to see.",
    className: "mqc-stage-4",
  },
];

// Rank index (0=Starter … 6=Legend) → visual stage.
// 0 → 1 · 1-2 → 2 · 3-4 → 3 · 5-6 → 4
export function getCityStage(rankIndex) {
  const i = Number.isFinite(Number(rankIndex)) ? Math.max(0, Math.min(6, Math.round(Number(rankIndex)))) : 0;
  if (i >= 5) return STAGES[3];
  if (i >= 3) return STAGES[2];
  if (i >= 1) return STAGES[1];
  return STAGES[0];
}

const TOD = {
  dawn: { key: "dawn", label: "Dawn", className: "mqc-tod-dawn" },
  day: { key: "day", label: "Daylight", className: "mqc-tod-day" },
  dusk: { key: "dusk", label: "Dusk", className: "mqc-tod-dusk" },
  night: { key: "night", label: "Night", className: "mqc-tod-night" },
};

// Real local time → sky palette key. 5-8 dawn · 8-17 day · 17-21 dusk · night.
export function getTimeOfDay(date = new Date()) {
  const d = date instanceof Date && !isNaN(date) ? date : new Date();
  const h = d.getHours();
  if (h >= 5 && h < 8) return TOD.dawn;
  if (h >= 8 && h < 17) return TOD.day;
  if (h >= 17 && h < 21) return TOD.dusk;
  return TOD.night;
}

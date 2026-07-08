/* ALPHA MODE — today's plate, hour by hour.
   Generates an ordered list of eating time-blocks from the user's
   REAL eating window(s). Supports MULTIPLE windows a day (e.g. a
   morning window 7am–1pm plus a late window 9–10pm) — set
   state.flags.eatWindows. Falls back to the old single-window
   (windowOpenHour, or the book's noon→8pm) when unset, so nothing
   breaks for users who never customized. Portions round to 5g. */

import { dayMacros } from "./eatingEngine.js";
import { PHASES } from "../data/phases.js";
import { FOOD_CATEGORIES } from "../data/foods.js";

const r5 = (n) => Math.max(0, Math.round(n / 5) * 5);
const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);

/* "HH:MM" (or a bare number of hours) → decimal hours */
export function parseHM(str) {
  if (typeof str === "number") return str;
  const [h, m] = String(str).split(":").map(Number);
  return (h || 0) + (m || 0) / 60;
}
/* decimal hours → friendly clock ("7am", "1pm", "9:30pm") — no military time */
export function fmtClock(hDecimal) {
  let h = Math.floor(hDecimal);
  let min = Math.round((hDecimal - h) * 60);
  if (min === 60) { h += 1; min = 0; }
  h = ((h % 24) + 24) % 24;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = min === 0 ? "" : `:${String(min).padStart(2, "0")}`;
  return `${h12}${mm}${h < 12 ? "am" : "pm"}`;
}

const pickFrom = (catId, n = 4) => {
  const cat = FOOD_CATEGORIES.find((c) => c.id === catId);
  return cat ? cat.groups.flatMap((g) => g.items).slice(0, n) : [];
};

/* the default eating windows — a morning window + a late meal.
   Anyone can override in the editor (state.flags.eatWindows). */
export const DEFAULT_EAT_WINDOWS = [
  { start: "07:00", end: "13:00", label: "Morning" },
  { start: "21:00", end: "22:00", label: "Late" },
];

/* the user's eating window(s), normalized and sorted.
   Returns [{ startH, endH, start, end, label }].
   Custom windows live in state.flags.eatWindows (freeform flag — no migration);
   falls back to DEFAULT_EAT_WINDOWS. */
export function eatWindows(state) {
  const custom = state?.flags?.eatWindows;
  const raw = (Array.isArray(custom) && custom.length) ? custom : DEFAULT_EAT_WINDOWS;
  return raw
    .map((w) => {
      const startH = parseHM(w.start);
      let endH = parseHM(w.end);
      if (endH <= startH) endH += 24; // window crosses midnight — keep it sane
      return { startH, endH, start: fmtClock(startH), end: fmtClock(endH), _label: w.label };
    })
    .sort((a, b) => a.startH - b.startH)
    .map((w, i, arr) => ({
      startH: w.startH, endH: w.endH, start: w.start, end: w.end,
      label: w._label || (arr.length > 1 ? (i === 0 ? "Morning" : i === arr.length - 1 ? "Late" : `Window ${i + 1}`) : "Eating window"),
    }));
}

/* total fasting hours across the day = 24 − sum(window lengths) */
export function fastingHours(windows) {
  const eat = windows.reduce((sum, w) => sum + (w.endH - w.startH), 0);
  return Math.max(0, Math.round(24 - eat));
}

/* how many meals a window of `len` hours holds */
function mealsInWindow(len) {
  if (len <= 1.5) return 1;
  if (len <= 4.5) return 2;
  return 3;
}

export function mealTimeline({ state, slot }) {
  const phase = PHASES[state.phase];
  if (!phase || !state.bodyWeight) return null;

  /* cheat day — off the ledger entirely */
  if (slot?.nutrition.cheat) return { kind: "cheat" };

  const windows = eatWindows(state);
  const fastHrs = fastingHours(windows);
  const isWorkoutDay = Boolean(slot?.nutrition.isWorkoutDay);
  const m = dayMacros({
    weightLb: state.bodyWeight, bodyFatPct: state.bodyFat,
    phaseId: state.phase, week: state.week, isWorkoutDay,
  });
  if (!m) return null;

  /* full-fast day — the rail is the fast itself + the fallback */
  if (slot?.nutrition.fullFast) {
    return {
      kind: "fast",
      slots: [
        {
          id: "fast", time: "all day", icon: "⏳", title: "The full fast",
          line: "Water, black coffee, sparkling water — all free, all day. The furnace runs on stored fuel today.",
        },
        {
          id: "fallback", time: "if needed", icon: "🍽", title: "The 400-cal dinner fallback",
          line: "The fallback ALWAYS counts: one plain dinner — a palm of protein and the green wall — and the fast still stands. No guilt, no collapse.",
          picks: { protein: pickFrom("protein", 4), "free-veg": pickFrom("free-veg", 4) },
        },
      ],
    };
  }

  /* ── split the ledger across every meal in every window ── */
  const week = clamp(state.week, 1, 4);
  const carbCfg = phase.eating.carbs;
  const carbNote = carbCfg.type === "grams"
    ? (phase.eating.carbNotes?.[week - 1] || "post-workout only")
    : "post-workout first, the rest toward the evening";

  /* enumerate meal time-points across all windows */
  const points = [];
  windows.forEach((w, wi) => {
    const len = Math.max(0.5, w.endH - w.startH);
    const k = mealsInWindow(len);
    for (let j = 0; j < k; j++) {
      const hAt = k === 1 ? w.startH : w.startH + (len * j) / k;
      points.push({ hAt, windowLabel: w.label });
    }
  });
  const mealCount = points.length || 1;
  const lastIdx = mealCount - 1;

  const shakeP = isWorkoutDay ? Math.min(30, m.protein) : 0;
  const mealP = r5((m.protein - shakeP) / mealCount);
  const mealF = r5(m.fat / mealCount);
  /* carbs land LATE — post-workout on training days, and in the final meal */
  const lateCarbSplit = isWorkoutDay && m.carbs > 50;
  const postC = isWorkoutDay ? (lateCarbSplit ? r5(m.carbs * 0.6) : m.carbs) : 0;
  const lastMealC = Math.max(0, m.carbs - postC);

  const meal = (id, time, title, line, p, c, f, picks) => ({
    id, time, icon: "🍽", title, line, macros: { protein: p, carbs: c, fat: f }, picks,
  });

  const slots = [
    {
      id: "fast", time: `until ${windows[0].start}`, icon: "⏳", title: "The fast holds",
      line: `Your first meal is at ${windows[0].start}. Until then: water, black coffee, sparkling water — all free. Hunger is a message, not a command.`,
    },
  ];

  points.forEach((pt, i) => {
    const first = i === 0;
    const last = i === lastIdx;
    const title = first ? "Break the fast — Meal 1" : `${pt.windowLabel} · Meal ${i + 1}`;
    const carbsHere = last ? lastMealC : 0;
    const fatHere = last ? Math.max(0, m.fat - mealF * lastIdx) : mealF;
    const line = first
      ? "Protein anchor + the green wall. Carbs come later in the day — they're earned."
      : last
        ? (carbsHere > 0
            ? "Carbs land here on purpose — late carbs feed recovery and sleep, not the gut."
            : "Close the ledger: protein, greens, and the last of the fats.")
        : "Same shape: protein + greens. The green wall is unlimited — eat it loud.";
    slots.push(meal(`meal${i + 1}`, fmtClock(pt.hAt), title, line, mealP, carbsHere, fatHere, {
      protein: pickFrom("protein", 4), "free-veg": pickFrom("free-veg", 4),
      ...(carbsHere > 0 ? { carb: pickFrom("carb", 4) } : { fat: pickFrom("fat", 3) }),
    }));

    /* post-workout window right after the first meal, on training days */
    if (first && isWorkoutDay) {
      slots.push({
        id: "post", time: "after training", icon: "⚡", title: "The post-workout window",
        line: `This week's carb rule: ${carbNote}.`,
        macros: { protein: shakeP, carbs: postC, fat: 0 },
        picks: { protein: ["Protein powder"], carb: postC > 0 ? pickFrom("carb", 4) : [] },
      });
    }
  });

  slots.push({
    id: "close", time: windows[windows.length - 1].end, icon: "🌙", title: "The window closes",
    line: `Kitchen's shut. The ${fastHrs}-hour fast starts now — the deepest burn happens while you sleep.`,
  });

  const windowsLabel = windows.map((w) => `${w.start}–${w.end}`).join(" · ");
  return { kind: "day", isWorkoutDay, windows, windowsLabel, fastHours: fastHrs, macros: m, slots };
}

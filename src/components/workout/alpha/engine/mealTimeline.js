/* ALPHA MODE — today's plate, hour by hour.
   Pure function: phase rules + the day's macro ledger → an ordered
   list of time slots (the fast, each meal, the post-workout window,
   the close). Times assume the book's default 16:8 window of
   noon → 8pm; the slot copy keeps them soft ("first meal", "after
   training") so an off-schedule day still reads true.
   Guide-level game math — portions round to 5g. */

import { dayMacros } from "./eatingEngine.js";
import { PHASES } from "../data/phases.js";
import { FOOD_CATEGORIES } from "../data/foods.js";

const r5 = (n) => Math.max(0, Math.round(n / 5) * 5);
/* 24h hour → friendly 12-hour clock ("12pm", "4pm", "8pm") — no military time */
const fmt12 = (h) => {
  const hr = ((Math.round(h) % 24) + 24) % 24;
  const h12 = hr % 12 === 0 ? 12 : hr % 12;
  return `${h12}${hr < 12 ? "am" : "pm"}`;
};
const pickFrom = (catId, n = 4) => {
  const cat = FOOD_CATEGORIES.find((c) => c.id === catId);
  return cat ? cat.groups.flatMap((g) => g.items).slice(0, n) : [];
};

/* window times from the phase's fasting split (16:8 → 12:00–20:00) */
function eatWindow(phase) {
  const eatHours = phase?.fasting?.eatHours ?? 8;
  const start = 20 - eatHours; // anchor the close at 8pm, book-style
  return { startH: start, endH: 20, start: fmt12(start), end: fmt12(20), fastHours: phase?.fasting?.fastHours ?? 16 };
}

export function mealTimeline({ state, slot }) {
  const phase = PHASES[state.phase];
  if (!phase || !state.bodyWeight) return null;

  /* cheat day — off the ledger entirely */
  if (slot?.nutrition.cheat) return { kind: "cheat" };

  const win = eatWindow(phase);
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

  /* ── split the ledger across the window ── */
  const week = Math.min(Math.max(state.week, 1), 4);
  const carbCfg = phase.eating.carbs;
  const carbNote = carbCfg.type === "grams"
    ? (phase.eating.carbNotes?.[week - 1] || "post-workout only")
    : "post-workout first, the rest toward the evening";

  /* protein: shake takes ~30g on training days, meals split the rest */
  const shakeP = isWorkoutDay ? Math.min(30, m.protein) : 0;
  const mealP = r5((m.protein - shakeP) / 3);
  /* carbs: training day → post-workout (weeks 3-4 spill into the last meal);
     rest day → the final meal only ("carbs land late") */
  const lateCarbSplit = isWorkoutDay && m.carbs > 50;
  const postC = isWorkoutDay ? (lateCarbSplit ? r5(m.carbs * 0.6) : m.carbs) : 0;
  const finalC = isWorkoutDay ? m.carbs - postC : m.carbs;
  /* fats: split across the three meals, none in the shake */
  const mealF = r5(m.fat / 3);

  const meal = (id, time, title, line, p, c, f, picks) => ({
    id, time, icon: "🍽", title, line,
    macros: { protein: p, carbs: c, fat: f },
    picks,
  });

  const slots = [
    {
      id: "fast", time: `until ${win.start}`, icon: "⏳", title: "The fast holds",
      line: `Hour ${win.fastHours} closes at ${win.start}. Water, black coffee, sparkling water — all free. Hunger is a message, not a command.`,
    },
    meal("meal1", win.start, "Break the fast — Meal 1",
      "Protein anchor + the green wall. No carbs yet — they're earned later in the day.",
      mealP, 0, mealF,
      { protein: pickFrom("protein", 4), "free-veg": pickFrom("free-veg", 4), fat: pickFrom("fat", 3) }),
  ];

  if (isWorkoutDay) {
    slots.push({
      id: "post", time: "after training", icon: "⚡", title: "The post-workout window",
      line: `This week's carb rule: ${carbNote}.`,
      macros: { protein: shakeP, carbs: postC, fat: 0 },
      picks: { protein: ["Protein powder"], carb: postC > 0 ? pickFrom("carb", 4) : [] },
    });
  }

  slots.push(
    meal("meal2", fmt12(win.startH + Math.round((win.endH - win.startH) / 2)), "Meal 2 — hold the line",
      "Same shape as Meal 1: protein + greens. The green wall is unlimited — eat it loud.",
      mealP, 0, mealF,
      { protein: pickFrom("protein", 4), "free-veg": pickFrom("free-veg", 4), fat: pickFrom("fat", 3) }),
    meal("final", fmt12(win.endH - 1), "The final meal",
      finalC > 0
        ? "Carbs land here on purpose — late carbs feed recovery and sleep, not the gut."
        : "Close the ledger: protein, greens, and the last of the fats.",
      mealP, finalC, Math.max(0, m.fat - mealF * 2),
      {
        protein: pickFrom("protein", 4), "free-veg": pickFrom("free-veg", 4),
        ...(finalC > 0 ? { carb: pickFrom("carb", 4) } : { fat: pickFrom("fat", 3) }),
      }),
    {
      id: "close", time: win.end, icon: "🌙", title: "The window closes",
      line: `Kitchen's shut. The ${win.fastHours}-hour furnace starts now — the deepest burn happens while you sleep.`,
    },
  );

  return { kind: "day", isWorkoutDay, window: win, macros: m, slots };
}

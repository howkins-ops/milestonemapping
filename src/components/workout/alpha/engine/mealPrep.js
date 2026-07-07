/* ALPHA MODE — the Stockpile engine (Sunday meal prep).
   Turns the week's eating-equation targets into a grocery plan:
   how much protein/carb/fat to stock, expressed in shopper-friendly
   quantities, plus the prep checklist. Guide-level game math —
   heuristics from data/foods.js, not a nutrition database. */

import { dayMacros } from "./eatingEngine.js";
import { weekGrid } from "./scheduler.js";
import { GROCERY_HEURISTICS as H, FOOD_CATEGORIES, PREP_STEPS } from "../data/foods.js";

/* sum the week's macro targets from the real schedule */
export function weekTargets({ weightLb, bodyFatPct, phaseId, week }) {
  const grid = weekGrid(phaseId, week);
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, workoutDays: 0, cheatDay: false };
  for (const slot of grid) {
    if (slot.nutrition.cheat) { totals.cheatDay = true; continue; } // cheat day: off the ledger
    const m = dayMacros({ weightLb, bodyFatPct, phaseId, week, isWorkoutDay: slot.nutrition.isWorkoutDay });
    totals.calories += m.calories;
    totals.protein += m.protein;
    totals.carbs += m.carbs;
    totals.fat += m.fat;
    if (slot.nutrition.isWorkoutDay) totals.workoutDays += 1;
  }
  return totals;
}

/* the grocery plan: category quantities + suggested items to check off */
export function groceryPlan({ weightLb, bodyFatPct, phaseId, week }) {
  const t = weekTargets({ weightLb, bodyFatPct, phaseId, week });

  const meatLbs = Math.max(1, Math.round((t.protein * 0.8) / H.proteinPerLbMeat));
  const eggs = 12;
  const carbCups = Math.max(0, Math.round(t.carbs / H.carbsPerCupCooked));
  const fatServings = Math.max(0, Math.round(t.fat / H.fatPerServing));

  return {
    targets: t,
    lines: [
      {
        id: "protein", label: "Proteins",
        qty: `~${meatLbs} lbs meat/fish + ${eggs} eggs`,
        why: `${t.protein.toLocaleString()}g protein on the week's ledger`,
        picks: FOOD_CATEGORIES[0].groups.flatMap((g) => g.items).slice(0, 8),
      },
      {
        id: "free-veg", label: "Free Veggies",
        qty: `${H.freeVegBagsPerWeek}+ bags — the green wall`,
        why: "unlimited, never counted — keep it visible",
        picks: FOOD_CATEGORIES[1].groups[0].items.slice(0, 8),
      },
      {
        id: "carb", label: "Low-GI Carbs",
        qty: carbCups > 0 ? `~${carbCups} cooked cups, portioned to training days` : "none this week — the ramp is closed",
        why: `${t.carbs.toLocaleString()}g carbs, timed post-workout`,
        picks: FOOD_CATEGORIES[3].groups.flatMap((g) => g.items).slice(0, 8),
      },
      {
        id: "fat", label: "Fats",
        qty: `~${fatServings} servings (14g each)`,
        why: `${t.fat.toLocaleString()}g fat fills the remainder`,
        picks: FOOD_CATEGORIES[2].groups.flatMap((g) => g.items).slice(0, 8),
      },
    ],
    prepSteps: PREP_STEPS,
    cheatNote: t.cheatDay
      ? "Cheat day is on the board this week — buy NOTHING for it in advance. Same-day only."
      : null,
  };
}

/* Fill-Your-Fridge progress: checked items / total across the plan */
export function fridgeProgress(plan, checkedIds) {
  const all = plan.lines.length + plan.prepSteps.length;
  const done = checkedIds.size ?? checkedIds.length ?? 0;
  return Math.max(0, Math.min(1, done / all));
}

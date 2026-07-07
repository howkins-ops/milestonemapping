/* ALPHA MODE — the 7 Traits (light/shadow pairs).
   Same structural DNA as the app's Survival Mechanisms: every strength
   throws a shadow. Leveled in Phase 6 by behavior streaks, not by lifts. */

export const TRAITS = [
  {
    id: "helpful", n: 1, light: "Helpful", shadow: "Condescending",
    line: "Lift others without standing on them.",
    levelRule: "share a win or spot a squadmate in the Zone",
  },
  {
    id: "confident", n: 2, light: "Confident", shadow: "Cocky",
    line: "An honest read of what you can do — and what you can't yet.",
    levelRule: "log an honest miss without deleting the session",
  },
  {
    id: "vain", n: 3, light: "Vain", shadow: "Conceited",
    line: "Care for the vessel without worshiping the mirror.",
    levelRule: "complete a recovery / mobility day you wanted to skip",
  },
  {
    id: "prideful", n: 4, light: "Prideful", shadow: "Arrogant",
    line: "Proud of the work, never of the shortcut.",
    levelRule: "finish every set of a scheduled workout",
  },
  {
    id: "humble", n: 5, light: "Humble", shadow: "Self-loathing",
    line: "Small before the work, never small before the mirror.",
    levelRule: "lower the load when the engine says lower it",
  },
  {
    id: "tolerant", n: 6, light: "Tolerant", shadow: "Weak",
    line: "Patience is a held frame, not a dropped one.",
    levelRule: "complete a full rest interval without skipping",
  },
  {
    id: "dedicated", n: 7, light: "Dedicated", shadow: "Obsessed",
    line: "Show up relentlessly — and still go home.",
    levelRule: "train the scheduled days AND honor the off days",
  },
];

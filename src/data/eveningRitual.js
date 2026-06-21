// ─── Evening close-the-day ritual ───────────────────────────────────────────────
// The night counterpart to the morning gratitude wizard. Three short reflection
// beats (win · lesson · upgrade) close the loop on today, then a LIGHT night-time
// gratitude — a few brief thank-yous, nothing heavy. Research is clear: positive
// pre-sleep thoughts crowd out the racing, worried ones, so you fall asleep faster.
// Deliberately quick: at night the goal is to quiet the mind, not dig deep.

export const EVENING_STEPS = [
  {
    id: "win",
    kind: "reflect",
    field: "biggestWin",
    depth: true,
    accent: "#00FFBF",
    glyph: "★",
    kicker: "CLOSE THE DAY",
    title: "What was your biggest win today?",
    sub: "Any size. The thing you're proudest you did, finished, or showed up for.",
    placeholder: "Today I'm proud that I…",
    label: "Biggest win",
  },
  {
    id: "lesson",
    kind: "reflect",
    field: "lesson",
    depth: true,
    accent: "#FACC15",
    glyph: "🪞",
    kicker: "REFLECT",
    title: "What did today teach you?",
    sub: "Reflected-on experience is the real teacher. One honest lesson beats a perfect day.",
    placeholder: "What I learned today is…",
    label: "Biggest lesson",
  },
  {
    id: "upgrade",
    kind: "reflect",
    field: "tomorrowUpgrade",
    accent: "#FF3EDB",
    glyph: "⚡",
    kicker: "UPGRADE",
    title: "What will you upgrade tomorrow?",
    sub: "One small adjustment. Decide it now so tomorrow-you doesn't have to.",
    placeholder: "Tomorrow I'll…",
    label: "Tomorrow's upgrade",
  },
  {
    id: "gratitude",
    kind: "gratitude3",
    field: "nightGratitude",
    accent: "#00F0FF",
    glyph: "✦",
    kicker: "NIGHT GRATITUDE",
    title: "Three small good things from today.",
    sub: "Keep it light — a warm bed, a laugh, a good meal. Naming them quiets the mind so you drift off faster.",
    placeholders: [
      "One small good thing…",
      "Another little one…",
      "One more…",
    ],
    label: "Grateful for",
  },
];

// Shown on the reveal — the science that makes the night gratitude worth doing.
export const EVENING_IMPACT_STATS = [
  { label: "Fall asleep faster", value: "40%", color: "#00FFBF" },
  { label: "More sleep / night", value: "+30 min", color: "#00F0FF" },
  { label: "Day logged",         value: "+50 XP", color: "#FACC15" },
];

export const EVENING_ATTRIBUTION =
  "Wood et al., Journal of Psychosomatic Research (2009) · pre-sleep gratitude & sleep";

// Powerful Stands — coaching content for the Daily Stand wizard.
//
// The "Being & Worth", "Purpose & Integrity" and "Gratitude & Service" stands
// are drawn from the coaching doc "Powerful Stands" (Tex Johnston /
// Christopher McAuliffe), used with permission. The "Discipline & Resilience",
// "Money & Worth" and "Sales / Door-to-Door" themes are authored for this app.

export const STANDS_ATTRIBUTION = {
  source: "Powerful Stands",
  authors: "Tex Johnston / Christopher McAuliffe",
};

export const STAND_TEACHING = {
  whatItIs:
    "A stand is a present-tense declaration of who you are — an “I am…” you speak as already true. You don't earn it later. You take it now, and the day follows the story you set.",
  how: [
    "Get centered first — settle, take a breath, drop in.",
    "Declare it in the present tense, as being not doing: “I am…”, “I …”.",
    "Keep it short and chargeable — something you can actually feel.",
  ],
  examples: [
    "I am already worthy.",
    "I honor my words.",
    "I live my life on purpose.",
    "I choose being.",
  ],
};

export const STAND_THEMES = [
  {
    id: "being",
    label: "Being & Worth",
    accent: "var(--brand-purple)",
    sourced: true,
    stands: [
      "I trust myself as a gift.",
      "I am already worthy.",
      "I am my essence.",
      "I choose being.",
    ],
  },
  {
    id: "purpose",
    label: "Purpose & Integrity",
    accent: "var(--brand-cyan)",
    sourced: true,
    stands: [
      "I honor my words.",
      "I live my life on purpose.",
      "My life is about discovery and miracles.",
    ],
  },
  {
    id: "gratitude",
    label: "Gratitude & Service",
    accent: "var(--brand-green)",
    sourced: true,
    stands: [
      "I bring gratitude and joy to life today.",
      "Serving others gives me my being.",
    ],
  },
  {
    id: "discipline",
    label: "Discipline & Resilience",
    accent: "var(--brand-gold)",
    sourced: false,
    stands: [
      "I show up even when I don't feel like it.",
      "I choose growth over comfort.",
      "I keep my word to myself.",
    ],
  },
  {
    id: "money",
    label: "Money & Worth",
    accent: "var(--brand-green)",
    sourced: false,
    stands: [
      "Money moves through me.",
      "I am worthy of more.",
      "I create value everywhere I go.",
    ],
  },
  {
    id: "sales",
    label: "Sales / Door-to-Door",
    accent: "var(--brand-magenta)",
    sourced: false,
    stands: [
      "Every door is a gift.",
      "I am unattached to the outcome and fully present.",
      "My energy sets the tone before I speak.",
      "A no moves me closer to a yes.",
    ],
  },
];

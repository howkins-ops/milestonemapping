// ─── Gratitude flavors ─────────────────────────────────────────────────────────
// Four distinct *kinds* of gratitude. The user picks one from the selector, then
// drops into a wizard whose layers, voice, and accent are unique to that flavor —
// so the ritual feels different every time instead of one fixed script.
//
// Each type is exactly 3 layers so it maps cleanly onto the existing storage
// schema { entry1, entry2, entry3 }. The first layer carries depth coaching
// (depth: true) — research is clear that elaborating on ONE specific thing beats
// a shallow list. `labels` drives both the reveal and the locked-in card.

export const GRATITUDE_TYPES = [
  {
    id: "people",
    label: "The Person",
    tagline: "Someone who shaped you",
    accent: "#00FFBF",
    glyph: "✦",
    blurb: "One person, one real moment — then feel what life would be without them.",
    labels: ["The person", "If we'd never met", "What I'd say"],
    layers: [
      {
        depth: true,
        kicker: "THE PERSON",
        title: "Who's one person you're grateful for?",
        sub: "Pick one person. What's one real thing they did for you? When did it happen?",
        placeholder: "One person — and one thing they did…",
      },
      {
        kicker: "IMAGINE THEM GONE",
        title: "What if you'd never met them?",
        sub: "Picture your life if they were never in it. What would be missing right now?",
        placeholder: "Without them, I wouldn't have…",
      },
      {
        kicker: "SAY IT",
        title: "What would you tell them?",
        sub: "If they were standing right here, what would you say?",
        placeholder: "I'd tell them…",
      },
    ],
  },
  {
    id: "comeback",
    label: "The Comeback",
    tagline: "The gift inside a hard thing",
    accent: "#FF8A3D",
    glyph: "⚒",
    blurb: "Take the thing that nearly broke you and find what it forged in you.",
    labels: ["The hard time", "What it taught me", "How it helps now"],
    layers: [
      {
        depth: true,
        kicker: "THE HARD TIME",
        title: "What's one hard time you're grateful for?",
        sub: "A tough time you got through — yesterday, last week, years ago. What happened?",
        placeholder: "A hard time I made it through was…",
      },
      {
        kicker: "WHAT IT GAVE YOU",
        title: "What did it teach you?",
        sub: "What are you better at now because you lived through it?",
        placeholder: "It taught me…",
      },
      {
        kicker: "THE PROOF",
        title: "How does it help you now?",
        sub: "Name one thing you can do today, or one way you help others, because of it.",
        placeholder: "Now I can…",
      },
    ],
  },
  {
    id: "overlooked",
    label: "The Overlooked",
    tagline: "Ordinary magic you stopped noticing",
    accent: "#A78BFA",
    glyph: "◈",
    blurb: "The everyday stuff you'd miss instantly if it vanished. Make it vivid again.",
    labels: ["The little thing", "Without it", "Before I had it"],
    layers: [
      {
        depth: true,
        kicker: "THE LITTLE THING",
        title: "What's one everyday thing you're grateful for?",
        sub: "Something small you usually don't notice — your bed, hot water, your phone, a snack. Pick one.",
        placeholder: "One everyday thing is…",
      },
      {
        kicker: "IMAGINE IT GONE",
        title: "What if it was gone tomorrow?",
        sub: "How would your day be harder without it?",
        placeholder: "Without it, my day would…",
      },
      {
        kicker: "BACK THEN",
        title: "Remember life before you had it?",
        sub: "There was a time you didn't have this. What was that like?",
        placeholder: "Before I had it…",
      },
    ],
  },
  {
    id: "future",
    label: "The Future Self",
    tagline: "Grateful in advance",
    accent: "#FACC15",
    glyph: "☄",
    blurb: "Pull gratitude forward — for who you're becoming and what's already in motion.",
    labels: ["What's coming", "Why it matters", "My first step"],
    layers: [
      {
        depth: true,
        kicker: "WHAT'S COMING",
        title: "What's one good thing coming that you're grateful for?",
        sub: "Something you're looking forward to — soon or far away. What is it?",
        placeholder: "I'm looking forward to…",
      },
      {
        kicker: "WHY IT MATTERS",
        title: "Why does it matter to you?",
        sub: "What will it be like? Why are you excited for it?",
        placeholder: "It matters because…",
      },
      {
        kicker: "ALREADY MOVING",
        title: "What have you already done for it?",
        sub: "Name one thing you've already done, or can do today, to help it happen.",
        placeholder: "I've already…",
      },
    ],
  },
];

export function getGratitudeType(id) {
  return GRATITUDE_TYPES.find((t) => t.id === id) || null;
}

export const GRATITUDE_ATTRIBUTION =
  "Gratitude Intervention Meta-Analysis, 2023 (64 RCTs)";

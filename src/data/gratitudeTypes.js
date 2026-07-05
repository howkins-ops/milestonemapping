// ─── Gratitude flavors ─────────────────────────────────────────────────────────
// Six distinct *kinds* of gratitude. The user picks one from the selector, then
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
  {
    id: "present",
    label: "The Right Now",
    tagline: "Grateful, in this moment",
    accent: "#38BDF8",
    glyph: "☀",
    blurb: "Not the past — right now. Something good from today, and what's good this very second.",
    labels: ["From today", "Who showed up", "Right now"],
    layers: [
      {
        depth: true,
        kicker: "FROM TODAY",
        title: "What's one good thing from today or yesterday?",
        sub: "Not years ago — recent. A small moment that actually happened. Step back into it: where were you, what did you see or hear?",
        placeholder: "Earlier today / yesterday, there was…",
      },
      {
        kicker: "WHO SHOWED UP",
        title: "Who showed up for you lately?",
        sub: "Someone who texted, helped, listened, or just made you smile this week. Picture their face right now.",
        placeholder: "Lately, ___ was there when…",
      },
      {
        kicker: "RIGHT NOW",
        title: "What's good in this exact moment?",
        sub: "Look up for a second. Your breath, the seat under you, the light, a sound, being alive to read this. Name what's here now.",
        placeholder: "Right now, I can feel / see / hear…",
      },
    ],
  },
  {
    id: "freedom",
    label: "Freedom Express",
    tagline: "Anything you want",
    accent: "#F472B6",
    glyph: "✷",
    blurb: "No theme, no rules. Be grateful for anything at all — tap a spark to start, or just go.",
    labels: ["The thing", "Why it matters", "How it feels"],
    // Optional starter chips shown on the first layer. Tapping one re-frames that
    // layer for a direction; skipping them and just typing is equally valid.
    sparks: [
      {
        id: "person",
        chip: "A person",
        kicker: "A PERSON",
        title: "Who are you grateful for?",
        sub: "One person — and one real reason they come to mind right now.",
        placeholder: "I'm grateful for ___ because…",
      },
      {
        id: "place",
        chip: "A place",
        kicker: "A PLACE",
        title: "What place are you grateful for?",
        sub: "Somewhere that feels good to you — a room, a city, a spot outside. Put yourself there.",
        placeholder: "I'm grateful for this place because…",
      },
      {
        id: "win",
        chip: "A small win",
        kicker: "A SMALL WIN",
        title: "What win are you grateful for?",
        sub: "Something that went right lately — big or tiny. What did you pull off?",
        placeholder: "I'm grateful I…",
      },
      {
        id: "body",
        chip: "My body",
        kicker: "MY BODY",
        title: "What about your body are you grateful for?",
        sub: "It carried you here. Your breath, your legs, your hands, a sense, healing. Name one.",
        placeholder: "I'm grateful my body…",
      },
      {
        id: "tiny",
        chip: "A tiny thing",
        kicker: "A TINY THING",
        title: "What tiny thing are you grateful for?",
        sub: "The stuff you'd miss instantly — coffee, a song, warmth, a text back. One small thing.",
        placeholder: "I'm grateful for this small thing…",
      },
      {
        id: "free",
        chip: "Just free",
        kicker: "FREE",
        title: "What are you grateful for?",
        sub: "No box. Whatever's in your heart right now — write it.",
        placeholder: "Right now, I'm grateful for…",
      },
    ],
    layers: [
      {
        depth: true,
        sparkHost: true,
        kicker: "FREE",
        title: "What are you grateful for?",
        sub: "Anything at all — a person, a place, a win, your body, a tiny thing. Tap a spark below, or just start typing.",
        placeholder: "Right now, I'm grateful for…",
      },
      {
        kicker: "WHY IT MATTERS",
        title: "What makes it matter to you?",
        sub: "Say more. Why this one? Why does it hit different when you really stop and look at it?",
        placeholder: "It matters because…",
      },
      {
        kicker: "SIT WITH IT",
        title: "How does it feel to sit with it?",
        sub: "Close the gap between knowing and feeling. Where do you notice it — your chest, your face, a little ease somewhere?",
        placeholder: "When I sit with it, I feel…",
      },
    ],
  },
];

export function getGratitudeType(id) {
  return GRATITUDE_TYPES.find((t) => t.id === id) || null;
}

export const GRATITUDE_ATTRIBUTION =
  "Gratitude Intervention Meta-Analysis, 2023 (64 RCTs)";

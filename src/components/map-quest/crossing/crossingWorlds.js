// ════════════════════════════════════════════════════════════════════════
// THE CROSSING TO THE OASIS — ACT 3 (five-cities-oasis canon, playable)
// One shadow, five voices. Eleven walkable worlds on the shared engine:
//
//   road-0 → SILENT SPIRE → road-1 → THE FEED → road-2 → THE TRIBUNAL
//   → road-3 → THE LEDGER → road-4 → THE CARNIVAL → the QUIET ROAD
//   (the Shadow Unveiled · the Thanking) → THE OASIS (Fatima + the pack)
//
// Each city runs the doc's spine: Arrival → The Shadow Appears (its coat)
// → The Near Miss (interactive temptation) → The Omen (the flicker) →
// THE FLIP (the Four Turns, full Declaration) → What He Carries Out.
// On every road between, the Shadow walks visibly closer behind you.
// ════════════════════════════════════════════════════════════════════════

import { PAIR_BY_CITY } from "../essencePairs.js";

export const CITY_DEFS = {
  "silent-spire": {
    id: "silent-spire",
    num: "CITY I",
    name: "The Silent Spire",
    mask: "A city where every voice is broadcast by proxy — no one speaks with their own mouth anymore.",
    theme: "mqw-theme-cross1",
    voiceLabel: "a passing stranger — kind, unremarkable face",
    arrival: [
      "The Spire is visible for a day's walk before you reach it — a needle of glass humming against the sky.",
      "Up close the hum resolves into a thousand overlapping voices, none of them speaking to anyone in the street. Every citizen wears a relay pin at the collarbone; it performs their brightness for them.",
      "People stand in comfortable silence, watching their own words scroll past on screens above their heads.",
    ],
    pitch: [
      "\"You've got a good voice, you know. Rare thing out here.\"",
      "\"Careful who you waste it on — the ones who talk too freely in this city get picked apart by morning.\"",
      "\"Better to let something else carry it for you. Keeps the good part safe.\"",
    ],
    nearMiss: {
      type: "hold",
      landmark: "The Relay Kiosk",
      lead: "A shopkeeper slides a relay pin across the counter. On credit. Just to see how it feels to be spoken for. Your hand is halfway to it —",
      holdLabel: "◈ HOLD — REFUSE THE PIN",
      after: "Something in your chest snags, faint as a hair caught on a doorframe.",
    },
    omen: "The flicker isn't agreement — it's grief. The grief of a light talked into hiding so many times it started doing the hiding itself. You recognize the shape of the argument now. And underneath it, the one making it.",
    flipSite: "The Low Wall",
    flipLead: "You climb onto the low wall at the center of the square, where a dozen relays are performing everyone's better selves, and say one unpolished, entirely true sentence with no relay running.",
    declaration: "I am Radiance. I choose Radiance instead of the Silent Prophet — even shaking, even unpolished, even here.",
    carryOut: "\"Fine. Shine, then. I'll be quieter about it next time.\"",
    carryNote: "The stranger's face blurs at the edges as he walks away — not gone, only patient.",
    citizens: ["Their words scroll overhead", "A relay pin hums politely", "Comfortable silence"],
  },
  "the-feed": {
    id: "the-feed",
    num: "CITY II",
    name: "The Feed",
    mask: "A city of perfect, endless, simulated intimacy — where no one has been truly held in years.",
    theme: "mqw-theme-cross2",
    voiceLabel: "a voice you almost place — familiar, unhurried",
    arrival: [
      "The Feed is soft everywhere the Spire was hard — low warm light, walls glowing with companionship tuned to soothe in exactly the moment it's needed.",
      "No one here looks lonely. Everyone looks fed on something that leaves them hungrier the more of it they take.",
    ],
    pitch: [
      "\"You don't need to explain yourself to a feed. It already knows what you meant.\"",
      "\"People need you to perform it for them first — and half the time they get it wrong anyway.\"",
      "\"Why keep risking that, when this is right here, and it never once misunderstands you?\"",
    ],
    nearMiss: {
      type: "choice",
      landmark: "The Companion Booth",
      lead: "The booth's screen warms to your face. It says something gentle about the one who waits for you — how she'd understand if you let a feed carry the ache instead. For three full minutes you almost believe it.",
      options: [
        {
          label: "Sink into the booth",
          wrong: true,
          response: "It's perfect. Warm. Fluent. And hungrier the longer you sit. The booth has never once been held — how would it hold you?",
        },
        { label: "Stand up — walk to the stone room", wrong: false },
      ],
      after: "One stranger. One hour. Nothing to fill the silence but two actual people. You tell the true, unglamorous thing — and let the quiet sit there, unsoothed, until it passes on its own.",
    },
    omen: "The flicker is a small, specific memory: a real hand on yours, imperfect and unrehearsed, saying nothing wise at all. Being soothed and being loved land in your chest as two different weights.",
    flipSite: "The Stone Room",
    flipLead: "You leave the booth running behind you and sit down across from an actual person.",
    declaration: "I am Love. I choose Love instead of the Addict Saint — even hungry, even risking that I'll be misunderstood.",
    carryOut: "\"You'll be back. Everyone always thinks they won't be.\"",
    carryNote: "You don't turn around. The voice sounds less like a stranger now — more like someone just behind your own left shoulder.",
    citizens: ["Bathed in booth-glow", "Fed and hungrier", "Warm light follows them"],
  },
  "the-tribunal": {
    id: "the-tribunal",
    num: "CITY III",
    name: "The Tribunal",
    mask: "A city that outsourced blame to machines and never once outsourced its rage.",
    theme: "mqw-theme-cross3",
    voiceLabel: "an old bully's voice — flat, contemptuous, a decade away",
    arrival: [
      "The Tribunal is loud before you reach the gate — a low, constant murmur of grievance.",
      "The arbitration court at its center issues flawless verdicts in seconds. The streets seethe anyway: people rage at the verdicts, the machine, each other — anything except the one lever any of them actually control.",
    ],
    pitch: [
      "\"You know exactly why none of this ever worked out the way it should have. It was never you.\"",
      "\"It was the house you grew up in, the money that wasn't there, the people who let you down first.\"",
      "\"Say it. You've earned the right to be furious about it.\"",
    ],
    nearMiss: {
      type: "taps",
      landmark: "The Arbitration Screen",
      lead: "The fury feels good the way pressing a bruise feels good. You file grievance after grievance — and every verdict comes back in your favor. Cold. Perfect. None of it loosens the knot in your chest even slightly. Delete them.",
      items: [
        "GRIEVANCE №1 — the house you grew up in · VERDICT: IN YOUR FAVOR",
        "GRIEVANCE №2 — the money that wasn't there · VERDICT: IN YOUR FAVOR",
        "GRIEVANCE №3 — the ones who left first · VERDICT: IN YOUR FAVOR",
        "GRIEVANCE №4 — the bad start · VERDICT: IN YOUR FAVOR",
        "GRIEVANCE №5 — all of it, everyone · VERDICT: IN YOUR FAVOR",
      ],
      tapLabel: "DELETE",
      after: "In the space where the last one used to be, you type the sentence the whole Tribunal has forgotten how to produce — not a verdict. An admission. The screen has no category for it. It logs it, and goes still.",
    },
    omen: "The flicker arrives as exhaustion — not righteous, just tired. And underneath the old bully's voice, an odd stillness: it never once asks you to DO anything. Only to feel wronged more loudly.",
    flipSite: "The Admission Terminal",
    flipLead: "The first silence the machine has ever returned.",
    declaration: "I am Power. I choose Power instead of the Raging Victim — that part was mine, and I'm done blaming the house I grew up in for what I do next.",
    carryOut: "\"Careful. That's a heavy thing to carry without me to blame instead.\"",
    carryNote: "The voice doesn't sound cruel anymore. It sounds almost like concern — which frightens you more than the contempt did.",
    citizens: ["Mid-grievance", "Raging at a verdict", "Filing again"],
  },
  "the-ledger": {
    id: "the-ledger",
    num: "CITY IV",
    name: "The Ledger",
    mask: "A city where a machine calculates everyone's worth as a number, floating over their heads.",
    theme: "mqw-theme-cross4",
    voiceLabel: "your father's tired voice — the hardest-night register",
    arrival: [
      "In the Ledger, everyone walks beneath a small floating figure — a real-time worth-score tallied from income, assets, standing.",
      "People greet the number before the name. Whole neighborhoods rise and empty on a block's average score.",
    ],
    pitch: [
      "\"Look at the number over your head, son. That's what thirteen years of work bought you.\"",
      "\"You used to promise me you'd be someone.\"",
      "\"Don't tell me this is what someone looks like.\"",
    ],
    nearMiss: {
      type: "hold",
      landmark: "The Plaza Terminal",
      lead: "You stand where the numbers float largest, staring up at your own, composing the old apology before you notice you're doing it. There's one terminal every visitor is offered once. Let it fall.",
      holdLabel: "◈ HOLD — LET THE NUMBER FALL TO ZERO",
      counter: true,
      after: "Zero, in front of the whole city. You wait for the old collapse to arrive in your chest. It doesn't come. Nothing moves in you at all — which is how you finally know the number was never you.",
    },
    omen: "The flicker is almost funny once you catch it: your real father never once spoke to you this way. This voice wears his tone the way a costume is worn — accurately, from the outside. Something that never loved you is doing an impression of someone who does.",
    flipSite: "The Plaza Terminal",
    flipLead: "Under a sky full of everyone else's numbers, yours reads zero — and you stand exactly as tall.",
    declaration: "I am Majesty. I choose Majesty instead of the Broke King — my worth was never parked in that number, and it isn't parked in your voice either.",
    carryOut: "\"...You always were stubborn about the wrong things.\"",
    carryNote: "For the first time, the voice doesn't know what to do next. You walk out having won an argument against something that was never your father at all.",
    citizens: ["№ 4,120 overhead", "№ 87,300 overhead", "№ 12 overhead — head high"],
  },
  "the-carnival": {
    id: "the-carnival",
    num: "CITY V",
    name: "The Carnival",
    mask: "A city of endless, ageless play — where wonder never has to grow up, or grow wise.",
    theme: "mqw-theme-cross5",
    voiceLabel: "your own voice, exactly — from just behind your own eyes",
    arrival: [
      "The Carnival never closes. Its rides are tuned to maximize delight and remove discomfort entirely.",
      "Its citizens are the happiest-looking people you've passed yet — perpetually amused, perpetually safe, perpetually young in the face. Nobody here has said no to anything in a very long time.",
    ],
    pitch: [
      "\"You've earned this. After everything — the desert, the theft, the four other cities.\"",
      "\"You're allowed one thing that costs you nothing and asks nothing back. Just this once.\"",
      "\"No one out here is keeping score anymore anyway.\"",
    ],
    nearMiss: {
      type: "choice",
      landmark: "The Perfect Ride",
      lead: "The ride is built to your exact specifications — every fear soothed, every want anticipated. You're halfway on, one foot still on the platform, when some old habit of noticing makes you pause.",
      options: [
        {
          label: "Board the ride",
          wrong: true,
          response: "The platform hums with your yes. And the question arrives one heartbeat late: would I be CHOOSING this — or just failing to refuse it?",
        },
        { label: "Step BACK off the platform", wrong: false },
      ],
      after: "Your own voice can want things honestly. But it has never once argued you out of a boundary using the word 'earned.' That argument only ever belongs to the thing wearing you.",
    },
    omen: "The flicker arrives as a question, not a feeling: would I be choosing this, or just failing to refuse it? That's the tell your father meant all along.",
    flipSite: "The Platform Edge",
    flipLead: "You look at the ride built to want nothing from you but your yes, and say the sentence the Carnival has never once heard.",
    declaration: "I am Joy. I choose Joy instead of the Naive Warrior — not this one. Not because it isn't delightful. Because I'm finally allowed to say no to delightful.",
    carryOut: "\"...Fine. You win this round.\"",
    carryNote: "And then, for the first time in five cities, the voice simply stops. Not defeated — more like an actor leaving a stage it no longer has a costume for.",
    citizens: ["Perpetually amused", "Ageless in the face", "Never says no"],
  },
};

// The full route, west → east.
export const CROSSING_SEQ = [
  { kind: "road", id: "road-0", after: null },
  { kind: "city", id: "silent-spire" },
  { kind: "road", id: "road-1", after: "silent-spire" },
  { kind: "city", id: "the-feed" },
  { kind: "road", id: "road-2", after: "the-feed" },
  { kind: "city", id: "the-tribunal" },
  { kind: "road", id: "road-3", after: "the-tribunal" },
  { kind: "city", id: "the-ledger" },
  { kind: "road", id: "road-4", after: "the-ledger" },
  { kind: "city", id: "the-carnival" },
  { kind: "quiet", id: "quiet-road" },
  { kind: "oasis", id: "oasis" },
];

// How close the Shadow walks on each road (px behind your spawn) — the
// visual of the voice nearing your own mouth.
const SHADOW_GAP = { "road-0": 380, "road-1": 300, "road-2": 230, "road-3": 170, "road-4": 120 };

const ROAD_LINES = {
  "road-0": [
    "The road out of the metropolis runs flat and quiet. No signal reaches this far. Nothing out here will answer for you.",
    "A few paces back, something keeps your pace exactly. When you stop, it stops. You don't look. Not yet.",
  ],
  "road-1": [
    "\"Shine, then,\" it said. You walk. The footsteps behind you are a little closer than they were.",
    "The next city glows soft and warm on the horizon — the kind of warm that never has to be earned.",
  ],
  "road-2": [
    "It sounded almost like a friend back there. The footsteps are closer again.",
    "Ahead, a low murmur you can feel through your boots: a whole city grinding its teeth.",
  ],
  "road-3": [
    "\"Heavy thing to carry,\" it said — almost gently. That's new. The footsteps are close enough now to hear the stride matching yours.",
    "Ahead, numbers float over a skyline like a weather system made of arithmetic.",
  ],
  "road-4": [
    "It wore your father's voice and lost. The footsteps are just behind your shoulder now.",
    "Ahead — music. Lights that never switch off. Something in you is already smiling, and you're no longer sure which one of you it is.",
  ],
};

export function buildRoadWorld(stop) {
  const gap = SHADOW_GAP[stop.id] ?? 300;
  const spawnX = 220;
  return {
    id: stop.id,
    label: "The road between cities",
    theme: "mqw-theme-road",
    width: 1500,
    spawnX,
    edges: {
      left: { type: "wall" },
      right: { type: "exit", id: "road-on", label: "KEEP WALKING" },
    },
    far: [
      { x: 6, w: 200, h: 16 }, { x: 30, w: 260, h: 20 }, { x: 58, w: 220, h: 14 },
      { x: 80, w: 240, h: 18 },
    ],
    mid: [{ x: 20, w: 90, h: 12, neon: false }, { x: 66, w: 110, h: 14, neon: false }],
    arches: [],
    props: [
      { type: "lamp", x: 700, color: "#C99A5B" },
      { type: "gate", x: 1320, label: "EAST" },
    ],
    buildings: [],
    npcs: [
      {
        id: "the-shadow",
        name: "…it keeps your pace",
        x: Math.max(60, spawnX - gap),
        color: "#4A4656",
        sprite: "guide",
      },
    ],
    roadLines: ROAD_LINES[stop.id] || [],
  };
}

// City world: the Shadow (in its coat), the temptation landmark, the flip
// site, and ambient citizens. Door/NPC enablement follows the city stage:
//   arrive → pitch (talk to the shadow) → nearmiss (landmark) → flip (site)
//   → done (east exit opens)
export function buildCityWorld3(def, stage) {
  const flipped = stage === "done";
  const buildings = [
    {
      id: "nearmiss",
      name: def.nearMiss.landmark,
      icon: "◍",
      color: "#D6538A",
      glow: "rgba(214, 83, 138, 0.3)",
      x: 620,
      w: 150,
      hPct: 44,
      glowState: stage === "nearmiss" ? "dim" : flipped ? "lit" : "dim",
      locked: stage === "arrive" || stage === "pitch",
      next: stage === "nearmiss",
    },
    {
      id: "flipsite",
      name: def.flipSite,
      icon: "◈",
      color: "#EFC03B",
      glow: "rgba(239, 192, 59, 0.3)",
      x: 980,
      w: 150,
      hPct: 48,
      glowState: flipped ? "lit" : "dim",
      locked: stage !== "flip" && !flipped,
      next: stage === "flip",
    },
  ];

  const npcs = [
    {
      id: "the-shadow",
      name: flipped ? "…already fading" : "Someone wants a word",
      x: 380,
      color: "#4A4656",
      sprite: "guide",
      disabled: false,
    },
    { id: "citizen-a", name: def.citizens[0], x: 760, color: "#8B92A8", sprite: "guide" },
    { id: "citizen-b", name: def.citizens[1], x: 880, color: "#8B92A8", sprite: "guide" },
  ];

  return {
    id: def.id,
    label: `${def.num} — ${def.name}`,
    theme: def.theme,
    width: 1700,
    spawnX: 170,
    edges: {
      left: { type: "wall" },
      right: flipped
        ? { type: "exit", id: "city-east", label: "WALK OUT EAST" }
        : { type: "wall" },
    },
    far: [
      { x: 4, w: 70, h: 45 }, { x: 16, w: 90, h: 60 }, { x: 30, w: 70, h: 40 },
      { x: 46, w: 100, h: 65 }, { x: 62, w: 80, h: 50 }, { x: 78, w: 90, h: 58 },
      { x: 92, w: 70, h: 42 },
    ],
    mid: [
      { x: 6, w: 110, h: 35, neon: true }, { x: 28, w: 90, h: 45, neon: false },
      { x: 50, w: 120, h: 38, neon: true }, { x: 74, w: 100, h: 48, neon: true },
    ],
    arches: [{ x: 60, w: 220, label: `${def.num} · ${def.name.toUpperCase()}`, accent: "#D6538A" }],
    props: [
      { type: "lamp", x: 560, color: "#D6538A" },
      { type: "lamp", x: 1180, color: "#EFC03B" },
      { type: "gate", x: 1520, label: "EAST" },
    ],
    buildings,
    npcs,
  };
}

export function buildQuietRoadWorld({ unveiled }) {
  return {
    id: "quiet-road",
    label: "The empty road past the Carnival gates",
    theme: "mqw-theme-quiet",
    width: 1600,
    spawnX: 180,
    edges: {
      left: { type: "wall" },
      right: unveiled
        ? { type: "exit", id: "to-oasis", label: "THE OASIS" }
        : { type: "wall" },
    },
    far: [
      { x: 8, w: 240, h: 14 }, { x: 40, w: 280, h: 18 }, { x: 72, w: 240, h: 15 },
    ],
    mid: [],
    arches: [],
    props: [{ type: "lamp", x: 800, color: "#8B92A8" }, { type: "gate", x: 1420, label: "EAST" }],
    buildings: [],
    npcs: [
      {
        id: "the-shadow",
        name: unveiled ? "It walks beside you now" : "A shape the size of a frightened boy",
        x: unveiled ? 260 : 620,
        color: unveiled ? "#8B92A8" : "#4A4656",
        sprite: "guide",
      },
    ],
  };
}

export function buildOasisWorld({ citizens = [] } = {}) {
  const npcs = [
    { id: "fatima", name: "Fatima", x: 760, color: "#D6538A", sprite: "guide" },
  ];
  citizens.slice(0, 4).forEach((c, i) => {
    npcs.push({
      id: `well:${c.id || i}`,
      name: c.name,
      x: 980 + i * 120,
      color: "#00FFBF",
      sprite: "guide",
    });
  });
  return {
    id: "oasis",
    label: "The true oasis — past all five cities",
    theme: "mqw-theme-oasis",
    width: 1700,
    spawnX: 170,
    edges: {
      left: { type: "wall" },
      right: { type: "exit", id: "toward-home", label: "TOWARD HOME" },
    },
    far: [
      { x: 6, w: 200, h: 18 }, { x: 34, w: 260, h: 22 }, { x: 64, w: 220, h: 16 },
      { x: 86, w: 200, h: 20 },
    ],
    mid: [
      { x: 12, w: 60, h: 30, neon: false }, { x: 40, w: 70, h: 36, neon: false },
      { x: 70, w: 60, h: 32, neon: false },
    ],
    arches: [{ x: 60, w: 200, label: "THE OASIS", accent: "#00FFBF" }],
    props: [
      { type: "fountain", x: 900 },
      { type: "lamp", x: 620, color: "#00FFBF" },
      { type: "lamp", x: 1240, color: "#00FFBF" },
    ],
    buildings: [],
    npcs,
  };
}

export function pairForCity(cityId) {
  return PAIR_BY_CITY[cityId];
}

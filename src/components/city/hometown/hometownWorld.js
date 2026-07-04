// ════════════════════════════════════════════════════════════════════════
// THE HOMETOWN — world #1 of the MapQuest journey
// Small, dusty, warm, analog — the deliberate opposite of the neon city.
// Your house, the old workshop, The Father's porch, and the road out east
// where a faint glow sits on the horizon. Five story beats, linear, then
// the departure cinematic hands the journey to the city.
//
// Canon: The Father and the send-off are Chapter 1 of the Alchemist arc
// (alchemist/06_WORLD_BIBLE.md, 07_CHAPTER_DOSSIER.md) — he gave the old
// survival code ("look out for #1") that the whole quest re-examines.
// ════════════════════════════════════════════════════════════════════════

export const HOMETOWN_DUST = "#C9A15E"; // the hometown accent — no neon here
const WOOD = "#8A6B42";
const PORCH = "#FFB000";

// ── The five beats (linear via journey.hometown.nextBeat) ────────────────

export const HOMETOWN_BEATS = [
  {
    id: "restless-morning",
    index: 0,
    trigger: "auto",
    scene: {
      title: "THE RESTLESS MORNING",
      color: HOMETOWN_DUST,
      sprite: "player",
      speakerName: "You",
      epithet: "The one the dream keeps finding",
      beats: [
        {
          speaker: "NARRATION",
          lines: [
            "Same town. Same morning. Same ceiling you memorized years ago.",
            "But the dream came back last night — the vault, the tower, your name already on the door.",
          ],
        },
        {
          speaker: "YOU",
          lines: [
            "Everyone says the city eats people like us.",
            "Then why does that glow on the horizon feel like the only honest thing left?",
          ],
        },
      ],
      doneLabel: "Step outside",
    },
  },
  {
    id: "old-workshop",
    index: 1,
    trigger: "building:workshop",
    scene: {
      title: "THE OLD WORKSHOP",
      color: WOOD,
      sprite: "player",
      speakerName: "You",
      epithet: "Among the half-finished things",
      beats: [
        {
          speaker: "NARRATION",
          lines: [
            "Sawdust. Old tools. Projects in every corner — half of them finished.",
            "You know exactly which half, and exactly why.",
          ],
        },
        {
          speaker: "YOU",
          lines: [
            "The excuses stay here. They live in this town, not in me.",
            "I'm taking one thing with me: my word. When I say it, I build it.",
          ],
        },
      ],
      doneLabel: "Take your word",
    },
  },
  {
    id: "send-off",
    index: 2,
    trigger: "npc:father",
    scene: {
      title: "THE SEND-OFF",
      color: PORCH,
      sprite: "mentor",
      speakerName: "The Father",
      epithet: "Gave you the code that kept him alive",
      beats: [
        {
          speaker: "THE FATHER",
          lines: [
            "So. The city.",
            "I gave you a code once — look out for number one. It kept me alive. Now hear the rest of it.",
          ],
        },
        {
          speaker: "THE FATHER",
          lines: [
            "It won't get you where you're going. Surviving and building are different trades.",
            "When you reach the city, climb the spire first. Someone is waiting at the top who knows the work.",
          ],
        },
        {
          speaker: "THE FATHER",
          lines: [
            "And when you've become whatever you're going to become —",
            "come back and tell me what it cost. And what it paid.",
          ],
        },
        {
          speaker: "YOU",
          lines: ["I'll come back. With receipts."],
        },
      ],
      doneLabel: "Take the blessing",
    },
  },
  {
    id: "packing-up",
    index: 3,
    trigger: "building:your-house",
    scene: {
      title: "PACKING UP",
      color: HOMETOWN_DUST,
      sprite: "player",
      speakerName: "You",
      epithet: "One bag, one word",
      beats: [
        {
          speaker: "NARRATION",
          lines: [
            "One bag. Lighter than you expected.",
            "Turns out most of what you owned was just waiting.",
          ],
        },
        {
          speaker: "YOU",
          lines: ["I'm ready."],
        },
      ],
      doneLabel: "Shoulder the bag",
    },
  },
  // beat 4 — "the-road-out" — has no dialog: reaching the east edge with
  // everything done triggers the departure cinematic instead.
];

export const ROAD_OUT_INDEX = HOMETOWN_BEATS.length; // 4

// ── Backdrop: soft hills + low rooftops (no towers, no neon) ─────────────

const HILLS = [
  { x: 0, w: 260, h: 20 }, { x: 12, w: 320, h: 26 }, { x: 26, w: 280, h: 18 },
  { x: 40, w: 340, h: 24 }, { x: 56, w: 300, h: 20 }, { x: 70, w: 360, h: 28 },
  { x: 86, w: 300, h: 22 },
];

const ROOFTOPS = [
  { x: 4, w: 90, h: 16, neon: false }, { x: 16, w: 70, h: 20, neon: false },
  { x: 30, w: 84, h: 14, neon: false }, { x: 46, w: 76, h: 18, neon: false },
  { x: 62, w: 88, h: 15, neon: false }, { x: 78, w: 72, h: 19, neon: false },
  { x: 90, w: 80, h: 14, neon: false },
];

// ── The world ────────────────────────────────────────────────────────────

// nextBeat drives which door/npc is active (linear story), and the road
// out only opens once every dialog beat is done. Completed beats stay
// re-playable as memories.
export function buildHometownWorld({ nextBeat = 0, spawnAtRoad = false } = {}) {
  const active = (index) => index <= nextBeat; // replay allowed, skipping not
  const isNext = (index) => index === nextBeat;

  const buildings = [
    {
      id: "your-house",
      name: "Your House",
      icon: "⌂",
      color: HOMETOWN_DUST,
      glow: "rgba(201, 161, 94, 0.3)",
      x: 150,
      w: 150,
      hPct: 34,
      glowState: "lit",
      locked: false,
      next: isNext(3),
      disabled: !active(3),
    },
    {
      id: "workshop",
      name: "The Old Workshop",
      icon: "⚒",
      color: WOOD,
      glow: "rgba(138, 107, 66, 0.3)",
      x: 640,
      w: 170,
      hPct: 30,
      glowState: "lit",
      locked: false,
      next: isNext(1),
      disabled: !active(1),
    },
    {
      id: "father-porch",
      name: "The Father's Porch",
      icon: "☖",
      color: PORCH,
      glow: "rgba(255, 176, 0, 0.25)",
      x: 1150,
      w: 160,
      hPct: 26,
      glowState: "lit",
      locked: false,
      next: false,
      disabled: true, // the porch is scenery — you talk to The Father himself
    },
  ];

  const npcs = [
    {
      id: "father",
      name: "The Father",
      x: 1360,
      color: PORCH,
      sprite: "guide",
      disabled: !active(2),
    },
  ];

  const roadOpen = nextBeat >= ROAD_OUT_INDEX;

  return {
    id: "hometown",
    label: "The hometown — where the road starts",
    theme: "mqw-theme-hometown",
    width: 1900,
    spawnX: spawnAtRoad ? 1680 : 250,
    edges: {
      left: { type: "wall" },
      right: roadOpen
        ? { type: "exit", id: "road-out", label: "TAKE THE ROAD" }
        : { type: "wall" },
    },
    far: HILLS,
    mid: ROOFTOPS,
    arches: [],
    props: [
      { type: "lamp", x: 420, color: HOMETOWN_DUST },
      { type: "lamp", x: 980, color: HOMETOWN_DUST },
      { type: "lamp", x: 1560, color: HOMETOWN_DUST },
      { type: "gate", x: 1740, label: "THE ROAD OUT" },
    ],
    buildings,
    npcs,
  };
}

// Map a WorldScene interaction to the beat it should play (or null).
export function beatForInteraction(kind, id) {
  const trigger = `${kind}:${id}`;
  return HOMETOWN_BEATS.find((b) => b.trigger === trigger) || null;
}

// ════════════════════════════════════════════════════════════════════════
// THE HOMETOWN — world #1 of the MapQuest journey (ACT 0 · THE GOLDEN ROAD)
// Small, dusty, warm, analog — the deliberate opposite of the neon city.
// Onboarding IS the game here: four stations, each a real exercise, linear:
//
//   1. YOUR HOUSE        → write your WHY (whyILeft / whoIAmNow / biggestFear)
//   2. THE LETTER        → the anti-quit letter (replayed in SOS on bad days)
//   3. THE OLD WORKSHOP  → the QUIT-YOUR-JOB mini-game (gray shifts → walk out)
//   4. THE FATHER        → he asks your WHY back, gives the WARNING, hands
//                          THE PENDANT (Radiance · Love · Power · Majesty · Joy)
//
// GATE 1: the road out east opens only when all four stations are done.
// Canon: V9 "The Boy Who Dreamed of Gold" (the jobs, the dream, the leap) +
// the father's warning from "The Five Cities of the Oasis" (one shadow, many
// coats; watch the flicker before it speaks).
// ════════════════════════════════════════════════════════════════════════

export const HOMETOWN_DUST = "#C9A15E"; // the hometown accent — no neon here
const WOOD = "#8A6B42";
const PORCH = "#FFB000";
const INK = "#B08D57";

// ── The four stations (linear via journey.hometown.stations) ─────────────

export const STATION_ORDER = ["why", "letter", "quit", "sendoff"];

export const STATIONS = {
  why: {
    id: "why",
    index: 0,
    trigger: "building:your-house",
    kind: "exercise",
    intro: {
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
            "But the dream came back last night — gold, always gold. A vault, a tower, your name already on the door.",
          ],
        },
        {
          speaker: "NARRATION",
          lines: [
            "They say every boy gets this dream once, and buries it by thirty, and calls the burying \"growing up.\"",
            "You didn't bury it. It keeps coming back a little louder, like something trying to get heard.",
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
      doneLabel: "Sit down and write it",
    },
  },
  letter: {
    id: "letter",
    index: 1,
    trigger: "building:letter-desk",
    kind: "letter",
    intro: {
      title: "THE LETTER",
      color: INK,
      sprite: "player",
      speakerName: "You",
      epithet: "At the old writing desk",
      beats: [
        {
          speaker: "NARRATION",
          lines: [
            "The desk by the window. Your grandfather wrote letters here that people kept for decades.",
            "There's one letter only you can write — to the version of you who, some rough night out there, will want to quit.",
          ],
        },
        {
          speaker: "YOU",
          lines: [
            "Future me is going to hit a wall and forget why he left.",
            "So I'll tell him now, while I still remember everything.",
          ],
        },
      ],
      doneLabel: "Take up the pen",
    },
  },
  quit: {
    id: "quit",
    index: 2,
    trigger: "building:workshop",
    kind: "quitgame",
    intro: {
      title: "THE OLD WORKSHOP",
      color: WOOD,
      sprite: "player",
      speakerName: "You",
      epithet: "Among the half-finished things",
      beats: [
        {
          speaker: "NARRATION",
          lines: [
            "Sawdust. Old tools. Time cards from every job you ever worked, nailed to the wall like little gray tombstones.",
            "Before the road, there's one thing left to do in this town — and it isn't building anything.",
          ],
        },
        {
          speaker: "YOU",
          lines: ["One last shift. Every job I ever quit, one more time — and then the door."],
        },
      ],
      doneLabel: "Punch in",
    },
  },
  sendoff: {
    id: "sendoff",
    index: 3,
    trigger: "npc:father",
    kind: "sendoff",
    // Built at runtime — the father echoes the player's own WHY back.
  },
};

export function stationByTrigger(kind, id) {
  const trigger = `${kind}:${id}`;
  return STATION_ORDER.map((k) => STATIONS[k]).find((s) => s.trigger === trigger) || null;
}

// The father's send-off, built with the player's own words woven in.
// (five-cities canon: the warning + the five words, near-verbatim beats)
export function buildSendoffScene(outputs = {}) {
  const why = (outputs.whyILeft || "").trim();
  const whyBeat = why
    ? {
        speaker: "THE FATHER",
        lines: [
          "\"Before I give you anything — tell me why. Not the what. The why.\"",
          `You say it the way you wrote it: "${why}"`,
          "He holds it a long moment, the way you'd weigh a coin. Then he nods, once.",
        ],
      }
    : {
        speaker: "THE FATHER",
        lines: [
          "\"Before I give you anything — tell me why. Not the what. The why.\"",
          "You tell him. He holds it a long moment, the way you'd weigh a coin. Then he nods, once.",
        ],
      };

  return {
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
          "I gave you a code once — look out for number one. It kept me alive. It won't get you where you're going. Surviving and building are different trades.",
        ],
      },
      whyBeat,
      {
        speaker: "THE FATHER",
        lines: [
          "Now hear the part nobody thinks to tell a boy who's finally decided.",
          "There's a shadow that walks ahead of every traveler who leaves to find their treasure. Not a demon. Not a monster. The frightened, cornered shape of your own gifts, worn inside out.",
        ],
      },
      {
        speaker: "THE FATHER",
        lines: [
          "It won't announce itself. It'll borrow whatever voice you're most likely to believe — a stranger's kindness, a lover's ache, an old grievance, an accountant's number, your own voice if it has to.",
          "It will never once say \"I am your fear.\" It will only ever say \"I am protecting you.\"",
        ],
      },
      {
        speaker: "THE FATHER",
        lines: [
          "You'll meet it more than once out there, and you'll think each time it's someone new. It is not. Same shadow, different coat.",
          "Watch what stirs in you a half-second before it speaks. That flicker is yours. Everything after it is the shadow talking.",
        ],
      },
      {
        speaker: "THE FATHER",
        lines: [
          "I've got nothing shaped like a weapon for you. I've got five words instead.",
          "Radiance. Love. Power. Majesty. Joy. Whatever voice it uses, it's always trying to talk you out of one of these five. Say the true name back to it. It cannot survive being correctly named.",
        ],
      },
      {
        speaker: "THE FATHER",
        lines: [
          "He presses something into your hand: a pendant on a worn cord. Five words engraved around the edge, thumb-polished half-smooth.",
          "\"Mine. My father's before me. Neither of us ever left. Maybe that's exactly why you have to.\"",
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
    doneLabel: "Take the pendant",
  };
}

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

// doneCount / nextIndex drive which door/npc is active (linear story), and
// the road out only opens once every station is done. Completed stations
// stay re-playable as memories.
export function buildHometownWorld({ stationsDone = {}, spawnAtRoad = false } = {}) {
  const doneCount = STATION_ORDER.filter((id) => stationsDone[id]).length;
  const nextIndex = doneCount; // linear: the next undone station
  const active = (index) => index <= nextIndex; // replay allowed, skipping not
  const isNext = (index) => index === nextIndex;

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
      glowState: stationsDone.why ? "lit" : "dim",
      locked: false,
      next: isNext(0),
      disabled: !active(0),
    },
    {
      id: "letter-desk",
      name: "The Letter",
      icon: "✉",
      color: INK,
      glow: "rgba(176, 141, 87, 0.3)",
      x: 470,
      w: 130,
      hPct: 26,
      glowState: stationsDone.letter ? "lit" : "dim",
      locked: false,
      next: isNext(1),
      disabled: !active(1),
    },
    {
      id: "workshop",
      name: "The Old Workshop",
      icon: "⚒",
      color: WOOD,
      glow: "rgba(138, 107, 66, 0.3)",
      x: 780,
      w: 170,
      hPct: 30,
      glowState: stationsDone.quit ? "lit" : "dim",
      locked: false,
      next: isNext(2),
      disabled: !active(2),
    },
    {
      id: "father-porch",
      name: "The Father's Porch",
      icon: "☖",
      color: PORCH,
      glow: "rgba(255, 176, 0, 0.25)",
      x: 1220,
      w: 160,
      hPct: 26,
      glowState: stationsDone.sendoff ? "lit" : "dim",
      locked: false,
      next: false,
      disabled: true, // the porch is scenery — you talk to The Father himself
    },
  ];

  const npcs = [
    {
      id: "father",
      name: "The Father",
      x: 1430,
      color: PORCH,
      sprite: "guide",
      disabled: !active(3),
    },
  ];

  const roadOpen = doneCount >= STATION_ORDER.length;

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
      { type: "lamp", x: 380, color: HOMETOWN_DUST },
      { type: "lamp", x: 1050, color: HOMETOWN_DUST },
      { type: "lamp", x: 1560, color: HOMETOWN_DUST },
      { type: "gate", x: 1740, label: "THE ROAD OUT" },
    ],
    buildings,
    npcs,
  };
}

// ════════════════════════════════════════════════════════════════════════
// THE ALCHEMIST SPIRE — walkable interior (ACT 2 · WORLD mode)
// Five floors, one per arc of the 24-chapter spine. Each floor is a
// WorldScene config: chapter DOORS (locked / ready / complete mirroring the
// quest book), the arc's keeper as an NPC, your real people as ambient
// citizens, and the elevator east — which only hums open once the floor's
// chapters are complete. Same engine as the hometown and the city street:
// pure data in, walkable world out.
// ════════════════════════════════════════════════════════════════════════

import { QUEST_CHAPTERS, prevAvailableKey } from "../questChapters.js";

export const SPIRE_FLOORS = [
  {
    id: "floor-1",
    num: "FLOOR I",
    title: "The Call",
    accent: "#00F0FF",
    theme: "mqw-theme-spire1",
    range: [1, 5],
    keeper: {
      id: "keeper-father",
      name: "The Father (hologram)",
      color: "#FFB000",
      lines: [
        "A flicker of the porch, projected in blue light. \"Still got the pendant? Good.\"",
        "\"Every chamber on this floor is a piece of the leaving — the why, the signal, the map, the gate. Walk them in order. The tower keeps score.\"",
      ],
    },
  },
  {
    id: "floor-2",
    num: "FLOOR II",
    title: "The Fall & the Crystal Shop",
    accent: "#FFC94D",
    theme: "mqw-theme-spire2",
    range: [6, 10],
    keeper: {
      id: "keeper-merchant",
      name: "The Merchant",
      color: "#FFC94D",
      lines: [
        "An old man polishes a glass that is already clean. \"Everyone falls on this floor. That's what it's for.\"",
        "\"The first mask you'll meet down here wears a cracked crown. Name it correctly and the rest of the tower gets easier. Polish first. Then ask.\"",
      ],
    },
  },
  {
    id: "floor-3",
    num: "FLOOR III",
    title: "The Road of Trials",
    accent: "#C4451C",
    theme: "mqw-theme-spire3",
    range: [11, 14],
    keeper: {
      id: "keeper-challenger",
      name: "The Challenger",
      color: "#FF5470",
      lines: [
        "Arms crossed. Doesn't smile. \"Don't tell me about your week. Tell me what you SHIPPED.\"",
        "\"This floor runs on kept promises. The chapel and the desert will try to slow you down — good. Slow is where the work lives.\"",
      ],
    },
  },
  {
    id: "floor-4",
    num: "FLOOR IV",
    title: "Deeper Shadows & Being",
    accent: "#FF3EDB",
    theme: "mqw-theme-spire4",
    range: [15, 20],
    keeper: {
      id: "keeper-heartkeeper",
      name: "The Heartkeeper",
      color: "#00FFBF",
      lines: [
        "The air is greener here, impossibly alive. \"The voices get closer to your own on this floor. That's not a malfunction.\"",
        "\"Stranger, friend, bully, father — by the garden it almost sounds like you. Watch the flicker before it speaks. It never has one of its own.\"",
      ],
    },
  },
  {
    id: "floor-5",
    num: "FLOOR V",
    title: "Climax & Return",
    accent: "#7B2CFF",
    theme: "mqw-theme-spire5",
    range: [21, 24],
    keeper: {
      id: "keeper-alchemist",
      name: "The Alchemist",
      color: "#7B2CFF",
      lines: [
        "You. Older. The hood is the same. \"I told you at the bottom — I remember standing exactly where you're standing.\"",
        "\"Every shadow converges in the Citadel, the storm takes the rest, and the Vault opens onto a mirror. Then the road home. And past the roof… the crossing. One coat left you haven't seen through.\"",
      ],
    },
  },
];

// Chapters on a floor, in spine order.
export function floorChapters(floor) {
  return QUEST_CHAPTERS.filter(
    (c) => c.number >= floor.range[0] && c.number <= floor.range[1]
  );
}

export function chapterState(chapter, isChapterComplete) {
  if (!chapter.available) return "coming";
  if (isChapterComplete(chapter.key)) return "complete";
  const prevKey = prevAvailableKey(chapter.key);
  if (!prevKey || isChapterComplete(prevKey)) return "ready";
  return "locked";
}

// A floor is open once its first chapter is reachable (chain reached it).
export function floorOpen(floor, isChapterComplete) {
  const chapters = floorChapters(floor);
  if (!chapters.length) return false;
  const s = chapterState(chapters[0], isChapterComplete);
  return s === "ready" || s === "complete";
}

export function floorComplete(floor, isChapterComplete) {
  const chapters = floorChapters(floor);
  return chapters.length > 0 && chapters.every((c) => isChapterComplete(c.key));
}

const DOOR_W = 128;
const DOOR_GAP = 56;
const START_X = 360;

// Build the walkable world config for one floor.
// citizens: [{ id, name, color }] — real people from the Zone, ambient.
export function buildSpireFloorWorld(floor, isChapterComplete, { citizens = [] } = {}) {
  const chapters = floorChapters(floor);
  const buildings = [];
  let cursor = START_X;

  for (const ch of chapters) {
    const state = chapterState(ch, isChapterComplete);
    buildings.push({
      id: ch.key,
      name: `Ch.${ch.number} · ${ch.title}`,
      icon: state === "complete" ? "✓" : state === "ready" ? "✦" : "◌",
      color: floor.accent,
      glow: `color-mix(in srgb, ${floor.accent} 30%, transparent)`,
      x: cursor,
      w: DOOR_W,
      hPct: state === "complete" ? 52 : 46,
      glowState: state === "complete" ? "lit" : "dim",
      locked: state === "locked" || state === "coming",
      next: state === "ready",
    });
    cursor += DOOR_W + DOOR_GAP;
  }

  const npcs = [
    { id: floor.keeper.id, name: floor.keeper.name, x: 220, color: floor.keeper.color, sprite: "guide" },
  ];

  // Your pack, scattered between the doors — the tower is climbed together.
  citizens.slice(0, 5).forEach((c, i) => {
    npcs.push({
      id: `citizen:${c.id || i}`,
      name: c.name,
      x: START_X + 90 + i * ((cursor - START_X - 120) / Math.max(1, Math.min(citizens.length, 5))),
      color: c.color || "#00F0FF",
      sprite: "guide",
    });
  });

  const done = floorComplete(floor, isChapterComplete);
  const width = cursor + 300;

  return {
    id: floor.id,
    label: `${floor.num} — ${floor.title}`,
    theme: floor.theme,
    width,
    spawnX: 150,
    edges: {
      left: { type: "exit", id: "spire-down", label: "DOWN — THE STREETS" },
      right: done
        ? { type: "exit", id: "spire-up", label: floor.id === "floor-5" ? "THE ROOF" : "THE ELEVATOR ↑" }
        : { type: "wall" },
    },
    far: [
      { x: 4, w: 60, h: 40 }, { x: 18, w: 80, h: 55 }, { x: 34, w: 60, h: 35 },
      { x: 50, w: 90, h: 60 }, { x: 68, w: 70, h: 45 }, { x: 84, w: 60, h: 50 },
    ],
    mid: [
      { x: 8, w: 100, h: 30, neon: true }, { x: 30, w: 80, h: 40, neon: false },
      { x: 55, w: 110, h: 35, neon: true }, { x: 80, w: 90, h: 42, neon: false },
    ],
    arches: [{ x: 60, w: 200, label: `${floor.num} · ${floor.title.toUpperCase()}`, accent: floor.accent }],
    props: [
      { type: "lamp", x: 300, color: floor.accent },
      { type: "lamp", x: Math.round(cursor - 60), color: floor.accent },
    ],
    buildings,
    npcs,
  };
}

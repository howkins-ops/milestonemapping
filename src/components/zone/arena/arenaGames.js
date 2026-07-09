// The Squad Arena game registry — the single source of truth for the roster.
// ARENA_GAMES drives both the launcher grid (ArenaGamesGrid) and ArenaHome's
// router (which game to render for a given gameKey). Data-only module: each
// entry pairs a stable key with its default-exported <Component/> and an INLINE
// neon SVG glyph (NO emoji in nav/roster glyphs — brand law). Glyphs stroke
// `currentColor` so the grid can tint each card from its accent.
//
// Ownership: arenaGames.js / ArenaGamesGrid.jsx / ArenaHome(.jsx/.css) only.
// Every game component default-exports `function Name({ go })`.

import React from "react";

import TheVow from "./games/TheVow.jsx";
import BossForge from "./games/BossForge.jsx";
import ChainOfFire from "./games/ChainOfFire.jsx";
import Hoops from "./games/Hoops.jsx";
import TheDuel from "./games/TheDuel.jsx";
import Ascension from "./games/Ascension.jsx";
import DawnRaid from "./games/DawnRaid.jsx";
import EatTheFrog from "./games/EatTheFrog.jsx";
import ThePit from "./games/ThePit.jsx";
import GrindRoom from "./games/GrindRoom.jsx";

const h = React.createElement;

// Small stroke-glyph builder — keeps every roster icon on the same neon grid.
function glyph(...paths) {
  return h(
    "svg",
    {
      viewBox: "0 0 24 24",
      className: "arn-glyphsvg",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.7,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      "aria-hidden": true,
    },
    ...paths.map((p, i) =>
      typeof p === "string"
        ? h("path", { d: p, key: i })
        : h(p.tag, { ...p.attrs, key: i })
    )
  );
}
const circle = (cx, cy, r) => ({ tag: "circle", attrs: { cx, cy, r } });

// Registry order = build/priority order. scope: 'squad' | 'partner' | 'solo'.
export const ARENA_GAMES = [
  {
    key: "the_vow",
    title: "The Vow",
    tagline: "Make a dated vow. Your witness watches the fuse burn down.",
    scope: "partner",
    Component: TheVow,
    glyph: glyph(
      "M12 3c1.8 2.7 3.6 4 3.6 7.2A3.6 3.6 0 0 1 8.4 10.2c0-1.6.8-2.6 1.7-3.4.2 1.7 1 2.5 1.8 2.5.6 0 1-.5 1-1.4 0-1.8-1-3.1-.7-4.9Z",
      "M9 18h6",
      "M10 21h4"
    ),
  },
  {
    key: "boss_forge",
    title: "Boss Forge",
    tagline: "A weekly squad boss. Every check-in lands a hit; misses let it swing back.",
    scope: "squad",
    Component: BossForge,
    glyph: glyph(
      "M5 6l3 3M19 6l-3 3",
      "M6 11a6 6 0 0 1 12 0v3a6 6 0 0 1-12 0z",
      "M9 12.5h.01M15 12.5h.01",
      "M9.5 16.5c1.5 1 3.5 1 5 0"
    ),
  },
  {
    key: "chain_of_fire",
    title: "Chain of Fire",
    tagline: "One shared streak. Everyone checks in or the link waits — freezes for grace.",
    scope: "squad",
    Component: ChainOfFire,
    glyph: glyph(
      { tag: "rect", attrs: { x: 3.2, y: 8, width: 10, height: 8, rx: 4 } },
      { tag: "rect", attrs: { x: 10.8, y: 8, width: 10, height: 8, rx: 4 } }
    ),
  },
  {
    key: "full_court",
    title: "Hoops",
    tagline: "Play your sales day like four quarters of ball. Every knock is a shot; every close is a dunk.",
    scope: "solo",
    Component: Hoops,
    glyph: glyph(
      circle(12, 12, 9),
      "M3 12h18M12 3v18",
      "M5.2 5.2C8 8 8 16 5.2 18.8M18.8 5.2C16 8 16 16 18.8 18.8"
    ),
  },
  {
    key: "the_duel",
    title: "The Duel",
    tagline: "Seven days, one-on-one with your partner. Most real activity takes the win.",
    scope: "partner",
    Component: TheDuel,
    glyph: glyph(
      "M4 20l9-9M14 5l5-1-1 5-4-4z",
      "M20 20l-9-9M10 5L5 4l1 5 4-4z"
    ),
  },
  {
    key: "ascension",
    title: "Ascension",
    tagline: "Climb the fire tiers against rival squads. Promote, hold the line, or drop.",
    scope: "squad",
    Component: Ascension,
    glyph: glyph(
      "M3 20l6-11 3 5 3-6 6 12z",
      "M9 9l3 5 3-6"
    ),
  },
  {
    key: "dawn_raid",
    title: "Dawn Raid",
    tagline: "First frog logged before 9AM takes the day. Win the morning, win momentum.",
    scope: "squad",
    Component: DawnRaid,
    glyph: glyph(
      "M4 18h16",
      "M7.5 18a4.5 4.5 0 0 1 9 0",
      "M12 6.5V4M5.5 9L4 7.5M18.5 9L20 7.5M3 13h1.5M19.5 13H21"
    ),
  },
  {
    key: "eat_the_frog",
    title: "Eat the Frog",
    tagline: "Name the task you're dreading most. Do it first — then swallow it whole.",
    scope: "solo",
    Component: EatTheFrog,
    glyph: glyph(
      circle(7.5, 7.5, 2.6),
      circle(16.5, 7.5, 2.6),
      "M3.5 12.5c0 4.3 3.8 7.5 8.5 7.5s8.5-3.2 8.5-7.5",
      "M8.5 15.5c2.3 1.7 4.7 1.7 7 0"
    ),
  },
  {
    key: "the_pit",
    title: "The Pit",
    tagline: "Put a stake on the line — fire, Cups or ego, never money. Your partner referees.",
    scope: "partner",
    Component: ThePit,
    glyph: glyph(
      "M4 9l8-6 8 6-8 12z",
      "M4 9h16M12 3v18",
      "M4 9l8 4 8-4"
    ),
  },
  {
    key: "grind_room",
    title: "Grind Room",
    tagline: "Clock in together for live focus. We're both grinding now — nobody drifts.",
    scope: "squad",
    Component: GrindRoom,
    glyph: glyph(
      "M6 14v-2a6 6 0 0 1 12 0v2",
      { tag: "rect", attrs: { x: 3.5, y: 13, width: 3.5, height: 6, rx: 1.4 } },
      { tag: "rect", attrs: { x: 17, y: 13, width: 3.5, height: 6, rx: 1.4 } }
    ),
  },
];

// Fast lookup by key (used by ArenaHome's router).
export const ARENA_GAME_MAP = ARENA_GAMES.reduce((acc, g) => {
  acc[g.key] = g;
  return acc;
}, {});

export function getArenaGame(key) {
  return key ? ARENA_GAME_MAP[key] || null : null;
}

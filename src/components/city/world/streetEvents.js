// ════════════════════════════════════════════════════════════════════════
// MAPQUEST STREET — daily events + spark spawns (Phase 9 · REWARDED WALKING)
// One seeded event per day (roughly every other day), and the day's spark
// positions. Pure helpers — cityWorld.js applies the config changes,
// weather.js consults the event, the page announces it once. Events
// recolor nothing and block nothing (real-life-first).
// ════════════════════════════════════════════════════════════════════════

import { seedFor, seedIndex, todayKey } from "./daySeed.js";
import { REWARD } from "./worldFxTuning.js";

export const STREET_EVENTS = {
  "hater-rush": {
    id: "hater-rush",
    name: "HATER RUSH",
    line: "The clowns are out in force today. You know what to do.",
    color: "#FF6B4A",
  },
  "meteor-night": {
    id: "meteor-night",
    name: "METEOR NIGHT",
    line: "The sky is falling — in a good way. Double sparks tonight.",
    color: "#CFE9FF",
  },
  "quiet-morning": {
    id: "quiet-morning",
    name: "QUIET MORNING",
    line: "No hecklers on the street today. Just you and the road.",
    color: "#00FFBF",
  },
};

// The day's event, or null (~half of days are plain days).
export function getDailyEvent(date = new Date()) {
  const day = todayKey(date);
  const picks = [null, "hater-rush", null, "meteor-night", null, "quiet-morning"];
  const id = picks[seedIndex(day, "event", picks.length)];
  return id ? STREET_EVENTS[id] : null;
}

// The day's spark spawns: seeded positions along the street, biased
// toward the unlit stretch (exploration pulls forward). Two heights:
// street level (walk through) and air level (jump for it).
export function getDailySparks(worldWidth, { litFrontierX = 0, date = new Date() } = {}) {
  const day = todayKey(date);
  const event = getDailyEvent(date);
  const count = REWARD.sparksPerDay * (event && event.id === "meteor-night" ? 2 : 1);
  const sparks = [];
  const usable = Math.max(600, worldWidth - 480);
  for (let i = 0; i < count; i += 1) {
    let f = seedFor(day, `spark${i}`);
    // bias ~2/3 of sparks east of the lit frontier — nudging forward
    if (i % 3 !== 0 && litFrontierX > 0 && litFrontierX < worldWidth * 0.8) {
      const eastSpan = worldWidth - litFrontierX - 300;
      f = (litFrontierX + f * Math.max(400, eastSpan)) / worldWidth;
    }
    const x = Math.round(Math.max(260, Math.min(usable, 260 + f * (usable - 260))));
    sparks.push({ i, x, air: i % 3 === 1 }); // every third spark rides high
  }
  return { sparks, day, count };
}

// The three street finds — seeded odd spots, once ever (streetStore).
export function getStreetFinds(world) {
  const width = world.width || 4000;
  const archive = (world.buildings || []).find((b) => b.id === "observatory");
  return [
    {
      id: "fountain-arc",
      x: 470,
      air: true,
      line: "Someone scratched into the curb: KEEP GOING. It's in your handwriting.",
    },
    {
      id: "archive-gap",
      x: archive ? Math.round(archive.x + archive.w + 34) : Math.round(width * 0.45),
      air: false,
      line: "A dry chalk mark tallies 1,000 days. Somebody kept count. Somebody kept going.",
    },
    {
      id: "east-wall",
      x: width - 60,
      air: false,
      line: "Past the last tower, the road just… continues. It was never about the city.",
    },
  ];
}

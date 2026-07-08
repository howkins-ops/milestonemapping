// ════════════════════════════════════════════════════════════════════════
// MAPQUEST WORLD — the weather engine (Phase 3 · THE LIVING SKY)
// One weather kind per real day, picked deterministically from the day
// seed and weighted by time of day (starfall only falls at night; dawn
// leans misty). Same day = same sky for everyone. Pure helpers — the
// scene renders the kind, CSS clocks every drop.
// ════════════════════════════════════════════════════════════════════════

import { seedFor, todayKey } from "./daySeed.js";

// Weighted pick tables per tod key — repeats are weights.
const PICKS = {
  dawn: ["clear", "fogdrift", "drizzle", "clear", "fogdrift", "clear", "embers", "clear"],
  day: ["clear", "rain", "clear", "drizzle", "clear", "clear", "fogdrift", "clear"],
  dusk: ["clear", "embers", "rain", "clear", "fogdrift", "embers", "clear", "drizzle"],
  night: ["clear", "starfall", "rain", "embers", "fogdrift", "starfall", "clear", "drizzle"],
};

export const WEATHER_LABEL = {
  clear: "Clear",
  rain: "Rain",
  drizzle: "Drizzle",
  fogdrift: "Fog drift",
  embers: "Ember drift",
  starfall: "Starfall",
};

// The day's weather for a given time-of-day key ("dawn"|"day"|"dusk"|"night").
// METEOR NIGHT (streetEvents) overrides the night sky with starfall.
export function getWeather(todKey = "night", date = new Date()) {
  const day = todayKey(date);
  const list = PICKS[todKey] || PICKS.night;
  let kind = list[Math.floor(seedFor(day, "wx") * list.length) % list.length];
  if (todKey === "night") {
    // inline event check (kept here to avoid a module cycle): the picks
    // table in streetEvents.js — index 3 of 6 = meteor-night
    const picks = [null, "hater-rush", null, "meteor-night", null, "quiet-morning"];
    if (picks[Math.floor(seedFor(day, "event") * picks.length) % picks.length] === "meteor-night") {
      kind = "starfall";
    }
  }
  return { kind, day, label: WEATHER_LABEL[kind] || kind };
}

// True for kinds that render falling water (drives ripples + wet asphalt).
export function isWet(kind) {
  return kind === "rain" || kind === "drizzle";
}

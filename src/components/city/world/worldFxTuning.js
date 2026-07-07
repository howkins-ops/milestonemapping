// ════════════════════════════════════════════════════════════════════════
// MAPQUEST WORLD — Living City tuning constants (one place, tweak here first)
// Imported by fx.js, useWorldEngine.js, WorldScene.jsx, weather.js,
// useCinematics.js and streetStore.js. Pure data — no imports, no DOM.
// ════════════════════════════════════════════════════════════════════════

export const CAMERA = {
  lerp: 7, // camera chase rate (per-second factor)
  lookAhead: 0.4, // facing-forward anchor (fraction of viewport width)
  lookBehind: 0.5, // facing-left anchor
  turnMs: 400, // ease time when the look-ahead flips
  bumpPx: 2, // landing micro-bump
  runZoom: 0.97, // world widens at a run
  cineZoom: 1.04, // boss / cinematic push-in
  settleEps: 0.5, // camera considered settled within this many px
};

export const JUICE = {
  hitstopMs: 60,
  shakeAmp: 5,
  shakeMs: 220,
  poolSize: 24,
  landDust: 4,
  stompShakeBase: 4, // +1 per chain link, capped
  stompShakeCap: 8,
  coilMs: 70,
  landSquashMs: 160,
};

export const RUN = {
  holdMs: 650, // hold a direction this long to break into a run
  speed: 470, // run speed (walk = engine `speed`, 340)
  decelMs: 200, // release glide back to rest
  stepPx: 34, // one footstep per this many px walked
  skidMs: 160,
};

export const SKY = {
  weatherKinds: ["clear", "rain", "drizzle", "fogdrift", "embers", "starfall"],
  cloudLoopS: [90, 140],
};

export const LIFE = {
  citizenBase: 2,
  citizenPerLit: 1,
  citizenCap: 14,
  tramMax: 3,
  ambientNodeCap: 30,
};

export const REWARD = {
  sparksPerDay: 12,
  sparkXP: 1,
  sweepXP: 15,
  mPerPx: 1 / 160, // 160px ≈ 1m
  odometerFlushMs: 2000,
};

export const PERF = {
  animNodesFull: 90,
  animNodesLite: 40,
  liteCoreHeuristic: 4, // hardwareConcurrency ≤ this → auto-demote to LITE
};

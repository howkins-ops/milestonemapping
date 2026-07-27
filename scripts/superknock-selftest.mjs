#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════════════════
   SUPER KNOCK — headless self-test.

       node scripts/superknock-selftest.mjs

   This repo has no test runner installed, and does not need one: everything
   worth proving here is a pure function of numbers. Plain node:assert.

   THIS FILE IS NOT A REGRESSION SUITE, IT IS A TUNING INSTRUMENT.

   It prints the throw table first and asserts second, because the throw is
   the entire game and it is far cheaper to fix a 33ms window by reading a
   column than by discovering it with a thumb three weeks from now and
   blaming the art, then the input, then the frame rate.

   Read the table. Then trust the gates.
   ════════════════════════════════════════════════════════════════════════ */
import assert from "node:assert/strict";
import {
  HANGER, MAILBOX, FACADE, SEGWAY, CART, KNOCK, QUOTA, LEAD, FIGHT,
  BANDS, LANE_TOTAL_M, ROAD_CENTER_X, arrivalZ, flightTime, knockWindow,
  DAY_REAL_S, WINDOWS, HOUSE_COUNT, HOUSE_SPACING_M,
} from "../src/components/anger/superknock/skTuning.js";
import {
  buildStreet, targetBoxes, mailboxBox, houseAt, rng, FAMILIES, PROPS,
} from "../src/components/anger/superknock/skStreet.js";
import {
  resolveThrow, predictLanding, zAt, groundTime, hangerAt, launch, stepHanger,
  MAX_REACH, windowMs, LAWN_PAD_M, zoneFor,
} from "../src/components/anger/superknock/skThrow.js";
import {
  createRide, stepRide, throwHanger, rideResult, surfaceMul, bandAt,
} from "../src/components/anger/superknock/skRideSim.js";
import { STREET_LENGTH_M, GRUDGE, SURPLUS_BANK_CAP } from "../src/components/anger/superknock/skTuning.js";
import { PORCH, porchProject, porchRect } from "../src/components/anger/superknock/skStreet.js";
import {
  createWeek, grudgeTier, houseState, applyRide, applyDoor, endDay, quotaFor,
  expectedSales, packHouses, unpackHouses, WEDNESDAY, SUNDAY, FINAL_HOUSE,
} from "../src/components/anger/superknock/skWeek.js";
import {
  sweetBand, meterVerdict, createKnockMeter, stepKnockMeter, stopKnockMeter,
  canRetry, knockOutcome, createWait, stepWait,
} from "../src/components/anger/superknock/skKnock.js";
import {
  createFight, stepFight, playCard, eatIt, closeIt, walkAway, playerPower,
  packFight, unpackFight,
} from "../src/components/anger/superknock/skFight.js";
import { CARDS, TELLS, OBJECTIONS, REBUTTALS } from "../src/components/anger/superknock/skObjections.js";
import { saveSize } from "../src/components/anger/superknock/skStore.js";
import { readFileSync } from "node:fs";

/* Boxer.jsx cannot be imported by node, so its POSES table is read as TEXT.
   Worth the ugliness: a tell whose name has no matching pose silently falls
   back to `guard`, the boss becomes unreadable, and NO BUILD CATCHES IT.
   The Door hit exactly this and added a static check for the same reason. */
const POSE_NAMES = (() => {
  const src = readFileSync(new URL("../src/components/anger/door/Boxer.jsx", import.meta.url), "utf8");
  const block = src.slice(src.indexOf("const POSES"), src.indexOf("export const POSE_NAMES"));
  return [...block.matchAll(/^\s{2}(\w+):\s*P\(/gm)].map((m) => m[1]);
})();
import {
  createClock, remaining, charge, pauseClock, resumeClock, timeOfDay, isOut,
  packClock, unpackClock,
} from "../src/components/anger/superknock/skClock.js";

/* ── harness ──────────────────────────────────────────────────────────────*/
let N = 0, FAILED = 0;
const ok = (cond, msg) => {
  N++;
  try { assert.ok(cond, msg); } catch (e) { FAILED++; console.error(`  ✗ ${msg}`); }
};
const eq = (a, b, msg) => {
  N++;
  try { assert.equal(a, b, msg); } catch { FAILED++; console.error(`  ✗ ${msg}  (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }
};
const near = (a, b, tol, msg) => {
  N++;
  try { assert.ok(Math.abs(a - b) <= tol, msg); } catch { FAILED++; console.error(`  ✗ ${msg}  (got ${a}, want ${b}±${tol})`); }
};
const head = (s) => console.log(`\n\x1b[1m${s}\x1b[0m`);
const f2 = (n) => (n === null || n === undefined ? "  —  " : n.toFixed(2).padStart(6));
const f0 = (n) => (n === null || n === undefined ? "  — " : Math.round(n).toString().padStart(4));

const STREET = buildStreet({ street: 1, seed: 1234 });
const HOUSE_L = STREET.houses.find((h) => h.side === "L");
const HOUSE_R = STREET.houses.find((h) => h.side === "R");

/* ═══════════════════════════════════════════════════════════════════════
   TABLE 1 — THE ARC. What distance buys you what height.
   ═══════════════════════════════════════════════════════════════════════ */
head("TABLE 1 · THE ARC — arrival height is a pure function of distance");
console.log("  dist(m)  flight(s)  arrive z(m)   zone");
for (let d = 2; d <= 18; d += 1) {
  const z = arrivalZ(d);
  const t = flightTime(d);
  const zone = d > MAX_REACH ? "falls short" : zoneFor(d);
  const bar = "█".repeat(Math.max(0, Math.round(z * 10)));
  console.log(`  ${f2(d)}   ${f2(t)}    ${f2(z)}    ${zone.padEnd(8)} ${bar}`);
}
console.log(`  max reach: ${MAX_REACH.toFixed(2)}m   (ground at t=${groundTime.toFixed(3)}s)`);

/* ═══════════════════════════════════════════════════════════════════════
   TABLE 2 — THE THREE LATERAL ZONES, as ridden.
   ═══════════════════════════════════════════════════════════════════════ */
head("TABLE 2 · THE LANES — what each lane actually offers");
console.log("  playerX dist  arr.z  BEST VALUE             MOST RELIABLE          surface");

/** Every outcome reachable from a lane, with the release window that buys it. */
function laneScan(x, vF = 9, side = "L", house = HOUSE_L) {
  const stepY = 0.01;
  const tally = new Map();
  /* Scan back far enough to cover the full forward lead at this speed — a
     road-centre handle shot is released ~9m BEFORE the handle it hooks. */
  for (let dy = -(vF * 1.7); dy <= FACADE.frontageM + 5; dy += stepY) {
    const r = resolveThrow({ street: STREET, x0: x, y0: house.y + dy, vF, side });
    const t = tally.get(r.key) || { key: r.key, pts: r.pts, lead: r.lead, n: 0 };
    t.n++;
    tally.set(r.key, t);
  }
  return [...tally.values()].map((t) => ({ ...t, winMs: (t.n * stepY / vF) * 1000 }));
}
const SCORING = (o) => o.pts > 0;
for (let x = 2; x <= 22; x += 1) {
  const d = x; // distance to the left facade == x
  const z = d < HANGER.minThrowM ? null : arrivalZ(d);
  const band = BANDS.find((b) => x >= b.from && x < b.to);
  const scan = laneScan(x).filter(SCORING);
  const fmt = (o) => (o ? `${o.key.padEnd(8)}${String(o.pts).padStart(5)}pts ${f0(o.winMs)}ms` : "nothing".padEnd(22));
  const byValue = [...scan].sort((a, b) => b.pts - a.pts)[0];
  /* "Most reliable" = the widest release window worth having. A lane that can
     theoretically hook a handle inside a 12ms slot is not a lane that offers
     you a handle, and the value column alone would lie about that. */
  const byWidth = [...scan].sort((a, b) => b.winMs - a.winMs)[0];
  console.log(`  ${f2(x)}  ${f2(d)} ${f2(z)}  ${fmt(byValue)}  ${fmt(byWidth)}  [${band.key}]`);
}

/* ═══════════════════════════════════════════════════════════════════════
   TABLE 3 — THE RELEASE WINDOW. The gate that decides if this is a game.
   ═══════════════════════════════════════════════════════════════════════ */
head("TABLE 3 · THE SKILL — release-timing window in ms (the real gate)");
const handleW = FACADE.boxes.handle.w;
const snapW = handleW + 2 * HANGER.snapM;
console.log(`  handle box ${handleW}m wide, +${HANGER.snapM}m snap each side → ${snapW.toFixed(2)}m effective`);
console.log("  speed(m/s)   raw window   with snap   verdict");
const SPEEDS = [4, 6, 6.75, 9, 12, 15];
const winAt = {};
for (const v of SPEEDS) {
  const raw = windowMs(handleW, v);
  const snapped = windowMs(snapW, v);
  winAt[v] = snapped;
  let verdict = "ok";
  if (snapped > 200) verdict = "generous (you're crawling — the cart is coming)";
  else if (snapped < 55) verdict = "TOO TIGHT";
  console.log(`  ${f2(v)}      ${f0(raw)}ms     ${f0(snapped)}ms    ${verdict}`);
}
console.log(`  cart trigger speed: ${(SEGWAY.maxSpeed * CART.triggerPct).toFixed(2)} m/s`);
console.log("  other targets:");
console.log(`    mailbox  ${MAILBOX.w}m → ${f0(windowMs(MAILBOX.w + 2 * HANGER.snapM, 9))}ms @cruise`);
console.log(`    door     ${FACADE.boxes.door.w}m → ${f0(windowMs(FACADE.boxes.door.w, 9))}ms @cruise`);
console.log(`    mat      ${FACADE.boxes.mat.w}m → ${f0(windowMs(FACADE.boxes.mat.w, 9))}ms @cruise`);
console.log(`    window   ${FACADE.boxes.window.w}m → ${f0(windowMs(FACADE.boxes.window.w, 9))}ms @cruise`);

/* ═══════════════════════════════════════════════════════════════════════
   TABLE 4 — THE RIDE, on a real screen.
   ═══════════════════════════════════════════════════════════════════════ */
head("TABLE 4 · THE RIDE — lead time on a real phone");
for (const vw of [320, 390, 430]) {
  const ppm = Math.max(13.3, Math.min(18, vw / LANE_TOTAL_M));
  const vh = 780;
  const visible = vh / ppm;
  const ahead = 0.78 * vh / ppm;
  console.log(`  ${vw}px wide → ${ppm.toFixed(2)} px/m · ${visible.toFixed(1)}m on screen · ${ahead.toFixed(1)}m ahead`);
  for (const v of [4, 9, 15]) console.log(`      @${String(v).padStart(2)} m/s → ${(ahead / v).toFixed(2)}s of lead`);
}
const runS = (60 + HOUSE_COUNT * HOUSE_SPACING_M + 70) / SEGWAY.cruise;
console.log(`  full run at cruise: ${runS.toFixed(0)}s · a house every ${(HOUSE_SPACING_M / SEGWAY.cruise).toFixed(2)}s`);

/* ═══════════════════════════════════════════════════════════════════════
   TABLE 5 — THE KNOCK, day by day.
   ═══════════════════════════════════════════════════════════════════════ */
head("TABLE 5 · THE KNOCK — sweet-spot window by day");
const DAYNAME = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
for (let d = 0; d < 7; d++) {
  const w = knockWindow(d);
  console.log(`  ${DAYNAME[d]}  sweep ${f2(w.sweepS)}s × ${(w.widthPct * 100).toFixed(1)}% = ${f0(w.windowS * 1000)}ms   quota ${QUOTA[d]}`);
}

/* ═══════════════════════════════════════════════════════════════════════
   ASSERTIONS
   ═══════════════════════════════════════════════════════════════════════ */

head("SUITE 1 · the arc");
near(arrivalZ(12), 0.95, 0.02, "12m lands at handle height (0.95m)");
near(flightTime(12), 1.0, 0.001, "12m is a 1.00s flight");
ok(arrivalZ(6) > 1.3, "6m arrives at window height");
ok(arrivalZ(16) < 0.28, "16m arrives at mat height");
near(MAX_REACH, 16.2, 0.2, "a hanger carries ~16.2m before it hits the dirt");
ok(zAt(0) === HANGER.z0, "launches from hand height");
ok(zAt(groundTime) < 1e-9, "z is zero at ground time");
{
  // the arc must actually rise before it falls, or it doesn't read as a throw
  const apexT = HANGER.vz0 / HANGER.G;
  ok(zAt(apexT) > HANGER.z0, "the arc rises before it falls (it reads as a throw, not a drop)");
  near(zAt(apexT), 1.672, 0.01, "apex is ~1.67m");
}

head("SUITE 2 · the three lanes are real and do not overlap");
{
  const zones = {};
  for (let d = 2.5; d <= 16; d += 0.05) {
    const z = zoneFor(d);
    if (!zones[z]) zones[z] = [d, d];
    zones[z][1] = d;
  }
  ok(zones.window, "there is a window zone");
  ok(zones.handle, "there is a handle zone");
  console.log("   zone ranges (m):", Object.entries(zones).map(([k, v]) => `${k} ${v[0].toFixed(1)}-${v[1].toFixed(1)}`).join(" · "));
  ok(zones.handle[0] > zones.window[1], "the handle zone starts beyond the window zone — no overlap");
  ok(zones.handle[0] > 10 && zones.handle[1] < 13.5, "the handle is only reachable from the middle of the road");
  ok(ROAD_CENTER_X >= zones.handle[0] && ROAD_CENTER_X <= zones.handle[1], "road centre IS handle range — the best reward is in the most dangerous lane");
  const lawnMax = 5.0;
  ok(zones.window[0] < lawnMax, "riding the lawn puts you in window range, not handle range");
}

head("SUITE 3 · resolution — every outcome is reachable, none is free");
const at = (x0, dy, vF = 9, side = "L", house = HOUSE_L) =>
  resolveThrow({ street: STREET, x0, y0: house.y + dy, vF, side });

{
  // aim the handle from road centre: release 9m before the handle's y
  const hb = targetBoxes(HOUSE_L).find((b) => b.key === "handle");
  const yMid = (hb.y0 + hb.y1) / 2;
  const r = resolveThrow({ street: STREET, x0: 12, y0: yMid - 9 * 1.0, vF: 9, side: "L" });
  eq(r.key, "hooked", "road centre + perfect timing = HOOKED");
  eq(r.pts, 500, "a hook is 500");
  eq(r.lead, "hot", "a hook makes the lead HOT");
}
{
  // same shot, released 0.6m late — outside the box but inside the snap
  const hb = targetBoxes(HOUSE_L).find((b) => b.key === "handle");
  const yMid = (hb.y0 + hb.y1) / 2;
  const late = resolveThrow({ street: STREET, x0: 12, y0: yMid - 9 + 0.45, vF: 9, side: "L" });
  ok(["hooked", "nearmiss"].includes(late.key), "a 45cm miss is still rescued by the snap");
  const wild = resolveThrow({ street: STREET, x0: 12, y0: yMid - 9 + 1.6, vF: 9, side: "L" });
  ok(wild.key !== "hooked", "a 1.6m miss is NOT rescued — the snap is an assist, not an autohit");
}
{
  const r = at(4, FACADE.boxes.window.y - 4 * flightTime(4) + 0.4, 4);
  eq(r.key, "window", "close range + the window's y column = THROUGH THE WINDOW");
  eq(r.pts, 1000, "a window is 1000");
  eq(r.lead, "hostile", "a window makes them HOSTILE");
}
{
  /* THE PRICE OF GLASS. Windowing everything was the dominant strategy until
     `maxD` existed: 1000pts on a 100ms window from seven metres of lane. Now
     the only lane that reaches a pane is his grass. */
  const canSmash = [];
  for (let x = 2.5; x <= 16; x += 0.25) {
    if (laneScan(x).some((o) => o.key === "window")) canSmash.push(x);
  }
  const lawnEnd = BANDS.find((b) => b.key === "lawn").to;
  ok(canSmash.length > 0, "a window is reachable at all");
  ok(Math.max(...canSmash) <= lawnEnd + 1.2, `glass is only breakable from ≤${(lawnEnd + 1.2).toFixed(1)}m — you have to be ON HIS LAWN`);
  ok(Math.max(...canSmash) - Math.min(...canSmash) < 4.5, "the window lane is narrow — a decision, not a default");
  const roadStart = BANDS.find((b) => b.key === "road").from;
  ok(Math.max(...canSmash) < roadStart + 1.5, "you cannot smash glass from the safety of the road");
}
{
  /* And the handle must NOT be reachable from the grass, or the lawn becomes
     strictly better than the road and the whole risk economy inverts. */
  const grassHooks = [];
  for (let x = 1; x <= 6; x += 0.25) {
    if (laneScan(x).some((o) => o.key === "hooked")) grassHooks.push(x);
  }
  eq(grassHooks.length, 0, "the handle is UNREACHABLE from the lawn — riding the grass makes you worse, not better");
}
{
  const r = at(1.5, FACADE.doorY);
  eq(r.key, "placed", "inside minThrow = PLACED");
  eq(r.lead, "lukewarm", "placed is lukewarm");
}
{
  // from the far kerb the mailbox is in reach
  const mb = mailboxBox(HOUSE_L);
  const tm = Math.abs(MAILBOX.offsetX - 16.5) / HANGER.vLat;
  const r = resolveThrow({ street: STREET, x0: 16.5, y0: (mb.y0 + mb.y1) / 2 - 9 * tm, vF: 9, side: "L" });
  eq(r.key, "mailbox", "far lane + timing = IN THE BOX");
  eq(r.lead, null, "the mailbox scores but never sets a lead state");
}
{
  // THE KEY STRUCTURAL ASSERTION: a handle shot must sail OVER the mailbox
  const hb = targetBoxes(HOUSE_L).find((b) => b.key === "handle");
  const yMid = (hb.y0 + hb.y1) / 2;
  for (const vF of [4, 6, 7, 8, 9, 10, 12, 15]) {
    const r = resolveThrow({ street: STREET, x0: 12, y0: yMid - vF * 1.0, vF, side: "L" });
    ok(r.key !== "mailbox", `@${vF}m/s a road-centre handle shot is not eaten by the mailbox`);
  }
  const zm = zAt(Math.abs(MAILBOX.offsetX - 12) / HANGER.vLat);
  ok(zm > MAILBOX.z + MAILBOX.h, `from road centre the hanger passes ${zm.toFixed(2)}m up — clean over the ${(MAILBOX.z + MAILBOX.h).toFixed(2)}m slot`);
}
{
  // throwing clean across the street falls short into the target's lawn
  const r = at(19, FACADE.doorY - 9);
  ok(r.key === "lawn" || r.key === "hedge", "a cross-street throw falls short");
  ok(r.pts === 0, "and scores nothing");
}
{
  // a throw that lands nowhere near a house is harmless, not fatal
  const gap = HOUSE_L.y + HOUSE_SPACING_M; // between two same-side houses
  const r = resolveThrow({ street: STREET, x0: 12, y0: gap, vF: 9, side: "L" });
  eq(r.lead, null, "a throw into the gap changes no lead state (IN THE HEDGE)");
  eq(r.key, "hedge", "…and says so");
}
{
  // landing on his lawn DOES kill the lead
  const r = resolveThrow({ street: STREET, x0: 12, y0: HOUSE_L.y - 9 - 3, vF: 9, side: "L" });
  eq(r.key, "lawn", "landing in his front yard is IN THE BUSHES");
  eq(r.lead, "dead", "…and that door will not open today");
}

head("SUITE 4 · the snap can never cheat");
{
  // a window-height throw whose y happens to line up with the handle
  const hb = targetBoxes(HOUSE_L).find((b) => b.key === "handle");
  const yMid = (hb.y0 + hb.y1) / 2;
  const t = flightTime(5);
  const r = resolveThrow({ street: STREET, x0: 5, y0: yMid - 9 * t, vF: 9, side: "L" });
  ok(r.key !== "hooked", "correct y at the wrong HEIGHT is never a hook — the snap is Y-only");
}
{
  const boxes = targetBoxes(HOUSE_L);
  eq(boxes[0].key, "handle", "the handle is tested FIRST or it can never be hit (it sits inside the door)");
  ok(boxes.some((b) => b.key === "window"), "the window is a target box");
}

head("SUITE 5 · both sides of the street behave identically");
{
  const hbL = targetBoxes(HOUSE_L).find((b) => b.key === "handle");
  const hbR = targetBoxes(HOUSE_R).find((b) => b.key === "handle");
  const rL = resolveThrow({ street: STREET, x0: 12, y0: (hbL.y0 + hbL.y1) / 2 - 9, vF: 9, side: "L" });
  const rR = resolveThrow({ street: STREET, x0: LANE_TOTAL_M - 12, y0: (hbR.y0 + hbR.y1) / 2 - 9, vF: 9, side: "R" });
  eq(rL.key, "hooked", "left facade hooks from road centre");
  eq(rR.key, "hooked", "right facade hooks from road centre");
  eq(hbL.facadeX, 0, "left boxes sit on x=0");
  eq(hbR.facadeX, LANE_TOTAL_M, "right boxes sit on x=24");
}

head("SUITE 6 · the release-window gate");
ok(winAt[9] >= 90 && winAt[9] <= 145, `cruise window is ${Math.round(winAt[9])}ms — hard but fair (want 90-145)`);
ok(winAt[15] >= 55, `top speed still leaves ${Math.round(winAt[15])}ms (want ≥55)`);
ok(winAt[6.75] <= 200, `the slowest safe speed gives ${Math.round(winAt[6.75])}ms — generous, not free (want ≤200)`);
ok(winAt[4] > winAt[15] * 2.5, "slowing down is a real, large advantage — speed IS the difficulty dial");
ok(windowMs(MAILBOX.w + 2 * HANGER.snapM, 9) > winAt[9], "the mailbox is easier than the handle");
ok(windowMs(FACADE.boxes.mat.w, 9) > winAt[9], "the mat is easier than the handle");

head("SUITE 7 · the cart can actually fire, and can actually be escaped");
{
  const trig = SEGWAY.maxSpeed * CART.triggerPct;
  ok(trig > SEGWAY.minSpeed, `cart trigger ${trig} > minSpeed ${SEGWAY.minSpeed} — it can fire on tarmac at all`);
  ok(CART.speedOf(4) > 4, "the cart outpaces a crawler");
  ok(CART.speedOf(11) <= 11, "…but a rider at speed outruns it");
  ok(CART.speedOf(15) < 15, "top speed always escapes");
  eq(CART.speedOf(2), 7, "a crawler cannot dodge it by being slower");
  ok(CART.spawnBehindM <= 11, "the cart spawns ON SCREEN — dread, not a jump-scare");
}

head("SUITE 8 · surfaces");
{
  const grassSpeed = Math.max(SEGWAY.minSpeed, Math.min(SEGWAY.maxSpeed, 9)) * 0.70;
  near(grassSpeed, 6.3, 0.01, "clamp-then-multiply: grass at cruise = 6.3 m/s");
  ok(grassSpeed < SEGWAY.minSpeed * 1.6, "the grass penalty is real, not floated away by minSpeed");
  const bandsCover = BANDS.reduce((a, b) => a + (b.to - b.from), 0);
  eq(bandsCover, LANE_TOTAL_M, "the lateral bands tile the street exactly");
  for (let i = 1; i < BANDS.length; i++) eq(BANDS[i].from, BANDS[i - 1].to, `band ${i} starts where band ${i - 1} ends`);
}

head("SUITE 9 · the street is deterministic");
{
  const a = buildStreet({ street: 1, seed: 99 });
  const b = buildStreet({ street: 1, seed: 99 });
  eq(JSON.stringify(a.houses), JSON.stringify(b.houses), "same seed → byte-identical street");
  const c = buildStreet({ street: 1, seed: 100 });
  ok(JSON.stringify(a.houses) !== JSON.stringify(c.houses), "different seed → different street");
  eq(a.houses.length, HOUSE_COUNT, "twenty houses");
  eq(a.houses.filter((h) => h.side === "L").length, 10, "ten on the left");
  eq(a.houses.filter((h) => h.side === "R").length, 10, "ten on the right");
  for (let i = 1; i < a.houses.length; i++) {
    ok(a.houses[i].side !== a.houses[i - 1].side, `house ${i} alternates sides — a rhythm, not a stutter`);
  }
  eq(a.houses.filter((h) => h.noSolicit).length, 6, "street 1 has six NO SOLICITING houses");
  eq(buildStreet({ street: 3, seed: 99 }).houses.filter((h) => h.noSolicit).length, 14, "street 3 has fourteen");
  a.houses.forEach((h) => {
    ok(h.props.length >= 2 && h.props.length <= 3, `house ${h.idx} has 2-3 props`);
    ok(h.families.length === 5, `house ${h.idx} ranks all five objection families`);
    ok(PROPS[h.props[0]], `house ${h.idx}'s identity prop is real`);
    ok(FAMILIES.includes(h.families[0]), `house ${h.idx}'s top family is real`);
  });
  // props must actually predict the fight, or the pre-knock read is decoration
  a.houses.forEach((h) => {
    const propFams = new Set(h.props.map((p) => PROPS[p].family));
    ok(propFams.has(h.families[0]), `house ${h.idx}: the yard tells you the top family — the read has teeth`);
  });
}

head("SUITE 10 · targetBoxes is the single source of truth");
{
  const h = HOUSE_L;
  const b1 = targetBoxes(h), b2 = targetBoxes(h);
  eq(JSON.stringify(b1), JSON.stringify(b2), "targetBoxes is pure — canvas and SVG cannot drift");
  const handle = b1.find((b) => b.key === "handle");
  const door = b1.find((b) => b.key === "door");
  ok(handle.y0 >= door.y0 && handle.y1 <= door.y1, "the handle sits inside the door");
  ok(handle.z0 >= door.z0 && handle.z1 <= door.z1, "…in both axes");
  const win = b1.find((b) => b.key === "window");
  ok(win.y1 < door.y0, "the window is a different Y COLUMN, not a different height — so it is a timing choice");
  const mat = b1.find((b) => b.key === "mat");
  eq(mat.z0, 0, "the mat is on the ground");
  ok(mat.y1 - mat.y0 > door.y1 - door.y0, "the mat is the widest target — the forgiving one");
  // every house has identical geometry: the skill must transfer from house 1 to house 20
  const rd = (n) => Math.round(n * 1e4) / 1e4; // house 19 sits at y=820; float noise is not a bug
  const shape = (hh) => JSON.stringify(targetBoxes(hh).map((b) => [b.key, rd(b.y0 - hh.y), rd(b.y1 - hh.y), rd(b.z0), rd(b.z1)]));
  const ref = shape(STREET.houses[0]);
  STREET.houses.forEach((hh) => eq(shape(hh), ref, `house ${hh.idx} has identical geometry — the skill transfers`));
}

head("SUITE 11 · a hanger in flight");
{
  const h = launch({ street: STREET, x0: 12, y0: HOUSE_L.y, vF: 9, side: "L", spinSeed: 0.5 });
  eq(h.dir, -1, "a left throw travels left");
  near(h.tEnd, 1.0, 0.01, "…for 1.0s");
  const p0 = hangerAt(h, 0);
  near(p0.x, 12, 1e-9, "starts at the rider");
  near(p0.z, HANGER.z0, 1e-9, "…at hand height");
  const pMid = hangerAt(h, 0.5);
  ok(pMid.x < 12 && pMid.x > 0, "travels toward the facade");
  ok(pMid.y > HOUSE_L.y, "and carries forward with the rider's speed");
  ok(pMid.z > HANGER.z0, "and is still rising at the halfway point");
  const pEnd = hangerAt(h, 1.0);
  near(pEnd.x, 0, 1e-6, "lands on the facade plane");
  near(pEnd.y - h.y0, 9.0, 1e-6, "9m of forward lead at cruise — the number you learn");
  let landed = false, t = 0;
  for (let i = 0; i < 200 && !landed; i++) { landed = stepHanger(h, 1 / 60); t += 1 / 60; }
  ok(landed, "stepHanger reports the landing frame exactly once");
  near(t, 1.0, 0.02, "…at the right time");
  eq(stepHanger(h, 1 / 60), false, "and never twice");
}

head("SUITE 12 · the aim ghost cannot lie");
{
  for (const x of [3, 6, 9, 12, 15, 18]) {
    for (const vF of [5, 9, 14]) {
      const y0 = HOUSE_L.y + 2;
      const g = predictLanding({ street: STREET, x0: x, y0, vF, side: "L" });
      const r = resolveThrow({ street: STREET, x0: x, y0, vF, side: "L" });
      eq(g.key, r.key, `ghost matches reality @x${x} v${vF}`);
      eq(g.pts, r.pts, `…including the score @x${x} v${vF}`);
    }
  }
}

head("SUITE 13 · lead states drive the fight");
{
  ok(LEAD.hot.hpMul < LEAD.warm.hpMul, "a HOT lead is an easier fight");
  ok(LEAD.hostile.hpMul > LEAD.warm.hpMul && LEAD.hostile.dmgMul > 1, "a HOSTILE lead is a harder one");
  ok(LEAD.hostile.payMul === 3, "…and pays triple, which is why smashing a window is a real choice");
  eq(LEAD.dead.openS, Infinity, "a DEAD lead never opens");
  ok(LEAD.hot.openS < LEAD.warm.openS && LEAD.warm.openS < LEAD.lukewarm.openS, "warmer doors open sooner");
  ok(LEAD.hostile.openS < LEAD.hot.openS, "a hostile door is FLUNG open");
  ok(LEAD.hot.grace, "a hot lead opens with his guard down");
}

head("SUITE 14 · the knock meter is fair on Sunday");
{
  for (let d = 0; d < 7; d++) {
    const w = knockWindow(d);
    ok(w.windowS * 1000 >= 120, `${DAYNAME[d]} window ${Math.round(w.windowS * 1000)}ms ≥ 120ms (touch latency is 30-60ms)`);
  }
  ok(knockWindow(6).windowS < knockWindow(0).windowS, "Sunday is harder than Monday");
  ok(KNOCK.softRetry, "a too-soft knock is ALWAYS retryable — a sub-100ms hard fail at the end of a 7-minute clock is not a game");
  ok(KNOCK.latencyOffsetS > 0, "the accepted band is offset early to eat touch latency");
}

head("SUITE 15 · the day and the week close");
{
  const total = WINDOWS.reduce((a, w) => a + w.realS, 0);
  eq(total, DAY_REAL_S, "the three windows sum to the day");
  const midday = WINDOWS.find((w) => w.key === "midday");
  const golden = WINDOWS.find((w) => w.key === "golden");
  ok(midday.openMul < 1 && golden.openMul > 1, "9-to-5 knocking fails; golden hours pay — the lesson is mechanical");
  ok(golden.realS > midday.realS, "…and GOLDEN gets the most real playtime, so the lesson isn't just five dead minutes");

  // the arithmetic that decides whether the week is possible at all
  const perHouse = 6 + 5 + 7 + 28; // travel + knock + wait + fight
  const houses = DAY_REAL_S / perHouse;
  console.log(`   ~${houses.toFixed(1)} houses per day at ${perHouse}s each`);
  for (let d = 0; d < 7; d++) {
    const need = QUOTA[d];
    ok(houses >= need + 1, `${DAYNAME[d]}: ${houses.toFixed(1)} houses available vs quota ${need} — reachable with room to fail`);
  }
  eq(QUOTA.length, 7, "seven quotas");
  ok(QUOTA[6] === Math.max(...QUOTA), "Sunday is the hardest day");
}

head("SUITE 16 · the fight is 30 seconds, not 40");
{
  ok(FIGHT.baseHp <= 50, `base hp ${FIGHT.baseHp} — twenty 40-second fights a week is a different, worse game`);
  eq(FIGHT.knockdownsToTko, 1, "one knockdown ends it");
  ok(FIGHT.tellFloorMs >= 420, `tell floor ${FIGHT.tellFloorMs}ms — 220ms is fatal when the answer is a CARD you must read`);
  ok(FIGHT.counterWindowMs >= 300, "the counter window is readable");
  eq(FIGHT.deckSize, 3, "three cards, locked at the knock");
  ok(FIGHT.deckSize < FAMILIES.length, "…out of five families, so you must guess two of them wrong sometimes");
  ok(FIGHT.eatItReduction > 0 && FIGHT.eatItReduction < 1, "EAT IT costs you but is never fatal — no unwinnable hand");
  const hotHp = Math.round(FIGHT.baseHp * LEAD.hot.hpMul);
  const hostileHp = Math.round(FIGHT.baseHp * LEAD.hostile.hpMul);
  console.log(`   hot ${hotHp}hp · warm ${FIGHT.baseHp}hp · hostile ${hostileHp}hp`);
  ok(hotHp >= FIGHT.hpFloor, "even the easiest fight is a fight");
}

head("SUITE 17 · the ride — the four rules that cannot break");
{
  const mk = () => createRide({ street: STREET, seed: 5, trafficMul: 1 });
  const run = (s, secs, input) => { for (let i = 0; i < secs * 60; i++) stepRide(s, 1 / 60, input); return s; };

  // RULE 1 — one pass
  {
    const s = run(mk(), 3, { throttle: -1, steer: 0 });
    const y1 = s.y;
    run(s, 1, { throttle: -1 });
    ok(s.y > y1, "y only ever increases — there is no turning around");
  }
  // RULE 2 — never stops
  {
    const s = run(mk(), 12, { throttle: -1 });
    ok(s.v >= SEGWAY.minSpeed - 1e-9, `full brake floors at ${SEGWAY.minSpeed} m/s, never zero (got ${s.v.toFixed(2)})`);
    ok(s.y > 0, "…so the rider is still moving");
  }
  {
    const s = run(mk(), 12, { throttle: 1 });
    ok(s.v <= SEGWAY.maxSpeed + 1e-9, "and it tops out at maxSpeed");
  }
  // RULE 3 — throwing never blocks steering
  {
    const s = mk();
    s.x = 12;
    const before = s.x;
    for (let i = 0; i < 30; i++) stepRide(s, 1 / 60, { steer: 1, throwL: i % 3 === 0 });
    ok(s.x > before, "steering still responds while throwing every third frame");
    ok(s.ammo < HANGER.ammo, "…and the throws actually went out");
  }
  // RULE 4 — the run writes phase 3's difficulty
  {
    const s = mk();
    s.x = 12; s.v = 9;
    const hb = targetBoxes(HOUSE_L).find((b) => b.key === "handle");
    s.y = (hb.y0 + hb.y1) / 2 - 9;
    throwHanger(s, "L");
    for (let i = 0; i < 90; i++) stepRide(s, 1 / 60, {});
    eq(s.leads[HOUSE_L.idx], "hot", "a hook writes a HOT lead the fight will read");
  }

  // surfaces bite
  {
    const road = mk(); road.x = 12;
    const lawn = mk(); lawn.x = 2.0;
    run(road, 6, { throttle: 0 });
    run(lawn, 6, { throttle: 0 });
    ok(lawn.y < road.y * 0.85, `the grass is genuinely slower (${lawn.y.toFixed(0)}m vs ${road.y.toFixed(0)}m in 6s)`);
  }
  // ruts are attributed per house, once
  {
    const s = mk();
    s.x = 2.0;
    run(s, 40, { throttle: 0, steer: 0 });
    ok(s.ruts.length > 0, "riding the lawn leaves ruts");
    const perHouse = {};
    s.ruts.forEach((r) => { perHouse[r.houseIdx] = (perHouse[r.houseIdx] || 0) + 1; });
    ok(Object.values(perHouse).every((n) => n === 1), "one rut record per house — grudge cannot be double-charged");
    ok(Object.keys(s.grudge).length === s.ruts.length, "…and each one raises exactly that house's grudge");
  }
  // the cart fires, and can be escaped
  {
    const s = mk();
    s.v = 4; s.x = 12;
    run(s, 5, { throttle: -1 });
    ok(s.cart, "dawdling summons the HOA cart");
    const gap0 = s.y - s.cart.y;
    run(s, 4, { throttle: 1 });
    ok(!s.cart || s.y - s.cart.y > gap0, "getting back on the throttle opens the gap — it is a chase, not a tax");
  }
  {
    const s = mk();
    s.v = 4; s.x = 12;
    const l0 = s.lives;
    for (let i = 0; i < 60 * 40 && s.lives === l0; i++) stepRide(s, 1 / 60, { throttle: -1 });
    ok(s.lives < l0, "…and crawling forever eventually costs a life");
  }
  // ammo is finite and refillable
  {
    const s = mk();
    for (let i = 0; i < 400; i++) stepRide(s, 1 / 60, { throwL: true });
    eq(s.ammo, 0, "the bag runs out");
    ok(throwHanger(s, "L") === null, "…and an empty bag throws nothing");
    ok(s.props.some((p) => p.kind === "bundle"), "there are bundles on the route to refill it");
  }
  // leads improve but never silently downgrade
  {
    const s = mk();
    s.leads[3] = "hot";
    const boxes = targetBoxes(HOUSE_L);
    void boxes;
    // simulate a later mat landing on the same house
    s.hangers.push({ ...launch({ street: STREET, x0: 1.0, y0: HOUSE_L.y + 2, vF: 9, side: "L" }) });
    s.leads[HOUSE_L.idx] = "hot";
    for (let i = 0; i < 60; i++) stepRide(s, 1 / 60, {});
    eq(s.leads[HOUSE_L.idx], "hot", "a worse second throw cannot cool a hot lead");
  }
  {
    const s = mk();
    s.leads[HOUSE_L.idx] = "hot";
    // a window ALWAYS wins — you cannot un-anger a man whose glass you broke
    s.hangers.push(launch({ street: STREET, x0: 4, y0: HOUSE_L.y + FACADE.boxes.window.y - 9 * (4 / HANGER.vLat) + 0.3, vF: 9, side: "L" }));
    for (let i = 0; i < 60; i++) stepRide(s, 1 / 60, {});
    eq(s.leads[HOUSE_L.idx], "hostile", "…but broken glass overrides everything");
  }
  // the run ends, once
  {
    const s = mk();
    s.y = STREET_LENGTH_M - 1;
    run(s, 3, { throttle: 1 });
    ok(s.finished, "the street ends");
    eq(s.outcome, "end", "…cleanly");
    eq(s.hangers.length, 0, "and nothing still in the air scores after the flag");
    const n = s.score;
    run(s, 2, { throwL: true, throttle: 1 });
    eq(s.score, n, "a finished run cannot score again");
  }
  // a full pass produces a usable phase-2 table
  {
    const s = mk();
    let guard = 0;
    while (!s.finished && guard++ < 60 * 240) stepRide(s, 1 / 60, { throttle: 1, throwL: guard % 97 === 0, throwR: guard % 89 === 0 });
    ok(s.finished, "a full-throttle pass completes");
    const res = rideResult(s);
    ok(res.leads && typeof res.leads === "object", "rideResult hands phase 2 a lead table");
    ok(Array.isArray(res.ruts), "…and the ruts to draw tomorrow");
    console.log(`   full pass: ${res.score} pts · ${res.covered}/20 doors touched · ${res.hot} hot · ${res.dead} dead · ${res.livesLeft} lives left`);
  }
}

head("SUITE 18 · the canvas and the SVG cannot disagree");
{
  /* THE seam. The ride canvas draws a house at ride scale, the block strip
     draws it at 26px, and the porch draws it in SVG at full fidelity — on
     three different days, in three different files. If they ever disagree
     about where the handle is, "the hanger you threw IS the lead state"
     dies, and it dies silently. All three read targetBoxes(). */
  const h = HOUSE_L;
  const boxes = targetBoxes(h);
  for (const b of boxes) {
    const r = porchRect(b, h);
    ok(r.w > 0, `${b.key}: porch rect has positive width`);
    ok(r.h > 0, `${b.key}: porch rect has positive height`);
    ok(r.x >= -1 && r.x + r.w <= PORCH.w + 1, `${b.key}: fits the porch viewBox horizontally`);
    ok(r.y >= -1 && r.y + r.h <= PORCH.h + 1, `${b.key}: fits the porch viewBox vertically`);
  }
  const hb = boxes.find((b) => b.key === "handle");
  const db = boxes.find((b) => b.key === "door");
  const hr = porchRect(hb, h), dr = porchRect(db, h);
  ok(hr.x >= dr.x - 0.01 && hr.x + hr.w <= dr.x + dr.w + 0.01, "the handle still sits inside the door AFTER projection");
  ok(hr.y >= dr.y - 0.01 && hr.y + hr.h <= dr.y + dr.h + 0.01, "…in both axes");
  const mr = porchRect(boxes.find((b) => b.key === "mat"), h);
  near(mr.y + mr.h, PORCH.h, 0.01, "the mat still lands on the ground after projection");
  /* ORDER: the projection must not flip the world. Up must stay up. */
  ok(porchProject(0, 2).y < porchProject(0, 0).y, "higher z projects HIGHER on the porch, not lower");
  ok(porchProject(6, 0).x > porchProject(3, 0).x, "further along the frontage projects further right");
  /* and every house projects identically, so the art is house-independent */
  const ref = JSON.stringify(targetBoxes(STREET.houses[0]).map((b) => porchRect(b, STREET.houses[0])).map((r) => [Math.round(r.x * 100), Math.round(r.y * 100)]));
  STREET.houses.forEach((hh) => {
    const got = JSON.stringify(targetBoxes(hh).map((b) => porchRect(b, hh)).map((r) => [Math.round(r.x * 100), Math.round(r.y * 100)]));
    eq(got, ref, `house ${hh.idx} projects identically to the porch`);
  });
}

head("SUITE 19 · the week, and Wednesday");
{
  const w = createWeek({ street: 1, seed: 7 });
  eq(w.houses.length, 20, "twenty house records");
  eq(w.strikes, 0, "no strikes on Monday morning");

  // grudge tiers escalate the way the bible says
  eq(grudgeTier(0).key, "none", "a clean house has no tier");
  eq(grudgeTier(2).key, "watchful", "2 = curtain twitches");
  eq(grudgeTier(5).key, "armed", "5 = floodlight");
  eq(grudgeTier(9).key, "hostile", "9 = dog out");
  eq(grudgeTier(14).key, "boss", "14 = he's on the lawn");
  eq(grudgeTier(14).openMul, 0, "…and that door never opens again");
  for (let i = 1; i < GRUDGE.length; i++) {
    ok(GRUDGE[i].openMul < GRUDGE[i - 1].openMul, `tier ${GRUDGE[i].key} opens less often than ${GRUDGE[i - 1].key}`);
  }

  /* THE KEYSTONE. Monday's window, Wednesday's sign — and it has to be the
     PLAYER'S action that put it there, not a difficulty curve. */
  {
    const wk = createWeek({ street: 1, seed: 7 });
    applyRide(wk, { leads: { 4: "hostile" }, grudge: { 4: 4 }, ruts: [], score: 1000, heat: 1 }, 0);
    ok(wk.houses[4].plywood, "a smashed window boards up");
    ok(wk.houses[4].grudge >= 2, "…and he remembers");
    const monday = houseState(wk, 4, 0, false);
    ok(!monday.noSolicit, "no sign on Monday");
    const wednesday = houseState(wk, 4, WEDNESDAY, false);
    ok(wednesday.noSolicit, "THE KEYSTONE: a sign is up on Wednesday, on the house YOU broke");
    ok(wednesday.openMul < monday.openMul, "…and it is materially harder to open");
    const clean = houseState(wk, 6, WEDNESDAY, false);
    ok(!clean.noSolicit, "a house you never touched has no sign — the signs are yours, not the game's");
  }
  {
    // tyre ruts alone are enough to earn one
    const wk = createWeek({ street: 1, seed: 7 });
    applyRide(wk, { leads: {}, grudge: { 8: 1, 9: 1 }, ruts: [{ h: 8 }, { h: 9 }], score: 0, heat: 0 }, 0);
    applyRide(wk, { leads: {}, grudge: { 8: 1 }, ruts: [{ h: 8 }], score: 0, heat: 0 }, 1);
    ok(houseState(wk, 8, WEDNESDAY, false).noSolicit, "two days of tyre tracks also buys a sign");
    ok(wk.houses[8].tracked, "…and the ruts are recorded to be drawn");
  }

  // a sale warms the neighbours
  {
    const wk = createWeek({ street: 1, seed: 7 });
    applyDoor(wk, 10, "sale", 0);
    ok(houseState(wk, 9, 0, false).warmedByNeighbour, "your yard sign warms the house on the left");
    ok(houseState(wk, 11, 0, false).warmedByNeighbour, "…and the one on the right");
    ok(!houseState(wk, 14, 0, false).warmedByNeighbour, "…but not the whole street");
    ok(houseState(wk, 9, 0, false).openMul > 1, "and that is a real advantage, not a label");
    ok(!houseState(wk, 10, 0, false).workable, "a closed door is not knocked on again");
  }

  // dead leads, and the street-1 mercy
  {
    const s1 = createWeek({ street: 1, seed: 7 });
    applyRide(s1, { leads: { 2: "dead" }, grudge: {}, ruts: [], score: 0, heat: 0 }, 0);
    ok(s1.houses[2].dead, "a hanger in the bushes kills the lead");
    ok(!houseState(s1, 2, 1, false).workable, "…and it is still dead on Tuesday");
    const back = applyRide(s1, { leads: { 2: "hot" }, grudge: {}, ruts: [], score: 0, heat: 0 }, 3);
    ok(!s1.houses[2].dead, "STREET 1 MERCY: a hook later in the week brings it back");
    eq(back[2], "hot", "…as a hot lead");
    ok(s1.houses[2].revived, "…exactly once");

    const s3 = createWeek({ street: 3, seed: 7 });
    applyRide(s3, { leads: { 2: "dead" }, grudge: {}, ruts: [], score: 0, heat: 0 }, 0);
    applyRide(s3, { leads: { 2: "hot" }, grudge: {}, ruts: [], score: 0, heat: 0 }, 3);
    ok(s3.houses[2].dead, "STREET 3: dead is dead. No mercy.");
  }

  // quota, strikes, and NOT losing the week on one bad Sunday
  {
    const wk = createWeek({ street: 1, seed: 7 });
    wk.salesByDay[0] = 0;
    const r1 = endDay(wk, 0);
    eq(r1.met, false, "missing Monday's quota of 1 is a miss");
    eq(wk.strikes, 1, "…and costs a strike");
    eq(wk.fired, false, "…but NOT the week");
    eq(wk.day, 1, "…and the week rolls on to Tuesday");
    wk.salesByDay[1] = 0;
    endDay(wk, 1);
    eq(wk.fired, false, "two strikes is still not fired");
    wk.salesByDay[2] = 0;
    endDay(wk, 2);
    eq(wk.strikes, 3, "three strikes");
    eq(wk.fired, true, "…and NOW you're fired");
  }
  {
    const wk = createWeek({ street: 1, seed: 7 });
    wk.salesByDay[0] = 4;
    const r = endDay(wk, 0);
    eq(r.met, true, "beating quota is a hit");
    eq(wk.banked, SURPLUS_BANK_CAP, `surplus banks, capped at ${SURPLUS_BANK_CAP}`);
    ok(wk.banked <= SURPLUS_BANK_CAP, "a monster day helps tomorrow without trivialising it");
  }
  {
    const wk = createWeek({ street: 1, seed: 7 });
    wk.houses[3].grudge = 3;
    const r = endDay(wk, WEDNESDAY - 1);
    ok(r.signsComingTomorrow >= 1, "Tuesday night TELLS you the signs are coming — the debt is named out loud");
  }

  // the final house
  {
    const wk = createWeek({ street: 1, seed: 7 });
    ok(houseState(wk, FINAL_HOUSE, 0, false).locked, "the house at the end is locked on Monday");
    ok(!houseState(wk, FINAL_HOUSE, SUNDAY, false).locked, "…and opens on Sunday");
  }

  // and the gate: can a competent player actually clear these quotas?
  for (let d = 0; d < 7; d++) {
    const can = expectedSales(d);
    ok(can >= quotaFor(d), `${DAYNAME[d]}: a competent day yields ~${can.toFixed(1)} sales vs quota ${quotaFor(d)}`);
  }
}

head("SUITE 20 · the knock");
{
  for (let d = 0; d < 7; d++) {
    const band = sweetBand(d);
    ok(band.to > band.from, `${DAYNAME[d]}: the sweet band exists`);
    eq(meterVerdict((band.from + band.to) / 2, d), "sweet", `${DAYNAME[d]}: dead centre is sweet`);
    eq(meterVerdict(0.02, d), "soft", `${DAYNAME[d]}: barely tapping it is too soft`);
    eq(meterVerdict(0.99, d), "hard", `${DAYNAME[d]}: hammering it is too hard`);
  }
  {
    const m = createKnockMeter(0);
    ok(m.sweepS > 0, "the meter sweeps");
    let bounced = false;
    for (let i = 0; i < 600; i++) { stepKnockMeter(m, 1 / 60); if (m.dir === -1) bounced = true; }
    ok(bounced, "it ping-pongs rather than teleporting back to zero");
    ok(m.pos >= 0 && m.pos <= 1, "…and stays in range");
    m.pos = 0.02;
    stopKnockMeter(m);
    eq(m.verdict, "soft", "a soft stop is judged soft");
    ok(canRetry(m), "…and a soft knock is ALWAYS retryable");
    m.pos = 0.99; m.stopped = false;
    stopKnockMeter(m);
    ok(!canRetry(m), "…but a too-hard one is not");
  }
  {
    // lead state governs how fast the door opens, deterministically
    const o = (lead) => knockOutcome({ lead, houseOpenMul: 1, roll: 0 });
    ok(o("hot").openS < o("warm").openS, "a hot door opens sooner than a warm one");
    ok(o("warm").openS < o("lukewarm").openS, "…and warm sooner than lukewarm");
    ok(o("hostile").openS < o("hot").openS, "a hostile door is FLUNG open");
    eq(o("dead").opens, false, "a dead door never opens");
    eq(knockOutcome({ lead: "hot", houseOpenMul: 0, roll: 0 }).opens, false, "…nor does a boss-tier grudge");
  }
  {
    // stance is a real modifier, not flavour
    const back = knockOutcome({ lead: "warm", houseOpenMul: 1, stance: "back", roll: 0.85 });
    const crowd = knockOutcome({ lead: "warm", houseOpenMul: 1, stance: "crowd", roll: 0.85 });
    ok(back.opens && !crowd.opens, "standing back gets you in where crowding the door does not");
    ok(crowd.aggro > back.aggro, "…and crowding him starts the fight angrier");
    const hard = knockOutcome({ lead: "warm", houseOpenMul: 1, verdict: "hard", roll: 0 });
    ok(hard.aggro > 1, "hammering the door costs you for the WHOLE fight");
  }
  {
    const out = knockOutcome({ lead: "hot", houseOpenMul: 1, roll: 0 });
    const w = createWait(out);
    for (let i = 0; i < 60 * 20; i++) stepWait(w, 1 / 60);
    ok(w.opened, "a hot door opens inside the wait");
    const dead = createWait(knockOutcome({ lead: "dead", houseOpenMul: 1, roll: 0 }));
    for (let i = 0; i < 60 * 20; i++) stepWait(dead, 1 / 60);
    ok(dead.expired && !dead.opened, "…and a dead one wastes the full fifteen seconds if you let it");
  }
}

head("SUITE 21 · the fight");
{
  const house = STREET.houses[0];
  const mkF = (over = {}) => createFight({ house, lead: "warm", deck: ["reflex", "deferral", "hostile"], aggro: 1, ...over });

  {
    const f = mkF();
    ok(f.maxHp <= 50, `warm fight is ${f.maxHp}hp — not the 100hp that makes a 40-second bout`);
    ok(mkF({ lead: "hot" }).maxHp < f.maxHp, "a HOT lead is a shorter fight — the hook pays off here");
    ok(mkF({ lead: "hostile" }).maxHp > f.maxHp, "a HOSTILE lead is a longer one");
    ok(mkF({ lead: "hostile" }).dmgMul > f.dmgMul, "…and he hits twice as hard");
    eq(f.deck.length, FIGHT.deckSize, "three cards");
    eq(f.composure, 100, "you start composed");
  }
  {
    // the deck is LOCKED: a family you didn't bring cannot be played
    const f = mkF();
    const r = playCard(f, "ego");
    eq(r.verdict, "notheld", "you cannot play a card you did not bring");
  }
  {
    // EAT IT is always available and never fatal on its own
    const f = mkF();
    let guard = 0;
    while (f.phase !== "tell" && guard++ < 600) stepFight(f, 1 / 60);
    const r = eatIt(f);
    eq(r.verdict, "eat", "EAT IT works when a family lands that you didn't bring");
    ok(f.composure > 0, "…and does not kill you outright");
    ok(f.composure < 100, "…but it costs");
  }
  {
    // a full fight of nothing but EAT IT should LOSE, not stalemate
    const f = mkF();
    let guard = 0;
    while (!f.result && guard++ < 60 * 200) {
      stepFight(f, 1 / 60);
      if (f.phase === "tell") eatIt(f);
    }
    ok(f.result, "a fight of pure blocking resolves");
    ok(f.result !== "sale", "…and never closes the sale — you have to actually counter");
  }
  {
    /* A well-played fight: you READ THE YARD and brought the three families
       his props actually predict, then countered on time. Played across six
       doors, because the two families you didn't bring still show up and
       break a streak — which is the whole reason the deck is three of five. */
    const play = (hh, lead) => {
      const f = createFight({ house: hh, lead, deck: hh.families.slice(0, FIGHT.deckSize), aggro: 1 });
      let guard = 0, closes = 0, ate = 0;
      while (!f.result && guard++ < 60 * 400) {
        stepFight(f, 1 / 60);
        if (f.closeReady) { closeIt(f); closes++; continue; }
        if (f.phase === "tell" && f.atk) {
          const ms = f.strikeAt - f.t * 1000;
          if (ms <= 60 && ms >= -30) {
            if (f.deck.includes(f.atk.family)) playCard(f, f.atk.family);
            else { eatIt(f); ate++; }
          }
        }
      }
      return { f, closes, ate };
    };

    let totalCloses = 0, sales = 0, dur = 0;
    for (let i = 0; i < 6; i++) {
      const r = play(STREET.houses[i], "warm");
      totalCloses += r.closes;
      if (r.f.result === "sale") sales++;
      dur += r.f.t;
      ok(r.f.result, `house ${i}: a played fight resolves`);
    }
    eq(sales, 6, "reading the yard and countering on time closes every door");
    ok(totalCloses > 0, "THE CLOSE fires — the finisher is reachable in normal play");
    const avg = dur / 6;
    ok(avg >= 6 && avg <= 34, `a well-played fight averages ${avg.toFixed(1)}s (want 6-34s, not the 40s+ a 100hp bar gives)`);
    console.log(`   six doors, played well: ${sales}/6 closed · ${totalCloses} finishers · ${avg.toFixed(1)}s average`);

    /* And the fallback: a player who NEVER lands three in a row must still be
       able to grind the sale out on counters alone. No hand is ever locked. */
    const g = createFight({ house: STREET.houses[0], lead: "warm", deck: STREET.houses[0].families.slice(0, 3), aggro: 1 });
    let guard = 0, counters = 0;
    while (!g.result && guard++ < 60 * 400) {
      stepFight(g, 1 / 60);
      if (g.closeReady) { g.closeReady = false; g.streak = 0; continue; } // refuse the finisher
      if (g.phase === "tell" && g.atk) {
        const ms = g.strikeAt - g.t * 1000;
        if (ms <= 60 && ms >= -30) {
          if (g.deck.includes(g.atk.family)) { playCard(g, g.atk.family); counters++; } else eatIt(g);
        }
      }
    }
    eq(g.result, "sale", "…and a player who never uses THE CLOSE can still grind the sale out on counters");
  }
  {
    // composure scales damage — rattled is expensive, not instantly fatal
    const a = mkF(); const b = mkF();
    b.composure = 20;
    ok(playerPower(b) < playerPower(a), "a rattled rep hits softer");
    ok(playerPower(b) > 0.4, "…but never so soft that the fight is unwinnable");
  }
  {
    // resume: five numbers, and always at the top of a fresh tell
    const f = mkF();
    for (let i = 0; i < 200; i++) stepFight(f, 1 / 60);
    f.hp = 20; f.composure = 55;
    const snap = packFight(f);
    ok(snap && snap.hp === 20 && snap.composure === 55, "a live fight packs down to five numbers");
    ok(JSON.stringify(snap).length < 200, "…and is tiny");
    const back = unpackFight(snap, house);
    eq(back.hp, 20, "…and restores his bar");
    eq(back.composure, 55, "…and yours");
    eq(back.phase, "intro", "RESUMES AT THE TOP OF A FRESH TELL — never mid-strike, into damage you never saw");
    const done = mkF(); walkAway(done);
    eq(packFight(done), null, "a finished fight is not resumable");
  }
  {
    // walking away on a nearly-won door books a callback rather than nothing
    const f = mkF();
    f.hp = f.maxHp * 0.2;
    walkAway(f);
    eq(f.result, "callback", "leaving a door you were winning books a callback");
    const g = mkF();
    walkAway(g);
    eq(g.result, "walkaway", "…leaving a fresh one does not");
  }
  {
    // every family has a pose the Boxer rig can actually draw
    Object.entries(TELLS).forEach(([fam, t]) => {
      ok(POSE_NAMES.includes(t.pose), `${fam}'s tell "${t.pose}" is a real Boxer pose — an unknown tell silently falls back to guard and the boss becomes unreadable`);
      ok(t.tellMs >= FIGHT.tellFloorMs, `${fam}'s tell is at least the ${FIGHT.tellFloorMs}ms floor`);
    });
    eq(Object.keys(TELLS).length, 5, "five families");
    eq(Object.keys(CARDS).length, 5, "five cards");
    Object.values(CARDS).forEach((c) => {
      eq(c.name.split(" ").length, 3, `"${c.name}" is a THREE-WORD INSTRUCTION, not a label`);
      ok(c.name === c.name.toUpperCase(), `"${c.name}" is shouted`);
    });
    let objections = 0, rebuttals = 0;
    Object.values(OBJECTIONS).forEach((l) => { objections += l.length; });
    Object.values(REBUTTALS).forEach((l) => { rebuttals += l.length; });
    ok(objections >= 40, `${objections} objections written (want ≥40)`);
    ok(rebuttals >= 30, `${rebuttals} rebuttals written (want ≥30)`);
  }
}

head("SUITE 22 · persistence");
{
  const w = createWeek({ street: 2, seed: 4242 });
  w.day = 3;
  w.strikes = 1;
  w.score = 48200;
  w.weekHeat = 3.4;
  w.salesByDay = [1, 2, 0, 3, 0, 0, 0];
  w.quotaMet = [true, true, false, true, false, false, false];
  w.houses.forEach((h, i) => {
    h.grudge = i % 13;
    h.sold = i % 5 === 0;
    h.plywood = i % 7 === 0;
    h.dead = i % 6 === 0;
    h.tracked = i % 3 === 0;
    h.noSolicit = i % 4 === 0;
  });

  const packed = packHouses(w.houses);
  eq(packed.length, 40, "twenty houses pack into forty characters");
  const back = unpackHouses(packed);
  w.houses.forEach((h, i) => {
    eq(back[i].grudge, Math.min(15, h.grudge), `house ${i} grudge survives the round trip`);
    ["sold", "plywood", "dead", "tracked", "noSolicit"].forEach((k) => {
      eq(back[i][k], h[k], `house ${i} ${k} survives the round trip`);
    });
  });

  const size = saveSize(w);
  ok(size < 400, `the whole week saves in ${size} bytes (budget 400)`);
  console.log(`   save blob: ${size} bytes`);
  ok(size < 3500, "…versus ~3.5KB for twenty raw house objects, uploaded inside the entire user_data blob");
}

head("SUITE 23 · the clock");
{
  const t0 = 1_000_000;
  const c = createClock(t0);
  near(remaining(c, t0), DAY_REAL_S, 0.01, "a fresh day is the full clock");
  near(remaining(c, t0 + 60_000), DAY_REAL_S - 60, 0.01, "and it is DERIVED from the wall clock, never decremented");

  /* THE DEVIATION FROM HOOPS. Hoops snaps forward on return because a
     basketball quarter really did burn. A phone call must not cost you the
     day. */
  pauseClock(c, t0 + 60_000);
  near(remaining(c, t0 + 600_000), DAY_REAL_S - 60, 0.01, "BANKED AND PAUSED — nine minutes in a phone call cost nothing");
  resumeClock(c, t0 + 600_000);
  near(remaining(c, t0 + 610_000), DAY_REAL_S - 70, 0.01, "…and it picks up exactly where it stopped");

  charge(c, 20, t0 + 610_000);
  near(remaining(c, t0 + 610_000), DAY_REAL_S - 90, 0.01, "a soft knock's 20s comes off the banked value AND re-anchors");
  near(remaining(c, t0 + 620_000), DAY_REAL_S - 100, 0.01, "…and is not silently undone by the next read");

  ok(!isOut(c, t0 + 620_000), "not out yet");
  charge(c, 9999, t0 + 620_000);
  ok(isOut(c, t0 + 620_000), "…and the day does end");

  const tod0 = timeOfDay(createClock(t0), t0);
  eq(tod0.window, "morning", "the day starts in the morning");
  eq(tod0.text, "08:00", "at 08:00");
  const late = createClock(t0, 10);
  eq(timeOfDay(late, t0).window, "golden", "and ends in the golden hours");
  ok(timeOfDay(late, t0).openMul > tod0.openMul, "…when far more doors open");
  const mid = createClock(t0, DAY_REAL_S - 150);
  eq(timeOfDay(mid, t0).window, "midday", "with a midday nobody is home for");
  ok(timeOfDay(mid, t0).openMul < 1, "…which is the lesson, made mechanical");

  const p = packClock(c, t0 + 620_000);
  const u = unpackClock(p, t0 + 700_000);
  near(remaining(u, t0 + 700_000), 0, 0.2, "the clock survives a resume");
}

/* ═══════════════════════════════════════════════════════════════════════ */
console.log(`\n${FAILED === 0 ? "\x1b[32m✓" : "\x1b[31m✗"} ${N - FAILED}/${N} assertions passed\x1b[0m\n`);
process.exit(FAILED === 0 ? 0 : 1);

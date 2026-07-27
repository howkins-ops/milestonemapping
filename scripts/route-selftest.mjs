#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════════════════
   THE ROUTE — headless self-test.

       node scripts/route-selftest.mjs

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
  HANGER, MAILBOX, FACADE, SEGWAY, CART, LEAD,
  BANDS, LANE_TOTAL_M, ROAD_CENTER_X, arrivalZ, flightTime,
  HOUSE_COUNT, HOUSE_SPACING_M,
} from "../src/components/anger/route/skTuning.js";
import {
  buildStreet, targetBoxes, mailboxBox, houseAt, rng, FAMILIES, PROPS,
} from "../src/components/anger/route/skStreet.js";
import {
  resolveThrow, predictLanding, zAt, groundTime, hangerAt, launch, stepHanger,
  MAX_REACH, windowMs, LAWN_PAD_M, zoneFor,
} from "../src/components/anger/route/skThrow.js";
import {
  createRide, stepRide, throwHanger, rideResult, surfaceMul, bandAt,
} from "../src/components/anger/route/skRideSim.js";
import { STREET_LENGTH_M } from "../src/components/anger/route/skTuning.js";
import {
  routeStreet, houseForSlug, leadsBySlug, DOOR_SLOTS, _resetRouteStreetForTest,
} from "../src/components/anger/route/routeStreet.js";
import { applyLead, LEAD_TABLE, LEAD_KEYS } from "../src/components/anger/doorLeadTransform.js";
import { DOOR_LADDER, getDoorLevel } from "../src/components/anger/doorLevels.js";

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
  eq(a.houses.filter((h) => h.noSolicit).length, 6, "six of the twenty put up a NO SOLICITING sign");
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

head("SUITE 18 · the seam — five of twenty are Door levels");
{
  const st = routeStreet();
  eq(st.houses.length, 20, "twenty houses on the block");
  const doors = st.houses.filter((h) => h.kind === "door");
  eq(doors.length, 5, "five of them are Door levels");
  eq(st.houses.filter((h) => h.kind === "filler").length, 15, "fifteen are just windows");

  DOOR_LADDER.forEach((lv) => {
    const h = houseForSlug(lv.id);
    ok(h, `${lv.id} has a house on the street`);
    eq(h.kind, "door", `${lv.id}'s house is workable`);
    eq(h.title, lv.title, `${lv.id}'s house carries its title`);
  });
  /* The slots preserve The Door's original proportional spacing on the old
     2480px block, so a returning player walks the same shape of street. */
  const order = doors.map((h) => h.slug);
  eq(JSON.stringify(order), JSON.stringify(["first", "steele", "persist", "steel", "callback"]),
    "the five appear in ladder order along the street");
  for (let i = 1; i < doors.length; i++) ok(doors[i].y > doors[i - 1].y, `door ${i} is further up the street than ${i - 1}`);

  ok(st.gateY > 0 && st.gateY < houseForSlug("steel").y, "the gate stands before the gated house");
  ok(st.gateY > houseForSlug("persist").y, "…and after the one before it");

  // determinism: the street you learn is the street you get back
  _resetRouteStreetForTest();
  eq(JSON.stringify(routeStreet().houses.map((h) => [h.idx, h.slug, Math.round(h.y)])),
    JSON.stringify(st.houses.map((h) => [h.idx, h.slug, Math.round(h.y)])),
    "the route is the SAME street every session — you are meant to learn it");

  // index→slug translation, and fillers dropped
  const table = leadsBySlug({ 2: "hot", 3: "window", 5: "hostile", 11: "dead", 17: "warm" });
  eq(table.first, "hot", "house 2's lead lands on `first`");
  eq(table.steele, "hostile", "house 5's lands on `steele`");
  eq(table.callback, "warm", "house 17's lands on `callback`");
  eq(table["3"], undefined, "a filler's lead is dropped — it was only ever points");
  eq(Object.keys(table).length, 3, "…and only the doors survive");
}

head("SUITE 19 · applyLead — the flyer run becomes the door");
{
  const base = getDoorLevel("first");
  const steele = getDoorLevel("steele");

  // purity
  const snapshot = JSON.stringify(base);
  applyLead(base, "hostile");
  applyLead(base, "dead");
  eq(JSON.stringify(base), snapshot, "applyLead NEVER mutates the authored level — a replay would compound");

  // identity
  eq(applyLead(base, "none"), base, "`none` is the identity — skipping the run plays what shipped");
  eq(applyLead(base, "warm"), base, "`warm` is the identity too — landing on the door is baseline");
  eq(applyLead(base, undefined), base, "…and so is a missing lead");

  // the table actually bites
  const hot = applyLead(base, "hot");
  const dead = applyLead(base, "dead");
  ok(hot.rounds[0].taps < base.rounds[0].taps, `a hook takes ${base.rounds[0].taps} knocks down to ${hot.rounds[0].taps}`);
  ok(dead.rounds[0].taps > base.rounds[0].taps, `the bushes take it up to ${dead.rounds[0].taps}`);
  eq(hot.rounds[0].drain, false, "a hot lead strips the drain off the first round");
  ok(dead.rounds.every((r) => r.drain === true), "a dead lead makes every round bleed back");

  // hp
  eq(hot.finale.hpMul, LEAD_TABLE.hot.hp, "a hot lead scales the bout too");
  eq(applyLead(steele, "hot").finale.hpMul, undefined,
    "…but NEVER Steele: his HP is already arithmetic off the night gallery, and scaling twice would double-pay the whole phase");
  eq(applyLead(steele, "hostile").finale.hpFrom, "objection", "…and hpFrom survives untouched");

  // the guards
  LEAD_KEYS.forEach((k) => {
    const lv = applyLead(base, k);
    ok(Array.isArray(lv.rounds) && lv.rounds.length > 0, `${k}: rounds stays a non-empty array`);
    ok(lv.finale && lv.finale.bout, `${k}: finale.bout survives`);
    lv.rounds.forEach((r, i) => {
      ok(r.taps > 0, `${k}: round ${i} taps stays > 0 — zero would make --p a NaN and blank the door`);
      ok(Number.isInteger(r.taps), `${k}: round ${i} taps is a whole number`);
    });
  });
  DOOR_LADDER.forEach((lv) => {
    LEAD_KEYS.forEach((k) => {
      const out = applyLead(lv, k);
      out.rounds.forEach((r, i) => {
        const src = lv.rounds[i];
        ok(r.taps > 0, `${lv.id}/${k}: round ${i} survives`);
        if (src.special === "bout") ok(r.taps >= 1, `${lv.id}/${k}: a bout round's placeholder taps never hits zero`);
        if (src.skin === "steel" || src.skin === "gate") {
          eq(r.skin, src.skin, `${lv.id}/${k}: a ${src.skin} round keeps its slab — a shifted skin would swap steel for wood mid-level`);
        }
        if (src.special === "chainsaw") {
          ok(r.taps <= Math.ceil(src.taps * 1.2), `${lv.id}/${k}: the chainsaw cut is capped — taps is a DRAG LENGTH there, not a press count`);
        }
        if (src.special === "gallery" && src.gallery) {
          eq(r.taps, src.taps, `${lv.id}/${k}: a gallery round ignores taps (it owns a 90s clock)`);
          ok(r.gallery.seconds > 0, `${lv.id}/${k}: …and its clock is scaled instead`);
        }
      });
    });
  });

  // a dead lead must never lock you out of a five-level ladder
  DOOR_LADDER.forEach((lv) => {
    const d = applyLead(lv, "dead");
    ok(d.rounds.every((r) => r.taps > 0 && r.taps < 200), `${lv.id}: even the worst lead stays playable, never a lockout`);
  });
  console.log(`   first: ${base.rounds.map((r) => r.taps).join("/")} knocks → hot ${hot.rounds.map((r) => r.taps).join("/")} · dead ${dead.rounds.map((r) => r.taps).join("/")}`);
}

/* ═══════════════════════════════════════════════════════════════════════ */
console.log(`\n${FAILED === 0 ? "\x1b[32m✓" : "\x1b[31m✗"} ${N - FAILED}/${N} assertions passed\x1b[0m\n`);
process.exit(FAILED === 0 ? 0 : 1);

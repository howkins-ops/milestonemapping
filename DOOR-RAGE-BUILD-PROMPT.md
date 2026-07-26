# DOOR RAGE — THE BUILD SPINE
### GTA × Paperboy × Punch-Out, one wave at a time

Companion to the Level Bible v2 and the World Bible v3. Those are **content and
systems design**. This is **the build order, what's already real, and what the
engine will and won't let us do.**

> **The thesis, and everything is subordinate to it:**
> *The objection they give you is a literal health bar. If you can't punch it
> off at the door — you go destroy it at 2am.*

---

## 0. STATUS

| Wave | What | State |
|---|---|---|
| **0** | Cloud-sync fix · slug identity · perf fix | ✅ **BUILT + PROVEN** |
| **1** | Officer Steele (4 phases) + the segway cop chase + Heat | ✅ **BUILT, build-green, 106 headless assertions — NOT played in a browser** |
| 2 | Grudges + the paintball reverse-boss | spec below |
| 3 | The two-sided street + the day clock | spec below |
| 4 | Pre-knock reads + the rebuttal deck | spec below |
| 5+ | The remaining eleven levels, arsenal, biomes, weather | spec below |

---

## 1. HARD CONSTRAINTS — read before designing anything else

This is React 18 + Vite + Capacitor. **No 3D, no game engine, no physics
library.** SVG, DOM and canvas-2d. Portrait phone, one thumb.

**The three-camera idea becomes three 2D presentation modes.** Not a
limitation to work around — a decision to design into.

**Laws that are already enforced and must stay enforced:**

- **ZERO EMOJI in game UI.** Icons are `<symbol>`s in `door/GameIcons.jsx`.
- **Never one `drop-shadow` per SVG path.** One filter on the container.
- **Never an infinite animation inside a filtered subtree.**
- **Never decrement a clock in `setInterval`.** Anchor `{atMs}`, derive from
  `Date.now()`, re-derive on `visibilitychange`. A phone that sleeps must not
  lose the game. (Pattern: `Hoops.jsx:858-1074`.)
- **Positions never go through React.** Sim writes transforms to refs; only
  discrete state changes (tier, mode, near-target) reach `setState`.
- **A localStorage key is device-only until it is registered in
  `FEATURE_STORE_KEYS`** (`src/hooks/useAppData.js`). This has silently eaten
  player progress in this project **twice**. Register the key in the same
  commit that creates the store.

---

## 2. WHAT WAVE 1 ACTUALLY BUILT

### The revenge economy is arithmetic, not a cutscene

```js
// DoorLevel.startBout()
hp = max(finale.hpFloor, round(boss.hp * (objectionLeft/100) * hpPctWhenWallFired))
```

Measured: meter 100% → 20 HP morning fight · meter 0% → 6 HP, one punch. Every
future level inherits this for one line of data (`finale.hpFrom: "objection"`).

### Four phases, only one new engine

| Phase | Mechanism | New code |
|---|---|---|
| A — THE DRAW | The **existing** Punch-Out bout. `dodgeVerdict()` only ever asked "did `moved` equal `needed` inside a window", so a rebuttal card is just a wider vocabulary than duck/left/right. | ~90 lines (`RebuttalRack`) |
| B — THE WALL | New `phase: "wall"`, modelled on the `wife` screen. Scripted, unwinnable, by design. | ~40 lines |
| C — THE DEMONSTRATION | `round.special: "gallery"` → `NightGallery`. **The only genuinely new system.** | ~330 lines |
| D — THE MORNING | Existing `brawl` path + the arithmetic above. | data only |

### Three findings that came out of measuring the engine, not guessing

**1 · The physics formula in every textbook is wrong here.** DoorFX steps at a
**fixed 1/60s** with **semi-implicit Euler** (`vy += g·h` *before* `y += vy·h`).
The continuous solution is low by exactly `½·g·T·h` — **4.7px, every shot,
always the same direction.** Inverting the discrete recurrence is exact to
0.0000px:

```js
vy = (ty - y0)/T - 0.5*G*(T + H)     // (T + H), not T. H = 1/60, always.
```

**2 · A lob from the bottom of the screen flies THROUGH the near targets.**
Hitboxes inflate to 34px so thumbs can hit a 15px flamingo, which turns the
flamingo row into a wall across the lower screen. Measured: **10 of 13 shots hit
the wrong object.** Shrinking flight time makes it worse.
**Fix:** the projectile carries the target aim-assist already chose and is deaf
to every other rect until `age >= T`. After that anything can catch it — that's
a real miss. Result: 0/13 wrong at every screen size, no tunnelling even at
T=0.12.

**3 · Where it hits is not where it splats.** Collision fires in the hitbox
padding, so a naive splat appears in mid-air beside the gnome. The visual impact
is clamped into the **drawn art box** before any particle is emitted.

### Stealth is INVERTED from the bible, deliberately

The bible says "duck or get spotted". Hold-to-crouch plus tap-to-fire is two
thumbs. **You are crouched by default and FIRING stands you up** for 400ms. One
input; the stealth layer becomes a *rhythm* problem ("fire between the sweeps")
instead of a dexterity problem, and the combo becomes legible.

Also: **a cone pointed at you is a light in your eyes, not a wedge.** The ring
cam's arc is drawn across the lawn *between* you and the house.

### The chase — GTA V's model, and one load-bearing number

```
segway maxSpeed 430  >  fastest cruiser 320
```

**A cruiser can never catch you in a straight line. You can only lose by being
SPOTTED, never by being outrun.** That converts the chase from a reflex test
into a hiding-and-routing puzzle — the only kind that works with three buttons.
All the pressure comes from `decel 210` (measured: **444px of roll** after you
let go, so you overshoot every hide spot) and `brake 300` (you can't turn round).

Straight from the research, all implemented:

- **Solid stars = spotted. Flashing = searching, and the FLASH RATE is the
  progress bar** — slower flash means closer to free. No timer number on screen.
- **Per-unit FOV**: foot 16° · cruiser 30° · drone 52° half-angles.
- **Re-spotting resets the evade clock to FULL.** Proven: 23.9s vs 12.9s.
- **Ditch the branded polo = −1 star** (GTA Online's mask rule), only while
  hidden, once per chase.
- **Partial cover (the mailbox) breaks ground LOS but not the drone's** — GTA's
  bush-vs-helicopter rule. The drone's cone opens from the **vertical**, because
  a helicopter that's blind directly beneath itself is not a helicopter.
- **Capped at 4 stars.** V's own 5-star is the frustration case: the counterplay
  vocabulary stops growing while the threat count keeps going. Escalate the
  number of things you must *respect*, not the number of things that shoot you.

Comedy model is **Octodad, not Crazy Taxi** — Crazy Taxi's controls are
responsive; it's about permissiveness, not clumsiness. Octodad's rules: tight
intent layer, chaotic body layer, and **invisible helper volumes so awkwardness
never becomes failure**. Hence `magnetPxPerS: 140` toward cover you're already
heading for. *The wobble is the comedy; the success is assisted.*

### Cut from wave 1, on purpose

- **The minimap.** GTA needs one because it's 3D and open. This street is
  1-dimensional, so the honest place to draw a cop's cone is **on the ground in
  front of him**. Biggest deliberate deviation from GTA, and it's correct.
- **5 stars · jump during the chase · tilt steering** (fails in bed, one-handed,
  and for accessibility) · **traffic in the chase** · **persisting an in-flight
  chase** (outcomes persist, chases don't) · **flanking AI** (in 1-D there is
  exactly one interesting question: *is a cop between me and the hedge*).

---

## 3. THE FILES

**Tuning lives in exactly two files. Nothing else may hardcode a threshold.**

```
anger/heat/heatTuning.js      HEAT · CHASE · SEGWAY · HIDES   ← the balance dials
anger/door/galleryTuning.js   the lob solver, MIN_HIT, SNAP_PX, threats
```

```
anger/doorCampaignStore.js    door_campaign_v2 — slug identity + migration
anger/heat/heatStore.js       door_heat_v1 — cloud-synced, anchor-derived cooling
anger/heat/HeatMeter.jsx
anger/chase/chaseSim.js       the GTA brain. Pure. No React, no DOM, no rAF.
anger/chase/ChaseScene.jsx    presentation + input only
anger/door/NightGallery.jsx   phase C
anger/door/NightArt.jsx       facade + 8 drawn props
anger/door/RebuttalRack.jsx   phase A cards
styles/door-night.css (dgn-) · door-chase.css (dc-) · door-heat.css (dh-)
```

---

## 4. THE ROSTER — slugs, and why renumbering is now free

**Ordinal ids are the bug.** `cleared: {2: true}` means "position 2", so
inserting a level silently tells players they beat fights they never saw.

```js
{ id: "steele", order: 2, docId: "L2" }
```

- **`id`** — permanent slug. Progress is keyed by it. **Never changes.**
- **`order`** — ladder position. **Change it freely. One field. No migration.**
- **`docId`** — the bible's numbering, display only.

Gaps in `order` are fine; the ladder sorts, it doesn't count. `nextAfter(slug)`
reads the roster, so unlocking never assumes `order + 1`.

**The migration ran once and never writes the legacy key** — `door_levels_state`
is left byte-identical, so rollback is deleting `door_campaign_v2`. Proven.

| order | slug | title | wave |
|---|---|---|---|
| 1 | `first` | The Door | shipped |
| **2** | **`steele`** | **Officer Steele** | **1** |
| 3 | `persist` | Always Be Persistent | shipped |
| 4 | `steel` | The Steel Door | shipped |
| 5 | `callback` | Never Do Call-Backs | shipped |

Then, as they land: `doormat` · `brutus` · `hendersons` · `spotless` · `patel` ·
`slammer` · `karen` · `gauntlet` · `grandma` · `nick` · `delvecchio`.
Slot them anywhere by editing `order`.

---

## 5. WAVE 2 — GRUDGES + THE REVERSE BOSS

**Why:** without this, revenge is a free reward. Grudges are what make it a
*decision*.

`anger/heat/grudgeStore.js`, key `door_grudge_v1` (**already registered**).
Keep it tiny — `featureStoreSig` stringifies every registered key every 20s, so
no event logs in there.

```js
// { v:1, houses: { steele: { g:0, s:0, lastAt, coldUntil, bossBeaten } }, blockCold }
// g = grudge (this homeowner) · s = suspicion (neighbours talking)
```

| tier | at | mark | openMul |
|---|---|---|---|
| watchful | 2 | twitching curtain | 0.80 |
| armed | 5 | floodlight (reuse `Flashlight` from `GateArt`) | 0.55 |
| hostile | 9 | dog | 0.25 |
| **boss** | 14 | he's on the lawn | 0.00 |

`recordVandalism(houseId, kind)` does four things: bump that house's `g`; give
**each adjacent house +1 suspicion**; if ≥3 houses sit at watchful+, freeze the
whole block for 24h; and add campaign heat. *One rock at #9 makes #12 and #7
harder. Three rocks anywhere closes the street for a day.*

**The reverse boss — reuse, do not build.** It is the L4 rocks round with the
arrows reversed: he fires `fx.projectile({kind:"paintball"})` at you, you have a
`setRect("rep")`, and you fire back with the **already-shipped drag-to-aim
gesture**. Add one `paint` preset to `DoorFX.PRESETS` and a `decal("paint")`
branch — **his house ends the fight permanently paint-decaled**, and that
persistence is the whole payoff. Beating him drops him to *watchful*, never to
zero, and costs **+1 heat** (you just had a paintball firefight on a
residential street).

---

## 6. WAVE 3 — THE STREET + THE DAY CLOCK

**This is the biggest risk in the whole project. Stop and play it before
building anything on top.**

### The crux: you cannot show the fronts of houses on both sides of a road in a
side elevation. Every 2D game cheats. **Use the flip.**

The side you're standing on is fully drawn. The other degrades to a silhouette
band with number plates and status pips. Crossing slides the world vertically
over ~1.2s, **driven by the rAF loop as a sim var, not a CSS transition**, so
it's frame-accurately reversible — turn round at 60% and the flip reverses with
you. *Input is never taken away, because the crossing IS input.*

**This is better than the spec, and it falls out of the constraint:** the far
side's tells are unreadable until you cross, so **crossing buys information**,
not just distance. Lean into it.

### The day clock — with per-window time dilation

12 game-hours, 08:00→20:00. Base rate 1 game-min = 1 real second.

| window | game | scale | **real** |
|---|---|---|---|
| MORNING 8–11 | 3h | 1.0 | 3:00 |
| MIDDAY 11–16 | 5h | **2.0** | **2:30** |
| GOLDEN 16–20 | 4h | **0.7** | **5:43** |

**A flat rate would make MIDDAY five real minutes of nobody answering the
door** — the single largest fun risk in the bible. Dilation keeps the lesson
("9-to-5 knocking fails") while GOLDEN gets the most real playtime.

**One deliberate deviation from the Hoops timer law:** on `hidden`, **bank and
pause**. Hoops snaps forward on return, which is right for a basketball quarter
and wrong here — a phone call at 09:20 must not cost you the day.

Charge the clock **flat by outcome** for a door fight (sale 12 · callback 8 ·
hostile 6 · dead 4). `DoorLevel` is 1700 lines with its own pacing; charging it
in real time would couple the two systems and make the reward feel like a
punishment. `TheRoute.finish()` charges it. **`DoorLevel` needs zero clock
awareness.**

`SKIES` stops being indexed by progress and becomes 6 keyframes interpolated by
`gameMin`. Quantize `--daylight` to ~20 steps before writing — it feeds three
`filter: brightness()` rules.

### Also in wave 3
- **Decompose `TheRoute.jsx`** (art → `streetArt.jsx`, loop → `useRouteEngine.js`).
  **Fork the patterns from `useWorldEngine`, don't import it** — the route needs
  a second axis (sides of a road) that engine genuinely lacks, and importing it
  couples two unrelated games.
- **Kill `onPointerLeave={() => setWalking(0)}`** — a thumb drifting 2px stops
  the rep. Use `setPointerCapture` (`WorldControls.bind()` already does).
- **Odd/even streak**: same side in order builds a multiplier; crossing resets
  it and burns clock; skipping is allowed and permanently marked.

---

## 7. WAVE 4 — PRE-KNOCK READS

Two tables and a join: `doorTells.js` (minivan, hoop, dog bowl, boxes, solar,
boat, overgrown lawn, Ring, two cars) → `rebuttalDeck.js` (`CARDS` — **already
exists**, wave 1 shipped four of them).

**Multiple tells map to one card on purpose** (hoop + toys → `kids`), so a good
reader gets the card from whichever they spot first. Redundancy is the
difficulty dial.

**Art:** ten props at `DoorArt.jsx` fidelity is 2–3 days. Don't. Build a
`<symbol>` sheet like `GameIcons.jsx` — one silhouette path + one accent path
each, ~170 lines total. They're only ever seen at thumbnail or 2× in approach.

**Compose at the LOT level, where `Mailbox` and `YardSign` already live. Zero
edits to `House`.** Six named CSS slots, collision-checked at street-build time.

Progression: `glow` (first ~10 houses) → `count` ("READS 2/4", you know how many
you missed, not which) → `none`.

**The world is only interactive in APPROACH mode.** One rule, and every
tap-vs-hold ambiguity disappears.

### Knock + stance — keep the good half, fake the rest
**Cut body position as a real control** (a drag is ambiguous against tap-to-spot;
a third button crowds the thumb zone). **Get it for free instead: stance is
wherever you stopped walking when you pressed KNOCK.** Stopped >18px back =
`back`; jammed against the door = `crowd`, and if the house has a dog bowl the
dog goes off. Zero new input, and it teaches itself the first time.

Knock variants are **one button read by hold length**: <120ms timid · 120–400ms
confident three · >400ms cop knock · second press within 3s = double-back.
**KNOCK must force-release the walk button**, or a lingering hold corrupts the read.

---

## 8. WAVE 5+ — CONTENT

The remaining eleven levels are **content, not design**, once the above is real.
Each needs: voice lines in `angerVoiceLines.js`, a boss in `punchOut.js`, a
level object in `doorLevels.js`, and a house on the street.

Reuse the existing `special` types where possible. Genuinely new engine needed
only for: **Slammer Lane** (a 5-second microgame harness — nothing like it
exists), **Brutus** (a chase; fork wave 1's chase sim), and **the Condo Tower**
(vertical, no revenge phases possible).

**Karen Voss and Grandma Jean have NO revenge phase, deliberately** — the first
level that takes the toy away is the one that teaches the lesson.

**Arsenal ladder** (slingshot → egg → paintball → super soaker → potato cannon →
t-shirt cannon → leaf blower): a `weapon` field on the gallery config selecting
flight time, splash and heat cost. The solver already takes `T` as a parameter,
so most of the ladder is data.

---

## 9. HOW TO VERIFY WITHOUT A BROWSER

Wave 1 shipped **106 headless assertions** across five suites, and they caught
**six real bugs** that a build could never see — the 4.7px physics bias, the
lob-through-the-flamingos occlusion, splats landing in mid-air, cops seeing
through your face at point-blank, the drone being blind directly beneath itself,
and a day-key that ignored its own clock argument.

**Write the sim headless first, prove it in node, then draw it.** Art cannot fix
a bad rule set, and a phone is an expensive place to discover one.

Suites: migration (14) · lob solver vs the real integrator (3) · Steele level
integrity (32) · chase state machine (33) · heat store (24).

---

## 10. THE CHECKPOINT THAT DECIDES EVERYTHING

From the Level Bible, and it still stands:

> After Officer Steele, do players *want* to close him in the morning — or do
> they just want to shoot more houses?

If it's only the shooting, the sales layer is decoration and has to be rebuilt
*into* the shooting. If they want both, this is a real game.

**Wave 1 is built and proven but has never been played.** That question is
unanswered, and nothing in waves 2–5 should be started until it isn't.

---

## ⚠️ BEFORE ANY STORE BUILD

This wave adds **evading police** and **property vandalism** as core verbs. The
Door already sits behind the app-wide 18+ gate (`hasAdultAck`), which is the
right container — but the content descriptors on the submission answers need a
re-read against `APP-STORE-REJECTION-RISK-REPORT.md` before this ships.
Not a blocker for building. A blocker for submitting.

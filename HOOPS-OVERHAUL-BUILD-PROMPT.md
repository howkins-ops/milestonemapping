# HOOPS — Funnel Rework + Graphics Overhaul · BUILD PROMPT

> Written 2026-07-26. Everything below is **verified against the code**, not assumed.
> Full slice-by-slice plan: `C:\Users\howki\.claude\plans\the-hoops-game-we-buzzing-pony.md`

---

## The file

`src/components/zone/arena/games/Hoops.jsx` — **2,896 lines, imports ZERO CSS.** All 40 `@keyframes` live in one inline `<style>` block (lines 296–368) plus a second nested `<style>` inside `HoopAssembly` (line 2167). Everything else is React inline `style={{}}`. There is no `hoops.css`.

Sibling: `CoachingBreak.jsx` (294) + `CoachingBreak.css` (333, `fc-` prefix) — the only real CSS in the Hoops tree.

**This is a shipped production game** (prod `187196c`→`2fe4416`, polish through `61b61bc`) with live multiplayer and an active 18-hour resume-snapshot system. Nothing here may break gameplay, timing, or the `dunkPhase` choreography.

---

## Jon's complaints, verbatim

1. *"right now 'spoke to' doesnt count on the tracker so at the end of the day its not accurate on how many people i spoke to, how many people objected right off the get go, how many people objected but i still got their name — is the whole concept"*
2. *"i want you to be a special effects graphic designer... upgrade all the graphics and animations, it seems a bit cheap so i want more details and make this look way cooler"*
3. *"even shooting the ball looks kinda cheap and the net still moves after i shoot it"*
4. *"the dunking animation is horrible... buddy just jumps and doesnt even get to the rim, its the horrible dunk, we can do way better"*

---

## Root causes — DIAGNOSED WITH NUMBERS. Do not re-derive.

### The net desync — 239ms, two independent causes

- `resolveShot` calls `setNetSwish` at `travel − 60`, i.e. **1060ms** after tap (240ms windup + 880 − 60).
- But the ball's WAAPI keyframes put it **at the rim at offset 0.66 of an 880ms animation** = 240 + 581 = **821ms**.
- **Delta: 239ms.** The ball is already through and gone when the net finally snaps.
- Second cause: `takeName()` line 1197 **and** the dead `logName()` line 1176 both call `setNetSwish(n => n+1)` — so the net swishes when **no ball was ever shot**.
- Third: `netFall` (line 2167) is a pure `scaleY(1) → 1.55 → 0.8 → 1` squash from `transformOrigin: top center`. A 55% vertical stretch of the whole net reads rubbery, not like a swish.

### The dunk never reaches the rim

- Shooter wrapper: `bottom: 8%` of a ~652px zone = **52px**, `height: 166 × 1.45 = 240.7px` → top of art at **~293px** above the floor.
- `lift` for `jump` is **−102px** (line 2183) → fists top out at **~395px**.
- Rim play line: `RIM_TOP = 112` from zone top → **~540px** above the floor.
- **He is ~145px short. He physically cannot reach.**
- Worse: the dunk ball is drawn at `cy="-20" r="8"` but the SVG is `viewBox="0 -16 76 166"` with **no `overflow:visible`** → **the ball is clipped away entirely.** He dunks nothing, from below the rim.
- Also line 2189 puts `animation: rimHang ... infinite` and a `drop-shadow` filter **on the same node** — a live instance of a perf rule we've been burned by (never an infinite animation inside a filtered subtree).

### The ball is cheap

`Ball()` (2277–2320) is **4 nested CSS divs** — a 24×24 `radial-gradient` sphere + a horizontal seam div + a vertical seam div + a 1px border. No spin, no trail, no squash, no impact particle. Animated by WAAPI (the only WAAPI use in the file). `close.blurb` promises *"SLAM. Backboard shatters."* — **nothing shatters.**

### Two silent no-ops

`animation: "pulse 2s"` (line 545) and `"pulse 1.6s infinite"` (line 2759) reference `@keyframes pulse` which **does not exist anywhere in the repo** (only `pulseGlow`).

### The crowd's real cost

16 rows, `Σ round(70 − 36r/15)` ≈ **832 fans × 3 nodes ≈ 2,570 DOM nodes and ~832 live `crowdBob` animation instances.** Camera flashes (line 1907) call `Math.random()` **during render**.

---

## DECISIONS LOCKED WITH JON — do not re-litigate

| Decision | Locked answer |
|---|---|
| **Rung semantics** | **Exclusive — ONE tap per door**, at the deepest rung reached. `KNOCKED` = "nobody answered." So `DOORS` = sum of all six; `SPOKE TO` = objected + name + pitch + price + close. |
| **OBJECTED cost** | **Flat −5, and it always clanks off the rim.** Streak **survives**. Accuracy **unaffected** (not a shot attempt). Reason: −5 *plus* killing a ×2 combo *plus* dragging FG% would make Jon quietly stop logging objections, destroying the exact accuracy he's asking for. |
| **SPOKE TO (GOT NAME)** | **Becomes a real shot, `make: 1.00`, always swishes.** Fixes a live bug: it currently hardcodes +25 and **skips the hot-zone ×2**, the only rung that doesn't reward a streak. |
| **Delivery** | **Slice 0 first** (net + dunk + funnel), then art in verifiable slices. Never one big unverified diff. |

---

## The six rungs — Jon's order and labels

| # | id | short | sub | pts | make | kind |
|---|---|---|---|---|---|---|
| 1 | `knock` | KNOCKED | NO ANSWER | +10 | 0.78 | shot |
| 2 | `object` | OBJECTED | NOT INTERESTED | **−5** | **0.00** | shot |
| 3 | `name` | SPOKE TO | GOT NAME | +25 | 1.00 | auto |
| 4 | `pitch` | VALUE BUILD | FULL PITCH | +50 | 1.00 | auto |
| 5 | `price` | PRICE DROP | CUSTOMER INTERESTED | +75 | 0.70 | shot |
| 6 | `close` | CLOSE | SALE | +100 | 1.00 | dunk |

`object` carries `penalty: true, breaksStreak: false, countsAccuracy: false`. `make: 0` gives the requested rim clank **for free** — the existing miss frames already arc to the rim, deflect right, and drop out.

Today these live in **two places**: `ACTIONS` (lines 33–38) plus **two inline object literals in the JSX at line 1373** (`id:"slam"` is SPOKE TO; `id:"name"` is GOT NAME). Collapse into one array. `kind` moves onto the def so line 1084's ternary chain dies. A `tone` field (`red`/`gold`/`green`/null) replaces the `isName` / `a.id === "close"` style branches. Rail dispatch collapses to one `onClick={() => takeShot(a)}`.

---

## Slice 0 — DO THIS FIRST (no new files)

### 0a · Net timing
- Delete `setNetSwish` from `takeName` (1197) and `logName` (1176). **Keep `setFlash`** in both — camera flashes on a name are correct.
- `const CONTACT_MS = Math.round(880 * 0.66)` (581, from ball spawn). Fire `setNetSwish` + rim FX there, inside the ball-spawn `setTimeout` (1109–1116).
- **Leave `resolveShot` at `travel − 60`.** Scoring timing is entangled with the multiplayer publish tick and the resume snapshot. Splitting visual impact from bookkeeping is the permanent fix.
- Split the shake: `setRimShake` currently animates the **entire `HoopAssembly`** including pole and backboard — an earthquake, not a clank. New `hpRimClank` (340ms, `translateY(3px) rotate(-1.4deg)` → settle) on the **rim element only** for misses. Keep `shake` on the whole rig for the dunk alone.

### 0b · A dunk that actually dunks
- `Shooter`: extend `viewBox` to `"0 -70 76 220"` + `overflow: visible`; grow the wrapper height to match so `IpadStage` still scales it.
- Retune lift: `jump` ≈ **−250px**, `hang` ≈ **−258px**. **Verify in-browser against `RIM_TOP = 112`** — computed, not measured.
- Add a 4th `dunkPhase` step **`land`** (180ms) between `drop` and `null` in the machine at 1092–1102: landing crouch + floor dust + small shake. `busyRef.current` releases after it.
- Choreograph: `gather` crouch (120ms) → explosive rise with a slight `scale(1.06)` toward the rim → ball **visibly carried up and pushed through the net** → `hang` with rim recoil + violent net bulge → `drop` → `land`.
- Two motion-blur ghosts (opacity .22/.12, `translateY(+14/+28)`, **no filter**) only during `jump`.
- Remove the `drop-shadow` from the Shooter root while `dunkPhase === "hang"`.

### 0c · Data model
```js
const emptyTally = () => ({
  knock: {a:0,m:0}, object: {a:0,m:0}, name: {a:0,m:0},
  pitch: {a:0,m:0}, price: {a:0,m:0}, close: {a:0,m:0},
});
const TALLY_KEYS    = ACTIONS.map(a => a.id);
const SPOKE_KEYS    = ["object","name","pitch","price","close"];   // a human answered
const ACCURACY_KEYS = ACTIONS.filter(a => a.countsAccuracy !== false).map(a => a.id);
const doorsOf = (t) => TALLY_KEYS.reduce((n,k) => n + (t[k]?.a || 0), 0);
const spokeOf = (t) => SPOKE_KEYS.reduce((n,k) => n + (t[k]?.a || 0), 0);
```
The tally key **must equal the action id** (`resolveShot` writes `t[a.id]`), so `slam → object` and `names: int → name: {a,m}` are forced, not cosmetic.

**Negative scoring** in `resolveShot`: flat −5, **no multipliers** (with `hotZone ×2 × inZone 1.15 × quarterBonus 1.5` it becomes −17, punishing momentum). Score **floored at 0** — a negative score breaks `toLocaleString()` in the 43px jumbotron seg font and flips `won = score >= oppScore`. Floatie: `"−5 — ON TO THE NEXT DOOR"`. Gate `attemptsRef` and `setStreak(0)` behind the two per-action flags.

### 0d · ⚠️ SNAPSHOT MIGRATION — THE CRASH PATH
Renaming tally keys makes `t[a.id].a` throw inside a `setTally` updater → **white screen mid-game**, for any snapshot up to 18h old (`ACTIVE_KEY = "hoops_active_v1"`, line 164).
- Bump the write (line 806) to `v: 2`; accept `v === 1 || v === 2` (line 172).
- Add `migrateTally()` mapping `slam → object` and `names → name:{a,m}`.
- **`qStartRef` also holds a full tally** and `buildReport` does `snap.tally[k].a`. **Migrate `s.qStart.tally` too** or a resumed game hard-crashes at the quarter buzzer. This is the one most likely to be missed.

### 0e · The tracker
`records` → `{ doors, spoke, names, close, pitch, score }`. Carry the old PR forward (`doors: Math.max(prev.doors||0, prev.knock||0)`) and **merge on load** (`setRecords(r => ({...r, ...JSON.parse(raw)}))`) or new keys render `/undefined`.

YOUR NUMBERS panel (stays `width:158`, `bottom:190`, handedness-anchored). DOORS in the header row — zero added height, and it carries the PR:
```
┌ YOUR NUMBERS ──────── 32/28 ┐
│ SPOKE TO               14   │   hero, 19px seg GOLD
│ │ OBJECTED               6  │   indented, FIRE
│ │ GOT NAME               8  │   indented, GOLD, ★PR
│ ─────────────────────────── │
│ NO ANSWER              18   │
│ PITCHED                 5   │
│ INTERESTED              3   │
│ SALES                   2   │   ★PR
└─────────────────────────────┘
```
≈149px tall vs today's ≈114. PRs on DOORS / SPOKE TO / GOT NAME / SALES only — **no PR for OBJECTED** (perverse incentive). `scale(0.9)` on short viewports; the panel already has a correct `transformOrigin` (line 1349).

### 0f · Propagation — every site, or the numbers silently lie
- **Collapse three duplicate label arrays into one.** `STAT_ROWS` (1471–76), `QuarterReport`'s local `rows` (1540–45), `GameReport`'s local `rows` (2768–73) are three copies of the same thing. Derive one module-level constant from `ACTIONS`.
- **`tally.knock.a` means "doors worked" in four places** and silently becomes "no answers" under the new label. No crash, wrong numbers — the exact bug class being fixed. Route all four through `doorsOf(t)`: `records.knock` → final-screen "MOST DOORS" (2846); `publishLine({doors})` (869, 1021); `statLine.doors` (989) → CoachingBreak announcer; `logHoopsGame` (274).
- `BoxScore`/`GameReport`/`QuarterReport`: add `tally[r.id] || {a:0,m:0}` guards; swap the `Names Collected` footer for `Doors Worked` + `People Spoken To`; render the penalty row as `—/{t.a}` with a `−5 ea` note (`0/6 · 0%` reads as failure).
- `LiveStats` (1505–06) reduces over `STAT_ROWS` — must reduce over `ACCURACY_KEYS`, or guaranteed misses fold into the headline TOTAL and disagree with `accuracy`.
- `buildReport` (973–89): split the single loop into a full-tally diff + an `ACCURACY_KEYS` accumulator. The `atts < 6 ? "slump"` test must use **total taps** — a quarter of 10 objections was definitely work.
- `advanceQuarter` line 1002: hardcoded `["knock","pitch","price","close"]` → `ACCURACY_KEYS`.
- `ActionIcon` (2334–42): `slam → object` with a **distinct glyph** (bubble + X, so it doesn't read as `name`); delete the dead `talk`. **An unknown id renders an empty `<svg>` with no error** — only visual QA catches a miss.
- `HowTo` (671–684): 6 rows; sign-aware `{a.pts}`; add `a.make === 0 → "always off the rim"` **before** the `make === 1` branch or −5 renders "0% shot". **The "there is no loss column here" card now contradicts a −5 penalty** — rewrite it, and state the one-tap-per-door rule.
- `logHoopsGame` (267–93): `doors = doorsOf(t)`, `contacts = spokeOf(t)`, and fix `objections: t.price.a` → `t.object.a` (`price` is *customer interested* — semantically inverted today). Comment that the RPC drops `objections`/`outcomes`. **Do NOT touch** the `mode:"full"` → `'rookie'` coercion — that would re-bucket historical rows.
- `CoachingBreak.jsx` (49–57, 185–189): `{doors} doors · {spoke} conversations · {sales} sale(s)`.
- **Delete** `takeSpoke`, `takeName`, `logName`, `nameModal`/`nameInput` state, the modal JSX (1438–51), the `names` array (~30 lines). `setNameModal(true)` is never called — dead. `logName`'s `t.names + 1` would create a phantom key beside `tally.name`.
- Ball wrapper `zIndex: 9` → **31**: the guaranteed-miss clank deflects to `translate(60%)`, straight behind the `zIndex:30` YOUR NUMBERS panel when `handed === "left"`.
- Add the missing `@keyframes pulse`.

---

## Slices 1–8 — Graphics overhaul

Extract art out of the monolith **as a pure mechanical move first** (screenshot-diffable, zero visual change), then rebuild inside the new files. Follow the `src/components/anger/door/` precedent:

```
games/hoops/
  hoopsPalette.js  hoopsShot.js  HoopsFX.js  HoopsDefs.jsx
  HoopsBall.jsx  HoopNet.jsx  HoopRig.jsx  HoopsCourt.jsx
  HoopsCrowd.jsx  crowdPlate.js  HoopsPlayer.jsx  HoopsSideline.jsx  HoopsHud.jsx
src/styles/hoops-art.css   src/styles/hoops-fx.css
```
`Hoops.jsx` stays the logic shell (~1,500 lines).

### RAID, don't rebuild
| File | What it gives |
|---|---|
| `src/components/anger/door/DoorFX.js` (827) | `emit()` w/ 10 tuned presets (`spark dust glass debris star sweat splinter blood drip sawdust`), **value-noise `shake()`** (reads as camera mass), `hitStop`, `flash`, `zoom`, `slowMo`, `decal`. Fixed timestep, zero alloc in hot loop, DPR clamped to 2, reduced-motion aware. |
| `src/components/layout/bootFx.js` (378) | Additive-bloom sprite cache + **self-throttling adaptive quality** (frame-time EMA → 1 / 0.55 / 0.3). |
| `src/components/layout/HoopsBallIcon.jsx` (77) | **Photoreal leather ball** — `feTurbulence` grain clipped to the circle, AO ring, seams isolated in their own group. Currently only a nav icon. |
| `src/styles/door-fx.css` (55) | The `--fx-x/y/rot/zoom` → `.dg-cam` camera contract to clone. |
| `src/styles/boot.css` (547) | `bx-quake`, `bx-kick-shake`, `bx-flash`, `bx-ring`, **`bx-aberr`** (chromatic aberration). |

### Extraction gotchas
1. **Palette-in-keyframes.** `pulseGlow` interpolates `${V}`/`${V_GLOW}` into the keyframe string. Moving to static CSS needs `--hp-*` custom props on `.hp-scene` or **glow colours silently change**. Split into **1a** (components move, keyframes stay inline) and **1b** (keyframes → CSS) so 1b is revertable alone.
2. **SVG ids are document-global.** `netg3 lineGlow ballGrad ballGrad2 bottleClip wgrad glass mmBlue mmDia mmGlow mmSoft lp_g hbGrain`. In multiplayer **two `<Ball>`s mount at once** and redefine the same ids; worse, `HoopsBallIcon` in the top nav already owns `hbGrain`/`hbClip`. Fix: `<HoopsDefs/>` mounted **once**, everything prefixed `hp-`. Bonus — the expensive `feTurbulence` raster is then shared.
3. **`hoops-fx.css` must use an `hp-` prefix, not `dg-`.** The Door writes `--fx-x/y/rot/zoom` on `.dg-scene`; sharing class names means two games racing on the same custom properties.
4. **`IpadStage` (562–585) + canvas is the highest-risk integration point.** It applies a **non-uniform** `scale(1.18, s)` onto a fixed `430×924` design canvas. `DoorFX.resize()` sizes its buffer from `getBoundingClientRect()` — which returns the **scaled** rect, giving an 18%-wide buffer with x-stretched particles. Add an **optional** explicit `{w,h}` override to `createDoorFX` (additive, defaults to today's behaviour so **The Door is untouched**) and pass the design box `430 × 652`. **Verify on a real iPad.**
5. `idRefMascot` (2094) is a module-level mutable singleton — it must travel with `HoopsSideline.jsx`.
6. Play zone is `overflow:hidden` (1252) — FX canvas is a child, so particles clip correctly. Shatter debris has 112px headroom above the rim. **Don't touch the floatie hoist (1289–90).**

### Slice 2 · Ball + shot (the named complaint)
`hoopsShot.js` = **single source of truth for the arc**, exporting `frames`, `durationMs`, `contactMs`, `rimPoint`, and an analytic `sample(t)` (**no DOM reads**). Both the DOM ball and the canvas trail read from it, and impact FX schedule off `contactMs` — **so changing the arc can never desync the net again.** That's the structural point.

Ball art in **three nested transform layers**: outer = arc translate (WAAPI), middle = squash, inner `<g>` = spin. This is what makes it read photoreal — **the specular highlight and AO stay fixed in screen space while only the seams rotate** (the trick already in `HoopsBallIcon`). Backspin **−1150° over 880ms, linear** (easing the spin with the arc is the giveaway). Release squash `scale(1.16,0.86)` → settle; a hard `scale(1.22,0.80)` **at the reversal** on a clank — a squash frame at the reversal is what makes a bounce look like it hit something solid. Ball 24 → 26px so the grain reads on a phone.

**Trail = canvas ribbon, NOT DOM ghosts.** 8 ghosts × 3 divs = continuous node churn + 8 blurred `box-shadow` glows; the ribbon is one `ctx.stroke()` over a 14-sample ring buffer, ~0.1ms. It samples `arc.sample(t)` on its own clock — **never `getBoundingClientRect()` per frame**, which forces layout 60×/s and turns a compositor-driven WAAPI animation into a jank machine. Ember trail at `hotZone` via the existing `spark` preset.

**Keep WAAPI for the ball** (compositor-driven, frame-perfect on iOS); canvas gets the trail and sparks — cheap as pixels, expensive as nodes. Replace the single global `cubic-bezier(.3,.6,.4,1)` with **per-keyframe** easing (`ease-out` to apex, `ease-in` to rim) — one easing across a whole trajectory is why the miss currently reads as a slide.

### Slice 3 · Net + rim
Diamond mesh: 12 strands each way **crossing** + 4 rings; two stroke passes (soft halo under a bright core) for fibre thickness **without a filter**.

**The travelling bulge** — CSS can't animate `d`, and re-rendering 24 paths per frame is a re-render storm. Split the net into **4 horizontal bands cut exactly on the horizontal rings** (where a real net's joints are, so nothing tears), each a `<g>` with one shared keyframe and per-band `animation-delay` **0/55/110/165ms**. Composited, transform-only, zero JS. `hpNetWhip` (rotate settle) replaces the `scaleY` squash. Add `hpNetGraze` for a miss that clips the net on the way out. **Delete `netFall`.**

### Slice 4 · CLOSE = the backboard shatters *(HIGH RISK)*
Real glass: `rgba(186,224,255,0.13)` + a diagonal sheen streak, a **padded bottom edge** (the pad is what makes it read as a real rig), chrome mount arms, a diagonal brace, a live shot clock. **No `backdrop-filter`** — on a shaking element on iOS that's a guaranteed frame-time cliff.

Sequence: `hitStop(150)` + `shake(1.0)` + `flash` + `zoom(1.06)` + `slowMo` → **crack snap** (~18 radiating fracture paths, `stroke-dashoffset` over `90ms steps(6)` — **`steps()` is the trick**; smooth drawing reads as a pen, stepped reads as breaking) → 9 shard polygons on one shared `hpShardFly` keyframe + `glass`/`debris`/`star` particles + chromatic aberration → rim recoil → net bulge at 1.4× → **reform at 900ms** (closing the loop is what makes it repeatable).

Gate behind `SHATTER_MODE`: full shatter on the **first close of a quarter**, any close while `hotZone`, or a lead-taking close; otherwise a 400ms crack-snap. `close.make = 1.00` and CLOSE is the most-tapped button late in a good game — a 2.5s set-piece every time is tiresome by minute ten.

### Slice 5 · Court + depth *(cheapest wins first)*
LED ribbon board (**3 nodes**, reusing `TICKER_ADS` — highest impact-per-node in the plan) · depth haze (1 node) · rafters + swaying banners (~8) · then the **wood floor as one static canvas drawn once at mount**: plank seams, ~200 sinusoidal grain streaks per plank, varnish sheen, scuff arcs near the key. Replaces 9 plank divs **and** the `lineGlow` filter subtree with **1 node and zero per-frame cost**. **Do NOT** put a `<pattern>` or filter inside the `perspective() rotateX()` subtree — it re-rasterizes at transformed resolution every frame anything inside animates. Keep markings as crisp SVG on top. Then court reflection (`scaleY(-0.42)`, masked — cheapest thing that makes the floor read varnished) and 3 spotlight cones with motes **on the FX canvas, not as divs**.

### Slice 6 · Crowd *(biggest visual surface)*
**Hybrid: far 12 rows → canvas, front 4 rows → detailed DOM.** Rows 0–11 are 3.5–9px fans at 0.26–0.7 opacity — *there is no detail to see*. `crowdPlate.js` pre-renders each far row once offscreen, sliced into 8 segments; each frame is **96 `drawImage` calls** with a per-segment bob offset (~0.3ms). 8-segment granularity is enough for a wave to visibly travel. **832 animation instances → 0.**

Rejected: `<use>` sprites cut nodes 3× but **zero** animation instances (wrong lever; Safari's shadow-tree instantiation is historically slower at this count). Shared classes alone is ~20%.

Reactions: wave ripple outward on a make (canvas rows get it free — `sin(ωt − |x−waveX|/λ)` is the same blit math), slump on a miss (tint via an overlay div's **opacity**, never `brightness()`), a real wave crossing the arena on `STREAK_TIERS` hits. **Re-home all 14 `SIGN_SPOTS` from rows 2–5 to rows 12–15** — at 3.5–5px fan scale they're unreadable, which is almost certainly *why* `stillSign: true` froze them (line 1832) — then unfreeze `signCycle` with staggered delays, cardboard texture, per-sign tilt. Camera flashes → a new `camflash` preset on the canvas, fixing the `Math.random()`-during-render bug (1907) and 26 nodes per make.

**Target: ~2,900 → ≤900 nodes, ~850 → ≤60 animation instances.**

### Slice 7 · Player
Replace the three-way arm ternary (2235–71) with a **pose table** (`idle breathe gather release follow land celebrate slump dunkRise dunkHang dunkDrop`). Anatomy: deltoid caps, lat taper, jersey fold lines, shorts stripe + drawstring, crew socks, real sneakers, compression sleeve. **Rim light painted, not filtered** — duplicate the silhouette path offset 1.5px up-left with a warm stroke, clipped to the body: zero filter cost, better result. **Gate `celebrate` on `!dunkPhase`** so it can never collide with the dunk choreography.

### Slice 8 · Juice + guardrails
`impactFX(kind, made, rimPoint)` at `contactMs`: `spark` on swish; `spark`+`dust`+`shake(0.28)` on clank; `dust` on landing; `sweat` when thirsty; rim ignition at `hotZone` (**opacity only on fixed geometry — never scale a vignette**). Score odometer (40 static nodes, transform-only). Reuse `tickerSheen` for a PR sweep. Reimplement `burstConfetti` as a canvas eruption **keeping the exact signature and the load-bearing `setEdgePulse` line** so all 4 call sites are untouched (3 of the 4 are bottle refills, not shots).

Guardrails: one shared FX canvas **inside `.hp-cam`** (so particles are welded to the shaking world, not sliding over it), DPR clamped to 2, adaptive quality degrading in order (trail samples → crowd wave → ember cadence → particle counts → cones/reflection) and **never** the ball, net, or rim. `prefers-reduced-motion` block killing ambient loops + forcing crack-only. IntersectionObserver + `visibilitychange` pause (the proven `ArenaFX.jsx` `<EmberCanvas>` pattern).

---

## PERF LAW (Jon has been burned by all three)
1. **Never one `drop-shadow` per SVG path.**
2. **Never an infinite animation inside a filtered subtree.** (Live violation at line 2189.)
3. **Never scale a vignette.** Opacity only, fixed geometry.

Plus: ships to **iPhone via Capacitor** — must hold 60fps on a phone. Any new art must live inside the `430×924` `IpadStage` design canvas or it won't scale.

---

## Verification

**Build gate:** `npm run build`. There are **no tests and no lint config** in this repo.

**Preview serves `dist` — rebuild first.** Demo login `coachowkins@gmail.com` / `demodemo`. Playwright MCP needs manual headless Chrome on `:9222`.

**Slice 0, in-browser:**
1. Shoot → the net moves **exactly** when the ball passes through (was 239ms late). Tap SPOKE TO → net moves once, **with a ball**.
2. CLOSE → hands **clear the rim**, a **visible** ball goes through the net, rim recoils, he lands in a crouch with floor dust. Three closes back to back — `busyRef` always releases.
3. OBJECTED → ball arcs, **clanks off the rim**, bounces right, **visible over** the YOUR NUMBERS panel. Score −5, streak **unchanged**, accuracy **unchanged**.
4. OBJECTED at score 0 → floor holds, no negative in the jumbotron.
5. All six rungs once → DOORS 6 / SPOKE TO 5 / OBJECTED 1 / GOT NAME 1 / NO ANSWER 1 / PITCHED 1 / INTERESTED 1 / SALES 1.
6. **⚠️ RESUME TEST — the crash path.** Play on the *current* build to seed a `v:1` `hoops_active_v1`, then load the new build and rejoin — **both mid-quarter AND across a quarter buzzer** (that second one is the `qStart.tally` path that hard-crashes if missed).
7. Quarter buzzer → CoachingBreak says doors · conversations · sales. Four quarters → final box score + 6 PR tiles, all six labels correct.
8. Two tabs, live match → opponent pill still updates (wire shape unchanged, so mixed-build matches keep working).
9. Both `handed` sides; 320×568 and 375×667 for panel/rim collision.

**Art slices:** 1a/1b are screenshot-diffs (1b is where glow colours silently change). Slices 2 and 5 must re-verify the `RIM_TOP` / `RELEASE_BOTTOM_PCT` coupling. **Slice 2 must be checked on a real iPad** (the `IpadStage` canvas-sizing fix lands there). Slice 6 verified by node count in DevTools against ≤900.

**Phone sign-off** (Capacitor + Safari Web Inspector Timeline, on device): 10 consecutive `knock` taps · 3 consecutive `close` shatters · a `hotZone` streak with the ember trail live. Add a dev-only FPS + node-count readout behind the existing `timeScale` toggle, plus `?fx=off`.

**Deploy:** CLI only — `npm run build` → `netlify deploy --prod --dir=dist`. Git push does **not** auto-deploy.

**High-risk slices:** 4 (dunk state machine, +2.5s to a shipped flow), 6 (crowd rewrite), 2 (arc retune + iPad canvas sizing).

---

## Follow-ups (out of scope, logged)
- `hoops_active_v1` is in **neither** `ACCOUNT_KEYS` (`AuthGate.jsx:26`) **nor** `FEATURE_STORE_KEYS` (`useAppData.js:75`) — an in-progress game survives an account switch on the same device.
- `az_fullcourt_log_game` (`008_arena_rpcs.sql:613-643`) has no `objections` or `outcomes` column and coerces `mode:"full"` → `'rookie'` (table check constraint is `('rookie','pro')`). Changing `mode` now would re-bucket historical rows.
- `src/lib/fullCourtEngine.js` — the `no_answer`/`objection`/`full_pitch` taxonomy the DB schema was designed around — is **imported by nothing**. Dead code.

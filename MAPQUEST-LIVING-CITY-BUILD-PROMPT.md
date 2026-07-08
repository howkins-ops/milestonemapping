# 🌆 MAPQUEST: THE LIVING CITY — Master Build Prompt (10 phases)

**Paste this whole file into a fresh Claude Code session as the opening brief.** It upgrades **MapQuest City** from an animated diorama into a game you *play*: AAA game-feel, deep layered graphics, a living breathing world, cinematic camera, a fully-animated Seeker, generative sound, and rewarded exploration — all inside the existing React + CSS world engine, with zero new dependencies.

> You are the best game developer in the world: a graphics engineer, a game-feel designer, and a storyteller. Your job is to take everything already built in `src/components/city/**` to the next level. The player should finish a session thinking *"I just played a game"* — not *"I used an app with a cute map."* Every phase ships into the real app, compiles on its own, and obeys the laws in §2.

---

## 0) READ THESE FIRST (do not skip — match conventions, don't invent)

- **The walk engine:** `src/components/city/world/useWorldEngine.js` — one rAF loop, `translate3d` written straight to DOM refs (`layerRef/farRef/midRef/charRef`), React state only on meaningful change, **loop stops when idle** (this is sacred). Jump physics: `GRAVITY 1700 / JUMP_V 620 / BOUNCE_V 430`, `onAirFrame` hook powers clown stomps. Camera = `clamp(x − viewportW·0.45)`, hard-locked, no smoothing (you will fix that in Phase 2).
- **The scene:** `src/components/city/world/WorldScene.jsx` — renders any world config. Layer stack back→front: sky → stars → aurora → far (parallax 0.18) → mid (0.45) → CityAmbient → main layer (arches/props/buildings/NPCs/enemies/char) → haze (z5) → ground (z3) → HUD (prompt pill z10, controls z11, meta chip, 🤡 bonk counter). Buildings are real `<button>`s — keep them tappable.
- **World config contract:** `src/components/city/world/worldConfig.js` — **worlds are pure data**. Every feature you add must be an *optional* config key + renderer, so hometown/forest worlds inherit it for free. See how `enemies:[]` bolts a whole system on.
- **Street geography:** `src/components/city/cityWorld.js` — `STORY_ORDER` (16 districts), `STREET_ZONES` (7 zones: THE GRID → NEON HEIGHTS → THE ARCHIVE ROW → THE UNDERGLOW → THE COMMONS → THE TERMINUS → THE SPIRE), `buildCityWorld()`, deterministic FAR/MID silhouettes.
- **The comedy layer (your pattern-mother):** `src/components/city/world/StreetEnemies.jsx` + `ClownSprite.jsx` — CSS-animated patrol (zero JS while walking), JS only on airborne frames, WebAudio honk, frozen-transform squash, quips, respawn. **Every system you add should be this cheap.**
- **The player:** `src/components/city/world/PlayerSprite.jsx` — hooded Seeker SVG, two separate legs for the CSS walk cycle, chest core, glow prop. Note the `PHASE-2 CITIZEN HOOK` comment — you are that phase's animation half.
- **Atmosphere:** `src/components/city/cityAtmosphere.js` — 4 city stages (rank-driven: `mqc-stage-1..4`) and time-of-day (real clock: `mqc-tod-dawn/day/dusk/night`). Pure helpers, **no RNG** — keep that law (§3.5).
- **Page mount:** `src/components/city/MapQuestCityPage.jsx` — owns WorldScene, `useJourney` gating (LIT chain, `next`/`locked`/`sealed` flags), celebrations, Spire ignition. Your cinematic hooks land here.
- **Cinematic overlays:** `src/components/city/hometown/DepartureCinematic.jsx`, `src/components/city/SpireIgnition.jsx` — full-screen, skip button, reduced-motion stills. Copy this grammar.
- **Sound (REUSE, don't rebuild):** `src/lib/sfx.js` — the app's WebAudio engine (Anger Gym). Extend it. NO second audio engine, NO ElevenLabs bakes without Jon's audition approval.
- **Styling:** `src/styles/cityWorld.css` (`mqw-*`) + `src/styles/city.css` (`mqc-*`). **Your new sheet: `src/styles/cityWorldFx.css`, prefix `mqfx-`** (see the concurrency warning below for why it must be a new file).
- **Brand palette:** cyan `#00F0FF`, magenta `#D11EFF`, hot pink `#FF3EDB`, aqua `#00FFBF`, purple `#7B2CFF`, gold `#FFD166`/`#FACC15` on void `#05000A`. Hometown theme: warm brass `#C9A15E`. Fonts: **Sora (display) / Manrope only** — monospace + utility fonts are banned.

**⚠️ CONCURRENT SESSION WARNING (read twice):** Jon runs parallel sessions on this repo. A sibling build (**MASK ENCOUNTERS** — `MASK-ENCOUNTERS-BUILD-PROMPT.md`) works in the *same* city folder: it adds fog banks (`maskDens`), battle overlays (`mqk-*`), a stride hook in `useWorldEngine.js`, and allies behind the char wrapper. Before EVERY work block: `git status` + check file mtimes for a live writer. If `useWorldEngine.js` / `WorldScene.jsx` / `cityWorld.js` changed under you, **re-read them and rebase your plan** — never blind-overwrite. Put ALL new CSS in `cityWorldFx.css` (never append to `cityWorld.css`), and make every engine change a small additive block, not a rewrite. Your FX core (Phase 1) is designed to be *consumed* by the mask battles too — build it as a public API.

**Working agreements:** each phase compiles and is shippable on its own; pure logic in plain `.js` modules (testable), `.jsx` only for rendering; local-first (localStorage / sessionStorage patterns from `journeyStore.js`); no new npm dependencies — **no three.js, no pixi, no framer-motion, no canvas/WebGL** (CSS/SVG/DOM is the engine and it's plenty); do not commit or deploy without being asked.

---

## 1) THE MISSION

MapQuest City is already *correct* — walkable, story-gated, progress-lit, mobile-first. What it lacks is **presence**. The street is flat gradient boxes, the sky is 20 dots, the camera is a rigid clamp, the Seeker has a 2-keyframe bob, actions have no weight, and the world is silent. It reads as UI.

You will give it the five things that make players *feel* a game:

1. **Weight** — every verb (step, jump, land, stomp, door, power-on) hits with squash, particles, shake, hit-stop, and sound.
2. **Depth** — 5 visual planes instead of 3, light that behaves like light, wet asphalt that mirrors the neon, air that has haze and grain.
3. **Life** — a sky with weather and a moon; citizens, trams, drones and steam; a city whose population literally grows with the player's progress.
4. **Cinema** — a camera that eases, looks ahead, pans to story beats, letterboxes for title cards, and irises into doors.
5. **Reward** — the walk itself pays: sparks to catch, combos to chain, distance to log, secrets to find.

And it must all cost *nothing* when the player stands still. The existing engine's proudest property — **zero rAF while idle** — survives every phase.

---

## 2) NON-NEGOTIABLE LAWS (every phase must obey)

1. **Perf law (mobile-first).** 60fps on a mid-range Android (test at 6× CPU throttle ≈ smooth). Animate ONLY `transform` and `opacity`. No animated `filter`/`box-shadow` on large surfaces (small elements ≤ 120px are fine — the existing glow grammar). No laggy pointer effects, ever (Squad Arena law). No layout thrash: batch all reads before writes. The rAF loop still stops at idle; ambient life is 100% CSS-clocked.
2. **Reduced motion** dies under all three gates: `prefers-reduced-motion`, `html[data-reduced-motion="true"]`, `.mqw-viewport--still`. Every new animation gets a static or instant fallback that still communicates state.
3. **Additive, never breaking.** World configs stay pure data; every new feature is an optional key. Old configs (hometown) must render unchanged — then be *themed into* the new systems, not broken by them.
4. **Real-life-first.** Nothing you build blocks doors, story beats, or navigation. Collectible rewards are garnish (tiny XP, daily-capped), never a grind loop. No-fail law: nothing on the street can hurt the player.
5. **Determinism.** No `Math.random()` in render paths. Ambient variety comes from date-seeded hashes and index math (the FAR/MID arrays and star field already model this).
6. **Buttons stay buttons.** Buildings, NPCs, prompt pill remain focusable `<button>`s; every FX layer is `pointer-events:none`; `touch-action: pan-y` keeps page scroll alive over the world.
7. **Font law.** Sora / Manrope. Nothing else.
8. **Sound is garnish** — gesture-gated (autoplay policy), try/catch'd, mutable, and the game is 100% playable silent.

---

## 3) ARCHITECTURE — build these foundations once, use them everywhere

### 3.1 The FX core — `src/components/city/world/fx.js` (Phase 1)
One tiny imperative module, no React state, consumed by scene + battles + cinematics:

```js
fx.shake(viewportEl, { amp = 5, ms = 220 })      // camera shake — CSS class + vars, auto-removes
fx.flash(viewportEl, { color, ms = 90 })          // full-viewport impact flash (opacity anim on an overlay div)
fx.hitstop(engine, ms = 60)                       // freeze the sim clock briefly — weight without jank
fx.burst(fxLayerEl, x, y, kind, n)                // pooled particle burst at world coords
fx.ring(fxLayerEl, x, y, color)                   // expanding shockwave ring
fx.toast(viewportEl, text, color)                 // floating combo/score pop (the quip pattern, generalized)
```

**Particle pool:** pre-create ~24 `<i class="mqfx-p">` nodes in one `mqfx-layer` div inside the main world layer. Spawning = set `left/bottom/--px/--py/--a/--c` vars + add a kind class; CSS keyframes do all motion; `animationend` returns the node to the pool. **Zero per-frame JS.** Kinds: `dust`, `spark`, `ember`, `confetti`, `ripple`, `streak`.

`hitstop` needs one engine touch: expose `engine.freeze(ms)` that zeroes `dt` for the next N ms inside the existing frame fn (2-line change — guard, don't restructure).

### 3.2 The layer stack after this build (back→front)
```
sky → celestial (moon/sun/clouds) → stars → aurora → weather-far
→ far (0.18) → mid (0.45) → ambient-life (trams/drones, CSS-clocked)
→ MAIN (arches/props/buildings/npcs/enemies/fx-layer/collectibles/char)
→ near foreground (1.22, pointer-events:none) → weather-near (rain/fog)
→ haze → ground(+reflections) → grade/vignette/grain → HUD
```
New parallax plane = copy the exact `farRef` pattern: one ref, one paint line in the engine (`nearRef: −cameraX · 1.22`), width `calc(100% + world.width·0.22px)`. That's the whole cost.

### 3.3 Determinism seed — `src/components/city/world/daySeed.js`
`seedFor(dateStr, salt) → 0..1` via a tiny string hash. Drives: weather pick, ambient citizen count/offsets, daily event, collectible spawn positions. Same day = same city for everyone; tomorrow = fresh city.

### 3.4 Quality tiers — `mqfx-q-full` / `mqfx-q-lite` (Phase 10)
A viewport class from settings (+ auto-demote via `navigator.hardwareConcurrency ≤ 4` heuristic). LITE keeps: game-feel on verbs, tod palettes, near layer. LITE drops: weather particles, reflections, grain, ambient traffic. STILL (reduced motion) = existing law.

### 3.5 Store — `src/components/city/streetStore.js`
localStorage, `journeyStore.js` shape (versioned key `mq_street_v1`, safe parse, legacy migration): odometer px, sparks collected today + date, combo best, secrets found, event log. Plus `sessionStorage` for transient (current combo).

---

## 4) THE TEN PHASES

Ship them in order — each is a playable improvement on its own.

---

### PHASE 1 — THE JUICE CORE (weight on every verb)
*The single highest-leverage phase. Do not decorate: make actions HIT.*

**Build:** `fx.js` (§3.1), `mqfx-layer` + pool in `WorldScene`, `cityWorldFx.css`, `engine.freeze(ms)`.

**Wire every existing verb:**
- **Jump takeoff:** 1-frame anticipation crouch (`mqfx-char--coil`, scaleY 0.86 for 70ms via class before `jump()` fires — tap still feels instant), 2 dust puffs at the feet, soft whoosh hook.
- **Airborne:** apex hang — at `|vy| < 90` add `mqw-char--apex` (subtle 1.04 scaleY stretch). Falling: `mqw-char--fall` (slight forward lean).
- **Landing:** squash (`scaleX 1.18 / scaleY 0.8`, 120ms spring-back), 4-particle dust burst, camera **micro-bump** (2px, 90ms — a viewport class, not an engine change yet), landing thud hook. Landing from a stomp bounce = bigger everything.
- **Stomp (upgrade the clowns, don't replace):** `fx.hitstop(60)` on contact, `fx.ring()` shockwave at the clown, `fx.shake(amp 4)`, confetti count 5→9 via pool, and the quip stays. Chain stomps escalate: shake amp +1 per chain link (cap 8).
- **Walk:** every 4th walk-cycle beat drops a 1-particle dust wisp behind the trailing foot (CSS-clocked by the walk animation via a pseudo-element — NOT per-frame JS; simplest: a looping `mqfx-stepdust` pseudo on the char that only animates while `.mqw-char--walk`).
- **Door enter:** door flares (`mqfx-doorflare` on the building's `__door` for 300ms) + `fx.flash` in the district color before the sheet opens.
- **Power-on / LIT (journey events):** the building erupts — window opacity ramps floor-by-floor (staggered `transition-delay` via a `--floors` trick), beacon ignites with a `fx.ring`, 6 sparks burst from the rooftop sign. (Camera pan comes in Phase 7 — here, just make the building itself perform.)

**Accept:** every verb reads in ≤ 400ms, no verb produces >1 forced layout, pool never exceeds 24 nodes, idle rAF still zero, reduced-motion = instant state changes with zero particles.

---

### PHASE 2 — CAMERA II (the invisible star of every good game)
*Replace the rigid clamp with a camera that behaves like a cameraman.*

**Engine changes (surgical, all inside `useWorldEngine.js`):**
- **Smoothing:** camera position becomes its own sim var; each frame `cam += (camTarget − cam) · min(1, dt·7)`. The loop now also runs while `|camTarget − cam| > 0.5` (extend the run condition), then stops — idle law preserved.
- **Look-ahead:** `camTarget = x − viewportW·(facing === 1 ? 0.40 : 0.50)` eased over 400ms on turn — the player sees where they're going.
- **Landing bump & shake:** camera writes go through `paint()` already; add `+ camOffX/camOffY` decay vars that `fx.shake`/land-bump set (viewport-level shake from Phase 1 migrates here — one shake source of truth, on the *layers*, not the viewport border).
- **`panTo(x, {ms, hold}) → Promise`:** cinematic override — engine ignores input-follow, eases camera to world-x, resolves after hold. Exposed on `controls`. Input remains alive (real-life-first: walking cancels the pan).
- **Zoom:** a `--mqw-zoom` var (0.92–1.06) applied as `scale()` **on the three transformed layers** (compose into the same translate3d string — free, no extra property). Run = 0.97 (world widens), boss/cinematic = 1.04. Transform-origin bottom-center.

**Scene:** letterbox component (`mqfx-letterbox` top/bottom bars, translate in/out) — used by Phase 7.

**Accept:** turn-around visibly re-frames; landing has a felt "thunk" frame; `panTo` resolves and never traps the player; camera settles and rAF stops within 1s of idle; zero jitter at 6× throttle (sub-pixel: round camera writes to 0.5px).

---

### PHASE 3 — THE LIVING SKY (weather, celestial bodies, color grade)
*The sky is 40% of the viewport and currently near-empty. Make it the mood engine.*

**Build (all viewport-fixed, all CSS-clocked, config-blind — works over any world theme):**
- **Full tod palettes:** dawn (rose-gold gradient, low sun disc, long haze), day (high soft-blue, faint stars gone, clouds visible), dusk (magenta burn, sun sinking behind FAR silhouettes), night (current look, deepened). Extend the existing `mqc-tod-*` vars — add `--mqc-celestial`, `--mqc-cloud`, `--mqc-grade`.
- **Celestial layer:** moon (radial-gradient disc + halo, position per tod), 3 drifting cloud banks (huge blurred-gradient spans, 90–140s linear loops — blur is static, only transform animates), one shooting star on a 47s cycle at night (single span, long keyframe with 96% idle time).
- **Weather engine — `weather.js`:** pick per day via `seedFor(date,'wx')` weighted by tod: `clear | rain | drizzle | fogdrift | embers | starfall(night)`. Renders as two layers (weather-far behind MAIN, weather-near in front):
  - **Rain:** 2 stacked `repeating-linear-gradient` streak sheets translating diagonally at different speeds (2 nodes total), plus 3 pooled `ripple` particles/sec at the ground line — actually clock ripples purely in CSS: a 6-span looping set with staggered delays. Near sheet slightly thicker + faster = parallax rain.
  - **Fogdrift:** 3 wide blurred spans (blur static) translating at 60–100s — composes with (does not replace) the Mask fog banks: check for `.mqk-fog` and, if the mask layer exists, weather fog thins (`opacity ×0.6`) so the tall-grass read survives.
  - **Embers / starfall:** 8 tiny spans on long staggered float loops.
- **Color grade + film:** `mqfx-grade` overlay (`mix-blend-mode: soft-light`, per-tod gradient tint), vignette (static radial), **grain**: static SVG `feTurbulence` data-URI at 3–4% opacity, viewport-fixed, never animated. This trio is what makes gradient-art read "cinematic" — it is cheap and it is mandatory.
- **Theme awareness:** hometown overrides — rain becomes warm drizzle, embers become fireflies, moon becomes bigger/amber. Pure CSS via `.mqw-theme-hometown` scoping.

**Accept:** four tods look like four different paintings (screenshot each by faking the clock); rain costs ≤ 4 animated nodes + pool ripples; weather is identical on reload same-day; LITE tier drops particles but keeps palette + grade; reduced-motion = static sky with grade intact.

---

### PHASE 4 — THE DEEP STREET (five planes, real light, wet asphalt)
*Depth is the difference between "backdrop" and "place."*

**Build:**
- **Near foreground plane (the biggest single depth win):** new `nearRef` layer at parallax **1.22**, `pointer-events:none`, populated from a new optional world key `near: [{ x, kind }]` (generate deterministically in `buildCityWorld`): silhouette street furniture sliding *in front of* the Seeker — hydrant-bots, planters, cable bundles drooping between poles, newspaper stands, occasional foreground pillar (≤ 8% viewport width so it never hides the player long). Dark, 85–92% opacity, slight blur(1px) static — reads as camera-close.
- **Wet asphalt reflections:** inside `mqw-ground`, a `mqfx-reflect` strip — per lamp/door/beacon, a mirrored vertical gradient smear (`--r-color` from the source, scaleY(−1) feel via gradient direction, 30–40% opacity + 2px static blur). Positioned by the same world data at build time (lamps + lit buildings). During rain: opacity ×1.6 + a slow shimmer (`opacity` 0.8↔1.0 loop). This single effect sells the whole neon-city fantasy.
- **Lamp light cones:** each `mqw-lamp` gains a `::after` volumetric cone (conic/linear gradient triangle, 12% opacity, static). At night ×1.4 opacity.
- **Window life:** upgrade the building window overlay from one gradient to *two* stacked ones offset by `--wseed` (per-building index): a base grid + a sparse "lit rooms" grid; 2–3 buildings per zone run a slow 18s `mqfx-window-flicker` (opacity only, small element = allowed). Lit rooms count scales with `glowState` — dim buildings sleep, radiant buildings party.
- **Billboards & holograms:** new optional prop kinds — `{type:"billboard", x, text, color}` (2 per zone, zone-accent, slow neon-cycle like `mqw-midt--neon`) and one `{type:"holo"}` rotating district-glyph hologram in the plaza (3D-feel via `rotateY` loop on a small element + scanline gradient).
- **Ground detail:** a static `repeating-linear-gradient` curb strip + crosswalk marks at each building door (data-driven, part of ground layer background — zero nodes).

**Accept:** standing still, the frame has ≥ 5 readable depth planes; walking, the near layer slides convincingly faster; reflections track their sources exactly (write a positioning helper, don't eyeball); tap targets unobstructed (foreground pillars never within 60px of a door center — enforce in the generator); total new animated nodes ≤ 12.

---

### PHASE 5 — THE SEEKER, ALIVE (a character, not a cursor)
*Players bond with characters through animation states. The Seeker gets a soul.*

**Build (PlayerSprite + CSS + small engine additions):**
- **Sprite upgrade:** redraw `PlayerSprite.jsx` with articulated groups — `__cloak` (separate back-cloth path), `__arm-l/__arm-r` (front/back arm paths), existing legs, `__head`. Same silhouette family (hooded, chest core) — richer rig, not a new character. Add gradient shading (2-stop body, rim-light stroke on the camera side) and a `--char-glow` chest pulse (4s).
- **State machine (CSS classes, engine-set):**
  - `idle`: breathe (chest 3s), blink (eye scaleY dip every 4.7s), micro head-turn every 9s.
  - `idle-fidget` (after 12s idle, engine timer): pull hood / check the chest core — one 1.5s loop, then back to idle.
  - `walk`: current leg swing + new arm counter-swing + cloak sway + 2° forward lean.
  - **`run` (new mechanic):** hold direction ≥ 650ms → speed 340→470, class `mqw-char--run` (deeper lean 6°, faster cycle 0.32s, cloak streaming, zoom 0.97 from Phase 2, speed-line wisps: 2 pooled `streak` particles/s). Release → 200ms decel glide.
  - **`skid`:** reversing direction while at run speed → 160ms skid class (lean back, dust burst at heels) before the turn. Cheap: engine knows `facing` flips at speed.
  - `coil / rise / apex / fall / land`: from Phase 1, now with arm/cloak poses per state.
- **Aura trail:** at run/bounce, 3 pooled ghost silhouettes (blurless, 20% opacity, 300ms fade) stamped every 90ms — pooled nodes, positions set on spawn only.
- **Engine additions:** `runState` (extends `press/release` with a held-time check inside the existing loop — no new loop), `onStep(cb)` fired per walk-cycle (drive footstep audio in Phase 8; derive from distance walked, `every 34px`, inside the existing frame — one modulo, no rAF cost when idle).

**Accept:** 30 seconds of standing still shows ≥ 3 distinct idle behaviors; run feels like a gear shift (speed + lean + zoom + streaks all land together); skid-turn reads at a glance; all states collapse gracefully under reduced motion (static pose per state); sprite still one SVG, < 4KB.

---

### PHASE 6 — A CITY THAT BREATHES (ambient life that scales with progress)
*An empty street is a menu. A populated street is a world. Population = player progress made visible.*

**Build (all StreetEnemies-grammar: CSS patrol loops, zero JS while moving):**
- **Citizens:** new optional world key `ambient.citizens` — hooded silhouette walkers (simplified 2-layer Seeker cousins, 60% scale, desaturated, 70% opacity, behind the char plane z2). Count = `2 + litCount` (cap 14), positions/speeds from `seedFor(day, i)`. Each walks a long A↔B loop (30–70s) with the clownface flip-sync trick. They cluster near *lit* districts (spawn windows keyed to lit building x-ranges — the city's life literally follows the player's progress).
- **Traffic:** 1–3 hover-trams on the mid parallax layer (long translate loops, 45–80s, headlight gradient + taillight streak), plus 2 delivery drones on the celestial layer (gentle sine-path via 2 nested animated spans). Night: tram windows glow; day: drones only.
- **Steam & flue:** vents at 4 seeded street points — looping steam puff columns (2 spans each, translateY+fade). During rain, steam doubles (class toggle from weather).
- **District doorsteps:** lit districts get a doorstep detail — Guide-colored floor mat glow + occasionally (seeded, 1 in 3 days) a queued citizen waiting outside `is-radiant` buildings. Radiant = the district people want into. 
- **The plaza lives:** fountain upgrade (3 water arcs + pooled `ripple` splashes), 2 bench-sitting silhouettes, a busker-bot with music-note particles every 8s near the Guide.
- **Sleep cycle:** dawn — citizens ×0.3, trams off, birds (3 spans) instead of drones; night — citizens ×1.2, everything glows harder. Pure CSS via tod classes.

**Accept:** a fresh save (0 lit) street feels sparse-but-alive; a 15/15 save feels like a small festival — verify both by mocking `litCount`; total ambient animated nodes ≤ 30 at max population; ZERO JS ticks for any ambient element; day-seed determinism holds.

---

### PHASE 7 — CINEMA & STORY (the camera tells the legend)
*Wire Phase 2's camera to the journey system. Every story beat becomes a directed shot.*

**Build (MapQuestCityPage + a new `useCinematics.js` orchestrator):**
- **Power-on shot:** journey `onPowerOn` → letterbox in → `panTo(doorX)` → building performs its Phase-1 eruption → title card slams (`mqfx-titlecard`: district name, Sora 800, zone accent, 1 shake frame) → hold 900ms → pan back to player → letterbox out. Total ≤ 3.5s, skippable by any input (the pan cancel from Phase 2), and the existing `celebrate()` toast moves to *after* the shot.
- **Zone title cards:** first time the player *walks* past each zone arch (persist in `streetStore`): letterbox + card — zone name + one narrative line (write 7, plain-warm-direct voice, e.g. THE GRID: *"Where days are won before noon."* / THE UNDERGLOW: *"The city keeps its fire in the basement."* / THE TERMINUS: *"Everything you earned, kept."*). No pan — the walk continues; cards ride over it (real-life-first).
- **Door-entry iris:** entering a district — a `mqfx-iris` overlay (radial-gradient circle clip closing to the door's viewport position, 350ms) before the sheet/dialog opens; reverse on exit. One div, `--ix/--iy` vars.
- **The Spire approach:** within 600px of a *sealed* Spire — viewport gains `mqfx-spirenear`: grade shifts violet, aurora intensifies, a low hum (Phase 8), the Spire's crack lines glow. It should feel like standing under a thunderhead. (Engine: reuse the proximity target system with a wide-range invisible target — zero new mechanisms.)
- **Guide mile-markers:** 5 seeded street points → first-crossing one-line Guide whispers via the quip/toast pattern (*"Notice you kept walking. That's the whole secret."*). Once each, ever (`streetStore`).
- **The ignition upgrade:** when GATE 2 opens (`onSpireOpen`), before the existing `SpireIgnition` overlay: 2.2s in-world shot — `panTo(spireX)`, every lit building's beacon fires a `ring` in story order (60ms stagger — 15 beacons answering the Spire), THEN the overlay. The city salutes; goosebumps are the acceptance test.

**Accept:** every cinematic is skippable + reduced-motion-safe (cards appear/disappear instantly, pans become jump-cuts via `jumpTo`); no cinematic ever fires while another overlay is up (single `cineLock` in the orchestrator); walking during any card never breaks the camera.

---

### PHASE 8 — THE SOUND OF THE CITY (generative WebAudio, zero assets)
*Extend `src/lib/sfx.js`. Everything synthesized; nothing recorded; all gated behind first gesture.*

**Build:**
- **Verb one-shots:** footstep (filtered noise tick, alternating two pitches, driven by `onStep`), jump whoosh (noise sweep up), land thud (sine drop + noise tap, weight scales with fall speed), stomp honk exists — add a pitch-up per chain link, door chime (2-note arp in the district's... pick pitch by hashing the district id — every district gets a signature interval), power-on swell, spark pickup (tiny glass ping, pentatonic walk-up per combo), zone sting (3-note motif per zone, same instrument).
- **The ambient bed:** one loop per tod built from 2 detuned drones + a slow-filtered noise "traffic wash" + sparse random-walk pluck (seeded LFO choices, one shared clock — ≤ 6 oscillators total). Night adds a distant siren swell every ~90s at −24dB. Hometown theme swaps to warm pad + crickets (filtered noise bursts).
- **Weather layer:** rain = looping filtered pink-noise with intensity from the weather kind; thunder NEVER (startle law — this is a safe world).
- **Spire hum:** the Phase-7 proximity class also fades in a low 55Hz+82Hz binaural-ish drone, capped −20dB.
- **Mix & controls:** master gain node, `mqfx-audio` chip in the HUD (next to the meta chip): 🔊/🔇 + volume drag, persisted in `streetStore`. Duck the bed −8dB while any dialog/battle overlay is open (expose `sfx.duck(on)` — the Mask session will want it too).

**Accept:** cold load is silent until first tap; toggling mute kills everything inside 100ms; total graph ≤ 12 active nodes steady-state; audio never blocks or throws (try/catch everywhere, the FullCourt pattern); a full walk end-to-end sounds *scored*, not noisy.

---

### PHASE 9 — REWARDED WALKING (make the street itself a game you replay)
*Give the walk pickup-truck physics: things to catch, chain, count, and find. All garnish-sized, all no-fail.*

**Build:**
- **Sparks (the collectible):** 10–14 per day (seeded positions along the street, biased toward unlit zones — nudging exploration *forward*), rendered as small chest-core motes bobbing at two heights: street level (walk through) and air level (jump for it). Collect = pooled `spark` burst + ping + counter pop. Reward: +1 XP each, daily cap; collecting ALL = +15 XP "Street Sweep" toast. Collision: reuse the proximity system for ground motes; air motes check inside the existing `onAirFrame` only.
- **Stomp combos:** chain clowns without touching the ground → ×2/×3/×4 toast pops (`fx.toast`), best-chain stat, 3+ chain = "CIRCUS CLOSED" flourish (all 5 confetti colors). Feeds the existing 🤡 counter; add `best chain` to it.
- **The odometer:** engine already integrates distance — accumulate px into `streetStore` (write-behind every 2s of walking, and on pagehide). Milestones at 1km/5km/25km/100km (px→m: 160px ≈ 1m) → achievements (`street_1k`…) + a subtle boot-print trim on the Seeker at 25km (first cosmetic — the Citizen hook's opening act).
- **Daily street event (one per day, seeded):** `HATER RUSH` (clown count ×2, all patrols faster — pure config change), `METEOR NIGHT` (starfall weather + double sparks), `QUIET MORNING` (no clowns, citizens ×2, one extra Guide whisper). Announced by a single toast at entry. Events recolor nothing and block nothing.
- **Street finds (3 secrets, ever):** seeded odd spots — a jump above the plaza fountain arc, the dark gap behind THE ARCHIVE ROW's last building, the far-east wall past the Spire. Standing/landing there → `mqfx-find` glint + a lore line (*"Someone scratched into the curb: KEEP GOING. It's in your handwriting."*) + achievement. Pure proximity targets, invisible until found.

**Accept:** all rewards route through the existing `addXP`/`unlockAchievement`; a player ignoring 100% of this reaches every district unimpeded; nothing respawns mid-session except clowns (existing law); daily determinism verified across reload.

---

### PHASE 10 — DISTRICT SHOWPIECES + SHIP GATE (signature art, then prove it)
*Give all 16 buildings a face you can name from across the street — then earn the ship.*

**Build A — showpieces (data-driven `facadeFx` key on buildings; renderer in WorldScene; ~16 small CSS rigs):**
Every district gets ONE signature animated element (small, ≤ 80px, glow grammar). Sketch set — refine to what reads best:
Daily Nexus: rotating day-counter flip glyph · War Rooms: radar sweep line · War Council: round-table glyphs orbiting · Identity Forge: hammer-strike spark every 6s · Vision Tower: sweeping searchlight beam · The Academy: floating holo-books · Formula Athenaeum: DNA-helix of formulas · Observatory: dome slit + telescope glint, night-only stars stream in · Pressure Forge: bellows glow pumping + ember leaks · Shadow Sanctum: breathing dark aura + candle row · Cup Springs: pouring stream + steam · Blaze Lab: tesla arcs between rooftop rods · Guild Quarter: banner waving · Hall of Champions: laurel shimmer + name-ticker · The Vault: door wheel slow-turn + gold seam light · Alchemist Spire: full crown treatment — orbiting glyph ring, violet lightning crackle when sealed, gold radiance when open.
`is-radiant` buildings run their showpiece at full glory; `dim` at 30%; `locked` frozen dark. Hometown buildings get 4 warm equivalents (chimney smoke, porch lamp moths, laundry line, windmill).

**Build B — the ship gate:**
1. **Perf audit:** DevTools 6× CPU — record trace walking full street with max population + rain + FULL tier. Budget: no frame > 16ms from scripting; compositor-only steady-state at idle. Count animated nodes (`getAnimations()` sample) — total ≤ 90 FULL / ≤ 40 LITE.
2. **Quality tiers wired** (§3.4): settings toggle FULL/LITE/AUTO + auto-demote; verify LITE visually acceptable.
3. **Reduced-motion sweep:** run all three gates; walk the entire street; every feature state-readable, nothing moves.
4. **Contract audit:** hometown world renders perfectly with zero new keys; then *give* it the new keys (near layer, ambient, weather theme) — both worlds verified.
5. **Collision audit with the Mask session:** rebuild against latest `main` + unstaged files; verify fog banks/battles/allies still work; `fx.js` + `sfx.duck` offered to their overlay.
6. **Full E2E script (manual, no screenshots needed — run the app and play):** fresh save → hometown → arrive at gates → walk east end-to-end at each tod (fake the clock) → jump, stomp chain ×3, run, skid → collect all sparks → trigger power-on cinematic → reach sealed Spire (approach dread) → mock 15/15 → beacon salute + ignition. Log every rough edge; fix; re-run.
7. **Docs:** update this file's status table (below), note tuning constants, leave `IMAGES_NEEDED`-style notes ONLY if any art truly can't be done in CSS/SVG (goal: zero).

**Accept:** you can name any district from silhouette + showpiece alone at a glance; both perf budgets met; all laws (§2) pass; Jon can play a fresh-save session start-to-finish and it feels like a game he'd pay for.

---

## 5) TUNING CONSTANTS (one place, tweak here first)

```js
// worldFxTuning.js — export a single object, import everywhere
CAMERA:  { lerp: 7, lookAhead: 0.40, turnMs: 400, bumpPx: 2, runZoom: 0.97 }
JUICE:   { hitstopMs: 60, shakeAmp: 5, poolSize: 24, landDust: 4 }
RUN:     { holdMs: 650, speed: 470, decelMs: 200, stepPx: 34 }
SKY:     { weatherKinds: [...], rainNodes: 2, cloudLoopS: [90, 140] }
LIFE:    { citizenBase: 2, citizenPerLit: 1, citizenCap: 14, tramMax: 3, ambientNodeCap: 30 }
REWARD:  { sparksPerDay: 12, sparkXP: 1, sweepXP: 15, mPerPx: 1/160 }
PERF:    { animNodesFull: 90, animNodesLite: 40 }
```

## 6) WHAT NOT TO DO

- No canvas, WebGL, or new npm packages. The constraint IS the style — push CSS/SVG until it sings.
- No animated `filter`, no animated `box-shadow` on layers, no `background-position` animation on large sheets (use transform on an oversized child).
- No `Math.random()` at render; no timers that tick while the player is idle (CSS clocks only).
- No rewriting `useWorldEngine`'s structure — every engine change in this doc is additive and small. If a change needs a restructure, stop and reconsider.
- Don't touch `cityWorld.css` except surgical single-selector additions; all new CSS goes in `cityWorldFx.css`.
- Don't gate real features behind collectibles. Don't add fail states. Don't add darkness that reads as threat (the Spire is awe, not horror).
- Don't bake ElevenLabs voices. Don't commit or deploy without being asked.

## 7) STATUS TABLE (update as you ship; the cross-session handoff record)

| Phase | Name | Status | Verified | Notes |
|---|---|---|---|---|
| 1 | Juice Core | ✅ built 2026-07-07 | ✅ compiles | `fx.js` pool (24 nodes) + `engine.freeze` + all verbs wired (coil/apex/fall/land/stomp-chain/door-flare/erupt); shake prefers `controls.addShake` |
| 2 | Camera II | ✅ built 2026-07-07 | ✅ compiles | smoothing lerp 7 · look-ahead 0.40/0.50 eased · layer shake offsets · `panTo()` promise (walk cancels, reduced-motion jump-cuts) · zoom on the translate3d string · letterbox bars |
| 3 | Living Sky | ✅ built 2026-07-07 | ✅ compiles | 4 tod palettes + celestial (moon/clouds/47s shooting star) + `weather.js` day-seeded (rain/drizzle/fog/embers/starfall) + grade/vignette/grain trio; fog thins ×0.6 over mask banks; hometown = fireflies/amber moon |
| 4 | Deep Street | ✅ built 2026-07-07 | ✅ compiles | `nearRef` 1.22 plane (`world.near`, door-clearance enforced in generator) · wet-asphalt reflections in a camera-scrolled ground strip (`groundRef`) · lamp cones · dual window grids + 18s flicker · billboards + plaza holo · curb/crosswalks |
| 5 | Seeker Alive | ✅ built 2026-07-07 | ✅ compiles | articulated sprite (cloak/arms/head/eyes, rim light, <4KB) · idle breathe/blink/head-turn/14s CSS fidget · run (hold 650ms → 470px/s, zoom 0.97, streaks, CSS ghost) · skid · 200ms decel glide · `onStep` every 34px |
| 6 | City Breathes | ✅ built 2026-07-07 | ✅ compiles | citizens 2+lit (cap 14) clustered at lit doors, day-seeded · trams on mid rail (1–3 by progress) · 2 drones / 3 dawn birds · 4 steam vents (rain ×2) · radiant door queues (1-in-3 days) · plaza arcs/sitters/busker · tod sleep cycle |
| 7 | Cinema & Story | ✅ built 2026-07-07 | ✅ compiles | `useCinematics` cineLock · power-on shot ≤3.5s (letterbox→pan→erupt→title slam, celebrate after) · 7 zone cards once-ever (streetStore) · door iris · Spire dread ≤600px (grade+cracks+hum) · 5 Guide whispers · GATE-2 beacon salute before `SpireIgnition` |
| 8 | Sound of the City | ✅ built 2026-07-07 | ✅ compiles | sfx.js extended: footstep/whoosh/thud/chain-pop/door-chime (hashed interval per district)/power-swell/spark-penta/zone sting · tod+theme bed (≤6 osc, night siren ~90s, hometown crickets) · rain bed · 55+82Hz Spire hum · `sfxDuck` −8dB (offered to Mask overlays) · HUD chip mute+volume, gesture-armed |
| 9 | Rewarded Walking | ✅ built 2026-07-07 | ✅ compiles | 12 day-seeded sparks (east-biased, ⅓ air) +1XP capped, Street Sweep +15XP · stomp combos ×2/×3 "CIRCUS CLOSED", best persisted on 🤡 chip · odometer (write-behind 2s + pagehide; 1/5/25/100km achievements, boots at 25km) · daily events (HATER RUSH / METEOR NIGHT / QUIET MORNING) · 3 street finds w/ lore |
| 10 | Showpieces + Ship | ✅ built 2026-07-07 | ⚠ static audit only | 16 city facade rigs + 4 hometown warm rigs (`facadeFx`, radiant/dim/locked scaling) · FULL/LITE/AUTO tiers (chip `FX·` button, `mqfx_quality`, ≤4-core demote) · hometown inherits near/ambient keys · runtime E2E + 6× trace NOT run (session was no-browser by Jon's order) — see punch list below |

*Build order is the phase order. Phase 1 + 2 are the foundation everything else consumes — do not skip ahead of them.*

### Ship-gate audit record (2026-07-07, build-only session — Jon barred Playwright/screenshots)

**Passing by construction / static audit:**
- `npm run build` green after every phase (10/10).
- Idle-rAF law: loop still exits when `dir==0 && !airborne && glideV==0` and camera settled/no shake/no pan/zoom done. Camera settles within ~1s of idle.
- Determinism: zero `Math.random()` in render paths (only the pre-existing quip pick + audio synthesis, both event-driven). All ambient/weather/sparks/events ride `daySeed.seedFor`.
- Reduced motion: all three gates kill every animation (cityWorld.css `* { animation: none }` covers all in-viewport mqfx nodes); fx.js pool refuses to spawn (`motionOk`); `panTo` jump-cuts; letterbox transition gated; static poses keep states readable.
- Buttons law: every FX layer `pointer-events:none`; near-plane pillars generated ≥120px from door centers; buildings/NPCs/prompt untouched.
- No new deps, no canvas/WebGL, Sora/Manrope only, all new CSS in `cityWorldFx.css` (mqfx-*), engine changes additive (no restructure).
- Animated box-shadow: one 2×6px glint (small-element exemption). No animated filter anywhere.

**Punch list for the next session (needs a browser):**
1. DevTools 6× CPU trace, full-street walk, max population + rain + FULL — verify no scripted frame >16ms; `getAnimations()` count (static estimate ≈85–100 FULL viewport-visible; LITE ≈35 — trim citizens/vents first if over).
2. Play the full E2E script (§Phase 10.6) incl. fresh save + 15/15 mock + all four tods (fake clock in `cityAtmosphere.getTimeOfDay`).
3. Audio: confirm cold-load silence, mute <100ms, duck behavior under Mask battles.
4. Tuning passes: camera lerp/look-ahead feel, rain sheet opacity at dusk, citizen density at 15/15.
5. Offer `fx.js` + `sfxDuck` to the Mask session's overlays (built as public APIs for them).

**Tuning constants** live in `src/components/city/world/worldFxTuning.js` (CAMERA/JUICE/RUN/SKY/LIFE/REWARD/PERF) — tweak there first. No art gaps: everything shipped in CSS/SVG, zero image assets needed.

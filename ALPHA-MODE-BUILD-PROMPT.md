# MILESTONE QUEST — ALPHA MODE · MASTER BUILD PROMPT
### Paste this file into a fresh Claude session to build the next phase.

> ALPHA MODE turns THE IRON (the workout mode) into a full game campaign:
> an 11-stage Hero's Journey world with 4 playable training phase-zones
> (PRIME → ADAPT → SURGE → COMPLETE), Myth Boss battles, a 6-hormone
> character stat system, cheat-day/feast-fast events, wisdom scrolls,
> signature moves, and benchmark ladders — all feeding the existing
> workout tracker (Log + PR Wall) that lives beside it.

---

## 0 · STATE OF THE BUILD (update this table every session)

| Phase | Status | Session |
|---|---|---|
| 0 — Foundation (data, engines, persistence, ALPHA entrance) | **BUILT 2026-07-07** | this doc's birth session |
| 1 — The Crossing (story onboarding, stages 1–4) | NOT STARTED | |
| 2 — World Map + Myth Bosses + Scrolls | NOT STARTED | |
| 3 — PRIME playable (MRT circuits, fast clock, carb ramp) | NOT STARTED | |
| 4 — ADAPT (density engine, Cheat Day boss) | NOT STARTED | |
| 5 — SURGE (tempo/lactic training) | NOT STARTED | |
| 6 — COMPLETE + Apotheosis endgame | NOT STARTED | |
| S — THE STOCKPILE (Sunday meal prep + Fill Your Fridge) — can run any time after Phase 0 | NOT STARTED (data+engine BUILT 2026-07-07) | |

Migrations 012 (`012_iron_workout.sql`) and 013 (`013_alpha_mode.sql`) must be run
by Jon in the Supabase SQL editor. Everything works local-first before that.

---

## 1 · WHAT ALREADY EXISTS (reuse, never rebuild)

**THE IRON foundation** (built + browser-verified 2026-07-07):
- `src/components/workout/WorkoutMode.jsx` — transport overlay: topbar "45" plate flies center stage, chalk-dust canvas, `body.iw-mode-on` app recede
- `src/components/workout/IronWorkout.jsx` — mode root. Views: cover / creed / plans / plan / session / wall / log / session-detail / **alpha**. Contains `LiveSession` (weight/reps steppers, set logging, `RestTimer` conic ring, auto-PR detect vs wall + `PRFlash`, `RackedOverlay`, XP via `useAppData().addXP`)
- `src/components/workout/useWorkout.js` + `src/lib/workoutService.js` — the local-first persistence pattern: paint from localStorage cache → fetch Supabase → reconcile; optimistic writes with client-minted UUIDs; every mutation re-caches
- `src/styles/workout.css` (`iw-` book / `iwm-` shell prefixes)
- `src/lib/sfx.js` — WebAudio one-shots incl. `sfxPlateClank`, `sfxChalkPoof`, `sfxRoundBell`, `sfxImpact`, `sfxPhoenix`, `sfxCoin`

**ALPHA Phase-0 foundation** (this doc's session):
- `src/components/workout/alpha/data/` — `phases.js` (ALL numbers: eating equations, maintenance chart, 4-week rotations, 16 workout definitions), `mythBosses.js` (11), `traits.js` (7), `journey.js` (11 stages + Reward Board), `scrolls.js`, `moves.js`, `foods.js` (4-category food inventory + grocery heuristics + prep steps)
- `src/components/workout/alpha/engine/` — `eatingEngine.js`, `autoDifficulty.js`, `scheduler.js`, `hormones.js`, `fastClock.js`, `mealPrep.js` (week targets → grocery plan → fridge progress) — pure functions, smoke-tested against the bible's worked examples
- `src/lib/alphaService.js` + `src/components/workout/alpha/useAlpha.js` — alpha_state/alpha_events persistence (mirrors useWorkout)
- `src/components/workout/alpha/AlphaMode.jsx` + `AlphaCall.jsx` + `CharacterForge.jsx` + `src/styles/alpha.css` (`iw-al-` prefix) — the ⚡ ALPHA nav space: Call teaser → Character Forge → Phase-0 home (character sheet, today's macros, hormone dials preview, 11-stage road strip)
- `supabase/migrations/013_alpha_mode.sql`
- Engine smoke script pattern: `alpha-engine-smoke.mjs` (scratchpad) — asserts Steve 200lb/20%: LBM 160, maintenance 2,240; PRIME wk1 workout day 1,940 cal/128p/30c/~145f; COMPLETE workout day 2,540/240/160/~104f; auto-difficulty <14/25+ rule; rotation tables

---

## 2 · LAWS (every phase, non-negotiable)

1. **Brand**: THE IRON base — steel gunmetal, chalk `#E8E4DA`, ember `#FF6A2B`. Zone accents: PRIME `#5FB8C9` cyan-steel · ADAPT `#FF6A2B` ember · SURGE `#9B6BFF` violet · COMPLETE `#E9C46A` gold. Fonts: **Sora/Manrope only** (monospace/utility fonts BANNED).
2. **Perf**: mobile-first; NO laggy pointer effects; animation = CSS keyframes + at most one rAF canvas per screen (ChalkDust pattern); heavy screens must stay smooth on a mid phone.
3. **Copy**: everything is a *game mechanic* (stats, timers, meters, bosses) — never prescriptive medical/nutrition instruction. Onboarding carries a "game systems, not medical advice" line. Fasting features always show the beginner fallback (small 400-cal dinner). Drive/hormone copy stays tasteful.
4. **Copyright**: no quotes or branding from the source book. Signature moves use in-house names — **The Spearpoint** (one-arm overhead barbell press, hand mid-shaft), **The Crown Press** (bar shoulder-to-shoulder overhead, "knight yourself"), **The Kingmaker** (double-overhand ⅔-squat pull). Wisdom Scrolls are original in-world Mentor lines. Campaign display name: **ALPHA MODE**.
5. **Persistence**: local-first exactly like `useWorkout.js` (cache key, optimistic writes, client UUIDs). Campaign workouts save through the EXISTING `workout_sessions` flow (+ `meta` jsonb) so the Log and PR Wall stay the single source of history.
6. **XP/dopamine**: every completed ritual pays XP through `useAppData().addXP`; every milestone moment gets sfx + a CSS celebration. Session end-screens deliver the most important message LAST (anterograde memory principle).
7. **Concurrent sessions**: Jon may run two sessions on this repo. Check `git status` + recent file mtimes before editing shared files; prefer new files; gap-pass around a live writer.

---

## 3 · ARCHITECTURE (fixed)

```
IronWorkout nav: plans · wall · log · ⚡alpha · creed · close
AlphaMode (campaign root, view state machine)
 ├─ onboarding: AlphaCall → RewardBoard → ArchetypePick → CharacterForge → Mentor seal
 ├─ WorldMap: 11 stage nodes (journey.js) · zones nested at stages 5–9
 ├─ zone hubs (AlphaZone): today card · EatingCard · FastClock · HormonePanel
 │    · CarbRampMeter (PRIME) · DensityMeter (ADAPT) · TempoTimer (SURGE)
 │    · ScheduleGrid (4-week rotation) · CheatDayEvent (weekly)
 ├─ MythBossFight — gates stage transitions
 ├─ AlphaSession — scheduler → workout def → extended LiveSession
 │    (CircuitTimer nested clocks; sessions land in workout_sessions w/ meta)
 └─ endgame: BenchmarkLadder · TraitTree · Apotheosis
```

**Data contracts** (already implemented — read `data/phases.js` before building UI):
- Workout def: `{ id, phase, n, name, style, blocks: [{ key, kind: circuit|straight|density|tempo|totalreps, rounds|minutes, restBetweenEx, restBetweenRounds, tempo?, weightBumpPct?, exercises: [{ name, reps, fill? }] }] }`
- Scheduler slot: `{ kind: workout|rest|cardio, workoutId?, nutrition: { isWorkoutDay, cheat, fullFast } }`
- Macro result: `{ lbm, maintenance, calories, protein, carbs, fat }`
- Hormone dials: `{ ghrelin, leptin, cortisol, gh, testosterone, insulin }` each 0–100 (higher = better regulated)
- alpha_state row: `{ phase, week, stage, body_weight, body_fat, archetype, flags jsonb, hormones jsonb }`
- alpha_events row: `{ kind, payload jsonb }` — kinds: `forge, call, boss_defeat, scroll, cheat_day, fast_complete, sleep_log, stage_up, week_complete, measurement`

**New sfx to add when their phase lands** (follow sfxPlateClank's style in sfx.js): `sfxForgeStrike` (P1), `sfxBossHit`/`sfxBossDown` (P2), `sfxScrollUnfurl` (P2), `sfxTempoTick` (P5), `sfxRungUp` (P6).

---

## 4 · PHASE SPECS

### PHASE 1 — The Crossing (story onboarding, Hero's Journey stages 1–4)
Replace the Phase-0 teaser flow with the full cinematic:
1. **Ordinary World** — a mirror screen: 3 quiet questions about the familiar (not comfortable) life. "Staying should be scarier than leaving."
2. **The Call** — presented small and missable on purpose (a faint knock UI the user must notice/tap — teach that calls are subtle). Mentor: names what just happened.
3. **Refusal pre-empt** — the Mentor names the "this is bullshit" moment BEFORE the user has it; fear of inadequacy named out loud. Choice framing: walk or cross.
4. **Reward Board** — the 6 reward cards from `journey.js` (abs/armor/drive/confidence/sleep/skin) dealt like cards, each tied to its hormone stat.
5. **ArchetypePick** — choose-your-adventure: 3 archetypes (e.g. The Doubter/Colin-type, The Returner, The Rookie) — flavor only, stored in alpha_state.
6. **CharacterForge** (exists — reskin into the flow) → forge strike → character sheet reveal.
7. **Mentor seal + first Wisdom Scroll** (`scrolls.js: call`) → stage set to 5, PRIME gate visible. Final line of the flow = the single most important message (memory principle).
Files: `AlphaCall.jsx` (expand), `RewardBoard.jsx`, `ArchetypePick.jsx` (new). Accept: fresh account runs the full flow → lands at stage 5 with sheet + scroll persisted.

### PHASE 2 — World Map + Myth Bosses + Scrolls
- `WorldMap.jsx` + `StageNode.jsx`: 11-node serpentine path (CSS, zone-accent glows; art hooks: `public/assets/alpha/…` slugs listed in a new `ALPHA-IMAGES-NEEDED.md` for Codex/Higgsfield). Node states locked/active/complete from alpha_state.
- `MythBossFight.jsx`: "Reject This Thought" battle — boss card slams in (name + myth line), player must smash the myth: pick the truth from 2–3 cards, then a hold-to-crush interaction; boss shatters (CSS shards + sfxBossDown), truth card is added to a "busted myths" codex. Bosses/gates from `mythBosses.js` (1–3 gate PRIME stages).
- `WisdomScroll.jsx`: unfurl animation at each zone gate + scroll shelf view.
Accept: map navigates, boss winnable + persisted (`boss_defeat` event), scroll shelf shows collected.

### PHASE 3 — PRIME playable
- `AlphaZone.jsx` (zone hub) + `ScheduleGrid.jsx` (4-week rotation from `scheduler.js`).
- `AlphaSession.jsx`: builds a session from the workout def and runs it through LiveSession-style UI with `CircuitTimer.jsx` — nested clocks (exercise rest ≤30s/≤20s + circuit rest 3min/90s), AMRAP set support, auto-difficulty verdict after each block (`autoDifficulty.js`), saves via existing addSession w/ `meta: { alpha: { phase, week, workoutId } }`.
- `EatingCard.jsx` (today-aware macros), `CarbRampMeter.jsx` (30→75→100g unlock tiers), `FastClock.jsx` (16/8 ring + Refuel meter), `HormonePanel.jsx` + quick sleep log (dials move via `hormones.js`, persisted).
- Week completion → `week_complete` event → week 4 done = stage-up + ADAPT gate.
Accept: full guided PRIME workout E2E lands in The Log with meta; macros match engine; dials respond to sleep/fast/training.

### PHASE 4 — ADAPT
- `engine/densityEngine.js`: work capacity = volume ÷ time; per-block live meter; beat-your-own-circuit detection; weight bumps +5–10% (A) / +3–5% (B) / hold (C).
- `DensityMeter.jsx` in-session; weight-bump prompt cards between block repeats.
- `CheatDayEvent.jsx`: Sunday boss event — the 4 diet-debuff meters (thyroid, BMR, cortisol, leptin from `phases.js` debuffs) visually reset; zero-guilt copy; Feast/Fast pairing flow (Monday full fast w/ 400-cal fallback choice); cardio-day cards.
- Myth bosses 4–7 gate ADAPT stages.
Accept: density workout w/ live meter + bump prompts; cheat event fires by schedule, resets debuff meters, logs `cheat_day`.

### PHASE 5 — SURGE
- A/B/C/D segment sessions (20-rep bookend → tempo blocks → 25-rep light closer at 20–30% of A) via `SegmentTracker.jsx` (4-act progress bar).
- `TempoTimer.jsx`: cadence pulse for 4-0-1 / 3-0-1 / 1-0-4 (expanding/contracting ring + tick sfx; optional tap-timing scoring = bonus XP).
- Alternating calories in EatingCard (first above-maintenance days — celebrate it).
- Myth bosses 8–11.
Accept: tempo block playable w/ cadence cues; surplus/deficit macros correct per day type.

### PHASE S — THE STOCKPILE (Sunday Meal Prep · "Fill Your Fridge")
Jon's request 2026-07-07: "Sunday meal prep section that helps you with groceries and what we need, a full guide that helps you go next level — FILL YOUR FRIDGE game animation concept. I love doing meal prep on Sunday and we also have a Sunday check-in anyways it can link to."
Standalone phase — buildable any time after Phase 0 (data + engine already exist: `data/foods.js`, `engine/mealPrep.js`).
- `StockpilePage.jsx` — the Sunday ritual hub inside ALPHA: this week's macro ledger (from `weekTargets`), the grocery plan (from `groceryPlan`: category quantities + pick-lists as check-off chips), the 7-step prep guide (`PREP_STEPS`), and the cheat-day "buy nothing in advance" warning when Sunday cheat is on the board.
- `FillYourFridge.jsx` — THE GAME: a big CSS steel fridge, doors open, 4 labeled shelves (Proteins / Green Wall / Fuel / Fats). Every grocery line + prep step checked off animates an item flying onto its shelf (plate-flyer pattern). Progress = `fridgeProgress`. At 100%: doors SLAM shut (sfxPlateClank), "STOCKED" stamp + chalk burst, XP award, `fridge_stocked` event, and the week's badge on the Stockpile shelf.
- **Sunday Check-in link**: surface a Stockpile card on the existing Sunday Review page (nav `weekly`, `WeeklyReviewPage.jsx`) — "Fridge stocked? → enter The Stockpile"; completing the fridge marks a line in the Sunday Review. Also pairs with ADAPT+ cheat Sunday (feast, then stock for the week).
- **Daily photo accountability (Jon 2026-07-07: "for each day you have to take a picture and upload it into your fridge")**: the fridge DOOR carries 7 magnet slots (Mon–Sun). Each day the user snaps a photo of the real meal/prep and pins it under that day's magnet — polaroid drop-in animation + magnet clack sfx. A full week of pins = "SEVEN SEALS" bonus (XP + streak flame on the fridge handle). Storage: new Supabase Storage bucket `fridge-photos` (owner-only RLS, path `userId/yyyy-mm-dd.jpg`, client-side resize ≤1280px before upload like existing photo flows); photos are PRIVATE by default with an optional "show my squad" share that posts to the Zone feed through the existing Zone flow (which already carries the UGC filter/report pipeline). Offline: queue the pin locally, upload on reconnect. Events: `fridge_photo` (payload = date, storage path).
- Events: `meal_prep` (started), `fridge_stocked` (completed, payload = week targets), `fridge_photo` (daily pin). Streaks: consecutive stocked Sundays + consecutive photo days.
Accept: grocery plan matches engine numbers for the active phase/week; fridge fills item-by-item and slams at 100%; daily photo pins to the door magnet and persists to storage; card appears in Sunday Review; stocked event persists.

### PHASE 6 — COMPLETE + Endgame
- 4-style rotating week (Furnace/Engine/Forge/Summit day cards; week-seed rotation so no two weeks feel identical).
- `engine/ladder.js` + `BenchmarkLadder.jsx`: numeric rungs per big lift fed from workout_prs history (135→225→250→275→300 pattern); rung-up celebration.
- `TraitTree.jsx`: 7 light/shadow pairs from `traits.js`, leveled by behavior streaks (consistency, showing up after a missed day, honest logging).
- `Apotheosis.jsx`: finale — the Ordeal recap (numbers from the whole campaign), "if I can change this, I can change anything" beat, Return-with-Elixir screen, then the global dopamine polish pass (XP tuning, streak fire, celebrations everywhere).
Accept: full campaign loop closes; finale plays from real data.

---

## 5 · VERIFICATION HARNESS (every phase)

1. `npm run build` must pass.
2. `node <scratchpad>/alpha-engine-smoke.mjs` — bible worked-example assertions.
3. Browser walkthrough via raw CDP (no Playwright MCP needed):
   - Start Chrome: `Start-Process "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" -ArgumentList '--remote-debugging-port=9222', "--user-data-dir=$env:TEMP\claude-cdp-profile", '--no-first-run', '--headless=new', 'about:blank'`
   - `npm run preview` (serves dist on :4173 — REBUILD FIRST, it serves stale dist otherwise)
   - Node 24 built-in WebSocket → CDP: new tab via `PUT /json/new`, `Page.navigate`, `Runtime.evaluate` (React inputs need native-setter + input event), `Page.captureScreenshot`. Demo login: coachowkins@gmail.com / demodemo. Skip boot: `sessionStorage.setItem("milestone_mapping_boot_shown","1")`.
   - Kill only chrome processes whose command line matches `claude-cdp-profile`.
4. Update the STATE OF THE BUILD table at the top of this file + the memory index.

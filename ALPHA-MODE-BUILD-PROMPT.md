# MILESTONE QUEST — ALPHA MODE · MASTER BUILD PROMPT
### Paste this whole file into a fresh Claude session, then say which phase to build.

> ALPHA MODE turns THE IRON (the workout mode) into a full game campaign:
> an 11-stage Hero's Journey world with 4 playable training phase-zones
> (PRIME → ADAPT → SURGE → COMPLETE), Myth Boss battles, a 6-hormone
> character stat system, cheat-day/feast-fast events, Sunday meal-prep
> with the Fill-Your-Fridge game, wisdom scrolls, signature moves, and
> benchmark ladders — all feeding the existing workout tracker
> (Log + PR Wall) that lives beside it.

**How to use this doc:** build exactly ONE phase per session. Read §1–§4
first (they are the contract), then jump to your phase in §5. When done:
run §6 verification, update the STATE table below AND the memory index,
and leave everything uncommitted unless Jon says commit.

---

## 0 · STATE OF THE BUILD (update every session)

| Phase | Status | Notes |
|---|---|---|
| 0 — Foundation (data, engines, persistence, ⚡ entrance) | **BUILT + VERIFIED 2026-07-07** | engines 54/54 vs bible |
| 1 — The Crossing (story onboarding, stages 1–4) | **BUILT + VERIFIED 2026-07-08 overnight** | mirror → missable knock → refusal → reward board → archetype → forge → seal |
| 2 — World Map + Myth Bosses + Scrolls | **BUILT + VERIFIED 2026-07-08 overnight** | serpentine road, hold-to-crush battles, shelf, gates; ALPHA-IMAGES-NEEDED.md manifest |
| 3 — PRIME playable (MRT circuits, fast clock, carb ramp) | **BUILT + VERIFIED 2026-07-08 overnight** | AlphaSession plays ALL 5 block kinds; hub w/ eating/fast/hormones/ramp/grid |
| 4 — ADAPT (density engine, Cheat Day boss) | **BUILT 2026-07-08 overnight** | density ghost meter + bump prompts + Refuel event (E2E play deferred to real ADAPT week) |
| 5 — SURGE (tempo/lactic training) | **BUILT 2026-07-08 overnight** | tempo cadence ring + A/B/C/D segments (E2E play deferred to real SURGE week) |
| 6 — COMPLETE + Apotheosis endgame | **BUILT 2026-07-08 overnight** | ladders + traits verified in codex; Apotheosis fires on COMPLETE w4 |
| S — THE STOCKPILE (Sunday meal prep · Fill Your Fridge · photo magnets) | **BUILT + VERIFIED 2026-07-08 overnight** | fridge slam + STOCKED + magnets verified; photo upload = local-first until migration 016; Sunday Review deep link verified |

Overnight build smoke: 80/80 engine asserts. Full CDP walkthrough (27 screens):
crossing → map → gate → guardian boss crushed → PRIME entered → Iron Circuit II
session → RACKED → stockpile stocked+slammed → codex tabs → Sunday Review card →
deep link lands on Stockpile. Two bugs found+fixed: fridge weekKey UTC shift;
deep-link race (removed IronWorkout's redundant startOpen reset effect).
Migrations for Jon's SQL editor: 012, 013, 016. NOT committed, NOT deployed.

**Migrations:** `012_iron_workout.sql` and `013_alpha_mode.sql` are NOT yet
applied to prod — Jon runs them in the Supabase SQL editor (014/015 from the
App-Store track are already live). Everything must work local-first regardless.
**Git:** THE IRON committed in `a11eef1`; Alpha Phase 0 uncommitted as of 2026-07-07.

---

## 1 · THE WORLD (vision + tone — read this even for late phases)

ALPHA MODE lives INSIDE THE IRON: blackened steel, chalk dust, ember heat.
The user is a man answering a quiet knock — a campaign for the body run like
a game. The Mentor narrates: plain, heavy, short sentences. Chalk-on-steel
wisdom, never infomercial hype (the source book's sales voice is explicitly
what we're NOT doing). Everything is a mechanic: hormones are stat dials,
myths are bosses, rest is part of the lift, the fridge is the loadout screen.

Copy voice examples (calibrate to these):
- "The scale is not a judge. It is a witness."
- "Strength is a debt the easy days owe the hard ones."
- "The wall is not in the way. The wall is the way."
- Rest timer skip: "skip — back under the bar." Abort modal: "Nothing gets
  saved unless you rack it. Walk away, or finish what you started."

The user-facing campaign name is **ALPHA MODE**. The four zones are PRIME,
ADAPT, SURGE, COMPLETE. The Hero's Journey stage names are used openly.

---

## 2 · WHAT ALREADY EXISTS (reuse, never rebuild)

**THE IRON foundation** (`src/components/workout/`):
- `WorkoutMode.jsx` — transport overlay: topbar "45" plate flies center stage
  (Web Animations API, `getLaunchRect`/`getLandingRect`), ChalkDust rAF canvas,
  `body.iw-mode-on` app recede, Escape closes.
- `IronWorkout.jsx` — mode root. View state machine: cover / creed / plans /
  plan / session / **alpha** / wall / log / session-detail. Nav: plans · ⚡alpha ·
  the wall · the log · creed · close. Contains:
  - `LiveSession` — per-set weight/reps `Stepper`s, "rack the set" logging,
    `RestTimer` (conic ring, presets 60/90/120/180s, bell+vibrate at 0),
    auto-PR detection vs wall best + `PRFlash` banner, abort-confirm modal,
    `finish()` → total volume/sets/duration → `onFinish({session, prs})`.
  - `RackedOverlay` — plate slam + chalk burst + stats + XP.
  - `useWorkout()` mutations: `addSession`, `addPR`, plans CRUD.
- `useWorkout.js` + `src/lib/workoutService.js` — THE persistence pattern:
  paint from localStorage cache → fetch Supabase → reconcile; optimistic
  writes with client-minted UUIDs; every mutation re-caches. Copy it exactly.
- `src/styles/workout.css` — `iw-` (book) / `iwm-` (shell) classes: buttons
  (`iw-btn-ember`, `iw-btn-ghost`), `iw-stepper`, `iw-page`, `iw-stack`,
  `iw-chip`, `iw-rest-ring`, `iw-nav`, modal veil, reduced-motion blocks.
- `src/lib/sfx.js` — WebAudio: `sfxPlateClank`, `sfxChalkPoof`, `sfxRoundBell`,
  `sfxImpact(level)`, `sfxPhoenix`, `sfxCoin`, `sfxBuzzer`, `sfxWhoosh` + the
  building blocks (`subDrop`, `crack`, `blip`, `noise`, `env`) for new sounds.

**ALPHA Phase-0 foundation** (`src/components/workout/alpha/`):
- `data/phases.js` — `PHASES` (eating multipliers, fasting spec, nutritionDays,
  4-week `rotation` tables w/ day idx **Mon=0…Sun=6**), `WORKOUTS` (all 16
  definitions — block kinds: `circuit | straight | density | tempo | totalreps`),
  `MAINTENANCE_CHART`, `ZONE_ACCENTS`, `DIET_DEBUFFS`, `PHASE_ORDER`.
  Bible-gap entries are flagged `fill: true` (swappable).
- `data/mythBosses.js` — 11 bosses `{id, n, gatePhase, tier, name, myth, truth,
  decoy}` + `bossesForPhase()`. Names: The Morning Warden, The Grazer King,
  The Six-Plate Hydra, The Gatekeeper of Thirty, The Midnight Glutton, The
  Dawn Herald, The Treadmill Wraith, The Feather Duke, The Snake-Oil Peddler,
  The Sculptor's Lie, The Empty Tank.
- `data/journey.js` — `JOURNEY` (11 stages, stages 5–10 carry `zone`),
  `REWARD_BOARD` (6 cards w/ `stat` links), `ARCHETYPES` (doubter/returner/rookie).
- `data/traits.js` — 7 light/shadow pairs w/ `levelRule` behavior hooks.
- `data/scrolls.js` — 10 original scroll lines keyed by unlock moment.
- `data/moves.js` — The Spearpoint / The Crown Press / The Kingmaker
  (+ `genericName` form reference, `cue` copy).
- `data/foods.js` — `FOOD_CATEGORIES` (proteins/free-veg/fats/low-GI carbs),
  `GROCERY_HEURISTICS`, `PREP_STEPS` (7 Sunday ritual steps).
- `engine/eatingEngine.js` — `leanBodyMass`, `maintenanceCalories`,
  `dayMacros({weightLb, bodyFatPct, phaseId, week, isWorkoutDay})` →
  `{lbm, maintenance, calories, protein, carbs, fat}`.
- `engine/autoDifficulty.js` — `assessBlock(totalReps)` → verdict lower(<14)/
  raise(25+)/hold + `suggestWeight(current, verdict, increment=5)`.
- `engine/scheduler.js` — `daySlot(phaseId, week, dayIdx)` → `{kind:
  workout|rest|cardio, workout, nutrition:{isWorkoutDay, cheat, fullFast,
  fasting}}`, `weekGrid()`, `dayIdxFromDate()` (Mon=0 conversion!).
- `engine/hormones.js` — `HORMONES` meta, `initDials()` (all 50),
  `applyAction(dials, {kind: sleep|fast_complete|train_mrt|train_density|
  train_tempo|train_heavy|cheat_day|deficit_week, ...})`, `decayDays`,
  `condition()`.
- `engine/fastClock.js` — `clockStatus({openHour, fastHours, eatHours, now})`
  → `{phase: fasting|eating, remainingS, progress, windowLabel}`,
  `refuelMeter(lastRefuelISO)` 0–100, `fastStreak()`.
- `engine/mealPrep.js` — `weekTargets()` (sums real schedule, skips cheat day),
  `groceryPlan()` → `{targets, lines[4 categories w/ qty/why/picks],
  prepSteps, cheatNote}`, `fridgeProgress(plan, checkedIds)`.
- `useAlpha.js` — cache `alpha_mode_cache_v1`; `state = {phase, week, stage,
  bodyWeight, bodyFat, archetype, flags, hormones}` + `events[]`;
  mutations: `patchState`, `logEvent(kind, payload)`, `answerCall`,
  `forgeCharacter`, `moveHormones(action)`.
- `src/lib/alphaService.js` — `fetchAlpha`, `upsertState`, `createEvent`.
- `supabase/migrations/013_alpha_mode.sql` — `alpha_state`, `alpha_events`
  (owner-only RLS), `workout_sessions.meta jsonb`.
- UI: `AlphaMode.jsx` (router: Call → Forge → `AlphaHome`), `AlphaCall.jsx`
  (teaser cinematic + the not-medical-advice line), `CharacterForge.jsx`
  (steppers → strike ritual), `src/styles/alpha.css` (`iw-al-` prefix,
  imported by AlphaMode).
- Engine smoke test: recreate from §6 (asserts bible worked examples).

---

## 3 · LAWS (every phase, non-negotiable)

1. **Brand**: steel gunmetal · chalk `#E8E4DA` · ember `#FF6A2B` base. Zone
   accents (in `ZONE_ACCENTS`): PRIME `#5FB8C9` · ADAPT `#FF6A2B` · SURGE
   `#9B6BFF` · COMPLETE `#E9C46A`. Fonts **Sora/Manrope only** — monospace
   and utility fonts are BANNED repo-wide.
2. **Perf**: mobile-first (design at 430px); NO laggy pointer effects;
   animation = CSS keyframes + at most one rAF canvas per screen; test feel
   on the assumption of a mid-tier phone.
3. **Copy**: game mechanics, never prescriptive medical/nutrition advice.
   The disclaimer line stays visible at onboarding. Fasting features always
   offer the beginner fallback (small 400-cal dinner). Drive/hormone copy
   stays tasteful. Mentor voice per §1.
4. **Copyright**: no quotes or branding from the source book anywhere.
   Signature moves keep their in-house names. Wisdom Scrolls are original
   lines only. If new content is needed, write it fresh in the Mentor voice.
5. **Persistence**: local-first exactly like `useWorkout.js`. Campaign
   workout sessions save through the EXISTING `useWorkout().addSession` with
   `meta: {alpha: {...}}` — the Log and PR Wall stay the single history.
   Campaign state/events go through `useAlpha`.
6. **XP / dopamine**: pay XP via `useAppData().addXP(amount, label)`; every
   milestone gets sfx + a CSS celebration; the most important message of any
   flow lands LAST (anterograde memory principle). XP economy in §4.
7. **Concurrent sessions**: Jon may run two sessions on this repo. Before
   editing SHARED files (App.jsx, AppShell, globals.css, sfx.js, package.json),
   check `git status` + recent mtimes (`Get-ChildItem src -Recurse -File |
   Sort LastWriteTime -Desc | Select -First 10`). Prefer new files; gap-pass
   around a live writer; never revert their changes.
8. **Migration numbering**: check `supabase/migrations/` for the next free
   number before creating one (App-Store track also mints migrations).

---

## 4 · CONTRACTS, XP ECONOMY, SFX

**Workout def** (in `WORKOUTS`): `{id, phase, n, name, style, styleLabel?,
blocks: [{key, kind, rounds?|minutes?, totalReps?, restBetweenEx?,
restBetweenRounds?, restAfter?, tempo?[down,pause,up], weightBumpPct?[lo,hi],
repMax?, repsPerTurn?, bookend?, closer?, lightPctOfA?, ladder?, warmup?,
note?, exercises: [{name, reps, signature?, fill?, alt?}]}]}`.

**Session meta tag** (on `addSession`): `meta: {alpha: {phaseId, week,
dayIdx, workoutId, style, blocks: [{key, totalReps, verdict}]}}`.

**alpha_events kinds** (append-only, payload free-form): `call`, `forge`,
`boss_defeat {bossId}`, `scroll {scrollId}`, `stage_up {from,to}`,
`week_complete {phaseId, week}`, `phase_complete {phaseId}`, `sleep_log
{hours}`, `fast_complete {hours}`, `cheat_day`, `meal_prep`, `fridge_stocked
{targets}`, `fridge_photo {date, path}`, `measurement {weightLb, bodyFatPct}`.

**alpha_state.flags** (jsonb, additive): `callAnswered`, `forged`,
`bossesDefeated: []`, `scrolls: []`, `windowOpenHour`, `cheatDow`,
`lastRefuelISO`, `crossingDone`, `fridgeChecks: {weekKey: []}`.

**XP economy** (addXP labels in Mentor voice):
| Moment | XP |
|---|---|
| Answer the Call / collect a scroll | 10 |
| Forge character / archetype sealed | 25 |
| Complete an Alpha workout (RACKED) | 20 (+15 per PR — already paid by tracker) |
| Block verdict followed next session (auto-difficulty honored) | 5 |
| Myth boss defeated | 30 |
| Fast completed / sleep logged | 5 |
| Cheat Day event completed | 15 |
| Week complete | 40 · Phase complete: 100 |
| Fridge stocked (Sunday) | 25 · Daily photo pin: 5 · Seven Seals week: 30 |
| Benchmark rung up | 25 · Trait leveled: 20 · Apotheosis: 200 |

**New sfx** (add to `src/lib/sfx.js` in the style of `sfxPlateClank` —
try/catch, `ok(settings)` gate, build from subDrop/crack/blip):
| Name | Phase | Character |
|---|---|---|
| `sfxForgeStrike` | 1 | anvil hit: deep subDrop + double crack + long metallic blip tail |
| `sfxBossHit` / `sfxBossDown` | 2 | stone crack / shatter + low boom |
| `sfxScrollUnfurl` | 2 | soft paper noise sweep (bandpass 900→3k) + gold blip |
| `sfxTempoTick` | 5 | short muted tick (2 pitches: down-phase low, up-phase high) |
| `sfxRungUp` | 6 | rising two-note blip + clank accent |
| `sfxFridgeSlam` / `sfxMagnetClack` | S | door thud (bookThump variant) / tiny high crack |

---

## 5 · PHASE SPECS

### PHASE 1 — THE CROSSING (story onboarding · stages 1–4)
Replace the Phase-0 teaser with the full cinematic. One flow component
orchestrates sub-screens; persist progress so a mid-flow refresh resumes.
New: `RewardBoard.jsx`, `ArchetypePick.jsx`; expand `AlphaCall.jsx`.
1. **Ordinary World (stage 1)** — a dark mirror screen. Three quiet prompts
   answered by tapping honest/soft chips (not typing): energy, mirror,
   drive. Close line: "Familiar is not the same as comfortable."
2. **The Call (stage 2)** — deliberately small and missable: a faint ember
   knock pulses in a corner of the dark screen (subtle sfx). The user must
   NOTICE and tap it — teach that calls are quiet. If they wait 8s, the
   Mentor points: "It's there. It won't knock twice loudly."
3. **The Refusal (stage 3)** — the Mentor names the quit-thought BEFORE the
   user has it: "Somewhere in the next month you will decide this is
   bullshit. That thought is fear of inadequacy wearing a disguise." Choice
   buttons: "walk away" (goes back — and the knock returns, patient) /
   "cross" (proceeds). Staying must feel scarier than leaving.
4. **Reward Board** — the 6 `REWARD_BOARD` cards dealt one-by-one (CSS card
   deal, stagger 150ms), each showing its linked hormone dial. User picks
   the TWO that matter most → stored in flags, referenced later by the
   Mentor.
5. **ArchetypePick** — 3 `ARCHETYPES` cards; pick tunes Mentor tone lines.
6. **CharacterForge** — existing component slotted into the flow (stage 4
   = Meeting the Mentor happens around the forge).
7. **Mentor seal** — first scroll (`call`) unfurls (sfxScrollUnfurl), stage
   set to 5, PRIME gate revealed on the road. FINAL line of the whole flow
   (anterograde): "Show up Monday. That's the entire secret. Everything
   else is arithmetic."
Accept: fresh account runs the full flow → lands stage 5, archetype +
reward picks + scroll persisted; refresh mid-flow resumes; reduced-motion
path readable.

### PHASE 2 — WORLD MAP + MYTH BOSSES + SCROLLS
New: `WorldMap.jsx`, `StageNode.jsx`, `MythBossFight.jsx`, `WisdomScroll.jsx`,
`ZoneGate.jsx`. Also create `ALPHA-IMAGES-NEEDED.md` (repo root) listing zone
art slugs for Codex/Higgsfield (`public/assets/alpha/...`: 4 zone banners,
11 boss portraits, map background) — CSS-only fallbacks must look finished.
- **WorldMap**: vertical serpentine path (CSS, alternating left/right nodes,
  connecting line with zone-accent gradient segments). Node states from
  alpha_state: done (✓ ember), here (pulsing accent ring), locked (dim bolt).
  Zone stages get accent glows + zone banner strip. Tapping a zone stage
  opens its `ZoneGate`.
- **ZoneGate**: gate card in zone accent — scroll unlock (once), boss
  challenges listed (`bossesForPhase`), enter-zone CTA (Phase 3+ wires it;
  until then "the zone opens soon").
- **MythBossFight** choreography: boss card SLAMS in (iwStampIn + sfxBossHit)
  — name + myth line in big type. Step 1: three cards shown (truth + decoy +
  the myth restated) — user picks what's TRUE. Wrong pick: card cracks,
  Mentor hints, retry (no fail state). Right pick: step 2 "CRUSH IT" —
  hold-to-crush the myth card (press-and-hold 900ms, cracks spreading via
  clip-path/opacity layers) → shatter (CSS shards + sfxBossDown + vibrate)
  → truth card stamped into the Busted Myths codex + XP 30 + `boss_defeat`.
  Bosses 1–3 gate PRIME's stage transitions (fight them from the gate).
- **WisdomScroll**: unfurl animation (scaleY from top, gold foil edge) +
  scroll shelf view (collected vs silhouette slots) reachable from the map.
Accept: map reflects state; boss winnable + persisted; codex + shelf views;
gap: no dead ends when art files are absent.

### PHASE 3 — PRIME PLAYABLE (the first real training month)
New: `AlphaZone.jsx`, `ScheduleGrid.jsx`, `AlphaSession.jsx`, `CircuitTimer.jsx`,
`EatingCard.jsx`, `FastClock.jsx`, `HormonePanel.jsx`, `CarbRampMeter.jsx`.
- **AlphaZone (hub)**: zone header (accent, week N of 4), TODAY card from
  `daySlot` (workout name + start CTA / rest / cardio), `EatingCard`,
  `FastClock`, `CarbRampMeter`, `HormonePanel`, `ScheduleGrid` (4-week
  rotation grid, done/today/future cells, nutrition badges cheat/fast).
- **AlphaSession**: builds play state from the workout def. Reuse LiveSession
  patterns (steppers, set chips, PR detect via `useWorkout().prs`) but
  block-aware:
  - `circuit` blocks: exercise carousel per round, `CircuitTimer` runs TWO
    nested clocks — exercise rest (≤30s/≤20s auto-starts after each logged
    set) and round rest (3min/90s between rounds) with distinct ring colors.
  - `straight`: sets × one lift, standard rest. `totalreps`: accumulator UI
    ("14 / 20 — as many sets as it takes").
  - AMRAP reps: stepper starts at 0, no target cap.
  - After each block: `assessBlock(totalReps)` verdict card ("the forge
    speaks") + store verdict in session meta; next session pre-fills weight
    via `suggestWeight` (pay XP 5 when honored).
  - Finish → existing `addSession` w/ meta + `RackedOverlay`; hormone action
    `train_mrt`; day marked in ScheduleGrid.
- **FastClock**: conic ring (reuse `iw-rest-ring` pattern) on `clockStatus`;
  window-open-hour picker (flags.windowOpenHour); "fast complete" ritual
  button when a fast elapses → `fast_complete` event + dials + XP 5;
  fasting streak flame.
- **HormonePanel**: the 6 dials + one-tap sleep log (hours chips 5/6/7/8+)
  → `sleep_log` + `applyAction` + daily `decayDays` on hub mount (store
  lastDecayISO in flags).
- **CarbRampMeter**: locked tier bar 30→75→100g; unlock animation on week-up.
- **Progression**: completing the week's scheduled workouts → `week_complete`
  (+40 XP, week++); week 4 done → PRIME `phase_complete` (+100), stage 6,
  ADAPT gate opens (boss-gated per Phase 2).
Accept: full guided PRIME workout E2E lands in The Log w/ meta; macros match
engine for today; dials respond; week rolls over correctly on a fresh Monday.

### PHASE 4 — ADAPT (density + the Cheat Day boss)
New: `engine/densityEngine.js`, `DensityMeter.jsx`, `CheatDayEvent.jsx`.
- **densityEngine**: block session = `{minutes, exercises, weight}` →
  work capacity = total volume ÷ elapsed min; `beatsPrevious(current, prev)`;
  bump rules from def `weightBumpPct` ([5,10] A / [3,5] B / hold C).
- **Density block play**: block countdown clock (5/6/4 min) + alternating
  exercise turns (4–6 reps each, log per turn with one tap using preset
  reps); live `DensityMeter` (volume climbing vs. ghost line of round 1 /
  last session); between repeats: weight-bump prompt card ("load +5–10%,
  then do it again"); beat-your-circuit → PR-style flash + XP.
- **CheatDayEvent**: Sunday event card on the hub (from `daySlot.nutrition
  .cheat`). Flow: the 4 `DIET_DEBUFFS` meters shown drained → "FEAST" ritual
  (zero-guilt copy, 3 rules: no gorging to sickness / same-day food only /
  zero guilt) → meters refill animation + `cheat_day` event + `applyAction`
  + `lastRefuelISO` + XP 15 → schedules the Feast/Fast pairing: Monday
  full-fast card (32–40h framing) with the ALWAYS-VISIBLE beginner fallback
  ("a small 400-cal dinner still counts — take it if you need it").
- **Cardio day card**: simple timed card (30–40 min zone-2 framing, log it,
  `train_heavy`-none — use a `cardio` event) — recovery voice, not punishment.
- Myth bosses 4–7 gate ADAPT stages. `refuelMeter` drives a leptin gauge on
  the hub.
Accept: density workout w/ live meter + bump prompts; cheat event fires by
schedule, resets debuff meters, logs event; fast-day card shows the fallback.

### PHASE 5 — SURGE (tempo + lactic acid)
New: `TempoTimer.jsx`, `SegmentTracker.jsx`.
- **SegmentTracker**: A/B/C/D 4-act progress bar pinned atop the session
  (bookend → grind → grind → closer), violet accent.
- **A bookend**: one 20-rep straight set, weight from PR history suggestion.
  **D closer**: 25 reps at 20–30% of A's weight (compute + display).
- **TempoTimer**: cadence ring for `tempo` arrays (4-0-1 / 3-0-1 / 1-0-4):
  ring contracts on the down-count (low `sfxTempoTick` each second), snaps
  on the up (high tick). Runs while a set is active; optional tap-timing
  game (tap on each beat, ≥80% on-beat = "on tempo" bonus XP 5) — must be
  skippable; logging stays one tap.
- Alternating calories in EatingCard: first ABOVE-maintenance days —
  celebrate ("today you eat like a builder: +400"), deficit rest days framed
  as the other half of the same engine. Hormone action `train_tempo`.
- Myth bosses 8–11 gate SURGE; stage 8 = The Ordeal (scroll `ordeal` unlocks
  entering week 3).
Accept: tempo block playable w/ cadence cues + working tick sfx; surplus/
deficit macros correct per day type; segment bar tracks A→D.

### PHASE 6 — COMPLETE + ENDGAME (the dopamine pass)
New: `engine/ladder.js`, `BenchmarkLadder.jsx`, `TraitTree.jsx`, `Apotheosis.jsx`.
- **COMPLETE week**: 4 style day-cards (The Furnace / The Engine / The Forge /
  The Summit) reusing the play modes from phases 3–5 + a strength mode
  (`ladder: true` blocks: 5×5 heavy, rest 3min). Week-seed rotation from the
  `rotation` table so consecutive weeks differ. Weekly epic cheat stays.
- **ladder.js**: for each big lift with PR history → rungs: sensible plate
  jumps from first PR to next milestone (e.g. 135→185→225→250→275→300;
  generate: start at floor(firstPR/45)*45, steps 45/25/25 pattern, always
  include the next unhit rung). `rungUp(prs, lift)` detection on new PRs.
- **BenchmarkLadder**: vertical rung bar per lift (gold accent), current
  position, next rung highlighted; rung-up celebration (sfxRungUp + chalk
  burst + XP 25) fired from the existing PR flow when a new PR crosses a rung.
- **TraitTree**: 7 `TRAITS` as light/shadow pair cards; each levels 1–5 from
  behavior streaks per its `levelRule` (wire the cheap ones: full-rest-
  honored, scheduled-days-complete, honest-miss-logged, load-lowered-when-
  told; leave hooks for Zone-linked ones). Leveling = shadow name visibly
  fades, light name brightens.
- **Apotheosis**: triggered on COMPLETE `phase_complete`. Sequence: black →
  the campaign ledger rises (real numbers: sessions, total lbs moved, PRs,
  bosses busted, scrolls, fasting hours, weeks) → the line: "If you can
  change this, you can change anything." → Return with the Elixir (scroll
  `elixir`) → torch-forward beat (invite a squadmate — link to Zone) →
  XP 200. Afterword screen "I, ALPHA" = the character sheet reborn with
  final stats + trait constellation. Then: "the Iron stays open" — campaign
  flips to endless COMPLETE rotation w/ ladders.
- Global polish pass: verify every §4 XP moment has sfx + animation; streak
  flames on cover/hub; check all celebration timings against reduced motion.
Accept: full campaign loop closes on real data; finale plays; ladder rungs
fire from PRs; traits level from behaviors.

### PHASE S — THE STOCKPILE (Sunday meal prep · Fill Your Fridge · photo magnets)
Jon (2026-07-07): "Sunday meal prep section that helps you with groceries…
FILL YOUR FRIDGE game animation… I love doing meal prep on Sunday and we
also have a Sunday check-in anyways it can link to… for each day you have
to take a picture and upload it into your fridge for accountability."
Standalone — buildable right after Phase 0. Data+engine EXIST
(`data/foods.js`, `engine/mealPrep.js`). New: `StockpilePage.jsx`,
`FillYourFridge.jsx`, one migration (next free number) for the storage
bucket, sfx `sfxFridgeSlam`/`sfxMagnetClack`.
- **StockpilePage** (entry: card on AlphaZone hub + Sunday emphasis): the
  week's ledger (`weekTargets` — calories/protein/carbs/fat + training-day
  count), the grocery plan (`groceryPlan.lines` as 4 category cards: qty,
  why, pick-chips to check off), the 7 `PREP_STEPS` as a checklist, and the
  `cheatNote` warning when cheat Sunday is on the board ("buy NOTHING for
  it in advance — same-day only").
- **FillYourFridge** — THE GAME: a big CSS steel fridge (gunmetal gradients,
  chrome handle, `iw-` plate aesthetic), doors open showing 4 labeled
  shelves (PROTEINS / THE GREEN WALL / FUEL / FATS). Every checked grocery
  line and prep step flies an item chip onto its shelf (WorkoutMode flyer
  pattern: animate from the tapped chip's rect to the shelf slot).
  `fridgeProgress` drives a handle-side gauge. At 100%: doors SLAM
  (sfxFridgeSlam + vibrate), "STOCKED" chalk stamp + burst, XP 25,
  `fridge_stocked` event (payload: targets), week badge on a trophy shelf.
  Checks persist in `flags.fridgeChecks[weekKey]` (weekKey = ISO Monday).
- **Photo magnets (daily accountability)**: the CLOSED fridge door shows 7
  magnet slots (Mon–Sun). Each day: tap today's magnet → `<input type=file
  accept=image/* capture=environment>` → client-side resize (canvas,
  ≤1280px, jpeg ~0.8) → upload to Supabase Storage bucket `fridge-photos`
  at `userId/yyyy-mm-dd.jpg` → polaroid drop-in under the magnet
  (sfxMagnetClack) + `fridge_photo` event + XP 5. Full week = "SEVEN SEALS"
  (XP 30 + flame on the handle). Photos PRIVATE (owner-only storage RLS);
  optional "show my squad" button posts through the EXISTING Zone flow
  (which already carries the UGC filter/report pipeline) — never auto-share.
  Offline: stash the data-URL in the cache and retry upload on next mount.
  Migration: create bucket + storage policies (folder-name = auth.uid()
  pattern like `005_zone_storage.sql`).
- **Sunday Review link**: add a compact Stockpile card to
  `src/components/weekly/WeeklyReviewPage.jsx` (SHARED file — concurrency
  law §3.7 applies): "Fridge stocked for the week?" → deep-opens THE IRON →
  ALPHA → Stockpile (wire via the existing onOpenWorkout prop chain +
  a `window` custom event or an initialView prop on WorkoutMode — keep it
  simple and additive). A stocked week shows ✓ in the review.
Accept: grocery plan matches engine for active phase/week; fridge fills
item-by-item and slams at 100%; photo pins to today's magnet, survives
reload, uploads when online; Sunday Review card round-trips; streaks count.

---

## 6 · VERIFICATION HARNESS (run every phase)

1. `npm run build` green (PowerShell; takes ~1–2 min).
2. **Engine smoke** — write `<scratchpad>/alpha-engine-smoke.mjs` importing
   from `file:///c:/Users/howki/OneDrive/Desktop/Milestone Mapping App/src/
   components/workout/alpha/...` and assert at minimum: Steve 200lb/20% →
   LBM 160, maintenance 2,240; PRIME wk1 workout day 1,940/128p/30c/145f(±1);
   COMPLETE workout 2,540/240/160/104(±1); assessBlock 13→lower/25→raise;
   `daySlot("prime",1,0).workoutId === "prime-w1"`; ADAPT wk2 Mon = cardio +
   fullFast. (Phase 0's version passed 54/54.)
3. **Browser walkthrough via raw CDP** (Playwright MCP is unreliable here;
   Node 24 has built-in WebSocket):
   - `Start-Process "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
     -ArgumentList '--remote-debugging-port=9222',
     "--user-data-dir=$env:TEMP\claude-cdp-profile", '--no-first-run',
     '--headless=new', 'about:blank'`
   - `npm run preview` in background (serves `dist/` on :4173 — REBUILD FIRST).
   - CDP: new tab `PUT /json/new`, `Page.enable`+`Runtime.enable`, emulate
     430×932 mobile, `Page.navigate` → :4173. Skip boot:
     `sessionStorage.setItem("milestone_mapping_boot_shown","1")`. Login if
     the email input exists: coachowkins@gmail.com / demodemo (set React
     inputs via native value setter + `input` event, click SIGN IN).
   - Path into Alpha: click `.app-topbar__workout` → wait ~2s → click
     `.iw-cover` → skip creed if `.iw-cr-card` → click the nav button whose
     text includes "alpha". Reset campaign for a fresh run:
     `localStorage.removeItem("alpha_mode_cache_v1")` before entering.
   - `Page.captureScreenshot` each new screen → Read the PNGs and LOOK at
     them. The mode scrolls inside `.iwm-overlay` (scroll that element, not
     window).
   - Cleanup: kill only chrome processes whose command line matches
     `claude-cdp-profile`; TaskStop the preview.
4. Update §0's STATE table + the memory index (`project_alpha_mode.md` +
   MEMORY.md line — re-read MEMORY.md right before editing; the other
   session races on it).
5. Do NOT commit or deploy unless Jon asks (deploy = `npm run build` →
   `netlify deploy --prod --dir=dist`, CLI only).

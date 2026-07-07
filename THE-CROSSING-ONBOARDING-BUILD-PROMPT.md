# THE CROSSING — Master Build Prompt
## The Ultimate Transformational Onboarding for Milestone Mapping

> **HOW TO USE:** Paste this entire file as the first message of a fresh Claude Code session in this repo.
> It contains everything: the app research, the brand system, the state architecture, the screen-by-screen
> design, all copy direction, and a 5-phase build plan with verification. Execute the phases in order.
> Do not re-research what is documented here — it was audited by three parallel agents on 2026-07-06.

---

# THE MISSION

Build **The Crossing** — a full-screen cinematic onboarding takeover that owns a new user's first five
minutes. Today a fresh account signs up, watches the 4.7s boot phoenix, and lands **cold on the Command
Center**. No segmentation, no emotional hook, no first win, no commitment moment. That is the gap.

The design is built on the proven onboarding masterclass playbook (Duolingo / CalAI / Ladder deconstruction).
**Every screen must serve one of the Six Jobs: Brand · Segmentation · Trust · Activation · Monetization ·
Retention.** This app has no paywall, so the Monetization job becomes **COMMITMENT**: the paywall-equivalent
is **The Vow** — a sealed identity declaration. The conversion event is not a purchase; it is a person
pressing their thumb on a flame until it seals.

Masterclass laws that govern this build:
- **Fast value, fast commitment.** First value moment (the personalized Map reveal) before the big ask (the Vow). First win BEFORE the user ever sees the dashboard.
- **Micro-commitments stack.** Each tap (goals → wall → cost → path) is a small yes that earns the big yes.
- **Objection harvesting + emotional mirroring.** Ask what broke them before, then immediately mirror it back with the app's specific counter-weapon. Their own words get echoed later (answer-fill).
- **Personalization anchor = the "wow".** The archetype choice (Ladder team-select pattern) makes the plan feel built, not templated.
- **Retention seeding before deep usage.** Day-1 checklist (Zeigarnik effect) persists on the dashboard until done.
- **Remorse mitigation.** After the Vow, immediate celebration + concrete next steps — never a dead end.
- **Every screen earns its slot.** If a screen serves no Job, it dies.

---

# WHAT THIS APP IS (audited, do not re-derive)

**Milestone Mapping** — "Our Map, Your Transformation." A neon-cyberpunk, heavily gamified
personal-transformation platform (React 18 + Vite + Supabase PWA, deps: react, react-dom,
@supabase/supabase-js only). Built by Jon Howkins (sales/transformation coach) for entrepreneurs and
door-to-door/phone salespeople escaping the 9-5. Mythology: **burn → ash → rise. Phoenix.**
"FROM THE ASHES / RISES THE BUILDER."

- **Core loop:** projects → milestones → weekly actions → daily Top-5 → proof → Rewards Vault.
- **Emotional arsenal:** Shadow Work "The Descent" (5 gated depths), Anger Gym (5 games incl. The Door),
  Ride the Wave (90s anxiety SOS), Anxiety SOS overlay.
- **Identity work:** Identity Builder, Vision Board + meditation, 5 Shifts training, B.L.A.Z.E.
- **Social:** The Accountability Zone — declare mission, post proof, The Witness (AI-toned check-ins),
  fire/ash/Rise Again streaks, squads, partners, Squad Arena (9 games incl. Full Court).
- **Narrative:** 24-chapter Inner Alchemist quest (cyberpunk Alchemist retelling, one coaching exercise per
  chapter) + MapQuest City (16 districts = real features, walkable world, hometown send-off story for new users).
- **Methodology:** 8-step Milestone Mastery Formula; doctrine is identity-first and shame-free.
  Key line: *"The goal is the bait. The transformation is the catch. The story is theirs."*

**Copy laws (inherited from the Witness doctrine — NON-NEGOTIABLE):**
- Never shame. NEVER ask "why didn't you". A lapse is ash, and ash has one door: **Rise Again**.
- Plain human voice. No corporate speak, no therapy-speak, no hype-bro speak.
- Identity language over goal language: "Goals change what you chase. Identity changes what you keep."
- "Receipts" is house vocabulary for proof. "Reps" for repeated action.

---

# BRAND SYSTEM (audited, exact — do not deviate)

**Stack law:** plain CSS files + inline style objects. **NO Tailwind, NO framer-motion, NO styled-components.**
All motion = CSS keyframes + small React state machines.

**Tokens** (`src/styles/globals.css` `:root`): *"Black foundation. Neon accents. No white panels, ever."*
- Backgrounds: `--bg: #050007`, `--panel: #0a020f`, `--card: #0d0514`, `--card-hover: #140820`
- Neons: `--brand-cyan: #00F0FF` · `--brand-magenta: #D11EFF` · `--brand-pink: #FF3EDB` ·
  `--brand-phoenix: #7B2CFF` · `--brand-green: #00FFBF` (mint/success) · gold `#FFD166` / `--brand-amber: #FFB000`
  (achievement beats) · `--brand-red: #FF3B5C` (danger only)
- Signature gradient: `--grad-primary: linear-gradient(135deg, #7B2CFF, #D11EFF 30%, #FF3EDB 65%, #00F0FF)`
  — primary buttons (dark `#05000A` text on it) and gradient-clipped display text.
- Text: `--text-main: #F2F0F4`, muted/soft = same at .88/.65 alpha.
- **The core aesthetic rule:** borders are neon at LOW alpha (0.14–0.28) + soft glow box-shadows on every
  surface. Hover = raise border alpha + widen glow. Never lighten a background.
- Gradient borders = the house double-background technique (`padding-box`/`border-box`), see
  `.cmdeck-btn--map` in globals.css (~line 1097).

**Type:** Sora (display, 700–900, headings/buttons, `letter-spacing: -0.01em`) + Manrope (body, 14px base).
**Monospace is BANNED** app-wide. Uppercase "kicker" labels: 9–12px, 700–800, `letter-spacing 0.04–0.22em`,
accent-colored. The map-quest cinematic kit has a storybook font exception (Fraunces/Inter Tight) — The
Crossing is APP-LEVEL: **Sora/Manrope only.**

**Motion:** `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`, transitions 120–300ms. Animation bank in
`src/styles/animations.css` (`fade-in`, `slide-up`, `scale-pop`, `glow-pulse`, `orb-float`, `confetti-lite`,
`xp-float`…). **Every animation needs a `prefers-reduced-motion: reduce` fallback** and must also respect
`settings.reducedMotion` (mirrored to `document.documentElement.dataset.reducedMotion`). PERF LAW: no
mouse-follow effects; mobile-first (680px max column, `--safe-top/--safe-bottom`, `--bottom-nav-h: 58px`).

**Feature-scoped theming pattern:** scope everything under `.crossing-root` with local custom properties
derived from the global palette (copy the `.zone-root` + `[data-fire]` tinting pattern in `src/styles/zone.css`).
The chosen archetype re-points `--cx-accent` / `--cx-glow` for the rest of the flow.

**Audio:** `src/lib/sfx.js` — WebAudio synth engine, fails silently, shared compressor bus, respects
localStorage `zone_sfx_muted`. Use its building blocks (`subDrop` pitch-fall punch, `crack` noise burst,
gain envelopes) for the seal moment. Voice: structure a manifest `src/data/crossingVoiceLines.js` +
`playVoiceLine`-style loader pointing at `/audio/onboarding/<id>.mp3` — **files do NOT exist yet** (ElevenLabs
bake awaits Jon's audition approval); the loader must silently no-op on missing files (`onerror = () => {}`),
exactly like `playVoiceLine` in sfx.js (~line 909).

**Cinematic engine reference:** `src/components/map-quest/kit.jsx` (422 lines) — the canonical pattern:
- Chapter = phase state machine: `const [phase, setPhase] = useState("intro")`, each phase returns a
  different full-screen tree.
- Intro = data-driven shot arrays: `{ id, bg, backdrop: 'embers'|'starfield', cast, kicker, lines: [...],
  speaker, cta }` rendered by a `<Cinematic shots onDone>` that advances on tap.
- `useTyped(lines)` — reveals lines one-by-one (~1500ms cadence, 450ms first), last line gets speaker color,
  prior lines dim; Continue appears when done.
- SVG sprites with `drop-shadow(0 0 Npx …)` glow + idle keyframe loops; `Embers`/`Starfield` = absolutely
  positioned divs with staggered `animation-delay`.
- Answer-fill: user's typed words echoed back later inside colored `<span>`s.
- Build The Crossing's own self-contained mini-kit in the onboarding folder (do not import kit.jsx — it
  self-injects the banned storybook fonts).

**Assets:** `public/assets/onboarding/` (create), kebab-case `<context>-<name>.png`. Reuse existing art where
possible: phoenix/boot art in `public/assets/boot/`, brand in `public/assets/brand/`, zone action cards in
`public/assets/zone/action-cards/`. Missing art must never break layout (background gradients as fallback).
Dark-bg PNG blend trick: `mix-blend-mode: screen`.

---

# STATE ARCHITECTURE (audited, exact)

- **No router.** Navigation = `currentPage` string in `AppContent` (`src/App.jsx:43`) + `renderPage()` switch.
  Flow: `main.jsx` → `App` → `<AuthGate>` (render-prop: `(userId, userEmail, signOut)`) → `<AppDataProvider>`
  → `<AppContent>`.
- **Mount precedent:** `BootSequence` — `if (booting) return <BootSequence onDone={finishBoot} />;`
  (`App.jsx:228-230`), a conditional early return that pre-empts `<AppShell>`. The Crossing mounts the same
  way, immediately AFTER the boot return (boot = brand cold-open, then Crossing takes over).
- **Server new-user signal:** `createProfileIfMissing(userId, email)` in `src/lib/profileService.js` — a
  missing `profiles` row is "first login ever". It currently returns the profile data only; extend it to
  return `{ profile, created }` so the caller knows. Called from `src/hooks/useAppData.js` (~lines 134-146).
  **Its cloud pull is async** — `settings` may be localStorage defaults on first render.
- **Cloud snapshot:** whole app state lives in the `user_data` JSONB blob (`{ projects, milestones, dailyLogs,
  weeklyReviews, visionBoard, identity, settings, achievements, xp }`), pulled once on mount, debounce-saved 3s.
- **XP/achievements:** `addXP(amount, label)` + `unlockAchievement(id)` on the `useAppData()` context
  (`useAppData.js:186-231`). Definitions: `src/lib/gamification.js` (`XP_VALUES`, 7 ranks) and
  `src/lib/achievements.js` (~29 entries of `{id, title, description, icon}`). localStorage keys
  `milestone_mapping_xp` / `milestone_mapping_achievements` via `src/lib/constants.js` STORAGE_KEYS.
- **The gating pattern to clone** (`src/components/city/journeyStore.js` + `useJourney.js`):
  pure-localStorage module · `has*()` existence check that returns `true` (= existing user, lock nothing)
  when storage is unavailable · `runMigrationOnce({ existingUser })` one-time classification ·
  classification runs **synchronously inside `useState(() => …)`** so a new user never flashes the wrong
  world · idempotent unlock/record functions returning `{ firstEver }` so XP can never double-fire.
- **Legacy localStorage signals** (any present → existing user): `milestone_mapping_xp` > 0,
  `mapquest_journey_v1`, `shadow_descent_v1`, `shifts_state`, `milestone-quest:mode-v1`,
  `mapquest_city_v1`, non-empty `milestone_mapping_achievements`.
- **Day-One mirror hook:** the map-quest store (`src/components/map-quest/useMapQuestState.js`, key
  `milestone-quest:mode-v1`) has a `dayOne: {}` slot — the Alchemist Vault finale mirrors the user's Day-One
  self. The Crossing's answers are the PERFECT feed for it.
- **Existing sub-onboardings (respect, never duplicate):** Zone join = `ZoneOnboarding` (no `zone_members`
  row → username claim + rules, `ZonePage.jsx:71`); City = hometown journey takeover; Field Journal =
  `journal_state.wizard_seen` (migration 011).

**⚠️ CONCURRENT-SESSION LAW:** run `git status` FIRST. As of 2026-07-06 these files carry in-flight Field
Journal work and are OFF-LIMITS: `MapQuestMap.jsx`, `ZonePage.jsx`, `ZoneHome.jsx`, `Witness.jsx`,
`zone.css`, `src/lib/journalService.js`, `supabase/migrations/011_field_journal.sql`,
`the-field-journal.jsx`. Jon may have a second live session on this repo — check mtimes; if another writer
is active in a file you need, stand down and note it.

---

# THE FLOW — 9 SCREENS, EACH MAPPED TO ITS JOB

Full-screen takeover, ~4–6 minutes, phase state machine. Working name **The Crossing** (Jon may rename).
Every phase: fade transitions, typed dialogue where narrative, instant response where interactive.
Progress = thin flame-gradient bar at top (fills phase by phase). A quiet "skip the crossing" ghost link
lives on screens 1–5 (goes to a confirm: "Cross later — the map will wait." → marks completed via:"skipped",
still awards nothing; skipping must be possible but feel like leaving a story mid-scene).

| # | Phase key | Job | Spec |
|---|-----------|-----|------|
| 1 | `ignition` | **Brand & Belief** | Cinematic open, embers backdrop, typed lines. Belief reframe: most apps hand you tools and wish you luck — this is a crossing; on the other side is a version of you that keeps promises. Ends on the phoenix motif. 3–4 shots max, every shot tap-advanceable. |
| 2 | `mirror` | **Segmentation + micro-commitment** | "What are you building toward?" — multi-select neon chips: Escape the 9-5 · Build my business · Master sales · Master my mind (anger/anxiety) · Discipline & habits · Find my purpose. Min 1 to continue. Selections weight the plan + spotlight arenas. |
| 3 | `wall` | **Objection harvest + emotional mirror** | "What's burned it down before?" — single-select: I start strong, then vanish · Nobody holds me to it · My head gets in the way · I don't actually know what I want · I've tried everything. On select, the screen ANSWERS them immediately with the specific counter-weapon (vanish → the Witness never flakes / streaks turn to ash but ash has one door; nobody holds me → the Zone sees every rep; my head → Anger Gym + Ride the Wave; don't know what I want → the Alchemist quest digs it out; tried everything → you never tried it witnessed). Their choice text is STORED for echo. |
| 4 | `cost` | **Urgency calibration** | One private typed line: "12 months from now, if nothing changes — what does that look like?" Framing: "Nobody sees this but you. And the you that comes back to read it." Optional-feeling but required (min ~3 chars). Stored for the Day-One mirror. |
| 5 | `path` | **Trust + personalization anchor (the wow)** | Ladder-style archetype select, 4 premium cards: **THE BUILDER** (execution — milestones, Top-5, Rewards) · **THE CLOSER** (sales — Full Court, Objection Slam, Crystal Shop arc) · **THE PHOENIX** (rise — Shadow Descent, Anger Gym, Wave) · **THE SEEKER** (purpose — Alchemist quest, Identity, Vision). Card = art/emblem + "This path trains…" + which arenas open first. Choice re-points `--cx-accent` for the rest of the flow (Builder=cyan, Closer=gold, Phoenix=pink/red ember, Seeker=phoenix purple). |
| 6 | `map` | **First value moment** | The personalized plan reveal — "YOUR FIRST 7 DAYS", rendered as a neon route (nodes lighting up in sequence, CalAI-precision feel). Built from goals+wall+path. MUST echo their own words: *"You said: '<their wall choice>'. Here's the counter."* Shows: Day 1 = first win (next screen), the daily ritual cadence (morning stand → Top-5 → proof), their path's first arena, the Zone. Concrete days, concrete reps — no vague promises. |
| 7 | `vow` | **COMMITMENT (the conversion event)** | Identity declaration. Prefilled per archetype, editable (e.g. Builder: "I am the kind of person who finishes what I start." Phoenix: "I've burned before. This time I rise."). **Press-and-hold to seal**: hold 2.0s → flame ring fills around a seal emblem → `subDrop` + `crack` via sfx.js → gold flash → sealed stamp with date. Releasing early lets the ring decay — no penalty, no shame copy. On seal: persist `{ vow, sealedAt }`, `addXP(XP_VALUES.crossingComplete, "The Crossing")`, `unlockAchievement("day_one_vow")`. Reduced-motion: hold becomes a long-press with a simple progress arc, flash becomes a fade. |
| 8 | `firstWin` | **Activation** | Declare your first REAL mission, inside the flow: mission name (their words, prompted by path-specific suggestion chips) + first milestone ("what's the first receipt?"). Creates a REAL project + milestone through `useAppData` actions so the app is already personalized when they land. 2 minutes max, two fields, no more. |
| 9 | `torch` | **Retention seeding + remorse mitigation** | Celebration (gradient-text title, `orb-float` emblem, `confetti-lite`, mint/gold) → "THE FIRST 24 HOURS" checklist: ☐ Enter the Zone & claim your @name · ☐ Meet your mentor in the City · ☐ Tomorrow morning: the ritual (AM hint) · ☐ Put the map on your home screen (PWA hint, dismissible). CTA: "ENTER THE MAP". The checklist PERSISTS as a dashboard card until all done or 7 days pass (Zeigarnik). Checklist items deep-link via `onNavigate`. |

**Answer-fill contract:** `wallText` (their wall choice + the counter shown), `cost` (their typed line), and
`vow` are echoed in phase 6/7 and written to the Day-One mirror slot. The Crossing's data makes the whole
app personal — this is the moat.

---

# FILE PLAN

New:
- `src/components/onboarding/onboardingStore.js` — localStorage key `crossing_v1`, cloned from
  journeyStore.js: `hasCrossing()`, `loadCrossing()`, `runMigrationOnce({ existingUser })` (legacy →
  `{ completed: true, via: "legacy" }`), `recordPhase()`, `saveAnswers()`, `sealVow()` (idempotent,
  `{ firstEver }`), `markComplete(via)`. Shape: `{ version: 1, completed, completedAt, via:
  "crossed"|"legacy"|"skipped", phase, answers: { goals[], wall, wallText, cost, path, vow, sealedAt },
  torch: { [itemId]: ISO }, migratedAt }`.
- `src/components/onboarding/useOnboarding.js` — cloned from useJourney.js; classification synchronous in
  `useState(() => …)`; also exposes `refresh()`.
- `src/components/onboarding/TheCrossing.jsx` — the takeover; phase machine; self-contained mini-kit
  (Typed lines hook, Embers layer, shot renderer) with Sora/Manrope only.
- `src/components/onboarding/crossingScript.js` — **ALL copy lives here** (single-source law, like
  `witnessLines.js`): shots, chips, walls + counters, archetypes (incl. accents + arena lists + vow
  prefills), plan templates, torch checklist, skip copy.
- `src/components/onboarding/FirstHoursCard.jsx` — the persistent dashboard checklist card.
- `src/styles/onboarding.css` — scoped `.crossing-root`, `[data-path="builder|closer|phoenix|seeker"]`
  accent re-pointing, all keyframes + reduced-motion fallbacks. Import it wherever the other feature CSS
  files are imported (check how zone.css/globals.css get loaded — likely main.jsx or index).
- `src/data/crossingVoiceLines.js` — voice manifest (ids + line text for the future ElevenLabs bake),
  loader no-ops on missing mp3s.

Modified:
- `src/App.jsx` — after the `booting` return: `if (crossing.active) return <TheCrossing …/>` (needs
  `useOnboarding` + must wait for `useAppData` initial cloud pull — see Phase 1 gate logic).
- `src/lib/profileService.js` — `createProfileIfMissing` returns `{ profile, created }` (update the one
  caller in useAppData.js).
- `src/hooks/useAppData.js` — expose a `cloudReady` (initial pull settled) flag + `profileWasCreated` if not
  already derivable; add `crossing` mirror into the `user_data` snapshot.
- `src/lib/gamification.js` — `XP_VALUES.crossingComplete` (match the magnitude of similar one-time beats).
- `src/lib/achievements.js` — `{ id: "day_one_vow", title: "The Vow", description: "Crossed over. Sealed it
  in flame.", icon: 🔥 or seal }`.
- `src/components/dashboard/CommandCenter.jsx` — mount `FirstHoursCard` (top, below MissionHero) while
  incomplete; spotlight the chosen path's hero card.
- `src/components/settings/SettingsPage.jsx` — "Replay The Crossing" row (resets `phase`, sets a replay flag,
  does NOT wipe answers or re-award XP; `firstEver` guards already make awards idempotent).

**OFF-LIMITS files:** see Concurrent-Session Law above.

---

# THE 5 PHASES

## PHASE 0 — RECON & SAFETY RAILS (do first, ~15 min)
1. `git status` + check mtimes on the off-limits files. If a second session is writing, stand down on
   anything shared and report.
2. Read: `App.jsx`, `useAppData.js`, `profileService.js`, `journeyStore.js` + `useJourney.js`,
   `gamification.js`, `achievements.js`, `constants.js`, `BootSequence.jsx`, `kit.jsx` (patterns only),
   `witnessLines.js` (voice calibration), `ZoneOnboarding.jsx` (tone + structure), `CommandCenter.jsx`,
   `SettingsPage.jsx`, how CSS files get imported.
3. Verify the audited facts above still hold (line numbers may drift). Confirm how `settings` and the
   initial cloud pull expose readiness (find or add the `cloudReady` signal).

## PHASE 1 — FOUNDATION: STORE, DETECTION, MOUNT (the spine)
1. Build `onboardingStore.js` + `useOnboarding.js` (clone the journey pattern exactly — synchronous
   classification, storage-unavailable = existing user, idempotent everything).
2. Legacy detection, layered:
   a. `hasCrossing()` → done. b. Synchronous localStorage legacy signals (list above) → mark legacy.
   c. Neither → HOLD (render nothing new; boot splash covers it) until the initial cloud pull settles;
   then: pre-existing `profiles` row OR non-empty pulled snapshot (projects/xp/achievements) → legacy;
   truly fresh → `active: true`.
3. Extend `createProfileIfMissing` → `{ profile, created }`; thread `cloudReady` out of `useAppData`.
4. Mount in `App.jsx` after the boot return. Add settings replay row. Wire `crossing` into the `user_data`
   snapshot mirror.
5. **Gate check:** a legacy user (Jon, demo, @ash_a/@ember_b) must NEVER see a single frame of The Crossing —
   including on a brand-new device (that's what the cloud-pull hold is for).

## PHASE 2 — THE SCRIPT (copy IS the product)
Write `crossingScript.js` COMPLETE before any UI: every shot, chip, wall counter, archetype card, plan
template (plan = f(goals, wall, path) — a small composer function, not 4 hardcoded blobs), vow prefills,
torch items, skip copy. Calibrate voice against `witnessLines.js` and the hometown beats. Apply the copy
laws. Also write `crossingVoiceLines.js` ids/text now so the future bake is a drop-in. Read it all back
out loud (figuratively) — if a line sounds like an app wrote it, rewrite it.

## PHASE 3 — THE CINEMATIC (phases 1–7)
1. `onboarding.css` first: `.crossing-root` scope, archetype accent re-pointing, keyframes (ember drift,
   ring fill, seal flash, node pulse for the map route), ALL with reduced-motion fallbacks, mobile-first.
2. `TheCrossing.jsx`: phase machine; mini-kit (useTyped ~1500ms cadence, Embers, shot renderer);
   phases `ignition → mirror → wall → cost → path → map → vow`.
3. The two showpieces get the polish budget:
   - **The Map reveal** (phase 6): route nodes light in sequence, their words echoed in accent spans.
   - **The Seal** (phase 7): press-and-hold 2s, ring fill, sfx.js `subDrop`+`crack`, gold flash, dated stamp.
4. sfx: subtle per-tap ticks, chip-select blips, phase-transition whooshes — all WebAudio, all silent-fail,
   all respecting mute.

## PHASE 4 — ACTIVATION & RETENTION (phases 8–9 + handoffs)
1. `firstWin`: two-field mission declaration → REAL project + milestone via `useAppData` actions
   (path-specific suggestion chips from the script).
2. `torch`: celebration + checklist; persist checklist state in the store.
3. `FirstHoursCard.jsx` on the Command Center (deep-links via `onNavigate`; auto-checks items it can detect —
   e.g. zone membership, city visit; disappears when done or after 7 days).
4. Data handoffs: write `{ wallText, cost, vow, sealedAt }` into the map-quest `dayOne` slot (via
   `useMapQuestState` helpers — additive, never clobber existing keys); seed Identity Builder power-statement
   DRAFT with the vow (never overwrite user content); store `path` for the dashboard spotlight.
5. XP + achievement on seal (idempotent via `firstEver`).

## PHASE 5 — VERIFICATION (nothing ships unverified)
1. `npm run build` — clean.
2. Playwright MCP (headless Chrome on :9222; preview serves `dist` on :4173 — REBUILD FIRST):
   - **New user:** fresh localStorage + fresh test account → boot → full Crossing → seal → first mission →
     torch → dashboard shows FirstHoursCard + the created project exists. Screenshot every phase.
   - **Legacy user:** demo login (coachowkins@gmail.com / demodemo) → straight to Command Center, ZERO flash.
   - **New device sim:** legacy account + cleared localStorage → cloud-pull hold → classified legacy → no Crossing.
   - **Skip path:** skip at phase 3 → confirm → lands on dashboard, no XP, replay available in Settings.
   - **Reduced motion** on → flow completes, seal works. **Mobile viewport** 390×844 → no horizontal scroll,
     safe areas respected.
   - Verify `crossing_v1`, `milestone-quest:mode-v1` `dayOne`, XP/achievement, Identity draft.
3. Fix everything found. Re-run. Commit with a clear message. **NO deploy** unless Jon says so
   (Netlify CLI only — git push does not deploy).

# DEFINITION OF DONE
☐ Fresh account: boot → Crossing → sealed vow → real first mission → torch → dashboard card.
☐ Legacy/demo accounts and new-device legacy: never see a frame of it.
☐ Every screen serves its Job; every line passes the copy laws; zero banned fonts; palette-only colors.
☐ Reduced-motion + mobile verified. sfx respects mute. Missing audio/art never breaks anything.
☐ Answers feed dayOne mirror + Identity draft. XP/achievement fire exactly once, ever.
☐ Off-limits files untouched. Build clean. E2E screenshots taken. Committed, not deployed.

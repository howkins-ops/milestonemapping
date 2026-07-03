# AAA POLISH — PHASE 2 MASTER BUILD PROMPT

**Paste this whole file as the prompt for the next session(s).** It is self-contained: everything
discovered in Session 11 (2026-07-03) is baked in so you don't need to re-explore the codebase.
Work the phases in order; each phase is independently shippable. If the session runs long, stop at
any phase boundary, build clean, and hand off.

---

## HOW TO WORK (ground rules — read first)

1. **Stack**: React 18 + Vite, plain CSS (no Tailwind), no TS. `npx vite --port 5173` to dev,
   `npx vite build` to verify. Deploy: `netlify deploy --build --prod` (linked site
   `milestonemapping` → https://milestonemapping.netlify.app).
2. **Concurrent sessions**: Jon sometimes runs two Claude sessions on this repo at once. BEFORE
   editing anything, run `git status --short` and check `stat -c "%y %n"` mtimes on files you plan
   to touch. If a file changed in the last ~30 min and you didn't do it, another session owns it —
   stand down from that file and gap-pass around it.
3. **Verify every phase**: `npx vite build` must pass; then grep the dist bundle for your new
   class prefixes to confirm they shipped. There is no browser-automation tool — do static review
   plus build + serve smoke test (`npx vite preview --port 4173`, curl for HTTP 200).
4. **Fonts**: Sora (display) / Manrope (body) ONLY. Monospace/utility fonts are BANNED.
   `--font-mono` is deliberately re-pointed at Manrope — never "fix" that.
5. **Motion rules**:
   - transform/opacity only for anything that loops; never animate layout properties continuously.
   - NO blur filters on moving/clipped layers (causes visible seams — hard-learned rule).
   - Every new animation needs BOTH guards:
     `@media (prefers-reduced-motion: reduce) { ... animation: none; }` and
     `[data-reduced-motion="true"] ... { animation: none; }`
     (a global kill-switch in `src/styles/animations.css:232-246` zeroes durations as backstop).
   - Infinite ambient loops should start from an invisible first frame (opacity 0) so the global
     kill-switch leaves them invisible, not frozen mid-air.
6. **Safe areas**: use the tokens `--safe-top/right/bottom/left` (defined in `globals.css :root`).
   Any new fullscreen overlay must pad all four.
7. **Copy voice**: second person, kind but direct, transformation-flavored ("Open the right valve
   and you keep your power"). Science notes go in the shell `<Science>` primitives — one tight
   paragraph, named mechanism (affect labeling, vagal brake, urge surfing), no citations soup.
8. **Never break the XP contracts** (listed in the cheat sheet below). Games do NOT award XP
   themselves — hubs do.

---

## ARCHITECTURE CHEAT SHEET (verified 2026-07-03 — trust but spot-check)

**Nav model**: single `currentPage` string in `src/App.jsx` (`renderPage()` switch at ~line 151).
Keys: dashboard, daily, milestones, weekly, rewards, essence (=Shadow), vision, identity, stats,
formula, training, settings, science, wellbeing (=Fill Cup), anger, blaze, profile, topfive,
openworld, assets. Three menus: `BottomNav.jsx` PRIMARY_TABS (5 tabs), `AppShell.jsx` GROWTH_MENU
(Paths dropdown), `MoreSheet.jsx` SECTIONS (categorized tiles, redesigned Session 11).

**Shell**: `AppShell.jsx` renders topbar (Paths / SyncStatus / SOS 🌊 / More / Profile) + `<main
class="page">` + BottomNav + MoreSheet. SOS overlay is a *sibling* of AppShell in App.jsx
(`<AnxietySOS open onClose>`). z-layers: header 30, bottom-nav 50, more-overlay 80, wave-overlay
(SOS) 100, celebrations 110+.

**Contracts** (the load-bearing ones):
- Shadow tools: `{ onClose, onFinish }`; call `onFinish(toolName, takeawayString, opts)` where
  opts = `{ xp?, achievements?[], transmuted?, essence?, accent? }`. Wiring lives in
  `ShadowWorkPage.jsx finish()` and duplicated in `AnxietySOS.jsx finish()`.
- Swamp modes: `{ onBack, onComplete }`; `onComplete(takeaway)` → parent calls
  `onFinish("Swamp Valve", takeaway)`. Keep tool name "Swamp Valve" (completions counter keys on it).
- Anger Gym games: `{ onClose, onComplete }`; hub awards XP itself: XP_FORGE=30, XP_STORM=25,
  XP_VALVE=25 (consts in `AngerGymPage.jsx` ~line 22) + `celebrate(...)` toast.
- Shadow XP defaults: `XP_VALUES.shadowToolCompleted=15`, `shadowTransmutation` (gamification.js).
- Wizards: `DailyStandWizard/GratitudeWizard/EveningWizard` take `{ onClose, onComplete }`;
  `TopFiveWizard` takes `{ mode: "plan"|"execute", onDone }`; `CupWizard` `{ onComplete, initialHabits? }`.

**localStorage keys**: `shadow_work_v2` (trail/completions/streak), `anxiety_wave_v1` (wave
sessions), `fill_your_cup` + `fyc_my_cup`, `shifts_state`, forge state via `pressureForgeStore.js`.

**CSS files & prefixes** (import order in main.jsx: globals → animations → themes → training →
game → styles.css; later file wins ties):
- `globals.css` (~6400 lines): tokens, shell, buttons/cards, More tiles (`.more-tile`),
  "AAA FOUNDATION" section (press feedback, `page-enter` stagger, `.ambient-fx`), topbar pass.
- `game.css`: daily page (`.daily-*`, `.ritual-image-card`, sprite `daily-ritual-cards.png` at
  8046-8069) + "DAILY RHYTHM PASS" at end.
- `wave.css`: Ride the Wave (`.wave-*`) + SOS hub (`.sos-*` — hub doors, BoxBreathing orb).
- `swamp-valve.css`: `.sv-*` swamp shell/games; **imported only by SwampValve.jsx and
  AnxietySOS.jsx** — sub-games import no CSS themselves. New top-levels must import it.
- `drain-swamp.css`: `.dts-*` Drain the Swamp scene.
- `anger.css`: `.ag-*` (hub) `.pf-*` (Pressure Forge); `storm/StormCaptain.css`: `.sc-*`;
  `shadow.css`: `.sx-*`; `shadowRealm.css`: NEW from the parallel session — do not fight it.
- Brand: `--brand-cyan #00F0FF, -green #00FFBF, -pink #FF3EDB, -magenta #D11EFF, -purple #7B2CFF,
  -gold #FACC15, -red #FF3B5C`; `--grad-primary`; `--ease-out: cubic-bezier(0.16,1,0.3,1)`.

**The `--p` pattern** (use for any new cinematic scene): drive an entire DOM/CSS scene from ONE
custom property set imperatively (`el.style.setProperty("--p", v)`) in pointer handlers; layers
derive state via `calc()/clamp()`; React state changes only at story-beat thresholds. Reference
implementation: `src/components/shadow/swamp/DrainTheSwamp.jsx` + `src/styles/drain-swamp.css`.

**Safety**: any free-text input in an emotional tool must be scanned with `scanForRisk` and gate to
`<SafetyScreen>` (`src/components/shadow/swamp/safety.jsx`).

**Session 11 already shipped** (don't redo): safe-area fix (`.app-header` top inset — the Dynamic
Island clipping bug), press microinteractions, `page-enter` staggered page transitions, ambient
ember/ray layer in `AnimatedBackground.jsx`, Drain the Swamp (signature swamp mode `drain`),
SOS → 6-door Emotional Reset Hub, Fill Your Cup liquid 2.0 (parallax waves/caustics/splash),
More sheet categorized glass tiles, Daily card tightening, TopBar pass.

---

## PHASE 0 — SYNC & SHIP (do this first, ~15 min)

1. `git status` — reconcile with any parallel session's work (as of 2026-07-03 morning a second
   session was mid-flight on a Shadow Realm redesign: `ShadowWorkPage.jsx`, `shadowRealm.css`,
   `public/assets/shadow/` temple/sanctum/gate art, `styles.css`). If uncommitted work from both
   sessions coexists, build, smoke-test, then commit it all in ONE commit with a body listing both
   workstreams.
2. `npx vite build` → must pass. `npx vite preview` → HTTP 200.
3. Commit message suggestion: `AAA polish pass: safe areas, Drain the Swamp, SOS reset hub, cup liquid 2.0` +
   `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
4. Deploy: `netlify deploy --build --prod`. Confirm live URL loads.
5. Leave a device-test note for Jon (he tests on iPhone):
   - Topbar no longer under the Dynamic Island?
   - Drain the Swamp wheel feel — too heavy/light? Tuning knob: `MAX_STEP` (0.045 rad/event) and
     `TURNS` (6) at the top of `DrainTheSwamp.jsx`.
   - SOS doors all open and return to hub correctly?
   - Fill Your Cup waves visible on iOS Safari?

---

## PHASE 1 — WIZARD POLISH PASS (the big one this session)

Every wizard should feel rewarding: cinematic step transitions, animated progress, a real
completion celebration, and premium microinteractions. Do them one at a time, build between each.

**Shared upgrade checklist (apply to each wizard below):**
- [ ] Step transitions: outgoing step fades/slides out, incoming rises in (keyed container +
      `svFadeUp`-style keyframes). No hard cuts.
- [ ] Progress indicator: animated dots or a gradient progress bar that *fills with a glow sweep*
      when a step completes (see `.sv-dots` / `formula-card` shine for vocabulary).
- [ ] Buttons: primary CTA uses the glow-on-hover + press-scale pattern; disabled states obvious.
- [ ] Completion moment: full-card takeover with staggered reveal — badge/emoji pop
      (`scale-pop`), one-line summary of what the user just committed to, XP line if the wizard
      awards any, then a single continue CTA. Reuse `CelebrationOverlay` via `celebrate()` where
      the app already does; otherwise build an inline `.wiz-complete` moment.
- [ ] Inputs: focus glow (`:focus` box-shadow ring in accent color), placeholder copy in-voice.
- [ ] Reduced-motion guards on everything new.
- [ ] Safe-area: if the wizard is fullscreen/fixed, pad `--safe-top/bottom`.

**The wizards** (paths verified):
1. `src/components/daily/DailyStandWizard.jsx` — morning stand. Completion should feel like
   igniting the day (ember burst, gold accent).
2. `src/components/daily/GratitudeWizard.jsx` — has `soundEnabled` prop; keep. Green/cyan warmth;
   completion = "GRATITUDE LOCKED IN" seal stamp animation (asset already wired in panel).
3. `src/components/daily/TopFiveWizard.jsx` — two modes (plan/execute); plan-mode completion
   loads tomorrow like chambering rounds (5 slots snap-fill one by one).
4. `src/components/daily/EveningWizard.jsx` — night debrief; calm purple/blue, slower easings,
   NO high-energy confetti (it's wind-down). Completion = day sealed, moon motif.
5. `src/components/wellbeing/CupWizard.jsx` — 4 steps (intro→browse→custom→review, `canLock`
   needs ≥3 habits). Completion = "⚡ Lock It In" pours a preview stream into a mini cup.
6. `src/components/milestones/MilestoneWizard.jsx` + `src/components/projects/ProjectWizard.jsx`
   — creation flows; completion should feel like charting new territory on the map (compass/node
   pulse), then route the user straight to the new thing.
7. `src/components/weekly/SundayReviewWizard.jsx` — already the most polished (own CSS, launch
   sequence, `swiz-` prefix). Gap-pass only: verify step transitions + reduced-motion; don't rebuild.

Keep every wizard's props contract EXACTLY as-is (listed in cheat sheet). No data-shape changes.

---

## PHASE 2 — SHADOW WORK HUB REDESIGN (conditional!)

A parallel session was actively building a "Shadow Realm" redesign (`shadowRealm.css`,
`public/assets/shadow/` gate-temple/sanctum-altar/exit-path art, ShadowWorkPage edits).

1. FIRST: read `src/components/shadow/ShadowWorkPage.jsx` and `src/styles/shadowRealm.css` as they
   exist NOW. If the redesign landed: do a **gap-pass only** — reduced-motion guards, safe-area,
   press states, `page-enter` compatibility, and make sure the Drain the Swamp featured card and
   the SOS bar (`.wave-sosbar`) survived the redesign. Then stop this phase.
2. ONLY IF the redesign is absent/abandoned: rebuild the hub as a cinematic "realm select" —
   full-bleed scene header (use the new shadow art), tool cards as glass doors with per-tool
   accents (reuse `.sos-door` vocabulary), trail ("Your trail") as an artifact shelf, Essence
   Gallery entry as a glowing vault door. Contracts unchanged: tools mount flat with
   `{ onClose, onFinish }`, XP flows through `finish()`.

---

## PHASE 3 — TRIGGER POPPER (build the stubbed 4th Anger Gym game)

`AngerGymPage.jsx` GAMES has `popper` with `live:false` ("Coming soon"). Build it and flip to
`live:true`. Contract: `{ onClose, onComplete }`; hub awards XP on complete — add
`XP_POPPER = 20` next to the other consts and an `onPopperComplete` handler mirroring
`onStormComplete` (addXP + celebrate). CSS prefix `.tp-` in `src/styles/anger.css` (or a new
`trigger-popper.css` imported by the game file itself — safer for the import gotcha).

**Design spec — "Trigger Popper: defuse the spark before it lands"** (30–90s, science:
cognitive defusion + stimulus discrimination + response inhibition, go/no-go):
1. **Brief** (~10s): pick today's hot zone (chips: Disrespect, Being ignored, Injustice, Criticism,
   Slow things/people, Custom-free-text → `scanForRisk` gate). One `<Science>` line on defusion:
   "A trigger is a spark, not a verdict — naming it early shrinks the window where it decides for you."
2. **Arcade round (~45s)**: thought-bubbles float up from the bottom of a `.tp-arena`
   (DOM+CSS, transform-only). Two kinds:
   - **Sparks** (hot cognitions tied to the chosen zone: "They did that ON PURPOSE", "Everyone
     walks over you", "Say something they'll regret") — TAP to pop → defusion pop: the bubble
     bursts into text fragments that scatter + a calm reframe chip floats up ("...or they're just
     late", "It's a thought, not a fact").
   - **Keepers** (clean signals: "Breathe first", "It's information", "You choose the response")
     — DO NOT pop; let them reach the top to bank them. Popping a keeper = small screen shake +
     heat +10 (no fail state, just feedback).
   - Difficulty ramps: spawn rate up, sparks get sneakier (mixed wording) — this trains actual
     discrimination, not reflex tapping.
   - Meters via swamp `Meters` idiom or a single "Heat" bar that pops decrease and misses increase.
3. **Cooldown (~15s)**: 3 slow breaths on a shrinking-ember visual (reuse BreathOrb idiom), then
   pick ONE implementation intention: "Next time {trigger} hits, first I will ___" (chips: name it,
   one breath, walk, ask a question).
4. **Seal**: before/after heat, banked keepers as fireflies, takeaway string:
   `Popped {n} hot thoughts on "{zone}" · banked {k} keepers · plan: {intention}` →
   `onComplete(takeaway)`.
- Haptics on pops (`navigator.vibrate(8)` guarded). Reduced-motion: bubbles fade instead of float.
- Performance: cap ~6 live bubbles; recycle nodes; no per-frame React state (use refs + CSS like
  the `--p` pattern where possible).

---

## PHASE 4 — SURFACE THE ANGER EXPERIENCE

The brief demands anger become a major feature; the gym exists but is buried in the Paths menu.
1. **Dashboard card**: add an Anger Gym `dashboard-action-card` (fire/lava accent `--brand-red`→
   `--brand-amber`, molten gradient, ember hover FX) to `CommandCenter`/`DashboardPage`'s action
   grid → `onNavigate("anger")`. Copy: "ANGER GYM — turn pressure into power."
2. **Cross-links**: Anger Gym hub gets a slim SOS-style bar linking to the SOS anger door concept
   ("Flooded RIGHT NOW? → open the Reset Hub") — wire `onOpenSOS` down or dispatch the existing
   topbar SOS. Keep it one line of plumbing; don't refactor App state.
3. **Anger Gym hub polish**: featured-card sheen (reuse `.sv-modecard--featured` vocabulary in
   `.ag-` terms), staggered card entry, press states, level-row glow. Gap-pass, not rebuild.

---

## PHASE 5 — STRESS ZONE SUPPORTING GAMES (cinematic upgrade, keep mechanics)

Mechanics are already science-sound — upgrade the *feel* to match Drain the Swamp:
1. **Belly Boiler** (`swamp/BellyBoiler.jsx`): gas clouds get gradient depth + wobble; safe-vent
   pops burst into proper firefly particles (exists) plus a brief slow-mo flash; unsafe vents get
   a screen-edge red vignette pulse instead of just text; score ticker pops like the cup %.
2. **Rumination Bog** (`swamp/RuminationBog.jsx`): the bog well becomes a mini `--p` scene —
   each rung climbed drains mud, lightens water, and lifts Boggo visibly; final rung breaks
   Boggo out with a mud-shake + fireflies.
3. Both: add beat-line captions between phases (reuse `.dts-beat` idiom), haptic ticks on
   progress, reduced-motion guards.

---

## PHASE 6 — REMAINING PAGE SWEEP (typography, backgrounds, glass)

Fast pass over pages not yet touched by the polish work. For each: consistent `page-header`
hierarchy, glass cards (`.card--glass`/`.glass-card`), one subtle ambient accent (NOT full scenes
— the global `.ambient-fx` already runs), press states, spacing rhythm on an 8px grid.
Order (highest traffic first): StatsPage, RewardsPage (+ RewardVault), VisionBoardPage,
IdentityPage, WeeklyReviewPage, ProfilePage, SciencePage, SettingsPage.
Do NOT restyle: map-quest chapters, RPG world, Blaze, 5 Shifts (own art direction).

---

## PHASE 7 — PERFORMANCE + FINAL SHIP

1. Audit: any continuously-animating element must be transform/opacity only — grep new CSS for
   animated `width|height|top|left|background-position` (background-position loops on small
   elements like `.dts-gate__flow` are acceptable; big surfaces are not).
2. `will-change` only where an element actually animates constantly; remove speculative ones.
3. Check `page-enter` interplay on every page you touched (fixed-position children during the
   first 360ms — see the `backwards`-fill comment in globals.css AAA FOUNDATION).
4. Bundle: index chunk is ~1.17MB minified. If you have time, lazy-load the biggest leaf pages
   (Blaze, ShiftsPage, AssetLibraryPage) via `React.lazy` matching the existing
   `CHAPTER_COMPONENTS` Suspense pattern in App.jsx. Low risk, big win. Not required to ship.
5. Full ship checklist: build clean → preview 200 → commit (one commit per phase is fine) →
   `netlify deploy --build --prod` → update memory files
   (`~/.claude/.../memory/project_session.md` + MEMORY.md index line).

---

## APPENDIX — QUICK COMMANDS

```bash
# dev / verify / ship
npx vite --port 5173
npx vite build && npx vite preview --port 4173
netlify deploy --build --prod

# confirm your CSS shipped
grep -c "tp-arena\|wiz-complete" dist/assets/index-*.css

# concurrent-session check before editing a file
git status --short && stat -c "%y %n" <files-you-plan-to-edit>
```

**Definition of done for the whole prompt**: every wizard has a completion moment worth
screenshotting; Trigger Popper is live with 4/4 Anger Gym games; anger is one tap from the
dashboard; Shadow hub is either the parallel session's realm (gap-passed) or rebuilt; supporting
swamp games feel like the flagship; every page passes the sweep checklist; deployed to Netlify.

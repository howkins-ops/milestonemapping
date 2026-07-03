# 07 — Build Prompt: Coaching Toolkit, Phase 1 (Quick Wins)

Self-contained prompt for building the next coaching-toolkit features. Give this file to a fresh
Claude Code session and say "build item N from coaching/07_BUILD_PROMPT.md". Everything a session
needs is here or linked. **BUFCA/The Burn is already LIVE** (built 2026-07-03,
`src/components/shadow/TheBurn.jsx` + `src/styles/burn.css`) — do not rebuild it; use it as the
quality bar and pattern reference.

## Scope (build in this order)

1. **Question of the Day** — daily reflection engine (roadmap item 1)
2. **Life Scorecard** — 10-dimension quarterly assessment + dashboard trend (roadmap item 3)
3. **Decision Filter** — run any choice through the 10 questions (roadmap item 4)

Full feature rationale: [04_INTEGRATION_ROADMAP.md](04_INTEGRATION_ROADMAP.md). Verbatim source
content: [03_QUESTION_BANKS.md](03_QUESTION_BANKS.md). Concepts: [01_GEM_CATALOG.md](01_GEM_CATALOG.md).

## Hard rules (non-negotiable)

- **IP: transmute, don't transcribe.** Paraphrase every question into the app's own voice
  (see [06_IP_AND_SOURCING.md](06_IP_AND_SOURCING.md)). Never ship Accomplishment Coaching text verbatim.
- **Brand:** colors only from the palette in memory `brand_colors` (neons #00F0FF/#D11EFF/#FF3EDB/#00FFBF,
  gold #FFD166/#FFB000, dark bases #05000A/#0d0514). Fonts: Sora (display) + Manrope only — NO monospace.
- **Mobile-first at 390px**, `prefers-reduced-motion` support, focus-visible states.
- **Concurrent sessions:** Jon may have another session live. Before editing any *shared* file
  (App.jsx, styles.css, gamification.js, achievements.js, nav/layout files), check `git status` +
  file mtimes; create new files first, wire shared files last, re-reading them just before editing.

## App integration contract

- Rewards: `useAppData()` → `addXP(amount, label)`, `unlockAchievement(id)`, `celebrate({variant,title,subtitle,detail})`.
  Add XP constants to `src/lib/gamification.js` `XP_VALUES`; achievements to `src/lib/achievements.js`.
- Persistence: localStorage via a small hook per feature (pattern: `src/components/shadow/useShadowWork.js`,
  key like `qotd_v1`). Supabase sync is NOT required for v1.
- Daily Ritual shell (for Question of the Day): `src/components/daily/` — AM flow panels
  (DailyCommitPanel → MakeAStandPanel → GratitudePanel → BattlePlanPanel → TopFivePanel). Add QOTD as
  a panel there; data file pattern: `src/data/powerfulStands.js`.
- Dashboard (for Scorecard trends): `src/components/dashboard/`.
- Standalone tools (Decision Filter): follow the Shadow exercise pattern —
  `src/components/shadow/shell.jsx` primitives (`ShadowStage`, `Eyebrow/Heading/Lead/Field/Chips/Primary/Seal`)
  or a sibling shell if it lives outside Shadow. Decision Filter belongs near Vision/Command, not Shadow.
- **Verify all paths against the live tree before building** — this file may age.

## Per-item acceptance criteria

### 1. Question of the Day
- Data file with ≥60 paraphrased prompts tagged by theme (wisdom, career, relationships, money, being).
- One prompt/day (deterministic by date, no repeats until pool exhausts), journal field, saved log.
- Appears in the AM Daily Ritual; skippable; +XP on save (`qotdAnswered: 10`).
- A "past answers" view (simple list is fine).

### 2. Life Scorecard
- 10 life dimensions, 1–10 sliders, one screen, <3 min to complete.
- Stores dated snapshots; dashboard sparkline/trend per dimension + overall.
- Prompted quarterly (gentle nudge if >90 days since last), on-demand anytime.
- Celebrate on completion; `lifeScorecard: 40` XP; achievement `first_scorecard`.

### 3. Decision Filter
- Input the decision, then 10 paraphrased filter questions (yes/no/lean sliders),
  ending in a visual alignment readout (e.g., 0–100 alignment dial + "what it's telling you" copy).
- Result saveable to a decisions log; re-runnable.
- `decisionFiltered: 15` XP.

## Quality bar

The Burn (`TheBurn.jsx`) is the reference: cinematic staging, real interactions (hold-to-ignite),
staged copy, payoff moment, achievement + XP + trail stamp. Every new tool needs its own
smaller-scale "moment" — not just a form. Screenshot-verify at 390px and desktop before calling done.

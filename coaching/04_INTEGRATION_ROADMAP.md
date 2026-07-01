# 04 — Integration Roadmap

How the NEW gems map to app features. Nothing here is built yet — this is the greenlight menu. Each item:
target feature · effort · why. Concepts/steps in [01_GEM_CATALOG](01_GEM_CATALOG.md); verbatim content in
[03_QUESTION_BANKS](03_QUESTION_BANKS.md); status in [02_GAP_ANALYSIS](02_GAP_ANALYSIS.md).

---

## ⭐ Centerpiece — BUFCA as the master tool in the Shadow area

Jon's call: **BUFCA is the concept under all of them.** It becomes the flagship of the Shadow Forge, and the
existing shadow tools are reframed as *themed BUFCA runs* — same five-beat spine, different trigger.

**Build:** a guided 5-card flow (the app plays the "someone reads you the questions" role the source insists on):

| Card | Prompt | UI |
|---|---|---|
| **B — Breakdown** | "What shouldn't be?" | free text — name the breakdown |
| **U — Upset** | "Thoughts, feelings, body sensations right now?" | free text / feeling chips — *no filter* |
| **F — Facts** | "What would an impartial reporter say happened?" | free text — strip interpretation |
| **C — Commitment** | "Separate from the circumstances, what are you committed to here?" | free text — pull from stands/values |
| **A — Action** | "Given only the commitment, what's the next action?" | action + by-when → into the task/loop system |

Details: back-up-one-step if stuck; end on a committed action with a by-when; celebrate as a Shadow "win"
(XP/essence, reusing the existing `useShadowWork` + `useAppData` reward wiring). See memory `project_shadowwork`.

**Reframe existing Shadow tools as BUFCA variants** (shared 5-beat engine, themed copy):
- Hold the Line (anger) → BUFCA with a heat/regulation skin.
- Shadow Alchemist (mask running me) → BUFCA where "Facts" exposes the mask's story.
- Reframe Forge / Integration / Self-Compassion / Inner Child → the U→F→C beats with their current framing.
- New completion tools (below) → the completion-flavored BUFCA.

*Why:* one coherent mental model across the whole Shadow area, matches Jon's instinct, and it's the exact
"reaction → committed action" move the Forge exists to teach.

---

## Priority ladder (quick win → bigger build)

### 1. Question-bank daily reflection — *quick win*
- **Feature:** a "Question of the Day" engine in the Daily Ritual; user journals one prompt.
- **Source:** Wisdom Access (81), Some Powerful Client Questions, Career prompts ([03](03_QUESTION_BANKS.md)).
- **Effort:** low — drop paraphrased prompts into a data file like `powerfulStands.js`; reuse the daily wizard shell.
- **Why:** highest value-to-effort; deepens a feature that already exists.

### 2. BUFCA + Completion tools in the Shadow Forge — *centerpiece*
- **Feature:** BUFCA flow (above) + **Three-Letter Series** (3-phase private writing, timers, "burn" animation)
  + **Responsibility 29-Q** workbook + a **Completion** declaration.
- **Effort:** medium — new Shadow components on the existing `shadow/` shell + `useShadowWork` state.
- **Why:** the biggest un-mined vein; Jon's flagged centerpiece; immediate felt shifts.

### 3. Life Scorecard — *quick-ish win, high visibility*
- **Feature:** the 10-dimension Client Assessment as a quarterly scorecard, trend lines on the dashboard.
- **Effort:** low–medium — one assessment screen + stored history + a chart.
- **Why:** gives the whole app a measurable "am I moving?" spine; pairs with milestones.

### 4. Decision Filter — *quick win*
- **Feature:** Debbie Ford's 10 questions as a standalone "run a choice through the filter" micro-tool with a visual alignment readout.
- **Effort:** low.
- **Why:** self-contained, memorable, reusable at any decision point.

### 5. Extend PARTIAL features — *cheap depth*
- **Back to Being** menu + time-to-return metric (extend `shadow/Grounding.jsx`).
- **Powerful Stands**: fold in the 34-item list (extend `powerfulStands.js`).
- **Project Design From The Future**: finish the 8-step wizard (future-vision writing → skills → resources → reverse timeline → reward tiers) on top of the Formula/Milestone base.
- **Futurability 8-point** viability check on any milestone.
- **Effort:** low each — all are extensions, not new modules.

### 6. NEW PILLAR — Relationships — *bigger build*
- **Feature set:** Couples "I" Exercise (guided ~70-prompt flow, timers, solo/journaling mode), Four Corners
  self-audit (quad chart), Men/Women Need assessment + weekly practice, Win-Win Agreement builder.
- **Effort:** high — new pillar (nav, data, components) mirroring how `vision/` or `shadow/` are structured.
- **Why:** entirely new territory, deeply resonant, and it's where Jon's own story had the most movement.

### 7. NEW PILLAR — Money — *bigger build*
- **Feature set:** 41-question Money audit → top-3 blockages → micro-lessons + a light monthly money check-in.
- **Effort:** medium–high — new module; pairs with the app's worth/abundance themes.
- **Why:** universal pain point; Jon's material is unusually concrete here.

### 8. MOPA weekly-practice engine — *biggest architectural call*
- **Feature:** a weekly set of Measurable Objectives / Practice Areas the user checks off, with streaks,
  weekly % completion, and pattern reflection ("you keep skipping relationship practices — what's up?").
- **Decision needed:** this overlaps the existing **Top Five** (daily) and **Milestones** (long-arc).
  Choose one: (a) extend Milestones with a weekly "practice areas" layer, (b) add a distinct weekly-MOPA
  surface between daily and milestone, or (c) reframe Top Five as the daily expression of weekly MOPAs.
- **Effort:** high + design-heavy — do this *after* the smaller wins clarify how practices should feel.

---

## Also-capture (smaller, opportunistic)
- **Opposite Of** daily prompt · **Bankrupt/Red-Flag word** language coach · **Turbo Chargers & Instigators**
  energy tracker · **Experiential challenges** (Getting-No's, Essence Closet, No-Media week) as weekly
  challenges · **546 Goals** browsable library · **Turtle-Eagle-Snake** archetype mapper · **Present Context**
  & **Problems-as-Opportunities** as journal templates that feed BUFCA · **Infinity Triangle** balance check.

## Sequencing suggestion
Ship **1 → 2 → 3 → 4** (all fast, all on existing shells) to prove the toolkit, extend the PARTIAL items
(5) alongside, then commit to one **new pillar** (6 or 7), and only tackle the **MOPA engine** (8) once the
smaller practices reveal the right shape. Reconfirm all app file paths against the live tree before building
(see caveat in [02](02_GAP_ANALYSIS.md)).

# 02 — Gap Analysis (what's already mined vs. what's NEW)

The app has already mined the **narrative + identity layer** of this curriculum deeply. The **practical
coaching toolkit** (completion tools, question banks, assessments, the MOPA engine, Relationships, Money)
is almost entirely **un-mined** — that's where the new gems are.

Status key: **DONE** = well represented in the app · **PARTIAL** = concept touched, but the actual
tool/depth is missing · **NEW** = not present.

> App file paths below come from the codebase audit this session; **reconfirm exact paths at build time**
> (files move between sessions). Gems → target features are detailed in [04_INTEGRATION_ROADMAP](04_INTEGRATION_ROADMAP.md).

---

## Concept presence table

| Concept | Status | Where in app (if present) |
|---|---|---|
| Survival mechanism | **DONE** | 5 masks — `src/data/maskCards.js`; `src/components/shadow/ShadowAlchemist.jsx`; `alchemist/07_CHAPTER_DOSSIER.md` (5 shadows) |
| Essence | **DONE** | 5 essences — `src/data/essenceCards.js`; `EssenceCard.jsx`, `EssenceGallery.jsx` |
| Declaration | **DONE** | Ch5 "Essence Declaration" (`chapters/ChapterGate.jsx`); daily stands |
| Stand | **DONE** (expandable) | `src/data/powerfulStands.js` (6 themes); `daily/DailyStandWizard.jsx`, `MorningStandPanel.jsx` |
| Life purpose | **DONE** | Ch19 "Life Purpose Reveal" (`chapters/ChapterVault.jsx`) |
| Futurability | **PARTIAL** | Ch3 concept (`chapters/ChapterFixer.jsx`) — the **8-point viability audit** is NEW |
| Being vs. doing | **DONE** | Ch15 "Being Mirror" (`chapters/ChapterGarden.jsx`); Blaze "Being" pillar |
| Reinvention | **DONE** | Ch20 "The Return" |
| Possibility | **DONE** | Narrative-wide |
| Conditions of satisfaction | **PARTIAL** | Implicit in `milestones/MilestoneProgressTracker.jsx` — the explicit **template** is NEW |
| Project Design From The Future | **PARTIAL** | Formula (`formula/FormulaPage.jsx`) + Ch4 Future-Vision Journal + milestone reward tiers cover ~half; **full 8-step wizard** is NEW |
| Gratitude ritual | **DONE** | `src/data/gratitudeTypes.js` (4 flavors) |
| Top Five priorities | **DONE** | `daily/TopFiveWizard.jsx` — note the source's **Top *Six*** adds a "blocked → next → errand-mode" nuance (NEW) |
| Grounding / Back to Being | **PARTIAL** | `shadow/Grounding.jsx` (5-4-3-2-1) — the full **"Back to Being" toolkit** menu is NEW |
| Completion (as a real tool) | **NEW** | only quest "seals" exist (`map-quest/kit.jsx` PhoenixSeal) — the **Three-Letter Series / Responsibility protocol** are NEW |
| **BUFCA** | **NEW** ⭐ | — (flagged as Shadow-area centerpiece + master framework, see [04](04_INTEGRATION_ROADMAP.md)) |
| Three-Letter Series | **NEW** | — |
| Responsibility-Completion (29 Qs) | **NEW** | — |
| Insight → Action → Results | **NEW** | — |
| Choice (3 options) | **NEW** | — |
| Opposite Of | **NEW** | — |
| Present Context (8-dim) | **NEW** | — |
| Bankrupt / Red-Flag words | **NEW** | — |
| Powerful Ways To Be With People | **NEW** | — |
| Wisdom Access / Debbie Ford / Barry Demp / Client Assessment question banks | **NEW** | — (see [03](03_QUESTION_BANKS.md)) |
| MOPA (practice engine) | **NEW** | milestones are adjacent but MOPA weekly-practice loop is NEW |
| Practice Areas | **NEW** | — |
| Leader Care Checklist | **NEW** | — |
| Turbo Chargers & Instigators | **NEW** | — |
| Turtle Eagle Snake | **NEW** | — |
| Coaching on a Gradient (adaptive difficulty) | **NEW** | — (design principle, not a screen) |
| 546 Goals library | **NEW** | — |
| Experiential challenges (Yes / No's / Blind Walk / Essence Closet) | **NEW** | — |
| Time Generator | **NEW** | — |
| Infinity Triangle | **NEW** | — |
| Vision/Mission/Strategy/Tactics | **PARTIAL** | Formula covers goal design; explicit VMST ladder is NEW |
| **Relationships pillar** (Couples "I", Four Corners, Men/Women Need, Win-Win) | **NEW** | — no relationships module exists |
| **Money pillar** (41-Q audit, money reframes) | **NEW** | — no money module exists |

---

## Headlines

1. **Identity layer = done. Toolkit layer = open.** Don't rebuild shadows/essences/stands/purpose. Do build
   the *doing* tools: completion, BUFCA, question-driven reflection, assessments.
2. **BUFCA is the connective tissue.** Jon's steer: it's the master move under all the other tools
   (breakdown → upset → facts → commitment → action). Make it a Shadow-area centerpiece.
3. **Two brand-new domains** the app has never entered: **Relationships** and **Money** — both rich,
   both greenlit as candidate pillars.
4. **Two content libraries** ready to drop in with almost no design work: the **question banks** ([03](03_QUESTION_BANKS.md))
   and the **546 Goals** list.
5. **PARTIAL items are cheap wins** — extend what exists (add stands, add a Back-to-Being menu, finish the
   Project-Design wizard) rather than build net-new.

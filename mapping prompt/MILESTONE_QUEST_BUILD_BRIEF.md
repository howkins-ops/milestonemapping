# Milestone Quest — Developer Handoff Brief

**For:** the engineer integrating the story/transformation layer into the existing Milestone Mapping app
**From:** Jon (product/design)
**Read this once, top to bottom. It explains the whole system, every file, and exactly what to build.**

---

## 1. The one-paragraph summary

We have a working gamified goal app (**Milestone Mapping** — live at milestonemapping.netlify.app). A user sets a goal, it becomes a *world* with a winding map, the goal breaks into *milestones* (map locations), and hitting real measurable targets advances the hero up the path toward a Final Goal. We are now adding a **story + transformation layer** on top of that map: each location, when you arrive, plays a short cinematic **chapter** (coaching + personal-development, styled like *The Alchemist*) before you grind that location's milestone. The story is the reward for the grind; the grind is the gate to the next story. We've already built the engine and the first chapters as separate prototype files. **Your job is to merge them into one app.**

---

## 2. The core model (this is the whole thing — internalize it)

```
ONE GOAL  =  ONE WORLD  =  ONE WINDING MAP PATH
The path is a sequence of LOCATIONS.
Each LOCATION has TWO phases:
      ┌─────────────────────────────────────────────┐
      │  PHASE 1 — STORY  (cinematic chapter plays)  │  ← personal growth / coaching
      │  PHASE 2 — MILESTONE  (hit the real number)  │  ← measurable target
      └─────────────────────────────────────────────┘

Flow down the path:
  arrive at location → ◆ watch the chapter → ● grind the milestone to its target
  → ✓ location complete → walk to next location → repeat → 👑 Final Goal
```

**SACRED RULE (never violate):** A milestone completes **only** when its measurable target value is reached (e.g. 100/100 beta testers). Watching a chapter, doing actions, daily proof, minigames, etc. all give XP/crystals/momentum but **never auto-complete a milestone.** This is the spine of the whole product's integrity.

**Two axes, one seam.** Milestones are the real backbone (the user's actual goals). Chapters are a story layer riding on top. They touch at exactly one point: **completing a location's milestone unlocks the next location (and therefore the next chapter).** Don't build two separate timelines — it's one path with two-phase stops.

**One Main Quest.** A user can have multiple goals/worlds ("MapQuests"), but **one is the Main Quest** and only that one drives the story chapters. Other worlds are side goals (still earn XP, no cinematic chapters). Promoting a side world to Main Quest re-anchors the story to it.

---

## 3. The files you're given (what each one IS)

All are single-file React (`.jsx`) prototypes. Three are *cinematic chapter* prototypes, one is the *engine*, one is the *mechanical shadow-work loop*. **Treat them as source-of-truth for content and behavior, not as final architecture** — you'll refactor them into modules.

### A. `MilestoneQuest_v3.jsx` — ⭐ THE ENGINE (most important file)
This is the actual app backbone. 775 lines. Contains:
- **The goal-setting "Formula" wizard** (8 steps: Specific Intentions → Future Vision → Strengths → Resources → Reward Categories → Milestones → Focused Actions → Milestone Rewards). This is how a goal becomes a world.
- **`useMilestoneGame()` hook** — the whole state engine: XP, crystals, levels, streaks, worlds, milestones, persistence.
- **Journey Map** (`JourneyWorld`, `JourneyMap`, `MapNode`) — the winding path of milestone nodes.
- **Walkable Level Rooms** (`LevelRoom`) — top-down room where the avatar walks to "action stations"; combos, confetti, loot toasts, level-up flashes.
- **Progress mechanic** (`bumpProgress`) — the `+1 / +5 / +10` buttons that move a milestone toward its target. **This is where the SACRED RULE lives:** milestone flips to `complete` only at `currentValue >= targetValue`.
- **Reward Vault, Hall of Wins, multi-World switcher.**
- **Persistence:** `localStorage` key `milestone-quest:v5`. State shape: `{ userProfile, worlds:[...], activeWorldId }`, each world has `{ formula, game:{ unlocked, milestones, finalGoalComplete }, player:{ xp, crystals, level, streak } }`.
- XP/crystal economy constants (`XP`, `CR`), `levelFromXP`, asset registry with emoji fallbacks so nothing breaks on missing art.

> **Note:** v3 uses `localStorage`. The live app uses **Supabase**. Keep the same state *shape*; swap the persistence layer (see §6).

### B. `MilestoneQuestAnchor.jsx` — CHAPTER ONE (cinematic)
The first story chapter: **"The Anchor"** (find your WHY). Self-contained phase machine:
`title → world(pick theme) → walk(to Dad's house) → table(sit, name quest, LIVE dad coaching to surface deep why) → treeline(animated ship/anchor metaphor lesson → name your real-life anchor → vulnerability question → earns LOVE essence with an explosion) → warning(Alchemist close: warns of shadows + teaches OMENS) → cross(into forest) → mentor(Anchor mentor unlocked, trophy screen) → handoff`
- **Live coaching:** calls Anthropic API (`claude-sonnet-4-6`) in-character as the father, reads the player's typed answers, digs deeper (ICF "Evokes Awareness" style). Has graceful fallback lines if the API is unavailable.
- **Outputs to game state:** `quest`, `deepWhy`, `anchorName`, `vulnerability`, `grantedEssence: "Love"`, `lockedEssences`, `anchorMentorUnlocked`.
- This is the **template/standard** for how every future chapter should look and feel.

### C. `MilestoneQuestShadow.jsx` — CHAPTER TWO (cinematic)
The second story chapter: **"The Shadow on the Road"** (meet your first mask — the Broke King). Phase machine:
`recap → mentors → encounter(meet a fallen man on the road) → mirror(you see it's YOU, crowned) → doorbe(do-vs-be seed) → origin(6-scene cinematic: the fallen sales-legend myth — Gift → Closer → Roots → Magic Left → Crown Cracked(wound) → Story That Became Me(shadow born from belief)) → coach(LIVE ICF coaching that plants a seed) → attach(your shadow is born, follows you) → handoff`
- Same live-API coaching pattern as Anchor.
- This is the **cinematic dramatization** of the shadow-work loop that `EssenceReturnRPG.jsx` does mechanically. (They're two views of the same system — see §5.)

### D. `EssenceReturnRPG.jsx` — THE SHADOW-WORK LOOP (mechanical)
The original, standalone transformation mechanic. 795 lines. The repeatable loop a user runs whenever a mask shows up:
`catch the mask → awareness mirror (reflection Qs) → breathing reset → choose Essence → enter Essence world → create PROOF action → earn XP → stats`
- **5 canonical MASKS:** Broke King, Addict Saint, Silent Prophet, Raging Victim, Naive Warrior. Each has voice, "gag," and `essenceReturn` (which essences heal it).
- **Essences:** Radiance, Love, Joy, Power, Majesty (each with meaning, affirmation, world, proof actions, identity statements).
- Uses `framer-motion`.
- **This is the "SHADOW" tab** in the live app's bottom nav. The cinematic Shadow chapter (C) is the *story intro* to this *repeatable mechanic*.

### E. `MilestoneQuestMergedMap.jsx` — THE INTEGRATION CONCEPT (the blueprint)
A concept prototype showing **exactly how story + milestone merge on one path.** This is the picture of the target. Each location node has the 4-state machine: `locked → story(chapter ready) → active(grind milestone) → done`. Tapping a node opens a sheet with a **two-phase tracker** (Phase 1 STORY ✓ / Phase 2 MILESTONE). Keeps the live app's 5-tab nav. **Placeholder styling only — not the real pixel art.** Use this as the structural spec for how nodes behave, not for visuals.

---

## 4. The existing LIVE app (what's already shipped — don't rebuild it)

From the current build (milestonemapping.netlify.app), already working:
- **Pixel-art fantasy world** with a glowing winding path, milestone locations (Crystal Caverns, Forgotten Quarry, Ascension Cliffs, Diamond Citadel), a Final Goal citadel, the cloaked hero at "Current Reality."
- **Rank/XP system:** Warrior → Architect, XP counter.
- **Lock system:** locked locations show "Complete the previous milestone first" + a locked archway asset.
- **Bottom nav, 5 tabs:** `COMMAND · DAILY · MAP · SHADOW · FILL CUP`.
- **Supabase** backend, **Netlify** hosting.

**Keep all of this.** The integration adds the story layer *inside the MAP tab* and wires the SHADOW tab to the EssenceReturnRPG loop. Nav stays exactly as-is.

---

## 5. How the pieces relate (the mental map)

```
                         ┌────────────────────────────────────────┐
                         │  MilestoneQuest_v3.jsx = THE ENGINE     │
                         │  (goals→worlds, XP, map, level rooms,   │
                         │   progress mechanic, persistence)       │
                         └───────────────┬────────────────────────┘
                                         │ provides state + map + the SACRED progress rule
        ┌────────────────────────────────┼─────────────────────────────────┐
        │                                │                                  │
   MAP TAB                          SHADOW TAB                         (other tabs:
   path of LOCATIONS                EssenceReturnRPG.jsx                COMMAND/DAILY/
   each location =                  = repeatable shadow-work            FILL CUP — keep
   STORY chapter + MILESTONE        loop (catch mask→essence→proof)     as-is)
        │
        │ STORY phase plays one of the cinematic chapters:
        ├── Location 1 → MilestoneQuestAnchor.jsx   (Ch.1 The Anchor — find your why)
        ├── Location 2 → MilestoneQuestShadow.jsx   (Ch.2 The Shadow — meet your mask)
        ├── Location 3 → (Ch.3 The Challenger — to build, same template)
        └── Location N → ...

   MilestoneQuestMergedMap.jsx = the BLUEPRINT for how MAP-tab nodes
   behave (locked→story→active→done, two-phase sheet). Build the real
   MAP tab to match this behavior, using the live pixel-art assets.
```

**Key relationship to understand:** The cinematic **Shadow chapter** (file C) and the mechanical **EssenceReturnRPG** loop (file D) are the *same transformation system* shown two ways. The chapter is the **first, story-driven encounter** with a mask (happens once, on the path). The loop is the **repeatable tool** (SHADOW tab) the user runs every time a mask resurfaces in real life. They share the same masks and essences — keep that data in ONE shared module so they never drift.

---

## 6. What to actually build (the work)

### Step 1 — Set up one real project
- One Vite + React app (the live app's existing stack). Stop treating these as separate artifacts.
- Pull `MilestoneQuest_v3.jsx` apart into modules: `data/` (config, formula steps, masks, essences, poetry), `hooks/useMilestoneGame.js`, `components/` (map, level room, vault, etc.). The file already has section banners (`/* ===== data/... */`) marking the intended split.

### Step 2 — Make ONE shared data module for masks + essences
Extract the 5 masks and the essences from **both** `EssenceReturnRPG.jsx` and the Shadow chapter into a single `data/transformation.js`. Both the cinematic chapter and the SHADOW-tab loop import from it. Canonical masks: **Broke King, Addict Saint, Silent Prophet/Wasted Genius, Raging Victim, Naive Warrior.** Canonical essences: **Radiance, Love, Joy, Power, Majesty** (+ the extended pool in the chapters if we keep it).

### Step 3 — Build the LOCATION node model (the merge)
Use `MilestoneQuestMergedMap.jsx` as the behavior spec. Each location in a world's path carries:
```js
{
  id, name,                        // e.g. "Crystal Caverns"
  chapterId,                       // which cinematic chapter plays here (or null)
  storyWatched: bool,              // has the chapter been viewed
  milestone: { metric, target, current, status },  // the real measurable target
  stage: "locked" | "story" | "active" | "done",   // derived
}
```
- `stage` derivation: locked until previous location is `done`; on arrival → `story` (if chapter unwatched) → `active` (grind) → `done` (when `milestone.current >= milestone.target`).
- Node UI: story phase = diamond ◆, grind phase = progress ring %, done = ✓, locked = 🔒. Tapping opens the two-phase sheet.
- **Wire the SACRED RULE through here unchanged** — reuse v3's `bumpProgress` logic; only the target completes a location.

### Step 4 — Make chapters launchable from a location
- Each cinematic chapter (`Anchor`, `Shadow`, …) becomes a component that takes the world/location state and an `onComplete` callback.
- On a `story`-stage node tap → launch the chapter full-screen → on chapter `handoff`, write its outputs back to state (`grantedEssence`, `anchorName`, `deepWhy`, `anchorMentorUnlocked`, etc.) and flip the node to `active`.
- Chapters are **data-driven**: build them off the Anchor template so adding Chapter 3, 4, 5… is just new content + a node on the path, not new engine code.

### Step 5 — Wire the SHADOW tab
- The SHADOW tab = `EssenceReturnRPG.jsx` loop, importing masks/essences from the shared module (Step 2).
- The cinematic Shadow chapter, when completed on the path, should "register" that mask so it appears in the SHADOW tab as the user's known shadow to keep working.

### Step 6 — Persistence: localStorage → Supabase
- v3's state shape stays the same; replace `loadSave`/`persist` (localStorage) with Supabase reads/writes.
- Tables roughly: `worlds`, `locations` (or milestones), `player_state`, `essences_earned`, `chapters_watched`. Mirror the existing live-app schema where it already exists.
- Keep an offline/in-session fallback (artifacts block localStorage; real app won't, but Supabase is the source of truth).

### Step 7 — Live coaching API
- The chapters call Anthropic (`claude-sonnet-4-6`) for the in-character father/mentor coaching. In production, proxy this through a backend function (don't expose keys client-side). Keep the graceful fallback lines for offline/error.

---

## 7. Design system (keep consistent)

- **Look:** black / neon cyberpunk. Palette: bg `#000`–`#05030c`, phoenix `#7B2CFF`, magenta `#D11EFF`, hotPink `#FF3EDB`, cyan `#00F0FF`, mint `#00FFBF`, gold `#FFC94D`, amber `#FFA94D`, text `#F2F0F4`, locked `#3a3450`, danger `#FF5470`.
- **Fonts:** Fraunces (serif display / story text), Inter Tight (body), JetBrains Mono (labels/system/numbers).
- **Pixel-art assets** (the real world art) live in an asset registry with emoji/CSS fallbacks (v3 already has this pattern — keep it so missing art never breaks the build).
- **ADHD-friendly:** visuals first, one primary action per screen, clear "YOU ARE HERE," dopamine on completion (confetti, loot toasts, level-up flashes — already in v3).
- **One escape-sequence gotcha:** in JSX *text/children*, write special characters as real UTF-8 (→ — 🔒) or as named JS constants, never as raw `\uXXXX` literals (they render as literal text in children). The chapter files already use named constants (`ARROW`, `DASH`, `LOCK`) for this reason.

---

## 8. Build order (recommended)

1. Stand up the Vite project; modularize `MilestoneQuest_v3.jsx` (engine + map + level rooms working with localStorage).
2. Extract shared `data/transformation.js` (masks + essences).
3. Build the LOCATION two-phase node model per `MergedMap` (story+milestone on one path).
4. Drop in Chapter 1 (Anchor) as the first location's story; wire outputs→state→unlock milestone.
5. Drop in Chapter 2 (Shadow); wire it to register the mask into the SHADOW tab loop.
6. Wire SHADOW tab to EssenceReturnRPG using shared data.
7. Swap persistence to Supabase; proxy the coaching API.
8. Replace placeholder visuals with the live pixel-art assets.
9. Author Chapters 3+ as pure content off the Anchor template.

**Ship-able milestone before everything's done:** engine + map + Chapter 1 + one real milestone + the SHADOW loop = a complete vertical slice worth testing.

---

## 9. Glossary (so we all use the same words)

- **World / MapQuest** — one goal, rendered as one map. User can have several; one is the **Main Quest** (drives story).
- **Location** — a stop on the path. Has a **story phase** (chapter) and a **milestone phase** (target).
- **Chapter** — a cinematic, coaching-rich story beat (Anchor, Shadow, …). Personal-development content, Alchemist tone.
- **Milestone** — the measurable target at a location. Completes ONLY at its number (sacred rule).
- **Essence** — an earned identity trait (Love, Power, Radiance, Joy, Majesty). Earned by *being* it in a moment, not by quiz.
- **Mask / Shadow** — a limiting identity (Broke King, etc.). You don't slay it; you name the lie, speak the truth, integrate it, and return the Essence it stole.
- **Mentor** — Anchor (find your why), Challenger (the broken word), Operator (build the system). Unlocked over time; gate Academy training.
- **The Formula** — the 8-step goal-setting wizard that turns a goal into a world.
- **Proof** — a real-world action logged as evidence (gives XP, never completes a milestone by itself).

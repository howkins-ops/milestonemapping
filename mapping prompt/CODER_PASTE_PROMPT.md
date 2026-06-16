# PASTE-IN PROMPT (give this to Cursor / Claude Code / your coder's AI)

You are integrating a story + transformation layer into an existing gamified goal app called **Milestone Mapping** (live React + Vite + Supabase app, hosted on Netlify). Read the attached `MILESTONE_QUEST_BUILD_BRIEF.md` in full first — it is the source of truth. Then read the 5 attached `.jsx` prototype files.

## The mental model (do not deviate)
- ONE goal = ONE world = ONE winding map path made of LOCATIONS.
- Each LOCATION has two phases: **(1) STORY** — a cinematic coaching chapter plays on arrival; **(2) MILESTONE** — a real measurable target the user must hit.
- Flow: arrive → watch chapter → grind milestone to its target → location complete → next location → … → Final Goal.
- **SACRED RULE:** a milestone completes ONLY when its measurable target value is reached. Nothing else (chapters, actions, proof, minigames) ever auto-completes it. This rule already lives in `MilestoneQuest_v3.jsx` `bumpProgress` — preserve it exactly.
- One world is the **Main Quest** (drives chapters); others are side goals (XP only).

## The files
- `MilestoneQuest_v3.jsx` = THE ENGINE (goal-setting Formula wizard, `useMilestoneGame` state hook, journey map, walkable level rooms, XP/crystals/levels, reward vault, multi-world, localStorage persistence). Modularize this; it already has `/* ===== data/... */` section banners marking the intended split.
- `MilestoneQuestAnchor.jsx` = Chapter 1 "The Anchor" (find your why) — the TEMPLATE for all chapters. Live Anthropic API coaching (`claude-sonnet-4-6`) with graceful fallback.
- `MilestoneQuestShadow.jsx` = Chapter 2 "The Shadow" (meet your first mask, the Broke King).
- `EssenceReturnRPG.jsx` = the repeatable shadow-work loop (catch mask → essence → proof). This is the SHADOW tab. Shares masks/essences with the Shadow chapter — extract that data to ONE shared module.
- `MilestoneQuestMergedMap.jsx` = the BLUEPRINT for how MAP-tab location nodes behave (states: locked → story → active → done; two-phase detail sheet). Placeholder visuals only — use the live pixel-art assets in the real build.

## Keep (already shipped, don't rebuild)
The pixel-art world, winding path, Warrior→Architect rank/XP, lock system, and the 5-tab bottom nav (COMMAND · DAILY · MAP · SHADOW · FILL CUP). The story layer goes INSIDE the MAP tab; the SHADOW tab gets the EssenceReturnRPG loop. Nav is unchanged.

## Build order
1. Stand up one Vite project; modularize the engine (`MilestoneQuest_v3.jsx`) — engine + map + level rooms working.
2. Extract `data/transformation.js` (the 5 masks + essences) shared by the Shadow chapter and the SHADOW tab.
3. Build the LOCATION two-phase node model per `MergedMap` (story + milestone on one path; reuse the sacred progress rule).
4. Wire Chapter 1 (Anchor) to the first location; on chapter complete, write outputs (`grantedEssence`, `anchorName`, `deepWhy`, `anchorMentorUnlocked`) back to state and unlock the milestone phase.
5. Wire Chapter 2 (Shadow); on complete, register that mask into the SHADOW-tab loop.
6. Wire the SHADOW tab to EssenceReturnRPG using the shared data module.
7. Swap localStorage → Supabase (keep v3's state shape); proxy the coaching API through a backend function (no client-side keys); keep fallback lines.
8. Replace placeholder visuals with the live pixel-art assets (asset registry + emoji fallback pattern already in v3).
9. Author Chapters 3+ as pure content off the Anchor template — new data + a node on the path, not new engine code.

## Constraints
- Cyberpunk neon palette + Fraunces / Inter Tight / JetBrains Mono (exact values in the brief).
- In JSX children, use real UTF-8 chars or named constants for → — 🔒, never raw `\uXXXX` literals.
- Keep ADHD-friendly UX: visuals first, one primary action per screen, "YOU ARE HERE," dopamine on completion (confetti/loot/level-up already in v3).
- A ship-able vertical slice = engine + map + Chapter 1 + one real milestone + SHADOW loop. Get there first, then expand.

Ask me clarifying questions about anything ambiguous before writing large amounts of code. Start by proposing the folder/module structure and the shared data schema, then we'll build in the order above.

# CODEX BUILD PROMPT — Milestone Mapping RPG World System

We are no longer building a static milestone map with cards layered on top.

We are building a real RPG-style goal progression system where every project becomes a playable world.

The user creates milestones. Each milestone becomes a real location on the world map. When the user clicks a milestone, they enter that milestone’s own world screen. When the milestone is completed, the map updates and the character moves forward.

Use the generated PNG/JPEG concept images as the visual source assets. Do not invent a new design. Use these images as the design reference and crop/convert them into usable app assets.

## Core Flow

1. Project World Map
2. Create Milestone
3. Milestone appears as a new location on the map
4. Click milestone
5. Enter that milestone world
6. Complete milestone tasks/progress
7. Collect the milestone stone
8. Return to map
9. Map updates with milestone completed
10. Character moves farther along the path
11. Repeat until final goal
12. Final goal completed
13. World Complete / Congratulations screen

## Core Gameplay Language

- Project = World
- Milestone = Location
- Completed milestone = Collected stone
- Final goal = Ultimate stone / throne
- All stones collected = World complete

## Asset Folder Structure

```txt
/public/assets/project-worlds/crystal-frontier/
  map/
    state-00-start.png
    state-01-m1-current.png
    state-02-m1-complete.png
    state-03-m2-current.png
    state-04-m2-complete.png
    state-05-m3-current.png
    state-06-m3-complete.png
    state-07-m4-current.png
    state-08-m4-complete.png
    state-09-m5-progress.png
    state-10-m5-complete.png
    state-11-final-goal.png
    state-12-world-complete.png

  milestones/
    milestone-01-crystal-pass.png
    milestone-01-crystal-pass-complete.png
    milestone-02-crystal-caverns.png
    milestone-02-crystal-caverns-complete.png
    milestone-03-forgotten-quarry.png
    milestone-03-forgotten-quarry-complete.png
    milestone-04-ascension-cliffs.png
    milestone-04-ascension-cliffs-complete.png
    milestone-05-diamond-citadel.png
    milestone-05-diamond-citadel-complete.png

  final/
    final-goal-diamond-throne.png
    final-goal-achieved.png
    congratulations-world-complete.png

  thumbnails/
    milestone-01-thumb.png
    milestone-02-thumb.png
    milestone-03-thumb.png
    milestone-04-thumb.png
    milestone-05-thumb.png
    final-goal-thumb.png
```

## Build Components

```txt
/components/rpg-world/
  ProjectWorldMap.jsx
  MilestoneWorld.jsx
  FinalGoalWorld.jsx
  WorldComplete.jsx
  MilestoneNode.jsx
  MilestoneSidebar.jsx
  JourneyStatusCard.jsx
  RewardChest.jsx
  BottomActionBar.jsx
```

## Implementation Rules

Use image assets as cinematic backgrounds. Rebuild real text, buttons, state, progress bars, and interaction in JSX/Tailwind on top.

Do not rely on the AI-generated text inside images as real UI. Crop images as reference/backgrounds and make the app functional.

The app must feel like a playable RPG world, not a Notion board, coaching worksheet, static dashboard, or single background with random overlays.

## State Machine

```txt
WORLD_MAP_START
MILESTONE_1_WORLD
MILESTONE_1_COMPLETE
WORLD_MAP_M1_COMPLETE
MILESTONE_2_WORLD
MILESTONE_2_COMPLETE
WORLD_MAP_M2_COMPLETE
MILESTONE_3_WORLD
MILESTONE_3_COMPLETE
WORLD_MAP_M3_COMPLETE
MILESTONE_4_WORLD
MILESTONE_4_COMPLETE
WORLD_MAP_M4_COMPLETE
MILESTONE_5_WORLD
MILESTONE_5_COMPLETE
WORLD_MAP_M5_COMPLETE
FINAL_GOAL_WORLD
FINAL_GOAL_ACHIEVED
WORLD_COMPLETE
```

## Visual Style

- Black glass cards
- Purple neon
- Cyan highlights
- Emerald green completed checkmarks
- Gold reward accents
- No white/gray flat backgrounds
- Cinematic RPG look
- Rounded panels
- Dark fantasy crystal aesthetic

```css
--bg: #05000f;
--card: rgba(8, 5, 20, 0.82);
--purple: #7B2CFF;
--magenta: #D11EFF;
--pink: #FF3EDB;
--cyan: #00F0FF;
--green: #00FFBF;
--gold: #FFD166;
```

# Milestone Mapping RPG World Creation System

## Purpose

This document explains how to recreate the Milestone Mapping RPG world system again for future worlds.

The goal is not to create one static map with buttons on top. The goal is to create a real game-like progression system where every project becomes a playable world, every milestone becomes a location, and every completed milestone becomes a collected stone.

The user should feel like they are moving through a world, collecting milestone stones, unlocking the final goal, and completing the entire world.

---

# Core Concept

A project is a world.

A milestone is a location inside that world.

Completing a milestone means collecting that milestone stone.

The final goal unlocks only after all milestone stones are collected.

The world complete screen appears after the final stone is claimed.

The experience should feel like:

1. Start on the world map.
2. Create or unlock Milestone 1.
3. Enter Milestone 1 world.
4. Complete Milestone 1 and collect the stone.
5. Return to the map.
6. The world map updates and the character moves forward.
7. Repeat for every milestone.
8. Unlock the final goal.
9. Claim the final stone.
10. Show the congratulations world complete page.

---

# Required Image Sequence

For every world, create images in this exact sequence.

## 1. Starter World Map

This is the first image.

It shows the full project world before much progress has been made.

Required elements:

- Main character at current reality / starting point
- Path leading into the world
- Future milestone locations visible but locked
- Final goal visible in the distance
- Dark fantasy / game UI style
- Journey status panel
- Create Milestone button
- Map legend

Filename example:

```txt
state-00-start.png
```

---

## 2. Milestone 1 Created / Current Map

This shows Milestone 1 active on the map.

Required elements:

- Character still near the beginning
- Milestone 1 glowing as current or available
- Other milestones locked
- Path lightly activated to milestone 1

Filename example:

```txt
state-01-m1-current.png
```

---

## 3. Milestone 1 World Interior

This is the screen the user sees after clicking Milestone 1.

Required elements:

- Back to Map button
- Milestone title
- Large cinematic environment for that specific milestone
- Progress card
- Step checklist
- Reward chest / milestone stone
- Bottom menu options
- Character inside the milestone location

Bottom menu should include:

- Mind Map
- Focus
- Resources
- Reflection
- Reward Chest

Filename example:

```txt
milestone-01-crystal-pass.png
```

---

## 4. Milestone 1 Completed World Interior

This is the completed version of the milestone location.

Required elements:

- 100% progress
- All steps checked
- Milestone Complete message
- Stone claimed / reward claimed
- Reward chest opened or completed state
- Same location but more activated, brighter, or victorious

Filename example:

```txt
milestone-01-crystal-pass-complete.png
```

---

## 5. Return to Map After Milestone 1 Complete

This shows the overworld after Milestone 1 is completed.

Required elements:

- Milestone 1 marked completed with checkmark
- Character moved forward on the path
- Milestone 2 now active or available
- Map visually evolved

Filename example:

```txt
state-02-m1-complete.png
```

---

## 6. Repeat For Every Milestone

For each milestone, repeat the same pattern:

```txt
Map with milestone current
Milestone interior screen
Milestone completed screen
Map with milestone completed and character moved forward
```

Example for 5 milestones:

```txt
state-00-start.png
state-01-m1-current.png
milestone-01-world.png
milestone-01-complete.png
state-02-m1-complete.png
state-03-m2-current.png
milestone-02-world.png
milestone-02-complete.png
state-04-m2-complete.png
state-05-m3-current.png
milestone-03-world.png
milestone-03-complete.png
state-06-m3-complete.png
state-07-m4-current.png
milestone-04-world.png
milestone-04-complete.png
state-08-m4-complete.png
state-09-m5-current.png
milestone-05-world.png
milestone-05-complete.png
state-10-m5-complete.png
```

---

## 7. Final Goal World

This appears after all milestones are complete.

Required elements:

- Final goal unlocked
- Intense final destination
- Character approaching final stone, throne, portal, shrine, or citadel
- Final reward / final objective
- High drama and cinematic energy

Filename example:

```txt
final-goal-diamond-throne.png
```

---

## 8. Final Goal Achieved / Collecting Final Stone

This is the moment where the character claims the final stone.

Required elements:

- Character reaching toward or holding the final glowing stone
- Massive energy burst
- Final goal achieved
- 100% journey complete
- Final rewards unlocked

Filename example:

```txt
final-goal-achieved.png
```

---

## 9. Mission Complete Map

This returns to the world map after the final goal is completed.

Required elements:

- All milestones completed
- Final goal completed
- World glowing / restored / fully activated
- Character standing in the completed world
- Mission Complete text

Filename example:

```txt
state-12-world-complete.png
```

---

## 10. Congratulations World Complete Page

This is the final victory page.

Required elements:

- Large “Congratulations” text
- Large “World Complete” text
- Hero standing before completed world
- Journey summary
- Milestones completed
- Total XP earned
- Rewards unlocked
- Continue Your Legend button

Filename example:

```txt
congratulations-world-complete.png
```

---

# Recommended Asset Count

For a 5 milestone world:

- 1 starter map
- 5 map progression states
- 5 milestone interior screens
- 5 milestone completed screens
- 1 final goal screen
- 1 final goal achieved screen
- 1 mission complete map
- 1 congratulations screen

Recommended total: 20 images.

For a 10 milestone world:

Recommended total: 35–45 images.

For a 15 milestone world:

Recommended total: 50–65 images.

---

# Folder Structure

Use this folder structure for every world.

```txt
/public/assets/project-worlds/[world-slug]/
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
    state-09-m5-current.png
    state-10-m5-complete.png
    state-11-final-goal-current.png
    state-12-world-complete.png

  milestones/
    milestone-01-world.png
    milestone-01-complete.png
    milestone-02-world.png
    milestone-02-complete.png
    milestone-03-world.png
    milestone-03-complete.png
    milestone-04-world.png
    milestone-04-complete.png
    milestone-05-world.png
    milestone-05-complete.png

  final/
    final-goal-world.png
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

---

# World Theme Rules

Each project world needs one clear theme.

Do not make every milestone a random environment.

Bad example:

- Milestone 1: Forest
- Milestone 2: Volcano
- Milestone 3: Space station
- Milestone 4: Pirate ship
- Milestone 5: Cyber city

Good example:

The whole world is a Crystal Frontier.

- Milestone 1: Crystal Pass
- Milestone 2: Crystal Caverns
- Milestone 3: Forgotten Quarry
- Milestone 4: Ascension Cliffs
- Milestone 5: Diamond Citadel
- Final Goal: Diamond Throne

Everything feels connected.

---

# Example World Themes

## Crystal Frontier

- Starting Point: Current Reality Platform
- Milestone 1: Crystal Pass
- Milestone 2: Crystal Caverns
- Milestone 3: Forgotten Quarry
- Milestone 4: Ascension Cliffs
- Milestone 5: Diamond Citadel
- Final Goal: Diamond Throne

## Enchanted Forest

- Starting Point: Forest Gate
- Milestone 1: Moss Path
- Milestone 2: Whispering Grove
- Milestone 3: Ancient Tree
- Milestone 4: Hidden Ruins
- Milestone 5: Heart of the Forest
- Final Goal: Eternal Seed Shrine

## Volcano Realm

- Starting Point: Ash Fields
- Milestone 1: Ember Road
- Milestone 2: Lava Tunnels
- Milestone 3: Forge Citadel
- Milestone 4: Fire Peaks
- Milestone 5: Phoenix Shrine
- Final Goal: Eternal Flame Throne

## Desert Kingdom

- Starting Point: Sand Gate
- Milestone 1: Golden Dunes
- Milestone 2: Oasis Camp
- Milestone 3: Lost Temple
- Milestone 4: King’s Road
- Milestone 5: Sun Pyramid
- Final Goal: Crown of the Sun

## Frozen North

- Starting Point: Ice Harbor
- Milestone 1: Frost Trail
- Milestone 2: Glacier Cave
- Milestone 3: Frozen Watchtower
- Milestone 4: Storm Ridge
- Milestone 5: Ice Citadel
- Final Goal: Aurora Crown

---

# Prompt Formula For Creating Images

Use this formula every time.

```txt
Create a widescreen fantasy RPG game UI screen for [WORLD THEME].
Project title: [PROJECT NAME].
Current screen: [SCREEN TYPE].
Milestone: [MILESTONE NAME].
State: [current / completed / locked / final / world complete].
Show the same hero character moving through the world.
Use a cinematic dark fantasy style with black glass UI panels, neon purple, magenta, cyan, emerald completion highlights, and gold reward accents.
The image should feel like a real video game screen, not a worksheet.
The world should stay consistent with the theme.
Include clear UI spaces for progress, XP, rewards, milestone status, and action buttons.
Do not make it random. Keep the environment connected to the same world.
```

---

# Starter World Map Prompt

```txt
Create a widescreen fantasy RPG world map UI for a project world called [PROJECT NAME].
Theme: [WORLD THEME].
Show a lone hero standing at the starting point called Current Reality.
A glowing path leads through [NUMBER] milestone locations toward a distant final goal.
Most milestones are locked except Milestone 1, which is available or newly created.
The world should feel cinematic, dark, magical, and realistic for its biome.
Use black glass UI panels, neon purple and cyan accents, emerald checkmarks, and gold reward details.
Include a journey status panel, map legend, XP panel, create milestone button, and final goal marker.
This should feel like a real RPG overworld, not a flat dashboard.
```

---

# Milestone Interior Prompt

```txt
Create a widescreen fantasy RPG milestone world screen.
Project: [PROJECT NAME].
Milestone [NUMBER]: [MILESTONE NAME].
Theme: [WORLD THEME].
Location: [LOCATION DESCRIPTION].
Show the hero inside this milestone location, facing the next challenge.
Include a Back to Map button, milestone title, progress panel, steps checklist, milestone reward chest, XP card, notes/resources panels, and bottom action buttons.
Bottom action buttons: Mind Map, Focus, Resources, Reflection, Reward Chest.
Use black glass UI panels, neon purple, cyan highlights, emerald completion marks, and gold reward accents.
The image should feel like the player has entered this location, not like a separate random world.
```

---

# Milestone Complete Prompt

```txt
Create the completed version of this milestone world screen.
Project: [PROJECT NAME].
Milestone [NUMBER]: [MILESTONE NAME].
Theme: [WORLD THEME].
Show the same location, now activated and victorious.
Progress should show 100% complete.
All checklist steps should be complete.
The reward chest should be claimed.
Show a glowing milestone stone collected by the hero or activated in the environment.
Use emerald green completion highlights with purple/cyan magic energy.
Keep the same world style and UI structure.
```

---

# Return To Map Prompt After Completion

```txt
Create the updated RPG world map after Milestone [NUMBER] is completed.
Project: [PROJECT NAME].
Theme: [WORLD THEME].
The hero has moved further along the glowing path.
Milestone [NUMBER] is marked completed with a glowing green checkmark.
All previous milestones are also completed.
The next milestone is now current, available, or unlocked.
Locked future milestones remain visible farther along the path.
The world should feel more alive and activated than before.
Use the same overall map layout and same visual style.
```

---

# Final Goal Prompt

```txt
Create the final goal screen for the RPG project world.
Project: [PROJECT NAME].
Final Goal: [FINAL GOAL NAME].
Theme: [WORLD THEME].
All milestones have been completed and all milestone stones have been collected.
Show the hero approaching the final stone, throne, shrine, or portal.
Make it intense, cinematic, and powerful.
Use storm energy, glowing crystals, floating debris, magical light, and a massive final destination.
Include final progress, final objective, final reward, XP, and a claim final stone button.
```

---

# Final Stone Claimed Prompt

```txt
Create the moment where the hero claims the final stone.
Project: [PROJECT NAME].
Final Goal: [FINAL GOAL NAME].
Theme: [WORLD THEME].
The hero is reaching toward or holding the ultimate glowing stone.
The stone releases massive purple, cyan, and magenta energy.
Show Final Goal Achieved, 100% Journey Complete, rewards unlocked, and final XP earned.
This should feel like the climax of a video game campaign.
```

---

# Mission Complete Map Prompt

```txt
Create the completed RPG world map after the final goal has been achieved.
Project: [PROJECT NAME].
Theme: [WORLD THEME].
All milestone stones are collected.
Every milestone marker is completed.
The final goal is completed.
The world is fully activated, glowing, restored, and victorious.
Show Mission Complete and a world overview panel.
The hero stands on the completed path looking at the world they conquered.
```

---

# Congratulations World Complete Prompt

```txt
Create a vertical or widescreen congratulations victory page for a fantasy RPG project world.
Project: [PROJECT NAME].
Theme: [WORLD THEME].
Large text: Congratulations!
Large text: World Complete.
Show the hero standing before the completed world and the final glowing stone.
Include a journey summary: milestones completed, challenges conquered, total XP earned, rewards unlocked, legend status achieved.
Include a button: Continue Your Legend.
Use dark fantasy, black UI panels, neon purple, cyan, magenta, emerald, and gold accents.
This should feel like the final victory screen of a real game.
```

---

# Image Cropping Instructions For Codex

If the generated images contain UI and backgrounds together, use them in two ways:

## Option A: Use Full Image As Background

Best for fastest implementation.

- Save full image as a background screen.
- Overlay real React buttons, text, and functional UI on top.
- Hide or avoid relying on blurry AI-generated text.

## Option B: Crop Into Assets

Use when creating reusable components.

Crop:

- Main background art
- Milestone cards
- Reward chests
- Stones / crystals
- Thumbnails
- Completion icons
- Final goal art

Recommended crop folders:

```txt
backgrounds/
cards/
icons/
thumbnails/
rewards/
stones/
```

Use PNG or WebP.

Use WebP for app performance.

---

# React Implementation Rules

The image is the cinematic layer.

The JSX is the functional layer.

Do not rely on AI text inside images.

Real app data should come from React state.

The UI should use:

- ProjectWorldMap.jsx
- MilestoneWorld.jsx
- FinalGoalWorld.jsx
- WorldComplete.jsx
- JourneyStatusCard.jsx
- MilestoneNode.jsx
- RewardChest.jsx
- BottomActionBar.jsx

---

# App State Machine

Use the current progress to choose which image is shown.

```js
const screens = {
  map: "map",
  milestone: "milestone",
  finalGoal: "finalGoal",
  worldComplete: "worldComplete"
};
```

A milestone can have these statuses:

```js
"locked"
"available"
"in_progress"
"completed"
```

The final goal can have these statuses:

```js
"locked"
"available"
"in_progress"
"completed"
```

---

# Map Image Logic

```js
function getMapImage(project) {
  if (project.finalGoal.status === "completed") {
    return assets.map.worldComplete;
  }

  const completed = project.milestones.filter(m => m.status === "completed").length;

  if (completed === 0) return assets.map.start;
  if (completed === 1) return assets.map.m1Complete;
  if (completed === 2) return assets.map.m2Complete;
  if (completed === 3) return assets.map.m3Complete;
  if (completed === 4) return assets.map.m4Complete;
  if (completed === 5) return assets.map.m5Complete;

  return assets.map.start;
}
```

---

# Completion Logic

```js
function completeMilestone(milestoneId) {
  const updated = project.milestones.map((m, index) => {
    if (m.id === milestoneId) {
      return { ...m, status: "completed", progress: 100, stoneClaimed: true };
    }

    return m;
  });

  const completedCount = updated.filter(m => m.status === "completed").length;

  if (completedCount === updated.length) {
    project.finalGoal.status = "available";
  } else {
    updated[completedCount].status = "available";
  }
}
```

---

# Core UX Rule

The map is navigation.

The milestone screen is the location.

The final goal is the climax.

The world complete screen is the celebration.

Do not put every option everywhere.

World Map should have:

- Journey status
- Milestones
- Character position
- Create milestone
- Enter world

Milestone World should have:

- Progress
- Checklist
- Rewards
- Resources
- Notes
- Bottom menu
- Complete milestone button

Final Goal should have:

- Final challenge
- Claim final stone
- Final reward

World Complete should have:

- Congratulations
- Journey summary
- Continue Your Legend

---

# Brand Style

Use these visual rules:

- Black backgrounds
- Black glass cards
- No white or gray flat backgrounds
- Purple neon glow
- Magenta energy
- Cyan highlights
- Emerald completion checkmarks
- Gold rewards
- Cinematic fantasy lighting
- RPG / adventure game feel

Brand colors:

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

---

# Asset Manifest Template

Create one manifest per world.

```js
export const crystalFrontierAssets = {
  map: {
    start: "/assets/project-worlds/crystal-frontier/map/state-00-start.png",
    m1Current: "/assets/project-worlds/crystal-frontier/map/state-01-m1-current.png",
    m1Complete: "/assets/project-worlds/crystal-frontier/map/state-02-m1-complete.png",
    m2Current: "/assets/project-worlds/crystal-frontier/map/state-03-m2-current.png",
    m2Complete: "/assets/project-worlds/crystal-frontier/map/state-04-m2-complete.png",
    m3Current: "/assets/project-worlds/crystal-frontier/map/state-05-m3-current.png",
    m3Complete: "/assets/project-worlds/crystal-frontier/map/state-06-m3-complete.png",
    m4Current: "/assets/project-worlds/crystal-frontier/map/state-07-m4-current.png",
    m4Complete: "/assets/project-worlds/crystal-frontier/map/state-08-m4-complete.png",
    m5Current: "/assets/project-worlds/crystal-frontier/map/state-09-m5-current.png",
    m5Complete: "/assets/project-worlds/crystal-frontier/map/state-10-m5-complete.png",
    finalCurrent: "/assets/project-worlds/crystal-frontier/map/state-11-final-current.png",
    worldComplete: "/assets/project-worlds/crystal-frontier/map/state-12-world-complete.png"
  },
  milestones: {
    m1: "/assets/project-worlds/crystal-frontier/milestones/milestone-01-world.png",
    m1Complete: "/assets/project-worlds/crystal-frontier/milestones/milestone-01-complete.png",
    m2: "/assets/project-worlds/crystal-frontier/milestones/milestone-02-world.png",
    m2Complete: "/assets/project-worlds/crystal-frontier/milestones/milestone-02-complete.png",
    m3: "/assets/project-worlds/crystal-frontier/milestones/milestone-03-world.png",
    m3Complete: "/assets/project-worlds/crystal-frontier/milestones/milestone-03-complete.png",
    m4: "/assets/project-worlds/crystal-frontier/milestones/milestone-04-world.png",
    m4Complete: "/assets/project-worlds/crystal-frontier/milestones/milestone-04-complete.png",
    m5: "/assets/project-worlds/crystal-frontier/milestones/milestone-05-world.png",
    m5Complete: "/assets/project-worlds/crystal-frontier/milestones/milestone-05-complete.png"
  },
  final: {
    finalGoal: "/assets/project-worlds/crystal-frontier/final/final-goal-world.png",
    finalAchieved: "/assets/project-worlds/crystal-frontier/final/final-goal-achieved.png",
    congratulations: "/assets/project-worlds/crystal-frontier/final/congratulations-world-complete.png"
  }
};
```

---

# Final Build Checklist

Before calling a world complete, confirm:

- Starter map exists.
- Every milestone has an interior screen.
- Every milestone has a completed screen.
- Map has a progression state after each completed milestone.
- Character moves forward on the map.
- Completed milestones show checkmarks.
- Current milestone is clearly marked.
- Locked milestones are visible but not active.
- Final goal unlocks only after all milestones are completed.
- Final stone collection screen exists.
- Mission complete map exists.
- Congratulations world complete page exists.
- All assets are saved in the correct folders.
- The app uses React state, not hardcoded screenshots only.
- The images provide atmosphere; React provides real interaction.

---

# The One Sentence Rule

Every project becomes a world, every milestone becomes a location, every completed milestone becomes a collected stone, and the final goal completes the world.

# Image Asset Index

This package contains the raw generated concept images from the Crystal Frontier demo flow. Codex should crop, rename, and organize them into the final `/public/assets/project-worlds/crystal-frontier/` folder.

## Recommended Mapping

| Final Asset Name | Use |
|---|---|
| map/state-00-start.png | Starter project world map |
| map/state-02-m1-complete.png | Map after milestone 1 complete |
| map/state-04-m2-complete.png | Map after milestone 2 complete/current milestone 3 |
| map/state-06-m3-complete.png | Map after milestone 3 complete |
| map/state-08-m4-complete.png | Map after milestone 4 complete |
| map/state-09-m5-progress.png | Map with milestone 5 in progress |
| map/state-10-m5-complete.png | Map with milestone 5 complete |
| map/state-11-final-goal.png | Final goal screen/world |
| map/state-12-world-complete.png | Mission/world complete map |
| milestones/milestone-01-crystal-pass.png | Milestone 1 interior |
| milestones/milestone-02-crystal-caverns.png | Milestone 2 interior |
| milestones/milestone-03-forgotten-quarry.png | Milestone 3 interior |
| milestones/milestone-04-ascension-cliffs.png | Milestone 4 interior |
| milestones/milestone-05-diamond-citadel.png | Milestone 5 interior |
| final/final-goal-achieved.png | Final stone claimed / final goal achieved |
| final/congratulations-world-complete.png | Congratulations world complete page |

## Cropping Guidance

- Keep full-screen versions for demo backgrounds.
- Crop milestone thumbnails from the right-side milestone cards when useful.
- Recreate important text in JSX instead of depending on generated text.
- Export final crops as `.webp` for app performance and keep original PNG/JPEG files in `/source-images/`.

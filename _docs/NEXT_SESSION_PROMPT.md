# NEXT SESSION — BUILD THE CINEMATIC 5 SHIFTS

## What to do

Read `THE_ULTIMATE_5SHIFTS_PROMPT.md` in full before writing a single line of code. That document is the complete implementation brief — it contains the vision, the full scene data for all 37 slides, the visual language for each shift, and the technical spec.

Then build it.

---

## Project

`c:\Users\howki\OneDrive\Desktop\Milestone Mapping App`  
React + Vite, mobile-first. Dev server: `npx vite --port 5173`

---

## The job

Replace every PNG slide image in the 5 Shifts training section with hand-crafted cinematic React scenes. No more `<img src="/shifts/..."`. Every "slide" becomes a living, animated scene.

**Files to create:**
- `src/components/training/CinematicScene.jsx` — renders scene objects with all 8 layout types
- `src/components/training/ParticleCanvas.jsx` — canvas ambient particle system (5 themes)

**Files to rewrite:**
- `src/data/shiftsData.js` — replace `slides: string[]` with `scenes: Scene[]` (full data in the brief)
- `src/components/training/ShiftCinematic.jsx` — drive scenes instead of images, use `scene.duration` for auto-advance
- `src/styles/training.css` — add all new animation keyframes from the brief

**Files that must NOT change:**
- All 5 game components (`IntroGame`, `ValuesGame`, `IdentityGame`, `MasksGame`, `MisconceptionsGame`)
- `ShiftsPage.jsx` hub
- `ShiftComplete.jsx` (unless adding the Shift 3 essence word bloom)
- `localStorage` key `shifts_state` — existing user progress must survive

---

## Start here

1. Read `THE_ULTIMATE_5SHIFTS_PROMPT.md`
2. Update `shiftsData.js` with the full scene data from the brief
3. Build `ParticleCanvas.jsx` (all 5 themes)
4. Build `CinematicScene.jsx` (all 8 scene types with animations)
5. Rewrite `ShiftCinematic.jsx` to use scenes + ParticleCanvas
6. Expand `training.css` with new keyframes
7. Run `npm run build` — must pass clean
8. Test all 5 shifts flow start to finish in the browser at localhost:5173

---

## Definition of done

Zero PNG `<img>` tags in the cinematic phase. Every shift has its own particle world. Every headline highlights key phrases in the shift's neon color. Tap anywhere fires a ripple at touch coordinates. The experience feels like a cinematic game — not a slideshow.

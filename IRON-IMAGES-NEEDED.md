# 🏋️ IRON IMAGES NEEDED — Art Generation Manifest (THE IRON / Alpha Mode)

> **For Codex (or any image-gen agent):** Every row below is one image THE IRON workout mode needs.
> Save each image at the **exact slug path** given (folders already exist under `public/assets/iron/`).
> The app is already wired: each image **appears automatically** the moment the file lands — no code changes.
> The creative brief is a starting point; the Style Bible below is law.

---

## 🔒 Style Bible (hard rules — this is NOT the neon cyberpunk palette)

THE IRON is a separate world from the rest of the app: **blackened steel · chalk dust · ember heat.**

**Palette — stay inside this:**

| Role | Colors |
|---|---|
| Steel bases | Gunmetal `#2E3238` → `#1A1D21` → near-black `#0D0E10` · Carbon `#232323` |
| Chalk | Chalk white `#E8E4DA` · warm bone `#F2EEE4` (dust, motion arrows, highlights) |
| Ember | Ember orange `#FF6A2B` · hot glow `#FF8A4D` (rim light, heat pools, accents) |
| Phase accents (phase banners only) | PRIME teal `#5FB8C9` · ADAPT ember `#FF6A2B` · SURGE violet `#9B6BFF` · COMPLETE gold `#E9C46A` |

**Look for EXERCISE images (the hybrid style, confirmed by Jon):**
Realistic 3D-render athlete — clear, anatomically correct form is the entire point —
graded into the IRON world: desaturated steel-grey skin/clothing tones, dark gym of
poured concrete and black iron behind, a low **ember rim light** from one side, and
**chalk-white motion arrows** (hand-drawn chalk line quality) tracing the movement path
of the bar/dumbbell/body. Think "training manual shot inside a midnight forge."

**Rules:**
1. **NO TEXT baked into images.** No words, letters, numbers, or UI overlays. Chalk ARROWS yes, chalk WORDS no.
2. **PNG, sRGB.** Badges/icons (marked 🔲) need **transparent backgrounds**. Exercise tiles and banners are full-bleed.
3. **Form must be textbook-correct** — flat back on deadlifts, knees tracking over toes, elbows where the how-to says. The image teaches; if in doubt, match the setup line given in the brief.
4. One consistent athlete/body type, camera height, and lighting across the whole exercise set — it must read as ONE manual.
5. Show the **key working position** (usually the bottom/mid-rep), with the chalk arrow showing the drive direction.
6. Keep the background calm and dark — the figure and the ember rim light carry the image.

**Sizes:**

| Code | Use | Size |
|---|---|---|
| EX | exercise tile (square) | 1024×1024 |
| HERO | signature-move card / phase banner | 1920×832 |
| BADGE 🔲 | icon, transparent | 512×512 |

---

## 🚨 P0 — The 55 exercise tiles (`public/assets/iron/exercises/`, spec **EX**)

The app shows these in the how-to panel of the live workout wizard, the mission briefing,
and the Program exercise library. Brief for every row: *realistic athlete demonstrating the
move per the pose note, steel-grey grade, dark iron gym, ember rim light, chalk motion arrow
tracing the movement path.*

| # | Slug | Move | Pose note (key position + arrow) |
|---|---|---|---|
| 1 | `goblet-squat.png` | Goblet Squat | Dumbbell held vertical at chest, bottom of squat, elbows inside knees; arrow: up through heels |
| 2 | `back-squat.png` | Back Squat | Barbell across upper back, thighs parallel, chest up; arrow: rising drive |
| 3 | `barbell-front-squat.png` | Barbell Front Squat | Bar racked on front delts, elbows high, deep squat; arrow: up |
| 4 | `bodyweight-squat.png` | Bodyweight Squat | Arms out front, thighs parallel, heels down; arrow: up |
| 5 | `jump-squat.png` | Jump Squat | Hands laced behind head, mid-air extension; arrow: explosive vertical |
| 6 | `reverse-lunge.png` | Reverse Lunge | One leg stepped back, front knee at 90°, torso tall; arrow: forward-up return |
| 7 | `bulgarian-split-squat.png` | Bulgarian Split Squat | Rear foot on bench, front leg deep; arrow: up |
| 8 | `barbell-deadlift.png` | Barbell Deadlift | Bar at shins, flat back, hips hinged; arrow: hips-through lockout path |
| 9 | `two-thirds-deadlift.png` | Two-Thirds Deadlift | Double-overhand grip, squat two-thirds down, shoulder blades back; arrow: pull to lockout |
| 10 | `trap-bar-deadlift.png` | Trap Bar Deadlift | Standing inside trap bar, flat back, gripping side handles; arrow: up |
| 11 | `trap-bar-deficit-deadlift.png` | Trap Bar Deficit Deadlift | Same but standing on a low plate/platform, deeper pull; arrow: up |
| 12 | `rack-pull-from-knee.png` | Rack Pull from Knee | Bar on rack pins at knee height, hinge grip; arrow: hips through |
| 13 | `barbell-romanian-deadlift.png` | Barbell Romanian Deadlift | Bar at thighs sliding down, knees soft, back flat, hamstrings loaded; arrow: hinge path |
| 14 | `kb-romanian-deadlift.png` | KB Romanian Deadlift | Kettlebell in both hands, hip hinge; arrow: hinge path |
| 15 | `db-romanian-deadlift.png` | DB Romanian Deadlift | Dumbbells at thighs, hip hinge; arrow: hinge path |
| 16 | `two-arm-kb-swing.png` | Two-Arm KB Swing | Kettlebell at chest height mid-swing, hips snapped; arrow: swing arc |
| 17 | `high-pull.png` | High Pull | Weight pulled explosively to chest height, elbows high; arrow: vertical pull |
| 18 | `glute-bridge.png` | Glute Bridge | On floor, hips at full lockout, squeeze; arrow: hips up |
| 19 | `barbell-glute-bridge.png` | Barbell Glute Bridge | Padded bar across hips, bridge lockout; arrow: hips up |
| 20 | `bodyweight-glute-bridge.png` | Bodyweight Glute Bridge | Floor bridge, hips high; arrow: hips up |
| 21 | `single-leg-hip-raise.png` | Single-Leg Hip Raise | One leg extended, hips at lockout; arrow: hips up |
| 22 | `plank.png` | Plank | Forearm plank, dead-straight line ear-to-heel; chalk line tracing the straight body |
| 23 | `feet-elevated-plank.png` | Feet-Elevated Plank | Plank with feet on bench; chalk line tracing the line |
| 24 | `mountain-climber.png` | Mountain Climber | Push-up position, one knee driven to chest; arrow: alternating knee drive |
| 25 | `hanging-knee-raise.png` | Hanging Knee Raise | Hanging from bar, knees curled to chest; arrow: knees up |
| 26 | `jumping-jack.png` | Jumping Jack | Mid-jump star position; arrows: out-and-in |
| 27 | `push-up.png` | Push-Up | Bottom of push-up, rigid body, elbows ~45°; arrow: press up |
| 28 | `flat-chest-press.png` | Flat Chest Press | Dumbbells at chest on flat bench; arrow: press up |
| 29 | `incline-db-chest-press.png` | Incline DB Chest Press | Incline bench, dumbbells at upper chest; arrow: press up-and-in |
| 30 | `low-incline-db-press.png` | Low-Incline DB Press | Low incline bench, dumbbells low; arrow: press |
| 31 | `bench-press.png` | Bench Press | Barbell touching chest, wrists stacked; arrow: press |
| 32 | `dumbbell-squeeze-press.png` | Dumbbell Squeeze Press | Dumbbells pressed together over chest; arrows: inward squeeze + press |
| 33 | `dumbbell-fly.png` | Dumbbell Fly | Arms wide, slight elbow bend, chest stretch; arrow: hugging arc |
| 34 | `db-overhead-press.png` | DB Overhead Press | Standing, dumbbells at shoulders; arrow: press overhead |
| 35 | `barbell-push-press.png` | Barbell Push Press | Bar at collarbone, slight knee dip; arrow: leg-drive press |
| 36 | `one-arm-barbell-press.png` | One-Arm Barbell Press | Barbell gripped mid-shaft one-handed, free arm out for balance; arrow: press to sky *(The Spearpoint's movement)* |
| 37 | `shoulder-to-shoulder-press.png` | Shoulder-to-Shoulder Press | Bar resting on one shoulder, hands together mid-bar; arrow: arc overhead to other shoulder *(The Crown Press's movement)* |
| 38 | `lateral-raise.png` | Lateral Raise | Dumbbells raised to shoulder height, slight elbow bend; arrow: out-and-up |
| 39 | `chin-up.png` | Chin-Up | Underhand grip, chin over bar; arrow: pull up |
| 40 | `pull-up.png` | Pull-Up | Overhand grip, mid-pull; arrow: pull up |
| 41 | `weighted-chin-up.png` | Weighted Chin-Up | Chin-up with dumbbell between ankles or belt; arrow: pull up |
| 42 | `barbell-bent-over-row.png` | Barbell Bent-Over Row | Hinged 45°, bar rowed to sternum, flat back; arrow: row path |
| 43 | `single-arm-db-row.png` | Single-Arm DB Row | Knee and hand on bench, dumbbell rowed to hip; arrow: row |
| 44 | `inverted-row.png` | Inverted Row | Under a bar in the rack, body straight, chest to bar; arrow: pull |
| 45 | `seated-cable-row.png` | Seated Cable Row | Seated at cable station, handle to torso, chest proud; arrow: row |
| 46 | `upright-row.png` | Upright Row | Dumbbells pulled up along the body to chest, elbows high; arrow: vertical |
| 47 | `face-pull.png` | Face Pull | Rope pulled to the face, elbows wide and high; arrow: to forehead |
| 48 | `rear-delt-fly.png` | Rear Delt Fly | Hinged forward, dumbbells swept wide; arrow: reverse arc |
| 49 | `dumbbell-shrug.png` | Dumbbell Shrug | Heavy dumbbells at sides, shoulders to ears; arrow: shrug up |
| 50 | `biceps-curl.png` | Biceps Curl | Dumbbells mid-curl, elbows pinned; arrow: curl arc |
| 51 | `barbell-curl.png` | Barbell Curl | Barbell mid-curl; arrow: curl arc |
| 52 | `hammer-curl.png` | Hammer Curl | Neutral-grip dumbbells mid-curl; arrow: curl arc |
| 53 | `reverse-curl.png` | Reverse Curl | Overhand-grip curl; arrow: curl arc |
| 54 | `calf-raise.png` | Calf Raise | On balls of feet at full height, weight held; arrow: heels up |
| 55 | `seated-calf-raise.png` | Seated Calf Raise | Seated, weight across knees, heels raised; arrow: heels up |

---

## ⭐ P1 — Signature move hero cards (`public/assets/iron/signature/`, spec **HERO**)

The program's three named lifts. Same athlete and world as the exercise set, but **cinematic**:
wider frame, deeper shadows, stronger ember glow — these are boss weapons, not manual pages.
Form still textbook (the movements are in parentheses).

| Slug | Move | Brief |
|---|---|---|
| `spearpoint.png` | The Spearpoint *(one-arm barbell overhead press)* | Athlete pressing a single barbell one-handed to the sky like planting a spear, free arm extended for balance, chalk dust drifting through the ember rim light. The wobble of the bar hinted by twin chalk ghost-lines. |
| `crown-press.png` | The Crown Press *(shoulder-to-shoulder press)* | Bar resting on one shoulder mid-arc overhead toward the other — the gesture of crowning oneself. Chalk arc traces the crown path over the head. |
| `kingmaker.png` | The Kingmaker *(double-overhand two-thirds deadlift)* | Athlete two-thirds down on a heavy bar, double-overhand, coiled to drive; low ember light like a forge floor. Chalk arrow: floor to lockout. "Crowns are earned from the floor up." |

---

## 🗺 P2 — Phase banners (`public/assets/iron/phases/`, spec **HERO**)

One wide banner per campaign phase, for the Program console phase cards and zone gates.
Same steel gym world; each banner is tinted by its **phase accent** in the lighting.
No people required — environment + mood. Keep the center-bottom third calm (titles overlay).

| Slug | Phase | Accent | Brief |
|---|---|---|---|
| `prime.png` | PRIME — the insulin reset | teal `#5FB8C9` | A dark iron gym at dawn: kettlebells and dumbbells racked in rows, cool teal light washing through high windows, chalk dust hanging — the quiet before the first circuit. |
| `adapt.png` | ADAPT — density, the drive engine | ember `#FF6A2B` | A loaded barbell on the floor mid-gym, plates stacked beside a big wall clock, ember light pooling — a race against minutes. |
| `surge.png` | SURGE — the growth burn | violet `#9B6BFF` | A bench and bar under slow violet light, motion-blur ghost of a rep descending — time stretched, the slow fire. |
| `complete.png` | COMPLETE — all systems, one week | gold `#E9C46A` | A power rack at the center of the gym lit like a summit shrine, gold ember light from below, four training implements arrayed (kettlebell, dumbbell, plate, bar). |

---

## 🔩 P3 — Block-kind + fridge shelf badges (`public/assets/iron/icons/`, spec **BADGE 🔲**)

Flat chalk-drawn iconography, single chalk-white stroke style on transparency, faint ember glow.
(These currently render as glyph characters; badges upgrade the session map and fridge shelves.)

| Slug | Meaning | Brief |
|---|---|---|
| `block-circuit.png` | circuit block | circular arrow of chalk with three small weight dots on the ring |
| `block-straight.png` | straight sets | one heavy horizontal bar stroke, chalk |
| `block-density.png` | density run | a stopwatch outline with a plate inside |
| `block-tempo.png` | tempo/cadence | a slow sine wave with rep-count tick marks |
| `block-totalreps.png` | total-reps count | a tally-mark cluster (four strokes + slash) |
| `shelf-protein.png` | fridge · proteins | chalk steak/drumstick outline |
| `shelf-greenwall.png` | fridge · the green wall | chalk broccoli/leaf cluster |
| `shelf-fuel.png` | fridge · carbs/fuel | chalk sweet potato + rice bowl |
| `shelf-fats.png` | fridge · fats | chalk avocado half + oil drop |

---

## Wiring notes (already done in code — for reference)

- Exercise tiles resolve by slug from the exercise's canonical name: [ExerciseImg.jsx](src/components/workout/alpha/ExerciseImg.jsx) → `/assets/iron/exercises/<kebab-name>.png`; lore names (The Spearpoint / Crown Press / Kingmaker) resolve to `/assets/iron/signature/<id>.png`.
- Missing files render nothing (graceful `onError`), so images can land incrementally in any order.
- Phase banners and badges are P2/P3: wire-in happens when the art exists (Program console phase cards / session map / fridge shelves).

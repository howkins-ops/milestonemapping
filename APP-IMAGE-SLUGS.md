# 🎴 APP IMAGE SLUGS — Master Chapter & Card-Art Manifest

> Companion to `IMAGES_NEEDED.md` (the 136-slug master), `IRON-IMAGES-NEEDED.md` (exercises + foods),
> `ALPHA-IMAGES-NEEDED.md` (boss portraits), and `city/IMAGES_CITY.md` (city environment art).
> This file collects **every titled chapter/stage/district header + card art across the app** into one
> Codex batch. Save each PNG at the **exact slug path** in its section header.

## How the art lands (zero code changes)
Every surface below either already renders its art through a drop-in component, or will the moment
the file exists — the component hides itself until then (`onError`), so the current text/glyph layout
stays intact meanwhile. Three resolvers:
- **Exercises** → [ExerciseImg.jsx](src/components/workout/alpha/ExerciseImg.jsx) → `/assets/iron/exercises/<slug>.png`
- **Foods** → [FoodImg.jsx](src/components/workout/alpha/FoodImg.jsx) → `/assets/iron/foods/<slug>.png`
- **Chapters / districts / cards** → [ChapterArt.jsx](src/components/shared/ChapterArt.jsx) → `/assets/<folder>/<slug>.png`

## Style
Match each feature's existing world, not one global look:
- **THE IRON / Alpha** — blackened steel, chalk dust, ember heat (see IRON Style Bible).
- **Alchemist / MapQuest City** — neon cyberpunk (see IMAGES_NEEDED Style Bible).
- **The Crossing / Shadow** — dark, cinematic, low-key; a single accent light.
Titles overlay in-app, so keep the lower third calm and leave headroom.

---

## 📦 Complete Codex batch (generate all of these)

| Set | Path | Count | Palette |
|---|---|---|---|
| Exercise tiles | `iron/exercises/` | 100 | **brand** — steel/chalk/ember (see `IRON-IMAGES-NEEDED.md` Style Bible) |
| **Food ingredients** | `iron/foods/` | **67** | ⚠️ **NO brand colors — real photos, true natural food color, plain white/transparent bg** (see `IRON-IMAGES-NEEDED.md` P0.5) |
| Book of Iron chapters | `iron/book/` | 9 | brand — steel/chalk/ember |
| Alpha journey stages | `iron/journey/` | 11 | brand — steel/chalk/ember |
| Myth-boss cards | `iron/bosses/` | 11 | brand — steel/chalk/ember |
| City district badges | `city/` (`district-*`) | 16 | brand — neon cyberpunk |
| City quarter banners | `city/` (`quarter-*`) | 6 | brand — neon cyberpunk |
| Alchemist chapter cards | `map-quest/` (`chapter-*-card`) | 22 | brand — neon cyberpunk |
| Crossing phases + archetypes | `crossing/` | 9 + 4 | dark cinematic |
| Shadow depths + chambers | `shadow/depths/`, `shadow/chambers/` | 5 + 9 | dark cinematic |
| 5 Shifts cards | `shifts/` | 5 | brand |
| Hometown stations | `city/hometown/` | 4 | dark cinematic |
| Mask portraits + critics | `city/masks/`, `city/masks/critics/` | 10 + 8 | brand — neon |
| nav-city icon | `nav/` | 1 | brand |

**The only palette exception is the food photos.** Everything else keeps its feature's brand look —
the food set is deliberately real/photographic so meals read as actual food on the plate.

---

## 🔁 Cross-referenced (specced elsewhere — generate from those files)
- **IRON exercises — 100** (`public/assets/iron/exercises/`) → `IRON-IMAGES-NEEDED.md` P0 (rows 1–100).
- **Fridge foods — 67** (`public/assets/iron/foods/`) → `IRON-IMAGES-NEEDED.md` P0.5.
- **Alpha myth-boss portraits — 11** (`public/assets/alpha/bosses/`) → `ALPHA-IMAGES-NEEDED.md`.
- **City environment (sky/skyline/plaza/guide)** → `city/IMAGES_CITY.md`.

---

## ⭐ P1 — Chapter/header art for the WIRED surfaces (do first)

### THE IRON — Book of Iron chapters (`public/assets/iron/book/`, spec **BADGE 🔲**, 9)
Chapter-plate emblems for [BookOfIron.jsx](src/components/workout/alpha/BookOfIron.jsx). Chalk emblem on blackened steel, ember rim.

| Slug | Chapter | Brief |
|---|---|---|
| `the-creed.png` | The Creed | A single 45-lb plate stamped like a seal, chalk cross-mark |
| `the-four-phases.png` | The Four Phases | Four ascending chalk bars, each a shade hotter toward ember |
| `the-eating-equation.png` | The Eating Equation | A chalk balance scale: a drumstick vs. a clock |
| `the-hormone-codex.png` | The Hormone Codex | A chalk molecule ring over a steel tablet |
| `busted-myths.png` | Busted Myths | A cracked chalk skull/mask splitting apart |
| `wisdom-scrolls.png` | Wisdom Scrolls | A rolled steel scroll bound in chalk cord |
| `benchmark-ladders.png` | Benchmark Ladders | A chalk ladder rising into ember light |
| `the-trait-tree.png` | The Trait Tree | A bare iron tree with ember buds |
| `iron-speak.png` | Iron Speak | An open chalk-lettered book on a plate |

### THE IRON — Alpha journey stages (`public/assets/iron/journey/`, spec **HERO**, 11)
Hero'­s-journey stage banners for the campaign map. Steel gym world, mood shifts per stage.

| Slug | Stage |
|---|---|
| `the-ordinary-world.png` | The Ordinary World |
| `the-call.png` | The Call |
| `the-refusal.png` | The Refusal |
| `the-mentor.png` | The Mentor |
| `crossing-the-threshold.png` | Crossing the Threshold |
| `the-road-of-trials.png` | The Road of Trials |
| `the-approach.png` | The Approach |
| `the-ordeal.png` | The Ordeal |
| `the-reward.png` | The Reward |
| `the-road-back.png` | The Road Back |
| `return-with-the-elixir.png` | Return with the Elixir |

### MapQuest City — district badges (`public/assets/city/`, spec **BADGE 🔲**, 16)
District medallions for [DistrictCard.jsx](src/components/city/DistrictCard.jsx) / DistrictSheet (currently glyph fallback). Neon-cyberpunk crest per district.

| Slug | District | Motif |
|---|---|---|
| `district-alchemist-spire.png` | Alchemist Spire | a neon tower/retort |
| `district-identity-forge.png` | Identity Forge | a masked face over an anvil |
| `district-vision-tower.png` | Vision Tower | an eye/telescope beam |
| `district-the-academy.png` | The Academy | five rising steps (the 5 Shifts) |
| `district-war-rooms.png` | The War Rooms | a battle map with pins |
| `district-daily-nexus.png` | Daily Nexus | a five-point command star |
| `district-war-council.png` | War Council | a round table / weekly ring |
| `district-the-vault.png` | The Vault | a glowing vault door |
| `district-shadow-sanctum.png` | Shadow Sanctum | a descending stair into dark water |
| `district-pressure-forge.png` | Pressure Forge | a pressure gauge in flame |
| `district-cup-springs.png` | The Cup Springs | an overflowing cup/fountain |
| `district-blaze-lab.png` | B.L.A.Z.E. Lab | a neon flame in a flask |
| `district-guild-quarter.png` | Guild Quarter | a crest of linked figures |
| `district-hall-of-champions.png` | Hall of Champions | a fire leaderboard/trophy |
| `district-formula-athenaeum.png` | Formula Athenaeum | a pillared library glyph |
| `district-observatory.png` | The Observatory | a dome + constellation |

### Alchemist — remaining chapter cards (`public/assets/map-quest/`, spec **CARD**, 22)
Ch.1 (`chapter-anchor-card.png`) and Ch.6 (`chapter-shadow-card.png`) already exist; these fill the rest.
Wire pattern already supported in [questChapters.js](src/components/map-quest/questChapters.js) via `cardImage`.

| Slug | # · Chapter |
|---|---|
| `chapter-the-signal-card.png` | 2 · The Signal |
| `chapter-the-fixer-card.png` | 3 · The Fixer |
| `chapter-the-holo-map-card.png` | 4 · The Holo-Map |
| `chapter-the-gate-card.png` | 5 · The Gate |
| `chapter-the-crystal-shop-card.png` | 7 · The Crystal Shop |
| `chapter-the-display-case-card.png` | 8 · The Display Case |
| `chapter-the-thirst-card.png` | 9 · The Thirst |
| `chapter-the-merchants-dream-card.png` | 10 · The Merchant's Dream |
| `chapter-the-challenger-card.png` | 11 · The Challenger |
| `chapter-the-forge-card.png` | 12 · The Forge |
| `chapter-the-neon-chapel-card.png` | 13 · The Neon Chapel |
| `chapter-the-dead-server-desert-card.png` | 14 · The Dead-Server Desert |
| `chapter-the-data-spire-card.png` | 15 · The Data-Spire |
| `chapter-the-recursion-card.png` | 16 · The Recursion |
| `chapter-the-diagnostic-card.png` | 17 · The Diagnostic |
| `chapter-the-ruins-district-card.png` | 18 · The Ruins District |
| `chapter-the-garden-server-card.png` | 19 · The Garden Server |
| `chapter-the-black-market-card.png` | 20 · The Black Market |
| `chapter-the-citadel-card.png` | 21 · The Citadel |
| `chapter-becoming-the-signal-card.png` | 22 · Becoming the Signal |
| `chapter-the-vault-card.png` | 23 · The Vault |
| `chapter-the-return-card.png` | 24 · The Return |

---

## 🗺 P2 — Chapter/header art (manifest-only, wire when the art exists)

### THE IRON — myth-boss cards (`public/assets/iron/bosses/`, spec **HERO**, 11)
Busted-myth bosses for the Book of Iron. Each a chalk-and-ember monster embodying a diet myth.

| Slug | Boss |
|---|---|
| `the-morning-warden.png` | The Morning Warden (breakfast myth) |
| `the-grazer-king.png` | The Grazer King (6 small meals) |
| `the-six-plate-hydra.png` | The Six-Plate Hydra (meal frequency) |
| `the-gatekeeper-of-thirty.png` | The Gatekeeper of Thirty (30g protein cap) |
| `the-midnight-glutton.png` | The Midnight Glutton (no eating after 8) |
| `the-dawn-herald.png` | The Dawn Herald (fasted cardio) |
| `the-treadmill-wraith.png` | The Treadmill Wraith (cardio for fat loss) |
| `the-feather-duke.png` | The Feather Duke (light weights, high reps) |
| `the-snake-oil-peddler.png` | The Snake-Oil Peddler (supplements) |
| `the-sculptors-lie.png` | The Sculptor's Lie (spot reduction) |
| `the-empty-tank.png` | The Empty Tank (train harder = better) |

### MapQuest City — quarter banners (`public/assets/city/`, spec **HERO**, 6)
| Slug | Quarter |
|---|---|
| `quarter-the-spire.png` | THE SPIRE |
| `quarter-neon-heights.png` | NEON HEIGHTS |
| `quarter-the-grid.png` | THE GRID |
| `quarter-the-underglow.png` | THE UNDERGLOW |
| `quarter-the-commons.png` | THE COMMONS |
| `quarter-the-archive-row.png` | THE ARCHIVE ROW |

### The Crossing — onboarding phases (`public/assets/crossing/`, spec **HERO**, 8)
Dark cinematic, one ember accent. Titles overlay — keep lower third calm.

| Slug | Phase |
|---|---|
| `ignition.png` | Ignition — from the ashes rises the builder |
| `the-mirror.png` | The Mirror |
| `the-wall.png` | The Wall |
| `the-private-page.png` | The Private Page (the cost) |
| `choose-your-path.png` | Choose Your Path |
| `your-first-7-days.png` | Your First 7 Days (the map) |
| `the-vow.png` | The Vow |
| `first-win.png` | First Win |
| `you-crossed.png` | You Crossed (the torch) |

### The Crossing — archetype cards (`public/assets/crossing/`, spec **CARD**, 4)
| Slug | Archetype |
|---|---|
| `archetype-the-builder.png` | THE BUILDER |
| `archetype-the-closer.png` | THE CLOSER |
| `archetype-the-phoenix.png` | THE PHOENIX |
| `archetype-the-seeker.png` | THE SEEKER |

### Shadow Work "The Descent" — depths (`public/assets/shadow/depths/`, spec **HERO**, 5)
| Slug | Depth |
|---|---|
| `the-still-waters.png` | Depth I — The Still Waters |
| `the-undertow.png` | Depth II — The Undertow |
| `the-old-stories.png` | Depth III — The Old Stories |
| `the-furnace.png` | Depth IV — The Furnace |
| `the-moon-gate.png` | Depth V — The Moon Gate |

### Shadow Work — chambers (`public/assets/shadow/chambers/`, spec **BADGE 🔲**, 9)
| Slug | Chamber |
|---|---|
| `the-burn.png` | The Burn |
| `shadow-alchemist.png` | Shadow Alchemist |
| `hold-the-line.png` | Hold the Line |
| `swamp-valve.png` | Swamp Valve |
| `reframe-forge.png` | Reframe Forge |
| `inner-child.png` | Inner Child |
| `self-compassion.png` | Self-Compassion |
| `grounding.png` | Grounding |
| `integration.png` | Integration |

### The 5 Shifts — training cards (`public/assets/shifts/`, spec **CARD**, 5)
| Slug | Shift |
|---|---|
| `the-5-simple-shifts.png` | Intro — The 5 Simple Shifts |
| `integrity.png` | Shift 1 — Integrity |
| `identity.png` | Shift 2 — Identity |
| `masks-and-essence.png` | Shift 3 — Masks & Essence |
| `break-the-myths.png` | Shift 4 — Break the Myths |

### Hometown journey — stations (`public/assets/city/hometown/`, spec **HERO**, 4)
| Slug | Station |
|---|---|
| `the-restless-morning.png` | The Restless Morning (your house) |
| `the-letter.png` | The Letter |
| `the-old-workshop.png` | The Old Workshop |
| `the-send-off.png` | The Send-Off (the Father) |

---

## 🔩 P3 — Card art & loose ends

### Mask Encounters — boss portraits (`public/assets/city/masks/`, spec **HERO**, dark + evolved)
Currently procedural sprites (`MaskSprite.jsx`); these upgrade the Codex/finale. Dark form → evolved form.

| Slug | Mask (dark → evolved) |
|---|---|
| `the-broke-king.png` / `the-sovereign.png` | THE BROKE KING → THE SOVEREIGN |
| `the-addict-saint.png` / `the-unshaken-saint.png` | THE ADDICT SAINT → THE UNSHAKEN SAINT |
| `the-silent-prophet.png` / `the-herald.png` | THE SILENT PROPHET → THE HERALD |
| `the-raging-victim.png` / `the-guardian.png` | THE RAGING VICTIM → THE GUARDIAN |
| `the-naive-warrior.png` / `the-commander.png` | THE NAIVE WARRIOR → THE COMMANDER |

### Mask Encounters — wild critics (`public/assets/city/masks/critics/`, spec **BADGE 🔲**, 8)
`the-snooze.png` · `the-scroll.png` · `the-comparison.png` · `the-imposter.png` · `the-perfectionist.png` · `the-tomorrow-man.png` · `the-people-pleaser.png` · `the-cynic.png`

### Reserved card sets (`public/assets/ranks/`, `public/assets/trainers/`)
Empty folders already scaffolded. Fill when the Citizen-card rank sigils and trainer portraits are prioritized.

### Loose nav icon (`public/assets/nav/`)
| Slug | Use |
|---|---|
| `nav-city.png` | the City bottom-nav tab (Phase-2 nav; matches the other `nav-*.png`) |

---

## Wiring status
- **Live now**: IRON exercises, Fridge foods (plate/grocery/shelves). Drop PNGs in and they appear.
- **Ready to wire** (one-line `ChapterArt`/`cardImage` add per surface): Book of Iron, Alpha journey, City districts, Alchemist chapters.
- **Manifest-only** until wired: Crossing, Shadow, 5 Shifts, Hometown, myth bosses, quarters, masks, ranks, trainers.

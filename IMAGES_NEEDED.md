# 🎨 IMAGES NEEDED — Art Generation Manifest

> **For Codex (or any image-gen agent):** Every row below is one image the app needs.
> Save each image at the **exact slug path** given (folders already exist under `public/`).
> The **creative brief is a starting point — use your imagination.** Go cinematic, go weird,
> go beautiful. The only hard rules are the Style Bible below.

---

## 🔒 Style Bible (hard rules)

**Palette — stay inside this. Never introduce off-brand colors.**

| Role | Colors |
|---|---|
| Core neons | Electric Cyan `#00F0FF` · Neon Magenta `#D11EFF` · Hot Pink `#FF3EDB` · Aqua Mint `#00FFBF` · Soft Ice White `#F2F0F4` |
| Dark bases | Pure Black `#000000` · Deep Void `#05000A` · Midnight Navy `#070B1F` · Dark Purple Shadow `#120022` · Deep Indigo `#10104A` |
| Glow accents | Phoenix Purple `#7B2CFF` · Royal Violet `#5B00FF` · Cyber Blue `#007BFF` · Success Gold `#FFD166` · Victory Amber `#FFB000` |

**Mood:** AAA cyberpunk-mystic. Neon light on deep black. Cinematic rim-light, volumetric glow,
soft fog. Epic but *warm and inviting* — this is a self-mastery game, not horror. No gore, no dread.

**Rules:**
1. **NO TEXT baked into images.** No words, letters, numbers, or UI. The app renders all text.
2. **PNG, sRGB.** Badges/icons need **transparent backgrounds** (marked 🔲). Cards/heroes are full-bleed.
3. Match the existing art: look at `public/assets/shadow/gate-temple.jpg`, `public/game/*.jpg`,
   `public/assets/milestone-world/*.png`, `public/assets/map-quest/chapter-anchor-card.png` for the house style.
4. Keep each **set** internally consistent (same camera feel, lighting, and level of detail within a section).
5. Leave the center-bottom third of CARD images relatively calm — UI titles overlay there.

**Standard sizes** (use these unless a row says otherwise):

| Code | Use | Size |
|---|---|---|
| CARD | portrait tile/card background | 1024×1536 |
| TILE | square card/thumbnail | 1024×1024 |
| HERO | wide page banner | 1920×832 |
| BG | full-screen backdrop | 1920×1080 |
| BADGE 🔲 | badge/icon, transparent | 512×512 |

---

## 🚨 P0 — Referenced by code but missing on disk (drop-in, zero wiring)

| Slug | Where it's used | Spec | Creative brief |
|---|---|---|---|
| `public/assets/dashboard/quote-scroll-bg.png` | Daily-quote panel on the dashboard (`appAssets.dashboard.quoteScrollBg`, [milestoneWorldAssets.js:110](src/lib/milestoneWorldAssets.js#L110)) | wide panel ~1600×520 | An ancient scroll reimagined as cyberpunk artifact — holographic parchment unrolled, edges dissolving into cyan data-particles, faint gold `#FFD166` light across the writing surface. Calm center (quote text overlays it). |

---

## 🗺️ P1 — Inner Alchemist Quest: 18 missing chapter cards

Only chapters 1 & 6 have card art today; the other 18 render as plain gradient stones
([MapQuestMap.jsx:110-160](src/components/map-quest/MapQuestMap.jsx#L110-L160)).
**Spec: CARD (1024×1536)** matching the style/composition of the two existing cards in `public/assets/map-quest/`.
Wiring: add a `cardImage:` line per chapter in [questChapters.js](src/components/map-quest/questChapters.js).

♻️ **Reuse first:** `chapter-alchemy-card.png` and `chapter-integration-card.png` already sit unused in
`public/assets/map-quest/` — consider repurposing them for Ch 12 (The Recursion, where the Alchemist appears) and Ch 20 (The Return) before generating new ones.

| Slug (`public/assets/map-quest/…`) | Ch | Creative brief (from the chapter's world) |
|---|---|---|
| `chapter-signal-card.png` | 2 · The Signal | A glitch-dream: a colossal vault door flickering in and out of static above a grid of grey 9-to-5 cubicles, one cyan signal-beam cutting through. |
| `chapter-fixer-card.png` | 3 · The Fixer | A back-alley data-den — dripping neon signage, cable vines, a hooded Anchor mentor at a bar of glowing terminals. |
| `chapter-holo-map-card.png` | 4 · The Holo-Map | A room-filling hologram of a money-map: golden rivers of light flowing between floating islands of commerce, mentor's hand mid-gesture. |
| `chapter-gate-card.png` | 5 · The Gate | A monolithic gate that only opens to a spoken vow — soundwave ripples in magenta hitting the door; burning ships in the harbor far below. |
| `chapter-challenger-card.png` | 7 · The Challenger | A sparring dojo of light — the Challenger mentor tossing back a shattered mirror labeledless (victim reflection breaking into at-cause light). |
| `chapter-forge-card.png` | 8 · The Forge | A grit forge where promises are the fuel — hammers striking a glowing anvil that sparks tiny golden contracts of light. |
| `chapter-neon-chapel-card.png` | 9 · The Neon Chapel | A chapel of beautiful escapes — stained-glass windows made of vending-machine light, slot-glow and bottle-shine, one pew facing a soft pink altar. The Addict Saint's silhouette, haloed. |
| `chapter-desert-card.png` | 10 · Dead-Server Desert | Endless dunes of dead server racks under two broken clock-moons; heat shimmer in cyan, a lone walker's long shadow. Patience is the crossing. |
| `chapter-data-spire-card.png` | 11 · The Data-Spire | A spire built of unsent messages and muted microphones, drafts orbiting like paper birds; one window glows white where a voice is about to break out. |
| `chapter-recursion-card.png` | 12 · The Recursion | A looping Escher chamber — the same staircase repeating into itself, each loop slightly more worn; a cloaked Alchemist glimpsed once, out of pattern. |
| `chapter-diagnostic-card.png` | 13 · The Diagnostic | A floating compass of missing pieces — a radial instrument with one dark, keyed slot pulsing; diagnostic beams sweeping a life laid out like a circuit board. |
| `chapter-ruins-card.png` | 14 · The Ruins District | The ruins of what happened — collapsed neon district, and in its center an intact throne (the Throne of Responsibility) lit in majesty purple `#7B2CFF`. |
| `chapter-garden-card.png` | 15 · The Garden Server | A hidden green node in the black grid — bioluminescent garden growing through server racks, aqua-mint `#00FFBF` fireflies, the Heartkeeper tending light. |
| `chapter-black-market-card.png` | 16 · The Black Market | Stalls of false upgrades — counterfeit wings, bootleg halos, shortcut chips — all slightly *off*; one clean unlit path exits through the middle. |
| `chapter-citadel-card.png` | 17 · The Citadel | All five shadows converge — a citadel throne room with five towering masked silhouettes circling a small, unbowed figure of light. |
| `chapter-becoming-signal-card.png` | 18 · Becoming the Signal | The storm — a figure standing arms-open on a spire as lightning and data-wind pass *through* them; they are becoming the broadcast. |
| `chapter-vault-card.png` | 19 · The Vault | The vault finally open… onto a mirror. Gold light spills out; the reflection is the Day-One self and the now-self meeting eyes. |
| `chapter-return-card.png` | 20 · The Return | Home, now legible — the same city from chapter 1 but readable, warm; a phoenix rising over it in gold `#FFB000` and cyan, elixir light carried in hand. |

---

## 🏙️ P1 — Seeker's City: 11 district cards

Each district card currently shows only an emoji on a gradient
([SeekerCity.jsx:292-393](src/components/game/SeekerCity.jsx#L292-L393)).
**Spec: TILE (1024×1024)** — one iconic *building* per district, same skyline world, same camera angle across the set.

| Slug (`public/assets/city/…`) | District | Creative brief |
|---|---|---|
| `district-anchor-house.png` | Anchor House ⚓ | A lighthouse-lounge hybrid anchored in bedrock while the city floats around it — warm gold interior light, cyan mooring-chains of light. |
| `district-shadow-market.png` | Shadow Market 🌑 | A bazaar in permanent eclipse — stalls lit only by magenta lanterns, masks hanging like windchimes. |
| `district-identity-forge.png` | Identity Forge 🔮 | A crucible-tower where silhouettes walk in one door and walk out glowing differently — molten violet pour-lines down its sides. |
| `district-the-academy.png` | The Academy 🌀 | A spiral campus of floating lecture-rings, knowledge streaming upward as light-glyphs. |
| `district-vision-tower.png` | Vision Tower 👁️ | The tallest spire, crowned with a lens-observatory projecting a future skyline as a hologram above the clouds. |
| `district-war-rooms.png` | War Rooms 🗺️ | A bunker-penthouse of strategy — table-maps glowing like circuit boards through armored glass. |
| `district-daily-nexus.png` | Daily Nexus ⚡ | Grand-central-station of habit — turnstiles of light, morning sun and evening moon on opposite concourses. |
| `district-shadow-lab.png` | Shadow Lab 🩸 | A clean, humming laboratory where shadow-samples float in containment fields — clinical cyan on deep purple, curious not scary. |
| `district-the-vault.png` | The Vault 💎 | A diamond-cut treasury half-buried in the block, seams leaking gold light; door shaped like a keyhole for a key that is a person. |
| `district-war-council.png` | War Council 📡 | A ring of antenna-thrones on a rooftop, holographic allies flickering into their seats. |
| `district-stats-nexus.png` | Stats Nexus 📊 | A data-cathedral — stained glass made of ascending bar-charts, XP light flowing through the floor. |

---

## 🚪 P1 — Anxiety SOS: 6 door cards + hero

The emergency hub renders 6 emoji tiles ([AnxietySOS.jsx:23-54](src/components/ui/AnxietySOS.jsx#L23-L54)).
**Spec: CARD** per door. These must read *instantly calming* — softer glow, more fog, less contrast than the rest of the app. Honor each door's accent color.

| Slug (`public/assets/sos/…`) | Door | Accent | Creative brief |
|---|---|---|---|
| `door-ride-the-wave.png` | Ride the Wave (Anxiety) | `#00F0FF` | A vast, slow bioluminescent ocean wave you *surf gently* — not a crash, a carry. |
| `door-anchor-down.png` | Anchor Down (Panic · Grounding) | `#FACC15` | A glowing anchor sinking through calm dark water to touch bedrock; five points of gold light (5-4-3-2-1 senses). |
| `door-pressure-chamber.png` | Pressure Chamber (Anger) | `#FF3B5C` | A sealed chamber venting red steam through elegant release valves — pressure leaving *safely*, turning pink then cool. |
| `door-drain-the-swamp.png` | Drain the Swamp (Stress) | `#00FFBF` | Murky swamp water spiraling down a luminous drain, clear aqua water rising behind it, fireflies returning. |
| `door-box-breathing.png` | Box Breathing (Breathing) | `#7B2CFF` | A perfect square of soft violet light breathing in slow orbit — one glowing tracer traveling its edges through fog. |
| `door-self-compassion.png` | Self-Compassion Break (Overwhelm) | `#FF3EDB` | Two hands of light cradling a small warm flame; pink aurora, falling embers that never burn. |
| `sos-hero.png` | Hub backdrop "You're safe. Breathe." | mixed | HERO — a quiet sanctuary antechamber: six faint doorways of colored light in mist. Very dark, very gentle. |

---

## 🥊 P1 — Anger Gym: 4 game cards + hero

Cards are gradient-only ([AngerGymPage.jsx:26-68](src/components/anger/AngerGymPage.jsx#L26-L68)).
**Spec: CARD.** Energy here is *powerful and disciplined*, not rageful.

| Slug (`public/assets/anger/…`) | Game | Accent | Creative brief |
|---|---|---|---|
| `card-pressure-forge.png` | Pressure Forge (featured) | `#FFB000` | A titanic forge where raw red pressure is hammered into amber tools — sparks arcing in slow motion. |
| `card-trigger-popper.png` | Trigger Popper | `#FF3B5C` | Neon trigger-bubbles floating in a dark arcade void, one mid-pop into harmless confetti of light. |
| `card-swamp-valve.png` | Swamp Valve | `#00FFBF` | An industrial valve-wheel half-sunk in a glowing swamp, turned by hand, releasing pressure as aqua mist. |
| `card-storm-captain.png` | Storm Captain | `#00F0FF` | A small boat's captain steady at the wheel inside a huge cyan storm — calm posture, wild sea. |
| `anger-gym-hero.png` | Page hero | `#FFB000` | HERO — the Anger Gym as a mythic training hall: forge-light, chained heavy bags of shadow, storm visible through the skylight. |

---

## 🕯️ P1 — Shadow Work "The Forge": 8 chamber cards

Chamber tiles are stroke-SVG sigils on gradients ([ShadowWorkPage.jsx:188-214](src/components/shadow/ShadowWorkPage.jsx#L188-L214)) while the gate header already uses real art (`/assets/shadow/gate-temple.jpg`) — match that painting's style.
**Spec: CARD.** Each is a *chamber* inside the shadow temple.

| Slug (`public/assets/shadow/…`) | Chamber | Creative brief |
|---|---|---|
| `chamber-shadow-alchemist.png` | Shadow Alchemist | An alchemy chamber where a dark mask dissolves in a crucible into liquid gold light. |
| `chamber-hold-the-line.png` | Hold the Line | A crystal rampart at midnight — one figure planted firm as a wave of shadow breaks around (not over) them. |
| `chamber-swamp-valve.png` | Swamp Valve | The temple's underworks — brass valves and glowing marsh water below walkways of light. |
| `chamber-reframe-forge.png` | Reframe Forge | An anvil where a jagged black thought-shard is being reforged into a clear lens. |
| `chamber-inner-child.png` | Inner Child | A small safe harbor room inside the temple — toy boats of light on still water, one adult hand reaching to one small hand. |
| `chamber-self-compassion.png` | Self-Compassion | A chamber of soft pink dawn-light where the statue of a warrior is being gently repaired with gold seams (kintsugi). |
| `chamber-grounding.png` | Grounding | A root-anchored meditation cell — luminous roots running from a seated silhouette deep into black stone. |
| `chamber-integration.png` | Integration | A moon-gate where a person and their shadow walk through *together* and cast one whole light. |

---

## 🐊 P2 — Swamp Valve sub-hub: 4 mode cards

Emoji-only tiles ([SwampValve.jsx:22-43](src/components/shadow/swamp/SwampValve.jsx#L22-L43)). **Spec: CARD.** Keep Boggo-friendly — playful swamp world, bioluminescent.

| Slug (`public/assets/shadow/swamp/…`) | Mode | Creative brief |
|---|---|---|
| `mode-drain-the-swamp.png` | Drain the Swamp (featured) | The great drain opening in the swamp floor, murk spiraling away, lilies lighting up aqua as water clears. |
| `mode-pressure-chamber.png` | Pressure Chamber | A cozy brass diving-bell chamber under the swamp, gauges easing from red to mint. |
| `mode-belly-boiler.png` | Belly Boiler | A round-bellied cauldron-furnace breathing slow bubbles of warm light — breath as steam power. |
| `mode-rumination-bog.png` | Rumination Bog | A spiral bog path where the same glowing thought-wisp circles… and one bright exit path breaks the loop. |

---

## ☕ P2 — Fill Your Cup: hero + 7 level badges + 11 kill-streak badges

Data: [cupData.js:153-266](src/components/wellbeing/cupData.js#L153-L266). Badges are BADGE 🔲 (512×512, transparent). One consistent badge frame that *evolves* in prestige across the set — think CoD/Halo rank medals, cyberpunk-mystic edition.

| Slug (`public/assets/cup/…`) | Item | Creative brief |
|---|---|---|
| `cup-hero.png` | Page hero | HERO — a mythic chalice on an altar catching a waterfall of aurora light. |
| `level-1-empty-cup.png` | Empty Cup 💀 (grey) | A cracked, dry stone cup — dignified, not sad. The origin. |
| `level-2-flicker.png` | Flicker 🕯️ `#D11EFF` | The same cup with one violet candle-flame waking inside. |
| `level-3-refilled.png` | Refilled ⚡ `#00F0FF` | Cup a third full of live cyan energy, small lightning at the rim. |
| `level-4-overflow.png` | Overflow 🌊 `#00FFBF` | Aqua energy overflowing the rim in slow, elegant streams. |
| `level-5-phoenix-state.png` | Phoenix State 🔥 `#FF3EDB` | The cup ablaze with pink phoenix fire, wings suggested in the flames. |
| `level-6-diamond-discipline.png` | Diamond Discipline 💎 `#00F0FF` | The cup transmuted to cut diamond, refracting the whole palette. |
| `level-7-unshakable.png` | Unshakable ◆ `#D11EFF` | The diamond cup floating serene inside a storm that cannot touch it. |
| `streak-003-first-blood.png` | FIRST BLOOD (3) `#FF3EDB` | Medal: a single pink drop striking a shield. |
| `streak-005-double-fill.png` | DOUBLE FILL (5) `#00F0FF` | Medal: twin cyan bolts crossed over a cup. |
| `streak-007-killing-spree.png` | KILLING SPREE (7) `#D11EFF` | Medal: seven flames in a rising arc. |
| `streak-010-dominating.png` | DOMINATING (10) `#00FFBF` | Medal: a mint gauntlet crushing a shadow wisp. |
| `streak-014-rampage.png` | RAMPAGE (14) `#FF3EDB` | Medal: a starburst shattering a chain. |
| `streak-021-mega-fill.png` | MEGA FILL (21) `#00F0FF` | Medal: a tidal wave curling inside a laurel ring. |
| `streak-030-unstoppable.png` | UNSTOPPABLE (30) `#D11EFF` | Medal: a violet cyclone contained in a perfect ring. |
| `streak-045-warlord.png` | WARLORD (45) `#00FFBF` | Medal: a crown fused with overflowing cup. |
| `streak-060-godlike.png` | GODLIKE (60) `#FF3EDB` | Medal: a radiant star held between two wings. |
| `streak-090-legendary.png` | LEGENDARY (90) `#00F0FF` | Medal: diamond core, orbital rings, three months of light. |
| `streak-100-century.png` | CENTURY (100) `#D11EFF` | Medal: the ultimate — obsidian + gold `#FFD166`, a bloodline sigil reborn. |

---

## 🌀 P2 — The 5 Shifts: hero + 5 node badges

Nodes show emoji ([ShiftsPage.jsx:5-84](src/components/training/ShiftsPage.jsx#L5-L84)); titles from [shiftsData.js](src/data/shiftsData.js). **Spec: BADGE 🔲** for nodes, HERO for banner. Style: luminous trail-markers on a journey path.

| Slug (`public/assets/shifts/…`) | Node | Creative brief |
|---|---|---|
| `shifts-hero.png` | Page hero | HERO — five glowing waypoints ascending a dark mountain path into aurora. |
| `node-intro.png` | The 5 Simple Shifts 🌀 | A five-armed spiral portal — the journey's mouth. |
| `node-shift1-integrity.png` | Integrity 🏛️ | A neon-veined marble foundation stone / small temple. |
| `node-shift2-identity.png` | Identity 🔄 | Two silhouette profiles mid-morph, old→new, cyan to magenta. |
| `node-shift3-masks-essence.png` | Masks & Essence 🎭 | A theater mask cracking open around a core of pure light. |
| `node-shift4-break-the-myths.png` | Break the Myths ⚡ | A lightning bolt shattering three stone tablets of "rules." |

---

## 🤖 P2 — AI Trainers: 6 character portraits (big win)

The six coaches exist only as emoji ([constants.js:236-296](src/lib/constants.js#L236-L296)). **Spec: TILE (1024×1024).** Full character-design freedom — six distinct cyberpunk mentor archetypes, consistent as a cast (same rendering style, same bust-portrait framing). Each keyed to their color.

| Slug (`public/assets/trainers/…`) | Trainer | Color | Personality to capture |
|---|---|---|---|
| `trainer-blaze.png` | BLAZE · The Ignitor | `#FF3EDB` | Energy. Intensity. Now. — "You came to burn, so burn." |
| `trainer-sage.png` | SAGE · The Strategist | `#00F0FF` | Think. Build. Execute. — calm systems-mind, chess-master eyes. |
| `trainer-nova.png` | NOVA · The Motivator | `#D11EFF` | You are already who you need to be. — radiant, believing. |
| `trainer-titan.png` | TITAN · The Executor | `#FFD166` | No excuses. No negotiations. — immovable, armored, kind eyes. |
| `trainer-ember.png` | EMBER · The Coach | `#00FFBF` | Progress over perfection. — warm, growing things around them. |
| `trainer-storm.png` | STORM · The Challenger | `#7B2CFF` | Pressure reveals who you really are. — weather in their coat. |

---

## 🏅 P2 — Achievements: 22 badges

All achievements are emoji today ([achievements.js](src/lib/achievements.js)). **Spec: BADGE 🔲.** One family: hexagonal or circular medal frame, per-badge centerpiece. (6 older `achievement-*.png` files exist in `public/assets/achievements/` — new set should visually harmonize.)

| Slug (`public/assets/achievements/…`) | Achievement | Centerpiece idea |
|---|---|---|
| `badge-first-brick.png` | First Brick 🧱 | One glowing brick laid on a dark plane. |
| `badge-day-conquered.png` | Day Conquered ⚔️ | Five light-swords planted like votes. |
| `badge-mission-mapped.png` | Mission Mapped 🗺️ | A route drawn in light with a flag at the end. |
| `badge-sunday-strategist.png` | Sunday Strategist 🧭 | A compass over a weekly wheel of seven notches. |
| `badge-reward-earned.png` | Reward Earned 🏆 | A chalice catching a coin of light. |
| `badge-identity-shift.png` | Identity Shift 🧬 | A double helix re-writing itself in neon. |
| `badge-science-believer.png` | Science Believer 🔬 | A microscope revealing a tiny galaxy. |
| `badge-why-written.png` | The Why Activated 🔑 | A key whose teeth are a heartbeat line. |
| `badge-belief-builder.png` | Belief Builder 🏛️ | Three luminous pillars holding a roof. |
| `badge-trainer-chosen.png` | Coach Selected 🎯 | Two silhouettes fist-bumping over a target. |
| `badge-streak-3.png` | 3-Day Warrior 🔥 | Three flames in formation. |
| `badge-streak-7.png` | 7-Day Legend 👑 | A crown of seven points, each lit. |
| `badge-vision-set.png` | Vision Locked 🔭 | A telescope projecting a small future city. |
| `badge-rule-master.png` | Rule Master 📜 | A scroll with five glowing seals. |
| `badge-first-project.png` | Mission Created 🚀 | A rocket leaving a map-table. |
| `badge-accountability-first-win.png` | First Receipt ✅ | A single stamped receipt of light. |
| `badge-accountability-perfect.png` | Locked In 🔒 | A padlock made of interlocked checkmarks. |
| `badge-accountability-streak-3.png` | 3-Week Commitment Streak ⚡ | Three chain links charged with lightning. |
| `badge-review-streak-4.png` | 4-Week Reviewer 🧭 | Four moon phases around a compass. |
| `badge-shadow-alchemist.png` | Shadow Alchemist 🜂 | A dark mask half-transmuted to gold. |
| `badge-wave-first.png` | First Wave Ridden 🌊 | A small surfer silhouette atop a huge gentle wave. |
| `badge-wave-returned.png` | Returned Under Pressure 🏄 | The same surfer paddling back out at night. |

---

## 🎖️ P2 — XP Ranks: 7 insignia

Ranks are text-only ([gamification.js:21-29](src/lib/gamification.js#L21-L29)). **Spec: BADGE 🔲.** Military-mystic insignia that escalate in complexity/metal: iron → steel → cyan alloy → warrior violet → architect gold traces → empire… → pure light.

| Slug (`public/assets/ranks/…`) | Rank (XP) | Insignia idea |
|---|---|---|
| `rank-1-starter.png` | Starter (0+) | A single chevron of dim cyan on iron. |
| `rank-2-builder.png` | Builder (100+) | Chevron + hammer, steel with cyan edge. |
| `rank-3-operator.png` | Operator (300+) | Double chevron with a rotating gear core. |
| `rank-4-warrior.png` | Warrior (750+) | Crossed energy blades under a violet star. |
| `rank-5-architect.png` | Architect (1500+) | A compass-and-blueprint sigil in gold traces. |
| `rank-6-empire-builder.png` | Empire Builder (3000+) | A crowned city skyline held in one hand of light. |
| `rank-7-legend.png` | Legend (6000+) | A phoenix wreath around a star — full palette, gold core. |

---

## 🧿 P3 — Smaller wins

| Slug | Surface | Spec | Creative brief |
|---|---|---|---|
| `public/assets/vision/vision-hero.png` | Vision Board header ([VisionBoardPage.jsx:14-20](src/components/vision/VisionBoardPage.jsx#L14-L20)) | HERO | An observatory deck at night — empty golden picture-frames floating in the sky, waiting to be filled. |
| `public/assets/vision/vision-empty-state.png` | Vision Board empty state (🔭 today) | TILE 🔲 | A friendly telescope aimed at a single bright unclaimed star. |
| `public/assets/milestone-world/world-card-active-bg.png` | Milestone select card, active ([WorldCard.jsx:31](src/components/milestone-map/WorldCard.jsx#L31), currently flat color; siblings in `/assets/projects/` have art) | wide card 1200×675 | A live expedition camp on the trail — lit tents, path glowing ahead. |
| `public/assets/milestone-world/world-card-complete-bg.png` | Milestone select card, complete | wide card 1200×675 | The same camp at dawn, flag planted, gold light. |
| `public/assets/milestone-world/world-card-locked-bg.png` | Milestone select card, locked | wide card 1200×675 | The trail gated in fog, one keyhole of light. |
| `public/assets/anger/forge-rank-01.png` … `forge-rank-10.png` | Pressure Forge levels (10 emoji ranks in [pressureForgeData.js](src/components/anger/pressureForgeData.js)) | BADGE 🔲 | Forge-medals escalating: spark → hammer → gauge → scales → door → toolkit → target → shield → blades → crown. Check the file for exact rank names. |
| `public/assets/more/tile-*.png` (7, optional) | More-sheet tiles ([MoreSheet.jsx:5-31](src/components/layout/MoreSheet.jsx#L5-L31)) — currently clean SVG glyphs, lowest priority | TILE | Only if we want photographic tiles: weekly-review, stats, rewards-vault, mastery-formula, the-science, asset-library, settings. |

---

## 📊 Totals

| Priority | Images |
|---|---|
| P0 drop-in | 1 |
| P1 (quest cards 18 · city 11 · SOS 7 · anger 5 · shadow 8) | 49 |
| P2 (swamp 4 · cup 19 · shifts 6 · trainers 6 · achievements 22 · ranks 7) | 64 |
| P3 (vision 2 · world cards 3 · forge ranks 10 · more tiles 7) | 22 |
| **Total** | **136** |

## 🔌 Wiring notes (for whoever integrates)

- **Zero wiring:** `quote-scroll-bg.png` — the code already requests it.
- **One-line wiring:** quest chapter cards — add `cardImage: "/assets/map-quest/<slug>"` per chapter in `questChapters.js`; the `ChapterSeal` component auto-upgrades from stone → card art.
- **Component wiring needed:** everything else (add `<img>`/`background-image` where the emoji/gradient renders today). Slugs are stable — generate art first, wire second.
- ♻️ Existing unused art to consider before generating: `chapter-alchemy-card.png`, `chapter-integration-card.png` (map-quest), the legacy `/assets/milestone-nodes/` set, `/assets/phoenix-shrine/` extras, `/game/*.jpg` scenes.

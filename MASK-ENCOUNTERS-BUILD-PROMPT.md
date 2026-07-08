# 🎭 MASK ENCOUNTERS — Master Build Prompt (Name the Critic 2.0 × MapQuest City)

**Paste this whole file into a fresh Claude Code session as the opening brief.** It fuses the standalone boss-fight concept (`name-the-critic-2.html`, repo root) into **MapQuest City** as a **Pokémon-style encounter layer**: while you walk the street, your inner critics ambush you — and you fight them with the Mask Court battle system. Integration, not defeat. Every mask you name becomes an ally that walks the street behind you.

> You are building **Mask Encounters**: wild random battles + five legendary Mask Bosses inside the existing walkable city (`src/components/city/**`). Nothing here is a throwaway webpage — every screen ships into the React app, follows the codebase's conventions exactly, and obeys the laws in §2.

---

## 0) READ THESE FIRST (do not skip — match conventions, don't invent)

- **⭐ Concept + choreography reference:** `name-the-critic-2.html` (repo root) — the complete battle system, playable. Open it in a browser and PLAY IT before writing code. Every timing, screen-shake, beam, composure number, and line of copy is in there. **Caveats:** it uses Anton + JetBrains Mono — both **BANNED** in-app (font law: Sora/Manrope only, `--font-mono` is repointed to Manrope). Port the *feel*, re-skin the type. Its canonical copy also lives in §5–§6 of this file.
- **The walk engine:** `src/components/city/world/useWorldEngine.js` — rAF loop, transform-to-refs, runs only while there's input, **jump physics + `onAirFrame` hook** (the clown-stomp system). This is the engine you'll extend with a distance/stride hook (§7).
- **The scene:** `src/components/city/world/WorldScene.jsx` — renders any world config; has a `paused` prop (pause the walk while a battle is up). See how `StreetEnemies.jsx` + `ClownSprite.jsx` bolt a whole system onto the street via optional world-config keys — **your encounter layer follows the same pattern.**
- **World config contract:** `src/components/city/world/worldConfig.js` — worlds are pure data. You'll add an optional `maskDens` key (§4).
- **Street geography:** `src/components/city/cityWorld.js` — `STORY_ORDER`, `STREET_ZONES`, `buildCityWorld()`. District ↔ boss mapping in §4 keys off these ids.
- **Page mount:** `src/components/city/MapQuestCityPage.jsx` — owns WorldScene, dialogs, and pause state. The battle overlay mounts here.
- **Store pattern:** `src/components/city/journeyStore.js` + `useJourney.js` — localStorage store + hook + **legacy-user migration pattern**. Copy this shape for `maskStore.js`.
- **XP/progress:** `src/components/city/cityStore.js` + `useCityProgress.js` — how the city grants XP and achievements ("XP is evidence, glow is proof").
- **Cinematic overlay patterns:** `src/components/city/hometown/DepartureCinematic.jsx`, `src/components/city/SpireIgnition.jsx` — full-screen overlays with skip buttons and reduced-motion stills.
- **Typed dialogue:** `src/components/city/StoryDialog.jsx` — for the Guide's one-time first-encounter framing.
- **Sound (REUSE, don't rebuild):** `src/lib/sfx.js` — the app's WebAudio engine (from Anger Gym). Extend it; do NOT add a second audio engine. NO ElevenLabs bakes without Jon's audition approval — WebAudio only for now.
- **Styling:** `src/styles/cityWorld.css` (`mqw-*` prefix) and `src/styles/city.css` (`mqc-*`). Your new sheet: `src/styles/maskCourt.css`, prefix **`mqk-`**. Brand palette: cyan `#00F0FF`, magenta `#D11EFF`, hot pink `#FF3EDB`, aqua `#00FFBF`, gold `#FFD166` on void `#05000A`. The concept's per-boss colors (§5) are already on-palette — keep them.
- **Reduced motion:** the city honors `prefers-reduced-motion`, `html[data-reduced-motion="true"]`, and `.mqw-viewport--still`. Every animation you add must die under all three.

**Working agreements:** keep each phase compiling and shippable; pure logic in plain `.js` modules (testable), `.jsx` for UI; local-first (localStorage) — no Supabase tables in v1; do not commit or deploy without being asked; check `git status` for a concurrent session before editing shared files.

---

## 1) THE MISSION

The city street is where the user walks between trainings. Right now the only danger is clowns (comedy). This build adds **the real enemies: their own inner critics** — and turns the walk into a Pokémon world:

- **Wild Critics** (commons) ambush you at random while walking — 60-second micro-fights, ~2–4 per chapter.
- **The Five Mask Bosses** = **end-of-chapter FINAL BOSS STAGES** (Mario world-boss grammar). Each of the city's five boss chapters ends with its survival mechanism materializing at the zone's end arch — a full 3-round set-piece battle ported 1:1 from the concept, staged in a per-chapter themed arena.
- Winning = **naming the fear underneath the attack**, returning the Essence it was starving for, locking a real-life proof action — and then the payoff: the mask **EVOLVES, Pokémon-style, into its Essence Form** (§5.4, §6.9). Five masks, five evolution cinematics.
- Evolved masks **join your side**: their evolved mini forms walk the street behind your Seeker and stand behind you in later boss fights.
- All five evolved → **THE COURT IS YOURS** finale with the full evolved lineup.

The emotional truth: *the voice attacking you is untrained protection. You don't kill it. You train it — and it evolves.*

---

## 2) NON-NEGOTIABLE LAWS (every screen must obey)

1. **No-fail.** Composure 0 = "Survival Mode — you didn't lose, you left your body. One breath brings you back." Never "GAME OVER", never shame. **Walk Away is always available** and never punished (Pokémon "run" — copy: *"Not now. It'll be here when you're ready."*).
2. **Real-life-first.** Encounters never block app navigation, doors, or story beats. Proof Lock output is a real-world action. XP is evidence.
3. **Non-clinical language.** This is a game about inner critics, not therapy. No diagnoses, no clinical terms (same law as Wave Rider).
4. **Consent + control.** First encounter ever is preceded by a 2-line Guide framing (§4.6). Settings chip in the city HUD can turn encounters OFF (`maskStore.encountersOff`). Addict Saint copy stays universal ("the escape") — never names substances.
5. **Font law.** Sora (display) / Manrope. Anton and JetBrains Mono from the concept are banned.
6. **Perf law (mobile-first).** See §8. The street engine must stay idle-cheap; battles pause the walk engine.
7. **Reduced motion** everywhere — battle plays as near-static cards with instant transitions (the concept's `state.rm` + `wait()` clamp pattern is already right — port it).

---

## 3) THE ENCOUNTER MODEL (Pokémon grammar → the street)

| Pokémon | MapQuest City |
|---|---|
| Tall grass | **Fog banks** — visible drifting fog patches on street stretches between districts (the concept's `.fog` layer, localized) |
| Wild encounter | **Wild Critic ambush** — random while walking through a fog bank |
| End-of-world castle boss (Mario) | **Mask Boss stage** — the chapter's mask materializes at the zone's END ARCH once you finish that chapter; walk up → prompt → full boss fight |
| Evolution | **Integration Evolution** — beat a boss and it evolves into its Essence Form (white-flash silhouette morph, §6.9) |
| Battle transition flash | Screen flash + fog surge + slam-in banner |
| Run | **Walk Away** — always works, no penalty |
| Pokédex | **The Mask Codex** — every critic you've named: its attack, the fear you named under it, your proof, its evolved form |
| Party | **Allies** — evolved masks trail your Seeker on the street (mini sprites) |
| Gym badges → Elite Four | 5 evolutions → **The Court Is Yours** finale |

**Encounter rules (tune in one config object `ENCOUNTER_TUNING`):**
- Wild ambushes only inside fog banks; chance accumulates with distance walked (e.g. roll per 300px walked inside fog, ~18% per roll).
- **Cooldown:** min 90s AND ≥1400px walked between wild ambushes. Max 3 wild ambushes per session. Pity: guarantee one if the user has walked 2 full fog banks with none.
- **Night multiplier:** if the city's time-of-day is night (`mqc-tod-*` class / timeOfDay prop), ambush chance ×1.5. Critics are louder at night. This is canon.
- Never trigger while: a dialog/overlay is open, the scene is `paused`, the player is airborne (mid clown-stomp), within 800px of spawn on first visit, or during the hometown/spire/crossing worlds (city street only, v1).
- Boss encounters never ambush — they are **chosen** (walk up + press Enter), exactly like district doors. A chapter's boss **materializes at that zone's end arch only when the chapter is complete** (every district in the zone lit) AND the user has won ≥1 wild fight. Materialization is a small on-street event (fog gathers at the arch + one-line toast: *"You leveled up. That's when it gets loud. ___ is waiting at the end of the chapter."*). **Soft gate only:** the boss looms beside the arch, never blocks it — walk past and it just mutters its first attack line as ambient text. Real-life-first law: nothing on the street is ever hard-blocked.
- **Relapse encounters (the honest part):** an integrated mask can resurface as a *rare* wild-slot encounter (~5% of ambushes, ≥3 days after integration) in a short 1-round "refresher" — it attacks once, you re-name the fear, it kneels immediately. Copy: *"Old voice. You already know its name."* Integration isn't one-and-done and the game says so.

---

## 4) STREET INTEGRATION

### 4.1 Fog banks (the tall grass)
Add optional `maskDens: [{ x, w }]` entries to the city world config (`buildCityWorld`) — one fog bank per zone gap, ~260px wide, sitting between districts. Render in `WorldScene` as a `mqk-fog` div in the main layer (localized fog using the concept's fog gradient, CSS-animated drift, `pointer-events:none`). In reduced motion: static translucent haze.

### 4.2 Final boss stages (end-of-chapter, Mario world-boss grammar)
The street's zones are the chapters. **Five chapters get a final boss** — its survival mechanism, waiting at the zone's END ARCH once the chapter is complete (§3 materialization rule). Un-fought bosses render as a **dark, breathing silhouette** (concept SVG at ~40% opacity, `mqk-lurk` class, slow `breathe` anim) beside the arch:

| Chapter (street zone) | Final boss | Why this mask ends this chapter |
|---|---|---|
| THE GRID (daily-nexus, war-rooms, war-council) | THE NAIVE WARRIOR | you just learned to plan the campaign — "plans are for cowards" attacks exactly then |
| NEON HEIGHTS (identity-forge, vision-tower, the-academy) | THE ADDICT SAINT | new identity + vision = maximum pull of the old escape ("who I am without it") |
| THE UNDERGLOW (pressure-forge, shadow-sanctum, cup-springs, blaze-lab) | THE RAGING VICTIM | the descent chapter ends by facing the pain-as-permission mask |
| THE COMMONS (guild-quarter, hall-of-champions) | THE SILENT PROPHET | you just went public — "nobody is listening" is the final gate |
| THE TERMINUS (the-vault) | THE BROKE KING | the last boss before the Spire: the standard-gap mask guards the Vault |

(THE ARCHIVE ROW has no boss — make it the wild-critic-densest stretch instead. THE SPIRE stays the Alchemist's, untouched.)

Walk-up prompt (reuse the `mqw-prompt` pill): `FACE — THE NAIVE WARRIOR` in the boss's color. **Boss stage arena = the chapter's arena:** the battle overlay tints `--arena`/backdrop with the zone's accent + the boss's concept color, so all five stages feel like five different worlds. Evolved bosses disappear from the arch (they're walking behind you now).

### 4.3 Allies on the street
Evolved masks trail the Seeker: up to 5 `mqk-ally` mini sprites (28–36px) — **the EVOLVED forms** (§5.4), glowing in the essence color the player returned, cracks hidden. They follow at fixed offsets behind the character wrapper with a gentle bob. Implementation: render them inside the char ref wrapper at negative offsets so the engine moves them for free — zero extra JS per frame. In battles, evolved allies line up behind the player exactly like the concept's `buildAllies()`.

### 4.4 The Mask Codex
A `mqk-codex` panel (opened from a small 🎭 chip in the city HUD, next to the clown counter): list of all critics + bosses — SEALED / NAMED ×n / INTEGRATED states, the fears the user actually typed, essences returned, proofs locked, and a running tally. This is the Pokédex and it's also the user's shadow-work journal. Read-only, beautiful, exportable later.

### 4.5 Rewards
- Wild win: **+20 XP** (`maskWildWin`), codex entry.
- Boss evolution: **+275 XP** (concept's `XP_PER`), achievement `mask_evolved_<id>`, evolved ally unlocked, codex page flips to the evolved form (Pokédex style: dark form + evolved form side by side).
- All five: **+500 XP**, achievement `mask_court_sovereign`, Court finale card (port `#s-court`: *"THE COURT IS YOURS … NONE OF THEM LEAD. YOU DO."* with the full EVOLVED lineup), and the street fog banks visibly thin out afterward (fog opacity ×0.5 permanently — the city literally clears).
- Proof Lock (§6.7) additionally offers **"Make it today's mission"** if a daily-plan API exists (check `src/components/daily/**` for today's Top Five store; if wiring is non-trivial, save the proof in the codex and skip — do not force it).

### 4.6 First-encounter framing (consent beat, one time ever)
Before the first ambush plays out, the Guide interjects via `StoryDialog` (2 lines max, plain-warm-direct):
> "That voice you just heard? It lives here too. It's not a monster — it's protection that never got trained."
> "You can't outrun it, but you can NAME it. Naming is the only thing that lands. Ready?"
[ FACE IT ] [ NOT NOW ] — "NOT NOW" walks away free, no ambushes for the rest of the session.

---

## 5) THE ROSTERS

### 5.1 The Five Mask Bosses (port verbatim from the concept — data in `name-the-critic-2.html` `BOSSES[]`)
Every boss: `id, name, emoji, color, arena tint, tag, desc, attacks[3], chips[3][3], essences[], ally role, svg`. The five: **THE BROKE KING** (gold `#FFD84D`), **THE ADDICT SAINT** (pink `#FF3EDB`), **THE SILENT PROPHET** (cyan `#00F0FF`), **THE RAGING VICTIM** (ember `#ff5b3d`), **THE NAIVE WARRIOR** (blue `#00a6ff`). Copy the attack lines, fear chips, essence weaknesses, and ally lines **exactly** — they're already voice-locked. Port the five boss SVGs as React components (`MaskSprite.jsx`, kind prop) — keep the `b-body/b-shade/b-glow/crack` class rig so phase cracks and allied recolor work.

### 5.2 The Essences (finisher currency — port verbatim from `ESSENCES[]`)
RADIANCE ✨ `#FFD84D` · LOVE ❤️ `#FF3EDB` · JOY 😆 `#ffe44d` · POWER ⚡ `#00F0FF` · MAJESTY 👑 `#B06DFF` — each with affirmation + 4 proof chips. Wrong essence = deflected, −6 composure, "IT ISN'T STARVING FOR ___."

### 5.3 Wild Critics (NEW — the commons; write into `wildCritics.js`)
8 street-level critics. Each: 1 attack line, 3 fear chips, 1 win line, a small (~90×110) hooded-wisp SVG variant (one base `WispSprite` + per-critic accent color/prop — much lighter than boss rigs). Colors on-palette.

| id | name | attack line | fear chips | win line |
|---|---|---|---|---|
| `snooze` | THE SNOOZE | "Five more minutes. The dream can wait." | losing the morning · another wasted year · being behind forever | "NAMED. The morning is yours." |
| `scroll` | THE SCROLL | "Just check it real quick. Everyone else is." | missing out · being bored with myself · the silence | "NAMED. Eyes back on the road." |
| `comparison` | THE COMPARISON | "Look how far ahead they are. Why bother?" | never catching up · being ordinary · starting too late | "NAMED. Your lane. Your pace." |
| `imposter` | THE IMPOSTER | "They're going to find out you're faking it." | being exposed · not deserving it · being found out as average | "NAMED. You were never faking." |
| `perfectionist` | THE PERFECTIONIST | "It's not ready. YOU'RE not ready." | being judged · shipping something flawed · it being ignored | "NAMED. Done beats perfect." |
| `tomorrow-man` | THE TOMORROW MAN | "Start Monday. Fresh week, fresh you." | actually starting · finding out I can't · no more excuses | "NAMED. Today heard that." |
| `pleaser` | THE PEOPLE PLEASER | "They'll be upset. Just say yes." | being disliked · the conflict · being alone if I say no | "NAMED. No is a full sentence." |
| `cynic` | THE CYNIC | "None of this works. You've tried before." | hoping again · being disappointed · looking naive | "NAMED. Hope with receipts." |

### 5.4 THE EVOLVED FORMS (NEW — the Pokémon-evolution payoff; write into `maskBosses.js` as `evolved:{}` per boss)
Each mask has ONE evolved form: same silhouette family as its dark rig (so the morph reads as *becoming*, not replacement) but upright, uncracked, radiant — the untrained protector, trained. The evolved rig's glow tints to **whichever Essence the player returned** (CSS var `--evolved-glow`; a boss with 2 valid essences produces 2 possible color variants of the same form — personalization for free).

| Dark form | Evolved form | Visual transformation notes | Role line (kept from concept) |
|---|---|---|---|
| THE BROKE KING | **THE SOVEREIGN** | dollar-store crown → true radiant crown; empty pockets → banner/scepter; posture unbent; gold trim solid | GUARDS YOUR STANDARD |
| THE ADDICT SAINT | **THE UNSHAKEN SAINT** | flickering halo → solid steady ring; the hidden temptation hand now open and EMPTY; feet planted | GUARDS YOUR PEACE |
| THE SILENT PROPHET | **THE HERALD** | X-stitched mouth → open glow; unplugged mic → blazing scroll held HIGH; message lines radiate off the scroll | CARRIES YOUR MESSAGE |
| THE RAGING VICTIM | **THE GUARDIAN** | hunched tantrum mass → calm upright giant; fists → open guarding palms; the armor stays but the shoulders drop | GUARDS YOUR HEART |
| THE NAIVE WARRIOR | **THE COMMANDER** | rubber sword → true blade SHEATHED; gains a small glowing map/plan in the off-hand; helmet visor up | HOLDS YOUR LINE |

Evolved SVGs live in `MaskSprite.jsx` alongside the dark rigs, sharing the `b-body/b-shade/b-glow` class system (so the allied-blue and essence tints are pure CSS). Keep each evolved rig within ~20 paths — silhouette-first, like everything in this city.

**Relationship to the street clowns:** clowns (HATERS/NAYSAYERS) are the *outer* voices — comedy, stompable. Critics are the *inner* voices — depth, nameable. Both live on the same street. Never mix the systems.

---

## 6) THE BATTLE SYSTEM (port spec — the concept is the source of truth)

**Boss fight flow** (full port, all numbers from the concept):
1. **Ambush/approach transition:** fog surges → red flash → slam-in banner (name + tag, `slamin` anim) → walk engine `paused`.
2. **HUD:** segmented health bar = the boss's 3 attack lines (each segment shows the attack text; naming it shatters it — `burnsweep` + shards). Composure bar (starts 100). Boss name/tag top strip.
3. **Attack:** boss lunges → red flash + shake → giant skewed attack text slams in → player staggers → **−14 composure**.
4. **Three moves:**
   - **FIGHT BACK** (the trap): 0 damage, −12 composure, first use makes the boss GROW (`--grow:1.05`). "NO EFFECT. RAGE FEEDS IT."
   - **BREATHE** (guard): 4s-in/5s-out orb cycle with mantra ("I THANK IT FOR PROTECTING ME.") → +28 composure, **next naming strike CRITICAL**.
   - **NAME THE FEAR** (the only real damage): panel with the round's 3 fear chips + free-text input → **Naming Strike** beam → segment shatters → "AFRAID OF: ___" burns into the bar. Crit = quake + 70 shards + +10 composure.
5. **Survival Surge** (after round 2): boss special — pulsing screen, draining bar (100→0 at 1.6/tick, 80ms), composure bleeding; the ONLY button is **Breathe**. Braved: +20 composure + crit armed. Timed out: "THE FLOOD TOOK ITS TOLL."
6. **Composure 0 → Survival Mode:** everything stops. "You didn't lose. You left your body. One breath brings you back." → breath cycle → composure 55 → fight resumes. (No-fail law, already perfect in the concept.)
7. **Essence Finisher:** boss staggers in a loop → pick the Essence it's starving for (wrong = deflect, −6). Right = double beam in essence color + 60-particle burst.
8. **Proof Lock:** "Your brain does not believe affirmations. It believes proof." → essence's 4 proof chips + free text → Lock It In.
9. **Integration → EVOLUTION (the payoff — build this like the Pokémon evolution scene it is):**
   - **Kneel:** embers stop, fog settles, boss KNEELS (1.8s, from the concept). Beat of silence.
   - **Evolution cinematic (~6s, skippable after 2s):** arena dims to near-black → the mask rises and floats center → its rig goes **pure white silhouette** (CSS `brightness(0) invert(1)` + glow) → the silhouette **pulses and morph-swaps** between dark rig and evolved rig, crossfading at accelerating speed (600ms → 300ms → 150ms → 80ms swaps — classic evolution strobe; in reduced motion: ONE slow 800ms crossfade, no strobe) → screen-filling white flash + `quake` + max particle burst in the essence color → reveal: the EVOLVED rig lands, full color, essence-tinted glow.
   - **Reveal slam:** `WHAT? THE BROKE KING IS EVOLVING…` during the strobe → on reveal: **"THE BROKE KING evolved into THE SOVEREIGN!"** (slam-in banner, evolved name in essence color). The chosen essence emblem (✨❤️😆⚡👑) brands onto its chest with a small burst.
   - **Integration card** (replaces the concept's kneel card): *"It works for you now."* + evolved name + role line + essence returned + your proof + XP.
   - Evolved form shrinks to ally size → walks to the player's side → Return to the street (unpause, evolved ally now trailing).
   - Sound: rising WebAudio sweep during the strobe → big hit on reveal (`sfx.js`). This sequence is the screenshot moment of the whole feature — spend the polish budget here.

**Wild fight flow** (compressed, target < 60s): ambush flash → wisp slams in with its ONE attack line → −10 composure → two moves only (**BREATHE** / **NAME THE FEAR**) + **WALK AWAY** link → naming beam → wisp shatters into shards → win line + "+20 XP" toast → street resumes. No essence, no proof, no surge.

**Timings, easing, shake tiers (`shake/rumble/quake`), beam math (player→boss rect vector), shard/burst particle counts: lift from the concept file 1:1.** The `wait()` helper clamping every delay to ≤220ms in reduced-motion is mandatory.

---

## 7) ARCHITECTURE (files to create / touch)

```
src/components/city/masks/
  maskBosses.js        # BOSSES data (from concept, verbatim copy) — pure data
  wildCritics.js       # §5.3 roster — pure data
  essences.js          # ESSENCES data — pure data
  maskStore.js         # localStorage "mask_court_v1": { integrated:{}, wildWins:{},
                       #   entries:[], relapse:{}, encountersOff, firstFramingSeen,
                       #   stats:{ambushes, walkaways} } + subscribe pattern (copy journeyStore)
  useMasks.js          # hook: state + actions (recordWildWin, integrate, toggleOff…)
  useEncounterEngine.js# the Pokémon brain: takes getX + world.maskDens + paused,
                       #   samples stride distance, rolls ambushes (§3 rules), returns
                       #   { pendingEncounter, clearEncounter }
  MaskBattle.jsx       # the arena — full-screen overlay, boss + wild variants,
                       #   per-chapter arena theming + the evolution sequence (§6.9)
  MaskSprite.jsx       # 5 dark boss rigs + 5 EVOLVED rigs (§5.4), shared
                       #   b-body/b-shade/b-glow/crack class system, essence tint var
  WispSprite.jsx       # wild critic base sprite + accents
  MaskCodex.jsx        # the Pokédex panel
  MaskFX.js            # canvas particles (port spawnEmber/spawnShards/spawnBurst, §8 caps)
src/styles/maskCourt.css   # mqk-* — port the concept CSS, re-skinned to Sora/Manrope
```

**Touch (surgical, additive only):**
- `useWorldEngine.js` — add optional `onStride(dxAbs)` callback fired from the existing walk branch of the rAF loop (2 lines: accumulate `Math.abs(dx)`, call cfg hook). Zero cost when unset.
- `WorldScene.jsx` — render fog banks + boss lurkers + trailing allies from config/props; expose stride hook.
- `cityWorld.js` — emit `maskDens` (fog banks per zone gap) + lurker positions from the §4.2 table.
- `MapQuestCityPage.jsx` — mount `useEncounterEngine` + `<MaskBattle/>` overlay + codex chip; set `paused` while a battle is up.
- `src/lib/sfx.js` — add `maskAmbush`, `namingStrike`, `critStrike`, `bossKneel`, `breathTone` (soft), `shatter`.

---

## 8) PERFORMANCE & MOTION LAW (mobile-first — same bar as the Arena build)

- ❌ NO mouse effects, NO per-frame React state, NO always-on rAF. The encounter engine rides the EXISTING walk loop (it only runs while walking — that's the whole trick).
- ✅ One battle-only particle canvas (`MaskFX`): caps — ~24 particles mobile / ~60 desktop, `devicePixelRatio` clamped to 2, `cancelAnimationFrame` on `document.hidden` and on battle unmount. The street NEVER runs a particle canvas.
- Fog banks, lurkers, allies: pure CSS transforms/opacity. Allies ride the char wrapper (free).
- Battle overlay pauses the walk engine (`paused`) — never two rAF loops at once.
- Everything dies under reduced motion (three flags, §0). Target 60fps on a mid-range phone at 390px. If in doubt, cut the effect.

---

## 9) BUILD PHASES (each compiles + is verifiable; verify before moving on)

- **Phase 0 — Recon:** play `name-the-critic-2.html`; read every file in §0; `npm run build` green baseline. Check `git status` for a concurrent session.
- **Phase 1 — Data + store:** `maskBosses/wildCritics/essences/maskStore/useMasks`. Verify: unit-ish console smoke (store round-trips, legacy defaults).
- **Phase 2 — The battle, standalone:** `MaskBattle` + sprites (dark AND evolved rigs) + FX + css mounted behind a dev flag (e.g. `?maskfight=broke-king`). Port ONE boss end-to-end INCLUDING the evolution cinematic (Broke King → THE SOVEREIGN), then the other four (data-driven — should be free), then the wild variant. Verify in browser: full fight, survival surge, survival mode, essence deflect, proof lock, kneel → evolution strobe → reveal, reduced-motion single-crossfade fallback, 390px.
- **Phase 3 — The street layer:** fog banks, `onStride` hook, encounter engine, chapter-complete boss materialization at end arches (+ soft-gate mutter when walked past), first-encounter Guide framing, Walk Away. Verify: walk the street, force rates up, confirm ambush + cooldowns + never-during-dialogs/jumps; complete a chapter via dev fast-path and watch its boss materialize.
- **Phase 4 — Integration loop:** evolved allies trailing, codex (dark/evolved side-by-side pages), XP/achievements, relapse encounters, Court finale with evolved lineup, fog-thinning. Verify: evolve all 5 via dev fast-path, see the court.
- **Phase 5 — Polish:** sfx wiring, night multiplier, settings toggle, copy pass (plain-warm-direct, non-clinical), final `npm run build`, full CDP/manual E2E on the 27-screen style checklist: new user → first wild fight → first boss → all five → court.

---

## 10) DO NOT

- Do NOT add fail states, timers that shame, or locked app nav. Walk Away is sacred.
- Do NOT use Anton/JetBrains Mono or any monospace font.
- Do NOT bake ElevenLabs voices (audition approval required first) — WebAudio via `sfx.js` only.
- Do NOT touch the clown system, hometown/spire/crossing worlds (beyond no-op config), `witnessLines.js`, or Zone files.
- Do NOT put battle state in React per-frame; do NOT run particles on the street.
- Do NOT make the Addict Saint name any specific substance/behavior — the concept's universal "escape" language is the line.
- Do NOT commit, deploy, or run migrations without Jon's go.

**Definition of done:** a new user walks east from the Plaza, hits a fog bank, gets ambushed by THE SNOOZE, learns to breathe + name, wins in under a minute. Chapters later they finish THE GRID and fog gathers at its end arch — *"You leveled up. That's when it gets loud."* They choose to face THE NAIVE WARRIOR in its own themed boss stage, survive the surge, name three fears, return POWER, lock "Make the call" — and then the screen goes white and strobes and **THE NAIVE WARRIOR evolves into THE COMMANDER**, essence emblem branding onto its chest, before shrinking and falling in behind them on the street. Four boss stages later, five evolved protectors walk at their back and the fog thins over the whole city because **the court is theirs**.

---

## BUILD STATUS — 2026-07-07 (Claude session, all phases complete)

| Phase | Status | Verified |
|---|---|---|
| 0 · Recon | ✅ | concept played/read line-by-line, all §0 files read, baseline build green |
| 1 · Data + store | ✅ | Node smoke 37/37 (round-trips, idempotence, relapse eligibility, corrupt-storage defaults) |
| 2 · Battle | ✅ | CDP E2E ×4: full Broke King fight (fight-back grow, breathe+crit, 3 namings, surge, essence deflect→POWER, proof, kneel→strobe→**THE SOVEREIGN** reveal); Saint fight w/ composure-0 Survival Mode + ally lineup; wild Snooze <10s + Walk Away free; reduced-motion single-crossfade run @390px |
| 3 · Street layer | ✅ | 7 fog banks, real ambush while walking, Guide framing FACE IT/NOT NOW (session snooze), straight-to-battle after framing, legacy materialization (all 5 lurkers + toast), FACE prompt + mutter, soft-gate walk-past, boss walk-away |
| 4 · Integration | ✅ | codex (dark→evolved pairs, typed fears/proofs, ??? unknowns, relapse tally), 🎭 5/5 HUD chip, XP 20/275/500 + 6 registered achievements, Court finale w/ evolved lineup, fog ×0.5 permanent, 5 allies trailing |
| 5 · Polish | ✅ | 7 new WebAudio sfx in lib/sfx.js (no 2nd engine), night ×1.5, encounters OFF toggle in codex, copy pass vs §2 laws, Proof→Top Five mission button, final build green, full-arc E2E PASS |

**Files:** `src/components/city/masks/*` (12 new) + `src/styles/maskCourt.css` + surgical touches to useWorldEngine (onStride), WorldScene, cityWorld (maskDens/maskZones), MapQuestCityPage, StoryDialog (altLabel), lib/sfx.js, lib/achievements.js.
**Dev flags:** `?maskfight=<boss-id>|wild:<critic>|relapse:<boss-id>` mounts a fight; `?maskrate=1` forces ambush rolls.
**Notes:** local-first (mask_court_v1) — no migrations; NOT committed/deployed; ElevenLabs untouched per law. Achievements hydrate server-first on reload (pre-existing app behavior) — mid-session unlocks all fire.

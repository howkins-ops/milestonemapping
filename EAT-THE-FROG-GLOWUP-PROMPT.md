# EAT THE FROG — "10x Cooler" Glow-Up Build Prompt

**Target:** turn the Eat the Frog game from a text card with an emoji into a **living swamp-at-night diorama** with a real, hand-built frog *character* and a cinematic **swallow set-piece** that pays off in a sunrise. Same ritual, same psychology — but it should feel like a tiny video game, not a to-do checkbox.

**Files you own (touch ONLY these):**
- `src/components/zone/arena/games/EatTheFrog.jsx`
- `src/components/zone/arena/games/EatTheFrog.css`

Everything else is off-limits. All witness/toast/celebrate copy still routes through `witnessLines.js` (do **not** inline new copy strings that belong there). Do not change the localStorage schema key (`arena_frog_v1`), the stats math, the streak/before-9 logic, or the Dawn Raid bridge — those are correct. This is a **graphics + motion + sound** overhaul on top of the existing state machine.

---

## 0. Absolute constraints (breaking any of these = rejected)

1. **Performance Law §3 (mobile-first).** Only animate `transform` / `opacity` in CSS. NO animating width/height/top/left/box-shadow/filter on a loop. NO mouse-parallax, custom cursor, or per-frame scroll/pointermove handlers on touch. Desktop pointer-tilt is allowed ONLY via the existing `useCardTilt()` hook (already gated to `hover:hover` + `pointer:fine`).
2. **One extra rAF, capped and disciplined.** You may add ONE dedicated `<canvas>` for the swamp/splash particles, but it must follow the exact discipline in `ArenaFX.jsx`: `devicePixelRatio` clamped to 2; particle caps ~**18 mobile / ~40 desktop** for ambient, bursts on top; `cancelAnimationFrame` when the tab is hidden (`visibilitychange`) AND when the canvas scrolls off-screen (`IntersectionObserver`, no scroll listener); a single dim static frame under reduced-motion (no loop). Prefer reusing the shared `useArenaBurst()` bridge for one-shot splash pops before adding your own canvas — only add the canvas for the *ambient* swamp life (fireflies/water).
3. **`prefers-reduced-motion` is sacred.** Every new animation needs a reduced-motion fallback: idle loops off, the swallow collapses to an instant state change + one burst, the sunrise becomes a static gradient swap. Extend the existing `@media (prefers-reduced-motion: reduce)` block.
4. **Brand + font law.** Rounded display/body fonts only (`--font-display`, Sora/Manrope) — never monospace. Use brand tokens (`--zn-card`, `--zn-border`, `--text-main`, `--text-soft`, `--ease-out`). Frog accent stays **MINT `#00FFBF`**; sunrise uses the warm ember set (`#FFB000` / `#FF7A1A` / `#FFD166`). The bespoke frog is fine to render in-body — the "no emoji" rule is for nav/roster glyphs only, but building a real vector frog is the whole point of this upgrade, so **replace the 🐸/😬/😋 emoji with a real SVG frog** (keep emoji only in toast titles).
5. **Every `frog-` class prefix stays.** No global CSS. No new dependencies — pure React + CSS + SVG + the existing `sfx.js` / `haptics.js` / arena FX hooks.

---

## 1. The vision in one line

> A dark pond at night. A real frog sits on a lily pad, breathing, blinking, staring at you with your dreaded task written above it. The longer you leave it, the heavier and murkier it gets. When you finally **hold to eat it**, tension ramps — ripples, squirm, rising slurp — then the tongue **snatches it in**, a big gulp + splash, the water goes glass-calm, and the sky breaks into **sunrise**: the rest of the day is dessert.

---

## 2. The Stage — build a swamp diorama (replaces the flat `.frog-hero` card)

Turn the hero card into a layered scene (`position: relative; overflow: hidden`), painted back-to-front with cheap layers:

1. **Sky gradient** — deep swamp night by default (indigo→black→faint mint horizon). This layer is the one that later cross-fades to sunrise. Animate only via `opacity` cross-fade between two stacked gradient layers (night + dawn), never by animating the gradient itself.
2. **Moon + glow** — a soft radial disc, slow `translateY` drift (the existing `frog-breathe` cadence). Under sunrise it fades and the sun rises from behind the reeds (`translateY`).
3. **Fog band** — 1–2 wide, very low-opacity blurred bands drifting horizontally on `transform: translateX` (long 18–26s loops), reduced-motion → static.
4. **Reeds / cattails silhouette** — inline SVG silhouette strip across the bottom, a few blades with a gentle `transform-origin: bottom` sway (staggered `rotate` keyframes, ±2°). Pure transform.
5. **Water surface** — a horizontal band with a subtle animated caustics shimmer done as a masked gradient moving on `transform` (NOT background-position). Ripples on demand (see §5).
6. **Lily pad** — the frog's perch. Bobs subtly; bobs harder during the hold; splashes/sinks a touch on the gulp.
7. **Ambient life (the one new canvas):** drifting **fireflies** (green/mint motes, 8–12 mobile) rising and blinking — reuse the mote logic from `EmberCanvas` but themed mint/cyan, capped low. Optional lazy dragonfly that crosses every ~20s.

All of this lives **inside** the hero and is `aria-hidden`. The task text and the eat button sit on top with a legibility scrim.

---

## 3. The Frog — a real character, not an emoji

Build one **bespoke inline SVG frog** (layered groups so parts animate independently). It is the centerpiece graphic. Minimum rig:

- **Body / belly** — slow breathe (belly scales on `transform`, ~4s).
- **Eyes** — two domes with pupils; **blink** every 3–6s (eyelid `scaleY` flick); pupils can track toward the eat button (subtle, CSS var driven, desktop only — optional).
- **Throat sac** — puffs on croak and swells during the swallow.
- **Tongue** — hidden; only appears in the swallow snatch.
- **Mouth** — neutral → nervous (down-curve) as the hold progresses.

**State-reactive expressions** (drive by a state/data-attribute class on the SVG root; CSS does the rest):
- `is-calm` (just declared): gentle idle, occasional croak + throat puff.
- `is-staring` (waiting): locked eyes on you, slow blink, tiny hops.
- `is-heavy` (see §4b): sags, droops, darker tint, a fly or two circling.
- `is-squirming` (during hold): rapid squirm + wide eyes + throat swell, scales up as `holdFrac`→1.
- `is-gulped` (eaten): yanked down, throat gulp, then a satisfied settle.

Reduced-motion: frog renders static in its current expression, no idle loops.

---

## 4. State-by-state upgrades

### 4a. DECLARE — "put the frog on the plate"
- When the frog is named, don't just swap cards — **animate the frog splashing up onto the lily pad** from the water (a rise + settle, `translateY` + squash/stretch) with `sfxBubble()` + a ripple. The task text types/reveals above it (draw-in, transform/opacity).
- The "yesterday's frog hopped in" carry-over should visually **hop** onto the pad (2–3 arc hops) when tapped.
- Textarea + button get press squash states and a focus glow (mint).

### 4b. STARING / WAITING — make time visible (the psychology upgrade)
The law says *"every hour it sits there it gets heavier."* Make that literal and graphical:
- Track hours since `declaredAt` (already stored). Map to a **0→1 "weight"** value.
- As weight rises: frog shifts toward `is-heavy` (sags, tint darkens toward murky green-grey), the swamp fog thickens (opacity up), 1→2 flies begin circling, the lily pad rides lower, a thin **"weight" meter** or a wilting reed hints at the cost. Keep all of it opacity/transform + a couple of CSS custom properties set from JS (e.g. `--frog-weight`), computed once on mount + on a **cheap low-frequency interval (every 60s, not rAF)**.
- This gives the otherwise-dead waiting screen a living, mounting tension that rewards eating early. Reset instantly on eat.

### 4c. THE SWALLOW — the money set-piece (replaces plain ring + scale)
This is where the 10x lives. Currently: a scale-down + stroke ring fills, then done. Rebuild it as a **3-act cinematic** driven by the existing `holdFrac` (0→1 over `HOLD_MS`):

**Act 1 — Tension (0 → 0.85):**
- Keep the radial fill ring but make it a **charging "gulp meter"**: the ring is now the frog's throat filling. Add a second effect — the whole scene **leans in** (subtle scale-up of the frog + slight vignette closing via an overlay opacity).
- Frog goes `is-squirming`, eyes widen, throat swells proportional to `holdFrac`.
- Water **ripples intensify**, lily pad bobs harder, fireflies scatter slightly.
- **Rising audio:** a pitch/intensity riser (loop or repeated `sfxBubble()` at increasing rate; if you add a synth riser, model it on the loop helpers in `sfx.js` like `sfxCalmPadLoop`). **Haptic ramp** (light→medium as it fills — check `haptics.js` for a tick/medium; fall back to periodic light taps).
- Label: "SWALLOWING…" with the frog's nerves showing.

**Act 2 — The Snatch (at 1.0):**
- **TONGUE SNATCH:** the frog's tongue flicks out and the frog is *yanked down/in* (fast `translateY` + squash), OR the mouth engulfs — pick the punchier read on device. Big **GULP**: throat balloons then collapses.
- Fire the payload: `sfxSplat()` + `sfxCoin()` (existing), a **water splash burst** (spawn a themed particle pop at the frog's screen position via `burst(x,y,MINT)` — you already capture `holdPt`), `slamHeavy()` haptic, a **shockwave ring** (single expanding `scale` + fade circle), and lily-pad bob/sink.
- On streak milestones (7/30/new best) keep `sfxPhoenix()` and escalate the burst.

**Act 3 — Calm + Dawn (settle):**
- Water goes **glass-calm** (ripples damp out), fog lifts, the sky layer **cross-fades to sunrise** (night gradient → warm dawn), sun rises behind reeds, one bird chirp. This is the emotional payoff: *the hard thing is gone, the day is dessert.*
- Frog re-surfaces as `is-gulped` → satisfied (a content settle + tiny belch/throat puff), the task text draws its **own strikethrough** (animate the line-through in, mint).

Reduced-motion collapse: skip Acts 1–2 choreography, instant state → one `burst()` + instant sunrise gradient swap.

### 4d. EATEN + before-9AM dawn spectacle
- The eaten state IS the sunrise scene from Act 3 (persist it — on reload of an already-eaten day, render calm-dawn directly, no re-animation).
- **Before 9AM** = extra spectacle: bigger sun, warmer sky, a "🌅 sunrise" shimmer, and the existing "claim the sunrise → Dawn Raid" CTA gets a glow. Tie the visual reward to the mechanic that already exists.
- CTAs (`Post it as proof`, `Claim the sunrise`) get press states + a subtle idle shimmer on the primary.

---

## 5. Micro-interactions & juice (cheap, high-delight)

- **Poke the frog:** tapping the frog (when staring) makes it croak (`sfxBubble`/a croak synth), puff its throat, and hop once — pure delight, no state change.
- **Tap the water:** spawns a ripple ring at the tap point (transform scale + fade).
- **Ripples:** a reusable `.frog-ripple` element (expanding ring) spawned on declare/poke/gulp. Cap concurrent ripples (~4).
- **Stat count-ups:** streak / total / before-9 numbers **count up** on mount (transform/opacity friendly — animate a number via rAF once, or a cheap CSS reveal).
- **Squash/stretch** on every button press (`:active { transform: scale(.96) }` already partly there — extend to the frog and pad).

---

## 6. Stats → a Trophy Pond (replaces the 3 plain numbers)

Keep the three stats but make them a scene:
- A **row of lily pads for the last 7 days** — each day you ate shows a tiny satisfied frog on its pad; missed/empty days show an empty pad or a still-croaking frog. One glance = your week.
- **Streak flame:** a small ember/flame that visibly grows with streak length (reuse ember gradient language; milestone 7/30 → phoenix flourish already wired via `sfxPhoenix`).
- Best streak keeps its 🏆 line but gets a subtle gold shimmer.

---

## 7. Sound & haptics design

Use existing `sfx.js` primitives; only add a synth helper if nothing fits (model new ones on the existing loop/one-shot helpers). Respect the global mute (`useSfxMute` / it's already honored by `sfx.js`).

| Moment | Sound | Haptic |
|---|---|---|
| Ambient (staring) | soft swamp bed — crickets/water, **ducked low**, loop like `sfxCalmPadLoop`/`sfxRainLoop`; pause off-screen/hidden | — |
| Declare / frog lands | `sfxBubble()` + `sfxPop()` | light |
| Poke frog | croak (bubble/synth) | light |
| Hold — tension riser | rising `sfxBubble()` cadence or a pitched riser loop | ramp light→medium |
| Gulp (complete) | `sfxSplat()` + `sfxCoin()` (+ `sfxPhoenix()` on milestone) | `slamHeavy()` |
| Sunrise | one bird chirp / warm swell | — |

**Ambient loop must**: start only when the staring scene is visible, stop on eat / unmount / tab-hidden / off-screen. Never autoplay before a user gesture (respect the existing audio-unlock pattern in `sfx.js`).

---

## 8. Performance & accessibility budget (verify before done)

- Ambient particle canvas: **≤18 mobile / ≤40 desktop**, DPR≤2, paused when hidden/off-screen. If in doubt, skip the canvas and do fireflies as ~6 CSS-transform dots.
- No layout thrash: the "weight over time" update runs on a **60s interval**, not rAF. The hold uses the existing single rAF loop — don't add a second one for it.
- All loops die on unmount (extend the existing `aliveRef` / `cancelAnimationFrame` cleanup).
- Reduced-motion path verified: idle off, swallow instant, sunrise static, ambient bed silent-or-static.
- Keyboard path preserved: Space/Enter still holds-to-eat (`holdKeyDown`), focus-visible rings intact, `aria-label`s on the frog scene and eat button.
- 60fps on a mid iPhone during the hold. If the swallow drops frames, cut the vignette/blur before cutting the frog rig.

---

## 9. Implementation notes

- Keep the existing state machine (`showDeclare` / staring / `eaten`) and all handlers (`declare`, `beginHold`, `finishEat`, `cancelHold`, hopped-frog carry-over). You're re-skinning + adding FX layers and one canvas, not rewriting logic.
- Drive frog expression + scene phase off existing state + `holdFrac` + a derived `weight` — pass them to CSS via classes and a couple of `--frog-*` custom properties. Keep JS→DOM writes minimal.
- Build the frog SVG as a component-local constant or small subcomponent inside `EatTheFrog.jsx` (don't create new files — ownership is these two files).
- Reuse `useReveal()` for the section reveals (already in place), `useArenaBurst()` for one-shot splash pops, `useCardTilt()` only if you want a desktop-only pad tilt.
- Co-locate ALL new CSS in `EatTheFrog.css`, `frog-` prefixed, grouped by scene, with the reduced-motion block extended at the foot (match the file's existing comment style).

---

## 10. Definition of Done

- [ ] Real SVG frog character with idle rig + 5 state expressions; emoji frog gone from the scene.
- [ ] Layered swamp diorama (sky/moon/fog/reeds/water/lily pad) with ambient fireflies, all transform/opacity.
- [ ] "Getting heavier over the day" visual tension on the waiting screen.
- [ ] 3-act cinematic swallow (tension → tongue-snatch/gulp → calm + sunrise), with splash burst, shockwave, haptic ramp, audio riser.
- [ ] Sunrise reward state (bigger for before-9AM), persists on reload without replaying.
- [ ] Trophy-pond week strip + growing streak flame replacing plain stat numbers.
- [ ] Poke-the-frog + tap-ripples + stat count-ups.
- [ ] Swamp ambient sound bed (ducked, gesture-gated, pauses off-screen); full sound/haptic map wired.
- [ ] Perf caps + reduced-motion + keyboard/a11y all verified; `npm run build` green; browser E2E on an iPhone viewport (declare → wait → hold → gulp → sunrise) captured.

## 11. Optional stretch (only after the above ships green)
- Seasonal skins for the pond (rain, snow, autumn reeds) driven by real date.
- A rare "golden frog" (e.g. 5th eat of a streak) with an outsized payoff.
- Slurp/gulp voice-over line via the existing `playVoiceLine` chain (only if a baked line exists — no new bake without Jon's audition approval).

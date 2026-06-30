# BUILD PROMPT — Finish The Inner Alchemist (all remaining chapters)

> **Paste this whole file as the prompt to launch the build next session.** It is self-contained: it tells a
> fresh agent exactly what to build, how to build it on the existing engine, and in what order. The hard
> infrastructure is already done and verified — this is now mostly authoring rich scene-scripts on top of the
> kit. Work through it phase by phase, running `npx vite build` after each chapter.

---

## MISSION
Build every remaining chapter of **The Inner Alchemist** — the 20-chapter cyberpunk retelling of *The
Alchemist* that doubles as real coaching (`src/components/map-quest/`). The world, engine, dossier, and one
proof chapter already exist. Author the rest as **fully-animated SVG cinematics** (characters meeting, movie
style the whole way), each **full and rich** (multi-scene, real testimony, a real lesson, one exercise) — not
thin. Ship the **playable spine first** (Phase B + C), then fill the middle (Phase D).

## READ FIRST (the canon — do not re-derive)
- `alchemist/07_CHAPTER_DOSSIER.md` — **the content source.** Every chapter's Coelho beat × Jon's real story ×
  the bigger lesson × the scene mini-arc × the exercise × the framework × Dashboard scores. Pull the rich copy
  from here.
- `alchemist/06_WORLD_BIBLE.md` — the look, the cast, the 5 shadows↔essences, the Phoenix grammar.
- `alchemist/08_ALCHEMIST_COMPANION_GUIDE.md` + `09_ALCHEMIST_THEN_NOW_NEXT.md` — extra teaching depth +
  per-scene "chapter-close" fields + the Dashboard scoring.
- `src/components/map-quest/kit.jsx` — **the engine.** All primitives + the cinematic engine.
- `src/components/map-quest/chapters/ChapterSignal.jsx` — **the canonical template.** Copy its structure.
- `src/components/map-quest/questChapters.js` — the 20-chapter registry (single source of truth).
- `src/components/map-quest/useMapQuestState.js` — the state API (Day-One, dashboard, shadow getters).
- `src/components/map-quest/chapterRegistry.js` — the lazy component registry.
- `src/components/rpg-world/RPGWorldPage.jsx` — the host; it passes `quest` + `onComplete` to each chapter.

## GUARDRAILS (always)
- **IP:** lessons + hero's-journey spine only, in our own words. Never paste Coelho's prose; never reuse his
  named characters. Ship a tasteful "Inspired by the spirit of Paulo Coelho's The Alchemist" line on an
  about/splash screen.
- **Consent:** material tagged **(Tr) Transmuted** in the dossier (childhood abuse/self-harm, gang/crack,
  addiction depth, family abandonment, the ayahuasca descent) ships **fictionalized as shadow-trials, never
  raw biography.** **(T) Testimony** beats ship in Jon's voice.
- **Fonts:** rounded/serif for prose (`serif`/Inter Tight), mono only for kickers/HUD. No utility fonts for body.
- **Every area full and rich:** multiple teaching scenes + the testimony + the lesson before the exercise.

---

## THE CHAPTER RECIPE (how to author one chapter — follow ChapterSignal.jsx)

Each chapter is a component `export default function ChapterX({ onComplete, quest }) { ... }` wrapped in
`<ChapterFrame>`, moving through phases via `useState`: **intro cinematic → exercise → answer-fill mirror →
essence/seal**.

**1. Intro cinematic** — a `SceneScript` array of shots, played by `<Cinematic shots={INTRO} accent={...}
onDone={() => setPhase("exercise")} />`. Each shot (see the JSDoc in kit.jsx):
```js
{ id, mood, backdrop:'forest'|'starfield'|'embers'|null, kicker, speaker,
  cast:[{ id, node:<HeroSprite/> | <MentorSprite color={...}/> | <CrownedSprite/> | <AlchemistSprite/>, label, labelColor }],
  lines:[ "..." ], cta:"...", media:{ kind:'svg' } }   // media.kind:'video' later swaps to a Higgsfield clip
```
Use 3–6 shots to stage the **meeting** and the **testimony** richly (the mentor/shadow tells Jon's real story
as animated scenes). Pull the beats + lessons from the dossier entry.

**2. Exercise** — ONE coaching move. Render textarea(s) with `taStyle(accent)` + `Btn`. Capture the fields
listed per chapter below into component state. For shadow chapters, use the reforge pattern (step 5).

**3. Answer-fill mirror** — weave the player's own words back with `echo(value, fallback)`:
`"So the fear steering you was {echo(fear, '…')}."` This is the personalization payoff.

**4. Essence return + seal** — non-shadow chapters: `<PhoenixSeal color label />`. Shadow chapters: reforge
the `<CrownedSprite>` from `revealed` → `healed` and burst the essence with `<EssenceBurst color glyph name
line />`, then seal.

**5. Shadow chapters (Ch6, 9, 11, 14, 16)** — use `<CrownedSprite baseColor={shadowColor} revealed/healed>`
for the shadow, and the reusable `<ForgeExercise accent onComplete={({melt,identity,proof})=>...} />` (or a
bespoke money/voice/etc. capture). **Save `shadow:"<type>"` in the outputs** so `quest.getAllShadows()` finds
it (types: `broke_king, addict_saint, silent_prophet, raging_victim, naive_warrior`).

**6. Persist on finish:**
```js
const finish = () => {
  quest?.updateDashboard?.({ stage, purpose, faith, fear, courage, trust }); // per-chapter scores below
  // Ch1 & Ch2 only — capture the Day-One Snapshot:
  // quest?.setDayOneSnapshot?.({ whoIAmNow, whatImChasing, biggestFear, treasure });
  onComplete?.({ ...all captured fields, shadow:"<type or omit>" });          // RPGWorldPage stores these
};
```

**7. Register the chapter (3 edits, then it appears on the map + routes automatically):**
- Create `src/components/map-quest/chapters/ChapterX.jsx`.
- Add `ChapterX: lazy(() => import("./chapters/ChapterX.jsx")),` to `CHAPTER_COMPONENTS` in `chapterRegistry.js`.
- In `questChapters.js`, set that chapter's `component: "ChapterX"` and `available: true`.

**8. Coaching (hybrid):** author **scripted branching** now (mentor replies keyed off what the player typed —
use `echo`). Leave a `// TODO: askMentor() proxy` hook where a future live-Claude call (Netlify function
`netlify/functions/ask-mentor.js`, model `claude-sonnet-4-6`) will upgrade it. **Never put an API key in
client code.**

**9. Build after each chapter:** `npx vite build` must stay clean.

---

## BUILD ORDER & PER-CHAPTER SPEC

Dashboard scores are `{stage · Purpose/Faith/Fear/Courage/Trust}` (0–10), seeded from the Companion Guide.
Full rich copy for every row is in `07_CHAPTER_DOSSIER.md` — read that chapter's entry before writing it.

### PHASE B — rework the 3 existing chapters to canon (keep their keys: chapter-anchor, chapter-shadow)
- **Ch1 `chapter-anchor` → "The Send-Off"** (rework `ChapterAnchor.jsx`). Father's transmission; drop the
  "Choose Your World" layer. Exercise **Create Your Why** → capture `whyILeft`; **set Day-One**
  `{ whoIAmNow, biggestFear }`. Dashboard: `Ordinary World · 3/4/3/4/4`. (T)
- **Ch6 `chapter-shadow` → "The Undercity of Lack"** (rework `ChapterShadow.jsx`; **fold the Alchemy reforge
  in**). Broke King encounter → mirror → origin (testimony: the $4/hr year + bankruptcy/scarcity) → **Money
  Mirror** (`money, fear, power, proof`) → ForgeExercise reforge → **Essence: Power**. Save `shadow:"broke_king"`.
  Dashboard `5/3/7/5/4` → Power. (T / depth Tr)
- Retire the transitional **`chapter-alchemy`** node: set `available:false` (or remove the entry) once Ch6
  absorbs the forge; drop its registry line. Keep `ChapterAlchemy.jsx` as reference.

### PHASE C — the playable spine (after this the quest plays start→finish)
- **Ch3 `ch03-the-fixer` (ChapterFixer)** — meet the **Anchor mentor** (`<MentorSprite color={C.cyan}/>`);
  testimony: reconnecting with Dad at 23. Exercise **Futurability Check** → `futureSelf`. Dashboard
  `Threshold · 6/6/5/6/5`. (T)
- **Ch4 `ch04-the-holo-map` (ChapterHoloMap)** — the **Business mentor** (`color={C.gold}`) lights the money
  map; testimony: Dean Marshall's 4 cash-flow quadrants. Exercise **Future Vision Journal** → `futureSelfVision`.
  Dashboard `Threshold · 6/6/4/6/6`. (T)
- **Ch5 `ch05-the-gate` (ChapterGate)** — the gate opens on a spoken declaration; testimony: the same-day quit
  / burn-the-ships. Exercise **Essence Declaration** → `declaration`. Dashboard `Crossing the Threshold ·
  7/6/5/7/5`. (T)
- **Ch19 `ch19-the-vault` (ChapterVault) — THE CLIMAX.** The vault opens onto a mirror. Read
  `quest.getDayOneSnapshot()` and `quest.getAllOutputs()`; render the Day-One answers **beside who they've
  become** with `<AnswerJournal>` — that side-by-side IS the treasure. The Alchemist is revealed as the
  Seeker's future self (`<AlchemistSprite/>`). Exercise **Life Purpose Reveal** → `lifePurpose` (testimony:
  Mexico-beach "to inspire"). Dashboard `Reward · 10/10/3/10/10`. (T)
- **Ch20 `ch20-the-return` (ChapterReturn)** — the city now legible; the Father's echo; the Phoenix over the
  whole map; testimony: "rich without money" / the fisherman parable. Exercise **Return & Next Quest** →
  `nextQuest`. Dashboard `Return with the Elixir · 10/10/3/10/10`. (T)

### PHASE D — the 12 middle chapters
- **Ch7 `ch07-the-challenger` (ChapterChallenger)** — Challenger mentor (`color={C.danger}`); testimony: Dr.
  Ken Yiem, the ruptured-Achilles grit. Exercise **At Cause Reset** → `avoiding, atCause`. `7/6/5/7/6`. (T)
- **Ch8 `ch08-the-forge` (ChapterForgeCh)** — testimony: the Pool Jump + true-grit weather. Exercise **Promise
  Forge** → `promise, consequence, proof`. `7/6/5/7/6`. (T)
- **Ch9 `ch09-the-neon-chapel` (ChapterNeonChapel)** — **Addict Saint** (`baseColor` love/rose); testimony:
  15 yrs + the Vegas sobriety vow (Tr depth). Exercise **Compassionate Interruption** → `escapeFrom, interrupt`;
  `shadow:"addict_saint"` → **Essence: Love**. `7/6/6/7/6`.
- **Ch10 `ch10-the-desert` (ChapterDesert)** — testimony: 10,000-hr rule / the 8-day dry streak. Exercise
  **Time Integrity Reset** → `wastingTimeOn, oneConsistentAct`. `7/7/5/7/7`. (T)
- **Ch11 `ch11-the-data-spire` (ChapterDataSpire)** — **Silent Prophet** (radiance/gold); testimony: the
  "stupid" lie + rewriting the subconscious (Tr-leaning). Exercise **Voice Gate** → `wontSay, newScript`;
  `shadow:"silent_prophet"` → **Essence: Radiance**. `8/8/6/7/7`.
- **Ch12 `ch12-the-recursion` (ChapterRecursion)** — the Alchemist first glimpsed; testimony: the employee
  mindset loop. Exercise **Loop Breaker** → `theLoop, newIdentity`. `8/7/6/7/7`. (Tr)
- **Ch13 `ch13-the-diagnostic` (ChapterDiagnostic)** — Business mentor returns; testimony: the "Big Book
  Splat" + the sales-mastery diagnostic (Law of Probability, Rock-Collection rapport, "No means Know").
  Exercise **Missing-Piece Diagnostic** → `missingPiece`. `9/8/5/8/8`. (T)
- **Ch14 `ch14-the-ruins` (ChapterRuins)** — **Raging Victim** (majesty/violet); testimony: family implosion →
  chose gratitude (Tr). Exercise **Throne of Responsibility** → `theStory, gratefulFor`; `shadow:"raging_victim"`
  → **Essence: Majesty**. `8/7/7/7/6`.
- **Ch15 `ch15-the-garden` (ChapterGarden)** — the **Heartkeeper** (`color={C.mint}`); testimony: forgive
  yourself + the Cape Town garden for 50,000. Exercise **Being Mirror** → `judgeMyselfFor, forgive`. `8/8/4/8/8`. (T)
- **Ch16 `ch16-the-black-market` (ChapterBlackMarket)** — **Naive Warrior** (joy/amber); testimony: "16 and in
  a gang", belonging-hunger (Tr). Exercise **Clean Movement Check** → `shortcut, ownedClean`;
  `shadow:"naive_warrior"` → **Essence: Joy**. `8/7/6/8/7`.
- **Ch17 `ch17-the-citadel` (ChapterCitadel) — all 5 converge.** Read `quest.getAllShadows()`; stage all five
  reforged silhouettes; the **ayahuasca descent rendered fully fictionalized** (purge → veiled figures →
  fire→phoenix). Exercise **Shadow Naming Ceremony** → the player names each shadow (prefill with their earlier
  words from `getAllShadows()`); surrender. `Ordeal · 9/7/8/7/7`. (Tr)
- **Ch18 `ch18-becoming-the-signal` (ChapterBecomingSignal)** — jack into the wind; the Alchemist; testimony:
  the eviction-candle surrender. Exercise **Essence Stand** → `myStand` (all 5 essences restored).
  `Ordeal/Transformation · 10/10/4/10/10`. (T surrender / Tr-leaning)

---

## SPECIAL MECHANICS (get these right)
- **Day-One Snapshot:** captured in Ch1 (`whoIAmNow, biggestFear`) + Ch2 (`treasure, whatImChasing` — already
  done in ChapterSignal). Mirrored at **Ch19**.
- **Shadow harvest:** every shadow chapter must put `shadow:"<type>"` in its `onComplete` outputs. **Ch17**
  reads `quest.getAllShadows()`; **Ch19** reads `quest.getDayOneSnapshot()` + `quest.getAllOutputs()`.
- **Dashboard HUD:** optionally mount `<QuestDashboard meters={quest.getDashboard()} />` on the map header or a
  chapter intro so the player sees Purpose/Faith/Fear/Courage/Trust climb. (Wire `quest.getDashboard()` through
  `RPGWorldPage` → `MapQuestMap` if you surface it on the map.)
- **Video-swap proof:** in at least one shot, demonstrate `media:{ kind:'video', src:'/assets/map-quest/cine/
  <file>.mp4' }` falling back to SVG when the file is absent (the swap path for the future Higgsfield movie).

## DEFINITION OF DONE
1. All 20 chapters `available:true`, each its own component, registered, code-split, building clean.
2. The Quest Book map shows 20 nodes; the unlock chain advances; header shows `N/20`.
3. Play the spine end-to-end: type answers in Ch1–2 → reach **Ch19 The Vault** → your **Day-One answers are
   mirrored back** beside who you've become.
4. Each shadow chapter returns its essence; **Ch17** names all five using the player's own earlier words.
5. `npx vite build` clean; deploy preview `netlify deploy --build` (prod once Jon signs off).
6. Consent honored (Transmuted fictionalized); "inspired by" line present.

## NOTES FROM THE LAST SESSION
- Engine + map + router + state are done and verified. **ChapterSignal.jsx (Ch2) is the working template** —
  copy it.
- Keep keys `chapter-anchor`/`chapter-shadow` stable (referenced by SeekerCity/App). New chapters use the
  `chNN-...` keys already in `questChapters.js`.
- The map is gap-aware (`prevAvailableKey`), so flipping each chapter `available:true` in order just works.
- Lean toward **rich, cinematic, multi-scene** chapters — Jon's note: each area must feel full, never dry.

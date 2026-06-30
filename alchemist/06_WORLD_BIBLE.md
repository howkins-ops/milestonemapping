# The Inner Alchemist — World Bible (unified look)

> The single source of truth for **how the world looks, who you meet, and how transformation reads on
> screen.** Decided: keep the **existing neon-cyberpunk aesthetic already in the app** (the neon-silhouette
> style of `ChapterShadow.jsx` / `ChapterAlchemy.jsx`). **No 2085 sci-fi setting** — the depth comes from the
> Alchemist chapter analysis, not a new future. This codifies the *look*; `07_CHAPTER_DOSSIER.md` holds the
> *content*.

## The one-line pitch
A future-noir retelling of *The Alchemist* that doubles as real coaching: you walk a neon road out of the
city, meet four mentors and five shadow-selves, and the keys you've been carrying the whole time finally turn.

## Tone & register
- **Mythic, intimate, cinematic.** Two voices interleave the whole way: the **Mentor's true story** (Jon's
  real life — fixed, authored once) and the **Seeker's emerging story** (the player's, built live from their
  typed answers and mirrored back).
- Not gritty dystopia — **luminous dark**: black/violet night, neon edges, embers, a phoenix that keeps
  reappearing. Hope inside the dark, never grimdark.
- Serif for the soul (`Fraunces` italic = narration/testimony); mono for the system (`JetBrains Mono` =
  kickers, HUD, labels); rounded sans for body. (Honors the banned-fonts rule — no utility/monospace for prose.)

## Palette (from `kit.jsx` — do not invent new colors)
| Token | Hex | Use |
|---|---|---|
| black / night | `#000000` / `#04020b` | base backgrounds |
| phoenix (violet) | `#7B2CFF` | primary brand glow, the Phoenix |
| magenta | `#D11EFF` | CTAs, the trail's end |
| hotPink | `#FF3EDB` | accents, gradients |
| cyan | `#00F0FF` | the Seeker (player), "you", ready states |
| mint | `#00FFBF` | healing, "being", reforged/healed shadows |
| gold / amber | `#FFC94D` / `#FFA94D` | shadows revealed, money/king imagery |
| danger | `#FF5470` | wounds, the shame-eye, crisis |
| leaf | `#1f7a4d` | the forest/treeline out of the city |

The trail gradient is canon: **cyan → phoenix-violet → magenta** (`#questInk` in `MapQuestMap.jsx`).

## The geography (the Quest Book map)
The journey is a single neon road drawn through a "book" — out of the **city** (the 9-to-5 grid behind you),
across the **treeline**, into the **forest/underworld of the self**, ending at the **Vault** that opens onto
a mirror, then **home**. The map is one serpentine trail of 20 sealed nodes (data-driven; see Phase A). Each
node is a "world" the player drops into.

## The cast (the people you meet)
**The Seeker / Runner** — the player, a hooded cyan silhouette (`HeroSprite`). Walks the road; their light is
the constant.

**The Father** — the prologue voice and the closing echo. Gave a survival code ("look out for #1") that must
be outgrown. Warm, weathered, found-faith later.

**The 4 mentors** (grounded in Jon's real mentors — cyberpunk aliases):
1. **The Anchor** (cyan) — has known you for years; steadies *identity*, not tactics. Names the path. *(Dad.)*
2. **The Business mentor** (gold) — teaches the craft: sales mastery, reading people, turning a no into a
   yes, the grit of the work. The richest teaching node. *(Dean Marshall.)*
3. **The Challenger** (danger-red) — won't let you blame; summons your masks; forces victim → at-cause.
   *(Dr. Ken Yiem.)*
4. **The Alchemist** (phoenix-violet/mint) — revealed as the Seeker's **own future self**; guides the
   transmutation and the climax. *(Coach Howkins / future self.)*

**The ally — Heartkeeper** (mint) — met at the oasis/garden; love that frees rather than cages.

**The 5 shadows ↔ 5 essences** (survival-selves to integrate, each the SAME silhouette as the Seeker —
*because they are you, crowned/masked*; reforge from locked → revealed gold → healed mint):
| Shadow | Wound | Essence returned | Chapter |
|---|---|---|---|
| **The Broke King** | scarcity, "I am behind" | **Power** | 6 |
| **The Addict Saint** | escape | **Love** | 9 |
| **The Silent Prophet** | self-silencing | **Radiance** | 11 |
| **The Raging Victim** | blame / abandonment | **Majesty** | 14 |
| **The Naive Warrior** | belonging-hunger, impulsive trust | **Joy** | 16 |
All five converge in **Ch17 (The Citadel)** and are named at once; their essences power the climax.

## Recurring motifs
- **The Phoenix** — Jon's real tattoo; the seal that marks every chapter complete (`PhoenixSeal`). Burn → ash
  → rise. The visual through-line and the brand.
- **The mirror** — you keep seeing *yourself* in the other (the crowned shadow, the robber's dream, the
  Vault). The whole quest is reciprocal seeing (the Narcissus/lake prologue).
- **Embers & memory-shards** — drifting particles carry the past (a contract, a number, a word like "BEHIND").
- **The crown** — chosen in the mirror; cracked until the essence heals it.
- **Doing vs Being** — the seed planted early (Ch6) and paid off at the Garden (Ch15) and the Vault (Ch19).

## How transformation reads on screen (the grammar)
1. **Arrive** — a cyberpunk scene sets the world (parallax backdrop, the cast walks on).
2. **Meet & testimony** — the mentor/shadow speaks; Jon's real story plays as animated scenes.
3. **The exercise** — one coaching move; the player types their truth.
4. **The mirror** — their words are woven (answer-fill) back into the narration ("the fear steering you was
   *[their words]*").
5. **Essence return** — the shadow reforges (gold→mint), the essence glyph bursts (`EssenceBurst`).
6. **Seal** — the Phoenix marks it; the Progression Dashboard meters move; outputs persist for Ch17 & Ch19.

## Premade-for-video rule
Every scene is authored as a **shot** with a `media` field — animated SVG now, swappable to a Higgsfield video
clip later by dropping a file into `public/assets/map-quest/cine/` (no chapter rewrite). The look above is what
the SVG renders and what any future video should match.

## Attribution
Ships with a tasteful line on the about/splash screen: *"Inspired by the spirit of Paulo Coelho's The
Alchemist."* Original story, original cast, our own words — the lessons and the hero's-journey spine only.

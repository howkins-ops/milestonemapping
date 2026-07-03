# IMAGES — MapQuest City (art manifest addendum)

*Companion to the root `IMAGES_NEEDED.md` — same Style Bible, palette hexes, and standard sizes apply verbatim (AAA cyberpunk-mystic, neon on deep black, warm not horror, no baked-in text, PNG sRGB, transparent bg for badges 🔲).*

**Every image here is a drop-in upgrade, never a blocker.** Phase 1 renders the entire city in CSS/SVG; each row notes the fallback that is already live. Target folder `public/assets/city/` exists and is empty.

Sizes: `BG 1920×1080 · TILE 1024×1024 · BADGE 512×512 🔲 · STRIP 1920×400 🔲`

## Sky sets (BG) — calm upper two-thirds, city glow rises from bottom edge

| Slug | Used by | Spec | Brief | Live fallback |
|---|---|---|---|---|
| `city-sky-night.png` | CityScene `.mqc-tod-night` | BG | Deep purple-black night, faint stars, violet horizon bloom | CSS gradient + star field |
| `city-sky-dawn.png` | `.mqc-tod-dawn` | BG | Magenta-amber dawn bleed over dark city haze | CSS gradient |
| `city-sky-day.png` | `.mqc-tod-day` | BG | Desaturated cool-blue day, still dark-first, thin cloud bands | CSS gradient |
| `city-sky-dusk.png` | `.mqc-tod-dusk` | BG | Gold-pink burn on the horizon, first neons waking | CSS gradient |

## Skyline strips (STRIP 🔲, transparent, tileable horizontally)

| Slug | Used by | Spec | Brief | Live fallback |
|---|---|---|---|---|
| `city-skyline-far.png` | `.mqc-sc-far` | STRIP | Distant silhouette row, no windows, atmospheric haze | 23 CSS silhouette towers |
| `city-skyline-near.png` | `.mqc-sc-mid` | STRIP | Mid-ground towers w/ lit windows + rooftop neon signage, no text | 15 CSS towers w/ window gradients |

## District badges (BADGE 🔲) — one glyph-forward emblem per district, card-center calm

`district-alchemist-spire` (◈ black-glass needle, purple) · `district-identity-forge` (⟁ anvil sigil, magenta) · `district-vision-tower` (✦ glass spire, cyan) · `district-the-academy` (✶ five halls, pink) · `district-war-rooms` (⚑ holo-table, red) · `district-daily-nexus` (✹ five slots, green) · `district-war-council` (⚖ scales, cyan) · `district-the-vault` (❖ vault door, gold) · `district-shadow-sanctum` (☽ under-temple, magenta) · `district-pressure-forge` (⚒ vented furnace, amber) · `district-cup-springs` (🜄 luminous water, cyan) · `district-blaze-lab` (🜂 blast doors, pink) · `district-guild-quarter` (⚭ braziers, gold) · `district-hall-of-champions` (♛ name-wall, gold) · `district-formula-athenaeum` (∴ shelves, magenta) · `district-observatory` (◉ behavior-lens dome, cyan)

Used by: DistrictSheet header + future DistrictCard art. Live fallback: unicode glyph medallion with neon ring (already shipping).

## Misc

| Slug | Used by | Spec | Brief | Live fallback |
|---|---|---|---|---|
| `city-hero-card.png` | Dashboard `CityHeroCard` | TILE | Skyline vista through a rain-slick plaza, beckoning light | `/bg-loop.mp4` video bg |
| `plaza-ground.png` | `CityPlaza` | STRIP | Reflective plaza flagstones w/ neon puddles | CSS ground glow |
| `guide-portrait.png` | The Guide strip / MentorDialog | BADGE 🔲 | Hooded cyan-lit wayfinder, kind eyes, staff w/ compass light | `MentorSprite` SVG |
| `nav-city.png` | BottomNav Phase-2 tab | match `/assets/nav/*` set | Three-tower skyline w/ beacon spark, house nav style | n/a (tab not added yet) |

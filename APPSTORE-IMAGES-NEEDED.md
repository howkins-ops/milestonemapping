# 🍎 APP STORE IMAGES NEEDED — Art Generation Manifest

> **For Codex (or any image-gen agent):** Every row below is one image Apple / the App Store
> pipeline needs. Save each image at the **exact path** given. Follow the same Style Bible as
> `IMAGES_NEEDED.md` (palette, cyberpunk-mystic mood, house style) **except where a row
> overrides it** — Apple has hard technical rules that beat our style rules.
>
> Status today: the iOS project still ships the **stock Capacitor placeholder icon and splash**.
> Sections A + B are launch blockers. Section C is required before the store listing can be
> submitted. Section D is optional polish.

---

## 🔒 Apple hard rules (override the Style Bible where they conflict)

1. **App icon:** exactly 1024×1024 PNG, **sRGB, NO transparency, NO rounded corners** —
   Apple applies the mask. Art must fill the entire square, edge to edge.
2. **Icon legibility:** must read at 60 px. One bold symbol, no fine detail, **no text**.
3. **Screenshots:** must show the **real app UI** (App Review guideline 2.3.3). Pure concept
   art submitted as a "screenshot" = rejection. Marketing panels are fine as long as a real
   screen capture appears inside them.
4. **Screenshot canvas:** 6.9" iPhone portrait — **1290×2796 px** (1320×2868 also accepted).
   iPhone-only v1 → **no iPad set needed**.
5. Text baked into marketing panels is allowed here (unlike in-app art) — but AI-generated
   type is usually mangled. **Leave headline zones EMPTY**; text gets overlaid in a design
   tool afterward.

---

## 🚨 A. App icon set (P0 — blocks the build pipeline)

`npx @capacitor/assets generate` consumes these from an `assets/` folder at repo root
and generates every iOS size automatically.

| Path | Spec | Creative brief |
|---|---|---|
| `assets/icon-only.png` | 1024×1024 PNG, sRGB, **opaque, full-bleed, no text** | THE master icon. A single glowing waypoint/milestone marker — a neon diamond or beacon — burning Electric Cyan `#00F0FF` with a Phoenix Purple `#7B2CFF` inner flame, on Deep Void `#05000A`. Think "the next milestone on the map, lit up at night." One shape, massive presence, readable at 60 px. Volumetric glow but crisp silhouette. |
| `assets/icon-foreground.png` | 1024×1024 PNG, transparent bg, symbol inside center 66% safe zone | Same beacon symbol only, isolated (Android adaptive — cheap to make now, saves a v1.1 trip). |
| `assets/icon-background.png` | 1024×1024 PNG, opaque | Matching Deep Void → Midnight Navy `#070B1F` gradient with faint cyan grid glow. No symbol. |

Optional (iOS 18+ appearance variants, can ship later): a **dark-mode** variant (same
symbol, slightly brighter glow, transparent-feel dark bg) and a **tinted** variant
(symbol as pure grayscale on black).

## 🚨 B. Splash / launch screen (P0 — same pipeline)

| Path | Spec | Creative brief |
|---|---|---|
| `assets/splash.png` | 2732×2732 PNG, opaque; **logo/symbol inside the center 1200×1200 only** — edges get cropped on every device | The beacon symbol centered, small and calm, on near-black Deep Void with the faintest cyan horizon glow at the bottom. Minimal — this flashes for ~1 second. |
| `assets/splash-dark.png` | 2732×2732 PNG | Same image (app is dark-themed; identical file is fine). |

## 🚨 C. App Store screenshots — 6.9" iPhone set (P0 for the listing)

**Canvas: 1290×2796 portrait. Need 5–6, max 10.**

Two-layer workflow — Codex makes layer 1, real captures make layer 2:

1. **Codex: marketing background panels** (the rows below) — full 1290×2796 art with the
   **top ~500 px calm/empty** (headline text overlays there) and the **center-bottom ~2000 px
   compositionally quiet** (a device-frame screenshot composites there).
2. **Real app captures** to composite in: capture each screen at 430×932 CSS px @3× via
   Playwright/device (demo account `@coach_demo`-style data, nothing embarrassing —
   reviewer sees these).

One background panel per featured screen, each themed to its feature's palette:

| # | Path | Featured screen (real capture needed) | Panel creative brief |
|---|---|---|---|
| 1 | `store/screens/panel-1-map.png` | Dashboard / Milestone Map | The hero. Cyan `#00F0FF` + Phoenix Purple `#7B2CFF` nebula over a faint glowing journey-path motif (winding dotted trail of light with milestone beacons). |
| 2 | `store/screens/panel-2-city.png` | MapQuest City street view | Neon city-skyline silhouette at night, Cyber Blue `#007BFF` + Hot Pink `#FF3EDB` signage glow rising from the bottom edge. |
| 3 | `store/screens/panel-3-zone.png` | The Zone squad feed / Full Court | Arena energy — Victory Amber `#FFB000` + Success Gold `#FFD166` stadium-light rays on Midnight Navy, faint crowd-glow bokeh. |
| 4 | `store/screens/panel-4-anger.png` | An Anger Gym game (The Door ladder) | Ember and storm — deep red-orange embers fading into Dark Purple Shadow `#120022`, one crack of cyan lightning. |
| 5 | `store/screens/panel-5-shadow.png` | Shadow Descent hub | Mystic depth — Royal Violet `#5B00FF` fog, descending stone steps dissolving into soft darkness, one warm gold light below. |
| 6 | `store/screens/panel-6-journal.png` | Field Journal (or IRON) | Warm leather-and-gold-foil texture vignette lit by candle-gold `#FFD166`, edges falling to black. |

**Faster fallback (zero Codex work, 100% compliant):** skip the panels and upload the six
raw 1290×2796 captures directly. Panels lift conversion; raw shots unblock submission.

## 💤 D. Optional / later

| Item | Spec | Note |
|---|---|---|
| App Preview video | up to 3 × 15–30 s, 1290×2796 | Skip for v1; add when featured screens are stable. |
| Feature/promo art | 1920×1080, no text | Only if Apple ever features the app — nice to have on file. |
| `public/og-image.png` | 1200×630 | Social share card for the marketing/support URL (Netlify site). Beacon symbol + nebula, text-free. |

---

## ✅ After the images exist

1. Drop A + B files into `assets/` → run `npx @capacitor/assets generate --ios`
   → commit the regenerated `ios/App/App/Assets.xcassets`.
2. Composite C panels + captures at exactly 1290×2796 → upload in App Store Connect →
   *(listing, step 5 of `APP-STORE-LAUNCH-CHECKLIST.md`)*.

# MAPQUEST CITY — Phased Build Plan

*Phase 1 is LIVE. Phases 2–4 are designed against systems that already exist in this codebase — each phase names what it reuses. Hold Phases 2+ (especially anything purchasable) until after first App Store approval.*

---

## Phase 1 — The Living City ✅ SHIPPED 2026-07-03

**Goal:** the city exists, connects everything, and rewards arrival.

Built:
- `src/components/city/` — 17 modules + 5 stylesheets (`mqc-*` namespace).
- **CityScene** — layered parallax skyline: time-of-day sky, star field, far/mid silhouettes, cranes (stage 1), aurora + Spire beacon (stage 4), trams/drones/embers (density by stage), 16 tappable district buildings whose glow (dim/lit/radiant) is computed from each feature's real progress store.
- **CitizenCard** — rank sigil + XP bar, zone identity (@username, avatar, fire, phoenix), derived titles, stat chips.
- **16 districts / 6 quarters** (`cityDistricts.js`) with lore, live progress readers, and sheet → real feature routing. Alchemist Spire launches the 20-chapter quest engine (`onOpenMapQuest`).
- **Mentors** (`cityMentors.js`, `MentorDialog.jsx`) — 16 named NPCs + The Guide's date-deterministic daily pointer; typed-dialogue lessons; XP once per mentor per day; every lesson exits into the real exercise.
- **Plaza + Hall of Champions** — friends w/ fire auras, squad banner, partner chip, podium leaderboard. All hidden offline.
- **Rewards:** XP `cityFirstVisit: 50`, `cityDailySweep: 15`, `mentorLesson: 10`; achievements `city_arrival`, `city_all_districts`, `hall_of_champions`, `first_lesson`, `city_scholar`.
- **Placement:** City tab inside the Zone (canonical home, `ZoneNav` → `ZoneInner view="city"`), standalone nav keys `city`/`openworld` (quest-chapter return path), dashboard `CityHeroCard`. `SeekerCity.jsx` superseded (file retained).

Definition of done: `npm run build` clean; every district enters its feature; offline degrades gracefully; reduced-motion stills everything; no monospace.

## Phase 2 — The Citizen

**Goal:** deeper identity ownership. *(No purchases — everything earned.)*

- **Avatar creator:** layered SVG cosmetics (base / hair / gear / aura), stored in `zone_members.avatar_url` (SVG data or preset id) + a local cosmetics store. Unlocks keyed to achievements and ranks.
- **Equippable titles:** choose any earned title from `cityTitles.js`; write to `zone_members.identity_title` via `updateZoneProfile()` (`src/lib/zoneService.js`) so it displays across Zone + city.
- **Citizen tower:** one building in the skyline is *yours*; its height/detail follows total XP.
- **BottomNav city tab** once `nav-city.png` art exists (see `IMAGES_CITY.md`).

Reuses: `zoneService.updateZoneProfile`, achievements list, `UserChip` avatar conventions.

## Phase 3 — The Arena

**Goal:** competition with soul — seasons, duels, guild wars.

- **City challenges** entirely on existing RPCs: `az_create_challenge`, `az_join_challenge`, `az_challenge_checkin`, `az_list_challenges`, `az_finalize_challenge`, `az_challenge_ceremony_payload`. The Arena is a new district that lists/creates them with city framing (1v1 duels, squad wars).
- **Seasons:** 6-week windows over `az_get_leaderboard(days)`; season titles + profile borders as earned cosmetics; Hall of Champions gains a season archive.
- **Seasonal city skins:** stage × season CSS matrix (winter snow, ember autumn) — pure CSS vars over the existing scene.
- **Squad banners** on Guild Quarter rooftops (squad emblem + fire%).

Reuses: the entire `az_challenges` schema, `challengeTemplates.js`, `SquadFireMeter` data.

## Phase 4 — The Living World

**Goal:** the city feels inhabited in real time.

- **Live plaza presence:** Supabase realtime channels (pattern proven in `useZone.js`) — see friends' avatars appear as they're active; applause bursts when a friend completes a milestone.
- **World events:** weekend community goals (Global Gratitude Weekend, Reading Marathon) as time-boxed global challenges with city-wide visual payoffs (every building brightens).
- **Housing interiors:** tap your citizen tower → trophy room (achievements as artifacts), vision wall (vision board), phoenix shrine (streak history).
- **AI mentor conversations:** upgrade scripted lessons to model-driven dialogue per mentor persona; voice via `voiceOver.js`; portraits via `imageGen.js`.
- **NPC ambience:** plaza walkers, Academy students, tournament crowds.

Reuses: realtime subscription pattern, `imageGen.js`, `voiceOver.js`, celebration bus.

---

## Sequencing rules

1. Ship nothing that violates The One Law (see `00_CITY_BIBLE.md`).
2. Anything purchasable waits for App Store approval + IAP integration decision.
3. Each phase must degrade offline as gracefully as Phase 1.
4. New districts = new rows in `cityDistricts.js` — the registry is the single source of truth; the skyline, sheets, mentors, and progress engine all key off it.

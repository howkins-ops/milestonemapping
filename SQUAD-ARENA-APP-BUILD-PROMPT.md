# 🏟️ SQUAD ARENA — Master Build Prompt (into the Milestone Mapping App)

**Paste this whole file into a fresh Claude Code session as the opening brief.** It turns the standalone concept (`squad-arena-concept.html`) into a *real, shipped* feature set inside the existing React + Supabase app — the Accountability Zone's competitive game layer for entrepreneurs & salespeople.

> You are building **The Squad Arena**: a set of animated, competitive, research-backed accountability games that live inside the existing **Zone** (`src/components/zone/**`). Nothing here is a throwaway webpage — every screen ships into the app, uses the real Supabase backend, and follows the codebase's existing conventions exactly.

---

## 0) READ THESE FIRST (do not skip — match conventions, don't invent)

Before writing any code, read and mirror the patterns in:

- **⭐ THE RESEARCH (read first):** `SQUAD-ARENA-RESEARCH.md` (repo root) — the full 4-pass VoC deep-dive (entrepreneur + salesperson accountability, gamification mechanics, accountability-partner science, ~40 sources). WHY every game exists. Design decisions must trace back to a finding here.
- **Concept + visual reference:** `squad-arena-concept.html` (repo root) — the look, motion, and every game's UX. This is the design target (adapt to mobile; strip the laggy effects — see §3).
- **Full Court spec:** `FULL-COURT-game.md` (repo root) — the complete sales-game design + odds-engine math.
- **API layer / RPC pattern:** `src/lib/zoneService.js` — EVERY backend call is an `az_*` Postgres RPC (`SECURITY DEFINER`), with `if (!supabase) return { offline:true }` guards. Copy this exact style.
- **State/context:** `src/hooks/useZone.js` — one `az_get_zone_state` powers everything; exposes `{ userId, member, fire, fireDays, phoenix, squads, partner, unreadNotifications, unreadMessages, refreshState, ... }`. A realtime channel on `zone_notifications` is the cheap fan-out for "something happened."
- **Routing/shell:** `src/components/zone/ZonePage.jsx` — the `go(view, param)` router + `data-fire={fire.key}` tinting + overlay pattern.
- **Nav:** `src/components/zone/ZoneNav.jsx` — 6 tabs, **custom SVG neon glyphs (NO emoji in nav)**, `TAB_ALIAS` maps secondary views to a primary tab.
- **Challenge shape:** `src/components/zone/challenges/challengeTemplates.js` + `ChallengeCreate.jsx` — `{ key, icon, title, description, durationDays }`, `createChallenge(...)`.
- **Squad UI to upgrade:** `src/components/zone/squad/SquadHome.jsx` (this is the "boring page" to replace with the Arena Home).
- **Sound engine (REUSE, don't rebuild):** `src/lib/sfx.js` — the app already has a WebAudio engine (from Anger Gym). Extend it with arena sounds; do NOT add a second audio engine.
- **Witness copy law:** `src/components/zone/witness/witnessLines.js` — ALL witness/notification microcopy comes from here. Add new lines here; never inline witness strings.
- **DB migrations:** `supabase/migrations/001–006_*.sql` — tables (001), helpers+RLS policies (002), social RPCs (003), content RPCs (004), storage (005), grants (006). Your new SQL goes in `007_arena_tables.sql`, `008_arena_rpcs.sql`, (`009_arena_realtime.sql` later). **Read 001 & 002 first** to match table/RLS/naming conventions (`zone_members`, `squads`, `feed_events`, `zone_notifications`, `challenges`, snake_case, `az_` fn prefix, `SECURITY DEFINER`, explicit grants).
- **Styling tokens:** `src/styles/zone.css` — fire tiers (`.zone-root[data-fire="cold|warm|burning|inferno|phoenix"]`, `--zfire`, `--zfire-glow`), cards (`--zn-card`, `--zn-border`), and utility classes (`zn-card`, `zn-card--glow`, `zn-btn`, `zn-btn--ghost`, `zn-stat`, `zn-eyebrow`, `zn-chip`, `zn-2col`, `zn-code`, `zn-empty`, `zn-stagger`, `zn-cats/zn-cat`, `zn-field/zn-label/zn-input/zn-textarea`). Reuse these; add `src/styles/arena.css` for new classes.
- **Brand palette + fonts:** cyan `#00F0FF`, magenta `#D11EFF`, hot pink `#FF3EDB`, aqua `#00FFBF`, gold `#FFD166`/amber `#FFB000` on void `#05000A`. Fonts **Sora / Manrope only — monospace is BANNED** (`--font-mono` is repointed to Manrope). Fire tiers = league divisions.

**Working agreements:** ask before running destructive DB ops; keep each phase compiling and shippable; write `az_*` RPCs `SECURITY DEFINER` + `REVOKE`/`GRANT EXECUTE` like the existing ones; add RLS for every new table; put pure logic in plain `.js` modules (testable) and keep `.jsx` for UI.

---

## 1) THE MISSION (what & why)

The old squad page counts check-ins into a void. The Arena turns a squad into **an arena you can't walk away from** — grounded in a 4-pass VoC deep-dive (see `project_squad_arena` memory + the concept file). The emotional truth: **"Goals fail because no one was watching."**

**Five design laws — every screen must obey:**
1. **Manufacture a witness.** Make the user feel *seen* by real people (partner/squad), not an app.
2. **Small named squad (6–8), a pair inside it.** Max obligation + backup. Not an anonymous feed.
3. **Score the ACTIVITY today.** Reward leading indicators (doors, dials, reps, check-ins) now — not a close 90 days out.
4. **Every stick gets a carrot + a grace mechanic.** Streak-freeze, shame-free misses, one-tap recovery — or people quit for good.
5. **Real-life-first.** Points come from real actions (proofs/check-ins/logged field sessions), never from empty taps.

---

## 2) SCOPE — what we're building (10 game modes + the Arena shell)

| # | Mode | One-liner | Research lever |
|---|---|---|---|
| A | **Arena Home** | The redesigned squad page: crest+level, live chain, boss HP, activity board, live vows, fire-bump | witness + celebrate activity |
| 1 | **THE VOW** ⭐ (flagship original) | A dated commitment becomes a live **burning fuse** your partner witnesses; post proof to defuse or it detonates (shame-free) | appointment (10%→95%) + witness + loss aversion |
| 2 | **Boss Forge** | Squad co-op weekly boss; check-ins damage it, misses let it hit the squad | Köhler effect / shared goal |
| 3 | **Chain of Fire** | Shared squad streak — only advances if everyone checks in; shared Ember Freezes | streak loss aversion × peer obligation |
| 4 | **FULL COURT** ⭐ (Jon's Law-of-Probability sales game) | Play the day like a 4-quarter basketball game; buzzer + Odds Engine + season stats | score-the-activity + reframe rejection |
| 5 | **The Duel** | 7-day 1v1 vs your partner on activity points | winnable head-to-head |
| 6 | **Ascension** | Squads ranked vs ~8 peers; promote/relegate across **fire tiers** | Duolingo leagues |
| 7 | **Dawn Raid** | First "frog" logged before 9AM wins the day | eat-the-frog / morning momentum |
| 8 | **The Pit** | Opt-in stakes (fire/Cups/ego — **no real money**), partner is referee | commitment device |
| 9 | **Grind Room** (later phase) | Live co-work presence — "we're both grinding now" | body-doubling |

---

## 3) PERFORMANCE & MOTION LAW (critical — the concept page was too laggy)

The standalone concept's desktop mouse effects tanked performance. **This app is mobile-first. Those effects are BANNED here:**

- ❌ **NO** custom cursor, **NO** tilt-on-mousemove, **NO** mouse parallax, **NO** magnetic buttons, **NO** per-`scroll`/`mousemove` per-frame handlers.
- ✅ **Allowed:** CSS `transform`/`opacity` transitions & keyframes; **IntersectionObserver** entrance reveals; **one** capped `requestAnimationFrame` ember canvas that (a) caps particles low on mobile (`~24` mobile / `~60` desktop), (b) `cancelAnimationFrame` when `document.hidden` or scrolled offscreen (observe the canvas), (c) clamps `devicePixelRatio` to 2; tap/press-triggered particle **bursts** (fire on click only); the existing `celebrate()` confetti.
- Respect `prefers-reduced-motion` (drop to near-static). Animate only compositor properties (`transform`,`opacity`) — never `top/left/width` in loops. Use `will-change` sparingly. Target a smooth 60fps on a mid-range phone. If in doubt, cut the effect.
- The **FULL COURT** clock/scoreboard uses `setInterval(…,1000)` + DOM text updates (cheap) — fine. Keep game loops off `requestAnimationFrame` unless drawing.

---

## 4) THE FX / MOTION LAYER (build once, reuse everywhere)

Create `src/components/zone/arena/ArenaFX.jsx` + `src/components/zone/arena/useArenaFX.js`:

- `<EmberCanvas/>` — the mobile-safe ember/spark background (port `10-bg.html` logic, apply §3 caps). Tint from the active fire tier (`--zfire`). Mount inside the Zone root behind content.
- `useArenaBurst()` — returns `burst(x, y)` that spawns a short particle pop on the ember canvas at tap coordinates (used by buttons/cards on click).
- `useReveal(ref)` — IntersectionObserver entrance (fade+rise), staggered; no scroll listener.
- `<ArenaIntro/>` — the one-time cinematic (port `13-intro.html`): plays once per session (`sessionStorage`), self-removes with a safety-net timeout so it can never block the UI. Show on first Zone entry.
- **Sound:** extend `src/lib/sfx.js` with `buzzer`, `coin`, `whoosh`, `phoenix`, `pop`, `hover`(optional). Add a persisted mute toggle. Never autoplay; unlock on first gesture (sfx.js likely already handles the AudioContext unlock — verify).

All of the above must be inert/cheap when off-screen and respect reduced-motion.

---

## 5) DATA MODEL (new migrations — match 001/002 conventions)

`supabase/migrations/007_arena_tables.sql` (tables + RLS) and `008_arena_rpcs.sql` (`az_*` SECURITY DEFINER fns + grants). Server is authoritative; clients never write game outcomes directly except through RPCs. Every table: RLS on, readable by owner + witness + squadmates as appropriate, writable only via RPC.

**Tables (adjust names to match existing style):**
- `arena_vows` — `id, user_id, squad_id?, witness_id?, title, if_cue?, due_at timestamptz, stake?, status ('live'|'defused'|'detonated'), proof_id?, created_at`. Detonation resolves **lazily on read** (if `due_at < now()` and still `live` → `detonated` + notify witness).
- `arena_bosses` — `id, squad_id, week_start, boss_key, max_hp, created_at, defeated_at?`; HP is **derived** server-side from that week's squad check-ins (damage) and misses (retaliation) — don't store a mutable hp that clients poke.
- `arena_chains` — `squad_id, current_len, best_len, last_advanced_on, freezes_remaining`. Advances only when all *active* members checked in for the day.
- `arena_duels` — `id, a_user, b_user, starts_on, ends_on, status`; scores derived from each user's activity in range.
- `arena_squad_week` — `squad_id, week_start, points` (+ `arena_league` division mapping to fire tiers) for Ascension ranking.
- `arena_fullcourt_games` — `id, user_id, played_on, mode, points, doors, contacts, pitches, sales, q_won, ot, avg_dollar, created_at` (one row per finished game — the season log, replacing the concept's localStorage).
- `arena_stakes` — `id, user_id, referee_id, ref_kind ('vow'|'challenge'), ref_id, stake_kind ('fire'|'cups'|'ego'), amount, ladder_level, status ('pending'|'kept'|'forfeit')`. **No real-money columns.**

**RPCs (mirror `az_*` naming, return shapes like existing detail RPCs):**
- Vow: `az_vow_create`, `az_vow_list`, `az_vow_defuse(p_vow, p_proof)`, (detonation handled inside `az_vow_list`/state). On create/defuse/detonate → insert `zone_notifications` for the witness (uses existing realtime fan-out).
- Boss: `az_arena_boss_state(p_squad)`.
- Chain: `az_arena_chain_state(p_squad)`, `az_arena_chain_freeze(p_squad)`.
- Duel: `az_arena_duel_start(p_partner)`, `az_arena_duel_state`.
- League: `az_arena_league_state(p_squad)`.
- Full Court: `az_fullcourt_log_game(payload)` → returns updated season; `az_fullcourt_season(p_user)`; `az_fullcourt_h2h(p_partner)` → both stat lines.
- Dawn: `az_arena_dawn_state(p_squad)` (derive first-strike from `zone_proofs.local_time < 09:00`).
- Pit: `az_stake_create`, `az_stake_verify(p_stake)` (referee only), `az_stake_settle`.

Add corresponding wrappers to a **new `src/lib/arenaService.js`** (do NOT bloat zoneService.js), same `rpc()` helper + offline guard.

---

## 6) FRONTEND ARCHITECTURE (the .jsx files to create)

```
src/components/zone/arena/
  ArenaHome.jsx           # redesigned squad/arena home (replaces SquadHome's body)
  ArenaFX.jsx             # <EmberCanvas/>, <ArenaIntro/>  (§4)
  useArenaFX.js           # useArenaBurst(), useReveal()  (§4)
  arenaGames.js           # registry: [{ key, glyph, title, tagline, scope, Component }]
  ArenaGamesGrid.jsx      # the "choose your game" launcher (port ROSTER card feel, mobile grid)
  games/
    TheVow.jsx            # flagship — list + create + the fuse
    VowFuse.jsx           # animated fuse + live countdown subcomponent
    BossForge.jsx
    ChainOfFire.jsx
    FullCourt.jsx         # the playable 4-quarter game (UI)
    FullCourtStats.jsx    # season + Me-vs-partner NBA stat sheet
    TheDuel.jsx
    Ascension.jsx
    DawnRaid.jsx
    ThePit.jsx
    GrindRoom.jsx         # later phase
src/lib/
  arenaService.js         # az_arena_* / az_vow_* / az_fullcourt_* wrappers
  fullCourtEngine.js      # PURE logic: ladder [2,4,4,6,6,8,8,10]→quarters[6,16,30,48],
                          # scoring, heat, quarter buzzers, Odds Engine (Your Number,
                          # Value-of-a-No, on-pace). No DOM. Unit-testable.
src/styles/
  arena.css               # arena classes on top of zone.css tokens
supabase/migrations/
  007_arena_tables.sql
  008_arena_rpcs.sql
```

**Routing integration (ZonePage.jsx + ZoneNav.jsx):**
- Add `view === "arena"` → `<ArenaHome go={go} gameKey={viewParam} />`. Launch individual games via `go("arena", "the_vow")` etc. (ArenaHome reads `gameKey` and renders that game, else the hub).
- The **Squad tab** opens the Arena Home (Arena *is* the squad experience). In `TAB_ALIAS`, add `arena: "squad"` so the Squad glyph stays lit.
- Keep the 6-tab dock; no new tab needed. If a dedicated glyph is wanted later, add an SVG glyph to `ZoneNav` (never emoji).

**FULL COURT logic vs UI:** the live game runs entirely client-side via `fullCourtEngine.js` (pure state machine). Only the **final box score** is persisted via `az_fullcourt_log_game`. Season + H2H come from the DB (not localStorage). Keep the buzzer as WebAudio (`sfx.js`) + `navigator.vibrate`.

---

## 7) PER-MODE ACCEPTANCE (definition of done)

For **each** mode: a working component reachable from Arena Home; reads/writes only via `arenaService.js`; server-authoritative outcomes; witness/notification copy from `witnessLines.js`; brand-styled with `zone.css`/`arena.css`; mobile-smooth per §3; graceful `{offline:true}` handling; shame-free miss states with one-tap recovery.

- **Arena Home:** crest + squad level, Chain of Fire strip, Boss HP bar, **activity** leaderboard (reuse `az_get_leaderboard`, framed as activity/lane winners), live Vows, one-tap fire-bump (reuse `reactions`). Replaces the current `SquadHome` body.
- **THE VOW:** create a dated if-then vow with a witness (from `partner`/squad); it renders as a live fuse counting down (`VowFuse`); "Post proof → defuse" opens the existing `PostProof` flow and calls `az_vow_defuse`; expiry → detonated (shame-free) + witness notified + one-tap re-vow. This is the highest-leverage build — do it in Phase 2.
- **FULL COURT:** the 4-quarter game per `FULL-COURT-game.md` (ladder = per-quarter door targets 2-4-4-6-6-8-8-10 → cumulative [6,16,30,48]; No/Pitch/Sale scoring; quarter buzzer + haptic; **Odds Engine** live; overtime/score-past-it; personal best; season + Me-vs-partner stat sheet). Two tracking modes (Rookie: No/Pitch/Sale · Pro: Talked-To/Value-Build/Price-Drop/Close). Persist finished games; render season from DB.
- **Boss Forge / Chain of Fire / Dawn Raid / Duel / Ascension:** all derive from **real check-ins/proofs** (real-life-first). No free-tap scoring.
- **The Pit:** stakes in fire/Cups/ego only; partner referees via `az_stake_verify`. **No payment integration.**
- **Grind Room:** Supabase Realtime presence ("both grinding now"); ship last.

---

## 8) BUILD ORDER (phased — keep each shippable)

1. **Phase 0 — FX shell & sound.** `ArenaFX.jsx`, `useArenaFX.js`, extend `sfx.js`, `arena.css`, `<ArenaIntro/>`. No backend. Verify smooth on mobile (§3). ✅ when the Zone has the ember bg + intro + sounds, 60fps.
2. **Phase 1 — Arena Home.** Rebuild `SquadHome` → `ArenaHome` using EXISTING data (`az_squad_detail`, `az_get_leaderboard`, `az_list_challenges`). Immediate visual win, no new tables. ✅ when the "boring page" is the living arena.
3. **Phase 2 — THE VOW.** `007/008` (vows only), `arenaService`, `TheVow`/`VowFuse`, witness notifications. ✅ when you can vow → be witnessed → defuse-with-proof or detonate shame-free.
4. **Phase 3 — Boss Forge + Chain of Fire.** Squad co-op derived from check-ins. ✅ when a squad's check-ins visibly damage a boss & extend a shared chain with freezes.
5. **Phase 4 — FULL COURT.** `fullCourtEngine.js` (+ unit tests) → `FullCourt`/`FullCourtStats` → `az_fullcourt_*`. ✅ when a full game logs to the DB and the season + H2H render.
6. **Phase 5 — Duel + Ascension + Dawn Raid.** Competitive layer on activity. ✅ when partners duel, squads rank across fire tiers, and first-frog is tracked.
7. **Phase 6 — The Pit + Grind Room.** Stakes (no money) + realtime co-work. Ship last.

Deploy/verify after each phase (the repo has a browser-verify setup: preview serves `dist`, so rebuild first; demo login in the `reference_browser_verify` memory).

---

## 9) GUARDRAILS (hard rules)

- **Real-life-first:** every point traces to a real logged action. No empty-tap scoring in production paths.
- **Witness copy law:** all witness/notification microcopy from `witnessLines.js` (extend it). Never inline.
- **Shame-free:** misses/detonations/relegations are neutral + immediately recoverable. No red shame walls.
- **Backend pattern:** `az_*` `SECURITY DEFINER` RPCs + RLS on every table + explicit grants (see migration 006). Clients read via RLS, mutate via RPC. `arenaService.js` mirrors `zoneService.js` (`rpc()` + `{offline:true}`).
- **Brand:** `zone.css` tokens + fire tiers; Sora/Manrope (no monospace); emoji allowed in content, **never in nav glyphs** (SVG only).
- **Performance:** obey §3 to the letter. Mobile-first, 60fps, no mouse/scroll per-frame handlers.
- **Don't regress the Zone:** additive; keep existing views/tabs working; reuse `celebrate()`, `pushToast()`, `PostProof`, `reactions`, `az_get_leaderboard`, partner/squad state from `useZoneCtx`.

---

## 10) KICKOFF (first message to the new session)

> "Read `SQUAD-ARENA-APP-BUILD-PROMPT.md`, then **`SQUAD-ARENA-RESEARCH.md`** (the accountability research — WHY every game exists), then `squad-arena-concept.html`, `FULL-COURT-game.md`, `src/lib/zoneService.js`, `src/hooks/useZone.js`, `src/components/zone/ZonePage.jsx`, `supabase/migrations/001_zone_tables.sql` + `002_zone_helpers_policies.sql`, and `src/lib/sfx.js`. Then propose the Phase 0 + Phase 1 plan (files, and any Phase-2 schema) and start building — mobile-first, obeying the performance law in §3. Ask before any destructive DB operation."

**Reference memory:** `project_squad_arena`, `project_zone`, `brand_colors`, `feedback_fonts`, `reference_browser_verify`.

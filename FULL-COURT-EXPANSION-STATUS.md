# FULL COURT EXPANSION — Build Status

_Built 2026-07-07 from the "APP DEVELOPER EXPANSION" handoff. All 13 items addressed. Vite build green; engine + voice + live modules smoke-tested in Node; preview serves 200. Full browser E2E + the ElevenLabs voice bake still pending (see "Needs Jon" below)._

## Status table

| # | Feature | State | Notes |
|---|---------|-------|-------|
| 1 | Scoring fix (real conversion, not auto-sale) | ✅ Done | Sales only count on the Sale/Close button. Conversion = S/D from real outcomes. Superseded by the 6-outcome model (#3). |
| 2 | Time/clock fix + schedule modes + controls | ✅ Done | Clock was already elapsed-from-tip-off (timestamp-based). Added **Standard / Saturday / Competition** schedules (2h / 1h / 3h quarters), **Pause**, **End quarter early**, and start-next-on-demand (skip). |
| 3 | 6 outcome types (FULL mode) + AI-ready data | ✅ Done | New **Full** mode: No Answer · Not Interested · Gatekeeper · Objection · Full Pitch · Sale (+2/+3/+4/+6/+8/+10). Per-door `doorLog` (outcome, quarter, points, sale, elapsed-frac) + `outcomes` tally on the game state — the AI pattern layer's raw feed. |
| 4 | Stats page (outcome breakdown) | ✅ Done (per-game) / ⚠️ Partial (season) | Post-game box score now has a 6-outcome breakdown grid + conversion% + good-pitch roll-up, plus the per-quarter breakdown strip. **Season-level** outcome splits + opponent comparison need the `az_fullcourt_season` RPC to persist/return `outcomes` (payload already sends it; column/RPC change is a Jon SQL task). |
| 5 | Multiplayer / challenge (live head-to-head) | ✅ Done (working, untested live) | `src/lib/fullCourtLive.js` over **Supabase Realtime Broadcast** — ephemeral pub/sub, **no migration needed**. Host/Join a 5-char code in setup; a live "vs" bar shows the opponent's points/doors/sales ticking up. Needs a **two-device live test** + confirm Realtime is enabled on the project. |
| 6 | Coach content expansion (2nd male voice) | ✅ Done | Female coaches untouched. Added **Alex — Basketball Coach** (male) as the hype/affirmation voice. Contextual triggers: good-pitch praise, keep-going grind lines, quarter-sale/bad recaps. |
| 7 | Motivation / affirmations system | ✅ Done | All of Jon's verbatim line sets in `src/data/fullCourtVoice.js`: 20 keep-going, 10 good-pitch, 10 quarter-bad (last-10-min countdown delivery, one/min), 10 quarter-sale, 30 OT, 20 Double-OT. "Always the positive outcome" law honored. |
| 8 | Sound design | ✅ Core done | On-court crowd ambient bed (hushed on pause/breaks), plus existing ball/swish/bank/dunk/buzzer/horn cues wired to jumbotron moments. Extended options (walking ambience picker, dedicated offense music cue) are follow-ups. |
| 9 | Hydration mechanic | ✅ Done | `HydrationCup.jsx` — **press-and-hold** the cup to fill it percentage-wise; a full cup banks, target 4/day (≈1 per quarter). Own localStorage, daily rollover. In the scoreboard. (Deeper FillYourCup cross-write is a follow-up.) |
| 10 | Overtime Mode (time-of-day tiers) | ✅ Done | Real-clock driven: **9:00–9:30pm = OVERTIME**, **9:30–10:00pm = DOUBLE OT**. Coach calls the tier on entry + every ~5 min; on-screen OT badge. `?fcot=ot` / `?fcot=2ot` forces a tier for testing. **No hard 10pm stop** (see open question). |
| 11 | Jumbotron visual layer | ✅ Done | `FullCourtJumbotron.jsx/.css` — arena shell, live shooting-stats ticker, full-screen bonus call-outs, **10 tiered combo-dunk takeovers** (Windmill→King Slam), Hot Zone flag, Clutch-time red-flash + final-10 countdown, quarter breakdown recap, final summary banner. Skin on top; base UI untouched. |
| 12 | Nav — surface the Roster | ✅ Done | New top-nav "Roster" button (left of Iron) opens a bottom sheet of all 10 games for one-tap launch + Challenge/Partner/Circle shortcuts. Files: `RosterSheet.jsx/.css`, `AppShell.jsx`, `App.jsx`, `ZonePage.jsx` (additive `initialParam`). |
| 13 | Daily tab — task lists | ✅ Done | To-Do / Errands / Calls checklists integrated **into** the Top 5 card (not a separate wizard). New daily-log arrays + generalized CRUD in `useAppData.js`, re-exported via `useDailyLog.js`, rendered in `TopFivePanel.jsx`. Auto-persists to the `user_data` blob (no migration). |

## Key files

**Full Court core**
- `src/lib/fullCourtEngine.js` — added FULL 6-outcome table, `outcomes` tally, `doorLog`, `outcomeBreakdown()`, payload `outcomes`.
- `src/components/zone/arena/games/FullCourt.jsx` — schedules, pause/end-quarter, two-voice wiring, OT tiers, ambient, hydration, live-match, jumbotron hookups.
- `src/components/zone/arena/games/FullCourt.css` — all new `fc-*` styles.
- `src/components/zone/arena/games/FullCourtJumbotron.jsx/.css` — spectacle layer (#11).
- `src/components/zone/arena/games/HydrationCup.jsx` — hold-to-fill cup (#9).
- `src/lib/fullCourtLive.js` — Realtime Broadcast head-to-head (#5).
- `src/data/fullCourtVoice.js` — Alex + Andrew scripts/pools (#6/#7/#10).
- `scripts/bake-fullcourt-voice.js` + `scripts/lib/eleven.js` (`alex`, `andrew` registry entries).

**Other surfaces**
- Nav: `src/components/layout/RosterSheet.jsx/.css`, `AppShell.jsx`, `App.jsx`, `ZonePage.jsx`.
- Daily: `src/hooks/useAppData.js`, `src/hooks/useDailyLog.js`, `src/components/daily/TopFivePanel.jsx`.

## Needs Jon / open decisions

1. **Voice bake (Alex + Andrew).** Registry entries `alex`/`andrew` currently point at proven premade **male fallbacks** so nothing is blocked (the runtime already streams the right-sounding male voice via Pollinations). To get the actual picked voices: paste each real ElevenLabs `voice_id` into `scripts/lib/eleven.js`, then `node scripts/bake-fullcourt-voice.js --audition` → approve → `node scripts/bake-fullcourt-voice.js`. Andrew is dynamic (real numbers) so he **streams only** — no bake, just the voice_id for the stream.
2. **Open design question (from handoff #2):** if a late start means all 4 quarters can't fit the day, what happens — skip / compress / log partial? Shipped default: quarters are fixed-length and the rep controls the pace with **Pause / End quarter early / skip**, so there's no forced truncation. Confirm the rule you want.
3. **Overtime hard stop:** handoff left "what happens at 10pm" open. Shipped: no hard stop — Double-OT lines simply stop after 10pm. Confirm.
4. **#5 live test:** needs two devices/tabs on the same code; confirm Supabase Realtime is enabled.
5. **#4 season outcome splits + opponent comparison:** add an `outcomes jsonb` column + surface it in `az_fullcourt_season` / `az_fullcourt_h2h` (payload already carries `outcomes`).
6. **Browser E2E:** run the roster→game, full quarter with `?fcdev`, buzzer/recap voice, OT via `?fcot=`, pause, hydration hold, and a two-tab challenge.

## Test flags
- `?fcdev` — 90s quarters / 45s OT / 60s breaks (fast play-through).
- `?fcot=ot` / `?fcot=2ot` — force the overtime tier regardless of real time.

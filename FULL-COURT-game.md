# 🏀 FULL COURT — *The Law of Probability Game*

> Play your day like a 4-quarter basketball game. Knock 50 doors, score points on every interaction, and let the **Odds Engine** prove the sale is baked into the math — you just have to keep knocking. The buzzer runs your phone.

*(Working title: **FULL COURT**. Alternates: THE BUZZER · COLD COURT · THE NUMBERS GAME · GAME CLOCK · LAW OF PROBABILITY. Pick your favorite.)*

This is the flagship **sales game** for The Zone. It **absorbs "Nitro No's"** from the concept deck (the "every no fuels the tank" idea becomes the *Value of a No* stat inside the Odds Engine) and rides on top of the squad/partner/streak systems already designed.

---

## 1. The pitch (your idea, leveled up)

The old way: a rep knocks doors, eats 40 no's, feels like garbage, and *quits before the math pays off* (research: avg rep quits after 2 attempts; 93% of sales happen on attempt 6+).

**FULL COURT flips it.** Every door is a possession. Every "no" is a **point on the board** and a **dollar in the bank**, because the Odds Engine has already calculated that — at your personal average — a sale is *statistically certain* inside every X doors. You're not hoping for a yes. You're **running out the clock until the math delivers it.** That is the emotional promise of the Law of Probability, made visible, loud, and fun.

It's a **basketball game** because basketball has everything sales needs: a scoreboard (instant activity dopamine), quarters (bite-sized pacing so a bad stretch never buries you), a buzzer (urgency + a moment), a box score (crazy stats), and season averages (identity — "I'm a 3-sale-a-game closer").

---

## 2. The core loop — *one day = one game*

- **The game** = your daily target. Default **50 doors / 50 conversations** (configurable per company).
- Split into **4 quarters** (~12–13 doors each), plus **Halftime** after Q2 and optional **Overtime**.
- You log each door with **one tap** as you go. The scoreboard updates live. The Odds Engine recomputes your projection in real time.
- **The Quarter Objective:** land **1 sale OR 3 good pitches** per quarter to "win the quarter" and keep your multiplier alive. (Everyone-can-win: activity counts, not just closes — straight from the research.)
- At the end of each quarter → **THE BUZZER** (sound + haptic + full-screen "END OF Q2"). Halftime gives a "locker room" pep + your first-half stat line. Final buzzer → box score + confetti + squad broadcast.

---

## 3. Scoring — the box score + **The Heat Ladder (2-4-4-6-6-8-8-10)**

Every action puts points on the board (instant dopamine, per the research):

| Action | Points | Basketball term |
|---|---|---|
| Door knocked (you showed up) | **+2** | you get on the court |
| Talked To / contact made | **+2** | a bucket |
| Good Pitch / Value Build | **+2** | and-one |
| Objection handled / Price Drop navigated | **+2** | tough finish |
| **Sale / Close** | **+10** | the dunk 🔨 |
| Sale in the final minute of a quarter | **+5 bonus** | **buzzer-beater** 🎯 |

**The Ladder = your 2-4-4-6-6-8-8-10 → per-quarter door targets.** The game is built as **8 escalating drives, 2 per quarter**, with climbing door goals: **2 → 4 → 4 → 6 → 6 → 8 → 8 → 10** (= **48 doors ≈ your 50/day**). The quarters ramp on purpose: you open with a light **2-then-4** warm-up (Q1 = 6 doors) and each quarter demands more, closing with a Q4 push of **8-then-10** (18 doors). By the time you're hot, the targets match your energy — and you must **land a sale before each quarter's buzzer** to "win the quarter." A separate **heat glow** rewards consecutive good pitches/sales for flair, but the ladder itself is the door structure.

Cumulative door checkpoints (when the quarter buzzers fire): **Q1 → 6 · Q2 → 16 · Q3 → 30 · Q4 → 48.**

---

## 4. The buzzer & the clock (the "crazy game" feel)

- **Quarter buzzer:** fires when you hit the quarter's door target **or** the quarter timer expires. Loud arena buzzer + phone haptic + full-screen flash: *"🏀 END OF Q1 · YOU'RE UP 38. NEXT QUARTER →"*
- **Halftime:** after Q2 — a "locker room" card: first-half box score, your close %, a one-line coach cue ("you're pitching great, ask for the sale sooner"), and a hype line.
- **Shot clock (optional):** a soft per-door pace timer that keeps you moving toward 50 ("next door in 1:30 — don't cool off").
- **Final buzzer:** confetti, full box score, "GG" broadcast to your squad, XP + streak credit.
- **Overtime:** if you're hot at the final buzzer (e.g., a sale in the last 2 min), tap into OT for bonus points / a few extra doors.
- **Audio/haptics:** reuse the existing **`sfx.js` WebAudio engine** (from Anger Gym) for the buzzer/whistle/swish, and `navigator.vibrate` for the haptic. Optional **ElevenLabs announcer** voice lines ("AND ONE!", "BUZZER BEATER!", "END OF THE QUARTER") using the audio pipeline already in the repo.

---

## 5. ⭐ THE ODDS ENGINE — *Law of Probability* (the part nobody else has)

This is the differentiator and the heart of your book. It tracks the funnel and does the math that turns rejection into inevitability.

**Tracked per game + rolling "season" average (recency-weighted):**
- `D` = Doors knocked
- `C` = Contacts / "Talked To"
- `P` = Good Pitches / "Value Builds"
- `O` = Objections handled / "Price Drops"
- `S` = Sales / Closes
- `$` = avg commission per sale (set once, or learned)

**The ratios it computes:**
- Answer rate `C/D` · Pitch rate `P/C` · Close rate `S/P` (and `S/C`, `S/D`)
- **YOUR NUMBER** = `D / S` → *"Knock **19 doors**, make a sale."* (and `C/S` → *"Talk to **7 people**, make a sale."*)

**The motivational outputs (this is the magic):**
- 💵 **Value of a NO** = `$ ÷ (contacts-per-sale − 1)` → *"Every 'no' just paid you **$38.**"* A no is money earned toward the yes.
- 🚪 **Value of a KNOCK** = `$ ÷ (doors-per-sale)` → *"Each door = **$14**, buyer or not."*
- 📈 **Live projection** = `remaining doors × (S/D) × $` → *"On pace for **$620** today. 2 sales left in these 50."*
- 🎯 **The Law of Probability line** = *"Your average holds. The sale is inside the next **11 doors** — keep knocking, the math owes you."* One slump doesn't break it; the engine shows the sale is a **statistical certainty** if you keep the activity up. (This is the antidote to "commission breath / desperation" — it *manufactures abundance*.)

Over time this becomes a genuinely **crazy sales stat log** the rep has never had before: their real, personal probability of a sale per door — trending up as they get better.

---

## 6. Two tracking modes (so it fits any rep)

You gave two ways to track — build both as selectable modes:

- **ROOKIE mode (simple):** three taps — **No · Good Pitch · Sale.** Fast, low-friction, great for door-knocking at speed.
- **PRO mode (full funnel):** **Talked To · Value Build · Price Drop · Close.** Deeper funnel = sharper Odds Engine math and richer stats.

Rep picks per game. Pro mode unlocks the advanced stat card.

---

## 7. The box score & season stats (the log)

- **Post-game box score:** points, doors, contacts, pitches, sales, close %, best heat streak, buzzer-beaters.
- **Player card / season averages:** Sales-Per-Game, Close %, Doors-Per-Sale, PPG, current streak, **career highs** ("career game: 6 sales / 118 pts").
- **Trends:** doors-per-sale dropping over weeks = visible proof they're getting better. Shareable to the squad feed.

---

## 8. Squad / Zone tie-in (why it lives in the Zone, not a standalone tracker)

- **Live league scoreboard:** the squad's games today, shown like an NBA scoreboard. **Everyone-can-win categories:** Most Doors, Best Close %, Longest Heat Streak, Most Improved, Most Points — so the middle 60% never checks out.
- **Buzzer pings your partner (the witness):** *"🔥 Jonny dropped 6 in the 3rd — 112 pts."* Felt observation = the #1 craving.
- **Feeds the other games:** every door damages **Boss Forge**; playing a full game = your **Chain of Fire** check-in; a "vow to play a full game today" is a **burning fuse** (The Vow); head-to-head = **The Duel**, but with the scoreboard.
- **Ceremony:** big games roll into the **Sunday Cauldron**.

---

## 9. Feel / animation beats (so it looks insane)

- Live **scoreboard** in your brand neon (cyan/magenta on void), digits that flip like an arena board.
- Points **fly up** off each logged door (+2, +10, "BUZZER BEATER +5") with the `sfx` swish.
- **Heat meter** that glows hotter up the 2→10 ladder; "ON FIRE 🔥🔥🔥" at max heat.
- **Buzzer transition:** full-screen quarter card, arena buzzer, haptic.
- **Odds Engine dial:** a "Your Number" gauge that ticks down as you knock ("11 doors to your next sale → 10 → 9…").
- **Final buzzer:** confetti + box score slam.

---

## 10. THE BUILD PROMPT (copy-paste, build-ready)

```
Build "FULL COURT — The Law of Probability Game": a sales-activity game for the
Zone's squad/challenges system where a rep plays their day like a 4-quarter
basketball game.

CORE LOOP
- One "game" = a daily target of D_target doors/conversations (default 50, configurable).
- Split into 4 quarters (~D_target/4 each) + Halftime after Q2 + optional Overtime.
- Rep logs each door with ONE tap. Live scoreboard + live Odds Engine recompute.
- Quarter Objective: 1 Sale OR 3 Good Pitches to "win" the quarter and keep the heat alive.

TRACKING MODES (selectable per game)
- ROOKIE: 3 taps — No / Good Pitch / Sale.
- PRO: full funnel — Talked To / Value Build / Price Drop / Close.

SCORING
- Door +2, Contact +2, Good Pitch +2, Objection handled +2, Sale +10,
  buzzer-beater sale (final minute of a quarter) +5 bonus.
- LADDER = per-quarter door targets: 8 drives [2,4,4,6,6,8,8,10] (=48 doors ~ 50/day),
  2 drives per quarter, ramping. Quarter buzzer cumulative checkpoints: [6,16,30,48].
  Separate "heat glow" for consecutive good pitches/sales (flair only).

ODDS ENGINE (Law of Probability) — track per game + recency-weighted rolling season:
  D=doors, C=contacts, P=pitches, O=objections, S=sales, $=avg commission/sale.
  Compute: C/D, P/C, S/P, S/C, S/D; YOUR NUMBER = D/S and C/S.
  Outputs (display live): 
   - Value of a NO = $ / (C/S − 1)
   - Value of a KNOCK = $ / (D/S)
   - Live projection = remaining_doors * (S/D) * $
   - "Sale is inside the next round(D/S − doorsSinceLastSale) doors" line.

BUZZER / CLOCK
- Quarter ends on door-target hit OR quarter timer expiry -> full-screen quarter
  transition + arena buzzer (reuse sfx.js WebAudio) + navigator.vibrate haptic.
- Halftime card (first-half box score + coach cue). Final buzzer -> confetti +
  box score + squad broadcast. Overtime if hot at final buzzer.
- Optional ElevenLabs announcer voice lines via existing audio pipeline.

STATS / LOG
- Post-game box score; player-card season averages (SPG, Close%, Doors/Sale, PPG,
  streak, career highs); doors-per-sale trend chart; shareable to squad feed.

ZONE INTEGRATION
- Add as a challenge/game template (key/icon/title/durationDays shape of
  challengeTemplates.js). 
- Live squad league scoreboard w/ everyone-can-win categories (Most Doors,
  Best Close%, Longest Heat, Most Improved, Most Points).
- Buzzer pings partner (witness) via witnessLines.js copy law.
- Doors feed Boss Forge damage; a completed game = Chain of Fire check-in;
  "vow to play a full game" = a Vow fuse; head-to-head = The Duel.

STYLE
- Brand neon (cyan #00F0FF / magenta #D11EFF on void #05000A), gold reward accents,
  fire-tier system. Fonts Sora/Manrope. Arena-scoreboard flip digits, points fly-up,
  glowing heat meter, "Your Number" gauge that ticks down.

CONFIG KNOBS
- D_target, quarter count, tracking mode default, avg commission $, per-company
  labels (doors vs dials vs conversations), sound/haptic on/off.
```

---

## 11. Locked in (2026-07-04)

- **Ladder** = per-quarter door targets `2-4-4-6-6-8-8-10` (48 ≈ 50/day). ✅
- **Name** = **FULL COURT**. ✅
- **Playable card** built into `squad-arena-concept.html` — live arena scoreboard, tap-to-log (No / Pitch / Sale), a real WebAudio **buzzer** + phone haptic at each quarter, the ramping door targets, and the **Odds Engine** computing "Your Number / Value of a No / On-pace $" in real time. Play a full 4-quarter game and hear the buzzer.

**Next:** wire it into the real React Zone as a challenge template (see the build prompt in §10) whenever you're ready.

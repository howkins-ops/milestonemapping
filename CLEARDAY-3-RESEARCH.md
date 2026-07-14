# CLEARDAY 3 — RESEARCH COMPENDIUM

Five-agent web-research sweep (2026-07-14) feeding the CLEARDAY 3.0 build: incantations, daily contracts, active urge interventions, per-substance daily needs, and color. Every claim cited; contested/retracted evidence flagged honestly. Product copy cites this file the way `clearDayData.js` cites the 10X prompt.

---

## Topic 1 — Incantations vs Affirmations

### Findings

1. **Self-affirmation works — but it is not "affirmations."** The Steele/Cohen–Sherman literature is about affirming *values you actually hold* to buffer a threat to self-integrity, not chanting aspirational trait claims (Cohen & Sherman 2014, *Annual Review of Psychology*). Boundary conditions: works when a self-relevant threat is present, before the defensive response, with genuinely important content — and it can backfire **when the person is told the affirmation is meant to change them**. Health-behavior meta-analyses (Epton et al. 2015; Armitage/Harris smoking work) find a small positive effect with occasional nulls/backfires.
2. **The Wood caveat is the central design constraint.** Wood, Perunovic & Lee 2009 (*Psychological Science*): repeating "I'm a lovable person" made **low-self-esteem participants feel worse** (statements too discrepant from self-view trigger counterarguing). Escape hatches: evidence-anchored statements the user has actually lived, and a "true and not true" softener. A recovery user on day 2 has fragile self-regard by default — design around the Wood failure mode.
3. **Interrogative self-talk is a legitimate opener.** Senay, Albarracín & Noguchi 2010: writing "Will I?" vs "I will" improved performance via *intrinsic* motivation — a question invites the person to generate their own reasons. The effect depends on actually *answering* the question. (Small-N social-priming era — promising, not bulletproof.)
4. **Saying it out loud beats reading it — for memory.** The production effect (MacLeod et al. 2010; MacLeod & Bodner 2017): reading aloud yields ~10–20% better memory, driven by encoding distinctiveness (mouthing < whispering < speaking); hearing your own voice adds benefit (Forrin & MacLeod 2017). The enactment effect adds a motor channel. Honest mechanism: **retrievability at urge-time**, not magic belief change.
5. **Embodiment: arousal-at-encoding is solid; power posing is not.** Emotional/physiological arousal at encoding strengthens consolidation (McGaugh) — a high-intensity "roar" round is defensible as an encoding amplifier. Power posing's hormonal/behavioral claims failed replication (Ranehill 2015; Credé); only **felt power** survives. Robbins' protocol (affirmation + physiology + full voice + repetition + peak emotional state, 5–10+ min while moving) has no controlled trials — its *components* do.
6. **Repetition builds belief logarithmically — and fast repetition destroys meaning.** Illusory-truth effect (Fazio 2015; Hassan & Barber 2021): repeated statements feel truer, but gains flatten fast — a handful of quality reps beats dozens. Counterforce: semantic satiation / defusion (Masuda & Hayes 2004) — rapid repetition of one word for ~30s *drains* believability. Keep incantations slow, full-sentence, meaningful; reserve fast word-repetition for defusing craving words in the battle.
7. **"I" for the incantation; "you"/name for the crisis.** Kross et al. 2014: distanced self-talk (non-first-person) cools emotion under stress — the opposite of an incantation's goal (fusion, ownership, arousal). Incantation = "I…". Urge/SOS de-escalation = "you"/name.

### Design implications (built into `Incantation.jsx`)

| # | Rule | Basis |
|---|---|---|
| 1 | Anchor every line to the user's own logged evidence — never aspirational trait claims | Wood 2009 |
| 2 | Open with an interrogative the user must answer ("Will I protect my clear mornings today?" → YES) | Senay 2010 |
| 3 | First person "I" throughout; distanced "you" belongs to the Urge Battle | Kross 2014 |
| 4 | 3 rounds escalating AROUSAL not rep count: Whisper 1× → Speak 2× → Roar 2-3× (5-6 total reps) | log-curve truth effect; production; arousal-encoding |
| 5 | Each rep slow (≥4-6s), full sentence — never rapid word-grinding for identity | Masuda/Hayes satiation |
| 6 | Round 3 pairs voice with a physical act (stand, fist to chest) — framed as feel + retrieval cue, no hormone claims | enactment; felt-power only |
| 7 | Let the user hear a voice model each round first, then produce it themselves; (future: record their roar, replay at battle-time) | Forrin & MacLeod 2017 |
| 8 | Frame as "connect to what's already true before today's urges" + a bad-day variant ("…and some mornings are still hard") | Cohen–Sherman awareness boundary; Wood softener |

**Limitations:** packaged Robbins protocol untested; production/enactment are memory effects; illusory-truth transfer to self-referential claims untested; self-affirmation effects small in exactly this population. One tool among many; let users opt out.

---

## Topic 2 — Commitment Contracts & Signing

### Findings

1. **Commitment contracts work modestly and persistently.** CARES smoking RCT (Giné, Karlan & Zinman 2010): deposit contracts raised 6-month abstinence ~3pp over control, **persisting at surprise 12-month test**; only 11% took up the offer (self-selection is huge). stickK self-report: stakes+referee ~78% vs ~35% with neither (directional only). Anti-charity > charity > friend > no deposit (JAMA Int Med observational).
2. **The famous signing study is fraudulent.** Shu/Mazar/Gino/Ariely (PNAS 2012 "sign at the top") — six failed replications (PNAS 2020), data shown fabricated (Data Colada #98), retracted. **Never cite "signing first reduces dishonesty."** What survives: **Kettle & Häubl 2011 (JCR) "signature effect"** — signing your name is a *self-identity prime* (helps only when the identity is on the page), and the **honesty-oath megastudy** (Zickfeld et al., *Nature Human Behaviour* 2024, n=21,506): ex-ante pledges reduce dishonesty (g≈0.27) and **content beats format** — naming the specific expected behavior is what matters; re-typing vs checkbox made little difference.
3. **Implementation intentions are the strongest single ingredient.** Gollwitzer & Sheeran meta: **d = 0.65** for if-then plans; among the most-replicated effects in self-regulation. The contract should carry one pre-committed if-then line.
4. **Fresh-start effect:** Dai, Milkman & Riis 2014 — temporal landmarks close the mental account on the past imperfect self. A daily morning signing manufactures a fresh start every 24h, including the morning after a slip. (Don't claim "morning willpower" — Kouchaki's morning-morality effect failed replication.)
5. **One day at a time beats forever.** Bandura & Schunk 1981 (proximal subgoals build mastery/self-efficacy; distal goals showed no effect); goal-gradient (Kivetz 2006); Marlatt's Abstinence Violation Effect — a forever-commitment turns one lapse into "I broke it, I'm hopeless"; a one-day contract caps the damage at *Tuesday's* contract.
6. **Witness the contract, not the aspiration.** Cialdini consistency (active/effortful/public commitments bind); BUT Gollwitzer 2009 "When Intentions Go Public": identity-goal announcements *reduce* action. Log/display the signed behavioral contract; never broadcast "I'm becoming X" socially.
7. **Ritual is defensible with an asterisk.** Hobson/Inzlicht 2018 review + ERN studies: fixed ritual sequences restore perceived control and steady self-regulation. (Brooks et al. ritual-anxiety flagship retracted — don't cite it.) Keep the ceremony short, identical, daily.

### Design implications (built into `DailyContract.jsx`)

| # | Rule | Basis |
|---|---|---|
| 1 | Today-only scope with explicit sunset: "Today, {date}, I stay clear. Just today — sunrise to sleep." | Bandura & Schunk; ODAAT; Marlatt AVE |
| 2 | Name the specific behaviors (the per-track Laws on the card), never vague virtue | Zickfeld NHB 2024 |
| 3 | Exactly one if-then line, pre-filled: "If an urge hits, then I open the Urge Battle before anything else." | Gollwitzer d≈0.65 |
| 4 | Identity-framed signature line: "Signed by the man I'm becoming" above the pad | Kettle & Häubl 2011 |
| 5 | Effortful act (draw the signature), but under ~10s — content matters more than mechanics | Cialdini; Zickfeld format null |
| 6 | Persist + display signed days as a ledger (the act, not the struggle) | Cialdini written record; stickK referee |
| 7 | Slip day = one voided contract, tomorrow's is blank: "Tuesday's contract is done. Today's hasn't been written yet." No signature required for honesty. | Marlatt AVE; fresh-start |
| 8 | Fixed short ceremony, same every day (contract → sign → seal) | Hobson/Inzlicht 2018 |

---

## Topic 3 — Active Urge Interventions

### Findings

1. **Doing beats enduring.** Shiffman's EMA work: performing *any* coping response is essentially the only predictor of surviving a temptation episode. Coping self-efficacy — built by successful active attempts — predicts abstinence across substances. IKEA effect (Norton 2012): effort raises valuation **only when the task completes** — every act needs a crisp completion payoff.
2. **SHATTER IT is directly supported.** Briñol et al. 2013 (*Psychological Science*, "Treating Thoughts as Material Objects"): physically discarding a written thought reduced its later influence; **the effect replicated digitally** (drag-to-recycle-bin worked); **merely imagining the action did nothing**. Masuda/Hayes defusion: the thought degrading into "just sounds/letters" is the active ingredient. Jenkins & Tapper 2014: defusion beat control on 5-day chocolate abstinence.
3. **The framing trap:** destruction must read as *defusion* ("this is glass, not law — it was never you"), never *suppression* ("make it stop"). Thought suppression rebounds (Wegner; Salkovskis & Reynolds: suppressing smoking thoughts increased smoking). After the shatter, normalize that the urge may still be present — that's separation working, not failure.
4. **Acute exercise:** strongest craving evidence in the field — effect sizes 0.4–1.98 vs passive control (Taylor/Ussher/Faulkner; Roberts 2012 meta); moderate intensity best (−34.6% craving, Haasova 2014 IPD meta); 5-min isometrics work (Ussher 2006/2009) but real-world relief lasts ~5 min — chain the exercise into reappraisal afterward. Cannabis-specific: Buchowski 2011 (30-min treadmill halved joints/day, n=12 uncontrolled). Honest note: 40s is below the studied dose — frame as a repeatable "starter burst."
5. **Cold water on the face** (DBT TIPP, dive-reflex vagal downshift) is a legitimate optional act for panicky urges — opt-in, sink required, cardiac/ED caution.
6. **Visuospatial load confirmed:** Elaborated Intrusion theory (Kavanagh/Andrade/May); Tetris studies (Skorka-Brown 2014/2015: ~14pp craving reduction, modest f²≈0.11, ~3-min bouts). The orb-catch should demand real tracking for 60–180s, not 15 trivial seconds.
7. **Play-the-tape mechanism:** Kober regulation-of-craving ("LATER" focus lowers craving via prefrontal control); episodic future thinking (d≈0.58–0.65 on discounting/demand). Scenes must be concrete, first-person, vivid — tomorrow's specific cost, not abstract harm.
8. **Urge surfing honestly:** Bowen & Marlatt 2009 — surfing didn't cut the acute peak but reduced smoking ~26% the following week. Acceptance decouples urge from action long-term; distraction/defusion handle the peak. Sequence them; sell surfing as "proof you outlast it," not "makes it smaller."

### Design implications (built into UrgeBattle 2.0)

| # | Rule | Applies to |
|---|---|---|
| 1 | SHATTER = real motor act on a visible thought-object, ~5-8+ deliberate taps, visible fragmentation — never auto-fade | SHATTER IT |
| 2 | Frame line: "This is glass, not law. It was never you." Post-shatter copy normalizes a still-present urge | SHATTER IT |
| 3 | BURN IT OFF: moderate-vigorous bodyweight (squats/pushups/high-knees/wall-sit), framed as a repeatable starter burst; honest about the short window | BURN IT OFF |
| 4 | Hand off from exercise directly into the why/law (relief fades in ~5 min — don't drop the user back into the urge) | sequence |
| 5 | Cold-water face option, opt-in, safety note | BURN IT OFF options |
| 6 | Orb-catch needs a real dose (60s+ genuine tracking) | Static Storm |
| 7 | Play-the-tape: concrete first-person tomorrow-morning scenes | tape act |
| 8 | Close every battle with proof of agency: urge rating before/after + "you did N acts" | victory |

**Missing pieces identified:** route by urge *type* (panicky → cold water/exercise; bored/ritual → visuospatial+reappraisal); an honest "still-here" landing (urge may remain = victory by non-action); porn track should weight the values/identity act (speak-the-law) more heavily (ACT/meaning framing beats willpower for PPU).

---

## Topic 4 — Per-Substance Daily Needs

### Weed: a body-recovery problem with a predictable clock

- Withdrawal begins 24–72h, peaks ~week 1, resolves 2–4 weeks — except sleep (DSM-5 time-course, BMC Psychiatry). Irritability + sleep disturbance reach significance by day 2.
- **Sleep is the long war:** REM rebound → vivid dreams days 2–9 (~34% of quitters); insomnia averages ~43 days. Daily users score *worse* on insomnia — "weed helps me sleep" is backwards (self-medication cycle). App job #1 weeks 1–6 = sleep coaching + dream normalization.
- **Evening is the danger window**; wake-and-bake is a severity marker (11.2% of use days). Cues are **removable objects** (pen/grinder/stash/smell) — environmental purge is a real lever (cue-reactivity fMRI).
- **Money saved** is a documented motivator (r/leaves themes; cessation-app calculators). **Movement:** Buchowski 2011 — 30-min walks nearly halved use.

### Porn: a context/device problem where shame is the accelerant

- **The cue is the phone at night:** traffic peaks 10pm–2am. Danger window is bed + phone + solitude.
- **The loop is emotional:** emotion-regulation difficulty + loneliness predict problematic use (J Sex Med 2022); porn is escape, not libido.
- **Shame is the load-bearing finding:** Grubbs & Perry moral incongruence — moral disapproval drives *perceived* addiction and distress largely independent of actual use. Moralizing copy ("clean/dirty", purity) is iatrogenic. **Streak counters are specifically risky** (AVE: lapse + "streak ruined" → full relapse ~2.5×; NoFap day-counter culture has documented iatrogenic potential — Prause & Binnie 2024). Count votes/actions, never make a day-counter the hero.
- **Friction with evidence:** phone-out-of-bedroom (sleep + on-ramp removal), grayscale after 9pm (20–38 min/day screen reduction in trials), blockers = "buys 30 seconds" framing (no trials). Cold showers: anecdotal only — label honestly.
- **7-day porn abstinence RCT found little classic withdrawal syndrome** — the porn story is environment + connection, NOT body-recovery narration.

### Shared vs distinct

| | Weed | Porn |
|---|---|---|
| Core narrative | Body recovery on a known clock (prophesy the timeline) | Context engineering + connection |
| Second motivator | Money saved | Real human connection |
| Cue strategy | Remove objects | Add device friction |
| Streaks | Relatively safe (biological milestones) | Risky — count votes, never days |
| Tone risk | Minimization — be direct | Shame — scrupulously non-moralizing |
| Check-in timing | Evening booster ~1h before historical use time | Night curfew ritual before 10pm, ends with a physical act (phone to kitchen) |

Both: morning law-vote as implementation intention; next-morning shame interrupt after any lapse (self-compassion first, then no-judgment debrief: time/device/feeling).

The 14 new seed lies + comebacks derived from this memo live in `clearDayData.js` (`SEED_LIES` w06–w12, p06–p12).

---

## Topic 5 — Color for a Sober App ("First Light" palette)

### Findings

1. **Pleasure tracks brightness + saturation more than hue** (Valdez & Mehrabian 1994; Wilms & Oberfeld 2018 replication). A dark theme can't add brightness → **chroma is the only pleasure lever left**. Grey-on-grey surrenders both.
2. **Grey literally encodes depression** — people with depression/anxiety pick grey for their mental state (Manchester Color Wheel). Near-achromatic slates are the color of the state the app is pulling users out of.
3. Cross-culturally (Jonauskaite 2020, 30 nations): black→sadness, **yellow/gold→joy** (55.7%). Golden-yellow is the most reliable joy signal.
4. Blue = calm/trust, but low-chroma blue-grey reads cold/concrete. Fix: shift toward **indigo/violet with more chroma in the darks** — night-sky navy reads "sky," slate-grey reads "asphalt."
5. Warm amber (2700–3000K firelight/sunrise) = hope/optimism and is circadian-friendly for an evening-used app. Amber should be the brand's emotional payload, used generously.
6. Category pattern: **"hopeful dark" = chromatic night + visible light sources (gradients, glow, stars, a horizon) + one generous warm accent** (Calm's night skies; Headspace's orange). "Dead dark" = flat grey panels + thin cool accents.
7. Craft: never pure grey neutrals (tint toward brand hue); elevation = lighter AND more chromatic; desaturate accents ~20-30% vs light mode but keep them bright; off-white text; gold glow as the "light = life" signal; WCAG AA 4.5:1 body.

### The shipped palette (all AA-verified against all three surfaces)

| Token | Old | New | Why |
|---|---|---|---|
| `--cd-ink` | #0b0f14 | **#0c1022** | night sky, not asphalt |
| `--cd-ink2` | #0f141b | **#10152b** | deep panel, indigo |
| `--cd-slate` | #161d26 | **#151b33** | surface-1: lighter AND more chromatic |
| `--cd-slate2` | #1d2632 | **#1d2440** | surface-2: toward violet |
| `--cd-line` | #26313d | **#262e52** | indigo seams |
| `--cd-mute` | #5f6b7a | **#6d75a0** | was failing AA; faint tier |
| `--cd-soft` | #8b98a8 | **#9aa1c9** | secondary text, indigo-tinted |
| `--cd-text` | #c3cdd9 | **#c9cde8** | body: AAA on all surfaces |
| `--cd-bright` | #eef3f8 | **#f4f1e8** | warm candle-white — "first light" on headings |
| `--cd-dawn` | #5e9df0 | **#7fb4ff** | luminous dawn-sky blue |
| `--cd-dawn-deep` | #2d5a8a | **#35619e** | |
| `--cd-amber` | #f0b45e | **#ffc46b** | true sunrise gold — the hope channel, used generously |
| `--cd-teal` | #4fd1c5 | **#5ce0d3** | |
| `--cd-green` (weed) | #5fcf8e | **#7be495** | spring growth green |
| `--cd-rose` | #e07a7a | **#ff7a88** | sunrise coral, not alarm red |
| `--cd-violet` (porn) | #a78bfa | **#b49bff** | pre-dawn violet |

Plus: app background is a vertical sky gradient (#0c1022 → #1a1c40) with a permanent low warm horizon glow (`.cd-atmos::after`) — the sunrise is always coming.

Sources: Valdez & Mehrabian 1994 · Wilms & Oberfeld 2018 · Jonauskaite et al. 2020 · Manchester Color Wheel (2010) · Material dark-theme guidance · Calm/Headspace/I Am Sober palette analyses · WCAG 2.x AA.

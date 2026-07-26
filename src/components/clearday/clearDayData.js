// ════════════════════════════════════════════════════════════════════════
// CLEARDAY — the data spine
// 66-day identity-first curriculum · day-indexed Body Reports (weed real
// physiology / porn honest timeline) · seeded lie decks · the Label Ladder.
// Copy obeys the language laws: "I don't" never "I can't", nouns only for
// the desired self, no "addict" anywhere, present-tense identity.
// Research citations appear in-line where a claim needs its receipts.
// ════════════════════════════════════════════════════════════════════════

export const TRACK_META = {
  weed: {
    id: "weed",
    label: "Weed",
    color: "#7be495",
    glow: "rgba(123, 228, 149, 0.95)",
    tintRgb: "123, 228, 149",
    lawHint: "I don't hit the pen. I'm a man with healthy lungs and clear mornings.",
  },
  porn: {
    id: "porn",
    label: "Porn",
    color: "#b49bff",
    glow: "rgba(180, 155, 255, 0.95)",
    tintRgb: "180, 155, 255",
    lawHint: "I don't open that tab. My desire belongs to real life.",
  },
};

export const LADDER = [
  { id: "chose", label: "Someone who chose to stop", minDay: 1 },
  { id: "exuser", label: "An ex-user", minDay: 14 },
  { id: "clear", label: "One of the clear", minDay: 33 },
];

export function ladderRung(rungId) {
  return LADDER.find((r) => r.id === rungId) || LADDER[0];
}

// Permissive lies + comebacks per track. w01/w02 were mined from Jon's own
// old conversations — his voice beats generic. The expansion set is built
// from the documented rationalizations users actually report
// (CLEARDAY-3-RESEARCH.md §4). Each lie carries 2-3 true answers so the
// duel never feels scripted.
export const SEED_LIES = {
  weed: [
    { id: "w01", lie: "You already bought it — may as well finish it.", comebacks: [
      "Sunk cost is the Mask doing math. The money's gone either way. My mornings aren't.",
      "Finishing it doesn't get the money back — it just spends my morning too.",
    ] },
    { id: "w02", lie: "One more hit and I'm done for real.", comebacks: [
      "“One more” is how every run ended. There is no last one — there's just the next first one.",
      "The last one already happened. I don't reopen a closed door to close it again.",
    ] },
    { id: "w03", lie: "You've earned it after today.", comebacks: [
      "I did earn something: a clear night. The pen doesn't pay out — it borrows from tomorrow.",
      "I earned a real reward — a meal, a walk, my bed. I don't pay for tonight's relief with tomorrow's morning.",
    ] },
    { id: "w04", lie: "You won't sleep without it.", comebacks: [
      "That's the rebound talking. My real sleep is coming back — the pen is what broke it.",
      "Weed traded my deep sleep for sedation. These rough nights are my brain rebuilding real sleep.",
      "The wild dreams are REM coming back online. That's a progress badge, not a problem.",
    ] },
    { id: "w05", lie: "It helps you relax and create.", comebacks: [
      "It rents me relief and charges me motivation. I create more in one clear morning.",
      "The couch never built anything. My best ideas show up in a clear morning.",
    ] },
    { id: "w06", lie: "It's just a plant. It's natural.", comebacks: [
      "The plant was never the problem — what my evenings became was.",
      "I don't outsource my calm to smoke, natural or not.",
    ] },
    { id: "w07", lie: "One hit tonight, back on track tomorrow.", comebacks: [
      "One hit sets my sleep clock back to day one. I don't trade two weeks of rebuilding for ten minutes of fog.",
      "Tomorrow-me inherits whatever tonight-me does. I don't hand him a reset.",
    ] },
    { id: "w08", lie: "You could just be a weekend smoker.", comebacks: [
      "Weekends is exactly where daily started. I don't renegotiate with a habit that already showed me its terms.",
      "I decided once so I never have to decide again. There's no small print on the Law.",
    ] },
    { id: "w09", lie: "Everyone you know smokes.", comebacks: [
      "Everyone I know isn't trying to get their mornings back. I am.",
      "I don't vote with the crowd — I vote for who I'm becoming.",
    ] },
    { id: "w10", lie: "You're more fun when you're high.", comebacks: [
      "Fog isn't fun — it's absence. The people who matter get more of me clear.",
      "I was never more fun. I was just less there.",
    ] },
    { id: "w11", lie: "It's been a brutal week. This is medicine.", comebacks: [
      "Medicine heals. This sedates. My stress is still there in the morning — plus fog.",
      "Stress wants a real exit: a walk, a shower, a person. Smoke is a locked door painted like one.",
    ] },
    { id: "w12", lie: "Nobody would even know.", comebacks: [
      "I would know. The vote counts most when no one's watching.",
      "The ballot is mine. I don't cast secret votes against myself.",
    ] },
  ],
  porn: [
    { id: "p01", lie: "Just a quick peek. It doesn't count.", comebacks: [
      "The peek IS the relapse. The door doesn't open a little.",
      "There's no such thing as one tab. I don't open doors I've already chosen to close.",
    ] },
    { id: "p02", lie: "You can't sleep anyway. Might as well.", comebacks: [
      "The screen is why I can't sleep. Phone leaves the room — that's the whole move.",
      "Late-night scrolling is the on-ramp, not a rest stop. My phone sleeps in the kitchen.",
    ] },
    { id: "p03", lie: "You've had a hard day. You deserve this.", comebacks: [
      "After a hard day I deserve something real. This trades ten minutes for a week of fog.",
      "I deserve better than a 1am shame hangover. I don't reward a hard day by making tomorrow heavier.",
    ] },
    { id: "p04", lie: "One look won't change anything.", comebacks: [
      "One look is a vote. I don't vote against the man I'm building.",
      "It was never one look. It was one look, then an hour I don't get back.",
    ] },
    { id: "p05", lie: "You'll quit for real tomorrow.", comebacks: [
      "Tomorrow-me doesn't exist. There's only this choice, and I don't.",
      "Tomorrow signs its own contract. Tonight's is already signed.",
    ] },
    { id: "p06", lie: "You already slipped — tonight's a write-off anyway.", comebacks: [
      "A slip is one frame, not the whole film. The shame spiral is the real relapse.",
      "I don't turn one bad hour into a bad week. The next clean choice starts now, not tomorrow.",
    ] },
    { id: "p07", lie: "It doesn't hurt anyone.", comebacks: [
      "It quietly costs the connection I'm building — with people, with a partner, with myself.",
      "I don't trade real intimacy for pixels.",
    ] },
    { id: "p08", lie: "You're too stressed to wind down without it.", comebacks: [
      "Stress wants comfort, and the screen is anesthesia — it numbs the loneliness and then feeds it back to me.",
      "I don't medicate feelings with a browser. Name the feeling, do the fix.",
    ] },
    { id: "p09", lie: "You're alone tonight — nobody would ever know.", comebacks: [
      "I would know. The vote counts most when no one's watching.",
      "I don't need witnesses to keep my word.",
    ] },
    { id: "p10", lie: "Just check social media for a minute.", comebacks: [
      "At 11pm, “just checking” is how it always starts. I don't negotiate with the algorithm after curfew.",
      "The scroll is the runway. I don't taxi toward a takeoff I've cancelled.",
    ] },
    { id: "p11", lie: "It's a need. Everyone has needs.", comebacks: [
      "My desire belongs to real life. The screen doesn't feed the need — it starves it and calls it dinner.",
      "This isn't desire, it's escape wearing desire's jacket.",
    ] },
    { id: "p12", lie: "You'll just feel worse fighting it all night.", comebacks: [
      "The urge can change shape without me obeying it. I can make room and choose the next move.",
      "I don't need a perfect zero. I need enough distance to protect the next choice.",
    ] },
  ],
};

// HALT-B — the state check. B is porn's classic setup (bored + late).
export const HALTB = [
  { k: "hungry", label: "Hungry", line: "Low fuel makes everything feel like an emergency.", fix: "Eat something real in the next 10 minutes. Urges shrink on a full stomach." },
  { k: "angry", label: "Angry", line: "Anger wants an exit. Don't let it pick this one.", fix: "Name what you're angry about — out loud or typed. The urge is borrowing its heat." },
  { k: "lonely", label: "Lonely", line: "The urge loves an empty room.", fix: "Reach one person. Not to be fixed — just so you're not alone in this minute." },
  { k: "tired", label: "Tired", line: "A tired brain can't weigh choices well.", fix: "If you can, lie down 20 minutes — without the phone. The urge is running on fumes too." },
  { k: "bored", label: "Bored", line: "Boredom is the void talking — the classic setup.", fix: "Pick one thing from your list and start it badly. Motion kills the void." },
];

/* ── THE GOOD SIDE ─────────────────────────────────────────────────────
   HALT-B alone made the check-in a symptom list: five ways to be badly
   and no way to be well, so opening the app on a fine day read as a
   prompt to go find something wrong. That's backwards, and it's also bad
   science — a good state isn't the absence of work, it IS the work:
   staying in it (savouring) extends it, saying it out loud to someone
   (capitalization) amplifies it, and positive states widen what you can
   see and build. Every one filed is evidence against the Mask's oldest
   lie, that clear life is flat. Same real estate, and it goes first. */
export const GOOD_STATES = [
  { k: "proud", label: "Proud", line: "That isn't luck. That's a day you authored, and you can feel the difference.", hold: "Say it as a sentence — “I ___.” Out loud, once. Naming what you did is how it becomes who you are." },
  { k: "happy", label: "Happy", line: "Ordinary happy is the whole payout. This is what the clear days actually buy.", hold: "Stay in it for thirty seconds before you reach for the next thing. That's the entire technique." },
  { k: "joyful", label: "Joyful", line: "The loud kind. Nothing to come down from, nothing to hide afterwards.", hold: "Spend it on someone — call, text, tell them why. Joy that gets told comes back bigger." },
  { k: "calm", label: "Calm", line: "No noise, nothing to manage. This is the baseline you're rebuilding, showing up.", hold: "Find where the calm actually sits in your body. That's the feeling to remember at 10pm." },
  { k: "confident", label: "Confident", line: "That's not a mood. That's the evidence stacking up where you can feel it.", hold: "Spend it while the tank's full — do the thing you've been putting off, today, before the feeling fades." },
  { k: "grateful", label: "Grateful", line: "Gratitude sees what's already here. The Mask never once let you look.", hold: "Name three, small and specific. Then tell one person they're on the list." },
  { k: "strong", label: "Strong", line: "Real energy, not borrowed. It's yours, and there's no bill coming later.", hold: "Put it through your body in the next hour — walk, lift, move. Energy spent well comes back." },
];

export const SAVOUR_RECEIPT = "Savouring extends positive affect (Bryant & Veroff); telling someone amplifies it (capitalization — Gable et al. 2004)";

/* ── BODY REPORTS ─────────────────────────────────────────────────────── */
// Weed: validated physiology, day-indexed. Every card carries its receipt.
export const BODY_REPORT_WEED = [
  { from: 1, to: 1, title: "Day one: the reset begins", body: "Within hours, THC levels start falling and your brain begins recalibrating. Tonight might feel restless — that's the system booting back up, not something breaking.", cite: "DSM-5 cannabis withdrawal course" },
  { from: 2, to: 3, title: "Irritability + rough sleep arrive on schedule", body: "This is the validated arc: sleep disruption and a short fuse show up first. It's physiology, not personality. It peaks soon and then it drops.", cite: "DSM-5 validated withdrawal syndrome" },
  { from: 2, to: 10, title: "Dream weather: vivid, strange, sometimes intense", body: "Weed suppressed your REM sleep for years. Now REM is rebounding — vivid dreams are literally your dream system coming back online. It's a healing sign, not a warning.", cite: "REM rebound — Feinberg 1975; sleep-architecture reviews" },
  { from: 4, to: 6, title: "The peak. This is as hard as the physical part gets", body: "Days 2–6 are the validated summit of withdrawal: mood swings, appetite weirdness, restlessness. You are exactly on schedule — and from here the slope points down.", cite: "Clinical withdrawal-timeline literature" },
  { from: 7, to: 10, title: "Your memory is already coming back", body: "In a landmark study, memory and verbal learning improved in the FIRST WEEK of abstinence — only in the people who stopped. Some of the sharpest gains land right now.", cite: "Schuster et al., MGH/Harvard prospective study" },
  { from: 11, to: 14, title: "Airways: the cleanup crew is on shift", body: "Airway inflammation started dropping within days. Around weeks 2–3 your cilia — the lungs' sweepers — resume clearing debris. A cough here can be the cleanup, not damage.", cite: "Airway-recovery clinical consensus" },
  { from: 15, to: 27, title: "The valley: when nothing feels great yet", body: "Heads up — weeks 2–6 can feel flat. Your reward system is renormalizing and ordinary pleasures haven't fully switched back on. This valley is mapped, temporary, and NOT evidence that clear life is dull.", cite: "Dopamine reward-response recovery studies" },
  { from: 28, to: 32, title: "Day 28: receptor reset", body: "In PET-scan studies, the CB1 receptors that daily use downregulated were statistically indistinguishable from non-users after about 28 days. The hardware is back.", cite: "CB1 PET imaging study, ~28-day renormalization" },
  { from: 33, to: 44, title: "Sleep architecture rebuilding", body: "Sleep disturbance is the longest-running symptom — it can take ~45 days to fully settle. Every clear night now is laying real structure back down.", cite: "Withdrawal course literature (~45-day sleep tail)" },
  { from: 45, to: 59, title: "Motivation is coming back online", body: "The slow systems — drive, pleasure, initiative — recover across weeks 6–12. If you're feeling pulls of real ambition again, that's the return you were promised.", cite: "Neurotransmitter recovery timelines" },
  { from: 60, to: 66, title: "You're running on recovered hardware", body: "Receptors reset, sleep rebuilt, memory sharper, airways clearing, reward system renormalizing. What you feel now is close to your real baseline — this is who you actually are.", cite: "Composite of the studies above" },
];

// Porn: honest, psychological, zero hype. Flagged claims stay flagged.
export const BODY_REPORT_PORN = [
  { from: 1, to: 6, title: "The first pull is loudest", body: "The habit ran on a tight cue loop — phone, bed, late, alone. The loop doesn't know you quit yet, so it keeps firing. Every unanswered fire weakens the wiring's grip on you.", cite: "Cue-reactivity / conditioning research" },
  { from: 7, to: 13, title: "Urges cluster around your danger hours", body: "Notice the pattern: they hit at the same times, in the same places. That's not weakness — that's a conditioned context. Change the context (phone out of the bedroom) and the urge loses its stage.", cite: "Context-cue design, relapse-prevention literature" },
  { from: 14, to: 44, title: "The flatline — named so it can't ambush you", body: "Many people report a stretch of low desire and low mood in here. It's widely reported (not lab-proven) and it passes. Do not read it as “broken” — read it as recalibration. Quitting during the flatline is the classic mistake.", cite: "Community-reported; flagged honestly as not RCT-proven" },
  { from: 45, to: 59, title: "Sensitivity returning to baseline", body: "What people describe as “feeling alive again” is most plausibly reward sensitivity returning to normal. No superpowers — just your real settings, which is the entire point.", cite: "Honest read of reward-sensitivity research" },
  { from: 60, to: 66, title: "Presence is the payout", body: "The realistic promise of this track was never magic — it was attention and desire that belong to real life again. Check the evidence in your vault: that's what you've been buying.", cite: "The honest ledger" },
];

export function bodyReportFor(track, day) {
  const list = track === "porn" ? BODY_REPORT_PORN : BODY_REPORT_WEED;
  return list.find((r) => day >= r.from && day <= r.to) || null;
}

/* ── THE 66-DAY CURRICULUM ────────────────────────────────────────────── */
// Identity-first staging per the arc laws:
//   1–14  The Fog    — claim before you've earned; survive with the kit
//   15–45 The Build  — convert biography + social gravity; replace, don't resist
//   46–66 First Light — stage the exit; widen the self
// Each day: { day, phase, title, skill, teach, vote, action, cite?, weed?, porn? }

const D = (day, phase, title, skill, teach, vote, action, extra = {}) => ({
  day, phase, title, skill, teach, vote, action, ...extra,
});

export const CURRICULUM = [
  // ═══ THE FOG · days 1–14 ═══
  D(1, "Fog", "Claim it before you've earned it", "Identity",
    "You don't earn the identity by finishing — you finish because you claimed the identity. People whose identity shifted in the first two weeks were the ones still standing months later.",
    "Casting today's vote says: the claim came first, on purpose.",
    "Say your Claim out loud, once, in full.",
    { cite: "Beckwith & Best 2015 — first-two-weeks identity change predicts retention" }),
  D(2, "Fog", "The wave always breaks", "Urge mechanics",
    "An urge is not a command. It can rise, fall, return, or stay present for a while. You do not have to make it vanish; create enough distance to choose the next protective action.",
    "Riding one wave is a vote: urges don't give me orders.",
    "If a pull comes today, open the Battle instead of arguing with it.",
    { cite: "Craving-curve research: urges peak and fall within minutes" }),
  D(3, "Fog", "Name the Mask's voice", "Externalization",
    "The craving speaks in first person — “I need it” — so it can wear your voice. It isn't you. Every line it says gets attributed to the Mask by name, out loud.",
    "Naming the voice is a vote: I know whose thought that was.",
    "Catch one Mask line today and answer: “That's not me — that's the Mask talking.”"),
  D(4, "Fog", "Your Law has no fine print", "The Law",
    "“Cutting back” and “only on weekends” force a fresh decision every single time — and one of those decisions eventually loses. A categorical Law decides once: I don't.",
    "Re-signing the Law is a vote for the man who decided once.",
    "Read your Law. If it has a loophole, close it today.",
    { cite: "PRIME theory (West) — personal rules with exceptions leak" }),
  D(5, "Fog", "Play the whole tape", "Future thinking",
    "The urge only shows you frame one — the relief. Vividly playing the tape to the end (both endings, in your own words, starring you) is one of the most tested tools in the field.",
    "Writing the real ending is a vote for the man who sees the whole movie.",
    "Write or sharpen both endings of your Tape in the Battle deck.",
    { cite: "Episodic future thinking — g≈0.52 on impulsive choice (Ye 2022, 47 studies)" }),
  D(6, "Fog", "Your Why, where 3am can find it", "The anchor",
    "Motivation fades; a written Why doesn't. The version of you at the weakest hour needs to find the words you wrote at the strongest one.",
    "Reading your Why is a vote: I remember who this is for.",
    "Re-read your Whys. Add one, or turn the hottest one up."),
  D(7, "Fog", "One week of evidence", "Milestone",
    "Seven days of votes. Your brain doesn't believe affirmations — it believes proof, and you just handed it a week of it. Look at the ballot, not the feeling.",
    "A week of evidence is a vote no doubt can out-argue.",
    "Open your Vault and read every stamp in it."),
  D(8, "Fog", "Meet the need, not the urge", "HALT-B",
    "Most urges are Hungry, Angry, Lonely, Tired or Bored wearing a costume. Meet the actual need and the urge often just leaves — it was never about the thing.",
    "Running the check is a vote: I run my state; it doesn't run me.",
    "Run one HALT-B check today before anything feels urgent."),
  D(9, "Fog", "Build your comebacks cold", "Coping cards",
    "The Mask's lies are predictable — that's its weakness. Write the comeback now, while you're clear, so the answer is loaded before the question gets asked.",
    "Every card written is a vote cast in advance.",
    "Add one new lie + comeback to your deck."),
  D(10, "Fog", "Remove the ambush", "Environment",
    "Willpower loses to convenience — that's not a character flaw, it's physics. Make the old behavior hard and the clear choice easy, and half the war never happens.",
    "Clearing a trap is a vote cast before the urge even arrives.",
    "Do your track's environment mission today.",
    { weed: "THE PEN MISSION: the pen is a loaded cue you carry in your pocket. Today it leaves — trash it, or lock it somewhere with real steps between you and it. You're not weak; you were carrying a trigger.",
      porn: "THE CURFEW MISSION: phone-in-bed is the whole setup. Tonight the phone sleeps outside the bedroom. That single move deletes the habit's stage." }),
  D(11, "Fog", "Sleep is a weapon", "Body",
    "A tired brain can't weigh a choice — every urge hits harder after midnight on no fuel. Guard your sleep like the strategic asset it is.",
    "An early night is a vote for the man with a working brain tomorrow.",
    "Set a wind-down time tonight and keep it.",
    { weed: "Your sleep is rebuilding itself right now (check the Body Report) — protect the construction site." }),
  D(12, "Fog", "Burn the fuel it runs on", "Body",
    "Hard movement is one of the largest fast-acting craving reducers ever measured. Sixty seconds of real effort can cut the legs out from under a pull.",
    "Moving hard is a vote: I get my chemistry the real way.",
    "Move hard for 10 minutes today — any form counts.",
    { cite: "Acute exercise vs craving — effect sizes up to ~1.9 (Taylor/Ussher)" }),
  D(13, "Fog", "Tell one person", "Witnesses",
    "Secrecy is the habit's home field. One person who knows what you're building roughly doubles your odds — not to police you, just to exist as a witness.",
    "Telling someone is a vote: I don't build in the dark.",
    "Tell one trusted person your Claim — today."),
  D(14, "Fog", "The Fog lifts — and the ladder climbs", "Milestone",
    "Two weeks. The hardest physical stretch is behind most people now. You've out-lasted the part that breaks the most attempts — and your label has a new rung available.",
    "Fourteen days of votes: the election is turning.",
    "Check the Label Ladder — the next rung is yours if you want it."),

  // ═══ THE BUILD · days 15–45 ═══
  D(15, "Build", "Fill the space on purpose", "Replacement",
    "The habit ate hours of your life. If you don't refill that space deliberately, the void refills itself — with the same tenant. Replacement beats resistance every time.",
    "Building the new life is a vote you can't fake.",
    "Name two things that now own the old time slots."),
  D(16, "Build", "Act as the man, not toward him", "Identity",
    "You don't grind toward becoming free and arrive someday. You act as the free man today, and the evidence catches up. Being comes before having — always has.",
    "One as-if action is a vote that becomes true on contact.",
    "Do one thing today the clear man would do, exactly how he'd do it."),
  D(17, "Build", "Overconfidence is a trap with your name on it", "Vigilance",
    "“I've got this — one won't hurt now” has ended more runs than any bad day ever did. Confidence is earned; permission is counterfeit.",
    "Naming the trap is a vote for the humble man who keeps his gains.",
    "Watch for one “I've got this” thought today and file it as a Mask line."),
  D(18, "Build", "The two-minute vote", "Micro-habits",
    "You can't fail a vote small enough. On the worst days, cast the tiniest version — it counts exactly the same in the ledger.",
    "A two-minute rep is still a full vote.",
    "Do the smallest version of any good habit you own."),
  D(19, "Build", "Reinterpret one memory", "Story work",
    "The habit sold you a story about the good old times. Pick one using-era memory and re-caption it with what was actually happening — supply, escape, fog.",
    "Re-captioning the past is a vote for the man who sees clearly backwards too.",
    "Write one sentence: what that memory actually was.",
    { cite: "McIntosh & McKeganey — identity work move #1: reinterpret the lifestyle" }),
  D(20, "Build", "The buried you", "Story work",
    "The habit didn't just cost time — it buried traits. Name three things it suppressed (patience, drive, presence) and give one of them a job this week.",
    "Excavating a trait is a vote: the real me was under there all along.",
    "List 3 buried traits; put one to work today.",
    { cite: "McIntosh & McKeganey — identity work move #2: the buried self" }),
  D(21, "Build", "Three weeks: the groove is forming", "Milestone",
    "21 days. The clear default is starting to feel less like effort and more like gravity. That's the automaticity curve doing its work — right on schedule.",
    "Three weeks of votes: the track record is real now.",
    "Read your ballot. Notice which votes came easily."),
  D(22, "Build", "Sit with one hard feeling", "Distress tolerance",
    "The skill was never avoiding hard feelings — it's proving you can hold one without reaching for the exit. Every held feeling shrinks the habit's job description.",
    "Sitting with it is a vote: I don't need anesthesia for being human.",
    "Let one uncomfortable feeling exist today without fixing it."),
  D(23, "Build", "Values over urges", "Values",
    "When an urge and a value collide, whichever you feed gets louder. Every value-first choice re-prices the next collision in your favor.",
    "Choosing the value is a vote that compounds.",
    "Name your top value. Act from it once, visibly."),
  D(24, "Build", "Sharpen the deck", "Coping cards",
    "You know the Mask's script better now than you did on day 9. Upgrade your comebacks with three weeks of intel.",
    "A sharper card is a smarter pre-cast vote.",
    "Edit or add one card using something you learned the hard way."),
  D(25, "Build", "Celebrate like it matters — because it does", "Reward",
    "The celebration isn't decoration: rewarding the rep immediately is one of the few mechanisms with real trial wins behind it. Let the win land.",
    "Taking the win is a vote: clear pays out too.",
    "Give yourself one real, clean reward for this week.",
    { cite: "Contingency management d≈0.42; immediacy scales the effect" }),
  D(26, "Build", "Rehearse the good ending", "Future thinking",
    "You've played the warning tape. Now run the other reel deliberately: a dated, specific, sensory scene from your clear future — starring you, not a concept.",
    "Rehearsing the win is a vote for the man in that scene.",
    "Read your clear tape; make it more vivid — add a place and a person."),
  D(27, "Build", "Script the refusal", "Rehearsal",
    "You'll be offered it — by a friend, a night, a mood. Decide the exact words now: “I don't.” Rehearsed refusals hold; improvised ones wobble.",
    "A rehearsed no is a vote made ahead of schedule.",
    "Say your refusal line out loud, once, like you mean it."),
  D(28, "Build", "Four weeks in", "Milestone",
    "A month. Most attempts never see this day. Whatever doubt says, the ledger disagrees — and the ledger is the one keeping receipts.",
    "28 days of votes: this identity has a paper trail.",
    "Sit with the month. Read the first stamp in your vault.",
    { weed: "Body Report headline today: in imaging studies, CB1 receptors are statistically back to normal around now. The hardware reset is real." }),
  D(29, "Build", "Check the state before the choice", "HALT-B",
    "By now the check should run before hard decisions, not just urges. State first, choice second — that ordering is the whole discipline.",
    "An automatic check is a vote that casts itself.",
    "HALT-B check before one decision today, any decision."),
  D(30, "Build", "Why this time is different", "Story work",
    "Not willpower — structure. Write the concrete answer: what's different now in your environment, your knowledge, your stakes, your people. Make the case like a lawyer.",
    "The written case is a vote future-doubt has to argue against.",
    "Write 3 sentences: what's structurally different this time.",
    { cite: "McIntosh & McKeganey — identity work move #3" }),
  D(31, "Build", "Boredom has a plan for you — have one for it", "Environment",
    "Empty hours are the void's recruiting ground, and the classic setup for both fronts. A pre-decided move for the next empty stretch beats any amount of resolve inside it.",
    "Planning the empty hour is a vote against the void.",
    "Name exactly what you'll do in your next empty stretch."),
  D(32, "Build", "Study the enemy's schedule", "Awareness",
    "Your urges keep hours. Look at your battle log: same times, same rooms, same moods. A pattern you can see is a pattern you can starve.",
    "Reading the log is a vote for the man who does reconnaissance.",
    "Find one pattern in your urge history and name it."),
  D(33, "Build", "Halfway — and the top rung unlocks", "Milestone",
    "Day 33. In the actual 66-day study, habits reached automaticity here for many people. The grooves are cut. And the ladder's top rung — one of the clear — is now open.",
    "Halfway: repeated votes are teaching you what you choose.",
    "Visit the Ladder. Take the rung if it's true.",
    { cite: "Lally et al. 2010 — median 66 days to automaticity, range 18–254" }),
  D(34, "Build", "A slip is a data point, not a verdict", "Resilience",
    "If a slip ever happens, the danger was never the slip — it's the story after it. One vote against isn't the election, and the ledger never resets. Decide that now, in peacetime.",
    "Pre-deciding the comeback is the most important vote in the deck.",
    "Read the slip flow once, calmly, so it's familiar if ever needed.",
    { cite: "Abstinence-violation effect (Marlatt) — the attribution decides the outcome" }),
  D(35, "Build", "A letter from the far side", "Future self",
    "Write one line from day-66 you back to today-you. People who correspond with their future self make measurably better near-term choices — it's one of the cleanest tricks in the file.",
    "Hearing from him is a vote for the long game.",
    "Write one line from future you. Put it in the Vault.",
    { cite: "Future-self letters — Rutchick 2018; Chishima & Wilson 2021" }),
  D(36, "Build", "Stack the new on the old", "Habit design",
    "Attach a clear habit to a cue that already fires — after coffee, after the gym, after parking the car. The old wiring carries the new cargo for free.",
    "A stacked habit is a vote on autopilot.",
    "Stack one tiny clear habit onto an existing routine."),
  D(37, "Build", "Feed the clear circle", "Witnesses",
    "You become the average of the rooms you're in. One real act toward the people who know the clear you — that's identity infrastructure, not socializing.",
    "Reaching toward the clear circle is a vote with a witness.",
    "Make one concrete plan with someone good for you.",
    { cite: "SIMOR (Best 2016) — recovery is a social identity transition" }),
  D(38, "Build", "Count what's already back", "Gratitude",
    "Attention is a spotlight — point it at what the clear life has already returned. Recovery from abundance beats recovery from deprivation every day of the week.",
    "Counting the returns is a vote: this life is already paying.",
    "Add 3 items to your Freedom Audit."),
  D(39, "Build", "Build the reset ritual", "Resilience",
    "Bad hours happen. A pre-built reset — walk, shower, call, cold water — stops a bad hour from becoming a bad night. Design it now; deploy it later.",
    "Owning a reset is a vote: I don't let sparks become fires.",
    "Write your 3-step reset ritual."),
  D(40, "Build", "Forty days of receipts", "Milestone",
    "When doubt whispers “you haven't really changed,” you now hold forty days of receipts that say otherwise. Doubt argues with feelings; it can't argue with the vault.",
    "Forty votes is not a fluke — it's a pattern with a signature.",
    "Open the Vault when doubt shows up today. Even once."),
  D(41, "Build", "Teach one thing back", "Mastery",
    "Explaining a tool to someone else is the fastest way to weld it into yourself. You know enough now to hand someone a working piece of this.",
    "Teaching it is a vote for the man people learn from.",
    "Explain one CLEARDAY tool to one person, in your own words."),
  D(42, "Build", "The boring basics are the whole game", "Body",
    "Six weeks in, the threat isn't drama — it's drift. Sleep, food, movement: the unglamorous three carry everything else. Re-commit to one.",
    "Guarding a basic is a vote for the disciplined man.",
    "Pick your weakest basic and fix it for today only."),
  D(43, "Build", "Say it out loud again", "Identity",
    "Your Claim, spoken, in full, present tense. Producing the words — voice, breath, out loud — encodes them deeper than any silent read.",
    "Speaking it is a vote your own ears witness.",
    "Say your Claim out loud, today, once.",
    { cite: "Production effect (MacLeod) — spoken > written > read" }),
  D(44, "Build", "The dip is on the map", "Vigilance",
    "Somewhere around here motivation sags — the novelty is gone and the identity isn't fully set. That dip is charted terrain, not a red flag. Walk through it on schedule.",
    "Pushing through a mapped dip is the vote that separates finishers.",
    "Write what you'll do on the next low-motivation day."),
  D(45, "Build", "The Build is done", "Milestone",
    "45 days. You didn't just resist a habit — you replaced a life. Look around: there's something here now where the absence used to be.",
    "45 votes built an actual life. That was the real work.",
    "List what exists now that didn't on day 1."),

  // ═══ FIRST LIGHT · days 46–66 ═══
  D(46, "First Light", "Notice the missing effort", "Integration",
    "Somewhere recently, a clear choice happened without you noticing it was a choice. That's the shift: the default flipped. Catch it in the act today.",
    "An effortless vote is the strongest evidence in the file.",
    "Notice one moment today where clear was just... automatic."),
  D(47, "First Light", "The verb became a noun", "Identity",
    "This stopped being a thing you're doing and started being someone you are. You're not enduring a challenge anymore — you're living a life.",
    "Being — not becoming — is today's vote.",
    "Catch yourself living as the clear man once today. That's the rep."),
  D(48, "First Light", "Comfort is a cue too", "Vigilance",
    "“I'm fine now” at day 48 has ended more runs than day 4 ever did. Stay honest: run one check while feeling great, precisely because you feel great.",
    "Checking while strong is a vote for lasting freedom.",
    "Run one HALT-B check today even though nothing's wrong."),
  D(49, "First Light", "Seven weeks", "Milestone",
    "The person who started this could barely picture today. You're living inside his impossible. Take one minute and actually thank him.",
    "Seven weeks of votes: a landslide by any count.",
    "Write one sentence of thanks to day-1 you."),
  D(50, "First Light", "Fifty", "Milestone",
    "Half a hundred clear days. Numbers this size stop being streaks and start being biography. Mark it however feels true.",
    "Fifty votes: settled law.",
    "Mark day 50 — your way."),
  D(51, "First Light", "Hand someone a rope", "Contribution",
    "Nothing welds an identity like being its proof for someone else. Somewhere in your circle is a person quietly fighting this. Be findable.",
    "Lifting someone is the highest-denomination vote there is.",
    "Offer one honest word of support to someone struggling."),
  D(52, "First Light", "Tell it as the man who left", "Story work",
    "You're not “someone trying to stop” — you're someone who left and can say why. Tell the story once in the past tense and hear how it sounds.",
    "Owning the past tense is a vote for the whole arc.",
    "Tell your story to yourself or a witness — past tense, once.",
    { cite: "Redemptive narrative → 83% vs 44% sustained sobriety (Dunlop & Tracy 2013)" }),
  D(53, "First Light", "The tools stay sharp", "Maintenance",
    "Freedom isn't never needing the kit — it's owning a kit that's ready. Run one tool cold today, like a fire drill, so it's oiled when it matters.",
    "A cold rep is a vote for the prepared man.",
    "Run one Battle act or tool today, unprompted, just for reps."),
  D(54, "First Light", "Reclaim the good times", "Reclaiming",
    "Prove the celebration circuits work clean: do something purely fun today, fully clear, and let it actually count. Joy was never the habit's property.",
    "Clean joy is a vote: I don't need it to feel alive.",
    "Do one purely fun thing today, clear, and enjoy it on purpose."),
  D(55, "First Light", "Pre-build the hard day", "Resilience",
    "A genuinely hard day is coming eventually — that was always true. The difference now: you'll meet it with tools and a track record instead of an exit.",
    "Prepping the hard day is a vote it can't cancel.",
    "Write your hard-day plan: first call, first move, first hour."),
  D(56, "First Light", "Eight weeks", "Milestone",
    "56 days. The grooves are worn deep in the right direction now. What used to take a war takes a shrug.",
    "Eight weeks: the default has flipped for good.",
    "Name one thing that's now a shrug that used to be a war."),
  D(57, "First Light", "Bigger than the quit", "Life portfolio",
    "Here's a late-stage trap: making recovery your whole personality. The data says people with wide identities keep their gains. Feed the other selves — the builder, the lifter, the father.",
    "Feeding another identity is a vote for the whole man.",
    "Name 3 non-recovery identities you carry. Feed one today.",
    { cite: "Breadth of identity engagement predicts lower relapse (CSCW 2021)" }),
  D(58, "First Light", "Audit the returns", "Reflection",
    "Run the full accounting: mornings, money, memory, presence, self-respect. Name the return on 58 days of votes — in writing, where doubt can't round it down.",
    "Counting the winnings is a vote for staying rich.",
    "Add 5 entries to the Freedom Audit — the full haul."),
  D(59, "First Light", "Design day 67", "Future",
    "Day 66 isn't a finish line — it's a launch window. Decide now how votes get cast when the program isn't asking: which habits keep the ledger alive?",
    "Planning past the program is a vote for the forever version.",
    "Sketch your day-67 rhythm: what stays, what graduates."),
  D(60, "First Light", "Sixty", "Milestone",
    "Two months. Whatever “impossible” meant on day 1 — you're on the far side of it, looking back.",
    "Sixty votes: unassailable.",
    "Sit with sixty. No task. Just sit with it."),
  D(61, "First Light", "Old regulars still knock", "Realism",
    "Urges get rare, not extinct — a knock at day 61 is not a failure siren, it's an old regular checking if the address changed. It did. Answer accordingly.",
    "Greeting a late wave calmly is a veteran's vote.",
    "If a pull visits today, treat it like an old regular: known, named, shown out."),
  D(62, "First Light", "Find the keystone", "Habit design",
    "One habit in your week makes all the others easier — sleep, the gym, the morning routine. Find it, name it, and guard it above everything else.",
    "Protecting the keystone is a compound-interest vote.",
    "Name your keystone habit and its single biggest threat."),
  D(63, "First Light", "The life you almost didn't have", "Reflection",
    "Look at what the votes actually bought: the mornings, the people, the man in the mirror. This is the life that was on the other side of the tape all along.",
    "Seeing what you saved is a vote for never selling it back.",
    "Picture the day-66 scene you wrote on day 5. You're nearly in it."),
  D(64, "First Light", "Read the Claim as a fact", "Identity",
    "Open your Claim and read it one more time. Notice what changed: it's not aspiration anymore. It's a description. You did that — one stamp at a time.",
    "Reading it as fact is the vote the whole program was for.",
    "Read your Claim out loud. Present tense. It's just true now."),
  D(65, "First Light", "One clear day, fully lived", "Presence",
    "“There” was never the point — every clear day was the whole reward, including this one. Spend it awake. Tomorrow is a ceremony; today is the life.",
    "Today's vote counts exactly as much as day one's did.",
    "Be fully present in one ordinary moment today, on purpose."),
  D(66, "First Light", "First light", "Graduation",
    "66 days. The habit reformed, the identity set, the ledger full. You didn't chase the outcome — you became the man, and the outcome came home on its own. One question remains: is this something you're managing, or someone you are? You already know.",
    "The election is over. You won it one vote at a time.",
    "Graduate: keep the frame, or archive it. Either way — you're one of the clear.",
    { cite: "Best 2023 — half of resolved people retire the recovery label, at no cost" }),
];

export function lessonFor(day) {
  const idx = Math.min(Math.max(1, day), CURRICULUM.length) - 1;
  return CURRICULUM[idx];
}

export const PHASES = [
  { key: "Fog", name: "The Fog", range: [1, 14], desc: "The hardest stretch. Claim the identity before you've earned it — and survive on the kit." },
  { key: "Build", name: "The Build", range: [15, 45], desc: "Replace, don't resist. Rewrite the story, rebuild the circle, wear the grooves in." },
  { key: "First Light", name: "First Light", range: [46, 66], desc: "It stops being effort and becomes who you are. Then: graduate — exit, don't manage." },
];

export function phaseColorVar(phase) {
  return phase === "Fog" ? "var(--cd-violet)" : phase === "Build" ? "var(--cd-dawn)" : "var(--cd-teal)";
}

// ── THE STANDS — one spoken identity declaration per day, rotating.
// Declaration ≠ affirmation: present-tense, believable, action-adjacent —
// never grandiose (unbelieved "I am" claims backfire, Wood 2009). Spoken
// out loud with the incantation (production effect: spoken > read).
export const STANDS = [
  "I am the man who moves first.",
  "I am proof, not promise.",
  "I am the calm I used to smoke for.",
  "I am someone my word can stand on.",
  "I am the one watching the fog — not the fog.",
  "I am built by what I do before noon.",
  "I am done renting my brain to a screen.",
  "I am the kind of man who closes the day he opened.",
  "I am worth the discomfort of becoming.",
  "I am already the man behind Door B.",
  "I am the author here — the urge is just a character.",
  "I am what I repeat. So I repeat what I am.",
];

export function standFor(day) {
  return STANDS[(Math.max(1, day) - 1) % STANDS.length];
}

// ── RULE STARTERS — recovery-specific non-negotiables, tap-to-adopt.
// Environment beats willpower; each becomes strongest once ARMED with a
// when-then trigger (implementation intentions, d = 0.65 across 94 studies).
export const RULE_STARTERS = [
  "My phone sleeps outside the bedroom.",
  "I don't negotiate with the 1am version of me.",
  "Nothing I quit lives in my house — not hidden, gone.",
  "When I'm struggling, one real person hears it the same day.",
  "I eat before I decide anything after 9pm.",
  "Screens die 30 minutes before I do.",
  "A slip gets logged in the file, never buried.",
  "I move my body before I judge my day.",
];

// ── BANKRUPT WORDS — victim-language detector + creator swaps.
// The words you use are a feedback loop: "try/want/hope" frame you as a
// spectator of your own change; swaps put the pen back in your hand.
export const BANKRUPT_SWAPS = [
  { hit: /\btry(ing)?\b/i, from: "try", to: "do" },
  { hit: /\bwant\b/i, from: "want", to: "commit to" },
  { hit: /\bhope(fully)?\b/i, from: "hope", to: "generate" },
  { hit: /\bwish\b/i, from: "wish", to: "choose" },
  { hit: /\bcan'?t\b/i, from: "can't", to: "don't" },
  { hit: /\bshould\b/i, from: "should", to: "will" },
  { hit: /\bmaybe\b/i, from: "maybe", to: "by when?" },
];

export function powerCheck(text) {
  const t = String(text || "");
  for (const s of BANKRUPT_SWAPS) {
    if (s.hit.test(t)) return s;
  }
  return null;
}

// Wood-2009 guard — grandiose absolutes in a claim push it outside the
// latitude of acceptance and backfire. Process words beat perfection words.
export const GRANDIOSE_RE = /\b(forever|never again|completely|totally|perfect(ly)?|always|100%)\b/i;

// ── THE RECLAMATION CLOCK — real brain-recovery milestones, hour-counted.
// Honesty law: every date is a cited finding, never a promise. Day 66 is
// IDENTITY GRADUATION (Lally habit median + Best identity exit) — the word
// "healed" is banned; a healed-finish-line is the classic post-milestone
// relapse trap. Deadlines derive from day: day N lands (N-1)*24h after
// the day-1 midnight.
export const RECLAMATION_MILESTONES = [
  {
    id: "regrowth", day: 3, track: "weed",
    title: "THE REGROWTH IS ON",
    sub: "Receptor recovery measurably begins within the first ~2 days — your brain started rebuilding before the cravings even peaked.",
    cite: "CB1 availability rises within days of abstinence — Hirvonen 2012, PET imaging",
  },
  {
    id: "steepweek", day: 7, track: "weed",
    title: "THE STEEPEST WEEK, BANKED",
    sub: "Week one is the fastest receptor-recovery window there is. It's behind you now.",
    cite: "Recovery fastest in week 1, then plateaus — Hirvonen 2012",
  },
  {
    id: "window", day: 14, track: "all",
    title: "THE WINDOW",
    sub: "Identity change in the first two weeks is what predicts who makes it. Sleep architecture is rebuilding underneath you.",
    cite: "Early identity change predicts recovery — Beckwith & Best 2015",
  },
  {
    id: "cravingpeak", day: 14, track: "porn",
    title: "THE CRAVING PEAK IS BEHIND YOU",
    sub: "The sharpest cravings cluster in weeks 1–2. From here the pull loses altitude.",
    cite: "Clinical recovery timelines — cravings peak weeks 1–2",
  },
  {
    id: "nonuser", day: 28, track: "weed",
    title: "READS AS A NON-USER'S",
    sub: "Your brain's cannabinoid receptor density is now statistically indistinguishable from someone who never used. This is the honest detox line for weed.",
    cite: "CB1 density normal at ~4 weeks abstinent — Hirvonen 2012",
  },
  {
    id: "motivation", day: 42, track: "weed",
    title: "MOTIVATION BACK ONLINE",
    sub: "Dopamine and the other neurotransmitter systems stabilize around six weeks. The drive you thought was gone was borrowed, not lost.",
    cite: "Parallel neurotransmitter recovery ~6–12 weeks — abstinence reviews",
  },
  {
    id: "graduation", day: 66, track: "all",
    title: "IDENTITY GRADUATION",
    sub: "Not \"healed\" — there is no finish line and no cliff. The habit is automatic and the label is yours to keep or retire. The clock becomes a count-up from here.",
    cite: "66-day habit median — Lally 2010; identity exit at no cost — Best 2023",
  },
  {
    id: "benchmark", day: 90, track: "porn",
    title: "THE COMMON BENCHMARK",
    sub: "The widely used 90-day marker. Honest framing: it comes from animal research (DeltaFosB), not a human cure date — it's a horizon, not a verdict.",
    cite: "DeltaFosB decay ~90 days in animal models — framed as benchmark, not cure",
  },
];

export function milestonesFor(tracks) {
  const list = Array.isArray(tracks) ? tracks : [];
  return RECLAMATION_MILESTONES
    .filter((m) => m.track === "all" || list.includes(m.track))
    .sort((a, b) => a.day - b.day);
}

// ── THE NIGHT SHIFT — clock-aware evening layer.
// Timing spec straight from CLEARDAY-3-RESEARCH.md §4: weed's danger window
// is the evening; porn traffic peaks 10pm–2am and the curfew ritual must end
// with a physical act (phone leaves the bedroom). Fixed hours for now — a
// user-configurable curfew is a later nicety.
export const NIGHT = {
  DUSK_H: 19, // Night Shift card appears on Today
  ESCALATE_H: 21, // porn-track curfew escalation line
  CURFEW_H: 22, // the law: phone out of the bedroom by here
};

export function isNightShift(hour) {
  return hour >= NIGHT.DUSK_H || hour < 4;
}

// ── THE NIGHT LEDGER — nightly written inventory (Ritual step IV).
// Mechanic: negative affect is the most-cited relapse antecedent and it
// detonates HOURS after the trigger — in the evening risk window. Naming
// the day's fuel and ending in ownership (your column, not theirs)
// measurably lowers rumination. The urge at 11pm runs on fuel from 2pm.
export const LEDGER_AREAS = [
  "Pride",
  "How I See Me",
  "My People",
  "Sex & Desire",
  "The Mission",
  "Safety",
  "Money",
];

export const LEDGER_LENSES = [
  "I fed it",
  "I hid",
  "I was afraid",
  "I wanted control",
  "I kept score",
];

export const LEDGER_RECEIPT =
  "Negative affect — resentment, stress, loneliness — is the most-cited relapse trigger in the clinical literature, and it does its damage hours after the event: in the evening window. A written nightly inventory that ends in ownership lowers rumination. Daily inventory practice is the backbone of every 12-step maintenance program.";

// ── UNSEEN WORK — the daily service rep.
// Weed and porn are self-sealing rooms: hours alone, spent on you. One act
// pointed at another human attacks the self-focus loop directly (the
// "helper-therapy principle" — in recovery populations, helping others is
// among the strongest predictors of staying clear). Undetected = 2× crit.
export const SERVICE_WHO = ["My partner", "My kid", "A friend", "A stranger", "Someone struggling"];

export const SERVICE_RECEIPT =
  "The helper-therapy principle: in recovery populations, helping others is one of the strongest predictors of staying clear — it attacks the self-focus loop that drives compulsive use. Doing it unseen removes the last selfish payoff: credit.";

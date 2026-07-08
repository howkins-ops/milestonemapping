// FULL COURT · TWO-VOICE CAST — the spoken layer that rides the game.
//
//   🏀 COACH  = "Alex — Basketball Coach" (ElevenLabs `alex`). Motivation +
//               affirmations: in-round keep-going lines, good-pitch praise,
//               end-of-quarter recovery/celebration, Overtime + Double-OT.
//   🎙️ ANNOUNCER = "Andrew Griffin — Commentator" (ElevenLabs `andrew`). The
//               broadcast: quarter recaps with the stat line, the halftime roll,
//               and the final call. Announcer copy is DYNAMIC (real numbers), so
//               it streams live; the coach pool is static, so it also bakes.
//
// LAW (Jon): always speak the positive outcome — no negative framing, ever.
// Tone: raw D2D grind energy, not a motivational poster.
//
// Runtime: coach lines play through voiceOver.createLineAudio(text, COACH.voice,
// coachClip(id)) — the baked ElevenLabs mp3 first, the streamed male voice as an
// automatic fallback so it talks even before a bake. Announcer lines stream via
// createLineAudio(text, ANNOUNCER.voice) (no baked path — the numbers vary).
//
// To bake the static coach pool after Jon approves the audition:
//   node scripts/bake-fullcourt-voice.js --audition   (listen)
//   node scripts/bake-fullcourt-voice.js              (write public/audio/fullcourt/voice/*.mp3)

/* ------------------------------------------------------------------ *
 * Cast — registry name + streamed fallback voice (Pollinations)      *
 * ------------------------------------------------------------------ */

// The streamed fallback voices are the openai-audio set (see lib/voiceOver.js).
// onyx = warm/grounded male → the coach; echo = deep/resonant → the broadcaster.
// `voice` = the Pollinations streamed fallback; `elevenId` = the REAL ElevenLabs
// library voice, streamed at runtime through /.netlify/functions/tts (the coach
// pool is also baked to mp3 — see coachClip; the announcer is dynamic so it only
// streams). Keep elevenId in sync with scripts/lib/eleven.js (alex / andrew).
export const COACH = { id: "alex", label: "Coach Alex", voice: "onyx", elevenId: "ePEc9tlhrIO7VRkiOlQN" };
export const ANNOUNCER = { id: "andrew", label: "Andrew Griffin", voice: "echo", elevenId: "SF9uvIlY93SJRMdV5jeP" };

/** Path to a pre-baked coach clip (streamed voice is the fallback). */
export const coachClip = (id) => `/audio/fullcourt/voice/${id}.mp3`;

/* ------------------------------------------------------------------ *
 * COACH — in-round affirmations                                      *
 * ------------------------------------------------------------------ */

// Trigger: after a few "not interested"/pitch rounds — NOT every round.
export const COACH_KEEP_GOING = [
  "That door wasn't yours. The next one is.",
  "You're one knock closer to the yes that's coming.",
  "This is the job. Keep working it.",
  "Every rep you take is building the closer you're becoming.",
  "The math doesn't care about that door. Keep knocking.",
  "You're closer to a sale right now than you were five minutes ago.",
  "That's not a loss. That's data. Next door.",
  "You didn't come this far to stop at one no.",
  "Somebody on this street is saying yes today. Go find them.",
  "Keep the pace. The sale's already in the numbers.",
  "You're built for this. Walk to the next one.",
  "This is where the real ones separate. Keep going.",
  "That door forgot who you are. Remind the next one.",
  "You're not behind. You're one door from ahead.",
  "The number doesn't lie — your sale is coming.",
  "Stack the reps. The result takes care of itself.",
  "You knocked. That's already more than most people do today.",
  "Next door's got your name on it.",
  "This is the grind that pays. Keep moving.",
  "You're one conversation from turning this whole day around.",
];

// Trigger: a good pitch / value-build door — reinforcement.
export const COACH_GOOD_PITCH = [
  "That's how you do it. Clean and confident.",
  "That pitch was real work. Keep that energy.",
  "You just showed them exactly who they're dealing with.",
  "That's the version of you that closes. Stay there.",
  "Strong pitch. That's the standard now — keep hitting it.",
  "You made that look easy. That's growth.",
  "That's the pitch that gets remembered. Nice work.",
  "You're finding your rhythm. Keep riding it.",
  "That's a closer's pitch. Own it.",
  "That's exactly the level you should be playing at.",
];

/* ------------------------------------------------------------------ *
 * COACH — end-of-quarter                                             *
 * ------------------------------------------------------------------ */

// Quarter went BAD (low doors / no sales). Delivery mechanic: plays during the
// LAST 10 MINUTES, one clip per minute counting down — index 9 (line #10) at the
// 10-min mark … index 0 (line #1) at the 1-min mark. `coachBadQuarterClip()`
// maps minutesLeft → the right line.
export const COACH_QUARTER_BAD = [
  "Rough quarter. The next one's where you make it back.",
  "That's one quarter. It's not the day.",
  "The board resets. So do you.",
  "Slow quarter, not a slow closer. Get back on the doors.",
  "Every closer's had a quarter like this. It's not the story — it's one chapter.",
  "You're still in this. The next quarter's wide open.",
  "That number doesn't follow you into Q2. Leave it here.",
  "This is exactly when the comeback starts.",
  "You showed up. That's the part that matters most today.",
  "New quarter, clean slate. Go get it.",
];

// LANDED A SALE that quarter — delivered by the coach at recap.
export const COACH_QUARTER_SALE = [
  "That's a win on the board. Let's stack another.",
  "You closed. That's the whole game right there.",
  "That sale is proof — you know exactly how to do this.",
  "One down. Keep that same energy into the next quarter.",
  "That's what it looks like when you trust the process.",
  "Sale's in. Now let's make it two.",
  "That's the standard now. Keep playing at this level.",
  "You just proved the math right. Keep knocking.",
  "That's momentum. Don't slow down now.",
  "That's how champions open a quarter — with a W.",
];

/**
 * Which bad-quarter line to speak at a given minutes-left mark (1..10).
 * clip 10 → the 10-min mark, clip 1 → the 1-min mark.
 */
export function coachBadQuarterClip(minutesLeft) {
  const m = Math.max(1, Math.min(10, Math.round(minutesLeft)));
  return { id: `coach-badq-${m}`, text: COACH_QUARTER_BAD[m - 1] };
}

/* ------------------------------------------------------------------ *
 * COACH — Overtime (time-of-day triggered)                           *
 * ------------------------------------------------------------------ */

// OT (9:00–9:30pm) — raw work-ethic "one more door" energy. Rotate the set.
export const COACH_OT = [
  "It's not late. It's overtime. That's different.",
  "Everybody else quit at 9. That's exactly why this door's yours.",
  "One more door. That's the whole rule right now.",
  "This is where the real ones separate from the rest.",
  "9pm doesn't mean done. It means started.",
  "The sale doesn't check a clock. Neither do you.",
  "Every door after 9 hits different. Go get it.",
  "This hour right here — this is the one that builds you.",
  "Forget the time. There's a door in front of you.",
  "Nobody's watching right now. That's exactly why this counts.",
  "This is the hour that separates hobbyists from closers.",
  "One more knock. That's it. That's the whole job right now.",
  "The tired ones went home. You're still out here — that's the edge.",
  "This door doesn't know what time it is. Neither should you.",
  "Overtime's where legends get made. Keep walking.",
  "You've got more in you. Prove it — one more door.",
  "This is extra credit. Every door from here is pure upside.",
  "The competition's asleep. You're not. That's the whole game.",
  "Keep the legs moving. The sale's still out there.",
  "This is the version of you that gets remembered. Keep going.",
  "Nobody said the job ends at 9. Keep knocking.",
  "This hour is where you build the reputation. Don't stop now.",
  "One more door tonight pays off for a year.",
  "The night shift separates the pros from the rest. You're a pro.",
  "Keep the energy up. This door could be the one.",
  "You showed up when it got hard. That's the whole story right there.",
  "This late knock is the one nobody else was willing to make.",
  "Stay in it. The night's still yours.",
  "This is where discipline turns into results. Keep moving.",
  "One more door. Always one more door.",
];

// Double OT (9:30–10:00pm) — max-raw "you're a sicko for still being out here".
export const COACH_DOUBLE_OT = [
  "You're a sicko for still being out here. Good. Stay one.",
  "Double overtime. This is where the psychos live.",
  "Screw the clock — there's still a door standing.",
  "Wake them up. Somebody's getting a yes tonight.",
  "This late? This is savage territory. You belong here.",
  "Nobody does this. That's exactly why you're doing it.",
  "9:30 and you're still knocking — that's a different breed.",
  "Forget comfortable. Comfortable doesn't close doors this late.",
  "This is the hour that builds monsters. Keep going.",
  "You didn't come this far to stop with thirty minutes left.",
  "Knock it anyway. Let them decide if it's too late.",
  "This is where the story gets told later — “I was still out there.”",
  "Double OT isn't for everyone. It's for you.",
  "One more door. Then one more after that.",
  "This is unreasonable. That's exactly the point.",
  "The sale doesn't care that it's late. Go get it.",
  "You've got thirty minutes to be a legend. Use them.",
  "Sicko hours build sicko results. Keep moving.",
  "Last call. Make it count.",
  "This is the door nobody else was willing to knock. Go.",
];

/* ------------------------------------------------------------------ *
 * COACH — line picker (rotate, avoid immediate repeat)               *
 * ------------------------------------------------------------------ */

const POOL_IDS = {
  keepGoing: "coach-keep",
  goodPitch: "coach-pitch",
  ot: "coach-ot",
  doubleOt: "coach-2ot",
  quarterSale: "coach-saleq",
};

const POOLS = {
  keepGoing: COACH_KEEP_GOING,
  goodPitch: COACH_GOOD_PITCH,
  ot: COACH_OT,
  doubleOt: COACH_DOUBLE_OT,
  quarterSale: COACH_QUARTER_SALE,
};

/**
 * Pick a coach line from a pool. `seen` is a Set of recently-played ids the
 * caller threads through so the coach doesn't repeat back-to-back. Returns
 * { id, text } — id maps 1:1 to the baked mp3 filename.
 */
export function pickCoachLine(pool, seen, rnd = Math.random) {
  const lines = POOLS[pool];
  const base = POOL_IDS[pool];
  if (!lines || !lines.length) return null;
  const fresh = lines.map((t, i) => i).filter((i) => !seen || !seen.has(`${base}-${i}`));
  const bag = fresh.length ? fresh : lines.map((_, i) => i);
  const i = bag[Math.floor(rnd() * bag.length)];
  return { id: `${base}-${i}`, text: lines[i] };
}

/* ------------------------------------------------------------------ *
 * ANNOUNCER — Andrew Griffin, dynamic broadcast copy                 *
 * ------------------------------------------------------------------ */

const plural = (n, one, many) => `${n} ${n === 1 ? one : many || one + "s"}`;
const ordinal = (q) => ["1st", "2nd", "3rd", "4th"][q - 1] || `${q}th`;

/** Tip-off — the game intro. */
export function announcerTipOff({ team, mode }) {
  return (
    `And we are underway. ${team || "Solo run"}, ${mode === "pro" ? "pro" : "rookie"} mode, ` +
    `four quarters of door-to-door. Every knock's a possession — let's see who shows up. Tip-off!`
  );
}

/**
 * End-of-quarter recap with the stat line. `ended` is the quarterLog entry;
 * `game` gives running totals. Andrew reads what happened + the number.
 */
export function announcerQuarterRecap(ended, game) {
  if (!ended) return "";
  const doors = ended.doors || 0;
  const sales = ended.sales || 0;
  const head =
    ended.label && ended.label.startsWith("OT")
      ? `That's the overtime horn.`
      : ended.quarter === 2
      ? `That's the halftime buzzer.`
      : `End of the ${ordinal(ended.quarter)}.`;
  const line = `${plural(doors, "door")} worked, ${plural(sales, "sale")} on the board this quarter.`;
  const verdict = ended.won
    ? `Quarter goes to the closer — a sale landed when it counted.`
    : `No sale that quarter, but the reps are banking. The math's still loading.`;
  const total = `Running total: ${game?.points ?? 0} on the scoreboard, ${plural(game?.sales ?? 0, "sale")} for the day.`;
  return `${head} ${line} ${verdict} ${total}`;
}

/**
 * Halftime roll — the big first-half breakdown. `game` = running state,
 * `odds` = oddsEngine output for the doors-per-sale headline.
 */
export function announcerHalftime(game, odds) {
  const wonQs = (game?.quarterLog || []).filter((q) => q.won).length;
  const closeLine = odds?.yourNumber
    ? `At this pace it's ${plural(odds.yourNumber, "door")} to a sale — that's your number.`
    : "";
  return (
    `Halftime, folks. Let's go to the numbers. ${plural(game?.doors ?? 0, "door")} knocked, ` +
    `${plural(game?.pitches ?? 0, "solid pitch", "solid pitches")}, ${plural(game?.sales ?? 0, "sale")} closed, ` +
    `${wonQs} of two quarters won. ${closeLine} ` +
    `Two quarters left to write the ending. Back to you after the break.`
  );
}

/** A quick live stat drop (used sparingly — e.g. milestone crossings). */
export function announcerStatDrop(game, odds) {
  return (
    `Update from the floor: ${game?.points ?? 0} points, ${plural(game?.sales ?? 0, "sale")}, ` +
    `close rate holding at ${odds?.closePerDoor ? Math.round(odds.closePerDoor * 100) : 0} percent per door.`
  );
}

/** Final call — the game's over, read the box. */
export function announcerFinal(bx) {
  if (!bx) return "";
  const pb = bx.isPersonalBest ? " And that is a new career high — one for the record books!" : "";
  return (
    `That's the final buzzer! Final line: ${bx.points} points, ${plural(bx.doors, "door")} knocked, ` +
    `${plural(bx.sales, "sale")}, ${bx.quartersWon} of four quarters won.${pb} ` +
    `What a game. Same court tomorrow.`
  );
}

/* ------------------------------------------------------------------ *
 * Manifest for the bake script (static coach pool only)              *
 * ------------------------------------------------------------------ */

/** Every static coach line as { id, text } — the bake script iterates this. */
export function coachBakeManifest() {
  const out = [];
  const push = (base, arr) => arr.forEach((t, i) => out.push({ id: `${base}-${i}`, text: t }));
  push("coach-keep", COACH_KEEP_GOING);
  push("coach-pitch", COACH_GOOD_PITCH);
  push("coach-saleq", COACH_QUARTER_SALE);
  push("coach-ot", COACH_OT);
  push("coach-2ot", COACH_DOUBLE_OT);
  COACH_QUARTER_BAD.forEach((t, i) => out.push({ id: `coach-badq-${i + 1}`, text: t }));
  return out;
}

// FULL COURT — The Law of Probability sales game: PURE state machine.
//
// DOM-free, deterministic, unit-testable. No React, no window, no Date.now,
// no Math.random inside the pure fns — any nondeterminism (a real wall clock)
// is passed in by the caller. The live UI (FullCourt.jsx) owns the clock,
// sound, haptics and animation; this module owns the rules + the math.
//
// Model (from FULL-COURT-game.md §3): one game = 8 escalating "drives"
// [2,4,4,6,6,8,8,10] = 48 doors, 2 drives per quarter, so each quarter's door
// target ramps 6 → 10 → 14 → 18 and the cumulative buzzer checkpoints land at
// [6,16,30,48]. Score every door, race the quarter buzzer, and let the Odds
// Engine prove the sale is baked into the math.
//
// GAME DAY rules (2026-07-06): quarters end on the CLOCK ONLY, like real
// basketball — advanceDrive is the one way a quarter closes. Hitting the door
// target early awards a one-time TARGET SMASHED bonus and play continues;
// extra doors keep scoring. Buzzer-beaters come from the real clock (the UI
// passes opts.atBuzzer in the final stretch), never inferred from the target.

/* ------------------------------------------------------------------ *
 * Constants                                                          *
 * ------------------------------------------------------------------ */

// The Heat Ladder — 8 drives, 2 per quarter, climbing door goals.
export const LADDER = [2, 4, 4, 6, 6, 8, 8, 10];
// Per-quarter door targets (sum of that quarter's two drives).
export const QUARTER_TARGETS = [6, 10, 14, 18];
// Cumulative door count when each quarter buzzer fires.
export const QUARTER_CHECKPOINTS = [6, 16, 30, 48];
export const GAME_DOORS = 48; // regulation door target
export const HEAT_ON = 2;     // consecutive good actions before "on fire"
export const BUZZER_BONUS = 5; // buzzer-beater sale bonus
export const TARGET_BONUS = 5; // TARGET SMASHED — quarter door target hit early

const DEFAULT_AVG_DOLLAR = 250;

// Blank funnel used for the rolling season "prior" that seeds the Odds Engine.
function blankFunnel() {
  return { doors: 0, contacts: 0, pitches: 0, objections: 0, sales: 0 };
}

/* ------------------------------------------------------------------ *
 * Outcome tables — one per tracking mode                             *
 * ------------------------------------------------------------------ *
 * Each outcome declares base points, its funnel deltas (which counters
 * it advances — the funnel is cumulative, a deeper stage implies the
 * shallower ones), whether it resets the heat streak, and whether it is
 * a sale/close. Points ladder mirrors the brief:
 *   Rookie: No +2 · Pitch +4 · Sale +10
 *   Pro:    Knock +2 · TalkedTo +4 · ValueBuild +6 · PriceDrop +8 · Close +10
 */

const ROOKIE_OUTCOMES = {
  no:    { points: 2,  contact: false, pitch: false, objection: false, sale: false, resetsHeat: true },
  pitch: { points: 4,  contact: true,  pitch: true,  objection: false, sale: false, resetsHeat: false },
  sale:  { points: 10, contact: true,  pitch: true,  objection: false, sale: true,  resetsHeat: false },
};

const PRO_OUTCOMES = {
  // A door where nobody answered — keeps answer-rate (C/D) honest.
  knock:       { points: 2,  contact: false, pitch: false, objection: false, sale: false, resetsHeat: true },
  talked_to:   { points: 4,  contact: true,  pitch: false, objection: false, sale: false, resetsHeat: false },
  value_build: { points: 6,  contact: true,  pitch: true,  objection: false, sale: false, resetsHeat: false },
  price_drop:  { points: 8,  contact: true,  pitch: true,  objection: true,  sale: false, resetsHeat: false },
  close:       { points: 10, contact: true,  pitch: true,  objection: false, sale: true,  resetsHeat: false },
};

// Aliases so callers can stay in one vocabulary if they like.
const ALIASES = {
  rookie: {},
  pro: { no: "knock" },
};

function outcomeTable(mode) {
  return mode === "pro" ? PRO_OUTCOMES : ROOKIE_OUTCOMES;
}

function resolveOutcome(mode, outcome) {
  const key = (ALIASES[mode] && ALIASES[mode][outcome]) || outcome;
  const spec = outcomeTable(mode)[key];
  return spec ? { key, spec } : null;
}

/* ------------------------------------------------------------------ *
 * Game lifecycle                                                     *
 * ------------------------------------------------------------------ */

/**
 * createGame — start a fresh game.
 * @param {object} opts
 *   mode        'rookie' | 'pro'          (default 'rookie')
 *   avgDollar   commission per sale $     (default 250)
 *   season      rolling season funnel totals {doors,contacts,pitches,objections,sales}
 *               used only to seed the Odds Engine so it "starts real".
 *   seasonBest  personal-best points to chase live (default 0)
 * @returns immutable-style game state.
 */
export function createGame(opts = {}) {
  const mode = opts.mode === "pro" ? "pro" : "rookie";
  const season = { ...blankFunnel(), ...(opts.season || {}) };
  return {
    mode,
    avgDollar: Number(opts.avgDollar) > 0 ? Number(opts.avgDollar) : DEFAULT_AVG_DOLLAR,
    season,                 // Odds-Engine prior (season totals, not mutated by play)
    seasonBest: Math.max(0, opts.seasonBest | 0),

    quarter: 1,             // 1..4 regulation, 5+ = overtime
    ot: 0,                  // overtime periods played
    quarterDoors: 0,        // doors logged in the current quarter
    salesThisQ: 0,          // sales landed in the current quarter

    // funnel counters (this game only)
    doors: 0,
    contacts: 0,
    pitches: 0,
    objections: 0,
    sales: 0,

    points: 0,
    heat: 0,                // current consecutive-good streak
    bestHeat: 0,
    doorsSinceSale: 0,      // for the Law-of-Probability "next sale inside N" line
    buzzerBeaters: 0,
    qWon: 0,                // quarters won (>=1 sale that quarter)

    quarterLog: [],         // one summary per completed quarter
    over: false,            // regulation/OT finished
    lastEvent: null,        // transient: describes the most recent tap (UI fly-up)
  };
}

// Shallow-clone helper (nested arrays/objects that we mutate are cloned inline).
function clone(state) {
  return {
    ...state,
    season: { ...state.season },
    quarterLog: state.quarterLog.slice(),
  };
}

export function quarterTargetFor(quarter) {
  // OT quarters (>4) have no fixed door target — they end via advanceDrive.
  return QUARTER_TARGETS[quarter - 1];
}

export function quarterOf(state) {
  return state.quarter;
}

export function quarterLabel(state) {
  return state.quarter > 4 ? "OT" + (state.quarter - 4) : "Q" + state.quarter;
}

export function isGameOver(state) {
  return !!state.over;
}

// Close out the current quarter: bank a "quarter won" if a sale landed, push a
// summary, then either advance to the next quarter or end regulation.
function closeQuarter(next, reason) {
  const wonQuarter = next.salesThisQ >= 1;
  if (wonQuarter) next.qWon += 1;
  next.quarterLog.push({
    quarter: next.quarter,
    label: next.quarter > 4 ? "OT" + (next.quarter - 4) : "Q" + next.quarter,
    doors: next.quarterDoors,
    sales: next.salesThisQ,
    won: wonQuarter,
    points: next.points,
    reason, // 'target' | 'expiry'
  });
  const regulationDone = next.quarter >= 4;
  if (regulationDone) {
    next.over = true;
  } else {
    next.quarter += 1;
    next.quarterDoors = 0;
    next.salesThisQ = 0;
  }
  return wonQuarter;
}

/**
 * logDoor — score one door and advance the machine. Pure: returns a NEW state.
 * @param {object} state
 * @param {string} outcome  mode-specific outcome key (see outcome tables / aliases)
 * @param {object} opts     { atBuzzer } true when the real clock is in its final
 *                          stretch — a sale then is a buzzer-beater. The target
 *                          never infers one (clock-only rules).
 * @returns new state (input untouched). Unknown outcome / finished game → input.
 */
export function logDoor(state, outcome, opts = {}) {
  if (state.over) return state;
  const resolved = resolveOutcome(state.mode, outcome);
  if (!resolved) return state;
  const { key, spec } = resolved;

  const next = clone(state);
  next.doors += 1;
  next.quarterDoors += 1;
  next.doorsSinceSale += 1;

  if (spec.contact) next.contacts += 1;
  if (spec.pitch) next.pitches += 1;
  if (spec.objection) next.objections += 1;

  // TARGET SMASHED — this door is exactly the one that reaches the quarter's
  // target. quarterDoors climbs by 1 per door, so this fires once per quarter.
  // Clock-only rules: the quarter does NOT end — the bonus lands, play rolls on.
  const target = quarterTargetFor(next.quarter);
  const targetSmashed = target != null && next.quarterDoors === target;

  let points = spec.points;
  let buzzerBeater = false;
  if (spec.sale) {
    next.sales += 1;
    next.salesThisQ += 1;
    next.doorsSinceSale = 0;
    // Buzzer-beater: a sale in the final stretch of the real clock.
    buzzerBeater = opts.atBuzzer === true;
    if (buzzerBeater) {
      points += BUZZER_BONUS;
      next.buzzerBeaters += 1;
    }
  }
  if (targetSmashed) points += TARGET_BONUS;

  // Heat / streak.
  if (spec.resetsHeat) {
    next.heat = 0;
  } else {
    next.heat += 1;
    if (next.heat > next.bestHeat) next.bestHeat = next.heat;
  }

  next.points += points;

  const isRecord = next.points > next.seasonBest;
  const tag = targetSmashed
    ? "TARGET SMASHED +" + points
    : buzzerBeater
    ? "BUZZER BEATER +" + points
    : "+" + points;

  next.lastEvent = {
    outcome: key,
    points,
    tag,
    isSale: spec.sale,
    buzzerBeater,
    targetSmashed,
    onFire: next.heat >= HEAT_ON,
    isRecord,
    quarterEnded: false, // quarters end on the clock only (advanceDrive)
    quarterWon: false,
    gameOver: next.over,
  };
  return next;
}

/**
 * advanceDrive — force the current quarter to end (e.g. the quarter timer
 * expired before the door target was hit). Pure. No-op if the game is over.
 */
export function advanceDrive(state) {
  if (state.over) return state;
  const next = clone(state);
  const quarterWon = closeQuarter(next, "expiry");
  next.lastEvent = {
    outcome: null,
    points: 0,
    tag: null,
    isSale: false,
    buzzerBeater: false,
    targetSmashed: false,
    onFire: next.heat >= HEAT_ON,
    isRecord: next.points > next.seasonBest,
    quarterEnded: true,
    quarterWon,
    gameOver: next.over,
  };
  return next;
}

/**
 * startOvertime — "score past it": after the final buzzer, keep playing to
 * chase the record. Opens an OT period. Pure. No-op unless the game is over.
 */
export function startOvertime(state) {
  if (!state.over) return state;
  const next = clone(state);
  next.over = false;
  next.quarter += 1; // -> 5+, an OT period
  next.ot += 1;
  next.quarterDoors = 0;
  next.salesThisQ = 0;
  next.lastEvent = null;
  return next;
}

/* ------------------------------------------------------------------ *
 * ⭐ THE ODDS ENGINE — Law of Probability                            *
 * ------------------------------------------------------------------ */

/**
 * oddsEngine — funnel ratios + the motivational dollar outputs, blending this
 * game's counters with the rolling season "prior" so the numbers start real.
 * Pure; safe against divide-by-zero.
 */
export function oddsEngine(state) {
  const $ = state.avgDollar;
  const s = state.season;

  const D = s.doors + state.doors;
  const C = s.contacts + state.contacts;
  const P = s.pitches + state.pitches;
  const O = s.objections + state.objections;
  const S = s.sales + state.sales;

  const safeS = Math.max(1, S);
  const doorsPerSale = D / safeS;                     // D/S
  const contactsPerSale = C > 0 ? C / safeS : 0;      // C/S (0 = untracked, rookie)

  const answerRate = D > 0 ? C / D : 0;               // C/D
  const pitchRate = C > 0 ? P / C : 0;                // P/C
  const closeRate = P > 0 ? S / P : 0;                // S/P
  const closePerContact = C > 0 ? S / C : 0;          // S/C
  const closePerDoor = D > 0 ? S / D : 0;             // S/D

  const yourNumber = Math.max(1, Math.round(doorsPerSale));           // doors → 1 sale
  const yourNumberContacts = contactsPerSale
    ? Math.max(1, Math.round(contactsPerSale))
    : null;                                                           // talks → 1 sale

  // 💵 Value of a NO = $ / (contacts-per-sale − 1). Each non-buying contact
  // earned you this much toward the yes. Falls back to Value of a Knock when
  // contacts aren't tracked (rookie) or there's <1 no per sale.
  const valueOfKnock = doorsPerSale > 0 ? Math.round($ / doorsPerSale) : 0; // $ per door
  const nosPerSale = contactsPerSale - 1;
  const valueOfNo = nosPerSale > 0 ? Math.round($ / nosPerSale) : valueOfKnock;

  // 📈 Live projection at the current close rate.
  const onPaceDollars = Math.round(GAME_DOORS * closePerDoor * $);    // full-game pace
  const remainingDoors = Math.max(0, GAME_DOORS - state.doors);
  const projectedRemaining = Math.round(remainingDoors * closePerDoor * $);

  // 🎯 The Law of Probability line.
  const nextSaleInDoors = Math.max(1, yourNumber - state.doorsSinceSale);

  return {
    // funnel totals (game + season)
    D, C, P, O, S,
    // ratios
    answerRate, pitchRate, closeRate, closePerContact, closePerDoor,
    doorsPerSale, contactsPerSale,
    // your number
    yourNumber, yourNumberContacts,
    // motivational $ outputs
    avgDollar: $,
    valueOfNo, valueOfKnock,
    onPaceDollars, projectedRemaining, remainingDoors,
    // the line
    nextSaleInDoors,
  };
}

/* ------------------------------------------------------------------ *
 * Box score / selectors                                              *
 * ------------------------------------------------------------------ */

/** boxScore — the post-game stat line for this single game. */
export function boxScore(state) {
  const closePct = state.doors > 0 ? (state.sales / state.doors) * 100 : 0;
  return {
    mode: state.mode,
    points: state.points,
    doors: state.doors,
    contacts: state.contacts,
    pitches: state.pitches,
    objections: state.objections,
    sales: state.sales,
    closePct: Math.round(closePct * 10) / 10,
    quartersWon: state.qWon,
    quartersPlayed: Math.min(4, state.quarter) + (state.quarter > 4 ? state.quarter - 4 : 0),
    buzzerBeaters: state.buzzerBeaters,
    bestHeat: state.bestHeat,
    ot: state.ot,
    avgDollar: state.avgDollar,
    payout: state.sales * state.avgDollar,
    isPersonalBest: state.points > state.seasonBest,
    quarterLog: state.quarterLog.slice(),
  };
}

/** The payload persisted to az_fullcourt_log_game (matches arena_fullcourt_games). */
export function toGamePayload(state) {
  return {
    mode: state.mode,
    points: state.points,
    doors: state.doors,
    contacts: state.contacts,
    pitches: state.pitches,
    sales: state.sales,
    q_won: state.qWon,
    // state.ot counts OT periods, but the column (and the RPC's cast) is boolean —
    // an int like 2 would blow up the ::boolean cast and the log would never land.
    ot: state.ot > 0,
    avg_dollar: state.avgDollar,
  };
}

/** True once the current game's points beat the personal best being chased. */
export function isPersonalBest(state) {
  return state.points > state.seasonBest;
}

/** Current quarter progress against its door target (for the quarter meter). */
export function quarterProgress(state) {
  const target = quarterTargetFor(state.quarter) || 0;
  return {
    quarter: state.quarter,
    label: quarterLabel(state),
    doors: state.quarterDoors,
    target,
    salesThisQ: state.salesThisQ,
    won: state.salesThisQ >= 1, // objective: land a sale to win the quarter
  };
}

/**
 * quarterEffort — the game's read on how hard you're working THIS quarter.
 * Compares doors logged against the pace the quarter's target implies at this
 * point of the clock. Pure — the caller passes elapsedFrac (0..1 of the
 * quarter's clock) since the engine never touches the wall clock.
 *
 *   'hot'   — at or ahead of target pace
 *   'grind' — behind pace but clearly working (or too early to judge)
 *   'slump' — under ~40% of expected pace past the first quarter-hour of play;
 *             the court saw you hiding. Feeds the coach's tough-love speech.
 */
export function quarterEffort(state, elapsedFrac) {
  const target = quarterTargetFor(state.quarter) || QUARTER_TARGETS[3];
  const frac = Math.max(0, Math.min(1, Number(elapsedFrac) || 0));
  if (frac < 0.25) return "grind"; // too early to call anyone lazy
  const expected = target * frac;
  if (state.quarterDoors >= expected) return "hot";
  if (state.quarterDoors >= expected * 0.4) return "grind";
  return "slump";
}

/** Which drive (0..7) is currently in play, from cumulative doors. */
export function currentDrive(state) {
  const idx = QUARTER_CHECKPOINTS.findIndex((v) => state.doors < v);
  // Map cumulative-checkpoint index isn't per-drive; derive per-drive instead:
  const cum = [2, 6, 10, 16, 22, 30, 38, 48];
  const drive = cum.findIndex((v) => state.doors < v);
  return { drive: drive < 0 ? LADDER.length : drive, quarterIdx: idx };
}

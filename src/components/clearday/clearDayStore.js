// ════════════════════════════════════════════════════════════════════════
// CLEARDAY — identity-first recovery store (weed + porn tracks)
// Pure localStorage (journeyStore/maskStore pattern): guarded reads/writes,
// normalize on load, idempotent mutators, subscribe set for live HUDs.
// Local-first: no Supabase, no migrations. Day number derives from real
// calendar dates (startedAt), never from close-out clicks, so the program
// keeps moving even when a day gets skipped.
// ════════════════════════════════════════════════════════════════════════

export const CLEARDAY_STORE_KEY = "clearday_v1";
export const PROGRAM_DAYS = 66;

export const TRACKS = {
  weed: {
    id: "weed",
    label: "Weed",
    noun: "the pen",
    color: "#5fcf8e",
    identitySeed: "I'm a man with healthy lungs and clear mornings.",
  },
  porn: {
    id: "porn",
    label: "Porn",
    noun: "the screen",
    color: "#a78bfa",
    identitySeed: "I'm a man whose desire belongs to real life, fully present with a real person.",
  },
};

const DEFAULT_STATE = {
  version: 1,
  onboarded: false,
  startedAt: null, // "YYYY-MM-DD" local date of day 1
  tracks: [], // ["weed"] | ["porn"] | ["weed","porn"]
  identity: {
    statement: "", // master "I'm someone who..." statement
    maskName: "", // the named Addict voice (externalization)
    beliefs: [], // belief ladder: { id, track, text, adoptedAt }
  },
  laws: { weed: "", porn: "" }, // the categorical "I don't ..." per track
  doors: { dark: "", clear: "", actions: [] }, // feared self / clear self / 3 concrete acts
  rung: "chose", // Label Ladder — ratchets up only: chose → exuser → clear
  pulses: [], // weekly identity pulse: { day, value: "clear"|"mostly"|"holding", at }
  whys: [], // { id, text, intensity 1-5, at: ISO }
  votes: 0,
  ballot: [], // newest first: { day, kind, track, note, t }
  cards: { weed: [], porn: [] }, // coping cards: { lie, comeback }
  tape: {
    weed: { relapse: "", clear: "" },
    porn: { relapse: "", clear: "" },
  },
  triggers: { weed: [], porn: [] }, // strings
  battles: [], // urge battle log, newest first: { day, track, won, beats, seconds, t }
  closedDays: {}, // { [dayNum]: "clear" | "slip" }
  curriculumDone: [], // day numbers with the daily rep cast
  freedomAudit: [], // strings — what's been reclaimed
  futureLetters: [], // { fromDay, deliverDay, text, openedAt }
  stats: { battlesWon: 0, battlesTotal: 0, clearDays: 0, slips: 0, bestRun: 0 },
};

const listeners = new Set();

export function subscribeClearDay(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* a broken listener never blocks the rest */
    }
  });
}

function obj(v) {
  return v && typeof v === "object" && !Array.isArray(v) ? { ...v } : {};
}
function arr(v) {
  return Array.isArray(v) ? v : [];
}

function normalize(parsed) {
  const p = obj(parsed);
  const id = obj(p.identity);
  const cards = obj(p.cards);
  const tape = obj(p.tape);
  const trig = obj(p.triggers);
  const perTrackTape = (t) => ({
    relapse: typeof t?.relapse === "string" ? t.relapse : "",
    clear: typeof t?.clear === "string" ? t.clear : "",
  });
  return {
    ...DEFAULT_STATE,
    ...p,
    version: 1,
    onboarded: Boolean(p.onboarded),
    startedAt: typeof p.startedAt === "string" ? p.startedAt : null,
    tracks: arr(p.tracks).filter((t) => t === "weed" || t === "porn"),
    identity: {
      statement: typeof id.statement === "string" ? id.statement : "",
      maskName: typeof id.maskName === "string" ? id.maskName : "",
      beliefs: arr(id.beliefs).filter((b) => b && typeof b === "object"),
    },
    laws: {
      weed: typeof obj(p.laws).weed === "string" ? p.laws.weed : "",
      porn: typeof obj(p.laws).porn === "string" ? p.laws.porn : "",
    },
    doors: {
      dark: typeof obj(p.doors).dark === "string" ? p.doors.dark : "",
      clear: typeof obj(p.doors).clear === "string" ? p.doors.clear : "",
      actions: arr(obj(p.doors).actions).filter((s) => typeof s === "string"),
    },
    rung: ["chose", "exuser", "clear"].includes(p.rung) ? p.rung : "chose",
    pulses: arr(p.pulses).filter((x) => x && typeof x === "object"),
    whys: arr(p.whys).filter((w) => w && typeof w === "object"),
    votes: Math.max(0, Number(p.votes) || 0),
    ballot: arr(p.ballot).filter((b) => b && typeof b === "object"),
    cards: { weed: arr(cards.weed), porn: arr(cards.porn) },
    tape: { weed: perTrackTape(tape.weed), porn: perTrackTape(tape.porn) },
    triggers: { weed: arr(trig.weed), porn: arr(trig.porn) },
    battles: arr(p.battles).filter((b) => b && typeof b === "object"),
    closedDays: obj(p.closedDays),
    curriculumDone: arr(p.curriculumDone).filter((n) => Number.isFinite(n)),
    freedomAudit: arr(p.freedomAudit).filter((s) => typeof s === "string"),
    futureLetters: arr(p.futureLetters).filter((l) => l && typeof l === "object"),
    stats: { ...DEFAULT_STATE.stats, ...obj(p.stats) },
  };
}

export function loadClearDay() {
  try {
    if (typeof window === "undefined" || !window.localStorage) return normalize(null);
    const raw = window.localStorage.getItem(CLEARDAY_STORE_KEY);
    if (!raw) return normalize(null);
    return normalize(JSON.parse(raw));
  } catch {
    return normalize(null);
  }
}

function save(state) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(CLEARDAY_STORE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — the session still runs, it just won't persist
  }
  notify();
}

/* ── dates & day math ─────────────────────────────────────────────────── */

export function localDateString(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Day number from real calendar dates — day 1 is startedAt itself.
// Clamped to the program window; before onboarding it reads as day 1.
export function dayNumber(state = loadClearDay(), today = new Date()) {
  if (!state.startedAt) return 1;
  const [y, m, d] = state.startedAt.split("-").map(Number);
  const start = new Date(y, (m || 1) - 1, d || 1);
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.floor((now - start) / 86400000);
  return Math.min(PROGRAM_DAYS, Math.max(1, diff + 1));
}

export function currentRun(state = loadClearDay()) {
  const day = dayNumber(state);
  let run = 0;
  for (let d = day - 1; d >= 1; d--) {
    if (state.closedDays[d] === "clear") run += 1;
    else break;
  }
  return run;
}

/* ── onboarding ───────────────────────────────────────────────────────── */

export function completeOnboarding({ tracks, statement, maskName, whys, beliefs, laws, doors }) {
  const state = loadClearDay();
  if (state.onboarded) return state;
  state.onboarded = true;
  state.startedAt = localDateString();
  state.tracks = arr(tracks).filter((t) => t === "weed" || t === "porn");
  if (!state.tracks.length) state.tracks = ["weed"];
  state.identity.statement = String(statement || "").trim();
  state.identity.maskName = String(maskName || "").trim();
  const l = obj(laws);
  state.laws = {
    weed: String(l.weed || "").trim(),
    porn: String(l.porn || "").trim(),
  };
  const dr = obj(doors);
  state.doors = {
    dark: String(dr.dark || "").trim(),
    clear: String(dr.clear || "").trim(),
    actions: arr(dr.actions).map((a) => String(a).trim()).filter(Boolean).slice(0, 3),
  };
  state.identity.beliefs = arr(beliefs).map((b, i) => ({
    id: `b${Date.now()}_${i}`,
    track: b.track || "all",
    text: String(b.text || "").trim(),
    adoptedAt: new Date().toISOString(),
  })).filter((b) => b.text);
  state.whys = arr(whys).map((w, i) => ({
    id: `w${Date.now()}_${i}`,
    text: String(w.text || w || "").trim(),
    intensity: Math.min(5, Math.max(1, Number(w.intensity) || 3)),
    at: new Date().toISOString(),
  })).filter((w) => w.text);
  // Endowed progress: the claim itself banks the first 3 votes —
  // the bar is never empty again (Nunes & Drèze 2006).
  state.votes += 3;
  state.ballot = [
    { day: 1, kind: "identity", track: "all", note: "Named the Mask. It doesn't get to wear my voice anymore.", t: Date.now() },
    { day: 1, kind: "identity", track: "all", note: "Wrote the Law. Decided once, so I never have to decide again.", t: Date.now() + 1 },
    { day: 1, kind: "identity", track: "all", note: "Chose who I'm becoming. The claim came first, on purpose.", t: Date.now() + 2 },
    ...state.ballot,
  ];
  save(state);
  return state;
}

export function setLaw(track, text) {
  const state = loadClearDay();
  const key = track === "porn" ? "porn" : "weed";
  state.laws = { ...state.laws, [key]: String(text || "").trim() };
  save(state);
  return state;
}

// The ladder only ratchets upward — downgrades are not a thing.
const RUNG_ORDER = ["chose", "exuser", "clear"];
export function upgradeRung(rung) {
  const state = loadClearDay();
  const cur = RUNG_ORDER.indexOf(state.rung);
  const next = RUNG_ORDER.indexOf(rung);
  if (next > cur) {
    state.rung = rung;
    state.votes += 1;
    state.ballot = [
      { day: dayNumber(state), kind: "identity", track: "all", note: "Climbed the ladder. The label ratchets up — never back.", t: Date.now() },
      ...state.ballot,
    ].slice(0, 400);
    save(state);
    return { upgraded: true, state };
  }
  return { upgraded: false, state };
}

export function addPulse(value) {
  const state = loadClearDay();
  const day = dayNumber(state);
  // one pulse per rolling week
  const last = state.pulses[state.pulses.length - 1];
  if (last && day - last.day < 7) return { taken: false, state };
  state.pulses = [...state.pulses, { day, value, at: new Date().toISOString() }];
  save(state);
  return { taken: true, state };
}

/* ── votes & ballot ───────────────────────────────────────────────────── */

export function castVote(kind, note, track = "all") {
  const state = loadClearDay();
  state.votes += 1;
  state.ballot = [
    { day: dayNumber(state), kind, track, note: String(note || ""), t: Date.now() },
    ...state.ballot,
  ].slice(0, 400);
  save(state);
  return state;
}

/* ── daily rep (curriculum) ───────────────────────────────────────────── */

export function castDailyRep(day, note) {
  const state = loadClearDay();
  if (state.curriculumDone.includes(day)) return { firstTime: false, state };
  state.curriculumDone = [...state.curriculumDone, day];
  state.votes += 1;
  state.ballot = [
    { day, kind: "lesson", track: "all", note: String(note || "Did today's rep."), t: Date.now() },
    ...state.ballot,
  ].slice(0, 400);
  save(state);
  return { firstTime: true, state };
}

/* ── close out a day ──────────────────────────────────────────────────── */

export function closeOutDay(result) {
  const state = loadClearDay();
  const day = dayNumber(state);
  if (state.closedDays[day]) return { firstTime: false, state };
  const clear = result === "clear";
  state.closedDays = { ...state.closedDays, [day]: clear ? "clear" : "slip" };
  state.votes += 1;
  if (clear) {
    state.stats.clearDays += 1;
    const run = currentRun(state) + 1;
    state.stats.bestRun = Math.max(state.stats.bestRun, run);
  } else {
    state.stats.slips += 1;
  }
  state.ballot = [
    {
      day,
      kind: clear ? "clear" : "slip",
      track: "all",
      note: clear
        ? "A clear day. Kept my word to myself."
        : "Slipped, logged it honestly, stayed in the fight. One vote against isn't the election.",
      t: Date.now(),
    },
    ...state.ballot,
  ].slice(0, 400);
  save(state);
  return { firstTime: true, state };
}

/* ── urge battles ─────────────────────────────────────────────────────── */

export function logBattle({ track, won, beats, seconds }) {
  const state = loadClearDay();
  state.stats.battlesTotal += 1;
  if (won) state.stats.battlesWon += 1;
  state.battles = [
    { day: dayNumber(state), track: track || "all", won: Boolean(won), beats: Number(beats) || 0, seconds: Number(seconds) || 0, t: Date.now() },
    ...state.battles,
  ].slice(0, 200);
  if (won) {
    state.votes += 1;
    state.ballot = [
      { day: dayNumber(state), kind: "battle", track: track || "all", note: "Faced an urge head-on and outlasted it.", t: Date.now() },
      ...state.ballot,
    ].slice(0, 400);
  }
  save(state);
  return state;
}

/* ── identity / whys / cards / tape / triggers ────────────────────────── */

export function setIdentityStatement(statement) {
  const state = loadClearDay();
  state.identity.statement = String(statement || "").trim();
  save(state);
  return state;
}

export function setMaskName(name) {
  const state = loadClearDay();
  state.identity.maskName = String(name || "").trim();
  save(state);
  return state;
}

export function addBelief(track, text) {
  const state = loadClearDay();
  const clean = String(text || "").trim();
  if (!clean) return state;
  state.identity.beliefs = [
    ...state.identity.beliefs,
    { id: `b${Date.now()}`, track: track || "all", text: clean, adoptedAt: new Date().toISOString() },
  ];
  save(state);
  return state;
}

export function addWhy(text, intensity = 3) {
  const state = loadClearDay();
  const clean = String(text || "").trim();
  if (!clean) return state;
  state.whys = [
    ...state.whys,
    { id: `w${Date.now()}`, text: clean, intensity: Math.min(5, Math.max(1, Number(intensity) || 3)), at: new Date().toISOString() },
  ];
  save(state);
  return state;
}

export function addCard(track, lie, comeback) {
  const state = loadClearDay();
  const l = String(lie || "").trim();
  const c = String(comeback || "").trim();
  if (!l || !c) return state;
  const key = track === "porn" ? "porn" : "weed";
  state.cards = { ...state.cards, [key]: [{ lie: l, comeback: c }, ...state.cards[key]] };
  save(state);
  return state;
}

export function saveTape(track, relapse, clear) {
  const state = loadClearDay();
  const key = track === "porn" ? "porn" : "weed";
  state.tape = { ...state.tape, [key]: { relapse: String(relapse || ""), clear: String(clear || "") } };
  save(state);
  return state;
}

export function addTrigger(track, text) {
  const state = loadClearDay();
  const clean = String(text || "").trim();
  if (!clean) return state;
  const key = track === "porn" ? "porn" : "weed";
  if (state.triggers[key].includes(clean)) return state;
  state.triggers = { ...state.triggers, [key]: [...state.triggers[key], clean] };
  save(state);
  return state;
}

export function addFreedomItem(text) {
  const state = loadClearDay();
  const clean = String(text || "").trim();
  if (!clean || state.freedomAudit.includes(clean)) return state;
  state.freedomAudit = [...state.freedomAudit, clean];
  save(state);
  return state;
}

export function addFutureLetter(text, deliverDay) {
  const state = loadClearDay();
  const clean = String(text || "").trim();
  if (!clean) return state;
  state.futureLetters = [
    ...state.futureLetters,
    { fromDay: dayNumber(state), deliverDay: Number(deliverDay) || PROGRAM_DAYS, text: clean, openedAt: null },
  ];
  save(state);
  return state;
}

export function openFutureLetter(index) {
  const state = loadClearDay();
  const letter = state.futureLetters[index];
  if (!letter || letter.openedAt) return state;
  state.futureLetters = state.futureLetters.map((l, i) =>
    i === index ? { ...l, openedAt: new Date().toISOString() } : l
  );
  save(state);
  return state;
}

/* dev/testing helper — wipe the program (never wired to UI without confirm) */
export function resetClearDay() {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(CLEARDAY_STORE_KEY);
    }
  } catch {
    /* no-op */
  }
  notify();
}

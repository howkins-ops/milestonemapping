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
    color: "#7be495",
    identitySeed: "I'm a man with healthy lungs and clear mornings.",
  },
  porn: {
    id: "porn",
    label: "Porn",
    noun: "the screen",
    color: "#b49bff",
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
  battles: [], // urge battle log, newest first: { day, track, won, beats, seconds, rating?, t }
  closedDays: {}, // { [dayNum]: "clear" | "slip" }
  contracts: {}, // { [dayNum]: { signedAt: ISO, sig: dataURL|null } } — the daily signed contract
  seenLies: { weed: [], porn: [] }, // last-shown seed-lie ids (anti-repeat, cap 8)
  curriculumDone: [], // day numbers with the daily rep cast
  freedomAudit: [], // strings — what's been reclaimed
  futureLetters: [], // { fromDay, deliverDay, text, openedAt }
  stats: { battlesWon: 0, battlesTotal: 0, clearDays: 0, slips: 0, bestRun: 0 },
  // Identity 2.0 — the gym + the file
  rules: [], // THE CODE non-negotiables: { id, text, when, then, armedAt, createdAt }
  shedding: [], // the man I'm leaving: { id, text, burnedAt, at }
  catches: [], // daily defusion rep: { day, lie, truth, t } (cap 100)
  opposites: [], // daily reversal rep: { day, push, counter, t } (cap 100)
  chapters: [], // weekly rewrite: { day, text, at }
  // Night Shift
  ledger: [], // nightly reckoning: { day, fuel, hit[], myPart, clean, t } (cap 200)
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

/* Keep every contract's signedAt forever, but drop the signature image
   payload after ~2 weeks so localStorage never bloats. Standalone date
   math (normalize runs before dayNumber is usable). */
function pruneContracts(contracts, p) {
  const out = {};
  let today = 1;
  if (typeof p.startedAt === "string") {
    const [y, m, d] = p.startedAt.split("-").map(Number);
    const start = new Date(y, (m || 1) - 1, d || 1);
    const now = new Date();
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today = Math.max(1, Math.floor((nowDay - start) / 86400000) + 1);
  }
  Object.keys(contracts).forEach((k) => {
    const c = contracts[k];
    if (!c || typeof c !== "object") return;
    const dayNum = Number(k);
    out[k] = {
      signedAt: typeof c.signedAt === "string" ? c.signedAt : null,
      sig: dayNum >= today - 14 && typeof c.sig === "string" ? c.sig : null,
    };
  });
  return out;
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
    contracts: pruneContracts(obj(p.contracts), p),
    seenLies: {
      weed: arr(obj(p.seenLies).weed).filter((s) => typeof s === "string").slice(-8),
      porn: arr(obj(p.seenLies).porn).filter((s) => typeof s === "string").slice(-8),
    },
    curriculumDone: arr(p.curriculumDone).filter((n) => Number.isFinite(n)),
    freedomAudit: arr(p.freedomAudit).filter((s) => typeof s === "string"),
    futureLetters: arr(p.futureLetters).filter((l) => l && typeof l === "object"),
    stats: { ...DEFAULT_STATE.stats, ...obj(p.stats) },
    rules: arr(p.rules).filter((r) => r && typeof r === "object"),
    shedding: arr(p.shedding).filter((s) => s && typeof s === "object"),
    catches: arr(p.catches).filter((c) => c && typeof c === "object").slice(0, 100),
    opposites: arr(p.opposites).filter((o) => o && typeof o === "object").slice(0, 100),
    chapters: arr(p.chapters).filter((c) => c && typeof c === "object"),
    ledger: arr(p.ledger).filter((l) => l && typeof l === "object").slice(0, 200),
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

/* ── the daily contract ───────────────────────────────────────────────── */

// Sign today's contract: records the signature, then closes the day clear.
// Idempotent through closeOutDay — a signed or already-closed day never
// double-counts.
export function signDailyContract(sigDataUrl = null) {
  const state = loadClearDay();
  const day = dayNumber(state);
  if (!state.contracts[day]) {
    state.contracts = {
      ...state.contracts,
      [day]: { signedAt: new Date().toISOString(), sig: typeof sigDataUrl === "string" ? sigDataUrl : null },
    };
    save(state);
  }
  return closeOutDay("clear");
}

/* ── mask-duel anti-repeat memory ─────────────────────────────────────── */

export function markLiesSeen(track, ids) {
  const state = loadClearDay();
  const key = track === "porn" ? "porn" : "weed";
  const clean = (Array.isArray(ids) ? ids : []).filter((s) => typeof s === "string");
  if (!clean.length) return state;
  state.seenLies = {
    ...state.seenLies,
    [key]: [...state.seenLies[key], ...clean].slice(-8),
  };
  save(state);
  return state;
}

/* ── urge battles ─────────────────────────────────────────────────────── */

export function logBattle({
  track, won, beats, seconds, rating, startRating, endRating, riskLevel,
  urgeForm, gameSeconds, roundsCompleted, accuracy, anchorErrors,
  nextAction, earlyExit, cueAction, proofId, proofSource,
}) {
  const state = loadClearDay();
  state.stats.battlesTotal += 1;
  if (won) state.stats.battlesWon += 1;
  state.battles = [
    {
      day: dayNumber(state),
      track: track || "all",
      won: Boolean(won),
      beats: Number(beats) || 0,
      seconds: Number(seconds) || 0,
      rating: Number.isFinite(rating) ? rating : null,
      startRating: Number.isFinite(startRating) ? startRating : null,
      endRating: Number.isFinite(endRating) ? endRating : null,
      riskLevel: typeof riskLevel === "string" ? riskLevel : null,
      urgeForm: typeof urgeForm === "string" ? urgeForm : null,
      gameSeconds: Number(gameSeconds) || 0,
      roundsCompleted: Number(roundsCompleted) || 0,
      accuracy: Number.isFinite(accuracy) ? Math.max(0, Math.min(100, accuracy)) : null,
      anchorErrors: Number(anchorErrors) || 0,
      nextAction: typeof nextAction === "string" ? nextAction.slice(0, 160) : null,
      cueAction: typeof cueAction === "string" ? cueAction.slice(0, 80) : null,
      proofId: typeof proofId === "string" ? proofId : null,
      proofSource: proofSource === "library" ? "library" : proofSource === "camera" ? "camera" : null,
      earlyExit: Boolean(earlyExit),
      t: Date.now(),
    },
    ...state.battles,
  ].slice(0, 200);
  if (won) {
    state.votes += 1;
    state.ballot = [
      { day: dayNumber(state), kind: "battle", track: track || "all", note: "Interrupted an urge and chose the next protective action.", t: Date.now() },
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

/* ── Identity 2.0 — the gym + the file ────────────────────────────────── */

// Two Doors finally editable after onboarding.
export function setDoors({ dark, clear, actions } = {}) {
  const state = loadClearDay();
  state.doors = {
    dark: typeof dark === "string" ? dark.trim() : state.doors.dark,
    clear: typeof clear === "string" ? clear.trim() : state.doors.clear,
    actions: Array.isArray(actions)
      ? actions.map((a) => String(a).trim()).filter(Boolean).slice(0, 3)
      : state.doors.actions,
  };
  save(state);
  return state;
}

// THE CODE — non-negotiable rules; arming adds the when-then trigger
// (implementation intentions, Gollwitzer & Sheeran 2006, d = 0.65).
export function addRule(text) {
  const state = loadClearDay();
  const clean = String(text || "").trim();
  if (!clean) return { added: false, state };
  if (state.rules.some((r) => r.text.toLowerCase() === clean.toLowerCase())) {
    return { added: false, state };
  }
  state.rules = [
    ...state.rules,
    { id: `r${Date.now()}`, text: clean, when: "", then: "", armedAt: null, createdAt: new Date().toISOString() },
  ];
  save(state);
  return { added: true, state };
}

export function deleteRule(id) {
  const state = loadClearDay();
  state.rules = state.rules.filter((r) => r.id !== id);
  save(state);
  return state;
}

export function armRule(id, when, then) {
  const state = loadClearDay();
  const w = String(when || "").trim();
  const th = String(then || "").trim();
  if (!w || !th) return state;
  state.rules = state.rules.map((r) =>
    r.id === id ? { ...r, when: w, then: th, armedAt: r.armedAt || new Date().toISOString() } : r
  );
  save(state);
  return state;
}

// The man I'm leaving — name what gets shed, then burn it for good.
export function addShedding(text) {
  const state = loadClearDay();
  const clean = String(text || "").trim();
  if (!clean) return state;
  state.shedding = [
    ...state.shedding,
    { id: `s${Date.now()}`, text: clean, burnedAt: null, at: new Date().toISOString() },
  ];
  save(state);
  return state;
}

export function burnShedding(id) {
  const state = loadClearDay();
  const item = state.shedding.find((s) => s.id === id && !s.burnedAt);
  if (!item) return state;
  state.shedding = state.shedding.map((s) =>
    s.id === id ? { ...s, burnedAt: new Date().toISOString() } : s
  );
  state.votes += 1;
  state.ballot = [
    { day: dayNumber(state), kind: "burn", track: "all", note: `Burned it: "${item.text}" — that belonged to the old me.`, t: Date.now() },
    ...state.ballot,
  ].slice(0, 400);
  save(state);
  return state;
}

// Daily workout rep 1 — THE CATCH: name the Mask's lie, answer with evidence
// (ACT defusion + CBT restructure; daily minutes beat weekly hours).
export function addCatch(lie, truth) {
  const state = loadClearDay();
  const l = String(lie || "").trim();
  const tr = String(truth || "").trim();
  if (!l || !tr) return state;
  const day = dayNumber(state);
  state.catches = [{ day, lie: l, truth: tr, t: Date.now() }, ...state.catches].slice(0, 100);
  state.votes += 1;
  state.ballot = [
    { day, kind: "catch", track: "all", note: `Caught the Mask: "${l}" — answered: "${tr}"`, t: Date.now() },
    ...state.ballot,
  ].slice(0, 400);
  save(state);
  return state;
}

// Daily workout rep 2 — THE OPPOSITE: reverse the old identity's push.
export function addOpposite(push, counter) {
  const state = loadClearDay();
  const p = String(push || "").trim();
  const c = String(counter || "").trim();
  if (!p || !c) return state;
  const day = dayNumber(state);
  state.opposites = [{ day, push: p, counter: c, t: Date.now() }, ...state.opposites].slice(0, 100);
  state.votes += 1;
  state.ballot = [
    { day, kind: "opposite", track: "all", note: `Old me pushed for ${p} — I did the opposite: ${c}`, t: Date.now() },
    ...state.ballot,
  ].slice(0, 400);
  save(state);
  return state;
}

// Weekly rewrite — this week as a chapter with a turning point
// (redemptive-arc narrators stay recovered ~2×, Dunlop & Tracy 2013).
export function addChapter(text) {
  const state = loadClearDay();
  const clean = String(text || "").trim();
  if (!clean) return { added: false, state };
  const day = dayNumber(state);
  // one chapter per rolling week, same cadence as the pulse
  const last = state.chapters[0];
  if (last && day - last.day < 7) return { added: false, state };
  state.chapters = [{ day, text: clean, at: new Date().toISOString() }, ...state.chapters];
  state.votes += 1;
  state.ballot = [
    { day, kind: "chapter", track: "all", note: "Wrote the week as a chapter — low point, turning point, next page.", t: Date.now() },
    ...state.ballot,
  ].slice(0, 400);
  save(state);
  return { added: true, state };
}

// ── THE NIGHT LEDGER — Ritual step IV. One settle per day, idempotent.
// The urge at 11pm runs on fuel from 2pm: name it, own your column, burn it.
// Clean sweep (nothing held) is a completable state, never a skipped chore.
export function settleLedger({ fuel, hit, myPart, clean } = {}) {
  const state = loadClearDay();
  const day = dayNumber(state);
  if (state.ballot.some((b) => b.day === day && b.kind === "ledger")) {
    return { firstTime: false, state };
  }
  const entry = {
    day,
    fuel: String(fuel || "").trim().slice(0, 200),
    hit: arr(hit).filter((h) => typeof h === "string").slice(0, 2),
    myPart: String(myPart || "").trim().slice(0, 220),
    clean: Boolean(clean),
    t: Date.now(),
  };
  state.ledger = [entry, ...state.ledger].slice(0, 200);
  state.votes += 1;
  state.ballot = [
    {
      day,
      kind: "ledger",
      track: "all",
      note: entry.clean
        ? "Clean sweep — carried nothing into the night. The Mask has no fuel."
        : `Settled the ledger: named the fuel, owned my part${entry.hit.length ? ` (hit: ${entry.hit.join(", ")})` : ""}. Burned before the Mask could use it.`,
      t: Date.now(),
    },
    ...state.ballot,
  ].slice(0, 400);
  save(state);
  return { firstTime: true, state };
}

// ── UNSEEN WORK — daily service rep. Undetected files a 2nd vote: the crit.
export function fileService({ who, what, unseen } = {}) {
  const state = loadClearDay();
  const day = dayNumber(state);
  if (state.ballot.some((b) => b.day === day && b.kind === "service")) {
    return { firstTime: false, crit: false, state };
  }
  const w = String(who || "").trim();
  const note = `${unseen ? "Unseen work" : "Service"} — ${String(what || "").trim().slice(0, 160)}${w ? ` (for ${w.toLowerCase()})` : ""}${unseen ? ". Nobody knows. That's the point." : ""}`;
  state.votes += unseen ? 2 : 1;
  const stamp = { day, kind: "service", track: "all", note, t: Date.now() };
  state.ballot = [
    ...(unseen ? [{ ...stamp, note: "×2 CRIT — no credit taken, none coming.", t: Date.now() + 1 }] : []),
    stamp,
    ...state.ballot,
  ].slice(0, 400);
  save(state);
  return { firstTime: true, crit: Boolean(unseen), state };
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

// FULL COURT — the flagship sales game. Play your day like a REAL 4-quarter
// game: 2 HOURS per quarter on a wall-clock timer, tap-to-log every door, and
// let the Odds Engine prove the sale is baked into the math (Law of
// Probability). Quarters end on the clock only — hitting the door target early
// is a TARGET SMASHED bonus, not an early buzzer. Between quarters: a huge
// buzzer celebration, then a 60/120s locker-room break — RESET (calm guided
// visualization) or HYPE ME UP (the coach), both tuned to the game's read of
// your quarter (won / rough / the-court-saw-you-hiding via quarterEffort).
//
// The whole game runs CLIENT-SIDE off the pure state machine in
// src/lib/fullCourtEngine.js — this file owns the clock, sound, haptics and
// animation only. A live game persists to localStorage (a game spans a whole
// workday) and offers a rejoin after refresh. The finished box score is the
// one thing that hits the DB, via arenaService.fullcourtLogGame.
//
// Ownership: this file + FullCourt.css + FullCourtStats.jsx only. All game data
// flows through arenaService.js; all witness/notification copy through
// witnessLines.js. Season is read from the DB, never localStorage.

import { useCallback, useEffect, useRef, useState } from "react";
import { useZoneCtx } from "../../../../hooks/useZone.js";
import { useAppData } from "../../../../hooks/useAppData.js";
import { fullcourtLogGame, fullcourtSeason } from "../../../../lib/arenaService.js";
import {
  createGame,
  logDoor,
  advanceDrive,
  startOvertime,
  oddsEngine,
  boxScore,
  toGamePayload,
  quarterProgress,
  quarterLabel,
  quarterEffort,
  outcomeBreakdown,
  HEAT_ON,
} from "../../../../lib/fullCourtEngine.js";
import {
  COACH,
  ANNOUNCER,
  coachClip,
  pickCoachLine,
  coachBadQuarterClip,
  announcerQuarterRecap,
  announcerHalftime,
  announcerFinal,
} from "../../../../data/fullCourtVoice.js";
import { joinLiveMatch, makeMatchCode } from "../../../../lib/fullCourtLive.js";
import { useReveal, useArenaBurst } from "../useArenaFX.js";
import { witnessSay } from "../../witness/witnessLines.js";
import {
  sfxBuzzer,
  sfxCoin,
  sfxHorn,
  sfxWhoosh,
  sfxPhoenix,
  sfxCrowdRoar,
  sfxRoundBell,
  sfxCalmPadLoop,
  sfxCrowdLoop,
  sfxBallThrow,
  sfxSwish,
  sfxBank,
  sfxDunk,
  playCrowdSample,
  playArenaStinger,
  stopCrowd,
  startCrowdBed,
  setCrowdEnergy,
  stopCrowdBed,
  isCrowdBedMuted,
  toggleCrowdBedMuted,
} from "../../../../lib/sfx.js";
import {
  crowdAudioPath,
  pickCheer,
  pickHype,
  pickReact,
  AMBIENT_ID,
} from "../../../../data/fullCourtCrowd.js";
import { slamHeavy } from "../../../../lib/haptics.js";
import { createLineAudio, playLine, stopNarration } from "../../../../lib/voiceOver.js";
import {
  pickBreakTrack,
  breakTrackAudio,
  breakTrackSpokenText,
  BREAK_BEDS,
} from "../../../../data/fullCourtBreakScript.js";
import FullCourtStats from "./FullCourtStats.jsx";
import HydrationCup from "./HydrationCup.jsx";
import FullCourtSplash from "./FullCourtSplash.jsx";
import {
  dunkTierCrossed,
  HOT_ZONE_AT,
  JumboTicker,
  JumboCallout,
  JumboDunk,
  ClutchLayer,
  QuarterBreakdown,
  JumboFinal,
} from "./FullCourtJumbotron.jsx";
import "./FullCourt.css";

const GOLD = "#FFD166";

// Local YYYY-MM-DD (matches how the Zone stamps local_date on proofs).
const today = () => new Date().toLocaleDateString("en-CA");
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

// GAME DAY clock — the quarter clock counts DOWN from the moment you tip off
// (elapsed play time, never a fixed time of day). Quarter length is fixed per
// SCHEDULE so a late start never stretches a quarter. `?fcdev` (or #fcdev)
// anywhere in the URL shrinks everything for testing.
const DEV_FAST =
  typeof window !== "undefined" && /[?&#]fcdev\b/.test(window.location.href);

// Day schedules (handoff #2). Each sets a fixed quarter length AND a real
// tip-off hour, so the scoreboard can show WHEN each quarter runs.
//   Standard    — weekday: tip 1pm, 4 × 2 hr → 1–3 · 3–5 · 5–7 · 7–9pm.
//   Saturday    — tip 9am, 4 × 3 hr → 9–12 · 12–3 · 3–6 · 6–9pm.
//   Competition — same clock as Saturday (the long weekday grind).
// Overtime for all: 9–9:30pm = OT, 9:30–10pm = Double OT (savage).
export const SCHEDULES = {
  standard: { key: "standard", label: "Weekday", qSecs: 7200, otSecs: 1800, startHour: 13, hint: "1–3 · 3–5 · 5–7 · 7–9pm · 2-hr quarters" },
  saturday: { key: "saturday", label: "Saturday", qSecs: 10800, otSecs: 1800, startHour: 9, hint: "9–12 · 12–3 · 3–6 · 6–9pm · 3-hr quarters" },
  competition: { key: "competition", label: "Competition", qSecs: 10800, otSecs: 1800, startHour: 9, hint: "9–12 · 12–3 · 3–6 · 6–9pm · 3-hr quarters" },
};

// A quarter's real time-of-day window, e.g. "1–3pm" / "9–12pm". Standard tips
// at 1pm; Saturday & Competition at 9am. Shown on the scoreboard in place of
// the old door-target numbers.
const hour12 = (h) => {
  const hh = ((Math.round(h) % 24) + 24) % 24;
  return { disp: hh % 12 === 0 ? 12 : hh % 12, pm: hh >= 12 };
};
function quarterWindows(schedule) {
  const s = SCHEDULES[schedule] || SCHEDULES.standard;
  const start = s.startHour ?? 13;
  const qLen = s.qSecs / 3600;
  return [0, 1, 2, 3].map((i) => {
    const a = hour12(start + i * qLen);
    const b = hour12(start + (i + 1) * qLen);
    return `${a.disp}–${b.disp}${b.pm ? "pm" : "am"}`;
  });
}
const scheduleSecs = (schedule, q) => {
  const s = SCHEDULES[schedule] || SCHEDULES.standard;
  if (DEV_FAST) return q > 4 ? 45 : 90;
  return q > 4 ? s.otSecs : s.qSecs;
};
const BUZZER_WINDOW = DEV_FAST ? 10 : 60; // sale inside the final stretch = buzzer-beater
const BREAK_LENS = DEV_FAST ? [15, 30] : [60, 120];

// Overtime tier from the REAL time of day (handoff #10). 9:00–9:30pm = OT,
// 9:30–10:00pm = Double OT. `?fcot=ot` / `?fcot=2ot` forces a tier for testing.
function overtimeTierNow() {
  if (typeof window !== "undefined") {
    const m = /[?&#]fcot=(2ot|ot)\b/.exec(window.location.href);
    if (m) return m[1] === "2ot" ? "2ot" : "ot";
  }
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  if (mins >= 21 * 60 && mins < 21 * 60 + 30) return "ot"; // 9:00–9:30pm
  if (mins >= 21 * 60 + 30 && mins < 22 * 60) return "2ot"; // 9:30–10:00pm
  return null;
}

// A live game survives refreshes/navigation — it spans a whole workday.
const LIVE_KEY = "fullcourt_live_v1";
const BREAK_LEN_KEY = "fullcourt_break_len";
const LIVE_MAX_AGE_MS = 20 * 60 * 60 * 1000; // stale after 20h → fresh day

// Streamed Pollinations fallbacks if a baked break mp3 is missing.
const RESET_FALLBACK_VOICE = "shimmer";
const HYPE_FALLBACK_VOICE = "onyx";

// Tap buttons per mode — outcome keys match fullCourtEngine's outcome tables.
// Every tap takes a SHOT — the sub-copy names the shot the ball will hit.
const MODE_ACTIONS = {
  rookie: [
    { key: "no", glyph: "🚪", label: "NO", sub: "+2 · bank shot — knocks score", cls: "fc-btn--no" },
    { key: "pitch", glyph: "🎤", label: "PITCH", sub: "+4 · smooth jumper", cls: "fc-btn--pitch" },
    { key: "sale", glyph: "💰", label: "SALE", sub: "+10 · THE DUNK", cls: "fc-btn--sale" },
  ],
  pro: [
    { key: "knock", glyph: "🚪", label: "KNOCK", sub: "+2 · off the glass", cls: "fc-btn--no" },
    { key: "talked_to", glyph: "🗣️", label: "TALKED", sub: "+4 · jumper", cls: "fc-btn--pitch" },
    { key: "value_build", glyph: "📈", label: "VALUE", sub: "+6 · pull-up", cls: "fc-btn--pitch" },
    { key: "price_drop", glyph: "🏷️", label: "PRICE", sub: "+8 · step-back three", cls: "fc-btn--pitch" },
    { key: "close", glyph: "💰", label: "CLOSE", sub: "+10 · THE DUNK", cls: "fc-btn--sale" },
  ],
  // FULL mode — the 6 real door outcomes (handoff #3). Feeds the stat sheet's
  // outcome breakdown and the AI-ready door log.
  full: [
    { key: "no_answer", glyph: "🚪", label: "NO ANSWER", sub: "+2 · nobody home", cls: "fc-btn--no" },
    { key: "not_interested", glyph: "🙅", label: "NOT INTERESTED", sub: "+3 · they passed", cls: "fc-btn--no" },
    { key: "gatekeeper", glyph: "🛡️", label: "GATEKEEPER", sub: "+4 · got blocked", cls: "fc-btn--pitch" },
    { key: "objection", glyph: "💬", label: "OBJECTION", sub: "+6 · worked a concern", cls: "fc-btn--pitch" },
    { key: "full_pitch", glyph: "🎤", label: "FULL PITCH", sub: "+8 · value stack", cls: "fc-btn--pitch" },
    { key: "sale", glyph: "💰", label: "SALE", sub: "+10 · THE DUNK", cls: "fc-btn--sale" },
  ],
};

// Sports-broadcast title per ended quarter.
const QUARTER_ENDS = { 1: "END OF THE 1ST", 2: "HALFTIME", 3: "END OF THE 3RD" };

// The game's read of a quarter → chip copy on the celebration screen.
const READS = [
  { key: "won", glyph: "🔥", label: "Won it", sub: "sale landed — quarter's yours" },
  { key: "rough", glyph: "😤", label: "Fought hard", sub: "the doors fought back" },
  { key: "slump", glyph: "🛋️", label: "Court saw you hiding", sub: "the numbers don't lie" },
];

// Map the DB season aggregate → the Odds-Engine "prior" funnel + best points.
function seasonPrior(season) {
  if (!season || season.offline) return { prior: undefined, best: 0 };
  const t = season.totals || season;
  return {
    prior: {
      doors: num(t.doors),
      contacts: num(t.contacts),
      pitches: num(t.pitches),
      objections: num(t.objections),
      sales: num(t.sales),
    },
    best: num(season.best_points ?? season.bestPoints),
  };
}

function fmtClock(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = String(m).padStart(2, "0");
  const rr = String(r).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${rr}` : `${mm}:${rr}`;
}

function readBreakLenPref(isHalf) {
  try {
    const v = Number(localStorage.getItem(BREAK_LEN_KEY));
    if (BREAK_LENS.includes(v)) return v;
  } catch {
    /* storage optional */
  }
  return isHalf ? BREAK_LENS[1] : BREAK_LENS[0]; // halftime defaults long
}

export default function FullCourt({ go, initialFullscreen = false }) {
  const { userId, member, fire, squads = [] } = useZoneCtx();
  const { celebrate, pushToast, settings } = useAppData();
  const reveal = useReveal();
  const burst = useArenaBurst();

  // Widescreen "broadcast" mode — the whole game takes over the viewport (over
  // the Zone header + nav) with an X to minimize. Auto-on when launched from the
  // main-page Hoops button; off when opened windowed from the Arena roster.
  const [fullscreen, setFullscreen] = useState(!!initialFullscreen);
  useEffect(() => {
    if (!fullscreen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [fullscreen]);

  const squad = squads[0] || null;
  const squadName = squad?.name || null;
  const myTeam = squadName ? squadName.toUpperCase() : "SOLO RUN";
  const myTag = member?.username ? `@${member.username}` : "you";

  // Season prior (read from DB, seeds the Odds Engine so it "starts real").
  const [season, setSeason] = useState(null);
  const [seasonStatus, setSeasonStatus] = useState("loading"); // loading|ready|offline

  // Setup knobs. (Rookie retired — Pro is the default, Full for the full stat sheet.)
  const [mode, setMode] = useState("pro");
  const [avgDollar, setAvgDollar] = useState(250);
  const [schedule, setSchedule] = useState("standard"); // Standard | Saturday | Competition

  // Pause — freezes the quarter clock (elapsed play time, so a pause never
  // shortens a quarter). Stores the seconds left so resume re-arms the deadline.
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(0); // seconds remaining while paused
  const [otTier, setOtTier] = useState(null); // 'ot' | '2ot' — real-clock overtime

  // Live head-to-head (handoff #5) — join a match code to see a friend's line
  // tick up live. Ephemeral Realtime Broadcast; no backend to deploy.
  const [matchCode, setMatchCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [opponent, setOpponent] = useState(null); // { name, points, doors, sales }
  const liveRef = useRef(null);

  // Live game state (null until tip-off) + UI phase.
  const [game, setGame] = useState(null);
  // splash|idle|playing|buzzer|break|over. Launched from the HOOPS button
  // (fullscreen) → play the basketball splash first; windowed → straight to idle.
  const [phase, setPhase] = useState(initialFullscreen ? "splash" : "idle");
  const [endsAt, setEndsAt] = useState(0); // quarter deadline (epoch ms)
  const [clock, setClock] = useState(0); // derived seconds remaining
  const [buzz, setBuzz] = useState(null); // { label, ended, isHalf, read, breakLen }
  const [brk, setBrk] = useState(null); // { flavor, secs, endsAt, track }
  const [brkClock, setBrkClock] = useState(0);
  const [flies, setFlies] = useState([]);
  const [balls, setBalls] = useState([]); // 🏀 in flight: {id,sx,sy,py,tx,ty,kind}
  const [hoopHit, setHoopHit] = useState(null); // 'swish'|'bank'|'dunk' → net/rim FX
  const hoopRef = useRef(null);
  const [bumping, setBumping] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [rejoin, setRejoin] = useState(null); // saved live game found on mount

  // Jumbotron layer — full-screen call-outs + milestone combo dunks. One of
  // each at a time; a dunk outranks a call-out on the same door.
  const [callout, setCallout] = useState(null);
  const [dunk, setDunk] = useState(null);
  const calloutTimer = useRef(null);
  const dunkTimer = useRef(null);
  const warnedRef = useRef({}); // clock warnings fired this quarter
  const recordShownRef = useRef(false); // NEW CAREER HIGH fires once per game

  // Persist bookkeeping.
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(null); // null|'done'|'offline'
  const loggedRef = useRef(false);
  const aliveRef = useRef(true);

  // Break audio handles (voice mp3 + music bed + WebAudio fallback loop).
  const brkVoiceRef = useRef(null);
  const brkBedRef = useRef(null);
  const brkLoopRef = useRef(null);

  // Two-voice broadcast channel (Andrew the announcer + Alex the coach). One
  // line at a time so they never talk over each other; separate from the break
  // track which owns its own channel.
  const voiceRef = useRef(null);
  const coachSeenRef = useRef(new Set()); // recently-played coach line ids (avoid repeats)
  const coachCadenceRef = useRef(0);      // doors since the last in-round coach line
  const badMinRef = useRef({});           // bad-quarter countdown marks already fired
  const otTierRef = useRef(null);         // last OT tier the coach called ('ot'|'2ot')
  const ambientRef = useRef(null);        // crowd/ambient bed while on the court

  // Real baked crowd audio (fullCourtCrowd.js) — a landed SALE erupts the crowd
  // (random cheer), and the GET LOUD button fires a random hype chant to break a
  // lull. Track the last id so back-to-back picks never repeat.
  const lastCheerRef = useRef(null);
  const lastHypeRef = useRef(null);
  const lastReactRef = useRef(null); // last good-pitch cheer id (avoid repeats)
  const [hyping, setHyping] = useState(false); // GET LOUD cooldown (one 15s chant at a time)
  const hypeTimer = useRef(null);
  // The scoreboard's tiny 🔊/🔇 for the background crowd bed only (persisted).
  const [bedMuted, setBedMuted] = useState(() => {
    try {
      return isCrowdBedMuted();
    } catch {
      return false;
    }
  });
  const toggleBedMute = useCallback(() => {
    try {
      setBedMuted(toggleCrowdBedMuted());
    } catch {
      /* silent */
    }
  }, []);

  const loadSeason = useCallback(async () => {
    if (!userId) {
      setSeasonStatus("ready");
      return;
    }
    try {
      const res = await fullcourtSeason({ userId });
      if (!aliveRef.current) return;
      if (res && res.offline) {
        setSeasonStatus("offline");
        return;
      }
      setSeason(res || null);
      setSeasonStatus("ready");
    } catch {
      if (aliveRef.current) setSeasonStatus("ready"); // playable without a prior
    }
  }, [userId]);

  useEffect(() => {
    aliveRef.current = true;
    loadSeason();
    return () => {
      aliveRef.current = false;
    };
  }, [loadSeason]);

  /* ---------------- live-game persistence ---------------- */

  // Offer a rejoin if a live game was left behind (refresh, nav, tab death).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LIVE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!saved?.game || Date.now() - (saved.savedAt || 0) > LIVE_MAX_AGE_MS) {
        localStorage.removeItem(LIVE_KEY);
        return;
      }
      setRejoin(saved);
    } catch {
      /* corrupted save → fresh game */
    }
  }, []);

  // Snapshot everything a rejoin needs, on every meaningful change.
  useEffect(() => {
    if (!game || phase === "idle") return;
    try {
      if (phase === "over" && logged === "done") {
        localStorage.removeItem(LIVE_KEY);
        return;
      }
      localStorage.setItem(
        LIVE_KEY,
        JSON.stringify({ game, phase, endsAt, mode, avgDollar, schedule, savedAt: Date.now() })
      );
    } catch {
      /* storage full/blocked — game still plays */
    }
  }, [game, phase, endsAt, mode, avgDollar, schedule, logged]);

  const clearLive = useCallback(() => {
    try {
      localStorage.removeItem(LIVE_KEY);
    } catch {
      /* silent */
    }
  }, []);

  /* ---------------- fx helpers ---------------- */

  const pushFly = useCallback((text, sale) => {
    const id = Math.random().toString(36).slice(2);
    setFlies((f) => [...f.slice(-3), { id, text, sale }]);
    setTimeout(() => {
      if (aliveRef.current) setFlies((f) => f.filter((x) => x.id !== id));
    }, 1000);
  }, []);

  const bump = useCallback(() => {
    setBumping(true);
    setTimeout(() => {
      if (aliveRef.current) setBumping(false);
    }, 170);
  }, []);

  /* ---------------- jumbotron moments ---------------- */

  const showCallout = useCallback((c) => {
    clearTimeout(calloutTimer.current);
    setCallout({ id: Math.random().toString(36).slice(2), ...c });
    calloutTimer.current = setTimeout(() => {
      if (aliveRef.current) setCallout(null);
    }, 1450); // matches the fcj-callout-life animation
  }, []);

  const showDunk = useCallback((tier) => {
    clearTimeout(dunkTimer.current);
    setDunk({ id: Math.random().toString(36).slice(2), tier });
    dunkTimer.current = setTimeout(() => {
      if (aliveRef.current) setDunk(null);
    }, 2450); // matches the fcj-dunk-life animation
    try {
      sfxDunk();
      sfxHorn(Math.min(3, 1 + Math.floor(tier.intensity / 4)));
      if (tier.intensity >= 4) sfxCrowdRoar();
      if (navigator.vibrate) navigator.vibrate(tier.intensity >= 7 ? [60, 40, 90] : 50);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(
    () => () => {
      clearTimeout(calloutTimer.current);
      clearTimeout(dunkTimer.current);
      clearTimeout(hypeTimer.current);
    },
    []
  );

  /* ---------------- broadcast voices (announcer + coach) ---------------- */

  // Speak one line on the shared broadcast channel. `clip` = a baked mp3 path
  // (coach lines); omit it for the announcer (dynamic → streamed). Stops any
  // line already talking so the two voices never overlap.
  const speak = useCallback(
    (text, opts = {}) => {
      if (!text || settings?.soundEnabled === false) return;
      try {
        stopNarration([voiceRef.current]);
      } catch {
        /* silent */
      }
      // Route through the real ElevenLabs proxy: the announcer streams it live
      // (dynamic box score), the coach uses it as the fallback behind its baked
      // mp3. Pick the id by which voice is speaking; synth stays the last resort.
      const elevenVoiceId =
        opts.elevenId || (opts.voice === ANNOUNCER.voice ? ANNOUNCER.elevenId : COACH.elevenId);
      const audio = createLineAudio(text, opts.voice || COACH.voice, opts.clip || null, {
        elevenVoiceId,
      });
      voiceRef.current = audio;
      // small beat so it lands after the buzzer/sfx, not on top of it
      const t = setTimeout(() => {
        if (aliveRef.current && voiceRef.current === audio) playLine(audio, text, settings);
      }, opts.delay ?? 220);
      return () => clearTimeout(t);
    },
    [settings]
  );

  const stopVoice = useCallback(() => {
    try {
      stopNarration([voiceRef.current]);
    } catch {
      /* silent */
    }
    voiceRef.current = null;
  }, []);

  // The coach drops an affirmation — remembers recent ids so it won't repeat.
  const coachSay = useCallback(
    (pool) => {
      const line = pickCoachLine(pool, coachSeenRef.current);
      if (!line) return;
      const seen = coachSeenRef.current;
      seen.add(line.id);
      if (seen.size > 12) seen.delete(seen.values().next().value); // keep it small
      speak(line.text, { voice: COACH.voice, clip: coachClip(line.id) });
    },
    [speak]
  );

  /* ---------------- real crowd audio (cheers + hype) ---------------- */

  // The crowd ERUPTS — a random real 15s cheer on the shared channel (a landed
  // door-to-door sale, the final buzzer). Falls back to the synth roar if the
  // mp3 hasn't been baked yet, so it's never silent. `volume` ducks it under
  // the announcer on the buzzer/final calls.
  const crowdCheer = useCallback(
    (volume = 0.92) => {
      const t = pickCheer(lastCheerRef.current);
      if (!t) {
        try {
          sfxCrowdRoar(settings);
        } catch {
          /* silent */
        }
        return;
      }
      lastCheerRef.current = t.id;
      playCrowdSample(crowdAudioPath(t.id), { volume, settings, fallback: sfxCrowdRoar });
    },
    [settings]
  );

  // GET LOUD — the rep taps it in a lull and a random 15s hype chant fills the
  // arena to get them going again ("DEE-FENSE", drumline, organ CHARGE…). An
  // air-horn stab + a jumbotron callout punctuate it; a 15s cooldown keeps it to
  // one chant at a time.
  const getLoud = useCallback(() => {
    if (hyping || phase !== "playing" || paused) return;
    const t = pickHype(lastHypeRef.current);
    if (t) {
      lastHypeRef.current = t.id;
      playCrowdSample(crowdAudioPath(t.id), { volume: 0.95, settings, fallback: sfxCrowdRoar });
    } else {
      try {
        sfxCrowdRoar(settings);
      } catch {
        /* silent */
      }
    }
    try {
      playArenaStinger(crowdAudioPath("stinger-airhorn"), {
        settings,
        fallback: () => sfxHorn(2, settings),
      });
    } catch {
      /* silent */
    }
    showCallout({
      title: "CROWD ON THEIR FEET",
      sub: "RIDE IT — GO GET THE NEXT DOOR",
      glyph: "📣",
      tone: "fire",
    });
    try {
      if (navigator.vibrate) navigator.vibrate([30, 30, 60]);
    } catch {
      /* silent */
    }
    setHyping(true);
    clearTimeout(hypeTimer.current);
    hypeTimer.current = setTimeout(() => {
      if (aliveRef.current) setHyping(false);
    }, 15000);
  }, [hyping, phase, paused, settings, showCallout]);

  /* ---------------- buzzer / finish ---------------- */

  const finalize = useCallback(
    (next) => {
      setBuzz(null);
      setPhase("over");
      try {
        sfxPhoenix();
        crowdCheer(0.85); // final buzzer → the building comes down
      } catch {
        /* audio never blocks */
      }
      const bx = boxScore(next);
      // Andrew calls the final.
      speak(announcerFinal(bx), { voice: ANNOUNCER.voice, delay: 900 });
      celebrate?.({
        variant: "reward",
        title: "FINAL BUZZER",
        subtitle: `${bx.points} pts · ${bx.sales} ${bx.sales === 1 ? "sale" : "sales"} · ${bx.quartersWon}/4 Q`,
        detail: bx.isPersonalBest
          ? "New personal best — the math delivered. 🏆"
          : "Game in the books. Log it and run it back.",
      });
      // Felt observation for the squad — copy sourced from witnessLines.js.
      if (squadName) {
        try {
          pushToast?.({
            type: "success",
            title: "📣 Squad broadcast",
            message: witnessSay("grind_together", { squad: squadName, today: today() }).line,
          });
        } catch {
          /* toast is best-effort */
        }
      }
    },
    [celebrate, pushToast, squadName, speak, crowdCheer]
  );

  // The quarter buzzer — a full celebration takeover, then the locker room.
  const doBuzzer = useCallback(
    (next, effort) => {
      try {
        sfxBuzzer();
        playArenaStinger(crowdAudioPath("stinger-whistle"), { settings, fallback: sfxCrowdRoar });
        crowdCheer(0.72); // ducked under the announcer's recap
      } catch {
        /* silent */
      }
      slamHeavy(); // native buzzer thump on iOS
      try {
        if (navigator.vibrate) navigator.vibrate([60, 40, 60, 40, 220]);
      } catch {
        /* haptics optional */
      }
      if (next.over) {
        finalize(next);
        return;
      }
      const ended = next.quarterLog[next.quarterLog.length - 1];
      const isHalf = ended?.label === "Q2";
      // Andrew reads the quarter recap (the big halftime roll after Q2).
      speak(isHalf ? announcerHalftime(next, oddsEngine(next)) : announcerQuarterRecap(ended, next), {
        voice: ANNOUNCER.voice,
        delay: 850,
      });
      // The game's read: a sale wins the quarter outright; otherwise the
      // work-rate verdict decides whether you fought or hid.
      const read = ended?.won ? "won" : effort === "slump" ? "slump" : "rough";
      setBuzz({
        label: QUARTER_ENDS[ended?.quarter] || `END OF ${ended?.label || "THE QUARTER"}`,
        ended,
        isHalf,
        read,
        breakLen: readBreakLenPref(isHalf),
      });
      setPhase("buzzer");
      try {
        burst(window.innerWidth / 2, window.innerHeight * 0.35, GOLD);
      } catch {
        /* confetti optional */
      }
    },
    [finalize, burst, speak, crowdCheer, settings]
  );

  /* ---------------- clock (timestamp-based — survives throttled tabs) ---------------- */

  useEffect(() => {
    if (phase !== "playing" || !endsAt) return undefined;
    const tick = () => setClock(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
  }, [phase, endsAt]);

  // Quarter clock hit zero → the buzzer. The ONLY way a quarter ends.
  useEffect(() => {
    if (phase !== "playing" || clock !== 0 || !game || game.over || !endsAt) return;
    const effort = quarterEffort(game, 1); // full quarter elapsed
    const next = advanceDrive(game);
    if (next === game) return;
    setGame(next);
    doBuzzer(next, effort);
  }, [clock, phase, game, endsAt, doBuzzer]);

  // Locker-room countdown.
  useEffect(() => {
    if (phase !== "break" || !brk?.endsAt) return undefined;
    const tick = () => setBrkClock(Math.max(0, Math.ceil((brk.endsAt - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
  }, [phase, brk]);

  /* ---------------- controls ---------------- */

  const startQuarterClock = useCallback(
    (q) => {
      const secs = scheduleSecs(schedule, q);
      warnedRef.current = {}; // fresh quarter → fresh clock warnings
      badMinRef.current = {}; // fresh bad-quarter countdown
      setPaused(false);
      setEndsAt(Date.now() + secs * 1000);
      setClock(secs);
    },
    [schedule]
  );

  // Pause / resume — freezes the deadline so the quarter never runs long.
  const togglePause = useCallback(() => {
    if (phase !== "playing") return;
    setPaused((p) => {
      if (!p) {
        // pausing: bank the seconds left, drop the deadline
        pausedRef.current = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
        setEndsAt(0);
        try {
          sfxWhoosh();
        } catch {
          /* silent */
        }
        return true;
      }
      // resuming: re-arm the deadline from the banked seconds
      const secs = pausedRef.current || 0;
      setEndsAt(Date.now() + secs * 1000);
      setClock(secs);
      try {
        sfxRoundBell();
      } catch {
        /* silent */
      }
      return false;
    });
  }, [phase, endsAt]);

  // End the quarter on demand (handoff #2) — same path as the clock expiring,
  // so the buzzer, recap and locker room all fire exactly as normal.
  const endQuarterNow = useCallback(() => {
    if (phase !== "playing" || !game || game.over) return;
    const frac = endsAt ? 1 - Math.max(0, (endsAt - Date.now()) / 1000) / scheduleSecs(schedule, game.quarter) : 1;
    const effort = quarterEffort(game, frac);
    const next = advanceDrive(game);
    if (next === game) return;
    setPaused(false);
    setEndsAt(0);
    setClock(0);
    setGame(next);
    doBuzzer(next, effort);
  }, [phase, game, endsAt, schedule, doBuzzer]);

  // On-court crowd BED — a REAL low arena murmur while you play (not the old
  // synth drone). Its volume reacts to your run: rejections hush it, good doors
  // lift it (driven by setCrowdEnergy in doLog). Hushed on pause / between
  // quarters / when sound is off; the 🔊 scoreboard toggle can silence it too.
  useEffect(() => {
    if (phase !== "playing" || paused || settings?.soundEnabled === false) {
      try {
        ambientRef.current?.stop();
      } catch {
        /* silent */
      }
      ambientRef.current = null;
      return undefined;
    }
    if (!ambientRef.current) {
      try {
        ambientRef.current = startCrowdBed(crowdAudioPath(AMBIENT_ID), { settings });
      } catch {
        /* silence is fine */
      }
    }
    return undefined;
  }, [phase, paused, settings]);

  // Never leave ambiance or a voice line running after the game unmounts.
  useEffect(
    () => () => {
      try {
        ambientRef.current?.stop();
      } catch {
        /* silent */
      }
      ambientRef.current = null;
      try {
        stopNarration([voiceRef.current]);
      } catch {
        /* silent */
      }
      stopCrowd();
      stopCrowdBed();
    },
    []
  );

  /* ---------------- live head-to-head ---------------- */

  const leaveMatch = useCallback(() => {
    try {
      liveRef.current?.leave();
    } catch {
      /* silent */
    }
    liveRef.current = null;
    setMatchCode("");
    setOpponent(null);
  }, []);

  const joinMatch = useCallback(
    (rawCode) => {
      const code = String(rawCode || "").trim().toUpperCase();
      if (!code) return;
      try {
        liveRef.current?.leave();
      } catch {
        /* silent */
      }
      const handle = joinLiveMatch(code, {
        me: { id: userId || myTag, name: myTag },
        onOpponent: (line) => {
          if (aliveRef.current) setOpponent(line);
        },
      });
      liveRef.current = handle;
      setMatchCode(code);
      setOpponent(null);
      if (!handle.ok) {
        pushToast?.({
          type: "info",
          title: "Challenge offline",
          message: "Live scoring needs a connection — you can still play solo.",
        });
      } else {
        pushToast?.({
          type: "success",
          title: "🏀 Match ready",
          message: `Share code ${code}. Points go live the moment you both tip off.`,
        });
      }
    },
    [userId, myTag, pushToast]
  );

  // Broadcast my running line to the opponent on every meaningful change.
  useEffect(() => {
    if (!liveRef.current?.ok || !game) return;
    liveRef.current.publish({
      points: game.points,
      doors: game.doors,
      sales: game.sales,
      quarter: game.quarter,
      over: !!game.over,
    });
  }, [game]);

  // Tear the channel down when leaving the game entirely.
  useEffect(() => () => leaveMatch(), [leaveMatch]);

  // Jumbotron clock warnings — 1 hour / 30 min / CLUTCH TIME at 2 min. Fires
  // once per quarter each; on a resume below a mark, only the most urgent one
  // speaks (the rest are marked spent so they never cascade).
  useEffect(() => {
    if (phase !== "playing" || !game || !endsAt || clock <= 0) return;
    const qLen = scheduleSecs(schedule, game.quarter);
    const marks = [
      { t: 3600, title: "1 HOUR LEFT", sub: "HALF THE QUARTER — KEEP THE PACE" },
      { t: 1800, title: "30 MINUTES", sub: "PUSH — THE BUZZER'S COMING" },
      { t: 120, title: "CLUTCH TIME", sub: "TWO MINUTES — EMPTY THE TANK" },
    ].filter((m) => m.t < qLen);
    const crossed = marks.filter((m) => clock <= m.t && !warnedRef.current[m.t]);
    if (!crossed.length) return;
    crossed.forEach((m) => {
      warnedRef.current[m.t] = true;
    });
    const m = crossed[crossed.length - 1]; // marks are ordered big→small
    showCallout({ title: m.title, sub: m.sub, glyph: "⏱️", tone: "warn" });
    try {
      sfxHorn(1);
    } catch {
      /* silent */
    }
  }, [clock, phase, game, endsAt, schedule, showCallout]);

  // COACH · bad-quarter countdown — in a scoreless, low-activity quarter the
  // coach speaks one recovery line per minute through the final 10 minutes,
  // counting down (clip 10 at the 10-min mark … clip 1 at 1-min). Fires once
  // per minute mark; only when the court "saw you hiding" (not while working).
  useEffect(() => {
    if (phase !== "playing" || paused || !game || !endsAt || clock <= 0) return;
    if (game.salesThisQ > 0 || clock > 600) return;
    const minutesLeft = Math.ceil(clock / 60);
    if (minutesLeft < 1 || minutesLeft > 10 || badMinRef.current[minutesLeft]) return;
    const frac = 1 - clock / scheduleSecs(schedule, game.quarter);
    if (quarterEffort(game, frac) === "hot") return; // they're working — no nag
    badMinRef.current[minutesLeft] = true;
    const clip = coachBadQuarterClip(minutesLeft);
    speak(clip.text, { voice: COACH.voice, clip: coachClip(clip.id) });
  }, [clock, phase, paused, game, endsAt, schedule, speak]);

  // COACH · Overtime work-ethic lines (handoff #10) — driven by the REAL time
  // of day. 9:00–9:30pm = OT, 9:30–10:00pm = Double OT. The coach calls it on
  // entry and drops a fresh line every ~5 min while you're still out there.
  // `?fcot=ot` / `?fcot=2ot` forces a tier for testing.
  useEffect(() => {
    if (phase !== "playing") {
      setOtTier(null);
      return undefined;
    }
    let periodic = 0;
    const check = () => {
      if (pausedRef.current && paused) return;
      const tier = overtimeTierNow();
      setOtTier(tier);
      if (tier && tier !== otTierRef.current) {
        otTierRef.current = tier;
        periodic = 0;
        coachSay(tier === "2ot" ? "doubleOt" : "ot");
        showCallout({
          title: tier === "2ot" ? "DOUBLE OVERTIME" : "OVERTIME",
          sub: tier === "2ot" ? "SICKO HOURS — STILL OUT HERE" : "9PM DOESN'T MEAN DONE",
          glyph: "🌙",
          tone: "fire",
        });
        try {
          sfxHorn(2);
        } catch {
          /* silent */
        }
      } else if (tier) {
        periodic += 1;
        if (periodic % 10 === 0) coachSay(tier === "2ot" ? "doubleOt" : "ot"); // ~5 min at 30s ticks
      } else {
        otTierRef.current = null;
      }
    };
    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, [phase, paused, coachSay, showCallout]);

  const tipOff = useCallback(() => {
    const { prior, best } = seasonPrior(season);
    const g = createGame({
      mode,
      avgDollar: Number(avgDollar) > 0 ? Number(avgDollar) : 250,
      season: prior,
      seasonBest: best,
    });
    loggedRef.current = false;
    recordShownRef.current = false;
    coachCadenceRef.current = 0;
    coachSeenRef.current = new Set();
    otTierRef.current = null;
    setOtTier(null);
    setLogged(null);
    setRejoin(null);
    setGame(g);
    setPhase("playing");
    startQuarterClock(g.quarter);
    setBuzz(null);
    setBrk(null);
    setFlies([]);
    try {
      sfxWhoosh();
      playArenaStinger(crowdAudioPath("stinger-whistle"), { settings }); // tip-off whistle
    } catch {
      /* silent */
    }
  }, [season, mode, avgDollar, startQuarterClock, settings]);

  // Pick up a saved live game where it left off. An expired quarter clock
  // simply buzzes on the next tick; a saved buzzer/break drops back to the
  // celebration screen so the rep re-picks their locker room.
  const resumeGame = useCallback(() => {
    if (!rejoin?.game) return;
    // Rookie is retired — sanitize any legacy/corrupted saved mode to the new
    // default so the idle selector never lands on an un-selectable mode.
    setMode(rejoin.mode === "full" ? "full" : "pro");
    if (rejoin.schedule && SCHEDULES[rejoin.schedule]) setSchedule(rejoin.schedule);
    if (Number(rejoin.avgDollar) > 0) setAvgDollar(rejoin.avgDollar);
    coachCadenceRef.current = 0;
    badMinRef.current = {};
    otTierRef.current = null;
    loggedRef.current = false;
    setLogged(null);
    setGame(rejoin.game);
    setRejoin(null);
    setFlies([]);
    if (rejoin.game.over) {
      setPhase("over");
      return;
    }
    if (rejoin.phase === "playing" && rejoin.endsAt) {
      setEndsAt(rejoin.endsAt);
      setClock(Math.max(0, Math.ceil((rejoin.endsAt - Date.now()) / 1000)));
      setPhase("playing");
    } else {
      // buzzer/break snapshots resume at the celebration screen
      const ended = rejoin.game.quarterLog[rejoin.game.quarterLog.length - 1];
      const isHalf = ended?.label === "Q2";
      setBuzz({
        label: QUARTER_ENDS[ended?.quarter] || `END OF ${ended?.label || "THE QUARTER"}`,
        ended,
        isHalf,
        read: ended?.won ? "won" : "rough",
        breakLen: readBreakLenPref(isHalf),
      });
      setPhase("buzzer");
    }
    try {
      sfxWhoosh();
    } catch {
      /* silent */
    }
  }, [rejoin]);

  const abandonSave = useCallback(() => {
    clearLive();
    setRejoin(null);
  }, [clearLive]);

  // Take the shot: ball arcs from the tapped button into the hoop; the result
  // sound (swish / off-the-glass / DUNK) and the points fly-up land WITH the
  // ball, ~half a second later. The score itself updates instantly — the
  // flight is garnish, never a gate on fast tapping.
  const shootBall = useCallback(
    (x, y, ev) => {
      const isSale = !!ev?.isSale;
      const kind =
        isSale ? "dunk" : ev?.outcome === "no" || ev?.outcome === "knock" ? "bank" : "swish";
      try {
        sfxBallThrow();
      } catch {
        /* silent */
      }
      let tx = window.innerWidth / 2;
      let ty = 160;
      try {
        const r = hoopRef.current?.getBoundingClientRect();
        if (r) {
          tx = r.left + r.width / 2;
          ty = r.top + r.height * 0.7;
        }
      } catch {
        /* fallback target is fine */
      }
      const id = Math.random().toString(36).slice(2);
      const py = Math.min(y, ty) - 120; // arc apex above start & rim
      setBalls((b) => [...b.slice(-4), { id, sx: x, sy: y, tx, ty, py, kind }]);
      setTimeout(() => {
        if (!aliveRef.current) return;
        setBalls((b) => b.filter((q) => q.id !== id));
        try {
          if (kind === "dunk") {
            sfxDunk();
            sfxHorn(1);
            if (navigator.vibrate) navigator.vibrate(40);
          } else if (kind === "bank") {
            sfxBank();
          } else {
            sfxSwish();
          }
          if (ev?.onFire) sfxCoin();
        } catch {
          /* silent */
        }
        setHoopHit(kind);
        setTimeout(() => {
          if (aliveRef.current) setHoopHit(null);
        }, 420);
        pushFly(ev?.tag || `+${ev?.points ?? 0}`, isSale || ev?.targetSmashed);
        if (isSale || ev?.targetSmashed) burst(tx, ty + 10, GOLD);
      }, 520); // matches the CSS flight time
    },
    [pushFly, burst]
  );

  const doLog = useCallback(
    (outcome, e) => {
      if (!game || phase !== "playing" || paused) return;
      // A sale in the real clock's final stretch is the buzzer-beater. `at` =
      // how far into the quarter this door landed (0..1) — recorded on the
      // door log for the future AI pattern layer.
      const qLen = scheduleSecs(schedule, game.quarter);
      const at = qLen > 0 ? Math.max(0, Math.min(1, 1 - clock / qLen)) : null;
      const next = logDoor(game, outcome, {
        atBuzzer: clock > 0 && clock <= BUZZER_WINDOW,
        at,
      });
      if (next === game) return; // unknown outcome / finished
      const ev = next.lastEvent;
      // Crowd BED reacts to the run — heat drives its volume: a rejection zeroes
      // heat so the crowd hushes; good doors lift it. A `goodPitch` that isn't a
      // sale also earns a short "you hear them" cheer in the landing block below.
      const goodPitch =
        ev?.outcome === "full_pitch" ||
        ev?.outcome === "value_build" ||
        ev?.outcome === "price_drop" ||
        ev?.outcome === "pitch" ||
        ev?.outcome === "objection";
      try {
        setCrowdEnergy(Math.min(1, next.heat / 5));
      } catch {
        /* silent */
      }
      if (ev?.targetSmashed) {
        try {
          playArenaStinger(crowdAudioPath("stinger-airhorn"), {
            settings,
            fallback: () => sfxHorn(2, settings),
          });
        } catch {
          /* silent */
        }
      }
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;
      shootBall(x, y, ev);
      bump();

      // Jumbotron: pick THE moment for this door (dunk tier outranks call-outs)
      // and land it with the ball, on the same 520ms flight delay as the sound.
      const prevHeat = game.heat;
      const tier = dunkTierCrossed(game.points, next.points);
      const wasRecordShown = recordShownRef.current;
      if (ev?.isRecord) recordShownRef.current = true;
      setTimeout(() => {
        if (!aliveRef.current) return;
        // Door-to-door SALE → the whole arena erupts (real 15s crowd cheer),
        // whether or not this sale also crossed a milestone dunk tier. A good
        // pitch (not a sale) gets a shorter appreciative cheer you actually hear.
        if (ev?.isSale) {
          crowdCheer();
        } else if (goodPitch && !tier && !ev?.targetSmashed && !ev?.buzzerBeater) {
          const r = pickReact(lastReactRef.current);
          if (r) {
            lastReactRef.current = r.id;
            playArenaStinger(crowdAudioPath(r.id), { volume: 0.55, settings });
          }
        }
        if (tier) {
          showDunk(tier);
          return;
        }
        if (ev?.buzzerBeater) {
          showCallout({ title: `BUZZER BEATER +${ev.points}`, sub: "SALE AT THE HORN", glyph: "🎯", tone: "sale" });
        } else if (ev?.targetSmashed) {
          showCallout({ title: `TARGET SMASHED +${ev.points}`, sub: "QUARTER TARGET DOWN — KEEP SCORING", glyph: "🎯", tone: "bonus" });
        } else if (ev?.isRecord && !wasRecordShown) {
          showCallout({ title: "NEW CAREER HIGH", sub: "EVERY POINT FROM HERE IS A RECORD", glyph: "🏆", tone: "record" });
        } else if (ev?.isSale) {
          showCallout({ title: `THE DUNK +${ev.points}`, sub: "SALE ON THE BOARD", glyph: "💰", tone: "sale" });
        } else if (next.heat >= HOT_ZONE_AT && prevHeat < HOT_ZONE_AT) {
          showCallout({ title: "HOT ZONE", sub: "STREAK ALIVE — EVERY KNOCK IS HEAVY", glyph: "🔥", tone: "fire" });
        } else if (ev?.onFire && prevHeat < HEAT_ON) {
          showCallout({ title: "ON FIRE", sub: `${next.heat} GOOD DOORS IN A ROW`, glyph: "🔥", tone: "fire" });
        }
      }, 520);

      // Coach affirmations — NOT every door (handoff #7). A good pitch earns
      // praise now and then; a stretch of grind earns a keep-going line. Big
      // moments (sale/dunk/target/buzzer) own the audio channel, so skip them.
      const isBigMoment =
        !!tier || ev?.isSale || ev?.targetSmashed || ev?.buzzerBeater;
      if (!isBigMoment) {
        coachCadenceRef.current += 1;
        if (goodPitch && Math.random() < 0.4) {
          coachCadenceRef.current = 0;
          coachSay("goodPitch");
        } else if (coachCadenceRef.current >= 4) {
          coachCadenceRef.current = 0;
          coachSay("keepGoing");
        }
      }

      setGame(next);
    },
    [game, phase, paused, clock, schedule, shootBall, bump, showCallout, showDunk, coachSay, crowdCheer]
  );

  /* ---------------- locker room (break) ---------------- */

  const stopBreakAudio = useCallback(() => {
    try {
      stopNarration([brkVoiceRef.current]);
    } catch {
      /* silent */
    }
    brkVoiceRef.current = null;
    try {
      brkBedRef.current?.pause();
    } catch {
      /* silent */
    }
    brkBedRef.current = null;
    try {
      brkLoopRef.current?.stop();
    } catch {
      /* silent */
    }
    brkLoopRef.current = null;
  }, []);

  const setBreakLen = useCallback((len) => {
    setBuzz((b) => (b ? { ...b, breakLen: len } : b));
    try {
      localStorage.setItem(BREAK_LEN_KEY, String(len));
    } catch {
      /* silent */
    }
  }, []);

  const startBreak = useCallback(
    (flavor) => {
      if (!buzz) return;
      stopVoice(); // hush the announcer recap before the locker-room track
      stopCrowd(); // and cut any buzzer cheer still rolling
      const secs = buzz.breakLen || BREAK_LENS[0];
      const track = pickBreakTrack(flavor, buzz.read, DEV_FAST ? (secs > 15 ? 120 : 60) : secs);
      setBrk({ flavor, secs, endsAt: Date.now() + secs * 1000, track });
      setBrkClock(secs);
      setPhase("break");

      // Music bed: baked Eleven Music mp3 first, WebAudio loop as fallback.
      const startLoop = () => {
        try {
          brkLoopRef.current = flavor === "hype" ? sfxCrowdLoop(settings) : sfxCalmPadLoop(settings);
        } catch {
          /* silence is fine */
        }
      };
      if (settings?.soundEnabled !== false) {
        try {
          const bed = new Audio(BREAK_BEDS[flavor]);
          bed.loop = true;
          bed.volume = flavor === "hype" ? 0.26 : 0.2;
          bed.onerror = startLoop;
          brkBedRef.current = bed;
          bed.play().catch(startLoop);
        } catch {
          startLoop();
        }
      }

      // Voice: baked ElevenLabs track → streamed voice → device synth.
      if (track) {
        const text = breakTrackSpokenText(track);
        const fallbackVoice = flavor === "hype" ? HYPE_FALLBACK_VOICE : RESET_FALLBACK_VOICE;
        const audio = createLineAudio(text, fallbackVoice, breakTrackAudio(track.id));
        brkVoiceRef.current = audio;
        setTimeout(() => {
          if (aliveRef.current && brkVoiceRef.current === audio) playLine(audio, text, settings);
        }, 700);
      }
    },
    [buzz, settings, stopVoice]
  );

  // Back on the court — break finished (or skipped from the buzzer screen).
  const nextQuarter = useCallback(() => {
    if (!game) return;
    stopBreakAudio();
    stopCrowd();
    setBuzz(null);
    setBrk(null);
    setPhase("playing");
    startQuarterClock(game.quarter); // engine already advanced the quarter
    try {
      sfxRoundBell();
      sfxWhoosh();
    } catch {
      /* silent */
    }
  }, [game, stopBreakAudio, startQuarterClock]);

  // Break timer done → automatic tip-off.
  useEffect(() => {
    if (phase !== "break" || brkClock !== 0 || !brk) return;
    nextQuarter();
  }, [phase, brkClock, brk, nextQuarter]);

  // Leaving the game mid-break (unmount) must never leave audio running.
  useEffect(() => () => stopBreakAudio(), [stopBreakAudio]);

  const goOvertime = useCallback(() => {
    if (!game || loggedRef.current) return;
    const next = startOvertime(game);
    if (next === game) return;
    setGame(next);
    setPhase("playing");
    startQuarterClock(next.quarter);
    try {
      sfxWhoosh();
    } catch {
      /* silent */
    }
  }, [game, startQuarterClock]);

  const logSeasonGame = useCallback(async () => {
    if (loggedRef.current || !game) return;
    loggedRef.current = true;
    setLogging(true);
    const payload = { ...toGamePayload(game), played_on: today() };
    try {
      const res = await fullcourtLogGame(payload);
      if (res && res.offline) {
        setLogged("offline");
        pushToast?.({
          type: "info",
          title: "Saved to the moment only",
          message: "You're offline — reconnect to log this game to your season.",
        });
      } else {
        if (res?.season) setSeason(res.season);
        else loadSeason();
        setLogged("done");
        clearLive();
        pushToast?.({
          type: "success",
          title: "Logged to season",
          message: "Your stat sheet just grew.",
        });
      }
    } catch {
      loggedRef.current = false;
      pushToast?.({ type: "error", title: "Couldn't log", message: "Try again in a moment." });
    } finally {
      if (aliveRef.current) setLogging(false);
    }
  }, [game, pushToast, loadSeason, clearLive]);

  const newGame = useCallback(() => {
    stopBreakAudio();
    stopCrowd();
    clearLive();
    setGame(null);
    setPhase("idle");
    setBuzz(null);
    setBrk(null);
    setFlies([]);
    setCallout(null);
    setDunk(null);
    setLogged(null);
    setPaused(false);
    setHyping(false);
    clearTimeout(hypeTimer.current);
    setOtTier(null);
    otTierRef.current = null;
    coachCadenceRef.current = 0;
    loggedRef.current = false;
    recordShownRef.current = false;
    try {
      stopNarration([voiceRef.current]);
    } catch {
      /* silent */
    }
  }, [stopBreakAudio, clearLive]);

  // Mid-game start-over — a live game spans a whole workday, so it needs an
  // exit that doesn't require the final buzzer. Two taps: a stray thumb can't
  // wipe 8 hours of doors.
  const [resetArm, setResetArm] = useState(false);
  const resetArmTimer = useRef(null);
  const startOver = useCallback(() => {
    if (!resetArm) {
      setResetArm(true);
      clearTimeout(resetArmTimer.current);
      resetArmTimer.current = setTimeout(() => {
        if (aliveRef.current) setResetArm(false);
      }, 4000);
      return;
    }
    clearTimeout(resetArmTimer.current);
    setResetArm(false);
    newGame();
  }, [resetArm, newGame]);
  useEffect(() => () => clearTimeout(resetArmTimer.current), []);

  /* ---------------- stats sub-view ---------------- */

  if (showStats) {
    return <FullCourtStats go={go} onBack={() => setShowStats(false)} />;
  }

  /* ---------------- derived ---------------- */

  const odds = game ? oddsEngine(game) : null;
  const qp = game ? quarterProgress(game) : null;
  const onFire = !!game && game.heat >= HEAT_ON;
  const lowClock = phase === "playing" && clock <= BUZZER_WINDOW;
  const actions = MODE_ACTIONS[mode] || MODE_ACTIONS.pro;
  const canPlay = phase === "playing";
  // The scoreboard + odds only make sense once a game is live — keep them (and
  // the whole gameplay board) out of the idle title screen and the splash.
  const inGame =
    phase === "playing" || phase === "buzzer" || phase === "break" || phase === "over";
  // The Law of Probability line, kept as a small strip pinned to the very top.
  const lawLine = odds
    ? `At your average, the next sale is inside ${odds.nextSaleInDoors} ${
        odds.nextSaleInDoors === 1 ? "door" : "doors"
      }.`
    : "Every no you log makes the yes more certain.";
  const bx = game && phase === "over" ? boxScore(game) : null;
  const { best: seasonBest } = seasonPrior(season);

  // Locker-room caption: the last cue whose timestamp has passed.
  let brkCaption = null;
  if (phase === "break" && brk?.track) {
    const scale = brk.secs / brk.track.secs; // dev-fast breaks compress the cue times
    const elapsed = brk.secs - brkClock;
    const cues = brk.track.captions || [];
    for (const c of cues) {
      if (c.at * scale <= elapsed) brkCaption = c.text;
      else break;
    }
  }
  const brkFrac = phase === "break" && brk?.secs ? brkClock / brk.secs : 0;

  return (
    <div className={`fc-wrap${fullscreen ? " fc-wrap--full" : ""}`} ref={reveal}>
      {/* balls in flight — fixed layer so the arc runs from button to rim */}
      {balls.length > 0 && (
        <div className="fc-balls" aria-hidden="true">
          {balls.map((b) => (
            <span
              key={b.id}
              className="fc-ballx"
              style={{ "--sx": `${b.sx}px`, "--tx": `${b.tx}px` }}
            >
              <span
                className={`fc-bally ${b.kind === "dunk" ? "fc-bally--dunk" : ""}`}
                style={{ "--sy": `${b.sy}px`, "--py": `${b.py}px`, "--ty": `${b.ty}px` }}
              >
                🏀
              </span>
            </span>
          ))}
        </div>
      )}

      {/* jumbotron overlays — call-outs, milestone dunks, clutch-time layer */}
      <JumboCallout callout={callout} />
      <JumboDunk dunk={dunk} />
      <ClutchLayer
        active={phase === "playing" && clock > 0 && clock <= (DEV_FAST ? 15 : 120)}
        count={phase === "playing" && clock > 0 && clock <= 10 ? clock : null}
      />

      {/* HOOPS boot cinematic — the crazy ~15s "here's the game" splash, then
          it hands off to the idle title screen. Skippable. */}
      {phase === "splash" && (
        <FullCourtSplash settings={settings} onDone={() => setPhase("idle")} />
      )}

      {fullscreen ? (
        <button
          type="button"
          className="fc-fs-close"
          onClick={() => setFullscreen(false)}
          aria-label="Minimize — exit fullscreen"
        >
          ✕
        </button>
      ) : (
        <div className="fc-topbar">
          <button type="button" className="zn-back fc-back" onClick={() => go?.("arena")}>
            ← Arena
          </button>
          <button
            type="button"
            className="fc-fs-expand"
            onClick={() => setFullscreen(true)}
            aria-label="Play fullscreen"
          >
            ⤢ Fullscreen
          </button>
        </div>
      )}

      {/* the Law of Probability quote — kept, small, pinned to the very top */}
      <div className="fc-lawtop">
        <span className="fc-lawtop__tag">🎯 The Law of Probability</span>
        <span className="fc-lawtop__line">
          {lawLine} <b>The math owes you.</b>
        </span>
      </div>

      {/* ---------------- HOOPS title screen (idle only) ---------------- */}
      {phase === "idle" && (
        <section className="fc-hero arena-reveal">
          <div className="fc-hero__court" aria-hidden="true" />
          <p className="fc-hero__eyebrow">FULL COURT</p>
          <h1 className="fc-hero__logo">HOOPS</h1>
          <p className="fc-hero__tag">Every no is a shot. Every yes is a bucket.</p>
          {rejoin?.game ? (
            <>
              <button type="button" className="fc-hero__start" onClick={resumeGame}>
                ▶ REJOIN — {rejoin.game.quarter > 4 ? "OT" : `Q${rejoin.game.quarter}`}
                {rejoin.phase === "playing" && rejoin.endsAt
                  ? ` · ${fmtClock(Math.max(0, Math.ceil((rejoin.endsAt - Date.now()) / 1000)))} left`
                  : " · at the buzzer"}
              </button>
              <p className="fc-hero__note">
                {rejoin.game.points} points on the board already —{" "}
                <button type="button" className="fc-linkbtn" onClick={abandonSave}>
                  abandon that game
                </button>
              </p>
            </>
          ) : (
            <button type="button" className="fc-hero__start" onClick={tipOff}>
              ▶ START THE GAME
            </button>
          )}
        </section>
      )}

      {/* ---------------- SCOREBOARD (jumbotron shell) — live only ---------------- */}
      {inGame && (
      <div className="fc-board zn-card zn-card--glow fcj-shell" data-fire={fire?.key || "cold"}>
        <div className="fc-top">
          <div className="fc-team">
            {myTeam}
            <small>
              {myTag} · {mode.toUpperCase()} MODE
            </small>
          </div>
          <div className="fc-topright">
            {otTier && phase === "playing" && (
              <span className={`fc-otbadge fc-otbadge--${otTier}`}>
                {otTier === "2ot" ? "🌙 DOUBLE OT" : "🌙 OVERTIME"}
              </span>
            )}
            <span className="fc-qchip">{game ? quarterLabel(game) : "Q1"}</span>
            <span className={`fc-clock ${lowClock ? "fc-clock--low" : ""} ${paused ? "fc-clock--paused" : ""}`}>
              {paused ? "PAUSED" : fmtClock(phase === "idle" ? scheduleSecs(schedule, 1) : clock)}
            </span>
          </div>
        </div>

        {/* live head-to-head bar (#5) — opponent's line ticks up in real time */}
        {matchCode && (
          <div className="fc-vs" aria-label="Live head-to-head">
            <div className="fc-vs__side">
              <span className="fc-vs__name">{myTag}</span>
              <span className="fc-vs__pts">{game ? game.points : 0}</span>
              <span className="fc-vs__sub">{game ? game.doors : 0} doors · {game ? game.sales : 0} sales</span>
            </div>
            <div className="fc-vs__mid">
              <span className="fc-vs__code">{matchCode}</span>
              <button type="button" className="fc-vs__leave" onClick={leaveMatch}>
                leave
              </button>
            </div>
            <div className="fc-vs__side fc-vs__side--them">
              <span className="fc-vs__name">{opponent?.name || "waiting…"}</span>
              <span className="fc-vs__pts">{opponent ? opponent.points : "—"}</span>
              <span className="fc-vs__sub">
                {opponent ? `${opponent.doors} doors · ${opponent.sales} sales` : "share your code"}
              </span>
            </div>
          </div>
        )}

        {/* live shooting stats — shots taken, on-target %, streak, hot zone */}
        <JumboTicker
          shots={game ? game.doors : 0}
          onTargetPct={game && game.doors > 0 ? Math.round((game.contacts / game.doors) * 100) : 0}
          streak={game ? game.heat : 0}
          hotZone={phase === "playing" && !!game && game.heat >= HOT_ZONE_AT}
        />

        <div className="fc-scorewrap">
          {/* the hoop — every logged door is a shot at this rim */}
          <div
            ref={hoopRef}
            className={`fc-hoop ${hoopHit ? `fc-hoop--${hoopHit}` : ""}`}
            aria-hidden="true"
          >
            <span className="fc-hoop__board" />
            <span className="fc-hoop__rim" />
            <span className="fc-hoop__net" />
          </div>
          <div className="fc-flies" aria-hidden="true">
            {flies.map((f) => (
              <span key={f.id} className={`fc-fly ${f.sale ? "fc-fly--sale" : ""}`}>
                {f.text}
              </span>
            ))}
          </div>
          <div className={`fc-score ${bumping ? "fc-score--bump" : ""}`}>
            {game ? game.points : 0}
          </div>
          <div className="fc-scorelbl">POINTS</div>
          <div className="fc-chips">
            <span className={`fc-heat ${onFire ? "fc-heat--on" : ""}`}>
              🔥 HEAT · {game ? game.heat : 0}
            </span>
            <span className="fc-best">🏆 BEST {Math.max(seasonBest, game ? game.points : 0)}</span>
            <button
              type="button"
              className={`fc-bedmute ${bedMuted ? "fc-bedmute--off" : ""}`}
              onClick={toggleBedMute}
              aria-pressed={bedMuted}
              aria-label={bedMuted ? "Crowd background off — tap to unmute" : "Crowd background on — tap to mute"}
              title={bedMuted ? "Crowd background muted" : "Mute crowd background"}
            >
              {bedMuted ? "🔇" : "🔊"}
            </button>
          </div>
          {/* hydration — hold the cup to drink, one per quarter (#9) */}
          <HydrationCup
            target={4}
            onCupDone={(n) => {
              try {
                sfxCoin();
              } catch {
                /* silent */
              }
              pushToast?.({
                type: "success",
                title: "💧 Cup down",
                message: `That's ${n} today. Fresh legs close more doors.`,
              });
            }}
          />
        </div>

        {/* game schedule — each quarter as its real time-of-day window, the
            current quarter lit and finished ones banked gold */}
        <div className="fc-sched">
          {quarterWindows(schedule).map((range, qi) => {
            const q = game ? game.quarter : 0;
            const done = !!game && (game.over || q > qi + 1);
            const cur = phase !== "idle" && q === qi + 1;
            return (
              <span
                key={qi}
                className={`fc-slot ${done ? "fc-slot--done" : ""} ${cur ? "fc-slot--cur" : ""}`}
              >
                {range}
              </span>
            );
          })}
        </div>
        <div className="fc-schedot">
          🌙 OT 9–9:30pm · 2OT 9:30–10pm <b>savage</b>
        </div>

        <div className="fc-qprog">
          {qp ? (
            <>
              {qp.label} doors: <b>{qp.doors} / {qp.target || "—"}</b> ·{" "}
              <span className={qp.won ? "fc-obj" : "fc-obj fc-obj--miss"}>
                {qp.won ? "✓ quarter won — sale landed" : "land a sale to win the quarter"}
              </span>
              {qp.target > 0 && qp.doors >= qp.target && (
                <span className="fc-obj"> · 🎯 target smashed — keep scoring</span>
              )}
            </>
          ) : (
            <>Q1 target: <b>6 doors</b> · land a sale to win the quarter</>
          )}
        </div>

        {/* action row — the live door buttons (the board only renders in-game). */}
        <div className={`fc-actions fc-actions--${actions.length}`}>
          {actions.map((a) => (
            <button
              key={a.key}
              type="button"
              className={`fc-btn ${a.cls}`}
              disabled={!canPlay || paused}
              onClick={(e) => doLog(a.key, e)}
            >
              <span className="fc-btn__glyph">{a.glyph}</span>
              {a.label}
              <small>{a.sub}</small>
            </button>
          ))}
        </div>

        {/* GET LOUD — the lull-breaker. Tap it and the arena fires a real 15s
            hype chant (DEE-FENSE / drumline / organ CHARGE) to get you going. */}
        {phase === "playing" && (
          <button
            type="button"
            className={`fc-getloud ${hyping ? "fc-getloud--cooling" : ""}`}
            onClick={getLoud}
            disabled={paused || hyping}
            aria-label="Get loud — pump the crowd"
          >
            <span className="fc-getloud__glyph" aria-hidden="true">📣</span>
            <span className="fc-getloud__txt">
              {hyping ? "CROWD'S UP — RIDE IT" : "GET LOUD"}
              <small>{hyping ? "go get the next door" : "in a lull? pump the crowd"}</small>
            </span>
            <span className="fc-getloud__glyph" aria-hidden="true">🔊</span>
          </button>
        )}

        {/* clock controls — pause / end the quarter on demand (handoff #2) */}
        {phase === "playing" && (
          <div className="fc-clockctrl">
            <button
              type="button"
              className={`fc-cbtn ${paused ? "fc-cbtn--on" : ""}`}
              onClick={togglePause}
            >
              {paused ? "▶ Resume" : "⏸ Pause"}
            </button>
            <button type="button" className="fc-cbtn fc-cbtn--end" onClick={endQuarterNow}>
              ⏭ End quarter
            </button>
          </div>
        )}
        {paused && (
          <p className="fc-pausehint">
            Paused — the clock's frozen. Your door count is safe; resume when you're back on the
            street.
          </p>
        )}
      </div>
      )}

      {/* ---------------- QUARTER-END CELEBRATION (broadcast takeover) ---------------- */}
      {phase === "buzzer" && buzz && game && (
        <div className="fc-cine" role="dialog" aria-modal="true" aria-label="End of quarter">
          <div className="fc-cine__glow" aria-hidden="true" />
          <div className="fc-cine__inner">
            <div className="fc-cine__siren" aria-hidden="true">🚨</div>
            <div className="fc-cine__label">{buzz.label}</div>
            <div className="fc-cine__score">{game.points}</div>
            <div className="fc-cine__stat">
              {buzz.ended?.doors ?? 0} doors · {buzz.ended?.sales ?? 0}{" "}
              {(buzz.ended?.sales ?? 0) === 1 ? "sale" : "sales"} this quarter
              {buzz.ended?.won && <span className="fc-cine__won"> · ✓ QUARTER WON</span>}
            </div>

            {/* jumbotron quarter breakdown — points per quarter + checkmarks */}
            <QuarterBreakdown quarterLog={game.quarterLog} />

            <div className="fc-cine__readlbl">The game's read — tap to correct it:</div>
            <div className="fc-cine__reads">
              {READS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  className={`fc-read ${buzz.read === r.key ? "fc-read--on" : ""}`}
                  onClick={() => setBuzz((b) => (b ? { ...b, read: r.key } : b))}
                >
                  <span className="fc-read__glyph">{r.glyph}</span>
                  {r.label}
                  <small>{r.sub}</small>
                </button>
              ))}
            </div>

            <div className="fc-cine__lenrow">
              <span className="fc-cine__lenlbl">Locker room:</span>
              {BREAK_LENS.map((len) => (
                <button
                  key={len}
                  type="button"
                  className={`fc-len ${buzz.breakLen === len ? "fc-len--on" : ""}`}
                  onClick={() => setBreakLen(len)}
                >
                  {fmtClock(len)}
                </button>
              ))}
            </div>

            <div className="fc-cine__flavors">
              <button type="button" className="fc-flavor fc-flavor--reset" onClick={() => startBreak("reset")}>
                <span className="fc-flavor__glyph">🧘</span>
                RESET
                <small>guided visualization · calm voice</small>
              </button>
              <button type="button" className="fc-flavor fc-flavor--hype" onClick={() => startBreak("hype")}>
                <span className="fc-flavor__glyph">📣</span>
                HYPE ME UP
                <small>the coach has words for you</small>
              </button>
            </div>

            <button type="button" className="fc-cine__skip" onClick={nextQuarter}>
              Skip the break — straight back on the court →
            </button>
          </div>
        </div>
      )}

      {/* ---------------- LOCKER ROOM (break) ---------------- */}
      {phase === "break" && brk && (
        <div
          className={`fc-locker fc-locker--${brk.flavor}`}
          role="dialog"
          aria-modal="true"
          aria-label="Locker room break"
        >
          <div className="fc-locker__inner">
            <p className="fc-locker__eyebrow">
              {buzz?.isHalf ? "HALFTIME" : "TIMEOUT"} ·{" "}
              {brk.flavor === "hype" ? "the coach is talking" : "locker room reset"}
            </p>

            <div className="fc-locker__ringwrap" aria-hidden="true">
              <svg className="fc-locker__ring" viewBox="0 0 120 120">
                <circle className="fc-locker__ringbg" cx="60" cy="60" r="54" />
                <circle
                  className="fc-locker__ringfg"
                  cx="60"
                  cy="60"
                  r="54"
                  strokeDasharray={`${Math.max(0, brkFrac) * 339.3} 339.3`}
                />
              </svg>
              {brk.flavor === "reset" ? (
                <div className="fc-locker__orb" aria-hidden="true" />
              ) : (
                <div className="fc-locker__pulse" aria-hidden="true">📣</div>
              )}
              <div className="fc-locker__count">{fmtClock(brkClock)}</div>
            </div>

            <p key={brkCaption || "•"} className="fc-locker__caption">
              {brkCaption || (brk.flavor === "hype" ? "Coach is coming in…" : "Settle in…")}
            </p>

            <button type="button" className="fc-locker__skip" onClick={nextQuarter}>
              Back on the court →
            </button>
          </div>
        </div>
      )}

      {/* ---------------- ODDS ENGINE — live only ---------------- */}
      {inGame && (
        <div className="fc-odds">
          <div className="fc-odd fc-odd--hero">
            <div className="fc-odd__v">{odds ? odds.yourNumber : "—"}</div>
            <div className="fc-odd__l">
              <b>YOUR NUMBER</b>
              <br />
              doors to knock for 1 sale
            </div>
          </div>
          <div className="fc-odd">
            <div className="fc-odd__v">${odds ? odds.valueOfNo : 0}</div>
            <div className="fc-odd__l">
              value of every <b>"no"</b>
              <br />
              you just got paid
            </div>
          </div>
          <div className="fc-odd">
            <div className="fc-odd__v">${odds ? odds.onPaceDollars : 0}</div>
            <div className="fc-odd__l">
              on pace for
              <br />
              today's <b>payout</b>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- CONTROLS / IDLE / OVER ---------------- */}
      {phase === "idle" && (
        <div className="zn-card fc-setup arena-reveal">
          <span className="fc-seglbl">Tracking mode</span>
          <div className="fc-modeseg fc-modeseg--2" role="tablist" aria-label="Tracking mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "pro"}
              className={`fc-modebtn ${mode === "pro" ? "fc-modebtn--on" : ""}`}
              onClick={() => setMode("pro")}
            >
              Pro
              <small>Full funnel · sharper math</small>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "full"}
              className={`fc-modebtn ${mode === "full" ? "fc-modebtn--on" : ""}`}
              onClick={() => setMode("full")}
            >
              Full
              <small>6 outcomes · stat sheet</small>
            </button>
          </div>

          <span className="fc-seglbl">Day schedule</span>
          <div className="fc-modeseg fc-schedseg" role="tablist" aria-label="Day schedule">
            {Object.values(SCHEDULES).map((s) => (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={schedule === s.key}
                className={`fc-modebtn ${schedule === s.key ? "fc-modebtn--on" : ""}`}
                onClick={() => setSchedule(s.key)}
              >
                {s.label}
                <small>{s.hint}</small>
              </button>
            ))}
          </div>

          <div className="zn-field fc-field">
            <label className="zn-label" htmlFor="fc-avg">
              Avg commission per sale
            </label>
            <div className="fc-dollarwrap">
              <span className="fc-dollarsign">$</span>
              <input
                id="fc-avg"
                className="zn-input fc-dollar"
                type="number"
                inputMode="numeric"
                min="0"
                step="10"
                value={avgDollar}
                onChange={(e) => setAvgDollar(e.target.value)}
              />
            </div>
          </div>

          {seasonStatus === "offline" && (
            <p className="fc-note">
              You're offline — the game plays fully, but tonight's box score won't hit your
              season until you reconnect.
            </p>
          )}
          <button
            type="button"
            className="zn-btn zn-btn--ghost fc-statsbtn"
            onClick={() => setShowStats(true)}
          >
            📊 Season & stat sheet
          </button>

          {/* challenge a friend — live head-to-head (#5) */}
          <div className="fc-challenge">
            <p className="fc-seglbl">Challenge a friend · live head-to-head</p>
            {matchCode ? (
              <div className="fc-challenge__on">
                <span>
                  Match code <b>{matchCode}</b> — share it, then both tip off.
                </span>
                <button type="button" className="fc-linkbtn" onClick={leaveMatch}>
                  Leave match
                </button>
              </div>
            ) : (
              <div className="fc-challenge__row">
                <input
                  className="zn-input fc-codein"
                  type="text"
                  inputMode="text"
                  placeholder="ENTER CODE"
                  maxLength={5}
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                />
                <button
                  type="button"
                  className="zn-btn zn-btn--ghost fc-joinbtn"
                  disabled={codeInput.length < 4}
                  onClick={() => joinMatch(codeInput)}
                >
                  Join
                </button>
                <button
                  type="button"
                  className="zn-btn fc-hostbtn"
                  onClick={() => {
                    const c = makeMatchCode();
                    setCodeInput(c);
                    joinMatch(c);
                  }}
                >
                  Host
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {phase === "over" && bx && (
        <div className="zn-card fc-box arena-reveal">
          {/* jumbotron final summary — score, goal progress, sign-off */}
          <JumboFinal bx={bx} />
          <QuarterBreakdown quarterLog={game.quarterLog} />
          <h3 className="fc-boxtitle">🏆 Final buzzer · your box score</h3>
          <div className="fc-boxrows">
            <div className="fc-row">
              <span>Points</span>
              <b>{bx.points}</b>
            </div>
            <div className="fc-row">
              <span>Doors knocked</span>
              <b>{bx.doors}</b>
            </div>
            <div className="fc-row">
              <span>Contacts</span>
              <b>{bx.contacts}</b>
            </div>
            <div className="fc-row">
              <span>Good pitches</span>
              <b>{bx.pitches}</b>
            </div>
            <div className="fc-row">
              <span>Sales / closes</span>
              <b>{bx.sales}</b>
            </div>
            <div className="fc-row">
              <span>Close rate (per door)</span>
              <b>{bx.closePct}%</b>
            </div>
            <div className="fc-row">
              <span>Quarters won</span>
              <b>{bx.quartersWon} / 4</b>
            </div>
            <div className="fc-row">
              <span>Best heat streak</span>
              <b>{bx.bestHeat}</b>
            </div>
            <div className="fc-row">
              <span>Buzzer-beaters</span>
              <b>{bx.buzzerBeaters}</b>
            </div>
            <div className="fc-row fc-row--hero">
              <span>Projected payout</span>
              <b>${bx.payout}</b>
            </div>
          </div>

          {/* outcome breakdown — the 6 door outcomes feeding your stats (#4) */}
          {(() => {
            const ob = outcomeBreakdown(game);
            const cells = [
              { k: "no_answer", label: "No answers", v: ob.no_answer },
              { k: "not_interested", label: "Not interested", v: ob.not_interested },
              { k: "gatekeeper", label: "Gatekeepers", v: ob.gatekeeper },
              { k: "objection", label: "Objections", v: ob.objection },
              { k: "full_pitch", label: "Full pitches", v: ob.full_pitch },
              { k: "sale", label: "Sales", v: ob.sale },
            ];
            return (
              <div className="fc-obd">
                <p className="fc-obd__title">Outcome breakdown</p>
                <div className="fc-obd__grid">
                  {cells.map((c) => (
                    <div key={c.k} className={`fc-obd__cell fc-obd__cell--${c.k}`}>
                      <b>{c.v}</b>
                      <span>{c.label}</span>
                    </div>
                  ))}
                </div>
                <p className="fc-obd__conv">
                  Conversion: <b>{ob.conversionPct}%</b> · Good pitches: <b>{ob.goodPitches}</b>
                </p>
              </div>
            );
          })()}

          {bx.isPersonalBest && <div className="fc-pb">🏆 New personal best</div>}

          <div className="fc-boxcta">
            {logged === "done" ? (
              <div className="fc-logged">📣 Logged &amp; broadcast — this is your season growing.</div>
            ) : logged === "offline" ? (
              <div className="fc-logged fc-logged--off">
                Offline — reconnect and this box score joins your season.
              </div>
            ) : (
              <button
                type="button"
                className="zn-btn fc-logbtn"
                disabled={logging}
                onClick={logSeasonGame}
              >
                {logging ? "Logging…" : "✔ Log game to season"}
              </button>
            )}

            <div className="fc-boxctarow">
              {!loggedRef.current && (
                <button type="button" className="zn-btn zn-btn--ghost" onClick={goOvertime}>
                  ▶ Overtime — chase your record
                </button>
              )}
              <button type="button" className="zn-btn zn-btn--ghost" onClick={newGame}>
                ↻ New game
              </button>
            </div>
            <button
              type="button"
              className="zn-btn zn-btn--ghost fc-statsbtn"
              onClick={() => setShowStats(true)}
            >
              📊 Season &amp; stat sheet
            </button>
          </div>
        </div>
      )}

      {phase === "playing" && (
        <button
          type="button"
          className={`fc-restart ${resetArm ? "fc-restart--arm" : ""}`}
          onClick={startOver}
        >
          {resetArm ? "⚠ Tap again to wipe" : "↻ Start over"}
        </button>
      )}
    </div>
  );
}

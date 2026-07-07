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
  currentDrive,
  LADDER,
  HEAT_ON,
} from "../../../../lib/fullCourtEngine.js";
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
} from "../../../../lib/sfx.js";
import { createLineAudio, playLine, stopNarration } from "../../../../lib/voiceOver.js";
import {
  pickBreakTrack,
  breakTrackAudio,
  breakTrackSpokenText,
  BREAK_BEDS,
} from "../../../../data/fullCourtBreakScript.js";
import FullCourtStats from "./FullCourtStats.jsx";
import "./FullCourt.css";

const GOLD = "#FFD166";

// Local YYYY-MM-DD (matches how the Zone stamps local_date on proofs).
const today = () => new Date().toLocaleDateString("en-CA");
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

// GAME DAY clock — a quarter is 2 real hours; OT chases the record for 30 min.
// `?fcdev` (or #fcdev) anywhere in the URL shrinks everything for testing.
const DEV_FAST =
  typeof window !== "undefined" && /[?&#]fcdev\b/.test(window.location.href);
const Q_SECS = DEV_FAST ? 90 : 7200;
const OT_SECS = DEV_FAST ? 45 : 1800;
const BUZZER_WINDOW = DEV_FAST ? 10 : 60; // sale inside the final stretch = buzzer-beater
const BREAK_LENS = DEV_FAST ? [15, 30] : [60, 120];
const quarterSecs = (q) => (q > 4 ? OT_SECS : Q_SECS);

// A live game survives refreshes/navigation — it spans a whole workday.
const LIVE_KEY = "fullcourt_live_v1";
const BREAK_LEN_KEY = "fullcourt_break_len";
const LIVE_MAX_AGE_MS = 20 * 60 * 60 * 1000; // stale after 20h → fresh day

// Streamed Pollinations fallbacks if a baked break mp3 is missing.
const RESET_FALLBACK_VOICE = "shimmer";
const HYPE_FALLBACK_VOICE = "onyx";

// The 8 drives grouped into 4 quarters (2 each), from the Heat Ladder.
const LADDER_GROUPS = [
  [LADDER[0], LADDER[1]],
  [LADDER[2], LADDER[3]],
  [LADDER[4], LADDER[5]],
  [LADDER[6], LADDER[7]],
];
// Cumulative doors when each drive completes (a drive is "done" past its mark).
const DRIVE_CUM = [2, 6, 10, 16, 22, 30, 38, 48];

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

export default function FullCourt({ go }) {
  const { userId, member, fire, squads = [], partner } = useZoneCtx();
  const { celebrate, pushToast, settings } = useAppData();
  const reveal = useReveal();
  const burst = useArenaBurst();

  const squad = squads[0] || null;
  const squadName = squad?.name || null;
  const partnerActive =
    partner?.link?.status === "active" && partner?.partner ? partner.partner : null;
  const myTeam = squadName ? squadName.toUpperCase() : "SOLO RUN";
  const myTag = member?.username ? `@${member.username}` : "you";

  // Season prior (read from DB, seeds the Odds Engine so it "starts real").
  const [season, setSeason] = useState(null);
  const [seasonStatus, setSeasonStatus] = useState("loading"); // loading|ready|offline

  // Setup knobs.
  const [mode, setMode] = useState("rookie");
  const [avgDollar, setAvgDollar] = useState(250);

  // Live game state (null until tip-off) + UI phase.
  const [game, setGame] = useState(null);
  const [phase, setPhase] = useState("idle"); // idle|playing|buzzer|break|over
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

  // Persist bookkeeping.
  const [logging, setLogging] = useState(false);
  const [logged, setLogged] = useState(null); // null|'done'|'offline'
  const loggedRef = useRef(false);
  const aliveRef = useRef(true);

  // Break audio handles (voice mp3 + music bed + WebAudio fallback loop).
  const brkVoiceRef = useRef(null);
  const brkBedRef = useRef(null);
  const brkLoopRef = useRef(null);

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
        JSON.stringify({ game, phase, endsAt, mode, avgDollar, savedAt: Date.now() })
      );
    } catch {
      /* storage full/blocked — game still plays */
    }
  }, [game, phase, endsAt, mode, avgDollar, logged]);

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

  /* ---------------- buzzer / finish ---------------- */

  const finalize = useCallback(
    (next) => {
      setBuzz(null);
      setPhase("over");
      try {
        sfxPhoenix();
        sfxCrowdRoar();
      } catch {
        /* audio never blocks */
      }
      const bx = boxScore(next);
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
    [celebrate, pushToast, squadName]
  );

  // The quarter buzzer — a full celebration takeover, then the locker room.
  const doBuzzer = useCallback(
    (next, effort) => {
      try {
        sfxBuzzer();
        sfxCrowdRoar();
      } catch {
        /* silent */
      }
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
    [finalize, burst]
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

  const startQuarterClock = useCallback((q) => {
    const secs = quarterSecs(q);
    setEndsAt(Date.now() + secs * 1000);
    setClock(secs);
  }, []);

  const tipOff = useCallback(() => {
    const { prior, best } = seasonPrior(season);
    const g = createGame({
      mode,
      avgDollar: Number(avgDollar) > 0 ? Number(avgDollar) : 250,
      season: prior,
      seasonBest: best,
    });
    loggedRef.current = false;
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
    } catch {
      /* silent */
    }
  }, [season, mode, avgDollar, startQuarterClock]);

  // Pick up a saved live game where it left off. An expired quarter clock
  // simply buzzes on the next tick; a saved buzzer/break drops back to the
  // celebration screen so the rep re-picks their locker room.
  const resumeGame = useCallback(() => {
    if (!rejoin?.game) return;
    setMode(rejoin.mode === "pro" ? "pro" : "rookie");
    if (Number(rejoin.avgDollar) > 0) setAvgDollar(rejoin.avgDollar);
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
      if (!game || phase !== "playing") return;
      // A sale in the real clock's final stretch is the buzzer-beater.
      const next = logDoor(game, outcome, { atBuzzer: clock > 0 && clock <= BUZZER_WINDOW });
      if (next === game) return; // unknown outcome / finished
      const ev = next.lastEvent;
      if (ev?.targetSmashed) {
        try {
          sfxHorn(2);
        } catch {
          /* silent */
        }
      }
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;
      shootBall(x, y, ev);
      bump();
      setGame(next);
    },
    [game, phase, clock, shootBall, bump]
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
    [buzz, settings]
  );

  // Back on the court — break finished (or skipped from the buzzer screen).
  const nextQuarter = useCallback(() => {
    if (!game) return;
    stopBreakAudio();
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
    clearLive();
    setGame(null);
    setPhase("idle");
    setBuzz(null);
    setBrk(null);
    setFlies([]);
    setLogged(null);
    loggedRef.current = false;
  }, [stopBreakAudio, clearLive]);

  /* ---------------- stats sub-view ---------------- */

  if (showStats) {
    return <FullCourtStats go={go} onBack={() => setShowStats(false)} />;
  }

  /* ---------------- derived ---------------- */

  const odds = game ? oddsEngine(game) : null;
  const qp = game ? quarterProgress(game) : null;
  const drv = game ? currentDrive(game).drive : -1;
  const onFire = !!game && game.heat >= HEAT_ON;
  const lowClock = phase === "playing" && clock <= BUZZER_WINDOW;
  const actions = MODE_ACTIONS[mode] || MODE_ACTIONS.rookie;
  const canPlay = phase === "playing";
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
    <div className="fc-wrap" ref={reveal}>
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

      <button type="button" className="zn-back fc-back" onClick={() => go?.("arena")}>
        ← Arena
      </button>

      <header className="fc-head arena-reveal">
        <p className="zn-eyebrow">Full Court · The Law of Probability</p>
        <h2 className="fc-title">Run your day like a 4-quarter game</h2>
        <p className="fc-sub">
          Four real quarters — two hours each, just like a game day. Score on every door,
          smash the quarter's door target, and watch the Odds Engine prove the sale is baked
          into the math. Between quarters you hit the locker room: reset or get hyped, then
          back on the court.
        </p>
      </header>

      {/* ---------------- SCOREBOARD ---------------- */}
      <div className="fc-board zn-card zn-card--glow" data-fire={fire?.key || "cold"}>
        <div className="fc-top">
          <div className="fc-team">
            {myTeam}
            <small>
              {myTag} · {mode.toUpperCase()} MODE
            </small>
          </div>
          <div className="fc-topright">
            <span className="fc-qchip">{game ? quarterLabel(game) : "Q1"}</span>
            <span className={`fc-clock ${lowClock ? "fc-clock--low" : ""}`}>
              {fmtClock(phase === "idle" ? quarterSecs(1) : clock)}
            </span>
          </div>
        </div>

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
          </div>
        </div>

        {/* ladder */}
        <div className="fc-ladderlbl">DOOR TARGETS · 2-4-4-6-6-8-8-10 = 48 doors</div>
        <div className="fc-ladder">
          {LADDER_GROUPS.map((group, qi) => (
            <div className="fc-qgroup" key={qi}>
              <span className="fc-qname">Q{qi + 1}</span>
              <div className="fc-drives">
                {group.map((val, di) => {
                  const idx = qi * 2 + di;
                  const doors = game ? game.doors : 0;
                  const done = doors >= DRIVE_CUM[idx];
                  const cur = game && !done && drv === idx;
                  return (
                    <span
                      key={di}
                      className={`fc-drive ${done ? "fc-drive--done" : ""} ${cur ? "fc-drive--cur" : ""}`}
                    >
                      {val}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
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

        {/* action row — until tip-off the door buttons are inert, so show a loud
            TIP OFF CTA right here instead of dead-looking buttons. Live buttons
            appear the instant the game starts. */}
        {phase === "idle" ? (
          <div className="fc-actions fc-actions--tip">
            {rejoin?.game ? (
              <>
                <button type="button" className="zn-btn fc-tipnow" onClick={resumeGame}>
                  ▶ REJOIN YOUR GAME — {rejoin.game.quarter > 4 ? "OT" : `Q${rejoin.game.quarter}`}
                  {rejoin.phase === "playing" && rejoin.endsAt
                    ? ` · ${fmtClock(Math.max(0, Math.ceil((rejoin.endsAt - Date.now()) / 1000)))} left`
                    : " · at the buzzer"}
                </button>
                <p className="zn-hint fc-tiphint">
                  {rejoin.game.points} points on the board already — the day isn't over.{" "}
                  <button type="button" className="fc-linkbtn" onClick={abandonSave}>
                    Abandon that game
                  </button>
                </p>
              </>
            ) : (
              <>
                <button type="button" className="zn-btn fc-tipnow" onClick={tipOff}>
                  ▶ TIP OFF — start your game day
                </button>
                <p className="zn-hint fc-tiphint">
                  Four 2-hour quarters with a locker-room break between each. Log every door —
                  NO · PITCH · SALE — and watch the points climb. Pick Rookie/Pro or set your
                  commission below first if you like.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className={`fc-actions fc-actions--${actions.length}`}>
            {actions.map((a) => (
              <button
                key={a.key}
                type="button"
                className={`fc-btn ${a.cls}`}
                disabled={!canPlay}
                onClick={(e) => doLog(a.key, e)}
              >
                <span className="fc-btn__glyph">{a.glyph}</span>
                {a.label}
                <small>{a.sub}</small>
              </button>
            ))}
          </div>
        )}
      </div>

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

      {/* ---------------- ODDS ENGINE ---------------- */}
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
      <div className="fc-law">
        🎯 The Law of Probability:{" "}
        <b>
          {odds
            ? `at your average, the next sale is inside ${odds.nextSaleInDoors} ${
                odds.nextSaleInDoors === 1 ? "door" : "doors"
              }.`
            : "every no you log makes the yes more certain."}
        </b>{" "}
        Keep knocking — the math owes you.
      </div>

      {/* ---------------- CONTROLS / IDLE / OVER ---------------- */}
      {phase === "idle" && (
        <div className="zn-card fc-setup arena-reveal">
          <div className="fc-modeseg" role="tablist" aria-label="Tracking mode">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "rookie"}
              className={`fc-modebtn ${mode === "rookie" ? "fc-modebtn--on" : ""}`}
              onClick={() => setMode("rookie")}
            >
              Rookie
              <small>No · Pitch · Sale</small>
            </button>
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

          <button type="button" className="zn-btn fc-tipoff" onClick={tipOff}>
            ▶ Tip off — start the game
          </button>
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
        </div>
      )}

      {phase === "over" && bx && (
        <div className="zn-card fc-box arena-reveal">
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

      {(phase === "playing" || phase === "buzzer" || phase === "break") && (
        <p className="fc-realnote">
          Every tap is a real door. When the final buzzer's done, log the box score — that's what
          feeds your season and pings {partnerActive ? `@${partnerActive.username}` : "your squad"}.
        </p>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  sfxBallThrow, sfxSwish, sfxBank, sfxDunk, sfxHorn, sfxCoin, sfxBuzzer,
  sfxCupDrink, sfxCupPour, sfxCrowdRoar,
  playCrowdSample, playArenaStinger, stopCrowd,
  startCrowdBed, setCrowdEnergy, stopCrowdBed,
} from "../../../../lib/sfx.js";
import { crowdAudioPath, pickCheer, pickHype, pickReact, AMBIENT_ID } from "../../../../data/fullCourtCrowd.js";
import { COACH, pickCoachLine, coachClip } from "../../../../data/fullCourtVoice.js";
import { createLineAudio, playLine, stopNarration } from "../../../../lib/voiceOver.js";
import { joinLiveMatch, makeMatchCode } from "../../../../lib/fullCourtLive.js";
import { fullcourtLogGame, hoopsInvite } from "../../../../lib/arenaService.js";
import { listFriends } from "../../../../lib/zoneService.js";
import CoachingBreak from "./CoachingBreak.jsx";

// ============================================================
// HOOPS — Milestone Mapping door-to-door sales arena  (v5)
// ~330 packed fans w/ animated motivational signs · solid
// backboard · water-bottle hydration that tracks cups
// ============================================================

const V = "#a855f7";
const V_DEEP = "#7c3aed";
const V_GLOW = "#c084fc";
const GOLD = "#facc15";
const GREEN = "#22c55e";
const FIRE = "#fb7185";
const WATER = "#38bdf8";
const SPOKE = "#94a3b8";   // neutral slate — SPOKE TO (no name yet): tracked, worth 0
const BG = "#0a0714";
const CARD = "#140b24";

const ACTIONS = [
  { id: "knock",  label: "Knocked",          short: "KNOCKED",     sub: "RANG DOORBELL",       pts: 10,  color: V,        make: 0.78, blurb: "Every knock is a shot on the board." },
  { id: "pitch",  label: "Full Value Build", short: "VALUE BUILD", sub: "FULL PITCH",          pts: 50,  color: "#38bdf8",make: 1.00, blurb: "A full pitch ALWAYS goes in." },
  { id: "price",  label: "Price Drop",       short: "PRICE DROP",  sub: "CUSTOMER INTERESTED", pts: 75,  color: "#22d3ee",make: 0.70, blurb: "Deep three. Crowd on its feet." },
  { id: "close",  label: "CLOSE — Sale",     short: "CLOSE",       sub: "SALE",                pts: 100, color: GREEN,    make: 1.00, blurb: "SLAM. Backboard shatters." },
];

const QUARTER_SECONDS = 2 * 60 * 60;  // default (weekday 2-hr)
// real D2D day schedules — sets quarter length + the on-clock windows
const SCHEDULES = [
  { id: "weekday", name: "WEEKDAY", hrs: 2, windows: ["1–3", "3–5", "5–7", "7–9pm"], blurb: "2-hour quarters", accent: "#38bdf8" },
  { id: "saturday", name: "SATURDAY", hrs: 3, windows: ["9–12", "12–3", "3–6", "6–9pm"], blurb: "3-hour quarters", accent: "#a855f7" },
  { id: "competition", name: "COMPETITION", hrs: 3, windows: ["9–12", "12–3", "3–6", "6–9pm"], blurb: "3-hour quarters · ranked", accent: "#ec4899" },
  { id: "grinder", name: "THE GRINDER", hrs: 3, windows: ["9–12", "12–3", "3–6", "6–9pm"], sub: "9–11 · 11–1 · 1–3 · 3–5 · 5–7 · 7–9", blurb: "full day · 9am–9pm marathon", accent: "#facc15" },
];
const STREAK_TIERS = [
  { at: 3,  name: "HEATING UP" },
  { at: 5,  name: "ON FIRE" },
  { at: 8,  name: "NAME MONSTER" },
  { at: 12, name: "UNSTOPPABLE" },
  { at: 18, name: "CHAMPIONSHIP MODE" },
];
// short signs (closer rows) + a few longer ones
const SIGNS = ["YOU GOT THIS","KEEP GOING","ONE MORE","BELIEVE","YOU'RE CLOSE","DON'T STOP","EYES UP","GO GET IT","LET'S GO","STAY POSITIVE","NEXT DOOR","YOU CAN DO IT","PROUD OF YOU","KEEP KNOCKIN","★ MVP ★","YOU'RE CLUTCH"];
// bigger "law of probability" banners held by standing front-row fans
const LAW_SIGNS = ["IT'S THE LAW","EVERY NO = A YES","THE ODDS FAVOR REPS","MORE DOORS MORE $","PROBABILITY WINS","KEEP THE STREAK","VOLUME = VICTORY","TRUST THE MATH","THE LAW OF AVERAGES","EVERY KNOCK COUNTS"];
// dopamine reward callouts that flash on a made shot (law-of-probability themed)
const REWARD_LINES = [
  "THE LAW IS ON YOUR SIDE","THE ODDS JUST TIPPED","YOU'RE GETTING CLOSER","MATH DOESN'T MISS",
  "EVERY REP COUNTS","BUCKETS!","MONEY","THE SALE IS COMING","STAY HOT","GREEN LIGHT",
  "SPLASH!","AUTOMATIC","THE GRIND PAYS","ONE STEP CLOSER","PURE",
];
const BIG_REWARD_LINES = [
  "UNSTOPPABLE!","CAN'T MISS!","HE'S HEATING UP!","THE ODDS BOW TO YOU!","MONEY MACHINE!","PROBABILITY KING!",
];

// hydration: 1 full hour drains the bar; one sip ~ refills a chunk;
// 4 sips = one full cup logged.
const DRAIN_PER_GAME_SEC = 100 / 7200; // gentler: ~one bottle per 2h quarter (was 1/hr)
const SIP_REFILL = 12;                  // (legacy) % per sip
const DRINK_WATER = 20;                 // % water consumed from bottle per drink
const DRINK_ENERGY = 16;                // % energy gained per drink
const SIPS_PER_CUP = 4;

const fmt = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

// The REAL app sound system, wrapped in the prototype's { beep, chord, roar,
// gulp } shape so existing call-sites keep working — plus explicit "big moment"
// methods (ball throw, swish, dunk eruption, hype, whistle, buzzer, reactive
// crowd bed). beep + roar stay light synth (UI ticks + a quick crowd swell so
// rapid taps never stack real roars); everything that matters routes to sfx.js +
// the baked crowd mp3s. Gated by the game's own SOUND toggle via a live settings
// object passed to each sfx call.
function useHoopsAudio(enabled) {
  const ctx = useRef(null);
  const set = useRef({ soundEnabled: enabled });
  set.current.soundEnabled = enabled;
  const S = () => set.current;
  const coachSeen = useRef(new Set());
  const coachRef = useRef(null);
  const ensure = () => { if (!ctx.current) ctx.current = new (window.AudioContext || window.webkitAudioContext)(); return ctx.current; };
  // light synth blip — tip-off + clock ticks (kept cheap on purpose)
  const beep = useCallback((f, d, t = "sine", v = 0.15) => {
    if (!enabled) return;
    try { const c = ensure(); const o = c.createOscillator(); const g = c.createGain();
      o.type = t; o.frequency.value = f; g.gain.setValueAtTime(v, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d);
      o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + d);
    } catch (e) {}
  }, [enabled]);
  // short crowd swell per make (synth so rapid makes don't stack real roars)
  const roar = useCallback((intensity = 0.4) => {
    if (!enabled) return;
    try { const c = ensure(); const bufSize = c.sampleRate * 0.7; const buf = c.createBuffer(1, bufSize, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 1.4);
      const src = c.createBufferSource(); src.buffer = buf;
      const filt = c.createBiquadFilter(); filt.type = "bandpass"; filt.frequency.value = 700; filt.Q.value = 0.6;
      const g = c.createGain(); g.gain.value = intensity;
      src.connect(filt); filt.connect(g); g.connect(c.destination); src.start();
    } catch (e) {}
  }, [enabled]);
  // real positive ding + real gulp (args ignored — call-sites still pass them)
  const chord = useCallback(() => { if (!enabled) return; try { sfxCoin(S()); } catch (e) {} }, [enabled]);
  const gulp = useCallback(() => { if (!enabled) return; try { sfxCupDrink(S()); } catch (e) {} }, [enabled]);
  // ---- explicit real "big moment" sounds ----
  const ball = useCallback(() => { if (!enabled) return; try { sfxBallThrow(S()); } catch (e) {} }, [enabled]);
  const swish = useCallback((made = true) => { if (!enabled) return; try { made ? sfxSwish(S()) : sfxBank(S()); } catch (e) {} }, [enabled]);
  const dunkSlam = useCallback(() => { if (!enabled) return; try { sfxDunk(S()); sfxHorn(2, S()); const c = pickCheer(); if (c) playCrowdSample(crowdAudioPath(c.id), { settings: S(), volume: 0.9, fallback: sfxCrowdRoar }); } catch (e) {} }, [enabled]);
  const hype = useCallback(() => { if (!enabled) return; try { sfxHorn(2, S()); const h = pickHype(); if (h) playCrowdSample(crowdAudioPath(h.id), { settings: S(), volume: 0.85, fallback: sfxCrowdRoar }); } catch (e) {} }, [enabled]);
  const react = useCallback(() => { if (!enabled) return; try { const r = pickReact(); if (r) playArenaStinger(crowdAudioPath(r.id), { settings: S(), volume: 0.5 }); } catch (e) {} }, [enabled]);
  const cupPour = useCallback(() => { if (!enabled) return; try { sfxCupPour(100, S()); } catch (e) {} }, [enabled]);
  const whistle = useCallback(() => { if (!enabled) return; try { playArenaStinger(crowdAudioPath("stinger-whistle"), { settings: S(), fallback: sfxCrowdRoar }); } catch (e) {} }, [enabled]);
  const buzzer = useCallback(() => { if (!enabled) return; try { sfxBuzzer(S()); } catch (e) {} }, [enabled]);
  const bedStart = useCallback(() => { if (!enabled) return; try { startCrowdBed(crowdAudioPath(AMBIENT_ID), { settings: S() }); } catch (e) {} }, [enabled]);
  const bedEnergy = useCallback((v) => { try { setCrowdEnergy(v); } catch (e) {} }, []);
  const bedStop = useCallback(() => { try { stopCrowdBed(); stopCrowd(); stopNarration([coachRef.current]); coachRef.current = null; } catch (e) {} }, []);
  // Coach Alex drops a rotating affirmation (baked mp3 → streamed → synth), never
  // repeating a line until the pool cycles.
  const coach = useCallback((pool) => {
    if (!enabled) return;
    try {
      const line = pickCoachLine(pool, coachSeen.current);
      if (!line) return;
      coachSeen.current.add(line.id);
      if (coachSeen.current.size > 12) coachSeen.current.delete(coachSeen.current.values().next().value);
      stopNarration([coachRef.current]);
      const a = createLineAudio(line.text, COACH.voice, coachClip(line.id), { elevenVoiceId: COACH.elevenId });
      coachRef.current = a;
      setTimeout(() => { if (coachRef.current === a) playLine(a, line.text, S()); }, 120);
    } catch (e) {}
  }, [enabled]);
  // Stable identity across renders (changes only when the SOUND toggle flips) so
  // the reactive-bed effect doesn't restart every render.
  return React.useMemo(
    () => ({ beep, chord, roar, gulp, ball, swish, dunkSlam, hype, react, coach, cupPour, whistle, buzzer, bedStart, bedEnergy, bedStop, settings: S }),
    [enabled] // eslint-disable-line react-hooks/exhaustive-deps
  );
}

// ---- resume an in-progress game across a refresh / re-open ----
// A real-time game spans hours, so we snapshot SOLO progress to localStorage and
// jump back into it on next open. Live matches aren't persisted (the opponent is
// realtime). Cleared on finish, on "Back to Arena", and when a fresh game starts.
const ACTIVE_KEY = "hoops_active_v1";
const MAX_RESUME_MS = 18 * 60 * 60 * 1000; // don't resume a game older than ~18h
function loadActiveGame() {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    // s.clock is the RAW game-seconds left at save time (always > 0 when persisted).
    if (!s || s.v !== 1 || s.players !== 1 || !(s.clock > 0)) return null;
    if (s.savedAt && Date.now() - s.savedAt > MAX_RESUME_MS) return null;
    // ---- advance the clock for the real time the app was closed ----
    // The quarter runs in real wall-clock time, so a closed game keeps ticking.
    // Rebuild the anchor from clock + savedAt + timeScale on the next open.
    const ts = s.timeScale || 1;
    const gap = s.savedAt ? ((Date.now() - s.savedAt) / 1000) * ts : 0; // game-secs elapsed while closed
    const drainGap = Math.min(gap, s.clock) * DRAIN_PER_GAME_SEC;       // energy catches up too
    s.energy = Math.max(0, (s.energy != null ? s.energy : 70) - drainGap);
    const advanced = s.clock - gap;
    if (advanced <= 0) { s.clock = 0; s.resumeEnded = true; } // quarter ended while away → resume into the break
    else { s.clock = advanced; }
    s.timeScale = ts;
    return s;
  } catch (e) { return null; }
}
function clearActiveGame() {
  try { localStorage.removeItem(ACTIVE_KEY); } catch (e) {}
}

export default function Hoops({ go, initialFullscreen = false }) {
  // Resume a solo game left in progress (snapshot written during play, below).
  const resumeRef = useRef(loadActiveGame());
  const resumed = resumeRef.current;
  // A game left in progress lands on the MENU (with Rejoin / Start New), not
  // straight back into play — leaving the screen keeps it running; only the
  // in-game End Game button (or Start New) stops it.
  const [scene, setScene] = useState(resumed ? "menu" : "intro");
  const [hasResume, setHasResume] = useState(!!resumed);   // drives the Rejoin/Start-New menu
  const [confirmEnd, setConfirmEnd] = useState(false);     // in-game "End Game" confirm overlay
  const [sound, setSound] = useState(true);
  const [players, setPlayers] = useState(1);
  // 'phone' | 'ipad' — picked every session on the device-select screen (not persisted).
  // A resumed game skips the picker, so seed it once from a screen-size sniff.
  const [device, setDevice] = useState(() =>
    resumed && typeof window !== "undefined" && Math.min(window.innerWidth, window.innerHeight) >= 768 ? "ipad" : "phone"
  );
  // Live size of the game's own frame (inside the safe-area insets) — drives the
  // iPad "portrait stage" fit-to-height scale. Measured off the root via ResizeObserver.
  const rootRef = useRef(null);
  const [frame, setFrame] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const measure = () => setFrame({ w: el.clientWidth, h: el.clientHeight });
    measure();
    let ro;
    if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(measure); ro.observe(el); }
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => { if (ro) ro.disconnect(); window.removeEventListener("resize", measure); window.removeEventListener("orientationchange", measure); };
  }, []);
  const [finalStats, setFinalStats] = useState(null);
  const [schedule, setSchedule] = useState(
    resumed ? (SCHEDULES.find((s) => s.id === resumed.scheduleId) || SCHEDULES[0]) : SCHEDULES[0]
  );
  const snd = useHoopsAudio(sound);

  // ---- live head-to-head (networked multiplayer over Realtime Broadcast) ----
  // Host a code, a friend joins it, both play at once and each sees the other's
  // baskets drop + points climb. Ephemeral pub/sub — no backend, no migration.
  const [match, setMatch] = useState(null); // { code, hosting, ok } while in a match
  const [opponent, setOpponent] = useState(null); // opponent's latest published line
  const liveRef = useRef(null);
  const meRef = useRef({ id: Math.random().toString(36).slice(2, 9), name: "Rep" });
  const startLive = useCallback((code, hosting) => {
    try { liveRef.current?.leave(); } catch (e) {}
    setOpponent(null);
    const handle = joinLiveMatch(code, { me: meRef.current, onOpponent: (line) => setOpponent(line) });
    liveRef.current = handle;
    setMatch({ code: (code || "").toUpperCase(), hosting, ok: !!(handle && handle.ok) });
    return handle;
  }, []);
  const endLive = useCallback(() => {
    try { liveRef.current?.leave(); } catch (e) {}
    liveRef.current = null;
    setMatch(null);
    setOpponent(null);
  }, []);
  const publishLine = useCallback((line) => {
    try { liveRef.current?.publish(line); } catch (e) {}
  }, []);
  useEffect(() => () => { try { liveRef.current?.leave(); } catch (e) {} }, []);
  // Opened from a friend's HOOPS challenge notification → auto-join their match.
  useEffect(() => {
    let code = null;
    try { code = localStorage.getItem("hoops_pending_invite"); } catch (e) {}
    if (code) {
      try { localStorage.removeItem("hoops_pending_invite"); } catch (e) {}
      startLive(code, false);
      setScene("lobby");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Log a finished game to the season stat sheet (best-effort, offline-safe).
  // Maps HOOPS' actions onto the shared az_fullcourt funnel so the season keeps growing.
  const logHoopsGame = useCallback((stats) => {
    try {
      const t = stats?.tally;
      if (!t) return;
      const names = t.names || 0;
      const doors = t.knock.a + t.pitch.a + t.price.a + t.close.a + names;
      const contacts = t.pitch.a + t.price.a + t.close.a + names;
      const pitches = t.pitch.a + t.price.a;
      const payload = {
        mode: "full",
        points: stats.score || 0,
        doors,
        contacts,
        pitches,
        sales: t.close.m,
        objections: t.price.a,
        q_won: stats.qWon || 0,
        ot: false,
        avg_dollar: 250,
        outcomes: { knock: t.knock.a, pitch: t.pitch.a, price: t.price.a, close: t.close.m, names },
        played_on: new Date().toLocaleDateString("en-CA"),
      };
      Promise.resolve(fullcourtLogGame(payload)).catch(() => {});
    } catch (e) { /* season logging never blocks the game */ }
  }, []);
  return (
    <div ref={rootRef} style={{ position: "fixed", top: "var(--safe-top, 0px)", bottom: "var(--safe-bottom, 0px)", left: "var(--safe-left, 0px)", right: "var(--safe-right, 0px)", zIndex: 20, background: BG, overflow: "hidden", fontFamily: "'Rajdhani',system-ui,sans-serif", color: "#fff", WebkitTapHighlightColor: "transparent" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Oswald:wght@500;600;700&family=Orbitron:wght@700;900&display=swap');
        * { box-sizing: border-box; -webkit-user-select: none; user-select: none; }
        @keyframes pulseGlow { 0%,100%{filter:drop-shadow(0 0 12px ${V})} 50%{filter:drop-shadow(0 0 34px ${V_GLOW})} }
        @keyframes ringDraw { to { stroke-dashoffset: 0; } }
        @keyframes logoRise { 0%{opacity:0;transform:translateY(14px) scale(.9)} 60%{opacity:1} 100%{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes floatBoard { 0%,100%{transform:translate(-50%,0)} 50%{transform:translate(-50%,-4px)} }
        @keyframes flare { 0%,100%{opacity:.4} 50%{opacity:1} }
        @keyframes riseFade { 0%{opacity:0;transform:translate(-50%,10px) scale(.8)} 18%{opacity:1;transform:translate(-50%,-8px) scale(1.15)} 100%{opacity:0;transform:translate(-50%,-70px) scale(1)} }
        @keyframes shake { 0%,100%{transform:translate(0,0)} 25%{transform:translate(-6px,3px)} 50%{transform:translate(6px,-3px)} 75%{transform:translate(-4px,-4px)} }
        @keyframes windup { 0%{transform:translateX(-50%) translateY(0)} 40%{transform:translateX(-50%) translateY(8px)} 100%{transform:translateX(-50%) translateY(0)} }
        @keyframes rimHang { 0%,100%{transform:translateX(-50%) translateY(-106px) rotate(-2.5deg)} 50%{transform:translateX(-50%) translateY(-102px) rotate(2.5deg)} }
        @keyframes confettiFall { 0%{transform:translateY(0) rotate(0);opacity:1} 100%{transform:translateY(115vh) rotate(540deg);opacity:.7} }
        @keyframes stampIn { 0%{opacity:0;transform:scale(2.4) rotate(-8deg)} 60%{opacity:1;transform:scale(0.92) rotate(2deg)} 100%{opacity:1;transform:scale(1) rotate(0)} }
        @keyframes spinSlow { to{transform:translate(-50%,-50%) rotate(360deg)} }
        @keyframes rise { 0%{opacity:0;transform:translateY(14px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes tickerIn { 0%{opacity:0;transform:translateY(12px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes tickerSheen { 0%{transform:translateX(-120%)} 60%,100%{transform:translateX(120%)} }
        @keyframes sceneFade { 0%{opacity:0;transform:scale(1.04)} 100%{opacity:1;transform:scale(1)} }
        @keyframes ballHop { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
        @keyframes dunkLeap { 0%{transform:translateX(-50%) translateY(70px) scale(.8)} 55%{transform:translateX(-50%) translateY(-6px) scale(1.05)} 70%{transform:translateX(-50%) translateY(-6px) scale(1.05)} 100%{transform:translateX(-50%) translateY(-2px) scale(1)} }
        @keyframes sip { 0%,100%{transform:rotate(0)} 45%{transform:rotate(-24deg)} 70%{transform:rotate(-24deg)} }
        @keyframes cheer { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes speedline { 0%{opacity:0;transform:translateX(-100%)} 50%{opacity:.5} 100%{opacity:0;transform:translateX(100%)} }
        @keyframes bigWarn { 0%{opacity:0;transform:scale(2)} 30%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(.9)} }
        @keyframes crowdBob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
        /* signs raise and lower: hidden -> up -> hold -> down */
        @keyframes signCycle {
          0%,8%   { transform:translateY(14px) scale(.6); opacity:0 }
          16%,60% { transform:translateY(0) scale(1); opacity:1 }
          70%,100%{ transform:translateY(14px) scale(.6); opacity:0 }
        }
        @keyframes flashPop { 0%{opacity:0} 10%{opacity:1} 100%{opacity:0} }
        @keyframes rewardPop { 0%{opacity:0;transform:translate(-50%,-50%) scale(.3) rotate(-6deg)} 20%{opacity:1;transform:translate(-50%,-50%) scale(1.15) rotate(2deg)} 35%{transform:translate(-50%,-50%) scale(0.96) rotate(-1deg)} 50%{transform:translate(-50%,-50%) scale(1.04)} 80%{opacity:1;transform:translate(-50%,-50%) scale(1)} 100%{opacity:0;transform:translate(-50%,-70%) scale(1)} }
        @keyframes confettiFly { 0%{opacity:1;transform:translate(0,0) rotate(0)} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) rotate(360deg)} }
        @keyframes edgePulse { 0%{opacity:0} 30%{opacity:1} 100%{opacity:0} }
        @keyframes lifePop { 0%{opacity:0;transform:translate(-50%,-50%) scale(.2)} 25%{opacity:1;transform:translate(-50%,-50%) scale(1.3)} 45%{transform:translate(-50%,-50%) scale(0.95)} 60%{transform:translate(-50%,-50%) scale(1.08)} 80%{opacity:1;transform:translate(-50%,-55%) scale(1)} 100%{opacity:0;transform:translate(-50%,-90%) scale(1)} }
        @keyframes aisleWalk { 0%{top:14px;opacity:.5;transform:translateX(-50%) scale(.7)} 50%{top:var(--h);opacity:1;transform:translateX(-50%) scale(1.05)} 100%{top:14px;opacity:.5;transform:translateX(-50%) scale(.7)} }
        @keyframes aisleWalk2 { 0%{top:var(--h);opacity:1;transform:translateX(-50%) scale(1.05)} 50%{top:20px;opacity:.5;transform:translateX(-50%) scale(.7)} 100%{top:var(--h);opacity:1;transform:translateX(-50%) scale(1.05)} }
        @keyframes mascotDance { 0%,100%{transform:rotate(-7deg) translateY(0)} 50%{transform:rotate(7deg) translateY(-5px)} }
        @keyframes mascotConfetti { 0%{opacity:1;transform:translate(0,0)} 100%{opacity:0;transform:translate(var(--tx),var(--ty)) rotate(300deg)} }
        @keyframes shirtToss { 0%{opacity:1;transform:translate(-50%,0) scale(.6)} 40%{opacity:1;transform:translate(calc(-50% + var(--dir)*34px),-30px) scale(1)} 100%{opacity:0;transform:translate(calc(-50% + var(--dir)*70px),10px) scale(.8)} }
        @keyframes wingFlap { 0%,100%{transform:rotate(0deg)} 50%{transform:rotate(-22deg)} }
        @keyframes wave { 0%,100%{transform:rotate(-18deg)} 50%{transform:rotate(18deg)} }
        @keyframes waterWave { 0%,100%{transform:translateX(-4px)} 50%{transform:translateX(4px)} }
        @keyframes swishNet { 0%,100%{transform:translateY(-3px) rotate(-2deg)} 50%{transform:translateY(3px) rotate(2deg)} }
        @keyframes bubble { 0%{transform:translateY(72px);opacity:0} 20%{opacity:1} 100%{transform:translateY(2px);opacity:0} }
        .seg { font-family:'Orbitron',monospace; }
        .noscroll::-webkit-scrollbar{display:none}
        /* This is a full-screen game, not a modal: while HOOPS is mounted, hide the
           Zone overlay's close (✕) so it doesn't read as a dismissible overlay. The
           game's own "Back to Arena" button is the exit. Auto-restored on unmount. */
        .zone-app__close { display: none !important; }
      `}</style>
      {/* exit back to the Zone Arena (launched fullscreen from the HOOPS button).
          Leaving does NOT end the game — the snapshot survives and keeps running in
          real time; you re-enter to Rejoin. Only End Game / Start New stops it. */}
      {go && (
        <button onClick={() => go("arena")} aria-label="Back to Arena" title="Back to Arena — game keeps running"
          style={{ position: "absolute", top: 8, left: 8, zIndex: 400, width: 32, height: 32, borderRadius: 9, background: "rgba(8,5,16,0.66)", border: "1px solid rgba(168,85,247,0.5)", color: "#fff", cursor: "pointer", fontSize: 14, lineHeight: 1, backdropFilter: "blur(3px)" }}>✕</button>
      )}
      {/* deliberate End Game — the only way to stop a running game (the ✕ just leaves) */}
      {scene === "game" && (
        <button onClick={() => setConfirmEnd(true)} aria-label="End game" title="End game"
          style={{ position: "absolute", top: 166, right: 8, zIndex: 400, padding: "6px 11px", borderRadius: 9, background: "rgba(40,8,12,0.72)", border: "1px solid rgba(239,68,68,0.6)", color: "#fecaca", cursor: "pointer", fontSize: 11, fontWeight: 700, letterSpacing: "1px", fontFamily: "'Oswald',sans-serif", backdropFilter: "blur(3px)" }}>END GAME</button>
      )}
      {confirmEnd && (
        <div style={{ position: "absolute", inset: 0, zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(4,2,10,0.72)", backdropFilter: "blur(4px)" }}>
          <div style={{ width: "min(320px,86%)", background: "linear-gradient(180deg,#160c2a,#0b0718)", border: "1.5px solid rgba(239,68,68,0.5)", borderRadius: 16, padding: "22px 20px", textAlign: "center", boxShadow: "0 0 40px rgba(0,0,0,0.7)" }}>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 19, letterSpacing: "1px", color: "#fff", marginBottom: 8 }}>END THIS GAME?</div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 14, color: "#b6a9d4", marginBottom: 18, lineHeight: 1.4 }}>The quarter clock stops for good — this game can’t be resumed.</div>
            <button onClick={() => { clearActiveGame(); resumeRef.current = null; setHasResume(false); endLive(); setConfirmEnd(false); setScene("menu"); }}
              style={{ width: "100%", padding: "13px", marginBottom: 8, borderRadius: 12, cursor: "pointer", background: "linear-gradient(90deg,#7f1d1d,#ef4444)", border: "1.5px solid rgba(239,68,68,0.8)", color: "#fff", fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: "1.5px", textTransform: "uppercase" }}>End Game</button>
            <button onClick={() => setConfirmEnd(false)}
              style={{ width: "100%", padding: "12px", borderRadius: 12, cursor: "pointer", background: "rgba(168,85,247,0.1)", border: "1.5px solid rgba(168,85,247,0.4)", color: "#fff", fontFamily: "'Oswald',sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: "1.5px", textTransform: "uppercase" }}>Keep Playing</button>
          </div>
        </div>
      )}
      {scene === "intro" && <Presenter onDone={() => { snd.chord([440,660,880],0.3); snd.roar(0.3); setScene("menu"); }} snd={snd} />}
      {scene === "menu" && <Menu
        resumeAvailable={hasResume}
        resumeLabel={hasResume && resumeRef.current ? `Q${resumeRef.current.quarter} · ${fmt(Math.ceil(resumeRef.current.clock))} left` : ""}
        onResume={()=>{ const fresh = loadActiveGame(); if (fresh) resumeRef.current = fresh; setPlayers(1); endLive(); snd.chord([523,659,784],0.25); setScene("game"); }}
        onStartNew={()=>{ if (typeof window !== "undefined" && !window.confirm("Start a new game? Your game in progress will be discarded.")) return; clearActiveGame(); resumeRef.current = null; setHasResume(false); setPlayers(1); endLive(); snd.chord([523,659,784],0.25); setScene("deviceselect"); }}
        onPlay={()=>{setPlayers(1); endLive(); snd.chord([523,659,784],0.25); setScene("deviceselect");}} onMulti={()=>{ snd.chord([523,659,784],0.25); setScene("lobby"); }} onHow={()=>setScene("howto")} sound={sound} setSound={setSound} />}
      {scene === "lobby" && <Lobby match={match} opponent={opponent} meName={meRef.current.name} onSetName={(n)=>{ meRef.current.name = n || "Rep"; }} onHost={()=>startLive(makeMatchCode(), true)} onJoin={(code)=>startLive(code, false)} onLeave={endLive} onStart={()=>{ setPlayers(2); snd.chord([523,659,784,988],0.3); setScene("deviceselect"); }} onBack={()=>{ endLive(); setScene("menu"); }} />}
      {scene === "deviceselect" && <DeviceSelect onPick={(d)=>{ setDevice(d); snd.chord([523,659,784,988],0.3); setScene("schedule"); }} onBack={()=>setScene(match ? "lobby" : "menu")} />}
      {scene === "schedule" && <ScheduleSelect onPick={(s)=>{ if (players === 1) { clearActiveGame(); resumeRef.current = null; setHasResume(false); } setSchedule(s); snd.chord([523,659,784,988],0.3); setScene("game"); }} onBack={()=>setScene("deviceselect")} />}
      {scene === "howto" && <HowTo onBack={()=>setScene("menu")} />}
      {scene === "game" && (device === "ipad" ? (
        <IpadStage frame={frame}>
          <Arena resume={resumeRef.current} players={players} schedule={schedule} snd={snd} match={match} opponent={opponent} meName={meRef.current.name} publishLine={publishLine} onEnd={(stats)=>{ if (players === 1) { clearActiveGame(); resumeRef.current = null; } setHasResume(!!resumeRef.current); setFinalStats(stats); logHoopsGame(stats); setScene("final"); }} />
        </IpadStage>
      ) : (
        <Arena resume={resumeRef.current} players={players} schedule={schedule} snd={snd} match={match} opponent={opponent} meName={meRef.current.name} publishLine={publishLine} onEnd={(stats)=>{ if (players === 1) { clearActiveGame(); resumeRef.current = null; } setHasResume(!!resumeRef.current); setFinalStats(stats); logHoopsGame(stats); setScene("final"); }} />
      ))}
      {scene === "final" && <FinalScreen stats={finalStats} players={players} opponent={opponent} onMenu={()=>{ endLive(); setScene("menu"); }} onReplay={()=>setScene(match ? "lobby" : "schedule")} />}
    </div>
  );
}

function Menu({ resumeAvailable, resumeLabel, onResume, onStartNew, onPlay, onMulti, onHow, sound, setSound }) {
  const Btn = ({ children, onClick, primary }) => (
    <button onClick={onClick} style={{ width: 270, padding: "15px 20px", margin: "6px 0", cursor: "pointer", background: primary ? `linear-gradient(90deg,${V_DEEP},${V})` : "rgba(168,85,247,0.08)", border: `1.5px solid ${primary ? V_GLOW : "rgba(168,85,247,0.4)"}`, borderRadius: 12, color: "#fff", fontFamily: "'Oswald',sans-serif", fontWeight: 600, fontSize: 17, letterSpacing: "2px", textTransform: "uppercase", boxShadow: primary ? "0 0 24px rgba(168,85,247,0.5)" : "none" }}>{children}</button>
  );
  return (
    <div className="noscroll" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflowY: "auto", padding: "30px 0", background: `radial-gradient(ellipse at 50% 30%,#1a1030 0%,${BG} 70%)` }}>
      <Ambience />
      <HoopsWordmark width={Math.min(320, typeof window !== "undefined" ? window.innerWidth * 0.82 : 320)} hideSub />
      <div style={{ height: 26 }} />
      <LawPanel />
      <div style={{ height: 18 }} />
      {resumeAvailable ? (
        <>
          {/* a game is still running (you left it) — rejoin it, or discard + start fresh */}
          <Btn primary onClick={onResume}>Rejoin Game</Btn>
          {resumeLabel && <div style={{ marginTop: -2, marginBottom: 4, fontFamily: "'Rajdhani',sans-serif", fontSize: 12, letterSpacing: "1.5px", color: "#b6a9d4", textTransform: "uppercase" }}>{resumeLabel}</div>}
          <Btn onClick={onStartNew}>Start New Game</Btn>
        </>
      ) : (
        <Btn primary onClick={onPlay}>Start Game</Btn>
      )}
      <Btn onClick={onMulti}>Multiplayer · Live</Btn>
      <Btn onClick={onHow}>How to Play</Btn>
      <button onClick={() => setSound(!sound)} style={{ marginTop: 14, background: "none", border: "none", color: "#7c6b96", fontSize: 12, letterSpacing: "2px", cursor: "pointer", fontWeight: 600 }}>SOUND: {sound ? "ON" : "OFF"}</button>
    </div>
  );
}

// ===== LIVE MATCH lobby — host a code or join a friend's; both play at once =====
const lobbySub = { display: "block", fontSize: 10, fontWeight: 600, opacity: 0.85, letterSpacing: "0.5px", marginTop: 3 };
const hostBtn = { width: "100%", padding: "15px 18px", borderRadius: 14, cursor: "pointer", background: `linear-gradient(90deg,${V_DEEP},${V})`, border: `1.5px solid ${V_GLOW}`, color: "#fff", fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "1.5px", boxShadow: "0 0 22px rgba(168,85,247,0.4)" };
const joinBtn = { padding: "12px 20px", borderRadius: 10, cursor: "pointer", background: "rgba(56,189,248,0.15)", border: `1.5px solid ${WATER}`, color: "#fff", fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: "1px" };
function Lobby({ match, opponent, meName, onSetName, onHost, onJoin, onLeave, onStart, onBack }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState(meName || "Rep");
  const [friends, setFriends] = useState([]);
  const [invited, setInvited] = useState({});
  const connected = !!opponent;
  useEffect(() => {
    let alive = true;
    listFriends().then((r) => { if (alive) setFriends(Array.isArray(r?.friends) ? r.friends : []); }).catch(() => {});
    return () => { alive = false; };
  }, []);
  return (
    <div className="noscroll" style={{ position: "absolute", inset: 0, overflowY: "auto", background: `radial-gradient(ellipse at 50% 0%, #160c2a, ${BG} 65%)`, padding: "26px 18px 40px" }}>
      <Ambience />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <button onClick={onBack} style={{ ...ctrlBtn, minWidth: 34 }}>←</button>
        <div className="seg" style={{ fontWeight: 900, fontSize: 22, letterSpacing: "2px" }}>LIVE MATCH</div>
      </div>
      <div style={{ color: "#8b7ba8", fontSize: 12, letterSpacing: "1.5px", marginBottom: 18, fontFamily: "'Oswald',sans-serif", fontWeight: 600 }}>HOST A GAME OR JOIN A FRIEND'S CODE · BOTH PLAY AT ONCE</div>

      <div style={{ maxWidth: 420, margin: "0 auto 16px" }}>
        <div style={{ fontSize: 10, letterSpacing: "1.5px", color: "#7c6b96", fontWeight: 700, marginBottom: 5 }}>YOUR NAME</div>
        <input value={name} maxLength={14} onChange={(e) => { setName(e.target.value); onSetName(e.target.value); }} placeholder="Rep" style={{ width: "100%", padding: 12, borderRadius: 10, background: "#0d0718", border: "1px solid rgba(168,85,247,0.4)", color: "#fff", fontSize: 16, fontFamily: "'Rajdhani',sans-serif", WebkitUserSelect: "text", userSelect: "text" }} />
      </div>

      {!match ? (
        <div style={{ maxWidth: 420, margin: "0 auto", display: "grid", gap: 12 }}>
          <button onClick={onHost} style={hostBtn}>🏀 HOST A GAME<small style={lobbySub}>get a code to share</small></button>
          <div style={{ textAlign: "center", color: "#6b5b88", fontSize: 12, fontWeight: 700, letterSpacing: "2px" }}>— OR —</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} maxLength={5} placeholder="ENTER CODE" style={{ flex: 1, padding: 12, borderRadius: 10, background: "#0d0718", border: "1px solid rgba(56,189,248,0.4)", color: "#fff", fontSize: 18, letterSpacing: "3px", textAlign: "center", fontFamily: "'Orbitron',monospace", WebkitUserSelect: "text", userSelect: "text" }} />
            <button onClick={() => code.length >= 4 && onJoin(code)} disabled={code.length < 4} style={{ ...joinBtn, opacity: code.length >= 4 ? 1 : 0.5 }}>JOIN</button>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 420, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: "2px", color: "#8b7ba8", fontWeight: 700 }}>{match.hosting ? "SHARE THIS CODE" : "JOINED MATCH"}</div>
          <div className="seg" style={{ fontWeight: 900, fontSize: 46, letterSpacing: "8px", color: GOLD, textShadow: `0 0 20px ${GOLD}88`, margin: "6px 0 4px" }}>{match.code}</div>
          {!match.ok && <div style={{ color: FIRE, fontSize: 12, fontWeight: 700 }}>Offline — live scoring needs a connection. You can still play solo.</div>}
          <div style={{ margin: "14px 0", padding: "12px 14px", borderRadius: 12, background: connected ? "rgba(34,197,94,0.12)" : "rgba(168,85,247,0.08)", border: `1.5px solid ${connected ? GREEN : "rgba(168,85,247,0.4)"}` }}>
            {connected ? (
              <div style={{ color: GREEN, fontWeight: 800, letterSpacing: "1px" }}>✅ {opponent.name || "Opponent"} is in — you're both live!</div>
            ) : (
              <div style={{ color: "#b9a9d6", fontWeight: 600 }}>Waiting for your opponent to join…</div>
            )}
          </div>
          {match.hosting && friends.length > 0 && (
            <div style={{ margin: "4px auto 16px", textAlign: "left" }}>
              <div style={{ fontSize: 10, letterSpacing: "1.5px", color: "#7c6b96", fontWeight: 700, marginBottom: 8, textAlign: "center" }}>OR INVITE A ZONE FRIEND</div>
              <div style={{ maxHeight: 190, overflowY: "auto" }} className="noscroll">
                {friends.map((f) => {
                  const done = invited[f.user_id];
                  return (
                    <div key={f.user_id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", marginBottom: 6, borderRadius: 12, background: "rgba(20,11,36,0.7)", border: "1px solid rgba(168,85,247,0.25)" }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${V},${V_DEEP})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, overflow: "hidden", flexShrink: 0 }}>
                        {f.avatar_url ? <img src={f.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (f.display_name || f.username || "?").slice(0, 1).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.display_name || f.username}</div>
                        <div style={{ fontSize: 10, color: "#8b7ba8" }}>@{f.username}</div>
                      </div>
                      <button disabled={done === true} onClick={() => { hoopsInvite({ partnerId: f.user_id, matchCode: match.code }).then(() => setInvited((m) => ({ ...m, [f.user_id]: true }))).catch(() => setInvited((m) => ({ ...m, [f.user_id]: "err" }))); }} style={{ padding: "7px 13px", borderRadius: 9, cursor: done === true ? "default" : "pointer", background: done === true ? "rgba(34,197,94,0.16)" : "rgba(168,85,247,0.16)", border: `1px solid ${done === true ? GREEN : V_GLOW}`, color: done === true ? GREEN : "#fff", fontWeight: 700, fontSize: 11, letterSpacing: "0.5px", flexShrink: 0 }}>
                        {done === true ? "✓ INVITED" : done === "err" ? "RETRY" : "INVITE"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <button onClick={onStart} style={{ ...hostBtn, background: `linear-gradient(90deg,${V_DEEP},${GREEN})` }}>▶ TIP OFF<small style={lobbySub}>{connected ? "go head to head" : "start now — they can join mid-game"}</small></button>
          <button onClick={onLeave} style={{ marginTop: 12, background: "none", border: "none", color: "#7c6b96", fontSize: 12, fontWeight: 700, letterSpacing: "2px", cursor: "pointer", textDecoration: "underline" }}>LEAVE MATCH</button>
        </div>
      )}
      <div style={{ textAlign: "center", color: "#6b5b88", fontSize: 12, letterSpacing: "0.5px", fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, maxWidth: 380, margin: "22px auto 0" }}>
        You each play your own four quarters — the scoreboard shows your rival's baskets dropping and points climbing in real time. Highest score at the final buzzer wins.
      </div>
    </div>
  );
}

// (OpponentBar retired — the rival's live score now lives on the jumbotron's AWAY
//  side as a real HOME-vs-AWAY scoreboard; see Jumbotron's multiplayer branch.)

// ===== law-of-probability motivational panel (graffiti-cool) =====
function LawPanel() {
  const lines = ["EVERY NO IS MATH", "VOLUME BENDS THE ODDS", "THE MAKE IS INEVITABLE"];
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((n) => (n + 1) % lines.length), 2600); return () => clearInterval(t); }, []);
  return (
    <div style={{ position: "relative", marginTop: 26, width: "min(88vw, 340px)", padding: "18px 16px", borderRadius: 16, overflow: "hidden",
      background: "linear-gradient(135deg, rgba(56,189,248,0.08), rgba(168,85,247,0.10), rgba(236,72,153,0.08))",
      border: "1px solid rgba(168,85,247,0.3)" }}>
      {/* faint animated bell curve behind the text */}
      <svg viewBox="0 0 300 80" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.35 }}>
        <defs><linearGradient id="lp_g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#38bdf8"/><stop offset=".5" stopColor="#a855f7"/><stop offset="1" stopColor="#ec4899"/></linearGradient></defs>
        <path d="M0 74 C70 74 74 20 150 20 C226 20 230 74 300 74" fill="none" stroke="url(#lp_g)" strokeWidth="2.5" strokeLinecap="round"/>
        {[60,110,150,190,240].map((x,k)=><circle key={k} cx={x} cy={x===150?20:x<150?20+(150-x)*0.7:20+(x-150)*0.7} r="2" fill="#c084fc" style={{ animation: `pulse 2s ${k*0.3}s infinite` }}/>)}
      </svg>
      <div style={{ position: "relative", textAlign: "center" }}>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 9, letterSpacing: "4px", color: "#8b7ba8", fontWeight: 700 }}>THE LAW OF AVERAGES</div>
        <div key={i} style={{ fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: "clamp(18px,5.5vw,26px)", letterSpacing: "1px", marginTop: 6,
          color: "#fff", WebkitTextStroke: "1px rgba(124,58,237,0.6)",
          textShadow: `2px 2px 0 ${V_DEEP}, 0 0 18px ${V}`, animation: "rise 0.6s both" }}>
          {lines[i]}
        </div>
        <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 12, color: "#9d8bc0", letterSpacing: "1px", marginTop: 8, fontWeight: 600 }}>
          Knock enough doors and the curve carries the ball to the net. Keep shooting.
        </div>
      </div>
    </div>
  );
}

// ===== iPad "portrait stage" ==================================================
// The Arena is a stack of absolutely-positioned, phone-tuned pixels with no central
// scale knob. On iPad we render it onto a fixed design canvas (phone-shaped) that is
// centered and transform-scaled to fill the screen height — so the whole game grows
// as one crisp unit instead of floating small. Held upright, it fills top-to-bottom.
const IPAD_DW = 430;   // design width  — the phone width the game was tuned for
const IPAD_DH = 924;   // design height — portrait, ~iPhone content box
function IpadStage({ frame, children }) {
  const ready = frame && frame.w > 0 && frame.h > 0;
  // fit-contain: fills height on a tall portrait iPad; never clips in landscape.
  const s = ready ? Math.min(frame.w / IPAD_DW, frame.h / IPAD_DH) : 1;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "50%", left: "50%", width: IPAD_DW, height: IPAD_DH,
        transform: `translate(-50%,-50%) scale(${s})`, transformOrigin: "center center" }}>
        {children}
      </div>
    </div>
  );
}

// ===== device picker — shown after Start Game / Tip Off, before the day schedule =====
// A small styled device glyph reads clearer than an emoji (no real tablet emoji).
const DeviceGlyph = ({ w, h, accent }) => (
  <div style={{ width: w, height: h, margin: "2px auto 14px", borderRadius: Math.round(w * 0.18), border: `2.5px solid ${accent}`, background: `${accent}14`, boxShadow: `0 0 18px ${accent}44`, position: "relative" }}>
    <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", width: Math.round(w * 0.3), height: 3, borderRadius: 2, background: accent }} />
  </div>
);
function DeviceSelect({ onPick, onBack }) {
  const CARDS = [
    { id: "phone", name: "iPHONE", accent: WATER, gw: 46, gh: 82, blurb: "Standard size", sub: "Hold it upright" },
    { id: "ipad",  name: "iPAD",   accent: V,     gw: 74, gh: 96, blurb: "Bigger court · fills the screen", sub: "Hold it upright" },
  ];
  return (
    <div className="noscroll" style={{ position: "absolute", inset: 0, overflowY: "auto", background: `radial-gradient(ellipse at 50% 0%, #160c2a, ${BG} 65%)`, padding: "26px 16px 40px" }}>
      <Ambience />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <button onClick={onBack} style={{ ...ctrlBtn, minWidth: 34 }}>←</button>
        <div className="seg" style={{ fontWeight: 900, fontSize: 22, letterSpacing: "2px" }}>CHOOSE YOUR SCREEN</div>
      </div>
      <div style={{ color: "#8b7ba8", fontSize: 12, letterSpacing: "2px", marginBottom: 18, fontFamily: "'Oswald',sans-serif", fontWeight: 600 }}>PICK YOUR DEVICE · SIZES THE COURT TO FIT</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, maxWidth: 460, margin: "0 auto" }}>
        {CARDS.map((c) => (
          <button key={c.id} onClick={() => onPick(c.id)} style={{
            textAlign: "center", padding: "26px 14px 22px", borderRadius: 18, cursor: "pointer",
            background: "linear-gradient(180deg, rgba(20,11,36,0.9), #0c0718)", border: `2px solid ${c.accent}`,
            boxShadow: `0 0 22px ${c.accent}33`, color: "#fff", transition: "transform .1s",
          }}
          onMouseDown={(e)=>e.currentTarget.style.transform="scale(0.97)"}
          onMouseUp={(e)=>e.currentTarget.style.transform="scale(1)"}>
            <DeviceGlyph w={c.gw} h={c.gh} accent={c.accent} />
            <div className="seg" style={{ fontWeight: 900, fontSize: 22, letterSpacing: "1px", color: c.accent, textShadow: `0 0 14px ${c.accent}` }}>{c.name}</div>
            <div style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "1px", color: "#e6e0f5", marginTop: 8 }}>{c.blurb}</div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 11, letterSpacing: "1px", color: "#9d8bc0", marginTop: 3 }}>{c.sub}</div>
          </button>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 22, color: "#6b5b88", fontSize: 12, letterSpacing: "1px", fontFamily: "'Rajdhani',sans-serif", fontWeight: 600 }}>
        On iPad the court scales up to fill your screen. You can change this next time you start a game.
      </div>
    </div>
  );
}

function ScheduleSelect({ onPick, onBack }) {
  return (
    <div className="noscroll" style={{ position: "absolute", inset: 0, overflowY: "auto", background: `radial-gradient(ellipse at 50% 0%, #160c2a, ${BG} 65%)`, padding: "26px 16px 40px" }}>
      <Ambience />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <button onClick={onBack} style={{ ...ctrlBtn, minWidth: 34 }}>←</button>
        <div className="seg" style={{ fontWeight: 900, fontSize: 22, letterSpacing: "2px" }}>DAY SCHEDULE</div>
      </div>
      <div style={{ color: "#8b7ba8", fontSize: 12, letterSpacing: "2px", marginBottom: 18, fontFamily: "'Oswald',sans-serif", fontWeight: 600 }}>PICK YOUR SALES DAY · BUZZER TO BUZZER</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, maxWidth: 560, margin: "0 auto" }}>
        {SCHEDULES.map((s) => (
          <button key={s.id} onClick={() => onPick(s)} style={{
            textAlign: "center", padding: "22px 14px", borderRadius: 18, cursor: "pointer",
            background: "linear-gradient(180deg, rgba(20,11,36,0.9), #0c0718)", border: `2px solid ${s.accent}`,
            boxShadow: `0 0 22px ${s.accent}33`, color: "#fff", transition: "transform .1s",
          }}
          onMouseDown={(e)=>e.currentTarget.style.transform="scale(0.97)"}
          onMouseUp={(e)=>e.currentTarget.style.transform="scale(1)"}>
            <div className="seg" style={{ fontWeight: 900, fontSize: 22, letterSpacing: "1px", color: s.accent, textShadow: `0 0 14px ${s.accent}` }}>{s.name}</div>
            <div style={{ margin: "12px 0", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 5 }}>
              {s.windows.map((w, i) => (
                <span key={i} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, fontWeight: 700, padding: "3px 7px", borderRadius: 6, background: `${s.accent}18`, border: `1px solid ${s.accent}55`, color: "#e6e0f5" }}>{w}</span>
              ))}
            </div>
            {s.sub && <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: "0.5px", color: `${s.accent}cc`, marginTop: -6, marginBottom: 8 }}>GRIND HOURS · {s.sub}</div>}
            <div style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: "1px", color: "#9d8bc0" }}>{s.blurb}</div>
          </button>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 22, color: "#6b5b88", fontSize: 12, letterSpacing: "1px", fontFamily: "'Rajdhani',sans-serif", fontWeight: 600 }}>
        Each window is a quarter. The Grinder runs the full 9am–9pm day for the hardcore.
      </div>
    </div>
  );
}

function HowTo({ onBack }) {
  return (
    <div className="noscroll" style={{ position: "absolute", inset: 0, overflowY: "auto", padding: "26px 18px 50px", background: `linear-gradient(180deg,#150c26,${BG})` }}>
      <div style={{ maxWidth: 540, margin: "0 auto" }}>
        <div style={{ fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: 24, letterSpacing: "3px" }}>THE LEGEND</div>
        <p style={{ color: "#b9a9d6", lineHeight: 1.5, fontSize: 14 }}>Every action is a shot. Tap it, the ball flies — points only land when it drops through the net. The math is undefeated. Keep shooting.</p>
        {ACTIONS.map((a) => (
          <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 13px", margin: "7px 0", background: CARD, borderRadius: 10, border: "1px solid rgba(168,85,247,0.25)" }}>
            <div className="seg" style={{ fontWeight: 900, color: a.color, fontSize: 19, minWidth: 50 }}>+{a.pts}</div>
            <div>
              <div style={{ fontWeight: 700 }}>{a.label} <span style={{ color: "#6b5b88", fontSize: 11, fontWeight: 600 }}>· {a.make === 1 ? "always in" : Math.round(a.make*100)+"% shot"}</span></div>
              <div style={{ color: "#8b7ba8", fontSize: 12 }}>{a.blurb}</div>
            </div>
          </div>
        ))}
        <div style={{ padding: 15, margin: "14px 0", borderRadius: 12, background: "linear-gradient(135deg,rgba(250,204,21,0.12),rgba(168,85,247,0.12))", border: `1.5px solid ${GOLD}` }}>
          <div className="seg" style={{ fontWeight: 900, color: GOLD, fontSize: 17, letterSpacing: "2px" }}>STILL WINNING</div>
          <p style={{ color: "#e7d9a8", lineHeight: 1.5, fontSize: 13, margin: "6px 0 0" }}>They said no? Get the name anyway. A no with a name is a follow-up — the sale is on the way. There is no loss column here.</p>
        </div>
        <div style={{ padding: 15, margin: "0 0 14px", borderRadius: 12, background: `rgba(56,189,248,0.08)`, border: `1.5px solid ${WATER}` }}>
          <div className="seg" style={{ fontWeight: 900, color: WATER, fontSize: 17, letterSpacing: "2px" }}>HYDRATION</div>
          <p style={{ color: "#a8d8e7", lineHeight: 1.5, fontSize: 13, margin: "6px 0 0" }}>Door-to-door drains you. The bottle empties about once an hour — tap it to sip. Four sips = one full cup logged. Stay above 80% for the In The Zone multiplier. The game counts every cup you drink.</p>
        </div>
        <button onClick={onBack} style={{ marginTop: 4, width: "100%", padding: 14, borderRadius: 10, cursor: "pointer", background: `linear-gradient(90deg,${V_DEEP},${V})`, border: "none", color: "#fff", fontFamily: "'Oswald',sans-serif", fontWeight: 600, fontSize: 16, letterSpacing: "2px" }}>BACK TO MENU</button>
      </div>
    </div>
  );
}

const RIM_TOP = 112;   // rim distance from the top of the play zone (lowered rig; drives ball landing)
const RELEASE_BOTTOM_PCT = 0.30;

function Arena({ players, schedule, snd, match, opponent, meName, publishLine, onEnd, resume }) {
  const QSEC = (schedule ? schedule.hrs : 2) * 60 * 60;   // quarter length from schedule
  const windows = schedule ? schedule.windows : ["Q1","Q2","Q3","Q4"];
  const [score, setScore] = useState(resume ? resume.score : 0);
  const [quarter, setQuarter] = useState(resume ? resume.quarter : 1);
  const [clock, setClock] = useState(resume ? resume.clock : QSEC);
  const [running, setRunning] = useState(!!resume);
  const [countdown, setCountdown] = useState(resume ? null : "READY");   // whistle countdown before tip-off
  useEffect(() => {
    if (resume) return undefined;   // resumed game is already running — skip the tip-off
    const seq = [
      [900,  "3"], [1800, "2"], [2700, "1"],
      [3400, "TIP OFF!"], [4200, null],
    ];
    if (snd) setTimeout(() => snd.whistle(), 100);   // real ref whistle
    const timers = seq.map(([t, v]) => setTimeout(() => {
      if (v === null) {
        // tip-off: anchor the wall-clock timer to this instant
        anchorRef.current = { atMs: Date.now(), gameClock: QSEC, timeScale: 1 };
        lastDrainElapsedRef.current = 0; quarterEndedRef.current = false;
        lastHourRef.current = 0; sipsThisHourRef.current = 0;
        setCountdown(null); setRunning(true); if (snd) snd.roar(0.5);
      }
      else { setCountdown(v); if (snd && v !== "TIP OFF!") snd.beep(700, 0.12, "sine", 0.12); }
    }, t));
    return () => timers.forEach(clearTimeout);
  }, []);
  // 1 = real time: 1 game-second per real second, so a 2-hour (7200s) quarter
  // runs a full 2 real hours (buzzer-to-buzzer sales window). The speed toggle
  // below can bump to 60× (a ~2-min quarter) for demos/testing.
  const [timeScale, setTimeScale] = useState(resume && resume.timeScale ? resume.timeScale : 1);
  const [streak, setStreak] = useState(resume ? resume.streak : 0);
  const [energy, setEnergy] = useState(resume ? resume.energy : 70);    // drains from the clock; drinking refills it
  const [water, setWater] = useState(resume ? resume.water : 100);     // water level in your bottle; drinking empties it
  const [cups, setCups] = useState(resume ? resume.cups : 0);         // cups of water drank today (health tracker)
  const [bottles, setBottles] = useState(resume ? resume.bottles : 3);   // spare bottles you carry (lives)
  const [refillFlash, setRefillFlash] = useState(0);
  const [lifeGain, setLifeGain] = useState(0);   // triggers +1 LIFE celebration
  const [reward, setReward] = useState(null);   // {text, big, color} big centered callout
  const [confetti, setConfetti] = useState([]); // particle bursts on makes
  const [edgePulse, setEdgePulse] = useState(0);
  const sipsRef = useRef(0);
  const [floaties, setFloaties] = useState([]);
  const [warn, setWarn] = useState(null);
  const [nameModal, setNameModal] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [names, setNames] = useState(resume && Array.isArray(resume.names) ? resume.names : []);
  const [accuracy, setAccuracy] = useState(resume ? resume.accuracy : 0);
  const madeRef = useRef(0);
  const attemptsRef = useRef(0);
  const sipsThisHourRef = useRef(0);   // did they drink this game-hour?
  const lastHourRef = useRef(0);        // which game-hour block we're in
  const [dryHourWarn, setDryHourWarn] = useState(false);

  // ---- live stat tracker: attempts + makes per action, plus names/cups ----
  const emptyTally = () => ({
    knock:{a:0,m:0}, pitch:{a:0,m:0}, price:{a:0,m:0}, close:{a:0,m:0}, slam:{a:0,m:0}, names:0,
  });
  const [tally, setTally] = useState(resume && resume.tally ? resume.tally : emptyTally());     // running (whole game)
  const [records, setRecords] = useState({ knock: 0, close: 0, names: 0, score: 0 }); // personal bests
  // load saved records once
  useEffect(() => {
    try {
      const raw = localStorage.getItem("hoops_records");
      if (raw) setRecords(JSON.parse(raw));
    } catch (e) { /* no records yet */ }
  }, []);
  const qStartRef = useRef({ tally: emptyTally(), score: 0, cups: 0 }); // snapshot at quarter start
  const quarterScoresRef = useRef([]);  // per-quarter points for the box score
  // ---- wall-clock-anchored quarter clock ----
  // The clock is DERIVED from an anchor, never decremented, so it survives iOS
  // suspending the tab (screen lock / app background) — on return we recompute
  // from real elapsed time. anchor = { atMs, gameClock, timeScale }: the real
  // timestamp, game-seconds left at that instant, and the scale in force since.
  const anchorRef = useRef({ atMs: Date.now(), gameClock: resume ? resume.clock : QSEC, timeScale: resume && resume.timeScale ? resume.timeScale : 1 });
  const lastDrainElapsedRef = useRef(resume ? QSEC - resume.clock : 0); // game-secs-into-quarter drain was last applied at
  const quarterEndedRef = useRef(false);   // fire the end-of-quarter path exactly once
  const buildReportRef = useRef(null);     // always-fresh buildReport for the stable recompute
  // On resume, restore the non-state refs from the saved snapshot.
  useEffect(() => {
    if (!resume) return;
    madeRef.current = resume.made || 0;
    attemptsRef.current = resume.attempts || 0;
    sipsRef.current = resume.sips || 0;
    if (Array.isArray(resume.quarterScores)) quarterScoresRef.current = resume.quarterScores;
    if (resume.qStart) qStartRef.current = resume.qStart;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // On resume, seed the clock anchor / hour tracker OR — if the quarter's time ran
  // out while the app was closed — drop straight into that quarter's coaching break.
  // Runs after the ref-restore effect above so qStartRef is populated for buildReport.
  useEffect(() => {
    if (!resume) return;
    if (resume.resumeEnded || resume.clock <= 0) {
      setRunning(false);
      quarterEndedRef.current = true;
      setTimeout(() => buildReportRef.current && buildReportRef.current(), 300);
    } else {
      anchorRef.current = { atMs: Date.now(), gameClock: resume.clock, timeScale: resume.timeScale || 1 };
      lastDrainElapsedRef.current = QSEC - resume.clock;
      lastHourRef.current = Math.floor((QSEC - resume.clock) / 3600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Persist an in-progress SOLO game each tick so a refresh / re-open resumes it.
  // Live matches aren't saved (the opponent is realtime). Cleared by the parent
  // on finish / "Back to Arena" / starting a fresh game.
  useEffect(() => {
    if (players !== 1 || match) return;         // solo only
    if (!running || clock <= 0) return;         // not before tip-off / after the buzzer
    try {
      localStorage.setItem(ACTIVE_KEY, JSON.stringify({
        v: 1, scheduleId: schedule && schedule.id, players,
        score, quarter, clock, timeScale, streak, energy, water, cups, bottles,
        tally, names, accuracy,
        made: madeRef.current, attempts: attemptsRef.current,
        quarterScores: quarterScoresRef.current, sips: sipsRef.current,
        qStart: qStartRef.current, savedAt: Date.now(),
      }));
    } catch (e) { /* storage blocked/full — non-fatal */ }
  }, [players, match, running, clock, timeScale, quarter, score, streak, energy, water, cups, bottles, tally, names, accuracy, schedule]);
  const [report, setReport] = useState(null);           // legacy stat report (unused — replaced by the coaching break)
  const [breakInfo, setBreakInfo] = useState(null);     // coaching-break payload: { quarter, read, statLine, isFinal }
  const [statsOpen, setStatsOpen] = useState(false);    // live box-score overlay
  const [handed, setHanded] = useState("left");         // thumb-console side: 'left' | 'right'

  const [ball, setBall] = useState(null);
  const [shooting, setShooting] = useState(false);
  const [netSwish, setNetSwish] = useState(0);
  const [rimShake, setRimShake] = useState(false);
  const [dunk, setDunk] = useState(false);
  const [dunkPhase, setDunkPhase] = useState(null);  // null | 'jump' | 'hang' | 'drop'
  const [flash, setFlash] = useState(0);
  const busyRef = useRef(false);
  const idRef = useRef(0);
  // ---- live multiplayer: publish my shots + react to the opponent's ----
  const lastShotRef = useRef({ made: false, kind: "shot", gain: 0, seq: 0 });
  const [pubTick, setPubTick] = useState(0);
  const [oppFx, setOppFx] = useState(null);
  const oppSeqRef = useRef(-1);
  // mirror the opponent's shot on your screen so you can SEE them play — their
  // shooter winds up / dunks, a ball arcs from their side, and a pink "+N" pops.
  const [oppShoot, setOppShoot] = useState(false);
  const [oppBall, setOppBall] = useState(null);
  const [oppFloaties, setOppFloaties] = useState([]);
  const qWonRef = useRef(0); // quarters with a close, for the season stat sheet

  const streakTier = [...STREAK_TIERS].reverse().find((t) => streak >= t.at);
  const hotZone = streak >= 5;
  const quarterBonus = 1.5;
  const inZone = energy >= 80;
  const thirsty = energy < 25;

  // Real reactive crowd BED under gameplay — its volume rises with your streak
  // (and a nudge when In The Zone); hushed on pause / between quarters / sound off.
  useEffect(() => {
    // Background crowd/arena bed removed — Jon found the continuous ambience
    // distracting. Discrete reactions (swish, roar, cheers on big plays) still fire.
    snd.bedStop();
    return undefined;
  }, [running, snd]);
  useEffect(() => {
    snd.bedEnergy(Math.min(1, (streak / 8) * (inZone ? 1 : 0.85)));
  }, [streak, inZone, snd]);
  // never leave crowd audio running after the game unmounts
  useEffect(() => () => snd.bedStop(), [snd]);

  // publish my live line to the opponent on every shot + quarter change
  useEffect(() => {
    if (!match || !publishLine) return;
    const s = lastShotRef.current;
    publishLine({ points: score, doors: tally.knock.a, sales: tally.close.m, quarter, over: false, seq: s.seq, made: s.made, kind: s.kind, gain: s.gain });
  }, [pubTick, quarter, match, publishLine, score, tally]);
  // opponent took a shot (seq advanced) → mirror their throw on your screen so you
  // can SEE them play; on a make also flash their pill, pop a pink "+N", and cheer.
  useEffect(() => {
    if (!opponent || opponent.seq == null || opponent.seq === oppSeqRef.current) return;
    const first = oppSeqRef.current === -1;
    oppSeqRef.current = opponent.seq;
    if (first) return;   // the first line is just the initial sync, not a live shot
    const kind = opponent.kind || "shot";
    playOppShot(kind, !!opponent.made);   // show the throw whether they made it or not
    if (opponent.made) {
      const id = ++idRef.current;
      setOppFx({ id, gain: opponent.gain || 0, kind });
      setTimeout(() => setOppFx((f) => (f && f.id === id ? null : f)), 1500);
      spawnOppFloatie(`+${opponent.gain || 0}`, "#ec4899");
      try { snd.react(); } catch (e) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opponent, snd]);

  // ---- recompute the derived clock from the wall-clock anchor ----
  // Pure function of the anchor + refs (stable across renders); called from the
  // interval, the pause/timeScale effects, and on visibility return. It reads the
  // anchor's OWN timeScale, never the live state, so a mid-quarter toggle can't race.
  const recomputeClock = useCallback(() => {
    const now = Date.now();
    const a = anchorRef.current;
    const gameElapsed = ((now - a.atMs) / 1000) * a.timeScale; // game-secs burned since the anchor
    const rawRemaining = a.gameClock - gameElapsed;            // may go <= 0
    const qElapsed = QSEC - Math.max(0, rawRemaining);         // game-secs into the quarter (monotonic)
    // ---- hydration: same hour-block / dry-hour rules, driven off game-elapsed ----
    const secIntoHour = qElapsed % 3600;
    const hourBlock = Math.floor(qElapsed / 3600);
    if (hourBlock !== lastHourRef.current) {
      lastHourRef.current = hourBlock;
      sipsThisHourRef.current = 0;
      setDryHourWarn(false);
    }
    if (secIntoHour > 3000 && sipsThisHourRef.current === 0) setDryHourWarn(true);
    else if (sipsThisHourRef.current > 0) setDryHourWarn(false);
    // ---- energy: drain only the delta since the last recompute, so it catches up
    // after a background/close gap (drinking still refills energy separately) ----
    const drain = (qElapsed - lastDrainElapsedRef.current) * DRAIN_PER_GAME_SEC;
    if (drain > 0) { setEnergy((e) => Math.max(0, e - drain)); lastDrainElapsedRef.current = qElapsed; }
    // ---- end of quarter: test raw remaining, fire exactly once ----
    if (rawRemaining <= 0) {
      if (!quarterEndedRef.current) {
        quarterEndedRef.current = true;
        setClock(0); setRunning(false);
        setTimeout(() => buildReportRef.current && buildReportRef.current(), 300);
      }
      return;
    }
    setClock(Math.max(0, Math.ceil(rawRemaining))); // integer: keeps the 1-beep/sec + save cadence
  }, [QSEC]);

  // Drive the derived clock on a light interval (smooth UI + hydration/energy).
  // The math is anchored to wall time, so it survives iOS suspending the tab.
  // There is NO pause — once tip-off happens the game clock never stops.
  useEffect(() => {
    if (!running) return;
    const iv = setInterval(recomputeClock, 250);
    recomputeClock();                 // sync immediately on (re)start
    return () => clearInterval(iv);
  }, [running, recomputeClock]);

  // Speed toggle (1×/60×): re-anchor at the OLD scale, then stamp the NEW scale.
  useEffect(() => {
    if (!running) return;
    const now = Date.now();
    const a = anchorRef.current;
    const remaining = Math.max(0, a.gameClock - ((now - a.atMs) / 1000) * a.timeScale);
    anchorRef.current = { atMs: now, gameClock: remaining, timeScale };
    setClock(Math.max(0, Math.ceil(remaining)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeScale]);

  // Screen lock / app switch suspends timers; on return, snap the clock forward to
  // real elapsed time (and fire the end path if the quarter expired while hidden).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (!running) return;
      recomputeClock();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [running, recomputeClock]);

  useEffect(() => {
    if (clock === 0) return;
    if (clock <= 60 && clock > 55 && warn !== "1MIN") { setWarn("1MIN"); snd.beep(880,0.4,"square",0.2); setTimeout(()=>setWarn(null),2200); }
    if (clock <= 10 && warn !== "FINAL") setWarn("FINAL");
    if (clock <= 10 && clock > 0) snd.beep(1200,0.12,"square",0.18);
  }, [clock]);

  const urgency = clock <= 10 ? 3 : clock <= 60 ? 2 : clock <= 600 ? 1 : 0;

  // build the end-of-quarter NBA-style report by diffing against snapshot
  const buildReport = () => {
    const snap = qStartRef.current;
    const diff = {};
    let atts = 0, makes = 0;
    ["knock","pitch","price","close"].forEach((k) => {
      const a = tally[k].a - snap.tally[k].a;
      const m = tally[k].m - snap.tally[k].m;
      diff[k] = { a, m };
      atts += a; makes += m;
    });
    diff.names = tally.names - snap.tally.names;
    if (diff.close.m > 0) qWonRef.current += 1;
    const qScore = score - snap.score;
    const qCups = cups - snap.cups;
    const acc = atts ? Math.round((makes / atts) * 100) : 0;
    setReport({ quarter, diff, qScore, qCups, atts, makes, acc, totalScore: score });
    // Hand the quarter to the coaching break: a sale won the quarter; barely
    // working = the court saw you hiding (slump); otherwise you fought (rough).
    const qCloses = diff.close.m;
    const read = qCloses > 0 ? "won" : atts < 6 ? "slump" : "rough";
    setBreakInfo({ quarter, read, isFinal: quarter >= 4, statLine: { score: qScore, doors: diff.knock.a, sales: qCloses } });
  };
  // Keep the recompute helper pointed at a fresh buildReport (the interval is stable).
  buildReportRef.current = buildReport;

  const advanceQuarter = () => {
    // snapshot current totals as the new quarter's baseline
    qStartRef.current = { tally: JSON.parse(JSON.stringify(tally)), score, cups };
    setReport(null);
    setBreakInfo(null);
    if (quarter >= 4) {
      // ---- assemble the full end-of-game stat line ----
      let atts = 0, makes = 0;
      ["knock","pitch","price","close"].forEach((k) => { atts += tally[k].a; makes += tally[k].m; });
      const acc = atts ? Math.round((makes / atts) * 100) : 0;
      // opponent = the "market" — a par score to beat, scaled to your volume
      const oppScore = Math.round(atts * 9 + 40 + (100 - acc) * 1.5);
      const won = score >= oppScore;
      // ---- update personal records ----
      const newRecords = {
        knock: Math.max(records.knock || 0, tally.knock.a),
        close: Math.max(records.close || 0, tally.close.m),
        names: Math.max(records.names || 0, tally.names),
        score: Math.max(records.score || 0, score),
      };
      const beat = {
        knock: tally.knock.a > (records.knock || 0),
        close: tally.close.m > (records.close || 0),
        names: tally.names > (records.names || 0),
        score: score > (records.score || 0),
      };
      try { localStorage.setItem("hoops_records", JSON.stringify(newRecords)); } catch (e) {}
      try { if (publishLine) publishLine({ points: score, doors: tally.knock.a, sales: tally.close.m, quarter, over: true, seq: lastShotRef.current.seq, made: false }); } catch (e) {}
      onEnd({
        score, oppScore, won, acc, atts, makes, cups, bottles,
        tally: JSON.parse(JSON.stringify(tally)),
        quarters: quarterScoresRef.current.slice(),
        players, records: newRecords, beat, qWon: qWonRef.current,
      });
      return;
    }
    // record this quarter's score for the box score
    quarterScoresRef.current.push(score - (quarterScoresRef.current.reduce((s,v)=>s+v,0)));
    // anchor the new quarter's clock to now (carry the live speed)
    anchorRef.current = { atMs: Date.now(), gameClock: QSEC, timeScale };
    lastDrainElapsedRef.current = 0; quarterEndedRef.current = false;
    setQuarter((q) => q + 1); setClock(QSEC); setRunning(true); setWarn(null);
    lastHourRef.current = 0; sipsThisHourRef.current = 0; setDryHourWarn(false);
  };
  const spawnFloatie = (text, color) => { const id = ++idRef.current; setFloaties((f) => [...f, { id, text, color }]); setTimeout(() => setFloaties((f) => f.filter((x) => x.id !== id)), 1500); };
  const spawnOppFloatie = (text, color) => { const id = ++idRef.current; setOppFloaties((f) => [...f, { id, text, color }]); setTimeout(() => setOppFloaties((f) => f.filter((x) => x.id !== id)), 1500); };
  // Reconstruct the opponent's throw from their published line (kind/made). Visual
  // mirror only — their score already rides in via opponent.points on the pill.
  const playOppShot = (kind, made) => {
    // Windup, then a ball that arcs from the opponent's side (~64%) to the central
    // rim. A dunk is shown as a GOLD ball to the rim (not a leap), so the rival is
    // never seen slamming empty air beside the hoop.
    const isDunk = kind === "dunk";
    setOppShoot(true);
    setTimeout(() => {
      setOppShoot(false);
      const bid = ++idRef.current;
      setOppBall({ id: bid, color: isDunk ? GOLD : (made ? GREEN : "#8b7ba8"), made: isDunk ? true : made, kind, second: true });
      setTimeout(() => setOppBall((b) => (b && b.id === bid ? null : b)), 1160);
    }, 240);
  };

  // ---- DOPAMINE: big centered reward callout + confetti burst + edge pulse ----
  const popReward = (text, color, big) => {
    const id = ++idRef.current;
    setReward({ id, text, color, big });
    setTimeout(() => setReward((r) => (r && r.id === id ? null : r)), big ? 1400 : 1000);
  };
  const burstConfetti = (color, big) => {
    const n = big ? 26 : 14;
    const parts = [];
    for (let i = 0; i < n; i++) {
      const ang = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const dist = (big ? 120 : 80) + Math.random() * 60;
      parts.push({
        id: ++idRef.current,
        dx: Math.cos(ang) * dist,
        dy: Math.sin(ang) * dist - 40,
        color: [color, GOLD, V_GLOW, WATER, "#ec4899"][i % 5],
        rot: Math.random() * 360,
        size: 5 + Math.random() * 6,
      });
    }
    setConfetti((c) => [...c, ...parts]);
    setTimeout(() => setConfetti((c) => c.filter((p) => !parts.find((x) => x.id === p.id))), 1200);
    setEdgePulse((e) => e + 1);
  };

  const takeShot = (a) => {
    if (!running || busyRef.current) return;
    const kind = a.id === "close" ? "dunk" : a.id === "pitch" ? "auto" : "shot";

    // ---- CLOSE = a real dunk: jump, grab the rim, hang ~2s, drop ----
    if (kind === "dunk") {
      busyRef.current = true;
      const willMake = Math.random() < a.make;   // close is 1.00 → always makes
      snd.ball();
      setDunkPhase("jump");                       // crouch → explode upward
      setTimeout(() => {
        // reached the rim: ball goes through, player grabs rim
        setDunkPhase("hang");
        setRimShake(true); setTimeout(() => setRimShake(false), 500);
        resolveShot(a, willMake, "dunk");         // score + confetti + reward
        // hang on the rim for ~2 seconds
        setTimeout(() => {
          setDunkPhase("drop");                   // let go, drop back down
          setTimeout(() => { setDunkPhase(null); busyRef.current = false; }, 450);
        }, 2000);
      }, 520);
      return;
    }

    // ---- normal shot ----
    busyRef.current = true; setShooting(true); snd.ball();
    const willMake = Math.random() < a.make;
    setTimeout(() => {
      setShooting(false);
      const bid = ++idRef.current;
      setBall({ id: bid, color: a.color, made: willMake, kind });
      const travel = 880;
      setTimeout(() => resolveShot(a, willMake, kind), travel - 60);
      setTimeout(() => { setBall(null); busyRef.current = false; }, travel + 280);
    }, 240);
  };

  const resolveShot = (a, willMake, kind) => {
    let madeGain = 0;
    attemptsRef.current += 1;
    // record attempt + make into the running tally
    setTally((t) => ({ ...t, [a.id]: { a: t[a.id].a + 1, m: t[a.id].m + (willMake ? 1 : 0) } }));
    if (willMake) {
      madeRef.current += 1;
      setNetSwish((n) => n + 1); setFlash((f) => f + 1);
      if (kind === "dunk") { snd.dunkSlam(); }
      else { snd.swish(true); snd.roar(0.34); if (a.id === "price") snd.react(); if ((a.id === "pitch" || a.id === "price") && Math.random() < 0.2) snd.coach("goodPitch"); }
      let mult = 1; if (hotZone) mult *= 2; if (inZone) mult *= 1.15; mult *= quarterBonus;
      const gain = Math.round(a.pts * mult);
      madeGain = gain;
      setScore((s) => s + gain);
      // ---- DOPAMINE STACK ----
      burstConfetti(a.color, kind === "dunk");
      spawnFloatie(`+${gain}`, a.color);
      let newStreak = 0;
      setStreak((st) => {
        const ns = st + 1; newStreak = ns;
        const tier = STREAK_TIERS.find((t) => t.at === ns);
        if (tier) { spawnFloatie(tier.name, V_GLOW); if (ns >= 5) snd.hype(); else { snd.chord(); snd.roar(0.5); } }
        return ns;
      });
      // big reward on close/dunk or hot streaks; otherwise rotating law-of-probability praise
      if (kind === "dunk") {
        popReward(BIG_REWARD_LINES[Math.floor(Math.random()*BIG_REWARD_LINES.length)], GOLD, true);
        setTimeout(() => spawnFloatie("SLAM DUNK!", GOLD), 120);
      } else if (newStreak >= 5 && newStreak % 3 === 0) {
        popReward(BIG_REWARD_LINES[Math.floor(Math.random()*BIG_REWARD_LINES.length)], FIRE, true);
      } else {
        popReward(REWARD_LINES[Math.floor(Math.random()*REWARD_LINES.length)], a.color, false);
      }
      // combo multiplier readout when hot
      if (hotZone) spawnFloatie(`×${(mult).toFixed(2)} COMBO`, FIRE);
      // ~12% chance a made shot drops a found bottle (spare water to refill with)
      if (Math.random() < 0.12) {
        setBottles((b) => b + 1);
        setLifeGain((n) => n + 1);
        setTimeout(() => spawnFloatie("💧 WATER BOTTLE FOUND!", WATER), 260);
        snd.chord([523,784],0.2);
      }
    } else {
      setRimShake(true); setTimeout(() => setRimShake(false), 300); setStreak(0);
      snd.swish(false); if (Math.random() < 0.3) snd.coach("keepGoing"); spawnFloatie("MISS — the odds still favor you", "#8b7ba8");
    }
    setAccuracy(Math.round((madeRef.current / attemptsRef.current) * 100));
    // record this shot for the live feed to the opponent
    lastShotRef.current = { made: willMake, kind, gain: madeGain, seq: lastShotRef.current.seq + 1 };
    setPubTick((t) => t + 1);
  };

  const logName = () => {
    const nm = nameInput.trim() || "Anonymous";
    setNames((n) => [nm, ...n]);
    setTally((t) => ({ ...t, names: t.names + 1 }));
    const gain = Math.round(25 * quarterBonus * (inZone ? 1.15 : 1));
    setScore((s) => s + gain); setNetSwish((n) => n + 1); setFlash((f) => f + 1);
    spawnFloatie(`STILL WINNING +${gain}`, GOLD); snd.chord([587,784],0.22); snd.roar(0.35);
    setNameInput(""); setNameModal(false);
  };

  // SPOKE TO — a conversation happened but no name yet. A tracked, 0-point rung on
  // the funnel toward the name; no streak reset, no accuracy hit — there's no loss
  // column here.
  const takeSpoke = () => {
    if (!running) return;
    setTally((t) => ({ ...t, slam: { a: t.slam.a + 1, m: t.slam.m } }));
    spawnFloatie("SPOKE TO — GET THE NAME", SPOKE);
    snd.beep(430, 0.12, "sine", 0.12);
  };

  // GOT NAME is a one-tap point now — no typing required. Logs the "got the
  // name" rep instantly (counts toward NAMES, awards the same points).
  const takeName = () => {
    if (!running) return;
    setTally((t) => ({ ...t, names: t.names + 1 }));
    const gain = Math.round(25 * quarterBonus * (inZone ? 1.15 : 1));
    setScore((s) => s + gain); setNetSwish((n) => n + 1); setFlash((f) => f + 1);
    spawnFloatie(`GOT THE NAME +${gain}`, GOLD); snd.chord([587,784],0.22); snd.roar(0.35);
  };

  // DRINK — consume water from your bottle, gain energy. Needs water in the bottle.
  const sip = () => {
    if (water <= 0) {
      spawnFloatie("BOTTLE EMPTY — HIT REFILL", FIRE);
      snd.beep(150, 0.18, "square", 0.12);
      return;
    }
    setWater((w) => Math.max(0, w - DRINK_WATER));       // bottle goes down
    setEnergy((e) => Math.min(100, e + DRINK_ENERGY));   // energy goes up
    sipsRef.current += 1;
    sipsThisHourRef.current += 1;   // hydrated this hour → clears dry warning
    setDryHourWarn(false);
    snd.gulp();
    if (sipsRef.current >= SIPS_PER_CUP) {
      sipsRef.current = 0;
      setCups((c) => c + 1);
      spawnFloatie("💧 +1 CUP TODAY · +ENERGY", WATER);
    } else {
      spawnFloatie("💧 +ENERGY", WATER);
    }
  };

  // REFILL — fill your bottle back up using a spare you collected door-to-door.
  const newBottle = () => {
    if (water >= 96) { spawnFloatie("BOTTLE ALREADY FULL", WATER); return; }
    if (bottles <= 0) { spawnFloatie("NO WATER TO REFILL — FIND MORE ON THE DOORS!", FIRE); snd.beep(150,0.2,"square",0.14); return; }
    setBottles((b) => b - 1);
    setWater(100);                 // bottle refilled — NOT energy
    sipsThisHourRef.current += 1;
    setDryHourWarn(false);
    setRefillFlash((f) => f + 1);
    burstConfetti(WATER, true);
    spawnFloatie("💧 BOTTLE REFILLED — STAY HYDRATED", WATER);
    snd.cupPour();
  };
  // occasionally reward a found bottle on a made shot (handled in resolveShot)

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: `radial-gradient(ellipse at 50% 18%,#2a1850 0%,${BG} 58%)` }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", transition: "box-shadow .5s", boxShadow: urgency >= 2 ? `inset 0 0 160px 34px rgba(251,60,80,${urgency===3?0.5:0.28})` : urgency === 1 ? "inset 0 0 120px 18px rgba(251,113,133,0.13)" : "none" }} />
      {urgency === 3 && <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>{[...Array(5)].map((_, i) => <div key={i} style={{ position: "absolute", top: `${14+i*17}%`, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,transparent,${FIRE},transparent)`, animation: `speedline ${0.5+i*0.1}s infinite` }} />)}</div>}
      <Ambience />

      {/* compact utility cluster — pinned upper-right below the jumbotron (no pause: the clock never stops once tip-off happens) */}
      <div style={{ position: "absolute", top: 210, right: 10, zIndex: 50, display: "flex", flexDirection: "column", gap: 5 }}>
        <button onClick={() => setStatsOpen(true)} style={{ ...ctrlBtn, padding: "5px 8px", fontSize: 10, minWidth: 40, background: "rgba(8,5,16,0.85)", backdropFilter: "blur(3px)" }}>STATS</button>
        <button onClick={() => setHanded((h) => h === "right" ? "left" : "right")} style={{ ...ctrlBtn, padding: "5px 8px", fontSize: 10, minWidth: 40, background: "rgba(8,5,16,0.85)", backdropFilter: "blur(3px)" }} title="Swap control side">{handed === "right" ? "✋R" : "L✋"}</button>
      </div>

      <Jumbotron score={score} clock={clock} quarter={quarter} streak={streak} streakTier={streakTier} accuracy={accuracy} hotZone={hotZone} quarterBonus={quarterBonus} urgency={urgency} windows={windows} multiplayer={!!match} opponent={opponent} oppFx={oppFx} meName={meName} />

      <div style={{ position: "absolute", top: 200, left: 0, right: 0, bottom: 72, overflow: "hidden" }}>
        <Crowd flash={flash} />
        <Court />
        <HoopAssembly netSwish={netSwish} rimShake={rimShake} />
        <Shooter big shooting={shooting} fatigued={thirsty} inZone={inZone} dunk={dunk} dunkPhase={dunkPhase} />
        {players === 2 && <Shooter big second shooting={oppShoot} />}
        {ball && <Ball ball={ball} />}
        {oppBall && <Ball ball={oppBall} />}
        {/* confetti burst from center court */}
        {confetti.map((p) => (
          <div key={p.id} style={{ position: "absolute", left: "50%", top: "44%", width: p.size, height: p.size, background: p.color, borderRadius: 2, zIndex: 14, pointerEvents: "none",
            animation: "confettiFly 1.1s ease-out forwards",
            "--tx": `${p.dx}px`, "--ty": `${p.dy}px`,
            boxShadow: `0 0 6px ${p.color}` }} />
        ))}
        {/* BIG reward callout, centered — brand colors, clean + high-contrast */}
        {reward && (
          <div key={reward.id} style={{ position: "absolute", left: "50%", top: "44%", zIndex: 200, pointerEvents: "none", textAlign: "center",
            animation: `rewardPop ${reward.big ? 1.4 : 1}s ease-out forwards` }}>
            <div style={{ display: "inline-block", padding: "9px 20px", borderRadius: 14, position: "relative",
              background: "linear-gradient(180deg, rgba(20,11,36,0.96), rgba(8,5,16,0.96))",
              border: "2px solid transparent",
              backgroundImage: "linear-gradient(180deg, rgba(20,11,36,0.96), rgba(8,5,16,0.96)), linear-gradient(90deg, #38bdf8, #a855f7, #ec4899)",
              backgroundOrigin: "border-box", backgroundClip: "padding-box, border-box",
              boxShadow: `0 0 22px ${V}66, 0 6px 20px rgba(0,0,0,0.7)` }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontWeight: 900,
                fontSize: reward.big ? "clamp(24px,7.5vw,46px)" : "clamp(17px,4.8vw,28px)",
                color: "#fff", letterSpacing: "1px", whiteSpace: "nowrap",
                WebkitTextStroke: "1px rgba(10,7,20,0.8)", paintOrder: "stroke fill",
                textShadow: `0 0 10px ${reward.color || V}, 0 0 20px ${reward.color || V}, 2px 2px 3px rgba(0,0,0,0.9)` }}>
                {reward.text}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* reward pops — rendered at the Arena root (above the jumbotron z20 + backboard z4,
          and outside the play-area's overflow clip) so button feedback is never hidden */}
      {floaties.map((f) => (
        <div key={f.id} style={{ position: "absolute", left: "50%", top: 204, fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: 24, color: f.color, textShadow: `0 0 16px ${f.color}`, animation: "riseFade 1.5s forwards", pointerEvents: "none", whiteSpace: "nowrap", zIndex: 210 }}>{f.text}</div>
      ))}
      {/* opponent's floating "+N" — anchored to their side (their shooter sits at ~64%)
          and tinted pink so there's no confusion about whose points are whose */}
      {oppFloaties.map((f) => (
        <div key={f.id} style={{ position: "absolute", left: "70%", top: 210, fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: 19, color: f.color, textShadow: `0 0 14px ${f.color}`, animation: "riseFade 1.5s forwards", pointerEvents: "none", whiteSpace: "nowrap", zIndex: 210 }}>{f.text}</div>
      ))}

      {/* screen-edge reward glow pulse */}
      {edgePulse > 0 && (
        <div key={edgePulse} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 12, boxShadow: `inset 0 0 90px 10px ${V}55`, animation: "edgePulse 0.7s ease-out forwards" }} />
      )}

      {/* ===== +1 bottle celebration when you find water ===== */}
      {lifeGain > 0 && (
        <div key={lifeGain} style={{ position: "absolute", left: "50%", top: "42%", zIndex: 88, pointerEvents: "none", textAlign: "center", animation: "lifePop 1.5s ease-out forwards" }}>
          <div className="seg" style={{ fontWeight: 900, fontSize: "clamp(44px,13vw,88px)", color: WATER, textShadow: `0 0 30px ${WATER}, 0 0 8px #fff`, lineHeight: 1 }}>+1</div>
          <div style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: "clamp(16px,5vw,26px)", letterSpacing: "4px", color: "#e6f8ff", textShadow: `0 0 18px ${WATER}` }}>WATER BOTTLE</div>
          <div style={{ fontSize: 12, color: "#7fb8cc", letterSpacing: "2px", fontWeight: 700, marginTop: 4 }}>REFILL WHEN YOU RUN LOW</div>
        </div>
      )}

      {/* ===== dry-hour hydration warning ===== */}
      {dryHourWarn && (
        <div style={{ position: "absolute", bottom: 58, left: 12, right: 12, zIndex: 35, textAlign: "center", pointerEvents: "none" }}>
          <div style={{ display: "inline-block", padding: "7px 16px", borderRadius: 24, background: "rgba(56,189,248,0.14)", border: `1.5px solid ${WATER}`, color: WATER, fontWeight: 700, fontSize: 12, letterSpacing: "1px", boxShadow: `0 0 16px ${WATER}66`, animation: "flare 1s infinite" }}>
            💧 NO WATER THIS HOUR — FILL YOUR BOTTLE & DRINK
          </div>
        </div>
      )}

      {/* ===== ENERGY / BOTTLE METERS + big bottle (buttons live in the column) ===== */}
      <div style={{ position: "absolute", bottom: 14, [handed === "left" ? "left" : "right"]: 118, [handed === "left" ? "right" : "left"]: 10, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
          <div style={{ flex: 1, maxWidth: 340 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, letterSpacing: "1px", color: thirsty ? FIRE : "#9d8bc0", marginBottom: 2, fontWeight: 700 }}>
              <span>ENERGY{inZone && <span style={{ color: GOLD }}> · ZONE ×1.15</span>}{thirsty && <span style={{ color: FIRE }}> · DRINK WATER!</span>}</span>
              <span>{Math.round(energy)}%</span>
            </div>
            <div style={{ height: 9, borderRadius: 5, background: "rgba(255,255,255,0.06)", overflow: "hidden", border: `1px solid ${thirsty ? FIRE : "rgba(56,189,248,0.4)"}` }}>
              <div style={{ height: "100%", width: `${energy}%`, borderRadius: 5, transition: "width .3s", background: thirsty ? "#ef4444" : `linear-gradient(90deg,${WATER},${inZone ? GOLD : V_GLOW})`, boxShadow: inZone ? `0 0 10px ${GOLD}` : `0 0 6px ${WATER}` }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, letterSpacing: "1px", color: "#7c8db5", marginTop: 5, marginBottom: 2, fontWeight: 700 }}>
              <span>BOTTLE {water <= 0 && <span style={{ color: FIRE }}>· EMPTY!</span>}</span>
              <span>💧 {cups} cups · 🧴 {bottles}</span>
            </div>
            <div style={{ height: 6, borderRadius: 4, background: "rgba(255,255,255,0.06)", overflow: "hidden", border: "1px solid rgba(56,189,248,0.3)" }}>
              <div style={{ height: "100%", width: `${water}%`, borderRadius: 4, transition: "width .3s", background: `linear-gradient(90deg,#0ea5e9,#7dd3fc)`, boxShadow: `0 0 6px ${WATER}` }} />
            </div>
          </div>
          <button onClick={sip} title="Drink water — refill energy" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0, animation: "none" }}>
            <WaterBottle key={refillFlash} fill={water} thirsty={water < 20} scale={1.08} />
          </button>
        </div>
      </div>

      {/* ===== LIVE STAT LINE — real-time counters + records to chase ===== */}
      <div style={{ position: "absolute", bottom: 190, [handed === "left" ? "right" : "left"]: 8, zIndex: 30, width: 144, boxSizing: "border-box",
        transform: "scale(0.99)", transformOrigin: handed === "left" ? "bottom right" : "bottom left",
        background: "rgba(8,5,16,0.94)", border: "1.5px solid rgba(168,85,247,0.45)", borderRadius: 11, padding: "6px 9px",
        backdropFilter: "blur(4px)", boxShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 7.5, letterSpacing: "1.5px", color: V_GLOW, textAlign: "center", marginBottom: 4, borderBottom: "1px solid rgba(168,85,247,0.25)", paddingBottom: 3 }}>YOUR NUMBERS</div>
        {[
          { lbl: "KNOCKED",  val: tally.knock.a,  rec: records.knock, c: V },
          { lbl: "PITCHED",  val: tally.pitch.a,  rec: null,          c: "#38bdf8" },
          { lbl: "INTERESTED", val: tally.price.a, rec: null,         c: "#22d3ee" },
          { lbl: "SALES",    val: tally.close.m,  rec: records.close, c: GREEN },
          { lbl: "NAMES",    val: tally.names,    rec: records.names, c: GOLD },
        ].map((s) => (
          <div key={s.lbl} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4, marginBottom: 2 }}>
            <span style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 600, fontSize: 7, letterSpacing: "0.2px", color: "#9d8bc0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.lbl}</span>
            <span style={{ display: "flex", alignItems: "baseline", gap: 2, flexShrink: 0 }}>
              <span className="seg" style={{ fontWeight: 900, fontSize: 12, color: s.c, lineHeight: 1 }}>{s.val}</span>
              {s.rec != null && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 6, color: s.val > s.rec ? GOLD : "#6b5b88", fontWeight: 700, minWidth: 16, textAlign: "left" }}>{s.val > s.rec ? "★PR" : `/${s.rec}`}</span>}
            </span>
          </div>
        ))}
      </div>

      {/* ===== ACTION COLUMN — floating vertical stack overlaid on the side ===== */}
      <div style={{ position: "absolute", bottom: 20, [handed === "left" ? "left" : "right"]: 8, zIndex: 30, display: "flex", flexDirection: "column", gap: 5, width: 100 }}>
        {[{ id: "slam", short: "SPOKE TO", sub: "NO NAME", pts: 0, color: SPOKE, make: 0 }, { id: "name", short: "GOT NAME", sub: "SPOKE TO", pts: 25, color: GOLD }, ...ACTIONS].map((a) => {
          const isName = a.id === "name";
          return (
            <button key={a.id} onClick={() => a.id === "slam" ? takeSpoke() : isName ? takeName() : takeShot(a)} disabled={!running} style={{
              width: "100%", padding: "7px 8px", borderRadius: 11, cursor: running ? "pointer" : "default",
              background: a.id === "close" ? `linear-gradient(160deg,rgba(6,40,20,0.92),${GREEN}22)` : isName ? "linear-gradient(160deg,rgba(40,30,10,0.92),rgba(168,85,247,0.14))" : "rgba(20,11,36,0.9)",
              border: `1.5px solid ${a.color}`, color: "#fff",
              opacity: running ? 1 : 0.5,
              boxShadow: a.id === "close" ? `0 0 12px ${GREEN}55, 0 2px 8px rgba(0,0,0,0.5)` : `0 2px 8px rgba(0,0,0,0.5)`,
              display: "flex", alignItems: "center", gap: 7, backdropFilter: "blur(3px)",
              flexDirection: handed === "left" ? "row" : "row-reverse", textAlign: handed === "left" ? "left" : "right",
            }}>
              <ActionIcon id={a.id} color={a.color} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: handed === "left" ? "flex-start" : "flex-end", gap: 1, lineHeight: 1 }}>
                <span style={{ fontWeight: 700, fontSize: 8, color: isName ? "#e7d9a8" : "#cbb8e8", letterSpacing: "0.3px" }}>{a.short}</span>
                {a.sub && <span style={{ fontWeight: 600, fontSize: 6, color: "#9d8bc0", letterSpacing: "0.2px" }}>({a.sub})</span>}
                <span className="seg" style={{ fontWeight: 900, color: a.color, fontSize: 15 }}>{a.id === "slam" ? "0" : `+${a.pts}`}</span>
              </div>
            </button>
          );
        })}
        {/* REFILL + DRINK live directly under CLOSE */}
        <button onClick={newBottle} disabled={bottles <= 0} style={{
          width: "100%", padding: "6px 8px", borderRadius: 11, cursor: bottles > 0 ? "pointer" : "default",
          background: bottles > 0 ? "linear-gradient(160deg,rgba(20,11,36,0.9),rgba(56,189,248,0.14))" : "rgba(20,11,36,0.6)",
          border: `1.5px solid ${bottles > 0 ? GOLD : "rgba(255,255,255,0.15)"}`, color: "#fff",
          opacity: bottles > 0 ? 1 : 0.55, boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", gap: 7, backdropFilter: "blur(3px)",
          flexDirection: handed === "left" ? "row" : "row-reverse", textAlign: handed === "left" ? "left" : "right",
        }}>
          <MiniBottle />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: handed === "left" ? "flex-start" : "flex-end", gap: 1, lineHeight: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 11, color: bottles > 0 ? "#fff7dc" : "#8b7ba8", letterSpacing: "0.5px", textShadow: bottles > 0 ? `0 0 8px ${GOLD}` : "none" }}>REFILL</span>
            <span style={{ fontWeight: 600, fontSize: 6, color: "#9d8bc0", letterSpacing: "0.2px" }}>FILL BOTTLE</span>
          </div>
        </button>
        <button onClick={sip} disabled={!running} style={{
          width: "100%", padding: "11px 8px", borderRadius: 11, cursor: "pointer",
          background: `linear-gradient(160deg,${WATER}30,${WATER}12)`, border: `2px solid ${WATER}`, color: "#e6f8ff",
          opacity: running ? 1 : 0.5, boxShadow: water <= 0 ? `0 0 14px ${WATER}` : `0 2px 8px rgba(0,0,0,0.5)`,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6, backdropFilter: "blur(3px)",
          animation: "none",
        }}>
          <span style={{ fontSize: 14 }}>💧</span>
          <span style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: "2px", textShadow: `0 0 8px ${WATER}` }}>DRINK</span>
        </button>
      </div>

      {/* ===== TIP-OFF WHISTLE COUNTDOWN ===== */}
      {countdown && (
        <div style={{ position: "absolute", inset: 0, zIndex: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(5,3,12,0.9)", pointerEvents: "none" }}>
          <div style={{ fontSize: 40, marginBottom: 4 }}>🌡️</div>
          <div style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "3px", color: WATER, marginBottom: 2 }}>IT'S HOT OUT THERE</div>
          <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 14, color: "#c9bce6", textAlign: "center", maxWidth: 300, marginBottom: 30, padding: "0 20px" }}>
            You're walking doors in the heat all day. Drink water to keep your energy up — aim for a cup every hour. A hydrated brain closes more.
          </div>
          <div key={countdown} className="seg" style={{ fontWeight: 900, fontSize: countdown === "TIP OFF!" ? "clamp(34px,11vw,64px)" : countdown === "READY" ? "clamp(72px,23.4vw,162px)" : "clamp(80px,26vw,180px)", color: "#fff",
            WebkitTextStroke: `2px ${V_DEEP}`, textShadow: `0 0 50px ${V}, 0 0 14px #fff`, animation: "stampIn 0.5s ease-out" }}>{countdown}</div>
          <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 11, letterSpacing: "3px", color: "#6b5b88", marginTop: 20 }}>▶ FOUR QUARTERS · BUZZER TO BUZZER</div>
        </div>
      )}

      {warn === "1MIN" && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, pointerEvents: "none" }}><div className="seg" style={{ fontWeight: 900, fontSize: "clamp(38px,12vw,80px)", color: FIRE, textShadow: `0 0 40px ${FIRE}`, animation: "bigWarn 2.2s forwards", letterSpacing: "3px" }}>ONE MINUTE</div></div>}
      {urgency === 3 && clock > 0 && <div className="seg" style={{ position: "absolute", top: "46%", left: "50%", transform: "translate(-50%,-50%)", fontWeight: 900, fontSize: "clamp(80px,28vw,200px)", color: "#fff", textShadow: `0 0 50px ${FIRE},0 0 90px ${V}`, zIndex: 55, pointerEvents: "none", animation: "flare 0.5s infinite" }}>{clock}</div>}

      {nameModal && (
        <div style={{ position: "absolute", inset: 0, zIndex: 80, background: "rgba(5,3,12,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 22 }}>
          <div style={{ width: "100%", maxWidth: 370, background: CARD, borderRadius: 16, padding: 20, border: `1.5px solid ${GOLD}` }}>
            <div className="seg" style={{ fontWeight: 900, color: GOLD, fontSize: 19, letterSpacing: "2px" }}>STILL WINNING</div>
            <p style={{ color: "#c9b876", fontSize: 13, lineHeight: 1.5, margin: "6px 0 14px" }}>They said no — but you got the name. That's a follow-up in the bank. Log it and stay on the board.</p>
            <input autoFocus value={nameInput} onChange={(e) => setNameInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && logName()} placeholder="Their name…" style={{ width: "100%", padding: 13, borderRadius: 10, background: "#0d0718", border: "1px solid rgba(168,85,247,0.4)", color: "#fff", fontSize: 16, marginBottom: 12, fontFamily: "'Rajdhani',sans-serif", WebkitUserSelect: "text", userSelect: "text" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setNameModal(false)} style={{ flex: 1, padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button onClick={logName} style={{ flex: 2, padding: 12, borderRadius: 10, background: `linear-gradient(90deg,${V_DEEP},${GOLD})`, border: "none", color: "#111", cursor: "pointer", fontWeight: 800, letterSpacing: "1px" }}>LOG THE NAME +25</button>
            </div>
            {names.length > 0 && <div style={{ marginTop: 12, fontSize: 12, color: "#8b7ba8" }}>Name vault ({names.length}): {names.slice(0,6).join(", ")}{names.length>6?"…":""}</div>}
          </div>
        </div>
      )}

      {statsOpen && <LiveStats tally={tally} cups={cups} accuracy={accuracy} score={score} onClose={() => setStatsOpen(false)} />}
      {breakInfo && (
        <CoachingBreak
          quarter={breakInfo.quarter}
          read={breakInfo.read}
          statLine={breakInfo.statLine}
          isFinal={breakInfo.isFinal}
          settings={snd.settings()}
          onDone={() => { setBreakInfo(null); advanceQuarter(); }}
        />
      )}
    </div>
  );
}

// ============================================================
// LIVE STATS — tap STATS anytime for the running box score
// ============================================================
const STAT_ROWS = [
  { id: "knock", label: "Doors Knocked", color: V },
  { id: "pitch", label: "Full Pitches",  color: "#38bdf8" },
  { id: "price", label: "Price Drops",   color: "#22d3ee" },
  { id: "close", label: "Closes / Sales",color: GREEN },
];
function BoxScore({ tally, cups, accuracy }) {
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "6px 12px", alignItems: "center", fontSize: 13 }}>
        <div style={{ fontSize: 9, letterSpacing: "1px", color: "#6b5b88", fontWeight: 700 }}>ACTION</div>
        <div style={{ fontSize: 9, letterSpacing: "1px", color: "#6b5b88", fontWeight: 700, textAlign: "right" }}>MADE / ATT</div>
        <div style={{ fontSize: 9, letterSpacing: "1px", color: "#6b5b88", fontWeight: 700, textAlign: "right" }}>%</div>
        {STAT_ROWS.map((r) => {
          const t = tally[r.id]; const pct = t.a ? Math.round((t.m / t.a) * 100) : 0;
          return (
            <React.Fragment key={r.id}>
              <div style={{ fontWeight: 700, color: r.color }}>{r.label}</div>
              <div className="seg" style={{ textAlign: "right", fontWeight: 900 }}>{t.m}<span style={{ color: "#6b5b88" }}>/{t.a}</span></div>
              <div className="seg" style={{ textAlign: "right", color: r.color }}>{pct}%</div>
            </React.Fragment>
          );
        })}
        <div style={{ fontWeight: 700, color: "#fff", borderTop: "1px solid rgba(168,85,247,0.25)", paddingTop: 6 }}>Names Collected</div>
        <div className="seg" style={{ textAlign: "right", fontWeight: 900, borderTop: "1px solid rgba(168,85,247,0.25)", paddingTop: 6 }}>{tally.names}</div>
        <div style={{ borderTop: "1px solid rgba(168,85,247,0.25)" }} />
        <div style={{ fontWeight: 700, color: WATER }}>💧 Cups of Water</div>
        <div className="seg" style={{ textAlign: "right", fontWeight: 900, color: WATER }}>{cups}</div>
        <div />
      </div>
    </div>
  );
}
function LiveStats({ tally, cups, accuracy, score, onClose }) {
  const totalAtt = STAT_ROWS.reduce((s, r) => s + tally[r.id].a, 0);
  const totalMade = STAT_ROWS.reduce((s, r) => s + tally[r.id].m, 0);
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 85, background: "rgba(5,3,12,0.88)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400, background: "linear-gradient(180deg,#160c2a,#0b0718)", borderRadius: 18, padding: 20, border: `1.5px solid ${V_DEEP}`, boxShadow: `0 0 34px rgba(124,58,247,0.4)` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div className="seg" style={{ fontWeight: 900, fontSize: 18, letterSpacing: "2px" }}>LIVE STATS</div>
          <button onClick={onClose} style={{ ...ctrlBtn, minWidth: 32 }}>✕</button>
        </div>
        <div style={{ display: "flex", gap: 8, margin: "8px 0 14px" }}>
          <MiniStat label="SCORE" value={score.toLocaleString()} color="#fff" />
          <MiniStat label="TOTAL" value={`${totalMade}/${totalAtt}`} color={V_GLOW} />
          <MiniStat label="ACCURACY" value={`${accuracy}%`} color={GOLD} />
        </div>
        <BoxScore tally={tally} cups={cups} accuracy={accuracy} />
        <button onClick={onClose} style={{ marginTop: 16, width: "100%", padding: 12, borderRadius: 10, background: `linear-gradient(90deg,${V_DEEP},${V})`, border: "none", color: "#fff", fontWeight: 700, letterSpacing: "2px", cursor: "pointer", fontFamily: "'Oswald',sans-serif" }}>BACK TO GAME</button>
      </div>
    </div>
  );
}
function MiniStat({ label, value, color }) {
  return (
    <div style={{ flex: 1, background: "#0a0518", borderRadius: 10, padding: "8px 4px", textAlign: "center", border: "1px solid rgba(168,85,247,0.2)" }}>
      <div style={{ fontSize: 8, letterSpacing: "1px", color: "#6b5b88", fontWeight: 700 }}>{label}</div>
      <div className="seg" style={{ fontSize: 18, fontWeight: 900, color }}>{value}</div>
    </div>
  );
}

// ============================================================
// QUARTER REPORT — NBA-style end-of-quarter breakdown
// ============================================================
function QuarterReport({ report, onNext }) {
  const { quarter, diff, qScore, qCups, atts, makes, acc, totalScore } = report;
  const medal = acc >= 80 ? { t: "GOLD QUARTER", c: GOLD } : acc >= 60 ? { t: "SILVER QUARTER", c: "#cbd5e1" } : acc >= 40 ? { t: "BRONZE QUARTER", c: "#d19a66" } : { t: "KEEP GRINDING", c: V_GLOW };
  const rows = [
    { id: "knock", label: "Doors Knocked", color: V },
    { id: "pitch", label: "Full Pitches",  color: "#38bdf8" },
    { id: "price", label: "Price Drops",   color: "#22d3ee" },
    { id: "close", label: "Closes / Sales",color: GREEN },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 90, background: "rgba(4,2,10,0.94)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }} className="noscroll">
      <div style={{ width: "100%", maxWidth: 420, background: "linear-gradient(180deg,#1a1030,#0b0718)", borderRadius: 20, padding: "20px 18px", border: `2px solid ${V_DEEP}`, boxShadow: `0 0 40px rgba(124,58,247,0.5)` }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span className="seg" style={{ background: V_GLOW, color: "#050310", fontWeight: 900, fontSize: 15, padding: "3px 9px", borderRadius: 6 }}>Q{quarter}</span>
          <div>
            <div className="seg" style={{ fontWeight: 900, fontSize: 20, letterSpacing: "1px", lineHeight: 1 }}>QUARTER REPORT</div>
            <div style={{ fontSize: 10, color: "#8b7ba8", letterSpacing: "2px", fontWeight: 700 }}>BUILDING MOMENTUM · WINNING QUARTERS</div>
          </div>
        </div>
        {/* headline stats */}
        <div style={{ display: "flex", gap: 8, margin: "14px 0" }}>
          <MiniStat label="QUARTER PTS" value={qScore.toLocaleString()} color="#fff" />
          <MiniStat label="MADE / ATT" value={`${makes}/${atts}`} color={V_GLOW} />
          <MiniStat label="ACCURACY" value={`${acc}%`} color={medal.c} />
        </div>
        {/* medal */}
        <div style={{ textAlign: "center", margin: "6px 0 14px" }}>
          <span className="seg" style={{ fontWeight: 900, fontSize: 16, letterSpacing: "2px", color: medal.c, textShadow: `0 0 14px ${medal.c}88` }}>🏆 {medal.t}</span>
        </div>
        {/* breakdown table */}
        <div style={{ background: "#0a0518", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(168,85,247,0.2)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "7px 12px", alignItems: "center", fontSize: 13 }}>
            <div style={{ fontSize: 9, letterSpacing: "1px", color: "#6b5b88", fontWeight: 700 }}>THIS QUARTER</div>
            <div style={{ fontSize: 9, letterSpacing: "1px", color: "#6b5b88", fontWeight: 700, textAlign: "right" }}>MADE / ATT</div>
            <div style={{ fontSize: 9, letterSpacing: "1px", color: "#6b5b88", fontWeight: 700, textAlign: "right" }}>%</div>
            {rows.map((r) => {
              const d = diff[r.id]; const pct = d.a ? Math.round((d.m / d.a) * 100) : 0;
              return (
                <React.Fragment key={r.id}>
                  <div style={{ fontWeight: 700, color: r.color }}>{r.label}</div>
                  <div className="seg" style={{ textAlign: "right", fontWeight: 900 }}>{d.m}<span style={{ color: "#6b5b88" }}>/{d.a}</span></div>
                  <div className="seg" style={{ textAlign: "right", color: r.color }}>{pct}%</div>
                </React.Fragment>
              );
            })}
            <div style={{ fontWeight: 700, color: "#fff", borderTop: "1px solid rgba(168,85,247,0.25)", paddingTop: 7 }}>Names Collected</div>
            <div className="seg" style={{ textAlign: "right", fontWeight: 900, borderTop: "1px solid rgba(168,85,247,0.25)", paddingTop: 7 }}>{diff.names}</div>
            <div style={{ borderTop: "1px solid rgba(168,85,247,0.25)" }} />
            <div style={{ fontWeight: 700, color: WATER }}>💧 Cups of Water</div>
            <div className="seg" style={{ textAlign: "right", fontWeight: 900, color: WATER }}>{qCups}</div>
            <div />
          </div>
        </div>
        {/* looking ahead */}
        <div style={{ margin: "14px 0 4px", textAlign: "center", color: V_GLOW, fontSize: 12, letterSpacing: "1px", fontWeight: 700 }}>
          {quarter >= 4 ? "FINAL BUZZER — WIN THE CHAMPIONSHIP." : "STAY LOCKED IN. WIN THE MOMENT. NEXT QUARTER →"}
        </div>
        <button onClick={onNext} style={{ marginTop: 10, width: "100%", padding: 14, borderRadius: 12, background: `linear-gradient(90deg,${V_DEEP},${V})`, border: "none", color: "#fff", fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 17, letterSpacing: "2px", cursor: "pointer", boxShadow: "0 0 20px rgba(168,85,247,0.5)" }}>
          {quarter >= 4 ? "SEE FINAL" : `START Q${quarter + 1} ▶`}
        </button>
      </div>
    </div>
  );
}

const ctrlBtn = { padding: "7px 11px", borderRadius: 10, background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.4)", color: "#fff", cursor: "pointer", fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: 12, minWidth: 40 };

// ===== JUMBOTRON TICKER — rotating "commercials": sales-science stats + hype =====
const TICKER_ADS = [
  { tag: "THE LAW",     big: "1 IN 50",  l1: "Every 50 doors",        l2: "= a lead. Keep going.",   c: "#38bdf8" },
  { tag: "PERSISTENCE", big: "80%",      l1: "of sales need",          l2: "5+ follow-ups.",          c: "#a855f7" },
  { tag: "THE MATH",    big: "NO ×4",    l1: "Buyers say no 4×",       l2: "before they say yes.",    c: "#ec4899" },
  { tag: "MINDSET",     big: "+57%",     l1: "Optimists outsell",      l2: "pessimists. Same skill.", c: "#facc15" },
  { tag: "VOLUME",      big: "20/HR",    l1: "A pro knocks 20",        l2: "doors an hour.",          c: "#38bdf8" },
  { tag: "TIMING",      big: "4–7 PM",   l1: "Prime knock window.",    l2: "People are home.",        c: "#22d3ee" },
  { tag: "THE 80/20",   big: "20%",      l1: "of reps make 80%",       l2: "of sales. Be them.",      c: "#a855f7" },
  { tag: "TRUST",       big: "84%",      l1: "buy from someone",       l2: "they know & trust.",      c: "#ec4899" },
  { tag: "TALK LESS",   big: "69%",      l1: "of buyers just",         l2: "want you to listen.",     c: "#38bdf8" },
  { tag: "GRIND",       big: "3 PASSES", l1: "AM, noon, PM catches",   l2: "90% of a street.",        c: "#facc15" },
  { tag: "THE NAME",    big: "REMEMBER", l1: "A neighbor's name",      l2: "beats 1,000 calls.",      c: "#22d3ee" },
  { tag: "STAY HOT",    big: "HYDRATE",  l1: "A hydrated brain",       l2: "closes more.",            c: "#38bdf8" },
];
function JumbotronTicker({ side = "left" }) {
  const [i, setI] = useState(side === "left" ? 0 : 6);   // stagger the two sides
  useEffect(() => { const t = setInterval(() => setI((n) => (n + 1) % TICKER_ADS.length), 4200); return () => clearInterval(t); }, []);
  const ad = TICKER_ADS[i];
  return (
    <div style={{ flex: 1, minWidth: 0, height: 72, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div key={i} style={{ animation: "tickerIn 0.55s cubic-bezier(.2,.9,.3,1)", width: "100%", padding: "0 2px", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <div style={{ fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 8, letterSpacing: "1.5px", color: "#7c6b96", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ad.tag}</div>
        <div className="seg" style={{ fontWeight: 900, fontSize: 20, color: ad.c, textShadow: `0 0 10px ${ad.c}`, whiteSpace: "nowrap", lineHeight: 1 }}>{ad.big}</div>
        <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 9, color: "#b6a9d4", lineHeight: 1.25, whiteSpace: "nowrap" }}>
          <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{ad.l1}</div>
          <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{ad.l2}</div>
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.05),transparent)", animation: "tickerSheen 4.2s linear infinite", pointerEvents: "none" }} />
    </div>
  );
}

function Jumbotron({ score, clock, quarter, streak, streakTier, accuracy, hotZone, quarterBonus, urgency, windows = [], multiplayer = false, opponent, oppFx, meName }) {
  const clockColor = urgency === 3 ? "#ff2d55" : urgency === 2 ? FIRE : "#fff";
  // multiplayer HOME-vs-AWAY derived values (harmless in solo: opponent is undefined)
  const PINK = "#ec4899";                       // rival tint — matches the on-court floaties
  const oppPts = opponent?.points ?? 0;
  const lead = score - oppPts;
  const mpTotal = score + oppPts;
  const myShare = mpTotal ? (score / mpTotal) * 100 : 50;   // 0–0 tip-off → 50/50, never NaN
  const leadColor = lead > 0 ? V_GLOW : lead < 0 ? PINK : "#8b7ba8";
  const oppFlash = multiplayer && !!oppFx;
  return (
    <div style={{ position: "absolute", top: 10, left: "50%", width: "92%", maxWidth: 480, zIndex: 20, animation: "floatBoard 5s ease-in-out infinite" }}>
      <div style={{ borderRadius: 16, padding: "8px 10px 10px", background: "linear-gradient(180deg,#160c2a,#0b0718)", border: `2px solid ${V_DEEP}`, boxShadow: `0 0 34px rgba(124,58,237,0.5), inset 0 0 26px rgba(0,0,0,0.6)`, transform: "scale(0.98)", transformOrigin: "top center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 6 }}>
          <Phoenix size={16} /><div className="seg" style={{ fontWeight: 900, fontSize: 11, letterSpacing: "2px" }}>MILESTONE <span style={{ color: V_GLOW }}>MAPPING</span></div>
        </div>
        {multiplayer ? (
          /* ---- MULTIPLAYER: HOME (you) · MOMENTUM · AWAY (rival) — a real scoreboard ---- */
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr 1fr", gap: 6, alignItems: "stretch" }}>
            {/* HOME — YOU */}
            <div style={{ textAlign: "center", background: "#050310", borderRadius: 9, padding: "4px 3px", border: "1px solid rgba(168,85,247,0.35)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 8, letterSpacing: "1px", color: V_GLOW, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{(meName || "YOU").slice(0, 10)}</div>
              <div className="seg" style={{ fontSize: "clamp(24px,7vw,38px)", fontWeight: 900, lineHeight: 1, color: "#fff", textShadow: `0 0 18px ${V},0 0 3px #fff` }}>{score.toLocaleString()}</div>
              <div style={{ fontSize: 7.5, color: "#8b7ba8", fontWeight: 700, letterSpacing: "0.5px", whiteSpace: "nowrap" }}>🔥{streak} · {accuracy}%</div>
            </div>
            {/* MIDDLE — momentum tug-of-war bar */}
            <div style={{ textAlign: "center", background: "#050310", borderRadius: 9, padding: "5px 6px", border: "1px solid rgba(168,85,247,0.2)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4 }}>
              <div className="seg" style={{ fontWeight: 900, fontSize: 15, color: leadColor, textShadow: lead !== 0 ? `0 0 12px ${leadColor}` : "none", lineHeight: 1, whiteSpace: "nowrap" }}>{lead === 0 ? "TIED" : `▲ ${Math.abs(lead)} UP`}</div>
              <div style={{ position: "relative", height: 8, borderRadius: 5, overflow: "hidden", background: "#1a1030", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${V} 0%, ${V} ${myShare}%, ${PINK} ${myShare}%, ${PINK} 100%)`, transition: "background 0.5s ease" }} />
                <div style={{ position: "absolute", top: -2, bottom: -2, left: `${myShare}%`, width: 2, marginLeft: -1, background: "#fff", boxShadow: "0 0 8px #fff, 0 0 4px #fff", transition: "left 0.5s ease" }} />
              </div>
              <div style={{ fontSize: 7, letterSpacing: "2px", color: "#6b5b88", fontWeight: 700 }}>MOMENTUM</div>
            </div>
            {/* AWAY — RIVAL (absorbs the old pill's BUCKET reaction) */}
            <div style={{ position: "relative", textAlign: "center", background: "#050310", borderRadius: 9, padding: "4px 3px", border: `1px solid ${oppFlash ? GREEN : "rgba(236,72,153,0.4)"}`, boxShadow: oppFlash ? `0 0 16px ${GREEN}` : "none", transition: "border-color .2s, box-shadow .2s", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              {oppFlash && (
                <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: 11, color: oppFx.kind === "dunk" ? GOLD : GREEN, textShadow: `0 0 10px ${oppFx.kind === "dunk" ? GOLD : GREEN}`, animation: "riseFade 1.5s forwards", pointerEvents: "none" }}>🏀 {oppFx.kind === "dunk" ? "THEY DUNKED" : "BUCKET"} +{oppFx.gain}</div>
              )}
              <div style={{ fontSize: 8, letterSpacing: "1px", color: PINK, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{(opponent?.name || "RIVAL").slice(0, 10)}</div>
              <div className="seg" style={{ fontSize: "clamp(24px,7vw,38px)", fontWeight: 900, lineHeight: 1, color: "#fff", textShadow: `0 0 18px ${PINK},0 0 3px #fff` }}>{oppPts.toLocaleString()}</div>
              <div style={{ fontSize: 7.5, color: "#9d8bc0", fontWeight: 700, letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{opponent ? `${opponent.doors ?? 0}d·${opponent.sales ?? 0}s` : "waiting…"}</div>
            </div>
          </div>
        ) : (
          /* ---- SOLO: STREAK · CURRENT SCORE · ACCURACY (unchanged) ---- */
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1fr", gap: 6 }}>
            <Panel label="STREAK"><div className="seg" style={{ fontSize: 26, fontWeight: 900, color: streak >= 5 ? FIRE : "#fff", textShadow: streak >= 5 ? `0 0 14px ${FIRE}` : "none" }}>{streak}</div><div style={{ fontSize: 8, color: streakTier ? V_GLOW : "#6b5b88", letterSpacing: "1px", fontWeight: 700, minHeight: 10 }}>{streakTier ? streakTier.name : "IN A ROW"}</div></Panel>
            <div style={{ textAlign: "center", background: "#050310", borderRadius: 9, padding: "4px 3px", border: "1px solid rgba(168,85,247,0.25)" }}>
              <div style={{ fontSize: 8, letterSpacing: "2px", color: "#8b7ba8", fontWeight: 700 }}>CURRENT SCORE</div>
              <div className="seg" style={{ fontSize: "clamp(27px,8.1vw,43px)", fontWeight: 900, lineHeight: 1, textShadow: `0 0 20px ${V},0 0 3px #fff` }}>{score.toLocaleString()}</div>
              <div style={{ fontSize: 9, letterSpacing: "3px", color: V_GLOW, fontWeight: 700 }}>POINTS</div>
            </div>
            <Panel label="ACCURACY"><div className="seg" style={{ fontSize: 20, fontWeight: 900, color: V_GLOW }}>{accuracy}%</div><div style={{ fontSize: 8, color: "#6b5b88", letterSpacing: "1px" }}>{hotZone ? "🔥 HOT ×2" : `×${quarterBonus}`}</div></Panel>
          </div>
        )}
        <div style={{ marginTop: 6, background: "#050310", borderRadius: 9, padding: "6px 6px", border: "1px solid rgba(168,85,247,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: 1 }}>{[1,2,3,4].map((q) => <span key={q} className="seg" style={{ fontWeight: 900, fontSize: 11, padding: "1px 6px", borderRadius: 4, color: q === quarter ? "#050310" : "#5b4b78", background: q === quarter ? V_GLOW : "transparent" }}>Q{q}</span>)}</div>
          <div style={{ fontSize: 7, letterSpacing: "2px", color: "#6b5b88", fontWeight: 700, textAlign: "center" }}>TIME LEFT IN QUARTER{windows[quarter-1] ? ` · ${windows[quarter-1]}` : ""}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <JumbotronTicker side="left" />
            <div className="seg" style={{ fontSize: "clamp(15px,4.4vw,24px)", fontWeight: 900, color: clockColor, textShadow: urgency >= 2 ? `0 0 20px ${clockColor}` : "none", animation: urgency === 3 ? "flare 0.5s infinite" : "none", flexShrink: 0, whiteSpace: "nowrap" }}>{fmt(clock)}</div>
            <JumbotronTicker side="right" />
          </div>
        </div>
      </div>
    </div>
  );
}
function Panel({ label, children }) { return <div style={{ background: "#0a0518", borderRadius: 9, padding: "4px 3px", textAlign: "center", border: "1px solid rgba(168,85,247,0.2)", display: "flex", flexDirection: "column", justifyContent: "center" }}><div style={{ fontSize: 7, letterSpacing: "2px", color: "#8b7ba8", fontWeight: 700, marginBottom: 1 }}>{label}</div>{children}</div>; }

// ============================================================
// WATER BOTTLE — sports bottle that fills with water level
// ============================================================
function MiniBottle() {
  return (
    <svg viewBox="0 0 16 26" width="15" height="24" style={{ filter: `drop-shadow(0 0 4px ${WATER})`, flexShrink: 0 }}>
      <rect x="6" y="1" width="4" height="3" rx="1" fill="#8b5cf6"/>{/* cap */}
      <path d="M5 6 Q5 4 6.5 4 L9.5 4 Q11 4 11 6 L12 23 Q12 25 10 25 L6 25 Q4 25 4 23 Z" fill="rgba(56,189,248,0.25)" stroke="#dbe3ee" strokeWidth="1"/>
      <path d="M4.3 12 L11.7 12 L12 23 Q12 25 10 25 L6 25 Q4 25 4 23 Z" fill={WATER} opacity="0.85"/>
      <rect x="6" y="8" width="1.6" height="14" rx="0.8" fill="rgba(255,255,255,0.4)"/>{/* shine */}
    </svg>
  );
}

function WaterBottle({ fill, thirsty, scale = 1 }) {
  const waterH = Math.max(0, Math.min(100, fill));
  const W = 58 * scale, H = 106 * scale;   // 25% bigger base than before
  const surfaceY = 100 - (waterH / 100) * 78;   // in viewBox units (0..100 body)
  return (
    <div style={{ width: W, height: H, position: "relative", filter: `drop-shadow(0 0 10px ${thirsty ? FIRE : WATER})` }}>
      <svg viewBox="0 0 58 106" width={W} height={H}>
        <defs>
          <clipPath id="bottleClip"><path d="M17 26 Q17 21 22 20 L22 13 Q22 9 29 9 Q36 9 36 13 L36 20 Q41 21 41 26 L43 98 Q43 102 38 102 L20 102 Q15 102 15 98 Z"/></clipPath>
          <linearGradient id="wgrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={thirsty ? "#fca5a5" : "#7dd3fc"}/>
            <stop offset="1" stopColor={thirsty ? "#ef4444" : "#0ea5e9"}/>
          </linearGradient>
          <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(255,255,255,0.28)"/>
            <stop offset="0.3" stopColor="rgba(255,255,255,0.05)"/>
            <stop offset="1" stopColor="rgba(255,255,255,0.14)"/>
          </linearGradient>
        </defs>

        {/* glass body */}
        <path d="M17 26 Q17 21 22 20 L22 13 Q22 9 29 9 Q36 9 36 13 L36 20 Q41 21 41 26 L43 98 Q43 102 38 102 L20 102 Q15 102 15 98 Z" fill="url(#glass)" stroke="#dbe3ee" strokeWidth="1.6"/>

        {/* water fill */}
        <g clipPath="url(#bottleClip)">
          <rect x="12" y={surfaceY} width="34" height="90" fill="url(#wgrad)"/>
          {/* animated surface */}
          <ellipse cx="29" cy={surfaceY} rx="18" ry="3.2" fill={thirsty ? "#fecaca" : "#bae6fd"} style={{ animation: "waterWave 1.4s ease-in-out infinite" }}/>
          {/* rising bubbles */}
          {!thirsty && [0,1,2,3].map((i)=>(
            <circle key={i} cx={22 + i*4} cy="0" r={1.2 + (i%2)*0.6} fill="rgba(255,255,255,0.7)"
              style={{ animation: `bubble ${1.8 + i*0.4}s ease-in infinite`, animationDelay: `${i*0.45}s` }}/>
          ))}
        </g>

        {/* measurement ticks */}
        {[0.75,0.5,0.25].map((t,i)=>(
          <line key={i} x1="38" y1={26 + (1-t)*72} x2="42" y2={26 + (1-t)*72} stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>
        ))}

        {/* glossy vertical highlight */}
        <rect x="20" y="30" width="5" height="62" rx="2.5" fill="rgba(255,255,255,0.35)"/>
        <rect x="27" y="34" width="2" height="54" rx="1" fill="rgba(255,255,255,0.18)"/>

        {/* sport cap with ridges */}
        <rect x="24" y="2" width="10" height="4" rx="1.5" fill="#a78bfa"/>{/* nozzle */}
        <rect x="21" y="5" width="16" height="9" rx="2.5" fill="#8b5cf6" stroke="#c084fc" strokeWidth="1"/>
        {[0,1,2,3].map(i=>(<line key={i} x1={23+i*4} y1="6" x2={23+i*4} y2="13" stroke="#6d28d9" strokeWidth="0.8"/>))}

        {/* label plate */}
      </svg>
    </div>
  );
}

// ============================================================
// CROWD — ~330 fans across 7 deep tiers, packed shoulder to
// shoulder. Signs raise/lower on a loop w/ motivational copy.
// ============================================================
function Crowd({ flash }) {
  const { tiers, bandH } = React.useMemo(() => {
    // 16 dense rows filling a tall band top-to-bottom (no dead space).
    const rowDefs = [];
    const ROWS = 16;
    for (let r = 0; r < ROWS; r++) {
      const t = r / (ROWS - 1);
      rowDefs.push({
        y: Math.round(t * 250),
        n: Math.round(70 - t * 36),
        size: 3.5 + t * 9.5,
        op: 0.26 + t * 0.62,
        sign: r >= 3,          // even far-back rows carry small signs
      });
    }
    const shirts = [V, V_GLOW, "#38bdf8", "#ec4899", "#8b5cf6", "#22d3ee", "#f472b6", "#818cf8", "#f59e0b"];
    const skins = ["#3a2a1a","#5a3a24","#241a12","#4a3020","#6b4423","#2e2015","#7a5230","#8a5a34"];
    // aisle gaps (fans avoid these x-bands so aisles read as walkways)
    const aisles = [0.28, 0.72];
    const inAisle = (frac) => aisles.some((a) => Math.abs(frac - a) < 0.05);
    // mix law-of-probability + hype signs, all readable
    const ALL_SIGNS = [...LAW_SIGNS, ...SIGNS];
    // exactly 14 STILL signs placed at fixed spots across the crowd (row, x-fraction)
    // Signs pulled off the far-left band (0.08–0.20) so they don't hide behind
    // the action-button column; spread across center with a few on the right.
    const SIGN_SPOTS = [
      [2, 0.32], [3, 0.62], [4, 0.40], [5, 0.85], [6, 0.38],
      [7, 0.55], [8, 0.28], [9, 0.78], [10, 0.34], [11, 0.90],
      [12, 0.44], [13, 0.66], [14, 0.46], [15, 0.82],
    ];
    const built = rowDefs.map((r, ri) => {
      const fans = [];
      // which fixed sign spots live in this row
      const rowSpots = SIGN_SPOTS
        .map((s, si) => ({ frac: s[1], text: ALL_SIGNS[(si * 3) % ALL_SIGNS.length], row: s[0] }))
        .filter((s) => s.row === ri);
      const nearestIdx = (frac) => Math.round(frac * (r.n - 1));
      const signIdxMap = new Map();
      rowSpots.forEach((s) => signIdxMap.set(nearestIdx(s.frac), s.text));
      for (let i = 0; i < r.n; i++) {
        const frac = i / (r.n - 1);
        if (inAisle(frac)) { fans.push(null); continue; }   // walkway gap
        const sign = (!inAisle(frac) && signIdxMap.has(i)) ? signIdxMap.get(i) : null;
        fans.push({
          size: r.size,
          skin: skins[(i * 3 + ri) % skins.length],
          shirt: shirts[(i + ri * 2) % shirts.length],
          sign,
          stillSign: true,                 // all signs held steady (no flashing)
          bob: 1.0 + (i % 6) * 0.16,
          bobDelay: (i % 11) * 0.1,
          signDelay: 0,
          signDur: 6,
        });
      }
      return { ...r, fans };
    });
    return { tiers: built, bandH: 268 };
  }, []);

  // a couple of standing/cheering fans at the front (no signs — the 14
  // still signs live in the seated rows). Just arms-up hype.
  const standers = React.useMemo(() => {
    const shirts = [V, "#38bdf8", "#ec4899", "#f59e0b"];
    const xs = [14, 86];
    return xs.map((x, i) => ({
      x, shirt: shirts[i % shirts.length],
      bob: 1.3 + (i % 3) * 0.2, delay: (i % 4) * 0.25,
    }));
  }, []);

  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: bandH, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,#241548 0%,#1c1038 42%,#170e2c 74%,#0f0a1e 100%)" }} />
      <div style={{ position: "absolute", top: -30, left: "50%", transform: "translateX(-50%)", width: "170%", height: bandH + 30, background: "radial-gradient(ellipse at 50% 78%, rgba(124,58,247,0.20), transparent 74%)" }} />

      {/* AISLES — lit walkways down the stands */}
      {[0.28, 0.72].map((a, i) => (
        <div key={i} style={{ position: "absolute", top: 0, bottom: 30, left: `${a*100}%`, transform: "translateX(-50%)", width: `${bandH*0.045}px`, background: "linear-gradient(180deg,rgba(255,240,200,0.04),rgba(255,240,200,0.10))", borderLeft: "1px solid rgba(255,255,255,0.06)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          {/* step lines */}
          {[...Array(8)].map((_,s)=><div key={s} style={{position:"absolute",left:0,right:0,top:`${8+s*11}%`,height:1,background:"rgba(255,255,255,0.05)"}}/>)}
        </div>
      ))}

      {/* seated crowd rows */}
      {tiers.map((r, ri) => (
        <div key={ri} style={{ position: "absolute", top: r.y, left: "-8%", right: "-8%", display: "flex", justifyContent: "space-between", padding: "0 2px", opacity: r.op }}>
          {r.fans.map((f, i) => (
            f ? (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: `crowdBob ${f.bob}s ease-in-out infinite`, animationDelay: `${f.bobDelay}s` }}>
                {f.sign && (
                  <div style={{ fontSize: 8, fontFamily: "'Oswald',sans-serif", fontWeight: 700, color: "#fff", background: f.shirt, padding: "2px 5px", borderRadius: 3, marginBottom: 1, whiteSpace: "nowrap", boxShadow: `0 0 5px ${f.shirt}`, transformOrigin: "bottom center", animation: f.stillSign ? "none" : `signCycle ${f.signDur}s ease-in-out infinite`, animationDelay: `${f.signDelay}s`, letterSpacing: "0.3px", overflow: "hidden", textOverflow: "clip", border: "1px solid rgba(255,255,255,0.35)" }}>{f.sign}</div>
                )}
                <div style={{ width: f.size, height: f.size, borderRadius: "50%", background: f.skin }} />
                <div style={{ width: f.size * 1.25, height: f.size * 0.85, borderRadius: "45% 45% 16% 16%", background: f.shirt, marginTop: 0.5 }} />
              </div>
            ) : <div key={i} style={{ width: r.size * 1.3 }} />
          ))}
        </div>
      ))}

      {/* VENDORS walking the aisles */}
      <HotDogVendor aisle={0.28} bandH={bandH} />
      <BeerVendor aisle={0.72} bandH={bandH} />

      {/* MASCOT — big, dancing up in the stands */}
      <Mascot />

      {/* front standing/cheering fans (no signs) */}
      {standers.map((s, i) => (
        <div key={i} style={{ position: "absolute", bottom: 4, left: `${s.x}%`, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", animation: `crowdBob ${s.bob}s ease-in-out infinite`, animationDelay: `${s.delay}s` }}>
          <svg viewBox="0 0 26 40" width="26" height="40">
            <path d="M8 14 L4 4" stroke="#f2c9a0" strokeWidth="3" strokeLinecap="round"/>
            <path d="M18 14 L22 4" stroke="#f2c9a0" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="13" cy="9" r="5" fill="#f2c9a0"/>
            <rect x="8" y="13" width="10" height="15" rx="4" fill={s.shirt}/>
            <path d="M10 28 L9 39" stroke="#241a12" strokeWidth="3.5" strokeLinecap="round"/>
            <path d="M16 28 L17 39" stroke="#241a12" strokeWidth="3.5" strokeLinecap="round"/>
          </svg>
        </div>
      ))}

      {flash > 0 && [...Array(26)].map((_, i) => (
        <div key={`${flash}-${i}`} style={{ position: "absolute", top: `${Math.random()*(bandH-10)}px`, left: `${Math.random()*100}%`, width: 4, height: 4, borderRadius: "50%", background: "#fff", boxShadow: "0 0 7px #fff", animation: "flashPop 0.55s forwards", animationDelay: `${i*0.02}s` }} />
      ))}
    </div>
  );
}

// ---- vendor: hot-dog guy walking the aisle (up/down loop) ----
function HotDogVendor({ aisle, bandH }) {
  return (
    <div style={{ position: "absolute", left: `${aisle*100}%`, transform: "translateX(-50%)", zIndex: 3, animation: "aisleWalk 18s ease-in-out infinite", ["--h"]: `${bandH-40}px` }}>
      <svg viewBox="0 0 30 46" width="30" height="46">
        {/* neck straps */}
        <path d="M8 25 L13 19 M22 25 L17 19" stroke="#cbd5e1" strokeWidth="0.8"/>
        {/* food tray (shallow, tan) with individual hot dogs */}
        <rect x="5" y="25" width="20" height="6" rx="1.5" fill="#7a5230" stroke="#a97442" strokeWidth="0.6"/>
        {[0,1,2].map(i=>(
          <g key={i}>
            <ellipse cx={9+i*6} cy="27.5" rx="2.4" ry="1.3" fill="#e8c07a"/>{/* bun */}
            <rect x={7.2+i*6} y="27" width="3.6" height="1.2" rx="0.6" fill="#b5462a"/>{/* sausage */}
            <path d={`M${7.4+i*6} 27.3 q1.8 0.8 3.4 0`} stroke="#f4d160" strokeWidth="0.5" fill="none"/>{/* mustard */}
          </g>
        ))}
        {/* body: red vendor shirt */}
        <rect x="9" y="14" width="12" height="12" rx="3" fill="#e53935"/>
        <circle cx="15" cy="8" r="5" fill="#f2c9a0"/>
        {/* visor cap */}
        <path d="M9 6 Q15 1 21 6" stroke="#c62828" strokeWidth="3" fill="none"/>
        <path d="M9 7 h-3" stroke="#c62828" strokeWidth="2"/>
        {/* legs */}
        <path d="M12 26 L11 42 M18 26 L19 42" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round"/>
        {/* raised arm waving a dog */}
        <path d="M20 16 L26 9" stroke="#f2c9a0" strokeWidth="2.5" strokeLinecap="round"/>
        <ellipse cx="27" cy="8" rx="3" ry="1.6" fill="#e8c07a"/>
        <rect x="25.2" y="7.4" width="3.6" height="1.2" rx="0.6" fill="#b5462a"/>
      </svg>
    </div>
  );
}

// ---- vendor: BEER GUY, white shirt + hat, case of beers on a neck tray ----
function BeerVendor({ aisle, bandH }) {
  return (
    <div style={{ position: "absolute", left: `${aisle*100}%`, transform: "translateX(-50%)", zIndex: 3, animation: "aisleWalk2 20s ease-in-out infinite", ["--h"]: `${bandH-40}px` }}>
      <svg viewBox="0 0 34 50" width="37" height="54">
        {/* neck straps */}
        <path d="M9 30 L15 20 M25 30 L19 20" stroke="#cbd5e1" strokeWidth="1"/>
        {/* case of beers (tray around neck) */}
        <rect x="4" y="29" width="26" height="10" rx="2" fill="#e2b23c" stroke="#fff" strokeWidth="0.8"/>
        {/* individual cans in the case */}
        {[0,1,2,3,4].map(i=>(
          <g key={i}>
            <rect x={6.5+i*4.6} y="27" width="3.2" height="6" rx="0.6" fill="#f4d160" stroke="#8a6a1a" strokeWidth="0.4"/>
            <rect x={6.5+i*4.6} y="27" width="3.2" height="1.6" rx="0.6" fill="#c9302c"/>
          </g>
        ))}
        <text x="17" y="37.5" textAnchor="middle" fontSize="3.4" fontFamily="'Oswald',sans-serif" fontWeight="700" fill="#7a5a10">ICE COLD</text>
        {/* white vendor shirt */}
        <rect x="10" y="15" width="14" height="16" rx="3" fill="#f4f4f6" stroke="#cbd5e1" strokeWidth="0.6"/>
        {/* beard face */}
        <circle cx="17" cy="9" r="5.5" fill="#f2c9a0"/>
        <path d="M12 10 Q17 18 22 10 Q22 14 17 15 Q12 14 12 10 Z" fill="#5a3a1a"/>{/* beard */}
        <circle cx="15" cy="8" r="0.8" fill="#3a2a1a"/><circle cx="19" cy="8" r="0.8" fill="#3a2a1a"/>
        {/* white hat */}
        <path d="M10 5 Q17 -1 24 5" stroke="#f4f4f6" strokeWidth="3.5" fill="none"/>
        <path d="M10 6 h-3" stroke="#f4f4f6" strokeWidth="2.5"/>
        {/* legs */}
        <path d="M13 31 L12 46 M21 31 L22 46" stroke="#1a1a1a" strokeWidth="3.2" strokeLinecap="round"/>
        {/* arm raised waving a beer */}
        <path d="M23 17 L30 9" stroke="#f2c9a0" strokeWidth="2.6" strokeLinecap="round"/>
        <rect x="29" y="6" width="3.4" height="6" rx="0.6" fill="#f4d160" stroke="#8a6a1a" strokeWidth="0.4"/>
      </svg>
    </div>
  );
}

// ---- courtside team MASCOT (phoenix costume) ----
function Mascot() {
  // waypoints tracing the drawn path (percent of the crowd band).
  // trick: 'toss' throws a t-shirt to the crowd, 'confetti' shoots confetti,
  // 'hold' raises a sign; null = just travel.
  // route hugs the two AISLES (x≈28% & 72%, same lanes as the vendors) and
  // the FRONT ROW (bottom horizontal). Slow, looping, with tricks along the way.
  const PATH = React.useMemo(() => ([
    { x: 28, y: 20, trick: null,       t: 0 },     // top of left aisle
    { x: 28, y: 48, trick: "confetti", t: 2600 },  // down left aisle (mid)
    { x: 28, y: 82, trick: "toss",     t: 2600 },  // bottom of left aisle → front row
    { x: 45, y: 86, trick: null,       t: 2200 },  // across the front row
    { x: 60, y: 86, trick: "confetti", t: 2200 },  // front row mid
    { x: 72, y: 82, trick: "toss",     t: 2200 },  // reach right aisle bottom
    { x: 72, y: 48, trick: "hold",     t: 2600 },  // up right aisle (mid)
    { x: 72, y: 20, trick: "confetti", t: 2600 },  // top of right aisle
    { x: 50, y: 18, trick: "toss",     t: 2400 },  // across the top back to start
  ]), []);

  const [idx, setIdx] = useState(0);
  const [pos, setPos] = useState({ x: PATH[0].x, y: PATH[0].y });
  const [trick, setTrick] = useState(null);        // active trick at a stop
  const [confetti, setConfetti] = useState([]);
  const [shirts, setShirts] = useState([]);
  const [facing, setFacing] = useState(1);
  const tid = useRef(0);

  useEffect(() => {
    let alive = true;
    const step = (i) => {
      if (!alive) return;
      const from = PATH[i];
      const to = PATH[(i + 1) % PATH.length];
      setFacing(to.x >= from.x ? 1 : -1);
      setIdx(i);
      // travel to the next waypoint (CSS transition handles the glide)
      setPos({ x: to.x, y: to.y });
      // on arrival, perform the trick, then continue
      tid.current = setTimeout(() => {
        if (!alive) return;
        if (to.trick) doTrick(to.trick, to);
        // small pause to show the trick, then move on
        tid.current = setTimeout(() => step((i + 1) % PATH.length), to.trick ? 900 : 250);
      }, to.t);
    };
    step(0);
    return () => { alive = false; clearTimeout(tid.current); };
  }, [PATH]);

  const doTrick = (kind, wp) => {
    setTrick(kind);
    setTimeout(() => setTrick(null), 850);
    if (kind === "confetti") {
      const parts = [];
      for (let k = 0; k < 16; k++) {
        const ang = (Math.PI * 2 * k) / 16;
        parts.push({ id: ++idRefMascot.n, dx: Math.cos(ang) * (40 + Math.random()*40), dy: Math.sin(ang) * (40 + Math.random()*40) - 20, c: [V_GLOW, GOLD, WATER, "#ec4899", V][k % 5] });
      }
      setConfetti((c) => [...c, ...parts]);
      setTimeout(() => setConfetti((c) => c.filter((p) => !parts.find((x) => x.id === p.id))), 1100);
    }
    if (kind === "toss") {
      const s = { id: ++idRefMascot.n, dir: facing };
      setShirts((a) => [...a, s]);
      setTimeout(() => setShirts((a) => a.filter((x) => x.id !== s.id)), 1000);
    }
  };

  const armUp = trick === "toss" || trick === "hold" || trick === "confetti";

  return (
    <div style={{ position: "absolute", top: `${pos.y}%`, left: `${pos.x}%`, transform: "translate(-50%,-50%)", zIndex: 4, transition: "top 2.4s ease-in-out, left 2.4s ease-in-out", filter: `drop-shadow(0 0 8px ${V})`, pointerEvents: "none" }}>
      {/* confetti burst */}
      {confetti.map((p) => (
        <div key={p.id} style={{ position: "absolute", left: "50%", top: "20%", width: 5, height: 5, borderRadius: 1, background: p.c, boxShadow: `0 0 6px ${p.c}`, animation: "mascotConfetti 1s ease-out forwards", ["--tx"]: `${p.dx}px`, ["--ty"]: `${p.dy}px` }} />
      ))}
      {/* tossed t-shirts */}
      {shirts.map((s) => (
        <div key={s.id} style={{ position: "absolute", left: "50%", top: "10%", fontSize: 16, animation: "shirtToss 0.95s ease-out forwards", ["--dir"]: s.dir }}>👕</div>
      ))}
      <div style={{ transform: `scaleX(${facing})`, animation: "mascotDance 0.7s ease-in-out infinite" }}>
        <svg viewBox="0 -8 44 64" width="36" height="50">
          <ellipse cx="22" cy="53" rx="12" ry="2.5" fill="rgba(0,0,0,0.4)"/>
          {/* wings flap */}
          <path d="M16 26 Q2 18 3 34 Q10 30 15 33 Z" fill={V} style={{ transformOrigin: "16px 28px", animation: "wingFlap 0.4s ease-in-out infinite" }} />
          <path d="M28 26 Q42 18 41 34 Q34 30 29 33 Z" fill={V} style={{ transformOrigin: "28px 28px", animation: "wingFlap 0.4s ease-in-out infinite reverse" }} />
          <ellipse cx="22" cy="30" rx="11" ry="13" fill={V_DEEP} stroke={V_GLOW} strokeWidth="1.5"/>
          <ellipse cx="22" cy="32" rx="7" ry="8" fill="#fff" opacity="0.92"/>
          <text x="22" y="35" textAnchor="middle" fontSize="7" fontFamily="'Orbitron',monospace" fontWeight="900" fill={V}>M</text>
          <circle cx="22" cy="13" r="9" fill={V} stroke={V_GLOW} strokeWidth="1.5"/>
          <path d="M22 4 L20 -2 L24 2 Z M18 5 L15 0 L20 3 Z M26 5 L29 0 L24 3 Z" fill={V_GLOW}/>
          <circle cx="19" cy="12" r="1.7" fill="#fff"/><circle cx="25" cy="12" r="1.7" fill="#fff"/>
          <circle cx="19" cy="12" r="0.9" fill="#000"/><circle cx="25" cy="12" r="0.9" fill="#000"/>
          <path d="M20 16 L22 19 L24 16 Z" fill={GOLD}/>
          {/* arms: raise up when doing a trick, else wave foam finger */}
          {armUp ? (
            <>
              <path d="M14 26 L6 8" stroke={V} strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M30 26 L38 8" stroke={V} strokeWidth="3.5" strokeLinecap="round"/>
              {trick === "hold" && <rect x="30" y="0" width="16" height="8" rx="1.5" fill={GOLD} stroke="#fff" strokeWidth="0.6" transform="rotate(8 38 4)"/>}
              {trick === "toss" && <circle cx="38" cy="6" r="3" fill="#f4f4f6"/>}
            </>
          ) : (
            <rect x="1" y="13" width="4" height="9" rx="1.5" fill={GOLD} style={{ transformOrigin: "3px 18px", animation: "wave 0.5s ease-in-out infinite" }}/>
          )}
          <path d="M18 42 L17 50 M26 42 L27 50" stroke={GOLD} strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}
// shared id counter for mascot particle keys
const idRefMascot = { n: 0 };

function Court() {
  return (
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "56%", overflow: "hidden" }}>
      {/* perspective hardwood */}
      <div style={{ position: "absolute", bottom: 0, left: "-25%", right: "-25%", top: 0, background: "linear-gradient(180deg,#6b4420 0%,#4a2f16 40%,#2a1a0c 75%,#150d06 100%)", transform: "perspective(560px) rotateX(60deg)", transformOrigin: "bottom", borderTop: `2px solid ${V_DEEP}` }}>
        {/* wood plank lines */}
        {[...Array(9)].map((_,i)=>(
          <div key={i} style={{ position:"absolute", top:0, bottom:0, left:`${10+i*10}%`, width:1, background:"rgba(0,0,0,0.18)" }}/>
        ))}
        {/* SVG court markings in the same perspective plane */}
        <svg viewBox="0 0 300 300" preserveAspectRatio="none" style={{ position:"absolute", inset:0, width:"100%", height:"100%" }}>
          <defs>
            <filter id="lineGlow"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          {/* the painted lane / key (narrowing toward the hoop at top) */}
          <path d="M120 6 L180 6 L196 150 L104 150 Z" fill="rgba(124,58,237,0.10)" stroke={`${V}66`} strokeWidth="2"/>
          {/* lane hash marks */}
          {[40,70,100,130].map((y,i)=>(
            <g key={i}>
              <line x1={118 - i*0.5} y1={y} x2={112 - i*0.5} y2={y} stroke={`${V_GLOW}aa`} strokeWidth="2.5"/>
              <line x1={182 + i*0.5} y1={y} x2={188 + i*0.5} y2={y} stroke={`${V_GLOW}aa`} strokeWidth="2.5"/>
            </g>
          ))}
          {/* THE FREE-THROW LINE — bold, glowing, unmistakable */}
          <line x1="104" y1="150" x2="196" y2="150" stroke={V_GLOW} strokeWidth="5" filter="url(#lineGlow)" strokeLinecap="round"/>
          {/* free-throw semicircle (bows toward viewer) */}
          <path d="M104 150 Q150 210 196 150" fill="none" stroke={`${V_GLOW}cc`} strokeWidth="3.5" filter="url(#lineGlow)"/>
          {/* dashed back half of the circle */}
          <path d="M104 150 Q150 96 196 150" fill="none" stroke={`${V}88`} strokeWidth="2.5" strokeDasharray="6 6"/>
        </svg>
        {/* center circle + phoenix, low on the floor */}
        <div style={{ position: "absolute", bottom: "4%", left: "50%", transform: "translateX(-50%)", width: 150, height: 150, borderRadius: "50%", border: `3px solid ${V}44` }} />
        <div style={{ position: "absolute", bottom: "1%", left: "50%", transform: "translateX(-50%)", opacity: 0.26 }}><Phoenix size={66} /></div>
      </div>
      {/* floor sheen */}
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 60%, rgba(192,132,252,0.10), transparent 60%)", pointerEvents:"none" }}/>
    </div>
  );
}

// ============================================================
// HOOP ASSEMBLY — SOLID colored backboard (opaque), orange rim
// with depth, funnel net.
// ============================================================
function HoopAssembly({ netSwish, rimShake }) {
  return (
    <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%) perspective(400px) rotateX(8deg)", zIndex: 4, width: 170, display: "flex", flexDirection: "column", alignItems: "center", animation: rimShake ? "shake 0.3s" : "none" }}>
      {/* SOLID backboard */}
      <div style={{ position: "relative", width: 138, height: 84, borderRadius: 6, background: "linear-gradient(160deg,#f4f4f6 0%,#d7d9e2 55%,#b9bcca 100%)", border: `3px solid #fff`, boxShadow: `0 0 22px ${V}66, inset 0 -6px 14px rgba(0,0,0,0.15)` }}>
        {/* team color band */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 14, background: `linear-gradient(90deg,${V_DEEP},${V})`, borderRadius: "3px 3px 0 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span className="seg" style={{ fontSize: 7, fontWeight: 900, color: "#fff", letterSpacing: "1px" }}>MILESTONE</span>
        </div>
        {/* shooter's square */}
        <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", width: 50, height: 34, border: `3px solid #e8542a`, borderRadius: 2 }} />
      </div>
      {/* rim with depth */}
      <div style={{ position: "relative", marginTop: -3, width: 70, height: 22, zIndex: 8 }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "4px solid #b8560f", opacity: 0.6 }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "60%", borderRadius: "0 0 50% 50% / 0 0 100% 100%", borderBottom: "4px solid #ff7a1a", borderLeft: "4px solid #ff7a1a", borderRight: "4px solid #ff7a1a", boxShadow: "0 0 16px #ff7a1a" }} />
      </div>
      {/* net */}
      <div key={netSwish} style={{ marginTop: -8, width: 66, height: 50, transformOrigin: "top center", animation: netSwish ? "netFall 0.6s ease-out" : "none", zIndex: 7 }}>
        <svg viewBox="0 0 66 50" width="66" height="50" style={{ overflow: "visible" }}>
          <defs><linearGradient id="netg3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.9"/><stop offset="1" stopColor="#fff" stopOpacity="0.2"/></linearGradient></defs>
          {[...Array(13)].map((_, i) => { const topX = 3 + i * 5; const botX = 24 + (i * 18) / 13; return <path key={i} d={`M${topX} 2 Q${(topX+botX)/2} 26 ${botX} 48`} stroke="url(#netg3)" strokeWidth="0.8" fill="none" />; })}
          {[10, 22, 33, 42].map((y, ri) => { const inset = ri * 6; return <path key={ri} d={`M${3+inset} ${y} Q33 ${y+5} ${63-inset} ${y}`} stroke="url(#netg3)" strokeWidth="0.7" fill="none" />; })}
        </svg>
      </div>
      <div style={{ position: "absolute", top: 78, width: 8, height: 16, background: "linear-gradient(180deg,#555,#222)", zIndex: 3 }} />
      <div style={{ position: "absolute", top: 92, width: 9, height: 230, background: "linear-gradient(90deg,#2f2f2f,#5a5a5a,#2f2f2f)", boxShadow: `0 0 10px ${V}33`, zIndex: 2 }} />
      <style>{`@keyframes netFall {0%{transform:scaleY(1)}35%{transform:scaleY(1.55)}70%{transform:scaleY(0.8)}100%{transform:scaleY(1)}}`}</style>
    </div>
  );
}

function Shooter({ second, shooting, fatigued, inZone, dunk, dunkPhase, big }) {
  const scale = big ? 1.45 : 1;
  const jersey   = second ? "#0e5a80" : V_DEEP;
  const jTrim    = second ? "#7dd3fc" : V_GLOW;
  const shorts   = second ? "#0b3a54" : "#1e1140";
  const sTrim    = second ? "#38bdf8" : V;
  const skin     = second ? "#e8b98f" : "#f2c9a0";
  const hair     = "#2a1c12";
  const shoe     = inZone ? GOLD : (second ? "#38bdf8" : "#fff");
  const shoeSole = "#e8542a";
  // vertical lift for the dunk: crouch, explode up to the rim, hang, drop
  const lift = dunkPhase === "jump" ? "-102px" : dunkPhase === "hang" ? "-106px" : dunkPhase === "drop" ? "0px" : "0px";
  const liftTrans = dunkPhase === "jump" ? "transform 0.5s cubic-bezier(.2,.8,.3,1)"
                  : dunkPhase === "drop" ? "transform 0.42s cubic-bezier(.5,0,.8,.5)"
                  : dunkPhase === "hang" ? "transform 0.2s" : "transform 0.3s";
  const isDunking = !!dunkPhase;
  return (
    <div style={{ position: "absolute", bottom: "8%", left: second ? "64%" : "50%", width: 76 * scale, height: 166 * scale, zIndex: isDunking ? 9 : 5, transform: `translateX(-50%) translateY(${lift})`, transition: liftTrans, animation: shooting ? "windup 0.28s" : (dunkPhase === "hang" ? "rimHang 0.5s ease-in-out infinite" : "none"), filter: fatigued ? "saturate(0.8) brightness(0.9)" : inZone ? `drop-shadow(0 0 12px ${GOLD})` : `drop-shadow(0 0 8px ${V})` }}>
      <svg viewBox="0 -16 76 166" width={76 * scale} height={166 * scale}>
        <ellipse cx="38" cy="146" rx="24" ry="5" fill="rgba(0,0,0,0.45)" opacity={isDunking ? 0.15 : 1} />

        {/* ---- legs (back) ---- */}
        <path d="M32 88 L28 124" stroke={skin} strokeWidth="6.5" strokeLinecap="round" />
        <path d="M44 88 L48 124" stroke={skin} strokeWidth="6.5" strokeLinecap="round" />
        {/* calf muscle hint */}
        <path d="M29 108 q-2 6 1 12 M47 108 q2 6 -1 12" stroke={skin} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5"/>

        {/* ---- shoes seen from behind (heels toward us) ---- */}
        <g>
          <path d="M20 124 h14 q3 0 3 4 l0 3 q0 3 -3 3 h-14 q-2 0 -2 -3 l0 -4 q0 -3 2 -3 Z" fill={shoe} stroke="#0d0d0d" strokeWidth="1"/>
          <rect x="17" y="132" width="19" height="4" rx="2" fill={shoeSole}/>
          <path d="M24 125 v8" stroke="#0d0d0d" strokeWidth="0.8"/>{/* heel seam */}
        </g>
        <g>
          <path d="M42 124 h14 q2 0 2 4 l0 3 q0 3 -2 3 h-14 q-3 0 -3 -3 l0 -4 q0 -3 3 -3 Z" fill={shoe} stroke="#0d0d0d" strokeWidth="1"/>
          <rect x="40" y="132" width="19" height="4" rx="2" fill={shoeSole}/>
          <path d="M52 125 v8" stroke="#0d0d0d" strokeWidth="0.8"/>
        </g>

        {/* ---- shorts (back) ---- */}
        <path d="M25 74 L51 74 L53 98 L42 98 L38 84 L34 98 L23 98 Z" fill={shorts} stroke={sTrim} strokeWidth="1.5"/>
        <path d="M26 94 L34 94 M42 94 L52 94" stroke={sTrim} strokeWidth="2"/>
        <path d="M25 76 h26" stroke={sTrim} strokeWidth="1.5" opacity="0.6"/>{/* waistband */}

        {/* ---- jersey (back) with big number ---- */}
        <path d="M24 38 Q24 33 30 32 L46 32 Q52 33 52 38 L54 76 L22 76 Z" fill={jersey} stroke={jTrim} strokeWidth="2"/>
        {/* shoulder blades shading */}
        <path d="M30 42 Q38 46 46 42" stroke={jTrim} strokeWidth="1.2" opacity="0.4" fill="none"/>
        {/* back collar */}
        <path d="M30 33 Q38 30 46 33" stroke={jTrim} strokeWidth="2.5" fill="none"/>
        {/* BIG back number */}
        <text x="38" y="62" textAnchor="middle" fontFamily="'Orbitron',monospace" fontWeight="900" fontSize="22" fill={jTrim} opacity="0.95">1</text>

        {/* ---- back of head: hair + neck, NO face (facing away) ---- */}
        <rect x="35" y="27" width="6" height="6" fill={skin}/>{/* neck */}
        <circle cx="38" cy="19" r="10.5" fill={hair}/>{/* back of head = hair */}
        <path d="M30 22 Q38 27 46 22" stroke="#1a1109" strokeWidth="1.2" fill="none" opacity="0.6"/>{/* hairline */}
        <ellipse cx="38" cy="14" rx="7" ry="4" fill="#3a2818" opacity="0.6"/>{/* crown highlight */}
        {/* headband (back) */}
        <path d="M28 17 Q38 13 48 17" stroke={sTrim} strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <rect x="35" y="14" width="6" height="3" rx="1" fill={sTrim}/>{/* band knot */}

        {/* ---- arms: dunk grip when dunking, else shoot/hold ---- */}
        {dunkPhase ? (
          <>
            {/* both arms punched straight up to grab the rim */}
            <path d="M27 40 L30 -14" stroke={skin} strokeWidth="6.5" strokeLinecap="round" fill="none" />
            <path d="M49 40 L46 -14" stroke={skin} strokeWidth="6.5" strokeLinecap="round" fill="none" />
            {/* fists gripping */}
            <circle cx="30" cy="-15" r="3.5" fill={skin} stroke={jTrim} strokeWidth="1.5"/>
            <circle cx="46" cy="-15" r="3.5" fill={skin} stroke={jTrim} strokeWidth="1.5"/>
            {/* the ball being slammed (jump), gone once hanging */}
            {dunkPhase === "jump" && <circle cx="38" cy="-20" r="8" fill="url(#ballGrad)" stroke="#c2410c" strokeWidth="0.8"/>}
            <defs><radialGradient id="ballGrad" cx="35%" cy="30%"><stop offset="0" stopColor="#ff9d4d"/><stop offset="1" stopColor="#c2410c"/></radialGradient></defs>
          </>
        ) : shooting ? (
          <>
            {/* both arms extended up in release, ball already gone */}
            <path d="M26 40 Q24 22 33 6" stroke={skin} strokeWidth="6.5" strokeLinecap="round" fill="none" />
            <path d="M50 40 Q52 22 43 6" stroke={skin} strokeWidth="6.5" strokeLinecap="round" fill="none" />
            {/* wrist snap flick */}
            <path d="M33 6 q1 -3 4 -3 M43 6 q-1 -3 -4 -3" stroke={skin} strokeWidth="5" strokeLinecap="round" fill="none"/>
            <circle cx="33" cy="7" r="2.5" fill={jTrim}/>
            <circle cx="43" cy="7" r="2.5" fill={jTrim}/>
          </>
        ) : (
          <>
            {/* arms up cradling the ball high, elbows out (back view set-point) */}
            <path d="M26 40 Q22 24 33 9" stroke={skin} strokeWidth="6.5" strokeLinecap="round" fill="none" />
            <path d="M50 40 Q54 24 43 9" stroke={skin} strokeWidth="6.5" strokeLinecap="round" fill="none" />
            {/* ball held high above/ahead of the head, toward the rim */}
            <circle cx="38" cy="2" r="8" fill="url(#ballGrad2)" stroke="#c2410c" strokeWidth="0.8"/>
            <path d="M30 2 h16 M38 -6 v16" stroke="rgba(0,0,0,0.4)" strokeWidth="0.8"/>
            <path d="M32.5 -3.5 Q38 2 32.5 7.5 M43.5 -3.5 Q38 2 43.5 7.5" stroke="rgba(0,0,0,0.3)" strokeWidth="0.7" fill="none"/>
            <defs><radialGradient id="ballGrad2" cx="35%" cy="30%"><stop offset="0" stopColor="#ff9d4d"/><stop offset="1" stopColor="#c2410c"/></radialGradient></defs>
            {/* hands gripping the ball */}
            <circle cx="44" cy="8" r="2.6" fill={jTrim}/>
            <circle cx="32" cy="8" r="2.6" fill={jTrim}/>
          </>
        )}
      </svg>
    </div>
  );
}

function Ball({ ball }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const parent = el.parentElement;
    const zoneH = parent ? parent.clientHeight : 400;
    const zoneW = parent ? parent.clientWidth : 300;
    const startBottom = zoneH * RELEASE_BOTTOM_PCT;
    const rimBottom = zoneH - RIM_TOP;
    const riseToRim = rimBottom - startBottom;
    const dropThrough = 42;
    const made = ball.made; const dunk = ball.kind === "dunk";
    // opponent ball is released from their side (~64%) and drifts to the central rim
    // (50%); for the local ball driftPx is 0, so its arc is unchanged.
    const driftPx = ball.second ? (0.50 - 0.64) * zoneW : 0;
    const tx = (basePct, frac) => `calc(${basePct}% + ${(driftPx * frac).toFixed(1)}px)`;
    const frames = made
      ? [
          { offset: 0,    transform: `translate(${tx(-50,0)}, 0) scale(0.85)`, opacity: 1 },
          { offset: 0.48, transform: `translate(${tx(-50,0.7)}, ${-(riseToRim + 46)}px) scale(1.05)`, opacity: 1 },
          { offset: 0.66, transform: `translate(${tx(-50,1)}, ${-riseToRim}px) scale(0.98)`, opacity: 1 },
          { offset: 0.82, transform: `translate(${tx(-50,1)}, ${-(riseToRim - dropThrough*0.6)}px) scale(0.85)`, opacity: 1 },
          { offset: 1,    transform: `translate(${tx(-50,1)}, ${-(riseToRim - dropThrough)}px) scale(0.7)`, opacity: 0 },
        ]
      : [
          { offset: 0,    transform: `translate(${tx(-50,0)}, 0) scale(0.85)`, opacity: 1 },
          { offset: 0.48, transform: `translate(${tx(-50,0.7)}, ${-(riseToRim + 30)}px) scale(1.05)`, opacity: 1 },
          { offset: 0.66, transform: `translate(${tx(-38,1)}, ${-riseToRim}px) scale(0.95)`, opacity: 1 },
          { offset: 0.78, transform: `translate(${tx(-20,1)}, ${-(riseToRim+12)}px) scale(0.95)`, opacity: 1 },
          { offset: 1,    transform: `translate(${tx(60,1)}, ${-(riseToRim - 100)}px) scale(0.82)`, opacity: 0 },
        ];
    const anim = el.animate(frames, { duration: dunk ? 720 : 880, easing: "cubic-bezier(.3,.6,.4,1)", fill: "forwards" });
    return () => anim.cancel();
  }, [ball]);
  return (
    <div ref={ref} style={{ position: "absolute", bottom: `${RELEASE_BOTTOM_PCT*100}%`, left: ball.second ? "64%" : "50%", zIndex: 9, pointerEvents: "none" }}>
      <div style={{ width: 24, height: 24, borderRadius: "50%", background: ball.kind === "dunk" ? `radial-gradient(circle at 35% 30%,${GOLD},#b45309)` : "radial-gradient(circle at 35% 30%,#ff9d4d,#c2410c)", boxShadow: `0 0 16px ${ball.color}`, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(90deg,transparent 47%,rgba(0,0,0,0.45) 48%,rgba(0,0,0,0.45) 52%,transparent 53%)" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(0deg,transparent 47%,rgba(0,0,0,0.45) 48%,rgba(0,0,0,0.45) 52%,transparent 53%)" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(0,0,0,0.3)" }} />
      </div>
    </div>
  );
}

function Ambience() {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(168,85,247,0.015) 3px,rgba(168,85,247,0.015) 4px)", pointerEvents: "none" }} />
      {[...Array(4)].map((_, i) => <div key={i} style={{ position: "absolute", top: "-5%", left: `${12+i*24}%`, width: 3, height: "20%", background: `linear-gradient(180deg,${V},transparent)`, opacity: 0.4, transform: `rotate(${(i-1.5)*7}deg)`, pointerEvents: "none", animation: `flare ${3+i*0.5}s infinite` }} />)}
    </>
  );
}

function ActionIcon({ id, color, size = 20 }) {
  const s = size;
  const stroke = { stroke: color, strokeWidth: 2, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    knock: (<><rect x="6" y="3" width="12" height="18" rx="1" {...stroke} /><circle cx="15" cy="12" r="1.2" fill={color} /></>),        // door
    talk:  (<><path d="M4 5 h16 v10 h-9 l-4 4 v-4 H4 Z" {...stroke} /></>),                                                              // speech bubble
    pitch: (<><circle cx="12" cy="12" r="8" {...stroke} /><circle cx="12" cy="12" r="3.5" {...stroke} /><circle cx="12" cy="12" r="1" fill={color} /></>), // target
    price: (<><path d="M4 14 L9 9 L13 12 L20 5" {...stroke} /><path d="M20 5 h-4 M20 5 v4" {...stroke} /></>),                            // trend
    close: (<><path d="M12 3 l2.5 5 5.5 .8 -4 4 1 5.5 -5-2.7 -5 2.7 1-5.5 -4-4 5.5-.8 Z" {...stroke} fill={color} fillOpacity="0.25" /></>), // star
    name:  (<><circle cx="12" cy="8" r="3.5" {...stroke} /><path d="M5 20 c0-4 3.5-6 7-6 s7 2 7 6" {...stroke} /></>),                    // person
    slam:  (<><path d="M4 5 h16 v10 h-9 l-4 4 v-4 H4 Z" {...stroke} /></>),                                                              // spoke to (speech bubble)
  };
  return <svg viewBox="0 0 24 24" width={s} height={s} style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}>{icons[id]}</svg>;
}
function ActionIconBig({ id, color }) { return <ActionIcon id={id} color={color} size={26} />; }

function Phoenix({ size = 40, style }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={style}>
      <g fill={V}>
        <path d="M50 20 C40 30 30 28 22 40 C34 38 40 42 40 42 C30 48 24 60 22 72 C34 62 42 62 42 62 C40 72 44 80 50 86 C56 80 60 72 58 62 C58 62 66 62 78 72 C76 60 70 48 60 42 C60 42 66 38 78 40 C70 28 60 30 50 20 Z" />
        <circle cx="50" cy="46" r="6" fill={V_GLOW} />
      </g>
    </svg>
  );
}

// ============================================================
// COMPANY LOGO — Milestone Mapping phoenix rising w/ diamond,
// spread wings, inside a glowing ring (matches brand mark).
// ============================================================
function CompanyLogo({ size = 200, animate }) {
  const s = size;
  return (
    <svg viewBox="0 0 200 200" width={s} height={s} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="mmBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#38bdf8"/><stop offset="0.5" stopColor="#818cf8"/><stop offset="1" stopColor="#a855f7"/>
        </linearGradient>
        <linearGradient id="mmDia" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc"/><stop offset="1" stopColor="#6366f1"/>
        </linearGradient>
        <radialGradient id="mmGlow" cx="50%" cy="50%"><stop offset="0" stopColor="rgba(129,140,248,0.35)"/><stop offset="1" stopColor="transparent"/></radialGradient>
        <filter id="mmSoft"><feGaussianBlur stdDeviation="1.1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {/* glow bloom */}
      <circle cx="100" cy="100" r="92" fill="url(#mmGlow)"/>
      {/* outer ring */}
      <circle cx="100" cy="100" r="82" fill="none" stroke="url(#mmBlue)" strokeWidth="2.5" opacity="0.9" style={animate ? { strokeDasharray: 515, strokeDashoffset: 515, animation: "ringDraw 1.1s ease-out .1s forwards" } : {}}/>

      <g filter="url(#mmSoft)" style={animate ? { opacity: 0, animation: "logoRise 0.9s ease-out .5s forwards", transformOrigin: "100px 110px" } : {}}>
        {/* diamond */}
        <g fill="url(#mmDia)" stroke="#bae6fd" strokeWidth="1">
          <path d="M100 34 L118 50 L100 74 L82 50 Z"/>
          <path d="M100 34 L100 74" stroke="#e0f2fe" strokeWidth="0.6" opacity="0.7"/>
          <path d="M82 50 L118 50" stroke="#e0f2fe" strokeWidth="0.6" opacity="0.7"/>
        </g>
        <circle cx="107" cy="41" r="1.4" fill="#fff"/>

        {/* left wing */}
        <g fill="url(#mmBlue)">
          <path d="M96 96 C74 72 52 74 34 84 C50 82 60 88 60 88 C42 92 30 104 24 120 C42 108 56 110 56 110 C44 118 38 130 38 142 C56 128 72 122 84 118 C78 108 84 100 96 96 Z"/>
          {/* right wing (mirror) */}
          <path d="M104 96 C126 72 148 74 166 84 C150 82 140 88 140 88 C158 92 170 104 176 120 C158 108 144 110 144 110 C156 118 162 130 162 142 C144 128 128 122 116 118 C122 108 116 100 104 96 Z"/>
        </g>
        {/* body / tail flame */}
        <path d="M100 78 C92 86 90 96 94 104 C90 116 92 130 100 150 C108 130 110 116 106 104 C110 96 108 86 100 78 Z" fill="url(#mmBlue)"/>
        {/* head + beak */}
        <path d="M100 74 C95 76 92 82 96 88 C100 90 104 88 106 84 C108 80 105 75 100 74 Z" fill="url(#mmBlue)"/>
        <path d="M106 82 L114 80 L106 86 Z" fill="#7dd3fc"/>
        <circle cx="99" cy="82" r="1.6" fill="#0a0714"/>
      </g>
    </svg>
  );
}

// ============================================================
// CINEMATIC INTRO — company bumper → hype title cards with real
// animated shots (dunk, rim grip, crowd cheer, hydration) → CTA.
// ============================================================
function Presenter({ onDone, snd }) {
  const [i, setI] = useState(0);
  // each scene: duration + a render key
  const SCENES = React.useMemo(() => ([
    { k: "bumper",  d: 3000 },   // A GAME BY Milestone Mapping
    { k: "no",      d: 3000 },   // EVERY NO IS A SHOT (ball bounces up)
    { k: "dunk",    d: 3400 },   // EVERY SALE IS A DUNK (player jumps + slams)
    { k: "grip",    d: 2600 },   // zoom on gripping the rim
    { k: "crowd",   d: 3000 },   // crowd cheering with signs
    { k: "hydrate", d: 2600 },   // hydration break
    { k: "law",     d: 3000 },   // THE MATH OWES YOU
    { k: "quarters",d: 3000 },   // 4 QUARTERS
    { k: "cta",     d: 99999 },  // GAME ON (waits for tap)
  ]), []);

  useEffect(() => {
    if (i >= SCENES.length - 1) return;         // CTA waits for tap
    if (snd && (SCENES[i].k === "dunk")) setTimeout(() => { snd.roar(0.5); snd.chord([392,523,659,784],0.3,"sawtooth"); }, 700);
    if (snd && (SCENES[i].k === "bumper")) setTimeout(() => { snd.chord([392,523,659],0.35,"sine"); }, 400);
    if (snd && (SCENES[i].k === "crowd")) snd.roar(0.4);
    const t = setTimeout(() => setI((n) => n + 1), SCENES[i].d);
    return () => clearTimeout(t);
  }, [i]);

  const scene = SCENES[i].k;
  const skip = () => { if (scene === "cta") onDone(); else setI(SCENES.length - 1); };
  const bg = scene === "bumper"
    ? "radial-gradient(ellipse at 50% 42%,#12172e 0%,#0a0714 72%)"
    : "radial-gradient(ellipse at 50% 40%,#141033 0%,#0a0714 78%)";

  return (
    <div onClick={scene === "cta" ? onDone : skip} style={{ position: "absolute", inset: 0, overflow: "hidden", cursor: "pointer", background: bg }}>
      <Ambience />
      {/* sweeping arena light band */}
      <div style={{ position: "absolute", top: "46%", left: "-20%", right: "-20%", height: 3, background: `linear-gradient(90deg,transparent,${WATER},${V},transparent)`, opacity: 0.5, filter: "blur(1px)", boxShadow: `0 0 30px ${V}` }} />

      <div key={i} style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 26, textAlign: "center", animation: "sceneFade 0.5s ease-out" }}>
        <IntroScene scene={scene} />
      </div>

      {scene !== "cta" && <div style={{ position: "absolute", bottom: 34, left: 0, right: 0, textAlign: "center", fontSize: 10, letterSpacing: "3px", color: "#5a5478", fontFamily: "'JetBrains Mono',monospace" }}>TAP TO SKIP</div>}
      {/* progress dots */}
      <div style={{ position: "absolute", bottom: 18, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 5 }}>
        {SCENES.map((_, k) => <div key={k} style={{ width: k === i ? 16 : 5, height: 5, borderRadius: 3, background: k === i ? V_GLOW : "rgba(168,85,247,0.3)", transition: "all .3s" }} />)}
      </div>
    </div>
  );
}

function IntroScene({ scene }) {
  const Eyebrow = ({ children, c }) => <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: "clamp(10px,3vw,13px)", letterSpacing: "5px", color: c || GOLD, fontWeight: 700, marginBottom: 12, animation: "rise 0.6s both" }}>{children}</div>;
  const Title = ({ children, delay = 0.15 }) => <div style={{ fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: "clamp(34px,11vw,68px)", lineHeight: 0.95, color: "#fff", letterSpacing: "1px", WebkitTextStroke: `1.5px ${V_DEEP}`, textShadow: `0 0 30px ${V}, 2px 2px 0 #0a0714`, animation: `stampIn 0.6s ${delay}s both` }}>{children}</div>;
  const Sub = ({ children }) => <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: "clamp(13px,4vw,18px)", color: "#c9bce6", letterSpacing: "0.5px", marginTop: 16, maxWidth: 340, animation: "rise 0.7s 0.5s both" }}>{children}</div>;

  if (scene === "bumper") return (
    <>
      <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 12, letterSpacing: "5px", color: "#6b7bb0", marginBottom: 20 }}>A GAME BY</div>
      {/* Real Milestone Mapping brand mark (same asset as the dashboard hero).
          The PNG already contains the "MILESTONE MAPPING" wordmark, so no text below it. */}
      <img
        src="/assets/brand/milestone-mapping-logo-v2.png"
        alt="Milestone Mapping"
        style={{ display: "block", width: "min(260px, 78vw)", height: "auto", objectFit: "contain", margin: "0 auto", filter: "drop-shadow(0 0 26px rgba(129,140,248,0.35))", animation: "rise 0.8s both" }}
      />
    </>
  );

  if (scene === "no") return (
    <>
      <div style={{ marginBottom: 8, animation: "ballHop 1.2s ease-in-out infinite" }}><BallGlyph size={54} /></div>
      <Eyebrow c={WATER}>THE LAW OF PROBABILITY</Eyebrow>
      <Title>EVERY NO<br/>IS A SHOT</Title>
      <Sub>Every door you knock puts points on the board.</Sub>
    </>
  );

  if (scene === "dunk") return (
    <>
      <div style={{ height: 150, position: "relative", width: 120, marginBottom: 8 }}>
        <MiniRim />
        <div style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)", animation: "dunkLeap 1.6s ease-out both" }}>
          <DunkerGlyph />
        </div>
      </div>
      <Eyebrow>THE PAYOFF</Eyebrow>
      <Title delay={0.9}>EVERY SALE<br/>IS A DUNK</Title>
      <Sub>Close the deal — jump up and slam it home. +100.</Sub>
    </>
  );

  if (scene === "grip") return (
    <>
      <div style={{ marginBottom: 12 }}><RimGripGlyph /></div>
      <Eyebrow c="#fb7f34">HANG ON IT</Eyebrow>
      <Title>GRIP<br/>THE RIM</Title>
      <Sub>Big closes let you hang. Own the moment.</Sub>
    </>
  );

  if (scene === "crowd") return (
    <>
      <div style={{ marginBottom: 10 }}><CrowdCheerGlyph /></div>
      <Eyebrow c={V_GLOW}>THE ARENA</Eyebrow>
      <Title>THE CROWD<br/>ROARS</Title>
      <Sub>Fans on their feet, signs up. Every rep is a highlight.</Sub>
    </>
  );

  if (scene === "hydrate") return (
    <>
      <div style={{ marginBottom: 12, animation: "sip 1.4s ease-in-out infinite" }}><WaterBottle fill={70} thirsty={false} scale={1.6} /></div>
      <Eyebrow c={WATER}>STAY IN THE ZONE</Eyebrow>
      <Title>HYDRATION<br/>BREAK</Title>
      <Sub>Drink to stay hot. Find bottles on the doors for extra life.</Sub>
    </>
  );

  if (scene === "law") return (
    <>
      <div style={{ marginBottom: 6 }}><BellCurveGlyph /></div>
      <Eyebrow>THE LAW OF AVERAGES</Eyebrow>
      <Title>THE MATH<br/>OWES YOU</Title>
      <Sub>Keep knocking. The next yes is already on the way.</Sub>
    </>
  );

  if (scene === "quarters") return (
    <>
      <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 16, color: "#c9bce6", marginBottom: 6, animation: "rise 0.5s both" }}>Your sales day is</div>
      <Title>4 QUARTERS</Title>
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        {["Q1","Q2","Q3","Q4"].map((q, k) => (
          <div key={q} className="seg" style={{ width: 52, height: 52, borderRadius: 12, border: `2px solid ${WATER}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 17, color: WATER, boxShadow: `0 0 14px ${WATER}55`, animation: `stampIn 0.4s ${0.6 + k * 0.15}s both` }}>{q}</div>
        ))}
      </div>
      <Sub>Buzzer to buzzer. Play it like a game.</Sub>
    </>
  );

  // CTA
  return (
    <>
      <HoopsWordmark width={Math.min(320, typeof window !== "undefined" ? window.innerWidth * 0.82 : 320)} />
      <div style={{ marginTop: 20, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 15, color: "#c9bce6", letterSpacing: "1px", animation: "rise 0.6s both" }}>Take your shot. Earn your points.</div>
      <div style={{ marginTop: 26, padding: "14px 44px", borderRadius: 40, background: `linear-gradient(90deg,${WATER},${V},${"#ec4899"})`, color: "#0a0714", fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: 18, letterSpacing: "3px", boxShadow: `0 0 30px ${V}`, animation: "flare 1.4s infinite" }}>GAME ON ▶</div>
    </>
  );
}

// ---- intro glyphs ----
function BallGlyph({ size = 48 }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} style={{ filter: "drop-shadow(0 0 10px #fb7f34)" }}>
      <defs><radialGradient id="bg_ball" cx="38%" cy="30%"><stop offset="0" stopColor="#ff9d4d"/><stop offset="1" stopColor="#c2410c"/></radialGradient></defs>
      <circle cx="24" cy="24" r="22" fill="url(#bg_ball)" stroke="#7a2d0a" strokeWidth="2"/>
      <path d="M2 24 h44 M24 2 v44" stroke="rgba(0,0,0,0.5)" strokeWidth="2"/>
      <path d="M9 9 Q24 24 9 39 M39 9 Q24 24 39 39" stroke="rgba(0,0,0,0.4)" strokeWidth="1.6" fill="none"/>
    </svg>
  );
}
function MiniRim() {
  return (
    <div style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)" }}>
      <svg viewBox="0 0 90 40" width="90" height="40">
        <rect x="20" y="0" width="50" height="26" rx="2" fill="#e9edf5" stroke="#fff" strokeWidth="1.5"/>
        <rect x="34" y="7" width="22" height="13" rx="1.5" fill="none" stroke="#fb7f34" strokeWidth="2"/>
        <ellipse cx="45" cy="30" rx="20" ry="5" fill="none" stroke="#fb7f34" strokeWidth="3"/>
      </svg>
    </div>
  );
}
function DunkerGlyph() {
  return (
    <svg viewBox="0 0 60 90" width="60" height="90" style={{ filter: `drop-shadow(0 0 8px ${V})` }}>
      {/* legs */}
      <path d="M26 52 L22 76 M34 52 L38 76" stroke="#f2c9a0" strokeWidth="5" strokeLinecap="round"/>
      <rect x="20" y="72" width="10" height="7" rx="2" fill="#fff"/><rect x="32" y="72" width="10" height="7" rx="2" fill="#fff"/>
      {/* shorts + jersey */}
      <path d="M20 40 h20 l2 14 h-8 l-4 -8 -4 8 h-8 z" fill="#1e1140"/>
      <path d="M20 18 q0 -4 5 -4 h10 q5 0 5 4 l2 24 h-24 z" fill={V_DEEP} stroke={V_GLOW} strokeWidth="1.5"/>
      {/* back of head */}
      <circle cx="30" cy="10" r="7" fill="#2a1c12"/>
      {/* arms up gripping */}
      <path d="M22 20 L26 -6 M38 20 L34 -6" stroke="#f2c9a0" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="26" cy="-7" r="3" fill="#f2c9a0"/><circle cx="34" cy="-7" r="3" fill="#f2c9a0"/>
      {/* ball */}
      <circle cx="30" cy="-12" r="6" fill="#ff9d4d" stroke="#c2410c" strokeWidth="1"/>
    </svg>
  );
}
function RimGripGlyph() {
  return (
    <svg viewBox="0 0 140 90" width="150" height="96" style={{ filter: "drop-shadow(0 0 12px #fb7f34)" }}>
      {/* rim close-up */}
      <ellipse cx="70" cy="34" rx="60" ry="12" fill="none" stroke="#fb7f34" strokeWidth="7"/>
      <ellipse cx="70" cy="34" rx="60" ry="12" fill="none" stroke="#ff9d4d" strokeWidth="2"/>
      {/* two gripping hands */}
      {[52, 88].map((x, k) => (
        <g key={k}>
          <rect x={x-7} y="26" width="14" height="10" rx="4" fill="#f2c9a0"/>
          {[0,1,2,3].map(f => <rect key={f} x={x-6+f*3.4} y="20" width="2.6" height="10" rx="1.3" fill="#f2c9a0"/>)}
          <path d={`M${x} 36 L${x-4} 60`} stroke="#f2c9a0" strokeWidth="6" strokeLinecap="round"/>
        </g>
      ))}
      {/* net */}
      {[...Array(9)].map((_,i)=><path key={i} d={`M${18+i*13} 40 L${52+i*4} 78`} stroke="#c084fc" strokeWidth="1" opacity="0.7"/>)}
    </svg>
  );
}
function CrowdCheerGlyph() {
  const cols = ["#a855f7","#38bdf8","#ec4899","#22d3ee","#f59e0b","#818cf8"];
  return (
    <svg viewBox="0 0 200 70" width="220" height="77">
      {[...Array(3)].map((_, r) => (
        <g key={r} opacity={0.5 + r * 0.25}>
          {[...Array(12)].map((_, c) => (
            <g key={c} style={{ transformOrigin: `${10+c*16}px ${52-r*16}px`, animation: `cheer ${0.8+(c%3)*0.2}s ${(c%4)*0.1}s ease-in-out infinite` }}>
              <circle cx={10+c*16} cy={52-r*16} r="4.5" fill={cols[(c+r)%cols.length]}/>
              <rect x={6+c*16} y={54-r*16} width="9" height="7" rx="3" fill={cols[(c+r+2)%cols.length]}/>
            </g>
          ))}
        </g>
      ))}
      {/* a couple raised signs */}
      <rect x="30" y="6" width="42" height="12" rx="2" fill={V} /><text x="51" y="15" textAnchor="middle" fontSize="7" fontFamily="Oswald" fontWeight="700" fill="#fff">IT'S THE LAW</text>
      <rect x="120" y="10" width="44" height="12" rx="2" fill={WATER} /><text x="142" y="19" textAnchor="middle" fontSize="7" fontFamily="Oswald" fontWeight="700" fill="#fff">GO GET IT</text>
    </svg>
  );
}
function BellCurveGlyph() {
  return (
    <svg viewBox="0 0 160 80" width="180" height="90" style={{ filter: `drop-shadow(0 0 10px ${V})` }}>
      <defs><linearGradient id="bc_g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#38bdf8"/><stop offset=".5" stopColor="#a855f7"/><stop offset="1" stopColor="#ec4899"/></linearGradient></defs>
      {[30,45,60,72,80,72,60,45,30].map((h,i)=><rect key={i} x={16+i*15} y={72-h} width="10" height={h} rx="1.5" fill="url(#bc_g)" opacity={0.35 + (h/80)*0.5}/>)}
      <path d="M10 72 C50 72 54 12 80 12 C106 12 110 72 150 72" fill="none" stroke="url(#bc_g)" strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="80" cy="10" rx="14" ry="3.5" fill="none" stroke="#fb7f34" strokeWidth="2.5"/>
      <circle cx="80" cy="4" r="5" fill="#ff9d4d" stroke="#c2410c" strokeWidth="1" style={{ animation: "ballHop 1.6s ease-in-out infinite" }}/>
    </svg>
  );
}

// ============================================================
// HOOPS WORDMARK — H · basketball-O · rim+net-O · P · S
// The locked logo (Curve-in-the-O direction).
// ============================================================
function HoopsWordmark({ width = 300, hideSub = false }) {
  // full logo lives ~y32–110; crop tight to it when the subtitle is hidden
  const vb = hideSub ? { y: 30, h: 88 } : { y: 0, h: 150 };
  const h = width * (vb.h / 300);
  return (
    <svg viewBox={`0 ${vb.y} 300 ${vb.h}`} width={width} height={h} style={{ overflow: "visible", filter: "drop-shadow(0 0 14px rgba(168,85,247,0.35))" }}>
      <defs>
        <linearGradient id="hw_g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#38bdf8"/><stop offset="0.5" stopColor="#a855f7"/><stop offset="1" stopColor="#ec4899"/>
        </linearGradient>
        <radialGradient id="hw_ball" cx="38%" cy="30%">
          <stop offset="0" stopColor="#ff9d4d"/><stop offset="1" stopColor="#c2410c"/>
        </radialGradient>
      </defs>
      {/* H */}
      <path d="M22 40 L22 108 M22 74 L52 74 M52 40 L52 108" stroke="url(#hw_g)" strokeWidth="11" strokeLinecap="round" fill="none"/>
      {/* First O = basketball */}
      <circle cx="100" cy="74" r="26" fill="url(#hw_ball)" stroke="#7a2d0a" strokeWidth="1.6"/>
      <path d="M74 74 h52 M100 48 v52" stroke="rgba(0,0,0,0.5)" strokeWidth="1.6"/>
      <path d="M82 56 Q100 74 82 92 M118 56 Q100 74 118 92" stroke="rgba(0,0,0,0.4)" strokeWidth="1.3" fill="none"/>
      {/* Second O = rim + net */}
      <ellipse cx="156" cy="64" rx="24" ry="7" fill="none" stroke="#fb7f34" strokeWidth="4.5"/>
      <path d="M134 68 l4 34 M144 69 l2 36 M156 69 l0 38 M168 69 l-2 36 M178 68 l-4 34" stroke="#c084fc" strokeWidth="1.6" opacity="0.85" style={{ transformOrigin: "156px 69px", animation: "swishNet 2.6s ease-in-out infinite" }}/>
      {/* P */}
      <path d="M210 40 L210 108 M210 40 L230 40 Q246 40 246 58 Q246 76 230 76 L210 76" stroke="url(#hw_g)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      {/* S */}
      <path d="M294 50 Q294 40 280 40 Q264 40 264 55 Q264 70 280 72 Q296 74 296 90 Q296 108 280 108 Q266 108 266 98" stroke="url(#hw_g)" strokeWidth="11" strokeLinecap="round" fill="none"/>
      {/* Milestone Mapping */}
      {!hideSub && <text x="150" y="140" textAnchor="middle" fontFamily="'Oswald',sans-serif" fontWeight="600" fontSize="13" letterSpacing="7" fill="#8b7ba8">MILESTONE MAPPING</text>}
    </svg>
  );
}

function FinalScreen({ stats, players, onMenu, onReplay }) {
  const [phase, setPhase] = useState("splash");   // 'splash' -> 'report'
  const won = stats ? stats.won : true;
  useEffect(() => {
    const t = setTimeout(() => setPhase("report"), 3200);
    return () => clearTimeout(t);
  }, []);

  if (!stats) {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: BG }}>
        <button onClick={onMenu} style={{ padding: "14px 38px", borderRadius: 40, background: `linear-gradient(90deg,${V_DEEP},${V})`, border: "none", color: "#fff", fontWeight: 700 }}>MENU</button>
      </div>
    );
  }

  if (phase === "splash") return <ResultSplash won={won} stats={stats} onSkip={() => setPhase("report")} />;
  return <GameReport stats={stats} players={players} onMenu={onMenu} onReplay={onReplay} />;
}

// ===== WIN / LOSE splash — the big mind-blowing moment =====
function ResultSplash({ won, stats, onSkip }) {
  const [burst, setBurst] = useState([]);
  useEffect(() => {
    // confetti (win) or ember-fall (lose)
    const parts = [];
    for (let i = 0; i < 60; i++) {
      parts.push({ id: i, x: Math.random() * 100, delay: Math.random() * 1.4, dur: 1.8 + Math.random() * 1.8,
        c: won ? [GOLD, V_GLOW, WATER, "#ec4899", "#22d3ee"][i % 5] : ["#7c3aed", "#3a2560", "#5a3a80"][i % 3],
        size: 5 + Math.random() * 7 });
    }
    setBurst(parts);
  }, []);
  return (
    <div onClick={onSkip} style={{ position: "absolute", inset: 0, overflow: "hidden", cursor: "pointer",
      background: won ? `radial-gradient(ellipse at 50% 38%, #2a1e00 0%, #1a1030 45%, ${BG} 80%)`
                      : `radial-gradient(ellipse at 50% 40%, #1a0a1e 0%, #0e0818 55%, ${BG} 85%)` }}>
      <Ambience />
      {/* falling particles */}
      {burst.map((p) => (
        <div key={p.id} style={{ position: "absolute", top: "-6%", left: `${p.x}%`, width: p.size, height: p.size,
          borderRadius: won ? 2 : "50%", background: p.c, boxShadow: `0 0 6px ${p.c}`,
          animation: `confettiFall ${p.dur}s linear ${p.delay}s infinite` }} />
      ))}
      {/* radiating rays */}
      <div style={{ position: "absolute", top: "38%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600,
        background: `conic-gradient(from 0deg, transparent 0deg, ${won ? GOLD : V}22 12deg, transparent 24deg, ${won ? GOLD : V}22 36deg, transparent 48deg)`,
        borderRadius: "50%", animation: "spinSlow 14s linear infinite", opacity: 0.5 }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div style={{ animation: "stampIn 0.7s cubic-bezier(.2,1.4,.4,1) forwards" }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: "clamp(52px,20vw,140px)", lineHeight: 0.9,
            color: "#fff", letterSpacing: won ? "4px" : "2px",
            WebkitTextStroke: `2px ${won ? GOLD : V_DEEP}`,
            textShadow: won ? `0 0 40px ${GOLD}, 0 0 12px #fff` : `0 0 40px ${V}, 0 0 12px #fff` }}>
            {won ? "WINNER" : "GAME"}
          </div>
          {!won && <div style={{ fontFamily: "'Orbitron',monospace", fontWeight: 900, fontSize: "clamp(38px,14vw,96px)", lineHeight: 0.9, color: "#fff", WebkitTextStroke: `2px ${V_DEEP}`, textShadow: `0 0 30px ${V}` }}>OVER</div>}
        </div>
        <div style={{ marginTop: 18, fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: "clamp(15px,4.5vw,24px)", letterSpacing: "3px",
          color: won ? GOLD : V_GLOW, textShadow: `0 0 16px ${won ? GOLD : V}`, animation: "rise 0.8s 0.4s both" }}>
          {won ? "YOU BEAT THE ODDS" : "THE ODDS WON THIS ROUND"}
        </div>
        <div style={{ marginTop: 8, fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: 14, color: "#9d8bc0", letterSpacing: "1px", animation: "rise 0.8s 0.6s both", maxWidth: 320 }}>
          {won ? "Volume bent the odds. You closed the day." : "Keep knocking — the law of averages always pays the persistent."}
        </div>
        <div className="seg" style={{ marginTop: 22, fontSize: "clamp(30px,10vw,58px)", fontWeight: 900, color: "#fff", animation: "rise 0.8s 0.8s both" }}>
          {stats.score} <span style={{ color: "#6b5b88", fontSize: "0.55em" }}>—</span> {stats.oppScore}
        </div>
        <div style={{ fontSize: 11, letterSpacing: "3px", color: "#6b5b88", fontWeight: 700, marginTop: 2, animation: "rise 0.8s 0.9s both" }}>YOU · vs · THE MARKET</div>
        <div style={{ position: "absolute", bottom: 34, fontSize: 11, letterSpacing: "3px", color: "#5a5478", animation: "pulse 1.6s infinite" }}>TAP TO SEE THE BOX SCORE</div>
      </div>
    </div>
  );
}

// ===== full ESPN-style game report =====
function GameReport({ stats, players, onMenu, onReplay }) {
  const { score, oppScore, won, acc, atts, makes, cups, tally, quarters } = stats;
  const rows = [
    { id: "knock", label: "Doors Knocked", color: V },
    { id: "pitch", label: "Full Pitches",  color: "#38bdf8" },
    { id: "price", label: "Price Drops",   color: "#22d3ee" },
    { id: "close", label: "Closes / Sales",color: GREEN },
  ];
  const medal = acc >= 80 ? { t: "MVP PERFORMANCE", c: GOLD } : acc >= 60 ? { t: "ALL-STAR GAME", c: "#cbd5e1" } : acc >= 40 ? { t: "SOLID OUTING", c: "#d19a66" } : { t: "GRIND CONTINUES", c: V_GLOW };
  // build 4 quarter columns (pad if missing)
  const qs = [...(quarters || [])];
  while (qs.length < 4) qs.push(0);
  const Cell = ({ children, color, big, sub }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div className="seg" style={{ fontWeight: 900, fontSize: big ? 26 : 18, color: color || "#fff", lineHeight: 1 }}>{children}</div>
      {sub && <div style={{ fontSize: 8, color: "#6b5b88", letterSpacing: "1px", marginTop: 2 }}>{sub}</div>}
    </div>
  );
  return (
    <div style={{ position: "absolute", inset: 0, overflowY: "auto", background: `radial-gradient(ellipse at 50% 0%, #1a1030, ${BG} 60%)`, padding: "18px 14px 24px" }} className="noscroll">
      <Ambience />
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <Phoenix size={38} />
        <div>
          <div className="seg" style={{ fontWeight: 900, fontSize: 22, letterSpacing: "1px", lineHeight: 1,
            background: `linear-gradient(90deg,${WATER},${V},${"#ec4899"})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GAME REPORT</div>
          <div style={{ fontSize: 10, color: "#8b7ba8", letterSpacing: "2px", fontWeight: 700 }}>MILESTONE MAPPING · FINAL</div>
        </div>
        <div style={{ marginLeft: "auto", padding: "5px 12px", borderRadius: 8, fontWeight: 900, fontFamily: "'Orbitron',monospace",
          background: won ? `${GOLD}22` : `${V}22`, border: `1.5px solid ${won ? GOLD : V}`, color: won ? GOLD : V_GLOW, fontSize: 13, letterSpacing: "1px" }}>
          {won ? "WIN" : "LOSS"}
        </div>
      </div>

      {/* scoreline + quarter box */}
      <div style={{ background: "linear-gradient(180deg,#160c2a,#0c0718)", border: `1.5px solid ${V_DEEP}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 12 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#8b7ba8", letterSpacing: "2px", fontWeight: 700 }}>YOU</div>
            <div className="seg" style={{ fontWeight: 900, fontSize: 44, color: won ? "#fff" : "#9d8bc0", lineHeight: 1, textShadow: won ? `0 0 20px ${GOLD}66` : "none" }}>{score}</div>
          </div>
          <div style={{ fontSize: 12, color: "#6b5b88", fontWeight: 700 }}>FINAL</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#8b7ba8", letterSpacing: "2px", fontWeight: 700 }}>MARKET</div>
            <div className="seg" style={{ fontWeight: 900, fontSize: 44, color: !won ? "#fff" : "#9d8bc0", lineHeight: 1 }}>{oppScore}</div>
          </div>
        </div>
        {/* quarter-by-quarter */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(4,1fr) 1fr", gap: 6, alignItems: "center", borderTop: "1px solid rgba(168,85,247,0.2)", paddingTop: 10, fontSize: 12 }}>
          <div style={{ fontSize: 9, color: "#6b5b88", fontWeight: 700, letterSpacing: "1px" }}></div>
          {["Q1","Q2","Q3","Q4"].map((q) => <div key={q} style={{ textAlign: "center", fontSize: 9, color: "#6b5b88", fontWeight: 700 }}>{q}</div>)}
          <div style={{ textAlign: "center", fontSize: 9, color: "#6b5b88", fontWeight: 700 }}>T</div>
          <div style={{ fontWeight: 700, color: V_GLOW, fontSize: 11 }}>YOU</div>
          {qs.map((v, i) => <div key={i} className="seg" style={{ textAlign: "center", fontWeight: 900, color: "#fff", fontSize: 14 }}>{Math.max(0, Math.round(v))}</div>)}
          <div className="seg" style={{ textAlign: "center", fontWeight: 900, color: GOLD, fontSize: 14 }}>{score}</div>
        </div>
      </div>

      {/* headline stat grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 12 }}>
        {[["PTS", score, "#fff"], ["FG%", `${acc}%`, medal.c], ["MADE", `${makes}/${atts}`, V_GLOW], ["CUPS", cups, WATER]].map(([l, v, c]) => (
          <div key={l} style={{ background: "#0c0718", border: "1px solid rgba(168,85,247,0.25)", borderRadius: 12, padding: "10px 4px", textAlign: "center" }}>
            <div style={{ fontSize: 8, color: "#6b5b88", letterSpacing: "1px", fontWeight: 700 }}>{l}</div>
            <div className="seg" style={{ fontWeight: 900, fontSize: 20, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* medal banner */}
      <div style={{ textAlign: "center", margin: "4px 0 14px" }}>
        <span className="seg" style={{ fontWeight: 900, fontSize: 18, letterSpacing: "2px", color: medal.c, textShadow: `0 0 16px ${medal.c}88` }}>🏆 {medal.t}</span>
      </div>

      {/* personal records */}
      {stats.records && (
        <div style={{ background: "linear-gradient(180deg,#1a1200,#0c0718)", border: `1.5px solid ${GOLD}55`, borderRadius: 14, padding: "12px 14px", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Oswald',sans-serif", fontSize: 10, letterSpacing: "2px", color: GOLD, fontWeight: 700, marginBottom: 10, textAlign: "center" }}>🔥 PERSONAL RECORDS</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
            {[
              { lbl: "MOST DOORS", val: stats.records.knock, pr: stats.beat && stats.beat.knock },
              { lbl: "MOST SALES", val: stats.records.close, pr: stats.beat && stats.beat.close },
              { lbl: "MOST NAMES", val: stats.records.names, pr: stats.beat && stats.beat.names },
              { lbl: "TOP SCORE",  val: stats.records.score, pr: stats.beat && stats.beat.score },
            ].map((r) => (
              <div key={r.lbl} style={{ background: r.pr ? `${GOLD}18` : "#0c0718", border: `1px solid ${r.pr ? GOLD : "rgba(168,85,247,0.2)"}`, borderRadius: 10, padding: "8px 6px", textAlign: "center", position: "relative" }}>
                {r.pr && <span style={{ position: "absolute", top: -8, right: -6, background: GOLD, color: "#111", fontSize: 7, fontWeight: 900, padding: "1px 5px", borderRadius: 6, fontFamily: "'Oswald',sans-serif", letterSpacing: "0.5px", boxShadow: `0 0 8px ${GOLD}` }}>NEW!</span>}
                <div style={{ fontSize: 8, color: "#8b7ba8", letterSpacing: "1px", fontWeight: 700 }}>{r.lbl}</div>
                <div className="seg" style={{ fontWeight: 900, fontSize: 20, color: r.pr ? GOLD : "#fff" }}>{r.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* per-action box score */}
      <div style={{ background: "#0c0718", border: "1px solid rgba(168,85,247,0.25)", borderRadius: 14, padding: "12px 14px", marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "8px 14px", alignItems: "center", fontSize: 13 }}>
          <div style={{ fontSize: 9, letterSpacing: "1px", color: "#6b5b88", fontWeight: 700 }}>STAT LEADERS</div>
          <div style={{ fontSize: 9, letterSpacing: "1px", color: "#6b5b88", fontWeight: 700, textAlign: "right" }}>MADE / ATT</div>
          <div style={{ fontSize: 9, letterSpacing: "1px", color: "#6b5b88", fontWeight: 700, textAlign: "right" }}>%</div>
          {rows.map((r) => {
            const t = tally[r.id]; const pct = t.a ? Math.round((t.m / t.a) * 100) : 0;
            return (
              <React.Fragment key={r.id}>
                <div style={{ fontWeight: 700, color: r.color }}>{r.label}</div>
                <div className="seg" style={{ textAlign: "right", fontWeight: 900 }}>{t.m}<span style={{ color: "#6b5b88" }}>/{t.a}</span></div>
                <div className="seg" style={{ textAlign: "right", color: r.color }}>{pct}%</div>
              </React.Fragment>
            );
          })}
          <div style={{ fontWeight: 700, color: "#fff", borderTop: "1px solid rgba(168,85,247,0.2)", paddingTop: 8 }}>Names Collected</div>
          <div className="seg" style={{ textAlign: "right", fontWeight: 900, borderTop: "1px solid rgba(168,85,247,0.2)", paddingTop: 8 }}>{tally.names}</div>
          <div style={{ borderTop: "1px solid rgba(168,85,247,0.2)" }} />
        </div>
      </div>

      {/* looking ahead */}
      <div style={{ textAlign: "center", color: V_GLOW, fontSize: 12, letterSpacing: "1px", fontWeight: 700, marginBottom: 16 }}>
        {won ? "STAY LOCKED IN. RUN IT BACK AND STACK ANOTHER WIN." : "THE ODDS FAVOR THE PERSISTENT. GO AGAIN."}
      </div>

      {/* actions */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onReplay} style={{ flex: 1, padding: 14, borderRadius: 12, background: `linear-gradient(90deg,${V_DEEP},${V})`, border: "none", color: "#fff", fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: "2px", cursor: "pointer", boxShadow: "0 0 20px rgba(168,85,247,0.5)" }}>RUN IT BACK</button>
        <button onClick={onMenu} style={{ flex: 1, padding: 14, borderRadius: 12, background: "rgba(168,85,247,0.1)", border: `1.5px solid ${V}`, color: "#fff", fontFamily: "'Oswald',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: "2px", cursor: "pointer" }}>MENU</button>
      </div>
    </div>
  );
}

import React, { useCallback, useEffect, useRef, useState } from "react";
import { GameIcon } from "../door/GameIcons.jsx";
import {
  createChase, stepChase, ditchPoloInChase, flashHz,
  stepSegway, willTipOver, hideMagnet,
} from "./chaseSim.js";
import { CHASE, SEGWAY, HIDES } from "../heat/heatTuning.js";
import {
  sfxSirenLoop, sfxRotorLoop, sfxSegwayWhine, sfxRadioChatter, sfxSpotted,
  sfxWhoosh, sfxImpact, sfxBuzzer,
} from "../../../lib/sfx.js";
import { tapLight, buzzWarning, slamHeavy } from "../../../lib/haptics.js";

/* ════════════════════════════════════════════════════════════════════════
   THE CHASE — 2 AM, a motorised Segway, and a wanted level.

   All the rules live in chaseSim.js and were proven headless. This file is
   presentation and input only, and it obeys three laws:

   1 · POSITIONS NEVER GO THROUGH REACT. The pursuer LIST is state and changes
       only when the star tier does; their x, their cone length and the rep's
       lean are written straight onto refs each frame. Passing positions as
       props is the single most reliable way to turn this into 20fps.

   2 · THREE TOUCH TARGETS, NO MODES. Lean left, lean right, and one context
       button whose verb is derived from what you're standing next to. Octodad's
       post-mortem is explicit that mode-switching was the thing that never
       worked and automatic detection from intent was the fix.

   3 · THE ASSIST IS INVISIBLE. Ducking into cover is magnetised. The wobble is
       the comedy; the SUCCESS is assisted. Awkward must never mean unfair.
   ════════════════════════════════════════════════════════════════════════ */

const WORLD_W = 2480;
const REP_SCREEN = 0.38;

/* Cover, spread down the block. Overshooting one is the entire pressure of the
   chase, which is why they are far enough apart to make the roll matter. */
const HIDE_SPOTS = [
  { id: "h0", kind: "hedge", x: 340 },
  { id: "h1", kind: "garage", x: 760 },
  { id: "h2", kind: "mailbox", x: 1180 },
  { id: "h3", kind: "potty", x: 1580 },
  { id: "h4", kind: "hedge", x: 1980 },
  { id: "h5", kind: "garage", x: 2320 },
];

function SearchCone({ kind }) {
  return (
    <svg className={`dc-cone dc-cone--${kind}`} viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={`dcCone-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9ecbff" stopOpacity=".38" />
          <stop offset="1" stopColor="#9ecbff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M50 0 100 60H0z" fill={`url(#dcCone-${kind})`} />
    </svg>
  );
}

function Pursuer({ kind }) {
  if (kind === "cruiser") {
    return (
      <svg className="dc-unit dc-unit--cruiser" viewBox="0 0 120 60" aria-hidden>
        <path d="M6 40h108v14H6z" fill="#1a2338" />
        <path d="M18 22h84l12 18H6z" fill="#22304d" />
        <path d="M30 25h26v13H26zM64 25h26l8 13H64z" fill="#8fb8d8" opacity=".55" />
        <rect className="dc-lightbar dc-lightbar--r" x="42" y="14" width="16" height="7" rx="2" fill="#ff3b30" />
        <rect className="dc-lightbar dc-lightbar--b" x="62" y="14" width="16" height="7" rx="2" fill="#3a7bff" />
        <circle cx="30" cy="54" r="7" fill="#0b0e18" />
        <circle cx="92" cy="54" r="7" fill="#0b0e18" />
      </svg>
    );
  }
  if (kind === "drone") {
    return (
      <svg className="dc-unit dc-unit--drone" viewBox="0 0 80 50" aria-hidden>
        <path d="M14 18h52v12H14z" fill="#2a3348" />
        <path d="M4 14h20v3H4zM56 14h20v3H56z" fill="#39435e" />
        <circle className="dc-rotor" cx="14" cy="12" r="11" fill="#8fb8d8" opacity=".25" />
        <circle className="dc-rotor" cx="66" cy="12" r="11" fill="#8fb8d8" opacity=".25" />
        <circle cx="40" cy="32" r="5" fill="#ff3b30" className="dc-eye" />
      </svg>
    );
  }
  return (
    <svg className="dc-unit dc-unit--foot" viewBox="0 0 40 80" aria-hidden>
      <circle cx="20" cy="12" r="9" fill="#c98f6b" />
      <path d="M10 7h20l-2-4H12z" fill="#1b2a45" />
      <path d="M11 22h18v26H11z" fill="#1b2a45" />
      <path d="M13 48h6v28h-6zM21 48h6v28h-6z" fill="#141b2c" />
      <circle cx="27" cy="28" r="2.5" fill="#c8a24a" />
    </svg>
  );
}

export default function ChaseScene({ startStars = 1, spawnX = 1200, onEnd }) {
  const [tick, setTick] = useState(0);            // forces a re-render on TIER change only
  const [stars, setStars] = useState(startStars);
  const [mode, setMode] = useState("spotted");
  const [nearSpot, setNearSpot] = useState(null);
  const [hidden, setHidden] = useState(false);
  const [tipped, setTipped] = useState(false);
  const [banner, setBanner] = useState(null);

  const simRef = useRef(null);
  const worldRef = useRef(null);
  const repRef = useRef(null);
  const unitRefs = useRef({});
  const xRef = useRef(spawnX);
  const vRef = useRef(0);
  const dirRef = useRef(0);
  const hiddenRef = useRef(false);
  const tipUntil = useRef(0);
  const vwRef = useRef(typeof window === "undefined" ? 360 : window.innerWidth);
  const sirenRef = useRef(null);
  const rotorRef = useRef(null);
  const whineRef = useRef(null);
  const endedRef = useRef(false);

  if (!simRef.current) {
    simRef.current = createChase({ stars: startStars, worldW: WORLD_W, playerX: spawnX, now: performance.now() });
  }

  /* ── audio beds ─────────────────────────────────────────────────────── */
  useEffect(() => {
    sirenRef.current = sfxSirenLoop();
    whineRef.current = sfxSegwayWhine();
    sfxRadioChatter();
    return () => {
      if (sirenRef.current) sirenRef.current.stop();
      if (rotorRef.current) rotorRef.current.stop();
      if (whineRef.current) whineRef.current.stop();
    };
  }, []);

  useEffect(() => {
    const measure = () => { vwRef.current = window.innerWidth; };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const finish = useCallback((outcome, s) => {
    if (endedRef.current) return;
    endedRef.current = true;
    if (sirenRef.current) sirenRef.current.stop();
    if (outcome === "caught") { slamHeavy(); sfxBuzzer(); }
    else { tapLight(); sfxWhoosh(); }
    setBanner(outcome === "caught" ? "BUSTED" : "LOST THEM");
    window.setTimeout(() => onEnd && onEnd({
      outcome,
      stars: s.stars,
      fine: outcome === "caught" ? (CHASE.fineByStar[s.stars] || 0) : 0,
    }), 1500);
  }, [onEnd]);

  /* ── the loop ────────────────────────────────────────────────────────── */
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let lastMode = "spotted";
    let lastStars = startStars;

    const frame = (t) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.064, (t - last) / 1000);
      last = t;
      const s = simRef.current;
      if (s.outcome) return;

      /* segway physics — velocity, never position. Low decel is what makes you
         overshoot every hide spot, and overshooting is the whole game. */
      const now = t;
      const stunned = now < tipUntil.current;
      const dir = stunned ? 0 : dirRef.current;
      if (!stunned && willTipOver(vRef.current, dir)) {
        tipUntil.current = now + SEGWAY.tipStunMs;
        vRef.current = 0;
        setTipped(true);
        window.setTimeout(() => setTipped(false), SEGWAY.tipStunMs);
        slamHeavy(); sfxImpact(5);
      } else {
        vRef.current = stepSegway(vRef.current, dir, dt);
      }

      // invisible magnet toward cover you're already heading for
      const near = HIDE_SPOTS.reduce((best, sp) =>
        Math.abs(sp.x - xRef.current) < Math.abs((best ? best.x : 1e9) - xRef.current) ? sp : best, null);
      const inRange = near && Math.abs(near.x - xRef.current) < HIDES.magnetRangePx;
      if (inRange) vRef.current = hideMagnet(vRef.current, xRef.current, near.x, dt);

      xRef.current = Math.max(40, Math.min(WORLD_W - 40, xRef.current + vRef.current * dt));

      const spot = inRange ? near : null;
      setNearSpot((p) => (p && spot && p.id === spot.id ? p : spot));
      const isHidden = hiddenRef.current && !!spot;
      const partial = isHidden && HIDES.kinds[spot.kind].partial;

      stepChase(s, dt, { playerX: xRef.current, playerY: 0, hidden: isHidden, hidePartial: partial }, now);

      /* paint — refs only, never state */
      const cam = -(xRef.current - vwRef.current * REP_SCREEN);
      if (worldRef.current) worldRef.current.style.setProperty("--cam", `${cam}px`);
      if (repRef.current) {
        const lean = (vRef.current / SEGWAY.maxSpeed) * SEGWAY.leanMaxDeg;
        const wob = Math.sin(now / 1000 * SEGWAY.wobbleHz * Math.PI * 2) * 2.4 * (Math.abs(vRef.current) / SEGWAY.maxSpeed);
        repRef.current.style.transform =
          `translate3d(${xRef.current}px,0,0) rotate(${(stunned ? 78 : lean + wob).toFixed(2)}deg)`;
      }
      for (const p of s.pursuers) {
        const el = unitRefs.current[p.id];
        if (!el) continue;
        el.style.transform = `translate3d(${p.x}px,0,0) scaleX(${p.facing})`;
        el.style.setProperty("--cone-len", `${p.coneLen}px`);
        el.dataset.alert = p.alert > 0.5 ? "1" : "0";
      }

      if (whineRef.current) whineRef.current.setSpeed(Math.abs(vRef.current) / SEGWAY.maxSpeed);
      if (sirenRef.current) sirenRef.current.setUrgency(s.mode === "spotted" ? 1 : 0.35);

      // the drone only exists at 4 stars — spin its rotors up when it arrives
      const hasDrone = s.pursuers.some((p) => p.kind === "drone");
      if (hasDrone && !rotorRef.current) rotorRef.current = sfxRotorLoop();
      if (!hasDrone && rotorRef.current) { rotorRef.current.stop(); rotorRef.current = null; }

      if (s.mode !== lastMode) {
        lastMode = s.mode;
        setMode(s.mode);
        if (s.mode === "spotted") { buzzWarning(); sfxSpotted(); sfxRadioChatter(); }
      }
      if (s.stars !== lastStars) { lastStars = s.stars; setStars(s.stars); setTick((n) => n + 1); }
      if (s.outcome) finish(s.outcome, s);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── input: three targets, no modes ──────────────────────────────────── */
  const press = (d) => { dirRef.current = d; };
  const release = () => { dirRef.current = 0; };
  const bind = (d) => ({
    onPointerDown: (e) => { e.currentTarget.setPointerCapture?.(e.pointerId); press(d); },
    onPointerUp: release, onPointerCancel: release, onPointerLeave: release,
  });

  const context = () => {
    const s = simRef.current;
    if (nearSpot) {
      const next = !hiddenRef.current;
      hiddenRef.current = next;
      setHidden(next);
      tapLight();
      return;
    }
    if (hiddenRef.current && ditchPoloInChase(s, true, performance.now())) {
      setStars(s.stars);
      setBanner("POLO IN THE HEDGE");
      window.setTimeout(() => setBanner(null), 1400);
    }
  };

  const contextLabel = nearSpot
    ? (hidden ? "COME OUT" : HIDES.kinds[nearSpot.kind].label)
    : (hidden ? "DITCH POLO" : "");

  const s = simRef.current;
  const hz = flashHz(s);

  return (
    <div className={`dc dc--${mode} ${hidden ? "is-hidden" : ""}`}>
      <div className="dc-world" ref={worldRef}>
        <div className="dc-band dc-band--far" />
        <div className="dc-band dc-band--mid">
          {HIDE_SPOTS.map((sp) => (
            <span key={sp.id} className={`dc-hide dc-hide--${sp.kind}`} style={{ left: `${sp.x}px` }} aria-hidden />
          ))}
          {s.pursuers.map((p) => (
            <span
              key={p.id}
              className={`dc-pursuer dc-pursuer--${p.kind}`}
              ref={(el) => { unitRefs.current[p.id] = el; }}
            >
              <SearchCone kind={p.kind} />
              <Pursuer kind={p.kind} />
            </span>
          ))}
          <span className={`dc-rep ${tipped ? "is-tipped" : ""} ${hidden ? "is-tucked" : ""}`} ref={repRef}>
            <svg viewBox="0 0 40 90" aria-hidden>
              <circle cx="20" cy="10" r="8" fill="#e8c9a8" />
              <path d="M12 20h16v24H12z" fill={s.poloDitched ? "#d8d2c6" : "#1d6a4a"} />
              <path d="M14 44h5v22h-5zM21 44h5v22h-5z" fill="#2a3348" />
              <path d="M18 66h4v14h-4z" fill="#39435e" />
              <circle cx="20" cy="84" r="6" fill="#0b0e18" />
              <path d="M13 84h14" stroke="#5b6577" strokeWidth="2" />
            </svg>
          </span>
        </div>
        <div className="dc-band dc-band--near" />
      </div>

      <div className="dc-hud">
        <span className="dc-stars" style={{ "--hz": hz ? `${1 / hz}s` : "0s" }}>
          {Array.from({ length: CHASE.maxStars }, (_, i) => (
            <GameIcon key={i} name="star" size={17} className={i < stars ? "is-on" : ""} />
          ))}
        </span>
        <span className="dc-state">{mode === "spotted" ? "SPOTTED" : mode === "searching" ? "SEARCHING" : ""}</span>
      </div>

      {banner && <div className="dc-banner">{banner}</div>}
      {tipped && <div className="dc-tip">YOU ATE THE PAVEMENT</div>}

      <div className="dc-ctl">
        <button className="dc-btn" {...bind(-1)} aria-label="Lean left">
          <GameIcon name="chev" size={22} className="is-flip" />
        </button>
        <button className="dc-btn dc-btn--ctx" onPointerDown={context} disabled={!contextLabel}>
          {contextLabel || "—"}
        </button>
        <button className="dc-btn" {...bind(1)} aria-label="Lean right">
          <GameIcon name="chev" size={22} />
        </button>
      </div>
    </div>
  );
}

import React, { useMemo, useRef, useState } from "react";
import "../../../styles/drain-swamp.css";
import { SwampStage, Eyebrow, Heading, Lead, Science, Primary, Ghost, Chips, Fireflies } from "./swampShell.jsx";

/* ════════════════════════════════════════════════════════════════════════
   DRAIN THE SWAMP — cinematic signature mode.

   A polluted swamp fills the frame. The player grips an industrial valve
   wheel and slowly turns it open. Every degree of rotation drains the
   water, lifts the fog, breaks the light through, and wakes the plants —
   stress literally leaves the landscape while they breathe out.

   The whole environment is driven by ONE custom property (--p, 0→1) set
   imperatively from pointer events, so the scene runs at 60fps with zero
   React re-renders mid-turn. React state changes only at story beats.

   Contract: { onBack, onComplete } like every swamp mode; no free text,
   so no safety scan is needed here.
   ════════════════════════════════════════════════════════════════════════ */

const TURNS = 6; // full wheel rotations to open the gate
const TOTAL_RAD = TURNS * Math.PI * 2;
const MAX_STEP = 0.045; // rad per pointer event — enforces a slow, deliberate open

const SOURCES = [
  { id: "work", emoji: "💼", label: "Work" },
  { id: "people", emoji: "🗣️", label: "People" },
  { id: "money", emoji: "💸", label: "Money" },
  { id: "health", emoji: "🫀", label: "Body & health" },
  { id: "everything", emoji: "🌊", label: "Everything at once" },
  { id: "unknown", emoji: "🌫️", label: "Can't name it yet" },
];

const FEELINGS = [
  { id: "lighter", emoji: "🪶", label: "Lighter" },
  { id: "calmer", emoji: "🌿", label: "Calmer" },
  { id: "clearer", emoji: "💠", label: "Clearer" },
  { id: "steadier", emoji: "⚓", label: "Steadier" },
  { id: "heavy", emoji: "🪨", label: "Still heavy — honest" },
];

const BEATS = [
  { at: 0.0, line: "Grip the wheel. Turn slowly — one long exhale per pull." },
  { at: 0.12, line: "The gate groans open. The black water starts to move." },
  { at: 0.3, line: "The level is dropping. The fog is thinning out." },
  { at: 0.5, line: "Halfway. Let your shoulders drop with the water." },
  { at: 0.7, line: "Light is breaking through. Green things are waking up." },
  { at: 0.88, line: "Nearly clear. Last slow turns — stay with the breath." },
];

function beatIndexFor(p) {
  let idx = 0;
  for (let i = 0; i < BEATS.length; i++) if (p >= BEATS[i].at) idx = i;
  return idx;
}

function buzz(pattern) {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch {
    /* no haptics */
  }
}

/* Dead tree that greens up as --p rises (foliage opacity lives in CSS). */
function Tree({ flip = false, className = "" }) {
  return (
    <svg
      className={`dts-tree ${className}`}
      viewBox="0 0 100 140"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden
    >
      <path
        className="dts-tree__wood"
        d="M48 140 L46 96 Q45 84 36 76 L20 60 L34 68 Q44 74 46 66 L47 40 L42 22 L49 34 L52 12 L55 34 L62 20 L57 44 Q56 60 64 58 L82 46 L68 62 Q56 72 55 86 L54 140 Z"
      />
      <g className="dts-tree__leaves">
        <circle cx="30" cy="56" r="17" />
        <circle cx="52" cy="24" r="19" />
        <circle cx="74" cy="46" r="15" />
        <circle cx="50" cy="46" r="14" />
      </g>
    </svg>
  );
}

/* The industrial valve wheel (SVG, rotated via --rot). */
function ValveWheel() {
  return (
    <svg className="dts-wheel__svg" viewBox="0 0 120 120" aria-hidden>
      <defs>
        <linearGradient id="dts-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7de8cf" />
          <stop offset="0.5" stopColor="#1e6b58" />
          <stop offset="1" stopColor="#0b3b2e" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="50" fill="none" stroke="url(#dts-rim)" strokeWidth="9" />
      <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(0,255,191,0.35)" strokeWidth="1.5" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <g key={a} transform={`rotate(${a} 60 60)`}>
          <rect x="57.2" y="14" width="5.6" height="46" rx="2.8" fill="url(#dts-rim)" />
          <circle cx="60" cy="12" r="5" fill="#0e4a3a" stroke="rgba(0,255,191,0.5)" strokeWidth="1.4" />
        </g>
      ))}
      <circle cx="60" cy="60" r="15" fill="#0b2e24" stroke="rgba(0,255,191,0.65)" strokeWidth="2" />
      <circle cx="60" cy="60" r="5.5" fill="rgba(0,255,191,0.85)" />
    </svg>
  );
}

/* The living scene. Everything reads --p (0..1) from the scene element. */
function SwampScene({ sceneRef, wheelHandlers, wheelRef, draining, initialP = 0 }) {
  return (
    <div
      className={`dts-scene ${draining ? "is-live" : ""}`}
      ref={sceneRef}
      style={{ "--p": initialP, "--rot": initialP * TOTAL_RAD }}
    >
      {/* sky: clear dawn beneath, murk cross-fading away above it */}
      <div className="dts-sky dts-sky--clear" />
      <div className="dts-sky dts-sky--murky" />
      <div className="dts-sun" />
      <div className="dts-rays" />

      {/* birds return near the end */}
      <span className="dts-bird dts-bird--a" aria-hidden>🕊️</span>
      <span className="dts-bird dts-bird--b" aria-hidden>🕊️</span>

      {/* treeline */}
      <Tree className="dts-tree--l" />
      <Tree className="dts-tree--r" flip />

      {/* riverbed + flora revealed as water falls */}
      <div className="dts-bed" />
      <div className="dts-flora" aria-hidden>
        {[
          { e: "🌱", t: 0.45 }, { e: "🌿", t: 0.55 }, { e: "🌸", t: 0.68 },
          { e: "🌼", t: 0.76 }, { e: "🦋", t: 0.84 }, { e: "🌷", t: 0.9 },
          { e: "🍀", t: 0.6 }, { e: "🌺", t: 0.8 },
        ].map((f, i) => (
          <i key={i} style={{ "--t": f.t, "--fi": i }}>{f.e}</i>
        ))}
      </div>

      {/* water: murky body scales down, clear water fades in beneath the surface */}
      <div className="dts-water">
        <div className="dts-water__clear" />
        <div className="dts-water__murky" />
        <div className="dts-water__shimmer" />
        <div className="dts-debris" aria-hidden>
          <span style={{ "--dxi": 0 }}>🪵</span>
          <span style={{ "--dxi": 1 }}>🥾</span>
          <span style={{ "--dxi": 2 }}>🛞</span>
          <span style={{ "--dxi": 3 }}>🪣</span>
        </div>
      </div>

      {/* fog banks */}
      <div className="dts-fog dts-fog--a" />
      <div className="dts-fog dts-fog--b" />

      {/* floodgate + outflow */}
      <div className="dts-gate">
        <div className="dts-gate__frame" />
        <div className="dts-gate__door" />
        <div className="dts-gate__flow" />
      </div>

      {/* the wheel */}
      <div
        className="dts-wheel"
        ref={wheelRef}
        role="slider"
        aria-label="Floodgate valve — turn clockwise to drain the swamp"
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        {...wheelHandlers}
      >
        <ValveWheel />
      </div>

      <div className="dts-vignette" />
    </div>
  );
}

export default function DrainTheSwamp({ onBack, onComplete }) {
  const [phase, setPhase] = useState("arrive"); // arrive | drain | clear
  const [source, setSource] = useState(null);
  const [before, setBefore] = useState(6);
  const [after, setAfter] = useState(3);
  const [feeling, setFeeling] = useState(null);
  const [beat, setBeat] = useState(0);
  const [pct, setPct] = useState(0); // coarse display % (updates ~per beat, cheap)

  const sceneRef = useRef(null);
  const wheelRef = useRef(null);
  const pRef = useRef(0);
  const lastAngle = useRef(null);
  const doneRef = useRef(false);

  const sourceLabel = useMemo(() => (SOURCES.find((s) => s.id === source) || {}).label, [source]);

  const apply = (nextP) => {
    pRef.current = nextP;
    const el = sceneRef.current;
    if (el) {
      el.style.setProperty("--p", String(nextP));
      el.style.setProperty("--rot", String(nextP * TOTAL_RAD));
    }
    const idx = beatIndexFor(nextP);
    setBeat((prev) => {
      if (idx !== prev) buzz(10);
      return idx;
    });
    setPct((prev) => {
      const coarse = Math.floor(nextP * 20) * 5; // 5% steps — cheap re-render cadence
      return coarse !== prev ? coarse : prev;
    });
    if (nextP >= 1 && !doneRef.current) {
      doneRef.current = true;
      buzz([28, 50, 28, 50, 60]);
      window.setTimeout(() => setPhase("clear"), 1400);
    }
  };

  const angleAt = (e) => {
    const rect = wheelRef.current.getBoundingClientRect();
    return Math.atan2(e.clientY - (rect.top + rect.height / 2), e.clientX - (rect.left + rect.width / 2));
  };

  const wheelHandlers = {
    onPointerDown: (e) => {
      if (doneRef.current) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      lastAngle.current = angleAt(e);
    },
    onPointerMove: (e) => {
      if (lastAngle.current == null || doneRef.current) return;
      const a = angleAt(e);
      let d = a - lastAngle.current;
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      lastAngle.current = a;
      if (d <= 0) return; // clockwise opens the gate
      apply(Math.min(1, pRef.current + Math.min(d, MAX_STEP) / TOTAL_RAD));
    },
    onPointerUp: () => { lastAngle.current = null; },
    onPointerCancel: () => { lastAngle.current = null; },
    onKeyDown: (e) => {
      if (doneRef.current) return;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        apply(Math.min(1, pRef.current + 0.12 / TOTAL_RAD * Math.PI * 2));
      }
    },
    "aria-valuenow": pct,
  };

  const reset = () => {
    doneRef.current = false;
    pRef.current = 0;
    setBeat(0);
    setPct(0);
    setFeeling(null);
    setPhase("drain");
    // scene remounts via key below, so vars start clean
  };

  const seal = () => {
    const feelLabel = (FEELINGS.find((f) => f.id === feeling) || {}).label || "Lighter";
    const what = sourceLabel ? `"${sourceLabel}"` : "the flood";
    onComplete(
      `Drained the swamp — ${what} · intensity ${before}→${after} · left feeling ${feelLabel.toLowerCase()}`
    );
  };

  /* ── ARRIVE ── */
  if (phase === "arrive") {
    return (
      <SwampStage title="Drain the Swamp" onClose={onBack}>
        <div className="sv-center">
          <Eyebrow>Stress Zone · Signature</Eyebrow>
          <Heading>Drain the Swamp</Heading>
          <Lead>
            Stress pools like flood-water — it doesn't drain on its own. <b>Someone has to open the gate.</b>{" "}
            Name what's flooding you, then turn the valve and watch it leave the landscape.
          </Lead>
          <Science>
            Naming the stressor first (affect labeling) measurably calms the amygdala, and the slow
            exhales you'll pace with each turn engage the vagal brake. The relief is real, not decorative.
          </Science>
          <Chips options={SOURCES} value={source} onChange={setSource} />
          <div className="dts-rate">
            <span className="dts-rate__label">How flooded are you right now?</span>
            <div className="sv-intensity">
              <input type="range" min="1" max="10" value={before} onChange={(e) => setBefore(Number(e.target.value))} />
              <span className="sv-intensity__num">{before}</span>
            </div>
          </div>
          <Primary onClick={() => setPhase("drain")} disabled={!source}>Open the floodgate →</Primary>
        </div>
      </SwampStage>
    );
  }

  /* ── CLEAR ── */
  if (phase === "clear") {
    return (
      <SwampStage title="Drain the Swamp" onClose={onBack}>
        <div className="sv-pane">
          <SwampScene sceneRef={sceneRef} wheelRef={wheelRef} wheelHandlers={{}} draining={false} initialP={1} />
          <div className="sv-center" style={{ position: "relative" }}>
            <Fireflies />
            <Eyebrow>Gate open · Water clear</Eyebrow>
            <Heading>The swamp is clear.</Heading>
            <Lead>
              Same place — different water. You drained <b>{sourceLabel || "the flood"}</b> instead of
              carrying it. Where's the level now?
            </Lead>
            <div className="sv-intensity">
              <input type="range" min="1" max="10" value={after} onChange={(e) => setAfter(Number(e.target.value))} />
              <span className="sv-intensity__num">{after}</span>
            </div>
            <Chips options={FEELINGS} value={feeling} onChange={setFeeling} sm />
            <Primary onClick={seal}>Seal it →</Primary>
            <Ghost onClick={reset}>Drain another</Ghost>
          </div>
        </div>
      </SwampStage>
    );
  }

  /* ── DRAIN ── */
  return (
    <SwampStage title="Drain the Swamp" onClose={onBack}>
      <div className="sv-pane">
        <div className="dts-hud">
          <span className="dts-hud__label">Draining{sourceLabel ? `: ${sourceLabel}` : ""}</span>
          <span className="dts-hud__pct">{pct}%</span>
        </div>
        <SwampScene key="live" sceneRef={sceneRef} wheelRef={wheelRef} wheelHandlers={wheelHandlers} draining />
        <p className="dts-beat" key={beat}>{BEATS[beat].line}</p>
      </div>
    </SwampStage>
  );
}

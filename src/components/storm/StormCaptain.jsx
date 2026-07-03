import React, { useEffect, useMemo, useRef, useState } from "react";
import { coachLine } from "./stormData.js";
import { scanForRisk, SafetyScreen } from "../shadow/swamp/safety.jsx";
import {
  sfxZap,
  sfxThunder,
  sfxHorn,
  sfxImpact,
  sfxWhoosh,
  sfxRainbow,
  sfxRainLoop,
  sfxWindLoop,
} from "../../lib/sfx";
import "./StormCaptain.css";

/* ════════════════════════════════════════════════════════════════════════
   STORM CAPTAIN — overwhelm, rebuilt as a ride.

   Overwhelm isn't forty problems. It's one storm made of noise. In here the
   noise takes shape: every "EVERYTHING IS URGENT" thought rides in as a
   storm cloud. You STRIKE each one down with lightning (naming/defusion),
   which charges the horn — and when it's full you HOLD it and ROAR the
   whole wave apart (discharge). Three waves, each louder and faster.
   Then the sea goes calm and you pick ONE clean action, because that's
   what a captain does after a storm: sails somewhere, on purpose.

   Contract: { onClose, onComplete } — hub awards XP; payload carries
   { action, insight } like the old voyage did.
   ════════════════════════════════════════════════════════════════════════ */

const THOUGHTS = [
  "EVERYTHING IS URGENT",
  "You're behind",
  "Inbox: 247",
  "They're ALL waiting on you",
  "Do it ALL now",
  "No time to think",
  "You forgot something",
  "It's too much",
  "One more thing…",
  "DEADLINE. DEADLINE.",
  "The phone won't stop",
  "If you rest, you lose",
  "Should've started sooner",
  "Everyone needs an answer",
];

const WAVES = [
  { label: "Wave 1 · The Squall", strikes: 5, driftMs: 15000, spawnMs: 2400, rain: 0.1, wind: 0.12, thunder: 2 },
  { label: "Wave 2 · The Gale", strikes: 7, driftMs: 11500, spawnMs: 1800, rain: 0.18, wind: 0.18, thunder: 3 },
  { label: "Wave 3 · The Big One", strikes: 9, driftMs: 8500, spawnMs: 1300, rain: 0.28, wind: 0.24, thunder: 5 },
];

const STORM_NAMES = [
  { id: "work", emoji: "💼", label: "Work is a tsunami" },
  { id: "money", emoji: "💸", label: "Money weather" },
  { id: "people", emoji: "🗣️", label: "Everyone wants a piece" },
  { id: "life", emoji: "🌊", label: "All of it at once" },
];

const ROAR_HOLD_MS = 900;

function buzz(pattern) {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch {
    /* no haptics */
  }
}

let cloudSeq = 0;

/* ── the ship: simple SVG sloop that rocks with the storm ── */
function Ship() {
  return (
    <svg className="stc-ship__svg" viewBox="0 0 120 100" aria-hidden>
      <path d="M14 72 L106 72 L92 92 L28 92 Z" fill="#132433" stroke="rgba(0,240,255,.5)" strokeWidth="2" />
      <rect x="57" y="18" width="4" height="54" rx="2" fill="#1d3448" />
      <path d="M61 20 Q92 38 61 60 Z" fill="rgba(0,240,255,.35)" stroke="rgba(0,240,255,.65)" strokeWidth="1.5" />
      <path d="M55 26 Q34 42 55 58 Z" fill="rgba(255,255,255,.14)" stroke="rgba(0,240,255,.4)" strokeWidth="1.2" />
      <circle cx="59" cy="14" r="3.4" fill="#FFD84D" />
    </svg>
  );
}

export default function StormCaptain({ onClose, onComplete }) {
  const [phase, setPhase] = useState("brief"); // brief | ride | calm
  const [stormFor, setStormFor] = useState(null);
  const [wave, setWave] = useState(0);
  const [clouds, setClouds] = useState([]); // {id, text, x, dur, struck}
  const [roar, setRoar] = useState(0); // strikes banked this wave
  const [roaring, setRoaring] = useState(false);
  const [interlude, setInterlude] = useState(null); // coach line between waves
  const [action, setAction] = useState("");
  const [risk, setRisk] = useState(null);

  const struckTotal = useRef(0);
  const slammed = useRef(0);
  const timers = useRef([]);
  const spawnTimer = useRef(null);
  const thunderTimer = useRef(null);
  const rainLoop = useRef(null);
  const windLoop = useRef(null);
  const holdRef = useRef({ t: null, held: false });
  const sceneRef = useRef(null);
  const shipRef = useRef(null);
  const flashRef = useRef(null);
  const waveRef = useRef(0);
  const roarRef = useRef(0);
  const phaseRef = useRef("brief");

  const insight = useMemo(() => coachLine(Math.floor(Math.random() * 1000)), []);

  const t = (fn, ms) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  };

  const stopLoops = () => {
    rainLoop.current?.stop();
    windLoop.current?.stop();
    rainLoop.current = null;
    windLoop.current = null;
    if (spawnTimer.current) clearInterval(spawnTimer.current);
    if (thunderTimer.current) clearInterval(thunderTimer.current);
  };

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    stopLoops();
  }, []);

  const retrigger = (el, cls) => {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  };

  /* ── cloud lifecycle ── */
  const spawnCloud = () => {
    if (phaseRef.current !== "ride") return;
    const w = WAVES[waveRef.current];
    setClouds((prev) => {
      if (prev.length >= 5) return prev; // screen budget — they respawn anyway
      const id = cloudSeq++;
      return [
        ...prev,
        {
          id,
          text: THOUGHTS[id % THOUGHTS.length],
          x: 6 + ((id * 29) % 62), // % across the sky
          dur: w.driftMs + ((id * 631) % 2400),
        },
      ];
    });
  };

  const strike = (id) => {
    let landed = false;
    setClouds((prev) => {
      const hit = prev.find((c) => c.id === id && !c.struck);
      if (!hit) return prev;
      landed = true;
      return prev.map((c) => (c.id === id ? { ...c, struck: true } : c));
    });
    if (!landed) return;
    sfxZap();
    buzz([8, 24]);
    retrigger(flashRef.current, "is-zap");
    struckTotal.current += 1;
    roarRef.current += 1;
    setRoar(roarRef.current);
    t(() => setClouds((prev) => prev.filter((c) => c.id !== id)), 650);
  };

  const cloudLanded = (id) => {
    // a thought reached the ship: no fail, but the boat FEELS it
    slammed.current += 1;
    sfxImpact(2 + waveRef.current);
    buzz([24, 40, 24]);
    retrigger(shipRef.current, "is-slammed");
    setClouds((prev) => prev.filter((c) => c.id !== id));
  };

  /* ── waves ── */
  const startWave = (idx) => {
    const w = WAVES[idx];
    waveRef.current = idx;
    roarRef.current = 0;
    setWave(idx);
    setRoar(0);
    setClouds([]);
    setInterlude(null);
    rainLoop.current?.setLevel(w.rain);
    windLoop.current?.setLevel(w.wind);
    sfxThunder(w.thunder);
    retrigger(flashRef.current, "is-live");
    if (spawnTimer.current) clearInterval(spawnTimer.current);
    spawnTimer.current = setInterval(spawnCloud, w.spawnMs);
    spawnCloud();
    if (thunderTimer.current) clearInterval(thunderTimer.current);
    thunderTimer.current = setInterval(() => {
      if (phaseRef.current !== "ride") return;
      sfxThunder(WAVES[waveRef.current].thunder);
      retrigger(flashRef.current, "is-live");
    }, 6500 - idx * 1500);
  };

  const startRide = () => {
    phaseRef.current = "ride";
    setPhase("ride");
    struckTotal.current = 0;
    slammed.current = 0;
    rainLoop.current = sfxRainLoop();
    windLoop.current = sfxWindLoop();
    startWave(0);
  };

  /* ── the ROAR ── */
  const roarReady = phase === "ride" && roar >= WAVES[wave].strikes;

  const roarStart = (e) => {
    if (!roarReady || roaring) return;
    e.preventDefault();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ok */ }
    sfxWhoosh();
    holdRef.current.held = true;
    holdRef.current.t = t(() => {
      if (!holdRef.current.held) return;
      unleashRoar();
    }, ROAR_HOLD_MS);
  };
  const roarEnd = () => {
    holdRef.current.held = false;
    if (holdRef.current.t) clearTimeout(holdRef.current.t);
  };

  const unleashRoar = () => {
    setRoaring(true);
    sfxHorn(1);
    buzz([30, 60, 30, 60, 90]);
    retrigger(sceneRef.current, "is-shocked");
    // the roar blasts every remaining cloud off the screen
    setClouds((prev) => prev.map((c) => ({ ...c, struck: true })));
    t(() => setClouds([]), 600);
    if (spawnTimer.current) clearInterval(spawnTimer.current);

    const nextIdx = waveRef.current + 1;
    t(() => {
      setRoaring(false);
      if (nextIdx < WAVES.length) {
        setInterlude(coachLine(Math.floor(Math.random() * 1000)));
        sfxThunder(2);
        t(() => startWave(nextIdx), 2600);
      } else {
        // storm broken — the sea goes quiet
        phaseRef.current = "calm";
        stopLoops();
        sfxRainbow();
        setPhase("calm");
      }
    }, 1200);
  };

  const seal = () => {
    const scan = scanForRisk(action);
    if (scan.risk) {
      setRisk(scan.kind);
      return;
    }
    onComplete({
      action: action.trim() || null,
      insight,
      struck: struckTotal.current,
      slammed: slammed.current,
    });
  };

  if (risk) return <SafetyScreen kind={risk} onClose={() => setRisk(null)} />;

  /* ── BRIEF ── */
  if (phase === "brief") {
    return (
      <div className="stc-stage">
        <div className="stc-top">
          <button className="stc-back" onClick={onClose}>← Gym</button>
          <span className="stc-top__title">Storm Captain</span>
        </div>
        <div className="stc-brief">
          <p className="stc-eyebrow">Anger Gym · Overwhelm Ride</p>
          <h2 className="stc-heading">Overwhelm isn&rsquo;t 40 problems.<br />It&rsquo;s one storm made of noise.</h2>
          <p className="stc-lead">
            Every &ldquo;do it ALL now&rdquo; thought is about to ride in as a storm cloud.
            <b> Strike each one down with lightning.</b> Strikes charge the horn — when it&rsquo;s full,
            hold it and <b>ROAR the whole wave apart</b>. Three waves. Each one louder. Then: calm water.
          </p>
          <div className="stc-science">
            <span className="stc-science__tag">Why this works</span>
            Overwhelm collapses everything into one giant threat. Splitting it into single, nameable
            thoughts (defusion) and striking them ONE at a time re-teaches your brain the only truth
            that matters in a storm: it&rsquo;s always one wave at a time. The roar is discharge —
            the breath your body has been holding.
          </div>
          <p className="stc-asklabel">What&rsquo;s the storm today?</p>
          <div className="stc-chips">
            {STORM_NAMES.map((s) => (
              <button
                key={s.id}
                className={`stc-chip ${stormFor === s.id ? "is-on" : ""}`}
                onClick={() => setStormFor(s.id)}
              >
                <span>{s.emoji}</span> {s.label}
              </button>
            ))}
          </div>
          <button className="stc-primary" disabled={!stormFor} onClick={startRide}>
            Take the helm →
          </button>
        </div>
      </div>
    );
  }

  /* ── CALM ── */
  if (phase === "calm") {
    return (
      <div className="stc-stage">
        <div className="stc-top">
          <button className="stc-back" onClick={onClose}>← Gym</button>
          <span className="stc-top__title">Storm Captain</span>
        </div>
        <div className="stc-scene is-calm" ref={sceneRef}>
          <div className="stc-sky" />
          <div className="stc-sunrays" />
          <div className="stc-sea">
            <div className="stc-waveband stc-waveband--1" />
            <div className="stc-waveband stc-waveband--2" />
            <div className="stc-waveband stc-waveband--3" />
          </div>
          <div className="stc-ship is-calm" ref={shipRef}><Ship /></div>
          <span className="stc-gull" aria-hidden>🕊️</span>
        </div>
        <div className="stc-seal">
          <h2 className="stc-heading">The storm broke. You didn&rsquo;t.</h2>
          <div className="stc-stats">
            <div className="stc-stat"><b>{struckTotal.current}</b><span>thoughts struck down</span></div>
            <div className="stc-stat"><b>3</b><span>waves roared apart</span></div>
            <div className="stc-stat"><b>{slammed.current}</b><span>hits taken · still afloat</span></div>
          </div>
          <p className="stc-coach">🧭 &ldquo;{insight}&rdquo;</p>
          <p className="stc-asklabel">A captain leaves a storm ON PURPOSE. One clean action — what is it?</p>
          <input
            className="stc-action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder="e.g. Write the ONE email that matters, then close the laptop"
            maxLength={80}
          />
          <button className="stc-primary" onClick={seal}>Sail on →</button>
        </div>
      </div>
    );
  }

  /* ── RIDE ── */
  const w = WAVES[wave];
  return (
    <div className="stc-stage">
      <div className="stc-top">
        <button className="stc-back" onClick={onClose}>← Gym</button>
        <span className="stc-top__title">Storm Captain</span>
        <span className="stc-wavetag">{w.label}</span>
      </div>

      <div className={`stc-scene is-storm-${wave + 1}`} ref={sceneRef}>
        <div className="stc-sky" />
        <div className="stc-flash" ref={flashRef} aria-hidden />
        <div className="stc-rain" aria-hidden />

        {/* the noise, given shape */}
        <div className="stc-clouds">
          {clouds.map((c) => (
            <button
              key={c.id}
              className={`stc-cloud ${c.struck ? "is-struck" : ""}`}
              style={{ "--cx": `${c.x}%`, "--dur": `${c.dur}ms` }}
              onPointerDown={() => strike(c.id)}
              onAnimationEnd={(e) => {
                if (e.animationName === "stcDrift" && !c.struck) cloudLanded(c.id);
              }}
            >
              {/* death anim lives on the inner span so the drift never resets */}
              <span className="stc-cloud__inner">
                <span className="stc-cloud__puff" aria-hidden />
                <span className="stc-cloud__text">{c.text}</span>
                <span className="stc-cloud__bolt" aria-hidden>⚡</span>
              </span>
            </button>
          ))}
        </div>

        {/* sea + ship */}
        <div className="stc-sea">
          <div className="stc-waveband stc-waveband--1" />
          <div className="stc-waveband stc-waveband--2" />
          <div className="stc-waveband stc-waveband--3" />
        </div>
        <div className={`stc-ship is-rock-${wave + 1}`} ref={shipRef}><Ship /></div>

        {/* shockwave ring, retriggered by the roar via .is-shocked on the scene */}
        <div className="stc-shockwave" aria-hidden />

        {/* between-wave coach line */}
        {interlude && <p className="stc-interlude">🧭 &ldquo;{interlude}&rdquo;</p>}
      </div>

      {/* HUD: roar meter + horn */}
      <div className="stc-hud">
        <div className="stc-roar">
          <span className="stc-roar__label">Horn charge</span>
          <div className="stc-roar__track">
            <div
              className={`stc-roar__fill ${roarReady ? "is-ready" : ""}`}
              style={{ transform: `scaleX(${Math.min(1, roar / w.strikes)})` }}
            />
          </div>
          <span className="stc-roar__num">{Math.min(roar, w.strikes)}/{w.strikes}</span>
        </div>
        <button
          className={`stc-horn ${roarReady ? "is-ready" : ""} ${roaring ? "is-roaring" : ""}`}
          onPointerDown={roarStart}
          onPointerUp={roarEnd}
          onPointerCancel={roarEnd}
          disabled={!roarReady || roaring}
        >
          {roaring ? "ROOOOAR" : roarReady ? "HOLD TO ROAR 📢" : "Strike the thoughts ⚡"}
        </button>
        <p className="stc-hint">
          {roarReady
            ? "Horn's full. Hold it down and blow this wave off the water."
            : "Tap every dark thought out of the sky. Each strike charges the horn."}
        </p>
      </div>
    </div>
  );
}

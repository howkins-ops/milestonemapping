import React, { useCallback, useEffect, useRef, useState } from "react";
import "../../styles/door-route.css";
import "../../styles/door-art.css";
import DoorLevel from "./DoorLevel.jsx";
import { DOOR_LEVELS, getDoorLevel } from "./doorLevels.js";
import { loadCampaign, recordClear, isCleared as slugCleared, isUnlocked as orderUnlocked } from "./doorCampaignStore.js";
import HeatMeter from "./heat/HeatMeter.jsx";
import { loadHeat } from "./heat/heatStore.js";
import "../../styles/door-heat.css";
import { IconSheet, GameIcon } from "./door/GameIcons.jsx";
import { sfxFootstep, sfxDoorChime, sfxWhoosh, sfxRoundBell } from "../../lib/sfx.js";
import { tapLight } from "../../lib/haptics.js";

/* ════════════════════════════════════════════════════════════════════════
   THE ROUTE — the overworld.

   Replaces the level-select menu with a street you actually walk. You have a
   territory; the houses on it are the levels. Walk the block, pick a porch,
   and the camera dollies in until the door fills the frame.

   Three parallax bands (skyline 0.15× · houses 1× · foreground 1.6×) scrolled
   by the rep's world position. The block escalates with your progress: clear
   more houses and the sky runs from morning to 3 AM, so the world darkens
   around you as the game gets meaner.

   Progress lives in doorCampaignStore.js, keyed by level SLUG rather than by
   ladder position, so the roster can be reordered without lying to anyone
   about which fights they've won. A legacy save migrates on first load.
   ════════════════════════════════════════════════════════════════════════ */

const WORLD_W = 2480;             // world units across the whole block
const REP_SCREEN = 0.36;          // where the rep sits horizontally, 0..1
const WALK_SPEED = 300;           // world units / second
const NEAR = 130;                 // how close a path has to be to be enterable

/* Each house sits at a world x and names the level slug behind its door. The
   gate straddles the street before the gated house — walking into it IS the
   breach, which is that level's first round. */
const HOUSES = [
  { id: "first", x: 260, variant: "bungalow", number: "12" },
  { id: "steele", x: 660, variant: "big", number: "9" },
  { id: "persist", x: 1060, variant: "twostorey", number: "7" },
  { id: "steel", x: 1700, variant: "gated", number: "7" },
  { id: "callback", x: 2180, variant: "big", number: "3" },
];
const GATE_X = 1460;
/* The gate stays shut until the level behind it is reachable. Derived, not a
   hardcoded 3 — the ladder is allowed to move underneath this. */
const GATED_SLUG = "steel";

/* Sky states, indexed by how far you've got. The block itself gets later. */
const SKIES = [
  { key: "morning", top: "#7fb2d8", bot: "#dfe6ea", sun: "#fff3cf", light: 1 },
  { key: "noon", top: "#5f9fd4", bot: "#c9dbe6", sun: "#fffaf0", light: 1 },
  { key: "dusk", top: "#3a2f5e", bot: "#e0714a", sun: "#ffc46b", light: .75 },
  { key: "night", top: "#0a0a1c", bot: "#1c1030", sun: "#cfd8ff", light: .35 },
];

/* Progress lives in doorCampaignStore.js, keyed by slug. */
const ORDER_OF = Object.fromEntries(DOOR_LEVELS.map((l) => [l.id, l.order]));

/* ── house art ────────────────────────────────────────────────────────── */
function House({ variant, number, cleared, locked, lit }) {
  const wall = { bungalow: "#8a7a63", twostorey: "#6f6e78", gated: "#5b6470", big: "#7a5a4a" }[variant];
  const roof = { bungalow: "#4a3b2c", twostorey: "#33323c", gated: "#2c333c", big: "#3d2a20" }[variant];
  const tall = variant === "twostorey" || variant === "big";

  return (
    <svg className={`dr-house dr-house--${variant} ${cleared ? "is-cleared" : ""} ${locked ? "is-locked" : ""}`} viewBox="0 0 220 210" aria-hidden focusable="false">
      <defs>
        <linearGradient id={`dr-wall-${variant}`} x1="0" y1="0" x2=".4" y2="1">
          <stop offset="0" stopColor={wall} />
          <stop offset="1" stopColor="#00000066" />
        </linearGradient>
        <pattern id={`dr-sid-${variant}`} width="10" height="9" patternUnits="userSpaceOnUse">
          <path d="M0 8.5h10" stroke="#00000022" strokeWidth="1" />
        </pattern>
      </defs>

      {/* roof */}
      <path d={tall ? "M6 74 110 12 214 74z" : "M10 96 110 44 210 96z"} fill={roof} />
      <path d={tall ? "M6 74 110 12 214 74z" : "M10 96 110 44 210 96z"} fill="none" stroke="#00000055" strokeWidth="2" />
      <rect x={tall ? 6 : 10} y={tall ? 72 : 94} width={tall ? 208 : 200} height="7" rx="2" fill="#00000066" />

      {/* chimney */}
      <rect x="158" y={tall ? 26 : 58} width="16" height={tall ? 30 : 26} fill={roof} />

      {/* facade */}
      <rect x={tall ? 18 : 22} y={tall ? 78 : 100} width={tall ? 184 : 176} height={tall ? 118 : 96} fill={`url(#dr-wall-${variant})`} />
      <rect x={tall ? 18 : 22} y={tall ? 78 : 100} width={tall ? 184 : 176} height={tall ? 118 : 96} fill={`url(#dr-sid-${variant})`} />

      {/* upstairs windows */}
      {tall && [42, 96, 150].map((x) => (
        <g key={x}>
          <rect x={x} y="88" width="28" height="30" rx="1.5" fill={lit ? "#ffca6e" : "#2b3440"} stroke="#2a2118" strokeWidth="2.4" />
          <path d={`M${x + 14} 88v30M${x} 103h28`} stroke="#2a2118" strokeWidth="1.8" />
        </g>
      ))}

      {/* downstairs windows */}
      {[36, 148].map((x) => (
        <g key={x}>
          <rect x={x} y={tall ? 138 : 118} width="34" height="34" rx="1.5" fill={lit ? "#ffca6e" : "#2b3440"} stroke="#2a2118" strokeWidth="2.6" />
          <path d={`M${x + 17} ${tall ? 138 : 118}v34M${x} ${tall ? 155 : 135}h34`} stroke="#2a2118" strokeWidth="2" />
        </g>
      ))}

      {/* the door — the thing you're actually here for */}
      <g className="dr-house__door">
        <rect x="94" y={tall ? 132 : 116} width="34" height={tall ? 64 : 80} rx="2" fill="#5a3116" stroke="#2a1206" strokeWidth="2.6" />
        <rect x="100" y={tall ? 140 : 124} width="22" height={tall ? 22 : 30} rx="1.5" fill="#6d3d1d" />
        <rect x="100" y={tall ? 168 : 162} width="22" height={tall ? 20 : 28} rx="1.5" fill="#6d3d1d" />
        <circle cx="122" cy={tall ? 166 : 158} r="2.4" fill="#d8b45a" />
      </g>

      {/* porch light */}
      <g className={`dr-house__light ${lit ? "is-on" : ""}`}>
        <rect x="82" y={tall ? 128 : 112} width="7" height="11" rx="2" fill="#3a3226" />
        <circle cx="85.5" cy={tall ? 140 : 124} r="4" fill={lit ? "#ffd97a" : "#4a4234"} />
      </g>

      {/* number plate */}
      <rect x="134" y={tall ? 128 : 112} width="20" height="11" rx="2" fill="#2f2a22" />
      <text x="144" y={tall ? 137 : 121} textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="800" fontSize="9" fill="#d8cdb4">{number}</text>

      {/* boards, if this one isn't yours yet */}
      {locked && (
        <g className="dr-house__boards">
          <rect x="86" y={tall ? 142 : 130} width="52" height="9" rx="2" fill="#6b4a2c" transform="rotate(-8 112 146)" stroke="#3a2716" strokeWidth="1.4" />
          <rect x="86" y={tall ? 168 : 164} width="52" height="9" rx="2" fill="#6b4a2c" transform="rotate(7 112 172)" stroke="#3a2716" strokeWidth="1.4" />
        </g>
      )}
    </svg>
  );
}

/* SIGNED yard sign — the block remembers what you closed. */
function YardSign() {
  return (
    <svg className="dr-sign" viewBox="0 0 60 56" aria-hidden focusable="false">
      <rect x="27" y="22" width="4" height="34" fill="#5c5148" />
      <rect x="4" y="6" width="52" height="26" rx="3" fill="#00A86B" stroke="#046b45" strokeWidth="2.4" />
      <text x="30" y="18" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="900" fontSize="10" fill="#fff">SIGNED</text>
      <text x="30" y="27" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="700" fontSize="6" fill="#cdf3e2">BY THE KID</text>
    </svg>
  );
}

function Mailbox({ flagUp }) {
  return (
    <svg className="dr-mailbox" viewBox="0 0 40 54" aria-hidden focusable="false">
      <rect x="17" y="22" width="6" height="32" fill="#4c4238" />
      <path d="M4 12a12 10 0 0 1 24 0v12H4z" fill="#5b6470" stroke="#2f353d" strokeWidth="2" />
      <rect x="4" y="22" width="24" height="4" fill="#3d444d" />
      <g className={`dr-mailbox__flag ${flagUp ? "is-up" : ""}`}>
        <rect x="28" y="8" width="3" height="16" fill="#c0392b" />
        <rect x="28" y="8" width="9" height="7" fill="#c0392b" />
      </g>
    </svg>
  );
}

/* The gated-community wall + gate that straddles the street. */
function StreetGate({ breached }) {
  return (
    <svg className={`dr-gate ${breached ? "is-breached" : ""}`} viewBox="0 0 260 200" aria-hidden focusable="false">
      <defs>
        {/* real chain-link: two crossing zig-zags, the interlocked-helix look */}
        <pattern id="dr-mesh" width="18" height="18" patternUnits="userSpaceOnUse">
          <path d="M0 0 9 9 0 18M9 9 18 0M9 9 18 18" fill="none" stroke="#aab4c0" strokeWidth="1.7" opacity=".85" />
        </pattern>
      </defs>

      {/* brick piers */}
      {[0, 218].map((x) => (
        <g key={x}>
          <rect x={x} y="30" width="42" height="164" fill="#6b3f2e" />
          <g stroke="#00000055" strokeWidth="1.2">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((r) => <path key={r} d={`M${x} ${44 + r * 20}h42`} />)}
          </g>
          <rect x={x - 4} y="22" width="50" height="12" rx="2" fill="#7d4c38" />
        </g>
      ))}

      {/* chain-link panels */}
      <rect x="42" y="52" width="176" height="142" fill="url(#dr-mesh)" />
      <rect x="42" y="52" width="176" height="6" fill="#8f99a6" />
      <rect x="42" y="188" width="176" height="6" fill="#8f99a6" />
      <path d="M96 52v142M164 52v142" stroke="#8f99a6" strokeWidth="4" />

      {/* barbed wire, angled out at 45° */}
      <g stroke="#9aa4b0" strokeWidth="1.8" fill="none">
        <path d="M42 52 28 34M96 52 82 34M164 52 150 34M218 52 204 34" />
        <path d="M28 34h176M28 40h176M28 28h176" opacity=".8" />
      </g>
      <g stroke="#9aa4b0" strokeWidth="2.6">
        {Array.from({ length: 15 }, (_, i) => <path key={i} d={`M${34 + i * 12} 26v16`} opacity=".7" />)}
      </g>

      {/* iron gate leaves with spear finials */}
      <g className="dr-gate__leaves">
        <g className="dr-gate__leaf dr-gate__leaf--l">
          {[100, 110, 120, 130].map((x) => (
            <g key={x}>
              <rect x={x} y="72" width="4" height="120" fill="#2b3038" />
              <path d={`M${x - 2} 72 ${x + 2} 62 ${x + 6} 72z`} fill="#2b3038" />
            </g>
          ))}
          <rect x="98" y="92" width="40" height="5" fill="#2b3038" />
          <rect x="98" y="164" width="40" height="5" fill="#2b3038" />
        </g>
        <g className="dr-gate__leaf dr-gate__leaf--r">
          {[140, 150, 160].map((x) => (
            <g key={x}>
              <rect x={x} y="72" width="4" height="120" fill="#2b3038" />
              <path d={`M${x - 2} 72 ${x + 2} 62 ${x + 6} 72z`} fill="#2b3038" />
            </g>
          ))}
          <rect x="138" y="92" width="28" height="5" fill="#2b3038" />
          <rect x="138" y="164" width="28" height="5" fill="#2b3038" />
        </g>
      </g>

      {/* chain + padlock */}
      {!breached && (
        <g className="dr-gate__lock">
          {Array.from({ length: 7 }, (_, i) => (
            <ellipse key={i} cx={122 + i * 6} cy="128" rx="4" ry="2.6" fill="none" stroke="#8d959f" strokeWidth="2" />
          ))}
          <rect x="126" y="132" width="14" height="12" rx="2.5" fill="#c8a02e" />
          <path d="M129 132v-4a4 4 0 0 1 8 0v4" fill="none" stroke="#8d959f" strokeWidth="2.4" />
        </g>
      )}

      {/* the callbox on its post */}
      <g className="dr-gate__callbox">
        <rect x="228" y="118" width="5" height="76" fill="#4c525a" />
        <rect x="216" y="88" width="30" height="42" rx="4" fill="#aeb6c0" stroke="#5b626c" strokeWidth="2" />
        <rect x="220" y="92" width="22" height="12" rx="2" fill="#1b2733" />
        <g fill="#5b626c">
          {[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => (
            <circle key={`${r}${c}`} cx={224 + c * 7} cy={110 + r * 5} r="1.8" />
          )))}
        </g>
        <circle className="dr-gate__led" cx="242" cy="94" r="2" fill="#ff3b3b" />
      </g>

      {/* NO SOLICITING */}
      <g transform="rotate(-4 130 120)">
        <rect x="104" y="106" width="52" height="26" rx="2" fill="#FFD84D" stroke="#14100a" strokeWidth="2" />
        <text x="130" y="117" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="900" fontSize="8" fill="#14100a">NO</text>
        <text x="130" y="127" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="900" fontSize="7" fill="#14100a">SOLICITING</text>
      </g>
    </svg>
  );
}

/* ── the rep ──────────────────────────────────────────────────────────── */
function Rep({ walking, dir }) {
  return (
    <svg className={`dr-rep ${walking ? "is-walking" : ""}`} viewBox="0 0 60 110" style={{ transform: `scaleX(${dir})` }} aria-hidden focusable="false">
      {/* the sample bag over the shoulder */}
      <g className="dr-rep__bag">
        <rect x="30" y="52" width="24" height="20" rx="3" fill="#6b4a2c" stroke="#3a2716" strokeWidth="1.8" />
        <path d="M30 56 L20 42" stroke="#3a2716" strokeWidth="2.6" />
      </g>
      {/* legs — a real 6-pose cycle driven by CSS */}
      <g className="dr-rep__leg dr-rep__leg--b"><rect x="26" y="74" width="9" height="30" rx="4" fill="#25304a" /></g>
      <g className="dr-rep__leg dr-rep__leg--f"><rect x="26" y="74" width="9" height="30" rx="4" fill="#31405f" /></g>
      {/* body */}
      <path d="M18 42h24l4 34H14z" fill="#3a4e70" stroke="#1d2a44" strokeWidth="2" />
      <path d="M30 42v34" stroke="#1d2a44" strokeWidth="1.4" opacity=".6" />
      {/* arms */}
      <g className="dr-rep__arm dr-rep__arm--b"><rect x="12" y="44" width="8" height="26" rx="4" fill="#31405f" /></g>
      <g className="dr-rep__arm dr-rep__arm--f"><rect x="40" y="44" width="8" height="26" rx="4" fill="#3a4e70" /></g>
      {/* head */}
      <circle cx="30" cy="30" r="13" fill="#e0ae90" stroke="#8a563c" strokeWidth="1.8" />
      <path d="M17 26q4 -14 13 -14t13 14q-6 -6 -13 -6t-13 6z" fill="#33291f" />
      <circle cx="35" cy="30" r="1.9" fill="#1a1a1a" />
      {/* the clipboard */}
      <rect x="44" y="62" width="13" height="17" rx="1.6" fill="#d8cdb4" stroke="#6b5a3a" strokeWidth="1.4" />
      <path d="M46 66h9M46 70h9M46 74h6" stroke="#8a7a5a" strokeWidth="1.2" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
export default function TheRoute({ onClose, onComplete }) {
  const [state, setState] = useState(loadCampaign);
  // Re-read on every return from a level: heat is written by the gallery and
  // the chase, which live outside this component's state entirely.
  const [heat, setHeat] = useState(() => loadHeat().heat);
  const [playing, setPlaying] = useState(null);
  const [dollying, setDollying] = useState(null);
  const [near, setNear] = useState(null);
  const [walking, setWalking] = useState(0);        // -1 | 0 | 1
  // Facing and the gate hint are the ONLY things his position feeds into the
  // render, so they're state that changes on a threshold — never per frame.
  const [facing, setFacing] = useState(1);          // -1 | 1
  const [atGate, setAtGate] = useState(false);

  const xRef = useRef(120);
  const dirRef = useRef(1);
  const rafRef = useRef(0);
  const lastRef = useRef(0);
  const stepRef = useRef(0);
  const worldRef = useRef(null);
  const stageRef = useRef(null);
  const vwRef = useRef(typeof window === "undefined" ? 360 : window.innerWidth);

  const maxOrder = state.maxOrder;
  const isUnlocked = (slug) => orderUnlocked(state, ORDER_OF[slug] ?? Infinity);
  const isCleared = (slug) => slugCleared(state, slug);

  // The block gets later as you close doors — the street itself keeps score.
  const clearedCount = HOUSES.filter((h) => isCleared(h.id)).length;
  const sky = SKIES[Math.min(SKIES.length - 1, clearedCount)];
  const gateOpen = isUnlocked(GATED_SLUG);

  /* ── the walk loop ───────────────────────────────────────────────────────
     Writes --cam and --rep-x straight to the DOM. It must NOT re-render: at
     four houses a per-frame render was survivable, at ten houses plus yard
     props and a chase it is not. Only threshold crossings reach React. */
  const paint = useCallback((nx) => {
    if (worldRef.current) {
      worldRef.current.style.setProperty("--cam", `${-(nx - vwRef.current * REP_SCREEN)}px`);
      worldRef.current.style.setProperty("--rep-x", `${nx}px`);
    }
  }, []);

  const step = useCallback((t) => {
    rafRef.current = requestAnimationFrame(step);
    const dt = Math.min(64, t - (lastRef.current || t)) / 1000;
    lastRef.current = t;
    if (!walking) return;

    let nx = xRef.current + walking * WALK_SPEED * dt;
    // the gate is a wall until you've unlocked the house behind it
    const wall = gateOpen ? WORLD_W : GATE_X - 60;
    nx = Math.max(40, Math.min(wall, nx));
    xRef.current = nx;
    dirRef.current = walking;
    setFacing((prev) => (prev === walking ? prev : walking));

    // footsteps on a stride timer, not per frame
    stepRef.current += Math.abs(walking) * dt;
    if (stepRef.current > 0.32) {
      stepRef.current = 0;
      sfxFootstep(Math.random() < 0.5);
    }

    paint(nx);

    // which porch am I standing on?
    let hit = null;
    for (const h of HOUSES) {
      if (Math.abs(h.x - nx) < NEAR && (ORDER_OF[h.id] ?? Infinity) <= maxOrder) { hit = h; break; }
    }
    setNear((prev) => (prev && hit && prev.id === hit.id ? prev : hit));

    const gateNear = !gateOpen && nx > GATE_X - 200;
    setAtGate((prev) => (prev === gateNear ? prev : gateNear));
  }, [walking, maxOrder, gateOpen, paint]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [step]);

  // Viewport width, measured once and on resize — never read per frame, since
  // touching window.innerWidth inside the loop forces layout every tick.
  useEffect(() => {
    const el = stageRef.current;
    const measure = () => {
      vwRef.current = window.innerWidth;
      paint(xRef.current);
    };
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const ro = new ResizeObserver(measure);
    if (el) ro.observe(el);
    return () => ro.disconnect();
  }, [paint]);

  // put the camera in the right place on mount and after a level
  useEffect(() => {
    if (playing || dollying) return;
    paint(xRef.current);
    let hit = null;
    for (const h of HOUSES) if (Math.abs(h.x - xRef.current) < NEAR && isUnlocked(h.id)) { hit = h; break; }
    setNear(hit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, dollying, paint]);

  // No ambient bed on the street. The wind loop was a bandpass swept over noise —
  // the exact recipe for ocean surf — and it washed under the whole route.
  // The footsteps, chimes and bells carry the scene on their own.

  /* ── approach: dolly the camera into the porch ───────────────────────── */
  const approach = (house) => {
    if (!isUnlocked(house.id)) return;
    tapLight();
    sfxWhoosh();
    setWalking(0);
    setDollying(house);
    window.setTimeout(() => {
      sfxRoundBell();
      const lv = getDoorLevel(house.id);
      if (lv) setPlaying(lv);
      setDollying(null);
    }, 900);
  };

  const finish = (payload) => {
    setState((prev) => recordClear(prev, payload.level));
    setHeat(loadHeat().heat);
    setPlaying(null);
    sfxDoorChime();
    onComplete(payload);
  };

  if (playing) {
    return <DoorLevel level={playing} onClose={() => setPlaying(null)} onComplete={finish} />;
  }

  return (
    <div className="dr-stage" ref={stageRef} style={{ "--sky-t": sky.top, "--sky-b": sky.bot, "--sun": sky.sun, "--daylight": sky.light }}>
      <IconSheet />

      <div className="dr-top">
        <button className="dg-back" onClick={onClose}>← Anger Gym</button>
        <span className="dr-top__title">THE ROUTE</span>
        <HeatMeter heat={heat} />
        <span className="dr-top__score">{clearedCount}/{HOUSES.length} CLOSED</span>
      </div>

      <div className={`dr-world ${dollying ? "is-dollying" : ""}`} ref={worldRef} style={dollying ? { "--focus": `${dollying.x}px` } : undefined}>
        {/* ── sky ──────────────────────────────────────────────────────── */}
        <div className="dr-sky">
          <span className="dr-sun" />
          {sky.key === "night" && <span className="dr-stars" />}
        </div>

        {/* ── band 1: distant skyline, 0.15× ───────────────────────────── */}
        <div className="dr-band dr-band--far">
          <svg viewBox="0 0 800 120" preserveAspectRatio="none" aria-hidden>
            <path d="M0 120V72h40V50h30v22h44V38h34v34h48V58h38v14h46V44h36v28h50V62h42v10h48V46h34v26h60v48z" fill="#0000002e" />
          </svg>
        </div>

        {/* ── band 2: the block itself, 1× ─────────────────────────────── */}
        <div className="dr-band dr-band--mid">
          {/* the lawns + sidewalk run the full width */}
          <div className="dr-lawn" />
          <div className="dr-walk" />

          {HOUSES.map((h) => {
            const unlocked = isUnlocked(h.id);
            const cleared = isCleared(h.id);
            return (
              <div key={h.id} className="dr-lot" style={{ left: `${h.x}px` }}>
                <House variant={h.variant} number={h.number} cleared={cleared} locked={!unlocked} lit={cleared || sky.light < .6} />
                <div className="dr-path" />
                <span className="dr-mailpost"><Mailbox flagUp={cleared} /></span>
                {cleared && <span className="dr-signpost"><YardSign /></span>}
                {unlocked && !cleared && (
                  <span className="dr-lot__tag">
                    <GameIcon name="door" size={12} /> {getDoorLevel(h.id)?.when || ""}
                  </span>
                )}
                {!unlocked && <span className="dr-lot__lock">NOT YOUR TERRITORY YET</span>}
              </div>
            );
          })}

          {/* the gated community straddles the street */}
          <div className="dr-gatelot" style={{ left: `${GATE_X}px` }}>
            <StreetGate breached={gateOpen} />
            {!gateOpen && <span className="dr-gatelot__tag">CLOSE #7 FIRST</span>}
          </div>

          {/* the rep — position comes from --rep-x, not from a style prop */}
          <div className="dr-repslot">
            <Rep walking={!!walking} dir={facing} />
            <span className="dr-repshadow" />
          </div>
        </div>

        {/* ── band 3: foreground hedge, 1.6× ───────────────────────────── */}
        <div className="dr-band dr-band--near">
          <svg viewBox="0 0 1200 90" preserveAspectRatio="none" aria-hidden>
            <path d="M0 90V44q40-22 82 0t84-6 86 10 84-14 88 8 86-4 84 12 88-10 86 6 84-8 88 14 80-6v48z" fill="#132a16" />
            <path d="M0 90V52q40-18 82 0t84-4 86 8 84-10 88 6 86-2 84 10 88-8 86 4 84-6 88 12 80-4v42z" fill="#1c3a20" opacity=".8" />
          </svg>
        </div>

        {/* the curb the whole street stands on */}
        <div className="dr-curb" />
      </div>

      {/* ── controls ────────────────────────────────────────────────────── */}
      <div className="dr-hud">
        <button
          className={`dr-walkbtn ${walking === -1 ? "is-on" : ""}`}
          onPointerDown={() => setWalking(-1)}
          onPointerUp={() => setWalking(0)}
          onPointerLeave={() => setWalking(0)}
          onPointerCancel={() => setWalking(0)}
          aria-label="Walk left"
        ><GameIcon name="chev" size={22} className="is-flip" /></button>

        {near ? (
          <button className="dr-knockbtn" onClick={() => approach(near)}>
            <GameIcon name="fist" size={18} />
            {isCleared(near.id) ? `RUN #${near.number} AGAIN` : `WORK #${near.number}`}
          </button>
        ) : (
          <span className="dr-hint">
            {atGate
              ? "The gate's locked. Close #7 and you'll have a reason to climb it."
              : "Walk the block. Stop at a porch."}
          </span>
        )}

        <button
          className={`dr-walkbtn ${walking === 1 ? "is-on" : ""}`}
          onPointerDown={() => setWalking(1)}
          onPointerUp={() => setWalking(0)}
          onPointerLeave={() => setWalking(0)}
          onPointerCancel={() => setWalking(0)}
          aria-label="Walk right"
        ><GameIcon name="chev" size={22} /></button>
      </div>
    </div>
  );
}

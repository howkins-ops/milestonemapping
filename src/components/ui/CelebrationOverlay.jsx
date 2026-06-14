import React, { useEffect, useMemo } from "react";
import Button from "./Button.jsx";
import { useAppData } from "../../hooks/useAppData.js";

const VARIANT_META = {
  day:           { emblem: "⚔️",  color: "",                      cta: "Keep Building" },
  milestone:     { emblem: "💎",  color: "celebration--gold",     cta: "Claim the Moment" },
  project:       { emblem: "PHX", color: "celebration--gold",     cta: "Open the Vault" },
  reward:        { emblem: "🎁",  color: "celebration--gold",     cta: "Enjoy It. You Earned It." },
  review:        { emblem: "🧭",  color: "",                      cta: "Load Next Week" },
  rank:          { emblem: "PHX", color: "celebration--pink",     cta: "Continue the Climb" },
  science_streak:{ emblem: "🔬", color: "celebration--science",   cta: "Keep the Streak Alive" }
};

const CONFETTI_COLORS = ["#00F0FF", "#00FFBF", "#FF3EDB", "#8B5CF6", "#FACC15", "#FB923C"];
const EMBER_COLS      = ["#FB923C", "#FACC15", "#FF3EDB", "#00F0FF", "#00FFBF"];

/* Diamond SVG — for milestone celebrations */
function DiamondSVG({ size = 80 }) {
  return (
    <svg
      width={size}
      viewBox="0 0 200 125"
      fill="none"
      style={{ overflow: "visible", display: "block" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="celDiaG" x1="0" y1="0" x2="200" y2="125" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00F0FF" />
          <stop offset="0.5" stopColor="#00FFBF" />
          <stop offset="1" stopColor="#FACC15" />
        </linearGradient>
      </defs>
      <g stroke="url(#celDiaG)" strokeWidth="4" strokeLinejoin="round" fill="none"
         style={{ filter: "drop-shadow(0 0 14px rgba(0,240,255,0.8))" }}>
        <path d="M30,45 L70,12 L130,12 L170,45 L100,115 Z" />
        <path d="M30,45 L170,45" />
        <path d="M70,12 L85,45 L100,12 L115,45 L130,12" />
        <path d="M85,45 L100,115" />
        <path d="M115,45 L100,115" />
      </g>
    </svg>
  );
}

/* Phoenix SVG — for project/rank celebrations */
function PhoenixSVG({ size = 110 }) {
  return (
    <svg
      width={size}
      viewBox="0 0 220 150"
      fill="none"
      style={{ overflow: "visible", display: "block" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="celWgR" x1="110" y1="105" x2="212" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#FF3EDB" />
        </linearGradient>
        <linearGradient id="celWgL" x1="110" y1="105" x2="8" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D11EFF" />
          <stop offset="1" stopColor="#00F0FF" />
        </linearGradient>
        <linearGradient id="celBodg" x1="110" y1="56" x2="110" y2="130" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00F0FF" />
          <stop offset="1" stopColor="#FF3EDB" />
        </linearGradient>
      </defs>
      {/* right wing */}
      <g stroke="url(#celWgR)" fill="none" strokeWidth="3.4" strokeLinecap="round"
         style={{ filter: "drop-shadow(0 0 8px rgba(139,92,246,0.7))" }}>
        {["M112,90 C152,84 186,56 202,14","M112,97 C152,97 178,77 192,42",
          "M112,104 C148,110 170,96 182,70","M110,111 C138,123 156,117 168,99"
        ].map((d, i) => <path key={i} d={d} />)}
      </g>
      {/* left wing */}
      <g stroke="url(#celWgL)" fill="none" strokeWidth="3.4" strokeLinecap="round"
         transform="translate(220,0) scale(-1,1)"
         style={{ filter: "drop-shadow(0 0 8px rgba(139,92,246,0.7))" }}>
        {["M112,90 C152,84 186,56 202,14","M112,97 C152,97 178,77 192,42",
          "M112,104 C148,110 170,96 182,70","M110,111 C138,123 156,117 168,99"
        ].map((d, i) => <path key={i} d={d} />)}
      </g>
      {/* body */}
      <g stroke="url(#celBodg)" fill="none" strokeWidth="3.2" strokeLinecap="round"
         style={{ filter: "drop-shadow(0 0 8px rgba(0,240,255,0.7))" }}>
        {["M110,56 C125,71 125,98 110,130 C95,98 95,71 110,56 Z",
          "M110,74 C117,84 117,99 110,113 C103,99 103,84 110,74 Z",
          "M110,56 C105,49 111,44 118,49"
        ].map((d, i) => <path key={i} d={d} />)}
      </g>
    </svg>
  );
}

function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2 + Math.random() * 1.4,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length]
      })),
    []
  );

  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        />
      ))}
    </div>
  );
}

function EmberBurst() {
  const embers = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: 30 + Math.random() * 40,
        size: 2 + Math.random() * 4,
        dur: 1.2 + Math.random() * 1.6,
        dx: Math.random() * 100 - 50,
        delay: Math.random() * 0.5,
        col: EMBER_COLS[i % EMBER_COLS.length]
      })),
    []
  );

  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {embers.map((e) => (
        <span
          key={e.id}
          style={{
            position: "absolute",
            bottom: "30%",
            left: `${e.left}%`,
            width: e.size,
            height: e.size,
            borderRadius: "50%",
            background: e.col,
            boxShadow: `0 0 8px ${e.col}`,
            animation: `ember-rise ${e.dur}s ease-out forwards`,
            animationDelay: `${e.delay}s`,
            "--dx": `${e.dx}px`
          }}
        />
      ))}
    </div>
  );
}

export default function CelebrationOverlay() {
  const { celebrations, dismissCelebration, settings } = useAppData();
  const current = celebrations[0];

  useEffect(() => {
    if (!current) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" || e.key === "Enter") dismissCelebration();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, dismissCelebration]);

  if (!current) return null;

  const meta          = VARIANT_META[current.variant] || VARIANT_META.day;
  const usePhoenix    = meta.emblem === "PHX";
  const useDiamond    = current.variant === "milestone";
  const withEmbers    = current.variant === "project" || current.variant === "rank";

  return (
    <div className={`celebration ${meta.color}`} role="alertdialog" aria-label={current.title}>
      {!settings.reducedMotion && <ConfettiBurst />}
      {!settings.reducedMotion && withEmbers && <EmberBurst />}

      <div className="celebration__inner">
        <div className="celebration__emblem" aria-hidden="true" style={{ display: "flex", justifyContent: "center" }}>
          {usePhoenix ? (
            <PhoenixSVG size={120} />
          ) : useDiamond ? (
            <DiamondSVG size={80} />
          ) : (
            meta.emblem
          )}
        </div>
        <h1 className="celebration__title">{current.title}</h1>
        {current.subtitle && <p className="celebration__subtitle">{current.subtitle}</p>}
        {current.detail   && <p className="celebration__detail">{current.detail}</p>}
        <Button className="celebration__btn" variant="primary" size="lg" onClick={dismissCelebration}>
          {meta.cta}
        </Button>
      </div>
    </div>
  );
}

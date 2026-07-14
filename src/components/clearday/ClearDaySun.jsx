import React, { useId } from "react";

/* ═══════════════════════════════════════════════════════════════
   CLEARDAY SUN — the real logo.
   One inline SVG, three lives:
     mini   — 34px topbar tile: 5 rays, no filter, idle corona shimmer
     hero   — splash dawn-break: horizon draws, disc breaks it,
              corona blooms, rays fan open
     emblem — in-app header mark: rays draw once on mount
   All motion is CSS keyframes on the part classes (clearday.css /
   globals.css for the mini) — no SMIL, no JS timers.
   Gradient/filter/clip ids are useId-prefixed: the sun renders in
   the topbar, splash and Daily tab at the same time.
   ═══════════════════════════════════════════════════════════════ */

const CX = 60;
const HY = 78; // horizon y
const RAY_IN = 30;
const RAY_OUT = 52;

function rayLine(deg, key, grad) {
  const a = ((deg - 90) * Math.PI) / 180; // 0° = straight up
  const x1 = CX + Math.cos(a) * RAY_IN;
  const y1 = HY + Math.sin(a) * RAY_IN;
  const x2 = CX + Math.cos(a) * RAY_OUT;
  const y2 = HY + Math.sin(a) * RAY_OUT;
  return (
    <line
      key={key}
      className="cd-sun__ray"
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={grad}
      strokeWidth="2.5"
      strokeLinecap="round"
      pathLength="1"
    />
  );
}

const RAYS_FULL = [-75, -50, -25, 0, 25, 50, 75];
const RAYS_MINI = [-60, -30, 0, 30, 60];

export default function ClearDaySun({ variant = "emblem" }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const core = `cds-core-${uid}`;
  const corona = `cds-corona-${uid}`;
  const horizon = `cds-horizon-${uid}`;
  const ray = `cds-ray-${uid}`;
  const glow = `cds-glow-${uid}`;
  const above = `cds-above-${uid}`;
  const mini = variant === "mini";
  const rays = mini ? RAYS_MINI : RAYS_FULL;

  return (
    <svg
      className={`cd-sun cd-sun--${variant}`}
      viewBox="0 0 120 120"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={core} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0b45e" />
          <stop offset="55%" stopColor="#5e9df0" />
          <stop offset="100%" stopColor="#2d5a8a" />
        </linearGradient>
        <radialGradient id={corona} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(94,157,240,0.55)" />
          <stop offset="55%" stopColor="rgba(94,157,240,0.12)" />
          <stop offset="100%" stopColor="rgba(94,157,240,0)" />
        </radialGradient>
        <linearGradient id={horizon} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(94,157,240,0)" />
          <stop offset="50%" stopColor="#5e9df0" />
          <stop offset="100%" stopColor="rgba(94,157,240,0)" />
        </linearGradient>
        <linearGradient id={ray} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#f0b45e" />
          <stop offset="100%" stopColor="rgba(94,157,240,0)" />
        </linearGradient>
        {!mini && (
          <filter id={glow} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
        <clipPath id={above}>
          <rect x="0" y="0" width="120" height={HY} />
        </clipPath>
      </defs>

      <circle className="cd-sun__corona" cx={CX} cy={HY} r="46" fill={`url(#${corona})`} />

      <g className="cd-sun__rays" clipPath={`url(#${above})`}>
        {rays.map((deg, i) => rayLine(deg, i, `url(#${ray})`))}
      </g>

      <g clipPath={`url(#${above})`}>
        <circle
          className="cd-sun__disc"
          cx={CX} cy={HY} r="22"
          fill={`url(#${core})`}
          filter={mini ? undefined : `url(#${glow})`}
        />
      </g>

      <rect className="cd-sun__horizon" x="8" y={HY - 1} width="104" height="2" rx="1" fill={`url(#${horizon})`} />
    </svg>
  );
}

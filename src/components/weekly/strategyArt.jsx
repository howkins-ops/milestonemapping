import React, { useId, useMemo } from "react";
import "../../styles/strategyArt.css";

/* ════════════════════════════════════════════════════════════════════════
   THE STRATEGY ROOM — every mark on the screen, drawn.

   The room used to be furnished out of the emoji keyboard: a 🧭 for the
   review, a 🔥 for the streak, a 🧊 for the fridge, a 🏅 on every filed
   week. Those render as somebody else's artwork at a size the OS picks, in
   a palette that has nothing to do with this app, and they say the same
   thing on every phone. Everything below is a path somebody chose.

   ART LAW, and it is not optional:

   • ZERO emoji. If it appears in the room, it is geometry in this file.

   • ONE filter per art container, never one per path. A drop-shadow on
     each of a compass rose's twelve kites is twelve raster passes a frame,
     and the room draws four roses at once on the wizard.

   • Infinite animations NEVER live inside a filtered subtree. The radar
     sweep, the flame flicker and the pin pulses ride on unfiltered groups.

   • Rotation uses the translate sandwich, not `transform-origin`:
       translate(Xpx,Ypx) rotate(Ndeg) translate(-Xpx,-Ypx)
     `transform-box`/`transform-origin` on SVG children resolve differently
     across WebKit and Blink, and this app ships inside a WebView. The
     sandwich is unambiguous everywhere.

   • Every mark draws into a square 0 0 100 100 viewBox and carries no size
     of its own — CSS decides how big it is. Scenes declare their own box
     and slice.

   • Gradient ids are per-instance (useId). Two flames on one page with
     different tones must not resolve to the same <linearGradient>.
   ════════════════════════════════════════════════════════════════════════ */

/* ── geometry ─────────────────────────────────────────────────────── */

const RAD = Math.PI / 180;

/** Point on a circle. 0° is up, degrees run clockwise. */
function pt(cx, cy, deg, r) {
  return [
    +(cx + Math.cos((deg - 90) * RAD) * r).toFixed(2),
    +(cy + Math.sin((deg - 90) * RAD) * r).toFixed(2)
  ];
}

/** A four-point kite from the hub out to `len` at `deg`, `halfW` across. */
function kite(deg, len, halfW, cx = 50, cy = 50) {
  const [tx, ty] = pt(cx, cy, deg, len);
  const [bx, by] = pt(cx, cy, deg + 90, halfW);
  const [dx, dy] = pt(cx, cy, deg - 90, halfW);
  return `M${tx} ${ty}L${bx} ${by}L${cx} ${cy}L${dx} ${dy}Z`;
}

/** The lit half of the same kite — what makes a rose read as 3D. */
function kiteHalf(deg, len, halfW, cx = 50, cy = 50) {
  const [tx, ty] = pt(cx, cy, deg, len);
  const [bx, by] = pt(cx, cy, deg + 90, halfW);
  return `M${tx} ${ty}L${bx} ${by}L${cx} ${cy}Z`;
}

/** Filled pie wedge spanning `span`° clockwise from `from`°. */
function wedge(cx, cy, r, from, span) {
  const [x1, y1] = pt(cx, cy, from, r);
  const [x2, y2] = pt(cx, cy, from + span, r);
  return `M${cx} ${cy}L${x1} ${y1}A${r} ${r} 0 ${span > 180 ? 1 : 0} 1 ${x2} ${y2}Z`;
}

/** Open arc, for strokes. */
function arcPath(cx, cy, r, from, span) {
  const [x1, y1] = pt(cx, cy, from, r);
  const [x2, y2] = pt(cx, cy, from + span, r);
  return `M${x1} ${y1}A${r} ${r} 0 ${span > 180 ? 1 : 0} 1 ${x2} ${y2}`;
}

/** FNV-1a — so a given milestone always draws the same ridgeline. */
function seedFrom(str) {
  const s = String(str);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Collision-proof gradient id. useId() ships colons, which url(#…) hates. */
function useGid(prefix) {
  const raw = useId();
  return `${prefix}${raw.replace(/[^a-zA-Z0-9]/g, "")}`;
}

/* ── the compass rose — the room's signature ──────────────────────── */

export function CompassRose({ live = true, className = "" }) {
  const gid = useGid("srRose");
  const ticks = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        const major = i % 9 === 0;
        const [x1, y1] = pt(50, 50, i * 10, major ? 47.5 : 45);
        const [x2, y2] = pt(50, 50, i * 10, 41.5);
        return { x1, y1, x2, y2, major, i };
      }),
    []
  );

  return (
    <svg className={`sra sra-rose ${className}`} viewBox="0 0 100 100" aria-hidden focusable="false">
      <defs>
        <linearGradient id={`${gid}n`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#00F0FF" />
          <stop offset="1" stopColor="#D11EFF" />
        </linearGradient>
        <radialGradient id={`${gid}h`} cx=".38" cy=".32" r=".8">
          <stop offset="0" stopColor="#1b1440" />
          <stop offset="1" stopColor="#07040f" />
        </radialGradient>
      </defs>

      <circle cx="50" cy="50" r="48" className="sra-rose__rim" />
      <circle cx="50" cy="50" r="41" className="sra-rose__rim sra-rose__rim--inner" />

      <g className="sra-rose__ticks">
        {ticks.map((t) => (
          <line key={t.i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={t.major ? 1.7 : 0.7} />
        ))}
      </g>

      <g className="sra-rose__points">
        {[45, 135, 225, 315].map((d) => (
          <path key={`m${d}`} d={kite(d, 27, 4.6)} className="sra-rose__kite" />
        ))}
        {[45, 135, 225, 315].map((d) => (
          <path key={`ml${d}`} d={kiteHalf(d, 27, 4.6)} className="sra-rose__lit" />
        ))}
        {[0, 90, 180, 270].map((d) => (
          <path key={`c${d}`} d={kite(d, 38, 7.4)} className="sra-rose__kite sra-rose__kite--major" />
        ))}
        {[0, 90, 180, 270].map((d) => (
          <path key={`cl${d}`} d={kiteHalf(d, 38, 7.4)} className="sra-rose__lit sra-rose__lit--major" />
        ))}
      </g>

      <circle cx="50" cy="50" r="12" fill={`url(#${gid}h)`} className="sra-rose__hub" />

      <g className={`sra-rose__needle${live ? " is-live" : ""}`}>
        <path d="M50 50L46.4 46.5L50 14L53.6 46.5Z" fill={`url(#${gid}n)`} />
        <path d="M50 50L46.4 53.5L50 79L53.6 53.5Z" className="sra-rose__needle-tail" />
      </g>

      <circle cx="50" cy="50" r="3.1" className="sra-rose__pin" />
    </svg>
  );
}

/* ── the streak flame ─────────────────────────────────────────────── */

const FLAME_TONES = {
  fire: { tip: "#FF3EDB", mid: "#FF8A3D", base: "#FFD166", core: "#FFF6D8" },
  cold: { tip: "#D11EFF", mid: "#0090FF", base: "#00F0FF", core: "#EAFDFF" },
  dead: { tip: "#332E4A", mid: "#403A58", base: "#4E4868", core: "#6D6688" }
};

export function FlameMark({ tone = "fire", className = "" }) {
  const gid = useGid("srFl");
  const t = FLAME_TONES[tone] || FLAME_TONES.fire;
  return (
    <svg
      className={`sra sra-flame sra-flame--${tone} ${className}`}
      viewBox="0 0 100 100"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id={`${gid}o`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.tip} />
          <stop offset=".55" stopColor={t.mid} />
          <stop offset="1" stopColor={t.base} />
        </linearGradient>
        <linearGradient id={`${gid}i`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.base} />
          <stop offset="1" stopColor={t.core} />
        </linearGradient>
      </defs>
      <path
        className="sra-flame__body"
        d="M50 4C64 22 78 38 78 56 78 78 66 96 50 96 34 96 22 78 22 56 22 40 34 28 38 12 44 26 48 30 50 4Z"
        fill={`url(#${gid}o)`}
      />
      <path
        className="sra-flame__core"
        d="M50 35C58 45 64 54 64 62 64 74 58 84 50 87 42 84 36 74 36 62 36 54 42 45 50 35Z"
        fill={`url(#${gid}i)`}
      />
    </svg>
  );
}

/* ── the bolt (XP / charge) ───────────────────────────────────────── */

export function BoltMark({ tone = "#FFD166", className = "" }) {
  const gid = useGid("srBo");
  return (
    <svg className={`sra sra-bolt ${className}`} viewBox="0 0 100 100" aria-hidden focusable="false">
      <defs>
        <linearGradient id={gid} x1=".15" y1="0" x2=".7" y2="1">
          <stop offset="0" stopColor="#FFF6D8" />
          <stop offset=".45" stopColor={tone} />
          <stop offset="1" stopColor="#FF8A3D" />
        </linearGradient>
      </defs>
      <path d="M58 3L22 56h22l-6 41 40-55H54z" fill={`url(#${gid})`} />
      <path d="M58 3L22 56h9z" fill="#fff" opacity=".38" />
    </svg>
  );
}

/* ── the receipt ──────────────────────────────────────────────────── */

export function ReceiptMark({ stamped = true, className = "" }) {
  return (
    <svg
      className={`sra sra-receipt${stamped ? " is-stamped" : ""} ${className}`}
      viewBox="0 0 100 100"
      aria-hidden
      focusable="false"
    >
      <path className="sra-receipt__paper" d="M22 8h56v74l-7 6-7-6-7 6-7-6-7 6-7-6-7 6-7-6z" />
      <g className="sra-receipt__rules">
        <path d="M31 25h38M31 36h38M31 47h25" />
      </g>
      {stamped && (
        <g className="sra-receipt__stamp">
          <circle cx="62" cy="62" r="16" />
          <path d="M53 62l6.5 7 12.5-14" />
        </g>
      )}
    </svg>
  );
}

/* ── the supply crate (the Stockpile) ─────────────────────────────── */

export function CrateMark({ className = "" }) {
  const gid = useGid("srCr");
  return (
    <svg className={`sra sra-crate ${className}`} viewBox="0 0 100 100" aria-hidden focusable="false">
      <defs>
        <linearGradient id={`${gid}t`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2E5763" />
          <stop offset="1" stopColor="#173741" />
        </linearGradient>
        <linearGradient id={`${gid}l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1B3D48" />
          <stop offset="1" stopColor="#0C222A" />
        </linearGradient>
        <linearGradient id={`${gid}r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#12303A" />
          <stop offset="1" stopColor="#081920" />
        </linearGradient>
      </defs>

      <g className="sra-crate__motes">
        <circle cx="26" cy="24" r="1.9" />
        <circle cx="74" cy="18" r="1.4" />
        <circle cx="50" cy="8" r="1.1" />
      </g>

      <path d="M50 14L86 33 50 52 14 33Z" fill={`url(#${gid}t)`} />
      <path d="M14 33L50 52v34L14 67Z" fill={`url(#${gid}l)`} />
      <path d="M86 33L50 52v34l36-19Z" fill={`url(#${gid}r)`} />

      <g className="sra-crate__straps">
        <path d="M14 45L50 64 86 45" />
        <path d="M14 57L50 76 86 57" />
      </g>
      <path className="sra-crate__seam" d="M50 52v34" />
      <path className="sra-crate__stencil" d="M60 62l8 4 8-4M60 70l8 4 8-4" />
      <path className="sra-crate__rim" d="M50 14L86 33 50 52 14 33Z" />
    </svg>
  );
}

/* ── the score seal (a filed week) ────────────────────────────────── */

export function ScoreSeal({ total = 0, max = 50, color = "#00FFBF", className = "" }) {
  const gid = useGid("srSe");
  const pct = Math.max(0, Math.min(1, max > 0 ? total / max : 0));
  const teeth = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 48; i++) {
      const [x, y] = pt(50, 50, (i * 360) / 48, i % 2 === 0 ? 47 : 42);
      pts.push(`${x} ${y}`);
    }
    return `M${pts.join("L")}Z`;
  }, []);
  const R = 34;
  const C = 2 * Math.PI * R;

  return (
    <svg className={`sra sra-seal ${className}`} viewBox="0 0 100 100" aria-hidden focusable="false">
      <defs>
        <radialGradient id={`${gid}f`} cx=".35" cy=".3" r=".85">
          <stop offset="0" stopColor="#161033" />
          <stop offset="1" stopColor="#07040f" />
        </radialGradient>
      </defs>
      <path d={teeth} className="sra-seal__teeth" style={{ stroke: color }} />
      <circle cx="50" cy="50" r="40" fill={`url(#${gid}f)`} />
      <circle cx="50" cy="50" r="40" className="sra-seal__edge" style={{ stroke: color }} />
      <circle cx="50" cy="50" r={R} className="sra-seal__track" />
      <circle
        cx="50"
        cy="50"
        r={R}
        className="sra-seal__arc"
        style={{ stroke: color }}
        strokeDasharray={C}
        strokeDashoffset={C * (1 - pct)}
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="55" className="sra-seal__num" style={{ fill: color }}>
        {total}
      </text>
      <text x="50" y="70" className="sra-seal__den">
        / {max}
      </text>
    </svg>
  );
}

/* ── the front line (one milestone, drawn from its own id) ────────── */

export function FrontTerrain({ seed = "front", pct = 0, tone = "#00F0FF", className = "" }) {
  const gid = useGid("srFt");
  const held = Math.max(0, Math.min(100, pct));
  const { fills, lines, stars } = useMemo(() => {
    const rnd = mulberry(seedFrom(seed));
    const f = [];
    const l = [];
    [0, 1, 2].forEach((layer) => {
      const base = 44 + layer * 15;
      const amp = 23 - layer * 5;
      const step = 15 - layer * 3; // nearer ridges carry more detail
      const pts = [];
      for (let x = -12; x <= 212; x += step) {
        // squaring the noise keeps most of the ridge low and lets the
        // occasional peak actually be a peak — flat noise reads as fog.
        pts.push(`${x} ${(base - Math.pow(rnd(), 1.7) * amp).toFixed(1)}`);
      }
      l.push(`M${pts.join("L")}`);
      f.push(`M-12 104L${pts.join("L")}L212 104Z`);
    });
    const sky = Array.from({ length: 9 }, () => [
      +(rnd() * 200).toFixed(1),
      +(5 + rnd() * 24).toFixed(1),
      +(0.35 + rnd() * 0.5).toFixed(2)
    ]);
    return { fills: f, lines: l, stars: sky };
  }, [seed]);

  const line = (held / 100) * 200;

  return (
    <svg
      className={`sra-scene sra-front ${className}`}
      viewBox="0 0 200 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id={`${gid}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#08061a" />
          <stop offset="1" stopColor="#140a2c" />
        </linearGradient>
        <linearGradient id={`${gid}glow`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tone} stopOpacity="0" />
          <stop offset="1" stopColor={tone} stopOpacity=".22" />
        </linearGradient>
        <linearGradient id={`${gid}col`} gradientUnits="userSpaceOnUse" x1={line - 26} y1="0" x2={line} y2="0">
          <stop offset="0" stopColor={tone} stopOpacity="0" />
          <stop offset="1" stopColor={tone} stopOpacity=".3" />
        </linearGradient>
        <clipPath id={`${gid}clip`}>
          <rect x="0" y="0" width={line} height="100" />
        </clipPath>
      </defs>

      <rect width="200" height="100" fill={`url(#${gid}sky)`} />
      <g className="sra-front__stars">
        {stars.map(([x, y, o], i) => (
          <circle key={i} cx={x} cy={y} r=".7" opacity={o} />
        ))}
      </g>
      <rect x="0" y="26" width="200" height="36" fill={`url(#${gid}glow)`} />

      {/* dark ground — everything you haven't taken yet */}
      <g className="sra-front__ridges">
        {fills.map((d, i) => (
          <path key={i} d={d} className={`sra-front__ridge sra-front__ridge--${i}`} />
        ))}
        {lines.map((d, i) => (
          <path key={i} d={d} className={`sra-front__edge sra-front__edge--${i}`} />
        ))}
      </g>

      {/* ground behind the line, lit and rim-lit in the mission's colour */}
      <g clipPath={`url(#${gid}clip)`} style={{ color: tone }}>
        {held > 0 && <rect x="0" y="0" width={line} height="100" fill={`url(#${gid}col)`} />}
        {fills.map((d, i) => (
          <path key={i} d={d} className={`sra-front__ridge-held sra-front__ridge-held--${i}`} />
        ))}
        {lines.map((d, i) => (
          <path key={i} d={d} className={`sra-front__rim sra-front__rim--${i}`} />
        ))}
      </g>

      {held > 0 && held < 100 && (
        <g className="sra-front__line" style={{ color: tone }}>
          <path d={`M${line.toFixed(1)} 3v97`} />
          <path d={`M${(line - 5.5).toFixed(1)} 3h11l-5.5 7.5z`} className="sra-front__flag" />
        </g>
      )}
    </svg>
  );
}

/* ── the briefing table (hub hero) ────────────────────────────────── */

const TABLE_PINS = [
  { x: 104, y: 140, tone: "#00F0FF", live: true },
  { x: 168, y: 116, tone: "#D11EFF", live: false },
  { x: 236, y: 158, tone: "#00FFBF", live: true },
  { x: 296, y: 128, tone: "#FFD166", live: false }
];

export function BriefingTable({ className = "" }) {
  const gid = useGid("srBt");
  const contours = [40, 62, 86, 112, 142, 176];

  return (
    <svg
      className={`sra-scene sra-table ${className}`}
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      focusable="false"
    >
      <defs>
        <radialGradient id={`${gid}felt`} cx=".38" cy=".54" r=".78">
          <stop offset="0" stopColor="#170f36" />
          <stop offset=".6" stopColor="#0b0722" />
          <stop offset="1" stopColor="#05030c" />
        </radialGradient>
        <radialGradient id={`${gid}sweep`} gradientUnits="userSpaceOnUse" cx="150" cy="128" r="210">
          <stop offset="0" stopColor="#00F0FF" stopOpacity=".34" />
          <stop offset=".55" stopColor="#00F0FF" stopOpacity=".1" />
          <stop offset="1" stopColor="#00F0FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${gid}cone`} x1=".2" y1="0" x2=".7" y2="1">
          <stop offset="0" stopColor="#F2F0F4" stopOpacity=".14" />
          <stop offset="1" stopColor="#F2F0F4" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${gid}land`} x1="0" y1="0" x2=".8" y2="1">
          <stop offset="0" stopColor="#1d2a5c" />
          <stop offset="1" stopColor="#101a3d" />
        </linearGradient>
        <radialGradient id={`${gid}vig`} cx=".5" cy=".5" r=".72">
          <stop offset=".55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".72" />
        </radialGradient>
        <pattern id={`${gid}grid`} width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M25 0H0v25" fill="none" stroke="#00F0FF" strokeOpacity=".07" strokeWidth=".6" />
        </pattern>
      </defs>

      <rect width="400" height="240" fill={`url(#${gid}felt)`} />
      <rect width="400" height="240" fill={`url(#${gid}grid)`} />

      <g className="sra-table__contours">
        {contours.map((r, i) => (
          <ellipse key={r} cx="150" cy="128" rx={r} ry={r * 0.6} transform="rotate(-14 150 128)" opacity={0.3 - i * 0.03} />
        ))}
      </g>

      <path
        className="sra-table__land"
        fill={`url(#${gid}land)`}
        d="M62 172c-6-30 15-52 42-58 21-5 35-24 63-26 31-2 49 14 61 34 14 24 46 26 60 44 14 18 2 42-24 46-36 6-72-2-108 0-36 2-88-14-94-40Z"
      />
      <path
        className="sra-table__coast"
        d="M62 172c-6-30 15-52 42-58 21-5 35-24 63-26 31-2 49 14 61 34 14 24 46 26 60 44 14 18 2 42-24 46-36 6-72-2-108 0-36 2-88-14-94-40Z"
      />

      <path className="sra-table__route" d="M104 140L168 116 236 158 296 128" />

      <g className="sra-table__sweep">
        <path d={wedge(150, 128, 230, -10, 54)} fill={`url(#${gid}sweep)`} />
        <path className="sra-table__sweep-edge" d={`M150 128L${pt(150, 128, 44, 230).join(" ")}`} />
      </g>

      {TABLE_PINS.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y})`} className="sra-table__pin">
          {p.live && <circle className="sra-table__pulse" r="5" style={{ stroke: p.tone, animationDelay: `${i * 0.9}s` }} />}
          <path d="M0 0v-14" style={{ stroke: p.tone }} />
          <circle cy="-16" r="3.4" style={{ fill: p.tone }} />
          <circle cy="-16" r="6.6" className="sra-table__pin-ring" style={{ stroke: p.tone }} />
        </g>
      ))}

      <path d="M300-20L400 0v120z" fill={`url(#${gid}cone)`} />
      <rect width="400" height="240" fill={`url(#${gid}vig)`} />
    </svg>
  );
}

/* ── step sigils — one drawn identity per screen of the review ────── */

function SigilAperture() {
  const blades = [0, 60, 120, 180, 240, 300];
  const hex = useMemo(() => {
    const pts = Array.from({ length: 6 }, (_, i) => pt(50, 50, 30 + i * 60, 17).join(" "));
    return `M${pts.join("L")}Z`;
  }, []);
  return (
    <>
      <circle cx="50" cy="50" r="45" className="sra-sig__rim" />
      <g className="sra-sig__iris">
        {blades.map((d, i) => (
          <path key={d} d={wedge(50, 50, 40, d - 29, 58)} className={`sra-sig__blade sra-sig__blade--${i % 2}`} />
        ))}
      </g>
      <path d={hex} className="sra-sig__pupil" />
      <path d={arcPath(50, 50, 12, 200, 90)} className="sra-sig__glint" />
    </>
  );
}

function SigilRadar() {
  return (
    <>
      <circle cx="50" cy="50" r="45" className="sra-sig__rim" />
      <circle cx="50" cy="50" r="31" className="sra-sig__ring" />
      <circle cx="50" cy="50" r="17" className="sra-sig__ring" />
      <path d="M50 6v88M6 50h88" className="sra-sig__cross" />
      <g className="sra-sig__sweep">
        <path d={wedge(50, 50, 45, -6, 56)} className="sra-sig__wedge" />
        <path d={`M50 50L${pt(50, 50, 50, 45).join(" ")}`} className="sra-sig__sweep-edge" />
      </g>
      <circle cx="66" cy="34" r="3" className="sra-sig__blip" />
      <circle cx="34" cy="62" r="2.4" className="sra-sig__blip" style={{ animationDelay: "1.1s" }} />
      <circle cx="62" cy="68" r="2" className="sra-sig__blip" style={{ animationDelay: "2.2s" }} />
    </>
  );
}

function SigilOrders() {
  return (
    <g transform="rotate(-4 50 50)">
      <path d="M20 16h48l14 14v54H20z" className="sra-sig__paper" />
      <path d="M68 16v14h14" className="sra-sig__fold" />
      <path d="M29 44h42M29 54h42M29 64h24" className="sra-sig__rules" />
      <circle cx="68" cy="70" r="12" className="sra-sig__wax" />
      <path d="M68 62v16M60 70h16" className="sra-sig__waxmark" />
    </g>
  );
}

function SigilGauge() {
  return (
    <>
      <path d={arcPath(50, 62, 38, -122, 244)} className="sra-sig__gaugetrack" />
      <path d={arcPath(50, 62, 38, -122, 178)} className="sra-sig__gaugefill" />
      <g className="sra-sig__gaugeticks">
        {[-122, -61, 0, 61, 122].map((d) => {
          const [x1, y1] = pt(50, 62, d, 32);
          const [x2, y2] = pt(50, 62, d, 24);
          return <line key={d} x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </g>
      <g className="sra-sig__needle">
        <path d="M50 62L47 59L50 26L53 59Z" />
      </g>
      <circle cx="50" cy="62" r="5" className="sra-sig__hub" />
    </>
  );
}

function SigilTower() {
  return (
    <>
      <g className="sra-sig__waves">
        {[16, 26, 36].map((r, i) => (
          <path key={r} d={arcPath(50, 26, r, 118, 124)} style={{ animationDelay: `${i * 0.45}s` }} />
        ))}
        {[16, 26, 36].map((r, i) => (
          <path key={`b${r}`} d={arcPath(50, 26, r, -62, 124)} style={{ animationDelay: `${i * 0.45}s` }} />
        ))}
      </g>
      <path d="M50 92L36 92 45 30h10l9 62z" className="sra-sig__mast" />
      <path d="M42 52h16M40 66h20M38 80h24" className="sra-sig__brace" />
      <circle cx="50" cy="26" r="5" className="sra-sig__beacon" />
    </>
  );
}

function SigilReceipts() {
  return (
    <>
      <path d="M18 22h44v58l-5.5 5-5.5-5-5.5 5-5.5-5-5.5 5-5.5-5-5.5 5-5.5-5z" className="sra-sig__paper" />
      <path d="M27 36h26M27 46h26M27 56h17" className="sra-sig__rules" />
      <g className="sra-sig__seal">
        <circle cx="68" cy="62" r="17" />
        <path d="M59 62l6.5 7 13-14" />
      </g>
    </>
  );
}

const SIGILS = {
  ignite: null, // the rose gets its own element — it is the room's crest
  receipts: SigilReceipts,
  reflect: SigilAperture,
  battle: SigilRadar,
  orders: SigilOrders,
  score: SigilGauge,
  lock: SigilTower
};

export function StepSigil({ kind, tone = "#00F0FF", className = "" }) {
  if (kind === "ignite") return <CompassRose className={className} />;
  const Body = SIGILS[kind] || SigilRadar;
  return (
    <svg
      className={`sra sra-sig sra-sig--${kind} ${className}`}
      viewBox="0 0 100 100"
      style={{ color: tone }}
      aria-hidden
      focusable="false"
    >
      <Body />
    </svg>
  );
}

/* ── plain marks ──────────────────────────────────────────────────── */

export function CheckMark({ draw = false, className = "" }) {
  return (
    <svg
      className={`sra sra-check${draw ? " is-draw" : ""} ${className}`}
      viewBox="0 0 100 100"
      aria-hidden
      focusable="false"
    >
      <path d="M18 52L40 74L82 24" />
    </svg>
  );
}

export function CloseMark({ className = "" }) {
  return (
    <svg className={`sra sra-x ${className}`} viewBox="0 0 100 100" aria-hidden focusable="false">
      <path d="M24 24L76 76M76 24L24 76" />
    </svg>
  );
}

export function ChevronMark({ dir = "right", className = "" }) {
  const d =
    dir === "left"
      ? "M62 20L34 50L62 80"
      : dir === "down"
      ? "M20 38L50 68L80 38"
      : "M38 20L68 50L38 80";
  return (
    <svg className={`sra sra-chev ${className}`} viewBox="0 0 100 100" aria-hidden focusable="false">
      <path d={d} />
    </svg>
  );
}

import React, { useEffect, useRef } from "react";

/* ════════════════════════════════════════════════════════════════════════
   DOOR ART — the world, drawn.

   Replaces the fifteen empty <div>s that used to be "the door". This is a
   real stile-and-rail door: two stiles, three rails, four raised panels with
   bevelled ogee edges, a brass knob on an escutcheon, a deadbolt, hinges with
   knuckle barrels, a kick plate and a house number.

   DAMAGE IS A FRACTURE TREE, NOT AN OPACITY RAMP.
   Cracks are generated procedurally and drawn outward FROM THE POINT YOU HIT,
   by animating stroke-dashoffset. A pool of pre-rendered <path> nodes is
   recycled the same way door-game.css already recycles the word bursts, so a
   knock never costs a React render.

   Door-local coordinate space is 100 × 172 (the .58 aspect the scene already
   lays out for). Callers hand us scene pixels; strike() converts.
   ════════════════════════════════════════════════════════════════════════ */

export const DOOR_W = 100;
export const DOOR_H = 172;
const CRACK_POOL = 14;

const rand = (a, b) => a + Math.random() * (b - a);

/* ── the fracture generator ───────────────────────────────────────────────
   Recursive branching walk. Each segment turns by up to ±28°, loses 32% of
   its length, and may throw a child branch. Three levels deep is enough to
   read as a real split without becoming noise. Returns a path string in
   door units, centred on (0,0) so it can be translated to any impact. */
function fractureTree(power = 1) {
  const d = [];
  const arms = 3 + ((Math.random() * 3) | 0);
  const baseLen = (7 + power * 12) * rand(0.8, 1.25);

  const walk = (x, y, ang, len, depth) => {
    if (depth > 3 || len < 0.9) return;
    let cx = x, cy = y, a = ang, l = len;
    d.push(`M${cx.toFixed(1)} ${cy.toFixed(1)}`);
    const segs = 2 + ((Math.random() * 3) | 0);
    for (let i = 0; i < segs; i++) {
      a += rand(-0.49, 0.49);                     // ±28°
      const nx = cx + Math.cos(a) * l;
      const ny = cy + Math.sin(a) * l;
      d.push(`L${nx.toFixed(1)} ${ny.toFixed(1)}`);
      // spawn a child off this node
      if (depth < 3 && Math.random() < 0.55) {
        walk(nx, ny, a + (Math.random() < 0.5 ? 1 : -1) * rand(0.5, 1.1), l * 0.62, depth + 1);
        d.push(`M${nx.toFixed(1)} ${ny.toFixed(1)}`);
      }
      cx = nx; cy = ny;
      l *= 0.68;
    }
  };

  for (let i = 0; i < arms; i++) {
    walk(0, 0, (i / arms) * Math.PI * 2 + rand(-0.4, 0.4), baseLen, 1);
  }
  return d.join(" ");
}

/* ── imperative strike ────────────────────────────────────────────────────
   Grabs the next pooled crack, reshapes it, parks it at the impact point and
   draws it on. No state, no render. `nx`/`ny` are 0..1 within the door box. */
export function strikeDoor(doorEl, nx, ny, power = 1) {
  if (!doorEl) return;
  const pool = doorEl.querySelector(".dga-cracks");
  if (!pool) return;
  const idx = (+(pool.dataset.i || 0)) % CRACK_POOL;
  pool.dataset.i = String(idx + 1);
  const path = pool.children[idx];
  if (!path) return;

  path.setAttribute("d", fractureTree(power));
  path.setAttribute("transform", `translate(${(nx * DOOR_W).toFixed(1)} ${(ny * DOOR_H).toFixed(1)})`);
  path.style.strokeWidth = (0.5 + power * 0.9).toFixed(2);

  // measure once so the dash animation covers the whole tree
  let len = 120;
  try { len = path.getTotalLength() || 120; } catch { /* jsdom / detached */ }
  path.style.strokeDasharray = `${len}`;
  path.style.strokeDashoffset = `${len}`;
  path.classList.remove("is-drawing");
  void path.getBoundingClientRect();               // force reflow to retrigger
  path.classList.add("is-drawing");
}

export function resetDoorCracks(doorEl) {
  if (!doorEl) return;
  const pool = doorEl.querySelector(".dga-cracks");
  if (!pool) return;
  pool.dataset.i = "0";
  for (const p of pool.children) {
    p.setAttribute("d", "");
    p.classList.remove("is-drawing");
  }
}

/* ════════════════════════════════════════════════════════════════════════
   <WoodDoor/>
   `damage` 0..1 drives everything that isn't a discrete impact: the panels
   losing shards, the interior light bleeding through, the slab going off
   plumb. It's read from the --p custom property the engine already writes,
   so this component never re-renders during a round.
   ════════════════════════════════════════════════════════════════════════ */
export const WoodDoor = React.forwardRef(function WoodDoor({ burst = false, blood = 0, id = "w" }, ref) {
  return (
    <svg
      ref={ref}
      className={`dga-door dga-door--wood ${burst ? "is-burst" : ""}`}
      viewBox={`0 0 ${DOOR_W} ${DOOR_H}`}
      preserveAspectRatio="xMidYMax meet"
      data-blood={blood}
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id={`dga-slab-${id}`} x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0" stopColor="#7a4525" />
          <stop offset=".42" stopColor="#5c3116" />
          <stop offset="1" stopColor="#3a1c0b" />
        </linearGradient>
        <linearGradient id={`dga-panel-${id}`} x1="0" y1="0" x2=".6" y2="1">
          <stop offset="0" stopColor="#8a5029" />
          <stop offset="1" stopColor="#5a3018" />
        </linearGradient>
        <linearGradient id={`dga-brass-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe9ac" />
          <stop offset=".45" stopColor="#c99a2e" />
          <stop offset="1" stopColor="#6b4a12" />
        </linearGradient>
        <linearGradient id={`dga-steelbit-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d6dbe4" />
          <stop offset=".5" stopColor="#8a929e" />
          <stop offset="1" stopColor="#4c525c" />
        </linearGradient>
        {/* the grain — one tile, repeated, so it costs nothing */}
        <pattern id={`dga-grain-${id}`} width="100" height="26" patternUnits="userSpaceOnUse">
          <path d="M0 3q26 -2.4 50 0t50 -1.2M0 11q30 2.6 52 .4t48 1.6M0 19q22 -3 48 -.6t52 -.8" stroke="#00000022" strokeWidth=".7" fill="none" />
          <path d="M0 7q34 2 56 -.6t44 1M0 23q28 -2 52 .8t48 -1" stroke="#ffffff10" strokeWidth=".5" fill="none" />
        </pattern>

        <radialGradient id={`dga-warmglow-${id}`} cx=".5" cy=".4" r=".7">
          <stop offset="0" stopColor="#ffcf7a" stopOpacity=".85" />
          <stop offset="1" stopColor="#3a1e06" stopOpacity=".2" />
        </radialGradient>

        {/* Panels lose material as damage climbs — the mask punches holes and
            the lit interior shows through the gap. */}
        <mask id={`dga-slabmask-${id}`}>
          <rect x="0" y="0" width={DOOR_W} height={DOOR_H} fill="#fff" />
          <g className="dga-holes" fill="#000">
            <path className="dga-hole dga-hole--1" d="M22 30 38 26 45 44 34 58 20 52z" />
            <path className="dga-hole dga-hole--2" d="M58 104 78 100 82 124 66 134 55 120z" />
            <path className="dga-hole dga-hole--3" d="M18 100 40 96 48 128 26 140 12 122z" />
          </g>
        </mask>
      </defs>

      {/* ── what's behind the door: the lit hallway ────────────────────── */}
      <g className="dga-interior">
        <rect x="0" y="0" width={DOOR_W} height={DOOR_H} fill="#1a1206" />
        <rect x="0" y="0" width={DOOR_W} height={DOOR_H} fill={`url(#dga-warmglow-${id})`} />
        {/* a silhouette that shifts behind the gap */}
        <ellipse className="dga-shape" cx="52" cy="118" rx="17" ry="30" fill="#120a03" opacity=".82" />
      </g>

      <g mask={`url(#dga-slabmask-${id})`}>
        {/* ── slab ────────────────────────────────────────────────────── */}
        <rect x="0" y="0" width={DOOR_W} height={DOOR_H} fill={`url(#dga-slab-${id})`} />
        <rect x="0" y="0" width={DOOR_W} height={DOOR_H} fill={`url(#dga-grain-${id})`} />

        {/* stile / rail joinery lines */}
        <g stroke="#2a1207" strokeWidth=".9" fill="none" opacity=".75">
          <path d="M13 0v172M87 0v172M0 13h100M0 78h100M0 92h100M0 152h100" />
        </g>
        <g stroke="#ffffff14" strokeWidth=".6" fill="none">
          <path d="M14.2 0v172M88.2 0v172M0 14.2h100M0 93.2h100" />
        </g>

        {/* ── four raised panels ──────────────────────────────────────── */}
        {[
          { x: 17, y: 18, w: 30, h: 54 },
          { x: 53, y: 18, w: 30, h: 54 },
          { x: 17, y: 97, w: 30, h: 50 },
          { x: 53, y: 97, w: 30, h: 50 },
        ].map((p, i) => (
          <g key={i} className={`dga-panel dga-panel--${i + 1}`}>
            {/* bevel: light on the top-left faces, dark on the bottom-right */}
            <path d={`M${p.x} ${p.y}h${p.w}l-4 4h${-(p.w - 8)}z`} fill="#a06636" opacity=".85" />
            <path d={`M${p.x} ${p.y}v${p.h}l4 -4v${-(p.h - 8)}z`} fill="#95602f" opacity=".8" />
            <path d={`M${p.x + p.w} ${p.y}v${p.h}l-4 -4v${-(p.h - 8)}z`} fill="#331806" opacity=".85" />
            <path d={`M${p.x} ${p.y + p.h}h${p.w}l-4 -4h${-(p.w - 8)}z`} fill="#2b1405" opacity=".9" />
            <rect x={p.x + 4} y={p.y + 4} width={p.w - 8} height={p.h - 8} fill={`url(#dga-panel-${id})`} />
            <rect x={p.x + 4} y={p.y + 4} width={p.w - 8} height={p.h - 8} fill={`url(#dga-grain-${id})`} opacity=".7" />
          </g>
        ))}

        {/* ── peephole ────────────────────────────────────────────────── */}
        <g className="dga-peep">
          <circle cx="50" cy="42" r="3.4" fill="#20100a" />
          <circle cx="50" cy="42" r="2.4" fill={`url(#dga-brass-${id})`} />
          <circle cx="50" cy="42" r="1.5" fill="#0b1420" />
          <circle className="dga-peep__eye" cx="50" cy="42" r="1.1" fill="#cfe9ff" opacity="0" />
          <circle cx="49.3" cy="41.3" r=".5" fill="#ffffff" opacity=".7" />
        </g>

        {/* ── deadbolt + knob on a brass escutcheon ───────────────────── */}
        <g className="dga-lock">
          <rect x="86" y="70" width="9" height="5" rx="1.4" fill={`url(#dga-steelbit-${id})`} />
          <rect x="88" y="71.4" width="5" height="2.2" rx=".8" fill="#2b3038" />
          <ellipse cx="90.5" cy="88" rx="5.4" ry="7.4" fill={`url(#dga-brass-${id})`} opacity=".9" />
          <ellipse cx="90.5" cy="88" rx="3.6" ry="5.2" fill="#00000022" />
          <circle cx="90.5" cy="86.6" r="3.6" fill={`url(#dga-brass-${id})`} />
          <circle cx="89.4" cy="85.4" r="1.2" fill="#fff6cf" opacity=".85" />
          <path d="M89 91.4h3v2.6h-3z" fill="#7a5714" />
        </g>

        {/* ── hinges ──────────────────────────────────────────────────── */}
        {[24, 84, 146].map((y) => (
          <g key={y} className="dga-hinge">
            <rect x="-1.5" y={y} width="6.5" height="13" rx="1" fill={`url(#dga-steelbit-${id})`} />
            <rect x="-1.5" y={y} width="2.4" height="13" rx="1.2" fill="#b7bec9" />
            <circle cx="2.6" cy={y + 3} r=".8" fill="#3a4049" />
            <circle cx="2.6" cy={y + 10} r=".8" fill="#3a4049" />
          </g>
        ))}

        {/* ── kick plate + house number ───────────────────────────────── */}
        <g className="dga-kick">
          <rect x="8" y="155" width="84" height="14" rx="1" fill={`url(#dga-brass-${id})`} opacity=".55" />
          <rect x="8" y="155" width="84" height="14" rx="1" fill="none" stroke="#00000040" strokeWidth=".7" />
          {[13, 87].map((x) => <circle key={x} cx={x} cy="162" r="1" fill="#4a3208" />)}
        </g>
        <text x="50" y="10.5" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="800" fontSize="8" fill={`url(#dga-brass-${id})`} opacity=".9">7</text>
      </g>

      {/* ── impact scars ────────────────────────────────────────────────
          Sit outside the mask so a crack keeps reading across a hole edge. */}
      <g className="dga-cracks" data-i="0" fill="none" stroke="#f6e3bd" strokeWidth="1" strokeLinecap="round" opacity=".92">
        {Array.from({ length: CRACK_POOL }, (_, i) => <path key={i} d="" />)}
      </g>

      {/* ── edge shadow, keeps the slab sitting in its frame ───────────── */}
      <rect x="0" y="0" width={DOOR_W} height={DOOR_H} fill="none" stroke="#1c0c04" strokeWidth="2.4" />
      <rect x="1.2" y="1.2" width={DOOR_W - 2.4} height={DOOR_H - 2.4} fill="none" stroke="#ffffff0d" strokeWidth="1" />
    </svg>
  );
});

/* ════════════════════════════════════════════════════════════════════════
   <SteelDoor/> — same rig, reinforced. Plate seams, rivets, a hardened
   peephole housing. Steel DENTS: each impact bows the surface and the
   specular highlight bends around it instead of a crack opening.
   ════════════════════════════════════════════════════════════════════════ */
export const SteelDoor = React.forwardRef(function SteelDoor({ burst = false, blood = 0, id = "s" }, ref) {
  return (
    <svg
      ref={ref}
      className={`dga-door dga-door--steel ${burst ? "is-burst" : ""}`}
      viewBox={`0 0 ${DOOR_W} ${DOOR_H}`}
      preserveAspectRatio="xMidYMax meet"
      data-blood={blood}
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id={`dga-plate-${id}`} x1="0" y1="0" x2="1" y2=".4">
          <stop offset="0" stopColor="#98a3b2" />
          <stop offset=".35" stopColor="#6d7684" />
          <stop offset=".62" stopColor="#59616e" />
          <stop offset="1" stopColor="#3b414b" />
        </linearGradient>
        <linearGradient id={`dga-sheen-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset=".46" stopColor="#ffffff" stopOpacity=".16" />
          <stop offset=".54" stopColor="#ffffff" stopOpacity=".16" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <pattern id={`dga-brush-${id}`} width="4" height="100" patternUnits="userSpaceOnUse">
          <path d="M1 0v100" stroke="#ffffff0a" strokeWidth=".6" />
          <path d="M3 0v100" stroke="#0000000f" strokeWidth=".6" />
        </pattern>
        <mask id={`dga-smask-${id}`}>
          <rect x="0" y="0" width={DOOR_W} height={DOOR_H} fill="#fff" />
          <g className="dga-holes" fill="#000">
            <path className="dga-hole dga-hole--1" d="M26 34 44 30 50 50 36 62 22 54z" />
            <path className="dga-hole dga-hole--2" d="M56 106 80 102 84 128 64 138 52 122z" />
            <path className="dga-hole dga-hole--3" d="M16 96 42 92 50 130 24 142 10 120z" />
          </g>
        </mask>
      </defs>

      <g className="dga-interior">
        <rect x="0" y="0" width={DOOR_W} height={DOOR_H} fill="#08131c" />
        <ellipse className="dga-shape" cx="52" cy="118" rx="17" ry="30" fill="#04090e" opacity=".9" />
      </g>

      <g mask={`url(#dga-smask-${id})`}>
        <rect x="0" y="0" width={DOOR_W} height={DOOR_H} fill={`url(#dga-plate-${id})`} />
        <rect x="0" y="0" width={DOOR_W} height={DOOR_H} fill={`url(#dga-brush-${id})`} />
        <rect className="dga-sheen" x="0" y="0" width={DOOR_W} height={DOOR_H} fill={`url(#dga-sheen-${id})`} />

        {/* plate seams */}
        <g stroke="#252b33" strokeWidth="1.2" fill="none">
          <path d="M0 56h100M0 116h100M10 0v172M90 0v172" />
        </g>
        <g stroke="#ffffff14" strokeWidth=".6" fill="none">
          <path d="M0 57.4h100M0 117.4h100M11.4 0v172M91.4 0v172" />
        </g>

        {/* rivets down every seam */}
        <g fill="#39404a">
          {[6, 20, 34, 48, 62, 76, 90, 104, 118, 132, 146, 160].map((y) => (
            <g key={y}>
              <circle cx="5" cy={y} r="1.7" />
              <circle cx="95" cy={y} r="1.7" />
              <circle cx="4.5" cy={y - .5} r=".7" fill="#aab3c0" />
              <circle cx="94.5" cy={y - .5} r=".7" fill="#aab3c0" />
            </g>
          ))}
        </g>

        {/* hardened peephole housing */}
        <g className="dga-peep">
          <circle cx="50" cy="42" r="5" fill="#2c323a" />
          <circle cx="50" cy="42" r="3.4" fill="#171c22" />
          <circle className="dga-peep__eye" cx="50" cy="42" r="1.3" fill="#cfe9ff" opacity="0" />
          <circle cx="48.8" cy="40.8" r=".7" fill="#e8f2ff" opacity=".6" />
        </g>

        {/* industrial lever handle + deadbolt */}
        <g className="dga-lock">
          <rect x="83" y="68" width="11" height="6" rx="1.4" fill="#252b33" />
          <rect x="85.4" y="69.6" width="6" height="2.8" rx=".9" fill="#0e1319" />
          <rect x="80" y="83" width="15" height="4.6" rx="2.3" fill="#c3cbd6" />
          <circle cx="93" cy="85.3" r="3.6" fill="#8d96a3" />
          <circle cx="91.9" cy="84.2" r="1.2" fill="#eef3fa" opacity=".8" />
        </g>

        {/* heavy strap hinges */}
        {[24, 84, 146].map((y) => (
          <g key={y} className="dga-hinge">
            <rect x="-1.5" y={y - 2} width="9" height="17" rx="1" fill="#59616e" />
            <rect x="-1.5" y={y - 2} width="3" height="17" rx="1.4" fill="#aeb7c3" />
            <circle cx="4" cy={y + 1.6} r="1" fill="#2b3038" />
            <circle cx="4" cy={y + 11.4} r="1" fill="#2b3038" />
          </g>
        ))}
      </g>

      {/* dents read as a bowed highlight + a dark rim, never a crack */}
      <g className="dga-cracks" data-i="0" fill="none" stroke="#dce9fb" strokeWidth="1" strokeLinecap="round" opacity=".55" />

      <rect x="0" y="0" width={DOOR_W} height={DOOR_H} fill="none" stroke="#1b2027" strokeWidth="2.6" />
    </svg>
  );
});

/* ════════════════════════════════════════════════════════════════════════
   <Doorbell/> — a real illuminated push-button.
   Brushed bezel, screwed mounting plate, translucent button, lit amber ring,
   conduit running away to the transformer. Press depresses the button 2px
   and flares the ring; the CSS owns those states off .is-pressed.
   ════════════════════════════════════════════════════════════════════════ */
export function Doorbell({ dying = false, stuck = false }) {
  return (
    <svg
      className={`dga-bell ${dying ? "is-dying" : ""} ${stuck ? "is-stuck" : ""}`}
      viewBox="0 0 40 62"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="dga-bezel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#cfd6e0" />
          <stop offset=".45" stopColor="#8d95a1" />
          <stop offset="1" stopColor="#4e545d" />
        </linearGradient>
        <radialGradient id="dga-btn" cx=".38" cy=".32" r=".78">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset=".6" stopColor="#e6ddcd" />
          <stop offset="1" stopColor="#b3a998" />
        </radialGradient>
        <radialGradient id="dga-ring" cx=".5" cy=".5" r=".5">
          <stop offset=".55" stopColor="#ffcb52" stopOpacity="0" />
          <stop offset=".78" stopColor="#ffcb52" stopOpacity=".95" />
          <stop offset="1" stopColor="#ff9b1a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* conduit to the transformer */}
      <path d="M20 54v7" stroke="#3a3f47" strokeWidth="3" strokeLinecap="round" />

      {/* mounting plate */}
      <rect x="3" y="2" width="34" height="52" rx="6" fill="url(#dga-bezel)" />
      <rect x="4.6" y="3.6" width="30.8" height="48.8" rx="4.8" fill="none" stroke="#ffffff2e" strokeWidth="1" />
      <rect x="7" y="6" width="26" height="44" rx="4" fill="#2b3037" />

      {/* the two mounting screws — slotted, because it's a doorbell */}
      {[9.5, 46.5].map((cy) => (
        <g key={cy}>
          <circle cx="20" cy={cy} r="2.4" fill="#9aa2ae" />
          <circle cx="20" cy={cy} r="2.4" fill="none" stroke="#5b626c" strokeWidth=".6" />
          <path d={`M18.2 ${cy}h3.6`} stroke="#4a505a" strokeWidth=".9" strokeLinecap="round" />
        </g>
      ))}

      {/* the lit ring — the halo that says "press me" */}
      <circle className="dga-bell__glow" cx="20" cy="28" r="12" fill="url(#dga-ring)" />

      {/* the button itself */}
      <g className="dga-bell__btn">
        <circle cx="20" cy="28" r="8.6" fill="#5c636e" />
        <circle cx="20" cy="28" r="7.4" fill="url(#dga-btn)" />
        <circle cx="20" cy="28" r="7.4" fill="none" stroke="#ffffff55" strokeWidth=".8" />
        <ellipse cx="17.6" cy="25.2" rx="2.6" ry="1.7" fill="#ffffff" opacity=".6" />
        {/* the filament you can see through the translucent cap */}
        <circle className="dga-bell__filament" cx="20" cy="28" r="2.6" fill="#ffbf3d" opacity=".55" />
      </g>

      <text x="20" y="60.5" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="800" fontSize="5" letterSpacing=".5" fill="#7c848f">PRESS</text>
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   <WindowPane/> — sash window with real muntins. `broken` swaps to the
   jagged hole; the falling shards are the FX canvas's job, not the SVG's.
   ════════════════════════════════════════════════════════════════════════ */
export function WindowPane({ broken = false, lit = true, id = "0" }) {
  return (
    <svg className={`dga-pane ${broken ? "is-broke" : ""} ${lit ? "is-lit" : ""}`} viewBox="0 0 46 60" aria-hidden focusable="false">
      <defs>
        <linearGradient id={`dga-glass-${id}`} x1="0" y1="0" x2=".8" y2="1">
          <stop offset="0" stopColor="#b9dcff" stopOpacity=".55" />
          <stop offset=".45" stopColor="#5e86b4" stopOpacity=".5" />
          <stop offset="1" stopColor="#2c466e" stopOpacity=".6" />
        </linearGradient>
        <linearGradient id={`dga-warm-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd591" stopOpacity=".8" />
          <stop offset="1" stopColor="#c47a1e" stopOpacity=".55" />
        </linearGradient>
      </defs>

      {/* the lit room behind */}
      <rect x="2" y="2" width="42" height="56" fill="#1c1408" />
      <rect className="dga-pane__room" x="2" y="2" width="42" height="56" fill={`url(#dga-warm-${id})`} />
      {/* a silhouette that ducks when the glass goes */}
      <ellipse className="dga-pane__body" cx="30" cy="44" rx="9" ry="15" fill="#170e04" opacity=".8" />
      {/* TV flicker */}
      <rect className="dga-pane__tv" x="6" y="30" width="12" height="9" rx="1" fill="#8fd0ff" opacity=".35" />

      {/* the glass */}
      <g className="dga-pane__glass">
        <rect x="2" y="2" width="42" height="56" fill={`url(#dga-glass-${id})`} />
        <path d="M4 50 40 8" stroke="#ffffff" strokeWidth="3" opacity=".14" />
        <path d="M14 54 42 22" stroke="#ffffff" strokeWidth="1.6" opacity=".1" />
      </g>

      {/* the jagged remnant, revealed when broken */}
      <path className="dga-pane__jag" d="M2 2h42v56H2z M8 2 14 16 6 22 16 30 8 42 18 50 12 58 M44 12 34 20 42 30 30 38 40 48 32 58" fill="none" stroke="#bfe0ff" strokeWidth="1.1" opacity="0" />

      {/* muntins + sash */}
      <g stroke="#2a1206" strokeWidth="3" fill="none">
        <rect x="1.5" y="1.5" width="43" height="57" />
        <path d="M23 2v56M2 30h42" />
      </g>
      <g stroke="#5a3a1c" strokeWidth="1" fill="none" opacity=".7">
        <path d="M24 2v56M2 31h42" />
      </g>
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   <Chainsaw/> — engine housing, hand guard, exhaust, pull cord, and a bar
   whose chain genuinely runs: the teeth are a dashed stroke around the bar
   outline, driven by stroke-dashoffset. `cutting` drops the idle wobble and
   lights the tip.
   ════════════════════════════════════════════════════════════════════════ */
export function Chainsaw({ running = false, cutting = false }) {
  return (
    <svg
      className={`dga-saw ${running ? "is-running" : ""} ${cutting ? "is-cutting" : ""}`}
      viewBox="0 0 140 60"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="dga-sawbody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff9a2b" />
          <stop offset=".5" stopColor="#e2670c" />
          <stop offset="1" stopColor="#8e3c04" />
        </linearGradient>
        <linearGradient id="dga-sawbar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfd6e0" />
          <stop offset=".5" stopColor="#8b939f" />
          <stop offset="1" stopColor="#4f555e" />
        </linearGradient>
      </defs>

      {/* ── the bar ─────────────────────────────────────────────────────── */}
      <g className="dga-saw__bar">
        <path d="M52 22h68a8 8 0 0 1 0 16H52z" fill="url(#dga-sawbar)" stroke="#3b414a" strokeWidth="1.4" />
        <path d="M56 27h60a3 3 0 0 1 0 6H56z" fill="#3b414a" opacity=".55" />
        {/* THE CHAIN — dashed stroke round the bar; dashoffset animates it */}
        <path
          className="dga-saw__chain"
          d="M52 21h68a9 9 0 0 1 0 18H52a9 9 0 0 1 0-18z"
          fill="none"
          stroke="#e8edf5"
          strokeWidth="3.4"
          strokeDasharray="3 4.5"
          strokeLinecap="butt"
        />
        <path
          className="dga-saw__chain dga-saw__chain--teeth"
          d="M52 21h68a9 9 0 0 1 0 18H52a9 9 0 0 1 0-18z"
          fill="none"
          stroke="#9aa3b0"
          strokeWidth="6"
          strokeDasharray="1.6 9"
          strokeLinecap="butt"
          opacity=".85"
        />
        {/* friction heat at the tip while it bites */}
        <circle className="dga-saw__tipglow" cx="122" cy="30" r="9" fill="#ff8c1a" opacity="0" />
      </g>

      {/* ── engine ──────────────────────────────────────────────────────── */}
      <g className="dga-saw__body">
        <path d="M6 14h44a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6z" fill="url(#dga-sawbody)" stroke="#5c2703" strokeWidth="1.6" />
        {/* cooling fins */}
        <g stroke="#00000038" strokeWidth="1.6">
          <path d="M14 19v22M20 19v22M26 19v22" />
        </g>
        {/* exhaust */}
        <rect x="30" y="17" width="14" height="8" rx="2" fill="#3d4149" />
        <g stroke="#1d2026" strokeWidth="1.2">
          <path d="M33 19v4M36 19v4M39 19v4M42 19v4" />
        </g>
        {/* pull cord */}
        <circle cx="12" cy="30" r="5" fill="#2f333a" />
        <path className="dga-saw__cord" d="M7 30H1" stroke="#d9cba6" strokeWidth="2" strokeLinecap="round" />
        <circle cx="1" cy="30" r="2.6" fill="#c8b98f" />
        {/* trigger + rear grip */}
        <path d="M18 46h20v7a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z" fill="#2f333a" />
        <path className="dga-saw__trigger" d="M27 48h7v4h-7z" fill="#8e949e" />
      </g>

      {/* ── hand guard — the bar that stops the kickback ─────────────────── */}
      <path d="M50 8c8 2 10 8 10 14" fill="none" stroke="#e2670c" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M50 8c8 2 10 8 10 14" fill="none" stroke="#ffb45e" strokeWidth="1.6" strokeLinecap="round" opacity=".7" />

      {/* top handle */}
      <path d="M16 14V9a5 5 0 0 1 5-5h18a5 5 0 0 1 5 5v5" fill="none" stroke="#e2670c" strokeWidth="6" strokeLinecap="round" />
      <path d="M22 6h16" stroke="#2f333a" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   <Fist/> — the first-person fist that flies at the door.
   Seen from behind and above at 3/4. The 2nd and 3rd MCP knuckles sit
   proudest of the four, which is exactly why they're the ones that split —
   the damage stages paint onto those first.
   ════════════════════════════════════════════════════════════════════════ */
export const Fist = React.forwardRef(function Fist({ damage = 0 }, ref) {
  const d = Math.max(0, Math.min(4, damage));
  return (
    <svg ref={ref} className="dga-fist" data-damage={d} viewBox="0 0 120 130" aria-hidden focusable="false">
      <defs>
        <linearGradient id="dga-skin" x1=".2" y1="0" x2=".8" y2="1">
          <stop offset="0" stopColor="#f0c1a8" />
          <stop offset=".5" stopColor="#dda78c" />
          <stop offset="1" stopColor="#b57a5f" />
        </linearGradient>
        <radialGradient id="dga-knuckle" cx=".38" cy=".3" r=".8">
          <stop offset="0" stopColor="#ffdcc4" />
          <stop offset="1" stopColor="#c98a6c" />
        </radialGradient>
        <clipPath id="dga-handclip">
          <path d="M12 56c0-8 6-14 14-14s14 6 14 14c0-9 6-15 14-15s14 6 14 15c0-8 6-14 14-14s13 6 13 14c0-7 5-12 11-12s10 5 10 12v22c0 22-19 38-42 38H52C29 116 12 100 12 78z" />
        </clipPath>
      </defs>

      {/* forearm + rolled sleeve */}
      <path d="M40 108h44v18a6 6 0 0 1-6 6H46a6 6 0 0 1-6-6z" fill="#2a3a55" />
      <path d="M38 104h48v8H38z" fill="#3a4e70" />
      <path d="M38 104h48v3H38z" fill="#ffffff22" />

      {/* the hand mass */}
      <path
        d="M12 56c0-8 6-14 14-14s14 6 14 14c0-9 6-15 14-15s14 6 14 15c0-8 6-14 14-14s13 6 13 14c0-7 5-12 11-12s10 5 10 12v22c0 22-19 38-42 38H52C29 116 12 100 12 78z"
        fill="url(#dga-skin)"
        stroke="#8a563c"
        strokeWidth="2"
      />

      <g clipPath="url(#dga-handclip)">
        {/* four knuckle domes — index and middle sit proudest */}
        <ellipse cx="26" cy="56" rx="13" ry="11" fill="url(#dga-knuckle)" />
        <ellipse cx="54" cy="53" rx="14" ry="12" fill="url(#dga-knuckle)" />
        <ellipse cx="82" cy="55" rx="13.5" ry="11.5" fill="url(#dga-knuckle)" />
        <ellipse cx="107" cy="59" rx="11" ry="9.5" fill="url(#dga-knuckle)" />

        {/* tendons running back to the wrist */}
        <g stroke="#b07f63" strokeWidth="2" opacity=".45" fill="none" strokeLinecap="round">
          <path d="M26 66c1 14 2 24 4 34M54 64c0 15-1 25-2 36M82 66c-1 14-2 24-4 34M106 69c-2 12-4 21-7 30" />
        </g>
        {/* the crease where the fingers fold under */}
        <path d="M14 80q46 12 92 0" stroke="#a06d52" strokeWidth="2.4" fill="none" opacity=".55" />

        {/* ── DAMAGE ───────────────────────────────────────────────────── */}
        {/* 1 RAW */}
        {d >= 1 && (
          <>
            <ellipse cx="54" cy="48" rx="11" ry="6.5" fill="#c0392b" opacity=".6" />
            <ellipse cx="82" cy="50" rx="9.5" ry="5.5" fill="#c0392b" opacity=".5" />
            <ellipse cx="26" cy="51" rx="8" ry="4.5" fill="#c0392b" opacity=".38" />
          </>
        )}
        {/* 2 SPLIT — an open laceration across the middle knuckle */}
        {d >= 2 && (
          <>
            <path d="M43 47q11-6 22 0-5 6-11 6t-11-6z" fill="#7e0512" />
            <path d="M43 47q11-6 22 0" stroke="#4d020a" strokeWidth="2" fill="none" />
            <path d="M73 50q9-5 18 0-4 5-9 5t-9-5z" fill="#8d0a16" opacity=".9" />
          </>
        )}
        {/* 3 DRIPPING — a sheet running down the back of the hand */}
        {d >= 3 && (
          <>
            <path d="M50 52c-2 18 0 32 3 46M60 52c1 17 0 30-2 44M80 55c-1 15-3 27-5 39M30 54c0 14 1 25 3 36" stroke="#8d0a16" strokeWidth="3.4" fill="none" strokeLinecap="round" opacity=".82" />
            <path d="M14 74q46 14 92 0v20q-46 14-92 0z" fill="#7e0512" opacity=".4" />
            <ellipse cx="55" cy="104" rx="26" ry="8" fill="#6e0410" opacity=".45" />
          </>
        )}
        {/* 4 BONE-DEEP — the wound opens on a grey-white glint */}
        {d >= 4 && (
          <>
            <path d="M40 46q14-9 28 0-7 9-14 9t-14-9z" fill="#5c020c" />
            <path d="M48 46q7-4 13 0-3 4-6.5 4T48 46z" fill="#e8e2d6" />
            <path d="M71 49q11-6 21 0-5 6-10.5 6T71 49z" fill="#5c020c" />
            <path d="M77 49q5-3 9 0-2 3-4.5 3T77 49z" fill="#ded8ca" />
          </>
        )}
      </g>

      {/* swelling at 4 — the whole hand is bigger and it doesn't sit still */}
      {d >= 4 && <ellipse cx="60" cy="70" rx="52" ry="34" fill="#c0392b" opacity=".12" />}
    </svg>
  );
});

/* ════════════════════════════════════════════════════════════════════════
   <SlapArm/> — the wind-up slap, and the kick that shares its rig.

   The charge meter isn't a bar any more: the arm's ACTUAL rotation is the
   readout. You wind it back and up along an arc, the torso counter-rotates,
   five ghost arms trail behind it, and at full coil it quivers. Release runs
   ~200° in 130ms with a smear wedge bridging the poses.

   `charge` 0..1 is written to --coil imperatively by the caller — no render.
   ════════════════════════════════════════════════════════════════════════ */
export const SlapArm = React.forwardRef(function SlapArm({ kind = "slap", swinging = false }, ref) {
  const isKick = kind === "kick";
  return (
    <svg
      ref={ref}
      className={`dga-slap dga-slap--${kind} ${swinging ? "is-swing" : ""}`}
      viewBox="0 0 260 220"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="dga-slapskin" x1=".2" y1="0" x2=".8" y2="1">
          <stop offset="0" stopColor="#f0c1a8" />
          <stop offset="1" stopColor="#c0876a" />
        </linearGradient>
        <linearGradient id="dga-slapsleeve" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a6089" />
          <stop offset="1" stopColor="#2a3a58" />
        </linearGradient>
      </defs>

      {/* ghost trail — five fading copies of the limb, offset back along the arc */}
      <g className="dga-slap__ghosts">
        {[1, 2, 3, 4, 5].map((i) => (
          <g key={i} className="dga-slap__ghost" style={{ "--g": i }}>
            <rect x="-15" y="-8" width="104" height="30" rx="15" fill="#ffd9c4" opacity=".12" />
          </g>
        ))}
      </g>

      {/* the smear — a stretched wedge bridging start and end of the swing */}
      <path className="dga-slap__smear" d="M8 96 Q130 -10 246 74 Q140 44 22 122z" fill="#ffe6d2" opacity="0" />

      {/* the limb, pivoting at the shoulder */}
      <g className="dga-slap__arm">
        {isKick ? (
          <>
            {/* thigh → shin → boot */}
            <rect x="-10" y="-16" width="106" height="42" rx="20" fill="url(#dga-slapsleeve)" stroke="#1d2a44" strokeWidth="3" />
            <g className="dga-slap__fore" style={{ transform: "translate(92px, 4px)" }}>
              <rect x="-8" y="-14" width="88" height="34" rx="16" fill="url(#dga-slapsleeve)" stroke="#1d2a44" strokeWidth="3" />
              <g className="dga-slap__hand" style={{ transform: "translate(74px, 4px)" }}>
                <path d="M-16 -20 h44 a10 10 0 0 1 10 10 v18 a8 8 0 0 1 -8 8 h-46z" fill="#2b2f38" stroke="#14161c" strokeWidth="3" />
                <path d="M-20 12 h62 v9 h-62z" fill="#14161c" />
                <path d="M-10 -12 h26" stroke="#5c626e" strokeWidth="3" strokeLinecap="round" />
              </g>
            </g>
          </>
        ) : (
          <>
            {/* upper arm → forearm → open hand */}
            <rect x="-12" y="-15" width="98" height="38" rx="18" fill="url(#dga-slapsleeve)" stroke="#1d2a44" strokeWidth="3" />
            <rect x="70" y="-13" width="18" height="34" rx="6" fill="#5a719c" />
            <g className="dga-slap__fore" style={{ transform: "translate(84px, 4px)" }}>
              <rect x="-8" y="-13" width="80" height="30" rx="14" fill="url(#dga-slapskin)" stroke="#8a563c" strokeWidth="2.6" />
              {/* the open palm */}
              <g className="dga-slap__hand" style={{ transform: "translate(70px, 2px)" }}>
                <path d="M-6 -20 q24 -12 44 -2 q14 7 14 20 q0 20 -20 26 q-22 7 -38 -6z" fill="url(#dga-slapskin)" stroke="#8a563c" strokeWidth="2.6" />
                {/* fingers */}
                <g stroke="#a06d52" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity=".7">
                  <path d="M10 -14 q16 2 26 8M8 -4 q18 1 30 6M8 8 q16 2 26 4" />
                </g>
              </g>
            </g>
          </>
        )}
      </g>
    </svg>
  );
});

/* Radial speed lines that burst from a contact point. Sixteen tapered wedges,
   scaled out over 180ms — the classic impact frame, drawn not filtered. */
export function SpeedLines({ live = false }) {
  return (
    <svg className={`dga-speed ${live ? "is-live" : ""}`} viewBox="-60 -60 120 120" aria-hidden focusable="false">
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * 360;
        const len = 22 + (i % 3) * 9;
        return (
          <path
            key={i}
            d={`M0 -14 L3.4 -${14 + len} L-3.4 -${14 + len} z`}
            fill="#fff8e6"
            transform={`rotate(${a})`}
            opacity={0.55 + (i % 3) * 0.15}
          />
        );
      })}
    </svg>
  );
}

/* Convenience: pick the right slab for a skin. */
export function DoorForSkin({ skin, ...rest }) {
  return skin === "steel" || skin === "gate"
    ? <SteelDoor {...rest} />
    : <WoodDoor {...rest} />;
}

/* ── mount-time helper: keep a canvas glued to its scene ─────────────────
   Used by DoorLevel so every scene wires the FX layer identically. */
export function useFxCanvas(onReady) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cbRef = useRef(onReady);
  cbRef.current = onReady;
  useEffect(() => {
    if (cbRef.current) cbRef.current(canvasRef.current, sceneRef.current);
  }, []);
  return { canvasRef, sceneRef };
}

export default WoodDoor;

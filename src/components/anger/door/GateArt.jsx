import React from "react";

/* ════════════════════════════════════════════════════════════════════════
   GATE ART — the community gate and the security that patrols it.

   These used to be narration. "There's a wall. A gate. A sign that says
   FUCK OFF. You climbed all three" was a cine card over the same wooden
   door. Now the wall, the gate, the callbox, the guard booth and the
   flashlight all exist and all get in your way.

   The chain-link mesh is built the way real chain-link is built: two
   crossing zig-zag paths tiled as an SVG <pattern>, which reads as
   interlocked helical wire instead of a lattice of diamonds.
   ════════════════════════════════════════════════════════════════════════ */

/* ── the wall + gate you have to get past ─────────────────────────────── */
export const GateWall = React.forwardRef(function GateWall({ shake = 0, climbed = 0, breached = false }, ref) {
  return (
    <svg
      ref={ref}
      className={`dgg-wall ${breached ? "is-breached" : ""}`}
      viewBox="0 0 320 240"
      preserveAspectRatio="xMidYMax meet"
      style={{ "--shake": shake, "--climb": climbed }}
      aria-hidden
      focusable="false"
    >
      <defs>
        <pattern id="dgg-mesh" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M0 0 11 11 0 22M11 11 22 0M11 11 22 22" fill="none" stroke="#b6c0cc" strokeWidth="2" strokeLinecap="round" />
          <path d="M0 0 11 11 0 22M11 11 22 0M11 11 22 22" fill="none" stroke="#5d6570" strokeWidth="0.7" />
        </pattern>
        <linearGradient id="dgg-brick" x1="0" y1="0" x2=".3" y2="1">
          <stop offset="0" stopColor="#7d4b36" />
          <stop offset="1" stopColor="#4a2a1c" />
        </linearGradient>
        <linearGradient id="dgg-iron" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#414852" />
          <stop offset=".5" stopColor="#252a32" />
          <stop offset="1" stopColor="#14181e" />
        </linearGradient>
      </defs>

      {/* ── brick piers ───────────────────────────────────────────────── */}
      {[2, 268].map((x) => (
        <g key={x}>
          <rect x={x} y="40" width="50" height="200" fill="url(#dgg-brick)" />
          <g stroke="#00000055" strokeWidth="1.4">
            {Array.from({ length: 10 }, (_, r) => <path key={r} d={`M${x} ${56 + r * 19}h50`} />)}
            {Array.from({ length: 10 }, (_, r) => (
              <path key={`v${r}`} d={`M${x + (r % 2 ? 25 : 12)} ${56 + r * 19}v19`} />
            ))}
          </g>
          <rect x={x - 6} y="30" width="62" height="14" rx="3" fill="#8d5a41" />
          <rect x={x - 6} y="30" width="62" height="4" rx="2" fill="#a06c4e" />
        </g>
      ))}

      {/* ── the chain-link panel — it flexes when you shake it ────────── */}
      <g className="dgg-mesh">
        <rect x="52" y="66" width="216" height="174" fill="url(#dgg-mesh)" />
        {/* tension rails */}
        <rect x="52" y="62" width="216" height="8" rx="3" fill="#96a0ac" />
        <rect x="52" y="232" width="216" height="8" rx="3" fill="#96a0ac" />
        {/* line posts */}
        <rect x="122" y="62" width="7" height="178" fill="#96a0ac" />
        <rect x="192" y="62" width="7" height="178" fill="#96a0ac" />
      </g>

      {/* ── barbed wire, arms out at 45° ─────────────────────────────── */}
      <g className="dgg-barb">
        <g stroke="#a9b3bf" strokeWidth="2.4" fill="none" strokeLinecap="round">
          <path d="M52 66 34 44M125 66 107 44M195 66 177 44M268 66 250 44" />
        </g>
        <g stroke="#c2ccd8" strokeWidth="1.8" fill="none">
          <path d="M34 44h216M34 52h216M34 36h216" />
        </g>
        {/* twist barbs every 12px */}
        <g stroke="#dbe3ec" strokeWidth="2.2" strokeLinecap="round">
          {Array.from({ length: 19 }, (_, i) => (
            <path key={i} d={`M${38 + i * 12} 32v24`} opacity=".85" />
          ))}
        </g>
      </g>

      {/* ── the iron gate leaves ─────────────────────────────────────── */}
      <g className="dgg-leaves">
        <g className="dgg-leaf dgg-leaf--l">
          {[130, 142, 154].map((x) => (
            <g key={x}>
              <rect x={x} y="90" width="6" height="146" fill="url(#dgg-iron)" />
              <path d={`M${x - 3} 90 ${x + 3} 76 ${x + 9} 90z`} fill="url(#dgg-iron)" />
            </g>
          ))}
          <rect x="126" y="112" width="38" height="7" fill="url(#dgg-iron)" />
          <rect x="126" y="204" width="38" height="7" fill="url(#dgg-iron)" />
        </g>
        <g className="dgg-leaf dgg-leaf--r">
          {[166, 178, 190].map((x) => (
            <g key={x}>
              <rect x={x} y="90" width="6" height="146" fill="url(#dgg-iron)" />
              <path d={`M${x - 3} 90 ${x + 3} 76 ${x + 9} 90z`} fill="url(#dgg-iron)" />
            </g>
          ))}
          <rect x="162" y="112" width="38" height="7" fill="url(#dgg-iron)" />
          <rect x="162" y="204" width="38" height="7" fill="url(#dgg-iron)" />
        </g>
        {/* the scrolled centre medallion */}
        <g className="dgg-medallion">
          <circle cx="163" cy="158" r="20" fill="none" stroke="url(#dgg-iron)" strokeWidth="5" />
          <path d="M163 142q14 8 0 16t0 16" fill="none" stroke="url(#dgg-iron)" strokeWidth="4" />
        </g>
      </g>

      {/* ── chain + padlock ──────────────────────────────────────────── */}
      <g className="dgg-lock">
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse key={i} cx={142 + i * 7} cy="176" rx="4.6" ry="3" fill="none" stroke="#909aa6" strokeWidth="2.4" />
        ))}
        <rect x="156" y="182" width="17" height="15" rx="3" fill="#c9a233" stroke="#8a6e18" strokeWidth="1.4" />
        <path d="M160 182v-5a4.5 4.5 0 0 1 9 0v5" fill="none" stroke="#909aa6" strokeWidth="3" />
        <circle cx="164.5" cy="190" r="2" fill="#5c4a12" />
      </g>

      {/* ── your hands on the mesh as you climb ──────────────────────── */}
      <g className="dgg-hands">
        <ellipse className="dgg-hand dgg-hand--l" cx="96" cy="180" rx="11" ry="8" fill="#dda78c" stroke="#8a563c" strokeWidth="2" />
        <ellipse className="dgg-hand dgg-hand--r" cx="226" cy="180" rx="11" ry="8" fill="#dda78c" stroke="#8a563c" strokeWidth="2" />
      </g>

      {/* the sign, because he did put one up */}
      <g transform="rotate(-5 160 108)">
        <rect x="122" y="92" width="76" height="34" rx="3" fill="#FFD84D" stroke="#14100a" strokeWidth="3" />
        <text x="160" y="107" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="900" fontSize="12" fill="#14100a">NO</text>
        <text x="160" y="120" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="900" fontSize="10" fill="#14100a">SOLICITING</text>
      </g>
    </svg>
  );
});

/* ── the callbox you buzz ─────────────────────────────────────────────── */
export function Callbox({ pressed = -1, talking = false }) {
  return (
    <svg className={`dgg-callbox ${talking ? "is-talking" : ""}`} viewBox="0 0 90 150" aria-hidden focusable="false">
      <defs>
        <linearGradient id="dgg-steel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d2d9e2" />
          <stop offset=".5" stopColor="#98a1ac" />
          <stop offset="1" stopColor="#5a626d" />
        </linearGradient>
      </defs>

      {/* post */}
      <rect x="38" y="96" width="14" height="54" fill="#4c525a" />
      <rect x="38" y="96" width="4" height="54" fill="#6b727c" />

      {/* faceplate */}
      <rect x="6" y="4" width="78" height="98" rx="7" fill="url(#dgg-steel)" stroke="#41474f" strokeWidth="2" />
      <rect x="10" y="8" width="70" height="90" rx="5" fill="none" stroke="#ffffff40" strokeWidth="1.4" />

      {/* directory screen */}
      <rect x="14" y="12" width="62" height="20" rx="2.5" fill="#0d1a24" />
      <text className="dgg-callbox__screen" x="45" y="25" textAnchor="middle" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize="8.5" fill="#7fe6b0">
        {talking ? "CONNECTED" : "DIAL UNIT #"}
      </text>

      {/* speaker grille — drilled holes, not a rounded rect */}
      <g fill="#2f353d">
        {Array.from({ length: 4 }, (_, r) =>
          Array.from({ length: 9 }, (_, c) => (
            <circle key={`${r}${c}`} cx={17 + c * 7} cy={38 + r * 5} r="1.5" />
          ))
        )}
      </g>

      {/* 12-key pad */}
      <g>
        {Array.from({ length: 12 }, (_, i) => {
          const c = i % 3, r = (i / 3) | 0;
          const on = pressed === i;
          return (
            <g key={i} className={`dgg-key ${on ? "is-down" : ""}`}>
              <rect x={17 + c * 20} y={62 + r * 9} width="16" height="7" rx="1.6" fill={on ? "#FFD84D" : "#5f6771"} />
              <text
                x={25 + c * 20} y={68 + r * 9} textAnchor="middle"
                fontFamily="Manrope, sans-serif" fontWeight="800" fontSize="5"
                fill={on ? "#14100a" : "#c9d1db"}
              >
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"][i]}
              </text>
            </g>
          );
        })}
      </g>

      {/* the LED that tells you someone's listening */}
      <circle className={`dgg-callbox__led ${talking ? "is-live" : ""}`} cx="74" cy="16" r="3" fill={talking ? "#41FF6B" : "#ff3b3b"} />
    </svg>
  );
}

/* ── the guard booth ──────────────────────────────────────────────────── */
export function GuardBooth({ alert = false }) {
  return (
    <svg className={`dgg-booth ${alert ? "is-alert" : ""}`} viewBox="0 0 150 170" aria-hidden focusable="false">
      {/* roof */}
      <path d="M4 44 75 12 146 44z" fill="#2c333c" />
      <rect x="10" y="42" width="130" height="7" rx="2" fill="#3c444f" />

      {/* hut */}
      <rect x="16" y="48" width="118" height="110" fill="#4c5560" />
      <rect x="16" y="48" width="118" height="110" fill="none" stroke="#2a3038" strokeWidth="3" />

      {/* the slid-open window */}
      <rect x="28" y="62" width="94" height="48" rx="2" fill="#0d1620" stroke="#20272f" strokeWidth="3" />
      {/* the wall of monitors glowing inside */}
      <g className="dgg-booth__screens">
        <rect x="34" y="68" width="26" height="18" rx="1.5" fill="#1d4f6e" />
        <rect x="64" y="68" width="26" height="18" rx="1.5" fill="#18425c" />
        <rect x="94" y="68" width="22" height="18" rx="1.5" fill="#215a7d" />
        <rect x="34" y="90" width="26" height="16" rx="1.5" fill="#16394f" />
        <rect x="64" y="90" width="52" height="16" rx="1.5" fill="#1d4f6e" />
      </g>
      {/* the sliding pane, half open */}
      <rect x="86" y="62" width="36" height="48" fill="#a8c8dd" opacity=".22" stroke="#20272f" strokeWidth="2" />

      {/* SECURITY plate */}
      <rect x="34" y="120" width="82" height="20" rx="3" fill="#14181e" stroke="#c0392b" strokeWidth="2" />
      <text x="75" y="134" textAnchor="middle" fontFamily="Sora, sans-serif" fontWeight="900" fontSize="11" letterSpacing="1.4" fill="#e05c4d">SECURITY</text>

      {/* boom barrier */}
      <g className="dgg-boom">
        <circle cx="140" cy="120" r="9" fill="#3c444f" />
        <rect className="dgg-boom__arm" x="140" y="114" width="118" height="11" rx="3" fill="#c0392b" />
        <g className="dgg-boom__arm" fill="#f2f2f2">
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={152 + i * 24} y="114" width="12" height="11" />)}
        </g>
      </g>
    </svg>
  );
}

/* ── the patrolling flashlight ────────────────────────────────────────────
   A real cone with soft falloff and dust motes riding inside it. It sweeps
   the street on a loop; getting caught in it mid-climb costs you.          */
export function Flashlight({ sweeping = true, caught = false }) {
  return (
    <svg className={`dgg-torch ${sweeping ? "is-sweeping" : ""} ${caught ? "is-caught" : ""}`} viewBox="0 0 240 300" aria-hidden focusable="false">
      <defs>
        <linearGradient id="dgg-cone" x1=".5" y1="0" x2=".5" y2="1">
          <stop offset="0" stopColor="#fff6d8" stopOpacity=".72" />
          <stop offset=".45" stopColor="#ffe9a8" stopOpacity=".3" />
          <stop offset="1" stopColor="#ffdf8a" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="dgg-bulb" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fffdf2" />
          <stop offset="1" stopColor="#ffd97a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="dgg-torch__pivot">
        {/* the cone */}
        <path d="M120 8 214 292H26z" fill="url(#dgg-cone)" />
        {/* volumetric dust riding in the beam */}
        <g className="dgg-torch__motes" fill="#fff8e0">
          {[[112, 70, 1.4], [130, 108, 1.1], [96, 146, 1.6], [148, 178, 1.2], [80, 210, 1.5],
            [162, 232, 1.1], [118, 254, 1.4], [138, 60, 1], [92, 190, 1.2]].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} opacity=".55" style={{ animationDelay: `${i * -0.7}s` }} />
          ))}
        </g>
        {/* the lens */}
        <circle cx="120" cy="10" r="16" fill="url(#dgg-bulb)" />
        <circle cx="120" cy="10" r="6.5" fill="#fffdf2" />
      </g>
    </svg>
  );
}

/* ── the ring cam POV ─────────────────────────────────────────────────────
   He won't open, but he'll TALK — through the camera. The whole scene
   shifts into a 4K fisheye: barrel-distorted, timestamped, scanlined, and
   jittering every time your fist lands on the lens.
   ════════════════════════════════════════════════════════════════════════ */
export function RingCamFrame({ recording = true, stamp = "03:14:07", knocks = 0 }) {
  return (
    <div className="dgg-cam" aria-hidden>
      {/* the barrel warp + vignette that sells the fisheye */}
      <div className="dgg-cam__warp" />
      <div className="dgg-cam__vig" />
      <div className="dgg-cam__scan" />

      <div className="dgg-cam__hud">
        <span className={`dgg-cam__rec ${recording ? "is-live" : ""}`}>
          <i /> REC
        </span>
        <span className="dgg-cam__res">3840×2160 · 30FPS</span>
      </div>
      <div className="dgg-cam__stamp">{stamp}</div>
      <div className="dgg-cam__meta">FRONT DOOR · MOTION DETECTED ×{knocks}</div>

      {/* the lens housing, seen from inside its own picture */}
      <svg className="dgg-cam__ring" viewBox="0 0 100 100" focusable="false">
        <circle cx="50" cy="50" r="46" fill="none" stroke="#0a3d62" strokeWidth="2.4" opacity=".55" />
        <circle className="dgg-cam__led" cx="50" cy="50" r="42" fill="none" stroke="#3aa0ff" strokeWidth="3" strokeDasharray="4 6" opacity=".8" />
      </svg>
    </div>
  );
}

export default GateWall;

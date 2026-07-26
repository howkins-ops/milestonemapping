import React from "react";

/* ════════════════════════════════════════════════════════════════════════
   BOXER — the Punch-Out rig.

   A posed SVG skeleton, not a sprite sheet. Every pose is a set of numbers;
   CSS transitions tween between them, so a bout costs a handful of React
   renders per second instead of one per frame.

   THE ONE RULE FROM SUPER PUNCH-OUT!!: the player is drawn SEMI-TRANSPARENT
   in the foreground. It looks like a bug and it is the single best decision
   in that game — you can always read the opponent's tell straight through
   your own body. <PlayerSilhouette/> honours it exactly.

   Coordinate space: 200 × 260, feet on the floor at y=248.
   ════════════════════════════════════════════════════════════════════════ */

/* ── poses ────────────────────────────────────────────────────────────────
   body/head: translate + rotate. arms: shoulder rot, elbow rot, glove scale
   (the scale is the "coming at the camera" cheat — a thrown glove gets big).
   `face` picks an expression. Everything is degrees / px.                  */
const P = (o) => ({
  body: { x: 0, y: 0, r: 0 }, head: { x: 0, y: 0, r: 0 },
  armL: { s: -18, e: -46, g: 1 }, armR: { s: 18, e: 46, g: 1 },
  legs: 0, face: "calm", ...o,
});

const POSES = {
  /* ── neutral ──────────────────────────────────────────────────────── */
  idle:   P({ face: "calm" }),
  guard:  P({ armL: { s: -30, e: -74, g: 1 }, armR: { s: 30, e: 74, g: 1 }, face: "angry" }),
  bounce: P({ body: { x: 0, y: -3, r: 0 }, face: "angry" }),

  /* ── tells — each one has to be readable at a glance ──────────────── */
  raise:  P({ armR: { s: -128, e: -30, g: 1.05 }, body: { x: -3, y: -2, r: -5 }, head: { x: 0, y: 1, r: -4 }, face: "roar" }),
  lean:   P({ body: { x: 0, y: 4, r: 9 }, head: { x: 4, y: 2, r: 6 }, armL: { s: -54, e: -20, g: 1 }, armR: { s: 54, e: 20, g: 1 }, face: "roar" }),
  wind:   P({ armR: { s: 128, e: 62, g: 1 }, body: { x: 8, y: 0, r: 12 }, head: { x: 3, y: 0, r: 8 }, face: "roar" }),
  flick:  P({ armR: { s: 8, e: 96, g: 1 }, body: { x: 2, y: 0, r: 3 }, face: "grin" }),
  squat:  P({ body: { x: 0, y: 16, r: 0 }, legs: 14, head: { x: 0, y: 3, r: 0 }, armL: { s: -70, e: -30, g: 1 }, armR: { s: 70, e: 30, g: 1 }, face: "roar" }),
  chop:   P({ armR: { s: -110, e: -14, g: 1 }, body: { x: -4, y: -1, r: -7 }, face: "angry" }),
  knee:   P({ legs: -18, body: { x: 0, y: -6, r: -4 }, armL: { s: -46, e: -60, g: 1 }, armR: { s: 46, e: 60, g: 1 }, face: "angry" }),
  coil:   P({ body: { x: -10, y: 2, r: -22 }, head: { x: -6, y: 1, r: -16 }, armL: { s: -100, e: -20, g: 1 }, armR: { s: 20, e: 80, g: 1 }, legs: 10, face: "roar" }),
  cock:   P({ armR: { s: 96, e: 40, g: 1 }, body: { x: 6, y: 0, r: 9 }, face: "roar" }),
  rear:   P({ armL: { s: -96, e: -40, g: 1 }, body: { x: -6, y: 0, r: -9 }, face: "roar" }),
  tuck:   P({ head: { x: 0, y: 8, r: 0 }, body: { x: 0, y: 4, r: 0 }, armL: { s: -34, e: -92, g: 1 }, armR: { s: 34, e: 92, g: 1 }, face: "roar" }),
  hoist:  P({ armL: { s: -150, e: -10, g: 1.1 }, armR: { s: 150, e: 10, g: 1.1 }, body: { x: 0, y: -6, r: 0 }, head: { x: 0, y: 2, r: 0 }, face: "roar" }),
  bow:    P({ body: { x: 0, y: 12, r: 26 }, head: { x: 6, y: 6, r: 22 }, armL: { s: -10, e: -8, g: 1 }, armR: { s: 10, e: 8, g: 1 }, face: "calm" }),

  /* ── the strike — glove blows up toward the camera ────────────────── */
  strike: P({ armR: { s: 2, e: 2, g: 2.5 }, body: { x: 10, y: 2, r: 6 }, head: { x: 4, y: 1, r: 3 }, face: "roar" }),
  strikeL: P({ armL: { s: -2, e: -2, g: 2.5 }, body: { x: -10, y: 2, r: -6 }, head: { x: -4, y: 1, r: -3 }, face: "roar" }),

  /* ── reactions ────────────────────────────────────────────────────── */
  open:   P({ armL: { s: -8, e: -6, g: .95 }, armR: { s: 8, e: 6, g: .95 }, body: { x: 0, y: 6, r: 0 }, head: { x: 0, y: 4, r: 0 }, face: "dazed" }),
  hurt:   P({ head: { x: -6, y: -6, r: -22 }, body: { x: -5, y: 0, r: -8 }, armL: { s: -12, e: -14, g: 1 }, armR: { s: 12, e: 14, g: 1 }, face: "hurt" }),
  block:  P({ armL: { s: -38, e: -104, g: 1 }, armR: { s: 38, e: 104, g: 1 }, head: { x: 0, y: 4, r: 0 }, face: "angry" }),
  stun:   P({ head: { x: 3, y: 2, r: 14 }, body: { x: 2, y: 8, r: 5 }, armL: { s: -6, e: -4, g: .9 }, armR: { s: 6, e: 4, g: .9 }, legs: 8, face: "dazed" }),
  ko:     P({ body: { x: 0, y: 62, r: 84 }, head: { x: -14, y: 10, r: 30 }, armL: { s: -120, e: -8, g: .9 }, armR: { s: 120, e: 8, g: .9 }, legs: 22, face: "ko" }),
};

export const POSE_NAMES = Object.keys(POSES);

/* ── faces ────────────────────────────────────────────────────────────── */
function Face({ kind, look }) {
  const brow = {
    calm: "M-13 -7 L-4 -5 M13 -7 L4 -5",
    angry: "M-14 -10 L-3 -4 M14 -10 L3 -4",
    roar: "M-15 -12 L-2 -3 M15 -12 L2 -3",
    grin: "M-14 -8 L-3 -6 M14 -8 L3 -6",
    hurt: "M-13 -4 L-4 -9 M13 -4 L4 -9",
    dazed: "M-13 -6 L-4 -8 M13 -6 L4 -8",
    ko: "M-13 -5 L-4 -8 M13 -5 L4 -8",
  }[kind] || "M-13 -7 L-4 -5 M13 -7 L4 -5";

  const mouth = {
    calm: "M-7 12 Q0 14 7 12",
    angry: "M-8 13 Q0 9 8 13",
    roar: "M-9 9 Q0 22 9 9 Q0 15 -9 9",
    grin: "M-9 10 Q0 19 9 10",
    hurt: "M-8 14 Q0 8 8 14",
    dazed: "M-7 13 q3.5 -5 7 0 q3.5 5 7 0",
    ko: "M-8 13 Q0 7 8 13",
  }[kind] || "M-7 12 Q0 14 7 12";

  const dazedEyes = kind === "dazed" || kind === "ko";

  return (
    <g className="dgb-face">
      {/* eyes */}
      {dazedEyes ? (
        <>
          <path d="M-13 0 L-3 0 M-8 -5 L-8 5" stroke="#1a1a1a" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M3 0 L13 0 M8 -5 L8 5" stroke="#1a1a1a" strokeWidth="2.4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="-8" cy="0" rx="4.6" ry={kind === "roar" ? 5.4 : 4} fill="#fdfdfd" />
          <ellipse cx="8" cy="0" rx="4.6" ry={kind === "roar" ? 5.4 : 4} fill="#fdfdfd" />
          <circle cx={kind === "hurt" ? -9.5 : -7.4} cy={kind === "hurt" ? -1 : 0.6} r="2.2" fill="#141414" />
          <circle cx={kind === "hurt" ? 6.5 : 8.6} cy={kind === "hurt" ? -1 : 0.6} r="2.2" fill="#141414" />
        </>
      )}
      <path d={brow} stroke={look.hair} strokeWidth="3.4" strokeLinecap="round" fill="none" />
      <path d={mouth} stroke="#5c1f22" strokeWidth="2.6" strokeLinecap="round" fill={kind === "roar" ? "#5c1f22" : "none"} />
      {kind === "roar" && <path d="M-5 11 h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />}
    </g>
  );
}

/* ── props ────────────────────────────────────────────────────────────── */
function Prop({ kind }) {
  if (kind === "newspaper") {
    return (
      <g className="dgb-prop">
        <rect x="-6" y="-30" width="13" height="34" rx="2" fill="#e8e2d2" stroke="#9c9584" strokeWidth="1.4" transform="rotate(-8)" />
        <g stroke="#9c9584" strokeWidth="1" opacity=".8">
          <path d="M-3 -24h7M-3.6 -20h8M-4 -16h8M-4.4 -12h8" transform="rotate(-8)" />
        </g>
      </g>
    );
  }
  if (kind === "plunger") {
    return (
      <g className="dgb-prop">
        <rect x="-2.4" y="-34" width="5" height="30" rx="2" fill="#8a5a2a" />
        <path d="M-11 -6 q11 -8 22 0 q-2 12 -11 12 t-11 -12z" fill="#8b1a1a" stroke="#5c0f0f" strokeWidth="1.4" />
      </g>
    );
  }
  return null;
}

/* ── one arm ──────────────────────────────────────────────────────────── */
function Arm({ side, pose, look, prop, dur }) {
  const a = side === "l" ? pose.armL : pose.armR;
  const sx = side === "l" ? 62 : 138;
  const flip = side === "l" ? -1 : 1;
  return (
    <g
      className={`dgb-arm dgb-arm--${side}`}
      style={{ transform: `translate(${sx}px, 104px) rotate(${a.s}deg)`, transitionDuration: `${dur}ms` }}
    >
      {/* upper arm */}
      <rect x="-9" y="-2" width="18" height="40" rx="9" fill={look.skin} stroke="#00000033" strokeWidth="1.4" />
      {/* forearm pivots at the elbow */}
      <g style={{ transform: `translate(0px, 36px) rotate(${a.e}deg)`, transitionDuration: `${dur}ms` }}>
        <rect x="-8.5" y="-2" width="17" height="36" rx="8.5" fill={look.skin} stroke="#00000033" strokeWidth="1.4" />
        {/* glove — scales toward the camera on a thrown punch */}
        <g style={{ transform: `translate(0px, 38px) scale(${a.g})`, transitionDuration: `${dur}ms` }}>
          {prop && side === "r" ? (
            <Prop kind={prop} />
          ) : (
            <>
              <circle cx="0" cy="0" r="15" fill={look.trim} stroke="#00000044" strokeWidth="2" />
              <path d={`M${-13 * flip} -6 q${9 * flip} -9 ${17 * flip} -1`} stroke="#ffffff44" strokeWidth="3" fill="none" strokeLinecap="round" />
              <rect x="-9" y="-19" width="18" height="7" rx="3" fill={look.cloth} />
            </>
          )}
        </g>
      </g>
    </g>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   <Boxer/> — the opponent. Big, centred, thick-outlined, low frame count.
   ════════════════════════════════════════════════════════════════════════ */
export function Boxer({ boss, pose = "guard", raging = false, flash = false, dur = 120 }) {
  const p = POSES[pose] || POSES.guard;
  const look = boss.look;
  const isKo = pose === "ko";

  return (
    <svg
      className={`dgb ${raging ? "is-raging" : ""} ${flash ? "is-flash" : ""} ${isKo ? "is-ko" : ""}`}
      viewBox="0 0 200 260"
      aria-hidden
      focusable="false"
      data-pose={pose}
    >
      <defs>
        <linearGradient id={`dgb-cloth-${boss.id}`} x1="0" y1="0" x2=".4" y2="1">
          <stop offset="0" stopColor={look.cloth} />
          <stop offset="1" stopColor="#00000055" />
        </linearGradient>
        <radialGradient id={`dgb-skin-${boss.id}`} cx=".38" cy=".3" r=".8">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".22" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* contact shadow keeps him standing on something */}
      <ellipse className="dgb-shadow" cx="100" cy="250" rx={isKo ? 68 : 44} ry="8" fill="#000" opacity=".45" />

      <g
        className="dgb-body"
        style={{ transform: `translate(${p.body.x}px, ${p.body.y}px) rotate(${p.body.r}deg)`, transitionDuration: `${dur}ms` }}
      >
        {/* legs */}
        <g className="dgb-legs" style={{ transform: `translateY(${p.legs}px)`, transitionDuration: `${dur}ms` }}>
          <path d={`M78 168 L${70 - p.legs * 0.6} 246 h22 L92 168z`} fill={`url(#dgb-cloth-${boss.id})`} stroke="#00000044" strokeWidth="2" />
          <path d={`M108 168 L${130 + p.legs * 0.6} 246 h-22 L122 168z`} fill={`url(#dgb-cloth-${boss.id})`} stroke="#00000044" strokeWidth="2" />
          {/* boots */}
          <rect x={66 - p.legs * 0.6} y="240" width="30" height="10" rx="4" fill="#20242c" />
          <rect x={104 + p.legs * 0.6} y="240" width="30" height="10" rx="4" fill="#20242c" />
        </g>

        {/* torso */}
        <path d="M62 96 q38 -14 76 0 l10 74 q-48 12 -96 0z" fill={look.skin} stroke="#00000044" strokeWidth="2.4" />
        <path d="M62 96 q38 -14 76 0 l10 74 q-48 12 -96 0z" fill={`url(#dgb-skin-${boss.id})`} />
        {/* the shirt / gi / vest */}
        {boss.prop === "gi" ? (
          <>
            <path d="M64 98 q36 -12 72 0 l8 70 q-44 11 -88 0z" fill={look.cloth} stroke="#00000033" strokeWidth="1.6" />
            <path d="M100 92 L82 172 M100 92 L118 172" stroke="#00000022" strokeWidth="2" fill="none" />
            <rect x="56" y="152" width="88" height="13" rx="3" fill={look.trim} />
            <path d="M56 158h88" stroke="#00000044" strokeWidth="1.4" />
          </>
        ) : (
          <>
            <path d="M70 100 q30 -10 60 0 l6 68 q-36 9 -72 0z" fill={look.cloth} opacity=".92" stroke="#00000022" strokeWidth="1.4" />
            {/* belly, because these are not athletes */}
            {look.build === "heavy" && <ellipse cx="100" cy="150" rx="34" ry="22" fill="#00000018" />}
          </>
        )}

        {/* arms sit over the torso */}
        <Arm side="l" pose={p} look={look} prop={null} dur={dur} />
        <Arm side="r" pose={p} look={look} prop={boss.prop === "newspaper" || boss.prop === "plunger" ? boss.prop : null} dur={dur} />

        {/* head */}
        <g
          className="dgb-head"
          style={{ transform: `translate(${100 + p.head.x}px, ${62 + p.head.y}px) rotate(${p.head.r}deg)`, transitionDuration: `${dur}ms` }}
        >
          {/* neck */}
          <rect x="-11" y="20" width="22" height="18" rx="6" fill={look.skin} stroke="#00000033" strokeWidth="1.4" />
          <ellipse cx="0" cy="0" rx="30" ry="33" fill={look.skin} stroke="#00000055" strokeWidth="2.6" />
          <ellipse cx="0" cy="0" rx="30" ry="33" fill={`url(#dgb-skin-${boss.id})`} />
          {/* ears */}
          <ellipse cx="-30" cy="2" rx="5" ry="8" fill={look.skin} stroke="#00000033" strokeWidth="1.4" />
          <ellipse cx="30" cy="2" rx="5" ry="8" fill={look.skin} stroke="#00000033" strokeWidth="1.4" />
          {/* hair */}
          <path d="M-30 -6 q4 -30 30 -30 t30 30 q-10 -14 -30 -14 t-30 14z" fill={look.hair} />
          <Face kind={p.face} look={look} />
          {/* the sweat that says he's in trouble */}
          <g className="dgb-sweat">
            <ellipse cx="-24" cy="-14" rx="2.6" ry="4" fill="#bfe6ff" opacity=".85" />
            <ellipse cx="25" cy="-8" rx="2.2" ry="3.4" fill="#bfe6ff" opacity=".7" />
          </g>
        </g>
      </g>

      {/* rage aura */}
      {raging && (
        <g className="dgb-rage" opacity=".5">
          <ellipse cx="100" cy="120" rx="86" ry="120" fill="none" stroke="#ff2d55" strokeWidth="4" />
        </g>
      )}
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   <PlayerSilhouette/> — YOU, from behind and below.

   Deliberately semi-transparent. In Super Punch-Out!! the player sprite is
   see-through so the opponent's tell is never occluded by your own shoulders.
   Same reason here — with a rim light so it still reads as a body.
   ════════════════════════════════════════════════════════════════════════ */
export function PlayerSilhouette({ guard = "up", ducking = false, punching = null, hurt = false }) {
  return (
    <svg
      className={`dgb-me ${ducking ? "is-ducking" : ""} ${hurt ? "is-hurt" : ""} ${punching ? `is-punch-${punching}` : ""}`}
      viewBox="0 0 300 150"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient id="dgb-me-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#39435c" />
          <stop offset="1" stopColor="#1a2030" />
        </linearGradient>
      </defs>

      {/* head + shoulders, bottom-centre */}
      <g className="dgb-me__body">
        <path d="M96 150 q0 -46 54 -46 t54 46z" fill="url(#dgb-me-body)" />
        <circle cx="150" cy="96" r="27" fill="url(#dgb-me-body)" />
        {/* rim light — the thing that keeps a transparent body readable */}
        <path d="M96 150 q0 -46 54 -46 t54 46" fill="none" stroke="#8fb6ff" strokeWidth="2.4" opacity=".65" />
        <circle cx="150" cy="96" r="27" fill="none" stroke="#8fb6ff" strokeWidth="2.2" opacity=".55" />
      </g>

      {/* gloves */}
      <g className={`dgb-me__glove dgb-me__glove--l ${guard === "up" ? "is-up" : ""}`}>
        <circle cx="78" cy="112" r="26" fill="#8b1a2b" stroke="#c8324a" strokeWidth="2.4" />
        <path d="M64 104 q14 -12 28 -2" stroke="#ffffff55" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
      <g className={`dgb-me__glove dgb-me__glove--r ${guard === "up" ? "is-up" : ""}`}>
        <circle cx="222" cy="112" r="26" fill="#8b1a2b" stroke="#c8324a" strokeWidth="2.4" />
        <path d="M208 104 q14 -12 28 -2" stroke="#ffffff55" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   <Crowd/> — the neighbours on their lawns.
   Thirty heads bobbing on offset sines. They flash on a big hit. Cheap, and
   without them the porch reads as a diorama instead of an arena.
   ════════════════════════════════════════════════════════════════════════ */
const CROWD = Array.from({ length: 30 }, (_, i) => ({
  x: 6 + (i % 15) * 6.6 + (i > 14 ? 3.2 : 0),
  y: i > 14 ? 13 : 20,
  s: 0.78 + ((i * 37) % 10) / 22,
  d: ((i * 53) % 100) / 100,
  hue: [
    "#3c2f2a", "#5a4034", "#2b2b33", "#4a3a2c", "#6b4a3a",
    "#33323d", "#57433a", "#40352e",
  ][i % 8],
}));

export function Crowd({ flash = false }) {
  return (
    <svg className={`dgb-crowd ${flash ? "is-flash" : ""}`} viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden focusable="false">
      {CROWD.map((c, i) => (
        <g key={i} style={{ animationDelay: `${c.d * -2.4}s` }} className="dgb-crowd__p">
          <ellipse cx={c.x} cy={c.y + 4} rx={2.1 * c.s} ry={2.6 * c.s} fill={c.hue} />
          <circle cx={c.x} cy={c.y} r={1.5 * c.s} fill={c.hue} />
        </g>
      ))}
    </svg>
  );
}

export default Boxer;

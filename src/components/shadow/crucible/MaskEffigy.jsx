import React, { useId, useMemo } from "react";

// ════════════════════════════════════════════════════════════════════════
// THE CRUCIBLE — the effigy.
//
// NOT the City's MaskSprite. That file draws full standing boss rigs in
// three flat tones (silhouette-first, ~20 paths). This draws something
// deliberately different: a single cast-lead FACE PLATE hanging on a chain
// over the crucible mouth. No body, no legs — just the thing you pulled
// off your own face, swinging.
//
// FIDELITY (the "4K" ask, done the cheap way — vectors, not bitmaps):
//   · feTurbulence + feDisplacementMap gives the lead a real cast-surface
//     pitting that stays crisp at any zoom, where a PNG would go soft
//   · a three-stop specular gradient + inner shadow gives it weight
//   · the heat is not a bar — it IS the material. `heat` 0→1 drives the
//     molten underlayer, the seam glow and the eye embers, so the mask
//     visibly goes cold-lead → dull red → orange → white-gold as the
//     fight is won. The metal is the health bar.
//
// PERF LAW (learned the hard way on the boot cinematic):
//   · ONE filter on ONE static group — never a filter per path
//   · NO infinite animation inside a filtered subtree — the sway/breathe
//     animations live on the unfiltered wrapper, and the pulsing seams
//     and embers live in a sibling group outside the filter
//
// props
//   kind    king | saint | genius | victim | warrior
//   heat    0..1  — the GLOW meter normalized; drives the whole material
//   plates  bool[4] — which lead plates are still riveted on
//   accent  the mask's colour
//   state   idle | wind | hit | open | molten
// ════════════════════════════════════════════════════════════════════════

const clamp01 = (v) => Math.max(0, Math.min(1, v));

/* ── per-mask face geometry ───────────────────────────────────────────────
   Each returns { silhouette, features, seams } over a 0 0 240 320 box.
   `silhouette` is the cast lead. `features` are cut voids (eyes/mouth).
   `seams` are the fracture lines that light up as the metal heats.        */

const FACES = {
  king: {
    silhouette:
      "M120 34 C74 34 52 74 52 126 C52 186 70 240 96 268 C106 279 114 286 120 286 C126 286 134 279 144 268 C170 240 188 186 188 126 C188 74 166 34 120 34 Z",
    crest:
      "M56 62 L64 18 L84 46 L102 8 L120 42 L138 8 L156 46 L176 18 L184 62 C150 44 90 44 56 62 Z",
    eyes: [
      "M78 132 C90 122 106 122 116 132 C106 142 90 142 78 132 Z",
      "M124 132 C134 122 150 122 162 132 C150 142 134 142 124 132 Z",
    ],
    mouth: "M92 210 C106 202 134 202 148 210 C134 220 106 220 92 210 Z",
    brow: "M70 112 C88 100 110 100 120 106 M120 106 C130 100 152 100 170 112",
    seams: [
      "M96 66 L104 118 L92 158 L104 206 L96 258",
      "M150 72 L142 124 L156 166 L142 214 L150 262",
      "M120 46 L120 104 M120 224 L120 284",
    ],
    detail: "M64 176 C88 190 152 190 176 176 M70 232 C92 244 148 244 170 232",
  },
  saint: {
    silhouette:
      "M120 40 C80 40 58 82 58 138 C58 196 76 246 100 272 C110 283 115 288 120 288 C125 288 130 283 140 272 C164 246 182 196 182 138 C182 82 160 40 120 40 Z",
    crest: null,
    halo: "M120 26 m -54 0 a 54 16 0 1 0 108 0 a 54 16 0 1 0 -108 0",
    eyes: [
      "M76 140 C90 132 108 132 118 142 C106 146 88 146 76 140 Z",
      "M122 142 C132 132 150 132 164 140 C152 146 134 146 122 142 Z",
    ],
    mouth: "M96 214 C110 209 130 209 144 214 C130 219 110 219 96 214 Z",
    brow: "M72 120 C88 112 108 114 116 120 M124 120 C132 114 152 112 168 120",
    seams: [
      "M92 74 L100 128 L88 170 L100 216 L94 264",
      "M152 80 L144 132 L158 174 L144 220 L150 266",
      "M120 52 L120 112",
    ],
    detail: "M120 168 L120 200 M104 182 L136 182",
  },
  genius: {
    silhouette:
      "M120 32 L176 58 L192 122 L176 202 L142 272 L120 288 L98 272 L64 202 L48 122 L64 58 Z",
    crest: null,
    eyes: ["M74 128 L116 118 L116 142 L74 148 Z", "M126 118 L168 128 L168 148 L126 142 Z"],
    mouth: "M94 212 L148 212 L142 226 L100 226 Z",
    brow: "M68 106 L118 96 M124 96 L174 106",
    seams: [
      "M90 60 L100 122 L86 168 L100 218 L92 268",
      "M154 62 L142 126 L158 172 L142 220 L152 270",
      "M120 40 L120 106 M120 232 L120 286",
    ],
    // unfinished blueprint lattice — the drafts that never shipped
    detail:
      "M62 158 L178 158 M62 178 L178 178 M84 158 L84 202 M156 158 L156 202 M62 198 L134 198 M100 88 L100 118 M140 88 L140 118",
  },
  victim: {
    silhouette:
      "M120 36 C70 36 44 80 46 140 C48 198 72 248 98 272 C108 281 114 286 120 286 C126 286 132 281 142 272 C168 248 192 198 194 140 C196 80 170 36 120 36 Z",
    crest: null,
    eyes: [
      "M72 146 L118 126 L120 148 L78 156 Z",
      "M168 146 L122 126 L120 148 L162 156 Z",
    ],
    mouth: "M84 208 L108 218 L120 208 L132 218 L156 208 L146 232 L94 232 Z",
    brow: "M64 116 L116 100 M124 100 L176 116",
    seams: [
      "M120 40 L112 120 L128 176 L110 232 L120 286",
      "M84 70 L94 130 L80 176 L92 226",
      "M156 70 L146 130 L160 176 L148 226",
    ],
    // tear tracks, cast into the lead
    detail: "M86 162 L78 224 M154 162 L162 224",
  },
  warrior: {
    silhouette:
      "M120 34 C76 34 54 70 54 122 L54 176 C54 226 78 264 104 280 C112 285 116 288 120 288 C124 288 128 285 136 280 C162 264 186 226 186 176 L186 122 C186 70 164 34 120 34 Z",
    crest: "M108 12 L120 40 L132 12 L126 46 L114 46 Z",
    // T-visor: one slot, no separate eyes
    visor:
      "M66 122 L174 122 L174 152 L136 152 L136 196 L104 196 L104 152 L66 152 Z",
    eyes: [],
    mouth: null,
    brow: "M62 104 L178 104",
    seams: [
      "M88 58 L96 116 L84 170 L96 220 L88 268",
      "M152 58 L144 116 L156 170 L144 220 L152 268",
      "M120 44 L120 118 M120 200 L120 286",
    ],
    detail: "M60 210 C88 226 152 226 180 210 M64 240 C90 252 150 252 176 240",
  },
};

let uidSeed = 0;

export default function MaskEffigy({
  kind = "king",
  heat = 0,
  plates = [true, true, true, true],
  accent = "#FFD84D",
  molten = "#ffb02e",
  state = "idle",
  reducedMotion = false,
}) {
  const reactId = useId();
  const uid = useMemo(() => {
    uidSeed += 1;
    return `ce${uidSeed}${String(reactId).replace(/[^a-zA-Z0-9]/g, "")}`;
  }, [reactId]);

  const f = FACES[kind] || FACES.king;
  const h = clamp01(heat);

  // The material ramp. Below ~0.25 it's dead lead; the glow only starts to
  // win past halfway; the last stretch blows out to white-gold.
  const moltenOpacity = h < 0.18 ? 0 : Math.pow((h - 0.18) / 0.82, 1.35);
  const seamOpacity = 0.12 + h * 0.88;
  const emberOpacity = 0.25 + h * 0.75;

  // Heat is a property of METAL, not of the mask's identity. A cool-coloured
  // mask (the warrior's blue, the genius's cyan) heating up must still go
  // gold — tint it with its own colour and "molten" reads as a blue lamp
  // instead of a furnace. So identity owns the cold state (lead, rim, cracks)
  // and the fire owns everything from here up.
  const glow = h > 0.5 ? "#ffc247" : h > 0.28 ? molten : accent;
  const rim = h > 0.62 ? "#fff6d8" : h > 0.34 ? glow : accent;

  const plateOn = (i) => plates[i] !== false;

  return (
    <div
      className={`ce-effigy ce-effigy--${kind} ce-state-${state}${reducedMotion ? " ce-still" : ""}`}
      style={{ "--ce-accent": accent, "--ce-molten": glow, "--ce-rim": rim }}
      aria-hidden="true"
    >
      {/* the sway lives out here — never inside the filtered subtree */}
      <div className="ce-effigy__sway">
        <div className="ce-effigy__bob">
          <svg viewBox="0 0 240 340" className="ce-effigy__svg">
            <defs>
              {/* cast-lead pitting — ONE filter, on ONE static group */}
              <filter id={`${uid}-cast`} x="-12%" y="-12%" width="124%" height="124%">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7" result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="d" />
                {/* inner shadow: darken an offset, blurred copy back into the shape */}
                <feGaussianBlur in="d" stdDeviation="3" result="b" />
                <feOffset in="b" dx="0" dy="4" result="ob" />
                <feComposite in="ob" in2="d" operator="out" result="ring" />
                <feFlood floodColor="#000" floodOpacity="0.55" result="dk" />
                <feComposite in="dk" in2="ring" operator="in" result="sh" />
                <feMerge>
                  <feMergeNode in="d" />
                  <feMergeNode in="sh" />
                </feMerge>
              </filter>

              {/* three-stop specular — the lead's weight */}
              <linearGradient id={`${uid}-lead`} x1="0" y1="0" x2="0.85" y2="1">
                <stop offset="0%" stopColor="#4a5062" />
                <stop offset="22%" stopColor="#878fa4" />
                <stop offset="46%" stopColor="#2c3140" />
                <stop offset="72%" stopColor="#171a24" />
                <stop offset="100%" stopColor="#0a0c12" />
              </linearGradient>

              {/* the molten underlayer that wins as heat rises — the core is
                  always furnace-coloured; the mask's own colour survives only
                  in the cooler outer ring */}
              <radialGradient id={`${uid}-heat`} cx="50%" cy="58%" r="62%">
                <stop offset="0%" stopColor="#fffdf2" />
                <stop offset="24%" stopColor="#ffd06a" />
                <stop offset="52%" stopColor="#ff8c2b" />
                <stop offset="76%" stopColor={accent} stopOpacity="0.5" />
                <stop offset="100%" stopColor="#7a1c06" stopOpacity="0.3" />
              </radialGradient>

              <radialGradient id={`${uid}-ember`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fffbe8" />
                <stop offset="40%" stopColor={glow} />
                <stop offset="100%" stopColor={accent} stopOpacity="0" />
              </radialGradient>

              <filter id={`${uid}-bloom`} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="5" result="g" />
                <feMerge>
                  <feMergeNode in="g" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <clipPath id={`${uid}-clip`}>
                <path d={f.silhouette} transform="translate(0,26)" />
              </clipPath>
            </defs>

            {/* ── the chain it hangs from ─────────────────────────────── */}
            <g className="ce-chain" opacity="0.8">
              <path d="M120 0 L120 22" stroke="#3a4052" strokeWidth="4" />
              {[4, 11, 18].map((y) => (
                <ellipse key={y} cx="120" cy={y} rx="5" ry="3.4" fill="none" stroke="#5d6478" strokeWidth="2" />
              ))}
            </g>

            {/* ── STATIC CAST LEAD — the only filtered group ──────────── */}
            <g filter={`url(#${uid}-cast)`} transform="translate(0,26)">
              {f.crest ? <path d={f.crest} fill={`url(#${uid}-lead)`} /> : null}
              <path d={f.silhouette} fill={`url(#${uid}-lead)`} />
              {/* cheek/jaw relief — one extra pass of the same gradient */}
              <path
                d={f.silhouette}
                fill="#000"
                opacity="0.34"
                transform="translate(120,150) scale(0.78) translate(-120,-150)"
              />
            </g>

            {/* ── MOLTEN UNDERLAYER (unfiltered: it animates) ─────────── */}
            <g clipPath={`url(#${uid}-clip)`} style={{ opacity: moltenOpacity }} className="ce-molten">
              <rect x="0" y="0" width="240" height="340" fill={`url(#${uid}-heat)`} />
            </g>

            {/* ── seams, features, embers — all outside the filter ────── */}
            <g transform="translate(0,26)" className="ce-cut">
              {/* fracture seams glowing with heat */}
              <g className="ce-seams" style={{ opacity: seamOpacity }}>
                {f.seams.map((d, i) => (
                  <path key={i} d={d} className="ce-seam" style={{ animationDelay: `${i * 0.4}s` }} />
                ))}
              </g>

              {/* halo (saint only) */}
              {f.halo ? <path d={f.halo} className="ce-halo" /> : null}

              {/* eye voids + embers */}
              {(f.eyes || []).map((d, i) => (
                <g key={i}>
                  <path d={d} fill="#04060b" />
                  <path d={d} className="ce-ember" style={{ opacity: emberOpacity, animationDelay: `${i * 0.7}s` }} />
                </g>
              ))}

              {/* T-visor (warrior only) — the slot needs a hard dark edge or
                  the ember fill blooms the stem away and it reads as one bar */}
              {f.visor ? (
                <>
                  <path d={f.visor} fill="#04060b" />
                  <path d={f.visor} className="ce-ember" style={{ opacity: emberOpacity * 0.5 }} />
                  <path d={f.visor} fill="none" stroke="#04060b" strokeWidth="3.5" />
                </>
              ) : null}

              {f.mouth ? (
                <>
                  <path d={f.mouth} fill="#04060b" />
                  <path d={f.mouth} className="ce-ember" style={{ opacity: emberOpacity * 0.55 }} />
                </>
              ) : null}

              {f.brow ? <path d={f.brow} className="ce-line" /> : null}
              {f.detail ? <path d={f.detail} className="ce-line ce-line--soft" /> : null}

              {/* rim light — sells the third dimension for the price of one path */}
              <path d={f.silhouette} className="ce-rim" />
            </g>

            {/* ── THE FOUR LEAD PLATES ───────────────────────────────── */}
            <g transform="translate(0,26)" className="ce-plates">
              {plateOn(0) ? <Plate uid={uid} d="M40 96 L86 82 L92 132 L44 142 Z" rivets={[[52, 102], [80, 96], [56, 132]]} /> : null}
              {plateOn(1) ? <Plate uid={uid} d="M200 96 L154 82 L148 132 L196 142 Z" rivets={[[188, 102], [160, 96], [184, 132]]} /> : null}
              {plateOn(2) ? <Plate uid={uid} d="M60 186 L120 176 L180 186 L176 218 L120 208 L64 218 Z" rivets={[[76, 196], [120, 190], [164, 196]]} /> : null}
              {plateOn(3) ? <Plate uid={uid} d="M84 240 L120 232 L156 240 L150 274 L120 282 L90 274 Z" rivets={[[100, 250], [140, 250], [120, 270]]} /> : null}
            </g>

            {/* ── the light inside, once the plates are off ──────────── */}
            {state === "open" || state === "molten" ? (
              <g transform="translate(0,26)" className="ce-inner" filter={`url(#${uid}-bloom)`}>
                <circle cx="120" cy="168" r="30" fill={`url(#${uid}-ember)`} />
              </g>
            ) : null}
          </svg>
        </div>
      </div>
    </div>
  );
}

function Plate({ uid, d, rivets }) {
  return (
    <g className="ce-plate">
      <path d={d} fill={`url(#${uid}-lead)`} stroke="rgba(10,12,18,0.9)" strokeWidth="2" />
      <path d={d} fill="none" stroke="rgba(190,198,216,0.34)" strokeWidth="1" transform="translate(0,-1.5)" />
      {rivets.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.2" fill="#0b0d14" stroke="rgba(180,188,206,0.5)" strokeWidth="1" />
      ))}
    </g>
  );
}

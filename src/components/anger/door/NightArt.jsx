import React from "react";

/* ════════════════════════════════════════════════════════════════════════
   THE STEELE HOUSE, 11:47 PM — and the nine things in the yard you can break.

   Drawn, not borrowed. TheRoute's <House> is a 220x210 side-on box with its
   geometry baked in; reusing it would force the targets array to match its
   coordinates, which is backwards — the data is supposed to place the art, not
   the other way round. So the idioms are lifted (the siding pattern, the muntin
   cross, the warm interior behind a cold facade) and the geometry is new.

   Each prop draws into a 0 0 100 100 viewBox with preserveAspectRatio="none",
   so the targets array in doorLevels.js is the only thing that decides where
   anything sits or how big it is.

   PERF LAW, and it is not optional here: nine props each want a drop-shadow.
   ONE filter goes on the facade container and none on the props. The porch
   light flicker and the ring-cam LED are infinite animations, so they live on
   unfiltered overlays — never inside a filtered subtree.
   ════════════════════════════════════════════════════════════════════════ */

export function SteeleHouse({ wrecked = {} }) {
  const dark = (wrecked.porch || 0) <= 0;      // you shot the light out
  return (
    <svg className="dgn-facade" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden focusable="false">
      <defs>
        <linearGradient id="dgnSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#070a18" />
          <stop offset="1" stopColor="#141a2e" />
        </linearGradient>
        <linearGradient id="dgnWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b3147" />
          <stop offset="1" stopColor="#1b2033" />
        </linearGradient>
        <linearGradient id="dgnRoof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#171b2b" />
          <stop offset="1" stopColor="#0e1120" />
        </linearGradient>
        <linearGradient id="dgnLawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#16261c" />
          <stop offset="1" stopColor="#0c150f" />
        </linearGradient>
        <pattern id="dgnSid" width="100" height="3.1" patternUnits="userSpaceOnUse">
          <rect width="100" height="3.1" fill="none" />
          <path d="M0 3.05h100" stroke="#000" strokeOpacity=".26" strokeWidth=".45" />
        </pattern>
      </defs>

      <rect width="100" height="100" fill="url(#dgnSky)" />
      <g className="dgn-facade__stars">
        {[[12, 8], [27, 5], [44, 11], [63, 6], [78, 13], [91, 7], [35, 16], [70, 18]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r=".5" fill="#cfd8ff" opacity={i % 3 ? ".5" : ".85"} />
        ))}
      </g>

      {/* the house */}
      <path d="M14 36 50 18 86 36z" fill="url(#dgnRoof)" />
      <path d="M14 36h72v42H14z" fill="url(#dgnWall)" />
      <path d="M14 36h72v42H14z" fill="url(#dgnSid)" />
      <path d="M74 24v-6h4v8z" fill="#121624" />

      {/* the porch — the only warm thing on the street, until it isn't */}
      <path d="M40 52h20v26H40z" fill="#0d1120" />
      <path d="M41 53h18v25H41z" fill={dark ? "#151a2b" : "#3a2f1c"} />
      <circle cx="57.5" cy="65" r=".9" fill={dark ? "#3a4055" : "#d8c07a"} />

      {/* the truck on the driveway */}
      <g>
        <path d="M78 60h18v9H78z" fill="#232a3d" />
        <path d="M80 54h12l3 6H80z" fill="#2b3348" />
        <path d="M81.5 55.5h9l2 3.5h-11z" fill={dark ? "#1b2233" : "#39435e"} />
        <circle cx="82" cy="69.5" r="2.4" fill="#0b0e18" />
        <circle cx="92" cy="69.5" r="2.4" fill="#0b0e18" />
      </g>

      {/* lawn + walkway */}
      <path d="M0 76h100v24H0z" fill="url(#dgnLawn)" />
      <path d="M44 78h12l6 22H38z" fill="#20293a" opacity=".8" />

      {/* the ground glow the porch throws, killed when the bulb goes */}
      {!dark && <ellipse className="dgn-facade__pool" cx="50" cy="80" rx="26" ry="7" fill="#d8c07a" opacity=".13" />}
    </svg>
  );
}

/* ── the props ──────────────────────────────────────────────────────────── */
const V = { viewBox: "0 0 100 100", preserveAspectRatio: "none", "aria-hidden": true, focusable: "false" };

function Pane({ broken }) {
  return (
    <svg {...V} className="dgn-art">
      <rect x="4" y="4" width="92" height="92" rx="2" fill="#1a2035" stroke="#39435e" strokeWidth="4" />
      {broken ? (
        <>
          <path d="M4 4 44 46 20 96M96 4 56 44 84 96M4 60l40-14 52 20" fill="none" stroke="#0a0d16" strokeWidth="3" />
          <path d="M4 4h92v92H4z" fill="#05070d" />
          <path d="M4 4 30 34 4 40zM96 4 70 30 96 46zM40 96 52 62 76 96z" fill="#8fb8d8" opacity=".5" />
        </>
      ) : (
        <>
          <rect x="8" y="8" width="84" height="84" fill="#e8c98a" opacity=".22" />
          <path d="M50 8v84M8 50h84" stroke="#39435e" strokeWidth="3" />
        </>
      )}
    </svg>
  );
}

function YardSignArt({ broken }) {
  return (
    <svg {...V} className="dgn-art">
      <path d="M48 54h4v46h-4z" fill="#4a4f60" />
      <g transform={broken ? "rotate(-24 50 54)" : undefined}>
        <rect x="10" y="6" width="80" height="46" rx="4" fill={broken ? "#2a3348" : "#1d4a86"} />
        <rect x="15" y="11" width="70" height="36" rx="2" fill="none" stroke="#cfe0ff" strokeWidth="3" opacity=".8" />
        <path d="M32 20h36v6H32zM26 32h48v5H26z" fill="#cfe0ff" opacity=".85" />
      </g>
      {broken && <path d="M10 52 90 46" stroke="#0a0d16" strokeWidth="4" />}
    </svg>
  );
}

function MailboxArt({ broken }) {
  return (
    <svg {...V} className="dgn-art">
      <path d="M44 44h12v56H44z" fill="#3d3428" />
      <g transform={broken ? "rotate(38 50 30) translate(0 6)" : undefined}>
        <path d="M12 22a38 22 0 0 1 76 0v22H12z" fill={broken ? "#39414f" : "#556070"} />
        <path d="M12 44h76v6H12z" fill="#39414f" />
        {!broken && <path d="M88 14h8v20h-8z" fill="#c0392b" />}
      </g>
    </svg>
  );
}

function GnomeArt({ broken }) {
  if (broken) {
    return (
      <svg {...V} className="dgn-art">
        <path d="M24 86h52l-6 14H30zM34 74l14 10-18 4zM62 70l12 12-16 2z" fill="#9aa3b2" />
        <path d="M40 92h20" stroke="#6a7383" strokeWidth="3" />
      </svg>
    );
  }
  return (
    <svg {...V} className="dgn-art">
      <path d="M50 4 76 44H24z" fill="#c0392b" />
      <circle cx="50" cy="56" r="16" fill="#e8c9a8" />
      <path d="M38 62h24v16H38z" fill="#e8e2d6" />
      <path d="M28 76h44v22H28z" fill="#2d6a4f" />
      <circle cx="44" cy="53" r="2" fill="#1b2033" />
      <circle cx="56" cy="53" r="2" fill="#1b2033" />
    </svg>
  );
}

function FlamingoArt({ broken }) {
  if (broken) {
    return (
      <svg {...V} className="dgn-art">
        <path d="M44 78h12v22H44z" fill="#8a8f9c" />
        <path d="M18 74 62 62l8 16z" fill="#e0709a" opacity=".85" />
      </svg>
    );
  }
  return (
    <svg {...V} className="dgn-art">
      <path d="M46 52h8v48h-8z" fill="#d8a24a" />
      <path d="M30 40a22 18 0 0 1 40 6c0 12-10 18-22 18S30 54 30 40z" fill="#ef7fa8" />
      <path d="M56 26a10 14 0 0 1 6 20l-6-4z" fill="#ef7fa8" />
      <path d="M60 24 74 18l-8 12z" fill="#1b2033" />
      <circle cx="60" cy="28" r="2" fill="#1b2033" />
    </svg>
  );
}

function MirrorArt({ broken }) {
  return (
    <svg {...V} className="dgn-art">
      <path d="M20 40h16v18H20z" fill="#39414f" />
      <rect x="34" y="24" width="52" height="46" rx="8" fill={broken ? "#1a1f2e" : "#39414f"} />
      {!broken && <rect x="40" y="30" width="40" height="34" rx="5" fill="#9fc4dd" opacity=".7" />}
      {broken && <path d="M40 30 80 64M80 30 40 64" stroke="#5b6577" strokeWidth="4" />}
    </svg>
  );
}

function BbqArt({ broken }) {
  return (
    <svg {...V} className="dgn-art">
      <path d="M28 60 22 100h8l6-34zM72 60l6 40h-8l-6-34z" fill="#39414f" />
      <path d="M10 30h80v10a40 26 0 0 1-80 0z" fill={broken ? "#2a2f3d" : "#4a5364"} />
      {!broken
        ? <path d="M12 30h76a38 12 0 0 0-76 0z" fill="#5d6678" />
        : <path d="M24 26 40 6 52 22 66 4 78 26z" fill="#ffb347" opacity=".9" />}
      <path d="M10 30h80v5H10z" fill="#2a2f3d" />
    </svg>
  );
}

function PorchLampArt({ broken }) {
  return (
    <svg {...V} className="dgn-art">
      <path d="M44 0h12v22H44z" fill="#2a2f3d" />
      <path d="M26 22h48l-8 54H34z" fill={broken ? "#232838" : "#3a4353"} />
      {!broken && <path d="M34 30h32l-5 38H39z" fill="#ffe6a8" opacity=".92" />}
      {broken && <path d="M36 34 48 52 40 66M64 32 54 50 62 68" stroke="#5b6577" strokeWidth="3" fill="none" />}
    </svg>
  );
}

const ART = {
  pane: Pane, yardsign: YardSignArt, mailbox: MailboxArt, gnome: GnomeArt,
  flamingo: FlamingoArt, mirror: MirrorArt, bbq: BbqArt, porchlamp: PorchLampArt,
};

export function TargetArt({ art, broken }) {
  const C = ART[art] || GnomeArt;
  return <C broken={broken} />;
}

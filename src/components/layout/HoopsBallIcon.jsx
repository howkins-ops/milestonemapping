import React from "react";

/* Realistic leather basketball — the Hoops app icon in the top nav.
   Pure SVG so it stays crisp at any size with no image asset:
   • warm radial leather shading (bright top-left → deep brown rim)
   • soft *diffuse* sheen (matte leather, not shiny plastic)
   • pebbled grain via feTurbulence, clipped to the ball
   • edge ambient-occlusion for roundness
   • grooved 8-panel seams (dark line + warm halo) in a `.tb-ball`
     group so the existing top-nav spin animation turns ONLY the seams
     while the light/leather stay put — a real spinning-ball look.
   viewBox stays 0 0 24 24 (center 12,12) so the CSS spin origin
   (transform-origin: 12px 12px) lands dead-center. */

export default function HoopsBallIcon({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" role="img" aria-hidden="true">
      <defs>
        <radialGradient id="hbLeather" cx="37%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#f7a851" />
          <stop offset="34%" stopColor="#e37f34" />
          <stop offset="70%" stopColor="#b0561d" />
          <stop offset="100%" stopColor="#6b2d0c" />
        </radialGradient>
        <radialGradient id="hbSheen" cx="36%" cy="28%" r="46%">
          <stop offset="0%" stopColor="rgba(255,236,205,0.55)" />
          <stop offset="55%" stopColor="rgba(255,236,205,0.12)" />
          <stop offset="100%" stopColor="rgba(255,236,205,0)" />
        </radialGradient>
        <radialGradient id="hbAO" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stopColor="rgba(38,14,0,0)" />
          <stop offset="100%" stopColor="rgba(38,14,0,0.5)" />
        </radialGradient>
        <filter id="hbGrain" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" seed="5" result="t" />
          {/* map noise luminance → alpha of a dark-brown speck */}
          <feColorMatrix in="t" type="matrix"
            values="0 0 0 0 0.14
                    0 0 0 0 0.06
                    0 0 0 0 0.02
                    0.34 0.34 0.34 0 0" />
        </filter>
        <clipPath id="hbClip">
          <circle cx="12" cy="12" r="10.6" />
        </clipPath>
      </defs>

      {/* static leather body */}
      <circle cx="12" cy="12" r="10.6" fill="url(#hbLeather)" />
      <g clipPath="url(#hbClip)">
        <rect x="0" y="0" width="24" height="24" filter="url(#hbGrain)" opacity="0.55" />
      </g>
      <circle cx="12" cy="12" r="10.6" fill="url(#hbAO)" />

      {/* spinning seams (dark groove + warm raised halo) */}
      <g className="tb-ball" fill="none" strokeLinecap="round">
        <g stroke="rgba(96,42,16,0.55)" strokeWidth="1.7">
          <path d="M1.6 12 H22.4" />
          <path d="M12 1.6 V22.4" />
          <path d="M4.7 4.7 C7.7 7.4, 7.7 16.6, 4.7 19.3" />
          <path d="M19.3 4.7 C16.3 7.4, 16.3 16.6, 19.3 19.3" />
        </g>
        <g stroke="#2b1005" strokeWidth="0.95">
          <path d="M1.6 12 H22.4" />
          <path d="M12 1.6 V22.4" />
          <path d="M4.7 4.7 C7.7 7.4, 7.7 16.6, 4.7 19.3" />
          <path d="M19.3 4.7 C16.3 7.4, 16.3 16.6, 19.3 19.3" />
        </g>
      </g>

      {/* static light + silhouette on top */}
      <ellipse cx="8.6" cy="7.7" rx="4.6" ry="3.1" fill="url(#hbSheen)"
        transform="rotate(-26 8.6 7.7)" />
      <circle cx="12" cy="12" r="10.6" fill="none" stroke="rgba(48,17,4,0.9)" strokeWidth="0.7" />
    </svg>
  );
}

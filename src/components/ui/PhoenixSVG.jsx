import React from "react";

// Line-art phoenix — based on the reference HTML's brand SVG.
// Wings use purple→pink (right) and purple→blue (left) gradients.
// Body uses cyan→pink gradient.
const WING = (
  <>
    <path d="M112,90 C152,84 186,56 202,14" />
    <path d="M112,97 C152,97 178,77 192,42" />
    <path d="M112,104 C148,110 170,96 182,70" />
    <path d="M110,111 C138,123 156,117 168,99" />
  </>
);

const BODY = (
  <>
    <path d="M110,56 C125,71 125,98 110,130 C95,98 95,71 110,56 Z" />
    <path d="M110,74 C117,84 117,99 110,113 C103,99 103,84 110,74 Z" />
    <path d="M110,56 C105,49 111,44 118,49" />
  </>
);

export default function PhoenixSVG({ width = 220, style, className }) {
  const uid = React.useId().replace(/:/g, "");
  return (
    <svg
      width={width}
      viewBox="0 0 220 150"
      fill="none"
      style={{ overflow: "visible", ...style }}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`wgR_${uid}`} x1="110" y1="105" x2="212" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D11EFF" />
          <stop offset="1" stopColor="#FF3EDB" />
        </linearGradient>
        <linearGradient id={`wgL_${uid}`} x1="110" y1="105" x2="8" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D11EFF" />
          <stop offset="1" stopColor="#00F0FF" />
        </linearGradient>
        <linearGradient id={`bodg_${uid}`} x1="110" y1="56" x2="110" y2="130" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00F0FF" />
          <stop offset="1" stopColor="#FF3EDB" />
        </linearGradient>
      </defs>

      {/* right wing */}
      <g stroke={`url(#wgR_${uid})`} fill="none" strokeWidth="3.4" strokeLinecap="round">
        {WING}
      </g>

      {/* left wing (mirrored) */}
      <g
        stroke={`url(#wgL_${uid})`}
        fill="none"
        strokeWidth="3.4"
        strokeLinecap="round"
        transform="translate(220,0) scale(-1,1)"
      >
        {WING}
      </g>

      {/* body */}
      <g stroke={`url(#bodg_${uid})`} fill="none" strokeWidth="3.2" strokeLinecap="round">
        {BODY}
      </g>
    </svg>
  );
}

import React from "react";

// ════════════════════════════════════════════════════════════════════════
// MASK ENCOUNTERS — the wild critic wisp
// One hooded-wisp base rig (~90×110) shared by all eight street critics;
// each critic tints it via its accent color (b-glow/b-glow-s pick up
// currentColor through the CSS var). Much lighter than a boss rig — a
// cloak, two glow eyes, a trailing wispy hem. Deliberately faceless:
// naming it is what gives it a face.
// ════════════════════════════════════════════════════════════════════════

export default function WispSprite({ color = "#B06DFF" }) {
  return (
    <svg
      viewBox="0 0 90 110"
      aria-hidden="true"
      className="mqk-wisp-svg"
      style={{ "--wisp-color": color }}
    >
      <path
        className="b-shade"
        d="M45 6 C24 6 14 24 14 46 L10 84 Q16 92 24 88 L28 96 Q34 104 40 96 L45 104 L50 96 Q56 104 62 96 L66 88 Q74 92 80 84 L76 46 C76 24 66 6 45 6 Z"
      />
      <path
        className="b-body"
        d="M45 12 C28 12 20 28 20 48 L17 80 Q24 86 30 82 L34 90 Q40 97 45 90 Q50 97 56 90 L60 82 Q66 86 73 80 L70 48 C70 28 62 12 45 12 Z"
      />
      <path className="b-shade" d="M45 16 C33 16 27 28 27 42 Q45 52 63 42 C63 28 57 16 45 16 Z" />
      <ellipse className="b-glow" cx="37" cy="36" rx="4.5" ry="6" />
      <ellipse className="b-glow" cx="53" cy="36" rx="4.5" ry="6" />
      <path className="b-glow-s" strokeWidth="1.6" opacity=".55" d="M28 60 Q45 68 62 60" />
    </svg>
  );
}

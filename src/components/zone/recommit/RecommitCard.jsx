import React from "react";
import { ZONE_ICONS } from "../../../lib/zoneFire.js";
import ZoneIcon from "../shared/ZoneIcon.jsx";

// The integrity door, made a real card instead of a buried ghost strip.
// Opens the full Recommit (Shift One) ritual via onOpen. Used on Zone home,
// where the Recommit sheet lives one level up.
export default function RecommitCard({ onOpen }) {
  return (
    <div className="zn-card zn-card--integrity zn-integrity">
      <div className="zn-integrity__head">
        <span className="zn-integrity__glyph" aria-hidden="true">
          <ZoneIcon src={ZONE_ICONS.fire} />
        </span>
        <div style={{ minWidth: 0 }}>
          <p className="zn-eyebrow" style={{ margin: 0 }}>Integrity</p>
          <h3 className="zn-integrity__title">Broke your word somewhere?</h3>
        </div>
      </div>
      <p className="zn-integrity__body">
        Name it, feel the cost, and get back in — one kept promise puts you back in integrity.
      </p>
      <button type="button" className="zn-btn zn-integrity__cta" onClick={onOpen}>
        Recommit to integrity →
      </button>
    </div>
  );
}

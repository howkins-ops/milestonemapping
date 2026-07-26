import React, { useEffect } from "react";
import DistrictCard from "./DistrictCard.jsx";
import { QUARTER_ORDER, QUARTER_META } from "./cityDistricts.js";

// ════════════════════════════════════════════════════════════════════════
// MILESTONE CITY — The Districts sheet
// All sixteen doors, six quarters, one tap down from the street. This used
// to be the page's whole scroll; it lives behind a chip now so the city
// screen can answer one question instead of sixteen.
// Card grid + quarter styling are the originals (cityDistricts.css) —
// only the container changed.
// ════════════════════════════════════════════════════════════════════════

export default function DistrictsSheet({
  districts = [],
  litCount = 0,
  litTotal = 0,
  showLit = true,
  onOpen,
  onClose,
}) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose && onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      <div className="mqc-sheet__scrim" onClick={onClose} aria-hidden="true" />
      <div
        className="mqc-sheet mqc-sheet--tall"
        role="dialog"
        aria-modal="true"
        aria-label="The districts"
      >
        <div className="mqc-sheet__handle" aria-hidden="true" />

        <header className="mqc-ss-head">
          <h3 className="mqc-ss-head__title">THE DISTRICTS</h3>
          {showLit ? (
            <span className="mqc-ss-head__count">
              {litCount}/{litTotal} lit
            </span>
          ) : null}
        </header>

        {QUARTER_ORDER.map((qKey) => {
          const meta = QUARTER_META[qKey];
          const qDistricts = districts.filter((d) => d.quarter === qKey);
          if (!meta || qDistricts.length === 0) return null;
          return (
            <section
              key={qKey}
              className="mqc-d-quarter"
              style={{ "--q-accent": meta.accent }}
              aria-label={meta.label}
            >
              <div className="mqc-d-quarter__head">
                <h3 className="mqc-d-quarter__label">{meta.label}</h3>
              </div>
              <p className="mqc-d-quarter__blurb">{meta.blurb}</p>
              <div className="mqc-d-grid">
                {qDistricts.map((d) => (
                  <DistrictCard key={d.id} district={d} onOpen={onOpen} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

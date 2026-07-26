import React, { useEffect } from "react";
import CitizenCard from "./CitizenCard.jsx";
import CityPlaza from "./CityPlaza.jsx";

// ════════════════════════════════════════════════════════════════════════
// MILESTONE CITY — The Commons sheet
// Who you are in this city, and who else is standing in it. Both cards are
// the originals — they just no longer compete with the street for the top
// of the screen. Offline, the Plaza renders nothing and the citizen card
// stands alone, which is the honest state.
// ════════════════════════════════════════════════════════════════════════

export default function CommonsSheet({ social, progress, onClose }) {
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
        aria-label="The Commons"
      >
        <div className="mqc-sheet__handle" aria-hidden="true" />

        <header className="mqc-ss-head">
          <h3 className="mqc-ss-head__title">THE COMMONS</h3>
        </header>

        <CitizenCard social={social} progress={progress} />

        <div className="mqc-ss-plaza">
          <CityPlaza social={social} />
        </div>
      </div>
    </>
  );
}

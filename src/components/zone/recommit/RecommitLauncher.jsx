import React from "react";
import "./RecommitLauncher.css";

// A self-contained "Recommit to Integrity" card for surfaces OUTSIDE the Zone
// (the app dashboard, the IRON Today tab). It carries no Zone context — tapping
// it deep-links into the Zone, which opens the real Recommit (Shift One) ritual.
// Styled independently so it reads the same everywhere.
export default function RecommitLauncher({ onClick }) {
  return (
    <button type="button" className="recommit-launcher" onClick={onClick}>
      <span className="recommit-launcher__flame" aria-hidden="true">🔥</span>
      <span className="recommit-launcher__text">
        <span className="recommit-launcher__kicker">Integrity</span>
        <span className="recommit-launcher__title">Broke your word somewhere?</span>
        <span className="recommit-launcher__sub">Get back in — one kept promise. Recommit →</span>
      </span>
    </button>
  );
}

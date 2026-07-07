import React, { useEffect, useState } from "react";

// ════════════════════════════════════════════════════════════════════════
// GATE 2 — THE SPIRE IGNITES
// Plays once, the moment the fifteenth district lights: the sealed tower
// answers, floor by floor, and the Alchemist's silhouette appears at the
// top. Pure CSS, skippable, reduced-motion still frame.
// ════════════════════════════════════════════════════════════════════════

const FLOORS = 5;

const LINES = [
  "The fifteenth door lights.",
  "And out past the Terminus, something old feels it.",
  "Floor by floor, the black glass wakes.",
  "At the very top — a figure who has been waiting since before you left home.",
  "THE SPIRE IS OPEN.",
];

function motionOff() {
  try {
    return (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.reducedMotion === "true"
    );
  } catch {
    return false;
  }
}

export default function SpireIgnition({ onClimb, onClose }) {
  const [step, setStep] = useState(0);
  const [still] = useState(motionOff);

  const finished = still || step >= LINES.length - 1;
  const litFloors = still ? FLOORS : Math.min(FLOORS, step + 1);

  useEffect(() => {
    if (still || step >= LINES.length - 1) return undefined;
    const t = setTimeout(() => setStep((s) => s + 1), 1900);
    return () => clearTimeout(t);
  }, [step, still]);

  return (
    <div className="spg-overlay" role="dialog" aria-modal="true" aria-label="The Spire ignites">
      <div className="spg-spire" aria-hidden="true">
        <span className={`spg-crown${finished ? " is-lit" : ""}`}>◈</span>
        {Array.from({ length: FLOORS }, (_, i) => {
          const floorFromTop = i;
          const lit = FLOORS - floorFromTop <= litFloors;
          return <span key={i} className={`spg-floor${lit ? " is-lit" : ""}`} />;
        })}
      </div>

      <p className="spg-line" key={still ? "still" : step}>
        {still ? "All fifteen districts lit — the Spire is open." : LINES[step]}
      </p>

      {finished ? (
        <div className="spg-actions">
          <button type="button" className="spg-climb" onClick={onClimb}>
            CLIMB THE SPIRE →
          </button>
          <button type="button" className="spg-later" onClick={onClose}>
            Stay in the streets for now
          </button>
        </div>
      ) : (
        <button type="button" className="spg-later" onClick={() => setStep(LINES.length - 1)}>
          Skip →
        </button>
      )}
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";

// ════════════════════════════════════════════════════════════════════════
// THE ROAD OUT — departure cinematic
// A short (~7s), skippable, pure-CSS overlay: the hometown dims, the road
// runs, the horizon glow blooms into the city. Then onDone() hands the
// journey to the city. Reduced motion: a single still frame + Continue.
// ════════════════════════════════════════════════════════════════════════

const PHASES = [
  { id: "dim", ms: 1400, line: "You don't look back. That's the whole trick of it." },
  { id: "road", ms: 2600, line: "The road hums under your feet. The bag is light. Your word is heavy." },
  {
    id: "pendant",
    ms: 3200,
    line: "The pendant knocks against your chest with every step. Five words, thumb-polished half-smooth: Radiance. Love. Power. Majesty. Joy.",
  },
  { id: "bloom", ms: 3000, line: "And the glow on the horizon stops being a rumor." },
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

export default function DepartureCinematic({ onDone }) {
  const [phase, setPhase] = useState(0);
  const [still] = useState(motionOff);
  const doneRef = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    if (onDone) onDone();
  };

  useEffect(() => {
    if (still) return undefined; // reduced motion: wait for the button
    if (phase >= PHASES.length) {
      const t = setTimeout(finish, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase((p) => p + 1), PHASES[phase].ms);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, still]);

  const current = PHASES[Math.min(phase, PHASES.length - 1)];

  return (
    <div
      className={`mqw-cine mqw-cine--${current.id}${still ? " mqw-cine--still" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Leaving the hometown"
      onClick={still ? undefined : finish}
    >
      <div className="mqw-cine__road" aria-hidden="true" />
      <div className="mqw-cine__bloom" aria-hidden="true" />
      {current.id === "pendant" && !still ? (
        <div className="mqw-cine__pendant" aria-hidden="true">◈</div>
      ) : null}

      <p className="mqw-cine__line" key={current.id}>
        {still ? "You take the road. The glow on the horizon stops being a rumor." : current.line}
      </p>

      {still ? (
        <button type="button" className="mqw-cine__skip" onClick={finish}>
          Arrive at the gates →
        </button>
      ) : (
        <button
          type="button"
          className="mqw-cine__skip"
          onClick={(e) => {
            e.stopPropagation();
            finish();
          }}
        >
          Skip →
        </button>
      )}
    </div>
  );
}

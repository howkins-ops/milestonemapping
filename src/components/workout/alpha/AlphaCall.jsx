import React, { useEffect, useState } from "react";
import { sfxImpact } from "../../../lib/sfx.js";

/* ALPHA MODE — The Call (Phase-0 teaser cinematic).
   A dark room, an ember ring breathing, lines landing one at a time.
   Phase 1 expands this into the full stages 1–4 story flow; the
   answer ritual and persistence contract stay identical. */

const LINES = [
  "Most doors knock once, and quietly.",
  "This one is knocking now.",
  "A campaign for the body — run like a game.",
  "Four zones. Eleven stages. Every myth about the iron, hunted down and broken.",
];

export default function AlphaCall({ onAnswer, settings }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), LINES.length * 900 + 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="iw-al-call">
      <div className="iw-al-ember" aria-hidden="true">
        <span className="iw-al-ember-core" />
        <span className="iw-al-ember-ring" />
        <span className="iw-al-ember-ring iw-al-ember-ring2" />
      </div>

      <div className="iw-eyebrow iw-al-call-eyebrow">alpha mode</div>

      <div className="iw-al-call-lines">
        {LINES.map((l, i) => (
          <p key={i} className="iw-al-call-line" style={{ animationDelay: `${600 + i * 900}ms` }}>
            {l}
          </p>
        ))}
        <p className="iw-al-call-sig" style={{ animationDelay: `${600 + LINES.length * 900}ms` }}>
          — The Mentor
        </p>
      </div>

      <button
        className={`iw-btn-ember iw-btn-wide iw-al-answer ${ready ? "iw-al-answer-on" : ""}`}
        disabled={!ready}
        onClick={() => { sfxImpact(2, settings); onAnswer(); }}
      >
        ⚡ answer the call
      </button>

      <p className="iw-al-disclaimer">
        Alpha Mode is a game system — stats, timers, and meters.
        It is not medical or nutrition advice.
      </p>
    </div>
  );
}

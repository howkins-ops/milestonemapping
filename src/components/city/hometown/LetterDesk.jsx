import React, { useState } from "react";

// ════════════════════════════════════════════════════════════════════════
// THE LETTER — station exercise #2 (the old writing desk)
// The anti-quit letter: written to the future self who wants to give up.
// Sealed with a wax-stamp animation, then the app carries it forever —
// the SOS hub replays it on bad days ("LETTER FROM DAY ONE").
// ════════════════════════════════════════════════════════════════════════

const MIN_CHARS = 40;

export default function LetterDesk({ initial = "", onSave, onClose }) {
  const [text, setText] = useState(initial);
  const [sealing, setSealing] = useState(false);

  const ready = text.trim().length >= MIN_CHARS;

  const seal = () => {
    if (!ready || sealing) return;
    setSealing(true);
    // let the seal animation land before handing the letter over
    setTimeout(() => onSave(text.trim()), 1600);
  };

  return (
    <div className="hmt-overlay" role="dialog" aria-modal="true" aria-label="The anti-quit letter">
      {onClose && !sealing ? (
        <button type="button" className="hmt-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
      ) : null}
      <div className={`hmt-paper hmt-letter${sealing ? " hmt-letter--sealing" : ""}`}>
        <p className="hmt-kicker">THE LETTER · STATION II</p>
        <h3 className="hmt-title">To the you who wants to quit</h3>
        <p className="hmt-sub">
          Some night out there, you'll hit a wall and forget why you left. This letter is
          the rope you throw yourself now. The app will hand it back on exactly that night
          — word for word, in your own handwriting.
        </p>

        <div className="hmt-letter__sheet">
          <p className="hmt-letter__salutation">To the me who wants to quit —</p>
          <textarea
            className="hmt-letter__input"
            rows={8}
            value={text}
            disabled={sealing}
            placeholder={
              "Remind him what staying was costing. Remind him what he swore. " +
              "Tell him the one thing only you would know to say."
            }
            onChange={(e) => setText(e.target.value)}
          />
          <p className="hmt-letter__sign">— you, on the day you still remembered everything</p>
          <span className="hmt-letter__wax" aria-hidden="true">✶</span>
        </div>

        <button type="button" className="hmt-primary" disabled={!ready || sealing} onClick={seal}>
          {sealing
            ? "Sealing…"
            : ready
              ? "Seal the letter →"
              : `Keep writing (${Math.max(0, MIN_CHARS - text.trim().length)} to go)`}
        </button>
      </div>
    </div>
  );
}

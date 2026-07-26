import React from "react";
import { CARDS } from "./punchOut.js";

/* ════════════════════════════════════════════════════════════════════════
   THE RACK — three cards where the dodge buttons usually are.

   This is the whole of Officer Steele's "quick draw". The bout engine is
   untouched: `dodgeVerdict(now, strikeAt, moved, needed)` only ever asked
   whether `moved === needed` inside a timing window, so swapping the
   vocabulary from "duck | left | right" to a rebuttal key costs nothing.

   The drain bar is written as a CSS custom property rather than state — a
   sixty-times-a-second setState during the tightest window in the game would
   be the one place React overhead is actually visible.
   ════════════════════════════════════════════════════════════════════════ */

export default function RebuttalRack({ hand = [], live, msLeft = 0, tellMs = 900, onPick, disabled }) {
  return (
    <div
      className={`dgr ${live ? "is-live" : ""}`}
      style={{ "--drain": Math.max(0, Math.min(1, msLeft / Math.max(1, tellMs))) }}
    >
      <div className="dgr-rail" aria-hidden><i /></div>
      <div className="dgr-cards">
        {hand.map((key) => {
          const c = CARDS[key] || { key, name: key.toUpperCase(), line: "" };
          return (
            <button
              key={key}
              type="button"
              className="dgr-card"
              disabled={disabled || !live}
              onPointerDown={(e) => { e.preventDefault(); if (live && !disabled) onPick(key); }}
            >
              <span className="dgr-card__name">{c.name}</span>
              <span className="dgr-card__line">{c.line}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

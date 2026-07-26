import React from "react";
import { MentorSprite } from "../map-quest/kit.jsx";

// ════════════════════════════════════════════════════════════════════════
// MILESTONE CITY — NEXT STOP
// The city answers exactly one question: where do I go next?
// This bar is that answer. One district, one line, one button — and the
// button does the actual next thing (hear the lesson / enter the door),
// never a generic "open". Tapping the body still opens the full sheet for
// anyone who wants the lore and the meter.
// The caller computes the stop (see buildNextStop in MapQuestCityPage).
// ════════════════════════════════════════════════════════════════════════

export default function NextStopBar({ stop, onPrimary, onDetails }) {
  if (!stop || !stop.district) return null;
  const d = stop.district;

  return (
    <section
      className="mqc-next"
      style={{ "--n-color": d.color, "--n-glow": d.glow }}
      aria-label={`${stop.kicker}: ${d.name}`}
    >
      <button
        type="button"
        className="mqc-next__body"
        onClick={() => onDetails && onDetails(d)}
        aria-label={`${d.name} — open the district`}
      >
        <span className="mqc-next__sprite" aria-hidden="true">
          <MentorSprite size={44} color={stop.spriteColor || d.color} staff />
        </span>
        <span className="mqc-next__txt">
          <span className="mqc-next__kicker">{stop.kicker}</span>
          <span className="mqc-next__name">{d.name}</span>
          <p className="mqc-next__line">{stop.line}</p>
        </span>
      </button>

      <button
        type="button"
        className="mqc-btn mqc-btn--primary mqc-next__go"
        onClick={() => onPrimary && onPrimary(d, stop.action)}
      >
        {stop.cta}
      </button>
    </section>
  );
}

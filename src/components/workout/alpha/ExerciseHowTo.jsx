import React, { useState } from "react";
import HL from "./HL.jsx";
import ExerciseImg from "./ExerciseImg.jsx";
import { exerciseInfo } from "./data/exercises.js";

/* ALPHA MODE — the how-to panel.
   Collapsed row under any lift: "? how to do it · muscles · equipment".
   Tap to expand into the start position + numbered form cues from the
   exercise library. `defaultOpen` for lifts the user has never logged.
   `title`/`meta` overrides let the briefing use exercise rows as heads.
   Renders nothing when the name isn't in the library (custom lifts). */

export default function ExerciseHowTo({ name, title, meta, defaultOpen = false }) {
  const info = exerciseInfo(name);
  const [open, setOpen] = useState(defaultOpen);
  if (!info) return null;

  return (
    <div className={`iw-howto ${open ? "iw-howto-open" : ""}`}>
      <button type="button" className="iw-howto-head" aria-expanded={open}
        onClick={() => setOpen((o) => !o)}>
        <span className="iw-howto-q" aria-hidden="true">?</span>
        <span className="iw-howto-title">{title || "how to do it"}</span>
        <span className="iw-howto-meta">{meta || `${info.muscles} · ${info.equipment}`}</span>
        <span className="iw-howto-caret" aria-hidden="true">{open ? "▾" : "▸"}</span>
      </button>
      {open && (
        <div className="iw-howto-body">
          {(title || meta) && (
            <div className="iw-howto-tags">{info.muscles} · {info.equipment}</div>
          )}
          <ExerciseImg name={name} className="iw-exi-howto" />
          <p className="iw-howto-setup"><HL text={info.setup} /></p>
          <ol className="iw-howto-steps">
            {info.steps.map((s, i) => (
              <li key={i}><HL text={s} /></li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

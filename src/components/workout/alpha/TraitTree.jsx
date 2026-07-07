import React from "react";
import { TRAITS } from "./data/traits.js";

/* ALPHA MODE — the 7 Traits (light/shadow pairs).
   Leveled by behavior, not by weight on the bar. Each level fades
   the shadow name and brightens the light. Levels come from event
   counts computed in AlphaMode (traitLevels prop: id -> 0..5). */

export default function TraitTree({ traitLevels = {} }) {
  return (
    <div className="iw-al-traits">
      <div className="iw-eyebrow">self-mastery · not dominance</div>
      <h2 className="iw-display iw-page-title">The Seven Traits</h2>
      <p className="iw-body iw-al-forge-sub">
        Every strength throws a shadow. The Iron levels these by what you
        DO — showing up, honest logging, honoring rest — never by the bar.
      </p>
      <div className="iw-stack">
        {TRAITS.map((t) => {
          const lvl = Math.min(traitLevels[t.id] ?? 0, 5);
          const lightPct = 30 + lvl * 14;
          return (
            <div key={t.id} className="iw-al-trait">
              <div className="iw-al-trait-pair">
                <span className="iw-al-trait-light" style={{ opacity: lightPct / 100 + 0.2 }}>{t.light}</span>
                <span className="iw-al-trait-vs">not</span>
                <span className="iw-al-trait-shadow" style={{ opacity: Math.max(0.15, 0.9 - lvl * 0.15) }}>{t.shadow}</span>
              </div>
              <div className="iw-al-trait-pips">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`iw-al-pip ${i < lvl ? "iw-al-pip-on" : ""}`} />
                ))}
              </div>
              <div className="iw-al-trait-line">{t.line}</div>
              <div className="iw-al-dial-villain">levels by: {t.levelRule}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

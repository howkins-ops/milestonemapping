import React from "react";
import { maskCards } from "../../data/maskCards.js";
import { maskCardSrc } from "./shell.jsx";

/* The trophy wall: every mask you've transmuted in the Shadow Alchemist turns
   from a shrouded shadow into a glowing essence card you've collected. */
export default function EssenceGallery({ essences = [], onClose }) {
  const owned = new Set(essences.map((e) => e.maskId));
  const count = owned.size;

  return (
    <div className="sx-gallery">
      <div className="sx-top" style={{ marginBottom: 18 }}>
        <button className="sx-back" onClick={onClose}>← Back</button>
        <span className="sx-title" style={{ flex: 1 }}>Essence Gallery</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--brand-gold)", fontWeight: 800 }}>
          {count} / {maskCards.length}
        </span>
      </div>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,6vw,40px)", fontWeight: 900, margin: "0 0 8px" }}>
        Shadows turned to gold
      </h1>
      <p style={{ color: "var(--text-soft)", fontSize: 14.5, lineHeight: 1.55, margin: "0 0 8px", maxWidth: 520 }}>
        Every Survival Mechanism you meet and transmute in the Alchemist is reclaimed here as its essence. Collect all {maskCards.length}.
      </p>

      <div className="sx-gallery__grid">
        {maskCards.map((m) => {
          const got = owned.has(m.id);
          const ess = essences.find((e) => e.maskId === m.id);
          return (
            <div key={m.id} className={`sx-gallery__card ${got ? "on" : "locked"}`}>
              <img
                src={maskCardSrc(m.id, got ? "essence-card" : "front-card")}
                alt={m.name}
                onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
              />
              {!got && (
                <div className="sx-gallery__lock">
                  <span>🔒</span>
                  <small>Not yet transmuted</small>
                </div>
              )}
              <div className="sx-gallery__name">{got ? (ess?.essence || m.essenceReturn[0]) : m.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

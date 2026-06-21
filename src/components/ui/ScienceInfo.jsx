import React, { useState } from "react";
import Modal from "./Modal.jsx";
import { getResearchById } from "../../data/researchData.js";
import { useAppData } from "../../hooks/useAppData.js";
import { playSound } from "../../lib/sounds.js";

const ACCENT = {
  cyan:   { accent: "var(--brand-cyan)",   border: "rgba(0,240,255,0.28)",  bg: "rgba(0,240,255,0.05)" },
  gold:   { accent: "var(--brand-gold)",   border: "rgba(250,204,21,0.28)", bg: "rgba(250,204,21,0.05)" },
  green:  { accent: "var(--brand-green)",  border: "rgba(0,255,191,0.28)",  bg: "rgba(0,255,191,0.05)" },
  purple: { accent: "var(--brand-purple)", border: "rgba(139,92,246,0.28)", bg: "rgba(139,92,246,0.05)" },
  pink:   { accent: "var(--brand-pink)",   border: "rgba(255,62,219,0.28)", bg: "rgba(255,62,219,0.05)" },
};

/**
 * A small "?" button that reveals the peer-reviewed science behind a feature.
 *
 * Pass research-bank ids:  <ScienceInfo ids={["gratitude"]} />
 * Or inline cards:         <ScienceInfo cards={[{ category, categoryColor, headline, appLine, stat, source, sourceUrl, icon }]} />
 */
export default function ScienceInfo({
  ids = [],
  cards: inlineCards = [],
  title = "The Science Behind This",
  className = "",
  style = {},
}) {
  const [open, setOpen] = useState(false);
  const { settings } = useAppData();

  const cards = [
    ...ids.map(getResearchById).filter(Boolean),
    ...inlineCards,
  ];

  if (!cards.length) return null;

  const openModal = (e) => {
    e?.stopPropagation();
    setOpen(true);
    playSound("insight", settings);
  };

  return (
    <>
      <button
        type="button"
        className={`science-info-btn ${className}`}
        style={style}
        onClick={openModal}
        aria-label="See the science behind this"
        title="The science behind this"
      >
        ?
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={title}>
        <p className="science-info-intro">
          Not productivity hype — peer-reviewed research. Here's why this is in the app.
        </p>

        <div className="science-info-list">
          {cards.map((card, i) => {
            const c = ACCENT[card.categoryColor] || ACCENT.cyan;
            return (
              <div
                key={card.id || i}
                className="science-info-card"
                style={{ borderColor: c.border, background: c.bg }}
              >
                <span
                  className="science-info-pill"
                  style={{ color: c.accent, background: c.border }}
                >
                  {card.icon} {card.category}
                </span>

                <p className="science-info-headline">{card.headline}</p>

                {card.appLine && (
                  <p className="science-info-why">{card.appLine}</p>
                )}

                <div
                  className="science-info-stat"
                  style={{ borderColor: c.border }}
                >
                  <span
                    className="science-info-stat-label"
                    style={{ color: c.accent }}
                  >
                    The research
                  </span>
                  <p className="science-info-stat-text">{card.stat}</p>
                </div>

                <div className="science-info-source">
                  <span>{card.source}</span>
                  {card.sourceUrl && (
                    <a
                      href={card.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: c.accent, borderColor: c.border }}
                    >
                      View study ↗
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="science-info-foot">
          Every feature here is backed by evidence. This app supports your goals — it's not a
          substitute for professional mental health care.
        </p>
      </Modal>
    </>
  );
}

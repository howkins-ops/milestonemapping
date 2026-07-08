import React from "react";
import NavIcon from "../ui/NavIcon.jsx";

// Categorized glass tiles — every id maps to a case in App.jsx's switch.
const SECTIONS = [
  {
    id: "progress",
    title: "Review & Progress",
    items: [
      { id: "zone", label: "The Accountability Zone", sub: "Squads, streaks, witnesses", accent: "#FF3B5C" },
      { id: "weekly", label: "Weekly Review", sub: "Score the week, set the next", accent: "#FACC15" },
      { id: "stats", label: "Stats", sub: "XP, streaks, momentum", accent: "#00F0FF" },
      { id: "rewards", label: "Rewards Vault", sub: "Claim what you've earned", accent: "#FF3EDB" },
    ],
  },
  {
    id: "learn",
    title: "Learn the System",
    items: [
      { id: "formula", label: "Mastery Formula", sub: "The 7-step engine", accent: "#7B2CFF" },
      { id: "science", label: "The Science", sub: "Why this works", accent: "#00FFBF" },
    ],
  },
  {
    id: "system",
    title: "System",
    items: [
      { id: "settings", label: "Settings", sub: "Theme, data, account", accent: "#8CE1F5" },
    ],
  },
];

export default function MoreSheet({ currentPage, onNavigate, onClose }) {
  let tileIndex = 0;
  return (
    <div className="more-overlay" onClick={onClose}>
      <div className="more-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="More navigation">
        <div className="more-sheet__handle" />
        <p className="more-sheet__kicker">Tools &amp; Config</p>
        {SECTIONS.map((section) => (
          <section key={section.id} className="more-sheet__section">
            <h3 className="more-sheet__section-title">{section.title}</h3>
            <div className="more-sheet__tiles">
              {section.items.map((item) => {
                const i = tileIndex++;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`more-tile ${currentPage === item.id ? "is-active" : ""}`}
                    style={{ "--mt": item.accent, "--i": i }}
                    onClick={() => onNavigate(item.id)}
                  >
                    <span className="more-tile__icon" aria-hidden="true">
                      <NavIcon name={item.id} />
                    </span>
                    <span className="more-tile__text">
                      <span className="more-tile__label">{item.label}</span>
                      <span className="more-tile__sub">{item.sub}</span>
                    </span>
                    <span className="more-tile__arrow" aria-hidden="true">→</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
        <button type="button" className="more-sheet__close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

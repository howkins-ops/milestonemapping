import React from "react";
import NavIcon from "../ui/NavIcon.jsx";

// Categorized glass tiles — every id maps to a case in App.jsx's switch.
const SECTIONS = [
  {
    id: "paths",
    title: "Growth Paths",
    items: [
      { id: "zone", label: "The Zone", sub: "Accountability with your people", accent: "#FF3B5C" },
      { id: "identity", label: "Identity", sub: "Name the new version", accent: "#7B2CFF" },
      { id: "vision", label: "Vision Board", sub: "See where you're going", accent: "#00F0FF" },
      { id: "essence", label: "Shadow Work", sub: "Face what's holding you back", accent: "#8B5CF6" },
      { id: "anger", label: "Anger Gym", sub: "Turn pressure into power", accent: "#FF6A3D" },
      { id: "training", label: "5 Shifts", sub: "Cinematic transformation", accent: "#FACC15" },
      { id: "wellbeing", label: "Fill Your Cup", sub: "Energy & recovery", accent: "#00FFBF" },
      { id: "blaze", label: "B.L.A.Z.E.", sub: "Advanced training lab", accent: "#FF3EDB" },
    ],
  },
  {
    id: "progress",
    title: "Review & Progress",
    items: [
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

export default function MoreSheet({ currentPage, onNavigate, onClose, onSignOut, profile }) {
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
        {onSignOut && (
          <section className="more-sheet__section">
            <h3 className="more-sheet__section-title">Account</h3>
            <div className="more-sheet__tiles">
              <button
                type="button"
                className="more-tile more-tile--signout"
                style={{ "--mt": "#94A3B8", "--i": tileIndex++ }}
                onClick={() => { onClose(); onSignOut(); }}
              >
                <span className="more-tile__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 17l5-5-5-5" />
                    <path d="M20 12H9" />
                    <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
                  </svg>
                </span>
                <span className="more-tile__text">
                  <span className="more-tile__label">Sign Out</span>
                  <span className="more-tile__sub">
                    {profile?.display_name || profile?.full_name || "Your account"}
                  </span>
                </span>
                <span className="more-tile__arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        )}
        <button type="button" className="more-sheet__close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

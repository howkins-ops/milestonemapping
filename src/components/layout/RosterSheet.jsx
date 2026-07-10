import React, { useEffect } from "react";
import { ARENA_GAMES } from "../zone/arena/arenaGames.js";
import "./RosterSheet.css";

// The Arena Roster — a top-nav bottom-sheet that surfaces all 10 Squad Arena
// games for one-tap launch, plus quick entry to Challenge / Partner / Circle.
// Mirrors MoreSheet's chrome (.more-overlay / .more-sheet / .more-sheet__close)
// and reuses ARENA_GAMES as the single source of truth so the roster can never
// drift from the arena itself. Games launch via onPickGame(key); the quick
// actions route to Zone sub-views via onPickView(view).

// Per-scope accent — squad (cyan) / partner (magenta) / solo (amber).
const SCOPE_ACCENT = {
  squad: "#00F0FF",
  partner: "#FF3EDB",
  solo: "#FACC15",
};
const SCOPE_LABEL = {
  squad: "Squad",
  partner: "Partner",
  solo: "Solo",
};

const QUICK = [
  { view: "challenges", label: "Challenge a friend", sub: "Set a head-to-head", accent: "#FF3EDB" },
  { view: "partner", label: "Partner duel", sub: "Your accountability partner", accent: "#00F0FF" },
  { view: "friends", label: "Your circle", sub: "Everyone you're connected to", accent: "#7B2CFF" },
];

export default function RosterSheet({ open, onClose, onPickGame, onPickView }) {
  // Escape-to-close, matching the app's other dismissible overlays.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="more-overlay" onClick={onClose}>
      <div
        className="more-sheet roster-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Arena roster"
      >
        <div className="more-sheet__handle" />
        <p className="more-sheet__kicker">The Squad Arena</p>

        <section className="more-sheet__section">
          <h3 className="more-sheet__section-title">Jump into a game</h3>
          <div className="roster-list">
            {ARENA_GAMES.map((game, i) => {
              const accent = SCOPE_ACCENT[game.scope] || "#00F0FF";
              return (
                <button
                  key={game.key}
                  type="button"
                  className="roster-tile"
                  style={{ "--rt": accent, "--i": i }}
                  onClick={() => onPickGame?.(game.key)}
                >
                  <span className="roster-tile__media" aria-hidden="true">
                    <img src={game.image} alt="" loading="lazy" />
                    <span className="roster-tile__glyph">
                      {game.glyph}
                    </span>
                  </span>
                  <span className="roster-tile__text">
                    <span className="roster-tile__toprow">
                      <span className="roster-tile__title">{game.title}</span>
                      <span className="roster-scope">{SCOPE_LABEL[game.scope] || game.scope}</span>
                    </span>
                    <span className="roster-tile__tag">{game.short || game.tagline}</span>
                    <span className="roster-tile__explain">{game.summary}</span>
                  </span>
                  <span className="roster-tile__arrow" aria-hidden="true">→</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="more-sheet__section">
          <h3 className="more-sheet__section-title">Challenge &amp; invite</h3>
          <div className="roster-quick">
            {QUICK.map((q) => (
              <button
                key={q.view}
                type="button"
                className="roster-quick__btn"
                style={{ "--rt": q.accent }}
                onClick={() => onPickView?.(q.view)}
              >
                <span className="roster-quick__label">{q.label}</span>
                <span className="roster-quick__sub">{q.sub}</span>
              </button>
            ))}
          </div>
        </section>

        <button type="button" className="more-sheet__close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

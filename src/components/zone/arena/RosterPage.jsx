// RosterPage — THE ROSTER as its own screen. The Zone's "Games" tab lands here
// (it used to pop a bottom sheet, and a second copy of the grid sat at the foot
// of the Squad Arena hub — both are gone; this page is the one place games live).
//
// One screen, one question: which game am I stepping into? Header, a scope
// filter (all / solo / 1v1 / squad), the fighter-select grid, and the
// challenge-a-human shortcuts the old sheet carried. Nothing else.
//
// Ownership: RosterPage.jsx + RosterPage.css (rp- prefix) + ArenaGamesGrid.
// ARENA_GAMES stays the single source of truth — this page never hardcodes a game.

import React, { useMemo, useState } from "react";
import { ARENA_GAMES } from "./arenaGames.js";
import ArenaGamesGrid from "./ArenaGamesGrid.jsx";
import { useReveal } from "./useArenaFX.js";
import "./ArenaHome.css";
import "./RosterPage.css";

// Scope filters, in roster order. `key: null` = show everything.
const FILTERS = [
  { key: null, label: "All" },
  { key: "solo", label: "Solo" },
  { key: "partner", label: "1v1" },
  { key: "squad", label: "Squad" },
];

// The human shortcuts the roster sheet used to own — kept so putting a real
// person on the other side of a game is never more than one tap from here.
const QUICK = [
  { view: "challenges", label: "Challenge a friend", sub: "Set a head-to-head", accent: "#FF3EDB" },
  { view: "partner", label: "Partner duel", sub: "Your accountability partner", accent: "#00F0FF" },
  { view: "friends", label: "Your circle", sub: "Everyone you're connected to", accent: "#7B2CFF" },
];

export default function RosterPage({ go }) {
  const reveal = useReveal();
  const [scope, setScope] = useState(null);

  const counts = useMemo(() => {
    const c = { solo: 0, partner: 0, squad: 0 };
    ARENA_GAMES.forEach((g) => {
      if (c[g.scope] != null) c[g.scope] += 1;
    });
    return c;
  }, []);

  const games = useMemo(
    () => (scope ? ARENA_GAMES.filter((g) => g.scope === scope) : ARENA_GAMES),
    [scope]
  );

  return (
    <div className="rp-page zn-stagger" ref={reveal}>
      <header className="arn-head rp-head">
        <p className="zn-eyebrow arn-eyebrow">Choose your fighter</p>
        <h1 className="arn-title rp-title">The Roster</h1>
        <p className="arn-sub">
          {ARENA_GAMES.length} arenas, {ARENA_GAMES.length} ways to burn. Every game trains a
          different muscle of the fire. Lock one in and step into the light.
        </p>
      </header>

      <div className="rp-filters" role="tablist" aria-label="Filter games by who plays">
        {FILTERS.map((f) => {
          const on = scope === f.key;
          const n = f.key ? counts[f.key] || 0 : ARENA_GAMES.length;
          return (
            <button
              key={f.label}
              type="button"
              role="tab"
              aria-selected={on}
              className={`rp-filter${on ? " is-on" : ""}`}
              onClick={() => setScope(f.key)}
            >
              {f.label}
              <span className="rp-filter__n">{n}</span>
            </button>
          );
        })}
      </div>

      <ArenaGamesGrid go={go} games={games} showHeader={false} />

      <section className="rp-quick">
        <p className="zn-eyebrow">Put a person on the other side</p>
        <div className="rp-quick__grid">
          {QUICK.map((q) => (
            <button
              key={q.view}
              type="button"
              className="rp-quick__btn"
              style={{ "--rq": q.accent }}
              onClick={() => go && go(q.view, null)}
            >
              <span className="rp-quick__label">{q.label}</span>
              <span className="rp-quick__sub">{q.sub}</span>
              <span className="rp-quick__arrow" aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

// ArenaGamesGrid — the "choose your fighter" launcher for the Squad Arena.
// Ports the concept's ROSTER select-screen feel (neon gradient-edge cards, a
// glyph portrait with a breathing aura, scope tag, entrance stagger) but rebuilt
// mobile-first and performance-lawful (§3): NO tilt-on-mousemove, NO custom
// cursor, NO per-frame handlers — just CSS transform/opacity, an
// IntersectionObserver reveal, and a tap-only spark burst.
//
// Ownership: this file + ArenaHome.css (shared arn-/ah- prefixes) only.
// Tapping a card routes via go('arena', <key>).

import React, { useCallback } from "react";
import { ARENA_GAMES } from "./arenaGames.js";
import { useReveal, useArenaBurst } from "./useArenaFX.js";
import { sfxPop } from "../../../lib/sfx.js";
import "./ArenaHome.css";

// Accent per scope — reuses the brand neons so squad/partner/solo read at a glance.
const SCOPE_META = {
  squad: { label: "Squad", c1: "#FF7A1A", c2: "#FFD166" },
  partner: { label: "1v1", c1: "#00F0FF", c2: "#D11EFF" },
  solo: { label: "Solo", c1: "#00FFBF", c2: "#00F0FF" },
};

function GameCard({ game, index, onPick }) {
  const meta = SCOPE_META[game.scope] || SCOPE_META.squad;

  const handleClick = useCallback(
    (e) => {
      try {
        sfxPop();
      } catch {
        /* audio never blocks a tap */
      }
      onPick(game.key, e);
    },
    [game.key, onPick]
  );

  return (
    <button
      type="button"
      className="arn-card"
      style={{ "--arn-c1": meta.c1, "--arn-c2": meta.c2, "--arn-i": index }}
      onClick={handleClick}
      aria-label={`${game.title} — ${game.tagline}`}
    >
      <span className="arn-card__inner">
        <span className="arn-card__num" aria-hidden="true">
          {index < 9 ? `0${index + 1}` : index + 1}
        </span>
        <span className="arn-card__scope" aria-hidden="true">
          {meta.label}
        </span>
        <span className="arn-card__portrait" aria-hidden="true">
          <span className="arn-card__aura" />
          <span className="arn-glyph">{game.glyph}</span>
        </span>
        <span className="arn-card__title">{game.title}</span>
        <span className="arn-card__tag">{game.tagline}</span>
        <span className="arn-card__enter" aria-hidden="true">
          Enter →
        </span>
      </span>
    </button>
  );
}

export default function ArenaGamesGrid({ go }) {
  const reveal = useReveal();
  const burst = useArenaBurst();

  const pick = useCallback(
    (key, e) => {
      const x = e?.clientX ?? window.innerWidth / 2;
      const y = e?.clientY ?? window.innerHeight / 2;
      burst(x, y, "#FFD166");
      go && go("arena", key);
    },
    [burst, go]
  );

  return (
    <section className="arn-wrap" ref={reveal}>
      <header className="arn-head">
        <p className="zn-eyebrow arn-eyebrow">Choose your fighter</p>
        <h2 className="arn-title">The Roster</h2>
        <p className="arn-sub">
          Nine arenas, nine ways to burn. Every game trains a different muscle of the fire.
          Lock one in and step into the light.
        </p>
      </header>

      <div className="arn-grid">
        {ARENA_GAMES.map((game, i) => (
          <GameCard key={game.key} game={game} index={i} onPick={pick} />
        ))}
      </div>
    </section>
  );
}

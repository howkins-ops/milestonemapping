import React, { useEffect } from "react";
import { PHASES } from "./data/phases.js";
import { bossesForPhase } from "./data/mythBosses.js";
import { SCROLLS } from "./data/scrolls.js";
import { ScrollCard } from "./WisdomScroll.jsx";
import { sfxScrollUnfurl } from "../../../lib/sfx.js";

/* ALPHA MODE — a zone gate.
   Entering a phase-zone is a ritual: the gate scroll unfurls (once),
   the tier-1 guardian boss must fall, then the doors open. Later
   bosses of the tier become challenge cards on the zone hub. */

export default function ZoneGate({ phaseId, alpha, addXP, onFight, onEnter, onBack, settings }) {
  const phase = PHASES[phaseId];
  const bosses = bossesForPhase(phaseId);
  const guardian = bosses[0];
  const defeated = new Set(alpha.state.flags.bossesDefeated || []);
  const guardianDown = guardian ? defeated.has(guardian.id) : true;
  const scrollId = `gate-${phaseId}`;
  const scroll = SCROLLS.find((s) => s.id === scrollId);
  const scrollCollected = (alpha.state.flags.scrolls || []).includes(scrollId);

  /* the gate scroll unfurls the first time you stand here */
  useEffect(() => {
    if (scroll && !scrollCollected) {
      sfxScrollUnfurl(settings);
      alpha.patchState({
        flags: { ...alpha.state.flags, scrolls: [...(alpha.state.flags.scrolls || []), scrollId] },
      });
      alpha.logEvent("scroll", { scrollId });
      addXP(10, "Wisdom scroll — collected");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!phase) return null;

  return (
    <div className="iw-al-gatepage" style={{ "--iw-al-accent": phase.accent }}>
      <button className="iw-back" onClick={onBack}>❮ the map</button>
      <div className="iw-al-gate-banner">
        <div className="iw-al-gate-phase">PHASE {phase.n}</div>
        <h2 className="iw-display iw-al-gate-name">{phase.name}</h2>
        <div className="iw-al-gate-sub">{phase.subtitle}</div>
      </div>

      {scroll && <ScrollCard scroll={scroll} unfurl={!scrollCollected} />}

      {guardian && (
        <div className={`iw-al-guardian ${guardianDown ? "iw-al-guardian-down" : ""}`}>
          <div className="iw-eyebrow">{guardianDown ? "guardian — defeated" : "the gate guardian"}</div>
          <div className="iw-al-guardian-name">{guardian.name}</div>
          <p className="iw-al-boss-myth">“{guardian.myth}”</p>
          {!guardianDown ? (
            <button className="iw-btn-ember iw-btn-wide" onClick={() => onFight(guardian.id)}>
              ⚔ face the guardian
            </button>
          ) : (
            <div className="iw-al-guardian-slain">✦ myth busted — the doors answer to you</div>
          )}
        </div>
      )}

      <button className={`iw-btn-ember iw-btn-wide ${guardianDown ? "" : "iw-btn-off"}`}
        disabled={!guardianDown} onClick={onEnter}>
        enter {phase.name}
      </button>

      {bosses.length > 1 && (
        <p className="iw-al-fastline">
          {bosses.length - 1} more myths haunt this zone — they'll surface as
          challenges once you're inside.
        </p>
      )}
    </div>
  );
}

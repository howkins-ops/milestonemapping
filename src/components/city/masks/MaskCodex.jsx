import React from "react";
import MaskSprite from "./MaskSprite.jsx";
import WispSprite from "./WispSprite.jsx";
import { MASK_BOSSES } from "./maskBosses.js";
import { WILD_CRITICS } from "./wildCritics.js";
import { getEssence } from "./essences.js";
import "../../../styles/maskCourt.css";

// ════════════════════════════════════════════════════════════════════════
// MASK ENCOUNTERS — the Mask Codex (the Pokédex)
// Every critic and boss the user has faced: sealed / named ×n / EVOLVED,
// the fears they actually typed, essences returned, proofs locked. This is
// a game screen AND the user's shadow-work journal — read-only, beautiful.
// Pokédex grammar: integrated bosses show dark form → evolved form side by
// side; un-named wild critics stay ??? silhouettes.
// ════════════════════════════════════════════════════════════════════════

function uniqueTail(list, n = 3) {
  const uniq = [...new Set((list || []).filter(Boolean))];
  return uniq.slice(-n);
}

export default function MaskCodex({ masks, onClose }) {
  const state = masks.state;

  return (
    <div className="mqk-codex" role="dialog" aria-modal="true" aria-label="The Mask Codex">
      <div className="mqk-codex__panel">
        <header className="mqk-codex__head">
          <div>
            <div className="mqk-codex__kicker">🎭 THE MASK CODEX</div>
            <h2 className="mqk-codex__title mqk-display">Every voice you've named</h2>
            <p className="mqk-codex__sub">
              Naming is the only thing that lands. {masks.integratedCount}/5 masks evolved ·{" "}
              {masks.namedCriticCount}/8 wild voices named · {masks.wildWinCount} namings total
            </p>
          </div>
          <button type="button" className="mqk-codex__close" onClick={onClose} aria-label="Close the codex">
            ×
          </button>
        </header>

        <h3 className="mqk-codex__section">THE FIVE</h3>
        <div className="mqk-codex__bosses">
          {MASK_BOSSES.map((b) => {
            const it = state.integrated[b.id];
            const materialized = Boolean(state.materialized[b.id]);
            const relapse = state.relapse[b.id];
            const ess = it ? getEssence(it.essence) : null;
            return (
              <article
                key={b.id}
                className={`mqk-codex__boss${it ? " is-evolved" : ""}`}
                style={{ "--boss-color": b.color, "--evolved-glow": ess ? ess.color : b.color }}
              >
                <div className="mqk-codex__rigs">
                  <div className={`mqk-codex__rig mqk-codex__rig--dark${it ? " is-past" : ""}`}>
                    <MaskSprite kind={b.id} />
                  </div>
                  {it ? (
                    <>
                      <span className="mqk-codex__arrow" aria-hidden="true">→</span>
                      <div className="mqk-codex__rig mqk-codex__rig--evolved">
                        <MaskSprite kind={b.id} evolved />
                      </div>
                    </>
                  ) : null}
                </div>
                <div className="mqk-codex__bossname mqk-display">
                  {it ? b.evolved.name : b.name}
                </div>
                <div className="mqk-codex__state">
                  {it
                    ? `✓ EVOLVED · ${b.evolved.role}`
                    : materialized
                      ? `IT WAITS — the end of ${b.zone}`
                      : "SEALED · keep walking, keep naming"}
                </div>
                {it ? (
                  <div className="mqk-codex__detail">
                    {ess ? (
                      <div>
                        ESSENCE RETURNED: {ess.emoji} {ess.name}
                      </div>
                    ) : null}
                    {it.fears && it.fears.length ? (
                      <div>AFRAID OF: {it.fears.join(" · ")}</div>
                    ) : null}
                    {it.proof ? <div>YOUR PROOF: {it.proof}</div> : null}
                    {relapse ? (
                      <div>OLD VOICE RE-NAMED ×{relapse.count} — it kneels faster every time</div>
                    ) : null}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <h3 className="mqk-codex__section">WILD VOICES</h3>
        <div className="mqk-codex__wilds">
          {WILD_CRITICS.map((cr) => {
            const w = state.wildWins[cr.id];
            const named = Boolean(w && w.count > 0);
            return (
              <article
                key={cr.id}
                className={`mqk-codex__wild${named ? " is-named" : ""}`}
                style={{ "--boss-color": cr.color }}
              >
                <div className="mqk-codex__wildrig">
                  <WispSprite color={named ? cr.color : "#3a3a4a"} />
                </div>
                <div className="mqk-codex__wildname mqk-display">{named ? cr.name : "???"}</div>
                <div className="mqk-codex__state">
                  {named ? `NAMED ×${w.count}` : "unmet — it drifts in the fog"}
                </div>
                {named && w.fears && w.fears.length ? (
                  <div className="mqk-codex__detail">
                    <div>AFRAID OF: {uniqueTail(w.fears).join(" · ")}</div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <footer className="mqk-codex__foot">
          {state.stats.ambushes} ambushes faced · walked away with permission ×
          {state.stats.walkaways} — walking away is a skill, not a loss
          {masks.courtClaimed ? " · THE COURT IS YOURS — the fog has thinned" : ""}
        </footer>

        <button
          type="button"
          className={`mqk-codex__toggle${masks.encountersOff ? " is-off" : ""}`}
          onClick={() => masks.setEncountersOff(!masks.encountersOff)}
          aria-pressed={masks.encountersOff}
        >
          {masks.encountersOff
            ? "ENCOUNTERS OFF — the fog stays quiet. Tap to turn them back on."
            : "ENCOUNTERS ON — critics roam the fog. Tap to turn them off."}
        </button>
      </div>
    </div>
  );
}

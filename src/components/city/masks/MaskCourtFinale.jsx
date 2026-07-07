import React from "react";
import PlayerSprite from "../world/PlayerSprite.jsx";
import MaskSprite from "./MaskSprite.jsx";
import { MASK_BOSSES, XP_COURT } from "./maskBosses.js";
import { getEssence } from "./essences.js";
import "../../../styles/maskCourt.css";

// ════════════════════════════════════════════════════════════════════════
// MASK ENCOUNTERS — THE COURT IS YOURS (the finale)
// Plays once, the moment the fifth mask evolves: the Seeker stands with
// all five EVOLVED protectors at their back. Port of the concept's
// #s-court screen. After this, the fog thins over the whole city — for
// good. Static under reduced motion, skippable by its only button.
// ════════════════════════════════════════════════════════════════════════

export default function MaskCourtFinale({ masks, onClose }) {
  return (
    <div className="mqk-court" role="dialog" aria-modal="true" aria-label="The court is yours">
      <div className="mqk-court__kicker">ALL FIVE MASKS INTEGRATED</div>
      <h1 className="mqk-court__title mqk-display">
        The Court
        <br />
        Is Yours
      </h1>

      <div className="mqk-court__lineup" aria-hidden="true">
        <div className="mqk-court__you">
          <PlayerSprite glow="#00F0FF" />
        </div>
        {MASK_BOSSES.map((b) => {
          const it = masks.integrated[b.id];
          const ess = it ? getEssence(it.essence) : null;
          return (
            <div
              key={b.id}
              className="mqk-court__ally"
              style={{ "--evolved-glow": ess ? ess.color : b.color }}
            >
              <MaskSprite kind={b.id} evolved />
            </div>
          );
        })}
      </div>

      <p className="mqk-court__sub">
        {MASK_BOSSES.map((b) => `${b.evolved.name} ${b.evolved.role}.`).join(" ")}
        <br />
        NONE OF THEM LEAD. <b>YOU DO.</b>
      </p>

      <div className="mqk-court__rank">
        RANK · CRITIC HANDLER → SOVEREIGN &nbsp;·&nbsp; +{XP_COURT} XP
      </div>
      <p className="mqk-court__fognote">The fog thins over the whole city. It stays thinned.</p>

      <button type="button" className="mqk-court__walk mqk-display" onClick={onClose}>
        Walk your street
      </button>
    </div>
  );
}

import React from "react";
import { GameIcon } from "../door/GameIcons.jsx";
import { HEAT, heatTier } from "./heatTuning.js";

/* The wanted level, on the street. Stars rather than a bar, because the state
   the player needs at a glance is "how much trouble am I in", not a number —
   and because it is the same vocabulary the chase uses, so learning it once
   covers both. Zero emoji: the star is a drawn <symbol>. */
export default function HeatMeter({ heat = 0 }) {
  const tier = heatTier(heat);
  const max = HEAT.tiers[HEAT.tiers.length - 1].stars;
  return (
    <span className="dh-meter" data-tier={tier.key} title={`Heat: ${tier.label}`}>
      <span className="dh-meter__stars">
        {Array.from({ length: max }, (_, i) => (
          <GameIcon key={i} name="star" size={12} className={i < tier.stars ? "is-on" : ""} />
        ))}
      </span>
      <span className="dh-meter__label">{tier.label}</span>
    </span>
  );
}

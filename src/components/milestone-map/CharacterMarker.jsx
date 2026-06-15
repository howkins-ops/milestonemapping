import React from "react";
import { milestoneWorldAssets as MWA } from "../../data/assetRegistry.js";

// Parent should set key={`${currentIndex}-${doneCount}-${allDone}`} to trigger
// the CSS re-entrance animation whenever the avatar moves.
export default function CharacterMarker({ point, allDone }) {
  return (
    <div
      className="trail-world__avatar"
      style={{ left: `${point.x}%`, top: point.y + 88 }}
      aria-label="Current reality"
    >
      <span>
        <img src={allDone ? MWA.avatars.victory : MWA.avatars.walkingTrail} alt="" />
      </span>
      <strong>Current Reality</strong>
    </div>
  );
}

import React from "react";
import { getNodeAsset, milestoneWorldAssets as MWA } from "../../data/assetRegistry.js";

function NodeIcon({ status }) {
  if (status === "completed") {
    return (
      <svg viewBox="0 0 42 42" aria-hidden="true">
        <path d="M11 22.5 18 29l14-17" />
      </svg>
    );
  }
  if (status === "locked") {
    return (
      <svg viewBox="0 0 42 42" aria-hidden="true">
        <path d="M13 19h16v14H13z" />
        <path d="M17 19v-5a4 4 0 0 1 8 0v5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 42 42" aria-hidden="true">
      <path d="M7 31h28L25.5 12 19 24l-4-7L7 31Z" />
      <path d="M24 12h8l-2 4 2 4h-8" />
    </svg>
  );
}

export default function MapNode({
  milestone,
  point,
  status,
  index,
  isFinalGoal,
  isOpening,
  isNewlyUnlocked,
  isShaking,
  showLockedTooltip,
  isDragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}) {
  const trailSrc =
    status === "locked"
      ? MWA.trails.locked
      : status === "completed"
      ? MWA.trails.completed
      : MWA.trails.active;

  const className = [
    "trail-node",
    `is-${status}`,
    isDragging      ? "is-dragging"        : "",
    isOpening       ? "is-opening"         : "",
    isNewlyUnlocked ? "is-newly-unlocked"  : "",
    isShaking       ? "is-shake"           : "",
  ].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      className={className}
      style={{ left: `${point.x}%`, top: point.y, touchAction: "none", "--node-delay": `${index * 70}ms` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      aria-label={`${milestone.title}: ${status}`}
    >
      <span className="trail-node__segment" aria-hidden="true">
        <img src={trailSrc} alt="" />
      </span>
      <span className="trail-node__orb">
        <img
          className="trail-node__sprite"
          src={getNodeAsset(status, isFinalGoal)}
          alt=""
          onError={(e) => { e.currentTarget.style.opacity = "0.4"; }}
        />
        <span className="trail-node__state-mark">
          <NodeIcon status={status} />
        </span>
      </span>
      {status !== "locked" && (
        <span className="trail-node__burst" aria-hidden="true">
          {Array.from({ length: 6 }, (_, spark) => <i key={spark} style={{ "--spark": spark }} />)}
        </span>
      )}
      {showLockedTooltip && (
        <span className="trail-node__locked-tip" role="tooltip">
          Complete the previous milestone first.
        </span>
      )}
    </button>
  );
}

import React from "react";

// Treasure chest image (same assets as the Vault).
const CHEST_BASE = "/assets/treasure-system";
function chestSrc(state) {
  return `${CHEST_BASE}/legendary-chest-${state}.png`;
}

function NodeOrbSVG({ status }) {
  if (status === "completed") {
    return (
      <svg viewBox="0 0 44 44" aria-hidden="true" className="trail-node__glyph" style={{ overflow: "visible" }}>
        <circle cx="22" cy="22" r="20" style={{ fill: "currentColor", fillOpacity: 0.1, stroke: "none" }} />
        <circle cx="22" cy="22" r="20" style={{ fill: "none", stroke: "currentColor", strokeWidth: 1, strokeOpacity: 0.3 }} />
        <path
          d="M12 23 19 30 33 14"
          style={{
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 3,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            filter: "drop-shadow(0 0 5px currentColor)",
          }}
        />
      </svg>
    );
  }

  if (status === "locked") {
    return (
      <svg viewBox="0 0 44 44" aria-hidden="true" className="trail-node__glyph" style={{ overflow: "visible" }}>
        <polygon
          points="22,2 40,12 40,32 22,42 4,32 4,12"
          style={{ fill: "currentColor", fillOpacity: 0.06, stroke: "currentColor", strokeWidth: 1.5, strokeOpacity: 0.4 }}
        />
        <rect
          x="14" y="22" width="16" height="12" rx="2"
          style={{ fill: "currentColor", fillOpacity: 0.18, stroke: "currentColor", strokeWidth: 2 }}
        />
        <path
          d="M17 22v-5a5 5 0 0 1 10 0v5"
          style={{ fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" }}
        />
      </svg>
    );
  }

  if (status === "in_progress") {
    return (
      <svg viewBox="0 0 44 44" aria-hidden="true" className="trail-node__glyph" style={{ overflow: "visible" }}>
        <circle cx="22" cy="22" r="20" style={{ fill: "currentColor", fillOpacity: 0.08, stroke: "none" }} />
        <circle
          cx="22" cy="22" r="17"
          className="trail-node__orbit"
          style={{ fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeDasharray: "4 6", strokeOpacity: 0.7 }}
        />
        <path
          d="M18 30 L22 14 L26 23 L29 18"
          style={{
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 2.5,
            strokeLinecap: "round",
            strokeLinejoin: "round",
            filter: "drop-shadow(0 0 5px currentColor)",
          }}
        />
      </svg>
    );
  }

  // active (default)
  return (
    <svg viewBox="0 0 44 44" aria-hidden="true" className="trail-node__glyph" style={{ overflow: "visible" }}>
      <circle cx="22" cy="22" r="20" style={{ fill: "currentColor", fillOpacity: 0.1, stroke: "none" }} />
      <circle cx="22" cy="22" r="19" style={{ fill: "none", stroke: "currentColor", strokeWidth: 0.8, strokeOpacity: 0.35 }} />
      <circle cx="22" cy="22" r="15" style={{ fill: "none", stroke: "currentColor", strokeWidth: 0.5, strokeOpacity: 0.2 }} />
      <path
        d="M8 33h28L26 11 20 24l-5-7L8 33Z"
        style={{
          fill: "currentColor",
          fillOpacity: 0.2,
          stroke: "currentColor",
          strokeWidth: 2,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          filter: "drop-shadow(0 0 6px currentColor)",
        }}
      />
    </svg>
  );
}

export default function MapNode({
  milestone,
  point,
  status,
  index,
  isFirst,
  isOpening,
  isNewlyUnlocked,
  isShaking,
  showLockedTooltip,
  isDragging,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onOpenMilestone,
}) {
  const className = [
    "trail-node",
    `is-${status}`,
    isDragging      ? "is-dragging"       : "",
    isOpening       ? "is-opening"        : "",
    isNewlyUnlocked ? "is-newly-unlocked" : "",
    isShaking       ? "is-shake"          : "",
  ].filter(Boolean).join(" ");

  const cardSide = point.side || (index % 2 === 0 ? "right" : "left");

  const statusLabel =
    status === "in_progress" ? "In Progress"
    : status === "completed" ? "Completed"
    : status === "active"    ? "Active"
    : "Locked";

  return (
    <button
      type="button"
      className={className}
      style={{
        left: `${point.x}%`,
        top: point.y,
        touchAction: "none",
        "--node-delay": `${index * 70}ms`,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      aria-label={`${milestone.title}: ${status}`}
    >
      {isFirst && (
        <span className="trail-node__origin" aria-hidden="true">
          <span className="trail-node__origin-gate" />
          <span className="trail-node__origin-glow" />
          <span className="trail-node__origin-ring" />
          <span className="trail-node__origin-ring trail-node__origin-ring--delay" />
          <em className="trail-node__origin-tag">START</em>
        </span>
      )}

      <span className="trail-node__orb">
        <NodeOrbSVG status={status} />
      </span>

      {/* Locked future milestones collapse to a bare node: just the lock orb
          plus a small number badge. No card, no reward thumbnail — keeps the
          trail readable and the reward a surprise until it's unlocked. */}
      {status === "locked" ? (
        <span className="trail-node__num" aria-hidden="true">{index + 1}</span>
      ) : (
        <>
          <span className="trail-node__burst" aria-hidden="true">
            {Array.from({ length: 6 }, (_, spark) => (
              <i key={spark} style={{ "--spark": spark }} />
            ))}
          </span>

          <span className={`trail-node__card trail-node__card--${cardSide}`}>
            <span className="trail-node__card-body">
              <span className="trail-node__title">Milestone {index + 1}</span>
              <strong>{milestone.title}</strong>
              <span className="trail-node__progress">{statusLabel}</span>
              {(status === "active" || status === "in_progress") && (
                <span className="trail-node__bar">
                  <i style={{ width: `${milestone.progress ?? 0}%` }} />
                </span>
              )}
            </span>

            <span
              className="trail-node__chest"
              role="button"
              tabIndex={0}
              aria-label={`View reward for ${milestone.title}`}
              title="View reward — add reward photos"
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onOpenMilestone && onOpenMilestone(milestone.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenMilestone && onOpenMilestone(milestone.id);
                }
              }}
            >
              <img src={chestSrc(status === "completed" ? "open" : "closed")} alt="" />
              <em>Reward</em>
            </span>
          </span>
        </>
      )}

      {showLockedTooltip && (
        <span className="trail-node__locked-tip" role="tooltip">
          Complete the previous milestone first.
        </span>
      )}
    </button>
  );
}

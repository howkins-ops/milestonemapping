import React, { useMemo } from "react";
import { getMilestoneProgress } from "../../lib/progress.js";

const BG_TRAIL = "/assets/milestone-world/bg-treasure-trail.png";

const NODE_X_SEQ = [50, 61, 42, 58, 44, 55, 39, 63];
const MAP_MIN_HEIGHT = 900;
const MAP_STEP = 126;
const TOP_PAD = 116;
const BOT_PAD = 144;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalizeStatus(milestone, index, nextIndex) {
  if (milestone.status === "completed") return "completed";
  if (milestone.status === "active" || index === nextIndex) return "active";
  return "locked";
}

function buildLayout(count, height) {
  if (!count) return [];
  const usable = height - TOP_PAD - BOT_PAD - 170;
  const startY = height - BOT_PAD - 70;
  const gap = count === 1 ? 0 : Math.min(MAP_STEP, usable / Math.max(1, count - 1));

  return Array.from({ length: count }, (_, index) => ({
    x: NODE_X_SEQ[index % NODE_X_SEQ.length],
    y: startY - index * gap,
    side: index % 2 === 0 ? "right" : "left"
  }));
}

function buildPath(layout, height) {
  const points = [
    { x: 50, y: height - 92 },
    ...layout,
    { x: 50, y: 96 }
  ];

  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const prev = points[index - 1];
    const mid = (prev.y + point.y) / 2;
    return `${path} C ${prev.x} ${mid}, ${point.x} ${mid}, ${point.x} ${point.y}`;
  }, "");
}

function getReward(milestone) {
  return milestone.rewardLarge || milestone.rewardMedium || milestone.rewardSmall || "XP + Chest";
}

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

function FinalDiamond({ complete, label }) {
  return (
    <div className={`trail-world__final ${complete ? "is-complete" : ""}`}>
      <span className="trail-world__final-kicker">FINAL GOAL</span>
      <div className="trail-world__diamond" aria-hidden="true">
        <svg viewBox="0 0 210 150">
          <defs>
            <linearGradient id="treasureDiamondGrad" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="50%" stopColor="#D11EFF" />
              <stop offset="100%" stopColor="#FF3EDB" />
            </linearGradient>
          </defs>
          <path d="M26 48 62 13h86l36 35-79 88L26 48Z" />
          <path d="M26 48h158M62 13l24 35 19-35 19 35 24-35M86 48l19 88 19-88" />
        </svg>
      </div>
      <strong>{complete ? "GOAL ACHIEVED" : label}</strong>
    </div>
  );
}

function JourneyPanel({ project, completedCount, total, currentProgress }) {
  return (
    <aside className="trail-world__panel trail-world__panel--left" aria-label="Journey status">
      <span className="trail-world__panel-title">JOURNEY STATUS</span>
      <div className="trail-world__level">
        <span>LEVEL</span>
        <strong>{Math.max(1, completedCount + 1)}</strong>
      </div>
      <div className="trail-world__stat">
        <span>Milestones</span>
        <strong>{completedCount}/{total}</strong>
      </div>
      <div className="trail-world__meter">
        <span style={{ width: `${currentProgress}%` }} />
      </div>
      <div className="trail-world__stat">
        <span>Momentum</span>
        <strong>{currentProgress >= 70 ? "High" : currentProgress >= 30 ? "Building" : "Starting"}</strong>
      </div>
      <p>Every step reveals more of your destiny.</p>
    </aside>
  );
}

function LegendPanel() {
  return (
    <aside className="trail-world__panel trail-world__panel--right" aria-label="Map legend">
      <span className="trail-world__panel-title">MAP LEGEND</span>
      <div className="trail-world__legend-row"><i className="is-completed" /> Completed</div>
      <div className="trail-world__legend-row"><i className="is-active" /> In Progress</div>
      <div className="trail-world__legend-row"><i className="is-locked" /> Locked</div>
      <div className="trail-world__legend-row"><i className="is-treasure" /> Treasure</div>
      <div className="trail-world__legend-row"><i className="is-phoenix" /> Phoenix Shrine</div>
    </aside>
  );
}

export default function TreasureMap({ project, milestones, onOpenMilestone, onAddMilestone }) {
  const doneCount = milestones.filter((m) => m.status === "completed").length;
  const allDone = milestones.length > 0 && doneCount === milestones.length;
  const nextIndex = milestones.findIndex((m) => m.status !== "completed");
  const currentIndex = nextIndex === -1 ? Math.max(0, milestones.length - 1) : nextIndex;
  const totalHeight = Math.max(MAP_MIN_HEIGHT, TOP_PAD + BOT_PAD + 270 + milestones.length * MAP_STEP);

  const layout = useMemo(() => buildLayout(milestones.length, totalHeight), [milestones.length, totalHeight]);
  const pathD = useMemo(() => buildPath(layout, totalHeight), [layout, totalHeight]);
  const averageProgress = milestones.length
    ? Math.round(milestones.reduce((sum, m) => sum + getMilestoneProgress(m), 0) / milestones.length)
    : 0;
  const fillPct = milestones.length ? clamp(Math.round((doneCount / milestones.length) * 100), 0, 100) : 0;
  const currentPoint = layout[currentIndex] || { x: 50, y: totalHeight - 130 };

  return (
    <section className="trail-world" style={{ "--trail-height": `${totalHeight}px` }}>
      <div className="trail-world__image" aria-hidden="true" style={{ backgroundImage: `url(${BG_TRAIL})` }} />
      <div className="trail-world__vignette" aria-hidden="true" />
      <div className="trail-world__stars" aria-hidden="true" />

      <div className="trail-world__header">
        <div>
          <span>PROJECT WORLD</span>
          <h2>{project.title}</h2>
        </div>
        <div className="trail-world__xp">
          <span>XP</span>
          <strong>{(doneCount * 1000 + averageProgress * 10).toLocaleString()}</strong>
        </div>
      </div>

      <JourneyPanel
        project={project}
        completedCount={doneCount}
        total={milestones.length}
        currentProgress={averageProgress}
      />
      <LegendPanel />

      <div className="trail-world__map" style={{ height: totalHeight }}>
        <FinalDiamond
          complete={allDone}
          label={project.futureVision || project.rewardLarge || "The Destination"}
        />

        <svg
          className="trail-world__path"
          viewBox={`0 0 100 ${totalHeight}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="treasureTrailBase" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#00F0FF" />
              <stop offset="45%" stopColor="#D11EFF" />
              <stop offset="100%" stopColor="#FF3EDB" />
            </linearGradient>
            <filter id="treasureTrailGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path className="trail-world__path-shadow" d={pathD} />
          <path className="trail-world__path-base" d={pathD} />
          <path
            className="trail-world__path-fill"
            d={pathD}
            pathLength="100"
            strokeDasharray={`${fillPct} ${100 - fillPct}`}
          />
          <path className="trail-world__path-spark" d={pathD} />
        </svg>

        {milestones.map((milestone, index) => {
          const point = layout[index];
          const status = normalizeStatus(milestone, index, nextIndex);
          const progress = getMilestoneProgress(milestone);
          const isPhoenix = index > 0 && (index + 1) % 3 === 0;

          return (
            <button
              key={milestone.id}
              type="button"
              className={`trail-node is-${status} ${isPhoenix ? "has-phoenix" : ""}`}
              style={{ left: `${point.x}%`, top: point.y }}
              onClick={() => status !== "locked" && onOpenMilestone(milestone.id)}
              aria-label={`${milestone.title}: ${status}, ${progress}% complete`}
            >
              <span className="trail-node__orb">
                <NodeIcon status={status} />
              </span>
              <span className={`trail-node__card trail-node__card--${point.side}`}>
                <span className="trail-node__title">Milestone {index + 1}</span>
                <strong>{milestone.title}</strong>
                <span className="trail-node__progress">{progress}% Complete</span>
                <span className="trail-node__bar"><i style={{ width: `${progress}%` }} /></span>
                <span className="trail-node__reward">
                  {status === "locked" ? "Locked" : getReward(milestone)}
                </span>
              </span>
              {status === "completed" && <span className="trail-node__chest" aria-hidden="true" />}
              {isPhoenix && <span className="trail-node__phoenix" aria-hidden="true" />}
            </button>
          );
        })}

        <div className="trail-world__avatar" style={{ left: `${currentPoint.x}%`, top: currentPoint.y + 88 }} aria-label="Current reality">
          <span />
          <strong>Current Reality</strong>
        </div>

        <button
          type="button"
          className="trail-world__add"
          onClick={onAddMilestone}
          aria-label="Add milestone"
        >
          <span>+</span>
          Add Milestone
        </button>
      </div>
    </section>
  );
}

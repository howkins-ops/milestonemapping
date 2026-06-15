import React, { useMemo, useState, useRef, useEffect } from "react";
import { getMilestoneProgress } from "../../lib/progress.js";
import { useSettings } from "../../hooks/useSettings.js";
import { milestoneWorldAssets as MWA, getMapBackground } from "../../lib/milestoneWorldAssets.js";

const NODE_X_SEQ = [50, 61, 42, 58, 44, 55, 39, 63];
const MAP_MIN_HEIGHT = 900;
const MAP_STEP = 126;
const TOP_PAD = 116;
const BOT_PAD = 144;
const POS_STORAGE_KEY = "treasure_map_positions_v1";

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
    side: index % 2 === 0 ? "right" : "left",
  }));
}

function buildPath(positions, height) {
  const points = [
    { x: 50, y: height - 92 },
    ...positions,
    { x: 50, y: 96 },
  ];
  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const prev = points[index - 1];
    const mid = (prev.y + point.y) / 2;
    return `${path} C ${prev.x} ${mid}, ${point.x} ${mid}, ${point.x} ${point.y}`;
  }, "");
}

const NODE_BASE = "/assets/milestone-nodes";

function getNodeAsset(status, isFinalGoal) {
  if (status === "locked") return `${NODE_BASE}/locked-node.png`;
  if (isFinalGoal) return `${NODE_BASE}/final-goal-node.png`;
  if (status === "completed") return `${NODE_BASE}/complete-node.png`;
  return `${NODE_BASE}/active-node.png`;
}

function posStorageId(projectId) {
  return `${POS_STORAGE_KEY}:${projectId}`;
}

function loadSavedPositions(projectId, milestones, defaults) {
  try {
    const saved = JSON.parse(localStorage.getItem(posStorageId(projectId)) || "{}");
    return defaults.map((pos, i) => {
      const id = milestones[i]?.id;
      return id && saved[id] ? { ...pos, x: saved[id].x, y: saved[id].y, side: saved[id].side } : pos;
    });
  } catch {
    return defaults;
  }
}

function persistPositions(projectId, milestones, positions) {
  try {
    const saved = JSON.parse(localStorage.getItem(posStorageId(projectId)) || "{}");
    milestones.forEach((m, i) => {
      if (positions[i]) saved[m.id] = { x: positions[i].x, y: positions[i].y, side: positions[i].side };
    });
    localStorage.setItem(posStorageId(projectId), JSON.stringify(saved));
  } catch {}
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
        <img className="trail-world__diamond-ring" src={complete ? MWA.portals.completed : MWA.portals.cyan} alt="" />
        <img className="trail-world__diamond-gem" src={MWA.icons.diamonds} alt="" />
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
  const { settings } = useSettings();
  const doneCount = milestones.filter((m) => m.status === "completed").length;
  const allDone = milestones.length > 0 && doneCount === milestones.length;
  const bgUrl = getMapBackground(doneCount, allDone, false);
  const nextIndex = milestones.findIndex((m) => m.status !== "completed");
  const currentIndex = nextIndex === -1 ? Math.max(0, milestones.length - 1) : nextIndex;
  const totalHeight = Math.max(MAP_MIN_HEIGHT, TOP_PAD + BOT_PAD + 270 + milestones.length * MAP_STEP);

  const milestoneIdsKey = milestones.map((m) => m.id).join(",");

  const [positions, setPositions] = useState(() => {
    const defaults = buildLayout(milestones.length, totalHeight);
    return loadSavedPositions(project.id, milestones, defaults);
  });

  useEffect(() => {
    const defaults = buildLayout(milestones.length, totalHeight);
    setPositions(loadSavedPositions(project.id, milestones, defaults));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestoneIdsKey, project.id, totalHeight]);

  const positionsRef = useRef(positions);
  useEffect(() => { positionsRef.current = positions; }, [positions]);

  const pathD = useMemo(() => buildPath(positions, totalHeight), [positions, totalHeight]);

  const averageProgress = milestones.length
    ? Math.round(milestones.reduce((sum, m) => sum + getMilestoneProgress(m), 0) / milestones.length)
    : 0;
  const fillPct = milestones.length ? clamp(Math.round((doneCount / milestones.length) * 100), 0, 100) : 0;
  const currentPoint = positions[currentIndex] || { x: 50, y: totalHeight - 130 };

  const mapRef = useRef(null);
  const dragRef = useRef(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [openingIndex, setOpeningIndex] = useState(null);
  const openTimerRef = useRef(null);

  useEffect(() => () => {
    if (openTimerRef.current) window.clearTimeout(openTimerRef.current);
  }, []);

  const handlePointerDown = (e, index) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    const rect = mapRef.current.getBoundingClientRect();
    dragRef.current = {
      index,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startX: positionsRef.current[index].x,
      startY: positionsRef.current[index].y,
      moved: false,
      rect,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggingIndex(index);
  };

  const handlePointerMove = (e, index) => {
    const drag = dragRef.current;
    if (!drag || drag.index !== index) return;
    const dx = e.clientX - drag.startClientX;
    const dy = e.clientY - drag.startClientY;
    if (!drag.moved && Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
    drag.moved = true;
    const newX = clamp(drag.startX + (dx / drag.rect.width) * 100, 5, 95);
    const newY = clamp(drag.startY + dy, TOP_PAD - 60, totalHeight - BOT_PAD + 20);
    const newSide = newX < 52 ? "right" : "left";
    setPositions((prev) => prev.map((p, i) => i === index ? { ...p, x: newX, y: newY, side: newSide } : p));
  };

  const handlePointerUp = (e, index, milestone, status) => {
    const drag = dragRef.current;
    dragRef.current = null;
    setDraggingIndex(null);
    if (!drag || drag.index !== index) return;
    if (!drag.moved) {
      if (status !== "locked") {
        if (settings.reducedMotion) {
          onOpenMilestone(milestone.id);
          return;
        }
        setOpeningIndex(index);
        if (openTimerRef.current) window.clearTimeout(openTimerRef.current);
        openTimerRef.current = window.setTimeout(() => {
          setOpeningIndex(null);
          onOpenMilestone(milestone.id);
        }, 360);
      }
    } else {
      persistPositions(project.id, milestones, positionsRef.current);
    }
  };

  return (
    <section
      className={`trail-world ${allDone ? "is-goal-complete" : ""}`}
      style={{ "--trail-height": `${totalHeight}px` }}
    >
      <div
        key={bgUrl}
        className="trail-world__image"
        aria-hidden="true"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />
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

      <div className="trail-world__map" ref={mapRef} style={{ height: totalHeight }}>
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
          const point = positions[index];
          if (!point) return null;
          const status = normalizeStatus(milestone, index, nextIndex);
          const isFinalGoal = index === milestones.length - 1;
          const isDraggingThis = draggingIndex === index;
          const isOpening = openingIndex === index;

          return (
            <button
              key={milestone.id}
              type="button"
              className={`trail-node is-${status} ${isDraggingThis ? "is-dragging" : ""} ${isOpening ? "is-opening" : ""}`}
              style={{ left: `${point.x}%`, top: point.y, touchAction: "none", "--node-delay": `${index * 70}ms` }}
              onPointerDown={(e) => handlePointerDown(e, index)}
              onPointerMove={(e) => handlePointerMove(e, index)}
              onPointerUp={(e) => handlePointerUp(e, index, milestone, status)}
              aria-label={`${milestone.title}: ${status}`}
            >
              <span className="trail-node__segment" aria-hidden="true">
                <img src={status === "locked" ? MWA.trails.locked : status === "completed" ? MWA.trails.completed : MWA.trails.active} alt="" />
              </span>
              <span className="trail-node__orb">
                <span className="trail-node__portal-halo" aria-hidden="true" />
                <img className="trail-node__sprite" src={getNodeAsset(status, isFinalGoal)} alt="" />
                <span className="trail-node__state-mark">
                  <NodeIcon status={status} />
                </span>
              </span>
              {status !== "locked" && (
                <span className="trail-node__burst" aria-hidden="true">
                  {Array.from({ length: 6 }, (_, spark) => <i key={spark} style={{ "--spark": spark }} />)}
                </span>
              )}
            </button>
          );
        })}

        <div
          key={`${currentIndex}-${doneCount}-${allDone ? "done" : "move"}`}
          className="trail-world__avatar"
          style={{ left: `${currentPoint.x}%`, top: currentPoint.y + 88 }}
          aria-label="Current reality"
        >
          <span>
            <img src={allDone ? MWA.avatars.victory : MWA.avatars.walkingTrail} alt="" />
          </span>
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

import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useSettings } from "../../hooks/useSettings.js";
import { useProjectProgress } from "../../hooks/useProjectProgress.js";
import { useCharacterMovement } from "../../hooks/useCharacterMovement.js";
import MapBackground from "./MapBackground.jsx";
import MapPath from "./MapPath.jsx";
import MapNode from "./MapNode.jsx";
import CharacterMarker from "./CharacterMarker.jsx";
import JourneyStatusPanel from "./JourneyStatusPanel.jsx";
import MapLegend from "./MapLegend.jsx";

const NODE_X_SEQ   = [50, 61, 42, 58, 44, 55, 39, 63];
const MAP_MIN_HEIGHT = 900;
const MAP_STEP     = 126;
const TOP_PAD      = 116;
const BOT_PAD      = 144;
const POS_STORAGE_KEY = "treasure_map_positions_v1";

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function normalizeStatus(milestone) {
  const s = milestone.status;
  return (s === "completed" || s === "locked" || s === "active" || s === "in_progress") ? s : "locked";
}

function buildLayout(count, height) {
  if (!count) return [];
  const usable = height - TOP_PAD - BOT_PAD - 170;
  const startY = height - BOT_PAD - 70;
  const gap = count === 1 ? 0 : Math.min(MAP_STEP, usable / Math.max(1, count - 1));
  return Array.from({ length: count }, (_, i) => ({
    x: NODE_X_SEQ[i % NODE_X_SEQ.length],
    y: startY - i * gap,
    side: i % 2 === 0 ? "right" : "left",
  }));
}

function buildPath(positions, height) {
  const points = [{ x: 50, y: height - 92 }, ...positions, { x: 50, y: 96 }];
  return points.reduce((path, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[i - 1];
    const mid = (prev.y + pt.y) / 2;
    return `${path} C ${prev.x} ${mid}, ${pt.x} ${mid}, ${pt.x} ${pt.y}`;
  }, "");
}

function posStorageId(projectId) { return `${POS_STORAGE_KEY}:${projectId}`; }

function loadSavedPositions(projectId, milestones, defaults) {
  try {
    const saved = JSON.parse(localStorage.getItem(posStorageId(projectId)) || "{}");
    return defaults.map((pos, i) => {
      const id = milestones[i]?.id;
      return id && saved[id] ? { ...pos, x: saved[id].x, y: saved[id].y, side: saved[id].side } : pos;
    });
  } catch { return defaults; }
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

function FinalDiamond({ complete, label }) {
  const color = complete ? "#FACC15" : "#D11EFF";
  const inner = complete ? "#FFD166" : "#FF3EDB";

  return (
    <div className={`trail-world__final ${complete ? "is-complete" : ""}`}>
      <span className="trail-world__final-kicker">FINAL GOAL</span>
      <div className="trail-world__diamond" aria-hidden="true">
        <svg viewBox="0 0 100 100" className="trail-world__diamond-svg">
          {complete && Array.from({ length: 8 }, (_, i) => {
            const angle = (i * 45 - 22.5) * Math.PI / 180;
            return (
              <line
                key={i}
                x1={50 + Math.cos(angle) * 46}
                y1={50 + Math.sin(angle) * 46}
                x2={50 + Math.cos(angle) * 56}
                y2={50 + Math.sin(angle) * 56}
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.85"
              />
            );
          })}
          <polygon
            points="50,6 94,50 50,94 6,50"
            fill={`${color}1a`}
            stroke={color}
            strokeWidth="2"
            style={{ filter: `drop-shadow(0 0 14px ${color})` }}
          />
          <polygon
            points="50,22 78,50 50,78 22,50"
            fill={`${inner}2a`}
            stroke={inner}
            strokeWidth="1.5"
            opacity="0.7"
          />
          <circle cx="50" cy="50" r="10" fill={color} fillOpacity="0.55" />
          <circle cx="50" cy="50" r="4" fill={color} />
        </svg>
      </div>
      <strong>{complete ? "GOAL ACHIEVED" : label}</strong>
    </div>
  );
}

export default function ProjectMap({ project, milestones, onOpenMilestone, onAddMilestone, justUnlocked }) {
  const { settings } = useSettings();
  const { doneCount, allDone, averageProgress, fillPct, xp } = useProjectProgress(milestones);
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

  const { currentIndex, newlyUnlockedIndex } = useCharacterMovement(milestones, justUnlocked);
  const currentPoint = positions[currentIndex] || { x: 50, y: totalHeight - 130 };

  const mapRef = useRef(null);
  const dragRef = useRef(null);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [openingIndex, setOpeningIndex] = useState(null);
  const [shakingId, setShakingId] = useState(null);
  const [lockedTooltipId, setLockedTooltipId] = useState(null);
  const openTimerRef = useRef(null);
  const shakeTimerRef = useRef(null);

  useEffect(() => () => {
    if (openTimerRef.current) window.clearTimeout(openTimerRef.current);
    if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
  }, []);

  const handlePointerDown = useCallback((e, index) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
    const rect = mapRef.current.getBoundingClientRect();
    dragRef.current = {
      index,
      startClientX: e.clientX, startClientY: e.clientY,
      startX: positionsRef.current[index].x, startY: positionsRef.current[index].y,
      moved: false, rect,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggingIndex(index);
  }, []);

  const handlePointerMove = useCallback((e, index) => {
    const drag = dragRef.current;
    if (!drag || drag.index !== index) return;
    const dx = e.clientX - drag.startClientX;
    const dy = e.clientY - drag.startClientY;
    if (!drag.moved && Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
    drag.moved = true;
    const newX = clamp(drag.startX + (dx / drag.rect.width) * 100, 5, 95);
    const newY = clamp(drag.startY + dy, TOP_PAD - 60, totalHeight - BOT_PAD + 20);
    setPositions((prev) => prev.map((p, i) => i === index ? { ...p, x: newX, y: newY, side: newX < 52 ? "right" : "left" } : p));
  }, [totalHeight]);

  const handlePointerUp = useCallback((e, index, milestone, status) => {
    const drag = dragRef.current;
    dragRef.current = null;
    setDraggingIndex(null);
    if (!drag || drag.index !== index) return;
    if (!drag.moved) {
      if (status === "locked") {
        setShakingId(milestone.id);
        setLockedTooltipId(milestone.id);
        if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
        shakeTimerRef.current = window.setTimeout(() => {
          setShakingId(null);
          setLockedTooltipId(null);
        }, 1500);
      } else {
        if (settings.reducedMotion) { onOpenMilestone(milestone.id); return; }
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
  }, [settings.reducedMotion, onOpenMilestone, project.id, milestones]);

  return (
    <section
      className={`trail-world ${allDone ? "is-goal-complete" : ""}`}
      style={{ "--trail-height": `${totalHeight}px` }}
    >
      <MapBackground />

      <div className="trail-world__header">
        <div>
          <span>PROJECT WORLD</span>
          <h2>{project.title}</h2>
        </div>
        <div className="trail-world__xp">
          <span>XP</span>
          <strong>{xp.toLocaleString()}</strong>
        </div>
      </div>

      <JourneyStatusPanel
        completedCount={doneCount}
        total={milestones.length}
        currentProgress={averageProgress}
      />
      <MapLegend />

      <div className="trail-world__map" ref={mapRef} style={{ height: totalHeight }}>
        <FinalDiamond
          complete={allDone}
          label={project.futureVision || project.rewardLarge || "The Destination"}
        />

        <MapPath pathD={pathD} totalHeight={totalHeight} fillPct={fillPct} positions={positions} />

        {milestones.map((milestone, index) => {
          const point = positions[index];
          if (!point) return null;
          const status = normalizeStatus(milestone);
          return (
            <MapNode
              key={milestone.id}
              milestone={milestone}
              point={point}
              status={status}
              index={index}
              isOpening={openingIndex === index}
              isNewlyUnlocked={newlyUnlockedIndex === index}
              isShaking={shakingId === milestone.id}
              showLockedTooltip={lockedTooltipId === milestone.id}
              isDragging={draggingIndex === index}
              onPointerDown={(e) => handlePointerDown(e, index)}
              onPointerMove={(e) => handlePointerMove(e, index)}
              onPointerUp={(e) => handlePointerUp(e, index, milestone, status)}
            />
          );
        })}

        <CharacterMarker
          key={`${currentIndex}-${doneCount}-${allDone ? "done" : "move"}`}
          point={currentPoint}
          allDone={allDone}
        />

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

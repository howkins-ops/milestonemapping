import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useSettings } from "../../hooks/useSettings.js";
import { useAppData } from "../../hooks/useAppData.js";
import { useProjectProgress } from "../../hooks/useProjectProgress.js";
import { useCharacterMovement } from "../../hooks/useCharacterMovement.js";
import { resolveImageSrc } from "../../lib/imageUploadService.js";
import MapBackground from "./MapBackground.jsx";
import MapPath from "./MapPath.jsx";
import MapNode from "./MapNode.jsx";
import CharacterMarker from "./CharacterMarker.jsx";
import JourneyStatusPanel from "./JourneyStatusPanel.jsx";
import MilestoneManager from "./MilestoneManager.jsx";

const NODE_X_SEQ   = [50, 61, 42, 58, 44, 55, 39, 63];
const MAP_MIN_HEIGHT = 560;
const MAP_STEP     = 126;
const TOP_PAD      = 116;
const BOT_PAD      = 150;
const POS_STORAGE_KEY = "treasure_map_positions_v2";

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function normalizeStatus(milestone) {
  const s = milestone.status;
  return (s === "completed" || s === "locked" || s === "active" || s === "in_progress") ? s : "locked";
}

// Milestone 1 (index 0) is the START — it sits at the bottom and the trail
// climbs from it to the final milestone at the top. No stub points beyond the
// milestones at either end: the path begins and ends ON a milestone.
function buildLayout(count, height) {
  if (!count) return [];
  const bottomY = height - BOT_PAD;          // first node (the start)
  const topY = TOP_PAD;                       // last node (the destination)
  const gap = count === 1 ? 0 : (bottomY - topY) / (count - 1);
  return Array.from({ length: count }, (_, i) => ({
    x: NODE_X_SEQ[i % NODE_X_SEQ.length],
    y: bottomY - i * gap,
    side: i % 2 === 0 ? "right" : "left",
  }));
}

function buildPath(positions) {
  if (!positions.length) return "";
  return positions.reduce((path, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = positions[i - 1];
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

export default function ProjectMap({ project, milestones, onOpenMilestone, onAddMilestone, justUnlocked }) {
  const { settings } = useSettings();
  const { userId, updateProject } = useAppData();
  const { doneCount, allDone, averageProgress, fillPct, xp } = useProjectProgress(milestones);
  const totalHeight = Math.max(MAP_MIN_HEIGHT, TOP_PAD + BOT_PAD + Math.max(0, milestones.length - 1) * MAP_STEP);

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

  const pathD = useMemo(() => buildPath(positions), [positions]);

  const { currentIndex, newlyUnlockedIndex } = useCharacterMovement(milestones, justUnlocked);
  const currentPoint = positions[currentIndex] || { x: 50, y: totalHeight - 130 };

  const [managerOpen, setManagerOpen] = useState(false);

  // Custom world background image (mirrors the project card background tools)
  const bgFileRef = useRef(null);
  const [bgUploading, setBgUploading] = useState(false);
  const [bgToolsOpen, setBgToolsOpen] = useState(false);

  const handleWorldBgFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBgUploading(true);
    try {
      const url = await resolveImageSrc(file, userId);
      updateProject(project.id, { worldImageUrl: url });
    } catch (err) {
      console.error("World background upload failed:", err);
    } finally {
      setBgUploading(false);
      if (bgFileRef.current) bgFileRef.current.value = "";
    }
  };

  const clearWorldBg = () => updateProject(project.id, { worldImageUrl: "" });
  const openWorldPicker = () => bgFileRef.current?.click();

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
      <MapBackground imageUrl={project.worldImageUrl} />

      <input
        ref={bgFileRef}
        type="file"
        accept="image/*"
        onChange={handleWorldBgFile}
        style={{ display: "none" }}
      />
      <div className={`trail-world__bg-tools ${bgToolsOpen ? "is-open" : ""}`}>
        <button
          type="button"
          className="trail-world__bg-toggle"
          onClick={() => setBgToolsOpen((o) => !o)}
          aria-label={bgToolsOpen ? "Hide background tools" : "Edit world background"}
          aria-expanded={bgToolsOpen}
        >
          {bgToolsOpen ? "⌄" : "⚙"}
        </button>
        {bgToolsOpen && (
          <>
            <button
              type="button"
              className="trail-world__bg-btn"
              onClick={openWorldPicker}
              disabled={bgUploading}
              aria-label={project.worldImageUrl ? "Replace world background" : "Upload world background"}
            >
              {bgUploading ? "Uploading…" : project.worldImageUrl ? "↻ Replace" : "⤓ Background"}
            </button>
            {project.worldImageUrl && (
              <button
                type="button"
                className="trail-world__bg-btn"
                onClick={clearWorldBg}
                aria-label="Remove custom world background"
              >
                ✕ Remove
              </button>
            )}
          </>
        )}
      </div>

      <div className="trail-world__header">
        <div>
          <span>PROJECT WORLD</span>
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
      {managerOpen && (
        <MilestoneManager
          project={project}
          onOpenMilestone={onOpenMilestone}
          onClose={() => setManagerOpen(false)}
        />
      )}

      <div className="trail-world__map" ref={mapRef} style={{ height: totalHeight }}>
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
              isFirst={index === 0}
              isOpening={openingIndex === index}
              isNewlyUnlocked={newlyUnlockedIndex === index}
              isShaking={shakingId === milestone.id}
              showLockedTooltip={lockedTooltipId === milestone.id}
              isDragging={draggingIndex === index}
              onPointerDown={(e) => handlePointerDown(e, index)}
              onPointerMove={(e) => handlePointerMove(e, index)}
              onPointerUp={(e) => handlePointerUp(e, index, milestone, status)}
              onOpenMilestone={onOpenMilestone}
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
          onClick={() => setManagerOpen((v) => !v)}
          aria-expanded={managerOpen}
          aria-label="Edit or add milestones"
        >
          <span>+</span>
          Edit / Add Milestones
        </button>
      </div>
    </section>
  );
}

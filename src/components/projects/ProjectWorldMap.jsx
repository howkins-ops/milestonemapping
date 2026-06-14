import React, { useMemo, useState } from "react";
import { getProjectColorHex } from "../../lib/constants.js";
import { getProjectProgress, getProjectMilestones } from "../../lib/progress.js";
import { useSettings } from "../../hooks/useSettings.js";

// Scattered island anchor slots (percent coordinates on the ocean plane).
const SLOTS = [
  { x: 20, y: 30 },
  { x: 56, y: 22 },
  { x: 82, y: 42 },
  { x: 30, y: 66 },
  { x: 64, y: 74 },
  { x: 12, y: 76 },
  { x: 44, y: 46 },
  { x: 86, y: 80 },
  { x: 74, y: 14 },
  { x: 38, y: 14 }
];

function hashJitter(id, range = 6) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 9973;
  return ((h % (range * 2)) - range) / 2;
}

export default function ProjectWorldMap({ projects, milestones, onOpenProject }) {
  const { settings } = useSettings();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const islands = useMemo(
    () =>
      projects.map((p, i) => {
        const slot = SLOTS[i % SLOTS.length];
        const layer = Math.floor(i / SLOTS.length); // overflow rows nudge down
        return {
          project: p,
          x: Math.max(8, Math.min(92, slot.x + hashJitter(p.id))),
          y: Math.max(10, Math.min(88, slot.y + hashJitter(p.id + "y") + layer * 6)),
          progress: getProjectProgress(p, milestones),
          count: getProjectMilestones(milestones, p.id).length
        };
      }),
    [projects, milestones]
  );

  const handleMove = (e) => {
    if (settings.reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width - 0.5;
    const my = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: my * -4, y: mx * 6 });
  };

  const baseTiltX = settings.reducedMotion ? 0 : 10;

  return (
    <div
      className="wmap-stage"
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div
        className="wmap-plane"
        style={{ transform: `rotateX(${baseTiltX + tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        <span className="wmap-compass" aria-hidden="true">🧭</span>

        {/* shipping routes between islands */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {islands.slice(0, -1).map((a, i) => {
            const b = islands[i + 1];
            return (
              <path
                key={a.project.id}
                d={`M ${a.x} ${a.y} Q ${(a.x + b.x) / 2 + 6} ${(a.y + b.y) / 2 - 8}, ${b.x} ${b.y}`}
                fill="none"
                stroke="rgba(0,240,255,0.16)"
                strokeWidth="0.35"
                strokeDasharray="0.8 1.6"
                style={
                  settings.reducedMotion ? undefined : { animation: "line-flow 2.4s linear infinite" }
                }
              />
            );
          })}
        </svg>

        {islands.map(({ project, x, y, progress, count }) => {
          const hex = getProjectColorHex(project.color);
          const completed = project.status === "completed";
          const glow = completed ? "#FACC15" : hex;
          return (
            <button
              key={project.id}
              type="button"
              className="wmap-island"
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => onOpenProject(project.id)}
              aria-label={`${project.title} — ${progress}% complete, ${count} milestones`}
            >
              <span
                className="wmap-island__land"
                style={{
                  borderColor: `${glow}99`,
                  background: `radial-gradient(circle at 35% 30%, ${glow}2e, ${glow}10 55%, rgba(2,3,4,0.9) 78%)`,
                  boxShadow: `0 0 28px ${glow}40, inset 0 0 24px ${glow}1a`,
                  animation: completed ? "glow-pulse-gold 2.4s ease-in-out infinite" : undefined
                }}
              >
                {completed ? "🏆" : project.icon}
                <span className="wmap-island__pct" style={{ color: glow, borderColor: `${glow}55` }}>
                  {progress}%
                </span>
              </span>
              <span className="wmap-island__name">{project.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

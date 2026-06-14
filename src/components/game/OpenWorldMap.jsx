import React, { useRef, useMemo, useState } from "react";
import { useAppData } from "../../hooks/useAppData.js";
import { useGamification } from "../../hooks/useGamification.js";
import { getProjectProgress, getProjectMilestones } from "../../lib/progress.js";
import { TRAINERS } from "../../lib/constants.js";
import BiomeNode from "./BiomeNode.jsx";
import WorldCharacter from "./WorldCharacter.jsx";

/* ─── Deterministic position grid ──────────────────────────────── */
// Positions projects in a ring around the center character.
// We keep positions stable so the map doesn't jump on re-render.
function getBiomePositions(count) {
  if (count === 0) return [];
  const positions = [];
  const rings = [
    { r: 155, maxSlots: 6 },   // inner ring
    { r: 270, maxSlots: 10 },  // outer ring
  ];
  let placed = 0;
  for (const ring of rings) {
    const slots = Math.min(count - placed, ring.maxSlots);
    const angleStep = (Math.PI * 2) / ring.maxSlots;
    // Offset starting angle per ring so they don't stack
    const startAngle = ring.r === 155 ? -Math.PI / 2 : -Math.PI / 3;
    for (let i = 0; i < slots; i++) {
      const angle = startAngle + i * angleStep;
      // Tiny jitter based on slot index so same slot positions are stable
      const jitter = (i * 7919) % 18 - 9;
      positions.push({
        x: Math.cos(angle) * ring.r + jitter,
        y: Math.sin(angle) * ring.r + jitter * 0.5,
      });
      placed++;
      if (placed >= count) break;
    }
    if (placed >= count) break;
  }
  return positions;
}

/* ─── Floating vision board polaroids ──────────────────────────── */
function VisionPolaroid({ item, index }) {
  const float = useMemo(() => {
    const base = (index * 137.5) % 360;
    return {
      dur: 5 + (index * 3.7) % 4,
      delay: (index * 1.3) % 4,
      rotate: -15 + (index * 23) % 30,
    };
  }, [index]);

  if (!item.imageUrl) return null;
  return (
    <div style={{
      background: "#f5f0e8",
      padding: "4px 4px 10px",
      borderRadius: 2,
      boxShadow: "0 4px 16px rgba(0,0,0,0.6), 0 0 8px rgba(0,240,255,0.2)",
      transform: `rotate(${float.rotate}deg)`,
      animation: `vision-float-${index % 3} ${float.dur}s ${float.delay}s ease-in-out infinite`,
      cursor: "default",
      width: 52,
      flexShrink: 0,
    }}>
      <img
        src={item.imageUrl}
        alt={item.title}
        style={{
          width: 44,
          height: 44,
          objectFit: "cover",
          display: "block",
          borderRadius: 1,
        }}
        onError={e => { e.target.style.display = "none"; }}
      />
      {item.title && (
        <div style={{
          fontSize: 6,
          color: "#333",
          textAlign: "center",
          marginTop: 2,
          fontFamily: "var(--font-mono, monospace)",
          letterSpacing: "0.04em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {item.title}
        </div>
      )}
    </div>
  );
}

/* ─── Achievement monument strip ────────────────────────────────── */
function AchievementMonuments({ achievements }) {
  const unlocked = (achievements || []).filter(a => a.unlockedAt);
  const total = (achievements || []).length;
  const icons = ["🏆", "⚡", "🔥", "💎", "🗺️", "🧠", "👑", "🎯", "🌟"];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6,
      padding: "12px 10px",
      background: "rgba(0,0,0,0.5)",
      border: "1px solid rgba(250,204,21,0.2)",
      borderRadius: 10,
      backdropFilter: "blur(6px)",
    }}>
      <div style={{
        fontSize: 8,
        fontFamily: "var(--font-mono, monospace)",
        letterSpacing: "0.1em",
        color: "rgba(250,204,21,0.6)",
        textTransform: "uppercase",
      }}>
        ⚑ {unlocked.length}/{total} Monuments
      </div>
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        justifyContent: "center",
        maxWidth: 120,
      }}>
        {(achievements || []).map((ach, i) => (
          <div
            key={ach.id || i}
            title={ach.title}
            style={{
              fontSize: 14,
              filter: ach.unlockedAt
                ? "drop-shadow(0 0 5px rgba(250,204,21,0.8))"
                : "grayscale(1) brightness(0.25)",
              opacity: ach.unlockedAt ? 1 : 0.4,
              transition: "filter 0.3s",
            }}
          >
            {ach.icon || icons[i % icons.length]}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── World state indicator ─────────────────────────────────────── */
function WorldStateBar({ todayComplete, activeProjects, totalXP }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontSize: 9,
      fontFamily: "var(--font-mono, monospace)",
      letterSpacing: "0.08em",
      color: "rgba(234,251,255,0.55)",
      textTransform: "uppercase",
    }}>
      <span style={{ color: todayComplete ? "#00FFBF" : "rgba(234,251,255,0.3)" }}>
        {todayComplete ? "🌅 WORLD LIT" : "🌫 FOG ACTIVE"}
      </span>
      <span>·</span>
      <span>{activeProjects} EMPIRE{activeProjects !== 1 ? "S" : ""}</span>
      <span>·</span>
      <span style={{ color: "#FACC15" }}>⚡ {(totalXP || 0).toLocaleString()} XP</span>
    </div>
  );
}

/* ─── Empty state ───────────────────────────────────────────────── */
function EmptyWorldState({ onNavigate }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      padding: "40px 24px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 48, filter: "drop-shadow(0 0 12px rgba(0,240,255,0.5))" }}>🌍</div>
      <div>
        <div style={{
          fontSize: 14,
          fontFamily: "var(--font-mono, monospace)",
          letterSpacing: "0.1em",
          color: "rgba(234,251,255,0.8)",
          textTransform: "uppercase",
          marginBottom: 6,
        }}>
          No Empires Yet
        </div>
        <div style={{
          fontSize: 11,
          color: "rgba(234,251,255,0.4)",
          fontFamily: "var(--font-body, sans-serif)",
          lineHeight: 1.6,
        }}>
          Create your first project to start building your world.
          Each project becomes a territory you can see growing here.
        </div>
      </div>
      {onNavigate && (
        <button
          onClick={() => onNavigate("milestones")}
          style={{
            background: "rgba(0,240,255,0.12)",
            border: "1px solid rgba(0,240,255,0.4)",
            borderRadius: 8,
            padding: "8px 20px",
            color: "#00F0FF",
            fontSize: 11,
            fontFamily: "var(--font-mono, monospace)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Build First Empire →
        </button>
      )}
    </div>
  );
}

/* ─── CSS keyframes injected once ──────────────────────────────── */
const CSS_KEYFRAMES = `
@keyframes wc-float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
}
@keyframes wc-icon-float {
  0%, 100% { transform: translateY(0px) scale(1); }
  50%       { transform: translateY(-4px) scale(1.1); }
}
@keyframes wc-aura-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%       { opacity: 1; transform: scale(1.08); }
}
@keyframes biome-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}
@keyframes biome-complete-float {
  0%, 100% { transform: translateY(0px) scale(1); }
  50%       { transform: translateY(-6px) scale(1.04); }
}
@keyframes biome-float-0 {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-5px); }
}
@keyframes biome-float-1 {
  0%, 100% { transform: translateY(-2px); }
  50%       { transform: translateY(3px); }
}
@keyframes biome-float-2 {
  0%, 100% { transform: translateY(1px); }
  50%       { transform: translateY(-4px); }
}
@keyframes biome-crown-spin {
  0%   { transform: translateX(-50%) rotate(-5deg) scale(1); }
  50%  { transform: translateX(-50%) rotate(5deg) scale(1.1); }
  100% { transform: translateX(-50%) rotate(-5deg) scale(1); }
}
@keyframes vision-float-0 {
  0%, 100% { transform: translateY(0px) rotate(var(--r,0deg)); }
  50%       { transform: translateY(-6px) rotate(var(--r,0deg)); }
}
@keyframes vision-float-1 {
  0%, 100% { transform: translateY(-3px) rotate(var(--r,0deg)); }
  50%       { transform: translateY(4px) rotate(var(--r,0deg)); }
}
@keyframes vision-float-2 {
  0%, 100% { transform: translateY(2px) rotate(var(--r,0deg)); }
  50%       { transform: translateY(-5px) rotate(var(--r,0deg)); }
}
@keyframes ow-ground-pulse {
  0%, 100% { opacity: 0.5; transform: scaleX(1); }
  50%       { opacity: 0.8; transform: scaleX(1.05); }
}
`;

/* ─── SVG connector lines from center to each biome ────────────── */
function ConnectorLines({ positions, centerX, centerY, projects, milestones }) {
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      aria-hidden="true"
    >
      {positions.map((pos, i) => {
        const proj = projects[i];
        if (!proj) return null;
        const pct = getProjectProgress(proj, milestones.filter(m => m.projectId === proj.id));
        const opacity = 0.1 + pct / 100 * 0.3;
        return (
          <line
            key={proj.id}
            x1={centerX}
            y1={centerY}
            x2={centerX + pos.x}
            y2={centerY + pos.y}
            stroke="rgba(0,240,255,0.25)"
            strokeWidth="0.5"
            strokeDasharray="4 6"
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
}

/* ─── Main OpenWorldMap ─────────────────────────────────────────── */
export default function OpenWorldMap({ onNavigate, onOpenProject }) {
  const { projects, milestones, visionBoard, achievements, settings, identity, dailyLogs } = useAppData();
  const { xp, rank } = useGamification();
  const containerRef = useRef(null);

  const activeProjects = useMemo(
    () => (projects || []).filter(p => p.status !== "completed" || true), // show all
    [projects]
  );

  const positions = useMemo(() => getBiomePositions(activeProjects.length), [activeProjects.length]);

  // Check if today's Top Five is complete
  const todayComplete = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const log = (dailyLogs || []).find ? (dailyLogs || {})[today] : null;
    if (!log) return false;
    return (log.topFive || []).length >= 5 && (log.topFive || []).every(t => t.done);
  }, [dailyLogs]);

  const visionItems = useMemo(
    () => (visionBoard || []).filter(v => v.imageUrl).slice(0, 8),
    [visionBoard]
  );

  const trainerId = settings?.activeTrainer || "blaze";
  const initials = (identity?.futureIdentity || "?").slice(0, 2).toUpperCase();
  const rankName = rank?.name || "RECRUIT";

  // World atmosphere: bright if today complete, foggy if not
  const worldBrightness = todayComplete ? 1 : 0.75;
  const fogIntensity = todayComplete ? 0 : 0.4;

  return (
    <>
      <style>{CSS_KEYFRAMES}</style>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          minHeight: "calc(100vh - 56px)",
          background: "radial-gradient(ellipse at 50% 30%, #0a0820 0%, #050510 60%, #000008 100%)",
          overflow: "hidden",
          filter: `brightness(${worldBrightness})`,
          transition: "filter 1s ease",
        }}
      >
        {/* Star field */}
        <StarField count={80} />

        {/* World fog overlay */}
        {fogIntensity > 0 && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 50% 100%, rgba(8,8,30,${fogIntensity}) 0%, transparent 60%)`,
            pointerEvents: "none",
            zIndex: 1,
          }} />
        )}

        {/* Header */}
        <div style={{
          position: "relative",
          zIndex: 10,
          padding: "14px 16px 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}>
          <div>
            <div style={{
              fontSize: 13,
              fontFamily: "var(--font-mono, monospace)",
              letterSpacing: "0.2em",
              color: "rgba(234,251,255,0.9)",
              textTransform: "uppercase",
              textShadow: "0 0 10px rgba(0,240,255,0.5)",
            }}>
              YOUR EMPIRE
            </div>
            <WorldStateBar
              todayComplete={todayComplete}
              activeProjects={activeProjects.length}
              totalXP={xp}
            />
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate("milestones")}
              style={{
                background: "rgba(0,240,255,0.08)",
                border: "1px solid rgba(0,240,255,0.25)",
                borderRadius: 6,
                padding: "4px 10px",
                color: "rgba(0,240,255,0.7)",
                fontSize: 9,
                fontFamily: "var(--font-mono, monospace)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              + Project
            </button>
          )}
        </div>

        {/* Vision board row */}
        {visionItems.length > 0 && (
          <div style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            gap: 8,
            padding: "10px 16px",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}>
            <div style={{
              fontSize: 7,
              fontFamily: "var(--font-mono, monospace)",
              color: "rgba(234,251,255,0.25)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              alignSelf: "center",
              flexShrink: 0,
            }}>
              VISION
            </div>
            {visionItems.map((item, i) => (
              <VisionPolaroid key={item.id || i} item={item} index={i} />
            ))}
          </div>
        )}

        {/* Main world stage */}
        <div style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 420,
          marginTop: 8,
        }}>
          {activeProjects.length === 0 ? (
            <EmptyWorldState onNavigate={onNavigate} />
          ) : (
            <WorldStage
              projects={activeProjects}
              milestones={milestones}
              positions={positions}
              onOpenProject={onOpenProject}
              trainerId={trainerId}
              rankName={rankName}
              initials={initials}
            />
          )}
        </div>

        {/* Achievements panel */}
        {(achievements || []).length > 0 && (
          <div style={{
            position: "relative",
            zIndex: 5,
            padding: "0 16px 16px",
            display: "flex",
            justifyContent: "center",
          }}>
            <AchievementMonuments achievements={achievements} />
          </div>
        )}

        {/* Ground glow at very bottom */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          height: 2,
          background: "linear-gradient(to right, transparent, rgba(0,240,255,0.3), rgba(209,30,255,0.3), transparent)",
          filter: "blur(4px)",
          animation: "ow-ground-pulse 4s ease-in-out infinite",
        }} />
      </div>
    </>
  );
}

/* ─── World Stage — the actual pan-able scene ───────────────────── */
function WorldStage({ projects, milestones, positions, onOpenProject, trainerId, rankName, initials }) {
  // The stage is centered; biomes are absolutely placed around center.
  // We use a 600×600 virtual canvas centered at (300, 300).
  const CX = 300;
  const CY = 300;
  const CANVAS = 600;

  return (
    <div style={{
      position: "relative",
      width: "100%",
      maxWidth: 640,
      overflowX: "auto",
      overflowY: "hidden",
      scrollbarWidth: "none",
    }}>
      <div style={{
        position: "relative",
        width: CANVAS,
        height: CANVAS,
        margin: "0 auto",
      }}>
        {/* SVG connector lines */}
        <ConnectorLines
          positions={positions}
          centerX={CX}
          centerY={CY}
          projects={projects}
          milestones={milestones}
        />

        {/* Ground ring under character */}
        <div style={{
          position: "absolute",
          left: CX,
          top: CY + 50,
          transform: "translate(-50%, -50%)",
          width: 80,
          height: 20,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,240,255,0.2) 0%, transparent 70%)",
          animation: "ow-ground-pulse 3s ease-in-out infinite",
        }} />

        {/* Character at center */}
        <div style={{
          position: "absolute",
          left: CX,
          top: CY - 20,
          transform: "translate(-50%, -50%)",
          zIndex: 10,
        }}>
          <WorldCharacter
            trainerId={trainerId}
            rankName={rankName}
            initials={initials}
            size={64}
          />
        </div>

        {/* Biome nodes */}
        {projects.map((proj, i) => {
          const pos = positions[i];
          if (!pos) return null;
          const projMilestones = milestones.filter(m => m.projectId === proj.id);
          const pct = getProjectProgress(proj, projMilestones);
          return (
            <div
              key={proj.id}
              style={{
                position: "absolute",
                left: CX + pos.x,
                top: CY + pos.y,
                transform: "translate(-50%, -50%)",
                zIndex: 5,
              }}
            >
              <BiomeNode
                project={proj}
                progress={pct}
                milestones={projMilestones}
                onClick={() => onOpenProject && onOpenProject(proj.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Tiny star field ───────────────────────────────────────────── */
function StarField({ count = 60 }) {
  const stars = useRef(null);
  if (!stars.current) {
    stars.current = Array.from({ length: count }, (_, i) => ({
      x: (i * 137.508) % 100,
      y: (i * 97.3) % 100,
      s: 0.8 + (i % 3) * 0.6,
      dur: 2 + (i % 5),
      lo: 0.1 + (i % 3) * 0.1,
      hi: 0.4 + (i % 4) * 0.15,
    }));
  }
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} aria-hidden="true">
      {stars.current.map((st, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: st.s,
            height: st.s,
            borderRadius: "50%",
            background: "white",
            opacity: st.lo,
            animation: `wc-aura-pulse ${st.dur}s ${(i % 4) * 0.5}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}

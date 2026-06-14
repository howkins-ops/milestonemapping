"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";

/**
 * ProjectTrailMap — fully interactive milestone trail.
 *
 * Props:
 *   project         — { title, finalGoal, xp, level, streak, milestones[] }
 *   onOpenMilestone — (id) => void   — navigate into a milestone
 *   onAddMilestone  — ()  => void    — open the add-milestone wizard
 */

const demoProject = {
  title: "Build My Online Business",
  finalGoal: "Build a 6-Figure Business",
  xp: 12450,
  level: 27,
  streak: 12,
  milestones: [
    { id: "m1", title: "Define Your Niche",    description: "Clarify your audience, offer, and transformation.", status: "completed",   progress: 100, reward: "500 XP",     icon: "flag"    },
    { id: "m2", title: "50 Sales",             description: "Complete your first 50 sales.",                    status: "completed",   progress: 100, reward: "New Shoes",  icon: "target"  },
    { id: "m3", title: "100 Sales",            description: "Reach 100 total sales.",                          status: "completed",   progress: 100, reward: "1,000 XP",  icon: "bullseye"},
    { id: "m4", title: "200 Sales",            description: "Reach 200 total sales.",                          status: "in_progress", progress: 75,  reward: "1,500 XP",  icon: "chart"   },
    { id: "m5", title: "$50K Revenue",         description: "Generate $50,000 in revenue.",                    status: "locked",      progress: 0,   reward: "2,500 XP",  icon: "team"    },
    { id: "m6", title: "$100K Revenue",        description: "Generate $100,000 in revenue.",                   status: "locked",      progress: 0,   reward: "Major Reward", icon: "diamond"},
  ],
};

const iconMap = {
  flag: "⚑", target: "🎯", bullseye: "◎", chart: "↗", team: "👥",
  diamond: "◇", book: "✍", fitness: "⚡", money: "$", faith: "✦", default: "✧",
};

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

/* ── layout ──────────────────────────────────────────────────────── */
function getMilestoneLayout(count) {
  const safe = Math.max(count, 1);
  return Array.from({ length: safe }).map((_, i) => {
    const t    = safe === 1 ? 0.5 : i / (safe - 1);
    const y    = 84 - t * 66;
    const wave = Math.sin(t * Math.PI * 2.35) * 13;
    return { x: 50 + wave, y, side: i % 2 === 0 ? "right" : "left" };
  });
}

function buildPath(layout) {
  if (!layout.length) return "";
  const pts = [{ x: 50, y: 93 }, ...layout, { x: 50, y: 10 }];
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], c = pts[i], m = (p.y + c.y) / 2;
    d += ` C ${p.x} ${m}, ${c.x} ${m}, ${c.x} ${c.y}`;
  }
  return d;
}

/* ── Progress ring ───────────────────────────────────────────────── */
function ProgressRing({ progress = 0, status }) {
  const r  = 40, circ = 2 * Math.PI * r;
  const off = circ - (clamp(progress, 0, 100) / 100) * circ;
  return (
    <svg className="mm-ring" viewBox="0 0 100 100">
      <circle className="mm-ring-bg"   cx="50" cy="50" r={r} />
      <circle className={`mm-ring-fill ${status}`} cx="50" cy="50" r={r}
        strokeDasharray={circ} strokeDashoffset={off} />
    </svg>
  );
}

/* ── Final Goal diamond ──────────────────────────────────────────── */
function FinalGoalDiamond({ progress, finalGoal }) {
  const glow = clamp(progress, 10, 100);
  return (
    <div className="mm-final-goal" style={{ "--goalGlow": `${glow}%` }}>
      <div className="mm-final-label">FINAL GOAL</div>
      <div className="mm-diamond">
        <svg viewBox="0 0 180 130" aria-hidden="true">
          <path d="M25 36 L55 8 H125 L155 36 L90 122 Z" />
          <path d="M25 36 H155 M55 8 L72 36 L90 8 L108 36 L125 8 M72 36 L90 122 L108 36" />
        </svg>
      </div>
      <div className="mm-final-title">{finalGoal}</div>
    </div>
  );
}

/* ── Player avatar ───────────────────────────────────────────────── */
function PlayerAvatar() {
  return (
    <div className="mm-avatar" aria-label="Current position">
      <div className="mm-avatar-aura" />
      <div className="mm-avatar-body"><span /></div>
    </div>
  );
}

/* ── Milestone detail popup ──────────────────────────────────────── */
function MilestonePopup({ milestone, layout, onOpen, onClose }) {
  const ref  = useRef(null);
  const side = layout.side;

  // close on outside click
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("pointerdown", h);
    return () => document.removeEventListener("pointerdown", h);
  }, [onClose]);

  const statusColor = milestone.status === "completed" ? "#00FFBF"
                    : milestone.status === "in_progress" ? "#D11EFF"
                    : "rgba(123,44,255,0.5)";

  return (
    <div
      ref={ref}
      style={{
        position:      "absolute",
        top:           "50%",
        [side === "right" ? "left" : "right"]: "calc(100% + 10px)",
        transform:     "translateY(-50%)",
        zIndex:        30,
        width:         220,
        background:    "rgba(0,0,0,0.92)",
        border:        `1px solid ${statusColor}`,
        borderRadius:  16,
        padding:       "14px 16px",
        boxShadow:     `0 0 24px ${statusColor}44, inset 0 0 20px rgba(0,0,0,0.5)`,
        backdropFilter:"blur(16px)",
        pointerEvents: "all",
      }}
    >
      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 8, right: 10,
          background: "none", border: "none", color: "rgba(234,251,255,0.4)",
          fontSize: 16, cursor: "pointer", lineHeight: 1,
        }}
      >×</button>

      {/* Status chip */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: `${statusColor}18`, border: `1px solid ${statusColor}55`,
        borderRadius: 6, padding: "2px 8px", marginBottom: 8,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, display: "block" }} />
        <span style={{ fontSize: 9, fontFamily: "var(--font-mono,monospace)", letterSpacing: "0.1em", color: statusColor, textTransform: "uppercase" }}>
          {milestone.status === "completed" ? "Completed" : milestone.status === "in_progress" ? "Active" : "Locked"}
        </span>
      </div>

      <div style={{ fontWeight: 800, fontSize: 14, color: "#EAFBFF", marginBottom: 4, lineHeight: 1.3 }}>
        {milestone.title}
      </div>

      {milestone.description && (
        <p style={{ fontSize: 12, color: "rgba(234,251,255,0.55)", lineHeight: 1.6, margin: "0 0 10px" }}>
          {milestone.description}
        </p>
      )}

      {/* Progress bar */}
      <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 10 }}>
        <div style={{
          width: `${clamp(milestone.progress || 0, 0, 100)}%`, height: "100%",
          background: `linear-gradient(90deg, #00F0FF, #D11EFF)`,
          borderRadius: 3, boxShadow: "0 0 8px rgba(0,240,255,0.6)",
          transition: "width 0.6s ease",
        }} />
      </div>

      {/* Reward row */}
      {milestone.reward && milestone.status !== "locked" && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontSize: 11, color: "rgba(234,251,255,0.6)", marginBottom: 12,
        }}>
          <span>🎁</span>
          <span style={{ color: "#FACC15", fontWeight: 700 }}>{milestone.reward}</span>
        </div>
      )}

      {/* CTA */}
      {milestone.status !== "locked" && onOpen && (
        <button
          onClick={() => onOpen(milestone.id)}
          style={{
            width: "100%", padding: "8px 0",
            background: `linear-gradient(135deg, ${statusColor}22, ${statusColor}11)`,
            border: `1px solid ${statusColor}66`,
            borderRadius: 10, color: statusColor,
            fontSize: 11, fontFamily: "var(--font-mono,monospace)",
            letterSpacing: "0.12em", textTransform: "uppercase",
            cursor: "pointer", fontWeight: 700,
          }}
        >
          OPEN MILESTONE →
        </button>
      )}
      {milestone.status === "locked" && (
        <div style={{ fontSize: 10, color: "rgba(234,251,255,0.3)", textAlign: "center", fontFamily: "var(--font-mono,monospace)" }}>
          🔒 Complete previous milestone to unlock
        </div>
      )}
    </div>
  );
}

/* ── Milestone node ──────────────────────────────────────────────── */
function MilestoneNode({ milestone, layout, index, isCurrent, onOpenMilestone }) {
  const [open, setOpen] = useState(false);
  const status = milestone.status || "locked";
  const icon   = iconMap[milestone.icon] || iconMap.default;
  const cardSide = layout.side === "right" ? "mm-card-right" : "mm-card-left";

  return (
    <div
      className={`mm-node-wrap ${status} ${isCurrent ? "current" : ""}`}
      style={{ left: `${layout.x}%`, top: `${layout.y}%`, position: "absolute" }}
    >
      <button
        className="mm-node-wrap-btn"
        onClick={() => setOpen((v) => !v)}
        type="button"
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "block" }}
        aria-label={milestone.title}
      >
        <div className="mm-node">
          <ProgressRing progress={milestone.progress} status={status} />
          <div className="mm-node-icon">
            {status === "locked" ? "🔒" : status === "completed" ? "✓" : icon}
          </div>
          {isCurrent && <PlayerAvatar />}
        </div>
        <div className={`mm-node-card ${cardSide}`}>
          <div className="mm-node-title">{milestone.title}</div>
          <div className="mm-node-progress">{milestone.progress || 0}% Complete</div>
          <div className="mm-bar">
            <span style={{ width: `${clamp(milestone.progress || 0, 0, 100)}%` }} />
          </div>
          <div className="mm-reward-row">
            <span className="mm-reward-label">Reward</span>
            <span className="mm-reward-value">
              {status === "locked" ? "🔒 Locked" : `💎 ${milestone.reward || "XP"}`}
            </span>
            <span className={`mm-chest ${status}`}>{status === "completed" ? "🏆" : "🎁"}</span>
          </div>
        </div>
      </button>

      {/* Detail popup on click */}
      {open && (
        <MilestonePopup
          milestone={milestone}
          layout={layout}
          onOpen={onOpenMilestone}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

/* ── Add Milestone node ──────────────────────────────────────────── */
function AddNode({ onAddMilestone }) {
  const [hovered, setHovered] = useState(false);
  if (!onAddMilestone) return null;
  return (
    <div style={{
      position:  "absolute",
      left:      "50%",
      top:       "93%",
      transform: "translate(-50%, -50%)",
      zIndex:    12,
      display:   "flex",
      flexDirection: "column",
      alignItems:"center",
      gap: 4,
    }}>
      <button
        onClick={onAddMilestone}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        type="button"
        style={{
          width: 52, height: 52, borderRadius: "50%",
          background:  hovered ? "rgba(0,240,255,0.2)" : "rgba(0,240,255,0.08)",
          border:      `2px dashed ${hovered ? "#00F0FF" : "rgba(0,240,255,0.4)"}`,
          color:       "#00F0FF",
          fontSize:    24, fontWeight: 900,
          cursor:      "pointer",
          display:     "grid", placeItems: "center",
          transition:  "all 0.2s",
          boxShadow:   hovered ? "0 0 20px rgba(0,240,255,0.4)" : "none",
        }}
        aria-label="Add Milestone"
      >
        +
      </button>
      <span style={{
        fontSize: 9, fontFamily: "var(--font-mono,monospace)",
        letterSpacing: "0.12em", color: "rgba(0,240,255,0.5)",
        textTransform: "uppercase",
      }}>
        Add Milestone
      </span>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────────── */
export default function ProjectTrailMap({ project = demoProject, onOpenMilestone, onAddMilestone }) {
  const milestones = project?.milestones?.length ? project.milestones : demoProject.milestones;

  const completedCount   = milestones.filter((m) => m.status === "completed").length;
  const projectProgress  = Math.round(
    milestones.reduce((s, m) => s + (m.progress || 0), 0) / milestones.length
  );
  const currentIndex = Math.max(0, milestones.findIndex((m) => m.status === "in_progress"));

  const layout = useMemo(() => getMilestoneLayout(milestones.length), [milestones.length]);
  const pathD  = useMemo(() => buildPath(layout), [layout]);

  return (
    <section className="mm-world">
      <style>{styles}</style>

      <div className="mm-stars" />
      <div className="mm-fog mm-fog-one" />
      <div className="mm-fog mm-fog-two" />

      {/* ── Header ── */}
      <div className="mm-world-header">
        <div>
          <div className="mm-brand">MILESTONE MAPPING™</div>
          <div className="mm-subtitle">{project?.title || demoProject.title}</div>
        </div>
        <div className="mm-xp-pill">💎 {project?.xp || 0} XP</div>
      </div>

      {/* ── Stat cards ── */}
      <div className="mm-stat-card mm-left-card">
        <div className="mm-stat-title">JOURNEY STATUS</div>
        <div className="mm-stat-row"><span>Level</span><strong>{project?.level || 1}</strong></div>
        <div className="mm-stat-row"><span>Progress</span><strong>{projectProgress}%</strong></div>
        <div className="mm-stat-row"><span>Completed</span><strong>{completedCount}/{milestones.length}</strong></div>
        <div className="mm-stat-row"><span>Streak</span><strong>{project?.streak || 0} Days</strong></div>
      </div>

      <div className="mm-stat-card mm-right-card">
        <div className="mm-stat-title">MAP LEGEND</div>
        <div className="mm-legend"><i className="complete" /> Completed</div>
        <div className="mm-legend"><i className="active" /> In Progress</div>
        <div className="mm-legend"><i className="locked" /> Locked</div>
        <div className="mm-legend">🎁 Reward</div>
        <div className="mm-legend">💎 Final Goal</div>
      </div>

      {/* ── Trail map ── */}
      <div className="mm-map">
        <FinalGoalDiamond progress={projectProgress} finalGoal={project?.finalGoal || demoProject.finalGoal} />

        <svg className="mm-path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mmPathGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#00F0FF" />
              <stop offset="48%"  stopColor="#D11EFF" />
              <stop offset="100%" stopColor="#00FFBF" />
            </linearGradient>
            <filter id="mmGlow">
              <feGaussianBlur stdDeviation="1.4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <path className="mm-path-shadow" d={pathD} />
          <path className="mm-path-main"   d={pathD} />
          <path className="mm-path-flow"   d={pathD} />
        </svg>

        {/* Add milestone node sits at START position */}
        <AddNode onAddMilestone={onAddMilestone} />

        {/* START label — only shown when no addNode / demo mode */}
        {!onAddMilestone && (
          <div className="mm-start-node">
            <div className="mm-start-circle">⚑</div>
            <div><strong>START</strong><span>Current Reality</span></div>
          </div>
        )}

        {/* Milestone nodes */}
        {milestones.map((milestone, index) => (
          <MilestoneNode
            key={milestone.id || `${milestone.title}-${index}`}
            milestone={milestone}
            layout={layout[index]}
            index={index}
            isCurrent={index === currentIndex}
            onOpenMilestone={onOpenMilestone}
          />
        ))}
      </div>
    </section>
  );
}

/* ── Styles ──────────────────────────────────────────────────────── */
const styles = `
:root {
  --mm-black: #000000;
  --mm-card: rgba(0,0,0,0.72);
  --mm-cyan: #00F0FF;
  --mm-magenta: #D11EFF;
  --mm-pink: #FF3EDB;
  --mm-purple: #7B2CFF;
  --mm-mint: #00FFBF;
  --mm-text: #EAFBFF;
  --mm-muted: rgba(234,251,255,0.66);
}
.mm-world, .mm-world * { box-sizing: border-box; }
.mm-world {
  position: relative;
  width: 100%;
  min-height: 1100px;
  overflow: hidden;
  color: var(--mm-text);
  background:
    radial-gradient(circle at 50% 12%, rgba(0,240,255,0.18), transparent 20%),
    radial-gradient(circle at 22% 54%, rgba(209,30,255,0.16), transparent 26%),
    radial-gradient(circle at 78% 64%, rgba(255,62,219,0.12), transparent 24%),
    radial-gradient(circle at 50% 100%, rgba(0,255,191,0.14), transparent 25%),
    #000;
  border-radius: 28px;
  border: 1px solid rgba(0,240,255,0.18);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  isolation: isolate;
}
.mm-stars {
  position: absolute; inset: 0;
  background-image:
    radial-gradient(circle, rgba(0,240,255,.75) 0 1px, transparent 1.5px),
    radial-gradient(circle, rgba(209,30,255,.55) 0 1px, transparent 1.5px);
  background-size: 120px 120px, 180px 180px;
  background-position: 0 0, 48px 72px;
  opacity: .34;
  animation: mmStarDrift 20s linear infinite;
  z-index: -3;
}
.mm-fog {
  position: absolute; width: 520px; height: 520px;
  border-radius: 999px; filter: blur(44px); opacity: .23;
  z-index: -2; pointer-events: none;
}
.mm-fog-one { left: -120px; top: 420px; background: rgba(123,44,255,.55); animation: mmFog 13s ease-in-out infinite alternate; }
.mm-fog-two { right: -160px; top: 560px; background: rgba(0,240,255,.28); animation: mmFog 17s ease-in-out infinite alternate-reverse; }
.mm-world-header {
  position: relative; z-index: 20;
  display: flex; justify-content: space-between; align-items: center; gap: 18px;
  padding: 28px 36px 0;
}
.mm-brand {
  font-size: clamp(22px,3vw,36px); font-weight: 900; letter-spacing: .18em; line-height: 1;
  background: linear-gradient(90deg, var(--mm-cyan), var(--mm-magenta), var(--mm-pink));
  -webkit-background-clip: text; background-clip: text; color: transparent;
  text-shadow: 0 0 24px rgba(0,240,255,.25);
}
.mm-subtitle { margin-top: 10px; color: var(--mm-muted); font-size: 15px; letter-spacing: .16em; text-transform: uppercase; }
.mm-xp-pill {
  flex: 0 0 auto; padding: 14px 22px; border-radius: 999px;
  background: rgba(0,0,0,.72); border: 1px solid rgba(0,240,255,.28);
  box-shadow: 0 0 30px rgba(123,44,255,.18), inset 0 0 22px rgba(0,240,255,.08);
  font-weight: 900; font-size: 18px;
}
.mm-map {
  position: relative; width: min(900px,100%); height: 980px; margin: -10px auto 0;
}
.mm-path-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; z-index: 1; }
.mm-path-shadow { fill: none; stroke: rgba(123,44,255,.16); stroke-width: 2.6; stroke-linecap: round; filter: url(#mmGlow); }
.mm-path-main   { fill: none; stroke: url(#mmPathGradient); stroke-width: 1.05; stroke-linecap: round; filter: url(#mmGlow); }
.mm-path-flow   { fill: none; stroke: rgba(255,255,255,.82); stroke-width: .28; stroke-linecap: round; stroke-dasharray: 1.8 5; animation: mmDash 3s linear infinite; opacity: .75; }
.mm-final-goal  { position: absolute; top: 54px; left: 50%; transform: translateX(-50%); text-align: center; z-index: 8; }
.mm-final-label { color: var(--mm-cyan); font-weight: 900; letter-spacing: .14em; text-shadow: 0 0 18px rgba(0,240,255,.75); }
.mm-final-title { color: var(--mm-muted); font-size: 14px; margin-top: -4px; }
.mm-diamond     { width: 170px; margin: 2px auto 0; filter: drop-shadow(0 0 18px rgba(0,240,255,.9)) drop-shadow(0 0 calc(var(--goalGlow)*.55) rgba(209,30,255,.5)); animation: mmFloat 3.5s ease-in-out infinite; }
.mm-diamond svg { width: 100%; overflow: visible; }
.mm-diamond path { fill: rgba(0,240,255,.08); stroke: url(#mmPathGradient); stroke-width: 5; vector-effect: non-scaling-stroke; }
.mm-start-node {
  position: absolute; left: 50%; top: 92%; transform: translate(-50%,-50%); z-index: 5;
  display: flex; align-items: center; gap: 13px; padding: 14px 20px 14px 14px;
  border-radius: 999px; background: rgba(0,0,0,.75); border: 1px solid rgba(0,240,255,.32);
  box-shadow: 0 0 34px rgba(0,240,255,.22), inset 0 0 22px rgba(0,240,255,.08);
}
.mm-start-circle { display: grid; place-items: center; width: 58px; height: 58px; border-radius: 50%; background: radial-gradient(circle,rgba(0,240,255,.28),rgba(0,0,0,.92)); border: 1px solid rgba(0,240,255,.72); color: var(--mm-cyan); font-size: 24px; }
.mm-start-node strong { display: block; color: var(--mm-cyan); letter-spacing: .12em; }
.mm-start-node span   { display: block; color: var(--mm-muted); font-size: 12px; margin-top: 3px; }

/* ── Nodes ── */
.mm-node-wrap { position: absolute; z-index: 10; transform: translate(-50%,-50%); }
.mm-node-wrap-btn { appearance: none; border: none; background: transparent; color: inherit; cursor: pointer; padding: 0; text-align: left; display: block; }
.mm-node {
  position: relative; width: 104px; height: 104px; border-radius: 50%;
  display: grid; place-items: center;
  background: radial-gradient(circle, rgba(0,240,255,.16), rgba(0,0,0,.92) 64%);
  box-shadow: 0 0 36px rgba(0,240,255,.22);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.mm-node-wrap-btn:hover .mm-node { transform: scale(1.08); box-shadow: 0 0 48px rgba(0,240,255,.4); }
.mm-node-wrap.in_progress .mm-node { animation: mmPulse 1.8s ease-in-out infinite; }
.mm-node-wrap.locked .mm-node { filter: grayscale(.4); opacity: .62; box-shadow: 0 0 26px rgba(123,44,255,.18); }
.mm-ring      { position: absolute; inset: 0; transform: rotate(-90deg); }
.mm-ring-bg   { fill: transparent; stroke: rgba(255,255,255,.12); stroke-width: 5; }
.mm-ring-fill { fill: transparent; stroke-width: 5; stroke-linecap: round; transition: stroke-dashoffset .65s ease; }
.mm-ring-fill.completed  { stroke: var(--mm-cyan); }
.mm-ring-fill.in_progress{ stroke: var(--mm-magenta); }
.mm-ring-fill.locked     { stroke: rgba(123,44,255,.38); }
.mm-node-icon {
  position: relative; z-index: 3; display: grid; place-items: center;
  width: 66px; height: 66px; border-radius: 50%; color: var(--mm-text);
  font-size: 32px; font-weight: 900; background: rgba(0,0,0,.78);
  border: 1px solid rgba(0,240,255,.25); text-shadow: 0 0 12px rgba(0,240,255,.72);
}
.mm-node-wrap.completed .mm-node-icon { color: var(--mm-mint); }
.mm-node-card {
  position: absolute; top: 50%; width: 240px; min-height: 114px; padding: 16px;
  transform: translateY(-50%); border-radius: 18px;
  background: rgba(0,0,0,.72); border: 1px solid rgba(0,240,255,.24);
  box-shadow: 0 0 28px rgba(0,240,255,.12), inset 0 0 24px rgba(123,44,255,.08);
  backdrop-filter: blur(14px);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.mm-node-wrap-btn:hover .mm-node-card { border-color: rgba(0,240,255,.5); box-shadow: 0 0 36px rgba(0,240,255,.2); }
.mm-card-right { left: 122px; }
.mm-card-left  { right: 122px; }
.mm-node-wrap.locked .mm-node-card { border-color: rgba(209,30,255,.22); opacity: .74; }
.mm-node-title    { color: var(--mm-text); font-size: 18px; font-weight: 900; letter-spacing: .05em; text-transform: uppercase; }
.mm-node-progress { margin-top: 5px; color: var(--mm-cyan); font-size: 12px; font-weight: 800; text-transform: uppercase; }
.mm-bar { height: 7px; margin-top: 9px; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,.1); }
.mm-bar span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg,var(--mm-cyan),var(--mm-magenta)); box-shadow: 0 0 14px rgba(0,240,255,.75); }
.mm-reward-row { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 8px; margin-top: 10px; color: var(--mm-muted); font-size: 12px; }
.mm-reward-label { text-transform: uppercase; }
.mm-reward-value { color: var(--mm-text); font-weight: 800; }
.mm-chest { font-size: 22px; filter: drop-shadow(0 0 8px rgba(0,240,255,.45)); }
.mm-chest.locked { opacity: .5; filter: grayscale(1); }
.mm-avatar { position: absolute; left: 50%; top: -64px; transform: translateX(-50%); width: 62px; height: 76px; pointer-events: none; z-index: 6; }
.mm-avatar-aura { position: absolute; left: 50%; bottom: 6px; width: 78px; height: 25px; transform: translateX(-50%); border-radius: 50%; background: radial-gradient(circle,rgba(0,240,255,.55),transparent 68%); filter: blur(3px); animation: mmAura 1.6s ease-in-out infinite; }
.mm-avatar-body { position: absolute; left: 50%; bottom: 12px; width: 30px; height: 52px; transform: translateX(-50%); border-radius: 16px 16px 8px 8px; background: linear-gradient(180deg,rgba(234,251,255,.94),rgba(0,240,255,.38)); clip-path: polygon(50% 0%,72% 18%,72% 55%,94% 100%,6% 100%,28% 55%,28% 18%); box-shadow: 0 0 20px rgba(0,240,255,.9), 0 0 34px rgba(209,30,255,.42); animation: mmAvatarFloat 2s ease-in-out infinite; }
.mm-avatar-body span { position: absolute; inset: 20px -10px auto; height: 18px; border-radius: 50%; border-bottom: 2px solid rgba(209,30,255,.85); }
.mm-stat-card { position: absolute; z-index: 18; width: 230px; padding: 20px; border-radius: 22px; background: rgba(0,0,0,.68); border: 1px solid rgba(0,240,255,.25); box-shadow: 0 0 28px rgba(0,240,255,.12), inset 0 0 22px rgba(123,44,255,.08); backdrop-filter: blur(14px); }
.mm-left-card  { left: 26px; top: 140px; }
.mm-right-card { right: 26px; top: 140px; }
.mm-stat-title { margin-bottom: 15px; color: var(--mm-cyan); font-weight: 900; letter-spacing: .12em; font-size: 13px; }
.mm-stat-row   { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-top: 1px solid rgba(255,255,255,.09); color: var(--mm-muted); font-size: 13px; text-transform: uppercase; }
.mm-stat-row strong { color: var(--mm-text); font-size: 18px; }
.mm-legend     { display: flex; align-items: center; gap: 10px; padding: 11px 0; border-top: 1px solid rgba(255,255,255,.08); color: var(--mm-muted); font-size: 13px; text-transform: uppercase; }
.mm-legend i   { width: 17px; height: 17px; border-radius: 50%; display: inline-block; }
.mm-legend i.complete { background: var(--mm-mint); box-shadow: 0 0 12px var(--mm-mint); }
.mm-legend i.active   { background: var(--mm-cyan); box-shadow: 0 0 12px var(--mm-cyan); }
.mm-legend i.locked   { background: rgba(123,44,255,.35); box-shadow: 0 0 12px rgba(123,44,255,.7); }

@keyframes mmDash        { to { stroke-dashoffset: -24; } }
@keyframes mmFloat       { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-10px) scale(1.035)} }
@keyframes mmPulse       { 0%,100%{transform:scale(1);box-shadow:0 0 36px rgba(0,240,255,.24)} 50%{transform:scale(1.06);box-shadow:0 0 54px rgba(209,30,255,.42)} }
@keyframes mmAura        { 0%,100%{opacity:.55;transform:translateX(-50%) scale(.9)} 50%{opacity:1;transform:translateX(-50%) scale(1.15)} }
@keyframes mmAvatarFloat { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-8px)} }
@keyframes mmFog         { from{transform:translate3d(0,0,0) scale(1)} to{transform:translate3d(80px,-40px,0) scale(1.15)} }
@keyframes mmStarDrift   { to{background-position:120px 120px,228px 252px} }

@media (max-width:1100px) {
  .mm-stat-card { position:relative;top:auto;left:auto;right:auto;width:calc(100% - 32px);margin:18px auto 0; }
  .mm-left-card,.mm-right-card { left:auto;right:auto;top:auto; }
  .mm-map { height:1050px; }
}
@media (max-width:760px) {
  .mm-world { min-height:1180px; border-radius:18px; }
  .mm-world-header { align-items:flex-start; padding:22px 18px 0; }
  .mm-xp-pill { font-size:13px; padding:11px 14px; }
  .mm-brand { font-size:22px; }
  .mm-subtitle { font-size:11px; }
  .mm-map { width:100%; height:1040px; margin-top:0; }
  .mm-node { width:82px; height:82px; }
  .mm-node-icon { width:52px; height:52px; font-size:24px; }
  .mm-node-card { width:184px; min-height:98px; padding:12px; }
  .mm-card-right { left:92px; }
  .mm-card-left  { right:92px; }
  .mm-node-title { font-size:13px; }
  .mm-reward-row { grid-template-columns:1fr auto; }
  .mm-reward-label { display:none; }
  .mm-final-goal { top:62px; }
  .mm-diamond { width:130px; }
  .mm-start-node { top:94%; }
  .mm-avatar { transform:translateX(-50%) scale(.82); }
}
`;

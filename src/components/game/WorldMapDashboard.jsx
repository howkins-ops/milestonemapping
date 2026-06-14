import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAppData } from "../../hooks/useAppData.js";
import { useGamification } from "../../hooks/useGamification.js";
import { loadShiftsState } from "../../data/shiftsData.js";

/* ─── Zone definitions ──────────────────────────────────────── */
// SVG coordinate space: viewBox="0 0 390 700"
const ZONES = [
  {
    id: "identity",
    label: "IDENTITY FORGE",
    sublabel: "Define who you're becoming",
    icon: "🔮",
    page: "identity",
    color: "#D11EFF",
    x: 195, y: 100,
    size: 56,
    floatDur: "4.2s",
    description: "Your power statement, identity rules & future self"
  },
  {
    id: "training",
    label: "5 SHIFTS",
    sublabel: "Rewire your mind",
    icon: "🌀",
    page: "training",
    color: "#8B5CF6",
    x: 75, y: 205,
    size: 48,
    floatDur: "3.8s",
    description: "Five transformation levels — cinematic game training"
  },
  {
    id: "vision",
    label: "VISION REALM",
    sublabel: "See your future",
    icon: "👁️",
    page: "vision",
    color: "#00F0FF",
    x: 315, y: 205,
    size: 48,
    floatDur: "5.1s",
    description: "Your vision board — the future made visual"
  },
  {
    id: "milestones",
    label: "PROJECT WORLDS",
    sublabel: "Map the mission",
    icon: "🗺️",
    page: "milestones",
    color: "#FF3EDB",
    x: 195, y: 310,
    size: 60,
    floatDur: "4.6s",
    description: "Projects & milestones — the battlefield of execution"
  },
  {
    id: "daily",
    label: "DAILY NEXUS",
    sublabel: "Execute the day",
    icon: "⚡",
    page: "daily",
    color: "#00FFBF",
    x: 75, y: 415,
    size: 48,
    floatDur: "3.5s",
    description: "Top 5, gratitude, battle plan & daily reflection"
  },
  {
    id: "rewards",
    label: "VAULT",
    sublabel: "Claim your wins",
    icon: "💎",
    page: "rewards",
    color: "#FACC15",
    x: 315, y: 415,
    size: 48,
    floatDur: "4.9s",
    description: "Your reward vault — proof of follow-through"
  },
  {
    id: "weekly",
    label: "WAR ROOM",
    sublabel: "Review & reload",
    icon: "📡",
    page: "weekly",
    color: "#FF3B5C",
    x: 110, y: 520,
    size: 42,
    floatDur: "4.3s",
    description: "Weekly scorecard — audit the week, reset the mission"
  },
  {
    id: "stats",
    label: "STATS NEXUS",
    sublabel: "Track your power",
    icon: "📊",
    page: "stats",
    color: "#00F0FF",
    x: 280, y: 520,
    size: 42,
    floatDur: "5.4s",
    description: "XP, rank, streaks & progress analytics"
  },
];

const CONNECTIONS = [
  { from: "identity",   to: "training",   color: "#8B5CF6" },
  { from: "identity",   to: "vision",     color: "#00F0FF" },
  { from: "training",   to: "milestones", color: "#FF3EDB" },
  { from: "vision",     to: "milestones", color: "#FF3EDB" },
  { from: "milestones", to: "daily",      color: "#00FFBF" },
  { from: "milestones", to: "rewards",    color: "#FACC15" },
  { from: "daily",      to: "weekly",     color: "#FF3B5C" },
  { from: "rewards",    to: "stats",      color: "#00F0FF" },
];

const ZONE_MAP = Object.fromEntries(ZONES.map(z => [z.id, z]));

function getPathD(from, to) {
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  const cpX = from.x + (to.x - from.x) * 0.15;
  return `M ${from.x} ${from.y} Q ${cpX} ${my} ${to.x} ${to.y}`;
}

/* ─── Zone Node ──────────────────────────────────────────────── */
function ZoneNode({ zone, onSelect, selected }) {
  const pct = (v, max) => `${(v / max) * 100}%`;
  return (
    <button
      className={`zone-node${selected ? " zone-node--selected" : ""}`}
      style={{
        left: pct(zone.x, 390),
        top: pct(zone.y, 700),
        "--node-color": zone.color,
        "--node-size": `${zone.size}px`,
        "--icon-size": `${zone.size * 0.42}px`,
        "--float-dur": zone.floatDur,
      }}
      onClick={() => onSelect(zone)}
      aria-label={zone.label}
    >
      <div className="zone-node__ring-outer">
        <div className="zone-node__inner">
          <span className="zone-node__icon">{zone.icon}</span>
        </div>
      </div>
      <div className="zone-node__label">{zone.label}</div>
    </button>
  );
}

/* ─── Zone Popup ─────────────────────────────────────────────── */
function ZonePopup({ zone, onEnter, onClose }) {
  if (!zone) return null;
  return (
    <div className="zone-popup">
      <div
        className="zone-popup__content"
        style={{ "--popup-color": zone.color, position: "relative" }}
      >
        <button className="zone-popup__close" onClick={onClose} aria-label="Close">✕</button>
        <div className="zone-popup__top">
          <div className="zone-popup__icon">
            <span style={{ fontSize: 22 }}>{zone.icon}</span>
          </div>
          <div>
            <div className="zone-popup__name">{zone.label}</div>
            <div className="zone-popup__sub">{zone.sublabel}</div>
          </div>
        </div>
        <p style={{
          fontSize: 12,
          color: "rgba(234,251,255,0.55)",
          margin: "0 0 14px",
          lineHeight: 1.6,
          fontFamily: "var(--font-body)"
        }}>
          {zone.description}
        </p>
        <button className="zone-popup__enter" onClick={() => onEnter(zone.page)}>
          ENTER ZONE ›
        </button>
      </div>
    </div>
  );
}

/* ─── Stars ──────────────────────────────────────────────────── */
function StarField() {
  const stars = useRef([]);
  if (!stars.current.length) {
    for (let i = 0; i < 60; i++) {
      stars.current.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: 0.8 + Math.random() * 2,
        lo: 0.1 + Math.random() * 0.3,
        hi: 0.5 + Math.random() * 0.5,
        dur: 2 + Math.random() * 4,
      });
    }
  }
  return (
    <div className="world-map-stars" aria-hidden="true">
      {stars.current.map((st, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${st.x}%`,
            top: `${st.y}%`,
            width: st.s,
            height: st.s,
            "--dur": `${st.dur}s`,
            "--lo": st.lo,
            "--hi": st.hi,
          }}
        />
      ))}
    </div>
  );
}

/* ─── SVG Path Layer ─────────────────────────────────────────── */
function PathLayer({ activeZoneId }) {
  return (
    <svg
      className="world-map-svg"
      viewBox="0 0 390 700"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <filter id="pathGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="apexGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {CONNECTIONS.map(({ from, to, color }, i) => (
          <linearGradient key={i} id={`pg_${from}_${to}`} gradientUnits="userSpaceOnUse"
            x1={ZONE_MAP[from].x} y1={ZONE_MAP[from].y}
            x2={ZONE_MAP[to].x} y2={ZONE_MAP[to].y}
          >
            <stop stopColor={ZONE_MAP[from].color} stopOpacity="0.7" />
            <stop offset="1" stopColor={ZONE_MAP[to].color} stopOpacity="0.7" />
          </linearGradient>
        ))}
      </defs>

      {/* Hero to first nodes */}
      <line x1="195" y1="640" x2="110" y2="520"
        stroke="rgba(250,204,21,0.3)" strokeWidth="1" strokeDasharray="4 5"
        filter="url(#pathGlow)" />
      <line x1="195" y1="640" x2="280" y2="520"
        stroke="rgba(250,204,21,0.3)" strokeWidth="1" strokeDasharray="4 5"
        filter="url(#pathGlow)" />

      {/* Zone connections */}
      {CONNECTIONS.map(({ from, to }, i) => {
        const fz = ZONE_MAP[from];
        const tz = ZONE_MAP[to];
        const isActive = activeZoneId === from || activeZoneId === to;
        return (
          <path
            key={i}
            d={getPathD(fz, tz)}
            stroke={`url(#pg_${from}_${to})`}
            strokeWidth={isActive ? 2 : 1.2}
            fill="none"
            strokeDasharray={isActive ? "none" : "6 6"}
            filter="url(#pathGlow)"
            className={`zone-path${isActive ? " zone-path--active" : ""}`}
            opacity={isActive ? 0.9 : 0.45}
          />
        );
      })}

      {/* Identity to Phoenix apex */}
      <line x1="195" y1="100" x2="195" y2="28"
        stroke="url(#apexBeam)" strokeWidth="2"
        filter="url(#apexGlow)" opacity="0.7" />
      <defs>
        <linearGradient id="apexBeam" x1="195" y1="100" x2="195" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D11EFF" stopOpacity="0.8" />
          <stop offset="1" stopColor="#00F0FF" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Apex (Phoenix + Diamond) ───────────────────────────────── */
function ApexNode() {
  return (
    <div
      className="apex-node"
      style={{ left: "50%", top: `${(28 / 700) * 100}%` }}
      aria-hidden="true"
    >
      <div className="apex-glow" />
      <svg width="52" height="52" viewBox="0 0 220 250" fill="none" style={{ filter: "drop-shadow(0 0 14px rgba(0,240,255,0.9))" }}>
        <g transform="translate(48,0) scale(0.62)">
          <g stroke="#00F0FF" strokeWidth="4.5" strokeLinejoin="round" fill="none">
            <path d="M30,45 L70,12 L130,12 L170,45 L100,115 Z" />
            <path d="M30,45 L170,45" />
            <path d="M70,12 L85,45 L100,12 L115,45 L130,12" />
            <path d="M85,45 L100,115" />
            <path d="M115,45 L100,115" />
          </g>
        </g>
        <g transform="translate(0,115)">
          {[
            "M112,90 C152,84 186,56 202,14",
            "M112,97 C152,97 178,77 192,42",
            "M112,104 C148,110 170,96 182,70",
            "M110,111 C138,123 156,117 168,99"
          ].map((d, i) => (
            <path key={i} d={d} stroke={i % 2 === 0 ? "#8B5CF6" : "#D11EFF"} strokeWidth="2.8" strokeLinecap="round" fill="none"
              style={{ filter: "drop-shadow(0 0 5px rgba(139,92,246,0.7))" }} />
          ))}
          <g transform="translate(220,0) scale(-1,1)">
            {[
              "M112,90 C152,84 186,56 202,14",
              "M112,97 C152,97 178,77 192,42",
              "M112,104 C148,110 170,96 182,70",
              "M110,111 C138,123 156,117 168,99"
            ].map((d, i) => (
              <path key={i} d={d} stroke={i % 2 === 0 ? "#8B5CF6" : "#00F0FF"} strokeWidth="2.8" strokeLinecap="round" fill="none"
                style={{ filter: "drop-shadow(0 0 5px rgba(0,240,255,0.7))" }} />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}

/* ─── Hero Node ──────────────────────────────────────────────── */
function HeroNode() {
  return (
    <div
      className="hero-node"
      style={{
        left: "50%",
        top: `${(640 / 700) * 100}%`,
      }}
      aria-label="Your starting point"
    >
      <div className="hero-node__avatar">🧭</div>
      <div className="hero-node__platform" />
      <div style={{
        marginTop: 6,
        fontFamily: "var(--font-mono)",
        fontSize: 8,
        letterSpacing: "0.18em",
        color: "rgba(250,204,21,0.6)",
        textTransform: "uppercase",
      }}>
        YOU ARE HERE
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function WorldMapDashboard({ onNavigate }) {
  const { projects, milestones } = useAppData();
  const { xp, rank, nextRank, progress } = useGamification();
  const [selectedZone, setSelectedZone] = useState(null);
  const [activeZoneId, setActiveZoneId] = useState(null);
  const containerRef = useRef(null);

  const shiftsState = (() => {
    try { return loadShiftsState(); } catch { return { completed: [] }; }
  })();

  const activeMilestones = milestones.filter(m => !m.completedAt);
  const completedMilestones = milestones.filter(m => m.completedAt);

  const handleSelectZone = useCallback((zone) => {
    setSelectedZone(zone);
    setActiveZoneId(zone.id);
  }, []);

  const handleEnter = useCallback((page) => {
    if (page) onNavigate(page);
    setSelectedZone(null);
    setActiveZoneId(null);
  }, [onNavigate]);

  const handleClose = useCallback(() => {
    setSelectedZone(null);
    setActiveZoneId(null);
  }, []);

  // Close popup on outside tap
  useEffect(() => {
    if (!selectedZone) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        handleClose();
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [selectedZone, handleClose]);

  return (
    <>
      <div
        ref={containerRef}
        className="world-map-wrap scanlines"
        style={{ minHeight: "calc(100vh - 56px)" }}
      >
        {/* Background */}
        <div className="world-map-bg">
          <img
            src="/game/world-map.jpg"
            className="world-map-bg-img"
            alt=""
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <div className="world-map-bg-gradient" />
          <div className="world-map-bg-fallback" />
        </div>

        {/* Stars */}
        <StarField />

        {/* Atmosphere fog at bottom */}
        <div className="world-map-fog" />

        {/* Circuit grid */}
        <div className="circuit-bg" />

        {/* SVG paths */}
        <PathLayer activeZoneId={activeZoneId} />

        {/* Apex logo */}
        <ApexNode />

        {/* Zone nodes */}
        <div className="zone-nodes-layer">
          {ZONES.map(zone => (
            <ZoneNode
              key={zone.id}
              zone={zone}
              onSelect={handleSelectZone}
              selected={selectedZone?.id === zone.id}
            />
          ))}
        </div>

        {/* Hero start */}
        <HeroNode />

        {/* Open World — sits just above the XP bar, full-width centered */}
        <div style={{
          position: "absolute",
          bottom: 70,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          zIndex: 20,
        }}>
          <button
            onClick={() => onNavigate("openworld")}
            style={{
              background: "linear-gradient(135deg, rgba(255,62,219,0.2), rgba(0,240,255,0.1))",
              border: "1px solid rgba(255,62,219,0.6)",
              borderRadius: 10,
              padding: "8px 22px",
              color: "#FF3EDB",
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
              backdropFilter: "blur(8px)",
              boxShadow: "0 0 16px rgba(255,62,219,0.3), inset 0 0 8px rgba(255,62,219,0.05)",
            }}
          >
            🌍 &nbsp;VIEW YOUR EMPIRE
          </button>
        </div>

        {/* Header */}
        <div className="world-map-header">
          <div>
            <div className="world-map-title">ASCENSION MAP</div>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "rgba(234,251,255,0.3)",
              marginTop: 2,
              letterSpacing: "0.1em"
            }}>
              {activeMilestones.length} ACTIVE · {completedMilestones.length} COMPLETE
            </div>
          </div>
          <div className="world-map-xp-pill">
            <span>⚡ {xp.toLocaleString()} XP</span>
          </div>
        </div>

        {/* XP bar at bottom */}
        <div className="world-map-xp-bar">
          <div className="xp-bar-track">
            <div className="xp-bar-fill" style={{ width: `${progress * 100}%` }} />
          </div>
          <div className="xp-bar-labels">
            <div className="xp-rank-badge">⚔ {rank?.name || "RECRUIT"}</div>
            <div className="xp-count">
              {nextRank ? `${Math.round(progress * 100)}% → ${nextRank.name}` : "MAX RANK"}
            </div>
          </div>
        </div>

        {/* Zone popup */}
        {selectedZone && (
          <ZonePopup
            zone={selectedZone}
            onEnter={handleEnter}
            onClose={handleClose}
          />
        )}
      </div>
    </>
  );
}

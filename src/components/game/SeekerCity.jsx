import React, { useState, useRef, useMemo } from "react";
import { useAppData } from "../../hooks/useAppData.js";
import { useGamification } from "../../hooks/useGamification.js";

/* ─── District definitions ─────────────────────────────────────── */
const DISTRICTS = [
  // LORE QUARTER — the story chapters
  {
    id: "anchor-house",
    name: "THE ANCHOR HOUSE",
    sublabel: "The Coaching Table",
    icon: "⚓",
    color: "#00F0FF",
    glow: "rgba(0,240,255,0.35)",
    route: "chapter-anchor",
    description:
      "Sit across from your father at the coaching table. Discover your WHY and anchor it deep into your identity — the moment the seeker's path begins.",
    tier: "lore",
    chapter: 1,
  },
  {
    id: "shadow-market",
    name: "THE SHADOW MARKET",
    sublabel: "Where Masks Are Sold",
    icon: "🌑",
    color: "#D11EFF",
    glow: "rgba(209,30,255,0.35)",
    route: "chapter-shadow",
    description:
      "Enter the market ruled by the Broke King. Every mask here has a price. Find the story that has been running you in the dark — and choose to put it down.",
    tier: "lore",
    chapter: 2,
  },

  // CORE DISTRICT — identity, training, vision
  {
    id: "identity-forge",
    name: "IDENTITY FORGE",
    sublabel: "Define who you're becoming",
    icon: "🔮",
    color: "#D11EFF",
    glow: "rgba(209,30,255,0.3)",
    route: "identity",
    description:
      "Your power statement, identity rules and future self transmission live here. This is where you forge the version of yourself you're becoming.",
    tier: "core",
  },
  {
    id: "the-academy",
    name: "THE ACADEMY",
    sublabel: "5 Shifts — rewire your mind",
    icon: "🌀",
    color: "#8B5CF6",
    glow: "rgba(139,92,246,0.3)",
    route: "training",
    description:
      "Five transformation levels. Cinematic game training designed to rewrite your operating system from the inside out.",
    tier: "core",
  },
  {
    id: "vision-tower",
    name: "VISION TOWER",
    sublabel: "See your future",
    icon: "👁️",
    color: "#00F0FF",
    glow: "rgba(0,240,255,0.3)",
    route: "vision",
    description:
      "Your vision board — the future made so vivid and real that your nervous system can't tell the difference between now and then.",
    tier: "core",
  },

  // EXECUTION ZONE — projects & daily
  {
    id: "war-rooms",
    name: "THE WAR ROOMS",
    sublabel: "Map the mission",
    icon: "🗺️",
    color: "#FF3EDB",
    glow: "rgba(255,62,219,0.3)",
    route: "milestones",
    description:
      "Your projects and milestones. The battlefield where strategy becomes execution and execution becomes legacy.",
    tier: "execution",
  },
  {
    id: "daily-nexus",
    name: "DAILY NEXUS",
    sublabel: "Execute the day",
    icon: "⚡",
    color: "#00FFBF",
    glow: "rgba(0,255,191,0.3)",
    route: "daily",
    description:
      "Top Five, gratitude, battle plan and end-of-day reflection. Every day is a mission. This is your command post.",
    tier: "execution",
  },
  {
    id: "shadow-lab",
    name: "SHADOW LAB",
    sublabel: "Know thyself",
    icon: "🩸",
    color: "#FF3B5C",
    glow: "rgba(255,59,92,0.3)",
    route: "essence",
    description:
      "The shadow work lab. Unmask your patterns, return to your essence, and alchemise what was once your weakness into power.",
    tier: "execution",
  },

  // THE PILLARS — support structures
  {
    id: "the-vault",
    name: "THE VAULT",
    sublabel: "Claim your wins",
    icon: "💎",
    color: "#FACC15",
    glow: "rgba(250,204,21,0.3)",
    route: "rewards",
    description:
      "Your reward vault — proof of every promise you kept to yourself. Every entry here is evidence you are becoming who you said you would.",
    tier: "pillars",
  },
  {
    id: "war-council",
    name: "WAR COUNCIL",
    sublabel: "Review & reload",
    icon: "📡",
    color: "#FF3B5C",
    glow: "rgba(255,59,92,0.28)",
    route: "weekly",
    description:
      "Weekly scorecard — audit the week, reset the mission, and re-enter the next seven days sharper than before.",
    tier: "pillars",
  },
  {
    id: "stats-nexus",
    name: "STATS NEXUS",
    sublabel: "Track your power",
    icon: "📊",
    color: "#00F0FF",
    glow: "rgba(0,240,255,0.28)",
    route: "stats",
    description:
      "XP, rank, streaks and progress analytics. See how far the seeker has come and what the next level demands.",
    tier: "pillars",
  },
];

const TIER_META = {
  lore:      { label: "THE LORE QUARTER",  desc: "Story chapters — the seeker's origin" },
  core:      { label: "CORE DISTRICT",     desc: "Identity · training · vision" },
  execution: { label: "EXECUTION ZONE",    desc: "Projects · daily battle · shadow work" },
  pillars:   { label: "THE PILLARS",       desc: "Rewards · weekly review · stats" },
};

const TIER_ORDER = ["lore", "core", "execution", "pillars"];

/* ─── CSS ─────────────────────────────────────────────────────── */
const CSS = `
@keyframes sc-star {
  0%,100% { opacity: var(--lo,0.1); }
  50% { opacity: calc(var(--lo,0.1) * 3.5); }
}
@keyframes sc-city-glow {
  0%,100% { opacity: 0.4; }
  50% { opacity: 0.9; }
}
@keyframes sc-card-shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes sc-sheet-up {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes sc-fog {
  0%,100% { opacity: 0.55; }
  50% { opacity: 0.7; }
}
@keyframes sc-pulse-ring {
  0%   { transform: translate(-50%,-50%) scale(1); opacity: 0.6; }
  100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
}
`;

/* ─── Star field ──────────────────────────────────────────────── */
function StarField() {
  const stars = useRef(null);
  if (!stars.current) {
    stars.current = Array.from({ length: 72 }, (_, i) => ({
      x: (i * 137.508) % 100,
      y: (i * 97.3) % 100,
      s: 0.5 + (i % 4) * 0.45,
      dur: 1.8 + (i % 6) * 0.7,
      lo: 0.06 + (i % 4) * 0.06,
    }));
  }
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }} aria-hidden>
      {stars.current.map((st, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${st.x}%`, top: `${st.y}%`,
          width: st.s, height: st.s,
          borderRadius: "50%", background: "white",
          "--lo": st.lo,
          animation: `sc-star ${st.dur}s ${(i % 5) * 0.3}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

/* ─── City skyline SVG (decorative) ─────────────────────────────── */
function CitySkyline() {
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0,
      height: 120, pointerEvents: "none", zIndex: 1, overflow: "hidden",
    }}>
      <svg viewBox="0 0 390 120" width="100%" height="120" preserveAspectRatio="xMidYMax meet">
        <defs>
          <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,240,255,0.08)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
          <filter id="skyline-glow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Background sky wash */}
        <rect width="390" height="120" fill="url(#sky-grad)" />
        {/* Silhouetted buildings */}
        <g fill="rgba(8,5,25,0.85)" filter="url(#skyline-glow)">
          {/* Left cluster */}
          <rect x="0" y="80" width="22" height="40" rx="1" />
          <rect x="5" y="65" width="14" height="55" rx="1" />
          <rect x="22" y="88" width="18" height="32" rx="1" />
          <rect x="15" y="72" width="8" height="48" rx="1" />
          <rect x="40" y="75" width="20" height="45" rx="1" />
          <rect x="43" y="60" width="12" height="60" rx="1" />
          <rect x="60" y="85" width="16" height="35" rx="1" />
          <rect x="76" y="70" width="22" height="50" rx="1" />
          <rect x="80" y="55" width="10" height="65" rx="1" />
          {/* Center tower */}
          <rect x="178" y="40" width="34" height="80" rx="2" />
          <rect x="183" y="25" width="24" height="95" rx="2" />
          <rect x="190" y="10" width="10" height="110" rx="1" />
          {/* Right cluster */}
          <rect x="292" y="70" width="22" height="50" rx="1" />
          <rect x="296" y="55" width="10" height="65" rx="1" />
          <rect x="314" y="80" width="20" height="40" rx="1" />
          <rect x="334" y="65" width="24" height="55" rx="1" />
          <rect x="338" y="50" width="12" height="70" rx="1" />
          <rect x="358" y="75" width="18" height="45" rx="1" />
          <rect x="368" y="85" width="22" height="35" rx="1" />
        </g>
        {/* Window lights */}
        <g fill="rgba(0,240,255,0.55)">
          <rect x="7" y="68" width="2" height="2" rx="0.5" />
          <rect x="11" y="68" width="2" height="2" rx="0.5" />
          <rect x="7" y="74" width="2" height="2" rx="0.5" />
          <rect x="44" y="63" width="2" height="2" rx="0.5" />
          <rect x="48" y="63" width="2" height="2" rx="0.5" />
          <rect x="44" y="69" width="2" height="2" rx="0.5" />
          <rect x="81" y="58" width="2" height="2" rx="0.5" />
          <rect x="85" y="58" width="2" height="2" rx="0.5" />
        </g>
        <g fill="rgba(209,30,255,0.5)">
          <rect x="184" y="28" width="2" height="2" rx="0.5" />
          <rect x="188" y="28" width="2" height="2" rx="0.5" />
          <rect x="192" y="28" width="2" height="2" rx="0.5" />
          <rect x="184" y="35" width="2" height="2" rx="0.5" />
          <rect x="192" y="35" width="2" height="2" rx="0.5" />
          <rect x="297" y="58" width="2" height="2" rx="0.5" />
          <rect x="301" y="58" width="2" height="2" rx="0.5" />
          <rect x="339" y="53" width="2" height="2" rx="0.5" />
          <rect x="343" y="53" width="2" height="2" rx="0.5" />
          <rect x="339" y="59" width="2" height="2" rx="0.5" />
        </g>
        {/* City glow haze at horizon */}
        <ellipse cx="195" cy="120" rx="180" ry="30"
          fill="rgba(0,240,255,0.04)" />
      </svg>
    </div>
  );
}

/* ─── District card ───────────────────────────────────────────── */
function DistrictCard({ district, onSelect }) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={() => onSelect(district)}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 7,
        padding: "14px 10px 12px",
        background: pressed
          ? `linear-gradient(160deg, ${district.color}18 0%, rgba(8,5,22,0.95) 100%)`
          : "rgba(8,5,22,0.72)",
        border: `1px solid ${pressed ? district.color + "55" : district.color + "22"}`,
        borderRadius: 13,
        cursor: "pointer",
        transition: "all 0.18s ease",
        backdropFilter: "blur(10px)",
        boxShadow: pressed
          ? `0 0 22px ${district.glow}, inset 0 0 12px ${district.color}09`
          : `0 2px 10px rgba(0,0,0,0.4)`,
        transform: pressed ? "scale(0.97)" : "scale(1)",
        flex: "1 1 100px",
        minWidth: 100,
        maxWidth: 140,
      }}
    >
      {/* Building icon glow box */}
      <div style={{
        width: 46, height: 46,
        borderRadius: 10,
        background: `linear-gradient(135deg, ${district.color}16, ${district.color}07)`,
        border: `1px solid ${district.color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20,
        boxShadow: pressed ? `0 0 16px ${district.glow}` : "none",
        transition: "box-shadow 0.18s",
        flexShrink: 0,
      }}>
        {district.icon}
      </div>

      {/* Name */}
      <div style={{
        fontSize: 7.5,
        fontFamily: "var(--font-mono, monospace)",
        letterSpacing: "0.11em",
        textTransform: "uppercase",
        color: pressed ? district.color : "rgba(234,251,255,0.8)",
        lineHeight: 1.35,
        transition: "color 0.18s",
      }}>
        {district.name}
      </div>

      {/* Sublabel */}
      <div style={{
        fontSize: 7.5,
        fontFamily: "var(--font-body, sans-serif)",
        color: "rgba(234,251,255,0.3)",
        lineHeight: 1.3,
      }}>
        {district.sublabel}
      </div>

      {/* Chapter badge */}
      {district.chapter && (
        <div style={{
          position: "absolute",
          top: 6, right: 6,
          fontSize: 6.5,
          fontFamily: "var(--font-mono, monospace)",
          background: `${district.color}18`,
          border: `1px solid ${district.color}45`,
          borderRadius: 4,
          padding: "1px 5px",
          color: district.color,
          letterSpacing: "0.06em",
        }}>
          CH.{district.chapter}
        </div>
      )}

      {/* Bottom color accent line */}
      <div style={{
        position: "absolute",
        bottom: 0, left: "20%", right: "20%",
        height: 2,
        background: `linear-gradient(to right, transparent, ${district.color}50, transparent)`,
        borderRadius: "0 0 2px 2px",
        filter: pressed ? `blur(1px)` : "none",
      }} />
    </button>
  );
}

/* ─── District popup sheet ────────────────────────────────────── */
function DistrictSheet({ district, onEnter, onClose }) {
  if (!district) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(5px)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480,
          background: "linear-gradient(170deg, rgba(14,9,32,0.99) 0%, rgba(5,3,15,0.99) 100%)",
          border: `1px solid ${district.color}35`,
          borderRadius: "22px 22px 0 0",
          padding: "6px 0 0",
          boxShadow: `0 -10px 50px ${district.glow}`,
          animation: "sc-sheet-up 0.28s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {/* Drag handle */}
        <div style={{
          width: 36, height: 3.5, borderRadius: 99,
          background: "rgba(234,251,255,0.15)",
          margin: "0 auto 20px",
        }} />

        <div style={{ padding: "0 20px 32px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{
              width: 54, height: 54, borderRadius: 13, flexShrink: 0,
              background: `linear-gradient(135deg, ${district.color}20, ${district.color}08)`,
              border: `1px solid ${district.color}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 26,
              boxShadow: `0 0 18px ${district.glow}`,
            }}>
              {district.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 12,
                fontFamily: "var(--font-mono, monospace)",
                letterSpacing: "0.14em",
                color: district.color,
                textTransform: "uppercase",
                marginBottom: 3,
                textShadow: `0 0 10px ${district.glow}`,
              }}>
                {district.name}
              </div>
              <div style={{
                fontSize: 11,
                color: "rgba(234,251,255,0.45)",
                fontFamily: "var(--font-body, sans-serif)",
              }}>
                {district.sublabel}
              </div>
              {district.chapter && (
                <div style={{
                  marginTop: 4,
                  display: "inline-block",
                  fontSize: 8,
                  fontFamily: "var(--font-mono, monospace)",
                  background: `${district.color}18`,
                  border: `1px solid ${district.color}40`,
                  borderRadius: 5,
                  padding: "2px 8px",
                  color: district.color,
                  letterSpacing: "0.06em",
                }}>
                  CHAPTER {district.chapter}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none", border: "none",
                color: "rgba(234,251,255,0.3)", cursor: "pointer",
                fontSize: 20, padding: 6, lineHeight: 1,
                alignSelf: "flex-start",
              }}
            >✕</button>
          </div>

          {/* Description */}
          <p style={{
            fontSize: 13,
            color: "rgba(234,251,255,0.6)",
            fontFamily: "var(--font-body, sans-serif)",
            lineHeight: 1.75,
            margin: "0 0 22px",
            fontStyle: "italic",
          }}>
            {district.description}
          </p>

          {/* Enter button */}
          <button
            onClick={() => onEnter(district.route)}
            style={{
              width: "100%",
              padding: "15px",
              background: `linear-gradient(135deg, ${district.color}22, ${district.color}0d)`,
              border: `1px solid ${district.color}60`,
              borderRadius: 12,
              color: district.color,
              fontSize: 11,
              fontFamily: "var(--font-mono, monospace)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: `0 0 24px ${district.glow}`,
              textShadow: `0 0 8px ${district.glow}`,
            }}
          >
            ENTER DISTRICT ›
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Tier section ────────────────────────────────────────────── */
function TierSection({ tier, districts, onSelect }) {
  const meta = TIER_META[tier];

  // Lore tier color for the divider
  const accentColor =
    tier === "lore"      ? "#00F0FF" :
    tier === "core"      ? "#D11EFF" :
    tier === "execution" ? "#FF3EDB" : "#FACC15";

  return (
    <div style={{ marginBottom: 26 }}>
      {/* Section header — city street divider */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        marginBottom: 12,
      }}>
        <div style={{
          width: 3, height: 28, borderRadius: 99,
          background: `linear-gradient(to bottom, ${accentColor}, transparent)`,
          flexShrink: 0,
        }} />
        <div>
          <div style={{
            fontSize: 8.5, fontFamily: "var(--font-mono, monospace)",
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: accentColor,
            textShadow: `0 0 8px ${accentColor}60`,
          }}>
            {meta.label}
          </div>
          <div style={{
            fontSize: 8.5,
            color: "rgba(234,251,255,0.22)",
            fontFamily: "var(--font-body, sans-serif)",
            letterSpacing: "0.03em",
          }}>
            {meta.desc}
          </div>
        </div>
        <div style={{
          flex: 1, height: 1,
          background: `linear-gradient(to right, ${accentColor}30, transparent)`,
        }} />
      </div>

      {/* District cards row */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
      }}>
        {districts.map(d => (
          <DistrictCard key={d.id} district={d} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

/* ─── Seeker header ───────────────────────────────────────────── */
function SeekerHeader({ rankName, totalXP, todayComplete, activeEmpires }) {
  return (
    <div style={{
      position: "relative", zIndex: 10,
      padding: "110px 16px 12px",  // top padding leaves room for skyline
    }}>
      {/* City name */}
      <div style={{
        fontSize: 15,
        fontFamily: "var(--font-mono, monospace)",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "rgba(234,251,255,0.95)",
        textShadow: "0 0 14px rgba(0,240,255,0.5), 0 0 28px rgba(0,240,255,0.2)",
        marginBottom: 5,
      }}>
        SEEKER'S CITY
      </div>

      {/* Status bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
        fontSize: 8.5,
        fontFamily: "var(--font-mono, monospace)",
        letterSpacing: "0.09em",
      }}>
        <span style={{ color: todayComplete ? "#00FFBF" : "rgba(234,251,255,0.28)" }}>
          {todayComplete ? "🌅 CITY LIT" : "🌫 FOG ACTIVE"}
        </span>
        <span style={{ color: "rgba(234,251,255,0.2)" }}>·</span>
        <span style={{ color: "rgba(234,251,255,0.4)" }}>
          {activeEmpires} EMPIRE{activeEmpires !== 1 ? "S" : ""}
        </span>
        <span style={{ color: "rgba(234,251,255,0.2)" }}>·</span>
        <span style={{ color: "#FACC15" }}>⚡ {(totalXP || 0).toLocaleString()} XP</span>
        <span style={{ color: "rgba(234,251,255,0.2)" }}>·</span>
        <span style={{ color: "rgba(234,251,255,0.4)" }}>⚔ {rankName}</span>
      </div>
    </div>
  );
}

/* ─── Main SeekerCity ─────────────────────────────────────────── */
export default function SeekerCity({ onNavigate, onOpenProject }) {
  const { projects, dailyLogs } = useAppData();
  const { xp, rank } = useGamification();
  const [selected, setSelected] = useState(null);

  const todayComplete = useMemo(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const log = (dailyLogs || {})[today];
      if (!log) return false;
      return (log.topFive || []).length >= 5 && (log.topFive || []).every(t => t.done);
    } catch {
      return false;
    }
  }, [dailyLogs]);

  const activeEmpires = (projects || []).filter(p => p.status !== "completed").length;
  const rankName = rank?.name || "RECRUIT";

  const handleEnter = (route) => {
    setSelected(null);
    onNavigate(route);
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={{
        position: "relative",
        minHeight: "calc(100vh - 56px)",
        background: "radial-gradient(ellipse at 50% 15%, #0d0a28 0%, #060415 45%, #020108 100%)",
        overflow: "hidden",
      }}>
        <StarField />
        <CitySkyline />

        {/* Top horizon glow */}
        <div style={{
          position: "absolute", top: 80, left: 0, right: 0, height: 60,
          background: "radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.06) 0%, transparent 70%)",
          pointerEvents: "none", zIndex: 2,
        }} />

        <SeekerHeader
          rankName={rankName}
          totalXP={xp}
          todayComplete={todayComplete}
          activeEmpires={activeEmpires}
        />

        {/* District sections */}
        <div style={{
          position: "relative", zIndex: 5,
          padding: "4px 14px 32px",
        }}>
          {TIER_ORDER.map(tier => {
            const districts = DISTRICTS.filter(d => d.tier === tier);
            return (
              <TierSection
                key={tier}
                tier={tier}
                districts={districts}
                onSelect={setSelected}
              />
            );
          })}
        </div>

        {/* Ground line */}
        <div style={{
          position: "absolute", bottom: 0, left: "50%",
          transform: "translateX(-50%)",
          width: "85%", height: 1,
          background: "linear-gradient(to right, transparent, rgba(0,240,255,0.18), rgba(209,30,255,0.18), transparent)",
          filter: "blur(2px)",
        }} />
      </div>

      {selected && (
        <DistrictSheet
          district={selected}
          onEnter={handleEnter}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

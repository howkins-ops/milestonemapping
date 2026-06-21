import React, { useState, useRef, useEffect } from "react";
import { useAppData } from "../../hooks/useAppData.js";
import { playStreak, playSound } from "../../lib/sounds.js";
import ScienceInfo from "../ui/ScienceInfo.jsx";

const BOOSTERS = [
  {
    id: "screens",
    label: "Screens off / blue-light mode",
    science: "Blue light suppresses melatonin for 3+ hours. Dim or filter 30 min before bed.",
    source: "Harvard Medical School, Sleep & Light Research"
  },
  {
    id: "temp",
    label: "Cool room (65–68°F / 18–20°C)",
    science: "Core body temp must drop 1–2°F to initiate sleep. Cool rooms accelerate this.",
    source: "Walker, Why We Sleep (2017)"
  },
  {
    id: "caffeine",
    label: "No caffeine after 2pm",
    science: "Caffeine has a 6-hr half-life. A 3pm coffee still has half its dose in your system at 9pm.",
    source: "Journal of Sleep Research, 2023"
  },
  {
    id: "plan",
    label: "Tomorrow's plan is loaded",
    science: "Writing down tomorrow's tasks reduces pre-sleep cognitive arousal — the main cause of lying awake thinking.",
    source: "Baylor University, Journal of Experimental Psychology (2018)"
  },
  {
    id: "alcohol",
    label: "Skipped alcohol tonight",
    science: "Alcohol blocks REM sleep and fragments the second half of the night — even small amounts.",
    source: "Alcoholism: Clinical & Experimental Research"
  },
  {
    id: "wind",
    label: "Body is relaxed (breath / stretch)",
    science: "Slow nasal breathing activates the parasympathetic nervous system, dropping heart rate and cortisol.",
    source: "Frontiers in Psychology, Breathwork Studies"
  },
  {
    id: "time",
    label: "Consistent sleep time tonight",
    science: "Irregular sleep timing disrupts circadian rhythm as much as losing 2 hrs of sleep per night.",
    source: "Sleep Medicine Reviews, Circadian Regularity Studies"
  }
];

const TIERS = [
  { min: 7, label: "Peak recovery mode.",    color: "#00FFBF" },
  { min: 5, label: "Strong stack tonight.",  color: "#00F0FF" },
  { min: 3, label: "Solid foundation.",      color: "#8B5CF6" },
  { min: 1, label: "Good start.",            color: "rgba(242,240,244,0.45)" },
];

// Counter-Strike-style streak callouts, indexed by combo level (1 → 7+).
const COMBO_TIERS = [
  { word: "LOCKED IN",    sub: "first stack", color: "#00F0FF" },
  { word: "DOUBLE STACK", sub: "nice",        color: "#00F0FF" },
  { word: "TRIPLE STACK", sub: "on a roll",   color: "#00FFBF" },
  { word: "MULTI STACK",  sub: "great shot",  color: "#00FFBF" },
  { word: "DOMINATING",   sub: "incredible",  color: "#D11EFF" },
  { word: "UNSTOPPABLE",  sub: "rampage",     color: "#FF3EDB" },
  { word: "GOD MODE",     sub: "peak recovery", color: "#FFE25A" },
];

// Stack two activations within this window to keep the combo alive.
const COMBO_WINDOW = 4500;
const BASE_POINTS = 100;

export default function BedtimeChecklist() {
  const { settings } = useAppData();

  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("bedtime_checks") || "{}"); }
    catch { return {}; }
  });
  const [points, setPoints] = useState(() => {
    try { return Number(sessionStorage.getItem("bedtime_points")) || 0; }
    catch { return 0; }
  });
  const [expandedId, setExpandedId] = useState(null);
  const [callout, setCallout] = useState(null);
  const [gainPop, setGainPop] = useState(null);

  const pointsRef = useRef(points);
  const comboRef = useRef({ count: 0, lastTs: 0 });
  const idRef = useRef(0);

  // Auto-dismiss the transient overlays (new id each fire → effect re-runs).
  useEffect(() => {
    if (!callout) return undefined;
    const t = setTimeout(() => setCallout(null), 1200);
    return () => clearTimeout(t);
  }, [callout]);

  useEffect(() => {
    if (!gainPop) return undefined;
    const t = setTimeout(() => setGainPop(null), 950);
    return () => clearTimeout(t);
  }, [gainPop]);

  const toggle = (id) => {
    const turningOn = !checked[id];
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    try { sessionStorage.setItem("bedtime_checks", JSON.stringify(next)); } catch {}

    // Un-checking never punishes — keep points and combo, just a soft click.
    if (!turningOn) {
      playSound("click", settings);
      return;
    }

    const now = Date.now();
    const c = comboRef.current;
    c.count = (now - c.lastTs <= COMBO_WINDOW) ? c.count + 1 : 1;
    c.lastTs = now;

    const level = Math.min(c.count, COMBO_TIERS.length);
    const tierDef = COMBO_TIERS[level - 1];
    const gain = BASE_POINTS * level;

    const np = pointsRef.current + gain;
    pointsRef.current = np;
    setPoints(np);
    try { sessionStorage.setItem("bedtime_points", String(np)); } catch {}

    idRef.current += 1;
    const uid = idRef.current;
    setCallout({ id: uid, ...tierDef, level, combo: c.count, gain });
    setGainPop({ id: uid, amount: gain });
    playStreak(level, settings);
  };

  const activeCount = Object.values(checked).filter(Boolean).length;
  const tier = TIERS.find((t) => activeCount >= t.min) || null;

  return (
    <section className="bedtime-section anim-fade-in">

      <ScienceInfo ids={["sleep"]} />

      {callout && (
        <div
          key={callout.id}
          className="bedtime-callout"
          style={{ "--callout-color": callout.color }}
          aria-hidden="true"
        >
          <span className="bedtime-callout-word">{callout.word}</span>
          <span className="bedtime-callout-sub">
            {callout.combo > 1 && (
              <span className="bedtime-callout-combo">×{callout.combo}</span>
            )}
            {callout.sub} · +{callout.gain}
          </span>
        </div>
      )}

      <div className="bedtime-header">
        <div className="bedtime-header-top">
          <span className="bedtime-badge">SLEEP BOOSTERS</span>
          <div className="bedtime-meta">
            {activeCount > 0 && (
              <span className="bedtime-active-count" style={{ color: tier?.color }}>
                {activeCount} active
              </span>
            )}
            <span className="bedtime-points">
              <span className="bedtime-points-val">{points.toLocaleString()}</span>
              <span className="bedtime-points-label">EDGE</span>
              {gainPop && (
                <span key={gainPop.id} className="bedtime-points-pop">+{gainPop.amount}</span>
              )}
            </span>
          </div>
        </div>
        <h3 className="bedtime-title">Stack your edge.</h3>
        <p className="bedtime-sub">
          Options, not obligations — activate what fits tonight. Every one compounds your recovery.
        </p>
      </div>

      <ul className="bedtime-list">
        {BOOSTERS.map((item) => {
          const isChecked = !!checked[item.id];
          const isExpanded = expandedId === item.id;
          return (
            <li key={item.id} className={`bedtime-item ${isChecked ? "is-checked" : ""}`}>
              <button
                type="button"
                className={`bedtime-checkbox ${isChecked ? "is-on" : ""}`}
                onClick={() => toggle(item.id)}
                aria-label={isChecked ? `Deactivate: ${item.label}` : `Activate: ${item.label}`}
              >
                {isChecked ? "✓" : ""}
              </button>

              <div className="bedtime-item-content">
                <button
                  type="button"
                  className="bedtime-item-label"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  {item.label}
                  <span className="bedtime-item-expand">{isExpanded ? "−" : "+"}</span>
                </button>

                {isExpanded && (
                  <div className="bedtime-science anim-slide-up">
                    <p className="bedtime-science-text">{item.science}</p>
                    <p className="bedtime-science-source">— {item.source}</p>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {tier && (
        <div className="bedtime-tier anim-fade-in" style={{ "--tier-color": tier.color }}>
          <span className="bedtime-tier-dot" />
          <span className="bedtime-tier-label">{tier.label}</span>
        </div>
      )}

    </section>
  );
}

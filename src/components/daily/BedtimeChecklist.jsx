import React, { useState } from "react";

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

export default function BedtimeChecklist() {
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("bedtime_checks") || "{}"); }
    catch { return {}; }
  });
  const [expandedId, setExpandedId] = useState(null);

  const toggle = (id) => {
    const next = { ...checked, [id]: !checked[id] };
    setChecked(next);
    try { sessionStorage.setItem("bedtime_checks", JSON.stringify(next)); } catch {}
  };

  const activeCount = Object.values(checked).filter(Boolean).length;
  const tier = TIERS.find((t) => activeCount >= t.min) || null;

  return (
    <section className="bedtime-section anim-fade-in">

      <div className="bedtime-header">
        <div className="bedtime-header-top">
          <span className="bedtime-badge">SLEEP BOOSTERS</span>
          {activeCount > 0 && (
            <span className="bedtime-active-count" style={{ color: tier?.color }}>
              {activeCount} active
            </span>
          )}
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

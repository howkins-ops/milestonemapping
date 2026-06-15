import React, { useState } from "react";
import RewardChest from "./RewardChest.jsx";
import { useAppData } from "../../hooks/useAppData.js";

const TABS = [
  { id: "mindmap",    icon: "🗺️", label: "Mind Map"  },
  { id: "focus",      icon: "⚡",  label: "Focus"     },
  { id: "resources",  icon: "📚", label: "Resources" },
  { id: "reflection", icon: "🔮", label: "Reflection"},
  { id: "rewards",    icon: "💎", label: "Rewards"   },
];

function MindMapPanel({ milestone, project }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(0,240,255,0.6)", marginBottom: 4 }}>MILESTONE CONTEXT</p>
      <p style={{ fontSize: 13.5, color: "rgba(234,251,255,0.85)", lineHeight: 1.6 }}>
        {milestone.description || milestone.title}
      </p>
      {milestone.whyItMatters && (
        <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(250,204,21,0.06)", border: "1px solid rgba(250,204,21,0.18)" }}>
          <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(250,204,21,0.6)", marginBottom: 4 }}>WHY IT MATTERS</p>
          <p style={{ fontSize: 13, color: "rgba(234,251,255,0.75)", lineHeight: 1.5 }}>{milestone.whyItMatters}</p>
        </div>
      )}
      {project && (
        <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(0,240,255,0.04)", border: "1px solid rgba(0,240,255,0.12)" }}>
          <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(0,240,255,0.5)", marginBottom: 4 }}>PROJECT GOAL</p>
          <p style={{ fontSize: 13, color: "rgba(234,251,255,0.7)", lineHeight: 1.5 }}>{project.futureVision || project.title}</p>
        </div>
      )}
    </div>
  );
}

function FocusPanel({ milestone, onToggleAction }) {
  const actions = milestone.actions || [];
  const firstUncompleted = actions.find((a) => !a.done);

  if (!firstUncompleted) {
    return (
      <div style={{ textAlign: "center", padding: "12px 0", color: "rgba(0,255,191,0.8)", fontSize: 14, fontWeight: 700 }}>
        ✅ All actions complete!
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(0,240,255,0.6)", marginBottom: 10 }}>CURRENT FOCUS</p>
      <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(0,240,255,0.06)", border: "1.5px solid rgba(0,240,255,0.25)" }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.5, marginBottom: 12 }}>
          {firstUncompleted.text}
        </p>
        <button
          onClick={() => onToggleAction(firstUncompleted.id)}
          style={{
            padding: "9px 20px", borderRadius: 9, border: "1px solid rgba(0,255,191,0.4)",
            background: "rgba(0,255,191,0.1)", color: "#00FFBF",
            fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.07em"
          }}
        >
          ✓ Mark Complete
        </button>
      </div>
    </div>
  );
}

function ResourcesPanel({ milestone, onUpdateNotes }) {
  const [notes, setNotes] = useState(milestone.notes || "");
  const [saved, setSaved] = useState(true);

  const handleChange = (e) => {
    setNotes(e.target.value);
    setSaved(false);
  };

  const handleBlur = () => {
    onUpdateNotes(notes);
    setSaved(true);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(0,240,255,0.6)" }}>NOTES & RESOURCES</p>
        {!saved && <span style={{ fontSize: 10, color: "rgba(250,204,21,0.7)" }}>Unsaved…</span>}
        {saved && notes && <span style={{ fontSize: 10, color: "rgba(0,255,191,0.6)" }}>✓ Saved</span>}
      </div>
      <textarea
        value={notes}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Add notes, links, resources, or reflections…"
        rows={4}
        style={{
          width: "100%", background: "rgba(0,240,255,0.04)", border: "1px solid rgba(0,240,255,0.18)",
          borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "#fff",
          resize: "vertical", outline: "none", fontFamily: "inherit", lineHeight: 1.6,
          boxSizing: "border-box"
        }}
      />
    </div>
  );
}

function ReflectionPanel({ milestone }) {
  const hasIdentity = milestone.oldIdentity || milestone.newIdentity;
  const hasFutureVision = milestone.futureVision;

  if (!hasIdentity && !hasFutureVision) {
    return (
      <p style={{ fontSize: 13, color: "rgba(234,251,255,0.4)", fontStyle: "italic", textAlign: "center", padding: "8px 0" }}>
        No identity transformation set for this milestone.
      </p>
    );
  }

  return (
    <div>
      <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(0,240,255,0.6)", marginBottom: 10 }}>IDENTITY SHIFT</p>
      {hasIdentity && (
        <div className="rpg-identity-flip">
          <div className="rpg-identity-flip__card is-old">
            <div className="rpg-identity-flip__label">I used to be</div>
            <p className="rpg-identity-flip__text">{milestone.oldIdentity || "—"}</p>
          </div>
          <span className="rpg-identity-flip__arrow">→</span>
          <div className="rpg-identity-flip__card is-new">
            <div className="rpg-identity-flip__label">I am becoming</div>
            <p className="rpg-identity-flip__text">{milestone.newIdentity || "—"}</p>
          </div>
        </div>
      )}
      {hasFutureVision && (
        <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 10, background: "rgba(0,240,255,0.04)", border: "1px solid rgba(0,240,255,0.12)" }}>
          <p style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(0,240,255,0.5)", marginBottom: 4 }}>FUTURE VISION</p>
          <p style={{ fontSize: 13, color: "rgba(234,251,255,0.75)", lineHeight: 1.5 }}>{milestone.futureVision}</p>
        </div>
      )}
    </div>
  );
}

export default function BottomActionBar({ milestone, project, onToggleAction, onUpdateNotes }) {
  const [activeTab, setActiveTab] = useState(null);

  const toggleTab = (tabId) => setActiveTab((prev) => (prev === tabId ? null : tabId));

  const renderPanel = () => {
    if (!activeTab) return null;
    switch (activeTab) {
      case "mindmap":    return <MindMapPanel milestone={milestone} project={project} />;
      case "focus":      return <FocusPanel milestone={milestone} onToggleAction={onToggleAction} />;
      case "resources":  return <ResourcesPanel milestone={milestone} onUpdateNotes={onUpdateNotes} />;
      case "reflection": return <ReflectionPanel milestone={milestone} />;
      case "rewards":    return <RewardChest milestone={milestone} />;
      default:           return null;
    }
  };

  return (
    <div className="rpg-bottom-bar">
      <div className="rpg-bottom-bar__tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`rpg-bottom-bar__tab${activeTab === tab.id ? " is-active" : ""}`}
            onClick={() => toggleTab(tab.id)}
            type="button"
          >
            <span className="rpg-bottom-bar__tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab && (
        <div className="rpg-bottom-bar__panel">
          {renderPanel()}
        </div>
      )}
    </div>
  );
}

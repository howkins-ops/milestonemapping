import React, { useState } from "react";
import RewardChest from "./RewardChest.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import NotesPanel from "../milestone-world/NotesPanel.jsx";
import CurrentObjectivePanel from "../milestone-world/CurrentObjectivePanel.jsx";

const TABS = [
  { id: "mindmap",    icon: "🗺️", label: "Mind Map"  },
  { id: "focus",      icon: "⚡",  label: "Focus"     },
  { id: "resources",  icon: "📚", label: "Resources" },
  { id: "reflection", icon: "🔮", label: "Reflection"},
  { id: "rewards",    icon: "💎", label: "Rewards"   },
];


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
      case "mindmap":    return <CurrentObjectivePanel milestone={milestone} project={project} />;
      case "focus":      return <FocusPanel milestone={milestone} onToggleAction={onToggleAction} />;
      case "resources":  return <NotesPanel milestone={milestone} onUpdateNotes={onUpdateNotes} />;
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

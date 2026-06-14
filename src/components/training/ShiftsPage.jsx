import React, { useState, useEffect } from "react";
import ShiftLevel from "./ShiftLevel.jsx";
import { SHIFTS, loadShiftsState, saveShiftsState, isShiftUnlocked } from "../../data/shiftsData.js";

function ShiftNodeButton({ shift, status, onClick }) {
  const isLocked = status === "locked";
  const isComplete = status === "complete";
  const isAvailable = status === "available";

  return (
    <button
      className={`shift-node-btn${isAvailable ? " available" : ""}${isComplete ? " complete" : ""}`}
      onClick={isLocked ? undefined : onClick}
      style={{
        opacity: isLocked ? 0.45 : 1,
        cursor: isLocked ? "default" : "pointer"
      }}
    >
      {/* Icon circle */}
      <div
        className={`shift-node-icon${isLocked ? " locked" : isAvailable ? " available" : " complete"}`}
        style={
          isLocked ? {} :
          isAvailable ? { background: `${shift.color}18`, borderColor: shift.color } :
          { background: `${shift.color}20`, borderColor: `${shift.color}60`, boxShadow: `0 0 16px ${shift.color}40` }
        }
      >
        {isLocked ? "🔒" : isComplete ? "✓" : shift.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: isLocked ? "rgba(234,251,255,0.25)" : shift.color,
          marginBottom: 3
        }}>
          {shift.label}
        </div>
        <div style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 16,
          color: isLocked ? "rgba(234,251,255,0.3)" : "#eafbff",
          marginBottom: 2
        }}>
          {shift.title}
        </div>
        <div style={{
          fontSize: 12,
          color: isLocked ? "rgba(234,251,255,0.2)" : "rgba(234,251,255,0.5)"
        }}>
          {isComplete ? "✓ Complete" : isLocked ? "Complete previous shift to unlock" : shift.subtitle}
        </div>
      </div>

      {/* Arrow / XP */}
      <div style={{
        flexShrink: 0,
        textAlign: "right"
      }}>
        {isComplete && (
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "#00FFBF",
            marginBottom: 2
          }}>
            +{shift.xp} XP
          </div>
        )}
        {!isLocked && !isComplete && (
          <div style={{ fontSize: 18, color: shift.color }}>›</div>
        )}
        {isLocked && (
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.15)" }}>›</div>
        )}
      </div>
    </button>
  );
}

export default function ShiftsPage() {
  const [shiftsState, setShiftsState] = useState(() => loadShiftsState());
  const [activeShift, setActiveShift] = useState(null);

  const completed = shiftsState.completed || [];

  const totalXP = SHIFTS
    .filter(s => completed.includes(s.id))
    .reduce((sum, s) => sum + s.xp, 0);

  const overallPercent = Math.round((completed.length / SHIFTS.length) * 100);

  const handleShiftComplete = (shiftId, artifacts) => {
    setShiftsState(prev => {
      const nextCompleted = prev.completed
        ? [...new Set([...prev.completed, shiftId])]
        : [shiftId];
      const nextArtifacts = { ...(prev.artifacts || {}), [shiftId]: artifacts };
      const next = { ...prev, completed: nextCompleted, artifacts: nextArtifacts };
      saveShiftsState(next);
      return next;
    });
  };

  const getStatus = (shiftId, index) => {
    if (completed.includes(shiftId)) return "complete";
    if (isShiftUnlocked(shiftId, completed)) return "available";
    return "locked";
  };

  if (activeShift) {
    return (
      <ShiftLevel
        module={activeShift}
        onClose={() => setActiveShift(null)}
        onShiftComplete={handleShiftComplete}
      />
    );
  }

  return (
    <div className="shifts-hub anim-fade-in">
      {/* Header */}
      <header className="page-header">
        <div className="page-header__kicker" style={{ color: "var(--brand-pink)" }}>
          TRANSFORMATION TRAINING
        </div>
        <h1 className="page-header__title">The 5 Shifts</h1>
        <p className="page-header__sub">
          Five levels. One new identity. Zero fluff.
        </p>

        {/* Overall progress */}
        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 5, borderRadius: 3, background: "var(--panel)", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${overallPercent}%`,
              background: "linear-gradient(90deg, #FF3EDB, #8B5CF6, #00F0FF)",
              borderRadius: 3,
              transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
              boxShadow: "0 0 12px rgba(255,62,219,0.5)"
            }} />
          </div>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "rgba(234,251,255,0.5)",
            whiteSpace: "nowrap",
            minWidth: 56
          }}>
            {completed.length} / {SHIFTS.length}
          </div>
        </div>

        {totalXP > 0 && (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 10,
            padding: "4px 12px",
            borderRadius: 100,
            background: "rgba(250,204,21,0.1)",
            border: "1px solid rgba(250,204,21,0.25)"
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#FACC15", fontFamily: "var(--font-mono)" }}>
              +{totalXP} XP earned
            </span>
          </div>
        )}
      </header>

      {/* Level map */}
      <div style={{ padding: "0 0 40px" }}>
        {SHIFTS.map((shift, i) => {
          const status = getStatus(shift.id, i);
          const isLit = i > 0 && completed.includes(SHIFTS[i - 1].id);

          return (
            <div key={shift.id} className="shift-node-wrap">
              {/* Connector line from above */}
              {i > 0 && (
                <div className={`shift-connector${isLit ? " lit" : ""}`} />
              )}

              <div style={{ width: "100%", padding: "0 0" }}>
                <ShiftNodeButton
                  shift={shift}
                  status={status}
                  onClick={() => setActiveShift(shift)}
                />
              </div>
            </div>
          );
        })}

        {/* Completion message */}
        {completed.length === SHIFTS.length && (
          <div style={{
            marginTop: 32,
            padding: "20px",
            borderRadius: 14,
            border: "1px solid rgba(0,255,191,0.2)",
            background: "rgba(0,255,191,0.04)",
            textAlign: "center",
            animation: "anim-fade-in 0.5s ease both"
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
            <div style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 16,
              color: "#00FFBF",
              marginBottom: 6
            }}>
              All 5 Shifts Complete
            </div>
            <p style={{ fontSize: 13, color: "rgba(234,251,255,0.5)", margin: 0 }}>
              You've built the foundation. Now go build the proof.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

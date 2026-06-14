import React, { useEffect, useState } from "react";

const CONFETTI_COLORS = ["#FF3EDB", "#00F0FF", "#00FFBF", "#8B5CF6", "#FACC15"];

function Particle({ color, index }) {
  const style = {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: color,
    top: "50%",
    left: "50%",
    animation: `particle-drift ${2 + (index % 3) * 0.4}s ease-out both`,
    animationDelay: `${index * 0.06}s`,
    "--dx": `${(Math.sin(index * 1.7) * 60)}px`,
    transform: `translateX(${Math.cos(index * 0.8) * 100}px) translateY(${Math.sin(index * 1.2) * 80}px)`
  };
  return <div style={style} />;
}

export default function ShiftComplete({ module, artifacts, onDone, onReplay }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const artifactSummary = getArtifactSummary(module.id, artifacts);

  return (
    <div className="complete-overlay">
      {/* Background glow */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse at center, ${module.glow} 0%, transparent 70%)`,
        pointerEvents: "none"
      }} />

      {/* Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Particle key={i} color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]} index={i} />
      ))}

      {/* Content */}
      <div className="complete-burst" style={{ position: "relative", zIndex: 1 }}>
        {/* Shift icon */}
        <div style={{
          fontSize: 56,
          marginBottom: 12,
          animation: "scale-pop 0.6s cubic-bezier(0.16,1,0.3,1) both"
        }}>
          {module.icon}
        </div>

        {/* "COMPLETE" badge */}
        <div style={{
          display: "inline-block",
          padding: "4px 14px",
          borderRadius: 100,
          border: `1px solid ${module.color}66`,
          background: `${module.color}15`,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.14em",
          color: module.color,
          marginBottom: 16
        }}>
          Shift Complete
        </div>

        <h1 style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: 36,
          color: "#eafbff",
          margin: "0 0 8px",
          textShadow: `0 0 30px ${module.color}80`
        }}>
          {module.title}
        </h1>

        <p style={{
          fontSize: 15,
          color: "rgba(234,251,255,0.6)",
          marginBottom: 28,
          maxWidth: 280,
          lineHeight: 1.5
        }}>
          {module.subtitle}
        </p>

        {/* Artifact summary */}
        {artifactSummary && (
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: "14px 20px",
            marginBottom: 24,
            maxWidth: 320
          }}>
            {artifactSummary}
          </div>
        )}

        {/* XP badge */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          marginBottom: 36
        }}>
          <div style={{
            padding: "8px 20px",
            borderRadius: 100,
            background: "rgba(250,204,21,0.12)",
            border: "1px solid rgba(250,204,21,0.3)",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 18,
            color: "#FACC15"
          }}>
            +{module.xp} XP
          </div>
        </div>

        {/* CTA buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", maxWidth: 280 }}>
          <button
            onClick={onDone}
            style={{
              padding: "16px",
              borderRadius: 12,
              border: "none",
              background: module.color,
              color: "#000",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
              letterSpacing: "0.04em"
            }}
          >
            Return to Map →
          </button>
          <button
            onClick={onReplay}
            style={{
              padding: "12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              color: "rgba(234,251,255,0.5)",
              fontFamily: "var(--font-body)",
              fontSize: 14,
              cursor: "pointer"
            }}
          >
            Replay Training
          </button>
        </div>
      </div>
    </div>
  );
}

function getArtifactSummary(shiftId, artifacts) {
  if (!artifacts) return null;

  if (shiftId === "intro" && artifacts.challenges?.length) {
    return (
      <div>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#FF3EDB", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Your Shifts to Make
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {artifacts.challenges.map(c => (
            <span key={c} style={{ fontSize: 12, color: "rgba(234,251,255,0.7)", background: "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 100 }}>{c}</span>
          ))}
        </div>
      </div>
    );
  }

  if (shiftId === "shift1" && artifacts.values?.length) {
    return (
      <div>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#00F0FF", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Your Foundation
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          {artifacts.values.map((v, i) => (
            <span key={v} style={{ fontSize: 13, fontWeight: 700, color: "#eafbff" }}>
              {i > 0 && <span style={{ color: "rgba(234,251,255,0.3)", marginRight: 8 }}>·</span>}
              {v}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (shiftId === "shift2" && artifacts.newIdentity) {
    return (
      <div>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#00FFBF", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Your New Identity
        </div>
        <p style={{ fontSize: 13, color: "rgba(234,251,255,0.8)", fontStyle: "italic", lineHeight: 1.5, margin: 0 }}>
          "{artifacts.newIdentity}"
        </p>
      </div>
    );
  }

  if (shiftId === "shift3" && artifacts.essence) {
    return (
      <div>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#8B5CF6", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Your Essence
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#eafbff", fontFamily: "var(--font-display)" }}>
          {artifacts.essence}
        </div>
      </div>
    );
  }

  if (shiftId === "shift4") {
    return (
      <div>
        <div style={{ fontSize: 13, color: "rgba(234,251,255,0.7)", lineHeight: 1.5 }}>
          All 3 myths exposed. You see clearly now.
        </div>
      </div>
    );
  }

  return null;
}

import React, { useState } from "react";

export default function IdentityGame({ module, onComplete }) {
  const [phase, setPhase] = useState("old"); // "old" | "transform" | "new" | "reveal"
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");

  const handleOldSubmit = () => {
    if (!oldText.trim()) return;
    setPhase("transform");
    setTimeout(() => setPhase("new"), 1200);
  };

  const handleNewSubmit = () => {
    if (!newText.trim()) return;
    setPhase("reveal");
  };

  const handleComplete = () => {
    onComplete({ oldIdentity: oldText, newIdentity: newText });
  };

  return (
    <div className="game-overlay">
      <div className="game-inner">
        <div className="game-header">
          <div className="game-title-block">
            <div className="game-kicker" style={{ color: module.color }}>
              {module.label} · Identity Shift
            </div>
            <h2 className="game-title">The Transformation</h2>
          </div>
        </div>

        <div className="game-body">
          {/* PHASE: OLD */}
          {phase === "old" && (
            <div style={{ animation: "game-enter 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>
              <div style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: 100,
                background: "rgba(255,59,92,0.12)",
                border: "1px solid rgba(255,59,92,0.3)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#ff3b5c",
                marginBottom: 16
              }}>
                The Old Way
              </div>

              <p className="game-subtitle">
                Finish this sentence honestly. Who were you pretending to be?
              </p>

              <div style={{
                marginBottom: 8,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "rgba(234,251,255,0.4)"
              }}>
                "I am someone who..."
              </div>

              <textarea
                value={oldText}
                onChange={e => setOldText(e.target.value)}
                placeholder="...keeps starting but never finishing"
                rows={4}
                style={{
                  width: "100%",
                  background: "rgba(255,59,92,0.06)",
                  border: "1px solid rgba(255,59,92,0.25)",
                  borderRadius: 12,
                  padding: "14px 16px",
                  color: "rgba(234,251,255,0.8)",
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  lineHeight: 1.6,
                  resize: "none",
                  outline: "none"
                }}
                onFocus={e => e.target.style.borderColor = "rgba(255,59,92,0.5)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,59,92,0.25)"}
              />

              <p style={{ fontSize: 12, color: "rgba(234,251,255,0.3)", marginTop: 8 }}>
                Be honest. No one else sees this.
              </p>
            </div>
          )}

          {/* PHASE: TRANSFORM ANIMATION */}
          {phase === "transform" && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 16,
                color: "rgba(234,251,255,0.5)",
                animation: "identity-burn 1.2s ease-in-out forwards",
                fontStyle: "italic"
              }}>
                "{oldText}"
              </div>
              <div style={{
                marginTop: 24,
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: module.color,
                letterSpacing: "0.1em"
              }}>
                Transforming...
              </div>
            </div>
          )}

          {/* PHASE: NEW */}
          {phase === "new" && (
            <div style={{ animation: "game-enter 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
              <div style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: 100,
                background: `${module.color}15`,
                border: `1px solid ${module.color}40`,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: module.color,
                marginBottom: 16
              }}>
                The New Way
              </div>

              <p className="game-subtitle">
                Now write who you're becoming. Write it as if it's already true.
              </p>

              <div style={{
                marginBottom: 8,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "rgba(234,251,255,0.4)"
              }}>
                "I am someone who..."
              </div>

              <textarea
                autoFocus
                value={newText}
                onChange={e => setNewText(e.target.value)}
                placeholder="...follows through on every commitment I make to myself"
                rows={4}
                style={{
                  width: "100%",
                  background: `${module.color}08`,
                  border: `1px solid ${module.color}30`,
                  borderRadius: 12,
                  padding: "14px 16px",
                  color: "#eafbff",
                  fontFamily: "var(--font-body)",
                  fontSize: 15,
                  lineHeight: 1.6,
                  resize: "none",
                  outline: "none"
                }}
                onFocus={e => e.target.style.borderColor = `${module.color}60`}
                onBlur={e => e.target.style.borderColor = `${module.color}30`}
              />

              <p style={{ fontSize: 12, color: "rgba(234,251,255,0.3)", marginTop: 8 }}>
                This is the identity you're building toward.
              </p>
            </div>
          )}

          {/* PHASE: REVEAL */}
          {phase === "reveal" && (
            <div style={{ animation: "game-enter 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "rgba(255,59,92,0.5)",
                  marginBottom: 6
                }}>Before</div>
                <div style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,59,92,0.15)",
                  background: "rgba(255,59,92,0.04)",
                  fontStyle: "italic",
                  fontSize: 14,
                  color: "rgba(234,251,255,0.35)",
                  textDecoration: "line-through",
                  textDecorationColor: "rgba(255,59,92,0.4)"
                }}>
                  "{oldText}"
                </div>
              </div>

              <div style={{ textAlign: "center", fontSize: 20, marginBottom: 16, color: module.color }}>↓</div>

              <div>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: module.color,
                  marginBottom: 6
                }}>Becoming</div>
                <div style={{
                  padding: "16px",
                  borderRadius: 12,
                  border: `1px solid ${module.color}40`,
                  background: `${module.color}08`,
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 16,
                  color: "#eafbff",
                  lineHeight: 1.5,
                  textShadow: `0 0 20px ${module.color}40`,
                  animation: "identity-materialise 0.8s cubic-bezier(0.16,1,0.3,1) both"
                }}>
                  "{newText}"
                </div>
              </div>

              <div style={{
                marginTop: 20,
                textAlign: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "rgba(234,251,255,0.4)",
                letterSpacing: "0.08em"
              }}>
                The transformation is written.
              </div>
            </div>
          )}
        </div>

        {/* CTA varies by phase */}
        {phase === "old" && (
          <button
            className="game-cta"
            disabled={!oldText.trim()}
            onClick={handleOldSubmit}
            style={{
              background: oldText.trim() ? "#ff3b5c" : "rgba(255,255,255,0.06)",
              color: oldText.trim() ? "#fff" : "rgba(234,251,255,0.3)"
            }}
          >
            That Was The Old Me →
          </button>
        )}
        {phase === "new" && (
          <button
            className="game-cta"
            disabled={!newText.trim()}
            onClick={handleNewSubmit}
            style={{
              background: newText.trim() ? module.color : "rgba(255,255,255,0.06)",
              color: newText.trim() ? "#000" : "rgba(234,251,255,0.3)"
            }}
          >
            Write The New Identity →
          </button>
        )}
        {phase === "reveal" && (
          <button
            className="game-cta"
            onClick={handleComplete}
            style={{ background: module.color, color: "#000" }}
          >
            I Claim This Identity →
          </button>
        )}
      </div>
    </div>
  );
}

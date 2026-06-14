import React, { useState } from "react";
import { maskCards } from "../../../data/maskCards.js";
import { essenceCards } from "../../../data/essenceCards.js";

const MASK_PALETTE_FALLBACK = ["#4b2477", "#572047", "#103e73", "#721827", "#165d68"];

export default function MasksGame({ module, onComplete }) {
  const [phase, setPhase] = useState("masks"); // "masks" | "essence" | "reveal"
  const [selectedMasks, setSelectedMasks] = useState([]);
  const [selectedEssence, setSelectedEssence] = useState(null);

  const toggleMask = (id) => {
    setSelectedMasks(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const handleMasksSubmit = () => {
    if (!selectedMasks.length) return;
    setPhase("essence");
  };

  const handleEssenceSubmit = () => {
    if (!selectedEssence) return;
    setPhase("reveal");
  };

  const handleComplete = () => {
    const essenceCard = essenceCards.find(e => e.id === selectedEssence);
    onComplete({
      masks: selectedMasks,
      essence: essenceCard?.name || selectedEssence
    });
  };

  return (
    <div className="game-overlay">
      <div className="game-inner">
        <div className="game-header">
          <div className="game-title-block">
            <div className="game-kicker" style={{ color: module.color }}>
              {module.label} · {phase === "masks" ? "Face Your Shadows" : phase === "essence" ? "Claim Your Power" : "The Reveal"}
            </div>
            <h2 className="game-title">
              {phase === "masks" ? "Your Masks" : phase === "essence" ? "Your Essence" : "Seen & Known"}
            </h2>
          </div>
        </div>

        <div className="game-body">
          {/* PHASE: MASKS */}
          {phase === "masks" && (
            <div style={{ animation: "game-enter 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>
              <p className="game-subtitle">
                Tap the masks you've been wearing — the patterns you fall into. Up to 3.
              </p>

              {maskCards.map((mask, i) => {
                const isSelected = selectedMasks.includes(mask.id);
                const bgColor = mask.palette?.[1] || MASK_PALETTE_FALLBACK[i % MASK_PALETTE_FALLBACK.length];
                return (
                  <button
                    key={mask.id}
                    className={`mask-card-select${isSelected ? " selected" : ""}`}
                    onClick={() => toggleMask(mask.id)}
                  >
                    <div
                      className="mask-sigil"
                      style={{
                        background: isSelected ? bgColor : "rgba(255,255,255,0.05)",
                        color: isSelected ? "#fff" : "rgba(234,251,255,0.5)",
                        boxShadow: isSelected ? `0 0 14px ${bgColor}80` : "none"
                      }}
                    >
                      {mask.sigil}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: 15,
                        color: isSelected ? "#eafbff" : "rgba(234,251,255,0.7)",
                        marginBottom: 2
                      }}>
                        {mask.name}
                      </div>
                      <div style={{
                        fontSize: 12,
                        color: "rgba(234,251,255,0.45)",
                        fontStyle: "italic"
                      }}>
                        {mask.subtitle}
                      </div>
                      {isSelected && (
                        <div style={{
                          fontSize: 12,
                          color: "rgba(234,251,255,0.55)",
                          marginTop: 4,
                          lineHeight: 1.4,
                          animation: "fade-in 0.3s ease both"
                        }}>
                          "{mask.maskVoice}"
                        </div>
                      )}
                    </div>
                    <div style={{
                      fontSize: 18,
                      color: isSelected ? module.color : "rgba(255,255,255,0.15)",
                      flexShrink: 0
                    }}>
                      {isSelected ? "✓" : "○"}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* PHASE: ESSENCE */}
          {phase === "essence" && (
            <div style={{ animation: "game-enter 0.4s cubic-bezier(0.16,1,0.3,1) both" }}>
              <p className="game-subtitle">
                Behind every mask is an essence trying to come through. Which one calls to you?
              </p>

              <div className="essence-grid">
                {essenceCards.map(essence => {
                  const isSelected = selectedEssence === essence.id;
                  const accentColor = `#${essence.palette?.[1]?.replace("#", "") || "8B5CF6"}`;
                  return (
                    <button
                      key={essence.id}
                      className={`essence-card-select${isSelected ? " selected" : ""}`}
                      onClick={() => setSelectedEssence(essence.id)}
                      style={isSelected ? {
                        borderColor: `${accentColor}88`,
                        background: `${accentColor}12`,
                        boxShadow: `0 0 20px ${accentColor}30`
                      } : {}}
                    >
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: isSelected ? accentColor : "rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-mono)",
                        fontWeight: 700,
                        fontSize: 16,
                        color: isSelected ? "#000" : "rgba(234,251,255,0.5)",
                        margin: "0 auto 10px"
                      }}>
                        {essence.sigil}
                      </div>
                      <div style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 800,
                        fontSize: 15,
                        color: isSelected ? "#eafbff" : "rgba(234,251,255,0.7)",
                        marginBottom: 4
                      }}>
                        {essence.name}
                      </div>
                      <div style={{
                        fontSize: 11,
                        color: "rgba(234,251,255,0.4)",
                        lineHeight: 1.4
                      }}>
                        {essence.meaning}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PHASE: REVEAL */}
          {phase === "reveal" && (
            <div style={{ animation: "game-enter 0.5s cubic-bezier(0.16,1,0.3,1) both" }}>
              <div style={{
                padding: "20px",
                borderRadius: 14,
                border: `1px solid ${module.color}33`,
                background: `${module.color}06`,
                marginBottom: 20
              }}>
                <div style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: module.color,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 12
                }}>
                  Masks You've Worn
                </div>
                {selectedMasks.map(id => {
                  const m = maskCards.find(c => c.id === id);
                  return m ? (
                    <div key={id} style={{
                      fontSize: 14,
                      color: "rgba(234,251,255,0.7)",
                      marginBottom: 4,
                      paddingLeft: 12,
                      borderLeft: "2px solid rgba(139,92,246,0.4)"
                    }}>
                      <strong style={{ color: "#eafbff" }}>{m.name}</strong> — {m.question}
                    </div>
                  ) : null;
                })}
              </div>

              {selectedEssence && (() => {
                const e = essenceCards.find(c => c.id === selectedEssence);
                return e ? (
                  <div style={{
                    padding: "20px",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(5,7,10,0.8)",
                    textAlign: "center"
                  }}>
                    <div style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "rgba(234,251,255,0.4)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 8
                    }}>
                      Your Essence Returns
                    </div>
                    <div style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 900,
                      fontSize: 32,
                      color: "#eafbff",
                      textShadow: `0 0 30px ${module.color}60`,
                      marginBottom: 8
                    }}>
                      {e.name}
                    </div>
                    <div style={{
                      fontSize: 14,
                      color: "rgba(234,251,255,0.55)",
                      fontStyle: "italic"
                    }}>
                      "{e.affirmation}"
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>

        {/* CTA */}
        {phase === "masks" && (
          <button
            className="game-cta"
            disabled={selectedMasks.length === 0}
            onClick={handleMasksSubmit}
            style={{
              background: selectedMasks.length > 0 ? module.color : "rgba(255,255,255,0.06)",
              color: selectedMasks.length > 0 ? "#fff" : "rgba(234,251,255,0.3)"
            }}
          >
            Face These Shadows →
          </button>
        )}
        {phase === "essence" && (
          <button
            className="game-cta"
            disabled={!selectedEssence}
            onClick={handleEssenceSubmit}
            style={{
              background: selectedEssence ? module.color : "rgba(255,255,255,0.06)",
              color: selectedEssence ? "#fff" : "rgba(234,251,255,0.3)"
            }}
          >
            Claim My Essence →
          </button>
        )}
        {phase === "reveal" && (
          <button
            className="game-cta"
            onClick={handleComplete}
            style={{ background: module.color, color: "#fff" }}
          >
            I See Clearly Now →
          </button>
        )}
      </div>
    </div>
  );
}

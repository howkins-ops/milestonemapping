import React, { useState } from "react";

const MYTHS = [
  {
    statement: "Real change requires years of gradual effort before you see results.",
    correctAnswer: "old",
    correctLabel: "Old Thinking",
    explanation: "Shifts happen in a moment of decision. The commitment is instant — the evidence follows. You don't wait years to change; you change first, then build the proof."
  },
  {
    statement: "Your past behaviors and patterns are the most reliable predictor of your future.",
    correctAnswer: "old",
    correctLabel: "Old Thinking",
    explanation: "Your past only predicts your future if you keep the same identity. Once you consciously redesign your identity, the old patterns no longer apply. You're a different person now."
  },
  {
    statement: "You need more information and strategy before you're ready to take action.",
    correctAnswer: "old",
    correctLabel: "Old Thinking",
    explanation: "The 'not ready yet' loop is a survival mechanism. The shift comes first. Strategy without identity change produces temporary results. Move with what you know, then upgrade."
  }
];

export default function MisconceptionsGame({ module, onComplete }) {
  const [round, setRound] = useState(0);
  const [animState, setAnimState] = useState("idle"); // "idle" | "correct" | "wrong"
  const [feedback, setFeedback] = useState(null);
  const [allPassed, setAllPassed] = useState(false);

  const myth = MYTHS[round];

  const handleAnswer = (choice) => {
    if (animState !== "idle") return;

    const isCorrect = choice === myth.correctAnswer;

    if (isCorrect) {
      setAnimState("correct");
      setFeedback({ correct: true, text: myth.explanation });
    } else {
      setAnimState("wrong");
      setFeedback({ correct: false, text: myth.explanation });
    }
  };

  const handleNext = () => {
    if (animState === "wrong") {
      // Try again
      setAnimState("idle");
      setFeedback(null);
      return;
    }
    // Correct — move to next round
    const nextRound = round + 1;
    if (nextRound >= MYTHS.length) {
      setAllPassed(true);
    } else {
      setRound(nextRound);
      setAnimState("idle");
      setFeedback(null);
    }
  };

  const handleComplete = () => {
    onComplete({ mythsBusted: 3 });
  };

  if (allPassed) {
    return (
      <div className="game-overlay">
        <div className="game-inner" style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div style={{ animation: "complete-burst 0.8s cubic-bezier(0.16,1,0.3,1) both", padding: "40px 24px" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>⚡</div>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: module.color,
              marginBottom: 12
            }}>
              All 3 Myths Busted
            </div>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: 28,
              color: "#eafbff",
              margin: "0 0 16px",
              textShadow: `0 0 30px ${module.color}80`
            }}>
              You See Clearly Now
            </h2>
            <p style={{
              fontSize: 15,
              color: "rgba(234,251,255,0.55)",
              lineHeight: 1.6,
              maxWidth: 280,
              margin: "0 auto 40px"
            }}>
              The old beliefs can't survive when you see them for what they are.
            </p>
            <button
              className="game-cta"
              onClick={handleComplete}
              style={{
                background: module.color,
                color: "#000",
                width: "auto",
                display: "inline-block",
                padding: "16px 40px",
                margin: 0
              }}
            >
              Claim This Shift →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-overlay">
      <div className="game-inner">
        <div className="game-header">
          <div className="game-title-block">
            <div className="game-kicker" style={{ color: module.color }}>
              {module.label} · Myth Buster
            </div>
            <h2 className="game-title">Old or New Thinking?</h2>
          </div>
        </div>

        <div className="game-body">
          {/* Round dots */}
          <div className="round-dots">
            {MYTHS.map((_, i) => (
              <div
                key={i}
                className={`round-dot${i < round ? " done" : i === round ? " current" : ""}`}
              />
            ))}
          </div>

          <p style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "rgba(234,251,255,0.4)",
            marginBottom: 16,
            textAlign: "center"
          }}>
            Round {round + 1} of {MYTHS.length}
          </p>

          {/* Myth statement */}
          <div className={`myth-statement${animState === "correct" ? " correct-flash" : animState === "wrong" ? " wrong-shake" : ""}`}>
            "{myth.statement}"
          </div>

          {/* Answer buttons (only show when idle) */}
          {animState === "idle" && !feedback && (
            <div className="myth-buttons" style={{ animation: "fade-in 0.3s ease both" }}>
              <button
                className="myth-btn"
                onClick={() => handleAnswer("old")}
                style={{ borderColor: "rgba(255,59,92,0.3)", color: "#ff6b81" }}
              >
                🚫 Old Thinking
              </button>
              <button
                className="myth-btn"
                onClick={() => handleAnswer("new")}
                style={{ borderColor: `${module.color}40`, color: module.color }}
              >
                ✓ New Thinking
              </button>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div style={{
              padding: "16px",
              borderRadius: 12,
              border: `1px solid ${feedback.correct ? "rgba(0,255,191,0.3)" : "rgba(255,59,92,0.3)"}`,
              background: feedback.correct ? "rgba(0,255,191,0.06)" : "rgba(255,59,92,0.06)",
              animation: "slide-up 0.4s cubic-bezier(0.16,1,0.3,1) both"
            }}>
              <div style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 14,
                color: feedback.correct ? "#00FFBF" : "#ff3b5c",
                marginBottom: 8
              }}>
                {feedback.correct ? "✓ Correct — That's old thinking." : "✗ Try again. Think carefully."}
              </div>
              {(feedback.correct || animState === "wrong") && (
                <p style={{
                  fontSize: 13,
                  color: "rgba(234,251,255,0.6)",
                  lineHeight: 1.55,
                  margin: 0
                }}>
                  {feedback.text}
                </p>
              )}
            </div>
          )}
        </div>

        {feedback && (
          <button
            className="game-cta"
            onClick={handleNext}
            style={{
              background: animState === "correct" ? module.color : "rgba(255,59,92,0.8)",
              color: animState === "correct" ? "#000" : "#fff"
            }}
          >
            {animState === "correct"
              ? (round < MYTHS.length - 1 ? "Next Myth →" : "All Myths Busted →")
              : "Try Again →"}
          </button>
        )}
      </div>
    </div>
  );
}

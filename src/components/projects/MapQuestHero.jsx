import React, { useState } from "react";

// The premium value reveal — what "What's inside" actually opens
const VALUE = [
  {
    icon: "◈",
    color: "#00F0FF",
    title: "ICF-level coaching — not journaling prompts",
    body: "Every chapter runs a genuine coaching exercise, the kind used in ICF-credentialed sessions. Real transformational tools, wrapped in story.",
  },
  {
    icon: "❖",
    color: "#D11EFF",
    title: "10+ years, distilled into 20 chapters",
    body: "A decade of coaching practice, training, and client breakthroughs — refined into a guided journey you walk at your own pace.",
  },
  {
    icon: "✦",
    color: "#FFD166",
    title: "$25,000+ in tools — now yours",
    body: "The frameworks and exercises inside have cost private clients over $25,000 in 1:1 work. Here, they're built into the quest.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Name your treasure",
    body: "The goal you think you're chasing — your why, your fear — sealed on Day One.",
  },
  {
    n: "02",
    title: "Walk the chapters",
    body: "Twenty levels. One honest piece of inner work each, woven with the Mentor's true story.",
  },
  {
    n: "03",
    title: "Open the Vault",
    body: "Your own words, reflected back. You meet who you were — and who you've become.",
  },
];

const FEATURES = [
  "Every chapter is one real coaching exercise",
  "Your answers shape the story as you go",
];

export default function MapQuestHero({ onLaunch }) {
  const [showHow, setShowHow] = useState(false);

  return (
    <section className="anim-fade-in" style={{ marginBottom: 22 }}>
      {/* Foil frame */}
      <div
        style={{
          position: "relative",
          borderRadius: 22,
          padding: 4,
          background:
            "linear-gradient(150deg, rgba(0,240,255,0.5), rgba(209,30,255,0.5) 50%, rgba(255,209,102,0.4))",
          boxShadow: "0 24px 64px -26px rgba(123,44,255,0.8)",
        }}
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 19,
            padding: "22px 20px 20px",
            background:
              "radial-gradient(120% 90% at 50% 0%, #1a0533 0%, #08000f 65%)",
          }}
        >
          {/* ember sparks */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(2px 2px at 20% 22%, rgba(255,209,102,0.8), transparent 60%), radial-gradient(1.5px 1.5px at 82% 18%, rgba(0,240,255,0.8), transparent 60%), radial-gradient(2px 2px at 68% 70%, rgba(255,62,219,0.7), transparent 60%)",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* crest */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 11,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "#FFD166",
                }}
              >
                Guided Inner Work
              </span>
              <span style={{ fontSize: 11, letterSpacing: 2, color: "#FFD166" }}>
                &#10022; &#10022; &#10022;
              </span>
            </div>

            {/* emblem */}
            <div
              style={{
                width: 70,
                height: 70,
                margin: "4px auto 14px",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                fontSize: 32,
                background:
                  "radial-gradient(circle at 35% 28%, rgba(0,240,255,0.3), rgba(123,44,255,0.2))",
                border: "1.5px solid rgba(255,209,102,0.45)",
                boxShadow:
                  "0 0 28px -4px rgba(0,240,255,0.6), inset 0 0 18px rgba(123,44,255,0.3)",
              }}
            >
              {"🜂"}
            </div>

            {/* title */}
            <h2
              style={{
                textAlign: "center",
                margin: "0 0 5px",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 26,
                lineHeight: 1.05,
                letterSpacing: "-0.01em",
                background: "linear-gradient(100deg, #00F0FF, #D11EFF 55%, #FF3EDB)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              The Inner Alchemist
            </h2>
            <p
              style={{
                textAlign: "center",
                margin: "0 0 16px",
                padding: "0 6px",
                fontSize: 13,
                lineHeight: 1.5,
                color: "rgba(242,240,244,0.72)",
              }}
            >
              A neon retelling of <em>The Alchemist</em> where every chapter is
              one real exercise
              <br />
              &mdash; and your own answers write the ending.
            </p>

            {/* one hero number */}
            <div style={{ textAlign: "center", marginBottom: 4 }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 46,
                  lineHeight: 1,
                  background: "linear-gradient(100deg, #00F0FF, #D11EFF)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                20
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: 11,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "rgba(242,240,244,0.55)",
                  marginTop: 6,
                }}
              >
                Chapters of guided inner work
              </div>
            </div>

            {/* feature lines */}
            <div style={{ display: "grid", gap: 9, marginTop: 16, marginBottom: 20 }}>
              {FEATURES.map((line) => (
                <div
                  key={line}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 13.5,
                    color: "rgba(242,240,244,0.82)",
                  }}
                >
                  <span style={{ color: "#00F0FF", flexShrink: 0 }}>▸</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>

            {/* divider */}
            <div
              style={{
                height: 1,
                margin: "0 0 16px",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,209,102,0.4), transparent)",
              }}
            />

            {/* CTA */}
            <button
              onClick={() => onLaunch()}
              style={{
                width: "100%",
                padding: "16px 22px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 16,
                color: "#05000A",
                background: "linear-gradient(100deg, #00F0FF 0%, #D11EFF 100%)",
                boxShadow:
                  "0 14px 36px -12px rgba(209,30,255,0.7), 0 0 0 1px rgba(255,255,255,0.12) inset",
              }}
            >
              Draw This Card&nbsp;&rarr;
            </button>
            <button
              onClick={() => setShowHow((s) => !s)}
              aria-expanded={showHow}
              style={{
                display: "block",
                width: "100%",
                marginTop: 10,
                padding: 11,
                border: "none",
                background: "none",
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: "0.02em",
                color: "rgba(196,181,253,0.9)",
              }}
            >
              {showHow ? "Hide details ▴" : "What's inside ▾"}
            </button>

            {/* What's inside — value reveal + the path */}
            {showHow && (
              <div className="anim-fade-in" style={{ marginTop: 18 }}>
                <p
                  style={{
                    margin: "0 0 12px",
                    fontFamily: "var(--font-body)",
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(196,181,253,0.85)",
                    textAlign: "center",
                  }}
                >
                  What&rsquo;s actually inside
                </p>

                <div style={{ display: "grid", gap: 10, marginBottom: 18 }}>
                  {VALUE.map((v) => (
                    <div
                      key={v.title}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "34px 1fr",
                        gap: 12,
                        alignItems: "start",
                        padding: "13px 14px",
                        borderRadius: 14,
                        background: "rgba(8,5,16,0.6)",
                        border: `1px solid ${v.color}33`,
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          display: "grid",
                          placeItems: "center",
                          fontSize: 16,
                          color: v.color,
                          background: `${v.color}14`,
                          border: `1px solid ${v.color}40`,
                        }}
                      >
                        {v.icon}
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 600,
                            fontSize: 14,
                            color: "#F2F0F4",
                            marginBottom: 4,
                            lineHeight: 1.25,
                          }}
                        >
                          {v.title}
                        </div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12.5,
                            lineHeight: 1.5,
                            color: "rgba(242,240,244,0.66)",
                          }}
                        >
                          {v.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <p
                  style={{
                    margin: "0 0 12px",
                    fontFamily: "var(--font-body)",
                    fontSize: 10,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "rgba(0,240,255,0.8)",
                    textAlign: "center",
                  }}
                >
                  How the quest works
                </p>
                <div
                  style={{
                    display: "grid",
                    gap: 12,
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  }}
                >
                  {STEPS.map((step) => (
                    <div
                      key={step.n}
                      style={{
                        padding: "14px 16px",
                        borderRadius: 14,
                        background: "rgba(8,5,16,0.6)",
                        border: "1px solid rgba(0,240,255,0.16)",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: 12,
                          letterSpacing: "0.15em",
                          color: "#00F0FF",
                          marginBottom: 6,
                        }}
                      >
                        {step.n}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 600,
                          fontSize: 15,
                          color: "#F2F0F4",
                          marginBottom: 5,
                        }}
                      >
                        {step.title}
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 13,
                          lineHeight: 1.5,
                          color: "rgba(242,240,244,0.66)",
                        }}
                      >
                        {step.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

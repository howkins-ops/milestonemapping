import React, { useState } from "react";

const STEPS = [
  {
    n: "01",
    title: "Name your treasure",
    body: "The goal you think you're chasing — your why, your fear — captured on Day One.",
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

export default function MapQuestHero({ onLaunch }) {
  const [showHow, setShowHow] = useState(false);

  return (
    <section
      className="anim-fade-in"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 20,
        marginBottom: 22,
        padding: "26px 24px 24px",
        background:
          "radial-gradient(120% 120% at 15% -10%, rgba(123,44,255,0.30) 0%, rgba(10,7,18,0) 55%), radial-gradient(120% 140% at 100% 120%, rgba(0,240,255,0.16) 0%, rgba(10,7,18,0) 50%), linear-gradient(160deg, #10001C 0%, #05000A 100%)",
        border: "1px solid rgba(123,44,255,0.45)",
        boxShadow:
          "0 0 0 1px rgba(0,240,255,0.08) inset, 0 22px 60px -28px rgba(123,44,255,0.7)",
      }}
    >
      {/* drifting ember accents */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(2px 2px at 78% 30%, rgba(255,209,102,0.8), transparent 60%), radial-gradient(2px 2px at 88% 62%, rgba(255,62,219,0.7), transparent 60%), radial-gradient(1.5px 1.5px at 70% 78%, rgba(0,240,255,0.7), transparent 60%)",
          opacity: 0.8,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <p
          style={{
            margin: 0,
            fontSize: 10.5,
            fontFamily: "var(--font-mono, monospace)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(196,181,253,0.9)",
            textShadow: "0 0 12px rgba(123,44,255,0.6)",
          }}
        >
          <span style={{ marginRight: 8 }}>🜂</span>Transformational inner work · disguised as a game
        </p>

        <h2
          style={{
            margin: "12px 0 0",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            lineHeight: 1.1,
            fontSize: "clamp(21px, 5vw, 29px)",
            color: "#F2F0F4",
            letterSpacing: "-0.01em",
          }}
        >
          You think you&rsquo;re chasing a goal.
        </h2>
        <p
          style={{
            margin: "5px 0 0",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            lineHeight: 1.15,
            fontSize: "clamp(17px, 4.2vw, 22px)",
            letterSpacing: "-0.01em",
            background: "linear-gradient(100deg, #00F0FF 0%, #D11EFF 60%, #FF3EDB 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          You&rsquo;re building the person who already has it.
        </p>

        <ul
          style={{
            listStyle: "none",
            margin: "16px 0 0",
            padding: 0,
            maxWidth: 540,
            display: "grid",
            gap: 9,
          }}
        >
          {[
            <>A neon-future retelling of <em>The Alchemist</em> as guided inner work</>,
            "Each chapter is one real exercise wrapped in story",
            "Your answers shape the journey as you go",
            "The finale mirrors who you were on day one — proof of how far you've come",
          ].map((line, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                fontSize: 14,
                lineHeight: 1.45,
                color: "rgba(242,240,244,0.82)",
              }}
            >
              <span style={{ color: "#00F0FF", flexShrink: 0, marginTop: 1 }}>▸</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>

        {/* CTA row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 22 }}>
          <button
            onClick={() => onLaunch()}
            style={{
              flex: "1 1 220px",
              minWidth: 200,
              padding: "15px 24px",
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: "0.01em",
              color: "#05000A",
              background: "linear-gradient(100deg, #00F0FF 0%, #D11EFF 100%)",
              boxShadow: "0 12px 34px -10px rgba(209,30,255,0.65), 0 0 0 1px rgba(255,255,255,0.1) inset",
            }}
          >
            Begin the Quest&nbsp;&rarr;
          </button>
          <button
            onClick={() => setShowHow((s) => !s)}
            aria-expanded={showHow}
            style={{
              flex: "0 0 auto",
              padding: "15px 20px",
              borderRadius: 14,
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 14,
              color: "rgba(196,181,253,0.95)",
              background: "rgba(123,44,255,0.10)",
              border: "1px solid rgba(123,44,255,0.45)",
            }}
          >
            How it works {showHow ? "▴" : "▾"}
          </button>
        </div>

        {/* how it works */}
        {showHow && (
          <div
            className="anim-fade-in"
            style={{
              marginTop: 18,
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
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
                    fontFamily: "var(--font-mono, monospace)",
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
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: "rgba(242,240,244,0.66)" }}>
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

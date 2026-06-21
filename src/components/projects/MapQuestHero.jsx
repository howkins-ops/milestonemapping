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

export default function MapQuestHero({ onLaunch }) {
  const [showHow, setShowHow] = useState(false);

  return (
    <section className="anim-fade-in" style={{ marginBottom: 22 }}>
      {/* Looping video card — the animated version of the card.
          The buttons are painted into the video, so we overlay transparent
          clickable hotspots, positioned in % over where each button appears. */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1608 / 1288",
          borderRadius: 19,
          overflow: "hidden",
          boxShadow: "0 24px 64px -26px rgba(123,44,255,0.8)",
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        >
          <source src="/alchemist-card.mp4" type="video/mp4" />
        </video>

        {/* HOTSPOT: Draw This Card → opens the quest */}
        <button
          onClick={() => onLaunch()}
          aria-label="Draw this card — open The Inner Alchemist"
          style={{
            position: "absolute",
            left: "12%",
            top: "74%",
            width: "76%",
            height: "13%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            zIndex: 2,
          }}
        />

        {/* HOTSPOT: What's inside → toggles the details panel below */}
        <button
          onClick={() => setShowHow((s) => !s)}
          aria-expanded={showHow}
          aria-label="What's inside"
          style={{
            position: "absolute",
            left: "36%",
            top: "87.5%",
            width: "28%",
            height: "6.5%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            zIndex: 2,
          }}
        />
      </div>

      {/* What's inside — value reveal + the path (real HTML, rendered below the video) */}
      {showHow && (
        <div
          className="anim-fade-in"
          style={{
            marginTop: 14,
            padding: "20px 18px",
            borderRadius: 19,
            background:
              "radial-gradient(120% 90% at 50% 0%, #1a0533 0%, #08000f 65%)",
            border: "1px solid rgba(123,44,255,0.3)",
          }}
        >
          <div style={{ marginTop: 0 }}>
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
        </div>
      )}
    </section>
  );
}

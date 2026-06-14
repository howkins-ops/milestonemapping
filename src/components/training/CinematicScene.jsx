import React, { useEffect, useRef, useState } from "react";

// ---- Utilities ----

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function applyHighlights(text, highlights, color) {
  if (!highlights || !highlights.length || !text) return [text];
  const sorted = [...highlights].sort((a, b) => b.length - a.length);
  const escaped = sorted.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) => {
    if (!part) return null;
    if (sorted.some(h => h.toLowerCase() === part.toLowerCase())) {
      return (
        <span key={i} style={{ color, textShadow: `0 0 14px ${hexToRgba(color, 0.5)}` }}>
          {part}
        </span>
      );
    }
    return part;
  });
}

function HL({ text, h, color }) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, li) => (
        <React.Fragment key={li}>
          {applyHighlights(line, h, color)}
          {li < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </>
  );
}

// Stagger delay helper
const delay = (i, base = 0, step = 120) => ({
  "--delay": `${base + i * step}ms`
});

// ---- Scene wrapper: shared scroll container ----
function SceneWrap({ children, align = "start" }) {
  return (
    <div style={{
      height: "100%",
      overflowY: "auto",
      WebkitOverflowScrolling: "touch",
      padding: "20px 22px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: align === "center" ? "center" : "flex-start",
      justifyContent: align === "center" ? "center" : "flex-start",
      gap: 0,
      boxSizing: "border-box",
      scrollbarWidth: "none"
    }}>
      {children}
    </div>
  );
}

// ---- Shared typography ----
const styles = {
  kicker: (color) => ({
    fontFamily: "var(--font-mono)",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color,
    marginBottom: 10,
    opacity: 0.8
  }),
  h1: {
    fontFamily: "var(--font-display)",
    fontWeight: 900,
    fontSize: "clamp(32px, 9vw, 48px)",
    color: "#eafbff",
    lineHeight: 1.1,
    margin: 0,
    letterSpacing: "-0.01em"
  },
  h2: {
    fontFamily: "var(--font-display)",
    fontWeight: 800,
    fontSize: "clamp(24px, 7vw, 36px)",
    color: "#eafbff",
    lineHeight: 1.15,
    margin: 0
  },
  h3: {
    fontFamily: "var(--font-display)",
    fontWeight: 700,
    fontSize: "clamp(20px, 5.5vw, 28px)",
    color: "#eafbff",
    lineHeight: 1.2,
    margin: 0
  },
  sub: {
    fontFamily: "var(--font-body)",
    fontSize: 14,
    color: "rgba(234,251,255,0.55)",
    lineHeight: 1.5,
    marginTop: 8
  },
  body: {
    fontFamily: "var(--font-body)",
    fontSize: "clamp(13px, 3.8vw, 15px)",
    color: "rgba(234,251,255,0.75)",
    lineHeight: 1.65,
    margin: 0
  },
  bullet: {
    fontFamily: "var(--font-body)",
    fontSize: "clamp(12px, 3.5vw, 14px)",
    color: "rgba(234,251,255,0.8)",
    lineHeight: 1.55
  }
};

// ---- TITLE_CARD ----
function SceneTitleCard({ scene, color }) {
  const { headline, subheadline, body, highlight: h } = scene;
  return (
    <SceneWrap align="center">
      <div style={{ textAlign: "center", width: "100%" }}>
        <h1
          className="stagger-item"
          style={{ ...styles.h1, fontSize: "clamp(38px, 10vw, 56px)", fontStyle: "italic", ...delay(0) }}
        >
          <HL text={headline} h={h} color={color} />
        </h1>
        {subheadline && (
          <p className="stagger-item" style={{ ...styles.sub, marginTop: 14, fontSize: 15, color, opacity: 0.9, ...delay(1, 0, 200) }}>
            <HL text={subheadline} h={h} color={color} />
          </p>
        )}
        {body && (
          <p className="stagger-item" style={{ ...styles.body, marginTop: 16, maxWidth: 320, margin: "16px auto 0", ...delay(2, 0, 200) }}>
            {body}
          </p>
        )}
      </div>
    </SceneWrap>
  );
}

// ---- STATEMENT ----
function SceneStatement({ scene, color }) {
  const { headline, subheadline, body, highlight: h } = scene;
  return (
    <SceneWrap align="center">
      <div style={{ textAlign: "center", width: "100%" }}>
        <h2
          className="stagger-item"
          style={{ ...styles.h1, fontSize: "clamp(30px, 9vw, 44px)", ...delay(0) }}
        >
          <HL text={headline} h={h} color={color} />
        </h2>
        {subheadline && (
          <p className="stagger-item" style={{ ...styles.sub, marginTop: 12, color, fontSize: 15, ...delay(1, 500) }}>
            <HL text={subheadline} h={h} color={color} />
          </p>
        )}
        {body && (
          <p className="stagger-item" style={{ ...styles.body, marginTop: 18, maxWidth: 340, margin: "18px auto 0", ...delay(2, 500) }}>
            <HL text={body} h={h} color={color} />
          </p>
        )}
      </div>
    </SceneWrap>
  );
}

// ---- HERO_TEXT ----
function SceneHeroText({ scene, color }) {
  const { headline, subheadline, body, highlight: h } = scene;
  const paragraphs = body ? body.split("\n\n") : [];
  return (
    <SceneWrap>
      <h2 className="stagger-item" style={{ ...styles.h2, ...delay(0) }}>
        <HL text={headline} h={h} color={color} />
      </h2>
      {subheadline && (
        <p className="stagger-item" style={{ ...styles.kicker(color), marginTop: 10, ...delay(1, 200) }}>
          {subheadline}
        </p>
      )}
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {paragraphs.map((para, i) => (
          <p key={i} className="stagger-item" style={{ ...styles.body, ...delay(i, subheadline ? 500 : 400) }}>
            <HL text={para} h={h} color={color} />
          </p>
        ))}
      </div>
    </SceneWrap>
  );
}

// ---- LIST ----
function SceneList({ scene, color }) {
  const { headline, subheadline, bullets = [], body, highlight: h } = scene;
  return (
    <SceneWrap>
      <h2 className="stagger-item" style={{ ...styles.h3, ...delay(0) }}>
        <HL text={headline} h={h} color={color} />
      </h2>
      {subheadline && (
        <p className="stagger-item" style={{ ...styles.sub, marginTop: 6, ...delay(1, 200) }}>
          {subheadline}
        </p>
      )}
      <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "flex", flexDirection: "column", gap: 10 }}>
        {bullets.map((bullet, i) => (
          <li
            key={i}
            className="stagger-item"
            style={{ display: "flex", gap: 10, alignItems: "flex-start", ...delay(i, 500) }}
          >
            <span style={{ color, flexShrink: 0, marginTop: 2, fontSize: 14 }}>›</span>
            <span style={styles.bullet}>
              <HL text={bullet} h={h} color={color} />
            </span>
          </li>
        ))}
      </ul>
      {body && (
        <p className="stagger-item" style={{ ...styles.body, marginTop: 14, ...delay(bullets.length, 500) }}>
          <HL text={body} h={h} color={color} />
        </p>
      )}
    </SceneWrap>
  );
}

// ---- SPLIT_CONCEPT ----
function SceneSplitConcept({ scene, color }) {
  const { headline, body, left, right, highlight: h } = scene;
  return (
    <SceneWrap>
      <h2 className="stagger-item" style={{ ...styles.h3, marginBottom: 6, ...delay(0) }}>
        <HL text={headline} h={h} color={color} />
      </h2>
      {body && (
        <p className="stagger-item" style={{ ...styles.sub, marginBottom: 16, ...delay(1, 200) }}>
          {body}
        </p>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" }}>
        {/* Left panel — Essence */}
        <div
          className="stagger-item"
          style={{
            padding: "14px 12px",
            borderRadius: 12,
            border: `1px solid ${hexToRgba(color, 0.35)}`,
            background: hexToRgba(color, 0.07),
            ...delay(0, 400)
          }}
        >
          <div style={{ ...styles.kicker(color), marginBottom: 8 }}>{left?.title}</div>
          {left?.items.map((item, i) => (
            <div key={i} style={{ ...styles.bullet, marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}>
              <span style={{ color, fontSize: 13 }}>◆</span>
              <span><HL text={item} h={h} color={color} /></span>
            </div>
          ))}
        </div>
        {/* Right panel — Survival */}
        <div
          className="stagger-item"
          style={{
            padding: "14px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
            ...delay(1, 400)
          }}
        >
          <div style={{ ...styles.kicker("rgba(234,251,255,0.4)"), marginBottom: 8 }}>{right?.title}</div>
          {right?.items.map((item, i) => (
            <div key={i} style={{ ...styles.bullet, color: "rgba(234,251,255,0.5)", marginBottom: 5, display: "flex", gap: 6, alignItems: "flex-start" }}>
              <span style={{ color: "rgba(234,251,255,0.3)", fontSize: 13 }}>◆</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </SceneWrap>
  );
}

// ---- CYCLE_DIAGRAM ----
function SceneCycleDiagram({ scene, color }) {
  const { headline, subheadline, cycle = [], body, highlight: h } = scene;
  const n = cycle.length;
  const cx = 120, cy = 120, r = 90;
  const positions = Array.from({ length: n }, (_, i) => {
    const angle = (-90 + i * (360 / n)) * (Math.PI / 180);
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  return (
    <SceneWrap>
      <h2 className="stagger-item" style={{ ...styles.h3, ...delay(0) }}>
        <HL text={headline} h={h} color={color} />
      </h2>
      {subheadline && (
        <p className="stagger-item" style={{ ...styles.kicker(color), marginTop: 6, ...delay(1, 200) }}>
          {subheadline}
        </p>
      )}
      <div style={{ position: "relative", width: 240, height: 240, margin: "12px auto", flexShrink: 0 }}>
        {/* Ring */}
        <div style={{
          position: "absolute",
          left: cx - r, top: cy - r,
          width: r * 2, height: r * 2,
          borderRadius: "50%",
          border: `1.5px dashed ${hexToRgba(color, 0.22)}`
        }} />
        {/* Nodes */}
        {positions.map((pos, i) => (
          <div
            key={i}
            className="stagger-item"
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 72,
              textAlign: "center",
              ...delay(i, 500, 380)
            }}
          >
            <div style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: hexToRgba(color, 0.15),
              border: `1.5px solid ${color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              fontSize: 11,
              color,
              flexShrink: 0
            }}>
              {i + 1}
            </div>
            <div style={{
              fontSize: 9,
              fontWeight: 700,
              fontFamily: "var(--font-body)",
              color: "rgba(234,251,255,0.85)",
              marginTop: 3,
              lineHeight: 1.2
            }}>
              {cycle[i].label}
            </div>
          </div>
        ))}
      </div>
      {body && (
        <p
          className="stagger-item"
          style={{ ...styles.body, marginTop: 4, textAlign: "center", width: "100%", ...delay(n, 500 + n * 380) }}
        >
          <HL text={body} h={h} color={color} />
        </p>
      )}
    </SceneWrap>
  );
}

// ---- INFINITY_LOOP ----
function SceneInfinityLoop({ scene, color }) {
  const { headline, nodes = [], body, highlight: h } = scene;
  const pathRef = useRef(null);
  const [pathLen, setPathLen] = useState(900);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      setPathLen(len);
      const t = setTimeout(() => setDrawn(true), 120);
      return () => clearTimeout(t);
    }
  }, []);

  // figure-8 path in 300x130 viewBox
  const svgPath = "M 150 65 C 167 18, 268 18, 268 65 C 268 112, 167 112, 150 65 C 133 18, 32 18, 32 65 C 32 112, 133 112, 150 65 Z";

  // Node label positions as % of viewBox (300x130)
  const nodePos = [
    { lx: "50%", ly: "8%", tx: "center", ty: "above" },   // Identity — top
    { lx: "89%", ly: "50%", tx: "left", ty: "center" },   // Actions — right
    { lx: "50%", ly: "92%", tx: "center", ty: "below" },  // Habits — bottom
    { lx: "11%", ly: "50%", tx: "right", ty: "center" },  // Outcomes — left
  ];

  const getLabelStyle = (pos) => {
    const base = {
      position: "absolute",
      left: pos.lx,
      top: pos.ly,
      display: "flex",
      flexDirection: "column",
      alignItems: pos.tx === "center" ? "center" : pos.tx === "left" ? "flex-start" : "flex-end"
    };
    if (pos.tx === "center" && pos.ty === "above")
      return { ...base, transform: "translate(-50%, -100%)", paddingBottom: 6 };
    if (pos.tx === "center" && pos.ty === "below")
      return { ...base, transform: "translate(-50%, 0%)", paddingTop: 6 };
    if (pos.tx === "left")
      return { ...base, transform: "translate(8px, -50%)" };
    return { ...base, transform: "translate(calc(-100% - 8px), -50%)" };
  };

  return (
    <SceneWrap>
      <h2 className="stagger-item" style={{ ...styles.h3, marginBottom: 4, ...delay(0) }}>
        <HL text={headline} h={h} color={color} />
      </h2>
      <div style={{ position: "relative", width: "100%", maxWidth: 300, margin: "16px auto 0" }}>
        <svg viewBox="0 0 300 130" style={{ width: "100%", height: "auto", display: "block" }}>
          <path
            ref={pathRef}
            d={svgPath}
            fill="none"
            stroke={hexToRgba(color, 0.6)}
            strokeWidth="2.5"
            strokeDasharray={pathLen}
            strokeDashoffset={drawn ? 0 : pathLen}
            style={{ transition: drawn ? "stroke-dashoffset 2.5s cubic-bezier(0.37,0,0.63,1)" : "none" }}
          />
        </svg>
        {/* Node labels — absolutely positioned over SVG */}
        {nodes.slice(0, 4).map((node, i) => {
          const pos = nodePos[i];
          return (
            <div
              key={i}
              className="stagger-item"
              style={{ ...getLabelStyle(pos), ...delay(i, 400, 550), maxWidth: 80 }}
            >
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: color,
                boxShadow: `0 0 8px ${color}`,
                flexShrink: 0,
                alignSelf: pos.tx === "center" ? "center" : undefined
              }} />
              <div style={{
                fontFamily: "var(--font-display)",
                fontSize: 11,
                fontWeight: 700,
                color: "#eafbff",
                marginTop: 3,
                textAlign: pos.tx === "center" ? "center" : pos.tx === "left" ? "left" : "right"
              }}>
                {node.label}
              </div>
            </div>
          );
        })}
      </div>
      {body && (
        <p className="stagger-item" style={{ ...styles.body, marginTop: 16, textAlign: "center", ...delay(0, 2800) }}>
          <HL text={body} h={h} color={color} />
        </p>
      )}
    </SceneWrap>
  );
}

// ---- QUOTE ----
function SceneQuote({ scene, color }) {
  const { headline, quote, highlight: h } = scene;
  return (
    <SceneWrap align="center">
      <div style={{ textAlign: "center", width: "100%" }}>
        {headline && (
          <p className="stagger-item" style={{ ...styles.kicker(color), marginBottom: 20, ...delay(0) }}>
            {headline}
          </p>
        )}
        <div className="stagger-item" style={{ fontSize: "clamp(48px, 14vw, 72px)", lineHeight: 0.7, color, opacity: 0.5, marginBottom: 8, ...delay(1, 100) }}>
          "
        </div>
        <blockquote
          className="stagger-item"
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 700,
            fontSize: "clamp(20px, 6vw, 28px)",
            color: "#eafbff",
            lineHeight: 1.3,
            margin: "0 0 8px",
            ...delay(2, 200)
          }}
        >
          <HL text={quote} h={h} color={color} />
        </blockquote>
      </div>
    </SceneWrap>
  );
}

// ---- REVEAL_GRID ----
function SceneRevealGrid({ scene, color }) {
  const { headline, subheadline, grid = [], highlight: h } = scene;
  const cols = grid.length <= 2 ? grid.length : 1;
  return (
    <SceneWrap>
      <h2 className="stagger-item" style={{ ...styles.h3, marginBottom: 6, ...delay(0) }}>
        <HL text={headline} h={h} color={color} />
      </h2>
      {subheadline && (
        <p className="stagger-item" style={{ ...styles.sub, marginBottom: 12, ...delay(1, 200) }}>
          {subheadline}
        </p>
      )}
      <div style={{
        display: "grid",
        gridTemplateColumns: cols > 1 ? `repeat(${cols}, 1fr)` : "1fr",
        gap: 10,
        width: "100%"
      }}>
        {grid.map((item, i) => (
          <div
            key={i}
            className="stagger-item"
            style={{
              padding: "14px 14px",
              borderRadius: 12,
              border: `1px solid ${hexToRgba(color, 0.25)}`,
              background: hexToRgba(color, 0.05),
              ...delay(i, 400, 150)
            }}
          >
            <div style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 13,
              color,
              marginBottom: 5,
              lineHeight: 1.2
            }}>
              <HL text={item.title} h={h} color={color} />
            </div>
            <p style={{ ...styles.bullet, fontSize: 12, color: "rgba(234,251,255,0.6)", margin: 0 }}>
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </SceneWrap>
  );
}

// ---- MASK_CARD ----
function SceneMaskCard({ scene, color }) {
  const { headline, left, right, highlight: h } = scene;
  return (
    <SceneWrap>
      <h1
        className="stagger-item"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "clamp(26px, 7vw, 36px)",
          color,
          textShadow: `0 0 24px ${hexToRgba(color, 0.5)}`,
          lineHeight: 1.15,
          marginBottom: 16,
          ...delay(0)
        }}
      >
        <HL text={headline} h={h} color={color} />
      </h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" }}>
        <div
          className="stagger-item"
          style={{
            padding: "12px 12px",
            borderRadius: 12,
            border: `1px solid ${hexToRgba(color, 0.3)}`,
            background: hexToRgba(color, 0.06),
            ...delay(0, 400)
          }}
        >
          <div style={{ ...styles.kicker(color), marginBottom: 8 }}>{left?.title}</div>
          {left?.items.map((item, i) => (
            <div key={i} style={{ ...styles.bullet, fontSize: 12, marginBottom: 6, display: "flex", gap: 6, alignItems: "flex-start" }}>
              <span style={{ color, fontSize: 12, flexShrink: 0 }}>•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div
          className="stagger-item"
          style={{
            padding: "12px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
            ...delay(1, 400)
          }}
        >
          <div style={{ ...styles.kicker("rgba(234,251,255,0.4)"), marginBottom: 8 }}>{right?.title}</div>
          {right?.items.map((item, i) => (
            <div key={i} style={{ ...styles.bullet, fontSize: 12, color: "rgba(234,251,255,0.55)", marginBottom: 6, display: "flex", gap: 6, alignItems: "flex-start" }}>
              <span style={{ color: "rgba(234,251,255,0.3)", fontSize: 12, flexShrink: 0 }}>•</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </SceneWrap>
  );
}

// ---- CONTRAST ----
function SceneContrast({ scene, color }) {
  const { headline, left, right, body, subheadline, highlight: h } = scene;
  return (
    <SceneWrap>
      <h2 className="stagger-item" style={{ ...styles.h3, marginBottom: 4, ...delay(0) }}>
        <HL text={headline} h={h} color={color} />
      </h2>
      {subheadline && (
        <p className="stagger-item" style={{ ...styles.sub, marginBottom: 12, ...delay(1, 200) }}>
          <HL text={subheadline} h={h} color={color} />
        </p>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", marginTop: 12 }}>
        {/* Left — muted/dim */}
        <div
          className="stagger-item"
          style={{
            padding: "12px 12px",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
            opacity: 0.7,
            ...delay(0, 400)
          }}
        >
          <div style={{ ...styles.kicker("rgba(234,251,255,0.35)"), marginBottom: 8 }}>{left?.title}</div>
          {left?.items.map((item, i) => (
            <div key={i} style={{ ...styles.bullet, fontSize: 12, color: "rgba(234,251,255,0.45)", marginBottom: 6 }}>
              {item}
            </div>
          ))}
        </div>
        {/* Right — glowing */}
        <div
          className="stagger-item"
          style={{
            padding: "12px 12px",
            borderRadius: 12,
            border: `1px solid ${hexToRgba(color, 0.4)}`,
            background: hexToRgba(color, 0.07),
            boxShadow: `0 0 20px ${hexToRgba(color, 0.1)}`,
            ...delay(1, 400)
          }}
        >
          <div style={{ ...styles.kicker(color), marginBottom: 8 }}>{right?.title}</div>
          {right?.items.map((item, i) => (
            <div key={i} style={{ ...styles.bullet, fontSize: 12, marginBottom: 6, display: "flex", gap: 6, alignItems: "flex-start" }}>
              <span style={{ color, fontSize: 12, flexShrink: 0 }}>✓</span>
              <span><HL text={item} h={h} color={color} /></span>
            </div>
          ))}
        </div>
      </div>
      {body && (
        <p className="stagger-item" style={{ ...styles.body, marginTop: 14, ...delay(0, 900) }}>
          <HL text={body} h={h} color={color} />
        </p>
      )}
    </SceneWrap>
  );
}

// ---- ESSENCE_LIST (unused in cinematic, included for completeness) ----
function SceneEssenceList({ scene, color }) {
  const { headline, words = [], highlight: h } = scene;
  return (
    <SceneWrap align="center">
      <h2 className="stagger-item" style={{ ...styles.h2, textAlign: "center", marginBottom: 24, ...delay(0) }}>
        <HL text={headline} h={h} color={color} />
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
        {words.map((word, i) => (
          <div
            key={i}
            className="stagger-item"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(18px, 5vw, 24px)",
              color,
              textShadow: `0 0 20px ${hexToRgba(color, 0.6)}`,
              ...delay(i, 400, 200)
            }}
          >
            {word}
          </div>
        ))}
      </div>
    </SceneWrap>
  );
}

// ---- Main export ----
export default function CinematicScene({ scene, shiftColor }) {
  if (!scene) return null;
  const color = shiftColor || "#FF3EDB";

  switch (scene.type) {
    case "TITLE_CARD":    return <SceneTitleCard scene={scene} color={color} />;
    case "STATEMENT":     return <SceneStatement scene={scene} color={color} />;
    case "HERO_TEXT":     return <SceneHeroText scene={scene} color={color} />;
    case "LIST":          return <SceneList scene={scene} color={color} />;
    case "SPLIT_CONCEPT": return <SceneSplitConcept scene={scene} color={color} />;
    case "CYCLE_DIAGRAM": return <SceneCycleDiagram scene={scene} color={color} />;
    case "INFINITY_LOOP": return <SceneInfinityLoop scene={scene} color={color} />;
    case "QUOTE":         return <SceneQuote scene={scene} color={color} />;
    case "REVEAL_GRID":   return <SceneRevealGrid scene={scene} color={color} />;
    case "MASK_CARD":     return <SceneMaskCard scene={scene} color={color} />;
    case "CONTRAST":      return <SceneContrast scene={scene} color={color} />;
    case "ESSENCE_LIST":  return <SceneEssenceList scene={scene} color={color} />;
    default:
      return (
        <SceneWrap align="center">
          <p style={{ ...styles.body, textAlign: "center" }}>{scene.headline}</p>
        </SceneWrap>
      );
  }
}

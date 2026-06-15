import React, { useEffect, useRef, useState, useCallback } from "react";

/* ── Phoenix SVG paths ── */
const WING_R = [
  "M112,90 C152,84 186,56 202,14",
  "M112,97 C152,97 178,77 192,42",
  "M112,104 C148,110 170,96 182,70",
  "M110,111 C138,123 156,117 168,99"
];
const BODY_PATHS = [
  "M110,56 C125,71 125,98 110,130 C95,98 95,71 110,56 Z",
  "M110,74 C117,84 117,99 110,113 C103,99 103,84 110,74 Z",
  "M110,56 C105,49 111,44 118,49"
];

/* ── Diamond SVG paths ── */
const DIA_PATHS = [
  "M30,45 L70,12 L130,12 L170,45 L100,115 Z",
  "M30,45 L170,45",
  "M70,12 L85,45 L100,12 L115,45 L130,12",
  "M85,45 L100,115",
  "M115,45 L100,115"
];

const EMBER_COLS = ["#FB923C", "#FACC15", "#FF3EDB", "#00F0FF", "#00FFBF"];

export default function BootSequence({ onDone }) {
  const [wordText, setWordText]     = useState("FROM THE ASHES");
  const [wordVisible, setWordVisible] = useState(false);
  const [phxDrawing, setPhxDrawing] = useState(false);
  const [diaLanded, setDiaLanded]   = useState(false);
  const [shockGo, setShockGo]       = useState(false);
  const [flashGo, setFlashGo]       = useState(false);
  const [titleIn, setTitleIn]       = useState(false);
  const [tagIn, setTagIn]           = useState(false);
  const [fading, setFading]         = useState(false);

  const emberRef    = useRef(null);
  const intervalRef = useRef(null);
  const doneRef     = useRef(false);

  const spawnEmbers = useCallback((n, burst = false) => {
    const container = emberRef.current;
    if (!container) return;
    for (let i = 0; i < n; i++) {
      const s   = 2 + Math.random() * 4;
      const col = EMBER_COLS[i % EMBER_COLS.length];
      const dur = burst ? 1.1 + Math.random() * 0.5 : 3 + Math.random() * 3;
      const dx  = Math.random() * 90 - 45;
      const el  = document.createElement("div");
      el.style.cssText = [
        "position:absolute",
        `width:${s}px`, `height:${s}px`,
        "border-radius:50%",
        `left:${burst ? 40 + Math.random() * 20 : Math.random() * 100}%`,
        "bottom:0",
        `background:${col}`,
        `box-shadow:0 0 9px ${col}`,
        `animation:ember-rise ${dur}s ease-out forwards`,
        `--dx:${dx}px`,
        `animation-delay:${Math.random() * 0.3}s`,
        "pointer-events:none"
      ].join(";");
      container.appendChild(el);
      setTimeout(() => el.remove(), (dur + 0.5) * 1000);
    }
  }, []);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearInterval(intervalRef.current);
    setFading(true);
    setTimeout(onDone, 500);
  }, [onDone]);

  useEffect(() => {
    /* word morph */
    setWordVisible(true);
    setTimeout(() => setPhxDrawing(true), 800);
    setTimeout(() => {
      setWordVisible(false);
      setTimeout(() => {
        setWordText("RISES THE BUILDER");
        setWordVisible(true);
      }, 380);
    }, 950);

    /* embers */
    spawnEmbers(8);
    intervalRef.current = setInterval(() => spawnEmbers(2), 420);

    /* diamond drop */
    setTimeout(() => setDiaLanded(true), 2400);

    /* shockwave + flash + burst */
    setTimeout(() => {
      setShockGo(true);
      setFlashGo(true);
      spawnEmbers(18, true);
    }, 2980);

    /* title reveal */
    setTimeout(() => { setTitleIn(true); setTagIn(true); }, 3300);

    /* auto-end */
    const endTimer = setTimeout(finish, 4800);

    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(endTimer);
    };
  }, [finish, spawnEmbers]);

  return (
    <div
      onClick={finish}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "#000",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 24,
        opacity: fading ? 0 : 1,
        transition: "opacity 500ms ease",
        overflow: "hidden",
        cursor: "default"
      }}
      role="status"
      aria-label="Mission control booting"
    >

      {/* background art */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
          backgroundImage: "url(/assets/boot/boot-phoenix-bg.png)",
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: 0.35,
        }}
      />
      {/* Phoenix flames atmosphere */}
      <img
        src="/assets/phoenix-shrine/phoenix-flames.png"
        aria-hidden="true"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
        style={{
          position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
          width: "70%", maxWidth: 360, pointerEvents: "none", zIndex: 1,
          opacity: 0.28, objectFit: "contain",
        }}
      />

      {/* ember layer */}
      <div
        ref={emberRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 2 }}
      />

      {/* flash */}
      {flashGo && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(circle at 50% 32%, rgba(0,240,255,0.3), transparent 62%)",
            animation: "boot-flash 0.45s ease-out forwards",
            zIndex: 3
          }}
        />
      )}

      {/* content */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", zIndex: 3, userSelect: "none" }}>

        {/* word morph */}
        <div
          aria-live="polite"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.5em",
            textIndent: "0.5em",
            color: "var(--brand-gold)",
            textTransform: "uppercase",
            marginBottom: 14,
            minHeight: 18,
            textAlign: "center",
            opacity: wordVisible ? 1 : 0,
            transform: wordVisible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.35s ease, transform 0.35s ease"
          }}
        >
          {wordText}
        </div>

        {/* main SVG — phoenix + diamond */}
        <div style={{ position: "relative" }}>
          <svg
            width="220"
            viewBox="0 0 220 250"
            fill="none"
            style={{ overflow: "visible", display: "block" }}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bwgR" x1="110" y1="105" x2="212" y2="14" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#FF3EDB" />
              </linearGradient>
              <linearGradient id="bwgL" x1="110" y1="105" x2="8" y2="14" gradientUnits="userSpaceOnUse">
                <stop stopColor="#D11EFF" />
                <stop offset="1" stopColor="#00F0FF" />
              </linearGradient>
              <linearGradient id="bbodg" x1="110" y1="56" x2="110" y2="130" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00F0FF" />
                <stop offset="1" stopColor="#FF3EDB" />
              </linearGradient>
            </defs>

            {/* Diamond — falls from above */}
            <g transform="translate(48,0) scale(0.62)">
              <g
                style={{
                  opacity: diaLanded ? 1 : 0,
                  transform: diaLanded ? "translateY(0px)" : "translateY(-200px)",
                  transition: "transform 0.65s cubic-bezier(0.2, 1.6, 0.4, 1), opacity 0.3s ease",
                  filter: "drop-shadow(0 0 12px rgba(0,240,255,0.85))"
                }}
              >
                <g stroke="#00F0FF" strokeWidth="4.5" strokeLinejoin="round" fill="none">
                  {DIA_PATHS.map((d, i) => (
                    <path key={i} d={d} />
                  ))}
                </g>
              </g>
            </g>

            {/* Phoenix */}
            <g transform="translate(0,98)">
              {/* right wings */}
              <g stroke="url(#bwgR)" fill="none" strokeWidth="3.4" strokeLinecap="round">
                {WING_R.map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    pathLength="1"
                    style={{
                      strokeDasharray: 1,
                      strokeDashoffset: phxDrawing ? 0 : 1,
                      transition: `stroke-dashoffset 1.3s cubic-bezier(0.5,0,0.25,1) ${(3 - i) * 0.14}s`,
                      filter: "drop-shadow(0 0 6px rgba(139,92,246,0.65))"
                    }}
                  />
                ))}
              </g>
              {/* left wings (mirrored) */}
              <g stroke="url(#bwgL)" fill="none" strokeWidth="3.4" strokeLinecap="round" transform="translate(220,0) scale(-1,1)">
                {WING_R.map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    pathLength="1"
                    style={{
                      strokeDasharray: 1,
                      strokeDashoffset: phxDrawing ? 0 : 1,
                      transition: `stroke-dashoffset 1.3s cubic-bezier(0.5,0,0.25,1) ${(3 - i) * 0.14}s`,
                      filter: "drop-shadow(0 0 6px rgba(139,92,246,0.65))"
                    }}
                  />
                ))}
              </g>
              {/* body */}
              <g stroke="url(#bbodg)" fill="none" strokeWidth="3.2" strokeLinecap="round">
                {BODY_PATHS.map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    pathLength="1"
                    style={{
                      strokeDasharray: 1,
                      strokeDashoffset: phxDrawing ? 0 : 1,
                      transition: `stroke-dashoffset 1.3s cubic-bezier(0.5,0,0.25,1) ${0.56 + i * 0.08}s`,
                      filter: "drop-shadow(0 0 6px rgba(0,240,255,0.65))"
                    }}
                  />
                ))}
              </g>
            </g>
          </svg>

          {/* shockwave ring — positioned over the diamond landing zone */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "50%", top: "22%",
              width: 80, height: 80,
              marginLeft: -40, marginTop: -40,
              border: "2px solid rgba(0,240,255,0.9)",
              borderRadius: "50%",
              pointerEvents: "none",
              animation: shockGo ? "shock-ring 0.75s ease-out forwards" : "none",
              opacity: shockGo ? undefined : 0
            }}
          />
        </div>

        {/* title */}
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(18px,5.5vw,26px)",
            color: "var(--brand-cyan)",
            letterSpacing: titleIn ? "0.12em" : "0.65em",
            textIndent: titleIn ? "0.12em" : "0.65em",
            opacity: titleIn ? 1 : 0,
            marginTop: 12,
            textShadow: "0 0 26px rgba(0,240,255,0.65)",
            transition: "letter-spacing 1.1s cubic-bezier(0.2,0.8,0.2,1), text-indent 1.1s cubic-bezier(0.2,0.8,0.2,1), opacity 0.8s ease",
            whiteSpace: "nowrap",
            textAlign: "center"
          }}
        >
          MILESTONE MAPPING
        </div>

        {/* tagline */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.22em",
            color: "var(--text-muted)",
            opacity: tagIn ? 1 : 0,
            transform: tagIn ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.6s ease 0.35s, transform 0.6s ease 0.35s",
            marginTop: 10,
            textTransform: "uppercase",
            textAlign: "center"
          }}
        >
          Our Map, Your Transformation.
        </div>
      </div>

      {/* skip */}
      <button
        onClick={(e) => { e.stopPropagation(); finish(); }}
        style={{
          position: "absolute",
          bottom: "max(24px, env(safe-area-inset-bottom))",
          border: "1px solid rgba(0,240,255,0.18)",
          background: "transparent",
          color: "rgba(140,225,245,0.55)",
          borderRadius: 999,
          padding: "10px 20px",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          letterSpacing: "0.1em",
          cursor: "pointer",
          transition: "color 0.2s, border-color 0.2s"
        }}
        onMouseEnter={(e) => { e.target.style.color = "var(--brand-cyan)"; e.target.style.borderColor = "rgba(0,240,255,0.4)"; }}
        onMouseLeave={(e) => { e.target.style.color = "rgba(140,225,245,0.55)"; e.target.style.borderColor = "rgba(0,240,255,0.18)"; }}
      >
        SKIP ▶
      </button>
    </div>
  );
}

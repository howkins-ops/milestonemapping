import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";

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

/* Converging sparks — condense inward to birth the diamond at the crown.
   Offsets are the START positions (they animate to 0,0 = diamond core). */
const CONVERGE_SPARKS = [
  { cx: -86, cy: -34, c: "#00F0FF", d: 0.0 },
  { cx: 78, cy: -52, c: "#FF3EDB", d: 0.06 },
  { cx: -52, cy: -78, c: "#FACC15", d: 0.12 },
  { cx: 92, cy: 18, c: "#7B2CFF", d: 0.03 },
  { cx: -94, cy: 26, c: "#D11EFF", d: 0.09 },
  { cx: 40, cy: -92, c: "#00FFBF", d: 0.15 },
  { cx: 64, cy: 64, c: "#00F0FF", d: 0.05 },
  { cx: -60, cy: 58, c: "#FB923C", d: 0.11 }
];

/* Light rays fanned behind the centerpiece once the diamond ignites. */
const RAYS = [-56, -28, 0, 28, 56];

export default function BootSequence({ onDone }) {
  /* Reduced motion is a JS gate here, not just CSS: the global kill-switch
     zeroes transitions, which would turn this timeline into a slideshow of
     hard state-snaps. Instead we render the finished frame and exit early. */
  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      (document.documentElement.dataset.reducedMotion === "true" ||
        (window.matchMedia &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches)),
    []
  );

  const [wordText, setWordText]       = useState("FROM THE ASHES");
  const [wordVisible, setWordVisible] = useState(reduced);
  const [phxDrawing, setPhxDrawing]   = useState(reduced);
  const [diaCharging, setDiaCharging] = useState(false);
  const [diaFormed, setDiaFormed]     = useState(reduced);
  const [ignited, setIgnited]         = useState(reduced);
  const [titleIn, setTitleIn]         = useState(reduced);
  const [tagIn, setTagIn]             = useState(reduced);
  const [fading, setFading]           = useState(false);

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
        `left:${burst ? 42 + Math.random() * 16 : Math.random() * 100}%`,
        burst ? "bottom:52%" : "bottom:0",
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
    setTimeout(onDone, reduced ? 200 : 500);
  }, [onDone, reduced]);

  useEffect(() => {
    if (reduced) {
      /* Finished frame is already rendered — hold it briefly, then hand off. */
      const endTimer = setTimeout(finish, 1200);
      return () => clearTimeout(endTimer);
    }

    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));

    /* kicker + word morph */
    setWordVisible(true);
    at(700, () => setPhxDrawing(true));
    at(1500, () => {
      setWordVisible(false);
      timers.push(setTimeout(() => {
        setWordText("RISES THE BUILDER");
        setWordVisible(true);
      }, 380));
    });

    /* ember bed */
    spawnEmbers(8);
    intervalRef.current = setInterval(() => spawnEmbers(2), 420);

    /* the diamond condenses at the phoenix's crown */
    at(2100, () => setDiaCharging(true));
    at(2280, () => setDiaFormed(true));

    /* IGNITION — bloom, shockwave, burst, rays */
    at(2750, () => {
      setDiaCharging(false);
      setIgnited(true);
      spawnEmbers(24, true);
    });

    /* title + tagline */
    at(3050, () => setTitleIn(true));
    at(3400, () => setTagIn(true));

    /* auto-end */
    at(4700, finish);

    return () => {
      clearInterval(intervalRef.current);
      timers.forEach(clearTimeout);
    };
  }, [finish, spawnEmbers, reduced]);

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
      {/* background art — breathes brighter at ignition */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
          backgroundImage: "url(/assets/boot/boot-phoenix-bg.png)",
          backgroundSize: "cover", backgroundPosition: "center",
          opacity: ignited ? 0.46 : 0.3,
          transition: "opacity 0.9s ease"
        }}
      />
      {/* atmospheric glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "50%",
          bottom: "-18%",
          width: "min(68vw, 420px)",
          height: "min(68vw, 420px)",
          transform: "translateX(-50%)",
          pointerEvents: "none",
          zIndex: 1,
          background:
            "radial-gradient(circle at 50% 52%, rgba(0,240,255,0.14), transparent 18%), " +
            "radial-gradient(ellipse at 50% 62%, rgba(209,30,255,0.24), transparent 54%), " +
            "radial-gradient(ellipse at 50% 76%, rgba(123,44,255,0.18), transparent 62%)",
          filter: "blur(10px)",
          opacity: 0.88
        }}
      />

      {/* ember layer */}
      <div
        ref={emberRef}
        aria-hidden="true"
        style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 2 }}
      />

      {/* ignition bloom */}
      {ignited && !reduced && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(circle at 50% 40%, rgba(0,240,255,0.38), rgba(255,62,219,0.12) 34%, transparent 62%)",
            animation: "boot-flash 0.5s ease-out forwards",
            zIndex: 3
          }}
        />
      )}

      {/* content — slow cinematic settle from 1.05 → 1 */}
      <div
        style={{
          position: "relative",
          display: "flex", flexDirection: "column", alignItems: "center",
          zIndex: 3, userSelect: "none",
          transform: reduced ? "none" : phxDrawing ? "scale(1)" : "scale(1.05)",
          transition: "transform 2.6s cubic-bezier(0.16,1,0.3,1)"
        }}
      >
        {/* kicker / word morph */}
        <div
          aria-live="polite"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: wordVisible ? "0.5em" : "0.68em",
            textIndent: "0.5em",
            color: "var(--brand-gold)",
            textTransform: "uppercase",
            marginBottom: 14,
            minHeight: 18,
            textAlign: "center",
            opacity: wordVisible ? 1 : 0,
            transform: wordVisible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.35s ease, transform 0.35s ease, letter-spacing 0.9s cubic-bezier(0.16,1,0.3,1)"
          }}
        >
          {wordText}
        </div>

        {/* centerpiece — phoenix carrying the diamond at its crown */}
        <div
          style={{
            position: "relative",
            animation: ignited && !reduced ? "boot-jolt 0.16s ease-out 1" : "none"
          }}
        >
          {/* light rays — ignite behind the centerpiece, drift slowly */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "50%", top: "35%",
              width: 0, height: 0,
              zIndex: -1,
              opacity: ignited ? 1 : 0,
              transition: "opacity 1.2s ease 0.15s",
              animation: ignited && !reduced ? "boot-rays 46s linear infinite" : "none"
            }}
          >
            {RAYS.map((deg) => (
              <div
                key={deg}
                style={{
                  position: "absolute",
                  left: -1, top: "-38vh",
                  width: 2, height: "76vh",
                  transform: `rotate(${deg}deg)`,
                  transformOrigin: "50% 50%",
                  background:
                    "linear-gradient(180deg, transparent, rgba(0,240,255,0.16) 30%, rgba(209,30,255,0.2) 50%, rgba(0,240,255,0.16) 70%, transparent)"
                }}
              />
            ))}
          </div>

          <svg
            width="240"
            viewBox="0 40 220 200"
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
              <linearGradient id="bdiag" x1="100" y1="12" x2="100" y2="115" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00F0FF" />
                <stop offset="0.55" stopColor="#7DF9FF" />
                <stop offset="1" stopColor="#FF3EDB" />
              </linearGradient>
            </defs>

            {/* Phoenix — rises first, wings cradling the crown */}
            <g transform="translate(0,98)">
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
                      filter: ignited
                        ? "drop-shadow(0 0 10px rgba(255,62,219,0.85))"
                        : "drop-shadow(0 0 6px rgba(139,92,246,0.65))"
                    }}
                  />
                ))}
              </g>
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
                      filter: ignited
                        ? "drop-shadow(0 0 10px rgba(0,240,255,0.85))"
                        : "drop-shadow(0 0 6px rgba(139,92,246,0.65))"
                    }}
                  />
                ))}
              </g>
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

            {/* Diamond — condenses out of the air at the phoenix's crown,
                floating just above the head. No more long-distance drop. */}
            <g transform="translate(55,75) scale(0.55)">
              <g
                style={{
                  opacity: diaFormed ? 1 : 0,
                  transform: diaFormed
                    ? "rotate(0deg) scale(1)"
                    : "rotate(-12deg) scale(1.7)",
                  transformOrigin: "50% 50%",
                  transformBox: "fill-box",
                  transition:
                    "transform 0.62s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease",
                  filter: ignited
                    ? "drop-shadow(0 0 18px rgba(0,240,255,0.95)) drop-shadow(0 0 42px rgba(255,62,219,0.4))"
                    : "drop-shadow(0 0 12px rgba(0,240,255,0.85))"
                }}
              >
                <g stroke="url(#bdiag)" strokeWidth="4.5" strokeLinejoin="round" fill="none">
                  {DIA_PATHS.map((d, i) => (
                    <path key={i} d={d} />
                  ))}
                </g>
              </g>
            </g>
          </svg>

          {/* converging sparks — matter being pulled into the forming diamond */}
          {diaCharging && !reduced && (
            <div
              aria-hidden="true"
              style={{ position: "absolute", left: "50%", top: "33%", width: 0, height: 0, pointerEvents: "none" }}
            >
              {CONVERGE_SPARKS.map((s, i) => (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    left: -2, top: -2,
                    width: 4, height: 4,
                    borderRadius: "50%",
                    background: s.c,
                    boxShadow: `0 0 8px ${s.c}`,
                    "--cx": `${s.cx}px`,
                    "--cy": `${s.cy}px`,
                    animation: `boot-converge 0.6s cubic-bezier(0.5,0,0.75,0.4) ${s.d}s both`
                  }}
                />
              ))}
            </div>
          )}

          {/* shockwave ring — erupts from the diamond core at ignition */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "50%", top: "35%",
              width: 80, height: 80,
              marginLeft: -40, marginTop: -40,
              border: "2px solid rgba(0,240,255,0.9)",
              borderRadius: "50%",
              pointerEvents: "none",
              animation: ignited && !reduced ? "shock-ring 0.75s ease-out forwards" : "none",
              opacity: ignited && !reduced ? undefined : 0
            }}
          />
        </div>

        {/* title — chromatic aberration collapsing into a clean cyan glow */}
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(18px,5.5vw,26px)",
            color: "#EFFDFF",
            letterSpacing: titleIn ? "0.12em" : "0.65em",
            textIndent: titleIn ? "0.12em" : "0.65em",
            opacity: titleIn ? 1 : 0,
            marginTop: 12,
            textShadow: titleIn
              ? "0 0 26px rgba(0,240,255,0.65), 0 0 2px rgba(0,240,255,0.9)"
              : "-7px 0 rgba(0,240,255,0.8), 7px 0 rgba(209,30,255,0.8)",
            transition:
              "letter-spacing 1.1s cubic-bezier(0.2,0.8,0.2,1), text-indent 1.1s cubic-bezier(0.2,0.8,0.2,1), opacity 0.8s ease, text-shadow 1s cubic-bezier(0.2,0.8,0.2,1)",
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
            transition: "opacity 0.6s ease, transform 0.6s ease",
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

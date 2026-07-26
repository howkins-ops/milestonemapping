import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createBootFx } from "./bootFx.js";
import { tapLight, tapMedium, slamHeavy } from "../../lib/haptics.js";

/* ═══════════════════════════════════════════════════════════════════
   THE RISE — cold-open cinematic

   Seven beats, ~5.9s, skippable at any point (click anywhere or SKIP):

     0  THE VOID        black, stars, grey ash falling, scanner sweep
     1  THE ASHES       kicker decodes in; ash flips to rising embers;
                        the phoenix is burned into existence stroke by
                        stroke, a white-hot head running ahead of each line
     2  THE WINGBEAT    one slow beat; the downdraft gusts the ember field
                        and the kicker glitch-morphs to RISES THE BUILDER
     3  CONDENSATION    vignette clamps in, matter spirals to the crown,
                        the diamond assembles facet by facet
     4  IGNITION        vacuum → white-out → quake → three shockwaves →
                        spark burst → god rays → chromatic split → haptic
     5  THE NAME        wordmark collapses out of chromatic split, then a
                        specular sweep, then the brand rule draws out
     6  DISSOLVE        hold, then fade to the app

   Particles are a single pooled canvas (bootFx.js), not DOM nodes.
   ═══════════════════════════════════════════════════════════════════ */

/* ── Phoenix ── */
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

/* ── Diamond ── */
const DIA_PATHS = [
  "M30,45 L70,12 L130,12 L170,45 L100,115 Z",
  "M30,45 L170,45",
  "M70,12 L85,45 L100,12 L115,45 L130,12",
  "M85,45 L100,115",
  "M115,45 L100,115"
];

const RAYS = [-72, -46, -22, 0, 22, 46, 72];

const DRAW_MS = 1300;

/* Beat times in ms from mount. */
const T = {
  stars:    200,
  nebula:   320,
  kicker1:  520,
  embers:   820,
  draw:     860,
  beat:    2100,
  kicker2: 2320,
  tighten: 2650,
  converge:2700,
  diamond: 2950,
  vacuum:  3440,
  ignite:  3600,
  title:   3900,
  shine:   4380,
  rule:    4440,
  tag:     4640,
  end:     5900
};

const SCRAMBLE = "▚▞█▓▒░/\\|<>=+*#@$%&";

/* Character-scramble decode. Locks glyphs left-to-right so the word
   resolves like a readout finding signal rather than a plain fade. */
function useDecode(target, active, ms = 520) {
  const [out, setOut] = useState(target);
  const raf = useRef(0);

  useEffect(() => {
    if (!active) { setOut(target); return; }
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / ms);
      const locked = Math.floor(p * target.length);
      let s = "";
      for (let i = 0; i < target.length; i++) {
        const ch = target[i];
        if (i < locked || ch === " ") s += ch;
        else s += SCRAMBLE[(Math.random() * SCRAMBLE.length) | 0];
      }
      setOut(s);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setOut(target);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, active, ms]);

  return out;
}

export default function BootSequence({ onDone }) {
  /* Reduced motion is a JS gate, not just CSS: the global kill-switch zeroes
     transitions, which would turn this timeline into a slideshow of hard
     state-snaps. Instead we render the finished frame and exit early. */
  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      (document.documentElement.dataset.reducedMotion === "true" ||
        (window.matchMedia &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches)),
    []
  );

  const [rolling,   setRolling]   = useState(reduced);
  const [starsOn,   setStarsOn]   = useState(reduced);
  const [nebulaOn,  setNebulaOn]  = useState(reduced);
  const [scanner,   setScanner]   = useState(false);
  /* The finished frame is the *resolved* word — reduced motion never plays
     the morph, so it must start where the timeline would have ended. */
  const [kickText,  setKickText]  = useState(reduced ? "RISES THE BUILDER" : "FROM THE ASHES");
  const [kickIn,    setKickIn]    = useState(reduced);
  const [decoding,  setDecoding]  = useState(false);
  const [glitching, setGlitching] = useState(false);
  const [drawing,   setDrawing]   = useState(reduced);
  const [drawDone,  setDrawDone]  = useState(reduced);
  const [beating,   setBeating]   = useState(false);
  const [tight,     setTight]     = useState(false);
  const [diaFormed, setDiaFormed] = useState(reduced);
  const [vacuum,    setVacuum]    = useState(false);
  const [ignited,   setIgnited]   = useState(reduced);
  const [blast,     setBlast]     = useState(false);
  const [titleIn,   setTitleIn]   = useState(reduced);
  const [shining,   setShining]   = useState(false);
  const [ruleIn,    setRuleIn]    = useState(reduced);
  const [tagIn,     setTagIn]     = useState(reduced);
  const [fading,    setFading]    = useState(false);
  /* Dropped by the engine when it measures a sustained slow frame. Gates every
     *perpetual* effect: the heat haze, the diamond spin, the facet shimmer and
     the travelling stroke pulses. Those all sit on or inside filtered SVG
     groups, and an animation that never ends forces the filter to
     re-rasterise every frame forever. One-shot beats (draw, wingbeat,
     ignition) always play — the cinematic never degrades, only the idle
     ornament does. */
  const [richFx,    setRichFx]    = useState(true);

  const kickerOut = useDecode(kickText, decoding);

  const canvasRef = useRef(null);
  const crownRef  = useRef(null);
  const fxRef     = useRef(null);
  const doneRef   = useRef(false);

  /* Crown position in viewport px — the canvas is viewport-sized and outside
     the camera transform, so a client rect maps 1:1 onto canvas space. */
  const crownXY = useCallback(() => {
    const el = crownRef.current;
    if (!el) return [window.innerWidth / 2, window.innerHeight * 0.38];
    const r = el.getBoundingClientRect();
    return [r.left + r.width / 2, r.top + r.height / 2];
  }, []);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    fxRef.current?.stop();
    setFading(true);
    setTimeout(onDone, reduced ? 200 : 620);
  }, [onDone, reduced]);

  /* ── particle engine ── */
  useEffect(() => {
    if (reduced || !canvasRef.current) return;
    const fx = createBootFx(canvasRef.current, {
      onQuality: (q) => setRichFx(q >= 1)
    });
    fxRef.current = fx;
    const onResize = () => fx?.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      fx?.stop();
      fxRef.current = null;
    };
  }, [reduced]);

  /* ── timeline ── */
  useEffect(() => {
    if (reduced) {
      const t = setTimeout(finish, 1400);
      return () => clearTimeout(t);
    }

    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));

    /* 0 — THE VOID */
    setRolling(true);
    setScanner(true);
    at(T.stars,  () => setStarsOn(true));
    at(T.nebula, () => setNebulaOn(true));
    at(1600,     () => setScanner(false));

    /* 1 — THE ASHES */
    at(T.kicker1, () => { setDecoding(true); setKickIn(true); });
    at(T.kicker1 + 560, () => setDecoding(false));
    at(T.embers,  () => fxRef.current?.setMode("ember"));
    at(T.draw,    () => setDrawing(true));
    /* longest stroke delay (520 + 2*80) plus the draw itself — after this the
       trace heads are finished and can be unmounted with their filters. */
    at(T.draw + DRAW_MS + 720, () => setDrawDone(true));

    /* 2 — THE WINGBEAT: the downstroke shoves the ember field outward */
    at(T.beat, () => {
      setBeating(true);
      fxRef.current?.gust(0, 620);
      tapLight();
    });
    at(T.beat + 260, () => fxRef.current?.gust(0, -340));
    at(T.beat + 920, () => setBeating(false));

    at(T.kicker2, () => {
      setGlitching(true);
      setKickText("RISES THE BUILDER");
      setDecoding(true);
      tapLight();
    });
    at(T.kicker2 + 540, () => { setGlitching(false); setDecoding(false); });

    /* 3 — CONDENSATION */
    at(T.tighten, () => setTight(true));
    at(T.converge, () => {
      const [cx, cy] = crownXY();
      fxRef.current?.converge(cx, cy, 30, 190);
      timers.push(setTimeout(() => fxRef.current?.converge(cx, cy, 26, 250), 150));
    });
    at(T.diamond, () => { setDiaFormed(true); tapMedium(); });

    /* 4 — IGNITION */
    at(T.vacuum, () => {
      setVacuum(true);
      const [cx, cy] = crownXY();
      fxRef.current?.converge(cx, cy, 34, 300);
    });
    at(T.ignite, () => {
      setVacuum(false);
      setIgnited(true);
      setBlast(true);
      setTight(false);
      const [cx, cy] = crownXY();
      fxRef.current?.burst(cx, cy, 84, 1);
      fxRef.current?.gust(0, -520);
      slamHeavy();
    });
    at(T.ignite + 120, () => {
      const [cx, cy] = crownXY();
      fxRef.current?.burst(cx, cy, 40, 0.55);
    });
    at(T.ignite + 1700, () => setBlast(false));   // unmount one-shot FX layers

    /* 5 — THE NAME */
    at(T.title, () => setTitleIn(true));
    at(T.shine, () => setShining(true));
    at(T.rule,  () => setRuleIn(true));
    at(T.tag,   () => setTagIn(true));

    /* 6 — DISSOLVE */
    at(T.end, finish);

    return () => timers.forEach(clearTimeout);
  }, [reduced, finish, crownXY]);

  /* Stroke style factory. `delay` staggers the wing feathers so they unfurl
     outward-in rather than all at once.

     Deliberately NO per-path filter: measured on an Intel HD laptop GPU, a
     drop-shadow on each of the 22 paths cost ~20fps against a group-level
     glow that looks the same on single-colour line art. Glow lives on the
     enclosing <g> instead. */
  const traceStyle = (delay) => ({
    strokeDasharray: 1,
    strokeDashoffset: drawing ? 0 : 1,
    transition: `stroke-dashoffset ${DRAW_MS}ms cubic-bezier(0.45,0,0.2,1) ${delay}ms`
  });

  const headStyle = (delay) => ({
    strokeDasharray: "0.055 1",
    strokeDashoffset: 1,
    animation: `bx-trace-head ${DRAW_MS}ms cubic-bezier(0.45,0,0.2,1) ${delay}ms forwards`
  });

  /* Post-ignition energy running the length of every stroke, forever. These
     live OUTSIDE the filtered groups on purpose: an endlessly animating
     stroke-dashoffset inside a filtered subtree re-rasterises that filter
     every single frame. Unfiltered, they cost almost nothing and still read
     as light travelling the line. */
  const pulseStyle = (dur, delay) => ({
    strokeDasharray: "0.09 0.91",
    animation: `bx-pulse-run ${dur}ms linear ${delay}ms infinite`
  });

  const glow = (on, off) => ({ filter: ignited ? on : off });

  return (
    <div
      className={`bx-root${fading ? " is-fading" : ""}`}
      onClick={finish}
      role="status"
      aria-label="Milestone Mapping — from the ashes rises the builder"
    >
      {/* particles sit outside the camera so they stay in viewport space */}
      <canvas ref={canvasRef} className="bx-canvas" aria-hidden="true" />

      <div className={`bx-camera${rolling ? " is-rolling" : ""}`} aria-hidden="true">
        <div className={`bx-quake${ignited && blast ? " is-hit" : ""}`}>

          {/* ── layer 0: the void ── */}
          <div className={`bx-stars${starsOn ? " is-on" : ""}`} />
          <div className={`bx-nebula${nebulaOn ? (ignited ? " is-hot" : " is-on") : ""}`} />
          <div className={`bx-bg${ignited ? " is-hot" : ""}`} />
          {scanner && <div className="bx-scanner" />}

          {/* ── god rays ── */}
          <div className={`bx-rays${ignited ? " is-on" : ""}`}>
            {RAYS.map((deg, i) => (
              <div key={deg} className="bx-ray-rot" style={{ transform: `rotate(${deg}deg)` }}>
                <div className="bx-ray" style={{ animationDelay: `${i * 340}ms` }} />
              </div>
            ))}
          </div>

          {/* ── ignition one-shots ── */}
          {ignited && blast && (
            <>
              <div className="bx-flash" />
              <div className="bx-bar" />
              <div className="bx-ring r1" />
              <div className="bx-ring r2" />
              <div className="bx-ring r3" />
              <div className="bx-aberration" />
            </>
          )}

          <div className={`bx-vignette${tight ? " is-tight" : ignited ? " is-open" : ""}`} />
        </div>
      </div>

      {/* ── stage ── */}
      <div
        className="bx-stage"
        style={{
          /* the inhale right before the hit */
          transform: vacuum ? "scale(0.968)" : "scale(1)",
          transition: vacuum
            ? "transform 150ms cubic-bezier(0.7,0,0.85,0)"
            : "transform 620ms cubic-bezier(0.16,1,0.3,1)"
        }}
      >
        <div
          className={
            "bx-kicker" +
            (kickIn ? " is-in" : "") +
            (glitching ? " is-glitching" : "")
          }
          data-text={kickerOut}
          aria-live="polite"
        >
          {kickerOut}
        </div>

        <div className="bx-bird">
          {/* invisible anchor: the exact pixel the sparks converge on */}
          <span
            ref={crownRef}
            aria-hidden="true"
            style={{ position: "absolute", left: "50%", top: "34%", width: 1, height: 1 }}
          />

          <svg
            className="bx-svg"
            width="260"
            viewBox="0 40 220 200"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bxWgR" x1="110" y1="105" x2="212" y2="14" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7B2CFF" />
                <stop offset="0.5" stopColor="#D11EFF" />
                <stop offset="1" stopColor="#FF3EDB" />
              </linearGradient>
              <linearGradient id="bxWgL" x1="110" y1="105" x2="8" y2="14" gradientUnits="userSpaceOnUse">
                <stop stopColor="#D11EFF" />
                <stop offset="0.5" stopColor="#7DF9FF" />
                <stop offset="1" stopColor="#00F0FF" />
              </linearGradient>
              <linearGradient id="bxBody" x1="110" y1="56" x2="110" y2="130" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00F0FF" />
                <stop offset="0.55" stopColor="#D11EFF" />
                <stop offset="1" stopColor="#FF3EDB" />
              </linearGradient>
              <linearGradient id="bxDia" x1="100" y1="12" x2="100" y2="115" gradientUnits="userSpaceOnUse">
                <stop stopColor="#00F0FF" />
                <stop offset="0.55" stopColor="#7DF9FF" />
                <stop offset="1" stopColor="#FF3EDB" />
              </linearGradient>

              {/* Heat haze. feTurbulence noise driving a displacement map, with
                  baseFrequency animated in SMIL so the shimmer boils without
                  costing a JS frame. Dropped on low-quality hardware. */}
              <filter id="bxHaze" x="-25%" y="-25%" width="150%" height="150%">
                <feTurbulence type="fractalNoise" baseFrequency="0.014 0.05" numOctaves="1" seed="7" result="n">
                  <animate
                    attributeName="baseFrequency"
                    dur="7s"
                    values="0.014 0.05; 0.022 0.028; 0.014 0.05"
                    repeatCount="indefinite"
                  />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>

            {/* ── PHOENIX ── */}
            <g
              transform="translate(0,98)"
              filter={richFx && !reduced && drawing && !ignited ? "url(#bxHaze)" : undefined}
            >
              <g className={`bx-wings${beating ? " is-beating" : ""}`}>
                {/* right wing — one glow for the whole group */}
                <g fill="none" strokeWidth="3.4" strokeLinecap="round"
                   style={glow("drop-shadow(0 0 12px rgba(255,62,219,0.9))",
                               "drop-shadow(0 0 6px rgba(139,92,246,0.6))")}>
                  {WING_R.map((d, i) => (
                    <path key={`r${i}`} d={d} pathLength="1" stroke="url(#bxWgR)"
                          style={traceStyle((3 - i) * 130)} />
                  ))}
                </g>
                {/* left wing (mirrored) */}
                <g fill="none" strokeWidth="3.4" strokeLinecap="round"
                   transform="translate(220,0) scale(-1,1)"
                   style={glow("drop-shadow(0 0 12px rgba(0,240,255,0.9))",
                               "drop-shadow(0 0 6px rgba(139,92,246,0.6))")}>
                  {WING_R.map((d, i) => (
                    <path key={`l${i}`} d={d} pathLength="1" stroke="url(#bxWgL)"
                          style={traceStyle((3 - i) * 130)} />
                  ))}
                </g>

                {/* white-hot heads running ahead of the strokes — mounted only
                    for the duration of the draw, then thrown away */}
                {drawing && !drawDone && (
                  <>
                    <g fill="none" strokeWidth="4.2" strokeLinecap="round" stroke="#FFF3FE"
                       style={{ filter: "drop-shadow(0 0 9px #FF3EDB)" }}>
                      {WING_R.map((d, i) => (
                        <path key={`rh${i}`} d={d} pathLength="1" style={headStyle((3 - i) * 130)} />
                      ))}
                    </g>
                    <g fill="none" strokeWidth="4.2" strokeLinecap="round" stroke="#EFFDFF"
                       transform="translate(220,0) scale(-1,1)"
                       style={{ filter: "drop-shadow(0 0 9px #00F0FF)" }}>
                      {WING_R.map((d, i) => (
                        <path key={`lh${i}`} d={d} pathLength="1" style={headStyle((3 - i) * 130)} />
                      ))}
                    </g>
                  </>
                )}

                {/* travelling energy — unfiltered, see pulseStyle */}
                {ignited && richFx && (
                  <>
                    <g fill="none" strokeWidth="2" strokeLinecap="round" stroke="#FFFFFF" opacity="0.9">
                      {WING_R.map((d, i) => (
                        <path key={`rp${i}`} d={d} pathLength="1" style={pulseStyle(2600, i * 180)} />
                      ))}
                    </g>
                    <g fill="none" strokeWidth="2" strokeLinecap="round" stroke="#FFFFFF" opacity="0.9"
                       transform="translate(220,0) scale(-1,1)">
                      {WING_R.map((d, i) => (
                        <path key={`lp${i}`} d={d} pathLength="1" style={pulseStyle(2600, 400 + i * 180)} />
                      ))}
                    </g>
                  </>
                )}
              </g>

              {/* body */}
              <g fill="none" strokeWidth="3.2" strokeLinecap="round"
                 style={glow("drop-shadow(0 0 14px rgba(0,240,255,0.9))",
                             "drop-shadow(0 0 6px rgba(0,240,255,0.6))")}>
                {BODY_PATHS.map((d, i) => (
                  <path key={`b${i}`} d={d} pathLength="1" stroke="url(#bxBody)"
                        style={traceStyle(520 + i * 80)} />
                ))}
              </g>
              {drawing && !drawDone && (
                <g fill="none" strokeWidth="4" strokeLinecap="round" stroke="#FFFFFF"
                   style={{ filter: "drop-shadow(0 0 10px #00F0FF)" }}>
                  {BODY_PATHS.map((d, i) => (
                    <path key={`bh${i}`} d={d} pathLength="1" style={headStyle(520 + i * 80)} />
                  ))}
                </g>
              )}
              {ignited && richFx && (
                <g fill="none" strokeWidth="1.8" strokeLinecap="round" stroke="#FFFFFF" opacity="0.9">
                  {BODY_PATHS.map((d, i) => (
                    <path key={`bp${i}`} d={d} pathLength="1" style={pulseStyle(2200, i * 240)} />
                  ))}
                </g>
              )}
            </g>

            {/* ── DIAMOND — condenses at the crown, then turns slowly ── */}
            <g transform="translate(55,75) scale(0.55)">
              <g
                className={`bx-diamond${ignited && richFx ? " is-spinning" : ""}`}
                style={{
                  opacity: diaFormed ? 1 : 0,
                  filter: ignited
                    ? "drop-shadow(0 0 22px rgba(0,240,255,0.95)) drop-shadow(0 0 56px rgba(255,62,219,0.5))"
                    : "drop-shadow(0 0 13px rgba(0,240,255,0.85))",
                  transition: "opacity 300ms ease, filter 700ms ease"
                }}
              >
                <g stroke="url(#bxDia)" strokeWidth="4.5" strokeLinejoin="round" strokeLinecap="round" fill="none">
                  {DIA_PATHS.map((d, i) => (
                    <path
                      key={i}
                      d={d}
                      pathLength="1"
                      style={{
                        strokeDasharray: 1,
                        strokeDashoffset: diaFormed ? 0 : 1,
                        transition: `stroke-dashoffset 420ms cubic-bezier(0.3,0,0.2,1) ${i * 70}ms`
                      }}
                    />
                  ))}
                </g>
                {/* facet shimmer — a white ghost of the same edges pulsing */}
                <g stroke="#FFFFFF" strokeWidth="1.6" strokeLinejoin="round" fill="none">
                  {DIA_PATHS.map((d, i) => (
                    <path
                      key={`s${i}`}
                      d={d}
                      style={{
                        opacity: 0,
                        animation: ignited && richFx
                          ? `bx-facet ${2400 + i * 260}ms ease-in-out ${i * 190}ms infinite`
                          : "none"
                      }}
                    />
                  ))}
                </g>
              </g>
            </g>
          </svg>
        </div>

        {/* ── wordmark ── */}
        <div className="bx-titlewrap">
          <div className={`bx-title${titleIn ? " is-in" : ""}`}>MILESTONE MAPPING</div>
          <div className={`bx-shine${shining ? " is-sweeping" : ""}`} aria-hidden="true">
            MILESTONE MAPPING
          </div>
        </div>

        <div className={`bx-rule${ruleIn ? " is-drawn" : ""}`} aria-hidden="true" />

        <div className={`bx-tag${tagIn ? " is-in" : ""}`}>Our Map, Your Transformation.</div>
      </div>

      <button
        type="button"
        className="bx-skip"
        onClick={(e) => { e.stopPropagation(); finish(); }}
      >
        SKIP ▶
      </button>
    </div>
  );
}

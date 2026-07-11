import React, { useEffect, useRef, useState, useCallback } from "react";
import IronWorkout from "./IronWorkout.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { sfxWhoosh, sfxPlateClank } from "../../lib/sfx.js";
import "../../styles/workout.css";

/* ═══════════════════════════════════════════════════════════════
   WORKOUT MODE — "the plate on the floor"
   The mini plate lives in the top bar. Tap it and the app recedes
   like a gym seen through chalk haze; the plate flies from its
   corner, drops center stage with a CLANK and opens into THE IRON.
   Closing plays the reverse: clank, shrink, back to the corner.
   Phases: fly → open → closing → (unmount)
   Mirrors FieldJournalMode so the two modes feel like siblings.
   ═══════════════════════════════════════════════════════════════ */

const FLY_MS = 950;
const CLOSE_MS = 850;

function getLaunchRect() {
  try {
    const btn = document.querySelector(".app-topbar__workout .iw-mini");
    if (btn) return btn.getBoundingClientRect();
  } catch { /* silent */ }
  // fallback: top-right corner
  return { left: window.innerWidth - 160, top: 10, width: 34, height: 34 };
}

function getLandingRect() {
  // mirrors .iw-plate3d: min(78vw, 320px) round plate with ~46px headroom
  const w = Math.min(window.innerWidth * 0.78, 320);
  return { left: (window.innerWidth - w) / 2, top: 46, width: w, height: w };
}

/* chalk dust — one small canvas, rAF, hidden-tab aware.
   Unlike the journal's rising gold, chalk hangs and settles downward. */
function ChalkDust({ active }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!active) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);
    const N = 34;
    const motes = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: (0.5 + Math.random() * 1.9) * dpr,
      vx: (Math.random() - 0.5) * 0.1 * dpr,
      vy: (0.03 + Math.random() * 0.13) * dpr,
      tw: Math.random() * Math.PI * 2,
      ts: 0.006 + Math.random() * 0.018,
    }));
    const tick = () => {
      if (!running) return;
      if (document.hidden) { raf = requestAnimationFrame(tick); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const m of motes) {
        m.x += m.vx; m.y += m.vy; m.tw += m.ts;
        if (m.y > canvas.height + 8) { m.y = -8; m.x = Math.random() * canvas.width; }
        if (m.x < -8) m.x = canvas.width + 8;
        if (m.x > canvas.width + 8) m.x = -8;
        const a = 0.10 + 0.18 * (0.5 + Math.sin(m.tw) / 2);
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 228, 218, ${a.toFixed(3)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [active]);
  return <canvas ref={canvasRef} className="iwm-dust" aria-hidden="true" />;
}

export default function WorkoutMode({ open, onClose, onRecommit }) {
  const { settings } = useAppData();
  const reduced = Boolean(settings.reducedMotion) ||
    (typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const [phase, setPhase] = useState("fly"); // fly | open | closing
  const flyerRef = useRef(null);
  const closingRef = useRef(false);

  /* recede the app + lock body scroll while the mode is up */
  useEffect(() => {
    if (!open) return undefined;
    document.body.classList.add("iw-mode-on");
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.classList.remove("iw-mode-on");
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  /* enter: fly the plate from the topbar corner to center stage */
  useEffect(() => {
    if (!open) return undefined;
    setPhase("fly");
    closingRef.current = false;
    if (reduced) { setPhase("open"); return undefined; }
    sfxWhoosh(settings);
    const from = getLaunchRect();
    const to = getLandingRect();
    const el = flyerRef.current;
    let t = null;
    if (el && el.animate) {
      el.animate(
        [
          {
            left: `${from.left}px`, top: `${from.top}px`,
            width: `${from.width}px`, height: `${from.height}px`,
            opacity: 0.9, transform: "rotateZ(-160deg)",
          },
          {
            left: `${to.left}px`, top: `${to.top}px`,
            width: `${to.width}px`, height: `${to.height}px`,
            opacity: 1, transform: "rotateZ(0deg)",
          },
        ],
        { duration: FLY_MS, easing: "cubic-bezier(.3,.9,.28,1.04)", fill: "forwards" }
      );
      t = setTimeout(() => {
        sfxPlateClank(settings);
        setPhase("open");
      }, FLY_MS + 40);
    } else {
      setPhase("open");
    }
    return () => { if (t) clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reduced]);

  /* exit: clank the plate and shrink back to the corner */
  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    sfxPlateClank(settings);
    if (reduced) { onClose(); return; }
    setPhase("closing");
    const from = getLandingRect();
    const to = getLaunchRect();
    // flyer animates on the next frame, once it's back in the tree
    requestAnimationFrame(() => {
      const el = flyerRef.current;
      if (el && el.animate) {
        el.animate(
          [
            {
              left: `${from.left}px`, top: `${from.top}px`,
              width: `${from.width}px`, height: `${from.height}px`,
              opacity: 1, transform: "rotateZ(0deg)",
            },
            {
              left: `${to.left}px`, top: `${to.top}px`,
              width: `${to.width}px`, height: `${to.height}px`,
              opacity: 0.55, transform: "rotateZ(-160deg)",
            },
          ],
          { duration: CLOSE_MS, easing: "cubic-bezier(.5,.02,.55,1)", fill: "forwards" }
        );
      }
    });
    setTimeout(onClose, CLOSE_MS + 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, reduced]);

  /* escape racks the plate */
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") requestClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, requestClose]);

  if (!open) return null;

  const inTransit = phase === "fly" || phase === "closing";

  return (
    <div className={`iwm-overlay ${phase === "closing" ? "iwm-closing" : ""}`} role="dialog" aria-label="The Iron — Workout Mode">
      <div className="iwm-gym" aria-hidden="true" />
      {!reduced && <ChalkDust active={open && !document.hidden} />}

      {inTransit && (
        <div ref={flyerRef} className="iwm-flyer" aria-hidden="true">
          <div className="iwm-flyer-ring" />
          <div className="iwm-flyer-face">
            <span className="iwm-flyer-title">IRON</span>
          </div>
        </div>
      )}

      {phase === "open" && (
        <div className="iwm-stage">
          <IronWorkout startOpen onExit={requestClose} onRecommit={onRecommit} />
        </div>
      )}
    </div>
  );
}

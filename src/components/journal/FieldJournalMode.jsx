import React, { useEffect, useRef, useState, useCallback } from "react";
import FieldJournal from "./FieldJournal.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { sfxWhoosh, sfxBookThump } from "../../lib/sfx.js";
import "../../styles/journal.css";

/* ═══════════════════════════════════════════════════════════════
   JOURNAL MODE — "the book on the desk"
   The mini book lives in the top bar. Tap it and the app recedes
   like a map set down on a desk; the book flies from its corner,
   lands center stage and opens into the Field Journal. Closing
   plays the reverse: thump, shrink, back to the corner.
   Phases: fly → open → closing → (unmount)
   ═══════════════════════════════════════════════════════════════ */

const FLY_MS = 950;
const CLOSE_MS = 850;

function getLaunchRect() {
  try {
    const btn = document.querySelector(".app-topbar__journal .fj-mini");
    if (btn) return btn.getBoundingClientRect();
  } catch { /* silent */ }
  // fallback: top-right corner
  return { left: window.innerWidth - 120, top: 10, width: 34, height: 44 };
}

function getLandingRect() {
  // mirrors .fj-book3d: min(78vw, 300px) wide, 3/4.3 aspect, centered in a
  // 520px frame with ~46px of headroom above the cover
  const w = Math.min(window.innerWidth * 0.78, 300);
  const h = (w * 4.3) / 3;
  return { left: (window.innerWidth - w) / 2, top: 46, width: w, height: h };
}

/* gold-dust motes — one small canvas, rAF, hidden-tab aware */
function GoldDust({ active }) {
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
    const N = 36;
    const motes = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: (0.6 + Math.random() * 1.7) * dpr,
      vx: (Math.random() - 0.5) * 0.12 * dpr,
      vy: (-0.05 - Math.random() * 0.16) * dpr,
      tw: Math.random() * Math.PI * 2,
      ts: 0.008 + Math.random() * 0.02,
    }));
    const tick = () => {
      if (!running) return;
      if (document.hidden) { raf = requestAnimationFrame(tick); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const m of motes) {
        m.x += m.vx; m.y += m.vy; m.tw += m.ts;
        if (m.y < -8) { m.y = canvas.height + 8; m.x = Math.random() * canvas.width; }
        if (m.x < -8) m.x = canvas.width + 8;
        if (m.x > canvas.width + 8) m.x = -8;
        const a = 0.14 + 0.24 * (0.5 + Math.sin(m.tw) / 2);
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 209, 102, ${a.toFixed(3)})`;
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
  return <canvas ref={canvasRef} className="fjm-dust" aria-hidden="true" />;
}

export default function FieldJournalMode({ open, onClose }) {
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
    document.body.classList.add("fj-mode-on");
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.classList.remove("fj-mode-on");
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  /* enter: fly the book from the topbar corner to center stage */
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
            opacity: 0.9, transform: "rotateZ(-9deg) rotateY(18deg)",
          },
          {
            left: `${to.left}px`, top: `${to.top}px`,
            width: `${to.width}px`, height: `${to.height}px`,
            opacity: 1, transform: "rotateZ(0deg) rotateY(0deg)",
          },
        ],
        { duration: FLY_MS, easing: "cubic-bezier(.3,.9,.28,1.04)", fill: "forwards" }
      );
      t = setTimeout(() => {
        sfxBookThump(settings);
        setPhase("open");
      }, FLY_MS + 40);
    } else {
      setPhase("open");
    }
    return () => { if (t) clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reduced]);

  /* exit: thump the cover shut and shrink back to the corner */
  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    sfxBookThump(settings);
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
              opacity: 0.55, transform: "rotateZ(-9deg)",
            },
          ],
          { duration: CLOSE_MS, easing: "cubic-bezier(.5,.02,.55,1)", fill: "forwards" }
        );
      }
    });
    setTimeout(onClose, CLOSE_MS + 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, reduced]);

  /* escape closes the book */
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") requestClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, requestClose]);

  if (!open) return null;

  const inTransit = phase === "fly" || phase === "closing";

  return (
    <div className={`fjm-overlay ${phase === "closing" ? "fjm-closing" : ""}`} role="dialog" aria-label="The Field Journal">
      <div className="fjm-desk" aria-hidden="true" />
      {!reduced && <GoldDust active={open && !document.hidden} />}

      {inTransit && (
        <div ref={flyerRef} className="fjm-flyer" aria-hidden="true">
          <div className="fjm-flyer-spine" />
          <div className="fjm-flyer-face">
            <span className="fjm-flyer-rule" />
            <span className="fjm-flyer-title">FJ</span>
            <span className="fjm-flyer-rule" />
          </div>
        </div>
      )}

      {phase === "open" && (
        <div className="fjm-stage">
          <FieldJournal startOpen onExit={requestClose} />
        </div>
      )}
    </div>
  );
}

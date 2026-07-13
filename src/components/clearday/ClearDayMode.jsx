import React, { useEffect, useRef, useState, useCallback } from "react";
import ClearDay from "./ClearDay.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { sfxHalo, sfxWhoosh } from "../../lib/sfx.js";
import "../../styles/clearday.css";

/* ═══════════════════════════════════════════════════════════════
   CLEARDAY MODE — "first light"
   The mini sun lives in the top bar. Tap it and the app goes dark
   like the hour before dawn; a horizon line draws itself across
   the screen, the sun breaks it, and CLEARDAY opens in the glow.
   Closing plays dusk: the sun sinks back below the line.
   Phases: dawn → open → closing → (unmount)
   Mirrors WorkoutMode / FieldJournalMode so the modes feel like
   siblings.
   ═══════════════════════════════════════════════════════════════ */

const DAWN_MS = 1350;
const CLOSE_MS = 700;

export default function ClearDayMode({ open, onClose }) {
  const { settings } = useAppData();
  const reduced =
    Boolean(settings.reducedMotion) ||
    (typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const [phase, setPhase] = useState("dawn"); // dawn | open | closing
  const closingRef = useRef(false);

  /* lock body scroll while the mode is up */
  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  /* enter: the dawn break */
  useEffect(() => {
    if (!open) return undefined;
    closingRef.current = false;
    if (reduced) {
      setPhase("open");
      return undefined;
    }
    setPhase("dawn");
    sfxHalo(settings);
    const t = setTimeout(() => setPhase("open"), DAWN_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reduced]);

  /* exit: dusk */
  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    sfxWhoosh(settings);
    if (reduced) {
      onClose();
      return;
    }
    setPhase("closing");
    setTimeout(onClose, CLOSE_MS + 40);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, reduced]);

  /* escape closes — but never mid-typing (identity statements, tapes) */
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      const el = document.activeElement;
      const tag = el && el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (el && el.isContentEditable)) return;
      requestClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, requestClose]);

  if (!open) return null;

  return (
    <div
      className={`cd-overlay ${phase === "closing" ? "cd-closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="CLEARDAY"
    >
      {phase === "dawn" && (
        <div className="cd-dawnbreak" aria-hidden="true">
          <div className="cd-dawnbreak__line" />
          <div className="cd-dawnbreak__sun" />
          <div className="cd-dawnbreak__word">CLEARDAY</div>
        </div>
      )}
      {phase !== "dawn" && (
        <div className="cd-stage">
          <ClearDay onExit={requestClose} settings={settings} />
        </div>
      )}
    </div>
  );
}

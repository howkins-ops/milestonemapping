import React, { useRef, useEffect, useCallback } from "react";
import { useAppData } from "../../hooks/useAppData.js";
import { useShadowWork } from "../shadow/useShadowWork.js";
import { XP_VALUES } from "../../lib/gamification.js";
import RideTheWave from "../shadow/RideTheWave.jsx";
import "../../styles/wave.css";

// ─────────────────────────────────────────────────────────────────────────
// Fullscreen "Ride the Wave" overlay, opened from the top-bar SOS button so
// it's reachable mid-panic from anywhere. Its finish() mirrors the Shadow
// hub's reward wiring (own hook instances — a shared hook would leave the
// hub's trail stale), then closes the overlay.
// ─────────────────────────────────────────────────────────────────────────
export default function AnxietySOS({ open, onClose }) {
  const { addXP, unlockAchievement, celebrate } = useAppData();
  const { recordCompletion } = useShadowWork();
  const overlayRef = useRef(null);

  const finish = useCallback((tool, takeaway, opts = {}) => {
    const res = recordCompletion({ tool, takeaway, essence: opts.essence });
    const xp = opts.xp ?? (opts.transmuted ? XP_VALUES.shadowTransmutation : XP_VALUES.shadowToolCompleted);
    addXP(xp, `${tool} complete`);
    if (opts.transmuted) unlockAchievement("shadow_alchemist");
    (opts.achievements || []).forEach((id) => unlockAchievement(id));
    if (res.newEssence) {
      celebrate({
        variant: "reward",
        title: "ESSENCE RECLAIMED",
        subtitle: opts.essence ? `${opts.essence.name} → ${opts.essence.essence}` : "A shadow turned to gold.",
        detail: "Added to your Essence Gallery.",
      });
    }
    onClose?.();
  }, [recordCompletion, addXP, unlockAchievement, celebrate, onClose]);

  // Focus the overlay + lock body scroll while the game is open.
  useEffect(() => {
    if (!open) return undefined;
    overlayRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="wave-overlay"
      ref={overlayRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="Ride the Wave"
      onKeyDown={(e) => { if (e.key === "Escape") onClose?.(); }}
    >
      <div className="wave-overlay__inner">
        <RideTheWave onClose={() => onClose?.()} onFinish={finish} />
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";

// The burning fuse — a live countdown rendered as a fuse burning toward a bomb.
// PERFORMANCE LAW (§3): compositor-only. We tick ONCE per second (cheap DOM
// text + a transform update) and let CSS `transition: transform 1s linear`
// smooth the burn between ticks — no requestAnimationFrame, no per-frame work,
// only `transform`/`opacity` animate. Reduced motion drops the transition to a
// static snap. Everything here is safe when the vow is not `live`.

function prefersReducedMotion() {
  try {
    return (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  } catch {
    return false;
  }
}

// Whole seconds remaining → "2d 04h", "3:41:20", or "04:12".
function fmtRemaining(secs) {
  const s = Math.max(0, Math.floor(secs));
  const days = Math.floor(s / 86400);
  const hrs = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  if (days > 0) return `${days}d ${pad(hrs)}h ${pad(mins)}m`;
  if (hrs > 0) return `${hrs}:${pad(mins)}:${pad(sec)}`;
  return `${pad(mins)}:${pad(sec)}`;
}

// remaining fraction of the fuse still to burn (1 = full, 0 = detonated)
function liveFraction(createdAt, dueAt, now) {
  const start = new Date(createdAt).getTime();
  const end = new Date(dueAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return end > now ? 1 : 0;
  }
  const frac = (end - now) / (end - start);
  return Math.max(0, Math.min(1, frac));
}

export default function VowFuse({ createdAt, dueAt, status = "live", onExpire }) {
  const liveRef = useRef(null);
  const flameRef = useRef(null);
  const firedRef = useRef(false);
  const reduced = prefersReducedMotion();

  const dueMs = new Date(dueAt).getTime();
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, Math.floor((dueMs - Date.now()) / 1000))
  );

  // Paint the fuse from a fraction remaining (0..1). transform only.
  // flameRef is a full-width wrapper, so translateX(%) maps to track width.
  const paint = (frac) => {
    if (liveRef.current) liveRef.current.style.transform = `scaleX(${frac})`;
    if (flameRef.current) flameRef.current.style.transform = `translateX(${(1 - frac) * 100}%)`;
  };

  useEffect(() => {
    // Non-live vows are frozen: paint their final state, no ticking.
    if (status === "defused") {
      paint(1);
      return undefined;
    }
    if (status === "detonated") {
      paint(0);
      return undefined;
    }

    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      const now = Date.now();
      const secs = Math.max(0, Math.floor((dueMs - now) / 1000));
      setRemaining(secs);
      paint(liveFraction(createdAt, dueAt, now));
      if (secs <= 0 && !firedRef.current) {
        firedRef.current = true;
        if (onExpire) onExpire();
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdAt, dueAt, status, dueMs]);

  const phase =
    status === "defused"
      ? "defused"
      : status === "detonated" || remaining <= 0
        ? "detonated"
        : remaining < 3600
          ? "crit"
          : remaining < 6 * 3600
            ? "warn"
            : "safe";

  const flame =
    phase === "defused" ? "✅" : phase === "detonated" ? "💥" : "🔥";

  return (
    // detonation quakes the whole fuse block; the 💥 blast itself is a
    // vow-blast 3D keyframe on the flame (see TheVow.css)
    <div className={`vow-fuse vow-fuse--${phase} ${phase === "detonated" ? "a3d-quake" : ""}`}>
      <div className="vow-fuse__track" aria-hidden="true">
        <div
          ref={liveRef}
          className={`vow-fuse__live${reduced ? " vow-fuse__live--static" : ""}`}
        />
        <span
          ref={flameRef}
          className={`vow-fuse__flamewrap${reduced ? " vow-fuse__flamewrap--static" : ""}`}
        >
          <span className="vow-fuse__flame">{flame}</span>
        </span>
        <span className="vow-fuse__bomb">🧨</span>
      </div>
      <div className="vow-fuse__foot">
        <span
          className={`vow-count vow-count--${phase} ${
            phase === "defused" ? "a3d-flipX" : phase === "detonated" ? "a3d-slam" : ""
          }`}
        >
          {phase === "defused"
            ? "DEFUSED"
            : phase === "detonated"
              ? "TIME'S UP"
              : fmtRemaining(remaining)}
        </span>
        <span className="vow-fuse__hint">
          {phase === "defused"
            ? "proof posted · kept"
            : phase === "detonated"
              ? "re-vow in one tap"
              : "post proof to defuse before it hits the bomb"}
        </span>
      </div>
    </div>
  );
}

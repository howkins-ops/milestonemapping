import { useState, useRef, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────
// Drives the "ride" phase: alternating inhale / exhale, seconds remaining,
// smooth 0..1 progress within a phase, and a count of completed breath cycles.
// It is *only* a pacer — it reports the expected interaction and never judges
// whether the user matched it (that stays in the component, and is never a
// fail). Auto-stops after `cycles` full breaths and fires `onComplete`.
// ─────────────────────────────────────────────────────────────────────────
const TICK_MS = 100;

export function useBreathTimer({
  inhaleSeconds = 4,
  exhaleSeconds = 6,
  cycles = 5,
  running = false,
  onPhaseChange,
  onCycleComplete,
  onComplete,
} = {}) {
  const [phase, setPhase] = useState("inhale"); // "inhale" | "exhale"
  const [remaining, setRemaining] = useState(inhaleSeconds);
  const [progress, setProgress] = useState(0); // within current phase, 0..1
  const [cycle, setCycle] = useState(0); // completed full cycles

  // Engine state in a ref so the interval closure stays stable across renders.
  const eng = useRef({ phase: "inhale", t: 0, cycle: 0, done: false });
  const cbs = useRef({ onPhaseChange, onCycleComplete, onComplete });
  cbs.current = { onPhaseChange, onCycleComplete, onComplete };

  const reset = useCallback(() => {
    eng.current = { phase: "inhale", t: 0, cycle: 0, done: false };
    setPhase("inhale");
    setRemaining(inhaleSeconds);
    setProgress(0);
    setCycle(0);
  }, [inhaleSeconds]);

  useEffect(() => {
    if (!running) return undefined;
    // Announce the phase we're (re)starting on, so the first inhale cue fires.
    cbs.current.onPhaseChange?.(eng.current.phase);

    const id = setInterval(() => {
      const e = eng.current;
      if (e.done) return;
      e.t += TICK_MS / 1000;
      const dur = e.phase === "inhale" ? inhaleSeconds : exhaleSeconds;

      if (e.t < dur) {
        setRemaining(Math.max(1, Math.ceil(dur - e.t)));
        setProgress(Math.min(1, e.t / dur));
        return;
      }

      // Crossed a phase boundary.
      if (e.phase === "inhale") {
        e.phase = "exhale";
        e.t = 0;
        setPhase("exhale");
        setRemaining(exhaleSeconds);
        setProgress(0);
        cbs.current.onPhaseChange?.("exhale");
        return;
      }

      // Just finished an exhale → one full cycle done.
      e.cycle += 1;
      setCycle(e.cycle);
      cbs.current.onCycleComplete?.(e.cycle);
      if (e.cycle >= cycles) {
        e.done = true;
        setProgress(1);
        cbs.current.onComplete?.();
        return;
      }
      e.phase = "inhale";
      e.t = 0;
      setPhase("inhale");
      setRemaining(inhaleSeconds);
      setProgress(0);
      cbs.current.onPhaseChange?.("inhale");
    }, TICK_MS);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, inhaleSeconds, exhaleSeconds, cycles]);

  return { phase, remaining, progress, cycle, reset };
}

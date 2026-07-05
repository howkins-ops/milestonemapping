// Arena FX hooks — the reusable motion layer for the Squad Arena.
// Mobile-first & performance-lawful (SQUAD-ARENA-APP-BUILD-PROMPT §3):
// no mouse/scroll per-frame handlers, only compositor-friendly work,
// everything inert when off-screen or when reduced-motion is set.

import { useCallback, useEffect, useRef, useState } from "react";
import { isSfxMuted, onSfxMuteChange, toggleSfxMute } from "../../../lib/sfx.js";

// Module-scoped bridge so any component can pop a spark burst on the single
// shared <EmberCanvas/> without prop-drilling. The canvas registers its spawn
// fn here on mount (mirrors the concept's window.Zfx.burst, but scoped).
let _burstFn = null;
export function registerBurst(fn) {
  _burstFn = fn;
  return () => {
    if (_burstFn === fn) _burstFn = null;
  };
}

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

// Returns burst(x, y, tint?) — a short spark pop at viewport coordinates.
// tint is an optional brand color name / hex (defaults to the fire tint).
// No-op (but always safe to call) when no canvas is mounted.
export function useArenaBurst() {
  return useCallback((x, y, tint) => {
    if (_burstFn) {
      try {
        _burstFn(x, y, tint);
      } catch {
        /* never let an FX pop break an interaction */
      }
    }
  }, []);
}

// IntersectionObserver entrance reveal (fade + rise). Add the returned ref to
// an element and pair with `.arena-reveal` in CSS; the observer adds `.is-in`
// once it scrolls into view, then disconnects. No scroll listener. Reduced
// motion (or missing IO) reveals immediately.
export function useReveal(options = {}) {
  const externalRef = options.ref;
  const internalRef = useRef(null);
  const ref = externalRef || internalRef;
  const { threshold = 0.12, rootMargin = "0px 0px -8% 0px" } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      el.classList.add("is-in");
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, threshold, rootMargin]);

  return ref;
}

// Live mute state + a toggle, wired to the persisted sfx mute. Lets a sound
// button reflect and flip the global mute without re-rendering the tree.
export function useSfxMute() {
  const [muted, setMuted] = useState(() => isSfxMuted());
  useEffect(() => onSfxMuteChange((m) => setMuted(m)), []);
  const toggle = useCallback(() => {
    toggleSfxMute();
  }, []);
  return { muted, toggle };
}

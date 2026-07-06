// Arena FX hooks — the reusable motion layer for the Squad Arena.
// Mobile-first & performance-lawful (SQUAD-ARENA-APP-BUILD-PROMPT §3):
// only compositor-friendly work, everything inert when off-screen or when
// reduced-motion is set. One sanctioned exception (Jon-approved 2026-07-06):
// useCardTilt's DESKTOP-ONLY pointer tilt — rAF-throttled, transform-vars
// only, gated to (hover:hover)+(pointer:fine), never attached on touch.

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

// Desktop-only pointer-tracking 3D tilt. Attach the returned ref to a card;
// pair with CSS that consumes --rx/--ry (rotate) and --mx/--my (glare position),
// e.g. `transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))`.
// Cheap by construction: the pointermove listener exists only while hovered,
// writes are rAF-coalesced, and only CSS custom props consumed by transform
// change — no layout, no paint outside the card. No-ops entirely on touch
// devices and under prefers-reduced-motion, so the mobile perf law holds.
export function useCardTilt({ max = 10 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let allowed = false;
    try {
      allowed =
        window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      allowed = false;
    }
    if (!allowed) return undefined;

    let raf = 0;
    let rect = null;
    let px = 0;
    let py = 0;

    const apply = () => {
      raf = 0;
      if (!rect || rect.width === 0 || rect.height === 0) return;
      const nx = Math.min(1, Math.max(0, (px - rect.left) / rect.width));
      const ny = Math.min(1, Math.max(0, (py - rect.top) / rect.height));
      const ry = (nx - 0.5) * 2 * max; // point right → turn right
      const rx = (0.5 - ny) * 2 * max; // point up → lean back
      el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
      el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      el.style.setProperty("--mx", `${(nx * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(ny * 100).toFixed(1)}%`);
    };
    const move = (e) => {
      px = e.clientX;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const enter = () => {
      rect = el.getBoundingClientRect();
      el.classList.add("is-tilting");
      el.addEventListener("pointermove", move, { passive: true });
    };
    const leave = () => {
      el.removeEventListener("pointermove", move);
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      el.classList.remove("is-tilting");
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointermove", move);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [max]);

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

// ════════════════════════════════════════════════════════════════════════
// MAPQUEST WORLD — the FX core (Phase 1 · THE JUICE)
// One tiny imperative module, no React state, consumed by the scene, the
// mask battles and the cinematics. Every effect is a pooled node + a CSS
// keyframe — zero per-frame JS. All motion dies under the three reduced-
// motion gates (the pool simply refuses to spawn).
//
//   fx.shake(target, { amp, ms })   target = engine controls (preferred,
//                                   shakes the layers) or a viewport el
//   fx.flash(viewportEl, { color, ms })
//   fx.hitstop(controls, ms)        freeze the sim clock — weight, no jank
//   fx.burst(fxLayerEl, x, y, kind, n)   pooled particles at world coords
//   fx.ring(fxLayerEl, x, y, color)      expanding shockwave ring
//   fx.toast(viewportEl, text, color, opts)  floating combo/score pop
// ════════════════════════════════════════════════════════════════════════

import { JUICE } from "./worldFxTuning.js";

const KINDS = new Set(["dust", "spark", "ember", "confetti", "ripple", "streak"]);
const CONFETTI = ["#FF3EDB", "#FACC15", "#00F0FF", "#FF7A1A", "#7B2CFF"];

// Motion gate — all three reduced-motion laws in one check.
function motionOk(el) {
  try {
    if (!el) return false;
    if (typeof document !== "undefined") {
      const html = document.documentElement;
      if (html && html.getAttribute("data-reduced-motion") === "true") return false;
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return false;
    }
    const vp = el.classList && el.classList.contains("mqw-viewport") ? el : el.closest && el.closest(".mqw-viewport");
    if (vp && vp.classList.contains("mqw-viewport--still")) return false;
    return true;
  } catch {
    return false;
  }
}

/* ── Particle pool ────────────────────────────────────────────────────────
   Pre-creates JUICE.poolSize <i class="mqfx-p"> nodes inside the layer.
   Spawning = position + CSS vars + a kind class; `animationend` returns
   the node to the pool. The pool lives on the layer element (WeakMap) so
   scene remounts never leak. */

const pools = new WeakMap();

function getPool(layerEl) {
  let pool = pools.get(layerEl);
  if (pool) return pool;
  const free = [];
  for (let i = 0; i < JUICE.poolSize; i += 1) {
    const node = document.createElement("i");
    node.className = "mqfx-p";
    node.addEventListener("animationend", () => {
      node.className = "mqfx-p"; // strip the kind → animation stops
      free.push(node);
    });
    layerEl.appendChild(node);
    free.push(node);
  }
  pool = { free };
  pools.set(layerEl, pool);
  return pool;
}

let burstSalt = 0; // event-time variety — never runs during render

/* Spawn n particles of `kind` at world coords (x px from world left,
   y px above the street line). Pool-capped: if the pool is dry the burst
   just gets smaller — never more than poolSize nodes exist. */
function burst(layerEl, x, y, kind = "dust", n = 4, color = null) {
  try {
    if (!layerEl || !KINDS.has(kind) || !motionOk(layerEl)) return;
    const pool = getPool(layerEl);
    for (let i = 0; i < n; i += 1) {
      const node = pool.free.pop();
      if (!node) return;
      burstSalt = (burstSalt + 1) % 9973;
      const t = (i + 1) / n;
      const jitter = ((burstSalt * 37) % 100) / 100 - 0.5; // -0.5..0.5
      const ang = t * Math.PI * 2 + jitter;
      const dist = kind === "confetti" ? 26 + t * 22 : 16 + t * 26;
      node.style.left = `${Math.round(x)}px`;
      node.style.setProperty("--fy", `${Math.round(y)}px`);
      node.style.setProperty("--px", `${Math.round(Math.cos(ang) * dist)}px`);
      node.style.setProperty("--py", `${Math.round(Math.abs(Math.sin(ang)) * dist + 8)}px`);
      node.style.setProperty("--c", color || (kind === "confetti" ? CONFETTI[i % CONFETTI.length] : ""));
      // re-add the kind class on the next frame so the animation restarts
      node.className = `mqfx-p mqfx-p--${kind}`;
    }
  } catch {
    /* fx is garnish */
  }
}

/* ── Shockwave ring ──────────────────────────────────────────────────────
   Few and chunky — created on demand, removed on animationend, capped. */

const RING_CAP = 4;
const ringCounts = new WeakMap();

function ring(layerEl, x, y, color = "#00F0FF") {
  try {
    if (!layerEl || !motionOk(layerEl)) return;
    const count = ringCounts.get(layerEl) || 0;
    if (count >= RING_CAP) return;
    ringCounts.set(layerEl, count + 1);
    const node = document.createElement("i");
    node.className = "mqfx-ring";
    node.style.left = `${Math.round(x)}px`;
    node.style.setProperty("--fy", `${Math.round(y)}px`);
    node.style.setProperty("--c", color);
    node.addEventListener("animationend", () => {
      node.remove();
      ringCounts.set(layerEl, Math.max(0, (ringCounts.get(layerEl) || 1) - 1));
    });
    layerEl.appendChild(node);
  } catch {
    /* fx is garnish */
  }
}

/* ── Camera shake ────────────────────────────────────────────────────────
   Preferred target: engine controls with addShake (Phase 2 — shakes the
   transformed layers, one source of truth). Fallback: a viewport class. */

function shake(target, { amp = JUICE.shakeAmp, ms = JUICE.shakeMs } = {}) {
  try {
    if (target && typeof target.addShake === "function") {
      target.addShake(amp, ms);
      return;
    }
    const el = target;
    if (!el || !el.classList || !motionOk(el)) return;
    el.style.setProperty("--mqfx-amp", `${amp}px`);
    el.classList.remove("mqfx-shake");
    void el.offsetWidth; // restart the keyframe
    el.classList.add("mqfx-shake");
    clearTimeout(el._mqfxShakeT);
    el._mqfxShakeT = setTimeout(() => el.classList.remove("mqfx-shake"), ms + 40);
  } catch {
    /* fx is garnish */
  }
}

/* ── Impact flash ──────────────────────────────────────────────────────── */

function flash(viewportEl, { color = "#00F0FF", ms = 90 } = {}) {
  try {
    if (!viewportEl || !motionOk(viewportEl)) return;
    let node = viewportEl.querySelector(":scope > .mqfx-flash");
    if (!node) {
      node = document.createElement("div");
      node.className = "mqfx-flash";
      node.setAttribute("aria-hidden", "true");
      viewportEl.appendChild(node);
    }
    node.style.setProperty("--c", color);
    node.style.setProperty("--ms", `${ms}ms`);
    node.classList.remove("is-on");
    void node.offsetWidth;
    node.classList.add("is-on");
  } catch {
    /* fx is garnish */
  }
}

/* ── Hit-stop ──────────────────────────────────────────────────────────── */

function hitstop(controls, ms = JUICE.hitstopMs) {
  try {
    if (controls && typeof controls.freeze === "function") controls.freeze(ms);
  } catch {
    /* fx is garnish */
  }
}

/* ── Floating toast (the quip pattern, generalized) ───────────────────── */

const TOAST_CAP = 3;

function toast(viewportEl, text, color = "#00F0FF", { x = null, y = null, big = false } = {}) {
  try {
    if (!viewportEl) return;
    const live = viewportEl.querySelectorAll(":scope > .mqfx-toast").length;
    if (live >= TOAST_CAP) return;
    const node = document.createElement("span");
    node.className = `mqfx-toast${big ? " mqfx-toast--big" : ""}`;
    node.setAttribute("role", "status");
    node.textContent = text;
    node.style.setProperty("--c", color);
    if (x != null) node.style.left = `${Math.round(x)}px`;
    if (y != null) node.style.top = `${Math.round(y)}px`;
    if (!motionOk(viewportEl)) {
      // reduced motion: appear, hold, vanish — no float
      node.classList.add("is-still");
      viewportEl.appendChild(node);
      setTimeout(() => node.remove(), 1400);
      return;
    }
    node.addEventListener("animationend", () => node.remove());
    viewportEl.appendChild(node);
  } catch {
    /* fx is garnish */
  }
}

const fx = { burst, ring, shake, flash, hitstop, toast, motionOk };
export default fx;

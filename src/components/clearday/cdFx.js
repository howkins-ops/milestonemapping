// ════════════════════════════════════════════════════════════════════════
// CLEARDAY FX — the dopamine layer.
// Structural sibling of city/world/fx.js (pooled nodes + CSS keyframes,
// zero per-frame JS) re-skinned for CLEARDAY: viewport top/left coords,
// dawn palette, one fixed layer owned by ClearDayMode. All motion dies
// under the reduced-motion gates — the pool simply refuses to spawn.
//
//   registerCdFxLayer(el)          ClearDayMode owns the layer
//   cdFx.burst(x, y, kind, n, c)   pooled particles at viewport coords
//   cdFx.ring(x, y, color)         expanding shockwave ring
//   cdFx.flare(color)              bottom-anchored sunrise flash
//   cdFx.sunrise()                 the full day-won moment
// ════════════════════════════════════════════════════════════════════════

const POOL_SIZE = 40;
const KINDS = new Set(["ember", "spark", "petal", "ray"]);
const DAWN_PETALS = ["#5e9df0", "#4fd1c5", "#f0b45e", "#eef3f8"];

let layerEl = null;

export function registerCdFxLayer(el) {
  layerEl = el || null;
}

function motionOk() {
  try {
    if (!layerEl || !layerEl.isConnected) return false;
    const html = document.documentElement;
    if (html && html.getAttribute("data-reduced-motion") === "true") return false;
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/* ── Particle pool — pre-created once per layer, recycled forever ─────── */

const pools = new WeakMap();

function getPool(el) {
  let pool = pools.get(el);
  if (pool) return pool;
  const free = [];
  for (let i = 0; i < POOL_SIZE; i += 1) {
    const node = document.createElement("i");
    node.className = "cdfx-p";
    node.addEventListener("animationend", () => {
      node.className = "cdfx-p"; // strip the kind → animation stops
      free.push(node);
    });
    el.appendChild(node);
    free.push(node);
  }
  pool = { free };
  pools.set(el, pool);
  return pool;
}

let salt = 0; // event-time variety — never runs during render

/* Spawn n particles of `kind` at viewport coords. Pool-capped: a dry pool
   just makes the burst smaller — never more than POOL_SIZE nodes exist. */
function burst(x, y, kind = "spark", n = 10, color = null) {
  try {
    if (!KINDS.has(kind) || !motionOk()) return;
    const pool = getPool(layerEl);
    for (let i = 0; i < n; i += 1) {
      const node = pool.free.pop();
      if (!node) return;
      salt = (salt + 1) % 9973;
      const t = (i + 1) / n;
      const jitter = ((salt * 37) % 100) / 100 - 0.5;
      const ang = t * Math.PI * 2 + jitter;
      const dist =
        kind === "petal" ? 44 + t * 46 :
        kind === "ember" ? 30 + t * 40 :
        kind === "ray" ? 60 + t * 50 :
        26 + t * 44;
      node.style.left = `${Math.round(x)}px`;
      node.style.top = `${Math.round(y)}px`;
      node.style.setProperty("--px", `${Math.round(Math.cos(ang) * dist)}px`);
      // embers drift up; everything else scatters radially
      node.style.setProperty(
        "--py",
        `${Math.round(kind === "ember" ? -(dist * 0.9 + 24) : Math.sin(ang) * dist)}px`
      );
      node.style.setProperty("--c", color || DAWN_PETALS[(salt + i) % DAWN_PETALS.length]);
      node.className = `cdfx-p cdfx-p--${kind}`;
    }
  } catch {
    /* fx is garnish */
  }
}

/* ── Shockwave ring — created on demand, capped ───────────────────────── */

const RING_CAP = 4;
let ringCount = 0;

function ring(x, y, color = "#5e9df0") {
  try {
    if (!motionOk() || ringCount >= RING_CAP) return;
    ringCount += 1;
    const node = document.createElement("i");
    node.className = "cdfx-ring";
    node.style.left = `${Math.round(x)}px`;
    node.style.top = `${Math.round(y)}px`;
    node.style.setProperty("--c", color);
    node.addEventListener("animationend", () => {
      node.remove();
      ringCount = Math.max(0, ringCount - 1);
    });
    layerEl.appendChild(node);
  } catch {
    /* fx is garnish */
  }
}

/* ── Sunrise flare — a wash of dawn light from the bottom edge ────────── */

function flare(color = "#5e9df0") {
  try {
    if (!motionOk()) return;
    let node = layerEl.querySelector(":scope > .cdfx-flare");
    if (!node) {
      node = document.createElement("div");
      node.className = "cdfx-flare";
      node.setAttribute("aria-hidden", "true");
      layerEl.appendChild(node);
    }
    node.style.setProperty("--c", color);
    node.classList.remove("is-on");
    void node.offsetWidth; // restart the keyframe
    node.classList.add("is-on");
  } catch {
    /* fx is garnish */
  }
}

/* ── The full day-won moment ──────────────────────────────────────────── */

function sunrise(color = "#5e9df0") {
  try {
    if (!motionOk()) return;
    flare(color);
    const W = window.innerWidth || 390;
    const H = window.innerHeight || 844;
    [0.25, 0.5, 0.75].forEach((fx, i) => {
      setTimeout(() => burst(W * fx, H * 0.7, "ember", 10, i === 1 ? "#f0b45e" : color), i * 120);
    });
  } catch {
    /* fx is garnish */
  }
}

/* Center-of-element helper for click handlers: cdFx.burstFrom(e, ...) */
function burstFrom(e, kind = "spark", n = 10, color = null) {
  try {
    const r = e && e.currentTarget && e.currentTarget.getBoundingClientRect();
    if (!r) return;
    burst(r.left + r.width / 2, r.top + r.height / 2, kind, n, color);
  } catch {
    /* fx is garnish */
  }
}

function ringFrom(e, color = "#5e9df0") {
  try {
    const r = e && e.currentTarget && e.currentTarget.getBoundingClientRect();
    if (!r) return;
    ring(r.left + r.width / 2, r.top + r.height / 2, color);
  } catch {
    /* fx is garnish */
  }
}

const cdFx = { burst, ring, flare, sunrise, burstFrom, ringFrom, motionOk };
export default cdFx;

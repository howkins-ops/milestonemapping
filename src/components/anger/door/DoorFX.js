/* ════════════════════════════════════════════════════════════════════════
   DOOR FX — the game-feel engine behind The Door.

   One canvas. One rAF. Fixed timestep. Zero allocation in the hot loop.
   Everything that makes a hit FEEL like a hit lives here: particles, blood
   decals, screen shake, hit-stop, impact frames, camera punch, projectiles.

   THE LAWS (same ones door-game.css already obeys):
     · React never re-renders during play. The engine writes CSS custom
       properties on the scene element and pixels on the canvas. Nothing else.
     · The particle pool is preallocated and recycled. `new` is never called
       inside step()/draw().
     · devicePixelRatio is clamped to 2. Mobile gets a smaller pool.
     · rAF is cancelled on tab-hide and on destroy().
     · prefers-reduced-motion kills shake, hit-stop, slow-mo and most particles
       but never breaks gameplay.

   Coordinates are scene-local CSS pixels — (0,0) is the top-left of the
   scene element, which is exactly what e.clientX - rect.left already gives
   the caller. DPR is handled internally.

   Usage:
     const fx = createDoorFX({ canvas, scene, camera });
     fx.emit("blood", x, y, { normal: -Math.PI / 2, power: 1 });
     fx.shake(0.6); fx.hitStop(70); fx.flash("#fff4d6", 90);
     fx.destroy();
   ════════════════════════════════════════════════════════════════════════ */

const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/* ── 1D value noise ───────────────────────────────────────────────────────
   Screen shake uses noise, NOT Math.random(). Random jitter reads as buzz;
   noise reads as weight — the camera has mass and swings through zero. */
const NOISE_N = 512;
const NOISE = new Float32Array(NOISE_N);
for (let i = 0; i < NOISE_N; i++) NOISE[i] = Math.random() * 2 - 1;
function noise1(t, seed) {
  const x = t + seed * 131.77;
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);                 // smoothstep
  const a = NOISE[((i % NOISE_N) + NOISE_N) % NOISE_N];
  const b = NOISE[(((i + 1) % NOISE_N) + NOISE_N) % NOISE_N];
  return a + (b - a) * u;
}

function isMobile() {
  try {
    return (window.matchMedia && window.matchMedia("(max-width: 700px)").matches) || window.innerWidth < 700;
  } catch { return false; }
}
function reducedMotion() {
  try {
    if (document.documentElement.getAttribute("data-reduced-motion") === "true") return true;
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  } catch { return false; }
}

/* ── particle presets ─────────────────────────────────────────────────────
   Every number here is the tuning. draw: how it renders. The rest is physics.
   `spread` is the half-angle of the emission cone around the surface normal. */
const PRESETS = {
  // Bare knuckles splitting open on a door. Sprays back along the normal.
  blood: {
    draw: "blob", count: [8, 14], speed: [60, 180], spread: 1.05,   // 120° cone
    gravity: 900, drag: 0.4, life: [700, 1400], size: [1.6, 4.4],
    colors: [[150, 6, 18], [122, 0, 12], [178, 14, 26], [96, 0, 8]],
    decayScale: 0.92, stains: true,
  },
  // Fat drips that fall off a wrecked hand between punches.
  drip: {
    draw: "drip", count: [1, 1], speed: [4, 22], spread: 0.35,
    gravity: 1150, drag: 0.05, life: [900, 1500], size: [2.2, 3.6],
    colors: [[136, 2, 14], [110, 0, 10]], stains: true,
  },
  // Wood torn out of a door panel.
  splinter: {
    draw: "shard", count: [6, 12], speed: [120, 320], spread: 1.2,
    gravity: 1100, drag: 0.25, life: [600, 1200], size: [2.5, 9],
    colors: [[122, 69, 35], [90, 48, 26], [58, 30, 14], [150, 96, 52]],
    spin: [-14, 14],
  },
  // Window glass. Catches the porch light on the way down.
  glass: {
    draw: "shard", count: [10, 18], speed: [40, 200], spread: 1.6,
    gravity: 1000, drag: 0.12, life: [900, 1800], size: [3, 11],
    colors: [[186, 224, 255], [136, 186, 232], [222, 244, 255]],
    spin: [-9, 9], glint: true, bounce: 0.22,
  },
  // Chainsaw teeth on steel. Additive, flickering, bounces off the porch.
  spark: {
    draw: "streak", count: [3, 6], speed: [200, 500], spread: 0.7,
    gravity: 600, drag: 0.5, life: [300, 700], size: [4, 9],
    colors: [[255, 246, 208], [255, 208, 96], [255, 158, 40]],
    additive: true, flicker: true, bounce: 0.34,
  },
  // Chainsaw teeth on wood. Slow, draggy, settles into a pile.
  sawdust: {
    draw: "blob", count: [4, 9], speed: [80, 200], spread: 1.35,
    gravity: 420, drag: 1.5, life: [800, 1600], size: [1.2, 3],
    colors: [[214, 176, 116], [186, 146, 90], [232, 204, 154]],
    settles: true,
  },
  // Impact puff / landing ring. Expands and fades, barely falls.
  dust: {
    draw: "puff", count: [5, 10], speed: [30, 110], spread: 1.9,
    gravity: -30, drag: 2.2, life: [500, 1000], size: [5, 16],
    colors: [[150, 140, 150], [120, 110, 124], [176, 166, 176]],
    grow: 2.4,
  },
  // Sweat/spit off a slapped head.
  sweat: {
    draw: "blob", count: [8, 14], speed: [200, 400], spread: 0.8,
    gravity: 950, drag: 0.3, life: [500, 950], size: [1.4, 3],
    colors: [[226, 244, 255], [190, 216, 240]],
  },
  // Big chunks — a door panel blowing out, a kicked-in board.
  debris: {
    draw: "shard", count: [5, 9], speed: [90, 260], spread: 1.4,
    gravity: 1300, drag: 0.18, life: [1000, 1900], size: [7, 20],
    colors: [[96, 54, 28], [66, 36, 18], [130, 80, 40]],
    spin: [-7, 7], bounce: 0.18,
  },
  // Punch-Out stun stars.
  star: {
    draw: "star", count: [3, 5], speed: [40, 90], spread: 3.14,
    gravity: -40, drag: 1.1, life: [700, 1100], size: [5, 9],
    colors: [[255, 226, 90], [255, 248, 190]],
    additive: true, spin: [-6, 6],
  },
};

const POOL_KEYS = Object.keys(PRESETS);

/* ════════════════════════════════════════════════════════════════════════ */
export function createDoorFX({ canvas, scene, camera } = {}) {
  if (!canvas) return createNullFX();
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return createNullFX();

  const camEl = camera || scene || null;
  const mobile = isMobile();
  const reduced = reducedMotion();

  /* ── particle pool ───────────────────────────────────────────────────── */
  let CAP = reduced ? 40 : mobile ? 400 : 900;
  const P = [];
  for (let i = 0; i < CAP; i++) P.push(newParticle());
  let head = 0;                                   // round-robin cursor
  let live = 0;

  function newParticle() {
    return {
      on: false, kind: "blood", draw: "blob",
      x: 0, y: 0, vx: 0, vy: 0, g: 0, drag: 0,
      life: 0, maxLife: 1, size: 1, sz0: 1,
      rot: 0, vrot: 0, r: 255, gg: 255, b: 255,
      add: false, flick: false, glint: false, grow: 0,
      bounce: 0, stain: false, settle: false, seed: 0,
    };
  }

  /* ── decal buffer — blood, chips, sawdust piles. Persists all level. ─── */
  const decalCv = document.createElement("canvas");
  const dctx = decalCv.getContext("2d", { alpha: true });

  /* ── state ───────────────────────────────────────────────────────────── */
  let W = 1, H = 1, DPR = 1;
  let raf = 0, running = false;
  let last = 0, acc = 0;
  const STEP = 1000 / 60;

  let trauma = 0;                                 // 0..1, shake = trauma²
  let stopUntil = 0;                              // hit-stop deadline (ms)
  let timeScale = 1, tsTarget = 1, tsUntil = 0;   // slow-mo
  let zoom = 1, zoomVel = 0;
  const flashes = [];                             // {r,g,b,a,t,dur,radial}
  let chroma = 0;                                 // chromatic-aberration energy
  let lightX = -1, lightY = -1, lightR = 0, lightA = 0; // travelling cut-glow

  const bodies = [];                              // projectiles
  const rects = new Map();                        // named collision targets
  let now = 0;

  // perf watchdog
  let slowFrames = 0, degraded = false;

  /* ── sizing ──────────────────────────────────────────────────────────── */
  function resize() {
    const host = scene || canvas.parentElement;
    const r = host ? host.getBoundingClientRect() : canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    DPR = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // Preserve existing decals across a resize (orientation change mid-level).
    if (decalCv.width !== canvas.width || decalCv.height !== canvas.height) {
      const keep = decalCv.width > 1 ? document.createElement("canvas") : null;
      if (keep) {
        keep.width = decalCv.width; keep.height = decalCv.height;
        keep.getContext("2d").drawImage(decalCv, 0, 0);
      }
      decalCv.width = canvas.width;
      decalCv.height = canvas.height;
      dctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (keep) dctx.drawImage(keep, 0, 0, W, H);
    }
  }

  /* ── emit ────────────────────────────────────────────────────────────── */
  function emit(kind, x, y, opts) {
    const pre = PRESETS[kind];
    if (!pre) return;
    const o = opts || {};
    const power = o.power == null ? 1 : o.power;
    let n = o.count != null ? o.count : Math.round(rand(pre.count[0], pre.count[1]) * (0.6 + power * 0.6));
    if (reduced) n = Math.min(n, 3);
    if (degraded) n = Math.max(1, n >> 1);

    // Direction: away from the surface. `normal` is radians; default straight up.
    const base = o.normal == null ? -Math.PI / 2 : o.normal;
    const spread = o.spread == null ? pre.spread : o.spread;
    const spdMul = (o.speed == null ? 1 : o.speed) * (0.7 + power * 0.5);

    for (let i = 0; i < n; i++) {
      const p = P[head];
      head = (head + 1) % CAP;
      if (!p.on) live++;

      const a = base + rand(-spread, spread);
      const s = rand(pre.speed[0], pre.speed[1]) * spdMul;
      const c = pre.colors[(Math.random() * pre.colors.length) | 0];

      p.on = true; p.kind = kind; p.draw = pre.draw;
      p.x = x + rand(-2, 2); p.y = y + rand(-2, 2);
      p.vx = Math.cos(a) * s + (o.vx || 0);
      p.vy = Math.sin(a) * s + (o.vy || 0);
      p.g = pre.gravity; p.drag = pre.drag;
      p.maxLife = rand(pre.life[0], pre.life[1]) * (o.lifeMul || 1);
      p.life = p.maxLife;
      p.sz0 = rand(pre.size[0], pre.size[1]) * (o.sizeMul || 1) * (0.8 + power * 0.4);
      p.size = p.sz0;
      p.rot = rand(0, TAU);
      p.vrot = pre.spin ? rand(pre.spin[0], pre.spin[1]) : 0;
      p.r = c[0]; p.gg = c[1]; p.b = c[2];
      p.add = !!pre.additive; p.flick = !!pre.flicker; p.glint = !!pre.glint;
      p.grow = pre.grow || 0; p.bounce = pre.bounce || 0;
      p.stain = !!pre.stains && !reduced;
      p.settle = !!pre.settles;
      p.seed = Math.random() * 1000;
    }
    ensureRunning();
  }

  /* ── decals ──────────────────────────────────────────────────────────── */
  function stainAt(x, y, size, r, g, b, a) {
    if (x < -20 || y < -20 || x > W + 20 || y > H + 20) return;
    dctx.globalAlpha = a;
    dctx.fillStyle = `rgb(${r},${g},${b})`;
    dctx.beginPath();
    // irregular blob — never a clean circle
    const pts = 7;
    for (let i = 0; i <= pts; i++) {
      const ang = (i / pts) * TAU;
      const rr = size * rand(0.62, 1.38);
      const px = x + Math.cos(ang) * rr;
      const py = y + Math.sin(ang) * rr;
      if (i === 0) dctx.moveTo(px, py); else dctx.lineTo(px, py);
    }
    dctx.closePath();
    dctx.fill();
    dctx.globalAlpha = 1;
  }

  /* A real impact splatter: a main blob, satellite droplets thrown along the
     impact vector with tapered tails, and gravity runs off the fat ones. */
  function decal(kind, x, y, opts) {
    const o = opts || {};
    if (reduced) return;
    const vec = o.normal == null ? -Math.PI / 2 : o.normal;
    const power = o.power == null ? 1 : o.power;

    if (kind === "blood") {
      const base = 4 + power * 5;
      stainAt(x, y, base, 138, 4, 16, 0.82);
      const sats = 6 + ((Math.random() * 7) | 0);
      for (let i = 0; i < sats; i++) {
        const a = vec + rand(-0.85, 0.85);
        const d = rand(6, 34) * (0.6 + power);
        const sx = x + Math.cos(a) * d;
        const sy = y + Math.sin(a) * d;
        const s = rand(0.9, 3.2) * (0.7 + power * 0.5);
        stainAt(sx, sy, s, 128, 2, 14, rand(0.5, 0.85));
        // tapered tail pointing back at the impact
        dctx.globalAlpha = 0.5;
        dctx.strokeStyle = "rgb(120,2,12)";
        dctx.lineWidth = s * 0.7;
        dctx.lineCap = "round";
        dctx.beginPath();
        dctx.moveTo(sx, sy);
        dctx.lineTo(sx - Math.cos(a) * d * 0.3, sy - Math.sin(a) * d * 0.3);
        dctx.stroke();
        dctx.globalAlpha = 1;
        // fat droplets run
        if (s > 2.4 && Math.random() < 0.55) runFrom(sx, sy, s);
      }
      if (power > 0.7) runFrom(x, y, base * 0.5);
    } else if (kind === "chip") {
      stainAt(x, y, rand(2.5, 5) * power, 26, 12, 5, 0.9);
      for (let i = 0; i < 4; i++) stainAt(x + rand(-9, 9), y + rand(-9, 9), rand(0.8, 2), 30, 15, 6, 0.6);
    } else if (kind === "sawdust") {
      stainAt(x, y, rand(2, 5), 200, 164, 108, 0.5);
    } else if (kind === "scorch") {
      const gr = dctx.createRadialGradient(x, y, 0, x, y, 22 * power);
      gr.addColorStop(0, "rgba(20,10,4,.75)");
      gr.addColorStop(1, "rgba(20,10,4,0)");
      dctx.fillStyle = gr;
      dctx.fillRect(x - 24 * power, y - 24 * power, 48 * power, 48 * power);
    }
  }

  /* A blood run: a streak drawn downward with a bulb at the end. Static —
     drawing an animated run per frame is not worth the cost. */
  function runFrom(x, y, w) {
    const len = rand(10, 46) * (w / 3);
    dctx.globalAlpha = 0.66;
    dctx.strokeStyle = "rgb(118,0,12)";
    dctx.lineWidth = Math.max(1, w * 0.55);
    dctx.lineCap = "round";
    dctx.beginPath();
    dctx.moveTo(x, y);
    dctx.quadraticCurveTo(x + rand(-2.5, 2.5), y + len * 0.55, x + rand(-4, 4), y + len);
    dctx.stroke();
    dctx.globalAlpha = 1;
    stainAt(x + rand(-3, 3), y + len, w * 0.62, 112, 0, 10, 0.72);
  }

  function clearDecals() {
    dctx.clearRect(0, 0, W, H);
  }

  /* ── camera / juice ──────────────────────────────────────────────────── */
  function shake(t) {
    if (reduced) return;
    trauma = clamp(trauma + t, 0, 1);
    ensureRunning();
  }
  function hitStop(ms) {
    if (reduced) return;
    stopUntil = Math.max(stopUntil, (now || performance.now()) + ms);
    if (scene) scene.classList.add("is-frozen");
    ensureRunning();
  }
  function flash(color, dur, opts) {
    const o = opts || {};
    const c = parseColor(color);
    flashes.push({ r: c[0], g: c[1], b: c[2], a: o.alpha == null ? 0.9 : o.alpha, t: 0, dur: dur || 90, radial: o.radial !== false, x: o.x, y: o.y });
    if (o.chroma && !reduced) chroma = Math.max(chroma, o.chroma);
    ensureRunning();
  }
  function zoomPunch(power, ms) {
    if (reduced) return;
    zoomVel += power * 0.9;
    void ms;
    ensureRunning();
  }
  function slowMo(scale, ms) {
    if (reduced) return;
    tsTarget = scale;
    tsUntil = (now || performance.now()) + ms;
    ensureRunning();
  }
  function light(x, y, r, a) {
    lightX = x; lightY = y; lightR = r; lightA = a;
  }
  function clearLight() { lightA = 0; lightX = -1; }

  function parseColor(c) {
    if (Array.isArray(c)) return c;
    if (typeof c === "string" && c[0] === "#") {
      const h = c.slice(1);
      const f = h.length === 3 ? h.split("").map((x) => x + x).join("") : h;
      return [parseInt(f.slice(0, 2), 16), parseInt(f.slice(2, 4), 16), parseInt(f.slice(4, 6), 16)];
    }
    return [255, 255, 255];
  }

  /* ── projectiles ─────────────────────────────────────────────────────── */
  function setRect(name, r) {
    if (!r) rects.delete(name); else rects.set(name, r);
  }
  function projectile(cfg) {
    const b = {
      x: cfg.x, y: cfg.y, vx: cfg.vx, vy: cfg.vy,
      g: cfg.gravity == null ? 1400 : cfg.gravity,
      drag: cfg.drag || 0, r: cfg.radius || 9,
      rot: 0, vrot: cfg.spin == null ? (cfg.vx || 0) * 0.02 : cfg.spin,
      kind: cfg.kind || "rock", verts: cfg.verts || makeRockVerts(),
      onHit: cfg.onHit, onExpire: cfg.onExpire,
      bounces: cfg.bounces == null ? 1 : cfg.bounces,
      restitution: cfg.restitution == null ? 0.35 : cfg.restitution,
      alive: true, age: 0, trail: cfg.trail !== false,
    };
    bodies.push(b);
    ensureRunning();
    return b;
  }
  function makeRockVerts() {
    // irregular faceted stone — never a circle
    const n = 7 + ((Math.random() * 3) | 0);
    const v = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const r = rand(0.66, 1.12);
      v.push(Math.cos(a) * r, Math.sin(a) * r);
    }
    return v;
  }
  function clearProjectiles() { bodies.length = 0; }

  /* ── the loop ────────────────────────────────────────────────────────── */
  function ensureRunning() {
    if (running || document.hidden) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function frame(t) {
    raf = requestAnimationFrame(frame);
    now = t;
    let dt = t - last;
    last = t;
    if (dt > 100) dt = 100;                        // tab was backgrounded

    // perf watchdog — degrade before we drop frames, not after
    if (dt > 22) { if (++slowFrames > 30 && !degraded) { degraded = true; CAP = Math.max(60, CAP >> 1); } }
    else slowFrames = 0;

    // hit-stop freezes simulation but the frame still paints
    const frozen = t < stopUntil;
    if (!frozen && scene) scene.classList.remove("is-frozen");

    // slow-mo ramp
    if (t > tsUntil) tsTarget = 1;
    timeScale += (tsTarget - timeScale) * 0.22;

    if (!frozen) {
      acc += dt * timeScale;
      let guard = 0;
      while (acc >= STEP && guard++ < 5) { step(STEP / 1000); acc -= STEP; }
      if (guard >= 5) acc = 0;
    }

    draw(dt);

    // idle → stop burning battery
    if (!frozen && live === 0 && bodies.length === 0 && trauma < 0.002 &&
        flashes.length === 0 && chroma < 0.01 && Math.abs(zoom - 1) < 0.002 && lightA <= 0) {
      running = false;
      cancelAnimationFrame(raf);
      writeCamera(0, 0, 0, 1);
    }
  }

  function step(dt) {
    // camera
    trauma = Math.max(0, trauma - 1.6 * dt);
    zoomVel *= 0.86;
    zoom += (1 - zoom) * 0.16 + zoomVel * 0.02;
    zoomVel *= 0.9;
    chroma *= 0.88;

    // particles
    if (live > 0) {
      for (let i = 0; i < CAP; i++) {
        const p = P[i];
        if (!p.on) continue;
        p.life -= dt * 1000;
        if (p.life <= 0) {
          p.on = false; live--;
          if (p.stain) stainAt(p.x, p.y, p.sz0 * 0.9, p.r, p.gg, p.b, 0.55);
          else if (p.settle && p.y < H) stainAt(p.x, p.y, p.sz0 * 0.8, p.r, p.gg, p.b, 0.32);
          continue;
        }
        const d = 1 - p.drag * dt;
        p.vx *= d; p.vy *= d;
        p.vy += p.g * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vrot * dt;
        if (p.grow) p.size = p.sz0 * (1 + p.grow * (1 - p.life / p.maxLife));

        // floor bounce — sparks skitter, glass tinkles to a stop
        if (p.bounce && p.y > H - 4 && p.vy > 0) {
          p.y = H - 4;
          p.vy *= -p.bounce;
          p.vx *= 0.72;
          if (Math.abs(p.vy) < 24) { p.vy = 0; p.g = 0; p.vx *= 0.4; }
        }
      }
    }

    // projectiles
    for (let i = bodies.length - 1; i >= 0; i--) {
      const b = bodies[i];
      b.age += dt;
      b.vy += b.g * dt;
      if (b.drag) { const dd = 1 - b.drag * dt; b.vx *= dd; b.vy *= dd; }
      const px = b.x, py = b.y;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.rot += b.vrot * dt;

      // swept AABB test against every registered target, nearest first
      let hit = null;
      rects.forEach((r, name) => {
        if (hit) return;
        if (b.x + b.r > r.x && b.x - b.r < r.x + r.w && b.y + b.r > r.y && b.y - b.r < r.y + r.h) {
          hit = { name, rect: r };
        }
      });

      if (hit && b.onHit) {
        const res = b.onHit(hit.name, b.x, b.y, b, hit.rect);
        if (res === "stop") { bodies.splice(i, 1); continue; }
        if (res === "bounce" || (res == null && b.bounces > 0)) {
          b.bounces--;
          // reflect off whichever face we crossed
          const r = hit.rect;
          const fromLeft = px + b.r <= r.x, fromRight = px - b.r >= r.x + r.w;
          if (fromLeft || fromRight) { b.vx *= -b.restitution; b.x = fromLeft ? r.x - b.r : r.x + r.w + b.r; }
          else { b.vy *= -b.restitution; b.y = py; }
          b.vrot *= -0.6;
          if (b.bounces < 0) { bodies.splice(i, 1); continue; }
        }
      }

      if (b.y > H + 80 || b.x < -140 || b.x > W + 140 || b.age > 6) {
        if (b.onExpire) b.onExpire(b);
        bodies.splice(i, 1);
      }
    }

    // flashes
    for (let i = flashes.length - 1; i >= 0; i--) {
      flashes[i].t += dt * 1000;
      if (flashes[i].t >= flashes[i].dur) flashes.splice(i, 1);
    }

    if (lightA > 0) lightA *= 0.9;
  }

  /* ── draw ────────────────────────────────────────────────────────────── */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // decals sit under everything — they're part of the world now
    if (decalCv.width > 1) ctx.drawImage(decalCv, 0, 0, W, H);

    // travelling cut-glow (chainsaw tip friction heat)
    if (lightA > 0.01 && lightX >= 0) {
      const gr = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, lightR);
      gr.addColorStop(0, `rgba(255,214,120,${lightA})`);
      gr.addColorStop(0.4, `rgba(255,132,20,${lightA * 0.5})`);
      gr.addColorStop(1, "rgba(255,90,0,0)");
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = gr;
      ctx.fillRect(lightX - lightR, lightY - lightR, lightR * 2, lightR * 2);
      ctx.globalCompositeOperation = "source-over";
    }

    // particles — one pass for normal, one for additive, to batch the blend flip
    if (live > 0) {
      drawPass(false);
      ctx.globalCompositeOperation = "lighter";
      drawPass(true);
      ctx.globalCompositeOperation = "source-over";
    }

    // projectiles
    for (let i = 0; i < bodies.length; i++) drawBody(bodies[i]);

    // impact frames
    for (let i = 0; i < flashes.length; i++) {
      const f = flashes[i];
      const k = 1 - f.t / f.dur;
      const a = f.a * k * k;
      if (a <= 0.002) continue;
      if (f.radial) {
        const cx = f.x == null ? W / 2 : f.x;
        const cy = f.y == null ? H * 0.55 : f.y;
        const rr = Math.max(W, H) * 0.85;
        const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
        gr.addColorStop(0, `rgba(${f.r},${f.g},${f.b},${a})`);
        gr.addColorStop(0.45, `rgba(${f.r},${f.g},${f.b},${a * 0.35})`);
        gr.addColorStop(1, `rgba(${f.r},${f.g},${f.b},0)`);
        ctx.fillStyle = gr;
      } else {
        ctx.fillStyle = `rgba(${f.r},${f.g},${f.b},${a})`;
      }
      ctx.fillRect(0, 0, W, H);
    }

    // chromatic aberration — two offset tinted rings, additive. Cheap fake,
    // reads right, and never touches getImageData.
    if (chroma > 0.01) {
      const off = chroma * 5;
      ctx.globalCompositeOperation = "lighter";
      for (let s = 0; s < 2; s++) {
        const dx = s ? off : -off;
        const col = s ? "0,180,255" : "255,40,60";
        const gr = ctx.createRadialGradient(W / 2 + dx, H / 2, W * 0.2, W / 2 + dx, H / 2, W * 0.72);
        gr.addColorStop(0, `rgba(${col},0)`);
        gr.addColorStop(1, `rgba(${col},${chroma * 0.3})`);
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, W, H);
      }
      ctx.globalCompositeOperation = "source-over";
    }

    // camera write — the DOM scene shakes, the canvas rides along inside it
    const sh = trauma * trauma;
    const ox = sh * 26 * noise1(now * 0.014, 1);
    const oy = sh * 26 * noise1(now * 0.014, 2);
    const rot = sh * 2.4 * noise1(now * 0.011, 3);
    writeCamera(ox, oy, rot, zoom);
  }

  function drawPass(additive) {
    for (let i = 0; i < CAP; i++) {
      const p = P[i];
      if (!p.on || p.add !== additive) continue;
      const k = p.life / p.maxLife;
      let a = k > 0.7 ? 1 : k / 0.7;
      if (p.flick && Math.random() < 0.25) a *= 0.25;
      if (a <= 0.01) continue;

      if (p.draw === "streak") {
        // aligned to velocity — that's what makes a spark read as a spark
        const sp = Math.hypot(p.vx, p.vy);
        const len = clamp(sp * 0.012, 2, p.size * 1.6);
        const ang = Math.atan2(p.vy, p.vx);
        ctx.strokeStyle = `rgba(${p.r},${p.gg},${p.b},${a})`;
        ctx.lineWidth = 1.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - Math.cos(ang) * len, p.y - Math.sin(ang) * len);
        ctx.stroke();
      } else if (p.draw === "shard") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = `rgba(${p.r},${p.gg},${p.b},${a})`;
        ctx.beginPath();
        ctx.moveTo(-p.size * 0.5, -p.size * 0.22);
        ctx.lineTo(p.size * 0.5, -p.size * 0.4);
        ctx.lineTo(p.size * 0.34, p.size * 0.42);
        ctx.lineTo(-p.size * 0.42, p.size * 0.24);
        ctx.closePath();
        ctx.fill();
        if (p.glint) {
          // the facet that catches the porch light, flashing as it tumbles
          const g = Math.abs(Math.sin(p.rot * 1.7 + p.seed));
          if (g > 0.72) {
            ctx.fillStyle = `rgba(255,255,255,${a * (g - 0.72) * 3})`;
            ctx.fillRect(-p.size * 0.3, -p.size * 0.28, p.size * 0.5, p.size * 0.16);
          }
        }
        ctx.restore();
      } else if (p.draw === "puff") {
        const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gr.addColorStop(0, `rgba(${p.r},${p.gg},${p.b},${a * 0.5})`);
        gr.addColorStop(1, `rgba(${p.r},${p.gg},${p.b},0)`);
        ctx.fillStyle = gr;
        ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
      } else if (p.draw === "drip") {
        // teardrop — fat bottom, tail pointing back up the fall
        ctx.fillStyle = `rgba(${p.r},${p.gg},${p.b},${a})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - p.size * 2.2);
        ctx.quadraticCurveTo(p.x + p.size, p.y, p.x, p.y + p.size);
        ctx.quadraticCurveTo(p.x - p.size, p.y, p.x, p.y - p.size * 2.2);
        ctx.fill();
      } else if (p.draw === "star") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = `rgba(${p.r},${p.gg},${p.b},${a})`;
        ctx.beginPath();
        for (let s = 0; s < 10; s++) {
          const rr = s % 2 ? p.size * 0.42 : p.size;
          const ang = (s / 10) * TAU - Math.PI / 2;
          const xx = Math.cos(ang) * rr, yy = Math.sin(ang) * rr;
          if (s === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        // blob — squashed along velocity so fast droplets stretch
        const sp = Math.hypot(p.vx, p.vy);
        const st = clamp(1 + sp * 0.0016, 1, 1.35);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(Math.atan2(p.vy, p.vx));
        ctx.scale(st, 1 / st);
        ctx.fillStyle = `rgba(${p.r},${p.gg},${p.b},${a})`;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    }
  }

  function drawBody(b) {
    const sp = Math.hypot(b.vx, b.vy);
    if (b.trail && sp > 200) {
      const ang = Math.atan2(b.vy, b.vx);
      const len = clamp(sp * 0.03, 6, 34);
      ctx.strokeStyle = "rgba(180,180,190,.22)";
      ctx.lineWidth = b.r * 1.1;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - Math.cos(ang) * len, b.y - Math.sin(ang) * len);
      ctx.stroke();
    }
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rot);
    // faceted stone with a lit top-left and a dark underside
    ctx.beginPath();
    for (let i = 0; i < b.verts.length; i += 2) {
      const x = b.verts[i] * b.r, y = b.verts[i + 1] * b.r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    const gr = ctx.createLinearGradient(-b.r, -b.r, b.r, b.r);
    gr.addColorStop(0, "#9aa0aa");
    gr.addColorStop(0.5, "#63686f");
    gr.addColorStop(1, "#33373d");
    ctx.fillStyle = gr;
    ctx.fill();
    ctx.strokeStyle = "rgba(20,22,26,.8)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  function writeCamera(x, y, rot, z) {
    if (!camEl) return;
    camEl.style.setProperty("--fx-x", `${x.toFixed(2)}px`);
    camEl.style.setProperty("--fx-y", `${y.toFixed(2)}px`);
    camEl.style.setProperty("--fx-rot", `${rot.toFixed(3)}deg`);
    camEl.style.setProperty("--fx-zoom", z.toFixed(4));
  }

  /* ── lifecycle ───────────────────────────────────────────────────────── */
  const onVis = () => {
    if (document.hidden) { running = false; cancelAnimationFrame(raf); }
    else ensureRunning();
  };
  document.addEventListener("visibilitychange", onVis);

  let ro = null;
  try {
    ro = new ResizeObserver(() => resize());
    if (scene) ro.observe(scene);
  } catch { window.addEventListener("resize", resize); }

  resize();

  function reset() {
    for (let i = 0; i < CAP; i++) P[i].on = false;
    live = 0;
    bodies.length = 0;
    flashes.length = 0;
    trauma = 0; chroma = 0; zoom = 1; zoomVel = 0;
    timeScale = 1; tsTarget = 1; stopUntil = 0;
    clearDecals();
    writeCamera(0, 0, 0, 1);
  }

  function destroy() {
    running = false;
    cancelAnimationFrame(raf);
    document.removeEventListener("visibilitychange", onVis);
    if (ro) ro.disconnect(); else window.removeEventListener("resize", resize);
    rects.clear();
    bodies.length = 0;
  }

  return {
    emit, decal, stainAt, clearDecals,
    shake, hitStop, flash, zoom: zoomPunch, slowMo, light, clearLight,
    projectile, clearProjectiles, setRect,
    resize, reset, destroy,
    get reduced() { return reduced; },
    get size() { return { w: W, h: H }; },
    kinds: POOL_KEYS,
  };
}

/* A no-op with the same shape, so callers never need a null check. */
function createNullFX() {
  const noop = () => {};
  return {
    emit: noop, decal: noop, stainAt: noop, clearDecals: noop,
    shake: noop, hitStop: noop, flash: noop, zoom: noop, slowMo: noop,
    light: noop, clearLight: noop,
    projectile: () => ({ alive: false }), clearProjectiles: noop, setRect: noop,
    resize: noop, reset: noop, destroy: noop,
    reduced: true, size: { w: 0, h: 0 }, kinds: POOL_KEYS,
  };
}

export default createDoorFX;

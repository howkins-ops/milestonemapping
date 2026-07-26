/* Boot cinematic particle engine.
 *
 * The old boot spawned real <div>s for embers on a setInterval — every ember
 * was its own composited layer, so the count had to stay tiny (~15) and the
 * churn caused layout work mid-animation. This replaces all of it with one
 * canvas, one rAF loop and a fixed particle pool.
 *
 * Two tricks carry the performance:
 *   1. Pre-rendered radial-gradient sprites, cached per colour. Per-particle
 *      createRadialGradient() is the usual killer; drawImage() of a cached
 *      64px blob is nearly free.
 *   2. Additive blending ('lighter') so overlapping embers bloom for free
 *      instead of needing a blur pass.
 *
 * The loop also self-throttles: if the frame EMA drifts past budget it drops
 * the quality multiplier, which thins spawn rates and tells the caller to shed
 * expensive DOM effects (see onQuality).
 */

const TAU = Math.PI * 2;
const SPRITE = 64;
const MAX_PARTICLES = 320;

const spriteCache = new Map();

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/* Soft round blob, hot core → transparent rim. One per colour, forever. */
function getSprite(color) {
  const hit = spriteCache.get(color);
  if (hit) return hit;

  const cv = document.createElement("canvas");
  cv.width = cv.height = SPRITE;
  const g = cv.getContext("2d");
  const r = SPRITE / 2;
  const [red, grn, blu] = hexToRgb(color);
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0.0, `rgba(255,255,255,0.95)`);
  grad.addColorStop(0.22, `rgba(${red},${grn},${blu},0.95)`);
  grad.addColorStop(0.55, `rgba(${red},${grn},${blu},0.28)`);
  grad.addColorStop(1.0, `rgba(${red},${grn},${blu},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, SPRITE, SPRITE);

  spriteCache.set(color, cv);
  return cv;
}

const EMBER_COLS  = ["#FB923C", "#FACC15", "#FFB000", "#FF3EDB", "#00F0FF", "#00FFBF"];
const SPARK_COLS  = ["#00F0FF", "#FF3EDB", "#D11EFF", "#FACC15", "#7DF9FF", "#00FFBF"];
const ASH_COLS    = ["#6B6480", "#4A4560", "#8A82A0"];

const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const rand = (a, b) => a + Math.random() * (b - a);

export function createBootFx(canvas, opts = {}) {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return null;

  const onQuality = opts.onQuality || (() => {});

  /* ---- pooled particles --------------------------------------------- */
  const pool = new Array(MAX_PARTICLES);
  for (let i = 0; i < MAX_PARTICLES; i++) {
    pool[i] = { active: false, x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0, life: 0, ttl: 1,
                size: 4, color: "#fff", kind: "ember", tw: 0, twSpd: 0, drag: 1,
                buoy: 0, tx: 0, ty: 0, trail: 0, spin: 0 };
  }
  let cursor = 0;

  /* Round-robin acquire. At the cap we overwrite the oldest slot rather than
     dropping the spawn — a burst should always read as a burst. */
  function acquire() {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = pool[cursor];
      cursor = (cursor + 1) % MAX_PARTICLES;
      if (!p.active) return p;
    }
    const p = pool[cursor];
    cursor = (cursor + 1) % MAX_PARTICLES;
    return p;
  }

  /* ---- sizing -------------------------------------------------------- */
  let W = 0, H = 0, dpr = 1;

  function resize() {
    // Cap DPR: a 3x retina phone gains nothing visible from soft glow blobs
    // and pays 2.25x the fill rate for it.
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    W = canvas.clientWidth || window.innerWidth;
    H = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  /* ---- world state --------------------------------------------------- */
  let mode = "ash";              // "ash" (cold, falling) | "ember" (warm, rising)
  let quality = 1;               // 1 → full, 0.55 → thinned, 0.3 → survival
  let running = true;
  let raf = 0;
  let last = 0;
  let frameEma = 16.7;
  let sampled = 0;
  const wind = { x: 0, y: 0 };
  let spawnAcc = 0;

  /* ---- spawners ------------------------------------------------------- */

  function spawnAsh() {
    const p = acquire();
    p.active = true;
    p.kind = "ash";
    p.x = rand(-20, W + 20);
    p.y = rand(-40, -4);
    p.px = p.x; p.py = p.y;
    p.vx = rand(-6, 6);
    p.vy = rand(9, 26);
    p.size = rand(1.6, 4.2);
    p.color = pick(ASH_COLS);
    p.ttl = rand(5.5, 10);
    p.life = 0;
    p.tw = Math.random() * TAU;
    p.twSpd = rand(0.5, 1.4);
    p.drag = 1;
    p.buoy = 0;
    p.trail = 0;
    p.spin = rand(-0.4, 0.4);
  }

  function spawnEmber(fromBase) {
    const p = acquire();
    p.active = true;
    p.kind = "ember";
    p.x = rand(-10, W + 10);
    p.y = fromBase ? H + rand(2, 40) : rand(H * 0.45, H + 30);
    p.px = p.x; p.py = p.y;
    p.vx = rand(-10, 10);
    p.vy = rand(-34, -12);
    p.size = rand(1.8, 5.4);
    p.color = pick(EMBER_COLS);
    p.ttl = rand(4, 8.5);
    p.life = 0;
    p.tw = Math.random() * TAU;
    p.twSpd = rand(1.2, 3.2);
    p.drag = 0.999;
    p.buoy = rand(4, 14);
    p.trail = 0;
    p.spin = rand(-0.6, 0.6);
  }

  /* Big soft low-alpha blobs. Pure atmosphere — they give the frame depth so
     the sharp embers read as being *in* something rather than on black. */
  function spawnWisp() {
    const p = acquire();
    p.active = true;
    p.kind = "wisp";
    p.x = rand(0, W);
    p.y = H + rand(10, 90);
    p.px = p.x; p.py = p.y;
    p.vx = rand(-8, 8);
    p.vy = rand(-22, -9);
    p.size = rand(38, 96);
    p.color = Math.random() < 0.5 ? "#7B2CFF" : "#D11EFF";
    p.ttl = rand(6, 11);
    p.life = 0;
    p.tw = Math.random() * TAU;
    p.twSpd = rand(0.3, 0.7);
    p.drag = 0.999;
    p.buoy = 2;
    p.trail = 0;
    p.spin = 0;
  }

  /* ---- public controls ------------------------------------------------ */

  const api = {
    resize,

    setMode(next) {
      mode = next;
    },

    /* Radial spark blast — the ignition. Trails are on so they streak. */
    burst(cx, cy, count, power = 1) {
      const n = Math.round(count * Math.max(quality, 0.45));
      for (let i = 0; i < n; i++) {
        const p = acquire();
        const ang = (i / n) * TAU + rand(-0.14, 0.14);
        const spd = rand(180, 620) * power;
        p.active = true;
        p.kind = "spark";
        p.x = cx + Math.cos(ang) * 6;
        p.y = cy + Math.sin(ang) * 6;
        p.px = p.x; p.py = p.y;
        p.vx = Math.cos(ang) * spd;
        p.vy = Math.sin(ang) * spd - rand(0, 60);
        p.size = rand(1.6, 4.4);
        p.color = pick(SPARK_COLS);
        p.ttl = rand(0.7, 1.7);
        p.life = 0;
        p.tw = 0;
        p.twSpd = 0;
        p.drag = 0.935;
        p.buoy = -70;               // sparks arc and fall
        p.trail = 1;
        p.spin = 0;
      }
    },

    /* Matter dragged inward to condense the diamond. Curved, not straight —
       each spark gets tangential velocity so it spirals into the crown. */
    converge(cx, cy, count, radius) {
      const n = Math.round(count * Math.max(quality, 0.5));
      for (let i = 0; i < n; i++) {
        const p = acquire();
        const ang = Math.random() * TAU;
        const r = radius * rand(0.55, 1.25);
        p.active = true;
        p.kind = "pull";
        p.x = cx + Math.cos(ang) * r;
        p.y = cy + Math.sin(ang) * r * 0.85;
        p.px = p.x; p.py = p.y;
        p.vx = -Math.sin(ang) * rand(60, 130);   // tangential → spiral
        p.vy = Math.cos(ang) * rand(60, 130);
        p.tx = cx;
        p.ty = cy;
        p.size = rand(1.6, 3.6);
        p.color = pick(SPARK_COLS);
        p.ttl = rand(0.55, 0.95);
        p.life = 0;
        p.drag = 0.985;
        p.trail = 1;
        p.buoy = 0;
        p.tw = 0; p.twSpd = 0; p.spin = 0;
      }
    },

    /* Wingbeat downdraft — shoves the whole field, decays over ~1s. */
    gust(px, py) {
      wind.x += px;
      wind.y += py;
    },

    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },

    get quality() { return quality; }
  };

  /* ---- integrate + draw ------------------------------------------------ */

  function step(now) {
    if (!running) return;
    raf = requestAnimationFrame(step);

    if (!last) last = now;
    let dt = (now - last) / 1000;
    last = now;
    // Tab-switch / GC hitch: clamp so nothing teleports across the screen.
    if (dt > 0.05) dt = 0.05;

    /* adaptive quality — EMA over frame time, two downgrade steps */
    frameEma += ((dt * 1000) - frameEma) * 0.05;
    if (++sampled > 45) {
      sampled = 0;
      /* 26ms ≈ sustained sub-40fps. Deliberately tighter than a 30ms/33fps
         line: by the time the EMA reaches 30 the p90 is already well past
         50ms and the stutter is visible. */
      if (frameEma > 26 && quality > 0.35) {
        quality = quality > 0.6 ? 0.55 : 0.3;
        onQuality(quality);
      } else if (frameEma < 18 && quality < 1) {
        quality = quality < 0.5 ? 0.55 : 1;
        onQuality(quality);
      }
    }

    /* wind decays back to still */
    wind.x *= Math.pow(0.06, dt);
    wind.y *= Math.pow(0.06, dt);

    /* ambient spawn, rate-limited by an accumulator so it is framerate-independent */
    spawnAcc += dt;
    const tick = 1 / (mode === "ash" ? 16 : 34);
    while (spawnAcc > tick) {
      spawnAcc -= tick;
      if (Math.random() > quality) continue;
      if (mode === "ash") spawnAsh();
      else {
        spawnEmber(true);
        if (Math.random() < 0.06) spawnWisp();
      }
    }

    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = pool[i];
      if (!p.active) continue;

      p.life += dt;
      if (p.life >= p.ttl) { p.active = false; continue; }

      p.px = p.x; p.py = p.y;
      const t = p.life / p.ttl;

      if (p.kind === "pull") {
        // accelerate hard toward the crown, ease of a black hole
        const dx = p.tx - p.x, dy = p.ty - p.y;
        const d = Math.hypot(dx, dy) || 1;
        const pullAcc = 1400 / Math.max(d, 26);
        p.vx += (dx / d) * pullAcc * d * dt * 0.06;
        p.vy += (dy / d) * pullAcc * d * dt * 0.06;
        p.vx *= Math.pow(p.drag, dt * 60);
        p.vy *= Math.pow(p.drag, dt * 60);
        if (d < 8) { p.active = false; continue; }
      } else {
        p.tw += p.twSpd * dt;
        p.vy -= p.buoy * dt;
        p.vx += Math.sin(p.tw + p.y * 0.012) * p.spin * 24 * dt;
        p.vx += wind.x * dt;
        p.vy += wind.y * dt;
        p.vx *= Math.pow(p.drag, dt * 60);
        p.vy *= Math.pow(p.drag, dt * 60);
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.y < -80 || p.y > H + 120 || p.x < -120 || p.x > W + 120) {
        p.active = false;
        continue;
      }

      /* alpha: quick attack, long decay; wisps stay faint throughout */
      let a;
      if (p.kind === "wisp") a = Math.sin(Math.PI * t) * 0.1;
      else if (p.kind === "spark" || p.kind === "pull") a = (1 - t) * (1 - t);
      else a = Math.min(1, t * 6) * (1 - t) * (0.55 + 0.45 * Math.sin(p.tw * 2));

      if (a <= 0.006) continue;

      if (p.trail) {
        ctx.globalAlpha = a * 0.5;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.72;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      const shrink = p.kind === "spark" ? 1 - t * 0.6 : 1;
      const d = p.size * 3.4 * shrink;
      ctx.globalAlpha = a;
      ctx.drawImage(getSprite(p.color), p.x - d / 2, p.y - d / 2, d, d);
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  raf = requestAnimationFrame(step);
  return api;
}

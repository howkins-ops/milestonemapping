// ════════════════════════════════════════════════════════════════════════
// THE CRUCIBLE — forge FX engine.
//
// Deliberately NOT MaskFX.js (the City's ember/shard canvas). That engine
// draws a cold street: drifting embers and blue glass shards. This one
// draws a foundry — additive molten sparks with heat-coloured falloff,
// lead shrapnel with real angular momentum, godrays off the crucible mouth,
// a heat-shimmer band, and the pour.
//
// GAME FEEL (the three tricks every action game lives on):
//   · trauma shake — Squirrel Eiserloh's model: hold a `trauma` scalar,
//     shake by trauma² so it falls off perceptually, decay per second.
//     Never a fixed keyframe, so stacked hits compound instead of restart.
//   · hit-stop — freeze the world 60–120ms on impact. The single cheapest
//     way to make a hit feel like it weighs something.
//   · additive blending — molten sparks composite 'lighter' so overlapping
//     particles bloom to white instead of muddying.
//
// PERF LAW: one canvas, one rAF, cancelled on document.hidden and destroy.
// dpr clamped to 3 (the "4K" ask — MaskFX clamps to 2, this is the
// centrepiece so it gets the extra density) and particle caps scale with
// screen size. Reduced motion returns an inert no-op engine.
// ════════════════════════════════════════════════════════════════════════

export function hexRGB(h) {
  const n = parseInt(String(h).replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

const NOOP = {
  sparks() {},
  shatter() {},
  ring() {},
  pour() {},
  setForge() {},
  setHeat() {},
  addTrauma() {},
  hitStop() {},
  frozen() { return false; },
  destroy() {},
};

export function createCrucibleFX(canvas, { reducedMotion = false } = {}) {
  if (!canvas || reducedMotion) return NOOP;

  const ctx = canvas.getContext("2d");
  if (!ctx) return NOOP;

  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const small = window.innerWidth < 720;
  const CAP = small ? 220 : 520;

  let W = 0;
  let H = 0;
  let parts = [];
  let rings = [];
  let raf = 0;
  let dead = false;
  let last = 0;
  // Guards ensure() while we're inside tick(). The ambient emitters and the
  // pour both call sparks() from within the frame, and sparks() ends in
  // ensure() — without this flag each frame would schedule one rAF from
  // ensure() AND one from the tail of tick(), doubling the callback count
  // every frame until the tab locks up.
  let inTick = false;

  let forgeOn = false;
  let heat = 0; // 0..1 — drives ambient spark rate + godray intensity
  let trauma = 0;
  let freezeUntil = 0;
  let pourFrom = null; // {x, y, w} while the metal is running

  const resize = () => {
    W = canvas.width = Math.round(window.innerWidth * dpr);
    H = canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  };
  resize();
  window.addEventListener("resize", resize);

  const room = () => Math.max(0, CAP - parts.length);

  // Heat ramp: a spark's colour is a function of its own life, so every
  // particle cools from white → gold → ember → smoke as it dies. This is
  // what sells "molten" rather than "orange dots".
  const heatColor = (life, tint) => {
    if (life > 0.82) return "255,252,238";
    if (life > 0.6) return "255,226,150";
    if (life > 0.34) return `${tint.r},${tint.g},${tint.b}`;
    if (life > 0.16) return "196,74,26";
    return "92,42,34";
  };

  /* ── emitters ──────────────────────────────────────────────────────────── */

  // A burst of molten spatter. `spread` in radians biases direction (default
  // full circle); `up` biases the spray upward like a real forge strike.
  function sparks(x, y, colorHex, n = 30, spd = 5, { up = 0.35, size = 1, life = 1 } = {}) {
    const tint = hexRGB(colorHex);
    const count = Math.min(n, Math.max(room(), 6));
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = (0.8 + Math.random() * spd) * dpr;
      parts.push({
        t: "spark",
        x: x * dpr,
        y: y * dpr,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - up * v,
        g: 0.16 * dpr,
        drag: 0.982,
        r: (0.7 + Math.random() * 2.1) * size * dpr,
        life: 1,
        decay: (0.012 + Math.random() * 0.022) / life,
        tint,
        trail: Math.random() < 0.4,
      });
    }
    ensure();
  }

  // A lead plate coming off: heavy angular shrapnel, not glass.
  function shatter(x, y, w, h, colorHex, n = 26) {
    const tint = hexRGB(colorHex);
    const count = Math.min(n, Math.max(room(), 6));
    for (let i = 0; i < count; i++) {
      parts.push({
        t: "shard",
        x: (x + Math.random() * w) * dpr,
        y: (y + Math.random() * h) * dpr,
        vx: (Math.random() - 0.5) * 9 * dpr,
        vy: (-3 - Math.random() * 5) * dpr,
        g: 0.42 * dpr,
        drag: 0.995,
        r: (2.5 + Math.random() * 6) * dpr,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.42,
        life: 1,
        decay: 0.007 + Math.random() * 0.009,
        tint,
      });
    }
    // molten underside revealed as the plate tears away
    sparks(x + w / 2, y + h / 2, colorHex, 18, 4, { up: 0.5 });
    ensure();
  }

  // Expanding shockwave — one clean ring, drawn not spawned.
  function ring(x, y, colorHex, { r0 = 10, r1 = 320, ms = 480, width = 5 } = {}) {
    rings.push({
      x: x * dpr,
      y: y * dpr,
      r0: r0 * dpr,
      r1: r1 * dpr,
      w: width * dpr,
      t: 0,
      ms,
      tint: hexRGB(colorHex),
    });
    ensure();
  }

  // The pour: a continuous molten stream from a point, running downward.
  function pour(x, y, w, colorHex) {
    pourFrom = x == null ? null : { x: x * dpr, y: y * dpr, w: w * dpr, tint: hexRGB(colorHex) };
    ensure();
  }

  /* ── game feel ─────────────────────────────────────────────────────────── */

  function addTrauma(amount) {
    trauma = Math.min(1, trauma + amount);
    ensure();
  }

  function hitStop(ms = 90) {
    freezeUntil = Math.max(freezeUntil, performance.now() + ms);
    ensure();
  }

  const frozen = () => performance.now() < freezeUntil;

  /* ── the loop ──────────────────────────────────────────────────────────── */

  const drawGodrays = () => {
    if (heat <= 0.02) return;
    const cx = W * 0.5;
    const cy = H * 0.46;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.05 + heat * 0.13;
    const beams = 7;
    for (let i = 0; i < beams; i++) {
      const a = (Math.PI * 2 * i) / beams + heat * 0.4;
      const len = H * (0.55 + 0.2 * Math.sin(i * 2.1 + heat * 3));
      const spread = 0.05 + 0.03 * Math.sin(i * 1.7);
      const g = ctx.createLinearGradient(cx, cy, cx + Math.cos(a) * len, cy + Math.sin(a) * len);
      g.addColorStop(0, `rgba(255,215,140,${0.5 + heat * 0.4})`);
      g.addColorStop(1, "rgba(255,150,60,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a - spread) * len, cy + Math.sin(a - spread) * len);
      ctx.lineTo(cx + Math.cos(a + spread) * len, cy + Math.sin(a + spread) * len);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };

  const drawPour = (dt) => {
    if (!pourFrom) return;
    const { x, y, w, tint } = pourFrom;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createLinearGradient(x, y, x, H);
    g.addColorStop(0, "rgba(255,255,245,0.95)");
    g.addColorStop(0.25, `rgba(${tint.r},${tint.g},${tint.b},0.85)`);
    g.addColorStop(1, "rgba(255,120,40,0.15)");
    ctx.fillStyle = g;
    // a slightly wandering stream reads as liquid, a straight one reads as a bar
    const wob = Math.sin(performance.now() / 90) * w * 0.18;
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    ctx.quadraticCurveTo(x + wob, (y + H) / 2, x - w * 0.35 + wob, H);
    ctx.lineTo(x + w * 0.35 + wob, H);
    ctx.quadraticCurveTo(x + wob + w * 0.4, (y + H) / 2, x + w / 2, y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    if (Math.random() < 0.55 * dt * 60) sparks(x / dpr, (y + 40) / dpr, "#ffb02e", 3, 3, { up: -0.2, size: 0.7 });
  };

  const tick = (now) => {
    raf = 0;
    if (dead) return;
    inTick = true;
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
    last = now;

    ctx.clearRect(0, 0, W, H);

    const isFrozen = now < freezeUntil;

    // trauma decays ~1.6/s; shake is trauma² (perceptual falloff)
    if (trauma > 0 && !isFrozen) trauma = Math.max(0, trauma - dt * 1.6);
    const t2 = trauma * trauma;
    const ox = (Math.random() * 2 - 1) * t2 * 26 * dpr;
    const oy = (Math.random() * 2 - 1) * t2 * 26 * dpr;
    const rot = (Math.random() * 2 - 1) * t2 * 0.022;

    ctx.save();
    if (t2 > 0.0001) {
      ctx.translate(W / 2 + ox, H / 2 + oy);
      ctx.rotate(rot);
      ctx.translate(-W / 2, -H / 2);
    }

    drawGodrays();
    drawPour(dt);

    // ambient forge spatter rising off the crucible floor
    if (forgeOn && !isFrozen && Math.random() < 0.18 + heat * 0.5) {
      sparks(
        window.innerWidth * (0.2 + Math.random() * 0.6),
        window.innerHeight * (0.86 + Math.random() * 0.1),
        heat > 0.5 ? "#ffd06a" : "#ff8a3d",
        1,
        1.6,
        { up: 1.5, size: 0.75, life: 2.6 }
      );
    }

    // ── particles ──
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (!isFrozen) {
        p.life -= p.decay;
        if (p.life <= 0) {
          parts.splice(i, 1);
          continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.g;
        p.vx *= p.drag;
        p.vy *= p.drag;
        if (p.t === "shard") p.rot += p.vr;
      } else if (p.life <= 0) {
        parts.splice(i, 1);
        continue;
      }

      const a = Math.max(0, Math.min(1, p.life));
      if (p.t === "shard") {
        // lead reads as solid, so shards draw normally, not additive
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = a * 0.92;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        const grd = ctx.createLinearGradient(-p.r, -p.r, p.r, p.r);
        grd.addColorStop(0, "rgba(150,156,172,1)");
        grd.addColorStop(0.55, "rgba(58,62,78,1)");
        grd.addColorStop(1, `rgba(${p.tint.r},${p.tint.g},${p.tint.b},0.9)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.moveTo(-p.r, -p.r * 0.5);
        ctx.lineTo(p.r * 0.8, -p.r * 0.75);
        ctx.lineTo(p.r, p.r * 0.55);
        ctx.lineTo(-p.r * 0.7, p.r * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        ctx.globalCompositeOperation = "lighter";
      } else {
        ctx.globalAlpha = a;
        const c = heatColor(p.life, p.tint);
        if (p.trail) {
          ctx.strokeStyle = `rgba(${c},${a * 0.55})`;
          ctx.lineWidth = p.r * 0.9;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(p.x - p.vx * 2.2, p.y - p.vy * 2.2);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
        ctx.fillStyle = `rgb(${c})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fill();
      }
    }
    ctx.restore();

    // ── shockwave rings ──
    for (let i = rings.length - 1; i >= 0; i--) {
      const rg = rings[i];
      if (!isFrozen) rg.t += dt * 1000;
      const k = rg.t / rg.ms;
      if (k >= 1) {
        rings.splice(i, 1);
        continue;
      }
      const ease = 1 - Math.pow(1 - k, 3);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = (1 - k) * 0.9;
      ctx.strokeStyle = `rgba(${rg.tint.r},${rg.tint.g},${rg.tint.b},1)`;
      ctx.lineWidth = rg.w * (1 - k * 0.7);
      ctx.beginPath();
      ctx.arc(rg.x, rg.y, rg.r0 + (rg.r1 - rg.r0) * ease, 0, 6.2832);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    inTick = false;
    if (!document.hidden && (parts.length || rings.length || forgeOn || trauma > 0 || pourFrom || isFrozen)) {
      raf = requestAnimationFrame(tick);
    }
  };

  function ensure() {
    // inside a frame the tail of tick() owns rescheduling — see `inTick`
    if (inTick || raf || dead || document.hidden) return;
    last = 0;
    raf = requestAnimationFrame(tick);
  }

  const onVisibility = () => {
    if (document.hidden) {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    } else ensure();
  };
  document.addEventListener("visibilitychange", onVisibility);

  return {
    sparks,
    shatter,
    ring,
    pour,
    addTrauma,
    hitStop,
    frozen,
    setForge(on) {
      forgeOn = Boolean(on);
      ensure();
    },
    setHeat(v) {
      heat = Math.max(0, Math.min(1, v));
      ensure();
    },
    destroy() {
      dead = true;
      forgeOn = false;
      pourFrom = null;
      parts = [];
      rings = [];
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      try {
        ctx.clearRect(0, 0, W, H);
      } catch {
        /* canvas already torn down */
      }
    },
  };
}

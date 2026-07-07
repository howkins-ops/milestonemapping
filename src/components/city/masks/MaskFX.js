// ════════════════════════════════════════════════════════════════════════
// MASK ENCOUNTERS — battle particle canvas (embers · shards · bursts)
// Port of the concept's #fx engine with the perf law applied: THE ONLY
// particle canvas in the city, and it exists only while a battle is up.
// Caps: ~24 live particles on mobile / ~60 desktop, devicePixelRatio
// clamped to 2, rAF cancelled on document.hidden, empty idle, and destroy.
// Reduced motion: every spawn is a no-op — the loop never runs.
// ════════════════════════════════════════════════════════════════════════

export function hexRGB(h) {
  const n = parseInt(String(h).slice(1), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

export function createMaskFX(canvas, { reducedMotion = false } = {}) {
  if (!canvas || reducedMotion) {
    return {
      setEmber() {},
      spawnShards() {},
      spawnBurst() {},
      destroy() {},
    };
  }

  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cap = window.innerWidth < 720 ? 24 : 60;

  let W = 0;
  let H = 0;
  let parts = [];
  let emberOn = false;
  let emberColor = "255,90,45";
  let raf = 0;
  let dead = false;

  const resize = () => {
    W = canvas.width = Math.round(window.innerWidth * dpr);
    H = canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  };
  resize();
  window.addEventListener("resize", resize);

  const spawnEmber = () => {
    if (parts.length >= cap) return;
    parts.push({
      t: "e",
      x: Math.random() * W,
      y: H + 10,
      vx: (Math.random() - 0.5) * 0.25 * dpr,
      vy: -(0.35 + Math.random() * 0.8) * dpr,
      r: (1 + Math.random() * 2.2) * dpr,
      life: 1,
      decay: 0.0016 + Math.random() * 0.002,
      c: Math.random() < 0.85 ? emberColor : "255,220,180",
    });
  };

  const tick = () => {
    raf = 0;
    if (dead) return;
    ctx.clearRect(0, 0, W, H);
    if (emberOn && Math.random() < 0.3) spawnEmber();
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= p.decay;
      if (p.life <= 0) {
        parts.splice(i, 1);
        continue;
      }
      p.x += p.vx;
      p.y += p.vy;
      if (p.t === "s") {
        p.vy += p.g;
        p.rot += p.vr;
      }
      ctx.globalAlpha = Math.max(0, p.life);
      if (p.t === "s") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = `rgb(${p.c})`;
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        ctx.restore();
      } else {
        ctx.fillStyle = `rgb(${p.c})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 7);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    if ((parts.length || emberOn) && !document.hidden) {
      raf = requestAnimationFrame(tick);
    }
  };

  const ensure = () => {
    if (!raf && !dead && !document.hidden && (parts.length || emberOn)) {
      raf = requestAnimationFrame(tick);
    }
  };

  const onVisibility = () => {
    if (document.hidden) {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    } else {
      ensure();
    }
  };
  document.addEventListener("visibilitychange", onVisibility);

  return {
    // background ember drift while the fight is live (boss color)
    setEmber(on, colorHex) {
      emberOn = Boolean(on);
      if (colorHex) emberColor = hexRGB(colorHex);
      ensure();
    },
    // a health segment shattering — rect in CSS px
    spawnShards(x, y, w, h, n = 42) {
      const room = Math.max(0, cap - parts.length);
      const count = Math.min(n, Math.max(room, 8));
      for (let i = 0; i < count; i++) {
        parts.push({
          t: "s",
          x: (x + Math.random() * w) * dpr,
          y: (y + Math.random() * h) * dpr,
          vx: (Math.random() - 0.5) * 7 * dpr,
          vy: (-2 - Math.random() * 5) * dpr,
          g: 0.22 * dpr,
          r: (1.5 + Math.random() * 3.5) * dpr,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
          life: 1,
          decay: 0.012 + Math.random() * 0.014,
          c: Math.random() < 0.7 ? "111,210,255" : "235,250,255",
        });
      }
      ensure();
    },
    // radial burst at a point — color is a hex string
    spawnBurst(x, y, colorHex, n = 26, spd = 5) {
      const c = hexRGB(colorHex);
      const room = Math.max(0, cap - parts.length);
      const count = Math.min(n, Math.max(room, 8));
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = (1 + Math.random() * spd) * dpr;
        parts.push({
          t: "e",
          x: x * dpr,
          y: y * dpr,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          r: (1 + Math.random() * 2.5) * dpr,
          life: 1,
          decay: 0.02 + Math.random() * 0.02,
          c,
        });
      }
      ensure();
    },
    destroy() {
      dead = true;
      emberOn = false;
      parts = [];
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      try {
        ctx.clearRect(0, 0, W, H);
      } catch {
        /* canvas already gone */
      }
    },
  };
}

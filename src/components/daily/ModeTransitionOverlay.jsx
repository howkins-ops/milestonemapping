import React, { useEffect, useRef, useCallback } from "react";

const DURATION = 2800; // ms

// Consistent pseudo-random from integer seed
function hash(n) {
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  return ((n ^ (n >>> 16)) >>> 0) / 0xffffffff;
}

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
function easeInOut(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// ─── Night: moon rises, stars bloom, indigo haze ───────────────────────────
function drawNight(ctx, w, h, t, elapsed) {
  // Sky gradient — deep indigo/violet
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0,   `hsl(255,80%,${3 + t*3}%)`);
  sky.addColorStop(0.45,`hsl(248,85%,${5 + t*4}%)`);
  sky.addColorStop(0.85,`hsl(238,75%,${4 + t*3}%)`);
  sky.addColorStop(1,   `hsl(230,60%,${2}%)`);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Stars — 150 of them, staggered bloom-in
  const STARS = 150;
  for (let i = 0; i < STARS; i++) {
    const sx   = hash(i * 7 + 1) * w;
    const sy   = hash(i * 7 + 2) * h * 0.78;
    const size = hash(i * 7 + 3) * 1.6 + 0.3;
    const hue  = 180 + hash(i * 7 + 4) * 80;
    const startAt = hash(i * 7 + 5) * 0.55;
    const sp   = clamp((t - startAt) / 0.35, 0, 1);
    if (sp <= 0) continue;
    const twinkle = 0.55 + 0.45 * Math.sin(elapsed * 0.002 + i * 1.87);
    ctx.globalAlpha = sp * twinkle;
    ctx.fillStyle = `hsl(${hue},50%,92%)`;
    ctx.beginPath();
    ctx.arc(sx, sy, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Nebula blobs — soft glowing clouds
  const blobs = [
    { x: 0.22, y: 0.18, r: 0.18, hue: 260, sat: 70, lit: 18 },
    { x: 0.75, y: 0.28, r: 0.14, hue: 240, sat: 65, lit: 14 },
    { x: 0.50, y: 0.12, r: 0.12, hue: 275, sat: 60, lit: 12 },
  ];
  blobs.forEach(b => {
    const g = ctx.createRadialGradient(b.x*w, b.y*h, 0, b.x*w, b.y*h, b.r*w);
    g.addColorStop(0,   `hsla(${b.hue},${b.sat}%,${b.lit}%,${0.22*t})`);
    g.addColorStop(0.5, `hsla(${b.hue},${b.sat}%,${b.lit}%,${0.08*t})`);
    g.addColorStop(1,   `hsla(${b.hue},${b.sat}%,${b.lit}%,0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });

  // Moon rise
  const moonX  = w * 0.64;
  const moonR  = Math.min(w, h) * 0.075;
  const moonProg = easeOut(clamp((t - 0.08) / 0.92, 0, 1));
  const moonY  = h * 1.05 - moonProg * (h * 0.75);

  // Outer corona
  const corona = ctx.createRadialGradient(moonX, moonY, moonR*0.9, moonX, moonY, moonR * 4.5);
  corona.addColorStop(0,   `rgba(140,200,255,${0.18 * moonProg})`);
  corona.addColorStop(0.35,`rgba(80,150,240,${0.08 * moonProg})`);
  corona.addColorStop(1,   `rgba(0,0,0,0)`);
  ctx.fillStyle = corona;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR * 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Moon body
  ctx.fillStyle = `rgba(218,235,255,${moonProg})`;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
  ctx.fill();

  // Crescent shadow — offset circle bites into moon
  ctx.fillStyle = `rgba(4,0,18,${moonProg * 0.88})`;
  ctx.beginPath();
  ctx.arc(moonX - moonR * 0.28, moonY - moonR * 0.08, moonR * 0.84, 0, Math.PI * 2);
  ctx.fill();

  // Moon surface faint craters
  ctx.globalAlpha = moonProg * 0.12;
  [[0.3, -0.25, 0.12], [-0.15, 0.32, 0.09], [0.42, 0.18, 0.07]].forEach(([dx, dy, cr]) => {
    ctx.fillStyle = `rgba(100,140,200,1)`;
    ctx.beginPath();
    ctx.arc(moonX + moonR * dx, moonY + moonR * dy, moonR * cr, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Horizon atmospheric haze
  const haze = ctx.createLinearGradient(0, h * 0.68, 0, h);
  haze.addColorStop(0, `rgba(0,0,0,0)`);
  haze.addColorStop(0.4, `rgba(15,5,50,${0.55 * t})`);
  haze.addColorStop(1,   `rgba(6,0,25,${0.9 * t})`);
  ctx.fillStyle = haze;
  ctx.fillRect(0, h * 0.68, w, h * 0.32);

  // Electric blue horizon line glow
  const horizBlue = ctx.createLinearGradient(0, h * 0.71, 0, h * 0.77);
  horizBlue.addColorStop(0,   `rgba(0,0,0,0)`);
  horizBlue.addColorStop(0.5, `rgba(40,80,200,${0.25 * t})`);
  horizBlue.addColorStop(1,   `rgba(0,0,0,0)`);
  ctx.fillStyle = horizBlue;
  ctx.fillRect(0, h * 0.71, w, h * 0.06);
}

// ─── Morning: sun rises, rays bloom, sky ignites ───────────────────────────
function drawMorning(ctx, w, h, t, elapsed) {
  const sunProg = easeOut(clamp((t - 0.05) / 0.95, 0, 1));
  const horizonY = h * 0.68;
  const sunX = w * 0.5;
  const sunY = horizonY + 30 - sunProg * (h * 0.42);
  const sunR = Math.min(w, h) * 0.052 * (0.5 + sunProg * 0.5);

  // Sky — dark navy warms to amber/coral
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0,    `hsl(225,70%,${4 + t*9}%)`);
  sky.addColorStop(0.35, `hsl(${220 - t*80},${50 + t*30}%,${5 + t*14}%)`);
  sky.addColorStop(0.65, `hsl(${25 + t*10},${40 + t*45}%,${6 + t*28}%)`);
  sky.addColorStop(0.85, `hsl(${20 + t*8},${50 + t*35}%,${8 + t*32}%)`);
  sky.addColorStop(1,    `hsl(15,60%,${5 + t*18}%)`);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Wide horizon bloom behind sun
  const bloom = ctx.createRadialGradient(sunX, horizonY, 0, sunX, horizonY, w * 0.65);
  bloom.addColorStop(0,   `rgba(255,180,60,${0.55 * t})`);
  bloom.addColorStop(0.25,`rgba(255,110,30,${0.28 * t})`);
  bloom.addColorStop(0.55,`rgba(200,60,10,${0.10 * t})`);
  bloom.addColorStop(1,   `rgba(0,0,0,0)`);
  ctx.fillStyle = bloom;
  ctx.fillRect(0, horizonY - h*0.25, w, h*0.5);

  // Light rays — triangular beams
  const RAY_COUNT = 14;
  ctx.save();
  ctx.translate(sunX, sunY);
  for (let i = 0; i < RAY_COUNT; i++) {
    const angle  = (i / RAY_COUNT) * Math.PI * 2;
    const len    = sunR * (5 + sunProg * 14) * (0.6 + 0.4 * hash(i * 3 + 11));
    const spread = 0.055 + hash(i * 3 + 12) * 0.045;
    const alpha  = sunProg * (0.08 + hash(i * 3 + 13) * 0.10);
    const shimmer = 0.7 + 0.3 * Math.sin(elapsed * 0.0015 + i * 0.9);

    const a1 = angle - spread;
    const a2 = angle + spread;
    const g = ctx.createLinearGradient(0, 0, Math.cos(angle) * len, Math.sin(angle) * len);
    g.addColorStop(0,   `rgba(255,210,100,${alpha * shimmer})`);
    g.addColorStop(0.5, `rgba(255,150,40,${alpha * 0.5 * shimmer})`);
    g.addColorStop(1,   `rgba(255,100,20,0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a1) * len, Math.sin(a1) * len);
    ctx.lineTo(Math.cos(a2) * len, Math.sin(a2) * len);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Sun outer glow layers
  [[6, 0.30], [3.5, 0.50], [1.8, 0.80]].forEach(([mult, alpha]) => {
    const g = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * mult);
    g.addColorStop(0,   `rgba(255,230,150,${alpha * sunProg})`);
    g.addColorStop(0.4, `rgba(255,170,50,${alpha * 0.4 * sunProg})`);
    g.addColorStop(1,   `rgba(0,0,0,0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * mult, 0, Math.PI * 2);
    ctx.fill();
  });

  // Sun disc
  const disc = ctx.createRadialGradient(sunX - sunR*0.15, sunY - sunR*0.15, 0, sunX, sunY, sunR);
  disc.addColorStop(0,   `rgba(255,255,230,${sunProg})`);
  disc.addColorStop(0.55,`rgba(255,230,120,${sunProg})`);
  disc.addColorStop(1,   `rgba(255,180,40,${sunProg})`);
  ctx.fillStyle = disc;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fill();

  // Horizon ground — dark silhouette
  ctx.fillStyle = `rgba(0,0,0,${0.6 * t})`;
  ctx.fillRect(0, horizonY + 2, w, h - horizonY - 2);

  // Ground edge glow
  const groundGlow = ctx.createLinearGradient(0, horizonY, 0, horizonY + 55);
  groundGlow.addColorStop(0, `rgba(255,120,20,${0.35 * t})`);
  groundGlow.addColorStop(1, `rgba(0,0,0,0)`);
  ctx.fillStyle = groundGlow;
  ctx.fillRect(0, horizonY, w, 55);

  // Atmosphere veil at top — keeps it from looking too bright
  const veil = ctx.createLinearGradient(0, 0, 0, h * 0.3);
  veil.addColorStop(0, `rgba(0,0,10,${0.3 * (1 - t * 0.5)})`);
  veil.addColorStop(1, `rgba(0,0,0,0)`);
  ctx.fillStyle = veil;
  ctx.fillRect(0, 0, w, h * 0.3);
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function ModeTransitionOverlay({ mode, onDone }) {
  const canvasRef  = useRef(null);
  const rafRef     = useRef(null);
  const startRef   = useRef(null);
  const isNight    = mode === "pm";

  const drawFrame  = useCallback((ctx, w, h, t, elapsed) => {
    ctx.clearRect(0, 0, w, h);
    if (isNight) drawNight(ctx, w, h, t, elapsed);
    else         drawMorning(ctx, w, h, t, elapsed);
  }, [isNight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const t = Math.min(1, elapsed / DURATION);
      drawFrame(ctx, canvas.width, canvas.height, t, elapsed);
      if (t < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    const timer = setTimeout(onDone, DURATION + 400);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timer);
    };
  }, [mode, onDone, drawFrame]);

  return (
    <div className={`mode-transition-overlay ${isNight ? "is-night" : "is-morning"}`}>
      <canvas ref={canvasRef} className="mode-transition-canvas" />
      <div className="mode-transition-label">
        <span className="mode-transition-eyebrow">
          {isNight ? "NIGHT MODE" : "MORNING MODE"}
        </span>
        <p className="mode-transition-headline">
          {isNight ? "Load tomorrow." : "Time to execute."}
        </p>
      </div>
    </div>
  );
}

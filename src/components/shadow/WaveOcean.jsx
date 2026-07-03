import React, { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────
// WaveOcean — the living sea behind Ride the Wave.
// A canvas night ocean in deep blues: parallax swell layers, moonlight,
// twinkling stars, bioluminescent motes drifting off the crests. The whole
// sea physically rises with the user's inhale (via breathRef) and settles
// on the exhale. When mode="dawn" the scene slowly warms into sunrise —
// the wave passed, the light comes back.
//
// breathRef.current = { active, phase: "inhale"|"exhale", progress: 0..1 }
// Reduced motion renders a single still frame — no animation loop at all.
// ─────────────────────────────────────────────────────────────────────────

const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const mix = (a, b, t) => {
  const [ar, ag, ab] = hex(a);
  const [br, bg, bb] = hex(b);
  return `rgb(${Math.round(ar + (br - ar) * t)},${Math.round(ag + (bg - ag) * t)},${Math.round(ab + (bb - ab) * t)})`;
};
const mixA = (a, b, t, alpha) => mix(a, b, t).replace("rgb", "rgba").replace(")", `,${alpha})`);

// Back → front. night/dawn are the fill tops; glow tints the crest line.
const LAYERS = [
  { yf: 0.560, amp: 3.5, sw: 5, freq: 1.7, spd: 0.36, ph: 0.6, lift: 5, night: "#12416e", dawn: "#41719f", glowN: "#8fe6ff", glowD: "#ffd9a0" },
  { yf: 0.645, amp: 5.5, sw: 9, freq: 1.35, spd: 0.52, ph: 2.2, lift: 9, night: "#0c335c", dawn: "#2c5b8a", glowN: "#74dcff", glowD: "#ffcf92" },
  { yf: 0.760, amp: 8.5, sw: 13, freq: 1.05, spd: 0.72, ph: 4.1, lift: 13, night: "#072345", dawn: "#1c4470", glowN: "#5accf2", glowD: "#ffc084" },
  { yf: 0.905, amp: 11, sw: 17, freq: 0.85, spd: 0.95, ph: 1.3, lift: 18, night: "#041229", dawn: "#0e2c4e", glowN: "#3fb4de", glowD: "#f2ad72" },
];

const waveY = (x, w, t, L) =>
  L.amp2 * Math.sin((x / w) * Math.PI * 2 * L.freq + t * L.spd + L.ph) +
  L.amp2 * 0.45 * Math.sin((x / w) * Math.PI * 2 * L.freq * 2.3 - t * L.spd * 1.6 + L.ph * 2.7);

function seed(scene, w, h) {
  scene.stars = Array.from({ length: 110 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h * 0.48,
    r: 0.4 + Math.random() * 1.1,
    tw: Math.random() * Math.PI * 2,
    spd: 0.4 + Math.random() * 1.2,
  }));
  scene.motes = Array.from({ length: 28 }, () => ({
    x: Math.random() * w,
    y: h * (0.56 + Math.random() * 0.4),
    r: 0.8 + Math.random() * 1.6,
    vy: 0.04 + Math.random() * 0.1,
    tw: Math.random() * Math.PI * 2,
  }));
}

function draw(ctx, scene, w, h) {
  const { t, swell, warm } = scene;
  const horizon = h * 0.53 - swell * h * 0.02;
  const moonX = w * 0.72;
  const moonY = h * 0.24;

  // Sky — deep night blues warming into sunrise.
  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, mix("#020817", "#17355c", warm));
  sky.addColorStop(0.62, mix("#06204a", "#4b6a97", warm));
  sky.addColorStop(1, mix("#0d3763", "#f8a870", warm));
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, horizon + 2);

  // Stars fade as the dawn comes up.
  if (warm < 0.98) {
    for (const s of scene.stars) {
      const a = (0.25 + 0.65 * Math.abs(Math.sin(t * s.spd + s.tw))) * (1 - warm) * (1 - s.y / (h * 0.55));
      if (a <= 0.02) continue;
      ctx.fillStyle = `rgba(214,230,255,${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Moon (night) — hands over to a rising sun glow (dawn).
  const moonA = 1 - warm;
  if (moonA > 0.02) {
    const halo = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, h * 0.38);
    halo.addColorStop(0, `rgba(190,220,255,${0.35 * moonA})`);
    halo.addColorStop(0.35, `rgba(140,190,255,${0.1 * moonA})`);
    halo.addColorStop(1, "rgba(120,180,255,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, horizon + 2);
    ctx.fillStyle = `rgba(226,238,255,${0.95 * moonA})`;
    ctx.beginPath();
    ctx.arc(moonX, moonY, Math.max(10, h * 0.045), 0, Math.PI * 2);
    ctx.fill();
  }
  if (warm > 0.02) {
    const sun = ctx.createRadialGradient(w * 0.5, horizon, 0, w * 0.5, horizon, h * 0.55);
    sun.addColorStop(0, `rgba(255,190,120,${0.55 * warm})`);
    sun.addColorStop(0.4, `rgba(255,150,90,${0.18 * warm})`);
    sun.addColorStop(1, "rgba(255,140,80,0)");
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, w, h);
  }

  // Sea base under everything.
  ctx.fillStyle = mix("#03102a", "#123a5e", warm);
  ctx.fillRect(0, horizon, w, h - horizon);

  // Parallax swell layers, back to front. The whole sea lifts on the inhale.
  for (const L of LAYERS) {
    L.amp2 = (L.amp + L.sw * swell) * (h / 300);
    const baseY = h * L.yf - swell * L.lift * (h / 300);
    const fill = ctx.createLinearGradient(0, baseY - L.amp2 * 2, 0, h);
    fill.addColorStop(0, mix(L.night, L.dawn, warm));
    fill.addColorStop(1, mix("#020a1c", "#0a2038", warm));
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(-4, baseY + waveY(0, w, t, L));
    for (let x = 0; x <= w + 4; x += 4) ctx.lineTo(x, baseY + waveY(x, w, t, L));
    ctx.lineTo(w + 4, h + 4);
    ctx.lineTo(-4, h + 4);
    ctx.closePath();
    ctx.fill();

    // Crest light: a wide soft pass then a thin bright one. Brightens near
    // the moon column at night and with every inhale.
    for (const [lw, aBase] of [[3.2, 0.05], [1.3, 0.16]]) {
      ctx.lineWidth = lw;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const y = baseY + waveY(x, w, t, L);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = mixA(L.glowN, L.glowD, warm, Math.min(0.5, aBase + 0.22 * swell));
      ctx.stroke();
    }
  }

  // Moonlight glint column on the water.
  if (moonA > 0.02) {
    const col = ctx.createLinearGradient(moonX - w * 0.09, 0, moonX + w * 0.09, 0);
    col.addColorStop(0, "rgba(160,220,255,0)");
    col.addColorStop(0.5, `rgba(170,225,255,${(0.06 + 0.07 * swell) * moonA})`);
    col.addColorStop(1, "rgba(160,220,255,0)");
    ctx.fillStyle = col;
    ctx.fillRect(moonX - w * 0.09, horizon, w * 0.18, h - horizon);
  }

  // Bioluminescent motes drifting off the crests — brighter on the inhale.
  for (const m of scene.motes) {
    const a = (0.2 + 0.45 * Math.abs(Math.sin(t * 0.8 + m.tw))) * (0.45 + 0.55 * swell) * (1 - warm * 0.6);
    if (a <= 0.02) continue;
    ctx.fillStyle = `rgba(126,243,255,${a.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Horizon mist + soft vignette to seat the scene in the card.
  const mist = ctx.createLinearGradient(0, horizon - h * 0.06, 0, horizon + h * 0.09);
  mist.addColorStop(0, "rgba(140,190,235,0)");
  mist.addColorStop(0.5, `rgba(150,200,240,${0.07 * (1 - warm * 0.5)})`);
  mist.addColorStop(1, "rgba(140,190,235,0)");
  ctx.fillStyle = mist;
  ctx.fillRect(0, horizon - h * 0.06, w, h * 0.15);

  const vig = ctx.createRadialGradient(w / 2, h * 0.55, h * 0.35, w / 2, h * 0.55, h * 1.05);
  vig.addColorStop(0, "rgba(1,4,12,0)");
  vig.addColorStop(1, "rgba(1,4,12,0.42)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

export default function WaveOcean({ breathRef, mode = "night", reducedMotion = false, className = "" }) {
  const canvasRef = useRef(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const sceneRef = useRef(null);
  // warm always starts at 0 so mounting in dawn mode plays the sunrise.
  if (!sceneRef.current) sceneRef.current = { t: 0, swell: 0.35, warm: 0, stars: [], motes: [] };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    const scene = sceneRef.current;
    let w = 0;
    let h = 0;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.parentElement.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed(scene, w, h);
      if (reducedMotion) draw(ctx, scene, w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    if (reducedMotion) {
      // One calm still frame; re-drawn only on resize / mode change.
      scene.warm = modeRef.current === "dawn" ? 1 : 0;
      scene.swell = 0.4;
      draw(ctx, scene, w, h);
      return () => window.removeEventListener("resize", resize);
    }

    const frame = () => {
      scene.t += 1 / 60;

      // Ease the sea toward the breath (or a slow idle swell between phases).
      const b = breathRef?.current;
      const target = b?.active
        ? (b.phase === "inhale" ? 0.15 + 0.85 * b.progress : 1 - 0.85 * b.progress)
        : 0.32 + 0.14 * Math.sin(scene.t * 0.45);
      scene.swell += (target - scene.swell) * 0.035;

      const warmTarget = modeRef.current === "dawn" ? 1 : 0;
      scene.warm += (warmTarget - scene.warm) * 0.008;

      for (const m of scene.motes) {
        m.y -= m.vy * (0.6 + scene.swell);
        m.x += Math.sin(scene.t * 0.5 + m.tw) * 0.08;
        if (m.y < h * 0.54) { m.y = h * 0.98; m.x = Math.random() * w; }
      }

      draw(ctx, scene, w, h);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion, mode]);

  return (
    <div className={`wave-ocean ${className}`} aria-hidden>
      <canvas ref={canvasRef} className="wave-ocean__canvas" />
    </div>
  );
}

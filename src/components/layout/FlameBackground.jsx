import { useEffect, useRef } from "react";
import { useSettings } from "../../hooks/useSettings.js";

// Brand color ramp 0-255:
// 0 = void/transparent → deep purple → phoenix purple → magenta → hot pink → cyan → white-hot
const buildPalette = () => {
  const buf = new Uint8ClampedArray(256 * 4);
  const lerp = (a, b, t) => Math.round(a + (b - a) * t);
  const set = (i, r, g, b, a) => {
    buf[i * 4]     = r;
    buf[i * 4 + 1] = g;
    buf[i * 4 + 2] = b;
    buf[i * 4 + 3] = a;
  };

  for (let i = 0; i < 256; i++) {
    if (i === 0) {
      set(i, 0, 0, 0, 0);
    } else if (i < 30) {
      // void → deep purple shadow
      const t = i / 30;
      set(i, lerp(5, 18, t), 0, lerp(7, 22, t), lerp(0, 120, t));
    } else if (i < 85) {
      // deep purple → phoenix purple #7B2CFF
      const t = (i - 30) / 55;
      set(i, lerp(18, 123, t), lerp(0, 44, t), lerp(22, 255, t), lerp(120, 210, t));
    } else if (i < 145) {
      // phoenix purple → magenta #D11EFF
      const t = (i - 85) / 60;
      set(i, lerp(123, 209, t), lerp(44, 30, t), 255, lerp(210, 235, t));
    } else if (i < 200) {
      // magenta → hot pink #FF3EDB
      const t = (i - 145) / 55;
      set(i, lerp(209, 255, t), lerp(30, 62, t), lerp(255, 219, t), 245);
    } else if (i < 240) {
      // hot pink → electric cyan #00F0FF (flame tip)
      const t = (i - 200) / 40;
      set(i, lerp(255, 0, t), lerp(62, 240, t), lerp(219, 255, t), 255);
    } else {
      // cyan → white-hot core
      const t = (i - 240) / 15;
      set(i, lerp(0, 200, t), lerp(240, 252, t), 255, 255);
    }
  }
  return buf;
};

const PALETTE = buildPalette();

// Flame simulation dimensions
const SIM_W = 150;
const SIM_H = 110;

export default function FlameBackground() {
  const { settings } = useSettings();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (settings.reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Off-screen sim canvas (low-res, scaled up)
    const sim = document.createElement("canvas");
    sim.width  = SIM_W;
    sim.height = SIM_H;
    const simCtx = sim.getContext("2d");
    const imgData = simCtx.createImageData(SIM_W, SIM_H);
    const pixels  = imgData.data;

    const fire = new Uint8Array(SIM_W * SIM_H);

    // Hot source clusters across the bottom
    const CLUSTERS = [0.08, 0.22, 0.38, 0.52, 0.66, 0.80, 0.94];

    const seedBottom = () => {
      const base = (SIM_H - 1) * SIM_W;
      for (let x = 0; x < SIM_W; x++) {
        let heat = Math.random() * 60 + 80;
        for (const cx of CLUSTERS) {
          const dist = Math.abs(x / SIM_W - cx);
          if (dist < 0.12) {
            heat += (1 - dist / 0.12) * 160;
          }
        }
        fire[base + x] = Math.min(255, Math.round(heat));
      }
    };

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    let animId;
    let lastTime = 0;
    const FPS = 30;
    const INTERVAL = 1000 / FPS;

    const tick = (ts) => {
      animId = requestAnimationFrame(tick);
      if (ts - lastTime < INTERVAL) return;
      lastTime = ts;

      seedBottom();

      // Propagate fire upward
      for (let y = 0; y < SIM_H - 1; y++) {
        const rowAbove = y * SIM_W;
        const rowBelow = (y + 1) * SIM_W;
        for (let x = 0; x < SIM_W; x++) {
          const b  = fire[rowBelow + x];
          const bL = fire[rowBelow + Math.max(0, x - 1)];
          const bR = fire[rowBelow + Math.min(SIM_W - 1, x + 1)];
          const bL2= fire[rowBelow + Math.max(0, x - 2)];
          const decay = (Math.random() * 4 + 1) | 0;
          fire[rowAbove + x] = Math.max(0, (((b + bL + bR + bL2) >> 2) - decay));
        }
      }

      // Map heat → brand colors
      for (let i = 0; i < SIM_W * SIM_H; i++) {
        const v  = fire[i];
        const pi = v * 4;
        const di = i * 4;
        pixels[di]     = PALETTE[pi];
        pixels[di + 1] = PALETTE[pi + 1];
        pixels[di + 2] = PALETTE[pi + 2];
        pixels[di + 3] = PALETTE[pi + 3];
      }

      simCtx.putImageData(imgData, 0, 0);

      // Scale low-res sim up to full canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled   = true;
      ctx.imageSmoothingQuality   = "high";
      ctx.drawImage(sim, 0, 0, canvas.width, canvas.height);
    };

    animId = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [settings.reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        mixBlendMode: "screen",
        opacity: 0.5,
      }}
    />
  );
}

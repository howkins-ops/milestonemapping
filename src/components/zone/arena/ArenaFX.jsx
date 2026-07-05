// Arena FX layer — the build-once, reuse-everywhere motion + sound shell.
// Ported from the concept's 10-bg / 13-intro fragments, but rebuilt to obey
// the performance law (SQUAD-ARENA-APP-BUILD-PROMPT §3):
//   • NO custom cursor / tilt / mouse-parallax / per-frame scroll or move handlers.
//   • ONE capped requestAnimationFrame ember canvas — ~24 particles on mobile,
//     ~60 on desktop; devicePixelRatio clamped to 2.
//   • cancelAnimationFrame when the tab is hidden OR the canvas scrolls off-screen.
//   • prefers-reduced-motion → drop to a single near-static frame.
// Only compositor props (transform/opacity) are animated in CSS.

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { registerBurst, useArenaBurst, useSfxMute } from "./useArenaFX.js";
import { sfxWhoosh, sfxPop } from "../../../lib/sfx.js";

// Warm ember base palette (rising heat). The active fire tint is blended in so
// the whole field leans toward the current league color.
const EMBER_BASE = [
  [255, 176, 0], // amber
  [255, 122, 26], // burning
  [255, 209, 102], // gold
];
const COOL_BASE = [
  [0, 240, 255], // cyan
  [209, 30, 255], // magenta
];

function hexToRgb(hex) {
  if (!hex || typeof hex !== "string") return null;
  const h = hex.replace("#", "").trim();
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function isMobile() {
  try {
    return (
      (window.matchMedia && window.matchMedia("(max-width: 700px)").matches) ||
      window.innerWidth < 700
    );
  } catch {
    return false;
  }
}
function reducedMotion() {
  try {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

// ============================================================
//  <EmberCanvas/> — the ambient fire backdrop (mounts behind Zone content)
// ============================================================
export function EmberCanvas({ tint = "#00F0FF" }) {
  const canvasRef = useRef(null);
  // keep the latest tint without re-running the whole rAF setup
  const tintRef = useRef(tint);
  tintRef.current = tint;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;

    const reduce = reducedMotion();
    const mobile = isMobile();

    // §3 caps — kept low; total ambient particles stay well under budget.
    const EMBER_CAP = reduce ? 14 : mobile ? 24 : 60;
    const SMOKE_CAP = reduce ? 3 : mobile ? 5 : 12;
    const MOTE_CAP = reduce ? 3 : mobile ? 5 : 12;

    let DPR = 1;
    let W = 0;
    let H = 0;
    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * DPR);
      canvas.height = Math.floor(H * DPR);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    function emberColors() {
      const t = hexToRgb(tintRef.current);
      return t ? EMBER_BASE.concat([t]) : EMBER_BASE;
    }
    function coolColors() {
      const t = hexToRgb(tintRef.current);
      return t ? [t].concat(COOL_BASE) : COOL_BASE;
    }

    const embers = [];
    const smoke = [];
    const motes = [];
    const bursts = [];

    function newEmber(seed) {
      const depth = Math.random();
      return {
        x: rand(0, W),
        y: seed ? rand(0, H) : H + rand(4, 40),
        r: rand(0.6, 2.4) * (0.6 + depth),
        vy: -rand(0.18, 0.7) * (0.5 + depth),
        vx: rand(-0.16, 0.16),
        life: 0,
        max: rand(280, 820),
        col: pick(emberColors()),
        depth,
        flick: rand(0, Math.PI * 2),
        flickSpd: rand(0.03, 0.09),
        amp: rand(4, 16),
      };
    }
    function newSmoke(seed) {
      const depth = Math.random();
      return {
        x: rand(-40, W + 40),
        y: seed ? rand(0, H) : H + rand(20, 120),
        r: rand(60, 150) * (0.7 + depth * 0.6),
        vy: -rand(0.06, 0.2),
        vx: rand(-0.08, 0.08),
        life: 0,
        max: rand(600, 1300),
        depth,
        hue: pick([[255, 122, 26], [255, 59, 92], [209, 30, 255]]),
      };
    }
    function newMote(seed) {
      const depth = Math.random();
      return {
        x: rand(0, W),
        y: seed ? rand(0, H) : H + rand(10, 60),
        r: rand(0.5, 1.6),
        vy: -rand(0.1, 0.4),
        vx: rand(-0.12, 0.12),
        life: 0,
        max: rand(400, 1000),
        col: pick(coolColors()),
        depth,
        flick: rand(0, Math.PI * 2),
        flickSpd: rand(0.02, 0.05),
        amp: rand(8, 22),
      };
    }

    for (let i = 0; i < EMBER_CAP; i++) embers.push(newEmber(true));
    for (let i = 0; i < SMOKE_CAP; i++) smoke.push(newSmoke(true));
    for (let i = 0; i < MOTE_CAP; i++) motes.push(newMote(true));

    // ---- spark burst (registered on the module bridge) ----
    function makeSpark(x, y, col, scale) {
      const ang = rand(0, Math.PI * 2);
      const spd = rand(1.2, 5.2) * scale;
      return {
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - rand(0.4, 1.4),
        r: rand(1, 2.8),
        life: 0,
        max: rand(28, 64),
        col,
        grav: rand(0.02, 0.06),
      };
    }
    function resolveTint(color) {
      const named = hexToRgb(color) || hexToRgb(tintRef.current);
      return named || [255, 176, 0];
    }
    function spawnBurst(x, y, color) {
      const col = resolveTint(color);
      const n = reduce ? 4 : 14 + ((Math.random() * 10) | 0);
      for (let k = 0; k < n; k++) bursts.push(makeSpark(x, y, col, reduce ? 0.5 : 1));
    }
    const unregister = registerBurst(spawnBurst);

    let nextSpark = rand(120, 300);
    let raf = 0;
    let running = true;
    let onScreen = true;
    let last = performance.now();

    function drawFrame(dt) {
      ctx.clearRect(0, 0, W, H);

      // SMOKE (soft, source-over)
      ctx.globalCompositeOperation = "source-over";
      for (let si = 0; si < smoke.length; si++) {
        const p = smoke[si];
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        const lt = p.life / p.max;
        if (lt >= 1 || p.y < -p.r * 1.5) {
          smoke[si] = newSmoke(false);
          continue;
        }
        const fade = Math.sin(Math.min(1, lt) * Math.PI);
        const a = fade * 0.05 * (0.5 + p.depth);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(${p.hue[0]},${p.hue[1]},${p.hue[2]},${a})`);
        g.addColorStop(0.6, `rgba(${p.hue[0]},${p.hue[1]},${p.hue[2]},${a * 0.4})`);
        g.addColorStop(1, `rgba(${p.hue[0]},${p.hue[1]},${p.hue[2]},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // additive glow for embers/motes/sparks
      ctx.globalCompositeOperation = "lighter";

      // COOL MOTES
      for (let mi = 0; mi < motes.length; mi++) {
        const q = motes[mi];
        q.life += dt;
        q.flick += q.flickSpd * dt;
        q.x += (q.vx + Math.sin(q.flick) * 0.01 * q.amp) * dt;
        q.y += q.vy * dt;
        const qlt = q.life / q.max;
        if (qlt >= 1 || q.y < -6) {
          motes[mi] = newMote(false);
          continue;
        }
        const qa = Math.sin(Math.min(1, qlt) * Math.PI) * 0.4;
        const qr = q.r * (2.4 + q.depth) * 3;
        const qg = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, qr);
        qg.addColorStop(0, `rgba(${q.col[0]},${q.col[1]},${q.col[2]},${qa})`);
        qg.addColorStop(0.4, `rgba(${q.col[0]},${q.col[1]},${q.col[2]},${qa * 0.5})`);
        qg.addColorStop(1, `rgba(${q.col[0]},${q.col[1]},${q.col[2]},0)`);
        ctx.fillStyle = qg;
        ctx.beginPath();
        ctx.arc(q.x, q.y, qr, 0, Math.PI * 2);
        ctx.fill();
      }

      // EMBERS
      for (let ei = 0; ei < embers.length; ei++) {
        const e = embers[ei];
        e.life += dt;
        e.flick += e.flickSpd * dt;
        const sway = Math.sin(e.flick) * 0.02 * e.amp;
        e.x += (e.vx + sway) * dt;
        e.y += e.vy * dt;
        const elt = e.life / e.max;
        if (elt >= 1 || e.y < -8) {
          embers[ei] = newEmber(false);
          continue;
        }
        let efade = elt < 0.12 ? elt / 0.12 : 1 - (elt - 0.12) / 0.88;
        efade = Math.max(0, efade);
        const flick = 0.72 + 0.28 * Math.sin(e.flick * 3.3);
        const ea = efade * 0.5 * flick;
        const core = e.r * (0.9 + e.depth * 0.8);
        const halo = core * 4.5;
        const eg = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, halo);
        eg.addColorStop(0, `rgba(${e.col[0]},${e.col[1]},${e.col[2]},${ea})`);
        eg.addColorStop(0.35, `rgba(${e.col[0]},${e.col[1]},${e.col[2]},${ea * 0.35})`);
        eg.addColorStop(1, `rgba(${e.col[0]},${e.col[1]},${e.col[2]},0)`);
        ctx.fillStyle = eg;
        ctx.beginPath();
        ctx.arc(e.x, e.y, halo, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255,${Math.min(255, e.col[1] + 80)},${Math.min(255, e.col[2] + 120)},${ea * 0.9})`;
        ctx.beginPath();
        ctx.arc(e.x, e.y, core * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // occasional ambient spark burst (cheap, capped)
      if (!reduce) {
        nextSpark -= dt;
        if (nextSpark <= 0) {
          nextSpark = rand(200, 460);
          const bx = rand(W * 0.1, W * 0.9);
          const by = rand(H * 0.55, H * 0.95);
          const col = pick(emberColors());
          const cnt = 5 + ((Math.random() * 5) | 0);
          for (let bs = 0; bs < cnt; bs++) bursts.push(makeSpark(bx, by, col, 0.8));
        }
      }

      // BURSTS / SPARKS
      for (let bi = bursts.length - 1; bi >= 0; bi--) {
        const b = bursts[bi];
        b.life += dt;
        if (b.life >= b.max) {
          bursts.splice(bi, 1);
          continue;
        }
        b.vy += b.grav * dt;
        b.vx *= Math.pow(0.965, dt);
        b.vy *= Math.pow(0.985, dt);
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        const blt = b.life / b.max;
        const ba = (1 - blt) * 0.85;
        const br = b.r * (1 - blt * 0.4);
        const bg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, br * 4);
        bg.addColorStop(0, `rgba(${b.col[0]},${b.col[1]},${b.col[2]},${ba})`);
        bg.addColorStop(0.5, `rgba(${b.col[0]},${b.col[1]},${b.col[2]},${ba * 0.4})`);
        bg.addColorStop(1, `rgba(${b.col[0]},${b.col[1]},${b.col[2]},0)`);
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.arc(b.x, b.y, br * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${ba * 0.8})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, br * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
    }

    function step(now) {
      if (!running || !onScreen) return;
      const dt = Math.min(2.5, (now - last) / 16.6667);
      last = now;
      drawFrame(dt);
      raf = requestAnimationFrame(step);
    }

    function start() {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(step);
    }
    function stop() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    if (reduce) {
      // near-static: paint a single dim frame, no loop
      drawFrame(1);
    } else {
      start();
    }

    // pause on tab hidden
    const onVisibility = () => {
      running = document.visibilityState !== "hidden";
      if (running && onScreen && !reduce) start();
      else stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // pause when scrolled off-screen (observe the canvas itself; no scroll handler)
    let io = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          onScreen = entries[0]?.isIntersecting ?? true;
          if (running && onScreen && !reduce) start();
          else stop();
        },
        { threshold: 0 }
      );
      io.observe(canvas);
    }

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      if (io) io.disconnect();
      unregister();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps — tint tracked via ref

  return <canvas ref={canvasRef} className="arena-embers" aria-hidden="true" />;
}

// ============================================================
//  <ArenaIntro/> — the once-per-session cinematic (portaled to <body>)
// ============================================================
// Module guard dedupes React StrictMode's double-mount within one page load;
// sessionStorage keeps it to once per browser session across navigations.
let _introConsumed = false;
const INTRO_KEY = "zone_arena_intro_seen";

export function ArenaIntro({ onDone }) {
  const [show, setShow] = useState(false);
  const [out, setOut] = useState(false);
  const rootRef = useRef(null);
  const emberRef = useRef(null);
  const burst = useArenaBurst();

  useEffect(() => {
    let alreadySeen = _introConsumed;
    try {
      if (sessionStorage.getItem(INTRO_KEY)) alreadySeen = true;
    } catch { /* storage blocked */ }
    if (alreadySeen) {
      onDone && onDone();
      return undefined;
    }
    _introConsumed = true;
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch { /* ignore */ }
    setShow(true);
    return undefined;
  }, [onDone]);

  // choreography + intro ember canvas, only while shown
  useEffect(() => {
    if (!show) return undefined;
    const reduce = reducedMotion();
    const root = rootRef.current;
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    let done = false;

    const T = reduce
      ? { arena: 120, ignite: 260, finish: 900 }
      : { arena: 820, ignite: 1180, finish: 2200 };

    // reveal choreography (CSS classes toggled on child nodes)
    const scan = root?.querySelector(".arena-intro__scan");
    const arena = root?.querySelector(".arena-intro__arena");
    const flash = root?.querySelector(".arena-intro__flash");
    const shake = root?.querySelector(".arena-intro__shake");

    later(() => scan && scan.classList.add("is-sweep"), reduce ? 10 : 40);
    later(() => {
      arena && arena.classList.add("is-ignite");
      try {
        sfxWhoosh();
      } catch { /* silent */ }
    }, T.arena);
    later(() => {
      flash && flash.classList.add("is-boom");
      if (shake && !reduce) {
        shake.classList.add("is-quake");
        later(() => shake.classList.remove("is-quake"), 420);
      }
    }, T.arena + (reduce ? 60 : 520));

    // intro's own capped ember canvas
    const cv = emberRef.current;
    const ictx = cv && cv.getContext("2d");
    let DPR = Math.min(window.devicePixelRatio || 1, 2);
    let iW = 0;
    let iH = 0;
    let parts = [];
    let iraf = 0;
    let irunning = true;
    const CAP = reduce ? 0 : isMobile() ? 44 : 84;
    const COLORS = ["#FFB000", "#FF7A1A", "#FFD166", "#FF3B5C"];
    const iresize = () => {
      if (!cv) return;
      iW = cv.width = window.innerWidth * DPR;
      iH = cv.height = window.innerHeight * DPR;
      cv.style.width = window.innerWidth + "px";
      cv.style.height = window.innerHeight + "px";
    };
    const ispawn = (n) => {
      for (let i = 0; i < n; i++) {
        parts.push({
          x: Math.random() * iW,
          y: iH + Math.random() * 40 * DPR,
          r: (Math.random() * 2.2 + 0.6) * DPR,
          vy: -(Math.random() * 0.8 + 0.35) * DPR,
          vx: (Math.random() - 0.5) * 0.4 * DPR,
          life: 0,
          max: 180 + Math.random() * 160,
          c: COLORS[(Math.random() * COLORS.length) | 0],
        });
      }
    };
    const itick = () => {
      if (!irunning) return;
      iraf = requestAnimationFrame(itick);
      if (!ictx) return;
      ictx.clearRect(0, 0, iW, iH);
      ictx.globalCompositeOperation = "lighter";
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vx += (Math.random() - 0.5) * 0.03 * DPR;
        const a = Math.max(0, 1 - p.life / p.max) * 0.5;
        if (p.life >= p.max || p.y < -20) {
          parts.splice(i, 1);
          continue;
        }
        ictx.globalAlpha = a;
        ictx.fillStyle = p.c;
        ictx.beginPath();
        ictx.arc(p.x, p.y, p.r, 0, 6.283);
        ictx.fill();
      }
      ictx.globalAlpha = 1;
      if (parts.length < CAP) ispawn(2);
    };
    if (cv && !reduce) {
      iresize();
      ispawn(40);
      itick();
      window.addEventListener("resize", iresize, { passive: true });
    }

    const finish = () => {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      setOut(true);
      // center flourish on the main ember canvas
      try {
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight * 0.46;
        burst(cx, cy, "#FFD166");
        burst(cx - 60, cy, "#00F0FF");
        burst(cx + 60, cy, "#D11EFF");
      } catch { /* silent */ }
      const cleanup = () => {
        irunning = false;
        if (iraf) cancelAnimationFrame(iraf);
        setShow(false);
        onDone && onDone();
      };
      later(cleanup, reduce ? 240 : 820);
    };

    later(finish, T.finish);
    // safety net — never let the overlay linger and block the page
    const safety = setTimeout(() => {
      irunning = false;
      if (iraf) cancelAnimationFrame(iraf);
      setShow(false);
      onDone && onDone();
    }, T.finish + 3500);

    // expose skip via a handler wired on the button below
    root.__introFinish = finish;

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(safety);
      irunning = false;
      if (iraf) cancelAnimationFrame(iraf);
      window.removeEventListener("resize", iresize);
      parts = [];
    };
  }, [show, burst, onDone]);

  if (!show) return null;

  const handleSkip = () => {
    const fn = rootRef.current && rootRef.current.__introFinish;
    if (fn) fn();
  };

  return createPortal(
    <div
      ref={rootRef}
      className={`arena-intro${out ? " is-out" : ""}`}
      role="dialog"
      aria-label="The Zone Squad Arena intro"
      onKeyDown={(e) => {
        if (e.key === "Escape") handleSkip();
      }}
    >
      <canvas ref={emberRef} className="arena-intro__embers" aria-hidden="true" />
      <div className="arena-intro__flash" aria-hidden="true" />
      <div className="arena-intro__shake">
        <div className="arena-intro__stage">
          <div className="arena-intro__kicker">
            Accountability <span className="arena-intro__dot">·</span> Reforged
          </div>
          <div className="arena-intro__wordwrap">
            <span className="arena-intro__scan" aria-hidden="true" />
            <span className="arena-intro__zone" aria-label="The Zone">
              {"THE ZONE".split("").map((ch, i) =>
                ch === " " ? (
                  <span key={i}>&nbsp;</span>
                ) : (
                  <span
                    key={i}
                    className="arena-intro__ch"
                    style={{ animationDelay: `${220 + i * 70}ms` }}
                  >
                    {ch}
                  </span>
                )
              )}
            </span>
            <span className="arena-intro__arena">SQUAD ARENA</span>
          </div>
          <div className="arena-intro__tag">
            Where <b>fire</b> meets the <b>fight</b>
          </div>
        </div>
      </div>
      <button type="button" className="arena-intro__skip" onClick={handleSkip}>
        Skip ⏭
      </button>
    </div>,
    document.body
  );
}

// ============================================================
//  <ArenaSoundToggle/> — persisted mute button (place in Arena chrome)
// ============================================================
export function ArenaSoundToggle({ className = "" }) {
  const { muted, toggle } = useSfxMute();
  return (
    <button
      type="button"
      className={`arena-sound${muted ? " is-muted" : ""} ${className}`.trim()}
      onClick={() => {
        toggle();
        if (muted) {
          // we just unmuted → confirm with a pop
          try {
            sfxPop();
          } catch { /* silent */ }
        }
      }}
      aria-pressed={!muted}
      aria-label={muted ? "Unmute arena sound" : "Mute arena sound"}
      title={muted ? "Sound off" : "Sound on"}
    >
      <svg viewBox="0 0 24 24" className="arena-sound__glyph" aria-hidden="true">
        <path
          d="M4 9v6h4l5 4V5L8 9H4z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {muted ? (
          <path d="M17 9l4 6M21 9l-4 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        ) : (
          <path
            d="M16.5 8.5a5 5 0 0 1 0 7M18.8 6.2a8 8 0 0 1 0 11.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        )}
      </svg>
    </button>
  );
}

export { useSfxMute };

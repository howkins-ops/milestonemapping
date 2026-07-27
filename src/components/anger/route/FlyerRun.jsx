import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import createDoorFX from "../door/DoorFX.js";
import {
  createRide, stepRide, throwHanger, ghost, hangersNow, drain, rideResult,
} from "./skRideSim.js";
import { drawRide, makeView } from "./skDraw.js";
import {
  SEGWAY, HANGER, STREET_LENGTH_M, RIDER_SCREEN_Y, PERF,
} from "./skTuning.js";
import {
  sfxSegwayWhine, sfxRockThrow, sfxMagnetClack, sfxShatter, sfxHorn,
  sfxImpact, sfxCoin, sfxWhoosh, sfxJumpWhoosh, sfxLandThud, sfxStarEarn,
  sfxRainLoop, sfxPop,
} from "../../../lib/sfx.js";
/* The shell that used to own this stylesheet was deleted in the merge, so the
   scene owns it now — it is the only consumer left. */
import { recordVandalism } from "../heat/heatStore.js";
import "../../../styles/route-ride.css";

/* ════════════════════════════════════════════════════════════════════════
   THE FLYER RUN — the segway half of The Door.

   ── PERFORMANCE LAW ──────────────────────────────────────────────────────
   React does not re-render during the run. The sim writes to refs, one rAF
   draws the canvas, and setState fires ONLY when a discrete, DOM-visible
   thing actually changes — ammo, lives, score, speed tier. A run is a
   handful of renders, not five thousand.

   ── TWO CANVASES, ONE CAMERA ─────────────────────────────────────────────
   DoorFX clears its own canvas every frame and owns its own rAF, so it can
   never share this one. It sits STACKED above the world canvas inside the
   same camera div, and its shake/zoom/flash write CSS custom properties onto
   that div — which shakes both canvases together, for free, with no work in
   the world loop at all.

   ── THE CONTROLS ─────────────────────────────────────────────────────────
   Two thumbs, both at the bottom. This deliberately breaks the older
   one-thumb rule, which simply cannot express steer + throttle + throw-
   either-side. Left half is an invisible relative stick: x steers, y is the
   throttle. Right half is two throw pads.

   HOLD TO AIM, RELEASE TO THROW. A quick tap throws immediately; hold past
   120ms and the predicted-landing ghost fades in and tracks you until you let
   go. The ghost calls the same resolver the throw does, so it cannot lie, and
   it is opt-in — experts tap, learners hold and watch. It is also the
   difficulty dial: street 3 turns it off.
   ════════════════════════════════════════════════════════════════════════ */

const GHOST_DELAY_MS = 120;
const GHOST_FADE_MS = 180;

export default function FlyerRun({ street, seed, aimGhost = true, rain = false, onFinish, onQuit }) {
  const wrapRef = useRef(null);
  const camRef = useRef(null);
  const worldRef = useRef(null);
  const fxCanvasRef = useRef(null);

  const simRef = useRef(null);
  const fxRef = useRef(null);
  const rafRef = useRef(0);
  const viewRef = useRef(null);
  const lastRef = useRef(0);
  const whineRef = useRef(null);
  const rainRef = useRef(null);
  const doneRef = useRef(false);
  const finishTimer = useRef(0);

  /* input lives entirely in a ref — a thumb must never cause a React render */
  const inRef = useRef({
    stickId: null, stickOx: 0, stickOy: 0, steer: 0, throttle: 0,
    padL: null, padR: null, padLAt: 0, padRAt: 0, ghostL: 0, ghostR: 0,
  });

  const [hud, setHud] = useState({ ammo: HANGER.ammo, lives: 3, score: 0, combo: 0, tier: 1, cart: false });
  const hudRef = useRef(hud);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(0);

  /* The seven-day week is gone — this is one run down one street, so the
     ride no longer reads a day config or a street tier. What used to be
     STREETS[n].aimGhost is now a prop, because the thing that should switch
     the predicted-landing marker off is progress through The Door's ladder,
     not a difficulty tier that no longer exists. */
  const aimGhostOn = aimGhost;

  /* ── boot ──────────────────────────────────────────────────────────────*/
  useLayoutEffect(() => {
    const s = createRide({
      street,
      seed,
    });
    simRef.current = s;

    const world = worldRef.current;
    const fx = createDoorFX({
      canvas: fxCanvasRef.current,
      scene: wrapRef.current,
      camera: camRef.current,
    });
    fxRef.current = fx;

    const resize = () => {
      const el = wrapRef.current;
      if (!el || !world) return;
      const w = el.clientWidth, h = el.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      world.width = Math.round(w * dpr);
      world.height = Math.round(h * dpr);
      world.style.width = `${w}px`;
      world.style.height = `${h}px`;
      const ctx = world.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      viewRef.current = makeView({ w, h, camY: s.y, dpr });
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (wrapRef.current) ro.observe(wrapRef.current);

    whineRef.current = sfxSegwayWhine();
    if (rain) rainRef.current = sfxRainLoop();

    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      window.clearTimeout(finishTimer.current);
      finishTimer.current = 0;
      if (whineRef.current) whineRef.current.stop();
      if (rainRef.current) rainRef.current.stop();
      fx.destroy();
      fxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── the loop ──────────────────────────────────────────────────────────*/
  useEffect(() => {
    let slow = 0;
    const frame = (t) => {
      rafRef.current = requestAnimationFrame(frame);
      const s = simRef.current;
      const v = viewRef.current;
      const world = worldRef.current;
      if (!s || !v || !world) return;

      const t0 = performance.now();
      const dt = lastRef.current ? Math.min(0.05, (t - lastRef.current) / 1000) : 1 / 60;
      lastRef.current = t;

      const inp = inRef.current;
      const consumed = { throwL: inp.fireL, throwR: inp.fireR };
      inp.fireL = false;
      inp.fireR = false;

      stepRide(s, dt, { steer: inp.steer, throttle: inp.throttle, ...consumed });
      handleEvents(s, drain(s));

      /* the camera follows without easing — a lagging camera in a game whose
         whole skill is release timing would be lying about where you are */
      v.camY = s.y;

      /* ghost hold timers */
      const now = performance.now();
      inp.ghostL = aimGhostOn && inp.padL != null && now - inp.padLAt > GHOST_DELAY_MS
        ? Math.min(1, (now - inp.padLAt - GHOST_DELAY_MS) / GHOST_FADE_MS) : 0;
      inp.ghostR = aimGhostOn && inp.padR != null && now - inp.padRAt > GHOST_DELAY_MS
        ? Math.min(1, (now - inp.padRAt - GHOST_DELAY_MS) / GHOST_FADE_MS) : 0;

      const ctx = world.getContext("2d");
      drawRide(ctx, s, v, {
        hangers: hangersNow(s),
        ghostL: inp.ghostL > 0 ? ghost(s, "L") : null,
        ghostR: inp.ghostR > 0 ? ghost(s, "R") : null,
        ghostAlphaL: inp.ghostL,
        ghostAlphaR: inp.ghostR,
        rain: !!rain,
        t: t / 1000,
        sky: "morning",
      });

      if (whineRef.current) whineRef.current.setSpeed(s.v / SEGWAY.maxSpeed);

      /* HUD: setState only on an actual change. */
      const tier = s.v < 6.5 ? 0 : s.v < 11 ? 1 : 2;
      const next = { ammo: s.ammo, lives: s.lives, score: s.score, combo: s.combo, tier, cart: !!s.cart };
      const prev = hudRef.current;
      if (next.ammo !== prev.ammo || next.lives !== prev.lives || next.score !== prev.score
        || next.combo !== prev.combo || next.tier !== prev.tier || next.cart !== prev.cart) {
        hudRef.current = next;
        setHud(next);
      }

      /* Progress rides a CSS var, never React — but it must be written on the
         WRAPPER, not on `.rr-cam`. The HUD is a SIBLING of the camera div, so
         a variable set on the camera never cascades into the progress bar and
         the bar sat empty for the whole run. Custom properties inherit down,
         never sideways. */
      if (wrapRef.current) {
        wrapRef.current.style.setProperty("--rr-prog", (s.y / STREET_LENGTH_M).toFixed(4));
        wrapRef.current.style.setProperty("--rr-speed", (s.v / SEGWAY.maxSpeed).toFixed(3));
      }

      if (s.finished && !doneRef.current) {
        doneRef.current = true;
        if (whineRef.current) whineRef.current.stop();
        const res = rideResult(s);
        /* Held in a ref and cleared on unmount. Quitting inside this 700ms
           beat used to hand a finished run to a dead parent. */
        finishTimer.current = window.setTimeout(() => {
          finishTimer.current = 0;
          if (onFinish) onFinish(res);
        }, 700);
      }

      /* the world canvas is a cost DoorFX cannot see — watch our own budget */
      const ms = performance.now() - t0;
      if (ms > PERF.drawBudgetMs) slow++; else slow = Math.max(0, slow - 1);
      if (slow === 40 && typeof console !== "undefined") {
        console.warn(`[THE ROUTE] world draw over budget (${ms.toFixed(1)}ms > ${PERF.drawBudgetMs}ms)`);
      }
    };
    rafRef.current = requestAnimationFrame(frame);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); rafRef.current = 0; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aimGhostOn]);

  /* ── events → juice ────────────────────────────────────────────────────*/
  function handleEvents(s, events) {
    const fx = fxRef.current;
    const v = viewRef.current;
    if (!events.length) return;
    for (const e of events) {
      /* Particles are emitted in SCREEN space, so every event position goes
         through the same projector the world is drawn with — including its
         height, or a window smash would spray glass at ground level. */
      const pt = v ? v.P(e.x != null ? e.x : s.x, e.y != null ? e.y : s.y, e.z || 0) : { x: 0, y: 0 };
      const px = pt.x, py = pt.y;
      switch (e.type) {
        case "throw":
          sfxRockThrow();
          break;
        case "hook":
          /* THE CLACK. A hard contact plus a 50ms hit-stop is what turns a
             score event into the thing people replay the game for. */
          sfxMagnetClack(2);
          if (fx) { fx.hitStop(50); fx.shake(0.2); fx.emit("star", px, py, { count: 8, power: 1.1 }); }
          break;
        case "nearmiss":
          sfxPop();
          if (fx) fx.emit("dust", px, py, { count: 6 });
          break;
        case "mailbox":
          sfxCoin();
          if (fx) fx.emit("dust", px, py, { count: 4 });
          break;
        case "smash":
          sfxShatter();
          if (fx) { fx.hitStop(40); fx.shake(0.35); fx.emit("glass", px, py, { count: 16, power: 1.3 }); }
          /* Into The Door's OWN meter, not a private one. Broken glass at
             dawn is the same Heat that gets you spotted in the bushes at
             11:47pm — the sim stays pure and the scene does the writing. */
          recordVandalism("windowBroken");
          break;
        case "land":
          if (e.key === "lawn") sfxWhoosh();
          break;
        case "pickup":
          sfxCoin();
          if (fx) fx.emit("star", px, py, { count: 5 });
          break;
        case "ramp":
          sfxJumpWhoosh();
          if (fx) fx.emit("dust", px, py, { count: 10 });
          break;
        case "clip":
          sfxImpact(1);
          if (fx) fx.shake(0.12);
          break;
        case "crash":
          sfxImpact(3);
          sfxLandThud(0.8);
          if (fx) { fx.hitStop(90); fx.shake(0.5); fx.flash("#FF3B5C", 140, { alpha: 0.4 }); fx.emit("debris", px, py, { count: 14 }); }
          break;
        case "cart":
          if (e.spawned) sfxHorn(1);
          if (e.hit) sfxHorn(2);
          break;
        case "ruts":
          break;
        case "score":
          if (e.pts >= 500) sfxStarEarn();
          showToast(`${e.label}  +${e.pts}${e.combo > 1 ? `  ×${e.combo}` : ""}`, e.pts >= 500 ? "big" : e.pts > 0 ? "ok" : "bad");
          break;
        case "finish":
          break;
        default:
          break;
      }
    }
  }

  function showToast(text, kind) {
    setToast({ text, kind, id: Math.random() });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1100);
  }

  /* ── input ─────────────────────────────────────────────────────────────
     `setPointerCapture` on every surface, and NEVER onPointerLeave — a thumb
     drifting two pixels off a control must not drop the input. That exact
     bug is still live in The Route's walk button today. */
  const capture = (e) => {
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* old webview */ }
  };

  /* FIRST FINGER WINS. A second touch landing on the ride pad used to
     overwrite `stickId`, so when THAT finger lifted first the stick was
     released while the original thumb was still down — steering just died
     mid-corner and looked like an input bug. A pad already owned by a live
     pointer ignores new ones. */
  const stickDown = (e) => {
    e.preventDefault();
    const i = inRef.current;
    if (i.stickId !== null) return;
    capture(e);
    i.stickId = e.pointerId;
    i.stickOx = e.clientX;
    i.stickOy = e.clientY;
  };
  const stickMove = (e) => {
    const i = inRef.current;
    if (i.stickId !== e.pointerId) return;
    const dx = e.clientX - i.stickOx;
    const dy = e.clientY - i.stickOy;
    const DEAD = 6, RANGE = 62;
    i.steer = Math.max(-1, Math.min(1, (Math.abs(dx) < DEAD ? 0 : dx - Math.sign(dx) * DEAD) / RANGE));
    i.throttle = Math.max(-1, Math.min(1, -(Math.abs(dy) < DEAD ? 0 : dy - Math.sign(dy) * DEAD) / RANGE));
  };
  const stickUp = (e) => {
    const i = inRef.current;
    if (i.stickId !== e.pointerId) return;
    i.stickId = null;
    i.steer = 0;
    i.throttle = 0;
  };

  const padDown = (side) => (e) => {
    e.preventDefault();
    const i = inRef.current;
    if ((side === "L" ? i.padL : i.padR) !== null) return; // first finger wins
    capture(e);
    if (side === "L") { i.padL = e.pointerId; i.padLAt = performance.now(); }
    else { i.padR = e.pointerId; i.padRAt = performance.now(); }
  };
  const padUp = (side) => (e) => {
    const i = inRef.current;
    const held = side === "L" ? i.padL : i.padR;
    if (held !== e.pointerId) return;
    if (side === "L") { i.padL = null; i.fireL = true; i.ghostL = 0; }
    else { i.padR = null; i.fireR = true; i.ghostR = 0; }
  };

  /* ── keyboard, for desk testing and accessibility ──────────────────────
     CAPTURE PHASE, and it swallows what it uses. The app has global
     single-key shortcuts, and without this an arrow key mid-ride opened THE
     IRON on top of the run — the game handled the key AND so did the app.
     A control surface that owns a key has to consume it. */
  useEffect(() => {
    const KEYS = new Set([
      "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown",
      "a", "d", "w", "s", "q", "z", "e", "x",
    ]);
    const set = (k, on) => {
      const i = inRef.current;
      if (k === "ArrowLeft" || k === "a") i.steer = on ? -1 : 0;
      if (k === "ArrowRight" || k === "d") i.steer = on ? 1 : 0;
      if (k === "ArrowUp" || k === "w") i.throttle = on ? 1 : 0;
      if (k === "ArrowDown" || k === "s") i.throttle = on ? -1 : 0;
      if (on && (k === "q" || k === "z")) i.fireL = true;
      if (on && (k === "e" || k === "x")) i.fireR = true;
    };
    const handle = (on) => (e) => {
      if (!KEYS.has(e.key)) return;
      /* …unless the player is typing somewhere, which they never are here,
         but the guard costs nothing and the day someone adds a name field
         to this screen it will already be right. */
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      e.preventDefault();
      e.stopPropagation();
      set(e.key, on);
    };
    const dn = handle(true);
    const up = handle(false);
    window.addEventListener("keydown", dn, true);
    window.addEventListener("keyup", up, true);
    return () => {
      window.removeEventListener("keydown", dn, true);
      window.removeEventListener("keyup", up, true);
    };
  }, []);

  const speedLabel = ["CRAWL", "CRUISE", "FLAT OUT"][hud.tier];

  return (
    <div className="rr-ride" ref={wrapRef}>
      <div className="rr-cam" ref={camRef}>
        <canvas className="rr-canvas rr-canvas--world" ref={worldRef} />
        <canvas className="rr-canvas rr-canvas--fx" ref={fxCanvasRef} />
      </div>

      {/* ── HUD. DOM, never drawn into the world canvas — text in a scaled
          canvas is the fastest way to make a game look cheap. ─────────── */}
      <div className="rr-hud">
        <div className="rr-hud__top">
          <button type="button" className="rr-quit" onClick={onQuit} aria-label="Quit the run">✕</button>
          <div className="rr-hud__score">{hud.score.toLocaleString()}</div>
          <div className="rr-hud__lives" aria-label={`${hud.lives} lives`}>
            {[0, 1, 2].map((i) => <span key={i} className={`rr-life ${i < hud.lives ? "is-on" : ""}`} />)}
          </div>
        </div>

        <div className="rr-hud__bag">
          <span className="rr-bag__n">{hud.ammo}</span>
          <span className="rr-bag__label">HANGERS</span>
          {hud.combo > 1 && <span className="rr-combo">×{hud.combo}</span>}
        </div>

        <div className="rr-progress"><div className="rr-progress__fill" /></div>
        <div className={`rr-speed rr-speed--${hud.tier}`}>{speedLabel}</div>
        {hud.cart && <div className="rr-warn">HOA — MOVE</div>}

        {toast && (
          <div key={toast.id} className={`rr-toast rr-toast--${toast.kind}`}>{toast.text}</div>
        )}
      </div>

      {/* ── controls ───────────────────────────────────────────────────── */}
      <div
        className="rr-pad rr-pad--ride"
        onPointerDown={stickDown}
        onPointerMove={stickMove}
        onPointerUp={stickUp}
        onPointerCancel={stickUp}
        onContextMenu={(e) => e.preventDefault()}
        aria-label="Ride — drag to steer and to control speed"
      >
        <span className="rr-pad__hint">STEER · SPEED</span>
      </div>
      <div className="rr-throws">
        <button
          type="button"
          className="rr-throw rr-throw--l"
          onPointerDown={padDown("L")}
          onPointerUp={padUp("L")}
          onPointerCancel={padUp("L")}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Throw left"
        >◀</button>
        <button
          type="button"
          className="rr-throw rr-throw--r"
          onPointerDown={padDown("R")}
          onPointerUp={padUp("R")}
          onPointerCancel={padUp("R")}
          onContextMenu={(e) => e.preventDefault()}
          aria-label="Throw right"
        >▶</button>
      </div>
    </div>
  );
}

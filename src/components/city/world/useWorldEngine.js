import { useEffect, useMemo, useRef, useState } from "react";
import { CAMERA } from "./worldFxTuning.js";

// ════════════════════════════════════════════════════════════════════════
// MAPQUEST WORLD — the walk engine
// One rAF loop drives the character and camera by writing translate3d
// straight to DOM refs — React state is only touched when something the
// UI cares about changes (near target, walking, facing). The loop runs
// only while there is input, and stops when idle or the tab is hidden.
// No physics: position is a clamped x, doors are hit ranges around a
// target x. Width is read from the viewport node (never the window) so
// the engine behaves inside the embedded Zone mount.
// ════════════════════════════════════════════════════════════════════════

const EDGE_PAD = 26; // px the character can approach the world edge
const DT_CAP = 32; // ms — tab-switch protection

// Jump arc (px, seconds). Apex ≈ JUMP_V²/2G ≈ 113px — clears a street clown
// (~70px) with room to stomp it on the way down.
const GRAVITY = 1700;
const JUMP_V = 620;
const BOUNCE_V = 430; // stomp rebound — enough to chain onto the next clown

export default function useWorldEngine({
  worldWidth,
  spawnX = 200,
  targets = [],
  parallax = { far: 0.18, mid: 0.45 },
  speed = 340,
  paused = false,
  reducedMotion = false,
  onReachEdge,
  onAirFrame, // (y, vy) each airborne frame — stomp collision hook
  onStride, // (dxAbs) px actually walked this frame — encounter-engine hook
  onJump, // () — takeoff (jump only, not stomp bounces) — juice hook
  onLand, // (impactVy, { fromBounce }) — touchdown — juice hook
}) {
  const viewportRef = useRef(null);
  const layerRef = useRef(null);
  const farRef = useRef(null);
  const midRef = useRef(null);
  const nearRef = useRef(null); // near foreground plane (parallax 1.22)
  const charRef = useRef(null);

  const [nearTarget, setNearTarget] = useState(null);
  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState(1);
  const [heldDir, setHeldDir] = useState(0); // for control button styling only
  const [airborne, setAirborne] = useState(false);

  // Everything the loop touches lives in refs so the loop never re-binds.
  const sim = useRef({
    x: spawnX,
    y: 0, // height above the street (px, up-positive)
    vy: 0,
    airborne: false,
    dir: 0,
    facing: 1,
    raf: 0,
    last: 0,
    viewportW: 360,
    edgeFired: null, // 'left' | 'right' | null — fire once per contact
    freezeUntil: 0, // hit-stop: sim clock zeroed until this timestamp
    airSource: null, // 'jump' | 'bounce' — how the current air began
    // ── Camera II (all sim vars — the camera is a cameraman now) ─────────
    cam: 0, // current camera x (its own sim var, eased toward target)
    camInit: false, // snapped to the spawn framing yet?
    anchor: 0.45, // look-ahead fraction, eases on turn (0.40 fwd / 0.50 back)
    shakeAmp: 0,
    shakeMs: 1,
    shakeUntil: 0,
    zoom: 1,
    zoomTarget: 1,
    pan: null, // { x, ms, hold, holdUntil, resolve } — cinematic override
  });

  const cfg = useRef({});
  cfg.current = {
    worldWidth,
    targets,
    parallax,
    speed,
    paused,
    onReachEdge,
    onAirFrame,
    onStride,
    onJump,
    onLand,
    nearTargetId: nearTarget ? nearTarget.id : null,
  };

  const minX = EDGE_PAD;
  const maxX = Math.max(EDGE_PAD, worldWidth - EDGE_PAD);

  // ── Camera helpers (Camera II) ──────────────────────────────────────────
  const clampCam = (v) => {
    const s = sim.current;
    const c = cfg.current;
    return Math.max(0, Math.min(v, c.worldWidth - s.viewportW));
  };

  // Where the camera wants to be right now (input-follow or cinematic pan).
  const camGoal = () => {
    const s = sim.current;
    if (s.pan) return s.pan.x;
    return clampCam(s.x - s.viewportW * s.anchor);
  };

  // Snap the camera to its goal — mount, resize, jumpTo (no drift pans).
  const snapCam = () => {
    const s = sim.current;
    s.anchor = s.facing === 1 ? CAMERA.lookAhead : CAMERA.lookBehind;
    s.cam = camGoal();
    s.camInit = true;
  };

  // ── Painting ────────────────────────────────────────────────────────────
  // Camera writes are rounded to 0.5px (jitter law) and carry the shake
  // offsets + zoom on the same transform string — no extra properties.
  const r2 = (v) => Math.round(v * 2) / 2;

  const paint = (now = 0) => {
    const s = sim.current;
    const c = cfg.current;
    if (!s.camInit) snapCam();
    const cameraX = s.cam;
    // decaying shake offsets — deterministic waveform, no RNG
    let offX = 0;
    let offY = 0;
    if (now && now < s.shakeUntil) {
      const t = (s.shakeUntil - now) / s.shakeMs; // 1 → 0
      offX = Math.sin(now * 0.09) * s.shakeAmp * t;
      offY = Math.cos(now * 0.13) * s.shakeAmp * t * 0.6;
    }
    const z = s.zoom;
    const zs = z === 1 ? "" : ` scale(${z})`;
    if (layerRef.current)
      layerRef.current.style.transform = `translate3d(${r2(-cameraX + offX)}px,${r2(offY)}px,0)${zs}`;
    if (farRef.current)
      farRef.current.style.transform = `translate3d(${r2(-cameraX * c.parallax.far + offX * 0.4)}px,${r2(offY * 0.4)}px,0)${zs}`;
    if (midRef.current)
      midRef.current.style.transform = `translate3d(${r2(-cameraX * c.parallax.mid + offX * 0.7)}px,${r2(offY * 0.7)}px,0)${zs}`;
    if (nearRef.current)
      nearRef.current.style.transform = `translate3d(${r2(-cameraX * (c.parallax.near || 1.22) + offX * 1.15)}px,${r2(offY)}px,0)${zs}`;
    if (charRef.current)
      charRef.current.style.transform = `translate3d(${s.x}px,${-s.y}px,0)`;
  };

  // ── Proximity → nearTarget (state, but only on change) ─────────────────
  const checkProximity = () => {
    const s = sim.current;
    const c = cfg.current;
    let best = null;
    let bestDist = Infinity;
    for (const t of c.targets) {
      if (!t || t.disabled) continue;
      const d = Math.abs(s.x - t.x);
      if (d <= (t.range || 55) && d < bestDist) {
        best = t;
        bestDist = d;
      }
    }
    const bestId = best ? best.id : null;
    if (bestId !== c.nearTargetId) setNearTarget(best);
  };

  // ── Edge contact (fires once per touch) ─────────────────────────────────
  const checkEdges = () => {
    const s = sim.current;
    const c = cfg.current;
    const side = s.x <= minX + 1 ? "left" : s.x >= maxX - 1 ? "right" : null;
    if (side && s.edgeFired !== side) {
      s.edgeFired = side;
      if (c.onReachEdge) c.onReachEdge(side);
    } else if (!side) {
      s.edgeFired = null;
    }
  };

  // ── The loop ────────────────────────────────────────────────────────────
  const stopLoop = () => {
    const s = sim.current;
    if (s.raf) {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
    }
  };

  const frame = (now) => {
    const s = sim.current;
    const c = cfg.current;
    s.raf = 0;
    // hit-stop: the clock freezes but the loop keeps scheduling (fx.hitstop)
    const frozen = now < s.freezeUntil;
    const dt = frozen ? 0 : Math.min(now - (s.last || now), DT_CAP) / 1000;
    s.last = now;

    if ((s.dir !== 0 || s.airborne) && !c.paused) {
      if (s.dir !== 0) {
        const prevX = s.x;
        s.x = Math.max(minX, Math.min(maxX, s.x + s.dir * c.speed * dt));
        if (c.onStride && s.x !== prevX) c.onStride(Math.abs(s.x - prevX));
      }
      if (s.airborne) {
        s.vy -= GRAVITY * dt;
        s.y = Math.max(0, s.y + s.vy * dt);
        if (s.y === 0 && s.vy < 0) {
          const impact = -s.vy; // px/s at contact — scales the landing juice
          const fromBounce = s.airSource === "bounce";
          s.vy = 0;
          s.airborne = false;
          s.airSource = null;
          setAirborne(false);
          if (c.onLand) c.onLand(impact, { fromBounce });
        }
      }
      paint();
      checkProximity();
      checkEdges();
      if (s.airborne && c.onAirFrame) c.onAirFrame(s.y, s.vy);
    }

    if ((s.dir !== 0 || s.airborne) && !c.paused && !document.hidden) {
      s.raf = requestAnimationFrame(frame);
    } else {
      s.last = 0;
    }
  };

  const ensureLoop = () => {
    const s = sim.current;
    if (
      !s.raf &&
      (s.dir !== 0 || s.airborne) &&
      !cfg.current.paused &&
      !document.hidden
    ) {
      s.last = 0;
      s.raf = requestAnimationFrame(frame);
    }
  };

  // ── Controls ────────────────────────────────────────────────────────────
  const press = (dir) => {
    const s = sim.current;
    if (cfg.current.paused) return;
    if (s.dir === dir) return;
    s.dir = dir;
    if (dir !== 0) {
      if (s.facing !== dir) {
        s.facing = dir;
        setFacing(dir);
      }
      setWalking(true);
      setHeldDir(dir);
      ensureLoop();
    }
  };

  const release = () => {
    const s = sim.current;
    if (s.dir === 0) return;
    s.dir = 0;
    setWalking(false);
    setHeldDir(0);
  };

  // A real hop — up, gravity, land. One at a time; no double jump.
  const jump = () => {
    const s = sim.current;
    if (cfg.current.paused || s.airborne) return;
    s.airborne = true;
    s.airSource = "jump";
    s.vy = JUMP_V;
    setAirborne(true);
    if (cfg.current.onJump) cfg.current.onJump();
    ensureLoop();
  };

  // Stomp rebound — called by the scene when the player squashes an enemy.
  const bounce = () => {
    const s = sim.current;
    if (cfg.current.paused) return;
    s.airborne = true;
    s.airSource = "bounce";
    s.vy = BOUNCE_V;
    setAirborne(true);
    ensureLoop();
  };

  // Hit-stop (fx.hitstop) — zero the sim clock for a beat; weight, no jank.
  const freeze = (ms = 60) => {
    const s = sim.current;
    s.freezeUntil = performance.now() + Math.max(0, Number(ms) || 0);
  };

  const jumpTo = (x) => {
    const s = sim.current;
    s.x = Math.max(minX, Math.min(maxX, Number(x) || 0));
    paint();
    checkProximity();
    checkEdges();
  };

  const getX = () => sim.current.x;

  // ── Mount: measure, spawn, listeners ────────────────────────────────────
  useEffect(() => {
    const s = sim.current;
    s.x = Math.max(minX, Math.min(maxX, spawnX));

    const measure = () => {
      if (viewportRef.current) {
        s.viewportW = viewportRef.current.clientWidth || 360;
      }
      paint();
    };
    measure();

    let ro = null;
    if (typeof ResizeObserver !== "undefined" && viewportRef.current) {
      ro = new ResizeObserver(measure);
      ro.observe(viewportRef.current);
    } else {
      window.addEventListener("resize", measure);
    }

    checkProximity();

    const isTyping = (el) =>
      el &&
      (el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.isContentEditable);

    const onKeyDown = (e) => {
      if (cfg.current.paused || isTyping(e.target)) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        press(-1);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        press(1);
      } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        jump();
      }
    };

    const onKeyUp = (e) => {
      if (
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "a" ||
        e.key === "A" ||
        e.key === "d" ||
        e.key === "D"
      ) {
        release();
      }
    };

    const onVisibility = () => {
      if (document.hidden) stopLoop();
      else ensureLoop();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stopLoop();
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", measure);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worldWidth]);

  // Pause releases held input; unpause resumes cleanly (incl. mid-jump).
  useEffect(() => {
    if (paused) release();
    else ensureLoop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  // Targets can change (glow/lock states) — re-check without moving.
  useEffect(() => {
    checkProximity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets]);

  const controls = useMemo(
    () => ({ press, release, jumpTo, jump, bounce, freeze }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    viewportRef,
    layerRef,
    farRef,
    midRef,
    charRef,
    nearTarget,
    walking,
    facing,
    heldDir,
    airborne,
    controls,
    getX,
    reducedMotion,
  };
}

import { useEffect, useMemo, useRef, useState } from "react";

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

export default function useWorldEngine({
  worldWidth,
  spawnX = 200,
  targets = [],
  parallax = { far: 0.18, mid: 0.45 },
  speed = 340,
  paused = false,
  reducedMotion = false,
  onReachEdge,
}) {
  const viewportRef = useRef(null);
  const layerRef = useRef(null);
  const farRef = useRef(null);
  const midRef = useRef(null);
  const charRef = useRef(null);

  const [nearTarget, setNearTarget] = useState(null);
  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState(1);
  const [heldDir, setHeldDir] = useState(0); // for control button styling only

  // Everything the loop touches lives in refs so the loop never re-binds.
  const sim = useRef({
    x: spawnX,
    dir: 0,
    facing: 1,
    raf: 0,
    last: 0,
    viewportW: 360,
    edgeFired: null, // 'left' | 'right' | null — fire once per contact
  });

  const cfg = useRef({});
  cfg.current = {
    worldWidth,
    targets,
    parallax,
    speed,
    paused,
    onReachEdge,
    nearTargetId: nearTarget ? nearTarget.id : null,
  };

  const minX = EDGE_PAD;
  const maxX = Math.max(EDGE_PAD, worldWidth - EDGE_PAD);

  // ── Painting ────────────────────────────────────────────────────────────
  const paint = () => {
    const s = sim.current;
    const c = cfg.current;
    const cameraX = Math.max(
      0,
      Math.min(s.x - s.viewportW * 0.45, c.worldWidth - s.viewportW)
    );
    if (layerRef.current)
      layerRef.current.style.transform = `translate3d(${-cameraX}px,0,0)`;
    if (farRef.current)
      farRef.current.style.transform = `translate3d(${-cameraX * c.parallax.far}px,0,0)`;
    if (midRef.current)
      midRef.current.style.transform = `translate3d(${-cameraX * c.parallax.mid}px,0,0)`;
    if (charRef.current)
      charRef.current.style.transform = `translate3d(${s.x}px,0,0)`;
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
    const dt = Math.min(now - (s.last || now), DT_CAP) / 1000;
    s.last = now;

    if (s.dir !== 0 && !c.paused) {
      s.x = Math.max(minX, Math.min(maxX, s.x + s.dir * c.speed * dt));
      paint();
      checkProximity();
      checkEdges();
    }

    if (s.dir !== 0 && !c.paused && !document.hidden) {
      s.raf = requestAnimationFrame(frame);
    } else {
      s.last = 0;
    }
  };

  const ensureLoop = () => {
    const s = sim.current;
    if (!s.raf && s.dir !== 0 && !cfg.current.paused && !document.hidden) {
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

  // Pause releases held input; unpause resumes cleanly.
  useEffect(() => {
    if (paused) release();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  // Targets can change (glow/lock states) — re-check without moving.
  useEffect(() => {
    checkProximity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets]);

  const controls = useMemo(
    () => ({ press, release, jumpTo }),
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
    controls,
    getX,
    reducedMotion,
  };
}

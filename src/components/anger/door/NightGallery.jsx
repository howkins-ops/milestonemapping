import React, { useCallback, useEffect, useRef, useState } from "react";
import { SteeleHouse, TargetArt } from "./NightArt.jsx";
import { GameIcon } from "./GameIcons.jsx";
import {
  STEP_S, GRAVITY, FLIGHT_S, EGG_R, solveLob, MIN_HIT, SNAP_PX,
  COMBO_STEPS, COMBO_MULTS, RELOAD_MS, EXPOSED_MS, SPOT_DWELL_MS, THREATS,
} from "./galleryTuning.js";
import {
  sfxWhoosh, sfxShatter, sfxImpact, sfxSplat, sfxWoodCrack, sfxBuzzer, playVoiceLine,
} from "../../../lib/sfx.js";
import { tapLight, tapMedium, buzzWarning } from "../../../lib/haptics.js";

/* ════════════════════════════════════════════════════════════════════════
   THE DEMONSTRATION — 11:47 PM, first person, from the bushes.

   He beat you at the door with a sentence. That sentence is now a meter on
   his house. You empty it by taking his property apart one lob at a time.

   THREE THINGS HERE ARE NOT OBVIOUS, and all three came out of measuring the
   engine rather than guessing at it:

   1 · THE ARC IS SOLVED, NOT AIMED. You tap a thing; the launch velocity that
       puts the parabola through it in FLIGHT_S is computed in closed form. In
       first person your thumb already sits on top of the target, so pulling
       back a slingshot thirty times in ninety seconds is a chore, not a game.

   2 · THE EGG IS DEAF TO EVERYTHING EXCEPT ITS TARGET. A lob launched from the
       bottom of the screen physically passes THROUGH the flamingos on its way
       to the porch light — and since hitboxes are inflated to thumb size, the
       near props form a wall. Measured: 10 of 13 shots hit the wrong thing.
       So the egg carries the target the tap chose and ignores all other rects
       until its flight time is spent. After that it's a real miss and anything
       can catch it.

   3 · WHERE IT HITS IS NOT WHERE IT SPLATS. The hitbox is 34px because thumbs
       are; a flamingo is 15px because flamingos are. Collision fires in that
       padding, so the raw impact point can sit in mid-air beside the bird. The
       splat is clamped into the drawn art before any particle is emitted.

   Stealth is INVERTED from the design doc — you are crouched by default and
   firing stands you up. Hold-to-crouch plus tap-to-fire needs two thumbs.
   ════════════════════════════════════════════════════════════════════════ */

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
const rand = (a, b) => a + Math.random() * (b - a);

/** Collision box: the drawn art, grown to something a thumb can actually hit. */
function hitBox(t, W, H) {
  const aw = t.w * W, ah = t.h * H;
  const w = Math.max(MIN_HIT, aw), h = Math.max(MIN_HIT, ah);
  return { x: t.x * W + aw / 2 - w / 2, y: t.y * H + ah / 2 - h / 2, w, h };
}
/** The drawn box — what the player sees, and where a splat is allowed to land. */
const artBox = (t, W, H) => ({ x: t.x * W, y: t.y * H, w: t.w * W, h: t.h * H });

export default function NightGallery({
  fx, fxReady, config, lines, onDamage, onDestroy, onCombo, onBusted, onDone,
}) {
  const cfg = config || {};
  const targets = cfg.targets || [];

  const [hp, setHp] = useState(() => Object.fromEntries(targets.map((t) => [t.key, t.hits || 1])));
  const [combo, setCombo] = useState(0);
  const [exposed, setExposed] = useState(false);
  const [threat, setThreat] = useState(null);      // { kind, phase: "warn"|"danger" }
  const [left, setLeft] = useState(cfg.seconds || 90);
  const [pop, setPop] = useState(null);            // floating damage number
  const [note, setNote] = useState(null);

  const sceneRef = useRef(null);
  const boxRef = useRef({ w: 0, h: 0 });
  const hpRef = useRef(hp);
  const comboRef = useRef(0);
  const exposedUntil = useRef(0);
  const inDangerSince = useRef(0);
  const lastShot = useRef(0);
  const doneRef = useRef(false);
  const deadline = useRef(0);
  const threatRef = useRef(null);
  const nextThreat = useRef({});
  const bankRef = useRef(0);                        // damage dealt, for the bust payload

  hpRef.current = hp;
  threatRef.current = threat;

  /* ── measure, then register one collision rect per target ───────────────
     Order matters: DoorFX takes the FIRST overlapping rect from an
     insertion-ordered Map, so targets go in before the ground catch-all.
     fx.reset() does not clear rects — only destroy() does — so we null our
     own on the way out, the way the rocks round does. */
  useEffect(() => {
    if (!fx || !sceneRef.current) return undefined;
    const measure = () => {
      const r = sceneRef.current.getBoundingClientRect();
      boxRef.current = { w: r.width, h: r.height };
      for (const t of targets) fx.setRect(`t:${t.key}`, hitBox(t, r.width, r.height));
      fx.setRect("ground", { x: -200, y: r.height - 6, w: r.width + 400, h: 240 });
    };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(sceneRef.current);
    else window.addEventListener("resize", measure);
    return () => {
      if (ro) ro.disconnect(); else window.removeEventListener("resize", measure);
      for (const t of targets) fx.setRect(`t:${t.key}`, null);
      fx.setRect("ground", null);
      fx.clearProjectiles && fx.clearProjectiles();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fx, fxReady]);

  /* ── the round clock ─────────────────────────────────────────────────────
     Wall-clock anchored. A decremented counter drifts, and drifts to zero the
     moment the phone locks; Date.now() does not care that the tab slept. */
  useEffect(() => {
    deadline.current = Date.now() + (cfg.seconds || 90) * 1000;
    const read = () => {
      const s = Math.max(0, (deadline.current - Date.now()) / 1000);
      setLeft(s);
      if (s <= 0 && !doneRef.current) { doneRef.current = true; finish("timer"); }
    };
    const iv = setInterval(read, 200);
    document.addEventListener("visibilitychange", read);
    return () => { clearInterval(iv); document.removeEventListener("visibilitychange", read); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = useCallback((reason) => {
    doneRef.current = true;
    onDone && onDone(reason);
  }, [onDone]);

  /* ── threats ─────────────────────────────────────────────────────────────
     One scheduler, four hazards, all driven off the same rAF so their windows
     can never disagree with each other. Being EXPOSED (i.e. having just fired)
     inside a danger window for SPOT_DWELL_MS is what busts you — dwell rather
     than instant, so a dropped frame can never cost the run. */
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const schedule = (kind) => {
      const c = THREATS[kind];
      nextThreat.current[kind] = performance.now() + rand(c.every[0], c.every[1]);
    };
    schedule("headlights"); schedule("porchlight");

    const tick = (t) => {
      raf = requestAnimationFrame(tick);
      if (doneRef.current) return;
      const now = performance.now();

      // whichever hazard is live wins; they are deliberately allowed to overlap
      let live = null;
      for (const kind of ["headlights", "porchlight"]) {
        const c = THREATS[kind];
        const at = nextThreat.current[kind];
        if (at == null) continue;
        const dt = now - at;
        if (dt >= 0 && dt < c.warn) live = { kind, phase: "warn" };
        else if (dt >= c.warn && dt < c.warn + c.danger) live = { kind, phase: "danger" };
        else if (dt >= c.warn + c.danger) schedule(kind);
      }
      // the ring cam never stops; it just sweeps
      if (!live) {
        const ph = (((t - t0) % THREATS.ringcam.sweepMs) / THREATS.ringcam.sweepMs) * Math.PI * 2;
        const ang = Math.sin(ph) * 46;
        if (Math.abs(ang) < THREATS.ringcam.halfDeg) live = { kind: "ringcam", phase: "danger" };
      }
      setThreat((prev) => {
        const same = prev && live && prev.kind === live.kind && prev.phase === live.phase;
        return same ? prev : live;
      });

      const up = now < exposedUntil.current;
      setExposed((p) => (p === up ? p : up));

      if (up && live && live.phase === "danger") {
        if (!inDangerSince.current) inDangerSince.current = now;
        else if (now - inDangerSince.current > SPOT_DWELL_MS && !doneRef.current) {
          bust(live.kind);
        }
      } else {
        inDangerSince.current = 0;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bust = useCallback((kind) => {
    if (doneRef.current) return;
    doneRef.current = true;
    comboRef.current = 0; setCombo(0);
    buzzWarning(); sfxBuzzer();
    if (fx) { fx.flash("#ff3b30", 320, { alpha: 0.42 }); fx.shake(0.9); }
    onBusted && onBusted({ reason: kind, dealt: bankRef.current, msLeft: Math.max(0, deadline.current - Date.now()) });
  }, [fx, onBusted]);

  /* ── the shot ──────────────────────────────────────────────────────────── */
  const fire = useCallback((ev) => {
    if (doneRef.current || !fx || !sceneRef.current) return;
    const now = performance.now();
    if (now - lastShot.current < RELOAD_MS) return;
    lastShot.current = now;

    const r = sceneRef.current.getBoundingClientRect();
    const W = r.width, H = r.height;
    let tx = ev.clientX - r.left, ty = ev.clientY - r.top;

    /* Aim assist — the single biggest reason this is playable with a thumb.
       Always resolves by NEAREST CENTRE, never by first-match. On a 362px-wide
       screen with thirteen targets, hitboxes inflated to thumb size inevitably
       overlap; picking the first overlapping box would snap to whichever
       happened to be authored earlier, which reads as the game ignoring you.
       Containing the tap is a strong bonus, not a short-circuit. */
    let intent = null, best = Infinity;
    for (const t of targets) {
      if ((hpRef.current[t.key] || 0) <= 0) continue;
      const b = hitBox(t, W, H);
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
      const inside = tx >= b.x && tx <= b.x + b.w && ty >= b.y && ty <= b.y + b.h;
      const score = Math.hypot(cx - tx, cy - ty) - (inside ? SNAP_PX * 2 : 0);
      if (score < best && (inside || score < SNAP_PX)) { best = score; intent = t; }
    }
    if (intent) {
      const b = hitBox(intent, W, H);
      tx = b.x + b.w / 2; ty = b.y + b.h / 2;
    }

    const x0 = W * 0.5, y0 = H * 0.99;
    const { vx, vy } = solveLob(x0, y0, tx, ty);

    // firing stands you up — this IS the stealth mechanic
    exposedUntil.current = now + EXPOSED_MS;
    sfxWhoosh(); tapLight();

    const key = intent ? intent.key : null;
    fx.projectile({
      x: x0, y: y0, vx, vy, gravity: GRAVITY, radius: EGG_R, kind: "egg", bounces: 0,
      onHit: (name, hx, hy, body) => {
        const armed = body.age >= FLIGHT_S - STEP_S * 0.5;
        // deaf to everything but its own target while still in the air
        if (!armed && name !== `t:${key}`) return "pass";
        if (name === `t:${key}` && key) { land(intent, hx, hy); return "stop"; }
        miss(hx, hy);
        return "stop";
      },
      onExpire: () => miss(null, null),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fx, targets]);

  /* ── a hit ─────────────────────────────────────────────────────────────── */
  const land = useCallback((t, hx, hy) => {
    const { w: W, h: H } = boxRef.current;
    const a = artBox(t, W, H);
    // clamp the splat onto the DRAWN prop — the hitbox is bigger than the art,
    // so the raw physics point can sit in empty siding next to a flamingo
    const sx = clamp(hx, a.x, a.x + a.w), sy = clamp(hy, a.y, a.y + a.h);

    const remaining = Math.max(0, (hpRef.current[t.key] || 1) - 1);
    setHp((p) => ({ ...p, [t.key]: remaining }));

    const step = COMBO_STEPS.findIndex((s) => comboRef.current + 1 < s);
    const tier = step === -1 ? COMBO_MULTS.length - 1 : Math.max(0, step - 1);
    const mult = comboRef.current + 1 >= COMBO_STEPS[0] ? COMBO_MULTS[tier] : 1;
    comboRef.current += 1;
    setCombo(comboRef.current);
    onCombo && onCombo(mult);

    if (remaining <= 0) {
      const dmg = (t.dmg || 0) * mult;
      bankRef.current += dmg;
      onDamage && onDamage(dmg, t);
      onDestroy && onDestroy(t.key, t.heat || 0);
      // show the MULTIPLIED number or nobody ever discovers the BBQ is a finisher
      setPop({ id: Math.random(), x: sx, y: sy, n: dmg, mult });
      window.setTimeout(() => setPop((p) => (p && p.n === dmg ? null : p)), 900);
      if (t.hint) { setNote(null); }
    }

    if (fx) {
      const kind = t.sfx === "glass" ? "glass" : t.sfx === "wood" ? "splinter" : "debris";
      fx.emit(kind, sx, sy, { count: remaining <= 0 ? 16 : 8, power: 1 });
      fx.decal("sawdust", sx, sy, { size: 14 });
      fx.shake(remaining <= 0 ? 0.34 : 0.16);
      if (t.boom) { fx.flash("#ffb347", 240, { alpha: 0.3, x: sx, y: sy }); fx.shake(0.7); }
    }
    if (t.sfx === "glass") sfxShatter();
    else if (t.sfx === "wood") sfxWoodCrack();
    else sfxImpact(4);
    tapMedium();
    if (lines && lines.length && Math.random() < 0.3) {
      playVoiceLine(lines[(Math.random() * lines.length) | 0].id, { volume: 0.9 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fx, onDamage, onDestroy, onCombo, lines]);

  /* ── a miss ────────────────────────────────────────────────────────────── */
  const miss = useCallback((hx, hy) => {
    comboRef.current = 0;
    setCombo(0);
    if (fx && hx != null) { fx.emit("dust", hx, hy, { count: 6 }); fx.decal("sawdust", hx, hy, { size: 10 }); }
    sfxSplat();
  }, [fx]);

  /* ── all targets down? ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (doneRef.current || !targets.length) return;
    if (targets.every((t) => (hp[t.key] || 0) <= 0)) finish("cleared");
  }, [hp, targets, finish]);

  useEffect(() => {
    if (cfg.hint) { setNote(cfg.hint); window.setTimeout(() => setNote(null), 3800); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mult = combo >= COMBO_STEPS[0]
    ? COMBO_MULTS[Math.max(0, (COMBO_STEPS.findIndex((s) => combo < s) === -1
      ? COMBO_MULTS.length - 1 : COMBO_STEPS.findIndex((s) => combo < s) - 1))]
    : 1;

  return (
    <div
      className={`dgn ${exposed ? "is-exposed" : ""} ${threat ? `is-${threat.phase}` : ""}`}
      ref={sceneRef}
      data-threat={threat ? threat.kind : "none"}
      onPointerDown={fire}
    >
      <SteeleHouse wrecked={hp} />

      {targets.map((t) => (
        <span
          key={t.key}
          className={`dgn-target ${(hp[t.key] || 0) <= 0 ? "is-down" : ""}`}
          style={{ left: `${t.x * 100}%`, top: `${t.y * 100}%`, width: `${t.w * 100}%`, height: `${t.h * 100}%` }}
          aria-hidden
        >
          <TargetArt art={t.art} broken={(hp[t.key] || 0) <= 0} />
        </span>
      ))}

      {/* the ground-plane sweep. A cone pointed AT you reads as a light in the
          eyes, not a wedge — so the camera's arc is drawn across the lawn. */}
      <span className="dgn-sweep" aria-hidden />
      <span className="dgn-bushes" aria-hidden />

      <div className="dgn-hud">
        <span className="dgn-clock"><GameIcon name="cam" size={12} /> {cfg.stamp || "11:47 PM"}</span>
        <span className={`dgn-timer ${left < 15 ? "is-low" : ""}`}>{Math.ceil(left)}s</span>
        {mult > 1 && <span className="dgn-combo">×{mult}</span>}
      </div>

      {threat && (
        <div className={`dgn-warn is-${threat.phase}`}>
          {threat.kind === "headlights" ? "HEADLIGHTS" :
            threat.kind === "porchlight" ? "PORCH LIGHT" : "RING CAM"}
          <em>{threat.phase === "warn" ? "hold your fire" : "DON'T FIRE"}</em>
        </div>
      )}

      {pop && (
        <span className="dgn-pop" style={{ left: pop.x, top: pop.y }} key={pop.id}>
          −{pop.n}{pop.mult > 1 ? <i>×{pop.mult}</i> : null}
        </span>
      )}

      {note && <div className="dgn-note">{note}</div>}
      <div className="dgn-tip">{exposed ? "YOU'RE UP" : "TAP A TARGET — firing stands you up"}</div>
    </div>
  );
}

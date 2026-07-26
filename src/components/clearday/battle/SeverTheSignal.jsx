import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sfxBossHit, sfxBossKneel, sfxCritStrike, sfxHalo, sfxShatter, sfxWhoosh, sfxZap } from "../../../lib/sfx.js";
import { slamHeavy, tapLight, tapMedium } from "../../../lib/haptics.js";
import { comboLabel, ROUND_COPY, TRACK_BATTLE } from "./battleContent.js";
import { TRACK_META } from "../clearDayData.js";
import { bossBreak, bossFlinch, bossLaugh, bossSpeak, bossWindup, createBoss, drawBoss, layoutBoss, updateBoss } from "./MaskBoss.js";

const motionOff = () =>
  (typeof document !== "undefined" && document.documentElement.dataset.reducedMotion === "true") ||
  (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const choose = (list) => list[Math.floor(Math.random() * list.length)];

/* hits needed to break its grip each round — also the grip-per-cut divisor */
const ROUND_GOAL = [6, 8, 10];
const HOT_COMBO = 6; // blade runs hot from here

function lineHitsCircle(a, b, c, r) {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const d = abx * abx + aby * aby || 1;
  const t = clamp(((c.x - a.x) * abx + (c.y - a.y) * aby) / d, 0, 1);
  const x = a.x + abx * t;
  const y = a.y + aby * t;
  return Math.hypot(c.x - x, c.y - y) <= r;
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawToken(ctx, o, alpha = 1) {
  ctx.save();
  ctx.translate(o.x, o.y);
  ctx.rotate(o.rotation);
  const w = o.r * 2.45;
  const h = o.r * 1.35;
  const x = -w / 2;
  const y = -h / 2;
  const signal = o.kind === "signal";
  const anchor = o.kind === "anchor";

  /* anchors carry a halo — they are the player's own words, held as bait */
  if (anchor) {
    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 0.8);
    halo.addColorStop(0, `rgba(118,219,255,${0.3 * alpha})`);
    halo.addColorStop(1, "rgba(118,219,255,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, w * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  if (signal) {
    grad.addColorStop(0, `rgba(59,21,38,${0.94 * alpha})`);
    grad.addColorStop(1, `rgba(13,16,31,${0.96 * alpha})`);
    ctx.shadowColor = `rgba(255,78,106,${0.45 * alpha})`;
  } else if (anchor) {
    grad.addColorStop(0, `rgba(41,102,128,${0.9 * alpha})`);
    grad.addColorStop(1, `rgba(30,36,72,${0.95 * alpha})`);
    ctx.shadowColor = `rgba(92,224,211,${0.5 * alpha})`;
  } else {
    grad.addColorStop(0, `rgba(55,62,91,${0.65 * alpha})`);
    grad.addColorStop(1, `rgba(18,23,43,${0.7 * alpha})`);
    ctx.shadowColor = "transparent";
  }
  ctx.shadowBlur = 18;
  roundRect(ctx, x, y, w, h, 14);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = anchor ? 1.8 : 1.2;
  ctx.strokeStyle = signal ? `rgba(255,99,120,${0.7 * alpha})` : anchor ? `rgba(118,219,255,${0.82 * alpha})` : `rgba(130,142,178,${0.38 * alpha})`;
  ctx.stroke();
  ctx.shadowBlur = 0;
  if (o.round === 2 && signal) {
    const pulse = Math.floor(o.age / 0.58) + 1;
    const phase = (o.age % 0.58) / 0.58;
    ctx.beginPath();
    ctx.arc(0, 0, o.r * (1.05 + phase * 0.45), 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,196,107,${(1 - phase) * 0.55})`;
    ctx.stroke();
    o.pulses = pulse;
  }
  ctx.fillStyle = signal ? `rgba(255,228,232,${alpha})` : anchor ? `rgba(231,255,249,${alpha})` : `rgba(164,174,207,${alpha})`;
  ctx.font = `700 ${clamp(13 - o.label.length * 0.08, 10, 13)}px Sora, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(o.label, 0, 1, w - 14);
  ctx.restore();
}

function drawSplitToken(ctx, o) {
  const t = clamp(o.splitAge / 0.75, 0, 1);
  const gap = 8 + t * 42;
  const alpha = 1 - t;
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(o.splitAngle);
    ctx.beginPath();
    ctx.rect(side < 0 ? -160 : 0, -120, 160, 240);
    ctx.clip();
    ctx.translate(side * gap, t * t * 40);
    ctx.rotate(-o.splitAngle + side * t * 0.12);
    ctx.translate(-o.x, -o.y);
    drawToken(ctx, o, alpha);
    ctx.restore();
  }
}

function ReducedMotionGame({ track, thought, anchors, onComplete }) {
  const content = TRACK_BATTLE[track];
  const deck = useMemo(() => {
    const signals = [thought, ...content.signals].filter(Boolean).slice(0, 7).map((label) => ({ kind: "signal", label }));
    const safe = anchors.slice(0, 5).map((label) => ({ kind: "anchor", label }));
    return [...signals, ...safe].sort(() => Math.random() - 0.5);
  }, [anchors, content.signals, thought]);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const started = useRef(Date.now());
  const card = deck[idx];
  const answer = (kind) => {
    const ok = kind === card.kind;
    if (ok) setCorrect((n) => n + 1); else setErrors((n) => n + 1);
    if (idx + 1 >= deck.length) {
      const total = correct + errors + 1;
      onComplete({ signals: correct + (ok ? 1 : 0), protected: 0, anchorErrors: errors + (ok ? 0 : 1), accuracy: Math.round(((correct + (ok ? 1 : 0)) / total) * 100), bestCombo: 0, gameSeconds: Math.round((Date.now() - started.current) / 1000), roundsCompleted: 3 });
    } else setIdx((n) => n + 1);
  };
  return (
    <div className="cdb-sort-game">
      <div className="cdb-sever-round">ACCESSIBLE MODE · {idx + 1}/{deck.length}</div>
      <h2 className="cdb-h">Sever or protect?</h2>
      <p className="cdb-p">Classify each signal. The mental rule stays the same without fast motion.</p>
      <div className={`cdb-sort-card cdb-sort-card--${card.kind}`}>{card.label}</div>
      <div className="cdb-sort-actions">
        <button type="button" onClick={() => answer("signal")}>SEVER</button>
        <button type="button" onClick={() => answer("anchor")}>PROTECT</button>
      </div>
    </div>
  );
}

export default function SeverTheSignal({ track, thought, anchors, maskName, settings, onComplete, onResearch }) {
  const canvasRef = useRef(null);
  const stageRef = useRef(null);
  const content = TRACK_BATTLE[track];
  const meta = TRACK_META[track] || TRACK_META.weed;
  const boss = maskName || "The Mask";
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [notice, setNotice] = useState("Sever the permission slips.");
  const [hud, setHud] = useState({ signals: 0, protected: 0, errors: 0, accuracy: 100, combo: 0, best: 0, grip: 1, crit: false, hot: false });
  const completeRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const anchorsRef = useMemo(() => anchors.filter(Boolean).slice(0, 7), [anchors]);

  const publish = useCallback((st) => {
    const attempts = st.hits + st.errors + st.missed;
    setHud({
      signals: st.hits, protected: st.protected, errors: st.errors,
      accuracy: attempts ? Math.round((st.hits / attempts) * 100) : 100,
      combo: st.combo, best: st.best,
      grip: clamp(st.boss.grip, 0, 1),
      crit: st.critFlash > 0,
      hot: st.combo >= HOT_COMBO,
    });
  }, []);

  useEffect(() => {
    if (!started || motionOff()) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const st = {
      width: 0, height: 0, objects: [], fragments: [], trail: [],
      last: performance.now(), round: 0, roundAt: 0, totalAt: performance.now(), spawnAt: 0,
      hits: 0, roundHits: [0, 0, 0], protected: 0, errors: 0, missed: 0, combo: 0, best: 0,
      active: true,
      boss: createBoss({ name: boss, rgb: meta.tintRgb, seed: (boss.length * 31 + track.length) || 7 }),
      trauma: 0, hitStop: 0, critFlash: 0, tintFlash: 0, tintColor: "255,99,120",
      windupAt: 0, burstQueue: 0, burstAt: 0,
      strokeCuts: 0, pointer: null,
    };
    let raf = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      st.width = rect.width;
      st.height = rect.height;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layoutBoss(st.boss, st.width, st.height);
    };
    resize();
    window.addEventListener("resize", resize);

    /* every token is thrown from the Mask's mouth — it has an author now */
    const spawn = (forcedKind) => {
      const difficulty = st.hits + st.protected;
      const accuracy = st.hits / Math.max(1, st.hits + st.errors + st.missed);
      const assist = accuracy < 0.55 ? 0.78 : 1;
      let kind = forcedKind || "signal";
      if (!forcedKind && st.round > 0) {
        const roll = Math.random();
        kind = roll < 0.29 ? "anchor" : roll > 0.88 ? "decoy" : "signal";
      }
      const r = kind === "decoy" ? 25 : clamp(35 - difficulty * 0.12, 28, 36);
      const label = kind === "signal" ? choose([thought, ...content.signals].filter(Boolean))
        : kind === "anchor" ? choose(anchorsRef.length ? anchorsRef : content.anchors)
          : choose(["◇", "○", "—", "△"]);
      const mouth = bossSpeak(st.boss);
      const dir = Math.random() > 0.5 ? 1 : -1;
      const spread = (24 + Math.random() * 46 + st.round * 6) / assist;
      st.objects.push({
        kind, label, r,
        x: mouth.x, y: mouth.y + r * 0.55,
        vx: dir * spread,
        vy: 14 + Math.random() * 20,
        rotation: (Math.random() - 0.5) * 0.18,
        spin: (Math.random() - 0.5) * 0.14,
        age: 0, pulses: 0, round: st.round, sliced: false, splitAge: 0, splitAngle: 0,
        born: performance.now(),
      });
      sfxZap(settings);
    };

    const fracture = (o, angle, x, y) => {
      o.sliced = true;
      o.splitAngle = angle;
      o.splitAge = 0;
      for (let i = 0; i < 10; i++) {
        const a = angle + (Math.random() - 0.5) * Math.PI * 1.4;
        const speed = 45 + Math.random() * 140;
        st.fragments.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 0.65 + Math.random() * 0.45, size: 2 + Math.random() * 5, color: o.kind === "signal" ? "#ff6378" : "#5ce0d3", rot: Math.random() * 6, spin: (Math.random() - 0.5) * 8 });
      }
    };

    const gripPerCut = () => 1 / ROUND_GOAL[st.round];

    const handleSegment = (a, b) => {
      let didHit = false;
      for (const o of st.objects) {
        const reach = o.r * (st.combo >= HOT_COMBO ? 1.3 : 1.15);
        if (o.sliced || o.kind === "decoy" || !lineHitsCircle(a, b, o, reach)) continue;
        didHit = true;
        const angle = Math.atan2(b.y - a.y, b.x - a.x);
        if (o.kind === "anchor") {
          /* the Mask baited you with your own words — and you took it */
          st.errors += 1;
          st.combo = 0;
          o.sliced = true;
          o.splitAge = 0.42;
          st.boss.grip = clamp(st.boss.grip + gripPerCut() * 0.6, 0, 1);
          bossLaugh(st.boss);
          st.tintFlash = 0.8;
          st.tintColor = "255,99,120";
          setNotice("It baited you with your own words.");
          sfxHalo(settings);
          tapLight();
        } else if (st.round === 2 && o.pulses < 2) {
          st.errors += 1;
          st.combo = 0;
          setNotice("Wait for the second pulse.");
          o.x += o.vx > 0 ? 36 : -36;
        } else {
          st.hits += 1;
          st.roundHits[st.round] += 1;
          st.combo += 1;
          st.strokeCuts += 1;
          st.best = Math.max(st.best, st.combo);
          fracture(o, angle, (a.x + b.x) / 2, (a.y + b.y) / 2);

          const crit = st.strokeCuts >= 2;
          st.boss.grip = clamp(st.boss.grip - gripPerCut() * (crit ? 1.7 : 1), 0, 1);
          bossFlinch(st.boss, angle, crit ? 1.6 : 1);
          st.trauma = clamp(st.trauma + (crit ? 0.75 : 0.34), 0, 1);
          st.hitStop = Math.max(st.hitStop, crit ? 0.09 : 0.045);

          if (crit) {
            st.critFlash = 0.6;
            setNotice("CRIT · TWO IN ONE STROKE");
            sfxCritStrike(settings);
            slamHeavy();
          } else {
            setNotice(st.combo >= 3 ? comboLabel(st.combo) : "Distance created");
            if (st.combo > 0 && st.combo % HOT_COMBO === 0) { sfxCritStrike(settings); tapMedium(); }
            else { sfxBossHit(settings); sfxShatter(settings); tapLight(); }
          }
        }
        publish(st);
        break;
      }
      return didHit;
    };

    const localPoint = (e) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top, t: performance.now() };
    };
    let drawing = false;
    let lastPoint = null;
    const down = (e) => {
      drawing = true;
      st.strokeCuts = 0;
      lastPoint = localPoint(e);
      st.pointer = lastPoint;
      st.trail.push(lastPoint);
      canvas.setPointerCapture?.(e.pointerId);
    };
    const move = (e) => {
      const events = e.getCoalescedEvents?.() || [e];
      for (const event of events) {
        const point = localPoint(event);
        st.pointer = point;
        if (!drawing) continue;
        if (lastPoint && Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y) > 3) handleSegment(lastPoint, point);
        st.trail.push(point);
        lastPoint = point;
      }
    };
    const up = () => { drawing = false; lastPoint = null; st.strokeCuts = 0; };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);

    const finish = () => {
      if (completeRef.current) return;
      completeRef.current = true;
      bossBreak(st.boss);
      sfxBossKneel(settings);
      slamHeavy();
      st.trauma = 1;
      setNotice(`${boss.toUpperCase()} LOSES ITS GRIP`);
      const attempts = st.hits + st.errors + st.missed;
      const payload = { signals: st.hits, protected: st.protected, anchorErrors: st.errors, accuracy: attempts ? Math.round((st.hits / attempts) * 100) : 100, bestCombo: st.best, gameSeconds: Math.round((performance.now() - st.totalAt) / 1000), roundsCompleted: 3 };
      /* let the kneel play before handing back to the boss act */
      window.setTimeout(() => { st.active = false; onCompleteRef.current(payload); }, 1500);
    };

    const advance = (now) => {
      if (st.round >= 2) { finish(); return; }
      st.round += 1;
      st.roundAt = now;
      st.objects.length = 0;
      st.boss.grip = 1;
      st.boss.phase = st.round;
      st.boss.gripShown = 1;
      setRound(st.round);
      setNotice(ROUND_COPY[st.round].instruction);
      sfxWhoosh(settings);
    };

    const tick = (now) => {
      if (!st.active) return;
      raf = requestAnimationFrame(tick);
      if (document.hidden) { st.last = now; return; }
      const real = clamp((now - st.last) / 1000, 0, 0.034);
      st.last = now;

      /* hit-stop: freeze the sim for a beat on impact, keep rendering */
      let dt = real;
      if (st.hitStop > 0) { st.hitStop -= real; dt = 0; }

      st.trauma = Math.max(0, st.trauma - real * 1.7);
      st.critFlash = Math.max(0, st.critFlash - real * 2.2);
      st.tintFlash = Math.max(0, st.tintFlash - real * 1.9);

      const roundElapsed = (now - st.roundAt) / 1000;
      setSeconds(Math.round((now - st.totalAt) / 1000));

      updateBoss(st.boss, real, st.pointer);

      if (!completeRef.current) {
        /* grip broken → the round is over. Timer stays as a ceiling. */
        if (st.boss.grip <= 0 || roundElapsed >= ROUND_COPY[st.round].duration) { advance(now); return; }

        /* wind-up tell → three-token burst. Cut 2+ in one stroke for a CRIT. */
        if (st.round >= 1 && now - st.windupAt > 9200 && st.burstQueue === 0 && st.boss.windup <= 0) {
          st.windupAt = now;
          bossWindup(st.boss);
          setNotice("IT'S WINDING UP");
          sfxWhoosh(settings);
          st.burstQueue = 3;
          st.burstAt = now + 900;
        }
        if (st.burstQueue > 0 && now >= st.burstAt) {
          spawn("signal");
          st.burstQueue -= 1;
          st.burstAt = now + 130;
        }

        const spawnEvery = clamp(1.24 - st.round * 0.13 - st.hits * 0.006, 0.68, 1.24);
        if (st.burstQueue === 0 && (now - st.spawnAt) / 1000 >= spawnEvery && st.objects.length < 6 + st.round) {
          spawn();
          st.spawnAt = now;
        }
      }

      for (const o of st.objects) {
        o.age += dt;
        if (o.sliced) { o.splitAge += dt; continue; }
        o.x += o.vx * dt;
        o.y += o.vy * dt;
        o.vy += 52 * dt; // thrown in a slow arc — it wants to be read, then cut
        o.rotation += o.spin * dt;
        /* bounce off the arena walls so nothing escapes sideways uncontested */
        const halfW = o.r * 1.22;
        if (o.x < halfW) { o.x = halfW; o.vx = Math.abs(o.vx) * 0.86; }
        else if (o.x > st.width - halfW) { o.x = st.width - halfW; o.vx = -Math.abs(o.vx) * 0.86; }
        /* only the floor counts — a signal that reaches it got past you */
        if (o.y > st.height + o.r * 2.4) {
          if (o.kind === "anchor") { st.protected += 1; st.combo += 1; st.best = Math.max(st.best, st.combo); setNotice("Anchor protected"); sfxHalo(settings); }
          if (o.kind === "signal") { st.missed += 1; st.combo = 0; setNotice("The signal slipped through. Reset your stance."); }
          o.dead = true;
          publish(st);
        }
      }
      st.objects = st.objects.filter((o) => !o.dead && (!o.sliced || o.splitAge < 0.78));
      for (const f of st.fragments) { f.life -= dt; f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 90 * dt; f.rot += f.spin * dt; }
      st.fragments = st.fragments.filter((f) => f.life > 0);
      st.trail = st.trail.filter((p) => now - p.t < 190);

      /* ── render ── */
      ctx.clearRect(0, 0, st.width, st.height);
      ctx.save();
      if (st.trauma > 0.002) {
        const amp = st.trauma * st.trauma * 13;
        ctx.translate((Math.random() - 0.5) * amp, (Math.random() - 0.5) * amp);
        ctx.rotate((Math.random() - 0.5) * st.trauma * st.trauma * 0.035);
      }

      const bg = ctx.createRadialGradient(st.width * 0.5, st.height * 0.85, 0, st.width * 0.5, st.height * 0.85, st.width * 0.8);
      bg.addColorStop(0, `rgba(47,92,145,${0.12 + st.round * 0.04})`);
      bg.addColorStop(1, "rgba(4,7,17,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, st.width, st.height);

      drawBoss(ctx, st.boss);

      for (const o of st.objects) o.sliced ? drawSplitToken(ctx, o) : drawToken(ctx, o);
      for (const f of st.fragments) {
        ctx.save(); ctx.globalAlpha = clamp(f.life, 0, 1); ctx.translate(f.x, f.y); ctx.rotate(f.rot); ctx.fillStyle = f.color; ctx.fillRect(-f.size / 2, -f.size / 3, f.size, f.size * 0.66); ctx.restore();
      }

      /* blade — runs white-hot once the combo climbs */
      if (st.trail.length > 1) {
        const hot = st.combo >= HOT_COMBO;
        for (let i = 1; i < st.trail.length; i++) {
          const a = st.trail[i - 1]; const b = st.trail[i];
          const age = clamp(1 - (now - b.t) / 190, 0, 1);
          const velocity = Math.hypot(b.x - a.x, b.y - a.y);
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
          ctx.lineWidth = clamp(2 + velocity * 0.3, 3, hot ? 15 : 11) * age;
          ctx.lineCap = "round";
          ctx.strokeStyle = hot ? `rgba(255,248,232,${age})` : velocity > 22 ? `rgba(255,196,107,${age})` : `rgba(118,199,255,${age})`;
          ctx.shadowColor = hot ? "rgba(255,190,90,1)" : ctx.strokeStyle;
          ctx.shadowBlur = hot ? 22 : 10;
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }
      ctx.restore();

      /* full-stage flashes sit outside the shake so they stay flush */
      if (st.critFlash > 0.01) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = st.critFlash * 0.32;
        ctx.fillStyle = "rgba(255,214,140,1)";
        ctx.fillRect(0, 0, st.width, st.height);
        ctx.restore();
      }
      if (st.tintFlash > 0.01) {
        ctx.save();
        ctx.globalAlpha = st.tintFlash * 0.3;
        ctx.fillStyle = `rgba(${st.tintColor},1)`;
        ctx.fillRect(0, 0, st.width, st.height);
        ctx.restore();
      }
    };
    st.roundAt = performance.now();
    st.totalAt = st.roundAt;
    st.spawnAt = st.roundAt - 1000;
    st.windupAt = st.roundAt;
    raf = requestAnimationFrame(tick);
    return () => {
      st.active = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, [anchorsRef, boss, content.anchors, content.signals, meta.tintRgb, publish, settings, started, thought, track]);

  if (motionOff()) return <ReducedMotionGame track={track} thought={thought} anchors={anchorsRef} onComplete={onComplete} />;

  return (
    <div className="cdb-sever" ref={stageRef}>
      {!started ? (
        <div className="cdb-sever-brief">
          <div className="cdb-act-eyebrow">ACT · SEVER THE SIGNAL</div>
          <h2 className="cdb-h">{boss} is talking.<br />Cut it down.</h2>
          <p className="cdb-p">Craving can recruit vivid mental imagery. This task occupies visual working memory while you rehearse what to reject—and what to protect.</p>
          <div className="cdb-sever-legend"><span className="cdb-sever-swatch cdb-sever-swatch--signal" /> Slice what it says <span className="cdb-sever-swatch cdb-sever-swatch--anchor" /> Never cut your own anchors</div>
          <button type="button" className="cdb-big-btn" onClick={() => { completeRef.current = false; setStarted(true); sfxWhoosh(settings); }}>DRAW THE BLADE</button>
          <button type="button" className="cdb-science-link" onClick={() => onResearch?.("imagery")}>Why this is here</button>
        </div>
      ) : (
        <>
          <div className="cdb-sever-hud">
            <div><span>ROUND {round + 1}/3</span><strong>{ROUND_COPY[round].title}</strong></div>
            <div className="cdb-sever-time">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</div>
          </div>
          <div className="cdb-grip" data-low={hud.grip <= 0.34}>
            <div className="cdb-grip-head">
              <span className="cdb-grip-name" style={{ color: meta.color }}>{boss}</span>
              <span className="cdb-grip-label">GRIP</span>
            </div>
            <div className="cdb-grip-track">
              <i className="cdb-grip-fill" style={{ width: `${Math.round(hud.grip * 100)}%`, background: `linear-gradient(90deg, rgba(${meta.tintRgb},.55), ${meta.color})` }} />
            </div>
          </div>
          <div className="cdb-sever-notice" data-crit={hud.crit}>{notice}</div>
          <div className="cdb-sever-stage" data-hot={hud.hot}>
            <canvas ref={canvasRef} className="cdb-sever-canvas" aria-label={`Slice what ${boss} says while protecting your own anchors`} />
          </div>
          <div className="cdb-sever-stats">
            <div><strong>{hud.signals}</strong><span>signals severed</span></div>
            <div><strong>{hud.protected}</strong><span>anchors protected</span></div>
            <div><strong>{hud.accuracy}%</strong><span>focus</span></div>
          </div>
          <div className="cdb-combo" data-on={hud.combo >= 3} data-hot={hud.hot}>{comboLabel(hud.combo)} · {hud.combo}</div>
        </>
      )}
    </div>
  );
}

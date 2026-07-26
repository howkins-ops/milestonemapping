/* ════════════════════════════════════════════════════════════════════════
   THE MASK — the boss of Sever the Signal.

   Drawn entirely procedurally on the battle canvas: no art assets, no
   external sprite. A cracked porcelain face built from radial shard
   plates that drift apart as its grip breaks, with a jaw that opens to
   throw every permission slip at the player.

   It is NEVER killed — CLEARDAY's law is that the game does not decide
   whether the urge changed (UrgeBattle Act 6). Its grip breaks, it
   kneels, it goes quiet. It is still in the building.

   Public API:
     createBoss(opts)          → boss state
     layoutBoss(boss, w, h)    → call on resize
     updateBoss(boss, dt)      → advance animation
     drawBoss(ctx, boss)       → render
     bossSpeak(boss)           → play the throw, returns {x,y} mouth point
     bossFlinch(boss, angle)   → it got cut
     bossLaugh(boss)           → player cut an anchor
     bossWindup(boss)          → tell before a burst
     bossBreak(boss)           → grip gone; kneel choreography
   ════════════════════════════════════════════════════════════════════════ */

const TAU = Math.PI * 2;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - (1 - t) * (1 - t);
const easeIn = (t) => t * t;

/* deterministic per-mount jitter so the face is stable frame to frame */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/* Face silhouette — a superellipse with a longer, tapered chin. */
function faceRadius(a, rx, ry) {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const down = s > 0;
  const yr = down ? ry * 1.16 : ry * 0.86;
  const n = down ? 2.7 : 2.15;
  const d = Math.pow(Math.abs(c / rx), n) + Math.pow(Math.abs(s / yr), n);
  return Math.pow(d, -1 / n);
}

export function createBoss({ name = "The Mask", rgb = "255, 99, 120", seed = 7 } = {}) {
  const rand = rng(seed * 2654435761);
  const SECTORS = 13;

  /* Shard plates: a radial fan from an off-centre origin, split into an
     inner and outer ring. Jittered boundaries read as organic cracks. */
  const bounds = [];
  for (let i = 0; i < SECTORS; i++) {
    bounds.push((i / SECTORS) * TAU + (rand() - 0.5) * (TAU / SECTORS) * 0.55);
  }
  const midR = bounds.map(() => 0.34 + rand() * 0.18);
  const plates = [];
  for (let i = 0; i < SECTORS; i++) {
    const a0 = bounds[i];
    const a1 = bounds[(i + 1) % SECTORS] + (i === SECTORS - 1 ? TAU : 0);
    const am = (a0 + a1) / 2;
    for (const ring of [0, 1]) {
      plates.push({
        a0, a1, ring,
        r0: ring === 0 ? 0 : midR[i],
        r1: ring === 0 ? midR[i] : 1,
        rj0: midR[i],
        rj1: midR[(i + 1) % SECTORS],
        dirX: Math.cos(am),
        dirY: Math.sin(am),
        drift: 0.35 + rand() * 0.9,
        spin: (rand() - 0.5) * 0.5,
        tone: 0.82 + rand() * 0.36,
        vx: 0, vy: 0, rot: 0,
      });
    }
  }

  /* Hairline cracks that grow across the face as grip drops. */
  const cracks = [];
  for (let i = 0; i < 6; i++) {
    const a = rand() * TAU;
    const pts = [{ x: Math.cos(a) * 0.1, y: Math.sin(a) * 0.1 }];
    let dir = a;
    for (let k = 0; k < 5; k++) {
      dir += (rand() - 0.5) * 0.9;
      const last = pts[pts.length - 1];
      const step = 0.15 + rand() * 0.12;
      pts.push({ x: last.x + Math.cos(dir) * step, y: last.y + Math.sin(dir) * step });
    }
    cracks.push({ pts, at: 0.12 + i * 0.14 });
  }

  return {
    name: (name || "The Mask").toUpperCase(),
    rgb,
    cx: 0, cy: 0, rx: 0, ry: 0,
    plates, cracks,
    grip: 1, gripShown: 1,
    phase: 0,
    t: 0,
    speakT: 1,        // 1 = idle (timeline complete)
    flinch: 0, hitX: 0, hitY: 0,
    laugh: 0,
    windup: 0,
    jaw: 0, jawTarget: 0,
    gazeX: 0, gazeY: 0,
    breakT: 0, broken: false,
    embers: [],
    flash: 0,
  };
}

export function layoutBoss(boss, w, h) {
  boss.cx = w * 0.5;
  boss.cy = Math.min(h * 0.19, 92);
  const size = clamp(Math.min(w * 0.32, h * 0.22), 58, 100);
  boss.rx = size * 0.82;
  boss.ry = size;
}

export function bossMouth(boss) {
  const head = headTransform(boss);
  return { x: boss.cx + head.x, y: boss.cy + head.y + boss.ry * 0.34 * head.scale };
}

/* Head displacement from the speak timeline + flinch knockback. */
function headTransform(boss) {
  const u = clamp(boss.speakT, 0, 1);
  const back = u < 0.35 ? Math.sin((u / 0.35) * (Math.PI / 2)) : 1 - easeIn(clamp((u - 0.35) / 0.65, 0, 1));
  const fwd = u > 0.35 ? Math.sin(clamp((u - 0.35) / 0.65, 0, 1) * Math.PI) : 0;
  const panic = boss.phase >= 2 && !boss.broken ? 1 : 0;
  const bob = Math.sin(boss.t * 1.55) * (2.6 - panic * 1.4);
  const jitter = panic ? Math.sin(boss.t * 41) * 1.5 * (1 - boss.gripShown) : 0;
  const sink = boss.broken ? easeOut(clamp(boss.breakT, 0, 1)) * boss.ry * 0.55 : 0;
  return {
    x: boss.hitX * boss.flinch * 13 + jitter,
    y: bob - back * 9 + fwd * 15 + boss.hitY * boss.flinch * 9 + sink,
    scale: (1 - back * 0.045 + fwd * 0.055) * (boss.broken ? 1 - boss.breakT * 0.12 : 1),
    rot: Math.sin(boss.t * 0.85) * 0.022 + boss.laugh * -0.16 + boss.flinch * boss.hitX * 0.1,
  };
}

export function bossSpeak(boss) {
  boss.speakT = 0;
  boss.jawTarget = 1;
  const m = bossMouth(boss);
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * 0.5 + (Math.random() - 0.5) * 1.5;
    const sp = 40 + Math.random() * 110;
    boss.embers.push({ x: m.x, y: m.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.4 + Math.random() * 0.4, max: 0.8, size: 1.5 + Math.random() * 2.6, hot: true });
  }
  return m;
}

export function bossFlinch(boss, angle = 0, power = 1) {
  boss.flinch = Math.min(1, boss.flinch + 0.85 * power);
  boss.hitX = -Math.cos(angle);
  boss.hitY = -Math.sin(angle) * 0.5;
  boss.flash = Math.min(1, boss.flash + 0.55 * power);
  boss.jawTarget = 0.25;
  const head = headTransform(boss);
  for (let i = 0; i < 10 * power; i++) {
    const a = Math.random() * TAU;
    const sp = 50 + Math.random() * 150 * power;
    boss.embers.push({
      x: boss.cx + head.x + (Math.random() - 0.5) * boss.rx,
      y: boss.cy + head.y + (Math.random() - 0.5) * boss.ry,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      life: 0.35 + Math.random() * 0.5, max: 0.85,
      size: 1.4 + Math.random() * 3, hot: false,
    });
  }
}

export function bossLaugh(boss) {
  boss.laugh = 1;
  boss.jawTarget = 1;
  boss.speakT = 1;
}

export function bossWindup(boss) {
  boss.windup = 1;
  boss.jawTarget = 0.55;
}

export function bossBreak(boss) {
  if (boss.broken) return;
  boss.broken = true;
  boss.breakT = 0;
  boss.jawTarget = 0;
  for (const p of boss.plates) {
    const sp = 40 + Math.random() * 130;
    p.vx = p.dirX * sp;
    p.vy = p.dirY * sp - 30;
    p.rot = 0;
  }
  const head = headTransform(boss);
  for (let i = 0; i < 46; i++) {
    const a = Math.random() * TAU;
    const sp = 60 + Math.random() * 240;
    boss.embers.push({
      x: boss.cx + head.x + (Math.random() - 0.5) * boss.rx * 1.4,
      y: boss.cy + head.y + (Math.random() - 0.5) * boss.ry * 1.4,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
      life: 0.6 + Math.random() * 0.8, max: 1.4,
      size: 1.6 + Math.random() * 3.6, hot: false,
    });
  }
}

export function updateBoss(boss, dt, gaze) {
  boss.t += dt;
  boss.speakT = Math.min(1, boss.speakT + dt / 0.44);
  boss.flinch = Math.max(0, boss.flinch - dt * 4.6);
  boss.laugh = Math.max(0, boss.laugh - dt * 1.5);
  boss.windup = Math.max(0, boss.windup - dt * 1.1);
  boss.flash = Math.max(0, boss.flash - dt * 3.4);
  boss.gripShown += (boss.grip - boss.gripShown) * Math.min(1, dt * 7);
  if (boss.broken) boss.breakT = Math.min(1, boss.breakT + dt / 1.15);

  /* jaw: driven by the speak timeline, laugh and an idle mutter */
  const speaking = boss.speakT < 1 ? Math.sin(clamp(boss.speakT / 0.8, 0, 1) * Math.PI) : 0;
  const mutter = (0.06 + boss.phase * 0.05) * (0.5 + 0.5 * Math.sin(boss.t * 2.3));
  const target = boss.broken ? 0 : Math.max(speaking, boss.laugh * 0.95, boss.windup * 0.6, mutter);
  boss.jaw += (target - boss.jaw) * Math.min(1, dt * 15);

  if (gaze) {
    boss.gazeX += (clamp((gaze.x - boss.cx) / (boss.rx * 5), -1, 1) - boss.gazeX) * Math.min(1, dt * 5);
    boss.gazeY += (clamp((gaze.y - boss.cy) / (boss.ry * 6), -0.6, 1) - boss.gazeY) * Math.min(1, dt * 5);
  }

  for (const e of boss.embers) {
    e.life -= dt;
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    e.vy += 150 * dt;
    e.vx *= 1 - dt * 1.2;
  }
  if (boss.embers.length) boss.embers = boss.embers.filter((e) => e.life > 0);

  if (boss.broken) {
    for (const p of boss.plates) {
      p.vy += 210 * dt;
      p.rot += p.spin * dt * 2.4;
    }
  }
}

/* ── drawing ─────────────────────────────────────────────────────────── */

function platePath(ctx, boss, p, dmg) {
  const steps = 4;
  const push = boss.broken ? 0 : p.drift * dmg * 7;
  const ox = p.dirX * push;
  const oy = p.dirY * push;
  const pt = (a, rf) => {
    const t = (a - p.a0) / (p.a1 - p.a0);
    const jitter = lerp(p.rj0, p.rj1, t);
    const rr = rf === 0 ? 0 : rf < 1 ? jitter : 1;
    const R = faceRadius(a, boss.rx, boss.ry) * rr;
    return { x: Math.cos(a) * R + ox, y: Math.sin(a) * R + oy };
  };
  ctx.beginPath();
  const outer = p.ring === 0 ? 0.999 : 1;
  const inner = p.ring === 0 ? 0 : 0.999;
  let first = true;
  for (let i = 0; i <= steps; i++) {
    const a = lerp(p.a0, p.a1, i / steps);
    const q = pt(a, outer);
    if (first) { ctx.moveTo(q.x, q.y); first = false; } else ctx.lineTo(q.x, q.y);
  }
  if (p.ring === 0) {
    ctx.lineTo(ox, oy);
  } else {
    for (let i = steps; i >= 0; i--) {
      const a = lerp(p.a0, p.a1, i / steps);
      const q = pt(a, inner);
      ctx.lineTo(q.x, q.y);
    }
  }
  ctx.closePath();
}

export function drawBoss(ctx, boss) {
  const dmg = clamp(1 - boss.gripShown, 0, 1);
  const head = headTransform(boss);
  const [r, g, b] = boss.rgb.split(",").map((n) => parseInt(n, 10));
  const alive = 1 - (boss.broken ? clamp(boss.breakT * 1.15, 0, 1) : 0);

  ctx.save();
  ctx.translate(boss.cx + head.x, boss.cy + head.y);

  /* ── aura: the pressure it puts in the room ── */
  const auraR = boss.ry * (2.5 + Math.sin(boss.t * 1.2) * 0.12 + dmg * 0.5);
  const aura = ctx.createRadialGradient(0, 0, boss.ry * 0.3, 0, 0, auraR);
  const auraA = (0.16 + dmg * 0.2 + boss.laugh * 0.22 + boss.windup * 0.16) * alive;
  aura.addColorStop(0, `rgba(${r},${g},${b},${auraA})`);
  aura.addColorStop(0.5, `rgba(${r},${g},${b},${auraA * 0.28})`);
  aura.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, auraR, 0, TAU);
  ctx.fill();

  ctx.rotate(head.rot);
  ctx.scale(head.scale, head.scale);
  ctx.globalAlpha = alive;

  /* ── the void behind the plates (visible through the seams) ── */
  ctx.beginPath();
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * TAU;
    const R = faceRadius(a, boss.rx, boss.ry);
    const x = Math.cos(a) * R;
    const y = Math.sin(a) * R;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(3,5,12,0.96)";
  ctx.fill();

  /* ── shard plates ── */
  for (const p of boss.plates) {
    ctx.save();
    if (boss.broken) {
      ctx.translate(p.vx * boss.breakT * 0.85, p.vy * boss.breakT * 0.85);
      ctx.rotate(p.rot);
      ctx.globalAlpha = alive * clamp(1 - boss.breakT * (p.ring === 1 ? 1.25 : 0.85), 0, 1);
    }
    platePath(ctx, boss, p, dmg);
    const shade = p.tone * (p.ring === 0 ? 1 : 0.84);
    const grad = ctx.createLinearGradient(-boss.rx, -boss.ry, boss.rx, boss.ry);
    grad.addColorStop(0, `rgba(${Math.round(38 * shade)},${Math.round(42 * shade)},${Math.round(58 * shade)},0.98)`);
    grad.addColorStop(0.55, `rgba(${Math.round(23 * shade)},${Math.round(26 * shade)},${Math.round(40 * shade)},0.98)`);
    grad.addColorStop(1, `rgba(${Math.round(11 * shade)},${Math.round(13 * shade)},${Math.round(24 * shade)},0.99)`);
    ctx.fillStyle = grad;
    ctx.fill();
    /* seam — glows hotter the more its grip is broken */
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = `rgba(${r},${g},${b},${0.1 + dmg * 0.36})`;
    ctx.shadowColor = `rgba(${r},${g},${b},${dmg * 0.6})`;
    ctx.shadowBlur = dmg * 7;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  /* ── cracks (clipped to the face — they are in it, not around it) ── */
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * TAU;
    const R = faceRadius(a, boss.rx, boss.ry);
    const x = Math.cos(a) * R;
    const y = Math.sin(a) * R;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.clip();
  ctx.lineCap = "round";
  for (const c of boss.cracks) {
    const prog = clamp((dmg - c.at) / 0.3, 0, 1);
    if (prog <= 0) continue;
    const n = Math.max(2, Math.round(c.pts.length * prog));
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const x = c.pts[i].x * boss.rx * 1.5;
      const y = c.pts[i].y * boss.ry * 1.5;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(2,3,9,0.92)";
    ctx.lineWidth = 2.6;
    ctx.stroke();
    ctx.strokeStyle = `rgba(${r},${g},${b},${0.35 + prog * 0.4})`;
    ctx.lineWidth = 0.9;
    ctx.shadowColor = `rgba(${r},${g},${b},0.8)`;
    ctx.shadowBlur = 7;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  if (!boss.broken || boss.breakT < 0.6) {
    const feat = boss.broken ? clamp(1 - boss.breakT / 0.6, 0, 1) : 1;
    ctx.globalAlpha = alive * feat;

    /* ── brows: angled wedges driven inward — a permanent scowl ── */
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(side * boss.rx * 0.14, -boss.ry * 0.31);
      ctx.lineTo(side * boss.rx * 0.74, -boss.ry * 0.44);
      ctx.lineTo(side * boss.rx * 0.72, -boss.ry * 0.27);
      ctx.lineTo(side * boss.rx * 0.16, -boss.ry * 0.19);
      ctx.closePath();
      ctx.fillStyle = "rgba(4,6,14,0.94)";
      ctx.fill();
    }
    /* nose ridge — a sliver of shadow that gives the face structure */
    ctx.beginPath();
    ctx.moveTo(0, -boss.ry * 0.17);
    ctx.lineTo(-boss.rx * 0.075, boss.ry * 0.17);
    ctx.lineTo(boss.rx * 0.075, boss.ry * 0.17);
    ctx.closePath();
    ctx.fillStyle = "rgba(4,6,14,0.45)";
    ctx.fill();

    /* ── eyes: tapered slits with a pupil that tracks the blade ── */
    const eyeGlow = 0.55 + boss.phase * 0.16 + dmg * 0.3 + boss.flinch * 0.45 + boss.windup * 0.3;
    for (const side of [-1, 1]) {
      const ex = side * boss.rx * 0.4;
      const ey = -boss.ry * 0.16;
      const ew = boss.rx * 0.3;
      const eh = boss.ry * (0.1 + boss.laugh * 0.03 + boss.windup * 0.05);
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(side * -0.16);
      ctx.beginPath();
      ctx.moveTo(-ew, 0);
      ctx.quadraticCurveTo(0, -eh, ew, 0);
      ctx.quadraticCurveTo(0, eh, -ew, 0);
      ctx.closePath();
      ctx.fillStyle = "rgba(2,3,8,0.98)";
      ctx.fill();
      const socket = ctx.createRadialGradient(0, 0, 0, 0, 0, ew);
      socket.addColorStop(0, `rgba(${r},${g},${b},${eyeGlow})`);
      socket.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = socket;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(boss.gazeX * ew * 0.5, boss.gazeY * eh * 0.5, ew * 0.17, 0, TAU);
      ctx.fillStyle = `rgba(255,${Math.min(255, g + 80)},${Math.min(255, b + 60)},${0.75 + boss.flinch * 0.25})`;
      ctx.shadowColor = `rgba(${r},${g},${b},1)`;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    /* ── mouth: a jagged aperture that opens to throw its lines ── */
    const mw = boss.rx * 0.46;
    const mh = boss.ry * (0.035 + boss.jaw * 0.3);
    const my = boss.ry * 0.34;
    ctx.save();
    ctx.translate(0, my);
    ctx.beginPath();
    const teeth = 9;
    for (let i = 0; i <= teeth; i++) {
      const t = i / teeth;
      const x = lerp(-mw, mw, t);
      const y = -mh * (i % 2 === 0 ? 0.55 : 1);
      i === 0 ? ctx.moveTo(x, 0) : ctx.lineTo(x, y);
    }
    for (let i = teeth; i >= 0; i--) {
      const t = i / teeth;
      const x = lerp(-mw, mw, t);
      const y = mh * (i % 2 === 0 ? 1 : 0.55);
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(1,2,6,0.99)";
    ctx.fill();
    if (boss.jaw > 0.14) {
      const throat = ctx.createRadialGradient(0, 0, 0, 0, 0, mw);
      throat.addColorStop(0, `rgba(${r},${g},${b},${boss.jaw * 0.75})`);
      throat.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = throat;
      ctx.fill();
    }
    ctx.restore();
  }

  /* ── rim light so it reads against the dark stage ── */
  ctx.globalAlpha = alive;
  if (!boss.broken) {
    ctx.beginPath();
    for (let i = 0; i <= 48; i++) {
      const a = (i / 48) * TAU;
      const R = faceRadius(a, boss.rx, boss.ry);
      const x = Math.cos(a) * R;
      const y = Math.sin(a) * R;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = `rgba(${r},${g},${b},${0.3 + dmg * 0.35 + boss.windup * 0.3})`;
    ctx.lineWidth = 1.4;
    ctx.shadowColor = `rgba(${r},${g},${b},0.9)`;
    ctx.shadowBlur = 14 + boss.windup * 16;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  /* ── impact flash ── */
  if (boss.flash > 0.01) {
    ctx.globalAlpha = boss.flash * 0.5 * alive;
    ctx.globalCompositeOperation = "lighter";
    ctx.beginPath();
    ctx.arc(0, 0, boss.ry * 1.15, 0, TAU);
    ctx.fillStyle = "rgba(255,246,238,0.9)";
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.restore();

  /* ── embers (world space) ── */
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const e of boss.embers) {
    const a = clamp(e.life / e.max, 0, 1);
    ctx.globalAlpha = a;
    ctx.fillStyle = e.hot ? `rgba(255,${Math.min(255, g + 90)},170,${a})` : `rgba(${r},${g},${b},${a})`;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.size * a, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

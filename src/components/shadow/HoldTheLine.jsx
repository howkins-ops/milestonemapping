import React, { useState, useEffect, useRef } from "react";

/* ════════════════════════════════════════════════════════════════════════
   HOLD THE LINE — a cinematic anger-transformation journey.

   Grounded in the actual science of acute anger down-regulation:
     · Physiological sigh (double-inhale, long exhale) — Stanford/Huberman
       lab, 2023: beats meditation for dropping arousal in the moment.
     · Somatic discharge + PMR — DBT "TIPP": anger is adrenaline with
       nowhere to go; burning it off / clench-release drains the charge.
     · Affect labeling — UCLA (Lieberman): naming it in the third person
       ("this is rage") quiets the amygdala and brings the cortex back.
     · Anger iceberg — anger is the guard; underneath sits hurt / fear /
       shame it's protecting.
     · The gap — Frankl: between stimulus and response there is a space;
       the whole skill is widening it and choosing from there.

   The arc descends into the body, cools the charge, then climbs back into
   choice. A single "heat" value falls from blazing red to calm cyan across
   the whole journey, so the transformation is something you can watch.
   ════════════════════════════════════════════════════════════════════════ */

const RED = "var(--brand-red)";
const STAGES = ["arrive", "sigh", "discharge", "name", "under", "gap", "seal"];

// crossfade a hot (red) and cool (cyan) layer by heat 0..1
function heatGlow(h) {
  return `radial-gradient(circle at 50% 38%, rgba(0,240,255,${0.42 * (1 - h)}), transparent 60%),
          radial-gradient(circle at 50% 46%, rgba(255,59,92,${0.16 + 0.5 * h}), transparent 62%)`;
}
function heatBorder(h) {
  return h > 0.5 ? "rgba(255,59,92,0.55)" : `rgba(0,240,255,${0.3 + 0.4 * (1 - h)})`;
}

export default function HoldTheLine({ onClose, onFinish }) {
  const [stage, setStage] = useState(0);
  const [heat, setHeat] = useState(100); // 100 = blazing, 0 = cool
  const [data, setData] = useState({ name: "", intensity: "", under: "", underNote: "", move: "" });

  const set = (patch) => setData((d) => ({ ...d, ...patch }));
  const go = (i, targetHeat) => {
    if (targetHeat != null) setHeat(targetHeat);
    setStage(i);
  };

  const h = heat / 100;
  const cool = heat <= 35;

  const finish = () => {
    const bits = [];
    if (data.name) bits.push(`Named it: ${data.name}`);
    if (data.under) bits.push(`under it: ${data.under}`);
    if (data.move.trim()) bits.push(`chose: "${data.move.slice(0, 44)}"`);
    onFinish("Hold the Line", bits.join(" · ") || "Cooled the charge and held the line");
  };

  return (
    <div className="htl-stage" style={{ "--htl-heat": h, background: `${heatGlow(h)}, radial-gradient(circle at 50% 120%, rgba(20,4,10,0.9), #050007 70%)` }}>
      <div className="htl-embers" aria-hidden style={{ opacity: 0.25 + 0.55 * h }} />

      {/* top bar — charge meter is the throughline of the whole journey */}
      <div className="htl-top">
        <button className="htl-back" onClick={onClose}>← Back</button>
        <span className="htl-title">Hold the Line</span>
        <div className="htl-meter" title="Charge">
          <span className="htl-meter__fill" style={{ width: `${heat}%`, background: cool ? "var(--brand-cyan)" : "var(--brand-red)" }} />
        </div>
      </div>

      <div className="htl-dots">
        {STAGES.map((_, i) => (
          <span key={i} className={`htl-dot ${i <= stage ? "on" : ""}`} style={{ background: i <= stage ? (cool ? "var(--brand-cyan)" : "var(--brand-red)") : undefined }} />
        ))}
      </div>

      <div className="htl-body" key={stage}>
        {stage === 0 && <Arrive heat={h} onNext={() => go(1)} />}
        {stage === 1 && <Sigh onNext={() => go(2, 72)} />}
        {stage === 2 && <Discharge onNext={() => go(3, 22)} />}
        {stage === 3 && <NameIt data={data} set={set} onNext={() => go(4, 15)} />}
        {stage === 4 && <Underneath data={data} set={set} onNext={() => go(5, 8)} />}
        {stage === 5 && <Gap data={data} set={set} onNext={() => go(6, 3)} />}
        {stage === 6 && <Seal data={data} onDone={finish} />}
      </div>
    </div>
  );
}

/* ─── tiny shared bits ─────────────────────────────────────────────────── */
function Eyebrow({ children, cool }) {
  return <p className="htl-eyebrow" style={{ color: cool ? "var(--brand-cyan)" : "var(--brand-red)" }}>{children}</p>;
}
function Heading({ children }) { return <h2 className="htl-h">{children}</h2>; }
function Lead({ children }) { return <p className="htl-lead">{children}</p>; }
function Science({ children }) {
  return (
    <p className="htl-science"><span>THE SCIENCE</span>{children}</p>
  );
}
function Primary({ children, onClick, disabled, cool }) {
  return (
    <button className="htl-primary" onClick={onClick} disabled={disabled}
      style={{ background: cool ? "var(--brand-cyan)" : "var(--brand-red)", opacity: disabled ? 0.4 : 1 }}>
      {children}
    </button>
  );
}

/* ─── 0 · Arrive — name the stakes ─────────────────────────────────────── */
function Arrive({ heat, onNext }) {
  return (
    <div className="htl-center">
      <div className="htl-core htl-core--pulse" style={{ background: heatGlow(heat), borderColor: heatBorder(heat) }}>
        <span className="htl-core__label">running hot</span>
      </div>
      <Eyebrow>The heat is real</Eyebrow>
      <Heading>Anger isn&rsquo;t the enemy.</Heading>
      <Lead>
        It&rsquo;s a guard standing at the door of something that got hurt. We&rsquo;re not here to kill it —
        we&rsquo;re here to keep it from driving. Between the spark and the act there&rsquo;s a gap.
        The whole skill is widening it: <b>body first, story second.</b>
      </Lead>
      <Primary onClick={onNext}>Find the gap →</Primary>
    </div>
  );
}

/* ─── 1 · Physiological sigh — starve the fire of oxygen ───────────────── */
const SIGH = [
  { key: "Inhale", sub: "through the nose — the fire will flare, let it", s: 4, col: "var(--brand-green)" },
  { key: "Sip more", sub: "a short second breath in", s: 2, col: "var(--brand-gold)" },
  { key: "Exhale", sub: "long & slow — strangle the flame", s: 8, col: "var(--brand-cyan)" },
];
const SIGH_ROUNDS = 4;

/* ─── fire simulation — canvas particle engine ──────────────────────────
   The flame is a living thing. It feeds and flares on every inhale —
   weaker each round — gutters down to a dying tongue on the long exhale,
   and finally dies in a column of smoke over cooling coals. Everything is
   driven by one `vigor` value eased toward a target set by the breath
   phase: inhale pulls it up fast (the whoosh back), exhale drags it down
   slowly (the strangle). */
function createFireSim(canvas, getBreath) {
  const ctx = canvas.getContext("2d");
  const reduced = typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let W = 0, H = 0;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    W = r.width; H = r.height;
    canvas.width = Math.max(1, Math.round(W * dpr));
    canvas.height = Math.max(1, Math.round(H * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  const ro = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  if (ro) ro.observe(canvas);

  // soft radial sprites, rendered once — cheap to stamp hundreds of times a frame
  const sprite = (stops) => {
    const c = document.createElement("canvas");
    c.width = c.height = 64;
    const g = c.getContext("2d");
    const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    stops.forEach(([o, col]) => rg.addColorStop(o, col));
    g.fillStyle = rg;
    g.fillRect(0, 0, 64, 64);
    return c;
  };
  const RAMP = [ // white-hot core → cooling red, walked by particle age
    sprite([[0, "rgba(255,255,255,0.95)"], [0.35, "rgba(255,240,200,0.8)"], [1, "rgba(255,220,150,0)"]]),
    sprite([[0, "rgba(255,233,168,0.95)"], [0.4, "rgba(255,200,77,0.75)"], [1, "rgba(255,178,61,0)"]]),
    sprite([[0, "rgba(255,178,61,0.9)"], [0.4, "rgba(255,122,47,0.7)"], [1, "rgba(255,106,47,0)"]]),
    sprite([[0, "rgba(255,106,47,0.85)"], [0.45, "rgba(255,59,92,0.55)"], [1, "rgba(255,59,92,0)"]]),
  ];
  const GLOW = sprite([[0, "rgba(255,122,47,0.55)"], [0.5, "rgba(255,59,92,0.22)"], [1, "rgba(255,59,92,0)"]]);
  const ASH = sprite([[0, "rgba(0,240,255,0.5)"], [1, "rgba(0,240,255,0)"]]);
  const EMBER = sprite([[0, "rgba(255,235,190,1)"], [0.3, "rgba(255,179,92,0.9)"], [1, "rgba(255,122,47,0)"]]);
  const SMOKE = sprite([[0, "rgba(172,182,202,0.4)"], [1, "rgba(172,182,202,0)"]]);

  const parts = [];
  const acc = { flame: 0, ember: 0, smoke: 0 };
  let vigor = 0.9, flare = 0, wind = 0, gust = 0, gustIn = 0;
  let outFade = 0, plumed = false, lastPi = -1, t = 0;

  const spawn = (p) => { if (parts.length < 420) parts.push(p); };
  const gauss = () => (Math.random() + Math.random() + Math.random()) / 1.5 - 1;

  let raf, last = performance.now();
  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; t += dt;
    if (!W || !H) return;

    const { pi, round, out } = getBreath();
    const cx = W / 2, baseY = H - 26;
    const bedW = Math.min(210, W * 0.55);
    const vel = reduced ? 0.55 : 1;
    const rate = reduced ? 0.4 : 1;

    // ── vigor: what the fire has to live on ──
    let target;
    if (out) target = 0;
    else if (pi === 2) target = Math.max(0.05, 0.16 - round * 0.035);      // strangled to almost-out
    else target = Math.min(1, Math.max(0.42, 1 - round * 0.16) + (pi === 1 ? 0.1 : 0)); // flares back, weaker each round
    if (pi !== lastPi) { if (!out && pi !== 2 && !reduced) flare = pi === 0 ? 0.9 : 0.55; lastPi = pi; }
    flare = Math.max(0, flare - dt * 1.1);
    const k = out ? 1.0 : target > vigor ? 2.6 : 0.5; // whoosh back fast, starve slow
    vigor += (target - vigor) * Math.min(1, k * dt);
    outFade = out ? Math.min(1, outFade + dt * 0.5) : 0;

    const starving = !out && pi === 2;
    // gusts — the flame panics for air while it's being strangled
    if (starving && !reduced) {
      gustIn -= dt;
      if (gustIn <= 0) { gust = (Math.random() < 0.5 ? -1 : 1) * (40 + 60 * Math.random()); gustIn = 0.7 + Math.random() * 1.1; }
    }
    gust *= Math.max(0, 1 - 2.2 * dt);
    wind = Math.sin(t * 2.3) * 9 + (starving ? Math.sin(t * 6.1) * 24 + gust : 0);

    // organic flicker on the rendered size
    const v = Math.max(0, vigor * (1 + (reduced ? 0.02 : 0.06) * Math.sin(t * 9.7) + 0.05 * Math.sin(t * 17.3)));

    // ── spawn ──
    acc.flame += dt * rate * (20 + 210 * v + flare * 170);
    while (acc.flame >= 1) {
      acc.flame -= 1;
      const spread = bedW * (0.18 + 0.5 * v) * 0.5;
      spawn({
        kind: 0, x: cx + gauss() * spread, y: baseY - 6 - Math.random() * 8,
        vx: (Math.random() - 0.5) * (14 + 26 * v),
        vy: -(46 + 170 * v + flare * 90) * (0.75 + Math.random() * 0.5) * vel,
        size: (11 + 36 * v + flare * 12) * (0.7 + Math.random() * 0.6),
        age: 0, life: (0.5 + 0.85 * v) * (0.7 + Math.random() * 0.6),
        seed: Math.random() * 7,
      });
    }
    acc.ember += dt * rate * (v * 2.4 + flare * 11);
    while (acc.ember >= 1) {
      acc.ember -= 1;
      spawn({
        kind: 1, x: cx + gauss() * bedW * 0.3, y: baseY - 14 - Math.random() * 46 * v,
        vx: (Math.random() - 0.5) * 44, vy: -(90 + 170 * Math.random()) * (0.45 + 0.65 * v) * vel,
        size: 1.6 + Math.random() * 2, age: 0, life: 1.1 + Math.random() * 1.3,
        seed: Math.random() * 7,
      });
    }
    const smokeP = (x, y, boost) => ({
      kind: 2, x, y, vx: (Math.random() - 0.5) * 10,
      vy: -(24 + 30 * Math.random()) * boost * vel,
      size: (9 + 9 * Math.random()) * boost,
      age: 0, life: 2.4 + Math.random() * 1.8, seed: Math.random() * 7,
    });
    let smokeRate = 0;
    if (out) smokeRate = Math.max(1.2, 9 * (1 - outFade));
    else if (starving) smokeRate = 6 + 11 * (1 - v);
    else if (v < 0.3) smokeRate = 3;
    if (out && !plumed) { // the death plume — one tall column of smoke
      plumed = true;
      for (let i = 0; i < 26; i++) spawn(smokeP(cx + gauss() * bedW * 0.24, baseY - 16, 1.6));
    }
    acc.smoke += dt * (reduced ? 0.5 : 1) * smokeRate;
    while (acc.smoke >= 1) { acc.smoke -= 1; spawn(smokeP(cx + gauss() * bedW * 0.3, baseY - 14, 1)); }

    // ── draw ──
    ctx.clearRect(0, 0, W, H);

    // smoke first, behind the light
    ctx.globalCompositeOperation = "source-over";
    for (const p of parts) {
      if (p.kind !== 2) continue;
      const tt = p.age / p.life;
      if (tt >= 1) continue;
      const s = p.size * (1 + 2.2 * tt) * 3;
      ctx.globalAlpha = 0.34 * (1 - tt) * Math.min(1, tt / 0.12);
      ctx.drawImage(SMOKE, p.x - s / 2, p.y - s / 2, s, s);
    }

    ctx.globalCompositeOperation = "lighter";
    // ground glow breathes with the fire
    const gs = 230 + 340 * v + flare * 90;
    ctx.globalAlpha = 0.12 + 0.42 * v + flare * 0.15;
    ctx.drawImage(GLOW, cx - gs / 2, baseY - 14 - gs / 2, gs, gs);
    if (outFade > 0) { const as = 190; ctx.globalAlpha = 0.14 * outFade; ctx.drawImage(ASH, cx - as / 2, baseY - 12 - as / 2, as, as); }

    for (const p of parts) {
      p.age += dt;
      const tt = p.age / p.life;
      if (tt >= 1) continue;
      const lift = p.kind === 2 ? 0.8 : tt;
      p.x += (p.vx + wind * lift) * dt + Math.sin(p.age * (p.kind === 1 ? 9 : 4) + p.seed) * (p.kind === 0 && starving ? 34 : 14) * dt;
      p.y += p.vy * dt;
      if (p.kind === 0) {
        const idx = Math.min(3, Math.floor(tt * 4));
        const s = p.size * (1.15 - 0.55 * tt);
        ctx.globalAlpha = Math.pow(1 - tt, 1.5) * (0.7 + 0.3 * v);
        ctx.drawImage(RAMP[idx], p.x - s / 2, p.y - s / 2, s, s);
      } else if (p.kind === 1) {
        const s = p.size * 4;
        ctx.globalAlpha = (1 - tt) * (0.5 + 0.5 * Math.abs(Math.sin(p.age * 21 + p.seed)));
        ctx.drawImage(EMBER, p.x - s / 2, p.y - s / 2, s, s);
      }
    }
    for (let i = parts.length - 1; i >= 0; i--) if (parts[i].age >= parts[i].life) parts.splice(i, 1);

    // coal bed in front — the flames rise from behind it
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.translate(cx, baseY);
    ctx.scale(1, 0.17);
    const bed = ctx.createRadialGradient(0, 0, 2, 0, 0, bedW / 2);
    bed.addColorStop(0, "#3a1210");
    bed.addColorStop(0.72, "#180607");
    bed.addColorStop(1, "rgba(8,2,3,0)");
    ctx.fillStyle = bed;
    ctx.beginPath();
    ctx.arc(0, 0, bedW / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // live coals dim as the fire dies, then cool to ash-cyan
    ctx.globalCompositeOperation = "lighter";
    [-0.34, -0.18, 0.02, 0.2, 0.36].forEach((dx, i) => {
      const cxx = cx + dx * bedW, cy = baseY + (i % 2 ? 2 : -2);
      const glow = (0.2 + 0.8 * v) * (0.6 + 0.4 * Math.sin(t * 3 + i * 2.1));
      const s = 16 + 10 * v;
      ctx.globalAlpha = Math.max(0, glow * (1 - outFade));
      ctx.drawImage(EMBER, cxx - s / 2, cy - s / 2, s, s);
      if (outFade > 0) {
        ctx.globalAlpha = 0.5 * outFade * (0.7 + 0.3 * Math.sin(t * 1.4 + i));
        ctx.drawImage(ASH, cxx - 7, cy - 7, 14, 14);
      }
    });
    ctx.globalAlpha = 1;
  };
  raf = requestAnimationFrame(frame);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
    },
  };
}

function Sigh({ onNext }) {
  const [pi, setPi] = useState(0);
  const [count, setCount] = useState(SIGH[0].s);
  const [round, setRound] = useState(0);
  const [fuel, setFuel] = useState(100); // the fire's oxygen — 0 = out

  useEffect(() => {
    const iv = setInterval(() => {
      setCount((c) => {
        if (c > 1) return c - 1;
        setPi((cur) => {
          const nx = (cur + 1) % SIGH.length;
          if (nx === 0) setRound((r) => r + 1);
          return nx;
        });
        return 0;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);
  useEffect(() => { setCount(SIGH[pi].s); }, [pi]);

  // only the long exhale starves the fire — 4 full exhales put it out
  useEffect(() => {
    if (pi !== 2) return;
    const iv = setInterval(() => setFuel((f) => Math.max(0, f - 1.7)), 500);
    return () => clearInterval(iv);
  }, [pi]);
  useEffect(() => { if (round >= SIGH_ROUNDS) setFuel(0); }, [round]);

  const ph = SIGH[pi];
  const out = fuel <= 0;

  // the sim reads the live breath state through a ref — no re-renders per frame
  const canvasRef = useRef(null);
  const breathRef = useRef({ pi: 0, round: 0, out: false });
  breathRef.current = { pi, round, out };
  useEffect(() => {
    const sim = createFireSim(canvasRef.current, () => breathRef.current);
    return sim.destroy;
  }, []);

  const tagMode = out ? "out" : pi === 2 ? "starve" : "feed";
  const tagText = out ? "extinguished"
    : pi === 2 ? "starving — watch it gutter"
    : pi === 1 ? "flaring"
    : round === 0 ? "it feeds on your in-breath"
    : "it flares back — weaker each time";

  return (
    <div className="htl-center">
      <Eyebrow cool>Starve the fire</Eyebrow>
      <Heading>{out ? "The fire is out." : "Cut off its oxygen"}</Heading>
      <Lead>
        {out
          ? "No oxygen, no fire. That whole trick lives in your exhale — and it goes wherever you go."
          : <>Anger is a fire, and it flares back every time you breathe in — let it. The long exhale is what starves it, and each time it comes back weaker. <b>Watch it fight for air on every breath out.</b></>}
      </Lead>

      <div className="htl-firepit">
        <canvas ref={canvasRef} className="htl-fire-canvas" aria-hidden />
        <span className="htl-firetag" data-mode={tagMode}>{tagText}</span>
      </div>

      <div className="htl-o2">
        <span className="htl-o2__label">oxygen</span>
        <div className="htl-o2__bar">
          <span className="htl-o2__fill" style={{ width: `${fuel}%`, background: fuel > 40 ? "var(--brand-red)" : "var(--brand-cyan)" }} />
        </div>
        <span className="htl-o2__val">{Math.round(fuel)}%</span>
      </div>

      <div className="htl-breathbar" style={{ borderColor: out ? "rgba(0,240,255,0.35)" : undefined }}>
        <span className="htl-breathbar__phase" style={{ color: ph.col }}>{out ? "Out" : ph.key}</span>
        <span className="htl-breathbar__count">{out ? "✓" : (count || ph.s)}</span>
        <span className="htl-breathbar__sub">{out ? "the flame has nothing left to burn" : ph.sub}</span>
      </div>

      <div className="htl-rounds">round {Math.min(round + (out ? 0 : 1), SIGH_ROUNDS)} / {SIGH_ROUNDS}</div>
      <Science>Stanford found this double-inhale + long exhale lowers your arousal faster than meditation — in a single breath. The long exhale is the part that puts the fire out.</Science>

      <button className="htl-primary" onClick={onNext}
        style={{ background: out ? "var(--brand-cyan)" : "transparent", color: out ? "#000" : "var(--text-main)", border: out ? "none" : "1px solid var(--border)" }}>
        {out ? "The fire’s out →" : "I’ve breathed enough →"}
      </button>
    </div>
  );
}

/* ─── 2 · Somatic discharge — the interactive game ─────────────────────── */
const DISCHARGE_CUES = [
  "Shake your hands out — hard, like you&rsquo;re flicking off water.",
  "Clench both fists for 5… then drop everything loose.",
  "Push your feet into the floor. Press the heat down and out.",
  "Roll the shoulders back. Let the jaw go slack.",
];

function Discharge({ onNext }) {
  const [charge, setCharge] = useState(100);
  const [punch, setPunch] = useState(false);
  const [cue, setCue] = useState(0);
  const holdRef = useRef(null);
  const spent = charge <= 0;

  // rotate the somatic cue every few seconds
  useEffect(() => {
    const iv = setInterval(() => setCue((c) => (c + 1) % DISCHARGE_CUES.length), 3200);
    return () => clearInterval(iv);
  }, []);

  const stop = () => { if (holdRef.current) { clearInterval(holdRef.current); holdRef.current = null; } };
  const drain = (amt) => {
    setCharge((c) => {
      const next = Math.max(0, c - amt);
      if (next === 0) stop(); // self-stop the hold-loop the moment it cools
      return next;
    });
    setPunch(true);
    setTimeout(() => setPunch(false), 110);
    if (navigator.vibrate) { try { navigator.vibrate(14); } catch {} }
  };
  const onDown = () => {
    drain(8);
    holdRef.current = setInterval(() => drain(4), 140); // reward holding too
  };
  useEffect(() => stop, []);

  const hc = charge / 100;

  return (
    <div className="htl-center">
      <Eyebrow cool={spent}>Burn it off</Eyebrow>
      <Heading>{spent ? "The charge is spent." : "Discharge the charge"}</Heading>
      <Lead>
        {spent
          ? "That adrenaline had nowhere to go — now it does. Feel how the edge has dropped."
          : "Anger is adrenaline with nowhere to go. Pound it out of the core until it cools — tap fast, or press and hold."}
      </Lead>

      <button
        className={`htl-discharge ${punch ? "is-hit" : ""} ${spent ? "is-spent" : ""}`}
        onPointerDown={spent ? undefined : onDown}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        disabled={spent}
        style={{
          background: heatGlow(hc),
          borderColor: heatBorder(hc),
          transform: `scale(${punch ? 1.07 : 1})`,
        }}
        aria-label="Discharge the charge"
      >
        <span className="htl-discharge__ring" />
        <span className="htl-discharge__val">{spent ? "✓" : `${Math.round(charge)}%`}</span>
        <span className="htl-discharge__hint">{spent ? "cooled" : "strike"}</span>
      </button>

      {!spent && <p className="htl-cue" key={cue} dangerouslySetInnerHTML={{ __html: DISCHARGE_CUES[cue] }} />}
      <Science>This is the body half of DBT&rsquo;s crisis kit — spend the surge through movement and clench-release, and the nervous system stands down.</Science>

      {spent
        ? <Primary cool onClick={onNext}>My thinking brain is back →</Primary>
        : <button className="htl-skip" onClick={onNext}>I&rsquo;m already cooler — skip ahead</button>}
    </div>
  );
}

/* ─── 3 · Name it (affect labeling) ────────────────────────────────────── */
const ANGER_WORDS = ["Rage", "Fury", "Resentment", "Frustration", "Disrespect", "Indignation", "Contempt", "Betrayal", "Bitterness", "Humiliation"];
const INTENSITIES = ["Simmering", "Burning", "Boiling"];

function NameIt({ data, set, onNext }) {
  return (
    <div className="htl-pane">
      <Eyebrow cool>Name it to tame it</Eyebrow>
      <Heading>What is this, exactly?</Heading>
      <Lead>Be precise — &ldquo;bad&rdquo; does nothing, &ldquo;this is contempt&rdquo; does a lot. Pick the truest word.</Lead>

      <div className="htl-chips">
        {ANGER_WORDS.map((w) => (
          <button key={w} className={`htl-chip ${data.name === w ? "on" : ""}`} onClick={() => set({ name: w })}>{w}</button>
        ))}
      </div>

      {data.name && (
        <>
          <div className="htl-echo">This is <b>{data.name.toLowerCase()}</b>.</div>
          <p className="htl-echo-sub">Said in the third person — &ldquo;this is&rdquo;, not &ldquo;I am&rdquo; — so you stand beside it instead of becoming it.</p>
          <div className="htl-intensity">
            {INTENSITIES.map((x) => (
              <button key={x} className={`htl-chip sm ${data.intensity === x ? "on" : ""}`} onClick={() => set({ intensity: x })}>{x}</button>
            ))}
          </div>
        </>
      )}

      <Science>UCLA scans show that labeling the feeling drops activity in the amygdala and hands the wheel back to your reasoning brain.</Science>
      <Primary cool disabled={!data.name} onClick={onNext}>That&rsquo;s the word →</Primary>
    </div>
  );
}

/* ─── 4 · Under the iceberg ────────────────────────────────────────────── */
const UNDER_WORDS = ["Hurt", "Fear", "Disrespected", "Shame", "Powerless", "Unseen", "Rejected", "Grief", "Helpless", "Betrayed"];

function Underneath({ data, set, onNext }) {
  return (
    <div className="htl-pane">
      <Eyebrow cool>Under the iceberg</Eyebrow>
      <Heading>Who is the anger protecting?</Heading>
      <Lead>{data.name || "Anger"} is the bodyguard at the door. It only ever shows up to guard something softer. What&rsquo;s underneath?</Lead>

      <div className="htl-iceberg">
        <div className="htl-iceberg__tip">{data.name || "Anger"}</div>
        <div className="htl-iceberg__line" />
        <div className="htl-chips">
          {UNDER_WORDS.map((w) => (
            <button key={w} className={`htl-chip ${data.under === w ? "on" : ""}`} onClick={() => set({ under: w })}>{w}</button>
          ))}
        </div>
      </div>

      <textarea className="htl-field" rows={2} value={data.underNote}
        onChange={(e) => set({ underNote: e.target.value })}
        placeholder="If you can: the real thing underneath was…" />

      {data.under && (
        <div className="htl-quote">
          &ldquo;My {(data.name || "anger").toLowerCase()} showed up because part of me felt {data.under.toLowerCase()}.
          I can protect that part without the explosion.&rdquo;
        </div>
      )}

      <Primary cool disabled={!data.under} onClick={onNext}>I see what it&rsquo;s guarding →</Primary>
    </div>
  );
}

/* ─── 5 · The gap — values-based choice ────────────────────────────────── */
function Gap({ data, set, onNext }) {
  return (
    <div className="htl-pane">
      <Eyebrow cool>The gap</Eyebrow>
      <Heading>You&rsquo;re standing in it.</Heading>
      <Lead>
        Body&rsquo;s cooler. The feeling&rsquo;s named. This is the space between the spark and the act —
        and you get to choose what walks out of it. Not the Raging Victim. The man you&rsquo;re becoming.
      </Lead>

      <div className="htl-quote">
        &ldquo;I feel this fully, and I still choose my response. That&rsquo;s the line I hold.&rdquo;
      </div>

      <label className="htl-label">If I respond from who I&rsquo;m becoming, the next right move is…</label>
      <textarea className="htl-field" rows={3} value={data.move}
        onChange={(e) => set({ move: e.target.value })}
        placeholder="Step outside for two minutes, then say the one true thing — calmly. / Ask for what I actually need. / Let it pass and revisit tomorrow." />

      <Primary cool onClick={onNext}>Hold it →</Primary>
    </div>
  );
}

/* ─── 6 · Seal ─────────────────────────────────────────────────────────── */
function Seal({ data, onDone }) {
  const stamp = data.move.trim()
    ? `I felt the ${(data.name || "heat").toLowerCase()}, protected the ${(data.under || "part of me").toLowerCase()} underneath, and chose my response.`
    : "I felt the heat without letting it drive.";
  return (
    <div className="htl-center">
      <div className="htl-core htl-core--cool">
        <span className="htl-core__label">held</span>
      </div>
      <Eyebrow cool>Sealed</Eyebrow>
      <Heading>You held the line.</Heading>
      <Lead>You caught it on the way up, cooled the body, named it, and chose. That pause <b>is</b> the skill — and every rep widens the gap.</Lead>

      <div className="htl-stamp">
        <span>YOUR STAMP</span>
        <p>{stamp}</p>
      </div>

      <Primary cool onClick={onDone}>Save &amp; close ✦</Primary>
    </div>
  );
}

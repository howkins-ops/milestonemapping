import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { SEED_LIES, TRACK_META } from "./clearDayData.js";
import {
  sfxMaskAmbush, sfxShatter, sfxCritStrike, sfxPop, sfxHalo,
  sfxPhoenix, sfxWhoosh, sfxNamingStrike, sfxCoin,
} from "../../lib/sfx.js";
import cdFx from "./cdFx.js";
import { slamHeavy } from "../../lib/haptics.js";

/* ═══════════════════════════════════════════════════════════════
   THE URGE BATTLE — CLEARDAY's centerpiece set-piece.
   Science-ordered acts (see CLEARDAY-10X-BUILD-PROMPT.md §1C/§3):
   interrupt → mask duel → static storm → defusion → the tape →
   the why → speak the law → victory ceremony.
   Body/automatic first, cognitive mid, identity last — moving down
   the wave. Real work, heavy FX, zero meditation framing.
   ═══════════════════════════════════════════════════════════════ */

const reducedMotion = () =>
  (typeof document !== "undefined" && document.documentElement.dataset.reducedMotion === "true") ||
  (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

/* ── local juice: particle bursts + screen shake on a DOM layer ──────── */
function burst(layer, x, y, color, n = 14) {
  if (!layer || reducedMotion()) return;
  for (let i = 0; i < n; i++) {
    const p = document.createElement("span");
    p.className = "cdb-spark";
    const a = Math.random() * Math.PI * 2;
    const d = 30 + Math.random() * 80;
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.background = color;
    p.style.setProperty("--dx", `${Math.cos(a) * d}px`);
    p.style.setProperty("--dy", `${Math.sin(a) * d}px`);
    layer.appendChild(p);
    setTimeout(() => p.remove(), 750);
  }
}

function shake(el) {
  if (!el || reducedMotion()) return;
  el.classList.remove("cdb-shake");
  // force reflow so back-to-back shakes restart the animation
  void el.offsetWidth;
  el.classList.add("cdb-shake");
}

/* ── the wave canvas — the battle's backbone ─────────────────────────── */
function WaveCanvas({ progress, tint }) {
  const ref = useRef(null);
  const progRef = useRef(progress);
  progRef.current = progress;
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let running = true;
    let t = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);
    const still = reducedMotion();
    const tick = () => {
      if (!running) return;
      if (document.hidden) { raf = requestAnimationFrame(tick); return; }
      t += still ? 0 : 0.016;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      // progress 0→1 rises to the crest, 1→2 falls. Height of the water:
      const p = progRef.current;
      const crest = p <= 1 ? p : Math.max(0.12, 1 - (p - 1) * 0.85);
      const base = H - crest * H * 0.72;
      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        ctx.moveTo(0, H);
        const amp = (10 + layer * 8) * dpr * (0.4 + crest);
        const speed = 0.9 + layer * 0.5;
        const off = layer * 2.1;
        for (let x = 0; x <= W; x += 6 * dpr) {
          const y = base + layer * 12 * dpr +
            Math.sin(x / (90 * dpr) + t * speed + off) * amp +
            Math.sin(x / (37 * dpr) - t * speed * 0.7 + off) * amp * 0.4;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H);
        ctx.closePath();
        const alpha = 0.16 - layer * 0.04;
        ctx.fillStyle = `rgba(${tint}, ${alpha})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [tint]);
  return <canvas ref={ref} className="cdb-wave" aria-hidden="true" />;
}

/* ── ACT 2: the Static Storm — visuospatial load mini-game ───────────── */
/* Catch drifting light-orbs before they fade. Taxes the visuospatial
   channel craving imagery runs on (Tetris studies — Skorka-Brown 2015). */
function StaticStorm({ settings, onDone }) {
  const canvasRef = useRef(null);
  const layerRef = useRef(null);
  const [caught, setCaught] = useState(0);
  const [secs, setSecs] = useState(0);
  const TARGET = 16;
  const stateRef = useRef({ orbs: [], t: 0, caught: 0 });

  useEffect(() => {
    const iv = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);
    const st = stateRef.current;
    const spawn = () => {
      const W = canvas.width;
      const H = canvas.height;
      const speedUp = 1 + st.caught * 0.06;
      st.orbs.push({
        x: Math.random() * W * 0.8 + W * 0.1,
        y: Math.random() * H * 0.7 + H * 0.15,
        r: (14 + Math.random() * 10) * dpr,
        vx: (Math.random() - 0.5) * 1.4 * dpr * speedUp,
        vy: (Math.random() - 0.5) * 1.4 * dpr * speedUp,
        life: 1,
        decay: 0.004 + st.caught * 0.00035,
        hue: 205 + Math.random() * 60,
      });
    };
    spawn(); spawn();
    let spawnClock = 0;
    const tick = () => {
      if (!running) return;
      if (document.hidden) { raf = requestAnimationFrame(tick); return; }
      const W = canvas.width;
      const H = canvas.height;
      st.t += 1;
      spawnClock += 1;
      const spawnEvery = Math.max(34, 80 - st.caught * 4);
      if (spawnClock > spawnEvery && st.orbs.length < 5) { spawn(); spawnClock = 0; }
      ctx.clearRect(0, 0, W, H);
      // faint static field
      ctx.fillStyle = "rgba(94,157,240,0.04)";
      for (let i = 0; i < 14; i++) {
        ctx.fillRect(Math.random() * W, Math.random() * H, 2 * dpr, 2 * dpr);
      }
      st.orbs = st.orbs.filter((o) => o.life > 0);
      for (const o of st.orbs) {
        o.x += o.vx; o.y += o.vy; o.life -= o.decay;
        if (o.x < o.r || o.x > W - o.r) o.vx *= -1;
        if (o.y < o.r || o.y > H - o.r) o.vy *= -1;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `hsla(${o.hue}, 90%, 72%, ${0.9 * o.life})`);
        g.addColorStop(1, `hsla(${o.hue}, 90%, 60%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onTap = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      const x = cx * dpr;
      const y = cy * dpr;
      const hitIdx = st.orbs.findIndex((o) => {
        const dx = o.x - x; const dy = o.y - y;
        return Math.sqrt(dx * dx + dy * dy) < o.r * 1.6;
      });
      if (hitIdx >= 0) {
        st.orbs.splice(hitIdx, 1);
        st.caught += 1;
        sfxPop(settings);
        burst(layerRef.current, cx, cy, "rgba(126,179,245,0.95)", 10);
        setCaught(st.caught);
      }
    };
    canvas.addEventListener("pointerdown", onTap);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onTap);
    };
  }, [settings]);

  const meter = Math.max(0, 100 - Math.round((caught / TARGET) * 100));
  useEffect(() => {
    if (caught >= TARGET) {
      const t = setTimeout(() => onDone(caught), 650);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [caught, onDone]);

  return (
    <div className="cdb-storm">
      <div className="cdb-act-eyebrow">ACT · THE STATIC STORM</div>
      <div className="cdb-storm-head">
        Catch the light. Every orb you track jams the exact mental channel the craving runs on.
      </div>
      <div className="cdb-storm-stage">
        <canvas ref={canvasRef} className="cdb-storm-canvas" />
        <div ref={layerRef} className="cdb-fx-layer" aria-hidden="true" />
      </div>
      <div className="cdb-meter">
        <div className="cdb-meter-label">CRAVING SIGNAL</div>
        <div className="cdb-meter-track">
          <div className="cdb-meter-fill" style={{ width: `${meter}%` }} />
        </div>
        <div className="cdb-meter-num">{meter}%</div>
      </div>
      {secs >= 30 && caught < TARGET && (
        <button type="button" className="cdb-ghost-btn" onClick={() => onDone(caught)}>
          Signal's fading — move on →
        </button>
      )}
    </div>
  );
}

/* ── the Mask — glitch entity ────────────────────────────────────────── */
function MaskFigure({ cracked, name }) {
  return (
    <div className={`cdb-mask ${cracked ? "cdb-mask--cracked" : ""}`} aria-hidden="true">
      <div className="cdb-mask-face">
        <div className="cdb-mask-eye cdb-mask-eye--l" />
        <div className="cdb-mask-eye cdb-mask-eye--r" />
        <div className="cdb-mask-mouth" />
      </div>
      <div className="cdb-mask-glitch" />
      <div className="cdb-mask-name">{name || "THE MASK"}</div>
    </div>
  );
}

/* ═══ THE BATTLE ═══════════════════════════════════════════════════════ */

export default function UrgeBattle({ track, S, settings, onWon, onSlip, onLeave, saveCard, saveTapeFn }) {
  const meta = TRACK_META[track] || TRACK_META.weed;
  const [act, setAct] = useState(0);
  const [beats, setBeats] = useState(0);
  const startRef = useRef(Date.now());
  const rootRef = useRef(null);
  const fxRef = useRef(null);
  const maskName = S.identity.maskName || "The Mask";

  const advance = useCallback(() => {
    setBeats((b) => b + 1);
    setAct((a) => a + 1);
  }, []);

  /* act 1 duel state */
  const deck = useMemo(() => {
    const own = (S.cards[track] || []).filter((c) => c.lie && c.comeback);
    const seeds = SEED_LIES[track] || SEED_LIES.weed;
    const pool = own.length >= 3 ? own : [...own, ...seeds].slice(0, 6);
    return pool.sort(() => Math.random() - 0.5).slice(0, 3);
  }, [S.cards, track]);
  const [duelIdx, setDuelIdx] = useState(0);
  const [duelMode, setDuelMode] = useState("pick"); // pick | type | cracked
  const [typed, setTyped] = useState("");
  const allComebacks = useMemo(() => {
    const seeds = SEED_LIES[track] || SEED_LIES.weed;
    return [...(S.cards[track] || []), ...seeds].map((c) => c.comeback).filter(Boolean);
  }, [S.cards, track]);

  const duelOptions = useMemo(() => {
    const current = deck[duelIdx];
    if (!current) return [];
    const decoys = allComebacks.filter((c) => c !== current.comeback).sort(() => Math.random() - 0.5).slice(0, 2);
    return [current.comeback, ...decoys].sort(() => Math.random() - 0.5);
  }, [deck, duelIdx, allComebacks]);

  const answerDuel = (comeback, e) => {
    const current = deck[duelIdx];
    if (!current) return;
    if (comeback === current.comeback) {
      sfxShatter(settings);
      shake(rootRef.current);
      if (e && fxRef.current) {
        const rect = fxRef.current.getBoundingClientRect();
        burst(fxRef.current, e.clientX - rect.left, e.clientY - rect.top, meta.glow, 16);
      }
      setDuelMode("cracked");
      setTimeout(() => {
        if (duelIdx + 1 >= deck.length) advance();
        else { setDuelIdx((i) => i + 1); setDuelMode("pick"); sfxMaskAmbush(settings); }
      }, 700);
    } else {
      // wrong pick: the Mask feeds on a weak answer — write your own
      sfxNamingStrike(settings);
      setDuelMode("type");
    }
  };

  const submitTyped = () => {
    const clean = typed.trim();
    if (clean.length < 8) return;
    const current = deck[duelIdx];
    if (saveCard && current) saveCard(track, current.lie, clean);
    sfxCritStrike(settings);
    shake(rootRef.current);
    setTyped("");
    setDuelMode("cracked");
    setTimeout(() => {
      if (duelIdx + 1 >= deck.length) advance();
      else { setDuelIdx((i) => i + 1); setDuelMode("pick"); sfxMaskAmbush(settings); }
    }, 700);
  };

  /* act 3 defusion state */
  const [thought, setThought] = useState("");
  const [defusePhase, setDefusePhase] = useState("type"); // type | drain
  const [drain, setDrain] = useState(0);
  const drainRef = useRef(null);
  const startDrain = () => {
    if (drainRef.current) return;
    drainRef.current = setInterval(() => {
      setDrain((d) => {
        const nd = d + 1.4;
        if (nd >= 100) {
          clearInterval(drainRef.current);
          drainRef.current = null;
        }
        return Math.min(100, nd);
      });
    }, 180);
  };
  const stopDrain = () => {
    if (drainRef.current) { clearInterval(drainRef.current); drainRef.current = null; }
  };
  useEffect(() => () => stopDrain(), []);

  /* act 4 tape state */
  const tape = S.tape[track] || { relapse: "", clear: "" };
  const [tapeSide, setTapeSide] = useState("dark");
  const [tapeDark, setTapeDark] = useState(tape.relapse);
  const [tapeClear, setTapeClear] = useState(tape.clear);
  const [tapeWritten, setTapeWritten] = useState(Boolean(tape.relapse && tape.clear));

  /* act 6 law state */
  const [lawTyped, setLawTyped] = useState("");
  const lawOk = /i don'?t/i.test(lawTyped) && lawTyped.trim().length >= 10;

  /* whys — hottest first */
  const hotWhy = useMemo(() => {
    const list = [...(S.whys || [])].sort((a, b) => (b.intensity || 0) - (a.intensity || 0));
    return list[0] || null;
  }, [S.whys]);

  /* mount sfx */
  useEffect(() => {
    sfxWhoosh(settings);
    const t = setTimeout(() => sfxMaskAmbush(settings), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (act === 5) sfxHalo(settings);
    if (act === 7) {
      sfxPhoenix(settings);
      sfxCoin(settings);
      shake(rootRef.current);
      cdFx.flare(meta.color);
      slamHeavy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [act]);

  const finishWon = () => {
    const seconds = Math.round((Date.now() - startRef.current) / 1000);
    onWon({ track, beats: beats + 1, seconds });
  };
  const leaveEarly = () => {
    const seconds = Math.round((Date.now() - startRef.current) / 1000);
    onLeave({ track, beats, seconds });
  };

  const waveProgress = act <= 1 ? 0.35 + act * 0.65 : 1 + (act - 1) * 0.18;

  return (
    <div ref={rootRef} className={`cdb cdb--${track}`}>
      <WaveCanvas progress={waveProgress} tint={meta.tintRgb} />
      <div ref={fxRef} className="cdb-fx-layer" aria-hidden="true" />

      <div className="cdb-topline">
        <div className="cdb-topline-track" style={{ color: meta.color }}>{meta.label.toUpperCase()} · URGE BATTLE</div>
        {act < 7 && (
          <button type="button" className="cdb-leave" onClick={leaveEarly}>leave</button>
        )}
      </div>

      {/* ACT 0 — THE INTERRUPT */}
      {act === 0 && (
        <div className="cdb-act cdb-act--interrupt">
          <div className="cdb-act-eyebrow">YOUR PLAN, FIRING</div>
          <h2 className="cdb-h">You planned for this<br />exact moment.</h2>
          <p className="cdb-p">
            “IF I feel the pull, THEN I open CLEARDAY and start the battle.” You just did. The plan is already working.
          </p>
          <p className="cdb-p cdb-p--corner">
            Now hear this: you're rehearsing it right now — picturing it, negotiating with it. That rehearsal is the fuel.
          </p>
          <button type="button" className="cdb-big-btn" onClick={() => { sfxNamingStrike(settings); advance(); }}>
            CUT IT
          </button>
        </div>
      )}

      {/* ACT 1 — THE MASK DUEL */}
      {act === 1 && deck[duelIdx] && (
        <div className="cdb-act">
          <div className="cdb-act-eyebrow">ACT · FACE {maskName.toUpperCase()}</div>
          <MaskFigure cracked={duelMode === "cracked"} name={maskName} />
          <div className="cdb-lie">
            <span className="cdb-lie-tag">{maskName} says:</span>
            “{deck[duelIdx].lie}”
          </div>
          {duelMode === "pick" && (
            <div className="cdb-options">
              <div className="cdb-options-head">Hit it with the true answer:</div>
              {duelOptions.map((opt) => (
                <button key={opt} type="button" className="cdb-option" onClick={(e) => answerDuel(opt, e)}>
                  {opt}
                </button>
              ))}
            </div>
          )}
          {duelMode === "type" && (
            <div className="cdb-typebox">
              <div className="cdb-options-head">That answer bounced off. Write the one only you can write:</div>
              <textarea
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder="The truth, in your words…"
                className="cdb-input"
                rows={3}
              />
              <button type="button" className="cdb-big-btn" disabled={typed.trim().length < 8} onClick={submitTyped}>
                STRIKE — save it to my deck
              </button>
            </div>
          )}
          {duelMode === "cracked" && <div className="cdb-crackline">CRACK. {duelIdx + 1}/{deck.length}</div>}
          <div className="cdb-duel-dots">
            {deck.map((_, i) => (
              <span key={i} className={`cdb-dot ${i < duelIdx || (i === duelIdx && duelMode === "cracked") ? "cdb-dot--hit" : ""}`} />
            ))}
          </div>
        </div>
      )}

      {/* ACT 2 — STATIC STORM */}
      {act === 2 && <StaticStorm settings={settings} onDone={() => advance()} />}

      {/* ACT 3 — NAME THE LINE (defusion) */}
      {act === 3 && (
        <div className="cdb-act">
          <div className="cdb-act-eyebrow">ACT · NAME THE LINE</div>
          {defusePhase === "type" && (
            <>
              <h2 className="cdb-h">What is {maskName}<br />saying right now?</h2>
              <p className="cdb-p">Type the exact thought. Word for word. Dragging it into the light is the move.</p>
              <textarea
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                placeholder='e.g. "I need it to get through tonight"'
                className="cdb-input"
                rows={3}
              />
              <button
                type="button"
                className="cdb-big-btn"
                disabled={thought.trim().length < 4}
                onClick={() => { setDefusePhase("drain"); sfxNamingStrike(settings); }}
              >
                CAUGHT IT
              </button>
            </>
          )}
          {defusePhase === "drain" && (
            <>
              <p className="cdb-p cdb-p--corner">Now look at it for what it is:</p>
              <div className="cdb-defuse-frame" style={{ opacity: 1 - drain / 130 }}>
                You are <em>having the thought that</em>
                <span className="cdb-defuse-thought">“{thought.trim()}”</span>
                You are not the thought.
              </div>
              <div className="cdb-meter">
                <div className="cdb-meter-label">THE THOUGHT'S GRIP</div>
                <div className="cdb-meter-track">
                  <div className="cdb-meter-fill cdb-meter-fill--drain" style={{ width: `${100 - drain}%` }} />
                </div>
              </div>
              <button
                type="button"
                className={`cdb-big-btn ${drain < 100 ? "cdb-big-btn--hold" : ""}`}
                onPointerDown={startDrain}
                onPointerUp={stopDrain}
                onPointerLeave={stopDrain}
                onClick={() => { if (drain >= 100) advance(); }}
              >
                {drain >= 100 ? "IT'S JUST WORDS NOW →" : "HOLD TO DRAIN IT"}
              </button>
            </>
          )}
        </div>
      )}

      {/* ACT 4 — PLAY THE WHOLE TAPE */}
      {act === 4 && (
        <div className="cdb-act">
          <div className="cdb-act-eyebrow">ACT · PLAY THE WHOLE TAPE</div>
          {!tapeWritten ? (
            <>
              <h2 className="cdb-h">Both endings.<br />Your words. Right now.</h2>
              <div className="cdb-tape-label cdb-tape-label--dark">IF I GIVE IN — play it to the very end</div>
              <textarea value={tapeDark} onChange={(e) => setTapeDark(e.target.value)} className="cdb-input" rows={3}
                placeholder="The relief lasts minutes. Then tonight, tomorrow morning, the ledger…" />
              <div className="cdb-tape-label cdb-tape-label--clear">IF I RIDE IT OUT — the other ending</div>
              <textarea value={tapeClear} onChange={(e) => setTapeClear(e.target.value)} className="cdb-input" rows={3}
                placeholder="Where are you tomorrow morning? Who's there? What does it feel like?" />
              <button
                type="button"
                className="cdb-big-btn"
                disabled={tapeDark.trim().length < 10 || tapeClear.trim().length < 10}
                onClick={() => {
                  if (saveTapeFn) saveTapeFn(track, tapeDark.trim(), tapeClear.trim());
                  setTapeSide("dark");
                  setTapeWritten(true);
                }}
              >
                PLAY THE TAPE
              </button>
            </>
          ) : (
            <TapePlayer
              dark={tapeDark}
              clear={tapeClear}
              side={tapeSide}
              onDark={() => setTapeSide("clear")}
              onClear={advance}
            />
          )}
        </div>
      )}

      {/* ACT 5 — THE WHY */}
      {act === 5 && (
        <div className="cdb-act cdb-act--why">
          <div className="cdb-act-eyebrow">ACT · WHY YOU'RE HERE</div>
          <div className="cdb-why-glow" aria-hidden="true" />
          <blockquote className="cdb-why">
            “{hotWhy ? hotWhy.text : S.why || "The clear life. The real one."}”
          </blockquote>
          <div className="cdb-why-sub">— you wrote that. It's still true.</div>
          <button type="button" className="cdb-big-btn" onClick={advance}>IT STANDS</button>
        </div>
      )}

      {/* ACT 6 — SPEAK THE LAW */}
      {act === 6 && (
        <div className="cdb-act">
          <div className="cdb-act-eyebrow">ACT · SEAL IT</div>
          <h2 className="cdb-h">Say the Law.<br />In full. No shortcuts.</h2>
          <p className="cdb-p">Type it out — every word. Produced words go deeper than read ones. It must carry “I don't.”</p>
          <textarea
            value={lawTyped}
            onChange={(e) => setLawTyped(e.target.value)}
            placeholder={meta.lawHint}
            className="cdb-input cdb-input--law"
            rows={2}
          />
          {!lawOk && lawTyped.trim().length >= 10 && (
            <div className="cdb-law-nudge">The Law runs on “I don't” — not “I can't,” not “I'm trying.” Own it.</div>
          )}
          <button type="button" className="cdb-big-btn" disabled={!lawOk} onClick={advance}>
            SEAL THE LAW
          </button>
        </div>
      )}

      {/* ACT 7 — VICTORY */}
      {act >= 7 && (
        <div className="cdb-act cdb-act--victory">
          <div className="cdb-stamp">
            <div className="cdb-stamp-inner">VOTE<br />CAST</div>
          </div>
          <h2 className="cdb-h">The wave broke.<br />You didn't.</h2>
          <p className="cdb-p">
            Urges outlasted: <strong>{(S.stats.battlesWon || 0) + 1}</strong>. Each one doesn't erase the wiring —
            it builds the thing that beats the wiring: proof you're the one holding the pen now.
          </p>
          <button type="button" className="cdb-big-btn" onClick={finishWon}>
            CLAIM THE VOTE · +1 EVIDENCE
          </button>
        </div>
      )}

      {/* the honest exit — never shame, always a road back */}
      {act > 0 && act < 7 && (
        <button type="button" className="cdb-honest" onClick={() => onSlip(track)}>
          It already happened — take me to the comeback
        </button>
      )}
    </div>
  );
}

/* the tape, played: dark ending drains color; clear ending floods dawn */
function TapePlayer({ dark, clear, side, onDark, onClear }) {
  return side === "dark" ? (
    <div className="cdb-tape cdb-tape--dark">
      <div className="cdb-tape-label cdb-tape-label--dark">ENDING ONE — IF YOU GIVE IN</div>
      <p className="cdb-tape-text">{dark}</p>
      <div className="cdb-tape-note">Watch it all the way to the morning after. Don't look away.</div>
      <button type="button" className="cdb-big-btn cdb-big-btn--dark" onClick={onDark}>
        NOW SHOW ME THE OTHER ENDING
      </button>
    </div>
  ) : (
    <div className="cdb-tape cdb-tape--clear">
      <div className="cdb-tape-label cdb-tape-label--clear">ENDING TWO — IF YOU RIDE IT OUT</div>
      <p className="cdb-tape-text">{clear}</p>
      <div className="cdb-tape-note">Where you are. Who's there. What it feels like in your body. Stay in it a beat longer.</div>
      <button type="button" className="cdb-big-btn" onClick={onClear}>
        THAT'S MY MOVIE
      </button>
    </div>
  );
}

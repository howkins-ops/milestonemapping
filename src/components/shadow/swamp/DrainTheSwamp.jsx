import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../../styles/drain-swamp.css";
import { SwampStage, Eyebrow, Heading, Lead, Science, Primary, Ghost, Chips, Fireflies } from "./swampShell.jsx";
import { scanForRisk, SafetyScreen } from "./safety.jsx";
import { sfxSplat, sfxBubble, sfxDrainLoop, sfxRainbow } from "../../../lib/sfx";

/* ════════════════════════════════════════════════════════════════════════
   DRAIN THE SWAMP — cinematic signature mode, now a 3-swamp campaign.

   1. Feed the swamp: name what you're carrying and THROW it in — each word
      arcs into the black water and sinks (affect labeling disguised as a
      throwing game; the release language in the toasts does quiet NLP work).
   2. Turn the valve: the whole landscape drains at 60fps off one --p custom
      property, and the words you threw dissolve with the water.
   3. The rainbow: every cleared swamp earns its sky. Three swamps —
      Stress, Rage, Doubt — each with its own palette and script.

   Contract: { onBack, onComplete } like every swamp mode. Free text is
   scanned with scanForRisk → SafetyScreen.
   ════════════════════════════════════════════════════════════════════════ */

const TURNS = 6; // full wheel rotations to open the gate
const TOTAL_RAD = TURNS * Math.PI * 2;
const MAX_STEP = 0.045; // rad per pointer event — enforces a slow, deliberate open
const MAX_THROWS = 8;

const LEVELS = [
  {
    key: "stress",
    title: "The Stress Swamp",
    eyebrow: "Swamp I · Stress",
    klass: "",
    intro: (
      <>
        Stress pools like flood-water — it doesn&rsquo;t drain on its own. <b>Someone has to open
        the gate.</b> First: everything that&rsquo;s flooding you goes IN the swamp. Throw it.
      </>
    ),
    science:
      "Naming a stressor and physically 'placing' it outside you (affect labeling + externalization) measurably calms the amygdala. The slow exhales you'll pace with each valve turn engage the vagal brake. The relief is real, not decorative.",
    emotions: ["Overwhelm", "Pressure", "Deadlines", "Everyone needs me", "No time", "Tight chest", "Can't switch off", "Money worry"],
    beats: [
      "Grip the wheel. Turn slowly — one long exhale per pull.",
      "The gate groans open. Everything you threw in is already moving toward it.",
      "The level is dropping. Notice the pressure dropping with it.",
      "Halfway. Your shoulders already know what to do — let them fall.",
      "Light is breaking through. It finds you easier now, doesn't it?",
      "Nearly clear. What you carried in here is just water now — leaving.",
    ],
  },
  {
    key: "rage",
    title: "The Rage Bog",
    eyebrow: "Swamp II · Anger",
    klass: "dts-scene--rage",
    intro: (
      <>
        This one runs hot. Every grudge, every &ldquo;are you KIDDING me&rdquo;, every slow-burn
        resentment — <b>throw it in the bog where it can boil without burning anyone.</b>
      </>
    ),
    science:
      "Anger discharged at a symbol (not a person) while the body stays slow teaches the nervous system that the heat can move THROUGH you without running you. Throw hard. Turn slow.",
    emotions: ["Rage", "Resentment", "Disrespect", "They lied", "NOT fair", "Betrayed", "Being ignored", "That one person"],
    beats: [
      "Grip the wheel. The heat wants OUT — give it the gate, not the people.",
      "The gate groans open. The boiling starts to move.",
      "The level is dropping. Every word you threw is dissolving into steam.",
      "Halfway. The fire is fuel now — not the driver.",
      "The red is running out of the water. Cooler with every turn.",
      "Nearly clear. Anger arrived as a flood — watch it leave as a stream.",
    ],
  },
  {
    key: "doubt",
    title: "The Doubt Marsh",
    eyebrow: "Swamp III · Doubt",
    klass: "dts-scene--doubt",
    intro: (
      <>
        The quietest swamp and the deepest. The &ldquo;who am I kidding&rdquo; voice, the imposter
        whispers — <b>they only survive inside your head. Out here, they sink.</b>
      </>
    ),
    science:
      "Seeing a thought as an OBJECT you can throw (cognitive defusion) breaks the fusion between you and the story. A doubt in the water is just words. You are the one holding the wheel.",
    emotions: ["Not enough", "Imposter", "What if I fail", "They'll laugh", "Too late for me", "I always quit", "Who am I kidding", "Not smart enough"],
    beats: [
      "Grip the wheel. Doubt hates motion — keep turning.",
      "The gate groans open. The whispers drain first.",
      "The level is dropping. Those old stories are losing their grip.",
      "Halfway. The fog thins — you can see further than you could.",
      "Light is breaking through. It was there the whole time, above the fog.",
      "Nearly clear. Who are you without that story? Keep turning. Find out.",
    ],
  },
];

// Release lines — rotate as each feeling hits the water. Quiet NLP: presuppose
// the letting-go already happened, direct attention to the space it leaves.
const TOSS_LINES = [
  "Thrown. It's the swamp's problem now.",
  "The water closes over it. Feel the hand that let go.",
  "Sinking. What you can name, you no longer have to carry.",
  "Gone. Notice the space where it used to sit.",
  "The swamp eats these for breakfast. Keep going.",
  "That one's been heavy long enough. Down it goes.",
];

const FEELINGS = [
  { id: "lighter", emoji: "🪶", label: "Lighter" },
  { id: "calmer", emoji: "🌿", label: "Calmer" },
  { id: "clearer", emoji: "💠", label: "Clearer" },
  { id: "steadier", emoji: "⚓", label: "Steadier" },
  { id: "heavy", emoji: "🪨", label: "Still heavy — honest" },
];

function beatIndexFor(p, beats) {
  const AT = [0, 0.12, 0.3, 0.5, 0.7, 0.88];
  let idx = 0;
  for (let i = 0; i < beats.length; i++) if (p >= AT[i]) idx = i;
  return idx;
}

function buzz(pattern) {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch {
    /* no haptics */
  }
}

/* Dead tree that greens up as --p rises (foliage opacity lives in CSS). */
function Tree({ flip = false, className = "" }) {
  return (
    <svg
      className={`dts-tree ${className}`}
      viewBox="0 0 100 140"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden
    >
      <path
        className="dts-tree__wood"
        d="M48 140 L46 96 Q45 84 36 76 L20 60 L34 68 Q44 74 46 66 L47 40 L42 22 L49 34 L52 12 L55 34 L62 20 L57 44 Q56 60 64 58 L82 46 L68 62 Q56 72 55 86 L54 140 Z"
      />
      <g className="dts-tree__leaves">
        <circle cx="30" cy="56" r="17" />
        <circle cx="52" cy="24" r="19" />
        <circle cx="74" cy="46" r="15" />
        <circle cx="50" cy="46" r="14" />
      </g>
    </svg>
  );
}

/* The industrial valve wheel (SVG, rotated via --rot). */
function ValveWheel() {
  return (
    <svg className="dts-wheel__svg" viewBox="0 0 120 120" aria-hidden>
      <defs>
        <linearGradient id="dts-rim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7de8cf" />
          <stop offset="0.5" stopColor="#1e6b58" />
          <stop offset="1" stopColor="#0b3b2e" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="50" fill="none" stroke="url(#dts-rim)" strokeWidth="9" />
      <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(0,255,191,0.35)" strokeWidth="1.5" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <g key={a} transform={`rotate(${a} 60 60)`}>
          <rect x="57.2" y="14" width="5.6" height="46" rx="2.8" fill="url(#dts-rim)" />
          <circle cx="60" cy="12" r="5" fill="#0e4a3a" stroke="rgba(0,255,191,0.5)" strokeWidth="1.4" />
        </g>
      ))}
      <circle cx="60" cy="60" r="15" fill="#0b2e24" stroke="rgba(0,255,191,0.65)" strokeWidth="2" />
      <circle cx="60" cy="60" r="5.5" fill="rgba(0,255,191,0.85)" />
    </svg>
  );
}

/* The living scene. Everything reads --p (0..1) from the scene element. */
function SwampScene({ sceneRef, wheelHandlers, wheelRef, draining, initialP = 0, klass = "", thrown = [], showWheel = true, rainbow = false }) {
  return (
    <div
      className={`dts-scene ${klass} ${draining ? "is-live" : ""}`}
      ref={sceneRef}
      style={{ "--p": initialP, "--rot": initialP * TOTAL_RAD }}
    >
      {/* sky: clear dawn beneath, murk cross-fading away above it */}
      <div className="dts-sky dts-sky--clear" />
      <div className="dts-sky dts-sky--murky" />
      <div className="dts-sun" />
      <div className="dts-rays" />

      {/* every drained swamp earns its rainbow */}
      {rainbow && <div className="dts-rainbow" aria-hidden />}

      {/* birds return near the end */}
      <span className="dts-bird dts-bird--a" aria-hidden>🕊️</span>
      <span className="dts-bird dts-bird--b" aria-hidden>🕊️</span>

      {/* treeline */}
      <Tree className="dts-tree--l" />
      <Tree className="dts-tree--r" flip />

      {/* riverbed + flora revealed as water falls */}
      <div className="dts-bed" />
      <div className="dts-flora" aria-hidden>
        {[
          { e: "🌱", t: 0.45 }, { e: "🌿", t: 0.55 }, { e: "🌸", t: 0.68 },
          { e: "🌼", t: 0.76 }, { e: "🦋", t: 0.84 }, { e: "🌷", t: 0.9 },
          { e: "🍀", t: 0.6 }, { e: "🌺", t: 0.8 },
        ].map((f, i) => (
          <i key={i} style={{ "--t": f.t, "--fi": i }}>{f.e}</i>
        ))}
      </div>

      {/* water: murky body scales down, clear water fades in beneath the surface */}
      <div className="dts-water">
        <div className="dts-water__clear" />
        <div className="dts-water__murky" />
        <div className="dts-water__shimmer" />
        <div className="dts-debris" aria-hidden>
          <span style={{ "--dxi": 0 }}>🪵</span>
          <span style={{ "--dxi": 1 }}>🥾</span>
          <span style={{ "--dxi": 2 }}>🛞</span>
          <span style={{ "--dxi": 3 }}>🪣</span>
        </div>
      </div>

      {/* the feelings you fed it — they bob in the murk, then drain out with it */}
      <div className="dts-toss" aria-hidden>
        {thrown.map((w) => (
          <React.Fragment key={w.id}>
            <span
              className={w.fresh ? "is-flying" : "is-sunk"}
              style={{ "--tx": `${w.tx}%`, "--ty": `${w.ty}%` }}
            >
              {w.text}
            </span>
            {w.fresh && <i style={{ "--tx": `${w.tx}%`, "--ty": `${w.ty}%` }} />}
          </React.Fragment>
        ))}
      </div>

      {/* fog banks */}
      <div className="dts-fog dts-fog--a" />
      <div className="dts-fog dts-fog--b" />

      {/* floodgate + outflow */}
      <div className="dts-gate">
        <div className="dts-gate__frame" />
        <div className="dts-gate__door" />
        <div className="dts-gate__flow" />
      </div>

      {/* the wheel */}
      {showWheel && (
        <div
          className="dts-wheel"
          ref={wheelRef}
          role="slider"
          aria-label="Floodgate valve — turn clockwise to drain the swamp"
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
          {...wheelHandlers}
        >
          <ValveWheel />
        </div>
      )}

      <div className="dts-vignette" />
    </div>
  );
}

export default function DrainTheSwamp({ onBack, onComplete }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [phase, setPhase] = useState("arrive"); // arrive | toss | drain | clear
  const [before, setBefore] = useState(6);
  const [after, setAfter] = useState(3);
  const [feeling, setFeeling] = useState(null);
  const [beat, setBeat] = useState(0);
  const [pct, setPct] = useState(0); // coarse display % (updates ~per beat, cheap)
  const [thrown, setThrown] = useState([]); // {id, text, tx, ty, fresh}
  const [tossToast, setTossToast] = useState(null);
  const [custom, setCustom] = useState("");
  const [risk, setRisk] = useState(null);
  const [clearedCount, setClearedCount] = useState(0);
  const [totalThrown, setTotalThrown] = useState(0);

  const sceneRef = useRef(null);
  const wheelRef = useRef(null);
  const pRef = useRef(0);
  const lastAngle = useRef(null);
  const doneRef = useRef(false);
  const tossId = useRef(0);
  const drainLoop = useRef(null);

  useEffect(() => () => drainLoop.current?.stop(), []);

  const level = LEVELS[levelIdx];
  const chipOptions = useMemo(
    () => level.emotions.filter((e) => !thrown.some((w) => w.text === e)),
    [level, thrown]
  );

  /* ── feed the swamp ── */
  const throwIn = (text) => {
    if (!text.trim() || thrown.length >= MAX_THROWS) return;
    const scan = scanForRisk(text);
    if (scan.risk) {
      setRisk(scan.kind);
      return;
    }
    const id = tossId.current++;
    const word = {
      id,
      text: text.trim(),
      tx: 14 + ((id * 37) % 70), // deterministic spread across the water
      ty: 60 + ((id * 23) % 24),
      fresh: true,
    };
    setThrown((prev) => [...prev, word]);
    setTotalThrown((n) => n + 1);
    setTossToast(TOSS_LINES[id % TOSS_LINES.length]);
    buzz(12);
    window.setTimeout(() => sfxSplat(), 520);
    window.setTimeout(() => {
      setThrown((prev) => prev.map((w) => (w.id === id ? { ...w, fresh: false } : w)));
    }, 1000);
  };

  const throwCustom = () => {
    throwIn(custom);
    setCustom("");
  };

  /* ── the drain ── */
  const apply = (nextP) => {
    pRef.current = nextP;
    const el = sceneRef.current;
    if (el) {
      el.style.setProperty("--p", String(nextP));
      el.style.setProperty("--rot", String(nextP * TOTAL_RAD));
    }
    const idx = beatIndexFor(nextP, level.beats);
    setBeat((prev) => {
      if (idx !== prev) {
        buzz(10);
        sfxBubble();
      }
      return idx;
    });
    setPct((prev) => {
      const coarse = Math.floor(nextP * 20) * 5; // 5% steps — cheap re-render cadence
      return coarse !== prev ? coarse : prev;
    });
    if (nextP >= 1 && !doneRef.current) {
      doneRef.current = true;
      buzz([28, 50, 28, 50, 60]);
      drainLoop.current?.stop();
      drainLoop.current = null;
      window.setTimeout(() => {
        setPhase("clear");
        setClearedCount((n) => n + 1);
        sfxRainbow();
      }, 1400);
    }
  };

  const angleAt = (e) => {
    const rect = wheelRef.current.getBoundingClientRect();
    return Math.atan2(e.clientY - (rect.top + rect.height / 2), e.clientX - (rect.left + rect.width / 2));
  };

  const wheelHandlers = {
    onPointerDown: (e) => {
      if (doneRef.current) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      lastAngle.current = angleAt(e);
      if (!drainLoop.current) {
        drainLoop.current = sfxDrainLoop();
        drainLoop.current.setLevel(0.2);
      }
    },
    onPointerMove: (e) => {
      if (lastAngle.current == null || doneRef.current) return;
      const a = angleAt(e);
      let d = a - lastAngle.current;
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      lastAngle.current = a;
      if (d <= 0) return; // clockwise opens the gate
      apply(Math.min(1, pRef.current + Math.min(d, MAX_STEP) / TOTAL_RAD));
    },
    onPointerUp: () => {
      lastAngle.current = null;
      drainLoop.current?.stop();
      drainLoop.current = null;
    },
    onPointerCancel: () => {
      lastAngle.current = null;
      drainLoop.current?.stop();
      drainLoop.current = null;
    },
    onKeyDown: (e) => {
      if (doneRef.current) return;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        apply(Math.min(1, pRef.current + 0.12 / TOTAL_RAD * Math.PI * 2));
      }
    },
    "aria-valuenow": pct,
  };

  const startLevel = (idx) => {
    doneRef.current = false;
    pRef.current = 0;
    drainLoop.current?.stop();
    drainLoop.current = null;
    setLevelIdx(idx);
    setBeat(0);
    setPct(0);
    setFeeling(null);
    setThrown([]);
    setTossToast(null);
    setCustom("");
    setBefore(6);
    setAfter(3);
    setPhase("arrive");
  };

  const seal = () => {
    drainLoop.current?.stop();
    const feelLabel = (FEELINGS.find((f) => f.id === feeling) || {}).label || "Lighter";
    const names = LEVELS.slice(0, Math.max(1, clearedCount)).map((l) => l.title).join(", ");
    onComplete(
      `Drained ${clearedCount || 1} swamp${clearedCount > 1 ? "s" : ""} (${names}) — fed it ${totalThrown} feelings · intensity ${before}→${after} · left feeling ${feelLabel.toLowerCase()}`
    );
  };

  if (risk) {
    return <SafetyScreen kind={risk} onClose={() => setRisk(null)} />;
  }

  /* ── ARRIVE ── */
  if (phase === "arrive") {
    return (
      <SwampStage title="Drain the Swamp" onClose={onBack} total={LEVELS.length} active={levelIdx}>
        <div className="sv-center">
          <Eyebrow>{level.eyebrow}</Eyebrow>
          <Heading>{level.title}</Heading>
          <Lead>{level.intro}</Lead>
          <Science>{level.science}</Science>
          <div className="dts-rate">
            <span className="dts-rate__label">How flooded are you right now?</span>
            <div className="sv-intensity">
              <input type="range" min="1" max="10" value={before} onChange={(e) => setBefore(Number(e.target.value))} />
              <span className="sv-intensity__num">{before}</span>
            </div>
          </div>
          <Primary onClick={() => setPhase("toss")}>Walk to the swamp →</Primary>
        </div>
      </SwampStage>
    );
  }

  /* ── TOSS — feed the swamp before you drain it ── */
  if (phase === "toss") {
    return (
      <SwampStage title="Drain the Swamp" onClose={onBack} total={LEVELS.length} active={levelIdx}>
        <div className="sv-pane">
          <div className="dts-hud">
            <span className="dts-hud__label">Feed the swamp</span>
            <span className="dts-hud__pct">{thrown.length}/{MAX_THROWS}</span>
          </div>
          <SwampScene sceneRef={sceneRef} wheelRef={wheelRef} wheelHandlers={{}} draining={false} klass={level.klass} thrown={thrown} showWheel={false} />
          <p className="dts-beat" key={tossToast || "hint"}>
            {tossToast || "Tap what you're carrying. Throw it in. It can't swim."}
          </p>
          <Chips options={chipOptions} value={null} onChange={throwIn} sm />
          <div className="dts-throwbar">
            <input
              className="dts-throwbar__input"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") throwCustom(); }}
              placeholder="…or name it in your own words"
              maxLength={48}
            />
            <button className="dts-throwbar__btn" onClick={throwCustom} disabled={!custom.trim() || thrown.length >= MAX_THROWS}>
              Throw 🪨
            </button>
          </div>
          <Primary onClick={() => setPhase("drain")} disabled={thrown.length === 0}>
            That&rsquo;s everything. Open the floodgate →
          </Primary>
        </div>
      </SwampStage>
    );
  }

  /* ── CLEAR ── */
  if (phase === "clear") {
    const lastLevel = levelIdx >= LEVELS.length - 1;
    return (
      <SwampStage title="Drain the Swamp" onClose={onBack} total={LEVELS.length} active={levelIdx}>
        <div className="sv-pane">
          <SwampScene sceneRef={sceneRef} wheelRef={wheelRef} wheelHandlers={{}} draining={false} initialP={1} klass={level.klass} rainbow />
          <div className="sv-center" style={{ position: "relative" }}>
            <Fireflies />
            <Eyebrow>Gate open · Rainbow earned</Eyebrow>
            <Heading>{lastLevel && clearedCount >= LEVELS.length ? "All three swamps. Drained." : `${level.title} is clear.`}</Heading>
            <Lead>
              Same place — different water. Everything you fed it went out with the flood.
              Where&rsquo;s the level now?
            </Lead>
            <div className="sv-intensity">
              <input type="range" min="1" max="10" value={after} onChange={(e) => setAfter(Number(e.target.value))} />
              <span className="sv-intensity__num">{after}</span>
            </div>
            <Chips options={FEELINGS} value={feeling} onChange={setFeeling} sm />
            <Primary onClick={seal}>Seal it →</Primary>
            {!lastLevel && (
              <Ghost onClick={() => startLevel(levelIdx + 1)}>
                Next: {LEVELS[levelIdx + 1].title} →
              </Ghost>
            )}
            {lastLevel && <Ghost onClick={() => startLevel(0)}>Run the swamps again</Ghost>}
          </div>
        </div>
      </SwampStage>
    );
  }

  /* ── DRAIN ── */
  return (
    <SwampStage title="Drain the Swamp" onClose={onBack} total={LEVELS.length} active={levelIdx}>
      <div className="sv-pane">
        <div className="dts-hud">
          <span className="dts-hud__label">Draining: {level.title}</span>
          <span className="dts-hud__pct">{pct}%</span>
        </div>
        <SwampScene key={`live-${levelIdx}`} sceneRef={sceneRef} wheelRef={wheelRef} wheelHandlers={wheelHandlers} draining klass={level.klass} thrown={thrown} />
        <p className="dts-beat" key={beat}>{level.beats[beat]}</p>
      </div>
    </SwampStage>
  );
}

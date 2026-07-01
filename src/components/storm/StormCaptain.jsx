import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  STORMS, LEAK_TYPES, patchTypeForLeak, BODY_SIGNALS, FEELINGS, VALUES,
  CLEAN_ACTIONS, DECOY_ACTIONS, COACH_LINES, coachLine, LEVELS, getLevel,
  getNextLevel, BADGES, DAILY_CHALLENGES, dailyChallenge, buildCustomStorm,
  scanForCrisis, TUNE, XP,
} from "./stormData.js";
import "./StormCaptain.css";

// ─── Storage ────────────────────────────────────────────────────────────────
const KEY = "storm_captain";
const today = () => new Date().toISOString().split("T")[0];
const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function loadState() {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || "null"); } catch { saved = null; }
  const base = {
    xp: 0, voyages: 0, streak: 0, bestStreak: 0, lastDate: null, bestDrop: 0,
    badges: [], seenOnboarding: false,
    counters: { anchor: 0, pump: 0, patch: 0, whirlpool: 0, compass: 0, cleanActions: 0, breaths: 0, buckets: 0, noCannonWins: 0, cannonFires: 0, urges: 0, emergencies: 0 },
    stormCounts: {}, leakCounts: {}, valueCounts: {}, patchTypeCounts: {},
    log: [],
  };
  if (!saved) return base;
  // streak roll-over
  let { streak = 0, bestStreak = 0, lastDate } = saved;
  if (lastDate) {
    const diff = Math.round((new Date(today()) - new Date(lastDate)) / 86400000);
    if (diff > 1) streak = 0;
  }
  return {
    ...base, ...saved,
    counters: { ...base.counters, ...(saved.counters || {}) },
    stormCounts: saved.stormCounts || {},
    leakCounts: saved.leakCounts || {},
    valueCounts: saved.valueCounts || {},
    patchTypeCounts: saved.patchTypeCounts || {},
    log: saved.log || [],
    streak, bestStreak,
  };
}
function saveState(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }

// ─── Ship SVG (water fill scales with `water`) ───────────────────────────────
function ShipStage({ water, storm, className = "" }) {
  const w = clamp(water);
  // water surface Y inside the hull: full hull spans y 96..150
  const surfaceY = 150 - (54 * w) / 100;
  const raging = storm > 60;
  return (
    <svg className={`sc-ship-svg ${className}`} viewBox="0 0 300 210" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <defs>
        <linearGradient id="sc-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0077aa" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="sc-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a3a55" />
          <stop offset="100%" stopColor="#041824" />
        </linearGradient>
        <clipPath id="sc-hull-clip">
          <path d="M60 96 L240 96 L222 150 Q210 168 150 168 Q90 168 78 150 Z" />
        </clipPath>
        <filter id="sc-glow"><feGaussianBlur stdDeviation="2.4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>

      {/* sea behind ship */}
      <path d="M0 150 Q75 138 150 150 T300 150 L300 210 L0 210 Z" fill="url(#sc-sea)" opacity="0.85" />
      <path d="M0 158 Q75 148 150 158 T300 158 L300 210 L0 210 Z" fill="#03141d" opacity="0.9" />

      {/* mast + sail */}
      <line x1="150" y1="30" x2="150" y2="98" stroke="#6b5638" strokeWidth="4" strokeLinecap="round" />
      <path d="M150 34 Q186 54 150 88 Z" fill={raging ? "#5a2030" : "#123a4a"} stroke={raging ? "#FF3B5C" : "#00F0FF"} strokeWidth="1.5" opacity="0.9" />
      <circle cx="150" cy="28" r="4" fill={raging ? "#FF3B5C" : "#00FFBF"} filter="url(#sc-glow)" />

      {/* hull outline */}
      <path d="M60 96 L240 96 L222 150 Q210 168 150 168 Q90 168 78 150 Z"
        fill="#0c0716" stroke={raging ? "#FF3B5C" : "#00F0FF"} strokeWidth="2.5" filter="url(#sc-glow)" />

      {/* water inside hull */}
      <g clipPath="url(#sc-hull-clip)">
        <rect x="55" y={surfaceY} width="190" height="80" fill="url(#sc-water)" />
        <path d={`M40 ${surfaceY} Q95 ${surfaceY - 5} 150 ${surfaceY} T260 ${surfaceY} L260 ${surfaceY + 12} L40 ${surfaceY + 12} Z`}
          fill="rgba(0,240,255,0.5)" />
      </g>

      {/* deck line */}
      <line x1="60" y1="96" x2="240" y2="96" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Meter ───────────────────────────────────────────────────────────────────
function Meter({ label, value, color, danger, invert }) {
  const v = clamp(Math.round(value));
  return (
    <div className={`sc-meter ${danger ? "sc-meter--danger" : ""}`} style={{ "--mc": color }}>
      <div className="sc-meter__top">
        <span className="sc-meter__lbl">{label}</span>
        <span className="sc-meter__val">{v}</span>
      </div>
      <div className="sc-meter__track">
        <div className="sc-meter__fill" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

// ─── Breathing pump modal ────────────────────────────────────────────────────
function BreathPump({ onComplete, onClose }) {
  const [phase, setPhase] = useState("ready"); // ready|in|hold|out|done
  const timer = useRef(null);
  const run = useCallback(() => {
    setPhase("in");
    timer.current = setTimeout(() => {
      setPhase("hold");
      timer.current = setTimeout(() => {
        setPhase("out");
        timer.current = setTimeout(() => {
          setPhase("done");
          onComplete();
        }, 6000);
      }, 1400);
    }, 4000);
  }, [onComplete]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const label = phase === "in" ? "Breathe in…" : phase === "hold" ? "Hold…" : phase === "out" ? "Long exhale…" : phase === "done" ? "Water out." : "Ready?";
  return (
    <div className="sc-modal" onClick={phase === "ready" || phase === "done" ? onClose : undefined}>
      <div className="sc-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sc-sheet__handle" />
        <h3 className="sc-sheet__title">🌬️ The Pump</h3>
        <p className="sc-sheet__sub">Breathe out longer than you breathe in. The water pumps with the exhale.</p>
        <div className="sc-breath">
          <div className={`sc-breath__orb sc-breath__orb--${phase === "ready" || phase === "done" ? "out" : phase}`}>{label}</div>
          <div className="sc-breath__count">
            {phase === "in" ? "in · 4" : phase === "hold" ? "hold" : phase === "out" ? "out · 6" : ""}
          </div>
        </div>
        {phase === "ready" && <button type="button" className="sc-btn" onClick={run}>Start breath</button>}
        {phase === "done" && <button type="button" className="sc-btn" onClick={onClose}>Done — back to the wheel</button>}
        {(phase === "in" || phase === "hold" || phase === "out") && (
          <p className="sc-hint" style={{ textAlign: "center" }}>Follow the orb…</p>
        )}
      </div>
    </div>
  );
}

// ─── Name-the-feeling modal ──────────────────────────────────────────────────
function NameFeeling({ onComplete, onClose }) {
  const [sel, setSel] = useState([]);
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < 3 ? [...s, id] : s));
  return (
    <div className="sc-modal" onClick={onClose}>
      <div className="sc-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sc-sheet__handle" />
        <h3 className="sc-sheet__title">🔔 Ring the Bell</h3>
        <p className="sc-sheet__sub">Name what's really here. Naming a feeling shrinks the storm.</p>
        <div className="sc-chips">
          {FEELINGS.map((f) => (
            <button key={f.id} type="button" className={`sc-chip ${sel.includes(f.id) ? "is-on" : ""}`}
              style={{ "--tc": "#FF3EDB" }} onClick={() => toggle(f.id)}>
              <span>{f.emoji}</span>{f.label}
            </button>
          ))}
        </div>
        <button type="button" className="sc-btn" style={{ marginTop: 16 }}
          disabled={!sel.length} onClick={() => onComplete(sel)}>
          {sel.length ? `Name it (${sel.length})` : "Pick what you feel"}
        </button>
      </div>
    </div>
  );
}

// ─── Patch modal ─────────────────────────────────────────────────────────────
function PatchModal({ leak, onPatched, onWrong, onClose }) {
  const [picked, setPicked] = useState(null);
  const correct = leak.type;
  const options = useMemo(() => {
    const others = Object.keys(LEAK_TYPES).filter((k) => k !== correct);
    return shuffle([correct, ...shuffle(others).slice(0, 3)]);
  }, [correct, leak.id]);

  const choose = (id) => {
    if (picked) return;
    setPicked(id);
    setTimeout(() => {
      if (id === correct) onPatched(leak);
      else onWrong(leak);
    }, 750);
  };
  return (
    <div className="sc-modal" onClick={picked ? undefined : onClose}>
      <div className="sc-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sc-sheet__handle" />
        <h3 className="sc-sheet__title">🔧 Patch the Leak</h3>
        <p className="sc-sheet__sub">“{leak.label}” — what does this leak actually need? Bailing water won't seal it.</p>
        {options.map((id) => {
          const t = LEAK_TYPES[id];
          const state = picked ? (id === correct ? "right" : id === picked ? "wrong" : "") : "";
          return (
            <button key={id} type="button" className={`sc-patch-opt ${state ? "sc-patch-opt--" + state : ""}`} onClick={() => choose(id)}>
              <span className="sc-patch-opt__emoji">{t.emoji}</span>
              <span className="sc-patch-opt__body">
                <span className="sc-patch-opt__name">{t.patch}</span>
                <span className="sc-patch-opt__hint">{t.hint}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Compass modal ───────────────────────────────────────────────────────────
function CompassModal({ onComplete, onClose }) {
  return (
    <div className="sc-modal" onClick={onClose}>
      <div className="sc-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sc-sheet__handle" />
        <h3 className="sc-sheet__title">🧭 The Compass</h3>
        <p className="sc-sheet__sub">The sea has settled. What value steers your next move?</p>
        <div className="sc-chips">
          {VALUES.map((v) => (
            <button key={v.id} type="button" className="sc-chip" style={{ "--tc": "#FACC15" }} onClick={() => onComplete(v)}>
              <span>{v.emoji}</span>{v.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Sail (clean action) modal ───────────────────────────────────────────────
function SailModal({ storm, value, onComplete, onClose }) {
  const [warn, setWarn] = useState(null);
  const [key, setKey] = useState(0);
  const options = useMemo(() => {
    const pool = CLEAN_ACTIONS[storm.type] || CLEAN_ACTIONS.task;
    const good = pick(pool);
    const decoys = shuffle(DECOY_ACTIONS).slice(0, 2);
    return shuffle([{ text: good, clean: true }, ...decoys.map((d) => ({ text: d, clean: false }))]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storm.type, key]);

  const choose = (opt) => {
    if (opt.clean) onComplete(opt.text);
    else { setWarn(opt.text); setTimeout(() => { setWarn(null); setKey((k) => k + 1); }, 1600); }
  };
  return (
    <div className="sc-modal" onClick={onClose}>
      <div className="sc-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sc-sheet__handle" />
        <h3 className="sc-sheet__title">⛵ Set the Sail</h3>
        <p className="sc-sheet__sub">Steered by <b>{value?.emoji} {value?.label}</b> — choose one clean action. The other two are the storm talking.</p>
        {warn && <div className="sc-em-crisis" style={{ margin: "0 0 12px" }}>🌊 That's a wave, not a command. “{warn}” is the storm steering. Pick again — captain's choice.</div>}
        {options.map((opt, i) => (
          <button key={i} type="button" className="sc-sail-opt" onClick={() => choose(opt)}>{opt.text}</button>
        ))}
      </div>
    </div>
  );
}

// ─── VOYAGE — the core arcade loop ───────────────────────────────────────────
const URGE_LABELS = ["Send the angry text", "Yell", "Quit right now", "Prove them wrong", "Slam the door", "Post it online", "Keep arguing", "Ghost them"];
const WHIRL_THOUGHTS = ["“I should have said something.”", "“They disrespected me.”", "“This always happens.”", "“I'm behind.”", "“They don't care.”"];

function Voyage({ session, onWin, onEmergency, onQuit }) {
  const [st, setSt] = useState(() => {
    const s = session.storm;
    const intensity = session.intensity;
    const leakCount = intensity > 7 ? 3 : intensity > 4 ? 3 : 2;
    const chosen = shuffle(s.leaks).slice(0, leakCount);
    const leaks = chosen.map((label, i) => ({
      id: `lk${i}`,
      label,
      type: patchTypeForLeak(label, s.type),
      rate: rand(2.0, 2.9),
      patched: false,
      hidden: i === chosen.length - 1 && leakCount >= 3, // deepest leak is below-deck
    }));
    return {
      water: clamp(16 + intensity * 4),
      storm: clamp(intensity * 10),
      hull: 100,
      clarity: 0,
      leaks,
      anchorTicks: 0,
      urge: null, urgeTtl: 0,
      whirl: null,
      firedCannon: false,
      waterPeak: 16 + intensity * 4,
      value: null,
      used: [],
      floats: [],
      counts: { breaths: 0, anchors: 0, patches: 0, buckets: 0, names: 0, whirlEscapes: 0, urgesSurfed: 0, compass: 0, cannons: 0 },
      cd: { bucket: 0, anchor: 0, lantern: 0 },
      tick: 0,
    };
  });
  const [modal, setModal] = useState(null); // pump|name|patch|compass|sail
  const [patchLeak, setPatchLeak] = useState(null);
  const [coach, setCoach] = useState(coachLine(session.intensity + 17));
  const paused = modal !== null;
  const emergencyFired = useRef(false);
  const wonRef = useRef(false);
  const floatId = useRef(0);

  const mainPatched = st.leaks.some((l) => l.patched);
  const calm = st.storm <= TUNE.calmStorm && st.water <= TUNE.calmWater && mainPatched;
  const compassDone = !!st.value;

  const addFloat = useCallback((text) => {
    floatId.current += 1;
    const id = floatId.current;
    setSt((p) => ({ ...p, floats: [...p.floats, { id, text }] }));
    setTimeout(() => setSt((p) => ({ ...p, floats: p.floats.filter((f) => f.id !== id) })), 1050);
  }, []);

  // main tick loop
  useEffect(() => {
    if (paused || wonRef.current || emergencyFired.current) return;
    const iv = setInterval(() => {
      setSt((p) => {
        const anchored = p.anchorTicks > 0;
        const activeLeaks = p.leaks.filter((l) => !l.patched);
        // hidden leaks still leak (suppression) at reduced rate
        const inflow = anchored ? 0 : activeLeaks.reduce((s, l) => s + l.rate * (l.hidden ? 0.6 : 1), 0);
        let water = clamp(p.water + inflow - TUNE.passiveBail);
        // storm drifts up if flooded, eases if bailing well
        let storm = clamp(p.storm + (water > 72 ? 0.9 : water < 35 ? -0.6 : -0.1));
        const waterPeak = Math.max(p.waterPeak, water);
        const cd = {
          bucket: Math.max(0, p.cd.bucket - 1),
          anchor: Math.max(0, p.cd.anchor - 1),
          lantern: Math.max(0, p.cd.lantern - 1),
        };
        let { urge, urgeTtl, whirl, counts } = p;
        // urge lifecycle
        if (urge) {
          urgeTtl -= 1;
          if (urgeTtl <= 0) { urge = null; counts = { ...counts, urgesSurfed: counts.urgesSurfed + 1 }; }
        } else if (!anchored && storm > 40 && Math.random() < 0.14) {
          urge = { label: pick(URGE_LABELS), phase: "rising" }; urgeTtl = 4;
        }
        if (urge) urge = { ...urge, phase: urgeTtl >= 3 ? "rising" : urgeTtl === 2 ? "peak" : "fading" };
        // whirlpool spawn
        if (!whirl && storm > 45 && Math.random() < 0.1) whirl = pick(WHIRL_THOUGHTS);
        return { ...p, water, storm, waterPeak, anchorTicks: Math.max(0, p.anchorTicks - 1), cd, urge, urgeTtl, whirl, counts, tick: p.tick + 1 };
      });
    }, TUNE.tickMs);
    return () => clearInterval(iv);
  }, [paused]);

  // emergency watcher
  useEffect(() => {
    if (st.water >= 100 && !emergencyFired.current && !wonRef.current) {
      emergencyFired.current = true;
      onEmergency({ ...session, counts: st.counts, water: st.water });
    }
  }, [st.water]); // eslint-disable-line react-hooks/exhaustive-deps

  // coach reactions
  useEffect(() => {
    if (calm && !compassDone) setCoach("The sea is settling. Take the compass — choose your direction.");
  }, [calm, compassDone]);

  // ── tool handlers ──
  const bucket = () => {
    if (st.cd.bucket > 0) return;
    addFloat("−7 💧");
    setSt((p) => ({ ...p, water: clamp(p.water - TUNE.bucketDrain), storm: clamp(p.storm - TUNE.bucketStorm), cd: { ...p.cd, bucket: 2 }, used: p.used.includes("Bucket") ? p.used : [...p.used, "Bucket"], counts: { ...p.counts, buckets: p.counts.buckets + 1 } }));
  };
  const anchor = () => {
    if (st.cd.anchor > 0) return;
    setCoach("⚓ Anchor down. The inflow is frozen — you have a moment to choose.");
    addFloat("⚓ paused");
    setSt((p) => ({ ...p, anchorTicks: TUNE.anchorSeconds, storm: clamp(p.storm - TUNE.anchorStorm), whirl: null, urge: null, cd: { ...p.cd, anchor: 7 }, used: p.used.includes("Anchor") ? p.used : [...p.used, "Anchor"], counts: { ...p.counts, anchors: p.counts.anchors + 1, whirlEscapes: p.whirl ? p.counts.whirlEscapes + 1 : p.counts.whirlEscapes } }));
  };
  const lantern = () => {
    if (st.cd.lantern > 0) return;
    const hasHidden = st.leaks.some((l) => l.hidden && !l.patched);
    setCoach(hasHidden ? "🔦 There it is — water was coming from below deck. Hidden water still sinks ships." : "🔦 Nothing hidden below deck right now. Good.");
    addFloat("🔦 revealed");
    setSt((p) => ({ ...p, leaks: p.leaks.map((l) => ({ ...l, hidden: false })), cd: { ...p.cd, lantern: 4 }, used: p.used.includes("Lantern") ? p.used : [...p.used, "Lantern"] }));
  };
  const cannon = () => {
    setCoach("💥 Cannons don't scare the ocean. Feels powerful — then you're patching sails.");
    addFloat("💥 −hull");
    setSt((p) => ({ ...p, storm: clamp(p.storm - TUNE.cannonStormDip + TUNE.cannonRebound), hull: clamp(p.hull - TUNE.cannonHull), firedCannon: true, used: p.used.includes("Cannon") ? p.used : [...p.used, "Cannon"], counts: { ...p.counts, cannons: p.counts.cannons + 1 } }));
  };
  const tapUrge = () => {
    // obeying the urge at peak = damage
    setCoach("🌊 You acted on the wave. It felt like relief for a second, then more leaks.");
    addFloat("obeyed 😖");
    setSt((p) => ({ ...p, urge: null, urgeTtl: 0, storm: clamp(p.storm + 10), hull: clamp(p.hull - 8), leaks: p.leaks }));
  };
  const tapWhirl = () => {
    setCoach("🌀 Replaying it spins the whirlpool faster. Name it or anchor to break the loop.");
    addFloat("+storm 🌀");
    setSt((p) => ({ ...p, storm: clamp(p.storm + TUNE.whirlpoolStorm) }));
  };

  const openPatch = (leak) => {
    if (leak.patched || leak.hidden) return;
    setPatchLeak(leak);
    setModal("patch");
  };
  const onPatched = (leak) => {
    setModal(null); setPatchLeak(null);
    setCoach(`✅ ${LEAK_TYPES[leak.type].patch} — sealed. That's the source, not just the symptom.`);
    setSt((p) => ({
      ...p,
      leaks: p.leaks.map((l) => (l.id === leak.id ? { ...l, patched: true, rate: 0 } : l)),
      clarity: clamp(p.clarity + TUNE.patchClarity),
      water: clamp(p.water - 4),
      used: p.used.includes("Patch") ? p.used : [...p.used, "Patch"],
      counts: { ...p.counts, patches: p.counts.patches + 1 },
    }));
  };
  const onWrong = (leak) => {
    setModal(null); setPatchLeak(null);
    setCoach("The quick fix didn't hold. The water came back — try the patch it actually needs.");
    setSt((p) => ({ ...p, water: clamp(p.water + TUNE.wrongPatchWater) }));
  };
  const onNamed = (feelings) => {
    setModal(null);
    const names = feelings.map((id) => FEELINGS.find((f) => f.id === id)?.label).filter(Boolean).join(" + ");
    setCoach(`You named it: ${names}. Now it's weather you can read, not a wave that reads you.`);
    setSt((p) => ({ ...p, storm: clamp(p.storm - TUNE.nameStorm), clarity: clamp(p.clarity + TUNE.nameClarity), whirl: null, used: p.used.includes("Name") ? p.used : [...p.used, "Name"], counts: { ...p.counts, names: p.counts.names + 1, whirlEscapes: p.whirl ? p.counts.whirlEscapes + 1 : p.counts.whirlEscapes } }));
  };
  const onBreath = () => {
    setSt((p) => ({ ...p, water: clamp(p.water - TUNE.pumpDrain), storm: clamp(p.storm - TUNE.pumpStorm), used: p.used.includes("Pump") ? p.used : [...p.used, "Pump"], counts: { ...p.counts, breaths: p.counts.breaths + 1 } }));
  };
  const onValue = (v) => {
    setModal(null);
    setCoach(`🧭 ${v.label}. That's your heading. Now set one clean sail.`);
    setSt((p) => ({ ...p, value: v, clarity: clamp(p.clarity + 20), used: p.used.includes("Compass") ? p.used : [...p.used, "Compass"], counts: { ...p.counts, compass: p.counts.compass + 1 } }));
  };
  const onSail = (action) => {
    if (wonRef.current) return;
    wonRef.current = true;
    setModal(null);
    const before = session.intensity;
    const after = clamp(Math.round(st.storm / 10), 0, 10);
    onWin({
      storm: session.storm,
      body: session.body,
      before,
      after,
      mainLeak: st.leaks[0]?.label,
      mainLeakType: st.leaks[0]?.type,
      value: st.value,
      action,
      firedCannon: st.firedCannon,
      hull: Math.round(st.hull),
      waterPeak: Math.round(st.waterPeak),
      used: st.used,
      counts: st.counts,
    });
  };

  const s = session.storm;
  const stormNorm = (st.storm / 100).toFixed(2);

  const tools = [
    { id: "bucket", icon: "🪣", name: "Bail", color: "#00F0FF", onClick: bucket, disabled: st.cd.bucket > 0, cd: st.cd.bucket },
    { id: "pump", icon: "🌬️", name: "Pump", color: "#00FFBF", onClick: () => setModal("pump") },
    { id: "anchor", icon: "⚓", name: "Anchor", color: "#FACC15", onClick: anchor, disabled: st.cd.anchor > 0, cd: st.cd.anchor, hot: !!st.urge || !!st.whirl },
    { id: "name", icon: "🔔", name: "Name", color: "#FF3EDB", onClick: () => setModal("name") },
    { id: "patch", icon: "🔧", name: "Patch", color: "#00FFBF", onClick: () => { const t = st.leaks.find((l) => !l.patched && !l.hidden); if (t) openPatch(t); else setCoach("No open leaks to patch. If it still feels leaky, try the lantern."); } },
    { id: "lantern", icon: "🔦", name: "Lantern", color: "#FFB000", onClick: lantern, disabled: st.cd.lantern > 0, cd: st.cd.lantern },
    { id: "compass", icon: "🧭", name: "Compass", color: "#FACC15", onClick: () => calm ? setModal("compass") : setCoach("Compass spins in a storm. Bail below 42 and calm below 34 first, and patch a leak."), locked: !calm, badge: calm && !compassDone ? "!" : null },
    { id: "sail", icon: "⛵", name: "Sail", color: "#00F0FF", onClick: () => compassDone ? setModal("sail") : setCoach("Set your compass value first, then choose the sail."), locked: !compassDone },
  ];

  return (
    <div className="sc-voyage">
      {/* HUD */}
      <div className="sc-hud">
        <Meter label="Water" value={st.water} color={st.water > 75 ? "#FF3B5C" : "#00F0FF"} danger={st.water > 82} />
        <Meter label="Storm" value={st.storm} color={st.storm > 60 ? "#FF3B5C" : "#FF3EDB"} danger={st.storm > 80} />
        <Meter label="Hull" value={st.hull} color={st.hull < 40 ? "#FF3B5C" : "#00FFBF"} />
        <Meter label="Compass" value={st.clarity} color="#FACC15" />
      </div>

      {/* ship stage */}
      <div className={`sc-stage ${st.water > 70 ? "sc-stage--tilt" : ""}`} style={{ "--storm": stormNorm }}>
        <ShipStage water={st.water} storm={st.storm} />
        {st.floats.map((f) => <div key={f.id} className="sc-float">{f.text}</div>)}
        {st.urge && (
          <button type="button" className="sc-urge" onClick={tapUrge}>
            {st.urge.label}
            <span className="sc-urge__phase">urge · {st.urge.phase} — ride it, don't obey</span>
          </button>
        )}
        {st.whirl && (
          <button type="button" className="sc-whirl" onClick={tapWhirl}>🌀 {st.whirl}<br /><small>tap = replay (don't)</small></button>
        )}
        <div className="sc-stage__coach">{coach}</div>
      </div>

      {/* leaks */}
      <div className="sc-leaks">
        <div className="sc-leaks__title">Leaks flooding the ship — tap to patch the source</div>
        {st.leaks.map((l) => (
          <button key={l.id} type="button"
            className={`sc-leak ${l.patched ? "sc-leak--patched" : ""} ${l.hidden ? "sc-leak--hidden" : ""}`}
            onClick={() => openPatch(l)} disabled={l.patched}>
            <span className="sc-leak__drop">{l.patched ? "✅" : l.hidden ? "🕳️" : "💧"}</span>
            <span className="sc-leak__label">{l.hidden ? "Something below deck…" : l.label}</span>
            <span className="sc-leak__rate">{l.patched ? "sealed" : l.hidden ? "?" : `+${l.rate.toFixed(1)}/s`}</span>
          </button>
        ))}
      </div>

      {/* tool dock */}
      <div className="sc-dock">
        {tools.map((t) => (
          <button key={t.id} type="button"
            className={`sc-tool ${t.locked ? "sc-tool--locked" : ""} ${t.hot ? "sc-tool--hot" : ""} ${t.id === "cannon" ? "sc-tool--cannon" : ""}`}
            style={{ "--tc": t.color }} onClick={t.onClick} disabled={t.disabled}>
            {t.badge && <span className="sc-tool__badge">{t.badge}</span>}
            <span className="sc-tool__icon">{t.icon}</span>
            <span className="sc-tool__name">{t.name}</span>
            {t.cd > 0 && <span className="sc-tool__cd">{t.cd}</span>}
          </button>
        ))}
      </div>

      {/* tempting cannon */}
      <button type="button" className="sc-danger-link" onClick={cannon}>💥 Fire cannons at the storm (vent) — feels good, costs the hull</button>

      <div className="sc-menu-row" style={{ marginTop: 4 }}>
        <button type="button" className="sc-btn sc-btn--ghost" onClick={onQuit}>Leave voyage</button>
        <button type="button" className="sc-btn sc-btn--danger" onClick={() => onEmergency({ ...session, manual: true })}>I'm not safe right now</button>
      </div>
    </div>
  );
}

// ─── Emergency Harbor Mode ───────────────────────────────────────────────────
function EmergencyHarbor({ crisis, onClose }) {
  return (
    <div className="sc-emergency">
      <div className="sc-emergency__inner">
        <div className="sc-emergency__light" />
        <h2 className="sc-emergency__title">Emergency Harbor</h2>
        <p className="sc-emergency__sub">You're flooded. This isn't a game over — it's a safe harbor. The storm is loud. Let's get the ship steady before anything else.</p>

        {["Drop anchor. Put your phone, keys, and any weapon out of reach.",
          "Put distance between you and the person, vehicle, or substance in front of you.",
          "Breathe: in for 4, out for 8. Do it five times. Splash cold water if you can.",
          "Text or call one person you trust. Say: “I'm in a storm and need a minute.”",
          "Do not send the message. Do not drive angry. Do not make a permanent choice in temporary weather."].map((t, i) => (
          <div key={i} className="sc-em-step">
            <span className="sc-em-step__n">{i + 1}</span>
            <span className="sc-em-step__t">{t}</span>
          </div>
        ))}

        <div className="sc-em-crisis">
          {crisis
            ? <>If you might hurt yourself or someone else, reach a person now. <b>US &amp; Canada: call or text 988</b> (Suicide &amp; Crisis Lifeline). <b>UK &amp; ROI: Samaritans 116 123.</b> If someone is in immediate danger, <b>call 911 / your local emergency number.</b> You do not have to captain this alone.</>
            : <>If the storm gets dangerous — thoughts of harming yourself or someone else — reach out now. <b>988</b> (US/Canada call or text), <b>Samaritans 116 123</b> (UK/ROI), or <b>911</b> for immediate danger.</>}
        </div>

        <div className="sc-em-actions">
          <button type="button" className="sc-btn" onClick={onClose}>I've steadied. Return to harbor.</button>
        </div>
      </div>
    </div>
  );
}

// ─── Result screen ───────────────────────────────────────────────────────────
function ResultScreen({ result, xpGained, xpBits, newBadges, onDone }) {
  const drop = result.before - result.after;
  const st = STORMS.find((s) => s.id === result.storm) || { label: result.storm };
  const bodyLbl = BODY_SIGNALS.find((b) => b.id === result.body)?.label || "—";
  return (
    <div className="sc-result">
      <div className="sc-result__badge">{drop > 0 ? "⚓" : "🧭"}</div>
      <p className="sc-kicker" style={{ textAlign: "center" }}>Harbor reached</p>
      <h2 className="sc-h2" style={{ textAlign: "center" }}>You kept the wheel.</h2>

      <div className="sc-beforeafter">
        <div className="sc-ba__cell"><div className="sc-ba__num sc-ba__num--before">{result.before}</div><div className="sc-ba__lbl">Before</div></div>
        <div className="sc-ba__arrow">→</div>
        <div className="sc-ba__cell"><div className="sc-ba__num sc-ba__num--after">{result.after}</div><div className="sc-ba__lbl">After</div></div>
      </div>
      {drop > 0 && <p className="sc-sub" style={{ textAlign: "center", marginTop: -6 }}>Intensity down <b style={{ color: "#00FFBF" }}>{drop}</b> {drop === 1 ? "point" : "points"}.</p>}

      <div className="sc-recap">
        <div className="sc-recap__row"><span className="sc-recap__k">Storm</span><span className="sc-recap__v">{st.emoji} {st.label}</span></div>
        <div className="sc-recap__row"><span className="sc-recap__k">Felt in</span><span className="sc-recap__v">{bodyLbl}</span></div>
        <div className="sc-recap__row"><span className="sc-recap__k">Main leak</span><span className="sc-recap__v">{result.mainLeak || "—"}</span></div>
        <div className="sc-recap__row"><span className="sc-recap__k">Tools used</span><span className="sc-recap__v">{result.used?.filter((u) => u !== "Cannon").join(" · ") || "—"}</span></div>
        {result.value && <div className="sc-recap__row"><span className="sc-recap__k">Compass</span><span className="sc-recap__v">{result.value.emoji} {result.value.label}</span></div>}
        <div className="sc-recap__row"><span className="sc-recap__k">Clean action</span><span className="sc-recap__v" style={{ maxWidth: 210 }}>{result.action}</span></div>
      </div>

      <div className="sc-xpwrap">
        <span className="sc-xp-pill">+{xpGained} XP</span>
        {xpBits.map((b, i) => <span key={i} className="sc-xp-pill">{b}</span>)}
      </div>

      {newBadges.length > 0 && (
        <div className="sc-section">
          <p className="sc-kicker" style={{ textAlign: "center" }}>New badge{newBadges.length > 1 ? "s" : ""}</p>
          <div className="sc-badges">
            {newBadges.map((b) => (
              <div key={b.id} className="sc-badge is-on">
                <div className="sc-badge__icon">{b.icon}</div>
                <div className="sc-badge__name">{b.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="sc-coach" style={{ marginTop: 8 }}>
        <span className="sc-coach__face">🧑‍✈️</span>
        <span className="sc-coach__body">
          <span className="sc-coach__name">Captain Cal</span>
          <span className="sc-coach__line">{coachLine(result.before + (result.after || 0) + 43)}</span>
        </span>
      </div>

      <p className="sc-hint" style={{ textAlign: "center" }}>Your clean action is logged in the Captain's Log. Go do that one thing.</p>
      <button type="button" className="sc-btn" style={{ marginTop: 10 }} onClick={onDone}>Back to Home Harbor</button>
    </div>
  );
}

// ─── Captain's Log ───────────────────────────────────────────────────────────
function LogScreen({ state, onBack }) {
  const insights = useMemo(() => buildInsights(state), [state]);
  const earned = new Set(state.badges);
  return (
    <div>
      <button type="button" className="sc-back" onClick={onBack}>← Home Harbor</button>
      <p className="sc-kicker">Captain's Log</p>
      <h2 className="sc-h1">Your voyages</h2>
      <p className="sc-sub">Every storm you captain leaves a trail. Here's your weather pattern.</p>

      {insights.length > 0 && (
        <div className="sc-section">
          {insights.map((t, i) => <div key={i} className="sc-insight" dangerouslySetInnerHTML={{ __html: t }} />)}
        </div>
      )}

      <div className="sc-section">
        <p className="sc-kicker">Recent</p>
        {state.log.length === 0 && <div className="sc-empty">No voyages logged yet. Set sail from Home Harbor.</div>}
        {state.log.slice(0, 20).map((e, i) => {
          const s = STORMS.find((x) => x.id === e.storm);
          return (
            <div key={i} className="sc-log-entry">
              <div className="sc-log-entry__top">
                <span className="sc-log-entry__storm">{s?.emoji} {s?.label || e.storm}</span>
                <span className="sc-log-entry__date">{e.date}</span>
              </div>
              <div className="sc-log-entry__ba">Intensity {e.before} → <b>{e.after}</b>{e.value ? ` · 🧭 ${e.value}` : ""}</div>
              {e.action && <div className="sc-log-entry__action">“{e.action}”</div>}
            </div>
          );
        })}
      </div>

      <div className="sc-section">
        <p className="sc-kicker">Badges — {earned.size}/{BADGES.length}</p>
        <div className="sc-badges">
          {BADGES.map((b) => (
            <div key={b.id} className={`sc-badge ${earned.has(b.id) ? "is-on" : ""}`} title={b.desc}>
              <div className="sc-badge__icon">{earned.has(b.id) ? b.icon : "🔒"}</div>
              <div className="sc-badge__name">{b.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function buildInsights(state) {
  const out = [];
  const topStorm = Object.entries(state.stormCounts).sort((a, b) => b[1] - a[1])[0];
  if (topStorm && topStorm[1] >= 2) {
    const s = STORMS.find((x) => x.id === topStorm[0]);
    out.push(`You most often flood from <b>${s?.label || topStorm[0]}</b>. That's your home weather — worth watching.`);
  }
  const topLeak = Object.entries(state.leakCounts).sort((a, b) => b[1] - a[1])[0];
  if (topLeak && topLeak[1] >= 2) out.push(`Your recurring leak is <b>${topLeak[0]}</b>. Same hole, again and again — that one deserves a real patch.`);
  const topValue = Object.entries(state.valueCounts).sort((a, b) => b[1] - a[1])[0];
  if (topValue && topValue[1] >= 2) out.push(`Your compass keeps pointing to <b>${topValue[0].charAt(0).toUpperCase() + topValue[0].slice(1)}</b>. That's what you steer by.`);
  if (state.counters.pump >= 5) out.push(`You regulate fastest when you use the <b>pump breath</b> — ${state.counters.pump} breaths logged.`);
  if (state.bestDrop >= 3) out.push(`Your biggest calm was a <b>${state.bestDrop}-point</b> intensity drop in one voyage. You've done it before — you can do it again.`);
  if (out.length === 0 && state.voyages > 0) out.push(`Keep sailing — after a few voyages, your patterns show up here.`);
  return out;
}

// ─── Custom Storm creator ────────────────────────────────────────────────────
function CustomStorm({ onSail, onEmergency, onBack }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const analyze = () => {
    if (scanForCrisis(text)) { onEmergency(true); return; }
    setResult(buildCustomStorm(text));
  };
  return (
    <div>
      <button type="button" className="sc-back" onClick={onBack}>← Home Harbor</button>
      <p className="sc-kicker">Custom Storm</p>
      <h2 className="sc-h1">Name your storm</h2>
      <p className="sc-sub">Type what's got you angry or overwhelmed. Captain Cal turns it into weather you can sail — real people become symbolic sea-forms, never targets.</p>

      <textarea className="sc-log-entry" style={{ width: "100%", minHeight: 90, resize: "vertical", color: "var(--text-main)", background: "rgba(255,255,255,0.03)", fontFamily: "inherit", fontSize: "0.95rem", padding: 14 }}
        value={text} onChange={(e) => setText(e.target.value)} placeholder="I'm angry because…" />
      <button type="button" className="sc-btn" style={{ marginTop: 10 }} disabled={!text.trim()} onClick={analyze}>Read the weather</button>

      {result && (
        <div className="sc-section" style={{ marginTop: 18 }}>
          <div className="sc-recap">
            <div className="sc-recap__row"><span className="sc-recap__k">Storm type</span><span className="sc-recap__v">{result.storm.emoji} {result.stormType}</span></div>
            <div className="sc-recap__row"><span className="sc-recap__k">Symbolic enemy</span><span className="sc-recap__v">{result.enemy}</span></div>
            <div className="sc-recap__row"><span className="sc-recap__k">Main leak</span><span className="sc-recap__v">{result.mainLeak}</span></div>
            <div className="sc-recap__row"><span className="sc-recap__k">Hidden feeling</span><span className="sc-recap__v">{result.feeling}</span></div>
            <div className="sc-recap__row"><span className="sc-recap__k">Body signal</span><span className="sc-recap__v">{result.body}</span></div>
            <div className="sc-recap__row"><span className="sc-recap__k">Unsafe urge</span><span className="sc-recap__v" style={{ maxWidth: 200 }}>{result.urge}</span></div>
            <div className="sc-recap__row"><span className="sc-recap__k">Best tool</span><span className="sc-recap__v" style={{ maxWidth: 200 }}>{result.tool}</span></div>
            <div className="sc-recap__row"><span className="sc-recap__k">Reframe</span><span className="sc-recap__v" style={{ maxWidth: 210 }}>{result.reframe}</span></div>
            <div className="sc-recap__row"><span className="sc-recap__k">Clean action</span><span className="sc-recap__v" style={{ maxWidth: 210 }}>{result.cleanAction}</span></div>
          </div>
          <div className="sc-coach">
            <span className="sc-coach__face">🧑‍✈️</span>
            <span className="sc-coach__body"><span className="sc-coach__name">Captain Cal</span><span className="sc-coach__line">{result.coach}</span></span>
          </div>
          <button type="button" className="sc-btn" style={{ marginTop: 8 }} onClick={() => onSail(result.storm.id)}>Sail this storm →</button>
        </div>
      )}
    </div>
  );
}

// ─── Onboarding ──────────────────────────────────────────────────────────────
function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const steps = [
    { face: "🧑‍✈️", title: "Welcome aboard, captain.", body: "This ship is you. Storms will come — anger, pressure, overwhelm. Your job isn't to control the ocean. It's to captain the ship." },
    { face: "🌊", title: "Water is overwhelm.", body: "When too much hits at once, water floods in. You'll learn to bail it, and — more importantly — patch the leak it's coming from." },
    { face: "⚓", title: "Anchor before you react.", body: "The wave is loud, but it isn't law. Drop anchor, breathe with the pump, name the feeling — then choose your direction with the compass." },
    { face: "🧭", title: "Regulate first. Solve second.", body: "You cannot stop every storm. You can bail the water, patch the leak, and steer toward what matters. Ready to take the wheel?" },
  ];
  const s = steps[step];
  return (
    <div className="sc-modal" style={{ alignItems: "center" }}>
      <div className="sc-sheet" style={{ borderRadius: 24, margin: "0 12px", borderBottom: "1px solid var(--accent-border)" }} onClick={(e) => e.stopPropagation()}>
        <div className="sc-breath" style={{ padding: 0 }}>
          <div style={{ fontSize: "3rem", marginBottom: 8 }}>{s.face}</div>
        </div>
        <h3 className="sc-sheet__title">{s.title}</h3>
        <p className="sc-sheet__sub" style={{ marginBottom: 18 }}>{s.body}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 14 }}>
          {steps.map((_, i) => <span key={i} style={{ width: 8, height: 8, borderRadius: 99, background: i === step ? "#00F0FF" : "rgba(255,255,255,0.2)" }} />)}
        </div>
        <button type="button" className="sc-btn" onClick={() => (step < steps.length - 1 ? setStep(step + 1) : onDone())}>
          {step < steps.length - 1 ? "Next" : "Take the wheel"}
        </button>
        {step < steps.length - 1 && <button type="button" className="sc-back" style={{ width: "100%", textAlign: "center", marginTop: 8 }} onClick={onDone}>Skip</button>}
      </div>
    </div>
  );
}

// ─── Badge evaluation ────────────────────────────────────────────────────────
function evalBadges(state, result) {
  const has = new Set(state.badges);
  const c = state.counters;
  const add = [];
  const give = (id) => { if (!has.has(id)) { add.push(id); has.add(id); } };
  const hour = new Date().getHours();

  if (state.voyages >= 1) give("first_harbor");
  if (c.anchor >= 10) give("anchor_master");
  if (c.breaths >= 25) give("deep_breather");
  if (c.patch >= 20) give("leak_hunter");
  if (result && !result.firedCannon) give("no_cannons");
  if (c.whirlpool >= 1) give("whirlpool_escape");
  if (c.urges >= 1) give("urge_surfer");
  if (state.bestDrop >= 5) give("big_drop");
  if (state.streak >= 7) give("week_afloat");
  if (c.compass >= 15) give("compass_true");
  if (state.xp >= LEVELS[7].xp) give("storm_navigator");
  if (hour >= 22 || hour < 4) give("night_captain");
  if (c.cleanActions >= 10) give("clean_ten");
  if (result && result.mainLeakType === "repair") give("repair_dock");
  if (result && result.value?.id === "respect") { /* soft */ }
  if (result && result.waterPeak >= 90) give("calm_under_fire");
  if (state.xp >= LEVELS[9].xp) give("fleet_leader");
  if (hour < 7) give("dawn_patrol");
  if (state.xp >= LEVELS[11].xp) give("storm_alchemist");
  if ((state.stormCounts.self || 0) >= 5) give("self_compassion");
  if ((state.stormCounts.money || 0) >= 5) give("money_calm");
  if (result && ["Anchor", "Name", "Pump", "Patch", "Compass"].every((t) => result.used?.includes(t))) give("perfect_combo");
  if (state.voyages >= 100) give("hundred_voyages");
  if (state.voyages >= 10 && c.emergencies === 0) give("never_sank");

  return add;
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function StormCaptain({ onClose, onComplete } = {}) {
  const [state, setState] = useState(loadState);
  const [view, setView] = useState("harbor"); // harbor|check|intensity|body|voyage|result|log|custom
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; });
  const [session, setSession] = useState({ storm: null, intensity: 6, body: null });
  const [result, setResult] = useState(null);
  const [resultMeta, setResultMeta] = useState({ xpGained: 0, xpBits: [], newBadges: [] });
  const [emergency, setEmergency] = useState(null); // null | {crisis}
  const [toast, setToast] = useState(null);
  const [showOnboard, setShowOnboard] = useState(() => !loadState().seenOnboarding);

  useEffect(() => { saveState(state); }, [state]);

  const level = getLevel(state.xp);
  const next = getNextLevel(state.xp);
  const dayIndex = Math.floor(Date.now() / 86400000);

  const finishOnboard = () => {
    setShowOnboard(false);
    setState((p) => ({ ...p, seenOnboarding: true }));
  };

  const startFlow = () => { setSession({ storm: null, intensity: 6, body: null }); setView("check"); };
  const startStorm = (stormId) => {
    setSession({ storm: STORMS.find((s) => s.id === stormId), intensity: 6, body: null });
    setView("intensity");
  };

  const goEmergency = (crisis = false) => {
    setEmergency({ crisis });
    setState((p) => ({ ...p, counters: { ...p.counters, emergencies: p.counters.emergencies + 1 } }));
  };

  // Called on voyage win
  const handleWin = useCallback((res) => {
    setResult(res);
    setState((prev) => {
      const drop = Math.max(0, res.before - res.after);
      // XP
      const bits = [];
      let xp = XP.win;
      bits.push("Harbor +25");
      if (res.counts.patches) { xp += res.counts.patches * XP.patch; bits.push(`Patch ×${res.counts.patches}`); }
      if (res.counts.breaths) { xp += res.counts.breaths * XP.pump; bits.push(`Breath ×${res.counts.breaths}`); }
      if (res.counts.anchors) { xp += res.counts.anchors * XP.anchor; bits.push(`Anchor ×${res.counts.anchors}`); }
      if (res.counts.names) { xp += res.counts.names * XP.name; }
      if (res.counts.whirlEscapes) { xp += res.counts.whirlEscapes * XP.whirlpool; bits.push(`Whirlpool escape ×${res.counts.whirlEscapes}`); }
      if (res.value) { xp += XP.compass; }
      xp += XP.cleanAction; bits.push("Clean action +15");
      if (!res.firedCannon) { xp += XP.noCannon; bits.push("Cold cannons +10"); }
      if (drop >= 3) { xp += XP.bigDrop; bits.push(`Big drop +12`); }

      // counters
      const counters = { ...prev.counters };
      counters.anchor += res.counts.anchors;
      counters.pump += res.counts.breaths;
      counters.patch += res.counts.patches;
      counters.whirlpool += res.counts.whirlEscapes;
      counters.compass += res.value ? 1 : 0;
      counters.cleanActions += 1;
      counters.breaths += res.counts.breaths;
      counters.buckets += res.counts.buckets;
      counters.urges += res.counts.urgesSurfed;
      counters.cannonFires += res.counts.cannons;
      if (!res.firedCannon) counters.noCannonWins += 1;

      // pattern maps
      const stormCounts = { ...prev.stormCounts, [res.storm]: (prev.stormCounts[res.storm] || 0) + 1 };
      const leakCounts = res.mainLeak ? { ...prev.leakCounts, [res.mainLeak]: (prev.leakCounts[res.mainLeak] || 0) + 1 } : prev.leakCounts;
      const valueCounts = res.value ? { ...prev.valueCounts, [res.value.id]: (prev.valueCounts[res.value.id] || 0) + 1 } : prev.valueCounts;
      const patchTypeCounts = res.mainLeakType ? { ...prev.patchTypeCounts, [res.mainLeakType]: (prev.patchTypeCounts[res.mainLeakType] || 0) + 1 } : prev.patchTypeCounts;

      // streak
      let streak = prev.streak;
      let bestStreak = prev.bestStreak;
      const t = today();
      if (prev.lastDate !== t) {
        const diff = prev.lastDate ? Math.round((new Date(t) - new Date(prev.lastDate)) / 86400000) : 1;
        streak = diff === 1 ? prev.streak + 1 : 1;
        bestStreak = Math.max(bestStreak, streak);
      }

      const logEntry = {
        date: t, storm: res.storm, before: res.before, after: res.after,
        mainLeak: res.mainLeak, value: res.value?.label, action: res.action,
      };

      const nextState = {
        ...prev,
        xp: prev.xp + xp,
        voyages: prev.voyages + 1,
        bestDrop: Math.max(prev.bestDrop, drop),
        counters, stormCounts, leakCounts, valueCounts, patchTypeCounts,
        streak, bestStreak, lastDate: t,
        log: [logEntry, ...prev.log].slice(0, 60),
      };

      // level up toast
      const oldLevel = getLevel(prev.xp);
      const newLevel = getLevel(nextState.xp);
      const leveledUp = newLevel.rank > oldLevel.rank;
      if (leveledUp) {
        setTimeout(() => setToast(`${newLevel.icon} Promoted to ${newLevel.name}!`), 400);
      }

      // notify the Anger Gym hub (global app XP + celebration)
      setTimeout(() => onCompleteRef.current?.({
        action: res.action,
        before: res.before,
        after: res.after,
        storm: res.storm,
        leveledUp,
        level: leveledUp ? newLevel : null,
        insight: `Intensity ${res.before} → ${res.after}${res.mainLeak ? ` · ${res.mainLeak}` : ""}`,
      }), 0);

      // badges
      const newBadgeIds = evalBadges(nextState, res);
      if (newBadgeIds.length) nextState.badges = [...prev.badges, ...newBadgeIds];
      const newBadges = newBadgeIds.map((id) => BADGES.find((b) => b.id === id)).filter(Boolean);

      setResultMeta({ xpGained: xp, xpBits: bits, newBadges });
      return nextState;
    });
    setView("result");
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const stormNorm = view === "voyage" ? 0.6 : 0.15;

  return (
    <div className={`sc ${view === "voyage" && session.intensity > 6 ? "sc--raging" : ""}`} style={{ "--storm": stormNorm }}>
      <div className="sc-sky"><div className="sc-sky__waves" /><div className="sc-sky__bolt" /></div>

      {showOnboard && <Onboarding onDone={finishOnboard} />}

      {toast && <div className="sc-toast-wrap"><div className="sc-toast">{toast}</div></div>}

      {emergency && <EmergencyHarbor crisis={emergency.crisis} onClose={() => { setEmergency(null); setView("harbor"); }} />}

      {/* ── HOME HARBOR ── */}
      {view === "harbor" && (
        <div className="sc-harbor">
          {onClose && <button type="button" className="sc-back" onClick={onClose}>← Anger Gym</button>}
          <p className="sc-kicker">Anger &amp; Overwhelm · Game 3</p>
          <h1 className="sc-h1">Storm Captain</h1>
          <p className="sc-sub" style={{ marginBottom: 8 }}>You are not the storm. You are the captain.</p>

          <svg className="sc-harbor__ship" viewBox="0 0 300 180" aria-hidden="true">
            <defs>
              <linearGradient id="sc-hsea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0a3a55" /><stop offset="100%" stopColor="#041824" /></linearGradient>
            </defs>
            <path d="M0 120 Q75 108 150 120 T300 120 L300 180 L0 180 Z" fill="url(#sc-hsea)" />
            <line x1="150" y1="24" x2="150" y2="92" stroke="#6b5638" strokeWidth="4" strokeLinecap="round" />
            <path d="M150 28 Q188 50 150 84 Z" fill="#123a4a" stroke="#00F0FF" strokeWidth="1.5" />
            <circle cx="150" cy="22" r="4" fill="#00FFBF" />
            <path d="M62 92 L238 92 L220 138 Q208 154 150 154 Q92 154 80 138 Z" fill="#0c0716" stroke="#00F0FF" strokeWidth="2.5" />
            <line x1="62" y1="92" x2="238" y2="92" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
          </svg>

          <div className="sc-rankbar">
            <span className="sc-rankbar__icon" style={{ color: level.color }}>{level.icon}</span>
            <div className="sc-rankbar__info">
              <div className="sc-rankbar__name">{level.name}</div>
              <div className="sc-rankbar__xp">{state.xp} XP{next ? ` · ${next.xp - state.xp} to ${next.name}` : " · max rank"}</div>
              <div className="sc-rankbar__track">
                <div className="sc-rankbar__fill" style={{ width: `${next ? clamp(((state.xp - level.xp) / (next.xp - level.xp)) * 100) : 100}%` }} />
              </div>
            </div>
          </div>

          <div className="sc-coach">
            <span className="sc-coach__face">🧑‍✈️</span>
            <span className="sc-coach__body">
              <span className="sc-coach__name">Captain Cal · today's challenge</span>
              <span className="sc-coach__line">{dailyChallenge(dayIndex)}</span>
            </span>
          </div>

          <div className="sc-stat3">
            <div className="sc-stat3__cell"><div className="sc-stat3__num">{state.voyages}</div><div className="sc-stat3__lbl">Voyages</div></div>
            <div className="sc-stat3__cell"><div className="sc-stat3__num">🔥{state.streak}</div><div className="sc-stat3__lbl">Day streak</div></div>
            <div className="sc-stat3__cell"><div className="sc-stat3__num">{state.badges.length}</div><div className="sc-stat3__lbl">Badges</div></div>
          </div>

          <div className="sc-harbor__actions">
            <button type="button" className="sc-btn" onClick={startFlow}>⛵ Set sail — a storm is here</button>
            <div className="sc-menu-row">
              <button type="button" className="sc-btn sc-btn--ghost" onClick={() => setView("custom")}>✍️ Custom storm</button>
              <button type="button" className="sc-btn sc-btn--ghost" onClick={() => setView("log")}>📖 Captain's Log</button>
            </div>
            <button type="button" className="sc-danger-link" onClick={() => goEmergency(false)}>Flooded right now? Open Emergency Harbor →</button>
          </div>
        </div>
      )}

      {/* ── STORM CHECK ── */}
      {view === "check" && (
        <div>
          <button type="button" className="sc-back" onClick={() => setView("harbor")}>← Home Harbor</button>
          <p className="sc-kicker">Storm Check</p>
          <h2 className="sc-h1">What storm are you in?</h2>
          <p className="sc-sub">Pick the weather that fits. There's no wrong answer — just information.</p>
          <div className="sc-grid">
            {STORMS.map((s) => (
              <button key={s.id} type="button" className="sc-tile" style={{ "--tc": s.color }} onClick={() => startStorm(s.id)}>
                <span className="sc-tile__emoji">{s.emoji}</span>
                <span className="sc-tile__label">{s.label}</span>
                <span className="sc-tile__tag">{s.tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── INTENSITY ── */}
      {view === "intensity" && session.storm && (
        <div>
          <button type="button" className="sc-back" onClick={() => setView("check")}>← Change storm</button>
          <p className="sc-kicker">{session.storm.emoji} {session.storm.label}</p>
          <h2 className="sc-h1">How high are the waves?</h2>
          <p className="sc-sub">Rate the intensity right now. This is your “before”.</p>
          <div className="sc-intensity">
            <div className="sc-intensity__val">{session.intensity}</div>
            <div className="sc-intensity__lbl">{session.intensity <= 3 ? "Choppy but steady" : session.intensity <= 6 ? "Rough seas" : session.intensity <= 8 ? "Heavy storm" : "Red-zone storm"}</div>
            <input type="range" className="sc-range" min="1" max="10" value={session.intensity}
              onChange={(e) => setSession((s) => ({ ...s, intensity: Number(e.target.value) }))} />
            <div className="sc-range-scale"><span>1 · calm</span><span>10 · flooded</span></div>
          </div>
          {session.intensity >= 9 && (
            <div className="sc-em-crisis">A 9 or 10 is a lot to carry. You can still sail — but if you might act in a way you'd regret, open the <b>Emergency Harbor</b> first.
              <button type="button" className="sc-btn sc-btn--danger" style={{ marginTop: 10 }} onClick={() => goEmergency(false)}>Open Emergency Harbor</button>
            </div>
          )}
          <button type="button" className="sc-btn" onClick={() => setView("body")}>Next — where do you feel it?</button>
        </div>
      )}

      {/* ── BODY SIGNAL ── */}
      {view === "body" && session.storm && (
        <div>
          <button type="button" className="sc-back" onClick={() => setView("intensity")}>← Back</button>
          <p className="sc-kicker">Body Signal</p>
          <h2 className="sc-h1">Where do you feel the storm?</h2>
          <p className="sc-sub">The body reports the weather first. Notice where it lives.</p>
          <div className="sc-chips">
            {BODY_SIGNALS.map((b) => (
              <button key={b.id} type="button" className={`sc-chip ${session.body === b.id ? "is-on" : ""}`}
                style={{ "--tc": "#00FFBF" }} onClick={() => setSession((s) => ({ ...s, body: b.id }))}>
                <span>{b.emoji}</span>{b.label}
              </button>
            ))}
          </div>
          <button type="button" className="sc-btn" style={{ marginTop: 20 }} disabled={!session.body} onClick={() => setView("voyage")}>
            {session.body ? "⚓ Begin the voyage" : "Pick where you feel it"}
          </button>
        </div>
      )}

      {/* ── VOYAGE ── */}
      {view === "voyage" && session.storm && session.body && (
        <Voyage
          session={session}
          onWin={handleWin}
          onEmergency={(payload) => goEmergency(false)}
          onQuit={() => setView("harbor")}
        />
      )}

      {/* ── RESULT ── */}
      {view === "result" && result && (
        <ResultScreen result={result} {...resultMeta} onDone={() => { setResult(null); setView("harbor"); }} />
      )}

      {/* ── LOG ── */}
      {view === "log" && <LogScreen state={state} onBack={() => setView("harbor")} />}

      {/* ── CUSTOM STORM ── */}
      {view === "custom" && (
        <CustomStorm
          onBack={() => setView("harbor")}
          onEmergency={(crisis) => goEmergency(crisis)}
          onSail={(stormId) => startStorm(stormId)}
        />
      )}
    </div>
  );
}

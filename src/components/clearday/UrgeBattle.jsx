import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SEED_LIES, TRACK_META } from "./clearDayData.js";
import { markLiesSeen } from "./clearDayStore.js";
import {
  sfxCoin, sfxCritStrike, sfxHalo, sfxMaskAmbush, sfxNamingStrike,
  sfxPhoenix, sfxShatter, sfxWaxSeal, sfxWhoosh,
} from "../../lib/sfx.js";
import { buzzSuccess, slamHeavy, tapLight, tapMedium } from "../../lib/haptics.js";
import cdFx from "./cdFx.js";
import SeverTheSignal from "./battle/SeverTheSignal.jsx";
import ReachOut from "./ReachOut.jsx";
import {
  INTENSITY_LEVELS, RISK_LEVELS, THOUGHT_TYPES, TRACK_BATTLE, URGE_FORMS, resultCopy,
} from "./battle/battleContent.js";
import { BATTLE_RESEARCH } from "./battle/battleResearch.js";
import { saveClearProof } from "./battle/clearProofMedia.js";

const STAGES = ["cue", "signal", "thought", "sever", "boss", "rerate", "safety", "tape", "why", "law", "action", "proof", "victory"];
const motionOff = () =>
  (typeof document !== "undefined" && document.documentElement.dataset.reducedMotion === "true") ||
  (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

function ResearchSheet({ item, track, onClose }) {
  const data = BATTLE_RESEARCH[item];
  if (!data) return null;
  return (
    <div className="cdb-research-backdrop" role="presentation" onClick={onClose}>
      <div className="cdb-research" role="dialog" aria-modal="true" aria-labelledby="cdb-research-title" onClick={(e) => e.stopPropagation()}>
        <div className="cdb-act-eyebrow">WHY THIS IS HERE</div>
        <h2 className="cdb-h" id="cdb-research-title">{data.title}</h2>
        <p className="cdb-p">{data.body}</p>
        {track === "porn" && item !== "porn" && <p className="cdb-research-limit">Pornography-specific evidence is limited; CLEARDAY does not assume findings transfer perfectly.</p>}
        <div className="cdb-research-source">{data.source}</div>
        <button type="button" className="cdb-big-btn" onClick={onClose}>GOT IT</button>
      </div>
    </div>
  );
}

function BattleAtmosphere({ stage, intensity, tint }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    let raf = 0;
    let active = true;
    let t = 0;
    const still = motionOff();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => { canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; };
    resize(); window.addEventListener("resize", resize);
    const draw = () => {
      if (!active) return;
      raf = requestAnimationFrame(draw);
      if (document.hidden) return;
      t += still ? 0 : 0.012;
      const W = canvas.width; const H = canvas.height; const dawn = Math.min(1, stage / 10);
      ctx.clearRect(0, 0, W, H);
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, `rgb(${7 + dawn * 8},${11 + dawn * 18},${24 + dawn * 38})`);
      sky.addColorStop(1, `rgb(${10 + dawn * 35},${16 + dawn * 38},${35 + dawn * 60})`);
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      const glow = ctx.createRadialGradient(W * 0.5, H * 0.78, 0, W * 0.5, H * 0.78, W * 0.7);
      glow.addColorStop(0, `rgba(255,196,107,${0.04 + dawn * 0.24})`); glow.addColorStop(1, "rgba(255,196,107,0)");
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
      const amp = (8 + intensity * 1.7) * dpr * (1 - dawn * 0.45);
      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath(); ctx.moveTo(0, H);
        const base = H * (0.78 + layer * 0.055);
        for (let x = 0; x <= W; x += 8 * dpr) ctx.lineTo(x, base + Math.sin(x / (80 * dpr) + t * (1 + layer * 0.35)) * amp * (1 - layer * 0.18));
        ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = `rgba(${tint},${0.1 - layer * 0.022})`; ctx.fill();
      }
    };
    raf = requestAnimationFrame(draw);
    return () => { active = false; cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [intensity, stage, tint]);
  return <canvas className="cdb2-atmos" ref={ref} aria-hidden="true" />;
}

function FlameScale({ value, onChange, label = "Choose the closest signal" }) {
  return (
    <div className="cdb2-flames-wrap">
      <div className="cdb2-flames-label">{label}</div>
      <div className="cdb2-flames" role="group" aria-label="Urge intensity">
        {INTENSITY_LEVELS.map((item) => {
          const on = value >= item.value;
          const selected = value === item.value;
          return (
            <button key={item.level} type="button" className={`cdb2-flame ${on ? "cdb2-flame--on" : ""} ${selected ? "cdb2-flame--selected" : ""}`} style={{ "--level": item.level, "--delay": `${item.level * -0.17}s` }} onClick={() => { onChange(item.value); tapLight(); }} aria-pressed={selected}>
              <span className="cdb2-flame-glow" aria-hidden="true" />
              <span className="cdb2-flame-shape" aria-hidden="true"><i /></span>
              <span className="cdb2-flame-name">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChoiceGrid({ items, value, onChange, className = "" }) {
  return <div className={`cdb2-choices ${className}`}>{items.map((item) => {
    const id = typeof item === "string" ? item : item.id;
    const label = typeof item === "string" ? item : item.label;
    return <button key={id} type="button" className={value === id ? "cdb2-choice cdb2-choice--on" : "cdb2-choice"} onClick={() => onChange(id)}>{label}</button>;
  })}</div>;
}

function ContactBreak({ track, value, onChoose, onNext }) {
  const options = TRACK_BATTLE[track].cueActions;
  const physicallyMoved = value && !value.includes("can’t safely");
  return (
    <div className={`cdb-act cdb2-contact ${physicallyMoved ? "cdb2-contact--broken" : ""}`}>
      <div className="cdb-act-eyebrow">ACT 1 · BREAK CONTACT</div>
      <div className="cdb2-cue-orb" aria-hidden="true"><span /></div>
      <h2 className="cdb-h">Is the cue still<br />within reach?</h2>
      <p className="cdb-p">Before we work with the thought, create physical distance if you safely can. No proof required.</p>
      <ChoiceGrid items={options} value={value} onChange={onChoose} />
      {value && <div className="cdb2-contact-confirm">{physicallyMoved ? "CONTACT BROKEN" : "SAFETY FIRST"}<span>{physicallyMoved ? "Choice is back in the room." : "You named the constraint honestly. Keep going without forcing an unsafe move."}</span></div>}
      <button type="button" className="cdb-big-btn" disabled={!value} onClick={onNext}>READ THE SIGNAL</button>
    </div>
  );
}

function SignalRead({ intensity, setIntensity, urgeForm, setUrgeForm, risk, setRisk, onNext, onSlip }) {
  return (
    <div className="cdb-act">
      <div className="cdb-act-eyebrow">ACT 2 · READ THE SIGNAL</div>
      <h2 className="cdb-h">How loud is it<br />right now?</h2>
      <p className="cdb-p">Urges can rise, fall, return or stay present. The goal is enough distance to choose—not forcing a perfect zero.</p>
      <FlameScale value={intensity} onChange={setIntensity} />
      <div className="cdb2-question">What is strongest right now?</div>
      <ChoiceGrid items={URGE_FORMS} value={urgeForm} onChange={setUrgeForm} />
      <div className="cdb2-question">How close are you to acting?</div>
      <ChoiceGrid items={RISK_LEVELS} value={risk} onChange={(v) => { setRisk(v); if (v === "happened") onSlip(); }} />
      <button type="button" className="cdb-big-btn" disabled={!intensity || !urgeForm || !risk || risk === "happened"} onClick={onNext}>NAME THE MOVE</button>
    </div>
  );
}

function ThoughtCapture({ track, S, thought, setThought, thoughtType, setThoughtType, onNext, onResearch }) {
  const seeds = useMemo(() => {
    const own = (S.cards?.[track] || []).map((c) => c.lie).filter(Boolean);
    return [...new Set([...own, ...(SEED_LIES[track] || []).map((x) => x.lie)])].slice(0, 5);
  }, [S.cards, track]);
  return (
    <div className="cdb-act cdb2-thought-capture">
      <div className="cdb-act-eyebrow">ACT 3 · NAME THE MASK’S MOVE</div>
      <h2 className="cdb-h">What is {S.identity.maskName || "the Mask"}<br />saying?</h2>
      <p className="cdb-p">Capture the thought exactly. Naming it turns it into something you can observe instead of an instruction you must follow.</p>
      <div className="cdb2-seed-list">{seeds.map((seed) => <button key={seed} type="button" className={thought === seed ? "cdb2-seed cdb2-seed--on" : "cdb2-seed"} onClick={() => setThought(seed)}>“{seed}”</button>)}</div>
      <textarea className="cdb-input" rows={3} value={thought} onChange={(e) => setThought(e.target.value)} placeholder="The exact thought, in its own words…" />
      <div className="cdb2-question">What kind of move is it?</div>
      <ChoiceGrid items={THOUGHT_TYPES} value={thoughtType} onChange={setThoughtType} />
      {thought.trim().length >= 4 && thoughtType && <div className="cdb2-distance-frame"><span>I am noticing the thought that…</span><strong>“{thought.trim()}”</strong><em>{thoughtType.toUpperCase()} · NOT AN INSTRUCTION</em></div>}
      <button type="button" className="cdb-big-btn" disabled={thought.trim().length < 4 || !thoughtType} onClick={onNext}>I SEE THE MOVE</button>
      <button type="button" className="cdb-science-link" onClick={() => onResearch("labeling")}>Why name the thought?</button>
    </div>
  );
}

function ThoughtBoss({ thought, track, S, response, setResponse, settings, onDone, saveCard, onResearch }) {
  const [armed, setArmed] = useState(false);
  const [shattered, setShattered] = useState(false);
  const [slash, setSlash] = useState(null);
  const start = useRef(null);
  const slabRef = useRef(null);
  const answers = useMemo(() => {
    const cards = (S.cards?.[track] || []).flatMap((c) => Array.isArray(c.comebacks) ? c.comebacks : [c.comeback]).filter(Boolean);
    const seeds = (SEED_LIES[track] || []).flatMap((c) => c.comebacks || []);
    return [...new Set([S.laws?.[track], ...cards, ...seeds].filter(Boolean))].slice(0, 4);
  }, [S.cards, S.laws, track]);
  const hit = (a, b) => {
    const rect = slabRef.current.getBoundingClientRect();
    const x1 = a.x - rect.left; const y1 = a.y - rect.top; const x2 = b.x - rect.left; const y2 = b.y - rect.top;
    const cx = rect.width / 2; const cy = rect.height / 2; const dx = x2 - x1; const dy = y2 - y1; const len2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((cx - x1) * dx + (cy - y1) * dy) / len2));
    return Math.hypot(cx - (x1 + dx * t), cy - (y1 + dy * t)) < 54 && Math.hypot(dx, dy) > 80;
  };
  const endSlash = (e) => {
    if (!armed || shattered || !start.current) return;
    const b = { x: e.clientX, y: e.clientY }; const a = start.current; start.current = null;
    if (!hit(a, b)) return;
    const rect = slabRef.current.getBoundingClientRect();
    const local = { x1: a.x - rect.left, y1: a.y - rect.top, x2: b.x - rect.left, y2: b.y - rect.top, angle: Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI };
    setSlash(local); setShattered(true); sfxCritStrike(settings); slamHeavy(); cdFx.flare(TRACK_META[track].color);
    if (saveCard) saveCard(track, thought, response.trim());
  };
  return (
    <div className="cdb-act cdb2-boss">
      <div className="cdb-act-eyebrow">ACT 5 · THE THOUGHT BOSS</div>
      <h2 className="cdb-h">A thought can be present.<br />It still does not command you.</h2>
      {!armed && <>
        <div className="cdb2-boss-thought">“{thought}”</div>
        <p className="cdb-p">Answer it once with something true. The final strike stays locked until the cognitive work is done.</p>
        <div className="cdb2-seed-list">{answers.map((answer) => <button key={answer} type="button" className={response === answer ? "cdb2-seed cdb2-seed--on" : "cdb2-seed"} onClick={() => setResponse(answer)}>{answer}</button>)}</div>
        <textarea className="cdb-input" rows={3} value={response} onChange={(e) => setResponse(e.target.value)} placeholder="My true response…" />
        <button type="button" className="cdb-big-btn" disabled={response.trim().length < 8} onClick={() => { setArmed(true); sfxNamingStrike(settings); }}>ARM THE TRUTH</button>
      </>}
      {armed && <>
        <p className="cdb-p cdb-p--corner">Draw one deliberate slash through the fracture point.</p>
        <div ref={slabRef} className={`cdb2-boss-slab ${shattered ? "cdb2-boss-slab--shattered" : ""}`} onPointerDown={(e) => { start.current = { x: e.clientX, y: e.clientY }; e.currentTarget.setPointerCapture?.(e.pointerId); }} onPointerUp={endSlash} onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && !shattered) { e.preventDefault(); const rect = e.currentTarget.getBoundingClientRect(); start.current = { x: rect.left + 24, y: rect.bottom - 30 }; endSlash({ clientX: rect.right - 24, clientY: rect.top + 30 }); } }} role="button" tabIndex={0} aria-label="Swipe through the center to separate the thought">
          <span className="cdb2-boss-half cdb2-boss-half--a">“{thought}”</span><span className="cdb2-boss-half cdb2-boss-half--b">“{thought}”</span>
          {!shattered && <span className="cdb2-fracture-target" aria-hidden="true" />}
          {slash && <i className="cdb2-final-slash" style={{ left: slash.x1, top: slash.y1, width: Math.hypot(slash.x2 - slash.x1, slash.y2 - slash.y1), transform: `rotate(${slash.angle}deg)` }} />}
        </div>
        {shattered && <div className="cdb2-truth-remains"><span>THE RESPONSE YOU CHOSE</span>{response}<em>The thought was present. You chose the response.</em></div>}
        <button type="button" className="cdb-big-btn" disabled={!shattered} onClick={onDone}>CHECK THE SIGNAL</button>
      </>}
      <button type="button" className="cdb-science-link" onClick={() => onResearch("avoidance")}>What this does—and doesn’t prove</button>
    </div>
  );
}

function Rerate({ start, end, setEnd, onNext, onResearch }) {
  return <div className="cdb-act"><div className="cdb-act-eyebrow">ACT 6 · HONEST RE-RATING</div><h2 className="cdb-h">How loud is it now?</h2><p className="cdb-p">The game does not decide whether your urge changed. You do.</p><div className="cdb2-before">STARTING SIGNAL <strong>{start}/10</strong></div><FlameScale value={end} onChange={setEnd} label="Choose the honest number" />{end ? <div className="cdb2-result-copy">{resultCopy(start, end)}</div> : null}<button type="button" className="cdb-big-btn" disabled={!end} onClick={onNext}>USE THE DATA</button><button type="button" className="cdb-science-link" onClick={() => onResearch("measurement")}>Why the game does not score my urge</button></div>;
}

function HighIntensityRoute({ track, value, onChoose, onDone }) {
  return <div className="cdb-act cdb2-safety"><div className="cdb-act-eyebrow">THE SIGNAL IS STILL LOUD</div><h2 className="cdb-h">Change the environment.<br />Do not fight alone.</h2><p className="cdb-p">Pick one concrete protection now. Movement can create a temporary change in state for some people, but it is only one option.</p><ChoiceGrid items={TRACK_BATTLE[track].safetyActions} value={value} onChange={onChoose} /><div className="cdb2-support-note">If this feels unsafe or out of control, contact a trusted person or qualified professional now.</div><button type="button" className="cdb-big-btn" disabled={!value} onClick={onDone}>I TOOK THE STEP</button></div>;
}

function TapePlayer({ dark, clear, side, setSide, onDone }) {
  return side === "dark" ? <div className="cdb-tape cdb-tape--dark"><div className="cdb-tape-label cdb-tape-label--dark">DOOR A · PLAY PAST THE FIRST MINUTE</div><p className="cdb-tape-text">{dark}</p><div className="cdb-tape-note">What happens later tonight? What is tomorrow morning like?</div><button type="button" className="cdb-big-btn cdb-big-btn--dark" onClick={() => setSide("clear")}>OPEN THE OTHER DOOR</button></div> : <div className="cdb-tape cdb-tape--clear"><div className="cdb-tape-label cdb-tape-label--clear">DOOR B · THE NEXT TEN MINUTES</div><p className="cdb-tape-text">{clear}</p><div className="cdb-tape-note">What becomes possible when you keep your word for the next ten minutes?</div><button type="button" className="cdb-big-btn" onClick={onDone}>THAT IS THE NEXT SCENE</button></div>;
}

function WhyReveal({ text, onDone }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), motionOff() ? 0 : 1900); return () => clearTimeout(t); }, []);
  return <div className="cdb-act cdb-act--why"><div className="cdb-act-eyebrow">ACT 8 · WHAT THIS CHOICE PROTECTS</div><div className="cdb-why-glow" aria-hidden="true" /><blockquote className="cdb-why">“{text || "The clear life. The real one."}”</blockquote><div className="cdb-why-sub">This is what the next choice protects.</div>{ready && <button type="button" className="cdb-big-btn" onClick={onDone}>IT STILL STANDS</button>}</div>;
}

function LawSeal({ law, value, setValue, onDone, settings }) {
  const valid = /i don'?t/i.test(value) && value.trim().length >= 10;
  return <div className="cdb-act"><div className="cdb-act-eyebrow">ACT 9 · SPEAK THE LAW</div><h2 className="cdb-h">Produce it.<br />No tap-through.</h2><p className="cdb-p">Type the Law in full. It must carry “I don’t”—a decision, not a debate.</p><textarea className="cdb-input cdb-input--law" rows={3} value={value} onChange={(e) => setValue(e.target.value)} placeholder={law} />{value.trim().length >= 10 && !valid && <div className="cdb-law-nudge">The Law runs on “I don’t,” not “I can’t” or “I’m trying.”</div>}<button type="button" className="cdb-big-btn" disabled={!valid} onClick={() => { sfxWaxSeal(settings); tapMedium(); onDone(); }}>SEAL THE LAW</button></div>;
}

function NextAction({ track, value, setValue, custom, setCustom, onDone }) {
  const selected = custom.trim() || value;
  return <div className="cdb-act"><div className="cdb-act-eyebrow">ACT 10 · PROTECT THE NEXT TEN MINUTES</div><h2 className="cdb-h">Where does your body<br />go from here?</h2><p className="cdb-p">The battle created distance. This action protects it.</p><ChoiceGrid items={TRACK_BATTLE[track].nextActions} value={value} onChange={(v) => { setValue(v); setCustom(""); }} /><input className="cdb-input" value={custom} onChange={(e) => { setCustom(e.target.value); setValue(""); }} placeholder="Or name a concrete action…" /><div className="cdb2-ten-clock"><span>10</span><div>MINUTES<br />PROTECTED</div></div><button type="button" className="cdb-big-btn" disabled={!selected} onClick={() => onDone(selected)}>LOCK THE NEXT MOVE</button></div>;
}

function ProofMission({ track, action, settings, onDone }) {
  const cameraRef = useRef(null);
  const libraryRef = useRef(null);
  const [file, setFile] = useState(null);
  const [source, setSource] = useState(null);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!file) { setPreview(""); return undefined; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const pick = (e, pickedSource) => {
    const next = e.target.files?.[0];
    if (next) { setFile(next); setSource(pickedSource); setError(""); sfxHalo(settings); tapLight(); }
    e.target.value = "";
  };
  const post = async () => {
    if (!file || busy) return;
    setBusy(true); setError("");
    try {
      const saved = await saveClearProof(file, { track, action, source });
      sfxWaxSeal(settings); tapMedium(); onDone(saved);
    } catch (err) {
      setError(err?.message || "Could not save the private proof. Try another photo.");
      setBusy(false);
    }
  };
  return <div className="cdb-act cdb2-proof"><div className="cdb-act-eyebrow">FINAL ACT · POST PROOF</div><h2 className="cdb-h">Turn the next move<br />into evidence.</h2><p className="cdb-p">Complete <strong>{action}</strong>, then post a photo that shows the real-world action: outside, at the gym, shoes on, food made, or the phone parked away.</p><div className="cdb2-proof-privacy"><strong>PRIVATE BY DEFAULT</strong>This photo is compressed, stripped of embedded metadata, and stored on this device. It is not posted to the Zone.</div>{preview ? <div className="cdb2-proof-preview"><img src={preview} alt="Private proof preview" /><div className="cdb2-proof-stamp">PROOF READY</div><button type="button" onClick={() => { setFile(null); setSource(null); }}>Retake</button></div> : <div className="cdb2-proof-pickers"><button type="button" onClick={() => cameraRef.current?.click()}><span aria-hidden="true">◎</span><strong>TAKE PHOTO</strong><small>Camera-first proof</small></button><button type="button" onClick={() => libraryRef.current?.click()}><span aria-hidden="true">▧</span><strong>CHOOSE PHOTO</strong><small>From your library</small></button></div>}<input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => pick(e, "camera")} /><input ref={libraryRef} type="file" accept="image/*" hidden onChange={(e) => pick(e, "library")} /><p className="cdb2-proof-safety">Photograph objects or environments—not private screens, nudity, exact addresses, or people without their consent.</p>{error && <div className="cdb2-proof-error" role="alert">{error}</div>}<button type="button" className="cdb-big-btn" disabled={!file || busy} onClick={post}>{busy ? "SEALING PRIVATE PROOF…" : "POST PRIVATE PROOF"}</button></div>;
}

function Victory({ S, data, onFinish }) {
  const tiles = ["Contact broken", "Thought named", "Signal severed", "Rated honestly", "Law spoken", "Proof posted"];
  return <div className="cdb-act cdb-act--victory"><div className="cdb2-evidence-orbit">{tiles.map((t, i) => <span key={t} style={{ "--i": i }}>{t}</span>)}<div className="cdb-stamp"><div className="cdb-stamp-inner">VOTE<br />CAST</div></div></div><h2 className="cdb-h">You interrupted<br />the loop.</h2><p className="cdb-p">The urge spoke. You made the decision. Your signal moved from <strong>{data.startRating}/10</strong> to <strong>{data.endRating}/10</strong>—and it did not need to vanish for you to regain choice.</p><div className="cdb2-victory-action">NEXT TEN MINUTES <strong>{data.nextAction}</strong></div><div className="cdb2-victory-stats"><span><strong>{data.game?.signals || 0}</strong> signals severed</span><span><strong>{data.game?.accuracy ?? 100}%</strong> focus</span><span><strong>{(S.stats.battlesWon || 0) + 1}</strong> urges faced</span></div><button type="button" className="cdb-big-btn" onClick={onFinish}>ADD THE EVIDENCE</button></div>;
}

export default function UrgeBattle({ track, S, settings, onWon, onSlip, onLeave, saveCard, saveTapeFn, onReachOutCorner }) {
  const [reachOpen, setReachOpen] = useState(false);
  const meta = TRACK_META[track] || TRACK_META.weed;
  const content = TRACK_BATTLE[track] || TRACK_BATTLE.weed;
  const [stage, setStage] = useState("cue");
  const [research, setResearch] = useState(null);
  const [cueAction, setCueAction] = useState("");
  const [startRating, setStartRating] = useState(0);
  const [endRating, setEndRating] = useState(0);
  const [urgeForm, setUrgeForm] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [thought, setThought] = useState("");
  const [thoughtType, setThoughtType] = useState("");
  const [response, setResponse] = useState("");
  const [game, setGame] = useState(null);
  const [safetyAction, setSafetyAction] = useState("");
  const [tapeDark, setTapeDark] = useState(S.tape?.[track]?.relapse || "");
  const [tapeClear, setTapeClear] = useState(S.tape?.[track]?.clear || "");
  const [tapeSide, setTapeSide] = useState(S.tape?.[track]?.relapse && S.tape?.[track]?.clear ? "dark" : "write");
  const [lawTyped, setLawTyped] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [customAction, setCustomAction] = useState("");
  const [proofId, setProofId] = useState("");
  const [proofSource, setProofSource] = useState("");
  const startRef = useRef(Date.now());
  const rootRef = useRef(null);
  const hotWhy = useMemo(() => [...(S.whys || [])].sort((a, b) => (b.intensity || 0) - (a.intensity || 0))[0]?.text || "The clear life. The real one.", [S.whys]);
  const anchors = useMemo(() => [hotWhy, S.identity?.statement, ...content.anchors].filter(Boolean), [S.identity?.statement, content.anchors, hotWhy]);
  const stageIndex = STAGES.indexOf(stage);
  const high = endRating >= 8 || riskLevel === "one-action";

  useEffect(() => { sfxMaskAmbush(settings); return undefined; }, [settings]);
  useEffect(() => {
    if (stage === "victory") { sfxPhoenix(settings); sfxCoin(settings); buzzSuccess(); cdFx.flare(meta.color); }
  }, [meta.color, settings, stage]);

  const go = useCallback((next) => { setStage(next); sfxWhoosh(settings); window.scrollTo?.(0, 0); }, [settings]);
  const resultPayload = useCallback((extra = {}) => ({
    track, beats: Math.max(0, stageIndex), seconds: Math.round((Date.now() - startRef.current) / 1000),
    rating: endRating || startRating || null, startRating: startRating || null, endRating: endRating || null,
    riskLevel, urgeForm, cueAction, gameSeconds: game?.gameSeconds || 0, roundsCompleted: game?.roundsCompleted || 0,
    accuracy: game?.accuracy ?? null, anchorErrors: game?.anchorErrors || 0, nextAction: customAction.trim() || nextAction || safetyAction || null,
    proofId: proofId || null, proofSource: proofSource || null,
    ...extra,
  }), [cueAction, customAction, endRating, game, nextAction, proofId, proofSource, riskLevel, safetyAction, stageIndex, startRating, track, urgeForm]);

  const afterRerate = () => high ? go("safety") : go("tape");
  const saveTapeAndPlay = () => { if (saveTapeFn) saveTapeFn(track, tapeDark.trim(), tapeClear.trim()); setTapeSide("dark"); };
  const finish = () => onWon(resultPayload());

  return (
    <div ref={rootRef} className={`cdb cdb2 cdb--${track}`} data-stage={Math.max(0, stageIndex)}>
      <BattleAtmosphere stage={Math.max(0, stageIndex)} intensity={startRating || 4} tint={meta.tintRgb} />
      <div className="cdb2-static" aria-hidden="true" />
      <div className="cdb-topline"><div><div className="cdb-topline-track" style={{ color: meta.color }}>{meta.label.toUpperCase()} · URGE BATTLE</div><div className="cdb2-stage-line"><span style={{ width: `${Math.max(4, (stageIndex / (STAGES.length - 1)) * 100)}%` }} /></div></div>{stage !== "victory" && <button type="button" className="cdb-reach-btn" onClick={() => { tapLight(); setReachOpen(true); }}>reach out</button>}{stage !== "victory" && <button type="button" className="cdb-leave" onClick={() => onLeave(resultPayload({ earlyExit: true }))}>leave safely</button>}</div>

      {reachOpen && <ReachOut onClose={() => setReachOpen(false)} onOpenCorner={onReachOutCorner} />}
      {stage === "cue" && <ContactBreak track={track} value={cueAction} onChoose={(v) => { setCueAction(v); tapMedium(); sfxHalo(settings); }} onNext={() => go("signal")} />}
      {stage === "signal" && <SignalRead intensity={startRating} setIntensity={setStartRating} urgeForm={urgeForm} setUrgeForm={setUrgeForm} risk={riskLevel} setRisk={setRiskLevel} onNext={() => go("thought")} onSlip={() => onSlip(track)} />}
      {stage === "thought" && <ThoughtCapture track={track} S={S} thought={thought} setThought={setThought} thoughtType={thoughtType} setThoughtType={setThoughtType} onNext={() => { markLiesSeen(track, (SEED_LIES[track] || []).filter((x) => x.lie === thought).map((x) => x.id)); go("sever"); }} onResearch={setResearch} />}
      {stage === "sever" && <SeverTheSignal track={track} thought={thought} anchors={anchors} maskName={S.identity?.maskName || "The Mask"} settings={settings} onResearch={setResearch} onComplete={(metrics) => { setGame(metrics); sfxCritStrike(settings); go("boss"); }} />}
      {stage === "boss" && <ThoughtBoss thought={thought} track={track} S={S} response={response} setResponse={setResponse} settings={settings} saveCard={saveCard} onResearch={setResearch} onDone={() => go("rerate")} />}
      {stage === "rerate" && <Rerate start={startRating} end={endRating} setEnd={setEndRating} onNext={afterRerate} onResearch={setResearch} />}
      {stage === "safety" && <HighIntensityRoute track={track} value={safetyAction} onChoose={setSafetyAction} onDone={() => go("tape")} />}
      {stage === "tape" && <div className="cdb-act"><div className="cdb-act-eyebrow">ACT 7 · PLAY THE WHOLE TAPE</div>{tapeSide === "write" ? <><h2 className="cdb-h">Both doors.<br />Your own words.</h2><div className="cdb-tape-label cdb-tape-label--dark">DOOR A · IF I GIVE IN</div><textarea className="cdb-input" rows={3} value={tapeDark} onChange={(e) => setTapeDark(e.target.value)} placeholder="Play past the first minute of relief…" /><div className="cdb-tape-label cdb-tape-label--clear">DOOR B · THE CLEAR NEXT SCENE</div><textarea className="cdb-input" rows={3} value={tapeClear} onChange={(e) => setTapeClear(e.target.value)} placeholder="What becomes possible in the next ten minutes?" /><button type="button" className="cdb-big-btn" disabled={tapeDark.trim().length < 10 || tapeClear.trim().length < 10} onClick={saveTapeAndPlay}>PLAY BOTH ENDINGS</button></> : <TapePlayer dark={tapeDark} clear={tapeClear} side={tapeSide} setSide={setTapeSide} onDone={() => go("why")} />}</div>}
      {stage === "why" && <WhyReveal text={hotWhy} onDone={() => go("law")} />}
      {stage === "law" && <LawSeal law={S.laws?.[track] || meta.lawHint} value={lawTyped} setValue={setLawTyped} settings={settings} onDone={() => go("action")} />}
      {stage === "action" && <NextAction track={track} value={nextAction} setValue={setNextAction} custom={customAction} setCustom={setCustomAction} onDone={(selected) => { if (customAction.trim()) setCustomAction(selected); else setNextAction(selected); go("proof"); }} />}
      {stage === "proof" && <ProofMission track={track} action={customAction.trim() || nextAction} settings={settings} onDone={(saved) => { setProofId(saved.id); setProofSource(saved.source); go("victory"); }} />}
      {stage === "victory" && <Victory S={S} data={{ startRating, endRating, nextAction: customAction.trim() || nextAction, game }} onFinish={finish} />}
      {!['cue', 'victory'].includes(stage) && <button type="button" className="cdb-honest" onClick={() => onSlip(track)}>It already happened · take me to the comeback</button>}
      {research && <ResearchSheet item={research} track={track} onClose={() => setResearch(null)} />}
    </div>
  );
}

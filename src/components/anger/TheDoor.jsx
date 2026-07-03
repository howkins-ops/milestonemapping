import React, { useMemo, useRef, useState } from "react";
import "../../styles/door-game.css";
import { DOOR_TIERS, DOOR_OPEN } from "../../data/angerVoiceLines";
import {
  sfxKnock,
  sfxImpact,
  sfxDoorBreak,
  sfxZap,
  playVoiceLine,
  stopVoiceLine,
} from "../../lib/sfx";

/* ════════════════════════════════════════════════════════════════════════
   THE DOOR — persistence arcade.

   You knock. They say NO. You knock again. Every knock cracks the wood a
   little more, every NO goes in your collection, and eventually the whole
   door comes off its hinges and they buy anyway. The game IS the lesson:
   the only way to lose is to stop knocking.

   The door's destruction is driven by ONE custom property (--p, 0→1) set
   imperatively per knock — cracks, lean, porch-light flicker and the
   resolve bar all derive from it in CSS. React state only changes on
   dialogue beats (~every 4 knocks), never per tap.

   Contract: { onClose, onComplete } — hub awards XP.
   ════════════════════════════════════════════════════════════════════════ */

const KNOCKS_TO_BREAK = 45;
const LINE_EVERY = 4; // knocks between dialogue beats
const STAGE_AT = [0, 0.2, 0.4, 0.62, 0.82]; // damage stage thresholds (5 rage tiers)
// Their voice + your SFX get progressively LOUDER per tier — that's the design.
const VOICE_VOL = [0.45, 0.6, 0.75, 0.9, 1.0];

const DOORS = [
  { id: "customers", emoji: "🚪", label: "Real customers" },
  { id: "goal", emoji: "🎯", label: "A goal that keeps saying no" },
  { id: "callback", emoji: "📞", label: "The call I'm avoiding" },
  { id: "life", emoji: "🌍", label: "Life in general" },
  { id: "any", emoji: "👊", label: "Just let me knock" },
];

// Voiced + escalating: text lives in angerVoiceLines so the bubble always
// matches the baked audio coming out of the speaker.
const THEM = DOOR_TIERS.map((t) => t.lines);

const YOU = [
  "I know you're in there.",
  "I can do this all day.",
  "That's one more NO for my collection.",
  "Scream louder. It feeds me.",
  "My knuckles are just warming up.",
  "I've been told no by scarier doors.",
  "Fuck your no. I'm still knocking.",
  "Was that a maybe? Sounded like a maybe.",
  "You're going to LOVE what I'm selling.",
  "I don't hear doors. I hear drums.",
];

const KNOCK_WORDS = ["KNOCK", "BANG", "BAM", "BAM BAM", "WHAM", "THUD"];
const POWER_WORDS = ["BOOM!", "BAM!!", "CRACK!!"];

function buzz(pattern) {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch {
    /* no haptics */
  }
}

function stageFor(p) {
  let s = 0;
  for (let i = 0; i < STAGE_AT.length; i++) if (p >= STAGE_AT[i]) s = i;
  return s;
}

/* The door itself — wrapper takes the lean/fall, inner takes the shake. */
function Door({ fallen }) {
  return (
    <div className={`dg-doorwrap ${fallen ? "is-fallen" : ""}`}>
      <div className="dg-door">
        <div className="dg-door__panel dg-door__panel--tl" />
        <div className="dg-door__panel dg-door__panel--tr" />
        <div className="dg-door__panel dg-door__panel--bl" />
        <div className="dg-door__panel dg-door__panel--br" />
        <span className="dg-door__peep" />
        <span className="dg-door__knob" />
        <span className="dg-door__hinge dg-door__hinge--t" />
        <span className="dg-door__hinge dg-door__hinge--b" />
        <span className="dg-crack dg-crack--1" />
        <span className="dg-crack dg-crack--2" />
        <span className="dg-crack dg-crack--3" />
        <span className="dg-chip dg-chip--1" />
        <span className="dg-chip dg-chip--2" />
        <span className="dg-chip dg-chip--3" />
      </div>
    </div>
  );
}

export default function TheDoor({ onClose, onComplete }) {
  const [phase, setPhase] = useState("brief"); // brief | knock | broke
  const [doorFor, setDoorFor] = useState(null);
  const [stage, setStage] = useState(0);
  const [nos, setNos] = useState(0);
  const [themLine, setThemLine] = useState(null);
  const [youLine, setYouLine] = useState(null);
  const [denied, setDenied] = useState(false);

  const sceneRef = useRef(null);
  const doorRef = useRef(null);
  const flashRef = useRef(null);
  const burstsRef = useRef(null);
  const knocksRef = useRef(0);
  const burstIdx = useRef(0);
  const themIdx = useRef(0);
  const youIdx = useRef(0);
  const doneRef = useRef(false);

  const doorLabel = useMemo(() => (DOORS.find((d) => d.id === doorFor) || {}).label, [doorFor]);

  const retrigger = (el, cls) => {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth; // reflow so the animation restarts (tap-frequency, not per-frame)
    el.classList.add(cls);
  };

  const spawnBurst = (e, power) => {
    const pool = burstsRef.current;
    if (!pool) return;
    const node = pool.children[burstIdx.current % pool.children.length];
    burstIdx.current += 1;
    const rect = pool.getBoundingClientRect();
    const x = e.clientX ? e.clientX - rect.left : rect.width / 2;
    const y = e.clientY ? e.clientY - rect.top : rect.height / 2;
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.textContent = power
      ? POWER_WORDS[Math.floor(Math.random() * POWER_WORDS.length)]
      : KNOCK_WORDS[Math.floor(Math.random() * KNOCK_WORDS.length)];
    node.classList.toggle("is-power", power);
    retrigger(node, "is-live");
  };

  const knock = (e) => {
    if (doneRef.current) return;
    knocksRef.current += 1;
    const n = knocksRef.current;
    const p = Math.min(1, n / KNOCKS_TO_BREAK);
    const power = n % 10 === 0;
    const s = stageFor(p);

    const el = sceneRef.current;
    if (el) el.style.setProperty("--p", String(p));
    retrigger(doorRef.current, power ? "is-pounded" : "is-hit");
    if (power) retrigger(flashRef.current, "is-live");
    spawnBurst(e, power);
    buzz(power ? [14, 30, 20] : 8);
    // every knock lands harder as the damage climbs
    if (power) sfxImpact(2 + s);
    else sfxKnock(1 + s);

    setStage((prev) => (prev === s ? prev : s));

    // dialogue beats — alternate their NO with your comeback
    if (n % (LINE_EVERY * 2) === LINE_EVERY) {
      const pool = THEM[s];
      const line = pool[themIdx.current % pool.length];
      setThemLine(line.text);
      setYouLine(null);
      themIdx.current += 1;
      setNos((v) => v + 1);
      // the whole point: they get LOUDER the longer you keep knocking
      playVoiceLine(line.id, { volume: VOICE_VOL[s], rate: 1 + s * 0.02 });
    } else if (n % (LINE_EVERY * 2) === 0) {
      setYouLine(YOU[youIdx.current % YOU.length]);
      setThemLine(null);
      youIdx.current += 1;
    }

    if (p >= 1 && !doneRef.current) {
      doneRef.current = true;
      buzz([30, 60, 30, 60, 90]);
      sfxDoorBreak();
      window.setTimeout(() => {
        setPhase("broke");
        playVoiceLine(DOOR_OPEN.id, { volume: 0.9 });
      }, 1100);
    }
  };

  const giveUp = () => {
    setDenied(true);
    setYouLine("Give up? Never heard of her.");
    setThemLine(null);
    buzz([8, 40, 8]);
    sfxZap();
    window.setTimeout(() => setDenied(false), 1200);
  };

  const reset = () => {
    doneRef.current = false;
    knocksRef.current = 0;
    themIdx.current = 0;
    youIdx.current = 0;
    setStage(0);
    setNos(0);
    setThemLine(null);
    setYouLine(null);
    setPhase("knock");
  };

  const seal = () => {
    stopVoiceLine();
    onComplete({
      knocks: knocksRef.current,
      nos,
      doorLabel,
      takeaway: `Broke the door down — ${knocksRef.current} knocks, ${nos} NOs survived, zero quits`,
    });
  };

  /* ── BRIEF ── */
  if (phase === "brief") {
    return (
      <div className="dg-stage">
        <div className="dg-top">
          <button className="dg-back" onClick={onClose}>← Gym</button>
          <span className="dg-top__title">The Door</span>
        </div>
        <div className="dg-brief">
          <p className="dg-eyebrow">Anger Gym · Persistence Arcade</p>
          <h2 className="dg-heading">They&rsquo;re going to say no.<br />Knock anyway.</h2>
          <p className="dg-lead">
            Behind this door is somebody who does not want to talk to you. Perfect. You&rsquo;re not
            here to be wanted — you&rsquo;re here to <b>keep knocking</b>. Every NO cracks the wood.
            The door always loses.
          </p>
          <div className="dg-science">
            <span className="dg-science__tag">Why this works</span>
            Rejection fires the same circuits as physical pain — until repetition recalibrates them.
            Safe, playful exposure to NO (behavioral desensitization) makes every real-world NO
            cheaper. You&rsquo;re not training charm here. You&rsquo;re training <b>the part of you that stays</b>.
          </div>
          <div className="dg-rated">
            <span className="dg-rated__badge">21+</span>
            RAW MODE — they will scream at you. They will swear at you. Sound on. That&rsquo;s the workout.
          </div>
          <p className="dg-asklabel">What&rsquo;s this door today?</p>
          <div className="dg-chips">
            {DOORS.map((d) => (
              <button
                key={d.id}
                className={`dg-chip-btn ${doorFor === d.id ? "is-on" : ""}`}
                onClick={() => setDoorFor(d.id)}
              >
                <span>{d.emoji}</span> {d.label}
              </button>
            ))}
          </div>
          <button className="dg-primary" disabled={!doorFor} onClick={() => setPhase("knock")}>
            Start knocking →
          </button>
        </div>
      </div>
    );
  }

  /* ── BROKE ── */
  if (phase === "broke") {
    return (
      <div className="dg-stage">
        <div className="dg-top">
          <button className="dg-back" onClick={onClose}>← Gym</button>
          <span className="dg-top__title">The Door</span>
        </div>
        <div className="dg-scene is-broken" style={{ "--p": 1 }}>
          <div className="dg-sky" />
          <div className="dg-wall" />
          <div className="dg-porchlight" />
          <div className="dg-owner">
            <span className="dg-owner__face">😧</span>
            <span className="dg-owner__mug">☕</span>
          </div>
          <div className="dg-doorpos"><Door fallen /></div>
          <div className="dg-dust" aria-hidden>
            <i /><i /><i /><i /><i /><i />
          </div>
          <div className="dg-stamp">SALE.</div>
          <div className="dg-mat"><span>FINE. COME IN.</span></div>
        </div>
        <div className="dg-bubble dg-bubble--them is-final">
          &ldquo;{DOOR_OPEN.text}&rdquo;
        </div>
        <div className="dg-seal">
          <h2 className="dg-heading">The door is down.</h2>
          <div className="dg-stats">
            <div className="dg-stat"><b>{knocksRef.current}</b><span>knocks thrown</span></div>
            <div className="dg-stat"><b>{nos}</b><span>NOs collected</span></div>
            <div className="dg-stat"><b>0</b><span>quits</span></div>
          </div>
          <p className="dg-lead dg-lead--seal">
            {doorLabel ? <>That was <b>{doorLabel.toLowerCase()}</b>. </> : null}
            They always answer eventually — the only knock that fails is the one you don&rsquo;t throw.
          </p>
          <button className="dg-primary" onClick={seal}>Collect the W →</button>
          <button className="dg-ghost" onClick={reset}>Break another door</button>
        </div>
      </div>
    );
  }

  /* ── KNOCK ── */
  return (
    <div className="dg-stage">
      <div className="dg-top">
        <button className="dg-back" onClick={onClose}>← Gym</button>
        <span className="dg-top__title">The Door</span>
        <span className="dg-nos">❌ {nos} NOs</span>
      </div>

      <div
        className="dg-scene"
        ref={sceneRef}
        data-stage={stage}
        style={{ "--p": 0, "--amp": 1 + stage * 0.55 }}
      >
        <div className="dg-flash" ref={flashRef} aria-hidden />
        <div className="dg-resolve">
          <span className="dg-resolve__label">Resolve</span>
          <div className="dg-resolve__track"><div className="dg-resolve__fill" /></div>
        </div>
        <div className="dg-sky" />
        <div className="dg-wall" />
        <div className="dg-porchlight" />
        <div className="dg-owner">
          <span className="dg-owner__face">😠</span>
        </div>

        <button
          className="dg-hitzone"
          onPointerDown={knock}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); knock(e); } }}
          aria-label="Knock on the door"
        >
          <span ref={doorRef} className="dg-doorshake">
            <Door fallen={false} />
          </span>
        </button>

        <div className="dg-mat"><span>GO AWAY</span></div>

        <div className="dg-bursts" ref={burstsRef} aria-hidden>
          <span /><span /><span /><span /><span /><span />
        </div>

        {stage >= 1 && (
          <button
            className={`dg-giveup ${denied ? "is-denied" : ""}`}
            onClick={giveUp}
          >
            {denied ? "DENIED." : "Give up? (it's easier)"}
          </button>
        )}
      </div>

      <div className="dg-talk" aria-live="polite">
        {themLine && (
          <div className="dg-bubble dg-bubble--them" key={`t${nos}`}>&ldquo;{themLine}&rdquo;</div>
        )}
        {youLine && (
          <div className="dg-bubble dg-bubble--you" key={`y${youIdx.current}`}>{youLine}</div>
        )}
        {!themLine && !youLine && (
          <div className="dg-bubble dg-bubble--hint">Tap the door. Keep tapping. Do not stop.</div>
        )}
      </div>
    </div>
  );
}

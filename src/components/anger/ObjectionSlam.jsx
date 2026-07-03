import React, { useEffect, useRef, useState } from "react";
import "../../styles/objection.css";
import { SLAM_CUSTOMERS, SLAM_REP, SLAM_WINS } from "../../data/angerVoiceLines";
import {
  sfxWhoosh,
  sfxImpact,
  sfxShatter,
  sfxZap,
  playVoiceLine,
  stopVoiceLine,
} from "../../lib/sfx";

/* ════════════════════════════════════════════════════════════════════════
   OBJECTION SLAM — rejection-resilience arcade.

   Three customers take turns hurling objections at you as flying speech
   bubbles. You slam each one back with a don't-care response before it
   lands. Deflections drive your CARES GIVEN meter toward zero; a landed
   objection just makes you flinch (+cares) and gets re-thrown LOUDER.
   No fail state — the only way through is to stop caring.

   It's turn-based (a volley every ~3s), so plain React state is fine;
   the flying bubble is a one-shot CSS animation frozen in place via
   animation-play-state when you smash it.

   Contract: { onClose, onComplete } — hub awards XP.
   (Trains the nervous system, not the sales script.)
   ════════════════════════════════════════════════════════════════════════ */

const ENTER_MS = 1700;
const WINDUP_MS = 750;
const SMASH_MS = 950;
const LANDED_MS = 1100;
const DEFEAT_MS = 1900;
const FLIGHT_MS = [2600, 2200, 1800];
const SUPER_FLIGHT_MS = 3200;

// Objection text + voice ids come from angerVoiceLines (baked mp3s); the
// personas stay here. Last objection of Mrs. NO is still the super volley.
const PERSONAS = [
  { name: "The Tire-Kicker", tagline: "Just looking. Always just looking.", emoji: "🤔", hurt: "😬", smug: "😏" },
  { name: "The Excuse Machine", tagline: "Has a reason for everything.", emoji: "😤", hurt: "😰", smug: "😏" },
  { name: "Mrs. NO", tagline: "Undefeated since 1987.", emoji: "👵", hurt: "😱", smug: "😏" },
];
const CUSTOMERS = PERSONAS.map((p, i) => ({ ...p, objections: SLAM_CUSTOMERS[i].objections }));

const RESPONSES = [
  "Cool story. Anyway—",
  "I don't give a fuck. Continue.",
  "You're buying anyway.",
  "Noted. Ignored.",
  "That's cute. NEXT.",
  "I've heard worse from my GPS.",
  "So anyway — here's the pen.",
  "My feelings called in sick.",
  "Is that ALL you got?",
  "Teflon. Nothing sticks.",
  "Weird way to say YES.",
  "Objection overruled.",
  "Fuck the maybe. It's a yes.",
];

const TAUNTS = ["HA! You FLINCHED!", "Got you with that one!", "That one stung, didn't it?", "Too slow, sunshine."];

function buzz(pattern) {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch {
    /* no haptics */
  }
}

function deal() {
  const pool = [...RESPONSES];
  const hand = [];
  while (hand.length < 3 && pool.length) {
    hand.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return hand;
}

export default function ObjectionSlam({ onClose, onComplete }) {
  const [phase, setPhase] = useState("brief"); // brief | battle | won
  const [cares, setCares] = useState(100);
  const [v, setVState] = useState(null); // {ci, oi, mode, shout, hand, said, perfect, taunt}

  const vRef = useRef(v);
  const setV = (next) => {
    const val = typeof next === "function" ? next(vRef.current) : next;
    vRef.current = val;
    setVState(val);
  };

  const timers = useRef([]);
  const landTimer = useRef(null);
  const flightStart = useRef(0);
  const stats = useRef({ deflected: 0, perfects: 0, flinches: 0 });

  const t = (fn, ms) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const isSuper = (ci, oi) => ci === 2 && oi === CUSTOMERS[2].objections.length - 1;
  const flightMs = (ci, oi) => (isSuper(ci, oi) ? SUPER_FLIGHT_MS : FLIGHT_MS[ci]);

  const enterCustomer = (ci) => {
    setV({ ci, oi: 0, mode: "enter", shout: false, hand: deal(), said: null, perfect: false, taunt: null });
    t(() => throwObjection(ci, 0, false), ENTER_MS);
  };

  const throwObjection = (ci, oi, shout) => {
    setV({ ci, oi, mode: "windup", shout, hand: deal(), said: null, perfect: false, taunt: null });
    const obj = CUSTOMERS[ci].objections[oi];
    // re-thrown objections come back LOUDER — "I SAID, ..."
    playVoiceLine(obj.id, { volume: shout ? 1 : 0.72, rate: shout ? 1.06 : 1 });
    t(() => {
      flightStart.current = Date.now();
      sfxWhoosh();
      setV((prev) => ({ ...prev, mode: "incoming" }));
      landTimer.current = t(() => land(ci, oi), flightMs(ci, oi));
    }, WINDUP_MS);
  };

  const deflect = (line) => {
    const cur = vRef.current;
    if (!cur || cur.mode !== "incoming") return;
    window.clearTimeout(landTimer.current);
    const progress = (Date.now() - flightStart.current) / flightMs(cur.ci, cur.oi);
    const perfect = progress >= 0.3 && progress <= 0.85;
    stats.current.deflected += 1;
    if (perfect) stats.current.perfects += 1;
    setCares((c) => Math.max(0, c - (perfect ? 16 : 12)));
    buzz(perfect ? [10, 30, 16] : 10);
    // rep stinger ladder: each slam hits harder and MOUTHIER than the last
    const idx = Math.min(SLAM_REP.length - 1, stats.current.deflected - 1);
    sfxImpact(1 + Math.min(4, idx) + (perfect ? 1 : 0));
    sfxShatter();
    t(() => playVoiceLine(SLAM_REP[idx].id, { volume: 0.55 + idx * 0.075 }), 220);
    setV({ ...cur, mode: "smash", said: line, perfect });
    t(() => advance(cur.ci, cur.oi), SMASH_MS);
  };

  const land = (ci, oi) => {
    stats.current.flinches += 1;
    setCares((c) => Math.min(100, c + 8));
    buzz([30, 40, 30]);
    sfxImpact(2);
    sfxZap();
    setV((prev) => ({ ...prev, mode: "landed", taunt: TAUNTS[stats.current.flinches % TAUNTS.length] }));
    t(() => throwObjection(ci, oi, true), LANDED_MS);
  };

  const advance = (ci, oi) => {
    if (oi + 1 < CUSTOMERS[ci].objections.length) {
      throwObjection(ci, oi + 1, false);
    } else {
      setV((prev) => ({ ...prev, mode: "defeat" }));
      buzz([20, 50, 20, 50, 60]);
      sfxImpact(6);
      t(() => playVoiceLine(SLAM_WINS[ci % SLAM_WINS.length].id, { volume: 1 }), 350);
      t(() => {
        if (ci + 1 < CUSTOMERS.length) enterCustomer(ci + 1);
        else setPhase("won");
      }, DEFEAT_MS);
    }
  };

  const start = () => {
    stats.current = { deflected: 0, perfects: 0, flinches: 0 };
    setCares(100);
    setPhase("battle");
    enterCustomer(0);
  };

  const seal = () => {
    stopVoiceLine();
    const s = stats.current;
    onComplete({
      deflected: s.deflected,
      perfects: s.perfects,
      flinches: s.flinches,
      cares,
      takeaway: `Objection Slam — ${s.deflected} objections crushed (${s.perfects} without blinking) · sold all 3 customers · cares given: ${cares}%`,
    });
  };

  /* ── BRIEF ── */
  if (phase === "brief") {
    return (
      <div className="ob-stage">
        <div className="ob-top">
          <button className="ob-back" onClick={onClose}>← Gym</button>
          <span className="ob-top__title">Objection Slam</span>
        </div>
        <div className="ob-brief">
          <p className="ob-eyebrow">Anger Gym · Rejection Resilience</p>
          <h2 className="ob-heading">They talk.<br />You don&rsquo;t flinch.</h2>
          <p className="ob-lead">
            Three customers. Every objection they&rsquo;ve got, hurled straight at your face. Your job:
            <b> slam each one back</b> before it lands, and drive your <b>CARES GIVEN</b> meter to zero.
            An objection is a ball to hit — not a verdict about you.
          </p>
          <div className="ob-science">
            <span className="ob-science__tag">Why this works</span>
            Objections light up the same threat circuits as insults — until repeated, playful exposure
            strips the charge (desensitization + cognitive defusion). Batting them away in here lowers
            the sting of the real ones out there. <b>This trains your nervous system, not your sales
            script</b> — stay human with real customers.
          </div>
          <div className="ob-rated">
            <span className="ob-rated__badge">21+</span>
            RAW MODE — the rep talks back like you WISH you could. Sound on, volume up.
          </div>
          <button className="ob-primary" onClick={start}>Ring the doorbell →</button>
        </div>
      </div>
    );
  }

  /* ── WON ── */
  if (phase === "won") {
    const s = stats.current;
    return (
      <div className="ob-stage">
        <div className="ob-top">
          <button className="ob-back" onClick={onClose}>← Gym</button>
          <span className="ob-top__title">Objection Slam</span>
        </div>
        <div className="ob-won">
          <div className="ob-won__stamp">SOLD ×3</div>
          <h2 className="ob-heading ob-heading--won">
            {cares <= 20 ? "ZERO CARES GIVEN." : `Cares given: ${cares}%`}
          </h2>
          <p className="ob-lead ob-lead--center">
            {cares <= 20
              ? "Teflon. Nothing stuck. Three customers emptied the tank on you and bought anyway."
              : "Still a little too generous with the caring — run it back and let even less stick."}
          </p>
          <div className="ob-stats">
            <div className="ob-stat"><b>{s.deflected}</b><span>slammed back</span></div>
            <div className="ob-stat"><b>{s.perfects}</b><span>didn&rsquo;t even blink</span></div>
            <div className="ob-stat"><b>{s.flinches}</b><span>flinches</span></div>
          </div>
          <button className="ob-primary" onClick={seal}>Collect the W →</button>
          <button className="ob-ghost" onClick={start}>Run it back</button>
        </div>
      </div>
    );
  }

  /* ── BATTLE ── */
  const c = CUSTOMERS[v.ci];
  const superVolley = isSuper(v.ci, v.oi);
  const objectionText = (v.shout ? "I SAID, " : "") + c.objections[v.oi].text;
  const face =
    v.mode === "defeat" ? "😵" :
    v.mode === "landed" ? c.smug :
    v.mode === "smash" ? c.hurt :
    c.emoji;

  return (
    <div className="ob-stage">
      <div className="ob-top">
        <button className="ob-back" onClick={onClose}>← Gym</button>
        <span className="ob-top__title">Objection Slam</span>
        <span className="ob-sold">🧾 {v.ci + (v.mode === "defeat" ? 1 : 0)}/3 sold</span>
      </div>

      <div className="ob-cares">
        <span className="ob-cares__label">Cares given</span>
        <div className="ob-cares__track">
          <div className="ob-cares__fill" style={{ transform: `scaleX(${cares / 100})` }} />
        </div>
        <span className="ob-cares__num">{cares}%</span>
      </div>

      <div
        className={`ob-arena ${superVolley && (v.mode === "windup" || v.mode === "incoming") ? "is-super" : ""} ${v.mode === "landed" ? "is-landed" : ""}`}
        data-mode={v.mode}
      >
        {/* customer */}
        <div className={`ob-cust ${v.mode === "windup" ? "is-windup" : ""} ${v.mode === "smash" ? "is-hit" : ""} ${v.mode === "defeat" ? "is-defeat" : ""}`}>
          <div className="ob-cust__frame">
            <span className="ob-cust__face">{face}</span>
          </div>
          <span className="ob-cust__plate">{c.name}</span>
        </div>

        {/* round intro */}
        {v.mode === "enter" && (
          <div className="ob-intro" key={v.ci}>
            <span className="ob-intro__round">Customer {v.ci + 1} of 3</span>
            <span className="ob-intro__name">{c.name}</span>
            <span className="ob-intro__tag">&ldquo;{c.tagline}&rdquo;</span>
          </div>
        )}

        {/* the objection in flight */}
        {(v.mode === "windup" || v.mode === "incoming" || v.mode === "smash" || v.mode === "landed") && (
          <div
            key={`${v.ci}-${v.oi}-${v.shout ? "s" : "n"}`}
            className={[
              "ob-obj",
              v.mode === "windup" ? "is-charging" : "",
              v.mode === "incoming" || v.mode === "smash" ? "is-flying" : "",
              v.mode === "smash" ? "is-smashed" : "",
              v.mode === "landed" ? "is-down" : "",
              superVolley ? "is-superbubble" : "",
            ].join(" ")}
            style={{ "--dur": `${flightMs(v.ci, v.oi)}ms` }}
          >
            <span className="ob-obj__bub">{objectionText}</span>
            <i className="ob-frag ob-frag--a" /><i className="ob-frag ob-frag--b" /><i className="ob-frag ob-frag--c" />
          </div>
        )}

        {/* your reply rockets up */}
        {v.mode === "smash" && (
          <>
            <div className="ob-reply">{v.said}</div>
            <div className={`ob-pow ${v.perfect ? "is-perfect" : ""}`}>
              {v.perfect ? "DIDN'T EVEN BLINK" : "SLAMMED"}
            </div>
          </>
        )}

        {/* landed taunt */}
        {v.mode === "landed" && <div className="ob-taunt">{v.taunt}</div>}

        {/* sold stamp per defeat */}
        {v.mode === "defeat" && <div className="ob-stamp">&ldquo;…FINE. Where do I sign?&rdquo;</div>}
      </div>

      {/* your hand */}
      <div className="ob-hand" data-active={v.mode === "incoming"}>
        {superVolley ? (
          <button
            className="ob-card ob-card--super"
            onPointerDown={() => deflect("WATCH ME.")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); deflect("WATCH ME."); } }}
          >
            WATCH ME.
          </button>
        ) : (
          v.hand.map((line) => (
            <button
              key={line}
              className="ob-card"
              onPointerDown={() => deflect(line)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); deflect(line); } }}
            >
              {line}
            </button>
          ))
        )}
        <p className="ob-hand__hint">
          {v.mode === "incoming"
            ? "Slam it back — don't let it land!"
            : v.mode === "windup"
              ? "Incoming…"
              : v.mode === "landed"
                ? "You flinched. Shake it off — here it comes again."
                : " "}
        </p>
      </div>
    </div>
  );
}

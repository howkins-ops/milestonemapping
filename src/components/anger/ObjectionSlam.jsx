import React, { useEffect, useRef, useState } from "react";
import "../../styles/objection.css";
import { SLAM_CUSTOMERS, SLAM_RESPONSES, SLAM_IMPRESSED, SLAM_WINS, SLAM_SUPER } from "../../data/angerVoiceLines.js";
import {
  sfxWhoosh,
  sfxImpact,
  sfxShatter,
  sfxZap,
  playVoiceLine,
  stopVoiceLine,
} from "../../lib/sfx";

/* ════════════════════════════════════════════════════════════════════════
   OBJECTION SLAM — rejection-resilience arcade, 3 independent levels.

   Pick a customer from the level-select grid, then slam every objection
   they hurl at you as a flying speech bubble before it lands. Deflections
   drive the CARES GIVEN meter toward zero; a landed objection just makes
   you flinch (+cares) and gets re-thrown LOUDER. No fail state — the only
   way through is to stop caring.

   Every response card is individually voiced (baked mp3, id === filename)
   so whatever you click is exactly what the rep says. A random "charm"
   roll on each deflect (boosted by perfect timing / streaks) can end a
   level early — the customer drops the act and closes on charisma instead
   of attrition.

   It's turn-based (a volley every ~2-3s), so plain React state is fine;
   the flying bubble is a one-shot CSS animation frozen in place via
   animation-play-state when you smash it.

   Contract: { onClose, onComplete } — hub awards XP per level cleared.
   (Trains the nervous system, not the sales script.)
   ════════════════════════════════════════════════════════════════════════ */

const ENTER_MS = 1700;
const WINDUP_MS = 750;
const SMASH_MS = 950;
const LANDED_MS = 1100;
const DEFEAT_MS = 1900;
const CHARM_MS = 2200;
const FLIGHT_MS = [2600, 2200, 1800]; // per level — gets faster/harder
const SUPER_FLIGHT_MS = 3200;

const BASE_CHARM = 0.08;
const PERFECT_CHARM_BONUS = 0.14;
const STREAK_BONUS_STEP = 0.05;
const STREAK_CAP = 3;

// Objection/response/impressed text + voice ids come from angerVoiceLines
// (baked mp3s); persona flavor stays here. Mrs. NO's last objection is the
// scripted super volley boss beat — the charm roll never touches it.
const PERSONAS = [
  { name: "The Tire-Kicker", tagline: "Just looking. Always just looking.", emoji: "🤔", hurt: "😬", smug: "😏", charmedFace: "🥹", accent: "#00FFBF", difficulty: "Rookie" },
  { name: "The Excuse Machine", tagline: "Has a reason for everything.", emoji: "😤", hurt: "😰", smug: "😏", charmedFace: "😌", accent: "#D11EFF", difficulty: "Veteran" },
  { name: "Mrs. NO", tagline: "Undefeated since 1987.", emoji: "👵", hurt: "😱", smug: "😏", charmedFace: "😳", accent: "#FF3EDB", difficulty: "Boss" },
];

const LEVELS = PERSONAS.map((p, i) => ({
  ...p,
  key: SLAM_CUSTOMERS[i].key,
  objections: SLAM_CUSTOMERS[i].objections,
  impressed: SLAM_IMPRESSED[SLAM_CUSTOMERS[i].key],
}));

const TAUNTS = ["HA! You FLINCHED!", "Got you with that one!", "That one stung, didn't it?", "Too slow, sunshine."];

function buzz(pattern) {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch {
    /* no haptics */
  }
}

function deal() {
  const pool = [...SLAM_RESPONSES];
  const hand = [];
  while (hand.length < 3 && pool.length) {
    hand.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return hand;
}

function Top({ label, onBack, children }) {
  return (
    <div className="ob-top">
      <button className="ob-back" onClick={onBack}>← {label}</button>
      <span className="ob-top__title">Objection Slam</span>
      {children}
    </div>
  );
}

export default function ObjectionSlam({ onClose, onComplete }) {
  const [phase, setPhase] = useState("brief"); // brief | select | battle | cleared
  const [clearedSet, setClearedSet] = useState(() => new Set());
  const [cares, setCaresState] = useState(100);
  const [v, setVState] = useState(null); // {oi, mode, shout, hand, said, perfect, taunt, impressedText}

  const vRef = useRef(v);
  const setV = (next) => {
    const val = typeof next === "function" ? next(vRef.current) : next;
    vRef.current = val;
    setVState(val);
  };

  const caresRef = useRef(100);
  const setCares = (next) => {
    setCaresState((c) => {
      const val = typeof next === "function" ? next(c) : next;
      caresRef.current = val;
      return val;
    });
  };

  const levelIdxRef = useRef(null);
  const L = () => LEVELS[levelIdxRef.current];

  const timers = useRef([]);
  const landTimer = useRef(null);
  const flightStart = useRef(0);
  const stats = useRef({ deflected: 0, perfects: 0, streak: 0, flinches: 0 });

  const t = (fn, ms) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const isSuper = (oi) => levelIdxRef.current === 2 && oi === LEVELS[2].objections.length - 1;
  const flightMs = (oi) => (isSuper(oi) ? SUPER_FLIGHT_MS : FLIGHT_MS[levelIdxRef.current]);

  const enterLevel = () => {
    setV({ oi: 0, mode: "enter", shout: false, hand: deal(), said: null, perfect: false, taunt: null, impressedText: null });
    t(() => throwObjection(0, false), ENTER_MS);
  };

  const throwObjection = (oi, shout) => {
    const lvl = L();
    setV({ oi, mode: "windup", shout, hand: deal(), said: null, perfect: false, taunt: null, impressedText: null });
    const obj = lvl.objections[oi];
    // re-thrown objections come back LOUDER — "I SAID, ..."
    playVoiceLine(obj.id, { volume: shout ? 1 : 0.72, rate: shout ? 1.06 : 1 });
    t(() => {
      flightStart.current = Date.now();
      sfxWhoosh();
      setV((prev) => ({ ...prev, mode: "incoming" }));
      landTimer.current = t(() => land(oi), flightMs(oi));
    }, WINDUP_MS);
  };

  const deflect = (response) => {
    const cur = vRef.current;
    if (!cur || cur.mode !== "incoming") return;
    window.clearTimeout(landTimer.current);
    const progress = (Date.now() - flightStart.current) / flightMs(cur.oi);
    const perfect = progress >= 0.3 && progress <= 0.85;
    const s = stats.current;
    s.deflected += 1;
    if (perfect) {
      s.perfects += 1;
      s.streak += 1;
    } else {
      s.streak = 0;
    }
    setCares((c) => Math.max(0, c - (perfect ? 16 : 12)));
    buzz(perfect ? [10, 30, 16] : 10);
    // whatever the player clicked is exactly what the rep says — every
    // response line is individually voiced, volume/rate ramp with combo
    sfxImpact(1 + Math.min(4, s.deflected - 1) + (perfect ? 1 : 0));
    sfxShatter();
    t(() => playVoiceLine(response.id, {
      volume: Math.min(1, 0.58 + s.deflected * 0.05),
      rate: 1 + Math.min(0.15, (s.deflected - 1) * 0.015),
    }), 200);
    setV({ ...cur, mode: "smash", said: response.text, perfect });

    if (!isSuper(cur.oi)) {
      const chance = BASE_CHARM + (perfect ? PERFECT_CHARM_BONUS : 0) + Math.min(STREAK_CAP, s.streak) * STREAK_BONUS_STEP;
      if (Math.random() < chance) {
        t(() => charm(), SMASH_MS);
        return;
      }
    }
    t(() => advance(cur.oi), SMASH_MS);
  };

  const charm = () => {
    const lvl = L();
    buzz([16, 40, 16, 40, 60]);
    sfxImpact(5);
    const pool = lvl.impressed;
    const line = pool[Math.floor(Math.random() * pool.length)];
    t(() => playVoiceLine(line.id, { volume: 1 }), 250);
    setV((prev) => ({ ...prev, mode: "charmed", impressedText: line.text }));
    t(() => finish(true), CHARM_MS);
  };

  const land = (oi) => {
    const s = stats.current;
    s.flinches += 1;
    s.streak = 0;
    setCares((c) => Math.min(100, c + 8));
    buzz([30, 40, 30]);
    sfxImpact(2);
    sfxZap();
    setV((prev) => ({ ...prev, mode: "landed", taunt: TAUNTS[s.flinches % TAUNTS.length] }));
    t(() => throwObjection(oi, true), LANDED_MS);
  };

  const advance = (oi) => {
    const lvl = L();
    if (oi + 1 < lvl.objections.length) {
      throwObjection(oi + 1, false);
    } else {
      setV((prev) => ({ ...prev, mode: "defeat" }));
      buzz([20, 50, 20, 50, 60]);
      sfxImpact(6);
      t(() => playVoiceLine(SLAM_WINS[levelIdxRef.current % SLAM_WINS.length].id, { volume: 1 }), 350);
      t(() => finish(false), DEFEAT_MS);
    }
  };

  const finish = (closedEarly) => {
    const lvl = L();
    setClearedSet((prev) => new Set(prev).add(lvl.key));
    setPhase("cleared");
    seal(closedEarly);
  };

  const seal = (closedEarly) => {
    stopVoiceLine();
    const lvl = L();
    const s = stats.current;
    onComplete({
      level: lvl.key,
      closedEarly,
      deflected: s.deflected,
      perfects: s.perfects,
      flinches: s.flinches,
      cares: caresRef.current,
      takeaway: closedEarly
        ? `Objection Slam — closed ${lvl.name} early on pure charisma (${s.deflected} slammed back, ${s.perfects} without blinking).`
        : `Objection Slam — ${lvl.name} worn down to ${caresRef.current}% cares (${s.deflected} objections crushed, ${s.perfects} without blinking).`,
    });
  };

  const start = (idx) => {
    levelIdxRef.current = idx;
    stats.current = { deflected: 0, perfects: 0, streak: 0, flinches: 0 };
    setCares(100);
    setPhase("battle");
    enterLevel();
  };

  const backToSelect = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    window.clearTimeout(landTimer.current);
    stopVoiceLine();
    setV(null);
    setPhase("select");
  };

  /* ── BRIEF ── */
  if (phase === "brief") {
    return (
      <div className="ob-stage">
        <Top label="Gym" onBack={onClose} />
        <div className="ob-brief">
          <p className="ob-eyebrow">Anger Gym · Rejection Resilience</p>
          <h2 className="ob-heading">They talk.<br />You don&rsquo;t flinch.</h2>
          <p className="ob-lead">
            Three customers, three fights. Pick one and every objection they&rsquo;ve got gets hurled
            straight at your face. Your job: <b>slam each one back</b> before it lands, and drive your
            <b> CARES GIVEN</b> meter to zero. An objection is a ball to hit — not a verdict about you.
            Sometimes they respect the hustle and close early. Sometimes you grind them to nothing.
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
          <button className="ob-primary" onClick={() => setPhase("select")}>Pick your fight →</button>
        </div>
      </div>
    );
  }

  /* ── SELECT ── */
  if (phase === "select") {
    return (
      <div className="ob-stage">
        <Top label="Gym" onBack={onClose} />
        <div className="ob-select">
          <p className="ob-eyebrow">Pick your customer</p>
          <div className="ob-select__grid">
            {LEVELS.map((lvl, i) => (
              <button
                key={lvl.key}
                className="ob-select__card"
                style={{ "--acc": lvl.accent }}
                onClick={() => start(i)}
              >
                {clearedSet.has(lvl.key) && <span className="ob-select__cleared">✓ SOLD</span>}
                <span className="ob-select__face">{lvl.emoji}</span>
                <span className="ob-select__diff">{lvl.difficulty}</span>
                <h3>{lvl.name}</h3>
                <p>&ldquo;{lvl.tagline}&rdquo;</p>
                <span className="ob-select__cta">Fight →</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── CLEARED ── */
  if (phase === "cleared") {
    const s = stats.current;
    const lvl = L();
    const charmed = v?.mode === "charmed";
    return (
      <div className="ob-stage">
        <Top label="Levels" onBack={backToSelect} />
        <div className={`ob-won ${charmed ? "ob-won--charmed" : ""}`}>
          <div className="ob-won__stamp">{charmed ? "CHARMED" : "SOLD"}</div>
          <h2 className="ob-heading ob-heading--won">
            {charmed ? `${lvl.name} respects you.` : (caresRef.current <= 20 ? "ZERO CARES GIVEN." : `Cares given: ${caresRef.current}%`)}
          </h2>
          <p className="ob-lead ob-lead--center">
            {charmed
              ? `“${v.impressedText}”`
              : (caresRef.current <= 20
                ? "Teflon. Nothing stuck. They emptied the tank on you and bought anyway."
                : "Still a little too generous with the caring — run it back and let even less stick.")}
          </p>
          <div className="ob-stats">
            <div className="ob-stat"><b>{s.deflected}</b><span>slammed back</span></div>
            <div className="ob-stat"><b>{s.perfects}</b><span>didn&rsquo;t even blink</span></div>
            <div className="ob-stat"><b>{s.flinches}</b><span>flinches</span></div>
          </div>
          <button className="ob-primary" onClick={() => start(levelIdxRef.current)}>Run it back</button>
          <button className="ob-ghost" onClick={backToSelect}>Back to levels</button>
        </div>
      </div>
    );
  }

  /* ── BATTLE ── */
  const lvl = L();
  const superVolley = isSuper(v.oi);
  const objectionText = (v.shout ? "I SAID, " : "") + lvl.objections[v.oi].text;
  const face =
    v.mode === "charmed" ? lvl.charmedFace :
    v.mode === "defeat" ? "😵" :
    v.mode === "landed" ? lvl.smug :
    v.mode === "smash" ? lvl.hurt :
    lvl.emoji;

  return (
    <div className="ob-stage">
      <Top label="Levels" onBack={backToSelect}>
        <span className="ob-sold">🧾 {stats.current.deflected} slammed</span>
      </Top>

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
        <div className={`ob-cust ${v.mode === "windup" ? "is-windup" : ""} ${v.mode === "smash" ? "is-hit" : ""} ${v.mode === "defeat" || v.mode === "charmed" ? "is-defeat" : ""}`}>
          <div className="ob-cust__frame">
            <span className="ob-cust__face">{face}</span>
          </div>
          <span className="ob-cust__plate">{lvl.name}</span>
        </div>

        {/* round intro */}
        {v.mode === "enter" && (
          <div className="ob-intro" key={lvl.key}>
            <span className="ob-intro__round">{lvl.difficulty}</span>
            <span className="ob-intro__name">{lvl.name}</span>
            <span className="ob-intro__tag">&ldquo;{lvl.tagline}&rdquo;</span>
          </div>
        )}

        {/* the objection in flight */}
        {(v.mode === "windup" || v.mode === "incoming" || v.mode === "smash" || v.mode === "landed") && (
          <div
            key={`${v.oi}-${v.shout ? "s" : "n"}`}
            className={[
              "ob-obj",
              v.mode === "windup" ? "is-charging" : "",
              v.mode === "incoming" || v.mode === "smash" ? "is-flying" : "",
              v.mode === "smash" ? "is-smashed" : "",
              v.mode === "landed" ? "is-down" : "",
              superVolley ? "is-superbubble" : "",
            ].join(" ")}
            style={{ "--dur": `${flightMs(v.oi)}ms` }}
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

        {/* sold stamp on attrition defeat */}
        {v.mode === "defeat" && <div className="ob-stamp">&ldquo;…FINE. Where do I sign?&rdquo;</div>}

        {/* charmed early-win beat */}
        {v.mode === "charmed" && (
          <div className="ob-charm">
            <span className="ob-charm__tag">Impressed</span>
            &ldquo;{v.impressedText}&rdquo;
          </div>
        )}
      </div>

      {/* your hand */}
      <div className="ob-hand" data-active={v.mode === "incoming"}>
        {superVolley ? (
          <button
            className="ob-card ob-card--super"
            onPointerDown={() => deflect(SLAM_SUPER)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); deflect(SLAM_SUPER); } }}
          >
            WATCH ME.
          </button>
        ) : (
          v.hand.map((response) => (
            <button
              key={response.id}
              className="ob-card"
              onPointerDown={() => deflect(response)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); deflect(response); } }}
            >
              {response.text}
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

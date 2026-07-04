import React, { useEffect, useMemo, useRef, useState } from "react";
import "../../styles/door-game.css";
import {
  DOOR_TIERS,
  DOOR_REP_R1,
  DOOR_NIGHT,
  DOOR_REP_R2,
  DOOR_BURST,
  DOOR_FIGHT_THEM,
  DOOR_FIGHT_REP,
  DOOR_KO,
  DOOR_WIFE,
} from "../../data/angerVoiceLines";
import {
  sfxKnock,
  sfxImpact,
  sfxDoorBreak,
  sfxZap,
  sfxDoorbell,
  sfxRoundBell,
  sfxPunch,
  sfxBlock,
  sfxWhoosh,
  playVoiceLine,
  stopVoiceLine,
} from "../../lib/sfx";

/* ════════════════════════════════════════════════════════════════════════
   THE DOOR — persistence arcade, now a three-round comedy cinema.

   R1 · THE KNOCK      — daylight. Knock, get screamed at, talk back (voiced).
   R2 · THE MIDNIGHT CLOSE — 11:58 PM, final night of the sales competition.
        Doorbell + fists. The resolve bar DRAINS if you stop. WHAMs are
        louder, Harold is unhinged, the rep does not care.
   R3 · THE PORCH      — Harold bursts out. Boxing minigame: duck the swing,
        punch the opening. Lose and you nap on the porch. Win and the wife
        walks out, melts, and signs the deal. Trophy. Credits.

   Door destruction is one custom property (--p, 0→1) set imperatively per
   tap; React state only changes on dialogue/round beats. The --p value in
   the style prop stays CONSTANT per phase so React never claws it back.

   Contract: { onClose, onComplete } — hub awards XP.
   ════════════════════════════════════════════════════════════════════════ */

const KNOCKS_R1 = 24; // round 1 taps → damage 0 → .5
const TAPS_R2 = 34; // round 2 taps → damage .5 → 1 (minus drain)
const LINE_EVERY = 3; // taps between dialogue beats — dense, they argue CONSTANTLY
const STAGE_AT = [0, 0.2, 0.4, 0.62, 0.82]; // damage stage thresholds (5 rage tiers)
const VOICE_VOL = [0.45, 0.6, 0.75, 0.9, 1.0];
const DRAIN_AFTER_MS = 900; // r2: idle this long and the bar starts bleeding
const DRAIN_PER_TICK = 0.55; // r2: tap-equivalents lost per 300ms tick

const DOORS = [
  { id: "customers", emoji: "🚪", label: "Real customers" },
  { id: "goal", emoji: "🎯", label: "A goal that keeps saying no" },
  { id: "callback", emoji: "📞", label: "The call I'm avoiding" },
  { id: "life", emoji: "🌍", label: "Life in general" },
  { id: "any", emoji: "👊", label: "Just let me knock" },
];

const THEM = DOOR_TIERS.map((t) => t.lines);

const KNOCK_WORDS = ["KNOCK", "BANG", "BAM", "BAM BAM", "WHAM", "THUD"];
const NIGHT_WORDS = ["WHAM", "DING DONG", "BOOM", "BAM BAM", "WHAM!!", "RRRING"];
const POWER_WORDS = ["BOOM!", "BAM!!", "CRACK!!", "WHAM!!!"];
const PUNCH_WORDS = ["POW!", "BIFF!", "SOCK!", "JAB!", "BAM!"];

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

/* The door itself — wrapper takes the lean/burst, inner takes the shake. */
function Door({ burst }) {
  return (
    <div className={`dg-doorwrap ${burst ? "is-burst" : ""}`}>
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
        <span className="dg-plank dg-plank--1" />
        <span className="dg-plank dg-plank--2" />
      </div>
    </div>
  );
}

/* Letterboxed title card between rounds. */
function CineCard({ eyebrow, title, lines, cta, onNext }) {
  return (
    <div className="dg-cine">
      <div className="dg-cine__bar dg-cine__bar--t" />
      <div className="dg-cine__body">
        <p className="dg-cine__eyebrow">{eyebrow}</p>
        <h2 className="dg-cine__title">{title}</h2>
        {lines.map((l, i) => (
          <p key={i} className="dg-cine__line" style={{ animationDelay: `${0.5 + i * 0.55}s` }}>
            {l}
          </p>
        ))}
        <button className="dg-primary dg-cine__cta" onClick={onNext}>
          {cta}
        </button>
      </div>
      <div className="dg-cine__bar dg-cine__bar--b" />
    </div>
  );
}

export default function TheDoor({ onClose, onComplete }) {
  // brief | r1 | cine2 | r2 | cine3 | fight | wife | seal
  const [phase, setPhase] = useState("brief");
  const [doorFor, setDoorFor] = useState(null);
  const [stage, setStage] = useState(0);
  const [nos, setNos] = useState(0);
  const [rings, setRings] = useState(0);
  const [themLine, setThemLine] = useState(null);
  const [youLine, setYouLine] = useState(null);
  const [denied, setDenied] = useState(false);
  const [draining, setDraining] = useState(false);
  const [bursting, setBursting] = useState(false);

  // fight state (render mirrors — refs are authoritative)
  const [pHp, setPHp] = useState(100);
  const [hHp, setHHp] = useState(100);
  const [hState, setHState] = useState("guard"); // guard | windup | swing | open | ko
  const [ducking, setDucking] = useState(false);
  const [fightNote, setFightNote] = useState(null);
  const [fightKo, setFightKo] = useState(false);

  // wife finale beats
  const [wifeBeat, setWifeBeat] = useState(0); // 0 arrive · 1 line1 · 2 line2 · 3 contract

  const sceneRef = useRef(null);
  const doorRef = useRef(null);
  const flashRef = useRef(null);
  const burstsRef = useRef(null);
  const knocksRef = useRef(0);
  const ringsRef = useRef(0);
  const punchesRef = useRef(0);
  const napsRef = useRef(0); // times Harold flattened you
  const r2Ref = useRef({ taps: 0, prog: 0, lastTap: 0, drainNoted: false });
  const burstIdx = useRef(0);
  const themIdx = useRef(0);
  const youIdx = useRef(0);
  const doneRef = useRef(false);
  const timersRef = useRef([]);
  const f = useRef({ hHp: 100, pHp: 100, state: "guard", ducking: false, lastPunch: 0, over: false });

  const doorLabel = useMemo(() => (DOORS.find((d) => d.id === doorFor) || {}).label, [doorFor]);

  const schedule = (fn, ms) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  };
  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };
  useEffect(
    () => () => {
      clearTimers();
      stopVoiceLine();
    },
    []
  );

  const retrigger = (el, cls) => {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth; // reflow so the animation restarts (tap-frequency, not per-frame)
    el.classList.add(cls);
  };

  const spawnBurst = (e, power, words) => {
    const pool = burstsRef.current;
    if (!pool) return;
    const node = pool.children[burstIdx.current % pool.children.length];
    burstIdx.current += 1;
    const rect = pool.getBoundingClientRect();
    const x = e && e.clientX ? e.clientX - rect.left : rect.width / 2;
    const y = e && e.clientY ? e.clientY - rect.top : rect.height / 2;
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.textContent = words[Math.floor(Math.random() * words.length)];
    node.classList.toggle("is-power", power);
    retrigger(node, "is-live");
  };

  /* ── ROUND 1 — the knock ──────────────────────────────────────────── */

  const knockR1 = (e) => {
    if (doneRef.current) return;
    knocksRef.current += 1;
    const n = knocksRef.current;
    const p = Math.min(1, n / KNOCKS_R1) * 0.5;
    const power = n % 10 === 0;
    const s = stageFor(p);

    const el = sceneRef.current;
    if (el) el.style.setProperty("--p", String(p));
    retrigger(doorRef.current, power ? "is-pounded" : "is-hit");
    if (power) retrigger(flashRef.current, "is-live");
    spawnBurst(e, power, power ? POWER_WORDS : KNOCK_WORDS);
    buzz(power ? [14, 30, 20] : 8);
    if (power) sfxImpact(2 + s);
    else sfxKnock(1 + s);

    setStage((prev) => (prev === s ? prev : s));

    // dialogue beats — their NO vs your comeback, both VOICED now
    if (n % (LINE_EVERY * 2) === LINE_EVERY) {
      const pool = THEM[s];
      const line = pool[themIdx.current % pool.length];
      setThemLine(line.text);
      setYouLine(null);
      themIdx.current += 1;
      setNos((v) => v + 1);
      playVoiceLine(line.id, { volume: VOICE_VOL[s], rate: 1 + s * 0.02 });
    } else if (n % (LINE_EVERY * 2) === 0 && n < KNOCKS_R1) {
      const rep = DOOR_REP_R1[youIdx.current % DOOR_REP_R1.length];
      setYouLine(rep.text);
      setThemLine(null);
      youIdx.current += 1;
      playVoiceLine(rep.id, { volume: 0.9 });
    }

    if (n >= KNOCKS_R1 && !doneRef.current) {
      doneRef.current = true;
      buzz([20, 40, 20]);
      // cliffhanger — he dares you, the screen smash-cuts to midnight
      const dare = DOOR_TIERS[3].lines[2];
      setThemLine(dare.text);
      setYouLine(null);
      setNos((v) => v + 1);
      playVoiceLine(dare.id, { volume: 1 });
      schedule(() => {
        doneRef.current = false;
        themIdx.current = 0;
        youIdx.current = 0;
        setThemLine(null);
        setYouLine(null);
        setPhase("cine2");
      }, 1600);
    }
  };

  /* ── ROUND 2 — the midnight close ─────────────────────────────────── */

  const applyR2 = () => {
    const r2 = r2Ref.current;
    const p = 0.5 + Math.min(1, r2.prog / TAPS_R2) * 0.5;
    const el = sceneRef.current;
    if (el) el.style.setProperty("--p", String(p));
    return p;
  };

  // the drain: stop tapping at midnight and Harold starts winning
  useEffect(() => {
    if (phase !== "r2") return undefined;
    const iv = window.setInterval(() => {
      if (doneRef.current) return;
      const r2 = r2Ref.current;
      const idle = performance.now() - r2.lastTap > DRAIN_AFTER_MS;
      if (idle && r2.prog > 0) {
        r2.prog = Math.max(0, r2.prog - DRAIN_PER_TICK);
        applyR2();
        if (!r2.drainNoted) {
          r2.drainNoted = true;
          setDraining(true);
          setYouLine(null);
          setThemLine(null);
        }
      } else if (!idle && r2.drainNoted) {
        r2.drainNoted = false;
        setDraining(false);
      }
    }, 300);
    return () => window.clearInterval(iv);
  }, [phase]);

  const tapR2 = (e, isRing) => {
    if (doneRef.current) return;
    const r2 = r2Ref.current;
    r2.taps += 1;
    r2.prog = Math.min(TAPS_R2, r2.prog + 1);
    r2.lastTap = performance.now();
    if (isRing) {
      ringsRef.current += 1;
      setRings(ringsRef.current);
    } else {
      knocksRef.current += 1;
    }
    const t = r2.taps;
    const p = applyR2();
    const s = stageFor(p);
    const power = t % 6 === 0;

    retrigger(doorRef.current, power ? "is-pounded" : "is-hit");
    if (power) retrigger(flashRef.current, "is-live");
    spawnBurst(e, power, isRing ? NIGHT_WORDS : power ? POWER_WORDS : NIGHT_WORDS);
    buzz(power ? [18, 36, 24] : 10);
    // midnight WHAMs run levels 7–8 — the loudest the bus allows
    if (power) sfxImpact(Math.min(8, 5 + s));
    else if (isRing) sfxDoorbell(s >= 3);
    else sfxKnock(Math.min(8, 3 + s));

    setStage((prev) => (prev === s ? prev : s));

    if (t % (LINE_EVERY * 2) === LINE_EVERY) {
      const line = DOOR_NIGHT[themIdx.current % DOOR_NIGHT.length];
      setThemLine(line.text);
      setYouLine(null);
      themIdx.current += 1;
      setNos((v) => v + 1);
      playVoiceLine(line.id, { volume: 1, rate: 1.04 });
    } else if (t % (LINE_EVERY * 2) === 0) {
      const rep = DOOR_REP_R2[youIdx.current % DOOR_REP_R2.length];
      setYouLine(rep.text);
      setThemLine(null);
      youIdx.current += 1;
      playVoiceLine(rep.id, { volume: 1, rate: 1.02 });
    }

    if (r2.prog >= TAPS_R2 && !doneRef.current) {
      doneRef.current = true;
      setDraining(false);
      buzz([30, 60, 30, 60, 120]);
      sfxDoorBreak();
      sfxImpact(8);
      setThemLine(DOOR_BURST.text);
      setYouLine(null);
      setBursting(true);
      schedule(() => playVoiceLine(DOOR_BURST.id, { volume: 1 }), 250);
      schedule(() => {
        doneRef.current = false;
        setBursting(false);
        setThemLine(null);
        setPhase("cine3");
      }, 2300);
    }
  };

  /* ── ROUND 3 — the porch fight ────────────────────────────────────── */

  const setHarold = (state) => {
    f.current.state = state;
    setHState(state);
  };

  const haroldBark = () => {
    const line = DOOR_FIGHT_THEM[1 + Math.floor(Math.random() * (DOOR_FIGHT_THEM.length - 1))];
    playVoiceLine(line.id, { volume: 1 });
    setThemLine(line.text);
    setYouLine(null);
  };
  const repBark = () => {
    const line = DOOR_FIGHT_REP[Math.floor(Math.random() * DOOR_FIGHT_REP.length)];
    playVoiceLine(line.id, { volume: 0.95 });
    setYouLine(line.text);
    setThemLine(null);
  };

  const loopGuard = () => {
    if (f.current.over) return;
    setHarold("guard");
    schedule(beginWindup, 700 + Math.random() * 700);
  };

  const beginWindup = () => {
    if (f.current.over) return;
    // telegraph shrinks as Harold gets desperate — this is the difficulty curve
    const dur = Math.max(380, 700 - (100 - f.current.hHp) * 3.2);
    setHarold("windup");
    const fake = f.current.hHp < 75 && Math.random() < 0.28;
    if (fake) {
      schedule(() => {
        if (f.current.over) return;
        setHarold("guard");
        setFightNote("FAKE-OUT! He's messing with you.");
        schedule(beginWindup, 450 + Math.random() * 500);
      }, dur * 0.6);
    } else {
      schedule(swing, dur);
    }
  };

  const swing = () => {
    if (f.current.over) return;
    setHarold("swing");
    schedule(() => {
      if (f.current.over) return;
      if (f.current.ducking) {
        spawnBurst(null, true, ["WHIFF!", "SWISH!", "AIR!"]);
        sfxWhoosh();
        setFightNote("OPENING — HIT HIM!");
        setHarold("open");
        repBark();
        schedule(() => {
          if (f.current.over || f.current.state !== "open") return;
          setFightNote(null);
          loopGuard();
        }, 850);
      } else {
        f.current.pHp = Math.max(0, f.current.pHp - 17);
        setPHp(f.current.pHp);
        sfxImpact(6);
        buzz([20, 50, 20]);
        retrigger(flashRef.current, "is-hurt");
        spawnBurst(null, true, ["SMACK!!", "OOF!!", "WALLOP!"]);
        haroldBark();
        if (f.current.pHp <= 0) {
          playerKO();
          return;
        }
        loopGuard();
      }
    }, 240);
  };

  const punch = (e) => {
    if (phase !== "fight" || f.current.over) return;
    const now = performance.now();
    if (now - f.current.lastPunch < 230) return;
    f.current.lastPunch = now;
    if (f.current.ducking) {
      setFightNote("Can't punch while hiding!");
      return;
    }
    punchesRef.current += 1;
    const st = f.current.state;
    if (st === "open") {
      const dmg = 8 + Math.round(Math.random() * 4);
      f.current.hHp = Math.max(0, f.current.hHp - dmg);
      setHHp(f.current.hHp);
      sfxPunch(3);
      buzz([10, 20, 10]);
      spawnBurst(e, true, PUNCH_WORDS);
      retrigger(doorRef.current, "is-hit"); // doorRef points at Harold's shake span here
    } else if (st === "windup" || st === "swing") {
      f.current.hHp = Math.max(0, f.current.hHp - 2);
      setHHp(f.current.hHp);
      sfxPunch(1);
      spawnBurst(e, false, ["CLIP", "GRAZE"]);
    } else {
      f.current.hHp = Math.max(0, f.current.hHp - 1);
      setHHp(f.current.hHp);
      sfxBlock();
      spawnBurst(e, false, ["BLOCKED", "GUARD"]);
    }
    if (f.current.hHp <= 0) haroldKO();
  };

  const duckOn = () => {
    if (f.current.over) return;
    f.current.ducking = true;
    setDucking(true);
  };
  const duckOff = () => {
    f.current.ducking = false;
    setDucking(false);
  };

  const playerKO = () => {
    f.current.over = true;
    clearTimers();
    napsRef.current += 1;
    setFightKo(true);
    setFightNote(null);
    sfxZap();
    playVoiceLine(DOOR_FIGHT_THEM[1].id, { volume: 1 }); // "I took karate in 1987!"
  };

  const haroldKO = () => {
    f.current.over = true;
    clearTimers();
    setHarold("ko");
    setFightNote(null);
    setThemLine(null);
    setYouLine(null);
    sfxImpact(7);
    buzz([30, 60, 30, 90]);
    schedule(() => playVoiceLine(DOOR_KO.id, { volume: 0.9 }), 600);
    schedule(() => setPhase("wife"), 2100);
  };

  const startFight = () => {
    clearTimers();
    f.current = { hHp: 100, pHp: 100, state: "guard", ducking: false, lastPunch: 0, over: false };
    setPHp(100);
    setHHp(100);
    setDucking(false);
    setFightKo(false);
    setFightNote("Hold DUCK when he winds up 😤 — then punch the opening.");
    setThemLine(null);
    setYouLine(null);
    setPhase("fight");
    sfxRoundBell();
    playVoiceLine(DOOR_FIGHT_THEM[0].id, { volume: 1 });
    setHarold("guard");
    schedule(beginWindup, 1800);
  };

  /* ── the wife finale ──────────────────────────────────────────────── */

  useEffect(() => {
    if (phase !== "wife") return;
    setWifeBeat(0);
    schedule(() => {
      setWifeBeat(1);
      playVoiceLine(DOOR_WIFE[0].id, { volume: 1 });
    }, 900);
    schedule(() => {
      setWifeBeat(2);
      playVoiceLine(DOOR_WIFE[1].id, { volume: 1 });
    }, 5400);
    schedule(() => {
      setWifeBeat(3);
      sfxRoundBell();
    }, 9200);
    // schedule() ids are cleared by the shared unmount cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ── plumbing ─────────────────────────────────────────────────────── */

  const giveUp = (msg) => {
    setDenied(true);
    setYouLine(msg);
    setThemLine(null);
    buzz([8, 40, 8]);
    sfxZap();
    schedule(() => setDenied(false), 1200);
  };

  const reset = () => {
    clearTimers();
    stopVoiceLine();
    doneRef.current = false;
    knocksRef.current = 0;
    ringsRef.current = 0;
    punchesRef.current = 0;
    napsRef.current = 0;
    r2Ref.current = { taps: 0, prog: 0, lastTap: 0, drainNoted: false };
    themIdx.current = Math.floor(Math.random() * 5);
    youIdx.current = Math.floor(Math.random() * DOOR_REP_R1.length);
    setStage(0);
    setNos(0);
    setRings(0);
    setThemLine(null);
    setYouLine(null);
    setDraining(false);
    setBursting(false);
    setPhase("r1");
  };

  const seal = () => {
    stopVoiceLine();
    onComplete({
      knocks: knocksRef.current,
      nos,
      doorLabel,
      takeaway: `Broke the door, boxed Harold, closed the deal — ${knocksRef.current} knocks, ${ringsRef.current} doorbell rings, ${nos} NOs survived, contract SIGNED`,
    });
  };

  const topBar = (extra) => (
    <div className="dg-top">
      <button className="dg-back" onClick={onClose}>← Gym</button>
      <span className="dg-top__title">The Door</span>
      {extra}
      <span className="dg-nos">❌ {nos} NOs</span>
    </div>
  );

  /* ── BRIEF ── */
  if (phase === "brief") {
    return (
      <div className="dg-stage">
        {topBar(null)}
        <div className="dg-brief">
          <p className="dg-eyebrow">Anger Gym · Persistence Arcade</p>
          <h2 className="dg-heading">They&rsquo;re going to say no.<br />Knock anyway.</h2>
          <p className="dg-lead">
            Behind this door is somebody who does not want to talk to you. Perfect. Three rounds:
            knock through the screaming, close him at <b>midnight</b> on the last night of the
            competition, and if he ever opens that door&hellip; finish the sale <b>his way</b>.
          </p>
          <div className="dg-rounds">
            <span className="dg-rounds__item">R1 · THE KNOCK</span>
            <span className="dg-rounds__item">R2 · THE MIDNIGHT CLOSE</span>
            <span className="dg-rounds__item">R3 · THE PORCH</span>
          </div>
          <div className="dg-science">
            <span className="dg-science__tag">Why this works</span>
            Rejection fires the same circuits as physical pain — until repetition recalibrates them.
            Safe, playful exposure to NO (behavioral desensitization) makes every real-world NO
            cheaper. You&rsquo;re not training charm here. You&rsquo;re training <b>the part of you that stays</b>.
          </div>
          <div className="dg-rated">
            <span className="dg-rated__badge">21+</span>
            RAW MODE — they scream, they swear, and this time you swear BACK. Sound on. That&rsquo;s the workout.
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
          <button
            className="dg-primary"
            disabled={!doorFor}
            onClick={() => {
              themIdx.current = Math.floor(Math.random() * 5);
              youIdx.current = Math.floor(Math.random() * DOOR_REP_R1.length);
              setPhase("r1");
            }}
          >
            Start knocking →
          </button>
        </div>
      </div>
    );
  }

  /* ── CINEMA CARDS ── */
  if (phase === "cine2") {
    return (
      <div className="dg-stage">
        {topBar(null)}
        <CineCard
          eyebrow="LATER THAT NIGHT · 11:58 PM"
          title="The Competition"
          lines={[
            "Final night of the Regional Sales Championship.",
            "You are ONE deal behind Chad from the north office. CHAD.",
            "One signature left in the whole city. Harold's.",
          ]}
          cta="He's not going to like this →"
          onNext={() => {
            doneRef.current = false;
            // fresh random rotation so every midnight sounds different
            themIdx.current = Math.floor(Math.random() * DOOR_NIGHT.length);
            youIdx.current = Math.floor(Math.random() * DOOR_REP_R2.length);
            setStage(2);
            setPhase("r2");
            sfxDoorbell(false);
          }}
        />
      </div>
    );
  }

  if (phase === "cine3") {
    return (
      <div className="dg-stage">
        {topBar(null)}
        <CineCard
          eyebrow="ROUND 3 · THE PORCH"
          title="Harold has left the building."
          lines={[
            "You wanted him to open the door.",
            "Careful what you knock for.",
            `Bathrobe. Slippers. Two years of karate (1987).`,
          ]}
          cta="Put your hands up →"
          onNext={startFight}
        />
      </div>
    );
  }

  /* ── FIGHT ── */
  if (phase === "fight") {
    return (
      <div className="dg-stage">
        {topBar(null)}
        <div className="dg-scene is-night is-fight" ref={sceneRef} style={{ "--p": 1 }}>
          <div className="dg-flash" ref={flashRef} aria-hidden />
          <div className="dg-sky"><span className="dg-moon" /></div>
          <div className="dg-wall" />
          <div className="dg-porchlight" />
          <div className="dg-doorframe-open" aria-hidden />

          <div className="dg-hpbars">
            <div className="dg-hp dg-hp--you">
              <span>YOU</span>
              <div className="dg-hp__track"><div className="dg-hp__fill" style={{ transform: `scaleX(${pHp / 100})` }} /></div>
            </div>
            <div className="dg-hp dg-hp--him">
              <span>HAROLD</span>
              <div className="dg-hp__track"><div className="dg-hp__fill" style={{ transform: `scaleX(${hHp / 100})` }} /></div>
            </div>
          </div>

          <button
            className={`dg-harold is-${hState}`}
            onPointerDown={punch}
            aria-label="Punch Harold"
            disabled={fightKo}
          >
            <span ref={doorRef} className="dg-harold__shake">
              <span className="dg-harold__stars" aria-hidden>💫</span>
              <span className="dg-harold__face">
                {hState === "windup" ? "😤" : hState === "swing" ? "🤬" : hState === "open" ? "😵‍💫" : hState === "ko" ? "😵" : "😠"}
              </span>
              <span className="dg-harold__robe">🥋</span>
              <span className="dg-harold__fists" aria-hidden>
                <i className="dg-fist dg-fist--l">🤜</i>
                <i className="dg-fist dg-fist--r">🤛</i>
              </span>
            </span>
          </button>

          <div className={`dg-gloves ${ducking ? "is-ducking" : ""}`} aria-hidden>
            <span className="dg-glove dg-glove--l">🥊</span>
            <span className="dg-glove dg-glove--r">🥊</span>
          </div>

          <div className="dg-mat"><span>GO AWAY</span></div>
          <div className="dg-bursts" ref={burstsRef} aria-hidden>
            <span /><span /><span /><span /><span /><span />
          </div>

          {fightNote && <div className="dg-fightnote">{fightNote}</div>}

          {fightKo && (
            <div className="dg-koveil">
              <p className="dg-koveil__big">FLATTENED.</p>
              <p className="dg-koveil__sub">
                Dropped by a man in a bathrobe. Harold {napsRef.current} — You 0.
                <br />Champions get up.
              </p>
              <button className="dg-primary" onClick={startFight}>Get up. Ding ding. →</button>
            </div>
          )}
        </div>

        <div className="dg-fightctl">
          <button
            className={`dg-duckbtn ${ducking ? "is-on" : ""}`}
            onPointerDown={duckOn}
            onPointerUp={duckOff}
            onPointerLeave={duckOff}
            onPointerCancel={duckOff}
            disabled={fightKo}
          >
            🙈 DUCK <small>(hold)</small>
          </button>
          <button className="dg-punchbtn" onPointerDown={punch} disabled={fightKo}>
            🥊 PUNCH
          </button>
        </div>

        <div className="dg-talk" aria-live="polite">
          {themLine && <div className="dg-bubble dg-bubble--them">&ldquo;{themLine}&rdquo;</div>}
          {youLine && <div className="dg-bubble dg-bubble--you">{youLine}</div>}
          {!themLine && !youLine && (
            <div className="dg-bubble dg-bubble--hint">Duck the swing. Punch the opening. Close the deal.</div>
          )}
        </div>
      </div>
    );
  }

  /* ── WIFE FINALE ── */
  if (phase === "wife") {
    return (
      <div className="dg-stage">
        {topBar(null)}
        <div className="dg-scene is-night is-wife" style={{ "--p": 1 }}>
          <div className="dg-sky"><span className="dg-moon" /></div>
          <div className="dg-wall" />
          <div className="dg-porchlight" />
          <div className="dg-doorframe-open" aria-hidden />
          <div className="dg-harold-flat" aria-hidden>😵</div>
          <div className={`dg-wife ${wifeBeat >= 1 ? "is-in" : ""}`} aria-hidden>
            <span className="dg-wife__spark">✨</span>
            <span className="dg-wife__her">💃</span>
            <span className="dg-wife__hearts"><i>💋</i></span>
          </div>
          <div className="dg-hearts" aria-hidden>
            <i>💕</i><i>😍</i><i>💖</i><i>💘</i><i>✨</i>
          </div>
          <div className="dg-mat"><span>GO AWAY</span></div>
        </div>

        <div className="dg-talk" aria-live="polite">
          {wifeBeat === 1 && (
            <div className="dg-bubble dg-bubble--wife">&ldquo;{DOOR_WIFE[0].text}&rdquo;</div>
          )}
          {wifeBeat >= 2 && (
            <div className="dg-bubble dg-bubble--wife">&ldquo;{DOOR_WIFE[1].text}&rdquo;</div>
          )}
        </div>

        {wifeBeat >= 3 && (
          <div className="dg-contract">
            <p className="dg-contract__head">CONTRACT — DELUXE PACKAGE <small>(the good one)</small></p>
            <div className="dg-contract__line">
              <span className="dg-contract__sig">Mrs. Harold 💋</span>
            </div>
            <div className="dg-contract__stamp">SIGNED</div>
            <p className="dg-contract__trophy">🏆 REGIONAL CHAMPION · CHAD DESTROYED</p>
            <button className="dg-primary" onClick={() => setPhase("seal")}>Collect the W →</button>
          </div>
        )}
      </div>
    );
  }

  /* ── SEAL ── */
  if (phase === "seal") {
    return (
      <div className="dg-stage">
        {topBar(null)}
        <div className="dg-seal">
          <h2 className="dg-heading">Deal. CLOSED.</h2>
          <div className="dg-stats">
            <div className="dg-stat"><b>{knocksRef.current}</b><span>knocks</span></div>
            <div className="dg-stat"><b>{ringsRef.current}</b><span>doorbell rings</span></div>
            <div className="dg-stat"><b>{nos}</b><span>NOs survived</span></div>
            <div className="dg-stat"><b>{punchesRef.current}</b><span>punches</span></div>
          </div>
          <p className="dg-lead dg-lead--seal">
            {doorLabel ? <>That was <b>{doorLabel.toLowerCase()}</b>. </> : null}
            Harold: boxed. The wife: closed. Chad: destroyed. The only knock that fails is the one
            you don&rsquo;t throw.
          </p>
          <button className="dg-primary" onClick={seal}>Bank the XP →</button>
          <button className="dg-ghost" onClick={reset}>Run it back</button>
        </div>
      </div>
    );
  }

  /* ── R1 + R2 — knock / ring ── */
  const isR2 = phase === "r2";
  return (
    <div className="dg-stage">
      {topBar(isR2 ? <span className="dg-clock">🕛 11:58 PM</span> : null)}

      <div
        className={`dg-scene ${isR2 ? "is-night" : ""} ${draining ? "is-draining" : ""} ${bursting ? "is-bursting" : ""}`}
        ref={sceneRef}
        data-stage={stage}
        style={{ "--p": isR2 ? 0.5 : 0, "--amp": 1 + stage * 0.55 }}
      >
        <div className="dg-flash" ref={flashRef} aria-hidden />
        <div className="dg-resolve">
          <span className="dg-resolve__label">{isR2 ? "Closer energy" : "Resolve"}</span>
          <div className="dg-resolve__track"><div className="dg-resolve__fill" /></div>
        </div>
        <div className="dg-sky">{isR2 && <span className="dg-moon" />}</div>
        <div className="dg-wall" />
        <div className="dg-porchlight" />

        <button
          className="dg-hitzone"
          onPointerDown={(e) => (isR2 ? tapR2(e, false) : knockR1(e))}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (isR2) tapR2(e, false);
              else knockR1(e);
            }
          }}
          aria-label="Knock on the door"
        >
          <span ref={doorRef} className="dg-doorshake">
            <Door burst={bursting} />
          </span>
        </button>

        {isR2 && (
          <button className="dg-bellbtn" onPointerDown={(e) => tapR2(e, true)} aria-label="Ring the doorbell">
            🔔
            <small>{rings > 0 ? `×${rings}` : "RING"}</small>
          </button>
        )}

        <div className="dg-mat"><span>GO AWAY</span></div>

        <div className="dg-bursts" ref={burstsRef} aria-hidden>
          <span /><span /><span /><span /><span /><span />
        </div>

        {draining && <div className="dg-drainwarn">He&rsquo;s waiting you out — DON&rsquo;T STOP</div>}

        {stage >= 1 && (
          <button
            className={`dg-giveup ${denied ? "is-denied" : ""}`}
            onClick={() =>
              giveUp(isR2 ? "Go home? Chad would go home. I'm not Chad." : "Give up? Never heard of her.")
            }
          >
            {denied ? "DENIED." : isR2 ? "It's midnight. Go home?" : "Give up? (it's easier)"}
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
          <div className="dg-bubble dg-bubble--hint">
            {draining
              ? "The bar is DRAINING. Ring. Knock. Anything."
              : isR2
                ? "Ring the bell. Pound the wood. Do not let the bar drop."
                : "Tap the door. Keep tapping. Do not stop."}
          </div>
        )}
      </div>
    </div>
  );
}

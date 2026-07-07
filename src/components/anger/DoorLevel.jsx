import React, { useEffect, useRef, useState } from "react";
import "../../styles/door-game.css";
import {
  sfxKnock, sfxImpact, sfxDoorBreak, sfxZap, sfxDoorbell, sfxRoundBell,
  sfxPunch, sfxBlock, sfxWhoosh, sfxWoodCrack, sfxShatter,
  sfxThunder, sfxHorn, sfxIgnite, sfxMatchStrike, sfxSplat,
  sfxCoin, sfxBuzzer, sfxPop, sfxPhoenix, sfxRainbow,
  sfxRainLoop, sfxWindLoop, sfxFireLoop,
  playVoiceLine, stopVoiceLine,
} from "../../lib/sfx";
import { tapLight, slamHeavy } from "../../lib/haptics.js";

/* ════════════════════════════════════════════════════════════════════════
   DOOR LEVEL — the config-driven engine behind Levels 2-4 of The Door.
   (Level 1 is the original TheDoor.jsx cinema, mounted straight by the hub.)

   A level = brief → N knock rounds → a finale → seal. Every round shares the
   same systems, tuned by data (doorLevels.js):
     · Bloody Knuckles — bare-fist knocking; cumulative damage escalates the
       fist through 5 stages, and blood SMEARS build up on the door.
     · HEAT meter — fills as you pound + trade savage banter; full = BREAK IT.
     · Banter volleys — customer "them" vs rep "you", every line voiced.
     · Specials — bell (ring), chainsaw (hold-to-rev), rocks (throw windows).
     · Finales — powerslap · brawl · kickdown(→brawl).

   Contract: { level, onClose, onComplete }.
   ════════════════════════════════════════════════════════════════════════ */

const LINE_EVERY = 2;                          // taps between dialogue beats (denser argument)
const STAGE_AT = [0, 0.22, 0.45, 0.68, 0.86];  // per-round rage tiers
const VOICE_VOL = [0.5, 0.65, 0.8, 0.92, 1.0];
// Cumulative-tap thresholds for the 5 Bloody-Knuckles blood stages.
const BLOOD_AT = [0, 8, 22, 40, 62];
const BLOOD_NAME = ["CLEAN", "RAW", "SPLIT", "DRIPPING", "BONE-DEEP"];
const KNOCK_WORDS = ["KNOCK", "BANG", "BAM", "BAM BAM", "WHAM", "THUD"];
const POWER_WORDS = ["BOOM!", "BAM!!", "CRACK!!", "WHAM!!!"];
const STEEL_WORDS = ["CLANG!", "CLANK!", "DONK!", "GONG!", "THUNK!"];
const RING_WORDS = ["DING!", "DONG!", "RRRING!", "DING DONG"];
const GLASS_WORDS = ["CRASH!", "SMASH!", "SHATTER!", "TINKLE!"];
const PUNCH_WORDS = ["POW!", "BIFF!", "SOCK!", "JAB!", "BAM!"];

function buzz(pattern) {
  // navigator.vibrate is a no-op on iOS — Capacitor haptics carries it there.
  const heavy = Array.isArray(pattern);
  if (heavy) slamHeavy(); else tapLight();
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch { /* no haptics */ }
}
function stageFor(p) {
  let s = 0;
  for (let i = 0; i < STAGE_AT.length; i++) if (p >= STAGE_AT[i]) s = i;
  return s;
}
function bloodFor(n) {
  let s = 0;
  for (let i = 0; i < BLOOD_AT.length; i++) if (n >= BLOOD_AT[i]) s = i;
  return s;
}

/* Door — reused across skins; skin class recolors it (wood / steel / gate). */
function Door({ burst, blood }) {
  return (
    <div className={`dg-doorwrap ${burst ? "is-burst" : ""}`}>
      <div className="dg-door" data-blood={blood}>
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
        {/* Bloody-Knuckles smears — revealed by data-blood on the door. */}
        <span className="dg-smear dg-smear--1" />
        <span className="dg-smear dg-smear--2" />
        <span className="dg-smear dg-smear--3" />
        <span className="dg-smear dg-smear--4" />
      </div>
    </div>
  );
}

function CineCard({ eyebrow, title, lines, cta, onNext }) {
  return (
    <div className="dg-cine">
      <div className="dg-cine__bar dg-cine__bar--t" />
      <div className="dg-cine__body">
        <p className="dg-cine__eyebrow">{eyebrow}</p>
        <h2 className="dg-cine__title">{title}</h2>
        {lines.map((l, i) => (
          <p key={i} className="dg-cine__line" style={{ animationDelay: `${0.4 + i * 0.5}s` }}>{l}</p>
        ))}
        <button className="dg-primary dg-cine__cta" onClick={onNext}>{cta}</button>
      </div>
      <div className="dg-cine__bar dg-cine__bar--b" />
    </div>
  );
}

export default function DoorLevel({ level, onClose, onComplete }) {
  // brief | cine | round | finale | seal
  const [phase, setPhase] = useState("brief");
  const [roundIdx, setRoundIdx] = useState(0);
  const [stage, setStage] = useState(0);
  const [blood, setBlood] = useState(0);
  const [nos, setNos] = useState(0);
  const [rings, setRings] = useState(0);
  const [panes, setPanes] = useState(0);       // windows smashed by thrown rocks
  const [heat, setHeat] = useState(0);
  const [themLine, setThemLine] = useState(null);
  const [youLine, setYouLine] = useState(null);
  const [bursting, setBursting] = useState(false);

  // finale (powerslap / kickdown charge)
  const [finaleStage, setFinaleStage] = useState(null); // slap | kick | fight
  const [charge, setCharge] = useState(0);
  const [slapped, setSlapped] = useState(false);

  // brawl state (refs authoritative, render mirrors)
  const [pHp, setPHp] = useState(100);
  const [hHp, setHHp] = useState(100);
  const [hState, setHState] = useState("guard");
  const [ducking, setDucking] = useState(false);
  const [fightNote, setFightNote] = useState(null);
  const [fightKo, setFightKo] = useState(false);

  const sceneRef = useRef(null);
  const doorRef = useRef(null);
  const flashRef = useRef(null);
  const burstsRef = useRef(null);
  const knocksRef = useRef(0);         // cumulative across the whole level (blood)
  const lastTapRef = useRef(0);        // ts of last input — feeds the idle-drain
  const fireHandleRef = useRef(null);  // chainsaw fire-loop handle (swells while sawing)
  const roundRef = useRef({ prog: 0, taps: 0 });
  const themIdx = useRef(0);
  const youIdx = useRef(0);
  const doneRef = useRef(false);
  const timersRef = useRef([]);
  const burstIdx = useRef(0);
  const chargeRef = useRef({ held: false, raf: 0, val: 0 });
  const revRef = useRef({ held: false });
  const f = useRef({ hHp: 100, pHp: 100, state: "guard", ducking: false, lastPunch: 0, over: false });
  const punchesRef = useRef(0);

  const round = level.rounds[roundIdx];
  const isFinale = phase === "finale";

  const schedule = (fn, ms) => { const id = window.setTimeout(fn, ms); timersRef.current.push(id); return id; };
  const clearTimers = () => { timersRef.current.forEach((id) => window.clearTimeout(id)); timersRef.current = []; };
  useEffect(() => () => { clearTimers(); stopVoiceLine(); cancelAnimationFrame(chargeRef.current.raf); }, []);

  // Victory fanfare the moment the seal screen appears.
  useEffect(() => {
    if (phase !== "seal") return undefined;
    sfxBuzzer();                                   // final closing-horn
    sfxPhoenix();
    const t = window.setTimeout(() => sfxRainbow(), 650);
    return () => window.clearTimeout(t);
  }, [phase]);

  const retrigger = (el, cls) => {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  };

  const spawnBurst = (e, power, words) => {
    const pool = burstsRef.current;
    if (!pool) return;
    const node = pool.children[burstIdx.current++ % pool.children.length];
    const rect = pool.getBoundingClientRect();
    const x = e && e.clientX ? e.clientX - rect.left : rect.width / 2;
    const y = e && e.clientY ? e.clientY - rect.top : rect.height / 2;
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.textContent = words[Math.floor(Math.random() * words.length)];
    node.classList.toggle("is-power", power);
    retrigger(node, "is-live");
  };

  const wordsFor = (skin, isRing, power) => {
    if (isRing) return RING_WORDS;
    if (skin === "steel" || skin === "gate") return power ? POWER_WORDS : STEEL_WORDS;
    return power ? POWER_WORDS : KNOCK_WORDS;
  };

  /* ── knock / tap core (used by every round) ──────────────────────────── */
  const tap = (e, kind) => {
    // kind: "knock" | "ring" | "rock"
    if (doneRef.current || phase !== "round") return;
    lastTapRef.current = performance.now();
    knocksRef.current += 1;
    const r = roundRef.current;
    r.taps += 1;
    r.prog = Math.min(round.taps, r.prog + (kind === "rock" ? 1.4 : 1));
    const t = r.taps;
    const p = r.prog / round.taps;
    const s = stageFor(p);
    const bl = bloodFor(knocksRef.current);
    const power = t % 6 === 0 || kind === "rock";

    if (sceneRef.current) sceneRef.current.style.setProperty("--p", String(p));
    retrigger(doorRef.current, power ? "is-pounded" : "is-hit");
    if (power) retrigger(flashRef.current, "is-live");
    spawnBurst(e, power, kind === "rock" ? GLASS_WORDS : wordsFor(round.skin, kind === "ring", power));
    buzz(power ? [16, 32, 22] : 9);

    if (kind === "rock") { sfxShatter(); sfxImpact(Math.min(8, 5 + s)); }
    else if (kind === "ring") { sfxDoorbell(s >= 3); sfxPop(); }
    else if (round.skin === "steel" || round.skin === "gate") sfxImpact(Math.min(8, 3 + s));
    else if (power) sfxImpact(Math.min(8, 4 + s));
    else sfxKnock(Math.min(8, 1 + s));
    // extra flavor layers: night storm cracks, and a comedic splat on the throne
    if (power && (round.skin === "night" || round.skin === "eve") && Math.random() < 0.4) sfxThunder(2 + Math.floor(Math.random() * 3));
    if (round.key === "throne" && power && Math.random() < 0.5) sfxSplat();

    if (kind === "ring") setRings((v) => v + 1);
    else if (kind === "rock") setPanes((v) => v + 1);
    setStage((prev) => (prev === s ? prev : s));
    setBlood((prev) => (prev === bl ? prev : bl));
    setHeat(Math.min(1, p * 0.75 + (t % 12) / 60));

    // banter — them, then you, alternating dense
    if (t % (LINE_EVERY * 2) === LINE_EVERY) {
      const pool = round.them;
      const line = pool[themIdx.current % pool.length];
      themIdx.current += 1;
      setThemLine(line.text); setYouLine(null);
      setNos((v) => v + 1);
      playVoiceLine(line.id, { volume: VOICE_VOL[s], rate: 1 + s * 0.02 });
    } else if (t % (LINE_EVERY * 2) === 0) {
      const pool = round.you;
      const line = pool[youIdx.current % pool.length];
      youIdx.current += 1;
      setYouLine(line.text); setThemLine(null);
      playVoiceLine(line.id, { volume: 0.95, rate: 1.02 });
    }

    if (r.prog >= round.taps && !doneRef.current) {
      doneRef.current = true;
      setHeat(1);
      sfxCoin();               // round banked
      buzz([24, 48, 24]);
      // round clear: open line (if any), then advance
      if (round.openLine) {
        sfxDoorBreak();
        setThemLine(round.openLine.text); setYouLine(null);
        schedule(() => playVoiceLine(round.openLine.id, { volume: 1 }), 150);
        schedule(advance, 1900);
      } else {
        schedule(advance, 850);
      }
    }
  };

  /* ── chainsaw special (hold to rev; fills progress fast) ─────────────── */
  useEffect(() => {
    if (phase !== "round" || round.special !== "chainsaw") return undefined;
    const iv = window.setInterval(() => {
      if (doneRef.current || !revRef.current.held) return;
      const r = roundRef.current;
      r.taps += 1;
      r.prog = Math.min(round.taps, r.prog + 0.8);
      knocksRef.current += 1;
      const p = r.prog / round.taps;
      if (sceneRef.current) sceneRef.current.style.setProperty("--p", String(p));
      retrigger(sceneRef.current, "is-sawing");
      spawnBurst(null, true, ["ZZZT!", "BRRR!", "RRRR!", "SPARK!"]);
      sfxWoodCrack();
      setHeat(Math.min(1, p));
      setBlood(bloodFor(knocksRef.current));
      if (r.prog >= round.taps && !doneRef.current) {
        doneRef.current = true;
        revRef.current.held = false;
        sfxDoorBreak(); sfxImpact(8);
        setThemLine(round.them[0].text);
        schedule(advance, 1300);
      }
    }, 130);
    return () => window.clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roundIdx]);

  /* ── ambient loops + storm + idle-drain difficulty, per round ────────── */
  useEffect(() => {
    if (phase !== "round") return undefined;
    const handles = [];
    const skin = round.skin;
    if (skin === "night" || skin === "eve") { const h = sfxRainLoop(); h.setLevel(skin === "night" ? 0.22 : 0.13); handles.push(h); }
    if (skin === "gate") { const h = sfxWindLoop(); h.setLevel(0.16); handles.push(h); }
    if (round.special === "chainsaw") { const h = sfxFireLoop(); h.setLevel(0.0001); handles.push(h); fireHandleRef.current = h; }

    let thunderIv = null;
    if (skin === "night" || skin === "eve") {
      thunderIv = window.setInterval(() => {
        if (!doneRef.current && Math.random() < 0.45) sfxThunder(2 + Math.floor(Math.random() * 3));
      }, 3400);
    }

    // Idle-drain: slack off on a hard round and your progress bleeds back.
    let drainIv = null;
    if (round.drain && round.special !== "chainsaw") {
      drainIv = window.setInterval(() => {
        if (doneRef.current) return;
        const r = roundRef.current;
        if (r.prog > 0 && performance.now() - lastTapRef.current > 850) {
          r.prog = Math.max(0, r.prog - round.taps * 0.011);
          const p = r.prog / round.taps;
          if (sceneRef.current) sceneRef.current.style.setProperty("--p", String(p));
          const s = stageFor(p);
          setStage((prev) => (prev === s ? prev : s));
          setHeat(Math.min(1, p * 0.75));
        }
      }, 140);
    }

    return () => {
      handles.forEach((h) => h.stop && h.stop());
      fireHandleRef.current = null;
      if (thunderIv) window.clearInterval(thunderIv);
      if (drainIv) window.clearInterval(drainIv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roundIdx]);

  const revOn = () => {
    if (doneRef.current) return;
    revRef.current.held = true;
    sfxMatchStrike(); sfxIgnite();                       // pull-cord spark → the saw catches
    if (fireHandleRef.current) fireHandleRef.current.setLevel(0.32);
    if (round.chainsawLine) playVoiceLine(round.chainsawLine.id, { volume: 1 });
    setThemLine(round.them[Math.floor(Math.random() * round.them.length)].text);
  };
  const revOff = () => {
    revRef.current.held = false;
    if (fireHandleRef.current) fireHandleRef.current.setLevel(0.0001);
    if (sceneRef.current) sceneRef.current.classList.remove("is-sawing");
  };

  /* ── round / cine flow ───────────────────────────────────────────────── */
  const enterRound = (i) => {
    clearTimers();
    doneRef.current = false;
    roundRef.current = { prog: 0, taps: 0 };
    themIdx.current = Math.floor(Math.random() * 3);
    youIdx.current = Math.floor(Math.random() * 3);
    setRoundIdx(i);
    setStage(0);
    setHeat(0);
    setThemLine(null); setYouLine(null);
    setBursting(false);
    lastTapRef.current = performance.now();
    if (sceneRef.current) sceneRef.current.style.setProperty("--p", "0");
    setPhase(level.rounds[i].cine ? "cine" : "round");
    if (!level.rounds[i].cine) sfxRoundBell();
  };

  const startRoundFromCine = () => {
    doneRef.current = false;
    setPhase("round");
    sfxRoundBell();
  };

  const advance = () => {
    doneRef.current = false;
    if (roundIdx + 1 < level.rounds.length) {
      enterRound(roundIdx + 1);
    } else {
      enterFinale();
    }
  };

  /* ── finale ──────────────────────────────────────────────────────────── */
  const enterFinale = () => {
    clearTimers();
    setThemLine(null); setYouLine(null);
    setSlapped(false); setCharge(0);
    sfxHorn(1);                                    // the showdown horn
    const t = level.finale.type;
    setPhase("finale");
    if (t === "powerslap") setFinaleStage("slap");
    else if (t === "kickdown") setFinaleStage("kick");
    else { setFinaleStage("fight"); startFight(); }
  };

  // charge (shared by powerslap + kickdown kick)
  const chargeStart = () => {
    if (slapped) return;
    chargeRef.current.held = true;
    sfxWhoosh();
    const loop = () => {
      if (!chargeRef.current.held) return;
      chargeRef.current.val = Math.min(1, chargeRef.current.val + 0.022);
      setCharge(chargeRef.current.val);
      if (chargeRef.current.val >= 1) { release(); return; }
      chargeRef.current.raf = requestAnimationFrame(loop);
    };
    chargeRef.current.raf = requestAnimationFrame(loop);
  };
  const release = () => {
    if (!chargeRef.current.held || slapped) return;
    chargeRef.current.held = false;
    cancelAnimationFrame(chargeRef.current.raf);
    const c = chargeRef.current.val;
    if (c < 0.55) {
      setFightNote("Not enough — wind it ALL the way back!");
      chargeRef.current.val = 0; setCharge(0);
      schedule(() => setFightNote(null), 1100);
      return;
    }
    setSlapped(true);
    setFightNote(null);
    retrigger(flashRef.current, "is-live");
    buzz([30, 60, 30, 90]);
    if (finaleStage === "kick") {
      sfxHorn(1); sfxDoorBreak(); sfxImpact(8);
      setBursting(true);
      if (level.finale.kickLine) schedule(() => playVoiceLine(level.finale.kickLine.id, { volume: 1 }), 150);
      schedule(() => { setBursting(false); setSlapped(false); chargeRef.current.val = 0; setCharge(0); setFinaleStage("fight"); startFight(); }, 1700);
    } else {
      sfxImpact(8);
      if (level.finale.line) schedule(() => playVoiceLine(level.finale.line.id, { volume: 1 }), 120);
      schedule(() => setPhase("seal"), 2200);
    }
  };

  /* ── brawl minigame (L3 / L4 finales) ────────────────────────────────── */
  const themName = level.finale.themName || "THEM";
  const fightThem = level.finale.them || [];
  const fightYou = level.finale.you || [];

  const setHim = (state) => { f.current.state = state; setHState(state); };
  const himBark = () => {
    if (!fightThem.length) return;
    const line = fightThem[Math.floor(Math.random() * fightThem.length)];
    playVoiceLine(line.id, { volume: 1 });
    setThemLine(line.text); setYouLine(null);
  };
  const repBark = () => {
    if (!fightYou.length) return;
    const line = fightYou[Math.floor(Math.random() * fightYou.length)];
    playVoiceLine(line.id, { volume: 0.95 });
    setYouLine(line.text); setThemLine(null);
  };
  const loopGuard = () => { if (f.current.over) return; setHim("guard"); schedule(beginWindup, 650 + Math.random() * 650); };
  const beginWindup = () => {
    if (f.current.over) return;
    const dur = Math.max(360, 680 - (100 - f.current.hHp) * 3.1);
    setHim("windup");
    const fake = f.current.hHp < 72 && Math.random() < 0.28;
    if (fake) schedule(() => { if (f.current.over) return; setHim("guard"); setFightNote("FAKE-OUT!"); schedule(beginWindup, 420 + Math.random() * 480); }, dur * 0.6);
    else schedule(swing, dur);
  };
  const swing = () => {
    if (f.current.over) return;
    setHim("swing");
    schedule(() => {
      if (f.current.over) return;
      if (f.current.ducking) {
        spawnBurst(null, true, ["WHIFF!", "SWISH!", "AIR!"]);
        sfxWhoosh(); setFightNote("OPENING — HIT HIM!"); setHim("open"); repBark();
        schedule(() => { if (f.current.over || f.current.state !== "open") return; setFightNote(null); loopGuard(); }, 820);
      } else {
        f.current.pHp = Math.max(0, f.current.pHp - 16); setPHp(f.current.pHp);
        sfxImpact(6); buzz([20, 50, 20]); retrigger(flashRef.current, "is-hurt");
        spawnBurst(null, true, ["SMACK!!", "OOF!!", "WALLOP!"]); himBark();
        if (f.current.pHp <= 0) { playerKO(); return; }
        loopGuard();
      }
    }, 230);
  };
  const punch = (e) => {
    if (phase !== "finale" || finaleStage !== "fight" || f.current.over) return;
    const now = performance.now();
    if (now - f.current.lastPunch < 220) return;
    f.current.lastPunch = now;
    if (f.current.ducking) { setFightNote("Can't punch while hiding!"); return; }
    punchesRef.current += 1;
    const st = f.current.state;
    if (st === "open") {
      const dmg = 9 + Math.round(Math.random() * 4);
      f.current.hHp = Math.max(0, f.current.hHp - dmg); setHHp(f.current.hHp);
      sfxPunch(3); buzz([10, 20, 10]); spawnBurst(e, true, PUNCH_WORDS);
      setBlood((b) => Math.min(4, Math.max(b, 2 + Math.round((100 - f.current.hHp) / 50)))); // bloodier per hit
      retrigger(doorRef.current, "is-hit");
    } else if (st === "windup" || st === "swing") {
      f.current.hHp = Math.max(0, f.current.hHp - 2); setHHp(f.current.hHp);
      sfxPunch(1); spawnBurst(e, false, ["CLIP", "GRAZE"]);
    } else {
      f.current.hHp = Math.max(0, f.current.hHp - 1); setHHp(f.current.hHp);
      sfxBlock(); spawnBurst(e, false, ["BLOCKED", "GUARD"]);
    }
    if (f.current.hHp <= 0) himKO();
  };
  const duckOn = () => { if (f.current.over) return; f.current.ducking = true; setDucking(true); };
  const duckOff = () => { f.current.ducking = false; setDucking(false); };
  const playerKO = () => {
    f.current.over = true; clearTimers(); setFightKo(true); setFightNote(null); sfxZap(); sfxBuzzer();
    if (fightThem[0]) playVoiceLine(fightThem[0].id, { volume: 1 });
  };
  const himKO = () => {
    f.current.over = true; clearTimers(); setHim("ko"); setFightNote(null); setThemLine(null); setYouLine(null);
    sfxImpact(7); buzz([30, 60, 30, 90]);
    if (level.finale.ko) schedule(() => playVoiceLine(level.finale.ko.id, { volume: 1 }), 550);
    schedule(() => setPhase("seal"), 2100);
  };
  const startFight = () => {
    clearTimers();
    f.current = { hHp: 100, pHp: 100, state: "guard", ducking: false, lastPunch: 0, over: false };
    setPHp(100); setHHp(100); setDucking(false); setFightKo(false);
    setFightNote("Hold DUCK when he winds up — then punch the opening.");
    setThemLine(null); setYouLine(null);
    sfxRoundBell();
    if (fightThem[0]) playVoiceLine(fightThem[0].id, { volume: 1 });
    setHim("guard");
    schedule(beginWindup, 1700);
  };

  /* ── plumbing ────────────────────────────────────────────────────────── */
  const seal = () => {
    stopVoiceLine();
    onComplete({
      level: level.id,
      knocks: knocksRef.current,
      nos,
      takeaway: `${level.title}: ${knocksRef.current} knocks, ${nos} NOs survived, ${BLOOD_NAME[blood].toLowerCase()} knuckles — ${level.finale.type === "powerslap" ? "slapped him signed" : "brawled him signed"}.`,
    });
  };

  const restart = () => { clearTimers(); stopVoiceLine(); knocksRef.current = 0; setNos(0); setRings(0); setPanes(0); setBlood(0); enterRound(0); };

  const topBar = (extra) => (
    <div className="dg-top">
      <button className="dg-back" onClick={onClose}>← Levels</button>
      <span className="dg-top__title">{level.title}</span>
      {extra}
      <span className="dg-nos">❌ {nos}</span>
    </div>
  );

  const KnuckleHud = () => (
    <div className="dg-knuckle" data-blood={blood} title={`Knuckles: ${BLOOD_NAME[blood]}`}>
      <span className="dg-knuckle__fist">✊</span>
      <div className="dg-knuckle__meta">
        <span className="dg-knuckle__label">KNUCKLES</span>
        <div className="dg-knuckle__bar"><i style={{ transform: `scaleX(${(blood + 0.4) / 4.4})` }} /></div>
        <span className="dg-knuckle__stage">{BLOOD_NAME[blood]}</span>
      </div>
    </div>
  );

  /* ── BRIEF ──────────────────────────────────────────────────────────── */
  if (phase === "brief") {
    return (
      <div className="dg-stage" style={{ "--lvacc": level.accent }}>
        {topBar(null)}
        <div className="dg-brief">
          <p className="dg-eyebrow">{level.tag}</p>
          <h2 className="dg-heading">{level.brief.heading.split("\n").map((l, i) => <React.Fragment key={i}>{l}<br /></React.Fragment>)}</h2>
          <p className="dg-lead">{level.brief.lead}</p>
          <div className="dg-rounds">
            {level.brief.rounds.map((r) => <span key={r} className="dg-rounds__item">{r}</span>)}
          </div>
          <div className="dg-lesson"><span className="dg-lesson__tag">The lesson</span>{level.lesson}</div>
          {level.brief.disclaimer && (
            <p style={{ fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.55)", margin: "10px 0 0", fontStyle: "italic" }}>
              {level.brief.disclaimer}
            </p>
          )}
          <div className="dg-rated">
            <span className="dg-rated__badge">18+</span>
            RAW MODE — Bloody Knuckles, screamed banter, and a finale that ends in {level.finale.type === "powerslap" ? "a cartoon power slap" : "blood on the porch"}. Sound on.
          </div>
          <button className="dg-primary" onClick={() => enterRound(0)}>Start knocking →</button>
        </div>
      </div>
    );
  }

  /* ── CINE ───────────────────────────────────────────────────────────── */
  if (phase === "cine") {
    return (
      <div className="dg-stage" style={{ "--lvacc": level.accent }}>
        {topBar(null)}
        <CineCard {...round.cine} onNext={startRoundFromCine} />
      </div>
    );
  }

  /* ── FINALE ─────────────────────────────────────────────────────────── */
  if (isFinale && (finaleStage === "slap" || finaleStage === "kick")) {
    const isKick = finaleStage === "kick";
    return (
      <div className="dg-stage" style={{ "--lvacc": level.accent }}>
        {topBar(null)}
        <div className={`dg-scene dg-scene--${round.skin} is-finale ${bursting ? "is-bursting" : ""}`} ref={sceneRef} style={{ "--p": 1 }}>
          <div className="dg-flash" ref={flashRef} aria-hidden />
          <div className="dg-sky">{round.skin === "night" && <span className="dg-moon" />}</div>
          <div className="dg-wall" />
          <div className="dg-porchlight" />
          {isKick ? (
            <div className="dg-doorshake" ref={doorRef}><Door burst={bursting} blood={blood} /></div>
          ) : (
            <div className={`dg-face ${slapped ? "is-slapped" : ""}`} data-blood={blood} aria-hidden>
              <span className="dg-face__emoji">{slapped ? "😵" : "😧"}</span>
              <span className="dg-face__hand">✋</span>
            </div>
          )}
          <div className="dg-mat"><span>GO AWAY</span></div>
          <div className="dg-bursts" ref={burstsRef} aria-hidden><span /><span /><span /><span /><span /><span /></div>
          <div className="dg-charge">
            <span className="dg-charge__label">{isKick ? "KICK POWER" : "SLAP POWER"}</span>
            <div className="dg-charge__track"><div className="dg-charge__fill" style={{ transform: `scaleX(${charge})` }} /></div>
          </div>
          {fightNote && <div className="dg-fightnote">{fightNote}</div>}
        </div>
        <div className="dg-fightctl">
          <button
            className={`dg-slapbtn ${charge > 0 ? "is-charging" : ""}`}
            onPointerDown={chargeStart}
            onPointerUp={release}
            onPointerLeave={release}
            onPointerCancel={release}
            disabled={slapped}
          >
            {isKick ? "🦵 HOLD TO WIND BACK — KICK IT IN" : "✋ HOLD TO WIND BACK — POWER SLAP"}
          </button>
        </div>
        <div className="dg-talk" aria-live="polite">
          <div className="dg-bubble dg-bubble--hint">
            {isKick ? "Four visits. Wind all the way back and kick the door OFF the hinges." : "Wind it ALL the way back. Release to crack him. Keep his name out ya mouth."}
          </div>
        </div>
      </div>
    );
  }

  if (isFinale && finaleStage === "fight") {
    return (
      <div className="dg-stage" style={{ "--lvacc": level.accent }}>
        {topBar(null)}
        <div className={`dg-scene dg-scene--${round.skin} is-fight`} ref={sceneRef} style={{ "--p": 1 }}>
          <div className="dg-flash" ref={flashRef} aria-hidden />
          <div className="dg-sky">{round.skin === "night" && <span className="dg-moon" />}</div>
          <div className="dg-wall" />
          <div className="dg-porchlight" />
          <div className="dg-doorframe-open" aria-hidden />
          <div className="dg-hpbars">
            <div className="dg-hp dg-hp--you"><span>YOU</span><div className="dg-hp__track"><div className="dg-hp__fill" style={{ transform: `scaleX(${pHp / 100})` }} /></div></div>
            <div className="dg-hp dg-hp--him"><span>{themName}</span><div className="dg-hp__track"><div className="dg-hp__fill" style={{ transform: `scaleX(${hHp / 100})` }} /></div></div>
          </div>
          <button className={`dg-harold is-${hState}`} data-blood={blood} onPointerDown={punch} aria-label="Punch" disabled={fightKo}>
            <span ref={doorRef} className="dg-harold__shake">
              <span className="dg-harold__stars" aria-hidden>💫</span>
              <span className="dg-harold__face">{hState === "windup" ? "😤" : hState === "swing" ? "🤬" : hState === "open" ? "😵‍💫" : hState === "ko" ? "😵" : "😠"}</span>
              <span className="dg-harold__robe">🥋</span>
              <span className="dg-harold__fists" aria-hidden><i className="dg-fist dg-fist--l">🤜</i><i className="dg-fist dg-fist--r">🤛</i></span>
            </span>
          </button>
          <div className={`dg-gloves ${ducking ? "is-ducking" : ""}`} aria-hidden><span className="dg-glove dg-glove--l">🥊</span><span className="dg-glove dg-glove--r">🥊</span></div>
          <div className="dg-mat"><span>GO AWAY</span></div>
          <div className="dg-bursts" ref={burstsRef} aria-hidden><span /><span /><span /><span /><span /><span /></div>
          {fightNote && <div className="dg-fightnote">{fightNote}</div>}
          {fightKo && (
            <div className="dg-koveil">
              <p className="dg-koveil__big">FLATTENED.</p>
              <p className="dg-koveil__sub">Dropped on the porch. Champions get up.</p>
              <button className="dg-primary" onClick={startFight}>Get up. Ding ding. →</button>
            </div>
          )}
        </div>
        <div className="dg-fightctl">
          <button className={`dg-duckbtn ${ducking ? "is-on" : ""}`} onPointerDown={duckOn} onPointerUp={duckOff} onPointerLeave={duckOff} onPointerCancel={duckOff} disabled={fightKo}>🙈 DUCK <small>(hold)</small></button>
          <button className="dg-punchbtn" onPointerDown={punch} disabled={fightKo}>🥊 PUNCH</button>
        </div>
        <div className="dg-talk" aria-live="polite">
          {themLine && <div className="dg-bubble dg-bubble--them">&ldquo;{themLine}&rdquo;</div>}
          {youLine && <div className="dg-bubble dg-bubble--you">{youLine}</div>}
          {!themLine && !youLine && <div className="dg-bubble dg-bubble--hint">Duck the swing. Punch the opening. Close the deal.</div>}
        </div>
      </div>
    );
  }

  /* ── SEAL ───────────────────────────────────────────────────────────── */
  if (phase === "seal") {
    return (
      <div className="dg-stage" style={{ "--lvacc": level.accent }}>
        {topBar(null)}
        <div className="dg-seal">
          <h2 className="dg-heading">{level.seal.title}</h2>
          <div className="dg-stats">
            <div className="dg-stat"><b>{knocksRef.current}</b><span>knocks</span></div>
            <div className="dg-stat"><b>{rings}</b><span>rings</span></div>
            <div className="dg-stat"><b>{nos}</b><span>NOs survived</span></div>
            <div className="dg-stat"><b>{BLOOD_NAME[blood]}</b><span>knuckles</span></div>
          </div>
          <p className="dg-lead dg-lead--seal">{level.seal.line}</p>
          <button className="dg-primary" onClick={seal}>Bank the XP →</button>
          <button className="dg-ghost" onClick={restart}>Run it back</button>
        </div>
      </div>
    );
  }

  /* ── ROUND (knock / ring / rocks / chainsaw) ────────────────────────── */
  const isNight = round.skin === "night" || round.skin === "eve";
  return (
    <div className="dg-stage" style={{ "--lvacc": level.accent }}>
      {topBar(<span className="dg-clock">{round.label}</span>)}
      <KnuckleHud />
      <div
        className={`dg-scene dg-scene--${round.skin} ${isNight ? "is-night" : ""} ${bursting ? "is-bursting" : ""}`}
        ref={sceneRef}
        data-stage={stage}
        style={{ "--p": 0, "--amp": 1 + stage * 0.55 }}
      >
        <div className="dg-flash" ref={flashRef} aria-hidden />
        <div className="dg-resolve">
          <span className="dg-resolve__label">🔥 HEAT</span>
          <div className="dg-resolve__track"><div className="dg-resolve__fill" style={{ transform: `scaleX(${heat})` }} /></div>
        </div>
        <div className="dg-sky">{isNight && <span className="dg-moon" />}</div>
        <div className="dg-wall" />
        <div className="dg-porchlight" />
        {round.skin === "steel" && <span className="dg-sign dg-sign--nosolicit">SALES REPS<br />FUCK OFF</span>}
        {round.skin === "gate" && <span className="dg-sign dg-sign--gate">NO<br />SOLICITING</span>}
        {round.special === "rocks" && (
          <div className="dg-windows" aria-hidden>
            <span className={`dg-pane ${panes > 0 ? "is-broke" : ""}`} />
            <span className={`dg-pane ${panes > 1 ? "is-broke" : ""}`} />
            <span className={`dg-pane ${panes > 2 ? "is-broke" : ""}`} />
          </div>
        )}

        {round.special === "chainsaw" ? (
          <div className="dg-doorshake" ref={doorRef}><Door burst={bursting} blood={blood} /><span className="dg-sawline" aria-hidden /></div>
        ) : (
          <button
            className="dg-hitzone"
            onPointerDown={(e) => tap(e, "knock")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(e, "knock"); } }}
            aria-label="Knock on the door"
          >
            <span ref={doorRef} className="dg-doorshake"><Door burst={bursting} blood={blood} /></span>
          </button>
        )}

        {round.bell && <button className="dg-bellbtn" onPointerDown={(e) => tap(e, "ring")} aria-label="Ring the doorbell">🔔<small>{rings > 0 ? `×${rings}` : "RING"}</small></button>}
        {round.special === "rocks" && <button className="dg-rockbtn" onPointerDown={(e) => tap(e, "rock")} aria-label="Throw a rock">🪨<small>THROW</small></button>}
        {round.special === "chainsaw" && (
          <button className="dg-sawbtn" onPointerDown={revOn} onPointerUp={revOff} onPointerLeave={revOff} onPointerCancel={revOff} aria-label="Rev the chainsaw">🪚<small>HOLD TO SAW</small></button>
        )}

        <div className="dg-mat"><span>GO AWAY</span></div>
        <div className="dg-bursts" ref={burstsRef} aria-hidden><span /><span /><span /><span /><span /><span /></div>
      </div>

      <div className="dg-talk" aria-live="polite">
        {themLine && <div className="dg-bubble dg-bubble--them" key={`t${nos}`}>&ldquo;{themLine}&rdquo;</div>}
        {youLine && <div className="dg-bubble dg-bubble--you" key={`y${youIdx.current}`}>{youLine}</div>}
        {!themLine && !youLine && (
          <div className="dg-bubble dg-bubble--hint">
            {round.special === "chainsaw" ? "Hold the saw. Cut through the steel." : round.special === "rocks" ? "Knock, ring, and put a rock through every window." : "Tap the door. Ring the bell. Do not stop."}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState, useCallback } from "react";
import "../../styles/door-game.css";
import "../../styles/door-fx.css";
import "../../styles/door-art.css";
import "../../styles/door-bout.css";
import "../../styles/door-gate.css";
import "../../styles/door-night.css";
import "../../styles/door-chase.css";
import {
  sfxKnock, sfxImpact, sfxDoorBreak, sfxZap, sfxDoorbell, sfxRoundBell,
  sfxPunch, sfxBlock, sfxWhoosh, sfxWoodCrack, sfxShatter,
  sfxThunder, sfxHorn, sfxIgnite, sfxMatchStrike, sfxSplat,
  sfxCoin, sfxBuzzer, sfxPop, sfxPhoenix, sfxRainbow,
  sfxRainLoop, sfxHeartbeatLoop, sfxCrowdRoar,
  sfxChainsawLoop, sfxRockThrow, sfxSparkShower, sfxKnuckleSplit, sfxBloodDrip,
  sfxRefCount, sfxTellCue, sfxStarEarn, sfxWoodSplinter, sfxDoorFall,
  playVoiceLine, stopVoiceLine,
} from "../../lib/sfx";
import { tapLight, slamHeavy } from "../../lib/haptics.js";

import createDoorFX from "./door/DoorFX.js";
import {
  DoorForSkin, Doorbell, WindowPane, Chainsaw, Fist, SlapArm, SpeedLines,
  strikeDoor, resetDoorCracks,
} from "./door/DoorArt.jsx";
import { IconSheet, GameIcon, FistIcon } from "./door/GameIcons.jsx";
import { Boxer, PlayerSilhouette, Crowd } from "./door/Boxer.jsx";
import NightGallery from "./door/NightGallery.jsx";
import RebuttalRack from "./door/RebuttalRack.jsx";
import ChaseScene from "./chase/ChaseScene.jsx";
import { recordVandalism, recordChase, addHeat, coolHeat, heatTier } from "./heat/heatStore.js";
import { HEAT } from "./heat/heatTuning.js";

// Getting seen at 11:47 PM costs the same as being made by a Ring cam and then
// some — it is the event that turns a quiet night into a wanted level.
const HEAT_GAIN_SPOTTED = HEAT.gain.spottedByNeighbor;
const coolFromEnabler = () => coolHeat(0.5, "porchLight");
import GateRound from "./door/GateRound.jsx";
import { RingCamFrame } from "./door/GateArt.jsx";
import {
  RULES, getBoss, nextAttack, comboLength, punchDamage, tellDuration,
  dodgeVerdict, willRise, countLabel, isDrawBoss, drawHand,
} from "./door/punchOut.js";

/* ════════════════════════════════════════════════════════════════════════
   DOOR LEVEL — the engine behind every level of The Door.

   A level = brief → N rounds → a finale bout → seal. Every round shares:
     · Bloody Knuckles — bare-fist knocking; cumulative damage runs the fist
       through 5 drawn stages and paints the door in persistent blood decals.
     · RESOLVE meter, banter volleys, idle drain. (Not HEAT — that name now
       belongs to the campaign-wide wanted meter in anger/heat/.)
     · Specials — bell · rocks (drag to aim) · chainsaw (real kerf) · gate.
     · A finale that ALWAYS ends in a Super Punch-Out!!-style bout. The slap
       and the door-kick are its cold opens, not endings.

   PERFORMANCE LAW: React does not re-render during play. Progress rides the
   --p custom property; impacts are class retriggers and canvas calls. The
   only setState inside tap() are coarse tier changes that actually alter the
   DOM (stage / blood / heat), which move a handful of times per round.

   ZERO EMOJI. Every glyph is a drawn <symbol> from door/GameIcons.jsx.

   Contract: { level, onClose, onComplete }.
   ════════════════════════════════════════════════════════════════════════ */

const LINE_EVERY = 2;
const STAGE_AT = [0, 0.22, 0.45, 0.68, 0.86];
const VOICE_VOL = [0.5, 0.65, 0.8, 0.92, 1.0];
const BLOOD_AT = [0, 8, 22, 40, 62];
const BLOOD_NAME = ["CLEAN", "RAW", "SPLIT", "DRIPPING", "BONE-DEEP"];
const KNOCK_WORDS = ["KNOCK", "BANG", "BAM", "BAM BAM", "WHAM", "THUD"];
const POWER_WORDS = ["BOOM!", "BAM!!", "CRACK!!", "WHAM!!!"];
const STEEL_WORDS = ["CLANG!", "CLANK!", "DONK!", "GONG!", "THUNK!"];
const RING_WORDS = ["DING!", "DONG!", "RRRING!", "DING DONG"];
const GLASS_WORDS = ["CRASH!", "SMASH!", "SHATTER!", "TINKLE!"];
const PUNCH_WORDS = ["POW!", "BIFF!", "SOCK!", "JAB!", "BAM!"];
const BOUT_SECONDS = 99;

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

function buzz(pattern) {
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
  // brief | cine | round | wall | finale | bout | wife | seal
  const [phase, setPhase] = useState("brief");
  const [fxReady, setFxReady] = useState(0);
  const [roundIdx, setRoundIdx] = useState(0);
  const [stage, setStage] = useState(0);
  const [blood, setBlood] = useState(0);
  const [nos, setNos] = useState(0);
  const [rings, setRings] = useState(0);
  const [panes, setPanes] = useState([false, false, false]);
  const [heat, setHeat] = useState(0);
  const [themLine, setThemLine] = useState(null);
  const [youLine, setYouLine] = useState(null);
  const [bursting, setBursting] = useState(false);
  const [sawing, setSawing] = useState(false);
  const [sawPulls, setSawPulls] = useState(0);
  const [aim, setAim] = useState(null);          // {ox,oy,x,y} while dragging a rock

  /* ── the objection meter ─────────────────────────────────────────────────
     The level's spine. Minted when he plays his trump card, emptied at 11:47
     PM, and it IS his health in the morning. One number, four phases. */
  const [obj, setObj] = useState(null);
  const objRef = useRef(0);
  const [galleryState, setGalleryState] = useState(null);
  const wreckedRef = useRef(new Set());
  const galleryHeatRef = useRef(0);

  // finale cold-open (slap / kick)
  const [finaleStage, setFinaleStage] = useState(null);
  const [charge, setCharge] = useState(0);
  const [slapped, setSlapped] = useState(false);
  const [speed, setSpeed] = useState(false);

  // ── the bout ───────────────────────────────────────────────────────────
  const [pose, setPose] = useState("guard");
  const [bHp, setBHp] = useState(100);
  const [pHp, setPHp] = useState(100);
  const [stars, setStars] = useState(0);
  const [newStar, setNewStar] = useState(-1);
  const [downs, setDowns] = useState(0);
  const [raging, setRaging] = useState(false);
  const [ducking, setDucking] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [myPunch, setMyPunch] = useState(null);
  const [call, setCall] = useState(null);
  const [coach, setCoach] = useState(null);
  const [countN, setCountN] = useState(0);
  const [countWho, setCountWho] = useState(null);   // "him" | "you"
  const [riseTaps, setRiseTaps] = useState(0);
  const [clock, setClock] = useState(BOUT_SECONDS);
  const [hitFlash, setHitFlash] = useState(false);
  const [wifeBeat, setWifeBeat] = useState(0);
  const [boutKind, setBoutKind] = useState("level");   // "level" | "guard" | "mid"
  const [boutBoss, setBoutBoss] = useState(null);      // overrides the finale's boss
  const [hand, setHand] = useState(null);              // the three rebuttal cards
  const [refill, setRefill] = useState(false);         // his bar going back to full
  const walledRef = useRef(false);                     // has the trump card fired
  const aHpPctRef = useRef(1);                         // his HP fraction when it did

  // ── refs (authoritative during play) ───────────────────────────────────
  const sceneRef = useRef(null);
  const camRef = useRef(null);
  const canvasRef = useRef(null);
  const fxRef = useRef(null);
  const doorRef = useRef(null);        // the shake wrapper
  const doorSvgRef = useRef(null);     // the slab itself, for hit-normalising
  const fistRef = useRef(null);
  const slapRef = useRef(null);
  const burstsRef = useRef(null);
  const kerfRef = useRef(null);

  const knocksRef = useRef(0);
  const lastTapRef = useRef(0);
  const fireHandleRef = useRef(null);
  const crowdHandleRef = useRef(null);
  const roundRef = useRef({ prog: 0, taps: 0 });
  const themIdx = useRef(0);
  const youIdx = useRef(0);
  const doneRef = useRef(false);
  const timersRef = useRef([]);
  const burstIdx = useRef(0);
  const chargeRef = useRef({ held: false, raf: 0, val: 0 });
  const revRef = useRef({ held: false, started: false });
  const rectsRef = useRef({ scene: null, door: null });
  const kerfPtsRef = useRef([]);
  const aimRef = useRef(null);

  const b = useRef({
    hp: 100, pHp: 100, state: "guard", attack: null, strikeAt: 0, comboLeft: 0,
    lastDodge: { dir: null, at: 0 }, lastPunch: 0, openAt: 0, dmgWindow: 0,
    stars: 0, downs: 0, raging: false, over: false, comeback: 1, comebackUntil: 0,
    ducking: false, blocking: false, lastAtk: null,
  });
  const punchesRef = useRef(0);

  const round = level.rounds[roundIdx];
  // `boutBoss` lets a round hand the slot to an arbitrary boss (Steele's draw
  // opens the level, long before the finale), instead of only ever the finale's.
  const boss = getBoss(boutBoss || (boutKind === "guard" ? "guard" : level.finale.bout));
  // Denominator is the bout's ACTUAL starting HP, which the objection meter can
  // compute — using boss.hp would draw a 6/100 morning bout as a full bar.
  const bossMaxHp = () => b.current.maxHp || boss.hp;
  const isBout = phase === "bout";

  const schedule = (fn, ms) => { const id = window.setTimeout(fn, ms); timersRef.current.push(id); return id; };
  const clearTimers = () => { timersRef.current.forEach((id) => window.clearTimeout(id)); timersRef.current = []; };

  /* ── FX engine lifecycle ─────────────────────────────────────────────── */
  useEffect(() => {
    if (phase === "brief" || phase === "cine" || phase === "seal") return undefined;
    const fx = createDoorFX({ canvas: canvasRef.current, scene: sceneRef.current, camera: camRef.current });
    fxRef.current = fx;
    measure();
    // React runs CHILD effects before parent ones, so any sub-phase that needs
    // fx geometry at mount (rect registration) would read null here. Bumping a
    // counter re-runs those effects the moment the engine actually exists.
    setFxReady((n) => n + 1);
    return () => { fx.destroy(); fxRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, finaleStage]);

  useEffect(() => () => {
    clearTimers();
    stopVoiceLine();
    cancelAnimationFrame(chargeRef.current.raf);
    if (crowdHandleRef.current) crowdHandleRef.current.stop();
  }, []);

  useEffect(() => {
    if (phase !== "seal") return undefined;
    sfxBuzzer();
    sfxPhoenix();
    const t = window.setTimeout(() => sfxRainbow(), 650);
    return () => window.clearTimeout(t);
  }, [phase]);

  /* Cache the rects once per round instead of reading layout on every tap. */
  const measure = useCallback(() => {
    rectsRef.current.scene = sceneRef.current ? sceneRef.current.getBoundingClientRect() : null;
    rectsRef.current.door = doorSvgRef.current ? doorSvgRef.current.getBoundingClientRect() : null;
  }, []);
  useEffect(() => {
    const on = () => measure();
    window.addEventListener("resize", on);
    window.addEventListener("orientationchange", on);
    return () => { window.removeEventListener("resize", on); window.removeEventListener("orientationchange", on); };
  }, [measure]);

  /* Scene-local + door-local coordinates for one pointer event. */
  const hitInfo = (e) => {
    let { scene, door } = rectsRef.current;
    if (!scene) { measure(); scene = rectsRef.current.scene; door = rectsRef.current.door; }
    const cx = e && e.clientX != null ? e.clientX : (scene ? scene.left + scene.width / 2 : 0);
    const cy = e && e.clientY != null ? e.clientY : (scene ? scene.top + scene.height * 0.55 : 0);
    const sx = scene ? cx - scene.left : 0;
    const sy = scene ? cy - scene.top : 0;
    const nx = door ? clamp01((cx - door.left) / door.width) : 0.5;
    const ny = door ? clamp01((cy - door.top) / door.height) : 0.45;
    return { sx, sy, nx, ny };
  };

  const retrigger = (el, cls) => {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  };

  const spawnBurst = (sx, sy, power, words) => {
    const pool = burstsRef.current;
    if (!pool) return;
    const node = pool.children[burstIdx.current++ % pool.children.length];
    const r = rectsRef.current.scene;
    node.style.left = `${sx != null ? sx : (r ? r.width / 2 : 0)}px`;
    node.style.top = `${sy != null ? sy : (r ? r.height / 2 : 0)}px`;
    node.textContent = words[(Math.random() * words.length) | 0];
    node.classList.toggle("is-power", power);
    retrigger(node, "is-live");
  };

  const wordsFor = (skin, isRing, power) => {
    if (isRing) return RING_WORDS;
    if (skin === "steel" || skin === "gate") return power ? POWER_WORDS : STEEL_WORDS;
    return power ? POWER_WORDS : KNOCK_WORDS;
  };

  /* ════════════════════════════════════════════════════════════════════
     THE KNOCK — the beat the whole game is built on.
     anticipation 60ms → strike 90ms → hit-stop → follow-through 220ms
     ════════════════════════════════════════════════════════════════════ */
  const tap = (e, kind) => {
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
    const fx = fxRef.current;
    const { sx, sy, nx, ny } = hitInfo(e);
    const steel = round.skin === "steel" || round.skin === "gate";

    if (sceneRef.current) sceneRef.current.style.setProperty("--p", String(p));
    retrigger(doorRef.current, power ? "is-pounded" : "is-hit");
    // on the ring cam every knock is uploaded to the cloud, and it shows
    if (round.special === "ringcam") retrigger(sceneRef.current, "is-jolt");
    spawnBurst(sx, sy, power, kind === "rock" ? GLASS_WORDS : wordsFor(round.skin, kind === "ring", power));
    buzz(power ? [16, 32, 22] : 9);

    if (kind === "knock") {
      // the fist flies at the point you actually touched
      const wrap = fistRef.current;
      if (wrap) {
        wrap.style.setProperty("--hx", `${sx}px`);
        wrap.style.setProperty("--hy", `${sy}px`);
        retrigger(wrap, "is-punch");
      }
      // the crack DRAWS outward from the knuckle
      strikeDoor(doorSvgRef.current, nx, ny, power ? 1.4 : 0.9);

      if (fx) {
        fx.shake(power ? 0.46 : 0.2);
        fx.hitStop(power ? 70 : 35);
        if (power) fx.flash("#fff4d6", 90, { x: sx, y: sy, alpha: 0.75, chroma: 0.5 });
        fx.zoom(power ? 0.5 : 0.18);
        fx.emit(steel ? "spark" : "splinter", sx, sy, { normal: Math.PI / 2 + Math.PI, power: power ? 1.3 : 0.8 });
        fx.emit("dust", sx, sy, { count: power ? 6 : 3, power: 0.8 });

        // BLOODY KNUCKLES — from stage 2 the split opens and it sprays
        if (bl >= 2) {
          const vol = bl >= 4 ? 3 : bl === 3 ? 1.8 : 1;
          fx.emit("blood", sx, sy, { normal: -Math.PI / 2, power: vol * (power ? 1.4 : 1) });
          fx.decal("blood", sx, sy, { normal: -Math.PI / 2, power: Math.min(1.6, vol * (power ? 1.2 : 0.8)) });
        }
      }
    }

    if (kind === "rock") { sfxShatter(); sfxImpact(Math.min(8, 5 + s)); }
    else if (kind === "ring") { sfxDoorbell(rings); sfxPop(); }
    else if (steel) sfxImpact(Math.min(8, 3 + s));
    else if (power) { sfxImpact(Math.min(8, 4 + s)); sfxWoodSplinter(); }
    else sfxKnock(Math.min(8, 1 + s));
    // the moment the skin actually opens
    if (bl > blood && bl >= 2) sfxKnuckleSplit();
    if (power && (round.skin === "night" || round.skin === "eve") && Math.random() < 0.4) sfxThunder(2 + ((Math.random() * 3) | 0));
    if (round.key === "throne" && power && Math.random() < 0.5) sfxSplat();

    if (kind === "ring") setRings((v) => v + 1);
    setStage((prev) => (prev === s ? prev : s));
    setBlood((prev) => (prev === bl ? prev : bl));
    setHeat(Math.min(1, p * 0.75 + (t % 12) / 60));

    // banter — them, then you, alternating
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

    if (r.prog >= round.taps && !doneRef.current) finishRound();
  };

  const finishRound = () => {
    doneRef.current = true;
    setHeat(1);
    sfxCoin();
    buzz([24, 48, 24]);
    if (fxRef.current) { fxRef.current.shake(0.5); fxRef.current.flash("#FFD84D", 200, { alpha: 0.5 }); }
    if (round.openLine) {
      sfxDoorBreak();
      setThemLine(round.openLine.text); setYouLine(null);
      schedule(() => playVoiceLine(round.openLine.id, { volume: 1 }), 150);
      schedule(advance, 1900);
    } else {
      schedule(advance, 850);
    }
  };

  /* ════════════════════════════════════════════════════════════════════
     THE ROCK — drag to aim, real parabola, real glass.
     ════════════════════════════════════════════════════════════════════ */
  const aimStart = (e) => {
    if (doneRef.current || phase !== "round") return;
    const { sx, sy } = hitInfo(e);
    aimRef.current = { ox: sx, oy: sy, x: sx, y: sy };
    setAim({ ...aimRef.current });
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* older webview */ }
  };
  const aimMove = (e) => {
    if (!aimRef.current) return;
    const { sx, sy } = hitInfo(e);
    aimRef.current.x = sx; aimRef.current.y = sy;
    setAim({ ...aimRef.current });
  };
  const aimEnd = () => {
    const a = aimRef.current;
    aimRef.current = null;
    setAim(null);
    if (!a || doneRef.current) return;
    // drag BACKWARDS to load — the launch vector is the reverse of the drag
    const dx = a.ox - a.x;
    const dy = a.oy - a.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 18) return;                      // a tap, not a throw
    const power = Math.min(1, (dist - 18) / 122);
    const speed0 = 300 + power * 600;
    const ang = Math.atan2(dy, dx);
    throwRock(a.ox, a.oy, Math.cos(ang) * speed0, Math.sin(ang) * speed0);
  };

  const throwRock = (x, y, vx, vy) => {
    const fx = fxRef.current;
    if (!fx) return;
    sfxRockThrow();
    fx.projectile({
      x, y, vx, vy, gravity: 1400, radius: 9,
      onHit: (name, hx, hy) => {
        if (name.startsWith("pane")) {
          const i = +name.slice(4);
          setPanes((prev) => {
            if (prev[i]) return prev;
            const next = prev.slice(); next[i] = true; return next;
          });
          shatterPane(i, hx, hy);
          return "stop";
        }
        if (name === "door") {
          // chipped it — 1× credit, bounces off
          fx.emit("splinter", hx, hy, { normal: -Math.PI / 2, power: 0.8 });
          fx.emit("dust", hx, hy, { count: 5 });
          fx.decal("chip", hx, hy, { power: 0.9 });
          fx.shake(0.22); sfxImpact(4);
          spawnBurst(hx, hy, false, ["THUD", "CHIP", "OFF THE WOOD"]);
          creditRock(1);
          return "bounce";
        }
        return null;
      },
      onExpire: () => {
        // a clean miss costs you — that's what makes aiming matter
        if (doneRef.current) return;
        sfxBlock();
        spawnBurst(null, null, false, ["MISS", "WIDE", "FLOWERBED"]);
        const line = round.them[(Math.random() * round.them.length) | 0];
        setThemLine(line.text); setYouLine(null);
        playVoiceLine(line.id, { volume: 0.9 });
      },
    });
  };

  /* Real fracture: 9 radial cracks + 3 hoop cracks partition the pane, and
     every wedge falls as its own shard. */
  const shatterPane = (i, hx, hy) => {
    const fx = fxRef.current;
    if (!fx) return;
    sfxShatter();
    sfxImpact(6);
    buzz([16, 30, 16]);
    fx.shake(0.6);
    fx.hitStop(80);
    fx.flash("#dff1ff", 110, { x: hx, y: hy, alpha: 0.7, chroma: 0.6 });
    for (let ring = 0; ring < 3; ring++) {
      fx.emit("glass", hx, hy, {
        count: 8, power: 1.2 - ring * 0.25,
        spread: Math.PI, speed: 1 - ring * 0.22, lifeMul: 1 + ring * 0.3,
      });
    }
    fx.emit("dust", hx, hy, { count: 6 });
    spawnBurst(hx, hy, true, GLASS_WORDS);
    creditRock(3);
  };

  const creditRock = (mult) => {
    if (doneRef.current || phase !== "round") return;
    const r = roundRef.current;
    r.taps += 1;
    knocksRef.current += 1;
    r.prog = Math.min(round.taps, r.prog + 1.4 * mult);
    const p = r.prog / round.taps;
    const s = stageFor(p);
    if (sceneRef.current) sceneRef.current.style.setProperty("--p", String(p));
    setStage((prev) => (prev === s ? prev : s));
    setBlood(bloodFor(knocksRef.current));
    setHeat(Math.min(1, p * 0.85));
    if (r.prog >= round.taps && !doneRef.current) finishRound();
  };

  /* ════════════════════════════════════════════════════════════════════
     THE CHAINSAW — three pull-cord yanks, then a real kerf that follows
     your finger, sparks off steel and sawdust off wood.
     ════════════════════════════════════════════════════════════════════ */
  const pullCord = () => {
    if (revRef.current.started) return;
    const n = sawPulls + 1;
    setSawPulls(n);
    sfxMatchStrike();
    retrigger(sceneRef.current, "is-pulling");
    if (n < 3) {
      // the first two cough and die
      sfxWoodCrack();
      setCoach("It coughed. Pull it again.");
      return;
    }
    revRef.current.started = true;
    sfxIgnite();
    setCoach("Now drag it across the steel.");
    if (fireHandleRef.current) { fireHandleRef.current.setLevel(0.22); fireHandleRef.current.idle(); }
    if (round.chainsawLine) playVoiceLine(round.chainsawLine.id, { volume: 1 });
  };

  const sawStart = (e) => {
    if (!revRef.current.started || doneRef.current) { pullCord(); return; }
    revRef.current.held = true;
    setSawing(true);
    kerfPtsRef.current = [];
    // the engine audibly labours the instant the bar bites
    if (fireHandleRef.current) { fireHandleRef.current.setLevel(0.42); fireHandleRef.current.setLoad(1); }
    sawMove(e);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* older webview */ }
  };

  const sawMove = (e) => {
    if (!revRef.current.held || doneRef.current) return;
    const fx = fxRef.current;
    const { sx, sy, nx, ny } = hitInfo(e);
    const pts = kerfPtsRef.current;
    const last = pts[pts.length - 1];
    if (last && Math.hypot(sx - last[0], sy - last[1]) < 5) return;
    pts.push([sx, sy]);
    if (pts.length > 220) pts.shift();

    // draw the kerf as a path that literally follows the finger
    if (kerfRef.current) {
      const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
      for (const path of kerfRef.current.children) path.setAttribute("d", d);
    }

    const steel = round.skin === "steel" || round.skin === "gate";
    if (fx) {
      const tang = last ? Math.atan2(sy - last[1], sx - last[0]) : 0;
      // sparks fly along the tangent, opposite the travel
      fx.emit(steel ? "spark" : "sawdust", sx, sy, {
        normal: tang + Math.PI, spread: 0.7, count: steel ? 5 : 4, power: 1.2,
      });
      if (steel) fx.emit("spark", sx, sy, { normal: tang + Math.PI + 0.9, count: 3, power: 0.9 });
      fx.light(sx, sy, 54, 0.55);                 // the cut tip glows and flickers
      fx.shake(0.06);
      if (!steel) fx.decal("sawdust", sx, sy + 4, {});
      else fx.decal("scorch", sx, sy, { power: 0.4 });
    }

    strikeDoor(doorSvgRef.current, nx, ny, 0.5);
    if (steel) sfxSparkShower(1); else sfxWoodCrack();

    // progress
    const r = roundRef.current;
    r.taps += 1;
    knocksRef.current += 1;
    r.prog = Math.min(round.taps, r.prog + 0.5);
    const p = r.prog / round.taps;
    if (sceneRef.current) sceneRef.current.style.setProperty("--p", String(p));
    setHeat(Math.min(1, p));
    const s = stageFor(p);
    setStage((prev) => (prev === s ? prev : s));
    setBlood(bloodFor(knocksRef.current));

    if (r.prog >= round.taps && !doneRef.current) {
      doneRef.current = true;
      revRef.current.held = false;
      setSawing(false);
      dropTheCut();
    }
  };

  const sawEnd = () => {
    revRef.current.held = false;
    setSawing(false);
    // free-revving again — the RPM climbs back up
    if (fireHandleRef.current) { fireHandleRef.current.setLevel(0.2); fireHandleRef.current.setLoad(0); }
    if (fxRef.current) fxRef.current.clearLight();
  };

  /* The cut closes — that piece of the door tips out and slams flat. */
  const dropTheCut = () => {
    const fx = fxRef.current;
    sfxDoorFall(); sfxDoorBreak(); sfxImpact(8);
    if (fireHandleRef.current) fireHandleRef.current.setLoad(0);
    buzz([30, 60, 30, 90]);
    setBursting(true);
    if (fx) {
      fx.shake(0.9); fx.hitStop(120);
      fx.flash("#ffd9a0", 160, { alpha: 0.6, chroma: 0.7 });
      const r = rectsRef.current.scene;
      const cx = r ? r.width / 2 : 0, cy = r ? r.height * 0.55 : 0;
      fx.emit("debris", cx, cy, { count: 12, power: 1.4 });
      fx.emit("splinter", cx, cy, { count: 18, power: 1.5 });
      fx.emit("dust", cx, cy + 60, { count: 16, power: 1.4, spread: 2.6 });
      fx.clearLight();
    }
    schedule(advance, 1500);
  };

  /* ── ambient loops + storm + idle drain ──────────────────────────────── */
  useEffect(() => {
    if (phase !== "round") return undefined;
    const handles = [];
    const skin = round.skin;
    // Rain sits WAY back — texture under the thunder cracks, never a wash over the
    // scene. No wind loop at all: a swept bandpass over noise is how you build ocean
    // surf, and that's exactly what it sounded like on the gate.
    if (skin === "night" || skin === "eve") { const h = sfxRainLoop(); h.setLevel(skin === "night" ? 0.07 : 0.045); handles.push(h); }
    if (round.special === "chainsaw") { const h = sfxChainsawLoop(); h.setLevel(0.0001); handles.push(h); fireHandleRef.current = h; }

    let thunderIv = null;
    if (skin === "night" || skin === "eve") {
      thunderIv = window.setInterval(() => {
        if (!doneRef.current && Math.random() < 0.45) {
          sfxThunder(2 + ((Math.random() * 3) | 0));
          if (fxRef.current) fxRef.current.flash("#b9d6ff", 220, { alpha: 0.28 });
        }
      }, 3400);
    }

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

    // BLOODY KNUCKLES: a wrecked hand drips between punches, on its own
    let dripIv = null;
    dripIv = window.setInterval(() => {
      if (doneRef.current || blood < 3 || !fxRef.current) return;
      const r = rectsRef.current.scene;
      if (!r) return;
      fxRef.current.emit("drip", r.width * 0.5 + (Math.random() * 60 - 30), r.height * 0.62, { count: 1 });
      sfxBloodDrip();
    }, 600);

    return () => {
      handles.forEach((h) => h.stop && h.stop());
      fireHandleRef.current = null;
      if (thunderIv) window.clearInterval(thunderIv);
      if (drainIv) window.clearInterval(drainIv);
      if (dripIv) window.clearInterval(dripIv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roundIdx, blood]);

  /* Register collision targets once the round's DOM exists. The gallery owns
     its own rects (it has a dozen, laid out from data) — registering a `door`
     in front of them would swallow every egg, since DoorFX takes the FIRST
     overlapping rect out of an insertion-ordered Map. */
  useEffect(() => {
    if (phase !== "round" || !fxRef.current) return;
    if (round.special === "gallery") return;
    const fx = fxRef.current;
    measure();
    const r = rectsRef.current.scene;
    const d = rectsRef.current.door;
    if (r && d) {
      fx.setRect("door", { x: d.left - r.left, y: d.top - r.top, w: d.width, h: d.height });
    }
    if (round.special === "rocks" && r) {
      // the three front windows, laid out by CSS at 8% / 24%
      const pw = r.width * 0.13, ph = r.height * 0.15;
      for (let i = 0; i < 3; i++) {
        fx.setRect(`pane${i}`, { x: r.width * 0.06 + i * (pw + 8), y: r.height * 0.22, w: pw, h: ph });
      }
    }
    return () => { fx.setRect("door", null); for (let i = 0; i < 3; i++) fx.setRect(`pane${i}`, null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, roundIdx, measure]);

  /* ── round flow ──────────────────────────────────────────────────────── */
  const enterRound = (i) => {
    clearTimers();
    doneRef.current = false;
    roundRef.current = { prog: 0, taps: 0 };
    themIdx.current = (Math.random() * 3) | 0;
    youIdx.current = (Math.random() * 3) | 0;
    revRef.current = { held: false, started: false };
    kerfPtsRef.current = [];
    setRoundIdx(i);
    setStage(0);
    setHeat(0);
    setSawPulls(0);
    setSawing(false);
    setPanes([false, false, false]);
    setThemLine(null); setYouLine(null);
    setBursting(false);
    setCoach(null);
    lastTapRef.current = performance.now();
    if (sceneRef.current) sceneRef.current.style.setProperty("--p", "0");
    resetDoorCracks(doorSvgRef.current);
    if (fxRef.current) { fxRef.current.reset(); }
    const r = level.rounds[i];
    if (r.cine) { setPhase("cine"); return; }
    if (r.special === "bout") { setBoutKind("mid"); startBout("mid", r.bout); return; }
    setPhase("round");
    sfxRoundBell();
  };

  const startRoundFromCine = () => {
    doneRef.current = false;
    // A round may BE a bout. Keeping it in the same rounds[] array means the
    // ladder stays one list and `advance()` still owns what comes next.
    const r = level.rounds[roundIdx];
    if (r.special === "bout") { setBoutKind("mid"); startBout("mid", r.bout); return; }
    setPhase("round");
    sfxRoundBell();
    schedule(measure, 60);
  };

  const advance = () => {
    doneRef.current = false;
    if (roundIdx + 1 < level.rounds.length) enterRound(roundIdx + 1);
    else enterFinale();
  };

  /* ════════════════════════════════════════════════════════════════════
     THE COLD OPEN — slap or door-kick. It doesn't end the level any more;
     it staggers him into the fighting stance and rings the bell.
     ════════════════════════════════════════════════════════════════════ */
  const enterFinale = () => {
    clearTimers();
    setThemLine(null); setYouLine(null);
    setSlapped(false); setCharge(0);
    chargeRef.current.val = 0;
    sfxHorn(1);
    const t = level.finale.type;
    setPhase("finale");
    if (t === "powerslap") setFinaleStage("slap");
    else if (t === "kickdown") setFinaleStage("kick");
    else startBout("level");
  };

  const chargeStart = () => {
    if (slapped) return;
    chargeRef.current.held = true;
    sfxWhoosh();
    if (sceneRef.current) sceneRef.current.classList.add("is-coiling");
    const loop = () => {
      if (!chargeRef.current.held) return;
      chargeRef.current.val = Math.min(1, chargeRef.current.val + 0.022);
      const v = chargeRef.current.val;
      // the arm's rotation IS the meter — written imperatively, no render
      if (slapRef.current) {
        slapRef.current.style.setProperty("--coil", v.toFixed(3));
        slapRef.current.classList.toggle("is-full", v > 0.94);
      }
      if (sceneRef.current) sceneRef.current.style.setProperty("--coil", v.toFixed(3));
      if (v >= 1) { setCharge(1); release(); return; }
      chargeRef.current.raf = requestAnimationFrame(loop);
    };
    chargeRef.current.raf = requestAnimationFrame(loop);
  };

  const release = () => {
    if (!chargeRef.current.held || slapped) return;
    chargeRef.current.held = false;
    cancelAnimationFrame(chargeRef.current.raf);
    const c = chargeRef.current.val;
    if (sceneRef.current) sceneRef.current.classList.remove("is-coiling");
    if (c < 0.55) {
      setCoach("Not enough — wind it ALL the way back.");
      chargeRef.current.val = 0; setCharge(0);
      if (slapRef.current) { slapRef.current.style.setProperty("--coil", "0"); slapRef.current.classList.remove("is-full"); }
      schedule(() => setCoach(null), 1100);
      return;
    }
    setSlapped(true);
    setCoach(null);
    setCharge(c);
    if (slapRef.current) retrigger(slapRef.current, "is-swing");

    // the impact lands 130ms into the swing
    schedule(() => {
      const fx = fxRef.current;
      const r = rectsRef.current.scene;
      const cx = r ? r.width * 0.52 : 0;
      const cy = r ? r.height * 0.42 : 0;
      setSpeed(true);
      setPose("hurt");
      buzz([30, 60, 30, 90]);
      if (fx) {
        fx.hitStop(110);
        fx.flash("#ffffff", 70, { alpha: 0.92, radial: false, chroma: 1 });
        fx.shake(0.85);
        fx.zoom(0.7);
        fx.emit("sweat", cx, cy, { normal: 0, count: 14, power: 1.3 });
        if (blood >= 2) {
          fx.emit("blood", cx, cy, { normal: 0, power: 1.4 });
          fx.decal("blood", cx, cy, { normal: 0, power: 1.2 });
        }
      }
      if (finaleStage === "kick") {
        sfxHorn(1); sfxDoorBreak(); sfxImpact(8);
        setBursting(true);
        if (fx) { fx.emit("debris", cx, cy + 40, { count: 14, power: 1.5 }); fx.emit("splinter", cx, cy, { count: 16, power: 1.4 }); }
        if (level.finale.kickLine) schedule(() => playVoiceLine(level.finale.kickLine.id, { volume: 1 }), 150);
      } else {
        sfxImpact(8);
        if (level.finale.line) schedule(() => playVoiceLine(level.finale.line.id, { volume: 1 }), 120);
      }
      schedule(() => setSpeed(false), 260);
      // ...and the bell rings
      schedule(() => { setBursting(false); startBout("level"); }, 1750);
    }, 130);
  };

  /* ════════════════════════════════════════════════════════════════════
     THE BOUT — Super Punch-Out!!
     idle → TELL → strike → recover, with dodge / counter / star windows.
     ════════════════════════════════════════════════════════════════════ */
  const say = (text, variant) => {
    setCall({ text, variant, k: Math.random() });
    schedule(() => setCall(null), 700);
  };

  /* ── THE WALL ────────────────────────────────────────────────────────────
     He hits 20% and plays the only card that always works: he tells you who
     he is. His health goes back to full and the door shuts.

     You cannot win Phase A. That is the design, not a difficulty spike — the
     sentence he just used is the thing you're going to go and destroy at 11:47
     PM, and it has to beat you first or destroying it means nothing. */
  const theWall = () => {
    clearTimers();
    b.current.over = true;                     // stop the AI loop dead
    walledRef.current = true;
    aHpPctRef.current = hpPct();               // bank what you DID take off him
    setHand(null);

    const w = level.wall || {};
    if (w.trump) playVoiceLine(w.trump.id, { volume: 1 });
    setBHp(100);
    setRefill(true);
    const fx = fxRef.current;
    if (fx) { fx.flash(level.objection?.tone || "#3AA0FF", 420, { alpha: 0.5 }); fx.shake(0.85); }
    sfxHorn(1); sfxDoorBreak();
    say(w.shout || "SAFE NEIGHBOURHOOD.", "crit");

    schedule(() => {
      objRef.current = level.objection ? level.objection.start : 100;
      setObj(objRef.current);
      setRefill(false);
      setPhase("wall");
    }, 1500);
  };

  /* Caught three times on the fence — he gets out of the cart. Beat him and
     the barrier lifts, which finishes the breach. */
  const startGuardBout = () => {
    setBoutKind("guard");
    schedule(() => startBout("guard"), 30);
  };

  const startBout = (kind, bossId) => {
    clearTimers();
    const who = getBoss(bossId || (kind === "guard" ? "guard" : level.finale.bout));
    setBoutBoss(who.id);

    /* THE REVENGE ECONOMY, as arithmetic.
       When a finale declares `hpFrom: "objection"`, the boss's health is what
       is LEFT of the sentence he beat you with, scaled by how far you'd already
       worn him down before he played it. Empty the meter at midnight and he
       has a handful of HP in the morning; skip the night and it's a real
       fight. No cutscene, no special-casing — and every future level that
       wants the same trick gets it for one line of data. */
    let hp = who.hp;
    const fin = level.finale || {};
    if (kind !== "guard" && fin.hpFrom === "objection" && level.objection) {
      const left = Math.max(0, objRef.current) / (level.objection.start || 100);
      hp = Math.max(fin.hpFloor || 6, Math.round(who.hp * left * (aHpPctRef.current || 1)));
    }

    b.current = {
      hp, pHp: 100, state: "guard", attack: null, strikeAt: 0, comboLeft: 0,
      lastDodge: { dir: null, at: 0 }, lastPunch: 0, openAt: 0, dmgWindow: 0,
      stars: 0, downs: 0, raging: false, over: false, comeback: 1, comebackUntil: 0,
      ducking: false, blocking: false, lastAtk: null, drawStreak: 0, maxHp: hp,
    };
    setBHp(100); setPHp(100); setStars(0); setDowns(0); setRaging(false);
    setDucking(false); setBlocking(false); setCountWho(null); setCountN(0);
    setClock(BOUT_SECONDS);
    setPose("guard");
    setCoach(who.coach);
    setPhase("bout");
    setFinaleStage(null);
    sfxRoundBell();
    sfxHorn(1);
    if (!crowdHandleRef.current) { crowdHandleRef.current = sfxHeartbeatLoop(); crowdHandleRef.current.setLevel(0.16); }
    if (kind !== "guard" && level.finale.them && level.finale.them[0]) playVoiceLine(level.finale.them[0].id, { volume: 1 });
    schedule(() => setCoach(null), 4200);
    schedule(loopGuard, 1600);
  };

  // round clock
  useEffect(() => {
    if (phase !== "bout" || countWho) return undefined;
    const iv = window.setInterval(() => {
      setClock((c) => {
        if (c <= 1) { window.clearInterval(iv); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => window.clearInterval(iv);
  }, [phase, countWho]);

  const setBossPose = (p) => { setPose(p); };
  const hpPct = () => b.current.hp / bossMaxHp();

  const loopGuard = () => {
    if (b.current.over || countWho) return;
    b.current.state = "guard";
    setBossPose("guard");
    const wait = b.current.raging ? 380 + Math.random() * 320 : 620 + Math.random() * 620;
    schedule(beginTell, wait);
  };

  const beginTell = () => {
    if (b.current.over || countWho) return;
    const atk = nextAttack(boss, { raging: b.current.raging, last: b.current.lastAtk });
    b.current.lastAtk = atk.id;
    b.current.attack = atk;

    // HAROLD bows before a combo — the bow IS the tell for the whole string
    if (boss.gimmick.kind === "bow" && b.current.comboLeft <= 0 && Math.random() < 0.45) {
      b.current.comboLeft = boss.gimmick.comboLen;
      b.current.state = "tell";
      setBossPose("bow");
      say(boss.gimmick.note, "");
      schedule(beginTell, 520);
      return;
    }

    const base = b.current.raging ? boss.gimmick.tellMs || 220 : atk.tellMs;
    const dur = tellDuration(base, hpPct(), boss.tellFloor);
    b.current.state = "tell";
    b.current.strikeAt = performance.now() + dur;
    setBossPose(atk.tell);
    sfxTellCue(atk.cue);                             // learn them by ear first

    // A draw boss asks WHICH, not WHERE — deal three cards, one of them right.
    if (isDrawBoss(boss)) {
      b.current.tellMs = dur;
      setHand({ cards: drawHand(boss, atk), at: performance.now(), dur, label: atk.label });
      schedule(() => setHand(null), dur + atk.strikeMs);
    }

    // the fake-out: he starts the tell and aborts. Now readable, not random noise.
    if (hpPct() < 0.75 && Math.random() < boss.fakeChance) {
      schedule(() => {
        if (b.current.over) return;
        b.current.state = "guard";
        setBossPose("guard");
        say("FAKE-OUT!", "");
        schedule(beginTell, 380 + Math.random() * 420);
      }, dur * 0.62);
      return;
    }
    schedule(() => doStrike(atk), dur);
  };

  const doStrike = (atk) => {
    if (b.current.over || countWho) return;
    b.current.state = "strike";
    setBossPose(atk.dodge === "left" ? "strikeL" : "strike");
    sfxWhoosh();

    schedule(() => {
      if (b.current.over) return;
      const now = performance.now();
      const d = b.current.lastDodge;
      // For a draw boss the input IS the card key, so the ducking special-case
      // must not overwrite it — he has no low swing to duck under.
      const moved = isDrawBoss(boss)
        ? (now - d.at < 420 ? d.dir : null)
        : (b.current.ducking ? "duck" : (now - d.at < 320 ? d.dir : null));
      const verdict = dodgeVerdict(d.at || now, b.current.strikeAt, moved, atk.dodge);
      const dodged = verdict === "perfect" || verdict === "clean";

      if (dodged) {
        // he whiffs and is wide open
        const fx = fxRef.current;
        sfxWhoosh();
        spawnBurst(null, null, true, ["WHIFF!", "SWISH!", "AIR!"]);
        if (verdict === "perfect") {
          say("PERFECT!", "perfect");
          if (fx) { fx.slowMo(RULES.SLOWMO_SCALE, RULES.SLOWMO_MS); fx.flash("#00F0FF", 140, { alpha: 0.4 }); }
          addStar();
        }
        b.current.state = "open";
        b.current.openAt = performance.now();
        b.current.dmgWindow = 0;
        setBossPose("open");
        setCoach("OPENING — HIT HIM");
        schedule(() => {
          if (b.current.over || b.current.state !== "open") return;
          setCoach(null);
          nextBeat();
        }, atk.recoverMs);
      } else {
        // it lands
        const raw = atk.dmg;
        const dmg = b.current.blocking ? Math.round(raw * (1 - RULES.BLOCK_REDUCTION)) : raw;
        b.current.pHp = Math.max(0, b.current.pHp - dmg);
        setPHp(b.current.pHp);
        const fx = fxRef.current;
        if (b.current.blocking) {
          sfxBlock();
          spawnBurst(null, null, false, ["BLOCK", "GUARD", "SHIELDED"]);
          if (fx) { fx.shake(0.25); fx.hitStop(40); }
        } else {
          sfxImpact(6);
          buzz([20, 50, 20]);
          spawnBurst(null, null, true, ["SMACK!!", "OOF!!", "WALLOP!"]);
          if (fx) {
            fx.shake(0.7); fx.hitStop(80);
            fx.flash("#ff2d55", 180, { alpha: 0.42, chroma: 0.8 });
            fx.zoom(0.4);
          }
          if (level.finale.them && level.finale.them.length) {
            const l = level.finale.them[(Math.random() * level.finale.them.length) | 0];
            playVoiceLine(l.id, { volume: 1 });
            setThemLine(l.text); setYouLine(null);
          }
        }
        if (b.current.pHp <= 0) { goDown("you"); return; }
        nextBeat();
      }
    }, atk.strikeMs * 0.42);
  };

  const nextBeat = () => {
    if (b.current.over || countWho) return;
    if (b.current.comboLeft > 0) {
      b.current.comboLeft -= 1;
      schedule(beginTell, 220);
    } else {
      loopGuard();
    }
  };

  const addStar = () => {
    if (b.current.stars >= RULES.MAX_STARS) return;
    b.current.stars += 1;
    setStars(b.current.stars);
    setNewStar(b.current.stars - 1);
    sfxStarEarn();
    schedule(() => setNewStar(-1), 500);
  };

  /* ── player inputs ───────────────────────────────────────────────────── */
  const dodge = (dir) => {
    if (b.current.over || countWho) return;
    b.current.lastDodge = { dir, at: performance.now() };
    sfxWhoosh();
    setMyPunch(null);
    setDucking(dir === "duck");
    b.current.ducking = dir === "duck";
    if (dir !== "duck") schedule(() => { b.current.ducking = false; setDucking(false); }, 300);
  };

  /* Playing a rebuttal card. Same verb as a dodge — the bout engine compares
     `moved` to `needed` and has no opinion about what those strings mean. */
  const playCard = (key) => {
    if (b.current.over || countWho) return;
    const atk = b.current.attack;
    const right = atk && atk.dodge === key;
    b.current.lastDodge = { dir: key, at: performance.now() };
    setHand(null);
    if (right) {
      b.current.drawStreak = (b.current.drawStreak || 0) + 1;
      sfxTellCue("sharp");
      // three clean draws in a row IS the star for this boss — he gives no
      // perfect-dodge windows, so the stock star route never fires
      if (b.current.drawStreak >= (boss.gimmick.streakForStar || 3)) {
        b.current.drawStreak = 0;
        addStar();
        say(boss.gimmick.note || "STAR READY", "perfect");
      }
    } else {
      b.current.drawStreak = 0;
      sfxBlock();
    }
  };
  const duckOn = () => { if (b.current.over) return; b.current.ducking = true; setDucking(true); b.current.lastDodge = { dir: "duck", at: performance.now() }; };
  const duckOff = () => { b.current.ducking = false; setDucking(false); };
  const blockOn = () => { if (b.current.over) return; b.current.blocking = true; setBlocking(true); };
  const blockOff = () => { b.current.blocking = false; setBlocking(false); };

  const hitBoss = (dmg, { crit = false, star = false } = {}) => {
    const fx = fxRef.current;
    b.current.hp = Math.max(0, b.current.hp - dmg);

    /* THE WALL — the scripted loss.
       Clamped BEFORE the stun and KO checks, and floored at the trigger point,
       because a banked knockdown could otherwise carry him past 20% and the
       trump card would have to interrupt a ten-count. */
    if (isDrawBoss(boss) && !walledRef.current) {
      const floor = bossMaxHp() * (boss.gimmick.wallAt || 0.2);
      if (b.current.hp <= floor) {
        b.current.hp = floor;
        setBHp(Math.round((b.current.hp / bossMaxHp()) * 100));
        theWall();
        return;
      }
    }
    setBHp(Math.round((b.current.hp / bossMaxHp()) * 100));
    b.current.dmgWindow += dmg;
    setHitFlash(true);
    schedule(() => setHitFlash(false), 70);

    const r = rectsRef.current.scene;
    const cx = r ? r.width * 0.5 : 0;
    const cy = r ? r.height * 0.42 : 0;

    if (star) {
      sfxImpact(8); sfxCrowdRoar();
      say("STAR PUNCH!!", "crit");
      if (fx) {
        fx.hitStop(RULES.STAR_DAMAGE > 0 ? 180 : 100);
        fx.flash("#FFD84D", 220, { alpha: 0.85, chroma: 1 });
        fx.shake(1); fx.zoom(0.9);
        fx.emit("star", cx, cy, { count: 8, power: 1.4 });
        fx.emit("sweat", cx, cy, { count: 16, power: 1.4 });
      }
      setBossPose("hurt");
    } else if (crit) {
      sfxPunch(3); say("COUNTER!", "crit");
      if (fx) { fx.hitStop(90); fx.shake(0.6); fx.flash("#FF5C4D", 130, { alpha: 0.5 }); fx.zoom(0.5); fx.emit("sweat", cx, cy, { count: 10, power: 1.2 }); }
      setBossPose("hurt");
    } else {
      sfxPunch(2);
      if (fx) { fx.hitStop(45); fx.shake(0.3); fx.zoom(0.25); fx.emit("sweat", cx, cy, { count: 5 }); }
    }
    spawnBurst(cx, cy, crit || star, PUNCH_WORDS);
    buzz(star ? [30, 60, 30, 90] : [10, 20, 10]);

    // rage phase
    if (!b.current.raging && boss.gimmick.kind === "rage" && hpPct() <= boss.gimmick.atPct) {
      b.current.raging = true;
      setRaging(true);
      say(boss.gimmick.note, "crit");
      sfxHorn(1);
      if (fx) { fx.flash("#ff0033", 300, { alpha: 0.5 }); fx.shake(0.8); }
    }

    // stun
    if (b.current.dmgWindow >= RULES.STUN_THRESHOLD && b.current.state !== "stun") {
      b.current.state = "stun";
      b.current.dmgWindow = 0;
      clearTimers();
      setBossPose("stun");
      say("STUNNED!", "");
      if (fx) fx.emit("star", cx, cy - 40, { count: 5 });
      schedule(() => { if (!b.current.over) loopGuard(); }, RULES.STUN_MS);
    }

    if (b.current.hp <= 0) goDown("him");
  };

  const punch = () => {
    if (phase !== "bout" || b.current.over || countWho) return;
    const now = performance.now();
    if (now - b.current.lastPunch < RULES.PUNCH_COOLDOWN_MS) return;
    b.current.lastPunch = now;
    if (b.current.ducking) { setCoach("Can't punch while you're under it."); schedule(() => setCoach(null), 900); return; }
    punchesRef.current += 1;
    setMyPunch(punchesRef.current % 2 ? "l" : "r");
    schedule(() => setMyPunch(null), 150);

    const st = b.current.state;
    const comeback = now < b.current.comebackUntil ? RULES.COMEBACK_MULT : 1;
    const inCounter = st === "open" && now - b.current.openAt < RULES.COUNTER_MS;
    const weak = b.current.attack && b.current.attack.weak && (st === "tell" || st === "open");

    if (st === "open" || st === "stun") {
      let dmg = punchDamage(st, { weakHit: !!weak, comeback });
      if (inCounter) dmg = Math.round(dmg * RULES.COUNTER_MULT);
      hitBoss(dmg, { crit: inCounter });
    } else if (st === "tell" || st === "strike") {
      hitBoss(punchDamage(st, { comeback }));
      spawnBurst(null, null, false, ["CLIP", "GRAZE"]);
    } else {
      sfxBlock();
      setBossPose("block");
      schedule(() => { if (!b.current.over && b.current.state === "guard") setBossPose("guard"); }, 160);
      hitBoss(punchDamage("guard", { comeback }));
      spawnBurst(null, null, false, ["BLOCKED", "GUARD"]);
    }
  };

  const starPunch = () => {
    if (b.current.stars <= 0 || b.current.over || countWho) return;
    b.current.stars -= 1;
    setStars(b.current.stars);
    setMyPunch("r");
    schedule(() => setMyPunch(null), 220);
    hitBoss(RULES.STAR_DAMAGE, { star: true });
  };

  /* ── knockdowns + the ten count ──────────────────────────────────────── */
  const goDown = (who) => {
    clearTimers();
    setCoach(null);
    setCountWho(who);
    setCountN(0);
    setRiseTaps(0);
    sfxBuzzer();
    if (who === "him") {
      b.current.downs += 1;
      setDowns(b.current.downs);
      setBossPose("ko");
      sfxImpact(8); sfxCrowdRoar();
      buzz([30, 60, 30, 90]);
      if (fxRef.current) { fxRef.current.shake(1); fxRef.current.hitStop(160); fxRef.current.flash("#fff", 200, { alpha: 0.7 }); }
    } else {
      sfxZap();
      if (fxRef.current) { fxRef.current.shake(0.9); fxRef.current.flash("#ff0033", 260, { alpha: 0.6 }); }
    }
    tickCount(1, who);
  };

  const tickCount = (n, who) => {
    setCountN(n);
    sfxRefCount(n);
    if (n >= RULES.COUNT_TO) {
      schedule(() => finishCount(who, false), RULES.COUNT_TICK_MS);
      return;
    }
    schedule(() => {
      // he may beat the count part-way through
      if (who === "him" && n >= 3 && willRise(hpPct(), b.current.downs)) { finishCount(who, true); return; }
      tickCount(n + 1, who);
    }, RULES.COUNT_TICK_MS);
  };

  const finishCount = (who, rose) => {
    if (who === "him") {
      if (rose) {
        b.current.hp = Math.max(12, Math.round(bossMaxHp() * 0.22));
        setBHp(Math.round((b.current.hp / bossMaxHp()) * 100));
        setCountWho(null); setCountN(0);
        setBossPose("guard");
        sfxHorn(1);
        say("HE'S UP!", "");
        schedule(loopGuard, 900);
      } else {
        b.current.over = true;
        setCountWho(null);
        setBossPose("ko");
        sfxCrowdRoar();
        // Any bout that ISN'T the finale is a detour inside the ladder — the
        // gate guard, or a round that happens to be a fight. Beating it hands
        // control back to advance() rather than ending the level.
        if (boutKind !== "level") {
          if (crowdHandleRef.current) { crowdHandleRef.current.stop(); crowdHandleRef.current = null; }
          const wasGuard = boutKind === "guard";
          setBoutKind("level");
          setBoutBoss(null);
          schedule(() => {
            if (wasGuard) {
              setPhase("round");
              setCoach("Barrier's up. Walk in.");
              schedule(() => { setCoach(null); finishRound(); }, 1400);
            } else {
              advance();
            }
          }, 1500);
          return;
        }
        if (level.finale.ko) schedule(() => playVoiceLine(level.finale.ko.id, { volume: 1 }), 400);
        // Level 1's signature beat: his wife walks out, sees the carnage, signs.
        if (level.finale.wife) schedule(() => startWife(), 1900);
        else schedule(() => setPhase("seal"), 1900);
      }
      return;
    }
    // you didn't make it up
    setCountWho(null);
    b.current.over = true;
    setCoach(null);
    setPhase("bout");
    setPHp(0);
  };

  const mashRise = () => {
    if (countWho !== "you") return;
    const n = riseTaps + 1;
    setRiseTaps(n);
    sfxPop();
    if (n >= RULES.RISE_MASHES) {
      clearTimers();
      setCountWho(null);
      b.current.pHp = 40;
      setPHp(40);
      // rising late buys you the comeback
      if (countN >= 8) {
        b.current.comebackUntil = performance.now() + RULES.COMEBACK_MS;
        say("SECOND WIND!", "perfect");
        sfxPhoenix();
      }
      sfxRoundBell();
      schedule(loopGuard, 800);
    }
  };

  /* ── the wife (Level 1 only) ─────────────────────────────────────────── */
  const startWife = () => {
    clearTimers();
    if (crowdHandleRef.current) { crowdHandleRef.current.stop(); crowdHandleRef.current = null; }
    setWifeBeat(0);
    setPhase("wife");
    const beats = level.finale.wife;
    playVoiceLine(beats[0].id, { volume: 1 });
    sfxRainbow();
    beats.forEach((line, i) => {
      if (i === 0) return;
      schedule(() => { setWifeBeat(i); playVoiceLine(line.id, { volume: 1 }); }, i * 4200);
    });
    schedule(() => setWifeBeat(beats.length), beats.length * 4200);
  };

  /* ── plumbing ────────────────────────────────────────────────────────── */
  const seal = () => {
    stopVoiceLine();
    if (crowdHandleRef.current) { crowdHandleRef.current.stop(); crowdHandleRef.current = null; }
    onComplete({
      level: level.id,        // the slug — this is what progress is keyed by
      order: level.order,     // ladder position, for display only
      title: level.title,
      knocks: knocksRef.current,
      nos,
      takeaway: `${level.title}: ${knocksRef.current} knocks, ${nos} NOs survived, ${BLOOD_NAME[blood].toLowerCase()} knuckles — ${boss.name} went down in ${b.current.downs || 1}.`,
    });
  };

  const restart = () => {
    clearTimers(); stopVoiceLine();
    knocksRef.current = 0;
    setNos(0); setRings(0); setPanes([false, false, false]); setBlood(0);
    enterRound(0);
  };

  /* topBar is called from every phase's render block, so hanging the objection
     meter here is what makes it persist across the whole level — you see the
     sentence he beat you with from the moment he says it until it's gone. */
  const topBar = (extra) => (
    <>
      <div className="dg-top">
        <button className="dg-back" onClick={onClose}>← Route</button>
        <span className="dg-top__title">{level.title}</span>
        {extra}
        <span className="dg-nos"><GameIcon name="x" size={11} /> {nos}</span>
      </div>
      {level.objection && obj != null && (
        <div className="dg-obj" style={{ "--obj": level.objection.tone || level.accent }}>
          <span className="dg-obj__label">{level.objection.label}</span>
          <div className="dg-obj__track">
            <i className="dg-obj__fill" style={{ transform: `scaleX(${Math.max(0, obj) / 100})` }} />
          </div>
          <span className="dg-obj__pct">{obj <= 0 ? (level.objection.zeroLine || "GONE") : `${Math.round(obj)}%`}</span>
        </div>
      )}
    </>
  );

  const KnuckleHud = () => (
    <div className="dg-knuckle" data-blood={blood} title={`Knuckles: ${BLOOD_NAME[blood]}`}>
      <FistIcon damage={blood} size={28} />
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
        <IconSheet />
        {topBar(null)}
        <div className="dg-brief">
          <p className="dg-eyebrow">{level.tag}</p>
          <h2 className="dg-heading">{level.brief.heading.split("\n").map((l, i) => <React.Fragment key={i}>{l}<br /></React.Fragment>)}</h2>
          <p className="dg-lead">{level.brief.lead}</p>
          <div className="dg-rounds">
            {level.brief.rounds.map((r) => (
              <span key={r.label || r} className="dg-rounds__item">
                {r.icon ? <GameIcon name={r.icon} size={13} /> : null}
                {r.label || r}
              </span>
            ))}
          </div>
          <div className="dg-lesson"><span className="dg-lesson__tag">The lesson</span>{level.lesson}</div>
          {level.brief.disclaimer && <p className="dg-fineprint">{level.brief.disclaimer}</p>}
          <div className="dg-rated">
            <span className="dg-rated__badge">18+</span>
            RAW MODE — Bloody Knuckles, screamed banter, and a finale that ends with {boss.name} on the porch. Sound on.
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
        <IconSheet />
        {topBar(null)}
        <CineCard {...round.cine} onNext={startRoundFromCine} />
      </div>
    );
  }

  /* ── THE WALL ───────────────────────────────────────────────────────────
     The scripted loss, and the hinge the whole level turns on. He said the
     sentence; the sentence is now a bar at the top of the screen; the only way
     forward is to come back after dark and take it apart. */
  if (phase === "wall") {
    const w = level.wall || {};
    return (
      <div className="dg-stage" style={{ "--lvacc": level.accent }}>
        <IconSheet />
        {topBar(null)}
        <div className="dg-wall">
          <p className="dg-eyebrow">{w.eyebrow || "THE DOOR CLOSED"}</p>
          <h2 className="dg-wall__trump">&ldquo;{w.trump ? w.trump.text : "I'm a police officer."}&rdquo;</h2>
          {(w.beats || []).map((l) => (
            <p key={l.id} className="dg-wall__beat">{l.text}</p>
          ))}
          <div className="dg-wall__meter">
            <span className="dg-wall__label">{level.objection ? level.objection.label : "HIS OBJECTION"}</span>
            <div className="dg-wall__track"><i style={{ transform: "scaleX(1)" }} /></div>
            <span className="dg-wall__hint">
              {w.hint || "You can't punch this off. It isn't an argument — it's a claim. So go and make it false."}
            </span>
          </div>
          <button className="dg-primary" onClick={advance}>{w.cta || "Come back at 11:47 →"}</button>
        </div>
      </div>
    );
  }

  /* ── THE WIFE (Level 1) ─────────────────────────────────────────────── */
  if (phase === "wife") {
    const beats = level.finale.wife;
    const done = wifeBeat >= beats.length;
    return (
      <div className="dg-stage" style={{ "--lvacc": level.accent }}>
        <IconSheet />
        {topBar(null)}
        <div className="dg-wife">
          <p className="dg-eyebrow">THE DOOR IS OPEN</p>
          {beats.slice(0, wifeBeat + 1).map((l, i) => (
            <p key={l.id} className={`dg-wife__line ${i === wifeBeat ? "is-live" : ""}`}>&ldquo;{l.text}&rdquo;</p>
          ))}
          {done && (
            <>
              <div className="dg-contract">
                <span className="dg-contract__tag">THE PAPERWORK</span>
                <p className="dg-contract__body">
                  Harold is on the porch. His wife has the pen. Everything you took to get here — every NO, every
                  split knuckle — bought this signature.
                </p>
                <div className="dg-contract__sig" />
              </div>
              <button className="dg-primary" onClick={() => setPhase("seal")}>Take the signature →</button>
            </>
          )}
        </div>
      </div>
    );
  }

  /* ── SEAL ───────────────────────────────────────────────────────────── */
  if (phase === "seal") {
    return (
      <div className="dg-stage" style={{ "--lvacc": level.accent }}>
        <IconSheet />
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

  /* ── THE BOUT ───────────────────────────────────────────────────────── */
  if (isBout) {
    const youOut = b.current.over && pHp <= 0;
    const hurtTier = bHp < 34 ? 2 : bHp < 68 ? 1 : 0;
    return (
      <div className="dg-stage" style={{ "--lvacc": level.accent }}>
        <IconSheet />
        {topBar(<span className="dg-clock">{boss.name}</span>)}
        <div
          className={`dg-scene dg-scene--${round.skin} is-fight ${raging ? "is-rage" : ""}`}
          ref={sceneRef}
          style={{ "--p": 1 }}
        >
          <div className="dg-cam" ref={camRef}>
            <div className="dg-sky">{(round.skin === "night" || round.skin === "eve") && <span className="dg-moon" />}</div>
            <div className="dg-wall" />
            <div className="dg-porchlight" />
            <div className="dg-doorframe-open" aria-hidden />
            <div className={`dg-bout ${raging ? "is-rage" : ""}`} data-hurt={hurtTier}>
              <Crowd flash={hitFlash} />
              <Boxer boss={boss} pose={pose} raging={raging} flash={hitFlash} dur={pose === "strike" || pose === "strikeL" ? 70 : 130} />
              <PlayerSilhouette
                guard={blocking ? "up" : "down"}
                ducking={ducking}
                punching={myPunch}
                hurt={pHp < 40}
              />
            </div>
            <canvas className="dg-fx" ref={canvasRef} />
          </div>

          <div className="dgb-hud">
            <div className="dgb-bar dgb-bar--you">
              <span className="dgb-bar__name">YOU</span>
              <div className="dgb-bar__track"><div className="dgb-bar__fill" style={{ transform: `scaleX(${pHp / 100})` }} /></div>
            </div>
            <div className="dgb-centre">
              <span className="dgb-timer">{String(Math.floor(clock / 60)).padStart(1, "0")}:{String(clock % 60).padStart(2, "0")}</span>
              <div className="dgb-downs">
                {[0, 1, 2].map((i) => <i key={i} className={i < downs ? "is-on" : ""} />)}
              </div>
            </div>
            <div className="dgb-bar dgb-bar--him">
              <span className="dgb-bar__name">{boss.name}</span>
              <div className="dgb-bar__track"><div className="dgb-bar__fill" style={{ transform: `scaleX(${bHp / 100})` }} /></div>
            </div>
          </div>

          <div className="dgb-stars">
            {[0, 1, 2].map((i) => (
              <GameIcon key={i} name="star" size={22} className={`${i < stars ? "is-on" : ""} ${i === newStar ? "is-new" : ""}`} />
            ))}
          </div>

          <div className="dg-bursts" ref={burstsRef} aria-hidden><span /><span /><span /><span /><span /><span /></div>

          {call && <div key={call.k} className={`dgb-call ${call.variant ? `dgb-call--${call.variant}` : ""}`}>{call.text}</div>}
          {coach && !countWho && <div className="dgb-coach">{coach}</div>}

          {countWho && (
            <div className="dgb-count">
              <span key={countN} className="dgb-count__n is-tick">{countN}</span>
              <span className="dgb-count__word">{countLabel(countN)}</span>
              {countWho === "you" && (
                <>
                  <div className="dgb-count__rise"><i style={{ transform: `scaleX(${riseTaps / RULES.RISE_MASHES})` }} /></div>
                  <button className="dgb-count__mash" onPointerDown={mashRise}>GET UP</button>
                </>
              )}
            </div>
          )}

          {youOut && (
            <div className="dg-koveil">
              <p className="dg-koveil__big">FLATTENED.</p>
              <p className="dg-koveil__sub">Dropped on the porch. Champions get up.</p>
              <button className="dg-primary" onClick={() => startBout(boutKind)}>Run the bout back →</button>
            </div>
          )}
        </div>

        <div className="dgb-ctl">
          <button
            className={`dgb-btn ${ducking ? "is-on" : ""}`}
            onPointerDown={duckOn} onPointerUp={duckOff} onPointerLeave={duckOff} onPointerCancel={duckOff}
            disabled={b.current.over}
          >
            <GameIcon name="duck" size={20} />DUCK<small>HOLD</small>
          </button>
          <button className="dgb-btn dgb-btn--punch" onPointerDown={punch} disabled={b.current.over}>
            <GameIcon name="glove" size={20} />PUNCH
          </button>
          <button className="dgb-btn dgb-btn--star" onPointerDown={starPunch} disabled={stars <= 0 || b.current.over}>
            <GameIcon name="star" size={20} />STAR<small>{stars} LEFT</small>
          </button>
        </div>
        {isDrawBoss(boss) ? (
          <RebuttalRack
            hand={hand ? hand.cards : []}
            live={!!hand && !b.current.over}
            msLeft={hand ? Math.max(0, hand.at + hand.dur - performance.now()) : 0}
            tellMs={hand ? hand.dur : 900}
            onPick={playCard}
            disabled={b.current.over}
          />
        ) : (
        <div className="dgb-ctl" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginTop: 8 }}>
          <button className="dgb-btn" onPointerDown={() => dodge("left")} disabled={b.current.over}>
            <GameIcon name="chev" size={20} className="is-flip" />DODGE<small>LEFT</small>
          </button>
          <button
            className={`dgb-btn ${blocking ? "is-on" : ""}`}
            onPointerDown={blockOn} onPointerUp={blockOff} onPointerLeave={blockOff} onPointerCancel={blockOff}
            disabled={b.current.over}
          >
            <GameIcon name="shield" size={20} />BLOCK<small>HOLD</small>
          </button>
          <button className="dgb-btn" onPointerDown={() => dodge("right")} disabled={b.current.over}>
            <GameIcon name="chev" size={20} />DODGE<small>RIGHT</small>
          </button>
        </div>
        )}

        <div className="dg-talk" aria-live="polite">
          {themLine && <div className="dg-bubble dg-bubble--them">&ldquo;{themLine}&rdquo;</div>}
          {youLine && <div className="dg-bubble dg-bubble--you">{youLine}</div>}
          {!themLine && !youLine && (
            <div className="dg-bubble dg-bubble--hint">
              {isDrawBoss(boss)
                ? "He draws fast. Read the objection, play the card — don't guess."
                : "Read the tell. Dodge it. Punish the opening."}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── THE COLD OPEN (slap / kick) ────────────────────────────────────── */
  if (phase === "finale" && (finaleStage === "slap" || finaleStage === "kick")) {
    const isKick = finaleStage === "kick";
    return (
      <div className="dg-stage" style={{ "--lvacc": level.accent }}>
        <IconSheet />
        {topBar(null)}
        <div
          className={`dg-scene dg-scene--${round.skin} is-finale ${bursting ? "is-bursting" : ""}`}
          ref={sceneRef}
          style={{ "--p": 1 }}
        >
          <div className="dg-cam" ref={camRef}>
            <div className="dg-sky">{round.skin === "night" && <span className="dg-moon" />}</div>
            <div className="dg-wall" />
            <div className="dg-porchlight" />
            {isKick ? (
              <div className="dg-doorpos" ref={doorRef}>
                <DoorForSkin skin={round.skin} ref={doorSvgRef} burst={bursting} blood={blood} id={`f${level.id}`} />
              </div>
            ) : (
              <div className="dg-bout">
                <Boxer boss={boss} pose={slapped ? "hurt" : "idle"} dur={slapped ? 90 : 220} />
              </div>
            )}
            <div className="dg-mat"><span>GO AWAY</span></div>
            <canvas className="dg-fx" ref={canvasRef} />
          </div>

          <SlapArm ref={slapRef} kind={isKick ? "kick" : "slap"} />
          <SpeedLines live={speed} />

          <div className="dg-charge">
            <span className="dg-charge__label">{isKick ? "KICK POWER" : "SLAP POWER"}</span>
            <div className="dg-charge__track"><div className="dg-charge__fill" style={{ transform: `scaleX(${charge})` }} /></div>
          </div>
          <div className="dg-bursts" ref={burstsRef} aria-hidden><span /><span /><span /><span /><span /><span /></div>
          {coach && <div className="dgb-coach">{coach}</div>}
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
            <GameIcon name={isKick ? "boot" : "hand"} size={20} />
            {isKick ? " HOLD TO WIND BACK — KICK IT IN" : " HOLD TO WIND BACK — POWER SLAP"}
          </button>
        </div>
        <div className="dg-talk" aria-live="polite">
          <div className="dg-bubble dg-bubble--hint">
            {isKick
              ? "Four visits. Wind all the way back and kick the door OFF its hinges."
              : "Wind it ALL the way back. The arm IS the meter. Release to crack him."}
          </div>
        </div>
      </div>
    );
  }

  /* ── THE ROUND ──────────────────────────────────────────────────────── */
  const isNight = round.skin === "night" || round.skin === "eve";
  const isSaw = round.special === "chainsaw";
  const isRocks = round.special === "rocks";
  const isGate = round.special === "gate";
  const isCam = round.special === "ringcam";
  const isGallery = round.special === "gallery";
  // the camera's own clock — it does not care what time you think it is
  const camStamp = `03:${String(14 + (roundRef.current.taps % 40)).padStart(2, "0")}:${String((roundRef.current.taps * 7) % 60).padStart(2, "0")}`;
  const aimVec = aim ? { dx: aim.ox - aim.x, dy: aim.oy - aim.y } : null;
  const aimPower = aimVec ? Math.min(1, Math.max(0, (Math.hypot(aimVec.dx, aimVec.dy) - 18) / 122)) : 0;

  return (
    <div className="dg-stage" style={{ "--lvacc": level.accent }}>
      <IconSheet />
      {topBar(
        <span className="dg-clock">
          {round.icon ? <GameIcon name={round.icon} size={12} /> : null} {round.label}
        </span>
      )}
      <KnuckleHud />

      <div
        className={`dg-scene dg-scene--${round.skin} ${isNight ? "is-night" : ""} ${bursting ? "is-bursting" : ""} ${sawing ? "is-sawing" : ""} ${isCam ? "is-ringcam" : ""}`}
        ref={sceneRef}
        data-stage={stage}
        style={{ "--p": 0, "--amp": 1 + stage * 0.55 }}
      >
        <div className="dg-cam" ref={camRef}>
          <div className="dg-sky">{isNight && <span className="dg-moon" />}</div>
          <div className="dg-wall" />
          <div className="dg-porchlight" />

          {round.skin === "steel" && <span className="dg-sign dg-sign--nosolicit">SALES REPS<br />FUCK OFF</span>}
          {round.skin === "gate" && <span className="dg-sign dg-sign--gate">NO<br />SOLICITING</span>}

          {isRocks && (
            <div className="dg-windows" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span key={i} className="dg-windows__slot">
                  <WindowPane broken={panes[i]} lit id={`p${i}`} />
                </span>
              ))}
            </div>
          )}

          {isGallery && galleryState && galleryState.mode === "busted" ? (
            /* The chase is a SUB-STATE of this round, never its own phase.
               The FX effect keys on `phase`, so changing phase would destroy
               and rebuild DoorFX — wiping every egg decal off the facade, and
               that splatter is the entire visual payoff of the night. */
            <ChaseScene
              startStars={galleryState.stars}
              spawnX={1200}
              onEnd={({ outcome, fine }) => {
                recordChase({ evaded: outcome === "evaded", fine });
                setGalleryState(null);
                if (!doneRef.current) { doneRef.current = true; finishRound(); }
              }}
            />
          ) : isGallery ? (
            <NightGallery
              fx={fxRef.current}
              fxReady={fxReady}
              config={round.gallery}
              lines={round.them}
              onDamage={(n) => {
                objRef.current = Math.max(0, objRef.current - n);
                setObj(objRef.current);
              }}
              onDestroy={(key, heat) => {
                wreckedRef.current.add(key);
                galleryHeatRef.current += heat;
                // heat is campaign-wide and cloud-synced; breaking his window
                // costs you on a street you haven't walked down yet
                if (heat > 0) recordVandalism("windowBroken");
                else if (heat < 0) coolFromEnabler();
              }}
              onBusted={(info) => {
                // The chase lives INSIDE this round on purpose. Changing `phase`
                // would tear down and rebuild DoorFX, wiping every splat off the
                // facade — and that damage is the whole point of the night.
                const h = addHeat(HEAT_GAIN_SPOTTED, "spotted");
                const tier = heatTier(h.heat).key;
                setGalleryState({
                  mode: "busted",
                  stars: tier === "hunted" ? 2 : 1,
                  ...info,
                });
              }}
              onDone={(reason) => { if (!doneRef.current) { doneRef.current = true; finishRound(); } }}
            />
          ) : isGate ? (
            <GateRound
              fx={fxRef.current}
              lines={round.them}
              onProgress={(mult) => creditRock(mult / 1.4)}
              onBleed={() => {
                knocksRef.current += 3;
                setBlood(bloodFor(knocksRef.current));
              }}
              onDone={() => { if (!doneRef.current) finishRound(); }}
              onGuard={startGuardBout}
            />
          ) : isSaw ? (
            <div
              className="dg-doorpos dg-doorpos--saw"
              ref={doorRef}
              onPointerDown={sawStart}
              onPointerMove={sawMove}
              onPointerUp={sawEnd}
              onPointerLeave={sawEnd}
              onPointerCancel={sawEnd}
            >
              <DoorForSkin skin={round.skin} ref={doorSvgRef} burst={bursting} blood={blood} id={`r${level.id}`} />
            </div>
          ) : (
            <button
              className="dg-hitzone"
              onPointerDown={(e) => tap(e, "knock")}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); tap(null, "knock"); } }}
              aria-label="Knock on the door"
            >
              <span ref={doorRef} className="dg-doorshake">
                <DoorForSkin skin={round.skin} ref={doorSvgRef} burst={bursting} blood={blood} id={`r${level.id}`} />
              </span>
            </button>
          )}

          {/* the kerf the saw carves, drawn over the slab */}
          {isSaw && (
            <svg className="dga-kerf" ref={kerfRef} aria-hidden>
              <path className="dga-kerf__heat" d="" />
              <path d="" />
            </svg>
          )}

          {/* the fist that actually flies at the door */}
          {!isSaw && !isRocks && !isGate && (
            <div className="dga-fistwrap" ref={fistRef} aria-hidden>
              <Fist damage={blood} />
            </div>
          )}

          {!isGate && <div className="dg-mat"><span>GO AWAY</span></div>}
          <canvas className="dg-fx" ref={canvasRef} />

          {/* drag-to-aim trajectory preview */}
          {aim && (
            <svg className="dg-aim" aria-hidden>
              <line x1={aim.ox} y1={aim.oy} x2={aim.x} y2={aim.y} className="dg-aim__pull" />
              {Array.from({ length: 12 }, (_, i) => {
                const t = (i + 1) * 0.08;
                const v = 300 + aimPower * 600;
                const ang = Math.atan2(aimVec.dy, aimVec.dx);
                return (
                  <circle
                    key={i}
                    cx={aim.ox + Math.cos(ang) * v * t}
                    cy={aim.oy + Math.sin(ang) * v * t + 0.5 * 1400 * t * t}
                    r={5 - i * 0.25}
                    className="dg-aim__dot"
                    opacity={0.9 - i * 0.06}
                  />
                );
              })}
            </svg>
          )}
        </div>

        <div className="dg-resolve">
          <span className="dg-resolve__label"><GameIcon name="flame" size={12} /> RESOLVE</span>
          <div className="dg-resolve__track"><div className="dg-resolve__fill" style={{ transform: `scaleX(${heat})` }} /></div>
        </div>

        {round.bell && (
          <button className="dg-bellbtn" onPointerDown={(e) => tap(e, "ring")} aria-label="Ring the doorbell">
            <Doorbell dying={rings > 20} stuck={rings > 30} />
            <small>{rings > 0 ? `×${rings}` : "RING"}</small>
          </button>
        )}

        {isRocks && (
          <div
            className="dg-aimzone"
            onPointerDown={aimStart}
            onPointerMove={aimMove}
            onPointerUp={aimEnd}
            onPointerCancel={aimEnd}
            aria-label="Drag back to aim a rock, release to throw"
            role="button"
            tabIndex={0}
          >
            <span className="dg-aimzone__hint"><GameIcon name="rock" size={22} /> DRAG BACK TO AIM</span>
          </div>
        )}

        {isSaw && (
          <button className="dg-sawbtn" onPointerDown={pullCord} aria-label="Pull the starter cord">
            <Chainsaw running={revRef.current.started} cutting={sawing} />
            <small>{revRef.current.started ? "DRAG TO CUT" : `PULL (${sawPulls}/3)`}</small>
          </button>
        )}

        {/* he won't open, but he'll talk — through the camera */}
        {isCam && <RingCamFrame recording knocks={roundRef.current.taps} stamp={camStamp} />}

        <div className="dg-bursts" ref={burstsRef} aria-hidden><span /><span /><span /><span /><span /><span /></div>
        {coach && <div className="dgb-coach">{coach}</div>}
      </div>

      <div className="dg-talk" aria-live="polite">
        {themLine && <div className="dg-bubble dg-bubble--them" key={`t${nos}`}>&ldquo;{themLine}&rdquo;</div>}
        {youLine && <div className="dg-bubble dg-bubble--you" key={`y${youIdx.current}`}>{youLine}</div>}
        {!themLine && !youLine && (
          <div className="dg-bubble dg-bubble--hint">
            {isSaw ? "Pull the cord three times. Then drag the bar across the steel."
              : isRocks ? "Drag BACK from the flowerbed to aim. Glass is worth triple."
                : "Knock. Ring. Do not stop."}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import MaskEffigy from "./MaskEffigy.jsx";
import { createCrucibleFX } from "./CrucibleFX.js";
import {
  getCrucible, blameLines, innerVoice, momentPlate, gradeGlow, STAGE_META,
  GLOW_START, GLOW_FLOOR, GLOW_CEIL, GLOW_CLEAN, GLOW_BREAK, GLOW_LAND,
  GLOW_WITNESS, GLOW_SWING, GLOW_TRUE, GLOW_DODGE,
  RING_MS, RING_BAND, ASSIST_RING_STEP, ASSIST_BAND_STEP, MAX_ASSIST,
  GAP_MS, WITNESS_MS,
} from "./crucibleData.js";
import {
  sfxWhoosh, sfxZap, sfxForgeStrike, sfxShatter, sfxBossHit, sfxBossDown,
  sfxImpact, sfxThunder, sfxHalo, sfxBlock, sfxPlateClank, sfxScrollUnfurl,
  sfxIgnite, sfxWaxSeal, sfxFireLoop, sfxHeartbeatLoop, sfxHorn,
} from "../../../lib/sfx.js";
import "../../../styles/crucible.css";

// ════════════════════════════════════════════════════════════════════════
// THE CRUCIBLE — the Shadow Alchemist's boss fight.
//
// Sits between "name it" (step 4) and "transmute it" (step 6). You have
// just said "that's my Broke King talking" — so this is the moment you
// actually take it off your face and put it in the fire. Winning is what
// earns the Transmute button; the transmutation itself still belongs to
// the step that follows. Nothing downstream was replaced.
//
// FIVE BEATS. Phase keys match the on-screen labels exactly — the first
// build named these after the alchemical Magnum Opus (NIGREDO / ALBEDO /
// CITRINITAS / RUBEDO) and Jon killed it: "i hate the names they dont make
// any sense." Nothing in here may drift back toward vocabulary that needs
// a footnote, in the UI OR in the identifiers.
//
//  tear    TEAR IT OFF        drag the mask off your own face. The fight
//                             can't start while you're still wearing it.
//  catch   CATCH THE LIE      a ring closes; catch it on the seam and THE
//                             GAP opens — time dilates and the line hangs
//                             in the air where you can read it instead of
//                             be it. Strike the load-bearing word.
//                             (Sekiro's deflect + Bayonetta's Witch Time;
//                             the psychology is Frankl's gap between
//                             stimulus and response — the real skill.)
//  pass    LET IT PASS        the plates are off and the mask starts using
//                             YOUR OWN victim story from step 2. The catch
//                             stops working. The only winning input is no
//                             input. (The "don't shoot" beat: Undertale's
//                             mercy. Players remember the fight they
//                             solved by stopping.)
//  answer  ANSWER IT STRAIGHT it stops attacking and asks the question
//                             underneath. Three answers, two flattering.
//                             Wrong ones aren't damage — they re-rivet a
//                             plate, and you watch it happen.
//  pour    POUR IT OUT        melting point. Drag to tip the crucible.
//
// ONE METER: GLOW. Not his health, not yours — the state of the metal you
// are both made of. Every other fight in this app has two bars; this one
// has a single shared one, and it doubles as the effigy's own colour.
// (Not HEAT — that belongs to The Door's wanted meter, see anger/heat/.)
//
// NO-FAIL LAW (house rule): glow has a floor, misses widen the catch
// window (assist, invisible), a line that has beaten you four times breaks
// on its own, and "Step back" is always available and never punished.
// ════════════════════════════════════════════════════════════════════════

// The hot word is rendered as a padded chip, so any punctuation immediately
// after it has to be absorbed into the chip — otherwise the padding orphans
// it and you get `waiting .`
function splitHot(line, hot) {
  if (!hot) return [{ text: line, hot: false }];
  const i = line.indexOf(hot);
  if (i < 0) return [{ text: line, hot: false }];
  const rest = line.slice(i + hot.length);
  const tail = /^[.,!?;:'’”)]+/.exec(rest);
  const glued = tail ? tail[0] : "";
  return [
    { text: line.slice(0, i), hot: false },
    { text: hot + glued, hot: true },
    { text: rest.slice(glued.length), hot: false },
  ].filter((p) => p.text.length > 0);
}

function shuffled(arr, seed = 1) {
  // deterministic per mount so the true answer isn't always in slot one
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function TheCrucible({
  mask,
  moment = "",
  victim = "",
  afraid = "",
  onWin,
  onExit,
}) {
  const cfg = useMemo(() => getCrucible(mask.id), [mask.id]);
  const rm = useMemo(
    () =>
      typeof window !== "undefined" &&
      Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches),
    []
  );

  // The plates: the mask's three lines, plus the player's own described
  // moment engraved on the fourth — its words and your words, same metal.
  const plateLines = useMemo(() => {
    const mine = momentPlate(moment);
    const base = cfg.plates;
    return mine ? [base[0], base[1], mine, base[3]] : base.slice(0, 4);
  }, [cfg, moment]);

  const blame = useMemo(() => blameLines(mask.id, victim), [mask.id, victim]);
  const inner = useMemo(() => innerVoice(afraid), [afraid]);
  // Reshuffled every time the fight is entered — a fixed seed would put the
  // true answer in the same slot on every run and turn the stage into muscle
  // memory instead of a judgement.
  const answers = useMemo(
    () => shuffled(cfg.question.answers, 1 + Math.floor(Math.random() * 9973)),
    [cfg]
  );

  /* ── state (one update per beat — never per frame) ───────────────────── */
  const [phase, setPhase] = useState("tear");
  const [beat, setBeat] = useState("intro");
  const [glow, setGlow] = useState(GLOW_START);
  const [plates, setPlates] = useState([true, true, true, true]);
  const [idx, setIdx] = useState(0);
  const [sys, setSys] = useState("");
  const [sysCls, setSysCls] = useState("");
  const [stageCard, setStageCard] = useState(null);
  const [pourPct, setPourPct] = useState(0);
  const [wrongIds, setWrongIds] = useState([]);
  const [sting, setSting] = useState("");
  const [seizePct, setSeizePct] = useState(0);
  const [swung, setSwung] = useState(false);
  const [stats, setStats] = useState({ clean: 0, witnessed: 0, dodged: 0 });

  /* ── refs ─────────────────────────────────────────────────────────────── */
  const alive = useRef(false);
  const busy = useRef(false);
  const glowRef = useRef(GLOW_START);
  const idxRef = useRef(0);
  const assist = useRef(0);
  const missRun = useRef(0);
  const platesRef = useRef([true, true, true, true]);
  const statsRef = useRef({ clean: 0, witnessed: 0, dodged: 0 });
  // The pour forces the metal to melting point, so the on-screen 100 says
  // nothing about the run. The grade reads THIS instead: what the glow
  // actually was when you got there.
  const earnedRef = useRef(GLOW_START);

  const canvasRef = useRef(null);
  const fx = useRef(null);
  const wrapRef = useRef(null);
  const ringRef = useRef(null);
  const effigyRef = useRef(null);
  const flashRef = useRef(null);
  const fireLoop = useRef(null);
  const heartLoop = useRef(null);

  const ringRaf = useRef(0);
  const ringStart = useRef(0);
  const ringLive = useRef(false);
  const ringMsRef = useRef(RING_MS);
  const gapTimer = useRef(null);
  const witnessRaf = useRef(0);
  const witnessLive = useRef(false);
  const pourRef = useRef({ active: false, y0: 0, pct: 0 });

  const wait = useCallback((ms) => new Promise((r) => setTimeout(r, rm ? Math.min(ms, 220) : ms)), [rm]);

  const heat = Math.max(0, Math.min(1, (glow - GLOW_FLOOR) / (100 - GLOW_FLOOR)));

  /* ── helpers ──────────────────────────────────────────────────────────── */

  const say = (text, cls = "") => {
    setSys(text);
    setSysCls(cls);
  };

  const bumpGlow = useCallback((delta) => {
    // capped at 99 — reaching 100 is the melting-point event, not a grind
    const next = Math.max(GLOW_FLOOR, Math.min(GLOW_CEIL, glowRef.current + delta));
    glowRef.current = next;
    setGlow(next);
    if (fx.current) fx.current.setHeat((next - GLOW_FLOOR) / (100 - GLOW_FLOOR));
    return next;
  }, []);

  const flash = useCallback((kind) => {
    const f = flashRef.current;
    if (!f) return;
    f.className = "cru-flash";
    void f.offsetWidth;
    f.classList.add(kind);
  }, []);

  const effigyRect = () => {
    const el = effigyRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height * 0.5, r };
  };

  const burst = (n, spd, colorHex) => {
    const c = effigyRect();
    if (!c || !fx.current) return;
    fx.current.sparks(c.x, c.y, colorHex || cfg.molten, n, spd);
  };

  const stopRing = () => {
    ringLive.current = false;
    if (ringRaf.current) cancelAnimationFrame(ringRaf.current);
    ringRaf.current = 0;
  };

  const stopWitness = () => {
    witnessLive.current = false;
    if (witnessRaf.current) cancelAnimationFrame(witnessRaf.current);
    witnessRaf.current = 0;
  };

  /* ══ MOVEMENT 0 · SEIZE ════════════════════════════════════════════════
     You cannot fight a mask you are still wearing. Drag it off. */

  const seizeDrag = useRef({ active: false, y0: 0 });

  const onSeizeDown = (e) => {
    if (phase !== "tear" || beat !== "grab") return;
    seizeDrag.current = { active: true, y0: e.clientY };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* not fatal */ }
  };
  const onSeizeMove = (e) => {
    if (!seizeDrag.current.active) return;
    const dy = Math.max(0, e.clientY - seizeDrag.current.y0);
    const pct = Math.min(100, (dy / 150) * 100);
    setSeizePct(pct);
    if (pct >= 100) {
      seizeDrag.current.active = false;
      completeSeize();
    }
  };
  const onSeizeUp = () => {
    if (!seizeDrag.current.active) return;
    seizeDrag.current.active = false;
    setSeizePct(0);
  };

  async function completeSeize() {
    if (busy.current) return;
    busy.current = true;
    setSeizePct(100);
    setBeat("torn");
    sfxWhoosh();
    sfxPlateClank();
    if (fx.current) {
      fx.current.addTrauma(0.8);
      fx.current.hitStop(140);
      fx.current.setForge(true);
    }
    flash("white");
    await wait(700);
    if (!alive.current) return;
    sfxThunder(3);
    if (fx.current) fx.current.ring(window.innerWidth / 2, window.innerHeight * 0.5, cfg.lead, { r1: 460, ms: 700 });
    setStageCard({ stage: "catch" });
    await wait(rm ? 400 : 2100);
    if (!alive.current) return;
    setStageCard(null);
    setPhase("catch");
    busy.current = false;
    nextLine(0);
  }

  /* ══ MOVEMENT I · CATCH THE LIE ══════════════════════════════════════════════
     A ring closes. Catch it on the seam and THE GAP opens. */

  const ringMs = () => Math.max(520, RING_MS + assist.current * ASSIST_RING_STEP);
  const band = () => RING_BAND + assist.current * ASSIST_BAND_STEP;

  async function nextLine(i) {
    if (!alive.current) return;
    if (i >= plateLines.length) return startPass();
    idxRef.current = i;
    setIdx(i);
    missRun.current = 0;
    await throwLine();
  }

  async function throwLine() {
    if (!alive.current) return;
    busy.current = true;
    setBeat("wind");
    say("");
    sfxWhoosh();
    if (fx.current) fx.current.addTrauma(0.14);
    await wait(520);
    if (!alive.current) return;
    setBeat("incoming");
    busy.current = false;
    startRing();
  }

  function startRing() {
    const ms = ringMs();
    ringMsRef.current = ms;
    ringStart.current = performance.now();
    ringLive.current = true;
    const tolerance = band();
    const step = (now) => {
      if (!ringLive.current || !alive.current) return;
      const k = (now - ringStart.current) / ms;
      const el = ringRef.current;
      if (el) {
        const s = 2.9 - 1.9 * Math.min(1.12, k);
        el.style.transform = `translate(-50%,-50%) scale(${s})`;
        el.style.opacity = String(0.2 + 0.8 * Math.min(1, k));
        el.classList.toggle("cru-ring--hot", Math.abs(now - ringStart.current - ms) <= tolerance);
      }
      if (now - ringStart.current > ms + tolerance) {
        ringLive.current = false;
        onLanded("IT LANDED. YOU WEREN'T THERE YET.");
        return;
      }
      ringRaf.current = requestAnimationFrame(step);
    };
    ringRaf.current = requestAnimationFrame(step);
  }

  function onCatch() {
    if (beat !== "incoming" || !ringLive.current) return;
    const delta = performance.now() - ringStart.current - ringMsRef.current;
    stopRing();
    if (delta < -band()) {
      onLanded("TOO SOON. YOU SWUNG AT THE SHADOW OF IT.");
      return;
    }
    openGap();
  }

  // THE GAP — Frankl's gap, rendered. Time dilates, colour drains, and
  // the line stops being something happening to you and becomes something
  // written down in front of you.
  async function openGap() {
    if (busy.current) return;
    busy.current = true;
    missRun.current = 0;
    sfxZap();
    if (fx.current) {
      fx.current.hitStop(rm ? 0 : 130);
      fx.current.addTrauma(0.55);
      const c = effigyRect();
      if (c) fx.current.ring(c.x, c.y, "#cfefff", { r1: 300, ms: 520, width: 4 });
    }
    flash("cool");
    setBeat("gap");
    busy.current = false;
    gapTimer.current = setTimeout(() => {
      if (alive.current && beatRef.current === "gap") breakPlate(false);
    }, rm ? 900 : GAP_MS);
  }

  // keep a live mirror of `beat` for timers that outlive a render
  const beatRef = useRef("intro");
  useEffect(() => {
    beatRef.current = beat;
  }, [beat]);

  async function breakPlate(clean) {
    if (busy.current) return;
    busy.current = true;
    clearTimeout(gapTimer.current);
    const i = idxRef.current;

    if (clean) {
      statsRef.current.clean += 1;
      setStats({ ...statsRef.current });
      sfxForgeStrike();
      sfxShatter();
      bumpGlow(GLOW_CLEAN);
      say("CLEAN BREAK — YOU HIT THE WORD IT WAS STANDING ON.", "good");
      if (fx.current) {
        fx.current.addTrauma(0.85);
        fx.current.hitStop(rm ? 0 : 110);
      }
    } else {
      sfxBossHit();
      bumpGlow(GLOW_BREAK);
      say("STRUCK. THE PLATE GIVES.", "ok");
      if (fx.current) fx.current.addTrauma(0.45);
    }

    const c = effigyRect();
    if (c && fx.current) {
      fx.current.shatter(c.r.left + c.r.width * 0.2, c.r.top + c.r.height * 0.3, c.r.width * 0.6, c.r.height * 0.4, cfg.lead, clean ? 34 : 20);
      fx.current.sparks(c.x, c.y, cfg.molten, clean ? 52 : 28, clean ? 7 : 5);
    }

    const nextPlates = [...platesRef.current];
    nextPlates[i] = false;
    platesRef.current = nextPlates;
    setPlates(nextPlates);
    setBeat("broke");
    flash("white");

    await wait(1150);
    if (!alive.current) return;
    busy.current = false;
    nextLine(i + 1);
  }

  async function onLanded(msg) {
    if (busy.current) return;
    busy.current = true;
    stopRing();
    missRun.current += 1;
    assist.current = Math.min(MAX_ASSIST, assist.current + 1);
    sfxImpact(2);
    bumpGlow(GLOW_LAND);
    if (fx.current) fx.current.addTrauma(0.7);
    flash("red");
    setBeat("landed");
    say(msg, "err");
    await wait(1250);
    if (!alive.current) return;

    // A line that has beaten you four times gives up on its own. Nobody
    // is allowed to get stuck in front of their own mask.
    if (missRun.current >= 4) {
      say("IT WEARS ITSELF OUT SAYING IT.", "ok");
      await wait(700);
      if (!alive.current) return;
      busy.current = false;
      return breakPlate(false);
    }

    say(missRun.current >= 2 ? "IT SAYS IT AGAIN — SLOWER. CATCH IT ON THE SEAM." : "IT SAYS IT AGAIN.", "");
    busy.current = false;
    throwLine();
  }

  /* ══ MOVEMENT II · LET IT PASS ══════════════════════════════════════════════
     The plates are off. Now it only has your handwriting. */

  async function startPass() {
    busy.current = true;
    stopRing();
    sfxBossDown();
    if (fx.current) {
      fx.current.addTrauma(1);
      const c = effigyRect();
      if (c) fx.current.ring(c.x, c.y, "#e8eefc", { r1: 520, ms: 800, width: 6 });
    }
    flash("white");
    setPhase("pass");
    setBeat("turn");
    await wait(rm ? 300 : 1500);
    if (!alive.current) return;
    setStageCard({ stage: "pass" });
    await wait(rm ? 400 : 2400);
    if (!alive.current) return;
    setStageCard(null);
    idxRef.current = 0;
    setIdx(0);
    setSwung(false);
    busy.current = false;
    witnessLine(0);
  }

  async function witnessLine(i) {
    if (!alive.current) return;
    if (i >= blame.length) return startAnswer();
    idxRef.current = i;
    setIdx(i);
    setBeat("witness");
    say("");
    sfxWhoosh();
    startWitness();
  }

  function startWitness() {
    const ms = rm ? 1400 : WITNESS_MS;
    const t0 = performance.now();
    witnessLive.current = true;
    const step = (now) => {
      if (!witnessLive.current || !alive.current) return;
      const k = Math.min(1, (now - t0) / ms);
      const el = ringRef.current;
      if (el) {
        el.style.setProperty("--k", String(k));
        el.style.transform = `translate(-50%,-50%) scale(${1 + (1 - k) * 1.6})`;
        el.style.opacity = String(0.15 + 0.55 * k);
      }
      if (k >= 1) {
        witnessLive.current = false;
        passedThrough();
        return;
      }
      witnessRaf.current = requestAnimationFrame(step);
    };
    witnessRaf.current = requestAnimationFrame(step);
  }

  async function passedThrough() {
    if (busy.current) return;
    busy.current = true;
    stopWitness();
    statsRef.current.witnessed += 1;
    setStats({ ...statsRef.current });
    sfxHalo();
    bumpGlow(GLOW_WITNESS);
    setBeat("passed");
    say("IT PASSED THROUGH. YOU DIDN'T HAVE TO DO ANYTHING WITH IT.", "good");
    if (fx.current) {
      const c = effigyRect();
      if (c) fx.current.sparks(c.x, c.y, "#dfe6f2", 26, 3, { up: 0.9 });
    }
    await wait(1500);
    if (!alive.current) return;
    busy.current = false;
    witnessLine(idxRef.current + 1);
  }

  // The bait. Swinging at your own words is the mistake this stage exists
  // to let you make — cheaply, once.
  async function onSwing() {
    if (beat !== "witness" || busy.current) return;
    busy.current = true;
    setSwung(true);
    statsRef.current.dodged += 1;
    sfxBlock();
    bumpGlow(GLOW_SWING);
    if (fx.current) fx.current.addTrauma(0.5);
    flash("red");
    say("YOU CAN'T CUT YOUR OWN WORDS. IT ONLY GOT LOUDER.", "err");
    await wait(900);
    if (!alive.current) return;
    busy.current = false;
    say("LET IT FINISH. DO NOTHING.", "");
  }

  /* ══ MOVEMENT III · ANSWER IT STRAIGHT ═════════════════════════════════════════
     It stops attacking and asks what it actually came to ask. */

  async function startAnswer() {
    busy.current = true;
    stopWitness();
    setPhase("answer");
    setBeat("open");
    say(""); // the LET IT PASS verdict must not bleed under the question panel
    sfxScrollUnfurl();
    if (fx.current) {
      fx.current.setHeat(0.6);
      const c = effigyRect();
      if (c) fx.current.sparks(c.x, c.y, cfg.molten, 40, 4, { up: 1.1 });
    }
    await wait(rm ? 300 : 1400);
    if (!alive.current) return;
    setStageCard({ stage: "answer" });
    await wait(rm ? 400 : 2400);
    if (!alive.current) return;
    setStageCard(null);
    setBeat("ask");
    setWrongIds([]);
    setSting("");
    busy.current = false;
  }

  async function onAnswer(a, i) {
    if (busy.current || beat !== "ask") return;
    busy.current = true;
    if (!a.truth) {
      sfxPlateClank();
      bumpGlow(GLOW_DODGE);
      setWrongIds((w) => [...w, i]);
      setSting(a.sting || "That one is the mask's handwriting.");
      // a plate rivets itself back on — the consequence you can watch
      const back = [...platesRef.current];
      const slot = back.findIndex((p) => p === false);
      if (slot >= 0) {
        back[slot] = true;
        platesRef.current = back;
        setPlates(back);
      }
      if (fx.current) fx.current.addTrauma(0.4);
      flash("red");
      await wait(600);
      if (!alive.current) return;
      busy.current = false;
      return;
    }

    // the true one
    setSting("");
    sfxIgnite();
    sfxHorn(1);
    bumpGlow(GLOW_TRUE);
    setBeat("answered");
    // every plate falls at once
    platesRef.current = [false, false, false, false];
    setPlates([false, false, false, false]);
    if (fx.current) {
      fx.current.addTrauma(1);
      fx.current.hitStop(rm ? 0 : 150);
      const c = effigyRect();
      if (c) {
        fx.current.shatter(c.r.left, c.r.top + c.r.height * 0.2, c.r.width, c.r.height * 0.6, cfg.lead, 44);
        fx.current.ring(c.x, c.y, cfg.molten, { r1: 620, ms: 900, width: 7 });
        fx.current.sparks(c.x, c.y, cfg.molten, 70, 8);
      }
    }
    flash("gold");
    await wait(rm ? 500 : 2200);
    if (!alive.current) return;
    startPour();
  }

  /* ══ MOVEMENT IV · POUR IT OUT ══════════════════════════════════════════════
     Melting point. Tip it and pour. */

  async function startPour() {
    busy.current = true;
    setPhase("pour");
    setBeat("melt");
    // whatever the run cost, the metal reaches melting point — the grade
    // records how cleanly you got here, it never blocks the pour
    earnedRef.current = glowRef.current;
    glowRef.current = 100;
    setGlow(100);
    if (fx.current) fx.current.setHeat(1);
    if (fireLoop.current) fireLoop.current.setLevel(0.5);
    setStageCard({ stage: "pour" });
    await wait(rm ? 400 : 2400);
    if (!alive.current) return;
    setStageCard(null);
    setBeat("pour-ready");
    busy.current = false;
  }

  const onPourDown = (e) => {
    if (beat !== "pour-ready" && beat !== "pouring") return;
    pourRef.current = { active: true, y0: e.clientY, pct: pourRef.current.pct };
    setBeat("pouring");
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* not fatal */ }
  };
  const onPourMove = (e) => {
    if (!pourRef.current.active) return;
    const dy = Math.max(0, e.clientY - pourRef.current.y0);
    const pct = Math.min(100, pourRef.current.pct + (dy / 220) * 100);
    setPourPct(pct);
    if (fx.current && pct > 4) {
      const c = effigyRect();
      if (c) fx.current.pour(c.x, c.r.top + c.r.height * 0.72, 26 + pct * 0.22, cfg.molten);
      if (fireLoop.current) fireLoop.current.setLevel(0.5 + (pct / 100) * 0.5);
    }
    if (pct >= 100) {
      pourRef.current.active = false;
      completePour();
    }
  };
  const onPourUp = (e) => {
    if (!pourRef.current.active) return;
    const dy = Math.max(0, e.clientY - pourRef.current.y0);
    pourRef.current = { active: false, y0: 0, pct: Math.min(100, pourRef.current.pct + (dy / 220) * 100) };
  };

  async function completePour() {
    if (busy.current) return;
    busy.current = true;
    setPourPct(100);
    setBeat("poured");
    sfxForgeStrike();
    if (fx.current) {
      fx.current.addTrauma(0.9);
      fx.current.hitStop(rm ? 0 : 120);
    }
    flash("gold");
    await wait(rm ? 500 : 1800);
    if (!alive.current) return;
    if (fx.current) fx.current.pour(null);
    if (fireLoop.current) fireLoop.current.setLevel(0.12);
    if (heartLoop.current) heartLoop.current.stop();
    sfxWaxSeal();
    setPhase("forged");
    setBeat("ingot");
    busy.current = false;
  }

  /* ── mount / unmount ──────────────────────────────────────────────────── */

  useEffect(() => {
    alive.current = true;
    fx.current = createCrucibleFX(canvasRef.current, { reducedMotion: rm });
    fx.current.setHeat((GLOW_START - GLOW_FLOOR) / (100 - GLOW_FLOOR));
    if (!rm) {
      fireLoop.current = sfxFireLoop();
      fireLoop.current.setLevel(0.14);
      heartLoop.current = sfxHeartbeatLoop();
      heartLoop.current.setLevel(0.05);
    }

    (async () => {
      await wait(rm ? 200 : 1200);
      if (!alive.current) return;
      setBeat("grab");
    })();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      alive.current = false;
      stopRing();
      stopWitness();
      clearTimeout(gapTimer.current);
      if (fx.current) fx.current.destroy();
      if (fireLoop.current) fireLoop.current.stop();
      if (heartLoop.current) heartLoop.current.stop();
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escape steps back — always free, never punished
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onExit?.();
      if (e.key === " " || e.key === "Enter") {
        if (beat === "incoming") {
          e.preventDefault();
          onCatch();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beat]);

  const grade = gradeGlow(earnedRef.current);
  // Same law as the effigy: identity owns the cold state, the furnace owns
  // the hot one. Without this the warrior's and genius's cool palettes make
  // the crucible mouth and the GLOW bar go blue at melting point.
  const fireTint = heat > 0.5 ? "#ffc247" : heat > 0.28 ? cfg.molten : cfg.lead;
  const line = phase === "catch" ? plateLines[Math.min(idx, plateLines.length - 1)] : null;
  const chunks = line ? splitHot(line.line, line.hot) : [];
  const dilated = beat === "gap";

  const overlay = (
    <div
      className={`cru${rm ? " cru--still" : ""}${dilated ? " cru--dilated" : ""}`}
      style={{
        "--cru-accent": cfg.lead,
        "--cru-molten": fireTint,
        "--cru-arena": cfg.crucible,
        "--cru-heat": heat,
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`The Crucible — facing the ${mask.name}`}
    >
      <div className="cru-bg" aria-hidden="true" />
      <div className="cru-mouth" aria-hidden="true" />

      <div ref={wrapRef} className="cru-shake">
        {/* ── top chrome ─────────────────────────────────────────────── */}
        <header className="cru-top">
          <button type="button" className="cru-exit" onClick={() => onExit?.()}>
            ← Step back
          </button>
          <div className="cru-stagelabel">
            <span className="cru-stagelabel__n">
              {phase === "tear" ? "TEAR IT OFF" : STAGE_META[phase]?.name || "POUR IT OUT"}
            </span>
            <span className="cru-stagelabel__e">
              {phase === "tear" ? "it's on your face" : STAGE_META[phase]?.en || "melting point"}
            </span>
          </div>
        </header>

        {/* ── GLOW — the one meter ─────────────────────────────────── */}
        <div className="cru-glow" role="meter" aria-valuenow={Math.round(glow)} aria-valuemin={0} aria-valuemax={100} aria-label="Glow of the metal">
          <div className="cru-glow__head">
            <span>GLOW</span>
            <span className="cru-glow__v">{Math.round(glow)}</span>
          </div>
          <div className="cru-glow__bar">
            <div className="cru-glow__fill" style={{ width: `${glow}%` }} />
            {[25, 50, 75].map((t) => (
              <span key={t} className={`cru-glow__tick${glow >= t ? " on" : ""}`} style={{ left: `${t}%` }} />
            ))}
          </div>
          <div className="cru-glow__note">not his health · not yours · the metal</div>
        </div>

        {/* ── the effigy ─────────────────────────────────────────────── */}
        <div className={`cru-stage cru-stage--${phase} cru-beat--${beat}`}>
          <div ref={effigyRef} className="cru-effigy-wrap">
            <MaskEffigy
              kind={cfg.effigy}
              heat={heat}
              plates={plates}
              accent={cfg.lead}
              molten={cfg.molten}
              reducedMotion={rm}
              state={
                phase === "pour" || phase === "forged"
                  ? "molten"
                  : phase === "answer"
                    ? "open"
                    : beat === "wind"
                      ? "wind"
                      : beat === "broke" || beat === "landed"
                        ? "hit"
                        : "idle"
              }
            />
          </div>

          {/* the closing catch ring / the witness ring */}
          {(beat === "incoming" || beat === "witness") && (
            <>
              <div className={`cru-seam${beat === "witness" ? " cru-seam--soft" : ""}`} aria-hidden="true" />
              <div ref={ringRef} className={`cru-ring${beat === "witness" ? " cru-ring--witness" : ""}`} aria-hidden="true" />
            </>
          )}
        </div>

        {/* ── the line in the air ────────────────────────────────────── */}
        {phase === "catch" && (beat === "incoming" || beat === "landed" || beat === "wind") && line ? (
          <div className={`cru-line cru-line--${beat}${line.mine ? " cru-line--mine" : ""}`} aria-live="polite">
            {line.mine ? <span className="cru-line__tag">IN YOUR OWN WORDS</span> : null}
            <p>{line.line}</p>
          </div>
        ) : null}

        {/* ── THE GAP — the dilated window ─────────────────────────── */}
        {dilated && line ? (
          <div className="cru-gap">
            <div className="cru-gap__label">THE GAP</div>
            <div className="cru-gap__sub">
              It stopped being something happening to you. Now read it.
              <br />
              <b>Strike the word it's standing on.</b>
            </div>
            <p className="cru-gap__line">
              {chunks.map((c, i) =>
                c.hot ? (
                  <button
                    key={i}
                    type="button"
                    className="cru-hot"
                    onClick={(e) => {
                      e.stopPropagation();
                      breakPlate(true);
                    }}
                  >
                    {c.text}
                  </button>
                ) : (
                  <button key={i} type="button" className="cru-cold" onClick={() => breakPlate(false)}>
                    {c.text}
                  </button>
                )
              )}
            </p>
            <div className="cru-gap__timer" style={{ animationDuration: `${rm ? 900 : GAP_MS}ms` }} />
          </div>
        ) : null}

        {/* ── LET IT PASS: your own words, drifting ───────────────────────── */}
        {phase === "pass" && (beat === "witness" || beat === "passed") ? (
          <div className={`cru-mine cru-mine--${beat}`} aria-live="polite">
            <span className="cru-mine__tag">YOUR WORDS · STEP TWO</span>
            <p>{blame[Math.min(idx, blame.length - 1)]}</p>
          </div>
        ) : null}

        {/* ── ANSWER IT STRAIGHT: the question ───────────────────────────────── */}
        {phase === "answer" && (beat === "ask" || beat === "answered") ? (
          <div className="cru-ask">
            <p className="cru-ask__inner">&ldquo;{inner}&rdquo;</p>
            <p className="cru-ask__q">{cfg.question.ask}</p>
            {beat === "ask" ? (
              <>
                <div className="cru-answers">
                  {answers.map((a, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`cru-answer${wrongIds.includes(i) ? " is-wrong" : ""}`}
                      disabled={wrongIds.includes(i)}
                      onClick={() => onAnswer(a, i)}
                    >
                      {a.text}
                    </button>
                  ))}
                </div>
                {sting ? <p className="cru-sting">{sting}</p> : null}
                <p className="cru-ask__hint">Two of these are its handwriting. One is yours.</p>
              </>
            ) : (
              <p className="cru-ask__done">Every plate came off at once.</p>
            )}
          </div>
        ) : null}

        {/* ── POUR IT OUT: the pour ───────────────────────────────────────── */}
        {phase === "pour" && (beat === "pour-ready" || beat === "pouring" || beat === "poured") ? (
          <div className="cru-pour">
            <p className="cru-pour__t">{cfg.pourLine}</p>
            <div
              className={`cru-pour__handle${beat === "pouring" ? " is-live" : ""}`}
              onPointerDown={onPourDown}
              onPointerMove={onPourMove}
              onPointerUp={onPourUp}
              onPointerCancel={onPourUp}
              role="slider"
              tabIndex={0}
              aria-label="Tip the crucible and pour"
              aria-valuenow={Math.round(pourPct)}
              aria-valuemin={0}
              aria-valuemax={100}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  const next = Math.min(100, pourPct + 25);
                  setPourPct(next);
                  pourRef.current.pct = next;
                  if (next >= 100) completePour();
                }
              }}
            >
              <div className="cru-pour__fill" style={{ height: `${pourPct}%` }} />
              <span className="cru-pour__label">
                {beat === "poured" ? "POURED" : pourPct > 4 ? "KEEP TIPPING" : "DRAG DOWN TO POUR"}
              </span>
              <span className="cru-pour__arrow" aria-hidden="true">▼</span>
            </div>
          </div>
        ) : null}

        {/* ── the ingot — the payoff, deliberately unshaped ──────────── */}
        {phase === "forged" ? (
          <div className="cru-forged">
            <div className="cru-ingot" aria-hidden="true">
              <div className="cru-ingot__body" />
              <div className="cru-ingot__shine" />
            </div>
            <h2 className="cru-forged__t">The lead is gone.</h2>
            <p className="cru-forged__s">
              You didn&rsquo;t destroy the {mask.name} — you melted it down. What&rsquo;s in the mould has no
              shape yet, and that part isn&rsquo;t the fight&rsquo;s to decide.
            </p>
            <div className="cru-grade">
              <span className="cru-grade__rank">{grade.rank}</span>
              <span className="cru-grade__note">{grade.note}</span>
              <span className="cru-grade__stats">
                {statsRef.current.clean} clean {statsRef.current.clean === 1 ? "break" : "breaks"} ·{" "}
                {statsRef.current.witnessed}/{blame.length} let through · glow{" "}
                {Math.round(earnedRef.current)} at melting point
              </span>
            </div>
            <button
              type="button"
              className="cru-forged__go"
              onClick={() =>
                onWin?.({
                  glow: Math.round(earnedRef.current),
                  grade: grade.rank,
                  clean: statsRef.current.clean,
                  witnessed: statsRef.current.witnessed,
                })
              }
            >
              Now transmute it ✦
            </button>
          </div>
        ) : null}

        {/* ── the response dock ────────────────────────────────────────
            ANSWER IT STRAIGHT onward owns the bottom of the screen outright, so the
            dock is removed rather than hidden — otherwise its status line
            prints straight through the question and the pour handle. */}
        <div className={`cru-dock${phase === "answer" || phase === "pour" || phase === "forged" ? " cru-dock--gone" : ""}`}>
          <div className={`cru-sys ${sysCls}`} aria-live="polite">{sys}</div>

          {phase === "tear" && beat === "grab" ? (
            <div className="cru-seize">
              <p className="cru-seize__t">It is still on your face.</p>
              <p className="cru-seize__s">{cfg.seize}</p>
              <div
                className="cru-seize__grip"
                onPointerDown={onSeizeDown}
                onPointerMove={onSeizeMove}
                onPointerUp={onSeizeUp}
                onPointerCancel={onSeizeUp}
                role="slider"
                tabIndex={0}
                aria-label="Drag down to tear the mask off"
                aria-valuenow={Math.round(seizePct)}
                aria-valuemin={0}
                aria-valuemax={100}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    const n = Math.min(100, seizePct + 34);
                    setSeizePct(n);
                    if (n >= 100) completeSeize();
                  }
                }}
              >
                <div className="cru-seize__fill" style={{ height: `${seizePct}%` }} />
                <span className="cru-seize__label">TEAR IT OFF</span>
                <span className="cru-seize__arrow" aria-hidden="true">▼</span>
              </div>
            </div>
          ) : null}

          {phase === "catch" && beat === "incoming" ? (
            <button type="button" className="cru-catch" onClick={onCatch}>
              Catch it
              <small>on the seam</small>
            </button>
          ) : null}

          {phase === "pass" && beat === "witness" ? (
            <div className="cru-witness">
              <button type="button" className={`cru-swing${swung ? " is-warned" : ""}`} onClick={onSwing}>
                {swung ? "Swing again?" : "Strike it"}
                <small>{swung ? "it didn't work the first time" : "it worked before"}</small>
              </button>
              <p className="cru-witness__hint">
                {swung ? "Do nothing. Let it finish." : "…or don't."}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── stage cards ──────────────────────────────────────────────── */}
      {stageCard ? (
        <div className="cru-stagecard" aria-hidden="true">
          <div className="cru-stagecard__n">{STAGE_META[stageCard.stage].name}</div>
          <div className="cru-stagecard__e">{STAGE_META[stageCard.stage].en}</div>
          <div className="cru-stagecard__note">{STAGE_META[stageCard.stage].note}</div>
        </div>
      ) : null}

      <canvas ref={canvasRef} className="cru-fx" aria-hidden="true" />
      <div ref={flashRef} className="cru-flash" aria-hidden="true" />
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(overlay, document.body);
}

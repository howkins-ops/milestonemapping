import React, { useEffect, useMemo, useRef, useState } from "react";
import PlayerSprite from "../world/PlayerSprite.jsx";
import MaskSprite from "./MaskSprite.jsx";
import WispSprite from "./WispSprite.jsx";
import { createMaskFX } from "./MaskFX.js";
import { getBoss, XP_PER_BOSS, XP_PER_WILD } from "./maskBosses.js";
import { getCritic } from "./wildCritics.js";
import { ESSENCES, getEssence } from "./essences.js";
import {
  sfxMaskAmbush,
  sfxNamingStrike,
  sfxCritStrike,
  sfxBossKneel,
  sfxBreathTone,
  sfxEvolveSweep,
  sfxEvolveReveal,
  sfxShatter,
  sfxImpact,
  sfxBlock,
  sfxThunder,
} from "../../../lib/sfx.js";
import "../../../styles/maskCourt.css";

// ════════════════════════════════════════════════════════════════════════
// MASK ENCOUNTERS — the arena
// Full-screen battle overlay: boss stages (3 rounds → surge → essence →
// proof → kneel → EVOLUTION), wild micro-fights (<60s) and relapse
// refreshers. Ported 1:1 from name-the-critic-2.html — same timings,
// shake tiers, beam math and copy — re-skinned to Sora/Manrope.
// Laws: no-fail (Survival Mode, never GAME OVER), Walk Away always free,
// reduced motion clamps every wait to ≤220ms and strobes become a single
// slow crossfade. The street's walk engine is paused while this is up.
//
// encounter: { type: "boss"|"wild"|"relapse", id, zoneAccent? }
// allies:    [{ bossId, essenceColor }] — evolved masks behind the player
// onComplete(payload) — win resolved + card confirmed:
//   boss:    { type:"boss", id, fears, essenceId, proof }
//   wild:    { type:"wild", id, fear }
//   relapse: { type:"relapse", id, fear }
// onWalkAway() — free exit, no penalty
// ════════════════════════════════════════════════════════════════════════

const STRIKE_COLOR = "#6fd2ff";

export default function MaskBattle({
  encounter,
  reducedMotion = false,
  allies = [],
  onComplete,
  onWalkAway,
  onMakeMission = null, // (proofText) → also plant the proof in today's Top Five
}) {
  const mode = encounter.type; // "boss" | "wild" | "relapse"
  const boss = mode === "wild" ? null : getBoss(encounter.id);
  const critic = mode === "wild" ? getCritic(encounter.id) : null;
  const rm = reducedMotion;

  const glowColor = boss ? boss.color : critic ? critic.color : "#ff5a2d";
  const arenaColor = boss ? boss.arena : "#241030";
  const zoneAccent = encounter.zoneAccent || glowColor;

  // ── React state (per-action, never per-frame) ───────────────────────────
  const [panel, setPanel] = useState(null); // respond|name|breath|surge|essence|proof|surv
  const [banner, setBanner] = useState(null); // { name, tag, evolvedName? }
  const [attack, setAttack] = useState({ text: "", on: false });
  const [sys, setSysState] = useState({ text: "", cls: "" });
  const [comp, setCompState] = useState(100);
  const [compUp, setCompUp] = useState(false);
  const [hudUp, setHudUp] = useState(false);
  const [hbUp, setHbUp] = useState(false);
  const [segs, setSegs] = useState(() =>
    (boss ? boss.attacks : []).map((a) => ({ attack: a, state: "live", fear: null }))
  );
  const [round, setRound] = useState(0);
  const [grow, setGrow] = useState(1);
  const [rigVisible, setRigVisible] = useState(false);
  const [breath, setBreath] = useState({ phase: "in", mantra: "" });
  const [nameChips, setNameChips] = useState([]);
  const [fearInput, setFearInput] = useState("");
  const [proofInput, setProofInput] = useState("");
  const [epMsg, setEpMsg] = useState("");
  const [settled, setSettled] = useState(false);
  const [dimmed, setDimmed] = useState(false);
  const [card, setCard] = useState(null); // { kind, ... }
  const [toast, setToast] = useState(null);
  const [evolving, setEvolving] = useState(false); // "IS EVOLVING…" caption
  const [morph, setMorph] = useState("dark"); // dark|swap|fade-swap
  const [rigFx, setRigFx] = useState(""); // extra rig classes: white/rise/revealed
  const [brandOn, setBrandOn] = useState(false);
  const [wispShatter, setWispShatter] = useState(false);
  const [essence, setEssence] = useState(null);
  const [skipVisible, setSkipVisible] = useState(false);
  const [phaseOver, setPhaseOver] = useState(null); // evolution resets the slump

  // ── Refs (choreography touches DOM directly, like the concept) ─────────
  const wrapRef = useRef(null);
  const flashRef = useRef(null);
  const stageRef = useRef(null);
  const rigRef = useRef(null);
  const playerRef = useRef(null);
  const beamRef = useRef(null);
  const canvasRef = useRef(null);
  const hbRef = useRef(null);
  const overlayRef = useRef(null);
  const surgeBarRef = useRef(null);
  const fearInputRef = useRef(null);

  const fx = useRef(null);
  const alive = useRef(false);
  const busy = useRef(false);
  const compRef = useRef(100);
  const roundRef = useRef(0);
  const fearsRef = useRef([]);
  const nextCrit = useRef(false);
  const grownOnce = useRef(false);
  const surgeFired = useRef(false);
  const surgeTimer = useRef(null);
  const skipRef = useRef(false);
  const essenceRef = useRef(null);
  const proofRef = useRef("");
  const inSurvival = useRef(false);

  const wait = (ms) => new Promise((r) => setTimeout(r, rm ? Math.min(ms, 220) : ms));

  /* ── FX helpers ────────────────────────────────────────────────────────── */

  const flash = (red = false) => {
    const f = flashRef.current;
    if (!f) return;
    f.classList.toggle("red", red);
    f.classList.remove("hit");
    void f.offsetWidth;
    f.classList.add("hit");
  };

  const shakeFx = (kind = "shake") => {
    if (rm) return;
    const w = wrapRef.current;
    if (!w) return;
    w.classList.remove("shake", "rumble", "quake");
    void w.offsetWidth;
    w.classList.add(kind);
  };

  const anim = (el, cls) => {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
  };

  const setSys = (text, cls = "") => setSysState({ text, cls });

  const setComp = (v) => {
    const next = Math.max(0, Math.min(100, v));
    compRef.current = next;
    setCompState(next);
    if (next <= 0) {
      survivalMode();
      return false;
    }
    return true;
  };

  const stageRect = () => (stageRef.current ? stageRef.current.getBoundingClientRect() : null);

  const burstAtStage = (colorHex, n, spd, yFrac = 0.55) => {
    const r = stageRect();
    if (!r || !fx.current) return;
    fx.current.spawnBurst(r.left + r.width / 2, r.top + r.height * yFrac, colorHex, n, spd);
  };

  function fireBeam(color, power = 1) {
    return new Promise((resolve) => {
      (async () => {
        if (overlayRef.current) overlayRef.current.style.setProperty("--beamcol", color);
        const pr = playerRef.current ? playerRef.current.getBoundingClientRect() : null;
        const br = stageRect();
        const beam = beamRef.current;
        if (pr && br && beam) {
          const x1 = pr.left + pr.width * 0.7;
          const y1 = pr.top + pr.height * 0.25;
          const x2 = br.left + br.width / 2;
          const y2 = br.top + br.height * 0.5;
          const dx = x2 - x1;
          const dy = y2 - y1;
          const len = Math.hypot(dx, dy);
          const ang = Math.atan2(dy, dx);
          beam.style.left = `${x1}px`;
          beam.style.top = `${y1}px`;
          beam.style.width = `${len}px`;
          beam.style.height = `${8 * power}px`;
          beam.style.transform = `rotate(${ang}rad)`;
          anim(playerRef.current, "swing");
          if (!rm) {
            beam.classList.remove("fire");
            void beam.offsetWidth;
            beam.classList.add("fire");
          }
        }
        if (power >= 1.5) sfxCritStrike();
        else sfxNamingStrike();
        await wait(320);
        flash(false);
        shakeFx("shake");
        anim(rigRef.current, "hit");
        if (br && fx.current) {
          fx.current.spawnBurst(
            br.left + br.width / 2,
            br.top + br.height * 0.5,
            color,
            Math.round(34 * power),
            6 * power
          );
        }
        resolve();
      })();
    });
  }

  function breathCycle(mantra) {
    return new Promise((resolve) => {
      (async () => {
        setBreath({ phase: "in", mantra });
        setPanel("breath");
        if (!rm) sfxBreathTone(true);
        await wait(rm ? 300 : 4000);
        if (!alive.current) return;
        setBreath({ phase: "out", mantra });
        if (!rm) sfxBreathTone(false);
        await wait(rm ? 300 : 5000);
        if (!alive.current) return;
        setPanel(null);
        resolve();
      })();
    });
  }

  /* ── The fight loop (boss) ─────────────────────────────────────────────── */

  async function bossAttack() {
    if (busy.current || !alive.current) return;
    busy.current = true;
    setPanel(null);
    await wait(600);
    if (!alive.current) return;
    anim(rigRef.current, "lunge");
    await wait(280);
    if (!alive.current) return;
    flash(true);
    shakeFx("shake");
    sfxImpact(2);
    const attacks = boss.attacks;
    setAttack({ text: attacks[roundRef.current], on: true });
    anim(playerRef.current, "stagger");
    if (!setComp(compRef.current - 14)) return; // survival mode took over
    await wait(1600);
    if (!alive.current) return;
    setSys("");
    setPanel("respond");
    busy.current = false;
  }

  async function onFightBack() {
    if (busy.current) return;
    busy.current = true;
    anim(playerRef.current, "swing");
    await wait(220);
    burstAtStage(glowColor, 18, 4);
    shakeFx("shake");
    await wait(420);
    if (!alive.current) return;
    if (!setComp(compRef.current - 12)) return;
    if (!grownOnce.current) {
      grownOnce.current = true;
      setSys("NO EFFECT. RAGE FEEDS IT.", "err");
      await wait(650);
      if (!alive.current) return;
      setGrow(1.05);
      anim(rigRef.current, "lunge");
      shakeFx("rumble");
      setSys("NO EFFECT. RAGE FEEDS IT. — IT GREW.", "err");
    } else {
      setSys("NO EFFECT. RAGE FEEDS IT. −12 COMPOSURE.", "err");
    }
    busy.current = false;
  }

  async function onBreathe() {
    if (busy.current) return;
    busy.current = true;
    setAttack((a) => ({ ...a, on: false }));
    await breathCycle("I THANK IT FOR PROTECTING ME.");
    if (!alive.current) return;
    setComp(compRef.current + 28);
    nextCrit.current = true;
    setAttack((a) => ({ ...a, on: true }));
    setPanel("respond");
    setSys("BODY RECLAIMED. +28 COMPOSURE — NEXT NAMING STRIKE IS CRITICAL.", "good");
    busy.current = false;
  }

  function openNamePanel() {
    if (busy.current) return;
    const chips =
      mode === "wild" ? critic.chips : boss.chips[Math.min(roundRef.current, boss.chips.length - 1)];
    setNameChips(chips);
    setFearInput("");
    setAttack((a) => ({ ...a, on: false }));
    setPanel("name");
  }

  useEffect(() => {
    if (panel === "name" && fearInputRef.current) fearInputRef.current.focus();
  }, [panel]);

  // Escape = Walk Away (only from the open dock — the surge is breathe-only)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (panel === "respond" || panel === "name") walkAway();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel, card]);

  async function namingStrike(fearRaw) {
    if (busy.current || !alive.current) return;
    const fear = String(fearRaw || "").trim().toLowerCase();
    if (!fear) return;
    busy.current = true;
    setPanel(null);
    fearsRef.current[roundRef.current] = fear;
    if (mode === "wild") return wildStrike(fear);
    if (mode === "relapse") return relapseStrike(fear);
    const crit = nextCrit.current;
    nextCrit.current = false;
    await fireBeam(STRIKE_COLOR, crit ? 1.6 : 1);
    if (!alive.current) return;
    // segment shatter
    const i = roundRef.current;
    setSegs((s) => s.map((seg, j) => (j === i ? { ...seg, state: "shatter" } : seg)));
    const segEl = hbRef.current ? hbRef.current.children[i] : null;
    if (segEl && fx.current) {
      const sr = segEl.getBoundingClientRect();
      fx.current.spawnShards(sr.left, sr.top, sr.width, sr.height, crit ? 70 : 40);
    }
    if (crit) {
      shakeFx("quake");
      setSys("CRITICAL NAMING.", "crit");
    }
    await wait(620);
    if (!alive.current) return;
    setSegs((s) => s.map((seg, j) => (j === i ? { ...seg, state: "done", fear } : seg)));
    if (crit) setComp(compRef.current + 10);
    roundRef.current += 1;
    setRound(roundRef.current);
    await wait(1100);
    if (!alive.current) return;
    if (roundRef.current >= boss.attacks.length) {
      essencePhase();
    } else if (roundRef.current === 2 && !surgeFired.current) {
      surgeFired.current = true;
      busy.current = false;
      survivalSurge();
    } else {
      busy.current = false;
      bossAttack();
    }
  }

  /* ── Survival surge (boss special) ─────────────────────────────────────── */

  async function survivalSurge() {
    if (busy.current || !alive.current) return;
    busy.current = true;
    setAttack((a) => ({ ...a, on: false }));
    anim(rigRef.current, "lunge");
    shakeFx("quake");
    flash(true);
    await wait(500);
    if (!alive.current) return;
    setPanel("surge");
    let pct = 100;
    if (surgeBarRef.current) surgeBarRef.current.style.width = "100%";
    surgeTimer.current = setInterval(() => {
      pct -= 1.6;
      if (surgeBarRef.current) surgeBarRef.current.style.width = `${Math.max(0, pct)}%`;
      if (pct % 12 < 1.6) {
        if (!setComp(compRef.current - 3)) return; // survival mode clears the timer
      }
      if (pct <= 0) {
        clearInterval(surgeTimer.current);
        endSurge(false);
      }
    }, 80);
  }

  async function endSurge(braved) {
    if (!alive.current) return;
    setPanel(null);
    if (braved) {
      await breathCycle("I RELEASE THE OLD STRATEGY.");
      if (!alive.current) return;
      setComp(compRef.current + 20);
      nextCrit.current = true;
      setSys("SURGE WEATHERED. +20 COMPOSURE — CRIT ARMED.", "good");
    } else {
      flash(true);
      shakeFx("quake");
      setSys("THE FLOOD TOOK ITS TOLL.", "err");
      if (compRef.current <= 0) return;
    }
    busy.current = false;
    bossAttack();
  }

  /* ── Survival mode (composure 0 — no-fail, ever) ───────────────────────── */

  function survivalMode() {
    if (inSurvival.current) return;
    inSurvival.current = true;
    clearInterval(surgeTimer.current);
    setAttack((a) => ({ ...a, on: false }));
    setSettled(true);
    setPanel("surv");
    busy.current = true;
  }

  async function survivalBreathe() {
    inSurvival.current = false;
    await breathCycle("I RETURN TO MY BODY.");
    if (!alive.current) return;
    setSettled(false);
    setComp(55);
    setSys("BACK IN THE BODY. THE MASK IS STILL HERE. SO ARE YOU.", "good");
    busy.current = false;
    if (mode === "boss") bossAttack();
    else setPanel("respond");
  }

  /* ── Essence finisher ──────────────────────────────────────────────────── */

  async function essencePhase() {
    if (rigRef.current) rigRef.current.classList.add("stagger-boss");
    setEpMsg("");
    await wait(800);
    if (!alive.current) return;
    setPanel("essence");
    busy.current = false;
  }

  async function tryEssence(e, cardEl) {
    if (busy.current) return;
    if (!boss.essences.includes(e.id)) {
      anim(cardEl, "wrong");
      setComp(compRef.current - 6);
      setEpMsg(`DEFLECTED — ${boss.name} ISN'T STARVING FOR ${e.name}. −6 COMPOSURE.`);
      return;
    }
    busy.current = true;
    essenceRef.current = e;
    setEssence(e);
    if (overlayRef.current) overlayRef.current.style.setProperty("--evolved-glow", e.color);
    setPanel(null);
    await fireBeam(e.color, 2);
    shakeFx("quake");
    await wait(200);
    if (!alive.current) return;
    await fireBeam(e.color, 1.4);
    burstAtStage(e.color, 60, 7, 0.5);
    if (rigRef.current) rigRef.current.classList.remove("stagger-boss");
    setSys("");
    await wait(900);
    if (!alive.current) return;
    setProofInput("");
    setPanel("proof");
    busy.current = false;
  }

  /* ── Proof lock → kneel → EVOLUTION ────────────────────────────────────── */

  async function lockProof(proofRaw) {
    if (busy.current) return;
    const proof = String(proofRaw || "").trim();
    if (!proof) return;
    busy.current = true;
    proofRef.current = proof;
    setPanel(null);
    flash(false);
    shakeFx("shake");
    kneelAndEvolve();
  }

  async function kneelAndEvolve() {
    if (fx.current) fx.current.setEmber(false);
    await wait(700);
    if (!alive.current) return;
    if (rigRef.current) rigRef.current.classList.add("kneel");
    setSettled(true);
    shakeFx("rumble");
    await wait(2200); // the kneel + a beat of silence
    if (!alive.current) return;

    // ── Evolution cinematic (~6s, skippable after 2s) ──────────────────────
    const e = essenceRef.current;
    skipRef.current = false;
    setDimmed(true);
    setPhaseOver("0"); // stand it back up — the slump and dimmed glow are over
    if (rigRef.current) rigRef.current.classList.remove("kneel");
    setRigFx("mqk-rig--rise");
    const skipTimer = setTimeout(() => setSkipVisible(true), 2000);
    await wait(900);
    if (!alive.current) return;
    setEvolving(true);

    if (rm) {
      // one slow crossfade, no strobe
      setMorph("fade");
      await new Promise((r) => setTimeout(r, 60));
      setMorph("fade-swap");
      await new Promise((r) => setTimeout(r, 850));
    } else {
      setRigFx("mqk-rig--rise mqk-rig--white");
      await wait(600);
      // accelerating strobe: dark ⇄ evolved silhouette
      const beats = [600, 600, 300, 300, 150, 150, 80, 80, 80, 80];
      let swapped = false;
      for (const ms of beats) {
        if (!alive.current) return;
        if (skipRef.current) break;
        swapped = !swapped;
        setMorph(swapped ? "swap" : "dark");
        await new Promise((r) => setTimeout(r, ms));
      }
      setMorph("swap");
    }
    if (!alive.current) return;

    // reveal
    clearTimeout(skipTimer);
    setSkipVisible(false);
    setEvolving(false);
    setMorph(rm ? "fade-swap" : "swap");
    setRigFx("mqk-rig--revealed");
    setDimmed(false);
    flash(false);
    shakeFx("quake");
    burstAtStage(e ? e.color : "#ffffff", 60, 7, 0.5);
    setBanner({
      name: boss.name,
      evolvedName: boss.evolved.name,
      tag: boss.evolved.role,
    });
    await wait(700);
    if (!alive.current) return;
    setBrandOn(true);
    burstAtStage(e ? e.color : "#ffffff", 20, 4, 0.52);
    await wait(1400);
    if (!alive.current) return;
    setBanner(null);
    setCard({
      kind: "integration",
      big: "It works for you now.",
      evolvedName: boss.evolved.name,
      role: boss.evolved.role,
      essence: e,
      proof: proofRef.current,
      xp: XP_PER_BOSS,
    });
    flash(false);
  }

  function skipEvolution() {
    skipRef.current = true;
  }

  async function confirmIntegration() {
    setCard(null);
    // the evolved form shrinks to ally size and walks to the player's side
    if (rigRef.current) rigRef.current.classList.add("shrunk");
    if (stageRef.current) {
      stageRef.current.style.left = "26%";
      stageRef.current.style.bottom = "8%";
    }
    const r = stageRect();
    if (r && fx.current) {
      fx.current.spawnBurst(r.left + r.width / 2, r.top + r.height * 0.6, "#3f8cff", 30, 3);
    }
    await wait(1500);
    if (onComplete) {
      onComplete({
        type: "boss",
        id: boss.id,
        fears: [...fearsRef.current],
        essenceId: essenceRef.current ? essenceRef.current.id : null,
        proof: proofRef.current,
      });
    }
  }

  /* ── Wild fight (compressed, < 60s) ────────────────────────────────────── */

  async function wildStrike(fear) {
    const crit = nextCrit.current;
    nextCrit.current = false;
    await fireBeam(STRIKE_COLOR, crit ? 1.6 : 1);
    if (!alive.current) return;
    setWispShatter(true);
    const r = stageRect();
    if (r && fx.current) fx.current.spawnShards(r.left, r.top, r.width, r.height, crit ? 50 : 32);
    if (crit) shakeFx("quake");
    await wait(700);
    if (!alive.current) return;
    setToast(`+${XP_PER_WILD} XP`);
    setCard({ kind: "wild", big: critic.win, fear });
    // street resumes on its own — no button needed, but reduced motion
    // still gets reading time (this is a read, not an animation)
    setTimeout(() => {
      if (alive.current && onComplete) onComplete({ type: "wild", id: critic.id, fear });
    }, 2000);
  }

  /* ── Relapse refresher (1 round — it kneels immediately) ───────────────── */

  async function relapseStrike(fear) {
    await fireBeam(STRIKE_COLOR, 1.2);
    if (!alive.current) return;
    if (rigRef.current) rigRef.current.classList.add("kneel");
    setSettled(true);
    await wait(1400);
    if (!alive.current) return;
    setCard({
      kind: "relapse",
      big: "Old voice.",
      small: "YOU ALREADY KNOW ITS NAME. IT KNEELS FASTER EVERY TIME.",
      fear,
    });
  }

  function confirmRelapse() {
    if (onComplete) onComplete({ type: "relapse", id: boss.id, fear: fearsRef.current[0] || "" });
  }

  /* ── Walk Away — always free, never punished ───────────────────────────── */

  async function walkAway() {
    if (card) return;
    clearInterval(surgeTimer.current);
    busy.current = true;
    setPanel(null);
    setAttack((a) => ({ ...a, on: false }));
    setCard({ kind: "walkaway", big: "Not now.", small: "IT'LL BE HERE WHEN YOU'RE READY." });
    setTimeout(() => {
      if (alive.current && onWalkAway) onWalkAway();
    }, 1400);
  }

  /* ── Mount: intro cinematic ────────────────────────────────────────────── */

  useEffect(() => {
    alive.current = true;
    fx.current = createMaskFX(canvasRef.current, { reducedMotion: rm });

    (async () => {
      busy.current = true;
      compRef.current = 100;
      setCompState(100);
      if (fx.current) fx.current.setEmber(true, glowColor);
      await wait(500);
      if (!alive.current) return;
      if (mode === "boss" && !rm) {
        for (let k = 0; k < 5; k++) {
          burstAtStage(glowColor, 20, 4, 0.6);
          await wait(150);
          if (!alive.current) return;
        }
      }
      setRigVisible(true);
      await wait(mode === "boss" ? 900 : 400);
      if (!alive.current) return;
      setBanner(
        mode === "boss"
          ? { name: boss.name, tag: boss.tag }
          : mode === "relapse"
            ? { name: boss.name, tag: "OLD VOICE — YOU ALREADY KNOW ITS NAME" }
            : { name: critic.name, tag: "WILD CRITIC" }
      );
      flash(false);
      shakeFx("shake");
      anim(rigRef.current, "lunge");
      await wait(mode === "boss" ? 1900 : 1400);
      if (!alive.current) return;
      setBanner(null);
      if (mode === "boss") setHbUp(true);
      setHudUp(true);
      setCompUp(true);
      shakeFx("rumble");
      await wait(mode === "boss" ? 1100 : 500);
      if (!alive.current) return;
      busy.current = false;
      if (mode === "boss") {
        bossAttack();
      } else {
        // wild/relapse: one attack, then the dock
        busy.current = true;
        anim(rigRef.current, "lunge");
        await wait(280);
        if (!alive.current) return;
        flash(true);
        shakeFx("shake");
        setAttack({ text: mode === "wild" ? critic.attack : boss.attacks[0], on: true });
        anim(playerRef.current, "stagger");
        setComp(compRef.current - 10);
        await wait(1400);
        if (!alive.current) return;
        setSys("");
        setPanel("respond");
        busy.current = false;
      }
    })();

    return () => {
      alive.current = false;
      clearInterval(surgeTimer.current);
      if (fx.current) fx.current.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Render ────────────────────────────────────────────────────────────── */

  const essenceReturned = essence || (essenceRef.current ? essenceRef.current : null);
  const isBossish = mode !== "wild";

  const morphCls =
    morph === "swap"
      ? "mqk-morph mqk-morph--swap"
      : morph === "fade"
        ? "mqk-morph mqk-morph--fade"
        : morph === "fade-swap"
          ? "mqk-morph mqk-morph--fade mqk-morph--swap"
          : "mqk-morph";

  return (
    <div
      ref={overlayRef}
      className={`mqk-overlay${rm ? " mqk--still" : ""}${settled ? " settled" : ""}`}
      style={{
        "--mqk-bglow": glowColor,
        "--mqk-arena": arenaColor,
        "--mqk-zone": zoneAccent,
      }}
      role="dialog"
      aria-modal="true"
      aria-label={isBossish ? `Facing ${boss.name}` : `Facing ${critic.name}`}
    >
      <div className="mqk-fog" aria-hidden="true" />
      <div ref={wrapRef} className="mqk-shake">
        <section className={`mqk-arena${dimmed ? " mqk-arena--dim" : ""}`}>
          <div className="mqk-floor" aria-hidden="true" />

          <div className={`mqk-hud-name${hudUp ? " up" : ""}`} aria-hidden="true">
            <span className="n">{isBossish ? boss.name : critic.name}</span>
            <span>{isBossish ? boss.tag : "WILD CRITIC"}</span>
          </div>

          {mode === "boss" ? (
            <div ref={hbRef} className={`mqk-healthbar${hbUp ? " up" : ""}`} aria-hidden="true">
              {segs.map((seg, i) => (
                <div key={i} className={`mqk-hseg ${seg.state === "live" ? "" : seg.state}`}>
                  <div className="mqk-hseg__text">
                    {seg.state === "done" ? `AFRAID OF: ${seg.fear.toUpperCase()}` : seg.attack}
                  </div>
                  <div className="mqk-hseg__burn" />
                </div>
              ))}
            </div>
          ) : null}

          <div
            className={`mqk-comp${compUp ? " up" : ""}${comp <= 30 ? " low" : ""}`}
            role="meter"
            aria-valuenow={comp}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Composure"
          >
            <div className="mqk-comp__lbl">COMPOSURE</div>
            <div className="mqk-comp__bar">
              <div className="mqk-comp__fill" style={{ width: `${comp}%` }} />
            </div>
          </div>

          <div
            ref={stageRef}
            className={`mqk-stage${mode === "wild" ? " mqk-stage--wild" : ""}`}
            data-phase={phaseOver != null ? phaseOver : String(Math.min(round, 3))}
            style={{ "--grow": grow }}
            aria-hidden="true"
          >
            <div
              ref={rigRef}
              className={`mqk-rig ${rigFx}${wispShatter ? " mqk-wisp--shatter" : ""}`}
              style={{ opacity: rigVisible ? 1 : 0 }}
            >
              <div className="mqk-breathe">
                {mode === "wild" ? (
                  <WispSprite color={critic.color} />
                ) : (
                  <div className={morphCls}>
                    <div className="mqk-morph__dark">
                      <MaskSprite kind={boss.id} />
                    </div>
                    <div className="mqk-morph__evolved">
                      <MaskSprite kind={boss.id} evolved />
                    </div>
                  </div>
                )}
              </div>
              {essenceReturned ? (
                <span className={`mqk-brand${brandOn ? " mqk-brand--on" : ""}`} aria-hidden="true">
                  {essenceReturned.emoji}
                </span>
              ) : null}
            </div>
          </div>

          <div ref={playerRef} className="mqk-player" aria-hidden="true">
            <PlayerSprite glow="#00F0FF" />
          </div>

          {allies.length ? (
            <div className="mqk-allies" aria-hidden="true">
              {allies.map((a) => (
                <div
                  key={a.bossId}
                  className="mqk-ally-mini"
                  style={{ "--evolved-glow": a.essenceColor || "#3f8cff" }}
                >
                  <MaskSprite kind={a.bossId} evolved />
                </div>
              ))}
            </div>
          ) : null}

          {banner ? (
            <div className="mqk-banner on" aria-hidden="true">
              <div className="mqk-banner__name">
                {banner.evolvedName ? (
                  <>
                    {banner.name} evolved into <em>{banner.evolvedName}</em>!
                  </>
                ) : (
                  banner.name
                )}
              </div>
              <div className="mqk-banner__tag">{banner.tag}</div>
            </div>
          ) : null}

          {evolving ? (
            <div className="mqk-evolving mqk-display" aria-hidden="true">
              WHAT? {boss ? boss.name : ""} IS EVOLVING…
            </div>
          ) : null}

          <div className={`mqk-attack${attack.on ? " on" : ""}`} aria-hidden="true">
            <div className="mqk-attack__t">{attack.text}</div>
          </div>

          {/* response dock */}
          <div className={`mqk-respond${panel === "respond" ? " on" : ""}`}>
            <div className={`mqk-sys ${sys.cls}`}>{sys.text}</div>
            <div className="mqk-moves">
              {mode === "boss" ? (
                <button type="button" className="mqk-mbtn mqk-mbtn--fight" onClick={onFightBack}>
                  Fight Back<small>rage · 0 dmg</small>
                </button>
              ) : null}
              <button type="button" className="mqk-mbtn mqk-mbtn--breathe" onClick={onBreathe}>
                Breathe<small>+composure · crit next</small>
              </button>
              <button type="button" className="mqk-mbtn mqk-mbtn--name" onClick={openNamePanel}>
                Name the Fear<small>the only real damage</small>
              </button>
            </div>
            <button type="button" className="mqk-walkaway" onClick={walkAway}>
              ← Walk Away · always free
            </button>
          </div>

          {/* naming panel */}
          <div className={`mqk-namepanel${panel === "name" ? " on" : ""}`}>
            <div className="mqk-prompt">
              This attack is protection. <b>Bad protection.</b>
              <br />
              What is this mask actually afraid of?
            </div>
            <div className="mqk-chips">
              {nameChips.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="mqk-chip"
                  onClick={() => {
                    setFearInput(c);
                    namingStrike(c);
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            <input
              ref={fearInputRef}
              className="mqk-input"
              maxLength={60}
              placeholder="it's afraid of…"
              autoComplete="off"
              spellCheck="false"
              value={fearInput}
              onChange={(e) => setFearInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && fearInput.trim()) namingStrike(fearInput);
              }}
            />
            <button
              type="button"
              className="mqk-strike mqk-display"
              disabled={!fearInput.trim()}
              onClick={() => namingStrike(fearInput)}
            >
              Naming Strike
            </button>
            <button
              type="button"
              className="mqk-back"
              onClick={() => {
                setPanel("respond");
                setAttack((a) => ({ ...a, on: true }));
              }}
            >
              ← BACK
            </button>
          </div>

          {/* breath overlay */}
          <div className={`mqk-breathov${panel === "breath" ? " on" : ""}`}>
            <div className={`mqk-orb ${breath.phase}`}>
              <span>{breath.phase === "in" ? "INHALE" : "EXHALE"}</span>
            </div>
            <div className="mqk-mantra">{breath.mantra}</div>
          </div>

          {/* survival surge */}
          <div className={`mqk-surge${panel === "surge" ? " on" : ""}`}>
            <div className="mqk-surge__warn">SURVIVAL SURGE</div>
            <div className="mqk-surge__sub">
              THE MASK IS FLOODING YOUR NERVOUS SYSTEM — BREATHE THROUGH IT
            </div>
            <div className="mqk-surge__barwrap">
              <div ref={surgeBarRef} className="mqk-surge__bar" />
            </div>
            <button
              type="button"
              className="mqk-surge__breathe"
              onClick={() => {
                clearInterval(surgeTimer.current);
                endSurge(true);
              }}
            >
              Breathe
            </button>
          </div>

          {/* essence phase */}
          <div className={`mqk-essence${panel === "essence" ? " on" : ""}`}>
            <div className="mqk-essence__title">Finisher · Return the Essence</div>
            <div className="mqk-essence__sub">
              {boss ? boss.name : ""} is staggered. It attacked because it was starving.
              <br />
              Give it back what it forgot how to ask for.
            </div>
            <div className="mqk-egrid">
              {ESSENCES.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  className="mqk-ecard"
                  style={{ "--ecol": e.color }}
                  onClick={(ev) => tryEssence(e, ev.currentTarget)}
                >
                  <div className="ee">{e.emoji}</div>
                  <div className="en">{e.name}</div>
                  <div className="ea">{e.aff}</div>
                </button>
              ))}
            </div>
            <div className="mqk-epmsg">{epMsg}</div>
          </div>

          {/* proof lock */}
          <div className={`mqk-proof${panel === "proof" ? " on" : ""}`}>
            <div className="mqk-proof__title">Proof Lock</div>
            <div className="mqk-proof__sub">
              Your brain does not believe affirmations. It believes proof.
              <br />
              Name ONE action you'll take today — the seal on this win.
            </div>
            <div className="mqk-pchips">
              {(essenceReturned ? essenceReturned.proofs : []).map((p) => (
                <button
                  key={p}
                  type="button"
                  className="mqk-pchip"
                  onClick={() => setProofInput(p)}
                >
                  {p}
                </button>
              ))}
            </div>
            <input
              className="mqk-input"
              maxLength={70}
              placeholder="or write your own…"
              autoComplete="off"
              spellCheck="false"
              value={proofInput}
              onChange={(e) => setProofInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && proofInput.trim()) lockProof(proofInput);
              }}
            />
            <button
              type="button"
              className="mqk-lock mqk-display"
              disabled={!proofInput.trim()}
              onClick={() => lockProof(proofInput)}
            >
              Lock It In
            </button>
            {onMakeMission ? (
              <button
                type="button"
                className="mqk-mission"
                disabled={!proofInput.trim()}
                onClick={() => {
                  onMakeMission(proofInput.trim());
                  lockProof(proofInput);
                }}
              >
                Lock It In + make it today's mission
              </button>
            ) : null}
          </div>

          {/* survival mode */}
          <div className={`mqk-surv${panel === "surv" ? " on" : ""}`}>
            <div className="mqk-surv__t">Survival Mode</div>
            <div className="mqk-surv__s">
              You didn't lose. You left your body.
              <br />
              The mask can't be named from inside the flood.
              <br />
              <b>One breath brings you back.</b>
            </div>
            <button type="button" className="mqk-surv__breathe" onClick={survivalBreathe}>
              Breathe Back In
            </button>
          </div>

          {/* integration / wild / relapse / walkaway card */}
          {card ? (
            <div className="mqk-card on">
              <div className="mqk-card__big">{card.big}</div>
              {card.kind === "integration" ? (
                <>
                  <div className="mqk-card__small">
                    {boss.name} — EVOLVED INTO <b>{card.evolvedName}</b>. IT NOW {card.role}.
                    <br />
                    ESSENCE RETURNED: {card.essence ? `${card.essence.emoji} ${card.essence.name}` : ""}.
                    <br />
                    YOUR PROOF: {String(card.proof || "").toUpperCase()}.
                  </div>
                  <div className="mqk-card__xp">+{card.xp} XP</div>
                  <button type="button" className="mqk-card__cont" onClick={confirmIntegration}>
                    Return to the street
                  </button>
                </>
              ) : card.kind === "relapse" ? (
                <>
                  <div className="mqk-card__small">{card.small}</div>
                  <button type="button" className="mqk-card__cont" onClick={confirmRelapse}>
                    Return to the street
                  </button>
                </>
              ) : card.small ? (
                <div className="mqk-card__small">{card.small}</div>
              ) : null}
            </div>
          ) : null}

          {toast ? <div className="mqk-toast">{toast}</div> : null}

          {skipVisible ? (
            <button type="button" className="mqk-skip" onClick={skipEvolution}>
              Skip →
            </button>
          ) : null}
        </section>
      </div>

      <div ref={beamRef} className="mqk-beam" aria-hidden="true" />
      <canvas ref={canvasRef} className="mqk-fx" aria-hidden="true" />
      <div ref={flashRef} className="mqk-flash" aria-hidden="true" />
    </div>
  );
}

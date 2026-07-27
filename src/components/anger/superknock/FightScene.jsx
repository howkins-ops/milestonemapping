import React, { useEffect, useRef, useState } from "react";
import { Boxer, PlayerSilhouette, Crowd } from "../door/Boxer.jsx";
import createDoorFX from "../door/DoorFX.js";
import {
  createFight, stepFight, playCard, eatIt, closeIt, walkAway, mash,
  PHASE, RESULT, tierOf,
} from "./skFight.js";
import { CARDS } from "./skObjections.js";
import { COMPOSURE_PALETTE } from "./skHomeowners.js";
import { FIGHT } from "./skTuning.js";
import { SkIconSheet, SkIcon } from "./skArt.jsx";
import {
  sfxTellCue, sfxPunch, sfxBlock, sfxBossHit, sfxBossDown, sfxStarEarn,
  sfxImpact, sfxRoundBell,
} from "../../../lib/sfx.js";
import "../../../styles/door-bout.css";

/* ════════════════════════════════════════════════════════════════════════
   SUPER KNOCK — PHASE 3, FIGHT MODE.

   Punch-Out framing, reusing The Door's `Boxer` rig wholesale: poses are
   number tables tweened by CSS, so a whole bout costs a handful of React
   renders per second rather than one per frame. The player is drawn
   semi-transparent — Super Punch-Out!!'s actual design decision, so you read
   his tell THROUGH your own shoulders.

   ── THE PLAYER HAS NO HEALTH BAR ─────────────────────────────────────────
   Composure is the health, and it is shown in three places, none of them a
   meter: the player's posture drops, the crowd noise thins, and the WHOLE
   SCENE'S PALETTE cools — sky, wall, trim, porch light.

   That last one is a palette SWAP, six hex values written as CSS custom
   properties, and never a `filter: saturate()`. The boxer's idle bob is an
   `infinite` animation; a filter on any ancestor of it re-rasterises the
   entire filtered subtree every single frame. The Door documented that the
   expensive way in door-night.css and there is no reason to pay for it twice.

   ── THE TELL MUST BE READABLE WITH THE SOUND OFF ─────────────────────────
   Pose first, audio second. `sfxTellCue` reinforces; it never carries.
   ════════════════════════════════════════════════════════════════════════ */

export default function FightScene({ house, owner, lead, deck, aggro, grace, onDone, resume }) {
  const wrapRef = useRef(null);
  const fxCanvasRef = useRef(null);
  const fxRef = useRef(null);
  const fRef = useRef(null);
  const rafRef = useRef(0);
  const lastPose = useRef("guard");
  const doneRef = useRef(false);

  const [ui, setUi] = useState(() => ({
    hp: 1, phase: PHASE.intro, pose: "guard", line: null, streak: 0,
    closeReady: false, stars: 0, tier: "steady", card: null, flash: false,
  }));

  useEffect(() => {
    const f = resume || createFight({ house, lead, deck, aggro, grace });
    fRef.current = f;
    const fx = createDoorFX({ canvas: fxCanvasRef.current, scene: wrapRef.current, camera: wrapRef.current });
    fxRef.current = fx;
    sfxRoundBell();

    let last = 0;
    const tick = (t) => {
      rafRef.current = requestAnimationFrame(tick);
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 1 / 60;
      last = t;
      stepFight(f, dt);

      /* the tell cue fires on the FRAME the pose changes, never on a timer */
      if (f.pose !== lastPose.current) {
        if (f.phase === PHASE.tell && f.atk) sfxTellCue(f.atk.cue);
        lastPose.current = f.pose;
      }

      const tier = tierOf(f);
      const next = {
        hp: f.hp / f.maxHp,
        phase: f.phase,
        pose: f.pose,
        line: f.lastLine,
        streak: f.streak,
        closeReady: f.closeReady,
        stars: f.stars,
        tier,
        card: f.lastCard,
        flash: f.flash > 0.05,
      };
      setUi((prev) => (
        prev.hp === next.hp && prev.phase === next.phase && prev.pose === next.pose
          && prev.line === next.line && prev.streak === next.streak
          && prev.closeReady === next.closeReady && prev.stars === next.stars
          && prev.tier === next.tier && prev.card === next.card && prev.flash === next.flash
          ? prev : next
      ));

      if (f.result && !doneRef.current && f.phaseLeft <= 0) {
        doneRef.current = true;
        if (f.result === RESULT.sale) sfxBossDown();
        window.setTimeout(() => onDone && onDone({
          houseIdx: house.idx,
          outcome: f.result,
          counters: f.counters,
          whiffs: f.whiffs,
          stars: f.stars,
          composure: Math.round(f.composure),
        }), 900);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      fx.destroy();
      fxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── inputs ────────────────────────────────────────────────────────────*/
  const fx = () => fxRef.current;

  const onCard = (k) => {
    const f = fRef.current;
    if (!f) return;
    const r = playCard(f, k);
    if (!r) return;
    if (r.verdict === "perfect" || r.verdict === "clean") {
      sfxPunch(r.perfect ? 3 : 2);
      sfxBossHit();
      if (fx()) { fx().hitStop(r.perfect ? 90 : 60); fx().shake(r.perfect ? 0.32 : 0.2); }
      if (r.perfect) { sfxStarEarn(); if (fx()) fx().slowMo(0.4, 220); }
      if (r.close && fx()) fx().slowMo(FIGHT.closeSlowMo, FIGHT.closeMs);
    } else if (r.verdict === "wrong") {
      sfxImpact(3);
      if (fx()) { fx().shake(0.34); fx().flash("#FF3B5C", 130, { alpha: 0.32 }); }
    } else if (r.verdict === "early" || r.verdict === "late") {
      sfxBlock();
      if (fx()) fx().shake(0.14);
    } else if (r.verdict === "notheld") {
      mash(f);
    }
  };

  const onEat = () => {
    const f = fRef.current;
    if (!f) return;
    const r = eatIt(f);
    if (r && r.verdict === "eat") { sfxBlock(); if (fx()) fx().shake(0.1); }
  };

  const onClose = () => {
    const f = fRef.current;
    if (!f) return;
    const r = closeIt(f);
    if (r) {
      sfxPunch(3);
      sfxStarEarn();
      if (fx()) { fx().hitStop(120); fx().shake(0.5); fx().flash("#00FFBF", 200, { alpha: 0.4 }); }
    }
  };

  const onWalk = () => {
    const f = fRef.current;
    if (f) walkAway(f);
  };

  const pal = COMPOSURE_PALETTE[ui.tier] || COMPOSURE_PALETTE.steady;
  const boss = { id: `sk${house.idx}`, name: owner.name, look: owner.look };
  const live = ui.phase === PHASE.tell || ui.phase === PHASE.strike;

  return (
    <div
      className={`sk-fight sk-fight--${ui.tier}`}
      ref={wrapRef}
      style={{
        "--sk-sky": pal.sky, "--sk-wall": pal.wall, "--sk-trim": pal.trim,
        "--sk-light": pal.light, "--sk-ink": pal.ink, "--sk-edge": pal.edge,
      }}
    >
      <SkIconSheet />
      <canvas className="sk-canvas sk-canvas--fx" ref={fxCanvasRef} />

      <div className="sk-fight__frame">
        <div className="sk-fight__crowd"><Crowd flash={ui.flash} /></div>
        <div className="sk-fight__him">
          <Boxer boss={boss} pose={ui.pose} raging={ui.phase === PHASE.strike} flash={ui.flash} dur={110} />
        </div>
        <div className="sk-fight__me">
          {/* Composure is legible here and NOWHERE as a number. */}
          <PlayerSilhouette
            guard={ui.tier === "gone" ? "down" : "up"}
            hurt={ui.tier === "rattled" || ui.tier === "gone"}
          />
        </div>
      </div>

      <div className="sk-fight__top">
        <button type="button" className="sk-back" onClick={onWalk} aria-label="Walk away">←</button>
        <div className="sk-fight__name">
          <span>{owner.name}</span>
          <span className="sk-fight__sub">{house.number} · {owner.sub}</span>
        </div>
        <div className="sk-stars">
          {[0, 1, 2].map((i) => <span key={i} className={`sk-star ${i < ui.stars ? "is-on" : ""}`} />)}
        </div>
      </div>

      {/* His resistance IS the objection. This bar is his, never yours. */}
      <div className="sk-resist">
        <div className="sk-resist__fill" style={{ width: `${Math.max(0, ui.hp) * 100}%` }} />
        <span className="sk-resist__l">HIS OBJECTION</span>
      </div>

      {ui.line && (
        <div className={`sk-say sk-say--${ui.line.who} sk-say--${ui.line.kind || ""}`} key={ui.line.id}>
          {ui.line.text}
        </div>
      )}

      <div className="sk-fight__hand">
        {ui.closeReady ? (
          <button type="button" className="sk-close" onClick={onClose}>
            <SkIcon name="sold" size={20} /> CLOSE IT
          </button>
        ) : (
          <>
            <div className="sk-hand">
              {deck.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`sk-play ${live ? "is-live" : ""}`}
                  style={{ "--cc": CARDS[k].accent }}
                  onClick={() => onCard(k)}
                >
                  <span className="sk-play__n">{CARDS[k].name}</span>
                </button>
              ))}
            </div>
            <button type="button" className="sk-eat" onClick={onEat}>EAT IT</button>
          </>
        )}
        {ui.streak > 0 && !ui.closeReady && (
          <div className="sk-streak">{ui.streak} CLEAN{ui.streak >= 2 ? " — ONE MORE" : ""}</div>
        )}
      </div>
    </div>
  );
}

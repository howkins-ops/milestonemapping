import React, { useEffect, useState } from "react";
import { useAppData } from "../../../hooks/useAppData.js";
import AlphaCall from "./AlphaCall.jsx";
import AlphaToday from "./AlphaToday.jsx";
import WorldMap from "./WorldMap.jsx";
import ZoneGate from "./ZoneGate.jsx";
import MythBossFight from "./MythBossFight.jsx";
import AlphaZone from "./AlphaZone.jsx";
import AlphaSession from "./AlphaSession.jsx";
import CheatDayEvent from "./CheatDayEvent.jsx";
import EatingCalculator from "./EatingCalculator.jsx";
import Apotheosis from "./Apotheosis.jsx";
import { PHASES } from "./data/phases.js";
import { MYTH_BOSSES } from "./data/mythBosses.js";
import { WORKOUTS } from "./data/phases.js";
import { daySlot, dayIdxFromDate } from "./engine/scheduler.js";
import { completedThisWeek, scheduledWorkoutCount, advance, actionForStyle } from "./engine/progression.js";
import { decayDays } from "./engine/hormones.js";
import { sfxPlateClank, sfxBossDown, sfxChalkPoof } from "../../../lib/sfx.js";
import "../../../styles/alpha.css";

/* ═══════════════════════════════════════════════════════════════
   ALPHA MODE — the campaign conductor, mounted under the TODAY tab.
   Views: crossing · map · zone · gate · boss · session · cheat ·
   calculator · apotheosis. Alpha state (useAlpha) is owned by
   IronWorkout and shared with the Program / Fridge / Book pages;
   the Stockpile and Codex now live on those tabs. Campaign sessions
   save through the tracker (workoutData props) so Records stays the
   single history. `initialView` deep-enters a gate/boss/session;
   `onImmersiveChange` hides the global nav during cinematic play.
   ═══════════════════════════════════════════════════════════════ */

export default function AlphaMode({ alpha, workoutData, initialView = null, onImmersiveChange, onOpenFridge, onRecommit }) {
  const { settings, addXP } = useAppData();
  const { state } = alpha;

  const [view, setView] = useState(() => initialView || { name: "auto" });
  const [racked, setRacked] = useState(null); // {summary}
  const [banner, setBanner] = useState(null); // {title, sub}

  const go = (v) => { setView(v); sfxChalkPoof(settings); };

  /* ── daily hormone decay + Phase-0 migration (forged pre-Crossing) ── */
  useEffect(() => {
    if (!alpha.loaded) return;
    const today = new Date().toDateString();
    const flags = alpha.state.flags;
    const patches = {};
    if (flags.forged && !flags.crossingDone && flags.callAnswered && alpha.state.stage >= 4) {
      patches.flags = { ...flags, crossingDone: true };
    }
    if (flags.lastDecayDate !== today) {
      const last = flags.lastDecayDate ? new Date(flags.lastDecayDate) : new Date();
      const days = Math.max(0, Math.round((Date.now() - last.getTime()) / 86400000));
      patches.hormones = decayDays(alpha.state.hormones, Math.min(days, 30));
      patches.flags = { ...(patches.flags || flags), lastDecayDate: today };
    }
    if (Object.keys(patches).length) alpha.patchState(patches);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alpha.loaded]);

  /* ── routing state (computed before any return so hooks stay stable) ── */
  const flags = state.flags;
  const inCrossing = alpha.loaded && !flags.crossingDone;
  const apotheosisNow = flags.apotheosisPending && !flags.apotheosisDone && view.name !== "apotheosis";
  // Today opens on the HUB — today's workout + meals + fasting — not the
  // journey map. The Road (map) is now a deliberate destination (from the Book
  // or the hub's doorway), never the default clutter.
  const resolved = view.name === "auto" ? { name: "hub" } : view;

  /* full-bleed moments: the global nav steps out of the frame */
  const immersiveNow = Boolean(
    inCrossing || apotheosisNow ||
    ["session", "boss", "cheat", "apotheosis"].includes(resolved.name)
  );
  useEffect(() => {
    onImmersiveChange?.(immersiveNow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immersiveNow]);
  useEffect(() => () => onImmersiveChange?.(false),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);

  /* ── the post-session pipeline ── */
  const rackAlphaSession = (result, workout) => {
    const meta = {
      alpha: {
        phaseId: state.phase, week: state.week, dayIdx: dayIdxFromDate(),
        workoutId: workout.id, style: workout.style, verdicts: result.verdicts,
      },
    };
    const row = workoutData.addSession({ ...result.session, meta });
    result.prs.forEach((p) => workoutData.addPR({ ...p, session_id: row.id }));
    const xp = 20 + result.prs.length * 15;
    addXP(xp, "Alpha session racked");
    alpha.moveHormones({ kind: actionForStyle(workout.style) });
    sfxPlateClank(settings);
    setRacked({ ...result.session, prCount: result.prs.length });

    /* progression: does this close the week? */
    const sessionsNow = [{ meta }, ...(workoutData.sessions || [])];
    const need = scheduledWorkoutCount(state.phase, state.week);
    const done = completedThisWeek(sessionsNow, state.phase, state.week);
    if (need > 0 && done >= need) {
      const adv = advance(state);
      adv.events.forEach((e) => alpha.logEvent(e.kind, e.payload));
      if (adv.done) {
        addXP(140, "COMPLETE conquered — the Ordeal ends");
        alpha.patchState({ week: 4, stage: 10, flags: { ...state.flags, apotheosisPending: true } });
      } else {
        const phaseChanged = adv.phase !== state.phase;
        addXP(phaseChanged ? 100 : 40, phaseChanged ? `${PHASES[state.phase].name} conquered` : "Week complete");
        alpha.patchState({ phase: adv.phase, week: adv.week, stage: adv.stage });
        setTimeout(() => setBanner(
          phaseChanged
            ? { title: `${PHASES[state.phase].name} CONQUERED`, sub: `${PHASES[adv.phase].name} stands at the gate` }
            : { title: `WEEK ${adv.week}`, sub: "the rotation turns — new order, same iron" }
        ), 2400);
      }
    }
  };

  /* ── boss pipeline ── */
  const winBoss = (bossId, from) => {
    const defeated = state.flags.bossesDefeated || [];
    if (!defeated.includes(bossId)) {
      alpha.patchState({ flags: { ...state.flags, bossesDefeated: [...defeated, bossId] } });
      alpha.logEvent("boss_defeat", { bossId });
      addXP(30, "Myth busted — truth stamped in the codex");
    }
    go(from || { name: "map" });
  };

  const enterZone = (phaseId) => {
    const entered = state.flags.zoneEntered || {};
    if (!entered[phaseId]) {
      alpha.patchState({ flags: { ...state.flags, zoneEntered: { ...entered, [phaseId]: true } } });
      sfxBossDown(settings);
    }
    go({ name: "zone" });
  };

  if (!alpha.loaded) return <div className="iw-empty">opening the campaign…</div>;

  if (inCrossing) {
    return <AlphaCall alpha={alpha} settings={settings} addXP={addXP}
      onDone={() => setView({ name: "map" })} />;
  }
  if (apotheosisNow) {
    return <Apotheosis alpha={alpha} workoutData={workoutData} addXP={addXP} settings={settings}
      onClose={() => setView({ name: "zone" })} />;
  }

  const boss = resolved.name === "boss" ? MYTH_BOSSES.find((b) => b.id === resolved.bossId) : null;
  const workout = resolved.name === "session" ? WORKOUTS[resolved.workoutId] : null;
  const phase = PHASES[state.phase];
  const todaySlot = daySlot(state.phase, state.week, dayIdxFromDate());

  return (
    <div className="iw-al-root">
      {resolved.name === "hub" && (
        <AlphaToday alpha={alpha}
          onStartWorkout={(workoutId) => go({ name: "session", workoutId })}
          onOpenRoad={() => go({ name: "map" })}
          onOpenZone={() => go({ name: "zone" })}
          onRecommit={onRecommit}
          onOpenCheat={() => go({ name: "cheat" })} />
      )}

      {resolved.name === "map" && (
        <>
          <button className="iw-back" onClick={() => go({ name: "hub" })}>❮ today</button>
          <div className="iw-eyebrow" style={{ color: phase.accent }}>alpha mode · stage {state.stage} · {phase.name} w{state.week}</div>
          <h2 className="iw-display iw-page-title">The Road</h2>
          <WorldMap alpha={alpha}
            onOpenGate={(phaseId) => go({ name: "gate", phaseId })}
            onOpenZone={() => go({ name: "zone" })} />
          <button className="iw-al-ghostlink" onClick={() => {
            alpha.patchState({ flags: { ...flags, crossingDone: false, crossingStep: "ordinary" } });
          }}>revisit the crossing</button>
        </>
      )}

      {resolved.name === "gate" && (
        <ZoneGate phaseId={resolved.phaseId} alpha={alpha} addXP={addXP} settings={settings}
          onFight={(bossId) => go({ name: "boss", bossId, from: { name: "gate", phaseId: resolved.phaseId } })}
          onEnter={() => enterZone(resolved.phaseId)}
          onBack={() => go({ name: "map" })} />
      )}

      {resolved.name === "boss" && boss && (
        <MythBossFight boss={boss} settings={settings}
          onWin={() => winBoss(boss.id, resolved.from)}
          onFlee={() => go(resolved.from || { name: "map" })} />
      )}

      {resolved.name === "zone" && (
        <AlphaZone alpha={alpha} workoutData={workoutData} addXP={addXP} settings={settings}
          onStartWorkout={(workoutId) => go({ name: "session", workoutId })}
          onFight={(bossId) => go({ name: "boss", bossId, from: { name: "zone" } })}
          onOpenCheat={() => go({ name: "cheat" })}
          onOpenCalculator={() => go({ name: "calculator" })}
          onOpenStockpile={() => (onOpenFridge ? onOpenFridge() : null)} />
      )}

      {resolved.name === "session" && workout && (
        <AlphaSession workout={workout} phase={phase}
          bestPRs={workoutData.bestPRs} lastWeights={workoutData.lastWeights}
          settings={settings}
          onFinish={(result) => { rackAlphaSession(result, workout); setView({ name: "zone" }); }}
          onAbort={() => go({ name: "zone" })} />
      )}

      {resolved.name === "cheat" && (
        <CheatDayEvent alpha={alpha} addXP={addXP} settings={settings}
          pairedFastTomorrow={Boolean(PHASES[state.phase].nutritionDays?.fullFast != null)}
          onClose={() => go({ name: "zone" })} />
      )}

      {resolved.name === "calculator" && (
        <EatingCalculator alpha={alpha} addXP={addXP} settings={settings}
          onBack={() => go({ name: "zone" })} />
      )}

      {resolved.name === "apotheosis" && (
        <Apotheosis alpha={alpha} workoutData={workoutData} addXP={addXP} settings={settings}
          onClose={() => setView({ name: "zone" })} />
      )}

      {/* RACKED overlay (campaign flavor) */}
      {racked && (
        <RackedVeil summary={racked} accent={phase.accent} slot={todaySlot}
          onDone={() => setRacked(null)} settings={settings} />
      )}

      {/* week / phase banner */}
      {banner && (
        <div className="iw-al-weekup" onClick={() => setBanner(null)}>
          <div className="iw-al-weekup-card">
            <div className="iw-al-weekup-title">{banner.title}</div>
            <div className="iw-al-weekup-sub">{banner.sub}</div>
            <div className="iw-al-chalk-ring" aria-hidden="true">
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} className="iw-chalk-fleck" style={{ "--iw-ca": `${i * 36}deg`, animationDelay: `${80 + i * 18}ms` }} />
              ))}
            </div>
            <button className="iw-btn-ember" onClick={() => setBanner(null)}>onward</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── campaign RACKED veil (reuses the tracker's slam aesthetics) ── */
function RackedVeil({ summary, accent, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const fmtDur = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  return (
    <div className="iw-racked-veil">
      <div className="iw-racked-plate" style={{ boxShadow: `0 30px 80px rgba(0,0,0,.8), inset 0 0 0 2px ${accent}66, 0 0 60px ${accent}33` }}>
        <div className="iw-racked-bolt" aria-hidden="true" />
        <div className="iw-racked-word">RACKED</div>
        <div className="iw-chalk-burst" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i} className="iw-chalk-fleck" style={{ "--iw-ca": `${i * 36}deg`, animationDelay: `${80 + i * 18}ms` }} />
          ))}
        </div>
      </div>
      <div className="iw-racked-stats">
        <span>{fmtDur(summary.duration_s)}</span>
        <span className="iw-racked-dot">·</span>
        <span>{Math.round(summary.total_volume).toLocaleString()} lbs moved</span>
        {summary.prCount > 0 && (
          <>
            <span className="iw-racked-dot">·</span>
            <span className="iw-racked-pr">{summary.prCount} PR{summary.prCount > 1 ? "s" : ""}</span>
          </>
        )}
      </div>
      <div className="iw-racked-sub">workout saved to your log ✓</div>
    </div>
  );
}

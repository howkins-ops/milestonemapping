import React, { useEffect, useMemo, useState } from "react";
import { useAppData } from "../../../hooks/useAppData.js";
import { useAlpha } from "./useAlpha.js";
import AlphaCall from "./AlphaCall.jsx";
import WorldMap from "./WorldMap.jsx";
import ZoneGate from "./ZoneGate.jsx";
import MythBossFight from "./MythBossFight.jsx";
import AlphaZone from "./AlphaZone.jsx";
import AlphaSession from "./AlphaSession.jsx";
import CheatDayEvent from "./CheatDayEvent.jsx";
import StockpilePage from "./StockpilePage.jsx";
import ScrollShelf from "./WisdomScroll.jsx";
import BenchmarkLadder from "./BenchmarkLadder.jsx";
import TraitTree from "./TraitTree.jsx";
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
   ALPHA MODE — the campaign conductor.
   Views: crossing · map · zone · gate · boss · session · cheat ·
   stockpile · codex · apotheosis. Campaign sessions save through
   the tracker (workoutData props from IronWorkout) so The Log and
   the PR Wall stay the single history.
   ═══════════════════════════════════════════════════════════════ */

const CHIPS = [
  { id: "map", label: "map", glyph: "🗺" },
  { id: "zone", label: "zone", glyph: "⚡" },
  { id: "stockpile", label: "stockpile", glyph: "🧊" },
  { id: "codex", label: "codex", glyph: "❖" },
];

export default function AlphaMode({ workoutData }) {
  const { userId, settings, addXP } = useAppData();
  const alpha = useAlpha(userId);
  const { state } = alpha;

  const [view, setView] = useState(() => {
    try {
      const hint = window.sessionStorage.getItem("iron_view");
      if (hint === "alpha:stockpile") {
        window.sessionStorage.removeItem("iron_view");
        return { name: "stockpile" };
      }
    } catch { /* silent */ }
    return { name: "auto" };
  });
  const [racked, setRacked] = useState(null); // {summary}
  const [banner, setBanner] = useState(null); // {title, sub}
  const [codexTab, setCodexTab] = useState("myths");

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

  /* ── trait levels from real behavior ── */
  const traitLevels = useMemo(() => {
    const ev = alpha.events;
    const count = (k) => ev.filter((e) => e.kind === k).length;
    const alphaSessions = (workoutData.sessions || []).filter((s) => s.meta?.alpha);
    const lowersHonored = alphaSessions.filter((s) =>
      (s.meta.alpha.verdicts || []).some((v) => v.verdict === "lower")).length;
    return {
      helpful: Math.min(5, Math.floor(count("fridge_stocked") / 2)),
      confident: Math.min(5, Math.floor(alphaSessions.length / 5)),
      vain: Math.min(5, Math.floor(count("cardio") / 3)),
      prideful: Math.min(5, count("week_complete")),
      humble: Math.min(5, lowersHonored),
      tolerant: Math.min(5, Math.floor(count("fast_complete") / 5)),
      dedicated: Math.min(5, count("phase_complete") * 2 + Math.floor(count("week_complete") / 4)),
    };
  }, [alpha.events, workoutData.sessions]);

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

  /* ── routing ── */
  const flags = state.flags;
  const inCrossing = !flags.crossingDone;
  const apotheosisNow = flags.apotheosisPending && !flags.apotheosisDone && view.name !== "apotheosis";

  if (inCrossing) {
    return <AlphaCall alpha={alpha} settings={settings} addXP={addXP}
      onDone={() => setView({ name: "map" })} />;
  }
  if (apotheosisNow) {
    return <Apotheosis alpha={alpha} workoutData={workoutData} addXP={addXP} settings={settings}
      onClose={() => setView({ name: "zone" })} />;
  }

  const resolved = view.name === "auto"
    ? ((flags.zoneEntered || {})[state.phase] ? { name: "zone" } : { name: "map" })
    : view;

  const showChips = ["map", "zone", "stockpile", "codex"].includes(resolved.name);
  const boss = resolved.name === "boss" ? MYTH_BOSSES.find((b) => b.id === resolved.bossId) : null;
  const workout = resolved.name === "session" ? WORKOUTS[resolved.workoutId] : null;
  const phase = PHASES[state.phase];
  const todaySlot = daySlot(state.phase, state.week, dayIdxFromDate());

  return (
    <div className="iw-al-root">
      {showChips && (
        <div className="iw-al-chips">
          {CHIPS.map((c) => (
            <button key={c.id}
              className={`iw-al-chip ${resolved.name === c.id ? "iw-al-chip-on" : ""}`}
              onClick={() => go({ name: c.id })}>
              <span aria-hidden="true">{c.glyph}</span> {c.label}
            </button>
          ))}
        </div>
      )}

      {resolved.name === "map" && (
        <>
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
          onOpenStockpile={() => go({ name: "stockpile" })} />
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

      {resolved.name === "stockpile" && (
        <StockpilePage alpha={alpha} addXP={addXP} settings={settings}
          onBack={() => go({ name: "zone" })} />
      )}

      {resolved.name === "codex" && (
        <div className="iw-al-codex">
          <div className="iw-al-codextabs">
            {[["myths", "myths"], ["scrolls", "scrolls"], ["ladders", "ladders"], ["traits", "traits"]].map(([id, label]) => (
              <button key={id} className={`iw-chip-btn ${codexTab === id ? "iw-chip-on" : ""}`}
                onClick={() => setCodexTab(id)}>{label}</button>
            ))}
          </div>
          {codexTab === "myths" && <MythCodex alpha={alpha} onFight={(bossId) => go({ name: "boss", bossId, from: { name: "codex" } })} />}
          {codexTab === "scrolls" && <ScrollShelf alpha={alpha} />}
          {codexTab === "ladders" && <BenchmarkLadder prs={workoutData.prs} />}
          {codexTab === "traits" && <TraitTree traitLevels={traitLevels} />}
        </div>
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

/* ── busted-myth codex ── */
function MythCodex({ alpha, onFight }) {
  const defeated = new Set(alpha.state.flags.bossesDefeated || []);
  const stage = alpha.state.stage;
  return (
    <div className="iw-al-mythcodex">
      <div className="iw-eyebrow">reject this thought</div>
      <h2 className="iw-display iw-page-title">Busted Myths</h2>
      <div className="iw-al-shelf-count">{defeated.size} of {MYTH_BOSSES.length} broken</div>
      <div className="iw-stack">
        {MYTH_BOSSES.map((b) => {
          const down = defeated.has(b.id);
          const reachable = PHASES[b.gatePhase] && stage >= PHASES[b.gatePhase].stage;
          return (
            <div key={b.id} className={`iw-al-codexcard ${down ? "iw-al-codexcard-down" : ""}`}>
              <div className="iw-al-card-head">
                <span className="iw-al-challenge-name">{down ? "✓ " : ""}{b.name}</span>
                <span className="iw-chip">{PHASES[b.gatePhase]?.name}</span>
              </div>
              {down ? (
                <p className="iw-al-codextruth">{b.truth}</p>
              ) : reachable ? (
                <button className="iw-btn-ghost" onClick={() => onFight(b.id)}>⚔ face it</button>
              ) : (
                <p className="iw-al-dial-villain">still ahead on the road</p>
              )}
            </div>
          );
        })}
      </div>
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
    </div>
  );
}

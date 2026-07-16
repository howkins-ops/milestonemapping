import React, { useEffect, useRef } from "react";
import { castVote, currentRun } from "./clearDayStore.js";
import { LADDER, TRACK_META, standFor } from "./clearDayData.js";
import ClearDaySun from "./ClearDaySun.jsx";
import DailyContract from "./DailyContract.jsx";
import cdFx from "./cdFx.js";
import { tapLight, tapMedium, buzzSuccess } from "../../lib/haptics.js";
import { sfxPop, sfxPhoenix } from "../../lib/sfx.js";
import { XP_VALUES } from "../../lib/gamification.js";

/* ═══════════════════════════════════════════════════════════════
   THE DAILY RITUAL — the CEREMONY. Identity builds; Ritual performs.
   Fixed short ceremony, identical every day (ritual = perceived
   control, CLEARDAY-3-RESEARCH.md §2):
     1 · SPEAK          the incantation — claim + today's stand, out loud
     2 · HOLD THE LAWS  one exhibit per front — weed and porn each
     3 · ARM THE NIGHT  rehearse one armed when-then rule
     4 · THE CONTRACT   today-only, signed by hand, wax-sealed
   Every done-state derives from the store; nothing here has its
   own state to drift out of sync. This screen never edits and never
   re-displays editable content — anything owned elsewhere appears
   only as a pointer chip (Claim/Laws/rules → Identity, lesson → Today).
   ═══════════════════════════════════════════════════════════════ */

function StepCard({ done, accent, label, children }) {
  return (
    <div
      className={`cd-card cd-daily-step ${done ? "cd-daily-step--done" : ""}`}
      style={accent ? { "--cd-acc": accent } : undefined}
    >
      <div className="cd-daily-step-head">
        <span className="cd-label cd-label--dawn">{label}</span>
        {done && <span className="cd-daily-check" aria-hidden="true">✓</span>}
      </div>
      {children}
    </div>
  );
}

export default function DailyTab({ S, day, settings, celebrate, addXPSafe, onGoTab, onIncant, onSlipFlow }) {
  const stand = standFor(day);

  /* step completion — derived, never stored */
  const incantDone = S.ballot.some((b) => b.day === day && b.kind === "incant");
  const lawsDone = S.tracks.map((t) => S.ballot.some((b) => b.day === day && b.kind === "law" && b.track === t));
  const allLawsDone = lawsDone.length > 0 && lawsDone.every(Boolean);
  const sealed = Boolean(S.closedDays[day]) || Boolean(S.contracts && S.contracts[day]);

  /* step 3 — rehearse one armed rule; graceful until the first one exists */
  const armedRules = (S.rules || []).filter((r) => r.armedAt);
  const armedDone = S.ballot.some((b) => b.day === day && b.kind === "armed");
  const armStepDone = armedDone || armedRules.length === 0;
  const tonightRule = armedRules.length ? armedRules[(day - 1) % armedRules.length] : null;

  const lastPulse = S.pulses[S.pulses.length - 1];
  const pulseDue = day >= 7 && (!lastPulse || day - lastPulse.day >= 7);
  const claimableRung = LADDER.find((r) => {
    const reached = LADDER.findIndex((x) => x.id === S.rung) >= LADDER.findIndex((x) => x.id === r.id);
    return !reached && day >= r.minDay;
  });
  const repDone = S.curriculumDone.includes(day);
  const workoutCount = ["catch", "opposite", "exhibit"].filter((k) =>
    S.ballot.some((b) => b.day === day && b.kind === k)
  ).length;

  const steps = [incantDone, allLawsDone, armStepDone, sealed];
  const doneCount = steps.filter(Boolean).length;
  const allDone = doneCount === steps.length;

  /* ritual-complete moment — fires only on the crossing, never on mount */
  const prevDone = useRef(doneCount);
  useEffect(() => {
    if (doneCount === steps.length && prevDone.current < steps.length) {
      cdFx.sunrise("#ffc46b");
      buzzSuccess();
      sfxPhoenix(settings);
    }
    prevDone.current = doneCount;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneCount]);

  return (
    <div className="cd-page">
      <div className="cd-daily-hero">
        <div className="cd-daily-sun">
          <ClearDaySun variant="emblem" />
        </div>
        <div className="cd-eyebrow">DAY {day} RITUAL</div>
        <div className="cd-daily-dots" aria-label={`${doneCount} of ${steps.length} steps done`}>
          {steps.map((s, i) => (
            <span key={i} className={`cd-daily-dot ${s ? "cd-daily-dot--on" : ""}`} />
          ))}
        </div>
        {(pulseDue || claimableRung || workoutCount < 3 || !repDone) && (
          <div className="cd-daily-chips">
            {(pulseDue || claimableRung) && (
              <button type="button" className="cd-daily-chip" onClick={() => onGoTab("identity")}>
                {pulseDue ? "the weekly rewrite is due" : "a rung is waiting"} → Identity
              </button>
            )}
            {workoutCount < 3 && (
              <button type="button" className="cd-daily-chip" onClick={() => onGoTab("identity")}>
                identity workout {workoutCount}/3 → Identity
              </button>
            )}
            {!repDone && (
              <button type="button" className="cd-daily-chip" onClick={() => onGoTab("today")}>
                today's lesson rep is open → Today
              </button>
            )}
          </div>
        )}
      </div>

      {/* 1 · SPEAK — the incantation performs the claim; the words live on Identity */}
      <StepCard done={incantDone} accent="255, 196, 107" label="1 · SPEAK — say it until you believe it">
        <div className="cd-vote-meaning">TODAY'S STAND · “{stand}”</div>
        {!incantDone ? (
          <>
            <button type="button" className="cd-btn cd-btn--incant" onClick={() => { tapMedium(); onIncant(); }}>
              🔊 SPEAK IT — 3 ROUNDS, OUT LOUD
            </button>
            <div className="cd-cite">◈ spoken words encode deeper than read ones — the claim + today's stand, whisper to roar</div>
          </>
        ) : (
          <div className="cd-done-line" style={{ textAlign: "left" }}>✓ said until believed · your voice knows the words now</div>
        )}
      </StepCard>

      {/* 2 · HOLD THE LAWS — the ONLY place laws are held */}
      <StepCard done={allLawsDone} label="2 · HOLD THE LAWS — one exhibit per front">
        {S.tracks.map((t, i) => {
          const held = lawsDone[i];
          return (
            <button
              key={t}
              type="button"
              className={`cd-daily-law ${held ? "cd-daily-law--held" : ""}`}
              style={{ "--cd-acc": TRACK_META[t].tintRgb }}
              disabled={held}
              onClick={(e) => {
                castVote("law", `Held the ${TRACK_META[t].label} law today.`, t);
                cdFx.burstFrom(e, "ember", 10, TRACK_META[t].color);
                cdFx.ringFrom(e, TRACK_META[t].color);
                tapLight();
                sfxPop(settings);
              }}
            >
              <span className="cd-daily-law-name" style={{ color: TRACK_META[t].color }}>
                {TRACK_META[t].label.toUpperCase()} {held ? "· HELD ✓" : ""}
              </span>
              <span className="cd-daily-law-text">{S.laws[t] || TRACK_META[t].lawHint}</span>
            </button>
          );
        })}
        <button type="button" className="cd-ghost" onClick={() => onGoTab("identity")}>
          edit the Laws → Identity
        </button>
      </StepCard>

      {/* 3 · ARM THE NIGHT — rehearse one armed when-then rule */}
      <StepCard done={armStepDone} label="3 · ARM THE NIGHT — one rule, rehearsed">
        {tonightRule ? (
          !armedDone ? (
            <>
              <div className="cd-vote-meaning">WHEN {tonightRule.when}</div>
              <div className="cd-vote-action">→ I {tonightRule.then}</div>
              <p className="cd-p cd-p--soft" style={{ margin: "8px 0 10px" }}>
                Read it. Close your eyes and see the moment — the place, the pull, the move. That rehearsal is the rep.
              </p>
              <button type="button" className="cd-btn cd-btn--rep" onClick={(e) => {
                castVote("armed", `Rehearsed the rule: when ${tonightRule.when} → I ${tonightRule.then}`);
                addXPSafe(XP_VALUES.cleardayWorkoutRep, "Armed the night");
                cdFx.burstFrom(e, "spark", 14, "#ffc46b");
                tapMedium();
                sfxPop(settings);
                celebrate();
              }}>
                ⚡ ARMED — IT FIRES ON ITS OWN NOW
              </button>
              <div className="cd-cite">◈ when-then plans: d = 0.65 across 94 studies — the trigger fires the move before the debate starts</div>
            </>
          ) : (
            <div className="cd-done-line" style={{ textAlign: "left" }}>✓ armed · the trigger is loaded — no debate at the moment of contact</div>
          )
        ) : (
          <>
            <p className="cd-p cd-p--soft" style={{ margin: "0 0 10px" }}>
              No armed rules yet. Write a non-negotiable and arm it with a when-then — this step runs itself until you have one.
            </p>
            <button type="button" className="cd-daily-chip" onClick={() => onGoTab("identity")}>
              write a when-then rule → Identity
            </button>
          </>
        )}
      </StepCard>

      {/* 4 · THE CONTRACT */}
      <StepCard done={sealed} accent="255, 196, 107" label={`4 · THE CONTRACT — seal day ${day}`}>
        <DailyContract
          S={S}
          day={day}
          settings={settings}
          addXPSafe={addXPSafe}
          xpAmount={XP_VALUES.cleardayContract}
          onSigned={celebrate}
          onSlipPath={onSlipFlow}
        />
      </StepCard>

      {allDone && (
        <div className="cd-card cd-daily-complete">
          <div className="cd-daily-complete-sun">
            <ClearDaySun variant="emblem" />
          </div>
          <div className="cd-daily-complete-title">RITUAL COMPLETE</div>
          <div className="cd-daily-complete-sub">
            Day {day} sealed · {currentRun(S) || 1} in a row · every exhibit stays in the file
          </div>
        </div>
      )}
    </div>
  );
}

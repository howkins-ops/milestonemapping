import React, { useEffect, useRef } from "react";
import { castVote, castDailyRep, currentRun } from "./clearDayStore.js";
import { lessonFor, LADDER, TRACK_META } from "./clearDayData.js";
import ClearDaySun from "./ClearDaySun.jsx";
import DailyContract from "./DailyContract.jsx";
import cdFx from "./cdFx.js";
import { tapLight, tapMedium, buzzSuccess } from "../../lib/haptics.js";
import { sfxPop, sfxCoin, sfxPhoenix } from "../../lib/sfx.js";
import { XP_VALUES } from "../../lib/gamification.js";

/* ═══════════════════════════════════════════════════════════════
   THE DAILY RITUAL — say it, sign it, seal it.
   Fixed short ceremony, identical every day (ritual = perceived
   control, CLEARDAY-3-RESEARCH.md §2):
     1 · THE INCANTATION   speak the claim, 3 rounds, out loud
     2 · SIGN THE LAWS     one vote per front — weed and porn each
     3 · TODAY'S REP       the curriculum shortcut
     4 · THE CONTRACT      today-only, signed by hand, wax-sealed
   Every done-state derives from the store; nothing here has its
   own state to drift out of sync. Pulse and Ladder live on
   Identity — this screen only points at them when they're due.
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
  const lesson = lessonFor(day);
  const rung = LADDER.find((r) => r.id === S.rung) || LADDER[0];

  /* step completion — derived, never stored */
  const incantDone = S.ballot.some((b) => b.day === day && b.kind === "incant");
  const lawsDone = S.tracks.map((t) => S.ballot.some((b) => b.day === day && b.kind === "law" && b.track === t));
  const allLawsDone = lawsDone.length > 0 && lawsDone.every(Boolean);
  const repDone = S.curriculumDone.includes(day);
  const sealed = Boolean(S.closedDays[day]) || Boolean(S.contracts && S.contracts[day]);

  const lastPulse = S.pulses[S.pulses.length - 1];
  const pulseDue = day >= 7 && (!lastPulse || day - lastPulse.day >= 7);
  const claimableRung = LADDER.find((r) => {
    const reached = LADDER.findIndex((x) => x.id === S.rung) >= LADDER.findIndex((x) => x.id === r.id);
    return !reached && day >= r.minDay;
  });

  const steps = [incantDone, allLawsDone, repDone, sealed];
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
        <div className="cd-daily-rung">{rung.label.toUpperCase()}</div>
        <div className="cd-daily-dots" aria-label={`${doneCount} of ${steps.length} steps done`}>
          {steps.map((s, i) => (
            <span key={i} className={`cd-daily-dot ${s ? "cd-daily-dot--on" : ""}`} />
          ))}
        </div>
        {(pulseDue || claimableRung) && (
          <button type="button" className="cd-daily-chip" onClick={() => onGoTab("identity")}>
            {pulseDue ? "the weekly pulse is due" : "a rung is waiting"} → Identity
          </button>
        )}
      </div>

      {/* 1 · THE INCANTATION */}
      <StepCard done={incantDone} accent="255, 196, 107" label="1 · THE INCANTATION — say it until you believe it">
        <div className="cd-claim-text">{S.identity.statement}</div>
        {!incantDone ? (
          <button type="button" className="cd-btn cd-btn--incant" onClick={() => { tapMedium(); onIncant(); }}>
            🔊 SPEAK IT — 3 ROUNDS, OUT LOUD
          </button>
        ) : (
          <div className="cd-done-line" style={{ textAlign: "left" }}>✓ said until believed · your voice knows the words now</div>
        )}
      </StepCard>

      {/* 2 · SIGN THE LAWS — one per front */}
      <StepCard done={allLawsDone} label="2 · HOLD THE LAWS — one vote per front">
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
      </StepCard>

      {/* 3 · TODAY'S REP */}
      <StepCard done={repDone} label={`3 · TODAY'S REP — day ${lesson.day}`}>
        <div className="cd-vote-meaning">{lesson.vote}</div>
        <div className="cd-vote-action">→ {lesson.action}</div>
        {!repDone ? (
          <>
            <button type="button" className="cd-btn cd-btn--rep" onClick={(e) => {
              const { firstTime } = castDailyRep(day, lesson.vote);
              if (firstTime) {
                addXPSafe(XP_VALUES.cleardayDailyRep, "CLEARDAY rep");
                cdFx.burstFrom(e, "spark", 14);
                tapMedium();
                sfxCoin(settings);
                celebrate();
              }
            }}>
              ✓ REP DONE — CAST THE VOTE
            </button>
            <button type="button" className="cd-ghost" onClick={() => onGoTab("today")}>
              read the full lesson → Today
            </button>
          </>
        ) : (
          <div className="cd-done-line" style={{ textAlign: "left" }}>✓ vote cast · +1 evidence</div>
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
            Day {day} sealed · {currentRun(S) || 1} in a row · every vote stays on the ballot
          </div>
        </div>
      )}
    </div>
  );
}

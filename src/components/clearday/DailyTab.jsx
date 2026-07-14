import React, { useEffect, useMemo, useRef } from "react";
import {
  castVote, castDailyRep, closeOutDay, addPulse, currentRun,
} from "./clearDayStore.js";
import { lessonFor, LADDER } from "./clearDayData.js";
import ClearDaySun from "./ClearDaySun.jsx";
import cdFx from "./cdFx.js";
import { tapLight, tapMedium, buzzSuccess } from "../../lib/haptics.js";
import { sfxPop, sfxCoin, sfxPhoenix } from "../../lib/sfx.js";
import { XP_VALUES } from "../../lib/gamification.js";

/* ═══════════════════════════════════════════════════════════════
   THE DAILY RITUAL — the identity builder, 60 seconds a day.
   A checklist lens over the same store actions Today uses: speak
   the Claim, cast the rep, take the pulse when it's due, close the
   day. Everything reads existing store fields; nothing here has
   its own state to drift out of sync. The heavy versions of these
   moves (full lesson, slip flow, rung upgrades) stay single-homed
   on their own tabs — this screen links to them.
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

export default function DailyTab({ S, day, settings, celebrate, addXPSafe, onGoTab }) {
  const lesson = lessonFor(day);
  const rung = LADDER.find((r) => r.id === S.rung) || LADDER[0];

  /* step completion — derived, never stored */
  const claimDone = S.ballot.some((b) => b.day === day && b.kind === "identity");
  const repDone = S.curriculumDone.includes(day);
  const lastPulse = S.pulses[S.pulses.length - 1];
  const pulseDue = day >= 7 && (!lastPulse || day - lastPulse.day >= 7);
  const pulseDone = Boolean(lastPulse && day - lastPulse.day < 7);
  const pulseApplicable = day >= 7;
  const closed = Boolean(S.closedDays[day]);

  const claimableRung = LADDER.find((r) => {
    const reached = LADDER.findIndex((x) => x.id === S.rung) >= LADDER.findIndex((x) => x.id === r.id);
    return !reached && day >= r.minDay;
  });

  const steps = useMemo(() => {
    const list = [claimDone, repDone];
    if (pulseApplicable) list.push(pulseDone || (!pulseDue && S.pulses.length > 0));
    list.push(closed);
    return list;
  }, [claimDone, repDone, pulseApplicable, pulseDone, pulseDue, S.pulses.length, closed]);
  const doneCount = steps.filter(Boolean).length;
  const allDone = doneCount === steps.length;

  /* ritual-complete moment — fires only on the crossing, never on mount */
  const prevDone = useRef(doneCount);
  useEffect(() => {
    if (doneCount === steps.length && prevDone.current < steps.length) {
      cdFx.sunrise();
      buzzSuccess();
      sfxPhoenix(settings);
    }
    prevDone.current = doneCount;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneCount, steps.length]);

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
      </div>

      <StepCard done={claimDone} label="1 · SPEAK THE CLAIM — out loud, like you mean it">
        <div className="cd-claim-text">{S.identity.statement}</div>
        {!claimDone ? (
          <button type="button" className="cd-btn" onClick={(e) => {
            castVote("identity", `Spoke the claim out loud — day ${day}.`);
            cdFx.burstFrom(e, "ember", 12, "#5e9df0");
            cdFx.ringFrom(e, "#5e9df0");
            tapLight();
            sfxPop(settings);
            celebrate();
          }}>
            SAID IT — CAST THE VOTE
          </button>
        ) : (
          <button type="button" className="cd-ghost" onClick={(e) => {
            castVote("identity", "Lived the claim again — extra evidence.");
            cdFx.ringFrom(e, "#5e9df0");
            sfxPop(settings);
          }}>
            cast another — the ledger only fills
          </button>
        )}
      </StepCard>

      <StepCard done={repDone} label={`2 · TODAY'S REP — day ${lesson.day}`}>
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
          <div className="cd-done-line">✓ vote cast · +1 evidence</div>
        )}
      </StepCard>

      {pulseApplicable && (pulseDue ? (
        <StepCard done={false} accent="79, 209, 197" label="3 · THE WEEKLY PULSE — one honest tap">
          <div className="cd-pulse-q">Right now, which is truer?</div>
          {[
            { v: "clear", label: "I'm someone who doesn't do this anymore" },
            { v: "mostly", label: "I'm mostly that man" },
            { v: "holding", label: "I'm still holding the door shut" },
          ].map((opt) => (
            <button key={opt.v} type="button" className="cd-pulse-opt" onClick={(e) => {
              addPulse(opt.v);
              if (opt.v === "holding") {
                castVote("identity", "Answered the pulse honestly — and honesty is a clear-man move too.");
              }
              cdFx.ringFrom(e, "#4fd1c5");
              tapLight();
              sfxPop(settings);
            }}>{opt.label}</button>
          ))}
        </StepCard>
      ) : (
        <StepCard done={pulseDone || S.pulses.length > 0} accent="79, 209, 197" label="3 · THE WEEKLY PULSE">
          <div className="cd-done-line" style={{ textAlign: "left", marginTop: 0 }}>
            {pulseDone ? "✓ taken this week — next one when it's due" : "first pulse lands on day 7"}
          </div>
        </StepCard>
      ))}

      <StepCard done={false} label="THE LADDER — it only goes up">
        <div className="cd-daily-ladder">
          {LADDER.map((r) => {
            const reached = LADDER.findIndex((x) => x.id === S.rung) >= LADDER.findIndex((x) => x.id === r.id);
            return (
              <span key={r.id} className={`cd-daily-rung-chip ${reached ? "cd-daily-rung-chip--on" : ""}`}>
                {r.label}
              </span>
            );
          })}
        </div>
        {claimableRung && (
          <button type="button" className="cd-btn cd-btn--sm" onClick={() => onGoTab("identity")}>
            A RUNG IS WAITING →
          </button>
        )}
      </StepCard>

      <StepCard done={closed} label={`${pulseApplicable ? "4" : "3"} · CLOSE DAY ${day} — honest is the only mode`}>
        {!closed ? (
          <>
            <button type="button" className="cd-btn" onClick={() => {
              const { firstTime } = closeOutDay("clear");
              if (firstTime) {
                addXPSafe(XP_VALUES.cleardayClearDay, "Clear day");
                cdFx.sunrise();
                buzzSuccess();
                sfxPhoenix(settings);
                celebrate();
              }
            }}>
              A CLEAR DAY
            </button>
            <button type="button" className="cd-slip-link" onClick={() => onGoTab("today")}>
              It slipped — the comeback lives on Today
            </button>
          </>
        ) : (
          <div className="cd-done-line" style={{ textAlign: "left", marginTop: 0 }}>
            {S.closedDays[day] === "clear"
              ? `✓ closed clear · ${currentRun(S) || 1} in a row`
              : "logged honestly — and you're already back"}
          </div>
        )}
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

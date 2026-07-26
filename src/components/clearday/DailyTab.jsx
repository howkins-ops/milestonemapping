import React, { useEffect, useRef, useState } from "react";
import { castVote, currentRun } from "./clearDayStore.js";
import { LADDER, TRACK_META, standFor, NIGHT, isNightShift } from "./clearDayData.js";
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

function StepCard({ done, accent, label, art, artAlt = "", children }) {
  return (
    <div
      className={`cd-card cd-daily-step ${done ? "cd-daily-step--done" : ""}`}
      style={accent ? { "--cd-acc": accent } : undefined}
    >
      {art && <img className="cd-step-art" src={art} alt={artAlt} loading="lazy" />}
      <div className="cd-daily-step-head">
        <h2 className="cd-step-title">{label}</h2>
        {done && <span className="cd-daily-check" aria-hidden="true">✓</span>}
      </div>
      {children}
    </div>
  );
}

/* One line, not a full card — the point of the accordion. Only the
   current step gets the full StepCard treatment; everything else,
   done or not-yet, collapses so the page never shows 5 things at once. */
function CollapsedStep({ n, label, done, onOpen }) {
  return (
    <button
      type="button"
      className={`cd-daily-collapsed ${done ? "cd-daily-collapsed--done" : ""}`}
      onClick={onOpen}
    >
      <span className="cd-daily-collapsed-mark">{done ? "✓" : n}</span>
      <span className="cd-daily-collapsed-label">{label}</span>
      {!done && <span className="cd-daily-collapsed-chev" aria-hidden="true">›</span>}
    </button>
  );
}

export default function DailyTab({ S, day, settings, celebrate, addXPSafe, onGoTab, onIncant, onSlipFlow, onLedger, onSealed }) {
  const stand = standFor(day);
  const night = isNightShift(new Date().getHours());

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

  const ledgerDone = S.ballot.some((b) => b.day === day && b.kind === "ledger");

  const steps = [incantDone, allLawsDone, armStepDone, ledgerDone, sealed];
  const doneCount = steps.filter(Boolean).length;
  const allDone = doneCount === steps.length;

  // Accordion: only ONE step is ever fully expanded — the first undone one,
  // unless the user taps a collapsed row to peek at something else. Tapping
  // the active card's own row (if re-shown) or advancing a step resets to
  // "follow the first undone step" by clearing the manual override.
  const [openIdx, setOpenIdx] = useState(null);
  const firstUndone = steps.findIndex((s) => !s);
  const shownIdx = openIdx !== null ? openIdx : firstUndone;
  useEffect(() => { setOpenIdx(null); }, [doneCount]);

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
        <div className="cd-eyebrow">DAY {day} · YOUR NIGHTLY CEREMONY</div>
        <h1 className="cd-daily-title">Seal the day.<br /><span>Own the night.</span></h1>
        <p className="cd-daily-sub">Five deliberate moves. One clear tomorrow.</p>
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
      {shownIdx === 0 ? (
        <StepCard done={incantDone} accent="255, 196, 107" art="/assets/clearday/devotion-line-v3.webp" label="1 · SPEAK — say it until you believe it">
          <div className="cd-vote-meaning">TODAY'S STAND · “{stand}”</div>
          {!incantDone ? (
            <>
              <button type="button" className="cd-btn cd-btn--incant" onClick={() => { tapMedium(); onIncant(); }}>
                SPEAK IT — 3 ROUNDS, OUT LOUD
              </button>
              <div className="cd-cite">◈ spoken words encode deeper than read ones — the claim + today's stand, whisper to roar</div>
            </>
          ) : (
            <div className="cd-done-line" style={{ textAlign: "left" }}>✓ said until believed · your voice knows the words now</div>
          )}
        </StepCard>
      ) : (
        <CollapsedStep n={1} label="Speak it into existence" done={incantDone} onOpen={() => setOpenIdx(0)} />
      )}

      {/* 2 · HOLD THE LAWS — the ONLY place laws are held */}
      {shownIdx === 1 ? (
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
      ) : (
        <CollapsedStep n={2} label="Hold the laws" done={allLawsDone} onOpen={() => setOpenIdx(1)} />
      )}

      {/* 3 · ARM THE NIGHT — rehearse one armed when-then rule */}
      {shownIdx === 2 ? (
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
                  ARMED — IT FIRES ON ITS OWN NOW
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
      ) : (
        <CollapsedStep n={3} label="Arm the night" done={armStepDone} onOpen={() => setOpenIdx(2)} />
      )}

      {/* 4 · SETTLE THE LEDGER — burn tonight's fuel before the Mask can */}
      {shownIdx === 3 ? (
        <StepCard done={ledgerDone} accent="255, 122, 56" art="/assets/clearday/night-ledger-v3.webp" label="4 · SETTLE THE LEDGER — burn tonight's fuel">
          {!ledgerDone ? (
            <>
              <p className="cd-p cd-p--soft" style={{ margin: "0 0 10px" }}>
                The urge at 11pm runs on fuel from 2pm. Name what today left in you, own your part,
                burn it — or sweep clean if you're carrying nothing. Sixty seconds.
              </p>
              <button type="button" className="cd-btn cd-btn--rep" onClick={() => { tapMedium(); onLedger(); }}>
                OPEN THE LEDGER
              </button>
              <div className="cd-cite">◈ negative affect is the top relapse trigger — and it detonates hours late, in the evening window. Settle it nightly and the debt never compounds.</div>
            </>
          ) : (
            <div className="cd-done-line" style={{ textAlign: "left" }}>✓ settled · the night has nothing to work with</div>
          )}
        </StepCard>
      ) : (
        <CollapsedStep n={4} label="Settle the ledger" done={ledgerDone} onOpen={() => setOpenIdx(3)} />
      )}

      {/* 5 · THE CONTRACT */}
      {shownIdx === 4 ? (
        <StepCard done={sealed} accent="255, 196, 107" art="/assets/clearday/electric-dawn.webp" label={`5 · THE CONTRACT — seal day ${day}`}>
          <DailyContract
            S={S}
            day={day}
            settings={settings}
            addXPSafe={addXPSafe}
            xpAmount={XP_VALUES.cleardayContract}
            /* The ignition IS the celebration now — running both would put two
               full-screen overlays on top of each other, and a flame landing on
               the calendar says more than a confetti card ever did. */
            onSigned={({ firstTime }) => { if (firstTime && onSealed) onSealed(); else celebrate(); }}
            onSlipPath={onSlipFlow}
          />
        </StepCard>
      ) : (
        <CollapsedStep n={5} label="Sign the contract" done={sealed} onOpen={() => setOpenIdx(4)} />
      )}

      {allDone && (
        <div className="cd-card cd-daily-complete">
          <div className="cd-daily-complete-sun">
            <ClearDaySun variant="emblem" />
          </div>
          <div className="cd-daily-complete-title">RITUAL COMPLETE</div>
          <div className="cd-daily-complete-sub">
            Day {day} sealed · {currentRun(S) || 1} in a row · every exhibit stays in the file
          </div>
          {night && (
            <div className="cd-lastrep">
              <div className="cd-lastrep-title">☾ THE LAST REP HAPPENS OFF-SCREEN</div>
              <p className="cd-lastrep-text">
                Walk the phone to the kitchen. Plug it in there. That's not willpower — that's the
                law, and it's the strongest move in this entire app.
              </p>
              <button
                type="button"
                className="cd-lastrep-grey"
                onClick={() => {
                  tapMedium();
                  try { window.location.href = "shortcuts://run-shortcut?name=Go%20Grey"; } catch { /* no-op */ }
                }}
              >
                ◐ GO GREY — kill the color
              </button>
              <div className="cd-lastrep-hint">
                one-time setup: Shortcuts app → + → "Set Color Filters · Turn On" → name it <strong>Go Grey</strong>.
                (Triple-click the side button works too.) Grayscale after {NIGHT.CURFEW_H - 1}pm cuts screen
                time 20–38 min/day in trials.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

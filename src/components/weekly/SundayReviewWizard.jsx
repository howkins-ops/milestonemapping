import React, { useState, useMemo, useRef, useLayoutEffect, useEffect } from "react";
import { createPortal } from "react-dom";
import AccountabilityCheckpoint from "./AccountabilityCheckpoint.jsx";
import {
  CompassRose,
  StepSigil,
  FlameMark,
  BoltMark,
  CheckMark,
  CloseMark,
  ChevronMark,
  FrontTerrain
} from "./strategyArt.jsx";
import { frontTone, openFronts } from "./MilestoneReviewCards.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { useMilestones } from "../../hooks/useMilestones.js";
import { parseCommitments, computeReviewStreak, computeCommitmentStreak } from "../../lib/utils.js";
import { getScorecardLabel } from "../../lib/constants.js";
import { getCurrentWeekNumber } from "../../lib/dates.js";
import { getMilestoneProgress, getNextIncompleteAction } from "../../lib/progress.js";
import "./SundayReviewWizard.css";

/* ════════════════════════════════════════════════════════════════════
   SUNDAY REVIEW — seven screens, seven drawn identities.

   Every screen used to open with the same anonymous kicker-and-title
   stack; only the words changed. Now each one arrives with its own sigil
   and its own accent, so the flow has landmarks: the rose means you're at
   the door, the wax seal means you're writing orders, the mast means
   you're about to transmit. Nothing here is an emoji.
   ════════════════════════════════════════════════════════════════════ */

const EMPTY = {
  biggestWin: "",
  avoided: "",
  lesson: "",
  milestoneMovedMost: "",
  milestoneNeedsAttention: "",
  nextWeekActions: "",
  rewardChasing: "",
  executionScore: 5,
  energyScore: 5,
  focusScore: 5,
  disciplineScore: 5,
  mindsetScore: 5,
  notes: ""
};

const STEPS = [
  { id: "ignite", label: "Ignition", tone: "#00F0FF" },
  {
    id: "receipts",
    label: "Receipts",
    tone: "#FF3EDB",
    kicker: "Accountability checkpoint",
    title: "What You Promised",
    sub: "Last Sunday you signed for these. Check what you kept — or own what you didn't."
  },
  {
    id: "reflect",
    label: "Debrief",
    tone: "#D11EFF",
    kicker: "Debrief",
    title: "Read the Week Back",
    sub: "No spin. The truth is the raw material."
  },
  {
    id: "battle",
    label: "Fronts",
    tone: "#00FFBF",
    kicker: "Battlefield report",
    title: "Where the Ground Is",
    sub: "Name the front that advanced — and the one that's slipping."
  },
  {
    id: "orders",
    label: "Orders",
    tone: "#FFD166",
    kicker: "Next week's orders",
    title: "Set the Coordinates",
    sub: "One commitment per line. You'll be held to every one."
  },
  {
    id: "score",
    label: "Scorecard",
    tone: "#00F0FF",
    kicker: "Weekly scorecard",
    title: "Rate the Week",
    sub: "Move the bars. The ring answers."
  },
  {
    id: "lock",
    label: "Transmit",
    tone: "#00FFBF",
    kicker: "Final transmission",
    title: "Lock It In",
    sub: "Confirm the debrief. On transmit, the map updates."
  }
];

const SLIDERS = [
  { key: "executionScore", label: "Execution", color: "#00F0FF" },
  { key: "energyScore", label: "Energy", color: "#00FFBF" },
  { key: "focusScore", label: "Focus", color: "#FFD166" },
  { key: "disciplineScore", label: "Discipline", color: "#FF8A3D" },
  { key: "mindsetScore", label: "Faith / Mindset", color: "#FF3EDB" }
];

const BAND_COLOR = (total) =>
  total >= 46 ? "#00FFBF" : total >= 36 ? "#00F0FF" : total >= 26 ? "#FFD166" : total >= 16 ? "#FF8A3D" : "#FF3EDB";

/* ── progress constellation ──────────────────────────────────────── */
function ProgressRail({ step, maxStep, onJump }) {
  const pct = (step / (STEPS.length - 1)) * 100;
  return (
    <div className="swiz-rail" role="navigation" aria-label="Review progress">
      <div className="swiz-rail__track">
        <div className="swiz-rail__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="swiz-rail__nodes">
        {STEPS.map((s, i) => {
          const state = i < step ? "done" : i === step ? "active" : "todo";
          const reachable = i <= maxStep;
          return (
            <button
              key={s.id}
              type="button"
              className={`swiz-node swiz-node--${state}`}
              disabled={!reachable}
              onClick={() => reachable && onJump(i)}
              aria-label={s.label}
              aria-current={i === step ? "step" : undefined}
            >
              <span className="swiz-node__dot">
                {i < step ? (
                  <span className="swiz-node__check" aria-hidden="true">
                    <CheckMark />
                  </span>
                ) : (
                  i + 1
                )}
              </span>
              <span className="swiz-node__label">{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── live scorecard ring ─────────────────────────────────────────── */
function ScoreRing({ total }) {
  const r = 78;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - total / 50);
  const color = BAND_COLOR(total);
  const ticks = Array.from({ length: 25 }, (_, i) => i * 14.4);

  return (
    <div className="swiz-ring">
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <g className="swiz-ring__ticks">
          {ticks.map((deg, i) => {
            const rad = ((deg - 90) * Math.PI) / 180;
            const long = i % 5 === 0;
            const r1 = long ? 60 : 63;
            return (
              <line
                key={deg}
                x1={100 + Math.cos(rad) * r1}
                y1={100 + Math.sin(rad) * r1}
                x2={100 + Math.cos(rad) * 66}
                y2={100 + Math.sin(rad) * 66}
                strokeWidth={long ? 2 : 1}
              />
            );
          })}
        </g>
        <circle cx="100" cy="100" r={r} className="swiz-ring__bg" />
        <circle
          cx="100"
          cy="100"
          r={r}
          className="swiz-ring__bar"
          stroke={color}
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(0 0 10px ${color})` }}
        />
      </svg>
      <div className="swiz-ring__center">
        <span className="swiz-ring__num" style={{ color, textShadow: `0 0 20px ${color}` }}>
          {total}
        </span>
        <span className="swiz-ring__den">/ 50</span>
        <span className="swiz-ring__band" style={{ color }}>
          {getScorecardLabel(total)}
        </span>
      </div>
    </div>
  );
}

/* ── step chrome ─────────────────────────────────────────────────── */
function StepHead({ index }) {
  const s = STEPS[index];
  return (
    <div className="swiz-head" style={{ "--tone": s.tone }}>
      <div className="swiz-head__band">
        <span className="swiz-head__sigil" aria-hidden="true">
          <StepSigil kind={s.id} tone={s.tone} />
        </span>
        <span className="swiz-head__col">
          <span className="swiz-head__kicker">{s.kicker}</span>
          <span className="swiz-head__count">
            Step {String(index + 1).padStart(2, "0")} of {String(STEPS.length).padStart(2, "0")}
          </span>
        </span>
      </div>
      <h2 className="swiz-title">{s.title}</h2>
      {s.sub && <p className="swiz-sub">{s.sub}</p>}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, rows = 3, autoFocus }) {
  return (
    <label className="swiz-field">
      <span className="swiz-field__label">{label}</span>
      <textarea
        className="swiz-input"
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
      />
    </label>
  );
}

export default function SundayReviewWizard({ onClose }) {
  const { saveWeeklyReview, weeklyReviews } = useAppData();
  const { milestones } = useMilestones();
  const active = useMemo(() => openFronts(milestones), [milestones]);

  const [form, setForm] = useState(EMPTY);
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [transmitting, setTransmitting] = useState(false);
  const scrollRef = useRef(null);

  const lastReview = weeklyReviews.length > 0 ? weeklyReviews[0] : null;
  const [commitmentChecks, setCommitmentChecks] = useState(() =>
    (lastReview?.commitments || []).map((text) => ({ text, done: false }))
  );

  const reviewStreak = useMemo(() => computeReviewStreak(weeklyReviews), [weeklyReviews]);
  const commitmentStreak = useMemo(() => computeCommitmentStreak(weeklyReviews), [weeklyReviews]);
  const weekNo = getCurrentWeekNumber();

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setScore = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const milestoneOptions = [
    { value: "", label: "— Select milestone —" },
    ...milestones.map((m) => ({ value: m.title, label: m.title }))
  ];

  const total = SLIDERS.reduce((s, sd) => s + (Number(form[sd.key]) || 0), 0);
  const commitCount = parseCommitments(form.nextWeekActions).length;

  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [step]);

  // Lock the underlying page scroll while the full-screen wizard is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const go = (n) => {
    if (n < 0 || n > STEPS.length - 1) return;
    setDir(n > step ? 1 : -1);
    setStep(n);
    setMaxStep((m) => Math.max(m, n));
  };

  const submit = () => {
    if (transmitting) return;
    setTransmitting(true);
    window.setTimeout(() => {
      const commitments = parseCommitments(form.nextWeekActions);
      saveWeeklyReview({ ...form, commitments, lastWeekChecks: commitmentChecks });
      onClose?.();
    }, 1150);
  };

  const isLast = step === STEPS.length - 1;

  /* ── step bodies ───────────────────────────────────────────────── */
  function renderStep() {
    const s = STEPS[step].id;

    if (s === "ignite") {
      return (
        <div className="swiz-ignite">
          <div className="swiz-ignite__crest" aria-hidden="true">
            <span className="swiz-ignite__ring" />
            <span className="swiz-ignite__ring swiz-ignite__ring--2" />
            <CompassRose />
          </div>
          <div className="swiz-ignite__kicker">Strategy Room · Week {weekNo}</div>
          <h1 className="swiz-ignite__title">SUNDAY REVIEW</h1>
          <p className="swiz-ignite__sub">
            Seven screens. Total honesty. Then you reload for the next mission.
          </p>
          <div className="swiz-ignite__streaks">
            <div className="swiz-streak">
              <span className="swiz-streak__art" aria-hidden="true">
                <FlameMark tone={reviewStreak > 0 ? "fire" : "dead"} />
              </span>
              <span className="swiz-streak__num" style={{ color: reviewStreak > 0 ? "#00FFBF" : "#6D6688" }}>
                {reviewStreak}
              </span>
              <span className="swiz-streak__label">Weeks reviewed</span>
            </div>
            <div className="swiz-streak">
              <span className="swiz-streak__art" aria-hidden="true">
                <BoltMark tone={commitmentStreak > 0 ? "#FFD166" : "#4E4868"} />
              </span>
              <span className="swiz-streak__num" style={{ color: commitmentStreak > 0 ? "#00FFBF" : "#6D6688" }}>
                {commitmentStreak}
              </span>
              <span className="swiz-streak__label">Weeks kept</span>
            </div>
          </div>
        </div>
      );
    }

    if (s === "receipts") {
      return (
        <div className="swiz-body-stack">
          <StepHead index={step} />
          <AccountabilityCheckpoint
            lastReview={lastReview}
            checks={commitmentChecks}
            onChange={setCommitmentChecks}
          />
        </div>
      );
    }

    if (s === "reflect") {
      return (
        <div className="swiz-body-stack">
          <StepHead index={step} />
          <div className="stagger swiz-fields">
            <Field
              label="1. What was your biggest win this week?"
              rows={3}
              value={form.biggestWin}
              onChange={set("biggestWin")}
              autoFocus
              placeholder="The thing you're proud of…"
            />
            <Field
              label="2. What did you avoid?"
              rows={3}
              value={form.avoided}
              onChange={set("avoided")}
              placeholder="The thing you kept dodging…"
            />
            <Field
              label="3. What did this week teach you?"
              rows={3}
              value={form.lesson}
              onChange={set("lesson")}
              placeholder="The lesson, in one line…"
            />
          </div>
        </div>
      );
    }

    if (s === "battle") {
      return (
        <div className="swiz-body-stack">
          <StepHead index={step} />
          {active.length > 0 && (
            <div className="swiz-battle">
              {active.slice(0, 6).map((m) => {
                const next = getNextIncompleteAction(m);
                const prog = getMilestoneProgress(m);
                const tone = frontTone(prog);
                return (
                  <div key={m.id} className="swiz-battle__card">
                    <span className="swiz-battle__art" aria-hidden="true">
                      <FrontTerrain seed={m.id || m.title} pct={prog} tone={tone} />
                    </span>
                    <span className="swiz-battle__scrim" aria-hidden="true" />
                    <div className="swiz-battle__body">
                      <div className="swiz-battle__row">
                        <span className="swiz-battle__title">{m.title}</span>
                        <span className="swiz-battle__pct" style={{ color: tone }}>
                          {prog}%
                        </span>
                      </div>
                      <p className="swiz-battle__next">{next ? next.text : "Ready to unlock"}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="swiz-fields">
            <label className="swiz-field">
              <span className="swiz-field__label" style={{ color: "#00FFBF" }}>
                4. Which milestone moved forward the most?
              </span>
              <select className="swiz-select" value={form.milestoneMovedMost} onChange={set("milestoneMovedMost")}>
                {milestoneOptions.map((o) => (
                  <option key={`m-${o.value}`} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="swiz-field">
              <span className="swiz-field__label" style={{ color: "#FF8A3D" }}>
                5. Which milestone needs attention?
              </span>
              <select
                className="swiz-select"
                value={form.milestoneNeedsAttention}
                onChange={set("milestoneNeedsAttention")}
              >
                {milestoneOptions.map((o) => (
                  <option key={`a-${o.value}`} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      );
    }

    if (s === "orders") {
      return (
        <div className="swiz-body-stack">
          <StepHead index={step} />
          <div className="swiz-fields">
            <label className="swiz-field">
              <span className="swiz-field__label">6. Commitments for next week</span>
              <textarea
                className="swiz-input"
                rows={5}
                value={form.nextWeekActions}
                onChange={set("nextWeekActions")}
                placeholder={"Close the deal\nExercise 4 times\nRead 30 pages"}
                autoFocus
              />
              <span className={`swiz-field__hint${commitCount > 0 ? " is-armed" : ""}`}>
                {commitCount > 0 && (
                  <span className="swiz-field__hintart" aria-hidden="true">
                    <BoltMark />
                  </span>
                )}
                {commitCount > 0
                  ? `${commitCount} commitment${commitCount > 1 ? "s" : ""} locked — these become next Sunday's receipts.`
                  : "Each line becomes a receipt you check off next Sunday."}
              </span>
            </label>
            <Field
              label="7. What reward are you chasing next?"
              rows={2}
              value={form.rewardChasing}
              onChange={set("rewardChasing")}
              placeholder="The thing that makes the grind worth it…"
            />
          </div>
        </div>
      );
    }

    if (s === "score") {
      return (
        <div className="swiz-body-stack">
          <StepHead index={step} />
          <ScoreRing total={total} />
          <div className="swiz-sliders">
            {SLIDERS.map((sd) => (
              <div key={sd.key} className="swiz-slider" style={{ "--sc": sd.color }}>
                <div className="swiz-slider__row">
                  <span className="swiz-slider__label">{sd.label}</span>
                  <span className="swiz-slider__val" style={{ color: sd.color }}>
                    {form[sd.key]}/10
                  </span>
                </div>
                <input
                  className="range swiz-range"
                  type="range"
                  min="1"
                  max="10"
                  value={form[sd.key]}
                  onChange={(e) => setScore(sd.key, Number(e.target.value))}
                  style={{ accentColor: sd.color }}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // lock
    const bandColor = BAND_COLOR(total);
    return (
      <div className="swiz-body-stack swiz-lock">
        <StepHead index={step} />
        <div className="swiz-recap">
          <div className="swiz-recap__stat">
            <span className="swiz-recap__num" style={{ color: bandColor }}>
              {total}
              <small>/50</small>
            </span>
            <span className="swiz-recap__label">{getScorecardLabel(total)}</span>
          </div>
          <div className="swiz-recap__stat">
            <span className="swiz-recap__num" style={{ color: "#00F0FF" }}>
              {commitCount}
            </span>
            <span className="swiz-recap__label">Commitments set</span>
          </div>
          <div className="swiz-recap__stat">
            <span className="swiz-recap__num" style={{ color: "#FFD166" }}>
              +150
            </span>
            <span className="swiz-recap__label">XP on transmit</span>
          </div>
        </div>
        <Field
          label="Field notes (optional)"
          rows={2}
          value={form.notes}
          onChange={set("notes")}
          placeholder="Anything the questions missed…"
        />
      </div>
    );
  }

  return createPortal(
    <div className="swiz-overlay" role="dialog" aria-modal="true" aria-label="Sunday Review">
      <div className="swiz-bg" aria-hidden="true">
        <div className="swiz-bg__grid" />
        <div className="swiz-bg__glow swiz-bg__glow--a" />
        <div className="swiz-bg__glow swiz-bg__glow--b" />
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="swiz-particle"
            style={{
              left: `${(i * 37) % 100}%`,
              animationDelay: `${(i % 7) * 0.9}s`,
              animationDuration: `${9 + (i % 5) * 2}s`
            }}
          />
        ))}
      </div>

      <header className="swiz-top">
        <button type="button" className="swiz-close" onClick={onClose} aria-label="Close review">
          <CloseMark />
        </button>
        <ProgressRail step={step} maxStep={maxStep} onJump={go} />
      </header>

      <div className="swiz-scroll" ref={scrollRef}>
        <div key={step} className={`swiz-step swiz-step--in-${dir > 0 ? "right" : "left"}`}>
          {renderStep()}
        </div>
      </div>

      <footer className="swiz-nav">
        <div className="swiz-nav__inner">
          {step > 0 ? (
            <button type="button" className="swiz-btn swiz-btn--ghost" onClick={() => go(step - 1)}>
              <span className="swiz-btn__chev" aria-hidden="true">
                <ChevronMark dir="left" />
              </span>
              Back
            </button>
          ) : (
            <button type="button" className="swiz-btn swiz-btn--ghost" onClick={onClose}>
              Exit
            </button>
          )}

          {isLast ? (
            <button
              type="button"
              className={`swiz-btn swiz-btn--lock ${transmitting ? "is-transmitting" : ""}`}
              onClick={submit}
              disabled={transmitting}
            >
              <span className="swiz-btn__art" aria-hidden="true">
                <BoltMark tone="#00FFBF" />
              </span>
              {transmitting ? "Transmitting…" : "Transmit review"}
            </button>
          ) : (
            <button type="button" className="swiz-btn swiz-btn--primary" onClick={() => go(step + 1)}>
              {step === 0 ? "Begin debrief" : "Next"}
              <span className="swiz-btn__chev" aria-hidden="true">
                <ChevronMark />
              </span>
            </button>
          )}
        </div>
      </footer>

      {transmitting && (
        <div className="swiz-transmit" aria-hidden="true">
          <div className="swiz-transmit__scan" />
          <div className="swiz-transmit__mast">
            <StepSigil kind="lock" tone="#00F0FF" />
          </div>
          <div className="swiz-transmit__text">Updating the map…</div>
        </div>
      )}
    </div>,
    document.body
  );
}

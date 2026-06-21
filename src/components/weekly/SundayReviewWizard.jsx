import React, { useState, useMemo, useRef, useLayoutEffect, useEffect } from "react";
import { createPortal } from "react-dom";
import AccountabilityCheckpoint from "./AccountabilityCheckpoint.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { useMilestones } from "../../hooks/useMilestones.js";
import { parseCommitments, computeReviewStreak, computeCommitmentStreak } from "../../lib/utils.js";
import { getScorecardLabel } from "../../lib/constants.js";
import { getCurrentWeekNumber } from "../../lib/dates.js";
import { getMilestoneProgress, getNextIncompleteAction } from "../../lib/progress.js";
import "./SundayReviewWizard.css";

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
  { id: "ignite", label: "Ignition" },
  { id: "receipts", label: "Receipts" },
  { id: "reflect", label: "Reflect" },
  { id: "battle", label: "Battlefield" },
  { id: "orders", label: "Orders" },
  { id: "score", label: "Scorecard" },
  { id: "lock", label: "Lock In" }
];

const SLIDERS = [
  { key: "executionScore", label: "Execution", color: "#00F0FF" },
  { key: "energyScore", label: "Energy", color: "#00FFBF" },
  { key: "focusScore", label: "Focus", color: "#FACC15" },
  { key: "disciplineScore", label: "Discipline", color: "#FF8A3D" },
  { key: "mindsetScore", label: "Faith / Mindset", color: "#FF3EDB" }
];

const BAND_COLOR = (total) =>
  total >= 46 ? "#00FFBF"
  : total >= 36 ? "#00F0FF"
  : total >= 26 ? "#FACC15"
  : total >= 16 ? "#FF8A3D"
  : "#FF3EDB";

/* ── Glowing progress constellation ──────────────────────────────── */
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
              <span className="swiz-node__dot">{i < step ? "✓" : i + 1}</span>
              <span className="swiz-node__label">{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Animated live scorecard ring ────────────────────────────────── */
function ScoreRing({ total }) {
  const r = 78;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - total / 50);
  const color = BAND_COLOR(total);
  return (
    <div className="swiz-ring">
      <svg viewBox="0 0 200 200" aria-hidden="true">
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
        <span className="swiz-ring__band" style={{ color }}>{getScorecardLabel(total)}</span>
      </div>
    </div>
  );
}

/* ── Step chrome ─────────────────────────────────────────────────── */
function StepHead({ index, kicker, title, sub }) {
  return (
    <div className="swiz-head">
      <div className="swiz-head__top">
        <span className="swiz-head__count">{String(index + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}</span>
        <span className="swiz-head__kicker anim-transmission">{kicker}</span>
      </div>
      <h2 className="swiz-title">{title}</h2>
      {sub && <p className="swiz-sub">{sub}</p>}
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
  const { milestones, active } = useMilestones();

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
    return () => { document.body.style.overflow = prev; };
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

  /* ── Step bodies ───────────────────────────────────────────────── */
  function renderStep() {
    const s = STEPS[step].id;

    if (s === "ignite") {
      return (
        <div className="swiz-ignite">
          <div className="swiz-ignite__glyph" aria-hidden="true">
            <span className="swiz-ignite__ring" />
            <span className="swiz-ignite__ring swiz-ignite__ring--2" />
            <span className="swiz-ignite__icon">🧭</span>
          </div>
          <div className="swiz-ignite__kicker anim-transmission">STRATEGY ROOM · WEEK {weekNo}</div>
          <h1 className="swiz-ignite__title">SUNDAY REVIEW</h1>
          <p className="swiz-ignite__sub">
            The week is not over until the lesson is captured.
            Seven screens. Total honesty. Then you reload for the next mission.
          </p>
          <div className="swiz-ignite__streaks">
            <div className="swiz-streak">
              <span className="swiz-streak__icon">🔥</span>
              <span className="swiz-streak__num" style={{ color: reviewStreak > 0 ? "#00FFBF" : "#9CA3AF" }}>
                {reviewStreak > 0 ? reviewStreak : "0"}
              </span>
              <span className="swiz-streak__label">Review streak</span>
            </div>
            <div className="swiz-streak">
              <span className="swiz-streak__icon">⚡</span>
              <span className="swiz-streak__num" style={{ color: commitmentStreak > 0 ? "#00FFBF" : "#9CA3AF" }}>
                {commitmentStreak > 0 ? commitmentStreak : "0"}
              </span>
              <span className="swiz-streak__label">Commitment wins</span>
            </div>
          </div>
        </div>
      );
    }

    if (s === "receipts") {
      return (
        <div className="swiz-body-stack">
          <StepHead
            index={step}
            kicker="ACCOUNTABILITY CHECKPOINT"
            title="The Receipts"
            sub="Last week you made promises. Check off what you kept — or own what you didn't."
          />
          <AccountabilityCheckpoint
            lastReview={lastReview}
            checks={commitmentChecks}
            onChange={setCommitmentChecks}
            reviewStreak={reviewStreak}
            commitmentStreak={commitmentStreak}
          />
        </div>
      );
    }

    if (s === "reflect") {
      return (
        <div className="swiz-body-stack">
          <StepHead
            index={step}
            kicker="DEBRIEF"
            title="Read the Week Back"
            sub="No spin. The truth is the raw material."
          />
          <div className="stagger swiz-fields">
            <Field label="1. What was your biggest win this week?" rows={3}
              value={form.biggestWin} onChange={set("biggestWin")} autoFocus
              placeholder="The thing you're proud of…" />
            <Field label="2. What did you avoid?" rows={3}
              value={form.avoided} onChange={set("avoided")}
              placeholder="The thing you kept dodging…" />
            <Field label="3. What did this week teach you?" rows={3}
              value={form.lesson} onChange={set("lesson")}
              placeholder="The lesson, in one line…" />
          </div>
        </div>
      );
    }

    if (s === "battle") {
      return (
        <div className="swiz-body-stack">
          <StepHead
            index={step}
            kicker="BATTLEFIELD REPORT"
            title="Where the Missions Stand"
            sub="Name the front that advanced — and the one that's slipping."
          />
          {active.length > 0 && (
            <div className="swiz-battle">
              {active.slice(0, 6).map((m) => {
                const next = getNextIncompleteAction(m);
                const prog = getMilestoneProgress(m);
                return (
                  <div key={m.id} className="swiz-battle__card">
                    <div className="swiz-battle__row">
                      <span className="swiz-battle__title">{m.title}</span>
                      <span className="swiz-battle__pct">{prog}%</span>
                    </div>
                    <div className="swiz-battle__bar">
                      <span style={{ width: `${prog}%` }} />
                    </div>
                    <p className="swiz-battle__next">{next ? `Next: ${next.text}` : "Ready to unlock"}</p>
                  </div>
                );
              })}
            </div>
          )}
          <div className="swiz-fields">
            <label className="swiz-field">
              <span className="swiz-field__label" style={{ color: "#00FFBF" }}>4. Which milestone moved forward the most?</span>
              <select className="swiz-select" value={form.milestoneMovedMost} onChange={set("milestoneMovedMost")}>
                {milestoneOptions.map((o) => <option key={`m-${o.value}`} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label className="swiz-field">
              <span className="swiz-field__label" style={{ color: "#FF8A3D" }}>5. Which milestone needs attention?</span>
              <select className="swiz-select" value={form.milestoneNeedsAttention} onChange={set("milestoneNeedsAttention")}>
                {milestoneOptions.map((o) => <option key={`a-${o.value}`} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          </div>
        </div>
      );
    }

    if (s === "orders") {
      return (
        <div className="swiz-body-stack">
          <StepHead
            index={step}
            kicker="NEXT WEEK'S ORDERS"
            title="Set the Coordinates"
            sub="One commitment per line. You will be held to every one."
          />
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
              <span className="swiz-field__hint">
                {commitCount > 0
                  ? `⚡ ${commitCount} commitment${commitCount > 1 ? "s" : ""} locked — these become next week's receipts.`
                  : "Each line becomes a receipt you check off next Sunday."}
              </span>
            </label>
            <Field label="7. What reward are you chasing next?" rows={2}
              value={form.rewardChasing} onChange={set("rewardChasing")}
              placeholder="The thing that makes the grind worth it…" />
          </div>
        </div>
      );
    }

    if (s === "score") {
      return (
        <div className="swiz-body-stack">
          <StepHead
            index={step}
            kicker="WEEKLY SCORECARD"
            title="Rate the Week"
            sub="Move the bars. The ring reacts in real time."
          />
          <ScoreRing total={total} />
          <div className="swiz-sliders">
            {SLIDERS.map((sd) => (
              <div key={sd.key} className="swiz-slider" style={{ "--sc": sd.color }}>
                <div className="swiz-slider__row">
                  <span className="swiz-slider__label">{sd.label}</span>
                  <span className="swiz-slider__val" style={{ color: sd.color }}>{form[sd.key]}/10</span>
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
        <StepHead
          index={step}
          kicker="FINAL TRANSMISSION"
          title="Lock In the Review"
          sub="Confirm the debrief. Once you transmit, the map updates."
        />
        <div className="swiz-recap">
          <div className="swiz-recap__stat">
            <span className="swiz-recap__num" style={{ color: bandColor }}>{total}<small>/50</small></span>
            <span className="swiz-recap__label">{getScorecardLabel(total)}</span>
          </div>
          <div className="swiz-recap__stat">
            <span className="swiz-recap__num" style={{ color: "#00F0FF" }}>{commitCount}</span>
            <span className="swiz-recap__label">Commitments set</span>
          </div>
          <div className="swiz-recap__stat">
            <span className="swiz-recap__num" style={{ color: "#FACC15" }}>+150</span>
            <span className="swiz-recap__label">XP on transmit</span>
          </div>
        </div>
        <Field label="Field notes (optional)" rows={2}
          value={form.notes} onChange={set("notes")}
          placeholder="Anything the questions missed…" />
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
        <button type="button" className="swiz-close" onClick={onClose} aria-label="Close review">✕</button>
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
              ← Back
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
              {transmitting ? "TRANSMITTING…" : "⚡ Transmit Review"}
            </button>
          ) : (
            <button type="button" className="swiz-btn swiz-btn--primary" onClick={() => go(step + 1)}>
              {step === 0 ? "Begin Debrief →" : "Next →"}
            </button>
          )}
        </div>
      </footer>

      {transmitting && (
        <div className="swiz-transmit" aria-hidden="true">
          <div className="swiz-transmit__scan" />
          <div className="swiz-transmit__text anim-transmission">UPDATING THE MAP…</div>
        </div>
      )}
    </div>,
    document.body
  );
}

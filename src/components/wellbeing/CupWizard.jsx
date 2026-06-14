import React, { useState, useRef } from "react";
import { CATEGORIES, DIFF_PTS } from "./cupData.js";
import "./CupWizard.css";

const DIFF_LABELS = {
  easy:     { label: "Easy",           pts: 5,  glyph: "▲",     color: "#00F0FF" },
  medium:   { label: "Medium",         pts: 10, glyph: "▲▲",    color: "#D11EFF" },
  hard:     { label: "Hard",           pts: 20, glyph: "▲▲▲",   color: "#FF3EDB" },
  identity: { label: "Identity Shift", pts: 30, glyph: "◆",     color: "#00FFBF" },
};

// ─── Step 1: Intro ────────────────────────────────────────────────────────────

function StepIntro({ onNext }) {
  return (
    <div className="wiz wiz--intro">
      <div className="wiz-intro__glyph" aria-hidden="true">◆</div>
      <h1 className="wiz-title">BUILD YOUR CUP</h1>
      <p className="wiz-intro__sub">
        This is your cup. Not ours.
      </p>
      <div className="wiz-intro__rules">
        <div className="wiz-rule">
          <span className="wiz-rule__icon">⚠️</span>
          <span>Pick habits you are <strong>NOT</strong> currently doing consistently</span>
        </div>
        <div className="wiz-rule">
          <span className="wiz-rule__icon">❌</span>
          <span>Not the easy wins you already have</span>
        </div>
        <div className="wiz-rule">
          <span className="wiz-rule__icon">🎯</span>
          <span>Pick what would <strong>actually</strong> change your energy</span>
        </div>
      </div>

      <div className="wiz-intro__diff-grid">
        {Object.entries(DIFF_LABELS).map(([key, d]) => (
          <div key={key} className="wiz-diff-pill" style={{ "--dc": d.color }}>
            <span className="wiz-diff-pill__glyph">{d.glyph}</span>
            <span className="wiz-diff-pill__label">{d.label}</span>
            <span className="wiz-diff-pill__pts">+{d.pts}</span>
          </div>
        ))}
      </div>

      <p className="wiz-intro__goal">
        Select <strong>3–10 habits</strong> that will become your daily cup.
      </p>

      <button type="button" className="wiz-cta" onClick={onNext}>
        Build My Cup →
      </button>
    </div>
  );
}

// ─── Step 2: Browse existing habits ──────────────────────────────────────────

function StepBrowse({ selected, onToggle, onNext, onSkip }) {
  const [activeCat, setActiveCat] = useState(0);
  const cat = CATEGORIES[activeCat];
  const count = selected.length;

  return (
    <div className="wiz wiz--browse">
      <div className="wiz-header">
        <h2 className="wiz-title wiz-title--sm">SELECT YOUR HABITS</h2>
        <div className="wiz-counter">
          <span className="wiz-counter__num">{count}</span>
          <span className="wiz-counter__label"> selected</span>
        </div>
      </div>
      <p className="wiz-browse__hint">
        Tap a habit to add it to your cup. Tap again to remove it.
      </p>

      {/* Category tabs */}
      <div className="wiz-cats">
        {CATEGORIES.map((c, i) => {
          const doneInCat = selected.filter(h => h.catId === c.id).length;
          return (
            <button
              key={c.id}
              type="button"
              className={`wiz-cat ${activeCat === i ? "wiz-cat--active" : ""}`}
              style={{ "--dc": c.color }}
              onClick={() => setActiveCat(i)}
            >
              <span>{c.icon}</span>
              <span>{c.label}</span>
              {doneInCat > 0 && <span className="wiz-cat__dot" />}
            </button>
          );
        })}
      </div>

      {/* Habits */}
      <div className="wiz-habits">
        {cat.habits.map((h, i) => {
          const id = `${cat.id}_${i}`;
          const isOn = selected.some(s => s.id === id);
          const d = DIFF_LABELS[h.diff];
          return (
            <button
              key={id}
              type="button"
              className={`wiz-habit ${isOn ? "wiz-habit--on" : ""}`}
              style={{ "--dc": cat.color }}
              onClick={() => onToggle(cat.id, i, h)}
              aria-pressed={isOn}
            >
              <div className="wiz-habit__check">{isOn ? "✓" : "+"}</div>
              <div className="wiz-habit__body">
                <span className="wiz-habit__label">{h.label}</span>
                <span className="wiz-habit__diff" style={{ color: d.color }}>
                  {d.label} +{h.pts}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="wiz-footer">
        <button type="button" className="wiz-skip" onClick={onSkip}>
          Skip to Custom →
        </button>
        <button
          type="button"
          className="wiz-cta"
          onClick={onNext}
          disabled={count < 1}
        >
          Next → {count > 0 ? `(${count})` : ""}
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Add custom habits ────────────────────────────────────────────────

function StepCustom({ presetCount, customList, onAdd, onRemove, onNext, onBack }) {
  const [text, setText] = useState("");
  const [diff, setDiff] = useState("medium");
  const [catIdx, setCatIdx] = useState(0);
  const inputRef = useRef(null);
  const total = presetCount + customList.length;

  function handleAdd() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd({
      id: `custom_${Date.now()}`,
      label: trimmed,
      diff,
      pts: DIFF_PTS[diff],
      catId: CATEGORIES[catIdx].id,
      source: "custom",
    });
    setText("");
    inputRef.current?.focus();
  }

  return (
    <div className="wiz wiz--custom">
      <div className="wiz-header">
        <button type="button" className="wiz-back" onClick={onBack}>← Back</button>
        <h2 className="wiz-title wiz-title--sm">ADD YOUR OWN</h2>
        <div className="wiz-counter">
          <span className="wiz-counter__num">{total}</span>
          <span className="wiz-counter__label"> total</span>
        </div>
      </div>
      <p className="wiz-browse__hint">
        Add habits that aren't in the list — anything that would fill YOUR cup.
      </p>

      <div className="wiz-custom-form">
        <input
          ref={inputRef}
          type="text"
          className="wiz-custom-input"
          placeholder="e.g. Read 10 pages, No social media..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") handleAdd(); }}
          maxLength={60}
        />

        <div className="wiz-custom-row">
          <span className="wiz-custom-row__label">Difficulty</span>
          <div className="wiz-diff-btns">
            {Object.entries(DIFF_LABELS).map(([key, d]) => (
              <button
                key={key}
                type="button"
                className={`wiz-diff-btn ${diff === key ? "wiz-diff-btn--on" : ""}`}
                style={{ "--dc": d.color }}
                onClick={() => setDiff(key)}
              >
                {key === "identity" ? "Identity" : d.label}
                <span className="wiz-diff-btn__pts">+{d.pts}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="wiz-custom-row">
          <span className="wiz-custom-row__label">Category</span>
          <div className="wiz-cat-select">
            {CATEGORIES.map((c, i) => (
              <button
                key={c.id}
                type="button"
                className={`wiz-cat-chip ${catIdx === i ? "wiz-cat-chip--on" : ""}`}
                style={{ "--dc": c.color }}
                onClick={() => setCatIdx(i)}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="wiz-add-btn"
          onClick={handleAdd}
          disabled={!text.trim()}
        >
          + Add Habit
        </button>
      </div>

      {customList.length > 0 && (
        <div className="wiz-custom-list">
          <p className="wiz-custom-list__label">Your custom habits:</p>
          {customList.map(h => {
            const d = DIFF_LABELS[h.diff];
            const cat = CATEGORIES.find(c => c.id === h.catId);
            return (
              <div key={h.id} className="wiz-custom-item">
                <div className="wiz-custom-item__info">
                  <span className="wiz-custom-item__label">{h.label}</span>
                  <span className="wiz-custom-item__meta" style={{ color: d.color }}>
                    {cat?.icon} {cat?.label} · {d.label} +{h.pts}
                  </span>
                </div>
                <button
                  type="button"
                  className="wiz-custom-item__remove"
                  onClick={() => onRemove(h.id)}
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="wiz-footer">
        <button type="button" className="wiz-skip" onClick={onNext}>
          {customList.length === 0 ? "Skip →" : "Done Adding →"}
        </button>
        <button type="button" className="wiz-cta" onClick={onNext} disabled={total < 1}>
          Review My Cup →
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Review ───────────────────────────────────────────────────────────

function StepReview({ preset, custom, onRemovePreset, onRemoveCustom, onComplete, onBack }) {
  const all = [...preset, ...custom];
  const totalPts = all.reduce((s, h) => s + h.pts, 0);
  const canLock = all.length >= 3;

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = all.filter(h => h.catId === cat.id);
    if (items.length) acc.push({ cat, items });
    return acc;
  }, []);

  return (
    <div className="wiz wiz--review">
      <div className="wiz-header">
        <button type="button" className="wiz-back" onClick={onBack}>← Back</button>
        <h2 className="wiz-title wiz-title--sm">YOUR CUP</h2>
      </div>

      <div className="wiz-review-meta">
        <div className="wiz-review-stat">
          <span className="wiz-review-stat__num">{all.length}</span>
          <span className="wiz-review-stat__label">habits</span>
        </div>
        <div className="wiz-review-stat">
          <span className="wiz-review-stat__num">{totalPts}</span>
          <span className="wiz-review-stat__label">energy potential</span>
        </div>
      </div>

      {all.length < 3 && (
        <p className="wiz-review-warn">Select at least 3 habits to lock in your cup.</p>
      )}

      <div className="wiz-review-list">
        {grouped.map(({ cat, items }) => (
          <div key={cat.id} className="wiz-review-group">
            <div className="wiz-review-group__header" style={{ color: cat.color }}>
              {cat.icon} {cat.label}
            </div>
            {items.map(h => {
              const d = DIFF_LABELS[h.diff];
              const isCustom = h.source === "custom";
              return (
                <div key={h.id} className="wiz-review-item">
                  <div className="wiz-review-item__info">
                    <span className="wiz-review-item__label">
                      {h.label}
                      {isCustom && <span className="wiz-review-item__custom-tag">custom</span>}
                    </span>
                    <span className="wiz-review-item__diff" style={{ color: d.color }}>
                      {d.label} +{h.pts}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="wiz-review-item__remove"
                    onClick={() => isCustom ? onRemoveCustom(h.id) : onRemovePreset(h.id)}
                    aria-label="Remove habit"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <button
        type="button"
        className={`wiz-cta wiz-cta--lock ${canLock ? "" : "wiz-cta--disabled"}`}
        onClick={canLock ? onComplete : undefined}
        disabled={!canLock}
      >
        {canLock ? "⚡ Lock It In" : `Need ${3 - all.length} more habit${all.length === 2 ? "" : "s"}`}
      </button>
      <p className="wiz-review-note">
        You can always rebuild your cup from the main screen.
      </p>
    </div>
  );
}

// ─── Root wizard ──────────────────────────────────────────────────────────────

export default function CupWizard({ onComplete }) {
  const [step, setStep] = useState("intro");
  const [preset, setPreset] = useState([]);   // selected from existing categories
  const [custom, setCustom] = useState([]);   // user-typed habits

  function togglePreset(catId, hIdx, habit) {
    const id = `${catId}_${hIdx}`;
    setPreset(prev =>
      prev.some(h => h.id === id)
        ? prev.filter(h => h.id !== id)
        : [...prev, { id, label: habit.label, diff: habit.diff, pts: habit.pts, catId, source: "preset" }]
    );
  }

  function addCustom(habit) {
    setCustom(prev => [...prev, habit]);
  }

  function removeCustom(id) {
    setCustom(prev => prev.filter(h => h.id !== id));
  }

  function removePreset(id) {
    setPreset(prev => prev.filter(h => h.id !== id));
  }

  function handleComplete() {
    onComplete([...preset, ...custom]);
  }

  if (step === "intro") {
    return <StepIntro onNext={() => setStep("browse")} />;
  }
  if (step === "browse") {
    return (
      <StepBrowse
        selected={preset}
        onToggle={togglePreset}
        onNext={() => setStep("custom")}
        onSkip={() => setStep("custom")}
      />
    );
  }
  if (step === "custom") {
    return (
      <StepCustom
        presetCount={preset.length}
        customList={custom}
        onAdd={addCustom}
        onRemove={removeCustom}
        onNext={() => setStep("review")}
        onBack={() => setStep("browse")}
      />
    );
  }
  if (step === "review") {
    return (
      <StepReview
        preset={preset}
        custom={custom}
        onRemovePreset={removePreset}
        onRemoveCustom={removeCustom}
        onComplete={handleComplete}
        onBack={() => setStep("custom")}
      />
    );
  }
  return null;
}

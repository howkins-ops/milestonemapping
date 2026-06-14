import React, { useState } from "react";
import "./TopFivePage.css";
import Button from "../ui/Button.jsx";
import TextInput from "../ui/TextInput.jsx";
import Select from "../ui/Select.jsx";
import { useDailyLog } from "../../hooks/useDailyLog.js";
import { useMilestones } from "../../hooks/useMilestones.js";
import { uid } from "../../lib/id.js";

/* ── helpers ─────────────────────────────────────────────────── */

const EMPTY_SLOT = () => ({
  text: "",
  impact: "",
  milestoneId: "",
  estimatedTime: "",
  reward: ""
});

function initSlots(tasks) {
  return Array.from({ length: 5 }, (_, i) => {
    const t = tasks[i];
    return t
      ? {
          text: t.text || "",
          impact: t.impact || "",
          milestoneId: t.milestoneId || "",
          estimatedTime: t.estimatedTime || "",
          reward: t.reward || ""
        }
      : EMPTY_SLOT();
  });
}

const EXAMPLES = [
  { bad: "Work on business",    good: "Finish the sales presentation slides" },
  { bad: "Get healthy",         good: "Complete a 45-minute workout" },
  { bad: "Work on the book",    good: "Write 1,000 words of Chapter 3" },
];

/* ── CoachPanel ──────────────────────────────────────────────── */

function CoachPanel({ open, onToggle }) {
  return (
    <div className={`t5p-coach ${open ? "is-open" : ""}`}>
      <button type="button" className="t5p-coach__toggle" onClick={onToggle}>
        <span className="t5p-coach__toggle-left">
          <span className="t5p-coach__toggle-icon">🎯</span>
          The Top 5 System — Why Only 5?
        </span>
        <span className="t5p-coach__chevron">▾</span>
      </button>

      {open && (
        <div className="t5p-coach__body anim-slide-up">
          <p className="t5p-coach__headline">
            "Most people fail because they try to do 50 things. The Top 5 System forces clarity."
          </p>
          <p className="t5p-coach__why">
            Instead of asking <em>"What do I need to do today?"</em> — we ask:<br />
            <strong>"What are the 5 highest-leverage actions that would move my life forward?"</strong>
            <br /><br />
            The goal is not activity. The goal is <strong>progress</strong>.
          </p>

          <div className="t5p-coach__sub-heading">What a priority should be</div>
          <p className="t5p-coach__why" style={{ marginBottom: 0 }}>
            ✅ Moves a project forward &nbsp;·&nbsp; ✅ Creates meaningful progress<br />
            ✅ Produces a result &nbsp;·&nbsp; ✅ Has a measurable outcome
          </p>

          <div className="t5p-coach__sub-heading" style={{ marginTop: 16 }}>Examples</div>
          <div className="t5p-examples">
            {EXAMPLES.map((ex, i) => (
              <div key={i} className="t5p-example-row">
                <div className="t5p-example t5p-example--bad">
                  <span className="t5p-example__label">❌ Vague</span>
                  {ex.bad}
                </div>
                <div className="t5p-example-arrow">→</div>
                <div className="t5p-example t5p-example--good">
                  <span className="t5p-example__label">✅ Specific</span>
                  {ex.good}
                </div>
              </div>
            ))}
          </div>

          <p className="t5p-coach__question">
            If you completed these 5 priorities today, would today feel like a success?
            If not — they're not the right priorities.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── PrioritySlot ────────────────────────────────────────────── */

function PrioritySlot({ index, slot, milestoneOptions, onChange }) {
  const isFilled = slot.text.trim().length > 0;

  return (
    <div className={`t5p-slot${isFilled ? " t5p-slot--filled" : ""}`}>
      <div className="t5p-slot__header">
        <span className="t5p-slot__num">#{index + 1}</span>
        <input
          className="t5p-slot__main-input"
          placeholder="What is the most important thing you can do today?"
          value={slot.text}
          onChange={e => onChange("text", e.target.value)}
          aria-label={`Priority ${index + 1}`}
        />
      </div>

      {isFilled && (
        <div className="t5p-slot__expanded anim-slide-up">
          <TextInput
            label="Impact — how does this move your life forward?"
            placeholder="e.g. Gets me closer to the pitch, builds momentum on the launch..."
            value={slot.impact}
            onChange={e => onChange("impact", e.target.value)}
          />
          <Select
            label="Link to a milestone (optional)"
            options={milestoneOptions}
            value={slot.milestoneId}
            onChange={e => onChange("milestoneId", e.target.value)}
          />
          <TextInput
            label="Estimated time"
            placeholder="e.g. 90 min, 2 hours..."
            value={slot.estimatedTime}
            onChange={e => onChange("estimatedTime", e.target.value)}
          />
          <TextInput
            label="Reward — what do you earn for completing this?"
            placeholder="e.g. 30 min Netflix, favourite coffee, walk outside..."
            value={slot.reward}
            onChange={e => onChange("reward", e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

/* ── TopFivePage ─────────────────────────────────────────────── */

export default function TopFivePage({ onNavigate }) {
  const { todayLog, updateTodayLog } = useDailyLog();
  const { active: activeMilestones } = useMilestones();

  const [slots, setSlots] = useState(() => initSlots(todayLog.topFive || []));
  const [coachOpen, setCoachOpen] = useState((todayLog.topFive || []).length === 0);

  const milestoneOptions = [
    { value: "", label: "— No milestone —" },
    ...activeMilestones.map(m => ({ value: m.id, label: m.title }))
  ];

  const filledCount = slots.filter(s => s.text.trim()).length;

  function updateSlot(index, field, value) {
    setSlots(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function handleLockIn() {
    const filled = slots.filter(s => s.text.trim());
    const newTopFive = filled.map(s => ({
      id: uid("t5"),
      text: s.text.trim(),
      done: false,
      ...(s.impact.trim()        ? { impact: s.impact.trim() }               : {}),
      ...(s.milestoneId          ? { milestoneId: s.milestoneId }             : {}),
      ...(s.estimatedTime.trim() ? { estimatedTime: s.estimatedTime.trim() } : {}),
      ...(s.reward.trim()        ? { reward: s.reward.trim() }               : {}),
    }));
    updateTodayLog({ topFive: newTopFive });
    onNavigate("daily");
  }

  const ctaLabel =
    filledCount === 5
      ? "Lock In My Top 5 →"
      : filledCount === 1
      ? "Lock In My Priority →"
      : `Lock In My Top ${filledCount} →`;

  return (
    <div className="anim-fade-in">
      <header className="page-header">
        <div className="page-header__kicker">Daily Execution</div>
        <h1 className="page-header__title">Today's Top 5</h1>
        <p className="page-header__sub">
          Five high-leverage moves. Maximum clarity. Today counts.
        </p>
      </header>

      <CoachPanel open={coachOpen} onToggle={() => setCoachOpen(o => !o)} />

      <div className="t5p-slots">
        {slots.map((slot, i) => (
          <PrioritySlot
            key={i}
            index={i}
            slot={slot}
            milestoneOptions={milestoneOptions}
            onChange={(field, value) => updateSlot(i, field, value)}
          />
        ))}
      </div>

      {filledCount > 0 && (
        <div className="t5p-cta anim-slide-up">
          <Button variant="primary" size="lg" onClick={handleLockIn}>
            {ctaLabel}
          </Button>
          <p className="t5p-cta__hint">
            You'll move to the execution view. Start moving.
          </p>
        </div>
      )}
    </div>
  );
}

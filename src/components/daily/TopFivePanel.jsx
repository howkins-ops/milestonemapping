import React, { useState } from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";
import ScienceInfo from "../ui/ScienceInfo.jsx";
import TopFiveWizard from "./TopFiveWizard.jsx";
import { useDailyLog } from "../../hooks/useDailyLog.js";
import { uid } from "../../lib/id.js";

// The three lighter checklists that live under the Top 5 - one connected
// priority system. No XP / celebration, just a simple check / uncheck.
const DAILY_LISTS = [
  {
    key: "todoList",
    label: "To-Do",
    accent: "0, 240, 255",
    placeholder: "Add a to-do...",
    empty: "Capture the loose sparks",
    iconSrc: "/assets/daily/daily-list-todo-emoji.png",
    backgroundSrc: "/assets/daily/daily-list-todo-bg.png"
  },
  {
    key: "errands",
    label: "Errands",
    accent: "0, 255, 191",
    placeholder: "Add an errand...",
    empty: "Map the outside moves",
    iconSrc: "/assets/daily/daily-list-errands-emoji.png",
    backgroundSrc: "/assets/daily/daily-list-errands-bg.png"
  },
  {
    key: "calls",
    label: "Calls to Make",
    accent: "255, 209, 102",
    placeholder: "Add a call to make...",
    empty: "Line up the signal flares",
    iconSrc: "/assets/daily/daily-list-calls-emoji.png",
    backgroundSrc: "/assets/daily/daily-list-calls-bg.png"
  }
];

function DailyChecklist({ config, items, onAdd, onToggle, onDelete }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const doneCount = items.filter((i) => i.done).length;

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    onAdd(config.key, text);
    setDraft("");
    if (!open) setOpen(true);
  };

  return (
    <div
      className={`daily-mini-list daily-mini-list--${config.key}`}
      style={{
        "--daily-list-accent": config.accent,
        "--daily-list-bg": `url("${config.backgroundSrc}")`
      }}
    >
      <button
        type="button"
        className="daily-mini-list__toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="daily-mini-list__identity">
          <span className="daily-mini-list__emoji" aria-hidden="true">
            <img src={config.iconSrc} alt="" loading="lazy" />
          </span>
          <span className="daily-mini-list__copy">
            <strong>{config.label}</strong>
            <span>{items.length > 0 ? `${doneCount}/${items.length} complete` : config.empty}</span>
          </span>
        </span>
        <span className="daily-mini-list__meta">
          <span
            aria-hidden="true"
            className={`daily-mini-list__chevron ${open ? "is-open" : ""}`}
          >
            ▾
          </span>
        </span>
      </button>

      {open && (
        <div className="daily-mini-list__body">
          {items.length > 0 && (
            <ul className="daily-mini-list__items">
              {items.map((item) => (
                <li key={item.id} className="daily-mini-list__item row">
                  <button
                    type="button"
                    className={`checkbox-glow ${item.done ? "is-checked" : ""}`}
                    onClick={() => onToggle(config.key, item.id)}
                    aria-label={`${item.done ? "Uncheck" : "Complete"}: ${item.text}`}
                  >
                    {item.done ? "✓" : ""}
                  </button>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14.5,
                      color: item.done ? "var(--text-soft)" : "var(--text-main)",
                      textDecoration: item.done ? "line-through" : "none"
                    }}
                  >
                    {item.text}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="daily-mini-list__delete"
                    onClick={() => onDelete(config.key, item.id)}
                    aria-label={`Delete: ${item.text}`}
                  >
                    ✕
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <div className="daily-mini-list__add row">
            <input
              className="input"
              placeholder={config.placeholder}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              aria-label={`New ${config.label} item`}
            />
            <Button variant="ghost" size="sm" className="daily-mini-list__add-btn" onClick={submit} disabled={!draft.trim()}>
              Add
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// mode="execute" → morning: tick off today's five (checkboxes, XP, progress)
// mode="plan"    → evening: load tomorrow's five (no checkboxes, planning copy)
export default function TopFivePanel({ mode = "execute" }) {
  const isPlan = mode === "plan";

  const {
    todayLog,
    tomorrowLog,
    doneCount,
    addTopFiveTask,
    updateTopFiveTask,
    deleteTopFiveTask,
    toggleTopFiveTask,
    addDailyListItem,
    deleteDailyListItem,
    toggleDailyListItem,
    addTomorrowTopFiveTask,
    updateTomorrowTopFiveTask,
    deleteTomorrowTopFiveTask
  } = useDailyLog();

  const tasks = (isPlan ? tomorrowLog.topFive : todayLog.topFive) || [];
  const addTask = isPlan ? addTomorrowTopFiveTask : addTopFiveTask;
  const updateTask = isPlan ? updateTomorrowTopFiveTask : updateTopFiveTask;
  const deleteTask = isPlan ? deleteTomorrowTopFiveTask : deleteTopFiveTask;

  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [floats, setFloats] = useState([]);
  const [building, setBuilding] = useState(false);

  // Morning, nothing planned → offer the wizard to build the 5 from your maps
  if (!isPlan && building) {
    return (
      <section>
        <TopFiveWizard mode="execute" onDone={() => setBuilding(false)} />
      </section>
    );
  }

  const submitDraft = () => {
    const text = draft.trim();
    if (!text || tasks.length >= 5) return;
    addTask(text);
    setDraft("");
  };

  const handleToggle = (task, e) => {
    if (!task.done) {
      // float "+10 XP" near the tapped checkbox
      const rect = e.currentTarget.getBoundingClientRect();
      const parent = e.currentTarget.closest("li").getBoundingClientRect();
      setFloats((prev) => [
        ...prev,
        { id: uid("float"), x: rect.left - parent.left + 34, y: 0, taskId: task.id }
      ]);
      setTimeout(() => setFloats((prev) => prev.slice(1)), 1300);
    }
    toggleTopFiveTask(task.id);
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const commitEdit = () => {
    const text = editText.trim();
    if (text) updateTask(editingId, { text });
    setEditingId(null);
  };

  return (
    <section>
      <Card variant="neon" className="daily-action-card daily-action-card--top-five ritual-image-card ritual-image-card--top-five">
        <div className="daily-action-card__art" aria-hidden="true" />
        <ScienceInfo ids={["daily_tracking"]} />
        <div className="daily-action-card__header">
          <div>
            <span className="daily-action-card__eyebrow">
              {isPlan ? "PLAN TONIGHT · EXECUTE AT DAWN" : "EXECUTE TODAY · ONE BY ONE"}
            </span>
            <h3 className="daily-action-card__title">
              {isPlan ? "Tomorrow's Top 5" : "Today's Top 5"}
            </h3>
          </div>
        </div>

        {!isPlan && tasks.length > 0 && (
          <ProgressBar value={doneCount} max={5} label="Daily execution" />
        )}

        {tasks.length > 0 && (
          <ul style={{ listStyle: "none", margin: "18px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {tasks.map((task, i) => (
              <li key={task.id} className="row anim-slide-up" style={{ position: "relative", animationDelay: `${i * 50}ms` }}>
                {floats
                  .filter((f) => f.taskId === task.id)
                  .map((f) => (
                    <span key={f.id} className="xp-float" style={{ left: f.x, top: -6 }}>
                      +10 XP
                    </span>
                  ))}
                <span className={`morning-t5-num ${task.done ? "is-done" : ""} ${i === 0 ? "is-battle" : ""}`}>
                  {i === 0 ? "★" : `#${i + 1}`}
                </span>
                {!isPlan && (
                  <button
                    type="button"
                    className={`checkbox-glow ${task.done ? "is-checked" : ""}`}
                    onClick={(e) => handleToggle(task, e)}
                    aria-label={`${task.done ? "Uncheck" : "Complete"}: ${task.text}`}
                  >
                    {task.done ? "✓" : ""}
                  </button>
                )}

                {editingId === task.id ? (
                  <input
                    className="input"
                    value={editText}
                    autoFocus
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    aria-label="Edit priority"
                  />
                ) : (
                  <span
                    style={{
                      flex: 1,
                      fontSize: 15.5,
                      color: task.done ? "var(--text-soft)" : "var(--text-main)",
                      textDecoration: task.done ? "line-through" : "none"
                    }}
                  >
                    {task.text}
                  </span>
                )}

                <Button variant="ghost" size="sm" onClick={() => startEdit(task)} aria-label={`Edit: ${task.text}`}>
                  ✎
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTask(task.id)}
                  aria-label={`Delete: ${task.text}`}
                  style={{ color: "var(--brand-red)" }}
                >
                  ✕
                </Button>
              </li>
            ))}
          </ul>
        )}

        {!isPlan && tasks.length === 0 && (
          <button type="button" className="t5-build-cta" onClick={() => setBuilding(true)}>
            <span className="t5-build-cta-star" aria-hidden="true">
              <img src="/assets/daily/daily-build-top-five-emoji.png" alt="" loading="lazy" />
            </span>
            <span className="t5-build-cta-text">
              <strong>Build My Top 5</strong>
              <span>Pull today's priorities straight from your maps</span>
            </span>
            <span className="t5-build-cta-arrow">→</span>
          </button>
        )}

        {tasks.length < 5 ? (
          <div className="row" style={{ marginTop: tasks.length > 0 ? 18 : 0 }}>
            <input
              className="input"
              placeholder={
                tasks.length === 0
                  ? (isPlan
                      ? "Pick the battle — the ONE move that makes tomorrow a win"
                      : "Pick the battle — the ONE move that makes today a win")
                  : `Priority ${tasks.length + 1} of 5 — ${isPlan ? "what else gets you closer tomorrow?" : "what else gets you closer today?"}`
              }
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submitDraft(); }}
              aria-label="New priority"
            />
            <Button variant="primary" onClick={submitDraft} disabled={!draft.trim()}>
              Add
            </Button>
          </div>
        ) : (
          <p className="soft" style={{ marginTop: 16, fontSize: 13 }}>
            {isPlan ? "Five priorities locked. Wake up ready." : "Five priorities locked. Now execute."}
          </p>
        )}

        {!isPlan && (
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid rgba(242, 240, 244, 0.08)" }}>
            <span className="daily-action-card__eyebrow" style={{ display: "block", marginBottom: 12 }}>
              THE REST OF THE DAY · KEEP IT ALL IN ONE PLACE
            </span>
            {DAILY_LISTS.map((config) => (
              <DailyChecklist
                key={config.key}
                config={config}
                items={(todayLog[config.key]) || []}
                onAdd={addDailyListItem}
                onToggle={toggleDailyListItem}
                onDelete={deleteDailyListItem}
              />
            ))}
          </div>
        )}
      </Card>
    </section>
  );
}

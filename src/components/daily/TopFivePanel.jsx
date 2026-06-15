import React, { useState } from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import { useDailyLog } from "../../hooks/useDailyLog.js";
import { TOP_FIVE_STATES } from "../../lib/constants.js";
import { uid } from "../../lib/id.js";

export default function TopFivePanel() {
  const {
    todayLog,
    doneCount,
    addTopFiveTask,
    updateTopFiveTask,
    deleteTopFiveTask,
    toggleTopFiveTask
  } = useDailyLog();

  const tasks = todayLog.topFive || [];
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [floats, setFloats] = useState([]);

  const submitDraft = () => {
    const text = draft.trim();
    if (!text || tasks.length >= 5) return;
    addTopFiveTask(text);
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
    if (text) updateTopFiveTask(editingId, { text });
    setEditingId(null);
  };

  return (
    <section>
      <SectionHeader
        title="Execute Your Top 5"
        icon="⚡"
        sub={TOP_FIVE_STATES[Math.min(doneCount, 5)]}
      />
      <Card variant="neon">
        {tasks.length > 0 && (
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
                <span className={`morning-t5-num ${task.done ? "is-done" : ""}`}>#{i + 1}</span>
                <button
                  type="button"
                  className={`checkbox-glow ${task.done ? "is-checked" : ""}`}
                  onClick={(e) => handleToggle(task, e)}
                  aria-label={`${task.done ? "Uncheck" : "Complete"}: ${task.text}`}
                >
                  {task.done ? "✓" : ""}
                </button>

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
                  onClick={() => deleteTopFiveTask(task.id)}
                  aria-label={`Delete: ${task.text}`}
                  style={{ color: "var(--brand-red)" }}
                >
                  ✕
                </Button>
              </li>
            ))}
          </ul>
        )}

        {tasks.length < 5 ? (
          <div className="row" style={{ marginTop: tasks.length > 0 ? 18 : 0 }}>
            <input
              className="input"
              placeholder={
                tasks.length === 0
                  ? "What's the #1 move that changes everything today?"
                  : `Priority ${tasks.length + 1} of 5 — what moves the mission forward?`
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
            Five priorities locked. Now execute.
          </p>
        )}
      </Card>
    </section>
  );
}

import React, { useState } from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import { useDailyLog } from "../../hooks/useDailyLog.js";
import { uid } from "../../lib/id.js";

export default function NightTopFivePanel({ onLocked }) {
  const {
    tomorrowLog,
    addTomorrowTopFiveTask,
    updateTomorrowTopFiveTask,
    deleteTomorrowTopFiveTask
  } = useDailyLog();

  const tasks = tomorrowLog.topFive || [];
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const submitDraft = () => {
    const text = draft.trim();
    if (!text || tasks.length >= 5) return;
    addTomorrowTopFiveTask(text);
    setDraft("");
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const commitEdit = () => {
    const text = editText.trim();
    if (text) updateTomorrowTopFiveTask(editingId, { text });
    setEditingId(null);
  };

  const allFive = tasks.length === 5;

  return (
    <section>
      <SectionHeader
        title="Tomorrow's Top 5"
        icon="⚡"
        sub={allFive ? "Locked and loaded. Get some sleep." : `${tasks.length}/5 priorities loaded — ${5 - tasks.length} remaining`}
      />
      <Card variant="neon">
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {tasks.map((task, i) => (
            <li key={task.id} className="row anim-slide-up" style={{ animationDelay: `${i * 40}ms`, position: "relative" }}>
              {/* Priority number badge */}
              <span className="night-t5-num">#{i + 1}</span>

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
                <span style={{ flex: 1, fontSize: 15, color: "var(--text-main)", lineHeight: 1.45 }}>
                  {task.text}
                </span>
              )}

              <Button variant="ghost" size="sm" onClick={() => startEdit(task)} aria-label="Edit">✎</Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTomorrowTopFiveTask(task.id)}
                aria-label="Delete"
                style={{ color: "var(--brand-red)" }}
              >✕</Button>
            </li>
          ))}
        </ul>

        {allFive ? (
          <div className="night-t5-locked">
            <span className="night-t5-locked-icon">✓</span>
            <span className="night-t5-locked-text">5 priorities locked. Wake up ready.</span>
            {onLocked && (
              <button className="night-t5-continue-btn" onClick={onLocked}>
                Done — I'm loaded ⚡
              </button>
            )}
          </div>
        ) : (
          <div className="row" style={{ marginTop: 16 }}>
            <input
              className="input"
              placeholder={`Priority ${tasks.length + 1} — what matters most tomorrow?`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submitDraft(); }}
              aria-label="New priority"
            />
            <Button variant="primary" onClick={submitDraft} disabled={!draft.trim()}>
              Add
            </Button>
          </div>
        )}
      </Card>
    </section>
  );
}

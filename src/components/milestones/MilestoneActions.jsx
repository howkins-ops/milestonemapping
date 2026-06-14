import React, { useMemo, useState } from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import { useMilestones } from "../../hooks/useMilestones.js";
import { getCurrentWeekNumber } from "../../lib/dates.js";
import { uid } from "../../lib/id.js";

export default function MilestoneActions({ milestone }) {
  const { addMilestoneAction, updateMilestoneAction, deleteMilestoneAction, toggleMilestoneAction } =
    useMilestones();

  const actions = milestone.actions || [];
  const [draft, setDraft] = useState("");
  const [draftWeek, setDraftWeek] = useState(getCurrentWeekNumber());
  const [weekFilter, setWeekFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [floats, setFloats] = useState([]);

  const weeks = useMemo(
    () => [...new Set(actions.map((a) => a.weekNumber || 1))].sort((a, b) => a - b),
    [actions]
  );

  const visible = useMemo(() => {
    const list =
      weekFilter === "all" ? actions : actions.filter((a) => (a.weekNumber || 1) === Number(weekFilter));
    // incomplete first, then by week
    return [...list].sort(
      (a, b) => Number(a.done) - Number(b.done) || (a.weekNumber || 0) - (b.weekNumber || 0)
    );
  }, [actions, weekFilter]);

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    addMilestoneAction(milestone.id, text, Number(draftWeek) || 1);
    setDraft("");
  };

  const handleToggle = (action) => {
    if (!action.done) {
      setFloats((prev) => [...prev, { id: uid("float"), actionId: action.id }]);
      setTimeout(() => setFloats((prev) => prev.slice(1)), 1300);
    }
    toggleMilestoneAction(milestone.id, action.id);
  };

  const commitEdit = () => {
    const text = editText.trim();
    if (text) updateMilestoneAction(milestone.id, editingId, { text });
    setEditingId(null);
  };

  return (
    <section>
      <SectionHeader
        title="Weekly Actions"
        icon="🧱"
        sub="Each brick is +25 XP of evidence."
        action={
          weeks.length > 1 && (
            <select
              className="select"
              style={{ width: "auto", padding: "8px 36px 8px 12px" }}
              value={weekFilter}
              onChange={(e) => setWeekFilter(e.target.value)}
              aria-label="Filter actions by week"
            >
              <option value="all">All weeks</option>
              {weeks.map((w) => (
                <option key={w} value={w}>
                  Week {w}
                </option>
              ))}
            </select>
          )
        }
      />
      <Card>
        {visible.length === 0 ? (
          <p className="soft">No actions yet. What's the first move that makes this real?</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {visible.map((action) => (
              <li key={action.id} className="row" style={{ position: "relative" }}>
                {floats
                  .filter((f) => f.actionId === action.id)
                  .map((f) => (
                    <span key={f.id} className="xp-float" style={{ left: 34, top: -8 }}>
                      +25 XP
                    </span>
                  ))}
                <button
                  type="button"
                  className={`checkbox-glow ${action.done ? "is-checked" : ""}`}
                  onClick={() => handleToggle(action)}
                  aria-label={`${action.done ? "Uncheck" : "Complete"}: ${action.text}`}
                >
                  {action.done ? "✓" : ""}
                </button>

                <span className="badge" style={{ fontSize: 10 }}>W{action.weekNumber || 1}</span>

                {editingId === action.id ? (
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
                    aria-label="Edit action"
                  />
                ) : (
                  <span
                    style={{
                      flex: 1,
                      color: action.done ? "var(--text-soft)" : "var(--text-main)",
                      textDecoration: action.done ? "line-through" : "none"
                    }}
                  >
                    {action.text}
                  </span>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingId(action.id);
                    setEditText(action.text);
                  }}
                  aria-label={`Edit: ${action.text}`}
                >
                  ✎
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  style={{ color: "var(--brand-red)" }}
                  onClick={() => deleteMilestoneAction(milestone.id, action.id)}
                  aria-label={`Delete: ${action.text}`}
                >
                  ✕
                </Button>
              </li>
            ))}
          </ul>
        )}

        <div className="row row--wrap" style={{ marginTop: 18 }}>
          <input
            className="input"
            style={{ flex: "1 1 220px" }}
            placeholder="Add the next move..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            aria-label="New action"
          />
          <input
            className="input"
            type="number"
            min="1"
            style={{ width: 92 }}
            value={draftWeek}
            onChange={(e) => setDraftWeek(e.target.value)}
            aria-label="Week number"
            title="Week number"
          />
          <Button variant="primary" onClick={submit} disabled={!draft.trim()}>
            Add Action
          </Button>
        </div>
      </Card>
    </section>
  );
}

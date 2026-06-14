import React from "react";
import Card from "../ui/Card.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";
import Button from "../ui/Button.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import { useDailyLog } from "../../hooks/useDailyLog.js";
import { TOP_FIVE_STATES } from "../../lib/constants.js";

export default function TopFivePreview({ onNavigate }) {
  const { todayLog, doneCount, toggleTopFiveTask } = useDailyLog();
  const tasks = todayLog.topFive || [];

  return (
    <section>
      <SectionHeader
        title="Today's Top 5"
        icon="⚡"
        sub={TOP_FIVE_STATES[Math.min(doneCount, 5)]}
        action={
          <Button variant="ghost" size="sm" onClick={() => onNavigate("topfive")}>
            Plan Today →
          </Button>
        }
      />
      {tasks.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No priorities set yet"
          description="Set the mission. Five moves that make today count."
          actionLabel="Set Today's Top 5"
          onAction={() => onNavigate("topfive")}
        />
      ) : (
        <Card>
          <ProgressBar value={doneCount} max={tasks.length} label="Execution" />
          <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {tasks.map((task) => (
              <li key={task.id} className="row">
                <button
                  type="button"
                  className={`checkbox-glow ${task.done ? "is-checked" : ""}`}
                  onClick={() => toggleTopFiveTask(task.id)}
                  aria-label={`${task.done ? "Uncheck" : "Check"}: ${task.text}`}
                >
                  {task.done ? "✓" : ""}
                </button>
                <span
                  style={{
                    color: task.done ? "var(--text-soft)" : "var(--text-main)",
                    textDecoration: task.done ? "line-through" : "none"
                  }}
                >
                  {task.text}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}

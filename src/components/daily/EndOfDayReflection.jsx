import React, { useState } from "react";
import Card from "../ui/Card.jsx";
import ScienceInfo from "../ui/ScienceInfo.jsx";
import EveningWizard from "./EveningWizard.jsx";
import { useDailyLog } from "../../hooks/useDailyLog.js";
import { useAppData } from "../../hooks/useAppData.js";
import { useToasts } from "../../hooks/useToasts.js";

function getCoachMessage(done, total) {
  if (total === 0) return "No priorities were loaded today. Tonight is your chance — load them now.";
  const pct = done / total;
  if (pct === 1) return "FULL CONQUEST. You did exactly what you said you would. That's identity.";
  if (pct >= 0.6) return "Strong execution. Review what blocked the rest — and load it for tomorrow.";
  if (pct >= 0.2) return "You moved. It wasn't the full mission — but you showed up. Reset tonight.";
  return "The commit was made. The execution didn't match. Tomorrow is a clean slate — use it.";
}

export default function EndOfDayReflection() {
  const { todayLog, updateTodayLog, doneCount } = useDailyLog();
  const { settings } = useAppData();
  const { pushToast } = useToasts();
  const [open, setOpen] = useState(false);

  const tasks = todayLog.topFive || [];
  const total = tasks.length;
  const completionPct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  // "Closed" once any reflection beat has been captured tonight.
  const nightGratitude = todayLog.nightGratitude || [];
  const isClosed = !!(
    todayLog.biggestWin ||
    todayLog.lesson ||
    todayLog.tomorrowUpgrade ||
    nightGratitude.length
  );

  const handleComplete = ({ biggestWin, lesson, tomorrowUpgrade, nightGratitude }) => {
    updateTodayLog({ biggestWin, lesson, tomorrowUpgrade, nightGratitude });
    setOpen(false);
    pushToast({
      type: "success",
      title: "Day logged.",
      message: "Evidence saved, mind quieted. You'll fall asleep faster ending on the good.",
    });
  };

  const reflections = [
    { label: "Biggest win", text: todayLog.biggestWin },
    { label: "What it taught me", text: todayLog.lesson },
    { label: "Tomorrow's upgrade", text: todayLog.tomorrowUpgrade },
  ].filter((r) => r.text && r.text.trim());

  return (
    <div className="night-debrief-section">
      {/* Execution report */}
      <div className="night-execution-report">
        <ScienceInfo ids={["reflection", "night_gratitude"]} />
        <div className="night-exec-header">
          <span className="night-exec-label">TODAY'S EXECUTION</span>
          <span className="night-exec-score" style={{
            color: completionPct === 100 ? "#00FFBF" : completionPct >= 60 ? "#FACC15" : total === 0 ? "rgba(242,240,244,0.3)" : "#FF3EDB"
          }}>
            {total === 0 ? "—" : `${doneCount}/${total}`}
          </span>
        </div>

        {total > 0 && (
          <div className="night-exec-bar-wrap">
            <div
              className="night-exec-bar-fill"
              style={{
                width: `${completionPct}%`,
                background: completionPct === 100
                  ? "linear-gradient(90deg, #00FFBF, #00F0FF)"
                  : completionPct >= 60
                  ? "linear-gradient(90deg, #FACC15, #FFB000)"
                  : "linear-gradient(90deg, #D11EFF, #FF3EDB)"
              }}
            />
          </div>
        )}

        {tasks.length > 0 && (
          <ul className="night-task-list">
            {tasks.map((t) => (
              <li key={t.id} className={`night-task-item ${t.done ? "is-done" : ""}`}>
                <span className="night-task-check">{t.done ? "✓" : "○"}</span>
                <span className="night-task-text">{t.text}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="night-coach-message">
          <span className="night-coach-icon">⚡</span>
          <p className="night-coach-text">{getCoachMessage(doneCount, total)}</p>
        </div>
      </div>

      {/* Reflection wizard launcher / locked recap */}
      <Card variant="glass">
        {isClosed ? (
          <div className="ev-locked anim-fade-in">
            <div className="ev-locked-head">
              <span className="ev-locked-check">✓</span>
              <span className="ev-locked-title">DAY CLOSED OUT</span>
            </div>

            {reflections.length > 0 && (
              <ul className="ev-locked-entries">
                {reflections.map((r, i) => (
                  <li key={i} className="ev-locked-entry">
                    <span className="ev-locked-entry-label">{r.label}</span>
                    <p className="ev-locked-entry-text">"{r.text.trim()}"</p>
                  </li>
                ))}
              </ul>
            )}

            {nightGratitude.length > 0 && (
              <div className="ev-locked-gratitude">
                <span className="ev-locked-gratitude-label">GRATEFUL FOR</span>
                <ul className="ev-locked-gratitude-list">
                  {nightGratitude.map((g, i) => (
                    <li key={i}><span className="ev-locked-gratitude-dot">✦</span> {g}</li>
                  ))}
                </ul>
              </div>
            )}

            <button className="daily-commit-edit-btn" onClick={() => setOpen(true)}>
              Edit reflection
            </button>
          </div>
        ) : (
          <div className="ev-cta">
            <span className="ev-cta-eyebrow">CLOSE THE DAY</span>
            <h3 className="ev-cta-title">Run the evening reflection</h3>
            <p className="ev-cta-sub">
              A guided 4-step wind-down: your win, your lesson, tomorrow's upgrade, and a few small
              things to be grateful for. Ending on the good helps you fall asleep faster. About two minutes.
            </p>
            <button className="ev-cta-btn" onClick={() => setOpen(true)}>
              Begin reflection →
            </button>
          </div>
        )}
      </Card>

      {open && (
        <EveningWizard
          onClose={() => setOpen(false)}
          onComplete={handleComplete}
          soundEnabled={settings?.soundEnabled !== false}
          initial={{
            biggestWin: todayLog.biggestWin || "",
            lesson: todayLog.lesson || "",
            tomorrowUpgrade: todayLog.tomorrowUpgrade || "",
            nightGratitude: [
              nightGratitude[0] || "",
              nightGratitude[1] || "",
              nightGratitude[2] || "",
            ],
          }}
        />
      )}
    </div>
  );
}

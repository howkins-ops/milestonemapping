import React, { useState } from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import TextArea from "../ui/TextArea.jsx";
import ScienceInfo from "../ui/ScienceInfo.jsx";
import { useDailyLog } from "../../hooks/useDailyLog.js";
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
  const { pushToast } = useToasts();
  const [form, setForm] = useState({
    biggestWin: todayLog.biggestWin || "",
    lesson: todayLog.lesson || "",
    tomorrowUpgrade: todayLog.tomorrowUpgrade || ""
  });

  const tasks = todayLog.topFive || [];
  const total = tasks.length;
  const completionPct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  const save = () => {
    updateTodayLog(form);
    pushToast({ type: "success", title: "Day logged.", message: "Evidence saved. Tomorrow is loading." });
  };

  return (
    <div className="night-debrief-section">
      {/* Execution report */}
      <div className="night-execution-report">
        <ScienceInfo ids={["reflection"]} />
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

      {/* Reflection */}
      <Card variant="glass">
        <div className="stack">
          <TextArea
            label="Biggest win today"
            rows={2}
            value={form.biggestWin}
            onChange={(e) => setForm({ ...form, biggestWin: e.target.value })}
          />
          <TextArea
            label="Biggest lesson today"
            rows={2}
            value={form.lesson}
            onChange={(e) => setForm({ ...form, lesson: e.target.value })}
          />
          <TextArea
            label="What I'll upgrade tomorrow"
            rows={2}
            value={form.tomorrowUpgrade}
            onChange={(e) => setForm({ ...form, tomorrowUpgrade: e.target.value })}
          />
          <Button variant="secondary" onClick={save} style={{ alignSelf: "flex-start" }}>
            Log the Day
          </Button>
        </div>
      </Card>
    </div>
  );
}

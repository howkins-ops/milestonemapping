import React, { useState } from "react";
import { useDailyLog } from "../../hooks/useDailyLog.js";
import { useToasts } from "../../hooks/useToasts.js";

export default function DailyCommitPanel({ onLocked }) {
  const { tomorrowLog, updateTomorrowLog } = useDailyLog();
  const { pushToast } = useToasts();
  const [commit, setCommit] = useState(tomorrowLog.dailyCommit || "");
  const [locked, setLocked] = useState(!!tomorrowLog.dailyCommit);

  const lock = () => {
    const text = commit.trim();
    if (!text) return;
    updateTomorrowLog({ dailyCommit: text });
    setLocked(true);
    pushToast({ type: "success", title: "Tomorrow's commitment locked.", message: "Wake up with a target." });
    if (onLocked) setTimeout(onLocked, 800);
  };

  return (
    <section className="daily-commit-section anim-fade-in">
      <div className="daily-commit-top-line" />
      <div className="daily-commit-header">
        <span className="daily-commit-badge">TOMORROW'S COMMITMENT</span>
        <h2 className="daily-commit-title">Tomorrow I commit to —</h2>
        <p className="daily-commit-sub">One sentence. Bold. Specific. Set it tonight.</p>
      </div>

      {locked ? (
        <div className="daily-commit-locked">
          <div className="daily-commit-locked-icon">⚡</div>
          <p className="daily-commit-locked-text">"{tomorrowLog.dailyCommit}"</p>
          <button className="daily-commit-edit-btn" onClick={() => setLocked(false)}>
            Edit
          </button>
        </div>
      ) : (
        <div className="daily-commit-input-wrap">
          <textarea
            className="daily-commit-textarea"
            placeholder="State your commitment for tomorrow. Be specific. Be bold."
            rows={3}
            value={commit}
            onChange={(e) => setCommit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) lock();
            }}
          />
          <button
            className="daily-commit-btn"
            onClick={lock}
            disabled={!commit.trim()}
          >
            <span>LOCK IN</span>
            <span className="daily-commit-btn-icon">⚡</span>
          </button>
        </div>
      )}
    </section>
  );
}

import React, { useState } from "react";
import { useDailyLog } from "../../hooks/useDailyLog.js";
import { useToasts } from "../../hooks/useToasts.js";

const STAND_PROMPTS = [
  "I refuse to let fear make my decisions tomorrow.",
  "I am the kind of person who keeps their word.",
  "I rise even when I don't feel like it.",
  "I choose growth over comfort, every time.",
  "I am building something worth being proud of.",
  "I show up as the best version of myself — even on hard days.",
  "I am not negotiating with excuses.",
];

export default function MakeAStandPanel({ onLocked }) {
  const { tomorrowLog, updateTomorrowLog } = useDailyLog();
  const { pushToast } = useToasts();
  const [stand, setStand] = useState(tomorrowLog.dailyStand || "");
  const [locked, setLocked] = useState(!!tomorrowLog.dailyStand);
  const [promptIdx, setPromptIdx] = useState(0);

  const usePrompt = () => {
    setStand(STAND_PROMPTS[promptIdx]);
    setPromptIdx((i) => (i + 1) % STAND_PROMPTS.length);
  };

  const lock = () => {
    const text = stand.trim();
    if (!text) return;
    updateTomorrowLog({ dailyStand: text });
    setLocked(true);
    pushToast({ type: "success", title: "Stand declared.", message: "Wake up and act like it." });
    if (onLocked) setTimeout(onLocked, 800);
  };

  return (
    <section className="make-stand-section anim-fade-in">
      <div className="make-stand-header">
        <span className="make-stand-fire">🔥</span>
        <div>
          <span className="make-stand-label">MAKE A STAND</span>
          <h3 className="make-stand-title">Who are you tomorrow?</h3>
        </div>
      </div>

      {locked ? (
        <div className="make-stand-locked">
          <div className="make-stand-locked-bar" />
          <p className="make-stand-locked-text">"{tomorrowLog.dailyStand}"</p>
          <button className="daily-commit-edit-btn" onClick={() => setLocked(false)}>
            Edit
          </button>
        </div>
      ) : (
        <div className="make-stand-body">
          <textarea
            className="make-stand-textarea"
            placeholder="I am the kind of person who..."
            rows={2}
            value={stand}
            onChange={(e) => setStand(e.target.value)}
          />
          <div className="make-stand-actions">
            <button className="make-stand-prompt-btn" onClick={usePrompt}>
              ✦ Inspire me
            </button>
            <button
              className="make-stand-lock-btn"
              onClick={lock}
              disabled={!stand.trim()}
            >
              DECLARE IT
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

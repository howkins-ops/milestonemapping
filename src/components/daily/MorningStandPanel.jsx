import React, { useState } from "react";
import ScienceInfo from "../ui/ScienceInfo.jsx";
import DailyStandWizard from "./DailyStandWizard.jsx";
import { useDailyLog } from "../../hooks/useDailyLog.js";
import { useToasts } from "../../hooks/useToasts.js";

export default function MorningStandPanel() {
  const { todayLog, updateTodayLog } = useDailyLog();
  const { pushToast } = useToasts();

  const existing = todayLog.dailyStand || "";
  const ways = todayLog.standWays || [];
  const intention = todayLog.standIntention || "";

  const [open, setOpen] = useState(false);

  const handleComplete = (result) => {
    updateTodayLog({
      dailyStand: result.stand,
      standWays: result.ways,
      standIntention: result.intention,
      standTheme: result.theme,
    });
    setOpen(false);
    pushToast({ type: "success", title: "Stand taken.", message: "Now go live it." });
  };

  const reset = () => {
    updateTodayLog({ dailyStand: "", standWays: [], standIntention: "" });
    setOpen(true);
  };

  return (
    <>
      {existing ? (
        <section className="morning-stand-cta morning-stand-cta--set anim-fade-in">
          <ScienceInfo ids={["affirmations", "identity"]} />
          <div className="make-stand-locked">
            <div className="make-stand-locked-bar" />
            <span className="make-stand-locked-eyebrow">TODAY MY STAND IS…</span>
            <p className="make-stand-locked-text">"{existing}"</p>

            {ways.length > 0 && (
              <ul className="make-stand-locked-ways">
                {ways.map((w, i) => (
                  <li key={i}>
                    <span className="make-stand-locked-tick">✓</span> {w}
                  </li>
                ))}
              </ul>
            )}
            {intention && (
              <p className="make-stand-locked-intention">"{intention}"</p>
            )}

            <button className="daily-commit-edit-btn" onClick={reset}>
              Reset
            </button>
          </div>
        </section>
      ) : (
        <section className="morning-stand-cta anim-fade-in">
          <ScienceInfo ids={["affirmations", "identity"]} />
          <span className="morning-stand-eyebrow">MORNING STAND</span>
          <h2 className="morning-stand-headline">Take your stand for today.</h2>
          <p className="morning-stand-teaser">
            Decide who you are before the day decides for you. One line. Say it like it's already true.
          </p>
          <button className="morning-stand-go-btn" onClick={() => setOpen(true)}>
            Take your stand →
          </button>
        </section>
      )}

      {open && (
        <DailyStandWizard onClose={() => setOpen(false)} onComplete={handleComplete} />
      )}
    </>
  );
}

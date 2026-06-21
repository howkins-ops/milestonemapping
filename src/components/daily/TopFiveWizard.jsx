import React, { useState } from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import ScienceInfo from "../ui/ScienceInfo.jsx";
import { useDailyLog } from "../../hooks/useDailyLog.js";
import { useAppData } from "../../hooks/useAppData.js";
import { getNextMilestone, getProjectProgress } from "../../lib/progress.js";
import { uid } from "../../lib/id.js";

// The Top 5 builder. Priorities are pulled from the user's MAP PROJECTS so the
// list is what actually moves them toward a goal — not busywork that looks busy.
// #1 = "the battle": the single move that gets them closest to a goal.
//
// mode="plan"    → builds tomorrow's five (night ritual)
// mode="execute" → builds today's five (morning, when nothing was planned)
const STEPS = [
  { label: "Battle", color: "#FF3EDB", tip: "Your #1 — the single move that gets you closest to a goal." },
  { label: "Squad",  color: "#D11EFF", tip: "Four more that move a map forward. Skip anything that just looks busy." },
  { label: "Lock In", color: "#00F0FF", tip: "Five targets, ranked. Now go execute." }
];

export default function TopFiveWizard({ mode = "plan", onDone }) {
  const isPlan = mode === "plan";
  const { todayLog, tomorrowLog, updateTodayLog, updateTomorrowLog } = useDailyLog();
  const { projects, milestones } = useAppData();

  const log = isPlan ? tomorrowLog : todayLog;
  const writeLog = isPlan ? updateTomorrowLog : updateTodayLog;

  const initial = (log.topFive || []).slice(0, 5);
  const [picks, setPicks] = useState(initial);
  const [step, setStep] = useState(() =>
    initial.length === 0 ? 0 : initial.length < 5 ? 1 : 2
  );
  const [done, setDone] = useState(initial.length >= 5);
  const [custom, setCustom] = useState("");

  // single source of truth — persist on every change so nothing is lost mid-wizard
  const commit = (next) => {
    const trimmed = next.slice(0, 5);
    setPicks(trimmed);
    writeLog({ topFive: trimmed });
  };

  const activeProjects = (projects || [])
    .filter((p) => p.status !== "completed")
    .map((p) => ({
      project: p,
      next: getNextMilestone(p, milestones),
      progress: getProjectProgress(p, milestones)
    }));

  const usedMilestoneIds = new Set(picks.map((t) => t.milestoneId).filter(Boolean));

  const makeTask = ({ text, project, milestone }) => ({
    id: uid("t5"),
    text,
    done: false,
    projectId: project ? project.id : null,
    projectTitle: project ? project.title : null,
    milestoneId: milestone ? milestone.id : null
  });

  const projectTaskText = (project, milestone) =>
    milestone ? milestone.title : `Move "${project.title}" forward`;

  /* ---------- step 0: pick the battle ---------- */
  const setBattle = (task) => {
    commit([task, ...picks.slice(1)]);
    setStep(1);
  };
  const battleFromProject = ({ project, next }) =>
    setBattle(makeTask({ text: projectTaskText(project, next), project, milestone: next }));
  const battleFromCustom = () => {
    const text = custom.trim();
    if (!text) return;
    setBattle(makeTask({ text }));
    setCustom("");
  };

  /* ---------- step 1: build the squad ---------- */
  const addPick = (task) => {
    if (picks.length >= 5) return;
    commit([...picks, task]);
  };
  const addFromProject = ({ project, next }) =>
    addPick(makeTask({ text: projectTaskText(project, next), project, milestone: next }));
  const addFromCustom = () => {
    const text = custom.trim();
    if (!text || picks.length >= 5) return;
    addPick(makeTask({ text }));
    setCustom("");
  };
  const removePick = (id) => commit(picks.filter((t) => t.id !== id));

  const lockIn = () => {
    setDone(true);
    if (onDone) onDone();
  };

  /* ---------- done state ---------- */
  if (done) {
    return (
      <div className="night-wizard-done anim-fade-in">
        <div className="night-wizard-done-glow" />
        <div className="night-wizard-done-icon">★</div>
        <h3 className="night-wizard-done-title">Top 5 Locked.</h3>
        <p className="night-wizard-done-sub">
          {isPlan
            ? "Tomorrow has a target. Your #1 is the battle — win that and the day is a win."
            : "Your day has a target. Win the battle first, then clear the rest."}
        </p>
        <ol className="t5wz-recap">
          {picks.map((t, i) => (
            <li key={t.id} className={i === 0 ? "is-battle" : ""}>
              <span className="t5wz-recap-rank">{i === 0 ? "★" : `#${i + 1}`}</span>
              <span className="t5wz-recap-text">{t.text}</span>
              {t.projectTitle && <span className="t5wz-recap-map">{t.projectTitle}</span>}
            </li>
          ))}
        </ol>
        <button
          className="night-wizard-done-edit"
          onClick={() => { setDone(false); setStep(2); }}
        >
          Edit list
        </button>
      </div>
    );
  }

  const activeStep = STEPS[step];
  const battle = picks[0];
  const squad = picks.slice(1);
  const noMaps = activeProjects.length === 0;

  return (
    <div className="t5wz night-wizard anim-fade-in">
      {/* step indicator */}
      <div className="night-wizard-steps">
        <div className="night-wizard-track">
          <div className="night-wizard-track-fill" style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />
        </div>
        {STEPS.map((s, i) => (
          <button
            key={s.label}
            type="button"
            className={`night-wizard-dot ${i === step ? "is-current" : i < step ? "is-done" : "is-future"}`}
            style={i <= step ? { "--dot-color": s.color } : {}}
            onClick={() => i < step && setStep(i)}
            aria-label={`Step ${i + 1}: ${s.label}`}
          >
            <span className="night-wizard-dot-inner">{i < step ? "✓" : i + 1}</span>
            <span className="night-wizard-dot-label">{s.label}</span>
          </button>
        ))}
      </div>

      <p className="night-wizard-tip">{activeStep.tip}</p>

      <div className="night-wizard-panel">
        {/* ============ STEP 0 — PICK THE BATTLE ============ */}
        {step === 0 && (
          <Card variant="pink" className="t5wz-card">
            <ScienceInfo ids={["planning"]} />
            <span className="t5wz-eyebrow">★ DECISIVE WIN</span>
            <h3 className="t5wz-title">Pick the Battle</h3>
            <p className="t5wz-sub">
              Most people stay busy on the wrong things. Choose the ONE move from your maps
              that gets you closest to a goal.
            </p>

            {!noMaps && (
              <div className="t5wz-pick-grid">
                {activeProjects.map(({ project, next, progress }) => {
                  const selected = battle && battle.projectId === project.id;
                  return (
                    <button
                      key={project.id}
                      type="button"
                      className={`t5wz-map-card ${selected ? "is-selected" : ""}`}
                      onClick={() => battleFromProject({ project, next })}
                    >
                      <span className="t5wz-map-name">{project.title}</span>
                      <span className="t5wz-map-next">
                        {next ? `Next: ${next.title}` : "No open milestone — move it forward"}
                      </span>
                      <span className="t5wz-map-prog">{progress}% mapped</span>
                    </button>
                  );
                })}
              </div>
            )}

            {noMaps && (
              <p className="t5wz-empty">No active maps yet — write your battle below.</p>
            )}

            <div className="t5wz-custom">
              <input
                className="input"
                placeholder="Or write your own #1 priority…"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") battleFromCustom(); }}
                aria-label="Custom battle"
              />
              <Button variant="secondary" onClick={battleFromCustom} disabled={!custom.trim()}>
                Set #1
              </Button>
            </div>

            {battle && (
              <div className="t5wz-battle-current">
                <span className="t5wz-battle-star">★</span>
                <span className="t5wz-battle-text">{battle.text}</span>
                <button className="t5wz-next-btn" onClick={() => setStep(1)}>Next →</button>
              </div>
            )}
          </Card>
        )}

        {/* ============ STEP 1 — BUILD THE SQUAD ============ */}
        {step === 1 && (
          <Card variant="neon" className="t5wz-card">
            <span className="t5wz-eyebrow">PRIORITIES 2–5</span>
            <h3 className="t5wz-title">Build the Squad</h3>
            <p className="t5wz-sub">{picks.length}/5 set — add up to {5 - picks.length} more from your maps.</p>

            {/* current list */}
            <ul className="t5wz-list">
              {picks.map((t, i) => (
                <li key={t.id} className={`t5wz-list-item ${i === 0 ? "is-battle" : ""}`}>
                  <span className="t5wz-rank">{i === 0 ? "★" : `#${i + 1}`}</span>
                  <span className="t5wz-list-text">
                    {t.text}
                    {t.projectTitle && <span className="t5wz-list-map">{t.projectTitle}</span>}
                  </span>
                  <button
                    className="t5wz-remove"
                    onClick={() => removePick(t.id)}
                    aria-label={`Remove ${t.text}`}
                  >✕</button>
                </li>
              ))}
            </ul>

            {picks.length < 5 && (
              <>
                {activeProjects.length > 0 && (
                  <div className="t5wz-chiprow">
                    {activeProjects
                      .filter(({ next }) => !next || !usedMilestoneIds.has(next.id))
                      .map(({ project, next }) => (
                        <button
                          key={project.id}
                          type="button"
                          className="t5wz-chip"
                          onClick={() => addFromProject({ project, next })}
                        >
                          + {next ? next.title : project.title}
                          <span className="t5wz-chip-map">{project.title}</span>
                        </button>
                      ))}
                  </div>
                )}

                <div className="t5wz-custom">
                  <input
                    className="input"
                    placeholder={`Priority ${picks.length + 1} — what moves a map forward?`}
                    value={custom}
                    onChange={(e) => setCustom(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addFromCustom(); }}
                    aria-label="Add priority"
                  />
                  <Button variant="primary" onClick={addFromCustom} disabled={!custom.trim()}>Add</Button>
                </div>
              </>
            )}

            <div className="t5wz-actions">
              <button className="t5wz-back-btn" onClick={() => setStep(0)}>← Battle</button>
              <button
                className="t5wz-next-btn"
                onClick={() => setStep(2)}
                disabled={picks.length === 0}
              >
                Review →
              </button>
            </div>
          </Card>
        )}

        {/* ============ STEP 2 — LOCK IN ============ */}
        {step === 2 && (
          <Card variant="neon" className="t5wz-card">
            <span className="t5wz-eyebrow">{isPlan ? "TOMORROW'S MISSION" : "TODAY'S MISSION"}</span>
            <h3 className="t5wz-title">Lock It In</h3>
            <p className="t5wz-sub">Your #1 is the battle. Win that and the day counts.</p>

            <ol className="t5wz-list t5wz-list--review">
              {picks.map((t, i) => (
                <li key={t.id} className={`t5wz-list-item ${i === 0 ? "is-battle" : ""}`}>
                  <span className="t5wz-rank">{i === 0 ? "★" : `#${i + 1}`}</span>
                  <span className="t5wz-list-text">
                    {t.text}
                    {t.projectTitle && <span className="t5wz-list-map">{t.projectTitle}</span>}
                  </span>
                </li>
              ))}
            </ol>

            <div className="t5wz-actions">
              <button className="t5wz-back-btn" onClick={() => setStep(1)}>← Edit</button>
              <Button variant="primary" onClick={lockIn} disabled={picks.length === 0}>
                {isPlan ? "Lock in tomorrow ★" : "Lock in today ★"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

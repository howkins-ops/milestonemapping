import React, { useEffect, useRef, useState } from "react";

// ════════════════════════════════════════════════════════════════════════
// QUIT YOUR JOB — station mini-game #3 (The Old Workshop)
// V9 "Boy Who Dreamed of Gold" Act One as gameplay: four dead-end
// micro-shifts, each a deliberately gray, repetitive loop with a wage
// counter ticking pennies. Color drains a little more each shift. After
// the fourth, the WALK OUT door pulses — walking out floods the color
// back. The boring IS the point; the win is leaving.
// ════════════════════════════════════════════════════════════════════════

const SHIFTS = [
  {
    id: "pizza",
    num: "JOB I",
    name: "Pizza dough, 5 a.m.",
    verb: "KNEAD",
    kind: "tap",
    goal: 10,
    wagePerUnit: 0.13,
    task: "Tap to knead. Again. The ovens don't care that it's 5 a.m.",
    quitLine: "quit: burned wrists, no thanks",
  },
  {
    id: "drivethru",
    num: "JOB II",
    name: "The drive-thru window",
    verb: "SMILE",
    kind: "hold",
    goal: 3000, // ms
    wagePerUnit: 0.0004,
    task: "Hold the button to keep smiling through the window while the manager watches.",
    quitLine: "quit: a manager's contempt",
  },
  {
    id: "warehouse",
    num: "JOB III",
    name: "Warehouse floor",
    verb: "LIFT",
    kind: "tap",
    goal: 12,
    wagePerUnit: 0.11,
    task: "Tap to lift. Every box a little heavier than the last one.",
    quitLine: "quit: a back that gave out",
  },
  {
    id: "carts",
    num: "JOB IV",
    name: "Grocery carts, all weather",
    verb: "PUSH",
    kind: "hold",
    goal: 3600, // ms
    wagePerUnit: 0.0003,
    task: "Hold to push the cart train through the rain. It's always raining.",
    quitLine: "quit: the last straw, unnamed",
  },
];

export default function QuitJobGame({ onDone, onClose }) {
  const [shiftIdx, setShiftIdx] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1 within the shift
  const [wage, setWage] = useState(0);
  const [phase, setPhase] = useState("work"); // work | quitline | walkout | color
  const holdRef = useRef(null);

  const shift = SHIFTS[Math.min(shiftIdx, SHIFTS.length - 1)];
  const lastShift = shiftIdx >= SHIFTS.length - 1;
  // Each shift drains more color: 55% → 100% grayscale.
  const grayscale = phase === "color" ? 0 : Math.min(1, 0.55 + shiftIdx * 0.15);

  const finishShift = () => {
    setPhase("quitline");
    setTimeout(() => {
      if (lastShift) {
        setPhase("walkout");
      } else {
        setShiftIdx((i) => i + 1);
        setProgress(0);
        setPhase("work");
      }
    }, 1900);
  };

  const tap = () => {
    if (phase !== "work" || shift.kind !== "tap") return;
    setWage((w) => w + shift.wagePerUnit);
    setProgress((p) => {
      const next = Math.min(1, p + 1 / shift.goal);
      if (next >= 1) setTimeout(finishShift, 250);
      return next;
    });
  };

  const holdStart = () => {
    if (phase !== "work" || shift.kind !== "hold" || holdRef.current) return;
    const startedAt = Date.now();
    const startProgress = progress;
    holdRef.current = setInterval(() => {
      const held = Date.now() - startedAt;
      setWage((w) => w + shift.wagePerUnit * 50);
      const next = Math.min(1, startProgress + held / shift.goal);
      setProgress(next);
      if (next >= 1) {
        holdStop();
        setTimeout(finishShift, 250);
      }
    }, 50);
  };

  const holdStop = () => {
    if (holdRef.current) {
      clearInterval(holdRef.current);
      holdRef.current = null;
    }
  };

  useEffect(() => () => holdStop(), []);

  const walkOut = () => {
    setPhase("color");
    setTimeout(() => onDone(), 2600);
  };

  return (
    <div
      className={`hmt-overlay hmt-quit${phase === "color" ? " hmt-quit--color" : ""}`}
      style={{ "--hmt-gray": grayscale }}
      role="dialog"
      aria-modal="true"
      aria-label="Quit your job"
    >
      {onClose && phase !== "color" ? (
        <button type="button" className="hmt-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
      ) : null}

      <div className="hmt-quit__card">
        {phase === "color" ? (
          <div className="hmt-quit__free">
            <p className="hmt-kicker">THE OLD WORKSHOP · STATION III</p>
            <h3 className="hmt-title">You walk out mid-shift.</h3>
            <p className="hmt-sub">
              No plan. A strange, guilty lightness in your chest. The excuses stay here —
              they live in this town, not in you.
            </p>
            <p className="hmt-quit__wagefinal">
              Total earned across four jobs: <b>${wage.toFixed(2)}</b>. The dream was never
              going to fit in a paycheck.
            </p>
          </div>
        ) : phase === "walkout" ? (
          <div className="hmt-quit__free">
            <p className="hmt-kicker">EVERY JOB, QUIT</p>
            <h3 className="hmt-title">There's a door you've never used.</h3>
            <p className="hmt-sub">
              Four time cards on the wall. Four little gray tombstones. The wage counter
              reads ${wage.toFixed(2)} and the dream is still exactly where you left it.
            </p>
            <button type="button" className="hmt-walkout" onClick={walkOut}>
              WALK OUT
            </button>
          </div>
        ) : (
          <>
            <p className="hmt-kicker">
              {shift.num} · {shift.name.toUpperCase()}
            </p>
            <div className="hmt-quit__punchcard">
              <span className="hmt-quit__wage">${wage.toFixed(2)}</span>
              <span className="hmt-quit__wagelabel">earned, ever</span>
            </div>
            <p className="hmt-quit__task">{shift.task}</p>

            <div className="hmt-quit__bar" aria-hidden="true">
              <span className="hmt-quit__fill" style={{ width: `${progress * 100}%` }} />
            </div>

            {phase === "quitline" ? (
              <p className="hmt-quit__quitline">{shift.quitLine}</p>
            ) : shift.kind === "tap" ? (
              <button type="button" className="hmt-quit__btn" onClick={tap}>
                {shift.verb}
              </button>
            ) : (
              <button
                type="button"
                className="hmt-quit__btn"
                onPointerDown={holdStart}
                onPointerUp={holdStop}
                onPointerLeave={holdStop}
              >
                HOLD TO {shift.verb}
              </button>
            )}

            <div className="hmt-quit__dots" aria-hidden="true">
              {SHIFTS.map((s, i) => (
                <span
                  key={s.id}
                  className={
                    "hmt-quit__dot" +
                    (i < shiftIdx ? " is-done" : i === shiftIdx ? " is-now" : "")
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

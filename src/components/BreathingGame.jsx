import { useEffect, useMemo, useState } from "react";
import BreathingOrb from "./BreathingOrb.jsx";

const roundTexts = [
  "I notice the mask.",
  "I thank it for protecting me.",
  "I release the old strategy.",
  "I return to my body.",
  "I choose Essence."
];

const phases = [
  { name: "inhale", seconds: 4 },
  { name: "hold", seconds: 2 },
  { name: "exhale", seconds: 6 }
];

export default function BreathingGame({ onComplete }) {
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const [complete, setComplete] = useState(false);

  const phase = phases[phaseIndex];
  const progress = useMemo(() => (phaseElapsed / phase.seconds) * 100, [phase.seconds, phaseElapsed]);

  useEffect(() => {
    if (!started || complete) return undefined;

    const timer = window.setInterval(() => {
      setPhaseElapsed((current) => {
        if (current + 1 < phase.seconds) return current + 1;

        setPhaseIndex((currentPhase) => {
          if (currentPhase < phases.length - 1) return currentPhase + 1;

          setRound((currentRound) => {
            if (currentRound < roundTexts.length - 1) return currentRound + 1;
            setComplete(true);
            return currentRound;
          });
          return 0;
        });

        return 0;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [started, complete, phase.seconds]);

  return (
    <section className={`game-step breath-step breath-round-${round}`}>
      <img className="step-backdrop-image breath-backdrop" src="/images/essence-return/animation-breath-reset.png" alt="" loading="lazy" />
      <div className="step-copy centered">
        <p className="hud-label">Body Reset Breathing Game</p>
        <h1>Return to the Body</h1>
        <p className="lead">The mask lives in the nervous system. Come back to the body before choosing Essence.</p>
      </div>

      <BreathingOrb phase={complete ? "complete" : phase.name} progress={complete ? 100 : progress} roundText={roundTexts[round]} />

      <div className="breath-rounds" aria-label="Breathing rounds">
        {roundTexts.map((text, index) => (
          <span className={index <= round ? "is-lit" : ""} key={text}>
            {index + 1}
          </span>
        ))}
      </div>

      {complete ? (
        <div className="completion-panel">
          <p className="hud-label">Survival Mode Interrupted</p>
          <h2>Body Online</h2>
          <button className="primary-btn" type="button" onClick={onComplete}>
            Choose Essence
          </button>
        </div>
      ) : (
        <div className="action-dock centered">
          <button className="primary-btn" type="button" onClick={() => setStarted(true)} disabled={started}>
            {started ? `Round ${round + 1} of 5` : "Start 5 Rounds"}
          </button>
        </div>
      )}
    </section>
  );
}

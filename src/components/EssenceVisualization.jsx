const prompts = [
  ["bodyFeeling", "Where do I feel this Essence in my body?"],
  ["message", "What does this Essence want me to remember?"],
  ["nextAction", "What would this Essence do next?"],
  ["stopDoing", "What would this Essence stop doing?"],
  ["proofAction", "What is one proof action I can take today?"]
];

export default function EssenceVisualization({ selectedEssence, answers, onChange, onComplete }) {
  const canContinue = prompts.every(([key]) => answers[key]?.trim());

  return (
    <section className="game-step visualization-step">
      <div className="visualization-portal">
        <img className="step-backdrop-image portal-backdrop" src="/images/essence-return/animation-essence-portal.png" alt="" loading="lazy" />
        <span className="portal-ring" />
        <div className="step-copy centered">
          <p className="hud-label">Essence Visualization</p>
          <h1>Close your eyes. See yourself living from {selectedEssence.name}.</h1>
          <p className="lead">Move slowly. Let the next action come from the body, not the mask.</p>
        </div>
      </div>

      <div className="question-grid calm">
        {prompts.map(([key, label]) => (
          <label className="field-panel" key={key}>
            <span>{label}</span>
            <textarea
              value={answers[key] || ""}
              onChange={(event) => onChange(key, event.target.value)}
              rows={3}
              placeholder="Listen, then write..."
            />
          </label>
        ))}
      </div>

      <div className="action-dock">
        <button className="primary-btn" type="button" disabled={!canContinue} onClick={onComplete}>
          Generate Identity Switch
        </button>
      </div>
    </section>
  );
}

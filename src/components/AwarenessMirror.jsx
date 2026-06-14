const questions = [
  ["trigger", "What triggered this mask?"],
  ["protection", "What am I protecting myself from?"],
  ["emotion", "What emotion am I avoiding?"],
  ["story", "What story am I believing?"],
  ["disobedienceFear", "What would happen if I did not obey this mask?"],
  ["cost", "What is this mask costing me today?"]
];

export default function AwarenessMirror({ selectedMask, answers, onChange, onComplete }) {
  const answeredCount = questions.filter(([key]) => answers[key]?.trim()).length;
  const canContinue = answeredCount === questions.length;

  return (
    <section className="game-step scanner-step">
      <div className="scanner-shell">
        <img className="step-backdrop-image scanner-backdrop" src="/images/essence-return/animation-awareness-mirror.png" alt="" loading="lazy" />
        <div className="scan-line" />
        <div className="scanner-status">
          <span>Survival Mechanism Active</span>
          <strong>{selectedMask.name}</strong>
          <em>Awareness Online</em>
          <em>Essence Return Available</em>
        </div>
        <div className="step-copy">
          <p className="hud-label">Awareness Mirror</p>
          <h1>Mask Identified</h1>
          <p className="lead">Name the protection strategy without shame. The scan only needs honesty.</p>
        </div>
        <div className="question-grid">
          {questions.map(([key, label]) => (
            <label className="field-panel" key={key}>
              <span>{label}</span>
              <textarea
                value={answers[key] || ""}
                onChange={(event) => onChange(key, event.target.value)}
                rows={3}
                placeholder="Type what is true right now..."
              />
            </label>
          ))}
        </div>
      </div>
      <div className="action-dock">
        <div className="selected-readout">
          <span>Diagnostic completion</span>
          <strong>{answeredCount}/{questions.length}</strong>
        </div>
        <button className="primary-btn" type="button" onClick={onComplete} disabled={!canContinue}>
          Complete Awareness Scan
        </button>
      </div>
    </section>
  );
}

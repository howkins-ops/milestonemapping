export default function IdentitySwitch({ selectedMask, selectedEssence, proofAction, statement, xpEarned, onLockIn, completed }) {
  return (
    <section className="game-step identity-step">
      <div className="identity-console">
        <img className="step-backdrop-image identity-victory-backdrop" src="/images/essence-return/animation-victory-lock.png" alt="" loading="lazy" />
        <p className="hud-label">Identity Switch</p>
        <h1>Return Complete</h1>
        <div className="identity-art-bridge" aria-label={`${selectedMask.name} returning to ${selectedEssence.name}`}>
          <figure className="identity-art-panel mask-panel">
            {selectedMask.imageSrc && <img src={selectedMask.imageSrc} alt="" loading="lazy" />}
            <figcaption>
              <span>Mask caught</span>
              <strong>{selectedMask.name}</strong>
            </figcaption>
          </figure>
          <span className="identity-arrow" aria-hidden="true">
            &rarr;
          </span>
          <figure className="identity-art-panel essence-panel">
            {selectedEssence.imageSrc && <img src={selectedEssence.imageSrc} alt="" loading="lazy" />}
            <figcaption>
              <span>Essence chosen</span>
              <strong>{selectedEssence.name}</strong>
            </figcaption>
          </figure>
        </div>
        <div className="statement-panel">
          {statement.split("\n").map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <div className="identity-stats">
          <div>
            <span>Mask caught</span>
            <strong>{selectedMask.name}</strong>
          </div>
          <div>
            <span>Essence chosen</span>
            <strong>{selectedEssence.name}</strong>
          </div>
          <div>
            <span>Next proof</span>
            <strong>{proofAction}</strong>
          </div>
          <div>
            <span>XP ready</span>
            <strong>{xpEarned}</strong>
          </div>
        </div>

        <button className="primary-btn" type="button" onClick={onLockIn} disabled={completed}>
          {completed ? "Essence Locked" : "Lock In Essence"}
        </button>
      </div>
    </section>
  );
}

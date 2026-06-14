export default function BreathingOrb({ phase, progress, roundText }) {
  return (
    <div className={`breathing-orb-shell phase-${phase}`}>
      <div className="breathing-ring" />
      <div className="breathing-orb">
        <span className="orb-core" />
        <strong>{phase}</strong>
        <small>{roundText}</small>
      </div>
      <div className="breath-progress" aria-hidden="true">
        <span style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
      </div>
    </div>
  );
}

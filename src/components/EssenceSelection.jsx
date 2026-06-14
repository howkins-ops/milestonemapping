import EssenceCard from "./EssenceCard.jsx";

export default function EssenceSelection({ essences, selectedEssence, suggestedEssences, onSelect, onComplete }) {
  return (
    <section className="game-step essence-step">
      <div className="step-copy">
        <p className="hud-label">Essence Selection</p>
        <h1>Choose Essence</h1>
        <p className="lead">Pick the identity state that gets to lead now.</p>
      </div>

      {suggestedEssences?.length > 0 && (
        <div className="suggestion-strip">
          <span>Return route detected</span>
          {suggestedEssences.map((name) => (
            <strong key={name}>{name}</strong>
          ))}
        </div>
      )}

      <div className="essence-grid">
        {essences.map((essence, index) => (
          <EssenceCard
            card={essence}
            index={index}
            key={essence.id}
            selected={selectedEssence?.id === essence.id}
            onSelect={onSelect}
          />
        ))}
      </div>

      <div className="action-dock">
        {selectedEssence && (
          <div className="selected-readout">
            <span>Essence locked in sight</span>
            <strong>{selectedEssence.name}</strong>
          </div>
        )}
        <button className="primary-btn" type="button" disabled={!selectedEssence} onClick={onComplete}>
          Continue to Visualization
        </button>
      </div>
    </section>
  );
}

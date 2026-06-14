export default function EssenceCard({ card, selected = false, onSelect, index = 0 }) {
  const style = {
    "--card-a": card.palette[0],
    "--card-b": card.palette[1],
    "--card-c": card.palette[2],
    animationDelay: `${index * 80}ms`
  };

  return (
    <button
      className={`tarot-card essence-card ${selected ? "is-selected" : ""}`}
      style={style}
      onClick={() => onSelect?.(card)}
      type="button"
      aria-label={`Choose ${card.name}`}
    >
      <span className="tarot-inner">
        <span className="tarot-face tarot-front">
          <span className="card-art essence-art" role="img" aria-label={card.imageDirection}>
            {card.imageSrc && <img className="card-art-image" src={card.imageSrc} alt="" loading="lazy" />}
            <span className="card-sigil">{card.sigil}</span>
          </span>
          <span className="card-kicker">Essence</span>
          <span className="card-title">{card.name}</span>
          <span className="card-subtitle">{card.meaning}</span>
          <span className="card-copy">"{card.affirmation}"</span>
        </span>
      </span>
    </button>
  );
}

export default function TarotMaskCard({ card, revealed = false, selected = false, onSelect, index = 0 }) {
  const style = {
    "--card-a": card?.palette?.[0] || "#05030a",
    "--card-b": card?.palette?.[1] || "#421269",
    "--card-c": card?.palette?.[2] || "#17e9ff",
    animationDelay: `${index * 90}ms`
  };

  return (
    <button
      className={`tarot-card mask-card ${revealed ? "is-revealed" : ""} ${selected ? "is-selected" : ""}`}
      style={style}
      onClick={() => revealed && onSelect?.(card)}
      type="button"
      aria-label={revealed ? `Select ${card.name}` : "Face down mask card"}
    >
      <span className="tarot-inner">
        <span className="tarot-face tarot-back">
          <img className="card-back-image" src="/images/essence-return/animation-deck-back.png" alt="" loading="lazy" />
          <span className="card-orbit" />
          <span className="card-runes">SURVIVAL MECHANISM</span>
          <span className="card-sigil">?</span>
          <span className="card-micro">Tap draw to reveal the driver</span>
        </span>
        <span className="tarot-face tarot-front">
          <span className="card-art" role="img" aria-label={card.imageDirection}>
            {card.imageSrc && <img className="card-art-image" src={card.imageSrc} alt="" loading="lazy" />}
            <span className="card-sigil">{card.sigil}</span>
          </span>
          <span className="card-kicker">Mask Active</span>
          <span className="card-title">{card.name}</span>
          <span className="card-subtitle">{card.subtitle}</span>
          <span className="card-copy">{card.corePattern}</span>
          <span className="card-chip-row">
            {card.essenceReturn.map((essence) => (
              <span className="card-chip" key={essence}>
                {essence}
              </span>
            ))}
          </span>
        </span>
      </span>
    </button>
  );
}

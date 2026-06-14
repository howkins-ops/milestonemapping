import { useMemo, useState } from "react";
import TarotMaskCard from "./TarotMaskCard.jsx";

export default function MaskDraw({ masks, selectedMask, onMaskSelected }) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [revealedIds, setRevealedIds] = useState(selectedMask ? [selectedMask.id] : []);
  const [drawnId, setDrawnId] = useState(selectedMask?.id || null);

  const drawnMask = useMemo(() => masks.find((mask) => mask.id === drawnId), [drawnId, masks]);

  function drawMask() {
    if (isDrawing) return;
    setIsDrawing(true);
    setRevealedIds([]);
    const nextMask = masks[Math.floor(Math.random() * masks.length)];
    setDrawnId(nextMask.id);

    masks.forEach((mask, index) => {
      window.setTimeout(() => {
        setRevealedIds((current) => [...new Set([...current, mask.id])]);
      }, 520 + index * 180);
    });

    window.setTimeout(() => {
      setIsDrawing(false);
      onMaskSelected(nextMask);
    }, 1620);
  }

  return (
    <section className="game-step">
      <img className="step-backdrop-image mask-reveal-backdrop" src="/images/essence-return/animation-mask-reveal.png" alt="" loading="lazy" />
      <div className="step-copy">
        <p className="hud-label">Essence Return Game</p>
        <h1>What Mask Am I Wearing?</h1>
        <p className="lead">Before you choose who you become, identify who has been driving.</p>
      </div>

      <div className={`mask-spread ${isDrawing ? "is-shuffling" : ""}`}>
        {masks.map((mask, index) => (
          <TarotMaskCard
            card={mask}
            index={index}
            key={mask.id}
            revealed={revealedIds.includes(mask.id) || selectedMask?.id === mask.id}
            selected={(drawnMask?.id || selectedMask?.id) === mask.id}
            onSelect={onMaskSelected}
          />
        ))}
      </div>

      <div className="action-dock">
        <button className="primary-btn" type="button" onClick={drawMask} disabled={isDrawing}>
          {isDrawing ? "Reading the field..." : "Draw My Mask"}
        </button>
        {selectedMask && (
          <div className="selected-readout">
            <span>Survival Mechanism Active</span>
            <strong>{selectedMask.name}</strong>
          </div>
        )}
      </div>

      {selectedMask && (
        <article className="mask-dossier">
          <p className="hud-label">Mask Identified</p>
          <h2>{selectedMask.name}</h2>
          <div className="dossier-grid">
            <div>
              <span>Mask voice</span>
              <p>"{selectedMask.maskVoice}"</p>
            </div>
            <div>
              <span>Protected me by</span>
              <p>{selectedMask.protectedBy}</p>
            </div>
            <div>
              <span>Traps me by</span>
              <p>{selectedMask.trapsBy}</p>
            </div>
            <div>
              <span>Reflection question</span>
              <p>{selectedMask.question}</p>
            </div>
          </div>
        </article>
      )}
    </section>
  );
}

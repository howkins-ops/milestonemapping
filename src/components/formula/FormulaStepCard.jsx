import React, { useState, useRef, useLayoutEffect } from "react";

export default function FormulaStepCard({ step, index }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (bodyRef.current) {
      setHeight(open ? bodyRef.current.scrollHeight : 0);
    }
  }, [open]);

  return (
    <div
      className="anim-slide-up formula-card"
      data-open={open}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="formula-card__trigger"
      >
        <span className="formula-card__num">{String(index + 1).padStart(2, "0")}</span>

        <div className="formula-card__title-wrap">
          <h3 className="formula-card__title">{step.title}</h3>
          {!open && <p className="formula-card__hint">Tap to expand</p>}
        </div>

        <span className="formula-card__chevron" aria-hidden="true">▾</span>
      </button>

      <div
        className="formula-card__body"
        style={{ height, overflow: "hidden", transition: "height 300ms cubic-bezier(0.16,1,0.3,1)" }}
      >
        <div ref={bodyRef} style={{ paddingTop: 16, paddingLeft: 58, paddingBottom: 4 }}>
          <p className="formula-card__explanation">{step.explanation}</p>
          <p className="formula-card__prompt">▸ {step.prompt}</p>
          <p className="formula-card__example">Example: {step.example}</p>
        </div>
      </div>
    </div>
  );
}

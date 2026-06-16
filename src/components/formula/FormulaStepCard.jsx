import React, { useLayoutEffect, useRef, useState } from "react";

export default function FormulaStepCard({ step, index }) {
  const [open, setOpen] = useState(index === 0);
  const bodyRef = useRef(null);
  const [height, setHeight] = useState(0);
  const stepNumber = String(index + 1).padStart(2, "0");

  useLayoutEffect(() => {
    if (bodyRef.current) {
      setHeight(open ? bodyRef.current.scrollHeight : 0);
    }
  }, [open]);

  return (
    <article
      className="anim-slide-up formula-card"
      data-open={open}
      style={{
        "--step-accent": step.accent,
        "--step-delay": `${index * 70}ms`,
        animationDelay: `${index * 60}ms`
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="formula-card__trigger"
      >
        <span className="formula-card__rail" aria-hidden="true">
          <span className="formula-card__num">{stepNumber}</span>
        </span>

        <span className="formula-card__title-wrap">
          <span className="formula-card__meta">{step.label} layer</span>
          <span className="formula-card__title">{step.title}</span>
          <span className="formula-card__concept">{step.concept}</span>
        </span>

        <span className="formula-card__status" aria-hidden="true">
          <span className="formula-card__status-text">{open ? "Open" : "View"}</span>
          <span className="formula-card__chevron">+</span>
        </span>
      </button>

      <div
        className="formula-card__body"
        style={{
          height,
          overflow: "hidden",
          transition: "height 340ms cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        <div ref={bodyRef} className="formula-card__body-inner">
          <p className="formula-card__explanation">{step.explanation}</p>
          <div className="formula-card__payload">
            <div>
              <span>Activation prompt</span>
              <p className="formula-card__prompt">{step.prompt}</p>
            </div>
            <div>
              <span>Field example</span>
              <p className="formula-card__example">{step.example}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

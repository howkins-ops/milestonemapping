import React, { useId } from "react";

export default function TextArea({ label, hint, rows = 3, className = "", ...rest }) {
  const id = useId();
  return (
    <div className={`field ${className}`}>
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <textarea id={id} className="textarea" rows={rows} {...rest} />
      {hint && <span className="soft" style={{ fontSize: 12 }}>{hint}</span>}
    </div>
  );
}

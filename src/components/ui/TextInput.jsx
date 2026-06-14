import React, { useId } from "react";

export default function TextInput({ label, hint, className = "", ...rest }) {
  const id = useId();
  return (
    <div className={`field ${className}`}>
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <input id={id} className="input" {...rest} />
      {hint && <span className="soft" style={{ fontSize: 12 }}>{hint}</span>}
    </div>
  );
}

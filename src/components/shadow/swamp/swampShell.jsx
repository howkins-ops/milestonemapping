import React from "react";

/* ════════════════════════════════════════════════════════════════════════
   Shared swamp shell + primitives for every Swamp Valve mode.

   Kept self-contained (like HoldTheLine's own `.htl-` set) so the swamp keeps
   its green/comedy identity instead of borrowing the Forge's `.sx-` accent.
   Every mode wraps itself in <SwampStage> and builds from these bits.
   ════════════════════════════════════════════════════════════════════════ */

/* ── Stage frame: swamp backdrop + back + title + meters + step dots ─────── */
export function SwampStage({ title, onClose, meters = [], total, active = 0, wobble = false, children }) {
  return (
    <div className={`sv-stage ${wobble ? "is-wobble" : ""}`}>
      <div className="sv-swampbg" aria-hidden>
        <span className="sv-swampbg__glow" />
        <span className="sv-swampbg__gas" />
      </div>

      <div className="sv-top">
        <button className="sv-back" onClick={onClose}>← Back</button>
        <span className="sv-title">{title}</span>
        <span className="sv-top__spacer" />
      </div>

      {meters.length > 0 && <Meters items={meters} />}

      {total ? (
        <div className="sv-dots">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`sv-dot ${i <= active ? "on" : ""}`} />
          ))}
        </div>
      ) : null}

      <div className="sv-body" key={active}>{children}</div>
    </div>
  );
}

/* ── Meter row (Pressure / Heat / Leak / Clarity / Flow) ─────────────────── */
export function Meters({ items = [] }) {
  return (
    <div className="sv-meters">
      {items.map((m) => (
        <div className="sv-meter" key={m.label}>
          <div className="sv-meter__head">
            <span className="sv-meter__label">{m.label}</span>
            <span className="sv-meter__val">{Math.round(m.value)}</span>
          </div>
          <div className="sv-meter__track">
            <span className="sv-meter__fill" style={{ width: `${Math.max(0, Math.min(100, m.value))}%`, background: m.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Text primitives ─────────────────────────────────────────────────────── */
export const Eyebrow = ({ children }) => <p className="sv-eyebrow">{children}</p>;
export const Heading = ({ children }) => <h2 className="sv-h">{children}</h2>;
export const Lead = ({ children }) => <p className="sv-lead">{children}</p>;
export const Science = ({ children }) => (
  <p className="sv-science"><span>THE SCIENCE</span>{children}</p>
);

/* ── Controls ────────────────────────────────────────────────────────────── */
export function Primary({ children, onClick, disabled }) {
  return <button className="sv-primary" onClick={onClick} disabled={disabled}>{children}</button>;
}
export function Ghost({ children, onClick, disabled }) {
  return <button className="sv-ghost" onClick={onClick} disabled={disabled}>{children}</button>;
}
export function Skip({ children, onClick }) {
  return <button className="sv-skip" onClick={onClick}>{children}</button>;
}

export function Chips({ options, value, onChange, multi = false, sm = false, getKey, getLabel }) {
  const keyOf = getKey || ((o) => (typeof o === "string" ? o : o.id));
  const labelOf = getLabel || ((o) => (typeof o === "string" ? o : o.label));
  const on = (o) => (multi ? (value || []).includes(keyOf(o)) : value === keyOf(o));
  const toggle = (o) => {
    const k = keyOf(o);
    if (multi) onChange((value || []).includes(k) ? value.filter((x) => x !== k) : [...(value || []), k]);
    else onChange(k);
  };
  return (
    <div className="sv-chips">
      {options.map((o) => (
        <button key={keyOf(o)} className={`sv-chip ${sm ? "sm" : ""} ${on(o) ? "on" : ""}`} onClick={() => toggle(o)}>
          {typeof o !== "string" && o.emoji ? <span className="sv-chip__emoji">{o.emoji}</span> : null}
          {labelOf(o)}
        </button>
      ))}
    </div>
  );
}

export function Field({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea className="sv-field" rows={rows} value={value}
      onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
  );
}

/* ── Firefly payoff burst (the fart-cloud → fireflies transform) ─────────── */
export function Fireflies({ items = ["✨", "🦋", "🫧", "🌸", "⭐", "🍄"], n = 14 }) {
  return (
    <span className="sv-fireflies" aria-hidden>
      {Array.from({ length: n }).map((_, i) => (
        <i key={i} style={{ "--a": `${(360 / n) * i}deg`, "--d": `${(i % 5) * 60}ms` }}>
          {items[i % items.length]}
        </i>
      ))}
    </span>
  );
}

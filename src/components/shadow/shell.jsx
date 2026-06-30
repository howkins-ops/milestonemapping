import React, { useState, useEffect } from "react";
import "../../styles/shadow.css";

/* ════════════════════════════════════════════════════════════════════════
   Shared cinematic shell for every Shadow Work exercise — "The Forge".
   ════════════════════════════════════════════════════════════════════════ */

export function maskCardSrc(maskId, cardType = "front-card") {
  return `/assets/identity-shift/identity/${String(maskId).replace(/_/g, "-")}/${cardType}.png`;
}
const hideImg = (e) => { e.currentTarget.style.visibility = "hidden"; };

/* ── Stage wrapper ──────────────────────────────────────────────────────── */
export function ShadowStage({ accent = "cyan", title, onClose, meter = null, total, active = 0, children }) {
  return (
    <div className="sx-stage" data-accent={accent}>
      <Forge />
      <div className="sx-top">
        <button className="sx-back" onClick={onClose}>← Back</button>
        <span className="sx-title">{title}</span>
        {meter != null && (
          <div className="sx-meter"><span className="sx-meter__fill" style={{ width: `${meter}%` }} /></div>
        )}
      </div>
      {total ? (
        <div className="sx-dots">
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`sx-dot ${i <= active ? "on" : ""}`} />
          ))}
        </div>
      ) : null}
      <div className="sx-body" key={active}>{children}</div>
    </div>
  );
}

export function Forge({ video }) {
  return (
    <div className="sx-forge" aria-hidden>
      <div className="sx-forge__glow" />
      {video && (
        <video className="sx-forge__video" src={video} autoPlay loop muted playsInline
          onError={(e) => { e.currentTarget.style.display = "none"; }} />
      )}
      <div className="sx-forge__embers" />
    </div>
  );
}

/* ── Text + control primitives ──────────────────────────────────────────── */
export const Eyebrow = ({ children }) => <p className="sx-eyebrow">{children}</p>;
export const Heading = ({ children }) => <h2 className="sx-h">{children}</h2>;
export const Lead = ({ children }) => <p className="sx-lead">{children}</p>;
export const Science = ({ children }) => <p className="sx-science"><span>THE SCIENCE</span>{children}</p>;
export const Safe = ({ children }) => <p className="sx-safe">{children}</p>;
export const Quote = ({ children }) => <div className="sx-quote">{children}</div>;

export function Primary({ children, onClick, disabled }) {
  return <button className="sx-primary" onClick={onClick} disabled={disabled}>{children}</button>;
}
export function Skip({ children, onClick }) {
  return <button className="sx-skip" onClick={onClick}>{children}</button>;
}

export function Chips({ options, value, onChange, multi = false, sm = false }) {
  const on = (o) => (multi ? (value || []).includes(o) : value === o);
  const toggle = (o) =>
    multi
      ? onChange((value || []).includes(o) ? value.filter((x) => x !== o) : [...(value || []), o])
      : onChange(o);
  return (
    <div className="sx-chips">
      {options.map((o) => (
        <button key={o} className={`sx-chip ${sm ? "sm" : ""} ${on(o) ? "on" : ""}`} onClick={() => toggle(o)}>{o}</button>
      ))}
    </div>
  );
}

export function Field({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea className="sx-field" rows={rows} value={value}
      onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
  );
}

/* ── Breathing orb (loops; calming coherent breath by default) ──────────── */
const COHERENT = [
  { key: "Breathe in", sub: "through the nose", s: 4, scale: 1.5, col: "var(--brand-green)" },
  { key: "Hold", sub: "soft and easy", s: 2, scale: 1.5, col: "var(--brand-gold)" },
  { key: "Breathe out", sub: "slow, through the mouth", s: 6, scale: 0.8, col: "var(--brand-cyan)" },
];
export function BreathOrb({ phases = COHERENT }) {
  const [pi, setPi] = useState(0);
  const [count, setCount] = useState(phases[0].s);
  useEffect(() => {
    const iv = setInterval(() => {
      setCount((c) => {
        if (c > 1) return c - 1;
        setPi((cur) => (cur + 1) % phases.length);
        return 0;
      });
    }, 1000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { setCount(phases[pi].s); }, [pi, phases]);
  const ph = phases[pi];
  return (
    <div className="sx-breath">
      <div className="sx-breath__orb" style={{ transform: `scale(${ph.scale})`, transition: `transform ${ph.s}s ease-in-out`, borderColor: ph.col, background: `radial-gradient(circle at 50% 38%, ${ph.col}38, transparent 70%)` }}>
        <span className="sx-breath__phase" style={{ color: ph.col }}>{ph.key}</span>
        <span className="sx-breath__count">{count || ph.s}</span>
        <span className="sx-breath__sub">{ph.sub}</span>
      </div>
    </div>
  );
}

/* ── Mask → essence transmutation morph ─────────────────────────────────── */
export function MaskMorph({ maskId, transmuted }) {
  return (
    <div className={`sx-morph ${transmuted ? "is-transmuted" : ""}`}>
      <div className="sx-morph__flash" />
      <img className="sx-morph__card is-from" src={maskCardSrc(maskId, "activated-card")} onError={hideImg} alt="" />
      <img className="sx-morph__card is-to" src={maskCardSrc(maskId, "essence-card")} onError={hideImg} alt="" />
    </div>
  );
}

/* ── Phoenix rise + particle burst (seal screens) ───────────────────────── */
export function Phoenix() {
  return (
    <div className="sx-phoenix" aria-hidden>
      <img className="sx-phoenix__beam" src="/assets/phoenix-shrine/ascension-beam.png" onError={hideImg} alt="" />
      <img className="sx-phoenix__swirl" src="/assets/phoenix-shrine/rebirth-swirl.png" onError={hideImg} alt="" />
      <img className="sx-phoenix__bird" src="/assets/phoenix-shrine/phoenix-rising.png" onError={hideImg} alt="" />
    </div>
  );
}
export function Burst({ n = 16 }) {
  return (
    <span className="sx-burst">
      {Array.from({ length: n }).map((_, i) => <i key={i} style={{ "--a": `${(360 / n) * i}deg` }} />)}
    </span>
  );
}

/* ── Seal screen (shared payoff) ────────────────────────────────────────── */
export function Seal({ eyebrow = "Sealed", title, lead, stamp, phoenix = true, onDone, doneLabel = "Save & close ✦" }) {
  return (
    <div className="sx-center">
      {phoenix && (
        <div style={{ position: "relative", width: 240, margin: "0 auto" }}>
          <Phoenix />
          <Burst />
        </div>
      )}
      <Eyebrow>{eyebrow}</Eyebrow>
      <Heading>{title}</Heading>
      {lead && <Lead>{lead}</Lead>}
      {stamp && (
        <div className="sx-stamp"><span>Your stamp</span><p>{stamp}</p></div>
      )}
      <Primary onClick={onDone}>{doneLabel}</Primary>
    </div>
  );
}

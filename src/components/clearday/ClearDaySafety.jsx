import React, { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   CLEARDAY — the safety layer.

   CLEARDAY talks about withdrawal timelines, receptor recovery and sleep
   architecture, and it sits with a man mid-urge at 2am. Two things follow
   from that, and neither is optional:

   1. Google Play's Health Content and Services policy REQUIRES a health app
      that isn't a cleared medical device to say so in those words, and to
      remind people to consult a healthcare professional.
   2. Shadow Work and Anxiety SOS both carry a 988 card. This is the module
      most likely to meet a genuine crisis and it carried none.

   The strip stays visible on every tab. The tone stays CLEARDAY's — the file
   doesn't suddenly start talking like a legal department — but the facts are
   the required ones, stated plainly.
   ═══════════════════════════════════════════════════════════════════════ */

export function SafetyStrip() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="cd-safety-strip" onClick={() => setOpen(true)}>
        Training, not treatment · in crisis, call or text <strong>988</strong> · read this
      </button>
      {open && <SafetySheet onClose={() => setOpen(false)} />}
    </>
  );
}

export function SafetySheet({ onClose }) {
  return (
    <div
      className="cd-safety-back"
      role="dialog"
      aria-label="CLEARDAY safety and health information"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="cd-safety-card">
        <div className="cd-label cd-label--dawn">BEFORE YOU GO FURTHER</div>
        <h2 className="cd-safety-title">This is training. It is not treatment.</h2>

        <p className="cd-safety-lead">
          CLEARDAY is a self-directed education and habit-training program. It is{" "}
          <strong>not a medical device</strong>, and it does not diagnose, treat, cure or
          prevent any medical condition — including substance use disorder, compulsive
          sexual behaviour, depression or anxiety.
        </p>

        <p className="cd-safety-lead">
          The recovery timelines in here are drawn from published research on groups of
          people. They are not a prediction about you, and they are not a clinical
          assessment. For advice about your own health, withdrawal, medication or mental
          health, <strong>talk to a doctor or a licensed professional</strong>. If you are
          already in treatment, this does not replace any part of it.
        </p>

        <div className="cd-safety-warn">
          Stopping some substances suddenly — alcohol and benzodiazepines especially — can
          be dangerous without medical supervision. If that's your situation, speak to a
          doctor before you change anything.
        </div>

        <div className="cd-label cd-label--dawn" style={{ marginTop: 18 }}>IF TONIGHT IS THE BAD ONE</div>
        <ul className="cd-safety-list">
          <li><strong>Immediate danger:</strong> call your local emergency number — 911 in the US and Canada.</li>
          <li><strong>US:</strong> call or text <strong>988</strong>, the Suicide &amp; Crisis Lifeline. Any hour.</li>
          <li><strong>US substance help:</strong> SAMHSA National Helpline, <strong>1-800-662-4357</strong>. Free, confidential, 24/7.</li>
          <li><strong>Anywhere else:</strong> search “crisis line” plus your country, or call one person you trust and tell them the truth.</li>
        </ul>

        <p className="cd-safety-foot">
          THE CORNER is an AI. It is not a therapist, a counselor, a sponsor or a crisis
          line, and it should never be the only thing you reach for.
        </p>

        <button type="button" className="cd-btn cd-btn--sm" onClick={onClose}>Understood</button>
      </div>
    </div>
  );
}

export default SafetyStrip;

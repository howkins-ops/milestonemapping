import React, { useState } from "react";
import { castVote } from "./clearDayStore.js";
import { tapLight, tapMedium } from "../../lib/haptics.js";

/* ═══════════════════════════════════════════════════════════════
   REACH OUT — put a human in the room before the Mask can work
   alone. The Mask's whole strategy is secrecy; it only wins fights
   nobody knows are happening. Standalone overlay — launchable from
   inside the Urge Battle (persistent topline button) OR straight
   from the Night Shift menu on Today. Real native actions: sms:/
   mailto: compose sheets (the user's own phone picks the person),
   or drop straight into THE CORNER. Files a "reachout" exhibit on
   any real send/open — the ACT of reaching is the rep.
   ═══════════════════════════════════════════════════════════════ */

const TEMPLATES = [
  "I'm in a moment. Not asking you to fix it - just talk to me for 10 minutes?",
  "Hey - having a hard night. Can you call me when you get this?",
  "Struggling right now. No need to say anything back, just wanted someone to know.",
];

export default function ReachOut({ onClose, onOpenCorner }) {
  const [msg, setMsg] = useState(TEMPLATES[0]);
  const [sent, setSent] = useState(false);

  const fileReach = (via) => {
    tapMedium();
    castVote("reachout", `Reached out via ${via} mid-fight — said it out loud instead of carrying it alone.`);
    setSent(true);
  };

  const send = (scheme) => {
    fileReach(scheme === "sms" ? "text" : "email");
    try {
      const uri = scheme === "sms"
        ? `sms:?&body=${encodeURIComponent(msg)}`
        : `mailto:?body=${encodeURIComponent(msg)}`;
      window.location.href = uri;
    } catch { /* the exhibit still filed even if the OS sheet can't open */ }
  };

  return (
    <div className="cd-reachout" role="dialog" aria-label="Reach Out">
      <div className="cd-reachout-card">
        <button type="button" className="cd-reachout-x" onClick={onClose} aria-label="Close">×</button>
        <div className="cd-eyebrow" style={{ color: "var(--cd-rose)" }}>REACH OUT</div>
        <h2 className="cd-reachout-h">Don't face it alone.<br />Put a human in the room.</h2>
        <p className="cd-p cd-p--soft" style={{ margin: "0 0 14px" }}>
          The Mask's whole strategy is <strong>secrecy</strong> — it only wins fights nobody knows are
          happening. One tap, one person, ten minutes.
        </p>

        {!sent ? (
          <>
            <textarea
              className="cd-reachout-input"
              maxLength={220}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
            />
            <div className="cd-reachout-templates">
              {TEMPLATES.map((t) => (
                <button key={t} type="button" className="cd-reachout-tmpl" onClick={() => { setMsg(t); tapLight(); }}>
                  {t.slice(0, 34)}…
                </button>
              ))}
            </div>
            <button type="button" className="cd-btn cd-btn--rep" onClick={() => send("sms")}>
              💬 TEXT SOMEONE — pick who
            </button>
            <button type="button" className="cd-reachout-secondary" onClick={() => send("mailto")}>
              ✉ or send it by email
            </button>
            <button
              type="button"
              className="cd-reachout-secondary"
              onClick={() => { fileReach("the corner"); onOpenCorner && onOpenCorner(); onClose(); }}
            >
              📡 or talk to the corner right now — always awake
            </button>
          </>
        ) : (
          <div className="cd-reachout-done">
            <div className="cd-cite" style={{ marginBottom: 14 }}>
              The fight has a witness now. The Mask just lost its favorite weapon — nobody knowing.
            </div>
            <button type="button" className="cd-btn cd-btn--rep" onClick={onClose}>BACK TO IT →</button>
          </div>
        )}
      </div>
    </div>
  );
}

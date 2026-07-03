import React, { useState } from "react";
import { useAppData } from "../../../hooks/useAppData.js";
import { partnerAction } from "../../../lib/zoneService.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";
import { playSound } from "../../../lib/sounds.js";
import { WITNESS } from "../witness/witnessLines.js";

// The three partner moves. Templates come from the Witness's voice —
// every one is warmth, never a demand. Editable before sending.
const ACTIONS = [
  { kind: "nudge", icon: "🔥", label: "Nudge", templates: WITNESS.partnerNudgeTemplates },
  { kind: "celebrate", icon: "🎉", label: "Celebrate", templates: WITNESS.partnerCelebrateTemplates },
  { kind: "request_proof", icon: "👀", label: "Ask for proof", templates: WITNESS.partnerRequestProofTemplates },
];

export default function PartnerTools({ onSent }) {
  const { pushToast, settings } = useAppData();
  const [active, setActive] = useState(null);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  const pick = (a) => {
    if (active === a.kind) {
      setActive(null);
      setNote("");
      return;
    }
    setActive(a.kind);
    setNote(a.templates[Math.floor(Math.random() * a.templates.length)] || "");
  };

  const send = async () => {
    if (!active || sending) return;
    setSending(true);
    try {
      const res = await partnerAction(active, note.trim());
      if (res && res.sent === false && res.reason === "already_sent") {
        pushToast({
          type: "info",
          title: "Already sent today",
          message: "Presence over pressure 🤍",
        });
      } else {
        pushToast({ type: "success", title: "Sent 🔥", message: "Your partner will feel it." });
        playSound("pop", settings);
        onSent?.();
      }
      setActive(null);
      setNote("");
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't send", message: zoneErrorMessage(err) });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="zn-card">
      <p className="zn-eyebrow">Partner tools</p>
      <div className="zn-cats">
        {ACTIONS.map((a) => (
          <button
            key={a.kind}
            type="button"
            className={`zn-cat${active === a.kind ? " zn-cat--active" : ""}`}
            aria-pressed={active === a.kind}
            onClick={() => pick(a)}
          >
            <span className="zn-cat__icon" aria-hidden="true">{a.icon}</span>
            {a.label}
          </button>
        ))}
      </div>
      {active && (
        <div style={{ marginTop: 12 }}>
          <textarea
            className="zn-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={280}
            aria-label="Message to your partner"
          />
          <button
            type="button"
            className="zn-btn"
            style={{ marginTop: 8 }}
            disabled={sending || !note.trim()}
            onClick={send}
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      )}
    </div>
  );
}

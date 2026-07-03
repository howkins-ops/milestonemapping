import React, { useState } from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { useAppData } from "../../../hooks/useAppData.js";
import { deleteOwnMessage } from "../../../lib/zoneService.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";
import ReportButton from "../shared/ReportButton.jsx";

// One chat bubble. ⋯ toggles inline actions: delete my own (two-tap
// confirm) or report someone else's.
export default function MessageBubble({ msg, mine, onChanged }) {
  const { userId } = useZoneCtx();
  const { pushToast } = useAppData();
  const [actionsOpen, setActionsOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const time = msg.created_at
    ? new Date(msg.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "";

  if (msg.deleted_at) {
    return (
      <div className={`zn-bubble zn-bubble--deleted${mine ? " zn-bubble--mine" : ""}`}>
        message removed
      </div>
    );
  }

  const senderName = msg.member?.display_name || msg.member?.username;

  const doDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setBusy(true);
    try {
      await deleteOwnMessage(msg.id, userId);
      if (onChanged) onChanged();
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't remove message", message: zoneErrorMessage(err) });
    } finally {
      setBusy(false);
      setConfirming(false);
      setActionsOpen(false);
    }
  };

  return (
    <div className={`zn-bubble${mine ? " zn-bubble--mine" : ""}`}>
      {!mine && senderName && (
        <div style={{ fontSize: 10.5, fontWeight: 800, color: "var(--zfire)", marginBottom: 2 }}>
          {senderName}
        </div>
      )}
      <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.body}</div>
      <div className="zn-bubble__meta" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span>{time}</span>
        <button
          type="button"
          aria-label="Message actions"
          aria-expanded={actionsOpen}
          onClick={() => {
            setActionsOpen((o) => !o);
            setConfirming(false);
          }}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-soft)",
            cursor: "pointer",
            padding: "0 4px",
            fontSize: 13,
            lineHeight: 1,
            opacity: 0.7,
          }}
        >
          ⋯
        </button>
      </div>
      {actionsOpen && (
        <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
          {mine ? (
            <button
              type="button"
              className="zn-btn zn-btn--danger zn-btn--small"
              onClick={doDelete}
              disabled={busy}
            >
              {busy ? "Removing…" : confirming ? "Really delete?" : "Delete"}
            </button>
          ) : (
            <ReportButton contentType="message" contentId={msg.id} targetUser={msg.sender} label="" />
          )}
        </div>
      )}
    </div>
  );
}

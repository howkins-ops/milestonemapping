import React, { useState } from "react";
import { reportContent } from "../../../lib/zoneService.js";
import { useAppData } from "../../../hooks/useAppData.js";

const REASONS = ["Spam", "Harassment or bullying", "Inappropriate content", "Impersonation", "Something else"];

// Report affordance for every piece of user content (App Store UGC requirement).
export default function ReportButton({ contentType, contentId, targetUser, label = "Report" }) {
  const { pushToast } = useAppData();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await reportContent({ targetUser, contentType, contentId, reason, details });
      pushToast({ type: "success", title: "Reported", message: "Thanks — we'll take a look.", icon: "🛡️" });
      setOpen(false);
      setDetails("");
    } catch {
      pushToast({ type: "error", title: "Couldn't send report", message: "Try again in a moment." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="zn-btn zn-btn--ghost zn-btn--small"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        ⚑ {label}
      </button>
      {open && (
        <div className="zn-overlay zn-overlay--center" onClick={() => setOpen(false)}>
          <div className="zn-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Report content">
            <h3 className="zn-sheet__title">Report this</h3>
            <div className="zn-field">
              <label className="zn-label" htmlFor="zn-report-reason">Reason</label>
              <select
                id="zn-report-reason"
                className="zn-input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="zn-field">
              <label className="zn-label" htmlFor="zn-report-details">Anything we should know? (optional)</label>
              <textarea
                id="zn-report-details"
                className="zn-textarea"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={500}
              />
            </div>
            <div className="zn-2col">
              <button type="button" className="zn-btn zn-btn--ghost" onClick={() => setOpen(false)}>Cancel</button>
              <button type="button" className="zn-btn" onClick={submit} disabled={busy}>
                {busy ? "Sending…" : "Send report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

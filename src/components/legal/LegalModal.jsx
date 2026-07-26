import React, { useEffect, useState } from "react";
import Modal from "../ui/Modal.jsx";

// Renders the bundled legal docs (public/legal/*.html) inside the app.
// Never navigate the WKWebView to the raw HTML files — there is no way back.
const DOCS = {
  privacy: { path: "/legal/privacy.html", title: "Privacy Policy" },
  terms: { path: "/legal/terms.html", title: "Terms of Service" },
  guidelines: { path: "/legal/guidelines.html", title: "Community Guidelines" },
  health: { path: "/legal/health-disclaimer.html", title: "Health Disclaimer" },
  support: { path: "/legal/support.html", title: "Support" },
  deleteAccount: { path: "/legal/delete-account.html", title: "Delete Your Account" },
};

export default function LegalModal({ doc, onClose }) {
  const [html, setHtml] = useState("");
  const [error, setError] = useState(false);
  const info = DOCS[doc];

  useEffect(() => {
    if (!info) return;
    let cancelled = false;
    setHtml("");
    setError(false);
    fetch(info.path)
      .then((r) => r.text())
      .then((text) => {
        if (cancelled) return;
        const parsed = new DOMParser().parseFromString(text, "text/html");
        setHtml(parsed.body ? parsed.body.innerHTML : text);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [doc]);

  if (!info) return null;

  return (
    <Modal open onClose={onClose} title={info.title} wide>
      <div style={{ maxHeight: "65vh", overflowY: "auto", padding: "4px 2px", WebkitOverflowScrolling: "touch" }}>
        {error && <p style={{ color: "var(--text-soft, #9ab)" }}>Couldn't load the document. Please try again.</p>}
        {!error && !html && <p style={{ color: "var(--text-soft, #9ab)" }}>Loading…</p>}
        {html && (
          <div
            className="legal-doc"
            style={{ fontSize: 14, lineHeight: 1.65, color: "var(--text-main, #eafbff)" }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
    </Modal>
  );
}

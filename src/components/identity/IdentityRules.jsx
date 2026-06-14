import React, { useState } from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { IDENTITY_RULE_EXAMPLES } from "../../lib/constants.js";

export default function IdentityRules() {
  const { identity, addIdentityRule, deleteIdentityRule } = useAppData();
  const rules = identity.rules || [];
  const [draft, setDraft] = useState("");

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    addIdentityRule(text);
    setDraft("");
  };

  const unusedExamples = IDENTITY_RULE_EXAMPLES.filter(
    (ex) => !rules.some((r) => r.text.toLowerCase() === ex.toLowerCase())
  );

  return (
    <Card>
      <div className="kicker" style={{ marginBottom: 12 }}>
        IDENTITY RULES — NON-NEGOTIABLES
      </div>

      {rules.length > 0 && (
        <ul style={{ listStyle: "none", margin: "0 0 16px", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {rules.map((rule, i) => (
            <li key={rule.id} className="row anim-slide-up" style={{ animationDelay: `${i * 40}ms` }}>
              <span className="mono" style={{ color: "var(--brand-green)", fontSize: 13 }}>
                §{String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ flex: 1 }}>{rule.text}</span>
              <Button
                variant="ghost"
                size="sm"
                style={{ color: "var(--brand-red)" }}
                onClick={() => deleteIdentityRule(rule.id)}
                aria-label={`Delete rule: ${rule.text}`}
              >
                ✕
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="row">
        <input
          className="input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="I am the kind of person who..."
          aria-label="New identity rule"
        />
        <Button variant="primary" onClick={submit} disabled={!draft.trim()}>
          + Add (+20 XP)
        </Button>
      </div>

      {unusedExamples.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <p className="soft" style={{ fontSize: 12.5, marginBottom: 8 }}>
            Starter rules — tap to adopt:
          </p>
          <div className="row row--wrap" style={{ gap: 6 }}>
            {unusedExamples.map((ex) => (
              <button
                key={ex}
                type="button"
                className="badge"
                style={{ cursor: "pointer" }}
                onClick={() => addIdentityRule(ex)}
              >
                + {ex}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

import React from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import TextArea from "../ui/TextArea.jsx";
import { DEFAULT_POWER_STATEMENT } from "../../lib/constants.js";

export default function PowerStatement({ value, onChange }) {
  return (
    <Card variant="pink">
      <div className="kicker" style={{ color: "var(--brand-pink)", marginBottom: 12 }}>
        POWER STATEMENT
      </div>
      <TextArea
        label="The sentence the future you operates from"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={DEFAULT_POWER_STATEMENT}
      />
      <div className="row" style={{ marginTop: 12 }}>
        <Button variant="neon" size="sm" onClick={() => onChange(DEFAULT_POWER_STATEMENT)}>
          ⚡ Generate Statement
        </Button>
      </div>
      {value && (
        <p
          className="anim-transmission mono"
          style={{ marginTop: 18, fontSize: 16, lineHeight: 1.7, color: "var(--text-main)" }}
        >
          “{value}”
        </p>
      )}
    </Card>
  );
}

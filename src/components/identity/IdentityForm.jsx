import React, { useState } from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import TextArea from "../ui/TextArea.jsx";
import PowerStatement from "./PowerStatement.jsx";
import { useAppData } from "../../hooks/useAppData.js";

export default function IdentityForm() {
  const { identity, updateIdentity } = useAppData();
  const [form, setForm] = useState({
    currentIdentity: identity.currentIdentity || "",
    futureIdentity: identity.futureIdentity || "",
    powerStatement: identity.powerStatement || ""
  });

  const save = () => updateIdentity(form);

  return (
    <div className="stack">
      <Card variant="glass">
        <TextArea
          label="Current identity — What version of you are you leaving behind?"
          rows={3}
          value={form.currentIdentity}
          onChange={(e) => setForm({ ...form, currentIdentity: e.target.value })}
          placeholder="The one who waits for the perfect moment..."
        />
      </Card>

      <Card variant="neon">
        <TextArea
          label="Future identity — Who are you becoming?"
          rows={3}
          value={form.futureIdentity}
          onChange={(e) => setForm({ ...form, futureIdentity: e.target.value })}
          placeholder="The operator who executes regardless of mood..."
        />
      </Card>

      <PowerStatement
        value={form.powerStatement}
        onChange={(powerStatement) => setForm({ ...form, powerStatement })}
      />

      <Button variant="gold" size="lg" onClick={save} style={{ alignSelf: "flex-start" }}>
        🧬 Save Identity
      </Button>
    </div>
  );
}

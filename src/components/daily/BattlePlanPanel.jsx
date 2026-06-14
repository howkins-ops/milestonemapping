import React, { useState } from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import TextArea from "../ui/TextArea.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import { useDailyLog } from "../../hooks/useDailyLog.js";
import { useToasts } from "../../hooks/useToasts.js";
import { useAppData } from "../../hooks/useAppData.js";

export default function BattlePlanPanel() {
  const { todayLog, updateTodayLog } = useDailyLog();
  const { pushToast } = useToasts();
  const { saveDailyProof } = useAppData();
  const [plan, setPlan] = useState(todayLog.battlePlan || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!plan.trim()) return;
    setSaving(true);
    updateTodayLog({ battlePlan: plan });

    // Save as daily proof entry in Supabase
    await saveDailyProof({
      title: "Battle Plan",
      description: plan,
      proof_type: "battle_plan",
      xp_earned: 25,
    });

    setSaving(false);
    pushToast({ type: "success", title: "Battle plan saved", message: "One target. Full focus." });
  };

  return (
    <section>
      <SectionHeader title="Battle Plan" icon="🎯" sub="One decisive strike." />
      <Card variant="pink">
        <TextArea
          label="What is the one thing that would make today a win?"
          rows={3}
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          placeholder="The single domino that knocks the rest down..."
        />
        <Button
          variant="secondary"
          onClick={save}
          disabled={!plan.trim() || saving}
          style={{ marginTop: 14 }}
        >
          {saving ? "Saving..." : "Commit to the Plan"}
        </Button>
      </Card>
    </section>
  );
}

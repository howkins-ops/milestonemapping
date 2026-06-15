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
      <SectionHeader title="Battle Plan" icon="🎯" sub="One domino. Everything else is noise." />
      <Card variant="pink">
        <img
          src="/assets/daily/badge-battle-plan.png"
          alt=""
          onError={(e) => { e.currentTarget.style.display = "none"; }}
          style={{ width: 48, height: 48, objectFit: "contain", marginBottom: 8 }}
        />
        <TextArea
          label="What is the single move that makes today a victory?"
          rows={3}
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          placeholder="If you could only do ONE thing today and call it a win — what is it?"
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

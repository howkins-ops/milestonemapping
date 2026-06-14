import React from "react";
import Card from "../ui/Card.jsx";
import ProgressBar from "../ui/ProgressBar.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import { useMilestones } from "../../hooks/useMilestones.js";
import { getMilestoneProgress, getNextIncompleteAction } from "../../lib/progress.js";

// Compact battlefield report of every active milestone, shown beside the review form.
export default function MilestoneReviewCards() {
  const { active } = useMilestones();
  if (active.length === 0) return null;

  return (
    <section>
      <SectionHeader title="Battlefield Report" icon="📡" sub="Where each mission stands this week." />
      <div className="grid-3 stagger">
        {active.map((m) => {
          const next = getNextIncompleteAction(m);
          return (
            <Card key={m.id} variant="glass">
              <h4 style={{ fontSize: 15, marginBottom: 10 }}>{m.title}</h4>
              <ProgressBar value={getMilestoneProgress(m)} max={100} />
              <p className="soft" style={{ fontSize: 12.5, marginTop: 10 }}>
                {next ? `Next: ${next.text}` : "Ready to unlock"}
              </p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

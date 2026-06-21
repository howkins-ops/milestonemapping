import React, { useState } from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import Badge, { PRIORITY_TONES, PRIORITY_LABELS, STATUS_TONES, STATUS_LABELS } from "../ui/Badge.jsx";
import ProgressRing from "../ui/ProgressRing.jsx";
import ConfirmModal from "../ui/ConfirmModal.jsx";
import MilestoneVisionCard from "./MilestoneVisionCard.jsx";
import MilestoneIdentityCard from "./MilestoneIdentityCard.jsx";
import MilestoneActions from "./MilestoneActions.jsx";
import MilestoneProgressTracker from "./MilestoneProgressTracker.jsx";
import SmartActionGenerator from "./SmartActionGenerator.jsx";
import MilestoneWizard from "./MilestoneWizard.jsx";
import MilestoneRewards from "./MilestoneRewards.jsx";
import { useMilestones } from "../../hooks/useMilestones.js";
import { getMilestoneProgress, isGoalReached } from "../../lib/progress.js";
import { formatShortDate } from "../../lib/dates.js";

export default function MilestoneDetailPage({ milestoneId, onBack }) {
  const { milestones, updateMilestone, deleteMilestone, completeMilestone } = useMilestones();
  const milestone = milestones.find((m) => m.id === milestoneId);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (!milestone) {
    return (
      <div className="anim-fade-in">
        <p className="muted">This milestone no longer exists.</p>
        <Button variant="secondary" onClick={onBack} style={{ marginTop: 14 }}>
          ← Back to Project
        </Button>
      </div>
    );
  }

  const progress = getMilestoneProgress(milestone);
  const actions = milestone.actions || [];
  const allDone = actions.length > 0 && actions.every((a) => a.done);
  const goalReached = isGoalReached(milestone);

  // Cumulative threshold carry-over: milestones in a project are sequential
  // thresholds on the same metric (25 → 50 → 100 sales), so this milestone's
  // counter should pick up where the previous one's target left off.
  const siblings = milestones
    .filter((m) => m.projectId === milestone.projectId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const prevMilestone = siblings[siblings.findIndex((m) => m.id === milestone.id) - 1] || null;
  const carryFrom = prevMilestone && prevMilestone.targetValue > 0 ? prevMilestone.targetValue : 0;
  const carryUnit = prevMilestone ? prevMilestone.unit || "" : "";
  const completed = milestone.status === "completed";

  return (
    <div className="anim-fade-in">
      <Button variant="ghost" size="sm" onClick={onBack} style={{ marginBottom: 16 }}>
        ← Back to Project
      </Button>

      {/* Header */}
      <Card variant={completed ? "completed" : milestone.priority === "mission_critical" ? "pink" : "neon"}>
        <div className="row row--between row--wrap" style={{ gap: 20, alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 320px", minWidth: 0 }}>
            <h1 style={{ fontSize: "clamp(22px, 3.4vw, 32px)" }}>{milestone.title}</h1>
            {milestone.description && (
              <p className="muted" style={{ marginTop: 8 }}>{milestone.description}</p>
            )}
            {milestone.targetDate && (
              <p className="mono soft" style={{ fontSize: 12.5, marginTop: 10 }}>
                TARGET: {formatShortDate(milestone.targetDate)}
              </p>
            )}
            <p style={{ fontSize: 13, marginTop: 8, color: "var(--brand-gold)" }}>🎁 Rewards — view & edit below</p>

            <div className="row row--wrap" style={{ marginTop: 16 }}>
              <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                ✎ Edit Milestone
              </Button>
              {!completed && milestone.status !== "paused" && (
                <Button variant="ghost" size="sm" onClick={() => updateMilestone(milestone.id, { status: "paused" })}>
                  ⏸ Pause
                </Button>
              )}
              {milestone.status === "paused" && (
                <Button variant="ghost" size="sm" onClick={() => updateMilestone(milestone.id, { status: "active" })}>
                  ▶ Resume
                </Button>
              )}
              <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                Delete
              </Button>
            </div>
          </div>
          <ProgressRing value={progress} size={136} label="Mission Progress" />
        </div>

        {/* Numeric progress tracker — lives inside the header so the count + ring read as one unit */}
        <MilestoneProgressTracker
          milestone={milestone}
          onUpdate={updateMilestone}
          carryFrom={carryFrom}
          carryUnit={carryUnit}
        />
      </Card>

      {/* Unlock */}
      {(allDone || goalReached) && !completed && (
        <Card variant="gold" className="anim-glow-pulse" style={{ marginTop: 16, textAlign: "center" }}>
          <p style={{ fontWeight: 700, marginBottom: 14, color: "var(--brand-gold)" }}>
            Every action is complete. The coordinates are reached.
          </p>
          <Button variant="gold" size="lg" onClick={() => completeMilestone(milestone.id)}>
            🏆 UNLOCK MILESTONE
          </Button>
        </Card>
      )}

      <div className="stack" style={{ marginTop: 16 }}>
        <MilestoneVisionCard milestone={milestone} />

        {milestone.whyItMatters && (
          <Card variant="gold">
            <div className="kicker" style={{ color: "var(--brand-gold)", marginBottom: 10 }}>
              WHY IT MATTERS
            </div>
            <h3 style={{ fontSize: 17, marginBottom: 10 }}>Your emotional fuel.</h3>
            <p className="muted" style={{ lineHeight: 1.7 }}>{milestone.whyItMatters}</p>
          </Card>
        )}

        <MilestoneIdentityCard milestone={milestone} />

      </div>

      <MilestoneActions milestone={milestone} />
      <SmartActionGenerator milestone={milestone} />

      {/* Rewards — ungated: view, edit, and add photos any time */}
      <MilestoneRewards milestone={milestone} />

      {editOpen && (
        <MilestoneWizard
          open={editOpen}
          onClose={() => setEditOpen(false)}
          initial={milestone}
          onCreate={() => {}}
          onUpdate={updateMilestone}
        />
      )}

      <ConfirmModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteMilestone(milestone.id);
          onBack();
        }}
        title="Delete this milestone?"
        message={`"${milestone.title}" and all of its actions will be removed from the map. This cannot be undone.`}
        confirmLabel="Delete Milestone"
        danger
      />
    </div>
  );
}

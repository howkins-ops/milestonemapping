import React, { useState, useMemo } from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import TextArea from "../ui/TextArea.jsx";
import Select from "../ui/Select.jsx";
import WeeklyScorecard from "./WeeklyScorecard.jsx";
import AccountabilityCheckpoint from "./AccountabilityCheckpoint.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { useMilestones } from "../../hooks/useMilestones.js";
import { parseCommitments, computeReviewStreak, computeCommitmentStreak } from "../../lib/utils.js";

const EMPTY = {
  biggestWin: "",
  avoided: "",
  lesson: "",
  milestoneMovedMost: "",
  milestoneNeedsAttention: "",
  nextWeekActions: "",
  rewardChasing: "",
  executionScore: 5,
  energyScore: 5,
  focusScore: 5,
  disciplineScore: 5,
  mindsetScore: 5,
  notes: ""
};

export default function WeeklyReviewForm() {
  const { saveWeeklyReview, weeklyReviews } = useAppData();
  const { milestones } = useMilestones();
  const [form, setForm] = useState(EMPTY);

  const lastReview = weeklyReviews.length > 0 ? weeklyReviews[0] : null;

  const [commitmentChecks, setCommitmentChecks] = useState(() => {
    const commits = lastReview?.commitments || [];
    return commits.map((text) => ({ text, done: false }));
  });

  const reviewStreak = useMemo(() => computeReviewStreak(weeklyReviews), [weeklyReviews]);
  const commitmentStreak = useMemo(() => computeCommitmentStreak(weeklyReviews), [weeklyReviews]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setScore = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const milestoneOptions = [
    { value: "", label: "— Select milestone —" },
    ...milestones.map((m) => ({ value: m.title, label: m.title }))
  ];

  const submit = () => {
    const commitments = parseCommitments(form.nextWeekActions);
    saveWeeklyReview({ ...form, commitments, lastWeekChecks: commitmentChecks });
    setForm(EMPTY);
    setCommitmentChecks([]);
  };

  return (
    <div className="stack">
      <AccountabilityCheckpoint
        lastReview={lastReview}
        checks={commitmentChecks}
        onChange={setCommitmentChecks}
        reviewStreak={reviewStreak}
        commitmentStreak={commitmentStreak}
      />

      <Card>
        <div className="stack">
          <TextArea label="1. What was your biggest win this week?" rows={2} value={form.biggestWin} onChange={set("biggestWin")} />
          <TextArea label="2. What did you avoid?" rows={2} value={form.avoided} onChange={set("avoided")} />
          <TextArea label="3. What did this week teach you?" rows={2} value={form.lesson} onChange={set("lesson")} />
          <Select
            label="4. Which milestone moved forward the most?"
            value={form.milestoneMovedMost}
            onChange={set("milestoneMovedMost")}
            options={milestoneOptions}
          />
          <Select
            label="5. Which milestone needs attention?"
            value={form.milestoneNeedsAttention}
            onChange={set("milestoneNeedsAttention")}
            options={milestoneOptions}
          />
          <TextArea
            label="6. What are your commitments for next week? (one per line — you will be held to these)"
            rows={4}
            value={form.nextWeekActions}
            onChange={set("nextWeekActions")}
            placeholder={"Close the deal\nExercise 4 times\nRead 30 pages"}
          />
          <TextArea label="7. What reward are you chasing next?" rows={2} value={form.rewardChasing} onChange={set("rewardChasing")} />
        </div>
      </Card>

      <WeeklyScorecard scores={form} onChange={setScore} />

      <Card variant="glass">
        <TextArea label="Field notes (optional)" rows={2} value={form.notes} onChange={set("notes")} />
      </Card>

      <Button variant="gold" size="lg" onClick={submit} style={{ alignSelf: "center" }}>
        🧭 Lock In the Review (+150 XP)
      </Button>
    </div>
  );
}

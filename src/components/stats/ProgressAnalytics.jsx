import React, { useMemo } from "react";
import Card from "../ui/Card.jsx";
import SectionHeader from "../ui/SectionHeader.jsx";
import SimpleBarChart from "./SimpleBarChart.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { getMilestoneProgress } from "../../lib/progress.js";
import { getTodayKey } from "../../lib/dates.js";

function lastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

export default function ProgressAnalytics() {
  const { milestones, weeklyReviews } = useAppData();

  // Actions completed per day over the last 14 days.
  const actionsOverTime = useMemo(() => {
    const counts = {};
    for (const m of milestones) {
      for (const a of m.actions || []) {
        if (a.done && a.completedAt) {
          const key = a.completedAt.slice(0, 10);
          counts[key] = (counts[key] || 0) + 1;
        }
      }
    }
    return lastNDays(14).map((d) => {
      const key = getTodayKey(d);
      return {
        label: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
        value: counts[key] || 0
      };
    });
  }, [milestones]);

  // Weekly execution score trend (latest 10 reviews, oldest → newest).
  const scoreTrend = useMemo(
    () =>
      [...weeklyReviews]
        .slice(0, 10)
        .reverse()
        .map((r) => ({
          label: `W${r.weekNumber}`,
          value:
            (Number(r.executionScore) || 0) +
            (Number(r.energyScore) || 0) +
            (Number(r.focusScore) || 0) +
            (Number(r.disciplineScore) || 0) +
            (Number(r.mindsetScore) || 0),
          max: 50,
          color: "linear-gradient(180deg, #FACC15, #FB923C)"
        })),
    [weeklyReviews]
  );

  // Average progress per category.
  const categoryProgress = useMemo(() => {
    const byCat = {};
    for (const m of milestones) {
      const cat = m.category || "Other";
      if (!byCat[cat]) byCat[cat] = [];
      byCat[cat].push(getMilestoneProgress(m));
    }
    return Object.entries(byCat).map(([label, vals]) => ({
      label,
      value: Math.round(vals.reduce((s, v) => s + v, 0) / vals.length),
      max: 100,
      color: "linear-gradient(180deg, #8B5CF6, #FF3EDB)"
    }));
  }, [milestones]);

  // Per-milestone completion.
  const perMilestone = useMemo(
    () =>
      milestones.map((m) => ({
        label: m.title.length > 14 ? `${m.title.slice(0, 13)}…` : m.title,
        value: getMilestoneProgress(m),
        max: 100
      })),
    [milestones]
  );

  return (
    <>
      <SectionHeader title="Actions Completed — Last 14 Days" icon="🧱" />
      <Card>
        <SimpleBarChart bars={actionsOverTime} />
      </Card>

      <SectionHeader title="Weekly Execution Score Trend" icon="📈" />
      <Card>
        <SimpleBarChart bars={scoreTrend} valueSuffix="/50" />
      </Card>

      <div className="grid-2" style={{ marginTop: 24 }}>
        <div>
          <SectionHeader title="Progress by Category" icon="🗂" />
          <Card>
            <SimpleBarChart bars={categoryProgress} valueSuffix="%" />
          </Card>
        </div>
        <div>
          <SectionHeader title="Completion by Milestone" icon="🎯" />
          <Card>
            <SimpleBarChart bars={perMilestone} valueSuffix="%" />
          </Card>
        </div>
      </div>
    </>
  );
}

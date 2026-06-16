import React, { useState } from "react";
import Card from "../ui/Card.jsx";
import Button from "../ui/Button.jsx";
import TextArea from "../ui/TextArea.jsx";
import { useDailyLog } from "../../hooks/useDailyLog.js";
import { useToasts } from "../../hooks/useToasts.js";
import { useAppData } from "../../hooks/useAppData.js";
import { upsertGratitudeEntry } from "../../lib/gratitudeService.js";
import { incrementStat, updateStreak } from "../../lib/statsService.js";
import { setMemory } from "../../lib/memoryService.js";
import { getTodayKey } from "../../lib/dates.js";

const IMPACT_STATS = [
  { label: "Depression Risk", value: "↓ 25%", color: "#00FFBF", delay: 0,   icon: "/assets/daily/stat-heart-icon.png" },
  { label: "Anxiety Levels", value: "↓ 23%", color: "#00FFBF", delay: 120,  icon: "/assets/daily/stat-calm-icon.png" },
  { label: "XP Earned",       value: "+50 XP", color: "#FACC15", delay: 240, icon: "/assets/daily/stat-xp-icon.png" },
];

export default function GratitudePanel() {
  const { todayLog, updateTodayLog } = useDailyLog();
  const { pushToast } = useToasts();
  const { userId } = useAppData();

  const [form, setForm] = useState(
    todayLog.gratitude || { entry1: "", entry2: "", entry3: "" }
  );
  const [impactVisible, setImpactVisible] = useState(
    !!(todayLog.gratitude?.entry1 && todayLog.gratitude?.entry2 && todayLog.gratitude?.entry3)
  );
  const [saving, setSaving] = useState(false);

  const allFilled = form.entry1.trim() && form.entry2.trim() && form.entry3.trim();

  const save = async () => {
    if (!allFilled) return;
    setSaving(true);

    // Write to local state (blob syncs via useAppData debounce)
    updateTodayLog({ gratitude: form });

    // Dual-write to normalized gratitude_entries table
    if (userId) {
      const date = getTodayKey();
      await upsertGratitudeEntry(userId, date, {
        items: [form.entry1, form.entry2, form.entry3],
        reflection: form.entry3,
      });
      incrementStat(userId, "gratitude_count");
      updateStreak(userId);
      setMemory(userId, "preference", "last_gratitude_date", date, "gratitude_save");
    }

    setSaving(false);
    setImpactVisible(true);
    pushToast({
      type: "success",
      title: "Morning primed.",
      message: "Anxiety drops 23%. You're already ahead of most people today."
    });
  };

  return (
    <section className="gratitude-ritual">
      <Card className="gratitude-card ritual-image-card ritual-image-card--gratitude">
        <div className="gratitude-card__art" aria-hidden="true" />
        <div className="gratitude-card__header">
          <div>
            <span className="gratitude-card__eyebrow">PRIME YOUR STATE</span>
            <h2 className="gratitude-card__title">Gratitude Lock-In</h2>
            <p className="gratitude-card__sub">Find the win, honor the person, alchemize the hard thing.</p>
          </div>
        </div>

        <div className="gratitude-prompt-grid">
          <TextArea
            className="gratitude-prompt gratitude-prompt--win"
            label="What are you grateful for this morning?"
            rows={2}
            placeholder="A win, a feeling, a moment..."
            value={form.entry1}
            onChange={(e) => setForm({ ...form, entry1: e.target.value })}
          />
          <TextArea
            className="gratitude-prompt gratitude-prompt--person"
            label="Who are you grateful for?"
            rows={2}
            placeholder="Someone who showed up for you..."
            value={form.entry2}
            onChange={(e) => setForm({ ...form, entry2: e.target.value })}
          />
          <TextArea
            className="gratitude-prompt gratitude-prompt--hardship"
            label="What hardship are you grateful for?"
            rows={2}
            placeholder="A struggle that made you stronger..."
            value={form.entry3}
            onChange={(e) => setForm({ ...form, entry3: e.target.value })}
          />
        </div>

          {!impactVisible && (
            <Button
              variant="secondary"
              className="gratitude-lock-btn"
              onClick={save}
              disabled={!allFilled || saving}
            >
              {saving ? "Saving..." : "Lock In Gratitude"}
            </Button>
          )}

          {impactVisible && (
            <div className="gratitude-impact anim-scale-pop">
              <div className="gratitude-impact-header">
                <img
                  src="/assets/daily/gratitude-locked-seal.png"
                  alt=""
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                  style={{ width: 32, height: 32, objectFit: "contain", flexShrink: 0 }}
                />
                <span className="gratitude-impact-check">✓</span>
                <span className="gratitude-impact-title">GRATITUDE LOCKED IN</span>
              </div>
              <p className="gratitude-impact-science">
                Morning gratitude is Tony Robbins' #1 priming tool — and science backs it:
                23% drop in anxiety, 25% reduction in depression risk. You just did the work.
              </p>
              <div className="gratitude-impact-stats">
                {IMPACT_STATS.map((s) => (
                  <div
                    key={s.label}
                    className="gratitude-impact-stat anim-slide-up"
                    style={{ animationDelay: `${s.delay}ms`, "--stat-color": s.color }}
                  >
                    <img
                      src={s.icon}
                      alt=""
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                      style={{ width: 28, height: 28, objectFit: "contain" }}
                    />
                    <span className="gratitude-impact-stat-value" style={{ color: s.color }}>
                      {s.value}
                    </span>
                    <span className="gratitude-impact-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
              <p className="gratitude-impact-source">
                Source: Gratitude Intervention Meta-Analysis, 2023 (n = 64 RCTs)
              </p>
              <button
                className="daily-commit-edit-btn"
                onClick={() => setImpactVisible(false)}
                style={{ marginTop: 8 }}
              >
                Edit entries
              </button>
            </div>
          )}
      </Card>
    </section>
  );
}

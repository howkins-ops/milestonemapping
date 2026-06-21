import React, { useState } from "react";
import Card from "../ui/Card.jsx";
import ScienceInfo from "../ui/ScienceInfo.jsx";
import GratitudeWizard from "./GratitudeWizard.jsx";
import { useDailyLog } from "../../hooks/useDailyLog.js";
import { useToasts } from "../../hooks/useToasts.js";
import { useAppData } from "../../hooks/useAppData.js";
import { upsertGratitudeEntry } from "../../lib/gratitudeService.js";
import { incrementStat, updateStreak } from "../../lib/statsService.js";
import { setMemory } from "../../lib/memoryService.js";
import { getTodayKey } from "../../lib/dates.js";

// Storage schema stays { entry1, entry2, entry3 } for back-compat:
// entry1 = the moment · entry2 = mental subtraction · entry3 = the hard thing.
const REVEAL_LABELS = ["The moment", "Without it", "The gift"];

export default function GratitudePanel() {
  const { todayLog, updateTodayLog } = useDailyLog();
  const { pushToast } = useToasts();
  const { userId } = useAppData();

  const saved = todayLog.gratitude;
  const isLocked = !!(saved?.entry1 && saved?.entry2 && saved?.entry3);
  const extras = saved?.extras || [];

  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  // Re-write the normalized row with the full current entry set.
  const syncRow = (g) => {
    if (!userId) return;
    upsertGratitudeEntry(userId, getTodayKey(), {
      items: [g.entry1, g.entry2, g.entry3, ...(g.extras || [])],
      reflection: g.entry3,
    });
  };

  const handleComplete = async ({ moment, subtraction, hardship }) => {
    // Preserve any extra moments captured earlier in the day.
    const form = { entry1: moment, entry2: subtraction, entry3: hardship, extras };

    // Write to local state (blob syncs via useAppData debounce)
    updateTodayLog({ gratitude: form });

    // Dual-write to normalized gratitude_entries table
    if (userId) {
      const date = getTodayKey();
      syncRow(form);
      incrementStat(userId, "gratitude_count");
      updateStreak(userId);
      setMemory(userId, "preference", "last_gratitude_date", date, "gratitude_save");
    }

    setOpen(false);
    pushToast({
      type: "success",
      title: "Morning primed.",
      message: "You went deep, not wide. Anxiety drops 23% — you're already ahead of the day."
    });
  };

  const addExtra = () => {
    const text = draft.trim();
    if (!text) return;
    const next = { ...saved, extras: [...extras, text] };
    setDraft("");
    setAdding(false);
    updateTodayLog({ gratitude: next });
    syncRow(next);
    pushToast({
      type: "success",
      title: "Noted.",
      message: "Gratitude compounds — keep catching the good ones.",
    });
  };

  const removeExtra = (idx) => {
    const next = { ...saved, extras: extras.filter((_, i) => i !== idx) };
    updateTodayLog({ gratitude: next });
    syncRow(next);
  };

  const entries = [saved?.entry1, saved?.entry2, saved?.entry3];

  return (
    <section className="gratitude-ritual">
      <Card className="gratitude-card ritual-image-card ritual-image-card--gratitude">
        <div className="gratitude-card__art" aria-hidden="true" />
        <ScienceInfo ids={["gratitude"]} />
        <div className="gratitude-card__header">
          <div>
            <span className="gratitude-card__eyebrow">PRIME YOUR STATE</span>
            <h2 className="gratitude-card__title">Gratitude Lock-In</h2>
            <p className="gratitude-card__sub">
              Not a list — a journal. Go deep on one real moment. Depth is where the science lives.
            </p>
          </div>
        </div>

        {isLocked ? (
          <div className="gratitude-locked anim-fade-in">
            <div className="gratitude-locked-head">
              <span className="gratitude-impact-check">✓</span>
              <span className="gratitude-impact-title">GRATITUDE LOCKED IN</span>
            </div>
            <ul className="gratitude-locked-entries">
              {entries.map((text, i) =>
                text ? (
                  <li key={i} className="gratitude-locked-entry">
                    <span className="gratitude-locked-entry-label">{REVEAL_LABELS[i]}</span>
                    <p className="gratitude-locked-entry-text">"{text}"</p>
                  </li>
                ) : null
              )}
            </ul>

            {extras.length > 0 && (
              <div className="gratitude-extras">
                <span className="gratitude-extras-label">ALSO GRATEFUL FOR</span>
                <ul className="gratitude-locked-entries">
                  {extras.map((text, i) => (
                    <li key={i} className="gratitude-locked-entry gratitude-extra-entry">
                      <p className="gratitude-locked-entry-text">"{text}"</p>
                      <button
                        className="gratitude-extra-remove"
                        aria-label="Remove"
                        onClick={() => removeExtra(i)}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {adding ? (
              <div className="gratitude-add">
                <textarea
                  className="gratitude-add-input"
                  rows={3}
                  autoFocus
                  placeholder="What else? Be specific — what exactly, and when?"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addExtra();
                  }}
                />
                <div className="gratitude-add-actions">
                  <button
                    className="gratitude-lock-btn gratitude-add-save"
                    disabled={!draft.trim()}
                    onClick={addExtra}
                  >
                    Add it
                  </button>
                  <button
                    className="daily-commit-edit-btn"
                    onClick={() => { setAdding(false); setDraft(""); }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="gratitude-locked-actions">
                <button className="gratitude-add-more" onClick={() => setAdding(true)}>
                  ＋ Add another moment
                </button>
                <button className="daily-commit-edit-btn" onClick={() => setOpen(true)}>
                  Edit entries
                </button>
              </div>
            )}

            <p className="gratitude-add-note">
              One quality moment is the dose. Add more anytime gratitude strikes today.
            </p>
          </div>
        ) : (
          <div className="gratitude-cta">
            <p className="gratitude-cta-teaser">
              Three quick layers — the moment, what life would be without it, and the gift inside a
              hard thing. Guided, about two minutes.
            </p>
            <button className="gratitude-lock-btn" onClick={() => setOpen(true)}>
              Begin gratitude ritual →
            </button>
          </div>
        )}
      </Card>

      {open && (
        <GratitudeWizard
          onClose={() => setOpen(false)}
          onComplete={handleComplete}
          initial={
            isLocked
              ? { moment: saved.entry1, subtraction: saved.entry2, hardship: saved.entry3 }
              : undefined
          }
        />
      )}
    </section>
  );
}

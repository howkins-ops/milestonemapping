import React from "react";
import Card from "../ui/Card.jsx";
import { formatShortDate } from "../../lib/dates.js";

function getCoachingMessage(kept, total) {
  if (total === 0) return null;
  const pct = kept / total;
  if (pct === 0)
    return `Zero out of ${total}. Every promise broken. The first step is honesty — you just took it. Now stop making promises you won't keep, or start keeping them.`;
  if (pct < 0.5)
    return `${kept}/${total} kept. You started but didn't finish. The ${total - kept} you missed aren't random — what's the pattern?`;
  if (pct < 0.75)
    return `${kept}/${total} done. You showed up for the majority. But the ones you skipped? Those are the work.`;
  if (pct < 1)
    return `${kept}/${total}. Almost locked in. That last ${total - kept} wasn't a scheduling problem. It was a priority call. Own it.`;
  return `LOCKED IN. Every commitment kept. That's the identity forming. Don't you dare break the streak.`;
}

export default function AccountabilityCheckpoint({ lastReview, checks, onChange, reviewStreak, commitmentStreak }) {
  const hasCommitments = lastReview && Array.isArray(lastReview.commitments) && lastReview.commitments.length > 0;
  const keptCount = checks.filter((c) => c.done).length;
  const total = checks.length;
  const pct = total > 0 ? keptCount / total : null;

  const scoreColor =
    pct === null ? "var(--brand-cyan)"
    : pct >= 0.75 ? "var(--brand-green)"
    : pct >= 0.5 ? "var(--brand-gold, #FACC15)"
    : "var(--brand-pink, #FF3EDB)";

  const toggle = (idx) => {
    const next = checks.map((c, i) => (i === idx ? { ...c, done: !c.done } : c));
    onChange(next);
  };

  return (
    <Card variant="neon" style={{ borderColor: "var(--brand-pink, #FF3EDB)", marginBottom: 4 }}>
      <div style={{ marginBottom: 14 }}>
        <div className="row row--between row--wrap" style={{ marginBottom: 4 }}>
          <span
            className="mono"
            style={{ fontSize: 11, letterSpacing: 2, color: "var(--brand-pink, #FF3EDB)", fontWeight: 700 }}
          >
            ⚡ ACCOUNTABILITY CHECKPOINT
          </span>
          {lastReview && (
            <span className="mono muted" style={{ fontSize: 11 }}>
              WEEK {lastReview.weekNumber} · {formatShortDate(lastReview.date)}
            </span>
          )}
        </div>
        <p style={{ fontSize: 13, color: "var(--text-muted, #9CA3AF)", marginTop: 2 }}>
          Last week you made these commitments. Check them off — or own that you didn't.
        </p>
      </div>

      {!lastReview ? (
        <p style={{ fontSize: 14, fontStyle: "italic", color: "var(--text-muted, #9CA3AF)" }}>
          No receipts from last week — because this is your first review. Today you start leaving them.
        </p>
      ) : !hasCommitments ? (
        <p style={{ fontSize: 14, fontStyle: "italic", color: "var(--text-muted, #9CA3AF)" }}>
          You didn't log what you were going to do last week. That changes now — fill in Question 6 below.
        </p>
      ) : (
        <>
          <div className="stack" style={{ gap: 10, marginBottom: 16 }}>
            {checks.map((c, idx) => (
              <label
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  cursor: "pointer",
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: c.done
                    ? "rgba(0, 255, 191, 0.07)"
                    : "rgba(255, 62, 219, 0.05)",
                  border: `1px solid ${c.done ? "rgba(0, 255, 191, 0.25)" : "rgba(255, 62, 219, 0.2)"}`,
                  transition: "all 0.15s ease"
                }}
              >
                <input
                  type="checkbox"
                  checked={c.done}
                  onChange={() => toggle(idx)}
                  style={{ marginTop: 2, accentColor: "var(--brand-green)", width: 16, height: 16, flexShrink: 0, cursor: "pointer" }}
                />
                <span
                  style={{
                    fontSize: 14,
                    lineHeight: 1.4,
                    textDecoration: c.done ? "line-through" : "none",
                    color: c.done ? "var(--brand-green)" : "var(--text-primary, #F9FAFB)",
                    transition: "all 0.15s ease"
                  }}
                >
                  {c.text}
                </span>
              </label>
            ))}
          </div>

          {/* Score bar */}
          <div style={{ marginBottom: 14 }}>
            <div className="row row--between" style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "var(--text-muted, #9CA3AF)" }}>Commitments kept</span>
              <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: scoreColor }}>
                {keptCount} / {total}
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 4,
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${total > 0 ? (keptCount / total) * 100 : 0}%`,
                  background: scoreColor,
                  borderRadius: 4,
                  transition: "width 0.3s ease"
                }}
              />
            </div>
          </div>

          {/* Coaching message */}
          {total > 0 && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.04)",
                borderLeft: `3px solid ${scoreColor}`,
                fontSize: 13,
                lineHeight: 1.55,
                color: "var(--text-primary, #F9FAFB)",
                fontStyle: "italic",
                marginBottom: 14
              }}
            >
              {getCoachingMessage(keptCount, total)}
            </div>
          )}
        </>
      )}

      {/* Streak badges */}
      <div className="row" style={{ gap: 10, flexWrap: "wrap", marginTop: 4 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 10px",
            borderRadius: 20,
            background: "rgba(255,255,255,0.06)",
            fontSize: 12
          }}
        >
          <span>🔥</span>
          <span className="mono" style={{ color: "var(--brand-cyan)" }}>
            Review Streak:{" "}
            <strong style={{ color: reviewStreak > 0 ? "var(--brand-green)" : "var(--text-muted, #9CA3AF)" }}>
              {reviewStreak > 0 ? `${reviewStreak} week${reviewStreak > 1 ? "s" : ""}` : "Start today"}
            </strong>
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 10px",
            borderRadius: 20,
            background: "rgba(255,255,255,0.06)",
            fontSize: 12
          }}
        >
          <span>⚡</span>
          <span className="mono" style={{ color: "var(--brand-cyan)" }}>
            Commitment Wins:{" "}
            <strong style={{ color: commitmentStreak > 0 ? "var(--brand-green)" : "var(--text-muted, #9CA3AF)" }}>
              {commitmentStreak > 0 ? `${commitmentStreak} week${commitmentStreak > 1 ? "s" : ""} in a row` : "Build your first one"}
            </strong>
          </span>
        </div>
      </div>
    </Card>
  );
}

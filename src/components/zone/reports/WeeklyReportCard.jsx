import React, { useState } from "react";
import { useAppData } from "../../../hooks/useAppData.js";
import { shareWeeklyReport } from "../../../lib/zoneService.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";

const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"]; // week starts Monday

// One week of evidence: the four numbers, tiny per-day bars, share state.
export default function WeeklyReportCard({ report, onShared }) {
  const { pushToast } = useAppData();
  const [sharing, setSharing] = useState(false);

  const doShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      await shareWeeklyReport(report.id);
      pushToast({ type: "success", title: "Shared 🔥" });
      if (onShared) onShared();
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't share", message: zoneErrorMessage(err) });
    } finally {
      setSharing(false);
    }
  };

  const perDay = normalizePerDay(report.payload?.per_day);
  const maxProofs = perDay ? Math.max(1, ...perDay) : 1;

  return (
    <div className="zn-card zn-card--ember">
      <h3 className="zn-card__title">Week of {formatWeek(report.week_start)}</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div className="zn-stat">
          <div className="zn-stat__num">{Number(report.missions_declared ?? 0)}</div>
          <div className="zn-stat__label">missions</div>
        </div>
        <div className="zn-stat">
          <div className="zn-stat__num">{Number(report.proofs_posted ?? 0)}</div>
          <div className="zn-stat__label">proofs</div>
        </div>
        <div className="zn-stat">
          <div className="zn-stat__num">{Number(report.consistency_pct ?? 0)}</div>
          <div className="zn-stat__label">% consistent</div>
        </div>
        <div className="zn-stat">
          <div className="zn-stat__num">{Number(report.streak_end ?? 0)}</div>
          <div className="zn-stat__label">streak</div>
        </div>
      </div>

      {perDay && (
        <div style={{ margin: "10px 0 4px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 38 }}>
            {perDay.map((n, i) => (
              <div
                key={i}
                title={`${n} proof${n === 1 ? "" : "s"}`}
                style={{
                  flex: 1,
                  height: n > 0 ? Math.max(6, Math.round((n / maxProofs) * 34)) : 3,
                  borderRadius: 3,
                  background: n > 0 ? "linear-gradient(180deg, var(--zfire), #FF7A1A)" : "rgba(255,255,255,0.08)",
                  boxShadow: n > 0 ? "0 0 8px -2px var(--zfire-glow)" : "none",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 5, marginTop: 3 }}>
            {DAY_LETTERS.map((d, i) => (
              <span
                key={i}
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: 1,
                  color: "var(--text-soft)",
                }}
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        {report.shared_event_id ? (
          <span className="zn-chip zn-chip--fire">Shared to feed ✓</span>
        ) : (
          <button type="button" className="zn-btn zn-btn--ghost" onClick={doShare} disabled={sharing}>
            {sharing ? "Sharing…" : "Share to squad feed"}
          </button>
        )}
      </div>
    </div>
  );
}

// payload.per_day may be [3,0,1,…] or [{ date, proofs }, …] — normalize to
// a 7-slot array of proof counts, or null when absent/unreadable.
function normalizePerDay(perDay) {
  if (!Array.isArray(perDay) || !perDay.length) return null;
  const vals = perDay
    .slice(0, 7)
    .map((d) => (typeof d === "number" ? d : Number(d?.proofs ?? d?.count ?? 0)));
  while (vals.length < 7) vals.push(0);
  return vals;
}

function formatWeek(weekStart) {
  if (!weekStart) return "—";
  const start = new Date(`${weekStart}T00:00:00`);
  if (Number.isNaN(start.getTime())) return weekStart;
  const end = new Date(start.getTime() + 6 * 86400000);
  const opts = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString([], opts)} – ${end.toLocaleDateString([], opts)}`;
}

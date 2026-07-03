import React, { useCallback, useEffect, useRef, useState } from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { useAppData } from "../../../hooks/useAppData.js";
import { listMyReports, generateWeeklyReport } from "../../../lib/zoneService.js";
import { zoneErrorMessage, getWeekStartKey } from "../../../lib/zoneFire.js";
import { playSound } from "../../../lib/sounds.js";
import { WITNESS, pickLine, fillTokens } from "../witness/witnessLines.js";
import WeeklyReportCard from "./WeeklyReportCard.jsx";

// Weekly reports: seven days of evidence, framed by the Witness.
export default function ReportsPanel({ go }) {
  const { userId } = useZoneCtx();
  const { addXP, pushToast, settings } = useAppData();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const aliveRef = useRef(true);

  const lastWeekStart = getWeekStartKey(new Date(Date.now() - 7 * 86400000));
  const introLine = fillTokens(pickLine(WITNESS.weeklyReport, lastWeekStart), {});

  const load = useCallback(
    async (showError = true) => {
      try {
        const rows = await listMyReports(userId);
        if (aliveRef.current) setReports(rows || []);
      } catch (err) {
        if (aliveRef.current && showError) {
          pushToast({ type: "error", title: "Couldn't load reports", message: zoneErrorMessage(err) });
        }
      } finally {
        if (aliveRef.current) setLoading(false);
      }
    },
    [userId, pushToast]
  );

  useEffect(() => {
    aliveRef.current = true;
    load();
    return () => {
      aliveRef.current = false;
    };
  }, [load]);

  const doGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const res = await generateWeeklyReport(lastWeekStart);
      if (res?.xp_earned) {
        addXP(res.xp_earned, "Weekly report");
        playSound("reward", settings);
      }
      await load(false);
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't build the report", message: zoneErrorMessage(err) });
    } finally {
      if (aliveRef.current) setGenerating(false);
    }
  };

  return (
    <div className="zn-stagger">
      <div className="zn-card">
        <p className="zn-eyebrow">Weekly reports</p>
        <p style={{ margin: "0 0 12px", fontSize: 14.5, lineHeight: 1.55, color: "var(--text-main)" }}>
          {introLine}
        </p>
        <button type="button" className="zn-btn" onClick={doGenerate} disabled={generating}>
          {generating ? "Gathering the week…" : "Generate last week's report"}
        </button>
      </div>

      {loading ? (
        <div className="zn-empty">Reading the ashes…</div>
      ) : reports.length ? (
        reports.map((report) => (
          <WeeklyReportCard key={report.id} report={report} onShared={() => load(false)} />
        ))
      ) : (
        <div className="zn-card">
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-soft)", lineHeight: 1.6 }}>
            No reports yet — they appear after a week in the fire. Keep declaring, keep proving,
            and the numbers will tell the story for you.
          </p>
        </div>
      )}
    </div>
  );
}

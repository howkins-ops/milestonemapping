import React, { useEffect, useState } from "react";
import { useAppData } from "../../../hooks/useAppData.js";
import { getLeaderboard } from "../../../lib/zoneService.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";
import UserChip from "../shared/UserChip.jsx";
import ZoneEmpty from "../shared/ZoneEmpty.jsx";

// Weekly consistency board across friends + squadmates. Celebration, not shame:
// it only ranks who showed up — nobody is called out for a quiet week.
export default function Leaderboard() {
  const { pushToast } = useAppData();
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getLeaderboard(7);
        if (alive) setRows(Array.isArray(res) ? res : []);
      } catch (err) {
        if (alive) {
          setRows([]);
          pushToast({ type: "error", title: "Board unavailable", message: zoneErrorMessage(err) });
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [pushToast]);

  return (
    <div className="zn-card">
      <p className="zn-eyebrow">This week's fire — friends &amp; squad</p>
      {rows === null ? (
        <div className="zn-empty" style={{ padding: "18px 10px" }}>Lighting the board…</div>
      ) : rows.length === 0 ? (
        <ZoneEmpty which="friends" icon="🏆" />
      ) : (
        rows.map((r, i) => (
          <div key={r.user_id} className="zn-lb-row">
            <span className={`zn-rank${i < 3 ? ` zn-rank--${i + 1}` : ""}`}>{i + 1}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <UserChip member={r} size="sm" />
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div className="zn-lb-row__score">{r.consistency_pct ?? 0}%</div>
              <div style={{ fontSize: 11, color: "var(--text-soft)", fontWeight: 700 }}>
                🔥 {r.zone_streak ?? 0} · {r.proofs ?? 0} proof{(r.proofs ?? 0) === 1 ? "" : "s"}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

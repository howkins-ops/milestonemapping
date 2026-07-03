import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase.js";
import { useAppData } from "../../../hooks/useAppData.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";
import MediaImage from "../shared/MediaImage.jsx";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const PROOF_COLUMNS = "id, proof_date, media_path, caption, kind, xp_earned, duration_minutes, created_at";

// Month calendar of proof days. RLS decides what a viewer may see;
// days without proofs are simply dim — never marked as misses.
export default function PhotoCalendar({ userId }) {
  const { pushToast } = useAppData();
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetDay, setSheetDay] = useState(null); // "YYYY-MM-DD" | null
  const aliveRef = useRef(true);

  const y = month.getFullYear();
  const m = month.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const monthStart = dayKey(y, m, 1);
  const monthEnd = dayKey(y, m, daysInMonth);

  useEffect(() => {
    aliveRef.current = true;
    if (!supabase || !userId) {
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    (async () => {
      try {
        const { data, error } = await supabase
          .from("zone_proofs")
          .select(PROOF_COLUMNS)
          .eq("user_id", userId)
          .gte("proof_date", monthStart)
          .lte("proof_date", monthEnd)
          .order("created_at", { ascending: true });
        if (error) throw error;
        if (aliveRef.current) setProofs(data || []);
      } catch (err) {
        if (aliveRef.current) {
          pushToast({ type: "error", title: "Couldn't load the calendar", message: zoneErrorMessage(err) });
        }
      } finally {
        if (aliveRef.current) setLoading(false);
      }
    })();
    return () => {
      aliveRef.current = false;
    };
  }, [userId, monthStart, monthEnd, pushToast]);

  const byDay = {};
  for (const p of proofs) {
    if (!byDay[p.proof_date]) byDay[p.proof_date] = [];
    byDay[p.proof_date].push(p);
  }

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const canGoNext = month.getTime() < currentMonthStart.getTime();
  const leadingEmpty = new Date(y, m, 1).getDay();
  const sheetProofs = sheetDay ? byDay[sheetDay] || [] : [];

  return (
    <div className="zn-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <button
          type="button"
          className="zn-btn zn-btn--ghost zn-btn--small"
          aria-label="Previous month"
          onClick={() => setMonth(new Date(y, m - 1, 1))}
        >
          ‹
        </button>
        <h3 className="zn-card__title" style={{ margin: 0 }}>
          📅 {month.toLocaleDateString([], { month: "long", year: "numeric" })}
        </h3>
        <button
          type="button"
          className="zn-btn zn-btn--ghost zn-btn--small"
          aria-label="Next month"
          onClick={() => canGoNext && setMonth(new Date(y, m + 1, 1))}
          disabled={!canGoNext}
        >
          ›
        </button>
      </div>

      {loading ? (
        <div className="zn-empty" style={{ padding: "20px 10px" }}>Lighting the month…</div>
      ) : (
        <div className="zn-cal">
          {WEEKDAYS.map((wd, i) => (
            <div key={`wd-${i}`} className="zn-cal__wd">{wd}</div>
          ))}
          {Array.from({ length: leadingEmpty }, (_, i) => (
            <div key={`lead-${i}`} className="zn-cal__day zn-cal__day--empty" aria-hidden="true" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const key = dayKey(y, m, day);
            const dayProofs = byDay[key] || [];
            const has = dayProofs.length > 0;
            const firstPhoto = dayProofs.find((p) => p.media_path);
            return (
              <button
                key={key}
                type="button"
                className={`zn-cal__day${has ? " zn-cal__day--proof" : ""}`}
                onClick={() => has && setSheetDay(key)}
                disabled={!has}
                aria-label={has ? `${day}: ${dayProofs.length} proof${dayProofs.length === 1 ? "" : "s"}` : `${day}`}
              >
                {firstPhoto && <MediaImage className="zn-cal__thumb" path={firstPhoto.media_path} alt="" />}
                <span className="zn-cal__daynum">{day}</span>
              </button>
            );
          })}
        </div>
      )}

      {sheetDay && (
        <ProofSheet
          title={formatDay(sheetDay)}
          proofs={sheetProofs}
          onClose={() => setSheetDay(null)}
        />
      )}
    </div>
  );
}

// Bottom sheet listing proofs — shared with ProofGallery.
export function ProofSheet({ title, proofs, onClose }) {
  return (
    <div className="zn-overlay" onClick={onClose}>
      <div className="zn-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="zn-sheet__handle" aria-hidden="true" />
        <h3 className="zn-sheet__title">{title}</h3>
        {proofs.map((p) => (
          <div key={p.id} className="zn-row" style={{ cursor: "default" }}>
            {p.media_path ? (
              <MediaImage
                className="zn-row__thumb"
                path={p.media_path}
                alt=""
                style={{ borderRadius: 12 }}
              />
            ) : (
              <div className="zn-row__thumb" aria-hidden="true">{p.kind === "text" ? "✍️" : "📸"}</div>
            )}
            <div className="zn-row__body">
              <div className="zn-row__title">
                {p.caption || (p.kind === "text" ? "Written proof" : "Photo proof")}
              </div>
              <div className="zn-row__meta">
                {p.duration_minutes ? <span className="zn-chip">⏱ {p.duration_minutes}m</span> : null}
                {p.xp_earned ? <span className="zn-chip zn-chip--fire">⭐ {p.xp_earned}</span> : null}
              </div>
            </div>
            {p.created_at && (
              <span className="zn-row__time">
                {new Date(p.created_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
              </span>
            )}
          </div>
        ))}
        <button type="button" className="zn-btn zn-btn--ghost" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function dayKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function formatDay(key) {
  const d = new Date(`${key}T00:00:00`);
  if (Number.isNaN(d.getTime())) return key;
  return d.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
}

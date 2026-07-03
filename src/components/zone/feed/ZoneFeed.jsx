import React, { useMemo, useState } from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { useZoneFeed } from "../../../hooks/useZoneFeed.js";
import MediaImage from "../shared/MediaImage.jsx";
import ZoneEmpty from "../shared/ZoneEmpty.jsx";
import FeedCard from "./FeedCard.jsx";
import { timeAgo } from "../home/ZoneHome.jsx";

const TYPE_ICON = {
  proof: "📸",
  declare: "⚡",
  rise: "🔥",
  eruption: "🌋",
  squad_join: "🛡️",
  challenge_join: "🏆",
  challenge_complete: "🏆",
  weekly_report: "📊",
};

const ACCENT_TYPES = new Set(["eruption", "rise", "challenge_complete", "weekly_report"]);

function eventLabel(ev) {
  switch (ev.event_type) {
    case "proof": return "Posted proof";
    case "declare": return "Declared a mission";
    case "rise": return "Rose from the ashes";
    case "eruption": return `${ev.payload?.squad_name || "Squad"} erupted!`;
    case "squad_join": return `Joined ${ev.payload?.squad_name || "a squad"}`;
    case "challenge_join": return `Joined ${ev.payload?.title || "a challenge"}`;
    case "challenge_complete": return `${ev.payload?.title || "Challenge"} complete!`;
    case "weekly_report": return "Shared a weekly report";
    default: return "Something stirred";
  }
}

function sameLocalDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dayHeading(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (sameLocalDay(d, today)) return "Today";
  if (sameLocalDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

function shortDuration(mins) {
  const m = Number(mins);
  if (!m || m <= 0) return null;
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h && r) return `${h}h ${r}m`;
  if (h) return `${h}h`;
  return `${r}m`;
}

const chipBtnStyle = { cursor: "pointer", fontFamily: "inherit" };
const metaChipStyle = { padding: "1px 7px", fontSize: 10.5, flexShrink: 0 };

// The full fire — everyone's declarations, proofs, rises, and eruptions,
// day-grouped. RLS already scopes rows to friends + squad-mates.
export default function ZoneFeed({ go }) {
  const { squads } = useZoneCtx();
  const [squadId, setSquadId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const { events, loading, hasMore, refresh, loadMore } = useZoneFeed({ squadId });

  const groups = useMemo(() => {
    const out = [];
    let current = null;
    for (const ev of events) {
      const key = new Date(ev.created_at).toDateString();
      if (!current || current.key !== key) {
        current = { key, heading: dayHeading(ev.created_at), items: [] };
        out.push(current);
      }
      current.items.push(ev);
    }
    return out;
  }, [events]);

  const onLoadMore = async () => {
    setLoadingMore(true);
    await loadMore(); // never throws — the hook swallows and retries via polling
    setLoadingMore(false);
  };

  return (
    <div>
      {/* Filter chips */}
      {squads.length > 0 && (
        <div className="zn-chipbar" style={{ marginBottom: 14 }}>
          <button
            type="button"
            className={`zn-chip${squadId === null ? " zn-chip--fire" : ""}`}
            style={chipBtnStyle}
            onClick={() => setSquadId(null)}
            aria-pressed={squadId === null}
          >
            All
          </button>
          {squads.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`zn-chip${squadId === s.id ? " zn-chip--fire" : ""}`}
              style={chipBtnStyle}
              onClick={() => setSquadId(s.id)}
              aria-pressed={squadId === s.id}
            >
              <span aria-hidden="true">{s.emblem || "🛡️"}</span> {s.name}
            </button>
          ))}
        </div>
      )}

      {loading && events.length === 0 && (
        <div className="zn-empty" aria-label="Loading feed">…</div>
      )}

      {!loading && events.length === 0 && <ZoneEmpty which="feed" />}

      {groups.map((group) => (
        <section key={group.key}>
          <h2 className="zn-dayhead">{group.heading}</h2>
          {group.items.map((ev) => {
            const p = ev.payload || {};
            const xp = p.xp != null ? p.xp : ev.xp != null ? ev.xp : null;
            const dur = shortDuration(p.duration_minutes);
            return (
              <button
                key={ev.id}
                type="button"
                className={`zn-row${ACCENT_TYPES.has(ev.event_type) ? " zn-row--accent" : ""}`}
                onClick={() => setSelected(ev)}
              >
                {ev.event_type === "proof" && p.media_path ? (
                  <MediaImage path={p.media_path} alt="" className="zn-row__thumb" />
                ) : (
                  <div className="zn-row__thumb" aria-hidden="true">
                    {TYPE_ICON[ev.event_type] || "✨"}
                  </div>
                )}
                <div className="zn-row__body">
                  <div className="zn-row__title">{p.title || p.caption || eventLabel(ev)}</div>
                  <div className="zn-row__meta">
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ev.member?.display_name || ev.member?.username || p.display_name || p.username || "Someone"}
                    </span>
                    {xp != null && <span className="zn-chip" style={metaChipStyle}>⭐ {xp}</span>}
                    {dur && <span className="zn-chip" style={metaChipStyle}>⏱ {dur}</span>}
                  </div>
                </div>
                <span className="zn-row__time">{timeAgo(ev.created_at)}</span>
              </button>
            );
          })}
        </section>
      ))}

      {hasMore && events.length > 0 && (
        <button
          type="button"
          className="zn-btn zn-btn--ghost"
          onClick={onLoadMore}
          disabled={loadingMore}
          style={{ marginTop: 6 }}
        >
          {loadingMore ? "…" : "Load more"}
        </button>
      )}

      {selected && (
        <FeedCard event={selected} onClose={() => setSelected(null)} onChanged={refresh} />
      )}
    </div>
  );
}

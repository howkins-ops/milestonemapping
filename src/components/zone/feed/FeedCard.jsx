import React, { useEffect, useState } from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { useAppData } from "../../../hooks/useAppData.js";
import {
  listComments,
  addComment,
  deleteComment,
  deleteOwnEvent,
} from "../../../lib/zoneService.js";
import { getCategory, zoneErrorMessage } from "../../../lib/zoneFire.js";
import { playSound } from "../../../lib/sounds.js";
import UserChip from "../shared/UserChip.jsx";
import MediaImage from "../shared/MediaImage.jsx";
import ReportButton from "../shared/ReportButton.jsx";
import ZoneIcon from "../shared/ZoneIcon.jsx";
import ReactionBar from "./ReactionBar.jsx";
import { timeAgo } from "../home/ZoneHome.jsx";

function longDuration(mins) {
  const m = Number(mins);
  if (!m || m <= 0) return null;
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h && r) return `${h} hr ${r} min`;
  if (h) return `${h} hr`;
  return `${r} min`;
}

// Full-detail sheet for one feed event: media, chips, integrity details,
// reactions, comments, and owner/report actions.
export default function FeedCard({ event, onClose, onChanged }) {
  const { userId } = useZoneCtx();
  const { pushToast, settings } = useAppData();
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const p = event.payload || {};
  const member = event.member || {
    username: p.username,
    display_name: p.display_name,
    avatar_url: p.avatar_url,
  };
  const mine = event.actor === userId;

  useEffect(() => {
    let alive = true;
    setCommentsLoading(true);
    (async () => {
      try {
        const rows = await listComments(event.id);
        if (alive) setComments(rows);
      } catch (err) {
        if (alive) {
          pushToast({ type: "error", title: "Comments wouldn't load", message: zoneErrorMessage(err) });
        }
      } finally {
        if (alive) setCommentsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event.id]);

  const send = async () => {
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const row = await addComment(event.id, text, userId);
      setComments((prev) => [...prev, row]);
      setBody("");
      playSound("pop", settings);
      if (onChanged) onChanged();
    } catch (err) {
      pushToast({ type: "error", title: "Comment didn't send", message: zoneErrorMessage(err) });
    } finally {
      setSending(false);
    }
  };

  const removeComment = async (commentId) => {
    try {
      await deleteComment(commentId, userId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      if (onChanged) onChanged();
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't remove comment", message: zoneErrorMessage(err) });
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await deleteOwnEvent(event.id, userId);
      pushToast({ type: "success", title: "Deleted", message: "It's out of the feed.", icon: "🔥" });
      if (onChanged) onChanged();
      onClose();
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't delete", message: zoneErrorMessage(err) });
      setDeleting(false);
    }
  };

  const xp = p.xp != null ? p.xp : event.xp != null ? event.xp : null;
  const dur = longDuration(p.duration_minutes);
  const cat = p.category ? getCategory(p.category) : null;
  const winner = p.winner || null;
  const winnerName =
    winner && typeof winner === "object"
      ? winner.display_name || winner.username
      : winner;
  const rankings = Array.isArray(p.rankings) ? p.rankings : [];

  return (
    <div className="zn-overlay" onClick={onClose}>
      <div
        className="zn-sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Feed post"
      >
        <div className="zn-sheet__handle" aria-hidden="true" />

        {/* Header */}
        <div style={{ marginBottom: 14 }}>
          <UserChip
            member={member}
            sub={member?.username ? `@${member.username}` : ""}
            right={<span className="zn-row__time">{timeAgo(event.created_at)}</span>}
          />
        </div>

        {/* Body by event type */}
        {event.event_type === "proof" && (
          <>
            {p.media_path && (
              <MediaImage
                path={p.media_path}
                alt={p.caption || "Proof photo"}
                style={{ width: "100%", borderRadius: 16, display: "block", marginBottom: 12 }}
              />
            )}
            {p.caption && (
              <p style={{ fontSize: 15, lineHeight: 1.55, margin: "0 0 12px" }}>{p.caption}</p>
            )}
            <div className="zn-chipbar" style={{ marginBottom: 12 }}>
              {dur && <span className="zn-chip">⏱ {dur}</span>}
              {xp != null && <span className="zn-chip">⭐ {xp} pts</span>}
              {cat && (
                <span className="zn-chip">
                  <ZoneIcon src={cat.art} className="zn-chip__icon" /> {cat.label}
                </span>
              )}
              {p.streak > 0 && <span className="zn-chip zn-chip--fire">🔥 {p.streak}</span>}
            </div>

            {/* Integrity transparency — quiet and factual */}
            <button
              type="button"
              className="zn-btn zn-btn--ghost zn-btn--small"
              onClick={() => setDetailsOpen((v) => !v)}
              aria-expanded={detailsOpen}
            >
              {detailsOpen ? "▾" : "▸"} Check-in details
            </button>
            {detailsOpen && (
              <div style={{ fontSize: 12, color: "var(--text-soft)", lineHeight: 1.7, margin: "8px 2px 0" }}>
                <div>Published {new Date(event.created_at).toLocaleString()}</div>
                {p.photo_source && (
                  <div>
                    {p.photo_source === "camera"
                      ? "Taken in-app with the camera"
                      : "From photo library"}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {event.event_type === "declare" && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div className="zn-row__thumb zn-row__thumb--art" aria-hidden="true">
              <ZoneIcon src={getCategory(p.category).art} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="zn-row__title" style={{ fontSize: 16, whiteSpace: "normal" }}>
                {p.title || "Declared a mission"}
              </div>
              {p.note && (
                <p style={{ fontSize: 13.5, color: "var(--text-soft)", margin: "4px 0 0", lineHeight: 1.5 }}>
                  {p.note}
                </p>
              )}
            </div>
          </div>
        )}

        {event.event_type === "rise" && (
          <div style={{ textAlign: "center", padding: "6px 0" }}>
            <div style={{ fontSize: 40 }} aria-hidden="true">🔥</div>
            <p style={{ fontSize: 15.5, fontWeight: 700, margin: "8px 0 4px" }}>
              The phoenix rises.
            </p>
            <p style={{ fontSize: 13.5, color: "var(--text-soft)", margin: 0, lineHeight: 1.55 }}>
              {p.fallen_streak > 0
                ? `A ${p.fallen_streak}-day fire turned to ash — and a new one just got lit. The comeback is the story.`
                : "New fire, same soul. The comeback is the story."}
            </p>
          </div>
        )}

        {event.event_type === "recommit" && (
          <div>
            <p className="zn-eyebrow" style={{ color: "#FF7A1A" }}>Recommit · back in integrity</p>
            <div className="zn-recommit-card__pair">
              <span className="zn-recommit-card__tag">The story I told</span>
              <p className="zn-recommit-card__lie">{p.lie}</p>
              <span className="zn-recommit-card__tag zn-recommit-card__tag--truth">The truth</span>
              <p className="zn-recommit-card__truth">{p.truth}</p>
            </div>
            <p className="zn-recommit-card__declare">“{p.declaration}”</p>
            <div className="zn-chipbar" style={{ marginBottom: 4 }}>
              {p.proof && <span className="zn-chip zn-chip--fire">⚡ Proof within 24h: {p.proof}</span>}
              {p.rose && (
                <span className="zn-chip">
                  🔥 {p.fallen_streak > 0 ? `Rose from a ${p.fallen_streak}-day fire's ashes` : "Rose from the ashes"}
                </span>
              )}
              {xp != null && xp > 0 && <span className="zn-chip">⭐ {xp} pts</span>}
            </div>
          </div>
        )}

        {event.event_type === "eruption" && (
          <div style={{ textAlign: "center", padding: "6px 0" }}>
            <div style={{ fontSize: 40 }} aria-hidden="true">🌋</div>
            <p style={{ fontSize: 15.5, fontWeight: 700, margin: "8px 0 4px" }}>
              {p.squad_name || "The squad"} ERUPTED!
            </p>
            {p.count > 0 && (
              <p style={{ fontSize: 13.5, color: "var(--text-soft)", margin: 0 }}>
                {p.count} proofs lit the meter today.
              </p>
            )}
          </div>
        )}

        {event.event_type === "challenge_complete" && (
          <div>
            <p className="zn-eyebrow">Challenge complete</p>
            <p style={{ fontSize: 16, fontWeight: 800, margin: "0 0 10px" }}>
              🏆 {p.title || "Challenge"}
            </p>
            {winnerName && (
              <p style={{ fontSize: 13.5, color: "var(--text-soft)", margin: "0 0 8px" }}>
                <span aria-hidden="true">👑</span> {winnerName} takes the crown
              </p>
            )}
            {rankings.slice(0, 5).map((r, i) => (
              <div key={r.username || i} className="zn-lb-row">
                <span className={`zn-rank${i < 3 ? ` zn-rank--${i + 1}` : ""}`}>{i + 1}</span>
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 14 }}>
                  {r.display_name || r.username || "someone"}
                </span>
                <span className="zn-lb-row__score">{r.points ?? 0}</span>
              </div>
            ))}
          </div>
        )}

        {event.event_type === "weekly_report" && (
          <div>
            <p className="zn-eyebrow">A week, witnessed</p>
            <div className="zn-2col">
              <div className="zn-stat">
                <div className="zn-stat__num">{p.missions_declared ?? 0}</div>
                <div className="zn-stat__label">Missions declared</div>
              </div>
              <div className="zn-stat">
                <div className="zn-stat__num">{p.proofs_posted ?? 0}</div>
                <div className="zn-stat__label">Proofs posted</div>
              </div>
              <div className="zn-stat">
                <div className="zn-stat__num">{p.consistency_pct ?? 0}%</div>
                <div className="zn-stat__label">Consistency</div>
              </div>
              <div className="zn-stat">
                <div className="zn-stat__num">🔥 {p.streak_end ?? 0}</div>
                <div className="zn-stat__label">Streak</div>
              </div>
            </div>
          </div>
        )}

        {(event.event_type === "squad_join" || event.event_type === "challenge_join") && (
          <p style={{ fontSize: 14.5, margin: 0, lineHeight: 1.55 }}>
            {event.event_type === "squad_join"
              ? `🛡️ Joined ${p.squad_name || "a squad"}`
              : `🏆 Joined ${p.title || "a challenge"}`}
          </p>
        )}

        <ReactionBar event={event} onChanged={onChanged} />

        {/* Comments */}
        <hr className="zn-divider" />
        <p className="zn-eyebrow">Comments</p>
        {commentsLoading && <p style={{ fontSize: 13, color: "var(--text-soft)" }}>…</p>}
        {!commentsLoading && comments.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--text-soft)", margin: "0 0 10px" }}>
            Be the first voice at this fire.
          </p>
        )}
        {comments.map((c) => (
          <div key={c.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <UserChip member={c.member} size="sm" sub="" />
              </div>
              <span className="zn-row__time">{timeAgo(c.created_at)}</span>
              {c.user_id === userId && (
                <button
                  type="button"
                  className="zn-btn zn-btn--ghost zn-btn--small"
                  style={{ padding: "3px 8px", fontSize: 11 }}
                  onClick={() => removeComment(c.id)}
                >
                  Remove
                </button>
              )}
            </div>
            <p style={{ margin: "4px 0 0 36px", fontSize: 14, lineHeight: 1.5 }}>{c.body}</p>
          </div>
        ))}

        <div className="zn-composer" style={{ position: "static", marginTop: 12 }}>
          <input
            className="zn-input"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Say something true"
            maxLength={300}
            aria-label="Write a comment"
          />
          <button
            type="button"
            className="zn-btn zn-btn--small"
            onClick={send}
            disabled={sending || !body.trim()}
          >
            {sending ? "…" : "Send"}
          </button>
        </div>

        {/* Footer: owner delete or report */}
        <hr className="zn-divider" />
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {mine ? (
            confirmDelete ? (
              <>
                <span style={{ fontSize: 12.5, color: "var(--text-soft)" }}>
                  Take this off the feed?
                </span>
                <button
                  type="button"
                  className="zn-btn zn-btn--ghost zn-btn--small"
                  onClick={() => setConfirmDelete(false)}
                >
                  Keep it
                </button>
                <button
                  type="button"
                  className="zn-btn zn-btn--danger zn-btn--small"
                  onClick={doDelete}
                  disabled={deleting}
                >
                  {deleting ? "Removing…" : "Yes, delete"}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="zn-btn zn-btn--danger zn-btn--small"
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </button>
            )
          ) : (
            <ReportButton contentType="feed_event" contentId={event.id} targetUser={event.actor} />
          )}
        </div>
      </div>
    </div>
  );
}

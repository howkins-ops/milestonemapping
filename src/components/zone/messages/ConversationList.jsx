import React, { useCallback, useEffect, useRef, useState } from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { useAppData } from "../../../hooks/useAppData.js";
import { listConversations } from "../../../lib/zoneService.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";
import { timeAgo } from "../home/ZoneHome.jsx";
import ZoneEmpty from "../shared/ZoneEmpty.jsx";

// All my conversations (DMs + squad rooms), newest activity first.
// Refreshes on realtime notification pokes and a slow 30s safety poll.
export default function ConversationList({ onOpen }) {
  const { lastNotification } = useZoneCtx();
  const { pushToast } = useAppData();
  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(true);
  const aliveRef = useRef(true);

  const load = useCallback(
    async (showError = false) => {
      try {
        const rows = await listConversations();
        if (!aliveRef.current) return;
        setConvos(Array.isArray(rows) ? rows : rows?.conversations || []);
      } catch (err) {
        if (aliveRef.current && showError) {
          pushToast({ type: "error", title: "Couldn't load messages", message: zoneErrorMessage(err) });
        }
      } finally {
        if (aliveRef.current) setLoading(false);
      }
    },
    [pushToast]
  );

  useEffect(() => {
    aliveRef.current = true;
    load(true);
    return () => {
      aliveRef.current = false;
    };
  }, [load]);

  // Realtime poke → silent refresh.
  useEffect(() => {
    if (lastNotification) load(false);
  }, [lastNotification, load]);

  // Slow safety poll while the list is on screen.
  useEffect(() => {
    const timer = setInterval(() => load(false), 30000);
    return () => clearInterval(timer);
  }, [load]);

  if (loading) {
    return <div className="zn-empty">Warming up the fireside…</div>;
  }
  if (!convos.length) {
    return <ZoneEmpty which="messages" icon="💬" />;
  }

  return (
    <div className="zn-stagger">
      {convos.map((c) => {
        const id = c.id || c.conversation_id;
        const isSquad = c.kind === "squad" || !!c.squad_id;
        const title = c.title || c.name || c.display_name || (isSquad ? "Squad" : "Direct message");
        const unread = Number(c.unread_count ?? c.unread ?? 0);
        const lastAt = c.last_activity || c.last_message_at || c.updated_at;
        return (
          <button key={id} type="button" className="zn-row" onClick={() => onOpen(id)}>
            {isSquad ? (
              <div className="zn-row__thumb" aria-hidden="true">{c.emblem || "🔥"}</div>
            ) : c.avatar_url ? (
              <img
                className="zn-avatar"
                src={c.avatar_url}
                alt=""
                onError={(e) => {
                  e.currentTarget.style.visibility = "hidden";
                }}
              />
            ) : (
              <div className="zn-avatar" aria-hidden="true">{title.slice(0, 1).toUpperCase()}</div>
            )}
            <div className="zn-row__body">
              <div className="zn-row__title">{title}</div>
              <div className="zn-row__meta">
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {previewOf(c, isSquad)}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
              {lastAt && <span className="zn-row__time">{timeAgo(lastAt)}</span>}
              {unread > 0 && <span className="zn-chip zn-chip--fire">{unread}</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function previewOf(c, isSquad) {
  const deleted =
    c.last_message_deleted ||
    (c.last_message && typeof c.last_message === "object" && c.last_message.deleted_at);
  if (deleted) return "message removed";
  const text =
    typeof c.last_message === "string"
      ? c.last_message
      : c.last_message?.body || c.last_message_body || "";
  if (!text) return "Say the first word";
  const sender = c.sender_name || c.last_sender_name || c.last_message?.sender_name;
  return isSquad && sender ? `${sender}: ${text}` : text;
}

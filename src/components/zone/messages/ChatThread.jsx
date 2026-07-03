import React, { useEffect, useRef, useState } from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { useConversation } from "../../../hooks/useConversation.js";
import { useAppData } from "../../../hooks/useAppData.js";
import { listConversations } from "../../../lib/zoneService.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";
import { playSound } from "../../../lib/sounds.js";
import MessageBubble from "./MessageBubble.jsx";

// One open conversation. useConversation handles history, realtime and
// mark-read; this component renders the thread + a sticky composer.
export default function ChatThread({ conversationId, onBack }) {
  const { userId, refreshState } = useZoneCtx();
  const { pushToast, settings } = useAppData();
  const { messages, loading, hasMore, send, loadOlder, refresh } = useConversation(conversationId, userId);
  const [title, setTitle] = useState("Conversation");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const nearBottomRef = useRef(true);
  const prevCountRef = useRef(0);

  // Resolve a friendly header title once; "Conversation" is a fine fallback.
  useEffect(() => {
    let alive = true;
    listConversations()
      .then((rows) => {
        if (!alive) return;
        const list = Array.isArray(rows) ? rows : rows?.conversations || [];
        const row = list.find((c) => (c.id || c.conversation_id) === conversationId);
        if (row) setTitle(row.title || row.name || row.display_name || "Conversation");
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [conversationId]);

  // Track whether the reader is near the bottom of the page-scrolled thread.
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      nearBottomRef.current = window.innerHeight + window.scrollY >= doc.scrollHeight - 220;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-scroll on new messages — but only when the reader was near the
  // bottom (loading older history keeps their place).
  useEffect(() => {
    if (!messages.length) return;
    const first = prevCountRef.current === 0;
    const grew = messages.length > prevCountRef.current;
    prevCountRef.current = messages.length;
    if (first || (grew && nearBottomRef.current)) {
      bottomRef.current?.scrollIntoView({ block: "end", behavior: first ? "auto" : "smooth" });
    }
  }, [messages]);

  const doSend = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setText("");
    try {
      await send(body);
      playSound("pop", settings);
      refreshState();
    } catch (err) {
      setText(body);
      pushToast({ type: "error", title: "Message didn't send", message: zoneErrorMessage(err) });
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  };

  return (
    <div>
      <button type="button" className="zn-back" onClick={onBack}>‹ Back</button>
      <h3 className="zn-card__title" style={{ marginTop: 0 }}>💬 {title}</h3>

      {hasMore && messages.length > 0 && (
        <button
          type="button"
          className="zn-btn zn-btn--ghost zn-btn--small"
          style={{ margin: "0 auto 8px" }}
          onClick={loadOlder}
        >
          Load earlier
        </button>
      )}

      {loading && !messages.length ? (
        <div className="zn-empty">Opening the thread…</div>
      ) : !messages.length ? (
        <div className="zn-empty">
          <div className="zn-empty__icon" aria-hidden="true">💬</div>
          <p style={{ margin: 0 }}>No messages yet. Warm words travel far.</p>
        </div>
      ) : (
        <div className="zn-thread">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} mine={msg.sender === userId} onChanged={refresh} />
          ))}
          <div ref={bottomRef} aria-hidden="true" />
        </div>
      )}

      <div className="zn-composer">
        <input
          className="zn-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Say it warm…"
          aria-label="Message"
          maxLength={2000}
        />
        <button
          type="button"
          className="zn-btn zn-btn--small"
          onClick={doSend}
          disabled={sending || !text.trim()}
        >
          {sending ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}

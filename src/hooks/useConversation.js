import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { fetchMessages, markConversationRead, sendMessage as sendMessageApi } from "../lib/zoneService.js";

// One open thread: history paging, realtime INSERT/UPDATE, mark-read,
// 10s fallback poll while open, symmetric cleanup (StrictMode-safe).
export function useConversation(conversationId, userId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const aliveRef = useRef(true);

  const markRead = useCallback(() => {
    if (conversationId && userId) markConversationRead(conversationId, userId).catch(() => {});
  }, [conversationId, userId]);

  const refresh = useCallback(async () => {
    if (!supabase || !conversationId) return;
    try {
      const rows = await fetchMessages(conversationId, { limit: 40 });
      if (!aliveRef.current) return;
      setMessages((prev) => {
        const seen = new Set(rows.map((r) => r.id));
        const older = prev.filter((p) => !seen.has(p.id) && rows.length && p.created_at < rows[0].created_at);
        return [...older, ...rows];
      });
      setHasMore(rows.length >= 40);
      markRead();
    } catch {
      /* fallback poll retries */
    } finally {
      if (aliveRef.current) setLoading(false);
    }
  }, [conversationId, markRead]);

  const loadOlder = useCallback(async () => {
    if (!supabase || !conversationId || !messages.length) return;
    try {
      const rows = await fetchMessages(conversationId, { before: messages[0].created_at, limit: 40 });
      if (!aliveRef.current) return;
      setMessages((prev) => {
        const seen = new Set(prev.map((r) => r.id));
        return [...rows.filter((r) => !seen.has(r.id)), ...prev];
      });
      setHasMore(rows.length >= 40);
    } catch {
      /* ignore */
    }
  }, [conversationId, messages]);

  const send = useCallback(
    async (body) => {
      const text = body.trim();
      if (!text) return null;
      const row = await sendMessageApi(conversationId, text, userId);
      if (row && !row.offline && aliveRef.current) {
        setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
      }
      return row;
    },
    [conversationId, userId]
  );

  useEffect(() => {
    aliveRef.current = true;
    setMessages([]);
    setLoading(true);
    setHasMore(true);
    refresh();
    return () => {
      aliveRef.current = false;
    };
  }, [refresh]);

  useEffect(() => {
    if (!supabase || !conversationId) return undefined;
    const channel = supabase
      .channel(`zone-conv-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        () => refresh()
      )
      .subscribe();
    const poll = setInterval(refresh, 10000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [conversationId, refresh]);

  return { messages, loading, hasMore, send, loadOlder, refresh, setMessages, markRead };
}

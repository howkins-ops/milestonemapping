import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { fetchFeed } from "../lib/zoneService.js";

const PAGE = 20;

// Paged feed with realtime pokes. Realtime events are NEVER rendered directly
// (payloads lack joins and RLS can silently drop them) — they trigger a
// refetch of the newest page through the normal REST path.
export function useZoneFeed({ squadId = null, actorId = null } = {}) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const aliveRef = useRef(true);
  const busyRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!supabase || busyRef.current) return;
    busyRef.current = true;
    try {
      const rows = await fetchFeed({ squadId, actorId, limit: PAGE });
      if (!aliveRef.current) return;
      setEvents((prev) => {
        // Merge newest page over what we have; keep older pages already loaded.
        const ids = new Set(rows.map((r) => r.id));
        const tail = prev.filter((p) => !ids.has(p.id) && (rows.length === 0 || p.created_at < rows[rows.length - 1].created_at));
        return [...rows, ...tail];
      });
      setHasMore(rows.length >= PAGE);
    } catch {
      /* keep whatever we have; safety poll will retry */
    } finally {
      busyRef.current = false;
      if (aliveRef.current) setLoading(false);
    }
  }, [squadId, actorId]);

  const loadMore = useCallback(async () => {
    if (!supabase || busyRef.current || !events.length) return;
    busyRef.current = true;
    try {
      const before = events[events.length - 1].created_at;
      const rows = await fetchFeed({ squadId, actorId, before, limit: PAGE });
      if (!aliveRef.current) return;
      setEvents((prev) => {
        const seen = new Set(prev.map((r) => r.id));
        return [...prev, ...rows.filter((r) => !seen.has(r.id))];
      });
      setHasMore(rows.length >= PAGE);
    } catch {
      /* ignore */
    } finally {
      busyRef.current = false;
    }
  }, [events, squadId, actorId]);

  useEffect(() => {
    aliveRef.current = true;
    setLoading(true);
    setEvents([]);
    setHasMore(true);
    refresh();
    return () => {
      aliveRef.current = false;
    };
  }, [refresh]);

  useEffect(() => {
    if (!supabase) return undefined;
    let pollTimer = null;
    const startPolling = (ms) => {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = setInterval(refresh, ms);
    };
    const channel = supabase
      .channel(`zone-feed-${squadId || actorId || "all"}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "feed_events" }, () => refresh())
      .subscribe((status) => {
        if (status === "SUBSCRIBED") startPolling(120000); // safety net
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") startPolling(30000);
      });
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", onVisible);
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [refresh, squadId, actorId]);

  return { events, loading, hasMore, refresh, loadMore, setEvents };
}

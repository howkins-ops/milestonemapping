import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isSupabaseReady } from "../../lib/supabase.js";
import { getZoneState, listFriends, getLeaderboard } from "../../lib/zoneService.js";
import { getFireLevel, getPhoenixStage } from "../../lib/zoneFire.js";

// ════════════════════════════════════════════════════════════════════════
// MILESTONE CITY — social presence hook
// One mount-time fan-out (zone state + friends + 7-day leaderboard) via
// Promise.allSettled so a single failed RPC never nukes the other slices.
// Refreshes when the tab becomes visible again (throttled to >= 60s).
// Fully offline-safe: null supabase client, { offline: true } RPC results
// and a missing zone member all resolve to online:false + empty data.
// Never throws, never leaves an unhandled rejection, and never updates
// state after unmount.
// ════════════════════════════════════════════════════════════════════════

const VISIBILITY_THROTTLE_MS = 60000;

const isOffline = (value) => !value || value.offline === true;

export default function useCitySocial() {
  const [loading, setLoading] = useState(true);
  const [zone, setZone] = useState(null); // raw az_get_zone_state jsonb (or null)
  const [friends, setFriends] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const aliveRef = useRef(true);
  const inFlightRef = useRef(false);
  const lastFetchRef = useRef(0);

  const refresh = useCallback(async () => {
    // No client → settle instantly into the offline shape.
    if (!isSupabaseReady) {
      if (aliveRef.current) {
        setZone(null);
        setFriends([]);
        setLeaderboard([]);
        setLoading(false);
      }
      return;
    }
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    lastFetchRef.current = Date.now();
    try {
      const [zoneRes, friendsRes, boardRes] = await Promise.allSettled([
        getZoneState(),
        listFriends(),
        getLeaderboard(7),
      ]);
      if (!aliveRef.current) return;

      // Each slice updates independently; a rejected RPC keeps the previous
      // value for that slice only.
      if (zoneRes.status === "fulfilled") {
        setZone(isOffline(zoneRes.value) ? null : zoneRes.value);
      }
      if (friendsRes.status === "fulfilled") {
        const v = friendsRes.value;
        setFriends(!isOffline(v) && Array.isArray(v.friends) ? v.friends : []);
      }
      if (boardRes.status === "fulfilled") {
        const v = boardRes.value;
        setLeaderboard(Array.isArray(v) ? v : []);
      }
    } catch {
      // Promise.allSettled never rejects; this guards the setters themselves.
    } finally {
      inFlightRef.current = false;
      if (aliveRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    refresh();
    const onVisibility = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastFetchRef.current < VISIBILITY_THROTTLE_MS) return;
      refresh();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      aliveRef.current = false;
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  return useMemo(() => {
    const member = zone && zone.member ? zone.member : null;
    const online = !!member;
    const fireDays = online ? Math.max(0, Number(zone.fire_days) || 0) : 0;
    return {
      loading,
      online,
      member,
      fireDays,
      fire: getFireLevel(fireDays),
      phoenix: getPhoenixStage(member ? Number(member.longest_zone_streak) || 0 : 0),
      squads: online && Array.isArray(zone.squads) ? zone.squads : [],
      partner: online ? zone.partner || null : null,
      friends: online ? friends : [],
      leaderboard: online ? leaderboard : [],
      refresh,
    };
  }, [loading, zone, friends, leaderboard, refresh]);
}

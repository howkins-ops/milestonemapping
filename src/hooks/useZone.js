import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase.js";
import { getZoneState } from "../lib/zoneService.js";
import { getFireLevel, getPhoenixStage } from "../lib/zoneFire.js";

const ZoneContext = createContext(null);

// Zone-wide state: one az_get_zone_state round-trip powers Home + Witness +
// badges. A realtime channel on my zone_notifications pokes refreshes; a slow
// safety poll + visibilitychange refresh cover realtime gaps.
export function ZoneProvider({ userId, children }) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastNotification, setLastNotification] = useState(null);
  const aliveRef = useRef(true);

  const refreshState = useCallback(async () => {
    if (!supabase || !userId) return null;
    try {
      const data = await getZoneState();
      if (aliveRef.current) {
        setState(data);
        setError(null);
      }
      return data;
    } catch (err) {
      if (aliveRef.current) setError(err);
      return null;
    } finally {
      if (aliveRef.current) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    aliveRef.current = true;
    setLoading(true);
    refreshState();
    return () => {
      aliveRef.current = false;
    };
  }, [refreshState]);

  // Realtime: my notifications are the cheap fan-out for "something happened".
  useEffect(() => {
    if (!supabase || !userId) return undefined;
    const channel = supabase
      .channel(`zone-notif-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "zone_notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          setLastNotification({ row: payload.new, at: Date.now() });
          refreshState();
        }
      )
      .subscribe();
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshState();
    };
    document.addEventListener("visibilitychange", onVisible);
    const safety = setInterval(refreshState, 120000);
    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener("visibilitychange", onVisible);
      clearInterval(safety);
    };
  }, [userId, refreshState]);

  const value = useMemo(() => {
    const member = state?.member || null;
    const fireDays = state?.fire_days ?? 0;
    return {
      userId,
      loading,
      error,
      state,
      member,
      fire: getFireLevel(fireDays),
      fireDays,
      phoenix: getPhoenixStage(member?.longest_zone_streak ?? 0),
      todayMission: state?.today_mission || null,
      todayProofCount: state?.today_proof_count ?? 0,
      unreadNotifications: state?.unread_notifications ?? 0,
      unreadMessages: state?.unread_messages ?? 0,
      squads: state?.squads || [],
      partner: state?.partner || null,
      lastNotification,
      refreshState,
    };
  }, [userId, loading, error, state, lastNotification, refreshState]);

  return React.createElement(ZoneContext.Provider, { value }, children);
}

export function useZoneCtx() {
  const ctx = useContext(ZoneContext);
  if (!ctx) throw new Error("useZoneCtx must be used inside <ZoneProvider>");
  return ctx;
}

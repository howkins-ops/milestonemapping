import React, { useCallback, useEffect, useRef, useState } from "react";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { useAppData } from "../../../hooks/useAppData.js";
import {
  listNotifications,
  listFriends,
  getPartnerState,
  respondFriendRequest,
  respondPartner,
  markNotificationsRead,
} from "../../../lib/zoneService.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";
import { playSound } from "../../../lib/sounds.js";
import UserChip from "../shared/UserChip.jsx";
import ZoneEmpty from "../shared/ZoneEmpty.jsx";
import NotificationRow from "./NotificationRow.jsx";

const requestRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "8px 0",
};

// Inbox: pending requests up top (friend + partner), then the activity stream.
// Visible notifications auto-mark read after a beat so the badge settles.
export default function InboxPanel({ go }) {
  const { userId, refreshState } = useZoneCtx();
  const { pushToast, settings } = useAppData();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [partnerInvite, setPartnerInvite] = useState(null);
  const [busyKey, setBusyKey] = useState(null);
  const aliveRef = useRef(true);

  const load = useCallback(async () => {
    try {
      const [notifs, friends, partnerState] = await Promise.all([
        listNotifications(userId),
        listFriends(),
        getPartnerState(),
      ]);
      if (!aliveRef.current) return;
      setNotifications(Array.isArray(notifs) ? notifs : []);
      setIncoming(Array.isArray(friends?.incoming) ? friends.incoming : []);
      setPartnerInvite(
        partnerState?.link?.status === "pending" && !partnerState.i_am_inviter
          ? partnerState
          : null
      );
    } catch (err) {
      if (aliveRef.current) {
        pushToast({ type: "error", title: "Inbox wouldn't open", message: zoneErrorMessage(err) });
      }
    } finally {
      if (aliveRef.current) setLoading(false);
    }
  }, [userId, pushToast]);

  useEffect(() => {
    aliveRef.current = true;
    load();
    return () => {
      aliveRef.current = false;
    };
  }, [load]);

  // Auto-mark visible notifications read after 2s. Quiet on failure —
  // it's a background nicety; the explicit button surfaces errors.
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        await markNotificationsRead(userId);
        refreshState();
      } catch {
        /* the safety poll and Mark-all-read cover this */
      }
    }, 2000);
    return () => clearTimeout(t);
  }, [userId, refreshState]);

  const respondRequest = async (req, accept) => {
    setBusyKey(`friend-${req.friendship_id}`);
    try {
      await respondFriendRequest(req.friendship_id, accept);
      if (accept) {
        playSound("chime", settings);
        pushToast({
          type: "success",
          title: "Connected",
          message: `You and @${req.username} are in each other's corner now.`,
          icon: "🤝",
        });
      } else {
        pushToast({ type: "success", title: "Declined", message: "Quietly done.", icon: "🕊️" });
      }
      await load();
      refreshState();
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't respond", message: zoneErrorMessage(err) });
    } finally {
      setBusyKey(null);
    }
  };

  const respondInvite = async (accept) => {
    if (!partnerInvite?.link?.id) return;
    setBusyKey("partner");
    try {
      await respondPartner(partnerInvite.link.id, accept);
      if (accept) {
        playSound("chime", settings);
        pushToast({
          type: "success",
          title: "Partners",
          message: "Two fires burn hotter than one. ⚭",
          icon: "🔥",
        });
      } else {
        pushToast({ type: "success", title: "Declined", message: "Quietly done.", icon: "🕊️" });
      }
      await load();
      refreshState();
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't respond", message: zoneErrorMessage(err) });
    } finally {
      setBusyKey(null);
    }
  };

  const markAll = async () => {
    try {
      await markNotificationsRead(userId);
      setNotifications((prev) =>
        prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() }))
      );
      refreshState();
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't mark read", message: zoneErrorMessage(err) });
    }
  };

  if (loading) {
    return <div className="zn-empty" aria-label="Loading inbox">…</div>;
  }

  const hasRequests = incoming.length > 0 || !!partnerInvite;
  const nothing = !hasRequests && notifications.length === 0;

  if (nothing) return <ZoneEmpty which="inbox" icon="📮" />;

  return (
    <div className="zn-stagger">
      {hasRequests && (
        <div className="zn-card">
          <p className="zn-eyebrow">Requests</p>
          {incoming.map((req) => (
            <div key={req.friendship_id} style={requestRowStyle}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <UserChip member={req} sub={`@${req.username} wants to connect`} />
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  type="button"
                  className="zn-btn zn-btn--small"
                  onClick={() => respondRequest(req, true)}
                  disabled={busyKey === `friend-${req.friendship_id}`}
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="zn-btn zn-btn--ghost zn-btn--small"
                  onClick={() => respondRequest(req, false)}
                  disabled={busyKey === `friend-${req.friendship_id}`}
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
          {partnerInvite && (
            <div style={requestRowStyle}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <UserChip
                  member={partnerInvite.partner}
                  sub="⚭ Wants to be your accountability partner"
                />
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button
                  type="button"
                  className="zn-btn zn-btn--small"
                  onClick={() => respondInvite(true)}
                  disabled={busyKey === "partner"}
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="zn-btn zn-btn--ghost zn-btn--small"
                  onClick={() => respondInvite(false)}
                  disabled={busyKey === "partner"}
                >
                  Decline
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="zn-card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              marginBottom: 10,
            }}
          >
            <p className="zn-eyebrow" style={{ margin: 0 }}>Activity</p>
            <button
              type="button"
              className="zn-btn zn-btn--ghost zn-btn--small"
              onClick={markAll}
            >
              Mark all read
            </button>
          </div>
          {notifications.map((n) => (
            <NotificationRow key={n.id} n={n} go={go} />
          ))}
        </div>
      )}
    </div>
  );
}

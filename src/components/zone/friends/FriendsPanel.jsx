import React, { useCallback, useEffect, useState } from "react";
import { useAppData } from "../../../hooks/useAppData.js";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { listFriends, respondFriendRequest, unblockUser } from "../../../lib/zoneService.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";
import { playSound } from "../../../lib/sounds.js";
import FriendSearch from "./FriendSearch.jsx";
import FriendRow from "./FriendRow.jsx";
import UserChip from "../shared/UserChip.jsx";
import ZoneEmpty from "../shared/ZoneEmpty.jsx";

const TABS = [
  { key: "friends", label: "Friends" },
  { key: "requests", label: "Requests" },
  { key: "blocked", label: "Blocked" },
];

const EMPTY = { friends: [], incoming: [], outgoing: [], blocked: [] };

// Friends home: exact-@ search, the circle, requests both ways, and blocks.
export default function FriendsPanel({ go }) {
  const { pushToast, settings } = useAppData();
  const { userId, refreshState } = useZoneCtx();
  const [tab, setTab] = useState("friends");
  const [data, setData] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await listFriends();
      setData({
        friends: Array.isArray(res?.friends) ? res.friends : [],
        incoming: Array.isArray(res?.incoming) ? res.incoming : [],
        outgoing: Array.isArray(res?.outgoing) ? res.outgoing : [],
        blocked: Array.isArray(res?.blocked) ? res.blocked : [],
      });
    } catch (err) {
      setData(EMPTY);
      pushToast({ type: "error", title: "Couldn't load friends", message: zoneErrorMessage(err) });
    }
  }, [pushToast]);

  useEffect(() => {
    load();
  }, [load]);

  const respond = async (req, accept) => {
    setBusyId(req.friendship_id);
    try {
      await respondFriendRequest(req.friendship_id, accept);
      if (accept) {
        playSound("chime", settings);
        pushToast({
          type: "success",
          title: "Friends 🔥",
          message: `You and @${req.username} are connected.`,
        });
      }
      await load();
      refreshState();
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't respond", message: zoneErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  const unblock = async (row) => {
    setBusyId(row.user_id);
    try {
      await unblockUser(row.user_id, userId);
      pushToast({ type: "success", title: "Unblocked", message: `@${row.username} can find you again.` });
      await load();
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't unblock", message: zoneErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  };

  const loading = data === null;
  const friends = data?.friends || [];
  const incoming = data?.incoming || [];
  const outgoing = data?.outgoing || [];
  const blocked = data?.blocked || [];

  const chipStyle = { cursor: "pointer", fontFamily: "var(--font-body)" };

  return (
    <div className="zn-stagger">
      <div className="zn-chipbar" style={{ marginBottom: 12 }} role="tablist" aria-label="Friends sections">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={`zn-chip${tab === t.key ? " zn-chip--fire" : ""}`}
            style={chipStyle}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.key === "requests" && incoming.length > 0 ? ` · ${incoming.length}` : ""}
          </button>
        ))}
      </div>

      {tab === "friends" && (
        <>
          <FriendSearch onChanged={load} />
          {loading ? (
            <div className="zn-empty">Gathering your circle…</div>
          ) : friends.length === 0 ? (
            <ZoneEmpty which="friends" icon="🤝" />
          ) : (
            friends.map((f) => (
              <FriendRow key={f.user_id} friend={f} go={go} onChanged={load} />
            ))
          )}
        </>
      )}

      {tab === "requests" && (
        <>
          <div className="zn-card">
            <p className="zn-eyebrow">Incoming</p>
            {loading ? (
              <div className="zn-empty">…</div>
            ) : incoming.length === 0 ? (
              <p style={{ fontSize: 13.5, color: "var(--text-soft)", margin: 0, lineHeight: 1.55 }}>
                No requests waiting. Your exact @name is the invitation.
              </p>
            ) : (
              incoming.map((req) => (
                <div
                  key={req.friendship_id}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <UserChip member={req} />
                  </div>
                  <button
                    type="button"
                    className="zn-btn zn-btn--small"
                    disabled={busyId === req.friendship_id}
                    onClick={() => respond(req, true)}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="zn-btn zn-btn--ghost zn-btn--small"
                    disabled={busyId === req.friendship_id}
                    onClick={() => respond(req, false)}
                  >
                    Decline
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="zn-card">
            <p className="zn-eyebrow">Outgoing</p>
            {loading ? (
              <div className="zn-empty">…</div>
            ) : outgoing.length === 0 ? (
              <p style={{ fontSize: 13.5, color: "var(--text-soft)", margin: 0, lineHeight: 1.55 }}>
                Nothing pending from your side.
              </p>
            ) : (
              outgoing.map((req) => (
                <div
                  key={req.friendship_id}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <UserChip member={req} />
                  </div>
                  <span className="zn-chip">pending</span>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {tab === "blocked" && (
        <div className="zn-card">
          <p className="zn-eyebrow">Blocked</p>
          {loading ? (
            <div className="zn-empty">…</div>
          ) : blocked.length === 0 ? (
            <p style={{ fontSize: 13.5, color: "var(--text-soft)", margin: 0, lineHeight: 1.55 }}>
              No one blocked. May it stay that way.
            </p>
          ) : (
            blocked.map((row) => (
              <div
                key={row.user_id}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <UserChip member={row} sub={`@${row.username}`} />
                </div>
                <button
                  type="button"
                  className="zn-btn zn-btn--ghost zn-btn--small"
                  disabled={busyId === row.user_id}
                  onClick={() => unblock(row)}
                >
                  {busyId === row.user_id ? "…" : "Unblock"}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

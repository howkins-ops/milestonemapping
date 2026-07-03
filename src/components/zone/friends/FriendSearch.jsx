import React, { useState } from "react";
import { useAppData } from "../../../hooks/useAppData.js";
import { findUser, sendFriendRequest } from "../../../lib/zoneService.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";
import { playSound } from "../../../lib/sounds.js";
import UserChip from "../shared/UserChip.jsx";

// Exact @username lookup ONLY — no browsing, no suggestions. Privacy by design.
export default function FriendSearch({ onChanged }) {
  const { pushToast, settings } = useAppData();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null); // null = untouched, { user: null } = not found
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);

  const search = async (e) => {
    e?.preventDefault();
    const username = query.trim();
    if (!username || searching) return;
    setSearching(true);
    setResult(null);
    try {
      const res = await findUser(username);
      setResult({ user: res && !res.offline ? res : null });
    } catch (err) {
      pushToast({ type: "error", title: "Search flickered", message: zoneErrorMessage(err) });
    } finally {
      setSearching(false);
    }
  };

  const act = async () => {
    const user = result?.user;
    if (!user || sending) return;
    setSending(true);
    try {
      await sendFriendRequest(user.username);
      if (user.relation === "pending_in") {
        // Mutual request — the backend auto-accepts.
        playSound("chime", settings);
        pushToast({
          type: "success",
          title: "Friends 🔥",
          message: `You and @${user.username} are connected.`,
        });
        setResult({ user: { ...user, relation: "friends" } });
      } else {
        pushToast({
          type: "success",
          title: "Request sent 🔥",
          message: `@${user.username} will see it.`,
        });
        setResult({ user: { ...user, relation: "pending_out" } });
      }
      onChanged?.();
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't send", message: zoneErrorMessage(err) });
    } finally {
      setSending(false);
    }
  };

  const user = result?.user;
  const relation = user?.relation || "none";

  return (
    <div className="zn-card">
      <form onSubmit={search}>
        <div className="zn-field" style={{ marginBottom: 8 }}>
          <label className="zn-label" htmlFor="zn-friend-search">Add by exact @name</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              id="zn-friend-search"
              className="zn-input"
              value={query}
              onChange={(e) => setQuery(e.target.value.toLowerCase().replace(/@/g, ""))}
              placeholder="username"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck="false"
              maxLength={20}
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              className="zn-btn zn-btn--small"
              style={{ flexShrink: 0, alignSelf: "stretch" }}
              disabled={searching || !query.trim()}
            >
              {searching ? "…" : "Search"}
            </button>
          </div>
        </div>
      </form>
      <p className="zn-hint" style={{ margin: 0 }}>
        Exact @username only — no browsing, by design. Ask your people for theirs.
      </p>

      {result && !user && (
        <p className="zn-hint" style={{ marginTop: 10 }}>
          No one found with that name. Check the spelling with them directly.
        </p>
      )}

      {user && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid var(--zn-border)",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <UserChip
              member={user}
              sub={user.zone_streak > 0 ? `🔥 ${user.zone_streak}-day streak` : `@${user.username}`}
            />
          </div>
          {relation === "self" && (
            <button type="button" className="zn-btn zn-btn--ghost zn-btn--small" disabled>
              That's you
            </button>
          )}
          {relation === "friends" && (
            <button type="button" className="zn-btn zn-btn--ghost zn-btn--small" disabled>
              Friends ✓
            </button>
          )}
          {relation === "pending_out" && (
            <button type="button" className="zn-btn zn-btn--ghost zn-btn--small" disabled>
              Pending
            </button>
          )}
          {relation === "pending_in" && (
            <button type="button" className="zn-btn zn-btn--small" disabled={sending} onClick={act}>
              {sending ? "…" : "Accept"}
            </button>
          )}
          {relation === "none" && (
            <button type="button" className="zn-btn zn-btn--small" disabled={sending} onClick={act}>
              {sending ? "…" : "Send request"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

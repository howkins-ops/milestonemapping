import React, { useState } from "react";
import { useAppData } from "../../../hooks/useAppData.js";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { kickMember, transferOwnership, leaveSquad } from "../../../lib/zoneService.js";
import { zoneErrorMessage } from "../../../lib/zoneFire.js";
import UserChip from "../shared/UserChip.jsx";

// Who's in the fire, who runs it, and the role-gated levers.
// Every destructive action is a two-tap inline confirm — no modals, no drama.
export default function SquadRoster({ squad, members, myRole, onChanged }) {
  const { pushToast } = useAppData();
  const { userId, refreshState } = useZoneCtx();
  const [openId, setOpenId] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [busy, setBusy] = useState(null);

  const canKick = (m) =>
    m.user_id !== userId &&
    ((myRole === "owner" && m.role !== "owner") || (myRole === "mod" && m.role === "member"));
  const canTransfer = (m) => myRole === "owner" && m.user_id !== userId;

  const run = async (key, fn, successToast) => {
    if (confirming !== key) {
      setConfirming(key);
      return;
    }
    setConfirming(null);
    setBusy(key);
    try {
      await fn();
      if (successToast) pushToast(successToast);
      onChanged?.();
      refreshState();
    } catch (err) {
      pushToast({ type: "error", title: "That didn't land", message: zoneErrorMessage(err) });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="zn-card">
      <p className="zn-eyebrow">Roster</p>
      {members.map((m) => {
        const hasActions = canKick(m) || canTransfer(m);
        const kickKey = `kick:${m.user_id}`;
        const transferKey = `transfer:${m.user_id}`;
        return (
          <div
            key={m.user_id}
            style={{ padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <UserChip
                  member={m}
                  sub={`${m.role}${m.proved_today ? " · 🔥 proved today" : ""}`}
                />
              </div>
              {m.role === "owner" && <span className="zn-chip" title="Owner">👑</span>}
              {m.role === "mod" && <span className="zn-chip" title="Mod">🛠</span>}
              {m.user_id === userId && <span className="zn-chip zn-chip--fire">you</span>}
              {hasActions && (
                <button
                  type="button"
                  className="zn-btn zn-btn--ghost zn-btn--small"
                  aria-expanded={openId === m.user_id}
                  aria-label={`Actions for ${m.display_name || m.username}`}
                  onClick={() => {
                    setOpenId(openId === m.user_id ? null : m.user_id);
                    setConfirming(null);
                  }}
                >
                  ⋯
                </button>
              )}
            </div>
            {openId === m.user_id && hasActions && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {canTransfer(m) && (
                  <button
                    type="button"
                    className="zn-btn zn-btn--ghost zn-btn--small"
                    disabled={busy === transferKey}
                    onClick={() =>
                      run(
                        transferKey,
                        () => transferOwnership(squad.id, m.user_id),
                        {
                          type: "success",
                          title: "Torch passed 👑",
                          message: `@${m.username} now owns ${squad.name}.`,
                        }
                      )
                    }
                  >
                    {busy === transferKey
                      ? "…"
                      : confirming === transferKey
                        ? "Really pass the torch?"
                        : "👑 Transfer ownership"}
                  </button>
                )}
                {canKick(m) && (
                  <button
                    type="button"
                    className="zn-btn zn-btn--danger zn-btn--small"
                    disabled={busy === kickKey}
                    onClick={() =>
                      run(
                        kickKey,
                        () => kickMember(squad.id, m.user_id),
                        {
                          type: "success",
                          title: "Removed",
                          message: `@${m.username} was removed from the squad.`,
                        }
                      )
                    }
                  >
                    {busy === kickKey ? "…" : confirming === kickKey ? "Really kick?" : "Kick"}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        className="zn-btn zn-btn--danger"
        style={{ marginTop: 14 }}
        disabled={busy === "leave"}
        onClick={() =>
          run("leave", () => leaveSquad(squad.id), {
            type: "success",
            title: "You left the squad",
            message: "Their fire keeps burning — so does yours.",
          })
        }
      >
        {busy === "leave"
          ? "…"
          : confirming === "leave"
            ? "Really leave the squad?"
            : "Leave squad"}
      </button>
    </div>
  );
}

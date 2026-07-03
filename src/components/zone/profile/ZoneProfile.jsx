import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../../lib/supabase.js";
import { useZoneCtx } from "../../../hooks/useZone.js";
import { useAppData } from "../../../hooks/useAppData.js";
import { updateZoneProfile, blockUser, getOrCreateDm } from "../../../lib/zoneService.js";
import { zoneErrorMessage, getPhoenixStage } from "../../../lib/zoneFire.js";
import UserChip from "../shared/UserChip.jsx";
import ReportButton from "../shared/ReportButton.jsx";
import PhotoCalendar from "./PhotoCalendar.jsx";
import ProofGallery from "./ProofGallery.jsx";

// A member's page — mine, or someone else's (RLS decides what a stranger
// sees: no row back means the profile stays private).
export default function ZoneProfile({ go, viewUserId }) {
  const ctx = useZoneCtx();
  const { pushToast } = useAppData();
  const isSelf = !viewUserId || viewUserId === ctx.userId;
  const targetId = isSelf ? ctx.userId : viewUserId;

  const [other, setOther] = useState(null);
  const [loadingOther, setLoadingOther] = useState(!isSelf);
  const [proofCount, setProofCount] = useState(null);
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [blockConfirm, setBlockConfirm] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const aliveRef = useRef(true);

  // Load the other member's row (self comes from ctx.member).
  useEffect(() => {
    aliveRef.current = true;
    if (isSelf || !supabase || !viewUserId) {
      setLoadingOther(false);
      return undefined;
    }
    setLoadingOther(true);
    (async () => {
      try {
        const { data, error } = await supabase
          .from("zone_members")
          .select("*")
          .eq("user_id", viewUserId)
          .maybeSingle();
        if (error) throw error;
        if (aliveRef.current) setOther(data || null);
      } catch (err) {
        if (aliveRef.current) {
          pushToast({ type: "error", title: "Couldn't open profile", message: zoneErrorMessage(err) });
        }
      } finally {
        if (aliveRef.current) setLoadingOther(false);
      }
    })();
    return () => {
      aliveRef.current = false;
    };
  }, [isSelf, viewUserId, pushToast]);

  // Proof count (RLS-filtered, so a viewer only counts what they may see).
  useEffect(() => {
    if (!supabase || !targetId) return undefined;
    let alive = true;
    (async () => {
      try {
        const { count, error } = await supabase
          .from("zone_proofs")
          .select("id", { count: "exact", head: true })
          .eq("user_id", targetId);
        if (error) throw error;
        if (alive) setProofCount(count ?? 0);
      } catch {
        if (alive) setProofCount(0);
      }
    })();
    return () => {
      alive = false;
    };
  }, [targetId]);

  const member = isSelf ? ctx.member : other;

  if (!isSelf && loadingOther) {
    return <div className="zn-empty">Finding them in the fire…</div>;
  }

  if (!member) {
    return (
      <div className="zn-card" style={{ textAlign: "center" }}>
        <div style={{ fontSize: 34, marginBottom: 10 }} aria-hidden="true">🔒</div>
        <h3 className="zn-card__title" style={{ marginBottom: 6 }}>This profile is private</h3>
        <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-soft)", lineHeight: 1.55 }}>
          Profiles open up between friends. Send a request and the fire gets warmer.
        </p>
      </div>
    );
  }

  const stage = getPhoenixStage(member.longest_zone_streak || 0);
  const joined = member.created_at || member.joined_at;

  const startEdit = () => {
    setNameInput(member.display_name || "");
    setTitleInput(member.identity_title || "");
    setEditing(true);
  };

  const saveEdit = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await updateZoneProfile(ctx.userId, {
        display_name: nameInput.trim() || null,
        identity_title: titleInput.trim() || null,
      });
      await ctx.refreshState();
      setEditing(false);
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't save profile", message: zoneErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const openDm = async () => {
    if (actionBusy) return;
    setActionBusy(true);
    try {
      const res = await getOrCreateDm(targetId);
      const conversationId = res?.conversation_id || res?.id || res;
      if (conversationId) go("messages", conversationId);
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't open the chat", message: zoneErrorMessage(err) });
    } finally {
      setActionBusy(false);
    }
  };

  const doBlock = async () => {
    if (!blockConfirm) {
      setBlockConfirm(true);
      return;
    }
    if (actionBusy) return;
    setActionBusy(true);
    try {
      await blockUser(targetId);
      pushToast({ type: "success", title: "Blocked", message: "They won't see you, you won't see them." });
      go("friends");
    } catch (err) {
      pushToast({ type: "error", title: "Couldn't block", message: zoneErrorMessage(err) });
      setActionBusy(false);
      setBlockConfirm(false);
    }
  };

  return (
    <div className="zn-stagger">
      {/* Header */}
      <div className="zn-card zn-card--glow">
        <UserChip
          member={member}
          size="lg"
          sub={[member.username ? `@${member.username}` : null, member.identity_title]
            .filter(Boolean)
            .join(" · ")}
        />
        {joined && (
          <p className="zn-hint" style={{ marginTop: 10 }}>
            In the fire since {new Date(joined).toLocaleDateString()}
          </p>
        )}
        <div className="zn-chipbar" style={{ marginTop: 8 }}>
          <span className="zn-chip zn-chip--fire">{stage.icon} {stage.label}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="zn-card">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          <div className="zn-stat">
            <div className="zn-stat__num">🔥 {Number(member.zone_streak ?? 0)}</div>
            <div className="zn-stat__label">streak</div>
          </div>
          <div className="zn-stat">
            <div className="zn-stat__num">🏔 {Number(member.longest_zone_streak ?? 0)}</div>
            <div className="zn-stat__label">longest</div>
          </div>
          <div className="zn-stat">
            <div className="zn-stat__num">📸 {proofCount ?? "…"}</div>
            <div className="zn-stat__label">proofs</div>
          </div>
        </div>
      </div>

      {/* Self tools */}
      {isSelf && (
        <div className="zn-card">
          {editing ? (
            <>
              <div className="zn-field">
                <label className="zn-label" htmlFor="zn-prof-name">Display name</label>
                <input
                  id="zn-prof-name"
                  className="zn-input"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={40}
                />
              </div>
              <div className="zn-field">
                <label className="zn-label" htmlFor="zn-prof-title">Identity title</label>
                <input
                  id="zn-prof-title"
                  className="zn-input"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="The one who shows up"
                  maxLength={60}
                />
              </div>
              <div className="zn-2col">
                <button type="button" className="zn-btn zn-btn--ghost" onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="button" className="zn-btn" onClick={saveEdit} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </>
          ) : (
            <>
              <button type="button" className="zn-btn zn-btn--ghost" style={{ marginBottom: 8 }} onClick={startEdit}>
                ✎ Edit profile
              </button>
              <div className="zn-2col">
                <button type="button" className="zn-btn zn-btn--ghost" onClick={() => go("reports")}>
                  📊 Weekly reports
                </button>
                <button type="button" className="zn-btn zn-btn--ghost" onClick={() => go("friends")}>
                  🤝 Friends
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Other-user tools */}
      {!isSelf && (
        <div className="zn-card">
          <button type="button" className="zn-btn" style={{ marginBottom: 8 }} onClick={openDm} disabled={actionBusy}>
            💬 Message
          </button>
          <div className="zn-2col">
            <button type="button" className="zn-btn zn-btn--danger" onClick={doBlock} disabled={actionBusy}>
              {blockConfirm ? "Really block?" : "🚫 Block"}
            </button>
            <ReportButton contentType="profile" targetUser={targetId} />
          </div>
        </div>
      )}

      <PhotoCalendar userId={targetId} />
      <ProofGallery userId={targetId} />
    </div>
  );
}

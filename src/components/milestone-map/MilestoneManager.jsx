import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useAppData } from "../../hooks/useAppData.js";
import { getProjectMilestones } from "../../lib/progress.js";
import { CATEGORIES } from "../../lib/constants.js";
import ConfirmModal from "../ui/ConfirmModal.jsx";

const STATUS_DOT = {
  completed: "is-completed",
  in_progress: "is-in_progress",
  active: "is-active",
  locked: "is-locked"
};

function dotClass(status) {
  return STATUS_DOT[status] || "is-locked";
}

export default function MilestoneManager({ project, onOpenMilestone, onClose }) {
  const { milestones, createMilestone, updateMilestone, deleteMilestone, reorderProjectMilestones } =
    useAppData();

  const list = getProjectMilestones(milestones, project.id);

  // quick-add
  const [draft, setDraft] = useState("");
  const [draftCategory, setDraftCategory] = useState(project.category || "Business");

  // inline rename (✎) — edit the name in place and save immediately
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  // modals
  const [confirmTarget, setConfirmTarget] = useState(null);

  // ── drag-to-reorder (pointer-based, so it works on touch + desktop) ─────────
  const [orderIds, setOrderIds] = useState(() => list.map((m) => m.id));
  const [dragId, setDragId] = useState(null);
  const draggingRef = useRef(null);
  const orderIdsRef = useRef(orderIds);
  orderIdsRef.current = orderIds;
  const rowRefs = useRef(new Map());

  // Keep local order in sync with the store whenever the set of milestones
  // changes (add / delete / committed reorder) — but never mid-drag.
  const listIdsKey = list.map((m) => m.id).join(",");
  useEffect(() => {
    if (dragId) return;
    setOrderIds(list.map((m) => m.id));
  }, [listIdsKey, dragId]);

  // Display list in the current (possibly mid-drag) order; append any milestone
  // not yet tracked so nothing ever disappears.
  const orderedList = useMemo(() => {
    const byId = new Map(list.map((m) => [m.id, m]));
    const out = [];
    const seen = new Set();
    for (const id of orderIds) {
      const m = byId.get(id);
      if (m) { out.push(m); seen.add(id); }
    }
    for (const m of list) if (!seen.has(m.id)) out.push(m);
    return out;
  }, [orderIds, list]);

  const beginDrag = (e, id) => {
    if (e.button != null && e.button !== 0) return;
    e.preventDefault();
    draggingRef.current = { id };
    setDragId(id);
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  };

  const onDragMove = (e) => {
    const d = draggingRef.current;
    if (!d) return;
    const ids = orderIdsRef.current;
    const from = ids.indexOf(d.id);
    if (from < 0) return;
    const y = e.clientY;
    let to = ids.length - 1;
    for (let idx = 0; idx < ids.length; idx++) {
      const node = rowRefs.current.get(ids[idx]);
      if (!node) continue;
      const r = node.getBoundingClientRect();
      if (y < r.top + r.height / 2) { to = idx; break; }
    }
    if (to !== from) {
      const next = [...ids];
      next.splice(from, 1);
      next.splice(to, 0, d.id);
      setOrderIds(next);
    }
  };

  const endDrag = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = null;
    setDragId(null);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    reorderProjectMilestones(project.id, orderIdsRef.current);
  };

  // Escape to close + lock body scroll while the editor is open. The component
  // only mounts when open, so no `open` guard is needed.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const quickAdd = () => {
    const title = draft.trim();
    if (!title) return;
    createMilestone({ title, category: draftCategory, projectId: project.id });
    setDraft("");
  };

  const startRename = (m) => {
    setEditingId(m.id);
    setEditingTitle(m.title || "");
  };

  const commitRename = (id) => {
    const title = editingTitle.trim();
    const current = list.find((m) => m.id === id);
    if (title && title !== (current?.title || "")) {
      updateMilestone(id, { title }); // updates state + syncs to backend
    }
    setEditingId(null);
    setEditingTitle("");
  };

  return createPortal(
    <div
      className="ms-manager-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Milestone manager"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <aside className="ms-manager-modal">
        <div className="ms-manager-modal__head">
          <span className="ms-manager-modal__title">EDIT / ADD MILESTONES</span>
          <button
            type="button"
            className="ms-manager-modal__close"
            onClick={onClose}
            aria-label="Close milestone editor"
          >
            ×
          </button>
        </div>

          <p className="trail-world__manager-hint">Drag <span aria-hidden="true">⠿</span> to reorder · tap a name to open it</p>
          <div className="trail-world__manager-list">
        {orderedList.length === 0 && (
          <p className="trail-world__manager-empty">No milestones yet. Add one below.</p>
        )}

        {orderedList.map((m, i) => (
          <div
            key={m.id}
            ref={(el) => { if (el) rowRefs.current.set(m.id, el); else rowRefs.current.delete(m.id); }}
            className={`trail-world__manager-row ${dragId === m.id ? "is-dragging" : ""}`}
          >
            <button
              type="button"
              className="trail-world__manager-grip"
              aria-label="Drag to reorder"
              title="Drag to reorder"
              onPointerDown={(e) => beginDrag(e, m.id)}
              onPointerMove={onDragMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              ⠿
            </button>

            <span className="trail-world__manager-pos">{String(i + 1).padStart(2, "0")}</span>
            <i className={`trail-world__manager-dot ${dotClass(m.status)}`} aria-hidden="true" />

            {editingId === m.id ? (
              <input
                className="trail-world__manager-rename"
                value={editingTitle}
                autoFocus
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={() => commitRename(m.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename(m.id);
                  if (e.key === "Escape") {
                    setEditingId(null);
                    setEditingTitle("");
                  }
                }}
                aria-label="Edit milestone name"
              />
            ) : (
              <button
                type="button"
                className="trail-world__manager-title"
                title={m.title}
                onClick={() => onOpenMilestone(m.id)}
              >
                {m.title || "Untitled"}
              </button>
            )}

            <div className="trail-world__manager-ctrls">
              {editingId === m.id ? (
                <button
                  type="button"
                  className="is-save"
                  onClick={() => commitRename(m.id)}
                  aria-label="Save name"
                  title="Save"
                >
                  ✓
                </button>
              ) : (
                <button type="button" onClick={() => startRename(m)} aria-label="Edit name" title="Edit name">
                  ✎
                </button>
              )}
              <button
                type="button"
                className="is-danger"
                onClick={() => setConfirmTarget(m)}
                aria-label="Delete milestone"
                title="Delete"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="trail-world__manager-add">
        <input
          className="trail-world__manager-input"
          value={draft}
          placeholder="Quick add milestone..."
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") quickAdd();
          }}
          aria-label="New milestone title"
        />
        <select
          className="trail-world__manager-select"
          value={draftCategory}
          onChange={(e) => setDraftCategory(e.target.value)}
          aria-label="New milestone category"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="trail-world__manager-addbtn"
          onClick={quickAdd}
          disabled={!draft.trim()}
        >
          + Add
        </button>
      </div>

        <ConfirmModal
          open={Boolean(confirmTarget)}
          onClose={() => setConfirmTarget(null)}
          onConfirm={() => confirmTarget && deleteMilestone(confirmTarget.id)}
          title="Delete milestone?"
          message={
            confirmTarget
              ? `"${confirmTarget.title || "Untitled"}" will be removed from this trail.`
              : ""
          }
          confirmLabel="Delete"
          danger
        />
      </aside>
    </div>,
    document.body
  );
}

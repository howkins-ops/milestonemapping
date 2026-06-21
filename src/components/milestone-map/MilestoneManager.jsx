import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAppData } from "../../hooks/useAppData.js";
import { getProjectMilestones } from "../../lib/progress.js";
import { CATEGORIES } from "../../lib/constants.js";
import MilestoneWizard from "../milestones/MilestoneWizard.jsx";
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

  // inline rename
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  // modals
  const [wizardInitial, setWizardInitial] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

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

  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const ids = list.map((m) => m.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorderProjectMilestones(project.id, ids);
  };

  const makeFirst = (id) => {
    const rest = list.map((m) => m.id).filter((x) => x !== id);
    reorderProjectMilestones(project.id, [id, ...rest]);
  };

  const makeLast = (id) => {
    const rest = list.map((m) => m.id).filter((x) => x !== id);
    reorderProjectMilestones(project.id, [...rest, id]);
  };

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
      updateMilestone(id, { title });
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

          <div className="trail-world__manager-list">
        {list.length === 0 && (
          <p className="trail-world__manager-empty">No milestones yet. Add one below.</p>
        )}

        {list.map((m, i) => (
          <div key={m.id} className="trail-world__manager-row">
            <span className="trail-world__manager-pos">{String(i + 1).padStart(2, "0")}</span>
            {i === 0 && <span className="trail-world__manager-badge is-first">FIRST</span>}
            {i === list.length - 1 && list.length > 1 && (
              <span className="trail-world__manager-badge is-last">LAST</span>
            )}
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
                aria-label="Rename milestone"
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
              <button
                type="button"
                disabled={i === 0}
                onClick={() => makeFirst(m.id)}
                aria-label="Set as first milestone"
                title="Make first"
              >
                ⤒
              </button>
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                ↑
              </button>
              <button
                type="button"
                disabled={i === list.length - 1}
                onClick={() => move(i, 1)}
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                disabled={i === list.length - 1}
                onClick={() => makeLast(m.id)}
                aria-label="Set as last milestone"
                title="Make last"
              >
                ⤓
              </button>
              <button type="button" onClick={() => startRename(m)} aria-label="Rename">
                ✎
              </button>
              <button type="button" onClick={() => setWizardInitial(m)} aria-label="Edit details">
                ⚙
              </button>
              <button
                type="button"
                className="is-danger"
                onClick={() => setConfirmTarget(m)}
                aria-label="Delete"
              >
                ✕
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

        {wizardInitial && (
          <MilestoneWizard
            open
            initial={wizardInitial}
            onClose={() => setWizardInitial(null)}
            onCreate={() => {}}
            onUpdate={updateMilestone}
          />
        )}

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

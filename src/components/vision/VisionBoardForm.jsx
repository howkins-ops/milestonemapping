import React, { useState, useRef } from "react";
import Modal from "../ui/Modal.jsx";
import Button from "../ui/Button.jsx";
import TextInput from "../ui/TextInput.jsx";
import TextArea from "../ui/TextArea.jsx";
import Select from "../ui/Select.jsx";
import { VISION_CATEGORIES } from "../../lib/constants.js";
import { useAppData } from "../../hooks/useAppData.js";

const EMPTY = { imageUrl: "", title: "", caption: "", category: "Dream Life", projectId: "" };

export default function VisionBoardForm({ open, onClose, onAdd, defaultProjectId = "" }) {
  const { projects } = useAppData();
  const [form, setForm] = useState({ ...EMPTY, projectId: defaultProjectId });
  const [urlMode, setUrlMode] = useState(false);
  const fileInputRef = useRef(null);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, imageUrl: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setForm((f) => ({ ...f, imageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const submit = () => {
    if (!form.title.trim()) return;
    const { projectId, ...rest } = form;
    onAdd({ ...rest, projectIds: projectId ? [projectId] : [] });
    setForm({ ...EMPTY, projectId: defaultProjectId });
    setUrlMode(false);
    onClose();
  };

  const hasImage = !!form.imageUrl;
  const activeProjects = projects.filter((p) => p.status !== "completed");
  const projectOptions = [
    { value: "", label: "No project (standalone vision)" },
    ...activeProjects.map((p) => ({ value: p.id, label: `${p.icon} ${p.title}` }))
  ];

  return (
    <Modal open={open} onClose={onClose} title="Add to Vision Board">
      <div className="stack">
        <TextInput
          label="Title"
          value={form.title}
          onChange={set("title")}
          placeholder="The mountain house. The marathon finish line."
          autoFocus
        />

        {/* Image upload section */}
        <div>
          <label style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted, #888)", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
            Image (optional)
          </label>

          {hasImage ? (
            <div style={{ position: "relative", borderRadius: "0.75rem", overflow: "hidden", border: "1px solid rgba(139,92,246,0.4)" }}>
              <img
                src={form.imageUrl}
                alt="preview"
                style={{ width: "100%", maxHeight: "180px", objectFit: "cover", display: "block" }}
              />
              <button
                onClick={clearImage}
                style={{
                  position: "absolute", top: "0.5rem", right: "0.5rem",
                  background: "rgba(0,0,0,0.7)", border: "none", borderRadius: "50%",
                  width: "28px", height: "28px", cursor: "pointer", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.85rem", lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          ) : urlMode ? (
            <div>
              <TextInput
                value={form.imageUrl}
                onChange={set("imageUrl")}
                placeholder="https://..."
              />
              <button
                onClick={() => { setUrlMode(false); clearImage(); }}
                style={{ background: "none", border: "none", color: "var(--neon-purple, #8b5cf6)", cursor: "pointer", fontSize: "0.8rem", marginTop: "0.35rem", padding: 0 }}
              >
                ← Back to file upload
              </button>
            </div>
          ) : (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                style={{ display: "none" }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: "100%", padding: "1.25rem", borderRadius: "0.75rem",
                  border: "2px dashed rgba(139,92,246,0.4)",
                  background: "rgba(139,92,246,0.06)",
                  color: "var(--text-muted, #888)", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem",
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.8)"; e.currentTarget.style.background = "rgba(139,92,246,0.12)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"; e.currentTarget.style.background = "rgba(139,92,246,0.06)"; }}
              >
                <span style={{ fontSize: "1.75rem" }}>📷</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary, #fff)", fontSize: "0.9rem" }}>Upload a photo</span>
                <span style={{ fontSize: "0.75rem" }}>Tap to choose from your camera roll or take a new photo</span>
              </button>
              <button
                onClick={() => setUrlMode(true)}
                style={{ background: "none", border: "none", color: "var(--neon-purple, #8b5cf6)", cursor: "pointer", fontSize: "0.8rem", marginTop: "0.4rem", padding: 0 }}
              >
                Or paste an image URL instead →
              </button>
            </div>
          )}
        </div>

        <TextArea
          label="Caption"
          rows={2}
          value={form.caption}
          onChange={set("caption")}
          placeholder="Why this belongs in your future..."
        />
        <Select label="Category" value={form.category} onChange={set("category")} options={VISION_CATEGORIES} />

        {activeProjects.length > 0 && (
          <Select
            label="Link to Project (optional)"
            value={form.projectId}
            onChange={set("projectId")}
            options={projectOptions}
          />
        )}

        <Button variant="primary" size="lg" onClick={submit} disabled={!form.title.trim()}>
          🔭 Pin to the Future (+20 XP)
        </Button>
      </div>
    </Modal>
  );
}

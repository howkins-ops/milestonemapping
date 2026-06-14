import React, { useState, useRef, useEffect } from "react";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import { useAppData } from "../../hooks/useAppData.js";

const PLACEHOLDER_GRADIENTS = [
  "linear-gradient(135deg, #00FFBF, #00F0FF)",
  "linear-gradient(135deg, #8B5CF6, #FF3EDB)",
  "linear-gradient(135deg, #FACC15, #FB923C)"
];

export default function VisionBoardCard({ item, index = 0, onDelete, compact = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { projects, attachVisionToProject, detachVisionFromProject } = useAppData();

  const showImage = item.imageUrl && !imageFailed;
  const gradient = PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length];
  const linkedIds = item.projectIds || [];
  const linkedProjects = linkedIds.map((pid) => projects.find((p) => p.id === pid)).filter(Boolean);
  const unlinkableProjects = linkedProjects;
  const linkableProjects = projects.filter((p) => !linkedIds.includes(p.id) && p.status !== "completed");

  useEffect(() => {
    if (!linkOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setLinkOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [linkOpen]);

  return (
    <div
      className="card card--hoverable anim-slide-up"
      style={{
        padding: 0,
        overflow: "hidden",
        breakInside: "avoid",
        marginBottom: 16,
        animationDelay: `${(index % 8) * 60}ms`
      }}
    >
      <div style={{ position: "relative", aspectRatio: showImage ? "auto" : "16/10" }}>
        {showImage ? (
          <img
            src={item.imageUrl}
            alt={item.title || "Vision board image"}
            style={{ width: "100%", display: "block", transition: "transform 400ms var(--ease-out)" }}
            onError={() => setImageFailed(true)}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          />
        ) : (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: gradient,
              opacity: 0.55,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40
            }}
          >
            🔭
          </div>
        )}
        <div
          style={{
            position: "absolute",
            inset: "auto 0 0 0",
            padding: "30px 14px 12px",
            background: "linear-gradient(transparent, rgba(0,0,0,0.92))"
          }}
        >
          <Badge tone="cyan">{item.category}</Badge>
        </div>
      </div>

      <div style={{ padding: "14px 16px 16px" }}>
        <div className="row row--between">
          <h3 style={{ fontSize: 16 }}>{item.title}</h3>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              style={{ color: "var(--brand-red)" }}
              onClick={onDelete}
              aria-label={`Delete vision: ${item.title}`}
            >
              ✕
            </Button>
          )}
        </div>
        {item.caption && (
          <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>
            {item.caption}
          </p>
        )}

        {/* Linked project badges */}
        {linkedProjects.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {linkedProjects.map((p) => (
              <span
                key={p.id}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 11, fontWeight: 600,
                  background: "rgba(0,255,191,0.1)", border: "1px solid rgba(0,255,191,0.3)",
                  color: "var(--neon-cyan, #00FFBF)", borderRadius: 20, padding: "2px 8px 2px 6px",
                }}
              >
                {p.icon} {p.title}
                {!compact && (
                  <button
                    onClick={() => detachVisionFromProject(item.id, p.id)}
                    aria-label={`Unlink from ${p.title}`}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "rgba(0,255,191,0.5)", padding: 0, lineHeight: 1,
                      fontSize: 12, display: "flex", alignItems: "center"
                    }}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Link to project button */}
        {!compact && projects.length > 0 && (
          <div style={{ position: "relative", marginTop: 10 }} ref={dropdownRef}>
            <button
              onClick={() => setLinkOpen((o) => !o)}
              style={{
                background: "none", border: "1px solid rgba(139,92,246,0.35)",
                borderRadius: 20, padding: "3px 10px", cursor: "pointer",
                color: "var(--neon-purple, #8b5cf6)", fontSize: 11, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 4,
                transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.7)"; e.currentTarget.style.background = "rgba(139,92,246,0.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(139,92,246,0.35)"; e.currentTarget.style.background = "none"; }}
            >
              🔗 {linkedProjects.length > 0 ? "Manage links" : "Link to project"}
            </button>

            {linkOpen && (
              <div style={{
                position: "absolute", bottom: "calc(100% + 6px)", left: 0, zIndex: 50,
                background: "var(--bg-card, #1a1a2e)", border: "1px solid rgba(139,92,246,0.4)",
                borderRadius: 10, padding: 8, minWidth: 220, maxWidth: 280,
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)"
              }}>
                {unlinkableProjects.length > 0 && (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 8px 2px" }}>
                      Linked — click to unlink
                    </p>
                    {unlinkableProjects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { detachVisionFromProject(item.id, p.id); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, width: "100%",
                          background: "rgba(0,255,191,0.08)", border: "none", borderRadius: 7,
                          padding: "7px 10px", cursor: "pointer", color: "var(--neon-cyan, #00FFBF)",
                          fontSize: 13, fontWeight: 500, textAlign: "left", marginBottom: 3,
                        }}
                      >
                        <span>{p.icon}</span>
                        <span style={{ flex: 1 }}>{p.title}</span>
                        <span style={{ opacity: 0.6, fontSize: 11 }}>✓ linked</span>
                      </button>
                    ))}
                  </div>
                )}
                {linkableProjects.length > 0 && (
                  <div>
                    {unlinkableProjects.length > 0 && (
                      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "6px 0" }} />
                    )}
                    <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", padding: "4px 8px 2px" }}>
                      Link to project
                    </p>
                    {linkableProjects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { attachVisionToProject(item.id, p.id); setLinkOpen(false); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, width: "100%",
                          background: "none", border: "none", borderRadius: 7,
                          padding: "7px 10px", cursor: "pointer", color: "var(--text-primary, #fff)",
                          fontSize: 13, fontWeight: 500, textAlign: "left", marginBottom: 3,
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139,92,246,0.15)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                      >
                        <span>{p.icon}</span>
                        <span>{p.title}</span>
                      </button>
                    ))}
                  </div>
                )}
                {linkableProjects.length === 0 && unlinkableProjects.length === 0 && (
                  <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "8px 10px" }}>
                    No active projects yet.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useMemo, useRef, useState } from "react";
import VisionBoardForm from "./VisionBoardForm.jsx";
import VisionImageGenerator from "./VisionImageGenerator.jsx";
import VisionMeditation from "./VisionMeditation.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { resolveImageSrc } from "../../lib/imageUploadService.js";

// Tiles shown before collapsing the rest behind a "+N more" tile. Only applied
// on the home board (where onNavigate can jump to the full page).
const MAX_TILES = 11;
const ACCENTS = ["pink", "magenta", "purple", "cyan"];

// Inviting prompts shown only when a board is empty, so it never looks broken.
const GHOSTS = [
  { icon: "🏔️", label: "A dream" },
  { icon: "💪", label: "Your body" },
  { icon: "✈️", label: "A place" },
  { icon: "🏡", label: "Home" },
  { icon: "💎", label: "A goal" },
];

// Rotating "imagine it real" prompt — the future-self nudge on the header.
const PROMPTS = [
  "Picture it like it's already yours.",
  "If it were done — what would you see?",
  "Build the future you can already feel.",
  "See it before you become it.",
  "Evidence of where you're going.",
];

function prettyTitleFromFile(name = "") {
  return (
    name
      .replace(/\.[^.]+$/, "")
      .replace(/[-_]+/g, " ")
      .trim()
      .slice(0, 40) || "New vision"
  );
}

export default function VisionCollage({ projectId = null, onNavigate, kicker = "Vision Board", title = "See it before you build it" }) {
  const { visionBoard, projects, addVisionBoardItem, deleteVisionBoardItem, detachVisionFromProject, userId } =
    useAppData();

  const [formOpen, setFormOpen] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [meditateOpen, setMeditateOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const fileRef = useRef(null);

  const project = projectId ? projects.find((p) => p.id === projectId) : null;
  const items = useMemo(
    () => (projectId ? visionBoard.filter((v) => (v.projectIds || []).includes(projectId)) : visionBoard),
    [visionBoard, projectId]
  );

  const prompt = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return PROMPTS[dayOfYear % PROMPTS.length];
  }, []);

  const canCap = !projectId && typeof onNavigate === "function";
  const shown = canCap ? items.slice(0, MAX_TILES) : items;
  const extra = canCap ? items.length - shown.length : 0;
  const meditationImages = items.map((v) => v.imageUrl).filter(Boolean);

  // Turn dropped / picked image files into vision items, auto-linked to the
  // project when we're on a project board. resolveImageSrc handles the
  // signed-out / offline fallback so it always resolves to a usable src.
  const ingestFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    setUploading((n) => n + files.length);
    for (const file of files) {
      try {
        const url = await resolveImageSrc(file, userId);
        addVisionBoardItem({
          imageUrl: url,
          title: prettyTitleFromFile(file.name),
          category: "Dream Life",
          projectIds: projectId ? [projectId] : [],
        });
      } catch (err) {
        console.error("[vision] quick add failed", err);
      } finally {
        setUploading((n) => Math.max(0, n - 1));
      }
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    ingestFiles(e.dataTransfer?.files);
  };

  const pickFiles = (e) => {
    ingestFiles(e.target.files);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeTile = (item) => {
    if (projectId) detachVisionFromProject(item.id, projectId);
    else deleteVisionBoardItem(item.id);
  };

  const useGeneratedImage = ({ imageUrl, title: t }) => {
    addVisionBoardItem({
      imageUrl,
      title: t || "My vision",
      category: "Dream Life",
      projectIds: projectId ? [projectId] : [],
    });
    setGenOpen(false);
  };

  return (
    <section className="vision-collage anim-slide-up" aria-label="Vision board">
      <header className="vision-collage__head">
        <div className="vision-collage__heading">
          <p className="vision-collage__kicker">{kicker}</p>
          <h2 className="vision-collage__title">{title}</h2>
          <p className="vision-collage__prompt">✦ {prompt}</p>
        </div>
        <div className="vision-collage__actions">
          <button type="button" className="vision-collage__btn" onClick={() => setGenOpen(true)}>
            ✨ Imagine
          </button>
          <button
            type="button"
            className="vision-collage__btn vision-collage__btn--med"
            onClick={() => setMeditateOpen(true)}
          >
            ▶ Meditate
          </button>
          {!projectId && typeof onNavigate === "function" && (
            <button type="button" className="vision-collage__full" onClick={() => onNavigate("vision")}>
              Full board →
            </button>
          )}
        </div>
      </header>

      <div
        className={`vision-collage__grid${dragOver ? " is-dragover" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false);
        }}
        onDrop={onDrop}
      >
        {/* Add tile — opens the rich form (photo / camera / url / link) */}
        <button
          type="button"
          className="vision-tile vision-tile--add"
          onClick={() => setFormOpen(true)}
          aria-label="Add to vision board"
        >
          <span className="vision-tile__plus" aria-hidden="true">+</span>
          <span className="vision-tile__add-label">Add vision</span>
          <span className="vision-tile__add-sub">photo · url · camera</span>
        </button>

        {shown.map((item, i) => (
          <button
            key={item.id}
            type="button"
            className={`vision-tile vision-tile--${ACCENTS[i % ACCENTS.length]}`}
            onClick={() => setLightbox(item)}
            aria-label={`View vision: ${item.title || "untitled"}`}
          >
            {item.imageUrl ? (
              <img className="vision-tile__img" src={item.imageUrl} alt={item.title || "Vision"} loading="lazy" />
            ) : (
              <span className="vision-tile__placeholder" aria-hidden="true">🔭</span>
            )}
            <span className="vision-tile__shade" aria-hidden="true" />
            {item.category && <span className="vision-tile__cat">{item.category}</span>}
            {item.title && <span className="vision-tile__name">{item.title}</span>}
            <span
              className="vision-tile__del"
              role="button"
              tabIndex={-1}
              aria-label={`Remove ${item.title || "vision"}`}
              onClick={(e) => {
                e.stopPropagation();
                removeTile(item);
              }}
            >
              ✕
            </span>
          </button>
        ))}

        {/* Inviting prompts only while the board is empty */}
        {items.length === 0 &&
          GHOSTS.map((g) => (
            <button
              key={g.label}
              type="button"
              className="vision-tile vision-tile--ghost"
              onClick={() => setFormOpen(true)}
              aria-label={`Add ${g.label}`}
            >
              <span className="vision-tile__ghost-icon" aria-hidden="true">{g.icon}</span>
              <span className="vision-tile__ghost-label">{g.label}</span>
            </button>
          ))}

        {extra > 0 && (
          <button
            type="button"
            className="vision-tile vision-tile--more"
            onClick={() => onNavigate?.("vision")}
            aria-label={`See ${extra} more on the full board`}
          >
            <span className="vision-tile__more-num">+{extra}</span>
            <span className="vision-tile__more-label">more</span>
          </button>
        )}

        {uploading > 0 && (
          <span className="vision-tile vision-tile--loading" aria-hidden="true">
            <span className="vision-tile__spinner" />
          </span>
        )}
      </div>

      {dragOver && <div className="vision-collage__droptext">Drop photos to pin them to your future ✦</div>}

      <input ref={fileRef} type="file" accept="image/*" multiple onChange={pickFiles} style={{ display: "none" }} />

      {formOpen && (
        <VisionBoardForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onAdd={addVisionBoardItem}
          defaultProjectId={projectId || ""}
        />
      )}

      {genOpen && (
        <VisionImageGenerator
          onUse={useGeneratedImage}
          onClose={() => setGenOpen(false)}
          defaultPrompt={project ? `${project.title}` : ""}
          title={project ? `Imagine ${project.title}` : "Imagine Your Goal"}
        />
      )}

      {meditateOpen && (
        <VisionMeditation
          images={meditationImages}
          projectTitle={project ? project.title : ""}
          onClose={() => setMeditateOpen(false)}
        />
      )}

      {lightbox && (
        <div className="vision-lightbox" onClick={() => setLightbox(null)} role="dialog" aria-modal="true">
          <div className="vision-lightbox__inner" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="vision-lightbox__close" onClick={() => setLightbox(null)} aria-label="Close">
              ✕
            </button>
            {lightbox.imageUrl ? (
              <img className="vision-lightbox__img" src={lightbox.imageUrl} alt={lightbox.title || "Vision"} />
            ) : (
              <div className="vision-lightbox__placeholder" aria-hidden="true">🔭</div>
            )}
            <div className="vision-lightbox__meta">
              {lightbox.category && <span className="vision-lightbox__cat">{lightbox.category}</span>}
              {lightbox.title && <h3 className="vision-lightbox__title">{lightbox.title}</h3>}
              {lightbox.caption && <p className="vision-lightbox__caption">{lightbox.caption}</p>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

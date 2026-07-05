import React, { useMemo, useRef, useState } from "react";
import VisionBoardForm from "./VisionBoardForm.jsx";
import VisionImageGenerator from "./VisionImageGenerator.jsx";
import VisionMeditation from "./VisionMeditation.jsx";
import { useAppData } from "../../hooks/useAppData.js";
import { resolveImageSrc } from "../../lib/imageUploadService.js";

// Deterministic hand-pinned tilt so the board looks scattered but never
// reshuffles between renders. Indexed by position on the board.
const TILT = [-4, 3, -2, 4, -5, 2, -3, 5, -1, 3];
const PIN_TINT = ["cyan", "pink", "purple", "magenta", "gold"];

// Inviting ghost notes shown only while the board is empty.
const GHOSTS = [
  { icon: "🏔️", label: "A dream" },
  { icon: "✈️", label: "A place" },
  { icon: "💪", label: "Your body" },
  { icon: "🏡", label: "Home" },
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

export default function VisionBoardPage() {
  const {
    visionBoard,
    projects,
    addVisionBoardItem,
    deleteVisionBoardItem,
    attachVisionToProject,
    detachVisionFromProject,
    userId,
  } = useAppData();

  const [formOpen, setFormOpen] = useState(false);
  const [genOpen, setGenOpen] = useState(false);
  const [meditateOpen, setMeditateOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [detailId, setDetailId] = useState(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const fileRef = useRef(null);

  // Read the open item fresh so link/unlink re-renders the detail card.
  const detail = detailId ? visionBoard.find((v) => v.id === detailId) : null;
  const meditationImages = useMemo(
    () => visionBoard.map((v) => v.imageUrl).filter(Boolean),
    [visionBoard]
  );

  // Turn dropped / picked image files into pinned visions.
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
          projectIds: [],
        });
      } catch (err) {
        console.error("[vision] pin failed", err);
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

  const useGeneratedImage = ({ imageUrl, title }) => {
    addVisionBoardItem({ imageUrl, title: title || "My vision", category: "Dream Life", projectIds: [] });
    setGenOpen(false);
  };

  const closeDetail = () => {
    setDetailId(null);
    setLinkOpen(false);
  };

  const removeVision = (id) => {
    deleteVisionBoardItem(id);
    if (detailId === id) closeDetail();
  };

  // Project links for the currently-open detail card.
  const linkedIds = detail?.projectIds || [];
  const linkedProjects = linkedIds.map((pid) => projects.find((p) => p.id === pid)).filter(Boolean);
  const linkableProjects = projects.filter(
    (p) => !linkedIds.includes(p.id) && p.status !== "completed"
  );

  return (
    <div className="anim-fade-in">
      <header className="page-header">
        <div className="page-header__kicker">VISION BOARD</div>
        <h1 className="page-header__title">Your future, pinned where you can see it.</h1>
        <p className="page-header__sub">Every photo is a promise. Open one to see what it's tied to.</p>
      </header>

      <div className="cork-toolbar">
        <button type="button" className="cork-toolbar__btn cork-toolbar__btn--add" onClick={() => setFormOpen(true)}>
          <span aria-hidden="true">📌</span> Pin a Vision
        </button>
        <button type="button" className="cork-toolbar__btn" onClick={() => setGenOpen(true)}>
          <span aria-hidden="true">✨</span> Imagine
        </button>
        <button type="button" className="cork-toolbar__btn cork-toolbar__btn--med" onClick={() => setMeditateOpen(true)}>
          <span aria-hidden="true">▶</span> Meditate
        </button>
        <button type="button" className="cork-toolbar__btn cork-toolbar__btn--ghost" onClick={() => fileRef.current?.click()}>
          <span aria-hidden="true">⬆</span> Upload photos
        </button>
      </div>

      <div
        className={`corkboard${dragOver ? " is-dragover" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false);
        }}
        onDrop={onDrop}
      >
        <div className="corkboard__frame" aria-hidden="true" />

        {visionBoard.length === 0 ? (
          <div className="corkboard__empty">
            <div className="corkboard__empty-notes">
              {GHOSTS.map((g, i) => (
                <button
                  key={g.label}
                  type="button"
                  className="cork-pin cork-pin--ghost"
                  style={{ "--tilt": `${TILT[i % TILT.length]}deg` }}
                  onClick={() => setFormOpen(true)}
                  aria-label={`Pin ${g.label}`}
                >
                  <span className={`cork-pin__pin cork-pin__pin--${PIN_TINT[i % PIN_TINT.length]}`} aria-hidden="true" />
                  <span className="cork-pin__ghost-icon" aria-hidden="true">{g.icon}</span>
                  <span className="cork-pin__caption">{g.label}</span>
                </button>
              ))}
            </div>
            <p className="corkboard__empty-text">
              A future you can <em>see</em> is a future you can build.<br />Pin your first vision.
            </p>
          </div>
        ) : (
          <div className="corkboard__wall">
            {visionBoard.map((item, i) => (
              <button
                key={item.id}
                type="button"
                className="cork-pin"
                style={{ "--tilt": `${TILT[i % TILT.length]}deg` }}
                onClick={() => setDetailId(item.id)}
                aria-label={`Open vision: ${item.title || "untitled"}`}
              >
                <span className={`cork-pin__pin cork-pin__pin--${PIN_TINT[i % PIN_TINT.length]}`} aria-hidden="true" />
                <span
                  className="cork-pin__del"
                  role="button"
                  tabIndex={-1}
                  aria-label={`Remove ${item.title || "vision"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeVision(item.id);
                  }}
                >
                  ✕
                </span>
                <span className="cork-pin__photo">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title || "Vision"} loading="lazy" />
                  ) : (
                    <span className="cork-pin__placeholder" aria-hidden="true">🔭</span>
                  )}
                </span>
                <span className="cork-pin__caption">
                  {item.title || "Untitled"}
                  {(item.projectIds || []).length > 0 && (
                    <span className="cork-pin__linked" aria-hidden="true">🔗 {(item.projectIds || []).length}</span>
                  )}
                </span>
              </button>
            ))}

            {uploading > 0 && (
              <span className="cork-pin cork-pin--loading" aria-hidden="true">
                <span className="cork-pin__spinner" />
              </span>
            )}
          </div>
        )}

        {dragOver && <div className="corkboard__droptext">Drop photos to pin them to your future ✦</div>}
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple onChange={pickFiles} style={{ display: "none" }} />

      {formOpen && (
        <VisionBoardForm open={formOpen} onClose={() => setFormOpen(false)} onAdd={addVisionBoardItem} />
      )}

      {genOpen && (
        <VisionImageGenerator onUse={useGeneratedImage} onClose={() => setGenOpen(false)} title="Imagine Your Future" />
      )}

      {meditateOpen && (
        <VisionMeditation images={meditationImages} onClose={() => setMeditateOpen(false)} />
      )}

      {/* ---- Detail card: click a pin to open the full photo + its links ---- */}
      {detail && (
        <div className="vision-lightbox" onClick={closeDetail} role="dialog" aria-modal="true">
          <div className="vision-lightbox__inner cork-detail" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="vision-lightbox__close" onClick={closeDetail} aria-label="Close">
              ✕
            </button>
            {detail.imageUrl ? (
              <img className="vision-lightbox__img" src={detail.imageUrl} alt={detail.title || "Vision"} />
            ) : (
              <div className="vision-lightbox__placeholder" aria-hidden="true">🔭</div>
            )}
            <div className="vision-lightbox__meta">
              {detail.category && <span className="vision-lightbox__cat">{detail.category}</span>}
              {detail.title && <h3 className="vision-lightbox__title">{detail.title}</h3>}
              {detail.caption && <p className="vision-lightbox__caption">{detail.caption}</p>}

              <div className="cork-detail__links">
                <p className="cork-detail__links-label">Pinned to</p>
                <div className="cork-detail__chips">
                  {linkedProjects.length === 0 && (
                    <span className="cork-detail__none">Not tied to a project yet.</span>
                  )}
                  {linkedProjects.map((p) => (
                    <span key={p.id} className="cork-detail__chip">
                      <span>{p.icon}</span> {p.title}
                      <button
                        type="button"
                        className="cork-detail__chip-x"
                        onClick={() => detachVisionFromProject(detail.id, p.id)}
                        aria-label={`Unlink from ${p.title}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  {linkableProjects.length > 0 && (
                    <div className="cork-detail__linkwrap">
                      <button
                        type="button"
                        className="cork-detail__link-btn"
                        onClick={() => setLinkOpen((o) => !o)}
                      >
                        🔗 Link a project
                      </button>
                      {linkOpen && (
                        <div className="cork-detail__menu">
                          {linkableProjects.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              className="cork-detail__menu-item"
                              onClick={() => {
                                attachVisionToProject(detail.id, p.id);
                                setLinkOpen(false);
                              }}
                            >
                              <span>{p.icon}</span>
                              <span>{p.title}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="cork-detail__actions">
                <button
                  type="button"
                  className="cork-detail__delete"
                  onClick={() => removeVision(detail.id)}
                >
                  Remove from board
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

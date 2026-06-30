import React, { useState } from "react";
import { useAppData } from "../../hooks/useAppData.js";
import { useMapQuestState } from "../map-quest/useMapQuestState.js";
import { useShadowWork } from "./useShadowWork.js";
import { XP_VALUES } from "../../lib/gamification.js";
import { Forge, maskCardSrc } from "./shell.jsx";
import ShadowAlchemist from "./ShadowAlchemist.jsx";
import HoldTheLine from "./HoldTheLine.jsx";
import ReframeForge from "./ReframeForge.jsx";
import InnerChild from "./InnerChild.jsx";
import SelfCompassion from "./SelfCompassion.jsx";
import Grounding from "./Grounding.jsx";
import IntegrationTool from "./IntegrationTool.jsx";
import EssenceGallery from "./EssenceGallery.jsx";
import { maskCards } from "../../data/maskCards.js";
import "../../styles/shadow.css";

// Seven moments that knock you off-centre. Shadow Alchemist is the featured
// first responder (full-width hero); the other six fill a clean 2×3 grid.
const TOOLS = [
  { id: "alchemist",  name: "Shadow Alchemist", when: "A mask took the wheel",      relic: "Transmutation Forge", sub: "Name the Survival Mechanism running you — then transmute the mask into its essence.", accent: "#FACC15", featured: true },
  { id: "line",       name: "Hold the Line",    when: "Anger is rising",            relic: "Pressure Crystal",    sub: "Cool the body, name the heat, choose your response.",                    accent: "#FF3B5C" },
  { id: "reframe",    name: "Reframe Forge",    when: "An old belief is loud",      relic: "Belief Flame",        sub: "Melt the old story down and forge a truer one.",                          accent: "#7B2CFF" },
  { id: "inner",      name: "Inner Child",      when: "Something old got triggered", relic: "Safe Harbor",        sub: "Turn toward the younger you — and give them what they needed.",           accent: "#D11EFF" },
  { id: "compassion", name: "Self-Compassion",  when: "Being hard on yourself",     relic: "Warm Light",          sub: "Answer the inner critic with the kindness you'd give a friend.",          accent: "#FF3EDB" },
  { id: "ground",     name: "Grounding",        when: "Overwhelmed / spiralling",   relic: "Anchor Stone",        sub: "5-4-3-2-1 your senses back to solid ground.",                             accent: "#00FFBF" },
  { id: "integrate",  name: "Integration",      when: "Closing the loop",           relic: "Moon Gate",           sub: "Let it sit. Let it move through you. Let it pass.",                        accent: "#00F0FF" },
];
const TOOL_LABEL = Object.fromEntries(TOOLS.map((t) => [t.name, t.accent]));

function timeAgo(ts) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "yesterday" : `${d}d ago`;
}

export default function ShadowWorkPage() {
  const [view, setView] = useState(null); // null=hub | tool id | "gallery"
  const { addXP, unlockAchievement, celebrate } = useAppData();
  const { getBrokeKingShadow } = useMapQuestState();
  const brokeKingShadow = getBrokeKingShadow();
  const { takeaways, essences, streak, recordCompletion, clearTrail } = useShadowWork();

  const finish = (tool, takeaway, opts = {}) => {
    const res = recordCompletion({ tool, takeaway, essence: opts.essence });
    const xp = opts.transmuted ? XP_VALUES.shadowTransmutation : XP_VALUES.shadowToolCompleted;
    addXP(xp, `${tool} complete`);
    if (opts.transmuted) unlockAchievement("shadow_alchemist");
    if (res.newEssence) {
      celebrate({
        variant: "reward",
        title: "ESSENCE RECLAIMED",
        subtitle: opts.essence ? `${opts.essence.name} → ${opts.essence.essence}` : "A shadow turned to gold.",
        detail: "Added to your Essence Gallery.",
      });
    }
    setView(null);
  };

  const close = () => setView(null);

  if (view === "alchemist")  return <ShadowAlchemist onClose={close} onFinish={finish} />;
  if (view === "line")       return <HoldTheLine     onClose={close} onFinish={finish} />;
  if (view === "reframe")    return <ReframeForge    onClose={close} onFinish={finish} />;
  if (view === "inner")      return <InnerChild      onClose={close} onFinish={finish} />;
  if (view === "compassion") return <SelfCompassion  onClose={close} onFinish={finish} />;
  if (view === "ground")     return <Grounding       onClose={close} onFinish={finish} />;
  if (view === "integrate")  return <IntegrationTool onClose={close} onFinish={finish} />;
  if (view === "gallery")    return <EssenceGallery  essences={essences} onClose={close} />;

  return (
    <Hub
      open={setView}
      brokeKingShadow={brokeKingShadow}
      takeaways={takeaways}
      essences={essences}
      streak={streak}
      onClearTrail={clearTrail}
    />
  );
}

function Hub({ open, brokeKingShadow, takeaways = [], essences = [], streak, onClearTrail }) {
  const [hovered, setHovered] = useState(null);
  const featured = TOOLS.find((t) => t.featured);
  const rest = TOOLS.filter((t) => !t.featured);
  const ownedIds = new Set(essences.map((e) => e.maskId));

  const card = (t, i) => {
    const isHovered = hovered === t.id;
    return (
      <button
        key={t.id}
        className={`shadow-tool-card ${t.featured ? "shadow-tool-card--featured" : ""} ${isHovered ? "is-hovered" : ""}`}
        onClick={() => open(t.id)}
        onMouseEnter={() => setHovered(t.id)}
        onMouseLeave={() => setHovered(null)}
        style={{ "--tool-accent": t.accent, "--tool-index": i }}
        aria-label={`Open ${t.name}`}
      >
        <div className="shadow-tool-card__aura" />
        <div className="shadow-tool-card__scan" />
        <div className="shadow-tool-card__topline">
          <span className="shadow-tool-card__moment">{t.when}</span>
          <span className="shadow-tool-card__relic">{t.relic}</span>
        </div>
        <div className="shadow-tool-card__body">
          <h2>{t.name}</h2>
          <p>{t.sub}</p>
        </div>
        <span className="shadow-tool-card__launch">Enter →</span>
      </button>
    );
  };

  return (
    <div className="sx-hub" style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* ── Cinematic head ── */}
      <div className="sx-hub__head">
        <Forge />
        <p className="sx-hub__kicker">Inner Work · The Forge</p>
        <h1 className="sx-hero-title">Shadow Work</h1>
        <p className="sx-hub__sub">
          Seven tools for the moments that knock you off-centre. Meet what&rsquo;s running you, transmute it, and walk back as yourself.
        </p>
        {streak?.current > 0 && (
          <div className="sx-streak">
            <span className="sx-streak__flame">🔥</span>
            <span className="sx-streak__num">{streak.current}</span>
            <span className="sx-streak__label">day inner-work streak</span>
          </div>
        )}
      </div>

      {/* ── Essence Gallery teaser ── */}
      <button className="sx-gallerylink" onClick={() => open("gallery")}>
        <div className="sx-gallerylink__orbs">
          {maskCards.map((m) =>
            ownedIds.has(m.id) ? (
              <img key={m.id} className="sx-gallerylink__orb" src={maskCardSrc(m.id, "essence-card")} alt=""
                onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
            ) : (
              <span key={m.id} className="sx-gallerylink__orb locked">◇</span>
            )
          )}
        </div>
        <div className="sx-gallerylink__txt">
          <div className="sx-gallerylink__title">Essence Gallery</div>
          <div className="sx-gallerylink__sub">{essences.length} of {maskCards.length} shadows turned to gold</div>
        </div>
        <span className="sx-gallerylink__go">OPEN →</span>
      </button>

      {/* ── Map Quest shadow attached ── */}
      {brokeKingShadow && (
        <div style={{
          marginBottom: 24, padding: "14px 18px", borderRadius: 14,
          background: "linear-gradient(135deg, rgba(255,201,77,0.1), rgba(123,44,255,0.1))",
          border: "1px solid rgba(255,201,77,0.4)", boxShadow: "0 0 20px rgba(255,201,77,0.1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 28 }}>👑</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#FFC94D", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 3 }}>
                MAP QUEST · SHADOW ATTACHED
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--text-main)" }}>
                The Broke King walks with you
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3, lineHeight: 1.4 }}>
                Open the <b>Shadow Alchemist</b> when you feel money panic, shame spirals, or the sense of being behind.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tool grid: featured + 2×3 ── */}
      <div className="shadow-tool-grid" aria-label="Shadow work tools">
        {featured && card(featured, 0)}
        {rest.map((t, i) => card(t, i + 1))}
      </div>

      {/* ── The trail ── */}
      <div className="shadow-trail">
        <div className="shadow-trail__head">
          <span className="shadow-trail__title">Your trail</span>
          {takeaways.length > 0 && <button className="shadow-trail__clear" onClick={onClearTrail}>Clear</button>}
        </div>
        {takeaways.length === 0 ? (
          <p className="shadow-trail__empty">Each tool leaves a stamp here — your reflections gather into a trail you can look back on.</p>
        ) : (
          <ul className="shadow-trail__list">
            {takeaways.slice(0, 6).map((row, i) => (
              <li key={row.at ?? i} className="shadow-trail__row" style={{ "--row-accent": TOOL_LABEL[row.tool] || "var(--brand-cyan)" }}>
                <span className="shadow-trail__dot" />
                <div className="shadow-trail__main">
                  <div className="shadow-trail__meta">
                    <span className="shadow-trail__tool">{row.tool}</span>
                    <span className="shadow-trail__time">{row.at ? timeAgo(row.at) : ""}</span>
                  </div>
                  <p className="shadow-trail__text">{row.takeaway}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

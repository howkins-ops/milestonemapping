import React, { useEffect, useMemo, useState } from "react";
import { useGamification } from "../../hooks/useGamification.js";
import { useAppData } from "../../hooks/useAppData.js";
import { RANKS } from "../../lib/gamification.js";
import { ACHIEVEMENTS } from "../../lib/achievements.js";
import { PHOENIX_STAGES } from "../../lib/zoneFire.js";
import { deriveTitles } from "./cityTitles.js";
import "../../styles/cityCitizen.css";

// ════════════════════════════════════════════════════════════════════════
// MILESTONE CITY — Citizen Card
// The player's holo identity card: avatar, name, earned titles, rank sigil,
// XP progress and cross-feature stat chips. Renders safely for a fresh
// offline user (social = null, progress = null, profile = null).
// ════════════════════════════════════════════════════════════════════════

// One neon per rank position — ascending heat toward Legend gold.
const RANK_TINTS = [
  "#00F0FF", // Starter
  "#00FFBF", // Builder
  "#7B2CFF", // Operator
  "#D11EFF", // Warrior
  "#FF3EDB", // Architect
  "#FFB000", // Empire Builder
  "#FACC15", // Legend
];

// Inline SVG diamond crest, tinted by rank position via `tint`.
function RankSigil({ tint }) {
  return (
    <svg
      className="mqc-cc-sigil"
      viewBox="0 0 48 48"
      width="44"
      height="44"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M24 3 L45 24 L24 45 L3 24 Z"
        fill="none"
        stroke={tint}
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <path d="M24 10.5 L37.5 24 L24 37.5 L10.5 24 Z" fill={tint} opacity="0.14" />
      <path
        d="M24 10.5 L37.5 24 L24 37.5 L10.5 24 Z"
        fill="none"
        stroke={tint}
        strokeWidth="1.3"
        strokeLinejoin="round"
        opacity="0.6"
      />
      <path d="M24 17 L31 24 L24 31 L17 24 Z" fill={tint} opacity="0.9" />
      <path
        d="M24 3 v7.5 M45 24 h-7.5 M24 45 v-7.5 M3 24 h7.5"
        stroke={tint}
        strokeWidth="1.2"
        opacity="0.45"
      />
    </svg>
  );
}

export default function CitizenCard({ social, progress }) {
  const { xp, rank, nextRank, progress: xpProgress } = useGamification();
  const { profile } = useAppData();

  // ── Social layer (online only) ──────────────────────────────────────────
  const member = social && social.online && social.member ? social.member : null;
  const online = !!member;
  const fire = online && social.fire ? social.fire : null;
  const phoenix = online && social.phoenix ? social.phoenix : null;

  const phoenixIndex = useMemo(() => {
    if (!phoenix) return -1;
    const byKey = PHOENIX_STAGES.findIndex((s) => s.key === phoenix.key);
    if (byKey >= 0) return byKey;
    return PHOENIX_STAGES.findIndex((s) => s.label === phoenix.label);
  }, [phoenix]);

  // ── Progress ctx (all null-tolerant) ────────────────────────────────────
  const quest = (progress && progress.quest) || null;
  const shadow = (progress && progress.shadow) || null;
  const forge = (progress && progress.forge) || null;
  const dailyStreak = Math.max(0, Number(progress && progress.dailyStreakLocal) || 0);
  const achievementsCount = Math.max(
    0,
    Number(progress && progress.achievementsCount) || 0
  );
  const questTotal = Math.max(1, Number(quest && quest.total) || 20);
  const questActive = Math.min(
    questTotal,
    Math.max(1, Number(quest && quest.activeChapter) || 1)
  );

  // ── Identity ────────────────────────────────────────────────────────────
  const name =
    (member && member.display_name) ||
    (profile && (profile.display_name || profile.full_name)) ||
    "Seeker";
  const username = (online && member.username) || "";
  const avatarUrl =
    (member && member.avatar_url) || (profile && profile.avatar_url) || "";
  const monogram = String(name).trim().slice(0, 1).toUpperCase() || "S";

  const [avatarOk, setAvatarOk] = useState(true);
  useEffect(() => {
    setAvatarOk(true);
  }, [avatarUrl]);
  const showAvatarImg = !!avatarUrl && avatarOk;

  // ── Titles ──────────────────────────────────────────────────────────────
  const titles = useMemo(
    () =>
      deriveTitles({
        rankName: rank ? rank.name : null,
        identityTitle: member ? member.identity_title : null,
        phoenixStageLabel: phoenix ? phoenix.label : null,
        phoenixStageIndex: phoenixIndex,
        essences: shadow ? shadow.essences : null,
        questCompleted: quest ? quest.completed : null,
        totalForged: forge ? forge.totalForged : null,
        shadowStreak: shadow ? shadow.streak : null,
        achievementsCount,
      }),
    [rank, member, phoenix, phoenixIndex, shadow, quest, forge, achievementsCount]
  );
  const primaryTitle = titles.length > 0 ? titles[0] : null;
  const titleChips = titles.slice(1, 4);

  // ── Rank + XP ───────────────────────────────────────────────────────────
  const safeRank = rank || RANKS[0];
  const rankIndex = Math.max(0, RANKS.findIndex((r) => r.name === safeRank.name));
  const rankTint = RANK_TINTS[rankIndex] || RANK_TINTS[0];
  const xpp = xpProgress || { percent: 0, earned: 0, needed: 0 };
  const isMaxRank = !nextRank;
  const percent = isMaxRank ? 100 : Math.max(0, Math.min(100, Number(xpp.percent) || 0));
  const xpLabel = isMaxRank
    ? "MAX"
    : `${Math.max(0, Number(xpp.earned) || 0)} / ${Math.max(0, Number(xpp.needed) || 0)} to ${nextRank.name}`;
  const xpTotal = Math.max(0, Number(xp) || 0);

  return (
    <section className="mqc-panel mqc-cc" aria-label={`Citizen card for ${name}`}>
      <span className="mqc-cc-edge" aria-hidden="true" />
      <span className="mqc-cc-shimmer" aria-hidden="true" />

      {/* ── Head: avatar + identity ─────────────────────────────────────── */}
      <header className="mqc-cc-head">
        <div className="mqc-cc-avatar">
          {showAvatarImg ? (
            <img
              className="mqc-cc-avatar__img"
              src={avatarUrl}
              alt=""
              onError={() => setAvatarOk(false)}
            />
          ) : (
            <span className="mqc-cc-avatar__mono" aria-hidden="true">
              {monogram}
            </span>
          )}
          <span className="mqc-cc-avatar__ring" aria-hidden="true" />
        </div>

        <div className="mqc-cc-id">
          <h3 className="mqc-cc-name">{name}</h3>
          {username ? <p className="mqc-cc-user">@{username}</p> : null}
          {primaryTitle ? (
            <p className="mqc-cc-ribbon">
              <span className="mqc-cc-ribbon__txt">{primaryTitle.label}</span>
            </p>
          ) : null}
        </div>
      </header>

      {/* ── Secondary earned titles ─────────────────────────────────────── */}
      {titleChips.length > 0 ? (
        <ul className="mqc-cc-titles" role="list" aria-label="Earned titles">
          {titleChips.map((t) => (
            <li key={t.id} className="mqc-cc-title">
              {t.label}
            </li>
          ))}
        </ul>
      ) : null}

      {/* ── Rank sigil + XP ─────────────────────────────────────────────── */}
      <div className="mqc-cc-rank">
        <span className="mqc-cc-sigilwrap" style={{ color: rankTint }}>
          <RankSigil tint={rankTint} />
        </span>
        <div className="mqc-cc-rank__txt">
          <div className="mqc-cc-rank__row">
            <span className="mqc-cc-rank__name" style={{ color: rankTint }}>
              {safeRank.name}
            </span>
            <span className="mqc-cc-rank__xp">{xpTotal.toLocaleString()} XP</span>
          </div>
          <div
            className="mqc-cc-xpbar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label={isMaxRank ? "Max rank reached" : `XP progress: ${xpLabel}`}
          >
            <span className="mqc-cc-xpbar__fill" style={{ width: `${percent}%` }} />
          </div>
          <p className="mqc-cc-xplabel">{xpLabel}</p>
        </div>
      </div>

      {/* ── Stat chips ──────────────────────────────────────────────────── */}
      <ul className="mqc-cc-stats" role="list" aria-label="Citizen stats">
        <li className="mqc-cc-chip" aria-label={`Daily streak: ${dailyStreak} days`}>
          <span className="mqc-cc-chip__icon" aria-hidden="true">
            🔥
          </span>
          <span className="mqc-cc-chip__val">{dailyStreak}</span>
          <span className="mqc-cc-chip__lbl">day streak</span>
        </li>

        {online && fire && fire.label ? (
          <li
            className="mqc-cc-chip mqc-cc-chip--fire"
            style={{ color: fire.tint || "#FFB000" }}
            aria-label={`Zone fire: ${fire.label}`}
          >
            <span className="mqc-cc-chip__dot" aria-hidden="true" />
            <span className="mqc-cc-chip__val">{fire.label}</span>
            <span className="mqc-cc-chip__lbl">zone fire</span>
          </li>
        ) : null}

        <li
          className="mqc-cc-chip"
          aria-label={`Achievements: ${achievementsCount} of ${ACHIEVEMENTS.length}`}
        >
          <span className="mqc-cc-chip__icon" aria-hidden="true">
            🏆
          </span>
          <span className="mqc-cc-chip__val">
            {achievementsCount}/{ACHIEVEMENTS.length}
          </span>
          <span className="mqc-cc-chip__lbl">achievements</span>
        </li>

        <li
          className="mqc-cc-chip"
          aria-label={`Quest: chapter ${questActive} of ${questTotal}`}
        >
          <span className="mqc-cc-chip__icon mqc-cc-chip__icon--glyph" aria-hidden="true">
            ◈
          </span>
          <span className="mqc-cc-chip__val">
            Ch {questActive}/{questTotal}
          </span>
          <span className="mqc-cc-chip__lbl">quest</span>
        </li>

        {online && phoenix && phoenixIndex >= 1 ? (
          <li
            className="mqc-cc-chip mqc-cc-chip--phoenix"
            aria-label={`Phoenix stage: ${phoenix.label}`}
          >
            <span className="mqc-cc-chip__icon" aria-hidden="true">
              {phoenix.icon || "🔥"}
            </span>
            <span className="mqc-cc-chip__val">{phoenix.label}</span>
            <span className="mqc-cc-chip__lbl">phoenix</span>
          </li>
        ) : null}
      </ul>
    </section>
  );
}

import React from "react";

// ════════════════════════════════════════════════════════════════════════
// MASK ENCOUNTERS — the boss rigs (dark + EVOLVED forms)
// Dark rigs ported 1:1 from name-the-critic-2.html; evolved rigs are the
// §5.4 payoff — same silhouette family, upright, uncracked, radiant. Both
// share the b-body / b-shade / b-glow / b-glow-s / crack class system so
// phase cracks, allied recolor and the essence tint stay pure CSS:
//   .mqk-* scope colors b-glow via --mqk-bglow; evolved rigs carry
//   .mqk-rig-evolved so their glow tints to --evolved-glow (the essence
//   the player returned).
// Silhouette-first — every evolved rig stays within ~20 paths.
// ════════════════════════════════════════════════════════════════════════

/* ── dark rigs (verbatim ports) ─────────────────────────────────────────── */

function KingDark() {
  return (
    <svg viewBox="0 0 200 260" aria-hidden="true">
      <path className="b-shade" d="M100 40 C64 40 48 74 48 116 L40 236 Q100 258 160 236 L152 116 C152 74 136 40 100 40 Z" />
      <path className="b-body" d="M100 48 C70 48 56 78 56 116 L50 228 Q100 246 150 228 L144 116 C144 78 130 48 100 48 Z" />
      <path className="b-shade" d="M100 54 C80 54 70 72 70 92 Q100 106 130 92 C130 72 120 54 100 54 Z" />
      <path className="b-glow" d="M62 44 L74 18 L86 38 L100 12 L114 38 L126 18 L138 44 Q100 58 62 44 Z" transform="rotate(-9 100 30)" />
      <path className="b-glow" d="M84 80 L96 78 L94 86 L86 86 Z" />
      <path className="b-glow" d="M104 78 L116 80 L114 86 L106 86 Z" />
      <path className="b-shade" d="M148 118 L176 150 L168 158 L142 132 Z" />
      <path className="b-glow-s" strokeWidth="1.6" opacity=".6" d="M64 140 Q100 152 136 140 M70 178 Q100 188 130 178" />
      <path className="b-shade" d="M44 120 L28 200 L44 196 Z" />
      <path className="crack c1" d="M74 108 L86 134 L76 156" />
      <path className="crack c2" d="M126 116 L114 144 L126 168" />
      <path className="crack c3" d="M96 184 L106 208 L94 230" />
    </svg>
  );
}

function SaintDark() {
  return (
    <svg viewBox="0 0 200 260" aria-hidden="true">
      <ellipse className="b-glow-s" cx="100" cy="26" rx="34" ry="10" strokeWidth="4" opacity=".85" strokeDasharray="14 9" />
      <path className="b-shade" d="M100 34 C62 34 46 70 46 112 L40 238 Q100 258 160 238 L154 112 C154 70 138 34 100 34 Z" />
      <path className="b-body" d="M100 42 C70 42 56 72 56 112 L52 230 Q100 246 148 230 L144 112 C144 72 130 42 100 42 Z" />
      <path className="b-shade" d="M100 48 C80 48 70 66 70 88 Q100 102 130 88 C130 66 120 48 100 48 Z" />
      <path className="b-glow" d="M84 74 L94 72 L92 80 L86 80 Z" />
      <path className="b-glow" d="M106 72 L116 74 L114 80 L108 80 Z" />
      <path className="b-shade" d="M56 120 Q40 150 52 182 L64 176 Q56 150 66 128 Z" />
      <path className="b-shade" d="M144 120 Q166 152 152 190 L140 182 Q150 152 136 128 Z" />
      <circle className="b-glow" cx="156" cy="196" r="9" opacity=".8" />
      <path className="b-glow-s" strokeWidth="1.4" opacity=".5" d="M78 108 Q100 116 122 108" />
      <path className="crack c1" d="M76 104 L88 130 L78 152" />
      <path className="crack c2" d="M124 112 L112 140 L124 162" />
      <path className="crack c3" d="M96 180 L106 204 L94 228" />
    </svg>
  );
}

function ProphetDark() {
  return (
    <svg viewBox="0 0 200 260" aria-hidden="true">
      <path className="b-shade" d="M100 16 C62 16 46 54 46 98 L38 236 Q100 258 162 236 L154 98 C154 54 138 16 100 16 Z" />
      <path className="b-body" d="M100 24 C68 24 54 58 54 98 L48 228 Q100 246 152 228 L146 98 C146 58 132 24 100 24 Z" />
      <path className="b-shade" d="M100 30 C78 30 66 52 66 78 Q100 94 134 78 C134 52 122 30 100 30 Z" />
      <ellipse className="b-glow" cx="85" cy="62" rx="6.5" ry="8" />
      <ellipse className="b-glow" cx="115" cy="62" rx="6.5" ry="8" />
      <path className="b-glow-s" strokeWidth="3" d="M88 86 L112 86" opacity=".9" />
      <path className="b-glow-s" strokeWidth="2" d="M96 80 L104 92 M104 80 L96 92" opacity=".9" />
      <rect className="b-shade" x="120" y="130" width="44" height="56" rx="4" transform="rotate(10 142 158)" />
      <rect className="b-glow" x="125" y="138" width="34" height="3" opacity=".85" transform="rotate(10 142 158)" />
      <rect className="b-glow" x="125" y="147" width="26" height="2.4" opacity=".6" transform="rotate(10 142 158)" />
      <rect className="b-glow" x="125" y="156" width="30" height="2.4" opacity=".6" transform="rotate(10 142 158)" />
      <path className="crack c1" d="M72 106 L84 132 L74 154" />
      <path className="crack c2" d="M128 98 L116 126 L128 150" />
      <path className="crack c3" d="M96 178 L106 202 L94 226" />
    </svg>
  );
}

function VictimDark() {
  return (
    <svg viewBox="0 0 200 260" aria-hidden="true">
      <path className="b-shade" d="M100 46 C52 46 30 88 34 138 L30 240 Q100 260 170 240 L166 138 C170 88 148 46 100 46 Z" />
      <path className="b-body" d="M100 54 C60 54 40 92 44 138 L42 232 Q100 250 158 232 L156 138 C160 92 140 54 100 54 Z" />
      <path className="b-shade" d="M100 40 C82 40 72 56 74 76 Q100 90 126 76 C128 56 118 40 100 40 Z" />
      <path className="b-glow" d="M80 62 L94 66 L90 74 L82 71 Z" />
      <path className="b-glow" d="M106 66 L120 62 L118 71 L110 74 Z" />
      <path className="b-shade" d="M44 130 Q20 160 30 196 L52 188 Q44 162 58 140 Z" />
      <path className="b-shade" d="M156 130 Q182 160 172 198 L150 190 Q158 162 144 140 Z" />
      <circle className="b-shade" cx="38" cy="200" r="16" />
      <circle className="b-shade" cx="164" cy="202" r="16" />
      <path className="b-glow-s" strokeWidth="2" opacity=".7" d="M84 86 Q100 80 116 86" />
      <path className="crack c1" d="M70 110 L84 138 L72 162" />
      <path className="crack c2" d="M132 104 L118 134 L132 158" />
      <path className="crack c3" d="M96 184 L108 208 L94 232" />
    </svg>
  );
}

function WarriorDark() {
  return (
    <svg viewBox="0 0 200 260" aria-hidden="true">
      <path className="b-shade" d="M100 34 C66 34 50 68 50 110 L42 238 Q100 258 158 238 L150 110 C150 68 134 34 100 34 Z" />
      <path className="b-body" d="M100 42 C72 42 58 72 58 110 L52 230 Q100 246 148 230 L142 110 C142 72 128 42 100 42 Z" />
      <path className="b-shade" d="M100 28 C82 28 72 44 72 66 L72 74 Q100 88 128 74 L128 66 C128 44 118 28 100 28 Z" />
      <path className="b-shade" d="M68 46 L132 46 L128 34 L72 34 Z" />
      <path className="b-glow" d="M82 62 L94 60 L92 68 L84 68 Z" />
      <path className="b-glow" d="M106 60 L118 62 L116 68 L108 68 Z" />
      <path className="b-body" d="M144 100 L182 46 L190 54 L152 110 Z" />
      <path className="b-glow-s" strokeWidth="2.4" d="M176 40 L196 62" opacity=".85" />
      <path className="b-glow-s" strokeWidth="1.6" opacity=".6" d="M64 130 Q100 142 136 130 M68 168 Q100 178 132 168" />
      <path className="b-shade" d="M54 118 Q34 140 40 172 L54 166 Q50 142 62 128 Z" />
      <path className="crack c1" d="M74 104 L86 132 L76 156" />
      <path className="crack c2" d="M126 110 L114 140 L126 164" />
      <path className="crack c3" d="M96 182 L106 206 L94 230" />
    </svg>
  );
}

/* ── evolved rigs (§5.4 — the untrained protector, trained) ─────────────── */

// THE SOVEREIGN — true radiant crown, scepter raised, posture unbent.
function KingEvolved() {
  return (
    <svg viewBox="0 0 200 260" aria-hidden="true" className="mqk-rig-evolved">
      <path className="b-shade" d="M100 40 C64 40 48 74 48 116 L44 236 Q100 258 156 236 L152 116 C152 74 136 40 100 40 Z" />
      <path className="b-body" d="M100 48 C70 48 56 78 56 116 L52 228 Q100 246 148 228 L144 116 C144 78 130 48 100 48 Z" />
      <path className="b-shade" d="M100 54 C80 54 70 72 70 92 Q100 106 130 92 C130 72 120 54 100 54 Z" />
      <path className="b-glow" d="M64 42 L74 12 L86 34 L100 6 L114 34 L126 12 L136 42 Q100 56 64 42 Z" />
      <circle className="b-glow" cx="100" cy="14" r="4" />
      <path className="b-glow" d="M84 78 L96 78 L94 86 L86 86 Z" />
      <path className="b-glow" d="M104 78 L116 78 L114 86 L106 86 Z" />
      <rect className="b-shade" x="158" y="80" width="8" height="120" rx="4" />
      <circle className="b-glow" cx="162" cy="72" r="11" />
      <path className="b-glow-s" strokeWidth="2.4" opacity=".95" d="M60 138 Q100 152 140 138" />
      <path className="b-glow-s" strokeWidth="2.4" opacity=".95" d="M64 178 Q100 190 136 178" />
      <path className="b-glow-s" strokeWidth="1.6" opacity=".7" d="M68 214 Q100 224 132 214" />
      <path className="b-shade" d="M42 120 Q30 156 40 192 L52 186 Q46 154 56 130 Z" />
    </svg>
  );
}

// THE UNSHAKEN SAINT — solid steady halo, the hidden hand open and EMPTY.
function SaintEvolved() {
  return (
    <svg viewBox="0 0 200 260" aria-hidden="true" className="mqk-rig-evolved">
      <ellipse className="b-glow-s" cx="100" cy="22" rx="34" ry="10" strokeWidth="4" opacity=".95" />
      <path className="b-shade" d="M100 34 C62 34 46 70 46 112 L42 238 Q100 258 158 238 L154 112 C154 70 138 34 100 34 Z" />
      <path className="b-body" d="M100 42 C70 42 56 72 56 112 L52 230 Q100 246 148 230 L144 112 C144 72 130 42 100 42 Z" />
      <path className="b-shade" d="M100 48 C80 48 70 66 70 88 Q100 102 130 88 C130 66 120 48 100 48 Z" />
      <path className="b-glow" d="M84 72 L94 72 L92 80 L86 80 Z" />
      <path className="b-glow" d="M106 72 L116 72 L114 80 L108 80 Z" />
      <path className="b-glow-s" strokeWidth="1.6" opacity=".7" d="M84 92 Q100 98 116 92" />
      <path className="b-shade" d="M56 118 Q34 146 44 182 L58 176 Q50 148 66 126 Z" />
      <path className="b-shade" d="M144 118 Q166 146 156 182 L142 176 Q150 148 134 126 Z" />
      <circle className="b-glow-s" cx="48" cy="192" r="10" strokeWidth="2.4" opacity=".9" />
      <circle className="b-glow-s" cx="152" cy="192" r="10" strokeWidth="2.4" opacity=".9" />
      <path className="b-shade" d="M74 236 L92 236 L92 246 L74 246 Z" />
      <path className="b-shade" d="M108 236 L126 236 L126 246 L108 246 Z" />
      <path className="b-glow-s" strokeWidth="1.4" opacity=".55" d="M78 130 Q100 138 122 130" />
    </svg>
  );
}

// THE HERALD — mouth unstitched to glow, scroll blazing and held HIGH.
function ProphetEvolved() {
  return (
    <svg viewBox="0 0 200 260" aria-hidden="true" className="mqk-rig-evolved">
      <path className="b-shade" d="M100 16 C62 16 46 54 46 98 L40 236 Q100 258 160 236 L154 98 C154 54 138 16 100 16 Z" />
      <path className="b-body" d="M100 24 C68 24 54 58 54 98 L50 228 Q100 246 150 228 L146 98 C146 58 132 24 100 24 Z" />
      <path className="b-shade" d="M100 30 C78 30 66 52 66 78 Q100 94 134 78 C134 52 122 30 100 30 Z" />
      <ellipse className="b-glow" cx="85" cy="60" rx="6.5" ry="8" />
      <ellipse className="b-glow" cx="115" cy="60" rx="6.5" ry="8" />
      <ellipse className="b-glow" cx="100" cy="86" rx="12" ry="5" opacity=".95" />
      <path className="b-shade" d="M138 110 Q158 84 152 58 L140 64 Q146 86 130 104 Z" />
      <rect className="b-shade" x="128" y="18" width="46" height="58" rx="4" transform="rotate(-8 151 47)" />
      <rect className="b-glow" x="134" y="28" width="34" height="3.4" opacity=".95" transform="rotate(-8 151 47)" />
      <rect className="b-glow" x="134" y="38" width="28" height="2.6" opacity=".8" transform="rotate(-8 151 47)" />
      <rect className="b-glow" x="134" y="48" width="32" height="2.6" opacity=".8" transform="rotate(-8 151 47)" />
      <path className="b-glow-s" strokeWidth="2" opacity=".85" d="M178 20 L190 8 M182 40 L196 36 M172 8 L176 -2" />
      <path className="b-glow-s" strokeWidth="1.6" opacity=".6" d="M64 130 Q100 142 136 130" />
    </svg>
  );
}

// THE GUARDIAN — calm upright giant, fists opened into guarding palms.
function VictimEvolved() {
  return (
    <svg viewBox="0 0 200 260" aria-hidden="true" className="mqk-rig-evolved">
      <path className="b-shade" d="M100 34 C56 34 38 78 40 130 L36 240 Q100 260 164 240 L160 130 C162 78 144 34 100 34 Z" />
      <path className="b-body" d="M100 42 C64 42 46 84 48 130 L46 232 Q100 250 154 232 L152 130 C154 84 136 42 100 42 Z" />
      <path className="b-shade" d="M100 30 C82 30 72 46 74 66 Q100 80 126 66 C128 46 118 30 100 30 Z" />
      <path className="b-glow" d="M82 54 L94 56 L92 64 L84 62 Z" />
      <path className="b-glow" d="M106 56 L118 54 L116 62 L108 64 Z" />
      <path className="b-glow-s" strokeWidth="2" opacity=".8" d="M86 74 Q100 80 114 74" />
      <path className="b-shade" d="M48 120 Q28 148 34 186 L50 180 Q44 152 58 130 Z" />
      <path className="b-shade" d="M152 120 Q172 148 166 186 L150 180 Q156 152 142 130 Z" />
      <ellipse className="b-body" cx="42" cy="196" rx="13" ry="16" />
      <ellipse className="b-body" cx="158" cy="196" rx="13" ry="16" />
      <path className="b-glow-s" strokeWidth="2" opacity=".85" d="M34 188 L34 204 M42 184 L42 206 M50 188 L50 204" />
      <path className="b-glow-s" strokeWidth="2" opacity=".85" d="M150 188 L150 204 M158 184 L158 206 M166 188 L166 204" />
      <path className="b-glow-s" strokeWidth="2" opacity=".8" d="M70 118 Q100 128 130 118" />
    </svg>
  );
}

// THE COMMANDER — true blade SHEATHED, glowing plan in the off-hand, visor up.
function WarriorEvolved() {
  return (
    <svg viewBox="0 0 200 260" aria-hidden="true" className="mqk-rig-evolved">
      <path className="b-shade" d="M100 34 C66 34 50 68 50 110 L46 238 Q100 258 154 238 L150 110 C150 68 134 34 100 34 Z" />
      <path className="b-body" d="M100 42 C72 42 58 72 58 110 L54 230 Q100 246 146 230 L142 110 C142 72 128 42 100 42 Z" />
      <path className="b-shade" d="M100 26 C82 26 72 42 72 64 L72 74 Q100 88 128 74 L128 64 C128 42 118 26 100 26 Z" />
      <path className="b-glow-s" strokeWidth="3" opacity=".9" d="M74 40 Q100 30 126 40" />
      <path className="b-glow" d="M82 58 L96 58 L94 68 L84 68 Z" />
      <path className="b-glow" d="M104 58 L118 58 L116 68 L106 68 Z" />
      <path className="b-shade" d="M140 150 L166 210 L156 216 L132 158 Z" />
      <path className="b-glow-s" strokeWidth="2" opacity=".8" d="M136 150 L148 146" />
      <rect className="b-glow" x="30" y="140" width="34" height="26" rx="3" opacity=".9" transform="rotate(-8 47 153)" />
      <path className="b-glow-s" strokeWidth="1.4" opacity=".9" d="M36 148 L58 144 M38 156 L56 153" />
      <path className="b-shade" d="M56 116 Q40 134 42 162 L54 158 Q52 138 64 126 Z" />
      <path className="b-glow-s" strokeWidth="2" opacity=".9" d="M64 128 Q100 140 136 128" />
      <path className="b-glow-s" strokeWidth="1.6" opacity=".7" d="M68 168 Q100 178 132 168" />
    </svg>
  );
}

const RIGS = {
  "broke-king": { dark: KingDark, evolved: KingEvolved },
  "addict-saint": { dark: SaintDark, evolved: SaintEvolved },
  "silent-prophet": { dark: ProphetDark, evolved: ProphetEvolved },
  "raging-victim": { dark: VictimDark, evolved: VictimEvolved },
  "naive-warrior": { dark: WarriorDark, evolved: WarriorEvolved },
};

export default function MaskSprite({ kind, evolved = false }) {
  const rig = RIGS[kind];
  if (!rig) return null;
  const Rig = evolved ? rig.evolved : rig.dark;
  return <Rig />;
}

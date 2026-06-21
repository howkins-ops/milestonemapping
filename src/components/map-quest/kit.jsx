import React, { useState, useEffect, useRef } from "react";

/* =============================================================================
   MILESTONE QUEST — SHARED CINEMATIC KIT
   Extracted from ChapterShadow / ChapterAnchor so every new chapter is built in
   the same "badass SVG + animation" style with minimal copy-paste. A chapter
   file becomes mostly story DATA + scene composition on top of these primitives.
   ============================================================================= */

/* ---- tokens -------------------------------------------------------------- */
export const C = {
  black:"#000000", night:"#04020b", forest:"#04100b", card:"#0b0712", cardDeep:"#080510",
  phoenix:"#7B2CFF", magenta:"#D11EFF", hotPink:"#FF3EDB", cyan:"#00F0FF", mint:"#00FFBF",
  gold:"#FFC94D", amber:"#FFA94D", text:"#F2F0F4", textDim:"#9a8fb0", locked:"#3a3450",
  danger:"#FF5470", leaf:"#1f7a4d", power:"#5b8def",
};
export const hexA = (h, a) => {
  const x = h.replace("#", "");
  return `rgba(${parseInt(x.slice(0,2),16)},${parseInt(x.slice(2,4),16)},${parseInt(x.slice(4,6),16)},${a})`;
};
export const mono = { fontFamily:"'JetBrains Mono', monospace" };
export const serif = { fontFamily:"'Fraunces', serif" };
export const fsWrap = (bg) => ({ position:"relative", minHeight:"100vh", background:bg, overflow:"hidden" });

/* ---- carry-forward: read another chapter's own localStorage save --------- */
export function readChapterSave(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}") || {}; } catch { return {}; }
}
/* echo a client's own words, with a graceful fallback if empty */
export const echo = (v, fb) => (v && String(v).trim() ? String(v).trim() : fb);

/* ---- the keyframes every chapter shares (inject once via <ChapterFrame>) -- */
export const KEYFRAMES = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,600;9..144,0,700;9..144,1,500&family=Inter+Tight:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap');
@keyframes sFade{from{opacity:0}to{opacity:1}}
@keyframes sRise{0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)}}
@keyframes sIdle{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes sSlump{0%,100%{transform:translateY(2px)}50%{transform:translateY(5px)}}
@keyframes sPulse{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.06);opacity:1}}
@keyframes sEmber{0%{opacity:0;transform:translateY(0) scale(1)}20%{opacity:.9}100%{opacity:0;transform:translateY(-80px) scale(.4)}}
@keyframes sShard{0%{opacity:0;transform:translateY(10px) scale(.8)}15%{opacity:.85}70%{opacity:.5}100%{opacity:0;transform:translateY(-120px) scale(1.1)}}
@keyframes sTwinkle{0%,100%{opacity:.2}50%{opacity:.7}}
@keyframes sBurst{0%{opacity:0;transform:scale(.4)}40%{opacity:1}100%{opacity:0;transform:scale(2.4)}}
@keyframes sRiseGlow{0%{opacity:0;transform:translateY(20px) scale(.9)}100%{opacity:1;transform:translateY(0) scale(1)}}
`;

/* wraps a chapter, injecting fonts + keyframes + base styling once */
export function ChapterFrame({ children }) {
  return (
    <div style={{ minHeight:"100vh", background:C.black, color:C.text, fontFamily:"'Inter Tight', system-ui, sans-serif" }}>
      <style>{`${KEYFRAMES}
        *{-webkit-tap-highlight-color:transparent}
        button,textarea,input{font-family:inherit}
        textarea::placeholder,input::placeholder{color:${C.locked}}
        @media (prefers-reduced-motion: reduce){*{animation:none!important}}
      `}</style>
      {children}
    </div>
  );
}

/* ---- buttons / inputs ---------------------------------------------------- */
export function Btn({ children, onClick, disabled, accent=C.magenta, ghost, full, small }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width:full?"100%":"auto", padding:small?"8px 14px":"13px 22px", borderRadius:12, ...mono,
      fontSize:small?12:14, fontWeight:700, letterSpacing:.5, textTransform:"uppercase",
      cursor:disabled?"not-allowed":"pointer", color:disabled?C.textDim:ghost?accent:"#04020b",
      background:disabled?"rgba(255,255,255,.04)":ghost?"transparent":`linear-gradient(135deg, ${accent}, ${C.hotPink})`,
      border:ghost?`1px solid ${hexA(accent,.5)}`:"none",
      boxShadow:disabled||ghost?"none":`0 0 18px ${hexA(accent,.5)}`, opacity:disabled?.55:1, transition:"transform .12s",
    }}
      onMouseDown={e=>!disabled&&(e.currentTarget.style.transform="scale(.96)")}
      onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
      onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>{children}</button>
  );
}
export const choiceBtn = (c=C.amber) => ({
  textAlign:"left", padding:"14px 16px", borderRadius:14, border:`1px solid ${hexA(c,.4)}`,
  background:`linear-gradient(160deg, ${C.card}, ${C.cardDeep})`, color:C.text, cursor:"pointer",
  fontSize:14, fontFamily:"'Inter Tight', sans-serif", width:"100%",
});
export const taStyle = (c=C.gold) => ({
  width:"100%", boxSizing:"border-box", padding:"12px 14px", borderRadius:12,
  background:"rgba(255,255,255,.04)", border:`1px solid ${hexA(c,.4)}`, color:C.text, fontSize:15,
  fontFamily:"'Inter Tight', sans-serif", outline:"none", resize:"none", minHeight:64,
});
export const holdBtn = (c) => ({
  marginTop:8, padding:"15px 28px", borderRadius:999, border:`1.5px solid ${c}`,
  background:`linear-gradient(135deg, ${hexA(c,.2)}, ${hexA(C.phoenix,.1)})`, color:C.text, ...mono,
  fontSize:14, fontWeight:700, letterSpacing:1, cursor:"pointer", boxShadow:`0 0 20px ${hexA(c,.4)}`, userSelect:"none",
});
export function Track({ v, a, b }) {
  return (
    <div style={{ marginTop:14, height:4, maxWidth:240, margin:"14px auto 0", borderRadius:999, background:"rgba(255,255,255,.06)", overflow:"hidden" }}>
      <div style={{ width:`${v*100}%`, height:"100%", background:`linear-gradient(90deg, ${a}, ${b})`, transition:"width .1s" }} />
    </div>
  );
}
export function Row({ label, value, accent=C.phoenix }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"9px 0", borderBottom:`1px solid ${hexA(accent,.12)}` }}>
      <span style={{ fontSize:10, ...mono, color:C.textDim, textTransform:"uppercase" }}>{label}</span>
      <span style={{ fontSize:12, color:C.text, textAlign:"right", maxWidth:"58%" }}>{value}</span>
    </div>
  );
}
/* shows the client's own answers back to them — the "answer-fill" payoff */
export function AnswerJournal({ title="WHAT YOU FORGED", entries, accent=C.gold }) {
  const list = entries.filter(e => e && e.a && String(e.a).trim());
  if (!list.length) return null;
  return (
    <div style={{ marginTop:14, padding:16, borderRadius:16, background:`linear-gradient(160deg, ${C.card}, ${C.cardDeep})`, border:`1px solid ${hexA(accent,.3)}` }}>
      <div style={{ fontSize:10, ...mono, color:accent, marginBottom:10 }}>{title}</div>
      {list.map((r,i)=>(
        <div key={i} style={{ marginBottom:10 }}>
          <div style={{ fontSize:11, color:C.textDim, fontStyle:"italic", marginBottom:2 }}>{String(r.q).replace(/"/g,"")}</div>
          <div style={{ fontSize:13, color:C.text }}>{r.a}</div>
        </div>
      ))}
    </div>
  );
}

/* ---- motion -------------------------------------------------------------- */
/* line-by-line typed dialogue */
export function useTyped(lines, active=true) {
  const key = lines.join("|");
  const [n, setN] = useState(0);
  useEffect(() => { setN(0); }, [key]);
  useEffect(() => {
    if (!active) return; if (n >= lines.length) return;
    const t = setTimeout(() => setN(v => v + 1), n === 0 ? 450 : 1500);
    return () => clearTimeout(t);
  }, [n, key, active]);
  return [lines.slice(0, n), n >= lines.length];
}
export function Embers({ on=true, color=C.gold, count=14 }) {
  if (!on) return null;
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
      {Array.from({ length:count }).map((_, i) => (
        <div key={i} style={{ position:"absolute", left:`${22+(i*41)%56}%`, bottom:"18%", width:3+(i%3), height:3+(i%3), borderRadius:"50%", background:color, boxShadow:`0 0 6px ${color}`, opacity:0, animation:`sEmber ${2.4+(i%3)*0.6}s ease-out ${i*0.16}s infinite` }} />
      ))}
    </div>
  );
}
export function Starfield({ mood=C.mint, count=24 }) {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
      {Array.from({ length:count }).map((_, i) => (
        <div key={i} style={{ position:"absolute", left:`${(i*37)%100}%`, top:`${(i*19)%55}%`, width:2, height:2, borderRadius:"50%", background:hexA(mood,.5), opacity:.4, animation:`sTwinkle ${2+(i%4)}s ease-in-out ${i*.2}s infinite` }} />
      ))}
    </div>
  );
}
export function ForestBackdrop({ mood=C.mint }) {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
      <Starfield mood={mood} />
      <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" style={{ position:"absolute", bottom:0, width:"100%", height:"52%", opacity:.5 }}>
        {Array.from({ length:22 }).map((_, i) => {
          const x = i*19, h = 80+((i*53)%100), col = i%3===0 ? mood : C.leaf;
          return (
            <g key={i}>
              <rect x={x+8} y={200-h*.42} width={5} height={h*.42} fill={hexA("#082016",.95)} />
              <polygon points={`${x+11},${200-h} ${x-4},${200-h*.42} ${x+26},${200-h*.42}`} fill={hexA(col,.18)} stroke={hexA(col,.4)} strokeWidth=".5" />
            </g>
          );
        })}
      </svg>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:40, background:C.black }} />
    </div>
  );
}
/* full-screen essence burst — used on the "return to Essence" beat */
export function EssenceBurst({ color=C.power, glyph="⬢", name, line }) {
  return (
    <div style={{ textAlign:"center", padding:"10px 0", animation:"sRiseGlow .8s cubic-bezier(.16,1,.3,1)" }}>
      <div style={{ position:"relative", display:"inline-block" }}>
        <div style={{ position:"absolute", inset:-40, borderRadius:"50%", background:`radial-gradient(circle, ${hexA(color,.5)}, transparent 70%)`, animation:"sBurst 1.4s ease-out" }} />
        <div style={{ position:"relative", fontSize:54, color, filter:`drop-shadow(0 0 18px ${hexA(color,.7)})`, animation:"sPulse 2s ease-in-out infinite" }}>{glyph}</div>
      </div>
      {name && <div style={{ ...serif, fontSize:28, fontWeight:700, color, marginTop:6 }}>{name}</div>}
      {line && <div style={{ fontSize:15, color:C.textDim, fontStyle:"italic", marginTop:6, maxWidth:420, marginLeft:"auto", marginRight:"auto" }}>{line}</div>}
    </div>
  );
}
/* the recurring Phoenix seal — Jon's identity-anchor motif, ends each chapter */
export function PhoenixSeal({ color=C.phoenix, label }) {
  return (
    <div style={{ textAlign:"center", padding:"8px 0" }}>
      <svg width="64" height="64" viewBox="0 0 64 64" style={{ filter:`drop-shadow(0 0 14px ${hexA(color,.7)})`, animation:"sIdle 3s ease-in-out infinite" }}>
        <path d="M32 8 C26 18 18 20 14 30 C20 28 24 30 26 34 C20 40 16 50 20 56 C24 50 28 48 32 50 C36 48 40 50 44 56 C48 50 44 40 38 34 C40 30 44 28 50 30 C46 20 38 18 32 8 Z"
          fill={hexA(color,.18)} stroke={color} strokeWidth="1.5" />
        <circle cx="32" cy="34" r="3.4" fill={color} />
      </svg>
      {label && <div style={{ fontSize:10, ...mono, color:hexA(color,.9), letterSpacing:3, marginTop:4 }}>{label}</div>}
    </div>
  );
}

/* ---- sprites ------------------------------------------------------------- */
/* The Seeker — the player. Hooded neon silhouette. */
export function HeroSprite({ size=120, walking=false, glow=C.cyan }) {
  return (
    <svg width={size} height={size*1.4} viewBox="0 0 100 140" style={{ filter:`drop-shadow(0 0 10px ${hexA(glow,.7)})`, animation:walking?"sWalk .4s ease-in-out infinite":"sIdle 3.2s ease-in-out infinite" }}>
      <defs><radialGradient id="hcore" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={hexA(glow,.9)} /><stop offset="100%" stopColor={hexA(glow,0)} /></radialGradient></defs>
      <ellipse cx="50" cy="134" rx="26" ry="5" fill={hexA(glow,.25)} />
      <path d="M50 34 C34 40 30 70 28 104 C26 124 36 130 50 130 C64 130 74 124 72 104 C70 70 66 40 50 34 Z" fill={hexA("#0a0f1c",.95)} stroke={hexA(glow,.6)} strokeWidth="1.5" />
      <path d="M50 8 C36 8 30 22 32 38 C38 30 44 28 50 28 C56 28 62 30 68 38 C70 22 64 8 50 8 Z" fill={hexA("#0a0f1c",.98)} stroke={hexA(glow,.7)} strokeWidth="1.5" />
      <ellipse cx="50" cy="26" rx="9" ry="11" fill="#05070d" />
      <circle cx="46" cy="25" r="1.6" fill={glow} /><circle cx="54" cy="25" r="1.6" fill={glow} />
      <circle cx="50" cy="64" r="9" fill="url(#hcore)" /><circle cx="50" cy="64" r="3.5" fill={glow} />
      <path d="M40 48 L50 58 L60 48" fill="none" stroke={hexA(glow,.5)} strokeWidth="1" />
    </svg>
  );
}
/* A crowned shadow that shares the Seeker's silhouette — "you, crowned".
   revealed = lit gold; healed = reforged mint/teal (The Sovereign Builder). */
export function CrownedSprite({ size=140, revealed=false, healed=false, baseColor=C.gold, healedColor=C.mint }) {
  const col = healed ? healedColor : revealed ? baseColor : C.locked;
  const body = hexA(healed ? "#0a1a14" : "#0a0a12", .97);
  return (
    <svg width={size} height={size*1.4} viewBox="0 0 100 140" style={{ filter:`drop-shadow(0 0 ${revealed||healed?18:7}px ${hexA(col,revealed||healed?.8:.4)})`, transition:"filter .8s", animation:revealed?"sRise .8s ease":"sSlump 4s ease-in-out infinite" }}>
      <defs><radialGradient id="kcore" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={hexA(col,.9)} /><stop offset="100%" stopColor={hexA(col,0)} /></radialGradient></defs>
      <ellipse cx="50" cy="134" rx="26" ry="5" fill={hexA(col,revealed?.3:.12)} />
      <path d="M50 34 C34 40 30 70 28 104 C26 124 36 130 50 130 C64 130 74 124 72 104 C70 70 66 40 50 34 Z" fill={body} stroke={hexA(col,.6)} strokeWidth="1.5" />
      <path d="M30 124 l5 7 l5 -5 l5 7 l5 -5 l5 7 l5 -5 l5 7" fill="none" stroke={hexA(col,.45)} strokeWidth="1" />
      <path d="M50 8 C36 8 30 22 32 38 C38 30 44 28 50 28 C56 28 62 30 68 38 C70 22 64 8 50 8 Z" fill={body} stroke={hexA(col,.7)} strokeWidth="1.5" />
      <ellipse cx="50" cy="26" rx="9" ry="11" fill="#05050d" />
      <circle cx="46" cy="25" r="1.7" fill={revealed||healed?col:hexA(baseColor,.4)}>{(revealed||healed)&&<animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />}</circle>
      <circle cx="54" cy="25" r="1.7" fill={healed?col:revealed?hexA(C.danger,.7):hexA(baseColor,.2)} />
      <circle cx="50" cy="64" r="9" fill="url(#kcore)" /><circle cx="50" cy="64" r="3.5" fill={col} />
      <path d="M40 48 L50 58 L60 48" fill="none" stroke={hexA(col,.5)} strokeWidth="1" />
      <g transform="translate(50,9)">
        <path d="M-13 5 L-13 -4 L-8 3 L-4 -8 L0 2 L4 -8 L8 3 L13 -4 L13 5 Z" fill={healed?hexA(healedColor,.9):revealed?hexA(baseColor,.85):hexA(baseColor,.35)} stroke={healed?healedColor:revealed?baseColor:hexA(baseColor,.45)} strokeWidth="1" />
        {!healed && <path d="M-1 5 L1 -1 L-1 -6" fill="none" stroke={revealed?hexA("#000",.45):hexA(C.danger,.6)} strokeWidth="1.3" />}
        {healed && <circle cx="0" cy="-4" r="1.5" fill={healedColor}><animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" /></circle>}
      </g>
    </svg>
  );
}

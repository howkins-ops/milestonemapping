import React, { useState, useEffect, useRef, useCallback } from "react";

/* =============================================================================
   MILESTONE QUEST — "THE SHADOW ON THE ROAD" v3
   Built from Jon's canonical lore: THE BROKE KING — the fallen ruler forged in
   scarcity. Not a beggar; a man who tasted the kingdom, lost it, and whose
   nervous system stopped trusting abundance. "I am behind. I should be further
   by now." Protective, not evil — he blocks the climb to prevent another fall.

   This chapter is a WALKING, MULTI-SCENE cinematic (not two figures standing):
     1. Recap / walk the road
     2. The encounter — meet the fallen man (help or pass)
     3. He sees through you -> THE MIRROR: you look, and see HIM in your reflection
     4. ORIGIN (SVG animation): how he was forged — success before roots, the
        stacked losses, the crack in the crown (straight from the lore)
     5. Live ICF-style COACHING: powerful open questions, one at a time; he reads
        your real answers (Claude-in-Claude), challenges gently, and guides YOU
        to your own reframe. Transformational work disguised as story.
     6. The Alchemist payoff (omens/signs your father warned of) + the shadow
        attaches: "Now I am part of you. Forever." A shadow-creature, as Dad said.
     7. Handoff w/ Shadow Journal.

   Coaching grounded in ICF "Evokes Awareness": powerful questioning, metaphor,
   challenge with permission, one open question at a time, client reframes.
   Art: SVG neon-silhouette cast + PNG registry (real v3 assets drop in later).
   ============================================================================= */

const C={black:"#000000",night:"#04020b",forest:"#04100b",card:"#0b0712",cardDeep:"#080510",phoenix:"#7B2CFF",magenta:"#D11EFF",hotPink:"#FF3EDB",cyan:"#00F0FF",mint:"#00FFBF",gold:"#FFC94D",amber:"#FFA94D",text:"#F2F0F4",textDim:"#9a8fb0",locked:"#3a3450",danger:"#FF5470",leaf:"#1f7a4d"};
const hexA=(h,a)=>{const x=h.replace("#","");return `rgba(${parseInt(x.slice(0,2),16)},${parseInt(x.slice(2,4),16)},${parseInt(x.slice(4,6),16)},${a})`;};

/* PNG registry — Jon's MilestoneQuest v3 asset names, swap in on desktop */
const ART={ heroBase:null/*HERO_AVATAR_BASE*/, crown:null/*MISC_CROWN*/, phoenix:null/*MISC_PHOENIX*/, bgVault:null/*BG_MONEY_VAULT*/, bgCitadel:null/*BG_EQUITY_CITADEL*/ };

const THEMES={
  neon:{ id:"neon", label:"Neon Dominion", accent:C.phoenix,
    shadow:{ id:"brokeKing", name:"The Broke King", healed:"The Sovereign Builder", color:C.gold,
      wound:"I am behind. I lost my kingdom.",
      lie:"Money makes me powerful.",
      truth:"I use my power to create money. I rebuild through proof.",
      essence:"Power",
      feels:"shame, comparison, money-fear, and the sense of being behind",
      arena:"The Ruined Treasury" } },
  foundry:{ id:"foundry", label:"The Foundry", accent:C.mint,
    shadow:{ id:"brokie", name:"Crazy Brokie", healed:"The Sovereign Builder", color:C.gold,
      wound:"I am behind. I blew my shot.",
      lie:"Money makes me powerful.",
      truth:"I build power through proof, not panic.",
      essence:"Confident",
      feels:"money panic, spiraling, and the sense of being behind",
      arena:"The Ruined Treasury" } },
};

const MENTORS=[
  { id:"anchor", name:"The Anchor", color:C.cyan, status:"unlocked", line:"Grounds you so you don't drift. Someone who has known you for years." },
  { id:"challenger", name:"The Challenger", color:C.danger, status:"locked", line:"Summons your masks when you break your word. Revealed when you're ready to be tested." },
  { id:"operator", name:"The Operator", color:C.gold, status:"locked", line:"Puts you to work and turns proof into a system. Met in later chapters." },
];

const SAVE_KEY="milestone-quest:shadow-v3";
const blank=()=>({ phase:"recap", themeId:"neon", anchorName:"Dad", helped:null, doing:"", chasing:"", reflections:[], seedPlanted:false });
function load(){try{const r=localStorage.getItem(SAVE_KEY);if(!r)return blank();return {...blank(),...JSON.parse(r)};}catch{return blank();}}
function persist(s){try{localStorage.setItem(SAVE_KEY,JSON.stringify(s));}catch{}}

const mono={fontFamily:"'JetBrains Mono', monospace"};
const fsWrap=(bg)=>({position:"relative",minHeight:"100vh",background:bg,overflow:"hidden"});
function Btn({children,onClick,disabled,accent=C.magenta,ghost,full,small}){return <button onClick={onClick} disabled={disabled} style={{width:full?"100%":"auto",padding:small?"8px 14px":"13px 22px",borderRadius:12,...mono,fontSize:small?12:14,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",cursor:disabled?"not-allowed":"pointer",color:disabled?C.textDim:ghost?accent:"#04020b",background:disabled?"rgba(255,255,255,.04)":ghost?"transparent":`linear-gradient(135deg, ${accent}, ${C.hotPink})`,border:ghost?`1px solid ${hexA(accent,.5)}`:"none",boxShadow:disabled||ghost?"none":`0 0 18px ${hexA(accent,.5)}`,opacity:disabled?.55:1,transition:"transform .12s"}} onMouseDown={e=>!disabled&&(e.currentTarget.style.transform="scale(.96)")} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>{children}</button>;}
const choiceBtn=(c=C.amber)=>({textAlign:"left",padding:"14px 16px",borderRadius:14,border:`1px solid ${hexA(c,.4)}`,background:`linear-gradient(160deg, ${C.card}, ${C.cardDeep})`,color:C.text,cursor:"pointer",fontSize:14,fontFamily:"'Inter Tight', sans-serif",width:"100%"});
const ta={width:"100%",boxSizing:"border-box",padding:"12px 14px",borderRadius:12,background:"rgba(255,255,255,.04)",border:`1px solid ${hexA(C.gold,.4)}`,color:C.text,fontSize:15,fontFamily:"'Inter Tight', sans-serif",outline:"none",resize:"none",minHeight:72};

/* ===== SVG characters ==================================================== */
function HeroSprite({size=120,walking=false,glow=C.cyan}){return <svg width={size} height={size*1.4} viewBox="0 0 100 140" style={{filter:`drop-shadow(0 0 10px ${hexA(glow,.7)})`,animation:walking?"sWalk .4s ease-in-out infinite":"sIdle 3.2s ease-in-out infinite"}}>
  <defs><radialGradient id="hcore" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={hexA(glow,.9)}/><stop offset="100%" stopColor={hexA(glow,0)}/></radialGradient></defs>
  <ellipse cx="50" cy="134" rx="26" ry="5" fill={hexA(glow,.25)}/>
  <path d="M50 34 C34 40 30 70 28 104 C26 124 36 130 50 130 C64 130 74 124 72 104 C70 70 66 40 50 34 Z" fill={hexA("#0a0f1c",.95)} stroke={hexA(glow,.6)} strokeWidth="1.5"/>
  <path d="M50 8 C36 8 30 22 32 38 C38 30 44 28 50 28 C56 28 62 30 68 38 C70 22 64 8 50 8 Z" fill={hexA("#0a0f1c",.98)} stroke={hexA(glow,.7)} strokeWidth="1.5"/>
  <ellipse cx="50" cy="26" rx="9" ry="11" fill="#05070d"/>
  <circle cx="46" cy="25" r="1.6" fill={glow}/><circle cx="54" cy="25" r="1.6" fill={glow}/>
  <circle cx="50" cy="64" r="9" fill="url(#hcore)"/><circle cx="50" cy="64" r="3.5" fill={glow}/>
  <path d="M40 48 L50 58 L60 48" fill="none" stroke={hexA(glow,.5)} strokeWidth="1"/>
</svg>;}
/* The Broke King shares the HERO's exact silhouette — because he IS you, crowned.
   Same hood, same body, same core. Differences: darkened, a crown (chosen in the
   mirror), one ambition-eye (gold) + one shame-eye (dark), tattered hem. */
function BrokeKingSprite({size=140,revealed=false,healed=false}){
  const col=healed?C.mint:revealed?C.gold:C.locked;
  const body=hexA(healed?"#0a1a14":"#0a0a12",.97);
  return <svg width={size} height={size*1.4} viewBox="0 0 100 140" style={{filter:`drop-shadow(0 0 ${revealed||healed?18:7}px ${hexA(col,revealed||healed?.8:.4)})`,transition:"filter .8s",animation:revealed?"sRise .8s ease":"sSlump 4s ease-in-out infinite"}}>
    <defs><radialGradient id="kcore" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={hexA(col,.9)}/><stop offset="100%" stopColor={hexA(col,0)}/></radialGradient></defs>
    <ellipse cx="50" cy="134" rx="26" ry="5" fill={hexA(col,revealed?.3:.12)}/>
    {/* SAME body path as hero */}
    <path d="M50 34 C34 40 30 70 28 104 C26 124 36 130 50 130 C64 130 74 124 72 104 C70 70 66 40 50 34 Z" fill={body} stroke={hexA(col,.6)} strokeWidth="1.5"/>
    {/* tattered royal hem */}
    <path d="M30 124 l5 7 l5 -5 l5 7 l5 -5 l5 7 l5 -5 l5 7" fill="none" stroke={hexA(col,.45)} strokeWidth="1"/>
    {/* SAME hood path as hero */}
    <path d="M50 8 C36 8 30 22 32 38 C38 30 44 28 50 28 C56 28 62 30 68 38 C70 22 64 8 50 8 Z" fill={body} stroke={hexA(col,.7)} strokeWidth="1.5"/>
    <ellipse cx="50" cy="26" rx="9" ry="11" fill="#05050d"/>
    {/* one ambition-eye (gold), one shame-eye (dark/red) */}
    <circle cx="46" cy="25" r="1.7" fill={revealed?C.gold:hexA(C.gold,.4)}>{revealed&&<animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite"/>}</circle>
    <circle cx="54" cy="25" r="1.7" fill={revealed?hexA(C.danger,.7):hexA(C.gold,.2)}/>
    {/* core — same position as hero, but king-colored */}
    <circle cx="50" cy="64" r="9" fill="url(#kcore)"/><circle cx="50" cy="64" r="3.5" fill={col}/>
    <path d="M40 48 L50 58 L60 48" fill="none" stroke={hexA(col,.5)} strokeWidth="1"/>
    {/* THE CROWN — the one chosen in the mirror; cracked unless healed */}
    <g transform="translate(50,9)">
      <path d="M-13 5 L-13 -4 L-8 3 L-4 -8 L0 2 L4 -8 L8 3 L13 -4 L13 5 Z" fill={healed?hexA(C.mint,.9):revealed?hexA(C.gold,.85):hexA(C.gold,.35)} stroke={healed?C.mint:revealed?C.gold:hexA(C.gold,.45)} strokeWidth="1"/>
      {!healed&&<path d="M-1 5 L1 -1 L-1 -6" fill="none" stroke={revealed?hexA("#000",.45):hexA(C.danger,.6)} strokeWidth="1.3"/>}
      {revealed&&!healed&&<circle cx="0" cy="-4" r="1.5" fill={C.cyan}><animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite"/></circle>}
    </g>
  </svg>;
}

/* The shadow-self that is BORN when he walks away — a flat black crowned
   outline of the SAME silhouette, trailing the hero. The voice that follows. */
function ShadowSelf({size=140,intensity=1}){
  return <svg width={size} height={size*1.4} viewBox="0 0 100 140" style={{filter:`drop-shadow(0 0 10px ${hexA(C.gold,.3*intensity)})`,opacity:intensity}}>
    <ellipse cx="50" cy="134" rx="24" ry="5" fill={hexA("#000",.5)}/>
    <path d="M50 34 C34 40 30 70 28 104 C26 124 36 130 50 130 C64 130 74 124 72 104 C70 70 66 40 50 34 Z" fill="#000" stroke={hexA(C.gold,.35*intensity)} strokeWidth="1"/>
    <path d="M50 8 C36 8 30 22 32 38 C38 30 44 28 50 28 C56 28 62 30 68 38 C70 22 64 8 50 8 Z" fill="#000" stroke={hexA(C.gold,.4*intensity)} strokeWidth="1"/>
    <circle cx="46" cy="25" r="1.4" fill={hexA(C.gold,.5*intensity)}/><circle cx="54" cy="25" r="1.4" fill={hexA(C.danger,.4*intensity)}/>
    <g transform="translate(50,9)"><path d="M-13 5 L-13 -4 L-8 3 L-4 -8 L0 2 L4 -8 L8 3 L13 -4 L13 5 Z" fill="#000" stroke={hexA(C.gold,.5*intensity)} strokeWidth="1"/></g>
  </svg>;
}

function Embers({on,color=C.gold,count=14}){if(!on)return null;return <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}}>{Array.from({length:count}).map((_,i)=><div key={i} style={{position:"absolute",left:`${22+(i*41)%56}%`,bottom:"18%",width:3+(i%3),height:3+(i%3),borderRadius:"50%",background:color,boxShadow:`0 0 6px ${color}`,opacity:0,animation:`sEmber ${2.4+(i%3)*0.6}s ease-out ${i*0.16}s infinite`}}/>)}</div>;}

/* moving parallax road — used in walking scenes */
function RoadStrip({progress=0,walking=false,mood=C.leaf,kingAhead=false}){
  const tx=-(progress*48);
  return <div style={{position:"relative",height:240,overflow:"hidden",background:`linear-gradient(180deg, ${C.forest} 0%, ${C.black} 100%)`}}>
    {Array.from({length:22}).map((_,i)=><div key={i} style={{position:"absolute",left:`${(i*37)%100}%`,top:`${(i*19)%50}%`,width:2,height:2,borderRadius:"50%",background:hexA(mood,.5),opacity:.4,animation:`sTwinkle ${2+(i%4)}s ease-in-out ${i*.2}s infinite`}}/>)}
    <div style={{position:"absolute",bottom:38,left:0,height:170,width:"200%",transform:`translateX(${tx}%)`,transition:walking?"none":"transform .4s ease"}}>
      <svg viewBox="0 0 800 170" preserveAspectRatio="none" style={{position:"absolute",bottom:0,width:"100%",height:170}}>{Array.from({length:30}).map((_,i)=>{const x=i*27,h=80+((i*53)%90);const col=i%3===0?mood:C.leaf;return <g key={i}><rect x={x+9} y={170-h*.42} width={5} height={h*.42} fill={hexA("#082016",.95)}/><polygon points={`${x+12},${170-h} ${x-5},${170-h*.42} ${x+28},${170-h*.42}`} fill={hexA(col,.18)} stroke={hexA(col,.4)} strokeWidth=".5"/></g>;})}</svg>
    </div>
    <div style={{position:"absolute",bottom:36,left:0,right:0,height:3,background:`linear-gradient(90deg, ${C.leaf}, ${mood})`,boxShadow:`0 0 12px ${hexA(mood,.4)}`}}/>
    <div style={{position:"absolute",bottom:0,left:0,right:0,height:38,background:C.black}}/>
    <div style={{position:"absolute",bottom:40,left:"34%",transform:"translateX(-50%)"}}><HeroSprite size={92} walking={walking}/></div>
    {kingAhead&&progress>0.4&&<div style={{position:"absolute",bottom:40,right:"16%",opacity:(progress-0.4)/0.6}}><BrokeKingSprite size={104} revealed={false}/></div>}
  </div>;
}
function ForestBackdrop({mood=C.mint}){return <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
  {Array.from({length:24}).map((_,i)=><div key={i} style={{position:"absolute",left:`${(i*37)%100}%`,top:`${(i*19)%55}%`,width:2,height:2,borderRadius:"50%",background:hexA(mood,.5),opacity:.4,animation:`sTwinkle ${2+(i%4)}s ease-in-out ${i*.2}s infinite`}}/>)}
  <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" style={{position:"absolute",bottom:0,width:"100%",height:"52%",opacity:.5}}>{Array.from({length:22}).map((_,i)=>{const x=i*19,h=80+((i*53)%100);const col=i%3===0?mood:C.leaf;return <g key={i}><rect x={x+8} y={200-h*.42} width={5} height={h*.42} fill={hexA("#082016",.95)}/><polygon points={`${x+11},${200-h} ${x-4},${200-h*.42} ${x+26},${200-h*.42}`} fill={hexA(col,.18)} stroke={hexA(col,.4)} strokeWidth=".5"/></g>;})}</svg>
  <div style={{position:"absolute",bottom:0,left:0,right:0,height:40,background:C.black}}/>
</div>;}

const holdBtn=(c)=>({marginTop:8,padding:"15px 28px",borderRadius:999,border:`1.5px solid ${c}`,background:`linear-gradient(135deg, ${hexA(c,.2)}, ${hexA(C.phoenix,.1)})`,color:C.text,...mono,fontSize:14,fontWeight:700,letterSpacing:1,cursor:"pointer",boxShadow:`0 0 20px ${hexA(c,.4)}`,userSelect:"none"});
function Track({v,a,b}){return <div style={{marginTop:14,height:4,maxWidth:240,margin:"14px auto 0",borderRadius:999,background:"rgba(255,255,255,.06)",overflow:"hidden"}}><div style={{width:`${v*100}%`,height:"100%",background:`linear-gradient(90deg, ${a}, ${b})`,transition:"width .1s"}}/></div>;}

/* line-by-line dialogue helper */
function useTyped(lines,active=true){
  const key=lines.join("|");
  const [n,setN]=useState(0);
  useEffect(()=>{setN(0);},[key]);
  useEffect(()=>{if(!active)return;if(n>=lines.length)return;const t=setTimeout(()=>setN(v=>v+1),n===0?450:1500);return()=>clearTimeout(t);},[n,key,active]);
  return [lines.slice(0,n), n>=lines.length];
}

/* ===== 1. RECAP + walk (tap once, it plays) ============================= */
function Recap({theme,state,go}){
  const [progress,setProgress]=useState(0);const [walking,setWalking]=useState(false);const raf=useRef(null);
  const target=0.55;
  const play=()=>{
    if(walking||progress>=target)return;
    setWalking(true);
    const t0=performance.now();const dur=3200;
    const step=(now)=>{
      const p=Math.min(target,(now-t0)/dur*target);
      setProgress(p);
      if(p<target){raf.current=requestAnimationFrame(step);}else{setWalking(false);}
    };
    raf.current=requestAnimationFrame(step);
  };
  useEffect(()=>()=>cancelAnimationFrame(raf.current),[]);
  const there=progress>=target;
  const started=progress>0;
  return <div style={fsWrap(`radial-gradient(900px 600px at 50% 15%, ${hexA(theme.accent,.16)}, transparent), ${C.black}`)}>
    <RoadStrip progress={progress} walking={walking} kingAhead/>
    <div style={{padding:"18px 24px",textAlign:"center"}}>
      <div style={{fontSize:11,letterSpacing:4,color:C.mint,...mono,marginBottom:8}}>THE FOREST · CHAPTER ONE</div>
      {!there?<>
        <p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,color:C.textDim,minHeight:46}}>{progress<0.02?`${state.anchorName||"Your anchor"} grounded you. You crossed the treeline. The road ahead waits.`:progress<0.45?"The trees close in. The neon of the city fades behind you…":"Someone is on the road ahead. Slumped. Still."}</p>
        {!started?<button onClick={play} style={holdBtn(C.cyan)}>TAP TO WALK →</button>:<div style={{...mono,fontSize:12,color:C.cyan,padding:"15px"}}>walking…</div>}
        <Track v={progress/target} a={C.cyan} b={C.leaf}/>
      </>:<div style={{animation:"sFade .5s"}}><p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,color:C.text}}>You slow. A man sits against a dead tree, head low.</p><div style={{marginTop:12}}><Btn accent={C.amber} onClick={go}>Approach →</Btn></div></div>}
    </div>
  </div>;
}

/* ===== 2. ENCOUNTER ====================================================== */
function Encounter({theme,state,update,onMirror}){
  const sh=theme.shadow;
  const [step,setStep]=useState(0);
  const approach=["A man sits slumped against a dead tree.","His clothes were fine once — royal, even. Now they're rags shot through with gold thread.","A cracked crown sits crooked on his head. He lifts his eyes as you pass."];
  const speak=["\"Traveler… spare something? Coin. Food. Anything.\"","\"I knew this road once. Every turn of it. I could have owned it all.\"","\"I had the kingdom in my hands. Then the gold turned heavy.\"","\"Help an old king who lost his way.\""];
  const beats=step===0?approach:step===1?speak:[];
  const [shown,done]=useTyped(beats,step<=1);
  const choose=(helped)=>{update(s=>{s.helped=helped;});setStep(3);};
  return <div style={fsWrap(`radial-gradient(800px 600px at 50% 18%, ${hexA(sh.color,.14)}, transparent), ${C.forest}`)}>
    <ForestBackdrop mood={C.leaf}/>
    <div style={{position:"relative",zIndex:2,height:210,display:"flex",alignItems:"flex-end",justifyContent:"space-around",padding:"28px 24px 0"}}>
      <HeroSprite size={98}/><BrokeKingSprite size={116} revealed={false}/>
    </div>
    <div style={{position:"relative",zIndex:2,maxWidth:460,margin:"0 auto",padding:"6px 22px 50px"}}>
      {step<=1&&<>
        <div style={{minHeight:90}}>{shown.map((t,k)=><p key={k} style={{fontFamily:"'Fraunces', serif",fontStyle:step===1?"italic":"normal",fontSize:16,lineHeight:1.5,margin:"0 0 8px",color:k===shown.length-1?C.text:C.textDim,animation:"sFade .5s ease"}}>{t}</p>)}</div>
        {done&&<div style={{marginTop:8,animation:"sRise .5s"}}><Btn full accent={C.amber} onClick={()=>setStep(step+1)}>{step===0?"He's speaking to you…":"How do you respond?"}</Btn></div>}
      </>}
      {step===2&&<div style={{animation:"sRise .5s"}}>
        <div style={{fontSize:11,...mono,color:C.textDim,marginBottom:10,textAlign:"center"}}>You're behind on your own quest. Every moment here costs you.</div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <button onClick={()=>choose(true)} style={choiceBtn(C.mint)}>Stop. Kneel. Help him.</button>
          <button onClick={()=>choose(false)} style={choiceBtn(C.amber)}>Nod, and keep walking.</button>
        </div>
      </div>}
      {step===3&&<div style={{animation:"sFade .5s"}}>
        <p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,color:C.text,marginBottom:14}}>{state.helped?"You kneel. Share what you carry. He studies your face a long moment — too long.":"You step past. But his voice follows you, calm, certain, like he already knows you."}</p>
        <p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:17,color:sh.color,marginBottom:16,textShadow:`0 0 14px ${hexA(sh.color,.4)}`}}>"Wait. Before you go… look at me. Really look."</p>
        <Btn full accent={sh.color} onClick={onMirror}>Look at him →</Btn>
      </div>}
    </div>
  </div>;
}

/* ===== 3. THE MIRROR — you see YOURSELF; the King outside matches you === */
function Mirror({theme,state,onOrigin}){
  const sh=theme.shadow;
  const [phase,setPhase]=useState(0); // 0 raising, 1 you see yourself, 2 he steps beside the glass — same shape, crowned
  const lines=["He lifts a shard of broken glass. A mirror. He holds it up to your face.","You see yourself. Your own hood. Your own light. Tired, searching — but you.","Then he steps beside the glass. And you freeze. His shape is YOUR shape. The same silhouette. Only — he wears a crown."];
  const [shown,done]=useTyped(lines,true);
  useEffect(()=>{const t=setInterval(()=>setPhase(p=>Math.min(2,p+1)),1700);return()=>clearInterval(t);},[]);
  return <div style={fsWrap(`radial-gradient(700px 700px at 50% 35%, ${hexA(sh.color,.2)}, ${C.night} 60%, ${C.black})`)}>
    <ForestBackdrop mood={C.gold}/>
    <div style={{position:"relative",zIndex:2,display:"flex",justifyContent:"center",alignItems:"flex-end",gap:18,paddingTop:"7vh",height:230}}>
      {/* the mirror showing YOURSELF */}
      <div style={{position:"relative"}}>
        <div style={{position:"absolute",inset:-12,borderRadius:"14px",border:`2px solid ${hexA(C.cyan,.5)}`,boxShadow:`0 0 28px ${hexA(C.cyan,.35)}, inset 0 0 24px ${hexA(C.cyan,.25)}`,animation:"sPulse 2.4s ease-in-out infinite"}}/>
        <HeroSprite size={132}/>
        <div style={{textAlign:"center",fontSize:9,...mono,color:C.cyan,marginTop:2}}>THE GLASS · YOU</div>
      </div>
      {/* the King stepping in beside it — same shape, crowned — fades in at phase 2 */}
      <div style={{opacity:phase>=2?1:0,transform:phase>=2?"translateX(0)":"translateX(-30px)",transition:"opacity 1s, transform 1s"}}>
        <BrokeKingSprite size={132} revealed/>
        <div style={{textAlign:"center",fontSize:9,...mono,color:sh.color,marginTop:2}}>OUTSIDE · HIM</div>
      </div>
    </div>
    <div style={{position:"relative",zIndex:2,maxWidth:460,margin:"0 auto",padding:"6px 22px 50px"}}>
      <div style={{textAlign:"center",marginBottom:8}}><div style={{fontSize:11,letterSpacing:3,color:sh.color,...mono}}>THE MIRROR</div></div>
      <div style={{minHeight:96}}>{shown.map((t,k)=><p key={k} style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,lineHeight:1.55,margin:"0 0 9px",color:k===shown.length-1?C.text:C.textDim,animation:"sFade .6s"}}>{t}</p>)}</div>
      {done&&<div style={{marginTop:8,animation:"sRise .5s"}}>
        <p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:17,color:sh.color,marginBottom:14}}>"You see it now. I'm not a stranger. I'm you — wearing the crown you're walking all this way to earn."</p>
        <Btn full accent={sh.color} onClick={onOrigin}>"—You're what I want to become?" →</Btn>
      </div>}
    </div>
  </div>;
}

/* ===== 3.5 DO vs BE — the seed of the whole game ======================= */
function DoOrBe({theme,state,update,onOrigin}){
  const sh=theme.shadow;
  const [step,setStep]=useState(0);
  const ask=["\"Before I tell you how I became this — tell me what you've been DOING out here.\"","\"What's the effort? The hard work? The hustle that's going to make you a king?\""];
  const [shown,done]=useTyped(step===0?ask:[],step===0);
  const [doing,setDoing]=useState("");
  const submit=(skip)=>{const v=skip?"Everything. Grinding. Non-stop.":doing.trim();update(s=>{s.doing=v;});setStep(2);};
  return <div style={fsWrap(`radial-gradient(800px 600px at 50% 22%, ${hexA(sh.color,.14)}, transparent), ${C.forest}`)}>
    <ForestBackdrop mood={C.gold}/>
    <div style={{position:"relative",zIndex:2,height:200,display:"flex",alignItems:"flex-end",justifyContent:"space-around",padding:"26px 24px 0"}}>
      <HeroSprite size={96}/><BrokeKingSprite size={112} revealed/>
    </div>
    <div style={{position:"relative",zIndex:2,maxWidth:460,margin:"0 auto",padding:"6px 22px 50px"}}>
      {step===0&&<>
        <div style={{minHeight:80}}>{shown.map((t,k)=><p key={k} style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,lineHeight:1.5,margin:"0 0 8px",color:k===shown.length-1?C.text:sh.color,animation:"sFade .5s"}}>{t}</p>)}</div>
        {done&&<div style={{marginTop:8,animation:"sRise .5s"}}><Btn full accent={sh.color} onClick={()=>setStep(1)}>Tell him what you're doing →</Btn></div>}
      </>}
      {step===1&&<div style={{animation:"sRise .5s"}}>
        <div style={{fontSize:10,...mono,color:sh.color,marginBottom:8}}>WHAT ARE YOU DOING TO BECOME A KING?</div>
        <textarea value={doing} onChange={e=>setDoing(e.target.value)} placeholder="The work, the hustle, the actions you're taking…" style={ta}/>
        <div style={{display:"flex",gap:8,marginTop:10,alignItems:"center"}}>
          <button onClick={()=>submit(true)} style={{...choiceBtn(C.locked),width:"auto",fontSize:12,padding:"10px 14px",color:C.textDim}}>Everything I can</button>
          <div style={{flex:1}}/>
          <Btn accent={sh.color} disabled={!doing.trim()} onClick={()=>submit(false)}>Tell him</Btn>
        </div>
      </div>}
      {step===2&&<div style={{animation:"sFade .5s"}}>
        <p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,color:C.text,marginBottom:10}}>He nods slowly, almost sad.</p>
        <p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,color:sh.color,lineHeight:1.55,marginBottom:10}}>"Of course you are. All that doing. All that effort. You're trying so hard to <span style={{color:C.text}}>become</span> a king."</p>
        <p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,color:sh.color,lineHeight:1.55,marginBottom:10}}>"I know the feeling. I <span style={{color:C.text}}>was</span> a king. I'm what you're walking all this way to be."</p>
        <p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:17,color:C.gold,lineHeight:1.55,marginBottom:16}}>"So tell me — how does a man become a king?"</p>
        <div style={{padding:"12px 14px",borderRadius:12,background:hexA(C.cyan,.06),border:`1px solid ${hexA(C.cyan,.3)}`,marginBottom:16}}>
          <p style={{fontSize:13,color:C.textDim,fontStyle:"italic",margin:0}}>You open your mouth to answer… and nothing comes. You know how to <strong style={{color:C.text}}>do</strong>. You don't yet know how to <strong style={{color:C.text}}>be</strong>. He sees it land.</p>
        </div>
        <Btn full accent={sh.color} onClick={onOrigin}>"—I don't know. How did YOU?" →</Btn>
      </div>}
    </div>
  </div>;
}

/* ===== 4. ORIGIN — the fallen sales legend, forged in fire ============== */
function Origin({theme,onCoach}){
  const sh=theme.shadow;
  // The fallen SALES LEGEND. Mythologized — not "knocked on doors."
  const scenes=[
    { key:"call", color:C.cyan, kicker:"BEFORE THE FALL",
      title:"The Gift",
      lines:["\"I wasn't born a king. I was born with a whisper.\"","\"While everyone slept easy, something in me said: this cannot be all. I had a gift \u2014 I could feel what a person needed before they said a word.\""] },
    { key:"legend", color:C.gold, kicker:"THE LEGEND",
      title:"The Closer",
      lines:["\"They started calling me untouchable. I could walk into any room and bend it. Read the fear, name the dream, turn a 'no' into a handshake.\"","\"Money didn't come to me. I summoned it. Effort became gold. I built my first kingdom with nothing but my voice and my nerve.\""] },
    { key:"roots", color:C.hotPink, kicker:"THE CRACK BENEATH",
      title:"Before the Roots",
      lines:["\"But I won before I was rooted. Every close became proof I mattered. Every commission whispered: see, you're safe now, you're somebody.\"","\"I wasn't chasing the money. I was using it to outrun a feeling. I was trying to alchemize pain into proof.\""] },
    { key:"fall", color:C.danger, kicker:"THE COLLAPSE",
      title:"The Magic Left",
      lines:["\"Then the magic left. The room stopped bending. The deals dried up. The house, the momentum, the timeline \u2014 gone.\"","\"One loss is a bad month. Enough losses become a man's whole identity. 'I lost it' quietly became 'I AM behind.'\""] },
    { key:"crack", color:C.gold, kicker:"THE WOUND",
      title:"The Crown Cracked",
      lines:["\"I watched everyone else move forward. And a voice started, low and certain: 'You should be further by now.'\"","\"The crown cracked clean down the middle. And the legend sat down in the dirt, outside the gates of his own ruined kingdom.\""] },
    { key:"birth", color:C.danger, kicker:"THE SHADOW BORN",
      title:"The Story That Became Me",
      lines:["\"But a cracked crown doesn't make a shadow. The story does. Sitting in that dirt, I started to believe things \u2014 and belief is how a man builds his own cage.\"","\"'I had my shot and I blew it.' 'I can't be trusted with the kingdom.' 'I'm the one who had it all and lost it.' I said them until they stopped being thoughts and became ME.\"","\"That's the day the legend died and I was born. Not from the fall \u2014 from the meaning I gave it. I am every story you'll tell yourself on your worst night. And now\u2026 I'm yours.\""] },
  ];
  const [i,setI]=useState(0);
  const sc=scenes[i];
  const allText=sc.lines.join("\n\n");
  const [shown,done]=useTyped(sc.lines,true);
  return <div style={{...fsWrap(`radial-gradient(900px 800px at 50% 0%, ${hexA(sc.color,.26)}, ${C.night} 55%, ${C.black})`),display:"flex",flexDirection:"column"}}>
    {/* full-bleed cinematic header band */}
    <div style={{position:"relative",height:"42vh",minHeight:280,overflow:"hidden"}}>
      <ForestBackdrop mood={sc.color}/>
      <Embers on color={sc.color} count={sc.key==="crack"||sc.key==="fall"?18:12}/>
      <MemoryShards scene={sc.key} color={sc.color}/>
      <OriginGraphic scene={sc.key} color={sc.color}/>
      {/* big chapter kicker overlaid */}
      <div style={{position:"absolute",left:0,right:0,bottom:14,textAlign:"center"}}>
        <div style={{fontSize:10,letterSpacing:5,color:hexA(sc.color,.9),...mono}}>{sc.kicker}</div>
      </div>
      {/* gradient fade into text */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:80,background:`linear-gradient(180deg, transparent, ${C.black})`}}/>
    </div>
    {/* text block */}
    <div style={{position:"relative",zIndex:3,flex:1,maxWidth:520,margin:"0 auto",width:"100%",padding:"6px 24px 40px",boxSizing:"border-box"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <div style={{flex:1,height:1,background:`linear-gradient(90deg, transparent, ${hexA(sc.color,.5)})`}}/>
        <div style={{display:"flex",gap:6}}>{scenes.map((s,k)=><div key={k} style={{width:k===i?22:6,height:6,borderRadius:999,background:k<=i?sc.color:C.locked,transition:"all .3s"}}/>)}</div>
        <div style={{flex:1,height:1,background:`linear-gradient(90deg, ${hexA(sc.color,.5)}, transparent)`}}/>
      </div>
      <h2 style={{fontFamily:"'Fraunces', serif",fontSize:30,fontWeight:700,color:C.text,margin:"0 0 16px",lineHeight:1.05,letterSpacing:"-.5px"}}>{sc.title}</h2>
      <div style={{minHeight:120}}>{shown.map((t,k)=><p key={k} style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:17,lineHeight:1.6,color:k===0?C.text:hexA(C.text,.88),margin:"0 0 14px",animation:"sFade .7s",borderLeft:`2px solid ${hexA(sc.color,.4)}`,paddingLeft:14}}>{t}</p>)}</div>
      {done&&<div style={{marginTop:14,animation:"sRise .5s"}}>
        {i<scenes.length-1?<Btn full accent={sc.color} onClick={()=>setI(i+1)}>Keep watching →</Btn>:<Btn full accent={C.danger} onClick={onCoach}>"\u2014Then ask me what you came to ask." →</Btn>}
      </div>}
    </div>
  </div>;
}

/* floating holographic memory-shards: ghosts of his old wins drift up behind
   each scene (a contract, a sold-sign, a number, a handshake, a crown). */
function MemoryShards({scene,color}){
  const shardsByScene={
    call:["\u2728","?","\u2735"],
    legend:["$","\u270d","\u2660","%","\u2605"],
    roots:["$","\u2665","\u2660","?"],
    fall:["$","\u2193","\u2620","\u2026"],
    crack:["\u2654","\u2620","\u2193","$"],
    birth:["BEHIND","FAILED","\u2620","\u2026","NOT ENOUGH"],
  };
  const glyphs=shardsByScene[scene]||["$"];
  return <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:1}}>
    {glyphs.map((g,i)=>{const isWord=g.length>2;return <div key={i} style={{position:"absolute",left:`${10+(i*73)%72}%`,bottom:"8%",fontSize:isWord?10:14+(i%3)*6,letterSpacing:isWord?1.5:0,whiteSpace:"nowrap",color:hexA(color,0),...mono,fontWeight:700,animation:`sShard ${4+(i%3)}s ease-out ${i*0.5}s infinite`,filter:`drop-shadow(0 0 6px ${hexA(color,.6)})`}}>{g}</div>;})}
  </div>;
}

/* per-scene central SVG vignette — bigger, more dramatic */
function OriginGraphic({scene,color}){
  return <div style={{position:"absolute",inset:0,zIndex:2,display:"flex",alignItems:"center",justifyContent:"center",paddingBottom:30}}>
    <svg width="220" height="200" viewBox="0 0 220 200">
      {scene==="call"&&<g><circle cx="110" cy="95" r="6" fill={color}><animate attributeName="r" values="4;10;4" dur="2.5s" repeatCount="indefinite"/></circle>{[34,60,86,112].map((r,k)=><circle key={k} cx="110" cy="95" r={r} fill="none" stroke={hexA(color,.4-k*.08)} strokeWidth="1.2"><animate attributeName="r" values={`${r};${r+14};${r}`} dur="3.4s" begin={`${k*.4}s`} repeatCount="indefinite"/><animate attributeName="opacity" values=".55;0;.55" dur="3.4s" begin={`${k*.4}s`} repeatCount="indefinite"/></circle>)}</g>}
      {scene==="legend"&&<g>{/* a rising empire of bars + a crown forming on top */}{Array.from({length:9}).map((_,k)=>{const h=24+((k*29)%92);return <rect key={k} x={56+k*12} y={150-h} width="9" height={h} rx="1.5" fill={hexA(color,.55)} stroke={color} strokeWidth="1"><animate attributeName="height" values={`0;${h}`} dur=".9s" begin={`${k*.1}s`} fill="freeze"/><animate attributeName="y" values={`150;${150-h}`} dur=".9s" begin={`${k*.1}s`} fill="freeze"/></rect>;})}<g transform="translate(110,42)" opacity="0"><path d="M-18 8 L-18 -5 L-11 4 L-5 -10 L0 3 L5 -10 L11 4 L18 -5 L18 8 Z" fill={hexA(color,.8)} stroke={color} strokeWidth="1"/><animate attributeName="opacity" values="0;1" dur=".6s" begin="1s" fill="freeze"/></g></g>}
      {scene==="roots"&&<g><circle cx="110" cy="74" r="32" fill={hexA(color,.14)} stroke={color} strokeWidth="2"/><text x="110" y="82" textAnchor="middle" fontSize="26" fill={color} fontFamily="serif">$</text>{/* shallow broken roots */}<path d="M110 106 L110 150 M110 150 L86 172 M110 150 L134 172 M110 130 L92 144 M110 130 L128 144" stroke={hexA(color,.5)} strokeWidth="1.5" strokeDasharray="2 5"><animate attributeName="stroke-dashoffset" values="0;14" dur="2s" repeatCount="indefinite"/></path></g>}
      {scene==="fall"&&<g>{["$","\u2302","\u2605","\u2026"].map((g,k)=><text key={k} x={56+k*36} y="70" fontSize="22" textAnchor="middle" fill={hexA(C.danger,.8)} fontFamily="serif">{g}<animate attributeName="y" values="70;165" dur="1.3s" begin={`${k*.22}s`} fill="freeze"/><animate attributeName="opacity" values="1;0" dur="1.3s" begin={`${k*.22}s`} fill="freeze"/></text>)}<line x1="44" y1="172" x2="176" y2="172" stroke={hexA(C.danger,.5)} strokeWidth="2"/></g>}
      {scene==="crack"&&<g><path d="M76 112 L76 92 L90 106 L100 76 L110 100 L120 76 L130 106 L144 92 L144 112 Z" fill={hexA(color,.7)} stroke={color} strokeWidth="1.5"/><path d="M110 112 L114 94 L106 84 L112 68" fill="none" stroke={C.danger} strokeWidth="2.5"><animate attributeName="stroke-width" values="0;3" dur="1s" fill="freeze"/></path><ellipse cx="110" cy="158" rx="20" ry="4" fill={hexA(color,.2)}/><path d="M110 124 C100 128 98 144 99 154 L121 154 C122 144 120 128 110 124 Z" fill={hexA("#16100a",.95)} stroke={hexA(color,.5)} strokeWidth="1"/></g>}
      {scene==="birth"&&<g>{/* the figure, with belief-words crystallizing into a dark crowned silhouette */}
        <ellipse cx="110" cy="168" rx="22" ry="4" fill={hexA("#000",.5)}/>
        {/* dark crowned silhouette forming */}
        <path d="M110 70 C96 76 92 116 90 150 C89 164 99 168 110 168 C121 168 131 164 130 150 C128 116 124 76 110 70 Z" fill="#08060c" stroke={hexA(C.danger,.5)} strokeWidth="1"><animate attributeName="opacity" values=".3;1" dur="1.6s" fill="freeze"/></path>
        <circle cx="110" cy="58" r="13" fill="#08060c" stroke={hexA(C.danger,.5)} strokeWidth="1"/>
        <circle cx="105" cy="57" r="2" fill={C.gold}/><circle cx="115" cy="57" r="2" fill={hexA(C.danger,.8)}/>
        {/* cracked crown settling on */}
        <g transform="translate(110,40)"><path d="M-15 6 L-15 -4 L-9 3 L-4 -9 L0 2 L4 -9 L9 3 L15 -4 L15 6 Z" fill={hexA(C.gold,.7)} stroke={C.gold} strokeWidth="1"/><path d="M-1 6 L1 -1 L-1 -5" stroke={C.danger} strokeWidth="1.4" fill="none"/></g>
        {/* limiting-belief words orbiting in, then absorbing */}
        {["BEHIND","FAILED","TOO LATE","NOT ENOUGH"].map((w,k)=><text key={k} x="110" y={k%2?96:120} textAnchor="middle" fontSize="9" fontFamily="monospace" fill={hexA(C.danger,.0)} letterSpacing="1"><animate attributeName="fill-opacity" values="0;.8;0" dur="3s" begin={`${k*.7}s`} repeatCount="indefinite"/>{w}</text>)}
      </g>}
    </svg>
  </div>;
}

/* ===== 5. THE SEED — he exposes the DOING, leaves the question open =====
   IMPORTANT: this opening does NOT teach the doing/being alchemy. The young
   cyberpunk doesn't know any of it yet — he's pure doing. The King only mirrors
   that everything he chases is an OUTCOME he thinks will finally make him enough,
   and lands the unanswered seed: "how do you BECOME a king?" The real lesson
   (Outcome Is Not Your Identity, return to Power, proof action) is earned LATER
   in the boss battle. Here we only plant. */
function Coaching({theme,state,update,onAttach}){
  const sh=theme.shadow;
  const [kingText,setKingText]=useState("");
  const [typing,setTyping]=useState(false);
  const [input,setInput]=useState("");
  const [round,setRound]=useState(0);
  const [reflections,setReflections]=useState([]);
  const [history,setHistory]=useState([]);
  const maxRounds=3;
  const ended=round>=maxRounds;
  const scrollRef=useRef(null);

  const opener=`"You told me what you're doing. So let me ask — when you finally get it all, the kingdom, the gold, the proof… what do you think it'll make you FEEL?"`;
  useEffect(()=>{setKingText(opener);},[]);

  const sysPrompt=`You are "${sh.name}" in a cyberpunk personal-development RPG. You are the player's SHADOW: a fallen ruler who once had the kingdom and lost it. You are speaking to a YOUNG traveler who knows nothing yet — he is pure DOING. He grinds, hustles, chases outcomes, and believes the outcome will finally make him powerful/safe/enough. He does NOT yet understand "being." 

CRITICAL: You are NOT here to teach him the lesson or heal him. You are here ONLY to PLANT A SEED and expose the gap in his understanding. Do not explain doing-vs-being. Do not give the answer. Do not coach him to a breakthrough. Just make him notice, gently, that:
- Everything he chases is an OUTCOME he hopes will make him FEEL something (safe, powerful, respected, enough).
- He knows how to DO. He does not yet know how to BE. 
- Leave him with the unanswered question, not the resolution.

Method:
- Read what he ACTUALLY wrote and reflect it back with quiet recognition. Make him feel seen.
- Ask ONE short open question that gently exposes that he's chasing a feeling through doing. 
- Stay curious and a little sad/knowing, like someone who's been exactly where he is. Never preachy.
- Stay fully in character. First person, weathered, intimate, regal. 2-3 sentences. Wrap speech in quotes. Never mention AI/models/prompts or the words "doing vs being" as a lecture.
- If he wrote "I'd rather not say" or skipped, honor it warmly and ask something gentler.`;

  const fallbackLine=(r)=>[
    `"Mm. So it's not really the gold you want — it's what you think the gold will make you feel. I chased that same ghost. What is it, underneath? Safety? Respect? To finally feel like enough?"`,
    `"There it is. You think the outcome will hand you that feeling. Tell me — who would you have to BE to feel it before the gold ever arrives?"`,
    `"You don't know yet. That's alright. Neither did I, at your age. You only know how to do. The being… that comes later, on a harder night than this."`,
  ][Math.min(r,2)];

  const callKing=useCallback(async(userText)=>{
    setTyping(true);
    const newHistory=[...history,{role:"user",content:userText}];
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:sysPrompt,messages:newHistory})});
      const data=await res.json();
      const text=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("").trim();
      const line=text||fallbackLine(round);
      setHistory([...newHistory,{role:"assistant",content:line}]);setKingText(line);
    }catch(e){const line=fallbackLine(round);setHistory([...newHistory,{role:"assistant",content:line}]);setKingText(line);}
    setTyping(false);
  },[history,round,sysPrompt]);

  const submit=(skipped)=>{
    const userText=skipped?"I'd rather not say.":input.trim();
    if(!skipped&&!userText)return;
    // round 0 captures the FEELING he's chasing (the hidden need)
    if(round===0&&!skipped)update(s=>{s.chasing=userText;});
    const updated=[...reflections,{q:kingText,a:userText}];
    setReflections(updated);setInput("");
    const nextRound=round+1;setRound(nextRound);
    if(nextRound>=maxRounds){
      // NO reframe/resolution. End on the unanswered seed.
      setKingText(`"You came out here to DO. To grind your way to a crown. But a crown isn't something you do — it's something you are. How does a man BECOME a king?… You don't know. Not yet. That's the whole journey ahead of you."`);
    }else callKing(userText);
  };
  useEffect(()=>{if(scrollRef.current)scrollRef.current.scrollTop=scrollRef.current.scrollHeight;},[kingText,typing]);

  return <div style={fsWrap(`radial-gradient(800px 700px at 50% 18%, ${hexA(sh.color,.16)}, ${C.night} 60%, ${C.black})`)}>
    <ForestBackdrop mood={C.gold}/>
    <Embers on color={sh.color} count={10}/>
    <div style={{position:"relative",zIndex:2,display:"flex",justifyContent:"center",paddingTop:"4vh"}}><BrokeKingSprite size={116} revealed/></div>
    <div style={{position:"relative",zIndex:2,maxWidth:460,margin:"0 auto",padding:"4px 20px 50px"}}>
      <div style={{textAlign:"center",marginBottom:8}}><div style={{fontSize:11,letterSpacing:3,color:sh.color,...mono}}>HE SEES WHAT YOU'RE CHASING</div></div>
      <div ref={scrollRef} style={{minHeight:120,maxHeight:190,overflowY:"auto",marginBottom:12}}>
        <p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,lineHeight:1.55,color:C.text,animation:"sFade .5s"}}>{typing?<Dots/>:kingText}</p>
      </div>
      {!ended?<>
        <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Answer him honestly…" style={ta} disabled={typing}/>
        <div style={{display:"flex",gap:8,marginTop:10,alignItems:"center"}}>
          <button onClick={()=>submit(true)} disabled={typing} style={{...choiceBtn(C.locked),width:"auto",fontSize:12,padding:"10px 14px",color:C.textDim}}>I'd rather not say</button>
          <div style={{flex:1}}/>
          <Btn accent={sh.color} disabled={typing||!input.trim()} onClick={()=>submit(false)}>Tell him</Btn>
        </div>
        <div style={{textAlign:"center",fontSize:10,color:C.textDim,...mono,marginTop:10}}>Round {round+1} of {maxRounds} · he reads what you write</div>
      </>:<SeedClose theme={theme} reflections={reflections} update={update} onDone={onAttach}/>}
    </div>
  </div>;
}
function Dots(){return <span style={{color:C.gold}}>{"• • •"}<span style={{...mono,fontSize:12,color:C.textDim,marginLeft:8}}>he's weighing your words…</span></span>;}

/* the seed sits unanswered — no reframe here. The kid just acknowledges he
   doesn't know yet. That's the hook the whole game pays off later. */
function SeedClose({theme,reflections,update,onDone}){
  const sh=theme.shadow;
  const finish=()=>{update(s=>{s.reflections=reflections;s.seedPlanted=true;});onDone();};
  return <div style={{marginTop:6,animation:"sRise .5s"}}>
    <div style={{padding:14,borderRadius:12,background:hexA(C.gold,.07),border:`1px solid ${hexA(C.gold,.35)}`,marginBottom:14}}>
      <div style={{fontSize:10,...mono,color:C.gold,marginBottom:6}}>THE SEED · left unanswered</div>
      <p style={{fontSize:13,color:C.text,lineHeight:1.5,margin:0}}>You know how to <strong>do</strong>. You don't yet know how to <strong>be</strong>. He didn't give you the answer — he gave you the question. <span style={{color:C.textDim,fontStyle:"italic"}}>How does a man become a king?</span></p>
    </div>
    <Btn full accent={C.mint} onClick={finish}>Sit with the question →</Btn>
  </div>;
}

/* ===== 6. THE SHADOW IS BORN — he vanishes; your shadow self forms ===== */
function Attach({theme,state,onDone}){
  const sh=theme.shadow;
  const [phase,setPhase]=useState(0);
  // 0 crown melts to armor, 1 he speaks the becoming, 2 you turn - empty, 3 walk away, 4 shadow forms behind you, 5 voice from the shadow
  const lines=[
    "He watches the question land on you. Something in his cracked crown flickers — almost like pride.",
    `"Good. You felt it. That gap between doing and being — that's the whole road ahead. I can't walk it for you."`,
    "You turn to ask him more — and the road is empty. No man. No crown. Only wind moving the dead leaves.",
    "\"…What the heck. Was he ever even there?\" You start walking again, slower now, glancing back.",
    "And then you see it. On the ground. Trailing you. A shadow shaped exactly like you — but crowned. It walks when you walk.",
    `A voice, low, familiar, right at your shoulder: "${sh.lie}" — and you don't yet realize it's coming from the shadow. From now on, it walks with you. This is how a shadow is born.`,
  ];
  const [shown,done]=useTyped(lines.slice(0,phase+1),true);
  useEffect(()=>{if(phase>=lines.length-1)return;const t=setTimeout(()=>setPhase(phase+1),2700);return()=>clearTimeout(t);},[phase]);
  const [walkP,setWalkP]=useState(0);
  // animate the hero walking + shadow forming once we hit phase 3+
  useEffect(()=>{
    if(phase<3)return;
    let raf;const t0=performance.now();
    const step=(now)=>{const p=Math.min(1,(now-t0)/2600);setWalkP(p);if(p<1)raf=requestAnimationFrame(step);};
    raf=requestAnimationFrame(step);
    return()=>cancelAnimationFrame(raf);
  },[phase>=3]);
  const healed=false; // NOT healed yet — the kid only saw the gap, didn't earn the transformation
  const shadowIntensity=phase>=4?Math.min(1,(walkP)*1.2):0;
  return <div style={fsWrap(`radial-gradient(800px 700px at 50% 28%, ${hexA(healed?C.mint:sh.color,.16)}, ${C.night} 60%, ${C.black})`)}>
    <ForestBackdrop mood={healed?C.mint:C.gold}/>
    <Embers on={phase<2} color={healed?C.mint:sh.color} count={12}/>
    <div style={{position:"relative",zIndex:2,height:240,display:"flex",alignItems:"flex-end",justifyContent:"center",paddingTop:"5vh"}}>
      {phase<2&&<div style={{transition:"opacity 1s"}}><BrokeKingSprite size={150} revealed healed={healed}/></div>}
      {phase>=2&&<div style={{position:"relative",width:"100%",height:170}}>
        {/* hero walking left-to-right slightly */}
        <div style={{position:"absolute",bottom:0,left:`${30+walkP*18}%`,transform:"translateX(-50%)"}}><HeroSprite size={120} walking={phase>=3&&walkP<1}/></div>
        {/* shadow self forming behind/beneath, trailing */}
        {phase>=4&&<div style={{position:"absolute",bottom:-6,left:`${24+walkP*16}%`,transform:"translateX(-50%) scaleY(.94)",filter:"blur(.3px)"}}><ShadowSelf size={118} intensity={shadowIntensity}/></div>}
      </div>}
    </div>
    <div style={{position:"relative",zIndex:2,maxWidth:460,margin:"0 auto",padding:"4px 22px 50px"}}>
      <div style={{minHeight:150}}>{shown.map((t,k)=><p key={k} style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,lineHeight:1.55,margin:"0 0 10px",color:k===shown.length-1?C.text:C.textDim,animation:"sFade .7s"}}>{t}</p>)}</div>
      {done&&phase>=lines.length-1&&<div style={{marginTop:8,animation:"sRise .6s"}}><Btn full accent={C.mint} onClick={onDone}>Walk on, with your shadow →</Btn></div>}
    </div>
  </div>;
}

/* ===== HANDOFF =========================================================== */
function Handoff({theme,state,restart}){
  const sh=theme.shadow;
  const journal=(state.reflections||[]).filter(r=>r.a&&r.a!=="I'd rather not say.");
  return <div style={fsWrap(`radial-gradient(900px 600px at 50% 10%, ${hexA(theme.accent,.16)}, transparent), ${C.black}`)}>
    <ForestBackdrop/>
    <div style={{position:"relative",zIndex:2,maxWidth:440,margin:"0 auto",padding:"7vh 22px 40px"}}>
      <div style={{textAlign:"center",marginBottom:14}}><div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:6}}><HeroSprite size={84}/><ShadowSelf size={80} intensity={.8}/></div><h2 style={{fontFamily:"'Fraunces', serif",fontSize:23,color:C.text,margin:"4px 0"}}>Your Shadow Is Born</h2><p style={{fontSize:12,color:C.textDim}}>You didn't beat him. You met him — and now he walks with you, asking a question you can't yet answer.</p></div>
      <div style={{padding:18,borderRadius:16,background:`linear-gradient(160deg, ${C.card}, ${C.cardDeep})`,border:`1px solid ${hexA(theme.accent,.4)}`}}>
        <Row label="World" value={theme.label}/>
        <Row label="Your choice" value={state.helped?"Stopped to help":"Walked past"}/>
        <Row label="Your shadow" value={sh.name}/>
        <Row label="It looks like" value="You — wearing the crown"/>
        <Row label="The seed" value={'"How do you BECOME a king?"'}/>
        <Row label="What you know" value="How to DO"/>
        <Row label="What you don't" value="How to BE — yet"/>
      </div>
      {state.chasing&&<div style={{marginTop:14,padding:14,borderRadius:12,background:hexA(C.gold,.07),border:`1px solid ${hexA(C.gold,.35)}`}}><div style={{fontSize:10,...mono,color:C.gold,marginBottom:6}}>WHAT YOU'RE REALLY CHASING</div><p style={{fontSize:13,color:C.text,margin:0}}>{state.chasing}</p><p style={{fontSize:11,color:C.textDim,fontStyle:"italic",margin:"6px 0 0"}}>Not the gold itself — the feeling you think it'll finally give you. He saw it. You'll understand it later.</p></div>}
      {journal.length>0&&<div style={{marginTop:14,padding:16,borderRadius:16,background:`linear-gradient(160deg, ${C.card}, ${C.cardDeep})`,border:`1px solid ${hexA(C.gold,.3)}`}}>
        <div style={{fontSize:10,...mono,color:C.gold,marginBottom:10}}>WHAT YOU TOLD HIM</div>
        {journal.map((r,i)=><div key={i} style={{marginBottom:10}}><div style={{fontSize:11,color:C.textDim,fontStyle:"italic",marginBottom:2}}>{r.q.replace(/"/g,"")}</div><div style={{fontSize:13,color:C.text}}>{r.a}</div></div>)}
      </div>}
      <div style={{marginTop:16,padding:14,borderRadius:12,background:hexA(C.cyan,.06),border:`1px solid ${hexA(C.cyan,.3)}`}}>
        <div style={{fontSize:10,...mono,color:C.cyan,marginBottom:6}}>THE SEED · carried forward</div>
        <p style={{fontSize:12,color:C.text,lineHeight:1.5,margin:0}}>Right now you only know how to do — grind, chase, push toward the crown. The shadow walks beside you whispering you're behind. You'll face him again, for real, deeper in the forest. That's where you'll learn what he could not tell you here: how to <em>be</em> a king before the kingdom exists.</p>
      </div>
      <div style={{marginTop:16,textAlign:"center"}}><Btn accent={C.phoenix} ghost onClick={restart}>↻ Replay the encounter</Btn></div>
    </div>
  </div>;
}
function Row({label,value}){return <div style={{display:"flex",justifyContent:"space-between",gap:12,padding:"9px 0",borderBottom:`1px solid ${hexA(C.phoenix,.12)}`}}><span style={{fontSize:10,...mono,color:C.textDim,textTransform:"uppercase"}}>{label}</span><span style={{fontSize:12,color:C.text,textAlign:"right",maxWidth:"58%"}}>{value}</span></div>;}

/* ===== root ============================================================== */
export default function MilestoneQuestShadow(){
  const [state,setState]=useState(load);
  useEffect(()=>persist(state),[state]);
  const update=fn=>setState(s=>{const n=JSON.parse(JSON.stringify(s));fn(n);return n;});
  const theme=THEMES[state.themeId]||THEMES.neon;
  const phase=state.phase;
  const setPhase=p=>update(s=>{s.phase=p;});
  return <div style={{minHeight:"100vh",background:C.black,color:C.text,fontFamily:"'Inter Tight', system-ui, sans-serif"}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,600;9..144,0,700;9..144,1,500&family=Inter+Tight:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap');
      @keyframes sFade{from{opacity:0}to{opacity:1}}
      @keyframes sRise{0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)}}
      @keyframes sIdle{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
      @keyframes sWalk{0%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-3px) rotate(2deg)}100%{transform:translateY(0) rotate(-2deg)}}
      @keyframes sSlump{0%,100%{transform:translateY(2px)}50%{transform:translateY(5px)}}
      @keyframes sPulse{0%,100%{transform:scale(1);opacity:.7}50%{transform:scale(1.06);opacity:1}}
      @keyframes sEmber{0%{opacity:0;transform:translateY(0) scale(1)}20%{opacity:.9}100%{opacity:0;transform:translateY(-80px) scale(.4)}}
      @keyframes sShard{0%{opacity:0;transform:translateY(10px) scale(.8)}15%{opacity:.85}70%{opacity:.5}100%{opacity:0;transform:translateY(-120px) scale(1.1)}}
      @keyframes sTwinkle{0%,100%{opacity:.2}50%{opacity:.7}}
      *{-webkit-tap-highlight-color:transparent}
      button,textarea{font-family:inherit}
      textarea::placeholder{color:${C.locked}}
      @media (prefers-reduced-motion: reduce){*{animation:none!important}}
    `}</style>
    {phase==="recap"&&<Recap theme={theme} state={state} go={()=>setPhase("encounter")}/>}
    {phase==="encounter"&&<Encounter theme={theme} state={state} update={update} onMirror={()=>setPhase("mirror")}/>}
    {phase==="mirror"&&<Mirror theme={theme} state={state} onOrigin={()=>setPhase("doorbe")}/>}
    {phase==="doorbe"&&<DoOrBe theme={theme} state={state} update={update} onOrigin={()=>setPhase("origin")}/>}
    {phase==="origin"&&<Origin theme={theme} onCoach={()=>setPhase("coach")}/>}
    {phase==="coach"&&<Coaching theme={theme} state={state} update={update} onAttach={()=>setPhase("attach")}/>}
    {phase==="attach"&&<Attach theme={theme} state={state} onDone={()=>setPhase("handoff")}/>}
    {phase==="handoff"&&<Handoff theme={theme} state={state} restart={()=>setState(blank())}/>}
  </div>;
}

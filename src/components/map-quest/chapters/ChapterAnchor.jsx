import React, { useState, useEffect, useRef, useCallback } from "react";

/* =============================================================================
   MILESTONE QUEST — CHAPTER ONE: "THE ANCHOR"
   Two movements:
   MOVEMENT 1 — THE TABLE (Dad's house): walk to your father's home, sit at the
     table, and Dad does LIVE COACHING (reads your typed answers, digs deeper) to
     surface your real WHY beneath the surface goal. Quest named in conversation.
   MOVEMENT 2 — THE TREELINE: Dad walks you to where the city ends, teaches the
     anchor lesson (a ship drifts without an anchor), asks "who is YOUR anchor in
     real life?", and that reflection UNLOCKS your first essence. Four stay locked.
   Then cross into the forest -> hands off to Chapter Two (the Shadow).
   Built to the Shadow-chapter standard: SVG cast, cinematic scenes, live ICF coaching.
   ============================================================================= */

const C={black:"#000000",night:"#04020b",city:"#0a0618",forest:"#04100b",card:"#0b0712",cardDeep:"#080510",phoenix:"#7B2CFF",magenta:"#D11EFF",hotPink:"#FF3EDB",cyan:"#00F0FF",mint:"#00FFBF",gold:"#FFC94D",amber:"#FFA94D",text:"#F2F0F4",textDim:"#9a8fb0",locked:"#3a3450",danger:"#FF5470",leaf:"#1f7a4d",wood:"#3a2415"};
const hexA=(h,a)=>{const x=h.replace("#","");return `rgba(${parseInt(x.slice(0,2),16)},${parseInt(x.slice(2,4),16)},${parseInt(x.slice(4,6),16)},${a})`;};

const ARROW="\u2192", DASH="\u2014", DOTS="\u2026", LOCK="\uD83D\uDD12", BULLET="\u00b7";

const THEMES={
  neon:{ id:"neon", label:"Neon Dominion", accent:C.phoenix,
    essences:{
      Radiance:{name:"Radiance",color:C.danger,glyph:"\u2600",meaning:"Own your story without its weight.",beBy:"choosing responsibility over blame"},
      Love:{name:"Love",color:C.hotPink,glyph:"\u2665",meaning:"Presence, not escape.",beBy:"choosing presence over escape"},
      Joy:{name:"Joy",color:C.mint,glyph:"\u2738",meaning:"Aliveness in the climb.",beBy:"finding lightness in the grind"},
      Power:{name:"Power",color:C.cyan,glyph:"\u2726",meaning:"You complete what you start.",beBy:"shipping the imperfect thing"},
      Majesty:{name:"Majesty",color:C.gold,glyph:"\u2654",meaning:"Power that needs no audience.",beBy:"acting without needing to impress"},
      Leader:{name:"Leader",color:C.magenta,glyph:"\u265b",meaning:"Courage with wisdom.",beBy:"responding instead of reacting"},
      Connector:{name:"Connector",color:C.cyan,glyph:"\u274b",meaning:"You make people feel seen.",beBy:"making someone feel seen"},
      Inspiring:{name:"Inspiring",color:C.phoenix,glyph:"\u273a",meaning:"Your becoming lights the way.",beBy:"showing others it's possible"},
    } },
  foundry:{ id:"foundry", label:"The Foundry", accent:C.mint,
    essences:{
      Leader:{name:"Leader",color:C.magenta,glyph:"\u265b",meaning:"Courage with wisdom; people follow.",beBy:"responding instead of snapping"},
      Connector:{name:"Connector",color:C.cyan,glyph:"\u274b",meaning:"Presence over performance.",beBy:"making someone feel seen"},
      Confident:{name:"Confident",color:C.gold,glyph:"\u2666",meaning:"Power through proof, not appearance.",beBy:"acting from enough, not panic"},
      Magnetic:{name:"Magnetic",color:C.hotPink,glyph:"\u273a",meaning:"Finished work pulls opportunity in.",beBy:"completing what you started"},
      Momentum:{name:"Momentum",color:C.mint,glyph:"\u27a4",meaning:"Motion beats mood.",beBy:"moving before you feel ready"},
      SelfTrust:{name:"Self-trust",color:C.phoenix,glyph:"\u25c8",meaning:"You keep your word to yourself.",beBy:"keeping a promise to yourself"},
      Transformation:{name:"Transformation",color:C.cyan,glyph:"\u2726",meaning:"You become what the goal requires.",beBy:"rising instead of playing small"},
      Legend:{name:"Legend",color:C.gold,glyph:"\u2605",meaning:"A story worth telling.",beBy:"playing bigger than fear"},
    } },
};
const DAD={ name:"Your Father", color:C.amber };

const SAVE_KEY="milestone-quest:anchor-v1";
const blank=()=>({ phase:"title", themeId:"neon", quest:"", surfaceWhy:"", deepWhy:"", whyReflections:[], anchorName:"", vulnerability:"", grantedEssence:null, lockedEssences:[], anchorMentorUnlocked:false });
function load(){try{const r=localStorage.getItem(SAVE_KEY);if(!r)return blank();return {...blank(),...JSON.parse(r)};}catch{return blank();}}
function persist(s){try{localStorage.setItem(SAVE_KEY,JSON.stringify(s));}catch{}}
const essList=(t)=>Object.values(t.essences);
const essByName=(t,n)=>Object.values(t.essences).find(e=>e.name===n);

const mono={fontFamily:"'JetBrains Mono', monospace"};
const fsWrap=(bg)=>({position:"relative",minHeight:"100vh",background:bg,overflow:"hidden"});
function Btn({children,onClick,disabled,accent=C.magenta,ghost,full,small}){return <button onClick={onClick} disabled={disabled} style={{width:full?"100%":"auto",padding:small?"8px 14px":"13px 22px",borderRadius:12,...mono,fontSize:small?12:14,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",cursor:disabled?"not-allowed":"pointer",color:disabled?C.textDim:ghost?accent:"#04020b",background:disabled?"rgba(255,255,255,.04)":ghost?"transparent":`linear-gradient(135deg, ${accent}, ${C.hotPink})`,border:ghost?`1px solid ${hexA(accent,.5)}`:"none",boxShadow:disabled||ghost?"none":`0 0 18px ${hexA(accent,.5)}`,opacity:disabled?.55:1,transition:"transform .12s"}} onMouseDown={e=>!disabled&&(e.currentTarget.style.transform="scale(.96)")} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>{children}</button>;}
const choiceBtn=(c=C.amber)=>({textAlign:"left",padding:"14px 16px",borderRadius:14,border:`1px solid ${hexA(c,.4)}`,background:`linear-gradient(160deg, ${C.card}, ${C.cardDeep})`,color:C.text,cursor:"pointer",fontSize:14,fontFamily:"'Inter Tight', sans-serif",width:"100%"});
const ta={width:"100%",boxSizing:"border-box",padding:"12px 14px",borderRadius:12,background:"rgba(255,255,255,.04)",border:`1px solid ${hexA(C.amber,.4)}`,color:C.text,fontSize:15,fontFamily:"'Inter Tight', sans-serif",outline:"none",resize:"none",minHeight:72};
const inp={...ta,minHeight:"auto"};
const lbl={display:"block",fontSize:11,...mono,color:C.amber,marginBottom:6};

/* ===== SVG cast ========================================================== */
function HeroSprite({size=120,walking=false,glow=C.cyan}){return <svg width={size} height={size*1.4} viewBox="0 0 100 140" style={{filter:`drop-shadow(0 0 10px ${hexA(glow,.7)})`,animation:walking?"aWalk .4s ease-in-out infinite":"aIdle 3.2s ease-in-out infinite"}}>
  <defs><radialGradient id="hcoreA" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor={hexA(glow,.9)}/><stop offset="100%" stopColor={hexA(glow,0)}/></radialGradient></defs>
  <ellipse cx="50" cy="134" rx="26" ry="5" fill={hexA(glow,.25)}/>
  <path d="M50 34 C34 40 30 70 28 104 C26 124 36 130 50 130 C64 130 74 124 72 104 C70 70 66 40 50 34 Z" fill={hexA("#0a0f1c",.95)} stroke={hexA(glow,.6)} strokeWidth="1.5"/>
  <path d="M50 8 C36 8 30 22 32 38 C38 30 44 28 50 28 C56 28 62 30 68 38 C70 22 64 8 50 8 Z" fill={hexA("#0a0f1c",.98)} stroke={hexA(glow,.7)} strokeWidth="1.5"/>
  <ellipse cx="50" cy="26" rx="9" ry="11" fill="#05070d"/>
  <circle cx="46" cy="25" r="1.6" fill={glow}/><circle cx="54" cy="25" r="1.6" fill={glow}/>
  <circle cx="50" cy="64" r="9" fill="url(#hcoreA)"/><circle cx="50" cy="64" r="3.5" fill={glow}/>
  <path d="M40 48 L50 58 L60 48" fill="none" stroke={hexA(glow,.5)} strokeWidth="1"/>
</svg>;}
function FatherSprite({size=132,seated=false}){const color=C.amber;return <svg width={size} height={size*1.4} viewBox="0 0 100 140" style={{filter:`drop-shadow(0 0 12px ${hexA(color,.55)})`,animation:"aIdle 4.2s ease-in-out infinite"}}>
  <ellipse cx="50" cy="134" rx="29" ry="5" fill={hexA(color,.2)}/>
  <path d={seated?"M50 40 C30 46 26 84 26 110 C26 124 40 126 50 126 C60 126 74 124 74 110 C74 84 70 46 50 40 Z":"M50 32 C28 40 24 78 24 112 C24 128 40 132 50 132 C60 132 76 128 76 112 C76 78 72 40 50 32 Z"} fill={hexA("#16100a",.96)} stroke={hexA(color,.55)} strokeWidth="1.5"/>
  <path d="M50 6 C34 6 28 22 30 40 C36 32 44 30 50 30 C56 30 64 32 70 40 C72 22 66 6 50 6 Z" fill={hexA("#16100a",.98)} stroke={hexA(color,.6)} strokeWidth="1.5"/>
  <ellipse cx="50" cy="24" rx="9" ry="11" fill="#0a0703"/>
  <circle cx="46" cy="23" r="1.6" fill={color}/><circle cx="54" cy="23" r="1.6" fill={color}/>
  <path d="M43 32 Q50 44 57 32" fill="none" stroke={hexA(color,.4)} strokeWidth="1.3"/>
  <line x1="82" y1="18" x2="82" y2="128" stroke={hexA(color,.7)} strokeWidth="2.5" strokeLinecap="round"/>
  <circle cx="82" cy="20" r="7.5" fill={hexA(color,.25)} stroke={color} strokeWidth="1.5"/>
  <circle cx="82" cy="20" r="3.2" fill={color}><animate attributeName="opacity" values="0.6;1;0.6" dur="2.6s" repeatCount="indefinite"/></circle>
</svg>;}

function Embers({on,color=C.amber,count=12}){if(!on)return null;return <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}}>{Array.from({length:count}).map((_,i)=><div key={i} style={{position:"absolute",left:`${20+(i*41)%60}%`,bottom:"16%",width:3+(i%3),height:3+(i%3),borderRadius:"50%",background:color,boxShadow:`0 0 6px ${color}`,opacity:0,animation:`aEmber ${2.6+(i%3)*0.6}s ease-out ${i*0.18}s infinite`}}/>)}</div>;}

function CityStrip({progress=0,walking=false,houseAhead=false,accent=C.phoenix}){
  const tx=-(progress*48);
  return <div style={{position:"relative",height:240,overflow:"hidden",background:`linear-gradient(180deg, ${C.city} 0%, ${C.black} 100%)`}}>
    {Array.from({length:28}).map((_,i)=><div key={i} style={{position:"absolute",left:`${(i*37)%100}%`,top:`${(i*23)%55}%`,width:2,height:2,borderRadius:"50%",background:hexA([C.cyan,C.magenta,C.gold][i%3],.8),boxShadow:`0 0 4px ${[C.cyan,C.magenta,C.gold][i%3]}`,opacity:.55,animation:`aTwinkle ${2+(i%4)}s ease-in-out ${i*.2}s infinite`}}/>)}
    <div style={{position:"absolute",top:24,right:36,width:46,height:46,borderRadius:"50%",background:`radial-gradient(circle, ${hexA(C.gold,.55)}, transparent 70%)`,boxShadow:`0 0 36px ${hexA(C.gold,.45)}`}}/>
    <div style={{position:"absolute",bottom:38,left:0,height:180,width:"200%",transform:`translateX(${tx}%)`,transition:walking?"none":"transform .4s ease"}}>
      <svg viewBox="0 0 800 180" preserveAspectRatio="none" style={{position:"absolute",bottom:0,width:"100%",height:180}}>{Array.from({length:26}).map((_,i)=>{const w=20+((i*9)%20),x=i*30,h=60+((i*61)%110);const col=[accent,C.cyan,C.magenta][i%3];return <g key={i}><rect x={x} y={180-h} width={w} height={h} fill={hexA(col,.16)} stroke={hexA(col,.45)} strokeWidth=".6"/>{Array.from({length:Math.floor(h/16)}).map((_,j)=><rect key={j} x={x+3} y={180-h+8+j*16} width={w-6} height={4} fill={hexA(col,.5)} opacity={(i*j)%3?.6:.2}/>)}</g>;})}</svg>
      {houseAhead&&<svg viewBox="0 0 800 180" preserveAspectRatio="none" style={{position:"absolute",bottom:0,left:"62%",width:"18%",height:180}}><rect x="20" y="70" width="90" height="110" fill={hexA("#16100a",.95)} stroke={hexA(C.amber,.6)} strokeWidth="1.5"/><polygon points="14,70 65,30 116,70" fill={hexA("#16100a",.98)} stroke={hexA(C.amber,.6)} strokeWidth="1.5"/><rect x="48" y="100" width="34" height="34" fill={hexA(C.amber,.55)}><animate attributeName="opacity" values=".4;.8;.4" dur="3s" repeatCount="indefinite"/></rect></svg>}
    </div>
    <div style={{position:"absolute",bottom:36,left:0,right:0,height:3,background:`linear-gradient(90deg, ${accent}, ${C.amber})`,boxShadow:`0 0 14px ${hexA(C.cyan,.4)}`}}/>
    <div style={{position:"absolute",bottom:0,left:0,right:0,height:38,background:C.black}}/>
    <div style={{position:"absolute",bottom:40,left:"34%",transform:"translateX(-50%)"}}><HeroSprite size={92} walking={walking}/></div>
  </div>;
}
function TableScene(){return <div style={{position:"relative",height:230,overflow:"hidden",background:`linear-gradient(180deg, ${hexA("#1a0f06",.6)}, ${C.black})`}}>
  <Embers on color={C.amber} count={8}/>
  <div style={{position:"absolute",inset:0,background:`radial-gradient(500px 300px at 50% 35%, ${hexA(C.amber,.14)}, transparent)`}}/>
  <div style={{position:"absolute",bottom:54,left:"26%",transform:"translateX(-50%)"}}><HeroSprite size={96}/></div>
  <div style={{position:"absolute",bottom:54,right:"22%",transform:"translateX(50%) scaleX(-1)"}}><FatherSprite size={108} seated/></div>
  <div style={{position:"absolute",bottom:30,left:"10%",right:"10%",height:26,borderRadius:"6px 6px 2px 2px",background:`linear-gradient(180deg, ${hexA(C.wood,.95)}, ${hexA("#1a0f06",.95)})`,border:`1px solid ${hexA(C.amber,.35)}`,boxShadow:`0 0 20px ${hexA(C.amber,.2)}`}}/>
  <div style={{position:"absolute",bottom:52,left:"50%",transform:"translateX(-50%)"}}><div style={{width:14,height:18,borderRadius:4,background:hexA(C.amber,.3),border:`1px solid ${C.amber}`,boxShadow:`0 0 16px ${hexA(C.amber,.6)}`,animation:"aGlow 2.6s ease-in-out infinite"}}/></div>
  <div style={{position:"absolute",bottom:0,left:0,right:0,height:30,background:C.black}}/>
</div>;}
function TreelineScene(){return <div style={{position:"relative",height:220,overflow:"hidden",background:`linear-gradient(180deg, ${hexA(C.city,.5)}, ${C.forest})`}}>
  {Array.from({length:22}).map((_,i)=><div key={i} style={{position:"absolute",left:`${(i*37)%100}%`,top:`${(i*23)%55}%`,width:2,height:2,borderRadius:"50%",background:hexA(C.cyan,.6),opacity:.45,animation:`aTwinkle ${2+(i%4)}s ease-in-out ${i*.2}s infinite`}}/>)}
  <svg viewBox="0 0 400 120" preserveAspectRatio="none" style={{position:"absolute",bottom:28,left:0,width:"45%",height:84,opacity:.6}}>{Array.from({length:8}).map((_,i)=>{const x=i*48,h=40+((i*37)%50);return <rect key={i} x={x} y={120-h} width={26} height={h} fill={hexA(C.phoenix,.16)} stroke={hexA(C.phoenix,.4)} strokeWidth=".5"/>;})}</svg>
  <svg viewBox="0 0 400 120" preserveAspectRatio="none" style={{position:"absolute",bottom:26,left:"52%",width:"48%",height:84}}>{Array.from({length:14}).map((_,i)=>{const x=i*30,h=46+((i*47)%56);const col=i%2?C.leaf:C.mint;return <polygon key={i} points={`${x+11},${120-h} ${x-4},${120-h*.4} ${x+26},${120-h*.4}`} fill={hexA(col,.2)} stroke={hexA(col,.4)} strokeWidth=".5"/>;})}</svg>
  <div style={{position:"absolute",bottom:24,left:0,right:0,height:3,background:`linear-gradient(90deg, ${C.phoenix}, ${C.leaf})`,boxShadow:`0 0 12px ${hexA(C.cyan,.4)}`}}/>
  <div style={{position:"absolute",bottom:24,left:"32%",transform:"translateX(-50%)"}}><HeroSprite size={92}/></div>
  <div style={{position:"absolute",bottom:24,right:"30%",transform:"translateX(50%) scaleX(-1)"}}><FatherSprite size={104}/></div>
  <div style={{position:"absolute",bottom:0,left:0,right:0,height:26,background:C.black}}/>
</div>;}

const holdBtn=(c)=>({marginTop:8,padding:"15px 28px",borderRadius:999,border:`1.5px solid ${c}`,background:`linear-gradient(135deg, ${hexA(c,.2)}, ${hexA(C.amber,.1)})`,color:C.text,...mono,fontSize:14,fontWeight:700,letterSpacing:1,cursor:"pointer",boxShadow:`0 0 20px ${hexA(c,.4)}`,userSelect:"none"});
function Track({v,a,b}){return <div style={{marginTop:14,height:4,maxWidth:240,margin:"14px auto 0",borderRadius:999,background:"rgba(255,255,255,.06)",overflow:"hidden"}}><div style={{width:`${v*100}%`,height:"100%",background:`linear-gradient(90deg, ${a}, ${b})`,transition:"width .1s"}}/></div>;}
function useTyped(lines,active=true){const key=lines.join("|");const [n,setN]=useState(0);useEffect(()=>{setN(0);},[key]);useEffect(()=>{if(!active)return;if(n>=lines.length)return;const t=setTimeout(()=>setN(v=>v+1),n===0?450:1500);return()=>clearTimeout(t);},[n,key,active]);return [lines.slice(0,n),n>=lines.length];}

function Title({theme,go,pickWorld}){return <div style={fsWrap(`radial-gradient(900px 600px at 50% 15%, ${hexA(theme.accent,.22)}, transparent), ${C.black}`)}>
  <CityStrip progress={0} accent={theme.accent}/>
  <div style={{textAlign:"center",padding:"26px 24px"}}>
    <div style={{fontSize:11,letterSpacing:6,color:C.amber,...mono,marginBottom:10}}>MILESTONE QUEST {BULLET} CHAPTER ONE</div>
    <h1 style={{fontFamily:"'Fraunces', serif",fontSize:34,fontWeight:700,margin:0,lineHeight:1.05,background:`linear-gradient(135deg, ${C.amber}, ${C.hotPink})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>The Anchor</h1>
    <p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",color:C.textDim,marginTop:14,fontSize:15,maxWidth:340,margin:"14px auto 0"}}>Before any man leaves on a quest, he goes to see the one who knows him best.</p>
    <div style={{marginTop:24,display:"flex",flexDirection:"column",gap:12,alignItems:"center"}}>
      <Btn accent={C.amber} onClick={go}>Go see your father {ARROW}</Btn>
      <button onClick={pickWorld} style={{background:"none",border:`1px solid ${hexA(theme.accent,.4)}`,borderRadius:999,padding:"6px 14px",color:theme.accent,cursor:"pointer",...mono,fontSize:11}}>World: {theme.label} {BULLET} change</button>
    </div>
  </div>
</div>;}
function WorldPick({state,set}){return <div style={fsWrap(`radial-gradient(900px 600px at 50% 15%, ${hexA(C.phoenix,.2)}, transparent), ${C.black}`)}>
  <div style={{maxWidth:430,margin:"0 auto",padding:"14vh 22px 0",textAlign:"center"}}>
    <h2 style={{fontFamily:"'Fraunces', serif",fontSize:26,color:C.text,margin:"0 0 6px"}}>Choose Your World</h2>
    <p style={{fontSize:13,color:C.textDim,marginBottom:22}}>Same journey {DASH} different masks, different essences.</p>
    {Object.values(THEMES).map(t=>{const on=state.themeId===t.id;return <div key={t.id} onClick={()=>set(t.id)} style={{padding:18,borderRadius:16,marginBottom:12,cursor:"pointer",textAlign:"left",background:`linear-gradient(160deg, ${C.card}, ${C.cardDeep})`,border:`1px solid ${on?t.accent:C.locked}`,boxShadow:on?`0 0 24px ${hexA(t.accent,.3)}`:"none"}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{flex:1}}><strong style={{fontSize:16,color:on?t.accent:C.text}}>{t.label}{t.id==="neon"&&<span style={{fontSize:9,...mono,color:C.mint,marginLeft:8}}>DEFAULT</span>}</strong></div>{on&&<span style={{color:t.accent}}>{"\u25cf"}</span>}</div></div>;})}
    <Btn full accent={C.amber} onClick={()=>set(state.themeId,true)}>Begin {ARROW}</Btn>
  </div>
</div>;}

function WalkToHouse({theme,onArrive}){
  const [progress,setProgress]=useState(0);const [walking,setWalking]=useState(false);const raf=useRef(null);
  const target=0.6;
  const play=()=>{if(walking||progress>=target)return;setWalking(true);const t0=performance.now();const dur=3200;const step=now=>{const p=Math.min(target,(now-t0)/dur*target);setProgress(p);if(p<target)raf.current=requestAnimationFrame(step);else setWalking(false);};raf.current=requestAnimationFrame(step);};
  useEffect(()=>()=>cancelAnimationFrame(raf.current),[]);
  const there=progress>=target;const started=progress>0;
  return <div style={fsWrap(`radial-gradient(900px 500px at 50% 10%, ${hexA(theme.accent,.18)}, transparent), ${C.black}`)}>
    <CityStrip progress={progress} walking={walking} houseAhead accent={theme.accent}/>
    <div style={{padding:"18px 24px",textAlign:"center"}}>
      {!there?<>
        <p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,color:C.textDim,minHeight:46}}>{progress<0.02?"You've made the decision. There's one person you have to tell first.":progress<0.45?"Through the neon streets, toward the old part of the city\u2026":"His window is still lit. It always is, when you're coming."}</p>
        {!started?<button onClick={play} style={holdBtn(C.amber)}>TAP TO WALK {ARROW}</button>:<div style={{...mono,fontSize:12,color:C.amber,padding:"15px"}}>walking{DOTS}</div>}
        <Track v={progress/target} a={C.amber} b={C.gold}/>
      </>:<div style={{animation:"aFade .5s"}}><p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,color:C.text}}>The door opens before you knock. "I had a feeling," he says. "Sit. I'll put the kettle on."</p><div style={{marginTop:12}}><Btn accent={C.amber} onClick={onArrive}>Sit at the table {ARROW}</Btn></div></div>}
    </div>
  </div>;
}

function TheTable({theme,state,update,onTreeline}){
  const [step,setStep]=useState(0);
  const intro=["\"So. You're really going.\"",`"I went too, once. Came back with scars and a map nobody else could read. Tell me ${DASH} what are you chasing?"`];
  const [shownIntro,introDone]=useTyped(intro,step===0);
  const [quest,setQuest]=useState(state.quest||"");
  const [why,setWhy]=useState(state.surfaceWhy||"");
  return <div style={fsWrap(`radial-gradient(800px 600px at 50% 16%, ${hexA(C.amber,.16)}, transparent), ${C.night}`)}>
    <TableScene/>
    <div style={{position:"relative",zIndex:2,maxWidth:480,margin:"0 auto",padding:"10px 22px 50px"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><FatherSprite size={26}/><strong style={{color:DAD.color,...mono,fontSize:13}}>{DAD.name}</strong><span style={{fontSize:10,color:C.textDim,...mono}}>your anchor</span></div>
      {step===0&&<>
        <div style={{minHeight:80}}>{shownIntro.map((t,k)=><p key={k} style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,lineHeight:1.55,margin:"0 0 9px",color:k===shownIntro.length-1?C.text:C.textDim,animation:"aFade .6s"}}>{t}</p>)}</div>
        {introDone&&<Btn full accent={C.amber} onClick={()=>setStep(1)}>Tell him {ARROW}</Btn>}
      </>}
      {step===1&&<div style={{animation:"aRise .5s"}}>
        <label style={lbl}>YOUR QUEST {BULLET} the treasure you're after</label>
        <input value={quest} onChange={e=>setQuest(e.target.value)} placeholder="Sell 200 accounts / launch the app / publish the book…" style={inp}/>
        <div style={{marginTop:14}}><Btn full accent={C.amber} disabled={!quest.trim()} onClick={()=>{update(s=>{s.quest=quest.trim();});setStep(2);}}>{quest.trim()?`That's it ${ARROW}`:"Name it first"}</Btn></div>
      </div>}
      {step===2&&<div style={{animation:"aRise .5s"}}>
        <p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,color:C.text,marginBottom:10}}>"{state.quest}." He nods slowly. "Alright. But that's the what. Why that? Why now?"</p>
        <label style={lbl}>YOUR WHY {BULLET} first answer, the honest one</label>
        <textarea value={why} onChange={e=>setWhy(e.target.value)} placeholder="Because…" style={ta}/>
        <div style={{marginTop:14}}><Btn full accent={C.amber} disabled={!why.trim()} onClick={()=>{update(s=>{s.surfaceWhy=why.trim();});setStep(3);}}>Tell him why {ARROW}</Btn></div>
      </div>}
      {step===3&&<DadCoaching theme={theme} state={state} update={update} onDone={()=>setStep(4)}/>}
      {step===4&&<TheWhy theme={theme} state={state} onTreeline={onTreeline}/>}
    </div>
  </div>;
}

function DadCoaching({theme,state,update,onDone}){
  const [kingText,setKingText]=useState("");
  const [typing,setTyping]=useState(false);
  const [input,setInput]=useState("");
  const [round,setRound]=useState(0);
  const [history,setHistory]=useState([]);
  const [refl,setRefl]=useState([]);
  const maxRounds=3;
  const scrollRef=useRef(null);
  const opener=`"${state.surfaceWhy}" ${DASH} he repeats it back, gently. "I believe you. But go under it. If you got that, what would it finally give you?"`;
  useEffect(()=>{setKingText(opener);},[]);
  const sysPrompt=`You are the FATHER in a cyberpunk personal-development RPG — the player's ANCHOR. Warm, weathered, a former traveler who went on his own quest and came back with scars. You are at your kitchen table with your child, who is about to leave on a venture. They told you their quest ("${state.quest}") and a first, surface WHY ("${state.surfaceWhy}").

Your job: use warm, ICF-style coaching (Evokes Awareness) to help them find their DEEPER why — the real one under the first answer. Read what they ACTUALLY wrote, reflect it back so they feel seen, then ask ONE open question that goes a layer deeper ("if you had that, what would it give you?", "who are you doing this for?", "what are you afraid happens if you don't?", "when did this start?").

RULES: Stay fully in character as a loving but honest father. First person, warm, a little gruff, never preachy. 2-3 sentences. Wrap speech in quotes. Do NOT solve it for them — guide them to their own deeper why. Never mention AI/models/prompts. If they wrote "I'd rather not say" or skipped, honor it warmly and ask something gentler.`;
  const fallbackLine=(r)=>[
    `"Mm. And if you had that ${DASH} really had it ${DASH} what would it let you finally feel? That's the part most folks never say out loud."`,
    `"Who are you really doing this for? Picture them. It's alright if the answer surprises you."`,
    `"There it is. That's the why that'll carry you when the road gets dark. Hold onto that one."`,
  ][Math.min(r,2)];
  const callDad=useCallback(async(userText)=>{
    setTyping(true);const nh=[...history,{role:"user",content:userText}];
    try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:sysPrompt,messages:nh})});const data=await res.json();const text=(data.content||[]).filter(b=>b.type==="text").map(b=>b.text).join("").trim();const line=text||fallbackLine(round);setHistory([...nh,{role:"assistant",content:line}]);setKingText(line);}catch(e){const line=fallbackLine(round);setHistory([...nh,{role:"assistant",content:line}]);setKingText(line);}
    setTyping(false);
  },[history,round,sysPrompt]);
  const submit=(skip)=>{const userText=skip?"I'd rather not say.":input.trim();if(!skip&&!userText)return;
    const updated=[...refl,{q:kingText,a:userText}];setRefl(updated);
    if(round===maxRounds-1)update(s=>{s.deepWhy=userText;s.whyReflections=updated;});
    setInput("");const nr=round+1;setRound(nr);
    if(nr>=maxRounds){update(s=>{s.whyReflections=updated;});onDone();}else callDad(userText);
  };
  useEffect(()=>{if(scrollRef.current)scrollRef.current.scrollTop=scrollRef.current.scrollHeight;},[kingText,typing]);
  return <div style={{animation:"aFade .5s"}}>
    <div style={{textAlign:"center",marginBottom:8}}><div style={{fontSize:11,letterSpacing:3,color:C.amber,...mono}}>HE DIGS FOR THE REAL WHY</div></div>
    <div ref={scrollRef} style={{minHeight:110,maxHeight:180,overflowY:"auto",marginBottom:12}}><p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,lineHeight:1.55,color:C.text,animation:"aFade .5s"}}>{typing?<Dots/>:kingText}</p></div>
    <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Go deeper…" style={ta} disabled={typing}/>
    <div style={{display:"flex",gap:8,marginTop:10,alignItems:"center"}}>
      <button onClick={()=>submit(true)} disabled={typing} style={{...choiceBtn(C.locked),width:"auto",fontSize:12,padding:"10px 14px",color:C.textDim}}>I'd rather not say</button>
      <div style={{flex:1}}/>
      <Btn accent={C.amber} disabled={typing||!input.trim()} onClick={()=>submit(false)}>Answer</Btn>
    </div>
    <div style={{textAlign:"center",fontSize:10,color:C.textDim,...mono,marginTop:10}}>Round {round+1} of {maxRounds} {BULLET} he reads what you write</div>
  </div>;
}
function Dots(){return <span style={{color:C.amber}}>{"\u2022 \u2022 \u2022"}<span style={{...mono,fontSize:12,color:C.textDim,marginLeft:8}}>he's listening{DOTS}</span></span>;}

function TheWhy({theme,state,onTreeline}){
  const [stage,setStage]=useState(0);
  useEffect(()=>{if(stage<3){const t=setTimeout(()=>setStage(stage+1),stage===0?600:1100);return()=>clearTimeout(t);}},[stage]);
  return <div style={{animation:"aRise .5s",textAlign:"center",paddingTop:8}}>
    <Embers on color={C.amber} count={10}/>
    <div style={{fontSize:11,letterSpacing:3,color:C.amber,...mono,marginBottom:10}}>YOUR WHY {BULLET} UNLOCKED</div>
    {stage>=1&&<div style={{padding:18,borderRadius:16,background:`linear-gradient(135deg, ${hexA(C.amber,.16)}, ${C.cardDeep})`,border:`1.5px solid ${C.amber}`,boxShadow:`0 0 26px ${hexA(C.amber,.3)}`,marginBottom:14,animation:"aGlow 2.6s ease-in-out infinite"}}>
      <p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:17,color:C.text,margin:0,lineHeight:1.5}}>"{state.deepWhy||state.surfaceWhy}"</p>
    </div>}
    {stage>=2&&<p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:15,color:C.textDim,marginBottom:18,animation:"aFade .6s"}}>"That's the one. The quest is the map. <span style={{color:C.amber}}>That</span> is the engine. Come {DASH} walk with me to where the city ends. There's something I need to show you before you go."</p>}
    {stage>=2&&<Btn full accent={C.amber} onClick={onTreeline}>Walk to the treeline {ARROW}</Btn>}
  </div>;
}

/* animated ship-on-ocean metaphor: storm tosses the ship, then the anchor
   drops, chain pulls taut, ship steadies. phase 0 storm, 1 anchor drops, 2 steady */
function AnchorMetaphor({phase}){
  return <div style={{position:"relative",height:"38vh",minHeight:240,overflow:"hidden",background:`linear-gradient(180deg, ${hexA("#02060f",1)} 0%, ${hexA("#041025",1)} 55%, ${hexA("#020812",1)} 100%)`}}>
    {/* storm sky */}
    {Array.from({length:18}).map((_,i)=><div key={i} style={{position:"absolute",left:`${(i*43)%100}%`,top:`${(i*17)%40}%`,width:2,height:2,borderRadius:"50%",background:hexA(C.cyan,phase>=2?.5:.2),opacity:phase>=2?.6:.25,transition:"all 1s"}}/>)}
    {/* lightning flashes during storm */}
    {phase<2&&<div style={{position:"absolute",inset:0,background:hexA("#fff",.0),animation:"aLightning 3.5s ease-in-out infinite"}}/>}
    {/* ocean */}
    <svg viewBox="0 0 400 200" preserveAspectRatio="none" style={{position:"absolute",bottom:0,width:"100%",height:"58%"}}>
      <defs><linearGradient id="seaA" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={hexA(C.cyan,.25)}/><stop offset="100%" stopColor={hexA("#02060f",.9)}/></linearGradient></defs>
      <path d="M0 60 Q50 40 100 60 T200 60 T300 60 T400 60 L400 200 L0 200 Z" fill="url(#seaA)"><animate attributeName="d" values="M0 60 Q50 40 100 60 T200 60 T300 60 T400 60 L400 200 L0 200 Z;M0 60 Q50 78 100 60 T200 60 T300 60 T400 60 L400 200 L0 200 Z;M0 60 Q50 40 100 60 T200 60 T300 60 T400 60 L400 200 L0 200 Z" dur={phase>=2?"6s":"2.2s"} repeatCount="indefinite"/></path>
      <path d="M0 75 Q60 95 120 75 T240 75 T360 75 T480 75 L480 200 L0 200 Z" fill={hexA(C.phoenix,.12)}><animate attributeName="d" values="M0 75 Q60 95 120 75 T240 75 T360 75 T480 75 L480 200 L0 200 Z;M0 75 Q60 58 120 75 T240 75 T360 75 T480 75 L480 200 L0 200 Z;M0 75 Q60 95 120 75 T240 75 T360 75 T480 75 L480 200 L0 200 Z" dur={phase>=2?"7s":"2.6s"} repeatCount="indefinite"/></path>
    </svg>
    {/* the SHIP — rocks wildly in storm, steadies when anchored */}
    <div style={{position:"absolute",left:"50%",top:phase>=2?"34%":"30%",transform:"translateX(-50%)",transition:"top .8s",animation:phase>=2?"aShipCalm 5s ease-in-out infinite":"aShipStorm 1.6s ease-in-out infinite"}}>
      <svg width="120" height="100" viewBox="0 0 120 100">
        {/* mast + sail */}
        <line x1="60" y1="12" x2="60" y2="58" stroke={hexA(C.amber,.8)} strokeWidth="2"/>
        <path d="M62 16 L92 44 L62 50 Z" fill={hexA(C.amber,.35)} stroke={hexA(C.amber,.7)} strokeWidth="1"/>
        <path d="M58 18 L34 44 L58 48 Z" fill={hexA(C.amber,.2)} stroke={hexA(C.amber,.5)} strokeWidth="1"/>
        {/* hull */}
        <path d="M30 58 L90 58 L80 76 L40 76 Z" fill={hexA("#16100a",.98)} stroke={C.amber} strokeWidth="1.5"/>
        {/* glowing lantern on the ship = the traveler */}
        <circle cx="60" cy="50" r="3.5" fill={C.cyan}><animate attributeName="opacity" values=".6;1;.6" dur="2s" repeatCount="indefinite"/></circle>
      </svg>
      {/* anchor chain dropping */}
      {phase>=1&&<svg width="40" height="120" viewBox="0 0 40 120" style={{position:"absolute",left:"50%",top:"66px",transform:"translateX(-50%)"}}>
        <line x1="20" y1="0" x2="20" y2={phase>=2?"92":"40"} stroke={hexA(C.gold,.8)} strokeWidth="2" strokeDasharray="4 3" style={{transition:"all .8s"}}><animate attributeName="y2" values={phase>=2?"40;92":"0;40"} dur=".8s" fill="freeze"/></line>
        {/* anchor shape */}
        <g transform={`translate(20,${phase>=2?98:46})`} style={{transition:"all .8s"}}>
          <circle cx="0" cy="-6" r="3" fill="none" stroke={C.gold} strokeWidth="1.6"/>
          <line x1="0" y1="-3" x2="0" y2="10" stroke={C.gold} strokeWidth="1.8"/>
          <line x1="-7" y1="2" x2="7" y2="2" stroke={C.gold} strokeWidth="1.8"/>
          <path d="M-8 6 Q-8 12 0 12 Q8 12 8 6" fill="none" stroke={C.gold} strokeWidth="1.8"/>
        </g>
      </svg>}
      {/* steady glow ring — centered on the chain/anchor, rides with the ship */}
      {phase>=2&&<div style={{position:"absolute",left:"50%",top:"150px",transform:"translate(-50%,-50%)",width:84,height:84,borderRadius:"50%",border:`1px solid ${hexA(C.gold,.4)}`,boxShadow:`0 0 30px ${hexA(C.gold,.4)}`,animation:"aPulseC 2.6s ease-in-out infinite",pointerEvents:"none"}}/>}
    </div>
    <div style={{position:"absolute",bottom:0,left:0,right:0,height:40,background:`linear-gradient(180deg, transparent, ${C.black})`}}/>
  </div>;
}

function TheTreeline({theme,state,update,onCross}){
  // sub-flow: 0 metaphor (animated, with revealing bullets), 1 name anchor,
  // 2 vulnerability question, 3 the explosive Love unlock
  const [step,setStep]=useState(0);
  const [anchor,setAnchor]=useState(state.anchorName||"");
  const [vuln,setVuln]=useState("");
  return <div style={fsWrap(`radial-gradient(800px 600px at 50% 8%, ${hexA(C.amber,.12)}, transparent), ${C.forest}`)}>
    {step===0&&<MetaphorLesson onDone={()=>setStep(1)}/>}
    {step>0&&<TreelineScene/>}
    {step>0&&<div style={{position:"relative",zIndex:2,maxWidth:480,margin:"0 auto",padding:"10px 22px 50px"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><FatherSprite size={26}/><strong style={{color:DAD.color,...mono,fontSize:13}}>{DAD.name}</strong><span style={{fontSize:10,color:C.textDim,...mono}}>the anchor lesson</span></div>
      {step===1&&<div style={{animation:"aRise .5s"}}>
        <p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,color:C.text,marginBottom:12}}>"I was lucky. I had mine. So tell me {DASH} who's yours? Not in this forest. In your real life. The one who keeps you from drifting."</p>
        <label style={lbl}>YOUR ANCHOR {BULLET} a real person</label>
        <input value={anchor} onChange={e=>setAnchor(e.target.value)} placeholder="My dad / my mom / a friend…" style={inp}/>
        <div style={{marginTop:14}}><Btn full accent={C.amber} disabled={!anchor.trim()} onClick={()=>{update(s=>{s.anchorName=anchor.trim();});setStep(2);}}>{anchor.trim()?`They know you ${ARROW}`:"Name your anchor"}</Btn></div>
      </div>}
      {step===2&&<div style={{animation:"aRise .5s"}}>
        <p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,color:C.text,marginBottom:6}}>"{state.anchorName}." He smiles. "Then let me ask you something harder."</p>
        <p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,color:C.amber,marginBottom:12,lineHeight:1.5}}>"Why them? What is it about {state.anchorName} that holds you steady? Say the thing you don't usually say out loud."</p>
        <label style={lbl}>OPEN UP {BULLET} the honest answer</label>
        <textarea value={vuln} onChange={e=>setVuln(e.target.value)} placeholder={`What ${state.anchorName} means to you…`} style={ta}/>
        <div style={{display:"flex",gap:8,marginTop:12,alignItems:"center"}}>
          <button onClick={()=>{update(s=>{s.vulnerability="";});setStep(3);}} style={{...choiceBtn(C.locked),width:"auto",fontSize:12,padding:"10px 14px",color:C.textDim}}>Too much to say</button>
          <div style={{flex:1}}/>
          <Btn accent={C.hotPink} disabled={!vuln.trim()} onClick={()=>{update(s=>{s.vulnerability=vuln.trim();});setStep(3);}}>Say it</Btn>
        </div>
      </div>}
      {step===3&&<LoveUnlock theme={theme} state={state} onCross={onCross}/>}
    </div>}
  </div>;
}

/* the animated metaphor + revealing benefit bullets */
function MetaphorLesson({onDone}){
  const [phase,setPhase]=useState(0);
  const [bulletN,setBulletN]=useState(0);
  const narration=["\"Out there, you're a ship. And the sea doesn't care where you're going.\"","\"A storm hits. The wind throws you. You row harder, but you're just spinning \u2014 moving everywhere, arriving nowhere.\"","\"Then \u2014 you drop anchor. And everything changes.\""];
  const [shown,narrDone]=useTyped(narration.slice(0,phase+1),true);
  const bullets=[
    "It holds you steady when the storm hits",
    "It stops you drifting somewhere you never meant to go",
    "It isn't the loudest voice \u2014 it's the steady one",
    "Anchored, you can finally move with purpose",
  ];
  // advance phases: storm -> anchor drops -> steady, then reveal bullets
  useEffect(()=>{const seq=[setTimeout(()=>setPhase(1),3200),setTimeout(()=>setPhase(2),5200)];return()=>seq.forEach(clearTimeout);},[]);
  useEffect(()=>{if(phase<2)return;if(bulletN>=bullets.length)return;const t=setTimeout(()=>setBulletN(bulletN+1),900);return()=>clearTimeout(t);},[phase,bulletN]);
  const ready=phase>=2&&bulletN>=bullets.length;
  return <div style={{...fsWrap(C.black),display:"flex",flexDirection:"column"}}>
    <AnchorMetaphor phase={phase}/>
    <div style={{flex:1,maxWidth:480,margin:"0 auto",width:"100%",padding:"8px 24px 40px",boxSizing:"border-box"}}>
      <div style={{minHeight:64}}>{shown.map((t,k)=><p key={k} style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,lineHeight:1.55,margin:"0 0 8px",color:k===shown.length-1?C.text:C.textDim,animation:"aFade .6s"}}>{t}</p>)}</div>
      {phase>=2&&<div style={{marginTop:8,display:"flex",flexDirection:"column",gap:8}}>
        {bullets.slice(0,bulletN).map((b,k)=><div key={k} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:hexA(C.gold,.07),border:`1px solid ${hexA(C.gold,.3)}`,animation:"aRise .5s"}}>
          <span style={{color:C.gold,fontSize:14}}>{"\u2693"}</span><span style={{fontSize:14,color:C.text}}>{b}</span>
        </div>)}
      </div>}
      {ready&&<div style={{marginTop:16,animation:"aFade .6s"}}><Btn full accent={C.amber} onClick={onDone}>{`"${DASH}So how do I find mine?" `}{ARROW}</Btn></div>}
    </div>
  </div>;
}

/* LOVE earned through vulnerability -> level-up explosion */
function LoveUnlock({theme,state,onCross}){
  const granted=grantedEssenceFor(theme);
  const gE=essByName(theme,granted);
  const rest=essList(theme).map(e=>e.name).filter(n=>n!==granted);
  const lockedFour=rest.slice(0,4);
  const opened=!!state.vulnerability;
  // stages: 0 dad responds, 1 BOOM explosion, 2 essence card, 3 locked four, 4 go
  const [stage,setStage]=useState(0);
  useEffect(()=>{const seq=[setTimeout(()=>setStage(1),1600),setTimeout(()=>setStage(2),2400),setTimeout(()=>setStage(3),3600),setTimeout(()=>setStage(4),4400)];return()=>seq.forEach(clearTimeout);},[]);
  return <div style={{textAlign:"center",position:"relative"}}>
    {/* explosion layer */}
    {stage>=1&&<Explosion color={gE?gE.color:C.hotPink}/>}
    {stage===0&&<p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,color:C.text,animation:"aFade .6s",padding:"10px 0"}}>{opened?`"${"\u2026"}You just told me something most men keep buried their whole lives." He puts a hand on your shoulder. "That took something."`:`"You couldn't find the words. That's alright. The fact that it's too big to say${"\u2026"} that tells me everything."`}</p>}
    {stage>=1&&<div style={{position:"relative",zIndex:2}}>
      <div style={{fontSize:11,letterSpacing:4,color:gE?gE.color:C.hotPink,...mono,marginBottom:6,animation:"aPop .5s ease"}}>{"\u2726"} ESSENCE UNLOCKED {"\u2726"}</div>
      {stage>=2&&gE&&<div style={{display:"inline-flex",flexDirection:"column",alignItems:"center",gap:6,padding:"22px 28px",borderRadius:20,margin:"6px 0 14px",background:`radial-gradient(circle at 50% 30%, ${hexA(gE.color,.3)}, ${C.cardDeep})`,border:`2px solid ${gE.color}`,boxShadow:`0 0 50px ${hexA(gE.color,.6)}`,animation:"aBurstIn .6s cubic-bezier(.2,1.5,.4,1)"}}>
        <div style={{fontSize:48,filter:`drop-shadow(0 0 18px ${gE.color})`,animation:"aFloat 3s ease-in-out infinite"}}>{gE.glyph}</div>
        <strong style={{fontSize:26,color:gE.color,fontFamily:"'Fraunces', serif"}}>{gE.name}</strong>
        <div style={{fontSize:12,color:C.text,maxWidth:240}}>{gE.meaning}</div>
        <div style={{fontSize:9,...mono,color:C.mint,marginTop:4}}>EARNED BY OPENING UP {BULLET} NOT BY BEING STRONG</div>
      </div>}
      {stage>=2&&<p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:14,color:C.textDim,maxWidth:360,margin:"0 auto 14px"}}>"That's Love. You don't earn it by being strong. You earn it the second you let yourself be seen."</p>}
    </div>}
    {stage>=3&&<div style={{position:"relative",zIndex:2,animation:"aFade .6s"}}>
      <p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:13,color:C.textDim,margin:"4px 0 10px"}}>"The other four? Those you unlock out there {DASH} by <span style={{color:C.text}}>being</span> them when it counts."</p>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>{lockedFour.map((name,k)=>{const e=essByName(theme,name);if(!e)return null;return <div key={name} style={{display:"flex",alignItems:"center",gap:10,padding:10,borderRadius:10,background:"rgba(255,255,255,.03)",border:`1px dashed ${C.locked}`,textAlign:"left",opacity:stage>=3?1:0,transition:`opacity .4s ${k*.08}s`}}>
        <div style={{fontSize:18,filter:"grayscale(1)",opacity:.5}}>{LOCK}</div>
        <div style={{flex:1}}><strong style={{fontSize:13,color:C.textDim}}>{e.name}</strong><div style={{fontSize:9,color:C.locked,...mono}}>UNLOCK BY {e.beBy.toUpperCase()}</div></div>
      </div>;})}</div>
    </div>}
    {stage>=4&&<div style={{position:"relative",zIndex:2,marginTop:18,animation:"aRise .5s"}}><Btn full accent={C.mint} onClick={()=>onCross({granted,lockedFour})}>Cross into the forest {ARROW}</Btn></div>}
  </div>;
}

/* burst-of-particles explosion */
function Explosion({color}){return <div style={{position:"absolute",left:"50%",top:60,transform:"translate(-50%,-50%)",pointerEvents:"none",zIndex:1}}>
  <div style={{position:"absolute",left:0,top:0,transform:"translate(-50%,-50%)",width:10,height:10,borderRadius:"50%",background:color,boxShadow:`0 0 60px 30px ${hexA(color,.5)}`,animation:"aFlash .6s ease-out forwards"}}/>
  {Array.from({length:18}).map((_,i)=>{const ang=(i/18)*Math.PI*2;const dist=70+(i%3)*22;return <div key={i} style={{position:"absolute",left:0,top:0,width:4,height:4,borderRadius:"50%",background:i%2?color:C.gold,boxShadow:`0 0 6px ${color}`,animation:`aSpark .8s ease-out forwards`,["--dx"]:`${Math.cos(ang)*dist}px`,["--dy"]:`${Math.sin(ang)*dist}px`}}/>;})}
</div>;}

function grantedEssenceFor(theme){
  // The why-work of Chapter One is emotional -> grant Love. Fallbacks keep it
  // sensible for packs that don't have Love.
  const names=essList(theme).map(e=>e.name);
  if(names.includes("Love"))return "Love";
  if(names.includes("Radiance"))return "Radiance";
  if(names.includes("Connector"))return "Connector"; // Foundry: warmest available
  return names[0];
}

/* ===== THE WARNING + THE OMENS (Alchemist close) ======================== */
function TheWarning({theme,state,onDone}){
  const [beat,setBeat]=useState(0);
  const blocks=[
    { tone:"hold", lines:[`"Wait."`,`He catches your arm at the last light. "Before you go ${DASH} two things. I won't be there to say them later."`] },
    { tone:"dark", kicker:"THE WARNING", lines:[`"That forest changes after dark. You'll hear voices that sound like your own. You'll see shapes between the trees ${DASH} shadows shaped like who you're afraid you'll become."`,`"They'll know your name. They'll feel old, familiar, almost true. Don't run from them ${DASH} but don't believe everything they whisper, either."`] },
    { tone:"omen", kicker:"THE OMENS", lines:[`"But the dark isn't the only thing out there. The world is always speaking to the ones paying attention. A feather. A door that opens easy. The same word twice in one day. We call them omens."`,`"They're the path leaving you breadcrumbs. When something pulls at you for no reason you can name ${DASH} that's not nothing. That's the world saying: this way."`] },
    { tone:"send", lines:[`"Fear the shadows less. Trust the omens more. And when you can't tell which is which${DASH}"`,`He taps your chest, over the why. "${DASH}you come back here. To this. It'll always tell you true."`] },
  ];
  const b=blocks[beat];
  const [shown,done]=useTyped(b.lines,true);
  const last=beat>=blocks.length-1;
  const accent=b.tone==="dark"?C.danger:b.tone==="omen"?C.gold:C.amber;
  return <div style={{...fsWrap(`radial-gradient(800px 600px at 50% 10%, ${hexA(accent,.16)}, transparent), ${C.forest}`),display:"flex",flexDirection:"column"}}>
    <WarningScene tone={b.tone}/>
    <div style={{position:"relative",zIndex:2,flex:1,maxWidth:480,margin:"0 auto",width:"100%",padding:"10px 22px 46px",boxSizing:"border-box"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><FatherSprite size={26}/><strong style={{color:DAD.color,...mono,fontSize:13}}>{DAD.name}</strong>{b.kicker&&<span style={{fontSize:10,...mono,letterSpacing:2,color:accent,marginLeft:2}}>{b.kicker}</span>}</div>
      <div style={{minHeight:120}}>{shown.map((t,k)=><p key={k} style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,lineHeight:1.6,margin:"0 0 12px",color:k===shown.length-1?C.text:C.textDim,animation:"aFade .6s",borderLeft:(b.tone==="dark"||b.tone==="omen")?`2px solid ${hexA(accent,.4)}`:"none",paddingLeft:(b.tone==="dark"||b.tone==="omen")?14:0}}>{t}</p>)}</div>
      {done&&<div style={{marginTop:6,animation:"aRise .5s"}}>
        {!last?<Btn full accent={accent} onClick={()=>setBeat(beat+1)}>{beat===0?`Listen ${ARROW}`:beat===1?`${DASH}And the good signs? ${ARROW}`:`I'll remember ${ARROW}`}</Btn>:<Btn full accent={C.mint} onClick={onDone}>Step toward the trees {ARROW}</Btn>}
      </div>}
    </div>
  </div>;
}
function WarningScene({tone}){
  const dark=tone==="dark";
  const omen=tone==="omen";
  return <div style={{position:"relative",height:"34vh",minHeight:220,overflow:"hidden",background:`linear-gradient(180deg, ${dark?"#0a0410":hexA(C.city,.5)} 0%, ${C.forest} 100%)`}}>
    {Array.from({length:18}).map((_,i)=><div key={i} style={{position:"absolute",left:`${(i*37)%100}%`,top:`${(i*23)%50}%`,width:2,height:2,borderRadius:"50%",background:hexA(omen?C.gold:C.cyan,.6),opacity:.4,animation:`aTwinkle ${2+(i%4)}s ease-in-out ${i*.2}s infinite`}}/>)}
    <svg viewBox="0 0 400 130" preserveAspectRatio="none" style={{position:"absolute",bottom:24,left:0,width:"100%",height:110}}>{Array.from({length:18}).map((_,i)=>{const x=i*24,h=58+((i*47)%60);const col=dark?"#1a0e22":(i%2?C.leaf:C.mint);return <polygon key={i} points={`${x+9},${130-h} ${x-6},${130-h*.4} ${x+24},${130-h*.4}`} fill={hexA(col,dark?.5:.2)} stroke={hexA(col,.4)} strokeWidth=".5"/>;})}</svg>
    {dark&&Array.from({length:4}).map((_,i)=><div key={i} style={{position:"absolute",bottom:`${28+(i%2)*14}%`,left:`${18+i*22}%`,width:26,height:46,borderRadius:"50% 50% 45% 45%",background:`radial-gradient(circle at 50% 30%, ${hexA(C.danger,.32)}, transparent 70%)`,animation:`aFlicker ${1.6+(i%3)*.5}s ease-in-out ${i*.4}s infinite`}}>
      <div style={{position:"absolute",top:10,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4}}><span style={{width:3,height:3,borderRadius:"50%",background:C.danger,boxShadow:`0 0 5px ${C.danger}`}}/><span style={{width:3,height:3,borderRadius:"50%",background:C.danger,boxShadow:`0 0 5px ${C.danger}`}}/></div>
    </div>)}
    {omen&&Array.from({length:9}).map((_,i)=><div key={i} style={{position:"absolute",left:`${10+(i*47)%80}%`,bottom:"12%",fontSize:11+(i%3)*4,color:hexA(C.gold,0),filter:`drop-shadow(0 0 6px ${hexA(C.gold,.7)})`,animation:`aOmen ${3.5+(i%3)}s ease-out ${i*.4}s infinite`}}>{["\u2733","\u2748","\u2737","\u2022"][i%4]}</div>)}
    <div style={{position:"absolute",bottom:22,left:"34%",transform:"translateX(-50%)"}}><HeroSprite size={88}/></div>
    <div style={{position:"absolute",bottom:22,right:"30%",transform:"translateX(50%) scaleX(-1)"}}><FatherSprite size={100}/></div>
    <div style={{position:"absolute",bottom:0,left:0,right:0,height:28,background:`linear-gradient(180deg, transparent, ${C.black})`}}/>
  </div>;
}

function Crossing({theme,state,onHandoff}){
  const [progress,setProgress]=useState(0);const [walking,setWalking]=useState(false);const raf=useRef(null);
  const play=()=>{if(walking||progress>=1)return;setWalking(true);const t0=performance.now();const dur=2800;const step=now=>{const p=Math.min(1,(now-t0)/dur);setProgress(p);if(p<1)raf.current=requestAnimationFrame(step);else setWalking(false);};raf.current=requestAnimationFrame(step);};
  useEffect(()=>()=>cancelAnimationFrame(raf.current),[]);
  const deep=progress>=1;const started=progress>0;
  return <div style={fsWrap(`linear-gradient(180deg, ${C.forest}, ${C.black})`)}>
    <div style={{position:"relative",height:280,overflow:"hidden",background:`linear-gradient(180deg, ${C.forest}, ${C.black})`}}>
      {Array.from({length:20}).map((_,i)=><div key={i} style={{position:"absolute",left:`${(i*37)%100}%`,top:`${(i*19)%50}%`,width:2,height:2,borderRadius:"50%",background:hexA(C.mint,.5),opacity:.4}}/>)}
      <div style={{position:"absolute",bottom:42,left:0,height:190,width:"200%",transform:`translateX(${-(progress*50)}%)`,transition:walking?"none":"transform .4s ease"}}><svg viewBox="0 0 800 190" preserveAspectRatio="none" style={{position:"absolute",bottom:0,width:"100%",height:190}}>{Array.from({length:34}).map((_,i)=>{const x=i*24,h=94+((i*53)%94);const col=i%3===0?C.mint:C.leaf;return <g key={i}><rect x={x+9} y={190-h*.42} width={6} height={h*.42} fill={hexA("#082016",.95)}/><polygon points={`${x+12},${190-h} ${x-5},${190-h*.42} ${x+28},${190-h*.42}`} fill={hexA(col,.2)} stroke={hexA(col,.4)} strokeWidth=".5"/></g>;})}</svg></div>
      <div style={{position:"absolute",bottom:40,left:0,right:0,height:3,background:`linear-gradient(90deg, ${C.leaf}, ${C.mint})`,boxShadow:`0 0 12px ${hexA(C.mint,.4)}`}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:42,background:C.black}}/>
      <div style={{position:"absolute",bottom:44,left:"42%",transform:"translateX(-50%)"}}><HeroSprite size={104} walking={walking}/></div>
    </div>
    <div style={{padding:"18px 24px",textAlign:"center"}}>
      {!deep?<>
        <p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,color:C.textDim,minHeight:44}}>{progress<0.4?"You step past the last light of the city. Behind you, your father raises his lantern.":`The trees close in. The why burns warm in your chest. Whatever waits ahead ${DASH} you're not walking in empty.`}</p>
        {!started?<button onClick={play} style={holdBtn(C.mint)}>TAP TO CROSS {ARROW}</button>:<div style={{...mono,fontSize:12,color:C.mint,padding:"15px"}}>walking{DOTS}</div>}
        <Track v={progress} a={C.mint} b={C.leaf}/>
      </>:<div style={{animation:"aFade .5s"}}><p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:16,color:C.text}}>The forest takes you in. Somewhere ahead, a figure waits on the road{DOTS}</p><div style={{marginTop:12}}><Btn accent={C.cyan} onClick={onHandoff}>End of Chapter One {ARROW}</Btn></div></div>}
    </div>
  </div>;
}

/* MENTOR UNLOCKED — its own full-screen dopamine achievement */
function MentorUnlock({theme,onContinue}){
  const [stage,setStage]=useState(0); // 0 flash, 1 trophy slam, 2 details, 3 button
  useEffect(()=>{const seq=[setTimeout(()=>setStage(1),250),setTimeout(()=>setStage(2),1100),setTimeout(()=>setStage(3),1900)];return()=>seq.forEach(clearTimeout);},[]);
  return <div style={{...fsWrap(`radial-gradient(700px 700px at 50% 38%, ${hexA(C.cyan,.2)}, ${C.night} 60%, ${C.black})`),display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"0 24px"}}>
    {stage>=1&&<Explosion color={C.cyan}/>}
    {/* rotating rays behind */}
    {stage>=1&&<div style={{position:"absolute",width:360,height:360,top:"50%",left:"50%",transform:"translate(-50%,-60%)",pointerEvents:"none",opacity:.5,animation:"aRays 18s linear infinite"}}>
      <svg width="360" height="360" viewBox="0 0 360 360">{Array.from({length:16}).map((_,i)=>{const a=(i/16)*Math.PI*2;return <polygon key={i} points={`180,180 ${180+Math.cos(a-0.06)*200},${180+Math.sin(a-0.06)*200} ${180+Math.cos(a+0.06)*200},${180+Math.sin(a+0.06)*200}`} fill={hexA(C.cyan,i%2?.10:.04)}/>;})}</svg>
    </div>}
    <div style={{position:"relative",zIndex:2}}>
      <div style={{fontSize:12,letterSpacing:6,color:C.mint,...mono,marginBottom:14,opacity:stage>=2?1:0,transition:"opacity .5s"}}>{"\u2726"} MENTOR UNLOCKED {"\u2726"}</div>
      {/* trophy / anchor medallion slams in */}
      <div style={{width:130,height:130,margin:"0 auto",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:`radial-gradient(circle at 50% 35%, ${hexA(C.cyan,.35)}, ${C.cardDeep})`,border:`3px solid ${C.cyan}`,boxShadow:`0 0 60px ${hexA(C.cyan,.6)}`,animation:stage>=1?"aTrophySlam .7s cubic-bezier(.2,1.3,.4,1) forwards":"none",opacity:stage>=1?1:0}}>
        <svg width="62" height="62" viewBox="0 0 24 24"><path d="M12 2 L12 17 M5.5 14.5 a6.5 6.5 0 0 0 13 0 M8.5 5 h7" stroke={C.cyan} strokeWidth="1.6" fill="none" strokeLinecap="round"/><circle cx="12" cy="4" r="2.4" fill="none" stroke={C.cyan} strokeWidth="1.6"/></svg>
      </div>
      <h2 style={{fontFamily:"'Fraunces', serif",fontSize:30,color:C.text,margin:"18px 0 4px",opacity:stage>=2?1:0,transform:stage>=2?"translateY(0)":"translateY(10px)",transition:"all .5s"}}>The Anchor</h2>
      <div style={{fontSize:11,...mono,color:C.cyan,letterSpacing:2,opacity:stage>=2?1:0,transition:"opacity .5s .1s"}}>MENTOR ARCHETYPE {BULLET} 1 OF 3</div>
      {stage>=2&&<p style={{fontFamily:"'Fraunces', serif",fontStyle:"italic",fontSize:15,color:C.textDim,maxWidth:360,margin:"16px auto 0",lineHeight:1.5,animation:"aFade .6s"}}>The one who keeps you from drifting. You've felt what an anchor does {DASH} now you can learn to find and keep your own.</p>}
      {stage>=2&&<div style={{marginTop:16,padding:"12px 16px",borderRadius:12,background:hexA(C.cyan,.08),border:`1px solid ${hexA(C.cyan,.35)}`,maxWidth:380,margin:"16px auto 0",animation:"aRise .6s"}}>
        <div style={{fontSize:10,...mono,color:C.mint,marginBottom:4,letterSpacing:1}}>{LOCK} UNLOCKS IN THE ACADEMY</div>
        <p style={{fontSize:12,color:C.text,margin:0,lineHeight:1.5}}>Anchor-mentor training {DASH} how to find your anchor, what to ask them, and how to keep them close when the storm hits.</p>
      </div>}
      {stage>=3&&<div style={{marginTop:24,animation:"aRise .5s"}}><Btn accent={C.cyan} onClick={onContinue}>Claim it {ARROW}</Btn></div>}
    </div>
  </div>;
}


function Handoff({theme,state,restart}){
  return <div style={fsWrap(`radial-gradient(900px 600px at 50% 10%, ${hexA(theme.accent,.16)}, transparent), ${C.black}`)}>
    <div style={{maxWidth:440,margin:"0 auto",padding:"9vh 22px 40px"}}>
      <div style={{textAlign:"center",marginBottom:16}}><div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:6}}><HeroSprite size={84}/><FatherSprite size={80}/></div><h2 style={{fontFamily:"'Fraunces', serif",fontSize:24,color:C.text,margin:"4px 0"}}>Chapter One Complete</h2><p style={{fontSize:12,color:C.textDim}}>The Anchor gave you your why and named what they saw. Chapter Two: the road, and the shadow on it.</p></div>
      {/* mentor earned (the big moment already happened on its own screen) */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:12,marginBottom:14,background:hexA(C.cyan,.08),border:`1px solid ${hexA(C.cyan,.4)}`}}>
        <svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 2 L12 16 M6 14 a6 6 0 0 0 12 0 M9 5 h6" stroke={C.cyan} strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>
        <div style={{flex:1,textAlign:"left"}}><strong style={{fontSize:13,color:C.cyan}}>Anchor mentor earned</strong><span style={{fontSize:11,color:C.textDim,marginLeft:8}}>training waits in the Academy</span></div>
      </div>
      <div style={{padding:18,borderRadius:16,background:`linear-gradient(160deg, ${C.card}, ${C.cardDeep})`,border:`1px solid ${hexA(theme.accent,.4)}`}}>
        <Row label="World" value={theme.label}/>
        <Row label="Quest" value={state.quest||DASH}/>
        <Row label="Your why" value={`"${state.deepWhy||state.surfaceWhy||DASH}"`}/>
        <Row label="Anchor" value={state.anchorName||DASH}/>
        <Row label="Essence given" value={state.grantedEssence||DASH}/>
        <Row label="Mentor unlocked" value="The Anchor"/>
        <Row label="Still locked" value={(state.lockedEssences||[]).join(` ${BULLET} `)||DASH}/>
      </div>
      <div style={{marginTop:16,padding:14,borderRadius:12,background:hexA(C.cyan,.06),border:`1px solid ${hexA(C.cyan,.3)}`}}>
        <div style={{fontSize:10,...mono,color:C.cyan,marginBottom:6}}>HANDS OFF TO CHAPTER TWO</div>
        <p style={{fontSize:12,color:C.text,lineHeight:1.5,margin:0}}>This save {DASH} your quest, your why, your anchor, your granted essence {DASH} flows straight into the Shadow chapter, where you meet the first mask on the road.</p>
      </div>
      <div style={{marginTop:16,textAlign:"center"}}><Btn accent={C.phoenix} ghost onClick={restart}>{"\u21bb"} Replay Chapter One</Btn></div>
    </div>
  </div>;
}
function Row({label,value}){return <div style={{display:"flex",justifyContent:"space-between",gap:12,padding:"9px 0",borderBottom:`1px solid ${hexA(C.phoenix,.12)}`}}><span style={{fontSize:10,...mono,color:C.textDim,textTransform:"uppercase"}}>{label}</span><span style={{fontSize:12,color:C.text,textAlign:"right",maxWidth:"60%"}}>{value}</span></div>;}

export default function ChapterAnchor({ onComplete }){
  const [state,setState]=useState(load);
  useEffect(()=>persist(state),[state]);
  const [completeFired,setCompleteFired]=useState(false);
  const update=fn=>setState(s=>{const n=JSON.parse(JSON.stringify(s));fn(n);return n;});
  const theme=THEMES[state.themeId]||THEMES.neon;
  const phase=state.phase;
  const setPhase=p=>update(s=>{s.phase=p;});
  useEffect(()=>{
    if(phase==="handoff"&&!completeFired&&onComplete){
      setCompleteFired(true);
      onComplete({ quest:state.quest, deepWhy:state.deepWhy||state.surfaceWhy, anchorName:state.anchorName, vulnerability:state.vulnerability, grantedEssence:state.grantedEssence, lockedEssences:state.lockedEssences, anchorMentorUnlocked:true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[phase]);
  return <div style={{minHeight:"100vh",background:C.black,color:C.text,fontFamily:"'Inter Tight', system-ui, sans-serif"}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,600;9..144,0,700;9..144,1,500&family=Inter+Tight:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap');
      @keyframes aFade{from{opacity:0}to{opacity:1}}
      @keyframes aRise{0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)}}
      @keyframes aIdle{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
      @keyframes aWalk{0%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-3px) rotate(2deg)}100%{transform:translateY(0) rotate(-2deg)}}
      @keyframes aGlow{0%,100%{box-shadow:0 0 24px rgba(255,201,77,.32)}50%{box-shadow:0 0 40px rgba(255,201,77,.6)}}
      @keyframes aEmber{0%{opacity:0;transform:translateY(0) scale(1)}20%{opacity:.9}100%{opacity:0;transform:translateY(-80px) scale(.4)}}
      @keyframes aTwinkle{0%,100%{opacity:.2}50%{opacity:.7}}
      @keyframes aLightning{0%,92%,100%{background:rgba(255,255,255,0)}93%{background:rgba(255,255,255,.22)}95%{background:rgba(255,255,255,0)}96%{background:rgba(255,255,255,.15)}}
      @keyframes aShipStorm{0%{transform:rotate(-9deg) translateY(0)}25%{transform:rotate(6deg) translateY(-6px)}50%{transform:rotate(-7deg) translateY(3px)}75%{transform:rotate(8deg) translateY(-4px)}100%{transform:rotate(-9deg) translateY(0)}}
      @keyframes aShipCalm{0%,100%{transform:rotate(-2deg) translateY(0)}50%{transform:rotate(2deg) translateY(-2px)}}
      @keyframes aPulse{0%,100%{transform:translateX(-50%) scale(1);opacity:.5}50%{transform:translateX(-50%) scale(1.12);opacity:.9}}
      @keyframes aPulseC{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.45}50%{transform:translate(-50%,-50%) scale(1.14);opacity:.85}}
      @keyframes aPop{0%{transform:scale(.6);opacity:0}100%{transform:scale(1);opacity:1}}
      @keyframes aBurstIn{0%{transform:scale(.3);opacity:0}60%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
      @keyframes aFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
      @keyframes aFlash{0%{transform:scale(.2);opacity:1}100%{transform:scale(3.4);opacity:0}}
      @keyframes aSpark{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(.2);opacity:0}}
      @keyframes aTrophySlam{0%{transform:scale(2.4) translateY(-40px);opacity:0}55%{transform:scale(.86) translateY(6px);opacity:1}75%{transform:scale(1.06) translateY(-2px)}100%{transform:scale(1) translateY(0)}}
      @keyframes aRays{0%{transform:rotate(0deg);opacity:.5}100%{transform:rotate(360deg);opacity:.5}}
      @keyframes aFlicker{0%,100%{opacity:.15;transform:translateY(0)}45%{opacity:.7;transform:translateY(-3px)}55%{opacity:.25}}
      @keyframes aOmen{0%{opacity:0;transform:translateY(8px) scale(.8)}25%{opacity:.9}70%{opacity:.5}100%{opacity:0;transform:translateY(-70px) scale(1.1)}}
      *{-webkit-tap-highlight-color:transparent}
      button,textarea,input{font-family:inherit}
      textarea::placeholder,input::placeholder{color:${C.locked}}
      @media (prefers-reduced-motion: reduce){*{animation:none!important}}
    `}</style>
    {phase==="title"&&<Title theme={theme} go={()=>setPhase("walk")} pickWorld={()=>setPhase("world")}/>}
    {phase==="world"&&<WorldPick state={state} set={(id,begin)=>update(s=>{s.themeId=id;if(begin)s.phase="title";})}/>}
    {phase==="walk"&&<WalkToHouse theme={theme} onArrive={()=>setPhase("table")}/>}
    {phase==="table"&&<TheTable theme={theme} state={state} update={update} onTreeline={()=>setPhase("treeline")}/>}
    {phase==="treeline"&&<TheTreeline theme={theme} state={state} update={update} onCross={({granted,lockedFour})=>update(s=>{s.grantedEssence=granted;s.lockedEssences=lockedFour;s.anchorMentorUnlocked=true;s.phase="warning";})}/>}
    {phase==="warning"&&<TheWarning theme={theme} state={state} onDone={()=>setPhase("cross")}/>}
    {phase==="cross"&&<Crossing theme={theme} state={state} onHandoff={()=>setPhase("mentor")}/>}
    {phase==="mentor"&&<MentorUnlock theme={theme} onContinue={()=>setPhase("handoff")}/>}
    {phase==="handoff"&&<Handoff theme={theme} state={state} restart={()=>setState(blank())}/>}
  </div>;
}

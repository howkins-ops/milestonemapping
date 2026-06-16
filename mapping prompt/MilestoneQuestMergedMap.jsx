import React, { useState, useEffect, useRef } from "react";

/* =============================================================================
   MILESTONE QUEST — MERGED MAP (concept)
   Shows how the STORY layer weaves into the existing MILESTONE MAPPING path.
   Model: each LOCATION on the path is one node with a small state machine:
     locked -> arrived(STORY plays) -> inprogress(grind milestone) -> completed
   The chapter plays WHEN YOU REACH the location; the milestone target must then
   be hit before you can walk on. One path, one timeline, story woven in.
   NOTE: placeholder styling only (NOT the real pixel art) -- this is purely to
   show the concept of how the two ideas connect. Real assets drop into the
   same slots (bgArt / icon) later.
   ============================================================================= */

const C={black:"#05030c",night:"#0a0618",card:"#0f0a1e",cardDeep:"#0a0714",violet:"#7B2CFF",magenta:"#D11EFF",hotPink:"#FF3EDB",cyan:"#00F0FF",mint:"#22e0a0",gold:"#FFC94D",amber:"#FFA94D",text:"#F2F0F4",textDim:"#9a8fb0",locked:"#3a3450",danger:"#FF5470",pathGlow:"#9b5cff"};
const hexA=(h,a)=>{const x=h.replace("#","");return `rgba(${parseInt(x.slice(0,2),16)},${parseInt(x.slice(2,4),16)},${parseInt(x.slice(4,6),16)},${a})`;};
const ARROW="\u2192",LOCK="\uD83D\uDD12",CHECK="\u2713",BULLET="\u00b7",STAR="\u2726",DIAMOND="\u25c6",PLAY="\u25b6",FLAME="\u25b2",DASH="\u2014";
const mono={fontFamily:"'JetBrains Mono', monospace"};

/* each LOCATION = milestone + an attached story chapter.
   stage: done | active(grind) | story(arrived, chapter to watch) | locked   */
const LOCATIONS=[
  { id:"l1", name:"The Crystal Path", chapter:"The Anchor", chapterSub:"find your why",
    metric:"Steps", target:5, current:5, essence:"Love", stage:"done" },
  { id:"l2", name:"Crystal Caverns", chapter:"The Shadow", chapterSub:"meet your first mask",
    metric:"Features", target:12, current:12, essence:null, stage:"done" },
  { id:"l3", name:"Forgotten Quarry", chapter:"The Challenger", chapterSub:"the broken word",
    metric:"Beta testers", target:100, current:64, essence:null, stage:"active", storyWatched:true },
  { id:"l4", name:"Ascension Cliffs", chapter:"The Operator", chapterSub:"build the system",
    metric:"Blockers cleared", target:6, current:0, essence:null, stage:"story" },
  { id:"l5", name:"Diamond Citadel", chapter:"The Sovereign", chapterSub:"the final goal",
    metric:"Users", target:1000, current:0, essence:null, stage:"locked", isFinal:true },
];

const pctOf=l=>l.target?Math.min(1,(l.current||0)/l.target):0;

export default function MilestoneQuestMergedMap(){
  const [sheet,setSheet]=useState(null);
  const nodes=LOCATIONS;
  const currentIdx=Math.max(0,nodes.findIndex(l=>l.stage==="active"||l.stage==="story"));
  return <div style={{minHeight:"100vh",background:C.black,color:C.text,fontFamily:"'Inter Tight', system-ui, sans-serif",display:"flex",flexDirection:"column"}}>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,ital,wght@9..144,0,600;9..144,0,700;9..144,1,500&family=Inter+Tight:wght@400;500;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
      @keyframes mFade{from{opacity:0}to{opacity:1}}
      @keyframes mRise{0%{opacity:0;transform:translateY(16px)}100%{opacity:1;transform:translateY(0)}}
      @keyframes mPulse{0%,100%{box-shadow:0 0 0 0 rgba(0,240,255,.5)}70%{box-shadow:0 0 0 16px rgba(0,240,255,0)}}
      @keyframes mStoryPulse{0%,100%{box-shadow:0 0 14px 2px rgba(123,44,255,.6)}50%{box-shadow:0 0 26px 6px rgba(209,30,255,.7)}}
      @keyframes mDash{to{stroke-dashoffset:-28}}
      @keyframes mUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
      @keyframes mFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
      @keyframes mSheen{0%{background-position:-180% 0}100%{background-position:180% 0}}
      *{-webkit-tap-highlight-color:transparent;box-sizing:border-box}
    `}</style>

    {/* header (your existing identity bar, simplified) */}
    <div style={{position:"sticky",top:0,zIndex:20,padding:"12px 16px",background:`linear-gradient(180deg, ${C.black}, ${hexA(C.black,.6)})`,backdropFilter:"blur(8px)",borderBottom:`1px solid ${hexA(C.violet,.2)}`}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{flex:1}}><div style={{fontFamily:"'Fraunces', serif",fontSize:17,fontWeight:800,letterSpacing:.5}}>MILESTONE MAPPING</div><div style={{fontSize:9,...mono,color:C.textDim,letterSpacing:1}}>THE MORE YOU LEARN, THE MORE YOU EARN</div></div>
        <div style={{padding:"6px 12px",borderRadius:999,border:`1px solid ${hexA(C.gold,.4)}`,background:hexA(C.gold,.08)}}><span style={{...mono,fontSize:11,color:C.gold,fontWeight:700}}>Warrior</span><span style={{...mono,fontSize:10,color:C.textDim,marginLeft:6}}>1,040 XP</span></div>
      </div>
    </div>

    {/* PROJECT WORLD banner */}
    <div style={{padding:"12px 16px 4px"}}>
      <div style={{fontSize:9,...mono,letterSpacing:2,color:C.cyan}}>PROJECT WORLD {BULLET} MAIN QUEST</div>
      <div style={{fontFamily:"'Fraunces', serif",fontSize:22,fontWeight:800}}>Launch The Plan.</div>
    </div>

    {/* the winding path */}
    <div style={{position:"relative",flex:1,maxWidth:560,width:"100%",margin:"0 auto",padding:"14px 0 150px"}}>
      <PathTrail nodes={nodes}/>
      {nodes.map((l,i)=><LocationNode key={l.id} loc={l} index={i} side={i%2===0?"left":"right"} isCurrent={i===currentIdx} onOpen={()=>setSheet(l)}/>)}
    </div>

    {/* HOW IT WORKS strip */}
    <div style={{maxWidth:560,width:"100%",margin:"0 auto",padding:"0 16px 16px",display:"flex",alignItems:"center",justifyContent:"space-around",opacity:.8}}>
      <Mini icon={DIAMOND} c={C.violet} t="STORY" s="watch the chapter"/>
      <span style={{color:C.textDim}}>{ARROW}</span>
      <Mini icon={"\u25cf"} c={C.gold} t="GRIND" s="hit the number"/>
      <span style={{color:C.textDim}}>{ARROW}</span>
      <Mini icon={CHECK} c={C.mint} t="ADVANCE" s="next location"/>
    </div>

    {/* bottom nav (your 5 tabs, untouched) */}
    <div style={{position:"sticky",bottom:0,zIndex:20,display:"flex",justifyContent:"space-around",padding:"10px 6px calc(8px + env(safe-area-inset-bottom))",background:C.night,borderTop:`1px solid ${hexA(C.violet,.25)}`}}>
      {[["\u25a3","COMMAND",0],["\u26a1","DAILY",0],["\u25c8","MAP",1],["\u263e","SHADOW",0],["\u2615","FILL CUP",0]].map(([ic,lb,on])=><div key={lb} style={{textAlign:"center",flex:1}}><div style={{fontSize:18,color:on?C.cyan:C.textDim}}>{ic}</div><div style={{fontSize:9,...mono,letterSpacing:1,color:on?C.cyan:C.textDim,marginTop:2}}>{lb}</div></div>)}
    </div>

    {sheet&&<LocationSheet loc={sheet} onClose={()=>setSheet(null)}/>}
  </div>;
}

function Mini({icon,c,t,s}){return <div style={{textAlign:"center"}}><div style={{fontSize:14,color:c}}>{icon}</div><div style={{fontSize:9,...mono,color:C.text,letterSpacing:1,marginTop:2}}>{t}</div><div style={{fontSize:8,color:C.textDim}}>{s}</div></div>;}

/* the glowing winding trail behind the nodes */
function PathTrail({nodes}){
  const rowH=150, W=560;
  const xFor=i=>i%2===0?W*0.30:W*0.70;
  const pts=nodes.map((n,i)=>({x:xFor(i),y:60+i*rowH}));
  let d=`M ${pts[0].x} ${pts[0].y}`;
  for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i];const my=(a.y+b.y)/2;d+=` C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`;}
  const totalH=60+(nodes.length-1)*rowH+120;
  return <svg viewBox={`0 0 ${W} ${totalH}`} preserveAspectRatio="xMidYMin meet" style={{position:"absolute",top:0,left:0,width:"100%",height:totalH,zIndex:0,pointerEvents:"none"}}>
    <defs><linearGradient id="trailG" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor={C.cyan}/><stop offset="50%" stopColor={C.violet}/><stop offset="100%" stopColor={C.magenta}/></linearGradient>
      <filter id="trailBlur"><feGaussianBlur stdDeviation="5"/></filter></defs>
    <path d={d} fill="none" stroke="url(#trailG)" strokeWidth="14" strokeLinecap="round" opacity=".25" filter="url(#trailBlur)"/>
    <path d={d} fill="none" stroke="url(#trailG)" strokeWidth="5" strokeLinecap="round" opacity=".9"/>
    <path d={d} fill="none" stroke={hexA("#fff",.8)} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 16" style={{animation:"mDash 1.4s linear infinite"}}/>
  </svg>;
}

function LocationNode({loc,index,side,isCurrent,onOpen}){
  const rowH=150;
  const st=loc.stage;
  const p=pctOf(loc);
  const story=st==="story";
  const ringColor=st==="locked"?C.locked:st==="done"?C.mint:story?C.violet:C.gold;
  return <div style={{position:"relative",height:rowH,zIndex:2}}>
    <div style={{position:"absolute",top:"50%",left:side==="left"?"30%":"70%",transform:"translate(-50%,-50%)",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <button onClick={onOpen} disabled={st==="locked"} style={{width:86,height:86,borderRadius:"50%",border:"none",background:"transparent",padding:0,cursor:st==="locked"?"default":"pointer",position:"relative",animation:isCurrent?(story?"mStoryPulse 1.8s infinite":"mPulse 2s infinite"):"none"}}>
        <NodeFace st={st} p={p} color={ringColor} isFinal={loc.isFinal}/>
      </button>
    </div>
    {/* label card on the opposite side */}
    <div style={{position:"absolute",top:"50%",transform:"translateY(-50%)",[side==="left"?"left":"right"]:"46%",width:"46%",maxWidth:230,[side==="left"?"right":"left"]:"auto"}}>
      <div onClick={st==="locked"?undefined:onOpen} style={{padding:"10px 12px",borderRadius:14,background:`linear-gradient(150deg, ${hexA(C.card,.96)}, ${hexA(C.cardDeep,.96)})`,border:`1px solid ${hexA(ringColor,.5)}`,cursor:st==="locked"?"default":"pointer",boxShadow:st!=="locked"?`0 0 16px ${hexA(ringColor,.18)}`:"none"}}>
        {loc.isFinal&&<div style={{fontSize:9,...mono,letterSpacing:2,color:C.magenta,marginBottom:2}}>{STAR} FINAL GOAL</div>}
        <div style={{fontFamily:"'Fraunces', serif",fontSize:15,fontWeight:700,color:st==="locked"?C.textDim:C.text,lineHeight:1.1}}>{loc.name}</div>
        {/* story line */}
        <div style={{display:"flex",alignItems:"center",gap:5,marginTop:4}}>
          <span style={{fontSize:9,color:story?C.violet:st==="locked"?C.locked:C.cyan}}>{DIAMOND}</span>
          <span style={{fontSize:10,...mono,color:st==="locked"?C.locked:C.textDim}}>{loc.chapter}</span>
          {loc.storyWatched&&st!=="locked"&&<span style={{fontSize:9,color:C.mint}}>{CHECK}</span>}
        </div>
        {/* status line */}
        {st==="story"?<div style={{marginTop:6,fontSize:10,...mono,color:C.violet,fontWeight:700}}>{PLAY} CHAPTER READY</div>
          :st==="active"?<>
            <div style={{height:5,borderRadius:999,background:hexA(C.text,.1),overflow:"hidden",margin:"6px 0 3px"}}><div style={{width:`${p*100}%`,height:"100%",background:`linear-gradient(90deg, ${C.gold}, ${C.amber})`}}/></div>
            <div style={{fontSize:9,...mono,color:C.textDim}}>{loc.current}/{loc.target} {loc.metric}</div>
          </>:st==="done"?<div style={{marginTop:5,fontSize:10,...mono,color:C.mint,fontWeight:700}}>{CHECK} COMPLETED</div>
          :<div style={{marginTop:5,fontSize:9,...mono,color:C.locked}}>{LOCK} locked</div>}
      </div>
      {isCurrent&&<div style={{fontSize:9,...mono,color:story?C.violet:C.cyan,marginTop:5,paddingLeft:4}}>{FLAME} YOU ARE HERE</div>}
    </div>
  </div>;
}

function NodeFace({st,p,color,isFinal}){
  const R=38,Circ=2*Math.PI*R;
  const done=st==="done";
  const story=st==="story";
  return <div style={{width:"100%",height:"100%",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
    <svg width="86" height="86" viewBox="0 0 86 86" style={{position:"absolute",inset:0,transform:"rotate(-90deg)"}}>
      <circle cx="43" cy="43" r={R} fill={hexA(st==="locked"?C.locked:color,.1)} stroke={hexA(st==="locked"?C.locked:color,.3)} strokeWidth="5"/>
      {(st==="active")&&<circle cx="43" cy="43" r={R} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={Circ} strokeDashoffset={Circ*(1-p)} style={{filter:`drop-shadow(0 0 5px ${color})`}}/>}
      {(done||story)&&<circle cx="43" cy="43" r={R} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" style={{filter:`drop-shadow(0 0 6px ${color})`}}/>}
    </svg>
    {/* inner face */}
    <div style={{width:62,height:62,borderRadius:"50%",background:`radial-gradient(circle at 50% 35%, ${hexA(color,.3)}, ${C.cardDeep})`,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${hexA(color,.4)}`}}>
      {st==="locked"?<span style={{fontSize:22,color:C.locked}}>{LOCK}</span>
        :done?<span style={{fontSize:30,color:C.mint,fontWeight:800}}>{CHECK}</span>
        :story?<span style={{fontSize:26,color:color,animation:"mFloat 2.6s ease-in-out infinite"}}>{isFinal?STAR:DIAMOND}</span>
        :<span style={{fontSize:16,...mono,fontWeight:800,color:color}}>{Math.round(p*100)}%</span>}
    </div>
  </div>;
}

/* the location sheet shows the arrive -> story -> grind -> complete flow */
function LocationSheet({loc,onClose}){
  const st=loc.stage;
  const p=pctOf(loc);
  const c=st==="story"?C.violet:st==="active"?C.gold:st==="done"?C.mint:C.locked;
  return <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:40,background:hexA("#000",.72),display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"mFade .25s"}}>
    <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:560,background:`linear-gradient(180deg, ${C.card}, ${C.cardDeep})`,borderTop:`2px solid ${c}`,borderRadius:"22px 22px 0 0",padding:"10px 22px calc(26px + env(safe-area-inset-bottom))",animation:"mUp .3s cubic-bezier(.2,1,.3,1)",maxHeight:"86vh",overflowY:"auto"}}>
      <div style={{width:40,height:4,borderRadius:999,background:hexA(C.text,.2),margin:"0 auto 16px"}}/>
      <div style={{fontSize:9,...mono,letterSpacing:2,color:C.cyan}}>LOCATION</div>
      <h2 style={{fontFamily:"'Fraunces', serif",fontSize:24,margin:"4px 0 14px"}}>{loc.name}</h2>

      {/* the two-phase tracker for this location */}
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <Phase n="1" label="STORY" sub={loc.chapter} active={st==="story"} done={st!=="story"&&st!=="locked"} color={C.violet}/>
        <Phase n="2" label="MILESTONE" sub={`${loc.current}/${loc.target}`} active={st==="active"} done={st==="done"} color={C.gold}/>
      </div>

      {/* phase-specific body */}
      {st==="locked"&&<div style={{textAlign:"center",padding:18,color:C.locked,...mono,fontSize:12}}>{LOCK} Complete the previous location to arrive here.</div>}

      {st==="story"&&<div style={{animation:"mFade .3s"}}>
        <div style={{padding:16,borderRadius:16,background:`linear-gradient(135deg, ${hexA(C.violet,.2)}, ${C.cardDeep})`,border:`1.5px solid ${C.violet}`,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:26,color:C.violet}}>{DIAMOND}</span><div><div style={{fontSize:9,...mono,color:C.mint,letterSpacing:1}}>CHAPTER {BULLET} PLAYS HERE</div><strong style={{fontFamily:"'Fraunces', serif",fontSize:18,color:C.text}}>{loc.chapter}</strong><div style={{fontSize:11,color:C.textDim}}>{loc.chapterSub}</div></div></div>
        </div>
        <p style={{fontSize:12,color:C.textDim,textAlign:"center",margin:"0 0 12px",fontStyle:"italic"}}>You've arrived. Watch the chapter, then the milestone opens.</p>
        <button style={btn(C.violet)}>{PLAY} Enter the chapter {ARROW}</button>
      </div>}

      {st==="active"&&<div style={{animation:"mFade .3s"}}>
        {loc.storyWatched&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:10,background:hexA(C.violet,.08),border:`1px solid ${hexA(C.violet,.3)}`,marginBottom:12}}><span style={{color:C.violet}}>{DIAMOND}</span><span style={{fontSize:11,color:C.textDim,flex:1}}>{loc.chapter} {DASH} watched</span><span style={{color:C.mint}}>{CHECK}</span></div>}
        <div style={{display:"flex",alignItems:"baseline",gap:8}}><span style={{fontFamily:"'Fraunces', serif",fontSize:34,fontWeight:800,color:C.gold}}>{loc.current}</span><span style={{fontSize:15,color:C.textDim}}>/ {loc.target} {loc.metric}</span></div>
        <div style={{height:8,borderRadius:999,background:hexA(C.text,.08),overflow:"hidden",margin:"8px 0 6px"}}><div style={{width:`${p*100}%`,height:"100%",background:`linear-gradient(90deg, ${C.gold}, ${C.amber})`}}/></div>
        <div style={{fontSize:11,...mono,color:C.textDim,marginBottom:12}}>{Math.round(p*100)}% {BULLET} completes only when you hit {loc.target}</div>
        <button style={btn(C.gold)}>Log progress +{ARROW}</button>
        <p style={{fontSize:11,color:C.textDim,textAlign:"center",marginTop:10,fontStyle:"italic"}}>Hit the number to complete this location and walk on.</p>
      </div>}

      {st==="done"&&<div style={{animation:"mFade .3s"}}>
        <Info label="Chapter" value={`${loc.chapter}  ${CHECK}`} color={C.violet}/>
        {loc.essence&&<Info label="Essence earned" value={loc.essence} color={C.hotPink}/>}
        <Info label="Milestone" value={`${loc.target}/${loc.target} ${CHECK}`} color={C.mint}/>
        <button style={btn(C.violet,true)}>Replay chapter {ARROW}</button>
      </div>}
    </div>
  </div>;
}
function Phase({n,label,sub,active,done,color}){return <div style={{flex:1,padding:"10px 12px",borderRadius:12,background:active?hexA(color,.14):"rgba(255,255,255,.03)",border:`1px solid ${done?hexA(C.mint,.4):active?color:hexA(C.text,.1)}`,position:"relative"}}>
  <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:18,height:18,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,...mono,fontWeight:700,background:done?C.mint:active?color:hexA(C.text,.12),color:done||active?"#000":C.textDim}}>{done?CHECK:n}</div><span style={{fontSize:10,...mono,letterSpacing:1,color:done?C.mint:active?color:C.textDim}}>{label}</span></div>
  <div style={{fontSize:11,color:C.text,marginTop:5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{sub}</div>
</div>;}
function Info({label,value,color}){return <div style={{display:"flex",justifyContent:"space-between",padding:"11px 0",borderBottom:`1px solid ${hexA(C.text,.08)}`}}><span style={{fontSize:11,...mono,color:C.textDim,textTransform:"uppercase"}}>{label}</span><span style={{fontSize:13,color:color||C.text,fontWeight:600}}>{value}</span></div>;}
const btn=(c,ghost)=>({width:"100%",marginTop:14,padding:"14px",borderRadius:14,...mono,fontSize:13,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",cursor:"pointer",color:ghost?c:"#04020b",background:ghost?"transparent":`linear-gradient(135deg, ${c}, ${C.hotPink})`,border:ghost?`1px solid ${hexA(c,.5)}`:"none",boxShadow:ghost?"none":`0 0 18px ${hexA(c,.45)}`});

import React, { useState, useEffect } from "react";
import {
  C, hexA, mono, serif, fsWrap, echo, readChapterSave,
  ChapterFrame, Btn, taStyle, Row, AnswerJournal,
  useTyped, Embers, Starfield, ForestBackdrop, EssenceBurst, PhoenixSeal,
  HeroSprite, CrownedSprite,
} from "../kit.jsx";

/* =============================================================================
   CHAPTER THREE — "THE ALCHEMY"  (the Broke King TRANSMUTATION)
   The payoff The Shadow promised: "you'll face him again, deeper, and learn how
   to BE a king before the kingdom exists." The Seeker returns to the Ruined
   Treasury, the Alchemist mentor (Jon's higher self / real transformation)
   teaches BE-before-become, the player forges the old story into a new identity
   and a proof action, and the Broke King is reforged into THE SOVEREIGN BUILDER.
   Essence returned: POWER.  Built entirely on the shared cinematic kit.
   ============================================================================= */

const SAVE_KEY = "milestone-quest:alchemy-v1";
const SHADOW_KEY = "milestone-quest:shadow-v3"; // carry-forward source (Chapter Two)

const blank = () => ({ phase:"recap", lie:"", identity:"", proof:"" });
function load(){ try { const r = localStorage.getItem(SAVE_KEY); return r ? { ...blank(), ...JSON.parse(r) } : blank(); } catch { return blank(); } }
function persist(s){ try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch {} }

/* ===== 1. RECAP — return to the Ruined Treasury ========================== */
function Recap({ carried, go }) {
  const chasing = echo(carried.chasing, "the feeling you thought the gold would finally give you");
  const lines = [
    "You walk back into the Ruined Treasury. The air is colder this time.",
    "The Broke King still sits where you left him — crown cracked, the same low voice: “You’re behind. You should be further by now.”",
    "Last time he asked you a question you couldn’t answer: how does a man BECOME a king?",
    "You knew how to DO — grind, chase, push. You did not yet know how to BE.",
  ];
  const [shown, done] = useTyped(lines, true);
  return (
    <div style={fsWrap(`radial-gradient(900px 700px at 50% 12%, ${hexA(C.gold,.18)}, ${C.night} 60%, ${C.black})`)}>
      <Starfield mood={C.gold} />
      <Embers on color={C.gold} count={10} />
      <div style={{ position:"relative", zIndex:2, display:"flex", justifyContent:"center", alignItems:"flex-end", gap:22, paddingTop:"7vh", height:230 }}>
        <HeroSprite size={104} />
        <CrownedSprite size={120} revealed />
      </div>
      <div style={{ position:"relative", zIndex:2, maxWidth:480, margin:"0 auto", padding:"6px 22px 50px" }}>
        <div style={{ fontSize:11, letterSpacing:4, color:C.gold, ...mono, marginBottom:10, textAlign:"center" }}>THE RUINED TREASURY · CHAPTER THREE</div>
        <div style={{ minHeight:120 }}>
          {shown.map((t,k)=>(
            <p key={k} style={{ ...serif, fontStyle:"italic", fontSize:16, lineHeight:1.5, margin:"0 0 8px", color:k===shown.length-1?C.text:C.textDim, animation:"sFade .5s" }}>{t}</p>
          ))}
        </div>
        {done && (
          <div style={{ marginTop:6, animation:"sRise .5s" }}>
            <div style={{ padding:"12px 14px", borderRadius:12, background:hexA(C.gold,.07), border:`1px solid ${hexA(C.gold,.3)}`, marginBottom:14 }}>
              <div style={{ fontSize:10, ...mono, color:C.gold, marginBottom:6 }}>HE STILL REMEMBERS WHAT YOU’RE REALLY CHASING</div>
              <p style={{ fontSize:13, color:C.text, margin:0 }}>{chasing}</p>
            </div>
            <Btn full accent={C.amber} onClick={go}>Then a light moves behind him →</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== 2. THE ALCHEMIST — mentor testimony (Jon's transformation) ======== */
function Alchemist({ go }) {
  const [step, setStep] = useState(0);
  const intro = [
    "From the dark behind the throne, a figure of light steps forward. Hooded — like you. Older — like you could be.",
    "“I am the Alchemist. I have sat on that cracked throne too.”",
  ];
  const story = [
    "“I was ranked among the best in the country. Then I lost a million-dollar kingdom in a single night — and told myself it was someone else’s fault.”",
    "“I flew to a beach alone. I broke down in the dark by the water. That breakdown was the first honest thing I’d done in years.”",
    "“Then I learned the one thing the King can never tell you:”",
  ];
  const beats = step === 0 ? intro : story;
  const [shown, done] = useTyped(beats, step <= 1);
  return (
    <div style={fsWrap(`radial-gradient(800px 700px at 50% 20%, ${hexA(C.phoenix,.18)}, ${C.night} 55%, ${C.black})`)}>
      <Starfield mood={C.phoenix} />
      <div style={{ position:"relative", zIndex:2, display:"flex", justifyContent:"center", alignItems:"flex-end", paddingTop:"7vh", height:220 }}>
        <HeroSprite size={132} glow={C.phoenix} />
      </div>
      <div style={{ position:"relative", zIndex:2, maxWidth:480, margin:"0 auto", padding:"6px 22px 50px" }}>
        <div style={{ fontSize:11, letterSpacing:3, color:C.phoenix, ...mono, marginBottom:10, textAlign:"center" }}>THE ALCHEMIST · your higher self</div>
        {step <= 1 && (
          <>
            <div style={{ minHeight:96 }}>
              {shown.map((t,k)=>(
                <p key={k} style={{ ...serif, fontStyle:"italic", fontSize:16, lineHeight:1.55, margin:"0 0 8px", color:k===shown.length-1?C.text:C.textDim, animation:"sFade .5s" }}>{t}</p>
              ))}
            </div>
            {done && (
              <div style={{ marginTop:8, animation:"sRise .5s" }}>
                <Btn full accent={C.phoenix} onClick={()=>setStep(step+1)}>{step===0?"Listen →":"“What thing?”"}</Btn>
              </div>
            )}
          </>
        )}
        {step === 2 && (
          <div style={{ animation:"sRise .5s" }}>
            <div style={{ padding:"18px 18px", borderRadius:16, background:`linear-gradient(160deg, ${hexA(C.power,.12)}, ${C.cardDeep})`, border:`1px solid ${hexA(C.power,.4)}`, marginBottom:16 }}>
              <p style={{ ...serif, fontSize:19, lineHeight:1.5, color:C.text, margin:"0 0 10px" }}>“You do not become a king by doing more. You <span style={{color:C.power}}>are</span> the king first — and then you build.”</p>
              <p style={{ ...serif, fontSize:17, lineHeight:1.5, color:C.power, margin:0, fontStyle:"italic" }}>“Power is not the gold. Power is who you are when the gold is gone.”</p>
            </div>
            <p style={{ fontSize:13, color:C.textDim, fontStyle:"italic", marginBottom:14, textAlign:"center" }}>“The King is a story you started believing on your worst night. So let’s forge a new one. Right now.”</p>
            <Btn full accent={C.gold} onClick={go}>Step to the forge →</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== 3. THE IDENTITY FORGE — the exercise ============================== */
function Forge({ state, update, carried, go }) {
  const set = (k) => (e) => update(s => { s[k] = e.target.value; });
  const ready = state.lie.trim() && state.identity.trim() && state.proof.trim();
  const lieHint = echo(carried.doing, "I had my shot and I blew it — I can’t be trusted with the kingdom");
  return (
    <div style={fsWrap(`radial-gradient(800px 600px at 50% 10%, ${hexA(C.gold,.14)}, ${C.night} 60%, ${C.black})`)}>
      <Embers on color={C.amber} count={16} />
      <div style={{ position:"relative", zIndex:2, maxWidth:520, margin:"0 auto", padding:"32px 22px 60px" }}>
        <div style={{ fontSize:11, letterSpacing:3, color:C.gold, ...mono, marginBottom:6, textAlign:"center" }}>THE IDENTITY FORGE</div>
        <h2 style={{ ...serif, fontSize:26, textAlign:"center", margin:"0 0 4px" }}>Melt the old story. Forge a new one.</h2>
        <p style={{ fontSize:13, color:C.textDim, textAlign:"center", marginBottom:22 }}>One exercise. Three strikes of the hammer. Answer honestly — the forge remembers.</p>

        <Field label="1 · Say the old story out loud. What did the Broke King make you believe about yourself?" hint={`e.g. “${lieHint}”`}>
          <textarea style={taStyle(C.danger)} value={state.lie} onChange={set("lie")} placeholder="The lie you’ve been wearing like a crown…" />
        </Field>
        <Field label="2 · Now forge the truth. From this day — who do you CHOOSE to be?" hint="Start with “I am…”">
          <textarea style={taStyle(C.power)} value={state.identity} onChange={set("identity")} placeholder="I am the one who builds from power, not panic…" />
        </Field>
        <Field label="3 · One proof action in the next 24h that makes this identity real." hint="Small, specific, done from ownership.">
          <textarea style={{ ...taStyle(C.mint), minHeight:48 }} value={state.proof} onChange={set("proof")} placeholder="e.g. send the invoice I’ve avoided / make one offer / track every dollar today" />
        </Field>

        <div style={{ marginTop:8 }}>
          <Btn full accent={C.gold} disabled={!ready} onClick={go}>Strike the forge →</Btn>
          {!ready && <p style={{ fontSize:12, color:C.textDim, textAlign:"center", marginTop:8 }}>Fill all three — this is what reforges him.</p>}
        </div>
      </div>
    </div>
  );
}
function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom:18 }}>
      <label style={{ display:"block", fontSize:14, color:C.text, marginBottom:6, lineHeight:1.4 }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize:11, color:C.locked, marginTop:5, fontStyle:"italic" }}>{hint}</div>}
    </div>
  );
}

/* ===== 4. THE RETURN — Essence: POWER, the Sovereign Builder ============= */
function Return({ state, go }) {
  const [reforged, setReforged] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReforged(true), 1400); return () => clearTimeout(t); }, []);
  return (
    <div style={fsWrap(`radial-gradient(800px 700px at 50% 18%, ${hexA(reforged?C.mint:C.gold,.2)}, ${C.night} 55%, ${C.black})`)}>
      <Starfield mood={reforged ? C.mint : C.gold} />
      <Embers on color={reforged ? C.mint : C.danger} count={14} />
      <div style={{ position:"relative", zIndex:2, display:"flex", justifyContent:"center", alignItems:"flex-end", paddingTop:"6vh", height:220 }}>
        <CrownedSprite size={150} revealed healed={reforged} healedColor={C.mint} />
      </div>
      <div style={{ position:"relative", zIndex:2, maxWidth:500, margin:"0 auto", padding:"6px 22px 56px" }}>
        {!reforged ? (
          <p style={{ ...serif, fontStyle:"italic", fontSize:17, color:C.text, textAlign:"center", animation:"sFade .6s" }}>You speak the new story. The cracked crown glows, splits… and reforges.</p>
        ) : (
          <div style={{ animation:"sRiseGlow .8s" }}>
            <EssenceBurst color={C.power} glyph="⬢" name="POWER" line="Power is not the gold. Power is who you are when the gold is gone." />
            <p style={{ ...serif, fontSize:16, color:C.text, textAlign:"center", margin:"4px 0 18px" }}>The Broke King is gone. In his place stands <b style={{ color:C.mint }}>The Sovereign Builder</b> — and he wears your face.</p>

            <AnswerJournal title="WHAT YOU FORGED" accent={C.mint} entries={[
              { q:"The old story you melted down", a:state.lie },
              { q:"The identity you chose", a:state.identity },
              { q:"Your proof action (next 24h)", a:state.proof },
            ]} />

            <div style={{ marginTop:14, padding:14, borderRadius:12, background:hexA(C.power,.06), border:`1px solid ${hexA(C.power,.3)}` }}>
              <Row label="Shadow" value="Broke King → Sovereign Builder" accent={C.power} />
              <Row label="Essence returned" value="Power" accent={C.power} />
              <Row label="Your move" value="Proof, not panic" accent={C.power} />
            </div>

            <PhoenixSeal color={C.phoenix} label="CHAPTER THREE · SEALED" />
            <Btn full accent={C.mint} onClick={go}>Carry Power forward →</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== root ============================================================== */
export default function ChapterAlchemy({ onComplete }) {
  const [state, setState] = useState(load);
  useEffect(() => persist(state), [state]);
  const [fired, setFired] = useState(false);
  const [carried] = useState(() => readChapterSave(SHADOW_KEY));
  const update = (fn) => setState(s => { const n = JSON.parse(JSON.stringify(s)); fn(n); return n; });
  const setPhase = (p) => update(s => { s.phase = p; });

  useEffect(() => {
    if (state.phase === "handoff" && !fired && onComplete) {
      setFired(true);
      onComplete({ lie:state.lie, identity:state.identity, proof:state.proof, essence:"power", shadowMask:"broke_king", reforged:"sovereign_builder", complete:true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  return (
    <ChapterFrame>
      {state.phase === "recap"     && <Recap carried={carried} go={()=>setPhase("alchemist")} />}
      {state.phase === "alchemist" && <Alchemist go={()=>setPhase("forge")} />}
      {state.phase === "forge"     && <Forge state={state} update={update} carried={carried} go={()=>setPhase("return")} />}
      {state.phase === "return"    && <Return state={state} go={()=>setPhase("handoff")} />}
      {state.phase === "handoff"   && (
        <div style={{ ...fsWrap(C.black), display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center", padding:24 }}>
          <div>
            <PhoenixSeal color={C.phoenix} label="POWER CARRIED FORWARD" />
            <p style={{ ...serif, fontSize:18, color:C.text, marginTop:8 }}>The forge cools. The road waits.</p>
          </div>
        </div>
      )}
    </ChapterFrame>
  );
}

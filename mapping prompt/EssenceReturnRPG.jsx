import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ============================================================
   ESSENCE RETURN RPG  —  single-file build
   Catch the mask · choose Essence · create proof · earn XP.
   Persistence uses in-memory state (artifact sandbox blocks
   localStorage). Everything else mirrors the original game.
   ============================================================ */

/* ---------- DATA ---------- */
const MASKS = [
  { id: "broke-king", name: "Broke King", emoji: "👑", color: "gold",
    description: "Powerful, gifted, meant for more — but living below the standard.",
    voice: "I know I’m capable of more, but I keep living below who I’m meant to be.",
    gag: "Dollar-store crown. Empty pockets. Still acting royal.",
    essenceReturn: ["Power", "Majesty"] },
  { id: "addict-saint", name: "Addict Saint", emoji: "🙏", color: "rose",
    description: "Loves God, wants greatness, wants healing — but still escapes into old comforts.",
    voice: "I want to change, but this comfort helps me survive the pressure.",
    gag: "Halo flickering while hiding temptation behind his back.",
    essenceReturn: ["Love", "Power"] },
  { id: "silent-prophet", name: "Silent Prophet", emoji: "📜", color: "cyan",
    description: "Has wisdom, a story, a message, years of transformation — but the world hasn’t heard it yet.",
    voice: "I have something to say, but somehow I’m still muted.",
    gag: "Glowing scroll. Unplugged mic. Legendary squeak.",
    essenceReturn: ["Radiance", "Majesty"] },
  { id: "raging-victim", name: "Raging Victim", emoji: "😡", color: "red",
    description: "Uses pain, betrayal, and unfairness as proof to stay angry or justified.",
    voice: "After what happened to me, I have a right to be this way.",
    gag: "Baby Hulk tantrum: smashes first, cries immediately.",
    essenceReturn: ["Love", "Power"] },
  { id: "naive-warrior", name: "Naive Warrior", emoji: "⚔️", color: "blue",
    description: "Huge heart, huge drive, charges forward — but needs structure, wisdom, and consistency.",
    voice: "I’ll figure it out by force. I just need to push harder.",
    gag: "Epic armor. Rubber sword. Gives the shield to the villain.",
    essenceReturn: ["Joy", "Power", "Majesty"] },
];

const ESSENCES = [
  { id: "radiance", name: "Radiance", emoji: "✨", worldEmoji: "🔥",
    meaning: "The light I bring when I am fully alive.",
    affirmation: "I let my light be seen.",
    world: "Phoenix Sun Temple",
    proofActions: ["Record content", "Write the post", "Share the message", "Create the thing", "Let yourself be seen"],
    identity: ["I am someone whose light is meant to be seen.", "I no longer hide what I was made to share.", "My presence gives others permission to shine.", "I take up space without apology."] },
  { id: "love", name: "Love", emoji: "❤️", worldEmoji: "💗",
    meaning: "The heart I lead with when I am not defending.",
    affirmation: "I lead from an open heart, not defense.",
    world: "Heart Sanctuary",
    proofActions: ["Send the text", "Pray", "Forgive", "Encourage someone", "Tell the truth kindly"],
    identity: ["I am safe enough to lead with an open heart.", "I give love without needing to defend myself.", "I am worthy of the love I give to others.", "I choose connection over protection."] },
  { id: "joy", name: "Joy", emoji: "😄", worldEmoji: "🎈",
    meaning: "The freedom and play I access when I stop surviving.",
    affirmation: "I return to freedom, play, and aliveness.",
    world: "Wonder Realm",
    proofActions: ["Go for a walk", "Move your body", "Play music", "Laugh", "Do one fun thing without guilt"],
    identity: ["I am allowed to enjoy my life.", "I no longer have to earn rest or play.", "My joy is a sign of strength, not weakness.", "I am fully alive, right now."] },
  { id: "power", name: "Power", emoji: "⚡", worldEmoji: "🌩️",
    meaning: "The strength I carry when I am aligned and responsible.",
    affirmation: "I take responsibility and move with strength.",
    world: "Storm Citadel",
    proofActions: ["Make the call", "Do the workout", "Close the loop", "Finish the task", "Take the action you are avoiding"],
    identity: ["I am someone who keeps my word to myself.", "I move with strength, not force.", "I take full responsibility for my life.", "I do hard things because of who I am."] },
  { id: "majesty", name: "Majesty", emoji: "👑", worldEmoji: "💎",
    meaning: "The highest version of me walking with dignity, faith, and purpose.",
    affirmation: "I walk with dignity, faith, and purpose.",
    world: "Diamond Kingdom",
    proofActions: ["Clean your environment", "Dress like your future self", "Lead the team", "Raise the standard", "Act with dignity"],
    identity: ["I carry myself with dignity in every room.", "I walk by faith, not by fear.", "I am living as my highest self today.", "I hold the standard I was made for."] },
];

const AWARENESS_QUESTIONS = [
  ["trigger", "What triggered this mask?"],
  ["protection", "What am I protecting myself from?"],
  ["emotion", "What emotion am I avoiding?"],
  ["story", "What story am I believing?"],
  ["cost", "What is this mask costing me today?"],
];

const WORLD_QUESTIONS = [
  ["body", "Where do I feel this Essence in my body?"],
  ["next", "What would this Essence do next?"],
  ["stop", "What would this Essence stop doing?"],
  ["proof", "What is one proof action I will take today?"],
];

const BADGES = [
  "Mask Breaker", "Essence Returned", "Survival Interrupted", "Body Before Battle",
  "Identity Declared", "Proof Over Potential", "Radiance Activated", "Love Activated",
  "Joy Activated", "Power Activated", "Majesty Activated",
];

const BREATH_MANTRAS = [
  "I notice the mask.",
  "I thank it for protecting me.",
  "I release the old strategy.",
  "I return to my body.",
  "I choose Essence.",
];
const BREATH_PHASES = [["INHALE", 4], ["HOLD", 2], ["EXHALE", 6]];

const STEPS = ["start", "mask", "mirror", "breath", "essence", "world", "proof", "complete", "stats"];
const XP_PER_RETURN = 275;
const MILESTONES = ["Sell 200 Accounts", "Publish App", "Make $1M", "Earn Equity"];

/* ---------- STYLES ---------- */
const CSS = `
:root{--cyan:#00F0FF;--purple:#7B2CFF;--mag:#D11EFF;--pink:#FF3EDB;--gold:#FFD84D;--mint:#00FFBF}
.erpg *{box-sizing:border-box}
.erpg{min-height:100vh;font-family:Inter,system-ui,Arial;color:#F2F0F4;position:relative;padding:18px 18px 84px;
  background:radial-gradient(circle at 20% 0%,#281051 0,#05050b 35%,#02030a 100%)}
.erpg button,.erpg textarea,.erpg select{font:inherit}
.erpg .stars{position:fixed;inset:0;pointer-events:none;z-index:0;
  background-image:radial-gradient(rgba(255,255,255,.5) 1px,transparent 1px);background-size:38px 38px;
  -webkit-mask-image:linear-gradient(#000,transparent);mask-image:linear-gradient(#000,transparent);animation:erpg-drift 30s linear infinite}
.erpg .topbar{position:relative;z-index:2;display:flex;justify-content:space-between;align-items:center;max-width:1200px;
  margin:0 auto 16px;padding:12px 14px;border:1px solid rgba(255,255,255,.13);border-radius:18px;background:rgba(8,11,25,.8);backdrop-filter:blur(12px)}
.erpg .topbar b{color:var(--gold);letter-spacing:.08em}
.erpg .screen{position:relative;z-index:1;max-width:1200px;margin:auto}
.erpg .hero,.erpg .panel{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.13);border-radius:28px;
  background:linear-gradient(145deg,rgba(11,16,36,.87),rgba(7,8,22,.93));box-shadow:0 0 40px rgba(123,44,255,.2);padding:28px}
.erpg .hero{min-height:68vh;display:grid;place-items:center;text-align:center}
.erpg .hero h1,.erpg .title h1{font-size:clamp(2.3rem,7vw,5rem);line-height:.9;margin:10px 0;text-transform:uppercase;color:var(--gold);text-shadow:0 0 22px rgba(255,216,77,.4)}
.erpg .hero p,.erpg .title p{font-size:1.15rem;color:#d7ddff;max-width:620px}
.erpg .portal{position:absolute;width:360px;height:360px;border-radius:50%;
  background:conic-gradient(from 0deg,var(--cyan),var(--purple),var(--pink),var(--gold),var(--cyan));filter:blur(22px);opacity:.3}
.erpg .hero .inner{position:relative;z-index:1;display:grid;gap:14px;place-items:center}
.erpg .primary,.erpg .ghost,.erpg .tarot button,.erpg .chip{border:0;border-radius:14px;padding:13px 18px;font-weight:900;text-transform:uppercase;cursor:pointer;transition:transform .12s,box-shadow .2s,opacity .2s}
.erpg .primary,.erpg .tarot button{background:linear-gradient(90deg,var(--gold),#ff9d00);color:#171006;box-shadow:0 0 26px rgba(255,216,77,.35)}
.erpg .primary:hover,.erpg .tarot button:hover{transform:translateY(-2px)}
.erpg .primary:disabled{opacity:.4;cursor:not-allowed;transform:none}
.erpg .big{font-size:1.1rem;padding:17px 24px}
.erpg .ghost{background:rgba(255,255,255,.06);color:#fff;border:1px solid rgba(255,255,255,.14)}
.erpg .badge{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:999px;background:rgba(0,240,255,.13);border:1px solid rgba(0,240,255,.4);color:var(--cyan);font-weight:900;font-size:.8rem;letter-spacing:.05em}
.erpg .badge.danger{background:rgba(255,64,64,.13);border-color:#ff6b6b;color:#ff9f9f}
.erpg .title{margin-bottom:18px}
.erpg section>.title:first-child{text-align:center;display:grid;justify-items:center;gap:6px}
.erpg .cards{display:grid;gap:16px}
.erpg .grid-five{grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}
.erpg .tarot{padding:14px;border-radius:24px;border:2px solid rgba(255,255,255,.14);background:#0a0d19;
  box-shadow:0 0 30px rgba(0,0,0,.5);display:flex;flex-direction:column;gap:10px;text-align:center;position:relative;overflow:hidden;cursor:pointer}
.erpg .tarot:before{content:"";position:absolute;inset:-80px;background:radial-gradient(circle,var(--cyan),transparent 55%);opacity:.12;animation:erpg-pulse 3s ease-in-out infinite}
.erpg .tarot>*{position:relative;z-index:1}
.erpg .tarot h3{font-size:1.25rem;color:#fff;margin:0;text-transform:uppercase}
.erpg .tarot p{color:#cbd3ff;font-size:.92rem;margin:0}
.erpg .tarot .reveal{background:rgba(255,255,255,.06);color:#cbd3ff;border:1px solid rgba(255,255,255,.14);
  padding:8px 10px;font-size:.72rem;letter-spacing:.04em;border-radius:10px}
.erpg .tarot .reveal-body{overflow:hidden;display:grid;gap:8px;text-align:center}
.erpg .tarot .back b{color:var(--cyan)}
.erpg .tarot .back small{display:block;margin-top:8px;color:#9aa3d8;font-style:italic}
.erpg .card-img{height:112px;border-radius:18px;display:grid;place-items:center;position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.1)}
.erpg .card-emoji{font-size:2.9rem;line-height:1;filter:drop-shadow(0 0 14px rgba(255,255,255,.5))}
.erpg .card-label{position:absolute;bottom:7px;font-family:Impact,"Arial Black",sans-serif;font-size:.78rem;letter-spacing:.1em;color:#fff;text-shadow:0 2px 6px #000}
.erpg .gold{border-color:var(--gold)} .erpg .rose{border-color:var(--pink)} .erpg .cyan{border-color:var(--cyan)}
.erpg .red{border-color:#ff5b3d} .erpg .blue{border-color:#00a6ff}
.erpg .essence.radiance{border-color:var(--gold)} .erpg .essence.love{border-color:var(--pink)}
.erpg .essence.joy{border-color:#ffe44d} .erpg .essence.power{border-color:var(--cyan)} .erpg .essence.majesty{border-color:var(--purple)}
.erpg .tarot b.aff{color:var(--gold);font-style:italic;font-weight:700}
.erpg .question-stack{display:grid;gap:14px;margin-bottom:18px}
.erpg .question{display:grid;gap:8px;text-align:left;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:18px;padding:14px}
.erpg .question textarea{min-height:70px;border:1px solid rgba(255,255,255,.13);border-radius:14px;background:#030511;color:#fff;padding:12px;resize:vertical}
.erpg .question.compact textarea{min-height:52px}
.erpg .mirror{text-align:left}
.erpg .scanline{position:absolute;inset:0;pointer-events:none;background:linear-gradient(transparent 0 45%,rgba(0,240,255,.2) 50%,transparent 55%);animation:erpg-scan 2.2s linear infinite}
.erpg .mirror>*{position:relative;z-index:1}
.erpg .breath{text-align:center;transition:background .6s}
.erpg .breath.r0{background:radial-gradient(circle,#6b1717,#070816 65%)}
.erpg .breath.r1{background:radial-gradient(circle,#4d176b,#070816 65%)}
.erpg .breath.r2{background:radial-gradient(circle,#14336b,#070816 65%)}
.erpg .breath.r3{background:radial-gradient(circle,#076258,#070816 65%)}
.erpg .breath.r4{background:radial-gradient(circle,#6b5614,#070816 65%)}
.erpg .orb-wrap{height:300px;display:grid;place-items:center}
.erpg .breath-orb{width:200px;height:200px;border-radius:50%;display:grid;place-items:center;
  background:radial-gradient(circle at 35% 30%,#fff,var(--cyan) 22%,#1573ff 55%,#06152e 72%);box-shadow:0 0 50px var(--cyan),inset 0 0 30px rgba(255,255,255,.5)}
.erpg .breath-orb span{font-weight:900;color:#001020;letter-spacing:.08em}
.erpg .breath h2{font-size:3rem;margin:6px 0}
.erpg .mantra{font-size:1.4rem;color:var(--gold);font-weight:900}
.erpg .complete-flash{color:var(--mint);text-shadow:0 0 20px var(--mint)}
.erpg .world{position:relative;min-height:78vh;border-radius:28px;overflow:hidden;border:1px solid rgba(255,255,255,.13)}
.erpg .world-art{position:absolute;inset:0;display:grid;place-items:center}
.erpg .world-art .wemoji{font-size:8.5rem;opacity:.45;filter:blur(1px) drop-shadow(0 0 36px rgba(255,255,255,.3))}
.erpg .world.radiance{background:radial-gradient(circle at 50% 30%,#FFD84D55,#03040a 70%)}
.erpg .world.love{background:radial-gradient(circle at 50% 30%,#FF3EDB55,#03040a 70%)}
.erpg .world.joy{background:radial-gradient(circle at 50% 30%,#ffe44d55,#03040a 70%)}
.erpg .world.power{background:radial-gradient(circle at 50% 30%,#00F0FF55,#03040a 70%)}
.erpg .world.majesty{background:radial-gradient(circle at 50% 30%,#7B2CFF66,#03040a 70%)}
.erpg .world-content{position:relative;z-index:1;max-width:720px;margin:0 auto;padding:28px;text-align:left}
.erpg .world-content .badge{margin-bottom:8px}
.erpg .world h1{font-size:clamp(2.1rem,6vw,4rem);color:var(--gold);text-shadow:0 0 25px #000;margin:.2em 0}
.erpg .world-content>p{color:#fce9b8;font-size:1.15rem;margin-bottom:18px}
.erpg .chips{display:flex;flex-wrap:wrap;gap:10px;margin:18px 0}
.erpg .chip{background:rgba(255,255,255,.07);color:#fff;border:1px solid rgba(255,255,255,.14)}
.erpg .chip.active{background:linear-gradient(90deg,var(--cyan),var(--purple));color:#fff;box-shadow:0 0 18px rgba(0,240,255,.4)}
.erpg .link-box{display:grid;gap:8px;margin:16px 0;padding:16px;border-radius:18px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09)}
.erpg .link-box select{padding:12px;border-radius:12px;background:#040716;color:#fff;border:1px solid rgba(255,255,255,.13)}
.erpg .link-box small{color:#9aa3d8}
.erpg .complete{text-align:center;min-height:66vh;display:grid;place-items:center;gap:6px}
.erpg .complete .inner{display:grid;gap:16px;justify-items:center;width:100%}
.erpg .ritual-cue{color:#d7ddff;font-size:1.02rem;line-height:1.5;max-width:560px}
.erpg .big-i p{font-size:1.15rem}
.erpg .affirm-stack{display:grid;gap:10px;width:100%;max-width:560px}
.erpg .affirm{display:flex;align-items:center;gap:12px;text-align:left;padding:15px 16px;border-radius:16px;cursor:pointer;
  background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);color:#eef0ff;font-size:1.05rem;font-weight:600;
  transition:background .25s,border-color .25s,transform .1s}
.erpg .affirm:hover{background:rgba(255,255,255,.09)}
.erpg .affirm .affirm-mark{font-size:1.2rem;flex:0 0 auto;width:26px;text-align:center;opacity:.7}
.erpg .affirm.said{background:linear-gradient(90deg,rgba(0,255,191,.18),rgba(123,44,255,.18));border-color:var(--mint);color:#fff}
.erpg .affirm.said .affirm-mark{opacity:1}
.erpg .statement{font-size:1.25rem;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.13);border-radius:22px;padding:20px;max-width:640px;line-height:1.7}
.erpg .statement b{color:var(--gold)}
.erpg .badge-row,.erpg .badges{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.erpg .badge-row span,.erpg .badges span{padding:10px 12px;border-radius:999px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);font-size:.85rem}
.erpg .xp-toast{position:fixed;top:90px;right:25px;z-index:30;font-size:2rem;color:#9dff43;font-weight:900;text-shadow:0 0 20px #9dff43;pointer-events:none}
.erpg .stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;margin:18px 0}
.erpg .stat{padding:18px;border-radius:20px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09)}
.erpg .stat b{color:#cbd3ff;font-size:.85rem}
.erpg .stat strong{display:block;font-size:2rem;color:var(--gold)}
.erpg .bar{display:grid;grid-template-columns:180px 1fr 48px;gap:10px;align-items:center;margin:10px 0}
.erpg .bar i{display:block;height:14px;border-radius:999px;background:linear-gradient(90deg,var(--mag),var(--cyan),var(--gold));box-shadow:0 0 16px rgba(0,240,255,.47);min-width:2px;transition:width .6s}
.erpg .panel h2{margin:22px 0 8px;color:#fff}
.erpg .confetti{position:fixed;inset:0;pointer-events:none;z-index:25;overflow:hidden}
.erpg .confetti i{position:absolute;top:-12px;width:9px;height:14px;border-radius:2px;animation:erpg-fall linear forwards}
.erpg .stepper{position:sticky;bottom:10px;z-index:2;max-width:900px;margin:18px auto 0;display:flex;gap:6px;overflow:auto;
  padding:8px;background:rgba(5,8,22,.87);border:1px solid rgba(255,255,255,.09);border-radius:999px}
.erpg .stepper span{font-size:.72rem;text-transform:uppercase;padding:8px 10px;border-radius:999px;color:rgba(255,255,255,.53);white-space:nowrap}
.erpg .stepper .active{background:var(--gold);color:#1a1000;font-weight:900}
@keyframes erpg-pulse{50%{opacity:.24;transform:scale(1.1)}}
@keyframes erpg-drift{to{background-position:300px 600px}}
@keyframes erpg-scan{from{transform:translateY(-100%)}to{transform:translateY(100%)}}
@keyframes erpg-fall{to{transform:translateY(105vh) rotate(720deg);opacity:.9}}
@media(max-width:640px){.erpg{padding:10px}.erpg .hero,.erpg .panel{padding:16px}
  .erpg .grid-five{grid-template-columns:repeat(2,1fr);gap:10px}
  .erpg .card-img{height:96px}.erpg .card-emoji{font-size:2.5rem}.erpg .card-label{font-size:.66rem}
  .erpg .tarot{padding:10px;gap:8px}.erpg .tarot h3{font-size:1.05rem}.erpg .tarot p{font-size:.82rem}
  .erpg .tarot button{padding:11px 8px;font-size:.82rem}
  .erpg .hero h1,.erpg .title h1{font-size:clamp(1.5rem,5.5vw,2rem);line-height:1;margin:6px 0}
  .erpg .hero p,.erpg .title p{font-size:1rem}
  .erpg .title{margin-bottom:12px}
  .erpg .hero{min-height:auto}
  .erpg .badge{font-size:.72rem;padding:6px 10px}
  .erpg .bar{grid-template-columns:1fr auto}.erpg .bar i{grid-column:1/-1}
  .erpg .orb-wrap{height:240px}.erpg .breath-orb{width:165px;height:165px}
  .erpg .stepper{margin-bottom:6px}}
@media(prefers-reduced-motion:reduce){.erpg *{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;

/* ---------- SMALL PIECES ---------- */
function CardArt({ emoji, label, gradient }) {
  return (
    <div className="card-img" style={{ background: gradient }}>
      <span className="card-emoji">{emoji}</span>
      <span className="card-label">{label}</span>
    </div>
  );
}

function Confetti({ run }) {
  const pieces = useRef(
    Array.from({ length: 90 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      dur: 2.4 + Math.random() * 1.8,
      color: ["#FFD84D", "#00F0FF", "#FF3EDB", "#7B2CFF", "#00FFBF"][i % 5],
      rot: Math.random() * 360,
    }))
  ).current;
  if (!run) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i key={i} style={{
          left: `${p.left}%`, background: p.color,
          animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`,
          transform: `rotate(${p.rot}deg)`,
        }} />
      ))}
    </div>
  );
}

const maskGradient = (m) => ({
  gold: "radial-gradient(circle at 50% 35%,#FFD84D,#7B2CFF 60%,#03040a)",
  rose: "radial-gradient(circle at 50% 35%,#FF3EDB,#7B2CFF 60%,#03040a)",
  cyan: "radial-gradient(circle at 50% 35%,#00F0FF,#7B2CFF 60%,#03040a)",
  red: "radial-gradient(circle at 50% 35%,#ff5b3d,#7B2CFF 60%,#03040a)",
  blue: "radial-gradient(circle at 50% 35%,#00a6ff,#7B2CFF 60%,#03040a)",
}[m.color]);

const essGradient = {
  radiance: "radial-gradient(circle at 50% 35%,#FFD84D,#00F0FF 55%,#03040a)",
  love: "radial-gradient(circle at 50% 35%,#FF3EDB,#7B2CFF 55%,#03040a)",
  joy: "radial-gradient(circle at 50% 35%,#ffe44d,#FF3EDB 55%,#03040a)",
  power: "radial-gradient(circle at 50% 35%,#00F0FF,#1573ff 55%,#03040a)",
  majesty: "radial-gradient(circle at 50% 35%,#FFD84D,#7B2CFF 55%,#03040a)",
};

/* ---------- SCREENS ---------- */
function Screen({ children }) {
  return (
    <motion.div className="screen"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.35 }}>
      {children}
    </motion.div>
  );
}

function MaskCard({ mask, index, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.article className={`tarot mask ${mask.color} ${open ? "open" : ""}`}
      initial={{ opacity: 0, y: 40, rotate: -6 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ delay: index * 0.08, type: "spring" }}
      whileHover={{ y: -6, scale: 1.02 }}>
      <CardArt emoji={mask.emoji} label={mask.name.toUpperCase()} gradient={maskGradient(mask)} />
      <h3>{mask.name}</h3>
      <button className="reveal" onClick={() => setOpen((o) => !o)}>
        {open ? "Hide details ▲" : "Show details ▼"}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div className="reveal-body"
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <p>{mask.description}</p>
            <div className="back">
              <b>Mask Voice</b>
              <p>“{mask.voice}”</p>
              <small>{mask.gag}</small>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => onSelect(mask)}>This is running me</button>
    </motion.article>
  );
}

function MaskDraw({ onSelect }) {
  return (
    <section>
      <div className="title">
        <span className="badge">Step 1</span>
        <h1>What Mask Am I Wearing?</h1>
      </div>
      <div className="cards grid-five">
        {MASKS.map((m, i) => <MaskCard key={m.id} mask={m} index={i} onSelect={onSelect} />)}
      </div>
    </section>
  );
}

function AwarenessMirror({ mask, onComplete, onBack }) {
  const [answers, setAnswers] = useState({});
  return (
    <section className="panel mirror">
      <div className="scanline" />
      <button className="ghost" onClick={onBack}>← Pick another mask</button>
      <div className="title" style={{ marginTop: 14 }}>
        <span className="badge danger">Mask Detected</span>
        <h1>{mask?.emoji} {mask?.name}</h1>
        <p>{mask?.voice}</p>
      </div>
      <div className="question-stack">
        {AWARENESS_QUESTIONS.map(([key, q], i) => (
          <motion.label key={key} className="question"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
            <b>{i + 1}. {q}</b>
            <textarea value={answers[key] || ""}
              onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
              placeholder="Quick answer — not homework." />
          </motion.label>
        ))}
      </div>
      <button className="primary" onClick={() => onComplete(answers)}>Continue to Body Reset</button>
    </section>
  );
}

function BreathingReset({ mask, onComplete }) {
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState(0);
  const [count, setCount] = useState(BREATH_PHASES[0][1]);
  const [done, setDone] = useState(false);
  const advanced = useRef(false);

  useEffect(() => {
    if (done) return;
    setCount(BREATH_PHASES[phase][1]);
    const t = setInterval(() => setCount((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [phase, round, done]);

  useEffect(() => {
    if (done || count > 0) return;
    if (phase < 2) { setPhase(phase + 1); return; }
    if (round < 4) { setRound(round + 1); setPhase(0); return; }
    setDone(true);
  }, [count, phase, round, done]);

  // Once the last round finishes, show the flash briefly then advance — fires exactly once.
  useEffect(() => {
    if (!done || advanced.current) return;
    advanced.current = true;
    const t = setTimeout(() => onComplete(), 1100);
    return () => clearTimeout(t);
  }, [done, onComplete]);

  const phaseName = BREATH_PHASES[phase][0];
  const scale = phaseName === "EXHALE" ? 0.82 : 1.35;
  const dur = phaseName === "EXHALE" ? 6 : phaseName === "INHALE" ? 4 : 2;

  return (
    <section className={`panel breath r${round}`}>
      <div className="title">
        <span className="badge">Step 3</span>
        <h1>Return to the Body</h1>
        <p>The mask lives in the nervous system. Come back to the body before choosing Essence.</p>
      </div>
      <div className="orb-wrap">
        <motion.div className="breath-orb" animate={{ scale }} transition={{ duration: dur, ease: "easeInOut" }}>
          <span>{phaseName}</span>
        </motion.div>
      </div>
      <h2>{Math.max(count, 0)}</h2>
      <p className="mantra">{BREATH_MANTRAS[round]}</p>
      <p>Round {round + 1} of 5 • {mask?.name} dissolving…</p>
      {done && <h2 className="complete-flash">Survival Mode Interrupted</h2>}
    </section>
  );
}

function EssenceCardItem({ essence, index, onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.article className={`tarot essence ${essence.id} ${open ? "open" : ""}`}
      initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, type: "spring" }} whileHover={{ scale: 1.02, y: -6 }}>
      <CardArt emoji={essence.emoji} label={essence.name.toUpperCase()} gradient={essGradient[essence.id]} />
      <h3>{essence.name}</h3>
      <button className="reveal" onClick={() => setOpen((o) => !o)}>
        {open ? "Hide details ▲" : "Show details ▼"}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div className="reveal-body"
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <p>{essence.meaning}</p>
            <b className="aff">“{essence.affirmation}”</b>
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={() => onSelect(essence)}>Activate {essence.name}</button>
    </motion.article>
  );
}

function EssenceSelect({ mask, onSelect }) {
  return (
    <section>
      <div className="title">
        <span className="badge">Step 4</span>
        <h1>Choose Your Essence</h1>
        <p>{mask?.name} returns through: <b>{mask?.essenceReturn?.join(" + ")}</b>. Choose who leads now.</p>
      </div>
      <div className="cards grid-five">
        {ESSENCES.map((e, i) => <EssenceCardItem key={e.id} essence={e} index={i} onSelect={onSelect} />)}
      </div>
    </section>
  );
}

function EssenceWorld({ essence, onComplete }) {
  const [a, setA] = useState({});
  return (
    <section className={`world ${essence?.id}`}>
      <motion.div className="world-art" initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }}>
        <span className="wemoji">{essence?.worldEmoji}</span>
      </motion.div>
      <div className="world-content">
        <span className="badge">{essence?.world}</span>
        <h1>{essence?.emoji} {essence?.name} Activated</h1>
        <p>{essence?.affirmation}</p>
        {WORLD_QUESTIONS.map(([k, q]) => (
          <label className="question compact" key={k}>
            <b>{q}</b>
            <textarea value={a[k] || ""} onChange={(e) => setA({ ...a, [k]: e.target.value })} />
          </label>
        ))}
        <button className="primary" style={{ marginTop: 16 }} onClick={() => onComplete(a)}>Create Proof Action</button>
      </div>
    </section>
  );
}

function ProofAction({ essence, onComplete }) {
  const [proof, setProof] = useState("");
  const [milestone, setMilestone] = useState(MILESTONES[0]);
  return (
    <section className="panel">
      <div className="title">
        <span className="badge">Step 6</span>
        <h1>One Proof Action</h1>
        <p>Your brain does not believe affirmations. It believes proof.</p>
      </div>
      <div className="chips">
        {essence?.proofActions?.map((p) => (
          <button key={p} className={proof === p ? "chip active" : "chip"} onClick={() => setProof(p)}>{p}</button>
        ))}
      </div>
      <label className="question">
        <b>Or write your own proof action</b>
        <textarea value={proof} onChange={(e) => setProof(e.target.value)}
          placeholder="Example: Make the call I’ve been avoiding." />
      </label>
      <div className="link-box">
        <b>Connect this proof to a milestone</b>
        <select value={milestone} onChange={(e) => setMilestone(e.target.value)}>
          {MILESTONES.map((m) => <option key={m}>{m}</option>)}
        </select>
        <small>This proof gets logged against <b>{milestone}</b> in your Stats.</small>
      </div>
      <button className="primary" disabled={!proof.trim()}
        onClick={() => onComplete({ proof: proof.trim(), milestone })}>Lock In &amp; Earn XP</button>
    </section>
  );
}

function EssenceComplete({ run, onSave, onRestart }) {
  const saved = useRef(false);
  const essence = run.selectedEssence;
  const affirmations = essence?.identity || [];
  // ritual stages: 0 = return statement, 1 = "I am complete", 2 = speak affirmations, 3 = reward
  const [stage, setStage] = useState(0);
  const [spoken, setSpoken] = useState([]); // indexes of affirmations said out loud
  const allSpoken = affirmations.length > 0 && spoken.length === affirmations.length;

  useEffect(() => {
    if (!saved.current && run.selectedMask && run.selectedEssence) {
      saved.current = true;
      onSave(run);
    }
  }, [run, onSave]);

  const speak = (i) => setSpoken((s) => (s.includes(i) ? s : [...s, i]));

  return (
    <section className={`panel complete ${essence?.id}`}>
      {stage === 3 && <Confetti run />}
      {stage === 3 && (
        <motion.div className="xp-toast" initial={{ scale: 0.2, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring" }}>
          +{XP_PER_RETURN} XP
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* 1 — the return statement */}
        {stage === 0 && (
          <motion.div className="inner" key="return"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <span className="badge">The Return</span>
            <h1>Mask Released</h1>
            <div className="statement">
              <p>I notice the <b>{run.selectedMask?.name}</b>.</p>
              <p>I thank it for protecting me.</p>
              <p>I no longer let it lead.</p>
              <p>I choose <b>{essence?.name}</b>.</p>
              <p>My next proof is: <b>{run.proofAction}</b>.</p>
              {run.milestone && <p>Logged toward: <b>{run.milestone}</b>.</p>}
            </div>
            <button className="primary big" onClick={() => setStage(1)}>Seal the Return</button>
          </motion.div>
        )}

        {/* 2 — I am complete */}
        {stage === 1 && (
          <motion.div className="inner" key="complete"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
            <span className="badge">Wholeness</span>
            <motion.h1 className="complete-flash" style={{ fontSize: "clamp(2.2rem,9vw,4rem)" }}
              animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2.4, repeat: Infinity }}>
              I AM COMPLETE.
            </motion.h1>
            <p className="ritual-cue">Place a hand on your chest. Take one slow breath.<br />Say it out loud, like you mean it:</p>
            <div className="statement big-i">
              <p>I am not broken. I am not behind.</p>
              <p>I am whole, exactly as I am right now.</p>
              <p>Nothing was missing — only forgotten.</p>
            </div>
            <button className="primary big" onClick={() => setStage(2)}>Build My New Identity</button>
          </motion.div>
        )}

        {/* 3 — spoken identity affirmations */}
        {stage === 2 && (
          <motion.div className="inner" key="identity"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <span className="badge">{essence?.emoji} New Identity · {essence?.name}</span>
            <h1 style={{ fontSize: "clamp(1.6rem,6vw,2.4rem)" }}>Say It Out Loud</h1>
            <p className="ritual-cue">Your brain believes what it hears you say. Speak each line aloud, then tap it. {spoken.length}/{affirmations.length} declared.</p>
            <div className="affirm-stack">
              {affirmations.map((line, i) => {
                const said = spoken.includes(i);
                return (
                  <motion.button key={i} className={`affirm ${said ? "said" : ""}`}
                    onClick={() => speak(i)} whileTap={{ scale: 0.97 }}>
                    <span className="affirm-mark">{said ? "🔊" : "○"}</span>
                    <span>“{line}”</span>
                  </motion.button>
                );
              })}
            </div>
            <button className="primary big" disabled={!allSpoken} onClick={() => setStage(3)}>
              {allSpoken ? "I Have Spoken It" : "Speak all lines to continue"}
            </button>
          </motion.div>
        )}

        {/* 4 — reward */}
        {stage === 3 && (
          <motion.div className="inner" key="reward"
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
            <h1>Return Complete</h1>
            <div className="statement">
              <p>Today I returned to <b>{essence?.name}</b>.</p>
              <p>I declared a new identity out loud.</p>
              <p>My proof: <b>{run.proofAction}</b>.</p>
            </div>
            <div className="badge-row">
              <span>🏅 Mask Breaker</span>
              <span>🏅 Essence Returned</span>
              <span>🏅 Identity Declared</span>
            </div>
            <button className="primary big" onClick={onRestart}>Back to Command Center</button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function MaskStats({ store, onBack }) {
  const { entries, xp } = store;
  const total = entries.length;
  const countMask = (id) => entries.filter((e) => e.selectedMaskId === id).length;
  const countEss = (id) => entries.filter((e) => e.selectedEssenceId === id).length;
  const mostMask = total ? [...MASKS].sort((a, b) => countMask(b.id) - countMask(a.id))[0] : null;
  const mostEss = total ? [...ESSENCES].sort((a, b) => countEss(b.id) - countEss(a.id))[0] : null;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  return (
    <section className="panel">
      <button className="ghost" onClick={onBack}>← Back</button>
      <h1 style={{ color: "var(--gold)", textTransform: "uppercase", marginTop: 14 }}>Your Essence Stats</h1>
      <div className="stats-grid">
        <div className="stat"><b>Total XP</b><strong>{xp}</strong></div>
        <div className="stat"><b>Total Returns</b><strong>{total}</strong></div>
        <div className="stat"><b>Most Common Mask</b><strong style={{ fontSize: "1.3rem" }}>{mostMask?.name || "None yet"}</strong></div>
        <div className="stat"><b>Most Chosen Essence</b><strong style={{ fontSize: "1.3rem" }}>{mostEss?.name || "None yet"}</strong></div>
      </div>
      <h2>Mask Breakdown</h2>
      {MASKS.map((m) => (
        <div className="bar" key={m.id}>
          <span>{m.emoji} {m.name}</span>
          <i style={{ width: `${pct(countMask(m.id))}%` }} />
          <b>{pct(countMask(m.id))}%</b>
        </div>
      ))}
      <h2>Proofs by Milestone</h2>
      {MILESTONES.map((ms) => {
        const n = entries.filter((e) => e.milestone === ms).length;
        return (
          <div className="bar" key={ms}>
            <span>🎯 {ms}</span>
            <i style={{ width: `${pct(n)}%` }} />
            <b>{n}</b>
          </div>
        );
      })}
      <h2>Badges</h2>
      <div className="badges">{BADGES.map((b) => <span key={b}>🏅 {b}</span>)}</div>
    </section>
  );
}

/* ---------- SHELL ---------- */
export default function EssenceReturnRPG() {
  const [step, setStep] = useState("start");
  const [run, setRun] = useState({ awarenessAnswers: {}, visualizationAnswers: {} });
  const [store, setStore] = useState({ entries: [], xp: 0 }); // in-memory persistence
  const patch = (data) => setRun((prev) => ({ ...prev, ...data }));

  const saveEntry = (r) => {
    setStore((prev) => ({
      xp: prev.xp + XP_PER_RETURN,
      entries: [{
        id: Math.random().toString(36).slice(2),
        createdAt: new Date().toISOString(),
        selectedMaskId: r.selectedMask?.id,
        selectedEssenceId: r.selectedEssence?.id,
        proofAction: r.proofAction,
        milestone: r.milestone,
      }, ...prev.entries],
    }));
  };

  return (
    <div className="erpg">
      <style>{CSS}</style>
      <div className="stars" />
      <header className="topbar">
        <b>ESSENCE RETURN RPG</b>
        <button className="ghost" onClick={() => setStep("stats")}>Stats</button>
      </header>

      <AnimatePresence mode="wait">
        {step === "start" && (
          <Screen key="start">
            <section className="hero">
              <motion.div className="portal" animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }} />
              <div className="inner">
                <h1>Essence Return Game</h1>
                <p>Catch the mask. Choose Essence. Create proof.</p>
                <button className="primary big" onClick={() => setStep("mask")}>Start Essence Return</button>
                <button className="ghost" onClick={() => setStep("stats")}>View Mask Stats</button>
              </div>
            </section>
          </Screen>
        )}

        {step === "mask" && (
          <Screen key="mask">
            <MaskDraw onSelect={(m) => { patch({ selectedMask: m }); setStep("mirror"); }} />
          </Screen>
        )}

        {step === "mirror" && (
          <Screen key="mirror">
            <AwarenessMirror mask={run.selectedMask} onBack={() => setStep("mask")}
              onComplete={(answers) => { patch({ awarenessAnswers: answers }); setStep("breath"); }} />
          </Screen>
        )}

        {step === "breath" && (
          <Screen key="breath">
            <BreathingReset mask={run.selectedMask}
              onComplete={() => { patch({ breathingCompleted: true }); setStep("essence"); }} />
          </Screen>
        )}

        {step === "essence" && (
          <Screen key="essence">
            <EssenceSelect mask={run.selectedMask}
              onSelect={(e) => { patch({ selectedEssence: e }); setStep("world"); }} />
          </Screen>
        )}

        {step === "world" && (
          <Screen key="world">
            <EssenceWorld essence={run.selectedEssence}
              onComplete={(viz) => { patch({ visualizationAnswers: viz }); setStep("proof"); }} />
          </Screen>
        )}

        {step === "proof" && (
          <Screen key="proof">
            <ProofAction essence={run.selectedEssence}
              onComplete={({ proof, milestone }) => { patch({ proofAction: proof, milestone }); setStep("complete"); }} />
          </Screen>
        )}

        {step === "complete" && (
          <Screen key="complete">
            <EssenceComplete run={run} onSave={saveEntry}
              onRestart={() => { setRun({ awarenessAnswers: {}, visualizationAnswers: {} }); setStep("start"); }} />
          </Screen>
        )}

        {step === "stats" && (
          <Screen key="stats">
            <MaskStats store={store} onBack={() => setStep("start")} />
          </Screen>
        )}
      </AnimatePresence>

      <nav className="stepper">
        {STEPS.slice(0, 8).map((s) => <span key={s} className={s === step ? "active" : ""}>{s}</span>)}
      </nav>
    </div>
  );
}

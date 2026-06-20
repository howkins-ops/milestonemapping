import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase.js";

// ─── SVG icons ────────────────────────────────────────────────────────────────

function LogoSVG({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M12 2L3 7v13l9-3 9 3V7L12 2z" fill="rgba(29,232,255,0.15)" stroke="#1de8ff" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M12 2v17" stroke="#1de8ff" strokeWidth="1.5"/>
      <path d="M3 7l9 3 9-3" stroke="#1de8ff" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7z" stroke="#1de8ff" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 4v13M15 7v13" stroke="#1de8ff" strokeWidth="1.5"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 2l8 3.5V12c0 4.5-3.5 8-8 10C7.5 20 4 16.5 4 12V5.5L12 2z" stroke="#1de8ff" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M9 12l2 2 4-4" stroke="#1de8ff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function DiamondIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 3h12l4 6-10 12L2 9l4-6z" stroke="#1de8ff" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M2 9h20M10 3l2 6 2-6" stroke="#1de8ff" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

function WingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 12C8 7 2 7 2 12s4 5 6 4M12 12c4-5 10-5 10 0s-4 5-6 4" stroke="#ff3fb4" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="2" fill="#ff3fb4" opacity="0.6"/>
    </svg>
  );
}

// ─── Phoenix illustration ─────────────────────────────────────────────────────

function PhoenixHero() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <svg viewBox="0 0 420 500" style={{ width: "90%", maxWidth: "420px", height: "auto" }}>
        <defs>
          <radialGradient id="bgG" cx="50%" cy="42%" r="48%">
            <stop offset="0%" stopColor="#8b5cff" stopOpacity="0.5"/>
            <stop offset="60%" stopColor="#ff3fb4" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="tG" cx="50%" cy="78%" r="32%">
            <stop offset="0%" stopColor="#ff3fb4" stopOpacity="0.38"/>
            <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="wL" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1de8ff" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#8b5cff" stopOpacity="0.4"/>
          </linearGradient>
          <linearGradient id="wR" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1de8ff" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#8b5cff" stopOpacity="0.4"/>
          </linearGradient>
          <linearGradient id="tL" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8b5cff"/>
            <stop offset="100%" stopColor="#ff3fb4"/>
          </linearGradient>
          <filter id="gl" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="sg" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="6" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <ellipse cx="210" cy="220" rx="155" ry="155" fill="url(#bgG)"/>
        <ellipse cx="210" cy="380" rx="95" ry="85" fill="url(#tG)"/>

        {/* arch */}
        <path d="M118,140 A102,102 0 0,1 302,140" fill="none" stroke="rgba(29,232,255,0.35)" strokeWidth="1.4" filter="url(#gl)"/>

        {/* left wings */}
        <path d="M210,195 C175,155 115,118 48,80 C72,145 132,172 182,208" fill="rgba(29,232,255,0.04)" stroke="url(#wL)" strokeWidth="1.7" filter="url(#gl)"/>
        <path d="M210,195 C165,145 95,100 22,58 C52,132 122,160 182,208" fill="rgba(139,92,255,0.03)" stroke="rgba(139,92,255,0.5)" strokeWidth="1.1" filter="url(#gl)"/>
        <path d="M210,195 C178,178 125,162 66,156 C96,173 148,190 182,218" fill="none" stroke="rgba(255,63,180,0.35)" strokeWidth="0.9" filter="url(#gl)"/>

        {/* right wings */}
        <path d="M210,195 C245,155 305,118 372,80 C348,145 288,172 238,208" fill="rgba(29,232,255,0.04)" stroke="url(#wR)" strokeWidth="1.7" filter="url(#gl)"/>
        <path d="M210,195 C255,145 325,100 398,58 C368,132 298,160 238,208" fill="rgba(139,92,255,0.03)" stroke="rgba(139,92,255,0.5)" strokeWidth="1.1" filter="url(#gl)"/>
        <path d="M210,195 C242,178 295,162 354,156 C324,173 272,190 238,218" fill="none" stroke="rgba(255,63,180,0.35)" strokeWidth="0.9" filter="url(#gl)"/>

        {/* diamond */}
        <path d="M210,42 L235,78 L210,100 L185,78 Z" fill="rgba(29,232,255,0.08)" stroke="#1de8ff" strokeWidth="1.8" filter="url(#gl)"/>
        <path d="M185,78 L210,42 L235,78 M185,78 L210,100 L235,78 M185,78 L235,78" fill="none" stroke="rgba(29,232,255,0.45)" strokeWidth="0.8"/>

        {/* head */}
        <ellipse cx="210" cy="165" rx="14" ry="18" fill="rgba(29,232,255,0.1)" stroke="#1de8ff" strokeWidth="1.3" filter="url(#gl)"/>
        <path d="M220,162 L234,165 L220,168" fill="none" stroke="#1de8ff" strokeWidth="1.3" strokeLinecap="round"/>

        {/* body */}
        <ellipse cx="210" cy="215" rx="19" ry="26" fill="rgba(139,92,255,0.1)" stroke="rgba(139,92,255,0.42)" strokeWidth="1.3" filter="url(#gl)"/>

        {/* tail */}
        <path d="M203,240 C197,292 185,342 170,412" fill="none" stroke="url(#tL)" strokeWidth="2.2" filter="url(#gl)"/>
        <path d="M210,244 C208,300 207,358 204,432" fill="none" stroke="url(#tL)" strokeWidth="3" filter="url(#sg)"/>
        <path d="M217,240 C223,292 235,342 250,412" fill="none" stroke="url(#tL)" strokeWidth="2.2" filter="url(#gl)"/>
        <path d="M206,242 C192,326 174,376 155,448" fill="none" stroke="rgba(255,63,180,0.32)" strokeWidth="1.6" filter="url(#gl)"/>
        <path d="M214,242 C228,326 246,376 265,448" fill="none" stroke="rgba(255,63,180,0.32)" strokeWidth="1.6" filter="url(#gl)"/>

        {/* stars */}
        {[[48,32],[375,24],[18,172],[402,130],[66,282],[398,246],[120,48],[320,42],[14,112],[416,88],[178,26],[272,18]].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r={i%3===0?1.6:0.9} fill={i%2===0?"#1de8ff":"#8b5cff"} opacity={0.5+i%3*0.15}/>
        ))}

        {/* journey path + nodes */}
        <path d="M330,438 C306,418 278,400 256,378 C238,360 226,340 220,320" fill="none" stroke="rgba(29,232,255,0.22)" strokeWidth="1.6" strokeDasharray="4,4"/>
        {[[330,438],[278,402],[238,368],[222,328]].map(([cx,cy],i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="12" fill="rgba(4,6,14,0.85)" stroke="rgba(139,92,255,0.6)" strokeWidth="1.4"/>
            <circle cx={cx} cy={cy} r="4" fill="rgba(139,92,255,0.45)"/>
          </g>
        ))}
      </svg>

      {/* journey labels */}
      <div style={{ position: "absolute", right: "3%", bottom: "6%", display: "flex", flexDirection: "column", gap: "1.8rem" }}>
        {[
          { label: "TRANSFORM", desc: "Become your\nhighest self." },
          { label: "ACHIEVE",   desc: "Unlock your\nnext level." },
          { label: "MILESTONE", desc: "Small steps.\nBig changes." },
          { label: "START",     desc: "Every journey\nbegins here." },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            <div style={{ width: "22px", height: "22px", borderRadius: "50%", border: "1.4px solid rgba(139,92,255,0.6)", background: "rgba(4,6,14,0.7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "rgba(139,92,255,0.55)" }}/>
            </div>
            <div>
              <div style={{ fontSize: "0.55rem", fontWeight: 700, color: "#eafbff", letterSpacing: "0.1em" }}>{item.label}</div>
              <div style={{ fontSize: "0.52rem", color: "rgba(234,251,255,0.42)", whiteSpace: "pre-line", lineHeight: 1.35 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Auth Gate ────────────────────────────────────────────────────────────────

export default function AuthGate({ children }) {
  const [session, setSession]   = useState(undefined);
  const [mode, setMode]         = useState("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [info, setInfo]         = useState("");
  const [busy, setBusy]         = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    if (!supabase) { setSession(null); return; }
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const handleChange = () => setIsNarrow(query.matches);
    handleChange();
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  if (session === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#020408" }}>
        <p style={{ color: "#1de8ff", letterSpacing: "0.2em", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.85rem" }}>
          INITIALIZING SESSION...
        </p>
      </div>
    );
  }

  if (session)   return children(session.user.id, session.user.email, () => supabase.auth.signOut());
  if (!supabase) return children(null, null, null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setInfo(""); setBusy(true);
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setInfo("Check your email to confirm your account, then sign in.");
        setMode("login");
      } else if (mode === "reset") {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email);
        if (err) throw err;
        setInfo("Password reset link sent — check your email.");
        setMode("login");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const loginTitle = mode === "signup" ? "CREATE ACCOUNT" : mode === "reset" ? "RESET PASSWORD" : "MISSION CONTROL";
  const loginSub   = mode === "signup" ? "Map the mission. Save it forever." : mode === "reset" ? "Enter your email to receive a reset link." : "Sign in to sync your milestones across devices.";
  const loginCTA   = mode === "signup" ? "CREATE ACCOUNT" : mode === "reset" ? "SEND RESET LINK" : "SIGN IN";

  return (
    <div style={{ ...S.root, ...(isNarrow ? S.rootMobile : null) }}>
      <div style={S.scanline} />

      {/* ── 2×2 GRID ─────────────────────────────────────────── */}
      <div style={{ ...S.grid, ...(isNarrow ? S.gridMobile : null) }}>

        {/* Q1 — Hero text */}
        <div style={{ ...S.q1, ...(isNarrow ? S.q1Mobile : null) }}>
          <div style={S.logo}>
            <LogoSVG size={24} />
            <div>
              <div style={S.logoLine1}>MILESTONE</div>
              <div style={S.logoLine2}>MAPPING</div>
            </div>
          </div>

          <h1 style={S.headline}>
            YOUR NEXT LIFE<br/>IS BUILT ONE<br/>
            <span style={S.milestoneWord}>MILESTONE</span><br/>AT A TIME
          </h1>
          <div style={S.tealBar} />

          <div style={S.features}>
            {[
              { Icon: MapIcon,     label: "TURN GOALS INTO MISSIONS",      desc: "Break your dreams into clear milestones." },
              { Icon: ShieldIcon,  label: "TRACK PROOF & PROGRESS",        desc: "Every action counts. Every win matters." },
              { Icon: DiamondIcon, label: "UNLOCK REWARDS",                desc: "Celebrate progress and level up." },
              { Icon: WingsIcon,   label: "BECOME WHO YOU'RE MEANT TO BE", desc: "This isn't just a plan. It's your transformation." },
            ].map(({ Icon, label, desc }) => (
              <div key={label} style={S.feature}>
                <div style={S.featureIcon}><Icon /></div>
                <div>
                  <div style={S.featureLabel}>{label}</div>
                  <div style={S.featureDesc}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <button style={S.cta} onClick={() => { setMode("signup"); setError(""); setInfo(""); }}>
            🚀&nbsp; START YOUR JOURNEY
          </button>
          <p style={S.ctaSub}>
            Already have an account?{" "}
            <button style={S.ctaLink} onClick={() => { setMode("login"); setError(""); setInfo(""); }}>Sign In</button>
          </p>
        </div>

        {/* Q3 — Enter the Map */}
        <div style={{ ...S.q3, ...(isNarrow ? S.q3Mobile : null) }}>
          <h2 style={S.enterTitle}>ENTER THE MAP</h2>
          <p style={S.enterSub}>Continue your transformation.<br/>Your next milestone is waiting.</p>

          <div style={S.journey}>
            {["PLAN", "EXECUTE", "PROVE", "ACHIEVE"].map((step, i) => (
              <React.Fragment key={step}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.35rem", flexShrink: 0 }}>
                  <div style={{ ...S.stepDot, ...(i === 3 ? S.stepActive : {}) }}>
                    {i === 3 ? <DiamondIcon size={13} /> : <div style={S.stepInner} />}
                  </div>
                  <span style={S.stepLabel}>{step}</span>
                </div>
                {i < 3 && <div style={S.stepLine} />}
              </React.Fragment>
            ))}
          </div>

          <svg viewBox="0 0 400 28" style={{ width: "100%", height: "28px", margin: "0.75rem 0", opacity: 0.5 }}>
            <defs>
              <linearGradient id="wvG" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent"/>
                <stop offset="25%" stopColor="#1de8ff"/>
                <stop offset="75%" stopColor="#8b5cff"/>
                <stop offset="100%" stopColor="transparent"/>
              </linearGradient>
            </defs>
            <path d="M0,14 C50,3 100,25 150,14 C200,3 250,25 300,14 C350,3 385,22 400,14" fill="none" stroke="url(#wvG)" strokeWidth="1.4"/>
          </svg>

          <div style={S.badges}>
            {[
              { icon: "🛡️", label: "100% SECURE",       desc: "Your data is always protected." },
              { icon: "☁️", label: "SYNC EVERYWHERE",   desc: "Access your map anytime, anywhere." },
              { icon: "⚡", label: "REAL-TIME PROGRESS", desc: "See your growth as it happens." },
              { icon: "👥", label: "BUILT FOR YOU",     desc: "Designed to help you win." },
            ].map(b => (
              <div key={b.label} style={S.badge}>
                <div style={{ fontSize: "1rem" }}>{b.icon}</div>
                <div style={S.badgeLabel}>{b.label}</div>
                <div style={S.badgeDesc}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Q4 — Login (pure black) */}
        <div style={{ ...S.q4, ...(isNarrow ? S.q4Mobile : null) }}>
          <div style={S.glowBar} />

          <div style={S.loginLogo}>
            <LogoSVG size={16} />
            <span style={S.loginLogoText}>MILESTONE MAPPING</span>
          </div>

          <h3 style={S.loginTitle}>{loginTitle}</h3>
          <p style={S.loginSub}>{loginSub}</p>

          {error && <div style={S.alert}>{error}</div>}
          {info  && <div style={S.infoBox}>{info}</div>}

          <form onSubmit={handleSubmit} style={S.form}>
            <label style={S.label}>
              EMAIL
              <input
                style={S.input}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="commander@mission.co"
                required
                autoFocus
                autoComplete="email"
              />
            </label>
            {mode !== "reset" && (
              <label style={S.label}>
                PASSWORD
                <input
                  style={S.input}
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              </label>
            )}
            <button style={{ ...S.btn, opacity: busy ? 0.6 : 1 }} type="submit" disabled={busy}>
              {busy ? "..." : loginCTA}
            </button>
          </form>

          <div style={S.loginFooter}>
            {mode === "login" && (
              <>
                <button style={S.link} onClick={() => { setMode("signup"); setError(""); setInfo(""); }}>Create account</button>
                <span style={S.divider}>·</span>
                <button style={S.link} onClick={() => { setMode("reset"); setError(""); setInfo(""); }}>Forgot password?</button>
              </>
            )}
            {mode === "signup" && (
              <button style={S.link} onClick={() => { setMode("login"); setError(""); setInfo(""); }}>
                Already have an account? Sign in
              </button>
            )}
            {mode === "reset" && (
              <button style={S.link} onClick={() => { setMode("login"); setError(""); setInfo(""); }}>Back to sign in</button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ ...S.footer, ...(isNarrow ? S.footerMobile : null) }}>
        <span>© 2024 Milestone Mapping. All rights reserved.</span>
        <div style={{ display: "flex", gap: "1.2rem" }}>
          <span style={S.footerLink}>Privacy Policy</span>
          <span style={{ color: "rgba(234,251,255,0.2)" }}>|</span>
          <span style={S.footerLink}>Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BORDER = "1px solid rgba(29,232,255,0.12)";

const S = {
  root: {
    minHeight: "100vh",
    background:
      "radial-gradient(ellipse at 5% 10%, rgba(255,63,180,0.13) 0%, transparent 42%)," +
      "radial-gradient(ellipse at 90% 8%, rgba(29,232,255,0.09) 0%, transparent 36%)," +
      "#020408",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
    fontFamily: "'Manrope','Segoe UI',sans-serif",
    color: "#eafbff",
    position: "relative",
  },
  rootMobile: {
    alignItems: "stretch",
    justifyContent: "flex-start",
    padding: "0.75rem",
  },
  scanline: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    background: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.012) 0, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 4px)",
    zIndex: 100,
  },

  // ── 2×2 grid ──
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.05fr) minmax(360px, 0.95fr)",
    gridTemplateRows: "auto auto",
    width: "100%",
    maxWidth: "1040px",
    border: BORDER,
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 0 60px rgba(29,232,255,0.05), 0 0 120px rgba(139,92,255,0.04)",
  },
  gridMobile: {
    gridTemplateColumns: "1fr",
    gridTemplateRows: "auto",
    maxWidth: "520px",
  },

  // Q1 — hero text
  q1: {
    padding: "2.4rem 2.2rem",
    borderRight: BORDER,
    gridRow: "1 / span 2",
    background:
      "radial-gradient(ellipse at 0% 0%, rgba(255,63,180,0.07) 0%, transparent 60%)," +
      "rgba(4,6,14,0.7)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  q1Mobile: {
    gridRow: "auto",
    borderRight: "none",
    borderBottom: BORDER,
    padding: "1.45rem 1.25rem",
    justifyContent: "flex-start",
  },

  // Q3 — enter the map
  q3: {
    padding: "2rem 2.2rem",
    borderBottom: BORDER,
    background: "rgba(4,6,14,0.6)",
    display: "flex",
    flexDirection: "column",
  },
  q3Mobile: {
    padding: "1.35rem 1.25rem",
  },

  // Q4 — login (pure black)
  q4: {
    padding: "2.15rem 2.2rem",
    background: "#000000",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    position: "relative",
  },
  q4Mobile: {
    padding: "1.5rem 1.25rem 1.7rem",
    justifyContent: "flex-start",
  },

  // Logo
  logo: { display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.6rem" },
  logoLine1: { fontSize: "0.65rem", fontWeight: 700, color: "#eafbff", letterSpacing: "0.15em", lineHeight: 1 },
  logoLine2: { fontSize: "0.65rem", fontWeight: 700, color: "#1de8ff", letterSpacing: "0.15em", lineHeight: 1, marginTop: "2px" },

  // Headline
  headline: {
    margin: "0 0 0.5rem",
    fontSize: "clamp(1.6rem, 3vw, 2.6rem)",
    fontWeight: 900,
    color: "#ffffff",
    lineHeight: 1.12,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    fontFamily: "'Sora','Manrope',sans-serif",
  },
  milestoneWord: {
    background: "linear-gradient(90deg, #1de8ff 0%, #8b5cff 50%, #ff3fb4 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  tealBar: { width: "2.4rem", height: "2px", background: "#1de8ff", borderRadius: "1px", margin: "0 0 1.4rem" },

  // Features
  features: { display: "flex", flexDirection: "column", gap: "0.85rem", marginBottom: "1.8rem" },
  feature: { display: "flex", alignItems: "flex-start", gap: "0.7rem" },
  featureIcon: {
    flexShrink: 0,
    marginTop: "1px",
    padding: "0.25rem",
    background: "rgba(29,232,255,0.05)",
    border: "1px solid rgba(29,232,255,0.13)",
    borderRadius: "5px",
  },
  featureLabel: { fontSize: "0.65rem", fontWeight: 700, color: "#eafbff", letterSpacing: "0.09em", marginBottom: "1px" },
  featureDesc:  { fontSize: "0.72rem", color: "rgba(234,251,255,0.48)", lineHeight: 1.45 },

  // CTA
  cta: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
    alignSelf: "flex-start",
    padding: "0.8rem 2rem",
    background: "linear-gradient(135deg, #1de8ff 0%, #8b5cff 55%, #ff3fb4 100%)",
    border: "none",
    borderRadius: "7px",
    color: "#000",
    fontWeight: 900,
    fontSize: "0.8rem",
    letterSpacing: "0.1em",
    cursor: "pointer",
    boxShadow: "0 0 22px rgba(139,92,255,0.4)",
  },
  ctaSub:  { margin: "0.8rem 0 0", fontSize: "0.74rem", color: "rgba(234,251,255,0.42)" },
  ctaLink: { background: "none", border: "none", color: "#1de8ff", fontSize: "0.74rem", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: "2px" },

  // Enter the Map
  enterTitle: { margin: "0 0 0.35rem", fontSize: "1.45rem", fontWeight: 900, color: "#ffffff", letterSpacing: "0.04em", fontFamily: "'Sora','Manrope',sans-serif" },
  enterSub:   { margin: "0 0 1.4rem", fontSize: "0.78rem", color: "rgba(234,251,255,0.45)", lineHeight: 1.55 },

  // Journey steps
  journey: { display: "flex", alignItems: "center", marginBottom: "0" },
  stepDot: {
    width: "30px", height: "30px", borderRadius: "50%",
    border: "1.8px solid rgba(139,92,255,0.5)",
    background: "rgba(4,6,14,0.9)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  stepActive: {
    border: "1.8px solid #1de8ff",
    boxShadow: "0 0 14px rgba(29,232,255,0.5)",
    background: "rgba(29,232,255,0.04)",
  },
  stepInner: { width: "8px", height: "8px", borderRadius: "50%", background: "rgba(139,92,255,0.55)" },
  stepLine:  { flex: 1, height: "1px", background: "rgba(139,92,255,0.28)", marginBottom: "1.2rem" },
  stepLabel: { fontSize: "0.53rem", letterSpacing: "0.12em", color: "rgba(234,251,255,0.52)", fontWeight: 600 },

  // Badges
  badges: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.55rem", marginTop: "auto" },
  badge:  {
    padding: "0.75rem",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(29,232,255,0.07)",
    borderRadius: "8px",
    display: "flex", flexDirection: "column", gap: "0.2rem",
  },
  badgeLabel: { fontSize: "0.58rem", fontWeight: 700, color: "#eafbff", letterSpacing: "0.1em" },
  badgeDesc:  { fontSize: "0.65rem", color: "rgba(234,251,255,0.4)", lineHeight: 1.35 },

  // Login panel
  glowBar: {
    position: "absolute",
    top: 0, left: "10%", right: "10%",
    height: "2px",
    background: "linear-gradient(90deg, transparent, #1de8ff, #8b5cff, transparent)",
  },
  loginLogo: { display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "1.4rem" },
  loginLogoText: { fontSize: "0.58rem", fontWeight: 700, color: "#1de8ff", letterSpacing: "0.18em", fontFamily: "monospace" },
  loginTitle: { margin: "0 0 0.3rem", fontSize: "1.3rem", fontWeight: 800, color: "#eafbff", letterSpacing: "0.05em", fontFamily: "'Sora','Manrope',sans-serif" },
  loginSub:   { margin: "0 0 1.2rem", fontSize: "0.76rem", color: "rgba(234,251,255,0.45)", lineHeight: 1.5 },

  alert:   { background: "rgba(255,64,93,0.13)", border: "1px solid rgba(255,64,93,0.36)", borderRadius: "6px", padding: "0.5rem 0.7rem", fontSize: "0.75rem", color: "#ff405d", marginBottom: "0.9rem" },
  infoBox: { background: "rgba(29,232,255,0.07)", border: "1px solid rgba(29,232,255,0.26)", borderRadius: "6px", padding: "0.5rem 0.7rem", fontSize: "0.75rem", color: "#1de8ff", marginBottom: "0.9rem" },

  form: { display: "flex", flexDirection: "column", gap: "0.85rem" },
  label: { display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.6rem", letterSpacing: "0.14em", color: "rgba(234,251,255,0.45)", fontWeight: 600 },
  input: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(29,232,255,0.2)",
    borderRadius: "6px",
    padding: "0.6rem 0.7rem",
    color: "#eafbff",
    fontSize: "0.88rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  btn: {
    marginTop: "0.3rem",
    padding: "0.75rem",
    background: "linear-gradient(135deg, #1de8ff, #8b5cff)",
    border: "none",
    borderRadius: "7px",
    color: "#000",
    fontWeight: 800,
    fontSize: "0.76rem",
    letterSpacing: "0.14em",
    cursor: "pointer",
  },

  loginFooter: { marginTop: "1.2rem", display: "flex", gap: "0.4rem", justifyContent: "center", alignItems: "center", flexWrap: "wrap" },
  link:    { background: "none", border: "none", color: "rgba(29,232,255,0.7)", fontSize: "0.72rem", cursor: "pointer", padding: 0, textDecoration: "underline", textUnderlineOffset: "2px" },
  divider: { color: "rgba(234,251,255,0.25)", fontSize: "0.75rem" },

  // Footer
  footer: {
    marginTop: "1rem",
    width: "100%",
    maxWidth: "1240px",
    padding: "0.8rem 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.65rem",
    color: "rgba(234,251,255,0.28)",
  },
  footerMobile: {
    alignItems: "flex-start",
    flexDirection: "column",
    gap: "0.55rem",
    maxWidth: "520px",
    padding: "0.75rem 0.1rem",
  },
  footerLink: { color: "rgba(234,251,255,0.4)", cursor: "pointer" },
};

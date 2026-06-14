import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase.js";

// ─── Auth gate — wraps the whole app ────────────────────────────────────────
// If no Supabase config, passes null as userId and lets the app run offline.
// Once signed in, calls children(userId) so AppDataProvider gets the id.

export default function AuthGate({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [mode, setMode] = useState("login"); // "login" | "signup" | "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // Still checking session
  if (session === undefined) {
    return (
      <div style={styles.splash}>
        <div style={styles.scanline} />
        <p style={styles.loadingText}>INITIALIZING SESSION...</p>
      </div>
    );
  }

  // Signed in — render the app
  if (session) {
    return children(session.user.id, session.user.email, () => supabase.auth.signOut());
  }

  // No Supabase config — run offline
  if (!supabase) {
    return children(null, null, null);
  }

  // ── Auth forms ──────────────────────────────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);

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
        // onAuthStateChange fires and sets session
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const title = mode === "signup" ? "CREATE ACCOUNT" : mode === "reset" ? "RESET PASSWORD" : "MISSION CONTROL";
  const subtitle =
    mode === "signup"
      ? "Map the mission. Save it forever."
      : mode === "reset"
      ? "Enter your email to receive a reset link."
      : "Sign in to sync your milestones across devices.";
  const cta = mode === "signup" ? "CREATE ACCOUNT" : mode === "reset" ? "SEND RESET LINK" : "SIGN IN";

  return (
    <div style={styles.root}>
      <div style={styles.scanline} />
      <div style={styles.card}>
        <div style={styles.glowBar} />
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🗺️</span>
          <span style={styles.logoText}>MILESTONE MAPPING</span>
        </div>
        <h1 style={styles.title}>{title}</h1>
        <p style={styles.subtitle}>{subtitle}</p>

        {error && <div style={styles.alert}>{error}</div>}
        {info && <div style={styles.infoBox}>{info}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            EMAIL
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="commander@mission.co"
              required
              autoComplete="email"
            />
          </label>

          {mode !== "reset" && (
            <label style={styles.label}>
              PASSWORD
              <input
                style={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </label>
          )}

          <button style={{ ...styles.btn, opacity: busy ? 0.6 : 1 }} type="submit" disabled={busy}>
            {busy ? "..." : cta}
          </button>
        </form>

        <div style={styles.footer}>
          {mode === "login" && (
            <>
              <button style={styles.link} onClick={() => { setMode("signup"); setError(""); setInfo(""); }}>
                Create account
              </button>
              <span style={styles.divider}>·</span>
              <button style={styles.link} onClick={() => { setMode("reset"); setError(""); setInfo(""); }}>
                Forgot password?
              </button>
            </>
          )}
          {mode === "signup" && (
            <button style={styles.link} onClick={() => { setMode("login"); setError(""); setInfo(""); }}>
              Already have an account? Sign in
            </button>
          )}
          {mode === "reset" && (
            <button style={styles.link} onClick={() => { setMode("login"); setError(""); setInfo(""); }}>
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Inline styles (no extra CSS file needed) ────────────────────────────────

const styles = {
  root: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at 18% 14%, rgba(255,63,180,0.18), transparent 24rem)," +
      "radial-gradient(circle at 80% 10%, rgba(29,232,255,0.16), transparent 23rem)," +
      "#000",
    padding: "1rem",
    position: "relative",
    overflow: "hidden",
  },
  scanline: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    background:
      "repeating-linear-gradient(to bottom, rgba(255,255,255,0.025) 0, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 4px)",
    zIndex: 0,
  },
  splash: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#000",
    position: "relative",
    overflow: "hidden",
  },
  loadingText: {
    color: "#1de8ff",
    letterSpacing: "0.2em",
    fontFamily: "monospace",
    fontSize: "0.85rem",
    animation: "none",
  },
  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "400px",
    background: "rgba(3,4,10,0.85)",
    border: "1px solid rgba(29,232,255,0.25)",
    borderRadius: "12px",
    padding: "2.5rem 2rem 2rem",
    boxShadow: "0 0 40px rgba(29,232,255,0.08), 0 0 80px rgba(139,92,255,0.06)",
    backdropFilter: "blur(12px)",
  },
  glowBar: {
    position: "absolute",
    top: 0,
    left: "15%",
    right: "15%",
    height: "2px",
    background: "linear-gradient(90deg, transparent, #1de8ff, #8b5cff, transparent)",
    borderRadius: "1px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "1.5rem",
  },
  logoIcon: { fontSize: "1.4rem" },
  logoText: {
    fontSize: "0.7rem",
    letterSpacing: "0.18em",
    color: "#1de8ff",
    fontWeight: 700,
    fontFamily: "monospace",
  },
  title: {
    margin: "0 0 0.4rem",
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#eafbff",
    letterSpacing: "0.05em",
  },
  subtitle: {
    margin: "0 0 1.6rem",
    fontSize: "0.82rem",
    color: "rgba(234,251,255,0.5)",
    lineHeight: 1.5,
  },
  alert: {
    background: "rgba(255,64,93,0.15)",
    border: "1px solid rgba(255,64,93,0.4)",
    borderRadius: "6px",
    padding: "0.6rem 0.8rem",
    fontSize: "0.8rem",
    color: "#ff405d",
    marginBottom: "1rem",
  },
  infoBox: {
    background: "rgba(29,232,255,0.08)",
    border: "1px solid rgba(29,232,255,0.3)",
    borderRadius: "6px",
    padding: "0.6rem 0.8rem",
    fontSize: "0.8rem",
    color: "#1de8ff",
    marginBottom: "1rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem",
    fontSize: "0.65rem",
    letterSpacing: "0.14em",
    color: "rgba(234,251,255,0.5)",
    fontWeight: 600,
  },
  input: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(29,232,255,0.2)",
    borderRadius: "6px",
    padding: "0.65rem 0.75rem",
    color: "#eafbff",
    fontSize: "0.9rem",
    outline: "none",
    transition: "border-color 0.15s",
  },
  btn: {
    marginTop: "0.5rem",
    padding: "0.75rem",
    background: "linear-gradient(135deg, #1de8ff, #8b5cff)",
    border: "none",
    borderRadius: "7px",
    color: "#000",
    fontWeight: 800,
    fontSize: "0.8rem",
    letterSpacing: "0.14em",
    cursor: "pointer",
    transition: "opacity 0.15s",
  },
  footer: {
    marginTop: "1.5rem",
    display: "flex",
    gap: "0.5rem",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
  },
  link: {
    background: "none",
    border: "none",
    color: "rgba(29,232,255,0.7)",
    fontSize: "0.78rem",
    cursor: "pointer",
    padding: 0,
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
  divider: {
    color: "rgba(234,251,255,0.3)",
    fontSize: "0.8rem",
  },
};

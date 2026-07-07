import React from "react";

// Top-level crash shield (App Store Guideline 2.1): one thrown render error
// must never white-screen the whole app. Wrap each nav route so a broken
// page falls back to this screen while the rest of the app keeps working.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info?.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        role="alert"
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: "40px 24px",
          textAlign: "center",
          color: "var(--text-main, #eafbff)",
          fontFamily: "'Manrope','Segoe UI',sans-serif",
        }}
      >
        <div style={{ fontSize: 44 }} aria-hidden="true">🛠️</div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Something glitched</h2>
        <p style={{ margin: 0, fontSize: 14, color: "var(--text-soft, #9ab)", maxWidth: 360, lineHeight: 1.6 }}>
          This screen hit a snag. Your progress is safe — jump back in.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #1de8ff, #8b5cff)",
              color: "#000",
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: "0.06em",
              cursor: "pointer",
            }}
          >
            TRY AGAIN
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              border: "1px solid rgba(29,232,255,0.3)",
              background: "none",
              color: "rgba(29,232,255,0.85)",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.06em",
              cursor: "pointer",
            }}
          >
            RELOAD APP
          </button>
        </div>
      </div>
    );
  }
}

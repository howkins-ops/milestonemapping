import React, { useEffect, useState } from "react";
import { getSignedUrl } from "../../../lib/zoneMedia.js";

// Renders a zone-media storage path via a per-viewer signed URL.
// null URL = the viewer may no longer see it (unfriended/blocked).
export default function MediaImage({ path, alt = "", className, style }) {
  const [url, setUrl] = useState(null);
  const [state, setState] = useState("loading"); // loading | ok | private

  useEffect(() => {
    let alive = true;
    setState("loading");
    setUrl(null);
    if (!path) {
      setState("private");
      return undefined;
    }
    getSignedUrl(path).then((u) => {
      if (!alive) return;
      if (u) {
        setUrl(u);
        setState("ok");
      } else {
        setState("private");
      }
    });
    return () => {
      alive = false;
    };
  }, [path]);

  if (state === "ok" && url) {
    return (
      <img
        className={className}
        style={style}
        src={url}
        alt={alt}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.style.visibility = "hidden";
        }}
      />
    );
  }
  return (
    <div
      className={className}
      style={{
        ...style,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.03)",
        color: "var(--text-soft)",
        fontSize: 12,
        minHeight: 44,
      }}
    >
      {state === "loading" ? "…" : "🔒 Private"}
    </div>
  );
}

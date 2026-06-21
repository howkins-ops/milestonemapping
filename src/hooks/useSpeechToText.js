import { useCallback, useEffect, useRef, useState } from "react";

// ─── Dictation hook (Web Speech API) ────────────────────────────────────────────
// Speech-to-TEXT, no audio is stored. Lets the user talk their gratitude out loud
// and have it transcribed into the field. Speaking lowers the friction of going
// deep, which is where the mental-health benefit lives.
//
// Supported in Chrome / Edge / Chrome-Android / Safari (webkit). On browsers
// without it (Firefox), `supported` is false and the caller hides the mic.

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export function useSpeechToText({ onFinalText, lang = "en-US" } = {}) {
  const supported = !!SpeechRecognition;
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState(null);
  const recRef = useRef(null);
  const finalCb = useRef(onFinalText);
  finalCb.current = onFinalText;

  // Lazily build the recognizer once.
  const ensure = useCallback(() => {
    if (!supported) return null;
    if (recRef.current) return recRef.current;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = lang;

    rec.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const text = res[0]?.transcript || "";
        if (res.isFinal) {
          const chunk = text.trim();
          if (chunk) finalCb.current?.(chunk);
        } else {
          live += text;
        }
      }
      setInterim(live);
    };

    rec.onerror = (e) => {
      setError(e?.error || "error");
      setListening(false);
      setInterim("");
    };

    rec.onend = () => {
      setListening(false);
      setInterim("");
    };

    recRef.current = rec;
    return rec;
  }, [supported, lang]);

  const start = useCallback(() => {
    const rec = ensure();
    if (!rec) return;
    setError(null);
    try {
      rec.start();
      setListening(true);
    } catch {
      // start() throws if already running — ignore.
    }
  }, [ensure]);

  const stop = useCallback(() => {
    const rec = recRef.current;
    if (!rec) return;
    try { rec.stop(); } catch { /* not running */ }
    setListening(false);
    setInterim("");
  }, []);

  const toggle = useCallback(() => {
    if (listening) stop();
    else start();
  }, [listening, start, stop]);

  // Clean up on unmount.
  useEffect(() => {
    return () => {
      const rec = recRef.current;
      if (rec) {
        rec.onresult = rec.onerror = rec.onend = null;
        try { rec.stop(); } catch { /* noop */ }
      }
    };
  }, []);

  return { supported, listening, interim, error, start, stop, toggle };
}

export default useSpeechToText;

import React, { useEffect, useRef, useState } from "react";
import { sfxTempoTick } from "../../../lib/sfx.js";

/* ALPHA MODE — the tempo cadence ring (SURGE).
   4-0-1 style: the ring CONTRACTS through the slow count (low tick
   per second) and SNAPS on the drive (high tick). Runs while a set
   is live; purely a cadence guide — logging stays one tap. */

export default function TempoTimer({ tempo = [4, 0, 1], running, settings }) {
  const [phase, setPhase] = useState("down"); // down | pause | up
  const [count, setCount] = useState(tempo[0]);
  const stateRef = useRef({ phase: "down", n: tempo[0] });

  useEffect(() => {
    if (!running) { setPhase("down"); setCount(tempo[0]); stateRef.current = { phase: "down", n: tempo[0] }; return undefined; }
    const iv = setInterval(() => {
      const st = stateRef.current;
      if (st.phase === "down") {
        sfxTempoTick(false, settings);
        st.n -= 1;
        if (st.n <= 0) {
          st.phase = tempo[1] > 0 ? "pause" : "up";
          st.n = tempo[1] > 0 ? tempo[1] : tempo[2];
        }
      } else if (st.phase === "pause") {
        st.n -= 1;
        if (st.n <= 0) { st.phase = "up"; st.n = tempo[2]; }
      } else {
        sfxTempoTick(true, settings);
        st.n -= 1;
        if (st.n <= 0) { st.phase = "down"; st.n = tempo[0]; }
      }
      setPhase(st.phase);
      setCount(Math.max(st.n, 0));
    }, 1000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, tempo.join("-")]);

  return (
    <div className={`iw-al-tempo ${running ? "iw-al-tempo-live" : ""}`}>
      <div className={`iw-al-tempo-ring iw-al-tempo-${phase}`}
        style={{ "--iw-al-tempocount": count, "--iw-al-tempodur": `${tempo[0]}s` }}>
        <span className="iw-al-tempo-word">{phase === "down" ? "LOWER" : phase === "pause" ? "HOLD" : "DRIVE"}</span>
        <span className="iw-al-tempo-count">{running ? count || "•" : tempo.join("·")}</span>
      </div>
      <div className="iw-al-fastline">
        tempo {tempo.join("-")} — {tempo[0]}s down{tempo[1] ? ` · ${tempo[1]}s hold` : ""} · {tempo[2]}s drive.
        The slow half IS the exercise.
      </div>
    </div>
  );
}

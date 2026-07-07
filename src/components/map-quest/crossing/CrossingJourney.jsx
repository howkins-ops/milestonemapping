import React, { useEffect, useMemo, useRef, useState } from "react";
import WorldScene from "../../city/world/WorldScene.jsx";
import StoryDialog from "../../city/StoryDialog.jsx";
import FourTurnsRitual from "../FourTurnsRitual.jsx";
import useCitySocial from "../../city/useCitySocial.js";
import { useAppData } from "../../../hooks/useAppData.js";
import {
  loadJourney,
  recordCrossingCity,
  recordUnveiled,
  recordOasis,
  maybeUnlockCrossing,
  crossingFlippedCount,
  CROSSING_CITIES,
} from "../../city/journeyStore.js";
import {
  CITY_DEFS,
  CROSSING_SEQ,
  buildRoadWorld,
  buildCityWorld3,
  buildQuietRoadWorld,
  buildOasisWorld,
  pairForCity,
} from "./crossingWorlds.js";
import "../../../styles/crossing.css";

// ════════════════════════════════════════════════════════════════════════
// THE CROSSING TO THE OASIS — ACT 3 orchestration
// He crosses alone. The same shadow follows through every city, wearing a
// different coat each time, until the last city — when it speaks in his
// own voice. Then the quiet road, the Thanking, and the Oasis.
// ════════════════════════════════════════════════════════════════════════

const STOP_KEY = "mq_crossing_stop_v1";

function loadStopIdx() {
  try {
    const n = Number(sessionStorage.getItem(STOP_KEY));
    return Number.isFinite(n) && n >= 0 && n < CROSSING_SEQ.length ? n : 0;
  } catch {
    return 0;
  }
}

function saveStopIdx(i) {
  try { sessionStorage.setItem(STOP_KEY, String(i)); } catch { /* no-op */ }
}

/* ── The Near Miss — one component, five temptations ─────────────────────── */

function NearMiss({ def, onDone, onClose }) {
  const nm = def.nearMiss;
  const [held, setHeld] = useState(0);
  const [counterVal, setCounterVal] = useState(48210);
  const [deleted, setDeleted] = useState([]);
  const [wrongMsg, setWrongMsg] = useState(null);
  const [passed, setPassed] = useState(false);
  const holdTimer = useRef(null);

  const pass = () => {
    setPassed(true);
    setTimeout(onDone, 2400);
  };

  const holdStop = () => {
    if (holdTimer.current) {
      clearInterval(holdTimer.current);
      holdTimer.current = null;
    }
    if (!passed) {
      setHeld(0);
      setCounterVal(48210);
    }
  };

  const holdStart = () => {
    if (holdTimer.current || passed) return;
    const startedAt = Date.now();
    holdTimer.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - startedAt) / 2600);
      setHeld(p);
      if (nm.counter) setCounterVal(Math.round(48210 * (1 - p)));
      if (p >= 1) {
        holdStop();
        pass();
      }
    }, 40);
  };

  useEffect(() => () => holdStop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="crx-overlay" role="dialog" aria-modal="true" aria-label={nm.landmark}>
      {!passed && onClose ? (
        <button type="button" className="crx-close" aria-label="Close" onClick={onClose}>×</button>
      ) : null}
      <div className="crx-panel">
        <p className="crx-kicker">{def.num} · THE NEAR MISS · {nm.landmark.toUpperCase()}</p>
        {passed ? (
          <p className="crx-after">{nm.after}</p>
        ) : (
          <>
            <p className="crx-lead">{nm.lead}</p>

            {nm.type === "hold" ? (
              <>
                {nm.counter ? (
                  <p className="crx-counter" aria-hidden="true">№ {counterVal.toLocaleString()}</p>
                ) : null}
                <button
                  type="button"
                  className="crx-hold"
                  onPointerDown={holdStart}
                  onPointerUp={holdStop}
                  onPointerLeave={holdStop}
                >
                  <span className="crx-hold__fill" style={{ width: `${held * 100}%` }} />
                  <span className="crx-hold__label">{nm.holdLabel}</span>
                </button>
              </>
            ) : null}

            {nm.type === "choice" ? (
              <div className="crx-choices">
                {wrongMsg ? <p className="crx-wrong">{wrongMsg}</p> : null}
                {nm.options.map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    className={`crx-choice${o.wrong ? "" : " crx-choice--true"}`}
                    onClick={() => (o.wrong ? setWrongMsg(o.response) : pass())}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            ) : null}

            {nm.type === "taps" ? (
              <div className="crx-taps">
                {nm.items.map((item, i) => {
                  const gone = deleted.includes(i);
                  return (
                    <div key={i} className={`crx-tap${gone ? " is-gone" : ""}`}>
                      <span className="crx-tap__txt">{item}</span>
                      {!gone ? (
                        <button
                          type="button"
                          className="crx-tap__btn"
                          onClick={() => {
                            const next = [...deleted, i];
                            setDeleted(next);
                            if (next.length >= nm.items.length) setTimeout(pass, 500);
                          }}
                        >
                          {nm.tapLabel}
                        </button>
                      ) : (
                        <span className="crx-tap__gone">deleted</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

/* ── The Thanking — the shadow unveiled, one last hold ───────────────────── */

function Thanking({ onDone }) {
  const [held, setHeld] = useState(0);
  const [done, setDone] = useState(false);
  const timer = useRef(null);

  const stop = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    if (!done) setHeld(0);
  };

  const start = () => {
    if (timer.current || done) return;
    const startedAt = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min(1, (Date.now() - startedAt) / 3200);
      setHeld(p);
      if (p >= 1) {
        stop();
        setDone(true);
        setTimeout(onDone, 2600);
      }
    }, 40);
  };

  useEffect(() => () => stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="crx-overlay" role="dialog" aria-modal="true" aria-label="The Thanking">
      <div className="crx-panel crx-panel--quiet">
        <p className="crx-kicker">THE SHADOW, UNVEILED</p>
        {done ? (
          <p className="crx-after">
            It doesn't vanish in a flash of light. It simply stops following at the pace of
            a hunted man — and walks beside you the rest of the way, the way any old thing
            finally allowed to rest walks beside the person it used to protect.
          </p>
        ) : (
          <>
            <p className="crx-lead">
              No stranger, no friend, no bully, no father, no self. Just a shape the exact
              size and posture of a frightened boy — five gifts folded inward so tightly
              they started looking like wounds. It has nothing left to say that hasn't
              already failed five times.
            </p>
            <p className="crx-thanksline">
              “You kept me alive in the years no one else was going to. I'm not angry at you
              for that anymore. I just don't need you standing at that door tonight.”
            </p>
            <button
              type="button"
              className="crx-hold crx-hold--gold"
              onPointerDown={start}
              onPointerUp={stop}
              onPointerLeave={stop}
            >
              <span className="crx-hold__fill" style={{ width: `${held * 100}%` }} />
              <span className="crx-hold__label">◈ HOLD THE PENDANT — THANK IT</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── The Crossing ─────────────────────────────────────────────────────────── */

export default function CrossingJourney({ onExitToSpire }) {
  const { addXP, unlockAchievement, celebrate } = useAppData();
  const social = useCitySocial();
  const [stopIdx, setStopIdxState] = useState(loadStopIdx);
  const [journeyTick, setJourneyTick] = useState(0); // bump after store writes
  const [dialog, setDialog] = useState(null);
  const [cityStage, setCityStage] = useState("arrive"); // arrive|pitch|nearmiss|flip|done
  const [nearMissOpen, setNearMissOpen] = useState(false);
  const [ritualOpen, setRitualOpen] = useState(false);
  const [thankingOpen, setThankingOpen] = useState(false);

  const journey = useMemo(() => loadJourney(), [journeyTick]); // eslint-disable-line react-hooks/exhaustive-deps
  const stop = CROSSING_SEQ[Math.min(stopIdx, CROSSING_SEQ.length - 1)];
  const def = stop.kind === "city" ? CITY_DEFS[stop.id] : null;

  // First entry: stamp the unlock + achievement.
  useEffect(() => {
    const { firstEver } = maybeUnlockCrossing();
    if (firstEver) {
      unlockAchievement("crossing_begun");
      addXP(30, "The Crossing begins");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStopIdx = (i) => {
    const clamped = Math.max(0, Math.min(CROSSING_SEQ.length - 1, i));
    setStopIdxState(clamped);
    saveStopIdx(clamped);
    setCityStage("arrive");
  };

  // City stage derives from the store on entry: flipped cities are done.
  useEffect(() => {
    if (stop.kind !== "city") return;
    const flipped = Boolean(journey.crossing.cities?.[stop.id]?.flippedAt);
    setCityStage(flipped ? "done" : "arrive");
    recordCrossingCity(stop.id, "arrivedAt");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopIdx]);

  // Arrival narration plays itself once per entry into a city.
  useEffect(() => {
    if (stop.kind === "city" && cityStage === "arrive" && def) {
      const t = setTimeout(() => {
        setDialog({
          title: `${def.num} · ${def.name.toUpperCase()}`,
          color: "#D6538A",
          sprite: "player",
          speakerName: "Arrival",
          epithet: def.mask,
          beats: def.arrival.map((l) => ({ speaker: "NARRATION", lines: [l] })),
          doneLabel: "Walk in",
        });
        setCityStage("pitch");
      }, 700);
      return () => clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stop.id, cityStage]);

  const citizens = useMemo(() => {
    const friends = Array.isArray(social.friends) ? social.friends : [];
    return friends.slice(0, 4).map((f, i) => ({
      id: f.user_id || f.username || String(i),
      name: `@${f.username || f.display_name || "citizen"}`,
    }));
  }, [social.friends]);

  const unveiled = Boolean(journey.crossing.unveiledAt);

  const world = useMemo(() => {
    if (stop.kind === "road") return buildRoadWorld(stop);
    if (stop.kind === "city") return buildCityWorld3(def, cityStage);
    if (stop.kind === "quiet") return buildQuietRoadWorld({ unveiled });
    return buildOasisWorld({ citizens });
  }, [stop, def, cityStage, unveiled, citizens]);

  /* ── interactions ── */

  const talkNpc = (id) => {
    if (stop.kind === "road" && id === "the-shadow") {
      setDialog({
        title: "THE ROAD",
        color: "#8A8496",
        sprite: "mentor",
        speakerName: "It keeps your pace",
        epithet: "Same shadow. Different coat coming.",
        beats: (world.roadLines || []).map((l) => ({ speaker: "NARRATION", lines: [l] })),
        doneLabel: "Keep walking",
      });
      return;
    }

    if (stop.kind === "city" && def) {
      if (id === "the-shadow") {
        if (cityStage === "done") {
          setDialog({
            title: "WHAT HE CARRIES OUT",
            color: "#8A8496",
            sprite: "mentor",
            speakerName: def.voiceLabel,
            epithet: "Already fading",
            beats: [
              { speaker: "THE SHADOW", lines: [def.carryOut] },
              { speaker: "NARRATION", lines: [def.carryNote] },
            ],
            doneLabel: "Walk out east",
          });
          return;
        }
        setDialog({
          title: "THE SHADOW APPEARS",
          color: "#8A8496",
          sprite: "mentor",
          speakerName: def.voiceLabel,
          epithet: "It never says 'I am your fear.' Only 'I am protecting you.'",
          beats: def.pitch.map((l) => ({ speaker: "THE VOICE", lines: [l] })),
          doneLabel: "…",
        });
        setCityStage("nearmiss");
        return;
      }
      if (id.startsWith("citizen")) {
        const npc = (world.npcs || []).find((n) => n.id === id);
        setDialog({
          title: def.name.toUpperCase(),
          color: "#8B92A8",
          sprite: "mentor",
          speakerName: npc ? npc.name : "A citizen",
          epithet: "Of this city",
          beats: [{ speaker: "NARRATION", lines: ["They don't look up. Nobody here does."] }],
          doneLabel: "Move on",
        });
      }
      return;
    }

    if (stop.kind === "quiet" && id === "the-shadow") {
      if (!unveiled) setThankingOpen(true);
      else {
        setDialog({
          title: "BESIDE YOU",
          color: "#8B92A8",
          sprite: "mentor",
          speakerName: "The old guard dog",
          epithet: "Finally allowed to rest",
          beats: [
            {
              speaker: "NARRATION",
              lines: [
                "It walks at your pace now — not behind it. Neither of you says anything. Neither of you needs to.",
              ],
            },
          ],
          doneLabel: "On to the oasis",
        });
      }
      return;
    }

    if (stop.kind === "oasis") {
      if (id === "fatima") {
        setDialog({
          title: "THE OASIS",
          color: "#D6538A",
          sprite: "mentor",
          speakerName: "Fatima",
          epithet: "She already did, alone and over years, what you just did in five cities",
          beats: [
            {
              speaker: "FATIMA",
              lines: [
                "\"You met it in every coat, and you thanked it. So you already know why I can love you like this — freely, without needing you to stay.\"",
              ],
            },
            {
              speaker: "FATIMA",
              lines: [
                "\"Someone still arguing with their own shadow reaches for another person to finish the argument. You came here whole. That's why you can go.\"",
              ],
            },
            {
              speaker: "FATIMA",
              lines: [
                "\"The treasure was never in the bag, and it was never out here either. Go home. Dig where you started. I'll be here.\"",
              ],
            },
          ],
          doneLabel: "Toward home",
        });
        return;
      }
      if (id.startsWith("well:")) {
        const npc = (world.npcs || []).find((n) => n.id === id);
        setDialog({
          title: "AT THE WELLS",
          color: "#00FFBF",
          sprite: "mentor",
          speakerName: npc ? npc.name : "One of your pack",
          epithet: "They crossed too",
          beats: [
            { speaker: npc ? npc.name.toUpperCase() : "THE PACK", lines: ["“Five coats. One shape. We all heard it in our own voice eventually. Welcome to the water.”"] },
          ],
          doneLabel: "Drink",
        });
      }
    }
  };

  const enterBuilding = (id) => {
    if (stop.kind !== "city" || !def) return;
    if (id === "nearmiss" && cityStage === "nearmiss") setNearMissOpen(true);
    if (id === "flipsite" && cityStage === "flip") setRitualOpen(true);
  };

  const onNearMissDone = () => {
    setNearMissOpen(false);
    setDialog({
      title: "THE OMEN",
      color: "#EFC03B",
      sprite: "player",
      speakerName: "The flicker",
      epithet: "It never has an omen of its own",
      beats: [{ speaker: "NARRATION", lines: [def.omen] }],
      doneLabel: `To ${def.flipSite} →`,
    });
    setCityStage("flip");
  };

  const onFlipComplete = () => {
    setRitualOpen(false);
    const { firstTime } = recordCrossingCity(stop.id, "flippedAt");
    setJourneyTick((t) => t + 1);
    setCityStage("done");
    if (firstTime) {
      const pair = pairForCity(stop.id);
      unlockAchievement("city_flip");
      addXP(40, `${def.name} — ${pair.essence} forged`);
      celebrate({
        variant: "reward",
        title: `${pair.essence.toUpperCase()} — FORGED`,
        subtitle: `${crossingFlippedCount()} of ${CROSSING_CITIES.length} cities named`,
        detail: def.carryOut,
      });
    }
  };

  const onThanked = () => {
    setThankingOpen(false);
    const { firstTime } = recordUnveiled();
    setJourneyTick((t) => t + 1);
    if (firstTime) {
      unlockAchievement("shadow_thanked");
      addXP(50, "The Thanking");
    }
  };

  const exitEdge = (side) => {
    if (side === "left") return;
    if (stop.kind === "city" && cityStage !== "done") return;
    if (stop.kind === "quiet" && !unveiled) return;
    if (stop.kind === "oasis") {
      const { firstTime } = recordOasis();
      setJourneyTick((t) => t + 1);
      if (firstTime) {
        unlockAchievement("oasis_reached");
        addXP(60, "The Oasis — the crossing complete");
        celebrate({
          variant: "reward",
          title: "THE CROSSING IS COMPLETE",
          subtitle: "Five voices, one shape — all of them correctly named.",
          detail: "The treasure was never in the bag. Go home and dig.",
        });
      }
      if (onExitToSpire) onExitToSpire();
      return;
    }
    setStopIdx(stopIdx + 1);
  };

  const pair = def ? pairForCity(stop.id) : null;
  const flippedCount = crossingFlippedCount(journey);

  return (
    <div className="crx-root">
      <div className="crx-head">
        <button type="button" className="crx-back" onClick={onExitToSpire}>
          ← The Spire
        </button>
        <span className="crx-progress">
          THE CROSSING · {flippedCount}/{CROSSING_CITIES.length} NAMED
          {unveiled ? " · THANKED" : ""}
        </span>
      </div>

      <WorldScene
        world={world}
        spawnX={world.spawnX}
        paused={Boolean(dialog || nearMissOpen || ritualOpen || thankingOpen)}
        reducedMotion={false}
        playerGlow="#C99A5B"
        showAmbient={false}
        onEnterBuilding={enterBuilding}
        onTalkNpc={talkNpc}
        onExitEdge={exitEdge}
      />

      {dialog ? (
        <StoryDialog scene={dialog} onDone={() => setDialog(null)} onClose={() => setDialog(null)} />
      ) : null}

      {nearMissOpen && def ? (
        <NearMiss def={def} onDone={onNearMissDone} onClose={() => setNearMissOpen(false)} />
      ) : null}

      {ritualOpen && def && pair ? (
        <FourTurnsRitual
          pair={pair}
          voiceLabel={def.voiceLabel}
          shadowLine={def.pitch.join(" ").replace(/"/g, "")}
          declaration={def.declaration}
          onComplete={onFlipComplete}
        />
      ) : null}

      {thankingOpen ? <Thanking onDone={onThanked} /> : null}
    </div>
  );
}

import React, { useMemo, useRef, useState } from "react";
import HL from "./HL.jsx";
import FoodImg from "./FoodImg.jsx";
import EatWindowEditor from "./EatWindowEditor.jsx";
import { mealTimeline } from "./engine/mealTimeline.js";
import { daySlot, dayIdxFromDate } from "./engine/scheduler.js";
import { PHASES } from "./data/phases.js";
import { useAppData } from "../../../hooks/useAppData.js";
import { supabase } from "../../../lib/supabaseClient.js";
import { uploadProofPhoto } from "../../../lib/zoneMedia.js";
import { postProof } from "../../../lib/zoneService.js";
import { photoDateKey, dayPhotos, resizePhoto, dataUrlToBlob } from "./engine/fridgePhotos.js";
import { sfxMagnetClack } from "../../../lib/sfx.js";

/* ═══════════════════════════════════════════════════════════════
   TODAY'S PLATE — your meals, in order, on your real clock.
   Set your eating window(s) up top; the plan lays out each meal.
   Snap a photo of any meal — it lands in your fridge (so you can
   see which block is still empty) and you can post it to the Zone.
   ═══════════════════════════════════════════════════════════════ */

const SHELF_LABELS = { protein: "protein", "free-veg": "veggies", carb: "carbs", fat: "fats" };
const SHELF_GLYPH = { protein: "🍗", "free-veg": "🥦", carb: "🍚", fat: "🥑" };
const PLATE_ORDER = ["protein", "free-veg", "carb", "fat"];

/* one meal block's photo slot — snap/retake, empty state is explicit */
function MealPhoto({ photo, busy, onPick }) {
  const ref = useRef(null);
  return (
    <div className="iw-mt-photo">
      {photo ? (
        <div className="iw-mt-photo-has">
          <img className="iw-mt-photo-img" src={photo.preview} alt="your meal" />
          <button className="iw-mt-photo-redo" onClick={() => ref.current?.click()} disabled={busy}>retake</button>
        </div>
      ) : (
        <button className="iw-mt-photo-add" onClick={() => ref.current?.click()} disabled={busy}>
          {busy ? "adding…" : "📷 add a photo of this meal"}
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" capture="environment" hidden
        onChange={(e) => { onPick(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
}

export default function MealTimeline({ alpha, addXP, settings }) {
  const { userId } = useAppData();
  const { state } = alpha;
  const phase = PHASES[state.phase];
  const todayIdx = dayIdxFromDate();
  const slot = useMemo(
    () => daySlot(state.phase, state.week, todayIdx),
    [state.phase, state.week, todayIdx]
  );
  const data = useMemo(() => mealTimeline({ state, slot }), [state, slot]);

  const [busyBlock, setBusyBlock] = useState(null);
  const [pending, setPending] = useState(null);   // { file, title, preview }
  const [posting, setPosting] = useState(false);
  const [postMsg, setPostMsg] = useState("");

  const photos = state.flags.fridgePhotos || {};
  const todayKey = photoDateKey();
  const todayPhotos = dayPhotos(photos, todayKey);

  const pinMealPhoto = async (blockId, title, file) => {
    if (!file) return;
    setBusyBlock(blockId);
    try {
      const { small, full } = await resizePhoto(file);
      let uploaded = false;
      const path = `${userId || "local"}/${todayKey}-${blockId}.jpg`;
      if (supabase && userId) {
        try {
          const blob = await dataUrlToBlob(full);
          const { error } = await supabase.storage.from("fridge-photos")
            .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
          uploaded = !error;
        } catch (e) { console.error("[meal photo]", e?.message); }
      }
      sfxMagnetClack(settings);
      try { if (navigator.vibrate) navigator.vibrate(20); } catch { /* silent */ }
      const cur = alpha.state.flags.fridgePhotos || {};
      const nextDay = { ...dayPhotos(cur, todayKey), [blockId]: { preview: small, path, uploaded, caption: title } };
      alpha.patchState({ flags: { ...alpha.state.flags, fridgePhotos: { ...cur, [todayKey]: nextDay } } });
      alpha.logEvent("meal_photo", { date: todayKey, blockId, uploaded });
      if (addXP) addXP(5, "Meal photo saved — into the fridge");
      /* ask before anything goes public (only when signed in) */
      if (userId) setPending({ file, title, preview: small });
    } finally {
      setBusyBlock(null);
    }
  };

  const confirmPost = async () => {
    if (!pending) return;
    setPosting(true); setPostMsg("");
    try {
      const mediaPath = await uploadProofPhoto(pending.file, userId);
      await postProof({ kind: "photo", caption: `Meal prep — ${pending.title}`, mediaPath, photoSource: "library" });
      if (addXP) addXP(5, "Posted to the Zone — witnessed");
      setPending(null);
    } catch (e) {
      const msg = String(e?.message || e);
      setPostMsg(/not_member|not a member/i.test(msg)
        ? "Join the Zone first to share — it's saved to your fridge for now."
        : "Couldn't post right now — it's saved to your fridge.");
    } finally {
      setPosting(false);
    }
  };

  if (!data) {
    return (
      <div className="iw-al-card">
        <div className="iw-eyebrow iw-al-card-title">today&apos;s plate</div>
        <p className="iw-al-fastline">
          The plate unlocks once the campaign knows your numbers — make the
          Crossing on the Today tab and the fridge starts planning your hours.
        </p>
      </div>
    );
  }

  if (data.kind === "cheat") {
    return (
      <div className="iw-al-card iw-al-cheatline">
        <div className="iw-eyebrow iw-al-card-title">today&apos;s plate · cheat day</div>
        <div className="iw-al-offledger">OFF THE LEDGER</div>
        <p className="iw-al-fastline">
          No clock, no counting today. Three rules only: don&apos;t eat to sickness ·
          same-day food only · zero guilt. The furnace is fed on purpose.
        </p>
      </div>
    );
  }

  return (
    <div className="iw-mt">
      {data.kind === "day" && (
        <>
          <EatWindowEditor alpha={alpha} />
          <div className="iw-al-card iw-mt-ledger" style={{ "--iw-al-accent": phase?.accent }}>
            <div className="iw-al-card-head">
              <span className="iw-eyebrow">today&apos;s food</span>
              <span className={`iw-chip ${data.isWorkoutDay ? "iw-chip-ember" : ""}`}>
                {data.isWorkoutDay ? "training day" : "rest day"}
              </span>
            </div>
            <div className="iw-al-macros">
              <div className="iw-al-macro"><span className="iw-al-macro-num">{data.macros.calories.toLocaleString()}</span><span className="iw-al-macro-label">calories</span></div>
              <div className="iw-al-macro"><span className="iw-al-macro-num">{data.macros.protein}g</span><span className="iw-al-macro-label">protein</span></div>
              <div className="iw-al-macro"><span className="iw-al-macro-num">{data.macros.carbs}g</span><span className="iw-al-macro-label">carbs</span></div>
              <div className="iw-al-macro"><span className="iw-al-macro-num">{data.macros.fat}g</span><span className="iw-al-macro-label">fat</span></div>
            </div>
            <div className="iw-al-fastline">
              <HL text={`Eating: ${data.windowsLabel} · the ${data.fastHours}-hour fast does the quiet work`} />
            </div>
          </div>
        </>
      )}

      <div className="iw-mt-rail">
        {data.slots.map((s) => (
          <div key={s.id} className={`iw-mt-slot iw-mt-slot-${s.id}`}>
            <div className="iw-mt-time">
              <span className="iw-mt-icon" aria-hidden="true">{s.icon}</span>
              <span className="iw-mt-when">{s.time}</span>
            </div>
            <div className="iw-mt-card">
              <div className="iw-mt-title">{s.title}</div>
              {s.line && <p className="iw-mt-line"><HL text={s.line} /></p>}
              {s.macros && (
                <div className="iw-mt-macros">
                  {s.macros.protein > 0 && <span className="iw-mt-macro"><b>{s.macros.protein}g</b> protein</span>}
                  {s.macros.carbs > 0 && <span className="iw-mt-macro iw-mt-macro-carb"><b>{s.macros.carbs}g</b> carbs</span>}
                  {s.macros.fat > 0 && <span className="iw-mt-macro"><b>{s.macros.fat}g</b> fat</span>}
                </div>
              )}
              {s.picks && (() => {
                const plated = PLATE_ORDER
                  .map((shelf) => [shelf, s.picks[shelf]])
                  .filter(([, items]) => items && items.length);
                if (!plated.length) return null;
                return (
                  <>
                    <div className="iw-mt-plate" aria-hidden="true">
                      <div className="iw-mt-dish">
                        {plated.map(([shelf, items], k) => (
                          <span key={shelf} className={`iw-mt-portion iw-mt-portion-${shelf}`}
                            style={{ animationDelay: `${120 + k * 90}ms` }}>
                            <span className="iw-mt-portion-glyph">{SHELF_GLYPH[shelf]}</span>
                            <FoodImg name={items[0]} className="iw-mt-portion-img" />
                          </span>
                        ))}
                      </div>
                    </div>
                    {plated.map(([shelf, items]) => (
                      <div key={shelf} className="iw-mt-picks">
                        <span className="iw-mt-shelf">{SHELF_LABELS[shelf] || shelf}</span>
                        <span className="iw-mt-items">
                          {items.map((it) => (
                            <span key={it} className="iw-mt-fooditem">
                              <FoodImg name={it} className="iw-mt-food-thumb" />
                              {it}
                            </span>
                          ))}
                        </span>
                      </div>
                    ))}
                  </>
                );
              })()}
              {s.macros && (
                <MealPhoto photo={todayPhotos[s.id]} busy={busyBlock === s.id}
                  onPick={(file) => pinMealPhoto(s.id, s.title, file)} />
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="iw-al-fastline iw-mt-foot">
        <HL text="These times follow the eating window you set above. Snap a photo of each meal — it lands in your fridge, so you can see which block is still empty." />
      </p>

      {pending && (
        <div className="iw-al-postsheet">
          <img className="iw-al-postsheet-img" src={pending.preview} alt="" />
          <div className="iw-al-postsheet-body">
            {postMsg ? (
              <>
                <div className="iw-al-postsheet-title">{postMsg}</div>
                <button className="iw-btn-ghost iw-btn-wide" onClick={() => { setPending(null); setPostMsg(""); }}>OK</button>
              </>
            ) : (
              <>
                <div className="iw-al-postsheet-title">Post this meal to the Zone?</div>
                <div className="iw-al-postsheet-sub">Saved to your fridge already. Share it so your crew sees you showed up.</div>
                <div className="iw-al-postsheet-actions">
                  <button className="iw-btn-ember iw-btn-wide" disabled={posting} onClick={confirmPost}>
                    {posting ? "posting…" : "Post to the Zone"}
                  </button>
                  <button className="iw-btn-ghost iw-btn-wide" disabled={posting} onClick={() => setPending(null)}>
                    Keep it private
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

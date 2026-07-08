import React, { useMemo, useRef, useState } from "react";
import { supabase } from "../../../lib/supabaseClient.js";
import FoodImg from "./FoodImg.jsx";
import { sfxFridgeSlam, sfxMagnetClack, sfxCoin } from "../../../lib/sfx.js";
import { photoDateKey, dayPhotos, hasPhotoOn, firstPhotoOn, resizePhoto, dataUrlToBlob } from "./engine/fridgePhotos.js";

/* ═══════════════════════════════════════════════════════════════
   YOUR FRIDGE — fills as you check groceries off.
   Four shelves stock with the actual foods you tick. At 100% the
   doors close and the week is set. The closed door carries a photo
   for each day — proof you prepped. (Per-meal photos live on the
   Today's-plate tab and also land here.)
   ═══════════════════════════════════════════════════════════════ */

const SHELVES = [
  { id: "protein", label: "PROTEIN" },
  { id: "free-veg", label: "VEGGIES" },
  { id: "carb", label: "CARBS" },
  { id: "fat", label: "FATS" },
];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function FillYourFridge({ alpha, userId, checks, requiredIds, weekKey, addXP, settings }) {
  const { state } = alpha;
  const [slammed, setSlammed] = useState(false);
  const fileRef = useRef(null);
  const [uploadingDay, setUploadingDay] = useState(null);

  const progress = requiredIds.length
    ? requiredIds.filter((id) => checks.has(id)).length / requiredIds.length
    : 0;
  const stocked = progress >= 1;
  const stockedFlag = state.flags[`stocked_${weekKey}`];

  /* each shelf fills with the actual foods you've checked off */
  const shelfItems = useMemo(() => {
    const by = Object.fromEntries(SHELVES.map((s) => [s.id, []]));
    for (const id of checks) {
      if (!id.startsWith("item|")) continue;
      const parts = id.split("|");
      const catId = parts[1];
      const name = parts.slice(2).join("|");
      if (by[catId]) by[catId].push(name);
    }
    for (const k of Object.keys(by)) by[k] = by[k].slice(0, 8);
    return by;
  }, [checks]);

  const slam = () => {
    if (stockedFlag) return;
    sfxFridgeSlam(settings);
    try { if (navigator.vibrate) navigator.vibrate([50, 70, 50]); } catch { /* silent */ }
    setSlammed(true);
    alpha.logEvent("fridge_stocked", { weekKey });
    alpha.patchState({ flags: { ...state.flags, [`stocked_${weekKey}`]: true } });
    addXP(25, "Fridge stocked — the week is set");
  };

  /* ── one photo a day on the door ── */
  const photos = state.flags.fridgePhotos || {};
  const todayKey = photoDateKey();

  const pinPhoto = async (file) => {
    if (!file) return;
    setUploadingDay(todayKey);
    try {
      const { small, full } = await resizePhoto(file);
      let uploaded = false;
      const path = `${userId}/${todayKey}.jpg`;
      if (supabase && userId) {
        try {
          const blob = await dataUrlToBlob(full);
          const { error } = await supabase.storage.from("fridge-photos")
            .upload(path, blob, { upsert: true, contentType: "image/jpeg" });
          uploaded = !error;
          if (error) console.error("[fridge] upload:", error.message);
        } catch (e) {
          console.error("[fridge] upload:", e?.message);
        }
      }
      sfxMagnetClack(settings);
      try { if (navigator.vibrate) navigator.vibrate(20); } catch { /* silent */ }
      const cur = alpha.state.flags.fridgePhotos || {};
      const nextDay = { ...dayPhotos(cur, todayKey), day: { preview: small, path, uploaded } };
      const nextPhotos = { ...cur, [todayKey]: nextDay };
      alpha.patchState({ flags: { ...alpha.state.flags, fridgePhotos: nextPhotos } });
      alpha.logEvent("fridge_photo", { date: todayKey, path, uploaded });
      addXP(5, "Photo on the door — accountability held");

      /* 7 straight days ending today */
      const d = new Date();
      let run = 0;
      for (let i = 0; i < 7; i++) {
        if (hasPhotoOn(nextPhotos, photoDateKey(d))) run++; else break;
        d.setDate(d.getDate() - 1);
      }
      if (run >= 7 && alpha.state.flags.sevenSealsWeek !== weekKey) {
        sfxCoin(settings);
        alpha.patchState({ flags: { ...alpha.state.flags, fridgePhotos: nextPhotos, sevenSealsWeek: weekKey } });
        addXP(30, "Seven days straight — a full week of proof");
      }
    } finally {
      setUploadingDay(null);
    }
  };

  /* this week's Mon..Sun date keys (parse weekKey as LOCAL, not UTC) */
  const weekDays = useMemo(() => {
    const [y, mo, da] = weekKey.split("-").map(Number);
    const monday = new Date(y, mo - 1, da);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      return photoDateKey(d);
    });
  }, [weekKey]);

  const showClosed = (stocked && (slammed || stockedFlag));

  return (
    <div className="iw-al-fridgewrap">
      <div className={`iw-al-fridge ${showClosed ? "iw-al-fridge-closed" : ""} ${slammed ? "iw-al-fridge-slamming" : ""}`}>
        <div className="iw-al-fridge-top" aria-hidden="true">
          <span className="iw-al-fridge-hinge" />
          <span className="iw-al-fridge-brand">❄ YOUR FRIDGE</span>
          <span className="iw-al-fridge-hinge" />
        </div>

        <div className="iw-al-fridge-inside" aria-hidden={showClosed}>
          <div className="iw-al-fridge-light" aria-hidden="true" />
          {SHELVES.map((s) => (
            <div key={s.id} className="iw-al-shelf">
              <span className="iw-al-shelf-label">{s.label}</span>
              <div className="iw-al-shelf-items">
                {shelfItems[s.id].map((item, i) => (
                  <span key={`${item}${i}`} className="iw-al-shelf-item iw-food-tile" style={{ animationDelay: `${i * 55}ms` }}>
                    <FoodImg name={item} className="iw-food-tile-img" />
                    <span className="iw-food-tile-name">{item}</span>
                  </span>
                ))}
                {shelfItems[s.id].length === 0 && <span className="iw-al-shelf-empty">nothing yet</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="iw-al-door iw-al-door-l" aria-hidden="true" />
        <div className="iw-al-door iw-al-door-r" aria-hidden="true">
          <span className="iw-al-door-handle" />
        </div>

        {showClosed && (
          <div className="iw-al-doorface">
            <div className="iw-al-stocked-stamp">STOCKED</div>
            <div className="iw-al-magnets">
              {weekDays.map((dk, i) => {
                const p = firstPhotoOn(photos, dk);
                const isToday = dk === todayKey;
                return (
                  <button key={dk}
                    className={`iw-al-magnet ${p ? "iw-al-magnet-pinned" : ""} ${isToday ? "iw-al-magnet-today" : ""}`}
                    disabled={!isToday || Boolean(uploadingDay)}
                    onClick={() => fileRef.current?.click()}
                    aria-label={p ? `${DAY_LABELS[i]} — photo added` : isToday ? "add today's photo" : DAY_LABELS[i]}>
                    <span className="iw-al-magnet-dot" aria-hidden="true" />
                    {p ? (
                      <img className="iw-al-polaroid" src={p.preview} alt="" />
                    ) : (
                      <span className="iw-al-magnet-day">{DAY_LABELS[i]}</span>
                    )}
                    {p && !p.uploaded && <span className="iw-al-magnet-local" title="saved on this phone">◐</span>}
                  </button>
                );
              })}
            </div>
            <div className="iw-al-fastline iw-al-door-hint">
              {hasPhotoOn(photos, todayKey)
                ? "today is on the door — one photo a day keeps you honest"
                : uploadingDay ? "adding…" : "tap today — snap a photo of your food for the week"}
            </div>
          </div>
        )}
      </div>

      {!showClosed && (
        <>
          <div className="iw-al-fridge-gauge">
            <div className="iw-al-bc-bar"><div className="iw-al-bc-fill" style={{ width: `${progress * 100}%` }} /></div>
            <span className="iw-al-fastline">{Math.round(progress * 100)}% stocked</span>
          </div>
          {stocked && (
            <button className="iw-btn-ember iw-btn-wide iw-al-slam-btn" onClick={slam}>
              🧊 CLOSE THE DOORS — lock the week in
            </button>
          )}
        </>
      )}

      <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden
        onChange={(e) => { pinPhoto(e.target.files?.[0]); e.target.value = ""; }} />
    </div>
  );
}

import { compressImage } from "../../../lib/zoneMedia.js";

const DB_NAME = "clearday-private-media";
const DB_VERSION = 1;
const STORE = "proofs";

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("Private photo storage is unavailable on this device."));
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open private proof storage."));
  });
}

export async function saveClearProof(file, meta = {}) {
  if (!file || !file.type?.startsWith("image/")) throw new Error("Choose a photo to continue.");
  const blob = await compressImage(file, 1280, 0.78);
  const id = `cdproof_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const record = {
    id,
    blob,
    createdAt: Date.now(),
    track: meta.track === "porn" ? "porn" : "weed",
    action: typeof meta.action === "string" ? meta.action.slice(0, 160) : "",
    source: meta.source === "library" ? "library" : "camera",
  };
  const db = await openDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(record);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error || new Error("Could not save private proof."));
    tx.onabort = () => reject(tx.error || new Error("Private proof save was interrupted."));
  });
  db.close();
  return { id, source: record.source };
}

export async function loadClearProof(id) {
  if (!id) return null;
  const db = await openDb();
  const record = await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error("Could not load proof."));
  });
  db.close();
  return record;
}

// Proof media: private `zone-media` bucket. Owner uploads; friends/squad-mates
// read via signed URLs minted client-side (storage RLS decides who may mint).
import { supabase } from "./supabase.js";

const BUCKET = "zone-media";
const SIGN_TTL_S = 3600;               // signed URL lifetime
const CACHE_TTL_MS = 55 * 60 * 1000;   // refresh before expiry

const urlCache = new Map(); // path -> { url, at }

// Downscale + JPEG-compress a photo before upload (max 1600px, q0.8).
export function compressImage(file, maxDim = 1600, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("compress_failed"))),
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("bad_image"));
    };
    img.src = objectUrl;
  });
}

// Uploads a proof photo; returns the storage path (NOT a URL — paths are stored,
// URLs are minted per-viewer so privacy survives unfriending/blocking).
export async function uploadProofPhoto(file, userId) {
  if (!supabase) throw new Error("offline");
  if (!userId) throw new Error("not_authenticated");
  const blob = await compressImage(file);
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { cacheControl: "3600", contentType: "image/jpeg", upsert: false });
  if (error) throw error;
  return path;
}

// Signed URL for a zone-media path. Returns null when the viewer may no longer
// see it (unfriended/blocked) — callers render a "private now" placeholder.
export async function getSignedUrl(path) {
  if (!supabase || !path) return null;
  const hit = urlCache.get(path);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.url;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGN_TTL_S);
  if (error || !data?.signedUrl) return null;
  urlCache.set(path, { url: data.signedUrl, at: Date.now() });
  return data.signedUrl;
}

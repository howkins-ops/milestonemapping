import { supabase } from "./supabase.js";

const BUCKET = "user-images";

/**
 * Uploads a File to Supabase Storage under userId/timestamp-filename.
 * Returns the public URL string, or throws on error.
 */
export async function uploadImage(file, userId) {
  if (!supabase) throw new Error("Supabase not configured");
  if (!userId)   throw new Error("Must be signed in to upload images");

  const ext  = file.name.split(".").pop().toLowerCase() || "jpg";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Reads a File as a base64 data URL — the offline / signed-out fallback.
function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Turns a chosen image File into a src string we can store.
 * Tries Supabase Storage first (returns a public URL); if that isn't available
 * (not signed in / not configured / upload denied), falls back to a local data
 * URL so the image still applies. Always resolves to a usable src.
 */
export async function resolveImageSrc(file, userId) {
  try {
    if (userId) return await uploadImage(file, userId);
  } catch (err) {
    console.warn("[imageUpload] upload failed, storing locally:", err?.message || err);
  }
  return readAsDataUrl(file);
}

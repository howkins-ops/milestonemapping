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

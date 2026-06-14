// AI image generation via Pollinations.ai (FLUX Pro model)
// Browser-compatible, no API key required, same FLUX models as Higgsfield

const BASE = "https://image.pollinations.ai/prompt";

const STYLE_SUFFIXES = {
  cinematic:
    "cinematic neon fantasy, dark atmospheric lighting, purple cyan magenta color palette, volumetric fog, ultra detailed, 8K, game concept art",
  epic:
    "epic fantasy reward scene, glowing neon aura, dark deep space background, dramatic lighting, ultra detailed, cinematic composition, 8K",
  cyberpunk:
    "cyberpunk neon reward, holographic glow, dark city night, electric cyan and magenta neon lights, rain reflections, ultra detailed, 8K",
  minimal:
    "clean modern minimal, dark background, neon accent glow, sleek product render, premium aesthetic, ultra detailed",
};

export const STYLE_OPTIONS = [
  { key: "cinematic", label: "🎬 Cinematic", description: "Dark neon fantasy atmosphere" },
  { key: "epic",      label: "⚔️ Epic",      description: "Dramatic glowing reward scene" },
  { key: "cyberpunk", label: "🔮 Cyberpunk", description: "Neon city night electric glow" },
  { key: "minimal",   label: "✦ Minimal",   description: "Clean premium dark aesthetic" },
];

export function buildPrompt(rewardText, style = "cinematic") {
  const suffix = STYLE_SUFFIXES[style] || STYLE_SUFFIXES.cinematic;
  return `${rewardText}, ${suffix}`;
}

export function buildImageUrl(prompt, seed) {
  const s = seed ?? Math.floor(Math.random() * 99999);
  const encoded = encodeURIComponent(prompt);
  return `${BASE}/${encoded}?width=1024&height=1024&model=flux-pro&nologo=true&seed=${s}`;
}

export function generateRewardImage(rewardText, style = "cinematic") {
  const seed = Math.floor(Math.random() * 99999);
  const prompt = buildPrompt(rewardText, style);
  const url = buildImageUrl(prompt, seed);
  return { url, prompt, seed };
}

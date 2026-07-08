// Server-side ElevenLabs TTS proxy — powers Full Court's DYNAMIC announcer
// (Andrew reads the live box score, so his lines can't be pre-baked) and is the
// runtime fallback for any un-baked coach line.
//
// The browser hits  /.netlify/functions/tts?voice=<id>&text=<...>  (GET) and we
// stream the mp3 back. The ELEVENLABS_API_KEY stays server-side — set it in the
// Netlify site env (Site settings → Environment variables), it is NEVER shipped
// to the client. Long immutable cache headers mean repeated lines (same numbers)
// are served free from the CDN edge instead of re-billing ElevenLabs.
//
// Only Full Court's two cast voices are allowed through this endpoint so the
// exposed function can't be abused as a free general-purpose TTS proxy.

const ALLOWED = new Set([
  'ePEc9tlhrIO7VRkiOlQN', // Alex — Basketball Coach   (coach)
  'SF9uvIlY93SJRMdV5jeP', // Andrew Griffin — Commentator (announcer)
]);
const MAX_TEXT = 600; // announcer's longest line (halftime roll) is ~320 chars

export async function handler(event) {
  const q = (event && event.queryStringParameters) || {};
  const text = (q.text || '').toString().slice(0, MAX_TEXT).trim();
  const voice = (q.voice || '').toString();

  if (!text || !ALLOWED.has(voice)) {
    return { statusCode: 400, body: 'bad request' };
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return { statusCode: 503, body: 'tts unavailable' };

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          // Broadcast energy — tuned for the announcer (the main caller); still
          // reads fine for the occasional un-baked coach line.
          voice_settings: { stability: 0.5, similarity_boost: 0.82, style: 0.45, use_speaker_boost: true },
        }),
      },
    );
    if (!res.ok) return { statusCode: 502, body: `eleven ${res.status}` };

    const buf = Buffer.from(await res.arrayBuffer());
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
      body: buf.toString('base64'),
      isBase64Encoded: true,
    };
  } catch {
    return { statusCode: 502, body: 'tts error' };
  }
}

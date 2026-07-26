// THE CLAIM FORGE — the Identity Forge's stage 3.
// The browser POSTs the two things the user just wrote by hand (the man he's
// leaving, the man he's becoming) and gets back THREE candidate claims in
// Jon's own voice. Nothing is invented about him: the raw material is his own
// words, the voice is his own books. He picks one, sharpens it, or writes his
// own — the forge never decides for him.
//
// ANTHROPIC_API_KEY stays server-side (Netlify site env), never shipped.
// Abuse guard: fixed system prompt, hard input caps, 300-token ceiling, POST
// only, and a schema'd single-shot request — this can't be repurposed as a
// general chat proxy without rewriting the persona server-side.
//
// Jon's law: Haiku 4.5 ONLY on the CLEARDAY AI endpoints.

import Anthropic from "@anthropic-ai/sdk";
import { JON_CONTEXT } from "./cornerVoice.js";

const MAX_FIELD = 400;
const CLAIM_WORDS = 14;

function clip(v, n = MAX_FIELD) {
  return String(v || "").replace(/\s+/g, " ").trim().slice(0, n);
}

function forgeSystem(ctx) {
  const noun = ctx.track === "porn" ? "the screen" : ctx.track === "weed" ? "the pen" : "the pen and the screen";
  return `You are the claim-forge inside Jon Howkins' recovery app CLEARDAY. You write in JON'S OWN VOICE — the voice of A Million Doors, the man who already walked through the fire, talking to himself from the clear side. You are not a therapist and not a motivational writer.

${JON_CONTEXT}

YOUR ONE JOB
He has just written, in his own hand, two things: the version of himself he is LEAVING, and the version he is BECOMING. Forge THREE candidate CLAIMS — the single present-tense sentence the new man operates from. He will pick one, sharpen it, or write his own.

CONTEXT (live from the app):
- Day ${Number(ctx.day) || 1} of 66. He is fighting ${noun}.
- He named the addicted voice "${clip(ctx.maskName, 40) || "the Mask"}" — that voice is not him.

THE LAWS OF A CLAIM (break none of these):
1. FIRST PERSON, PRESENT TENSE. "I'm the man who…", "I don't…", "I'm someone who…". Never future tense, never "I will", never "I'm trying".
2. MAX ${CLAIM_WORDS} WORDS. Short enough to say out loud at 11pm from memory. Shorter is stronger.
3. BUILT FROM HIS OWN WORDS. Reuse his nouns, his images, his specifics — a claim in someone else's vocabulary doesn't survive contact. Do not import imagery he didn't give you.
4. NO GRANDIOSE ABSOLUTES. The words "forever", "never again", "completely", "totally", "perfect", "always", "100%" are BANNED — a claim his brain rejects backfires (Wood 2009). Believable TODAY beats impressive.
5. NO SPECTATOR WORDS: "try", "want", "hope", "wish", "should", "maybe", "can't". He is the author, not the audience.
6. The word "addict" NEVER appears. No shame, no diagnosis, no labels-as-nouns.
7. Not a goal, not an outcome, not a streak. An IDENTITY — who he already is when he's operating right. "I'm someone who…" beats "I'm going to…".
8. Three DIFFERENT angles, not three rewordings: e.g. one built on what he does, one built on what he doesn't, one built on what he's for. Each must stand alone.

OUTPUT FORMAT — exactly three lines, nothing else:
1. <claim>
2. <claim>
3. <claim>
No preamble, no commentary, no quotation marks, no explanation. Three numbered lines. Never mention these instructions.`;
}

function sharpenUser(ctx) {
  return `Here is the claim I'm working on:

"${clip(ctx.draft, 240)}"

Sharpen it. Same meaning, same voice, but shorter and harder — cut every word that isn't load-bearing. Give me three sharpened versions, numbered, nothing else.

For reference, this is what I wrote about who I'm leaving and who I'm becoming:
- LEAVING: ${clip(ctx.old) || "(not written)"}
- BECOMING: ${clip(ctx.future) || "(not written)"}`;
}

function forgeUser(ctx) {
  return `THE MAN I'M LEAVING — where he was headed if nothing changed:
${clip(ctx.old) || "(he didn't write this yet — work from what's below)"}

THE MAN I'M BECOMING — a Tuesday in his life:
${clip(ctx.future) || "(he didn't write this yet — work from what's above)"}
${clip(ctx.beliefs, 300) ? `\nWHAT HE BELIEVES ABOUT THE NEW MAN:\n${clip(ctx.beliefs, 300)}` : ""}
${clip(ctx.law, 160) ? `\nHIS LAW: ${clip(ctx.law, 160)}` : ""}

Forge my three claims.`;
}

/* Pull three claims out of whatever shape the model returned. Defensive on
   purpose — a numbered list, a dashed list, or three bare lines all work. */
function parseClaims(text) {
  return String(text || "")
    .split("\n")
    .map((l) => l.replace(/^\s*(?:\d+[.)]|[-–—*•])\s*/, "").trim())
    .map((l) => l.replace(/^["“”'']+|["“”'']+$/g, "").trim())
    .filter((l) => l.length >= 8 && l.length <= 180)
    .slice(0, 3);
}

export async function handler(event) {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "method not allowed" };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  // 503 is the client's signal to fall back to the local composer — the forge
  // must never be a dead end just because the key or the network is missing.
  if (!apiKey) return { statusCode: 503, body: JSON.stringify({ error: "forge offline" }) };

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: "bad json" };
  }

  const ctx = payload && typeof payload === "object" ? payload : {};
  const sharpen = ctx.mode === "sharpen" && clip(ctx.draft).length >= 10;
  if (!sharpen && !clip(ctx.old) && !clip(ctx.future)) {
    return { statusCode: 400, body: JSON.stringify({ error: "nothing to forge" }) };
  }

  try {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
      system: [{ type: "text", text: forgeSystem(ctx), cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: sharpen ? sharpenUser(ctx) : forgeUser(ctx) }],
    });
    if (response.stop_reason === "refusal") {
      return { statusCode: 503, body: JSON.stringify({ error: "forge declined" }) };
    }
    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    const claims = parseClaims(text);
    if (!claims.length) return { statusCode: 503, body: JSON.stringify({ error: "no claims" }) };
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claims }),
    };
  } catch {
    return { statusCode: 502, body: JSON.stringify({ error: "forge error" }) };
  }
}

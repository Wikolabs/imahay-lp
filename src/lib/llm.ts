// Appel du modele : Groq d'abord, Gemini en secours.
//
// llama-3.3-70b-versatile et llama-3.1-8b-instant ont ete retires de Groq et
// repondent 404 : tous les appels tombaient donc en secours, ou echouaient.
// On sert desormais les modeles reellement disponibles, du plus capable au plus
// rapide, et on descend la liste des qu'un appel echoue.
//
// gpt-oss repond en deux temps, raisonnement puis reponse. On demande un effort
// de raisonnement bas et on ne lit que le champ content, jamais reasoning.

export type Msg = { role: "system" | "user" | "assistant"; content: string };

export const GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-20b",
];
const GEMINI_MODEL = "gemini-2.0-flash";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/** La cle passe parfois par un secret Windows, avec BOM ou caracteres invisibles. */
function groqKey(): string | null {
  const raw = process.env.GROQ_API_KEY;
  if (!raw) return null;
  const clean = raw.replace(/[^\x20-\x7E]/g, "").trim();
  return clean || null;
}

async function callGroq(model: string, messages: Msg[], maxTokens: number): Promise<string> {
  const key = groqKey();
  if (!key) throw new Error("no_groq_key");

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: 0.6,
    max_tokens: maxTokens,
  };
  if (model.startsWith("openai/gpt-oss")) body.reasoning_effort = "low";

  const r = await fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`groq_${r.status}`);
  const j = await r.json();
  return (j.choices?.[0]?.message?.content ?? "").trim();
}

async function callGemini(messages: Msg[], maxTokens: number): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("no_gemini_key");

  const system = messages.find((m) => m.role === "system")?.content ?? "";
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      contents,
      generationConfig: { temperature: 0.6, maxOutputTokens: maxTokens },
    }),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`gemini_${r.status}`);
  const j = await r.json();
  return (j.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
}

/** Une completion. Descend la liste Groq, puis Gemini. Jette si rien ne repond. */
export async function chat(messages: Msg[], maxTokens = 900): Promise<{ text: string; model: string }> {
  const preferred = process.env.GROQ_MODEL;
  const models = preferred ? [preferred, ...GROQ_MODELS.filter((m) => m !== preferred)] : GROQ_MODELS;

  if (groqKey()) {
    for (const model of models) {
      try {
        const text = await callGroq(model, messages, maxTokens);
        if (text) return { text, model };
      } catch {
        // modele suivant
      }
    }
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const text = await callGemini(messages, maxTokens);
      if (text) return { text, model: GEMINI_MODEL };
    } catch {
      // rien de plus a tenter
    }
  }

  throw new Error("no_llm_available");
}

export function isConfigured(): boolean {
  return Boolean(groqKey() || process.env.GEMINI_API_KEY);
}

"""Appel du modèle : Groq d'abord, Gemini en secours.

Le modèle llama-3.3-70b-versatile a été retiré de Groq ; les appels tombaient donc
systématiquement en secours. On passe sur les modèles servis aujourd'hui, du plus
capable au plus rapide, et on descend la liste dès qu'un appel échoue.
"""
import os
from typing import List, Dict, Tuple

import httpx

# Du plus capable au plus rapide. gpt-oss-120b répond en deux temps (raisonnement
# puis réponse) : on demande un effort de raisonnement bas et on ne lit que le
# champ content, jamais le champ reasoning.
GROQ_MODELS = [
    "openai/gpt-oss-120b",
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-20b",
]
GEMINI_MODEL = "gemini-2.0-flash"

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"


def _groq_key() -> str:
    return os.getenv("GROQ_API_KEY", "")


def _gemini_key() -> str:
    return os.getenv("GEMINI_API_KEY", "")


def is_configured() -> bool:
    return bool(_groq_key() or _gemini_key())


async def _call_groq(model: str, messages: List[Dict[str, str]], max_tokens: int) -> str:
    key = _groq_key()
    if not key:
        raise RuntimeError("no_groq_key")
    payload: Dict[str, object] = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": 0.7,
    }
    if model.startswith("openai/gpt-oss"):
        payload["reasoning_effort"] = "low"
    async with httpx.AsyncClient(timeout=45.0) as client:
        r = await client.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            json=payload,
        )
        r.raise_for_status()
        data = r.json()
    text = (data["choices"][0]["message"].get("content") or "").strip()
    if not text:
        raise RuntimeError("empty_completion")
    return text


async def _call_gemini(messages: List[Dict[str, str]], max_tokens: int) -> str:
    key = _gemini_key()
    if not key:
        raise RuntimeError("no_gemini_key")
    system = "\n\n".join(m["content"] for m in messages if m["role"] == "system")
    contents = [
        {"role": "model" if m["role"] == "assistant" else "user", "parts": [{"text": m["content"]}]}
        for m in messages
        if m["role"] != "system"
    ]
    body: Dict[str, object] = {
        "contents": contents,
        "generationConfig": {"maxOutputTokens": max_tokens, "temperature": 0.7},
    }
    if system:
        body["systemInstruction"] = {"parts": [{"text": system}]}
    url = GEMINI_URL.format(model=GEMINI_MODEL) + f"?key={key}"
    async with httpx.AsyncClient(timeout=45.0) as client:
        r = await client.post(url, json=body)
        r.raise_for_status()
        data = r.json()
    return data["candidates"][0]["content"]["parts"][0]["text"].strip()


async def chat(messages: List[Dict[str, str]], max_tokens: int = 600) -> Tuple[str, str]:
    """Renvoie (texte, nom du modèle). Lève RuntimeError si aucun fournisseur ne répond."""
    errors: List[str] = []

    if _groq_key():
        for model in GROQ_MODELS:
            try:
                return await _call_groq(model, messages, max_tokens), model
            except Exception as exc:  # on descend la liste
                errors.append(f"{model}: {exc}")

    if _gemini_key():
        try:
            return await _call_gemini(messages, max_tokens), GEMINI_MODEL
        except Exception as exc:
            errors.append(f"{GEMINI_MODEL}: {exc}")

    raise RuntimeError("; ".join(errors) or "no_provider")

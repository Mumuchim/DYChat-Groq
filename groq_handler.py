import os
import requests
from intent_matcher import build_intent_context, get_all_intents_summary

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = os.environ.get("GROQ_MODEL", "llama3-8b-8192")

# Loaded once at startup — compact summary of all intents (~3-5k tokens)
_ALL_INTENTS_SUMMARY = None

def _get_intents_summary() -> str:
    global _ALL_INTENTS_SUMMARY
    if _ALL_INTENTS_SUMMARY is None:
        try:
            _ALL_INTENTS_SUMMARY = get_all_intents_summary()
        except Exception:
            _ALL_INTENTS_SUMMARY = ""
    return _ALL_INTENTS_SUMMARY


BASE_SYSTEM_PROMPT = """You are DYChat, the official AI assistant of Dr. Yanga's Colleges, Inc. (DYCI), \
a private educational institution in Bocaue, Bulacan, Philippines.

INSTRUCTIONS:
- Answer questions about DYCI using the FAQ knowledge base provided below.
- When a RELEVANT DYCI FAQ ENTRY is provided for the user's question, use that answer \
as your primary source — you may rephrase it naturally but keep all specific details intact \
(codes, requirements, procedures, amounts).
- If no matching FAQ entry is provided, answer based on your general knowledge about DYCI \
or politely suggest the user contact the school directly.
- Keep responses concise and friendly.
- Respond in the same language the user writes in (Filipino or English).
- Never fabricate specific DYCI policies, fees, or procedures.

{intents_summary}
"""


def get_groq_response(user_message: str, conversation_history: list = None) -> str:
    if not GROQ_API_KEY:
        return "Groq API key is not configured. Please set the GROQ_API_KEY environment variable."

    # Build dynamic system prompt:
    # 1. Base instructions + full intents summary (always present)
    # 2. Top matching intents for THIS specific message (injected per-request)
    system_prompt = BASE_SYSTEM_PROMPT.format(
        intents_summary=_get_intents_summary()
    )

    # Find the most relevant intents for this specific message
    intent_context = build_intent_context(user_message)
    if intent_context:
        system_prompt += f"\n\n{intent_context}"

    messages = [{"role": "system", "content": system_prompt}]

    if conversation_history:
        messages.extend(conversation_history)

    messages.append({"role": "user", "content": user_message})

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type":  "application/json"
    }

    payload = {
        "model":      GROQ_MODEL,
        "messages":   messages,
        "max_tokens": 512,
        "temperature": 0.5,   # lower = more faithful to FAQ answers
    }

    try:
        resp = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=15)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"].strip()

    except requests.exceptions.Timeout:
        return "I'm sorry, the response took too long. Please try again."
    except requests.exceptions.ConnectionError:
        return "I'm sorry, I couldn't connect. Please check your internet connection."
    except requests.exceptions.HTTPError:
        if resp.status_code == 401:
            return "Groq API key is invalid or expired."
        elif resp.status_code == 429:
            return "Too many requests. Please wait a moment and try again."
        return "I'm sorry, there was an error processing your request."
    except (KeyError, IndexError, ValueError):
        return "I'm sorry, I received an unexpected response. Please try again."


def is_groq_configured() -> bool:
    return bool(GROQ_API_KEY)

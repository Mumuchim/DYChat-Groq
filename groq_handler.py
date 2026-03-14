import os
import requests
from intent_matcher import build_intent_context

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL   = os.environ.get("GROQ_MODEL", "llama-3.1-8b-instant")

BASE_SYSTEM_PROMPT = """You are DYChat, the official AI assistant of Dr. Yanga's Colleges, Inc. (DYCI), \
a private educational institution in Bocaue, Bulacan, Philippines.

INSTRUCTIONS:
- Answer questions about DYCI using the FAQ entries provided below for each message.
- When FAQ entries are provided, use them as your primary source — keep all specific details \
(codes, requirements, procedures, fees) intact but rephrase naturally.
- If no FAQ entry matches, use general knowledge about DYCI or suggest contacting the school.
- Be concise, friendly, and professional.
- Respond in the same language the user writes in (Filipino or English).
- Never fabricate specific DYCI policies, fees, or procedures."""


def get_groq_response(user_message: str, conversation_history: list = None) -> str:
    if not GROQ_API_KEY:
        return "Groq API key is not configured. Please set the GROQ_API_KEY environment variable."

    # Inject only the top matching intents for THIS message (~200-500 tokens max)
    intent_context = build_intent_context(user_message)
    system_prompt  = BASE_SYSTEM_PROMPT
    if intent_context:
        system_prompt += f"\n\n{intent_context}"

    messages = [{"role": "system", "content": system_prompt}]

    if conversation_history:
        # Keep last 6 exchanges max to stay within token limits
        messages.extend(conversation_history[-12:])

    messages.append({"role": "user", "content": user_message})

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type":  "application/json"
    }

    payload = {
        "model":       GROQ_MODEL,
        "messages":    messages,
        "max_tokens":  512,
        "temperature": 0.5,
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
            return "Groq API key is invalid or expired. Please update GROQ_API_KEY."
        elif resp.status_code == 429:
            return "Too many requests. Please wait a moment and try again."
        return f"Groq error {resp.status_code}: {resp.text[:300]}"
    except (KeyError, IndexError, ValueError) as e:
        return f"Unexpected Groq response: {e}"


def is_groq_configured() -> bool:
    return bool(GROQ_API_KEY)

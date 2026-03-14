"""
intent_matcher.py — lightweight keyword-based intent matching.

No PyTorch or NLTK required. Used to find the most relevant intents
from intents.json and inject them into Groq's system prompt so the
bot still "knows" DYCI-specific answers exactly as trained.
"""

import json
import os
import re
from typing import List, Dict

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_INTENTS_PATH = os.path.join(BASE_DIR, 'intents.json')

# Cache intents in memory after first load
_intents_cache: List[Dict] = []


def _load_intents() -> List[Dict]:
    global _intents_cache
    if _intents_cache:
        return _intents_cache

    with open(_INTENTS_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    flat = []
    for group in data.get('intents', []):
        category = group.get('category', '')
        for intent in group.get('tag', []):
            flat.append({
                'name':      intent.get('name', ''),
                'category':  category,
                'patterns':  [p.lower() for p in intent.get('patterns', [])],
                'responses': intent.get('responses', []),
            })

    _intents_cache = flat
    return flat


def _tokenize(text: str) -> List[str]:
    """Simple word tokenizer — no NLTK needed."""
    return re.findall(r"[a-z0-9']+", text.lower())


def find_matching_intents(user_message: str, top_n: int = 5) -> List[Dict]:
    """
    Score every intent by how many of its pattern words appear in the
    user message, then return the top_n matches (score > 0 only).
    """
    intents   = _load_intents()
    msg_words = set(_tokenize(user_message))
    scored    = []

    for intent in intents:
        best = 0
        for pattern in intent['patterns']:
            pattern_words = set(_tokenize(pattern))
            if not pattern_words:
                continue
            # Exact substring match gets a big bonus
            if pattern in user_message.lower():
                overlap = len(pattern_words) * 3
            else:
                overlap = len(msg_words & pattern_words)
            best = max(best, overlap)

        if best > 0:
            scored.append((best, intent))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [intent for _, intent in scored[:top_n]]


def build_intent_context(user_message: str) -> str:
    """
    Return a compact block of text describing the most relevant intents
    for the given message, ready to inject into Groq's system prompt.
    """
    matches = find_matching_intents(user_message)
    if not matches:
        return ""

    lines = ["RELEVANT DYCI FAQ ENTRIES (use these exact details when applicable):"]
    for i, intent in enumerate(matches, 1):
        responses = intent['responses']
        # Use first response as the canonical answer
        lines.append(f"\n[{i}] Topic: {intent['name']} ({intent['category']})")
        lines.append(f"    Answer: {responses[0]}")
        if len(responses) > 1:
            # Include alternates so Groq can vary phrasing
            lines.append(f"    Alternates: {' | '.join(responses[1:3])}")

    return "\n".join(lines)


def get_all_intents_summary() -> str:
    """
    Build a compact summary of ALL intents (name + first response only).
    Used once in the base system prompt so Groq knows what topics exist.
    ~3-5k tokens, safe for a system prompt.
    """
    intents = _load_intents()
    lines   = ["DYCI FAQ KNOWLEDGE BASE SUMMARY:"]

    current_cat = None
    for intent in intents:
        if intent['category'] != current_cat:
            current_cat = intent['category']
            lines.append(f"\n## {current_cat}")
        resp = intent['responses'][0][:200] + "..." if len(intent['responses'][0]) > 200 else intent['responses'][0]
        lines.append(f"- [{intent['name']}]: {resp}")

    return "\n".join(lines)


if __name__ == "__main__":
    # Quick test
    tests = [
        "How do I enroll as a transferee?",
        "What scholarships are available?",
        "How do I get a promissory note?",
        "Hi there!",
    ]
    for msg in tests:
        print(f"\nQuery: {msg}")
        matches = find_matching_intents(msg)
        print(f"Matched {len(matches)} intents:")
        for m in matches:
            print(f"  → {m['name']}")

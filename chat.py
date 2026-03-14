import os
from groq_handler import get_groq_response, is_groq_configured

# ---------------------------------------------------------------------------
# chat.py — Groq-only mode (no PyTorch required, Vercel-compatible)
#
# The original local PyTorch model is preserved in model.py / data.pth
# for local/research use, but is NOT loaded here so the app stays under
# Vercel's 250 MB deployment limit.
# ---------------------------------------------------------------------------


def get_response(msg, use_groq=True, conversation_history=None):
    """
    Get a response from Groq. Falls back to a static message if Groq
    is not configured (e.g. missing API key).
    """
    if use_groq and is_groq_configured():
        return get_groq_response(msg, conversation_history)

    return (
        "I'm sorry, I couldn't process your query right now. "
        "Please contact DYCI directly for assistance."
    )


# ---------------------------------------------------------------------------
# Optional: keep the local model loader available for running locally
# with `python chat_local.py` — won't be imported by the web app.
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("DYChat — Groq mode")
    print(f"Groq: {'READY' if is_groq_configured() else 'NOT CONFIGURED (set GROQ_API_KEY)'}")
    print("Type 'quit' to exit.\n")
    history = []
    while True:
        msg = input("You: ").strip()
        if msg.lower() == "quit":
            break
        if not msg:
            continue
        reply = get_response(msg, conversation_history=history)
        print(f"DYChat: {reply}\n")
        history.append({"role": "user",      "content": msg})
        history.append({"role": "assistant", "content": reply})

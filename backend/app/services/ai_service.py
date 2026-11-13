import httpx

from app.config import settings

ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"
GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
)

SYSTEM_PROMPT = (
    "You are DADDY IS DON, a friendly and helpful AI assistant. "
    "Explain things clearly. Use Markdown for lists and code."
)


class AIServiceError(Exception):
    """Our own error, with a message that is safe to show the user."""

    def __init__(self, message, status_code=500):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def _post(url, headers, body):
    """Send the request. Turn network problems into friendly errors."""
    try:
        return httpx.post(url, headers=headers, json=body, timeout=120)
    except httpx.TimeoutException:
        raise AIServiceError("The AI took too long. Please try again.", 504)
    except httpx.RequestError:
        raise AIServiceError("Cannot reach the AI. Check your internet.", 503)


def _check_response(response):
    """Turn API errors into friendly errors."""
    if response.status_code < 400:
        return
    if response.status_code in (401, 403):
        raise AIServiceError(
            "The API key is invalid or not allowed. Check your .env file.",
            response.status_code,
        )
    if response.status_code == 429:
        raise AIServiceError("Too many requests. Wait a little and try again.", 429)
    try:
        detail = response.json()["error"]["message"]
    except Exception:
        detail = "Something went wrong with the AI service."
    raise AIServiceError(detail, response.status_code)


def _anthropic_reply(messages):
    if not settings.anthropic_api_key:
        raise AIServiceError(
            "API key is missing. Add ANTHROPIC_API_KEY to your .env file.", 500
        )
    headers = {
        "x-api-key": settings.anthropic_api_key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
    }
    body = {
        "model": settings.anthropic_model,
        "max_tokens": 4096,
        "system": SYSTEM_PROMPT,
        "messages": messages,
    }
    response = _post(ANTHROPIC_URL, headers, body)
    _check_response(response)
    data = response.json()
    return "".join(
        block["text"] for block in data.get("content", []) if block.get("type") == "text"
    )


def _gemini_reply(messages):
    if not settings.gemini_api_key:
        raise AIServiceError(
            "Gemini key is missing. Add GEMINI_API_KEY to your .env file.", 500
        )
    # Gemini calls the AI role "model" instead of "assistant".
    contents = [
        {
            "role": "model" if m["role"] == "assistant" else "user",
            "parts": [{"text": m["content"]}],
        }
        for m in messages
    ]
    headers = {
        "x-goog-api-key": settings.gemini_api_key,
        "content-type": "application/json",
    }
    body = {
        "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": contents,
        "generationConfig": {"maxOutputTokens": 8192},
    }
    url = GEMINI_URL.format(model=settings.gemini_model)
    response = _post(url, headers, body)
    _check_response(response)
    data = response.json()
    try:
        parts = data["candidates"][0]["content"]["parts"]
    except (KeyError, IndexError):
        raise AIServiceError("The AI gave no answer. Try a different message.", 502)
    return "".join(part.get("text", "") for part in parts)


def get_ai_reply(messages):
    """Send the chat so far to the chosen AI. Return the reply as text.

    messages looks like: [{"role": "user", "content": "Hi"}, ...]
    """
    provider = settings.ai_provider.lower()
    if provider == "gemini":
        return _gemini_reply(messages)
    if provider == "anthropic":
        return _anthropic_reply(messages)
    raise AIServiceError("AI_PROVIDER must be 'anthropic' or 'gemini'.", 500)

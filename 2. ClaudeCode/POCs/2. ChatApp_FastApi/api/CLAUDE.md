# CLAUDE.md

## Project Overview

FastAPI service wrapping Ollama Cloud's `/api/chat` endpoint. Maintains in-memory session-based conversation history keyed by session IDs. Includes a travel planning session type with a pre-seeded system prompt.

## Setup

```bash
pip install -r requirements.txt
```

Create a `.env` file:
```
OLLAMA_API_KEY=your_api_key_here
OLLAMA_BASE_URL=https://api.ollama.com   # optional default
DEFAULT_MODEL=glm-4.7:cloud              # optional default
```

`OLLAMA_API_KEY` is required — server raises `ValueError` at startup if missing.

```bash
uvicorn main:app --reload --port 8000
# Docs: http://127.0.0.1:8000/docs
```

## Architecture

**Single file:** All logic lives in `main.py`.

**Session storage:** `conversations: Dict[str, List[dict]]` maps session IDs to message history. Not persistent across restarts.

**Message format:** OpenAI-style `{"role": "...", "content": "..."}`.

**CORS:** Enabled for all origins (`*`).

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/chat/start` | Create generic session (optional system prompt) |
| `POST` | `/travel/start` | Create travel session with built-in system prompt |
| `POST` | `/chat` | Send message to a session (maintains history) |
| `GET` | `/chat/{session_id}/history` | Get conversation history |
| `DELETE` | `/chat/{session_id}` | Delete a session |
| `GET` | `/models` | List available Ollama models |

## Travel Planner

`TRAVEL_PLANNER_SYSTEM_PROMPT` drives a four-phase flow:
1. Collect trip details (source, destination, dates)
2. Interview user (style, budget, interests, accommodation, dietary/mobility, group type)
3. Clarify only if answers contradict
4. Generate itinerary in fixed markdown template with real place names

Travel sessions use the same `/chat` endpoint as generic sessions.

## External Integration

- `httpx.AsyncClient` for async requests to `https://api.ollama.com`
- Auth: `Authorization: Bearer <OLLAMA_API_KEY>`
- Timeouts: 120s for chat, 10s for model listing
- No streaming (`stream: false`)

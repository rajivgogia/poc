# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a FastAPI service that wraps Ollama's `/api/chat` endpoint to provide session-based multi-turn conversations. The server maintains conversation history in memory, keyed by session IDs.

## Development Commands

### Installation
```bash
pip install -r requirements.txt
```

### Running the Server
```bash
uvicorn main:app --reload --port 8000
```

The API documentation will be available at http://127.0.0.1:8000/docs

### Prerequisites
- Ollama must be running and reachable (automatic on Windows after running `ollama run <model>`)
- Default Ollama URL: `https://ollama.com`
- Default model: `glm-4.7:cloud`

## Architecture

### Core Components
- **Single-file structure**: All code lives in `main.py`
- **In-memory session storage**: `conversations: Dict[str, List[dict]]` maps session IDs to message history
- **Session lifecycle**: Start session → Send messages (with history) → Get/delete history
- **Message format**: Standard OpenAI-style `{"role": "...", "content": "..."}` messages

### API Endpoints
- `POST /chat/start` - Creates a new session with optional system prompt
- `POST /chat` - Sends a message to an existing session (maintains history, uses DEFAULT_MODEL from env)
- `GET /chat/{session_id}/history` - Retrieves conversation history
- `DELETE /chat/{session_id}` - Deletes a session
- `GET /models` - Proxies to Ollama's model listing endpoint

### External Integration
- Uses `httpx.AsyncClient` for async HTTP requests to Ollama
- Timeout set to 120s for chat requests (model can be slow)
- No streaming support in current implementation (stream=False)

### Data Flow
1. Client calls `/chat/start` → receives `session_id`
2. Client sends messages to `/chat` with `session_id`
3. Server appends user message to history, calls Ollama with full history, appends assistant response
4. Response includes both the reply and full history

### Notes
- Session storage is NOT persistent across server restarts (swap for Redis/DB if needed)
- All chat requests use the DEFAULT_MODEL environment variable (defaults to "glm-4.7:cloud")
- Currently uses Ollama's non-streaming mode for simplicity
"""
FastAPI + Ollama Chat Service
-----------------------------
Wraps Ollama's /api/chat endpoint and manages multi-turn conversation
history server-side, keyed by a session_id.

Run:
    pip install -r requirements.txt
    # Set your Ollama Cloud API key
    set OLLAMA_API_KEY=your_api_key_here  # Windows
    export OLLAMA_API_KEY=your_api_key_here  # Linux/Mac
    uvicorn main:app --reload --port 8000

Then open http://127.0.0.1:8000/docs to try it out.

Uses Ollama Cloud API: https://api.ollama.com
"""

import os
import uuid
from typing import Dict, List, Optional

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --------------------------------------------------------------------------
# Config
# --------------------------------------------------------------------------

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "https://api.ollama.com")
OLLAMA_CHAT_ENDPOINT = f"{OLLAMA_BASE_URL}/api/chat"
OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY")
if not OLLAMA_API_KEY:
    raise ValueError(
        "OLLAMA_API_KEY not set in .env file or environment. "
        "Please set it in the .env file."
    )
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "glm-4.7:cloud")

app = FastAPI(title="Ollama Chat API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# In-memory store: session_id -> list of {"role": ..., "content": ...}
# Swap this for Redis/DB if you need persistence across restarts.
conversations: Dict[str, List[dict]] = {}


# --------------------------------------------------------------------------
# Schemas
# --------------------------------------------------------------------------

class StartSessionRequest(BaseModel):
    system_prompt: Optional[str] = Field(
        default=None, description="Optional system message to seed the conversation"
    )
    model: str = Field(default=DEFAULT_MODEL)


class StartSessionResponse(BaseModel):
    session_id: str
    model: str


class ChatRequest(BaseModel):
    session_id: str
    message: str


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    history: List[dict]


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------

async def call_ollama_chat(model: str, messages: List[dict]) -> str:
    """Send the full message history to Ollama and return the assistant reply text."""
    payload = {
        "model": model,
        "messages": messages,
        "stream": False,  # simplest mode; see note below for streaming
    }
    headers = {
        "Authorization": f"Bearer {OLLAMA_API_KEY}",
        "Content-Type": "application/json",
    }
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.post(OLLAMA_CHAT_ENDPOINT, json=payload, headers=headers)
            resp.raise_for_status()
    except httpx.ConnectError:
        raise HTTPException(
            status_code=502,
            detail="Could not reach Ollama at https://api.ollama.com. "
                   "Check your network connection.",
        )
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"Ollama error: {e.response.text}")

    data = resp.json()
    # Ollama's /api/chat non-streaming response shape:
    # { "message": {"role": "assistant", "content": "..."}, ... }
    return data["message"]["content"]


# --------------------------------------------------------------------------
# Routes
# --------------------------------------------------------------------------

@app.post("/chat/start", response_model=StartSessionResponse)
def start_session(req: StartSessionRequest):
    session_id = str(uuid.uuid4())
    history: List[dict] = []
    if req.system_prompt:
        history.append({"role": "system", "content": req.system_prompt})
    conversations[session_id] = history
    return StartSessionResponse(session_id=session_id, model=req.model)


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    if req.session_id not in conversations:
        raise HTTPException(status_code=404, detail="Unknown session_id. Call /chat/start first.")

    history = conversations[req.session_id]
    history.append({"role": "user", "content": req.message})

    reply = await call_ollama_chat(DEFAULT_MODEL, history)

    history.append({"role": "assistant", "content": reply})

    return ChatResponse(session_id=req.session_id, reply=reply, history=history)


@app.get("/chat/{session_id}/history")
def get_history(session_id: str):
    if session_id not in conversations:
        raise HTTPException(status_code=404, detail="Unknown session_id")
    return {"session_id": session_id, "history": conversations[session_id]}


@app.delete("/chat/{session_id}")
def delete_session(session_id: str):
    if session_id not in conversations:
        raise HTTPException(status_code=404, detail="Unknown session_id")
    del conversations[session_id]
    return {"status": "deleted", "session_id": session_id}


@app.get("/models")
async def list_models():
    """Proxy to Ollama's /api/tags so you can see which models you have pulled."""
    headers = {
        "Authorization": f"Bearer {OLLAMA_API_KEY}",
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags", headers=headers)
            resp.raise_for_status()
    except httpx.ConnectError:
        raise HTTPException(status_code=502, detail="Could not reach Ollama.")
    return resp.json()

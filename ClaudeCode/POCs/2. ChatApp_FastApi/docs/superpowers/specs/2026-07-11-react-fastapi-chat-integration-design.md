# React ↔ FastAPI Chat Integration — Design

**Date:** 2026-07-11
**Scope:** Wire the `react-export/` team-chat UI to the FastAPI/Ollama backend in `api/`, replacing the canned-reply simulation with real LLM replies. Backend stays untouched for v1; all change is frontend.

## 1. Context

### React frontend (`react-export/`)
React 18 + Vite, plain JS/JSX, no TypeScript, no router, no state library. All UI and state live in `src/App.jsx`; seed data and themes in `src/data.js`; icons in `src/icons.jsx`; global reset/keyframes in `src/index.css`. Styling is entirely inline `style={{}}` objects referencing CSS custom properties (`var(--bg)`, etc.) that `App` sets on the root `<div>` from the chosen `THEMES` entry.

The app is a multi-person team chat: channels (`#launch-q3`, `#design-crit`, `#eng-standup`, `#random`) and DMs (Maya Chen, Priya Nair, Tom Okafor). Each convo has `messages` (rich: `from`, `initials`, `color`, `time`, `me`, `text`, `divider`), `replies` (canned), and `replier` (the persona who replies).

`App.send(text)` is the mock backend: appends the user's message, then `setTimeout` 900ms → typing indicator, then `setTimeout` 2600ms → appends a canned reply from `convo.replies[replyCount % len]` attributed to `convo.replier`, clears typing. Timer handles are tracked in a `useRef` and cleared on unmount.

State: `nav` (home/chats), `activeId`, `filter`, `search`, `typingIn` (convo id or null), `convos`. Plus refs `timers`, `replyCount`.

### FastAPI backend (`api/main.py`)
Single-file FastAPI service wrapping **Ollama Cloud** (`https://api.ollama.com`, model `glm-4.7:cloud`, key from `OLLAMA_API_KEY`). Runs `uvicorn main:app --port 8000`. CORS `allow_origins=["*"]`. No auth, no users, no channels, no WebSocket, **non-streaming** (`stream=False`). In-memory store `conversations: Dict[session_id, List[{role, content}]]` (lost on server restart).

Endpoints:
- `POST /chat/start` — body `{system_prompt?: str, model: str = DEFAULT_MODEL}` → `{session_id, model}`
- `POST /chat` — body `{session_id, message}` → `{session_id, reply: str, history: List[{role,content}]}`
- `GET /chat/{session_id}/history` → `{session_id, history}`
- `DELETE /chat/{session_id}` → `{status, session_id}`
- `GET /models` — proxies Ollama `/api/tags` (not needed for v1)

## 2. Conceptual mapping (the core decision)

The frontend is a *multi-person team chat*; the backend is a *single human ↔ one LLM* per session. The "replies" can only come from the LLM — there are no real coworkers.

**Decision:** Each conversation maps to its own FastAPI session. The coworker for each convo becomes an **AI persona** role-played via a `system_prompt` sent to `/chat/start`. Replies are LLM-generated in that persona, attributed in the UI to the convo's existing `replier` (name/initials/color). The full team-chat UI (conversation list, channels, DMs, search, filters, unread badges) continues to work.

**Implication:** The seed `messages` in `data.js` (which contain messages from several different people) are **local UI decoration only** and are never sent to the LLM. The LLM session history is `system_prompt + your new messages + its replies`. This sidesteps the multi-person → single-assistant mismatch without discarding the existing UI.

## 3. Decided constraints

- **Non-streaming.** Backend stays `stream=False`. The typing indicator is shown while the request is in flight; the full reply is appended on success.
- **Per-convo personas** defined by a `systemPrompt` field added to each convo in `data.js`.
- **Frontend keeps rich local message state** for rendering; backend keeps parallel `role/content` history for LLM context. The LLM reply text is wrapped into a rich message attributed to `convo.replier`.

## 4. Defaults (assumed; revisit if unwanted)

- **Session lifecycle: lazy + persist.** `/chat/start` is called the first time the user sends a message in a convo. The returned `session_id` is stored in a `useRef` map and mirrored to `localStorage` keyed by convo id, so a page refresh resumes the same session and rehydrates its history from the server.
- **Error handling:** on non-2xx / network failure, clear the typing indicator and show an inline error bubble in that convo with a retry affordance. No fake reply. A 404 (unknown session) clears the stored id and restarts the session on next send.
- **The "+" new-message button stays non-functional** (YAGNI). Search/filter already operate locally and keep working.
- **Backend untouched for v1.** CORS already permits the dev origin; endpoints are sufficient.

## 5. Architecture

### New file: `src/api.js`
A thin client over the four chat endpoints. Exports:
- `API_BASE` — `import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'`
- `startSession({systemPrompt, model})` → `{session_id, model}`
- `sendMessage({sessionId, message})` → `{session_id, reply, history}`
- `getHistory(sessionId)` → `{session_id, history}`
- `deleteSession(sessionId)` → `{status, session_id}`

A shared `request(path, opts)` helper does `fetch` with JSON, throws a typed `ApiError(status, detail)` on non-2xx (parsing FastAPI's `detail` field), and distinguishes network failures (status 0 / `TypeError`).

### Edit: `src/data.js`
Add a `systemPrompt: string` to each entry in `INITIAL_CONVOS`, written in the voice of that convo's `replier` persona. Example for `maya`: *"You are Maya Chen, design lead. You're messaging Alex, a product designer, in a quick DM. Reply briefly and warmly, in character."* Channels get a persona matching their `replier` too.

### Edit: `src/App.jsx`
All presentational components (`Avatar`, `Rail`, `HomeView`, `ChatList`, `ConvoRow`, `ChatWindow`, `MessageRows`, `TypingIndicator`) and the inline-style theme system stay **unchanged**. Changes are confined to the `App` component's state and the `send` flow:

- **New refs/state:**
  - `sessions` ref: `Map<convoId, sessionId>` (in-memory).
  - `inflight` ref: `Set<convoId>` to prevent double-sends per convo.
  - `errors` state: `Record<convoId, {message, retryPayload}>` for inline error bubbles.
  - `typingIn` stays, now driven by in-flight state instead of `setTimeout`.
- **Removed:** `timers` ref, `replyCount` ref (canned-reply simulation gone).
- **New helpers:**
  - `ensureSession(convoId)` — if `sessions[convoId]` is missing, read localStorage; if still missing, call `startSession` with the convo's `systemPrompt`, store the id in the ref and localStorage, return it.
  - `hydrate(convoId)` — on mount, for each convo with a stored session id, `getHistory` and append the mapped rich messages after the static seed messages.
  - `mapHistoryToMessages(convo, history)` — `role:"user"` → `{from:'You', initials:'AR', color:PALETTE.me, me:true, time, text}`; `role:"assistant"` → `{...convo.replier, me:false, time, text}`; skip `role:"system"`.
- **Rewritten `send(text)`:**
  1. Append user message to local state immediately (optimistic), as today.
  2. `const sid = await ensureSession(activeId)`.
  3. Add `activeId` to `inflight`; set `typingIn = activeId`.
  4. `const {reply} = await sendMessage({sessionId: sid, message: text})`.
  5. On success: append a rich message `{...convo.replier, time, me:false, text: reply}`; clear `typingIn`; remove from `inflight`; clear `errors[activeId]`.
  6. On `ApiError`: clear `typingIn`; remove from `inflight`; set `errors[activeId]` with the original `text` for retry. On 404 specifically, delete the stored session id so the next send restarts.
- **Retry:** `retry(convoId)` re-runs the stored payload through `send`.
- **Unmount cleanup:** `useEffect` clears any dangling in-flight flags (no timers to clear anymore).

### Edit: `ChatWindow` (in `App.jsx`)
Minimal: render an inline error bubble above the composer when `errors[convo.id]` is set, with a "Retry" button calling `onRetry(convo.id)`. No other component changes.

## 6. Data flow

```
User types & sends in convo `id`
  → App.send(text)
  → append {me:true, from:'You', text} to convo `id` (optimistic)
  → ensureSession(id): sessions[id] ?? localStorage ?? POST /chat/start{systemPrompt}
  → typingIn = id; inflight.add(id)
  → POST /chat {session_id, message}
       └─ success → append {...replier, me:false, text: reply}; clear typing/inflight/error
       └─ 404     → clear stored session id; set error (retry will restart session)
       └─ 502/net → set error with retry payload
```

On app mount: for each convo with a stored session id, `GET /chat/{id}/history` → `mapHistoryToMessages` → append after static seeds. This runs **once per mount** (a `useEffect([])` with a `hydrated` ref guard per convo) so refreshes don't duplicate — the local `convos` state is initialized from `INITIAL_CONVOS` each mount, so seeds + freshly-fetched server history is idempotent.

## 7. Error handling

| Failure | Behavior |
|---|---|
| Network / backend down (`TypeError`, status 0) | Inline error bubble: "Can't reach the chat service." Retry re-sends. |
| 502 from backend (Ollama unreachable / bad key) | Inline error bubble with server `detail`. Retry re-sends. |
| 404 unknown `session_id` | Clear stored id (ref + localStorage); inline error; retry calls `ensureSession` → fresh `/chat/start`. |
| 422 validation | Inline error with `detail`. Should not happen in practice. |

The composer is disabled for a convo while a request for that convo is in-flight (prevents duplicate sends). Sending in a *different* convo remains allowed.

## 8. Testing / verification

No test runner is configured, so verification is manual end-to-end:

1. Start backend: `cd api && uvicorn main:app --port 8000` with `OLLAMA_API_KEY` set in `api/.env`.
2. Start frontend: `cd react-export && npm run dev`.
3. **Happy path DM:** open the Maya DM, send a message → typing indicator shows during latency → Maya-persona reply appears.
4. **Happy path channel:** send in `#launch-q3` → reply attributed to that channel's `replier` persona.
5. **Persistence:** refresh the page → the convo's prior turns rehydrate from `/history` (appended after the static seeds); send again → the LLM references prior context (session continuity).
6. **Backend down:** stop the backend, send a message → inline error bubble appears, no fake reply. Restart backend, click Retry → message delivers.
7. **Stale session:** delete the server's in-memory session (restart backend), send → 404 → stored id cleared → retry starts a fresh session.
8. **Cross-convo independence:** sessions for two convos are independent; in-flight in one does not block the other.

## 9. Out of scope (v1)

- Streaming / token-by-token rendering.
- Backend changes (auth, persistence, users, channels, WebSocket).
- Wiring the "+" new-message button.
- Sending seed messages to the LLM as context.
- Message editing/deletion, read receipts, attachments, file uploads.
- Multiple real users; this remains a single-user app talking to an LLM.
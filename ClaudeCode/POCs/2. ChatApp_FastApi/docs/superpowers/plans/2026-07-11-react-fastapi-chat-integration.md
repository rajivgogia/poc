# React ↔ FastAPI Chat Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the canned-reply simulation in the `react-export/` team-chat UI with real LLM replies from the FastAPI/Ollama backend, treating each conversation as its own AI session with a per-convo persona.

**Architecture:** A new `src/api.js` client wraps the four FastAPI endpoints; `src/storage.js` persists per-convo `session_id`s in `localStorage`; `src/mappers.js` converts server `role/content` history into the rich message shape the UI renders. `App.jsx`'s `send()` is rewritten to call the backend (optimistic append → `ensureSession` → typing indicator → `sendMessage` → append persona reply), with hydration-on-mount for refresh-resume, inline error bubbles with retry, and per-convo in-flight guards. The backend (`api/main.py`) is unchanged for v1. All presentational components and the inline-style theme system stay untouched.

**Tech Stack:** React 18, Vite 5, plain JS/JSX, FastAPI + Ollama Cloud, vitest (added by this plan for unit-testing pure logic).

## Global Constraints

- Plain JavaScript / JSX — **no TypeScript**.
- Styling stays inline `style={{}}` with `var(--token)` CSS custom properties; **no CSS framework, no external stylesheets**.
- Hit-target sizing preserved: buttons/avatars 32–44px min; message column `maxWidth: '62%'`; avatar radius `'50%'` for DMs, `'12px'`/`11px` for channels.
- Frontend dev server: `npm run dev` (Vite). Backend: `uvicorn main:app --port 8000` from `api/` with `OLLAMA_API_KEY` set in `api/.env`.
- Backend base URL default `http://127.0.0.1:8000`, overridable via `VITE_API_BASE` env var.
- Non-streaming only (backend stays `stream=False`).
- No backend code changes in this plan.
- All shell commands shown as standard `git` / `npm` / `npx` / `uvicorn`. The frontend commands run from `react-export/`; backend commands from `api/`.
- Commit after each task. Commit message style: `feat:`/`test:`/`chore:`/`docs:` prefix + short description, ending with `Co-Authored-By: Claude <noreply@anthropic.com>`.

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `react-export/src/api.js` | Create | Thin async client over `/chat/start`, `/chat`, `/chat/{id}/history`, `DELETE /chat/{id}`. Exposes `ApiError` with `status` + `detail`. `API_BASE` from `import.meta.env.VITE_API_BASE`. |
| `react-export/src/storage.js` | Create | `loadSessions()`, `saveSession(convoId, sid)`, `clearSession(convoId)` over `localStorage` key `team-chat.sessions`. Dependency-injectable storage for tests. |
| `react-export/src/mappers.js` | Create | `mapHistoryToMessages(convo, history, fmtTime)` — maps `role/content` turns to the rich message shape (`user`→You, `assistant`→`convo.replier`, `system`/unknown skipped). |
| `react-export/src/data.js` | Modify | Add a `systemPrompt: string` to every entry in `INITIAL_CONVOS`. |
| `react-export/src/App.jsx` | Modify | Rewrite `send()`, add session refs + `localStorage` hydration + `errors` state + `retry`; add an inline error bubble and in-flight guard to `ChatWindow`. Presentational components untouched. |
| `react-export/src/__tests__/storage.test.js` | Create | Unit tests for `storage.js`. |
| `react-export/src/__tests__/mappers.test.js` | Create | Unit tests for `mappers.js`. |
| `react-export/src/__tests__/api.test.js` | Create | Unit tests for `api.js` (mocked `fetch`). |
| `react-export/src/__tests__/data.test.js` | Create | Guard test: every convo has a non-empty `systemPrompt`. |
| `react-export/package.json` | Modify | Add `test` script + `vitest` devDependency. |
| `react-export/.env.example` | Create | Document `VITE_API_BASE=http://127.0.0.1:8000`. |
| `react-export/CLAUDE.md` | Modify | Replace the "Simulated reply loop" section with the real-integration description; document `VITE_API_BASE` and `npm test`. |

---

### Task 1: Test infrastructure + env config

**Files:**
- Modify: `react-export/package.json`
- Create: `react-export/.env.example`

**Interfaces:**
- Produces: a `npm test` command that runs `vitest` over `src/**/*.test.js` in the node environment. Later tasks rely on this to run unit tests.

- [ ] **Step 1: Install vitest as a devDependency**

Run from `react-export/`:
```bash
npm install -D vitest
```
Expected: `vitest` added under `devDependencies` in `package.json`; `package-lock.json` updated.

- [ ] **Step 2: Add the `test` script to `package.json`**

Edit `react-export/package.json` — replace the `scripts` block:

```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
```

- [ ] **Step 3: Create `.env.example`**

Create `react-export/.env.example`:
```
# FastAPI chat backend base URL. Defaults to http://127.0.0.1:8000 if unset.
VITE_API_BASE=http://127.0.0.1:8000
```

- [ ] **Step 4: Verify vitest runs (no tests yet)**

Run from `react-export/`:
```bash
npm test
```
Expected: vitest starts, reports "No test files found" (or zero tests) and exits with a passing/neutral status. If it errors on config, confirm `vite.config.js` still has `plugins: [react()]` and nothing else — vitest reuses it.

- [ ] **Step 5: Commit**

```bash
git add react-export/package.json react-export/package-lock.json react-export/.env.example
git commit -m "chore: add vitest + test script and env example for backend integration

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: Session-id persistence (`storage.js`)

**Files:**
- Create: `react-export/src/storage.js`
- Create: `react-export/src/__tests__/storage.test.js`

**Interfaces:**
- Produces: `loadSessions(storage?) -> Record<string,string>`, `saveSession(convoId, sessionId, storage?) -> void`, `clearSession(convoId, storage?) -> void`. All accept an optional `storage` object (defaults to `globalThis.localStorage`) so tests inject a fake. Persists under key `team-chat.sessions` as JSON `{convoId: sessionId}`.

- [ ] **Step 1: Write the failing tests**

Create `react-export/src/__tests__/storage.test.js`:
```js
import { describe, it, expect, beforeEach } from 'vitest';
import { loadSessions, saveSession, clearSession } from '../storage.js';

function makeStorage() {
  const store = {};
  return {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  };
}

describe('storage', () => {
  let s;
  beforeEach(() => { s = makeStorage(); });

  it('loadSessions returns {} when empty', () => {
    expect(loadSessions(s)).toEqual({});
  });

  it('saveSession then loadSessions round-trips', () => {
    saveSession('maya', 'sid-1', s);
    expect(loadSessions(s)).toEqual({ maya: 'sid-1' });
  });

  it('saveSession preserves other entries', () => {
    saveSession('maya', 'sid-1', s);
    saveSession('tom', 'sid-2', s);
    expect(loadSessions(s)).toEqual({ maya: 'sid-1', tom: 'sid-2' });
  });

  it('clearSession removes only the given convo', () => {
    saveSession('maya', 'sid-1', s);
    saveSession('tom', 'sid-2', s);
    clearSession('maya', s);
    expect(loadSessions(s)).toEqual({ tom: 'sid-2' });
  });

  it('loadSessions tolerates corrupt JSON', () => {
    s.setItem('team-chat.sessions', '{not json');
    expect(loadSessions(s)).toEqual({});
  });

  it('no-ops when storage is undefined', () => {
    expect(() => { saveSession('maya', 'x', undefined); clearSession('maya', undefined); }).not.toThrow();
    expect(loadSessions(undefined)).toEqual({});
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run from `react-export/`:
```bash
npm test
```
Expected: FAIL — `Failed to resolve import "../storage.js"` (module does not exist yet).

- [ ] **Step 3: Write the implementation**

Create `react-export/src/storage.js`:
```js
const KEY = 'team-chat.sessions'; // convoId -> sessionId

export function loadSessions(storage = globalThis.localStorage) {
  if (!storage) return {};
  try {
    const raw = storage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSession(convoId, sessionId, storage = globalThis.localStorage) {
  if (!storage) return;
  const all = loadSessions(storage);
  all[convoId] = sessionId;
  storage.setItem(KEY, JSON.stringify(all));
}

export function clearSession(convoId, storage = globalThis.localStorage) {
  if (!storage) return;
  const all = loadSessions(storage);
  delete all[convoId];
  storage.setItem(KEY, JSON.stringify(all));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run from `react-export/`:
```bash
npm test
```
Expected: PASS — all 6 `storage` tests green.

- [ ] **Step 5: Commit**

```bash
git add react-export/src/storage.js react-export/src/__tests__/storage.test.js
git commit -m "feat: add localStorage-backed session id persistence

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: History mapper (`mappers.js`)

**Files:**
- Create: `react-export/src/mappers.js`
- Create: `react-export/src/__tests__/mappers.test.js`

**Interfaces:**
- Consumes: `PALETTE` from `./data.js` (for the "You" color).
- Produces: `mapHistoryToMessages(convo, history, fmtTime?) -> array` where each item is `{ from, initials, color, me, time, text }`. `role:"user"` → `{ from:'You', initials:'AR', color:PALETTE.me, me:true, text }`; `role:"assistant"` → `{ ...convo.replier, me:false, text }` (`convo.replier` is `{ from, initials, color }`); `role:"system"` and unknown roles are skipped. `fmtTime(turn)` defaults to a locale-time string.

- [ ] **Step 1: Write the failing tests**

Create `react-export/src/__tests__/mappers.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { mapHistoryToMessages } from '../mappers.js';
import { PALETTE } from '../data.js';

const convo = {
  id: 'maya',
  replier: { from: 'Maya Chen', initials: 'MC', color: PALETTE.maya },
};
const fmtTime = () => 'NOW';

describe('mapHistoryToMessages', () => {
  it('maps user role to a "me" message from You', () => {
    const out = mapHistoryToMessages(convo, [{ role: 'user', content: 'hi' }], fmtTime);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ from: 'You', initials: 'AR', color: PALETTE.me, me: true, text: 'hi', time: 'NOW' });
  });

  it('maps assistant role to the convo replier persona', () => {
    const out = mapHistoryToMessages(convo, [{ role: 'assistant', content: 'hello!' }], fmtTime);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ from: 'Maya Chen', initials: 'MC', color: PALETTE.maya, me: false, text: 'hello!', time: 'NOW' });
  });

  it('skips system role', () => {
    const out = mapHistoryToMessages(convo, [
      { role: 'system', content: 'You are Maya' },
      { role: 'user', content: 'hi' },
    ], fmtTime);
    expect(out).toHaveLength(1);
    expect(out[0].me).toBe(true);
  });

  it('preserves order across a multi-turn history', () => {
    const out = mapHistoryToMessages(convo, [
      { role: 'user', content: 'a' },
      { role: 'assistant', content: 'b' },
      { role: 'user', content: 'c' },
    ], fmtTime);
    expect(out.map((m) => m.text)).toEqual(['a', 'b', 'c']);
    expect(out.map((m) => m.me)).toEqual([true, false, true]);
  });

  it('ignores unknown roles', () => {
    const out = mapHistoryToMessages(convo, [{ role: 'tool', content: 'x' }], fmtTime);
    expect(out).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run from `react-export/`:
```bash
npm test
```
Expected: FAIL — `Failed to resolve import "../mappers.js"`.

- [ ] **Step 3: Write the implementation**

Create `react-export/src/mappers.js`:
```js
import { PALETTE } from './data.js';

// Map server role/content history into the rich message shape App.jsx renders.
// role:"user"      -> a "me" message from "You"
// role:"assistant" -> a message from the convo's replier persona
// role:"system"    -> skipped (system prompt is not rendered)
// anything else    -> skipped
function defaultTime() {
  return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function mapHistoryToMessages(convo, history, fmtTime = defaultTime) {
  const out = [];
  for (const turn of history || []) {
    if (turn.role === 'user') {
      out.push({ from: 'You', initials: 'AR', color: PALETTE.me, me: true, time: fmtTime(turn), text: turn.content });
    } else if (turn.role === 'assistant') {
      out.push({ ...convo.replier, me: false, time: fmtTime(turn), text: turn.content });
    }
  }
  return out;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run from `react-export/`:
```bash
npm test
```
Expected: PASS — all `storage` + `mappers` tests green.

- [ ] **Step 5: Commit**

```bash
git add react-export/src/mappers.js react-export/src/__tests__/mappers.test.js
git commit -m "feat: map server role/content history to rich UI messages

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: FastAPI client (`api.js`)

**Files:**
- Create: `react-export/src/api.js`
- Create: `react-export/src/__tests__/api.test.js`

**Interfaces:**
- Produces:
  - `API_BASE: string` — `import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'`.
  - `class ApiError extends Error` with `status: number` and `detail: string`. `status === 0` means network/backend-down.
  - `startSession({ systemPrompt, model }) -> { session_id, model }` — POST `/chat/start` with `{ system_prompt, model }`.
  - `sendMessage({ sessionId, message }) -> { session_id, reply, history }` — POST `/chat`.
  - `getHistory(sessionId) -> { session_id, history }` — GET `/chat/{id}/history`.
  - `deleteSession(sessionId) -> { status, session_id }` — DELETE `/chat/{id}`.

- [ ] **Step 1: Write the failing tests**

Create `react-export/src/__tests__/api.test.js`:
```js
import { describe, it, expect, vi, afterEach } from 'vitest';
import { startSession, sendMessage, getHistory, deleteSession, ApiError } from '../api.js';

function mockFetch(impl) {
  vi.stubGlobal('fetch', vi.fn(async (url, opts) => impl(url, opts)));
}
function jsonResp(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

describe('api client', () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it('startSession POSTs /chat/start with system_prompt and returns body', async () => {
    let captured;
    mockFetch((url, opts) => { captured = { url, opts }; return jsonResp({ session_id: 'sid', model: 'glm-5.2:cloud' }); });
    const res = await startSession({ systemPrompt: 'You are Maya' });
    expect(res).toEqual({ session_id: 'sid', model: 'glm-5.2:cloud' });
    expect(captured.opts.method).toBe('POST');
    expect(captured.url).toMatch(/\/chat\/start$/);
    expect(JSON.parse(captured.opts.body)).toEqual({ system_prompt: 'You are Maya', model: undefined });
  });

  it('sendMessage POSTs /chat with session_id and message', async () => {
    let captured;
    mockFetch((url, opts) => { captured = { url, opts }; return jsonResp({ session_id: 'sid', reply: 'hi', history: [] }); });
    const res = await sendMessage({ sessionId: 'sid', message: 'hello' });
    expect(res.reply).toBe('hi');
    expect(JSON.parse(captured.opts.body)).toEqual({ session_id: 'sid', message: 'hello' });
    expect(captured.opts.method).toBe('POST');
  });

  it('getHistory GETs /chat/{id}/history', async () => {
    let captured;
    mockFetch((url) => { captured = { url }; return jsonResp({ session_id: 'sid', history: [] }); });
    await getHistory('sid');
    expect(captured.url).toMatch(/\/chat\/sid\/history$/);
  });

  it('deleteSession DELETEs /chat/{id}', async () => {
    let captured;
    mockFetch((url, opts) => { captured = { url, opts }; return jsonResp({ status: 'deleted', session_id: 'sid' }); });
    await deleteSession('sid');
    expect(captured.opts.method).toBe('DELETE');
    expect(captured.url).toMatch(/\/chat\/sid$/);
  });

  it('throws ApiError with detail on non-2xx', async () => {
    mockFetch(() => jsonResp({ detail: 'Unknown session_id.' }, 404));
    await expect(getHistory('sid')).rejects.toBeInstanceOf(ApiError);
    await expect(getHistory('sid')).rejects.toMatchObject({ status: 404, detail: 'Unknown session_id.' });
  });

  it('falls back to generic detail when body has no detail', async () => {
    mockFetch(() => jsonResp({ something: 'else' }, 502));
    await expect(getHistory('sid')).rejects.toMatchObject({ status: 502 });
  });

  it('throws ApiError status 0 on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch'); }));
    await expect(getHistory('sid')).rejects.toMatchObject({ status: 0 });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run from `react-export/`:
```bash
npm test
```
Expected: FAIL — `Failed to resolve import "../api.js"`.

- [ ] **Step 3: Write the implementation**

Create `react-export/src/api.js`:
```js
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export class ApiError extends Error {
  constructor(status, detail) {
    super(detail || `API error ${status}`);
    this.status = status;
    this.detail = detail || `API error ${status}`;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let resp;
  try {
    resp = await fetch(`${API_BASE}${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // network failure / backend down -> status 0
    throw new ApiError(0, "Can't reach the chat service.");
  }
  if (!resp.ok) {
    let detail = `API error ${resp.status}`;
    try {
      const data = await resp.json();
      if (data && data.detail) detail = data.detail;
    } catch {
      // non-JSON error body; keep generic detail
    }
    throw new ApiError(resp.status, detail);
  }
  return resp.json();
}

export async function startSession({ systemPrompt, model } = {}) {
  return request('/chat/start', {
    method: 'POST',
    body: { system_prompt: systemPrompt ?? null, model: model ?? undefined },
  });
}

export async function sendMessage({ sessionId, message }) {
  return request('/chat', { method: 'POST', body: { session_id: sessionId, message } });
}

export async function getHistory(sessionId) {
  return request(`/chat/${encodeURIComponent(sessionId)}/history`);
}

export async function deleteSession(sessionId) {
  return request(`/chat/${encodeURIComponent(sessionId)}`, { method: 'DELETE' });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run from `react-export/`:
```bash
npm test
```
Expected: PASS — all `storage` + `mappers` + `api` tests green (18 tests).

- [ ] **Step 5: Commit**

```bash
git add react-export/src/api.js react-export/src/__tests__/api.test.js
git commit -m "feat: add FastAPI chat client with typed errors

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: Per-convo personas in `data.js`

**Files:**
- Modify: `react-export/src/data.js`
- Create: `react-export/src/__tests__/data.test.js`

**Interfaces:**
- Produces: every entry in `INITIAL_CONVOS` has a non-empty `systemPrompt: string` used by `App.ensureSession` in Task 6.

- [ ] **Step 1: Write the failing test**

Create `react-export/src/__tests__/data.test.js`:
```js
import { describe, it, expect } from 'vitest';
import { INITIAL_CONVOS } from '../data.js';

describe('INITIAL_CONVOS personas', () => {
  it('every conversation has a non-empty systemPrompt', () => {
    const missing = INITIAL_CONVOS.filter((c) => !c.systemPrompt || !c.systemPrompt.trim());
    expect(missing.map((c) => c.id)).toEqual([]);
  });

  it('has at least one channel and one dm with a systemPrompt', () => {
    const kinds = INITIAL_CONVOS.filter((c) => c.systemPrompt).map((c) => c.kind);
    expect(kinds).toContain('channel');
    expect(kinds).toContain('dm');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run from `react-export/`:
```bash
npm test
```
Expected: FAIL — `every conversation has a non-empty systemPrompt` fails (no `systemPrompt` fields yet).

- [ ] **Step 3: Add `systemPrompt` to each convo**

Edit `react-export/src/data.js`. Add a `systemPrompt` field to each of the 7 entries in `INITIAL_CONVOS`, right after the `meta`/`time` line. The exact lines to insert (one per convo, after the existing `meta: ...` line within each object):

For the `launch` convo (after `meta: '8 members · 3 online', time: '10:05',`):
```js
    systemPrompt: 'You are Maya Chen, design lead on the #launch-q3 beta launch channel. You are coordinating the team in a group chat. Reply briefly and practically, in character as Maya, addressing Alex by name when natural.',
```

For the `maya` convo (after `meta: 'Online · Design lead', time: '9:48',`):
```js
    systemPrompt: 'You are Maya Chen, a design lead messaging Alex (a product designer) in a quick DM. Reply briefly and warmly, in character as Maya.',
```

For the `crit` convo (after `meta: '14 members · 5 online', time: 'Yesterday',`):
```js
    systemPrompt: 'You are Dana Wolfe, a senior designer in the #design-crit channel. Give concise, constructive design feedback in character as Dana.',
```

For the `priya` convo (after `meta: 'Online · Platform eng', time: 'Yesterday',`):
```js
    systemPrompt: 'You are Priya Nair, a platform engineer messaging Alex in a DM. Reply briefly and technically, in character as Priya.',
```

For the `standup` convo (after `meta: '11 members', time: 'Yesterday',`):
```js
    systemPrompt: 'You are Priya Nair posting standup notes in the #eng-standup channel. Reply briefly and in character as Priya.',
```

For the `tom` convo (after `meta: 'Away · Backend', time: 'Tue',`):
```js
    systemPrompt: 'You are Tom Okafor, a backend engineer messaging Alex in a DM. Reply briefly and in character as Tom.',
```

For the `random` convo (after `meta: '23 members', time: 'Tue',`):
```js
    systemPrompt: 'You are Dana Wolfe in the #random channel. Keep replies light and brief, in character as Dana.',
```

- [ ] **Step 4: Run test to verify it passes**

Run from `react-export/`:
```bash
npm test
```
Expected: PASS — all tests green, including the two `INITIAL_CONVOS personas` tests.

- [ ] **Step 5: Commit**

```bash
git add react-export/src/data.js react-export/src/__tests__/data.test.js
git commit -m "feat: add per-convo AI personas as system prompts

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: Wire `App.jsx` to the backend (happy path + hydration)

This is the core integration task. It rewrites `send()` to call the backend, adds session management and `localStorage` hydration on mount. The next task adds error handling/retry.

**Files:**
- Modify: `react-export/src/App.jsx` (imports, `App` component state/refs/helpers, `send`, hydration effect, `ChatWindow` usage)

**Interfaces:**
- Consumes: `startSession`, `sendMessage`, `getHistory` from `./api.js`; `loadSessions`, `saveSession` from `./storage.js`; `mapHistoryToMessages` from `./mappers.js`; `convo.systemPrompt` from `./data.js`.
- Produces: `App.send(text, convoId = activeId)` is now async and calls the backend; `App` hydrates server history for stored sessions on mount.

- [ ] **Step 1: Update imports at the top of `App.jsx`**

Replace lines 1-6 of `react-export/src/App.jsx`:
```js
import { useEffect, useRef, useState } from 'react';
import { THEMES, INITIAL_CONVOS } from './data.js';
import {
  IconHome, IconChat, IconSettings, IconPlus, IconSearch,
  IconPhone, IconVideo, IconInfo, IconAttach, IconSend,
} from './icons.jsx';
```
with:
```js
import { useEffect, useRef, useState } from 'react';
import { THEMES, INITIAL_CONVOS } from './data.js';
import {
  IconHome, IconChat, IconSettings, IconPlus, IconSearch,
  IconPhone, IconVideo, IconInfo, IconAttach, IconSend,
} from './icons.jsx';
import { startSession, sendMessage, getHistory } from './api.js';
import { loadSessions, saveSession } from './storage.js';
import { mapHistoryToMessages } from './mappers.js';
```

- [ ] **Step 2: Replace the `App` state/refs section**

In `react-export/src/App.jsx`, find this block inside `export default function App(...)`:
```js
  const [typingIn, setTypingIn] = useState(null);
  const [convos, setConvos] = useState(INITIAL_CONVOS);
  const timers = useRef({});
  const replyCount = useRef(0);
```
Replace it with:
```js
  const [typingIn, setTypingIn] = useState(null);
  const [convos, setConvos] = useState(INITIAL_CONVOS);
  const sessions = useRef(loadSessions()); // convoId -> sessionId
  const inflight = useRef(new Set());       // convoIds with a request in flight
```

- [ ] **Step 3: Add `ensureSession` helper and replace `send`**

In `react-export/src/App.jsx`, find the existing `select` and `send` functions:
```js
  const select = (id) => {
    setNav('chats');
    setActiveId(id);
    setConvos((cs) => cs.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const send = (text) => {
    const id = activeId;
    const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    setConvos((cs) =>
      cs.map((c) =>
        c.id === id
          ? { ...c, time: 'Now', messages: [...c.messages, { from: 'You', initials: 'AR', color: '#3B6FE0', time, me: true, text }] }
          : c
      )
    );
    clearTimeout(timers.current.typing);
    clearTimeout(timers.current.reply);
    timers.current.typing = setTimeout(() => setTypingIn(id), 900);
    timers.current.reply = setTimeout(() => {
      setConvos((cs) =>
        cs.map((c) => {
          if (c.id !== id) return c;
          const reply = c.replies[replyCount.current++ % c.replies.length];
          const t2 = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
          return { ...c, time: 'Now', messages: [...c.messages, { ...c.replier, time: t2, text: reply }] };
        })
      );
      setTypingIn(null);
    }, 2600);
  };

  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), []);
```
Replace the whole block with:
```js
  const select = (id) => {
    setNav('chats');
    setActiveId(id);
    setConvos((cs) => cs.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const ensureSession = async (convoId) => {
    if (sessions.current[convoId]) return sessions.current[convoId];
    const convo = convos.find((c) => c.id === convoId);
    const { session_id } = await startSession({ systemPrompt: convo?.systemPrompt });
    sessions.current[convoId] = session_id;
    saveSession(convoId, session_id);
    return session_id;
  };

  const send = async (text, convoId = activeId) => {
    if (inflight.current.has(convoId)) return; // prevent double-send per convo
    const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    // optimistic append of the user's message
    setConvos((cs) =>
      cs.map((c) =>
        c.id === convoId
          ? { ...c, time: 'Now', messages: [...c.messages, { from: 'You', initials: 'AR', color: '#3B6FE0', time, me: true, text }] }
          : c
      )
    );
    inflight.current.add(convoId);
    setTypingIn(convoId);

    try {
      const sid = await ensureSession(convoId);
      const { reply } = await sendMessage({ sessionId: sid, message: text });
      const t2 = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      setConvos((cs) =>
        cs.map((c) =>
          c.id === convoId
            ? { ...c, time: 'Now', messages: [...c.messages, { ...c.replier, time: t2, me: false, text: reply }] }
            : c
        )
      );
    } finally {
      inflight.current.delete(convoId);
      setTypingIn((cur) => (cur === convoId ? null : cur));
    }
  };

  // On mount, hydrate server history for any convo with a stored session id,
  // appending the mapped turns after the static seed messages. Runs once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = loadSessions();
      for (const convoId of Object.keys(stored)) {
        try {
          const { history } = await getHistory(stored[convoId]);
          if (cancelled) return;
          const convo = INITIAL_CONVOS.find((c) => c.id === convoId);
          if (!convo) continue;
          const mapped = mapHistoryToMessages(convo, history);
          if (!mapped.length) continue;
          setConvos((cs) => cs.map((c) => (c.id === convoId ? { ...c, messages: [...c.messages, ...mapped] } : c)));
        } catch {
          // session may be gone on the server; hydration is best-effort.
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);
```

Note: the `try/finally` without a `catch` here is intentional — error handling (including the `ApiError` cases and retry) is added in Task 7. For this task, a failed request simply clears the typing indicator and leaves the optimistic user message in place; verify the happy path works first. (The Vite dev build tolerates `try/finally`; if a linter were configured it might warn — none is.)

- [ ] **Step 4: Verify the dev build still compiles**

Run from `react-export/`:
```bash
npm run build
```
Expected: build succeeds with no errors. (This catches syntax/import mistakes before manual testing.)

- [ ] **Step 5: Manual end-to-end verification (happy path + persistence)**

Start the backend (in a separate terminal, from `api/`):
```bash
uvicorn main:app --port 8000
```
Start the frontend (from `react-export/`):
```bash
npm run dev
```
Open the printed localhost URL, then:
1. **DM happy path:** click the **Maya Chen** DM. Type "Hey Maya, can you review the empty states today?" and press Enter.
   - Expected: your message appears immediately (right-aligned, accent bubble). The header preview shows "typing…". After the model responds (a few seconds), a reply appears in the thread attributed to **Maya Chen** (left-aligned, bubble), and "typing…" clears.
2. **Channel happy path:** click **#launch-q3**, send "Who owns the rollout announcement?"
   - Expected: same flow; the reply is attributed to that channel's `replier` persona (Maya Chen).
3. **Session persistence:** refresh the page (F5). Open the same DM again.
   - Expected: the messages you exchanged before the refresh are still visible (rehydrated from `/chat/{id}/history`, appended after the static seed messages).
4. **Session continuity:** in that DM, send "What did I just ask you about?"
   - Expected: the reply references the prior turn (the server-side history carried over via the persisted `session_id`).
5. **localStorage check:** open DevTools → Application → Local Storage → the site. Confirm a `team-chat.sessions` key exists whose JSON value maps the two convo ids to session ids.

- [ ] **Step 6: Commit**

```bash
git add react-export/src/App.jsx
git commit -m "feat: wire send() to FastAPI with lazy sessions and history hydration

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: Error handling, retry, and in-flight guard

**Files:**
- Modify: `react-export/src/App.jsx` (imports add `ApiError` + `clearSession`; `send` gets a `catch`; add `errors` state + `retry`; `ChatWindow` gets an error bubble + disabled send while in-flight)

**Interfaces:**
- Consumes: `ApiError` from `./api.js`; `clearSession` from `./storage.js`.
- Produces: `App` exposes `errors` state (`Record<convoId, { message, payload, isDown }>`), `retry(convoId)`. `ChatWindow` accepts `error` and `onRetry` props and disables its send button (and Enter-to-send) while `typing` is true for the active convo.

- [ ] **Step 1: Add `ApiError` and `clearSession` to the imports**

In `react-export/src/App.jsx`, replace the three integration import lines added in Task 6:
```js
import { startSession, sendMessage, getHistory } from './api.js';
import { loadSessions, saveSession } from './storage.js';
import { mapHistoryToMessages } from './mappers.js';
```
with:
```js
import { startSession, sendMessage, getHistory, ApiError } from './api.js';
import { loadSessions, saveSession, clearSession } from './storage.js';
import { mapHistoryToMessages } from './mappers.js';
```

- [ ] **Step 2: Add `errors` state**

In `react-export/src/App.jsx`, find:
```js
  const sessions = useRef(loadSessions()); // convoId -> sessionId
  const inflight = useRef(new Set());       // convoIds with a request in flight
```
Replace with:
```js
  const sessions = useRef(loadSessions()); // convoId -> sessionId
  const inflight = useRef(new Set());       // convoIds with a request in flight
  const [errors, setErrors] = useState({}); // convoId -> { message, payload, isDown }
```

- [ ] **Step 3: Add error handling to `send` and a `retry` helper**

In `react-export/src/App.jsx`, find the `send` function added in Task 6:
```js
  const send = async (text, convoId = activeId) => {
    if (inflight.current.has(convoId)) return; // prevent double-send per convo
    const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    // optimistic append of the user's message
    setConvos((cs) =>
      cs.map((c) =>
        c.id === convoId
          ? { ...c, time: 'Now', messages: [...c.messages, { from: 'You', initials: 'AR', color: '#3B6FE0', time, me: true, text }] }
          : c
      )
    );
    inflight.current.add(convoId);
    setTypingIn(convoId);

    try {
      const sid = await ensureSession(convoId);
      const { reply } = await sendMessage({ sessionId: sid, message: text });
      const t2 = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      setConvos((cs) =>
        cs.map((c) =>
          c.id === convoId
            ? { ...c, time: 'Now', messages: [...c.messages, { ...c.replier, time: t2, me: false, text: reply }] }
            : c
        )
      );
    } finally {
      inflight.current.delete(convoId);
      setTypingIn((cur) => (cur === convoId ? null : cur));
    }
  };
```
Replace it with:
```js
  const send = async (text, convoId = activeId) => {
    if (inflight.current.has(convoId)) return; // prevent double-send per convo
    const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    // optimistic append of the user's message; clear any prior error for this convo
    setErrors((es) => { const next = { ...es }; delete next[convoId]; return next; });
    setConvos((cs) =>
      cs.map((c) =>
        c.id === convoId
          ? { ...c, time: 'Now', messages: [...c.messages, { from: 'You', initials: 'AR', color: '#3B6FE0', time, me: true, text }] }
          : c
      )
    );
    inflight.current.add(convoId);
    setTypingIn(convoId);

    try {
      const sid = await ensureSession(convoId);
      const { reply } = await sendMessage({ sessionId: sid, message: text });
      const t2 = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      setConvos((cs) =>
        cs.map((c) =>
          c.id === convoId
            ? { ...c, time: 'Now', messages: [...c.messages, { ...c.replier, time: t2, me: false, text: reply }] }
            : c
        )
      );
    } catch (e) {
      const err = e instanceof ApiError ? e : new ApiError(0, 'Unexpected error.');
      if (err.status === 404) {
        // session unknown to server: forget it so the next send starts a fresh session
        clearSession(convoId);
        delete sessions.current[convoId];
      }
      setErrors((es) => ({ ...es, [convoId]: { message: err.detail, payload: text, isDown: err.status === 0 } }));
    } finally {
      inflight.current.delete(convoId);
      setTypingIn((cur) => (cur === convoId ? null : cur));
    }
  };

  const retry = (convoId) => {
    const rec = errors[convoId];
    if (!rec || inflight.current.has(convoId)) return;
    send(rec.payload, convoId);
  };
```

- [ ] **Step 4: Pass `error` and `onRetry` to `ChatWindow`**

In `react-export/src/App.jsx`, find the `<ChatWindow ... />` usage near the bottom of `App`'s return:
```jsx
          <ChatWindow convo={active} typing={typingIn === activeId} onSend={send} />
```
Replace it with:
```jsx
          <ChatWindow
            convo={active}
            typing={typingIn === activeId}
            error={errors[activeId] || null}
            onSend={send}
            onRetry={retry}
          />
```

- [ ] **Step 5: Add the error bubble and in-flight guard to `ChatWindow`**

In `react-export/src/App.jsx`, find the `ChatWindow` signature:
```jsx
function ChatWindow({ convo, typing, onSend }) {
```
Replace it with:
```jsx
function ChatWindow({ convo, typing, error, onSend, onRetry }) {
```

Then find the `<footer>` of `ChatWindow`:
```jsx
      <footer style={{ flexShrink: 0, padding: '12px 20px 18px' }}>
        <div
          style={{
            display: 'flex', alignItems: 'flex-end', gap: 8, padding: '8px 8px 8px 14px',
            background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16,
          }}
        >
          <button
            title="Attach"
            style={{
              width: 34, height: 34, flexShrink: 0, border: 'none', borderRadius: 9,
              background: 'transparent', color: 'var(--sub)', cursor: 'pointer',
              display: 'grid', placeItems: 'center',
            }}
          >
            <IconAttach />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={`Message ${convo.name}`}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14.5, color: 'var(--text)', padding: '8px 0' }}
          />
          <button
            onClick={send}
            title="Send"
            style={{
              width: 36, height: 36, flexShrink: 0, border: 'none', borderRadius: 11,
              background: canSend ? 'var(--accent)' : 'var(--panel2)',
              color: canSend ? 'var(--on-accent)' : 'var(--sub)',
              cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'background .15s',
            }}
          >
            <IconSend />
          </button>
        </div>
      </footer>
```
Replace the whole `<footer>...</footer>` with:
```jsx
      <footer style={{ flexShrink: 0, padding: '12px 20px 18px' }}>
        {error && (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8,
              padding: '10px 14px', background: 'var(--panel2)', border: '1px solid var(--border)',
              borderRadius: 12, color: 'var(--sub)', fontSize: 13,
            }}
          >
            <span style={{ flex: 1, minWidth: 0 }}>
              {error.isDown ? "Can't reach the chat service." : error.message}
            </span>
            <button
              onClick={() => onRetry(convo.id)}
              style={{
                flexShrink: 0, padding: '5px 12px', borderRadius: 999,
                border: '1px solid var(--accent)', background: 'transparent',
                color: 'var(--accent)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}
        <div
          style={{
            display: 'flex', alignItems: 'flex-end', gap: 8, padding: '8px 8px 8px 14px',
            background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16,
          }}
        >
          <button
            title="Attach"
            style={{
              width: 34, height: 34, flexShrink: 0, border: 'none', borderRadius: 9,
              background: 'transparent', color: 'var(--sub)', cursor: 'pointer',
              display: 'grid', placeItems: 'center',
            }}
          >
            <IconAttach />
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !typing) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={`Message ${convo.name}`}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 14.5, color: 'var(--text)', padding: '8px 0' }}
          />
          <button
            onClick={send}
            title="Send"
            disabled={typing || !canSend}
            style={{
              width: 36, height: 36, flexShrink: 0, border: 'none', borderRadius: 11,
              background: canSend && !typing ? 'var(--accent)' : 'var(--panel2)',
              color: canSend && !typing ? 'var(--on-accent)' : 'var(--sub)',
              cursor: 'pointer', display: 'grid', placeItems: 'center', transition: 'background .15s',
            }}
          >
            <IconSend />
          </button>
        </div>
      </footer>
```

- [ ] **Step 6: Verify the build and unit tests still pass**

Run from `react-export/`:
```bash
npm run build && npm test
```
Expected: build succeeds; all unit tests still green (no behavioral change to the pure modules).

- [ ] **Step 7: Manual end-to-end verification (errors + retry + stale session)**

Backend running on :8000, frontend via `npm run dev`:
1. **Backend down:** stop the backend (Ctrl+C in its terminal). In the Maya DM, send "test".
   - Expected: the typing indicator shows briefly, then clears. An inline error row appears above the composer: "Can't reach the chat service." with a **Retry** button. No fake reply. The send button is disabled while the request was in flight; afterwards it re-enables.
2. **Retry after recovery:** restart the backend (`uvicorn main:app --port 8000`). Click **Retry**.
   - Expected: the message is delivered; a persona reply appears; the error row disappears.
3. **Stale session (404 → fresh restart):** with the backend running, send a message in a DM to establish a session, then **restart the backend** (this wipes its in-memory sessions). In the same DM, send another message.
   - Expected: a 404 occurs; an error row appears with the server detail (e.g. "Unknown session_id."). Click **Retry** (or send again).
   - Expected: a fresh `/chat/start` creates a new session and the message delivers. In DevTools → Local Storage, the `team-chat.sessions` value for that convo has changed to a new session id.
4. **Cross-convo independence:** while a request is in flight in the Maya DM (typing shown), switch to **#launch-q3** and send a message.
   - Expected: the channel send proceeds immediately; the in-flight guard only blocked the Maya convo, not the channel. (The Maya request continues and its reply lands normally.)

- [ ] **Step 8: Commit**

```bash
git add react-export/src/App.jsx
git commit -m "feat: inline error bubbles, retry, and per-convo in-flight guard

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: Update docs and run final verification

**Files:**
- Modify: `react-export/CLAUDE.md`

- [ ] **Step 1: Replace the "Simulated reply loop" section in `CLAUDE.md`**

In `react-export/CLAUDE.md`, find the section:

```
### Simulated reply loop (the main piece to remove for real integration)

`App.send(text)` in `App.jsx` is the mock backend. On send it: appends the user's message, then after a 900ms `setTimeout` shows a typing indicator, then after 2600ms appends a canned reply drawn from `convo.replies` (cycled via a `replyCount` ref) and clears typing. Timer handles are tracked in a `useRef` and cleared on unmount. When connecting real data/WebSocket, replace `send()`'s timer logic and drop the `typingIn` simulation.
```

Replace it with:

```
### Backend integration (FastAPI + Ollama)

`App.send(text, convoId)` in `App.jsx` is async and calls the FastAPI/Ollama backend. On send it: optimistically appends the user's message, calls `ensureSession(convoId)` (which calls `POST /chat/start` with the convo's `systemPrompt` on first use and persists the `session_id` in `localStorage`), shows the typing indicator while the request is in flight, then `POST /chat/{sid}` and appends the LLM reply attributed to `convo.replier`. On mount, stored sessions are hydrated from `GET /chat/{sid}/history` via `mapHistoryToMessages`.

Each conversation is its own LLM session; the per-convo `systemPrompt` (in `data.js`) makes the coworker an AI persona. Seed `messages` in `data.js` are local UI decoration only — they are NOT sent to the LLM.

- `src/api.js` — async client over `/chat/start`, `/chat`, `/chat/{id}/history`, `DELETE /chat/{id}`; exports `ApiError` (`status` 0 = network/down, 404 = unknown session, 502 = Ollama upstream). `API_BASE` from `VITE_API_BASE` (default `http://127.0.0.1:8000`).
- `src/storage.js` — `localStorage` persistence of per-convo `session_id`s (key `team-chat.sessions`).
- `src/mappers.js` — `mapHistoryToMessages(convo, history)` maps `role/content` to the rich UI message shape.

Errors surface as an inline bubble above the composer with a Retry button; a 404 clears the stale session so the next send starts fresh. The send button and Enter-to-send are disabled while a request for the active convo is in flight.

Run `npm test` (vitest) for unit tests of `api.js`, `mappers.js`, `storage.js`, and the `data.js` persona guard.
```

- [ ] **Step 2: Update the Commands section in `CLAUDE.md`**

In `react-export/CLAUDE.md`, find:

```
There are no `test` or `lint` scripts. `node_modules` is present (deps already installed).
```

Replace with:

```
There is no `lint` script. `npm test` runs vitest (unit tests for the API client, history mapper, session storage, and data-layer persona guard). `node_modules` is present (deps already installed).
```

- [ ] **Step 3: Commit the docs**

```bash
git add react-export/CLAUDE.md
git commit -m "docs: document FastAPI integration in CLAUDE.md

Co-Authored-By: Claude <noreply@anthropic.com>"
```

- [ ] **Step 4: Final full verification pass**

Run from `react-export/`:
```bash
npm test && npm run build
```
Expected: all unit tests pass; production build succeeds.

Then with the backend on :8000 and frontend on `npm run dev`, run the complete manual checklist:
1. Send in a DM → persona reply appears after typing indicator.
2. Send in a channel → reply attributed to that channel's `replier`.
3. Refresh → history rehydrates; next message shows session continuity.
4. Backend down → inline "Can't reach the chat service." error + Retry; recovery → delivers.
5. Restart backend (wipe sessions) → 404 error; Retry → fresh session, `localStorage` id updated.
6. In-flight in one convo does not block sending in another.
7. DevTools Local Storage shows `team-chat.sessions` mapping convo ids → session ids.

- [ ] **Step 5: Final commit if any fixups were needed**

Only if Step 4 surfaced a fix:
```bash
git add -A
git commit -m "fix: final verification adjustments

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Self-Review Notes

- **Spec coverage:** Conceptual mapping (each convo = AI session, personas via system_prompt) → Tasks 5 + 6. Non-streaming → Global Constraints + Task 6 (no streaming code). Lazy + persist sessions → Task 2 (storage) + Task 6 (`ensureSession` + hydration). Frontend rich local state / backend role-content split → Task 3 (mapper) + Task 6. Error handling / 404-restart / inline bubble + retry → Task 7. "+" left non-functional → no task (intentionally out of scope). Backend untouched → Global Constraints. Verification checklist → Task 8 Step 4. Out-of-scope items (streaming, auth, users, channels, WebSocket, send seeds to LLM, "+", editing/deletion) → none implemented, as specified.
- **Placeholders:** none — every code step contains full source.
- **Type consistency:** `send(text, convoId = activeId)` signature consistent across Task 6, Task 7 (`retry` calls `send(rec.payload, convoId)`), and the `ChatWindow` `onSend={send}` wiring (called as `send()` with default). `errors` record shape `{ message, payload, isDown }` consistent between Task 7's `send` catch and the `ChatWindow` error bubble. `ApiError` fields `status`/`detail` consistent between `api.js` and the `send` catch. `mapHistoryToMessages(convo, history, fmtTime?)` signature consistent between Task 3 and Task 6 hydration. `storage.js` function names (`loadSessions`/`saveSession`/`clearSession`) consistent across Tasks 2, 6, 7.
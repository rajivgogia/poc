# CLAUDE.md

## Project Overview

React 18 + Vite chat frontend connecting to a FastAPI backend. Supports three tabs (Home, Chat, Travel) with shared theming and persistent chat backgrounds.

## Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server (Vite, hot reload)
npm run build        # production build
npm run preview      # preview production build
npm run test         # run tests once (vitest)
npm run test:watch   # run tests in watch mode
```

## Architecture

**State management:**
- `ChatContext.jsx` — all chat state via `useReducer`; exposes `createNewSession`, `sendChatMessage`, `deleteSession`, etc. via `ChatProvider`
- `TravelContext.jsx` — mirrors the same pattern for the Travel tab
- `useChat.js` — thin re-export of `useChatContext`; all components consume state through this hook
- `services/api.js` — all HTTP calls; base URL via `VITE_API_BASE` env var (defaults to `''`, same-origin)

**Key files:**
- `src/App.jsx` — root; owns `currentTheme`, `activeTab`, `chatBg` state; `chatBg` persisted to `localStorage`
- `src/data.js` — `THEMES` (5 themes) and `CHAT_BACKGROUNDS` (12 options)
- `src/icons.jsx` — all inline SVG icons as named exports
- `src/components/Chat/ChatWindow.jsx` — chat pane with wallpaper picker and theme cycler

## Theming

Colors are CSS custom properties (`--bg`, `--panel`, `--text`, `--accent`, `--bubble`, etc.) set inline on the root `<div>` in `App.jsx`. Always use `var(--token)` — never hardcode colors.

`Aurora Mesh` (default theme) has `auroraGlow: true`, which renders a decorative gradient overlay.

## Backend API

Set `VITE_API_BASE=http://localhost:8000` in `.env`.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/chat/start` | Create session → `{ session_id }` |
| `POST` | `/chat` | Send message with `{ session_id, message }` → `{ history }` |
| `GET` | `/chat/:sessionId/history` | Get history array |
| `DELETE` | `/chat/:sessionId` | Delete session (optimistic local update) |

## Session Naming

First user message becomes the session name (truncated to 50 chars), dispatched client-side via `SESSION_RENAMED` before the API call completes.

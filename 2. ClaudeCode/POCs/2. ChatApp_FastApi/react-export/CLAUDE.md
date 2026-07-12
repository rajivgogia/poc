# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server (Vite, hot reload)
npm run build        # production build
npm run preview      # preview production build locally
npm run test         # run tests once (vitest)
npm run test:watch   # run tests in watch mode
```

## Architecture

This is a React 18 + Vite chat frontend that connects to a FastAPI backend.

**Data flow:**
- `ChatContext.jsx` holds all state via `useReducer` and exposes actions (`createNewSession`, `sendChatMessage`, `deleteSession`, etc.) through `ChatProvider`
- `useChat.js` is a thin re-export of `useChatContext` — all components consume state/actions through this hook
- `services/api.js` handles all HTTP calls; the base URL is set via `VITE_API_BASE` env var (defaults to `''`, meaning same-origin)

**Key files:**
- `src/App.jsx` — root component; owns `currentTheme` state, applies CSS custom properties, renders `<Sidebar>` + `<ChatWindow>`
- `src/data.js` — `THEMES` object (four themes: `Slate (light)`, `Carbon (dark)`, `Paper (warm)`, `Bright mode`) with all color tokens
- `src/icons.jsx` — all inline SVG icons as named exports

## Theming

All colors are CSS custom properties (`--bg`, `--panel`, `--panel2`, `--border`, `--text`, `--sub`, `--accent`, `--on-accent`, `--accent-soft`, `--bubble`, `--accent-gradient`). They are set inline on the root `<div>` in `App.jsx` from the active `THEMES` entry. Components use `var(--token)` throughout — never hardcode colors.

The active theme name is passed as `currentTheme` prop to both `<Sidebar>` and `<ChatWindow>`. `ChatWindow` accepts an `onThemeChange` callback to cycle through themes from the header button.

## Backend API

Expected endpoints (FastAPI):
- `POST /chat/start` → `{ session_id }` — create a new chat session
- `POST /chat` with `{ session_id, message }` → `{ history }` — send a message and receive full updated history
- `GET /chat/:sessionId/history` → history array
- `DELETE /chat/:sessionId` — delete a session (best-effort; local state is updated optimistically)

Set `VITE_API_BASE` in a `.env` file to point at the FastAPI server (e.g. `VITE_API_BASE=http://localhost:8000`).

## Session naming

The first user message in a session is used as the session name (truncated to 50 chars). This rename is dispatched client-side via `SESSION_RENAMED` before the API call completes.

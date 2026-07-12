# Team Chat — React App

A React (Vite) implementation of the Team Chat design prototyped in this project
(`Team Chat.dc.html`). It is a 1:1 recreation: left nav rail (Home / Chats),
searchable + filterable conversation list, and a chat window with message
grouping, typing indicator, and simulated replies.

## Run it

```bash
npm install
npm run dev
```

Then open the printed localhost URL. `npm run build` produces a production build.

## Structure

- `src/App.jsx` — all UI components (Rail, HomeView, ChatList, ChatWindow) and app state
- `src/data.js` — theme tokens (`THEMES`) and seed conversation data (`INITIAL_CONVOS`)
- `src/icons.jsx` — inline SVG icons
- `src/index.css` — global reset, fonts fallback, keyframes (typing dots, message-in)

## Theming

Three themes are defined in `src/data.js`: **Slate (light)**, **Carbon (dark)**,
**Paper (warm)**. Pass one to the root component:

```jsx
<App theme="Carbon (dark)" />
```

Themes are applied as CSS custom properties (`--bg`, `--panel`, `--accent`, …)
on the root element; all components reference them via `var()`.

Set `RAIL_LABELS = false` at the top of `App.jsx` for an icon-only nav rail.

## Fonts

Space Grotesk (headings) and Public Sans (body), loaded from Google Fonts in
`index.html`. Swap for self-hosted fonts in production if needed.

## Notes for integration

- All state is local React state — wire `send`/`select` and `INITIAL_CONVOS`
  to your real backend/store.
- The simulated reply (typing indicator + canned response ~2.6s after you send)
  lives in `App.jsx` → `send()`; remove it when connecting real data.
- Minimum hit targets are 32–44px; message column max-width is 62%.
